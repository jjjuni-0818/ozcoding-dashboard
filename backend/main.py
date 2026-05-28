"""
main.py
=======
FastAPI entry point.

Run locally:
    uvicorn main:app --reload --port 8000

Endpoints:
    GET /api/territory/summary?brand=Entresto&region=SoCal
    GET /api/hcps/top?brand=Entresto&region=SoCal&limit=12
    GET /api/map/cities?brand=Entresto
    GET /api/specialty/mix?brand=Entresto&region=SoCal
    GET /api/meta            (brand list etc — for the frontend brand switcher)
"""

from typing import Literal

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

import data

Region = Literal["All", "SoCal", "NorCal", "Central"]
Brand = Literal["Entresto", "Cosentyx", "Lucentis"]


app = FastAPI(
    title="RxPulse API",
    description="Field Insights dashboard backend — pharma sales analytics",
    version="0.1.0",
)

# CORS: allow the frontend (served as static files or via vite dev server)
# to call this API in development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health():
    return {"ok": True}


@app.get("/api/meta")
def meta():
    """Frontend bootstrap data (brand list, region list, rep persona)."""
    return {
        "brands": [
            {"id": "Entresto", "label": "Entresto", "ta": "Heart Failure", "color": "#3257d4"},
            {"id": "Cosentyx", "label": "Cosentyx", "ta": "Immunology",   "color": "#6a3acc"},
            {"id": "Lucentis", "label": "Lucentis", "ta": "Retina",       "color": "#b8862a"},
        ],
        "regions": ["All", "SoCal", "Central", "NorCal"],
        "rep": {
            "name": "Sarah Kim",
            "initials": "SK",
            "territory": "SoCal · Cardiovascular",
            "brandPrimary": "Entresto",
        },
    }


@app.get("/api/territory/summary")
def territory_summary(
    brand: Brand = "Entresto",
    region: Region = "SoCal",
):
    return data.territory_summary(brand, region)


@app.get("/api/hcps/top")
def hcps_top(
    brand: Brand = "Entresto",
    region: Region = "SoCal",
    limit: int = Query(12, ge=1, le=100),
):
    return data.top_hcps(brand, region, limit)


@app.get("/api/map/cities")
def map_cities(brand: Brand = "Entresto"):
    return data.map_cities(brand)


@app.get("/api/specialty/mix")
def specialty_mix(
    brand: Brand = "Entresto",
    region: Region = "SoCal",
    limit: int = Query(7, ge=1, le=20),
):
    return data.specialty_mix(brand, region, limit)
