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
          const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
          if (!error && data && data.length > 0) return data;
        }
        if (typeof window !== 'undefined') {
          const local = localStorage.getItem('__rehbar_local_products__');
          if (local) {
            try { return JSON.parse(local); } catch {}
          }
        }
        return fallbackProducts;
      },
      filter: async (query) => {
        if (supabase && query?.slug) {
          const { data, error } = await supabase.from('products').select('*').eq('slug', query.slug);
          if (!error && data && data.length > 0) return data;
        }
        let list = fallbackProducts;
        if (typeof window !== 'undefined') {
          const local = localStorage.getItem('__rehbar_local_products__');
          if (local) {
            try { list = JSON.parse(local); } catch {}
          }
        }
        if (query?.slug) {
          return list.filter(p => p.slug === query.slug);
        }
        return list;
      },
      get: async (id) => {
        if (supabase) {
          const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
          if (!error && data) return data;
        }
        let list = fallbackProducts;
        if (typeof window !== 'undefined') {
          const local = localStorage.getItem('__rehbar_local_products__');
          if (local) {
            try { list = JSON.parse(local); } catch {}
          }
        }
        return list.find(p => p.id === id || p.slug === id) || null;
      },
      create: async (data) => {
        const payload = { ...data };
        if (payload.specs_json) {
          try { payload.specs = JSON.parse(payload.specs_json); } catch {}
          delete payload.specs_json;
        }
        if (payload.images_json) {
          try { payload.images = JSON.parse(payload.images_json); } catch {}
          delete payload.images_json;
        }
        if (supabase) {
          const { data: created, error } = await supabase.from('products').insert([payload]).select().single();
          if (!error && created) return created;
        }
        // Fallback or localStorage
        let list = [...fallbackProducts];
        if (typeof window !== 'undefined') {
          const local = localStorage.getItem('__rehbar_local_products__');
          if (local) { try { list = JSON.parse(local); } catch {} }
        }
        const newItem = { id: 'prod_' + Date.now(), ...payload };
        list.unshift(newItem);
        if (typeof window !== 'undefined') localStorage.setItem('__rehbar_local_products__', JSON.stringify(list));
        return newItem;
      },
      update: async (id, data) => {
        const payload = { ...data };
        if (payload.specs_json) {
          try { payload.specs = JSON.parse(payload.specs_json); } catch {}
          delete payload.specs_json;
        }
        if (payload.images_json) {
          try { payload.images = JSON.parse(payload.images_json); } catch {}
          delete payload.images_json;
        }
        if (supabase) {
          const { data: updated, error } = await supabase.from('products').update(payload).eq('id', id).select().single();
          if (!error && updated) return updated;
        }
        // Fallback or localStorage
        let list = [...fallbackProducts];
        if (typeof window !== 'undefined') {
          const local = localStorage.getItem('__rehbar_local_products__');
          if (local) { try { list = JSON.parse(local); } catch {} }
        }
        list = list.map(p => p.id === id ? { ...p, ...payload } : p);
        if (typeof window !== 'undefined') localStorage.setItem('__rehbar_local_products__', JSON.stringify(list));
        return list.find(p => p.id === id) || { id, ...payload };
      },
      delete: async (id) => {
        if (supabase) {
          await supabase.from('products').delete().eq('id', id);
        }
        let list = [...fallbackProducts];
        if (typeof window !== 'undefined') {
          const local = localStorage.getItem('__rehbar_local_products__');
          if (local) { try { list = JSON.parse(local); } catch {} }
        }
        list = list.filter(p => p.id !== id);
        if (typeof window !== 'undefined') localStorage.setItem('__rehbar_local_products__', JSON.stringify(list));
        return { success: true };
      }
    },
    Order: {
      list: async () => {
        let remoteOrders = [];
        if (supabase) {
          const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
          if (!error && data && data.length > 0) remoteOrders = data;
        }
        let localOrders = [];
        if (typeof window !== 'undefined') {
          const local = localStorage.getItem('__rehbar_local_orders__');
          if (local) { try { localOrders = JSON.parse(local); } catch {} }
        }
        const seedOrders = [
          {
            id: 'ord_seed1',
            order_number: 'ORD-98421',
            customer_name: 'Hamza Malik',
            customer_email: 'hamza.malik@example.com',
            customer_phone: '+1 416 555 0192',
            shipping_address: '142 Queen St W',
            shipping_city: 'Toronto',
            shipping_country: 'Canada',
            shipping_zip: 'M5H 2N2',
            items_json: JSON.stringify([{ id: 'vanguard', title: 'THE VANGUARD', price: 150, quantity: 2, size: 'L' }]),
            items: [{ id: 'vanguard', title: 'THE VANGUARD', price: 150, quantity: 2, size: 'L' }],
            subtotal: 300,
            shipping_cost: 10,
            charity_donation: 12,
            total: 310,
            status: 'fulfilled',
            payment_status: 'paid',
            payment_method: 'Stripe Credit Card',
            created_date: new Date(Date.now() - 3600000 * 12).toISOString(),
            created_at: new Date(Date.now() - 3600000 * 12).toISOString()
          },
          {
            id: 'ord_seed2',
            order_number: 'ORD-98394',
            customer_name: 'Sara Ahmed',
            customer_email: 'sara.ahmed@example.org',
            customer_phone: '+44 20 7946 0921',
            shipping_address: '88 Knightsbridge',
            shipping_city: 'London',
            shipping_country: 'United Kingdom',
            shipping_zip: 'SW1X 7RB',
            items_json: JSON.stringify([{ id: 'nomad', title: 'THE NOMAD', price: 150, quantity: 1, size: 'M' }]),
            items: [{ id: 'nomad', title: 'THE NOMAD', price: 150, quantity: 1, size: 'M' }],
            subtotal: 150,
            shipping_cost: 15,
            charity_donation: 6,
            total: 165,
            status: 'pending',
            payment_status: 'paid',
            payment_method: 'PayPal Express',
            created_date: new Date(Date.now() - 3600000 * 36).toISOString(),
            created_at: new Date(Date.now() - 3600000 * 36).toISOString()
          },
          {
            id: 'ord_seed3',
            order_number: 'ORD-98350',
            customer_name: 'Tariq Aziz',
            customer_email: 'tariq.aziz@example.com',
            customer_phone: '+1 212 555 0143',
            shipping_address: '350 5th Ave',
            shipping_city: 'New York',
            shipping_country: 'USA',
            shipping_zip: '10118',
            items_json: JSON.stringify([{ id: 'vanguard', title: 'THE VANGUARD', price: 150, quantity: 3, size: 'XL' }]),
            items: [{ id: 'vanguard', title: 'THE VANGUARD', price: 150, quantity: 3, size: 'XL' }],
            subtotal: 450,
            shipping_cost: 10,
            charity_donation: 18,
            total: 460,
            status: 'shipped',
            payment_status: 'paid',
            payment_method: 'Stripe Apple Pay',
            created_date: new Date(Date.now() - 3600000 * 72).toISOString(),
            created_at: new Date(Date.now() - 3600000 * 72).toISOString()
          },
          {
            id: 'ord_seed4',
            order_number: 'ORD-98288',
            customer_name: 'Layla Al-Mansoor',
            customer_email: 'layla.m@example.net',
            customer_phone: '+971 50 123 4567',
            shipping_address: 'Downtown Dubai Tower 2',
            shipping_city: 'Dubai',
            shipping_country: 'United Arab Emirates',
            shipping_zip: '00000',
            items_json: JSON.stringify([{ id: 'nomad', title: 'THE NOMAD', price: 150, quantity: 1, size: 'S' }]),
            items: [{ id: 'nomad', title: 'THE NOMAD', price: 150, quantity: 1, size: 'S' }],
            subtotal: 150,
            shipping_cost: 15,
            charity_donation: 6,
            total: 165,
            status: 'fulfilled',
            payment_status: 'paid',
            payment_method: 'Stripe Credit Card',
            created_date: new Date(Date.now() - 3600000 * 140).toISOString(),
            created_at: new Date(Date.now() - 3600000 * 140).toISOString()
          },
          {
            id: 'ord_seed5',
            order_number: 'ORD-98150',
            customer_name: 'Omar Farooq',
            customer_email: 'omar.f@example.com',
            customer_phone: '+1 604 555 0188',
            shipping_address: '1055 W Georgia St',
            shipping_city: 'Vancouver',
            shipping_country: 'Canada',
            shipping_zip: 'V6E 3P3',
            items_json: JSON.stringify([{ id: 'vanguard', title: 'THE VANGUARD', price: 150, quantity: 2, size: 'M' }]),
            items: [{ id: 'vanguard', title: 'THE VANGUARD', price: 150, quantity: 2, size: 'M' }],
            subtotal: 300,
            shipping_cost: 10,
            charity_donation: 12,
            total: 310,
            status: 'cancelled',
            payment_status: 'refunded',
            payment_method: 'Stripe Credit Card',
            created_date: new Date(Date.now() - 3600000 * 280).toISOString(),
            created_at: new Date(Date.now() - 3600000 * 280).toISOString()
          },
          {
            id: 'ord_seed6',
            order_number: 'ORD-98012',
            customer_name: 'Amina Yusuf',
            customer_email: 'amina.y@example.org',
            customer_phone: '+44 161 496 0311',
            shipping_address: '12 Deansgate',
            shipping_city: 'Manchester',
            shipping_country: 'United Kingdom',
            shipping_zip: 'M3 1BZ',
            items_json: JSON.stringify([{ id: 'nomad', title: 'THE NOMAD', price: 150, quantity: 1, size: 'L' }]),
            items: [{ id: 'nomad', title: 'THE NOMAD', price: 150, quantity: 1, size: 'L' }],
            subtotal: 150,
            shipping_cost: 15,
            charity_donation: 6,
            total: 165,
            status: 'fulfilled',
            payment_status: 'paid',
            payment_method: 'PayPal Express',
            created_date: new Date(Date.now() - 3600000 * 432).toISOString(),
            created_at: new Date(Date.now() - 3600000 * 432).toISOString()
          }
        ];

        // Combine all store orders uniquely by ID/Order Number
        const map = new Map();
        seedOrders.forEach(o => map.set(o.order_number, o));
        remoteOrders.forEach(o => map.set(o.order_number, { ...map.get(o.order_number), ...o }));
        localOrders.forEach(o => map.set(o.order_number, { ...map.get(o.order_number), ...o }));

        return Array.from(map.values()).sort((a, b) => new Date(b.created_date || b.created_at || 0) - new Date(a.created_date || a.created_at || 0));
      },
      create: async (data) => {
        if (supabase) {
          const { data: created, error } = await supabase.from('orders').insert([data]).select().single();
          if (!error && created) return created;
        }
        let list = [];
        if (typeof window !== 'undefined') {
          const local = localStorage.getItem('__rehbar_local_orders__');
          if (local) { try { list = JSON.parse(local); } catch {} }
        }
        const newItem = { id: 'ord_' + Date.now(), payment_status: 'paid', payment_method: 'Stripe Credit Card', ...data };
        list.unshift(newItem);
        if (typeof window !== 'undefined') localStorage.setItem('__rehbar_local_orders__', JSON.stringify(list));
        return newItem;
      },
      update: async (id, data) => {
        if (supabase) {
          const { data: updated, error } = await supabase.from('orders').update(data).eq('id', id).select().single();
          if (!error && updated) return updated;
        }
        let list = [];
        if (typeof window !== 'undefined') {
          const local = localStorage.getItem('__rehbar_local_orders__');
          if (local) { try { list = JSON.parse(local); } catch {} }
        }
        list = list.map(o => (o.id === id || o.order_number === id) ? { ...o, ...data } : o);
        if (typeof window !== 'undefined') localStorage.setItem('__rehbar_local_orders__', JSON.stringify(list));
        return list.find(o => o.id === id || o.order_number === id) || { id, ...data };
      },
      delete: async (id) => {
        if (supabase) {
          await supabase.from('orders').delete().eq('id', id);
        }
        let list = [];
        if (typeof window !== 'undefined') {
          const local = localStorage.getItem('__rehbar_local_orders__');
          if (local) { try { list = JSON.parse(local); } catch {} }
        }
        list = list.filter(o => o.id !== id && o.order_number !== id);
        if (typeof window !== 'undefined') localStorage.setItem('__rehbar_local_orders__', JSON.stringify(list));
        return { success: true };
      }
    },
    Customer: {
      list: async () => {
        const orders = await db.entities.Order.list();
        const customersMap = new Map();
        
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
            cust.total_orders += 1;
            cust.total_spent += Number(o.total || 0);
            if (new Date(o.created_date || o.created_at) > new Date(cust.last_order_date)) {
              cust.last_order_date = o.created_date || o.created_at;
            }
          }
        });

        // Add Super Admin and Master staff to customer/user directory
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

        return Array.from(customersMap.values()).sort((a, b) => b.total_spent - a.total_spent);
      }
    },
    JournalArticle: {
      list: async () => {
        if (supabase) {
          const { data, error } = await supabase.from('journal_articles').select('*').order('created_at', { ascending: false });
          if (!error && data && data.length > 0) return data;
        }
        if (typeof window !== 'undefined') {
          const local = localStorage.getItem('__rehbar_local_journals__');
          if (local) { try { return JSON.parse(local); } catch {} }
        }
        return fallbackJournal;
      },
      filter: async (query) => {
        if (supabase && query?.slug) {
          const { data, error } = await supabase.from('journal_articles').select('*').eq('slug', query.slug);
          if (!error && data && data.length > 0) return data;
        }
        let list = fallbackJournal;
        if (typeof window !== 'undefined') {
          const local = localStorage.getItem('__rehbar_local_journals__');
          if (local) { try { list = JSON.parse(local); } catch {} }
        }
        if (query?.slug) {
          return list.filter(a => a.slug === query.slug);
        }
        return list;
      },
      create: async (data) => {
        const payload = { ...data };
        if (payload.blocks_json) {
          try { payload.blocks = JSON.parse(payload.blocks_json); } catch {}
          delete payload.blocks_json;
        }
        if (supabase) {
          const { data: created, error } = await supabase.from('journal_articles').insert([payload]).select().single();
          if (!error && created) return created;
        }
        let list = [...fallbackJournal];
        if (typeof window !== 'undefined') {
          const local = localStorage.getItem('__rehbar_local_journals__');
          if (local) { try { list = JSON.parse(local); } catch {} }
        }
        const newItem = { id: 'art_' + Date.now(), ...payload };
        list.unshift(newItem);
        if (typeof window !== 'undefined') localStorage.setItem('__rehbar_local_journals__', JSON.stringify(list));
        return newItem;
      },
      update: async (id, data) => {
        const payload = { ...data };
        if (payload.blocks_json) {
          try { payload.blocks = JSON.parse(payload.blocks_json); } catch {}
          delete payload.blocks_json;
        }
        if (supabase) {
          const { data: updated, error } = await supabase.from('journal_articles').update(payload).eq('id', id).select().single();
          if (!error && updated) return updated;
        }
        let list = [...fallbackJournal];
        if (typeof window !== 'undefined') {
          const local = localStorage.getItem('__rehbar_local_journals__');
          if (local) { try { list = JSON.parse(local); } catch {} }
        }
        list = list.map(a => a.id === id ? { ...a, ...payload } : a);
        if (typeof window !== 'undefined') localStorage.setItem('__rehbar_local_journals__', JSON.stringify(list));
        return list.find(a => a.id === id) || { id, ...payload };
      },
      delete: async (id) => {
        if (supabase) {
          await supabase.from('journal_articles').delete().eq('id', id);
        }
        let list = [...fallbackJournal];
        if (typeof window !== 'undefined') {
          const local = localStorage.getItem('__rehbar_local_journals__');
          if (local) { try { list = JSON.parse(local); } catch {} }
        }
        list = list.filter(a => a.id !== id);
        if (typeof window !== 'undefined') localStorage.setItem('__rehbar_local_journals__', JSON.stringify(list));
        return { success: true };
      }
    },
    ContactMessage: {
      list: async () => {
        if (supabase) {
          const { data, error } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false });
          if (!error && data) return data;
        }
        if (typeof window !== 'undefined') {
          const local = localStorage.getItem('__rehbar_local_messages__');
          if (local) { try { return JSON.parse(local); } catch {} }
        }
        return [
          {
            id: 'msg_sample1',
            name: 'Ahmad Khan',
            email: 'ahmad.k@example.com',
            message: 'Hello, what is the exact GSM and material blend used for THE VANGUARD oversized t-shirt? Looking to place a bulk custom order.',
            created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
            read: false
          },
          {
            id: 'msg_sample2',
            name: 'Zainab Bilal',
            email: 'zainab@example.org',
            message: 'Do you ship to Dubai and what are the expected customs timelines for limited edition drops?',
            created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
            read: true
          }
        ];
      },
      create: async (data) => {
        if (supabase) {
          const { data: created, error } = await supabase.from('contact_messages').insert([data]).select().single();
          if (!error && created) return created;
        }
        let list = [];
        if (typeof window !== 'undefined') {
          const local = localStorage.getItem('__rehbar_local_messages__');
          if (local) { try { list = JSON.parse(local); } catch {} }
          else {
            list = [
              {
                id: 'msg_sample1',
                name: 'Ahmad Khan',
                email: 'ahmad.k@example.com',
                message: 'Hello, what is the exact GSM and material blend used for THE VANGUARD oversized t-shirt? Looking to place a bulk custom order.',
                created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
                read: false
              }
            ];
          }
        }
        const newItem = { id: 'msg_' + Date.now(), read: false, ...data };
        list.unshift(newItem);
        if (typeof window !== 'undefined') localStorage.setItem('__rehbar_local_messages__', JSON.stringify(list));
        return newItem;
      },
      update: async (id, data) => {
        if (supabase) {
          const { data: updated, error } = await supabase.from('contact_messages').update(data).eq('id', id).select().single();
          if (!error && updated) return updated;
        }
        let list = [];
        if (typeof window !== 'undefined') {
          const local = localStorage.getItem('__rehbar_local_messages__');
          if (local) { try { list = JSON.parse(local); } catch {} }
        }
        list = list.map(m => m.id === id ? { ...m, ...data } : m);
        if (typeof window !== 'undefined') localStorage.setItem('__rehbar_local_messages__', JSON.stringify(list));
        return list.find(m => m.id === id) || { id, ...data };
      },
      delete: async (id) => {
        if (supabase) {
          await supabase.from('contact_messages').delete().eq('id', id);
        }
        let list = [];
        if (typeof window !== 'undefined') {
          const local = localStorage.getItem('__rehbar_local_messages__');
          if (local) { try { list = JSON.parse(local); } catch {} }
        }
        list = list.filter(m => m.id !== id);
        if (typeof window !== 'undefined') localStorage.setItem('__rehbar_local_messages__', JSON.stringify(list));
        return { success: true };
      }
    }
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
        // Fallback for offline/unconfigured testing so UI works instantly
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve({ file_url: reader.result });
          reader.onerror = () => resolve({ file_url: typeof URL !== 'undefined' ? URL.createObjectURL(file) : '' });
          reader.readAsDataURL(file);
        });
      }
    }
  }
};

if (typeof globalThis !== 'undefined') globalThis.__B44_DB__ = db;
if (typeof window !== 'undefined') window.__B44_DB__ = db;

export const base44 = db;
export default db;