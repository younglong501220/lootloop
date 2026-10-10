import React from 'react';
import { InventoryItem } from '../types/game';
import { Package, Trash2, ArrowDownToLine } from 'lucide-react';

interface LootTrayProps {
  items: InventoryItem[];
  heldItem: InventoryItem | null;
  onPickLootItem: (item: InventoryItem, index: number) => void;
  onDiscardAll: () => void;
  onAutoEquipAll?: () => void;
  onUseRepairTool?: (toolItem: InventoryItem) => void;
  onHoverItem: (item: InventoryItem | null, pos: { x: number; y: number } | null) => void;
}

export const LootTray: React.FC<LootTrayProps> = ({
  items,
  heldItem,
  onPickLootItem,
  onDiscardAll,
  onAutoEquipAll,
  onUseRepairTool,
  onHoverItem
}) => {
  return (
    <div className="w-full rounded-2xl bg-slate-900/90 border border-slate-800 p-3 shadow-lg flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Package className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold text-slate-200">
            戰利品待領區 ({items.length})
          </span>
          {items.length > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold animate-pulse">
              有新裝備
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {onAutoEquipAll && items.length > 0 && (
            <button
              type="button"
              onClick={onAutoEquipAll}
              className="px-2 py-1 text-[11px] rounded-lg bg-sky-500/20 text-sky-300 hover:bg-sky-500/30 border border-sky-500/40 transition flex items-center gap-1"
              title="自動嘗試將戰利品放入背包空格"
            >
              <ArrowDownToLine className="w-3 h-3" />
              <span>自動填裝</span>
            </button>
          )}

          {items.length > 0 && (
            <button
              type="button"
              onClick={onDiscardAll}
              className="px-2 py-1 text-[11px] rounded-lg bg-slate-800 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 border border-slate-700/80 transition flex items-center gap-1"
              title="丟棄所有待領裝備"
            >
              <Trash2 className="w-3 h-3" />
              <span>丟棄全部</span>
            </button>
          )}
        </div>
      </div>

      {/* Tray Slot Strip */}
      <div className="min-h-[76px] rounded-xl bg-slate-950/80 border border-dashed border-slate-800 p-2 flex items-center gap-2.5 overflow-x-auto scrollbar-thin">
        {items.length === 0 ? (
          <div className="w-full flex items-center justify-center text-xs text-slate-500 italic py-3">
            暫無待領戰利品。在循環軌道上擊敗魔物或開啟寶箱即可獲取！
          </div>
        ) : (
          items.map((item, idx) => (
            <div
              key={item.instanceId}
              onClick={() => {
                if (!heldItem) {
                  onPickLootItem(item, idx);
                }
              }}
              onMouseEnter={e => onHoverItem(item, { x: e.clientX, y: e.clientY })}
              onMouseMove={e => onHoverItem(item, { x: e.clientX, y: e.clientY })}
              onMouseLeave={() => onHoverItem(null, null)}
              className="group relative flex-shrink-0 cursor-pointer rounded-xl p-1.5 flex flex-col items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-md border"
              style={{
                width: `${Math.max(48, item.w * 36)}px`,
                height: `${Math.max(48, item.h * 36)}px`,
                backgroundColor: item.color,
                borderColor: item.borderColor
              }}
            >
              <span className="text-xl pointer-events-none filter drop-shadow">
                {item.icon}
              </span>
              <span className="text-[9px] font-bold text-white text-center truncate max-w-full pointer-events-none drop-shadow">
                {item.name}
              </span>
              {item.isRepairTool && (
                <span className="absolute -top-1 -left-1 text-[8px] bg-amber-500 text-slate-950 font-black px-1.5 py-0.2 rounded-full shadow-sm animate-pulse">
                  🔨 修理 (+{item.repairPower})
                </span>
              )}
              {item.isRepairTool && onUseRepairTool && (
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    onUseRepairTool(item);
                  }}
                  className="mt-1 px-1.5 py-0.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 text-[8px] font-bold shadow transition active:scale-90"
                  title="一鍵修復背包中受損最嚴重的裝備"
                >
                  立即修復
                </button>
              )}
              <span className="absolute -bottom-1 -right-1 text-[8px] font-mono px-1 rounded bg-black/80 text-slate-300 pointer-events-none">
                {item.w}×{item.h}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
