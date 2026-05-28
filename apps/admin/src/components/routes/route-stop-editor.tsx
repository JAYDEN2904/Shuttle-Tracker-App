"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import mapboxgl from "mapbox-gl";
import type { Route, Stop } from "@shuttle/shared-types";
import {
  createStopAction,
  updateStopPositionAction,
} from "@/actions/routes";
import { MockMapCanvas } from "@/components/fleet/mock-map-canvas";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isMapboxConfigured } from "@/lib/env";
import { cn } from "@/lib/utils";

const CAMPUS_CENTER: [number, number] = [-0.187, 5.6508];

interface RouteStopEditorProps {
  mapboxToken: string;
  routes: Route[];
  initialStops: Stop[];
  useMockData?: boolean;
}

export function RouteStopEditor({
  mapboxToken,
  routes,
  initialStops,
  useMockData = false,
}: RouteStopEditorProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const stopMarkersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const [selectedRouteId, setSelectedRouteId] = useState(
    routes[0]?.id ?? "",
  );
  const [stops, setStops] = useState(initialStops);
  const [addMode, setAddMode] = useState(false);
  const [newStopName, setNewStopName] = useState("New stop");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const hasMapbox = isMapboxConfigured() && mapboxToken.length > 0;

  const routeStops = stops.filter((stop) => stop.routeId === selectedRouteId);
  const selectedRoute = routes.find((route) => route.id === selectedRouteId);

  useEffect(() => {
    setStops(initialStops);
  }, [initialStops]);

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

    map.on("click", (event) => {
      if (!addMode) {
        return;
      }

      startTransition(async () => {
        await createStopAction({
          routeId: selectedRouteId,
          name: newStopName,
          lat: event.lngLat.lat,
          lng: event.lngLat.lng,
        });
        setAddMode(false);
        router.refresh();
      });
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [addMode, hasMapbox, mapboxToken, newStopName, router, selectedRouteId]);

  useEffect(() => {
    const map = mapRef.current;
    if (!hasMapbox || map === null) {
      return;
    }

    for (const marker of stopMarkersRef.current.values()) {
      marker.remove();
    }
    stopMarkersRef.current.clear();

    for (const stop of routeStops) {
      const element = document.createElement("div");
      element.className =
        "flex h-6 w-6 cursor-grab items-center justify-center rounded-full border-2 border-white text-[10px] font-bold text-white shadow";
      element.style.backgroundColor = selectedRoute?.color ?? "#2563EB";
      element.textContent = String(stop.sequenceOrder);

      const marker = new mapboxgl.Marker({
        element,
        draggable: true,
      })
        .setLngLat([stop.coordinates.longitude, stop.coordinates.latitude])
        .addTo(map);

      marker.on("dragend", () => {
        const lngLat = marker.getLngLat();
        startTransition(async () => {
          await updateStopPositionAction({
            stopId: stop.id,
            lat: lngLat.lat,
            lng: lngLat.lng,
          });
          router.refresh();
        });
      });

      stopMarkersRef.current.set(stop.id, marker);
    }
  }, [hasMapbox, routeStops, router, selectedRoute?.color]);

  const handleMockMapClick = (coordinates: {
    lat: number;
    lng: number;
  }): void => {
    if (!addMode) {
      return;
    }

    startTransition(async () => {
      await createStopAction({
        routeId: selectedRouteId,
        name: newStopName,
        lat: coordinates.lat,
        lng: coordinates.lng,
      });
      setAddMode(false);
      router.refresh();
    });
  };

  return (
    <div className="grid h-[calc(100vh-8rem)] grid-cols-[320px_1fr] gap-4">
      <div className="space-y-4 overflow-y-auto rounded-lg border p-4">
        <div>
          <h1 className="text-2xl font-semibold">Route Management</h1>
          <p className="text-sm text-muted-foreground">
            Select a route and edit its stops on the map.
          </p>
          {useMockData && (
            <p className="mt-2 text-xs text-muted-foreground">
              Mock mode — changes stay in memory until Supabase is connected.
            </p>
          )}
        </div>

        <div className="space-y-2">
          {routes.map((route) => (
            <button
              key={route.id}
              type="button"
              onClick={() => {
                setSelectedRouteId(route.id);
                setAddMode(false);
              }}
              className={cn(
                "flex w-full items-center justify-between rounded-lg border px-3 py-3 text-left transition-colors hover:bg-muted/50",
                selectedRouteId === route.id && "border-primary bg-primary/5",
              )}
            >
              <div>
                <p className="font-medium">{route.name}</p>
                <p className="text-xs text-muted-foreground">Route {route.code}</p>
              </div>
              <Badge variant={route.isActive ? "success" : "secondary"}>
                {route.isActive ? "Active" : "Inactive"}
              </Badge>
            </button>
          ))}
        </div>

        <div className="space-y-3 border-t pt-4">
          <div className="space-y-2">
            <Label htmlFor="stop-name">New stop name</Label>
            <Input
              id="stop-name"
              value={newStopName}
              onChange={(event) => {
                setNewStopName(event.target.value);
              }}
            />
          </div>
          <Button
            variant={addMode ? "destructive" : "default"}
            className="w-full"
            onClick={() => {
              setAddMode((current) => !current);
            }}
          >
            {addMode ? "Cancel add stop" : "Add Stop"}
          </Button>
          {addMode && (
            <p className="text-xs text-muted-foreground">
              Click anywhere on the map to place a new stop marker.
            </p>
          )}
        </div>

        <div className="space-y-2 border-t pt-4">
          <p className="text-sm font-medium">Stops on this route</p>
          {routeStops.length === 0 ? (
            <p className="text-sm text-muted-foreground">No stops yet.</p>
          ) : (
            routeStops.map((stop) => (
              <div
                key={stop.id}
                className="rounded-md border px-3 py-2 text-sm"
              >
                <p className="font-medium">{stop.name}</p>
                <p className="text-xs text-muted-foreground">
                  #{stop.sequenceOrder} · {stop.coordinates.latitude.toFixed(5)}
                  , {stop.coordinates.longitude.toFixed(5)}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="relative overflow-hidden rounded-lg border">
        {hasMapbox ? (
          <div ref={mapContainerRef} className="h-full w-full" />
        ) : (
          <MockMapCanvas
            stops={routeStops}
            routeColor={selectedRoute?.color}
            interactive={addMode}
            onMapClick={handleMockMapClick}
          />
        )}
        {isPending && (
          <div className="absolute left-4 top-4 rounded-md bg-background/90 px-3 py-2 text-sm shadow">
            Saving changes...
          </div>
        )}
      </div>
    </div>
  );
}
