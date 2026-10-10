import React, { useState } from 'react';
import { InventoryItem, PlayerStats } from '../types/game';
import { soundFX } from '../utils/audio';
import { ShoppingBag, Coins, Sparkles, Heart, Maximize2, RotateCcw, X, Check, Wrench } from 'lucide-react';

interface MerchantModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: PlayerStats;
  goods: InventoryItem[];
  onBuyItem: (item: InventoryItem, price: number) => boolean;
  onExpandBackpack: (newSize: number, cost: number) => boolean;
  onHealFull: (cost: number) => boolean;
  onRepairAllGear?: (cost: number) => boolean;
  onRerollGoods: (cost: number) => void;
}

export const MerchantModal: React.FC<MerchantModalProps> = ({
  isOpen,
  onClose,
  player,
  goods,
  onBuyItem,
  onExpandBackpack,
  onHealFull,
  onRepairAllGear,
  onRerollGoods
}) => {
  const [purchasedIds, setPurchasedIds] = useState<string[]>([]);

  if (!isOpen) return null;

  const currentSize = player.backpackGridSize || 5;
  const nextSize = currentSize + 1;
  const expandCost = currentSize === 5 ? 110 : currentSize === 6 ? 240 : 0;
  const canExpand = currentSize < 7;
  const healCost = 25;
  const repairAllCost = 25;
  const rerollCost = 15;

  const handleRepairAll = () => {
    if (player.gold < repairAllCost || !onRepairAllGear) {
      soundFX.playHit();
      return;
    }
    const success = onRepairAllGear(repairAllCost);
    if (success) {
      soundFX.playBlock();
    }
  };

  const handleBuy = (item: InventoryItem) => {
    const price = item.price || 40;
    if (player.gold < price) {
      soundFX.playHit();
      return;
    }
    const success = onBuyItem(item, price);
    if (success) {
      soundFX.playChest();
      setPurchasedIds(prev => [...prev, item.instanceId]);
    }
  };

  const handleExpand = () => {
    if (!canExpand || player.gold < expandCost) {
      soundFX.playHit();
      return;
    }
    const success = onExpandBackpack(nextSize, expandCost);
    if (success) {
      soundFX.playLoopComplete();
    }
  };

  const handleHeal = () => {
    if (player.gold < healCost || player.hp >= player.maxHp) {
      soundFX.playHit();
      return;
    }
    const success = onHealFull(healCost);
    if (success) {
      soundFX.playHeal();
    }
  };

  const handleReroll = () => {
    if (player.gold < rerollCost) {
      soundFX.playHit();
      return;
    }
    soundFX.playChest();
    onRerollGoods(rerollCost);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl max-h-[90vh] rounded-3xl bg-slate-900 border-2 border-amber-500/70 shadow-2xl p-6 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/20">
              🧙‍♂️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-amber-300 font-serif">
                  流浪行商 • 秘境黑市
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  第 {player.loop} 圈特選商品
                </span>
              </div>
              <p className="text-xs text-slate-400">
                「在無盡的軌道漫步累了吧？看看我從古代遺跡帶來的神兵與大容量背包！」
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-amber-500/40 text-amber-300 font-bold font-mono text-sm shadow-inner">
              <Coins className="w-4 h-4 text-yellow-400" />
              <span>{player.gold} G</span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
              title="離開商店"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Special Services Bar: Backpack expansion, Full heal & Repair all */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 my-3.5">
          {/* Backpack Expansion Service */}
          <div className="rounded-2xl bg-slate-950/70 border border-slate-800 p-3 flex flex-col justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-400 flex items-center justify-center text-sky-300">
                <Maximize2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-100 flex items-center gap-1">
                  背包擴充
                  <span className="text-[10px] text-sky-400 font-mono">
                    ({canExpand ? `${nextSize}×${nextSize}` : '頂級'})
                  </span>
                </h4>
                <p className="text-[10px] text-slate-400">
                  擴充空間格數
                </p>
              </div>
            </div>

            {canExpand ? (
              <button
                type="button"
                onClick={handleExpand}
                disabled={player.gold < expandCost}
                className={`w-full py-1.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition ${
                  player.gold >= expandCost
                    ? 'bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-md shadow-sky-500/20 active:scale-95'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Coins className="w-3.5 h-3.5" />
                <span>{expandCost} G 擴充</span>
              </button>
            ) : (
              <span className="text-[10px] text-center text-emerald-400 font-bold bg-emerald-950/50 py-1 rounded-lg border border-emerald-800">
                已升至頂級
              </span>
            )}
          </div>

          {/* Full Heal Service */}
          <div className="rounded-2xl bg-slate-950/70 border border-slate-800 p-3 flex flex-col justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-400 flex items-center justify-center text-rose-300">
                <Heart className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-100">
                  聖泉全額治療
                </h4>
                <p className="text-[10px] text-slate-400">
                  回復至上限 ({player.hp}/{player.maxHp})
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleHeal}
              disabled={player.gold < healCost || player.hp >= player.maxHp}
              className={`w-full py-1.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition ${
                player.gold >= healCost && player.hp < player.maxHp
                  ? 'bg-rose-500 hover:bg-rose-400 text-white shadow-md shadow-rose-500/20 active:scale-95'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Coins className="w-3.5 h-3.5" />
              <span>{healCost} G 治療</span>
            </button>
          </div>

          {/* Repair All Gear Service */}
          <div className="rounded-2xl bg-slate-950/70 border border-slate-800 p-3 flex flex-col justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-300">
                <Wrench className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-100">
                  全套裝備修繕
                </h4>
                <p className="text-[10px] text-slate-400">
                  修滿背包所有裝備耐久
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRepairAll}
              disabled={player.gold < repairAllCost}
              className={`w-full py-1.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition ${
                player.gold >= repairAllCost
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 active:scale-95'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Coins className="w-3.5 h-3.5" />
              <span>{repairAllCost} G 修滿裝備</span>
            </button>
          </div>
        </div>

        {/* Goods Showcase */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
            <ShoppingBag className="w-4 h-4 text-amber-400" />
            本日精選神兵（自帶隨機詞綴）
          </span>

          <button
            type="button"
            onClick={handleReroll}
            disabled={player.gold < rerollCost}
            className={`text-xs px-2.5 py-1 rounded-lg border flex items-center gap-1 transition ${
              player.gold >= rerollCost
                ? 'bg-slate-800 text-amber-300 hover:bg-slate-700 border-amber-500/40'
                : 'bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed'
            }`}
          >
            <RotateCcw className="w-3 h-3" />
            <span>刷新貨架 ({rerollCost} G)</span>
          </button>
        </div>

        {/* Goods Grid */}
        <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-1 md:grid-cols-2 gap-3 scrollbar-thin">
          {goods.map(item => {
            const isSold = purchasedIds.includes(item.instanceId);
            const price = item.price || 40;
            const canAfford = player.gold >= price;

            return (
              <div
                key={item.instanceId}
                className={`rounded-2xl border p-3 flex flex-col justify-between transition-all ${
                  isSold
                    ? 'bg-slate-950/40 border-slate-800/50 opacity-40'
                    : 'bg-slate-950/80 border-slate-800 hover:border-amber-500/60'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl border"
                        style={{ backgroundColor: item.color, borderColor: item.borderColor }}
                      >
                        {item.icon}
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-slate-100 flex items-center gap-1">
                          {item.name}
                        </h4>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                          <span className={`font-semibold ${
                            item.rarity === 'legendary' ? 'text-amber-400' : item.rarity === 'rare' ? 'text-purple-400' : 'text-slate-400'
                          }`}>
                            {item.rarity === 'legendary' ? '傳說' : item.rarity === 'rare' ? '稀有' : '普通'}
                          </span>
                          <span>•</span>
                          <span>{item.w}×{item.h}格</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right text-[11px] font-mono font-bold">
                      {item.baseAtk > 0 && <span className="text-amber-400">+{item.baseAtk}攻 </span>}
                      {item.baseDef > 0 && <span className="text-sky-400">+{item.baseDef}防</span>}
                    </div>
                  </div>

                  {/* Affixes Tags */}
                  {item.affixes && item.affixes.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {item.affixes.map(af => (
                        <span
                          key={af.id}
                          className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30"
                        >
                          ✨ {af.name}: {af.description}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Synergy text */}
                  <p className="mt-2 text-[10px] text-slate-400 leading-snug">
                    🔗 {item.synergyDesc}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-1 font-bold text-sm text-yellow-300 font-mono">
                    <Coins className="w-4 h-4 text-yellow-400" />
                    <span>{price} G</span>
                  </div>

                  {isSold ? (
                    <span className="flex items-center gap-1 text-xs text-slate-500 font-bold">
                      <Check className="w-3.5 h-3.5" /> 已售出
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleBuy(item)}
                      disabled={!canAfford}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                        canAfford
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 active:scale-95 shadow-md shadow-amber-500/20'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      <span>購買並收入暫存</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            💡 購買之裝備將自動放入「戰利品待領區」，隨時可擺入背包
          </span>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
          >
            離開商隊，繼續冒險 (ESC)
          </button>
        </div>
      </div>
    </div>
  );
};
