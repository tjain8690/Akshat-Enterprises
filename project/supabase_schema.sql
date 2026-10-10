-- ============================================================
-- Akshat Enterprises - Supabase Database Schema
-- Run this in your Supabase project's SQL Editor (supabase.com)
-- ============================================================

-- 1. Create the products table with stock and inventory columns
CREATE TABLE IF NOT EXISTS public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  department TEXT NOT NULL DEFAULT 'Footwear',
  category TEXT NOT NULL,
  price TEXT NOT NULL,
  original_price TEXT,
  price_value NUMERIC NOT NULL,
  stock INTEGER DEFAULT 50, -- Inventory quantity available
  image TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  tag TEXT,
  rating NUMERIC DEFAULT 5,
  reviews_count INTEGER DEFAULT 18,
  sizes TEXT[] DEFAULT '{}',
  colors TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure stock column exists if table was previously created
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 50;

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies for public access (allow reading, inserting, updating, deleting)
DROP POLICY IF EXISTS "Allow public select" ON public.products;
CREATE POLICY "Allow public select" ON public.products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert" ON public.products;
CREATE POLICY "Allow public insert" ON public.products FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update" ON public.products;
CREATE POLICY "Allow public update" ON public.products FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public delete" ON public.products;
CREATE POLICY "Allow public delete" ON public.products FOR DELETE USING (true);

-- 4. Enable Supabase Realtime for live instant sync
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'products'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
  END IF;
END $$;

-- 5. Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public)
VALUES ('shoes', 'shoes', true)
ON CONFLICT (id) DO NOTHING;

-- 6. Storage Policies for public read and upload
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'shoes');

DROP POLICY IF EXISTS "Public Upload" ON storage.objects;
CREATE POLICY "Public Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'shoes');

DROP POLICY IF EXISTS "Public Delete" ON storage.objects;
CREATE POLICY "Public Delete" ON storage.objects FOR DELETE USING (bucket_id = 'shoes');

-- 7. Seed initial catalog products with stocks (Optional, run once if table is empty)
INSERT INTO public.products (name, department, category, price, original_price, price_value, stock, image, tag, rating, reviews_count, sizes, colors)
VALUES 
  ('Yellow Craft Chukka Boots', 'Footwear', 'Casual', '₹1,299', '₹1,899', 1299, 45, '/images/brown_boots_product.jpg', 'Bestseller', 5, 24, ARRAY['IND 6', 'IND 7', 'IND 8', 'IND 9', 'IND 10'], ARRAY['Brown', 'Tan', 'Black']),
  ('Stealth High-Top Leather Sneakers', 'Footwear', 'Running', '₹1,599', '₹2,299', 1599, 32, '/images/black_sneakers_product.jpg', 'New drop', 5, 38, ARRAY['IND 7', 'IND 8', 'IND 9', 'IND 10', 'IND 11'], ARRAY['Black', 'Grey']),
  ('Terrain Heavy Duty Safety Boot', 'Footwear', 'Safety Shoes', '₹999', '₹1,499', 999, 80, '/images/brown_boots_product.jpg', 'Workwear', 4.8, 52, ARRAY['IND 6', 'IND 7', 'IND 8', 'IND 9', 'IND 10', 'IND 11'], ARRAY['Brown', 'Black']),
  ('Urban Street Core Sneaker', 'Footwear', 'Casual', '₹1,199', '₹1,699', 1199, 18, '/images/sport_shoes_lifestyle.jpg', NULL, 4.9, 19, ARRAY['IND 6', 'IND 7', 'IND 8', 'IND 9', 'IND 10', 'IND 11', 'IND 12'], ARRAY['Grey', 'White', 'Black']),
  ('Safety Sprint Steel Toe 02', 'Footwear', 'Safety Shoes', '₹899', '₹1,299', 899, 65, '/images/Leather_image.jpg', 'Sale', 4.7, 41, ARRAY['IND 6', 'IND 7', 'IND 8', 'IND 9', 'IND 10', 'IND 11'], ARRAY['Black', 'Brown']),
  ('Court Side Court High 88', 'Footwear', 'Basketball', '₹1,799', '₹2,499', 1799, 22, '/images/black_sneakers_product.jpg', NULL, 5, 16, ARRAY['IND 7', 'IND 8', 'IND 9', 'IND 10', 'IND 11'], ARRAY['Black', 'White', 'Navy']),
  ('ProShield Construction Jacket', 'Jackets', 'Construction Jacket', '₹1,899', '₹2,699', 1899, 50, '/images/jacket.png', 'Bestseller', 4.9, 63, ARRAY['S', 'M', 'L', 'XL', 'XXL'], ARRAY['Navy', 'Yellow', 'Grey']),
  ('Mud Guard Industrial Gum Boots', 'Footwear', 'Mud Shoes / Gum Boots', '₹649', '₹899', 649, 100, '/images/Leather_image.jpg', 'Workwear', 4.8, 29, ARRAY['IND 6', 'IND 7', 'IND 8', 'IND 9', 'IND 10', 'IND 11'], ARRAY['Black', 'Yellow'])
