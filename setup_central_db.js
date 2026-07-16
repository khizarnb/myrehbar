const token = process.env.SUPABASE_ACCESS_TOKEN || '';
const projectRef = 'ztaisbdcndxtgjfjswkg';
const apiUrl = `https://api.supabase.com/v1/projects/${projectRef}/database/query`;

async function runQuery(sql) {
  const res = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query: sql })
  });
  const data = await res.json();
  if (!res.ok) {
    console.error("SQL Error:", data);
    throw new Error(JSON.stringify(data));
  }
  return data;
}

const setupSQL = `
-- 1. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  name TEXT,
  subtitle TEXT,
  description TEXT,
  price NUMERIC NOT NULL DEFAULT 40,
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

-- 2. ORDERS TABLE
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
  invoice_number TEXT,
  notes TEXT,
  created_date TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

DO $$
BEGIN
  BEGIN ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS invoice_number TEXT; EXCEPTION WHEN others THEN NULL; END;
  BEGIN ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS notes TEXT; EXCEPTION WHEN others THEN NULL; END;
  BEGIN ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_phone TEXT; EXCEPTION WHEN others THEN NULL; END;
  BEGIN ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'paid'; EXCEPTION WHEN others THEN NULL; END;
  BEGIN ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'Stripe Credit Card'; EXCEPTION WHEN others THEN NULL; END;
  BEGIN ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS created_date TEXT; EXCEPTION WHEN others THEN NULL; END;
END $$;

-- 3. CUSTOMERS TABLE (Optional explicitly stored customers or synced)
CREATE TABLE IF NOT EXISTS public.customers (
  id TEXT PRIMARY KEY DEFAULT 'cust_' || gen_random_uuid()::text,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  address TEXT,
  city TEXT,
  country TEXT,
  zip TEXT,
  total_orders INTEGER DEFAULT 0,
  total_spent NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

DO $$
BEGIN
  BEGIN ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS phone TEXT; EXCEPTION WHEN others THEN NULL; END;
  BEGIN ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS total_orders INTEGER DEFAULT 0; EXCEPTION WHEN others THEN NULL; END;
  BEGIN ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS total_spent NUMERIC DEFAULT 0; EXCEPTION WHEN others THEN NULL; END;
END $$;

-- 4. JOURNAL ARTICLES / BLOGS TABLE
CREATE TABLE IF NOT EXISTS public.journal_articles (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  author TEXT DEFAULT 'REHBAR Editorial',
  date TEXT,
  "coverImage" TEXT,
  image TEXT,
  summary TEXT,
  excerpt TEXT,
  content TEXT,
  category TEXT DEFAULT 'Philosophy',
  read_time TEXT DEFAULT '5 min read',
  seo_title TEXT,
  seo_description TEXT,
  seo_keywords TEXT,
  published BOOLEAN DEFAULT true,
  blocks JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

DO $$
BEGIN
  BEGIN ALTER TABLE public.journal_articles ADD COLUMN IF NOT EXISTS image TEXT; EXCEPTION WHEN others THEN NULL; END;
  BEGIN ALTER TABLE public.journal_articles ADD COLUMN IF NOT EXISTS excerpt TEXT; EXCEPTION WHEN others THEN NULL; END;
  BEGIN ALTER TABLE public.journal_articles ADD COLUMN IF NOT EXISTS content TEXT; EXCEPTION WHEN others THEN NULL; END;
  BEGIN ALTER TABLE public.journal_articles ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Philosophy'; EXCEPTION WHEN others THEN NULL; END;
  BEGIN ALTER TABLE public.journal_articles ADD COLUMN IF NOT EXISTS read_time TEXT DEFAULT '5 min read'; EXCEPTION WHEN others THEN NULL; END;
  BEGIN ALTER TABLE public.journal_articles ADD COLUMN IF NOT EXISTS seo_title TEXT; EXCEPTION WHEN others THEN NULL; END;
  BEGIN ALTER TABLE public.journal_articles ADD COLUMN IF NOT EXISTS seo_description TEXT; EXCEPTION WHEN others THEN NULL; END;
  BEGIN ALTER TABLE public.journal_articles ADD COLUMN IF NOT EXISTS seo_keywords TEXT; EXCEPTION WHEN others THEN NULL; END;
  BEGIN ALTER TABLE public.journal_articles ADD COLUMN IF NOT EXISTS published BOOLEAN DEFAULT true; EXCEPTION WHEN others THEN NULL; END;
  BEGIN ALTER TABLE public.journal_articles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now(); EXCEPTION WHEN others THEN NULL; END;
END $$;

-- 5. CONTACT MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id TEXT PRIMARY KEY DEFAULT 'msg_' || gen_random_uuid()::text,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'unread',
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

DO $$
BEGIN
  BEGIN ALTER TABLE public.contact_messages ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'unread'; EXCEPTION WHEN others THEN NULL; END;
END $$;

-- 6. SITE SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.site_settings (
  id TEXT PRIMARY KEY DEFAULT 'set_' || gen_random_uuid()::text,
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS POLICIES FOR UNIVERSAL SINGLE-SOURCE-OF-TRUTH ACCESS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Drop all old policies
DROP POLICY IF EXISTS "Universal Read Products" ON public.products;
DROP POLICY IF EXISTS "Universal Write Products" ON public.products;
DROP POLICY IF EXISTS "Public can view products" ON public.products;
DROP POLICY IF EXISTS "Authenticated users can manage products" ON public.products;

DROP POLICY IF EXISTS "Universal Read Orders" ON public.orders;
DROP POLICY IF EXISTS "Universal Write Orders" ON public.orders;
DROP POLICY IF EXISTS "Public can insert orders" ON public.orders;
DROP POLICY IF EXISTS "Authenticated users can manage orders" ON public.orders;

DROP POLICY IF EXISTS "Universal Read Customers" ON public.customers;
DROP POLICY IF EXISTS "Universal Write Customers" ON public.customers;

DROP POLICY IF EXISTS "Universal Read Journal" ON public.journal_articles;
DROP POLICY IF EXISTS "Universal Write Journal" ON public.journal_articles;
DROP POLICY IF EXISTS "Public can view journal articles" ON public.journal_articles;
DROP POLICY IF EXISTS "Authenticated users can manage journal articles" ON public.journal_articles;

DROP POLICY IF EXISTS "Universal Read Contact Messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Universal Write Contact Messages" ON public.contact_messages;

DROP POLICY IF EXISTS "Universal Read Settings" ON public.site_settings;
DROP POLICY IF EXISTS "Universal Write Settings" ON public.site_settings;

-- Create universal policies
CREATE POLICY "Universal Read Products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Universal Write Products" ON public.products FOR ALL USING (true);

CREATE POLICY "Universal Read Orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Universal Write Orders" ON public.orders FOR ALL USING (true);

CREATE POLICY "Universal Read Customers" ON public.customers FOR SELECT USING (true);
CREATE POLICY "Universal Write Customers" ON public.customers FOR ALL USING (true);

CREATE POLICY "Universal Read Journal" ON public.journal_articles FOR SELECT USING (true);
CREATE POLICY "Universal Write Journal" ON public.journal_articles FOR ALL USING (true);

CREATE POLICY "Universal Read Contact Messages" ON public.contact_messages FOR SELECT USING (true);
CREATE POLICY "Universal Write Contact Messages" ON public.contact_messages FOR ALL USING (true);

CREATE POLICY "Universal Read Settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Universal Write Settings" ON public.site_settings FOR ALL USING (true);

-- STORAGE BUCKET
INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true) ON CONFLICT (id) DO UPDATE SET public = true;
DROP POLICY IF EXISTS "Universal access to media bucket" ON storage.objects;
CREATE POLICY "Universal access to media bucket" ON storage.objects FOR ALL USING (bucket_id = 'media');
`;

