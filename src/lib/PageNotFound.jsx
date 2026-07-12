import React from "react";
import { useLocation, Link } from "react-router-dom";
import { ArrowLeft, Compass } from "lucide-react";

export default function PageNotFound() {
  const location = useLocation();
  const pageName = location.pathname.substring(1);

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-[#E6E2D3] flex flex-col justify-between selection:bg-[#C4311E] selection:text-[#E6E2D3] relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#C4311E]/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Header minimal */}
      <header className="p-6 md:p-12 z-10 flex justify-between items-center border-b border-[#1a1a1a]">
        <Link to="/" className="flex items-center gap-4 group">
          <img src="/images/rehbar-logo-white.png" alt="Rehbar" className="h-8 w-auto opacity-90 group-hover:opacity-100 transition-opacity" />
          <span className="font-mono text-[10px] tracking-[0.3em] text-[#6B6B6B] uppercase">Archive</span>
        </Link>
        <span className="font-mono text-xs tracking-[0.2em] text-[#C4311E] uppercase">404 — Not Found</span>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-16 text-center z-10 max-w-3xl mx-auto">
        <div className="flex items-center justify-center w-16 h-16 rounded-full border border-[#1a1a1a] bg-[#0a0a0a] text-[#C4311E] mb-8 animate-pulse">
          <Compass size={28} />
        </div>

        <p className="font-mono text-xs md:text-sm tracking-[0.3em] text-[#C4311E] uppercase mb-4">
          Uncharted Territory
        </p>

        <h1 className="font-heading text-5xl md:text-7xl font-black tracking-tight text-[#E6E2D3] mb-6">
          THE PATH IS UNCLEAR
        </h1>

        <div className="w-16 h-[1px] bg-[#C4311E] mx-auto mb-6"></div>

        <p className="font-body text-lg md:text-xl text-[#6B6B6B] max-w-xl leading-relaxed mb-10">
          The coordinate <span className="font-mono text-[#E6E2D3] bg-[#1a1a1a] px-2 py-0.5 text-sm">/{pageName}</span> does not exist within the current archive. It may have moved or entered the permanent vault.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md justify-center">
          <Link
            to="/"
            className="flex items-center justify-center gap-3 bg-[#C4311E] hover:bg-[#a02818] text-[#E6E2D3] px-8 py-4 font-heading font-bold text-sm tracking-[0.2em] uppercase transition-colors"
          >
            <ArrowLeft size={16} /> Return to Archive
          </Link>
          <Link
            to="/collection"
            className="flex items-center justify-center gap-3 bg-transparent border border-[#333] hover:border-[#C4311E] text-[#E6E2D3] px-8 py-4 font-heading font-bold text-sm tracking-[0.2em] uppercase transition-colors"
          >
            View Collection
          </Link>
        </div>
      </main>

      {/* Footer minimal */}
      <footer className="p-6 md:p-12 z-10 border-t border-[#1a1a1a] flex flex-col sm:flex-row justify-between items-center gap-4 text-center">
        <span className="font-mono text-[10px] tracking-[0.2em] text-[#6B6B6B] uppercase">© 2026 REHBAR — GLOBAL STUDIO FACILITY</span>
        <div className="flex gap-6 font-mono text-[10px] tracking-[0.2em] text-[#6B6B6B] uppercase">
          <Link to="/contact" className="hover:text-[#E6E2D3] transition-colors">Contact</Link>
          <Link to="/faq" className="hover:text-[#E6E2D3] transition-colors">FAQ</Link>
        </div>
      </footer>
    </div>
  );
}