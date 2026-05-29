"""
scripts/prebuild.py
===================
백엔드 로직을 직접 import해서 모든 브랜드×리전 조합의 집계 결과를
frontend/data/*.json으로 저장한다. GitHub Pages(정적 호스팅)용 프리렌더.

NOTE: data.py가 Supabase로 전환된 이후에는 실행 전 .env에
      SUPABASE_URL / SUPABASE_KEY 설정이 필요하다.
      FastAPI 백엔드를 직접 서빙하는 경우 이 스크립트는 불필요하다.

실행:
    cd /path/to/ozcoding-dashboard
    uv run --directory backend python scripts/prebuild.py
    # 또는 backend venv 활성화 후:
    python scripts/prebuild.py
"""

import json
import sys
from pathlib import Path

# backend 패키지를 import할 수 있도록 sys.path에 추가
ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "backend"))

import data as D  # noqa: E402

BRANDS  = ["Entresto", "Cosentyx", "Lucentis"]
REGIONS = ["All", "SoCal", "Central", "NorCal"]

OUT = ROOT / "frontend" / "data"
OUT.mkdir(parents=True, exist_ok=True)


def save(path: Path, obj) -> None:
    path.write_text(json.dumps(obj, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"  wrote {path.relative_to(ROOT)}")


def main() -> None:
    print("[prebuild] generating static JSON for all brand × region combos …")

    # 0) meta — brand/region list for the frontend brand switcher
    save(OUT / "meta.json", {
        "brands": [
            {"id": "Entresto", "label": "Entresto", "ta": "Heart Failure", "color": "#3257d4"},
            {"id": "Cosentyx", "label": "Cosentyx", "ta": "Immunology",   "color": "#6a3acc"},
            {"id": "Lucentis", "label": "Lucentis", "ta": "Retina",       "color": "#b8862a"},
        ],
        "regions": ["All", "SoCal", "Central", "NorCal"],
    })

    # 1) territory summary  — 브랜드 × 리전
    for brand in BRANDS:
        for region in REGIONS:
            obj = D.territory_summary(brand, region)
            save(OUT / f"summary-{brand}-{region}.json", obj)

    # 2) top HCPs (limit 12)  — 브랜드 × 리전
    for brand in BRANDS:
        for region in REGIONS:
            obj = D.top_hcps(brand, region, limit=12)
            save(OUT / f"hcps-{brand}-{region}.json", obj)

    # 3) map cities  — 브랜드별 (리전 무관)
    for brand in BRANDS:
        obj = D.map_cities(brand)
        save(OUT / f"cities-{brand}.json", obj)

    # 4) specialty mix (limit 7)  — 브랜드 × 리전
    for brand in BRANDS:
        for region in REGIONS:
            obj = D.specialty_mix(brand, region, limit=7)
            save(OUT / f"specialty-{brand}-{region}.json", obj)

    total = (
        len(BRANDS) * len(REGIONS) * 3   # summary + hcps + specialty
        + len(BRANDS)                     # cities
    )
    print(f"[prebuild] done — {total} files written to frontend/data/")


if __name__ == "__main__":
    main()
