const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useQuery } from '@tanstack/react-query';
import { products as fallbackProducts } from '@/lib/products';
import { journalArticles as fallbackJournal } from '@/lib/journal';

const getInitialProducts = () => {
  if (typeof window !== 'undefined') {
    const local = localStorage.getItem('__rehbar_local_products__');
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
  }
  return fallbackProducts;
};

const getInitialJournal = () => {
  if (typeof window !== 'undefined') {
    const local = localStorage.getItem('__rehbar_local_journals__');
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
  }
  return fallbackJournal;
};

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
    placeholderData: () => getInitialProducts().map(p => ({
      ...p,
      specs: typeof p.specs === 'object' && p.specs !== null ? p.specs : (p.specs_json ? JSON.parse(p.specs_json) : {}),
      images: Array.isArray(p.images) ? p.images : (p.images_json ? JSON.parse(p.images_json) : []),
    })),
    staleTime: 1000 * 60 * 5, // 5 minutes
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
    placeholderData: () => {
      if (!slug) return undefined;
      const list = getInitialProducts();
      const p = list.find(item => item.slug === slug || item.id === slug);
      if (!p) return undefined;
      return {
        ...p,
        specs: typeof p.specs === 'object' && p.specs !== null ? p.specs : (p.specs_json ? JSON.parse(p.specs_json) : {}),
        images: Array.isArray(p.images) ? p.images : (p.images_json ? JSON.parse(p.images_json) : []),
      };
    },
    enabled: !!slug,
    staleTime: 1000 * 60 * 5,
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
    placeholderData: () => getInitialJournal().map(a => ({
      ...a,
      blocks: Array.isArray(a.blocks) ? a.blocks : (a.blocks_json ? JSON.parse(a.blocks_json) : []),
    })),
    staleTime: 1000 * 60 * 5,
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
    placeholderData: () => {
      if (!slug) return undefined;
      const list = getInitialJournal();
      const a = list.find(item => item.slug === slug || item.id === slug);
      if (!a) return undefined;
      return {
        ...a,
        blocks: Array.isArray(a.blocks) ? a.blocks : (a.blocks_json ? JSON.parse(a.blocks_json) : []),
      };
    },
    enabled: !!slug,
    staleTime: 1000 * 60 * 5,
  });
}

export function useOrders() {
  return useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      return await db.entities.Order.list('-created_date');
    },
    staleTime: 1000 * 30,
  });
}