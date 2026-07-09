-- ====================================================================
-- SUPABASE DATABASE SETUP SCRIPT FOR REHBAR WEBSITE
-- Copy and paste this entire script into your Supabase SQL Editor and run!
-- ====================================================================

-- 1. Create Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    subtitle TEXT,
    price NUMERIC NOT NULL DEFAULT 50,
    edition TEXT,
    description TEXT,
    specs JSONB DEFAULT '{}'::jsonb,
    images JSONB DEFAULT '[]'::jsonb,
    "heroImage" TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY DEFAULT 'ord_' || gen_random_uuid()::text,
    order_number TEXT,
    customer_email TEXT NOT NULL,
    customer_name TEXT,
    shipping_address JSONB DEFAULT '{}'::jsonb,
    items JSONB DEFAULT '[]'::jsonb,
    total NUMERIC NOT NULL DEFAULT 0,
    charity TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Journal Articles Table
CREATE TABLE IF NOT EXISTS public.journal_articles (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    subtitle TEXT,
    "metaTitle" TEXT,
    excerpt TEXT,
    image TEXT,
    date TEXT,
    blocks JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable Row Level Security (RLS) & Set Policies for Public Read & Admin Write
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_articles ENABLE ROW LEVEL SECURITY;

-- Allow public read access to products & journal articles
CREATE POLICY "Public can view products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Public can view journal articles" ON public.journal_articles FOR SELECT USING (true);
CREATE POLICY "Public can insert orders" ON public.orders FOR INSERT WITH CHECK (true);

-- Allow authenticated users (Admins) to insert, update, delete across all tables
CREATE POLICY "Authenticated users can manage products" ON public.products FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage journal articles" ON public.journal_articles FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage orders" ON public.orders FOR ALL USING (auth.role() = 'authenticated');

-- 5. Create Storage Bucket for Media & Apparel Images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('media', 'media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Allow public access to read media storage
CREATE POLICY "Public access to media bucket" ON storage.objects FOR SELECT USING (bucket_id = 'media');

-- Allow authenticated users to upload/update/delete files in media bucket
CREATE POLICY "Authenticated users can upload media" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'media' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update media" ON storage.objects FOR UPDATE USING (bucket_id = 'media' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete media" ON storage.objects FOR DELETE USING (bucket_id = 'media' AND auth.role() = 'authenticated');