const seedProductsSQL = `
INSERT INTO public.products (id, slug, title, name, subtitle, price, compare_at_price, inventory, stock, sku, edition, description, specs, images, gallery, "heroImage", image, featured, active, status, "blogTitle", "blogContent")
VALUES 
(
  '6a4fbf02508a18fce23927c9',
  'rehbar',
  'REHBAR',
  'REHBAR',
  'THE VANGUARD',
  40,
  55,
  100,
  100,
  'RHB-VNG-001',
  '100',
  'A masterwork of leadership and vision. This design captures the ''Rehbar'' (The Guide) — full-size calligraphic print across the chest. Crafted on premium heavyweight cotton, it represents the unwavering light of guidance in times of obscurity. Only 100 made. When they''re gone, they''re gone.',
  '{"material":"100% Premium Heavyweight Cotton","weight":"280 GSM","print":"Full-Size Chest Print — Screen Printed","fit":"Regular","limited":"Limited Edition","charity":"A portion from each item goes to your chosen cause"}'::jsonb,
  '["/images/rehbar-artical-1.png","/images/rehbar-artical-2.png","/images/rehbar-artical-3.png"]'::jsonb,
  '["/images/rehbar-artical-1.png","/images/rehbar-artical-2.png","/images/rehbar-artical-3.png"]'::jsonb,
  '/images/rehbar-artical-1.png',
  '/images/rehbar-artical-1.png',
  true,
  true,
  'active',
  'The Architecture of a Leader',
  'In every era, the Rehbar emerges not by choice, but by necessity. The word itself — رهبر — carries a weight that transcends simple translation. It is not merely "leader." It is the one who walks the path first, who bears the weight of a thousand decisions so that those behind may walk with clarity.\n\nThis design is a statement of that philosophy made tangible. The full-size Rehbar calligraphy sweeps across the chest like a blade cutting through silence — each stroke deliberate, each curve earned. Our creative collective spent three months refining the letterforms until they carried motion within stillness.\n\nThe shadow play within the calligraphy is intentional. Look closely at the upper strokes — they thin at the edges, mimicking the way light falls across the brow of someone carrying responsibility. The diamond-cut negative space at the base of the script represents the foundation of certainty that every true guide must stand upon.\n\nWhen you see someone wearing this on the street — in Toronto, in London, in Karachi — you are not seeing a brand logo. You are seeing a declaration. I walk first. I carry weight. I guide.\n\nThe full-size print was chosen deliberately over the subtler chest-pocket placement of the Khyber Shikan. This is not about quiet confidence. This is about visible conviction. The Rehbar design does not whisper. It does not need to.\n\nEvery shirt from our collection is crafted with intention. A contribution from every item goes to a charity chosen by the person who wears it. Every piece is made by a community, for a community.\n\nEach design is produced in exclusive quantities before entering the archive — never to be diluted. If you are reading this and your size is still available, the decision is not whether to acquire it. The decision is whether you are ready to wear what it represents.'
),
(
  '6a4fbf02508a18fce23927ca',
  'sejjil',
  'SEJJIL',
  'SEJJIL',
  'THE IMPACT',
  40,
  55,
  100,
  100,
  'RHB-SJL-002',
  'Limited',
  'Inspired by the historical significance of resilience and divine intervention. Sejjil is a study of force and destiny. The cracked-earth texture within the crimson circle conveys unstoppable momentum — the moment where the small overcomes the monolithic. Exclusive Edition.',
  '{"material":"100% Premium Heavyweight Cotton","weight":"280 GSM","print":"Full Back Print — DTG Digital","fit":"Regular","limited":"Limited Edition","charity":"A portion from each item goes to your chosen cause"}'::jsonb,
  '["/images/sejjil-artical.png","/images/sejjil-artical-1.png","/images/sejjil-artical-1.webp"]'::jsonb,
  '["/images/sejjil-artical.png","/images/sejjil-artical-1.png","/images/sejjil-artical-1.webp"]'::jsonb,
  '/images/sejjil-artical.png',
  '/images/sejjil-artical.png',
  true,
  true,
  'active',
  'Stones of Destiny: The Sejjil Philosophy',
  'Sejjil — سجیل — represents the moment where the small overcomes the monolithic. Baked clay that changed the course of empires. A substance so humble that armies would have laughed at the sight of it, until it became the instrument of their undoing.\n\nThis is not a design born from aesthetics alone. Our design collective studied geological formations for weeks — the way volcanic rock fractures under pressure, the way earth cracks when it has been baked by forces beyond its control. The crimson circle on the back of this shirt is not a logo. It is an impact crater.\n\nLook at the textures within the circle. The cracked, fragmented surface tells you that this object has been through something. It has been forged in fire, shaped by pressure, and delivered with precision. The Arabic script — سجیل — sits within the destruction like a name carved into stone. It does not float above the chaos. It is embedded within it.\n\nThe choice to place this design on the back was deliberate. The Sejjil story is not one you announce to the world as you approach. It is one that reveals itself as you walk away. It is the aftermath. The impact has already been made. The viewer sees the result.\n\nThe color palette — deep crimson against obsidian black — references the earth and fire that created the original Sejjil. There is no blue, no green, no calm. This is a design that exists in the space between destruction and creation.\n\nIn the context of the Rehbar collection, Sejjil occupies a unique position. Where the Rehbar design speaks of guidance, and Khyber Shikan speaks of breaking barriers, Sejjil speaks of the decisive moment itself — the instant where trajectory meets destiny.\n\nEach piece carries the weight of this narrative. Each contributes to a cause chosen by the wearer. And when the run is complete, the Sejjil design enters the Rehbar archive — a distinctive chapter that our community carries with distinction.\n\nThe cracked earth on your back is not damage. It is evidence of what you survived.'
),
(
  '6a4fbf02508a18fce23927cb',
  'khyber-shikan',
  'KHYBER SHIKAN',
  'KHYBER SHIKAN',
  'THE TRAILBLAZER',
  40,
  55,
  100,
  100,
  'RHB-KHB-003',
  'Limited',
  'A tribute to the indomitable spirit of the Khyber. This piece is an exercise in structural power and the breaking of barriers. The sweeping calligraphic blade on the back with the subtle Rehbar emblem at the chest — designed for spaces that demand a presence of strength. Exclusive Edition.',
  '{"material":"100% Premium Heavyweight Cotton","weight":"280 GSM","print":"Full Back Print + Chest Emblem — Screen Printed","fit":"Regular","limited":"Limited Edition","charity":"A portion from each item goes to your chosen cause"}'::jsonb,
  '["/images/khybershikan-artical.png","/images/khybershikan.png","/images/khybershikan-artical.png"]'::jsonb,
  '["/images/khybershikan-artical.png","/images/khybershikan.png","/images/khybershikan-artical.png"]'::jsonb,
  '/images/khybershikan-artical.png',
  '/images/khybershikan-artical.png',
  true,
  true,
  'active',
  'Beyond the Pass: The Legacy of Khyber Shikan',
  'The Khyber Pass has long been the gateway of conquerors. A jagged wound carved through the Hindu Kush, it has witnessed the march of Alexander, the campaigns of the Mughals, and the defiance of those who refused to let anyone pass unchallenged. To be a Shikan — a Breaker — is to master the impossible terrain of life.\n\nخیبر شکن. Two words that carry centuries. The calligraphy on the back of this shirt does not sit still. The sweeping blade-form that contains the script moves diagonally across the fabric like a force cutting through resistance. The artist designed it to be read not as text, but as trajectory — a projectile in flight.\n\nAt the chest sits a small, precise Rehbar emblem. Subtle. Almost hidden. This is the quiet declaration: I belong to something. The back tells the world what that something is capable of.\n\nThe Khyber Shikan design occupies the space between restraint and eruption. From the front, you see a man in a black shirt with a small emblem. Turn around, and you see the full scope of the statement. This duality — calm approach, powerful departure — is the design philosophy distilled.\n\nThe calligraphy itself was rendered to reference the geography it is named after. The vertical stroke mirrors the steep cliff faces of the Pass. The horizontal sweep mimics the road that winds through it. And the flourish at the tail — that rising, defiant curve — represents the moment you emerge on the other side, changed.\n\nIn testing, this was consistently the design that drew the most physical reactions. People reached out to touch the back print. They traced the calligraphy with their fingers. It is a design that demands tactile engagement, which is why the screen-print technique was chosen — the ink sits raised on the fabric, creating a texture you can feel.\n\nThe front-and-back composition makes this the most complete design in the collection. Rehbar gives you the statement. Sejjil gives you the impact. Khyber Shikan gives you both — the quiet identity and the bold legacy.\n\nCrafted with dedication. A contribution from each to a cause of the wearer''s choosing. And then this design, like all Rehbar designs, enters the archive. The Pass remains. THE TRAILBLAZER moves on.'
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  name = EXCLUDED.name,
  subtitle = EXCLUDED.subtitle,
  price = EXCLUDED.price,
  compare_at_price = EXCLUDED.compare_at_price,
  inventory = EXCLUDED.inventory,
  stock = EXCLUDED.stock,
  sku = EXCLUDED.sku,
  edition = EXCLUDED.edition,
  description = EXCLUDED.description,
  specs = EXCLUDED.specs,
  images = EXCLUDED.images,
  gallery = EXCLUDED.gallery,
  "heroImage" = EXCLUDED."heroImage",
  image = EXCLUDED.image,
  featured = EXCLUDED.featured,
  active = EXCLUDED.active,
  status = EXCLUDED.status,
  "blogTitle" = EXCLUDED."blogTitle",
  "blogContent" = EXCLUDED."blogContent";
`;

