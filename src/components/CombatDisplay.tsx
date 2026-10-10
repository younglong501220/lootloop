import React from 'react';
import { MonsterStats, PlayerStats, CombatLogEntry, DamagePopup, ActiveSkillState, EnvironmentalEvent } from '../types/game';
import { Shield, Swords, Heart, Sparkles, Skull, Wind, Flame, Zap, CloudLightning, Sun } from 'lucide-react';
import { ActiveSkillBar } from './ActiveSkillBar';

interface CombatDisplayProps {
  player: PlayerStats;
  monster: MonsterStats | null;
  isInCombat: boolean;
  logs: CombatLogEntry[];
  shakeTarget: 'player' | 'monster' | null;
  popups: DamagePopup[];
  activeSkills?: ActiveSkillState[];
  onOpenRuneModal?: () => void;
  activeCastRuneId?: string | null;
  activeEvent?: EnvironmentalEvent | null;
}

export const CombatDisplay: React.FC<CombatDisplayProps> = ({
  player,
  monster,
  isInCombat,
  logs,
  shakeTarget,
  popups,
  activeSkills = [],
  onOpenRuneModal,
  activeCastRuneId,
  activeEvent
}) => {
  return (
    <div className="flex flex-col gap-3 w-full relative">
      {/* Real-time Duel Card when in combat */}
      {isInCombat && monster && (
        <div
          className={`relative rounded-2xl bg-gradient-to-r from-slate-900 via-rose-950/40 to-slate-900 border-2 border-rose-600/70 p-4 shadow-2xl shadow-rose-950/40 flex flex-col gap-3 transition-transform duration-75 overflow-hidden ${
            shakeTarget === 'monster' ? 'animate-shake border-red-500 shadow-red-900/60 ring-2 ring-red-500' : ''
          }`}
        >
          {/* Flash hit overlay */}
          {shakeTarget === 'monster' && (
            <div className="absolute inset-0 bg-red-600/20 pointer-events-none animate-pulse" />
          )}

          {/* Environmental Event Banner */}
          {activeEvent && (
            <div className="relative -mx-2 -mt-2 mb-1 p-2 rounded-xl bg-gradient-to-r from-slate-950/90 via-indigo-950/80 to-slate-950/90 border border-amber-400/60 shadow-lg animate-event-banner flex items-center justify-between gap-2 overflow-hidden z-20">
              <div className="absolute inset-0 bg-amber-400/5 pointer-events-none animate-pulse" />
              <div className="flex items-center gap-2 relative z-10">
                <span className="text-xl filter drop-shadow animate-bounce">
                  {activeEvent.icon}
                </span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-400/40">
                      環境突發事件
                    </span>
                    <span className="text-xs font-bold text-slate-100">
                      {activeEvent.name}
                    </span>
                  </div>
                  <p className="text-[10px] text-amber-200/90 font-medium mt-0.5">
                    {activeEvent.effectSummary}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold text-amber-400 px-2 py-0.5 rounded-lg bg-amber-950/80 border border-amber-500/50 flex-shrink-0 animate-pulse">
                ⚡ 戰局劇變
              </span>
            </div>
          )}

          {/* Floating Damage Popups Layer */}
          <div className="absolute inset-0 pointer-events-none z-30 flex items-center justify-center">
            {popups.map(popup => {
              let styleClasses = 'text-red-400 bg-red-950/90 border-red-500 shadow-red-900/80';

              if (popup.type === 'crit') {
                styleClasses = 'text-yellow-300 bg-amber-950/95 border-amber-400 shadow-amber-500/80 text-base font-black ring-2 ring-yellow-400';
              } else if (popup.type === 'block') {
                styleClasses = 'text-sky-300 bg-sky-950/90 border-sky-400 shadow-sky-900/80';
              } else if (popup.type === 'heal') {
                styleClasses = 'text-emerald-300 bg-emerald-950/90 border-emerald-400 shadow-emerald-900/80';
              } else if (popup.type === 'dodge') {
                styleClasses = 'text-teal-200 bg-teal-950/90 border-teal-400 shadow-teal-900/80 text-sm font-bold';
              } else if (popup.type === 'skill') {
                styleClasses = 'text-amber-200 bg-purple-950/95 border-amber-400 shadow-amber-500/80 text-sm font-black ring-2 ring-amber-400';
              } else if (popup.type === 'event') {
                styleClasses = 'text-amber-100 bg-slate-950/95 border-amber-400 shadow-amber-500/90 text-sm font-black ring-2 ring-amber-400';
              }

              return (
                <div
                  key={popup.id}
                  className={`absolute px-3 py-1.5 rounded-full font-black text-sm tracking-wide border shadow-xl backdrop-blur-sm animate-damage-float flex items-center gap-1.5 ${styleClasses}`}
                  style={{
                    left: popup.target === 'monster' ? '65%' : popup.target === 'player' ? '30%' : '50%',
                    top: '40%'
                  }}
                >
                  {popup.type === 'crit' && <Flame className="w-4 h-4 text-amber-400 fill-amber-400 animate-bounce" />}
                  {popup.type === 'block' && <Shield className="w-3.5 h-3.5 text-sky-400" />}
                  {popup.type === 'heal' && <Heart className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />}
                  {popup.type === 'dodge' && <Wind className="w-3.5 h-3.5 text-teal-300" />}
                  {popup.type === 'skill' && <Zap className="w-3.5 h-3.5 text-amber-300 animate-bounce" />}
                  {popup.type === 'event' && <CloudLightning className="w-3.5 h-3.5 text-amber-300 animate-pulse" />}
                  <span>{popup.text}</span>
                </div>
              );
            })}
          </div>

          {/* Monster Header */}
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <div
                className={`w-14 h-14 rounded-2xl bg-rose-950/60 border-2 border-rose-500 flex items-center justify-center text-3xl shadow-lg transition-transform ${
                  shakeTarget === 'monster' ? 'scale-110 rotate-6' : 'hover:scale-105'
                }`}
              >
                {monster.icon}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-black text-base text-rose-200">
                    {monster.name}
                  </h4>
                  {monster.isBoss && (
                    <span className="px-2 py-0.5 rounded text-[10px] bg-red-600 text-white font-black animate-pulse flex items-center gap-1 shadow-md shadow-red-900/50">
                      <Skull className="w-3 h-3" /> BOSS 領主
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400">
                  {monster.title} • {monster.specialAbility || '野性狂暴'}
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs font-mono text-rose-400 font-bold bg-slate-950/80 px-2.5 py-1 rounded-lg border border-rose-900/60">
                ⚔️ {monster.atk} 攻 • 🛡️ {monster.def} 防
              </div>
            </div>
          </div>

          {/* Monster HP Bar with dual color impact */}
          <div className="z-10">
            <div className="flex items-center justify-between text-xs font-mono text-slate-300 mb-1">
              <span className="flex items-center gap-1 font-bold text-rose-300">
                <span>👾</span>
                <span>敵方魔物生命</span>
              </span>
              <span className="font-black text-rose-400 text-sm">
                {Math.max(0, monster.currentHp)} / {monster.maxHp}
              </span>
            </div>
            <div className="w-full h-3.5 rounded-full bg-slate-950 border border-rose-900 overflow-hidden shadow-inner p-0.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 transition-all duration-150 shadow"
                style={{
                  width: `${Math.max(0, Math.min(100, (monster.currentHp / monster.maxHp) * 100))}%`
                }}
              />
            </div>
          </div>

          {/* Player Combat Indicators */}
          <div
            className={`grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px] bg-slate-950/80 rounded-xl p-2.5 border border-slate-800 z-10 transition-transform ${
              shakeTarget === 'player' ? 'animate-shake border-red-500 ring-1 ring-red-500' : ''
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Swords className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-400">斬擊：</span>
              <span className="font-bold text-amber-300">{player.totalAtk}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-sky-400" />
              <span className="text-slate-400">格擋：</span>
              <span className="font-bold text-sky-300">{player.totalDef}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Wind className="w-3.5 h-3.5 text-teal-400" />
              <span className="text-slate-400">閃避率：</span>
              <span className="font-bold text-teal-300">{player.dodgeRate || 0}%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
              <span className="text-slate-400">暴擊率：</span>
              <span className="font-bold text-yellow-300">{player.critChance}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Active Skill Runes Bar */}
      {activeSkills.length > 0 && (
        <ActiveSkillBar
          skills={activeSkills}
          onOpenRuneModal={onOpenRuneModal || (() => {})}
          activeCastRuneId={activeCastRuneId}
          compact={!isInCombat}
        />
      )}

      {/* Combat & Adventure Log Box */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-3 shadow-md flex flex-col h-[180px]">
        <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-800">
          <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
            📜 冒險紀事與戰鬥日誌
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            即時滾動
          </span>
        </div>

        <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-1.5 scrollbar-thin text-xs">
          {logs.slice(0, 30).map(entry => {
            let textColor = 'text-slate-300';
            let dotColor = 'bg-slate-500';

            if (entry.type === 'combat') {
              textColor = 'text-rose-300';
              dotColor = 'bg-rose-500';
            } else if (entry.type === 'loot') {
              textColor = 'text-amber-300';
              dotColor = 'bg-amber-400';
            } else if (entry.type === 'camp') {
              textColor = 'text-emerald-300';
              dotColor = 'bg-emerald-400';
            } else if (entry.type === 'buff') {
              textColor = 'text-sky-300';
              dotColor = 'bg-sky-400';
            } else if (entry.type === 'danger') {
              textColor = 'text-red-400 font-bold';
              dotColor = 'bg-red-500 animate-ping';
            }

            return (
              <div
                key={entry.id}
                className="flex items-start gap-2 py-0.5 animate-fadeIn"
              >
                <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${dotColor}`} />
                <span className={`flex-1 leading-relaxed ${textColor}`}>
                  {entry.text}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
