-- ====================================================================
-- SUPABASE DATA IMPORT & SYNC SCRIPT (GENERATED FROM LIVE BASE44 DATA)
-- Copy and paste this entire script into your Supabase SQL Editor and run!
-- ====================================================================

-- Ensure required columns exist on products table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS "blogTitle" TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS "blogContent" TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS "inventory" INTEGER DEFAULT 100;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS "active" BOOLEAN DEFAULT true;

-- Import Products
INSERT INTO public.products (id, slug, title, subtitle, price, edition, description, specs, images, "heroImage", "inventory", "blogTitle", "blogContent", "active")
VALUES (
  '6a4fbf02508a18fce23927c9',
  'rehbar',
  'REHBAR',
  'THE VANGUARD',
  50,
  '100',
  'A masterwork of leadership and vision. This design captures the ''Rehbar'' (The Guide) — full-size calligraphic print across the chest. Crafted on premium heavyweight cotton, it represents the unwavering light of guidance in times of obscurity. Only 100 made. When they''re gone, they''re gone.',
  '{"material":"100% Premium Heavyweight Cotton","weight":"280 GSM","print":"Full-Size Chest Print — Screen Printed","fit":"Relaxed Oversized","limited":"100 Units Only","charity":"$6 per shirt to a charity you choose"}'::jsonb,
  '["/images/rehbar-artical-1.png","/images/rehbar-artical-2.png","/images/rehbar-artical-3.png"]'::jsonb,
  '/images/rehbar-artical-1.png',
  100,
  'The Architecture of a Leader',
  'In every era, the Rehbar emerges not by choice, but by necessity. The word itself — رهبر — carries a weight that transcends simple translation. It is not merely "leader." It is the one who walks the path first, who bears the weight of a thousand decisions so that those behind may walk with clarity.

This design is a statement of that philosophy made tangible. The full-size Rehbar calligraphy sweeps across the chest like a blade cutting through silence — each stroke deliberate, each curve earned. The artist, anonymous by design, spent three months refining the letterforms until they carried motion within stillness.

The shadow play within the calligraphy is intentional. Look closely at the upper strokes — they thin at the edges, mimicking the way light falls across the brow of someone carrying responsibility. The diamond-cut negative space at the base of the script represents the foundation of certainty that every true guide must stand upon.

When you see someone wearing this on the street — in Toronto, in London, in Karachi — you are not seeing a brand logo. You are seeing a declaration. I walk first. I carry weight. I guide.

The full-size print was chosen deliberately over the subtler chest-pocket placement of the Khyber Shikan. This is not about quiet confidence. This is about visible conviction. The Rehbar design does not whisper. It does not need to.

Every shirt from this run is numbered. Every shirt sends $6 to a charity chosen by the person who wears it. Every shirt was made by a community, for a community.

There are only 100. And then the design enters the archive — never to be reprinted, never to be diluted. If you are reading this and your size is still available, the decision is not whether to acquire it. The decision is whether you are ready to wear what it represents.',
  true
)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  price = EXCLUDED.price,
  edition = EXCLUDED.edition,
  description = EXCLUDED.description,
  specs = EXCLUDED.specs,
  images = EXCLUDED.images,
  "heroImage" = EXCLUDED."heroImage",
  "inventory" = EXCLUDED."inventory",
  "blogTitle" = EXCLUDED."blogTitle",
  "blogContent" = EXCLUDED."blogContent",
  "active" = EXCLUDED."active";

