const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from "react";
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { useProducts, clearStoreCachesAndSync } from "@/lib/entityData";
import { Archive, Plus, Minus, Search, AlertTriangle, CheckCircle2, RefreshCw } from "lucide-react";

export default function AdminInventory() {
  const queryClient = useQueryClient();
  const { data: products = [], isLoading } = useProducts();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL"); // ALL, LOW, OUT

  const updateMutation = useMutation({
    mutationFn: async ({ id, inventory }) => await db.entities.Product.update(id, { inventory, stock: inventory }),
    onSuccess: async () => {
      await clearStoreCachesAndSync(queryClient, true);
    }
  });

  const handleAdjust = (p, delta) => {
    const cur = Number(p.inventory !== undefined ? p.inventory : p.stock || 0);
    const next = Math.max(0, cur + delta);
    updateMutation.mutate({ id: p.id, inventory: next });
  };

  const handleInput = (p, val) => {
    const num = Number(val);
    if (!isNaN(num) && num >= 0) {
      updateMutation.mutate({ id: p.id, inventory: num });
    }
  };

  const filtered = products.filter(p => {
    if (search && !(p.title?.toLowerCase().includes(search.toLowerCase()) || p.sku?.toLowerCase().includes(search.toLowerCase()))) return false;
    const inv = Number(p.inventory !== undefined ? p.inventory : p.stock || 0);
    if (filter === "LOW" && (inv >= 10 || inv === 0)) return false;
    if (filter === "OUT" && inv > 0) return false;
    return true;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1a1a1a] pb-6">
        <div>
          <h1 className="font-heading text-3xl font-black text-white tracking-wide flex items-center gap-3">
            <Archive className="text-[#C4311E]" size={28} />
            Inventory & Stock Manager
          </h1>
          <p className="font-body text-xs text-[#888] mt-1">Real-time multi-channel inventory synchronization backed by live Supabase table</p>
        </div>
        <div className="flex items-center gap-2">
          {["ALL", "LOW", "OUT"].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase transition-colors ${
                filter === f ? "bg-[#C4311E] text-white font-bold" : "bg-[#141414] text-[#888] hover:text-white border border-[#222]"
              }`}
            >
              {f === "ALL" ? "All SKUs" : f === "LOW" ? "Low Stock (<10)" : "Out of Stock"}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4 bg-[#101010] p-4 rounded-xl border border-[#1e1e1e]">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6B6B]" size={16} />
          <input
            type="text"
            placeholder="Search SKUs or product titles..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#141414] border border-[#222] rounded-lg pl-10 pr-4 py-2 text-xs text-white placeholder-[#6B6B6B] focus:outline-none focus:border-[#C4311E]"
          />
        </div>
      </div>

      <div className="bg-[#101010] border border-[#1e1e1e] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1e1e1e] bg-[#141414]">
                <th className="text-left px-6 py-3.5 font-mono text-[10px] tracking-wider text-[#888] uppercase">Product</th>
                <th className="text-left px-6 py-3.5 font-mono text-[10px] tracking-wider text-[#888] uppercase">SKU Code</th>
                <th className="text-left px-6 py-3.5 font-mono text-[10px] tracking-wider text-[#888] uppercase">Price</th>
                <th className="text-left px-6 py-3.5 font-mono text-[10px] tracking-wider text-[#888] uppercase">Status</th>
                <th className="text-center px-6 py-3.5 font-mono text-[10px] tracking-wider text-[#888] uppercase">Stock Quantity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e1e1e]">
              {isLoading ? (
                <tr><td colSpan={5} className="text-center py-10 text-[#888] font-mono text-xs">Loading inventory...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-10 text-[#888] font-mono text-xs">No matching products found.</td></tr>
              ) : (
                filtered.map(p => {
                  const inv = Number(p.inventory !== undefined ? p.inventory : p.stock || 0);
                  return (
                    <tr key={p.id} className="hover:bg-[#151515] transition-colors">
                      <td className="px-6 py-4 flex items-center gap-3">
                        <img src={p.heroImage || p.image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=100'} className="w-10 h-10 object-cover rounded border border-[#222]" alt="" />
                        <div>
                          <p className="font-heading text-sm font-bold text-white">{p.title}</p>
                          <p className="font-mono text-[10px] text-[#888]">{p.category || 'Apparel'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-[#C4311E] font-bold">{p.sku || "SKU-001"}</td>
                      <td className="px-6 py-4 font-mono text-xs text-emerald-400 font-bold">${p.price}</td>
                      <td className="px-6 py-4">
                        {inv === 0 ? (
                          <span className="px-2.5 py-1 rounded-full font-mono text-[10px] bg-rose-500/20 text-rose-400 border border-rose-500/30 uppercase font-bold">Out of Stock</span>
                        ) : inv < 10 ? (
                          <span className="px-2.5 py-1 rounded-full font-mono text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase font-bold flex items-center gap-1 w-fit"><AlertCircle size={12}/> Low ({inv})</span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full font-mono text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase font-bold">In Stock</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => handleAdjust(p, -1)} className="w-8 h-8 rounded bg-[#1e1e1e] hover:bg-[#262626] text-white flex items-center justify-center font-bold transition-colors"><Minus size={14}/></button>
                          <input
                            type="number"
                            value={inv}
                            onChange={e => handleInput(p, e.target.value)}
                            className="w-16 bg-[#141414] border border-[#262626] rounded py-1 px-2 text-center font-mono text-sm text-white focus:outline-none focus:border-[#C4311E]"
                          />
                          <button onClick={() => handleAdjust(p, 1)} className="w-8 h-8 rounded bg-[#1e1e1e] hover:bg-[#262626] text-white flex items-center justify-center font-bold transition-colors"><Plus size={14}/></button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
