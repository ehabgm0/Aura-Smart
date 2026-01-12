
import React, { useState, useEffect } from 'react';
import { useAppStore } from './store/useAppStore';
import { TransactionType, PaymentMethod, TransactionStatus } from './types';
import { MiningDisplay } from './components/MiningDisplay';
import { ChatAssistant } from './components/ChatAssistant';
// Fix: Added SPREADSHEET_ID to the import from sheetService
import { sheetService, SPREADSHEET_ID } from './services/sheetService';
import { 
  TrendingUp, 
  LayoutDashboard, 
  LogOut,
  History,
  CheckCircle2,
  XCircle,
  Plus,
  ArrowUpRight,
  Eye,
  Camera,
  ArrowRight,
  Activity,
  CloudCog,
  RefreshCw,
  Terminal,
  UserPlus,
  Loader2,
  Lock,
  ChevronLeft,
  ExternalLink,
  ShieldCheck,
  ArrowDownToLine,
  Database
} from 'lucide-react';
import { LOCK_IN_PERIOD_DAYS, MIN_DEPOSIT_EGP, MIN_WITHDRAW_EGP } from './constants';

const App: React.FC = () => {
  const { state, login, register, logout, addTransaction, isSyncing, syncWithCloud } = useAppStore();
  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [loginStep, setLoginStep] = useState<'email' | 'register'>('email');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history' | 'admin'>('dashboard');
  const [currentView, setCurrentView] = useState<'landing' | 'login' | 'app'>('landing');
  
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [amountInput, setAmountInput] = useState('');
  const [screenshotFile, setScreenshotFile] = useState<string | null>(null);

  const currentUser = state.currentUser;
  const isAdmin = currentUser?.role === 'ADMIN';

  useEffect(() => {
    if (currentUser) setCurrentView('app');
    else if (currentView === 'app') setCurrentView('landing');
  }, [currentUser]);

  const showNotify = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleInitCloud = async () => {
    const ok = await sheetService.setupSystem();
    if (ok) showNotify("تم تهيئة جداول Google Sheet بنجاح!");
    else showNotify("فشلت التهيئة، تأكد من إعداد Apps Script", "error");
  };

  const handleLoginSubmit = async () => {
    if (!emailInput.includes('@')) return showNotify('بريد غير صحيح', 'error');
    const res = await login(emailInput);
    if (!res.success && res.isNew) setLoginStep('register');
  };

  const handleRegisterSubmit = async () => {
    if (!nameInput.trim()) return showNotify('ادخل اسمك', 'error');
    await register(nameInput, emailInput);
    showNotify('تم إنشاء الحساب ومزامنته');
  };

  const handleDeposit = async () => {
    const amount = parseFloat(amountInput);
    if (amount < MIN_DEPOSIT_EGP) return showNotify(`الحد الأدنى ${MIN_DEPOSIT_EGP}`, 'error');
    if (!screenshotFile) return showNotify('ارفع الإيصال', 'error');
    
    await addTransaction({
      userId: currentUser!.id,
      amount,
      type: TransactionType.DEPOSIT,
      method: PaymentMethod.VODAFONE_CASH,
      screenshotUrl: screenshotFile
    });
    setIsDepositOpen(false); setAmountInput('');
    showNotify('جاري المزامنة مع الشيت...');
  };

  if (currentView === 'landing') {
    return (
      <div className="min-h-screen bg-[#020617] text-white overflow-hidden font-['Cairo']">
        <nav className="fixed top-0 w-full z-50 glass border-b border-white/5 px-10 py-6 flex justify-between items-center">
           <div className="flex items-center gap-3"><TrendingUp className="text-amber-500"/><span className="text-xl font-black uppercase">Aura Core</span></div>
           <button onClick={() => setCurrentView('login')} className="bg-amber-500 text-black px-8 py-3 rounded-2xl font-black">تسجيل دخول</button>
        </nav>
        <div className="pt-64 text-center">
           <CloudCog className="w-24 h-24 text-amber-500 mx-auto mb-10 animate-spin-slow" />
           <h1 className="text-7xl font-black mb-6">استثمارك.. <span className="text-amber-500">سحابي بالكامل</span></h1>
           <p className="text-slate-400 max-w-lg mx-auto mb-12">جميع بياناتك وأرباحك مخزنة ومحمية مباشرة داخل Google Sheet الخاص بك عبر تقنيات Aura الذكية.</p>
           <button onClick={() => setCurrentView('login')} className="bg-amber-500 text-black px-12 py-5 rounded-full font-black text-2xl flex items-center gap-4 mx-auto aura-shadow">ابدأ الآن <ArrowRight/></button>
        </div>
      </div>
    );
  }

  if (currentView === 'login') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617] p-6">
        <div className="w-full max-w-md glass p-12 rounded-[3.5rem] text-center border-white/10 relative">
          {isSyncing && <div className="absolute inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center"><Loader2 className="animate-spin text-amber-500"/></div>}
          <TrendingUp className="w-16 h-16 text-amber-500 mx-auto mb-10" />
          {loginStep === 'email' ? (
            <div className="space-y-6">
              <h2 className="text-3xl font-black">أهلاً بك</h2>
              <input type="email" className="w-full bg-slate-900 border border-white/10 rounded-2xl px-6 py-5 text-center text-lg outline-none" placeholder="البريد الإلكتروني" value={emailInput} onChange={(e) => setEmailInput(e.target.value)} />
              <button onClick={handleLoginSubmit} className="w-full bg-amber-500 text-black py-5 rounded-2xl font-black text-xl">متابعة <ChevronLeft/></button>
            </div>
          ) : (
            <div className="space-y-6">
              <h2 className="text-2xl font-black">حساب سحابي جديد</h2>
              <input type="text" className="w-full bg-slate-900 border border-white/10 rounded-2xl px-6 py-5 text-center text-lg outline-none" placeholder="الاسم الكامل" value={nameInput} onChange={(e) => setNameInput(e.target.value)} />
              <button onClick={handleRegisterSubmit} className="w-full bg-emerald-500 text-black py-5 rounded-2xl font-black text-xl">تأكيد التسجيل</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#020617] text-white">
      {notification && <div className={`fixed top-10 right-10 z-[1000] px-8 py-4 rounded-2xl font-black shadow-2xl ${notification.type === 'error' ? 'bg-red-500' : 'bg-emerald-500 text-black'}`}>{notification.message}</div>}

      <aside className="w-full md:w-80 glass border-l border-white/5 p-10 flex flex-col gap-10">
        <div className="flex items-center gap-4"><TrendingUp className="text-amber-500"/><span className="text-2xl font-black uppercase">Aura Cloud</span></div>
        <nav className="flex-1 space-y-3">
          <button onClick={() => setActiveTab('dashboard')} className={`w-full text-right px-6 py-4 rounded-2xl ${activeTab === 'dashboard' ? 'bg-amber-500 text-black font-black' : 'text-slate-400 hover:bg-white/5'}`}>الرئيسية</button>
          <button onClick={() => setActiveTab('history')} className={`w-full text-right px-6 py-4 rounded-2xl ${activeTab === 'history' ? 'bg-amber-500 text-black font-black' : 'text-slate-400 hover:bg-white/5'}`}>العمليات</button>
          {isAdmin && <button onClick={() => setActiveTab('admin')} className={`w-full text-right px-6 py-4 rounded-2xl ${activeTab === 'admin' ? 'bg-amber-500 text-black font-black' : 'text-slate-400 hover:bg-white/5'}`}>إدارة السحابة</button>}
        </nav>
        <button onClick={logout} className="flex items-center gap-4 text-red-500 font-black px-6"><LogOut/> خروج</button>
      </aside>

      <main className="flex-1 p-6 md:p-14 overflow-y-auto">
        {activeTab === 'dashboard' && (
          <div className="space-y-12 text-right">
            <div className="flex justify-between items-center">
               <h2 className="text-5xl font-black">مرحباً، {currentUser?.name}</h2>
               <button onClick={syncWithCloud} className="p-3 bg-white/5 rounded-full hover:bg-white/10"><RefreshCw className={isSyncing ? 'animate-spin' : ''}/></button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="p-10 glass rounded-[2.5rem]"><div className="text-xs text-slate-500 mb-2 font-black uppercase tracking-widest">رأس المال في الشيت</div><div className="text-4xl font-black">{currentUser?.investedAmount} <span className="text-xs">ج.م</span></div></div>
               <div className="p-10 glass rounded-[2.5rem] border-emerald-500/20 bg-emerald-500/5"><div className="text-xs text-emerald-500 mb-2 font-black uppercase tracking-widest">الأرباح اللحظية</div><div className="text-4xl font-black text-emerald-400">{currentUser?.balance.toFixed(2)}</div></div>
               <div className="p-10 glass rounded-[2.5rem]"><div className="text-xs text-slate-500 mb-2 font-black uppercase tracking-widest">دورة القفل</div><div className="text-4xl font-black">{LOCK_IN_PERIOD_DAYS} <span className="text-xs">أيام</span></div></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               <MiningDisplay invested={currentUser?.investedAmount || 0} />
               <div className="flex flex-col gap-4">
                  <button onClick={() => setIsDepositOpen(true)} className="flex-1 bg-amber-500 text-black rounded-[2.5rem] font-black text-2xl flex flex-col items-center justify-center gap-4 aura-shadow transition-transform hover:scale-105"><Plus className="w-10 h-10"/> إيداع جديد</button>
                  <div className="p-8 glass rounded-[2.5rem] border-white/5 flex items-center justify-between">
                     <div><div className="text-xs text-slate-500 mb-1 font-black">رابط قاعدة البيانات</div><div className="text-xs text-emerald-500 underline truncate max-w-[200px]">{SPREADSHEET_ID}</div></div>
                     <Database className="text-slate-700 w-8 h-8"/>
                  </div>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'admin' && (
          <div className="space-y-12 text-right animate-in fade-in">
             <h2 className="text-4xl font-black">إدارة السحابة الذكية</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-10 glass rounded-[3rem] border-amber-500/30 bg-amber-500/5">
                   <div className="flex items-center gap-4 mb-6"><Database className="text-amber-500 w-10 h-10"/><h3 className="text-2xl font-black">تهيئة الشيت</h3></div>
                   <p className="text-slate-400 text-sm mb-8">هذا الأمر سيقوم برمجياً بإنشاء أوراق العمل (Tabs) والجداول المطلوبة داخل رابط Google Sheet الخاص بك تلقائياً.</p>
                   <button onClick={handleInitCloud} className="w-full bg-amber-500 text-black py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-4"><CloudCog className="animate-spin-slow"/> تنفيذ التهيئة الذكية</button>
                </div>
                <div className="p-10 glass rounded-[3rem] border-white/5">
                   <h3 className="text-2xl font-black mb-6">الطلبات المعلقة</h3>
                   <div className="space-y-4">
                      {state.transactions.filter(t => t.status === TransactionStatus.PENDING).map(tx => (
                        <div key={tx.id} className="p-6 bg-white/5 rounded-2xl flex justify-between items-center">
                           <div className="text-right">
                              <div className="font-black">{tx.amount} ج.م</div>
                              <div className="text-[10px] text-slate-500 uppercase">{tx.type} • {tx.method}</div>
                           </div>
                           <div className="flex gap-2">
                              <button className="p-3 bg-emerald-500 text-black rounded-xl"><CheckCircle2/></button>
                              <button className="p-3 bg-red-500 text-black rounded-xl"><XCircle/></button>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
             </div>
          </div>
        )}
      </main>

      {isDepositOpen && (
        <div className="fixed inset-0 bg-black/95 z-[500] flex items-center justify-center p-6 text-right">
           <div className="w-full max-w-xl glass p-12 rounded-[3.5rem] border-white/10 relative">
              <button onClick={() => setIsDepositOpen(false)} className="absolute top-10 left-10"><XCircle className="w-10 h-10 text-slate-600"/></button>
              <h3 className="text-4xl font-black mb-10 flex items-center gap-4"><Plus className="text-amber-500"/> تمويل دورة تشغيل</h3>
              <div className="space-y-8">
                 <input type="number" className="w-full bg-slate-900 border border-white/10 rounded-3xl px-8 py-6 text-4xl font-black text-center outline-none focus:border-amber-500" placeholder="المبلغ" value={amountInput} onChange={(e) => setAmountInput(e.target.value)} />
                 <div className="p-8 bg-amber-500/5 rounded-[2.5rem] border border-amber-500/20 text-center">
                    <div className="text-[10px] text-slate-500 mb-2 font-black uppercase">رقم المحفظة في الشيت</div>
                    <div className="text-3xl font-black text-amber-500 tracking-widest">01012345678</div>
                 </div>
                 <label className="flex flex-col items-center justify-center h-44 border-2 border-dashed border-white/10 rounded-[2.5rem] cursor-pointer hover:bg-white/5 transition-all">
                    <Camera className="w-10 h-10 text-slate-600 mb-3"/>
                    <span className="text-xs text-slate-500">{screenshotFile ? '✓ تم رفع الإيصال' : 'اضغط لرفع صورة إيصال التحويل'}</span>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                       const file = e.target.files?.[0];
                       if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => setScreenshotFile(reader.result as string);
                          reader.readAsDataURL(file);
                       }
                    }} />
                 </label>
                 <button onClick={handleDeposit} className="w-full bg-amber-500 text-black py-6 rounded-full font-black text-xl aura-shadow">تأكيد الإرسال للسحابة</button>
              </div>
           </div>
        </div>
      )}

      <ChatAssistant />
    </div>
  );
};

export default App;
