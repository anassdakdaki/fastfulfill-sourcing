"use server";

import { createClient } from "@/lib/supabase/server";

export async function loadMyInvoices() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .order("issued_at", { ascending: false });
  return { data: data ?? [], error: error?.message ?? null };
}

export async function expireOldQuotes() {
  const supabase = await createClient();
  await supabase.rpc("expire_old_quotes");
}
