import { create } from 'zustand';

// ─── Transaction ─────────────────────────────────────────────────────────────
export interface Transaction {
  id: string;
  title: string;
  date: string;
  amount: number;
  icon: string;
  type: 'income' | 'spend';
}

// ─── Custom Account ───────────────────────────────────────────────────────────
export type AccountType = 'bank' | 'ewallet' | 'cash';

export interface CustomAccount {
  id: string;           // uuid generated at creation
  name: string;         // e.g. "Landbank"
  type: AccountType;    // bank | ewallet | cash
  balance: number;
  accent: string;       // auto-assigned color from a preset palette
  bgAccent: string;
  icon: string;         // MaterialIcon name derived from type
}

// ─── State Shape ──────────────────────────────────────────────────────────────
interface WalletState {
  // Fixed built-in accounts
  balances: {
    gcash: number;
    maya: number;
    bdo: number;
    cash: number;
  };

  // User-added accounts
  customAccounts: CustomAccount[];

  transactions: Transaction[];

  // Actions — built-in
  recalibrate: (newBalances: { gcash: number; maya: number; bdo: number; cash: number }) => void;
  updateBuiltinBalance: (id: 'gcash' | 'maya' | 'bdo' | 'cash', value: number) => void;

  // Actions — custom accounts
  addAccount: (account: Omit<CustomAccount, 'id'>) => void;
  removeAccount: (id: string) => void;
  updateAccountBalance: (id: string, value: number) => void;

  // Actions — transactions
  addTransaction: (tx: Transaction) => void;
}

// ─── Color palette for auto-assignment ───────────────────────────────────────
const ACCENT_POOL = [
  { accent: '#E67E22', bgAccent: '#FEF3E2' },
  { accent: '#16A085', bgAccent: '#E8F8F5' },
  { accent: '#8E44AD', bgAccent: '#F5EEF8' },
  { accent: '#2980B9', bgAccent: '#EBF5FB' },
  { accent: '#C0392B', bgAccent: '#FDEDEC' },
  { accent: '#27AE60', bgAccent: '#EAFAF1' },
  { accent: '#D35400', bgAccent: '#FDF2E9' },
  { accent: '#2C3E50', bgAccent: '#EAECEE' },
];

export function pickAccent(existingCount: number) {
  return ACCENT_POOL[existingCount % ACCENT_POOL.length];
}

export function iconForType(type: AccountType): string {
  if (type === 'bank') return 'account-balance';
  if (type === 'ewallet') return 'account-balance-wallet';
  return 'payments';
}

export function labelForType(type: AccountType): string {
  if (type === 'bank') return 'Bank Account';
  if (type === 'ewallet') return 'E-Wallet';
  return 'Physical Cash';
}

// ─── Store ────────────────────────────────────────────────────────────────────
export const useWalletStore = create<WalletState>((set, get) => ({
  balances: {
    gcash: 4250,
    maya: 0,
    bdo: 0,
    cash: 0,
  },

  customAccounts: [],
  transactions: [],

  // Overwrite all built-in balances at once (used by RecalibrateScreen)
  recalibrate: (newBalances) => set(() => ({ balances: newBalances })),

  // Update a single built-in balance (used by tap-to-edit on WalletScreen)
  updateBuiltinBalance: (id, value) =>
    set((state) => ({
      balances: { ...state.balances, [id]: value },
    })),

  // Add a brand-new custom account
  addAccount: (account) =>
    set((state) => ({
      customAccounts: [
        ...state.customAccounts,
        {
          ...account,
          id: `custom_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        },
      ],
    })),

  // Remove a custom account by id
  removeAccount: (id) =>
    set((state) => ({
      customAccounts: state.customAccounts.filter((a) => a.id !== id),
    })),

  // Update balance of a custom account
  updateAccountBalance: (id, value) =>
    set((state) => ({
      customAccounts: state.customAccounts.map((a) =>
        a.id === id ? { ...a, balance: value } : a
      ),
    })),

  addTransaction: (tx) =>
    set((state) => ({
      transactions: [tx, ...state.transactions],
    })),
}));