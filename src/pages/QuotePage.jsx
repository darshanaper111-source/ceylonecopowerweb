import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Sun, BatteryCharging, Zap, MapPin, User, Phone, Mail,
  ChevronRight, CheckCircle, ArrowRight,
} from "lucide-react";

// ─── Data ─────────────────────────────────────────────────────────────────────
const SYSTEM_TYPES = [
  {
    id: "ongrid",
    icon: Sun,
    title: "On-Grid Solar",
    subtitle: "Grid-tied, no battery",
    desc: "Solar panels feed directly to the grid. Ideal for reducing electricity bills. Power cuts will cut your solar too.",
    color: "border-yellow-400 bg-yellow-50",
    badge: "bg-yellow-100 text-yellow-800",
  },
  {
    id: "bess",
    icon: BatteryCharging,
    title: "Hybrid + BESS",
    subtitle: "Solar + Battery backup",
    desc: "Solar with battery storage. Power available during grid outages. Best for homes with frequent power cuts.",
    color: "border-green-500 bg-green-50",
    badge: "bg-green-100 text-green-700",
  },
];

const AC_OPTIONS  = [1, 2, 3, 5, 8, 10, 15, 20];
const DC_OPTIONS  = [1.1, 2.2, 3.3, 5.5, 9.2, 11.5, 17.2, 23];
const BAT_OPTIONS = [5, 10, 15, 20, 25, 30];

// Rough LKR price ranges (per kW installed, adjust to market)
const ONGRID_RATE  = { low: 280000, high: 340000 }; // per kW AC
const BESS_RATE    = { low: 380000, high: 460000 }; // per kW AC (system cost)
const BAT_RATE     = { low: 120000, high: 160000 }; // per kWh battery

function formatLKR(n) {
  return "LKR " + Math.round(n / 1000) + "k";
}

function priceRange(type, acKw, batKwh) {
  if (type === "ongrid") {
    return {
      low:  acKw * ONGRID_RATE.low,
      high: acKw * ONGRID_RATE.high,
    };
  }
  return {
    low:  acKw * BESS_RATE.low  + batKwh * BAT_RATE.low,
    high: acKw * BESS_RATE.high + batKwh * BAT_RATE.high,
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function cls(...a) { return a.filter(Boolean).join(" "); }

function CapBtn({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cls(
        "px-4 py-2.5 rounded-xl border text-sm font-bold transition",
        active
          ? "bg-ecoGreen text-white border-ecoGreen shadow"
          : "border-black/15 text-black/60 hover:border-ecoGreen hover:text-ecoGreen bg-white"
      )}
    >
      {label}
    </button>
  );
}

function SectionLabel({ n, children }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-8 h-8 rounded-full bg-ecoGreen text-white text-sm font-black flex items-center justify-center shrink-0">
        {n}
      </div>
      <h2 className="text-lg font-black text-ecoDark">{children}</h2>
    </div>
  );
}

// ─── Summary Card ─────────────────────────────────────────────────────────────
function SummaryCard({ systemType, acKw, dcKwp, batKwh, name, phone, location }) {
  const type   = SYSTEM_TYPES.find((s) => s.id === systemType);
  const range  = priceRange(systemType, acKw, systemType === "bess" ? batKwh : 0);
  const Icon   = type?.icon || Sun;
  const panels = Math.ceil((dcKwp * 1000) / 580);

  return (
    <div className="bg-ecoDark text-white rounded-3xl p-6 sticky top-28 space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-ecoGold/20 flex items-center justify-center">
          <Icon size={20} className="text-ecoGold" />
        </div>
        <div>
          <p className="font-black text-base">{type?.title}</p>
          <p className="text-white/50 text-xs">{type?.subtitle}</p>
        </div>
      </div>

      <div className="border-t border-white/10 pt-4 space-y-3">
        <Row label="AC Capacity"  value={`${acKw} kW`} />
        <Row label="DC Capacity"  value={`${dcKwp} kWp`} />
        <Row label="Est. Panels"  value={`~${panels} panels`} />
        {systemType === "bess" && <Row label="Battery Backup" value={`${batKwh} kWh`} />}
      </div>

      <div className="bg-ecoGold/15 border border-ecoGold/30 rounded-2xl p-4">
        <p className="text-xs font-bold text-ecoGold/80 uppercase tracking-wider mb-1">Estimated Budget</p>
        <p className="text-2xl font-black text-ecoGold">
          {formatLKR(range.low)} – {formatLKR(range.high)}
        </p>
        <p className="text-white/40 text-xs mt-1">Supply & installation. VAT & civil extra.</p>
      </div>

      {(name || phone || location) && (
        <div className="border-t border-white/10 pt-4 space-y-1.5 text-sm">
          {name     && <p className="flex gap-2 items-center text-white/70"><User    size={13} className="shrink-0 text-ecoGold" />{name}</p>}
          {phone    && <p className="flex gap-2 items-center text-white/70"><Phone   size={13} className="shrink-0 text-ecoGold" />{phone}</p>}
          {location && <p className="flex gap-2 items-center text-white/70"><MapPin  size={13} className="shrink-0 text-ecoGold" />{location}</p>}
        </div>
      )}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-white/50">{label}</span>
      <span className="font-bold text-white">{value}</span>
    </div>
  );
}

