const db = globalThis.__B44_DB__ || { auth: { isAuthenticated: async () => false, me: async () => null }, entities: new Proxy({}, { get: () => ({ filter: async () => [], get: async () => null, create: async () => ({}), update: async () => ({}), delete: async () => ({}) }) }), integrations: { Core: { UploadFile: async () => ({ file_url: '' }) } } };

import React, { useState } from "react";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { clearStoreCachesAndSync } from '@/lib/entityData';
import { X } from 'lucide-react';

export default function ProductForm({ product, onClose }) {
  const queryClient = useQueryClient();
  const isEdit = !!product;

  const [form, setForm] = useState({
    title: product?.title || '',
    slug: product?.slug || '',
    subtitle: product?.subtitle || '',
    price: product?.price || 50,
    edition: product?.edition || '100',
    inventory: product?.inventory ?? 100,
    description: product?.description || '',
    heroImage: product?.heroImage || '',
    imagesText: (product?.images || []).join('\n'),
    material: product?.specs?.material || '',
    weight: product?.specs?.weight || '',
    print: product?.specs?.print || '',
    fit: product?.specs?.fit || 'Regular',
    limited: product?.specs?.limited || '100 Units Only',
    charity: product?.specs?.charity || '$6 per shirt to a charity you choose',
    blogTitle: product?.blogTitle || '',
    blogContent: product?.blogContent || '',
    active: product?.active ?? true,
  });

  const mutation = useMutation({
    mutationFn: async (data) => {
      if (isEdit) {
        return await db.entities.Product.update(product.id, data);
      }
      return await db.entities.Product.create(data);
    },
    onSuccess: async () => {
      await clearStoreCachesAndSync(queryClient);
      onClose();
    },
  });

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    const specs = {
      material: form.material,
      weight: form.weight,
      print: form.print,
      fit: form.fit,
      limited: form.limited,
      charity: form.charity,
    };
    const images = form.imagesText.split('\n').map(s => s.trim()).filter(Boolean);
    const payload = {
      title: form.title,
      slug: form.slug || form.title.toLowerCase().replace(/\s+/g, '-'),
      subtitle: form.subtitle,
      price: Number(form.price),
      edition: form.edition,
      inventory: Number(form.inventory),
      description: form.description,
      heroImage: form.heroImage,
      specs_json: JSON.stringify(specs),
      images_json: JSON.stringify(images),
      blogTitle: form.blogTitle,
      blogContent: form.blogContent,
      active: form.active,
    };
    mutation.mutate(payload);
  };

  const inputCls = "w-full bg-transparent border border-[#1a1a1a] text-[#E6E2D3] px-4 py-2.5 font-body text-sm focus:outline-none focus:border-[#C4311E] transition-colors";
  const labelCls = "font-mono text-[10px] tracking-[0.3em] text-[#6B6B6B] uppercase block mb-2";

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-start justify-center overflow-y-auto p-4 md:p-8">
      <div className="bg-[#0F0F0F] border border-[#1a1a1a] w-full max-w-2xl my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1a1a1a] sticky top-0 bg-[#0F0F0F] z-10">
          <h2 className="font-heading text-xl font-bold text-[#E6E2D3]">{isEdit ? 'Edit Product' : 'New Product'}</h2>
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
            <input className={inputCls} value={form.subtitle} onChange={set('subtitle')} placeholder="THE VANGUARD" />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Price ($ USD)</label>
              <input type="number" className={inputCls} value={form.price} onChange={set('price')} required />
            </div>
            <div>
              <label className={labelCls}>Edition</label>
              <input className={inputCls} value={form.edition} onChange={set('edition')} />
            </div>
            <div>
              <label className={labelCls}>Inventory</label>
              <input type="number" className={inputCls} value={form.inventory} onChange={set('inventory')} required />
            </div>
          </div>

          <div>
            <label className={labelCls}>Description</label>
            <textarea className={inputCls} rows={3} value={form.description} onChange={set('description')} />
          </div>

          <div>
            <label className={labelCls}>Hero Image URL</label>
            <input className={inputCls} value={form.heroImage} onChange={set('heroImage')} />
          </div>

          <div>
            <label className={labelCls}>Image URLs (one per line)</label>
            <textarea className={inputCls} rows={3} value={form.imagesText} onChange={set('imagesText')} />
          </div>

          <div className="border-t border-[#1a1a1a] pt-5">
            <p className="font-mono text-[10px] tracking-[0.3em] text-[#C4311E] uppercase mb-4">Specifications</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Material</label>
                <input className={inputCls} value={form.material} onChange={set('material')} />
              </div>
              <div>
                <label className={labelCls}>Weight</label>
                <input className={inputCls} value={form.weight} onChange={set('weight')} />
              </div>
              <div>
                <label className={labelCls}>Print</label>
                <input className={inputCls} value={form.print} onChange={set('print')} />
              </div>
              <div>
                <label className={labelCls}>Fit</label>
                <input className={inputCls} value={form.fit} onChange={set('fit')} />
              </div>
              <div>
                <label className={labelCls}>Limited</label>
                <input className={inputCls} value={form.limited} onChange={set('limited')} />
              </div>
              <div>
                <label className={labelCls}>Charity</label>
                <input className={inputCls} value={form.charity} onChange={set('charity')} />
              </div>
            </div>
          </div>

          <div className="border-t border-[#1a1a1a] pt-5">
            <p className="font-mono text-[10px] tracking-[0.3em] text-[#C4311E] uppercase mb-4">Journal / Blog Content</p>
            <div>
              <label className={labelCls}>Blog Title</label>
              <input className={inputCls} value={form.blogTitle} onChange={set('blogTitle')} />
            </div>
            <div className="mt-4">
              <label className={labelCls}>Blog Content (separate paragraphs with blank lines)</label>
              <textarea className={inputCls} rows={6} value={form.blogContent} onChange={set('blogContent')} />
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.active} onChange={set('active')} className="w-4 h-4 accent-[#C4311E]" />
            <span className="font-mono text-xs tracking-[0.2em] text-[#E6E2D3] uppercase">Active (visible on site)</span>
          </label>

          {mutation.isError && <p className="text-[#C4311E] text-sm font-mono">Error: {mutation.error?.message}</p>}

          <div className="flex gap-3 pt-4">
            <button type="submit" disabled={mutation.isPending} className="flex-1 bg-[#C4311E] hover:bg-[#a02818] disabled:opacity-50 text-[#E6E2D3] px-6 py-3 font-heading font-bold text-sm tracking-[0.2em] uppercase transition-colors">
              {mutation.isPending ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
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