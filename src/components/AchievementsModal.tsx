import React from 'react';
import { Achievement } from '../types/game';
import { Trophy, X, Coins, CheckCircle2 } from 'lucide-react';

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  achievements: Achievement[];
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  isOpen,
  onClose,
  achievements
}) => {
  if (!isOpen) return null;

  const unlockedCount = achievements.filter(a => a.isUnlocked).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl max-h-[85vh] rounded-3xl bg-slate-900 border-2 border-slate-700 shadow-2xl p-6 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Trophy className="w-6 h-6 text-amber-400" />
            <div>
              <h2 className="text-lg font-bold text-slate-100">
                成就榮譽榜 ({unlockedCount}/{achievements.length})
              </h2>
              <p className="text-xs text-slate-400">
                達成特定目標即可領取豐厚金幣獎勵，助你征服更高循環！
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar overall */}
        <div className="my-3">
          <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
            <span>解鎖總進度</span>
            <span className="text-amber-400 font-bold">
              {Math.round((unlockedCount / achievements.length) * 100)}%
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-300"
              style={{ width: `${(unlockedCount / achievements.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Achievement List */}
        <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2.5 scrollbar-thin">
          {achievements.map(ach => {
            const pct = Math.min(100, Math.round((ach.progress / ach.maxProgress) * 100));

            return (
              <div
                key={ach.id}
                className={`rounded-2xl border p-3 flex items-center justify-between gap-3 transition-colors ${
                  ach.isUnlocked
                    ? 'bg-amber-950/20 border-amber-500/50 shadow-sm'
                    : 'bg-slate-950/60 border-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl border ${
                      ach.isUnlocked
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                        : 'bg-slate-900 border-slate-700 opacity-50 grayscale'
                    }`}
                  >
                    {ach.icon}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-100">{ach.title}</h4>
                      {ach.isUnlocked && (
                        <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-600/60 px-1.5 py-0.2 rounded-full">
                          <CheckCircle2 className="w-3 h-3" /> 已解鎖
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">{ach.description}</p>

                    {/* Progress details */}
                    {!ach.isUnlocked && (
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="w-28 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-amber-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">
                          {ach.progress} / {ach.maxProgress} ({pct}%)
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <div className="flex items-center gap-1 text-xs font-bold text-yellow-400">
                    <Coins className="w-3.5 h-3.5" />
                    <span>+{ach.goldReward} G</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
