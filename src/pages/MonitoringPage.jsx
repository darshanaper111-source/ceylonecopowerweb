import React, { useEffect, useState } from "react";
import {
  Activity, ArrowLeft, ExternalLink, Maximize2, Minimize2,
  Monitor, User, WifiOff, Loader,
} from "lucide-react";
import { isConfigured } from "../firebase/config.js";
import { fbMonitorSites } from "../firebase/db.js";
import { getStoredMonitorSites, INSTALLER_PASSWORD } from "../data/storage.js";

const SESSION_KEY = "cep_mon_installer";
function cls(...a) { return a.filter(Boolean).join(" "); }

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    active:      "bg-green-100 text-green-700",
    offline:     "bg-red-100 text-red-600",
    maintenance: "bg-yellow-100 text-yellow-700",
  };
  const dot = {
    active:      "bg-green-500",
    offline:     "bg-red-500",
    maintenance: "bg-yellow-500",
  };
  return (
    <span className={cls("inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full", map[status] || map.active)}>
      <span className={cls("w-1.5 h-1.5 rounded-full", dot[status] || dot.active)} />
      {(status || "active").charAt(0).toUpperCase() + (status || "active").slice(1)}
    </span>
  );
}

// ─── Landing ──────────────────────────────────────────────────────────────────
function Landing({ onInstaller, onCustomer }) {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-12">
          <div className="inline-flex w-20 h-20 bg-ecoGreen/10 rounded-3xl items-center justify-center mb-5">
            <Activity size={34} className="text-ecoGreen" />
          </div>
          <h1 className="text-4xl font-black text-ecoDark mb-3">Online Monitoring</h1>
          <p className="text-black/50 text-lg">Real-time solar system performance data</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-5">
          {/* Installer */}
          <button onClick={onInstaller}
            className="group border-2 border-black/10 hover:border-ecoGreen bg-white rounded-3xl p-8 text-left transition hover:shadow-xl">
            <div className="w-14 h-14 bg-ecoDark group-hover:bg-ecoGreen rounded-2xl flex items-center justify-center mb-5 transition">
              <Monitor size={24} className="text-white" />
            </div>
            <h2 className="text-xl font-black text-ecoDark mb-2">Installer / Engineer</h2>
            <p className="text-sm text-black/50 leading-relaxed">
              Access all commissioned project dashboards. View live generation, alarms and performance data for every site.
            </p>
          </button>
          {/* Customer */}
          <button onClick={onCustomer}
            className="group border-2 border-black/10 hover:border-ecoGold bg-white rounded-3xl p-8 text-left transition hover:shadow-xl">
            <div className="w-14 h-14 bg-ecoGold rounded-2xl flex items-center justify-center mb-5">
              <User size={24} className="text-white" />
            </div>
            <h2 className="text-xl font-black text-ecoDark mb-2">Customer / Owner</h2>
            <p className="text-sm text-black/50 leading-relaxed">
              View your solar system's live performance. Use the Site Code and PIN provided by your installer.
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Login card wrapper ───────────────────────────────────────────────────────
function LoginCard({ icon, title, subtitle, accent, children, onBack }) {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-3xl border shadow-xl p-10 w-full max-w-sm">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 mb-7 transition">
          <ArrowLeft size={15}/> Back
        </button>
        <div className={cls("w-14 h-14 rounded-2xl flex items-center justify-center mb-5", accent)}>
          {icon}
        </div>
        <h2 className="text-2xl font-black text-gray-800 mb-1">{title}</h2>
        <p className="text-sm text-gray-400 mb-7">{subtitle}</p>
        {children}
      </div>
    </div>
  );
}

// ─── Installer login ──────────────────────────────────────────────────────────
function InstallerLogin({ onSuccess, onBack }) {
  const [pw, setPw]   = useState("");
  const [err, setErr] = useState(false);

  function submit(e) {
    e.preventDefault();
    if (pw === INSTALLER_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, "1");
      onSuccess();
    } else { setErr(true); setPw(""); }
  }

  return (
    <LoginCard
      icon={<Monitor size={24} className="text-white"/>}
      accent="bg-ecoDark"
      title="Installer Login"
      subtitle="Enter your installer password to view all monitoring sites."
      onBack={onBack}
    >
      <form onSubmit={submit} className="space-y-4">
        <input
          type="password" value={pw} autoFocus
          onChange={(e) => { setPw(e.target.value); setErr(false); }}
          placeholder="Installer password"
          className={cls("w-full border rounded-xl px-4 py-3 text-sm outline-none focus:border-ecoGreen text-gray-800 transition", err && "border-red-400")}
        />
        {err && <p className="text-red-500 text-xs">Incorrect password.</p>}
        <button type="submit" className="w-full bg-ecoDark hover:bg-ecoGreen text-white font-black py-3 rounded-xl transition">
          Login
        </button>
      </form>
    </LoginCard>
  );
}