const seedArticlesSQL = `
INSERT INTO public.journal_articles (id, slug, title, subtitle, author, date, "coverImage", image, summary, excerpt, content, category, read_time, seo_title, seo_description, published)
VALUES
(
  'art_rehbar_01',
  'the-architecture-of-a-leader',
  'The Architecture of a Leader',
  'Why true guidance demands visible conviction and uncompromising presence.',
  'REHBAR Editorial',
  'July 14, 2026',
  '/images/rehbar-artical-1.png',
  '/images/rehbar-artical-1.png',
  'In every era, the Rehbar emerges not by choice, but by necessity. The word itself carries a weight that transcends simple translation.',
  'In every era, the Rehbar emerges not by choice, but by necessity. The word itself carries a weight that transcends simple translation.',
  'In every era, the Rehbar emerges not by choice, but by necessity. The word itself — رهبر — carries a weight that transcends simple translation. It is not merely "leader." It is the one who walks the path first, who bears the weight of a thousand decisions so that those behind may walk with clarity.\n\nThis design is a statement of that philosophy made tangible. The full-size Rehbar calligraphy sweeps across the chest like a blade cutting through silence — each stroke deliberate, each curve earned. Our creative collective spent three months refining the letterforms until they carried motion within stillness.\n\nThe shadow play within the calligraphy is intentional. Look closely at the upper strokes — they thin at the edges, mimicking the way light falls across the brow of someone carrying responsibility. The diamond-cut negative space at the base of the script represents the foundation of certainty that every true guide must stand upon.\n\nWhen you see someone wearing this on the street — in Toronto, in London, in Karachi — you are not seeing a brand logo. You are seeing a declaration. I walk first. I carry weight. I guide.',
  'Philosophy',
  '4 min read',
  'The Architecture of a Leader — REHBAR Journal',
  'In every era, the Rehbar emerges not by choice, but by necessity. Read our deep dive into the philosophy of leadership and design.',
  true
),
(
  'art_sejjil_02',
  'stones-of-destiny-the-sejjil-philosophy',
  'Stones of Destiny: The Sejjil Philosophy',
  'Baked clay that changed the course of empires. A study of impact and destiny.',
  'REHBAR Editorial',
  'July 10, 2026',
  '/images/sejjil-artical.png',
  '/images/sejjil-artical.png',
  'Sejjil represents the moment where the small overcomes the monolithic. Baked clay that changed the course of empires.',
  'Sejjil represents the moment where the small overcomes the monolithic. Baked clay that changed the course of empires.',
  'Sejjil — سجیل — represents the moment where the small overcomes the monolithic. Baked clay that changed the course of empires. A substance so humble that armies would have laughed at the sight of it, until it became the instrument of their undoing.\n\nThis is not a design born from aesthetics alone. Our design collective studied geological formations for weeks — the way volcanic rock fractures under pressure, the way earth cracks when it has been baked by forces beyond its control. The crimson circle on the back of this shirt is not a logo. It is an impact crater.\n\nLook at the textures within the circle. The cracked, fragmented surface tells you that this object has been through something. It has been forged in fire, shaped by pressure, and delivered with precision. The Arabic script — سجیل — sits within the destruction like a name carved into stone. It does not float above the chaos. It is embedded within it.',
  'Design & History',
  '5 min read',
  'Stones of Destiny: The Sejjil Philosophy — REHBAR Journal',
  'Explore the geological and historical study behind our Sejjil limited edition release.',
  true
),
(
  'art_khyber_03',
  'beyond-the-pass-the-legacy-of-khyber-shikan',
  'Beyond the Pass: The Legacy of Khyber Shikan',
  'To be a Shikan is to master the impossible terrain of life and break through barriers.',
  'REHBAR Editorial',
  'July 05, 2026',
  '/images/khybershikan-artical.png',
  '/images/khybershikan-artical.png',
  'The Khyber Pass has long been the gateway of conquerors. To be a Shikan — a Breaker — is to master the impossible terrain of life.',
  'The Khyber Pass has long been the gateway of conquerors. To be a Shikan — a Breaker — is to master the impossible terrain of life.',
  'The Khyber Pass has long been the gateway of conquerors. A jagged wound carved through the Hindu Kush, it has witnessed the march of Alexander, the campaigns of the Mughals, and the defiance of those who refused to let anyone pass unchallenged. To be a Shikan — a Breaker — is to master the impossible terrain of life.\n\nخیبر شکن. Two words that carry centuries. The calligraphy on the back of this shirt does not sit still. The sweeping blade-form that contains the script moves diagonally across the fabric like a force cutting through resistance. The artist designed it to be read not as text, but as trajectory — a projectile in flight.\n\nAt the chest sits a small, precise Rehbar emblem. Subtle. Almost hidden. This is the quiet declaration: I belong to something. The back tells the world what that something is capable of.',
  'Heritage',
  '6 min read',
  'Beyond the Pass: The Legacy of Khyber Shikan — REHBAR Journal',
  'Discover the duality of calm approach and powerful departure in the Khyber Shikan design.',
  true
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  excerpt = EXCLUDED.excerpt,
  content = EXCLUDED.content,
  category = EXCLUDED.category,
  published = EXCLUDED.published;
`;

