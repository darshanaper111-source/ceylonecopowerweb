import React, { useEffect, useRef, useState } from "react";
import {
  AlertTriangle, CheckCircle, Download, LogOut,
  Minus, PencilLine, Plus, Trash2, Upload, X, Loader,
} from "lucide-react";
import { isConfigured } from "../firebase/config.js";
import { fbProjects, fbBrands, fbProducts } from "../firebase/db.js";
import { uploadPhotos, previewUrl } from "../firebase/photos.js";
import {
  addBrand, addProject, deleteBrand, deleteProject,
  exportAll, getStoredBrands, getStoredProjects, importAll,
  isLoggedIn, login, logout, storageUsedKB,
} from "../data/storage.js";
import { projectCategories } from "../data/projects.js";
import { partnerSections }    from "../data/partners.js";
import AccessoriesTab          from "../admin/AccessoriesTab.jsx";
import BudgetCalcTab           from "../admin/BudgetCalcTab.jsx";
import MonitoringSitesTab      from "../admin/MonitoringSitesTab.jsx";
import QuotationTab            from "../admin/QuotationTab.jsx";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function cls(...p) { return p.filter(Boolean).join(" "); }
const inp = "w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100 bg-white";

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

// ─── Photo Slot (works with File objects + URL strings) ───────────────────────
function PhotoSlot({ n, value, onChange }) {
  const ref  = useRef();
  const isF  = value instanceof File;
  const prev = previewUrl(value);

  return (
    <div className="border rounded-xl overflow-hidden bg-gray-50 flex flex-col text-sm">
      {value ? (
        <div className="relative h-28 flex-shrink-0">
          <img src={prev} alt="" className="w-full h-full object-cover" />
          {isF && <div className="absolute bottom-1 left-1 bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded">Pending</div>}
          <button type="button" onClick={() => onChange("")} className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center"><X size={11} /></button>
        </div>
      ) : (
        <button type="button" onClick={() => ref.current.click()} className="h-28 flex flex-col items-center justify-center gap-1 text-gray-400 hover:bg-gray-100 transition">
          <Upload size={18} /><span className="text-xs">Photo {n}</span>
        </button>
      )}
      <div className="p-2 space-y-1 bg-white border-t">
        <input type="file" accept="image/*" ref={ref} className="hidden" onChange={(e) => { if (e.target.files[0]) onChange(e.target.files[0]); e.target.value = ""; }} />
        <button type="button" onClick={() => ref.current.click()} className="text-xs text-blue-600 hover:underline">{value ? "Replace" : "Upload"}</button>
        <input type="text" placeholder="or paste URL" value={isF ? "" : (value || "")} onChange={(e) => onChange(e.target.value)} className="w-full text-xs border rounded px-2 py-1 outline-none focus:border-blue-400" />
      </div>
    </div>
  );
}

// ─── Dynamic Specs Builder ────────────────────────────────────────────────────
function SpecsBuilder({ specs, onChange }) {
  function add()        { onChange([...specs, { key: "", value: "" }]); }
  function remove(i)    { onChange(specs.filter((_, j) => j !== i)); }
  function update(i, k, v) { const s = [...specs]; s[i] = { ...s[i], [k]: v }; onChange(s); }

  return (
    <div className="space-y-2">
      {specs.map((s, i) => (
        <div key={i} className="flex gap-2">
          <input value={s.key}   onChange={(e) => update(i, "key",   e.target.value)} placeholder="e.g. Power"    className={cls(inp, "flex-1")} />
          <input value={s.value} onChange={(e) => update(i, "value", e.target.value)} placeholder="e.g. 580 W"    className={cls(inp, "flex-1")} />
          <button type="button" onClick={() => remove(i)} className="text-red-400 hover:text-red-600 px-1"><Minus size={16} /></button>
        </div>
      ))}
      <button type="button" onClick={add} className="text-xs text-blue-600 hover:underline flex items-center gap-1"><Plus size={12} /> Add spec</button>
    </div>
  );
}

// ─── Login ────────────────────────────────────────────────────────────────────
function LoginForm({ onLogin }) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState(false);
  function submit(e) { e.preventDefault(); if (login(pw)) onLogin(); else { setErr(true); setPw(""); } }
  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 flex items-center justify-center">
      <form onSubmit={submit} className="bg-white rounded-2xl shadow-xl p-10 w-full max-w-sm space-y-5">
        <div className="text-center">
          <div className="text-xl font-black">CEYLON <span className="text-yellow-600">ECO POWER</span></div>
          <p className="text-gray-400 text-sm mt-1">Admin Panel</p>
        </div>
        <Field label="Password" required>
          <input type="password" value={pw} autoFocus onChange={(e) => { setPw(e.target.value); setErr(false); }} className={cls(inp, err && "border-red-400")} />
          {err && <p className="text-red-500 text-xs mt-1">Incorrect password</p>}
        </Field>
        <button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2.5 rounded-lg transition">Login</button>
      </form>
    </div>
  );
}

