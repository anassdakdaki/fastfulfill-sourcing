"use server";

import { createClient } from "@/lib/supabase/server";

export async function loadSupplierContacts() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("suppliers")
    .select("*")
    .order("name", { ascending: true });
  return { data: data ?? [], error: error?.message ?? null };
}

export async function createSupplierContact(input: {
  name: string;
  country: string;
  categories: string[];
  contact_name: string;
  contact_email: string;
  wechat?: string;
  whatsapp?: string;
  notes?: string;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("suppliers")
    .insert({ ...input, verified: false, total_orders: 0, rating: 0 })
    .select()
    .single();
  return { data, error: error?.message ?? null };
}

export async function updateSupplierContact(
  id: string,
  input: Partial<{
    name: string;
    country: string;
    categories: string[];
    contact_name: string;
    contact_email: string;
    wechat: string;
    whatsapp: string;
    notes: string;
    verified: boolean;
    rating: number;
  }>
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("suppliers")
    .update(input)
    .eq("id", id);
  return { error: error?.message ?? null };
}

export async function deleteSupplierContact(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("suppliers")
    .delete()
    .eq("id", id);
  return { error: error?.message ?? null };
}
