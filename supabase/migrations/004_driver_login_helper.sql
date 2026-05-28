CREATE OR REPLACE FUNCTION public.get_driver_email(p_employee_id TEXT)
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT email
  FROM public.profiles
  WHERE employee_id = p_employee_id
    AND role = 'driver'
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_driver_email(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_driver_email(TEXT) TO anon, authenticated;