// ─── QuotePage ─────────────────────────────────────────────────────────────────
export default function QuotePage() {
  const [systemType, setSystemType] = useState("ongrid");
  const [acIdx,      setAcIdx]      = useState(3);   // 5 kW default
  const [batIdx,     setBatIdx]     = useState(1);   // 10 kWh default
  const [name,       setName]       = useState("");
  const [phone,      setPhone]      = useState("");
  const [email,      setEmail]      = useState("");
  const [location,   setLocation]   = useState("");
  const [notes,      setNotes]      = useState("");
  const [submitted,  setSubmitted]  = useState(false);

  const acKw  = AC_OPTIONS[acIdx];
  const dcKwp = DC_OPTIONS[acIdx];
  const batKwh = BAT_OPTIONS[batIdx];

  function buildWhatsApp() {
    const type  = SYSTEM_TYPES.find((s) => s.id === systemType);
    const range = priceRange(systemType, acKw, systemType === "bess" ? batKwh : 0);
    const lines = [
      `*Ceylon Eco Power – Solar Quote Request*`,
      ``,
      `*System:* ${type.title}`,
      `*AC Capacity:* ${acKw} kW`,
      `*DC Capacity:* ${dcKwp} kWp`,
      systemType === "bess" ? `*Battery Backup:* ${batKwh} kWh` : null,
      ``,
      `*Customer Details*`,
      name     ? `Name: ${name}`         : null,
      phone    ? `Phone: ${phone}`       : null,
      email    ? `Email: ${email}`       : null,
      location ? `Location: ${location}` : null,
      notes    ? `Notes: ${notes}`       : null,
      ``,
      `*Budget Range:* ${formatLKR(range.low)} – ${formatLKR(range.high)}`,
    ].filter((l) => l !== null).join("\n");

    return `https://wa.me/94716880058?text=${encodeURIComponent(lines)}`;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    window.open(buildWhatsApp(), "_blank");
    setSubmitted(true);
  }

  const inp = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 outline-none focus:border-ecoGreen focus:ring-2 focus:ring-ecoGreen/10 bg-white placeholder-gray-400 transition";

  if (submitted) {
    return (
      <div className="pt-20 min-h-screen bg-ecoCream flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-green-500" />
          </div>
          <h1 className="text-3xl font-black text-ecoDark mb-3">Quote Sent!</h1>
          <p className="text-black/55 mb-8 leading-relaxed">
            Your quote request has been sent via WhatsApp. Our team will contact you within 24 hours with a detailed proposal.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <button onClick={() => setSubmitted(false)} className="px-6 py-3 rounded-full border border-ecoGreen text-ecoGreen font-bold text-sm hover:bg-ecoGreen hover:text-white transition">
              New Quote
            </button>
            <Link to="/" className="px-6 py-3 rounded-full bg-ecoGreen text-white font-bold text-sm hover:bg-[#0f5040] transition flex items-center gap-2">
              Back to Home <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen bg-ecoCream text-ecoDark">
      {/* Hero */}
      <div className="bg-ecoDark text-white py-14">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-ecoGold text-xs font-black tracking-[0.25em] uppercase mb-3">Free Quotation</p>
          <h1 className="text-4xl md:text-5xl font-black leading-tight mb-3">
            Get Your Solar<br />Cost Estimate
          </h1>
          <p className="text-white/55 text-lg max-w-xl">
            Configure your domestic solar system and get an instant budget estimate. We'll follow up with a detailed proposal.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-[1fr_360px] gap-10 items-start">

          {/* ── Form ── */}
          <form onSubmit={handleSubmit} className="space-y-10">

            {/* Step 1 – System Type */}
            <div className="bg-white rounded-3xl border border-black/8 shadow-sm p-8">
              <SectionLabel n="1">Choose System Type</SectionLabel>
              <div className="grid sm:grid-cols-2 gap-4">
                {SYSTEM_TYPES.map((s) => {
                  const Icon    = s.icon;
                  const active  = systemType === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSystemType(s.id)}
                      className={cls(
                        "text-left rounded-2xl border-2 p-5 transition relative",
                        active ? s.color + " shadow-md" : "border-black/10 bg-white hover:border-black/25"
                      )}
                    >
                      {active && (
                        <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-ecoGreen flex items-center justify-center">
                          <CheckCircle size={13} className="text-white" />
                        </span>
                      )}
                      <div className={cls("w-10 h-10 rounded-xl flex items-center justify-center mb-3", active ? s.badge : "bg-gray-100")}>
                        <Icon size={20} className={active ? "" : "text-gray-400"} />
                      </div>
                      <p className="font-black text-base text-ecoDark">{s.title}</p>
                      <p className="text-xs font-semibold text-black/40 mb-2">{s.subtitle}</p>
                      <p className="text-xs text-black/55 leading-relaxed">{s.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2 – AC Capacity */}
            <div className="bg-white rounded-3xl border border-black/8 shadow-sm p-8">
              <SectionLabel n="2">Select AC Capacity</SectionLabel>
              <p className="text-sm text-black/50 mb-4">Inverter output power — matches your electricity consumption needs.</p>
              <div className="flex flex-wrap gap-2">
                {AC_OPTIONS.map((kw, i) => (
                  <CapBtn
                    key={kw}
                    label={`${kw} kW`}
                    active={acIdx === i}
                    onClick={() => setAcIdx(i)}
                  />
                ))}
              </div>
              <div className="mt-4 flex items-center gap-2 bg-gray-50 border border-black/8 rounded-2xl px-4 py-3 text-sm">
                <Zap size={14} className="text-ecoGold shrink-0" />
                <span className="text-black/60">
                  DC panel capacity will be <strong className="text-ecoDark">{dcKwp} kWp</strong> (~{Math.ceil((dcKwp * 1000) / 580)} × 580W panels)
                </span>
              </div>
            </div>

            {/* Step 3 – Battery (BESS only) */}
            {systemType === "bess" && (
              <div className="bg-white rounded-3xl border border-black/8 shadow-sm p-8">
                <SectionLabel n="3">Battery Backup Capacity</SectionLabel>
                <p className="text-sm text-black/50 mb-4">How many hours of backup power do you need during a power cut?</p>
                <div className="flex flex-wrap gap-2">
                  {BAT_OPTIONS.map((kwh, i) => (
                    <CapBtn
                      key={kwh}
                      label={`${kwh} kWh`}
                      active={batIdx === i}
                      onClick={() => setBatIdx(i)}
                    />
                  ))}
                </div>
                <div className="mt-4 flex items-center gap-2 bg-green-50 border border-green-200 rounded-2xl px-4 py-3 text-sm">
                  <BatteryCharging size={14} className="text-green-600 shrink-0" />
                  <span className="text-black/60">
                    <strong className="text-ecoDark">{batKwh} kWh</strong> gives approximately{" "}
                    <strong className="text-ecoDark">{Math.round((batKwh / (acKw * 0.3)) * 10) / 10} – {Math.round((batKwh / (acKw * 0.2)) * 10) / 10} hours</strong> backup at typical load.
                  </span>
                </div>
              </div>
            )}

            {/* Step 4 – Contact Details */}
            <div className="bg-white rounded-3xl border border-black/8 shadow-sm p-8">
              <SectionLabel n={systemType === "bess" ? "4" : "3"}>Your Details</SectionLabel>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      required
                      className={cls(inp, "pl-9")}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+94 7X XXX XXXX"
                      required
                      className={cls(inp, "pl-9")}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Email</label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@email.com"
                      className={cls(inp, "pl-9")}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Location</label>
                  <div className="relative">
                    <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="City / District"
                      className={cls(inp, "pl-9")}
                    />
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Additional Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Roof type, current electricity bill, any other requirements..."
                  className={cls(inp, "resize-none")}
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-ecoGreen hover:bg-[#0f5040] text-white font-black text-lg py-4 rounded-2xl transition flex items-center justify-center gap-3 shadow-lg shadow-ecoGreen/20"
            >
              Send Quote Request via WhatsApp
              <ChevronRight size={20} />
            </button>
            <p className="text-center text-xs text-black/40 -mt-6">
              We'll reply within 24 hours with a detailed proposal. No obligation.
            </p>
          </form>

          {/* ── Summary Panel ── */}
          <div>
            <SummaryCard
              systemType={systemType}
              acKw={acKw}
              dcKwp={dcKwp}
              batKwh={batKwh}
              name={name}
              phone={phone}
              location={location}
            />
            {/* Disclaimer */}
            <div className="mt-4 bg-white border border-black/8 rounded-2xl p-4 text-xs text-black/45 leading-relaxed">
              <strong className="text-black/60">Disclaimer:</strong> Prices are indicative estimates based on current market rates. Final pricing depends on site survey, roof type, cable runs, civil work, and applicable taxes. A formal quotation will be provided after a site visit.
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
