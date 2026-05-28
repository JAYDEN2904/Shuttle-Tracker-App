"use client";

import { useState, useTransition } from "react";
import type { Route } from "@shuttle/shared-types";
import { createDriverAction } from "@/actions/drivers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const selectClassName = cn(
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
);

interface AddDriverSheetProps {
  routes: Route[];
}

export function AddDriverSheet({ routes }: AddDriverSheetProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button>Add Driver</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Add driver</SheetTitle>
          <SheetDescription>
            Create a new authorized driver account with a 4-digit PIN.
          </SheetDescription>
        </SheetHeader>
        <form
          className="mt-6 space-y-4"
          action={(formData) => {
            startTransition(async () => {
              await createDriverAction(formData);
              setOpen(false);
            });
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="add-name">Full name</Label>
            <Input id="add-name" name="name" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="add-employeeId">Employee ID</Label>
            <Input id="add-employeeId" name="employeeId" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="add-routeId">Route assignment</Label>
            <select
              id="add-routeId"
              name="routeId"
              className={selectClassName}
              defaultValue=""
            >
              <option value="">Unassigned</option>
              {routes.map((route) => (
                <option key={route.id} value={route.id}>
                  {route.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="add-pin">4-digit PIN</Label>
            <Input
              id="add-pin"
              name="pin"
              inputMode="numeric"
              pattern="[0-9]{4}"
              maxLength={4}
              required
            />
          </div>
          <Button type="submit" disabled={isPending} className="w-full">
            Create driver
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
