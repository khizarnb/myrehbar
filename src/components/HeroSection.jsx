const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

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

      {/* Split title */}
      <div className="absolute inset-0 flex flex-col justify-between px-6 md:px-16 py-20 md:py-24 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, x: -60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        >
          <h1 className="font-heading text-[8vw] md:text-[6vw] font-black tracking-[0.15em] text-[#E6E2D3] leading-none">
            REH
          </h1>
        </motion.div>

        <div className="flex-1 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, delay: 0.5 }}
            className="text-center"
          >
            <p className="font-mono text-xs md:text-sm tracking-[0.4em] text-[#6B6B6B] uppercase mb-4">
              Drop 001 — Only 100 Each
            </p>
            <p className="font-body text-lg md:text-xl text-[#E6E2D3]/70 max-w-lg mx-auto leading-relaxed">
              Apparel for people who lead with purpose.
              <br />
              Every design is a story. $50 each. $6 to charity.
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="self-end"
        >
          <h1 className="font-heading text-[8vw] md:text-[6vw] font-black tracking-[0.15em] text-[#E6E2D3] leading-none">
            BAR
          </h1>
        </motion.div>
      </div>

      {/* Vertical metadata strip */}
      <div className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 hidden md:block">
        <p className="font-mono text-[10px] tracking-[0.3em] text-[#6B6B6B] writing-mode-vertical rotate-180" style={{ writingMode: "vertical-lr", transform: "rotate(180deg)" }}>
          REHBAR — رهبر — Q1.2026 — DROP.001 — TORONTO.CA
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