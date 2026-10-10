import React from 'react';
import { PlayerStats } from '../types/game';
import { RotateCcw, Trophy, Skull, Swords, Footprints, Coins } from 'lucide-react';

interface GameOverModalProps {
  isOpen: boolean;
  player: PlayerStats;
  onRestart: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  player,
  onRestart
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-3xl bg-gradient-to-b from-slate-900 via-slate-950 to-black border-2 border-red-900/60 shadow-2xl p-7 flex flex-col items-center text-center overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="w-16 h-16 rounded-2xl bg-red-950/80 border-2 border-red-600 flex items-center justify-center text-3xl mb-3 shadow-lg shadow-red-900/40 animate-bounce">
          💀
        </div>

        <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-rose-300 to-amber-300 mb-1 font-serif tracking-wide">
          循環斷裂 • 冒險終結
        </h2>
        <p className="text-xs text-slate-400 mb-5">
          你在第 {player.loop} 圈的無盡軌道上力竭倒下，但你的傳奇已被銘刻。
        </p>

        {/* Run Summary Stats */}
        <div className="grid grid-cols-2 gap-2.5 w-full mb-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex items-center gap-3">
            <Trophy className="w-5 h-5 text-amber-400" />
            <div className="text-left">
              <span className="text-[10px] text-slate-500 uppercase block">存活圈數</span>
              <span className="font-bold text-slate-200 text-sm">第 {player.loop} 圈</span>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex items-center gap-3">
            <Skull className="w-5 h-5 text-rose-400" />
            <div className="text-left">
              <span className="text-[10px] text-slate-500 uppercase block">魔物斬殺</span>
              <span className="font-bold text-slate-200 text-sm">{player.totalKills} 隻</span>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex items-center gap-3">
            <Swords className="w-5 h-5 text-sky-400" />
            <div className="text-left">
              <span className="text-[10px] text-slate-500 uppercase block">總累積輸出</span>
              <span className="font-bold text-slate-200 text-sm">{player.totalDamageDealt} 點</span>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex items-center gap-3">
            <Coins className="w-5 h-5 text-yellow-400" />
            <div className="text-left">
              <span className="text-[10px] text-slate-500 uppercase block">獲得金幣</span>
              <span className="font-bold text-slate-200 text-sm">{player.gold} G</span>
            </div>
          </div>
        </div>

        {/* Strategy Advice */}
        <div className="w-full bg-slate-950/60 border border-slate-800 rounded-xl p-3 mb-6 text-left text-xs text-slate-400">
          <span className="font-bold text-amber-400 block mb-1">💡 賢者建言：</span>
          <p className="leading-relaxed">
            重木盾在被 3-4 個裝備四面包夾時能提供驚人的額外護甲！搭配砥石強化刀劍，或孤立擺放藥水加速回血，是突破更高循環的關鍵。
          </p>
        </div>

        {/* Restart Button */}
        <button
          type="button"
          onClick={onRestart}
          className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm tracking-wide shadow-xl shadow-amber-500/20 active:scale-98 transition flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          <span>重新開啟新循環</span>
        </button>
      </div>
    </div>
  );
};
