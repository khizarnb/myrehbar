import { db } from '@/api/rehbarClient';

import React, { useState, useMemo } from "react";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useOutletContext } from "react-router-dom";
import { useOrders, clearStoreCachesAndSync } from "@/lib/entityData";
import { 
  ShoppingCart, Eye, X, Download, Search, Filter, ArrowUpDown, 
  Trash2, CheckCircle, AlertCircle, FileSpreadsheet, ChevronLeft, ChevronRight, ShieldAlert 
} from "lucide-react";

const STATUSES = ['pending', 'processing', 'shipped', 'fulfilled', 'cancelled'];
const PAYMENT_STATUSES = ['paid', 'pending', 'refunded', 'failed'];

export default function AdminOrders() {
  const context = useOutletContext() || {};
  const { activeRole = "super_admin", searchQuery: globalSearch = "" } = context;
  const queryClient = useQueryClient();
  const { data: orders, isLoading } = useOrders();
  
  const [viewing, setViewing] = useState(null);
  const [localSearch, setLocalSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [paymentFilter, setPaymentFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("date_desc"); // date_desc, date_asc, total_desc, total_asc
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const statusMutation = useMutation({
    mutationFn: ({ id, status, payment_status }) => db.entities.Order.update(id, { 
      ...(status ? { status } : {}), 
      ...(payment_status ? { payment_status } : {}) 
    }),
    onSuccess: async () => {
      await clearStoreCachesAndSync(queryClient, true);
    },
    onError: (err) => {
      alert(`❌ Order update failed: ${err.message || "Could not update order in Supabase"}`);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => db.entities.Order.delete(id),
    onSuccess: async () => {
      await clearStoreCachesAndSync(queryClient, true);
      setViewing(null);
    },
    onError: (err) => {
      alert(`❌ Order deletion failed: ${err.message || "Could not delete order in Supabase"}`);
    }
  });

  const parseItems = (o) => {
    if (Array.isArray(o.items)) return o.items;
    try { return typeof o.items === 'string' ? JSON.parse(o.items) : (JSON.parse(o.items_json || '[]')); } catch { return []; }
  };

  // Filter & Sort Logic
  const filteredOrders = useMemo(() => {
    let list = (orders || []).filter(o => {
      const q = (localSearch || globalSearch).toLowerCase();
      if (q && !(
        o.order_number?.toLowerCase().includes(q) ||
        o.customer_name?.toLowerCase().includes(q) ||
        o.customer_email?.toLowerCase().includes(q) ||
        o.customer_phone?.toLowerCase().includes(q) ||
        o.shipping_city?.toLowerCase().includes(q) ||
        o.shipping_country?.toLowerCase().includes(q)
      )) {
        return false;
      }
      if (statusFilter !== "ALL" && o.status !== statusFilter) return false;
      if (paymentFilter !== "ALL" && o.payment_status !== paymentFilter) return false;
      return true;
    });

    return list.sort((a, b) => {
      if (sortBy === "date_desc") return new Date(b.created_date || b.created_at || 0) - new Date(a.created_date || a.created_at || 0);
      if (sortBy === "date_asc") return new Date(a.created_date || a.created_at || 0) - new Date(b.created_date || b.created_at || 0);
      if (sortBy === "total_desc") return Number(b.total || 0) - Number(a.total || 0);
      if (sortBy === "total_asc") return Number(a.total || 0) - Number(b.total || 0);
      return 0;
    });
  }, [orders, localSearch, globalSearch, statusFilter, paymentFilter, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage) || 1;
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Export CSV / Excel function
  const exportData = (format) => {
    if (!filteredOrders.length) return;
    
    const headers = ["Order ID", "Customer Name", "Customer Email", "Phone", "Products", "Quantity", "Total ($)", "Payment Status", "Order Status", "Payment Method", "Shipping City", "Country", "Order Date"];
    const rows = filteredOrders.map(o => {
      const items = parseItems(o);
      const prodNames = items.map(it => it.title).join("; ");
      const totalQty = items.reduce((acc, it) => acc + (Number(it.quantity) || 1), 0);
      const dateStr = new Date(o.created_date || o.created_at).toLocaleDateString();
      return [
        `"${o.order_number || o.id}"`,
        `"${o.customer_name || ''}"`,
        `"${o.customer_email || ''}"`,
        `"${o.customer_phone || ''}"`,
        `"${prodNames}"`,
        totalQty,
        Number(o.total || 0),
        `"${o.payment_status || 'paid'}"`,
        `"${o.status || 'pending'}"`,
        `"${o.payment_method || 'Credit Card'}"`,
        `"${o.shipping_city || ''}"`,
        `"${o.shipping_country || ''}"`,
        `"${dateStr}"`
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Rehbar_Store_Orders_${new Date().toISOString().slice(0, 10)}.${format === 'excel' ? 'csv' : 'csv'}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (activeRole === "customer") {
    return (
      <div className="bg-[#121212] border border-[#222] rounded-xl p-8 text-center max-w-xl mx-auto my-12">
        <ShieldAlert className="mx-auto mb-4 text-amber-500" size={48} />
        <h2 className="font-heading text-2xl font-black text-white mb-2">Access Restricted</h2>
        <p className="font-body text-sm text-[#888]">
          You are currently in Customer testing role. Only Super Admin, Admin, Manager, or Staff roles have permission to view global store orders.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title & Export bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-black tracking-wider text-white">Orders Management</h1>
          <p className="font-body text-xs text-[#888] mt-1">
            Displaying all {filteredOrders.length} store transactions across all public customers and regions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportData('csv')}
            className="flex items-center gap-2 bg-[#1a1a1a] hover:bg-[#262626] border border-[#333] text-white px-3.5 py-2 rounded-lg font-mono text-xs transition-colors"
          >
            <Download size={14} className="text-[#C4311E]" />
            Export CSV
          </button>
          <button
            onClick={() => exportData('excel')}
            className="flex items-center gap-2 bg-[#1a1a1a] hover:bg-[#262626] border border-[#333] text-white px-3.5 py-2 rounded-lg font-mono text-xs transition-colors"
          >
            <FileSpreadsheet size={14} className="text-emerald-400" />
            Export Excel
          </button>
        </div>
      </div>

      {/* Filter and Search Action Toolbar */}
      <div className="bg-[#101010] border border-[#1e1e1e] p-4 rounded-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6B6B]" size={16} />
          <input
            type="text"
            placeholder="Search by order #, customer name, email, phone..."
            value={localSearch}
            onChange={(e) => { setLocalSearch(e.target.value); setCurrentPage(1); }}
            className="w-full bg-[#161616] border border-[#262626] rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-[#6B6B6B] focus:outline-none focus:border-[#C4311E]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-[#161616] border border-[#262626] rounded-lg px-3 py-1.5">
            <Filter size={14} className="text-[#888]" />
            <span className="font-mono text-xs text-[#888]">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="bg-transparent text-xs font-mono text-white focus:outline-none"
            >
              <option value="ALL" className="bg-[#161616]">All Statuses</option>
              {STATUSES.map(s => <option key={s} value={s} className="bg-[#161616] uppercase">{s}</option>)}
            </select>
          </div>

          {/* Payment Status Filter */}
          <div className="flex items-center gap-1.5 bg-[#161616] border border-[#262626] rounded-lg px-3 py-1.5">
            <span className="font-mono text-xs text-[#888]">Payment:</span>
            <select
              value={paymentFilter}
              onChange={(e) => { setPaymentFilter(e.target.value); setCurrentPage(1); }}
              className="bg-transparent text-xs font-mono text-white focus:outline-none"
            >
              <option value="ALL" className="bg-[#161616]">All Payments</option>
              {PAYMENT_STATUSES.map(p => <option key={p} value={p} className="bg-[#161616] uppercase">{p}</option>)}
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-1.5 bg-[#161616] border border-[#262626] rounded-lg px-3 py-1.5">
            <ArrowUpDown size={14} className="text-[#888]" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-xs font-mono text-white focus:outline-none"
            >
              <option value="date_desc" className="bg-[#161616]">Newest First</option>
              <option value="date_asc" className="bg-[#161616]">Oldest First</option>
              <option value="total_desc" className="bg-[#161616]">Highest Total ($)</option>
              <option value="total_asc" className="bg-[#161616]">Lowest Total ($)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      {isLoading ? (
        <div className="flex justify-center py-24 bg-[#101010] border border-[#1e1e1e] rounded-xl">
          <div className="w-8 h-8 border-4 border-[#333] border-t-[#C4311E] rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="bg-[#101010] border border-[#1e1e1e] rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1e1e1e] bg-[#141414] text-left">
                  <th className="px-5 py-3.5 font-mono text-[10px] tracking-wider text-[#888] uppercase">Order ID</th>
                  <th className="px-5 py-3.5 font-mono text-[10px] tracking-wider text-[#888] uppercase">Customer Info</th>
                  <th className="px-5 py-3.5 font-mono text-[10px] tracking-wider text-[#888] uppercase">Products & Qty</th>
                  <th className="px-5 py-3.5 font-mono text-[10px] tracking-wider text-[#888] uppercase">Total</th>
                  <th className="px-5 py-3.5 font-mono text-[10px] tracking-wider text-[#888] uppercase">Payment Status</th>
                  <th className="px-5 py-3.5 font-mono text-[10px] tracking-wider text-[#888] uppercase">Order Status</th>
                  <th className="px-5 py-3.5 font-mono text-[10px] tracking-wider text-[#888] uppercase">Date & Destination</th>
                  <th className="px-5 py-3.5 font-mono text-[10px] tracking-wider text-[#888] uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e1e1e]">
                {paginatedOrders.map(o => {
                  const items = parseItems(o);
                  const totalQty = items.reduce((acc, it) => acc + (Number(it.quantity) || 1), 0);
                  const canEdit = activeRole === "super_admin" || activeRole === "admin" || activeRole === "manager";
                  
                  return (
                    <tr key={o.id} className="hover:bg-[#161616] transition-colors">
                      <td className="px-5 py-4 font-mono text-xs text-white font-bold">{o.order_number || o.id}</td>
                      
                      <td className="px-5 py-4">
                        <p className="font-body text-xs text-white font-bold">{o.customer_name}</p>
                        <p className="font-mono text-[11px] text-[#888]">{o.customer_email}</p>
                        {o.customer_phone && <p className="font-mono text-[10px] text-[#C4311E] mt-0.5 font-semibold">{o.customer_phone}</p>}
                      </td>

                      <td className="px-5 py-4 max-w-[200px]">
                        <p className="font-heading text-xs text-white truncate">
                          {items.map(it => it.title).join(", ") || "Apparel Item"}
                        </p>
                        <p className="font-mono text-[10px] text-[#888] mt-0.5">Qty: {totalQty} items</p>
                      </td>

                      <td className="px-5 py-4 font-mono text-xs text-emerald-400 font-black">${Number(o.total || 0).toFixed(2)}</td>

                      <td className="px-5 py-4">
                        {canEdit ? (
                          <select
                            value={o.payment_status || "paid"}
                            onChange={(e) => statusMutation.mutate({ id: o.id, payment_status: e.target.value })}
                            className={`px-2 py-1 rounded font-mono text-[10px] font-bold uppercase border bg-transparent cursor-pointer ${
                              o.payment_status === "paid" ? "text-emerald-400 border-emerald-500/40" :
                              o.payment_status === "refunded" ? "text-rose-400 border-rose-500/40" :
                              "text-amber-400 border-amber-500/40"
                            }`}
                          >
                            {PAYMENT_STATUSES.map(p => <option key={p} value={p} className="bg-[#121212] text-white">{p}</option>)}
                          </select>
                        ) : (
                          <span className="font-mono text-xs text-[#ccc] uppercase">{o.payment_status || "paid"}</span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        {canEdit ? (
                          <select
                            value={o.status || 'pending'}
                            onChange={(e) => statusMutation.mutate({ id: o.id, status: e.target.value })}
                            className={`px-2 py-1 rounded font-mono text-[10px] font-bold uppercase border bg-transparent cursor-pointer ${
                              o.status === "fulfilled" ? "text-emerald-400 border-emerald-500/40" :
                              o.status === "shipped" || o.status === "processing" ? "text-blue-400 border-blue-500/40" :
                              o.status === "cancelled" ? "text-rose-400 border-rose-500/40" :
                              "text-amber-400 border-amber-500/40"
                            }`}
                          >
                            {STATUSES.map(s => <option key={s} value={s} className="bg-[#121212] text-white">{s}</option>)}
                          </select>
                        ) : (
                          <span className="font-mono text-xs text-[#ccc] uppercase">{o.status || "pending"}</span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-mono text-xs text-white">
                          {new Date(o.created_date || o.created_at || Date.now()).toLocaleDateString()}
                        </p>
                        <p className="font-body text-[11px] text-[#888] truncate max-w-[150px]">
                          {o.shipping_city || "Toronto"}, {o.shipping_country || "Canada"}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-right space-x-2">
                        <button
                          onClick={() => setViewing(o)}
                          className="p-1.5 rounded-lg bg-[#1e1e1e] hover:bg-[#262626] text-[#E6E2D3] transition-colors inline-flex items-center justify-center"
                          title="View Complete Details"
                        >
                          <Eye size={15} />
                        </button>
                        {(activeRole === "super_admin" || activeRole === "admin") && (
                          <button
                            onClick={() => { if (confirm(`Are you sure you want to delete order ${o.order_number}?`)) deleteMutation.mutate(o.id); }}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors inline-flex items-center justify-center"
                            title="Delete Order"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {(!paginatedOrders || paginatedOrders.length === 0) && (
              <div className="text-center py-20">
                <ShoppingCart className="mx-auto mb-4 text-[#333]" size={36} />
                <p className="font-heading text-base font-bold text-white">No orders match your filter criteria.</p>
                <button
                  onClick={() => { setLocalSearch(""); setStatusFilter("ALL"); setPaymentFilter("ALL"); }}
                  className="mt-3 font-mono text-xs text-[#C4311E] hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>

          {/* Pagination Toolbar */}
          <div className="px-6 py-4 border-t border-[#1e1e1e] flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#141414]">
            <div className="flex items-center gap-2 text-xs font-mono text-[#888]">
              <span>Rows per page:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                className="bg-[#1e1e1e] border border-[#262626] text-white px-2 py-1 rounded focus:outline-none"
              >
                {[5, 10, 25, 50].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
              <span>— Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredOrders.length)} of {filteredOrders.length} orders</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="p-1.5 rounded bg-[#1e1e1e] border border-[#262626] text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#282828] transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="font-mono text-xs text-white px-3">
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="p-1.5 rounded bg-[#1e1e1e] border border-[#262626] text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#282828] transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Complete Order Detail Modal */}
      {viewing && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#121212] border border-[#262626] rounded-2xl w-full max-w-2xl my-8 overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#222] bg-[#181818]">
              <div>
                <span className="font-mono text-[10px] tracking-widest text-[#C4311E] uppercase font-bold">Shopify Order Record</span>
                <h2 className="font-heading text-xl font-black text-white mt-0.5">{viewing.order_number || viewing.id}</h2>
              </div>
              <button onClick={() => setViewing(null)} className="text-[#888] hover:text-white transition-colors p-1 rounded-lg hover:bg-[#262626]">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Customer & Shipping Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#161616] p-4 rounded-xl border border-[#222]">
                <div>
                  <p className="font-mono text-[10px] tracking-wider text-[#888] uppercase font-bold mb-2">Customer Profile</p>
                  <p className="font-body text-sm font-bold text-white">{viewing.customer_name}</p>
                  <p className="font-mono text-xs text-[#ccc]">{viewing.customer_email}</p>
                  {viewing.customer_phone && <p className="font-mono text-xs text-[#C4311E] mt-1 font-semibold">WhatsApp/Mobile: {viewing.customer_phone}</p>}
                </div>
                <div>
                  <p className="font-mono text-[10px] tracking-wider text-[#888] uppercase font-bold mb-2">Shipping Destination</p>
                  <p className="font-body text-sm text-white">{viewing.shipping_address || "Standard Checkout Address"}</p>
                  <p className="font-body text-xs text-[#ccc] mt-0.5">
                    {viewing.shipping_city || "Toronto"}, {viewing.shipping_country || "Canada"} ({viewing.shipping_zip || "N/A"})
                  </p>
                  <p className="font-mono text-[11px] text-emerald-400 mt-1">Payment Method: {viewing.payment_method || "Stripe Card"}</p>
                </div>
              </div>

              {/* Items Table */}
              <div>
                <p className="font-mono text-[10px] tracking-wider text-[#888] uppercase font-bold mb-3">Purchased Items</p>
                <div className="bg-[#161616] border border-[#222] rounded-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-[#1a1a1a] border-b border-[#222]">
                      <tr>
                        <th className="px-4 py-2 font-mono text-[10px] text-[#888] uppercase">Item</th>
                        <th className="px-4 py-2 font-mono text-[10px] text-[#888] uppercase">Size</th>
                        <th className="px-4 py-2 font-mono text-[10px] text-[#888] uppercase">Qty</th>
                        <th className="px-4 py-2 font-mono text-[10px] text-[#888] uppercase text-right">Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#222]">
                      {parseItems(viewing).map((item, idx) => (
                        <tr key={idx}>
                          <td className="px-4 py-3 font-heading text-xs font-bold text-white">{item.title || "REHBAR Apparel"}</td>
                          <td className="px-4 py-3 font-mono text-xs text-[#ccc] uppercase">{item.size || "M"}</td>
                          <td className="px-4 py-3 font-mono text-xs text-white">{item.quantity || 1}</td>
                          <td className="px-4 py-3 font-mono text-xs text-emerald-400 font-bold text-right">${item.price || 150}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Financial Breakdown */}
              <div className="bg-[#181818] border border-[#222] rounded-xl p-4 space-y-2 font-mono text-xs">
                <div className="flex justify-between text-[#ccc]">
                  <span>Subtotal:</span>
                  <span>${viewing.subtotal || viewing.total || 150}</span>
                </div>
                <div className="flex justify-between text-[#ccc]">
                  <span>Shipping Cost:</span>
                  <span>${viewing.shipping_cost || 10}</span>
                </div>
                <div className="flex justify-between text-emerald-400 font-bold border-b border-[#262626] pb-2">
                  <span>Direct Muslim Charity Donation ($6/item):</span>
                  <span>+${viewing.charity_donation || 6}</span>
                </div>
                <div className="flex justify-between text-white font-heading font-black text-base pt-1">
                  <span>Grand Total:</span>
                  <span className="text-[#C4311E]">${viewing.total} USD</span>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-[#181818] border-t border-[#222] flex items-center justify-between">
              <span className="font-mono text-xs text-[#888]">Order Created: {new Date(viewing.created_date || viewing.created_at).toLocaleString()}</span>
              <button
                onClick={() => setViewing(null)}
                className="bg-[#C4311E] hover:bg-[#a82818] text-white px-5 py-2 rounded-lg font-mono text-xs font-bold uppercase transition-colors"
              >
                Close Summary
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}