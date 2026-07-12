import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import { Scale, FileText, CheckCircle, AlertTriangle } from "lucide-react";

export default function Terms() {
  return (
    <div className="min-h-screen bg-[#0F0F0F] text-[#E6E2D3] flex flex-col selection:bg-[#C4311E] selection:text-[#E6E2D3]">
      <Navbar />
      <CartDrawer />

      <main className="flex-1 pt-32 pb-24 px-6 md:px-16 max-w-5xl mx-auto w-full">
        {/* Header Section */}
        <div className="border-b border-[#1a1a1a] pb-12 mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Scale className="text-[#C4311E]" size={20} />
            <span className="font-mono text-xs tracking-[0.3em] text-[#C4311E] uppercase">Legal & Compliance</span>
          </div>
          <h1 className="font-heading text-4xl md:text-6xl font-black tracking-tight text-[#E6E2D3] mb-6">
            TERMS OF SERVICE
          </h1>
          <p className="font-body text-lg text-[#6B6B6B] leading-relaxed max-w-2xl">
            Welcome to the Rehbar archive. By accessing our global digital storefront, exploring our collection, or placing an order, you agree to abide by the terms and conditions set forth below.
          </p>
        </div>

        {/* Key Principles Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-6">
            <CheckCircle className="text-[#C4311E] mb-4" size={24} />
            <h3 className="font-heading text-base font-bold text-[#E6E2D3] mb-2 uppercase tracking-wide">Limited Edition Runs</h3>
            <p className="font-body text-sm text-[#6B6B6B]">Every Rehbar piece is produced in limited numbers. Once an edition sells out, it enters the permanent archive and is not reprinted.</p>
          </div>
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-6">
            <AlertTriangle className="text-[#C4311E] mb-4" size={24} />
            <h3 className="font-heading text-base font-bold text-[#E6E2D3] mb-2 uppercase tracking-wide">Intellectual Property</h3>
            <p className="font-body text-sm text-[#6B6B6B]">All calligraphy, design structures, and narrative content are the exclusive property of Rehbar Studio and protected under global copyright law.</p>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="space-y-12 font-body text-[#E6E2D3]/90 leading-relaxed">
          <section className="border-b border-[#1a1a1a] pb-10">
            <h2 className="font-heading text-2xl font-bold text-[#E6E2D3] tracking-wide mb-4">1. Scope of Agreement</h2>
            <p className="text-[#6B6B6B]">
              These Terms of Service apply to all visitors, registered community members, and purchasers utilizing the Rehbar website (`myrehbar.com` and associated subdomains). By utilizing any portion of our platform, you confirm that you are at least the age of majority in your jurisdiction or have explicit legal guardian consent to make transactions.
            </p>
          </section>

          <section className="border-b border-[#1a1a1a] pb-10">
            <h2 className="font-heading text-2xl font-bold text-[#E6E2D3] tracking-wide mb-4">2. Pricing & Currency</h2>
            <p className="text-[#6B6B6B] mb-4">
              All prices across our digital storefront are displayed in Canadian Dollars (<strong className="text-[#E6E2D3]">CA$</strong>) unless specifically converted by your financial institution. Rehbar reserves the right to adjust pricing for upcoming collections or modify promotional allocations without prior notice. Once an order is confirmed, the agreed-upon checkout price remains guaranteed.
            </p>
          </section>

          <section className="border-b border-[#1a1a1a] pb-10">
            <h2 className="font-heading text-2xl font-bold text-[#E6E2D3] tracking-wide mb-4">3. Order Fulfillment & Shipping</h2>
            <p className="text-[#6B6B6B] mb-4">
              Due to the meticulous nature of our heavyweight cotton garments and custom screen/digital printing:
            </p>
            <ul className="list-disc list-inside space-y-2 text-[#6B6B6B] ml-2">
              <li>Orders are processed within our Global Studio Facility and dispatched via priority courier services.</li>
              <li>Customers are responsible for providing an accurate Phone / WhatsApp number and full delivery address. Rehbar is not liable for delays caused by incomplete recipient contact details.</li>
              <li>For international shipments outside our primary fulfillment zones, import duties or local customs taxes remain the sole responsibility of the recipient as per local customs regulations.</li>
            </ul>
          </section>

          <section className="border-b border-[#1a1a1a] pb-10">
            <h2 className="font-heading text-2xl font-bold text-[#E6E2D3] tracking-wide mb-4">4. Charitable Contributions</h2>
            <p className="text-[#6B6B6B]">
              Rehbar integrates community giving directly into every item acquired. When you select a verified cause or write a custom charity instruction at checkout, we allocate a portion from your purchase to that designated effort. All charitable transfers are documented for transparency. Rehbar makes no claim of tax-deductible receipts on behalf of individual retail purchasers unless explicitly specified under Canadian tax legislation.
            </p>
          </section>

          <section className="border-b border-[#1a1a1a] pb-10">
            <h2 className="font-heading text-2xl font-bold text-[#E6E2D3] tracking-wide mb-4">5. Returns & Exchanges</h2>
            <p className="text-[#6B6B6B]">
              Because our pieces are crafted in limited batches, exchanges are subject to inventory availability. If your item arrives with a structural defect in fabric or print, please contact our support team within 14 days of receipt with photographic proof. We will promptly arrange a replacement or refund upon inspection.
            </p>
          </section>

          <section className="border-b border-[#1a1a1a] pb-10">
            <h2 className="font-heading text-2xl font-bold text-[#E6E2D3] tracking-wide mb-4">6. Limitation of Liability</h2>
            <p className="text-[#6B6B6B]">
              In no event shall Rehbar, its directors, or its creative collective be held liable for indirect, incidental, or consequential damages arising from the use of our website or products. Our total aggregate liability under any circumstance shall not exceed the amount paid by you for the specific item in question.
            </p>
          </section>
        </div>

        <div className="mt-16 p-8 bg-[#0a0a0a] border border-[#1a1a1a] text-center">
          <p className="font-mono text-xs text-[#6B6B6B] uppercase tracking-[0.2em] mb-2">Need clarification on our terms?</p>
          <a href="mailto:sales@myrehbar.com" className="font-heading font-bold text-[#E6E2D3] hover:text-[#C4311E] transition-colors tracking-wider">
            SALES@MYREHBAR.COM
          </a>
        </div>
      </main>

      <Footer />
    </div>
  );
}
