import { create } from 'zustand';
import {
  initDB,
  dbGetAllAccounts,
  dbAddAccount,
  dbUpdateBalance,
  dbRemoveAccount,
  dbGetUserName,
  dbSetUserName,
  dbGetSecurityLogs, // NEW
  dbClearSecurityLogs // NEW
} from '../database/db';

export type AccountType = 'bank' | 'ewallet' | 'cash';

export interface CustomAccount {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  accent: string;
  bgAccent: string;
  icon: string;
}

// NEW interface for security logs
export interface SecurityLog {
  id: string;
  title: string;
  sender: string;
  time: string;
}

interface WalletState {
  customAccounts: CustomAccount[];
  securityLogs: SecurityLog[]; // NEW
  isInitialized: boolean;
  userName: string;
  setUserName: (name: string) => void;
  clearLogs: () => void; // NEW

  // Actions
  initialize: () => void;
  addAccount: (acc: Omit<CustomAccount, 'id'>) => void;
  updateAccountBalance: (id: string, newBalance: number) => void;
  removeAccount: (id: string) => void;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  customAccounts: [],
  securityLogs: [], // NEW
  isInitialized: false,
  userName: '',

  setUserName: (name) => {
    dbSetUserName(name);
    set({ userName: name });
  },

  // NEW action to clear logs from state and DB
  clearLogs: () => {
    dbClearSecurityLogs();
    set({ securityLogs: [] });
  },

  // 1. Boot up the database and load saved data
  initialize: () => {
    if (get().isInitialized) return;

    initDB();
    const savedAccounts = dbGetAllAccounts();
    const savedName = dbGetUserName();
    const savedLogs = dbGetSecurityLogs() as SecurityLog[]; // NEW

    set({
      customAccounts: savedAccounts,
      securityLogs: savedLogs, // NEW
      userName: savedName,
      isInitialized: true
    });
  },

  // 2. Add an account to state AND SQLite
  addAccount: (acc) => {
    const newId = Math.random().toString(36).substring(2, 9);
    const newAccount: CustomAccount = { ...acc, id: newId };

    dbAddAccount(newAccount);

    set((state) => ({
      customAccounts: [...state.customAccounts, newAccount]
    }));
  },

  // 3. Update balance in state AND SQLite
  updateAccountBalance: (id, newBalance) => {
    dbUpdateBalance(id, newBalance);

    set((state) => ({
      customAccounts: state.customAccounts.map((a) =>
        a.id === id ? { ...a, balance: newBalance } : a
      ),
    }));
  },

  // 4. Delete from state AND SQLite
  removeAccount: (id) => {
    dbRemoveAccount(id);

    set((state) => ({
      customAccounts: state.customAccounts.filter((a) => a.id !== id),
    }));
  },
}));

// ─── Utility functions ───
const ACCENT_COLORS = [
  { accent: '#007AFF', bgAccent: '#EAF3FF' },
  { accent: '#00B14F', bgAccent: '#E6F8EE' },
  { accent: '#7B5EA7', bgAccent: '#F1ECF9' },
  { accent: '#D9534F', bgAccent: '#FBEAEA' },
  { accent: '#F0AD4E', bgAccent: '#FEF6EA' },
];

export function pickAccent(index: number) {
  return ACCENT_COLORS[index % ACCENT_COLORS.length];
}

export function iconForType(type: AccountType) {
  if (type === 'bank') return 'account-balance';
  if (type === 'ewallet') return 'account-balance-wallet';
  if (type === 'cash') return 'payments';
  return 'account-balance-wallet';
}

export function labelForType(type: AccountType) {
  if (type === 'bank') return 'Bank Account';
  if (type === 'ewallet') return 'E-Wallet';
  if (type === 'cash') return 'Physical Cash';
  return 'Custom Account';
}