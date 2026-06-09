import React, { useState } from "react";
import { Plus, Trash2, Pencil, Check, X } from "lucide-react";
import {
  ACC_CATS, UNITS, DEFAULT_ACCESSORIES,
  getAccessories, addAccessory, updateAccessoryPrice, deleteAccessory,
} from "../data/accessories.js";

function cls(...a) { return a.filter(Boolean).join(" "); }
const inp = "border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 bg-white w-full";

function fmt(n) { return Number(n).toLocaleString("en-LK"); }

export default function AccessoriesTab() {
  const [list, setList]       = useState(getAccessories);
  const [newAcc, setNewAcc]   = useState({ name:"", cat:"Cable", unit:"unit", price:"" });
  const [editing, setEditing] = useState({}); // id → price string
  const [filterCat, setFilter]= useState("All");

  function refresh() { setList(getAccessories()); }

  function saveNew(e) {
    e.preventDefault();
    if (!newAcc.name.trim() || !newAcc.price) return;
    addAccessory({ ...newAcc, price: Number(newAcc.price) });
    setNewAcc({ name:"", cat:"Cable", unit:"unit", price:"" });
    refresh();
  }

  function startEdit(id, price) { setEditing((p) => ({ ...p, [id]: String(price) })); }
  function cancelEdit(id)       { setEditing((p) => { const n={...p}; delete n[id]; return n; }); }
  function commitEdit(id) {
    updateAccessoryPrice(id, editing[id]);
    cancelEdit(id);
    refresh();
  }

  function remove(id) { deleteAccessory(id); refresh(); }

  const isDefault = (id) => !!DEFAULT_ACCESSORIES.find((d) => d.id === id);
  const cats = ["All", ...ACC_CATS];
  const visible = filterCat === "All" ? list : list.filter((a) => a.cat === filterCat);

  return (
    <div className="space-y-7">
      <p className="text-sm text-gray-500">
        Manage your accessories/BOS price catalog. These prices are used to auto-populate the Budget Calculator.
      </p>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-1.5">
        {cats.map((c) => (
          <button key={c} onClick={() => setFilter(c)}
            className={cls("px-3 py-1.5 rounded-full text-xs font-semibold border transition",
              filterCat===c ? "bg-ecoGreen text-white border-ecoGreen" : "border-black/15 text-black/55 hover:border-ecoGreen")}>
            {c}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-black/10">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs font-black text-gray-500 uppercase tracking-wide">
            <tr>
              <th className="px-4 py-3 text-left">Item</th>
              <th className="px-4 py-3 text-left">Category</th>
              <th className="px-4 py-3 text-left">Unit</th>
              <th className="px-4 py-3 text-right">Unit Price (LKR)</th>
              <th className="px-4 py-3 text-center w-24">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {visible.map((a) => (
              <tr key={a.id} className="hover:bg-gray-50/70">
                <td className="px-4 py-3 font-medium text-gray-800">
                  {a.name}
                  {isDefault(a.id) && <span className="ml-2 text-[10px] text-gray-400 font-normal">default</span>}
                </td>
                <td className="px-4 py-3 text-gray-500">{a.cat}</td>
                <td className="px-4 py-3 text-gray-500">{a.unit}</td>
                <td className="px-4 py-3 text-right">
                  {editing[a.id] !== undefined ? (
                    <div className="flex items-center justify-end gap-1">
                      <input
                        type="number" min="0"
                        value={editing[a.id]}
                        onChange={(e) => setEditing((p) => ({ ...p, [a.id]: e.target.value }))}
                        className="border rounded px-2 py-1 text-sm w-28 text-right outline-none focus:border-blue-400"
                      />
                      <button onClick={() => commitEdit(a.id)} className="text-green-600 hover:text-green-700 p-1"><Check size={14}/></button>
                      <button onClick={() => cancelEdit(a.id)} className="text-red-400 hover:text-red-600 p-1"><X size={14}/></button>
                    </div>
                  ) : (
                    <span className="font-semibold text-gray-800">{fmt(a.price)}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-1">
                    <button onClick={() => startEdit(a.id, a.price)} className="text-blue-400 hover:text-blue-600 p-1 rounded"><Pencil size={13}/></button>
                    {!isDefault(a.id) && (
                      <button onClick={() => remove(a.id)} className="text-red-400 hover:text-red-600 p-1 rounded"><Trash2 size={13}/></button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add new */}
      <div className="bg-gray-50 rounded-2xl border border-black/8 p-5">
        <h3 className="font-black text-gray-700 mb-4">Add Custom Accessory</h3>
        <form onSubmit={saveNew} className="grid sm:grid-cols-5 gap-3 items-end">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-gray-500 mb-1">Item Name *</label>
            <input value={newAcc.name} onChange={(e) => setNewAcc((p) => ({...p,name:e.target.value}))} className={inp} placeholder="e.g. AC Isolator 32A" required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Category</label>
            <select value={newAcc.cat} onChange={(e) => setNewAcc((p) => ({...p,cat:e.target.value}))} className={inp}>
              {ACC_CATS.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Unit</label>
            <select value={newAcc.unit} onChange={(e) => setNewAcc((p) => ({...p,unit:e.target.value}))} className={inp}>
              {UNITS.map((u) => <option key={u}>{u}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Unit Price (LKR) *</label>
            <input type="number" min="0" value={newAcc.price} onChange={(e) => setNewAcc((p) => ({...p,price:e.target.value}))} className={inp} placeholder="0" required />
          </div>
          <div className="sm:col-span-5">
            <button type="submit" className="flex items-center gap-2 bg-ecoGreen hover:bg-[#0f5040] text-white font-bold px-5 py-2.5 rounded-lg transition text-sm">
              <Plus size={15}/> Add Accessory
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
