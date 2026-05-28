"use client";

import { formatDistanceToNow } from "date-fns";
import { X } from "lucide-react";
import type { FleetShuttleRow } from "@shuttle/database";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ShuttleDetailPanelProps {
  shuttle: FleetShuttleRow;
  onClose: () => void;
}

export function ShuttleDetailPanel({
  shuttle,
  onClose,
}: ShuttleDetailPanelProps) {
  const updatedLabel =
    shuttle.location?.updatedAt !== undefined
      ? formatDistanceToNow(new Date(shuttle.location.updatedAt), {
          addSuffix: true,
        })
      : "Unknown";

  return (
    <div className="flex flex-1 flex-col border-t">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h2 className="font-semibold">Shuttle details</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <Card className="m-4 border-none shadow-none">
        <CardHeader className="px-0 pt-0">
          <CardTitle>{shuttle.route?.name ?? "Unassigned route"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 px-0">
          <div>
            <p className="text-sm text-muted-foreground">Driver</p>
            <p className="font-medium">{shuttle.driverName ?? "Unassigned"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Plate number</p>
            <p className="font-medium">{shuttle.plateNumber ?? "—"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Capacity</p>
            <Badge className="mt-1 capitalize">
              {shuttle.capacityStatus.replace("_", " ")}
            </Badge>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Last updated</p>
            <p className="font-medium">{updatedLabel}</p>
          </div>
          {shuttle.location !== null && (
            <div>
              <p className="text-sm text-muted-foreground">Coordinates</p>
              <p className="font-mono text-sm">
                {shuttle.location.lat.toFixed(5)},{" "}
                {shuttle.location.lng.toFixed(5)}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
