ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shuttles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shuttle_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stop_alerts ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

REVOKE ALL ON FUNCTION public.get_user_role() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_user_role() TO authenticated;

CREATE POLICY profiles_select_own
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY profiles_select_admin
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (public.get_user_role() = 'admin');

CREATE POLICY profiles_update_own
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY profiles_update_admin
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (public.get_user_role() = 'admin')
  WITH CHECK (public.get_user_role() = 'admin');

CREATE POLICY routes_select_authenticated
  ON public.routes
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY routes_admin_write
  ON public.routes
  FOR ALL
  TO authenticated
  USING (public.get_user_role() = 'admin')
  WITH CHECK (public.get_user_role() = 'admin');

CREATE POLICY stops_select_authenticated
  ON public.stops
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY stops_admin_write
  ON public.stops
  FOR ALL
  TO authenticated
  USING (public.get_user_role() = 'admin')
  WITH CHECK (public.get_user_role() = 'admin');

CREATE POLICY shuttles_select_authenticated
  ON public.shuttles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY shuttles_update_own
  ON public.shuttles
  FOR UPDATE
  TO authenticated
  USING (driver_id = auth.uid())
  WITH CHECK (driver_id = auth.uid());

CREATE POLICY shuttles_admin_all
  ON public.shuttles
  FOR ALL
  TO authenticated
  USING (public.get_user_role() = 'admin')
  WITH CHECK (public.get_user_role() = 'admin');

CREATE POLICY shuttle_locations_select_authenticated
  ON public.shuttle_locations
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY shuttle_locations_insert_own
  ON public.shuttle_locations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.shuttles s
      WHERE s.id = shuttle_id
        AND s.driver_id = auth.uid()
    )
  );

CREATE POLICY shuttle_locations_update_own
  ON public.shuttle_locations
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.shuttles s
      WHERE s.id = shuttle_id
        AND s.driver_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.shuttles s
      WHERE s.id = shuttle_id
        AND s.driver_id = auth.uid()
    )
  );

CREATE POLICY shuttle_locations_admin_all
  ON public.shuttle_locations
  FOR ALL
  TO authenticated
  USING (public.get_user_role() = 'admin')
  WITH CHECK (public.get_user_role() = 'admin');

CREATE POLICY trips_select_driver_or_admin
  ON public.trips
  FOR SELECT
  TO authenticated
  USING (
    driver_id = auth.uid()
    OR public.get_user_role() = 'admin'
  );

CREATE POLICY trips_admin_write
  ON public.trips
  FOR ALL
  TO authenticated
  USING (public.get_user_role() = 'admin')
  WITH CHECK (public.get_user_role() = 'admin');

CREATE POLICY stop_alerts_student_own
  ON public.stop_alerts
  FOR ALL
  TO authenticated
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

CREATE POLICY stop_alerts_admin_select
  ON public.stop_alerts
  FOR SELECT
  TO authenticated
  USING (public.get_user_role() = 'admin');