const seedSettingsSQL = `
INSERT INTO public.site_settings (key, value)
VALUES 
(
  'store_info',
  '{"store_name":"REHBAR","contact_email":"sales@myrehbar.com","support_phone":"+1 (800) 555-REHB","currency":"USD","announcement_banner":"⚡ FREE SHIPPING ON ORDERS OVER $100 | LIMITED EDITION DROPS ACTIVE","maintenance_mode":false}'::jsonb
),
(
  'seo_settings',
  '{"default_meta_title":"REHBAR | Premium Heavyweight Calligraphic Streetwear","default_meta_description":"Uncompromising calligraphic streetwear designed with intention. 100% heavyweight cotton, limited edition drops, and direct charitable impact with every piece.","og_image":"/images/rehbar-artical-1.png"}'::jsonb
)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
`;

async function main() {
  console.log("Creating database tables and setting up RLS policies...");
  await runQuery(setupSQL);
  console.log("Tables and policies created successfully!");

  console.log("Seeding products ($40 single source of truth)...");
  await runQuery(seedProductsSQL);
  console.log("Products seeded successfully!");

  console.log("Seeding journal articles...");
  await runQuery(seedArticlesSQL);
  console.log("Journal articles seeded successfully!");

  console.log("Seeding site settings...");
  await runQuery(seedSettingsSQL);
  console.log("Site settings seeded successfully!");

  console.log("Checking tables...");
  const res = await runQuery("SELECT slug, title, price, inventory FROM public.products;");
  console.log("Live products in Supabase:", res);
}

main().catch(e => {
  console.error("Setup failed:", e);
  process.exit(1);
});
