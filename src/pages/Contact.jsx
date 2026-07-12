const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Mail, MapPin, MessageSquare, ShieldCheck, AlertCircle, RefreshCw } from "lucide-react";

const generateCaptcha = () => {
  const isPlus = Math.random() > 0.5;
  const num1 = Math.floor(Math.random() * 12) + 4;
  const num2 = Math.floor(Math.random() * num1) + 1;
  return {
    question: isPlus ? `What is ${num1} + ${num2}?` : `What is ${num1} - ${num2}?`,
    answer: isPlus ? String(num1 + num2) : String(num1 - num2)
  };
};

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [captcha, setCaptcha] = useState(generateCaptcha);
  const [captchaInput, setCaptchaInput] = useState("");
  const [captchaError, setCaptchaError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const refreshCaptcha = () => {
    setCaptcha(generateCaptcha());
    setCaptchaInput("");
    setCaptchaError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCaptchaError("");

    if (captchaInput.trim() !== captcha.answer) {
      setCaptchaError("Incorrect math verification answer. Please try again.");
      return;
    }

    if (form.name && form.email && form.message) {
      setSubmitting(true);
      try {
        await db.entities.ContactMessage.create({
          name: form.name,
          email: form.email,
          phone: form.phone || "",
          message: form.message,
          created_at: new Date().toISOString(),
          read: false
        });
        setSubmitted(true);
        setForm({ name: "", email: "", phone: "", message: "" });
        refreshCaptcha();
      } catch (err) {
        setCaptchaError("Failed to submit message. Please try again later.");
      } finally {
        setSubmitting(false);
      }
    }
  };

  return (
    <div className="bg-[#0F0F0F] min-h-screen">
      <Navbar />

      <div className="pt-32 pb-20 px-6 md:px-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-2xl mx-auto mb-20"
        >
          <p className="font-mono text-[10px] tracking-[0.5em] text-[#6B6B6B] uppercase mb-4">Get in Touch</p>
          <h1 className="font-heading text-4xl md:text-6xl font-black tracking-[0.1em] text-[#E6E2D3] mb-6">
            CONTACT THE CURATOR
          </h1>
          <div className="w-12 h-px bg-[#C4311E] mx-auto mb-8" />
          <p className="font-body text-lg text-[#E6E2D3]/60 leading-relaxed">
            Questions about a drop, a custom order, or the story behind a design? We read every message and respond personally.
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 md:gap-20">
          {/* Contact info */}
          <div className="space-y-10">
            <div className="flex items-start gap-5">
              <div className="w-12 h-12 border border-[#1a1a1a] flex items-center justify-center flex-shrink-0">
                <Mail size={18} className="text-[#C4311E]" />
              </div>
              <div>
                <p className="font-mono text-[10px] tracking-[0.3em] text-[#6B6B6B] uppercase mb-2">Email</p>
                <a href="mailto:sales@myrehbar.com" className="font-body text-lg text-[#E6E2D3] hover:text-[#C4311E] transition-colors">sales@myrehbar.com</a>
              </div>
            </div>

            <div className="flex items-start gap-5">
              <div className="w-12 h-12 border border-[#1a1a1a] flex items-center justify-center flex-shrink-0">
                <MapPin size={18} className="text-[#C4311E]" />
              </div>
              <div>
                <p className="font-mono text-[10px] tracking-[0.3em] text-[#6B6B6B] uppercase mb-2">Studio</p>
                <p className="font-body text-lg text-[#E6E2D3]/80">Global Studio Facility<br />Worldwide</p>
              </div>
            </div>

            <div className="flex items-start gap-5">
              <div className="w-12 h-12 border border-[#1a1a1a] flex items-center justify-center flex-shrink-0">
                <MessageSquare size={18} className="text-[#C4311E]" />
              </div>
              <div>
                <p className="font-mono text-[10px] tracking-[0.3em] text-[#6B6B6B] uppercase mb-2">Response Time</p>
                <p className="font-body text-lg text-[#E6E2D3]/80">Within 48 hours</p>
              </div>
            </div>
          </div>

          {/* Contact form */}
          <div>
            {submitted ? (
              <div className="border border-[#C4311E] p-10 text-center bg-[#0a0a0a]">
                <p className="font-heading text-2xl font-bold text-[#E6E2D3] mb-3">Message Received</p>
                <p className="font-body text-[#E6E2D3]/60 mb-6">Thank you for reaching out. Your inquiry has been delivered directly to our dashboard.</p>
                <button onClick={() => setSubmitted(false)} className="font-mono text-xs tracking-[0.3em] text-[#C4311E] hover:text-[#E6E2D3] uppercase transition-colors">Send Another Message</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6 bg-[#0a0a0a] border border-[#1a1a1a] p-8">
                {captchaError && (
                  <div className="p-3 bg-[#C4311E]/10 border border-[#C4311E]/30 flex items-center gap-3 text-[#C4311E] text-xs font-mono">
                    <AlertCircle size={16} className="shrink-0" />
                    <span>{captchaError}</span>
                  </div>
                )}

                <div>
                  <label className="font-mono text-[10px] tracking-[0.3em] text-[#6B6B6B] uppercase block mb-3">Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    placeholder="Your Full Name"
                    className="w-full bg-[#111] border border-[#1a1a1a] text-[#E6E2D3] px-5 py-3 font-body text-sm focus:outline-none focus:border-[#C4311E] transition-colors placeholder:text-[#444]"
                  />
                </div>
                <div>
                  <label className="font-mono text-[10px] tracking-[0.3em] text-[#6B6B6B] uppercase block mb-3">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                    placeholder="you@example.com"
                    className="w-full bg-[#111] border border-[#1a1a1a] text-[#E6E2D3] px-5 py-3 font-body text-sm focus:outline-none focus:border-[#C4311E] transition-colors placeholder:text-[#444]"
                  />
                </div>
                <div>
                  <label className="font-mono text-[10px] tracking-[0.3em] text-[#6B6B6B] uppercase block mb-3">Phone / WhatsApp Number</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="w-full bg-[#111] border border-[#1a1a1a] text-[#E6E2D3] px-5 py-3 font-body text-sm focus:outline-none focus:border-[#C4311E] transition-colors placeholder:text-[#444]"
                  />
                </div>
                <div>
                  <label className="font-mono text-[10px] tracking-[0.3em] text-[#6B6B6B] uppercase block mb-3">Message</label>
                  <textarea
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    required
                    rows={4}
                    placeholder="Tell us about what you're looking for..."
                    className="w-full bg-[#111] border border-[#1a1a1a] text-[#E6E2D3] px-5 py-3 font-body text-sm focus:outline-none focus:border-[#C4311E] transition-colors resize-none placeholder:text-[#444]"
                  />
                </div>

                {/* Math Captcha / Robot Verification */}
                <div className="pt-2 border-t border-[#1a1a1a]">
                  <div className="flex items-center justify-between mb-2">
                    <label className="font-mono text-[10px] tracking-[0.3em] text-[#C4311E] uppercase flex items-center gap-1.5">
                      <ShieldCheck size={14} />
                      Verify You Are Human
                    </label>
                    <button
                      type="button"
                      onClick={refreshCaptcha}
                      className="text-[#6B6B6B] hover:text-[#E6E2D3] text-[10px] font-mono flex items-center gap-1 transition-colors"
                    >
                      <RefreshCw size={11} /> New Question
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-[#181818] border border-[#262626] px-4 py-2.5 font-mono font-bold text-sm text-[#E6E2D3] select-none tracking-wider shrink-0">
                      {captcha.question}
                    </div>
                    <input
                      type="number"
                      value={captchaInput}
                      onChange={(e) => setCaptchaInput(e.target.value)}
                      required
                      placeholder="Answer"
                      className="w-full bg-[#111] border border-[#1a1a1a] text-[#E6E2D3] px-4 py-2.5 font-mono text-sm focus:outline-none focus:border-[#C4311E] transition-colors placeholder:text-[#444]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#C4311E] hover:bg-[#a02818] text-[#E6E2D3] px-8 py-4 font-heading font-bold text-sm tracking-[0.3em] uppercase transition-colors disabled:opacity-50"
                >
                  {submitting ? "Sending..." : "Send Message"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}