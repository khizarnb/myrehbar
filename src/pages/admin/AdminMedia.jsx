import { db } from '@/api/rehbarClient';

import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clearStoreCachesAndSync } from "@/lib/entityData";
import { Image, Upload, Copy, Check, Trash2, ExternalLink } from "lucide-react";

export default function AdminMedia() {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(null);
  const [customUrl, setCustomUrl] = useState("");

  const { data: settingRecord, isLoading } = useQuery({
    queryKey: ['media_library_setting'],
    queryFn: async () => await db.entities.SiteSetting.get('media_library'),
    staleTime: 0
  });

  const mediaList = useMemo(() => {
    if (!settingRecord || !settingRecord.value) return [
      { id: "img_1", url: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800", name: "Hoodie Hero V1", created_at: new Date().toISOString() },
      { id: "img_2", url: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800", name: "Street Drop Back", created_at: new Date().toISOString() }
    ];
    try { return typeof settingRecord.value === 'string' ? JSON.parse(settingRecord.value) : settingRecord.value; } catch { return []; }
  }, [settingRecord]);

  const saveMutation = useMutation({
    mutationFn: async (newList) => await db.entities.SiteSetting.update('media_library', JSON.stringify(newList)),
    onSuccess: async () => {
      await clearStoreCachesAndSync(queryClient, true);
      await queryClient.invalidateQueries({ queryKey: ['media_library_setting'] });
    }
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await db.integrations.Core.UploadFile(file);
      if (res && res.file_url) {
        const item = { id: "media_" + Date.now(), url: res.file_url, name: file.name, created_at: new Date().toISOString() };
        saveMutation.mutate([item, ...mediaList]);
      } else {
        alert("Upload did not return URL.");
      }
    } catch (err) {
      alert(`Upload error: ${err.message}`);
    } finally {
      setUploading(false);
      if (e.target) e.target.value = "";
    }
  };

  const handleAddCustomUrl = (e) => {
    e.preventDefault();
    if (!customUrl.trim()) return;
    const item = { id: "media_" + Date.now(), url: customUrl.trim(), name: "External Image URL", created_at: new Date().toISOString() };
    saveMutation.mutate([item, ...mediaList]);
    setCustomUrl("");
  };

  const handleCopy = (url) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const handleDelete = (id) => {
    if (confirm("Delete this media asset from library?")) {
      saveMutation.mutate(mediaList.filter(m => m.id !== id));
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1a1a1a] pb-6">
        <div>
          <h1 className="font-heading text-3xl font-black text-white tracking-wide flex items-center gap-3">
            <Image className="text-[#C4311E]" size={28} />
            Media & Asset Library
          </h1>
          <p className="font-body text-xs text-[#888] mt-1">Upload and manage product photos and blog banners backed by Supabase Storage</p>
        </div>
        <label className="bg-[#C4311E] hover:bg-[#a02818] text-white px-5 py-2.5 rounded-lg font-mono text-xs uppercase font-bold tracking-wider flex items-center gap-2 cursor-pointer transition-colors shadow-lg shadow-[#C4311E]/20">
          <Upload size={16} /> {uploading ? "Uploading..." : "Upload File"}
          <input type="file" accept="image/*" onChange={handleFileUpload} disabled={uploading} className="hidden" />
        </label>
      </div>

      <div className="bg-[#101010] p-4 rounded-xl border border-[#1e1e1e] flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleAddCustomUrl} className="flex-1 flex gap-2">
          <input
            type="url"
            placeholder="Or add external Image URL (e.g. Unsplash or CDN)..."
            value={customUrl}
            onChange={e => setCustomUrl(e.target.value)}
            className="flex-1 bg-[#141414] border border-[#222] rounded-lg px-4 py-2 text-xs text-white placeholder-[#6B6B6B] focus:outline-none focus:border-[#C4311E]"
          />
          <button type="submit" className="bg-[#1e1e1e] hover:bg-[#262626] text-white px-4 py-2 rounded-lg font-mono text-xs uppercase font-bold transition-colors">
            Add URL
          </button>
        </form>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {mediaList.map((item, idx) => (
          <div key={item.id || idx} className="group bg-[#101010] border border-[#1e1e1e] rounded-xl overflow-hidden flex flex-col justify-between hover:border-[#333] transition-all">
            <div className="relative aspect-square bg-[#141414] overflow-hidden">
              <img src={item.url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt={item.name || ""} />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button onClick={() => handleCopy(item.url)} className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors" title="Copy URL">
                  {copiedUrl === item.url ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                </button>
                <a href={item.url} target="_blank" rel="noreferrer" className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors" title="Open Image">
                  <ExternalLink size={16} />
                </a>
                <button onClick={() => handleDelete(item.id)} className="p-2 bg-rose-500/20 hover:bg-rose-500/40 rounded-full text-rose-400 transition-colors" title="Delete">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <div className="p-3 border-t border-[#1a1a1a]">
              <p className="font-heading text-xs text-white font-bold truncate">{item.name || "Image Asset"}</p>
              <button
                onClick={() => handleCopy(item.url)}
                className="w-full mt-2 py-1 bg-[#141414] hover:bg-[#1c1c1c] border border-[#222] rounded text-[10px] font-mono text-[#888] hover:text-white uppercase tracking-wider transition-colors flex items-center justify-center gap-1"
              >
                {copiedUrl === item.url ? <span className="text-emerald-400 flex items-center gap-1"><Check size={10}/> Copied!</span> : "Copy URL"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
