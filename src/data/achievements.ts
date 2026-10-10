import { Achievement } from '../types/game';

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_blood',
    title: '初入荒野',
    description: '成功擊殺第 1 隻魔物',
    icon: '🗡️',
    goldReward: 15,
    isUnlocked: false,
    progress: 0,
    maxProgress: 1
  },
  {
    id: 'monster_slayer_50',
    title: '魔物屠戮者',
    description: '累計擊殺 50 隻魔物',
    icon: '💀',
    goldReward: 60,
    isUnlocked: false,
    progress: 0,
    maxProgress: 50
  },
  {
    id: 'backpack_packrat_90',
    title: '收納極致',
    description: '背包格子利用率達到 90% 以上',
    icon: '🎒',
    goldReward: 40,
    isUnlocked: false,
    progress: 0,
    maxProgress: 90
  },
  {
    id: 'reach_loop_10',
    title: '循環漫遊者',
    description: '勇者堅毅前行，達成第 10 圈循環',
    icon: '⭕',
    goldReward: 100,
    isUnlocked: false,
    progress: 0,
    maxProgress: 10
  },
  {
    id: 'synergy_master_3',
    title: '幾何連鎖大師',
    description: '背包內同時激活至少 3 個相鄰協同連鎖',
    icon: '✨',
    goldReward: 35,
    isUnlocked: false,
    progress: 0,
    maxProgress: 3
  },
  {
    id: 'gold_hoarder_150',
    title: '小富翁',
    description: '持有金幣累計達到 150 G 以上',
    icon: '💰',
    goldReward: 50,
    isUnlocked: false,
    progress: 0,
    maxProgress: 150
  },
  {
    id: 'legendary_gear',
    title: '神兵天降',
    description: '背包中成功裝備至少 1 件【傳說】稀有度裝備',
    icon: '👑',
    goldReward: 45,
    isUnlocked: false,
    progress: 0,
    maxProgress: 1
  },
  {
    id: 'boss_slayer',
    title: '宿命征服',
    description: '成功斬殺強大的領主魔物 (BOSS)',
    icon: '🐲',
    goldReward: 80,
    isUnlocked: false,
    progress: 0,
    maxProgress: 1
  },
  {
    id: 'backpack_expanded',
    title: '隨身乾坤',
    description: '在流浪商人處成功擴充背包空間',
    icon: '🧰',
    goldReward: 40,
    isUnlocked: false,
    progress: 0,
    maxProgress: 1
  }
];
