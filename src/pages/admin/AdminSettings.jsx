import React from "react";
import { useOutletContext } from "react-router-dom";
import { Shield, Lock, CheckCircle2, AlertTriangle, Key, Users, Settings } from "lucide-react";

export default function AdminSettings() {
  const context = useOutletContext() || {};
  const { activeRole = "super_admin" } = context;

  const rolesList = [
    {
      name: "Super Admin",
      code: "super_admin",
      color: "text-purple-400 bg-purple-500/10 border-purple-500/30",
      description: "Master store owner with unrestricted access across the entire e-commerce platform.",
      permissions: [
        "Full store revenue & analytics access across all customers",
        "View, create, edit, and delete ALL public store orders globally",
        "Manage full product catalog, pricing, SKU inventory, and drops",
        "Access complete customer directory with contact numbers, spending, & LTV",
        "Export global CSV / Excel data reports for accounting and logistics",
        "Manage staff accounts and modify role permissions"
      ]
    },
    {
      name: "Store Admin",
      code: "admin",
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
      description: "Senior manager responsible for day-to-day operations and fulfillment.",
      permissions: [
        "Full dashboard revenue & analytics overview",
        "View, edit, and update order fulfillment & payment statuses globally",
        "Manage product inventory levels and catalog details",
        "View customer directory and contact details",
        "Export order reports and fulfillment manifests"
      ]
    },
    {
      name: "Operations Manager",
      code: "manager",
      color: "text-blue-400 bg-blue-500/10 border-blue-500/30",
      description: "Focused strictly on order fulfillment and product inventory.",
      permissions: [
        "View and update all customer orders (mark shipped, fulfilled)",
        "Adjust product stock levels when shipments arrive",
        "View basic product sales volume"
      ]
    },
    {
      name: "Fulfillment Staff",
      code: "staff",
      color: "text-amber-400 bg-amber-500/10 border-amber-500/30",
      description: "Warehouse or support staff restricted to processing shipments.",
      permissions: [
        "View order packing slips and shipping addresses",
        "Update individual order status (e.g., from pending to processing)"
      ]
    },
    {
      name: "Public Customer",
      code: "customer",
      color: "text-rose-400 bg-rose-500/10 border-rose-500/30",
      description: "Standard registered user or guest purchaser.",
      permissions: [
        "View ONLY personal orders placed with own authenticated customer ID/email",
        "No access to global store orders, revenue, customer directory, or admin routes"
      ]
    }
  ];

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="border-b border-[#1e1e1e] pb-6">
        <h1 className="font-heading text-3xl font-black tracking-wider text-white flex items-center gap-3">
          <Shield className="text-[#C4311E]" />
          Role-Based Access Control & Permissions
        </h1>
        <p className="font-body text-xs text-[#888] mt-1">
          Configure security policies, verify data isolation rules, and test staff permissions
        </p>
      </div>

      {/* Active simulation alert */}
      <div className="bg-[#101010] border border-[#222] p-6 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#C4311E]/10 border border-[#C4311E]/30 flex items-center justify-center text-[#C4311E]">
            <Key size={24} />
          </div>
          <div>
            <span className="font-mono text-[10px] tracking-widest text-[#888] uppercase">Current Active Session Role</span>
            <p className="font-heading text-lg font-black text-white uppercase flex items-center gap-2 mt-0.5">
              {activeRole.replace('_', ' ')}
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </p>
          </div>
        </div>
        <div className="text-xs font-mono text-[#888] bg-[#161616] px-4 py-2 rounded-lg border border-[#262626]">
          Tip: Use the top bar dropdown "Role:" to instantly test how the UI locks down for Staff and Customers.
        </div>
      </div>

      {/* API / Data Layer Architecture Note */}
      <div className="bg-[#101010] border border-emerald-500/30 p-6 rounded-xl">
        <h3 className="font-heading text-base font-bold text-emerald-400 flex items-center gap-2 mb-2">
          <CheckCircle2 size={18} />
          Global Store Data Layer Architecture Active
        </h3>
        <p className="font-body text-xs text-[#ccc] leading-relaxed">
          The API client (`rehbarClient.js`) and TanStack Query layer have been configured to ensure **Super Admin retrieves ALL store data** across every public shopper, country, and transaction. Unlike personal customer dashboards, the admin data stream (`Order.list()`, `Customer.list()`, `Product.list()`) is **never filtered by authenticated customer ID** when accessed under admin credentials.
        </p>
      </div>

      {/* Roles & Permissions Matrix */}
      <div className="space-y-4">
        <h2 className="font-heading text-lg font-bold text-white mb-2">System Roles & Privilege Matrix</h2>
        <div className="grid grid-cols-1 gap-4">
          {rolesList.map((role) => (
            <div
              key={role.code}
              className={`bg-[#101010] border rounded-xl p-6 transition-all ${
                activeRole === role.code ? "border-[#C4311E] shadow-[0_0_20px_rgba(196,49,30,0.15)]" : "border-[#1e1e1e]"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1e1e1e] pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full font-mono text-xs uppercase font-bold border ${role.color}`}>
                    {role.name}
                  </span>
                  <span className="font-mono text-xs text-[#6B6B6B] uppercase">({role.code})</span>
                </div>
                {activeRole === role.code && (
                  <span className="font-mono text-[11px] text-[#C4311E] font-bold flex items-center gap-1">
                    ● Currently Testing This Role
                  </span>
                )}
              </div>

              <p className="font-body text-xs text-white font-semibold mb-4">{role.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {role.permissions.map((perm, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs font-mono text-[#ccc]">
                    <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                    <span>{perm}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
