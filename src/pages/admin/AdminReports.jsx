import React from "react";
import { useOrders, useProducts, useCustomers } from "@/lib/entityData";
import { FileSpreadsheet, Download, CheckCircle2, Package, ShoppingCart, Users, Calendar } from "lucide-react";

export default function AdminReports() {
  const { data: orders = [] } = useOrders();
  const { data: products = [] } = useProducts();
  const { data: customers = [] } = useCustomers();

  const exportOrdersCSV = () => {
    const headers = ["Order Number", "Date", "Customer Name", "Customer Email", "Status", "Payment Method", "Total"];
    const rows = orders.map(o => [
      o.order_number || o.id,
      o.created_date || o.created_at || "",
      `"${(o.customer_name || '').replace(/"/g, '""')}"`,
      o.customer_email || "",
      o.status || "pending",
      o.payment_method || "Credit Card",
      o.total || 0
    ]);
    downloadCSV("rehbar_orders_report.csv", headers, rows);
  };

  const exportProductsCSV = () => {
    const headers = ["ID", "Title", "Category", "Price", "Compare At Price", "SKU", "Stock"];
    const rows = products.map(p => [
      p.id,
      `"${(p.title || '').replace(/"/g, '""')}"`,
      p.category || "Apparel",
      p.price || 0,
      p.compare_at_price || 0,
      p.sku || "",
      p.inventory !== undefined ? p.inventory : (p.stock || 0)
    ]);
    downloadCSV("rehbar_products_report.csv", headers, rows);
  };

  const exportCustomersCSV = () => {
    const headers = ["ID", "Name", "Email", "Phone", "Total Orders", "Total Spent"];
    const rows = customers.map(c => [
      c.id,
      `"${(c.name || '').replace(/"/g, '""')}"`,
      c.email || "",
      c.phone || "",
      c.orders_count || 0,
      c.total_spent || 0
    ]);
    downloadCSV("rehbar_customers_report.csv", headers, rows);
  };

  const downloadCSV = (filename, headers, rows) => {
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      <div className="border-b border-[#1a1a1a] pb-6">
        <h1 className="font-heading text-3xl font-black text-white tracking-wide flex items-center gap-3">
          <FileSpreadsheet className="text-[#C4311E]" size={28} />
          Export & Financial Reports
        </h1>
        <p className="font-body text-xs text-[#888] mt-1">Generate one-click CSV and financial spreadsheets directly from the live Supabase database</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#101010] border border-[#1e1e1e] p-6 rounded-xl flex flex-col justify-between hover:border-[#333] transition-all">
          <div>
            <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 mb-4">
              <ShoppingCart size={24} />
            </div>
            <h3 className="font-heading text-lg font-bold text-white">Full Orders Ledger</h3>
            <p className="font-body text-xs text-[#888] mt-2">
              Exports all {orders.length} transaction records, timestamps, payment statuses, customer addresses, and line item totals.
            </p>
          </div>
          <button
            onClick={exportOrdersCSV}
            className="mt-6 w-full py-3 bg-[#161616] hover:bg-[#C4311E] border border-[#262626] hover:border-[#C4311E] rounded-lg text-white font-mono text-xs uppercase font-bold tracking-wider flex items-center justify-center gap-2 transition-all shadow-md"
          >
            <Download size={16} /> Export Orders CSV
          </button>
        </div>

        <div className="bg-[#101010] border border-[#1e1e1e] p-6 rounded-xl flex flex-col justify-between hover:border-[#333] transition-all">
          <div>
            <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 mb-4">
              <Package size={24} />
            </div>
            <h3 className="font-heading text-lg font-bold text-white">Products & Inventory Audit</h3>
            <p className="font-body text-xs text-[#888] mt-2">
              Exports all {products.length} SKUs, current stock availability, sale pricing vs base pricing, and category mappings.
            </p>
          </div>
          <button
            onClick={exportProductsCSV}
            className="mt-6 w-full py-3 bg-[#161616] hover:bg-[#C4311E] border border-[#262626] hover:border-[#C4311E] rounded-lg text-white font-mono text-xs uppercase font-bold tracking-wider flex items-center justify-center gap-2 transition-all shadow-md"
          >
            <Download size={16} /> Export Catalog CSV
          </button>
        </div>

        <div className="bg-[#101010] border border-[#1e1e1e] p-6 rounded-xl flex flex-col justify-between hover:border-[#333] transition-all">
          <div>
            <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 mb-4">
              <Users size={24} />
            </div>
            <h3 className="font-heading text-lg font-bold text-white">Customer LTV Directory</h3>
            <p className="font-body text-xs text-[#888] mt-2">
              Exports all {customers.length} verified and guest customers with order counts and total cumulative lifetime value (LTV).
            </p>
          </div>
          <button
            onClick={exportCustomersCSV}
            className="mt-6 w-full py-3 bg-[#161616] hover:bg-[#C4311E] border border-[#262626] hover:border-[#C4311E] rounded-lg text-white font-mono text-xs uppercase font-bold tracking-wider flex items-center justify-center gap-2 transition-all shadow-md"
          >
            <Download size={16} /> Export Customers CSV
          </button>
        </div>
      </div>
    </div>
  );
}
