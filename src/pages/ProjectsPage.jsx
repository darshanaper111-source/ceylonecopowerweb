import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, MapPin, Zap } from "lucide-react";
import SectionTitle from "../components/SectionTitle.jsx";
import { projectCategories as defaultCategories } from "../data/projects.js";
import { getStoredProjects } from "../data/storage.js";
import { fbProjects } from "../firebase/db.js";
import { isConfigured } from "../firebase/config.js";

function toProjectShape(p, fallbackId) {
  return {
    id:         p._fbId || p._id || fallbackId,
    title:      p.title,
    location:   p.location,
    acCapacity: p.acCapacity || "—",
    dcCapacity: p.dcCapacity || "—",
    client:     p.client || "—",
    details:    p.details || "",
    photos:     Array.isArray(p.photos) ? p.photos.filter(Boolean) : [],
  };
}

// Merge default + localStorage + Firestore projects
function useCategories() {
  const [fbList, setFbList] = useState([]);

  useEffect(() => {
    if (!isConfigured) return;
    fbProjects.getAll().then(setFbList).catch(() => {});
  }, []);

  const stored = getStoredProjects();

  return defaultCategories.map((cat) => ({
    ...cat,
    projects: [
      ...cat.projects,
      ...stored
        .filter((p) => p.categoryId === cat.id)
        .map((p) => toProjectShape(p, p._id)),
      ...fbList
        .filter((p) => p.categoryId === cat.id)
        .map((p) => toProjectShape(p, p._fbId)),
    ],
  }));
}

// ─── Photo Gallery ────────────────────────────────────────────────────────────
function PhotoGallery({ photos, title }) {
  const [idx, setIdx] = useState(0);
  const list = photos.length > 0 ? photos : ["/images/project-card.svg"];

  const prev = () => setIdx((idx - 1 + list.length) % list.length);
  const next = () => setIdx((idx + 1) % list.length);

  return (
    <div className="relative rounded-2xl overflow-hidden bg-white/5 h-56 group">
      <img
        src={list[idx]}
        alt={`${title} — ${idx + 1}`}
        className="w-full h-full object-cover"
        onError={(e) => { e.currentTarget.src = "/images/project-card.svg"; }}
      />

      {list.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full w-9 h-9 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full w-9 h-9 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
          >
            <ChevronRight size={18} />
          </button>
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
            {list.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className={`w-2 h-2 rounded-full transition ${i === idx ? "bg-ecoGold" : "bg-white/40"}`}
              />
            ))}
          </div>
        </>
      )}

      <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
        {idx + 1} / {list.length}
      </div>
    </div>
  );
}

// ─── Project Card ─────────────────────────────────────────────────────────────
function ProjectCard({ project }) {
  return (
    <div className="rounded-[2rem] overflow-hidden bg-white/5 border border-white/10 hover:border-ecoGold/30 transition">
      <PhotoGallery photos={project.photos} title={project.title} />
      <div className="p-6">
        <h3 className="text-xl font-black leading-snug">{project.title}</h3>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {[
            ["Location",    project.location,   MapPin],
            ["AC Capacity", project.acCapacity,  Zap],
            ["DC Capacity", project.dcCapacity,  Zap],
            ["Client",      project.client,      null],
          ].map(([label, value, Icon]) => (
            <div key={label} className="bg-black/20 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                {Icon && <Icon size={12} className="text-ecoGold shrink-0" />}
                <span className="text-xs font-bold text-ecoGold uppercase tracking-wider">{label}</span>
              </div>
              <p className="text-sm text-white/80">{value}</p>
            </div>
          ))}
        </div>
        {project.details && (
          <p className="mt-4 text-white/55 text-sm leading-relaxed">{project.details}</p>
        )}
      </div>
    </div>
  );
}

// ─── Category Section ─────────────────────────────────────────────────────────
function CategorySection({ category }) {
  if (category.projects.length === 0) return null;
  return (
    <section id={category.id} className="scroll-mt-24">
      <div className="flex items-center gap-4 mb-8">
        <div className={`rounded-full border px-4 py-1.5 text-xs font-black tracking-wider uppercase ${category.color}`}>
          {category.badge}
        </div>
        <h2 className="text-2xl md:text-3xl font-black text-white">{category.label}</h2>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        {category.projects.map((p) => <ProjectCard key={p.id} project={p} />)}
      </div>
    </section>
  );
}

// ─── Category Nav ─────────────────────────────────────────────────────────────
function CategoryNav({ categories }) {
  function jumpTo(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  return (
    <div className="sticky top-20 z-40 bg-ecoDark/95 backdrop-blur border-b border-white/10 py-3 mb-12">
      <div className="max-w-7xl mx-auto px-4 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          {categories.filter((c) => c.projects.length > 0).map((cat) => (
            <button
              key={cat.id}
              onClick={() => jumpTo(cat.id)}
              className="text-xs font-bold px-4 py-2 rounded-full border border-white/10 text-white/65 hover:text-white hover:border-ecoGold/50 transition whitespace-nowrap"
            >
              {cat.badge}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── ProjectsPage ─────────────────────────────────────────────────────────────
export default function ProjectsPage() {
  const categories = useCategories();

  return (
    <div className="pt-20 min-h-screen bg-[#081a14]">
      <div className="max-w-7xl mx-auto px-4 pt-12 pb-8">
        <SectionTitle
          eyebrow="Our Projects"
          title="Solar Projects & Engineering Experience"
          subtitle="Utility scale, commercial rooftop, domestic, hybrid and mini-grid solar projects across Sri Lanka."
        />
      </div>

      <CategoryNav categories={categories} />

      <div className="max-w-7xl mx-auto px-4 pb-24 space-y-20">
        {categories.map((cat) => <CategorySection key={cat.id} category={cat} />)}
      </div>
    </div>
  );
}
