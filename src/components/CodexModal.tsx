import React, { useState, useMemo } from 'react';
import { ITEM_TEMPLATES } from '../data/items';
import { MONSTER_ARCHETYPES } from '../data/monsters';
import { PREFIX_AFFIXES, SUFFIX_AFFIXES, AFFIX_STAT_RANGES, AffixStatRange } from '../data/affixes';
import { ItemType, ItemRarity } from '../types/game';
import {
  BookOpen,
  X,
  Sparkles,
  Shield,
  Swords,
  Search,
  Heart,
  Zap,
  Wind,
  Coins,
  Wrench,
  HelpCircle,
  Filter,
  Flame,
  Award
} from 'lucide-react';

interface CodexModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CodexModal: React.FC<CodexModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'items' | 'affixes' | 'monsters'>('items');

  // Item filters
  const [itemSearch, setItemSearch] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedRarity, setSelectedRarity] = useState<string>('all');

  // Affix filters
  const [affixSearch, setAffixSearch] = useState<string>('');
  const [affixTab, setAffixTab] = useState<'all' | 'prefix' | 'suffix' | 'ranges'>('ranges');
  const [affixCategory, setAffixCategory] = useState<string>('all');

  // Filtered Items
  const filteredItems = useMemo(() => {
    return ITEM_TEMPLATES.filter(t => {
      if (selectedType !== 'all' && t.type !== selectedType) return false;
      if (selectedRarity !== 'all' && t.rarity !== selectedRarity) return false;
      if (itemSearch.trim()) {
        const q = itemSearch.toLowerCase();
        const matchName = t.name.toLowerCase().includes(q);
        const matchDesc = t.desc.toLowerCase().includes(q);
        const matchSyn = t.synergyDesc.toLowerCase().includes(q);
        const matchType = t.type.toLowerCase().includes(q);
        if (!matchName && !matchDesc && !matchSyn && !matchType) return false;
      }
      return true;
    });
  }, [itemSearch, selectedType, selectedRarity]);

  // Combined Affixes
  const allAffixes = useMemo(() => {
    return [...PREFIX_AFFIXES, ...SUFFIX_AFFIXES];
  }, []);

  // Filtered Affixes
  const filteredAffixes = useMemo(() => {
    return allAffixes.filter(a => {
      if (affixTab === 'prefix' && a.type !== 'prefix') return false;
      if (affixTab === 'suffix' && a.type !== 'suffix') return false;

      if (affixCategory !== 'all') {
        if (affixCategory === 'attack' && !a.bonusAtk && !a.bonusAtkPct && !a.bonusCrit) return false;
        if (affixCategory === 'defense' && !a.bonusDef && !a.bonusDefPct && !a.bonusDodge) return false;
        if (affixCategory === 'sustain' && !a.bonusHp && !a.bonusRegen && !a.bonusLifesteal) return false;
        if (affixCategory === 'utility' && !a.bonusLootFind && !a.bonusGoldPct) return false;
      }

      if (affixSearch.trim()) {
        const q = affixSearch.toLowerCase();
        return a.name.toLowerCase().includes(q) || a.description.toLowerCase().includes(q);
      }
      return true;
    });
  }, [allAffixes, affixTab, affixCategory, affixSearch]);

  // Filtered Ranges
  const filteredRanges = useMemo(() => {
    if (affixCategory === 'all') return AFFIX_STAT_RANGES;
    return AFFIX_STAT_RANGES.filter(r => r.category === affixCategory);
  }, [affixCategory]);

  if (!isOpen) return null;

  const getRarityBadge = (rarity: ItemRarity) => {
    if (rarity === 'legendary') {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/50">
          ⭐ 傳奇 (Legendary)
        </span>
      );
    }
    if (rarity === 'rare') {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/50">
          ✦ 稀有 (Rare)
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-600">
        普通 (Common)
      </span>
    );
  };

  const getItemTypeLabel = (type: ItemType) => {
    switch (type) {
      case 'weapon': return '⚔️ 武器';
      case 'shield': return '🛡️ 盾牌';
      case 'armor': return '🦺 防具';
      case 'accessory': return '💍 飾品';
      case 'potion': return '🧪 藥水';
      case 'tool': return '🧰 工匠工具';
      case 'relic': return '🏺 遠古遺物';
      case 'gem': return '💎 寶石結晶';
      default: return type;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[90vh] rounded-3xl bg-slate-900 border-2 border-slate-700 shadow-2xl p-6 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-amber-400" />
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                循環百科圖鑑：裝備與詞綴庫 (Equipment & Affix Codex)
              </h2>
              <p className="text-xs text-slate-400">
                收錄全境所有裝備模板幾何規格、連攜效能、隨機詞綴庫及精確數值上下限！
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex rounded-xl bg-slate-800/90 p-1 border border-slate-700">
              <button
                type="button"
                onClick={() => setActiveTab('items')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === 'items'
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                🎒 裝備模板 ({ITEM_TEMPLATES.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('affixes')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === 'affixes'
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                ✨ 詞綴與數值 ({allAffixes.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('monsters')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === 'monsters'
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                👾 怪物圖鑑 ({MONSTER_ARCHETYPES.length})
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab 1: Equipment Templates */}
        {activeTab === 'items' && (
          <div className="flex-1 overflow-hidden flex flex-col gap-3 pt-3">
            {/* Search and Filters Bar */}
            <div className="flex flex-wrap items-center gap-2 justify-between bg-slate-950/70 p-2.5 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                <Search className="w-4 h-4 text-slate-500 ml-1" />
                <input
                  type="text"
                  placeholder="搜尋裝備名稱、連攜條件、屬性或描述..."
                  value={itemSearch}
                  onChange={e => setItemSearch(e.target.value)}
                  className="bg-transparent border-none text-xs text-slate-100 placeholder-slate-500 focus:outline-none w-full"
                />
                {itemSearch && (
                  <button
                    type="button"
                    onClick={() => setItemSearch('')}
                    className="p-1 text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Type Chips */}
              <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5">
                {[
                  { id: 'all', label: '全部類型' },
                  { id: 'weapon', label: '⚔️ 武器' },
                  { id: 'shield', label: '🛡️ 盾牌' },
                  { id: 'armor', label: '🦺 防具' },
                  { id: 'accessory', label: '💍 飾品' },
                  { id: 'potion', label: '🧪 藥水' },
                  { id: 'tool', label: '🧰 工具' }
                ].map(chip => (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={() => setSelectedType(chip.id)}
                    className={`px-2 py-1 rounded-lg text-[11px] font-bold transition whitespace-nowrap ${
                      selectedType === chip.id
                        ? 'bg-amber-500 text-slate-950 shadow'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>

              {/* Rarity Chips */}
              <div className="flex items-center gap-1">
                {[
                  { id: 'all', label: '全部' },
                  { id: 'common', label: '⚪ 普通' },
                  { id: 'rare', label: '🟣 稀有' },
                  { id: 'legendary', label: '🟡 傳奇' }
                ].map(r => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setSelectedRarity(r.id)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold transition ${
                      selectedRarity === r.id
                        ? 'bg-amber-500 text-slate-950 shadow'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Items Grid */}
            <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin grid grid-cols-1 md:grid-cols-2 gap-3 pb-2">
              {filteredItems.map(t => (
                <div
                  key={t.id}
                  className="rounded-2xl bg-slate-950/70 border border-slate-800 p-3.5 flex flex-col gap-2.5 hover:border-slate-700 transition"
                >
                  {/* Top Bar: Icon, Name, Mini Shape Grid, Rarity */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl border flex-shrink-0"
                        style={{ backgroundColor: t.color, borderColor: t.borderColor }}
                      >
                        {t.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-bold text-sm text-slate-100">{t.name}</h4>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                            {getItemTypeLabel(t.type)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                          <span>佔用 {t.w}×{t.h} 格</span>
                          <span>•</span>
                          <span>耐久上限 {t.maxDurability || 35} 點</span>
                          {t.isRepairTool && (
                            <span className="text-amber-400 font-bold">• 修復 +{t.repairPower}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5">
                      {getRarityBadge(t.rarity)}
                      {/* Mini Geometric Shape Grid Visualizer */}
                      <div
                        className="grid gap-0.5 p-1 rounded-md bg-slate-900/90 border border-slate-800"
                        style={{ gridTemplateColumns: `repeat(${t.w}, minmax(0, 1fr))` }}
                        title={`幾何陣列形狀: ${t.w}×${t.h}`}
                      >
                        {t.shape.map((row, r) =>
                          row.map((cell, c) => (
                            <div
                              key={`${r}-${c}`}
                              className={`w-3 h-3 rounded-[2px] transition ${
                                cell === 1 ? 'shadow-sm' : 'opacity-15 bg-slate-800'
                              }`}
                              style={cell === 1 ? { backgroundColor: t.borderColor || '#f59e0b' } : undefined}
                            />
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Base Stats Pills */}
                  <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
                    {t.baseAtk > 0 && (
                      <span className="px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800/60 font-bold">
                        ⚔️ 基礎攻擊 +{t.baseAtk}
                      </span>
                    )}
                    {t.baseDef > 0 && (
                      <span className="px-2 py-0.5 rounded bg-sky-950/60 text-sky-300 border border-sky-800/60 font-bold">
                        🛡️ 基礎護甲 +{t.baseDef}
                      </span>
                    )}
                    {t.baseMaxHp && t.baseMaxHp > 0 && (
                      <span className="px-2 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-800/60 font-bold">
                        ❤️ 生命上限 +{t.baseMaxHp}
                      </span>
                    )}
                    {t.critChance && t.critChance > 0 && (
                      <span className="px-2 py-0.5 rounded bg-yellow-950/60 text-yellow-300 border border-yellow-800/60 font-bold">
                        ⚡ 暴擊率 +{t.critChance}%
                      </span>
                    )}
                    {t.lifesteal && t.lifesteal > 0 && (
                      <span className="px-2 py-0.5 rounded bg-red-950/60 text-red-300 border border-red-800/60 font-bold">
                        🩸 吸血率 +{t.lifesteal}%
                      </span>
                    )}
                    {t.stepRegen && t.stepRegen > 0 && (
                      <span className="px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 font-bold">
                        🌿 步履回復 +{t.stepRegen}/步
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {t.desc}
                  </p>

                  {/* Synergy Card */}
                  <div className="mt-auto pt-2 border-t border-slate-800/80 text-[11px] text-amber-300/95 flex items-start gap-1.5 bg-amber-950/20 p-2 rounded-xl border border-amber-900/30">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <span>{t.synergyDesc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Affixes and Numerical Value Ranges Compendium */}
        {activeTab === 'affixes' && (
          <div className="flex-1 overflow-hidden flex flex-col gap-3 pt-3">
            {/* Affix Subtabs and Category Filters */}
            <div className="flex flex-wrap items-center gap-2 justify-between bg-slate-950/70 p-2.5 rounded-2xl border border-slate-800">
              <div className="flex rounded-lg bg-slate-900 p-0.5 border border-slate-800">
                <button
                  type="button"
                  onClick={() => setAffixTab('ranges')}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition ${
                    affixTab === 'ranges'
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  📊 數值範圍總覽 ({AFFIX_STAT_RANGES.length})
                </button>
                <button
                  type="button"
                  onClick={() => setAffixTab('all')}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition ${
                    affixTab === 'all'
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  ✨ 全部詞綴 ({allAffixes.length})
                </button>
                <button
                  type="button"
                  onClick={() => setAffixTab('prefix')}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition ${
                    affixTab === 'prefix'
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  🔹 前綴詞庫 ({PREFIX_AFFIXES.length})
                </button>
                <button
                  type="button"
                  onClick={() => setAffixTab('suffix')}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition ${
                    affixTab === 'suffix'
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  🔸 後綴詞庫 ({SUFFIX_AFFIXES.length})
                </button>
              </div>

              {/* Category Filter Chips */}
              <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
                {[
                  { id: 'all', label: '全部屬性' },
                  { id: 'attack', label: '⚔️ 攻擊向' },
                  { id: 'defense', label: '🛡️ 防禦閃避' },
                  { id: 'sustain', label: '🌿 生存回復' },
                  { id: 'utility', label: '🧲 尋寶金幣' }
                ].map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setAffixCategory(c.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                      affixCategory === c.id
                        ? 'bg-amber-500 text-slate-950 shadow'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Mechanics Explanation Banner */}
            <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-950/40 via-purple-950/30 to-slate-900 border border-amber-900/40 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-xs border border-slate-700">⚪</span>
                <div>
                  <div className="font-bold text-slate-200 text-[11px]">普通裝備 (Common)</div>
                  <div className="text-[10px] text-slate-400">100% 賦予 1 個隨機前綴</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-purple-900 text-purple-200 flex items-center justify-center font-bold text-xs border border-purple-700">🟣</span>
                <div>
                  <div className="font-bold text-purple-200 text-[11px]">稀有裝備 (Rare)</div>
                  <div className="text-[10px] text-slate-400">1 前綴 + 50% 機率額外後綴</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-amber-600 text-amber-100 flex items-center justify-center font-bold text-xs border border-amber-500">🟡</span>
                <div>
                  <div className="font-bold text-amber-200 text-[11px]">傳奇裝備 (Legendary)</div>
                  <div className="text-[10px] text-slate-400">100% 雙詞綴（前綴 + 後綴極品）</div>
                </div>
              </div>
            </div>

            {/* Content Display: Numerical Ranges Table or Affix Lists */}
            <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin">
              {affixTab === 'ranges' ? (
                <div className="flex flex-col gap-3 pb-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {filteredRanges.map(stat => (
                      <div
                        key={stat.statKey}
                        className="rounded-2xl bg-slate-950/70 border border-slate-800 p-3.5 flex flex-col gap-2 hover:border-slate-700 transition"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{stat.icon}</span>
                            <div>
                              <h4 className="font-bold text-xs text-slate-200">{stat.name}</h4>
                              <span className="text-[10px] text-slate-500 font-mono">鍵值: {stat.statKey}</span>
                            </div>
                          </div>

                          <div className="px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-mono font-bold">
                            數值範圍: {stat.rangeText}
                          </div>
                        </div>

                        <p className="text-xs text-slate-400 leading-relaxed">
                          {stat.explanation}
                        </p>

                        <div className="pt-2 border-t border-slate-800/80 flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] text-slate-500 font-bold">代表性詞綴：</span>
                          {stat.exampleAffixes.map((ex, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-800 text-[10px] text-slate-300 font-mono"
                            >
                              {ex}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2 pb-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {filteredAffixes.map(a => (
                      <div
                        key={a.id}
                        className={`p-3 rounded-2xl border transition flex flex-col gap-1.5 ${
                          a.type === 'prefix'
                            ? 'bg-amber-950/20 border-amber-900/40 hover:border-amber-700/60'
                            : 'bg-purple-950/20 border-purple-900/40 hover:border-purple-700/60'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                a.type === 'prefix'
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                  : 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                              }`}
                            >
                              {a.type === 'prefix' ? '🔹 前綴 (Prefix)' : '🔸 後綴 (Suffix)'}
                            </span>
                            <h4 className="font-bold text-xs text-slate-100">【{a.name}】</h4>
                          </div>
                          <span className="text-xs font-mono font-bold text-slate-300">{a.description}</span>
                        </div>

                        {/* Breakdown of affected stats */}
                        <div className="flex flex-wrap items-center gap-1 pt-1 text-[10px] font-mono">
                          {a.bonusAtk && <span className="text-amber-400">+{a.bonusAtk} 實體攻擊</span>}
                          {a.bonusAtkPct && <span className="text-amber-400">+{a.bonusAtkPct}% 攻擊</span>}
                          {a.bonusDef && <span className="text-sky-400">+{a.bonusDef} 護甲</span>}
                          {a.bonusDefPct && <span className="text-sky-400">+{a.bonusDefPct}% 護甲</span>}
                          {a.bonusCrit && <span className="text-yellow-400">+{a.bonusCrit}% 暴擊率</span>}
                          {a.bonusDodge && <span className="text-teal-400">+{a.bonusDodge}% 閃避率</span>}
                          {a.bonusLifesteal && <span className="text-rose-400">+{a.bonusLifesteal}% 吸血</span>}
                          {a.bonusHp && <span className="text-red-400">+{a.bonusHp} 生命上限</span>}
                          {a.bonusRegen && <span className="text-emerald-400">+{a.bonusRegen} 步履回復</span>}
                          {a.bonusLootFind && <span className="text-violet-400">+{a.bonusLootFind}% 尋寶範圍</span>}
                          {a.bonusGoldPct && <span className="text-amber-300">+{a.bonusGoldPct}% 額外金幣</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Monster Archetypes */}
        {activeTab === 'monsters' && (
          <div className="flex-1 overflow-y-auto pt-3 pr-1 scrollbar-thin">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pb-2">
              {MONSTER_ARCHETYPES.map(m => (
                <div
                  key={m.id}
                  className="rounded-2xl bg-slate-950/60 border border-slate-800 p-3.5 flex flex-col gap-2 hover:border-slate-700 transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-3xl filter drop-shadow">{m.icon}</span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-sm text-slate-100">{m.name}</h4>
                          {m.isBoss && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] bg-rose-600 text-white font-bold">
                              BOSS
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400">{m.title}</p>
                      </div>
                    </div>

                    <div className="text-right text-xs font-mono">
                      <div className="text-rose-400 font-bold">基礎 HP: {m.baseHp}</div>
                      <div className="text-amber-400">攻擊: {m.baseAtk}</div>
                    </div>
                  </div>

                  {m.specialAbility && (
                    <div className="mt-1 text-xs text-rose-300/90 bg-rose-950/30 border border-rose-900/40 rounded-lg p-2">
                      ⚠️ {m.specialAbility}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

