
import React, { useState, useEffect, useMemo } from 'react';
import { MIN_DAILY_PROFIT, MAX_DAILY_PROFIT, PROFIT_DISTRIBUTION } from '../constants';
import { Zap, Coins, Cpu, TrendingUp, Clock, Activity, Users, Globe, Eye, BarChart3, Calendar, Timer } from 'lucide-react';

interface Props {
  invested: number;
}

export const MiningDisplay: React.FC<Props> = ({ invested }) => {
  const [currentPiastres, setCurrentPiastres] = useState(0);
  const [performance, setPerformance] = useState(0.85); // 0 to 1
  
  // Base rates calculation (Dynamic)
  const dailyEgp = invested * (MIN_DAILY_PROFIT + performance * (MAX_DAILY_PROFIT - MIN_DAILY_PROFIT));
  const hourlyEgp = dailyEgp / 24;
  const minutelyEgp = hourlyEgp / 60;
  const piastresPerSec = (hourlyEgp / 3600) * 100;

  // Workforce stats
  const designers = Math.max(1, Math.floor(invested / 2000));
  const marketers = Math.max(1, Math.floor(invested / 3000));
  const activeAds = Math.max(1, Math.floor(invested / 5000));

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPiastres(prev => prev + piastresPerSec);
      // Small fluctuations in performance every update
      setPerformance(p => Math.min(1, Math.max(0.2, p + (Math.random() - 0.5) * 0.05)));
    }, 1000);
    return () => clearInterval(interval);
  }, [piastresPerSec]);

  const yearlyProjection = dailyEgp * 365;

  return (
    <div className="p-8 glass rounded-[3rem] border-emerald-500/20 border-2 flex flex-col space-y-6 relative overflow-hidden aura-shadow bg-emerald-500/[0.02]">
      {/* Background Glow Effect */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-[80px] animate-pulse"></div>
      
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3 bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/20">
          <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />
          <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Aura Performance Hub</span>
        </div>
        <div className="text-[9px] font-black text-slate-500 uppercase flex items-center gap-2">
           <div className={`w-2 h-2 rounded-full ${performance > 0.7 ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'}`}></div>
           {performance > 0.7 ? 'High Growth' : 'Stable Yield'}
        </div>
      </div>
      
      <div className="text-center py-4 relative z-10">
        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">تدفق عوائد التشغيل اللحظي</h4>
        <div className="flex items-baseline justify-center gap-2">
          <span className="text-7xl font-black text-white tabular-nums tracking-tighter">
            {currentPiastres.toFixed(2)}
          </span>
          <span className="text-xl font-black text-emerald-500">قرش</span>
        </div>
        
        {/* Dynamic Earnings Breakdown Bar */}
        <div className="mt-8 grid grid-cols-2 gap-3 max-w-sm mx-auto">
          <div className="bg-white/5 border border-white/5 p-3 rounded-2xl flex flex-col items-center">
            <div className="flex items-center gap-2 text-[8px] font-black text-slate-500 uppercase mb-1">
              <Clock className="w-3 h-3 text-amber-500" /> ربح الساعة
            </div>
            <div className="text-lg font-black text-amber-500">{hourlyEgp.toFixed(2)} <span className="text-[8px] opacity-60">ج.م</span></div>
          </div>
          <div className="bg-white/5 border border-white/5 p-3 rounded-2xl flex flex-col items-center">
            <div className="flex items-center gap-2 text-[8px] font-black text-slate-500 uppercase mb-1">
              <Timer className="w-3 h-3 text-blue-500" /> ربح الدقيقة
            </div>
            <div className="text-lg font-black text-blue-500">{minutelyEgp.toFixed(4)} <span className="text-[8px] opacity-60">ج.م</span></div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-4">
           <div className="flex items-center gap-1.5 text-[8px] font-black text-slate-400 uppercase border border-white/5 px-3 py-1.5 rounded-xl bg-white/[0.02]">
             <Users className="w-3 h-3 text-blue-400" /> {designers + marketers} موظف نشط
           </div>
           <div className="flex items-center gap-1.5 text-[8px] font-black text-slate-400 uppercase border border-white/5 px-3 py-1.5 rounded-xl bg-white/[0.02]">
             <Globe className="w-3 h-3 text-amber-400" /> {activeAds} حملة ممولة
           </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 relative z-10">
        <div className="bg-white/5 p-5 rounded-[2rem] border border-white/5 group hover:border-amber-500/30 transition-all">
           <div className="flex items-center gap-3 mb-3 text-amber-500">
             <TrendingUp className="w-4 h-4 group-hover:scale-110 transition-transform" />
             <span className="text-[9px] font-black uppercase text-slate-400">العائد السنوي المتوقع</span>
           </div>
           <div className="text-2xl font-black text-white tabular-nums">{yearlyProjection.toLocaleString()} <span className="text-[10px] text-slate-600">EGP</span></div>
        </div>
        <div className="bg-white/5 p-5 rounded-[2rem] border border-white/5 group hover:border-emerald-500/30 transition-all">
           <div className="flex items-center gap-3 mb-3 text-emerald-500">
             <Calendar className="w-4 h-4 group-hover:scale-110 transition-transform" />
             <span className="text-[9px] font-black uppercase text-slate-400">العائد اليومي الحالي</span>
           </div>
           <div className="text-2xl font-black text-white tabular-nums">{dailyEgp.toFixed(2)} <span className="text-[10px] text-slate-600">EGP</span></div>
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-white/5 relative z-10">
        <div className="flex justify-between text-[9px] font-black uppercase text-slate-500 tracking-widest px-1">
          <span>هيكل توزيع الأرباح (ehabgm Core)</span>
          <span className="text-emerald-500 animate-pulse">توزيع لحظي</span>
        </div>
        <div className="flex h-3 w-full rounded-full overflow-hidden bg-white/5">
          {PROFIT_DISTRIBUTION.map((item, idx) => (
            <div 
              key={idx} 
              style={{ width: `${item.percent}%`, backgroundColor: item.color }} 
              className="h-full relative group cursor-help transition-all hover:opacity-80"
            >
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50">
                 <div className="bg-black text-[8px] font-black p-2 rounded whitespace-nowrap border border-white/10 shadow-2xl">
                   {item.label}: {item.percent}%
                 </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
