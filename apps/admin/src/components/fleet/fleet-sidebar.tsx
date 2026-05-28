"use client";

import type { FleetShuttleRow } from "@shuttle/database";
import { formatDistanceToNow } from "date-fns";
import { Activity, TrendingDown, TrendingUp, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { ShuttleDetailPanel } from "@/components/fleet/shuttle-detail-panel";

function capacityVariant(
  status: FleetShuttleRow["capacityStatus"],
): "success" | "warning" | "destructive" {
  if (status === "available") {
    return "success";
  }
  if (status === "half_full") {
    return "warning";
  }
  return "destructive";
}

function capacityLabel(status: FleetShuttleRow["capacityStatus"]): string {
  if (status === "available") {
    return "Available";
  }
  if (status === "half_full") {
    return "Half full";
  }
  return "Full";
}

function StatCard({
  label,
  value,
  trend,
  icon: Icon,
}: {
  label: string;
  value: number;
  trend: "up" | "down" | "neutral";
  icon: typeof Activity;
}) {
  const TrendIcon =
    trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Activity;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-3xl font-semibold tracking-tight">{value}</p>
            <p className="mt-1 text-sm text-muted-foreground">{label}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Icon className="h-4 w-4 text-muted-foreground" />
            <TrendIcon
              className={cn(
                "h-4 w-4",
                trend === "up" && "text-emerald-600",
                trend === "down" && "text-red-500",
                trend === "neutral" && "text-muted-foreground",
              )}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ShuttleListCard({
  shuttle,
  selected,
  onSelect,
}: {
  shuttle: FleetShuttleRow;
  selected: boolean;
  onSelect: () => void;
}) {
  const updatedLabel =
    shuttle.location?.updatedAt !== undefined
      ? formatDistanceToNow(new Date(shuttle.location.updatedAt), {
          addSuffix: true,
        })
      : "No location";

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full rounded-lg border p-4 text-left transition-colors hover:bg-muted/50",
        selected && "border-primary bg-primary/5",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium">
            {shuttle.route?.name ?? "Unassigned route"}
          </p>
          <p className="text-sm text-muted-foreground">
            {shuttle.driverName ?? "No driver assigned"}
          </p>
        </div>
        <Badge variant={capacityVariant(shuttle.capacityStatus)}>
          {capacityLabel(shuttle.capacityStatus)}
        </Badge>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">Updated {updatedLabel}</p>
    </button>
  );
}

interface FleetSidebarProps {
  liveShuttles: FleetShuttleRow[];
  activeCount: number;
  inactiveCount: number;
  studentsOnline: number;
  selectedShuttleId: string | null;
  onSelectShuttle: (shuttleId: string | null) => void;
}

export function FleetSidebar({
  liveShuttles,
  activeCount,
  inactiveCount,
  studentsOnline,
  selectedShuttleId,
  onSelectShuttle,
}: FleetSidebarProps) {
  const selectedShuttle =
    liveShuttles.find((shuttle) => shuttle.id === selectedShuttleId) ?? null;

  return (
    <aside className="flex h-full w-[40%] min-w-[360px] flex-col border-l bg-background">
      <div className="grid grid-cols-3 gap-3 border-b p-4">
        <StatCard
          label="Active shuttles"
          value={activeCount}
          trend="up"
          icon={Activity}
        />
        <StatCard
          label="Inactive shuttles"
          value={inactiveCount}
          trend="down"
          icon={Activity}
        />
        <StatCard
          label="Students online"
          value={studentsOnline}
          trend="neutral"
          icon={Users}
        />
      </div>

      {selectedShuttle !== null ? (
        <ShuttleDetailPanel
          shuttle={selectedShuttle}
          onClose={() => {
            onSelectShuttle(null);
          }}
        />
      ) : (
        <ScrollArea className="flex-1">
          <div className="space-y-3 p-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Live fleet
            </h2>
            {liveShuttles.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No shuttles are live right now.
              </p>
            ) : (
              liveShuttles.map((shuttle) => (
                <ShuttleListCard
                  key={shuttle.id}
                  shuttle={shuttle}
                  selected={selectedShuttleId === shuttle.id}
                  onSelect={() => {
                    onSelectShuttle(shuttle.id);
                  }}
                />
              ))
            )}
          </div>
        </ScrollArea>
      )}
    </aside>
  );
}
