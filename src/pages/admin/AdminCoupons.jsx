import { db } from '@/api/rehbarClient';

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clearStoreCachesAndSync } from "@/lib/entityData";
import { Percent, Plus, Pencil, Trash2, X } from "lucide-react";

export default function AdminCoupons() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ code: "", discount_type: "percentage", discount_value: 10, min_order_amount: 0, max_uses: 1000, status: "active" });

  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ['coupons'],
    queryFn: async () => await db.entities.Coupon.list(),
    staleTime: 0
  });

  const mutation = useMutation({
    mutationFn: async (data) => {
      if (editing) return await db.entities.Coupon.update(editing.id, data);
      return await db.entities.Coupon.create(data);
    },
    onSuccess: async () => {
      await clearStoreCachesAndSync(queryClient, true);
      await queryClient.invalidateQueries({ queryKey: ['coupons'] });
      setShowModal(false);
      setEditing(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => await db.entities.Coupon.delete(id),
    onSuccess: async () => {
      await clearStoreCachesAndSync(queryClient, true);
      await queryClient.invalidateQueries({ queryKey: ['coupons'] });
    }
  });

  const handleEdit = (c) => {
    setEditing(c);
    setForm({
      code: c.code || "",
      discount_type: c.discount_type || "percentage",
      discount_value: Number(c.discount_value || 10),
      min_order_amount: Number(c.min_order_amount || 0),
      max_uses: Number(c.max_uses || 1000),
      status: c.status || "active"
    });
    setShowModal(true);
  };

  const inputCls = "w-full bg-transparent border border-[#1a1a1a] text-[#E6E2D3] px-4 py-2.5 font-body text-sm focus:outline-none focus:border-[#C4311E] transition-colors";
  const labelCls = "font-mono text-[10px] tracking-[0.3em] text-[#6B6B6B] uppercase block mb-2";

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1a1a1a] pb-6">
        <div>
          <h1 className="font-heading text-3xl font-black text-white tracking-wide flex items-center gap-3">
            <Percent className="text-[#C4311E]" size={28} />
            Coupons & Discounts Manager
          </h1>
          <p className="font-body text-xs text-[#888] mt-1">Create promo codes and store discounts backed by live Supabase table</p>
        </div>
        <button
          onClick={() => { setEditing(null); setForm({ code: "", discount_type: "percentage", discount_value: 10, min_order_amount: 0, max_uses: 1000, status: "active" }); setShowModal(true); }}
          className="bg-[#C4311E] hover:bg-[#a02818] text-white px-5 py-2.5 rounded-lg font-mono text-xs uppercase font-bold tracking-wider flex items-center gap-2 transition-colors shadow-lg shadow-[#C4311E]/20"
        >
          <Plus size={16} /> New Coupon
        </button>
      </div>

      <div className="bg-[#101010] border border-[#1e1e1e] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1e1e1e] bg-[#141414]">
                <th className="text-left px-6 py-3.5 font-mono text-[10px] tracking-wider text-[#888] uppercase">Coupon Code</th>
                <th className="text-left px-6 py-3.5 font-mono text-[10px] tracking-wider text-[#888] uppercase">Discount</th>
                <th className="text-left px-6 py-3.5 font-mono text-[10px] tracking-wider text-[#888] uppercase">Min Order</th>
                <th className="text-left px-6 py-3.5 font-mono text-[10px] tracking-wider text-[#888] uppercase">Usage</th>
                <th className="text-left px-6 py-3.5 font-mono text-[10px] tracking-wider text-[#888] uppercase">Status</th>
                <th className="text-right px-6 py-3.5 font-mono text-[10px] tracking-wider text-[#888] uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e1e1e]">
              {isLoading ? (
                <tr><td colSpan={6} className="text-center py-10 text-[#888] font-mono text-xs">Loading coupons...</td></tr>
              ) : coupons.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10 text-[#888] font-mono text-xs">No active coupons.</td></tr>
              ) : (
                coupons.map(c => (
                  <tr key={c.id} className="hover:bg-[#151515] transition-colors">
                    <td className="px-6 py-4 font-mono text-sm font-bold text-white tracking-widest bg-[#141414] rounded px-3 py-1 w-fit">{c.code}</td>
                    <td className="px-6 py-4 font-mono text-xs text-emerald-400 font-bold">
                      {c.discount_type === 'percentage' ? `${c.discount_value}% OFF` : `$${c.discount_value} FLAT`}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-[#ccc]">${c.min_order_amount || 0}</td>
                    <td className="px-6 py-4 font-mono text-xs text-[#888]">{c.used_count || 0} / {c.max_uses || '∞'}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full font-mono text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase font-bold">{c.status || "active"}</span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-3">
                      <button onClick={() => handleEdit(c)} className="text-[#888] hover:text-white transition-colors" title="Edit"><Pencil size={16} /></button>
                      <button onClick={() => { if (confirm(`Delete coupon "${c.code}"?`)) deleteMutation.mutate(c.id); }} className="text-[#888] hover:text-rose-500 transition-colors" title="Delete"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-[#0F0F0F] border border-[#1a1a1a] w-full max-w-lg rounded-xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#1a1a1a]">
              <h2 className="font-heading text-lg font-bold text-white">{editing ? "Edit Coupon" : "New Coupon"}</h2>
              <button onClick={() => setShowModal(false)} className="text-[#6B6B6B] hover:text-white"><X size={20} /></button>
            </div>
            <form onSubmit={e => { e.preventDefault(); mutation.mutate(form); }} className="p-6 space-y-4">
              <div>
                <label className={labelCls}>Coupon Code</label>
                <input className={inputCls} value={form.code} onChange={e => setForm({...form, code: e.target.value.toUpperCase()})} placeholder="e.g. SUMMER20" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Discount Type</label>
                  <select className={inputCls} value={form.discount_type} onChange={e => setForm({...form, discount_type: e.target.value})}>
                    <option value="percentage" className="bg-[#0F0F0F]">Percentage (%)</option>
                    <option value="fixed" className="bg-[#0F0F0F]">Fixed Amount ($)</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Discount Value</label>
                  <input type="number" className={inputCls} value={form.discount_value} onChange={e => setForm({...form, discount_value: Number(e.target.value)})} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Min Order Amount ($)</label>
                  <input type="number" className={inputCls} value={form.min_order_amount} onChange={e => setForm({...form, min_order_amount: Number(e.target.value)})} />
                </div>
                <div>
                  <label className={labelCls}>Max Uses Limit</label>
                  <input type="number" className={inputCls} value={form.max_uses} onChange={e => setForm({...form, max_uses: Number(e.target.value)})} />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-[#333] text-white rounded text-xs font-mono uppercase">Cancel</button>
                <button type="submit" disabled={mutation.isPending} className="px-5 py-2 bg-[#C4311E] text-white rounded text-xs font-mono font-bold uppercase hover:bg-[#a02818]">
                  {mutation.isPending ? "Saving..." : "Save Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
