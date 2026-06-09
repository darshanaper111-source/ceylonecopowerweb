import React, { useState } from "react";
import { Plus, Trash2, ExternalLink, Copy, CheckCircle } from "lucide-react";
import { isConfigured } from "../firebase/config.js";
import { fbMonitorSites } from "../firebase/db.js";
import { getStoredMonitorSites, addMonitorSite, deleteMonitorSite } from "../data/storage.js";

const inp = "border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 bg-white w-full text-gray-800";

const STATUS_OPTS = ["active", "offline", "maintenance"];
const TYPE_OPTS   = [
  "Domestic On-Grid", "Commercial On-Grid",
  "Domestic Hybrid BESS", "Commercial Hybrid BESS",
  "Utility Scale", "Mini Grid",
];

const BLANK = {
  name:"", client:"", location:"", type:"Domestic On-Grid",
  acKw:"", url:"", siteCode:"", userPin:"", status:"active", notes:"",
};

function StatusBadge({ status }) {
  const map = { active:"bg-green-100 text-green-700", offline:"bg-red-100 text-red-600", maintenance:"bg-yellow-100 text-yellow-700" };
  return <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${map[status]||map.active}`}>{status}</span>;
}

export default function MonitoringSitesTab() {
  const [sites, setSites]   = useState(() => isConfigured ? [] : getStoredMonitorSites());
  const [loaded, setLoaded] = useState(!isConfigured);
  const [form, setForm]     = useState({ ...BLANK });
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState("");
  const [err, setErr]       = useState("");

  // load from Firebase on mount
  React.useEffect(() => {
    if (!isConfigured) return;
    fbMonitorSites.getAll().then(setSites).catch(() => setSites(getStoredMonitorSites())).finally(() => setLoaded(true));
  }, []);

  function set(k, v) { setForm((p) => ({ ...p, [k]: v })); }

  function copyCode(code) {
    navigator.clipboard.writeText(code).then(() => { setCopied(code); setTimeout(() => setCopied(""), 2000); });
  }

  async function submit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.url.trim() || !form.siteCode.trim() || !form.userPin.trim()) {
      setErr("Name, URL, Site Code and PIN are required."); return;
    }
    setSaving(true); setErr("");
    try {
      const data = {
        name: form.name, client: form.client, location: form.location,
        type: form.type, acKw: Number(form.acKw) || 0,
        url: form.url, siteCode: form.siteCode.toUpperCase(), userPin: form.userPin,
        status: form.status, notes: form.notes,
      };
      if (isConfigured) {
        const ref = await fbMonitorSites.add(data);
        setSites((p) => [{ _fbId: ref.id, ...data }, ...p]);
      } else {
        addMonitorSite(data);
        setSites(getStoredMonitorSites());
      }
      setForm({ ...BLANK });
    } catch (e) { setErr(e.message); }
    finally { setSaving(false); }
  }

  async function remove(site) {
    if (!confirm(`Delete "${site.name}"?`)) return;
    if (isConfigured && site._fbId) {
      await fbMonitorSites.remove(site._fbId);
      setSites((p) => p.filter((s) => s._fbId !== site._fbId));
    } else {
      deleteMonitorSite(site._id);
      setSites(getStoredMonitorSites());
    }
  }

  return (
    <div className="space-y-8">

      {/* Existing sites */}
      <div>
        <h3 className="font-black text-gray-700 mb-3">Monitoring Sites ({sites.length})</h3>
        {!loaded && <p className="text-sm text-gray-400">Loading…</p>}
        {loaded && sites.length === 0 && (
          <p className="text-sm text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center">
            No monitoring sites yet. Add your first site below.
          </p>
        )}
        {sites.length > 0 && (
          <div className="space-y-3">
            {sites.map((s) => (
              <div key={s._fbId || s._id} className="border rounded-2xl bg-white p-4 flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="font-black text-gray-800">{s.name}</p>
                    <StatusBadge status={s.status} />
                  </div>
                  <p className="text-xs text-gray-500 mb-2">{s.client} · {s.location} · {s.type} · {s.acKw} kW</p>
                  <div className="flex flex-wrap gap-3 text-xs">
                    {/* Site code + PIN */}
                    <div className="flex items-center gap-1.5 bg-gray-50 border rounded-lg px-3 py-1.5">
                      <span className="text-gray-400">Code:</span>
                      <span className="font-black text-gray-800">{s.siteCode}</span>
                      <button onClick={() => copyCode(s.siteCode)} className="text-gray-400 hover:text-blue-600 ml-1">
                        {copied === s.siteCode ? <CheckCircle size={12} className="text-green-500"/> : <Copy size={12}/>}
                      </button>
                    </div>
                    <div className="flex items-center gap-1.5 bg-gray-50 border rounded-lg px-3 py-1.5">
                      <span className="text-gray-400">PIN:</span>
                      <span className="font-black text-gray-800">{s.userPin}</span>
                    </div>
                    <a href={s.url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-blue-500 hover:underline">
                      <ExternalLink size={11}/> Open monitoring site
                    </a>
                  </div>
                  {s.notes && <p className="text-xs text-gray-400 mt-2 italic">{s.notes}</p>}
                </div>
                <button onClick={() => remove(s)} className="text-red-400 hover:text-red-600 p-1 shrink-0 mt-0.5">
                  <Trash2 size={16}/>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add form */}
      <div className="bg-gray-50 rounded-2xl border border-black/8 p-6">
        <h3 className="font-black text-gray-700 mb-5">Add Monitoring Site</h3>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Project Name *</label>
              <input value={form.name} onChange={(e)=>set("name",e.target.value)} className={inp} placeholder="Hotel Colombo 500kW" required />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Client Name</label>
              <input value={form.client} onChange={(e)=>set("client",e.target.value)} className={inp} placeholder="Company / Owner" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Location</label>
              <input value={form.location} onChange={(e)=>set("location",e.target.value)} className={inp} placeholder="Colombo" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">System Type</label>
              <select value={form.type} onChange={(e)=>set("type",e.target.value)} className={inp}>
                {TYPE_OPTS.map((t)=><option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">AC Capacity (kW)</label>
              <input type="number" min="0" value={form.acKw} onChange={(e)=>set("acKw",e.target.value)} className={inp} placeholder="500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Status</label>
              <select value={form.status} onChange={(e)=>set("status",e.target.value)} className={inp}>
                {STATUS_OPTS.map((s)=><option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Monitoring URL * <span className="normal-case font-normal text-gray-400">(full URL to the monitoring dashboard)</span></label>
            <input type="url" value={form.url} onChange={(e)=>set("url",e.target.value)} className={inp} placeholder="https://your-monitoring-site.web.app/project-id" required />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                Site Code * <span className="normal-case font-normal text-gray-400">(customer uses this to login)</span>
              </label>
              <input value={form.siteCode} onChange={(e)=>set("siteCode",e.target.value.toUpperCase())} className={inp} placeholder="CEP001" maxLength={20} required />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                Customer PIN * <span className="normal-case font-normal text-gray-400">(4-8 digit PIN)</span>
              </label>
              <input type="text" value={form.userPin} onChange={(e)=>set("userPin",e.target.value)} className={inp} placeholder="1234" maxLength={8} required />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Notes</label>
            <textarea value={form.notes} onChange={(e)=>set("notes",e.target.value)} rows={2} className={`${inp} resize-none`} placeholder="Optional notes" />
          </div>

          {err && <p className="text-red-600 text-sm">{err}</p>}

          <button type="submit" disabled={saving} className="flex items-center gap-2 bg-ecoGreen hover:bg-[#0f5040] disabled:bg-green-300 text-white font-bold px-6 py-2.5 rounded-lg transition text-sm">
            <Plus size={15}/> {saving ? "Saving…" : "Add Monitoring Site"}
          </button>
        </form>
      </div>

      {/* Installer password reminder */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-sm text-blue-800">
        <strong>Installer login password:</strong> <code className="bg-blue-100 px-2 py-0.5 rounded font-mono">cep-monitor-2024</code>
        <span className="text-blue-600 ml-2 text-xs">(change in <code>src/data/storage.js → INSTALLER_PASSWORD</code>)</span>
      </div>
    </div>
  );
}
