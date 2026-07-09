import React from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useJournalArticles, useProducts } from "@/lib/entityData";
import { motion } from "framer-motion";

export default function Journal() {
  const { data: journalArticles } = useJournalArticles();
  const { data: products } = useProducts();
  return (
    <div className="bg-[#0F0F0F] min-h-screen">
      <Navbar />

      {/* Header */}
      <div className="pt-32 pb-16 px-6 md:px-16">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <p className="font-mono text-[10px] tracking-[0.5em] text-[#6B6B6B] uppercase mb-4">
              The Journal
            </p>
            <h1 className="font-heading text-5xl md:text-7xl font-black tracking-[0.1em] text-[#E6E2D3] leading-none">
              STORIES
            </h1>
            <div className="w-12 h-px bg-[#C4311E] mx-auto mt-6" />
            <p className="font-body text-lg text-[#E6E2D3]/60 mt-8 max-w-xl mx-auto leading-relaxed">
              Every design carries a story. Here are the stories behind Rehbar and every piece in the collection.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Brand articles */}
      <section className="px-6 md:px-16 pb-16">
        <div className="max-w-6xl mx-auto">
          <p className="font-mono text-[10px] tracking-[0.4em] text-[#6B6B6B] uppercase mb-8">The Brand</p>
          <div className="space-y-8">
            {(journalArticles || []).map(article => (
              <Link key={article.slug} to={`/journal/${article.slug}`} className="group block border border-[#1a1a1a] hover:border-[#C4311E] transition-colors overflow-hidden">
                <div className="grid md:grid-cols-2 gap-0">
                  <div className="relative h-64 md:h-auto overflow-hidden" style={{ boxShadow: "inset 0 0 60px rgba(0,0,0,0.7)" }}>
                    <img src={article.image} alt={article.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-700" />
                  </div>
                  <div className="p-8 md:p-12 flex flex-col justify-center">
                    <p className="font-mono text-[10px] tracking-[0.4em] text-[#C4311E] uppercase mb-3">{article.date}</p>
                    <h2 className="font-heading text-2xl md:text-3xl font-black tracking-wide text-[#E6E2D3] group-hover:text-[#C4311E] transition-colors">{article.title}</h2>
                    <p className="font-heading text-sm font-light tracking-[0.2em] text-[#E6E2D3]/40 mt-2">{article.subtitle}</p>
                    <p className="font-body text-base text-[#E6E2D3]/60 mt-4 leading-relaxed line-clamp-3">{article.excerpt}</p>
                    <span className="font-mono text-xs tracking-[0.3em] text-[#C4311E] mt-6 uppercase group-hover:text-[#E6E2D3] transition-colors">Read →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Design stories */}
      <section className="px-6 md:px-16 py-16 border-t border-[#1a1a1a]">
        <div className="max-w-6xl mx-auto">
          <p className="font-mono text-[10px] tracking-[0.4em] text-[#6B6B6B] uppercase mb-8">Design Stories — Drop 001</p>
          <div className="grid md:grid-cols-3 gap-6">
            {(products || []).map(product => (
              <Link key={product.id} to={`/article/${product.slug}`} className="group block border border-[#1a1a1a] hover:border-[#C4311E] transition-colors overflow-hidden">
                <div className="relative h-72 overflow-hidden" style={{ boxShadow: "inset 0 0 60px rgba(0,0,0,0.8)" }}>
                  <img src={product.heroImage} alt={product.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F0F] to-transparent" />
                </div>
                <div className="p-6">
                  <p className="font-mono text-[10px] tracking-[0.3em] text-[#C4311E] uppercase mb-2">{product.title} {product.subtitle}</p>
                  <h3 className="font-heading text-xl font-bold text-[#E6E2D3] group-hover:text-[#C4311E] transition-colors leading-tight">{product.blogTitle}</h3>
                  <span className="font-mono text-xs tracking-[0.3em] text-[#6B6B6B] mt-4 block group-hover:text-[#E6E2D3] transition-colors uppercase">Read →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}