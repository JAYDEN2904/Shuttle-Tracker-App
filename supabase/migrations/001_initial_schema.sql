CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE public.profiles (
  id              UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email           TEXT UNIQUE NOT NULL,
  name            TEXT,
  role            TEXT NOT NULL CHECK (role IN ('student', 'driver', 'admin')),
  employee_id     TEXT UNIQUE,
  avatar_url      TEXT,
  expo_push_token TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE public.routes (
  id                     UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name                   TEXT NOT NULL,
  code                   TEXT NOT NULL UNIQUE,
  color                  TEXT NOT NULL DEFAULT '#2563EB',
  is_active              BOOLEAN DEFAULT true NOT NULL,
  operating_start        TIME NOT NULL DEFAULT '07:00',
  operating_end          TIME NOT NULL DEFAULT '20:00',
  frequency_peak_mins    INTEGER DEFAULT 8,
  frequency_offpeak_mins INTEGER DEFAULT 20,
  created_at             TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE public.stops (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  route_id       UUID REFERENCES public.routes(id) ON DELETE CASCADE NOT NULL,
  name           TEXT NOT NULL,
  lat            FLOAT8 NOT NULL,
  lng            FLOAT8 NOT NULL,
  sequence_order INTEGER NOT NULL,
  created_at     TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE (route_id, sequence_order)
);

CREATE TABLE public.shuttles (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id        UUID REFERENCES public.profiles(id),
  route_id         UUID REFERENCES public.routes(id),
  plate_number     TEXT,
  capacity_status  TEXT DEFAULT 'available'
                   CHECK (capacity_status IN ('available', 'half_full', 'full')) NOT NULL,
  is_live          BOOLEAN DEFAULT false NOT NULL,
  trip_started_at  TIMESTAMPTZ,
  created_at       TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE public.shuttle_locations (
  shuttle_id UUID REFERENCES public.shuttles(id) ON DELETE CASCADE PRIMARY KEY,
  lat        FLOAT8 NOT NULL,
  lng        FLOAT8 NOT NULL,
  heading    FLOAT8,
  speed_kmh  FLOAT8,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE public.trips (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shuttle_id  UUID REFERENCES public.shuttles(id),
  route_id    UUID REFERENCES public.routes(id),
  driver_id   UUID REFERENCES public.profiles(id),
  started_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  ended_at    TIMESTAMPTZ,
  distance_km FLOAT8
);

CREATE TABLE public.stop_alerts (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  stop_id    UUID REFERENCES public.stops(id) ON DELETE CASCADE NOT NULL,
  shuttle_id UUID REFERENCES public.shuttles(id) ON DELETE CASCADE NOT NULL,
  notify_at  TIMESTAMPTZ NOT NULL,
  is_sent    BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
