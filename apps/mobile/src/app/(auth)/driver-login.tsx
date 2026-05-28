import { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { Link } from "expo-router";
import { AppText, Button, Input } from "@/components/ui";
import { Toggle } from "@/components/ui/Toggle";
import { USE_MOCK_DATA } from "@/lib/mock";
import {
  hydrateRememberedEmployeeId,
  useAuthStore,
} from "@/store/auth.store";
import { COLORS, RADIUS, SHADOWS, SPACING } from "@/utils/constants";

function PinDots({ length, filled }: { length: number; filled: number }) {
  return (
    <View style={styles.pinDots}>
      {Array.from({ length }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.pinDot,
            index < filled ? styles.pinDotFilled : styles.pinDotEmpty,
          ]}
        />
      ))}
    </View>
  );
}

export default function DriverLoginScreen() {
  const [employeeId, setEmployeeId] = useState("");
  const [pin, setPin] = useState("");
  const [rememberDevice, setRememberDevice] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const pinInputRef = useRef<TextInput>(null);
  const shakeX = useSharedValue(0);
  const isLoading = useAuthStore((state) => state.isLoading);
  const signInDriver = useAuthStore((state) => state.signInDriver);

  const pinAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  useEffect(() => {
    void hydrateRememberedEmployeeId().then((savedId) => {
      if (savedId !== null) {
        setEmployeeId(savedId);
        setRememberDevice(true);
      }
    });
  }, []);

  function triggerPinShake() {
    shakeX.value = withSequence(
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(-8, { duration: 50 }),
      withTiming(8, { duration: 50 }),
      withTiming(0, { duration: 50 }),
    );
  }

  async function handleSubmit() {
    setError(undefined);

    if (employeeId.trim().length === 0) {
      setError("Employee ID is required.");
      return;
    }

    if (pin.length !== 4) {
      setError("Enter your 4-digit PIN.");
      return;
    }

    try {
      await signInDriver(employeeId, pin, rememberDevice);
    } catch (signInError) {
      triggerPinShake();
      setPin("");
      const message =
        signInError instanceof Error
          ? signInError.message
          : "Invalid employee ID or PIN.";
      setError(message);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        <View style={styles.header}>
          <View style={styles.logoMark}>
            <AppText variant="h2">🚌</AppText>
          </View>
          <AppText variant="bodyMed" color="white">
            The Shuttle App
          </AppText>
          <AppText variant="overline" color="white" style={styles.portalLabel}>
            DRIVER PORTAL
          </AppText>
        </View>

        <View style={styles.card}>
          <AppText variant="caption" color="textSecondary">
            Welcome back, 👋
          </AppText>
          <AppText variant="h1" style={styles.cardHeading}>
            Sign in to{"\n"}start your shift.
          </AppText>

          <Input
            label="EMPLOYEE ID"
            placeholder="e.g. DRV-00142"
            value={employeeId}
            onChangeText={(text) => {
              setEmployeeId(text.toUpperCase());
            }}
            autoCapitalize="characters"
            autoCorrect={false}
          />

          <View style={styles.pinSection}>
            <AppText variant="label" color="textSecondary">
              PIN
            </AppText>
            <Pressable
              onPress={() => {
                pinInputRef.current?.focus();
              }}
            >
              <Animated.View style={pinAnimatedStyle}>
                <PinDots length={4} filled={pin.length} />
              </Animated.View>
            </Pressable>
            <TextInput
              ref={pinInputRef}
              value={pin}
              onChangeText={(text) => {
                setPin(text.replace(/\D/g, "").slice(0, 4));
              }}
              keyboardType="number-pad"
              maxLength={4}
              secureTextEntry
              style={styles.hiddenPinInput}
              accessibilityLabel="Driver PIN"
            />
          </View>

          <Toggle
            label="Remember this device"
            value={rememberDevice}
            onValueChange={setRememberDevice}
          />

          {error !== undefined && (
            <AppText variant="caption" color="error">
              {error}
            </AppText>
          )}

          {USE_MOCK_DATA && (
            <AppText variant="caption" color="textSecondary" align="center">
              Demo mode — any employee ID and 4-digit PIN will work
            </AppText>
          )}

          <Button
            label="Sign In"
            size="lg"
            fullWidth
            loading={isLoading}
            onPress={() => {
              void handleSubmit();
            }}
            style={styles.signInButton}
          />

          <AppText variant="caption" color="textTertiary" align="center">
            Forgot your PIN? Contact your supervisor
          </AppText>

          <Link href="/(auth)/sign-in" asChild>
            <Pressable style={styles.studentLink}>
              <AppText variant="bodyMed" color="primary">
                Student sign in
              </AppText>
            </Pressable>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    height: 220,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: SPACING.xxxl,
    gap: SPACING.sm,
  },
  logoMark: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.sm,
  },
  portalLabel: {
    letterSpacing: 1.2,
    opacity: 0.9,
  },
  card: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: RADIUS.xxl,
    borderTopRightRadius: RADIUS.xxl,
    paddingHorizontal: SPACING.xxl,
    paddingTop: SPACING.xxl,
    paddingBottom: SPACING.huge,
    gap: SPACING.lg,
    ...SHADOWS.lg,
  },
  cardHeading: {
    marginBottom: SPACING.sm,
  },
  pinSection: {
    gap: SPACING.sm,
  },
  pinDots: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  pinDot: {
    flex: 1,
    height: 56,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
  },
  pinDotEmpty: {
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  pinDotFilled: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  hiddenPinInput: {
    position: "absolute",
    opacity: 0,
    height: 1,
    width: 1,
  },
  signInButton: {
    marginTop: SPACING.sm,
  },
  studentLink: {
    alignSelf: "center",
    paddingVertical: SPACING.sm,
  },
});