// ─── Firebase status banner ───────────────────────────────────────────────────
function FBBanner() {
  if (isConfigured) return (
    <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 text-sm text-green-800 mb-6">
      <CheckCircle size={15} className="text-green-500 shrink-0" />
      Firebase connected — photos saved to Firebase Storage, data to Firestore.
    </div>
  );
  return (
    <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 mb-6">
      <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
      <div>
        <strong>Firebase not connected.</strong> Falling back to browser localStorage (data lost on browser clear).<br />
        Add your credentials to a <code className="bg-amber-100 px-1 rounded">.env</code> file, then <strong>restart the dev server</strong>.
      </div>
    </div>
  );
}

// ─── Add / Edit Project Form ──────────────────────────────────────────────────
const BLANK_P = { categoryId:"utility", title:"", location:"", acCapacity:"", dcCapacity:"", client:"", details:"" };

function ProjectForm({ editing, onSaved, onCancel }) {
  const padPhotos = (arr) => [...(arr || []), "", "", "", "", ""].slice(0, 5);
  const [form, setForm] = useState(
    editing
      ? { categoryId:editing.categoryId||"utility", title:editing.title||"", location:editing.location||"",
          acCapacity:editing.acCapacity||"", dcCapacity:editing.dcCapacity||"",
          client:editing.client||"", details:editing.details||"",
          photos: padPhotos(editing.photos) }
      : { ...BLANK_P, photos: ["","","","",""] }
  );
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);
  const [err,    setErr]    = useState("");

  function set(k, v)   { setForm((f) => ({ ...f, [k]: v })); }
  function setP(i, v)  { setForm((f) => { const p=[...f.photos]; p[i]=v; return {...f,photos:p}; }); }

  async function submit(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.location.trim()) { setErr("Title and Location are required."); return; }
    setSaving(true); setErr("");
    try {
      const data = { categoryId:form.categoryId, title:form.title, location:form.location,
                     acCapacity:form.acCapacity, dcCapacity:form.dcCapacity,
                     client:form.client, details:form.details };
      if (isConfigured) {
        if (editing) {
          const urls = await uploadPhotos(`projects/${editing._fbId}`, form.photos);
          await fbProjects.update(editing._fbId, { ...data, photos: urls });
        } else {
          const docRef = await fbProjects.add({ ...data, photos: [] });
          const urls   = await uploadPhotos(`projects/${docRef.id}`, form.photos);
          await fbProjects.update(docRef.id, { photos: urls });
        }
      } else {
        addProject({ ...data, photos: form.photos.filter((p) => p && typeof p === "string") });
      }
      setSaved(true); setTimeout(() => setSaved(false), 2500);
      onSaved();
    } catch (e) { setErr(e.message); }
    finally { setSaving(false); }
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      {editing && (
        <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
          <p className="text-blue-800 text-sm font-semibold">Editing: <span className="font-black">{editing.title}</span></p>
          <button type="button" onClick={onCancel} className="text-xs text-blue-600 hover:text-red-600 border border-blue-200 rounded-lg px-3 py-1.5">Cancel edit</button>
        </div>
      )}
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Category" required>
          <select value={form.categoryId} onChange={(e) => set("categoryId", e.target.value)} className={inp}>
            {projectCategories.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </Field>
        <Field label="Project Title" required><input value={form.title} onChange={(e) => set("title", e.target.value)} className={inp} placeholder="Hotel Rooftop 500 kW" /></Field>
        <Field label="Location" required><input value={form.location} onChange={(e) => set("location", e.target.value)} className={inp} placeholder="Colombo, Sri Lanka" /></Field>
        <Field label="Client"><input value={form.client} onChange={(e) => set("client", e.target.value)} className={inp} placeholder="Private Company" /></Field>
        <Field label="AC Capacity"><input value={form.acCapacity} onChange={(e) => set("acCapacity", e.target.value)} className={inp} placeholder="500 kW" /></Field>
        <Field label="DC Capacity"><input value={form.dcCapacity} onChange={(e) => set("dcCapacity", e.target.value)} className={inp} placeholder="570 kWp" /></Field>
      </div>
      <Field label="Project Details"><textarea value={form.details} onChange={(e) => set("details", e.target.value)} rows={3} className={cls(inp,"resize-none")} placeholder="Description..." /></Field>
      <Field label="Photos (up to 5)" hint={isConfigured ? "Existing photos shown. Upload new files to replace individual slots." : "Paste image URLs."}>
        <div className="grid grid-cols-5 gap-2 mt-1">
          {form.photos.map((p,i) => <PhotoSlot key={i} n={i+1} value={p} onChange={(v) => setP(i,v)} />)}
        </div>
      </Field>
      {err && <p className="text-red-600 text-sm">{err}</p>}
      <div className="flex items-center gap-3">
        <button type="submit" disabled={saving} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-bold px-6 py-2.5 rounded-lg transition">
          {saving ? <><Loader size={15} className="animate-spin" /> Saving…</> : editing ? <><CheckCircle size={15} /> Update Project</> : <><Plus size={15} /> Save Project</>}
        </button>
        {editing && <button type="button" onClick={onCancel} className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2">Cancel</button>}
        {saved && <span className="flex items-center gap-1 text-green-600 text-sm"><CheckCircle size={15} /> {editing ? "Updated!" : "Saved!"}</span>}
      </div>
    </form>
  );
}

