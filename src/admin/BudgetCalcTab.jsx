import React, { useCallback, useMemo, useState } from "react";
import { Plus, Trash2, RefreshCw, Printer, FileText, ChevronDown, ChevronUp, Sun, Zap, BatteryCharging, TrendingUp } from "lucide-react";
import { getAccessories } from "../data/accessories.js";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function cls(...a) { return a.filter(Boolean).join(" "); }
function fmt(n)    { return Math.round(n).toLocaleString("en-LK"); }
function fmtM(n)   { return (n / 1000000).toFixed(2) + "M"; }
function pct(n)    { return Number(n).toFixed(1) + "%"; }

const inp  = "border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 bg-white w-full text-gray-800";
const sinp = "border rounded-lg px-2 py-1.5 text-xs outline-none focus:border-blue-400 bg-white text-gray-800";

// ─── Project Types ─────────────────────────────────────────────────────────────
export const PROJECT_TYPES = [
  { id:"dom-ongrid",  label:"Domestic On-Grid",     icon:"Sun",            selfConsume:70, gridRate:65  },
  { id:"com-ongrid",  label:"Commercial On-Grid",   icon:"Zap",            selfConsume:75, gridRate:80  },
  { id:"dom-bess",    label:"Domestic Hybrid BESS", icon:"BatteryCharging",selfConsume:90, gridRate:65  },
  { id:"com-bess",    label:"Commercial Hybrid BESS",icon:"BatteryCharging",selfConsume:92, gridRate:80 },
];

