-- Shopify webhook helpers for anon webhook requests.
-- These functions are SECURITY DEFINER because Shopify webhooks hit the app
-- without an authenticated end-user session.

create or replace function public.fn_shopify_lookup_integration(p_shop_domain text)
returns table (
  id uuid,
  user_id uuid,
  auto_fulfill boolean,
  auto_import_orders boolean,
  status text
)
language sql
security definer
set search_path = public
as $$
  select
    si.id,
    si.user_id,
    si.auto_fulfill,
    si.auto_import_orders,
    si.status
  from public.store_integrations si
  where si.platform = 'shopify'
    and si.store_domain = p_shop_domain
    and si.status <> 'disconnected'
  limit 1;
$$;

create or replace function public.fn_shopify_disconnect(p_shop_domain text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.store_integrations
  set
    status = 'disconnected',
    access_token = null,
    access_token_expires_at = null,
    refresh_token = null,
    refresh_token_expires_at = null,
    error_message = 'Shopify app was uninstalled'
  where platform = 'shopify'
    and store_domain = p_shop_domain;
end;
$$;

create or replace function public.fn_shopify_upsert_order(
  p_shop_domain text,
  p_user_id uuid,
  p_integration_id uuid,
  p_external_id text,
  p_external_name text,
  p_product_name text,
  p_quantity integer,
  p_unit_price numeric,
  p_status text,
  p_customer_name text,
  p_customer_email text,
  p_shipping_address jsonb,
  p_line_items jsonb,
  p_destination_country text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id uuid;
  v_auto_fulfill boolean := false;
  v_auto_import_orders boolean := false;
  v_first_sku text := null;
begin
  select auto_fulfill, auto_import_orders
  into v_auto_fulfill, v_auto_import_orders
  from public.store_integrations
  where id = p_integration_id
  limit 1;

  if jsonb_typeof(p_line_items) = 'array' and jsonb_array_length(p_line_items) > 0 then
    v_first_sku := p_line_items->0->>'sku';
  end if;

  insert into public.orders (
    user_id,
    product_name,
    quantity,
    status,
    destination_country,
    unit_price,
    source_platform,
    source_store_domain,
    external_order_id,
    external_order_name,
    customer_name,
    customer_email,
    shipping_address,
    line_items
  )
  values (
    p_user_id,
    p_product_name,
    p_quantity,
    p_status,
    p_destination_country,
    p_unit_price,
    'shopify',
    p_shop_domain,
    p_external_id,
    p_external_name,
    p_customer_name,
    p_customer_email,
    p_shipping_address,
    coalesce(p_line_items, '[]'::jsonb)
  )
  on conflict (source_platform, source_store_domain, external_order_id)
  do update set
    product_name = excluded.product_name,
    quantity = excluded.quantity,
    status = excluded.status,
    destination_country = excluded.destination_country,
    unit_price = excluded.unit_price,
    external_order_name = excluded.external_order_name,
    customer_name = excluded.customer_name,
    customer_email = excluded.customer_email,
    shipping_address = excluded.shipping_address,
    line_items = excluded.line_items
  returning id into v_order_id;

  if v_auto_fulfill and v_auto_import_orders and p_status <> 'cancelled' then
    insert into public.fulfillment_queue (
      order_id,
      user_id,
      product_name,
      sku,
      quantity,
      ship_to_country,
      status,
      customer_email
    )
    values (
      v_order_id,
      p_user_id,
      p_product_name,
      v_first_sku,
      p_quantity,
      p_destination_country,
      case when p_status = 'processing' then 'packed' else 'pending' end,
      p_customer_email
    )
    on conflict (order_id)
    do update set
      product_name = excluded.product_name,
      sku = excluded.sku,
      quantity = excluded.quantity,
      ship_to_country = excluded.ship_to_country,
      customer_email = excluded.customer_email;
  end if;

  update public.store_integrations
  set
    orders_synced = (
      select count(*)
      from public.orders
      where source_platform = 'shopify'
        and source_store_domain = p_shop_domain
    ),
    last_sync = now(),
    status = 'connected',
    error_message = null
  where id = p_integration_id;

  return jsonb_build_object('order_id', v_order_id);
end;
$$;

grant execute on function public.fn_shopify_lookup_integration(text) to anon, authenticated;
grant execute on function public.fn_shopify_disconnect(text) to anon, authenticated;
grant execute on function public.fn_shopify_upsert_order(
  text, uuid, uuid, text, text, text, integer, numeric, text, text, text, jsonb, jsonb, text
) to anon, authenticated;
