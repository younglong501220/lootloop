import { TrackNode } from '../types/game';

// 12-14 Node Loop Circuit with clear landmarks, including the Wandering Merchant!
export const DEFAULT_TRACK_NODES: TrackNode[] = [
  { index: 0, x: 70,  y: 60,  type: 'camp',     name: '冒險者營地', subName: '恢復生命與整裝', icon: '⛺' },
  { index: 1, x: 160, y: 60,  type: 'road',     name: '寧靜林道', subName: '微風輕拂', icon: '🌲' },
  { index: 2, x: 250, y: 60,  type: 'monster',  name: '怪物斥候', subName: '潛伏的威脅', icon: '👾' },
  { index: 3, x: 340, y: 60,  type: 'shrine',   name: '古老神龕', subName: '受難者祈禱', icon: '⛩️' },
  { index: 4, x: 420, y: 100, type: 'merchant', name: '流浪商人', subName: '稀有裝備與空間擴充', icon: '🧙‍♂️' },
  { index: 5, x: 420, y: 180, type: 'monster',  name: '骨骸通道', subName: '死者聚集之處', icon: '💀' },
  { index: 6, x: 420, y: 260, type: 'chest',    name: '隱密寶箱', subName: '珍貴戰利品', icon: '💎' },
  { index: 7, x: 340, y: 310, type: 'monster',  name: '荒野狂獸', subName: '嗜血咆哮', icon: '🐺' },
  { index: 8, x: 250, y: 310, type: 'forge',    name: '野外鐵砧', subName: '重鑄與淬鍊', icon: '⚒️' },
  { index: 9, x: 160, y: 310, type: 'monster',  name: '強敵伏擊', subName: '菁英魔物駐守', icon: '👹' },
  { index: 10, x: 70, y: 310, type: 'chest',    name: '古代遺物庫', subName: '閃爍金光', icon: '📦' },
  { index: 11, x: 70, y: 180, type: 'road',     name: '歸鄉古徑', subName: '即將抵達營地', icon: '🛤️' },
];