INSERT INTO public.products (id, slug, title, subtitle, price, edition, description, specs, images, "heroImage", "inventory", "blogTitle", "blogContent", "active")
VALUES (
  '6a4fbf02508a18fce23927ca',
  'sejjil',
  'SEJJIL',
  'THE IMPACT',
  50,
  '100',
  'Inspired by the historical significance of resilience and divine intervention. Sejjil is a study of force and destiny. The cracked-earth texture within the crimson circle conveys unstoppable momentum — the moment where the small overcomes the monolithic. Only 100 made.',
  '{"material":"100% Premium Heavyweight Cotton","weight":"280 GSM","print":"Full Back Print — DTG Digital","fit":"Relaxed Oversized","limited":"100 Units Only","charity":"$6 per shirt to a charity you choose"}'::jsonb,
  '["/images/sejjil-artical.png","/images/sejjil-artical-1.png","/images/sejjil-artical-1.webp"]'::jsonb,
  '/images/sejjil-artical.png',
  100,
  'Stones of Destiny: The Sejjil Philosophy',
  'Sejjil — سجیل — represents the moment where the small overcomes the monolithic. Baked clay that changed the course of empires. A substance so humble that armies would have laughed at the sight of it, until it became the instrument of their undoing.

This is not a design born from aesthetics alone. The artist studied geological formations for weeks — the way volcanic rock fractures under pressure, the way earth cracks when it has been baked by forces beyond its control. The crimson circle on the back of this shirt is not a logo. It is an impact crater.

Look at the textures within the circle. The cracked, fragmented surface tells you that this object has been through something. It has been forged in fire, shaped by pressure, and delivered with precision. The Arabic script — سجیل — sits within the destruction like a name carved into stone. It does not float above the chaos. It is embedded within it.

The choice to place this design on the back was deliberate. The Sejjil story is not one you announce to the world as you approach. It is one that reveals itself as you walk away. It is the aftermath. The impact has already been made. The viewer sees the result.

The color palette — deep crimson against obsidian black — references the earth and fire that created the original Sejjil. There is no blue, no green, no calm. This is a design that exists in the space between destruction and creation.

In the context of the Rehbar quarterly drop, Sejjil occupies a unique position. Where the Rehbar design speaks of guidance, and Khyber Shikan speaks of breaking barriers, Sejjil speaks of the decisive moment itself — the instant where trajectory meets destiny.

Each of the 100 units carries the weight of this narrative. Each sends $6 to a cause chosen by the wearer. And when the run is complete, the Sejjil design enters the Rehbar archive — a closed chapter that only 100 people in the world can claim to have been part of.

The cracked earth on your back is not damage. It is evidence of what you survived.',
  true
)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  price = EXCLUDED.price,
  edition = EXCLUDED.edition,
  description = EXCLUDED.description,
  specs = EXCLUDED.specs,
  images = EXCLUDED.images,
  "heroImage" = EXCLUDED."heroImage",
  "inventory" = EXCLUDED."inventory",
  "blogTitle" = EXCLUDED."blogTitle",
  "blogContent" = EXCLUDED."blogContent",
  "active" = EXCLUDED."active";

INSERT INTO public.products (id, slug, title, subtitle, price, edition, description, specs, images, "heroImage", "inventory", "blogTitle", "blogContent", "active")
VALUES (
  '6a4fbf02508a18fce23927cb',
  'khyber-shikan',
  'KHYBER SHIKAN',
  'THE BREAKER',
  50,
  '100',
  'A tribute to the indomitable spirit of the Khyber. This piece is an exercise in structural power and the breaking of barriers. The sweeping calligraphic blade on the back with the subtle Rehbar emblem at the chest — designed for spaces that demand a presence of strength. Only 100 made.',
  '{"material":"100% Premium Heavyweight Cotton","weight":"280 GSM","print":"Full Back Print + Chest Emblem — Screen Printed","fit":"Relaxed Oversized","limited":"100 Units Only","charity":"$6 per shirt to a charity you choose"}'::jsonb,
  '["/images/khybershikan-artical.png","/images/khybershikan.png","/images/khybershikan-artical.png"]'::jsonb,
  '/images/khybershikan-artical.png',
  100,
  'Beyond the Pass: The Legacy of Khyber Shikan',
  'The Khyber Pass has long been the gateway of conquerors. A jagged wound carved through the Hindu Kush, it has witnessed the march of Alexander, the campaigns of the Mughals, and the defiance of those who refused to let anyone pass unchallenged. To be a Shikan — a Breaker — is to master the impossible terrain of life.

خیبر شکن. Two words that carry centuries. The calligraphy on the back of this shirt does not sit still. The sweeping blade-form that contains the script moves diagonally across the fabric like a force cutting through resistance. The artist designed it to be read not as text, but as trajectory — a projectile in flight.

At the chest sits a small, precise Rehbar emblem. Subtle. Almost hidden. This is the quiet declaration: I belong to something. The back tells the world what that something is capable of.

The Khyber Shikan design occupies the space between restraint and eruption. From the front, you see a man in a black shirt with a small emblem. Turn around, and you see the full scope of the statement. This duality — calm approach, powerful departure — is the design philosophy distilled.

The calligraphy itself was rendered to reference the geography it is named after. The vertical stroke mirrors the steep cliff faces of the Pass. The horizontal sweep mimics the road that winds through it. And the flourish at the tail — that rising, defiant curve — represents the moment you emerge on the other side, changed.

In testing, this was consistently the design that drew the most physical reactions. People reached out to touch the back print. They traced the calligraphy with their fingers. It is a design that demands tactile engagement, which is why the screen-print technique was chosen — the ink sits raised on the fabric, creating a texture you can feel.

The front-and-back composition makes this the most complete design in the Q1 drop. Rehbar gives you the statement. Sejjil gives you the impact. Khyber Shikan gives you both — the quiet identity and the bold legacy.

One hundred units. $6 from each to a cause of the wearer''s choosing. And then this design, like all Rehbar designs, enters the archive. The Pass remains. The Breaker moves on.',
  true
)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  price = EXCLUDED.price,
  edition = EXCLUDED.edition,
  description = EXCLUDED.description,
  specs = EXCLUDED.specs,
  images = EXCLUDED.images,
  "heroImage" = EXCLUDED."heroImage",
  "inventory" = EXCLUDED."inventory",
  "blogTitle" = EXCLUDED."blogTitle",
  "blogContent" = EXCLUDED."blogContent",
  "active" = EXCLUDED."active";

