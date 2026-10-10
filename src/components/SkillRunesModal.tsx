import React from 'react';
import { SkillRune } from '../types/game';
import { SKILL_RUNES } from '../data/skills';
import { X, Zap, Shield, Flame, Leaf, Eye, CheckCircle2, Clock } from 'lucide-react';

interface SkillRunesModalProps {
  isOpen: boolean;
  onClose: () => void;
  equippedRuneIds: string[];
  onEquipRune: (runeId: string, slotIndex: number) => void;
}

export const SkillRunesModal: React.FC<SkillRunesModalProps> = ({
  isOpen,
  onClose,
  equippedRuneIds,
  onEquipRune
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                主動技能符文庫 (Skill Runes)
              </h2>
              <p className="text-xs text-slate-400">
                可裝備 2 個符文技能，進入戰鬥後將依冷卻時間自動施放強大特技
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Currently Equipped Slots */}
        <div className="my-4 p-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl">
          <h3 className="text-xs font-bold text-amber-300 mb-2.5 flex items-center gap-1.5">
            <span>⚔️ 當前戰鬥裝備槽位 (Active Slots)</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[0, 1].map((slotIdx) => {
              const runeId = equippedRuneIds[slotIdx];
              const rune = SKILL_RUNES.find((r) => r.id === runeId);
              return (
                <div
                  key={slotIdx}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between shadow-inner"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                      槽位 {slotIdx + 1}
                    </span>
                    {rune ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{rune.icon}</span>
                        <div>
                          <p className="text-xs font-black text-white">{rune.name}</p>
                          <p className="text-[10px] text-amber-400 font-mono">
                            CD: {rune.cooldownMax}s
                          </p>
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-500 italic">未裝備符文</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* All Available Runes */}
        <div className="overflow-y-auto space-y-3 pr-1 flex-1">
          <h3 className="text-xs font-bold text-slate-300">所有可用技能符文</h3>
          {SKILL_RUNES.map((rune) => {
            const isEquippedSlot1 = equippedRuneIds[0] === rune.id;
            const isEquippedSlot2 = equippedRuneIds[1] === rune.id;
            const isEquipped = isEquippedSlot1 || isEquippedSlot2;

            return (
              <div
                key={rune.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isEquipped
                    ? 'bg-slate-900/90 border-amber-500/60 shadow-lg shadow-amber-950/20'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center text-2xl shrink-0 shadow">
                      {rune.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-black text-sm text-white">{rune.name}</h4>
                        <span className="text-[11px] font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          {rune.title}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {rune.cooldownMax} 秒
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        {rune.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                    <button
                      onClick={() => onEquipRune(rune.id, 0)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                        isEquippedSlot1
                          ? 'bg-amber-500 text-slate-950 border-amber-400 font-black'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                      }`}
                    >
                      {isEquippedSlot1 ? '已裝備槽位 1' : '裝備槽 1'}
                    </button>
                    <button
                      onClick={() => onEquipRune(rune.id, 1)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                        isEquippedSlot2
                          ? 'bg-amber-500 text-slate-950 border-amber-400 font-black'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                      }`}
                    >
                      {isEquippedSlot2 ? '已裝備槽位 2' : '裝備槽 2'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-4 mt-2 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 transition active:scale-95"
          >
            完成配置並返回
          </button>
        </div>
      </div>
    </div>
  );
};
