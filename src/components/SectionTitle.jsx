import React from "react";

export default function SectionTitle({ eyebrow, title, subtitle, light = false }) {
  return (
    <div className="max-w-3xl mx-auto text-center mb-14">
      <p className="text-ecoGold text-xs font-black tracking-[0.3em] uppercase">{eyebrow}</p>
      <h2 className={`mt-3 text-4xl md:text-5xl font-black leading-tight ${light ? "text-ecoDark" : "text-white"}`}>
        {title}
      </h2>
      {subtitle && (
        <p className={`mt-4 text-base ${light ? "text-black/60" : "text-white/60"}`}>{subtitle}</p>
      )}
    </div>
  );
}