// ─── Add / Edit Brand / Partner Form ─────────────────────────────────────────
const BLANK_B = { sectionId:"solar-panels", name:"", logo:"", modelsText:"" };

function BrandForm({ editing, onSaved, onCancel }) {
  const padPhotos = (arr) => [...(arr || []), "", "", "", "", ""].slice(0, 5);
  const [form, setForm] = useState(
    editing
      ? { sectionId:editing.sectionId||"solar-panels", name:editing.name||"",
          logo: editing.logo||"",
          modelsText: (editing.models||[]).join("\n"),
          photos: padPhotos(editing.photos) }
      : { ...BLANK_B, photos: ["","","","",""] }
  );
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);
  const [err,    setErr]    = useState("");
  const logoRef = useRef();

  function set(k, v)  { setForm((f) => ({ ...f, [k]: v })); }
  function setP(i, v) { setForm((f) => { const p=[...f.photos]; p[i]=v; return {...f,photos:p}; }); }

  async function handleLogo(e) {
    const file = e.target.files[0];
    if (file) set("logo", file);
    e.target.value = "";
  }

  async function submit(e) {
    e.preventDefault();
    if (!form.name.trim()) { setErr("Brand name is required."); return; }
    setSaving(true); setErr("");
    try {
      const models = form.modelsText.split("\n").map((s) => s.trim()).filter(Boolean);
      const data   = { sectionId: form.sectionId, name: form.name, models };

      if (isConfigured) {
        if (editing) {
          const logoUrl = form.logo instanceof File
            ? (await uploadPhotos(`brands/${editing._fbId}`, [form.logo]))[0] || ""
            : (form.logo || "");
          const urls = await uploadPhotos(`brands/${editing._fbId}`, form.photos);
          await fbBrands.update(editing._fbId, { ...data, logo: logoUrl, photos: urls });
        } else {
          const docRef  = await fbBrands.add({ ...data, logo: "", photos: [] });
          const logoUrl = form.logo instanceof File ? (await uploadPhotos(`brands/${docRef.id}`, [form.logo]))[0] || "" : (form.logo || "");
          const urls    = await uploadPhotos(`brands/${docRef.id}`, form.photos);
          await fbBrands.update(docRef.id, { logo: logoUrl, photos: urls });
        }
      } else {
        const logoVal = form.logo instanceof File ? "" : (form.logo || "");
        addBrand({ ...data, logo: logoVal, photos: form.photos.filter((p) => p && typeof p === "string") });
      }

      setSaved(true); setTimeout(() => setSaved(false), 2500);
      onSaved();
    } catch (e) { setErr(e.message); }
    finally { setSaving(false); }
  }

  const logoPreview = previewUrl(form.logo);

  return (
    <form onSubmit={submit} className="space-y-6">
      {editing && (
        <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
          <p className="text-blue-800 text-sm font-semibold">Editing: <span className="font-black">{editing.name}</span></p>
          <button type="button" onClick={onCancel} className="text-xs text-blue-600 hover:text-red-600 border border-blue-200 rounded-lg px-3 py-1.5">Cancel edit</button>
        </div>
      )}
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Partner Section" required>
          <select value={form.sectionId} onChange={(e) => set("sectionId", e.target.value)} className={inp}>
            {partnerSections.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
          </select>
        </Field>
        <Field label="Brand Name" required><input value={form.name} onChange={(e) => set("name", e.target.value)} className={inp} placeholder="e.g. Jinko Solar" /></Field>
      </div>

      <Field label="Brand Logo" hint={editing ? "Current logo shown. Upload a new file to replace it." : "Upload logo image."}>
        <div className="flex gap-3 items-start mt-1">
          {logoPreview && (
            <div className="relative h-16 w-24 border rounded-lg overflow-hidden bg-gray-50 shrink-0">
              <img src={logoPreview} alt="" className="w-full h-full object-contain p-1" />
              <button type="button" onClick={() => set("logo", "")} className="absolute top-0.5 right-0.5 bg-red-600 text-white rounded-full w-4 h-4 flex items-center justify-center"><X size={9} /></button>
            </div>
          )}
          <div className="flex-1 space-y-2">
            <input type="file" ref={logoRef} accept="image/*" className="hidden" onChange={handleLogo} />
            <button type="button" onClick={() => logoRef.current.click()} className="flex items-center gap-2 border border-dashed border-gray-300 hover:border-blue-400 text-gray-500 hover:text-blue-600 rounded-lg px-4 py-2 text-sm transition">
              <Upload size={14} /> {logoPreview ? "Replace logo" : "Upload logo"}
            </button>
            <input type="text" placeholder="or paste logo URL" value={(form.logo instanceof File) ? "" : (form.logo || "")} onChange={(e) => set("logo", e.target.value)} className={inp} />
          </div>
        </div>
      </Field>

      <Field label="Models / Products" hint="One per line.">
        <textarea value={form.modelsText} onChange={(e) => set("modelsText", e.target.value)} rows={4} className={cls(inp,"resize-none mt-1")} placeholder={"Tiger Neo N-Type 580W\nEagle G4 Series"} />
      </Field>

      <Field label="Product / Installation Photos (up to 5)" hint={editing ? "Existing photos shown. Upload new files to replace individual slots." : isConfigured ? "Uploaded to Firebase Storage." : "Paste URLs."}>
        <div className="grid grid-cols-5 gap-2 mt-1">
          {form.photos.map((p,i) => <PhotoSlot key={i} n={i+1} value={p} onChange={(v) => setP(i,v)} />)}
        </div>
      </Field>

      {err && <p className="text-red-600 text-sm">{err}</p>}
      <div className="flex items-center gap-3">
        <button type="submit" disabled={saving} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-bold px-6 py-2.5 rounded-lg transition">
          {saving ? <><Loader size={15} className="animate-spin" /> Saving…</> : editing ? <><CheckCircle size={15} /> Update Brand</> : <><Plus size={15} /> Save Brand</>}
        </button>
        {editing && <button type="button" onClick={onCancel} className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2">Cancel</button>}
        {saved && <span className="flex items-center gap-1 text-green-600 text-sm"><CheckCircle size={15} /> {editing ? "Updated!" : "Saved!"}</span>}
      </div>
    </form>
  );
}

// ─── Add / Edit Shop Product Form ────────────────────────────────────────────
const PRODUCT_CATS = [
  { id:"panels",           label:"Solar Panels" },
  { id:"string-inverters", label:"String Inverters" },
  { id:"hybrid-inverters", label:"Hybrid Inverters" },
  { id:"batteries",        label:"Batteries" },
  { id:"structure",        label:"Aluminium Structure" },
  { id:"cable",            label:"DC Solar Cable" },
];
const PRICE_UNITS = ["per panel","per unit","per kWh","per metre","per roll","per set"];

const BLANK_PROD = { category:"panels", brand:"", model:"", price:"", priceUnit:"per unit", description:"", specs:[], inStock:true, featured:false };

function ProductForm({ editing, onSaved, onCancel }) {
  const padPhotos = (arr) => [...(arr || []), "", "", "", "", ""].slice(0, 5);
  const [form, setForm] = useState(
    editing
      ? { category:editing.category||"panels", brand:editing.brand||"", model:editing.model||"",
          price: editing.price != null ? String(editing.price) : "",
          priceUnit:editing.priceUnit||"per unit", description:editing.description||"",
          specs: editing.specs || [],
          inStock: editing.inStock ?? true, featured: editing.featured ?? false,
          photos: padPhotos(editing.photos) }
      : { ...BLANK_PROD, specs:[], photos:["","","","",""] }
  );
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);
  const [err,    setErr]    = useState("");

  function set(k, v)  { setForm((f) => ({ ...f, [k]: v })); }
  function setP(i, v) { setForm((f) => { const p=[...f.photos]; p[i]=v; return {...f,photos:p}; }); }

  async function submit(e) {
    e.preventDefault();
    if (!form.brand.trim() || !form.model.trim()) { setErr("Brand and Model are required."); return; }
    if (!isConfigured) { setErr("Firebase must be configured to save shop products."); return; }
    setSaving(true); setErr("");
    try {
      const data = {
        category: form.category, brand: form.brand, model: form.model,
        price: form.price ? Number(form.price) : null,
        priceUnit: form.priceUnit, description: form.description,
        specs: form.specs.filter((s) => s.key && s.value),
        inStock: form.inStock, featured: form.featured,
      };
      if (editing) {
        const urls = await uploadPhotos(`products/${editing._fbId}`, form.photos);
        await fbProducts.update(editing._fbId, { ...data, photos: urls });
      } else {
        const docRef = await fbProducts.add({ ...data, photos: [] });
        const urls   = await uploadPhotos(`products/${docRef.id}`, form.photos);
        await fbProducts.update(docRef.id, { photos: urls });
      }

      setSaved(true); setTimeout(() => setSaved(false), 2500);
      onSaved();
    } catch (e) { setErr(e.message); }
    finally { setSaving(false); }
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      {editing && (
        <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
          <p className="text-blue-800 text-sm font-semibold">Editing: <span className="font-black">{editing.brand} — {editing.model}</span></p>
          <button type="button" onClick={onCancel} className="text-xs text-blue-600 hover:text-red-600 border border-blue-200 rounded-lg px-3 py-1.5">Cancel edit</button>
        </div>
      )}
      {!isConfigured && (
        <div className="flex gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-700">
          <AlertTriangle size={15} className="shrink-0 mt-0.5" /> Shop products require Firebase. Add credentials to .env first.
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Category" required>
          <select value={form.category} onChange={(e) => set("category", e.target.value)} className={inp}>
            {PRODUCT_CATS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </Field>
        <Field label="Brand" required><input value={form.brand} onChange={(e) => set("brand", e.target.value)} className={inp} placeholder="Jinko Solar" /></Field>
        <Field label="Model Name" required><input value={form.model} onChange={(e) => set("model", e.target.value)} className={inp} placeholder="Tiger Neo N-Type 580W" /></Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Price (LKR)" hint="Leave blank = Request for Price">
            <input type="number" min="0" value={form.price} onChange={(e) => set("price", e.target.value)} className={inp} placeholder="45000" />
          </Field>
          <Field label="Unit">
            <select value={form.priceUnit} onChange={(e) => set("priceUnit", e.target.value)} className={inp}>
              {PRICE_UNITS.map((u) => <option key={u}>{u}</option>)}
            </select>
          </Field>
        </div>
      </div>

      <Field label="Description">
        <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} className={cls(inp,"resize-none")} placeholder="Product description..." />
      </Field>

      <Field label="Specifications" hint="Add key specs shown on the product card.">
        <div className="mt-1"><SpecsBuilder specs={form.specs} onChange={(s) => set("specs", s)} /></div>
      </Field>

      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
          <input type="checkbox" checked={form.inStock} onChange={(e) => set("inStock", e.target.checked)} className="w-4 h-4 accent-green-600" />
          In Stock
        </label>
        <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
          <input type="checkbox" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} className="w-4 h-4 accent-yellow-500" />
          Featured
        </label>
      </div>

      <Field label="Product Photos (up to 5)" hint={editing ? "Existing photos shown. Upload new files to replace individual slots." : "Uploaded to Firebase Storage."}>
        <div className="grid grid-cols-5 gap-2 mt-1">
          {form.photos.map((p,i) => <PhotoSlot key={i} n={i+1} value={p} onChange={(v) => setP(i,v)} />)}
        </div>
      </Field>

      {err && <p className="text-red-600 text-sm">{err}</p>}
      <div className="flex items-center gap-3">
        <button type="submit" disabled={saving || !isConfigured} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-bold px-6 py-2.5 rounded-lg transition">
          {saving ? <><Loader size={15} className="animate-spin" /> Saving…</> : editing ? <><CheckCircle size={15} /> Update Product</> : <><Plus size={15} /> Save Product</>}
        </button>
        {editing && <button type="button" onClick={onCancel} className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2">Cancel</button>}
        {saved && <span className="flex items-center gap-1 text-green-600 text-sm"><CheckCircle size={15} /> {editing ? "Updated!" : "Saved!"}</span>}
      </div>
    </form>
  );
}

// ─── Manage & Backup ──────────────────────────────────────────────────────────
function ManageData({ onEditProject, onEditBrand, onEditProduct }) {
  const [, refresh] = useState(0);
  const [fbProjList, setFbProjList] = useState([]);
  const [fbBrandList, setFbBrandList] = useState([]);
  const [fbProdList, setFbProdList] = useState([]);
  const [fbError, setFbError] = useState("");
  const [msg, setMsg] = useState("");
  const fileRef = useRef();

  function loadFirebase() {
    if (!isConfigured) return;
    setFbError("");
    Promise.all([
      fbProjects.getAll(),
      fbBrands.getAll(),
      fbProducts.getAll(),
    ]).then(([p, b, pr]) => {
      setFbProjList(p);
      setFbBrandList(b);
      setFbProdList(pr);
    }).catch((e) => setFbError(e.message || String(e)));
  }

  useEffect(() => { loadFirebase(); }, []);

  const lsProjects = getStoredProjects();
  const lsBrands   = getStoredBrands();
  const kb         = storageUsedKB();

  function flash(m) { setMsg(m); setTimeout(() => setMsg(""), 3000); }

  function doExport() {
    const blob = new Blob([exportAll()], { type: "application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = `cep-backup-${new Date().toISOString().slice(0,10)}.json`; a.click();
  }
  function doImport(e) {
    const file = e.target.files[0]; if (!file) return;
    const r = new FileReader();
    r.onload = ({ target:{result} }) => { try { importAll(result); flash("Imported"); refresh((n)=>n+1); } catch { flash("Import failed"); } };
    r.readAsText(file); e.target.value = "";
  }

  return (
    <div className="space-y-8">
      {/* Firebase read error */}
      {fbError && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-800">
          <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <strong>Firebase read failed:</strong> {fbError}
            <div className="mt-2 text-red-700 text-xs leading-relaxed">
              Most likely cause: <strong>Firestore security rules</strong> are blocking reads.<br />
              Go to <strong>Firebase Console → Firestore → Rules</strong> and set:<br />
              <code className="block mt-1 bg-red-100 px-2 py-1 rounded font-mono">allow read, write: if true;</code>
              Also check <strong>Storage → Rules</strong> for the same fix.
            </div>
          </div>
          <button onClick={loadFirebase} className="text-xs font-bold text-red-600 hover:text-red-800 border border-red-300 rounded-lg px-3 py-1.5 shrink-0">Retry</button>
        </div>
      )}

      {/* LocalStorage notice */}
      <div className="flex gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
        <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
        <div><strong>Browser data</strong> is lost if you clear browser cache. Use <strong>Export backup</strong> regularly.</div>
      </div>

      {/* Storage bar (LS) */}
      <div>
        <div className="flex justify-between text-xs text-gray-500 mb-1"><span>Browser storage: ~{kb} KB</span><span>~5000 KB limit</span></div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className={cls("h-full rounded-full", kb>4000?"bg-red-500":kb>2500?"bg-yellow-400":"bg-green-500")} style={{width:`${Math.min(100,(kb/5000)*100)}%`}} />
        </div>
      </div>

      {/* Export/Import */}
      <div className="flex gap-3 flex-wrap items-center">
        <button onClick={doExport} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-bold transition"><Download size={14} /> Export backup (JSON)</button>
        <input type="file" ref={fileRef} accept=".json" className="hidden" onChange={doImport} />
        <button onClick={() => fileRef.current.click()} className="flex items-center gap-2 border border-gray-300 hover:bg-gray-50 px-5 py-2.5 rounded-lg text-sm font-semibold transition"><Upload size={14} /> Import backup</button>
        {msg && <span className="flex items-center gap-1 text-green-600 text-sm"><CheckCircle size={14} />{msg}</span>}
      </div>

      {/* Firebase projects */}
      {isConfigured && (
        <div>
          <h3 className="font-black text-gray-700 mb-3">Firebase Projects ({fbProjList.length})</h3>
          {fbProjList.length === 0 ? <p className="text-gray-400 text-sm">None yet.</p> : (
            <div className="space-y-2">
              {fbProjList.map((p) => (
                <div key={p._fbId} className="flex items-center justify-between border rounded-xl px-4 py-3 bg-white">
                  <div className="flex items-center gap-3">
                    {p.photos?.[0] && <img src={p.photos[0]} alt="" className="h-10 w-14 rounded-lg object-cover shrink-0" />}
                    <div><p className="font-semibold text-sm">{p.title}</p><p className="text-xs text-gray-400">{p.location} · {p.photos?.length||0} photos</p></div>
                  </div>
                  <div className="flex items-center gap-1 ml-3">
                    <button onClick={() => onEditProject && onEditProject(p)} title="Edit" className="text-blue-400 hover:text-blue-600 p-1.5 rounded-lg hover:bg-blue-50 transition"><PencilLine size={16} /></button>
                    <button onClick={async () => { await fbProjects.remove(p._fbId); setFbProjList((l) => l.filter((x) => x._fbId !== p._fbId)); }} title="Delete" className="text-red-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Firebase brands */}
      {isConfigured && (
        <div>
          <h3 className="font-black text-gray-700 mb-3">Firebase Brands ({fbBrandList.length})</h3>
          {fbBrandList.length === 0 ? <p className="text-gray-400 text-sm">None yet.</p> : (
            <div className="space-y-2">
              {fbBrandList.map((b) => (
                <div key={b._fbId} className="flex items-center justify-between border rounded-xl px-4 py-3 bg-white">
                  <div className="flex items-center gap-3">
                    {b.logo && <img src={b.logo} alt="" className="h-10 w-14 object-contain rounded shrink-0" />}
                    <div><p className="font-semibold text-sm">{b.name}</p><p className="text-xs text-gray-400">{b.sectionId} · {b.photos?.length||0} photos</p></div>
                  </div>
                  <div className="flex items-center gap-1 ml-3">
                    <button onClick={() => onEditBrand && onEditBrand(b)} title="Edit" className="text-blue-400 hover:text-blue-600 p-1.5 rounded-lg hover:bg-blue-50 transition"><PencilLine size={16} /></button>
                    <button onClick={async () => { await fbBrands.remove(b._fbId); setFbBrandList((l) => l.filter((x) => x._fbId !== b._fbId)); }} title="Delete" className="text-red-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Firebase products */}
      {isConfigured && (
        <div>
          <h3 className="font-black text-gray-700 mb-3">Shop Products ({fbProdList.length})</h3>
          {fbProdList.length === 0 ? <p className="text-gray-400 text-sm">None yet.</p> : (
            <div className="space-y-2">
              {fbProdList.map((p) => (
                <div key={p._fbId} className="flex items-center justify-between border rounded-xl px-4 py-3 bg-white">
                  <div className="flex items-center gap-3">
                    {p.photos?.[0] && <img src={p.photos[0]} alt="" className="h-10 w-14 rounded-lg object-cover shrink-0" />}
                    <div>
                      <p className="font-semibold text-sm">{p.brand} — {p.model}</p>
                      <p className="text-xs text-gray-400">{p.category} · {p.price ? `LKR ${Number(p.price).toLocaleString()}` : "Price on request"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-3">
                    <button onClick={() => onEditProduct && onEditProduct(p)} title="Edit" className="text-blue-400 hover:text-blue-600 p-1.5 rounded-lg hover:bg-blue-50 transition"><PencilLine size={16} /></button>
                    <button onClick={async () => { await fbProducts.remove(p._fbId); setFbProdList((l) => l.filter((x) => x._fbId !== p._fbId)); }} title="Delete" className="text-red-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* LS items */}
      <div>
        <h3 className="font-black text-gray-700 mb-3">Browser-stored Projects ({lsProjects.length})</h3>
        {lsProjects.length === 0 ? <p className="text-gray-400 text-sm">None.</p> : (
          <div className="space-y-2">
            {lsProjects.map((p) => (
              <div key={p._id} className="flex items-center justify-between border rounded-xl px-4 py-3 bg-white">
                <div><p className="font-semibold text-sm">{p.title}</p><p className="text-xs text-gray-400">{p.location}</p></div>
                <button onClick={() => { deleteProject(p._id); refresh((n)=>n+1); }} className="text-red-400 hover:text-red-600 p-1 ml-3"><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── AdminPage ────────────────────────────────────────────────────────────────
const TABS = [
  ["project",    "Add Project"],
  ["brand",      "Add Partner"],
  ["product",    "Add Shop Product"],
  ["manage",     "Manage & Backup"],
  ["accessories","Accessories & Prices"],
  ["budget",     "Budget Calculator"],
  ["monitoring", "Monitoring Sites"],
  ["quotation",  "Quotations"],
];

export default function AdminPage() {
  const [authed, setAuthed]               = useState(isLoggedIn());
  const [tab, setTab]                     = useState("project");
  const [, setTick]                       = useState(0);
  const [pendingBudget, setPendingBudget] = useState(null);
  const [editingProject, setEditingProject] = useState(null);
  const [editingBrand,   setEditingBrand]   = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);

  if (!authed) return <LoginForm onLogin={() => setAuthed(true)} />;

  const tabLabel = (id) => {
    if (id === "project") return editingProject ? "Edit Project"  : "Add Project";
    if (id === "brand")   return editingBrand   ? "Edit Partner"  : "Add Partner";
    if (id === "product") return editingProduct ? "Edit Product"  : "Add Shop Product";
    return TABS.find(([tid]) => tid === id)?.[1] ?? id;
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      {/* Top bar */}
      <div className="bg-white border-b shadow-sm px-6 py-4 flex items-center justify-between">
        <div>
          <span className="text-lg font-black">CEYLON <span className="text-yellow-600">ECO POWER</span></span>
          <span className="ml-3 text-sm text-gray-400">Admin Panel</span>
        </div>
        <button onClick={() => { logout(); setAuthed(false); }} className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-600 transition">
          <LogOut size={15} /> Logout
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">
        <FBBanner />

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-xl p-1 border shadow-sm mb-8 flex-wrap">
          {TABS.map(([id]) => (
            <button key={id} onClick={() => setTab(id)} className={cls("px-5 py-2.5 rounded-lg text-sm font-semibold transition", tab===id ? "bg-yellow-500 text-white shadow" : "text-gray-500 hover:text-gray-800")}>
              {tabLabel(id)}
            </button>
          ))}
        </div>

        <div className={tab === "budget" ? "" : "bg-white rounded-2xl border shadow-sm p-8"}>
          {tab === "project" && (
            <>
              <h2 className="text-xl font-black text-gray-700 mb-6">{editingProject ? "Edit Project" : "Add Completed Project"}</h2>
              <ProjectForm
                key={editingProject?._fbId ?? "new-project"}
                editing={editingProject}
                onSaved={() => { setTick((t)=>t+1); setEditingProject(null); }}
                onCancel={() => setEditingProject(null)}
              />
            </>
          )}
          {tab === "brand" && (
            <>
              <h2 className="text-xl font-black text-gray-700 mb-6">{editingBrand ? "Edit Partner / Brand" : "Add Partner / Brand"}</h2>
              <BrandForm
                key={editingBrand?._fbId ?? "new-brand"}
                editing={editingBrand}
                onSaved={() => { setTick((t)=>t+1); setEditingBrand(null); }}
                onCancel={() => setEditingBrand(null)}
              />
            </>
          )}
          {tab === "product" && (
            <>
              <h2 className="text-xl font-black text-gray-700 mb-6">{editingProduct ? "Edit Shop Product" : "Add Shop Product"}</h2>
              <ProductForm
                key={editingProduct?._fbId ?? "new-product"}
                editing={editingProduct}
                onSaved={() => { setTick((t)=>t+1); setEditingProduct(null); }}
                onCancel={() => setEditingProduct(null)}
              />
            </>
          )}
          {tab === "manage"      && (
            <>
              <h2 className="text-xl font-black text-gray-700 mb-6">Manage & Backup</h2>
              <ManageData
                onEditProject={(p) => { setEditingProject(p); setTab("project"); }}
                onEditBrand={(b)   => { setEditingBrand(b);   setTab("brand"); }}
                onEditProduct={(p) => { setEditingProduct(p); setTab("product"); }}
              />
            </>
          )}
          {tab === "accessories" && <><h2 className="text-xl font-black text-gray-700 mb-6">Accessories & Price Catalog</h2><AccessoriesTab /></>}
          {tab === "budget"      && (
            <BudgetCalcTab
              onGenerateQuotation={(data) => { setPendingBudget(data); setTab("quotation"); }}
            />
          )}
          {tab === "monitoring"  && <><h2 className="text-xl font-black text-gray-700 mb-6">Monitoring Sites</h2><MonitoringSitesTab /></>}
          {tab === "quotation"   && (
            <>
              <h2 className="text-xl font-black text-gray-700 mb-6">Customer Quotations</h2>
              <QuotationTab
                budgetImport={pendingBudget}
                onBudgetImportDone={() => setPendingBudget(null)}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
