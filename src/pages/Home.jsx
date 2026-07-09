import React from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ProductCard from "@/components/ProductCard";
import Footer from "@/components/Footer";
import { useProducts } from "@/lib/entityData";
import { motion } from "framer-motion";

export default function Home() {
  const { data: products } = useProducts();
  const activeProducts = (products || []).filter(p => p.active !== false);
  return (
    <div className="bg-[#0F0F0F] min-h-screen">
      <Navbar />
      <HeroSection />

      {/* Collection section */}
      <div id="collection" className="pt-8">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="text-center py-16 md:py-24"
        >
          <p className="font-mono text-[10px] tracking-[0.5em] text-[#6B6B6B] uppercase mb-4">
            The Artifact Collection
          </p>
          <h2 className="font-heading text-3xl md:text-5xl font-black tracking-[0.15em] text-[#E6E2D3]">
            Q1 2026
          </h2>
          <div className="w-12 h-px bg-[#C4311E] mx-auto mt-6" />
        </motion.div>

        {activeProducts.map((product, i) => (
          <ProductCard key={product.id} product={product} index={i} />
        ))}
      </div>

      {/* Manifesto strip */}
      <section className="bg-[#0F0F0F] border-y border-[#1a1a1a] py-20 md:py-32 px-6 md:px-16">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <p className="font-mono text-[10px] tracking-[0.5em] text-[#6B6B6B] uppercase mb-8">
              The Manifesto
            </p>
            <blockquote className="font-heading text-2xl md:text-4xl font-light text-[#E6E2D3] leading-relaxed tracking-wide">
              "This is not a clothing brand. It is a quarterly act of community expressed through apparel."
            </blockquote>
            <div className="mt-10 space-y-3">
              <p className="font-mono text-xs tracking-[0.2em] text-[#6B6B6B]">EVERY DESIGN IS A STORY</p>
              <p className="font-mono text-xs tracking-[0.2em] text-[#6B6B6B]">100 UNITS EACH — THEN GONE FOREVER</p>
              <p className="font-mono text-xs tracking-[0.2em] text-[#6B6B6B]">$6 FROM EVERY PURCHASE TO CHARITY</p>
              <p className="font-mono text-xs tracking-[0.2em] text-[#6B6B6B]">ANONYMOUS MUSLIM ARTIST — PAID ROYALTY</p>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}