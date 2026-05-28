import { useMemo } from "react";
import { AppText } from "@/components/ui/AppText";
import { type ColorToken } from "@/utils/constants";

interface ETALabelProps {
  minutes: number;
  compact?: boolean;
}

function getETADisplay(
  minutes: number,
  compact: boolean,
): {
  label: string;
  color: ColorToken;
} {
  if (minutes < 2) {
    return { label: "Arriving", color: "success" };
  }
  const label = compact ? `${minutes}m` : `${minutes} min`;
  if (minutes <= 5) {
    return { label, color: "primary" };
  }
  if (minutes <= 15) {
    return { label, color: "textSecondary" };
  }
  return { label, color: "textTertiary" };
}

export function ETALabel({ minutes, compact = false }: ETALabelProps) {
  const { label, color } = useMemo(
    () => getETADisplay(minutes, compact),
    [minutes, compact],
  );
  const displayText = compact ? label : `ETA ${label}`;

  return (
    <AppText
      variant="caption"
      color={color}
      accessibilityLiveRegion="polite"
      accessibilityLabel={displayText}
    >
      {displayText}
    </AppText>
  );
}
