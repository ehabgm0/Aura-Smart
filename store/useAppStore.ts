
import { useState, useEffect, useCallback } from 'react';
import { AppState, User, Transaction, TransactionStatus, TransactionType, Message } from '../types';
import { sheetService } from '../services/sheetService';
import { MIN_DAILY_PROFIT, MAX_DAILY_PROFIT } from '../constants';

const INITIAL_DATA: AppState = {
  users: [],
  transactions: [],
  messages: [],
  currentUser: null,
};

const bufferToBase64 = (buffer: ArrayBuffer) => btoa(String.fromCharCode(...new Uint8Array(buffer)));
const base64ToBuffer = (base64: string) => Uint8Array.from(atob(base64), c => c.charCodeAt(0)).buffer;

export function useAppStore() {
  const [state, setState] = useState<AppState>(INITIAL_DATA);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  const syncWithCloud = useCallback(async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    const cloudData = await sheetService.fetchCloudData();
    if (cloudData) {
      const users = (cloudData.users || []).map((u: any) => ({ 
        ...u, 
        balance: Number(u.balance || 0), 
        investedAmount: Number(u.investedAmount || 0),
        pendingProfits: Number(u.pendingProfits || 0),
        lastHarvest: Number(u.lastHarvest || u.joinDate)
      }));
      
      setState(prev => ({
        ...prev,
        users,
        transactions: (cloudData.transactions || []).map((t: any) => ({ ...t, amount: Number(t.amount), timestamp: Number(t.timestamp) })),
        messages: (cloudData.messages || []).map((m: any) => ({ ...m, timestamp: Number(m.timestamp), isRead: String(m.isRead) === 'true' })),
        currentUser: prev.currentUser ? (users.find((u: any) => u.id === prev.currentUser?.id) || prev.currentUser) : null
      }));
    }
    setIsSyncing(false);
  }, [isSyncing]);

  useEffect(() => {
    const init = async () => {
      if (window.PublicKeyCredential) {
        const available = await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        setBiometricAvailable(available);
      }
      const saved = localStorage.getItem('aura_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        setState(prev => ({ ...prev, currentUser: parsed }));
      }
      await syncWithCloud();
      setIsReady(true);
    };
    init();
  }, [syncWithCloud]);

  const harvestProfits = async () => {
    if (!state.currentUser || state.currentUser.investedAmount <= 0) return 0;
    
    const now = Date.now();
    const lastHarvest = state.currentUser.lastHarvest || state.currentUser.joinDate;
    const diffInSeconds = (now - lastHarvest) / 1000;
    const dailyRate = (MIN_DAILY_PROFIT + MAX_DAILY_PROFIT) / 2;
    const profitPerSecond = (state.currentUser.investedAmount * dailyRate) / 86400;
    const earned = diffInSeconds * profitPerSecond;

    if (earned < 0.01) return 0;

    const updatedUser = {
      ...state.currentUser,
      balance: state.currentUser.balance + earned,
      lastHarvest: now
    };

    const success = await sheetService.syncUser(updatedUser);
    if (success) {
      await syncWithCloud();
      return earned;
    }
    return 0;
  };

  const loginWithPassword = async (identifier: string, pass: string) => {
    const user = state.users.find(u => u.email === identifier || u.phone === identifier);
    if (user && user.password === pass) {
      setState(prev => ({ ...prev, currentUser: user }));
      localStorage.setItem('aura_session', JSON.stringify(user));
      return { success: true, user };
    }
    return { success: false, message: 'بيانات غير صحيحة' };
  };

  const registerFinalize = async (userData: Partial<User>, referralInput?: string) => { 
    const refCode = (userData.name?.split(' ')[0].toUpperCase() || 'AURA') + Math.floor(1000 + Math.random() * 9000);
    
    if (referralInput) {
      const referrer = state.users.find(u => u.referralCode === referralInput);
      if (referrer) {
        const updatedReferrer = { ...referrer, balance: referrer.balance + 50 };
        await sheetService.syncUser(updatedReferrer);
      }
    }

    const fullUser: User = {
      ...userData,
      id: `u-${Date.now()}`,
      name: userData.name || '',
      email: userData.email || '',
      role: 'USER',
      balance: 0,
      investedAmount: 0,
      pendingProfits: 0,
      matureProfits: 0,
      joinDate: Date.now(),
      lastHarvest: Date.now(),
      status: 'ACTIVE',
      referralCode: refCode,
      referredBy: referralInput || undefined
    } as User;
    
    await sheetService.syncUser(fullUser); 
    setState(prev => ({ ...prev, currentUser: fullUser }));
    localStorage.setItem('aura_session', JSON.stringify(fullUser));
    await syncWithCloud(); 
  };

  const sendMessage = async (text: string, receiverId: string) => {
    if (!state.currentUser) return;
    const msg: Message = { 
      id: `msg-${Date.now()}`, 
      senderId: state.currentUser.id, 
      receiverId, 
      text, 
      timestamp: Date.now(), 
      isRead: false 
    };
    await sheetService.addMessage(msg);
    setState(prev => ({ ...prev, messages: [...prev.messages, msg] }));
  };

  const invest = async (amount: number) => {
    if (!state.currentUser || state.currentUser.balance < amount) return false;
    const updatedUser = {
      ...state.currentUser,
      balance: state.currentUser.balance - amount,
      investedAmount: state.currentUser.investedAmount + amount,
      lastHarvest: Date.now()
    };
    await sheetService.syncUser(updatedUser);
    await syncWithCloud();
    return true;
  };

  return {
    state, isReady, isSyncing, biometricAvailable,
    syncWithCloud,
    loginWithPassword,
    logout: () => { 
      localStorage.removeItem('aura_session'); 
      setState(prev => ({ ...prev, currentUser: null })); 
    },
    registerFinalize,
    addTransaction: async (tx: any) => { 
      const newTx = { 
        ...tx, 
        id: `tx-${Date.now()}`, 
        userName: state.currentUser?.name, 
        timestamp: Date.now(), 
        status: TransactionStatus.PENDING 
      };
      await sheetService.addTransaction(newTx); 
      await syncWithCloud(); 
    },
    handleAdminAction: async (txId: string, status: TransactionStatus) => {
      const tx = state.transactions.find(t => t.id === txId);
      if (!tx) return;
      await sheetService.updateTransactionStatus(txId, status, tx.userId, tx.amount, tx.type);
      await syncWithCloud();
    },
    sendMessage,
    invest,
    harvestProfits,
    runSystemDiagnostic: async () => { 
      await sheetService.upgradeCloudEngine(); 
      await syncWithCloud(); 
      return true; 
    },
    linkBiometrics: async (user: User) => {
      try {
        const challenge = new Uint8Array(32); window.crypto.getRandomValues(challenge);
        const credential = await navigator.credentials.create({ publicKey: {
          challenge, 
          rp: { name: "Aura Sovereign", id: window.location.hostname }, 
          user: { id: Uint8Array.from(user.id, c => c.charCodeAt(0)), name: user.email, displayName: user.name },
          pubKeyCredParams: [{ alg: -7, type: "public-key" }], 
          authenticatorSelection: { authenticatorAttachment: "platform" },
          timeout: 60000
        }}) as PublicKeyCredential;
        
        if (credential) {
          const bioKey = bufferToBase64(credential.rawId);
          await sheetService.syncUser({ ...user, biometricKey: bioKey });
          localStorage.setItem('aura_bio_linked_user', bioKey);
          await syncWithCloud();
          return true;
        }
      } catch (e) { console.error("Biometric Link Error:", e); }
      return false;
    },
    loginWithBiometrics: async () => {
      const bioId = localStorage.getItem('aura_bio_linked_user');
      if (!bioId) return { success: false };
      try {
        const assertion = await navigator.credentials.get({ publicKey: { 
          challenge: new Uint8Array(32), 
          allowCredentials: [{ id: base64ToBuffer(bioId), type: 'public-key' }], 
          userVerification: 'required' 
        }}) as PublicKeyCredential;
        
        if (assertion) {
          const user = state.users.find(u => u.biometricKey === bufferToBase64(assertion.rawId));
          if (user) { 
            setState(prev => ({ ...prev, currentUser: user })); 
            localStorage.setItem('aura_session', JSON.stringify(user)); 
            return { success: true, user }; 
          }
        }
      } catch (e) { console.error("Biometric Login Error:", e); }
      return { success: false };
    }
  };
}
