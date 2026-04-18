import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { palette, spacing, typography } from '../tokens';

// Pre-defined list of common local financial tools
const ACCOUNT_TYPES = [
  { id: 'gcash', name: 'GCash', icon: 'account-balance-wallet' },
  { id: 'maya', name: 'Maya', icon: 'account-balance-wallet' },
  { id: 'bdo', name: 'BDO / BPI (Bank)', icon: 'account-balance' },
  { id: 'cash', name: 'Physical Cash', icon: 'payments' },
];

export function RecalibrateScreen() {
  // State to hold the manual balances entered by the user
  const [balances, setBalances] = useState({
    gcash: '4250.00',
    maya: '0.00',
    bdo: '15000.00',
    cash: '800.00',
  });

  const updateBalance = (id: string, value: string) => {
    setBalances(prev => ({ ...prev, [id]: value }));
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Header Section */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton}>
            <Icon name="arrow-back" size={24} color={palette.ink} />
          </TouchableOpacity>
          <Text style={styles.headerText}>Sync Balances</Text>
        </View>

        <View style={styles.infoBanner}>
          <Icon name="info-outline" size={24} color={palette.primary} />
          <Text style={styles.infoText}>
            We never connect to your banks. Just enter your current balances below, and the offline AI will track the changes from here.
          </Text>
        </View>

        {/* Account Inputs */}
        <View style={styles.accountsContainer}>
          {ACCOUNT_TYPES.map((account) => (
            <View key={account.id} style={styles.accountCard}>
              <View style={styles.accountHeader}>
                <View style={styles.iconWrapper}>
                  <Icon name={account.icon} size={20} color={palette.primary} />
                </View>
                <Text style={styles.accountName}>{account.name}</Text>
              </View>

              <View style={styles.inputWrapper}>
                <Text style={styles.currencySymbol}>₱</Text>
                <TextInput
                  style={styles.balanceInput}
                  keyboardType="decimal-pad"
                  value={balances[account.id as keyof typeof balances]}
                  onChangeText={(val) => updateBalance(account.id, val)}
                  placeholder="0.00"
                  placeholderTextColor={palette.muted}
                  cursorColor={palette.primary}
                  selectionColor={palette.secondary}
                />
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.addAccountButton} activeOpacity={0.6}>
          <Icon name="add" size={20} color={palette.ink} />
          <Text style={styles.addAccountText}>Add another bank or wallet</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* Floating Action Button */}
      <View style={styles.footerContainer}>
        <TouchableOpacity style={styles.buttonPrimary} activeOpacity={0.8}>
          <Icon name="check" size={24} color={palette.surface} />
          <Text style={styles.buttonTextPrimary}>Save & Resume Tracking</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.bg,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: 120,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: palette.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    elevation: 1,
    borderWidth: 1,
    borderColor: palette.border,
  },
  headerText: {
    color: palette.ink,
    fontSize: 24,
    fontFamily: typography.primaryBold,
  },

  infoBanner: {
    flexDirection: 'row',
    backgroundColor: palette.secondary, // Soft Iris background
    padding: spacing.md,
    borderRadius: 20,
    marginBottom: spacing.xxl,
    gap: spacing.sm,
  },
  infoText: {
    flex: 1,
    color: palette.ink,
    fontSize: 14,
    fontFamily: typography.primaryRegular,
    lineHeight: 20,
  },

  accountsContainer: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  accountCard: {
    backgroundColor: palette.surface,
    borderRadius: 24,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: palette.border,
    elevation: 1,
  },
  accountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: palette.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountName: {
    color: palette.body,
    fontSize: 16,
    fontFamily: typography.primaryMedium,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: palette.border,
    paddingBottom: spacing.xs,
  },
  currencySymbol: {
    color: palette.ink,
    fontSize: 24,
    fontFamily: typography.primaryBold,
    marginRight: spacing.xs,
  },
  balanceInput: {
    flex: 1,
    color: palette.ink,
    fontSize: 28,
    fontFamily: typography.primaryMedium,
    padding: 0,
  },

  addAccountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  addAccountText: {
    color: palette.ink,
    fontSize: 16,
    fontFamily: typography.primaryMedium,
  },

  footerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
    paddingTop: spacing.md,
    backgroundColor: 'rgba(248, 249, 250, 0.95)',
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