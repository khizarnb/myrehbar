const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { LogIn, Lock, Mail, AlertCircle, ArrowRight } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("admin@myrehbar.com");
  const [password, setPassword] = useState("-S.qtDr2-y@2pkf");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await db.auth.loginViaEmailPassword(email, password);
      window.location.href = "/admin";
    } catch (err) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0F0F] flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-[#0a0a0a] border border-[#1a1a1a] p-8 md:p-10 shadow-2xl relative">
        {/* Top Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#C4311E]" />

        <div className="text-center mb-10">
          <Link to="/" className="font-heading text-2xl font-black tracking-[0.2em] text-[#E6E2D3] block">
            REHBAR
          </Link>
          <p className="font-mono text-[10px] tracking-[0.3em] text-[#6B6B6B] uppercase mt-1">
            ADMIN PANEL LOG IN
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-[#C4311E]/10 border border-[#C4311E]/30 flex items-start gap-3 text-[#C4311E] text-xs font-mono">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="font-mono text-[10px] tracking-[0.3em] text-[#6B6B6B] uppercase block mb-2">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B6B6B]" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@myrehbar.com"
                className="w-full bg-[#111] border border-[#1a1a1a] text-[#E6E2D3] pl-11 pr-4 py-3 font-body text-sm focus:outline-none focus:border-[#C4311E] transition-colors placeholder:text-[#444]"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="password" className="font-mono text-[10px] tracking-[0.3em] text-[#6B6B6B] uppercase">
                Password
              </label>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B6B6B]" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#111] border border-[#1a1a1a] text-[#E6E2D3] pl-11 pr-4 py-3 font-body text-sm focus:outline-none focus:border-[#C4311E] transition-colors placeholder:text-[#444]"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#C4311E] hover:bg-[#a02818] text-[#E6E2D3] py-3.5 font-heading font-bold text-sm tracking-[0.2em] uppercase transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Enter Dashboard
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-[#1a1a1a] text-center">
          <Link to="/" className="font-mono text-xs tracking-[0.2em] text-[#6B6B6B] hover:text-[#E6E2D3] uppercase transition-colors">
            ← Return to Storefront
          </Link>
        </div>
      </div>
    </div>
  );
}
