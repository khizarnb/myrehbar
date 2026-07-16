const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useQuery } from '@tanstack/react-query';

// Global helper function to invalidate query caches and trigger real-time re-fetch from database
export async function clearStoreCachesAndSync(queryClient, purgeLocal = false) {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('__b44_live_products');
    localStorage.removeItem('__b44_live_journal');
    localStorage.removeItem('__rehbar_local_products__');
    localStorage.removeItem('__rehbar_local_journals__');
  }
  if (queryClient && queryClient.invalidateQueries) {
    await queryClient.invalidateQueries();
  }
  return true;
}

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
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}

export function useProductBySlug(slug) {
  return useQuery({
    queryKey: ['products', slug],
    queryFn: async () => {
      const items = await db.entities.Product.filter({ slug });
      if (!items || !items.length) {
        // Fallback check by id
        const byId = await db.entities.Product.get(slug);
        if (!byId) return null;
        return {
          ...byId,
          specs: typeof byId.specs === 'object' && byId.specs !== null ? byId.specs : (byId.specs_json ? JSON.parse(byId.specs_json) : {}),
          images: Array.isArray(byId.images) ? byId.images : (byId.images_json ? JSON.parse(byId.images_json) : []),
        };
      }
      const p = items[0];
      return {
        ...p,
        specs: typeof p.specs === 'object' && p.specs !== null ? p.specs : (p.specs_json ? JSON.parse(p.specs_json) : {}),
        images: Array.isArray(p.images) ? p.images : (p.images_json ? JSON.parse(p.images_json) : []),
      };
    },
    enabled: !!slug,
    staleTime: 0,
    refetchOnMount: true,
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
    staleTime: 0,
    refetchOnMount: true,
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
    staleTime: 0,
    refetchOnMount: true,
  });
}

export function useOrders() {
  return useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      return await db.entities.Order.list('-created_date');
    },
    staleTime: 0,
    refetchOnMount: true,
  });
}

export function useCustomers() {
  return useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      if (db.entities.Customer && db.entities.Customer.list) {
        return await db.entities.Customer.list();
      }
      return [];
    },
    staleTime: 0,
    refetchOnMount: true,
  });
}