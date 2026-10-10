import React, { useState, useEffect } from 'react';
import { CombatRecord, InventoryItem } from '../types/game';
import { Play, Pause, RotateCcw, FastForward, Swords, Shield, Heart, Skull, Trophy, X, ChevronRight, Gift, Sparkles, Coins } from 'lucide-react';

interface CombatReplayModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: CombatRecord[];
}

export const CombatReplayModal: React.FC<CombatReplayModalProps> = ({
  isOpen,
  onClose,
  records
}) => {
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);

  // Set default selected record
  useEffect(() => {
    if (records.length > 0 && !selectedRecordId) {
      setSelectedRecordId(records[0].id);
      setCurrentStep(0);
      setIsPlaying(false);
    }
  }, [records, selectedRecordId]);

  const activeRecord = records.find(r => r.id === selectedRecordId) || records[0];

  // Auto-play timer
  useEffect(() => {
    if (!isPlaying || !activeRecord) return;

    const intervalMs = playbackSpeed === 3 ? 250 : playbackSpeed === 2 ? 500 : 900;
    const timer = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= activeRecord.actions.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, activeRecord, playbackSpeed]);

  if (!isOpen) return null;

  if (!activeRecord || records.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
        <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border-2 border-slate-700 p-6 text-center">
          <div className="text-4xl mb-3">⚔️</div>
          <h3 className="text-base font-bold text-slate-100 mb-1">暫無戰鬥紀錄</h3>
          <p className="text-xs text-slate-400 mb-4">
            在循環軌道上進行至少一次魔物戰鬥後，即可在此觀看詳盡的回合制戰鬥回放與戰利品掉落清單！
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold"
          >
            關閉
          </button>
        </div>
      </div>
    );
  }

  const currentAction = activeRecord.actions[currentStep] || activeRecord.actions[0];
  const totalSteps = activeRecord.actions.length;
  const droppedItems: InventoryItem[] = activeRecord.droppedItems || [];

  const getRarityBadge = (rarity: string) => {
    if (rarity === 'legendary') {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/50 flex items-center gap-1 shadow-sm">
          ⭐ 傳奇 (Legendary)
        </span>
      );
    }
    if (rarity === 'rare') {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/50 flex items-center gap-1 shadow-sm">
          ✦ 稀有 (Rare)
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-600 flex items-center gap-1">
        普通 (Common)
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-5xl max-h-[92vh] rounded-3xl bg-slate-900 border-2 border-slate-700 shadow-2xl p-6 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Swords className="w-6 h-6 text-rose-400" />
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                戰術戰鬥回放與掉落清單 (Combat Replay & Loot)
              </h2>
              <p className="text-xs text-slate-400">
                重溫關鍵戰鬥細節，審視攻擊暴擊、護甲吸收與擊敗掉落的裝備稀有度與隨機詞綴！
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

        {/* Main duel view + Record selector */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12 gap-4 my-3">
          {/* Left: Combat History List */}
          <div className="md:col-span-4 bg-slate-950/70 border border-slate-800 rounded-2xl p-3 flex flex-col gap-2 overflow-y-auto scrollbar-thin max-h-[580px]">
            <span className="text-xs font-bold text-slate-300 px-1">最近交鋒記錄</span>
            {records.map(rec => (
              <button
                key={rec.id}
                type="button"
                onClick={() => {
                  setSelectedRecordId(rec.id);
                  setCurrentStep(0);
                  setIsPlaying(false);
                }}
                className={`text-left p-2.5 rounded-xl border transition flex items-center justify-between ${
                  rec.id === activeRecord.id
                    ? 'bg-rose-950/40 border-rose-500/70 text-slate-100 shadow'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{rec.monsterIcon}</span>
                  <div>
                    <h5 className="font-bold text-xs flex items-center gap-1 text-slate-200">
                      {rec.monsterName}
                      {rec.isBoss && (
                        <span className="text-[9px] px-1 bg-red-600 text-white rounded">
                          BOSS
                        </span>
                      )}
                    </h5>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-slate-500 font-mono">
                        第 {rec.loop} 圈 • {rec.totalRounds} 回合
                      </span>
                      <span className="text-[9px] font-bold text-amber-400 flex items-center gap-0.5">
                        <Gift className="w-2.5 h-2.5" />
                        {rec.droppedItems?.length ?? rec.lootCount} 掉落
                      </span>
                    </div>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-slate-600" />
              </button>
            ))}
          </div>

          {/* Right: Active Replay Stage + Dropped Items */}
          <div className="md:col-span-8 bg-slate-950/90 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3 overflow-y-auto max-h-[580px] scrollbar-thin">
            {/* Duel Health Status */}
            <div className="grid grid-cols-2 gap-4 pb-3 border-b border-slate-800">
              {/* Player side */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-slate-200">🧙‍♂️ 勇者</span>
                  <span className="text-emerald-400 font-bold">
                    {currentAction ? currentAction.playerHpAfter : 100} HP
                  </span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-900 border border-emerald-950 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-200"
                    style={{
                      width: `${Math.max(0, Math.min(100, (currentAction ? currentAction.playerHpAfter : 100)))}%`
                    }}
                  />
                </div>
              </div>

              {/* Monster side */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-rose-300">
                    {activeRecord.monsterIcon} {activeRecord.monsterName}
                  </span>
                  <span className="text-rose-400 font-bold">
                    {currentAction ? currentAction.monsterHpAfter : activeRecord.monsterMaxHp} HP
                  </span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-900 border border-rose-950 overflow-hidden">
                  <div
                    className="h-full bg-rose-500 transition-all duration-200"
                    style={{
                      width: `${Math.max(
                        0,
                        Math.min(
                          100,
                          ((currentAction ? currentAction.monsterHpAfter : activeRecord.monsterMaxHp) /
                            activeRecord.monsterMaxHp) *
                            100
                        )
                      )}%`
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Current Step Spotlight Card */}
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col items-center justify-center text-center min-h-[75px]">
              <span className="text-[11px] font-mono text-slate-400 mb-1">
                第 {currentAction ? currentAction.round : 1} 回合交鋒行動
              </span>
              <p className="text-sm font-bold text-slate-100 flex items-center gap-2">
                {currentAction ? currentAction.description : '準備開戰...'}
              </p>
            </div>

            {/* Replay Controls Bar */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentStep(0);
                    setIsPlaying(true);
                  }}
                  className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition"
                  title="重頭播放"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setIsPlaying(prev => !prev)}
                  className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 transition active:scale-95 shadow"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{isPlaying ? '暫停' : '播放'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPlaybackSpeed(prev => (prev === 1 ? 2 : prev === 2 ? 3 : 1))}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-mono font-bold hover:text-white transition flex items-center gap-1"
                >
                  <FastForward className="w-3.5 h-3.5" />
                  <span>{playbackSpeed}x</span>
                </button>
              </div>

              {/* Step indicator */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentStep === 0}
                  onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                  className="px-2 py-1 rounded bg-slate-800 text-xs text-slate-400 disabled:opacity-30"
                >
                  上一步
                </button>
                <span className="text-xs font-mono text-slate-400">
                  {currentStep + 1} / {totalSteps}
                </span>
                <button
                  type="button"
                  disabled={currentStep >= totalSteps - 1}
                  onClick={() => setCurrentStep(prev => Math.min(totalSteps - 1, prev + 1))}
                  className="px-2 py-1 rounded bg-slate-800 text-xs text-slate-400 disabled:opacity-30"
                >
                  下一步
                </button>
              </div>
            </div>

            {/* Dropped Items & Affixes Breakdown Section */}
            <div className="flex flex-col gap-2 pt-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Gift className="w-4 h-4 text-amber-400" />
                  <h4 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                    <span>擊敗掉落物品清單 (Loot Drops)</span>
                    <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px]">
                      {droppedItems.length > 0 ? `${droppedItems.length} 件裝備` : `${activeRecord.lootCount || 0} 件掉落`}
                    </span>
                  </h4>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-amber-400 font-mono font-bold bg-amber-950/40 px-2 py-0.5 rounded-lg border border-amber-900/50">
                  <Coins className="w-3.5 h-3.5" />
                  <span>+{activeRecord.goldEarned} 金幣</span>
                </div>
              </div>

              {droppedItems.length > 0 ? (
                <div className="flex flex-col gap-2.5">
                  {droppedItems.map((item, idx) => (
                    <div
                      key={item.instanceId || idx}
                      className={`p-3 rounded-xl border flex flex-col gap-2 transition ${
                        item.rarity === 'legendary'
                          ? 'bg-gradient-to-br from-amber-950/40 via-slate-900/80 to-slate-950 border-amber-500/60 shadow-lg shadow-amber-950/20'
                          : item.rarity === 'rare'
                          ? 'bg-gradient-to-br from-purple-950/40 via-slate-900/80 to-slate-950 border-purple-500/60 shadow-lg shadow-purple-950/20'
                          : 'bg-slate-900/70 border-slate-700/80'
                      }`}
                    >
                      {/* Top line: icon, name, dimensions & rarity badge */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl border flex-shrink-0"
                            style={{ backgroundColor: item.color, borderColor: item.borderColor }}
                          >
                            {item.icon}
                          </div>
                          <div>
                            <h5 className="font-bold text-xs text-slate-100 flex items-center gap-1.5 flex-wrap">
                              <span>{item.name}</span>
                              <span className="text-[10px] text-slate-400 font-mono">({item.w}×{item.h} 格)</span>
                            </h5>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                              <span className="capitalize">{item.type}</span>
                              <span>•</span>
                              <span>耐久度 {item.maxDurability || 35}/{item.maxDurability || 35}</span>
                              {item.isRepairTool && (
                                <span className="text-amber-400 font-bold">• 🧰 修復力 +{item.repairPower}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        {getRarityBadge(item.rarity)}
                      </div>

                      {/* Base Stats Pills */}
                      <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono">
                        {item.baseAtk > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800/50">
                            ⚔️ 基礎攻擊 +{item.baseAtk}
                          </span>
                        )}
                        {item.baseDef > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-sky-950/60 text-sky-300 border border-sky-800/50">
                            🛡️ 基礎防禦 +{item.baseDef}
                          </span>
                        )}
                        {item.baseMaxHp > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-800/50">
                            ❤️ 生命上限 +{item.baseMaxHp}
                          </span>
                        )}
                        {item.critChance > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-yellow-950/60 text-yellow-300 border border-yellow-800/50">
                            ⚡ 暴擊率 +{item.critChance}%
                          </span>
                        )}
                        {item.lifesteal > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-red-950/60 text-red-300 border border-red-800/50">
                            🩸 吸血率 +{item.lifesteal}%
                          </span>
                        )}
                        {item.stepRegen > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/50">
                            🌿 步履回復 +{item.stepRegen}/步
                          </span>
                        )}
                      </div>

                      {/* Random Affixes List */}
                      <div className="pt-1.5 border-t border-slate-800/80 flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-400" />
                          隨機詞綴加持 ({item.affixes && item.affixes.length > 0 ? item.affixes.length : 0})：
                        </span>
                        {item.affixes && item.affixes.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                            {item.affixes.map((affix, aIdx) => (
                              <div
                                key={aIdx}
                                className={`px-2 py-1 rounded-lg text-[10px] border flex items-center justify-between ${
                                  affix.type === 'prefix'
                                    ? 'bg-amber-950/40 border-amber-800/60 text-amber-200'
                                    : 'bg-purple-950/40 border-purple-800/60 text-purple-200'
                                }`}
                              >
                                <span className="font-bold">
                                  {affix.type === 'prefix' ? '🔹 前綴' : '🔸 後綴'} 【{affix.name}】
                                </span>
                                <span className="text-[10px] font-mono opacity-90">{affix.description}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-[10px] text-slate-500 italic bg-slate-950/40 px-2 py-1 rounded">
                            {item.isRepairTool ? '🧰 特殊工匠工具（純功能道具，無隨機詞綴）' : '基礎裝備，無隨機詞綴'}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-center text-xs text-slate-400">
                  <p>🎁 本次戰鬥主要獎勵為 {activeRecord.goldEarned} 金幣，無額外裝備掉落。</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

