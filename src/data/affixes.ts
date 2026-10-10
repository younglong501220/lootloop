import { ItemAffix, ItemRarity } from '../types/game';

export const PREFIX_AFFIXES: ItemAffix[] = [
  {
    id: 'prefix_sharp_5',
    name: '精準的',
    description: '+5% 攻擊力',
    type: 'prefix',
    bonusAtkPct: 5
  },
  {
    id: 'prefix_sharp_10',
    name: '鋒利的',
    description: '+10% 攻擊力',
    type: 'prefix',
    bonusAtkPct: 10
  },
  {
    id: 'prefix_nimble_2',
    name: '靈動的',
    description: '+2% 閃避率',
    type: 'prefix',
    bonusDodge: 2
  },
  {
    id: 'prefix_phantom_5',
    name: '幻影的',
    description: '+5% 閃避率，+5% 暴擊率',
    type: 'prefix',
    bonusDodge: 5,
    bonusCrit: 5
  },
  {
    id: 'prefix_scavenger_10',
    name: '拾荒者的',
    description: '+10% 物品拾取範圍與尋寶',
    type: 'prefix',
    bonusLootFind: 10
  },
  {
    id: 'prefix_scavenger_20',
    name: '探秘者的',
    description: '+20% 物品拾取範圍與珍寶掉率',
    type: 'prefix',
    bonusLootFind: 20
  },
  {
    id: 'prefix_fortified',
    name: '堅壁的',
    description: '+15% 基礎護甲',
    type: 'prefix',
    bonusDefPct: 15
  },
  {
    id: 'prefix_bloodthirsty',
    name: '嗜血的',
    description: '+10% 吸血率',
    type: 'prefix',
    bonusLifesteal: 10
  },
  {
    id: 'prefix_deadly',
    name: '致命的',
    description: '+10% 暴擊率',
    type: 'prefix',
    bonusCrit: 10
  },
  {
    id: 'prefix_rejuvenating',
    name: '滋養的',
    description: '+3 步履生命回復',
    type: 'prefix',
    bonusRegen: 3
  },
  {
    id: 'prefix_colossal',
    name: '泰坦之重',
    description: '+25 最大生命上限',
    type: 'prefix',
    bonusHp: 25
  }
];

export const SUFFIX_AFFIXES: ItemAffix[] = [
  {
    id: 'suffix_swift_dodge',
    name: '迅捷之風',
    description: '+3% 閃避率',
    type: 'suffix',
    bonusDodge: 3
  },
  {
    id: 'suffix_magnet_loot',
    name: '磁石引力',
    description: '+15% 物品拾取範圍與額外金幣',
    type: 'suffix',
    bonusLootFind: 15,
    bonusGoldPct: 15
  },
  {
    id: 'suffix_destruction',
    name: '破滅之印',
    description: '+4 點實體攻擊力',
    type: 'suffix',
    bonusAtk: 4
  },
  {
    id: 'suffix_aegis',
    name: '神盾之御',
    description: '+4 點實體護甲值',
    type: 'suffix',
    bonusDef: 4
  },
  {
    id: 'suffix_fury',
    name: '狂戰怒焰',
    description: '+8% 暴擊率，+2 攻擊',
    type: 'suffix',
    bonusCrit: 8,
    bonusAtk: 2
  },
  {
    id: 'suffix_vitality',
    name: '不息之生',
    description: '+15 生命上限，+2 每步回復',
    type: 'suffix',
    bonusHp: 15,
    bonusRegen: 2
  },
  {
    id: 'suffix_leech',
    name: '暗影汲取',
    description: '+12% 吸血率',
    type: 'suffix',
    bonusLifesteal: 12
  }
];

// Rolls affixes based on rarity - every item receives at least 1 affix!
export function rollAffixesForRarity(rarity: ItemRarity): { affixes: ItemAffix[]; fullNameModifier: { prefix?: string; suffix?: string } } {
  const p = PREFIX_AFFIXES[Math.floor(Math.random() * PREFIX_AFFIXES.length)];

  if (rarity === 'common') {
    // Common items get 1 prefix
    return { affixes: [p], fullNameModifier: { prefix: p.name } };
  }

  if (rarity === 'rare') {
    // Rare items get 1 prefix and 50% chance of suffix
    if (Math.random() < 0.5) {
      const s = SUFFIX_AFFIXES[Math.floor(Math.random() * SUFFIX_AFFIXES.length)];
      return { affixes: [p, s], fullNameModifier: { prefix: p.name, suffix: `·${s.name}` } };
    }
    return { affixes: [p], fullNameModifier: { prefix: p.name } };
  }

  // Legendary: always gets 2 affixes (1 prefix + 1 suffix)
  const s = SUFFIX_AFFIXES[Math.floor(Math.random() * SUFFIX_AFFIXES.length)];
  return { affixes: [p, s], fullNameModifier: { prefix: p.name, suffix: `·${s.name}` } };
}

export function rollRandomRarity(bonusLootFind = 0): ItemRarity {
  // bonusLootFind increases chance of rare & legendary drops
  const bonus = Math.min(25, bonusLootFind * 0.5);
  const roll = Math.random() * 100 - bonus;
  if (roll < 50) return 'common';
  if (roll < 82) return 'rare';
  return 'legendary';
}

