import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Shield, Lock, CheckCircle2, AlertTriangle, Key, Users, Settings, Save, Globe, Megaphone, Mail, Phone, DollarSign, RefreshCw } from "lucide-react";
import { db } from "@/api/rehbarClient";
import { clearStoreCachesAndSync } from "@/lib/entityData";

export default function AdminSettings() {
  const context = useOutletContext() || {};
  const { activeRole = "super_admin" } = context;
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("store"); // 'store' or 'roles'
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [storeInfo, setStoreInfo] = useState({
    store_name: "REHBAR",
    contact_email: "sales@myrehbar.com",
    support_phone: "+1 (800) 555-REHB",
    currency: "USD",
    announcement_banner: "⚡ FREE SHIPPING ON ORDERS OVER $100 | LIMITED EDITION DROPS ACTIVE",
    maintenance_mode: false
  });

  const [seoSettings, setSeoSettings] = useState({
    default_meta_title: "REHBAR | Premium Heavyweight Calligraphic Streetwear",
    default_meta_description: "Uncompromising calligraphic streetwear designed with intention. 100% heavyweight cotton, limited edition drops, and direct charitable impact with every piece."
  });

  useEffect(() => {
    async function loadSettings() {
      try {
        const storeData = await db.entities.SiteSetting.get('store_info');
        if (storeData?.value) {
          setStoreInfo(prev => ({ ...prev, ...storeData.value }));
        }
        const seoData = await db.entities.SiteSetting.get('seo_settings');
        if (seoData?.value) {
          setSeoSettings(prev => ({ ...prev, ...seoData.value }));
        }
      } catch (e) {
        console.error("Failed to load settings:", e);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await db.entities.SiteSetting.update('store_info', storeInfo);
      await db.entities.SiteSetting.update('seo_settings', seoSettings);
      await clearStoreCachesAndSync(queryClient, true);
      alert("✅ Store settings saved to centralized Supabase database and live caches synchronized!");
    } catch (err) {
      alert(`❌ Failed to save settings: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

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
      <div className="border-b border-[#1e1e1e] pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-black tracking-wider text-white flex items-center gap-3">
            <Settings className="text-[#C4311E]" />
            Shopify Store & System Settings
          </h1>
          <p className="font-body text-xs text-[#888] mt-1">
            Manage live website content, global announcements, SEO metadata, and staff permissions
          </p>
        </div>
        <div className="flex bg-[#161616] p-1 rounded-xl border border-[#222]">
          <button
            onClick={() => setActiveTab("store")}
            className={`px-4 py-2 rounded-lg font-mono text-xs font-bold transition-all ${
              activeTab === "store" ? "bg-[#C4311E] text-white" : "text-[#888] hover:text-white"
            }`}
          >
            Website Content & Settings
          </button>
          <button
            onClick={() => setActiveTab("roles")}
            className={`px-4 py-2 rounded-lg font-mono text-xs font-bold transition-all ${
              activeTab === "roles" ? "bg-[#C4311E] text-white" : "text-[#888] hover:text-white"
            }`}
          >
            Role Permissions Matrix
          </button>
        </div>
      </div>

      {activeTab === "store" ? (
        <form onSubmit={handleSaveSettings} className="space-y-8">
          {/* General Store Info */}
          <div className="bg-[#101010] border border-[#222] rounded-2xl p-6 space-y-6">
            <div className="flex items-center gap-3 border-b border-[#1e1e1e] pb-4">
              <Globe className="text-[#C4311E]" size={20} />
              <h2 className="font-heading text-lg font-bold text-white">Live Storefront Configuration</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="font-mono text-[10px] tracking-widest text-[#888] uppercase block mb-2">Store Brand Name</label>
                <input
                  type="text"
                  value={storeInfo.store_name}
                  onChange={e => setStoreInfo({ ...storeInfo, store_name: e.target.value })}
                  className="w-full bg-[#181818] border border-[#333] text-white px-4 py-3 rounded-xl font-body text-sm focus:outline-none focus:border-[#C4311E]"
                />
              </div>

              <div>
                <label className="font-mono text-[10px] tracking-widest text-[#888] uppercase block mb-2">Store Currency Symbol / Code</label>
                <input
                  type="text"
                  value={storeInfo.currency}
                  onChange={e => setStoreInfo({ ...storeInfo, currency: e.target.value })}
                  className="w-full bg-[#181818] border border-[#333] text-white px-4 py-3 rounded-xl font-body text-sm focus:outline-none focus:border-[#C4311E]"
                />
              </div>

              <div>
                <label className="font-mono text-[10px] tracking-widest text-[#888] uppercase block mb-2">Order Notification / Contact Email</label>
                <input
                  type="email"
                  value={storeInfo.contact_email}
                  onChange={e => setStoreInfo({ ...storeInfo, contact_email: e.target.value })}
                  className="w-full bg-[#181818] border border-[#333] text-white px-4 py-3 rounded-xl font-body text-sm focus:outline-none focus:border-[#C4311E]"
                />
              </div>

              <div>
                <label className="font-mono text-[10px] tracking-widest text-[#888] uppercase block mb-2">Customer Support Phone / WhatsApp</label>
                <input
                  type="text"
                  value={storeInfo.support_phone}
                  onChange={e => setStoreInfo({ ...storeInfo, support_phone: e.target.value })}
                  className="w-full bg-[#181818] border border-[#333] text-white px-4 py-3 rounded-xl font-body text-sm focus:outline-none focus:border-[#C4311E]"
                />
              </div>
            </div>

            <div>
              <label className="font-mono text-[10px] tracking-widest text-[#888] uppercase block mb-2">Live Announcement Banner Text</label>
              <input
                type="text"
                value={storeInfo.announcement_banner}
                onChange={e => setStoreInfo({ ...storeInfo, announcement_banner: e.target.value })}
                className="w-full bg-[#181818] border border-[#333] text-emerald-400 font-bold px-4 py-3 rounded-xl font-body text-sm focus:outline-none focus:border-[#C4311E]"
              />
              <p className="font-mono text-[11px] text-[#6B6B6B] mt-1">This text scrolls across the top bar of every page on the live website.</p>
            </div>
          </div>

          {/* SEO Metadata */}
          <div className="bg-[#101010] border border-[#222] rounded-2xl p-6 space-y-6">
            <div className="flex items-center gap-3 border-b border-[#1e1e1e] pb-4">
              <Megaphone className="text-[#C4311E]" size={20} />
              <h2 className="font-heading text-lg font-bold text-white">Global SEO & Metadata</h2>
            </div>

            <div>
              <label className="font-mono text-[10px] tracking-widest text-[#888] uppercase block mb-2">Default Website Title Tag</label>
              <input
                type="text"
                value={seoSettings.default_meta_title}
                onChange={e => setSeoSettings({ ...seoSettings, default_meta_title: e.target.value })}
                className="w-full bg-[#181818] border border-[#333] text-white px-4 py-3 rounded-xl font-body text-sm focus:outline-none focus:border-[#C4311E]"
              />
            </div>

            <div>
              <label className="font-mono text-[10px] tracking-widest text-[#888] uppercase block mb-2">Default Meta Description</label>
              <textarea
                rows={3}
                value={seoSettings.default_meta_description}
                onChange={e => setSeoSettings({ ...seoSettings, default_meta_description: e.target.value })}
                className="w-full bg-[#181818] border border-[#333] text-white px-4 py-3 rounded-xl font-body text-sm focus:outline-none focus:border-[#C4311E] resize-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="bg-[#C4311E] hover:bg-[#a82818] text-white px-8 py-4 rounded-xl font-mono text-xs uppercase font-bold tracking-widest flex items-center gap-2 shadow-lg transition-colors"
            >
              {saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
              {saving ? "Saving to Supabase..." : "Save Store Settings to Live DB"}
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
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
                      ● Currently Active
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
      )}
    </div>
  );
}
