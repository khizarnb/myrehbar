const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useQuery } from '@tanstack/react-query';

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const items = await db.entities.Product.list();
      return items.map(p => ({
        ...p,
        specs: typeof p.specs === 'object' && p.specs !== null ? p.specs : (p.specs_json ? JSON.parse(p.specs_json) : {}),
        images: Array.isArray(p.images) ? p.images : (p.images_json ? JSON.parse(p.images_json) : []),
      }));
    },
  });
}

export function useProductBySlug(slug) {
  return useQuery({
    queryKey: ['products', slug],
    queryFn: async () => {
      const items = await db.entities.Product.filter({ slug });
      if (!items.length) return null;
      const p = items[0];
      return {
        ...p,
        specs: typeof p.specs === 'object' && p.specs !== null ? p.specs : (p.specs_json ? JSON.parse(p.specs_json) : {}),
        images: Array.isArray(p.images) ? p.images : (p.images_json ? JSON.parse(p.images_json) : []),
      };
    },
    enabled: !!slug,
  });
}

export function useJournalArticles() {
  return useQuery({
    queryKey: ['journalArticles'],
    queryFn: async () => {
      const items = await db.entities.JournalArticle.list();
      return items.map(a => ({
        ...a,
        blocks: Array.isArray(a.blocks) ? a.blocks : (a.blocks_json ? JSON.parse(a.blocks_json) : []),
      }));
    },
  });
}

export function useJournalArticleBySlug(slug) {
  return useQuery({
    queryKey: ['journalArticles', slug],
    queryFn: async () => {
      const items = await db.entities.JournalArticle.filter({ slug });
      if (!items.length) return null;
      const a = items[0];
      return {
        ...a,
        blocks: Array.isArray(a.blocks) ? a.blocks : (a.blocks_json ? JSON.parse(a.blocks_json) : []),
      };
    },
    enabled: !!slug,
  });
}

export function useOrders() {
  return useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      return await db.entities.Order.list('-created_date');
    },
  });
}