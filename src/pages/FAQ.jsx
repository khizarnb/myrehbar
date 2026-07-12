import React, { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Plus, Minus } from "lucide-react";

const FAQS = [
  {
    q: "What does '100 units each' actually mean?",
    a: "Every design in the Artifact Collection is produced in a single run of exactly 100 pieces. Once those 100 are sold, the design enters the archive and is never reprinted. When they're gone, they're gone."
  },
  {
    q: "How much goes to charity and who chooses the charity?",
    a: "From every shirt sold, a direct donation (CA$6) goes to a charity of your choosing at checkout. We partner with verified organisations working in humanitarian aid, education, community infrastructure, and food poverty. You can also specify any custom Muslim charity at checkout."
  },
  {
    q: "Where are the shirts made?",
    a: "Every Rehbar shirt begins as yarn in our global studio facility. We knit the fabric, cut it, sew it, and print it in-house. This is how we guarantee consistent quality and fabric that holds up wash after wash."
  },
  {
    q: "What are the shirt specifications?",
    a: "All shirts are 100% premium heavyweight cotton at 280 GSM with a relaxed oversized fit. Prints are either screen printed or DTG digital depending on the design. Each piece is crafted with purpose and care."
  },
  {
    q: "How do I know what size to order?",
    a: "Our shirts have a relaxed oversized fit. If you prefer a standard fit, order your usual size. For a more fitted look, consider sizing down. All sizes (S–XXL) are available unless a particular size has sold out within the limited release."
  },
  {
    q: "How much is shipping and how long does it take?",
    a: "Shipping is CA$10 flat rate. Orders are processed within 1–2 business days and typically arrive within 5–10 business days depending on your location."
  },
  {
    q: "What is your return policy?",
    a: "Due to the limited-edition nature of each release, all sales are final. If your shirt arrives damaged or defective, contact us at sales@myrehbar.com within 7 days of receiving your order and we will make it right."
  },
  {
    q: "Who designs the artwork?",
    a: "Our designs are created by talented calligraphers and designers from across the globe. We celebrate their craftsmanship, because the spotlight belongs to the story and the wearer."
  },
  {
    q: "Will there be more collections?",
    a: "Yes. Rehbar is an act of community. Each release brings a new collection with new stories. Sign up for the newsletter at the bottom of the page to be notified before each collection."
  },
  {
    q: "How can I contact you?",
    a: "Email us at sales@myrehbar.com. We read every message and respond within 48 hours. You can also reach us through our contact page."
  }
];

function FAQItem({ faq, index }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      viewport={{ once: true }}
      className="border-b border-[#1a1a1a]"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-6 text-left group"
      >
        <span className="font-heading text-lg md:text-xl font-bold text-[#E6E2D3] group-hover:text-[#C4311E] transition-colors pr-6">
          {faq.q}
        </span>
        <span className="flex-shrink-0 text-[#C4311E]">
          {open ? <Minus size={20} /> : <Plus size={20} />}
        </span>
      </button>
      {open && (
        <motion.p
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.3 }}
          className="font-body text-[#E6E2D3]/70 leading-[1.8] pb-6 pr-12"
        >
          {faq.a}
        </motion.p>
      )}
    </motion.div>
  );
}

export default function FAQ() {
  return (
    <div className="bg-[#0F0F0F] min-h-screen">
      <Navbar />

      <div className="pt-32 pb-8 px-6 md:px-16 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <p className="font-mono text-[10px] tracking-[0.5em] text-[#6B6B6B] uppercase mb-4">Questions & Answers</p>
          <h1 className="font-heading text-4xl md:text-6xl font-black tracking-[0.1em] text-[#E6E2D3]">FAQ</h1>
          <div className="w-12 h-px bg-[#C4311E] mx-auto mt-6" />
        </motion.div>
      </div>

      <section className="px-6 md:px-16 py-12 md:py-20">
        <div className="max-w-3xl mx-auto">
          {FAQS.map((faq, i) => (
            <FAQItem key={i} faq={faq} index={i} />
          ))}
        </div>

        <div className="max-w-3xl mx-auto mt-16 text-center border border-[#1a1a1a] p-10">
          <p className="font-mono text-[10px] tracking-[0.5em] text-[#6B6B6B] uppercase mb-4">Still Have Questions?</p>
          <p className="font-body text-lg text-[#E6E2D3]/70 mb-6">We're here to help.</p>
          <Link to="/contact" className="inline-block bg-[#C4311E] hover:bg-[#a02818] text-[#E6E2D3] px-12 py-4 font-heading font-bold text-sm tracking-[0.3em] uppercase transition-colors">
            Contact Us
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}