import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native'; // 1. Import the navigation hook
import { palette, spacing, typography } from '../tokens';

const RECENT_TRANSACTIONS = [
  { id: '1', title: 'Coffee Shop', date: 'Today, 8:45 AM', amount: '₱ 150.00', icon: 'local-cafe', type: 'spend' },
  { id: '2', title: 'Money Received', date: 'Yesterday, 6:30 PM', amount: '₱ 1,500.00', icon: 'account-balance-wallet', type: 'income' },
  { id: '3', title: 'Supermarket', date: 'Yesterday, 4:15 PM', amount: '₱ 840.00', icon: 'shopping-cart', type: 'spend' },
  { id: '4', title: 'Internet Bill', date: 'Mon, 10:00 AM', amount: '₱ 1,299.00', icon: 'wifi', type: 'spend' },
];

export function WalletScreen() {
  const navigation = useNavigation<any>(); // 2. Initialize navigation

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          <Text style={styles.headerText}>Your offline ledger</Text>
        </View>

        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Estimated Balance</Text>
          <Text style={styles.balanceAmount}>₱ 4,250.00</Text>
          <View style={styles.balanceFooter}>
            <Icon name="check-circle" size={16} color={palette.surface} />
            <Text style={styles.balanceFooterText}>Updated from notifications</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Recent Activity</Text>

        <View style={styles.transactionList}>
          {RECENT_TRANSACTIONS.map((tx) => (
            <View key={tx.id} style={styles.transactionItem}>
              <View style={styles.iconWrapper}>
                <Icon name={tx.icon} size={24} color={palette.primary} />
              </View>

              <View style={styles.transactionDetails}>
                <Text style={styles.transactionTitle}>{tx.title}</Text>
                <Text style={styles.transactionDate}>{tx.date}</Text>
              </View>

              <Text style={[
                styles.transactionAmount,
                tx.type === 'income' && styles.incomeText
              ]}>
                {tx.type === 'income' ? '+' : '-'} {tx.amount}
              </Text>
            </View>
          ))}
        </View>

      </ScrollView>

      <View style={styles.footerContainer}>
        {/* 3. Add the onPress event to fire the navigation */}
        <TouchableOpacity
          style={styles.buttonPrimary}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Recalibrate')}
        >
          <Icon name="sync" size={28} color={palette.surface} />
          <Text style={styles.buttonTextPrimary}>Recalibrate Balance</Text>
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
    paddingBottom: 120,
  },
  header: {
    marginBottom: spacing.xl,
  },
  headerText: {
    color: palette.ink,
    fontSize: 24,
    fontFamily: typography.primaryBold,
  },
  balanceCard: {
    backgroundColor: palette.primary,
    borderRadius: 32,
    padding: spacing.xl,
    marginBottom: spacing.xxl,
    elevation: 4,
    shadowColor: palette.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  balanceLabel: {
    color: palette.secondary,
    fontSize: 16,
    fontFamily: typography.primaryMedium,
    marginBottom: spacing.sm,
  },
  balanceAmount: {
    color: palette.surface,
    fontSize: 40,
    fontFamily: typography.primaryBold,
    marginBottom: spacing.lg,
  },
  balanceFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  balanceFooterText: {
    color: palette.surface,
    fontSize: 14,
    fontFamily: typography.primaryMedium,
  },
  sectionTitle: {
    color: palette.ink,
    fontSize: 20,
    fontFamily: typography.primaryBold,
    marginBottom: spacing.lg,
  },
  transactionList: {
    backgroundColor: palette.surface,
    borderRadius: 32,
    padding: spacing.md,
    elevation: 1,
  },
  transactionItem: {
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
    backgroundColor: palette.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionTitle: {
    color: palette.ink,
    fontSize: 16,
    fontFamily: typography.primaryMedium,
    marginBottom: 2,
  },
  transactionDate: {
    color: palette.body,
    fontSize: 14,
    fontFamily: typography.primaryRegular,
  },
  transactionAmount: {
    color: palette.ink,
    fontSize: 16,
    fontFamily: typography.primaryBold,
  },
  incomeText: {
    color: palette.primary,
  },
  footerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
    paddingTop: spacing.md,
    backgroundColor: 'rgba(248, 249, 250, 0.9)',
  },
  buttonPrimary: {
    backgroundColor: palette.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    borderRadius: 32,
    gap: spacing.md,
    elevation: 2,
  },
  buttonTextPrimary: {
    color: palette.surface,
    fontSize: 18,
    fontFamily: typography.primaryBold,
  },
});