"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { signOutAdmin } from "@/actions/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Fleet" },
  { href: "/drivers", label: "Drivers" },
  { href: "/routes", label: "Routes" },
  { href: "/analytics", label: "Analytics" },
] as const;

interface AdminHeaderProps {
  userName: string | null;
  userEmail: string;
  avatarUrl: string | null;
}

export function AdminHeader({
  userName,
  userEmail,
  avatarUrl,
}: AdminHeaderProps) {
  const pathname = usePathname();
  const initials = (userName ?? userEmail)
    .split(" ")
    .map((part) => part[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("");

  return (
    <header className="flex h-16 items-center justify-between border-b px-6">
      <div className="flex items-center gap-8">
        <div>
          <p className="text-sm font-semibold">The Shuttle App — Admin</p>
          <p className="text-xs text-muted-foreground">
            University of Ghana, Legon
          </p>
        </div>
        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted",
                pathname === item.href && "bg-muted text-primary",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-medium">{userName ?? "Admin"}</p>
          <p className="text-xs text-muted-foreground">{userEmail}</p>
        </div>
        <Avatar>
          <AvatarImage src={avatarUrl ?? undefined} alt={userName ?? "Admin"} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <form action={signOutAdmin}>
          <Button variant="outline" size="sm" type="submit">
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </Button>
        </form>
      </div>
    </header>
  );
}
