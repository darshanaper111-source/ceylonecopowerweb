import React, { useState, useEffect } from "react";
import {
  FileText, Save, Plus, Trash2, CheckCircle,
  Loader, Eye, ChevronDown, ChevronUp, RefreshCw, PencilLine, X,
} from "lucide-react";
import { fbQuotations } from "../firebase/db.js";
import { isConfigured } from "../firebase/config.js";
import { PROJECT_TYPES } from "./BudgetCalcTab.jsx";

// ─── Helpers ───────────────────────────────────────────────────────────────────
function cls(...a) { return a.filter(Boolean).join(" "); }
function fmt(n) { return Math.round(n).toLocaleString("en-LK"); }
function todayStr() { return new Date().toISOString().slice(0, 10); }
function newQuoteNo() {
  const d = new Date();
  return `CEP-${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}-${String(Math.floor(Math.random() * 900) + 100)}`;
}

const inp  = "border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 bg-white w-full text-gray-800";
const sinp = "border rounded-lg px-2 py-1.5 text-xs outline-none focus:border-blue-400 bg-white text-gray-800 w-full";

// ─── Defaults ─────────────────────────────────────────────────────────────────
const DEFAULT_WARRANTY = [
  { item: "Solar Panels",             term: "25-year linear performance warranty + 12-year product warranty" },
  { item: "Inverter",                 term: "5-year manufacturer warranty (extendable to 10 years)" },
  { item: "Battery System",           term: "10-year capacity warranty (≥80% capacity retention)" },
  { item: "Aluminium Structure",      term: "10-year structural warranty" },
  { item: "Installation Workmanship", term: "1-year workmanship warranty" },
];

const DEFAULT_SERVICES = [
  "Free system commissioning and customer handover training",
  "CEB net-metering application registration assistance",
  "1-year free maintenance and inspection visit",
  "Remote monitoring setup (WiFi / app) and support",
  "24/7 technical support hotline",
  "Annual solar performance report",
];

const DEFAULT_TERMS = [
  "Quotation valid for 30 days from date of issue",
  "50% advance payment required upon order confirmation",
  "Balance due upon system commissioning",
  "Estimated installation: 2–4 weeks from order confirmation",
  "Prices subject to change if site conditions differ from initial assessment",
  "Customer is responsible for ensuring electrical panel readiness",
];

function defaultEquipment(type) {
  const isBESS = type.endsWith("bess");
  return [
    { id: "eq1", cat: "panels",   label: "Solar Panels",            brand: "", spec: "", qty: 1,  unit: "units" },
    { id: "eq2", cat: "inverter", label: "Inverter",                 brand: "", spec: "", qty: 1,  unit: "unit"  },
    ...(isBESS ? [{ id: "eq3", cat: "battery", label: "Battery System", brand: "", spec: "", qty: 1, unit: "unit" }] : []),
    { id: "eq4", cat: "bos",       label: "Balance of System (BOS)", brand: "", spec: "DC/AC cables, MC4, mounting structure, earthing, SPD, breakers, energy meter, WiFi logger", qty: 1, unit: "set"  },
    { id: "eq5", cat: "labor",     label: "Installation & Labor",    brand: "", spec: "", qty: 1, unit: "lump" },
    { id: "eq6", cat: "logistics", label: "Logistics & Transport",   brand: "", spec: "", qty: 1, unit: "trip" },
  ];
}

