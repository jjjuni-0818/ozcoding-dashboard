"""
data.py
=======
Loads the CMS Medicare Part D Prescriber CSV once into a pandas DataFrame,
then exposes high-level aggregation functions consumed by the FastAPI
routes in main.py.

All currency values are in USD. All "MoM%" / "daysSinceVisit" / tags are
DETERMINISTIC MOCK FIELDS derived from a hash of the NPI — there is no
time-series data in this dataset. Replace with real CRM / IMS data in
production.
"""

from __future__ import annotations

import hashlib
from functools import lru_cache
from pathlib import Path
from typing import Literal

import pandas as pd

from regions import (
    BRANDS,
    CITY_COORDS,
    city_region,
    normalize_brand,
)

# -----------------------------------------------------------------------------
# Load + clean
# -----------------------------------------------------------------------------
DATA_DIR = Path(__file__).parent / "data"
CSV_PATH = DATA_DIR / "part_d_prescriber.csv"


def _load() -> pd.DataFrame:
    df = pd.read_csv(CSV_PATH, dtype={"Prscrbr_NPI": str})
    # Filter to CA (the file is already CA-only but be defensive)
    df = df[df["Prscrbr_State_Abrvtn"] == "CA"].copy()

    # Normalize brand (collapse Cosentyx SKUs)
    df["brand"] = df["Brnd_Name"].apply(normalize_brand)

    # Region from city
    df["region"] = df["Prscrbr_City"].apply(city_region)

    # Fill numeric NAs with 0
    for col in ("Tot_Clms", "Tot_30day_Fills", "Tot_Day_Suply",
                "Tot_Drug_Cst", "Tot_Benes"):
        df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0)

    return df


DF: pd.DataFrame = _load()
print(f"[data] loaded {len(DF):,} rows · "
      f"{DF['Prscrbr_NPI'].nunique():,} unique HCPs · brands={sorted(DF['brand'].unique())}")


# -----------------------------------------------------------------------------
# Deterministic mock helpers (replace with real data later)
# -----------------------------------------------------------------------------
def _npi_unit(npi: str, salt: str) -> float:
    """Stable 0..1 from NPI + salt — replaces real-world fields we don't have."""
    h = hashlib.md5(f"{npi}|{salt}".encode()).digest()
    n = int.from_bytes(h[:4], "big")
    return (n % 10_000) / 10_000.0


def mock_mom(npi: str) -> int:
    """Mock month-over-month % change in -40..+50."""
    return int((_npi_unit(npi, "mom") - 0.45) * 90)


def mock_days_since_visit(npi: str) -> int:
    """Mock days since last sales-rep visit in 1..180."""
    return int(_npi_unit(npi, "visit") * 180) + 1


def mock_potential(npi: str) -> int:
    """Mock 'territory potential' score 0..99."""
    return int(_npi_unit(npi, "pot") * 100)


def tag_for(cost: float, mom: int, days_since_visit: int, potential: int) -> str | None:
    if mom > 25 and cost > 5000:
        return "rising"
    if mom < -20 and cost > 5000:
        return "declining"
    if days_since_visit > 100 and cost > 3000:
        return "lapsed"
    if cost < 2000 and potential > 70:
        return "whitespace"
    return None


# -----------------------------------------------------------------------------
# Per-HCP aggregation (cached)
# -----------------------------------------------------------------------------
@lru_cache(maxsize=8)
def hcp_brand_agg(brand: str) -> pd.DataFrame:
    """One row per HCP for a given brand, with mock fields attached."""
    sub = DF[DF["brand"] == brand].copy()
    grp = (sub.groupby(
              ["Prscrbr_NPI", "Prscrbr_Last_Org_Name", "Prscrbr_First_Name",
               "Prscrbr_City", "region", "Prscrbr_Type"],
              dropna=False)
              .agg(cost=("Tot_Drug_Cst", "sum"),
                   clms=("Tot_Clms", "sum"),
                   fills=("Tot_30day_Fills", "sum"),
                   days=("Tot_Day_Suply", "sum"))
              .reset_index())

    grp["mom"] = grp["Prscrbr_NPI"].apply(mock_mom)
    grp["daysSinceVisit"] = grp["Prscrbr_NPI"].apply(mock_days_since_visit)
    grp["potential"] = grp["Prscrbr_NPI"].apply(mock_potential)
    grp["tag"] = grp.apply(
        lambda r: tag_for(r["cost"], r["mom"], r["daysSinceVisit"], r["potential"]),
        axis=1,
    )
    return grp


