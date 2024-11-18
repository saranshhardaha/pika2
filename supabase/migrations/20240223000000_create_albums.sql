-- Create albums table
CREATE TABLE IF NOT EXISTS public.albums (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    cover_url TEXT,
    is_locked BOOLEAN DEFAULT false,
    lock_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    shared_users JSONB DEFAULT '[]',
    size_bytes BIGINT DEFAULT 0,
    last_modified TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create album_images table for many-to-many relationship
CREATE TABLE IF NOT EXISTS public.album_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    album_id UUID REFERENCES public.albums(id) ON DELETE CASCADE,
    image_id UUID REFERENCES public.images(id) ON DELETE CASCADE,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    added_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    UNIQUE(album_id, image_id)
);

-- Create album_shares table
CREATE TABLE IF NOT EXISTS public.album_shares (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    album_id UUID REFERENCES public.albums(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    permissions JSONB DEFAULT '{"can_upload": true, "can_delete": false}',
    shared_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    shared_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    UNIQUE(album_id, user_id)
);

-- Create RLS policies
ALTER TABLE public.albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.album_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.album_shares ENABLE ROW LEVEL SECURITY;

-- Album policies
CREATE POLICY "Users can view their own albums"
    ON public.albums FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view shared albums"
    ON public.albums FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.album_shares
            WHERE album_id = id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own albums"
    ON public.albums FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Album images policies
CREATE POLICY "Users can view images in their albums"
    ON public.album_images FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.albums
            WHERE id = album_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view images in shared albums"
    ON public.album_images FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.album_shares
            WHERE album_id = album_images.album_id AND user_id = auth.uid()
        )
    );

-- Album shares policies
CREATE POLICY "Users can view their album shares"
    ON public.album_shares FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Album owners can manage shares"
    ON public.album_shares FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.albums
            WHERE id = album_id AND user_id = auth.uid()
        )
    );