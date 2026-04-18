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
  Animated,
  Pressable,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import all local provider SVGs
import GcashSvg from '../../assets/images/gcash.svg';
import BdoSvg from '../../assets/images/bdo.svg';
import MayaSvg from '../../assets/images/maya.svg';
import LandbankSvg from '../../assets/images/landbank.svg';
import BpiSvg from '../../assets/images/bpi.svg';
import MaribankSvg from '../../assets/images/maribank.svg';
import PaypalSvg from '../../assets/images/paypal.svg';

import { palette, spacing, typography } from '../tokens';
import {
  useWalletStore,
  CustomAccount,
  AccountType,
  pickAccent,
  iconForType,
  labelForType,
} from '../store/useWalletStore';

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

// ─── Provider Data Dictionary ──────────────────────────────────────────────
const PROVIDERS = {
  ewallet: [
    { id: 'gcash', name: 'GCash', icon: 'gcash-svg', accent: '#007AFF', bgAccent: '#EAF3FF' },
    { id: 'maya', name: 'Maya', icon: 'maya-svg', accent: '#00B14F', bgAccent: '#E6F8EE' },
    { id: 'paypal', name: 'PayPal', icon: 'paypal-svg', accent: '#0079C1', bgAccent: '#E5F2F9' },
    { id: 'custom', name: 'Other E-Wallet', icon: 'account-balance-wallet', accent: palette.primary, bgAccent: palette.bg },
  ],
  bank: [
    { id: 'bdo', name: 'BDO Unibank', icon: 'bdo-svg', accent: '#0b2972', bgAccent: '#EEF1FA' },
    { id: 'bpi', name: 'BPI', icon: 'bpi-svg', accent: '#B11116', bgAccent: '#FCEAEB' },
    { id: 'landbank', name: 'Landbank', icon: 'landbank-svg', accent: '#267B3B', bgAccent: '#E9F5EB' },
    { id: 'maribank', name: 'MariBank', icon: 'maribank-svg', accent: '#EE4D2D', bgAccent: '#FDEEEA' },
    { id: 'custom', name: 'Other Bank', icon: 'account-balance', accent: palette.primary, bgAccent: palette.bg },
  ],
  cash: [
    { id: 'cash', name: 'Physical Cash', icon: 'payments', accent: '#7B5EA7', bgAccent: '#F1ECF9' },
    { id: 'custom', name: 'Custom Wallet', icon: 'payments', accent: palette.primary, bgAccent: palette.bg },
  ]
};

