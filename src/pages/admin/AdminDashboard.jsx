import React from "react";
import { Link } from "react-router-dom";
import { Package, ShoppingCart, TrendingUp, AlertCircle, Box } from "lucide-react";
import { useProducts, useJournalArticles, useOrders } from "@/lib/entityData";

export default function AdminDashboard() {
  const { data: products } = useProducts();
  const { data: orders } = useOrders();
  const { data: articles } = useJournalArticles();

  const totalInventory = products?.reduce((sum, p) => sum + (p.inventory || 0), 0) || 0;
  const totalRevenue = orders?.reduce((sum, o) => sum + (o.total || 0), 0) || 0;
  const lowStock = products?.filter(p => (p.inventory || 0) < 20) || [];

  const stats = [
    { label: "Products", value: products?.length || 0, icon: Package, to: "/admin/products" },
    { label: "Total Inventory", value: totalInventory, icon: Box, to: "/admin/products" },
    { label: "Orders", value: orders?.length || 0, icon: ShoppingCart, to: "/admin/orders" },
    { label: "Revenue", value: `CA$${totalRevenue.toFixed(0)}`, icon: TrendingUp, to: "/admin/orders" },
  ];

  return (
    <div>
      <h1 className="font-heading text-3xl font-black tracking-[0.1em] text-[#E6E2D3] mb-2">Dashboard</h1>
      <p className="font-mono text-xs tracking-[0.2em] text-[#6B6B6B] uppercase mb-10">Site Overview</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Link key={i} to={stat.to} className="bg-[#0a0a0a] border border-[#1a1a1a] p-6 hover:border-[#333] transition-colors">
              <Icon className="text-[#C4311E] mb-4" size={24} />
              <p className="font-heading text-3xl font-black text-[#E6E2D3]">{stat.value}</p>
              <p className="font-mono text-[10px] tracking-[0.3em] text-[#6B6B6B] uppercase mt-2">{stat.label}</p>
            </Link>
          );
        })}
      </div>

      {lowStock.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="text-[#C4311E]" size={18} />
            <h2 className="font-heading text-lg font-bold text-[#E6E2D3]">Low Stock Alert</h2>
          </div>
          <div className="space-y-2">
            {lowStock.map(p => (
              <div key={p.id} className="flex items-center justify-between bg-[#0a0a0a] border border-[#1a1a1a] px-6 py-4">
                <span className="font-heading text-sm text-[#E6E2D3]">{p.title} — {p.subtitle}</span>
                <span className="font-mono text-sm text-[#C4311E]">{p.inventory} left</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="font-heading text-lg font-bold text-[#E6E2D3] mb-4">Recent Orders</h2>
        {(orders || []).slice(0, 5).map(o => (
          <div key={o.id} className="flex items-center justify-between bg-[#0a0a0a] border border-[#1a1a1a] px-6 py-4 mb-2">
            <div>
              <span className="font-mono text-sm text-[#E6E2D3]">{o.order_number}</span>
              <span className="font-body text-sm text-[#6B6B6B] ml-4">{o.customer_name}</span>
            </div>
            <span className="font-mono text-sm text-[#C4311E]">CA${o.total}</span>
          </div>
        ))}
        {(!orders || orders.length === 0) && <p className="font-body text-[#6B6B6B]">No orders yet.</p>}
      </div>
    </div>
  );
}