// ─── Customer login ───────────────────────────────────────────────────────────
function CustomerLogin({ sites, onSuccess, onBack }) {
  const [code, setCode] = useState("");
  const [pin,  setPin]  = useState("");
  const [err,  setErr]  = useState("");

  function submit(e) {
    e.preventDefault();
    const match = sites.find(
      (s) => s.siteCode?.toLowerCase() === code.trim().toLowerCase() && s.userPin === pin.trim()
    );
    if (match) { onSuccess(match); }
    else { setErr("Invalid Site Code or PIN. Please contact Ceylon Eco Power."); }
  }

  return (
    <LoginCard
      icon={<User size={24} className="text-white"/>}
      accent="bg-ecoGold"
      title="Customer Login"
      subtitle="Enter the Site Code and PIN provided by your installer."
      onBack={onBack}
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Site Code</label>
          <input
            type="text" value={code} autoFocus
            onChange={(e) => { setCode(e.target.value); setErr(""); }}
            placeholder="e.g. CEP001"
            className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:border-ecoGold text-gray-800 uppercase transition"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">PIN</label>
          <input
            type="password" value={pin}
            onChange={(e) => { setPin(e.target.value); setErr(""); }}
            placeholder="Your PIN"
            maxLength={8}
            className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:border-ecoGold text-gray-800 transition"
          />
        </div>
        {err && <p className="text-red-500 text-xs leading-relaxed">{err}</p>}
        <button type="submit" className="w-full bg-ecoGold hover:bg-yellow-500 text-black font-black py-3 rounded-xl transition">
          View My System
        </button>
      </form>
    </LoginCard>
  );
}

