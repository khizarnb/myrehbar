import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function ProductCard({ product, index }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8, delay: index * 0.15 }}
      viewport={{ once: true, margin: "-100px" }}
      className="relative min-h-screen flex items-center justify-center bg-[#0F0F0F]"
    >
      {/* Vertical metadata strip */}
      <div className="absolute right-3 md:right-8 top-1/2 -translate-y-1/2 hidden md:block z-10">
        <p className="font-mono text-[10px] tracking-[0.3em] text-[#6B6B6B]" style={{ writingMode: "vertical-lr" }}>
          {product.title} — {product.subtitle} — COLLECTION — CA${product.price}
        </p>
      </div>

      <Link
        to={`/product/${product.slug}`}
        className="group relative w-full max-w-5xl mx-6 md:mx-16"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Shadow box image container */}
        <div className="relative overflow-hidden" style={{ boxShadow: "inset 0 0 80px rgba(0,0,0,0.8)" }}>
          <div className="aspect-[3/4] md:aspect-[16/10] overflow-hidden">
            <img
              src={product.heroImage}
              alt={product.title}
              className={`w-full h-full object-cover transition-transform duration-700 ${hovered ? "scale-105" : "scale-100"}`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F0F] via-[#0F0F0F]/20 to-transparent" />
          </div>

          {/* Metadata card overlay */}
          <div className={`absolute bottom-0 left-0 right-0 p-6 md:p-12 transition-all duration-500 ${hovered ? "translate-y-0 opacity-100" : "translate-y-4 opacity-70"}`}>
            <div className="flex items-end justify-between">
              <div>
                <p className="font-mono text-[10px] tracking-[0.4em] text-[#6B6B6B] uppercase mb-2">
                  Limited Edition — Collection
                </p>
                <h2 className="font-heading text-4xl md:text-6xl font-black tracking-[0.1em] text-[#E6E2D3]">
                  {product.title}
                </h2>
                <p className="font-heading text-lg md:text-xl font-light tracking-[0.3em] text-[#E6E2D3]/60 mt-1">
                  {product.subtitle}
                </p>
              </div>
              <div className="text-right">
                <p className="font-heading text-3xl md:text-4xl font-black text-[#C4311E]">
                  CA${product.price}
                </p>
                <p className="font-mono text-[10px] tracking-[0.2em] text-[#6B6B6B] uppercase mt-1">CA</p>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.section>
  );
}