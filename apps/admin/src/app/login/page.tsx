import Link from "next/link";
import { signInAdmin } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { USE_MOCK_DATA } from "@/lib/mock";

function errorMessage(code: string | undefined): string | null {
  if (code === undefined) {
    return null;
  }
  if (code === "forbidden") {
    return "This account is not authorized for admin access.";
  }
  if (code === "invalid") {
    return "Invalid email or password.";
  }
  if (code === "missing") {
    return "Email and password are required.";
  }
  return "Unable to sign in.";
}

export default function LoginPage({
  searchParams,
}: {
  searchParams?: { error?: string };
}) {
  const message = errorMessage(searchParams?.error);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>The Shuttle App — Admin</CardTitle>
          <p className="text-sm text-muted-foreground">
            {USE_MOCK_DATA
              ? "Mock mode — use any email and password to explore the dashboard."
              : "Sign in with your estate management account."}
          </p>
        </CardHeader>
        <CardContent>
          <form action={signInAdmin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
              />
            </div>
            {message !== null && (
              <p className="text-sm text-destructive">{message}</p>
            )}
            <Button type="submit" className="w-full">
              Sign in
            </Button>
          </form>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Need help? Contact{" "}
            <Link href="mailto:estates@ug.edu.gh" className="underline">
              UG Estates
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
