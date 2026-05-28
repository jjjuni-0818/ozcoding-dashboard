// api.js — static JSON fetch (GitHub Pages 정적 배포용)
// 백엔드 없이 prebuild 생성 JSON을 직접 읽는다.
// 파일 위치: frontend/data/<type>-<Brand>-<Region>.json

const DATA = "./data";

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`fetch ${res.status}: ${url}`);
  return res.json();
}

const api = {
  meta: () => Promise.resolve({
    brands: [
      { id: "Entresto", label: "Entresto", ta: "Heart Failure", color: "#3257d4" },
      { id: "Cosentyx", label: "Cosentyx", ta: "Immunology",   color: "#6a3acc" },
      { id: "Lucentis", label: "Lucentis", ta: "Retina",       color: "#b8862a" },
    ],
    regions: ["All", "SoCal", "Central", "NorCal"],
  }),

  territorySummary: (brand, region) =>
    fetchJSON(`${DATA}/summary-${brand}-${region}.json`),

  topHcps: (brand, region, limit = 12) =>
    fetchJSON(`${DATA}/hcps-${brand}-${region}.json`)
      .then(arr => arr.slice(0, limit)),

  mapCities: (brand) =>
    fetchJSON(`${DATA}/cities-${brand}.json`),

  specialtyMix: (brand, region, limit = 7) =>
    fetchJSON(`${DATA}/specialty-${brand}-${region}.json`)
      .then(arr => arr.slice(0, limit)),
};

window.api = api;
