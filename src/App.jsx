import React, { useEffect, useState } from "react";
import {
  Battery, Building2, Factory, Home, Mail, MapPin,
  Menu, Phone, ShieldCheck, Sun, Wrench, X, Zap
} from "lucide-react";
import { services, projects, partners } from "./data.js";

const NAV = [
  ["home",     "Home"],
  ["projects", "Our Projects"],
  ["partners", "Our Partners"],
  ["contact",  "Contact Us"],
];

const SERVICE_ICONS = [Home, Building2, Factory, Battery, Sun, Wrench];

function scrollTo(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ─── Header ────────────────────────────────────────────────────────────────
function Header({ active }) {
  const [open, setOpen] = useState(false);

  function nav(id) {
    scrollTo(id);
    setOpen(false);
  }

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-ecoDark/90 backdrop-blur border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
        {/* Logo */}
        <button onClick={() => nav("home")} className="text-left">
          <div className="text-xl font-black tracking-wide">
            CEYLONTTT <span className="text-ecoGold">ECO POWER</span>
          </div>
          <div className="text-[10px] tracking-[0.3em] text-white/50 uppercase">Solar Engineering</div>
        </button>

        {/* Desktop nav */}
        <nav className="hidden md:flex gap-7">
          {NAV.map(([id, label]) => (
            <button
              key={id}
              onClick={() => nav(id)}
              className={`text-sm font-semibold transition ${
                active === id ? "text-ecoGold" : "text-white/70 hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </nav>

        <button
          onClick={() => nav("contact")}
          className="hidden md:block bg-ecoGold text-black rounded-full px-6 py-2.5 text-sm font-bold hover:bg-yellow-400 transition"
        >
          Get Free Quote
        </button>

        {/* Mobile hamburger */}
        <button className="md:hidden text-white" onClick={() => setOpen(!open)}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden bg-ecoDark border-t border-white/10 px-4 pb-4">
          {NAV.map(([id, label]) => (
            <button
              key={id}
              onClick={() => nav(id)}
              className={`block w-full text-left py-3 text-sm font-semibold border-b border-white/5 ${
                active === id ? "text-ecoGold" : "text-white/75"
              }`}
            >
              {label}
            </button>
          ))}
          <button
            onClick={() => nav("contact")}
            className="mt-4 w-full bg-ecoGold text-black rounded-full py-3 font-bold text-sm"
          >
            Get Free Quote
          </button>
        </div>
      )}
    </header>
  );
}

// ─── Section Title ──────────────────────────────────────────────────────────
function SectionTitle({ eyebrow, title, subtitle, light = false }) {
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

// ─── Hero ───────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section id="home" className="hero-bg min-h-screen pt-20">
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
            <button
              onClick={() => scrollTo("contact")}
              className="bg-ecoGold text-black rounded-full px-8 py-3.5 font-bold hover:bg-yellow-400 transition"
            >
              Request a Quote
            </button>
            <button
              onClick={() => scrollTo("projects")}
              className="border border-white/25 rounded-full px-8 py-3.5 font-bold hover:bg-white/10 transition"
            >
              View Projects
            </button>
          </div>
        </div>

        <div className="glass rounded-[2rem] p-5">
          <img src="/images/solar-panel.svg" className="rounded-3xl w-full h-72 object-cover" alt="Solar panel" />
          <div className="grid grid-cols-2 gap-4 mt-5">
            {[["10+ MW", "Installed Capacity"], ["500+", "Installations"], ["33 kV", "Grid Expertise"], ["24/7", "Support"]].map(([a, b]) => (
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

// ─── About ──────────────────────────────────────────────────────────────────
function About() {
  const cards = [
    {
      title: "Engineering First",
      body: "Accurate solar design, cable sizing and protection coordination for every project.",
    },
    {
      title: "Quality Components",
      body: "Panels, inverters and batteries selected for long-term performance and reliability.",
    },
    {
      title: "After-Sales Support",
      body: "Monitoring, troubleshooting, power quality analysis and scheduled maintenance.",
    },
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

// ─── Services ───────────────────────────────────────────────────────────────
function Services() {
  return (
    <section className="py-24 bg-ecoDark">
      <div className="max-w-7xl mx-auto px-4">
        <SectionTitle
          eyebrow="Solutions"
          title="Energy Solutions We Provide"
          subtitle="From home rooftops to utility-scale solar plants."
        />
        <div className="grid md:grid-cols-3 gap-6">
          {services.map(([title, text], i) => {
            const Icon = SERVICE_ICONS[i] || Zap;
            return (
              <div
                key={title}
                className="rounded-3xl bg-white/5 border border-white/10 p-7 hover:border-ecoGold/60 transition"
              >
                <Icon className="text-ecoGold" size={40} />
                <h3 className="mt-5 text-xl font-black">{title}</h3>
                <p className="mt-3 text-white/60 leading-relaxed">{text}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── Projects ───────────────────────────────────────────────────────────────
function Projects() {
  return (
    <section id="projects" className="py-24 bg-[#081a14]">
      <div className="max-w-7xl mx-auto px-4">
        <SectionTitle
          eyebrow="Our Projects"
          title="Solar Projects & Engineering Experience"
          subtitle="Solar PV, industrial, agriculture and utility-scale work across Sri Lanka."
        />
        <div className="grid md:grid-cols-2 gap-6">
          {projects.map(([title, category, location, capacity, details]) => (
            <div key={title} className="rounded-[2rem] overflow-hidden bg-white/5 border border-white/10 hover:border-ecoGold/40 transition">
              <img src="/images/project-card.svg" className="w-full h-52 object-cover" alt={title} />
              <div className="p-7">
                <span className="inline-flex rounded-full bg-ecoGold/15 px-4 py-1.5 text-xs font-bold text-ecoGold">
                  {category}
                </span>
                <h3 className="mt-4 text-xl font-black">{title}</h3>
                <div className="mt-4 grid grid-cols-3 gap-3 text-sm text-white/60">
                  <div><span className="block font-bold text-white mb-1">Capacity</span>{capacity}</div>
                  <div><span className="block font-bold text-white mb-1">Location</span>{location}</div>
                  <div><span className="block font-bold text-white mb-1">Type</span>{category}</div>
                </div>
                <p className="mt-5 text-white/60 leading-relaxed">{details}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Partners ───────────────────────────────────────────────────────────────
function Partners() {
  return (
    <section id="partners" className="py-24 bg-white text-ecoDark">
      <div className="max-w-7xl mx-auto px-4">
        <SectionTitle
          light
          eyebrow="Our Partners"
          title="Technology Partners & Brands"
          subtitle="Globally recognised solar, inverter and energy-storage brands we work with."
        />
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-5">
          {partners.map((p) => (
            <div key={p} className="rounded-3xl bg-ecoCream border border-black/10 p-8 text-center shadow-md hover:shadow-xl transition">
              <div className="mx-auto mb-5 h-16 w-16 bg-ecoGreen text-ecoGold rounded-full flex items-center justify-center">
                <Zap size={28} />
              </div>
              <h3 className="font-black text-base">{p}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Contact ────────────────────────────────────────────────────────────────
function Contact() {
  return (
    <section id="contact" className="py-24 bg-ecoDark">
      <div className="max-w-7xl mx-auto px-4">
        <SectionTitle
          eyebrow="Contact Us"
          title="Start Your Solar Journey Today"
          subtitle="Send your bill, project details or location — we'll prepare a suitable proposal."
        />
        <div className="grid md:grid-cols-2 gap-8">
          {/* Info card */}
          <div className="glass rounded-[2rem] p-8 flex flex-col gap-6">
            <h3 className="text-2xl font-black">Get in Touch</h3>
            {[
              ["Phone",  "+94 70 000 0000",       Phone],
              ["Email",  "info@ceylonecopower.com", Mail],
              ["Office", "Sri Lanka",               MapPin],
            ].map(([label, value, Icon]) => (
              <div key={label} className="flex items-start gap-4">
                <div className="h-12 w-12 shrink-0 rounded-full bg-ecoGold text-black flex items-center justify-center">
                  <Icon size={20} />
                </div>
                <div>
                  <p className="font-bold">{label}</p>
                  <p className="text-white/60 text-sm mt-0.5">{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Quote form */}
          <form className="bg-white text-ecoDark rounded-[2rem] p-8" onSubmit={(e) => e.preventDefault()}>
            <h3 className="text-2xl font-black">Request a Quote</h3>
            <div className="grid gap-4 mt-6">
              <input
                placeholder="Your Name"
                className="rounded-2xl border border-black/15 p-4 text-sm outline-none focus:border-ecoGreen"
              />
              <input
                placeholder="Phone Number"
                className="rounded-2xl border border-black/15 p-4 text-sm outline-none focus:border-ecoGreen"
              />
              <input
                placeholder="Email Address"
                type="email"
                className="rounded-2xl border border-black/15 p-4 text-sm outline-none focus:border-ecoGreen"
              />
              <select className="rounded-2xl border border-black/15 p-4 text-sm outline-none focus:border-ecoGreen bg-white">
                <option>Residential Solar</option>
                <option>Commercial Solar</option>
                <option>Industrial Solar</option>
                <option>Hybrid Battery System</option>
                <option>Solar Water Pumping</option>
                <option>Power Quality Analysis</option>
              </select>
              <textarea
                placeholder="Project details / monthly bill / location"
                rows={5}
                className="rounded-2xl border border-black/15 p-4 text-sm outline-none focus:border-ecoGreen resize-none"
              />
              <button
                type="submit"
                className="bg-ecoGreen text-white rounded-full py-4 font-black hover:bg-[#0f5040] transition"
              >
                Submit Request
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ─────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="bg-black border-t border-white/10 py-12">
      <div className="max-w-7xl mx-auto px-4 grid sm:grid-cols-2 md:grid-cols-4 gap-8 text-white/55 text-sm">
        <div>
          <div className="text-lg font-black text-white mb-3">
            CEYLON <span className="text-ecoGold">ECO POWER</span>
          </div>
          <p className="leading-relaxed">Solar PV · Battery Storage · Energy Engineering</p>
        </div>

        <div>
          <p className="font-bold text-white mb-3">Pages</p>
          {NAV.map(([id, label]) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className="block mt-2 hover:text-white transition"
            >
              {label}
            </button>
          ))}
        </div>

        <div>
          <p className="font-bold text-white mb-3">Solutions</p>
          <p className="leading-relaxed">
            Residential Solar<br />
            Industrial Solar<br />
            Hybrid Battery<br />
            Solar Pumping
          </p>
        </div>

        <div>
          <p className="font-bold text-white mb-3">Contact</p>
          <p className="leading-relaxed">
            info@ceylonecopower.com<br />
            +94 70 000 0000<br />
            Sri Lanka
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-10 pt-6 border-t border-white/10 text-center text-white/30 text-xs">
        © {new Date().getFullYear()} Ceylon Eco Power. All rights reserved.
      </div>
    </footer>
  );
}

// ─── Scroll-spy hook ─────────────────────────────────────────────────────────
function useActiveSection(ids) {
  const [active, setActive] = useState(ids[0]);

  useEffect(() => {
    const observers = ids.map((id) => {
      const el = document.getElementById(id);
      if (!el) return null;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActive(id); },
        { rootMargin: "-40% 0px -55% 0px" }
      );
      obs.observe(el);
      return obs;
    });
    return () => observers.forEach((o) => o?.disconnect());
  }, []);

  return active;
}

// ─── App ─────────────────────────────────────────────────────────────────────
export default function App() {
  const active = useActiveSection(["home", "projects", "partners", "contact"]);

  return (
    <>
      <Header active={active} />
      <main>
        <Hero />
        <About />
        <Services />
        <Projects />
        <Partners />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
