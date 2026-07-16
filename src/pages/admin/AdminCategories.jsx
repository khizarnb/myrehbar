const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clearStoreCachesAndSync } from "@/lib/entityData";
import { Tags, Plus, Pencil, Trash2, X, CheckCircle, AlertCircle } from "lucide-react";

export default function AdminCategories() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", slug: "", description: "" });

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => await db.entities.Category.list(),
    staleTime: 0
  });

  const createOrUpdateMutation = useMutation({
    mutationFn: async (data) => {
      if (editing) {
        return await db.entities.Category.update(editing.id, data);
      }
      return await db.entities.Category.create(data);
    },
    onSuccess: async () => {
      await clearStoreCachesAndSync(queryClient, true);
      await queryClient.invalidateQueries({ queryKey: ['categories'] });
      setShowModal(false);
      setEditing(null);
      setForm({ name: "", slug: "", description: "" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => await db.entities.Category.delete(id),
    onSuccess: async () => {
      await clearStoreCachesAndSync(queryClient, true);
      await queryClient.invalidateQueries({ queryKey: ['categories'] });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createOrUpdateMutation.mutate(form);
  };

  const handleEdit = (cat) => {
    setEditing(cat);
    setForm({ name: cat.name || "", slug: cat.slug || "", description: cat.description || "" });
    setShowModal(true);
  };

  const handleDelete = (cat) => {
    if (confirm(`Delete category "${cat.name}"?`)) {
      deleteMutation.mutate(cat.id);
    }
  };

  const inputCls = "w-full bg-transparent border border-[#1a1a1a] text-[#E6E2D3] px-4 py-2.5 font-body text-sm focus:outline-none focus:border-[#C4311E] transition-colors";
  const labelCls = "font-mono text-[10px] tracking-[0.3em] text-[#6B6B6B] uppercase block mb-2";

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1a1a1a] pb-6">
        <div>
          <h1 className="font-heading text-3xl font-black text-white tracking-wide flex items-center gap-3">
            <Tags className="text-[#C4311E]" size={28} />
            Categories Management
          </h1>
          <p className="font-body text-xs text-[#888] mt-1">Organize product collections and catalog taxonomy right in Supabase</p>
        </div>
        <button
          onClick={() => { setEditing(null); setForm({ name: "", slug: "", description: "" }); setShowModal(true); }}
          className="bg-[#C4311E] hover:bg-[#a02818] text-white px-5 py-2.5 rounded-lg font-mono text-xs uppercase font-bold tracking-wider flex items-center gap-2 transition-colors shadow-lg shadow-[#C4311E]/20"
        >
          <Plus size={16} /> New Category
        </button>
      </div>

      <div className="bg-[#101010] border border-[#1e1e1e] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1e1e1e] bg-[#141414]">
                <th className="text-left px-6 py-3.5 font-mono text-[10px] tracking-wider text-[#888] uppercase">Name</th>
                <th className="text-left px-6 py-3.5 font-mono text-[10px] tracking-wider text-[#888] uppercase">Slug</th>
                <th className="text-left px-6 py-3.5 font-mono text-[10px] tracking-wider text-[#888] uppercase">Description</th>
                <th className="text-left px-6 py-3.5 font-mono text-[10px] tracking-wider text-[#888] uppercase">Products Count</th>
                <th className="text-right px-6 py-3.5 font-mono text-[10px] tracking-wider text-[#888] uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e1e1e]">
              {isLoading ? (
                <tr><td colSpan={5} className="text-center py-10 text-[#888] font-mono text-xs">Loading categories...</td></tr>
              ) : categories.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-10 text-[#888] font-mono text-xs">No categories found in Supabase. Click New Category to create one.</td></tr>
              ) : (
                categories.map(cat => (
                  <tr key={cat.id} className="hover:bg-[#151515] transition-colors">
                    <td className="px-6 py-4 font-heading text-sm font-bold text-white">{cat.name}</td>
                    <td className="px-6 py-4 font-mono text-xs text-[#C4311E]">{cat.slug}</td>
                    <td className="px-6 py-4 font-body text-xs text-[#ccc] max-w-md truncate">{cat.description || "—"}</td>
                    <td className="px-6 py-4 font-mono text-xs text-emerald-400 font-bold">{cat.product_count || 0} items</td>
                    <td className="px-6 py-4 text-right space-x-3">
                      <button onClick={() => handleEdit(cat)} className="text-[#888] hover:text-white transition-colors" title="Edit"><Pencil size={16} /></button>
                      <button onClick={() => handleDelete(cat)} className="text-[#888] hover:text-rose-500 transition-colors" title="Delete"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-[#0F0F0F] border border-[#1a1a1a] w-full max-w-lg rounded-xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#1a1a1a]">
              <h2 className="font-heading text-lg font-bold text-white">{editing ? "Edit Category" : "New Category"}</h2>
              <button onClick={() => setShowModal(false)} className="text-[#6B6B6B] hover:text-white"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className={labelCls}>Category Name</label>
                <input className={inputCls} value={form.name} onChange={e => setForm({...form, name: e.target.value, slug: form.slug || e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-')})} required />
              </div>
              <div>
                <label className={labelCls}>Slug URL</label>
                <input className={inputCls} value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} required />
              </div>
              <div>
                <label className={labelCls}>Description</label>
                <textarea className={inputCls} rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-[#333] text-white rounded text-xs font-mono uppercase">Cancel</button>
                <button type="submit" disabled={createOrUpdateMutation.isPending} className="px-5 py-2 bg-[#C4311E] text-white rounded text-xs font-mono font-bold uppercase hover:bg-[#a02818]">
                  {createOrUpdateMutation.isPending ? "Saving..." : "Save Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
