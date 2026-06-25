-- Roles
CREATE TYPE public.app_role AS ENUM ('farmer', 'buyer', 'expert', 'admin');
CREATE TYPE public.lang_code AS ENUM ('en', 'am', 'om', 'so', 'ti');

-- updated_at helper
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Profiles
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  gender TEXT,
  region TEXT,
  zone TEXT,
  woreda TEXT,
  kebele TEXT,
  gps_lat DOUBLE PRECISION,
  gps_lng DOUBLE PRECISION,
  farm_size TEXT,
  soil_type TEXT,
  irrigation TEXT,
  main_crops TEXT[] DEFAULT '{}',
  livestock TEXT[] DEFAULT '{}',
  preferred_language public.lang_code NOT NULL DEFAULT 'en',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- User roles
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- New user trigger: create profile + default farmer role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.phone);
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, COALESCE((NEW.raw_user_meta_data->>'role')::public.app_role, 'farmer'))
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Crop listings
CREATE TABLE public.crop_listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  farmer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  crop TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  price NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'ETB',
  location TEXT,
  harvest_date DATE,
  description TEXT,
  image_url TEXT,
  verified BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crop_listings TO authenticated;
GRANT SELECT ON public.crop_listings TO anon;
GRANT ALL ON public.crop_listings TO service_role;
ALTER TABLE public.crop_listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Listings are viewable by everyone" ON public.crop_listings FOR SELECT USING (true);
CREATE POLICY "Farmers can insert their own listings" ON public.crop_listings FOR INSERT WITH CHECK (auth.uid() = farmer_id);
CREATE POLICY "Farmers can update their own listings" ON public.crop_listings FOR UPDATE USING (auth.uid() = farmer_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Farmers can delete their own listings" ON public.crop_listings FOR DELETE USING (auth.uid() = farmer_id OR public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_listings_updated BEFORE UPDATE ON public.crop_listings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Advisory requests
CREATE TABLE public.advisory_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  farmer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expert_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  body TEXT,
  category TEXT,
  image_url TEXT,
  voice_url TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.advisory_requests TO authenticated;
GRANT ALL ON public.advisory_requests TO service_role;
ALTER TABLE public.advisory_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Farmers see own requests, experts see all" ON public.advisory_requests FOR SELECT USING (auth.uid() = farmer_id OR public.has_role(auth.uid(), 'expert') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Farmers can create requests" ON public.advisory_requests FOR INSERT WITH CHECK (auth.uid() = farmer_id);
CREATE POLICY "Owners and experts can update requests" ON public.advisory_requests FOR UPDATE USING (auth.uid() = farmer_id OR public.has_role(auth.uid(), 'expert') OR public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_advisory_updated BEFORE UPDATE ON public.advisory_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();