import React from 'react';
import { ActiveSkillState } from '../types/game';
import { Sparkles, Zap, Shield, Flame, Leaf, Eye, Settings2 } from 'lucide-react';

interface ActiveSkillBarProps {
  skills: ActiveSkillState[];
  onOpenRuneModal: () => void;
  activeCastRuneId?: string | null;
  compact?: boolean;
}

export const ActiveSkillBar: React.FC<ActiveSkillBarProps> = ({
  skills,
  onOpenRuneModal,
  activeCastRuneId,
  compact = false
}) => {
  return (
    <div className="w-full bg-slate-900/95 border border-slate-800 rounded-2xl p-3 shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-amber-500/20 text-amber-400">
            <Zap className="w-4 h-4" />
          </div>
          <span className="text-xs font-black tracking-wide text-amber-300">
            主動技能符文 (Active Skill Runes)
          </span>
          <span className="text-[10px] text-slate-400 hidden sm:inline">
            戰鬥中依冷卻時間自動施放
          </span>
        </div>
        <button
          onClick={onOpenRuneModal}
          className="text-[11px] font-bold text-slate-300 hover:text-amber-300 bg-slate-800 hover:bg-slate-700/80 px-2.5 py-1 rounded-lg border border-slate-700 transition flex items-center gap-1.5 shadow-sm active:scale-95"
          title="更換裝備的符文技能"
        >
          <Settings2 className="w-3.5 h-3.5 text-amber-400" />
          <span>配置符文</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {skills.map((skill) => {
          const { rune, currentCooldown, isReady } = skill;
          const isActivelyCasting = activeCastRuneId === rune.id;
          const progressPct = Math.max(
            0,
            Math.min(100, ((rune.cooldownMax - currentCooldown) / rune.cooldownMax) * 100)
          );

          let runeTypeIcon = <Sparkles className="w-3.5 h-3.5" />;
          let colorGradient = 'from-amber-500 to-yellow-400';
          let borderAccent = 'border-amber-500/40';

          if (rune.type === 'shield') {
            runeTypeIcon = <Shield className="w-3.5 h-3.5 text-yellow-400" />;
            colorGradient = 'from-yellow-500 to-amber-400';
            borderAccent = 'border-yellow-500/50';
          } else if (rune.type === 'stun') {
            runeTypeIcon = <Zap className="w-3.5 h-3.5 text-cyan-400" />;
            colorGradient = 'from-cyan-500 to-blue-400';
            borderAccent = 'border-cyan-500/50';
          } else if (rune.type === 'rage') {
            runeTypeIcon = <Flame className="w-3.5 h-3.5 text-rose-400" />;
            colorGradient = 'from-rose-500 to-red-500';
            borderAccent = 'border-rose-500/50';
          } else if (rune.type === 'heal') {
            runeTypeIcon = <Leaf className="w-3.5 h-3.5 text-emerald-400" />;
            colorGradient = 'from-emerald-500 to-teal-400';
            borderAccent = 'border-emerald-500/50';
          } else if (rune.type === 'arcane') {
            runeTypeIcon = <Eye className="w-3.5 h-3.5 text-purple-400" />;
            colorGradient = 'from-purple-500 to-indigo-400';
            borderAccent = 'border-purple-500/50';
          }

          return (
            <div
              key={rune.id}
              className={`relative bg-slate-950/80 rounded-xl p-2.5 border transition-all duration-200 overflow-hidden ${borderAccent} ${
                isActivelyCasting
                  ? 'ring-2 ring-amber-400 scale-[1.02] shadow-lg shadow-amber-500/30'
                  : isReady
                  ? 'ring-1 ring-amber-400/80 shadow-md shadow-amber-500/10'
                  : ''
              }`}
            >
              {/* Ready/Casting dynamic background glow */}
              {isReady && (
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-transparent to-amber-500/10 animate-pulse pointer-events-none" />
              )}

              <div className="flex items-center justify-between mb-1.5 z-10 relative">
                <div className="flex items-center gap-2">
                  <span className="text-xl filter drop-shadow select-none">{rune.icon}</span>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-black text-xs text-white">{rune.name}</span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {rune.title}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {isActivelyCasting ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-500 text-slate-950 animate-bounce flex items-center gap-1 shadow-md">
                      ⚡ 施放中!
                    </span>
                  ) : isReady ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-500 text-slate-950 animate-pulse flex items-center gap-1 shadow-md">
                      ✨ READY!
                    </span>
                  ) : (
                    <span className="text-[11px] font-mono font-bold text-slate-400">
                      {currentCooldown.toFixed(1)}s / {rune.cooldownMax}s
                    </span>
                  )}
                </div>
              </div>

              {/* Cooldown Progress Bar */}
              <div className="w-full h-2 rounded-full bg-slate-800/90 overflow-hidden relative border border-slate-700/80 p-0.5 mb-1.5">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${colorGradient} transition-all duration-100 shadow-sm ${
                    isReady ? 'animate-pulse' : ''
                  }`}
                  style={{ width: `${progressPct}%` }}
                />
              </div>

              {!compact && (
                <p className="text-[10px] text-slate-400 line-clamp-1 leading-snug">
                  {rune.description}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
