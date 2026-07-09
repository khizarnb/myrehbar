const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { LayoutDashboard, Package, ShoppingCart, FileText, ExternalLink, Lock } from "lucide-react";

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { to: "/admin/journal", label: "Journal", icon: FileText },
];

export default function AdminLayout() {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    db.auth.me().then(u => { setUser(u); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#333] border-t-[#C4311E] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <Lock className="mx-auto mb-6 text-[#C4311E]" size={48} />
          <h1 className="font-heading text-3xl font-black text-[#E6E2D3] mb-4">ACCESS DENIED</h1>
          <p className="font-body text-[#E6E2D3]/60 mb-8">You need admin privileges to access this area.</p>
          <Link to="/" className="font-mono text-sm text-[#C4311E] hover:text-[#E6E2D3] transition-colors">Return to Site</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0F0F] flex">
      <aside className="w-60 bg-[#0a0a0a] border-r border-[#1a1a1a] fixed inset-y-0 left-0 flex flex-col z-30">
        <div className="px-6 py-6 border-b border-[#1a1a1a]">
          <Link to="/admin" className="font-heading text-xl font-black tracking-[0.2em] text-[#E6E2D3]">REHBAR</Link>
          <p className="font-mono text-[10px] tracking-[0.3em] text-[#6B6B6B] mt-1">ADMIN PANEL</p>
        </div>
        <nav className="flex-1 py-6">
          {NAV.map(item => {
            const Icon = item.icon;
            const active = item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to);
            return (
              <Link key={item.to} to={item.to} className={`flex items-center gap-3 px-6 py-3 font-mono text-xs tracking-[0.2em] uppercase transition-colors ${active ? "text-[#C4311E] border-l-2 border-[#C4311E] bg-[#C4311E]/5" : "text-[#6B6B6B] hover:text-[#E6E2D3] border-l-2 border-transparent"}`}>
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="px-6 py-6 border-t border-[#1a1a1a]">
          <Link to="/" className="flex items-center gap-2 font-mono text-xs tracking-[0.2em] text-[#6B6B6B] hover:text-[#E6E2D3] uppercase transition-colors">
            <ExternalLink size={14} />
            View Site
          </Link>
        </div>
      </aside>

      <main className="flex-1 ml-60 p-8 md:p-12">
        <Outlet />
      </main>
    </div>
  );
}