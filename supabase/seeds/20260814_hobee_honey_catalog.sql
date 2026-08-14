-- HOBEE Honey catalog import.
-- Prices are provisional draft prices supplied for initial merchandising and remain editable in Admin Portal.
WITH source (name, slug, description, price, compare_at_price, sku, stock_quantity, origin, image_url, alt_text) AS (
  VALUES
    ('HOBEE น้ำผึ้งชันโรงแท้ 100% สายพันธุ์อิตาม่า 700 กรัม', 'hobee-itama-stingless-bee-honey-700g', 'น้ำผึ้งชันโรงแท้ 100% สายพันธุ์อิตาม่า ขนาด 700 กรัม ราคาเริ่มต้นสำหรับตรวจสอบและแก้ไขใน Admin Portal', 1290::numeric, 1490::numeric, 'HB-ITAMA-700', 50, 'HOBEE Official Store', 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663754930894/DSsbIJGNUXreALsh.png', 'HOBEE น้ำผึ้งชันโรงแท้ 100% สายพันธุ์อิตาม่า 700 กรัม'),
    ('HOBEE น้ำผึ้งหลวงป่าแท้ 100% 1,000 กรัม', 'hobee-royal-forest-honey-1000g', 'น้ำผึ้งหลวงป่าแท้ 100% ขนาด 1,000 กรัม ราคาเริ่มต้นสำหรับตรวจสอบและแก้ไขใน Admin Portal', 1890::numeric, 2190::numeric, 'HB-ROYAL-1000', 30, 'HOBEE Official Store', 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663754930894/cALeCJXgkYvIiFMJ.webp', 'HOBEE น้ำผึ้งหลวงป่าแท้ 100% 1,000 กรัม'),
    ('HOBEE Premium Gen 2 700 กรัม (Thoracica)', 'hobee-premium-gen2-thoracica-700g', 'น้ำผึ้งชันโรงแท้ 100% สายพันธุ์โตราซิก้า รุ่น Premium Gen 2 ขนาด 700 กรัม ราคาเริ่มต้นสำหรับตรวจสอบและแก้ไขใน Admin Portal', 2190::numeric, 2490::numeric, 'HB-GEN2-700', 30, 'HOBEE Official Store', 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663754930894/JEgTlqXsLmcIOXAQ.webp', 'HOBEE Premium Gen 2 700 กรัม สายพันธุ์โตราซิก้า'),
    ('HOBEE Signature Trio 700 กรัม (3 สายพันธุ์)', 'hobee-signature-trio-700g', 'น้ำผึ้งชันโรงธรรมชาติ Signature Trio 3 สายพันธุ์ ขนาด 700 กรัม ราคาเริ่มต้นสำหรับตรวจสอบและแก้ไขใน Admin Portal', 2490::numeric, 2790::numeric, 'HB-TRIO-700', 25, 'HOBEE Official Store', 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663754930894/eUjHHbcLrPaxaRUY.webp', 'HOBEE Signature Trio 700 กรัม 3 สายพันธุ์'),
    ('HOBEE น้ำผึ้งชันโรง สายพันธุ์อิตาม่า 500 กรัม', 'hobee-itama-stingless-bee-honey-500g', 'น้ำผึ้งชันโรงแท้ 100% สายพันธุ์อิตาม่า ขนาด 500 กรัม ราคาเริ่มต้นสำหรับตรวจสอบและแก้ไขใน Admin Portal', 890::numeric, 990::numeric, 'HB-ITAMA-500', 50, 'HOBEE Official Store', 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663754930894/EdVSlvfDGvehtSZF.webp', 'HOBEE น้ำผึ้งชันโรง สายพันธุ์อิตาม่า 500 กรัม'),
    ('HOBEE น้ำผึ้งพันธุ์ดอกเม็ดขาว 500 กรัม', 'hobee-white-melaleuca-honey-500g', 'น้ำผึ้งพันธุ์ดอกเม็ดขาว 100% ขนาด 500 กรัม ราคาเริ่มต้นสำหรับตรวจสอบและแก้ไขใน Admin Portal', 790::numeric, 890::numeric, 'HB-MELALEUCA-500', 40, 'HOBEE Official Store', 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663754930894/CmIUIEEeqTQsFYbm.webp', 'HOBEE น้ำผึ้งพันธุ์ดอกเม็ดขาว 500 กรัม'),
    ('HOBEE น้ำผึ้งพื้นเมือง 500 กรัม', 'hobee-local-honey-500g', 'น้ำผึ้งพื้นเมือง HOBEE Local Honey ขนาด 500 กรัม ราคาเริ่มต้นสำหรับตรวจสอบและแก้ไขใน Admin Portal', 690::numeric, 790::numeric, 'HB-LOCAL-500', 40, 'HOBEE Official Store', 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663754930894/xyqRfBryScfLUZRH.webp', 'HOBEE น้ำผึ้งพื้นเมือง 500 กรัม'),
    ('HOBEE น้ำผึ้งหลวงป่าแท้ 500 กรัม', 'hobee-royal-forest-honey-500g', 'น้ำผึ้งหลวงป่าแท้ 100% ขนาด 500 กรัม ราคาเริ่มต้นสำหรับตรวจสอบและแก้ไขใน Admin Portal', 990::numeric, 1190::numeric, 'HB-ROYAL-500', 40, 'HOBEE Official Store', 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663754930894/JGGLhHGuVeAJVQet.webp', 'HOBEE น้ำผึ้งหลวงป่าแท้ 500 กรัม')
), context AS (
  SELECT shop_id, category_id
  FROM public.products
  WHERE slug = 'hobee-itama-stingless-bee-honey-700g'
  LIMIT 1
), upserted AS (
  INSERT INTO public.products (shop_id, category_id, name, slug, description, price, compare_at_price, sku, stock_quantity, status, origin)
  SELECT context.shop_id, context.category_id, source.name, source.slug, source.description, source.price, source.compare_at_price, source.sku, source.stock_quantity, 'published', source.origin
  FROM source CROSS JOIN context
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    compare_at_price = EXCLUDED.compare_at_price,
    sku = EXCLUDED.sku,
    stock_quantity = EXCLUDED.stock_quantity,
    status = EXCLUDED.status,
    origin = EXCLUDED.origin,
    updated_at = timezone('utc', now())
  RETURNING id, slug
)
INSERT INTO public.product_images (product_id, storage_path, alt_text, sort_order)
SELECT upserted.id, source.image_url, source.alt_text, 0
FROM upserted
JOIN source ON source.slug = upserted.slug
WHERE NOT EXISTS (
  SELECT 1
  FROM public.product_images existing
  WHERE existing.product_id = upserted.id AND existing.storage_path = source.image_url
);
