import React, { useEffect, useState } from "react";
import { Battery, BatteryCharging, Cable, ChevronLeft, ChevronRight, LayoutGrid, Sun, Zap } from "lucide-react";
import SectionTitle from "../components/SectionTitle.jsx";
import { partnerSections as defaultSections } from "../data/partners.js";
import { getStoredBrands } from "../data/storage.js";
import { fbBrands } from "../firebase/db.js";
import { isConfigured } from "../firebase/config.js";

const ICON_MAP = { Sun, Zap, BatteryCharging, Battery, LayoutGrid, Cable };

function toBrandShape(b, fallbackId) {
  return {
    id:     b._fbId || b._id || fallbackId,
    name:   b.name,
    logo:   b.logo || "",
    models: Array.isArray(b.models) ? b.models : [],
    photos: Array.isArray(b.photos) ? b.photos.filter(Boolean) : [],
  };
}

// Merge default brands + localStorage + Firestore brands per section
function useSections() {
  const [fbList, setFbList] = useState([]);

  useEffect(() => {
    if (!isConfigured) return;
    fbBrands.getAll().then(setFbList).catch(() => {});
  }, []);

  const stored = getStoredBrands();

  return defaultSections.map((sec) => ({
    ...sec,
    brands: [
      ...sec.brands,
      ...stored
        .filter((b) => b.sectionId === sec.id)
        .map((b) => toBrandShape(b, b._id)),
      ...fbList
        .filter((b) => b.sectionId === sec.id)
        .map((b) => toBrandShape(b, b._fbId)),
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
        <span className="text-ecoGold font-black text-xl tracking-widest">{initials}</span>
      </div>
    );
  }
  return <img src={src} alt={name} className="h-16 w-full object-contain" onError={() => setErr(true)} />;
}

// ─── Brand Photo Gallery ──────────────────────────────────────────────────────
function BrandGallery({ photos }) {
  const [idx, setIdx] = useState(0);
  if (!photos || photos.length === 0) return null;

  return (
    <div className="relative rounded-xl overflow-hidden h-44 group mt-2">
      <img
        src={photos[idx]}
        alt=""
        className="w-full h-full object-cover"
        onError={(e) => { e.currentTarget.style.display = "none"; }}
      />
      {photos.length > 1 && (
        <>
          <button
            onClick={() => setIdx((idx - 1 + photos.length) % photos.length)}
            className="absolute left-1 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-7 h-7 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            onClick={() => setIdx((idx + 1) % photos.length)}
            className="absolute right-1 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-7 h-7 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
          >
            <ChevronRight size={14} />
          </button>
          <div className="absolute bottom-1.5 left-0 right-0 flex justify-center gap-1">
            {photos.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className={`w-1.5 h-1.5 rounded-full transition ${i === idx ? "bg-ecoGold" : "bg-white/50"}`}
              />
            ))}
          </div>
          <div className="absolute top-1.5 right-1.5 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded-full">
            {idx + 1}/{photos.length}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Brand Card ───────────────────────────────────────────────────────────────
function BrandCard({ brand }) {
  const hasPhotos = brand.photos && brand.photos.length > 0;
  return (
    <div className="bg-ecoCream rounded-3xl border border-black/10 shadow-md hover:shadow-xl transition flex flex-col overflow-hidden">
      {/* Logo area */}
      <div className="bg-white p-5 flex items-center justify-center h-24 border-b border-black/5">
        <BrandLogo src={brand.logo} name={brand.name} />
      </div>

      {/* Photo gallery (only if photos uploaded) */}
      {hasPhotos && (
        <div className="px-4 pt-3">
          <BrandGallery photos={brand.photos} />
        </div>
      )}

      {/* Name + models */}
      <div className="p-5 flex flex-col gap-3 flex-1">
        <h3 className="font-black text-ecoDark text-base">{brand.name}</h3>
        {brand.models.length > 0 && (
          <ul className="space-y-1">
            {brand.models.map((m) => (
              <li key={m} className="flex items-start gap-2 text-sm text-black/60">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-ecoGold shrink-0" />
                {m}
              </li>
            ))}
          </ul>
        )}
      </div>
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
