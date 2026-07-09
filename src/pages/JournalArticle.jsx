import React from "react";
import { useParams, Link } from "react-router-dom";
import { useJournalArticleBySlug, useProducts } from "@/lib/entityData";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

export default function JournalArticle() {
  const { slug } = useParams();
  const { data: article, isLoading } = useJournalArticleBySlug(slug);
  const { data: products } = useProducts();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#333] border-t-[#C4311E] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-heading text-4xl font-black text-[#E6E2D3] mb-4">NOT FOUND</h1>
          <Link to="/journal" className="font-mono text-sm text-[#C4311E] hover:text-[#E6E2D3] transition-colors">Return to Journal</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0F0F0F] min-h-screen">
      <Navbar />

      {/* Hero image */}
      <div className="relative h-[60vh] md:h-[70vh] overflow-hidden">
        <img src={article.image} alt={article.title} className="w-full h-full object-cover opacity-45" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F0F] via-[#0F0F0F]/40 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 px-6 md:px-16 pb-12 md:pb-16">
          <Link to="/journal" className="inline-flex items-center gap-2 font-mono text-xs tracking-[0.2em] text-[#6B6B6B] hover:text-[#E6E2D3] transition-colors uppercase mb-6">
            <ArrowLeft size={14} />
            Back to Journal
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <p className="font-mono text-[10px] tracking-[0.5em] text-[#C4311E] uppercase mb-3">
              {article.date}
            </p>
            <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-black tracking-[0.05em] text-[#E6E2D3] leading-tight max-w-4xl">
              {article.title}
            </h1>
            <p className="font-heading text-lg font-light tracking-[0.2em] text-[#E6E2D3]/40 mt-3">{article.subtitle}</p>
          </motion.div>
        </div>
      </div>

      {/* Article body */}
      <article className="relative px-6 md:px-16 py-16 md:py-24">
        {/* Vertical metadata strip */}
        <div className="absolute left-3 md:left-6 top-16 hidden lg:block">
          <p className="font-mono text-[10px] tracking-[0.3em] text-[#6B6B6B]" style={{ writingMode: "vertical-lr", transform: "rotate(180deg)" }}>
            REHBAR JOURNAL — {article.date.toUpperCase()} — رهبر
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <p className="font-body text-xl text-[#E6E2D3]/70 leading-[1.8] mb-12 italic border-l-2 border-[#C4311E] pl-6">
            {article.excerpt}
          </p>

          {article.blocks.map((block, i) => {
            if (block.type === "heading") {
              return (
                <motion.h2
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true, margin: "-50px" }}
                  className="font-heading text-2xl md:text-3xl font-black tracking-wide text-[#E6E2D3] mt-14 mb-6"
                >
                  {block.text}
                </motion.h2>
              );
            }
            // Split multi-line paragraphs
            return block.text.split("\n\n").map((para, j) => (
              <motion.p
                key={`${i}-${j}`}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true, margin: "-50px" }}
                className="font-body text-lg text-[#E6E2D3]/80 leading-[1.8] mb-8"
              >
                {para}
              </motion.p>
            ));
          })}

          {/* Divider */}
          <div className="my-16 flex items-center gap-4">
            <div className="flex-1 h-px bg-[#1a1a1a]" />
            <span className="font-mono text-[10px] tracking-[0.5em] text-[#6B6B6B]">END</span>
            <div className="flex-1 h-px bg-[#1a1a1a]" />
          </div>

          {/* CTA to collection */}
          <div className="text-center">
            <p className="font-mono text-xs tracking-[0.3em] text-[#6B6B6B] uppercase mb-6">Explore the Collection</p>
            <Link
              to="/#collection"
              className="inline-block bg-[#C4311E] hover:bg-[#a02818] text-[#E6E2D3] px-12 py-4 font-heading font-bold text-sm tracking-[0.3em] uppercase transition-colors"
            >
              Drop 001 — $50 USD
            </Link>
          </div>

          {/* Related design stories */}
          <div className="mt-24 border-t border-[#1a1a1a] pt-12">
            <p className="font-mono text-[10px] tracking-[0.5em] text-[#6B6B6B] uppercase mb-8">Design Stories</p>
            <div className="grid md:grid-cols-3 gap-6">
              {(products || []).map(p => (
                <Link key={p.id} to={`/article/${p.slug}`} className="group border border-[#1a1a1a] hover:border-[#333] p-6 transition-colors">
                  <p className="font-mono text-[10px] tracking-[0.3em] text-[#C4311E] uppercase mb-2">{p.title} {p.subtitle}</p>
                  <h3 className="font-heading text-base font-bold text-[#E6E2D3] group-hover:text-[#C4311E] transition-colors leading-tight">{p.blogTitle}</h3>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </article>

      <Footer />
    </div>
  );
}