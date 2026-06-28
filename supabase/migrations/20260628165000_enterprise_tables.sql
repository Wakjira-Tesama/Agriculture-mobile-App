-- Create buyer profiles table
CREATE TABLE public.buyer_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    business_type TEXT NOT NULL,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.buyer_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view verified buyer profiles" 
    ON public.buyer_profiles FOR SELECT 
    USING (true);

CREATE POLICY "Buyers can update own profile" 
    ON public.buyer_profiles FOR UPDATE 
    USING (auth.uid() = id);

-- Create expert profiles table
CREATE TABLE public.expert_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    specialty TEXT NOT NULL,
    region TEXT,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.expert_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view expert profiles" 
    ON public.expert_profiles FOR SELECT 
    USING (true);

CREATE POLICY "Experts can update own profile" 
    ON public.expert_profiles FOR UPDATE 
    USING (auth.uid() = id);

-- Create orders table
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    farmer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    listing_id UUID REFERENCES public.crop_listings(id) ON DELETE SET NULL,
    quantity NUMERIC NOT NULL,
    total_price NUMERIC NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own orders" 
    ON public.orders FOR SELECT 
    USING (auth.uid() = buyer_id OR auth.uid() = farmer_id);

CREATE POLICY "Buyers can create orders" 
    ON public.orders FOR INSERT 
    WITH CHECK (auth.uid() = buyer_id AND public.has_role('buyer'));

-- Create wallets table
CREATE TABLE public.wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    balance NUMERIC DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own wallet" 
    ON public.wallets FOR SELECT 
    USING (auth.uid() = user_id);

-- Create learning content table
CREATE TABLE public.learning_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    type TEXT NOT NULL,
    content_url TEXT,
    body TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.learning_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view learning content" 
    ON public.learning_content FOR SELECT 
    USING (true);

CREATE POLICY "Only admins can manage learning content" 
    ON public.learning_content FOR ALL 
    USING (public.has_role('admin'));
