const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clearStoreCachesAndSync } from "@/lib/entityData";
import { FileText, Plus, Pencil, Trash2, X, Globe } from "lucide-react";

export default function AdminPages() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: "", slug: "", content: "", seo_title: "", seo_description: "", status: "published" });

  const { data: pages = [], isLoading } = useQuery({
    queryKey: ['pages'],
    queryFn: async () => await db.entities.Page.list(),
    staleTime: 0
  });

  const mutation = useMutation({
    mutationFn: async (data) => {
      if (editing) return await db.entities.Page.update(editing.id, data);
      return await db.entities.Page.create(data);
    },
    onSuccess: async () => {
      await clearStoreCachesAndSync(queryClient, true);
      await queryClient.invalidateQueries({ queryKey: ['pages'] });
      setShowModal(false);
      setEditing(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => await db.entities.Page.delete(id),
    onSuccess: async () => {
      await clearStoreCachesAndSync(queryClient, true);
      await queryClient.invalidateQueries({ queryKey: ['pages'] });
    }
  });

  const handleEdit = (p) => {
    setEditing(p);
    setForm({ title: p.title || "", slug: p.slug || "", content: p.content || "", seo_title: p.seo_title || "", seo_description: p.seo_description || "", status: p.status || "published" });
    setShowModal(true);
  };

  const inputCls = "w-full bg-transparent border border-[#1a1a1a] text-[#E6E2D3] px-4 py-2.5 font-body text-sm focus:outline-none focus:border-[#C4311E] transition-colors";
  const labelCls = "font-mono text-[10px] tracking-[0.3em] text-[#6B6B6B] uppercase block mb-2";

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1a1a1a] pb-6">
        <div>
          <h1 className="font-heading text-3xl font-black text-white tracking-wide flex items-center gap-3">
            <FileText className="text-[#C4311E]" size={28} />
            Website Pages & Content
          </h1>
          <p className="font-body text-xs text-[#888] mt-1">Manage static content pages (About Us, Privacy Policy, Terms) directly inside Supabase</p>
        </div>
        <button
          onClick={() => { setEditing(null); setForm({ title: "", slug: "", content: "", seo_title: "", seo_description: "", status: "published" }); setShowModal(true); }}
          className="bg-[#C4311E] hover:bg-[#a02818] text-white px-5 py-2.5 rounded-lg font-mono text-xs uppercase font-bold tracking-wider flex items-center gap-2 transition-colors shadow-lg shadow-[#C4311E]/20"
        >
          <Plus size={16} /> New Page
        </button>
      </div>

      <div className="bg-[#101010] border border-[#1e1e1e] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1e1e1e] bg-[#141414]">
                <th className="text-left px-6 py-3.5 font-mono text-[10px] tracking-wider text-[#888] uppercase">Title</th>
                <th className="text-left px-6 py-3.5 font-mono text-[10px] tracking-wider text-[#888] uppercase">Slug URL</th>
                <th className="text-left px-6 py-3.5 font-mono text-[10px] tracking-wider text-[#888] uppercase">SEO Title</th>
                <th className="text-left px-6 py-3.5 font-mono text-[10px] tracking-wider text-[#888] uppercase">Status</th>
                <th className="text-right px-6 py-3.5 font-mono text-[10px] tracking-wider text-[#888] uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e1e1e]">
              {isLoading ? (
                <tr><td colSpan={5} className="text-center py-10 text-[#888] font-mono text-xs">Loading pages...</td></tr>
              ) : pages.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-10 text-[#888] font-mono text-xs">No pages found.</td></tr>
              ) : (
                pages.map(p => (
                  <tr key={p.id} className="hover:bg-[#151515] transition-colors">
                    <td className="px-6 py-4 font-heading text-sm font-bold text-white">{p.title}</td>
                    <td className="px-6 py-4 font-mono text-xs text-[#C4311E]">/{p.slug}</td>
                    <td className="px-6 py-4 font-body text-xs text-[#ccc]">{p.seo_title || p.title}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full font-mono text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase font-bold">{p.status || "published"}</span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-3">
                      <button onClick={() => handleEdit(p)} className="text-[#888] hover:text-white transition-colors" title="Edit"><Pencil size={16} /></button>
                      <button onClick={() => { if (confirm(`Delete page "${p.title}"?`)) deleteMutation.mutate(p.id); }} className="text-[#888] hover:text-rose-500 transition-colors" title="Delete"><Trash2 size={16} /></button>
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
          <div className="bg-[#0F0F0F] border border-[#1a1a1a] w-full max-w-2xl rounded-xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#1a1a1a] sticky top-0 bg-[#0F0F0F]">
              <h2 className="font-heading text-lg font-bold text-white">{editing ? "Edit Page" : "New Page"}</h2>
              <button onClick={() => setShowModal(false)} className="text-[#6B6B6B] hover:text-white"><X size={20} /></button>
            </div>
            <form onSubmit={e => { e.preventDefault(); mutation.mutate(form); }} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Page Title</label>
                  <input className={inputCls} value={form.title} onChange={e => setForm({...form, title: e.target.value, slug: form.slug || e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-')})} required />
                </div>
                <div>
                  <label className={labelCls}>URL Slug</label>
                  <input className={inputCls} value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} required />
                </div>
              </div>
              <div>
                <label className={labelCls}>Page Content (Markdown / HTML)</label>
                <textarea className={inputCls} rows={6} value={form.content} onChange={e => setForm({...form, content: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>SEO Title</label>
                  <input className={inputCls} value={form.seo_title} onChange={e => setForm({...form, seo_title: e.target.value})} />
                </div>
                <div>
                  <label className={labelCls}>Status</label>
                  <select className={inputCls} value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                    <option value="published" className="bg-[#0F0F0F]">Published</option>
                    <option value="draft" className="bg-[#0F0F0F]">Draft</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-[#333] text-white rounded text-xs font-mono uppercase">Cancel</button>
                <button type="submit" disabled={mutation.isPending} className="px-5 py-2 bg-[#C4311E] text-white rounded text-xs font-mono font-bold uppercase hover:bg-[#a02818]">
                  {mutation.isPending ? "Saving..." : "Save Page"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
