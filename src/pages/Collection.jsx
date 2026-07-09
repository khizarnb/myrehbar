import React from "react";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import Footer from "@/components/Footer";
import { useProducts } from "@/lib/entityData";
import { motion } from "framer-motion";

export default function Collection() {
  const { data: products } = useProducts();
  const activeProducts = (products || []).filter(p => p.active !== false);
  return (
    <div className="bg-[#0F0F0F] min-h-screen">
      <Navbar />

      <div className="pt-32 pb-8 px-6 md:px-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <p className="font-mono text-[10px] tracking-[0.5em] text-[#6B6B6B] uppercase mb-4">
            The Artifact Collection
          </p>
          <h1 className="font-heading text-4xl md:text-6xl font-black tracking-[0.15em] text-[#E6E2D3]">
            Q1 2026
          </h1>
          <div className="w-12 h-px bg-[#C4311E] mx-auto mt-6" />
          <p className="font-body text-lg text-[#E6E2D3]/60 max-w-xl mx-auto mt-8 leading-relaxed">
            Every design is a story. 100 units each. Then gone forever.
          </p>
        </motion.div>
      </div>

      {activeProducts.map((product, i) => (
        <ProductCard key={product.id} product={product} index={i} />
      ))}

      <Footer />
    </div>
  );
}