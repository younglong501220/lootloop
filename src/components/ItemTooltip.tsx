import React from 'react';
import { PlacedItemInstance, InventoryItem } from '../types/game';

interface ItemTooltipProps {
  item: PlacedItemInstance | InventoryItem | null;
  position: { x: number; y: number } | null;
}

const RARITY_COLORS: Record<string, { text: string; bg: string; border: string }> = {
  common: { text: 'text-zinc-300', bg: 'bg-zinc-800/80', border: 'border-zinc-600' },
  rare: { text: 'text-purple-400', bg: 'bg-purple-950/80', border: 'border-purple-600' },
  legendary: { text: 'text-amber-400', bg: 'bg-amber-950/80', border: 'border-amber-600' }
};

const RARITY_NAMES: Record<string, string> = {
  common: '普通',
  rare: '稀有',
  legendary: '傳說'
};

const TYPE_NAMES: Record<string, string> = {
  weapon: '武器',
  shield: '盾牌',
  accessory: '飾品',
  potion: '藥劑',
  armor: '護甲',
  relic: '聖物',
  gem: '寶石'
};

export const ItemTooltip: React.FC<ItemTooltipProps> = ({ item, position }) => {
  if (!item || !position) return null;

  const rarityStyle = RARITY_COLORS[item.rarity] || RARITY_COLORS.common;
  const rarityName = RARITY_NAMES[item.rarity] || '普通';
  const typeName = TYPE_NAMES[item.type] || item.type;

  // Window bounds check for tooltip placement
  const x = Math.min(position.x + 14, window.innerWidth - 300);
  const y = Math.min(position.y + 14, window.innerHeight - 380);

  return (
    <div
      className="fixed pointer-events-none z-50 w-80 rounded-2xl bg-slate-900/95 backdrop-blur-md border border-slate-700/80 shadow-2xl shadow-black/80 p-3.5 transition-opacity duration-150 text-xs text-slate-200"
      style={{ left: `${x}px`, top: `${y}px` }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl filter drop-shadow">{item.icon}</span>
          <div>
            <h4 className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
              {item.name}
              {item.isSynergyActive && (
                <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              )}
            </h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${rarityStyle.bg} ${rarityStyle.text} ${rarityStyle.border}`}>
                {rarityName}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {typeName} • {item.w}×{item.h}格
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Affixes Section */}
      {item.affixes && item.affixes.length > 0 && (
        <div className="mb-2.5 p-2 rounded-xl bg-purple-950/40 border border-purple-500/50 flex flex-col gap-1.5 shadow-inner">
          <div className="text-[10px] font-black text-purple-300 uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1">✨ 隨機裝備詞綴 ({item.affixes.length})</span>
            <span className="text-[9px] text-purple-400 font-mono">生效中</span>
          </div>
          {item.affixes.map(af => (
            <div key={af.id} className="text-[11px] flex items-center justify-between gap-1.5 bg-slate-950/70 border border-purple-900/40 rounded px-2 py-1">
              <span className="text-amber-300 font-bold">【{af.name}】</span>
              <span className="text-emerald-300 font-mono font-semibold">{af.description}</span>
            </div>
          ))}
        </div>
      )}

      {/* Primary Stats */}
      <div className="grid grid-cols-2 gap-1.5 mb-2.5">
        {item.baseAtk > 0 && (
          <div className="bg-slate-800/60 rounded px-2 py-1 flex items-center justify-between">
            <span className="text-slate-400">⚔️ 攻擊力</span>
            <span className="font-bold text-amber-400">
              {item.baseAtk}
              {item.bonusAtk > 0 && <span className="text-amber-300 ml-1">(+{item.bonusAtk})</span>}
            </span>
          </div>
        )}

        {item.baseDef > 0 && (
          <div className="bg-slate-800/60 rounded px-2 py-1 flex items-center justify-between">
            <span className="text-slate-400">🛡️ 護甲值</span>
            <span className="font-bold text-sky-400">
              {item.baseDef}
              {item.bonusDef > 0 && <span className="text-sky-300 ml-1">(+{item.bonusDef})</span>}
            </span>
          </div>
        )}

        {(item.baseMaxHp > 0 || (item.bonusHp && item.bonusHp > 0)) && (
          <div className="bg-slate-800/60 rounded px-2 py-1 flex items-center justify-between">
            <span className="text-slate-400">❤️ 生命上限</span>
            <span className="font-bold text-rose-400">
              +{item.baseMaxHp + (item.bonusHp || 0)}
            </span>
          </div>
        )}

        {(item.stepRegen > 0 || (item.bonusRegen && item.bonusRegen > 0)) && (
          <div className="bg-slate-800/60 rounded px-2 py-1 flex items-center justify-between">
            <span className="text-slate-400">🧪 每步回復</span>
            <span className="font-bold text-emerald-400">
              +{item.stepRegen + (item.bonusRegen || 0)} HP
            </span>
          </div>
        )}

        {((item.lifesteal && item.lifesteal > 0) || (item.bonusLifesteal && item.bonusLifesteal > 0)) && (
          <div className="bg-slate-800/60 rounded px-2 py-1 flex items-center justify-between">
            <span className="text-slate-400">🩸 吸血率</span>
            <span className="font-bold text-red-400">
              +{item.lifesteal + (item.bonusLifesteal || 0)}%
            </span>
          </div>
        )}

        {((item.critChance && item.critChance > 0) || (item.bonusCrit && item.bonusCrit > 0)) && (
          <div className="bg-slate-800/60 rounded px-2 py-1 flex items-center justify-between">
            <span className="text-slate-400">⚡ 暴擊率</span>
            <span className="font-bold text-yellow-300">
              +{item.critChance + (item.bonusCrit || 0)}%
            </span>
          </div>
        )}

        {item.bonusDodge !== undefined && item.bonusDodge > 0 && (
          <div className="bg-slate-800/60 rounded px-2 py-1 flex items-center justify-between">
            <span className="text-slate-400">💨 閃避率</span>
            <span className="font-bold text-teal-300">
              +{item.bonusDodge}%
            </span>
          </div>
        )}

        {item.bonusLootFind !== undefined && item.bonusLootFind > 0 && (
          <div className="bg-slate-800/60 rounded px-2 py-1 flex items-center justify-between">
            <span className="text-slate-400">🧲 拾取尋寶</span>
            <span className="font-bold text-amber-300">
              +{item.bonusLootFind}%
            </span>
          </div>
        )}
      </div>

      {/* Durability Condition */}
      {item.maxDurability !== undefined && item.type !== 'potion' && item.type !== 'gem' && (
        <div className="mb-2.5 p-2 rounded-xl bg-slate-950/80 border border-slate-800">
          <div className="flex items-center justify-between text-[11px] font-mono mb-1">
            <span className="text-slate-400 flex items-center gap-1">
              <span>🔨</span>
              <span>裝備耐久度</span>
            </span>
            <span className={`font-bold ${item.isBroken ? 'text-red-400 animate-pulse' : item.currentDurability < 15 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {item.currentDurability} / {item.maxDurability}
              {item.isBroken && ' (已損壞!)'}
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div
              className={`h-full ${item.isBroken ? 'bg-red-600' : item.currentDurability / item.maxDurability > 0.4 ? 'bg-emerald-400' : 'bg-amber-400'} transition-all`}
              style={{ width: `${Math.max(0, Math.min(100, (item.currentDurability / item.maxDurability) * 100))}%` }}
            />
          </div>
          {item.isBroken && (
            <div className="mt-1.5 text-[10px] text-red-300 font-semibold bg-red-950/60 rounded px-1.5 py-0.5 border border-red-800 flex items-center gap-1">
              <span>⚠️ 耐久耗盡！攻擊與護甲效果減半，急需修理！</span>
            </div>
          )}
        </div>
      )}

      {/* Description */}
      <p className="text-slate-300 text-[11px] leading-relaxed mb-2.5">
        {item.desc}
      </p>

      {/* Synergy Detail */}
      <div className={`p-2 rounded-lg border text-[11px] ${
        item.isSynergyActive
          ? 'bg-amber-950/40 border-amber-500/60 text-amber-200'
          : 'bg-slate-800/50 border-slate-700/60 text-slate-400'
      }`}>
        <div className="flex items-center gap-1.5 font-bold mb-1">
          <span>🔗</span>
          <span>相鄰連鎖協同：</span>
          {item.isSynergyActive ? (
            <span className="ml-auto px-1.5 py-0.2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded text-[10px]">
              已啟動 ✨
            </span>
          ) : (
            <span className="ml-auto text-[10px] text-slate-500">未激活</span>
          )}
        </div>
        <p className="text-slate-300 leading-snug">{item.synergyDesc}</p>
        {item.synergyDetail && (
          <div className="mt-1.5 pt-1.5 border-t border-amber-500/20 text-emerald-400 font-semibold flex items-center gap-1">
            <span>✨</span>
            <span>{item.synergyDetail}</span>
          </div>
        )}
      </div>
    </div>
  );
};
