import React from "react";
import { Mail, MapPin, Phone } from "lucide-react";
import SectionTitle from "../components/SectionTitle.jsx";

export default function ContactPage() {
  return (
    <section className="pt-20 min-h-screen bg-ecoDark">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <SectionTitle eyebrow="Contact Us" title="Start Your Solar Journey Today" subtitle="Send your bill, project details or location — we'll prepare a suitable proposal." />
        <div className="grid md:grid-cols-2 gap-8">
          <div className="glass rounded-[2rem] p-8 flex flex-col gap-6">
            <h3 className="text-2xl font-black">Get in Touch</h3>
            {[["Phone","+94 70 000 0000",Phone],["Email","info@ceylonecopower.com",Mail],["Office","Sri Lanka",MapPin]].map(([label,value,Icon]) => (
              <div key={label} className="flex items-start gap-4">
                <div className="h-12 w-12 shrink-0 rounded-full bg-ecoGold text-black flex items-center justify-center"><Icon size={20} /></div>
                <div><p className="font-bold">{label}</p><p className="text-white/60 text-sm mt-0.5">{value}</p></div>
              </div>
            ))}
          </div>
          <form className="bg-white text-ecoDark rounded-[2rem] p-8" onSubmit={(e) => e.preventDefault()}>
            <h3 className="text-2xl font-black">Request a Quote</h3>
            <div className="grid gap-4 mt-6">
              <input placeholder="Your Name" className="rounded-2xl border border-black/15 p-4 text-sm outline-none focus:border-ecoGreen" />
              <input placeholder="Phone Number" className="rounded-2xl border border-black/15 p-4 text-sm outline-none focus:border-ecoGreen" />
              <input type="email" placeholder="Email Address" className="rounded-2xl border border-black/15 p-4 text-sm outline-none focus:border-ecoGreen" />
              <select className="rounded-2xl border border-black/15 p-4 text-sm outline-none focus:border-ecoGreen bg-white">
                <option value="">Select System Type</option>
                <option>Utility Scale Ground Mounted (Above 10 MW)</option>
                <option>Large Scale Commercial Rooftop (1 MW – 10 MW)</option>
                <option>Medium Range Rooftop (100 kW – 1 MW)</option>
                <option>Commercial Rooftop (5 kW – 100 kW)</option>
                <option>Domestic Rooftop (5 kW – 40 kW)</option>
                <option>Hybrid Domestic Solar + BESS (5 kW – 20 kW)</option>
                <option>Commercial BESS & Hybrid Rooftop</option>
                <option>Mini Grid Solar Project</option>
              </select>
              <textarea placeholder="Project details / monthly bill / location" rows={5} className="rounded-2xl border border-black/15 p-4 text-sm outline-none focus:border-ecoGreen resize-none" />
              <button type="submit" className="bg-ecoGreen text-white rounded-full py-4 font-black hover:bg-[#0f5040] transition">Submit Request</button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
