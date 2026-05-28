import Svg, { Circle, Path, Rect } from "react-native-svg";
import { COLORS } from "@/utils/constants";

interface BusIconProps {
  size?: number;
  color?: string;
}

export function BusIcon({
  size = 24,
  color = COLORS.white,
}: BusIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 5h14a2 2 0 012 2v9a2 2 0 01-2 2h-1.2a2.2 2.2 0 01-4.3 0H8.5a2.2 2.2 0 01-4.3 0H5a2 2 0 01-2-2V7a2 2 0 012-2z"
        fill={color}
      />
      <Rect x={7} y={8} width={4} height={3.5} rx={0.75} fill={color} fillOpacity={0.35} />
      <Rect x={13} y={8} width={4} height={3.5} rx={0.75} fill={color} fillOpacity={0.35} />
      <Path
        d="M5 12.5h14"
        stroke={color}
        strokeWidth={1}
        strokeOpacity={0.4}
      />
      <Circle cx={8.5} cy={18} r={1.5} fill={color} />
      <Circle cx={15.5} cy={18} r={1.5} fill={color} />
    </Svg>
  );
}