# -----------------------------------------------------------------------------
# API-shaped functions
# -----------------------------------------------------------------------------
Region = Literal["All", "SoCal", "NorCal", "Central"]


def _apply_region(df: pd.DataFrame, region: Region) -> pd.DataFrame:
    if region == "All":
        return df
    return df[df["region"] == region]


def territory_summary(brand: str, region: Region) -> dict:
    """6 KPIs for the top strip."""
    df = _apply_region(hcp_brand_agg(brand), region)
    return {
        "brand": brand,
        "region": region,
        "asOf": "2025-12-31",
        "cost": int(df["cost"].sum()),
        "clms": int(df["clms"].sum()),
        "hcpCount": int(len(df)),
        "rising": int((df["tag"] == "rising").sum()),
        "lapsed": int((df["tag"] == "lapsed").sum()),
        "declining": int((df["tag"] == "declining").sum()),
        # MOCK vs-LY deltas (replace with real time-series)
        "vsLyCost": 12.4,
        "vsLyClms": 8.1,
        "vsLyHcp": -2.3,
    }


def top_hcps(brand: str, region: Region, limit: int = 12) -> list[dict]:
    df = _apply_region(hcp_brand_agg(brand), region)
    df = df.sort_values("cost", ascending=False).head(limit)
    return [
        {
            "npi": r["Prscrbr_NPI"],
            "name": f"Dr. {r['Prscrbr_First_Name']} {r['Prscrbr_Last_Org_Name']}",
            "specialty": r["Prscrbr_Type"],
            "city": r["Prscrbr_City"],
            "region": r["region"],
            "cost": int(r["cost"]),
            "clms": int(r["clms"]),
            "mom": int(r["mom"]),
            "daysSinceVisit": int(r["daysSinceVisit"]),
            "tag": r["tag"],
        }
        for _, r in df.iterrows()
    ]


def map_cities(brand: str) -> list[dict]:
    """Per-city rollup for the CA scatter map — across ALL regions, all brands."""
    # Reshape: city × brand cost
    pivot = (
        DF.pivot_table(
            index=["Prscrbr_City", "region"],
            columns="brand",
            values="Tot_Drug_Cst",
            aggfunc="sum",
            fill_value=0,
        )
        .reset_index()
    )
    pivot["clms"] = DF.groupby("Prscrbr_City")["Tot_Clms"].sum().reindex(pivot["Prscrbr_City"]).values
    pivot["prescribers"] = DF.groupby("Prscrbr_City")["Prscrbr_NPI"].nunique().reindex(pivot["Prscrbr_City"]).values

    out: list[dict] = []
    for _, r in pivot.iterrows():
        city = r["Prscrbr_City"]
        if city not in CITY_COORDS:
            continue
        lat, lon = CITY_COORDS[city]
        out.append({
            "city": city,
            "region": r["region"],
            "coords": [lat, lon],
            "Entresto": int(r.get("Entresto", 0)),
            "Cosentyx": int(r.get("Cosentyx", 0)),
            "Lucentis": int(r.get("Lucentis", 0)),
            "clms": int(r["clms"]) if pd.notna(r["clms"]) else 0,
            "prescribers": int(r["prescribers"]) if pd.notna(r["prescribers"]) else 0,
        })
    # Sort by chosen brand desc
    out.sort(key=lambda c: c.get(brand, 0), reverse=True)
    return out


def specialty_mix(brand: str, region: Region, limit: int = 7) -> list[dict]:
    df = _apply_region(hcp_brand_agg(brand), region)
    grp = (df.groupby("Prscrbr_Type")
             .agg(cost=("cost", "sum"),
                  clms=("clms", "sum"),
                  hcps=("Prscrbr_NPI", "count"))
             .reset_index()
             .sort_values("cost", ascending=False)
             .head(limit))
    return [
        {
            "specialty": r["Prscrbr_Type"],
            "cost": int(r["cost"]),
            "clms": int(r["clms"]),
            "hcps": int(r["hcps"]),
        }
        for _, r in grp.iterrows()
    ]
