import React from "react";
import { Link } from "react-router-dom";
import {
  Battery, BatteryCharging, Building2, Factory, Home,
  Radio, ShieldCheck, Store, Sun, Zap,
} from "lucide-react";
import SectionTitle from "../components/SectionTitle.jsx";
import { serviceCategories } from "../data/services.js";

const ICON_MAP = {
  Factory, Building2, Sun, Store, Home, BatteryCharging, Radio, Zap, Battery,
};

// ─── Hero ────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="hero-bg min-h-screen pt-20">
      <div className="max-w-7xl mx-auto px-4 min-h-[calc(100vh-5rem)] grid md:grid-cols-2 gap-12 items-center py-20">
        <div>
          <div className="inline-flex rounded-full border border-ecoGold/30 bg-ecoGold/10 px-4 py-2 text-xs font-bold tracking-[0.25em] text-ecoGold uppercase">
            Renewable Energy · Sri Lanka
          </div>
          <h1 className="mt-6 text-5xl md:text-6xl xl:text-7xl font-black leading-tight">
            Clean Solar Power<br />
            <span className="text-ecoGold">for a Sustainable</span><br />
            Future
          </h1>
          <p className="mt-6 text-lg text-white/70 max-w-xl leading-relaxed">
            Ceylon Eco Power designs and installs solar PV, hybrid battery, industrial solar,
            ground-mount solar and solar water-pumping systems across Sri Lanka.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/contact"
              className="bg-ecoGold text-black rounded-full px-8 py-3.5 font-bold hover:bg-yellow-400 transition"
            >
              Request a Quote
            </Link>
            <Link
              to="/projects"
              className="border border-white/25 rounded-full px-8 py-3.5 font-bold hover:bg-white/10 transition"
            >
              View Projects
            </Link>
          </div>
        </div>

        <div className="glass rounded-[2rem] p-5">
          <video
            autoPlay
            muted
            loop
            playsInline
            poster="/images/hero-photo.JPG"
            className="rounded-3xl w-full h-72 object-cover"
          >
            <source src="/images/hero-video.mp4" type="video/mp4" />
          </video>
          <div className="grid grid-cols-2 gap-4 mt-5">
            {[
              ["10+ MW",  "Installed Capacity"],
              ["500+",    "Installations"],
              ["33 kV",   "Grid Expertise"],
              ["24/7",    "Support"],
            ].map(([a, b]) => (
              <div key={b} className="rounded-2xl bg-black/30 border border-white/10 p-5">
                <div className="text-2xl font-black text-ecoGold">{a}</div>
                <div className="text-white/55 text-sm mt-1">{b}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Image Banner ─────────────────────────────────────────────────────────────
function ImageBanner() {
  return (
    <div className="relative w-full h-64 md:h-96 overflow-hidden">
      <img
        src="/images/hero-photo.JPG"
        alt="Ceylon Eco Power solar installation"
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-ecoDark/75 via-ecoDark/35 to-transparent flex items-center px-8 md:px-20">
        <div>
          <p className="text-ecoGold text-xs font-black tracking-[0.3em] uppercase mb-2">Our Work</p>
          <h2 className="text-3xl md:text-4xl font-black text-white leading-tight">
            Powering Sri Lanka<br />with Clean Energy
          </h2>
        </div>
      </div>
    </div>
  );
}

// ─── About ────────────────────────────────────────────────────────────────────
function About() {
  const cards = [
    { title: "Engineering First",    body: "Accurate solar design, cable sizing and protection coordination for every project." },
    { title: "Quality Components",   body: "Panels, inverters and batteries selected for long-term performance and reliability." },
    { title: "After-Sales Support",  body: "Monitoring, troubleshooting, power quality analysis and scheduled maintenance." },
  ];

  return (
    <section className="bg-white text-ecoDark py-24">
      <div className="max-w-7xl mx-auto px-4">
        <SectionTitle
          light
          eyebrow="Who We Are"
          title="Professional Solar EPC & Energy Engineering Company"
          subtitle="Safe design, quality installation, reliable maintenance and measurable savings."
        />
        <div className="grid md:grid-cols-3 gap-6">
          {cards.map((c) => (
            <div key={c.title} className="bg-ecoCream rounded-3xl p-8 border border-black/10 shadow-lg">
              <ShieldCheck className="text-ecoGreen" size={40} />
              <h3 className="mt-5 text-xl font-black">{c.title}</h3>
              <p className="mt-3 text-black/60 leading-relaxed">{c.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Services ─────────────────────────────────────────────────────────────────
function Services() {
  return (
    <section className="py-24 bg-ecoDark">
      <div className="max-w-7xl mx-auto px-4">
        <SectionTitle
          eyebrow="Solutions"
          title="Energy Solutions We Provide"
          subtitle="From home rooftops to utility-scale solar plants and off-grid mini grids."
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {serviceCategories.map((svc) => {
            const Icon = ICON_MAP[svc.icon] || Zap;
            return (
              <div
                key={svc.id}
                className="rounded-3xl bg-white/5 border border-white/10 p-6 hover:border-ecoGold/60 transition"
              >
                <Icon className="text-ecoGold" size={38} />
                <div className="mt-2 text-xs font-bold text-ecoGold/70 tracking-wider uppercase">
                  {svc.range}
                </div>
                <h3 className="mt-2 text-lg font-black leading-snug">{svc.title}</h3>
                <p className="mt-3 text-white/55 text-sm leading-relaxed">{svc.desc}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <Link
            to="/projects"
            className="inline-block bg-ecoGold text-black rounded-full px-8 py-3.5 font-bold hover:bg-yellow-400 transition"
          >
            See Our Projects
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── HomePage ─────────────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <>
      <Hero />
      <ImageBanner />
      <About />
      <Services />
    </>
  );
}
