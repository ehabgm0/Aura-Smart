
import { User, Transaction } from '../types';

export const SPREADSHEET_ID = '1j9z9OZEhaNyEGUYa99Oenq5EY8Yy2V8vQxxs_8j56R0';
// ملاحظة للمستخدم: استبدل هذا الرابط بالرابط الذي حصلت عليه من خطوة الـ Deploy
export const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyGu5IgC6wUY-0iiPthR0rdTohP3UmPLdDWyf2yRSyumu5x07PzX0sGhZELLIa72GA7/exec';

export const sheetService = {
  async fetchCloudData() {
    try {
      const res = await fetch(`${SCRIPT_URL}?action=getData&sheetId=${SPREADSHEET_ID}`);
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      console.error("Cloud Error:", e);
      return null;
    }
  },

  async execute(action: string, data: any) {
    try {
      // إرسال POST request مع تجاوز مشاكل CORS عبر no-cors إذا لزم الأمر
      // لكن Web Apps في GAS تفضل التعامل مع POST ببيانات واضحة
      await fetch(SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({ action, sheetId: SPREADSHEET_ID, data })
      });
      return true;
    } catch (e) {
      console.error("Execute Error:", e);
      return false;
    }
  },

  async setupSystem() {
    return this.execute('setup', {});
  },

  async syncUser(user: User) {
    return this.execute('syncUser', user);
  },

  async addTransaction(tx: Transaction) {
    return this.execute('addTransaction', tx);
  }
};
