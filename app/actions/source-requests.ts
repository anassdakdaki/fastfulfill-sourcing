"use server";

import { createClient } from "@/lib/supabase/server";

export async function loadMySourceRequests() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("source_requests")
    .select("*")
    .order("created_at", { ascending: false });
  return { data: data ?? [], error: error?.message ?? null };
}

export async function submitSourceRequest(input: {
  product_url: string;
  product_name: string;
  quantity: number;
  target_country: string;
  notes: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.from("source_requests").insert({
    user_id: user.id,
    product_url: input.product_url,
    product_name: input.product_name || null,
    quantity: input.quantity,
    target_country: input.target_country,
    notes: input.notes || null,
    status: "pending",
  });

  return { error: error?.message ?? null };
}
