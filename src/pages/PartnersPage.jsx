import React, { useState } from "react";
import { Battery, BatteryCharging, Cable, LayoutGrid, Sun, Zap } from "lucide-react";
import SectionTitle from "../components/SectionTitle.jsx";
import { partnerSections as defaultSections } from "../data/partners.js";
import { getStoredBrands } from "../data/storage.js";

const ICON_MAP = { Sun, Zap, BatteryCharging, Battery, LayoutGrid, Cable };

// Merge default + admin-added brands
function useSections() {
  const stored = getStoredBrands();
  return defaultSections.map((sec) => ({
    ...sec,
    brands: [
      ...sec.brands,
      ...stored
        .filter((b) => b.sectionId === sec.id)
        .map((b) => ({
          id: b._id,
          name: b.name,
          logo: b.logo || "",
          models: Array.isArray(b.models) ? b.models : [],
        })),
    ],
  }));
}

// ─── Brand Logo ───────────────────────────────────────────────────────────────
function BrandLogo({ src, name }) {
  const [err, setErr] = useState(false);
  if (!src || err) {
    const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 3).toUpperCase();
    return (
      <div className="h-16 w-full flex items-center justify-center bg-ecoGold/10 rounded-xl">
        <span className="text-ecoGold font-black text-lg tracking-widest">{initials}</span>
      </div>
    );
  }
  return (
    <img src={src} alt={name} className="h-16 w-full object-contain" onError={() => setErr(true)} />
  );
}

// ─── Brand Card ───────────────────────────────────────────────────────────────
function BrandCard({ brand }) {
  return (
    <div className="bg-ecoCream rounded-3xl border border-black/10 p-6 shadow-md hover:shadow-xl transition flex flex-col gap-4">
      <div className="bg-white rounded-2xl p-4 flex items-center justify-center h-24">
        <BrandLogo src={brand.logo} name={brand.name} />
      </div>
      <h3 className="font-black text-ecoDark text-base">{brand.name}</h3>
      <ul className="space-y-1">
        {brand.models.map((m) => (
          <li key={m} className="flex items-start gap-2 text-sm text-black/60">
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-ecoGold shrink-0" />
            {m}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Partner Section ──────────────────────────────────────────────────────────
function PartnerSection({ section }) {
  const Icon = ICON_MAP[section.icon] || Zap;
  return (
    <section id={section.id} className="scroll-mt-24">
      <div className="flex items-center gap-4 mb-8">
        <div className="h-10 w-10 rounded-full bg-ecoGold text-black flex items-center justify-center shrink-0">
          <Icon size={18} />
        </div>
        <h2 className="text-2xl md:text-3xl font-black text-ecoDark">{section.title}</h2>
      </div>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {section.brands.map((b) => <BrandCard key={b.id} brand={b} />)}
      </div>
    </section>
  );
}

// ─── Section Nav ─────────────────────────────────────────────────────────────
function SectionNav() {
  function jumpTo(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  return (
    <div className="sticky top-20 z-40 bg-white/95 backdrop-blur border-b border-black/10 py-3 mb-12">
      <div className="max-w-7xl mx-auto px-4 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          {defaultSections.map((s) => (
            <button
              key={s.id}
              onClick={() => jumpTo(s.id)}
              className="text-xs font-bold px-4 py-2 rounded-full border border-black/15 text-black/60 hover:text-ecoDark hover:border-ecoGold transition whitespace-nowrap"
            >
              {s.title}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── PartnersPage ─────────────────────────────────────────────────────────────
export default function PartnersPage() {
  const sections = useSections();
  return (
    <div className="pt-20 min-h-screen bg-white text-ecoDark">
      <div className="max-w-7xl mx-auto px-4 pt-12 pb-8">
        <SectionTitle
          light
          eyebrow="Our Partners"
          title="Technology Partners & Brands"
          subtitle="Globally recognised solar panels, inverters, battery systems and components we trust."
        />
      </div>
      <SectionNav />
      <div className="max-w-7xl mx-auto px-4 pb-24 space-y-20">
        {sections.map((s) => <PartnerSection key={s.id} section={s} />)}
      </div>
    </div>
  );
}
