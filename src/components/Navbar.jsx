const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/CartContext";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { cartCount, setIsCartOpen } = useCart();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 100);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${scrolled ? "bg-[#0F0F0F]/95 backdrop-blur-sm border-b border-[#1a1a1a]" : "bg-transparent"}`}>
        <div className="flex items-center justify-between px-6 md:px-12 py-4">
          <Link to="/" className="flex items-center gap-3">
            <img 
              src="https://media.db.com/images/public/user_6a4937b96c5a7751a556e044/15cc808f1_Rehbar-logo-white.png" 
              alt="Rehbar" 
              className="h-8 w-auto invert-0"
            />
          </Link>

          <div className="hidden md:flex items-center gap-10">
            <Link to="/collection" className="font-mono text-xs tracking-[0.3em] text-[#6B6B6B] hover:text-[#E6E2D3] transition-colors uppercase">Collection</Link>
            <Link to="/about" className="font-mono text-xs tracking-[0.3em] text-[#6B6B6B] hover:text-[#E6E2D3] transition-colors uppercase">About</Link>
            <Link to="/journal" className="font-mono text-xs tracking-[0.3em] text-[#6B6B6B] hover:text-[#E6E2D3] transition-colors uppercase">Journal</Link>
            <Link to="/faq" className="font-mono text-xs tracking-[0.3em] text-[#6B6B6B] hover:text-[#E6E2D3] transition-colors uppercase">FAQ</Link>
            <Link to="/contact" className="font-mono text-xs tracking-[0.3em] text-[#6B6B6B] hover:text-[#E6E2D3] transition-colors uppercase">Contact</Link>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={() => setIsCartOpen(true)} className="relative text-[#E6E2D3] hover:text-[#C4311E] transition-colors">
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-[#C4311E] text-[#E6E2D3] text-[10px] font-bold flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </button>
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-[#E6E2D3]">
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-[#0F0F0F] flex flex-col items-center justify-center gap-12">
          <Link to="/" onClick={() => setMenuOpen(false)} className="font-heading text-4xl font-bold tracking-[0.2em] text-[#E6E2D3] hover:text-[#C4311E] transition-colors">HOME</Link>
          <Link to="/collection" onClick={() => setMenuOpen(false)} className="font-heading text-4xl font-bold tracking-[0.2em] text-[#E6E2D3] hover:text-[#C4311E] transition-colors">COLLECTION</Link>
          <Link to="/about" onClick={() => setMenuOpen(false)} className="font-heading text-4xl font-bold tracking-[0.2em] text-[#E6E2D3] hover:text-[#C4311E] transition-colors">ABOUT</Link>
          <Link to="/journal" onClick={() => setMenuOpen(false)} className="font-heading text-4xl font-bold tracking-[0.2em] text-[#E6E2D3] hover:text-[#C4311E] transition-colors">JOURNAL</Link>
          <Link to="/faq" onClick={() => setMenuOpen(false)} className="font-heading text-4xl font-bold tracking-[0.2em] text-[#E6E2D3] hover:text-[#C4311E] transition-colors">FAQ</Link>
          <Link to="/contact" onClick={() => setMenuOpen(false)} className="font-heading text-4xl font-bold tracking-[0.2em] text-[#E6E2D3] hover:text-[#C4311E] transition-colors">CONTACT</Link>
        </div>
      )}
    </>
  );
}