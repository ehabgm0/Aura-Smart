
import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, User, Transaction, TransactionStatus, TransactionType } from '../types';
import { MIN_DAILY_PROFIT, MAX_DAILY_PROFIT } from '../constants';
import { sheetService } from '../services/sheetService';

const INITIAL_DATA: AppState = {
  users: [],
  transactions: [],
  currentUser: null,
};

export function useAppStore() {
  const [state, setState] = useState<AppState>(INITIAL_DATA);
  const [isSyncing, setIsSyncing] = useState(false);
  const lastUpdateRef = useRef<number>(Date.now());

  // مزامنة ذكية مع السحابة
  const syncWithCloud = useCallback(async () => {
    setIsSyncing(true);
    const cloudData = await sheetService.fetchCloudData();
    if (cloudData) {
      setState(prev => ({
        ...prev,
        users: cloudData.users || [],
        transactions: cloudData.transactions || []
      }));
    } else {
      // إذا فشل الجلب، قد يكون الشيت غير مهيأ، نحاول التهيئة
      await sheetService.setupSystem();
    }
    setIsSyncing(false);
  }, []);

  useEffect(() => {
    syncWithCloud();
  }, [syncWithCloud]);

  // تحديث الأرباح اللحظي (في المتصفح) مع الحفظ الدوري في الشيت
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const diffDays = (now - lastUpdateRef.current) / (1000 * 60 * 60 * 24);
      
      setState(prev => {
        if (!prev.currentUser) return prev;
        
        const updatedUsers = prev.users.map(u => {
          if (u.investedAmount > 0 && u.role === 'USER') {
            const growth = MIN_DAILY_PROFIT + Math.random() * (MAX_DAILY_PROFIT - MIN_DAILY_PROFIT);
            const earnings = u.investedAmount * growth * diffDays;
            return { ...u, balance: u.balance + earnings };
          }
          return u;
        });
        
        const freshUser = updatedUsers.find(u => u.id === prev.currentUser?.id);
        
        // حفظ في الشيت كل فترة (اختياري لتحسين الأداء)
        if (freshUser && Math.random() > 0.9) {
           sheetService.syncUser(freshUser);
        }

        return { ...prev, users: updatedUsers, currentUser: freshUser || prev.currentUser };
      });
      lastUpdateRef.current = now;
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const login = async (email: string) => {
    setIsSyncing(true);
    await syncWithCloud(); // جلب أحدث البيانات للتأكد
    const user = state.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    setIsSyncing(false);
    
    if (user) {
      setState(prev => ({ ...prev, currentUser: user }));
      return { success: true, isNew: false };
    }
    return { success: false, isNew: true };
  };

  const register = async (name: string, email: string) => {
    setIsSyncing(true);
    const newUser: User = {
      id: `usr-${Date.now()}`,
      name,
      email: email.toLowerCase(),
      role: email.includes('admin') ? 'ADMIN' : 'USER',
      balance: 0,
      investedAmount: 0,
      joinDate: Date.now(),
    };

    await sheetService.syncUser(newUser);
    setState(prev => ({
      ...prev,
      users: [...prev.users, newUser],
      currentUser: newUser
    }));
    setIsSyncing(false);
    return true;
  };

  const addTransaction = async (txData: Omit<Transaction, 'id' | 'timestamp' | 'status'>) => {
    const newTx: Transaction = {
      ...txData,
      id: `tx-${Date.now()}`,
      timestamp: Date.now(),
      status: TransactionStatus.PENDING,
    };
    
    setState(prev => ({ ...prev, transactions: [newTx, ...prev.transactions] }));
    await sheetService.addTransaction(newTx);
    await syncWithCloud();
  };

  const logout = () => setState(prev => ({ ...prev, currentUser: null }));

  return { state, login, register, logout, addTransaction, isSyncing, syncWithCloud };
}
