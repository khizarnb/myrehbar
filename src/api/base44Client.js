import { createClient } from '@supabase/supabase-js';
import { products as fallbackProducts } from '@/lib/products';
import { journalArticles as fallbackJournal } from '@/lib/journal';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = (supabaseUrl && supabaseKey)
  ? createClient(supabaseUrl, supabaseKey)
  : null;

let currentAuthSession = null;

if (supabase) {
  supabase.auth.onAuthStateChange((event, session) => {
    currentAuthSession = session;
  });
}

export const db = {
  auth: {
    isAuthenticated: async () => {
      if (!supabase) return false;
      const { data } = await supabase.auth.getSession();
      return !!data?.session;
    },
    me: async () => {
      if (!supabase) return null;
      const { data } = await supabase.auth.getUser();
      if (!data?.user) return null;
      return {
        id: data.user.id,
        email: data.user.email,
        role: 'admin',
        ...data.user.user_metadata
      };
    },
    loginViaEmailPassword: async (email, password) => {
      if (!supabase) throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to Vercel Environment Variables.');
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return data;
    },
    register: async ({ email, password }) => {
      if (!supabase) throw new Error('Supabase is not configured.');
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      return data;
    },
    logout: async (redirectUrl) => {
      if (supabase) {
        await supabase.auth.signOut();
      }
      if (redirectUrl || typeof window !== 'undefined') {
        window.location.href = redirectUrl || '/login';
      }
    },
    loginWithProvider: async (provider, redirectTo = '/') => {
      if (!supabase) throw new Error('Supabase is not configured.');
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin + redirectTo
        }
      });
      if (error) throw error;
      return data;
    },
    resetPasswordRequest: async (email) => {
      if (!supabase) throw new Error('Supabase is not configured.');
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password'
      });
      if (error) throw error;
      return data;
    },
    resetPassword: async ({ newPassword }) => {
      if (!supabase) throw new Error('Supabase is not configured.');
      const { data, error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      return data;
    },
    verifyOtp: async ({ email, otpCode }) => {
      if (!supabase) throw new Error('Supabase is not configured.');
      const { data, error } = await supabase.auth.verifyOtp({ email, token: otpCode, type: 'signup' });
      if (error) throw error;
      return data;
    },
    resendOtp: async (email) => {
      if (!supabase) throw new Error('Supabase is not configured.');
      const { data, error } = await supabase.auth.resend({ type: 'signup', email });
      if (error) throw error;
      return data;
    },
    setToken: () => {},
    redirectToLogin: (redirectTo) => {
      if (typeof window !== 'undefined') {
        window.location.href = '/login' + (redirectTo ? `?redirect=${encodeURIComponent(redirectTo)}` : '');
      }
    }
  },
  entities: {
    Product: {
      list: async () => {
        if (supabase) {
          const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
          if (!error && data && data.length > 0) return data;
        }
        return fallbackProducts;
      },
      filter: async (query) => {
        if (supabase && query?.slug) {
          const { data, error } = await supabase.from('products').select('*').eq('slug', query.slug);
          if (!error && data && data.length > 0) return data;
        }
        if (query?.slug) {
          return fallbackProducts.filter(p => p.slug === query.slug);
        }
        return fallbackProducts;
      },
      get: async (id) => {
        if (supabase) {
          const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
          if (!error && data) return data;
        }
        return fallbackProducts.find(p => p.id === id || p.slug === id) || null;
      },
      create: async (data) => {
        if (!supabase) throw new Error('Supabase is not configured.');
        const { data: created, error } = await supabase.from('products').insert([data]).select().single();
        if (error) throw error;
        return created;
      },
      update: async (id, data) => {
        if (!supabase) throw new Error('Supabase is not configured.');
        const { data: updated, error } = await supabase.from('products').update(data).eq('id', id).select().single();
        if (error) throw error;
        return updated;
      },
      delete: async (id) => {
        if (!supabase) throw new Error('Supabase is not configured.');
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) throw error;
        return { success: true };
      }
    },
    Order: {
      list: async () => {
        if (supabase) {
          const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
          if (!error && data) return data;
        }
        return [];
      },
      create: async (data) => {
        if (supabase) {
          const { data: created, error } = await supabase.from('orders').insert([data]).select().single();
          if (!error && created) return created;
        }
        return { id: 'ord_' + Date.now(), ...data };
      },
      update: async (id, data) => {
        if (!supabase) throw new Error('Supabase is not configured.');
        const { data: updated, error } = await supabase.from('orders').update(data).eq('id', id).select().single();
        if (error) throw error;
        return updated;
      }
    },
    JournalArticle: {
      list: async () => {
        if (supabase) {
          const { data, error } = await supabase.from('journal_articles').select('*').order('created_at', { ascending: false });
          if (!error && data && data.length > 0) return data;
        }
        return fallbackJournal;
      },
      filter: async (query) => {
        if (supabase && query?.slug) {
          const { data, error } = await supabase.from('journal_articles').select('*').eq('slug', query.slug);
          if (!error && data && data.length > 0) return data;
        }
        if (query?.slug) {
          return fallbackJournal.filter(a => a.slug === query.slug);
        }
        return fallbackJournal;
      },
      create: async (data) => {
        if (!supabase) throw new Error('Supabase is not configured.');
        const { data: created, error } = await supabase.from('journal_articles').insert([data]).select().single();
        if (error) throw error;
        return created;
      },
      update: async (id, data) => {
        if (!supabase) throw new Error('Supabase is not configured.');
        const { data: updated, error } = await supabase.from('journal_articles').update(data).eq('id', id).select().single();
        if (error) throw error;
        return updated;
      },
      delete: async (id) => {
        if (!supabase) throw new Error('Supabase is not configured.');
        const { error } = await supabase.from('journal_articles').delete().eq('id', id);
        if (error) throw error;
        return { success: true };
      }
    }
  },
  integrations: {
    Core: {
      UploadFile: async (file) => {
        if (!supabase) throw new Error('Supabase is not configured.');
        const fileExt = file.name ? file.name.split('.').pop() : 'png';
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        const filePath = `uploads/${fileName}`;
        
        const { error: uploadError } = await supabase.storage.from('media').upload(filePath, file);
        if (uploadError) throw uploadError;
        
        const { data } = supabase.storage.from('media').getPublicUrl(filePath);
        return { file_url: data.publicUrl };
      }
    }
  }
};

if (typeof globalThis !== 'undefined') globalThis.__B44_DB__ = db;
if (typeof window !== 'undefined') window.__B44_DB__ = db;

export const base44 = db;
export default db;