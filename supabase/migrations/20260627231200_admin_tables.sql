-- Market Prices Table
CREATE TABLE public.market_prices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  crop TEXT NOT NULL,
  market TEXT NOT NULL,
  price NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  trend TEXT NOT NULL DEFAULT 'stable',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.market_prices TO anon, authenticated;
GRANT ALL ON public.market_prices TO service_role;
ALTER TABLE public.market_prices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Market prices are viewable by everyone" ON public.market_prices FOR SELECT USING (true);
CREATE POLICY "Admins can insert market prices" ON public.market_prices FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update market prices" ON public.market_prices FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete market prices" ON public.market_prices FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_market_prices_updated BEFORE UPDATE ON public.market_prices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Announcements Table
CREATE TABLE public.announcements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.announcements TO anon, authenticated;
GRANT ALL ON public.announcements TO service_role;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Announcements are viewable by everyone" ON public.announcements FOR SELECT USING (true);
CREATE POLICY "Admins can insert announcements" ON public.announcements FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update announcements" ON public.announcements FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete announcements" ON public.announcements FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_announcements_updated BEFORE UPDATE ON public.announcements FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some initial data to match the old hardcoded data
INSERT INTO public.market_prices (crop, market, price, unit, trend) VALUES
('Teff (White)', 'Addis Ababa', 6200, '100kg', 'up'),
('Teff (Mixed)', 'Addis Ababa', 5500, '100kg', 'stable'),
('Maize', 'Adama', 2800, '100kg', 'down'),
('Wheat', 'Bishoftu', 3500, '100kg', 'stable'),
('Coffee (Export)', 'Jimma', 12000, '100kg', 'up'),
('Onions', 'Meki', 4500, '100kg', 'down'),
('Tomatoes', 'Ziway', 3200, '100kg', 'down');

INSERT INTO public.announcements (title, body, type) VALUES
('Heavy Rain Expected', 'Heavy rainfall is expected in the central region over the next 3 days. Ensure proper drainage in your fields.', 'weather');
