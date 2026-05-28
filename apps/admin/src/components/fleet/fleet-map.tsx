"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import type { FleetShuttleRow } from "@shuttle/database";
import type { Stop } from "@shuttle/shared-types";
import { getMockAnimatedShuttles, getMockStudentsOnline } from "@/lib/mock/data";
import { isMapboxConfigured } from "@/lib/env";
import { animateLatLng } from "@/lib/map-interpolation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { FleetSidebar } from "@/components/fleet/fleet-sidebar";
import { MockMapCanvas } from "@/components/fleet/mock-map-canvas";

const CAMPUS_CENTER: [number, number] = [-0.187, 5.6508];
const STUDENT_PRESENCE_CHANNEL = "online-students";

interface FleetMapProps {
  mapboxToken: string;
  initialShuttles: FleetShuttleRow[];
  initialStops: Stop[];
  activeCount: number;
  inactiveCount: number;
  useMockData?: boolean;
}

export function FleetMap({
  mapboxToken,
  initialShuttles,
  initialStops,
  activeCount,
  inactiveCount,
  useMockData = false,
}: FleetMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const shuttleMarkersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const stopMarkersRef = useRef<mapboxgl.Marker[]>([]);
  const [shuttles, setShuttles] = useState(initialShuttles);
  const [selectedShuttleId, setSelectedShuttleId] = useState<string | null>(
    null,
  );
  const [studentsOnline, setStudentsOnline] = useState(
    useMockData ? getMockStudentsOnline() : 0,
  );
  const hasMapbox = isMapboxConfigured() && mapboxToken.length > 0;

  useEffect(() => {
    setShuttles(initialShuttles);
  }, [initialShuttles]);

  useEffect(() => {
    if (!useMockData) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setShuttles(getMockAnimatedShuttles());
    }, 5000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [useMockData]);

  useEffect(() => {
    if (!hasMapbox || mapContainerRef.current === null || mapRef.current !== null) {
      return;
    }

    mapboxgl.accessToken = mapboxToken;
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: CAMPUS_CENTER,
      zoom: 14.5,
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-right");
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [hasMapbox, mapboxToken]);

  useEffect(() => {
    const map = mapRef.current;
    if (!hasMapbox || map === null) {
      return;
    }

    for (const marker of stopMarkersRef.current) {
      marker.remove();
    }
    stopMarkersRef.current = [];

    for (const stop of initialStops) {
      const element = document.createElement("div");
      element.className =
        "h-3 w-3 rounded-full border-2 border-white bg-slate-700 shadow";
      const marker = new mapboxgl.Marker({ element })
        .setLngLat([stop.coordinates.longitude, stop.coordinates.latitude])
        .setPopup(new mapboxgl.Popup({ offset: 12 }).setText(stop.name))
        .addTo(map);
      stopMarkersRef.current.push(marker);
    }
  }, [hasMapbox, initialStops]);

  useEffect(() => {
    const map = mapRef.current;
    if (!hasMapbox || map === null) {
      return;
    }

    const markers = shuttleMarkersRef.current;
    const shuttleIds = new Set(shuttles.map((shuttle) => shuttle.id));

    for (const [shuttleId, marker] of markers.entries()) {
      if (!shuttleIds.has(shuttleId)) {
        marker.remove();
        markers.delete(shuttleId);
      }
    }

    for (const shuttle of shuttles) {
      if (shuttle.location === null) {
        continue;
      }

      const color = shuttle.route?.color ?? "#2563EB";
      let marker = markers.get(shuttle.id);

      if (marker === undefined) {
        const element = document.createElement("button");
        element.type = "button";
        element.className =
          "flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-xs font-bold text-white shadow-lg";
        element.style.backgroundColor = color;
        element.textContent = shuttle.route?.code ?? "S";
        element.addEventListener("click", () => {
          setSelectedShuttleId(shuttle.id);
        });

        marker = new mapboxgl.Marker({ element })
          .setLngLat([shuttle.location.lng, shuttle.location.lat])
          .addTo(map);
        markers.set(shuttle.id, marker);
        continue;
      }

      const current = marker.getLngLat();
      animateLatLng(
        { lat: current.lat, lng: current.lng },
        { lat: shuttle.location.lat, lng: shuttle.location.lng },
        (position) => {
          marker?.setLngLat([position.lng, position.lat]);
        },
      );
    }
  }, [hasMapbox, shuttles]);

  useEffect(() => {
    if (useMockData) {
      return;
    }

    const supabase = createSupabaseBrowserClient();

    const locationChannel = supabase
      .channel("admin-shuttle-locations")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "shuttle_locations" },
        (payload) => {
          const row = payload.new as {
            shuttle_id: string;
            lat: number;
            lng: number;
            heading: number | null;
            speed_kmh: number | null;
            updated_at: string;
          };

          setShuttles((current) =>
            current.map((shuttle) =>
              shuttle.id === row.shuttle_id
                ? {
                    ...shuttle,
                    location: {
                      lat: row.lat,
                      lng: row.lng,
                      heading: row.heading,
                      speedKmh: row.speed_kmh,
                      updatedAt: row.updated_at,
                    },
                  }
                : shuttle,
            ),
          );
        },
      )
      .subscribe();

    const shuttleChannel = supabase
      .channel("admin-shuttles")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "shuttles" },
        (payload) => {
          const row = payload.new as {
            id: string;
            capacity_status: FleetShuttleRow["capacityStatus"];
            is_live: boolean;
          };

          setShuttles((current) => {
            if (!row.is_live) {
              return current.filter((shuttle) => shuttle.id !== row.id);
            }

            return current.map((shuttle) =>
              shuttle.id === row.id
                ? { ...shuttle, capacityStatus: row.capacity_status }
                : shuttle,
            );
          });
        },
      )
      .subscribe();

    const presenceChannel = supabase.channel(STUDENT_PRESENCE_CHANNEL, {
      config: { presence: { key: "admin-dashboard" } },
    });

    presenceChannel
      .on("presence", { event: "sync" }, () => {
        const state = presenceChannel.presenceState();
        const studentCount = Object.values(state).reduce<number>(
          (total, presences) => {
            const entries = presences as Array<{ role?: string }>;
            return (
              total +
              entries.filter((entry) => entry.role === "student").length
            );
          },
          0,
        );
        setStudentsOnline(studentCount);
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(locationChannel);
      void supabase.removeChannel(shuttleChannel);
      void supabase.removeChannel(presenceChannel);
    };
  }, [useMockData]);

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full">
      {hasMapbox ? (
        <div ref={mapContainerRef} className="h-full w-[60%]" />
      ) : (
        <MockMapCanvas
          className="w-[60%]"
          stops={initialStops}
          shuttles={shuttles}
          selectedShuttleId={selectedShuttleId}
          onSelectShuttle={setSelectedShuttleId}
        />
      )}
      <FleetSidebar
        liveShuttles={shuttles}
        activeCount={activeCount}
        inactiveCount={inactiveCount}
        studentsOnline={studentsOnline}
        selectedShuttleId={selectedShuttleId}
        onSelectShuttle={setSelectedShuttleId}
      />
    </div>
  );
}