ON CONFLICT DO NOTHING;

-- ============================================================
-- 8. Create the banners table for hero carousel ad cards
-- ============================================================
CREATE TABLE IF NOT EXISTS public.banners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  eyebrow TEXT DEFAULT 'Must Have',
  department TEXT NOT NULL DEFAULT 'Footwear',
  category TEXT NOT NULL DEFAULT 'Casual',
  price_label TEXT DEFAULT 'STARTING AT',
  price TEXT NOT NULL DEFAULT '₹499',
  cta_text TEXT DEFAULT 'GET YOURS!',
  image TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS) for banners
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

-- RLS policies for banners (allow public read, insert, update, delete)
DROP POLICY IF EXISTS "Allow public select on banners" ON public.banners;
CREATE POLICY "Allow public select on banners" ON public.banners FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert on banners" ON public.banners;
CREATE POLICY "Allow public insert on banners" ON public.banners FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update on banners" ON public.banners;
CREATE POLICY "Allow public update on banners" ON public.banners FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public delete on banners" ON public.banners;
CREATE POLICY "Allow public delete on banners" ON public.banners FOR DELETE USING (true);

-- Enable Supabase Realtime for live instant sync of banners
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'banners'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.banners;
  END IF;
END $$;

-- 9. Storage bucket for banner images
INSERT INTO storage.buckets (id, name, public)
VALUES ('banners', 'banners', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Access Banners" ON storage.objects;
CREATE POLICY "Public Access Banners" ON storage.objects FOR SELECT USING (bucket_id = 'banners');

DROP POLICY IF EXISTS "Public Upload Banners" ON storage.objects;
CREATE POLICY "Public Upload Banners" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'banners');

DROP POLICY IF EXISTS "Public Delete Banners" ON storage.objects;
CREATE POLICY "Public Delete Banners" ON storage.objects FOR DELETE USING (bucket_id = 'banners');

-- 10. Seed initial 5 hero banners with photos, categories, and prices
INSERT INTO public.banners (title, eyebrow, department, category, price_label, price, cta_text, image, display_order, is_active)
VALUES
  ('SANDALS & SNEAKERS', 'Must Have', 'Footwear', 'Casual', 'STARTING AT', '₹499', 'GET YOURS!', '/images/porto_hero.jpg', 1, true),
  ('WORKWEAR & JACKETS', 'Heavy Duty', 'Jackets', 'Construction Jacket', 'STARTING AT', '₹999', 'EXPLORE JACKETS', '/images/jacket.png', 2, true),
  ('STEEL TOE SAFETY BOOTS', 'Certified Protection', 'Footwear', 'Safety Shoes', 'STARTING AT', '₹899', 'SHOP SAFETY SHOES', '/images/brown_boots_product.jpg', 3, true),
  ('STREET & RUNNING SHOES', 'Active Performance', 'Footwear', 'Running', 'STARTING AT', '₹1,199', 'VIEW SNEAKERS', '/images/sport_shoes_lifestyle.jpg', 4, true),
  ('INDUSTRIAL GUM BOOTS', 'All Weather Tough', 'Footwear', 'Mud Shoes / Gum Boots', 'STARTING AT', '₹649', 'DISCOVER GUM BOOTS', '/images/Leather_image.jpg', 5, true)
ON CONFLICT DO NOTHING;

