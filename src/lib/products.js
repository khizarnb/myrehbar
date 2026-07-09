const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

export const products = [
  {
    id: "rehbar",
    slug: "rehbar",
    title: "REHBAR",
    subtitle: "THE VANGUARD",
    price: 50,
    edition: "100",
    description: "A masterwork of leadership and vision. This design captures the 'Rehbar' (The Guide) — full-size calligraphic print across the chest. Crafted on premium heavyweight cotton, it represents the unwavering light of guidance in times of obscurity. Only 100 made. When they're gone, they're gone.",
    specs: {
      material: "100% Premium Heavyweight Cotton",
      weight: "280 GSM",
      print: "Full-Size Chest Print — Screen Printed",
      fit: "Relaxed Oversized",
      limited: "100 Units Only",
      charity: "$6 per shirt to a charity you choose"
    },
    images: [
      "https://media.db.com/images/public/user_6a4937b96c5a7751a556e044/f9403fc95_rehbar-artical-1.png",
      "https://media.db.com/images/public/user_6a4937b96c5a7751a556e044/3320ac43e_rehbar-artical-2.png",
      "https://media.db.com/images/public/user_6a4937b96c5a7751a556e044/245fb21a0_rehbar-artical-3.png"
    ],
    heroImage: "https://media.db.com/images/public/user_6a4937b96c5a7751a556e044/f9403fc95_rehbar-artical-1.png",
    blogTitle: "The Architecture of a Leader",
    blogContent: `In every era, the Rehbar emerges not by choice, but by necessity. The word itself — رهبر — carries a weight that transcends simple translation. It is not merely "leader." It is the one who walks the path first, who bears the weight of a thousand decisions so that those behind may walk with clarity.

This design is a statement of that philosophy made tangible. The full-size Rehbar calligraphy sweeps across the chest like a blade cutting through silence — each stroke deliberate, each curve earned. The artist, anonymous by design, spent three months refining the letterforms until they carried motion within stillness.

The shadow play within the calligraphy is intentional. Look closely at the upper strokes — they thin at the edges, mimicking the way light falls across the brow of someone carrying responsibility. The diamond-cut negative space at the base of the script represents the foundation of certainty that every true guide must stand upon.

When you see someone wearing this on the street — in Toronto, in London, in Karachi — you are not seeing a brand logo. You are seeing a declaration. I walk first. I carry weight. I guide.

The full-size print was chosen deliberately over the subtler chest-pocket placement of the Khyber Shikan. This is not about quiet confidence. This is about visible conviction. The Rehbar design does not whisper. It does not need to.

Every shirt from this run is numbered. Every shirt sends $6 to a charity chosen by the person who wears it. Every shirt was made by a community, for a community.

There are only 100. And then the design enters the archive — never to be reprinted, never to be diluted. If you are reading this and your size is still available, the decision is not whether to acquire it. The decision is whether you are ready to wear what it represents.`
  },
  {
    id: "sejjil",
    slug: "sejjil",
    title: "SEJJIL",
    subtitle: "THE IMPACT",
    price: 50,
    edition: "100",
    description: "Inspired by the historical significance of resilience and divine intervention. Sejjil is a study of force and destiny. The cracked-earth texture within the crimson circle conveys unstoppable momentum — the moment where the small overcomes the monolithic. Only 100 made.",
    specs: {
      material: "100% Premium Heavyweight Cotton",
      weight: "280 GSM",
      print: "Full Back Print — DTG Digital",
      fit: "Relaxed Oversized",
      limited: "100 Units Only",
      charity: "$6 per shirt to a charity you choose"
    },
    images: [
      "https://media.db.com/images/public/user_6a4937b96c5a7751a556e044/72e95243c_Sejjil-artical.png",
      "https://media.db.com/images/public/user_6a4937b96c5a7751a556e044/b272a2120_sejjil-artical-1.png",
      "https://media.db.com/images/public/user_6a4937b96c5a7751a556e044/a24027b0d_Sejjil-artical-1.webp"
    ],
    heroImage: "https://media.db.com/images/public/user_6a4937b96c5a7751a556e044/72e95243c_Sejjil-artical.png",
    blogTitle: "Stones of Destiny: The Sejjil Philosophy",
    blogContent: `Sejjil — سجیل — represents the moment where the small overcomes the monolithic. Baked clay that changed the course of empires. A substance so humble that armies would have laughed at the sight of it, until it became the instrument of their undoing.

This is not a design born from aesthetics alone. The artist studied geological formations for weeks — the way volcanic rock fractures under pressure, the way earth cracks when it has been baked by forces beyond its control. The crimson circle on the back of this shirt is not a logo. It is an impact crater.

Look at the textures within the circle. The cracked, fragmented surface tells you that this object has been through something. It has been forged in fire, shaped by pressure, and delivered with precision. The Arabic script — سجیل — sits within the destruction like a name carved into stone. It does not float above the chaos. It is embedded within it.

The choice to place this design on the back was deliberate. The Sejjil story is not one you announce to the world as you approach. It is one that reveals itself as you walk away. It is the aftermath. The impact has already been made. The viewer sees the result.

The color palette — deep crimson against obsidian black — references the earth and fire that created the original Sejjil. There is no blue, no green, no calm. This is a design that exists in the space between destruction and creation.

In the context of the Rehbar quarterly drop, Sejjil occupies a unique position. Where the Rehbar design speaks of guidance, and Khyber Shikan speaks of breaking barriers, Sejjil speaks of the decisive moment itself — the instant where trajectory meets destiny.

Each of the 100 units carries the weight of this narrative. Each sends $6 to a cause chosen by the wearer. And when the run is complete, the Sejjil design enters the Rehbar archive — a closed chapter that only 100 people in the world can claim to have been part of.

The cracked earth on your back is not damage. It is evidence of what you survived.`
  },
  {
    id: "khyber-shikan",
    slug: "khyber-shikan",
    title: "KHYBER SHIKAN",
    subtitle: "THE BREAKER",
    price: 50,
    edition: "100",
    description: "A tribute to the indomitable spirit of the Khyber. This piece is an exercise in structural power and the breaking of barriers. The sweeping calligraphic blade on the back with the subtle Rehbar emblem at the chest — designed for spaces that demand a presence of strength. Only 100 made.",
    specs: {
      material: "100% Premium Heavyweight Cotton",
      weight: "280 GSM",
      print: "Full Back Print + Chest Emblem — Screen Printed",
      fit: "Relaxed Oversized",
      limited: "100 Units Only",
      charity: "$6 per shirt to a charity you choose"
    },
    images: [
      "https://media.db.com/images/public/user_6a4937b96c5a7751a556e044/906beec6f_KhyberShikanartical.png",
      "https://media.db.com/images/public/user_6a4937b96c5a7751a556e044/331b879d3_khyberShikan.png",
      "https://media.db.com/images/public/user_6a4937b96c5a7751a556e044/906beec6f_KhyberShikanartical.png"
    ],
    heroImage: "https://media.db.com/images/public/user_6a4937b96c5a7751a556e044/906beec6f_KhyberShikanartical.png",
    blogTitle: "Beyond the Pass: The Legacy of Khyber Shikan",
    blogContent: `The Khyber Pass has long been the gateway of conquerors. A jagged wound carved through the Hindu Kush, it has witnessed the march of Alexander, the campaigns of the Mughals, and the defiance of those who refused to let anyone pass unchallenged. To be a Shikan — a Breaker — is to master the impossible terrain of life.

خیبر شکن. Two words that carry centuries. The calligraphy on the back of this shirt does not sit still. The sweeping blade-form that contains the script moves diagonally across the fabric like a force cutting through resistance. The artist designed it to be read not as text, but as trajectory — a projectile in flight.

At the chest sits a small, precise Rehbar emblem. Subtle. Almost hidden. This is the quiet declaration: I belong to something. The back tells the world what that something is capable of.

The Khyber Shikan design occupies the space between restraint and eruption. From the front, you see a man in a black shirt with a small emblem. Turn around, and you see the full scope of the statement. This duality — calm approach, powerful departure — is the design philosophy distilled.

The calligraphy itself was rendered to reference the geography it is named after. The vertical stroke mirrors the steep cliff faces of the Pass. The horizontal sweep mimics the road that winds through it. And the flourish at the tail — that rising, defiant curve — represents the moment you emerge on the other side, changed.

In testing, this was consistently the design that drew the most physical reactions. People reached out to touch the back print. They traced the calligraphy with their fingers. It is a design that demands tactile engagement, which is why the screen-print technique was chosen — the ink sits raised on the fabric, creating a texture you can feel.

The front-and-back composition makes this the most complete design in the Q1 drop. Rehbar gives you the statement. Sejjil gives you the impact. Khyber Shikan gives you both — the quiet identity and the bold legacy.

One hundred units. $6 from each to a cause of the wearer's choosing. And then this design, like all Rehbar designs, enters the archive. The Pass remains. The Breaker moves on.`
  }
];