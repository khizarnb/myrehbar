-- ==========================================
-- REHBAR STORE - GLOBAL CLOUD DATABASE SCHEMA
-- ==========================================
-- Run this SQL in your Supabase SQL Editor (https://supabase.com/dashboard)
-- to create the exact tables needed for your global WordPress-style dashboard.

-- 1. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  price NUMERIC DEFAULT 0,
  edition TEXT,
  description TEXT,
  specs JSONB DEFAULT '{}'::jsonb,
  images JSONB DEFAULT '[]'::jsonb,
  "heroImage" TEXT,
  inventory INTEGER DEFAULT 100,
  "blogTitle" TEXT,
  "blogContent" TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. CONTACT MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  items_json TEXT,
  customer_name TEXT,
  customer_email TEXT,
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
  status TEXT DEFAULT 'pending',
  created_date TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. JOURNAL ARTICLES TABLE
CREATE TABLE IF NOT EXISTS public.journal_articles (
  id TEXT PRIMARY KEY,
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

-- ==========================================
-- ENABLE PUBLIC READ & WRITE / RLS POLICIES
-- ==========================================
-- Allow public visitors to view products and submit contact messages / orders,
-- and allow your authenticated / admin dashboard full access to manage data.

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Allow all manage products" ON public.products FOR ALL USING (true);

CREATE POLICY "Allow public read journal" ON public.journal_articles FOR SELECT USING (true);
CREATE POLICY "Allow all manage journal" ON public.journal_articles FOR ALL USING (true);

CREATE POLICY "Allow public insert contact messages" ON public.contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all manage contact messages" ON public.contact_messages FOR ALL USING (true);

CREATE POLICY "Allow public insert orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all manage orders" ON public.orders FOR ALL USING (true);
