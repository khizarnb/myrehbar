import { db } from '@/api/rehbarClient';

import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clearStoreCachesAndSync } from "@/lib/entityData";
import { UserCheck, Plus, Trash2, Shield, Mail } from "lucide-react";

export default function AdminUsers() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ name: "", email: "", role: "Store Manager" });

  const { data: settingRecord, isLoading } = useQuery({
    queryKey: ['admin_users_setting'],
    queryFn: async () => await db.entities.SiteSetting.get('admin_users'),
    staleTime: 0
  });

  const users = useMemo(() => {
    if (!settingRecord || !settingRecord.value) return [
      { id: "user_1", name: "Khizar Nawaz", email: "admin@myrehbar.com", role: "Super Admin", status: "Active" },
      { id: "user_2", name: "Support Team", email: "support@myrehbar.com", role: "Store Manager", status: "Active" }
    ];
    try { return typeof settingRecord.value === 'string' ? JSON.parse(settingRecord.value) : settingRecord.value; } catch { return []; }
  }, [settingRecord]);

  const saveMutation = useMutation({
    mutationFn: async (newList) => await db.entities.SiteSetting.update('admin_users', JSON.stringify(newList)),
    onSuccess: async () => {
      await clearStoreCachesAndSync(queryClient, true);
      await queryClient.invalidateQueries({ queryKey: ['admin_users_setting'] });
      setForm({ name: "", email: "", role: "Store Manager" });
    }
  });

  const handleAddUser = (e) => {
    e.preventDefault();
    if (!form.email.trim()) return;
    const newUser = { id: "user_" + Date.now(), name: form.name || form.email.split('@')[0], email: form.email, role: form.role, status: "Active" };
    saveMutation.mutate([...users, newUser]);
  };

  const handleDelete = (id) => {
    if (id === "user_1") return alert("Cannot remove primary Super Admin account.");
    if (confirm("Remove this staff member?")) {
      saveMutation.mutate(users.filter(u => u.id !== id));
    }
  };

  const inputCls = "w-full bg-[#141414] border border-[#222] text-white px-4 py-2 rounded-lg font-body text-xs focus:outline-none focus:border-[#C4311E] transition-colors";
  const labelCls = "font-mono text-[10px] tracking-[0.3em] text-[#6B6B6B] uppercase block mb-2";

  return (
    <div className="space-y-8">
      <div className="border-b border-[#1a1a1a] pb-6">
        <h1 className="font-heading text-3xl font-black text-white tracking-wide flex items-center gap-3">
          <UserCheck className="text-[#C4311E]" size={28} />
          Admin Staff & Team Members
        </h1>
        <p className="font-body text-xs text-[#888] mt-1">Manage team access and assign staff roles across the Shopify dashboard</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#101010] border border-[#1e1e1e] rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#1e1e1e] bg-[#141414]">
            <h3 className="font-heading text-base font-bold text-white">Active Staff Accounts</h3>
          </div>
          <div className="divide-y divide-[#1e1e1e]">
            {users.map(u => (
              <div key={u.id} className="p-6 flex items-center justify-between hover:bg-[#141414] transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#C4311E]/20 border border-[#C4311E]/40 flex items-center justify-center font-heading font-bold text-white">
                    {u.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-heading text-sm font-bold text-white flex items-center gap-2">
                      {u.name}
                      <span className="px-2 py-0.5 rounded font-mono text-[9px] bg-purple-500/20 text-purple-400 uppercase font-bold flex items-center gap-1">
                        <Shield size={10} /> {u.role}
                      </span>
                    </h4>
                    <p className="font-mono text-xs text-[#888] flex items-center gap-1 mt-0.5"><Mail size={12}/> {u.email}</p>
                  </div>
                </div>
                {u.id !== "user_1" && (
                  <button onClick={() => handleDelete(u.id)} className="text-[#888] hover:text-rose-500 p-2 transition-colors" title="Remove Staff">
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#101010] border border-[#1e1e1e] p-6 rounded-xl h-fit">
          <h3 className="font-heading text-base font-bold text-white mb-4">Invite Staff Member</h3>
          <form onSubmit={handleAddUser} className="space-y-4">
            <div>
              <label className={labelCls}>Full Name</label>
              <input className={inputCls} value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Sarah Connor" required />
            </div>
            <div>
              <label className={labelCls}>Email Address</label>
              <input type="email" className={inputCls} value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="staff@myrehbar.com" required />
            </div>
            <div>
              <label className={labelCls}>Assigned Role</label>
              <select className={inputCls} value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                <option value="Store Manager">Store Manager (Products & Orders)</option>
                <option value="Content Editor">Content Editor (Blogs & Pages)</option>
                <option value="Support Agent">Support Agent (Orders & Customers)</option>
                <option value="Super Admin">Super Admin (Full Access)</option>
              </select>
            </div>
            <button type="submit" disabled={saveMutation.isPending} className="w-full mt-2 py-3 bg-[#C4311E] hover:bg-[#a02818] text-white font-mono text-xs uppercase font-bold tracking-wider rounded-lg transition-colors">
              {saveMutation.isPending ? "Adding..." : "Add Staff Account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
