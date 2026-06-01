-- 1. Enable UUID Extension if needed (though we use randomized key IDs as text)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create the tables if they don't exist yet
-- PROFILES TABLE (Stores the shared couple workspace configuration)
CREATE TABLE IF NOT EXISTS public.profiles (
    id text PRIMARY KEY,
    name1 text NOT NULL,
    name2 text NOT NULL,
    created_by text NOT NULL,
    start_date text NOT NULL,
    custom_title text,
    image_url text,
    theme text NOT NULL DEFAULT 'pink',
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- USERS TABLE (Stores individual registered accounts linked to profiles)
CREATE TABLE IF NOT EXISTS public.users (
    id text PRIMARY KEY,
    username text NOT NULL,
    is_admin boolean DEFAULT false NOT NULL,
    assigned_profile_id text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT fk_profiles FOREIGN KEY (assigned_profile_id) REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- MEMORIES TABLE (Stores sweet shared timeline achievements and records)
CREATE TABLE IF NOT EXISTS public.memories (
    id text PRIMARY KEY,
    profile_id text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    memory_date text NOT NULL,
    location text,
    image_url text,
    tags jsonb DEFAULT '[]'::jsonb NOT NULL,
    is_favorite boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT fk_memories_profile FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

-- PHOTOS TABLE (Stores the shared gallery pictures and uploads)
CREATE TABLE IF NOT EXISTS public.photos (
    id text PRIMARY KEY,
    user_id text NOT NULL,
    owner_name text NOT NULL,
    url text NOT NULL,
    profile_id text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT fk_photos_profile FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

-- 3. Enable Row-Level Security (RLS) on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;

-- 4. Create wide-open, permissive public access policies (No restrictions)
-- This lets authenticated, anonymous, and standard client requests perform simple Crud.

-- Profiles Row Level Security Policies
DROP POLICY IF EXISTS "Allow public select profiles" ON public.profiles;
CREATE POLICY "Allow public select profiles" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert profiles" ON public.profiles;
CREATE POLICY "Allow public insert profiles" ON public.profiles FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update profiles" ON public.profiles;
CREATE POLICY "Allow public update profiles" ON public.profiles FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public delete profiles" ON public.profiles;
CREATE POLICY "Allow public delete profiles" ON public.profiles FOR DELETE USING (true);

-- Users Row Level Security Policies
DROP POLICY IF EXISTS "Allow public select users" ON public.users;
CREATE POLICY "Allow public select users" ON public.users FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert users" ON public.users;
CREATE POLICY "Allow public insert users" ON public.users FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update users" ON public.users;
CREATE POLICY "Allow public update users" ON public.users FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public delete users" ON public.users;
CREATE POLICY "Allow public delete users" ON public.users FOR DELETE USING (true);

-- Memories Row Level Security Policies
DROP POLICY IF EXISTS "Allow public select memories" ON public.memories;
CREATE POLICY "Allow public select memories" ON public.memories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert memories" ON public.memories;
CREATE POLICY "Allow public insert memories" ON public.memories FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update memories" ON public.memories;
CREATE POLICY "Allow public update memories" ON public.memories FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public delete memories" ON public.memories;
CREATE POLICY "Allow public delete memories" ON public.memories FOR DELETE USING (true);

-- Photos Row Level Security Policies
DROP POLICY IF EXISTS "Allow public select photos" ON public.photos;
CREATE POLICY "Allow public select photos" ON public.photos FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert photos" ON public.photos;
CREATE POLICY "Allow public insert photos" ON public.photos FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update photos" ON public.photos;
CREATE POLICY "Allow public update photos" ON public.photos FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public delete photos" ON public.photos;
CREATE POLICY "Allow public delete photos" ON public.photos FOR DELETE USING (true);
