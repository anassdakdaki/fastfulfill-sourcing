"use server";

import { createClient } from "@/lib/supabase/server";

export async function loadMyQuotes() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("quotes")
    .select("*")
    .order("created_at", { ascending: false });
  return { data: data ?? [], error: error?.message ?? null };
}

export async function respondToQuote(id: string, status: "accepted" | "declined") {
  const supabase = await createClient();
  const { error } = await supabase
    .from("quotes")
    .update({ status })
    .eq("id", id);
  return { error: error?.message ?? null };
}
