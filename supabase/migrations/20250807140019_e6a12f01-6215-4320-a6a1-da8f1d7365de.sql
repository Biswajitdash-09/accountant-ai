-- Add Nigerian Naira and South African Rand to currencies table
INSERT INTO public.currencies (code, name, symbol, exchange_rate, is_base) VALUES
('NGN', 'Nigerian Naira', '₦', 1600.0, false),
('ZAR', 'South African Rand', 'R', 18.5, false)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  symbol = EXCLUDED.symbol,
  exchange_rate = EXCLUDED.exchange_rate;