// ─── BOM Generator ────────────────────────────────────────────────────────────
function generateBOM(type, acKw, dcKwp, batKwh, panelW) {
  const accessories = getAccessories();
  const isBESS  = type.endsWith("bess");
  const isComm  = type.startsWith("com");
  const panels  = Math.ceil((dcKwp * 1000) / panelW);
  const strings = Math.ceil(panels / 20);
  const dcCm    = Math.ceil(dcKwp * 15);
  const acCm    = isComm ? Math.ceil(acKw * 4) : 30;

  const acc = (id) => {
    const a = accessories.find((x) => x.id === id);
    return a ? { description: a.name, unit: a.unit, unitPrice: a.price } : null;
  };

  const rows = [];
  let seq = 1;
  const add = (cat, description, qty, unit, unitPrice) => {
    rows.push({ id: String(seq++), cat, description, qty, unit, unitPrice: Number(unitPrice) || 0 });
  };

  // ─ Equipment (user fills price)
  add("panels",   `Solar Panel ${panelW}Wp`,                       panels,  "unit", 0);
  add("inverter", `${isComm?"String":"Hybrid"} Inverter ${acKw}kW`, 1,       "unit", 0);
  if (isBESS) add("battery", `Battery System ${batKwh}kWh`,        batKwh,  "kWh",  0);

  // ─ BOS
  const dc6  = acc("d-dc6")  || { description:"DC Cable 6mm²",    unit:"metre", unitPrice:220  };
  const ac6  = acc("d-ac6")  || { description:"AC Cable 6mm²",    unit:"metre", unitPrice:185  };
  const ac10 = acc("d-ac10") || { description:"AC Cable 10mm²",   unit:"metre", unitPrice:270  };
  const mc4  = acc("d-mc4")  || { description:"MC4 Pair",         unit:"pair",  unitPrice:350  };
  const str  = acc("d-str")  || { description:"Structure",        unit:"panel", unitPrice:2800 };
  const eth  = acc("d-eth")  || { description:"Earthing Set",     unit:"set",   unitPrice:8500 };
  const spd  = acc("d-spd")  || { description:"SPD",              unit:"unit",  unitPrice:12000};
  const dcb  = acc("d-dcb")  || { description:"DC Breaker",       unit:"unit",  unitPrice:4500 };
  const acm  = acc("d-acm")  || { description:"AC MCB 63A",       unit:"unit",  unitPrice:2800 };
  const mtr  = acc("d-mtr")  || { description:"Energy Meter",     unit:"unit",  unitPrice:36000};
  const wfl  = acc("d-wfl")  || { description:"WiFi Logger",      unit:"unit",  unitPrice:15000};
  const trn  = acc("d-trn")  || { description:"Transport",        unit:"trip",  unitPrice:25000};
  const msc  = acc("d-msc")  || { description:"Misc",             unit:"lump",  unitPrice:15000};
  const lab  = acc("d-lab")  || { description:"Labor",            unit:"kW",    unitPrice:8000 };

  add("bos", dc6.description,  dcCm,    dc6.unit,  dc6.unitPrice);
  add("bos", (isComm?ac10:ac6).description, acCm, (isComm?ac10:ac6).unit, (isComm?ac10:ac6).unitPrice);
  add("bos", mc4.description,  panels,  mc4.unit,  mc4.unitPrice);
  add("bos", str.description,  panels,  str.unit,  str.unitPrice);
  add("bos", eth.description,  1,       eth.unit,  eth.unitPrice);
  add("bos", spd.description,  1,       spd.unit,  spd.unitPrice);
  add("bos", dcb.description,  strings, dcb.unit,  dcb.unitPrice);
  add("bos", acm.description,  1,       acm.unit,  acm.unitPrice);

  if (isComm && acKw >= 15) {
    const cb = acc("d-cb4") || { description:"DC Combiner Box 4-in-1", unit:"unit", unitPrice:26000 };
    add("bos", cb.description, Math.max(1, Math.ceil(strings/4)), cb.unit, cb.unitPrice);
  }

  if (isBESS) {
    const bcc = acc("d-bcc") || { description:"Battery DC Cable 35mm²", unit:"metre", unitPrice:850 };
    const bms = acc("d-bms") || { description:"BMS / Battery Protection", unit:"unit", unitPrice:18000 };
    add("bos", bcc.description, 10,  bcc.unit, bcc.unitPrice);
    add("bos", bms.description, 1,   bms.unit, bms.unitPrice);
  }

  add("bos",      mtr.description, 1,     mtr.unit, mtr.unitPrice);
  add("bos",      wfl.description, 1,     wfl.unit, wfl.unitPrice);
  add("labor",    lab.description, acKw,  lab.unit, lab.unitPrice);
  add("logistics",trn.description, 1,     trn.unit, trn.unitPrice);
  add("misc",     msc.description, 1,     msc.unit, msc.unitPrice);

  return rows.map((r) => ({ ...r, total: r.qty * r.unitPrice }));
}

// ─── ROI Engine ───────────────────────────────────────────────────────────────
function calcROI(totalCost, acKw, roiP) {
  const { sunHours, sysEff, selfPct, gridRate, exportRate, escalation } = roiP;
  const baseGen   = acKw * sunHours * 365 * (sysEff / 100);
  const baseSelf  = baseGen * (selfPct / 100);
  const baseExp   = baseGen * (1 - selfPct / 100);
  const baseSaving = baseSelf * gridRate + baseExp * exportRate;

  const rows = [];
  let cumSaving = 0;
  let payback   = null;
  for (let y = 1; y <= 25; y++) {
    const deg  = Math.pow(0.995, y);            // 0.5%/yr panel degradation
    const esc  = Math.pow(1 + escalation / 100, y);
    const gen  = baseGen * deg;
    const rate = gridRate * esc;
    const sav  = gen * (selfPct / 100) * rate + gen * (1 - selfPct / 100) * exportRate;
    cumSaving += sav;
    if (!payback && cumSaving >= totalCost) payback = y;
    if ([5, 10, 15, 20, 25].includes(y)) rows.push({ year: y, gen: Math.round(gen), saving: Math.round(sav), cumSaving: Math.round(cumSaving) });
  }
  return { baseGen: Math.round(baseGen), baseSaving: Math.round(baseSaving), payback: payback || ">25", rows };
}

