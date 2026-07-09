import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Mail, MapPin, MessageSquare } from "lucide-react";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.name && form.email && form.message) {
      setSubmitted(true);
      setForm({ name: "", email: "", message: "" });
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
            Questions about a drop, a custom order, or the story behind a design? We read every message.
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
                <p className="font-body text-lg text-[#E6E2D3]/80">In-house facility<br />Pakistan</p>
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
              <div className="border border-[#C4311E] p-10 text-center">
                <p className="font-heading text-2xl font-bold text-[#E6E2D3] mb-3">Message Received</p>
                <p className="font-body text-[#E6E2D3]/60">Thank you for reaching out. We'll respond within 48 hours.</p>
                <button onClick={() => setSubmitted(false)} className="mt-6 font-mono text-xs tracking-[0.3em] text-[#C4311E] hover:text-[#E6E2D3] uppercase transition-colors">Send Another</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="font-mono text-[10px] tracking-[0.3em] text-[#6B6B6B] uppercase block mb-3">Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    className="w-full bg-transparent border border-[#1a1a1a] text-[#E6E2D3] px-5 py-3 font-body text-sm focus:outline-none focus:border-[#C4311E] transition-colors"
                  />
                </div>
                <div>
                  <label className="font-mono text-[10px] tracking-[0.3em] text-[#6B6B6B] uppercase block mb-3">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                    className="w-full bg-transparent border border-[#1a1a1a] text-[#E6E2D3] px-5 py-3 font-body text-sm focus:outline-none focus:border-[#C4311E] transition-colors"
                  />
                </div>
                <div>
                  <label className="font-mono text-[10px] tracking-[0.3em] text-[#6B6B6B] uppercase block mb-3">Message</label>
                  <textarea
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    required
                    rows={5}
                    className="w-full bg-transparent border border-[#1a1a1a] text-[#E6E2D3] px-5 py-3 font-body text-sm focus:outline-none focus:border-[#C4311E] transition-colors resize-none"
                  />
                </div>
                <button type="submit" className="w-full bg-[#C4311E] hover:bg-[#a02818] text-[#E6E2D3] px-8 py-4 font-heading font-bold text-sm tracking-[0.3em] uppercase transition-colors">
                  Send Message
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