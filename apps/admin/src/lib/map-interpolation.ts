export const INTERPOLATION_MS = 500;

export interface LatLng {
  lat: number;
  lng: number;
}

function easeOutQuad(progress: number): number {
  return 1 - (1 - progress) * (1 - progress);
}

export function animateLatLng(
  from: LatLng,
  to: LatLng,
  onUpdate: (position: LatLng) => void,
  onComplete?: () => void,
): () => void {
  const start = performance.now();
  let frameId = 0;

  const tick = (now: number): void => {
    const progress = Math.min(1, (now - start) / INTERPOLATION_MS);
    const eased = easeOutQuad(progress);

    onUpdate({
      lat: from.lat + (to.lat - from.lat) * eased,
      lng: from.lng + (to.lng - from.lng) * eased,
    });

    if (progress < 1) {
      frameId = requestAnimationFrame(tick);
      return;
    }

    onComplete?.();
  };

  frameId = requestAnimationFrame(tick);

  return () => {
    cancelAnimationFrame(frameId);
  };
}
