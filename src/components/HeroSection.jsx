import { db } from '@/api/rehbarClient';

import React from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative h-screen w-full overflow-hidden bg-[#0F0F0F]">
      {/* Background portrait */}
      <div className="absolute inset-0">
        <img
          src="/images/homepage-banner.webp"
          alt="Rehbar"
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0F0F0F]/60 via-transparent to-[#0F0F0F]" />
      </div>

      {/* Brand title layer - Arabic at top, English at bottom */}
      <div className="absolute inset-0 flex flex-col justify-between px-6 md:px-16 pt-24 md:pt-28 pb-16 md:pb-20 pointer-events-none z-10">
        {/* Top: Arabic Rehbar */}
        <motion.div
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="w-full flex justify-center md:justify-start"
        >
          <h1
            className="text-[15vw] md:text-[9.5vw] font-bold text-[#E6E2D3]/90 leading-none select-none drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)]"
            style={{ fontFamily: "var(--font-arabic), 'Amiri', serif", direction: "rtl" }}
          >
            رَهْبَر
          </h1>
        </motion.div>

        {/* Center: Mission / Subtitle */}
        <div className="flex-1 flex items-center justify-center my-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, delay: 0.3 }}
            className="text-center bg-[#0F0F0F]/50 backdrop-blur-sm py-5 px-7 rounded-xl border border-white/10 shadow-2xl"
          >
            <p className="font-mono text-xs md:text-sm tracking-[0.4em] text-[#C4311E] uppercase mb-3 font-semibold">
              Collection — Limited Edition
            </p>
            <p className="font-body text-base md:text-xl text-[#E6E2D3]/90 max-w-lg mx-auto leading-relaxed">
              Apparel for people who lead with purpose.
              <br />
              Every design is a story. Crafted with meaning.
            </p>
          </motion.div>
        </div>

        {/* Bottom: English REHBAR */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="w-full flex justify-center md:justify-end items-end"
        >
          <h1 className="font-heading text-[13vw] md:text-[9vw] font-black tracking-[0.22em] text-[#E6E2D3] leading-none uppercase select-none drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)] mr-[-0.22em]">
            REHBAR
          </h1>
        </motion.div>
      </div>

      {/* Vertical metadata strip */}
      <div className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 hidden md:block">
        <p className="font-mono text-[10px] tracking-[0.3em] text-[#6B6B6B] writing-mode-vertical rotate-180" style={{ writingMode: "vertical-lr", transform: "rotate(180deg)" }}>
          REHBAR — رهبر — COLLECTION — LIMITED EDITION
        </p>
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <a href="#collection">
          <ChevronDown className="text-[#6B6B6B]" size={24} />
        </a>
      </motion.div>
    </section>
  );
}