const PROJECTS_KEY = "cep_projects_v1";
const BRANDS_KEY   = "cep_brands_v1";
const AUTH_KEY     = "cep_auth";
export const ADMIN_PASSWORD = "cep2024"; // change this

// ─── Auth ────────────────────────────────────────────────────────────────────
export function isLoggedIn() {
  return sessionStorage.getItem(AUTH_KEY) === "1";
}
export function login(pw) {
  if (pw === ADMIN_PASSWORD) { sessionStorage.setItem(AUTH_KEY, "1"); return true; }
  return false;
}
export function logout() { sessionStorage.removeItem(AUTH_KEY); }

// ─── Projects ─────────────────────────────────────────────────────────────────
export function getStoredProjects() {
  try { return JSON.parse(localStorage.getItem(PROJECTS_KEY) || "[]"); } catch { return []; }
}
export function addProject(p) {
  const list = getStoredProjects();
  list.push({ ...p, _id: String(Date.now()), _date: new Date().toLocaleDateString() });
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(list));
}
export function deleteProject(id) {
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(getStoredProjects().filter(p => p._id !== id)));
}

// ─── Brands ───────────────────────────────────────────────────────────────────
export function getStoredBrands() {
  try { return JSON.parse(localStorage.getItem(BRANDS_KEY) || "[]"); } catch { return []; }
}
export function addBrand(b) {
  const list = getStoredBrands();
  list.push({ ...b, _id: String(Date.now()) });
  localStorage.setItem(BRANDS_KEY, JSON.stringify(list));
}
export function deleteBrand(id) {
  localStorage.setItem(BRANDS_KEY, JSON.stringify(getStoredBrands().filter(b => b._id !== id)));
}

// ─── Export / Import ──────────────────────────────────────────────────────────
export function exportAll() {
  return JSON.stringify({ projects: getStoredProjects(), brands: getStoredBrands() }, null, 2);
}
export function importAll(json) {
  const d = JSON.parse(json);
  if (Array.isArray(d.projects)) localStorage.setItem(PROJECTS_KEY, JSON.stringify(d.projects));
  if (Array.isArray(d.brands))   localStorage.setItem(BRANDS_KEY,   JSON.stringify(d.brands));
}

// ─── Storage meter ────────────────────────────────────────────────────────────
export function storageUsedKB() {
  return Math.round(
    ([PROJECTS_KEY, BRANDS_KEY].reduce((s, k) => s + (localStorage.getItem(k) || "").length, 0)) / 1024
  );
}

// ─── Image compression (canvas) ───────────────────────────────────────────────
export function compressImage(file, maxPx = 1000, quality = 0.75) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = ({ target: { result } }) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const ratio = Math.min(maxPx / img.width, maxPx / img.height, 1);
        const canvas = document.createElement("canvas");
        canvas.width  = Math.round(img.width  * ratio);
        canvas.height = Math.round(img.height * ratio);
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  });
}
