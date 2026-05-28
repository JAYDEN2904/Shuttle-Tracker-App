import { DriversTable } from "@/components/drivers/drivers-table";
import { loadAdminDrivers, loadRoutesAndStops } from "@/lib/admin-data";

export default async function DriversPage() {
  const [drivers, { routes }] = await Promise.all([
    loadAdminDrivers(),
    loadRoutesAndStops(),
  ]);

  return (
    <div className="p-6">
      <DriversTable drivers={drivers} routes={routes} />
    </div>
  );
}
