const API_BASE = "http://127.0.0.1:8000";

async function fetchJSON(path, opts){
  const res = await fetch(API_BASE + path, opts);
  if (!res.ok) throw new Error("HTTP " + res.status);
  return res.json();
}
