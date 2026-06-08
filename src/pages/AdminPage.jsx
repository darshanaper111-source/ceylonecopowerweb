import React, { useRef, useState } from "react";
import {
  AlertTriangle, CheckCircle, Download, LogOut,
  Plus, Trash2, Upload, X,
} from "lucide-react";
import {
  addBrand, addProject, compressImage, deleteBrand, deleteProject,
  exportAll, getStoredBrands, getStoredProjects, importAll,
  isLoggedIn, login, logout, storageUsedKB,
} from "../data/storage.js";
import { projectCategories } from "../data/projects.js";
import { partnerSections }    from "../data/partners.js";

// ─── Shared helpers ───────────────────────────────────────────────────────────
function cls(...parts) { return parts.filter(Boolean).join(" "); }
const inputCls = "w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100 bg-white";

function Field({ label, required, hint, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

// ─── Photo Slot ───────────────────────────────────────────────────────────────
function PhotoSlot({ n, value, onChange }) {
  const ref = useRef();

  async function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    try { onChange(await compressImage(file)); } catch { onChange(""); }
    e.target.value = "";
  }

  return (
    <div className="border rounded-xl overflow-hidden bg-gray-50 text-sm flex flex-col">
      {value ? (
        <div className="relative h-28 flex-shrink-0">
          <img
            src={value}
            alt=""
            className="w-full h-full object-cover"
            onError={(e) => { e.currentTarget.style.opacity = "0.2"; }}
          />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-700"
          >
            <X size={12} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => ref.current.click()}
          className="h-28 flex flex-col items-center justify-center gap-1 text-gray-400 hover:bg-gray-100 transition"
        >
          <Upload size={18} />
          <span className="text-xs">Photo {n}</span>
        </button>
      )}
      <div className="p-2 space-y-1 bg-white border-t">
        <input type="file" accept="image/*" ref={ref} className="hidden" onChange={handleFile} />
        <button type="button" onClick={() => ref.current.click()} className="text-xs text-blue-600 hover:underline">
          {value ? "Replace" : "Upload file"}
        </button>
        <input
          type="text"
          placeholder="or paste URL"
          value={value.startsWith("data:") ? "" : value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full text-xs border rounded px-2 py-1 outline-none focus:border-blue-400"
        />
      </div>
    </div>
  );
}

// ─── Login ────────────────────────────────────────────────────────────────────
function LoginForm({ onLogin }) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState(false);

  function submit(e) {
    e.preventDefault();
    if (login(pw)) { onLogin(); } else { setErr(true); setPw(""); }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <form onSubmit={submit} className="bg-white rounded-2xl shadow-xl p-10 w-full max-w-sm space-y-5">
        <div className="text-center">
          <div className="text-xl font-black text-gray-800">CEYLON <span className="text-yellow-600">ECO POWER</span></div>
          <p className="text-gray-400 text-sm mt-1">Admin Panel</p>
        </div>
        <Field label="Password" required>
          <input
            type="password"
            value={pw}
            autoFocus
            onChange={(e) => { setPw(e.target.value); setErr(false); }}
            className={cls(inputCls, err && "border-red-400")}
          />
          {err && <p className="text-red-500 text-xs mt-1">Incorrect password</p>}
        </Field>
        <button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2.5 rounded-lg transition">
          Login
        </button>
      </form>
    </div>
  );
}

// ─── Add Project Form ─────────────────────────────────────────────────────────
const BLANK_PROJECT = {
  categoryId: "utility", title: "", location: "",
  acCapacity: "", dcCapacity: "", client: "", details: "",
  photos: ["", "", "", "", ""],
};

