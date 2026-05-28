"use client";

import type { FleetShuttleRow } from "@shuttle/database";
import type { Stop } from "@shuttle/shared-types";
import { cn } from "@/lib/utils";

const CAMPUS_BOUNDS = {
  minLat: 5.646,
  maxLat: 5.654,
  minLng: -0.1895,
  maxLng: -0.1815,
};

function projectCoordinates(lat: number, lng: number): { x: number; y: number } {
  const x =
    ((lng - CAMPUS_BOUNDS.minLng) /
      (CAMPUS_BOUNDS.maxLng - CAMPUS_BOUNDS.minLng)) *
    100;
  const y =
    ((CAMPUS_BOUNDS.maxLat - lat) /
      (CAMPUS_BOUNDS.maxLat - CAMPUS_BOUNDS.minLat)) *
    100;

  return {
    x: Math.min(96, Math.max(4, x)),
    y: Math.min(96, Math.max(4, y)),
  };
}

interface MockMapCanvasProps {
  stops: Stop[];
  shuttles?: FleetShuttleRow[];
  selectedShuttleId?: string | null;
  onSelectShuttle?: (shuttleId: string) => void;
  routeColor?: string;
  className?: string;
  interactive?: boolean;
  onMapClick?: (coordinates: { lat: number; lng: number }) => void;
}

function reverseProjectCoordinates(xPercent: number, yPercent: number): {
  lat: number;
  lng: number;
} {
  const lng =
    CAMPUS_BOUNDS.minLng +
    (xPercent / 100) * (CAMPUS_BOUNDS.maxLng - CAMPUS_BOUNDS.minLng);
  const lat =
    CAMPUS_BOUNDS.maxLat -
    (yPercent / 100) * (CAMPUS_BOUNDS.maxLat - CAMPUS_BOUNDS.minLat);

  return { lat, lng };
}

export function MockMapCanvas({
  stops,
  shuttles = [],
  selectedShuttleId,
  onSelectShuttle,
  routeColor,
  className,
  interactive = false,
  onMapClick,
}: MockMapCanvasProps) {
  return (
    <div
      className={cn(
        "relative h-full w-full overflow-hidden bg-[linear-gradient(180deg,#e8f5ee_0%,#f8fafc_100%)]",
        interactive && "cursor-crosshair",
        className,
      )}
      onClick={(event) => {
        if (!interactive || onMapClick === undefined) {
          return;
        }

        const rect = event.currentTarget.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;
        onMapClick(reverseProjectCoordinates(x, y));
      }}
    >
      <div className="absolute inset-0 opacity-30">
        <div className="absolute left-[10%] top-[20%] h-[60%] w-[2px] rotate-[18deg] bg-emerald-900/20" />
        <div className="absolute left-[30%] top-[10%] h-[70%] w-[2px] -rotate-[8deg] bg-emerald-900/20" />
        <div className="absolute left-[55%] top-[15%] h-[65%] w-[2px] rotate-[12deg] bg-emerald-900/20" />
        <div className="absolute left-[75%] top-[25%] h-[50%] w-[2px] -rotate-[15deg] bg-emerald-900/20" />
      </div>

      <div className="absolute left-4 top-4 rounded-md border bg-background/90 px-3 py-2 text-xs text-muted-foreground shadow-sm">
        Mock campus map — add a Mapbox token later for satellite tiles
      </div>

      {stops.map((stop) => {
        const { x, y } = projectCoordinates(
          stop.coordinates.latitude,
          stop.coordinates.longitude,
        );

        return (
          <div
            key={stop.id}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${x}%`, top: `${y}%` }}
            title={stop.name}
            onClick={(event) => {
              event.stopPropagation();
            }}
          >
            <div className="h-3 w-3 rounded-full border-2 border-white bg-slate-700 shadow" />
          </div>
        );
      })}

      {shuttles.map((shuttle) => {
        if (shuttle.location === null) {
          return null;
        }

        const { x, y } = projectCoordinates(
          shuttle.location.lat,
          shuttle.location.lng,
        );
        const color = shuttle.route?.color ?? routeColor ?? "#2563EB";
        const selected = selectedShuttleId === shuttle.id;

        return (
          <button
            key={shuttle.id}
            type="button"
            className={cn(
              "absolute flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white text-xs font-bold text-white shadow-lg transition-transform",
              selected && "scale-110 ring-2 ring-primary ring-offset-2",
            )}
            style={{ left: `${x}%`, top: `${y}%`, backgroundColor: color }}
            onClick={(event) => {
              event.stopPropagation();
              onSelectShuttle?.(shuttle.id);
            }}
          >
            {shuttle.route?.code ?? "S"}
          </button>
        );
      })}
    </div>
  );
}
