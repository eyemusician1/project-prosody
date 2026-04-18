import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Animated,
  Pressable,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import GcashSvg from '../../assets/images/gcash.svg';
import BdoSvg from '../../assets/images/bdo.svg';
import { palette, spacing, typography } from '../tokens';
import {
  useWalletStore,
  CustomAccount,
  AccountType,
  pickAccent,
  iconForType,
  labelForType,
} from '../store/useWalletStore';

// ─── Built-in wallet definitions ─────────────────────────────────────────────
const BUILTIN_CARDS = [
  { id: 'gcash' as const, name: 'GCash',       icon: 'gcash-svg',              accent: '#007AFF', bgAccent: '#EAF3FF', label: 'E-Wallet' },
  { id: 'maya'  as const, name: 'Maya',         icon: 'account-balance-wallet', accent: '#00B14F', bgAccent: '#E6F8EE', label: 'E-Wallet' },
  { id: 'bdo'   as const, name: 'BDO / BPI',    icon: 'bdo-svg',                accent: '#C0392B', bgAccent: '#FDECEA', label: 'Bank Account' },
  { id: 'cash'  as const, name: 'Cash on Hand', icon: 'payments',               accent: '#7B5EA7', bgAccent: '#F1ECF9', label: 'Physical Cash' },
] as const;

const ACCOUNT_TYPE_OPTIONS: { type: AccountType; label: string; icon: string }[] = [
  { type: 'bank',    label: 'Bank Account', icon: 'account-balance' },
  { type: 'ewallet', label: 'E-Wallet',     icon: 'account-balance-wallet' },
  { type: 'cash',    label: 'Cash / Other', icon: 'payments' },
];

const FAB_ITEMS = [
  { type: 'bank'    as AccountType, label: 'Bank Account', icon: 'account-balance' },
  { type: 'ewallet' as AccountType, label: 'E-Wallet',     icon: 'account-balance-wallet' },
  { type: 'cash'    as AccountType, label: 'Cash / Other', icon: 'payments' },
];

