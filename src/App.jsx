import React, { useState } from "react";
import { Battery, Building2, Factory, Home, Mail, MapPin, Menu, Phone, ShieldCheck, Sun, Wrench, Zap } from "lucide-react";
import { services, projects, partners } from "./data.js";

const nav = [
  ["home", "Home"],
  ["projects", "Our Projects"],
  ["partners", "Our Partners"],
  ["contact", "Contact Us"],
];

const icons = [Home, Building2, Factory, Battery, Sun, Wrench];

function Header({ page, setPage }) {
  

  const [open, setOpen] = useState(false);
  return (

    <header className="fixed top-0 inset-x-0 z-50 bg-ecoDark/85 backdrop-blur border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
        <button onClick={() => setPage("home")} className="text-left">
          <div className="text-xl font-black">CEYLON <span className="text-ecoGold">ECO POWER</span></div>
          <div className="text-[10px] tracking-[0.3em] text-white/50">SOLAR ENGINEERING</div>
        </button>
        <nav className="hidden md:flex gap-7">
          {nav.map(([id, label]) => (
            <button key={id} onClick={() => setPage(id)} className={page === id ? "text-ecoGold font-bold" : "text-white/75 hover:text-white"}>{label}</button>
          ))}
        </nav>
        <button onClick={() => setPage("contact")} className="hidden md:block bg-ecoGold text-black rounded-full px-6 py-3 font-bold">Get Free Quote</button>
        <button className="md:hidden" onClick={() => setOpen(!open)}><Menu /></button>
      </div>
      {open && (
        <div className="md:hidden bg-ecoDark border-t border-white/10 p-4">
          {nav.map(([id, label]) => <button key={id} onClick={() => {setPage(id); setOpen(false)}} className="block py-3 text-white/80">{label}</button>)}
        </div>
      )}
    </header>
  );
}

function SectionTitle({ eyebrow, title, subtitle, light=false }) {
  return (
    <div className="max-w-3xl mx-auto text-center mb-12">
      <p className="text-ecoGold text-xs font-black tracking-[0.3em] uppercase">{eyebrow}</p>
      <h2 className={`mt-3 text-4xl md:text-5xl font-black ${light ? "text-ecoDark" : "text-white"}`}>{title}</h2>
      {subtitle && <p className={`mt-4 ${light ? "text-black/60" : "text-white/65"}`}>{subtitle}</p>}
    </div>
  );
}

