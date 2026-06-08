import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";

const NAV = [
  ["/",         "Home"],
  ["/projects", "Our Projects"],
  ["/partners", "Our Partners"],
  ["/shop",     "Shop"],
  ["/contact",  "Contact Us"],
];

export default function Header() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-ecoDark/90 backdrop-blur border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
        <Link to="/" className="text-left" onClick={() => setOpen(false)}>
          <div className="text-xl font-black tracking-wide">
            CEYLON <span className="text-ecoGold">ECO POWER</span>
          </div>
          <div className="text-[10px] tracking-[0.3em] text-white/50 uppercase">Solar Engineering</div>
        </Link>

        <nav className="hidden md:flex gap-7">
          {NAV.map(([path, label]) => (
            <Link
              key={path}
              to={path}
              className={`text-sm font-semibold transition ${
                pathname === path ? "text-ecoGold" : "text-white/70 hover:text-white"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        <Link
          to="/contact"
          className="hidden md:block bg-ecoGold text-black rounded-full px-6 py-2.5 text-sm font-bold hover:bg-yellow-400 transition"
        >
          Get Free Quote
        </Link>

        <button className="md:hidden text-white" onClick={() => setOpen(!open)}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-ecoDark border-t border-white/10 px-4 pb-4">
          {NAV.map(([path, label]) => (
            <Link
              key={path}
              to={path}
              onClick={() => setOpen(false)}
              className={`block w-full text-left py-3 text-sm font-semibold border-b border-white/5 ${
                pathname === path ? "text-ecoGold" : "text-white/75"
              }`}
            >
              {label}
            </Link>
          ))}
          <Link
            to="/contact"
            onClick={() => setOpen(false)}
            className="mt-4 block w-full text-center bg-ecoGold text-black rounded-full py-3 font-bold text-sm"
          >
            Get Free Quote
          </Link>
        </div>
      )}
    </header>
  );
}
