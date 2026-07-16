import React, { useState } from "react";
import { Shield, Check, Lock, Users, Package, ShoppingCart, FileText, Settings } from "lucide-react";

export default function AdminRoles() {
  const roles = [
    {
      name: "Super Admin",
      desc: "Full unrestricted access across all store settings, financial ledgers, database tables, and staff permissions.",
      color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
      perms: ["Manage Products & Catalog", "Manage Orders & Refunds", "Manage Customers & LTV", "Publish Blogs & Pages", "Manage Shipping & Payments", "Manage Staff & Permissions"]
    },
    {
      name: "Store Manager",
      desc: "Daily operational access to fulfill orders, update stock inventory, create coupons, and view customer directories.",
      color: "text-blue-400 border-blue-500/30 bg-blue-500/10",
      perms: ["Manage Products & Catalog", "Manage Orders & Refunds", "Manage Customers & LTV", "Publish Blogs & Pages"]
    },
    {
      name: "Content Editor",
      desc: "Specialized access for marketing and content writers. Can publish journal blogs, adjust SEO tags, and edit static pages.",
      color: "text-purple-400 border-purple-500/30 bg-purple-500/10",
      perms: ["Publish Blogs & Pages", "Manage Media Library"]
    },
    {
      name: "Support Agent",
      desc: "Customer service role. Can view order statuses, process exchanges, and answer customer contact messages.",
      color: "text-amber-400 border-amber-500/30 bg-amber-500/10",
      perms: ["Manage Orders & Refunds", "View Customer Directories"]
    }
  ];

  return (
    <div className="space-y-8">
      <div className="border-b border-[#1a1a1a] pb-6">
        <h1 className="font-heading text-3xl font-black text-white tracking-wide flex items-center gap-3">
          <Shield className="text-[#C4311E]" size={28} />
          Role Permissions & Security Matrix
        </h1>
        <p className="font-body text-xs text-[#888] mt-1">Audit granular administrative capabilities assigned to team roles across your Shopify infrastructure</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {roles.map((r, i) => (
          <div key={i} className="bg-[#101010] border border-[#1e1e1e] rounded-xl p-6 flex flex-col justify-between hover:border-[#333] transition-all">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-heading text-lg font-bold text-white flex items-center gap-2">
                  <Lock size={16} className="text-[#C4311E]" /> {r.name}
                </h3>
                <span className={`px-2.5 py-1 rounded font-mono text-[10px] uppercase font-bold border ${r.color}`}>
                  Active Role
                </span>
              </div>
              <p className="font-body text-xs text-[#888] leading-relaxed mb-6">{r.desc}</p>

              <div className="space-y-2.5 border-t border-[#1a1a1a] pt-4">
                <p className="font-mono text-[10px] tracking-[0.2em] text-[#6B6B6B] uppercase mb-2">Granted Capabilities</p>
                {r.perms.map((perm, j) => (
                  <div key={j} className="flex items-center gap-2 font-mono text-xs text-[#ccc]">
                    <Check size={14} className="text-emerald-400 flex-shrink-0" />
                    <span>{perm}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
