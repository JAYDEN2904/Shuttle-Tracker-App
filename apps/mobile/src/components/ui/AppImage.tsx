import { Image, type ImageProps } from "expo-image";

/** Use this instead of react-native Image for optimized loading and caching. */
export function AppImage(props: ImageProps) {
  const { accessibilityLabel, ...rest } = props;

  return (
    <Image
      {...rest}
      accessibilityRole={rest.accessibilityRole ?? "none"}
      accessibilityLabel={accessibilityLabel}
    />
  );
}

export { Image } from "expo-image";
export type { ImageProps } from "expo-image";
