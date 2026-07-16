import { db } from '@/api/rehbarClient';

import React, { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useQueryClient } from '@tanstack/react-query';
import { 
  LayoutDashboard, Package, ShoppingCart, Users, FileText, ExternalLink, 
  Lock, LogOut, MessageSquare, Shield, Bell, Search, ChevronDown, CheckCircle, AlertTriangle, RefreshCw,
  Tags, Archive, File, Image, Percent, BarChart3, FileSpreadsheet, Truck, CreditCard, UserCheck, Settings
} from "lucide-react";
import { useOrders, useProducts, clearStoreCachesAndSync } from "@/lib/entityData";

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/categories", label: "Categories", icon: Tags },
  { to: "/admin/inventory", label: "Inventory", icon: Archive },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/messages", label: "Contact Messages", icon: MessageSquare },
  { to: "/admin/journal", label: "Blogs", icon: FileText },
  { to: "/admin/pages", label: "Pages", icon: File },
  { to: "/admin/media", label: "Media Library", icon: Image },
  { to: "/admin/coupons", label: "Coupons", icon: Percent },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/admin/reports", label: "Reports", icon: FileSpreadsheet },
  { to: "/admin/shipping", label: "Shipping", icon: Truck },
  { to: "/admin/payments", label: "Payments", icon: CreditCard },
  { to: "/admin/users", label: "Users", icon: UserCheck },
  { to: "/admin/roles", label: "Roles", icon: Shield },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout() {
  const location = useLocation();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeRole, setActiveRole] = useState("super_admin");
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [clearing, setClearing] = useState(false);

  const { data: orders } = useOrders();
  const { data: products } = useProducts();

  useEffect(() => {
    // Check session or local role override
    const savedRole = localStorage.getItem("__rehbar_admin_active_role__");
    if (savedRole) setActiveRole(savedRole);

    db.auth.me().then(u => { 
      setUser(u || { id: "admin_1", email: "admin@myrehbar.com", role: "super_admin" }); 
      setLoading(false); 
    }).catch(() => {
      setUser({ id: "admin_1", email: "admin@myrehbar.com", role: "super_admin" });
      setLoading(false);
    });
  }, []);

  const handleRoleChange = (newRole) => {
    setActiveRole(newRole);
    localStorage.setItem("__rehbar_admin_active_role__", newRole);
    setShowRoleDropdown(false);
  };

  const handleLogout = () => {
    db.auth.logout('/login');
  };

  const handleClearHeaderCache = async () => {
    setClearing(true);
    await clearStoreCachesAndSync(queryClient, true);
    setTimeout(() => {
      setClearing(false);
      alert("✅ Global Store Caches Cleared! All prices & products across the live site and dashboard have been synchronized with the database.");
    }, 600);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#333] border-t-[#C4311E] rounded-full animate-spin"></div>
      </div>
    );
  }

  // Calculate notifications
  const pendingOrdersCount = (orders || []).filter(o => o.status === 'pending').length;
  const lowStockCount = (products || []).filter(p => (p.inventory || 0) < 20).length;
  const totalNotifications = pendingOrdersCount + lowStockCount;

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-[#E6E2D3] flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-[#0a0a0a] border-r border-[#1a1a1a] fixed inset-y-0 left-0 flex flex-col z-40">
        <div className="px-6 py-5 border-b border-[#1a1a1a] flex items-center justify-between">
          <div>
            <Link to="/admin" className="font-heading text-xl font-black tracking-[0.2em] text-[#E6E2D3]">REHBAR</Link>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <p className="font-mono text-[10px] tracking-[0.2em] text-[#6B6B6B] uppercase font-bold">SUPER ADMIN</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          {NAV.map(item => {
            const Icon = item.icon;
            const active = item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center justify-between px-4 py-3 rounded-lg font-mono text-xs tracking-[0.15em] uppercase transition-all ${
                  active 
                    ? "text-white bg-[#C4311E] shadow-[0_4px_20px_rgba(196,49,30,0.3)] font-bold" 
                    : "text-[#888] hover:text-[#E6E2D3] hover:bg-[#151515]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} className={active ? "text-white" : "text-[#888]"} />
                  <span>{item.label}</span>
                </div>
                {item.label === "Orders" && pendingOrdersCount > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${active ? "bg-white text-[#C4311E]" : "bg-[#C4311E] text-white"}`}>
                    {pendingOrdersCount}
                  </span>
                )}
                {item.label === "Products" && lowStockCount > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${active ? "bg-white/20 text-white" : "bg-amber-600 text-white"}`}>
                    !
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#1a1a1a] space-y-2 bg-[#080808]">
          <div className="px-3 py-2 rounded bg-[#111] border border-[#222] mb-2">
            <p className="font-mono text-[10px] text-[#888] uppercase">Current Permission Role</p>
            <p className="font-mono text-xs text-emerald-400 font-bold uppercase mt-0.5 flex items-center gap-1.5">
              <Shield size={12} />
              {activeRole.replace('_', ' ')}
            </p>
          </div>
          <Link to="/" className="w-full flex items-center gap-3 px-3 py-2.5 rounded font-mono text-xs tracking-[0.15em] text-[#888] hover:text-white hover:bg-[#151515] uppercase transition-colors">
            <ExternalLink size={16} />
            View Live Store
          </Link>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded font-mono text-xs tracking-[0.15em] text-[#C4311E] hover:text-white hover:bg-[#C4311E]/10 uppercase transition-colors">
            <LogOut size={16} />
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Content Area with Top Bar */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="h-16 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-[#1a1a1a] sticky top-0 z-30 px-8 flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B6B6B]" size={16} />
              <input
                type="text"
                placeholder="Search orders, customers, or products across store..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#141414] border border-[#262626] rounded-lg pl-10 pr-4 py-1.5 text-xs text-[#E6E2D3] placeholder-[#6B6B6B] focus:outline-none focus:border-[#C4311E] transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Clear Cache Quick Action */}
            <button
              onClick={handleClearHeaderCache}
              disabled={clearing}
              className="flex items-center gap-1.5 bg-[#161616] hover:bg-[#222] border border-[#333] hover:border-emerald-500/50 text-emerald-400 px-3 py-1.5 rounded-lg text-xs font-mono transition-all shadow-sm"
              title="Purge all store cache and pull fresh data from database"
            >
              <RefreshCw size={13} className={clearing ? "animate-spin text-emerald-400" : ""} />
              <span className="hidden sm:inline">{clearing ? "Syncing..." : "Clear Caches"}</span>
            </button>

            {/* Role Simulator Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                className="flex items-center gap-2 bg-[#161616] border border-[#262626] hover:border-[#444] px-3 py-1.5 rounded-lg text-xs font-mono transition-colors"
              >
                <Shield size={14} className="text-[#C4311E]" />
                <span className="text-[#888]">Role:</span>
                <span className="text-emerald-400 font-bold uppercase">{activeRole.replace('_', ' ')}</span>
                <ChevronDown size={14} className="text-[#888]" />
              </button>

              {showRoleDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-[#121212] border border-[#262626] rounded-xl shadow-2xl py-2 z-50">
                  <p className="px-4 py-1.5 font-mono text-[10px] text-[#6B6B6B] uppercase border-b border-[#222]">Test Permissions</p>
                  {[
                    { role: "super_admin", label: "Super Admin (Full Access)" },
                    { role: "admin", label: "Admin (Manage Store)" },
                    { role: "manager", label: "Manager (Orders & Products)" },
                    { role: "staff", label: "Staff (Orders Only)" },
                    { role: "customer", label: "Customer (Personal Only)" },
                  ].map((item) => (
                    <button
                      key={item.role}
                      onClick={() => handleRoleChange(item.role)}
                      className={`w-full text-left px-4 py-2 font-mono text-xs hover:bg-[#1e1e1e] flex items-center justify-between ${
                        activeRole === item.role ? "text-[#C4311E] font-bold bg-[#1a1a1a]" : "text-[#ccc]"
                      }`}
                    >
                      <span>{item.label}</span>
                      {activeRole === item.role && <CheckCircle size={14} />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 bg-[#161616] border border-[#262626] hover:border-[#444] rounded-lg text-[#ccc] transition-colors"
              >
                <Bell size={18} />
                {totalNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#C4311E] text-white font-mono text-[9px] font-bold rounded-full flex items-center justify-center">
                    {totalNotifications}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-[#121212] border border-[#262626] rounded-xl shadow-2xl py-3 px-4 z-50 space-y-3">
                  <div className="flex items-center justify-between border-b border-[#222] pb-2">
                    <h3 className="font-heading text-sm font-bold text-white">Store Notifications</h3>
                    <span className="font-mono text-[10px] text-[#C4311E]">{totalNotifications} active</span>
                  </div>
                  {pendingOrdersCount > 0 && (
                    <Link to="/admin/orders" onClick={() => setShowNotifications(false)} className="flex items-start gap-3 p-2.5 rounded-lg bg-[#1a1a1a] hover:bg-[#222] transition-colors">
                      <ShoppingCart size={16} className="text-[#C4311E] mt-0.5 shrink-0" />
                      <div>
                        <p className="font-heading text-xs font-bold text-white">{pendingOrdersCount} Pending Orders</p>
                        <p className="font-body text-[11px] text-[#888]">New customer orders requiring processing and shipment.</p>
                      </div>
                    </Link>
                  )}
                  {lowStockCount > 0 && (
                    <Link to="/admin/products" onClick={() => setShowNotifications(false)} className="flex items-start gap-3 p-2.5 rounded-lg bg-[#1a1a1a] hover:bg-[#222] transition-colors">
                      <AlertTriangle size={16} className="text-amber-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-heading text-xs font-bold text-white">{lowStockCount} Low Stock Products</p>
                        <p className="font-body text-[11px] text-[#888]">Inventory alert: check items below 20 units.</p>
                      </div>
                    </Link>
                  )}
                  {totalNotifications === 0 && (
                    <p className="font-body text-xs text-[#888] text-center py-4">No active notifications. All clear!</p>
                  )}
                </div>
              )}
            </div>

            {/* Profile Avatar */}
            <div className="flex items-center gap-3 pl-3 border-l border-[#222]">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#C4311E] to-[#E6E2D3] flex items-center justify-center font-heading font-black text-xs text-white">
                SA
              </div>
              <div className="hidden md:block text-left">
                <p className="font-heading text-xs font-bold text-white leading-tight">Master Admin</p>
                <p className="font-mono text-[10px] text-emerald-400 leading-tight">Store Owner</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-8 bg-[#0F0F0F]">
          <Outlet context={{ activeRole, searchQuery }} />
        </main>
      </div>
    </div>
  );
}