// ─── CAT badge colours ─────────────────────────────────────────────────────────
const CAT_COLOR = {
  panels:"bg-yellow-100 text-yellow-800", inverter:"bg-blue-100 text-blue-800",
  battery:"bg-green-100 text-green-800",  bos:"bg-gray-100 text-gray-600",
  labor:"bg-orange-100 text-orange-800",  logistics:"bg-purple-100 text-purple-800",
  misc:"bg-red-100 text-red-700",
};

// ─── Section wrapper ─────────────────────────────────────────────────────────
function Section({ title, icon, open, onToggle, children }) {
  return (
    <div className="bg-white rounded-2xl border border-black/8 shadow-sm overflow-hidden">
      <button type="button" onClick={onToggle}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition">
        <div className="flex items-center gap-3">
          {icon}
          <span className="font-black text-gray-800">{title}</span>
        </div>
        {open ? <ChevronUp size={16} className="text-gray-400"/> : <ChevronDown size={16} className="text-gray-400"/>}
      </button>
      {open && <div className="px-6 pb-6 border-t border-black/5 pt-5">{children}</div>}
    </div>
  );
}

// ─── BudgetCalcTab ─────────────────────────────────────────────────────────────
export default function BudgetCalcTab({ onGenerateQuotation }) {
  // ── Project info
  const [info, setInfo] = useState({
    name:"", client:"", type:"dom-ongrid",
    acKw:5, dcKwp:5.8, batKwh:10, panelW:580,
  });

  // ── Line items
  const [items, setItems] = useState([]);

  // ── Commercial
  const [profitPct,   setProfitPct]   = useState(20);
  const [discountPct, setDiscountPct] = useState(0);
  const [vatPct,      setVatPct]      = useState(0);

  // ── ROI params
  const typeDefault = PROJECT_TYPES.find((t) => t.id === info.type) || PROJECT_TYPES[0];
  const [roi, setRoi] = useState({
    sunHours: 5.0, sysEff: 80,
    selfPct: typeDefault.selfConsume,
    gridRate: typeDefault.gridRate,
    exportRate: 22, escalation: 5,
  });

  // ── Sections open/close
  const [open, setOpen] = useState({ setup:true, bom:true, comm:true, roi:true });
  const tog = (k) => setOpen((p) => ({ ...p, [k]: !p[k] }));

  // ── Helpers
  const setI  = (k, v) => setInfo((p) => ({ ...p, [k]: v }));
  const setR  = (k, v) => setRoi((p) => ({ ...p, [k]: v }));
  const isBESS = info.type.endsWith("bess");

  function autoBOM() {
    setItems(generateBOM(info.type, Number(info.acKw), Number(info.dcKwp), Number(info.batKwh), Number(info.panelW)));
  }

  function updateItem(id, field, val) {
    setItems((rows) => rows.map((r) => {
      if (r.id !== id) return r;
      const updated = { ...r, [field]: field === "description" ? val : Number(val) || 0 };
      updated.total = updated.qty * updated.unitPrice;
      return updated;
    }));
  }

  function addRow() {
    setItems((rows) => [...rows, { id: String(Date.now()), cat:"misc", description:"", qty:1, unit:"unit", unitPrice:0, total:0 }]);
  }

  function removeRow(id) { setItems((rows) => rows.filter((r) => r.id !== id)); }

  // ── Calculations
  const subtotal         = useMemo(() => items.reduce((s, r) => s + r.total, 0), [items]);
  const profitAmt        = subtotal * profitPct / 100;
  const priceBeforeDisc  = subtotal + profitAmt;
  const discountAmt      = priceBeforeDisc * discountPct / 100;
  const sellingPrice     = priceBeforeDisc - discountAmt;
  const vatAmt           = sellingPrice * vatPct / 100;
  const grandTotal       = sellingPrice + vatAmt;
  const pricePerKw       = info.acKw > 0 ? grandTotal / info.acKw : 0;

  const roiData = useMemo(
    () => calcROI(grandTotal, Number(info.acKw), roi),
    [grandTotal, info.acKw, roi]
  );

  const printSummary = useCallback(() => window.print(), []);

  const ICON_MAP = { Sun: <Sun size={16} className="text-yellow-500"/>, Zap: <Zap size={16} className="text-blue-500"/>, BatteryCharging: <BatteryCharging size={16} className="text-green-600"/> };

  return (
    <div className="space-y-5">

      {/* ── Project Setup ── */}
      <Section title="1. Project Setup" icon={<Sun size={16} className="text-ecoGold"/>} open={open.setup} onToggle={() => tog("setup")}>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Project Name</label>
            <input value={info.name} onChange={(e)=>setI("name",e.target.value)} className={inp} placeholder="e.g. Colombo Residence 8kW" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Client</label>
            <input value={info.client} onChange={(e)=>setI("client",e.target.value)} className={inp} placeholder="Client name" />
          </div>

          <div className="sm:col-span-3">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Project Type</label>
            <div className="grid sm:grid-cols-4 gap-2">
              {PROJECT_TYPES.map((t) => (
                <button key={t.id} type="button" onClick={() => { setI("type",t.id); setRoi((p)=>({...p,selfPct:t.selfConsume,gridRate:t.gridRate})); }}
                  className={cls("flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-semibold transition text-left",
                    info.type===t.id ? "bg-ecoGreen text-white border-ecoGreen" : "border-black/15 text-gray-600 hover:border-ecoGreen")}>
                  {ICON_MAP[t.icon]}{t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">AC Capacity (kW)</label>
            <input type="number" min="1" value={info.acKw} onChange={(e)=>setI("acKw",e.target.value)} className={inp} />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">DC Capacity (kWp)</label>
            <input type="number" min="1" step="0.1" value={info.dcKwp} onChange={(e)=>setI("dcKwp",e.target.value)} className={inp} />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Panel Wattage (W)</label>
            <input type="number" min="100" value={info.panelW} onChange={(e)=>setI("panelW",e.target.value)} className={inp} />
          </div>
          {isBESS && (
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Battery Capacity (kWh)</label>
              <input type="number" min="1" value={info.batKwh} onChange={(e)=>setI("batKwh",e.target.value)} className={inp} />
            </div>
          )}
        </div>
      </Section>

      {/* ── Bill of Materials ── */}
      <Section title="2. Bill of Materials" icon={<Zap size={16} className="text-blue-500"/>} open={open.bom} onToggle={() => tog("bom")}>
        <div className="flex flex-wrap gap-2 mb-4">
          <button type="button" onClick={autoBOM}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition">
            <RefreshCw size={13}/> Auto-Generate BOM
          </button>
          <button type="button" onClick={addRow}
            className="flex items-center gap-2 border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-bold px-4 py-2 rounded-lg transition">
            <Plus size={13}/> Add Row
          </button>
        </div>

        {items.length === 0 && (
          <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-xl">
            Click <strong>Auto-Generate BOM</strong> to populate based on project setup, or add rows manually.
          </div>
        )}

        {items.length > 0 && (
          <div className="overflow-x-auto rounded-xl border border-black/8">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 text-gray-500 font-black uppercase tracking-wide">
                <tr>
                  <th className="px-3 py-2.5 text-left w-20">Cat</th>
                  <th className="px-3 py-2.5 text-left">Description</th>
                  <th className="px-3 py-2.5 text-right w-20">Qty</th>
                  <th className="px-3 py-2.5 text-left w-20">Unit</th>
                  <th className="px-3 py-2.5 text-right w-32">Unit Price</th>
                  <th className="px-3 py-2.5 text-right w-32">Total (LKR)</th>
                  <th className="px-3 py-2.5 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {items.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50/60">
                    <td className="px-3 py-2">
                      <select value={r.cat} onChange={(e)=>updateItem(r.id,"cat",e.target.value)}
                        className="text-[11px] border rounded px-1.5 py-1 outline-none bg-white w-full">
                        {["panels","inverter","battery","bos","labor","logistics","misc"].map((c)=><option key={c}>{c}</option>)}
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <input value={r.description} onChange={(e)=>updateItem(r.id,"description",e.target.value)}
                        className="border-b border-transparent hover:border-gray-300 focus:border-blue-400 outline-none bg-transparent w-full py-0.5 text-gray-800" />
                    </td>
                    <td className="px-3 py-2">
                      <input type="number" min="0" value={r.qty} onChange={(e)=>updateItem(r.id,"qty",e.target.value)}
                        className="border-b border-transparent hover:border-gray-300 focus:border-blue-400 outline-none bg-transparent w-full py-0.5 text-right text-gray-800" />
                    </td>
                    <td className="px-3 py-2 text-gray-500">{r.unit}</td>
                    <td className="px-3 py-2">
                      <input type="number" min="0" value={r.unitPrice} onChange={(e)=>updateItem(r.id,"unitPrice",e.target.value)}
                        className="border-b border-transparent hover:border-gray-300 focus:border-blue-400 outline-none bg-transparent w-full py-0.5 text-right font-medium text-gray-800" />
                    </td>
                    <td className="px-3 py-2 text-right font-bold text-gray-800">{fmt(r.total)}</td>
                    <td className="px-3 py-2">
                      <button onClick={()=>removeRow(r.id)} className="text-red-400 hover:text-red-600"><Trash2 size={13}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 font-black">
                <tr>
                  <td colSpan={5} className="px-3 py-3 text-right text-gray-700">Materials Subtotal</td>
                  <td className="px-3 py-3 text-right text-gray-900">{fmt(subtotal)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </Section>

      {/* ── Commercial Terms ── */}
      <Section title="3. Profit, Discount & Pricing" icon={<TrendingUp size={16} className="text-purple-500"/>} open={open.comm} onToggle={() => tog("comm")}>
        <div className="grid sm:grid-cols-3 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Overhead & Profit (%)</label>
              <input type="number" min="0" max="100" value={profitPct} onChange={(e)=>setProfitPct(Number(e.target.value))} className={inp} />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Discount (%)</label>
              <input type="number" min="0" max="100" value={discountPct} onChange={(e)=>setDiscountPct(Number(e.target.value))} className={inp} />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">VAT (%)</label>
              <select value={vatPct} onChange={(e)=>setVatPct(Number(e.target.value))} className={inp}>
                <option value={0}>No VAT</option>
                <option value={18}>18% VAT</option>
              </select>
            </div>
          </div>

          {/* Price breakdown */}
          <div className="sm:col-span-2 bg-gray-50 rounded-2xl p-5 space-y-2.5 text-sm">
            <PriceRow label="Materials Subtotal"    value={subtotal}        />
            <PriceRow label={`Profit (${profitPct}%)`} value={profitAmt} indent />
            <PriceRow label="Price Before Discount" value={priceBeforeDisc} bold />
            {discountAmt > 0 && <PriceRow label={`Discount (${discountPct}%)`} value={-discountAmt} indent red />}
            <PriceRow label="Selling Price"         value={sellingPrice}    bold />
            {vatAmt > 0 && <PriceRow label={`VAT (${vatPct}%)`}            value={vatAmt} indent />}
            <div className="border-t border-black/10 pt-2.5 mt-1">
              <PriceRow label="Grand Total (LKR)"   value={grandTotal} grand />
            </div>
            {info.acKw > 0 && (
              <p className="text-xs text-gray-400 pt-1">
                ≈ LKR {fmt(pricePerKw)} per kW AC
              </p>
            )}
          </div>
        </div>
      </Section>

      {/* ── ROI ── */}
      <Section title="4. ROI & Simple Payback Analysis" icon={<TrendingUp size={16} className="text-green-600"/>} open={open.roi} onToggle={() => tog("roi")}>
        <div className="grid sm:grid-cols-3 gap-6">
          {/* Params */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-gray-500 uppercase tracking-wide">Solar Parameters</h4>
            <RoiField label="Peak Sun Hours (hrs/day)" value={roi.sunHours} onChange={(v)=>setR("sunHours",v)} step="0.1" />
            <RoiField label="System Efficiency (%)"    value={roi.sysEff}   onChange={(v)=>setR("sysEff",v)} />
            <h4 className="text-xs font-black text-gray-500 uppercase tracking-wide pt-2">Electricity Rates (LKR)</h4>
            <RoiField label="Grid Rate (LKR/kWh)"      value={roi.gridRate}   onChange={(v)=>setR("gridRate",v)} />
            <RoiField label="Net Metering Export Rate" value={roi.exportRate} onChange={(v)=>setR("exportRate",v)} />
            <RoiField label="Self-Consumption (%)"     value={roi.selfPct}    onChange={(v)=>setR("selfPct",v)} />
            <RoiField label="Electricity Escalation (%/yr)" value={roi.escalation} onChange={(v)=>setR("escalation",v)} step="0.5"/>
          </div>

          {/* Metrics */}
          <div className="sm:col-span-2 space-y-4">
            {/* Key metrics */}
            <div className="grid grid-cols-2 gap-3">
              <MetricCard label="Annual Generation"  value={`${fmt(roiData.baseGen)} kWh`}  sub="Year 1 estimate" color="bg-yellow-50 border-yellow-200" />
              <MetricCard label="Annual Net Saving"  value={`LKR ${fmt(roiData.baseSaving)}`} sub="Year 1" color="bg-green-50 border-green-200" />
              <MetricCard label="Project Cost"       value={`LKR ${fmtM(grandTotal)}`}       sub="Grand total" color="bg-blue-50 border-blue-200" />
              <MetricCard
                label="Simple Payback"
                value={typeof roiData.payback==="number" ? `${roiData.payback} Years` : roiData.payback}
                sub="At current rates"
                color={typeof roiData.payback==="number" && roiData.payback<=7 ? "bg-green-100 border-green-300" : "bg-amber-50 border-amber-200"}
              />
            </div>

            {/* Year table */}
            <div className="overflow-x-auto rounded-xl border border-black/8">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 text-gray-500 font-black uppercase tracking-wide">
                  <tr>
                    <th className="px-4 py-2.5 text-left">Year</th>
                    <th className="px-4 py-2.5 text-right">Generation (kWh)</th>
                    <th className="px-4 py-2.5 text-right">Annual Saving (LKR)</th>
                    <th className="px-4 py-2.5 text-right">Cumulative Saving (LKR)</th>
                    <th className="px-4 py-2.5 text-right">ROI %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {roiData.rows.map((row) => {
                    const roiPct = grandTotal > 0 ? ((row.cumSaving - grandTotal) / grandTotal * 100) : 0;
                    const positive = row.cumSaving >= grandTotal;
                    return (
                      <tr key={row.year} className={positive ? "bg-green-50/60" : ""}>
                        <td className="px-4 py-2.5 font-bold text-gray-800">Year {row.year}</td>
                        <td className="px-4 py-2.5 text-right text-gray-600">{fmt(row.gen)}</td>
                        <td className="px-4 py-2.5 text-right text-gray-600">{fmt(row.saving)}</td>
                        <td className="px-4 py-2.5 text-right font-semibold text-gray-800">{fmt(row.cumSaving)}</td>
                        <td className={cls("px-4 py-2.5 text-right font-bold", positive?"text-green-600":"text-red-500")}>
                          {positive ? "+" : ""}{pct(roiPct)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-400">* Includes 0.5%/yr panel degradation and {roi.escalation}%/yr electricity price escalation.</p>
          </div>
        </div>
      </Section>

      {/* ── Print / Export / Generate Quotation ── */}
      <div className="flex flex-wrap gap-3 justify-end">
        <button onClick={printSummary}
          className="flex items-center gap-2 bg-gray-800 hover:bg-black text-white font-bold px-6 py-3 rounded-xl transition text-sm">
          <Printer size={15}/> Print Budget
        </button>
        {onGenerateQuotation && (
          <button
            onClick={() => {
              const isBESS = info.type.endsWith("bess");
              const panelItem   = items.find((r) => r.cat === "panels");
              const inverterItem = items.find((r) => r.cat === "inverter");
              const batteryItem  = items.find((r) => r.cat === "battery");
              const otherItems   = items.filter((r) => !["panels","inverter","battery"].includes(r.cat));
              const numPanels    = panelItem?.qty ?? Math.ceil((Number(info.dcKwp) * 1000) / Number(info.panelW));

              const equipmentRows = [
                {
                  id: "eq1", cat: "panels", label: "Solar Panels",
                  brand: "", spec: `${info.panelW} Wp`,
                  qty: numPanels, unit: "units",
                },
                {
                  id: "eq2", cat: "inverter", label: "Inverter",
                  brand: "", spec: `${info.acKw} kW`,
                  qty: 1, unit: "unit",
                },
                ...(isBESS ? [{
                  id: "eq3", cat: "battery", label: "Battery System",
                  brand: "", spec: `${info.batKwh} kWh`,
                  qty: 1, unit: "unit",
                }] : []),
                ...(otherItems.length > 0
                  ? otherItems.map((r, i) => ({
                      id: `acc${i + 1}`, cat: r.cat, label: r.description,
                      brand: "", spec: "", qty: r.qty, unit: r.unit,
                    }))
                  : [
                      { id:"acc1", cat:"bos",       label:"Balance of System (BOS)", brand:"", spec:"DC/AC cables, MC4, mounting structure, earthing, SPD, breakers, energy meter, WiFi logger", qty:1, unit:"set"  },
                      { id:"acc2", cat:"labor",     label:"Installation & Labor",    brand:"", spec:"", qty:1, unit:"lump" },
                      { id:"acc3", cat:"logistics", label:"Logistics & Transport",   brand:"", spec:"", qty:1, unit:"trip" },
                    ]
                ),
              ];

              onGenerateQuotation({
                projectType: info.type,
                projectName: info.name,
                client: info.client,
                acKw: Number(info.acKw),
                dcKwp: Number(info.dcKwp),
                batKwh: Number(info.batKwh),
                panelW: Number(info.panelW),
                equipmentRows,
                totalPrice: grandTotal,
                discountPct,
                budgetSnapshot: {
                  info: { ...info }, items: [...items],
                  profitPct, discountPct, vatPct, grandTotal,
                },
              });
            }}
            className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white font-bold px-6 py-3 rounded-xl transition text-sm">
            <FileText size={15}/> Generate Quotation
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Small sub-components ─────────────────────────────────────────────────────
function PriceRow({ label, value, bold, grand, indent, red }) {
  return (
    <div className={cls("flex justify-between items-center", indent && "pl-4")}>
      <span className={cls("text-gray-600", bold&&"font-bold text-gray-800", grand&&"font-black text-gray-900 text-base")}>{label}</span>
      <span className={cls("font-semibold tabular-nums", red&&"text-red-600", grand&&"font-black text-gray-900 text-base text-ecoGreen",bold&&"font-bold text-gray-900")}>
        {red && value < 0 ? `– ${fmt(Math.abs(value))}` : fmt(value)}
      </span>
    </div>
  );
}

function RoiField({ label, value, onChange, step="1" }) {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      <input type="number" min="0" step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={sinp + " text-right"} />
    </div>
  );
}

function MetricCard({ label, value, sub, color }) {
  return (
    <div className={cls("border rounded-2xl p-4", color)}>
      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-lg font-black text-gray-900 leading-tight">{value}</p>
      <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
    </div>
  );
}
