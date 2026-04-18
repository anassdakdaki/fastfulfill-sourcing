"use client";

import { useState, useEffect } from "react";
import {
  Users, Plus, Pencil, Trash2, Star, CheckCircle2, X,
  Globe, Mail, MessageCircle, Phone, Loader2, Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  loadSupplierContacts, createSupplierContact, updateSupplierContact, deleteSupplierContact,
} from "@/app/actions/contacts";

type Supplier = {
  id: string;
  name: string;
  country: string;
  categories: string[];
  contact_name: string;
  contact_email: string;
  wechat: string | null;
  whatsapp: string | null;
  verified: boolean;
  rating: number;
  total_orders: number;
  notes: string | null;
  created_at: string;
};

const EMPTY_FORM = {
  name: "", country: "", categories: "", contact_name: "",
  contact_email: "", wechat: "", whatsapp: "", notes: "",
};

export default function ContactsPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState("");
  const [showForm,  setShowForm]  = useState(false);
  const [editing,   setEditing]   = useState<Supplier | null>(null);
  const [form,      setForm]      = useState(EMPTY_FORM);
  const [saving,    setSaving]    = useState(false);
  const [deleting,  setDeleting]  = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const { data } = await loadSupplierContacts();
    setSuppliers(data as Supplier[]);
    setLoading(false);
  }

  function openNew() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  }

  function openEdit(s: Supplier) {
    setEditing(s);
    setForm({
      name:          s.name,
      country:       s.country,
      categories:    s.categories?.join(", ") ?? "",
      contact_name:  s.contact_name,
      contact_email: s.contact_email,
      wechat:        s.wechat ?? "",
      whatsapp:      s.whatsapp ?? "",
      notes:         s.notes ?? "",
    });
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.name || !form.contact_email) return;
    setSaving(true);
    const payload = {
      name:          form.name.trim(),
      country:       form.country.trim(),
      categories:    form.categories.split(",").map((c) => c.trim()).filter(Boolean),
      contact_name:  form.contact_name.trim(),
      contact_email: form.contact_email.trim(),
      wechat:        form.wechat.trim() || undefined,
      whatsapp:      form.whatsapp.trim() || undefined,
      notes:         form.notes.trim() || undefined,
    };
    if (editing) {
      const { error } = await updateSupplierContact(editing.id, payload);
      if (!error) setSuppliers((prev) => prev.map((s) => s.id === editing.id ? { ...s, ...payload } : s));
    } else {
      const { data, error } = await createSupplierContact(payload);
      if (!error && data) setSuppliers((prev) => [data as Supplier, ...prev]);
    }
    setSaving(false);
    setShowForm(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this supplier contact?")) return;
    setDeleting(id);
    const { error } = await deleteSupplierContact(id);
    if (!error) setSuppliers((prev) => prev.filter((s) => s.id !== id));
    setDeleting(null);
  }

  async function toggleVerified(s: Supplier) {
    const verified = !s.verified;
    await updateSupplierContact(s.id, { verified });
    setSuppliers((prev) => prev.map((x) => x.id === s.id ? { ...x, verified } : x));
  }

  const filtered = suppliers.filter((s) =>
    !search || s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.contact_name.toLowerCase().includes(search.toLowerCase()) ||
    s.country.toLowerCase().includes(search.toLowerCase()) ||
    s.categories?.some((c) => c.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="py-8 px-6 max-w-6xl mx-auto space-y-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Supplier Contacts</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your supplier network and contact details.</p>
        </div>
        <Button onClick={openNew}><Plus size={15} /> Add Supplier</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{suppliers.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Verified</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{suppliers.filter((s) => s.verified).length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Countries</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{new Set(suppliers.map((s) => s.country)).size}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-xs">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          placeholder="Search suppliers…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-900">{editing ? "Edit Supplier" : "Add Supplier"}</h2>
              <button onClick={() => setShowForm(false)}><X size={18} className="text-gray-400" /></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Supplier Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <Input label="Country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
              <Input label="Categories (comma-separated)" value={form.categories} onChange={(e) => setForm({ ...form, categories: e.target.value })} />
              <Input label="Contact Name" value={form.contact_name} onChange={(e) => setForm({ ...form, contact_name: e.target.value })} />
              <Input label="Contact Email *" type="email" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} />
              <Input label="WeChat ID" value={form.wechat} onChange={(e) => setForm({ ...form, wechat: e.target.value })} />
              <Input label="WhatsApp" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} />
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Notes</label>
                <textarea
                  rows={2}
                  className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 resize-none"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button onClick={handleSave} loading={saving} className="flex-1">
                {editing ? "Save Changes" : "Add Supplier"}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-16 gap-2 text-gray-400">
          <Loader2 size={18} className="animate-spin" /> Loading…
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-16 flex flex-col items-center gap-3 text-center">
          <Users size={32} className="text-gray-300" />
          <p className="text-sm text-gray-500 font-medium">{search ? "No suppliers match your search" : "No supplier contacts yet"}</p>
          {!search && <Button size="sm" onClick={openNew}><Plus size={14} /> Add your first supplier</Button>}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((s) => (
            <div key={s.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-bold text-gray-900">{s.name}</h3>
                    {s.verified && (
                      <span className="flex items-center gap-0.5 text-[10px] font-semibold text-green-700 bg-green-100 px-1.5 py-0.5 rounded-full">
                        <CheckCircle2 size={9} /> Verified
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1"><Globe size={10} /> {s.country}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => openEdit(s)} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"><Pencil size={13} /></button>
                  <button onClick={() => handleDelete(s.id)} disabled={deleting === s.id} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={13} /></button>
                </div>
              </div>

              {s.categories?.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {s.categories.map((c) => (
                    <Badge key={c} className="bg-gray-100 text-gray-600 text-[10px]">{c}</Badge>
                  ))}
                </div>
              )}

              <div className="space-y-1 text-xs text-gray-600">
                {s.contact_name  && <p className="flex items-center gap-1.5"><Users size={11} className="text-gray-400" /> {s.contact_name}</p>}
                {s.contact_email && <p className="flex items-center gap-1.5"><Mail size={11} className="text-gray-400" /> {s.contact_email}</p>}
                {s.wechat        && <p className="flex items-center gap-1.5"><MessageCircle size={11} className="text-gray-400" /> WeChat: {s.wechat}</p>}
                {s.whatsapp      && <p className="flex items-center gap-1.5"><Phone size={11} className="text-gray-400" /> WhatsApp: {s.whatsapp}</p>}
              </div>

              {s.notes && (
                <p className="mt-3 text-xs text-gray-500 bg-gray-50 rounded-xl px-3 py-2 line-clamp-2">{s.notes}</p>
              )}

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-0.5">
                  {[1,2,3,4,5].map((i) => (
                    <Star key={i} size={12} className={i <= Math.round(s.rating) ? "text-amber-400 fill-amber-400" : "text-gray-200"} />
                  ))}
                  {s.rating > 0 && <span className="text-xs text-gray-500 ml-1">{s.rating.toFixed(1)}</span>}
                </div>
                <button
                  onClick={() => toggleVerified(s)}
                  className={`text-xs font-medium px-2 py-1 rounded-lg transition-colors ${
                    s.verified
                      ? "bg-green-100 text-green-700 hover:bg-red-50 hover:text-red-600"
                      : "bg-gray-100 text-gray-600 hover:bg-green-100 hover:text-green-700"
                  }`}
                >
                  {s.verified ? "✓ Verified" : "Mark verified"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