function formatAmount(value: number) {
  return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ─── Bento Card ───────────────────────────────────────────────────────────────
type BentoCardProps = {
  name: string;
  label: string;
  icon: string;
  accent: string;
  bgAccent: string;
  amount: number;
  onPress: () => void;
  onLongPress?: () => void;
};

function BentoCard({ name, label, icon, accent, bgAccent, amount, onPress, onLongPress }: BentoCardProps) {
  const isEmpty = amount === 0;
  return (
    <TouchableOpacity
      style={[styles.bentoCard, { backgroundColor: bgAccent }]}
      activeOpacity={0.72}
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={500}
    >
      {/* Icon + badge */}
      <View style={styles.cardTopRow}>
        <View style={[styles.cardIconWrapper, { backgroundColor: accent }]}>
          {icon === 'gcash-svg' ? (
            <GcashSvg width={20} height={20} />
          ) : icon === 'bdo-svg' ? (
            <BdoSvg width={20} height={20} />
          ) : (
            <Icon name={icon} size={20} color="#FFF" />
          )}
        </View>
        <View style={[styles.cardLabelBadge, { borderColor: accent + '44' }]}>
          <Text style={[styles.cardLabelText, { color: accent }]}>{label}</Text>
        </View>
      </View>

      {/* Name */}
      <Text style={styles.cardName}>{name}</Text>

      {/* Amount */}
      {isEmpty ? (
        <>
          <Text style={styles.cardAmountEmpty}>₱ 0.00</Text>
          <Text style={styles.cardHint}>Tap to set</Text>
        </>
      ) : (
        <Text style={styles.cardAmount}>₱ {formatAmount(amount)}</Text>
      )}
    </TouchableOpacity>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export function WalletScreen() {
  const {
    balances,
    customAccounts,
    updateBuiltinBalance,
    updateAccountBalance,
    addAccount,
    removeAccount,
  } = useWalletStore();

  const safeBalances = balances       ?? { gcash: 0, maya: 0, bdo: 0, cash: 0 };
  const safeCustom   = customAccounts ?? [];

  // ── FAB ──
  const [fabOpen, setFabOpen] = useState(false);
  const fabAnim = useRef(new Animated.Value(0)).current;

  const toggleFab = () => {
    Animated.spring(fabAnim, {
      toValue: fabOpen ? 0 : 1,
      useNativeDriver: true,
      tension: 60,
      friction: 8,
    }).start();
    setFabOpen((v) => !v);
  };

  const closeFab = () => {
    Animated.spring(fabAnim, { toValue: 0, useNativeDriver: true, tension: 60, friction: 8 }).start();
    setFabOpen(false);
  };

  // ── Edit balance modal ──
  const [editTarget, setEditTarget] = useState<{
    kind: 'builtin' | 'custom';
    id: string;
    name: string;
    accent: string;
    icon: string;
  } | null>(null);
  const [editInput, setEditInput] = useState('');

  // ── Add account modal ──
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName]           = useState('');
  const [newType, setNewType]           = useState<AccountType>('bank');
  const [newBalance, setNewBalance]     = useState('');

  // ── Totals ──
  const builtinTotal =
    Number(safeBalances.gcash) + Number(safeBalances.maya) +
    Number(safeBalances.bdo)   + Number(safeBalances.cash);
  const customTotal  = safeCustom.reduce((s, a) => s + Number(a.balance || 0), 0);
  const totalBalance = builtinTotal + customTotal;

  // ── Edit handlers ──
  const openBuiltinEdit = (card: typeof BUILTIN_CARDS[number]) => {
    const current = Number(safeBalances[card.id] || 0);
    setEditTarget({ kind: 'builtin', id: card.id, name: card.name, accent: card.accent, icon: card.icon });
    setEditInput(current === 0 ? '' : current.toString());
  };

  const openCustomEdit = (account: CustomAccount) => {
    setEditTarget({ kind: 'custom', id: account.id, name: account.name, accent: account.accent, icon: account.icon });
    setEditInput(account.balance === 0 ? '' : account.balance.toString());
  };

  const handleSaveEdit = () => {
    if (!editTarget) return;
    const val = parseFloat(editInput) || 0;
    editTarget.kind === 'builtin'
      ? updateBuiltinBalance(editTarget.id as any, val)
      : updateAccountBalance(editTarget.id, val);
    setEditTarget(null);
  };

  const handleLongPress = (account: CustomAccount) => {
    Alert.alert(
      `Remove ${account.name}?`,
      'This will delete the account and its balance.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => removeAccount(account.id) },
      ]
    );
  };

  const handleFabItem = (type: AccountType) => {
    closeFab();
    setNewType(type);
    setNewName('');
    setNewBalance('');
    setTimeout(() => setShowAddModal(true), 150);
  };

  const handleAddAccount = () => {
    if (!newName.trim()) return;
    const colors = pickAccent(safeCustom.length);
    addAccount({
      name:     newName.trim(),
      type:     newType,
      balance:  parseFloat(newBalance) || 0,
      accent:   colors.accent,
      bgAccent: colors.bgAccent,
      icon:     iconForType(newType),
    });
    setShowAddModal(false);
  };

  // ── Grid columns ──
  const allCards = [
    ...BUILTIN_CARDS.map((c) => ({ ...c, kind: 'builtin' as const, amount: Number(safeBalances[c.id] || 0) })),
    ...safeCustom.map((c) => ({ ...c, kind: 'custom' as const, label: labelForType(c.type), amount: Number(c.balance || 0) })),
  ];
  const leftCol  = allCards.filter((_, i) => i % 2 === 0);
  const rightCol = allCards.filter((_, i) => i % 2 === 1);

  const fabRotate = fabAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '45deg'] });

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        // Smooth scroll optimizations
        overScrollMode="never"
        decelerationRate="normal"
        scrollEventThrottle={16}
        removeClippedSubviews={true}
      >
        <View style={styles.header}>
          <Text style={styles.headerText}>Your offline wallet</Text>
        </View>

        {/* Total Balance Card */}
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Total Balance</Text>
          <Text style={styles.totalAmount}>₱ {formatAmount(totalBalance)}</Text>
          <View style={styles.totalFooter}>
            <Icon name="lock" size={14} color={palette.surface} />
            <Text style={styles.totalFooterText}>Stored offline · never shared</Text>
          </View>
        </View>

        {/* Section */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Accounts & Wallets</Text>
          <Text style={styles.sectionHint}>Tap to edit · Hold to remove</Text>
        </View>

        {/* Bento Grid — explicit two columns, no flexWrap */}
        <View style={styles.bentoGrid}>
          <View style={styles.bentoColumn}>
            {leftCol.map((card) =>
              card.kind === 'builtin' ? (
                <BentoCard key={card.id} {...card} onPress={() => openBuiltinEdit(card as any)} />
              ) : (
                <BentoCard key={card.id} {...card} onPress={() => openCustomEdit(card as CustomAccount)} onLongPress={() => handleLongPress(card as CustomAccount)} />
              )
            )}
          </View>
          <View style={styles.bentoColumn}>
            {rightCol.map((card) =>
              card.kind === 'builtin' ? (
                <BentoCard key={card.id} {...card} onPress={() => openBuiltinEdit(card as any)} />
              ) : (
                <BentoCard key={card.id} {...card} onPress={() => openCustomEdit(card as CustomAccount)} onLongPress={() => handleLongPress(card as CustomAccount)} />
              )
            )}
          </View>
        </View>
      </ScrollView>

      {/* ── FAB backdrop ──────────────────────────────────────────────────────── */}
      {fabOpen && (
        <Pressable style={styles.fabBackdrop} onPress={closeFab} />
      )}

      {/* ── FAB menu ──────────────────────────────────────────────────────────── */}
      <View style={styles.fabContainer} pointerEvents="box-none">
        {FAB_ITEMS.map((item, index) => {
          const itemTranslateY = fabAnim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] });
          const itemOpacity    = fabAnim.interpolate({
            inputRange: [Math.max(0, index * 0.08), Math.min(1, index * 0.08 + 0.5)],
            outputRange: [0, 1],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              key={item.type}
              style={[
                styles.fabItemRow,
                { opacity: itemOpacity, transform: [{ translateY: itemTranslateY }] },
                !fabOpen && styles.fabItemHidden,
              ]}
              pointerEvents={fabOpen ? 'auto' : 'none'}
            >
              <View style={styles.fabLabel}>
                <Text style={styles.fabLabelText}>{item.label}</Text>
              </View>
              <TouchableOpacity style={styles.fabMiniBtn} activeOpacity={0.8} onPress={() => handleFabItem(item.type)}>
                <Icon name={item.icon} size={22} color={palette.surface} />
              </TouchableOpacity>
            </Animated.View>
          );
        })}

        {/* Main FAB — larger + icon */}
        <TouchableOpacity style={styles.fab} activeOpacity={0.85} onPress={toggleFab}>
          <Animated.View style={{ transform: [{ rotate: fabRotate }] }}>
            <Icon name="add" size={36} color={palette.surface} />
          </Animated.View>
        </TouchableOpacity>
      </View>

      {/* ── Edit Balance Modal ─────────────────────────────────────────────────── */}
      <Modal visible={!!editTarget} transparent animationType="slide" onRequestClose={() => setEditTarget(null)}>
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setEditTarget(null)} />
          {editTarget && (
            <View style={styles.modalSheet}>
              <View style={styles.modalHandle} />
              <View style={styles.modalHeader}>
                <View style={[styles.modalIconWrapper, { backgroundColor: editTarget.accent }]}>
                  {editTarget.icon === 'gcash-svg' ? (
                    <GcashSvg width={22} height={22} />
                  ) : editTarget.icon === 'bdo-svg' ? (
                    <BdoSvg width={22} height={22} />
                  ) : (
                    <Icon name={editTarget.icon} size={22} color="#FFF" />
                  )}
                </View>
                <View>
                  <Text style={styles.modalTitle}>{editTarget.name}</Text>
                  <Text style={styles.modalSubtitle}>Enter your current balance</Text>
                </View>
              </View>
              <View style={[styles.inputWrapper, { borderBottomColor: editTarget.accent }]}>
                <Text style={[styles.currencySymbol, { color: editTarget.accent }]}>₱</Text>
                <TextInput
                  style={styles.balanceInput}
                  keyboardType="decimal-pad"
                  value={editInput}
                  onChangeText={setEditInput}
                  placeholder="0.00"
                  placeholderTextColor={palette.muted}
                  cursorColor={editTarget.accent}
                  autoFocus
                />
              </View>
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.modalBtnSecondary} onPress={() => setEditTarget(null)} activeOpacity={0.7}>
                  <Text style={styles.modalBtnSecondaryText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalBtnPrimary, { backgroundColor: editTarget.accent }]}
                  onPress={handleSaveEdit}
                  activeOpacity={0.8}
                >
                  <Icon name="check" size={20} color="#FFF" />
                  <Text style={styles.modalBtnPrimaryText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </KeyboardAvoidingView>
      </Modal>

      {/* ── Add Account Modal ──────────────────────────────────────────────────── */}
      <Modal visible={showAddModal} transparent animationType="slide" onRequestClose={() => setShowAddModal(false)}>
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setShowAddModal(false)} />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <View style={[styles.modalIconWrapper, { backgroundColor: palette.primary }]}>
                <Icon name={iconForType(newType)} size={22} color="#FFF" />
              </View>
              <View>
                <Text style={styles.modalTitle}>New Account</Text>
                <Text style={styles.modalSubtitle}>Add a bank, e-wallet, or cash source</Text>
              </View>
            </View>

            <Text style={styles.fieldLabel}>Account Name</Text>
            <View style={[styles.inputWrapper, { borderBottomColor: palette.primary }]}>
              <TextInput
                style={[styles.balanceInput, { fontSize: 22 }]}
                value={newName}
                onChangeText={setNewName}
                placeholder="e.g. Landbank, SeaBank…"
                placeholderTextColor={palette.muted}
                cursorColor={palette.primary}
                autoFocus
              />
            </View>

            <Text style={[styles.fieldLabel, { marginTop: spacing.lg }]}>Account Type</Text>
            <View style={styles.typeSelector}>
              {ACCOUNT_TYPE_OPTIONS.map((opt) => {
                const active = newType === opt.type;
                return (
                  <TouchableOpacity
                    key={opt.type}
                    style={[styles.typeChip, active && styles.typeChipActive]}
                    onPress={() => setNewType(opt.type)}
                    activeOpacity={0.75}
                  >
                    <Icon name={opt.icon} size={15} color={active ? palette.surface : palette.body} />
                    <Text style={[styles.typeChipText, active && styles.typeChipTextActive]}>{opt.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={[styles.fieldLabel, { marginTop: spacing.lg }]}>Starting Balance</Text>
            <View style={[styles.inputWrapper, { borderBottomColor: palette.primary }]}>
              <Text style={[styles.currencySymbol, { color: palette.primary }]}>₱</Text>
              <TextInput
                style={styles.balanceInput}
                keyboardType="decimal-pad"
                value={newBalance}
                onChangeText={setNewBalance}
                placeholder="0.00"
                placeholderTextColor={palette.muted}
                cursorColor={palette.primary}
              />
            </View>

            <View style={[styles.modalActions, { marginTop: spacing.xxl }]}>
              <TouchableOpacity style={styles.modalBtnSecondary} onPress={() => setShowAddModal(false)} activeOpacity={0.7}>
                <Text style={styles.modalBtnSecondaryText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtnPrimary, { backgroundColor: newName.trim() ? palette.primary : palette.border }]}
                onPress={handleAddAccount}
                disabled={!newName.trim()}
                activeOpacity={0.8}
              >
                <Icon name="add" size={20} color={newName.trim() ? '#FFF' : palette.muted} />
                <Text style={[styles.modalBtnPrimaryText, !newName.trim() && { color: palette.muted }]}>
                  Add Account
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.bg },

  // Removed bottom padding entirely — FAB floats above, no reserved space needed
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.xxxl,
  },

  header: { marginBottom: spacing.xl },
  headerText: { color: palette.ink, fontSize: 24, fontFamily: typography.primaryBold },

  // Total card
  totalCard: {
    backgroundColor: palette.primary,
    borderRadius: 28,
    padding: spacing.xl,
    marginBottom: spacing.xxl,
    elevation: 4,
    shadowColor: palette.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  totalLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    fontFamily: typography.primaryMedium,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  totalAmount: { color: palette.surface, fontSize: 38, fontFamily: typography.primaryBold, marginBottom: spacing.lg },
  totalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  totalFooterText: { color: palette.surface, fontSize: 13, fontFamily: typography.primaryMedium },

  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  sectionTitle: { color: palette.ink, fontSize: 20, fontFamily: typography.primaryBold },
  sectionHint: { color: palette.muted, fontSize: 12, fontFamily: typography.primaryRegular },

  // Bento grid
  bentoGrid: { flexDirection: 'row', gap: spacing.md },
  bentoColumn: { flex: 1, gap: spacing.md },

  // Bigger card — more padding, taller via minHeight
  bentoCard: {
    borderRadius: 28,          // slightly rounder than before (was 24)
    padding: 20,               // more generous padding (was spacing.lg ≈ 16)
    minHeight: 185,            // taller cards
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    elevation: 1,
    justifyContent: 'space-between',
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  // Slightly larger icon circle
  cardIconWrapper: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  cardLabelBadge: { borderWidth: 1, borderRadius: 20, paddingVertical: 3, paddingHorizontal: 7 },
  cardLabelText: { fontSize: 8, fontFamily: typography.primaryBold, textTransform: 'uppercase', letterSpacing: 0.4 },
  cardName: { color: palette.ink, fontSize: 15, fontFamily: typography.primaryBold, marginBottom: spacing.sm },
  cardAmount: { color: palette.ink, fontSize: 18, fontFamily: typography.primaryBold },
  cardAmountEmpty: { color: palette.muted, fontSize: 18, fontFamily: typography.primaryBold },
  cardHint: { color: palette.muted, fontSize: 11, fontFamily: typography.primaryRegular, marginTop: 2 },

  // ── FAB ──────────────────────────────────────────────────────────────────────
  fabBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
    zIndex: 10,
  },
  fabContainer: {
    position: 'absolute',
    bottom: spacing.xxl,
    right: spacing.xl,
    alignItems: 'flex-end',
    zIndex: 20,
    gap: spacing.md,
  },
  fabItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  fabItemHidden: { opacity: 0 },
  fabLabel: {
    backgroundColor: palette.surface,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  fabLabelText: { color: palette.ink, fontSize: 14, fontFamily: typography.primaryMedium },
  fabMiniBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: palette.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  // Larger main FAB to accommodate bigger icon
  fab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: palette.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    marginTop: spacing.sm,
  },

  // ── Modals ────────────────────────────────────────────────────────────────────
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: palette.surface,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxxl,
    elevation: 24,
  },
  modalHandle: { width: 40, height: 4, backgroundColor: palette.border, borderRadius: 2, alignSelf: 'center', marginBottom: spacing.xl },
  modalHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.xl },
  modalIconWrapper: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  modalTitle: { color: palette.ink, fontSize: 20, fontFamily: typography.primaryBold },
  modalSubtitle: { color: palette.body, fontSize: 14, fontFamily: typography.primaryRegular, marginTop: 2 },

  fieldLabel: {
    color: palette.body,
    fontSize: 12,
    fontFamily: typography.primaryMedium,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 2,
    paddingBottom: spacing.sm,
    marginBottom: spacing.sm,
  },
  currencySymbol: { fontSize: 26, fontFamily: typography.primaryBold, marginRight: spacing.sm },
  balanceInput: { flex: 1, color: palette.ink, fontSize: 32, fontFamily: typography.primaryBold, padding: 0 },

  typeSelector: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: palette.border,
    backgroundColor: palette.bg,
  },
  typeChipActive: { backgroundColor: palette.primary, borderColor: palette.primary },
  typeChipText: { color: palette.body, fontSize: 13, fontFamily: typography.primaryMedium },
  typeChipTextActive: { color: palette.surface },

  // Rounder modal buttons — borderRadius bumped to 28 (was 20)
  modalActions: { flexDirection: 'row', gap: spacing.md },
  modalBtnSecondary: {
    flex: 1,
    paddingVertical: 17,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.bg,
    borderWidth: 1,
    borderColor: palette.border,
  },
  modalBtnSecondaryText: { color: palette.ink, fontSize: 16, fontFamily: typography.primaryMedium },
  modalBtnPrimary: {
    flex: 2,
    flexDirection: 'row',
    paddingVertical: 17,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    elevation: 2,
  },
  modalBtnPrimaryText: { color: '#FFF', fontSize: 16, fontFamily: typography.primaryBold },
});