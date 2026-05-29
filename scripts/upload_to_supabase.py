"""
upload_to_supabase.py
=====================
One-time script: reads the CMS Part D CSV and bulk-inserts all rows into
the Supabase `hcp_prescriptions` table.

Usage:
    cd ozcoding-dashboard
    pip install supabase pandas python-dotenv
    python scripts/upload_to_supabase.py

Env vars (set in .env or shell):
    SUPABASE_URL
    SUPABASE_KEY   ← use the service_role key for writes
"""

from __future__ import annotations

import os
import sys
from pathlib import Path

import pandas as pd
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "")
CSV_PATH = Path(__file__).parent.parent / "backend" / "data" / "part_d_prescriber.csv"
TABLE = "hcp_prescriptions"
BATCH_SIZE = 500

if not SUPABASE_URL or not SUPABASE_KEY:
    sys.exit("Error: SUPABASE_URL and SUPABASE_KEY must be set in .env")

if not CSV_PATH.exists():
    sys.exit(f"Error: CSV not found at {CSV_PATH}")

# ---------------------------------------------------------------------------
# Load + reshape CSV columns → table columns
# ---------------------------------------------------------------------------
print(f"Reading {CSV_PATH} …")
df = pd.read_csv(CSV_PATH, dtype={"Prscrbr_NPI": str})
df = df[df["Prscrbr_State_Abrvtn"] == "CA"].copy()

rename = {
    "Prscrbr_NPI":           "prscrbr_npi",
    "Prscrbr_Last_Org_Name": "prscrbr_last",
    "Prscrbr_First_Name":    "prscrbr_first",
    "Prscrbr_City":          "prscrbr_city",
    "Prscrbr_State_Abrvtn":  "prscrbr_state",
    "Prscrbr_Type":          "prscrbr_type",
    "Brnd_Name":             "brand_name",
    "Tot_Clms":              "tot_clms",
    "Tot_30day_Fills":       "tot_30day_fills",
    "Tot_Day_Suply":         "tot_day_suply",
    "Tot_Drug_Cst":          "tot_drug_cst",
    "Tot_Benes":             "tot_benes",
    "GE65_Sprsn_Flag":       "ge65_flag",
}
df = df.rename(columns=rename)[[*rename.values()]]

# Coerce numerics; fill NaN with 0 so JSON serialisation works
for col in ("tot_clms", "tot_30day_fills", "tot_day_suply", "tot_drug_cst", "tot_benes"):
    df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0)

df = df.where(pd.notna(df), None)   # NaN → None for JSON null

records = df.to_dict(orient="records")
print(f"  {len(records):,} rows to insert")

# ---------------------------------------------------------------------------
# Batch insert
# ---------------------------------------------------------------------------
sb = create_client(SUPABASE_URL, SUPABASE_KEY)

total = 0
for i in range(0, len(records), BATCH_SIZE):
    batch = records[i : i + BATCH_SIZE]
    sb.table(TABLE).insert(batch).execute()
    total += len(batch)
    print(f"  inserted {total:,} / {len(records):,}", end="\r")

print(f"\nDone — {total:,} rows inserted into '{TABLE}'.")
