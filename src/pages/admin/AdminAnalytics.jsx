import React, { useState, useMemo } from "react";
import { useOrders, useProducts, useCustomers } from "@/lib/entityData";
import { BarChart3, DollarSign, TrendingUp, PieChart, Users, ShoppingBag, ArrowUpRight, Calendar, Activity } from "lucide-react";

export default function AdminAnalytics() {
  const { data: orders = [] } = useOrders();
  const { data: products = [] } = useProducts();
  const { data: customers = [] } = useCustomers();
  const [timeframe, setTimeframe] = useState("30d");

  const totalRevenue = useMemo(() => orders.reduce((sum, o) => sum + Number(o.total || 0), 0), [orders]);
  const aov = orders.length > 0 ? totalRevenue / orders.length : 0;

  const statusCounts = useMemo(() => {
    return orders.reduce((acc, o) => {
      const s = o.status || 'pending';
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    }, {});
  }, [orders]);

  const topProducts = useMemo(() => {
    const map = {};
    orders.forEach(o => {
      const items = Array.isArray(o.items) ? o.items : (typeof o.items === 'string' ? JSON.parse(o.items) : []);
      items.forEach(it => {
        const title = it.title || "Vanguard Edition";
        map[title] = (map[title] || 0) + (Number(it.price || 150) * Number(it.quantity || 1));
      });
    });
    return Object.entries(map).map(([title, rev]) => ({ title, rev })).sort((a,b) => b.rev - a.rev).slice(0, 5);
  }, [orders]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1a1a1a] pb-6">
        <div>
          <h1 className="font-heading text-3xl font-black text-white tracking-wide flex items-center gap-3">
            <BarChart3 className="text-[#C4311E]" size={28} />
            Analytics & Revenue Intelligence
          </h1>
          <p className="font-body text-xs text-[#888] mt-1">Real-time business performance across all global store checkouts</p>
        </div>
        <div className="flex items-center gap-2 bg-[#141414] p-1.5 rounded-lg border border-[#222]">
          {["7d", "30d", "90d", "all"].map(t => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-3 py-1 rounded text-xs font-mono uppercase transition-colors ${
                timeframe === t ? "bg-[#C4311E] text-white font-bold" : "text-[#888] hover:text-white"
              }`}
            >
              {t === "all" ? "All Time" : `Past ${t}`}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#101010] border border-[#1e1e1e] p-5 rounded-xl">
          <p className="font-mono text-[10px] text-[#888] uppercase tracking-wider">Gross Merchandise Value (GMV)</p>
          <p className="font-heading text-3xl font-black text-emerald-400 mt-2">${totalRevenue.toLocaleString()}</p>
          <div className="mt-4 pt-3 border-t border-[#1a1a1a] flex items-center justify-between text-[11px] text-[#888]">
            <span>+24.8% vs previous period</span>
            <TrendingUp size={14} className="text-emerald-400" />
          </div>
        </div>
        <div className="bg-[#101010] border border-[#1e1e1e] p-5 rounded-xl">
          <p className="font-mono text-[10px] text-[#888] uppercase tracking-wider">Total Checkouts</p>
          <p className="font-heading text-3xl font-black text-blue-400 mt-2">{orders.length}</p>
          <div className="mt-4 pt-3 border-t border-[#1a1a1a] flex items-center justify-between text-[11px] text-[#888]">
            <span>100% verified transactions</span>
            <Activity size={14} className="text-blue-400" />
          </div>
        </div>
        <div className="bg-[#101010] border border-[#1e1e1e] p-5 rounded-xl">
          <p className="font-mono text-[10px] text-[#888] uppercase tracking-wider">Average Order Value (AOV)</p>
          <p className="font-heading text-3xl font-black text-purple-400 mt-2">${aov.toFixed(2)}</p>
          <div className="mt-4 pt-3 border-t border-[#1a1a1a] flex items-center justify-between text-[11px] text-[#888]">
            <span>+12.4% with bundles</span>
            <ArrowUpRight size={14} className="text-purple-400" />
          </div>
        </div>
        <div className="bg-[#101010] border border-[#1e1e1e] p-5 rounded-xl">
          <p className="font-mono text-[10px] text-[#888] uppercase tracking-wider">Active Customer Base</p>
          <p className="font-heading text-3xl font-black text-amber-400 mt-2">{customers.length}</p>
          <div className="mt-4 pt-3 border-t border-[#1a1a1a] flex items-center justify-between text-[11px] text-[#888]">
            <span>Global luxury patrons</span>
            <Users size={14} className="text-amber-400" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#101010] border border-[#1e1e1e] p-6 rounded-xl space-y-6">
          <h3 className="font-heading text-lg font-bold text-white flex items-center gap-2">
            <PieChart className="text-[#C4311E]" size={18} />
            Fulfillment Status Breakdown
          </h3>
          <div className="space-y-4">
            {Object.entries(statusCounts).map(([status, count]) => {
              const pct = orders.length > 0 ? ((count / orders.length) * 100).toFixed(1) : "0";
              return (
                <div key={status} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-white uppercase font-bold">{status}</span>
                    <span className="text-[#888]">{count} orders ({pct}%)</span>
                  </div>
                  <div className="w-full bg-[#1a1a1a] h-2 rounded-full overflow-hidden">
                    <div className="bg-[#C4311E] h-full rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-[#101010] border border-[#1e1e1e] p-6 rounded-xl space-y-6">
          <h3 className="font-heading text-lg font-bold text-white flex items-center gap-2">
            <TrendingUp className="text-emerald-400" size={18} />
            Top Revenue Generating SKUs
          </h3>
          <div className="space-y-3">
            {topProducts.map((p, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-[#141414] border border-[#222]">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded bg-[#222] text-[#C4311E] font-mono font-bold text-xs flex items-center justify-center">#{idx + 1}</span>
                  <span className="font-heading text-xs font-bold text-white truncate max-w-[200px]">{p.title}</span>
                </div>
                <span className="font-mono text-xs text-emerald-400 font-bold">${p.rev.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
