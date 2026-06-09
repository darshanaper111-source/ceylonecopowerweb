import React from "react";
import { Link } from "react-router-dom";

const NAV = [
  ["/",           "Home"],
  ["/projects",   "Our Projects"],
  ["/partners",   "Our Partners"],
  ["/shop",       "Shop"],
  ["/monitoring", "Monitoring"],
  ["/quote",      "Get Quote"],
  ["/contact",    "Contact Us"],
];

export default function Footer() {
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
          {NAV.map(([path, label]) => (
            <Link key={path} to={path} className="block mt-2 hover:text-white transition">{label}</Link>
          ))}
        </div>
        <div>
          <p className="font-bold text-white mb-3">Solutions</p>
          <p className="leading-relaxed">
            Residential Solar<br />Commercial Solar<br />Industrial Solar<br />
            Hybrid Battery + BESS<br />Mini Grid Systems
          </p>
        </div>
        <div>
          <p className="font-bold text-white mb-3">Contact</p>
          <p className="leading-relaxed">
            info@ceylonecopower.com<br />+94 70 000 0000<br />Sri Lanka
          </p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 mt-10 pt-6 border-t border-white/10 text-center text-white/30 text-xs">
        © {new Date().getFullYear()} Ceylon Eco Power. All rights reserved.
      </div>
    </footer>
  );
}
