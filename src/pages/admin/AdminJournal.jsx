import { db } from '@/api/rehbarClient';

import React, { useState } from "react";
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useJournalArticles } from "@/lib/entityData";
import { Plus, Pencil, Trash2, FileText } from "lucide-react";
import JournalForm from "@/components/admin/JournalForm";

export default function AdminJournal() {
  const queryClient = useQueryClient();
  const { data: articles, isLoading } = useJournalArticles();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const deleteMutation = useMutation({
    mutationFn: (id) => db.entities.JournalArticle.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['journalArticles'] }),
  });

  const handleDelete = (a) => {
    if (confirm(`Delete "${a.title}"? This cannot be undone.`)) {
      deleteMutation.mutate(a.id);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="font-heading text-3xl font-black tracking-[0.1em] text-[#E6E2D3] mb-2">Journal</h1>
          <p className="font-mono text-xs tracking-[0.2em] text-[#6B6B6B] uppercase">Brand stories & articles</p>
        </div>
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="flex items-center gap-2 bg-[#C4311E] hover:bg-[#a02818] text-[#E6E2D3] px-6 py-3 font-heading font-bold text-sm tracking-[0.2em] uppercase transition-colors">
          <Plus size={16} />
          New Article
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
                <th className="text-left px-6 py-4 font-mono text-[10px] tracking-[0.3em] text-[#6B6B6B] uppercase">Article</th>
                <th className="text-left px-6 py-4 font-mono text-[10px] tracking-[0.3em] text-[#6B6B6B] uppercase">Date</th>
                <th className="text-right px-6 py-4 font-mono text-[10px] tracking-[0.3em] text-[#6B6B6B] uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(articles || []).map(a => (
                <tr key={a.id} className="border-b border-[#1a1a1a] hover:bg-[#111]">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      {a.image && <img src={a.image} alt={a.title} className="w-12 h-12 object-cover" />}
                      <div>
                        <p className="font-heading text-sm font-bold text-[#E6E2D3]">{a.title}</p>
                        <p className="font-mono text-xs text-[#6B6B6B]">{a.subtitle}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-sm text-[#E6E2D3]/70">{a.date}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-3">
                      <button onClick={() => { setEditing(a); setShowForm(true); }} className="text-[#6B6B6B] hover:text-[#E6E2D3] transition-colors">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => handleDelete(a)} className="text-[#6B6B6B] hover:text-[#C4311E] transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!articles || articles.length === 0) && (
            <div className="text-center py-20">
              <FileText className="mx-auto mb-4 text-[#333]" size={32} />
              <p className="font-body text-[#6B6B6B]">No articles yet. Create your first one.</p>
            </div>
          )}
        </div>
      )}

      {showForm && (
        <JournalForm article={editing} onClose={() => setShowForm(false)} />
      )}
    </div>
  );
}