function ProjectForm({ onSaved }) {
  const [form, setForm] = useState({ ...BLANK_PROJECT, photos: ["", "", "", "", ""] });
  const [saved, setSaved] = useState(false);

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })); }
  function setPhoto(i, v) {
    setForm((f) => { const p = [...f.photos]; p[i] = v; return { ...f, photos: p }; });
  }

  function submit(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.location.trim()) return;
    addProject({ ...form, photos: form.photos.filter(Boolean) });
    setForm({ ...BLANK_PROJECT, photos: ["", "", "", "", ""] });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    onSaved();
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Project Category" required>
          <select value={form.categoryId} onChange={(e) => set("categoryId", e.target.value)} className={inputCls}>
            {projectCategories.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </Field>
        <Field label="Project Title" required>
          <input value={form.title} onChange={(e) => set("title", e.target.value)} className={inputCls} placeholder="e.g. Hotel Rooftop Solar 500 kW" />
        </Field>
        <Field label="Location" required>
          <input value={form.location} onChange={(e) => set("location", e.target.value)} className={inputCls} placeholder="e.g. Colombo, Sri Lanka" />
        </Field>
        <Field label="Client">
          <input value={form.client} onChange={(e) => set("client", e.target.value)} className={inputCls} placeholder="e.g. Private Company" />
        </Field>
        <Field label="AC Capacity">
          <input value={form.acCapacity} onChange={(e) => set("acCapacity", e.target.value)} className={inputCls} placeholder="e.g. 500 kW" />
        </Field>
        <Field label="DC Capacity">
          <input value={form.dcCapacity} onChange={(e) => set("dcCapacity", e.target.value)} className={inputCls} placeholder="e.g. 570 kWp" />
        </Field>
      </div>

      <Field label="Project Details">
        <textarea value={form.details} onChange={(e) => set("details", e.target.value)} rows={3} className={cls(inputCls, "resize-none")} placeholder="Brief description of the project..." />
      </Field>

      <Field label="Project Photos (up to 5)" hint="Upload photos from your device or paste image URLs. Photos are compressed automatically.">
        <div className="grid grid-cols-5 gap-2 mt-1">
          {form.photos.map((p, i) => <PhotoSlot key={i} n={i + 1} value={p} onChange={(v) => setPhoto(i, v)} />)}
        </div>
      </Field>

      <div className="flex items-center gap-3">
        <button type="submit" className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-2.5 rounded-lg transition">
          <Plus size={16} /> Save Project
        </button>
        {saved && <span className="flex items-center gap-1 text-green-600 text-sm font-semibold"><CheckCircle size={15} /> Saved!</span>}
      </div>
    </form>
  );
}

// ─── Add Partner / Brand Form ─────────────────────────────────────────────────
const BLANK_BRAND = {
  sectionId: "solar-panels", name: "", logo: "", modelsText: "",
  photos: ["", "", "", "", ""],
};

