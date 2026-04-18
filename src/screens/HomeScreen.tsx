import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { palette, spacing, typography } from '../tokens';
import { useWalletStore } from '../store/useWalletStore';

export function HomeScreen() {
  // Read the user's name from the global Zustand store
  const userName = useWalletStore((state) => state.userName);

  return (
    <View style={styles.container}>
      {/* 1. Friendly Status Header */}
      <View style={styles.header}>
        <Icon name="verified-user" size={24} color={palette.primary} />
        {/* Dynamically insert the name, falling back to "Your" if empty */}
        <Text style={styles.headerText}>
          {userName ? `${userName}'s` : 'Your'} phone is secure
        </Text>
      </View>

      {/* 2. The "Privacy Pulse" Orb */}
      <View style={styles.pulseWrapper}>
        <View style={styles.pulseOuter}>
          <View style={styles.pulseInner}>
            <Icon name="memory" size={56} color={palette.surface} />
          </View>
        </View>
        <Text style={styles.telemetryText}>AI is active  •  Phone is cool</Text>
        <Text style={styles.subTelemetryText}>0 scams blocked today</Text>
      </View>

      {/* 3. Soft, Round, User-Friendly Buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity style={styles.buttonPrimary} activeOpacity={0.8}>
          <Icon name="radar" size={28} color={palette.surface} />
          <Text style={styles.buttonTextPrimary}>Run Security Check</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonSecondary} activeOpacity={0.8}>
          <Icon name="tune" size={28} color={palette.ink} />
          <Text style={styles.buttonTextSecondary}>Manage Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.bg,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.xxl,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  headerText: {
    color: palette.ink,
    fontSize: 20,
    fontFamily: typography.primaryBold,
  },

  pulseWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseOuter: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: palette.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxl,
  },
  pulseInner: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: palette.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  telemetryText: {
    color: palette.ink,
    fontSize: 18,
    fontFamily: typography.primaryMedium,
    marginBottom: spacing.xs,
  },
  subTelemetryText: {
    color: palette.body,
    fontSize: 14,
    fontFamily: typography.primaryRegular,
  },

  actionContainer: {
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },
  buttonPrimary: {
    backgroundColor: palette.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    borderRadius: 32, // Soft, rounded pill shape
    gap: spacing.md,
    elevation: 2,
  },
  buttonTextPrimary: {
    color: palette.surface,
    fontSize: 18,
    fontFamily: typography.primaryBold,
  },
  buttonSecondary: {
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    borderRadius: 32, // Soft, rounded pill shape
    gap: spacing.md,
  },
  buttonTextSecondary: {
    color: palette.ink,
    fontSize: 18,
    fontFamily: typography.primaryMedium,
  },
});