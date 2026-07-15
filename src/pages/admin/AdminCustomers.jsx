import React, { useState, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { useCustomers } from "@/lib/entityData";
import { Users, Search, Download, FileSpreadsheet, ArrowUpDown, Mail, Phone, MapPin, Calendar, ShieldAlert } from "lucide-react";

export default function AdminCustomers() {
  const context = useOutletContext() || {};
  const { activeRole = "super_admin", searchQuery: globalSearch = "" } = context;
  const { data: customers, isLoading } = useCustomers();

  const [localSearch, setLocalSearch] = useState("");
  const [sortBy, setSortBy] = useState("spent_desc"); // spent_desc, orders_desc, name_asc, date_desc

  const filteredCustomers = useMemo(() => {
    let list = (customers || []).filter(c => {
      const q = (localSearch || globalSearch).toLowerCase();
      if (q && !(
        c.name?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.phone?.toLowerCase().includes(q) ||
        c.city?.toLowerCase().includes(q) ||
        c.country?.toLowerCase().includes(q)
      )) {
        return false;
      }
      return true;
    });

    return list.sort((a, b) => {
      if (sortBy === "spent_desc") return (b.total_spent || 0) - (a.total_spent || 0);
      if (sortBy === "orders_desc") return (b.total_orders || 0) - (a.total_orders || 0);
      if (sortBy === "name_asc") return (a.name || "").localeCompare(b.name || "");
      if (sortBy === "date_desc") return new Date(b.last_order_date || 0) - new Date(a.last_order_date || 0);
      return 0;
    });
  }, [customers, localSearch, globalSearch, sortBy]);

  const exportCustomers = (format) => {
    if (!filteredCustomers.length) return;
    const headers = ["Customer ID", "Name", "Email", "Phone", "City", "Country", "Total Orders", "Total Spent ($)", "Last Order Date", "Role/Status"];
    const rows = filteredCustomers.map(c => [
      `"${c.id}"`,
      `"${c.name}"`,
      `"${c.email}"`,
      `"${c.phone}"`,
      `"${c.city}"`,
      `"${c.country}"`,
      c.total_orders,
      Number(c.total_spent || 0).toFixed(2),
      `"${new Date(c.last_order_date).toLocaleDateString()}"`,
      `"${c.role || 'customer'}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Rehbar_Customers_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (activeRole === "customer" || activeRole === "staff") {
    return (
      <div className="bg-[#121212] border border-[#222] rounded-xl p-8 text-center max-w-xl mx-auto my-12">
        <ShieldAlert className="mx-auto mb-4 text-amber-500" size={48} />
        <h2 className="font-heading text-2xl font-black text-white mb-2">Access Restricted</h2>
        <p className="font-body text-sm text-[#888]">
          Only Super Admin, Admin, or Manager roles can view customer profiles and total spending analytics.
        </p>
      </div>
    );
  }

  const totalCustomersCount = filteredCustomers.length;
  const totalCustomerSpending = filteredCustomers.reduce((sum, c) => sum + Number(c.total_spent || 0), 0);
  const avgCustomerSpending = totalCustomersCount > 0 ? totalCustomerSpending / totalCustomersCount : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1e1e1e] pb-6">
        <div>
          <h1 className="font-heading text-3xl font-black tracking-wider text-white">Customer Directory</h1>
          <p className="font-body text-xs text-[#888] mt-1">
            Displaying all registered and guest store shoppers with lifetime spend and order history
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportCustomers('csv')}
            className="flex items-center gap-2 bg-[#1a1a1a] hover:bg-[#262626] border border-[#333] text-white px-3.5 py-2 rounded-lg font-mono text-xs transition-colors"
          >
            <Download size={14} className="text-[#C4311E]" />
            Export CSV
          </button>
          <button
            onClick={() => exportCustomers('excel')}
            className="flex items-center gap-2 bg-[#1a1a1a] hover:bg-[#262626] border border-[#333] text-white px-3.5 py-2 rounded-lg font-mono text-xs transition-colors"
          >
            <FileSpreadsheet size={14} className="text-emerald-400" />
            Export Excel
          </button>
        </div>
      </div>

      {/* Customer Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#101010] border border-[#1e1e1e] p-5 rounded-xl">
          <p className="font-mono text-[10px] text-[#888] uppercase">Total Active Customers</p>
          <p className="font-heading text-2xl font-black text-white mt-1">{totalCustomersCount}</p>
        </div>
        <div className="bg-[#101010] border border-[#1e1e1e] p-5 rounded-xl">
          <p className="font-mono text-[10px] text-[#888] uppercase">Total Customer Spend ($)</p>
          <p className="font-heading text-2xl font-black text-emerald-400 mt-1">${totalCustomerSpending.toLocaleString()}</p>
        </div>
        <div className="bg-[#101010] border border-[#1e1e1e] p-5 rounded-xl">
          <p className="font-mono text-[10px] text-[#888] uppercase">Customer Lifetime Value (LTV)</p>
          <p className="font-heading text-2xl font-black text-blue-400 mt-1">${avgCustomerSpending.toFixed(2)}</p>
        </div>
      </div>

      {/* Search & Sort Toolbar */}
      <div className="bg-[#101010] border border-[#1e1e1e] p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6B6B]" size={16} />
          <input
            type="text"
            placeholder="Search by customer name, email, phone, city..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full bg-[#161616] border border-[#262626] rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-[#6B6B6B] focus:outline-none focus:border-[#C4311E]"
          />
        </div>

        <div className="flex items-center gap-2">
          <ArrowUpDown size={14} className="text-[#888]" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-[#161616] border border-[#262626] text-xs font-mono text-white px-3 py-1.5 rounded-lg focus:outline-none"
          >
            <option value="spent_desc">Highest Lifetime Spend ($)</option>
            <option value="orders_desc">Most Orders Count</option>
            <option value="date_desc">Most Recent Order</option>
            <option value="name_asc">Name (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Customers Table */}
      {isLoading ? (
        <div className="flex justify-center py-20 bg-[#101010] border border-[#1e1e1e] rounded-xl">
          <div className="w-8 h-8 border-4 border-[#333] border-t-[#C4311E] rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="bg-[#101010] border border-[#1e1e1e] rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1e1e1e] bg-[#141414] text-left">
                  <th className="px-6 py-3.5 font-mono text-[10px] tracking-wider text-[#888] uppercase">Customer Profile</th>
                  <th className="px-6 py-3.5 font-mono text-[10px] tracking-wider text-[#888] uppercase">Contact Info</th>
                  <th className="px-6 py-3.5 font-mono text-[10px] tracking-wider text-[#888] uppercase">Location</th>
                  <th className="px-6 py-3.5 font-mono text-[10px] tracking-wider text-[#888] uppercase">Orders</th>
                  <th className="px-6 py-3.5 font-mono text-[10px] tracking-wider text-[#888] uppercase">Total Spent</th>
                  <th className="px-6 py-3.5 font-mono text-[10px] tracking-wider text-[#888] uppercase">Last Order Date</th>
                  <th className="px-6 py-3.5 font-mono text-[10px] tracking-wider text-[#888] uppercase text-right">Role / Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e1e1e]">
                {filteredCustomers.map((c, idx) => (
                  <tr key={c.id || idx} className="hover:bg-[#161616] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#1e1e1e] border border-[#333] flex items-center justify-center font-heading font-black text-xs text-white">
                          {c.name ? c.name.slice(0, 2).toUpperCase() : "CU"}
                        </div>
                        <div>
                          <p className="font-heading text-xs font-bold text-white">{c.name}</p>
                          <p className="font-mono text-[10px] text-[#6B6B6B]">ID: {c.id}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="font-mono text-xs text-white flex items-center gap-1.5">
                          <Mail size={12} className="text-[#888]" />
                          {c.email}
                        </p>
                        {c.phone && c.phone !== "Not Provided" && (
                          <p className="font-mono text-[11px] text-[#C4311E] flex items-center gap-1.5">
                            <Phone size={12} />
                            {c.phone}
                          </p>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 font-body text-xs text-[#ccc]">
                      <div className="flex items-center gap-1">
                        <MapPin size={13} className="text-[#888]" />
                        <span>{c.city || "Global"}, {c.country || "International"}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4 font-mono text-xs text-white font-bold">
                      <span className="px-2.5 py-1 rounded bg-[#1e1e1e] border border-[#333]">
                        {c.total_orders} orders
                      </span>
                    </td>

                    <td className="px-6 py-4 font-mono text-xs text-emerald-400 font-black">
                      ${Number(c.total_spent || 0).toFixed(2)}
                    </td>

                    <td className="px-6 py-4 font-mono text-xs text-[#888]">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={13} />
                        <span>{new Date(c.last_order_date || Date.now()).toLocaleDateString()}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <span className={`px-2.5 py-1 rounded-full font-mono text-[10px] uppercase font-bold border ${
                        c.role === "super_admin" ? "bg-purple-500/20 text-purple-400 border-purple-500/30" :
                        "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                      }`}>
                        {c.role || "Customer"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(!filteredCustomers || filteredCustomers.length === 0) && (
              <div className="text-center py-20">
                <Users className="mx-auto mb-4 text-[#333]" size={36} />
                <p className="font-heading text-base font-bold text-white">No customers match your search query.</p>
                <button onClick={() => setLocalSearch("")} className="mt-3 font-mono text-xs text-[#C4311E] hover:underline">
                  Clear search
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
