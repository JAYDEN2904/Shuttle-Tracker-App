import { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  useWindowDimensions,
} from "react-native";
import { Link } from "expo-router";
import { AppText, Button } from "@/components/ui";
import { USE_MOCK_DATA } from "@/lib/mock";
import { useAuthStore } from "@/store/auth.store";
import { COLORS, RADIUS, SPACING } from "@/utils/constants";

function BusIllustration() {
  return (
    <View style={styles.busScene}>
      <View style={styles.road} />
      <View style={styles.busBody}>
        <View style={styles.busRoof} />
        <View style={styles.busWindowRow}>
          <View style={styles.busWindow} />
          <View style={styles.busWindow} />
          <View style={styles.busWindow} />
        </View>
        <View style={styles.busStripe} />
      </View>
      <View style={styles.wheelRow}>
        <View style={styles.wheel} />
        <View style={styles.wheel} />
      </View>
    </View>
  );
}

export default function SignInScreen() {
  const { height } = useWindowDimensions();
  const [error, setError] = useState<string | undefined>();
  const isLoading = useAuthStore((state) => state.isLoading);
  const signInWithGoogle = useAuthStore((state) => state.signInWithGoogle);

  async function handleGoogleSignIn() {
    setError(undefined);
    try {
      await signInWithGoogle();
    } catch (signInError) {
      const message =
        signInError instanceof Error
          ? signInError.message
          : "Unable to sign in with Google.";
      setError(message);
    }
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      bounces={false}
    >
      <View style={[styles.hero, { minHeight: height * 0.4 }]}>
        <BusIllustration />
      </View>

      <View style={styles.body}>
        <AppText variant="h1" style={styles.heading}>
          Your shuttle,{"\n"}tracked live.
        </AppText>
        <AppText variant="body" color="textSecondary" style={styles.subheading}>
          Real-time shuttle locations on campus.{"\n"}No guessing. No waiting.
        </AppText>

        {error !== undefined && (
          <AppText variant="caption" color="error" style={styles.error}>
            {error}
          </AppText>
        )}

        {USE_MOCK_DATA && (
          <AppText variant="caption" color="primary" align="center">
            Demo mode — using mock campus data
          </AppText>
        )}

        <Button
          label={USE_MOCK_DATA ? "Continue as Student" : "Continue with Google"}
          onPress={() => {
            void handleGoogleSignIn();
          }}
          loading={isLoading}
          fullWidth
          size="lg"
        />

        <AppText variant="caption" color="textSecondary" align="center">
          Requires a University of Ghana email (ug.edu.gh)
        </AppText>

        <Link href="/(auth)/driver-login" asChild>
          <Pressable style={styles.driverLink}>
            <AppText variant="bodyMed" color="primary">
              Driver sign in
            </AppText>
          </Pressable>
        </Link>

        <AppText variant="caption" color="textTertiary" align="center">
          By signing in, you agree to our Terms of Service
        </AppText>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flexGrow: 1,
  },
  hero: {
    backgroundColor: COLORS.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    borderBottomLeftRadius: RADIUS.xxl,
    borderBottomRightRadius: RADIUS.xxl,
  },
  busScene: {
    width: 220,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  road: {
    position: "absolute",
    bottom: 0,
    width: 220,
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: RADIUS.full,
  },
  busBody: {
    width: 180,
    height: 72,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    overflow: "hidden",
    marginBottom: SPACING.sm,
  },
  busRoof: {
    height: 10,
    backgroundColor: COLORS.primaryDark,
  },
  busWindowRow: {
    flexDirection: "row",
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
  },
  busWindow: {
    flex: 1,
    height: 22,
    backgroundColor: COLORS.primaryLight,
    borderRadius: RADIUS.sm,
  },
  busStripe: {
    position: "absolute",
    bottom: SPACING.sm,
    left: 0,
    right: 0,
    height: 6,
    backgroundColor: COLORS.routeC,
  },
  wheelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 150,
    marginBottom: SPACING.xs,
  },
  wheel: {
    width: 22,
    height: 22,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.textPrimary,
    borderWidth: 4,
    borderColor: COLORS.textSecondary,
  },
  body: {
    paddingHorizontal: SPACING.xxl,
    paddingTop: SPACING.xxl,
    paddingBottom: SPACING.huge,
    gap: SPACING.lg,
  },
  heading: {
    marginBottom: SPACING.xs,
  },
  subheading: {
    marginBottom: SPACING.sm,
  },
  error: {
    marginBottom: SPACING.xs,
  },
  driverLink: {
    alignSelf: "center",
    paddingVertical: SPACING.sm,
  },
});
