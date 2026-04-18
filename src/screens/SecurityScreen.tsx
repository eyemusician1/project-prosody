import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { palette, spacing, typography } from '../tokens';

// Dummy data showing what the AI has recently blocked
const BLOCKED_THREATS = [
  { id: '1', title: 'Suspicious Link Blocked', sender: 'Unknown Number', time: '10:42 AM' },
  { id: '2', title: 'Fake Bank Alert', sender: 'BDO-Notice', time: 'Yesterday' },
  { id: '3', title: 'Delivery Scam', sender: 'Package-Alert', time: 'Mon, 2:15 PM' },
];

export function SecurityScreen() {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* 1. Page Header */}
        <View style={styles.header}>
          <Text style={styles.headerText}>Security Shield</Text>
        </View>

        {/* 2. Simple Background Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Icon name="security" size={32} color={palette.primary} />
            <View style={styles.statusTextGroup}>
              <Text style={styles.statusTitle}>Background Scanning is On</Text>
              <Text style={styles.statusSubtitle}>Silently checking incoming messages</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.telemetryRow}>
            <View style={styles.telemetryItem}>
              <Text style={styles.telemetryLabel}>Device Temp</Text>
              <Text style={styles.telemetryValue}>Normal</Text>
            </View>
            <View style={styles.telemetryItem}>
              <Text style={styles.telemetryLabel}>AI Memory</Text>
              <Text style={styles.telemetryValue}>Low</Text>
            </View>
          </View>
        </View>

        {/* 3. Threat Log (What was blocked) */}
        <View style={styles.logHeader}>
          <Text style={styles.sectionTitle}>Recent Blocks</Text>
          <TouchableOpacity activeOpacity={0.6}>
            <Text style={styles.clearText}>Clear History</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.logList}>
          {BLOCKED_THREATS.map((log) => (
            <View key={log.id} style={styles.logItem}>
              <View style={styles.iconWrapper}>
                <Icon name="gpp-bad" size={24} color={palette.muted} />
              </View>

              <View style={styles.logDetails}>
                <Text style={styles.logTitle}>{log.title}</Text>
                <Text style={styles.logSender}>{log.sender}</Text>
              </View>

              <Text style={styles.logTime}>{log.time}</Text>
            </View>
          ))}
        </View>

      </ScrollView>

      {/* 4. Large, User-Friendly Action Button */}
      <View style={styles.footerContainer}>
        <TouchableOpacity style={styles.buttonPrimary} activeOpacity={0.8}>
          <Icon name="update" size={28} color={palette.surface} />
          <Text style={styles.buttonTextPrimary}>Update Security Rules</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.bg,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxxl,
    paddingBottom: 120, // Extra padding so scroll doesn't hide behind the button
  },

  header: {
    marginBottom: spacing.xl,
  },
  headerText: {
    color: palette.ink,
    fontSize: 24,
    fontFamily: typography.primaryBold,
  },

  // Status Card Styles
  statusCard: {
    backgroundColor: palette.surface,
    borderRadius: 32, // Soft, friendly edges
    padding: spacing.xl,
    marginBottom: spacing.xxl,
    elevation: 2, // Slight shadow for depth
    borderWidth: 1,
    borderColor: palette.border,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  statusTextGroup: {
    marginLeft: spacing.md,
    flex: 1,
  },
  statusTitle: {
    color: palette.ink,
    fontSize: 18,
    fontFamily: typography.primaryBold,
  },
  statusSubtitle: {
    color: palette.body,
    fontSize: 14,
    fontFamily: typography.primaryRegular,
  },
  divider: {
    height: 1,
    backgroundColor: palette.border,
    marginVertical: spacing.md,
  },
  telemetryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  telemetryItem: {
    alignItems: 'flex-start',
  },
  telemetryLabel: {
    color: palette.muted,
    fontSize: 12,
    fontFamily: typography.primaryMedium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  telemetryValue: {
    color: palette.primary,
    fontSize: 16,
    fontFamily: typography.primaryBold,
    marginTop: 4,
  },

  // Blocked Threats List Styles
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    color: palette.ink,
    fontSize: 20,
    fontFamily: typography.primaryBold,
  },
  clearText: {
    color: palette.primary,
    fontSize: 14,
    fontFamily: typography.primaryMedium,
    marginBottom: 2,
  },
  logList: {
    backgroundColor: palette.surface,
    borderRadius: 32,
    padding: spacing.md,
    elevation: 1,
  },
  logItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: palette.bg, // Creates a soft contrast circle around the icon
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  logDetails: {
    flex: 1,
  },
  logTitle: {
    color: palette.ink,
    fontSize: 16,
    fontFamily: typography.primaryMedium,
    marginBottom: 2,
  },
  logSender: {
    color: palette.body,
    fontSize: 14,
    fontFamily: typography.primaryRegular,
  },
  logTime: {
    color: palette.muted,
    fontSize: 14,
    fontFamily: typography.primaryMedium,
  },

  // Fixed Bottom Button Styles
  footerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
    paddingTop: spacing.md,
    backgroundColor: 'rgba(248, 249, 250, 0.9)', // Fades nicely over the scrolling text
  },
  buttonPrimary: {
    backgroundColor: palette.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    borderRadius: 32, // Soft, highly clickable pill shape
    gap: spacing.md,
    elevation: 2,
  },
  buttonTextPrimary: {
    color: palette.surface,
    fontSize: 18,
    fontFamily: typography.primaryBold,
  },
});