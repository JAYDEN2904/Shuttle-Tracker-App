import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  calculateETA,
  getBearing,
  haversineDistance,
  interpolatePosition,
  sortShuttlesByDistance,
} from "./geo.utils";
import type { ShuttleWithLocation } from "../types/app.types";

describe("geo.utils", () => {
  it("returns zero for identical points", () => {
    assert.equal(haversineDistance(5.65, -0.187, 5.65, -0.187), 0);
  });

  it("handles antipodal distance", () => {
    const distance = haversineDistance(0, 0, 0, 180);
    assert.ok(Math.abs(distance - Math.PI * 6371000) < 1000);
  });

  it("interpolates between coordinates", () => {
    const midpoint = interpolatePosition(
      { lat: 0, lng: 0 },
      { lat: 10, lng: 20 },
      0.5,
    );
    assert.equal(midpoint.lat, 5);
    assert.equal(midpoint.lng, 10);
  });

  it("calculates ETA in minutes", () => {
    const eta = calculateETA(5.6508, -0.187, 5.6514, -0.1882, 25);
    assert.ok(eta > 0);
  });

  it("returns zero bearing for identical points", () => {
    assert.equal(getBearing({ lat: 1, lng: 1 }, { lat: 1, lng: 1 }), 0);
  });

  it("sorts shuttles nearest first", () => {
    const shuttles: ShuttleWithLocation[] = [
      {
        id: "far",
        routeId: null,
        driverId: null,
        plateNumber: null,
        capacityStatus: "available",
        isLive: true,
        tripStartedAt: null,
        createdAt: "now",
        location: { lat: 5.66, lng: -0.19, heading: 0, speedKmh: 10, updatedAt: "now" },
        route: null,
      },
      {
        id: "near",
        routeId: null,
        driverId: null,
        plateNumber: null,
        capacityStatus: "available",
        isLive: true,
        tripStartedAt: null,
        createdAt: "now",
        location: { lat: 5.6509, lng: -0.1871, heading: 0, speedKmh: 10, updatedAt: "now" },
        route: null,
      },
    ];

    const sorted = sortShuttlesByDistance({ lat: 5.6508, lng: -0.187 }, shuttles);
    assert.equal(sorted[0]?.id, "near");
  });
});
