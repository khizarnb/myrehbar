import { db } from '@/api/rehbarClient';

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clearStoreCachesAndSync } from "@/lib/entityData";
import { CreditCard, Check, AlertCircle, Lock, DollarSign } from "lucide-react";

export default function AdminPayments() {
  const queryClient = useQueryClient();
  const [saved, setSaved] = useState(false);

  const { data: settingRecord, isLoading } = useQuery({
    queryKey: ['payment_methods_setting'],
    queryFn: async () => await db.entities.SiteSetting.get('payment_methods'),
    staleTime: 0
  });

  const [config, setConfig] = useState({
    stripe_enabled: true,
    stripe_public_key: "pk_live_51M0...EXAMPLE",
    cod_enabled: true,
    paypal_enabled: false,
    currency: "USD ($)"
  });

  useEffect(() => {
    if (settingRecord && settingRecord.value) {
      try {
        const parsed = typeof settingRecord.value === 'string' ? JSON.parse(settingRecord.value) : settingRecord.value;
        setConfig(prev => ({ ...prev, ...parsed }));
      } catch {}
    }
  }, [settingRecord]);

  const saveMutation = useMutation({
    mutationFn: async (newConfig) => await db.entities.SiteSetting.update('payment_methods', JSON.stringify(newConfig)),
    onSuccess: async () => {
      await clearStoreCachesAndSync(queryClient, true);
      await queryClient.invalidateQueries({ queryKey: ['payment_methods_setting'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate(config);
  };

  const inputCls = "w-full bg-[#141414] border border-[#222] text-white px-4 py-2.5 rounded-lg font-body text-xs focus:outline-none focus:border-[#C4311E] transition-colors";
  const labelCls = "font-mono text-[10px] tracking-[0.3em] text-[#6B6B6B] uppercase block mb-2";

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="border-b border-[#1a1a1a] pb-6">
        <h1 className="font-heading text-3xl font-black text-white tracking-wide flex items-center gap-3">
          <CreditCard className="text-[#C4311E]" size={28} />
          Payment Gateways & Currency
        </h1>
        <p className="font-body text-xs text-[#888] mt-1">Manage global merchant checkout providers (Stripe, Cash on Delivery, Apple Pay) in Supabase</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-[#101010] border border-[#1e1e1e] p-6 rounded-xl space-y-6">
          <div className="flex items-center justify-between border-b border-[#1a1a1a] pb-4">
            <div>
              <h3 className="font-heading text-base font-bold text-white flex items-center gap-2">
                <Lock size={16} className="text-emerald-400" /> Stripe Card & Apple Pay Gateway
              </h3>
              <p className="font-body text-xs text-[#888]">Direct credit/debit card processing for international customers</p>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={config.stripe_enabled} onChange={e => setConfig({...config, stripe_enabled: e.target.checked})} className="w-5 h-5 accent-[#C4311E]" />
              <span className="font-mono text-xs font-bold uppercase text-white">{config.stripe_enabled ? "Active" : "Disabled"}</span>
            </label>
          </div>
          <div>
            <label className={labelCls}>Stripe Publishable Key</label>
            <input type="text" className={inputCls} value={config.stripe_public_key} onChange={e => setConfig({...config, stripe_public_key: e.target.value})} placeholder="pk_live_..." />
          </div>
        </div>

        <div className="bg-[#101010] border border-[#1e1e1e] p-6 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading text-base font-bold text-white flex items-center gap-2">
                <DollarSign size={16} className="text-amber-400" /> Cash on Delivery (COD)
              </h3>
              <p className="font-body text-xs text-[#888]">Allow customers to pay in cash upon physical order delivery</p>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={config.cod_enabled} onChange={e => setConfig({...config, cod_enabled: e.target.checked})} className="w-5 h-5 accent-[#C4311E]" />
              <span className="font-mono text-xs font-bold uppercase text-white">{config.cod_enabled ? "Active" : "Disabled"}</span>
            </label>
          </div>
        </div>

        <div className="bg-[#101010] border border-[#1e1e1e] p-6 rounded-xl space-y-4">
          <div>
            <label className={labelCls}>Store Currency Display</label>
            <select className={inputCls} value={config.currency} onChange={e => setConfig({...config, currency: e.target.value})}>
              <option value="USD ($)">USD ($)</option>
              <option value="EUR (€)">EUR (€)</option>
              <option value="GBP (£)">GBP (£)</option>
              <option value="CAD ($)">CAD ($)</option>
              <option value="PKR (Rs)">PKR (Rs)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button type="submit" disabled={saveMutation.isPending} className="px-8 py-3 bg-[#C4311E] hover:bg-[#a02818] text-white font-mono text-xs uppercase font-bold tracking-wider rounded-lg transition-colors shadow-lg">
            {saveMutation.isPending ? "Saving..." : "Save Payment Settings"}
          </button>
          {saved && <span className="text-emerald-400 font-mono text-xs flex items-center gap-1"><Check size={14}/> Successfully updated in Supabase!</span>}
        </div>
      </form>
    </div>
  );
}
