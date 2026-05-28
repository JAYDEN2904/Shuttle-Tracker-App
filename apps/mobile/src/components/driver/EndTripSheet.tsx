import { forwardRef, useCallback, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
  type BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import { AppText, Button } from "@/components/ui";
import {
  COLORS,
  DRIVER_MIN_LABEL_FONT_SIZE,
  DRIVER_MIN_TAP_HEIGHT,
  RADIUS,
  SPACING,
} from "@/utils/constants";

interface EndTripSheetProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export const EndTripSheet = forwardRef<BottomSheetModal, EndTripSheetProps>(
  function EndTripSheet({ onConfirm, onCancel }, ref) {
    const snapPoints = useMemo(() => ["38%"], []);

    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          pressBehavior="close"
        />
      ),
      [],
    );

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.sheetBg}
        handleIndicatorStyle={styles.handle}
        onDismiss={onCancel}
      >
        <BottomSheetView style={styles.content}>
          <AppText variant="h2" dark style={styles.title}>
            End trip?
          </AppText>
          <AppText
            variant="body"
            dark
            color="driverDim"
            style={styles.subtitle}
          >
            Students will no longer see your shuttle on the map.
          </AppText>
          <View style={styles.actions}>
            <Button
              label="Yes, end trip"
              variant="danger"
              dark
              fullWidth
              onPress={onConfirm}
              style={styles.primaryAction}
            />
            <Button
              label="Cancel"
              variant="ghost"
              dark
              fullWidth
              onPress={onCancel}
              style={styles.secondaryAction}
            />
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    );
  },
);

const styles = StyleSheet.create({
  sheetBg: {
    backgroundColor: COLORS.driverSurface,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
  },
  handle: {
    backgroundColor: COLORS.driverBorder,
    width: 48,
  },
  content: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xxxl,
    gap: SPACING.lg,
  },
  title: {
    fontSize: DRIVER_MIN_LABEL_FONT_SIZE + 4,
    textAlign: "center",
  },
  subtitle: {
    fontSize: DRIVER_MIN_LABEL_FONT_SIZE,
    textAlign: "center",
    lineHeight: 22,
  },
  actions: {
    gap: SPACING.md,
    marginTop: SPACING.sm,
  },
  primaryAction: {
    minHeight: DRIVER_MIN_TAP_HEIGHT,
  },
  secondaryAction: {
    minHeight: DRIVER_MIN_TAP_HEIGHT,
  },
});
