// api.js — dual-mode client
// • localhost or window.BACKEND_URL set → FastAPI backend
// • GitHub Pages (or any non-localhost static host) → prebuild'd JSON files

const IS_STATIC =
  typeof window !== "undefined" &&
  !window.BACKEND_URL &&
  window.location.hostname !== "localhost" &&
  window.location.hostname !== "127.0.0.1";

const BACKEND = (typeof window !== "undefined" && window.BACKEND_URL)
  ? window.BACKEND_URL.replace(/\/$/, "")
  : "http://localhost:8000";

const DATA = "./data";

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`fetch ${res.status}: ${url}`);
  return res.json();
}

const api = {
  meta: () => IS_STATIC
    ? fetchJSON(`${DATA}/meta.json`)
    : fetchJSON(`${BACKEND}/api/meta`),

  territorySummary: (brand, region) => IS_STATIC
    ? fetchJSON(`${DATA}/summary-${brand}-${region}.json`)
    : fetchJSON(`${BACKEND}/api/territory/summary?brand=${brand}&region=${region}`),

  topHcps: (brand, region, limit = 12) => IS_STATIC
    ? fetchJSON(`${DATA}/hcps-${brand}-${region}.json`).then(arr => arr.slice(0, limit))
    : fetchJSON(`${BACKEND}/api/hcps/top?brand=${brand}&region=${region}&limit=${limit}`),

  mapCities: (brand) => IS_STATIC
    ? fetchJSON(`${DATA}/cities-${brand}.json`)
    : fetchJSON(`${BACKEND}/api/map/cities?brand=${brand}`),

  specialtyMix: (brand, region, limit = 7) => IS_STATIC
    ? fetchJSON(`${DATA}/specialty-${brand}-${region}.json`).then(arr => arr.slice(0, limit))
    : fetchJSON(`${BACKEND}/api/specialty/mix?brand=${brand}&region=${region}&limit=${limit}`),
};

window.api = api;
