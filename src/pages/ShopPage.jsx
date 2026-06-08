import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, ShoppingBag, Tag } from "lucide-react";
import SectionTitle from "../components/SectionTitle.jsx";
import { fbProducts } from "../firebase/db.js";
import { isConfigured } from "../firebase/config.js";

const CATEGORIES = [
  { id: "all",              label: "All Products" },
  { id: "panels",           label: "Solar Panels" },
  { id: "string-inverters", label: "String Inverters" },
  { id: "hybrid-inverters", label: "Hybrid Inverters" },
  { id: "batteries",        label: "Batteries" },
  { id: "structure",        label: "Structure" },
  { id: "cable",            label: "DC Cable" },
];

// ─── Product Photo Gallery ────────────────────────────────────────────────────
function ProductGallery({ photos }) {
  const [idx, setIdx] = useState(0);
  const list = photos?.length ? photos : [];

  if (!list.length) {
    return (
      <div className="h-52 bg-ecoGold/10 flex items-center justify-center rounded-t-[1.5rem]">
        <ShoppingBag size={40} className="text-ecoGold/40" />
      </div>
    );
  }

  return (
    <div className="relative h-52 overflow-hidden rounded-t-[1.5rem] group">
      <img src={list[idx]} alt="" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.opacity = 0.2; }} />
      {list.length > 1 && (
        <>
          <button onClick={() => setIdx((idx - 1 + list.length) % list.length)} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"><ChevronLeft size={16} /></button>
          <button onClick={() => setIdx((idx + 1) % list.length)} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"><ChevronRight size={16} /></button>
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
            {list.map((_, i) => <button key={i} onClick={() => setIdx(i)} className={`w-1.5 h-1.5 rounded-full transition ${i === idx ? "bg-ecoGold" : "bg-white/50"}`} />)}
          </div>
          <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">{idx + 1}/{list.length}</div>
        </>
      )}
    </div>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────
function ProductCard({ product }) {
  const hasPrice = product.price != null && product.price > 0;

  return (
    <div className="bg-white rounded-[1.5rem] border border-black/10 shadow-md hover:shadow-xl transition overflow-hidden flex flex-col">
      <ProductGallery photos={product.photos} />

      <div className="p-5 flex flex-col flex-1 gap-3">
        {/* Badge + stock */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-bold bg-ecoGold/15 text-yellow-700 px-3 py-1 rounded-full">{product.brand}</span>
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${product.inStock ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
            {product.inStock ? "In Stock" : "Out of Stock"}
          </span>
        </div>

        {/* Name */}
        <h3 className="font-black text-ecoDark text-base leading-snug">{product.model}</h3>

        {/* Price */}
        <div className="flex items-baseline gap-1.5">
          {hasPrice ? (
            <>
              <span className="text-2xl font-black text-ecoGreen">
                {Number(product.price).toLocaleString("en-LK")}
              </span>
              <span className="text-sm text-black/50">LKR {product.priceUnit || "per unit"}</span>
            </>
          ) : (
            <span className="text-base font-bold text-ecoGold flex items-center gap-1.5">
              <Tag size={14} /> Request for Price
            </span>
          )}
        </div>

        {/* Specs */}
        {product.specs?.length > 0 && (
          <div className="grid grid-cols-2 gap-1.5">
            {product.specs.slice(0, 4).map((s) => (
              <div key={s.key} className="bg-gray-50 rounded-lg px-2 py-1.5">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{s.key}</div>
                <div className="text-xs font-semibold text-gray-700 mt-0.5">{s.value}</div>
              </div>
            ))}
          </div>
        )}

        {product.description && (
          <p className="text-sm text-black/55 leading-relaxed line-clamp-2">{product.description}</p>
        )}

        {/* CTA */}
        <div className="mt-auto pt-3">
          <Link
            to={`/contact?product=${encodeURIComponent(product.brand + " " + product.model)}`}
            className="block w-full text-center bg-ecoGreen hover:bg-[#0f5040] text-white font-bold py-2.5 rounded-full transition text-sm"
          >
            Request Quote
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="bg-white rounded-[1.5rem] border border-black/10 overflow-hidden animate-pulse">
      <div className="h-52 bg-gray-200" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-1/3" />
        <div className="h-5 bg-gray-200 rounded w-3/4" />
        <div className="h-7 bg-gray-200 rounded w-1/2" />
        <div className="h-10 bg-gray-200 rounded-full" />
      </div>
    </div>
  );
}

// ─── ShopPage ─────────────────────────────────────────────────────────────────
export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState("all");

  useEffect(() => {
    if (!isConfigured) { setLoading(false); return; }
    fbProducts.getAll().then(setProducts).catch(console.error).finally(() => setLoading(false));
  }, []);

  const visible = filter === "all" ? products : products.filter((p) => p.category === filter);

  return (
    <div className="pt-20 min-h-screen bg-ecoCream text-ecoDark">
      {/* Hero */}
      <div className="bg-ecoDark text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <SectionTitle
            eyebrow="Shop"
            title="Solar Products & Equipment"
            subtitle="Quality solar panels, inverters and battery storage systems — sourced from globally trusted brands."
          />
        </div>
      </div>

      {/* Category filter */}
      <div className="sticky top-20 z-40 bg-white/95 backdrop-blur border-b border-black/10 py-3">
        <div className="max-w-7xl mx-auto px-4 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                onClick={() => setFilter(c.id)}
                className={`px-5 py-2 rounded-full text-xs font-bold transition whitespace-nowrap border ${
                  filter === c.id
                    ? "bg-ecoGold text-black border-ecoGold"
                    : "border-black/15 text-black/60 hover:border-ecoGold hover:text-ecoDark"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {!isConfigured && (
          <div className="text-center py-20">
            <ShoppingBag size={48} className="text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-black text-gray-500 mb-2">Firebase Not Connected</h2>
            <p className="text-gray-400 text-sm max-w-md mx-auto">
              Add your Firebase credentials to a <code className="bg-gray-100 px-1 rounded">.env</code> file to enable the shop.
              See <code className="bg-gray-100 px-1 rounded">.env.example</code> for the required variables.
            </p>
          </div>
        )}

        {isConfigured && loading && (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} />)}
          </div>
        )}

        {isConfigured && !loading && visible.length === 0 && (
          <div className="text-center py-20">
            <ShoppingBag size={48} className="text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-black text-gray-500 mb-2">No products yet in this category</h2>
            <p className="text-gray-400 text-sm">Add products via the admin panel.</p>
          </div>
        )}

        {isConfigured && !loading && visible.length > 0 && (
          <>
            <p className="text-sm text-black/40 mb-6">{visible.length} product{visible.length !== 1 ? "s" : ""}</p>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {visible.map((p) => <ProductCard key={p._fbId} product={p} />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