export interface AffixStatRange {
  statKey: string;
  name: string;
  icon: string;
  category: 'attack' | 'defense' | 'sustain' | 'utility';
  rangeText: string;
  minValue: number;
  maxValue: number;
  isPercent: boolean;
  unit: string;
  exampleAffixes: string[];
  explanation: string;
}

export const AFFIX_STAT_RANGES: AffixStatRange[] = [
  {
    statKey: 'bonusAtk',
    name: '實體攻擊力',
    icon: '⚔️',
    category: 'attack',
    rangeText: '+2 ~ +4 點',
    minValue: 2,
    maxValue: 4,
    isPercent: false,
    unit: '點',
    exampleAffixes: ['破滅之印 (+4)', '狂戰怒焰 (+2)'],
    explanation: '直接增加勇者每次普通攻擊與技能結算的實體基礎傷害'
  },
  {
    statKey: 'bonusAtkPct',
    name: '攻擊力增幅',
    icon: '🗡️',
    category: 'attack',
    rangeText: '+5% ~ +10%',
    minValue: 5,
    maxValue: 10,
    isPercent: true,
    unit: '%',
    exampleAffixes: ['精準的 (+5%)', '鋒利的 (+10%)'],
    explanation: '基於全身武器與裝備總攻擊力進行百分比放大'
  },
  {
    statKey: 'bonusDef',
    name: '實體護甲值',
    icon: '🛡️',
    category: 'defense',
    rangeText: '+4 點',
    minValue: 4,
    maxValue: 4,
    isPercent: false,
    unit: '點',
    exampleAffixes: ['神盾之御 (+4)'],
    explanation: '直接抵擋每次魔物近戰或技能攻擊的固定傷害'
  },
  {
    statKey: 'bonusDefPct',
    name: '護甲百分比',
    icon: '🦺',
    category: 'defense',
    rangeText: '+15%',
    minValue: 15,
    maxValue: 15,
    isPercent: true,
    unit: '%',
    exampleAffixes: ['堅壁的 (+15%)'],
    explanation: '大幅強化背包中所有護甲、盾牌的總防禦吸收量'
  },
  {
    statKey: 'bonusCrit',
    name: '致命暴擊率',
    icon: '⚡',
    category: 'attack',
    rangeText: '+5% ~ +10%',
    minValue: 5,
    maxValue: 10,
    isPercent: true,
    unit: '%',
    exampleAffixes: ['幻影的 (+5%)', '狂戰怒焰 (+8%)', '致命的 (+10%)'],
    explanation: '觸發時造成雙倍或更高暴擊重創傷害'
  },
  {
    statKey: 'bonusDodge',
    name: '身法閃避率',
    icon: '💨',
    category: 'defense',
    rangeText: '+2% ~ +5%',
    minValue: 2,
    maxValue: 5,
    isPercent: true,
    unit: '%',
    exampleAffixes: ['靈動的 (+2%)', '迅捷之風 (+3%)', '幻影的 (+5%)'],
    explanation: '受到魔物普通與強力攻擊時完全免受傷害的機率'
  },
  {
    statKey: 'bonusLifesteal',
    name: '攻擊吸血率',
    icon: '🩸',
    category: 'sustain',
    rangeText: '+10% ~ +12%',
    minValue: 10,
    maxValue: 12,
    isPercent: true,
    unit: '%',
    exampleAffixes: ['嗜血的 (+10%)', '暗影汲取 (+12%)'],
    explanation: '每次對魔物造成實體傷害時，轉換為自身生命回復'
  },
  {
    statKey: 'bonusHp',
    name: '生命上限提升',
    icon: '❤️',
    category: 'sustain',
    rangeText: '+15 ~ +25 點',
    minValue: 15,
    maxValue: 25,
    isPercent: false,
    unit: '點',
    exampleAffixes: ['不息之生 (+15)', '泰坦之重 (+25)'],
    explanation: '擴充勇者生命槽最大上限，提升高循環容錯率'
  },
  {
    statKey: 'bonusRegen',
    name: '步履生命回復',
    icon: '🌿',
    category: 'sustain',
    rangeText: '+2 ~ +3 點/步',
    minValue: 2,
    maxValue: 3,
    isPercent: false,
    unit: '點/步',
    exampleAffixes: ['不息之生 (+2)', '滋養的 (+3)'],
    explanation: '在循環軌道上每前進一個節點自動回復的生命值'
  },
  {
    statKey: 'bonusLootFind',
    name: '尋寶與拾取範圍',
    icon: '🧲',
    category: 'utility',
    rangeText: '+10% ~ +20%',
    minValue: 10,
    maxValue: 20,
    isPercent: true,
    unit: '%',
    exampleAffixes: ['拾荒者的 (+10%)', '磁石引力 (+15%)', '探秘者的 (+20%)'],
    explanation: '提升戰利品掉落時出現稀有與傳奇裝備的機率'
  },
  {
    statKey: 'bonusGoldPct',
    name: '額外金幣加成',
    icon: '🪙',
    category: 'utility',
    rangeText: '+15%',
    minValue: 15,
    maxValue: 15,
    isPercent: true,
    unit: '%',
    exampleAffixes: ['磁石引力 (+15%)'],
    explanation: '擊殺魔物或獲得神龕賜福時的額外金幣獎勵百分比'
  }
];
