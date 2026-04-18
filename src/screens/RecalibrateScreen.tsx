import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { palette, spacing, typography } from '../tokens';
import { useWalletStore, labelForType } from '../store/useWalletStore';

// Built-in accounts — fixed order
const BUILTIN_ACCOUNTS = [
  { id: 'gcash', name: 'GCash',        icon: 'account-balance-wallet', accent: '#007AFF' },
  { id: 'maya',  name: 'Maya',          icon: 'account-balance-wallet', accent: '#00B14F' },
  { id: 'bdo',   name: 'BDO / BPI',     icon: 'account-balance',        accent: '#C0392B' },
  { id: 'cash',  name: 'Cash on Hand',  icon: 'payments',               accent: '#7B5EA7' },
] as const;

export function RecalibrateScreen() {
  const navigation = useNavigation();
  const { balances: globalBalances, customAccounts, recalibrate, updateAccountBalance } = useWalletStore();

  // Local state for built-in balances while typing
  const [localBuiltin, setLocalBuiltin] = useState({
    gcash: (globalBalances?.gcash ?? 0).toString(),
    maya:  (globalBalances?.maya  ?? 0).toString(),
    bdo:   (globalBalances?.bdo   ?? 0).toString(),
    cash:  (globalBalances?.cash  ?? 0).toString(),
  });

  // Local state for custom accounts while typing (keyed by id)
  const [localCustom, setLocalCustom] = useState<Record<string, string>>(
    Object.fromEntries((customAccounts ?? []).map((a) => [a.id, a.balance.toString()]))
  );

  const handleSave = () => {
    // Save built-ins all at once
    recalibrate({
      gcash: parseFloat(localBuiltin.gcash) || 0,
      maya:  parseFloat(localBuiltin.maya)  || 0,
      bdo:   parseFloat(localBuiltin.bdo)   || 0,
      cash:  parseFloat(localBuiltin.cash)  || 0,
    });

    // Save each custom account individually
    (customAccounts ?? []).forEach((account) => {
      const val = parseFloat(localCustom[account.id] ?? '0') || 0;
      updateAccountBalance(account.id, val);
    });

    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color={palette.ink} />
          </TouchableOpacity>
          <Text style={styles.headerText}>Sync Balances</Text>
        </View>

        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Icon name="info-outline" size={22} color={palette.primary} />
          <Text style={styles.infoText}>
            We never connect to your banks. Enter your current balances below and the offline AI will track changes from here.
          </Text>
        </View>

        {/* Built-in accounts */}
        <Text style={styles.groupLabel}>Default Accounts</Text>
        <View style={styles.accountsContainer}>
          {BUILTIN_ACCOUNTS.map((account) => (
            <View key={account.id} style={styles.accountCard}>
              <View style={styles.accountHeader}>
                <View style={[styles.iconWrapper, { backgroundColor: account.accent + '1A' }]}>
                  <Icon name={account.icon} size={20} color={account.accent} />
                </View>
                <Text style={styles.accountName}>{account.name}</Text>
              </View>
              <View style={[styles.inputWrapper, { borderBottomColor: account.accent }]}>
                <Text style={[styles.currencySymbol, { color: account.accent }]}>₱</Text>
                <TextInput
                  style={styles.balanceInput}
                  keyboardType="decimal-pad"
                  value={localBuiltin[account.id]}
                  onChangeText={(val) => setLocalBuiltin((prev) => ({ ...prev, [account.id]: val }))}
                  placeholder="0.00"
                  placeholderTextColor={palette.muted}
                  cursorColor={account.accent}
                  selectionColor={account.accent + '55'}
                />
              </View>
            </View>
          ))}
        </View>

        {/* Custom accounts (if any) */}
        {(customAccounts ?? []).length > 0 && (
          <>
            <Text style={[styles.groupLabel, { marginTop: spacing.xl }]}>Your Added Accounts</Text>
            <View style={styles.accountsContainer}>
              {(customAccounts ?? []).map((account) => (
                <View key={account.id} style={styles.accountCard}>
                  <View style={styles.accountHeader}>
                    <View style={[styles.iconWrapper, { backgroundColor: account.accent + '1A' }]}>
                      <Icon name={account.icon} size={20} color={account.accent} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.accountName}>{account.name}</Text>
                      <Text style={styles.accountType}>{labelForType(account.type)}</Text>
                    </View>
                  </View>
                  <View style={[styles.inputWrapper, { borderBottomColor: account.accent }]}>
                    <Text style={[styles.currencySymbol, { color: account.accent }]}>₱</Text>
                    <TextInput
                      style={styles.balanceInput}
                      keyboardType="decimal-pad"
                      value={localCustom[account.id] ?? '0'}
                      onChangeText={(val) =>
                        setLocalCustom((prev) => ({ ...prev, [account.id]: val }))
                      }
                      placeholder="0.00"
                      placeholderTextColor={palette.muted}
                      cursorColor={account.accent}
                      selectionColor={account.accent + '55'}
                    />
                  </View>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      {/* Save Button */}
      <View style={styles.footerContainer}>
        <TouchableOpacity style={styles.buttonPrimary} activeOpacity={0.8} onPress={handleSave}>
          <Icon name="check" size={24} color={palette.surface} />
          <Text style={styles.buttonTextPrimary}>Save & Resume Tracking</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.bg },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: 120,
  },

  header: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xl },
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
  headerText: { color: palette.ink, fontSize: 24, fontFamily: typography.primaryBold },

  infoBanner: {
    flexDirection: 'row',
    backgroundColor: palette.secondary,
    padding: spacing.md,
    borderRadius: 20,
    marginBottom: spacing.xl,
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    color: palette.ink,
    fontSize: 14,
    fontFamily: typography.primaryRegular,
    lineHeight: 20,
  },

  groupLabel: {
    color: palette.muted,
    fontSize: 12,
    fontFamily: typography.primaryBold,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.md,
  },

  accountsContainer: { gap: spacing.md },
  accountCard: {
    backgroundColor: palette.surface,
    borderRadius: 24,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: palette.border,
    elevation: 1,
  },
  accountHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md, gap: spacing.sm },
  iconWrapper: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  accountName: { color: palette.ink, fontSize: 16, fontFamily: typography.primaryMedium },
  accountType: { color: palette.muted, fontSize: 12, fontFamily: typography.primaryRegular, marginTop: 1 },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 2,
    paddingBottom: spacing.xs,
  },
  currencySymbol: { fontSize: 24, fontFamily: typography.primaryBold, marginRight: spacing.xs },
  balanceInput: { flex: 1, color: palette.ink, fontSize: 28, fontFamily: typography.primaryMedium, padding: 0 },

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
  buttonTextPrimary: { color: palette.surface, fontSize: 18, fontFamily: typography.primaryBold },
});