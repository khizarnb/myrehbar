const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";

export default function About() {
  return (
    <div className="bg-[#0F0F0F] min-h-screen">
      <Navbar />

      {/* Hero */}
      <div className="relative h-[50vh] overflow-hidden">
        <img
          src="https://media.db.com/images/public/user_6a4937b96c5a7751a556e044/b9a62053a_homepage-banner.webp"
          alt="Rehbar"
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F0F] via-[#0F0F0F]/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 px-6 md:px-16 pb-12 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <p className="font-mono text-[10px] tracking-[0.5em] text-[#C4311E] uppercase mb-3">رهبر — The Guide</p>
            <h1 className="font-heading text-4xl md:text-6xl font-black tracking-[0.1em] text-[#E6E2D3]">ABOUT REHBAR</h1>
          </motion.div>
        </div>
      </div>

      {/* Story */}
      <section className="px-6 md:px-16 py-16 md:py-24">
        <div className="max-w-3xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="font-body text-xl text-[#E6E2D3]/80 leading-[1.8] mb-8 italic border-l-2 border-[#C4311E] pl-6"
          >
            Rehbar means leader. Here is why we built a clothing brand around that word, who it is for, and what every shirt is meant to carry.
          </motion.p>

          <motion.p initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} viewport={{ once: true }} className="font-body text-lg text-[#E6E2D3]/80 leading-[1.8] mb-8">
            There is an individual we kept thinking about while building this brand. The one who steps in when needed. The one who organises the food drive nobody asked them to organise. The one their family calls when something goes wrong, the one who translates at the hospital for an elder they have never met, the one who stays behind to stack the chairs.
          </motion.p>

          <motion.p initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} viewport={{ once: true }} className="font-body text-lg text-[#E6E2D3]/80 leading-[1.8] mb-8">
            They are in Toronto, in London, in Houston, in Birmingham, in New York. They do not call themselves a leader. But that is exactly what they are. And nothing they wear says anything about who they are.
          </motion.p>

          <h2 className="font-heading text-2xl md:text-3xl font-black tracking-wide text-[#E6E2D3] mt-14 mb-6">What Rehbar Means</h2>

          <motion.p initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} viewport={{ once: true }} className="font-body text-lg text-[#E6E2D3]/80 leading-[1.8] mb-8">
            Rehbar is an Urdu and Persian word. It means leader, but not in the corporate sense. A Rehbar is a guide, the one who walks ahead on a road others are unsure of. The word carries responsibility, not rank. Nobody appoints a Rehbar. You become one through conduct, and you stay one only as long as your conduct holds.
          </motion.p>

          <motion.p initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} viewport={{ once: true }} className="font-body text-lg text-[#E6E2D3]/80 leading-[1.8] mb-8">
            We named the brand after the standard, not after ourselves. Every design we release is built on a story from our history where that standard was met: a moment of character, of steadfastness, of help that arrived because someone stood firm.
          </motion.p>

          <h2 className="font-heading text-2xl md:text-3xl font-black tracking-wide text-[#E6E2D3] mt-14 mb-6">Why We Make Everything Ourselves</h2>

          <motion.p initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} viewport={{ once: true }} className="font-body text-lg text-[#E6E2D3]/80 leading-[1.8] mb-8">
            Every Rehbar shirt begins as yarn in our own facility in Pakistan. We knit the fabric, cut it, sew it, and print it. We chose this because it is the only way to control what actually matters to the person wearing the shirt: fabric that feels the same in the tenth wash as the first, print that does not crack, a fit we can hold consistent from drop to drop.
          </motion.p>

          <motion.p initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} viewport={{ once: true }} className="font-body text-lg text-[#E6E2D3]/80 leading-[1.8] mb-8">
            The artists who create our designs are trained calligraphers and designers from within the community. We credit them as a collective and keep them anonymous by their preference and ours, because the spotlight in this brand points at the story and at the wearer, never at a name on a label.
          </motion.p>

          <h2 className="font-heading text-2xl md:text-3xl font-black tracking-wide text-[#E6E2D3] mt-14 mb-6">Why Every Purchase Gives</h2>

          <motion.p initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} viewport={{ once: true }} className="font-body text-lg text-[#E6E2D3]/80 leading-[1.8] mb-8">
            Leadership in our tradition has never been separable from responsibility for others. So we built giving into the structure of the brand rather than bolting it on as marketing. From every shirt sold, a fixed $6 donation goes to a cause you choose at checkout, from verified organisations working in humanitarian aid, education, community infrastructure, and food poverty.
          </motion.p>

          <h2 className="font-heading text-2xl md:text-3xl font-black tracking-wide text-[#E6E2D3] mt-14 mb-6">Why the Drops Are Small</h2>

          <motion.p initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} viewport={{ once: true }} className="font-body text-lg text-[#E6E2D3]/80 leading-[1.8] mb-8">
            Each design is produced in a single run of one hundred pieces and never made again. It is not a tactic. It is how a small in-house operation committed to quality actually works, and it means each design remains what it was made to be: a story carried by a specific set of people, not a logo diluted across thousands.
          </motion.p>

          <div className="my-16 flex items-center gap-4">
            <div className="flex-1 h-px bg-[#1a1a1a]" />
            <span className="font-mono text-[10px] tracking-[0.5em] text-[#6B6B6B]">END</span>
            <div className="flex-1 h-px bg-[#1a1a1a]" />
          </div>

          <div className="text-center">
            <p className="font-mono text-xs tracking-[0.3em] text-[#6B6B6B] uppercase mb-6">Explore the Collection</p>
            <Link to="/collection" className="inline-block bg-[#C4311E] hover:bg-[#a02818] text-[#E6E2D3] px-12 py-4 font-heading font-bold text-sm tracking-[0.3em] uppercase transition-colors">
              Drop 001 — $50 USD
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}