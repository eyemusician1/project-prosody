import { open } from '@op-engineering/op-sqlite';
import type { CustomAccount, SecurityLog } from '../store/useWalletStore';

// 1. Open or create the database file
export const db = open({ name: 'prosody_vault.sqlite' });

// 2. Initialize the tables
export const initDB = () => {
  // Account Table
  db.executeSync(`
    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      balance REAL NOT NULL,
      accent TEXT NOT NULL,
      bgAccent TEXT NOT NULL,
      icon TEXT NOT NULL
    );
  `);

  // User Profile Table (Forces only 1 row to ever exist)
  db.executeSync(`
    CREATE TABLE IF NOT EXISTS user_profile (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      name TEXT NOT NULL
    );
  `);

  // Security Logs Table - NEW
  db.executeSync(`
    CREATE TABLE IF NOT EXISTS security_logs (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      sender TEXT NOT NULL,
      time TEXT NOT NULL
    );
  `);
};

// ─── User Profile Operations ───
export const dbSetUserName = (name: string) => {
  db.executeSync('INSERT OR REPLACE INTO user_profile (id, name) VALUES (1, ?)', [name]);
};

export const dbGetUserName = (): string => {
  const result = db.executeSync('SELECT name FROM user_profile WHERE id = 1');
  if (result.rows && result.rows.length > 0) {
    const row = result.rows[0] as Record<string, any>;
    return String(row.name || '');
  }
  return '';
};

// ─── Security Log Operations ───
export const dbGetSecurityLogs = () => {
  const result = db.executeSync('SELECT * FROM security_logs ORDER BY id DESC');
  if (result.rows) {
    const rows = result.rows as Record<string, any>[];
    return rows.map((r) => ({
      id: String(r.id),
      title: String(r.title) || '',
      sender: String(r.sender) || '',
      time: String(r.time) || '',
    })) as SecurityLog[];
  }
  return [] as SecurityLog[];
};

export const dbClearSecurityLogs = () => {
  db.executeSync('DELETE FROM security_logs');
};

// ─── Account Operations (CRUD) ───
export const dbAddAccount = (account: CustomAccount) => {
  db.executeSync(
    'INSERT INTO accounts (id, name, type, balance, accent, bgAccent, icon) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [account.id, account.name, account.type, account.balance, account.accent, account.bgAccent, account.icon]
  );
};

export const dbUpdateBalance = (id: string, newBalance: number) => {
  db.executeSync('UPDATE accounts SET balance = ? WHERE id = ?', [newBalance, id]);
};

export const dbRemoveAccount = (id: string) => {
  db.executeSync('DELETE FROM accounts WHERE id = ?', [id]);
};

export const dbGetAllAccounts = (): CustomAccount[] => {
  const result = db.executeSync('SELECT * FROM accounts');
  if (result.rows) {
    const rows = result.rows as any[];
    return rows.map((r) => ({
      id: String(r.id),
      name: String(r.name),
      type: (String(r.type) as any) || 'bank',
      balance: Number(r.balance) || 0,
      accent: String(r.accent) || '#007AFF',
      bgAccent: String(r.bgAccent) || '#EAF3FF',
      icon: String(r.icon) || 'account-balance',
    }));
  }
  return [];
};