function BrandForm({ onSaved }) {
  const [form, setForm] = useState({ ...BLANK_BRAND, photos: ["", "", "", "", ""] });
  const [saved, setSaved] = useState(false);
  const logoRef = useRef();

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })); }
  function setPhoto(i, v) {
    setForm((f) => { const p = [...f.photos]; p[i] = v; return { ...f, photos: p }; });
  }

  async function handleLogo(e) {
    const file = e.target.files[0];
    if (!file) return;
    try { set("logo", await compressImage(file, 400, 0.85)); } catch {}
    e.target.value = "";
  }

  function submit(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    addBrand({
      ...form,
      models: form.modelsText.split("\n").map((s) => s.trim()).filter(Boolean),
      photos: form.photos.filter(Boolean),
    });
    setForm({ ...BLANK_BRAND, photos: ["", "", "", "", ""] });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    onSaved();
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Partner Section" required>
          <select value={form.sectionId} onChange={(e) => set("sectionId", e.target.value)} className={inputCls}>
            {partnerSections.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
          </select>
        </Field>
        <Field label="Brand Name" required>
          <input value={form.name} onChange={(e) => set("name", e.target.value)} className={inputCls} placeholder="e.g. Jinko Solar" />
        </Field>
      </div>

      {/* Logo */}
      <Field label="Brand Logo" hint="Upload the brand logo image (will be shown on the partner card).">
        <div className="flex gap-3 items-start mt-1">
          {form.logo && (
            <div className="relative h-16 w-24 border rounded-lg overflow-hidden bg-gray-50 flex-shrink-0">
              <img src={form.logo} alt="" className="w-full h-full object-contain p-1" />
              <button type="button" onClick={() => set("logo", "")} className="absolute top-0.5 right-0.5 bg-red-600 text-white rounded-full w-4 h-4 flex items-center justify-center">
                <X size={9} />
              </button>
            </div>
          )}
          <div className="flex-1 space-y-2">
            <input type="file" ref={logoRef} accept="image/*" className="hidden" onChange={handleLogo} />
            <button type="button" onClick={() => logoRef.current.click()} className="flex items-center gap-2 border border-dashed border-gray-300 hover:border-blue-400 text-gray-500 hover:text-blue-600 rounded-lg px-4 py-2 text-sm transition">
              <Upload size={14} /> {form.logo ? "Replace logo" : "Upload logo"}
            </button>
            <input type="text" placeholder="or paste logo URL" value={form.logo.startsWith("data:") ? "" : form.logo} onChange={(e) => set("logo", e.target.value)} className={inputCls} />
          </div>
        </div>
      </Field>

      {/* Models */}
      <Field label="Models / Products" hint="Enter one model or product name per line.">
        <textarea
          value={form.modelsText}
          onChange={(e) => set("modelsText", e.target.value)}
          rows={4}
          className={cls(inputCls, "resize-none mt-1")}
          placeholder={"Tiger Neo N-Type 580W\nEagle G4 Series\nSwan Bifacial"}
        />
      </Field>

      {/* Product Photos */}
      <Field label="Product / Installation Photos (up to 5)" hint="Upload product photos or real installation photos. Shown as a gallery on the Partners page.">
        <div className="grid grid-cols-5 gap-2 mt-1">
          {form.photos.map((p, i) => <PhotoSlot key={i} n={i + 1} value={p} onChange={(v) => setPhoto(i, v)} />)}
        </div>
      </Field>

      <div className="flex items-center gap-3">
        <button type="submit" className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-2.5 rounded-lg transition">
          <Plus size={16} /> Save Brand
        </button>
        {saved && <span className="flex items-center gap-1 text-green-600 text-sm font-semibold"><CheckCircle size={15} /> Saved!</span>}
      </div>
    </form>
  );
}