// ─── PDF HTML Generator ───────────────────────────────────────────────────────
function generateHTML(q) {
  const total     = q.pricing?.totalPrice ?? 0;
  const discAmt   = total * ((q.pricing?.discountPct ?? 0) / 100);
  const final     = total - discAmt;
  const typeLabel = PROJECT_TYPES.find((t) => t.id === q.system?.type)?.label || q.system?.type || "";
  const fmtH      = (n) => Math.round(n).toLocaleString("en-LK");

  const eqRows = (q.equipment ?? [])
    .filter((r) => r.label || r.brand)
    .map((r) => {
      const desc = [r.label, r.brand && `(${r.brand})`, r.spec].filter(Boolean).join(" — ");
      return `<tr>
        <td class="td-desc">${desc}</td>
        <td class="td-center">${r.qty}</td>
        <td class="td-center">${r.unit}</td>
      </tr>`;
    }).join("");

  const warRows = (q.warranty ?? [])
    .filter((w) => w.item && w.term)
    .map((w) => `<tr><td class="td-war-item">${w.item}</td><td class="td-war-term">${w.term}</td></tr>`)
    .join("");

  const svcList  = (q.services ?? []).filter(Boolean).map((s) => `<li>${s}</li>`).join("");
  const termList = (q.terms ?? []).filter(Boolean).map((t) => `<li>${t}</li>`).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>Quotation ${q.quoteNo} — Ceylon Eco Power</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Segoe UI',Arial,sans-serif;font-size:13px;color:#1f2937;background:#fff}
  @media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}.no-print{display:none!important}@page{margin:12mm 16mm}}
  .page{max-width:820px;margin:0 auto;padding:28px 36px 40px}
  .hdr{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #0D3B2E;padding-bottom:16px;margin-bottom:20px}
  .logo{font-size:22px;font-weight:900;color:#0D3B2E}.logo span{color:#D4AF37}
  .logo-sub{font-size:9px;letter-spacing:3px;color:#6b7280;text-transform:uppercase;margin-top:3px}
  .contact{text-align:right;font-size:11px;color:#6b7280;line-height:1.8}
  .band{background:#0D3B2E;color:#fff;padding:11px 18px;border-radius:8px;margin-bottom:20px;display:flex;justify-content:space-between;align-items:center}
  .band h1{font-size:15px;font-weight:900;letter-spacing:1px;text-transform:uppercase}
  .band-meta{text-align:right;font-size:11px;line-height:1.9}.band-meta strong{color:#D4AF37}
  .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px}
  .info-box{border:1px solid #e5e7eb;border-radius:8px;padding:13px 15px}
  .info-box-title{font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:2px;color:#D4AF37;border-bottom:1px solid #f3f4f6;padding-bottom:6px;margin-bottom:9px}
  .ir{display:flex;gap:6px;margin-bottom:4px;font-size:12px}.il{font-weight:600;color:#6b7280;min-width:95px;flex-shrink:0}.iv{color:#1f2937}
  .sec-title{font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:2px;color:#0D3B2E;border-bottom:2px solid #D4AF37;padding-bottom:5px;margin:20px 0 12px}
  table{width:100%;border-collapse:collapse;margin-bottom:16px;font-size:12px}
  .th{background:#0D3B2E;color:#fff;padding:9px 11px;font-weight:700;font-size:11px;letter-spacing:.5px;text-align:left}.th-c{text-align:center}
  tbody tr:nth-child(even){background:#f9fafb}
  .td-desc{padding:8px 11px;border-bottom:1px solid #e5e7eb}.td-center{padding:8px 11px;border-bottom:1px solid #e5e7eb;text-align:center}
  .td-war-item{padding:7px 11px;border-bottom:1px solid #e5e7eb;font-weight:600;color:#374151;width:32%}.td-war-term{padding:7px 11px;border-bottom:1px solid #e5e7eb;color:#4b5563}
  .price-box{border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;margin-bottom:20px}
  .price-box-title{background:#0D3B2E;color:#D4AF37;font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:2px;padding:9px 15px}
  .pr{display:flex;justify-content:space-between;padding:9px 15px;border-bottom:1px solid #f3f4f6;font-size:13px}
  .pr.disc{color:#dc2626}.pr.grand{background:#0D3B2E;color:#fff;font-weight:900;font-size:16px;padding:13px 15px}.pr.grand span:last-child{color:#D4AF37}
  .svc-list,.terms-list{list-style:none;padding:0;margin:0}
  .svc-list li{padding:3px 0;color:#374151;font-size:12px}.svc-list li::before{content:"✓  ";color:#059669;font-weight:700}
  .terms-list li{padding:3px 0;color:#374151;font-size:12px}.terms-list li::before{content:"•  ";color:#D4AF37;font-weight:700}
  .notes{font-size:12px;color:#374151;line-height:1.7;background:#f9fafb;border-radius:6px;padding:10px 14px;margin-bottom:20px}
  .sig-grid{display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-top:28px;padding-top:18px;border-top:1px solid #e5e7eb}
  .sig-line{border-bottom:1px solid #374151;height:42px;margin-bottom:6px}.sig-lbl{font-size:11px;color:#6b7280}.sig-name{font-size:11px;color:#374151;margin-top:3px;font-weight:600}
  .doc-footer{margin-top:22px;padding-top:12px;border-top:1px solid #e5e7eb;text-align:center;font-size:10px;color:#9ca3af;line-height:1.8}
  .toolbar{display:flex;gap:10px;justify-content:center;padding:14px;background:#f1f5f9;border-bottom:1px solid #e2e8f0;position:sticky;top:0;z-index:10}
  .btn{padding:9px 26px;border-radius:8px;font-weight:700;font-size:13px;cursor:pointer;border:none}
  .btn-print{background:#0D3B2E;color:#fff}.btn-close{background:#e5e7eb;color:#374151}
</style>
</head>
<body>
<div class="no-print toolbar">
  <button class="btn btn-print" onclick="window.print()">🖨️ &nbsp;Print / Save as PDF</button>
  <button class="btn btn-close" onclick="window.close()">✕ &nbsp;Close</button>
</div>
<div class="page">
  <div class="hdr">
    <div><div class="logo">CEYLON <span>ECO POWER</span></div><div class="logo-sub">Solar Engineering</div></div>
    <div class="contact">info@ceylonecopower.com<br>+94 71 688 0058<br>Sri Lanka</div>
  </div>
  <div class="band">
    <h1>Solar System Quotation</h1>
    <div class="band-meta"><strong>Quote No: </strong>${q.quoteNo}<br><strong>Date: </strong>${q.date}<br><strong>Valid For: </strong>${q.validDays} days</div>
  </div>
  <div class="info-grid">
    <div class="info-box">
      <div class="info-box-title">Prepared For</div>
      <div class="ir"><span class="il">Name:</span><span class="iv">${q.customer?.name || "—"}</span></div>
      <div class="ir"><span class="il">Address:</span><span class="iv">${q.customer?.address || "—"}</span></div>
      <div class="ir"><span class="il">Phone:</span><span class="iv">${q.customer?.phone || "—"}</span></div>
      <div class="ir"><span class="il">Email:</span><span class="iv">${q.customer?.email || "—"}</span></div>
    </div>
    <div class="info-box">
      <div class="info-box-title">System Overview</div>
      <div class="ir"><span class="il">System Type:</span><span class="iv">${typeLabel}</span></div>
      <div class="ir"><span class="il">AC Capacity:</span><span class="iv">${q.system?.acKw} kW</span></div>
      <div class="ir"><span class="il">DC Capacity:</span><span class="iv">${q.system?.dcKwp} kWp</span></div>
      ${q.system?.type?.endsWith("bess") ? `<div class="ir"><span class="il">Battery:</span><span class="iv">${q.system?.batKwh} kWh</span></div>` : ""}
    </div>
  </div>
  <div class="sec-title">System Components &amp; Specifications</div>
  <table>
    <thead><tr>
      <th class="th" style="width:68%">Description / Specification</th>
      <th class="th th-c" style="width:16%">Qty</th>
      <th class="th th-c" style="width:16%">Unit</th>
    </tr></thead>
    <tbody>${eqRows}</tbody>
  </table>
  <div class="price-box">
    <div class="price-box-title">Pricing Summary</div>
    <div class="pr"><span>Total System Price</span><span>LKR ${fmtH(total)}</span></div>
    ${(q.pricing?.discountPct ?? 0) > 0 ? `<div class="pr disc"><span>Discount (${q.pricing.discountPct}%)</span><span>− LKR ${fmtH(discAmt)}</span></div>` : ""}
    <div class="pr grand"><span>Final Price</span><span>LKR ${fmtH(final)}</span></div>
  </div>
  <div class="sec-title">Warranty Terms</div>
  <table><thead><tr><th class="th" style="width:32%">Component</th><th class="th">Warranty Coverage</th></tr></thead><tbody>${warRows}</tbody></table>
  <div class="sec-title">After-Sale Services</div>
  <ul class="svc-list">${svcList}</ul>
  <div class="sec-title">Terms &amp; Conditions</div>
  <ul class="terms-list">${termList}</ul>
  ${q.notes ? `<div class="sec-title">Additional Notes</div><div class="notes">${q.notes}</div>` : ""}
  <div class="sig-grid">
    <div><div class="sig-line"></div><div class="sig-lbl">Customer Signature &amp; Date</div><div class="sig-name">${q.customer?.name || ""}</div></div>
    <div><div class="sig-line"></div><div class="sig-lbl">Authorized by — Ceylon Eco Power</div><div class="sig-name">Sales Engineer</div></div>
  </div>
  <div class="doc-footer">
    Ceylon Eco Power &nbsp;|&nbsp; Solar Engineering &nbsp;|&nbsp; info@ceylonecopower.com &nbsp;|&nbsp; +94 71 688 0058 &nbsp;|&nbsp; Sri Lanka<br>
    This quotation is valid for ${q.validDays} days from ${q.date}. All prices are in Sri Lankan Rupees (LKR).
  </div>
</div>
</body></html>`;
}

// ─── Collapsible ──────────────────────────────────────────────────────────────
function Collapsible({ title, isOpen, onToggle, children }) {
  return (
    <div className="bg-white rounded-2xl border border-black/8 shadow-sm overflow-hidden">
      <button type="button" onClick={onToggle}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition">
        <span className="font-black text-gray-800">{title}</span>
        {isOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
      </button>
      {isOpen && <div className="px-6 pb-6 border-t border-black/5 pt-5">{children}</div>}
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function emptyForm() {
  return {
    quoteNo: newQuoteNo(),
    date: todayStr(),
    validDays: 30,
    customer: { name: "", address: "", phone: "", email: "" },
    system: { type: "dom-ongrid", acKw: 8, dcKwp: 9.6, batKwh: 10 },
    equipment: defaultEquipment("dom-ongrid"),
    totalPrice: 0,
    discountPct: 0,
    warranty: DEFAULT_WARRANTY.map((w) => ({ ...w })),
    services: [...DEFAULT_SERVICES],
    terms: [...DEFAULT_TERMS],
    notes: "",
    budgetSnapshot: null,
  };
}

// ─── QuotationTab ──────────────────────────────────────────────────────────────
export default function QuotationTab({ budgetImport, onBudgetImportDone }) {
  const init = emptyForm();
  const [quoteNo,   setQuoteNo]   = useState(init.quoteNo);
  const [date,      setDate]      = useState(init.date);
  const [validDays, setValidDays] = useState(init.validDays);
  const [customer,  setCustomer]  = useState(init.customer);
  const [system,    setSystem]    = useState(init.system);
  const [equipment, setEquipment] = useState(init.equipment);
  const [totalPrice,   setTotalPrice]   = useState(0);
  const [discountPct,  setDiscountPct]  = useState(0);
  const [warranty,  setWarranty]  = useState(init.warranty);
  const [services,  setServices]  = useState(init.services);
  const [terms,     setTerms]     = useState(init.terms);
  const [notes,     setNotes]     = useState("");
  const [budgetSnapshot, setBudgetSnapshot] = useState(null);

  // Edit mode
  const [editingId, setEditingId] = useState(null);

  const setCust = (k, v) => setCustomer((p) => ({ ...p, [k]: v }));
  const setSys  = (k, v) => setSystem((p) => ({ ...p, [k]: v }));
  const isBESS  = system.type.endsWith("bess");

  const [open, setOpen] = useState({
    customer: true, system: true, equipment: true,
    pricing: true, warranty: false, services: false,
  });
  const tog = (k) => setOpen((p) => ({ ...p, [k]: !p[k] }));

  const [saving,      setSaving]      = useState(false);
  const [saved,       setSaved]       = useState(false);
  const [err,         setErr]         = useState("");
  const [quotations,  setQuotations]  = useState([]);
  const [loadingList, setLoadingList] = useState(false);

  useEffect(() => { loadQuotations(); }, []);

  // ── Budget import from BudgetCalcTab ─────────────────────────────────────────
  useEffect(() => {
    if (!budgetImport) return;
    setSystem({
      type: budgetImport.projectType,
      acKw: budgetImport.acKw,
      dcKwp: budgetImport.dcKwp,
      batKwh: budgetImport.batKwh,
    });
    setEquipment(budgetImport.equipmentRows.map((r, i) => ({ ...r, id: `imp${i}` })));
    setTotalPrice(Math.round(budgetImport.totalPrice));
    setDiscountPct(budgetImport.discountPct ?? 0);
    if (budgetImport.client) setCust("name", budgetImport.client);
    setBudgetSnapshot(budgetImport.budgetSnapshot ?? null);
    setEditingId(null);
    setQuoteNo(newQuoteNo());
    setOpen({ customer: true, system: true, equipment: true, pricing: true, warranty: false, services: false });
    onBudgetImportDone?.();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [budgetImport]); // eslint-disable-line

  function loadQuotations() {
    if (!isConfigured) return;
    setLoadingList(true);
    fbQuotations.getAll().then(setQuotations).catch(console.error).finally(() => setLoadingList(false));
  }

  function handleTypeChange(t) {
    setSys("type", t);
    if (!budgetImport) setEquipment(defaultEquipment(t));
  }

  const STRING_FIELDS = new Set(["label", "brand", "spec", "unit", "cat"]);
  function updateEq(id, field, val) {
    setEquipment((rows) => rows.map((r) => {
      if (r.id !== id) return r;
      return { ...r, [field]: STRING_FIELDS.has(field) ? val : (Number(val) || 0) };
    }));
  }
  function addEqRow() {
    setEquipment((rows) => [...rows, { id: String(Date.now()), cat: "misc", label: "", brand: "", spec: "", qty: 1, unit: "unit" }]);
  }
  function removeEqRow(id) { setEquipment((rows) => rows.filter((r) => r.id !== id)); }

  const discountAmt = totalPrice * discountPct / 100;
  const finalPrice  = totalPrice - discountAmt;

  function buildQuotation() {
    return {
      quoteNo, date, validDays,
      customer, system, equipment,
      pricing: { totalPrice, discountPct, discountAmt, finalPrice },
      warranty, services, terms, notes,
      budgetSnapshot,
    };
  }

  function handlePreview() {
    const html = generateHTML(buildQuotation());
    const w = window.open("", "_blank", "width=920,height=760");
    if (w) { w.document.write(html); w.document.close(); }
  }

  async function handleSave() {
    if (!customer.name.trim()) { setErr("Customer name is required."); return; }
    if (!isConfigured) { setErr("Firebase not configured — use Preview to download only."); return; }
    setSaving(true); setErr("");
    try {
      const q = buildQuotation();
      if (editingId) {
        await fbQuotations.update(editingId, q);
      } else {
        await fbQuotations.add(q);
        setQuoteNo(newQuoteNo());
      }
      loadQuotations();
      setSaved(true); setTimeout(() => setSaved(false), 3000);
    } catch (e) { setErr(e.message); }
    finally { setSaving(false); }
  }

  function loadForEdit(q) {
    setEditingId(q._fbId);
    setQuoteNo(q.quoteNo ?? newQuoteNo());
    setDate(q.date ?? todayStr());
    setValidDays(q.validDays ?? 30);
    setCustomer(q.customer ?? { name: "", address: "", phone: "", email: "" });
    setSystem(q.system ?? { type: "dom-ongrid", acKw: 8, dcKwp: 9.6, batKwh: 10 });
    setEquipment(q.equipment?.length ? q.equipment : defaultEquipment(q.system?.type ?? "dom-ongrid"));
    setTotalPrice(q.pricing?.totalPrice ?? 0);
    setDiscountPct(q.pricing?.discountPct ?? 0);
    setWarranty(q.warranty?.length ? q.warranty : DEFAULT_WARRANTY.map((w) => ({ ...w })));
    setServices(q.services?.length ? q.services : [...DEFAULT_SERVICES]);
    setTerms(q.terms?.length ? q.terms : [...DEFAULT_TERMS]);
    setNotes(q.notes ?? "");
    setBudgetSnapshot(q.budgetSnapshot ?? null);
    setOpen({ customer: true, system: true, equipment: true, pricing: true, warranty: false, services: false });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleNew() {
    const f = emptyForm();
    setEditingId(null);
    setQuoteNo(f.quoteNo);
    setDate(f.date);
    setValidDays(f.validDays);
    setCustomer(f.customer);
    setSystem(f.system);
    setEquipment(f.equipment);
    setTotalPrice(0);
    setDiscountPct(0);
    setWarranty(f.warranty);
    setServices(f.services);
    setTerms(f.terms);
    setNotes("");
    setBudgetSnapshot(null);
  }

  function openPDF(q) {
    const html = generateHTML(q);
    const w = window.open("", "_blank", "width=920,height=760");
    if (w) { w.document.write(html); w.document.close(); }
  }

  const CAT_OPTS = ["panels", "inverter", "battery", "bos", "labor", "logistics", "misc"];
  const setWar = (i, k, v) => setWarranty((p) => { const n = [...p]; n[i] = { ...n[i], [k]: v }; return n; });

  return (
    <div className="space-y-5">

      {/* ── Edit Mode Banner ── */}
      {editingId && (
        <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-xl px-5 py-3">
          <div className="flex items-center gap-2 text-blue-800 text-sm font-semibold">
            <PencilLine size={15} className="text-blue-500" />
            Editing saved quotation: <span className="font-black">{quoteNo}</span>
          </div>
          <button onClick={handleNew}
            className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-red-600 border border-blue-200 rounded-lg px-3 py-1.5 transition">
            <X size={12} /> Cancel edit
          </button>
        </div>
      )}

      {/* ── Budget import banner ── */}
      {budgetSnapshot && !editingId && (
        <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-xl px-5 py-3 text-yellow-800 text-sm">
          <FileText size={14} className="text-yellow-500 shrink-0" />
          Loaded from Budget Calculator — fill in brand/model details and customer info, then save.
        </div>
      )}

      {/* ── 1. Quote Details & Customer ── */}
      <Collapsible title="1. Quote Details & Customer Info" isOpen={open.customer} onToggle={() => tog("customer")}>
        <div className="grid sm:grid-cols-3 gap-4 mb-5">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Quote Number</label>
            <input value={quoteNo} onChange={(e) => setQuoteNo(e.target.value)} className={inp} />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inp} />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Valid For (days)</label>
            <input type="number" min="1" value={validDays} onChange={(e) => setValidDays(Number(e.target.value))} className={inp} />
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
              Customer Name <span className="text-red-500">*</span>
            </label>
            <input value={customer.name} onChange={(e) => setCust("name", e.target.value)} className={inp} placeholder="Mr. / Ms. Full Name" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Phone</label>
            <input value={customer.phone} onChange={(e) => setCust("phone", e.target.value)} className={inp} placeholder="+94 7X XXX XXXX" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Email</label>
            <input type="email" value={customer.email} onChange={(e) => setCust("email", e.target.value)} className={inp} placeholder="customer@example.com" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Address / Location</label>
            <input value={customer.address} onChange={(e) => setCust("address", e.target.value)} className={inp} placeholder="No. XX, Street, City" />
          </div>
        </div>
      </Collapsible>

      {/* ── 2. System Specification ── */}
      <Collapsible title="2. System Specification" isOpen={open.system} onToggle={() => tog("system")}>
        <div className="grid sm:grid-cols-4 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">System Type</label>
            <select value={system.type} onChange={(e) => handleTypeChange(e.target.value)} className={inp}>
              {PROJECT_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">AC Capacity (kW)</label>
            <input type="number" min="0" step="0.5" value={system.acKw} onChange={(e) => setSys("acKw", e.target.value)} className={inp} />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">DC Capacity (kWp)</label>
            <input type="number" min="0" step="0.1" value={system.dcKwp} onChange={(e) => setSys("dcKwp", e.target.value)} className={inp} />
          </div>
          {isBESS && (
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Battery (kWh)</label>
              <input type="number" min="0" value={system.batKwh} onChange={(e) => setSys("batKwh", e.target.value)} className={inp} />
            </div>
          )}
        </div>
      </Collapsible>

      {/* ── 3. Components & Specifications ── */}
      <Collapsible title="3. System Components & Specifications" isOpen={open.equipment} onToggle={() => tog("equipment")}>
        <p className="text-xs text-gray-400 mb-3">
          Fill in brand and model/spec for each item. Qty is pre-calculated when loaded from Budget Calculator.
        </p>
        <div className="overflow-x-auto rounded-xl border border-black/8 mb-4">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 text-gray-500 font-black uppercase tracking-wide">
              <tr>
                <th className="px-2 py-2.5 text-left w-20">Cat</th>
                <th className="px-2 py-2.5 text-left">Item / Description</th>
                <th className="px-2 py-2.5 text-left w-28">Brand</th>
                <th className="px-2 py-2.5 text-left">Model / Spec</th>
                <th className="px-2 py-2.5 text-right w-14">Qty</th>
                <th className="px-2 py-2.5 text-left w-16">Unit</th>
                <th className="w-8"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {equipment.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50/60">
                  <td className="px-2 py-1.5">
                    <select value={r.cat} onChange={(e) => updateEq(r.id, "cat", e.target.value)}
                      className="text-[10px] border rounded px-1 py-0.5 outline-none bg-white w-full">
                      {CAT_OPTS.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </td>
                  <td className="px-2 py-1.5">
                    <input value={r.label} onChange={(e) => updateEq(r.id, "label", e.target.value)}
                      className="border-b border-transparent hover:border-gray-300 focus:border-blue-400 outline-none bg-transparent w-full py-0.5 text-gray-800"
                      placeholder="Item name" />
                  </td>
                  <td className="px-2 py-1.5">
                    <input value={r.brand} onChange={(e) => updateEq(r.id, "brand", e.target.value)}
                      className="border-b border-transparent hover:border-gray-300 focus:border-blue-400 outline-none bg-transparent w-full py-0.5 text-gray-600"
                      placeholder="e.g. Jinko" />
                  </td>
                  <td className="px-2 py-1.5">
                    <input value={r.spec} onChange={(e) => updateEq(r.id, "spec", e.target.value)}
                      className="border-b border-transparent hover:border-gray-300 focus:border-blue-400 outline-none bg-transparent w-full py-0.5 text-gray-500"
                      placeholder="Model, wattage, capacity…" />
                  </td>
                  <td className="px-2 py-1.5">
                    <input type="number" min="0" value={r.qty} onChange={(e) => updateEq(r.id, "qty", e.target.value)}
                      className="border-b border-transparent hover:border-gray-300 focus:border-blue-400 outline-none bg-transparent w-full py-0.5 text-right text-gray-800" />
                  </td>
                  <td className="px-2 py-1.5">
                    <input value={r.unit} onChange={(e) => updateEq(r.id, "unit", e.target.value)}
                      className="border-b border-transparent hover:border-gray-300 focus:border-blue-400 outline-none bg-transparent w-full py-0.5 text-gray-500" />
                  </td>
                  <td className="px-2 py-1.5">
                    <button onClick={() => removeEqRow(r.id)} className="text-red-400 hover:text-red-600"><Trash2 size={12} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button type="button" onClick={addEqRow}
          className="flex items-center gap-2 border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-bold px-4 py-2 rounded-lg transition">
          <Plus size={12} /> Add Row
        </button>
      </Collapsible>

      {/* ── 4. Pricing ── */}
      <Collapsible title="4. Pricing" isOpen={open.pricing} onToggle={() => tog("pricing")}>
        <div className="grid sm:grid-cols-2 gap-6 items-start">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                Total System Price (LKR)
              </label>
              <input
                type="number" min="0" value={totalPrice || ""}
                onChange={(e) => setTotalPrice(Number(e.target.value) || 0)}
                className={inp} placeholder="e.g. 1850000"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Discount (%)</label>
              <div className="flex gap-3 items-center">
                <input
                  type="number" min="0" max="100" value={discountPct || ""}
                  onChange={(e) => setDiscountPct(Number(e.target.value) || 0)}
                  className={cls(inp, "w-32")} placeholder="0"
                />
                <span className="text-sm text-gray-500">
                  {discountPct > 0 ? `= LKR ${fmt(discountAmt)} off` : "No discount"}
                </span>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 rounded-2xl p-5 space-y-3 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Total System Price</span>
              <span className="font-semibold tabular-nums">LKR {fmt(totalPrice)}</span>
            </div>
            {discountAmt > 0 && (
              <div className="flex justify-between pl-4 text-red-500">
                <span>Discount ({discountPct}%)</span>
                <span className="font-semibold tabular-nums">− LKR {fmt(discountAmt)}</span>
              </div>
            )}
            <div className="border-t border-black/10 pt-3 flex justify-between items-center">
              <span className="font-black text-gray-900 text-lg">Final Price (LKR)</span>
              <span className="font-black text-green-700 text-lg tabular-nums">LKR {fmt(finalPrice)}</span>
            </div>
          </div>
        </div>
      </Collapsible>

      {/* ── 5. Warranty Terms ── */}
      <Collapsible title="5. Warranty Terms" isOpen={open.warranty} onToggle={() => tog("warranty")}>
        <div className="space-y-2.5">
          {warranty.map((w, i) => (
            <div key={i} className="grid grid-cols-5 gap-3 items-center">
              <input value={w.item} onChange={(e) => setWar(i, "item", e.target.value)}
                className={cls(sinp, "col-span-2")} placeholder="Component" />
              <input value={w.term} onChange={(e) => setWar(i, "term", e.target.value)}
                className={cls(sinp, "col-span-2")} placeholder="Warranty coverage" />
              <button onClick={() => setWarranty((p) => p.filter((_, j) => j !== i))}
                className="text-red-400 hover:text-red-600 justify-self-center"><Trash2 size={13} /></button>
            </div>
          ))}
          <button type="button" onClick={() => setWarranty((p) => [...p, { item: "", term: "" }])}
            className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1">
            <Plus size={11} /> Add warranty item
          </button>
        </div>
      </Collapsible>

      {/* ── 6. After-Sale Services & Terms ── */}
      <Collapsible title="6. After-Sale Services & Terms" isOpen={open.services} onToggle={() => tog("services")}>
        <div className="grid sm:grid-cols-2 gap-8">
          <div>
            <p className="text-xs font-black text-gray-500 uppercase tracking-wide mb-3">After-Sale Services</p>
            <div className="space-y-1.5">
              {services.map((s, i) => (
                <div key={i} className="flex gap-2">
                  <input value={s} onChange={(e) => setServices((p) => { const n = [...p]; n[i] = e.target.value; return n; })}
                    className={sinp} />
                  <button onClick={() => setServices((p) => p.filter((_, j) => j !== i))}
                    className="text-red-400 hover:text-red-600 shrink-0"><Trash2 size={12} /></button>
                </div>
              ))}
              <button type="button" onClick={() => setServices((p) => [...p, ""])}
                className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1">
                <Plus size={11} /> Add service
              </button>
            </div>
          </div>
          <div>
            <p className="text-xs font-black text-gray-500 uppercase tracking-wide mb-3">Terms &amp; Conditions</p>
            <div className="space-y-1.5">
              {terms.map((t, i) => (
                <div key={i} className="flex gap-2">
                  <input value={t} onChange={(e) => setTerms((p) => { const n = [...p]; n[i] = e.target.value; return n; })}
                    className={sinp} />
                  <button onClick={() => setTerms((p) => p.filter((_, j) => j !== i))}
                    className="text-red-400 hover:text-red-600 shrink-0"><Trash2 size={12} /></button>
                </div>
              ))}
              <button type="button" onClick={() => setTerms((p) => [...p, ""])}
                className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1">
                <Plus size={11} /> Add term
              </button>
            </div>
          </div>
        </div>
        <div className="mt-5">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Additional Notes</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
            className={cls(inp, "resize-none")} placeholder="Any additional notes for the customer…" />
        </div>
      </Collapsible>

      {/* ── Actions ── */}
      <div className="flex flex-wrap items-center gap-3 justify-between bg-white rounded-2xl border border-black/8 shadow-sm px-6 py-4">
        <div className="flex flex-wrap gap-3">
          <button onClick={handlePreview}
            className="flex items-center gap-2 bg-gray-800 hover:bg-black text-white font-bold px-5 py-2.5 rounded-xl transition text-sm">
            <Eye size={14} /> Preview &amp; Download PDF
          </button>
          <button onClick={handleSave} disabled={saving}
            className={cls(
              "flex items-center gap-2 font-bold px-5 py-2.5 rounded-xl transition text-sm text-white",
              editingId
                ? "bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300"
                : "bg-green-600 hover:bg-green-700 disabled:bg-green-300",
            )}>
            {saving
              ? <><Loader size={14} className="animate-spin" /> Saving…</>
              : editingId
                ? <><Save size={14} /> Update Quotation</>
                : <><Save size={14} /> Save to Firebase</>}
          </button>
          <button onClick={handleNew}
            className="flex items-center gap-2 border border-gray-300 hover:bg-gray-50 text-gray-600 font-semibold px-5 py-2.5 rounded-xl transition text-sm">
            <FileText size={14} /> New Quotation
          </button>
        </div>
        <div className="flex items-center gap-3">
          {saved && (
            <span className="flex items-center gap-1.5 text-green-600 text-sm font-semibold">
              <CheckCircle size={15} /> {editingId ? "Updated!" : "Saved!"}
            </span>
          )}
          {err && <span className="text-red-600 text-sm">{err}</span>}
        </div>
      </div>

      {/* ── Saved Quotations ── */}
      <div className="bg-white rounded-2xl border border-black/8 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-black text-gray-700">
            Saved Quotations {isConfigured ? `(${quotations.length})` : ""}
          </h3>
          {isConfigured && (
            <button onClick={loadQuotations}
              className="text-xs text-blue-600 hover:underline flex items-center gap-1">
              <RefreshCw size={11} /> Refresh
            </button>
          )}
        </div>

        {!isConfigured && (
          <p className="text-amber-600 text-sm">Firebase not connected — quotations will not be saved until Firebase is set up.</p>
        )}
        {isConfigured && loadingList && (
          <div className="flex items-center gap-2 text-gray-400 text-sm py-4">
            <Loader size={15} className="animate-spin" /> Loading…
          </div>
        )}
        {isConfigured && !loadingList && quotations.length === 0 && (
          <p className="text-gray-400 text-sm">No saved quotations yet.</p>
        )}

        {isConfigured && !loadingList && quotations.length > 0 && (
          <div className="space-y-2">
            {quotations.map((q) => {
              const fp   = q.pricing?.finalPrice ?? q.pricing?.totalPrice ?? 0;
              const disc = q.pricing?.discountPct ?? 0;
              const isEditing = q._fbId === editingId;
              return (
                <div key={q._fbId}
                  className={cls(
                    "flex items-center justify-between border rounded-xl px-4 py-3 transition",
                    isEditing ? "bg-blue-50 border-blue-200" : "bg-gray-50 hover:bg-gray-100",
                  )}>
                  <div>
                    <p className="font-bold text-sm text-gray-800">
                      {q.quoteNo}
                      {isEditing && <span className="ml-2 text-xs bg-blue-200 text-blue-800 px-1.5 py-0.5 rounded font-bold">Editing</span>}
                      {" — "}{q.customer?.name || "Unknown Customer"}
                    </p>
                    <p className="text-xs text-gray-400">
                      {q.date} · {q.system?.acKw} kW · Final: LKR {fmt(fp)}
                      {disc > 0 && ` (${disc}% disc)`}
                      {q.budgetSnapshot ? " · Budget attached" : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => openPDF(q)}
                      className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 border border-blue-200 bg-white rounded-lg px-3 py-1.5 font-semibold transition">
                      <Eye size={12} /> PDF
                    </button>
                    <button onClick={() => loadForEdit(q)}
                      className="flex items-center gap-1.5 text-xs text-yellow-700 hover:text-yellow-900 border border-yellow-200 bg-white rounded-lg px-3 py-1.5 font-semibold transition">
                      <PencilLine size={12} /> Edit
                    </button>
                    <button
                      onClick={async () => {
                        await fbQuotations.remove(q._fbId);
                        setQuotations((l) => l.filter((x) => x._fbId !== q._fbId));
                        if (editingId === q._fbId) handleNew();
                      }}
                      className="text-red-400 hover:text-red-600 p-1.5">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
