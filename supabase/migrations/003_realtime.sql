ALTER PUBLICATION supabase_realtime ADD TABLE public.shuttle_locations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.shuttles;

ALTER TABLE public.shuttle_locations REPLICA IDENTITY FULL;
ALTER TABLE public.shuttles REPLICA IDENTITY FULL;

CREATE INDEX idx_shuttle_locations_updated ON public.shuttle_locations(updated_at);
CREATE INDEX idx_shuttles_is_live ON public.shuttles(is_live) WHERE is_live = true;
CREATE INDEX idx_stops_route_id ON public.stops(route_id, sequence_order);
