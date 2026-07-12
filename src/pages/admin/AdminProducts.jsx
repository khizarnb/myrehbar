const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from "react";
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useProducts } from "@/lib/entityData";
import { Plus, Pencil, Trash2, Package } from "lucide-react";
import ProductForm from "@/components/admin/ProductForm";

export default function AdminProducts() {
  const queryClient = useQueryClient();
  const { data: products, isLoading } = useProducts();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const deleteMutation = useMutation({
    mutationFn: (id) => db.entities.Product.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });

  const inventoryMutation = useMutation({
    mutationFn: ({ id, inventory }) => db.entities.Product.update(id, { inventory }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });

  const handleDelete = (p) => {
    if (confirm(`Delete "${p.title}"? This cannot be undone.`)) {
      deleteMutation.mutate(p.id);
    }
  };

  const handleInventoryChange = (p, value) => {
    const num = Number(value);
    if (!isNaN(num) && num !== p.inventory) {
      inventoryMutation.mutate({ id: p.id, inventory: num });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="font-heading text-3xl font-black tracking-[0.1em] text-[#E6E2D3] mb-2">Products</h1>
          <p className="font-mono text-xs tracking-[0.2em] text-[#6B6B6B] uppercase">Manage inventory & designs</p>
        </div>
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="flex items-center gap-2 bg-[#C4311E] hover:bg-[#a02818] text-[#E6E2D3] px-6 py-3 font-heading font-bold text-sm tracking-[0.2em] uppercase transition-colors">
          <Plus size={16} />
          New Product
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-[#333] border-t-[#C4311E] rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1a1a1a]">
                <th className="text-left px-6 py-4 font-mono text-[10px] tracking-[0.3em] text-[#6B6B6B] uppercase">Product</th>
                <th className="text-left px-6 py-4 font-mono text-[10px] tracking-[0.3em] text-[#6B6B6B] uppercase">Price</th>
                <th className="text-left px-6 py-4 font-mono text-[10px] tracking-[0.3em] text-[#6B6B6B] uppercase">Inventory</th>
                <th className="text-left px-6 py-4 font-mono text-[10px] tracking-[0.3em] text-[#6B6B6B] uppercase">Status</th>
                <th className="text-right px-6 py-4 font-mono text-[10px] tracking-[0.3em] text-[#6B6B6B] uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(products || []).map(p => (
                <tr key={p.id} className="border-b border-[#1a1a1a] hover:bg-[#111]">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      {p.heroImage && <img src={p.heroImage} alt={p.title} className="w-12 h-12 object-cover" />}
                      <div>
                        <p className="font-heading text-sm font-bold text-[#E6E2D3]">{p.title}</p>
                        <p className="font-mono text-xs text-[#6B6B6B]">{p.subtitle}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-sm text-[#E6E2D3]">CA${p.price}</td>
                  <td className="px-6 py-4">
                    <input
                      type="number"
                      defaultValue={p.inventory}
                      onBlur={(e) => handleInventoryChange(p, e.target.value)}
                      className={`w-20 bg-transparent border border-[#1a1a1a] text-center px-2 py-1 font-mono text-sm focus:outline-none focus:border-[#C4311E] transition-colors ${(p.inventory || 0) < 20 ? 'text-[#C4311E]' : 'text-[#E6E2D3]'}`}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <span className={`font-mono text-xs tracking-[0.2em] uppercase ${p.active ? 'text-[#E6E2D3]' : 'text-[#6B6B6B]'}`}>
                      {p.active ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-3">
                      <button onClick={() => { setEditing(p); setShowForm(true); }} className="text-[#6B6B6B] hover:text-[#E6E2D3] transition-colors">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => handleDelete(p)} className="text-[#6B6B6B] hover:text-[#C4311E] transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!products || products.length === 0) && (
            <div className="text-center py-20">
              <Package className="mx-auto mb-4 text-[#333]" size={32} />
              <p className="font-body text-[#6B6B6B]">No products yet. Create your first one.</p>
            </div>
          )}
        </div>
      )}

      {showForm && (
        <ProductForm product={editing} onClose={() => setShowForm(false)} />
      )}
    </div>
  );
}