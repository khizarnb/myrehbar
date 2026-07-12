const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from "react";
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useOrders } from "@/lib/entityData";
import { ShoppingCart, Eye, X } from "lucide-react";

const STATUSES = ['pending', 'fulfilled', 'shipped', 'cancelled'];

export default function AdminOrders() {
  const queryClient = useQueryClient();
  const { data: orders, isLoading } = useOrders();
  const [viewing, setViewing] = useState(null);

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => db.entities.Order.update(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
  });

  const parseItems = (o) => {
    if (Array.isArray(o.items)) return o.items;
    try { return typeof o.items === 'string' ? JSON.parse(o.items) : (JSON.parse(o.items_json || '[]')); } catch { return []; }
  };

  return (
    <div>
      <h1 className="font-heading text-3xl font-black tracking-[0.1em] text-[#E6E2D3] mb-2">Orders</h1>
      <p className="font-mono text-xs tracking-[0.2em] text-[#6B6B6B] uppercase mb-10">Customer purchases</p>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-[#333] border-t-[#C4311E] rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1a1a1a]">
                <th className="text-left px-6 py-4 font-mono text-[10px] tracking-[0.3em] text-[#6B6B6B] uppercase">Order #</th>
                <th className="text-left px-6 py-4 font-mono text-[10px] tracking-[0.3em] text-[#6B6B6B] uppercase">Customer</th>
                <th className="text-left px-6 py-4 font-mono text-[10px] tracking-[0.3em] text-[#6B6B6B] uppercase">Total</th>
                <th className="text-left px-6 py-4 font-mono text-[10px] tracking-[0.3em] text-[#6B6B6B] uppercase">Status</th>
                <th className="text-right px-6 py-4 font-mono text-[10px] tracking-[0.3em] text-[#6B6B6B] uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(orders || []).map(o => (
                <tr key={o.id} className="border-b border-[#1a1a1a] hover:bg-[#111]">
                  <td className="px-6 py-4 font-mono text-sm text-[#E6E2D3]">{o.order_number}</td>
                  <td className="px-6 py-4">
                    <p className="font-body text-sm text-[#E6E2D3]">{o.customer_name}</p>
                    <p className="font-mono text-xs text-[#6B6B6B]">{o.customer_email}</p>
                    {o.customer_phone && <p className="font-mono text-[11px] text-[#C4311E] mt-0.5">{o.customer_phone}</p>}
                  </td>
                  <td className="px-6 py-4 font-mono text-sm text-[#C4311E]">CA${o.total}</td>
                  <td className="px-6 py-4">
                    <select
                      value={o.status || 'pending'}
                      onChange={(e) => statusMutation.mutate({ id: o.id, status: e.target.value })}
                      className="bg-transparent border border-[#1a1a1a] text-[#E6E2D3] px-3 py-1.5 font-mono text-xs focus:outline-none focus:border-[#C4311E] transition-colors"
                    >
                      {STATUSES.map(s => <option key={s} value={s} className="bg-[#0a0a0a]">{s}</option>)}
                    </select>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => setViewing(o)} className="text-[#6B6B6B] hover:text-[#E6E2D3] transition-colors">
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!orders || orders.length === 0) && (
            <div className="text-center py-20">
              <ShoppingCart className="mx-auto mb-4 text-[#333]" size={32} />
              <p className="font-body text-[#6B6B6B]">No orders yet.</p>
            </div>
          )}
        </div>
      )}

      {/* Order detail modal */}
      {viewing && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-start justify-center overflow-y-auto p-4 md:p-8">
          <div className="bg-[#0F0F0F] border border-[#1a1a1a] w-full max-w-lg my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#1a1a1a]">
              <h2 className="font-heading text-xl font-bold text-[#E6E2D3]">{viewing.order_number}</h2>
              <button onClick={() => setViewing(null)} className="text-[#6B6B6B] hover:text-[#E6E2D3]"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="font-mono text-[10px] tracking-[0.3em] text-[#6B6B6B] uppercase mb-2">Customer</p>
                <p className="font-body text-sm text-[#E6E2D3]">{viewing.customer_name}</p>
                <p className="font-body text-sm text-[#E6E2D3]/70">{viewing.customer_email}</p>
                {viewing.customer_phone && <p className="font-mono text-xs text-[#C4311E] mt-1">Phone/WhatsApp: {viewing.customer_phone}</p>}
              </div>
              <div>
                <p className="font-mono text-[10px] tracking-[0.3em] text-[#6B6B6B] uppercase mb-2">Shipping Address</p>
                <p className="font-body text-sm text-[#E6E2D3]/80">{viewing.shipping_address}<br />{viewing.shipping_city}, {viewing.shipping_country} {viewing.shipping_zip}</p>
              </div>
              <div>
                <p className="font-mono text-[10px] tracking-[0.3em] text-[#6B6B6B] uppercase mb-2">Charity</p>
                <p className="font-body text-sm text-[#E6E2D3]/80">{viewing.charity}</p>
              </div>
              <div className="border-t border-[#1a1a1a] pt-4">
                <p className="font-mono text-[10px] tracking-[0.3em] text-[#6B6B6B] uppercase mb-3">Items</p>
                {parseItems(viewing).map((item, i) => (
                  <div key={i} className="flex justify-between py-2">
                    <span className="font-body text-sm text-[#E6E2D3]">{item.product_title} — Size {item.size} ×{item.quantity}</span>
                    <span className="font-mono text-sm text-[#E6E2D3]/70">CA${item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-[#1a1a1a] pt-4 space-y-1">
                <div className="flex justify-between"><span className="font-mono text-xs text-[#6B6B6B]">Subtotal</span><span className="font-mono text-sm text-[#E6E2D3]">CA${viewing.subtotal}</span></div>
                <div className="flex justify-between"><span className="font-mono text-xs text-[#6B6B6B]">Shipping</span><span className="font-mono text-sm text-[#E6E2D3]">CA${viewing.shipping_cost}</span></div>
                <div className="flex justify-between"><span className="font-mono text-xs text-[#6B6B6B]">Charity</span><span className="font-mono text-sm text-[#C4311E]">CA${viewing.charity_donation}</span></div>
                <div className="flex justify-between pt-2"><span className="font-heading text-sm font-bold text-[#E6E2D3]">Total</span><span className="font-heading text-sm font-bold text-[#C4311E]">CA${viewing.total}</span></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}