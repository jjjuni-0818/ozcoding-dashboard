"""
data.py
=======
Fetches CMS Medicare Part D data from Supabase and exposes high-level
aggregation functions consumed by the FastAPI routes in main.py.

All currency values are in USD. MoM% / daysSinceVisit / tags are
DETERMINISTIC MOCK FIELDS derived from a hash of the NPI — no time-series
data exists in CMS Part D. Replace with real CRM / IMS data in production.

Env vars required (set in .env or deployment environment):
    SUPABASE_URL   — e.g. https://xxxx.supabase.co
    SUPABASE_KEY   — service_role or anon key (read-only RLS recommended)
"""

from __future__ import annotations

import hashlib
import os
from functools import lru_cache
from typing import Literal

import pandas as pd
from dotenv import load_dotenv
from supabase import create_client, Client

from regions import BRANDS, CITY_COORDS, city_region, normalize_brand

load_dotenv()

# -----------------------------------------------------------------------------
# Supabase client (singleton)
# -----------------------------------------------------------------------------
_SUPABASE_URL = os.environ["SUPABASE_URL"]
_SUPABASE_KEY = os.environ["SUPABASE_KEY"]

_sb: Client = create_client(_SUPABASE_URL, _SUPABASE_KEY)

TABLE = "hcp_prescriptions"

# -----------------------------------------------------------------------------
# Load all rows into a pandas DataFrame (cached at startup, same as before)
# Supabase free tier: paginate if > 1 000 rows.
# -----------------------------------------------------------------------------
def _fetch_all() -> list[dict]:
    rows: list[dict] = []
    page_size = 1000
    offset = 0
    while True:
        res = (
            _sb.table(TABLE)
            .select("*")
            .range(offset, offset + page_size - 1)
            .execute()
        )
        batch = res.data or []
        rows.extend(batch)
        if len(batch) < page_size:
            break
        offset += page_size
    return rows


def _load() -> pd.DataFrame:
    rows = _fetch_all()
    df = pd.DataFrame(rows)

    # Normalize brand (collapse Cosentyx SKUs)
    df["brand"] = df["brand_name"].apply(normalize_brand)

    # Region from city
    df["region"] = df["prscrbr_city"].apply(city_region)

    # Fill numeric NAs with 0
    for col in ("tot_clms", "tot_30day_fills", "tot_day_suply", "tot_drug_cst", "tot_benes"):
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0)

    return df


DF: pd.DataFrame = _load()
print(
    f"[data] loaded {len(DF):,} rows from Supabase · "
    f"{DF['prscrbr_npi'].nunique():,} unique HCPs · "
    f"brands={sorted(DF['brand'].unique())}"
)

# -----------------------------------------------------------------------------
# Deterministic mock helpers (replace with real data later)
# -----------------------------------------------------------------------------
def _npi_unit(npi: str, salt: str) -> float:
    h = hashlib.md5(f"{npi}|{salt}".encode()).digest()
    return (int.from_bytes(h[:4], "big") % 10_000) / 10_000.0


def mock_mom(npi: str) -> int:
    return int((_npi_unit(npi, "mom") - 0.45) * 90)


def mock_days_since_visit(npi: str) -> int:
    return int(_npi_unit(npi, "visit") * 180) + 1


def mock_potential(npi: str) -> int:
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
    sub = DF[DF["brand"] == brand].copy()
    grp = (
        sub.groupby(
            ["prscrbr_npi", "prscrbr_last", "prscrbr_first",
             "prscrbr_city", "region", "prscrbr_type"],
            dropna=False,
        )
        .agg(
            cost=("tot_drug_cst", "sum"),
            clms=("tot_clms", "sum"),
            fills=("tot_30day_fills", "sum") if "tot_30day_fills" in sub.columns else ("tot_clms", "sum"),
            days=("tot_day_suply", "sum") if "tot_day_suply" in sub.columns else ("tot_clms", "sum"),
        )
        .reset_index()
    )

    grp["mom"] = grp["prscrbr_npi"].apply(mock_mom)
    grp["daysSinceVisit"] = grp["prscrbr_npi"].apply(mock_days_since_visit)
    grp["potential"] = grp["prscrbr_npi"].apply(mock_potential)
    grp["tag"] = grp.apply(
        lambda r: tag_for(r["cost"], r["mom"], r["daysSinceVisit"], r["potential"]),
        axis=1,
    )
    return grp


# -----------------------------------------------------------------------------
# API-shaped functions (identical signatures to the original CSV version)
# -----------------------------------------------------------------------------
Region = Literal["All", "SoCal", "NorCal", "Central"]


def _apply_region(df: pd.DataFrame, region: Region) -> pd.DataFrame:
    if region == "All":
        return df
    return df[df["region"] == region]


def territory_summary(brand: str, region: Region) -> dict:
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
        "vsLyCost": 12.4,
        "vsLyClms": 8.1,
        "vsLyHcp": -2.3,
    }


def top_hcps(brand: str, region: Region, limit: int = 12) -> list[dict]:
    df = _apply_region(hcp_brand_agg(brand), region)
    df = df.sort_values("cost", ascending=False).head(limit)
    return [
        {
            "npi": r["prscrbr_npi"],
            "name": f"Dr. {r['prscrbr_first']} {r['prscrbr_last']}",
            "specialty": r["prscrbr_type"],
            "city": r["prscrbr_city"],
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
    pivot = (
        DF.pivot_table(
            index=["prscrbr_city", "region"],
            columns="brand",
            values="tot_drug_cst",
            aggfunc="sum",
            fill_value=0,
        )
        .reset_index()
    )
    pivot["clms"] = (
        DF.groupby("prscrbr_city")["tot_clms"].sum()
        .reindex(pivot["prscrbr_city"]).values
    )
    pivot["prescribers"] = (
        DF.groupby("prscrbr_city")["prscrbr_npi"].nunique()
        .reindex(pivot["prscrbr_city"]).values
    )

    out: list[dict] = []
    for _, r in pivot.iterrows():
        city = r["prscrbr_city"]
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
    out.sort(key=lambda c: c.get(brand, 0), reverse=True)
    return out


def specialty_mix(brand: str, region: Region, limit: int = 7) -> list[dict]:
    df = _apply_region(hcp_brand_agg(brand), region)
    grp = (
        df.groupby("prscrbr_type")
        .agg(cost=("cost", "sum"), clms=("clms", "sum"), hcps=("prscrbr_npi", "count"))
        .reset_index()
        .sort_values("cost", ascending=False)
        .head(limit)
    )
    return [
        {
            "specialty": r["prscrbr_type"],
            "cost": int(r["cost"]),
            "clms": int(r["clms"]),
            "hcps": int(r["hcps"]),
        }
        for _, r in grp.iterrows()
    ]
