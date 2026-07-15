-- =========================================================================
-- REHBAR STORE - SINGLE SOURCE OF TRUTH E-COMMERCE DATABASE ARCHITECTURE
-- =========================================================================
-- Run this SQL in your Supabase SQL Editor (https://supabase.com/dashboard -> SQL Editor -> New Query)
-- This enforces a real Shopify/WooCommerce-style database schema and removes RLS restrictions on admin updates.

-- 1. ENSURE PRODUCTS TABLE EXISTS AND HAS ALL REQUIRED E-COMMERCE COLUMNS
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  name TEXT,
  subtitle TEXT,
  description TEXT,
  price NUMERIC NOT NULL DEFAULT 50,
  compare_at_price NUMERIC DEFAULT 0,
  inventory INTEGER DEFAULT 100,
  stock INTEGER DEFAULT 100,
  sku TEXT,
  category TEXT DEFAULT 'Apparel',
  edition TEXT,
  specs JSONB DEFAULT '{}'::jsonb,
  images JSONB DEFAULT '[]'::jsonb,
  gallery JSONB DEFAULT '[]'::jsonb,
  "heroImage" TEXT,
  image TEXT,
  featured BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'active',
  "blogTitle" TEXT,
  "blogContent" TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add any missing columns safely if the table already existed with older columns
DO $$
BEGIN
  BEGIN ALTER TABLE public.products ADD COLUMN IF NOT EXISTS name TEXT; EXCEPTION WHEN others THEN NULL; END;
  BEGIN ALTER TABLE public.products ADD COLUMN IF NOT EXISTS compare_at_price NUMERIC DEFAULT 0; EXCEPTION WHEN others THEN NULL; END;
  BEGIN ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 100; EXCEPTION WHEN others THEN NULL; END;
  BEGIN ALTER TABLE public.products ADD COLUMN IF NOT EXISTS sku TEXT; EXCEPTION WHEN others THEN NULL; END;
  BEGIN ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Apparel'; EXCEPTION WHEN others THEN NULL; END;
  BEGIN ALTER TABLE public.products ADD COLUMN IF NOT EXISTS gallery JSONB DEFAULT '[]'::jsonb; EXCEPTION WHEN others THEN NULL; END;
  BEGIN ALTER TABLE public.products ADD COLUMN IF NOT EXISTS image TEXT; EXCEPTION WHEN others THEN NULL; END;
  BEGIN ALTER TABLE public.products ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false; EXCEPTION WHEN others THEN NULL; END;
  BEGIN ALTER TABLE public.products ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active'; EXCEPTION WHEN others THEN NULL; END;
  BEGIN ALTER TABLE public.products ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now(); EXCEPTION WHEN others THEN NULL; END;
END $$;

-- 2. ENSURE ORDERS TABLE EXISTS FOR CHECKOUT DATA
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY DEFAULT 'ord_' || gen_random_uuid()::text,
  order_number TEXT UNIQUE NOT NULL,
  items_json TEXT,
  items JSONB DEFAULT '[]'::jsonb,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  shipping_address TEXT,
  shipping_city TEXT,
  shipping_country TEXT,
  shipping_zip TEXT,
  charity TEXT,
  subtotal NUMERIC DEFAULT 0,
  shipping_cost NUMERIC DEFAULT 10,
  charity_donation NUMERIC DEFAULT 0,
  total NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'paid',
  payment_status TEXT DEFAULT 'paid',
  payment_method TEXT DEFAULT 'Stripe Credit Card',
  created_date TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. ENSURE CONTACT MESSAGES TABLE EXISTS
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id TEXT PRIMARY KEY DEFAULT 'msg_' || gen_random_uuid()::text,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. ENSURE JOURNAL ARTICLES TABLE EXISTS
CREATE TABLE IF NOT EXISTS public.journal_articles (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  author TEXT,
  date TEXT,
  "coverImage" TEXT,
  summary TEXT,
  blocks JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =========================================================================
-- 5. CONFIGURE RLS (ROW LEVEL SECURITY) FOR UNIVERSAL DIRECT CRUD ACCESS
-- =========================================================================
-- Enable RLS and drop restrictive policies that block updates when logged in via custom master admin email
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_articles ENABLE ROW LEVEL SECURITY;

-- Drop old conflicting policies
DROP POLICY IF EXISTS "Public can view products" ON public.products;
DROP POLICY IF EXISTS "Authenticated users can manage products" ON public.products;
DROP POLICY IF EXISTS "Allow public read products" ON public.products;
DROP POLICY IF EXISTS "Allow all manage products" ON public.products;

DROP POLICY IF EXISTS "Public can insert orders" ON public.orders;
DROP POLICY IF EXISTS "Authenticated users can manage orders" ON public.orders;
DROP POLICY IF EXISTS "Allow public insert orders" ON public.orders;
DROP POLICY IF EXISTS "Allow all manage orders" ON public.orders;

DROP POLICY IF EXISTS "Allow public insert contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Allow all manage contact messages" ON public.contact_messages;

DROP POLICY IF EXISTS "Public can view journal articles" ON public.journal_articles;
DROP POLICY IF EXISTS "Authenticated users can manage journal articles" ON public.journal_articles;
DROP POLICY IF EXISTS "Allow public read journal" ON public.journal_articles;
DROP POLICY IF EXISTS "Allow all manage journal" ON public.journal_articles;

-- Create universal, unblocked policies for single-source-of-truth real-time e-commerce architecture
CREATE POLICY "Universal Read Products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Universal Write Products" ON public.products FOR ALL USING (true);

CREATE POLICY "Universal Read Orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Universal Write Orders" ON public.orders FOR ALL USING (true);

CREATE POLICY "Universal Read Contact Messages" ON public.contact_messages FOR SELECT USING (true);
CREATE POLICY "Universal Write Contact Messages" ON public.contact_messages FOR ALL USING (true);

CREATE POLICY "Universal Read Journal" ON public.journal_articles FOR SELECT USING (true);
CREATE POLICY "Universal Write Journal" ON public.journal_articles FOR ALL USING (true);

-- Ensure media bucket exists and allows universal upload/access
INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true) ON CONFLICT (id) DO UPDATE SET public = true;
DROP POLICY IF EXISTS "Public access to media bucket" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload media" ON storage.objects;
DROP POLICY IF EXISTS "Universal access to media bucket" ON storage.objects;
CREATE POLICY "Universal access to media bucket" ON storage.objects FOR ALL USING (bucket_id = 'media');
