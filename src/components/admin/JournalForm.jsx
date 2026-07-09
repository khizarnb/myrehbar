const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from "react";
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { X } from 'lucide-react';

function blocksToText(blocks) {
  if (!blocks || !blocks.length) return '';
  return blocks.map(b => b.type === 'heading' ? `## ${b.text}` : b.text).join('\n\n');
}

function textToBlocks(text) {
  if (!text.trim()) return [];
  return text.split('\n\n').filter(p => p.trim()).map(p => {
    const trimmed = p.trim();
    if (trimmed.startsWith('## ')) {
      return { type: 'heading', text: trimmed.slice(3) };
    }
    return { type: 'paragraph', text: trimmed };
  });
}

export default function JournalForm({ article, onClose }) {
  const queryClient = useQueryClient();
  const isEdit = !!article;

  const [form, setForm] = useState({
    title: article?.title || '',
    slug: article?.slug || '',
    subtitle: article?.subtitle || '',
    excerpt: article?.excerpt || '',
    image: article?.image || '',
    date: article?.date || '',
    blocksText: article ? blocksToText(article.blocks) : '',
  });

  const mutation = useMutation({
    mutationFn: async (data) => {
      if (isEdit) {
        return await db.entities.JournalArticle.update(article.id, data);
      }
      return await db.entities.JournalArticle.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journalArticles'] });
      onClose();
    },
  });

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    const blocks = textToBlocks(form.blocksText);
    const payload = {
      title: form.title,
      slug: form.slug || form.title.toLowerCase().replace(/\s+/g, '-'),
      subtitle: form.subtitle,
      excerpt: form.excerpt,
      image: form.image,
      date: form.date,
      blocks_json: JSON.stringify(blocks),
    };
    mutation.mutate(payload);
  };

  const inputCls = "w-full bg-transparent border border-[#1a1a1a] text-[#E6E2D3] px-4 py-2.5 font-body text-sm focus:outline-none focus:border-[#C4311E] transition-colors";
  const labelCls = "font-mono text-[10px] tracking-[0.3em] text-[#6B6B6B] uppercase block mb-2";

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-start justify-center overflow-y-auto p-4 md:p-8">
      <div className="bg-[#0F0F0F] border border-[#1a1a1a] w-full max-w-2xl my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1a1a1a] sticky top-0 bg-[#0F0F0F] z-10">
          <h2 className="font-heading text-xl font-bold text-[#E6E2D3]">{isEdit ? 'Edit Article' : 'New Article'}</h2>
          <button onClick={onClose} className="text-[#6B6B6B] hover:text-[#E6E2D3]"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Title</label>
              <input className={inputCls} value={form.title} onChange={set('title')} required />
            </div>
            <div>
              <label className={labelCls}>Slug</label>
              <input className={inputCls} value={form.slug} onChange={set('slug')} placeholder="auto from title" />
            </div>
          </div>

          <div>
            <label className={labelCls}>Subtitle</label>
            <input className={inputCls} value={form.subtitle} onChange={set('subtitle')} />
          </div>

          <div>
            <label className={labelCls}>Excerpt</label>
            <textarea className={inputCls} rows={2} value={form.excerpt} onChange={set('excerpt')} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Image URL</label>
              <input className={inputCls} value={form.image} onChange={set('image')} />
            </div>
            <div>
              <label className={labelCls}>Date / Drop Label</label>
              <input className={inputCls} value={form.date} onChange={set('date')} placeholder="Drop 001 — Journal" />
            </div>
          </div>

          <div>
            <label className={labelCls}>Content (use ## for headings, blank lines between paragraphs)</label>
            <textarea className={inputCls} rows={12} value={form.blocksText} onChange={set('blocksText')} />
          </div>

          {mutation.isError && <p className="text-[#C4311E] text-sm font-mono">Error: {mutation.error?.message}</p>}

          <div className="flex gap-3 pt-4">
            <button type="submit" disabled={mutation.isPending} className="flex-1 bg-[#C4311E] hover:bg-[#a02818] disabled:opacity-50 text-[#E6E2D3] px-6 py-3 font-heading font-bold text-sm tracking-[0.2em] uppercase transition-colors">
              {mutation.isPending ? 'Saving...' : isEdit ? 'Update Article' : 'Create Article'}
            </button>
            <button type="button" onClick={onClose} className="border border-[#333] text-[#E6E2D3] px-6 py-3 font-heading font-bold text-sm tracking-[0.2em] uppercase hover:border-[#C4311E] transition-colors">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}