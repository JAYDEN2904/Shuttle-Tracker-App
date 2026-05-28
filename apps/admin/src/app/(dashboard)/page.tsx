import { FleetMap } from "@/components/fleet/fleet-map";
import { loadFleetOverview } from "@/lib/admin-data";
import { getMapboxToken } from "@/lib/env";
import { USE_MOCK_DATA } from "@/lib/mock";

export default async function FleetOverviewPage() {
  const { liveShuttles, activeCount, inactiveCount, allStops } =
    await loadFleetOverview();

  return (
    <FleetMap
      mapboxToken={getMapboxToken()}
      initialShuttles={liveShuttles}
      initialStops={allStops}
      activeCount={activeCount}
      inactiveCount={inactiveCount}
      useMockData={USE_MOCK_DATA}
    />
  );
}
