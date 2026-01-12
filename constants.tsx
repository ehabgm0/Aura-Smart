
import React from 'react';
import { 
  Smartphone, 
  Zap, 
  Banknote, 
  Coins 
} from 'lucide-react';

export const TARGET_DAILY_PROFIT = 0.01; 
export const MIN_DAILY_PROFIT = 0.004; 
export const MAX_DAILY_PROFIT = 0.012; 

export const MIN_WITHDRAW_EGP = 50;
export const MIN_DEPOSIT_EGP = 100;
export const LOCK_IN_PERIOD_DAYS = 7; 

// الرسوم الجديدة للسحب
export const WITHDRAWAL_FEE_FIXED = 50; // 50 ج.م أو 1 دولار
export const WITHDRAWAL_LARGE_THRESHOLD = 5000;
export const WITHDRAWAL_LARGE_FEE_PERCENT = 0.10; // نسبة متوسطة تغطي خسائر تسييل رأس المال (5% - 30%)

export const PROFIT_DISTRIBUTION = [
  { label: 'أرباح المستثمر', percent: 60, color: '#fbbf24' },
  { label: 'رواتب الموظفين', percent: 25, color: '#10b981' },
  { label: 'تطوير الأدوات', percent: 10, color: '#3b82f6' },
  { label: 'صندوق الطوارئ', percent: 5, color: '#ef4444' }
];

export const INVESTMENT_TIERS = [
  { amount: 100, label: 'بداية ذكية' },
  { amount: 1000, label: 'احترافي' },
  { amount: 5000, label: 'نود متقدم' },
  { amount: 10000, label: 'شريك فضي' },
  { amount: 25000, label: 'نود ملكي' },
];

export interface PaymentMethodDetail {
  label: string;
  account: string;
  icon: React.ReactNode;
  description: string;
  depositFee: string;
  withdrawFee: string;
}

export const PAYMENT_METHODS_DETAILS: Record<string, PaymentMethodDetail> = {
  VODAFONE_CASH: { 
    label: 'فودافون كاش', 
    account: '01022679250', 
    icon: <Smartphone className="w-5 h-5" />,
    description: 'أسرع وسيلة تحويل محلي في مصر',
    depositFee: '1% (رسوم الشبكة)',
    withdrawFee: '1% (رسوم تحويل)'
  },
  INSTAPAY: { 
    label: 'انستا باي', 
    account: 'ehab5199', 
    icon: <Zap className="w-5 h-5" />,
    description: 'تحويل لحظي مباشر للبنك',
    depositFee: '0% (مجاني)',
    withdrawFee: '0% (مجاني)'
  },
  ETISALAT_CASH: { 
    label: 'اتصالات كاش', 
    account: '01140057253', 
    icon: <Banknote className="w-5 h-5" />,
    description: 'محفظة اتصالات كاش',
    depositFee: '1%',
    withdrawFee: '1%'
  },
  CRYPTO_USDT: { 
    label: 'USDT (TRC20)', 
    account: 'Contact Support', 
    icon: <Coins className="w-5 h-5" />,
    description: 'عملات رقمية مستقرة',
    depositFee: '1 USDT',
    withdrawFee: '2 USDT'
  }
};
