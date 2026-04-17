-- Optional: Seed demo data (only run this in development)
-- Replace 'YOUR_USER_UUID' with an actual user UUID from auth.users

-- INSERT INTO public.orders (user_id, product_name, quantity, status, tracking_number, destination_country, unit_price)
-- VALUES
--   ('YOUR_USER_UUID', 'Wireless Earbuds Pro X', 50, 'shipped', 'YT2024123456CN', 'United States', 12.50),
--   ('YOUR_USER_UUID', 'LED Ring Light 18"', 20, 'processing', NULL, 'United Kingdom', 18.90),
--   ('YOUR_USER_UUID', 'Portable Blender USB', 100, 'delivered', 'YT2024098765CN', 'Canada', 8.20);

-- INSERT INTO public.inventory (user_id, product_name, sku, quantity, warehouse_location)
-- VALUES
--   ('YOUR_USER_UUID', 'Wireless Earbuds Pro X', 'WEP-001', 150, 'Shenzhen WH-A'),
--   ('YOUR_USER_UUID', 'LED Ring Light 18"', 'LRL-018', 45, 'Guangzhou WH-B');

-- INSERT INTO public.source_requests (user_id, product_url, product_name, quantity, target_country, status, quoted_price)
-- VALUES
--   ('YOUR_USER_UUID', 'https://alibaba.com/product/1', 'Bamboo Toothbrush Set', 500, 'United States', 'quoted', 1.20);
