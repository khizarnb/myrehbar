import { createClient } from '@supabase/supabase-js';
import { products as initialSeedProducts } from '@/lib/products';
import { journalArticles as fallbackJournal } from '@/lib/journal';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ztaisbdcndxtgjfjswkg.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_w9LzlsQRfrKglfvxIPVtYQ_Ng-bfAV0';

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
      if (typeof window !== 'undefined' && localStorage.getItem('__rehbar_admin_logged_in__') === 'true') {
        return true;
      }
      if (!supabase) return false;
      const { data } = await supabase.auth.getSession();
      return !!data?.session;
    },
    me: async () => {
      if (typeof window !== 'undefined' && localStorage.getItem('__rehbar_admin_logged_in__') === 'true') {
        return {
          id: 'admin_master',
          email: localStorage.getItem('__rehbar_admin_email__') || 'admin@myrehbar.com',
          role: 'admin',
          full_name: 'Master Admin'
        };
      }
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
      const cleanEmail = (email || '').trim().toLowerCase();
      const inputPass = password || '';
      
      // Encrypted Base64 check ('LVMucXREcjIteUAycGtm' is base64 of '-S.qtDr2-y@2pkf') or direct exact check
      const isEncryptedMasterPass = (typeof window !== 'undefined' && typeof btoa === 'function' && btoa(inputPass) === 'LVMucXREcjIteUAycGtm') || inputPass === '-S.qtDr2-y@2pkf';
      const isAuthorizedEmail = cleanEmail === 'admin@myrehbar.com' || cleanEmail === 'admin' || cleanEmail === 'khizarnb@gmail.com' || cleanEmail.includes('rehbar');

      if (isEncryptedMasterPass && isAuthorizedEmail) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('__rehbar_admin_logged_in__', 'true');
          localStorage.setItem('__rehbar_admin_email__', cleanEmail || 'admin@myrehbar.com');
        }
        return { user: { id: 'admin_master', email: cleanEmail || 'admin@myrehbar.com', role: 'admin' } };
      }

      if (!supabase) {
        throw new Error('Invalid email or encrypted password credentials.');
      }

      const { data, error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password: inputPass });
      if (error || !data?.user) {
        throw new Error(error?.message || 'Invalid email or encrypted password credentials.');
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('__rehbar_admin_logged_in__', 'true');
        localStorage.setItem('__rehbar_admin_email__', cleanEmail);
      }
      return data;
    },
    register: async ({ email, password }) => {
      if (!supabase) throw new Error('Supabase is not configured.');
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      return data;
    },
    logout: async (redirectUrl = '/login') => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('__rehbar_admin_logged_in__');
        localStorage.removeItem('__rehbar_admin_email__');
      }
      if (supabase) {
        try { await supabase.auth.signOut(); } catch {}
      }
      if (typeof window !== 'undefined') {
        window.location.href = redirectUrl || '/login';
      }
    },
    redirectToLogin: (redirectUrl) => {
      if (typeof window !== 'undefined') {
        window.location.href = '/login' + (redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : '');
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
          try {
            const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: true });
            if (!error && data && data.length > 0) {
              const mapped = data.map(p => ({
                ...p,
                title: p.title || p.name || 'Untitled Product',
                name: p.name || p.title || 'Untitled Product',
                inventory: p.inventory !== undefined && p.inventory !== null ? p.inventory : (p.stock !== undefined && p.stock !== null ? p.stock : 100),
                stock: p.stock !== undefined && p.stock !== null ? p.stock : (p.inventory !== undefined && p.inventory !== null ? p.inventory : 100),
                price: Number(p.price || 0),
                compare_at_price: Number(p.compare_at_price || 0),
                heroImage: p.heroImage || p.image || (Array.isArray(p.images) ? p.images[0] : ''),
                image: p.image || p.heroImage || (Array.isArray(p.images) ? p.images[0] : ''),
                gallery: Array.isArray(p.gallery) && p.gallery.length ? p.gallery : (Array.isArray(p.images) ? p.images : []),
                images: Array.isArray(p.images) && p.images.length ? p.images : (Array.isArray(p.gallery) ? p.gallery : []),
                category: p.category || 'Apparel',
                status: p.status || (p.active ? 'active' : 'draft'),
                active: p.active !== undefined ? p.active : (p.status !== 'draft')
              }));
              try { localStorage.setItem('__b44_live_products', JSON.stringify(mapped)); } catch {}
              return mapped;
            }
          } catch (err) {
            console.error('[Supabase Product List Error]', err);
          }
        }
        try {
          const cached = localStorage.getItem('__b44_live_products');
          if (cached) return JSON.parse(cached);
        } catch {}
        return initialSeedProducts;
      },
      filter: async (query) => {
        let list = await db.entities.Product.list();
        if (query?.slug) {
          return list.filter(p => p.slug === query.slug || p.id === query.slug);
        }
        return list;
      },
      get: async (id) => {
        let list = await db.entities.Product.list();
        return list.find(p => String(p.id) === String(id) || String(p.slug) === String(id)) || null;
      },
      create: async (data) => {
        const payload = {
          id: 'prod_' + Date.now(),
          ...data,
          title: data.title || data.name || 'New Product',
          name: data.name || data.title || 'New Product',
          slug: data.slug || (data.title || 'product').toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(Math.random() * 1000)
        };
        if (payload.specs_json) {
          try { payload.specs = JSON.parse(payload.specs_json); } catch {}
          delete payload.specs_json;
        }
        if (payload.images_json) {
          try { payload.images = JSON.parse(payload.images_json); if (!payload.gallery) payload.gallery = payload.images; } catch {}
          delete payload.images_json;
        }
        if (payload.inventory !== undefined) payload.stock = payload.inventory;
        else if (payload.stock !== undefined) payload.inventory = payload.stock;

        if (supabase) {
          try {
            const { data: created, error } = await supabase.from('products').insert([payload]).select().single();
            if (!error && created) {
              try {
                const cur = JSON.parse(localStorage.getItem('__b44_live_products') || '[]');
                localStorage.setItem('__b44_live_products', JSON.stringify([...cur, created]));
              } catch {}
              return created;
            }
          } catch (err) {
            console.warn('[Supabase Product Create Error caught, applying locally]:', err);
          }
        }
        try {
          const cur = JSON.parse(localStorage.getItem('__b44_live_products') || JSON.stringify(initialSeedProducts));
          const updatedList = [...cur, payload];
          localStorage.setItem('__b44_live_products', JSON.stringify(updatedList));
        } catch {}
        return payload;
      },
      update: async (id, data) => {
        const payload = { ...data };
        if (payload.specs_json) {
          try { payload.specs = JSON.parse(payload.specs_json); } catch {}
          delete payload.specs_json;
        }
        if (payload.images_json) {
          try { payload.images = JSON.parse(payload.images_json); if (!payload.gallery) payload.gallery = payload.images; } catch {}
          delete payload.images_json;
        }
        if (payload.inventory !== undefined) payload.stock = payload.inventory;
        else if (payload.stock !== undefined) payload.inventory = payload.stock;

        if (supabase) {
          try {
            let { data: updated, error } = await supabase.from('products').update(payload).eq('id', id).select().single();
            if (error || !updated) {
              const res2 = await supabase.from('products').update(payload).eq('slug', id).select().single();
              updated = res2.data;
              error = res2.error;
            }
            if (!updated) {
              const upsertPayload = { id: String(id), ...payload };
              if (!upsertPayload.slug) upsertPayload.slug = (upsertPayload.title || 'product').toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(Math.random()*1000);
              const res3 = await supabase.from('products').upsert([upsertPayload]).select().single();
              updated = res3.data || upsertPayload;
            }
            if (updated) {
              try {
                const cur = JSON.parse(localStorage.getItem('__b44_live_products') || '[]');
                const idx = cur.findIndex(p => String(p.id) === String(id) || String(p.slug) === String(id));
                if (idx >= 0) cur[idx] = { ...cur[idx], ...updated };
                else cur.push(updated);
                localStorage.setItem('__b44_live_products', JSON.stringify(cur));
              } catch {}
              return updated;
            }
          } catch (err) {
            console.warn('[Supabase Product Update Error caught, applying locally]:', err);
          }
        }
        try {
          const cur = JSON.parse(localStorage.getItem('__b44_live_products') || JSON.stringify(initialSeedProducts));
          const idx = cur.findIndex(p => String(p.id) === String(id) || String(p.slug) === String(id));
          const updatedItem = idx >= 0 ? { ...cur[idx], ...payload } : { id: String(id), ...payload };
          if (idx >= 0) cur[idx] = updatedItem;
          else cur.push(updatedItem);
          localStorage.setItem('__b44_live_products', JSON.stringify(cur));
          return updatedItem;
        } catch {}
        return { id: String(id), ...payload };
      },
      delete: async (id) => {
        if (supabase) {
          try {
            await supabase.from('products').delete().eq('id', id);
            await supabase.from('products').delete().eq('slug', id);
          } catch {}
        }
        try {
          const cur = JSON.parse(localStorage.getItem('__b44_live_products') || '[]');
          const filtered = cur.filter(p => String(p.id) !== String(id) && String(p.slug) !== String(id));
          localStorage.setItem('__b44_live_products', JSON.stringify(filtered));
        } catch {}
        return { success: true };
      },
    },
    Order: {
      list: async () => {
        if (supabase) {
          const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
          if (!error && data) {
            return data;
          }
          if (error) {
            console.error('[Supabase Order List Error]', error);
          }
          return [];
        }
        return [];
      },
      create: async (data) => {
        if (supabase) {
          const { data: created, error } = await supabase.from('orders').insert([data]).select().single();
          if (!error && created) return created;
          if (error) throw new Error(`Order database insert failed: ${error.message}`);
        }
        throw new Error('Supabase database not connected.');
      },
      update: async (id, data) => {
        if (supabase) {
          let { data: updated, error } = await supabase.from('orders').update(data).eq('id', id).select().single();
          if (error || !updated) {
            const res2 = await supabase.from('orders').update(data).eq('order_number', id).select().single();
            updated = res2.data;
            error = res2.error;
          }
          if (!error && updated) return updated;
          throw new Error(`Order database update failed: ${error?.message || "Order ID/Number not matched in Supabase orders table"}`);
        }
        throw new Error('Supabase database not connected.');
      },
      delete: async (id) => {
        if (supabase) {
          const res1 = await supabase.from('orders').delete().eq('id', id);
          if (res1.error) {
            const res2 = await supabase.from('orders').delete().eq('order_number', id);
            if (res2.error) throw new Error(`Order database delete failed: ${res2.error.message}`);
          } else {
            // Also attempt deleting by order_number in case id passed was order_number
            await supabase.from('orders').delete().eq('order_number', id);
          }
          return { success: true };
        }
        throw new Error('Supabase database not connected.');
      }
    },
    Customer: {
      list: async () => {
        const customersMap = new Map();
        if (supabase) {
          const { data: dbCustomers } = await supabase.from('customers').select('*');
          if (dbCustomers && Array.isArray(dbCustomers)) {
            dbCustomers.forEach(c => {
              if (c.email) customersMap.set(c.email.toLowerCase().trim(), c);
            });
          }
        }
        const orders = await db.entities.Order.list();
        orders.forEach(o => {
          const email = (o.customer_email || 'unknown@example.com').toLowerCase().trim();
          if (!customersMap.has(email)) {
            customersMap.set(email, {
              id: 'cust_' + Math.abs(email.split('').reduce((a, b) => (((a << 5) - a) + b.charCodeAt(0)) | 0, 0)),
              name: o.customer_name || 'Valued Customer',
              email: email,
              phone: o.customer_phone || 'Not Provided',
              city: o.shipping_city || 'Global',
              country: o.shipping_country || 'International',
              total_orders: 1,
              total_spent: Number(o.total || 0),
              last_order_date: o.created_date || o.created_at || new Date().toISOString(),
              registered_at: o.created_date || o.created_at || new Date().toISOString(),
              status: 'active',
              role: 'customer'
            });
          } else {
            const cust = customersMap.get(email);
            cust.total_orders = (cust.total_orders || 0) + 1;
            cust.total_spent = Number(cust.total_spent || 0) + Number(o.total || 0);
            if (!cust.last_order_date || new Date(o.created_date || o.created_at) > new Date(cust.last_order_date)) {
              cust.last_order_date = o.created_date || o.created_at;
            }
          }
        });

        customersMap.set('admin@myrehbar.com', {
          id: 'cust_super_admin',
          name: 'Master Admin (Super Admin)',
          email: 'admin@myrehbar.com',
          phone: '+1 800 REHBAR',
          city: 'Toronto',
          country: 'Canada',
          total_orders: 0,
          total_spent: 0,
          last_order_date: new Date().toISOString(),
          registered_at: new Date(Date.now() - 3600000 * 24 * 60).toISOString(),
          status: 'active',
          role: 'super_admin'
        });

        return Array.from(customersMap.values()).sort((a, b) => (b.total_spent || 0) - (a.total_spent || 0));
      },
      create: async (data) => {
        if (supabase) {
          const { data: created, error } = await supabase.from('customers').insert([data]).select().single();
          if (!error && created) return created;
        }
        return { id: 'cust_' + Date.now(), ...data };
      },
      update: async (id, data) => {
        if (supabase) {
          let { data: updated, error } = await supabase.from('customers').update(data).eq('id', id).select().single();
          if (error || !updated) {
            const res2 = await supabase.from('customers').update(data).eq('email', id).select().single();
            updated = res2.data;
          }
          if (updated) return updated;
        }
        return { id, ...data };
      },
      delete: async (id) => {
        if (supabase) {
          await supabase.from('customers').delete().eq('id', id);
          await supabase.from('customers').delete().eq('email', id);
        }
        return { success: true };
      }
    },
    JournalArticle: {
      list: async () => {
        if (supabase) {
          try {
            const { data, error } = await supabase.from('journal_articles').select('*').order('created_at', { ascending: false });
            if (!error && data && data.length > 0) {
              try { localStorage.setItem('__b44_live_journal', JSON.stringify(data)); } catch {}
              return data;
            }
          } catch (err) {
            console.error('[Supabase Journal List Error]', err);
          }
        }
        try {
          const cached = localStorage.getItem('__b44_live_journal');
          if (cached) return JSON.parse(cached);
        } catch {}
        return fallbackJournal;
      },
      filter: async (query) => {
        const all = await db.entities.JournalArticle.list();
        if (query?.slug) {
          return all.filter(a => String(a.slug) === String(query.slug) || String(a.id) === String(query.slug));
        }
        return all;
      },
      create: async (data) => {
        const payload = { ...data };
        if (!payload.id) payload.id = 'art_' + Date.now();
        if (!payload.slug) payload.slug = (payload.title || 'article').toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(Math.random()*1000);
        if (payload.blocks_json) {
          try { payload.blocks = JSON.parse(payload.blocks_json); } catch {}
          delete payload.blocks_json;
        }
        if (supabase) {
          try {
            const { data: created, error } = await supabase.from('journal_articles').insert([payload]).select().single();
            if (!error && created) {
              try {
                const cur = JSON.parse(localStorage.getItem('__b44_live_journal') || '[]');
                localStorage.setItem('__b44_live_journal', JSON.stringify([created, ...cur]));
              } catch {}
              return created;
            }
          } catch (err) {
            console.warn('[Supabase Create Fallback]', err);
          }
        }
        try {
          const cur = JSON.parse(localStorage.getItem('__b44_live_journal') || JSON.stringify(fallbackJournal));
          const updatedList = [payload, ...cur];
          localStorage.setItem('__b44_live_journal', JSON.stringify(updatedList));
        } catch {}
        return payload;
      },
      update: async (id, data) => {
        const payload = { ...data };
        if (payload.blocks_json) {
          try { payload.blocks = JSON.parse(payload.blocks_json); } catch {}
          delete payload.blocks_json;
        }
        if (supabase) {
          try {
            let { data: updated, error } = await supabase.from('journal_articles').update(payload).eq('id', id).select().single();
            if (error || !updated) {
              const res2 = await supabase.from('journal_articles').update(payload).eq('slug', id).select().single();
              updated = res2.data;
              error = res2.error;
            }
            if (!updated) {
              // If not found in supabase yet (e.g. edited from fallback or new slug), upsert it directly
              const upsertPayload = { id: String(id), ...payload };
              if (!upsertPayload.slug) upsertPayload.slug = (upsertPayload.title || 'article').toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(Math.random()*1000);
              const res3 = await supabase.from('journal_articles').upsert([upsertPayload]).select().single();
              updated = res3.data || upsertPayload;
            }
            if (updated) {
              try {
                const cur = JSON.parse(localStorage.getItem('__b44_live_journal') || '[]');
                const idx = cur.findIndex(a => String(a.id) === String(id) || String(a.slug) === String(id));
                if (idx >= 0) cur[idx] = { ...cur[idx], ...updated };
                else cur.unshift(updated);
                localStorage.setItem('__b44_live_journal', JSON.stringify(cur));
              } catch {}
              return updated;
            }
          } catch (err) {
            console.warn('[Supabase Journal Update Error caught, applying locally]:', err);
          }
        }
        try {
          const cur = JSON.parse(localStorage.getItem('__b44_live_journal') || JSON.stringify(fallbackJournal));
          const idx = cur.findIndex(a => String(a.id) === String(id) || String(a.slug) === String(id));
          const updatedItem = idx >= 0 ? { ...cur[idx], ...payload } : { id: String(id), ...payload };
          if (idx >= 0) cur[idx] = updatedItem;
          else cur.unshift(updatedItem);
          localStorage.setItem('__b44_live_journal', JSON.stringify(cur));
          return updatedItem;
        } catch {}
        return { id: String(id), ...payload };
      },
      delete: async (id) => {
        if (supabase) {
          try {
            await supabase.from('journal_articles').delete().eq('id', id);
            await supabase.from('journal_articles').delete().eq('slug', id);
          } catch {}
        }
        try {
          const cur = JSON.parse(localStorage.getItem('__b44_live_journal') || '[]');
          const filtered = cur.filter(a => String(a.id) !== String(id) && String(a.slug) !== String(id));
          localStorage.setItem('__b44_live_journal', JSON.stringify(filtered));
        } catch {}
        return { success: true };
      }
    },
    ContactMessage: {
      list: async () => {
        if (supabase) {
          const { data, error } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false });
          if (!error && data) return data;
        }
        return [];
      },
      create: async (data) => {
        if (supabase) {
          const { data: created, error } = await supabase.from('contact_messages').insert([data]).select().single();
          if (!error && created) return created;
        }
        return { id: 'msg_' + Date.now(), read: false, ...data };
      },
      update: async (id, data) => {
        if (supabase) {
          const { data: updated, error } = await supabase.from('contact_messages').update(data).eq('id', id).select().single();
          if (!error && updated) return updated;
        }
        return { id, ...data };
      },
      delete: async (id) => {
        if (supabase) {
          await supabase.from('contact_messages').delete().eq('id', id);
        }
        return { success: true };
      }
    },
    SiteSetting: {
      list: async () => {
        if (supabase) {
          const { data, error } = await supabase.from('site_settings').select('*');
          if (!error && data) return data;
        }
        return [];
      },
      get: async (key) => {
        if (supabase) {
          const { data, error } = await supabase.from('site_settings').select('*').eq('key', key).single();
          if (!error && data) return data;
        }
        return null;
      },
      update: async (key, value) => {
        if (supabase) {
          const { data, error } = await supabase
            .from('site_settings')
            .upsert([{ key, value, updated_at: new Date().toISOString() }], { onConflict: 'key' })
            .select()
            .single();
          if (!error && data) return data;
          if (error) throw new Error(`Settings update failed in Supabase: ${error.message}`);
        }
        throw new Error('Supabase database not connected.');
      }
    },
  },
  integrations: {
    Core: {
      UploadFile: async (file) => {
        if (supabase) {
          try {
            const fileExt = file.name ? file.name.split('.').pop() : 'png';
            const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
            const filePath = `uploads/${fileName}`;
            
            const { error: uploadError } = await supabase.storage.from('media').upload(filePath, file);
            if (!uploadError) {
              const { data } = supabase.storage.from('media').getPublicUrl(filePath);
              if (data?.publicUrl) return { file_url: data.publicUrl };
            }
          } catch (e) {
            console.warn('Supabase upload failed, falling back to local URL:', e);
          }
        }
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve({ file_url: reader.result });
          reader.onerror = () => resolve({ file_url: typeof URL !== 'undefined' ? URL.createObjectURL(file) : '' });
          reader.readAsDataURL(file);
        });
      },
      SendEmail: async ({ to = 'sales@myrehbar.com', subject, body, orderData }) => {
        const targetEmail = to || 'sales@myrehbar.com';
        console.log(`[Rehbar Email System] Dispatching notification to ${targetEmail}: "${subject}"`);

        // 1. Try Supabase Edge Function if available
        if (supabase) {
          try {
            await supabase.functions.invoke('send-email', {
              body: { to: targetEmail, subject, body, orderData }
            });
          } catch (e) {
            console.warn('Supabase edge email function skipped:', e);
          }
        }

        // 2. Dispatch via FormSubmit AJAX API so sales@myrehbar.com receives instant notification
        try {
          const payload = {
            _subject: subject || `🚨 New Notification from REHBAR Store`,
            _template: 'table',
            _captcha: 'false',
            Message: body || subject,
            ...(orderData || {})
          };
          
          await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(targetEmail)}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify(payload)
          });
          return { success: true, message: `Email successfully sent to ${targetEmail}` };
        } catch (err) {
          console.error('Email dispatch error:', err);
          return { success: false, error: err };
        }
      }
    }
  }
};

if (typeof globalThis !== 'undefined') globalThis.__B44_DB__ = db;
if (typeof window !== 'undefined') window.__B44_DB__ = db;

export const base44 = db;
export default db;