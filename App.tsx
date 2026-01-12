
import React, { useState, useEffect, useMemo } from 'react';
import { useAppStore } from './store/useAppStore';
import { TransactionType, PaymentMethod, TransactionStatus, User, Transaction, Message } from './types';
import { MiningDisplay } from './components/MiningDisplay';
import { ChatAssistant } from './components/ChatAssistant';
import { 
  TrendingUp, LogOut, ShieldCheck, Fingerprint, ChevronLeft, 
  ArrowUpRight, ArrowDownLeft, Settings, MessageSquare, 
  Users, DollarSign, Activity, Bell, Search, Mail, Send, 
  ShieldAlert, LayoutDashboard, Database, UserCheck, Smartphone, Camera,
  RefreshCw, Copy, Gift, UserPlus, XCircle, Wallet, Info, AlertTriangle,
  ChevronRight, Upload, CheckCircle2, Cpu, Key, Lock, Shield, Sparkles
} from 'lucide-react';
import { PAYMENT_METHODS_DETAILS, MIN_DEPOSIT_EGP, MIN_WITHDRAW_EGP, INVESTMENT_TIERS } from './constants';
import { getGeminiResponse } from './services/geminiService';

const App: React.FC = () => {
  const { 
    state, isReady, isSyncing, biometricAvailable, syncWithCloud,
    loginWithPassword, loginWithBiometrics, linkBiometrics, logout,
    registerFinalize, addTransaction, handleAdminAction, sendMessage, runSystemDiagnostic, invest
  } = useAppStore();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [referralInput, setReferralInput] = useState('');
  const [authStep, setAuthStep] = useState<'identify' | 'password' | 'signup'>('identify');
  const [currentView, setCurrentView] = useState<'landing' | 'auth' | 'app'>('landing');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'messages' | 'history' | 'settings' | 'admin'>('dashboard');
  const [adminSubTab, setAdminSubTab] = useState<'overview' | 'users' | 'finance' | 'support'>('overview');
  const [selectedChatUserId, setSelectedChatUserId] = useState<string | null>(null);
  
  const [msgInput, setMsgInput] = useState('');
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isInvestOpen, setIsInvestOpen] = useState(false);
  
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(PaymentMethod.VODAFONE_CASH);
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  
  const currentUser = state.currentUser;
  const isAdmin = currentUser?.role === 'ADMIN';

  const [aiReport, setAiReport] = useState<string>('Aura Central Core: جاري تحليل البروتوكولات النقدية...');
  
  useEffect(() => {
    if (isAdmin && activeTab === 'admin') {
      const generateReport = async () => {
        const report = await getGeminiResponse(`أنت في غرفة المدير. الحالة الحالية: ${state.users.length} عملاء، ${state.transactions.length} معاملات. قدم تقريراً استراتيجياً مختصراً عن حالة المنصة.`);
        setAiReport(report);
      };
      generateReport();
    }
  }, [isAdmin, activeTab, state.users.length, state.transactions.length]);

  const handleAiAnalyzeReceipt = async () => {
    if (!screenshot) return;
    setIsAiAnalyzing(true);
    const analysis = await getGeminiResponse("قم بإجراء فحص سيادي لهذا الإيصال. تأكد من المبلغ وصحة البيانات.", screenshot);
    alert("Aura AI Analysis:\n" + analysis);
    setIsAiAnalyzing(false);
  };

  const handleLogin = async () => {
    const res = await loginWithPassword(identifier, password);
    if (res.success) setCurrentView('app');
    else alert('Aura Error: نفاذ غير مصرح به.');
  };

  const handleBioLogin = async () => {
    const res = await loginWithBiometrics();
    if (res.success) setCurrentView('app');
    else alert('Aura Error: لم يتم التعرف على البصمة.');
  };

  const handleLinkBiometrics = async () => {
    if (!currentUser) return;
    const ok = await linkBiometrics(currentUser);
    if (ok) alert('تم دمج البصمة بنجاح مع هويتك السحابية.');
    else alert('Aura Error: فشل بروتوكول الارتباط.');
  };

  const handleDepositSubmit = async () => {
    const amount = Number(depositAmount);
    if (isNaN(amount) || amount < MIN_DEPOSIT_EGP) return alert(`الحد الأدنى ${MIN_DEPOSIT_EGP} ج.م`);
    if (!screenshot) return alert('يرجى رفع الإيصال للتحقق.');

    await addTransaction({
      userId: currentUser?.id,
      amount,
      type: TransactionType.DEPOSIT,
      method: selectedMethod,
      screenshotUrl: screenshot,
    });
    setIsDepositOpen(false);
    setDepositAmount('');
    setScreenshot(null);
    alert('طلب الإيداع قيد المراجعة الإدارية الآن.');
  };

  const handleActivateNode = async (amount: number) => {
    if (!currentUser || currentUser.balance < amount) return alert('رصيد المحفظة لا يكفي لهذا المستوى.');
    if (await invest(amount)) {
      setIsInvestOpen(false);
      alert('تم تنشيط النود بنجاح. الأرباح ستبدأ بالتراكم فوراً.');
    }
  };

  const handleFinalizeWithdraw = async () => {
    const amount = Number(withdrawAmount);
    if (isNaN(amount) || amount < MIN_WITHDRAW_EGP) return alert(`الحد الأدنى للسحب هو ${MIN_WITHDRAW_EGP} ج.م`);
    if (!currentUser || currentUser.balance < amount) return alert('رصيد المحفظة غير كافٍ.');

    await addTransaction({
      userId: currentUser.id,
      amount,
      type: TransactionType.WITHDRAWAL,
      method: PaymentMethod.VODAFONE_CASH,
    });
    setIsWithdrawOpen(false);
    setWithdrawAmount('');
    alert('تم إرسال طلب السحب. سيتم التحويل خلال الدورة المالية القادمة (24 ساعة).');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('تم النسخ للذاكرة المؤقتة.');
  };

  // تصفية الرسائل للمستخدم الحالي أو المدير
  const filteredMessages = useMemo(() => {
    if (isAdmin && selectedChatUserId) {
      return state.messages.filter(m => m.senderId === selectedChatUserId || m.receiverId === selectedChatUserId);
    }
    return state.messages.filter(m => m.senderId === currentUser?.id || m.receiverId === currentUser?.id);
  }, [state.messages, selectedChatUserId, isAdmin, currentUser?.id]);

  if (!isReady) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
       <div className="relative">
         <Activity className="w-20 h-20 text-amber-500 animate-pulse mb-4" />
         <div className="absolute inset-0 bg-amber-500/20 blur-3xl rounded-full"></div>
       </div>
       <div className="text-amber-500 font-black tracking-widest uppercase animate-bounce">Aura Sovereign v4.5 Booting...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-['Cairo'] selection:bg-amber-500 selection:text-black">
      
      {currentView === 'landing' && (
        <div className="h-screen flex flex-col items-center justify-center p-10 text-center relative overflow-hidden">
          <div className="absolute top-0 w-full h-full bg-[radial-gradient(circle_at_50%_40%,#fbbf2415,transparent_70%)]"></div>
          <div className="relative group cursor-pointer" onClick={handleBioLogin}>
            <Fingerprint className="w-48 h-48 text-amber-500 mb-8 animate-pulse group-hover:scale-110 transition-transform" />
            <div className="absolute inset-0 bg-amber-500/10 blur-3xl rounded-full opacity-50"></div>
          </div>
          <h1 className="text-9xl font-black mb-4 tracking-tighter">AURA <span className="text-amber-500">IV</span></h1>
          <p className="text-slate-400 text-2xl max-w-2xl mb-12 font-bold uppercase tracking-widest leading-relaxed">
            المنصة الاستثمارية السيادية الأولى <br/> <span className="text-emerald-500">مؤمنة بالكامل بالبصمة البيومترية</span>
          </p>
          <div className="flex gap-8">
            <button onClick={() => { setAuthStep('identify'); setCurrentView('auth'); }} className="bg-amber-500 text-black px-20 py-8 rounded-[2.5rem] font-black text-3xl shadow-[0_0_50px_rgba(251,191,36,0.3)] hover:scale-105 active:scale-95 transition-all">فتح البوابة</button>
            {biometricAvailable && <button onClick={handleBioLogin} className="glass border border-white/10 px-12 py-8 rounded-[2.5rem] font-black text-3xl hover:bg-white/5 transition-all flex items-center gap-6"><Fingerprint className="w-10 h-10"/> نفاذ سريع</button>}
          </div>
        </div>
      )}

      {currentView === 'auth' && (
        <div className="h-screen flex items-center justify-center p-6 bg-black relative">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
          <div className="w-full max-w-xl glass p-16 rounded-[5rem] text-center border-amber-500/20 shadow-[0_0_150px_rgba(251,191,36,0.1)] relative z-10">
            <h2 className="text-6xl font-black mb-16">بوابة <span className="text-amber-500">النفاذ</span></h2>
            {authStep === 'identify' && (
              <div className="space-y-8">
                 <div className="relative">
                   <Mail className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 w-6 h-6"/>
                   <input type="text" placeholder="البريد الإلكتروني أو الهاتف" className="w-full bg-white/5 border border-white/10 p-10 pr-16 rounded-[2.5rem] text-2xl font-black text-center outline-none focus:border-amber-500 transition-all" value={identifier} onChange={e => setIdentifier(e.target.value)} />
                 </div>
                 <button onClick={() => setAuthStep('password')} className="w-full bg-amber-500 text-black py-10 rounded-[2.5rem] font-black text-3xl shadow-xl hover:scale-[1.02] transition-all">متابعة الهوية</button>
                 <button onClick={() => setAuthStep('signup')} className="text-slate-500 font-bold text-xl hover:text-amber-500 transition-colors">ليس لديك حساب؟ إنشاء هوية جديدة</button>
              </div>
            )}
            {authStep === 'password' && (
              <div className="space-y-8">
                 <input type="password" placeholder="كلمة المرور المشفرة" className="w-full bg-white/5 border border-white/10 p-10 rounded-[2.5rem] text-2xl font-black text-center outline-none focus:border-emerald-500 transition-all" value={password} onChange={e => setPassword(e.target.value)} />
                 <button onClick={handleLogin} className="w-full bg-emerald-500 text-black py-10 rounded-[2.5rem] font-black text-3xl shadow-xl hover:scale-[1.02] transition-all">تحقق ودخول</button>
                 <button onClick={() => setAuthStep('identify')} className="text-slate-500 font-bold text-xl hover:text-amber-500 transition-colors">رجوع لتعديل الهوية</button>
              </div>
            )}
            {authStep === 'signup' && (
              <div className="space-y-6">
                 <input type="text" placeholder="الاسم الكامل" className="w-full bg-white/5 border border-white/10 p-8 rounded-[2rem] text-xl font-bold" value={identifier} onChange={e => setIdentifier(e.target.value)} />
                 <input type="password" placeholder="كلمة المرور" className="w-full bg-white/5 border border-white/10 p-8 rounded-[2rem] text-xl font-bold" value={password} onChange={e => setPassword(e.target.value)} />
                 <input type="text" placeholder="كود الإحالة (اختياري)" className="w-full bg-white/10 border border-amber-500/20 p-8 rounded-[2rem] text-2xl font-black text-center text-amber-500 placeholder:text-amber-500/30" value={referralInput} onChange={e => setReferralInput(e.target.value)} />
                 <button onClick={() => registerFinalize({ name: identifier, email: identifier, password }, referralInput)} className="w-full bg-amber-500 text-black py-10 rounded-[2.5rem] font-black text-3xl">تفعيل العضوية السيادية</button>
                 <button onClick={() => setAuthStep('identify')} className="text-slate-500 font-bold text-xl">لديك حساب؟ سجل دخولك</button>
              </div>
            )}
          </div>
        </div>
      )}

      {currentView === 'app' && (
        <div className="min-h-screen flex flex-col lg:flex-row animate-in fade-in duration-1000">
          
          <aside className="w-full lg:w-[30rem] glass border-l border-white/5 p-12 flex flex-col gap-12">
            <div className="flex items-center gap-6 text-4xl font-black cursor-pointer group" onClick={() => setActiveTab('dashboard')}>
              <TrendingUp className="text-amber-500 w-12 h-12 group-hover:scale-110 transition-transform"/> AURA <span className="text-amber-500">IV</span>
            </div>
            
            <div className="p-10 bg-white/5 rounded-[4rem] text-center relative border border-white/10 shadow-2xl overflow-hidden group">
               <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
               <div className="w-32 h-32 bg-amber-500 text-black rounded-[2.5rem] flex items-center justify-center text-6xl font-black mx-auto mb-6 shadow-xl">{currentUser?.name[0]}</div>
               <div className="text-2xl font-black tracking-tight">{currentUser?.name}</div>
               <div className="text-xs text-slate-500 uppercase tracking-[0.3em] mt-3 font-black">{currentUser?.status} | LVL: {currentUser?.investedAmount > 5000 ? 'PRO' : 'STARTER'}</div>
            </div>

            <nav className="flex-1 space-y-4">
               {[
                 { id: 'dashboard', label: 'الرئيسية', icon: <LayoutDashboard/> },
                 { id: 'messages', label: 'المراسلات', icon: <MessageSquare/> },
                 { id: 'history', label: 'سجل العمليات', icon: <Activity/> },
                 { id: 'settings', label: 'مركز الأمان', icon: <ShieldCheck/> },
               ].map(item => (
                 <button key={item.id} onClick={() => setActiveTab(item.id as any)} className={`w-full text-right p-8 rounded-[2.5rem] flex justify-between items-center font-black text-xl transition-all ${activeTab === item.id ? 'bg-amber-500 text-black shadow-2xl' : 'text-slate-400 hover:bg-white/5'}`}>
                   {item.label} {item.icon}
                 </button>
               ))}
               {isAdmin && (
                 <button onClick={() => setActiveTab('admin')} className={`w-full text-right p-8 rounded-[2.5rem] flex justify-between items-center font-black text-xl border border-emerald-500/30 mt-10 transition-all ${activeTab === 'admin' ? 'bg-emerald-500 text-black shadow-2xl' : 'text-emerald-500 hover:bg-emerald-500/10'}`}>
                   غرفة المدير <ShieldAlert/>
                 </button>
               )}
            </nav>

            <button onClick={() => { logout(); setCurrentView('landing'); }} className="w-full p-8 bg-red-500/10 text-red-500 rounded-[2.5rem] font-black text-xl flex items-center justify-center gap-6 hover:bg-red-500 hover:text-white transition-all">
              <LogOut/> إنهاء الجلسة السيادية
            </button>
          </aside>

          <main className="flex-1 p-8 lg:p-20 overflow-y-auto bg-[radial-gradient(circle_at_top_right,#1e1b4b,transparent_50%)]">
            
            {activeTab === 'dashboard' && (
              <div className="space-y-16 animate-in slide-in-from-bottom-10 duration-700">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                  <div>
                    <h2 className="text-7xl font-black tracking-tighter">مصنع <span className="text-amber-500">الأموال</span></h2>
                    <p className="text-slate-500 font-bold mt-3 tracking-[0.4em] text-sm uppercase">Operated by Sovereign AI v4.5</p>
                  </div>
                  <button onClick={() => setIsInvestOpen(true)} className="bg-emerald-500 text-black px-12 py-7 rounded-full font-black text-2xl flex items-center gap-6 shadow-[0_0_50px_rgba(16,185,129,0.3)] hover:scale-105 active:scale-95 transition-all">
                    <Cpu className="w-8 h-8 animate-spin-slow"/> تفعيل نود استثماري
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
                   <div className="glass p-14 rounded-[4rem] border-white/5 relative overflow-hidden group">
                      <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/5 rounded-full blur-3xl group-hover:bg-amber-500/10 transition-all"></div>
                      <div className="text-xs text-slate-500 font-black mb-4 uppercase tracking-[0.4em]">رأس المال العامل</div>
                      <div className="text-8xl font-black tabular-nums tracking-tighter">{currentUser?.investedAmount.toLocaleString()} <span className="text-lg">EGP</span></div>
                   </div>
                   <div className="glass p-14 rounded-[4rem] border-emerald-500/20 bg-emerald-500/[0.02] shadow-[inset_0_0_50px_rgba(16,185,129,0.05)]">
                      <div className="text-xs text-emerald-400 font-black mb-4 uppercase tracking-[0.4em]">المحفظة القابلة للسحب</div>
                      <div className="text-9xl font-black text-emerald-400 tabular-nums tracking-tighter">{currentUser?.balance.toFixed(2)}</div>
                   </div>
                   <div className="glass p-12 rounded-[4rem] border-amber-500/20 bg-amber-500/[0.02] flex flex-col justify-center items-center gap-6">
                      <div className="text-xs text-amber-500 font-black uppercase tracking-[0.3em] flex items-center gap-3"><Gift className="w-5 h-5"/> برنامج الإحالة الملكي</div>
                      <div className="bg-black/40 border border-white/10 px-10 py-6 rounded-[2rem] flex items-center gap-8 w-full justify-between font-black tracking-[0.2em] text-3xl text-amber-500 shadow-inner">
                         {currentUser?.referralCode}
                         <button onClick={() => copyToClipboard(currentUser?.referralCode || '')} className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-all"><Copy className="w-6 h-6"/></button>
                      </div>
                      <p className="text-[10px] text-slate-500 font-bold">احصل على 50 ج.م فورية عن كل مستخدم جديد.</p>
                   </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-16">
                   <MiningDisplay invested={currentUser?.investedAmount || 0} />
                   <div className="grid grid-cols-2 gap-10">
                      <button onClick={() => setIsDepositOpen(true)} className="bg-amber-500 text-black rounded-[5rem] flex flex-col items-center justify-center gap-8 p-16 font-black text-5xl shadow-2xl hover:scale-105 transition-all"><ArrowDownLeft className="w-20 h-20 animate-bounce"/> إيداع</button>
                      <button onClick={() => setIsWithdrawOpen(true)} className="glass border border-white/10 rounded-[5rem] flex flex-col items-center justify-center gap-8 p-16 font-black text-5xl shadow-2xl hover:bg-white/5 transition-all"><ArrowUpRight className="w-20 h-20 text-emerald-500"/> سحب</button>
                   </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="max-w-5xl mx-auto space-y-16 animate-in fade-in duration-700">
                <h2 className="text-8xl font-black tracking-tighter">مركز <span className="text-amber-500">الأمان</span></h2>
                
                <div className="glass p-16 rounded-[5rem] border-white/5 space-y-12 shadow-2xl">
                  <div className="flex items-center justify-between gap-10">
                    <div className="flex items-center gap-10">
                      <div className="w-24 h-24 bg-emerald-500/10 rounded-[2rem] flex items-center justify-center text-emerald-500 shadow-xl"><Shield className="w-12 h-12"/></div>
                      <div>
                        <h3 className="text-4xl font-black mb-3">النفاذ البيومتري الموحد</h3>
                        <p className="text-slate-500 font-bold text-xl leading-relaxed">ربط بصمة الجهاز (Touch ID / Face ID) بحسابك السحابي لتسجيل الدخول الفوري وتأمين المعاملات.</p>
                      </div>
                    </div>
                    {biometricAvailable && (
                      <button 
                        onClick={handleLinkBiometrics}
                        className="bg-emerald-500 text-black px-12 py-6 rounded-3xl font-black text-2xl flex items-center gap-6 hover:scale-105 transition-all shadow-xl"
                      >
                        <Fingerprint className="w-8 h-8"/> دمج البصمة
                      </button>
                    )}
                  </div>
                  
                  <div className="h-[1px] bg-white/5"></div>

                  <div className="flex items-center justify-between opacity-80">
                    <div className="flex items-center gap-10">
                      <div className="w-24 h-24 bg-amber-500/10 rounded-[2rem] flex items-center justify-center text-amber-500 shadow-xl"><Key className="w-12 h-12"/></div>
                      <div>
                        <h3 className="text-4xl font-black mb-3">تشفير البيانات السيادية</h3>
                        <p className="text-slate-500 font-bold text-xl">كافة بياناتك مخزنة بنظام تشفير AES-256 وموزعة على نودات Google Cloud.</p>
                      </div>
                    </div>
                    <div className="px-8 py-4 bg-emerald-500/10 text-emerald-500 rounded-2xl font-black text-sm border border-emerald-500/20">حماية نشطة</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'messages' && (
              <div className="max-w-5xl mx-auto flex flex-col h-full space-y-8 animate-in slide-in-from-right-10 duration-500">
                <h2 className="text-7xl font-black">الدعم <span className="text-amber-500">الفني</span></h2>
                <div className="flex-1 glass rounded-[4rem] p-12 flex flex-col border-white/5 shadow-2xl">
                  <div className="flex-1 overflow-y-auto space-y-6 mb-10 pr-4">
                    {filteredMessages.length > 0 ? filteredMessages.map(m => (
                      <div key={m.id} className={`flex ${m.senderId === currentUser?.id ? 'justify-start' : 'justify-end'}`}>
                        <div className={`p-8 rounded-[2rem] max-w-[75%] shadow-xl text-xl leading-relaxed ${m.senderId === currentUser?.id ? 'bg-slate-800 text-white rounded-tr-none' : 'bg-amber-500 text-black font-bold rounded-tl-none'}`}>
                          {m.text}
                          <div className="text-[10px] opacity-40 mt-3 text-left">{new Date(m.timestamp).toLocaleTimeString('ar-EG')}</div>
                        </div>
                      </div>
                    )) : (
                      <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-6">
                        <MessageSquare className="w-24 h-24 opacity-10" />
                        <p className="text-2xl font-black">لا يوجد رسائل حالياً. اطرح استفسارك وسنرد عليك فوراً.</p>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-6">
                    <input 
                      type="text" 
                      className="flex-1 bg-white/5 border border-white/10 p-8 rounded-[2rem] text-2xl font-bold outline-none focus:border-amber-500 transition-all" 
                      placeholder="اكتب رسالتك للمكتب الإداري..." 
                      value={msgInput} 
                      onChange={e => setMsgInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && (sendMessage(msgInput, 'ADMIN'), setMsgInput(''))}
                    />
                    <button onClick={() => { sendMessage(msgInput, 'ADMIN'); setMsgInput(''); }} className="bg-amber-500 text-black p-8 rounded-[2rem] hover:scale-105 active:scale-95 transition-all shadow-xl"><Send className="w-10 h-10"/></button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'admin' && isAdmin && (
               <div className="space-y-16 animate-in zoom-in-95 duration-700">
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10">
                     <h2 className="text-8xl font-black text-emerald-500 tracking-tighter">غرفة <span className="text-white">المدير</span></h2>
                     <div className="flex gap-6">
                        <button onClick={syncWithCloud} className="glass p-6 rounded-3xl hover:bg-white/10 transition-all border border-white/10"><RefreshCw className={isSyncing ? 'animate-spin' : ''}/></button>
                        <button onClick={runSystemDiagnostic} className="bg-emerald-500 text-black px-12 py-6 rounded-3xl font-black text-2xl flex items-center gap-6 shadow-2xl"><Database/> مزامنة السحابة</button>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                     {[
                       { id: 'overview', label: 'إحصائيات', icon: <Activity/> },
                       { id: 'users', label: 'المستخدمين', icon: <Users/> },
                       { id: 'finance', label: 'المعاملات', icon: <DollarSign/> },
                       { id: 'support', label: 'الدعم الفني', icon: <MessageSquare/> },
                     ].map(tab => (
                       <button key={tab.id} onClick={() => setAdminSubTab(tab.id as any)} className={`p-10 rounded-[3rem] font-black text-2xl transition-all border flex flex-col items-center gap-4 ${adminSubTab === tab.id ? 'bg-emerald-500 text-black border-emerald-500 shadow-2xl' : 'glass text-slate-500 border-white/10 hover:bg-white/5'}`}>
                         {tab.icon} {tab.label}
                       </button>
                     ))}
                  </div>

                  {adminSubTab === 'overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-in fade-in">
                       <div className="glass p-16 rounded-[4rem] border-emerald-500/20 bg-emerald-500/[0.01] space-y-8">
                          <h3 className="text-4xl font-black flex items-center gap-6 text-emerald-500"><ShieldAlert/> التقرير السيادي الذكي</h3>
                          <div className="p-10 bg-black/40 rounded-[2.5rem] border border-white/5 font-black text-2xl leading-relaxed text-slate-300 shadow-inner">
                            {aiReport}
                          </div>
                       </div>
                       <div className="grid grid-cols-2 gap-8">
                          <div className="glass p-12 rounded-[3.5rem] border-white/5 text-center flex flex-col justify-center">
                             <div className="text-xs text-slate-500 font-black uppercase mb-4">إجمالي العملاء</div>
                             <div className="text-7xl font-black text-emerald-500">{state.users.length}</div>
                          </div>
                          <div className="glass p-12 rounded-[3.5rem] border-white/5 text-center flex flex-col justify-center">
                             <div className="text-xs text-slate-500 font-black uppercase mb-4">طلبات معلقة</div>
                             <div className="text-7xl font-black text-amber-500">{state.transactions.filter(t => t.status === TransactionStatus.PENDING).length}</div>
                          </div>
                          <div className="col-span-2 glass p-12 rounded-[3.5rem] border-white/5 flex justify-between items-center px-16">
                             <div>
                               <div className="text-xs text-slate-500 font-black uppercase mb-2">إجمالي الودائع المعتمدة</div>
                               <div className="text-6xl font-black text-emerald-500">{state.transactions.filter(t => t.type === TransactionType.DEPOSIT && t.status === TransactionStatus.APPROVED).reduce((a, b) => a + b.amount, 0).toLocaleString()} <span className="text-xl">ج.م</span></div>
                             </div>
                             <TrendingUp className="w-16 h-16 text-emerald-500 opacity-20" />
                          </div>
                       </div>
                    </div>
                  )}

                  {adminSubTab === 'support' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 h-[800px] animate-in slide-in-from-right-10">
                      <div className="glass rounded-[4rem] p-10 space-y-6 overflow-y-auto">
                        <h3 className="text-3xl font-black mb-10 text-emerald-500">الدردشات النشطة</h3>
                        {Array.from(new Set(state.messages.map(m => m.senderId))).filter(id => id !== 'ADMIN').map(uid => (
                          <button key={uid} onClick={() => setSelectedChatUserId(uid)} className={`w-full text-right p-8 rounded-[2rem] transition-all font-black flex justify-between items-center text-xl ${selectedChatUserId === uid ? 'bg-emerald-500 text-black shadow-xl' : 'glass hover:bg-white/5 border-white/5'}`}>
                            {state.users.find(u => u.id === uid)?.name || 'مستخدم مجهول'}
                            <ChevronLeft className="w-6 h-6"/>
                          </button>
                        ))}
                      </div>
                      <div className="lg:col-span-2 glass rounded-[4.5rem] p-14 flex flex-col border-emerald-500/10">
                        {selectedChatUserId ? (
                          <>
                            <div className="flex items-center justify-between mb-10 border-b border-white/5 pb-8">
                               <div className="flex items-center gap-6">
                                  <div className="w-16 h-16 bg-emerald-500 text-black rounded-2xl flex items-center justify-center font-black text-2xl">{state.users.find(u => u.id === selectedChatUserId)?.name[0]}</div>
                                  <div className="text-3xl font-black">{state.users.find(u => u.id === selectedChatUserId)?.name}</div>
                               </div>
                               <button onClick={() => setSelectedChatUserId(null)} className="text-slate-500 hover:text-white"><XCircle/></button>
                            </div>
                            <div className="flex-1 overflow-y-auto space-y-6 mb-10 pr-4">
                              {state.messages.filter(m => m.senderId === selectedChatUserId || m.receiverId === selectedChatUserId).map(m => (
                                <div key={m.id} className={`flex ${m.senderId === 'ADMIN' ? 'justify-end' : 'justify-start'}`}>
                                  <div className={`p-8 rounded-[2.5rem] max-w-[80%] shadow-xl text-xl leading-relaxed ${m.senderId === 'ADMIN' ? 'bg-emerald-500 text-black font-black' : 'glass border-white/10 text-slate-200'}`}>{m.text}</div>
                                </div>
                              ))}
                            </div>
                            <div className="flex gap-6">
                              <input type="text" className="flex-1 bg-white/5 p-8 rounded-[2.5rem] text-2xl font-black outline-none border border-white/5 focus:border-emerald-500 transition-all" value={msgInput} onChange={e => setMsgInput(e.target.value)} placeholder="الرد الإداري..." onKeyDown={e => e.key === 'Enter' && (sendMessage(msgInput, selectedChatUserId!), setMsgInput(''))} />
                              <button onClick={() => { sendMessage(msgInput, selectedChatUserId!); setMsgInput(''); }} className="bg-emerald-500 text-black p-8 rounded-[2.5rem] hover:scale-105 active:scale-95 transition-all shadow-2xl"><Send className="w-10 h-10"/></button>
                            </div>
                          </>
                        ) : (
                          <div className="flex-1 flex flex-col items-center justify-center text-slate-600 gap-10">
                            <MessageSquare className="w-40 h-40 opacity-5" />
                            <p className="text-4xl font-black opacity-30">اختر محادثة للبدء في الردود الإدارية</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {adminSubTab === 'finance' && (
                    <div className="space-y-8 animate-in slide-in-from-bottom-10">
                       <h3 className="text-4xl font-black text-amber-500">الطلبات المعلقة</h3>
                       {state.transactions.filter(t => t.status === TransactionStatus.PENDING).map(tx => (
                         <div key={tx.id} className="p-12 glass rounded-[4rem] border-white/5 flex flex-wrap justify-between items-center gap-10 shadow-2xl hover:border-amber-500/20 transition-all">
                            <div className="flex items-center gap-10">
                               <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center text-4xl shadow-xl ${tx.type === TransactionType.DEPOSIT ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>{tx.type === TransactionType.DEPOSIT ? <ArrowDownLeft/> : <ArrowUpRight/>}</div>
                               <div>
                                  <div className="text-3xl font-black">{tx.userName}</div>
                                  <div className="text-2xl font-bold text-slate-400 mt-1">{tx.amount.toLocaleString()} <span className="text-sm">ج.م</span> <span className="text-xs uppercase text-slate-600 px-3 py-1 bg-white/5 rounded-full mr-4">{tx.type}</span></div>
                               </div>
                            </div>
                            <div className="flex gap-6">
                               {tx.screenshotUrl && (
                                 <button onClick={() => window.open(tx.screenshotUrl)} className="glass border border-white/10 p-7 rounded-[2rem] text-amber-500 hover:bg-white/10 transition-all shadow-xl"><Camera className="w-8 h-8"/></button>
                               )}
                               <button onClick={() => handleAdminAction(tx.id, TransactionStatus.APPROVED)} className="bg-emerald-500 text-black px-12 py-6 rounded-[2rem] font-black text-2xl shadow-xl hover:scale-105 transition-all">موافقة</button>
                               <button onClick={() => handleAdminAction(tx.id, TransactionStatus.REJECTED)} className="bg-red-500 text-white px-12 py-6 rounded-[2rem] font-black text-2xl shadow-xl hover:scale-105 transition-all">رفض</button>
                            </div>
                         </div>
                       ))}
                    </div>
                  )}
               </div>
            )}
          </main>
        </div>
      )}

      {/* Modals - Refined for v4.5 */}
      {isDepositOpen && (
        <div className="fixed inset-0 bg-black/98 z-[5000] flex items-center justify-center p-6 backdrop-blur-[50px] overflow-y-auto">
          <div className="w-full max-w-3xl glass p-16 rounded-[6rem] relative my-auto animate-in zoom-in-95 duration-500 border-amber-500/20">
            <button onClick={() => setIsDepositOpen(false)} className="absolute top-10 left-10 p-4 glass rounded-full text-slate-500 hover:text-white transition-all"><XCircle className="w-10 h-10"/></button>
            <h3 className="text-6xl font-black mb-12 flex items-center gap-8"><ArrowDownLeft className="text-amber-500 w-16 h-16"/> شحن <span className="text-amber-500">السيادة</span></h3>
            <div className="space-y-10">
               <div className="grid grid-cols-2 gap-6">
                  {Object.entries(PAYMENT_METHODS_DETAILS).map(([key, details]) => (
                    <button key={key} onClick={() => setSelectedMethod(key as PaymentMethod)} className={`p-8 rounded-[3rem] border-2 transition-all flex flex-col items-center gap-4 ${selectedMethod === key ? 'bg-amber-500 text-black border-amber-500 shadow-2xl' : 'glass border-white/5 text-slate-400 hover:bg-white/5'}`}>
                      <div className={`p-4 rounded-2xl ${selectedMethod === key ? 'bg-black/10' : 'bg-white/5'}`}>{details.icon}</div>
                      <span className="font-black text-lg">{details.label}</span>
                    </button>
                  ))}
               </div>
               <div className="p-12 glass rounded-[4rem] text-center space-y-6 border border-white/10 shadow-inner">
                  <p className="text-xs font-black uppercase text-slate-500 tracking-[0.5em]">الرقم الرسمي للتحويل</p>
                  <div className="text-5xl font-black tracking-[0.3em] text-amber-500 flex items-center justify-center gap-8">
                    {PAYMENT_METHODS_DETAILS[selectedMethod].account}
                    <button onClick={() => copyToClipboard(PAYMENT_METHODS_DETAILS[selectedMethod].account)} className="p-4 glass rounded-3xl hover:scale-110 transition-all"><Copy className="w-8 h-8"/></button>
                  </div>
               </div>
               <div className="space-y-6">
                  <input type="number" placeholder="المبلغ المودع (ج.م)" className="w-full bg-white/5 border-2 border-white/5 p-12 rounded-[3.5rem] text-6xl font-black text-center outline-none focus:border-amber-500 transition-all shadow-inner" value={depositAmount} onChange={e => setDepositAmount(e.target.value)} />
                  <div className="relative group">
                    <input type="file" id="receipt" className="hidden" onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const r = new FileReader(); r.onloadend = () => setScreenshot(r.result as string); r.readAsDataURL(file);
                      }
                    }} />
                    <label htmlFor="receipt" className="w-full glass border-4 border-dashed border-white/10 p-16 rounded-[4rem] flex flex-col items-center justify-center gap-6 cursor-pointer group-hover:border-amber-500/50 transition-all">
                      {screenshot ? <CheckCircle2 className="w-20 h-20 text-emerald-500"/> : <Upload className="w-20 h-20 text-slate-500"/>}
                      <span className="font-black text-2xl text-slate-500">{screenshot ? 'تم تحميل الإيصال' : 'رفع إيصال الدفع البصري'}</span>
                    </label>
                  </div>
                  {screenshot && (
                    <button onClick={handleAiAnalyzeReceipt} disabled={isAiAnalyzing} className="w-full py-6 glass rounded-3xl flex items-center justify-center gap-6 font-black text-2xl text-amber-500 hover:bg-amber-500/10 border border-amber-500/30 transition-all">
                      <Sparkles className={isAiAnalyzing ? 'animate-spin' : 'animate-pulse'}/> {isAiAnalyzing ? 'جاري الفحص المالي...' : 'فحص الإيصال بذكاء Aura'}
                    </button>
                  )}
               </div>
               <button onClick={handleDepositSubmit} className="w-full bg-amber-500 text-black py-12 rounded-[3.5rem] font-black text-4xl shadow-[0_0_100px_rgba(251,191,36,0.2)] hover:scale-[1.02] active:scale-95 transition-all">تأكيد الإيداع السيادي</button>
            </div>
          </div>
        </div>
      )}

      {isInvestOpen && (
        <div className="fixed inset-0 bg-black/98 z-[5000] flex items-center justify-center p-6 backdrop-blur-[50px]">
          <div className="w-full max-w-6xl glass p-20 rounded-[7rem] relative animate-in zoom-in-95 duration-700 border-emerald-500/10">
            <button onClick={() => setIsInvestOpen(false)} className="absolute top-12 left-12 p-4 glass rounded-full text-slate-500 hover:text-white"><XCircle className="w-12 h-12"/></button>
            <h3 className="text-8xl font-black mb-16 flex items-center gap-10"><Cpu className="text-emerald-500 w-24 h-24 animate-spin-slow"/> مستويات <span className="text-emerald-500">التعدين</span></h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {INVESTMENT_TIERS.map(tier => (
                <div key={tier.label} className="glass p-14 rounded-[4.5rem] flex flex-col items-center text-center gap-10 border-white/5 hover:border-emerald-500/30 transition-all shadow-2xl relative group overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="text-amber-500 font-black tracking-[0.5em] uppercase text-sm relative z-10">{tier.label}</div>
                  <div className="text-7xl font-black tabular-nums relative z-10">{tier.amount.toLocaleString()} <span className="text-xl">ج.م</span></div>
                  <div className="space-y-4 relative z-10">
                     <div className="flex items-center gap-3 text-emerald-400 font-bold"><CheckCircle2 className="w-5 h-5"/> عائد يومي مركب</div>
                     <div className="flex items-center gap-3 text-emerald-400 font-bold"><CheckCircle2 className="w-5 h-5"/> حصاد لحظي متاح</div>
                  </div>
                  <button onClick={() => handleActivateNode(tier.amount)} className="w-full bg-emerald-500 text-black py-8 rounded-[2.5rem] font-black text-2xl shadow-xl hover:scale-105 transition-all relative z-10">تفعيل الآن</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {isWithdrawOpen && (
        <div className="fixed inset-0 bg-black/98 z-[5000] flex items-center justify-center p-6 backdrop-blur-[50px]">
          <div className="w-full max-w-3xl glass p-16 rounded-[6rem] relative animate-in zoom-in-95 border-red-500/10">
            <button onClick={() => setIsWithdrawOpen(false)} className="absolute top-10 left-10 p-4 glass rounded-full text-slate-500"><XCircle className="w-10 h-10"/></button>
            <h3 className="text-6xl font-black mb-12 flex items-center gap-8"><ArrowUpRight className="text-red-500 w-16 h-16"/> تسييل <span className="text-red-500">المحفظة</span></h3>
            <div className="space-y-12">
               <div className="text-center">
                  <label className="text-[10px] text-slate-500 font-black uppercase tracking-[0.6em] mb-6 block">المبلغ المراد سحبه</label>
                  <input type="number" className="w-full bg-white/5 border-2 border-white/5 rounded-[4rem] p-16 text-9xl font-black text-center outline-none focus:border-red-500 transition-all shadow-inner tabular-nums" placeholder="0.00" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} />
               </div>
               <div className="p-10 bg-red-500/10 border border-red-500/20 rounded-[3rem] flex items-center gap-8 shadow-inner">
                  <AlertTriangle className="text-red-500 w-16 h-16 shrink-0"/> 
                  <p className="text-lg font-bold text-red-500/90 leading-relaxed">تنبيه: رسوم تسييل رأس المال (50 ج.م ثابتة) + رسوم سيولة بنسبة 10% للمبالغ التي تتجاوز 5,000 ج.م لضمان استقرار الصندوق المالي.</p>
               </div>
               <button onClick={handleFinalizeWithdraw} className="w-full bg-red-500 text-white py-12 rounded-[4rem] font-black text-4xl shadow-[0_0_100px_rgba(239,68,68,0.2)] hover:scale-[1.02] transition-all">تأكيد السحب النهائي</button>
            </div>
          </div>
        </div>
      )}

      <ChatAssistant />
    </div>
  );
};

export default App;
