
import { User, Transaction, Message } from '../types';

export const SPREADSHEET_ID = '1j9z9OZEhaNyEGUYa99Oenq5EY8Yy2V8vQxxs_8j56R0';
export const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyRBGno8XE_XGfeESvwet2uVkCtQinZcxDgywug0MJz2WvSVSpl5Gbyf2YlV-pXP-Ul/exec';

export const sheetService = {
  async fetchCloudData() {
    try {
      const res = await fetch(`${SCRIPT_URL}?action=getData&sheetId=${SPREADSHEET_ID}&t=${Date.now()}`);
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      console.error("Critical Sync Error:", e);
      return null;
    }
  },

  async execute(action: string, data: any) {
    try {
      await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify({ action, sheetId: SPREADSHEET_ID, data })
      });
      return true;
    } catch (e) {
      return false;
    }
  },

  async syncUser(user: User & { referralInput?: string }) { return this.execute('syncUser', user); },
  async addTransaction(tx: Transaction) { return this.execute('addTransaction', tx); },
  async addMessage(msg: Message) { return this.execute('addMessage', msg); },
  async updateTransactionStatus(txId: string, status: string, userId: string, amount: number, type: string) {
    return this.execute('updateTransactionStatus', { txId, status, userId, amount, type });
  },
  async upgradeCloudEngine() {
    const schema = {
      users: ['id', 'name', 'email', 'phone', 'password', 'role', 'balance', 'investedAmount', 'pendingProfits', 'matureProfits', 'joinDate', 'lastHarvest', 'biometricKey', 'status', 'referralCode', 'referredBy'],
      transactions: ['id', 'userId', 'userName', 'amount', 'fee', 'type', 'status', 'method', 'senderNumber', 'senderName', 'screenshotUrl', 'aiAnalysis', 'timestamp'],
      messages: ['id', 'senderId', 'receiverId', 'text', 'timestamp', 'isRead']
    };
    return this.execute('upgradeSchema', schema);
  }
};
