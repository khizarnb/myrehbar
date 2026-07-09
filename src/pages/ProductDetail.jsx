import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useProductBySlug } from "@/lib/entityData";
import { useCart } from "@/lib/CartContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { ArrowLeft, ShoppingBag } from "lucide-react";

const SIZES = ["S", "M", "L", "XL", "XXL"];

export default function ProductDetail() {
  const { slug } = useParams();
  const { data: product, isLoading } = useProductBySlug(slug);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const { addItem, setIsCartOpen } = useCart();
  const navigate = useNavigate();

  const handleAddToCart = () => {
    if (!selectedSize) return;
    addItem(product, selectedSize);
    setIsCartOpen(true);
  };

  const handleBuyNow = () => {
    if (!selectedSize) return;
    addItem(product, selectedSize);
    navigate("/checkout");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#333] border-t-[#C4311E] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-heading text-4xl font-black text-[#E6E2D3] mb-4">NOT FOUND</h1>
          <Link to="/" className="font-mono text-sm text-[#C4311E] hover:text-[#E6E2D3] transition-colors">Return to Archive</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0F0F0F] min-h-screen">
      <Navbar />

      {/* Back link */}
      <div className="pt-20 px-6 md:px-16">
        <Link to="/#collection" className="inline-flex items-center gap-2 font-mono text-xs tracking-[0.2em] text-[#6B6B6B] hover:text-[#E6E2D3] transition-colors uppercase">
          <ArrowLeft size={14} />
          Back to Collection
        </Link>
      </div>

      {/* Product layout */}
      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-120px)]">
        {/* Left — fixed image */}
        <div className="lg:sticky lg:top-0 lg:h-screen lg:w-1/2 flex flex-col">
          <div className="flex-1 relative overflow-hidden" style={{ boxShadow: "inset 0 0 100px rgba(0,0,0,0.6)" }}>
            <motion.img
              key={selectedImage}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              src={product.images[selectedImage]}
              alt={product.title}
              className="w-full h-full object-cover min-h-[50vh] lg:min-h-0"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0F0F0F]/30 hidden lg:block" />
          </div>

          {/* Thumbnails */}
          <div className="flex gap-2 p-4 bg-[#0a0a0a]">
            {product.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedImage(i)}
                className={`w-20 h-20 overflow-hidden border-2 transition-colors ${selectedImage === i ? "border-[#C4311E]" : "border-transparent hover:border-[#333]"}`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Right — scrollable narrative */}
        <div className="lg:w-1/2 px-6 md:px-12 lg:px-16 py-12 lg:py-24">
          <div className="max-w-lg">
            {/* Metadata */}
            <p className="font-mono text-[10px] tracking-[0.4em] text-[#6B6B6B] uppercase mb-4">
              Limited Edition — {product.edition} Units — Q1 2026
            </p>

            <h1 className="font-heading text-5xl md:text-6xl font-black tracking-[0.1em] text-[#E6E2D3] leading-none">
              {product.title}
            </h1>
            <p className="font-heading text-xl font-light tracking-[0.3em] text-[#E6E2D3]/50 mt-2">
              {product.subtitle}
            </p>

            <div className="mt-8 mb-10">
              <span className="font-heading text-4xl font-black text-[#C4311E]">${product.price}</span>
              <span className="font-mono text-xs text-[#6B6B6B] ml-2 tracking-wider">USD</span>
            </div>

            {/* Description */}
            <p className="font-body text-lg text-[#E6E2D3]/80 leading-[1.8]">
              {product.description}
            </p>

            {/* Size selector */}
            <div className="mt-10">
              <h3 className="font-mono text-[10px] tracking-[0.4em] text-[#6B6B6B] uppercase mb-4">Select Size</h3>
              <div className="flex gap-3 flex-wrap">
                {SIZES.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-14 h-14 border font-heading font-bold text-sm transition-colors ${selectedSize === size ? "border-[#C4311E] text-[#C4311E] bg-[#C4311E]/10" : "border-[#1a1a1a] text-[#E6E2D3]/60 hover:border-[#333]"}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Specs */}
            <div className="mt-12 border-t border-[#1a1a1a] pt-8">
              <h3 className="font-mono text-[10px] tracking-[0.4em] text-[#6B6B6B] uppercase mb-6">Technical Specifications</h3>
              <div className="space-y-4">
                {Object.entries(product.specs).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-baseline border-b border-[#1a1a1a] pb-3">
                    <span className="font-mono text-xs tracking-[0.2em] text-[#6B6B6B] uppercase">{key.replace(/_/g, " ")}</span>
                    <span className="font-body text-sm text-[#E6E2D3]/80">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Read the article link */}
            <div className="mt-12">
              <Link
                to={`/article/${product.slug}`}
                className="font-mono text-xs tracking-[0.3em] text-[#C4311E] hover:text-[#E6E2D3] transition-colors uppercase border-b border-[#C4311E] pb-1"
              >
                Read the Article → {product.blogTitle}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed acquire bar */}
      <div className="sticky bottom-0 z-40 bg-[#0F0F0F]/95 backdrop-blur-sm border-t border-[#1a1a1a]">
        <div className="flex items-center justify-between px-6 md:px-16 py-4">
          <div className="hidden md:flex items-center gap-4">
            <span className="font-heading text-lg font-bold text-[#E6E2D3] tracking-wider">{product.title}</span>
            {selectedSize && <span className="font-mono text-xs text-[#C4311E]">SIZE {selectedSize}</span>}
            {!selectedSize && <span className="font-mono text-xs text-[#6B6B6B]">SELECT SIZE TO ORDER</span>}
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <button
              onClick={handleAddToCart}
              disabled={!selectedSize}
              className="flex-1 md:flex-none border border-[#C4311E] text-[#C4311E] disabled:border-[#333] disabled:text-[#6B6B6B] disabled:cursor-not-allowed hover:bg-[#C4311E] hover:text-[#E6E2D3] px-8 py-4 font-heading font-bold text-sm tracking-[0.3em] uppercase transition-colors flex items-center gap-2"
            >
              <ShoppingBag size={16} />
              Add to Cart
            </button>
            <button
              onClick={handleBuyNow}
              disabled={!selectedSize}
              className="flex-1 md:flex-none bg-[#C4311E] hover:bg-[#a02818] disabled:bg-[#333] disabled:cursor-not-allowed text-[#E6E2D3] px-8 py-4 font-heading font-bold text-sm tracking-[0.3em] uppercase transition-colors"
            >
              Buy Now — ${product.price}
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}