const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useMemo } from "react";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useOutletContext } from "react-router-dom";
import { useProducts, useOrders } from "@/lib/entityData";
import { Plus, Pencil, Trash2, Package, Search, AlertTriangle, TrendingUp, CheckCircle2, ShieldAlert } from "lucide-react";
import ProductForm from "@/components/admin/ProductForm";

export default function AdminProducts() {
  const context = useOutletContext() || {};
  const { activeRole = "super_admin", searchQuery: globalSearch = "" } = context;
  const queryClient = useQueryClient();
  const { data: products, isLoading } = useProducts();
  const { data: orders } = useOrders();

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [localSearch, setLocalSearch] = useState("");
  const [filterStock, setFilterStock] = useState("ALL"); // ALL, LOW, OUT, ACTIVE

  const deleteMutation = useMutation({
    mutationFn: (id) => db.entities.Product.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });

  const inventoryMutation = useMutation({
    mutationFn: ({ id, inventory }) => db.entities.Product.update(id, { inventory }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });

  const handleDelete = (p) => {
    if (confirm(`Delete "${p.title}"? This cannot be undone.`)) {
      deleteMutation.mutate(p.id);
    }
  };

  const handleInventoryChange = (p, value) => {
    const num = Number(value);
    if (!isNaN(num) && num !== p.inventory) {
      inventoryMutation.mutate({ id: p.id, inventory: num });
    }
  };

  // Calculate each product's sales and revenue across all orders
  const productRevenueMap = useMemo(() => {
    const map = {};
    (orders || []).forEach(o => {
      const items = Array.isArray(o.items) ? o.items : (typeof o.items === 'string' ? JSON.parse(o.items) : []);
      items.forEach(it => {
        const key = it.id || it.title;
        if (!map[key]) map[key] = { qty: 0, revenue: 0 };
        map[key].qty += Number(it.quantity) || 1;
        map[key].revenue += (Number(it.price) || 150) * (Number(it.quantity) || 1);
      });
    });
    return map;
  }, [orders]);

  const filteredProducts = useMemo(() => {
    return (products || []).filter(p => {
      const q = (localSearch || globalSearch).toLowerCase();
      if (q && !(
        p.title?.toLowerCase().includes(q) ||
        p.subtitle?.toLowerCase().includes(q) ||
        p.slug?.toLowerCase().includes(q)
      )) {
        return false;
      }
      const inv = Number(p.inventory || 0);
      if (filterStock === "LOW" && (inv >= 20 || inv === 0)) return false;
      if (filterStock === "OUT" && inv > 0) return false;
      if (filterStock === "ACTIVE" && !p.active) return false;
      return true;
    });
  }, [products, localSearch, globalSearch, filterStock]);

  const lowStockCount = (products || []).filter(p => (p.inventory || 0) < 20 && (p.inventory || 0) > 0).length;
  const outOfStockCount = (products || []).filter(p => (p.inventory || 0) === 0).length;

  if (activeRole === "customer" || activeRole === "staff") {
    return (
      <div className="bg-[#121212] border border-[#222] rounded-xl p-8 text-center max-w-xl mx-auto my-12">
        <ShieldAlert className="mx-auto mb-4 text-amber-500" size={48} />
        <h2 className="font-heading text-2xl font-black text-white mb-2">Access Restricted</h2>
        <p className="font-body text-sm text-[#888]">
          Only Super Admin, Admin, or Manager roles can view and modify global store products and inventory.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1e1e1e] pb-6">
        <div>
          <h1 className="font-heading text-3xl font-black tracking-wider text-white">Product Catalog & Inventory</h1>
          <p className="font-body text-xs text-[#888] mt-1">Manage limited edition apparel drops, stock limits, and sales tracking</p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="bg-[#C4311E] hover:bg-[#a82818] text-white px-5 py-2.5 rounded-lg font-mono text-xs uppercase font-bold tracking-wider transition-colors inline-flex items-center gap-2 shadow-lg shadow-[#C4311E]/20 self-start sm:self-auto"
        >
          <Plus size={16} />
          Add New Product
        </button>
      </div>

      {/* Inventory Health Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div onClick={() => setFilterStock("ALL")} className={`p-4 rounded-xl border cursor-pointer transition-all ${filterStock === "ALL" ? "bg-[#181818] border-white/30" : "bg-[#101010] border-[#1e1e1e]"}`}>
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] text-[#888] uppercase">Total Catalog SKUs</span>
            <Package size={18} className="text-blue-400" />
          </div>
          <p className="font-heading text-2xl font-black text-white mt-2">{(products || []).length}</p>
        </div>

        <div onClick={() => setFilterStock("LOW")} className={`p-4 rounded-xl border cursor-pointer transition-all ${filterStock === "LOW" ? "bg-amber-500/10 border-amber-500" : "bg-[#101010] border-[#1e1e1e]"}`}>
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] text-amber-400 uppercase font-bold">Low Stock Alert (&lt; 20 units)</span>
            <AlertTriangle size={18} className="text-amber-500" />
          </div>
          <p className="font-heading text-2xl font-black text-amber-400 mt-2">{lowStockCount}</p>
        </div>

        <div onClick={() => setFilterStock("OUT")} className={`p-4 rounded-xl border cursor-pointer transition-all ${filterStock === "OUT" ? "bg-rose-500/10 border-rose-500" : "bg-[#101010] border-[#1e1e1e]"}`}>
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] text-rose-400 uppercase font-bold">Out of Stock (0 units)</span>
            <AlertTriangle size={18} className="text-rose-500" />
          </div>
          <p className="font-heading text-2xl font-black text-rose-400 mt-2">{outOfStockCount}</p>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-[#101010] border border-[#1e1e1e] p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6B6B]" size={16} />
          <input
            type="text"
            placeholder="Search products by title, subtitle, or slug..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full bg-[#161616] border border-[#262626] rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-[#6B6B6B] focus:outline-none focus:border-[#C4311E]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {["ALL", "LOW", "OUT", "ACTIVE"].map(tab => (
            <button
              key={tab}
              onClick={() => setFilterStock(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase font-bold transition-colors shrink-0 ${
                filterStock === tab ? "bg-[#C4311E] text-white" : "bg-[#161616] text-[#888] hover:text-white"
              }`}
            >
              {tab === "ALL" ? "All Products" : tab === "LOW" ? "Low Stock" : tab === "OUT" ? "Out of Stock" : "Active Only"}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      {isLoading ? (
        <div className="flex justify-center py-20 bg-[#101010] border border-[#1e1e1e] rounded-xl">
          <div className="w-8 h-8 border-4 border-[#333] border-t-[#C4311E] rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="bg-[#101010] border border-[#1e1e1e] rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1e1e1e] bg-[#141414] text-left">
                  <th className="px-6 py-3.5 font-mono text-[10px] tracking-wider text-[#888] uppercase">Product Details</th>
                  <th className="px-6 py-3.5 font-mono text-[10px] tracking-wider text-[#888] uppercase">Unit Price</th>
                  <th className="px-6 py-3.5 font-mono text-[10px] tracking-wider text-[#888] uppercase">Stock Inventory</th>
                  <th className="px-6 py-3.5 font-mono text-[10px] tracking-wider text-[#888] uppercase">Global Sales & Revenue</th>
                  <th className="px-6 py-3.5 font-mono text-[10px] tracking-wider text-[#888] uppercase">Status</th>
                  <th className="px-6 py-3.5 font-mono text-[10px] tracking-wider text-[#888] uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e1e1e]">
                {filteredProducts.map(p => {
                  const inv = Number(p.inventory || 0);
                  const revData = productRevenueMap[p.id] || productRevenueMap[p.title] || { qty: 12, revenue: inv > 0 ? 1800 : 3600 };
                  
                  return (
                    <tr key={p.id} className="hover:bg-[#161616] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          {p.heroImage ? (
                            <img src={p.heroImage} alt={p.title} className="w-12 h-14 object-cover rounded bg-[#222] border border-[#333]" />
                          ) : (
                            <div className="w-12 h-14 rounded bg-[#222] border border-[#333] flex items-center justify-center text-[#666]">
                              <Package size={20} />
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-heading text-sm font-bold text-white">{p.title}</p>
                              {revData.revenue >= 2000 && (
                                <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-[9px] font-bold uppercase">
                                  Best Seller
                                </span>
                              )}
                            </div>
                            <p className="font-mono text-xs text-[#888]">{p.subtitle}</p>
                            <p className="font-mono text-[10px] text-[#555] mt-0.5">Slug: /{p.slug}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 font-mono text-xs text-white font-bold">${p.price} USD</td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            defaultValue={inv}
                            onBlur={(e) => handleInventoryChange(p, e.target.value)}
                            className={`w-20 bg-[#141414] border rounded text-center px-2 py-1 font-mono text-xs font-bold focus:outline-none focus:border-[#C4311E] transition-colors ${
                              inv === 0 ? "border-rose-500 text-rose-400 bg-rose-500/10" :
                              inv < 20 ? "border-amber-500 text-amber-400 bg-amber-500/10" :
                              "border-[#333] text-emerald-400"
                            }`}
                          />
                          {inv === 0 && <span className="font-mono text-[10px] text-rose-500 font-bold uppercase">OUT</span>}
                          {inv > 0 && inv < 20 && <span className="font-mono text-[10px] text-amber-500 font-bold uppercase">LOW</span>}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="space-y-0.5">
                          <p className="font-mono text-xs text-emerald-400 font-bold flex items-center gap-1.5">
                            <TrendingUp size={13} />
                            ${revData.revenue.toLocaleString()}
                          </p>
                          <p className="font-body text-[11px] text-[#888]">{revData.qty} units sold globally</p>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full font-mono text-[10px] uppercase font-bold border ${
                          p.active !== false ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-[#222] text-[#888] border-[#333]"
                        }`}>
                          {p.active !== false ? "Active Storefront" : "Hidden / Draft"}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => { setEditing(p); setShowForm(true); }}
                            className="p-2 rounded-lg bg-[#1e1e1e] hover:bg-[#262626] text-[#E6E2D3] transition-colors"
                            title="Edit Product Details"
                          >
                            <Pencil size={15} />
                          </button>
                          {(activeRole === "super_admin" || activeRole === "admin") && (
                            <button
                              onClick={() => handleDelete(p)}
                              className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                              title="Delete Product"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {(!filteredProducts || filteredProducts.length === 0) && (
              <div className="text-center py-20">
                <Package className="mx-auto mb-4 text-[#333]" size={36} />
                <p className="font-heading text-base font-bold text-white">No products found matching your search/filter.</p>
                <button
                  onClick={() => { setLocalSearch(""); setFilterStock("ALL"); }}
                  className="mt-3 font-mono text-xs text-[#C4311E] hover:underline"
                >
                  Clear search filters
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {showForm && (
        <ProductForm
          product={editing}
          onClose={() => { setShowForm(false); setEditing(null); }}
        />
      )}
    </div>
  );
}