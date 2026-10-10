import React, { useState } from 'react';
import { PlacedItemInstance, InventoryItem } from '../types/game';
import { canPlaceItem } from '../utils/inventory';
import { soundFX } from '../utils/audio';
import { RotateCw, Sparkles, X, Wrench, AlertTriangle } from 'lucide-react';

interface BackpackGridProps {
  gridSize: number;
  placedItems: PlacedItemInstance[];
  heldItem: InventoryItem | null;
  onPickItem: (item: PlacedItemInstance) => void;
  onPlaceItem: (r: number, c: number) => void;
  onRotateHeldItem: () => void;
  onCancelHeldItem: () => void;
  onHoverItem: (item: PlacedItemInstance | null, pos: { x: number; y: number } | null) => void;
  onRepairItemWithHeldTool?: (targetItem: PlacedItemInstance) => void;
  gridMatrix: (PlacedItemInstance | null)[][];
}

const getCellSize = (gridSize: number) => {
  if (gridSize >= 7) return 44;
  if (gridSize === 6) return 48;
  return 52;
};

const CELL_GAP = 4; // pixels

export const BackpackGrid: React.FC<BackpackGridProps> = ({
  gridSize,
  placedItems,
  heldItem,
  onPickItem,
  onPlaceItem,
  onRotateHeldItem,
  onCancelHeldItem,
  onHoverItem,
  onRepairItemWithHeldTool,
  gridMatrix
}) => {
  const [hoverCoord, setHoverCoord] = useState<{ r: number; c: number } | null>(null);
  const CELL_SIZE = getCellSize(gridSize);

  // Calculate backpack fullness
  const totalCells = gridSize * gridSize;
  let occupiedCells = 0;
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (gridMatrix[r] && gridMatrix[r][c] !== null) {
        occupiedCells++;
      }
    }
  }
  const fullnessPct = Math.round((occupiedCells / totalCells) * 100);

  // Dynamic ambiance and styling based on fullness
  let fullnessTheme = {
    frameBorder: 'border-slate-700/80',
    frameBg: 'from-slate-900 to-slate-950',
    frameShadow: 'shadow-black/80',
    ambientOverlay: 'bg-transparent',
    badgeClass: 'bg-slate-800 text-slate-300 border-slate-700',
    barColor: 'bg-slate-500',
    label: '空間充裕'
  };

  if (fullnessPct >= 90) {
    fullnessTheme = {
      frameBorder: 'border-purple-400 shadow-[0_0_24px_rgba(168,85,247,0.35)] ring-1 ring-purple-400/50',
      frameBg: 'from-purple-950/40 via-rose-950/30 to-slate-950',
      frameShadow: 'shadow-purple-950/70',
      ambientOverlay: 'bg-purple-500/[0.08]',
      badgeClass: 'bg-purple-950/80 text-purple-200 border-purple-400/70 animate-pulse',
      barColor: 'bg-gradient-to-r from-purple-400 via-rose-400 to-amber-300',
      label: '極限超載'
    };
  } else if (fullnessPct >= 70) {
    fullnessTheme = {
      frameBorder: 'border-amber-500/80 shadow-[0_0_20px_rgba(245,158,11,0.25)]',
      frameBg: 'from-slate-900 via-amber-950/35 to-slate-950',
      frameShadow: 'shadow-amber-950/60',
      ambientOverlay: 'bg-amber-500/[0.06]',
      badgeClass: 'bg-amber-950/70 text-amber-300 border-amber-500/60',
      barColor: 'bg-amber-400',
      label: '高度滿載'
    };
  } else if (fullnessPct >= 35) {
    fullnessTheme = {
      frameBorder: 'border-emerald-600/70 shadow-[0_0_16px_rgba(16,185,129,0.2)]',
      frameBg: 'from-slate-900 via-emerald-950/25 to-slate-950',
      frameShadow: 'shadow-emerald-950/40',
      ambientOverlay: 'bg-emerald-500/[0.04]',
      badgeClass: 'bg-emerald-950/60 text-emerald-300 border-emerald-600/50',
      barColor: 'bg-emerald-400',
      label: '均衡配置'
    };
  }

  // Check hover placement validity
  const isHoverValid = hoverCoord && heldItem
    ? canPlaceItem(heldItem, hoverCoord.r, hoverCoord.c, gridMatrix, gridSize, heldItem.instanceId)
    : false;

  const handleCellClick = (r: number, c: number) => {
    if (heldItem) {
      if (canPlaceItem(heldItem, r, c, gridMatrix, gridSize, heldItem.instanceId)) {
        onPlaceItem(r, c);
      } else {
        soundFX.playHit();
      }
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if (heldItem) {
      onRotateHeldItem();
    }
  };

  const gridPixelSize = gridSize * CELL_SIZE + (gridSize - 1) * CELL_GAP;

  return (
    <div className="flex flex-col items-center select-none" onContextMenu={handleContextMenu}>
      {/* Backpack Controls Header */}
      <div className="w-full flex items-center justify-between mb-2 px-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-100 flex items-center gap-1">
            🎒 背包收納庫
          </span>
          <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
            {gridSize}×{gridSize}
          </span>
          {/* Fullness Indicator Badge */}
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-all duration-300 flex items-center gap-1 ${fullnessTheme.badgeClass}`}>
            <span>📊 {fullnessTheme.label}</span>
            <span className="font-mono">{occupiedCells}/{totalCells} ({fullnessPct}%)</span>
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {heldItem ? (
            <>
              {heldItem.isRepairTool && (
                <span className="text-[11px] font-bold text-amber-300 bg-amber-950/60 border border-amber-500/50 px-2 py-0.5 rounded-lg animate-pulse flex items-center gap-1">
                  <Wrench className="w-3 h-3" />
                  點擊受損裝備即可修復
                </span>
              )}
              <button
                type="button"
                onClick={onRotateHeldItem}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 transition active:scale-95 shadow-sm"
                title="快捷鍵：鍵盤 [R] 或 滑鼠右鍵"
              >
                <RotateCw className="w-3.5 h-3.5 animate-spin-reverse" />
                <span>旋轉 (R)</span>
              </button>
              <button
                type="button"
                onClick={onCancelHeldItem}
                className="flex items-center gap-1 px-2 py-1 text-xs rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/40 transition active:scale-95"
                title="放回暫存區 (ESC)"
              >
                <X className="w-3.5 h-3.5" />
                <span>取消</span>
              </button>
            </>
          ) : (
            <span className="text-[11px] text-slate-400">
              點擊裝備拿取 • 拖曳擺放
            </span>
          )}
        </div>
      </div>

      {/* Grid Canvas Frame with Dynamic Fullness Filter */}
      <div
        className={`relative p-2.5 rounded-2xl bg-gradient-to-b ${fullnessTheme.frameBg} border-2 ${fullnessTheme.frameBorder} ${fullnessTheme.frameShadow} shadow-2xl transition-all duration-500`}
        style={{
          width: `${gridPixelSize + 24}px`,
          height: `${gridPixelSize + 24}px`
        }}
      >
        {/* Dynamic Ambiance Overlay */}
        <div className={`absolute inset-0 rounded-2xl pointer-events-none transition-colors duration-500 ${fullnessTheme.ambientOverlay}`} />
        {/* Cells Grid */}
        <div
          className="grid relative"
          style={{
            gridTemplateColumns: `repeat(${gridSize}, ${CELL_SIZE}px)`,
            gridTemplateRows: `repeat(${gridSize}, ${CELL_SIZE}px)`,
            gap: `${CELL_GAP}px`
          }}
        >
          {Array.from({ length: gridSize }).map((_, r) =>
            Array.from({ length: gridSize }).map((__, c) => {
              // Determine if this cell is highlighted by heldItem hover
              let isHighlighted = false;
              if (hoverCoord && heldItem) {
                const dr = r - hoverCoord.r;
                const dc = c - hoverCoord.c;
                if (
                  dr >= 0 &&
                  dr < heldItem.h &&
                  dc >= 0 &&
                  dc < heldItem.w &&
                  heldItem.shape[dr][dc] === 1
                ) {
                  isHighlighted = true;
                }
              }

              return (
                <div
                  key={`cell_${r}_${c}`}
                  onMouseEnter={() => setHoverCoord({ r, c })}
                  onMouseLeave={() => setHoverCoord(null)}
                  onClick={() => handleCellClick(r, c)}
                  className={`relative rounded-lg border transition-colors duration-75 flex items-center justify-center ${
                    isHighlighted
                      ? isHoverValid
                        ? 'bg-emerald-500/30 border-emerald-400 shadow-inner'
                        : 'bg-rose-500/35 border-rose-400 shadow-inner'
                      : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                  }`}
                  style={{
                    width: `${CELL_SIZE}px`,
                    height: `${CELL_SIZE}px`
                  }}
                >
                  <span className="w-1 h-1 rounded-full bg-slate-800/60 pointer-events-none" />
                </div>
              );
            })
          )}
        </div>

        {/* Placed Items Layer */}
        {placedItems.map(item => {
          const left = item.gridC * (CELL_SIZE + CELL_GAP);
          const top = item.gridR * (CELL_SIZE + CELL_GAP);
          const width = item.w * CELL_SIZE + (item.w - 1) * CELL_GAP;
          const height = item.h * CELL_SIZE + (item.h - 1) * CELL_GAP;

          // Durability percentage
          const durPct = item.maxDurability > 0
            ? Math.max(0, Math.min(100, Math.round((item.currentDurability / item.maxDurability) * 100)))
            : 100;

          const durBarColor = item.isBroken
            ? 'bg-red-600'
            : durPct > 60
            ? 'bg-emerald-400'
            : durPct > 25
            ? 'bg-amber-400'
            : 'bg-rose-500';

          // Rarity border shimmer animations
          let rarityShimmerClass = '';
          if (!item.isBroken) {
            if (item.rarity === 'legendary') {
              rarityShimmerClass = 'animate-shimmer-legendary shimmer-sweep ring-1 ring-amber-300/80';
            } else if (item.rarity === 'rare') {
              rarityShimmerClass = 'animate-shimmer-rare ring-1 ring-sky-400/60';
            } else if (item.rarity === 'common') {
              rarityShimmerClass = 'animate-shimmer-common';
            }
          }

          return (
            <div
              key={item.instanceId}
              onClick={e => {
                e.stopPropagation();
                // If currently holding a repair tool, repair this equipment!
                if (heldItem && heldItem.isRepairTool && onRepairItemWithHeldTool) {
                  onRepairItemWithHeldTool(item);
                  return;
                }

                if (!heldItem) {
                  onPickItem(item);
                } else {
                  handleCellClick(item.gridR, item.gridC);
                }
              }}
              onMouseEnter={e => {
                onHoverItem(item, { x: e.clientX, y: e.clientY });
              }}
              onMouseMove={e => {
                onHoverItem(item, { x: e.clientX, y: e.clientY });
              }}
              onMouseLeave={() => onHoverItem(null, null)}
              className={`absolute cursor-pointer rounded-xl flex flex-col items-center justify-center transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-md overflow-hidden ${
                item.isBroken
                  ? 'border-red-600 ring-2 ring-red-500/80 bg-red-950/40 opacity-85'
                  : item.isSynergyActive
                  ? `ring-2 ring-amber-400 ring-offset-1 ring-offset-slate-900 shadow-amber-500/30 shadow-lg ${rarityShimmerClass}`
                  : `hover:brightness-110 ${rarityShimmerClass}`
              }`}
              style={{
                left: `${left + 10}px`,
                top: `${top + 10}px`,
                width: `${width}px`,
                height: `${height}px`,
                backgroundColor: item.isBroken ? '#2a1111' : item.color,
                border: `2px solid ${item.isBroken ? '#ef4444' : item.borderColor}`
              }}
            >
              {/* Rarity Label / Star Crest */}
              {!item.isBroken && item.rarity === 'legendary' && (
                <div className="absolute top-0.5 left-1 text-[8px] font-black text-amber-300 drop-shadow flex items-center gap-0.5 pointer-events-none">
                  ⭐ 傳奇
                </div>
              )}
              {!item.isBroken && item.rarity === 'rare' && (
                <div className="absolute top-0.5 left-1 text-[8px] font-black text-sky-300 drop-shadow flex items-center gap-0.5 pointer-events-none">
                  ✦ 稀有
                </div>
              )}
              {!item.isBroken && item.rarity === 'common' && (
                <div className="absolute top-0.5 left-1 text-[8px] font-semibold text-slate-400 drop-shadow pointer-events-none">
                  普通
                </div>
              )}
              {/* Synergy Active Indicator Badge */}
              {item.isSynergyActive && !item.isBroken && (
                <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-amber-400 text-slate-900 flex items-center justify-center text-[10px] shadow-sm animate-pulse">
                  <Sparkles className="w-2.5 h-2.5" />
                </div>
              )}

              {/* Broken Indicator Badge */}
              {item.isBroken && (
                <div className="absolute top-1 right-1 px-1 py-0.2 rounded bg-red-600 text-white font-black text-[8px] flex items-center gap-0.5 animate-pulse shadow">
                  <AlertTriangle className="w-2.5 h-2.5" /> 損壞
                </div>
              )}

              {/* Icon */}
              <span className={`text-2xl filter drop-shadow-md pointer-events-none mb-0.5 ${item.isBroken ? 'opacity-50 grayscale' : ''}`}>
                {item.icon}
              </span>

              {/* Name */}
              <span className="text-[10px] font-bold text-white tracking-wider pointer-events-none drop-shadow px-1 text-center truncate max-w-full">
                {item.name}
              </span>

              {/* Mini stat tag */}
              <div className="flex items-center gap-1 mt-0.5 text-[9px] font-bold pointer-events-none">
                {item.baseAtk > 0 && (
                  <span className={item.isBroken ? 'text-red-300 line-through' : 'text-amber-300'}>
                    +{Math.round((item.baseAtk + item.bonusAtk) * (item.isBroken ? 0.5 : 1))}⚔️
                  </span>
                )}
                {item.baseDef > 0 && (
                  <span className={item.isBroken ? 'text-red-300 line-through' : 'text-sky-300'}>
                    +{Math.round((item.baseDef + item.bonusDef) * (item.isBroken ? 0.5 : 1))}🛡️
                  </span>
                )}
                {item.isRepairTool && (
                  <span className="text-amber-300 font-bold">
                    修復+{item.repairPower}
                  </span>
                )}
              </div>

              {/* Mini Durability Bar */}
              {item.type !== 'potion' && item.type !== 'gem' && (
                <div className="absolute bottom-1 left-2 right-2 h-1 bg-black/60 rounded-full overflow-hidden border border-black/40">
                  <div
                    className={`h-full ${durBarColor} transition-all duration-200`}
                    style={{ width: `${durPct}%` }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Grid instruction banner */}
      <div className="mt-2.5 text-[11px] text-slate-400 flex items-center justify-between w-full px-2">
        <span className="flex items-center gap-1">
          💡 戰鬥中裝備將消耗耐久；耗盡時數值減半，可使用修理工具修繕！
        </span>
      </div>
    </div>
  );
};
