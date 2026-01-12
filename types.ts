export enum TransactionType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL',
  PROFIT = 'PROFIT'
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export enum PaymentMethod {
  VODAFONE_CASH = 'VODAFONE_CASH',
  INSTAPAY = 'INSTAPAY',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CRYPTO_USDT = 'CRYPTO_USDT',
  CRYPTO_BTC = 'CRYPTO_BTC',
  CRYPTO_SOL = 'CRYPTO_SOL',
  CRYPTO_ETH = 'CRYPTO_ETH'
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  method: PaymentMethod;
  timestamp: number;
  screenshotUrl?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  balance: number; // Current withdrawable profit
  investedAmount: number; // Principal
  joinDate: number;
  lastProfitClaim?: number;
}

export interface AppState {
  users: User[];
  transactions: Transaction[];
  currentUser: User | null;
}