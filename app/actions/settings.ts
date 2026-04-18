"use server";

import { createClient } from "@/lib/supabase/server";

export async function loadMyProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return { data: { ...data, email: user.email }, error: error?.message ?? null };
}

export async function saveSettings(input: {
  full_name:       string;
  company_name:    string;
  phone:           string;
  country:         string;
  website:         string;
  vat_number:      string;
  address_line1:   string;
  address_city:    string;
  address_state:   string;
  address_zip:     string;
  default_shipping: string;
  currency:        string;
  notif_order_updates:   boolean;
  notif_quote_received:  boolean;
  notif_shipment_alerts: boolean;
  notif_invoice_due:     boolean;
  notif_marketing:       boolean;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("profiles")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", user.id);

  return { error: error?.message ?? null };
}
