import { db } from '@/api/rehbarClient';

import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clearStoreCachesAndSync } from "@/lib/entityData";
import { Truck, Plus, Trash2, CheckCircle2, Globe } from "lucide-react";

export default function AdminShipping() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ zone: "", countries: "", rate: 15, free_above: 150 });

  const { data: settingRecord, isLoading } = useQuery({
    queryKey: ['shipping_zones_setting'],
    queryFn: async () => await db.entities.SiteSetting.get('shipping_zones'),
    staleTime: 0
  });

  const zones = useMemo(() => {
    if (!settingRecord || !settingRecord.value) return [
      { id: "zone_1", zone: "United States & Canada", countries: "USA, Canada", rate: 15, free_above: 150 },
      { id: "zone_2", zone: "United Kingdom & EU", countries: "UK, Germany, France, Italy", rate: 20, free_above: 200 },
      { id: "zone_3", zone: "Rest of World (Global Express)", countries: "Worldwide", rate: 30, free_above: 250 }
    ];
    try { return typeof settingRecord.value === 'string' ? JSON.parse(settingRecord.value) : settingRecord.value; } catch { return []; }
  }, [settingRecord]);

  const saveMutation = useMutation({
    mutationFn: async (newList) => await db.entities.SiteSetting.update('shipping_zones', JSON.stringify(newList)),
    onSuccess: async () => {
      await clearStoreCachesAndSync(queryClient, true);
      await queryClient.invalidateQueries({ queryKey: ['shipping_zones_setting'] });
      setForm({ zone: "", countries: "", rate: 15, free_above: 150 });
    }
  });

  const handleAddZone = (e) => {
    e.preventDefault();
    if (!form.zone.trim()) return;
    const newZone = { id: "zone_" + Date.now(), zone: form.zone, countries: form.countries, rate: Number(form.rate), free_above: Number(form.free_above) };
    saveMutation.mutate([...zones, newZone]);
  };

  const handleDelete = (id) => {
    if (confirm("Delete this shipping zone?")) {
      saveMutation.mutate(zones.filter(z => z.id !== id));
    }
  };

  const inputCls = "w-full bg-transparent border border-[#1a1a1a] text-[#E6E2D3] px-4 py-2.5 font-body text-sm focus:outline-none focus:border-[#C4311E] transition-colors";
  const labelCls = "font-mono text-[10px] tracking-[0.3em] text-[#6B6B6B] uppercase block mb-2";

  return (
    <div className="space-y-8">
      <div className="border-b border-[#1a1a1a] pb-6">
        <h1 className="font-heading text-3xl font-black text-white tracking-wide flex items-center gap-3">
          <Truck className="text-[#C4311E]" size={28} />
          Shipping Zones & Delivery Rates
        </h1>
        <p className="font-body text-xs text-[#888] mt-1">Configure worldwide carrier pricing, free shipping thresholds, and fulfillment rules in Supabase</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#101010] border border-[#1e1e1e] rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#1e1e1e] bg-[#141414]">
            <h3 className="font-heading text-base font-bold text-white">Configured Shipping Zones</h3>
          </div>
          <div className="divide-y divide-[#1e1e1e]">
            {zones.map(z => (
              <div key={z.id} className="p-6 flex items-center justify-between hover:bg-[#141414] transition-colors">
                <div>
                  <h4 className="font-heading text-base font-bold text-white flex items-center gap-2">
                    <Globe size={16} className="text-[#C4311E]" /> {z.zone}
                  </h4>
                  <p className="font-body text-xs text-[#888] mt-1">Countries: {z.countries || "Global"}</p>
                  <p className="font-mono text-xs text-emerald-400 mt-2 font-bold">
                    Standard Rate: ${z.rate} | Free Shipping Over ${z.free_above}
                  </p>
                </div>
                <button onClick={() => handleDelete(z.id)} className="text-[#888] hover:text-rose-500 p-2 transition-colors" title="Delete Zone">
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#101010] border border-[#1e1e1e] p-6 rounded-xl h-fit">
          <h3 className="font-heading text-base font-bold text-white mb-4">Add New Zone</h3>
          <form onSubmit={handleAddZone} className="space-y-4">
            <div>
              <label className={labelCls}>Zone Name</label>
              <input className={inputCls} value={form.zone} onChange={e => setForm({...form, zone: e.target.value})} placeholder="e.g. Asia Pacific" required />
            </div>
            <div>
              <label className={labelCls}>Countries Covered</label>
              <input className={inputCls} value={form.countries} onChange={e => setForm({...form, countries: e.target.value})} placeholder="e.g. Japan, Singapore, Australia" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Base Rate ($)</label>
                <input type="number" className={inputCls} value={form.rate} onChange={e => setForm({...form, rate: Number(e.target.value)})} required />
              </div>
              <div>
                <label className={labelCls}>Free Above ($)</label>
                <input type="number" className={inputCls} value={form.free_above} onChange={e => setForm({...form, free_above: Number(e.target.value)})} required />
              </div>
            </div>
            <button type="submit" disabled={saveMutation.isPending} className="w-full mt-2 py-3 bg-[#C4311E] hover:bg-[#a02818] text-white font-mono text-xs uppercase font-bold tracking-wider rounded-lg transition-colors">
              {saveMutation.isPending ? "Saving..." : "Create Shipping Zone"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