function HomePage({ setPage }) {
  return (
    <>
      <section className="hero-bg min-h-screen pt-24">
        <div className="max-w-7xl mx-auto px-4 min-h-[calc(100vh-6rem)] grid md:grid-cols-2 gap-10 items-center py-16">
          <div>
            <div className="inline-flex rounded-full border border-ecoGold/30 bg-ecoGold/10 px-4 py-2 text-xs font-bold tracking-[0.25em] text-ecoGold">RENEWABLE ENERGY SRI LANKA</div>
            <h1 className="mt-6 text-5xl md:text-7xl font-black leading-tight">Clean Solar Power for a Sustainable Future</h1>
            <p className="mt-6 text-lg text-white/75 max-w-xl">Ceylon Eco Power designs and installs solar PV, hybrid battery, industrial solar, ground mount solar and solar water pumping systems across Sri Lanka.</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <button onClick={() => setPage("contact")} className="bg-ecoGold text-black rounded-full px-7 py-3 font-bold">Request a Quote</button>
              <button onClick={() => setPage("projects")} className="border border-white/20 rounded-full px-7 py-3 font-bold hover:bg-white/10">View Projects</button>
            </div>
          </div>
          <div className="glass rounded-[2rem] p-5">
            <img src="/images/solar-panel.svg" className="rounded-3xl w-full h-72 object-cover" />
            <div className="grid grid-cols-2 gap-4 mt-5">
              {[["10+ MW","Experience"],["500+","Installations"],["33kV","Grid Expertise"],["24/7","Support"]].map(([a,b]) => (
                <div className="rounded-2xl bg-black/30 border border-white/10 p-5" key={b}><div className="text-2xl font-black text-ecoGold">{a}</div><div className="text-white/60 text-sm">{b}</div></div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white text-ecoDark py-24">
        <div className="max-w-7xl mx-auto px-4">
          <SectionTitle light eyebrow="Who We Are" title="Professional Solar EPC & Energy Engineering Company" subtitle="Safe design, quality installation, reliable maintenance and measurable savings." />
          <div className="grid md:grid-cols-3 gap-6">
            {["Engineering First", "Quality Components", "After Sales Support"].map((t, i) => (
              <div key={t} className="bg-ecoCream rounded-3xl p-8 border border-black/10 shadow-xl">
                <ShieldCheck className="text-ecoGreen" size={42}/>
                <h3 className="mt-5 text-2xl font-black">{t}</h3>
                <p className="mt-3 text-black/65">{i===0 ? "Accurate solar design, cable sizing and protection coordination." : i===1 ? "Panels, inverters and batteries selected for long-term performance." : "Monitoring, troubleshooting, power quality analysis and maintenance."}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4">
          <SectionTitle eyebrow="Solutions" title="Energy Solutions We Provide" subtitle="From home rooftops to utility-scale solar plants." />
          <div className="grid md:grid-cols-3 gap-6">
            {services.map(([title, text], i) => {
              const Icon = icons[i] || Zap;
              return <div key={title} className="rounded-3xl bg-white/5 border border-white/10 p-7 hover:border-ecoGold/70 transition"><Icon className="text-ecoGold" size={42}/><h3 className="mt-5 text-xl font-black">{title}</h3><p className="mt-3 text-white/65">{text}</p></div>
            })}
          </div>
        </div>
      </section>
    </>
  );
}

function ProjectsPage() {
  return (
    <section className="min-h-screen pt-28 py-16">
      <div className="max-w-7xl mx-auto px-4">
        <SectionTitle eyebrow="Our Projects" title="Solar Projects & Engineering Experience" subtitle="Solar PV, industrial, agriculture and utility-scale work." />
        <div className="grid md:grid-cols-2 gap-6">
          {projects.map(([title, category, location, capacity, details]) => (
            <div key={title} className="rounded-[2rem] overflow-hidden bg-white/5 border border-white/10">
              <img src="/images/project-card.svg" className="w-full h-56 object-cover" />
              <div className="p-7">
                <span className="inline-flex rounded-full bg-ecoGold/15 px-4 py-2 text-xs font-bold text-ecoGold">{category}</span>
                <h3 className="mt-4 text-2xl font-black">{title}</h3>
                <div className="mt-4 grid grid-cols-3 gap-3 text-sm text-white/70">
                  <div><b className="text-white">Capacity</b><br />{capacity}</div>
                  <div><b className="text-white">Location</b><br />{location}</div>
                  <div><b className="text-white">Type</b><br />{category}</div>
                </div>
                <p className="mt-5 text-white/65">{details}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PartnersPage() {
  return (
    <section className="min-h-screen bg-white text-ecoDark pt-28 py-16">
      <div className="max-w-7xl mx-auto px-4">
        <SectionTitle light eyebrow="Our Partners" title="Technology Partners & Brands" subtitle="Globally recognized solar, inverter and energy storage brands." />
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-5">
          {partners.map((p) => (
            <div key={p} className="rounded-3xl bg-ecoCream border border-black/10 p-8 text-center shadow-lg">
              <div className="mx-auto mb-5 h-16 w-16 bg-ecoGreen text-ecoGold rounded-full flex items-center justify-center"><Zap /></div>
              <h3 className="font-black text-lg">{p}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ContactPage() {
  return (
    <section className="min-h-screen pt-28 py-16">
      <div className="max-w-7xl mx-auto px-4">
        <SectionTitle eyebrow="Contact Us" title="Start Your Solar Journey Today" subtitle="Send your bill, project details or location. We will prepare a suitable proposal." />
        <div className="grid md:grid-cols-2 gap-8">
          <div className="glass rounded-[2rem] p-8">
            <h3 className="text-2xl font-black">Get in Touch</h3>
            {[["Phone","+94 70 000 0000",Phone],["Email","info@ceylonecopower.com",Mail],["Office","Sri Lanka",MapPin]].map(([t,v,Icon]) => (
              <div className="flex gap-4 mt-7" key={t}><div className="h-12 w-12 rounded-full bg-ecoGold text-black flex items-center justify-center"><Icon /></div><div><b>{t}</b><p className="text-white/65">{v}</p></div></div>
            ))}
          </div>
          <form className="bg-white text-ecoDark rounded-[2rem] p-8">
            <h3 className="text-2xl font-black">Request a Quote</h3>
            <div className="grid gap-4 mt-6">
              <input placeholder="Your Name" className="rounded-2xl border p-4"/>
              <input placeholder="Phone Number" className="rounded-2xl border p-4"/>
              <input placeholder="Email Address" className="rounded-2xl border p-4"/>
              <select className="rounded-2xl border p-4"><option>Residential Solar</option><option>Commercial Solar</option><option>Industrial Solar</option><option>Hybrid Battery System</option><option>Power Quality Analysis</option></select>
              <textarea placeholder="Project details / monthly bill / location" rows="5" className="rounded-2xl border p-4"/>
              <button type="button" className="bg-ecoGreen text-white rounded-full py-4 font-black">Submit Request</button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

function Footer({ setPage }) {
  return (
    <footer className="bg-black border-t border-white/10 py-10">
      <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-4 gap-8 text-white/65">
        <div><div className="text-xl font-black text-white">CEYLON <span className="text-ecoGold">ECO POWER</span></div><p className="mt-3">Solar PV • Battery Storage • Energy Engineering</p></div>
        <div><b className="text-white">Pages</b>{nav.map(([id,label]) => <button key={id} onClick={() => setPage(id)} className="block mt-2 hover:text-white">{label}</button>)}</div>
        <div><b className="text-white">Solutions</b><p className="mt-3">Residential Solar<br/>Industrial Solar<br/>Hybrid Battery<br/>Solar Pumping</p></div>
        <div><b className="text-white">Contact</b><p className="mt-3">info@ceylonecopower.com<br/>+94 70 000 0000<br/>Sri Lanka</p></div>
      </div>
    </footer>
  );
}

export default function App() {
  const [page, setPage] = useState("home");
  return <><Header page={page} setPage={setPage}/>{page==="home"&&<HomePage setPage={setPage}/>} {page==="projects"&&<ProjectsPage/>} {page==="partners"&&<PartnersPage/>} {page==="contact"&&<ContactPage/>}<Footer setPage={setPage}/></>;
}
