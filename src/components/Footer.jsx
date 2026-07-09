const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setEmail("");
    }
  };

  return (
    <footer id="footer" className="bg-[#C4311E] relative">
      <div className="px-6 md:px-16 py-24 md:py-32">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 md:gap-24">
            <div>
              <img 
                src="/images/rehbar-logo-white.png" 
                alt="Rehbar" 
                className="h-16 w-auto mb-8"
              />
              <p className="font-body text-[#E6E2D3]/80 text-lg leading-relaxed max-w-md">
                A quarterly act of community expressed through apparel. Every design is a story. 100 each. $6 to charity. Then they're gone.
              </p>
              <div className="mt-8 font-mono text-xs tracking-[0.2em] text-[#E6E2D3]/50 uppercase">
                Q1 2026 — Drop 001
              </div>
            </div>

            <div className="flex flex-col justify-between">
              <div>
                <h3 className="font-heading text-2xl font-bold text-[#E6E2D3] tracking-wide mb-6">JOIN THE ARCHIVE</h3>
                {submitted ? (
                  <p className="font-mono text-sm text-[#E6E2D3]/80">You're in. Watch your inbox for the next drop.</p>
                ) : (
                  <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="flex-1 bg-[#E6E2D3]/10 border border-[#E6E2D3]/20 text-[#E6E2D3] px-5 py-3 font-mono text-sm placeholder:text-[#E6E2D3]/30 focus:outline-none focus:border-[#E6E2D3]/60"
                    />
                    <button type="submit" className="bg-[#E6E2D3] text-[#C4311E] px-8 py-3 font-heading font-bold text-sm tracking-[0.2em] uppercase hover:bg-[#E6E2D3]/90 transition-colors">
                      Enter
                    </button>
                  </form>
                )}
              </div>

              <div className="mt-12">
                <h3 className="font-heading text-2xl font-bold text-[#E6E2D3] tracking-wide mb-4">CONTACT THE CURATOR</h3>
                <a href="mailto:sales@myrehbar.com" className="font-mono text-sm text-[#E6E2D3]/80 hover:text-[#E6E2D3] transition-colors">sales@myrehbar.com</a>
              </div>
            </div>
          </div>

          <div className="mt-20 pt-8 border-t border-[#E6E2D3]/20 flex flex-col md:flex-row justify-between items-center gap-4">
            <span className="font-mono text-xs text-[#E6E2D3]/40 tracking-wider">© 2026 REHBAR — ALL RIGHTS RESERVED</span>
            <div className="flex gap-8">
              <Link to="/privacy" className="font-mono text-xs text-[#E6E2D3]/40 hover:text-[#E6E2D3] tracking-wider transition-colors">PRIVACY</Link>
              <Link to="/terms" className="font-mono text-xs text-[#E6E2D3]/40 hover:text-[#E6E2D3] tracking-wider transition-colors">TERMS</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}