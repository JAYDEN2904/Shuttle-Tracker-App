"use client";

import { useMemo, useState, useTransition } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import type { AdminDriverRow } from "@shuttle/database";
import type { Route } from "@shuttle/shared-types";
import {
  deactivateDriverAction,
  resetDriverPinAction,
  updateDriverAction,
} from "@/actions/drivers";
import { AddDriverSheet } from "@/components/drivers/add-driver-sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const selectClassName = cn(
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
);

interface DriversTableProps {
  drivers: AdminDriverRow[];
  routes: Route[];
}

export function DriversTable({ drivers, routes }: DriversTableProps) {
  const [editingDriver, setEditingDriver] = useState<AdminDriverRow | null>(
    null,
  );
  const [isPending, startTransition] = useTransition();

  const columns = useMemo<ColumnDef<AdminDriverRow>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => row.original.name ?? "—",
      },
      {
        accessorKey: "employeeId",
        header: "Employee ID",
        cell: ({ row }) => row.original.employeeId ?? "—",
      },
      {
        id: "currentRoute",
        header: "Current Route",
        cell: ({ row }) => row.original.currentRoute?.name ?? "Unassigned",
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge variant={row.original.isLive ? "success" : "secondary"}>
            {row.original.isLive ? "Live" : "Off Duty"}
          </Badge>
        ),
      },
      {
        accessorKey: "tripsThisWeek",
        header: "Total Trips This Week",
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEditingDriver(row.original);
              }}
            >
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={isPending}
              onClick={() => {
                startTransition(async () => {
                  await deactivateDriverAction(row.original.id);
                });
              }}
            >
              Deactivate
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={isPending}
              onClick={() => {
                const pin = window.prompt("Enter a new 4-digit PIN");
                if (pin === null) {
                  return;
                }
                startTransition(async () => {
                  await resetDriverPinAction(row.original.id, pin);
                });
              }}
            >
              Reset PIN
            </Button>
          </div>
        ),
      },
    ],
    [isPending],
  );

  const table = useReactTable({
    data: drivers,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Driver Management</h1>
          <p className="text-sm text-muted-foreground">
            Manage authorized shuttle drivers and active sessions.
          </p>
        </div>
        <AddDriverSheet routes={routes} />
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No drivers found.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Sheet
        open={editingDriver !== null}
        onOpenChange={(open) => {
          if (!open) {
            setEditingDriver(null);
          }
        }}
      >
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Edit driver</SheetTitle>
            <SheetDescription>
              Update driver profile and route assignment.
            </SheetDescription>
          </SheetHeader>
          {editingDriver !== null && (
            <form
              className="mt-6 space-y-4"
              action={(formData) => {
                startTransition(async () => {
                  await updateDriverAction(formData);
                  setEditingDriver(null);
                });
              }}
            >
              <input type="hidden" name="driverId" value={editingDriver.id} />
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={editingDriver.name ?? ""}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="employeeId">Employee ID</Label>
                <Input
                  id="employeeId"
                  name="employeeId"
                  defaultValue={editingDriver.employeeId ?? ""}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="routeId">Route</Label>
                <select
                  id="routeId"
                  name="routeId"
                  className={selectClassName}
                  defaultValue={editingDriver.currentRoute?.id ?? ""}
                >
                  <option value="">Unassigned</option>
                  {routes.map((route) => (
                    <option key={route.id} value={route.id}>
                      {route.name}
                    </option>
                  ))}
                </select>
              </div>
              <Button type="submit" disabled={isPending}>
                Save changes
              </Button>
            </form>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
