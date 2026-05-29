// api.js — FastAPI backend client
// Calls the FastAPI server running at BACKEND_URL (default: localhost:8000).
// Set window.BACKEND_URL before this script to override (e.g. for production).

const BACKEND = (typeof window !== "undefined" && window.BACKEND_URL)
  ? window.BACKEND_URL.replace(/\/$/, "")
  : "http://localhost:8000";

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`fetch ${res.status}: ${url}`);
  return res.json();
}

const api = {
  meta: () =>
    fetchJSON(`${BACKEND}/api/meta`),

  territorySummary: (brand, region) =>
    fetchJSON(`${BACKEND}/api/territory/summary?brand=${brand}&region=${region}`),

  topHcps: (brand, region, limit = 12) =>
    fetchJSON(`${BACKEND}/api/hcps/top?brand=${brand}&region=${region}&limit=${limit}`),

  mapCities: (brand) =>
    fetchJSON(`${BACKEND}/api/map/cities?brand=${brand}`),

  specialtyMix: (brand, region, limit = 7) =>
    fetchJSON(`${BACKEND}/api/specialty/mix?brand=${brand}&region=${region}&limit=${limit}`),
};

window.api = api;
