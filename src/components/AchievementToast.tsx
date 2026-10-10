import React from 'react';
import { Achievement } from '../types/game';
import { Trophy, Coins } from 'lucide-react';

interface AchievementToastProps {
  achievement: Achievement | null;
  onClose: () => void;
}

export const AchievementToast: React.FC<AchievementToastProps> = ({ achievement, onClose }) => {
  if (!achievement) return null;

  return (
    <div
      onClick={onClose}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3.5 px-4 py-3 rounded-2xl bg-gradient-to-r from-amber-950/95 via-slate-900/95 to-slate-950/95 border-2 border-amber-400 shadow-2xl shadow-amber-950/60 backdrop-blur-md cursor-pointer animate-bounce hover:scale-105 transition-transform"
    >
      <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-400 flex items-center justify-center text-2xl filter drop-shadow">
        {achievement.icon}
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 text-[11px] font-black text-amber-400 uppercase tracking-wider">
          <Trophy className="w-3.5 h-3.5" />
          <span>成就達成！解鎖榮譽</span>
        </div>
        <h4 className="font-bold text-sm text-slate-100">{achievement.title}</h4>
        <p className="text-xs text-slate-400 max-w-xs">{achievement.description}</p>
      </div>

      <div className="ml-2 pl-3 border-l border-slate-700/80 flex flex-col items-center">
        <span className="text-[10px] text-slate-400">獎勵</span>
        <div className="flex items-center gap-1 font-bold text-sm text-yellow-300">
          <Coins className="w-4 h-4 text-yellow-400" />
          <span>+{achievement.goldReward} G</span>
        </div>
      </div>
    </div>
  );
};
