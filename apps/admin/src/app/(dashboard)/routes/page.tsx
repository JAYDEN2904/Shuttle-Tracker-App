import { RouteStopEditor } from "@/components/routes/route-stop-editor";
import { loadRoutesAndStops } from "@/lib/admin-data";
import { getMapboxToken } from "@/lib/env";
import { USE_MOCK_DATA } from "@/lib/mock";

export default async function RoutesPage() {
  const { routes, stops } = await loadRoutesAndStops();

  return (
    <div className="p-6">
      <RouteStopEditor
        mapboxToken={getMapboxToken()}
        routes={routes}
        initialStops={stops}
        useMockData={USE_MOCK_DATA}
      />
    </div>
  );
}
