
import React, { useState, useEffect } from 'react';
import { MIN_DAILY_PROFIT, MAX_DAILY_PROFIT, PROFIT_DISTRIBUTION } from '../constants';
import { Zap, Coins, Cpu, TrendingUp, Clock, Activity, Users, Globe, Timer, Calendar, Scissors } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

interface Props {
  invested: number;
}

export const MiningDisplay: React.FC<Props> = ({ invested }) => {
  const { harvestProfits, state } = useAppStore();
  const [currentDisplayProfit, setCurrentDisplayProfit] = useState(0);
  const [isHarvesting, setIsHarvesting] = useState(false);
  
  const dailyRate = (MIN_DAILY_PROFIT + MAX_DAILY_PROFIT) / 2;
  const profitPerSec = (invested * dailyRate) / 86400;

  useEffect(() => {
    // حساب الأرباح التقديرية بناءً على آخر حصاد فعلي
    const lastHarvest = state.currentUser?.lastHarvest || state.currentUser?.joinDate || Date.now();
    const initialDiff = (Date.now() - lastHarvest) / 1000;
    setCurrentDisplayProfit(initialDiff * profitPerSec);

    const interval = setInterval(() => {
      setCurrentDisplayProfit(prev => prev + profitPerSec);
    }, 1000);
    return () => clearInterval(interval);
  }, [profitPerSec, state.currentUser?.lastHarvest]);

  const handleHarvest = async () => {
    if (currentDisplayProfit < 0.1) return;
    setIsHarvesting(true);
    const earned = await harvestProfits();
    if (earned > 0) {
      setCurrentDisplayProfit(0);
    }
    setIsHarvesting(false);
  };

  return (
    <div className="p-8 glass rounded-[3rem] border-emerald-500/20 border-2 flex flex-col space-y-6 relative overflow-hidden aura-shadow bg-emerald-500/[0.02]">
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-[80px] animate-pulse"></div>
      
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3 bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/20">
          <Cpu className="w-3 h-3 text-emerald-400 animate-spin-slow" />
          <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Active Mining Node</span>
        </div>
        <button 
          onClick={handleHarvest}
          disabled={isHarvesting || currentDisplayProfit < 0.1}
          className="bg-amber-500 text-black px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:scale-105 active:scale-95 transition-all disabled:opacity-20"
        >
          {isHarvesting ? 'جاري الحصاد...' : 'حصاد الأرباح'} <Scissors className="w-3 h-3"/>
        </button>
      </div>
      
      <div className="text-center py-4 relative z-10">
        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">الأرباح المتراكمة القابلة للحصاد</h4>
        <div className="flex items-baseline justify-center gap-2">
          <span className="text-7xl font-black text-white tabular-nums tracking-tighter">
            {currentDisplayProfit.toFixed(4)}
          </span>
          <span className="text-xl font-black text-emerald-500">ج.م</span>
        </div>
        
        <div className="mt-8 grid grid-cols-2 gap-3 max-w-sm mx-auto">
          <div className="bg-white/5 border border-white/5 p-3 rounded-2xl flex flex-col items-center">
            <div className="flex items-center gap-2 text-[8px] font-black text-slate-500 uppercase mb-1">
              <Clock className="w-3 h-3 text-amber-500" /> ربح الساعة
            </div>
            <div className="text-lg font-black text-amber-500">{(profitPerSec * 3600).toFixed(2)} <span className="text-[8px] opacity-60">ج.م</span></div>
          </div>
          <div className="bg-white/5 border border-white/5 p-3 rounded-2xl flex flex-col items-center">
            <div className="flex items-center gap-2 text-[8px] font-black text-slate-500 uppercase mb-1">
              <Timer className="w-3 h-3 text-blue-500" /> ربح الدقيقة
            </div>
            <div className="text-lg font-black text-blue-500">{(profitPerSec * 60).toFixed(4)} <span className="text-[8px] opacity-60">ج.م</span></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 relative z-10">
        <div className="bg-white/5 p-5 rounded-[2rem] border border-white/5 group hover:border-amber-500/30 transition-all">
           <div className="flex items-center gap-3 mb-3 text-amber-500">
             <TrendingUp className="w-4 h-4 group-hover:scale-110 transition-transform" />
             <span className="text-[9px] font-black uppercase text-slate-400">العائد السنوي المتوقع</span>
           </div>
           <div className="text-2xl font-black text-white tabular-nums">{(invested * dailyRate * 365).toLocaleString()} <span className="text-[10px] text-slate-600">EGP</span></div>
        </div>
        <div className="bg-white/5 p-5 rounded-[2rem] border border-white/5 group hover:border-emerald-500/30 transition-all">
           <div className="flex items-center gap-3 mb-3 text-emerald-500">
             <Calendar className="w-4 h-4 group-hover:scale-110 transition-transform" />
             <span className="text-[9px] font-black uppercase text-slate-400">العائد اليومي المقدر</span>
           </div>
           <div className="text-2xl font-black text-white tabular-nums">{(invested * dailyRate).toFixed(2)} <span className="text-[10px] text-slate-600">EGP</span></div>
        </div>
      </div>
    </div>
  );
};
