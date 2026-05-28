import type { ReactNode } from "react";
import { Component } from "react";
import { StyleSheet, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { AppText } from "@/components/ui/AppText";
import { COLORS, SPACING } from "@/utils/constants";

interface ErrorBoundaryProps {
  children: ReactNode;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorKey: number;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = {
    hasError: false,
    errorKey: 0,
  };

  static getDerivedStateFromError(): Partial<ErrorBoundaryState> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: { componentStack: string }): void {
    console.error("[ErrorBoundary]", error, errorInfo.componentStack);
  }

  private handleRetry = (): void => {
    this.props.onReset?.();
    this.setState((state) => ({
      hasError: false,
      errorKey: state.errorKey + 1,
    }));
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <AppText variant="display" align="center">
            Something went wrong
          </AppText>
          <AppText
            variant="body"
            color="textSecondary"
            align="center"
            style={styles.message}
          >
            We hit an unexpected error. You can try again without restarting the
            app.
          </AppText>
          <Button
            label="Try again"
            onPress={this.handleRetry}
            accessibilityLabel="Try again"
            style={styles.button}
          />
        </View>
      );
    }

    return (
      <View key={this.state.errorKey} style={styles.flex}>
        {this.props.children}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: SPACING.xxl,
    backgroundColor: COLORS.background,
    gap: SPACING.lg,
  },
  message: {
    maxWidth: 320,
  },
  button: {
    minWidth: 160,
  },
});
