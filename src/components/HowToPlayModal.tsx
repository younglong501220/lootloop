import React from 'react';
import { HelpCircle, X, RotateCw, Sparkles, ShoppingBag, Shield, Trophy, Swords } from 'lucide-react';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl max-h-[90vh] rounded-3xl bg-slate-900 border-2 border-slate-700 shadow-2xl p-6 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <HelpCircle className="w-6 h-6 text-amber-400" />
            <div>
              <h2 className="text-lg font-bold text-slate-100">
                《Loot Loop》遊戲指南與玩法規則
              </h2>
              <p className="text-xs text-slate-400">
                掌握幾何背包與相鄰連鎖，在無盡的巡航軌道中化身不滅傳奇！
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

        {/* Scrollable Guide Content */}
        <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-4 py-3 scrollbar-thin text-xs text-slate-300">
          {/* Section 1 */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex flex-col gap-2">
            <h3 className="font-bold text-sm text-amber-300 flex items-center gap-2">
              <span>⭕ 1. 循環軌道與探索機制</span>
            </h3>
            <p className="leading-relaxed text-slate-300">
              勇者會自動沿著閉環地圖前進。每踩一步都會消耗時間並前進到下一節點：
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              <li><strong className="text-amber-300">營地 (⛺)：</strong>抵達時回復 25 點 + 10% 最大生命，並完成整圈循環（怪物強度提升！）。</li>
              <li><strong className="text-rose-400">魔物 (👾/💀)：</strong>遭遇野怪或菁英，自動觸發即時回合戰鬥，擊殺後獲得戰利品與金幣。</li>
              <li><strong className="text-purple-400">寶箱 (💎)：</strong>免費開出多件戰利品掉入待領區。</li>
              <li><strong className="text-emerald-400">神龕 (⛩️) / 鐵砧 (⚒️)：</strong>賜予金幣祝福或鍛造贈送稀有寶石。</li>
              <li><strong className="text-amber-400">流浪商人 (🧙‍♂️)：</strong>暫停遊戲並開啟黑市商店，可購買強力裝備與背包空間擴充！</li>
            </ul>
          </div>

          {/* Section 2 */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex flex-col gap-2">
            <h3 className="font-bold text-sm text-sky-300 flex items-center gap-2">
              <RotateCw className="w-4 h-4 text-sky-400" />
              <span>2. 背包幾何空間與旋轉技巧</span>
            </h3>
            <p className="leading-relaxed text-slate-300">
              點擊物品拿起後，你可以隨時調整其朝向：
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-1">
              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                <span className="font-bold text-slate-200 block mb-1">🔄 裝備旋轉 (R / 右鍵)</span>
                <span>手持物品時，按鍵盤 <strong>「R」</strong> 或 <strong>點擊滑鼠右鍵</strong> 即可順時針 $90^\circ$ 旋轉（例如 $1\times2$ 轉為 $2\times1$）。</span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                <span className="font-bold text-slate-200 block mb-1">⏸️ 隨時暫停 (Space)</span>
                <span>按 <strong>空格鍵</strong> 暫停遊戲，從容不迫地思考背包整理與位置幾何！</span>
              </div>
            </div>
          </div>

          {/* Section 3 */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex flex-col gap-2">
            <h3 className="font-bold text-sm text-emerald-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>3. 相鄰連鎖協同 (Synergies) 攻略</span>
            </h3>
            <p className="leading-relaxed text-slate-300">
              裝備的擺放位置決定其真實實力！互相觸發時邊框將爆發耀眼金光：
            </p>
            <div className="space-y-1.5 text-slate-300 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
              <div>• <strong>重木盾 (2x2)：</strong>四面每相鄰 1 個裝備就獲得 +2 護甲。被包夾時可提供超高格擋！</div>
              <div>• <strong>鐵劍 (1x2)：</strong>每相鄰 1 把武器攻擊 +3，排成武器陣列輸出極高。</div>
              <div>• <strong>砥石 (1x1)：</strong>自身無攻擊，但會讓上下左右所有武器攻擊力額外 +4！</div>
              <div>• <strong>生命藥水 (1x1)：</strong>每步回血 3 點，若四週「完全無任何相鄰物品（孤立）」時回復量翻倍為 6 點！</div>
              <div>• <strong>刺客短匕 (1x1)：</strong>上方格為邊緣或空格時（背刺姿態），攻擊爆發 +5 且暴擊率 +15%。</div>
            </div>
          </div>

          {/* Section 4 */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex flex-col gap-2">
            <h3 className="font-bold text-sm text-yellow-300 flex items-center gap-2">
              <span>👑 4. 裝備稀有度與隨機詞綴系統</span>
            </h3>
            <p className="leading-relaxed text-slate-300">
              遊戲中裝備劃分為三種稀有度：
            </p>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-700">
                <span className="font-bold text-slate-300 block">普通 (Common)</span>
                <span className="text-[10px] text-slate-500">標準屬性</span>
              </div>
              <div className="p-2 rounded-xl bg-purple-950/40 border border-purple-500/50">
                <span className="font-bold text-purple-300 block">稀有 (Rare)</span>
                <span className="text-[10px] text-purple-400/80">1~2 條額外詞綴</span>
              </div>
              <div className="p-2 rounded-xl bg-amber-950/40 border border-amber-500/50">
                <span className="font-bold text-amber-300 block">傳說 (Legendary)</span>
                <span className="text-[10px] text-amber-400/80">滿額強效雙詞綴</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              詞綴如「鋒利的」(+20% 攻擊)、「嗜血的」(+12% 吸血)、「堅壁的」(+25% 護甲)、「神盾之御」(+5 防)，讓每件裝備都獨一無二。
            </p>
          </div>

          {/* Section 5 */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex flex-col gap-2">
            <h3 className="font-bold text-sm text-rose-300 flex items-center gap-2">
              <Swords className="w-4 h-4 text-rose-400" />
              <span>5. 自動戰鬥與戰鬥回放功能</span>
            </h3>
            <p className="leading-relaxed text-slate-300">
              遭遇魔物時系統將即時進行回合計算。戰鬥完成後，點擊頂部導航的「戰鬥回放」即可重新觀摩對決進程，掌握傷害吸收與暴擊時機！
            </p>
          </div>

          {/* Section 6: Durability & Repair System */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex flex-col gap-2">
            <h3 className="font-bold text-sm text-amber-300 flex items-center gap-2">
              <span>🔨 6. 裝備耐久度與修復維護系統</span>
            </h3>
            <p className="leading-relaxed text-slate-300">
              裝備並非永不磨損，激烈的戰鬥將考驗你的後勤維修意識：
            </p>
            <div className="space-y-1.5 text-slate-300 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
              <div>• <strong className="text-rose-400">耐久損耗：</strong>武器每次發動斬擊、盾牌與護甲每次格擋衝擊均會消耗 1 點耐久。</div>
              <div>• <strong className="text-red-400">破損懲罰：</strong>當裝備耐久耗盡降為 0，裝備會閃爍紅框並標註「已損壞」，其攻擊、護甲與生命加成<strong>效果將減半</strong>！</div>
              <div>• <strong className="text-amber-400">修理工具 (🧰 修復工具箱 / 🧴 符文保養油)：</strong>可直接使用或拿起後點擊受損裝備，立即修補 +25 ~ +50 點耐久。</div>
              <div>• <strong className="text-emerald-400">特定修復事件：</strong>
                <span className="block pl-3 text-slate-400 text-[11px] mt-0.5">
                  - <strong>營地 ⛺：</strong>抵達時全員裝備磨礪保養 +5 耐久。<br/>
                  - <strong>荒野鐵砧 ⚒️：</strong>大師鐵匠將全套裝備修復至 100% 滿耐久。<br/>
                  - <strong>流浪商人 🧙‍♂️：</strong>黑市提供花費 25 金幣「全套裝備修繕」服務！
                </span>
              </div>
            </div>
          </div>

          {/* Section 7: Custom Keybindings */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex flex-col gap-2">
            <h3 className="font-bold text-sm text-sky-300 flex items-center gap-2">
              <span>⌨️ 7. 自訂快捷鍵 (Keybindings)</span>
            </h3>
            <p className="leading-relaxed text-slate-300">
              點擊頂部導航欄的 <strong>「快捷鍵」</strong> 按鈕，即可自由綁定任意按鍵：
            </p>
            <div className="grid grid-cols-2 gap-2 text-slate-400 text-[11px]">
              <div>• 旋轉手持裝備：預設 <strong className="text-amber-300">R</strong> 或 右鍵</div>
              <div>• 暫停 / 恢復遊戲：預設 <strong className="text-amber-300">Space 空格</strong></div>
              <div>• 切換遊戲速度：預設 <strong className="text-amber-300">1 / 2 / 3</strong> 鍵</div>
              <div>• 一鍵自動填裝：預設 <strong className="text-amber-300">E</strong> 鍵</div>
              <div>• 隨時開啟圖鑑：預設 <strong className="text-amber-300">C</strong> 鍵</div>
              <div>• 隨時開啟成就：預設 <strong className="text-amber-300">A</strong> 鍵</div>
              <div>• 戰鬥回放：預設 <strong className="text-amber-300">V</strong> 鍵</div>
              <div>• 快捷鍵設定：預設 <strong className="text-amber-300">K</strong> 鍵</div>
            </div>
          </div>

          {/* Section 8: Presets */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex flex-col gap-2">
            <h3 className="font-bold text-sm text-indigo-300 flex items-center gap-2">
              <span>📁 8. 裝備預設組合 (Gear Presets)</span>
            </h3>
            <p className="leading-relaxed text-slate-300">
              在頂部點擊 <strong>「預設組合」</strong> 即可一鍵切換預設戰術配置或儲存當前背包：
            </p>
            <div className="flex flex-col gap-1 text-[11px] text-slate-400">
              <div>• <strong>一鍵儲存：</strong>將當前背包內所有神兵擺設、座標與詞綴存為自訂預設配置。</div>
              <div>• <strong>快速切換：</strong>遭遇不同強敵時，一鍵載入「狂戰士破甲流」、「聖騎堅壁流」、「吸血狂瀾流」或「幸運打寶流」等精選模板！</div>
              <div>• <strong>永久保存：</strong>所有自訂預設自動同步至本地儲存，重新整理網頁不遺失。</div>
            </div>
          </div>

          {/* Section 9: Active Skill Runes */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex flex-col gap-2">
            <h3 className="font-bold text-sm text-amber-300 flex items-center gap-2">
              <span>⚡ 9. 主動技能符文 (Active Skill Runes)</span>
            </h3>
            <p className="leading-relaxed text-slate-300">
              點擊 <strong>「技能符文」</strong> 可自由裝備 2 個強大主動技能，戰鬥時根據冷卻時間自動施放：
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-400">
              <div>• <strong>🛡️ 聖光神盾：</strong>生成最高 80 點吸收護盾抵擋傷害</div>
              <div>• <strong>⚡ 雷霆震擊：</strong>40 點雷電傷害並使魔物跳過回合眩暈</div>
              <div>• <strong>🔥 狂怒爆發：</strong>250% 暴擊真實傷害破甲重創</div>
              <div>• <strong>🌿 甘霖回春：</strong>回血 30% 並自動修復全套裝備耐久</div>
              <div>• <strong>🔮 奧術連彈：</strong>三連發 75 點無視防禦魔法純傷</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition"
          >
            我明白了，開始冒險！
          </button>
        </div>
      </div>
    </div>
  );
};
