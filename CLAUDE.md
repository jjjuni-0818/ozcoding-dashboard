# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

**RxPulse — 제약회사 영업마케팅 대시보드.** CMS Medicare Part D 처방자 데이터(캘리포니아, CY 2023 추정, 4,097행)를 기반으로 한 필드 세일즈 렙용 단일 페이지 대시보드. 디자인 핸드오프 번들(`claude.ai/design`)에서 포팅된 프로토타입.

운영 README는 [README.md](README.md) 참조 — 이 파일은 코드 작업용 메타 가이드.

## 실행 명령

### Backend (FastAPI · Python 3.10+)

`~/.claude/rules/python.md` 규칙에 따라 **`uv` 강제, `python -m venv` / `pip` 직접 호출 금지**:

```bash
cd backend
uv venv .venv
source .venv/bin/activate
uv pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

기동 시 CSV 로드 로그가 stdout에 찍힘 (`[data] loaded 4,097 rows ...`). Swagger UI: `http://localhost:8000/docs`.

### Frontend (정적 서빙)

```bash
cd frontend
python -m http.server 5173
# → http://localhost:5173
```

> `index.html`을 `file://`로 직접 열면 ES module + CORS로 깨진다. 반드시 정적 서버 경유.

테스트 스위트는 없음 (프로토타입 단계). 추가할 때는 backend는 pytest, frontend는 빌드 시스템 도입 후 결정.

## 아키텍처 — 큰 그림

### 데이터 흐름
```
backend/data/part_d_prescriber.csv   (CMS Part D, CA-only, 4,097행)
        ↓ data.py::_load (모듈 import 시 1회 로드, 전역 DF)
        ↓ hcp_brand_agg(brand)  ← @lru_cache(maxsize=8) — brand별 1회 집계
        ↓ main.py FastAPI 라우트 (CORS *)
        ↓ frontend/src/api.js   ← API_BASE 한 곳에서 host/port 제어
        ↓ home.jsx::useEffect   ← brand/region 변경 시 4개 엔드포인트 병렬 fetch
        ↓ shared.jsx DS/BRANDS 토큰으로 렌더링
```

### 빌드 시스템이 **없다**

`frontend/index.html`은 unpkg에서 React 18 + `@babel/standalone`을 로드해 `.jsx`를 **브라우저에서 트랜스파일**한다. webpack/vite/tsc 같은 빌드 단계가 없고, npm 의존성도 없다.

- `<script type="text/babel" src="src/*.jsx">` 패턴 유지
- 컴포넌트 간 통신은 `Object.assign(window, {...})`로 글로벌 노출 (모듈 시스템 없음)
- 새 컴포넌트 추가 시: `index.html`에 `<script type="text/babel" src="...">` 한 줄 추가 + 끝에 `window.X = X`
- README가 명시한 것처럼 **Babel in-browser는 데모용** — 운영 빌드로 가려면 Vite + esbuild 마이그레이션이 별도 작업

### 디자인 토큰 SSOT

`frontend/src/shared.jsx` 상단의 `DS` (잉크/룰/페이퍼 색)과 `BRANDS` (브랜드별 color/tintBg/tintInk + TA)가 단일 진실원. **색상·폰트를 컴포넌트에 하드코딩하지 말 것** — `DS.ink2`, `BRANDS[brand].color` 같은 참조로만 사용.

브랜드 색:
| Entresto | Cosentyx | Lucentis |
|---|---|---|
| `#3257d4` (Heart Failure) | `#6a3acc` (Immunology) | `#b8862a` (Retina) |

### Mock 필드 — 교체 지점

CSV는 **단일 시점 스냅샷**이라 시계열이 없다. 다음 필드는 NPI MD5 해시 기반 **deterministic mock**:

- `mom` (월대비 %) — `data.py::mock_mom`
- `daysSinceVisit` — `data.py::mock_days_since_visit`
- `tag` (rising/lapsed/declining/whitespace) — `data.py::tag_for`
- `vsLyCost`, `vsLyClms`, `vsLyHcp` — `territory_summary` 안에 고정값 하드코딩

실서비스 전환 시 실제 시계열 + Veeva/CRM 연동으로 교체. **mock 값을 임의로 바꿔도 결정론이 깨지지 않게**(같은 NPI는 같은 값) 유지할 것.

### 브랜드 정규화

CSV에는 `Cosentyx Pen`, `Cosentyx Syringe`, `Cosentyx Pen 2-pack` 등 SKU가 분리돼 있다. `regions.py::normalize_brand`가 prefix 매칭으로 `Cosentyx`로 collapse — 새 브랜드/SKU 추가 시 이 함수를 거쳐야 한다.

### 도시 → 리전 매핑

`regions.py`의 `SOCAL_CITIES` / `CENTRAL_CITIES` / `NORCAL_CITIES` set과 `CITY_COORDS` dict. 지도(map.jsx)에 표시되려면 **`CITY_COORDS`에 lat/lon이 등록된 도시만** 통과 (`data.py::map_cities`에서 필터링). 새 도시 추가 시 두 곳 다 갱신.

## 배포 컨텍스트 — 결정 미정

목표는 **GitHub Pages 배포** (정적 호스팅 전용 → FastAPI 직접 띄울 수 없음). 백엔드 처리 방안 3안 중 미선택 상태:

- **A안**: 브랜드 3 × 리전 4 = 12 조합을 빌드 타임에 JSON으로 프리렌더 → `frontend/data/*.json` 정적 자산화, `api.js` fetch 경로 교체
- **B안**: 백엔드를 Render/Railway/Fly.io 등 별도 호스팅 → `api.js`의 `API_BASE`만 교체
- **C안**: CSV를 클라이언트로 로드해 JS로 집계 (pandas 로직 포팅)

A안 권장 (단일 시점 데이터 + 조합 12개라 프리렌더가 깔끔). 결정 전에는 deployment 관련 코드 변경 보류.

## 컨벤션 — 주의할 함정

- **백엔드 변경 후 캐시**: `hcp_brand_agg`가 `@lru_cache(maxsize=8)` — 데이터 정의를 바꿔도 캐시가 살아있으면 결과가 갱신 안 됨. dev에서는 uvicorn `--reload`로 모듈 재로드 시 캐시도 비워진다.
- **CORS는 와일드카드**: `main.py`에서 `allow_origins=["*"]` — 운영 배포 시 origin 화이트리스트로 좁힐 것.
- **API_BASE 단일 지점**: `frontend/src/api.js`만 바꾸면 host/port 전체 전환. 다른 곳에 URL 하드코딩 금지.
- **`/api/meta`는 정의돼 있지만 프론트가 미사용**: 현재 `BRANDS`가 `shared.jsx`에 하드코딩돼 있어 `/api/meta` 호출이 dead. 운영 전환 시 부트스트랩 단계에서 meta로 교체 고려.
- **`Tot_Benes`는 67.7% 결측**: 환자 < 11명일 때 CMS가 suppress. 환자수 지표는 보조용으로만.
