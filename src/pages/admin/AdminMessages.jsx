const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Mail, Trash2, CheckCircle, Clock, ExternalLink, MessageSquare, User, Calendar } from "lucide-react";

export default function AdminMessages() {
  const queryClient = useQueryClient();
  const [selectedMessage, setSelectedMessage] = useState(null);

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["contact_messages"],
    queryFn: () => db.entities.ContactMessage.list(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => db.entities.ContactMessage.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contact_messages"] });
      if (selectedMessage) setSelectedMessage(null);
    },
  });

  const markReadMutation = useMutation({
    mutationFn: ({ id, read }) => db.entities.ContactMessage.update(id, { read }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contact_messages"] });
    },
  });

  if (isLoading) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-4 border-[#333] border-t-[#C4311E] rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1a1a1a] pb-6">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-black text-[#E6E2D3]">Contact Inquiries</h1>
          <p className="font-mono text-xs text-[#6B6B6B] mt-1 uppercase tracking-[0.2em]">
            {messages.length} Total Messages • {messages.filter(m => !m.read).length} Unread
          </p>
        </div>
      </div>

      {messages.length === 0 ? (
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-12 text-center">
          <MessageSquare className="mx-auto mb-4 text-[#6B6B6B]" size={36} />
          <h3 className="font-heading text-xl font-bold text-[#E6E2D3] mb-2">No Inquiries Yet</h3>
          <p className="font-body text-[#6B6B6B] text-sm">When customers fill out the contact form on your storefront, their messages will drop directly here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Message List */}
          <div className="lg:col-span-1 bg-[#0a0a0a] border border-[#1a1a1a] divide-y divide-[#1a1a1a] overflow-y-auto max-h-[700px]">
            {messages.map((item) => {
              const isSelected = selectedMessage?.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    setSelectedMessage(item);
                    if (!item.read) {
                      markReadMutation.mutate({ id: item.id, read: true });
                    }
                  }}
                  className={`p-5 cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-[#181818] border-l-2 border-l-[#C4311E]"
                      : item.read
                      ? "hover:bg-[#111]"
                      : "bg-[#C4311E]/5 hover:bg-[#C4311E]/10 border-l-2 border-l-[#C4311E]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="font-heading font-bold text-sm text-[#E6E2D3] truncate">{item.name}</h4>
                    {!item.read && (
                      <span className="bg-[#C4311E] text-white text-[9px] font-mono uppercase px-1.5 py-0.5 rounded shrink-0">
                        New
                      </span>
                    )}
                  </div>
                  <p className="font-mono text-xs text-[#6B6B6B] truncate mb-2">{item.email}</p>
                  <p className="font-body text-xs text-[#E6E2D3]/70 line-clamp-2">{item.message}</p>
                  <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-[#6B6B6B]">
                    <span>{new Date(item.created_at || Date.now()).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Message Details & Actions */}
          <div className="lg:col-span-2 bg-[#0a0a0a] border border-[#1a1a1a] p-6 md:p-8 flex flex-col justify-between min-h-[400px]">
            {selectedMessage ? (
              <div className="space-y-6">
                <div className="border-b border-[#1a1a1a] pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <User size={16} className="text-[#C4311E]" />
                      <h2 className="font-heading text-xl font-bold text-[#E6E2D3]">{selectedMessage.name}</h2>
                    </div>
                    <a
                      href={`mailto:${selectedMessage.email}`}
                      className="font-mono text-xs text-[#C4311E] hover:underline flex items-center gap-1.5"
                    >
                      <Mail size={13} /> {selectedMessage.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => markReadMutation.mutate({ id: selectedMessage.id, read: !selectedMessage.read })}
                      className="border border-[#262626] hover:border-[#E6E2D3] text-[#E6E2D3] px-3 py-1.5 font-mono text-xs tracking-wider transition-colors flex items-center gap-1.5"
                    >
                      {selectedMessage.read ? <Clock size={14} /> : <CheckCircle size={14} />}
                      {selectedMessage.read ? "Mark Unread" : "Mark Read"}
                    </button>
                    <button
                      onClick={() => {
                        if (confirm("Delete this contact inquiry?")) {
                          deleteMutation.mutate(selectedMessage.id);
                        }
                      }}
                      className="border border-[#C4311E]/30 hover:border-[#C4311E] text-[#C4311E] px-3 py-1.5 font-mono text-xs tracking-wider transition-colors flex items-center gap-1.5"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 font-mono text-[10px] uppercase text-[#6B6B6B] tracking-[0.2em]">
                    <Calendar size={12} /> Received on {new Date(selectedMessage.created_at || Date.now()).toLocaleString()}
                  </div>
                  <div className="bg-[#111] border border-[#1a1a1a] p-6 font-body text-sm md:text-base text-[#E6E2D3] leading-relaxed whitespace-pre-wrap">
                    {selectedMessage.message}
                  </div>
                </div>

                <div className="pt-4 flex items-center gap-4">
                  <a
                    href={`mailto:${selectedMessage.email}?subject=Re: Your inquiry to REHBAR`}
                    className="bg-[#C4311E] hover:bg-[#a02818] text-[#E6E2D3] px-6 py-3 font-heading font-bold text-xs tracking-[0.2em] uppercase transition-colors inline-flex items-center gap-2"
                  >
                    <Mail size={16} /> Reply via Email
                  </a>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-12 text-[#6B6B6B]">
                <MessageSquare size={40} className="mb-4 opacity-50" />
                <p className="font-heading text-lg font-bold text-[#E6E2D3]">Select an Inquiry</p>
                <p className="font-body text-xs mt-1">Click any message from the list on the left to view full details and reply.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