function formatAmount(value: number) {
  return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ─── Reusable Icon Renderer ───────────────────────────────────────────────
function ProviderIcon({ icon, size, color = '#FFFFFF' }: { icon: string; size: number; color?: string }) {
  if (icon === 'gcash-svg') return <GcashSvg width={size} height={size} />;
  if (icon === 'bdo-svg') return <BdoSvg width={size} height={size} />;
  if (icon === 'maya-svg') return <MayaSvg width={size} height={size} />;
  if (icon === 'landbank-svg') return <LandbankSvg width={size} height={size} />;
  if (icon === 'bpi-svg') return <BpiSvg width={size} height={size} />;
  if (icon === 'maribank-svg') return <MaribankSvg width={size} height={size} />;
  if (icon === 'paypal-svg') return <PaypalSvg width={size} height={size} />;

  return <Icon name={icon} size={size * 0.6} color={color} />;
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
      delayLongPress={400}
    >
      <View style={styles.cardTopRow}>
        <View style={[
          styles.cardIconWrapper,
          { backgroundColor: icon.endsWith('-svg') ? 'transparent' : accent },
        ]}>
          <ProviderIcon icon={icon} size={40} />
        </View>
        <View style={[styles.cardLabelBadge, { borderColor: accent + '44' }]}>
          <Text style={[styles.cardLabelText, { color: accent }]}>{label}</Text>
        </View>
      </View>

      <Text style={styles.cardName}>{name}</Text>

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
  const { customAccounts, updateAccountBalance, addAccount, removeAccount } = useWalletStore();
  const safeCustom = customAccounts ?? [];

  // ── FAB & Scroll State ──
  const [fabOpen, setFabOpen] = useState(false);
  const fabAnim = useRef(new Animated.Value(0)).current;

  // Hide on scroll down mechanics
  const [isFabVisible, setIsFabVisible] = useState(true);
  const lastScrollY = useRef(0);
  const fabTranslateY = useRef(new Animated.Value(0)).current;

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;

    // Scroll down: Hide FAB
    if (currentScrollY > lastScrollY.current + 10 && currentScrollY > 50) {
      if (isFabVisible) {
        setIsFabVisible(false);
        if (fabOpen) closeFab(); // Close the menu if they scroll while it's open
        Animated.spring(fabTranslateY, {
          toValue: 150, // Move it off-screen downwards
          useNativeDriver: true,
          tension: 40,
          friction: 8,
        }).start();
      }
    }
    // Scroll up or top: Show FAB
    else if (currentScrollY < lastScrollY.current - 10 || currentScrollY <= 0) {
      if (!isFabVisible) {
        setIsFabVisible(true);
        Animated.spring(fabTranslateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 40,
          friction: 8,
        }).start();
      }
    }
    lastScrollY.current = currentScrollY;
  };

  const toggleFab = () => {
    Animated.spring(fabAnim, { toValue: fabOpen ? 0 : 1, useNativeDriver: true, tension: 60, friction: 8 }).start();
    setFabOpen((v) => !v);
  };

  const closeFab = () => {
    Animated.spring(fabAnim, { toValue: 0, useNativeDriver: true, tension: 60, friction: 8 }).start();
    setFabOpen(false);
  };

  // ── Edit balance modal ──
  const [editTarget, setEditTarget] = useState<{ id: string; name: string; accent: string; icon: string } | null>(null);
  const [editInput, setEditInput] = useState('');

  // ── Add account modal ──
  const [showAddModal, setShowAddModal] = useState(false);
  const [newType, setNewType]           = useState<AccountType>('bank');
  const [selectedProvider, setSelectedProvider] = useState(PROVIDERS['bank'][0]);
  const [newName, setNewName]           = useState('');
  const [newBalance, setNewBalance]     = useState('');

  // ── Delete confirmation modal ──
  const [deleteTarget, setDeleteTarget] = useState<CustomAccount | null>(null);

  const totalBalance = safeCustom.reduce((s, a) => s + Number(a.balance || 0), 0);

  // ── Handlers ──
  const openCustomEdit = (account: CustomAccount) => {
    setEditTarget({ id: account.id, name: account.name, accent: account.accent, icon: account.icon });
    setEditInput(account.balance === 0 ? '' : account.balance.toString());
  };

  const handleSaveEdit = () => {
    if (!editTarget) return;
    updateAccountBalance(editTarget.id, parseFloat(editInput) || 0);
    setEditTarget(null);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      removeAccount(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  const handleFabItem = (type: AccountType) => {
    closeFab();
    setNewType(type);
    setSelectedProvider(PROVIDERS[type][0]);
    setNewName('');
    setNewBalance('');
    setTimeout(() => setShowAddModal(true), 150);
  };

  const handleTypeSwitch = (type: AccountType) => {
    setNewType(type);
    setSelectedProvider(PROVIDERS[type][0]);
    setNewName('');
  };

  const handleAddAccount = () => {
    const isCustom = selectedProvider.id === 'custom';
    const finalName = isCustom ? newName.trim() : selectedProvider.name;
    if (!finalName) return;

    const colors = isCustom ? pickAccent(safeCustom.length) : { accent: selectedProvider.accent, bgAccent: selectedProvider.bgAccent };

    addAccount({
      name:     finalName,
      type:     newType,
      balance:  parseFloat(newBalance) || 0,
      accent:   colors.accent,
      bgAccent: colors.bgAccent,
      icon:     isCustom ? iconForType(newType) : selectedProvider.icon,
    });
    setShowAddModal(false);
  };

  // ── Grid Setup ──
  const allCards = safeCustom.map((c) => ({ ...c, label: labelForType(c.type), amount: Number(c.balance || 0) }));
  const leftCol  = allCards.filter((_, i) => i % 2 === 0);
  const rightCol = allCards.filter((_, i) => i % 2 === 1);
  const fabRotate = fabAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '45deg'] });

  const isCustomActive = selectedProvider.id === 'custom';
  const isAddReady = isCustomActive ? newName.trim().length > 0 : true;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
        decelerationRate="normal"
        scrollEventThrottle={16}
        removeClippedSubviews={true}
        onScroll={handleScroll}
      >
        <View style={styles.header}>
          <Text style={styles.headerText}>Your wallet</Text>
        </View>

        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Total Balance</Text>
          <Text style={styles.totalAmount}>₱ {formatAmount(totalBalance)}</Text>
          <View style={styles.totalFooter}>
            <Text style={styles.totalFooterText}>All Savings</Text>
          </View>
        </View>

        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Accounts & Wallets</Text>
          {safeCustom.length > 0 && <Text style={styles.sectionHint}>Tap to edit · Hold to remove</Text>}
        </View>

        {safeCustom.length === 0 && (
          <View style={styles.emptyState}>
            <Icon name="account-balance-wallet" size={48} color={palette.border} />
            <Text style={styles.emptyStateText}>No accounts yet.</Text>
            <Text style={styles.emptyStateSubtext}>Tap the + button to add your first wallet or bank.</Text>
          </View>
        )}

        <View style={styles.bentoGrid}>
          <View style={styles.bentoColumn}>
            {leftCol.map((card) => <BentoCard key={card.id} {...card} onPress={() => openCustomEdit(card as CustomAccount)} onLongPress={() => setDeleteTarget(card as CustomAccount)} />)}
          </View>
          <View style={styles.bentoColumn}>
            {rightCol.map((card) => <BentoCard key={card.id} {...card} onPress={() => openCustomEdit(card as CustomAccount)} onLongPress={() => setDeleteTarget(card as CustomAccount)} />)}
          </View>
        </View>
      </ScrollView>

      {/* ── FAB ──────────────────────────────────────────────────────── */}
      {fabOpen && <Pressable style={styles.fabBackdrop} onPress={closeFab} />}
      <Animated.View style={[styles.fabContainer, { transform: [{ translateY: fabTranslateY }] }]} pointerEvents="box-none">
        {FAB_ITEMS.map((item, index) => {
          const itemTranslateY = fabAnim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] });
          const itemOpacity    = fabAnim.interpolate({ inputRange: [Math.max(0, index * 0.08), Math.min(1, index * 0.08 + 0.5)], outputRange: [0, 1], extrapolate: 'clamp' });
          return (
            <Animated.View key={item.type} style={[styles.fabItemRow, { opacity: itemOpacity, transform: [{ translateY: itemTranslateY }] }, !fabOpen && styles.fabItemHidden]} pointerEvents={fabOpen ? 'auto' : 'none'}>
              <View style={styles.fabLabel}><Text style={styles.fabLabelText}>{item.label}</Text></View>
              <TouchableOpacity style={styles.fabMiniBtn} activeOpacity={0.8} onPress={() => handleFabItem(item.type)}>
                <Icon name={item.icon} size={22} color={palette.surface} />
              </TouchableOpacity>
            </Animated.View>
          );
        })}
        <TouchableOpacity style={styles.fab} activeOpacity={0.85} onPress={toggleFab}>
          <Animated.View style={{ transform: [{ rotate: fabRotate }] }}><Icon name="add" size={36} color={palette.surface} /></Animated.View>
        </TouchableOpacity>
      </Animated.View>

      {/* ── Edit Balance Modal ─────────────────────────────────────────────────── */}
      <Modal visible={!!editTarget} transparent animationType="slide" onRequestClose={() => setEditTarget(null)}>
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setEditTarget(null)} />
          {editTarget && (
            <View style={styles.modalSheet}>
              <View style={styles.modalHandle} />
              <View style={styles.modalHeader}>
                <View style={[styles.modalIconWrapper, { backgroundColor: editTarget.icon.endsWith('-svg') ? 'transparent' : editTarget.accent }]}>
                  <ProviderIcon icon={editTarget.icon} size={48} />
                </View>
                <View>
                  <Text style={styles.modalTitle}>{editTarget.name}</Text>
                  <Text style={styles.modalSubtitle}>Enter your current balance</Text>
                </View>
              </View>
              <View style={[styles.inputWrapper, { borderBottomColor: editTarget.accent }]}>
                <Text style={[styles.currencySymbol, { color: editTarget.accent }]}>₱</Text>
                <TextInput style={styles.balanceInput} keyboardType="decimal-pad" value={editInput} onChangeText={setEditInput} placeholder="0.00" placeholderTextColor={palette.muted} cursorColor={editTarget.accent} autoFocus />
              </View>
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.modalBtnSecondary} onPress={() => setEditTarget(null)} activeOpacity={0.7}>
                  <Text style={styles.modalBtnSecondaryText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalBtnPrimary, { backgroundColor: editTarget.accent }]} onPress={handleSaveEdit} activeOpacity={0.8}>
                  <Icon name="check" size={20} color="#FFF" />
                  <Text style={styles.modalBtnPrimaryText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </KeyboardAvoidingView>
      </Modal>

      {/* ── Custom Delete Confirmation Modal ────────────────────────────────────── */}
      <Modal visible={!!deleteTarget} transparent animationType="fade" onRequestClose={() => setDeleteTarget(null)}>
        <View style={styles.centerModalOverlay}>
          <View style={styles.centerModalBox}>
            <View style={styles.centerModalIcon}>
              <Icon name="delete-outline" size={32} color="#D32F2F" />
            </View>
            <Text style={styles.centerModalTitle}>Remove {deleteTarget?.name}?</Text>
            <Text style={styles.centerModalText}>
              This will permanently delete the account and clear its balance from your offline ledger.
            </Text>
            <View style={styles.centerModalActions}>
              <TouchableOpacity style={styles.modalBtnSecondary} onPress={() => setDeleteTarget(null)} activeOpacity={0.7}>
                <Text style={styles.modalBtnSecondaryText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtnPrimary, { backgroundColor: '#D32F2F' }]} onPress={confirmDelete} activeOpacity={0.8}>
                <Text style={styles.modalBtnPrimaryText}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
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
                <Text style={styles.modalSubtitle}>Select your provider to link.</Text>
              </View>
            </View>

            {/* Type Selector */}
            <Text style={styles.fieldLabel}>Account Type</Text>
            <View style={styles.typeSelector}>
              {ACCOUNT_TYPE_OPTIONS.map((opt) => {
                const active = newType === opt.type;
                return (
                  <TouchableOpacity key={opt.type} style={[styles.typeChip, active && styles.typeChipActive]} onPress={() => handleTypeSwitch(opt.type)} activeOpacity={0.75}>
                    <Icon name={opt.icon} size={15} color={active ? palette.surface : palette.body} />
                    <Text style={[styles.typeChipText, active && styles.typeChipTextActive]}>{opt.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Provider Horizontal Scroll */}
            <Text style={[styles.fieldLabel, { marginTop: spacing.xl }]}>Select Provider</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.providerScroll}>
              {PROVIDERS[newType].map((prov) => {
                const isActive = selectedProvider.id === prov.id;
                return (
                  <TouchableOpacity
                    key={prov.id}
                    style={[styles.providerCard, isActive && styles.providerCardActive, isActive && { borderColor: prov.accent }]}
                    onPress={() => setSelectedProvider(prov)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.providerIconFrame, { backgroundColor: prov.icon.endsWith('-svg') ? 'transparent' : prov.accent }]}>
                      <ProviderIcon icon={prov.icon} size={32} />
                    </View>
                    <Text style={[styles.providerName, isActive && { color: palette.ink, fontFamily: typography.primaryBold }]}>
                      {prov.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Manual Entry (Only if 'Custom' is selected) */}
            {isCustomActive && (
              <Animated.View>
                <Text style={[styles.fieldLabel, { marginTop: spacing.lg }]}>Custom Account Name</Text>
                <View style={[styles.inputWrapper, { borderBottomColor: palette.primary }]}>
                  <TextInput style={[styles.balanceInput, { fontSize: 22 }]} value={newName} onChangeText={setNewName} placeholder="e.g. Cooperative Bank..." placeholderTextColor={palette.muted} cursorColor={palette.primary} autoFocus />
                </View>
              </Animated.View>
            )}

            {/* Starting Balance */}
            <Text style={[styles.fieldLabel, { marginTop: spacing.lg }]}>Starting Balance</Text>
            <View style={[styles.inputWrapper, { borderBottomColor: selectedProvider.accent }]}>
              <Text style={[styles.currencySymbol, { color: selectedProvider.accent }]}>₱</Text>
              <TextInput style={styles.balanceInput} keyboardType="decimal-pad" value={newBalance} onChangeText={setNewBalance} placeholder="0.00" placeholderTextColor={palette.muted} cursorColor={selectedProvider.accent} />
            </View>

            <View style={[styles.modalActions, { marginTop: spacing.xxl }]}>
              <TouchableOpacity style={styles.modalBtnSecondary} onPress={() => setShowAddModal(false)} activeOpacity={0.7}>
                <Text style={styles.modalBtnSecondaryText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtnPrimary, { backgroundColor: isAddReady ? selectedProvider.accent : palette.border }]} onPress={handleAddAccount} disabled={!isAddReady} activeOpacity={0.8}>
                <Icon name="add" size={20} color={isAddReady ? '#FFF' : palette.muted} />
                <Text style={[styles.modalBtnPrimaryText, !isAddReady && { color: palette.muted }]}>Link Account</Text>
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
  scrollContent: { paddingHorizontal: spacing.xl, paddingTop: spacing.xxxl, paddingBottom: spacing.xxxl },
  header: { marginBottom: spacing.xl },
  headerText: { color: palette.ink, fontSize: 24, fontFamily: typography.primaryBold },

  totalCard: { backgroundColor: palette.primary, borderRadius: 28, padding: spacing.xl, marginBottom: spacing.xxl, elevation: 4, shadowColor: palette.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8 },
  totalLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontFamily: typography.primaryMedium, marginBottom: spacing.xs, textTransform: 'uppercase', letterSpacing: 0.8 },
  totalAmount: { color: palette.surface, fontSize: 38, fontFamily: typography.primaryBold, marginBottom: spacing.lg },
  totalFooter: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, backgroundColor: 'rgba(255,255,255,0.15)', paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: 20, alignSelf: 'flex-start' },
  totalFooterText: { color: palette.surface, fontSize: 13, fontFamily: typography.primaryMedium },

  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg },
  sectionTitle: { color: palette.ink, fontSize: 20, fontFamily: typography.primaryBold },
  sectionHint: { color: palette.muted, fontSize: 12, fontFamily: typography.primaryRegular },

  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.xxxl },
  emptyStateText: { color: palette.ink, fontSize: 18, fontFamily: typography.primaryBold, marginTop: spacing.md },
  emptyStateSubtext: { color: palette.body, fontSize: 14, fontFamily: typography.primaryRegular, marginTop: spacing.sm, textAlign: 'center' },

  bentoGrid: { flexDirection: 'row', gap: spacing.md },
  bentoColumn: { flex: 1, gap: spacing.md },
  bentoCard: { borderRadius: 28, padding: 20, minHeight: 185, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)', elevation: 1, justifyContent: 'space-between' },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  cardIconWrapper: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  cardLabelBadge: { borderWidth: 1, borderRadius: 20, paddingVertical: 3, paddingHorizontal: 7 },
  cardLabelText: { fontSize: 8, fontFamily: typography.primaryBold, textTransform: 'uppercase', letterSpacing: 0.4 },
  cardName: { color: palette.ink, fontSize: 15, fontFamily: typography.primaryBold, marginBottom: spacing.sm },
  cardAmount: { color: palette.ink, fontSize: 18, fontFamily: typography.primaryBold },
  cardAmountEmpty: { color: palette.muted, fontSize: 18, fontFamily: typography.primaryBold },
  cardHint: { color: palette.muted, fontSize: 11, fontFamily: typography.primaryRegular, marginTop: 2 },

  fabBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)', zIndex: 10 },
  fabContainer: { position: 'absolute', bottom: spacing.xxl, right: spacing.xl, alignItems: 'flex-end', zIndex: 20, gap: spacing.md },
  fabItemRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  fabItemHidden: { opacity: 0 },
  fabLabel: { backgroundColor: palette.surface, paddingVertical: spacing.sm, paddingHorizontal: spacing.lg, borderRadius: 20, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4 },
  fabLabelText: { color: palette.ink, fontSize: 14, fontFamily: typography.primaryMedium },
  fabMiniBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: palette.primary, alignItems: 'center', justifyContent: 'center', elevation: 4, shadowColor: palette.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4 },
  fab: { width: 64, height: 64, borderRadius: 32, backgroundColor: palette.primary, alignItems: 'center', justifyContent: 'center', elevation: 6, shadowColor: palette.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8, marginTop: spacing.sm },

  // Bottom Sheet Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: palette.surface, borderTopLeftRadius: 36, borderTopRightRadius: 36, paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.xxxl, elevation: 24 },
  modalHandle: { width: 40, height: 4, backgroundColor: palette.border, borderRadius: 2, alignSelf: 'center', marginBottom: spacing.xl },
  modalHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.xl },
  modalIconWrapper: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  modalTitle: { color: palette.ink, fontSize: 20, fontFamily: typography.primaryBold },
  modalSubtitle: { color: palette.body, fontSize: 14, fontFamily: typography.primaryRegular, marginTop: 2 },

  // Center Modal (For Deletion)
  centerModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  centerModalBox: { backgroundColor: palette.surface, borderRadius: 32, padding: spacing.xl, width: '100%', alignItems: 'center', elevation: 24 },
  centerModalIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#FFEBEE', alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg },
  centerModalTitle: { color: palette.ink, fontSize: 20, fontFamily: typography.primaryBold, marginBottom: spacing.sm, textAlign: 'center' },
  centerModalText: { color: palette.body, fontSize: 15, fontFamily: typography.primaryRegular, textAlign: 'center', marginBottom: spacing.xl, lineHeight: 22 },
  centerModalActions: { flexDirection: 'row', gap: spacing.md, width: '100%' },

  fieldLabel: { color: palette.body, fontSize: 12, fontFamily: typography.primaryMedium, marginBottom: spacing.sm, textTransform: 'uppercase', letterSpacing: 0.6 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 2, paddingBottom: spacing.sm, marginBottom: spacing.sm },
  currencySymbol: { fontSize: 26, fontFamily: typography.primaryBold, marginRight: spacing.sm },
  balanceInput: { flex: 1, color: palette.ink, fontSize: 32, fontFamily: typography.primaryBold, padding: 0 },

  typeSelector: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  typeChip: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: 20, borderWidth: 1.5, borderColor: palette.border, backgroundColor: palette.bg },
  typeChipActive: { backgroundColor: palette.primary, borderColor: palette.primary },
  typeChipText: { color: palette.body, fontSize: 13, fontFamily: typography.primaryMedium },
  typeChipTextActive: { color: palette.surface },

  providerScroll: { paddingVertical: 4, paddingBottom: spacing.sm, gap: spacing.md },
  providerCard: { width: 100, height: 115, borderRadius: 20, backgroundColor: palette.surface, borderWidth: 2, borderColor: palette.border, alignItems: 'center', justifyContent: 'center', padding: spacing.sm, marginRight: spacing.sm },
  providerCardActive: { backgroundColor: palette.bg, elevation: 2 },
  providerIconFrame: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm, overflow: 'hidden' },
  providerName: { fontSize: 12, fontFamily: typography.primaryMedium, color: palette.body, textAlign: 'center' },

  modalActions: { flexDirection: 'row', gap: spacing.md, width: '100%' },
  modalBtnSecondary: { flex: 1, paddingVertical: 17, borderRadius: 28, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.bg, borderWidth: 1, borderColor: palette.border },
  modalBtnSecondaryText: { color: palette.ink, fontSize: 16, fontFamily: typography.primaryMedium },
  modalBtnPrimary: { flex: 2, flexDirection: 'row', paddingVertical: 17, borderRadius: 28, alignItems: 'center', justifyContent: 'center', gap: spacing.sm, elevation: 2 },
  modalBtnPrimaryText: { color: '#FFF', fontSize: 16, fontFamily: typography.primaryBold },
});