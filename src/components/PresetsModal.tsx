import React, { useState } from 'react';
import { EquipmentPreset, PlacedItemInstance } from '../types/game';
import { X, BookmarkPlus, BookmarkCheck, Trash2, RotateCcw, Swords, Shield, Sparkles, Check } from 'lucide-react';

interface PresetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  presets: EquipmentPreset[];
  currentPlacedItems: PlacedItemInstance[];
  onApplyPreset: (preset: EquipmentPreset) => void;
  onSavePreset: (name: string, description?: string) => void;
  onDeletePreset: (presetId: string) => void;
}

export const PresetsModal: React.FC<PresetsModalProps> = ({
  isOpen,
  onClose,
  presets,
  currentPlacedItems,
  onApplyPreset,
  onSavePreset,
  onDeletePreset
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'custom' | 'builtin'>('all');
  const [newPresetName, setNewPresetName] = useState('');
  const [newPresetDesc, setNewPresetDesc] = useState('');
  const [isSavingNew, setIsSavingNew] = useState(false);
  const [appliedPresetId, setAppliedPresetId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newPresetName.trim() || `戰術配置 #${presets.filter(p => !p.isBuiltIn).length + 1}`;
    onSavePreset(name, newPresetDesc.trim() || undefined);
    setNewPresetName('');
    setNewPresetDesc('');
    setIsSavingNew(false);
  };

  const handleApply = (preset: EquipmentPreset) => {
    onApplyPreset(preset);
    setAppliedPresetId(preset.id);
    setTimeout(() => {
      setAppliedPresetId(null);
    }, 1800);
  };

  const filteredPresets = presets.filter((p) => {
    if (activeTab === 'custom') return !p.isBuiltIn;
    if (activeTab === 'builtin') return !!p.isBuiltIn;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <BookmarkCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                裝備預設組合 (Gear Presets)
              </h2>
              <p className="text-xs text-slate-400">
                儲存當前背包裝備配置，一鍵秒切換不同戰術流派，克制特定首領！
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

        {/* Action Bar: Save current layout / Filter tabs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 my-4">
          <div className="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800 self-start">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                activeTab === 'all'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              全部組合 ({presets.length})
            </button>
            <button
              onClick={() => setActiveTab('builtin')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                activeTab === 'builtin'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              精選推薦 ({presets.filter(p => p.isBuiltIn).length})
            </button>
            <button
              onClick={() => setActiveTab('custom')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                activeTab === 'custom'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              自訂預設 ({presets.filter(p => !p.isBuiltIn).length})
            </button>
          </div>

          <button
            onClick={() => setIsSavingNew(!isSavingNew)}
            className="px-3.5 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white flex items-center justify-center gap-1.5 shadow-md shadow-indigo-950/50 transition active:scale-95"
          >
            <BookmarkPlus className="w-4 h-4" />
            <span>儲存當前背包為新預設</span>
          </button>
        </div>

        {/* New Preset Drawer / Form */}
        {isSavingNew && (
          <form
            onSubmit={handleSave}
            className="mb-4 p-4 bg-slate-950 border border-indigo-500/40 rounded-2xl shadow-inner flex flex-col gap-3 animate-fade-in"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-indigo-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                儲存當前背包 ({currentPlacedItems.length} 件裝備) 為自訂配置
              </span>
              <button
                type="button"
                onClick={() => setIsSavingNew(false)}
                className="text-xs text-slate-500 hover:text-slate-300"
              >
                取消
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="預設組合名稱 (例如：極限暴擊流、防禦反擊陣)"
                value={newPresetName}
                onChange={(e) => setNewPresetName(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400"
                autoFocus
              />
              <input
                type="text"
                placeholder="戰術描述備忘 (選填，例如：適合第 4 圈以後的亡靈首領)"
                value={newPresetDesc}
                onChange={(e) => setNewPresetDesc(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsSavingNew(false)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-900"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl text-xs font-black bg-indigo-500 hover:bg-indigo-400 text-white shadow-md transition"
              >
                確認儲存
              </button>
            </div>
          </form>
        )}

        {/* Presets List */}
        <div className="overflow-y-auto space-y-3 pr-1 flex-1">
          {filteredPresets.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              尚無此分類下的預設配置，點擊上方按鈕立即儲存當前背包裝備！
            </div>
          ) : (
            filteredPresets.map((preset) => {
              const isAppliedJustNow = appliedPresetId === preset.id;

              return (
                <div
                  key={preset.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    preset.isBuiltIn
                      ? 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                      : 'bg-indigo-950/20 border-indigo-900/50 hover:border-indigo-700/60'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-black text-sm text-white">{preset.name}</h4>
                        {preset.isBuiltIn ? (
                          <span className="text-[10px] font-black text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            精選模板
                          </span>
                        ) : (
                          <span className="text-[10px] font-black text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                            玩家自訂
                          </span>
                        )}
                        {preset.summary.tag && (
                          <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                            {preset.summary.tag}
                          </span>
                        )}
                      </div>

                      {preset.description && (
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                          {preset.description}
                        </p>
                      )}

                      {/* Items mini icon row & stats summary */}
                      <div className="flex items-center gap-3 mt-2.5 flex-wrap">
                        <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold bg-slate-900/90 px-2.5 py-1 rounded-lg border border-slate-800">
                          <Swords className="w-3.5 h-3.5" />
                          <span>攻 +{preset.summary.totalAtk}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-sky-400 font-bold bg-slate-900/90 px-2.5 py-1 rounded-lg border border-slate-800">
                          <Shield className="w-3.5 h-3.5" />
                          <span>防 +{preset.summary.totalDef}</span>
                        </div>
                        <span className="text-xs text-slate-400">
                          裝備 {preset.items.length} 件
                        </span>

                        {/* Mini item icons */}
                        <div className="flex items-center gap-1 overflow-x-auto max-w-[240px] py-0.5">
                          {preset.items.map((item, idx) => (
                            <span
                              key={idx}
                              title={`${item.name} (${item.rarity})`}
                              className="w-6 h-6 rounded-md bg-slate-900 border border-slate-700 flex items-center justify-center text-xs shrink-0 select-none shadow-sm"
                              style={{ borderColor: item.borderColor }}
                            >
                              {item.icon}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                      {!preset.isBuiltIn && (
                        <button
                          onClick={() => onDeletePreset(preset.id)}
                          className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-950/40 rounded-xl border border-transparent hover:border-red-900 transition"
                          title="刪除此自訂預設"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        onClick={() => handleApply(preset)}
                        className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-md active:scale-95 ${
                          isAppliedJustNow
                            ? 'bg-emerald-500 text-slate-950 ring-2 ring-emerald-400'
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-950/60'
                        }`}
                      >
                        {isAppliedJustNow ? (
                          <>
                            <Check className="w-4 h-4" />
                            <span>套用成功！</span>
                          </>
                        ) : (
                          <>
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>一鍵載入配置</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 mt-2 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            載入預設組合將自動依座標將裝備擺放至背包並計算相鄰連攜效果
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition"
          >
            關閉
          </button>
        </div>
      </div>
    </div>
  );
};