// ─── Manage / Backup ──────────────────────────────────────────────────────────
function ManageData() {
  const [, refresh] = useState(0);
  const [msg, setMsg] = useState("");
  const fileRef = useRef();

  const projects = getStoredProjects();
  const brands   = getStoredBrands();
  const kb       = storageUsedKB();

  function flash(m) { setMsg(m); setTimeout(() => setMsg(""), 3000); }

  function doExport() {
    const blob = new Blob([exportAll()], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `cep-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  }

  function doImport(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ({ target: { result } }) => {
      try { importAll(result); flash("Imported successfully"); refresh((n) => n + 1); }
      catch { flash("Import failed — invalid file"); }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  return (
    <div className="space-y-8">
      {/* Warning */}
      <div className="flex gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
        <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
        <div className="text-sm text-amber-800">
          <strong>Important:</strong> All data is stored in this browser's local storage. It will be lost if you clear browser data or switch devices.
          <br />Use <strong>Export backup</strong> regularly to save a JSON file you can restore at any time.
        </div>
      </div>

      {/* Storage bar */}
      <div>
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Storage used: ~{kb} KB</span>
          <span>~5000 KB limit</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={cls("h-full rounded-full transition-all", kb > 4000 ? "bg-red-500" : kb > 2500 ? "bg-yellow-400" : "bg-green-500")}
            style={{ width: `${Math.min(100, (kb / 5000) * 100)}%` }}
          />
        </div>
        {kb > 4000 && <p className="text-red-600 text-xs mt-1">Storage almost full — use URL inputs instead of file uploads for new photos.</p>}
      </div>

      {/* Export / Import */}
      <div className="flex gap-3 flex-wrap items-center">
        <button onClick={doExport} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-bold transition">
          <Download size={15} /> Export backup
        </button>
        <input type="file" ref={fileRef} accept=".json" className="hidden" onChange={doImport} />
        <button onClick={() => fileRef.current.click()} className="flex items-center gap-2 border border-gray-300 hover:bg-gray-50 px-5 py-2.5 rounded-lg text-sm font-semibold transition">
          <Upload size={15} /> Import backup
        </button>
        {msg && <span className="flex items-center gap-1 text-green-600 text-sm font-semibold"><CheckCircle size={15} />{msg}</span>}
      </div>

      {/* Projects */}
      <div>
        <h3 className="font-black text-gray-700 mb-3">Added Projects ({projects.length})</h3>
        {projects.length === 0 ? (
          <p className="text-gray-400 text-sm">No projects added yet.</p>
        ) : (
          <div className="space-y-2">
            {projects.map((p) => {
              const cat = projectCategories.find((c) => c.id === p.categoryId);
              return (
                <div key={p._id} className="flex items-center justify-between border rounded-xl px-4 py-3 bg-white hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    {p.photos?.[0] && <img src={p.photos[0]} alt="" className="h-10 w-14 rounded-lg object-cover flex-shrink-0" />}
                    <div>
                      <p className="font-semibold text-sm">{p.title}</p>
                      <p className="text-xs text-gray-400">{cat?.badge} · {p.location} · {p.photos?.length || 0} photos · Added {p._date}</p>
                    </div>
                  </div>
                  <button onClick={() => { deleteProject(p._id); refresh((n) => n + 1); }} className="text-red-400 hover:text-red-600 p-1 ml-3">
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Brands */}
      <div>
        <h3 className="font-black text-gray-700 mb-3">Added Brands ({brands.length})</h3>
        {brands.length === 0 ? (
          <p className="text-gray-400 text-sm">No brands added yet.</p>
        ) : (
          <div className="space-y-2">
            {brands.map((b) => {
              const sec = partnerSections.find((s) => s.id === b.sectionId);
              return (
                <div key={b._id} className="flex items-center justify-between border rounded-xl px-4 py-3 bg-white hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    {b.logo && <img src={b.logo} alt="" className="h-10 w-14 object-contain rounded flex-shrink-0" />}
                    <div>
                      <p className="font-semibold text-sm">{b.name}</p>
                      <p className="text-xs text-gray-400">{sec?.title} · {b.photos?.filter(Boolean).length || 0} photos</p>
                    </div>
                  </div>
                  <button onClick={() => { deleteBrand(b._id); refresh((n) => n + 1); }} className="text-red-400 hover:text-red-600 p-1 ml-3">
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── AdminPage ────────────────────────────────────────────────────────────────
const TABS = [
  ["project", "Add Project"],
  ["brand",   "Add Partner / Brand"],
  ["manage",  "Manage & Backup"],
];

export default function AdminPage() {
  const [authed, setAuthed] = useState(isLoggedIn());
  const [tab, setTab]       = useState("project");
  const [, setTick]         = useState(0);

  if (!authed) return <LoginForm onLogin={() => setAuthed(true)} />;

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      {/* Top bar */}
      <div className="bg-white border-b shadow-sm px-6 py-4 flex items-center justify-between">
        <div>
          <span className="text-lg font-black text-gray-800">CEYLON <span className="text-yellow-600">ECO POWER</span></span>
          <span className="ml-3 text-sm text-gray-400">Admin Panel</span>
        </div>
        <button onClick={() => { logout(); setAuthed(false); }} className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-600 transition">
          <LogOut size={15} /> Logout
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-xl p-1 border shadow-sm mb-8 w-fit">
          {TABS.map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={cls(
                "px-5 py-2.5 rounded-lg text-sm font-semibold transition",
                tab === id ? "bg-yellow-500 text-white shadow" : "text-gray-500 hover:text-gray-800"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Panels */}
        <div className="bg-white rounded-2xl border shadow-sm p-8">
          {tab === "project" && (
            <>
              <h2 className="text-xl font-black text-gray-700 mb-6">Add Completed Project</h2>
              <ProjectForm onSaved={() => setTick((t) => t + 1)} />
            </>
          )}
          {tab === "brand" && (
            <>
              <h2 className="text-xl font-black text-gray-700 mb-6">Add Partner / Brand</h2>
              <BrandForm onSaved={() => setTick((t) => t + 1)} />
            </>
          )}
          {tab === "manage" && (
            <>
              <h2 className="text-xl font-black text-gray-700 mb-6">Manage & Backup</h2>
              <ManageData />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
