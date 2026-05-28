# RxPulse — 제약회사 영업마케팅 대시보드

CMS Medicare Part D 처방자 데이터(캘리포니아, CY 2023 추정) 기반의
필드 세일즈 렙용 웹 대시보드. **KPI-First** 홈 화면 단일 페이지가
포함되어 있으며, 이후 작업(추가 페이지, 인터랙션, 실제 데이터
파이프라인)은 Claude Code 에서 진행한다.

## 디렉토리 구조

```
.
├── README.md                        ← 이 파일
├── 기획안.html                       ← 데이터 분석 + IA + 와이어프레임 (참고용)
├── 대시보드.html                     ← 옵션 비교 (KPI / Task / Map First) — 아카이브
│
├── backend/                         ← Python · FastAPI · pandas
│   ├── main.py                      ← API 엔트리포인트 (4 endpoints + /meta + /health)
│   ├── data.py                      ← CSV 로드 + pandas 집계 + mock 필드 (MoM, lapsed 등)
│   ├── regions.py                   ← 도시→region 매핑, lat/lon, brand normalize
│   ├── requirements.txt
│   └── data/
│       └── part_d_prescriber.csv    ← 원본 데이터 (4,097 rows · CA만)
│
└── frontend/                        ← 정적 HTML + React (Babel in-browser)
    ├── index.html
    └── src/
        ├── api.js                   ← fetch 래퍼 — API_BASE 여기서 변경
        ├── shared.jsx               ← 디자인 토큰 + Sidebar/TopBar/Card/KPI
        ├── map.jsx                  ← CA 산점도 SVG 컴포넌트
        └── home.jsx                 ← KPI-First 페이지 (메인)
```

## 빠른 실행

### 1) Backend (Python 3.10+)

```bash
cd backend
python -m venv .venv
source .venv/bin/activate                 # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

기동 로그 예시:
```
[data] loaded 4,097 rows · 4,036 unique HCPs · brands=['Cosentyx', 'Entresto', 'Lucentis']
```

API 문서: `http://localhost:8000/docs` (Swagger UI 자동 생성)

### 2) Frontend

`frontend/index.html` 을 **간단한 정적 서버**로 띄운다 (브라우저로
직접 열면 ES module + CORS 문제 발생):

```bash
cd frontend
python -m http.server 5173
```

브라우저: `http://localhost:5173`

> 백엔드와 다른 포트면 `frontend/src/api.js` 의 `API_BASE` 를 수정.

## API 명세

| Method | Path | 쿼리 | 설명 |
|---|---|---|---|
| GET | `/api/health` | — | 헬스체크 |
| GET | `/api/meta` | — | 브랜드/지역/렙 메타 (프론트 부트스트랩) |
| GET | `/api/territory/summary` | `brand`, `region` | 6개 KPI |
| GET | `/api/hcps/top` | `brand`, `region`, `limit` | Top 처방의 |
| GET | `/api/map/cities` | `brand` | 도시별 매출 + 좌표 |
| GET | `/api/specialty/mix` | `brand`, `region`, `limit` | 진료과별 매출 |

- `brand` ∈ `Entresto` | `Cosentyx` | `Lucentis`
- `region` ∈ `SoCal` | `Central` | `NorCal` | `All`

## 데이터에 대한 주의

**시계열이 없는 단일 시점 집계** 데이터이다. 다음 필드는 NPI 해시
기반 **결정론적 mock** 으로 채워져 있으며, 실서비스에서는 실제
시계열·CRM 연동으로 교체해야 한다:

- `mom` (월대비 변화율)
- `daysSinceVisit` (마지막 디테일링 이후 일수)
- `tag` (rising / lapsed / declining / whitespace)
- `vsLyCost`, `vsLyClms`, `vsLyHcp` (vs LY % — 모두 고정 mock)

교체 지점: `backend/data.py` 의 `mock_mom`, `mock_days_since_visit`,
`tag_for`, `territory_summary` 함수.

또한 `Tot_Benes` 컬럼은 환자 < 11명일 때 suppress 처리되어
**67.7%가 결측**이다. 환자수 기반 지표는 보조용으로만 쓰는 것을
권장.

## Claude Code 다음 작업 가이드

큰 그림 (5-page IA 참조 → `기획안.html`):

1. **HCP Explorer** (검색·필터) — 새 페이지
   - 필요한 추가 API: `GET /api/hcps/search?q=&brand=&specialty=&city=&minCost=`
   - 좌측 필터 패널, 우측 가상화된 큰 테이블 (예: react-window)

2. **HCP Profile** (의사 360°) — `/hcp/:npi` 라우트
   - `GET /api/hcps/{npi}` — 단일 HCP 상세
   - 처방 추이 차트 (실제 시계열 필요 → 다른 데이터 소스 연동)
   - Peer 비교 (같은 city × specialty 평균과 비교)

3. **Geography** — Map-First 페이지 (이미 컨셉만 있음, 빌드 안 됨)
   - 큰 CA 지도 + 도시 클릭 → drill-in
   - Whitespace ranker

4. **Brand Performance** — 브랜드 단위 페이지
   - SKU mix (Cosentyx Pen vs Syringe vs 2-pack)
   - 신규/lapsed cohort

5. **인프라**
   - 빌드 시스템 (Vite + esbuild)으로 마이그레이션 — Babel
     in-browser 는 데모용
   - 인증 (rep 별 territory 자동 필터)
   - 실제 시계열 데이터 파이프라인 (월별 IMS 데이터)
   - CRM (Veeva 등) 연동 — `daysSinceVisit`, 방문 이력
   - CSV/PDF export

## 디자인 토큰

`frontend/src/shared.jsx` 상단 `DS` 와 `BRANDS` 객체 참조.

| | Entresto | Cosentyx | Lucentis |
|---|---|---|---|
| 색 | `#3257d4` | `#6a3acc` | `#b8862a` |
| TA | Heart Failure | Immunology | Retina |

## 라이센스 / 데이터 출처

원본 데이터: [CMS Medicare Part D Prescribers (Public Use File)](https://data.cms.gov/provider-summary-by-type-of-service/medicare-part-d-prescribers)
