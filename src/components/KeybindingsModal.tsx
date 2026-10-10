import React, { useState, useEffect } from 'react';
import { KeybindingsConfig } from '../types/game';
import { Keyboard, RotateCcw, X, Check, AlertCircle } from 'lucide-react';

interface KeybindingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: KeybindingsConfig;
  onSaveConfig: (newConfig: KeybindingsConfig) => void;
  onResetDefaults: () => void;
}

const ACTION_LABELS: Record<keyof KeybindingsConfig, { label: string; desc: string }> = {
  rotateItem: { label: '旋轉手持裝備', desc: '手持裝備時旋轉 90°' },
  togglePause: { label: '暫停 / 恢復遊戲', desc: '隨時切換巡航暫停' },
  speed1: { label: '正常速度 (1x)', desc: '設定遊戲為標準速度' },
  speed2: { label: '二倍加速 (2x)', desc: '設定遊戲為 2 倍速' },
  speed3: { label: '極速狂奔 (3x)', desc: '設定遊戲為 3 倍速' },
  autoEquip: { label: '戰利品一鍵自動填裝', desc: '快速將托盤裝備擺入空格' },
  openCodex: { label: '開啟圖鑑百科', desc: '查看裝備、怪物與詞綴' },
  openAchievements: { label: '開啟成就系統', desc: '檢視榮譽進度與領取金幣' },
  openReplay: { label: '開啟戰鬥回放', desc: '回顧最新魔物交鋒歷程' },
  openHelp: { label: '開啟玩法指南', desc: '查閱新手指南與連鎖技巧' },
  openSettings: { label: '自訂快捷鍵設定', desc: '開啟此設定面板' }
};

export const KeybindingsModal: React.FC<KeybindingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  onResetDefaults
}) => {
  const [currentConfig, setCurrentConfig] = useState<KeybindingsConfig>(config);
  const [activeBindingKey, setActiveBindingKey] = useState<keyof KeybindingsConfig | null>(null);

  useEffect(() => {
    setCurrentConfig(config);
  }, [config]);

  // Key listener when recording a binding
  useEffect(() => {
    if (!activeBindingKey) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // Escape cancels the listening
      if (e.key === 'Escape') {
        setActiveBindingKey(null);
        return;
      }

      const keyVal = e.key.toLowerCase();
      setCurrentConfig(prev => ({
        ...prev,
        [activeBindingKey]: keyVal
      }));
      setActiveBindingKey(null);
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [activeBindingKey]);

  if (!isOpen) return null;

  const formatKeyName = (key: string) => {
    if (key === ' ') return 'Space 空格';
    if (key === 'arrowup') return '↑ 方向上';
    if (key === 'arrowdown') return '↓ 方向下';
    if (key === 'arrowleft') return '← 方向左';
    if (key === 'arrowright') return '→ 方向右';
    if (key === 'enter') return 'Enter 回車';
    return key.toUpperCase();
  };

  const handleSave = () => {
    onSaveConfig(currentConfig);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl max-h-[88vh] rounded-3xl bg-slate-900 border-2 border-slate-700 shadow-2xl p-6 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-300">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                自訂快捷鍵設定 (Keybindings)
              </h2>
              <p className="text-xs text-slate-400">
                點擊按鍵按鈕後按下任意鍵即可重新綁定，設定將自動儲存！
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

        {/* Keybindings List */}
        <div className="flex-1 overflow-y-auto pr-1 py-3 flex flex-col gap-2 scrollbar-thin">
          {(Object.keys(ACTION_LABELS) as (keyof KeybindingsConfig)[]).map(actionKey => {
            const info = ACTION_LABELS[actionKey];
            const currentVal = currentConfig[actionKey];
            const isListening = activeBindingKey === actionKey;

            return (
              <div
                key={actionKey}
                className="rounded-xl bg-slate-950/70 border border-slate-800 p-2.5 px-3.5 flex items-center justify-between hover:border-slate-700 transition"
              >
                <div>
                  <h4 className="font-bold text-xs text-slate-200">{info.label}</h4>
                  <p className="text-[11px] text-slate-500">{info.desc}</p>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() => setActiveBindingKey(actionKey)}
                    className={`min-w-[110px] px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center justify-center border shadow-sm ${
                      isListening
                        ? 'bg-amber-500 text-slate-950 border-amber-300 ring-2 ring-amber-400 animate-pulse'
                        : 'bg-slate-800 text-amber-300 hover:bg-slate-700 border-slate-700'
                    }`}
                  >
                    {isListening ? '請按下按鍵...' : formatKeyName(currentVal)}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer controls */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={onResetDefaults}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-300 border border-slate-700 text-xs font-bold transition flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>恢復預設鍵位</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 transition"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md transition flex items-center gap-1"
            >
              <Check className="w-4 h-4" />
              <span>保存鍵位設定</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