// ─── Installer dashboard ──────────────────────────────────────────────────────
function InstallerDash({ sites, onSelect, onBack }) {
  const [filter, setFilter] = useState("all");
  const visible = filter === "all" ? sites : sites.filter((s) => s.status === filter);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition">
          <ArrowLeft size={15}/> Back
        </button>
        <h2 className="text-2xl font-black text-ecoDark flex-1">All Monitoring Sites</h2>
        <div className="flex gap-2 flex-wrap">
          {["all","active","offline","maintenance"].map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={cls("px-3 py-1.5 rounded-full text-xs font-bold border transition",
                filter===f ? "bg-ecoDark text-white border-ecoDark" : "border-black/15 text-black/55 hover:border-ecoGreen")}>
              {f === "all" ? `All (${sites.length})` : f.charAt(0).toUpperCase()+f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <Activity size={40} className="mx-auto mb-4 opacity-30" />
          <p>No sites found. Add monitoring sites from the Admin Panel.</p>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {visible.map((s) => (
          <button key={s._fbId || s._id} onClick={() => onSelect(s)}
            className="text-left bg-white rounded-2xl border border-black/8 hover:border-ecoGreen hover:shadow-lg p-5 transition group">
            <div className="flex items-start justify-between mb-3">
              <StatusBadge status={s.status} />
              <Activity size={15} className="text-gray-300 group-hover:text-ecoGreen transition" />
            </div>
            <h3 className="font-black text-ecoDark text-base mb-1 leading-snug">{s.name}</h3>
            <p className="text-xs text-black/45 mb-4">{s.client} · {s.location}</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-50 rounded-xl p-2.5">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">Type</p>
                <p className="text-xs font-semibold text-gray-700 mt-0.5 leading-tight">{s.type}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-2.5">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">Capacity</p>
                <p className="text-xs font-semibold text-gray-700 mt-0.5">{s.acKw} kW AC</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Monitoring iframe view ───────────────────────────────────────────────────
function MonitorView({ site, isInstaller, onBack }) {
  const [fullscreen, setFullscreen] = useState(false);
  const [blocked,    setBlocked]    = useState(false);
  const iframeRef = React.useRef();

  // detect failed iframe load via timeout (browsers don't fire onerror for X-Frame-Options)
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        // if contentDocument is null and no error, iframe likely blocked
        const doc = iframeRef.current?.contentDocument;
        if (doc === null) setBlocked(true);
      } catch { setBlocked(true); }
    }, 5000);
    return () => clearTimeout(timer);
  }, [site.url]);

  const backTarget = isInstaller ? "installer-dash" : "landing";

  return (
    <div className={cls("flex flex-col", fullscreen && "fixed inset-0 z-[999] bg-ecoDark")}>
      {/* Top bar */}
      <div className={cls(
        "flex items-center gap-3 px-4 py-3 flex-wrap flex-shrink-0",
        fullscreen ? "bg-ecoDark border-b border-white/10" : "bg-white border-b border-black/10 shadow-sm"
      )}>
        <button onClick={onBack}
          className={cls("flex items-center gap-1.5 text-sm transition", fullscreen ? "text-white/60 hover:text-white" : "text-gray-500 hover:text-gray-800")}>
          <ArrowLeft size={15}/> {isInstaller ? "All Sites" : "Back"}
        </button>

        <div className="flex-1 min-w-0">
          <p className={cls("font-black text-sm truncate", fullscreen ? "text-white" : "text-ecoDark")}>{site.name}</p>
          <p className={cls("text-xs truncate", fullscreen ? "text-white/40" : "text-black/40")}>
            {site.client} · {site.location} · {site.acKw} kW AC
          </p>
        </div>

        <StatusBadge status={site.status} />

        <a href={site.url} target="_blank" rel="noopener noreferrer"
          className={cls("flex items-center gap-1.5 text-xs font-bold border px-3 py-1.5 rounded-lg transition",
            fullscreen ? "border-white/20 text-white hover:bg-white/10" : "border-black/15 text-gray-600 hover:bg-gray-50")}>
          <ExternalLink size={12}/> Open in New Tab
        </a>

        <button onClick={() => setFullscreen(!fullscreen)}
          className={cls("flex items-center gap-1.5 text-xs font-bold border px-3 py-1.5 rounded-lg transition",
            fullscreen ? "border-white/20 text-white hover:bg-white/10" : "border-black/15 text-gray-600 hover:bg-gray-50")}>
          {fullscreen ? <><Minimize2 size={12}/> Exit</> : <><Maximize2 size={12}/> Fullscreen</>}
        </button>
      </div>

      {/* Content */}
      {blocked ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-5 bg-gray-50 p-10 text-center">
          <WifiOff size={44} className="text-gray-300" />
          <div>
            <h3 className="font-black text-gray-700 text-lg mb-2">Cannot Embed This Page</h3>
            <p className="text-sm text-gray-400 max-w-md mx-auto leading-relaxed">
              The monitoring site has security settings that prevent it from being displayed inside another page. Click the button below to open it directly.
            </p>
          </div>
          <a href={site.url} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 bg-ecoGreen hover:bg-[#0f5040] text-white font-black px-8 py-3.5 rounded-2xl transition text-sm shadow-lg shadow-ecoGreen/20">
            <ExternalLink size={16}/> Open {site.name} Monitoring
          </a>
        </div>
      ) : (
        <iframe
          ref={iframeRef}
          src={site.url}
          title={site.name}
          allow="fullscreen"
          className="flex-1 w-full border-0"
          style={{ minHeight: fullscreen ? "calc(100vh - 57px)" : "80vh" }}
        />
      )}
    </div>
  );
}

// ─── MonitoringPage (main) ────────────────────────────────────────────────────
export default function MonitoringPage() {
  const [view,     setView]     = useState(
    sessionStorage.getItem(SESSION_KEY) === "1" ? "installer-dash" : "landing"
  );
  const [sites,   setSites]    = useState([]);
  const [loading, setLoading]  = useState(false);
  const [selected,setSelected] = useState(null);

  async function loadSites() {
    setLoading(true);
    try {
      const data = isConfigured
        ? await fbMonitorSites.getAll()
        : getStoredMonitorSites();
      setSites(data);
    } catch {
      setSites(getStoredMonitorSites());
    } finally { setLoading(false); }
  }

  // load on mount if already installer-session
  useEffect(() => {
    if (view === "installer-dash") loadSites();
  }, []);

  function goInstaller() {
    if (sessionStorage.getItem(SESSION_KEY) === "1") {
      loadSites(); setView("installer-dash");
    } else { setView("installer-login"); }
  }

  function goCustomer() { loadSites(); setView("customer-login"); }

  function onInstallerAuth() { loadSites(); setView("installer-dash"); }

  function onSelect(site) { setSelected(site); setView("view"); }

  function onCustomerAuth(site) { setSelected(site); setView("view"); }

  const isInstaller = sessionStorage.getItem(SESSION_KEY) === "1";

  return (
    <div className="pt-20 min-h-screen bg-ecoCream text-ecoDark">
      {loading && view !== "view" && (
        <div className="fixed inset-0 bg-white/80 z-50 flex items-center justify-center">
          <Loader size={28} className="animate-spin text-ecoGreen" />
        </div>
      )}

      {view === "landing"         && <Landing onInstaller={goInstaller} onCustomer={goCustomer} />}
      {view === "installer-login" && <InstallerLogin onSuccess={onInstallerAuth} onBack={() => setView("landing")} />}
      {view === "customer-login"  && <CustomerLogin  sites={sites} onSuccess={onCustomerAuth} onBack={() => setView("landing")} />}
      {view === "installer-dash"  && (
        <InstallerDash
          sites={sites}
          onSelect={onSelect}
          onBack={() => { sessionStorage.removeItem(SESSION_KEY); setView("landing"); }}
        />
      )}
      {view === "view" && selected && (
        <MonitorView
          site={selected}
          isInstaller={isInstaller}
          onBack={() => setView(isInstaller ? "installer-dash" : "landing")}
        />
      )}
    </div>
  );
}
