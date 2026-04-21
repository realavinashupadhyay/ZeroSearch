-- Create sessions table to track browser sessions
CREATE TABLE public.sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  destroyed_at TIMESTAMP WITH TIME ZONE,
  destruction_method TEXT CHECK (destruction_method IN ('manual', 'auto-timeout', NULL)),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'destroyed'))
);

-- Create aggregate stats table for global counters
CREATE TABLE public.aggregate_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stat_key TEXT NOT NULL UNIQUE,
  stat_value BIGINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert initial counter for total destroyed sessions
INSERT INTO public.aggregate_stats (stat_key, stat_value) VALUES ('total_sessions_destroyed', 0);

-- Enable Row Level Security (public read/write for anonymous users)
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aggregate_stats ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read sessions
CREATE POLICY "Anyone can view sessions"
ON public.sessions
FOR SELECT
USING (true);

-- Allow anyone to create sessions
CREATE POLICY "Anyone can create sessions"
ON public.sessions
FOR INSERT
WITH CHECK (true);

-- Allow anyone to update sessions (for destruction)
CREATE POLICY "Anyone can update sessions"
ON public.sessions
FOR UPDATE
USING (true);

-- Allow anyone to delete sessions
CREATE POLICY "Anyone can delete sessions"
ON public.sessions
FOR DELETE
USING (true);

-- Allow anyone to read stats
CREATE POLICY "Anyone can view stats"
ON public.aggregate_stats
FOR SELECT
USING (true);

-- Allow anyone to update stats
CREATE POLICY "Anyone can update stats"
ON public.aggregate_stats
FOR UPDATE
USING (true);

-- Function to increment destroyed sessions counter
CREATE OR REPLACE FUNCTION public.increment_destroyed_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'destroyed' AND OLD.status = 'active' THEN
    UPDATE public.aggregate_stats 
    SET stat_value = stat_value + 1, updated_at = now()
    WHERE stat_key = 'total_sessions_destroyed';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to auto-increment counter when session is destroyed
CREATE TRIGGER on_session_destroyed
AFTER UPDATE ON public.sessions
FOR EACH ROW
EXECUTE FUNCTION public.increment_destroyed_count();

-- Enable realtime for sessions table
ALTER PUBLICATION supabase_realtime ADD TABLE public.sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.aggregate_stats;