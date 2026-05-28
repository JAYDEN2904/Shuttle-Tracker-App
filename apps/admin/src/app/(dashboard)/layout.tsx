import { AdminHeader } from "@/components/admin-header";
import { loadAdminSession } from "@/lib/admin-data";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await loadAdminSession();

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader
        userName={session.name}
        userEmail={session.email}
        avatarUrl={session.avatarUrl}
      />
      <main>{children}</main>
    </div>
  );
}
