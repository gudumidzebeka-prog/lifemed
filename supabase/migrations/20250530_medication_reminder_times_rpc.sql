ALTER TABLE medications ADD COLUMN IF NOT EXISTS reminder_times TEXT[] DEFAULT ARRAY[]::TEXT[];

CREATE OR REPLACE FUNCTION public.lifemed_ensure_medication_columns()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  ALTER TABLE medications ADD COLUMN IF NOT EXISTS reminder_times TEXT[] DEFAULT ARRAY[]::TEXT[];
END;
$$;
