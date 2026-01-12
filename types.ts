
export enum TransactionType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL',
  PROFIT = 'PROFIT',
  REFERRAL = 'REFERRAL'
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export enum PaymentMethod {
  VODAFONE_CASH = 'VODAFONE_CASH',
  INSTAPAY = 'INSTAPAY',
  ETISALAT_CASH = 'ETISALAT_CASH',
  OTHER_WALLET = 'OTHER_WALLET',
  CRYPTO_USDT = 'CRYPTO_USDT'
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string; // 'ADMIN' or user id
  text: string;
  timestamp: number;
  isRead: boolean;
}

export interface Transaction {
  id: string;
  userId: string;
  userName?: string;
  amount: number;
  fee?: number;             
  type: TransactionType;
  status: TransactionStatus;
  method: PaymentMethod;
  senderNumber?: string;
  senderName?: string;
  screenshotUrl?: string;
  aiAnalysis?: string;
  timestamp: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  password?: string;
  role: 'USER' | 'ADMIN';
  balance: number;           // الرصيد القابل للسحب
  investedAmount: number;    // رأس المال العامل
  pendingProfits: number;    // الأرباح التي لم تحصد بعد
  matureProfits: number;     
  joinDate: number;
  lastHarvest?: number;      // تاريخ آخر عملية حصاد
  biometricKey?: string;
  status: 'ACTIVE' | 'BANNED' | 'VIP';
  referralCode: string;      
  referredBy?: string;       
}

export interface AppState {
  users: User[];
  transactions: Transaction[];
  messages: Message[];
  currentUser: User | null;
}