-- Import Journal Articles
INSERT INTO public.journal_articles (id, slug, title, subtitle, "metaTitle", excerpt, image, date, blocks)
VALUES (
  '6a4fbf02c36addc8bbbcf0d2',
  'why-we-built-rehbar',
  'Why We Built Rehbar',
  'The Story Behind the Brand',
  'Why We Built Rehbar',
  'Rehbar means leader. Here is why we built a clothing brand around that word, who it is for, and what every shirt is meant to carry.',
  '/images/homepage-banner.webp',
  'Drop 001 — Journal',
  '[{"type":"paragraph","text":"There is an individual we kept thinking about while building this brand."},{"type":"paragraph","text":"They are the ones who step in when needed. The one who organises the food drive nobody asked them to organise. The one their family call when something goes wrong, the one who translates at the hospital for an elder they have never met, the one who stays behind to stack the chairs. They is in Toronto, in London, in Houston, in Birmingham, in New York. They do not call themselves a leader."},{"type":"paragraph","text":"But that is exactly what they are. And nothing they wear says anything about who they are."},{"type":"heading","text":"The gap we could not stop seeing"},{"type":"paragraph","text":"Walk through what is available to a young Muslims who want to wear their clothing to say something true about them. On one side there is mass streetwear, built on logos that mean nothing and drops engineered to manufacture want. On the other side there is a thin category of Islamic apparel that too often treats faith as a slogan printed on the cheapest blank shirt a print-on-demand warehouse can source."},{"type":"paragraph","text":"Neither of these were made for the individuals we kept thinking about. Their identity is not a costume and not a slogan. It is a history they carry: of scholarship, of sacrifice, of stories their grandmother told them, of a language whose calligraphy is among the most beautiful things humans have ever drawn. They deserved clothing made with the same seriousness they bring to their own life."},{"type":"paragraph","text":"So we built it."},{"type":"heading","text":"What Rehbar means"},{"type":"paragraph","text":"Rehbar is an Urdu and Persian word. It means leader, but not in the corporate sense of the word. A Rehbar is a guide, the one who walks ahead on a road others are unsure of. The word carries responsibility, not rank. Nobody appoints a Rehbar. You become one through conduct, and you stay one only as long as your conduct holds."},{"type":"paragraph","text":"We named the brand after the standard, not after ourselves. Every design we release is built on a story from our history where that standard was met: a moment of character, of steadfastness, of help that arrived because someone stood firm. When you wear one of these pieces, you are not advertising a company. You are carrying a story that belongs to you, and quietly agreeing to live up to it."},{"type":"heading","text":"Why we make everything ourselves"},{"type":"paragraph","text":"Every Rehbar shirt begins as yarn in our own facility in Pakistan. We knit the fabric, cut it, sew it, and print it. We did not choose this because it is easy. We chose it because it is the only way to control what actually matters to the person wearing the shirt: fabric that feels the same in the tenth wash as the first, print that does not crack, a fit we can hold consistent from drop to drop because no anonymous factory sits between our intention and your wardrobe."},{"type":"paragraph","text":"It also means the craft lives where much of our audience has roots. The artists who create our designs are trained calligraphers and designers from within the community. We credit them as a collective and keep them anonymous by their preference and ours, because the spotlight in this brand points at the story and at the wearer, never at a name on a label."},{"type":"paragraph","text":"We aren''t a brand to be worn for 10 days or a month or a season. We are movement."},{"type":"heading","text":"Why every purchase gives"},{"type":"paragraph","text":"Leadership in our tradition has never been separable from responsibility for others. So we built giving into the structure of the brand rather than bolting it on as marketing. From every shirt sold, a fixed donation goes to a cause you choose at checkout, from verified organisations working in humanitarian aid, education, community infrastructure, and food poverty. Every donation is logged publicly with receipts. You will never have to take our word for it."},{"type":"heading","text":"Why the drops are small"},{"type":"paragraph","text":"Each design is produced in a single run of one hundred pieces and never made again. We want to be straightforward about why. It is not a tactic. It is how a small in-house operation committed to quality actually works, and it means each design remains what it was made to be: a story carried by a specific set of people, not a logo diluted across thousands."},{"type":"heading","text":"The invitation"},{"type":"paragraph","text":"Drop 001 carries three stories. One is our name and the standard it sets. One is the title earned by a man chosen for the sincerity of his heart when every other attempt had failed. One is the help that came from the sky when a community stood firm against an army it could not fight."},{"type":"paragraph","text":"Read them. They were yours before we ever printed them. We just gave them a form you can wear.\n\nExplore Drop 001 and the stories behind each design in the journal."}]'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  "metaTitle" = EXCLUDED."metaTitle",
  excerpt = EXCLUDED.excerpt,
  image = EXCLUDED.image,
  date = EXCLUDED.date,
  blocks = EXCLUDED.blocks;

