import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import { Shield, Lock, Eye, Server } from "lucide-react";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-[#0F0F0F] text-[#E6E2D3] flex flex-col selection:bg-[#C4311E] selection:text-[#E6E2D3]">
      <Navbar />
      <CartDrawer />

      <main className="flex-1 pt-32 pb-24 px-6 md:px-16 max-w-5xl mx-auto w-full">
        {/* Header Section */}
        <div className="border-b border-[#1a1a1a] pb-12 mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="text-[#C4311E]" size={20} />
            <span className="font-mono text-xs tracking-[0.3em] text-[#C4311E] uppercase">Legal & Compliance</span>
          </div>
          <h1 className="font-heading text-4xl md:text-6xl font-black tracking-tight text-[#E6E2D3] mb-6">
            PRIVACY POLICY
          </h1>
          <p className="font-body text-lg text-[#6B6B6B] leading-relaxed max-w-2xl">
            At Rehbar, we respect the sanctity of your personal data. This document outlines how we collect, safeguard, and utilize your information across our Global Studio Facility and digital platforms.
          </p>
        </div>

        {/* Highlights Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-6">
            <Lock className="text-[#C4311E] mb-4" size={24} />
            <h3 className="font-heading text-base font-bold text-[#E6E2D3] mb-2 uppercase tracking-wide">Encrypted Protocols</h3>
            <p className="font-body text-sm text-[#6B6B6B]">All transactions and communication channels are fortified with industry-standard TLS encryption.</p>
          </div>
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-6">
            <Eye className="text-[#C4311E] mb-4" size={24} />
            <h3 className="font-heading text-base font-bold text-[#E6E2D3] mb-2 uppercase tracking-wide">No Data Selling</h3>
            <p className="font-body text-sm text-[#6B6B6B]">We never sell, rent, or trade your personal contact details or order history to third-party data brokers.</p>
          </div>
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-6">
            <Server className="text-[#C4311E] mb-4" size={24} />
            <h3 className="font-heading text-base font-bold text-[#E6E2D3] mb-2 uppercase tracking-wide">Minimal Retention</h3>
            <p className="font-body text-sm text-[#6B6B6B]">We only retain data necessary to process your orders, fulfill charity allocations, and maintain your archive preferences.</p>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="space-y-12 font-body text-[#E6E2D3]/90 leading-relaxed">
          <section className="border-b border-[#1a1a1a] pb-10">
            <h2 className="font-heading text-2xl font-bold text-[#E6E2D3] tracking-wide mb-4">1. Information We Collect</h2>
            <p className="text-[#6B6B6B] mb-4">
              When you interact with the Rehbar archive, place an order, or submit an inquiry, we collect essential information required to serve you effectively:
            </p>
            <ul className="list-disc list-inside space-y-2 text-[#6B6B6B] ml-2">
              <li><strong className="text-[#E6E2D3]">Contact Data:</strong> Full name, email address, and Phone / WhatsApp number for order verification and fulfillment updates.</li>
              <li><strong className="text-[#E6E2D3]">Shipping Data:</strong> Delivery address and postal code required to dispatch your acquired items worldwide.</li>
              <li><strong className="text-[#E6E2D3]">Charity Allocations:</strong> Your selected charitable organization or custom instructions, to ensure accurate allocation of contributions.</li>
              <li><strong className="text-[#E6E2D3]">Technical Metrics:</strong> Anonymous browser type, device details, and interaction patterns to optimize our digital storefront.</li>
            </ul>
          </section>

          <section className="border-b border-[#1a1a1a] pb-10">
            <h2 className="font-heading text-2xl font-bold text-[#E6E2D3] tracking-wide mb-4">2. How We Use Your Information</h2>
            <p className="text-[#6B6B6B] mb-4">
              We operate strictly for the benefit of our community and archive members. Your data is used exclusively to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-[#6B6B6B] ml-2">
              <li>Process and ship limited-edition apparel orders to your destination.</li>
              <li>Communicate critical dispatch status, tracking numbers, or custom fulfillment updates via Phone / WhatsApp or email.</li>
              <li>Directly allocate and verify charitable contributions associated with your order.</li>
              <li>Respond promptly to inquiries sent via our contact form or customer support lines.</li>
            </ul>
          </section>

          <section className="border-b border-[#1a1a1a] pb-10">
            <h2 className="font-heading text-2xl font-bold text-[#E6E2D3] tracking-wide mb-4">3. Data Sharing & Third Parties</h2>
            <p className="text-[#6B6B6B]">
              We partner with trusted global logistics carriers (such as DHL, FedEx, and regional postal services) solely for the purpose of package delivery. These entities receive only the name, phone number, and address needed to complete the delivery. Payment processing is handled by secure, PCI-compliant payment gateways; we do not store sensitive credit card or banking credentials on our local servers.
            </p>
          </section>

          <section className="border-b border-[#1a1a1a] pb-10">
            <h2 className="font-heading text-2xl font-bold text-[#E6E2D3] tracking-wide mb-4">4. Cookies & Digital Tracking</h2>
            <p className="text-[#6B6B6B]">
              We utilize essential session tokens and local browser storage to keep your shopping cart active, remember your preference settings, and maintain administrative security where applicable. We avoid invasive third-party ad-tracking scripts.
            </p>
          </section>

          <section className="border-b border-[#1a1a1a] pb-10">
            <h2 className="font-heading text-2xl font-bold text-[#E6E2D3] tracking-wide mb-4">5. Your Rights & Modifications</h2>
            <p className="text-[#6B6B6B]">
              You hold full sovereignty over your personal data. At any time, you may request access to, correction of, or complete deletion of your personal records from our database by contacting <a href="mailto:sales@myrehbar.com" className="text-[#C4311E] underline hover:text-[#E6E2D3]">sales@myrehbar.com</a>. We reserve the right to update this policy periodically to reflect evolving regulatory frameworks across Canada, Europe, and Global jurisdictions.
            </p>
          </section>
        </div>

        <div className="mt-16 p-8 bg-[#0a0a0a] border border-[#1a1a1a] text-center">
          <p className="font-mono text-xs text-[#6B6B6B] uppercase tracking-[0.2em] mb-2">Have questions about privacy?</p>
          <a href="mailto:sales@myrehbar.com" className="font-heading font-bold text-[#E6E2D3] hover:text-[#C4311E] transition-colors tracking-wider">
            SALES@MYREHBAR.COM
          </a>
        </div>
      </main>

      <Footer />
    </div>
  );
}
