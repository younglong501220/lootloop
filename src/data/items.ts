import { ItemTemplate, SynergyContext, SynergyResult } from '../types/game';

export const ITEM_TEMPLATES: ItemTemplate[] = [
  // 1. 鐵劍 (Iron Sword) - 1x2
  {
    id: 'iron_sword',
    name: '鐵劍',
    type: 'weapon',
    rarity: 'common',
    w: 1,
    h: 2,
    shape: [
      [1],
      [1]
    ],
    icon: '🗡️',
    color: '#2d3748',
    borderColor: '#60a5fa',
    baseAtk: 4,
    baseDef: 0,
    maxDurability: 35,
    desc: '標準鋒利雙手鐵劍，提供穩健的斬擊威力。',
    synergyDesc: '【軍械連攜】：每相鄰 1 個【武器】，攻擊力 +3。',
    evaluateSynergy: (ctx: SynergyContext): SynergyResult => {
      const neighborWeapons = ctx.neighbors.filter(n => n.type === 'weapon' && n.instanceId !== ctx.item.instanceId);
      const bonus = neighborWeapons.length * 3;
      return {
        active: neighborWeapons.length > 0,
        bonusAtk: bonus,
        message: neighborWeapons.length > 0 ? `與 ${neighborWeapons.length} 個武器相鄰，攻擊 +${bonus}` : undefined,
        targetNeighborIds: neighborWeapons.map(n => n.instanceId)
      };
    }
  },

  // 2. 重木盾 (Heavy Wooden Shield) - 2x2
  {
    id: 'wooden_shield',
    name: '重木盾',
    type: 'shield',
    rarity: 'common',
    w: 2,
    h: 2,
    shape: [
      [1, 1],
      [1, 1]
    ],
    icon: '🛡️',
    color: '#3d2b1f',
    borderColor: '#4ade80',
    baseAtk: 0,
    baseDef: 6,
    maxDurability: 45,
    desc: '堅實厚重的粗橡木圓盾，提供龐大的格擋面積。',
    synergyDesc: '【環形陣列】：四面包夾時極其堅固，每相鄰 1 個任何裝備，護甲 +2。',
    evaluateSynergy: (ctx: SynergyContext): SynergyResult => {
      const distinctNeighbors = ctx.neighbors.filter(n => n.instanceId !== ctx.item.instanceId);
      const bonus = distinctNeighbors.length * 2;
      return {
        active: distinctNeighbors.length > 0,
        bonusDef: bonus,
        message: distinctNeighbors.length > 0 ? `與 ${distinctNeighbors.length} 個裝備相鄰，護甲 +${bonus}` : undefined,
        targetNeighborIds: distinctNeighbors.map(n => n.instanceId)
      };
    }
  },

  // 3. 砥石 (Whetstone) - 1x1
  {
    id: 'whetstone',
    name: '砥石',
    type: 'accessory',
    rarity: 'rare',
    w: 1,
    h: 1,
    shape: [
      [1]
    ],
    icon: '🪨',
    color: '#334155',
    borderColor: '#f59e0b',
    baseAtk: 0,
    baseDef: 0,
    maxDurability: 40,
    desc: '矮人研磨石，本身無攻擊力，但能大幅磨礪相鄰刀鋒。',
    synergyDesc: '【精工研磨】：使上下左右相鄰的所有【武器】攻擊力額外 +4。',
    evaluateSynergy: (ctx: SynergyContext): SynergyResult => {
      const neighborWeapons = ctx.neighbors.filter(n => n.type === 'weapon');
      return {
        active: neighborWeapons.length > 0,
        bonusAtk: 0,
        message: neighborWeapons.length > 0 ? `正磨礪 ${neighborWeapons.length} 把相鄰武器 (+4 攻擊)` : undefined,
        targetNeighborIds: neighborWeapons.map(n => n.instanceId)
      };
    }
  },

  // 4. 生命藥水 (Health Potion) - 1x1
  {
    id: 'health_potion',
    name: '生命藥水',
    type: 'potion',
    rarity: 'common',
    w: 1,
    h: 1,
    shape: [
      [1]
    ],
    icon: '🧪',
    color: '#4c1d24',
    borderColor: '#f43f5e',
    baseAtk: 0,
    baseDef: 0,
    stepRegen: 3,
    maxDurability: 99,
    desc: '蘊含草藥精華的藥劑，每移動 1 格恢復 3 點生命。',
    synergyDesc: '【安靜發酵】：若四週「完全無任何相鄰物品」，每步回復量翻倍為 6 點。',
    evaluateSynergy: (ctx: SynergyContext): SynergyResult => {
      const isolated = ctx.neighbors.length === 0;
      return {
        active: isolated,
        bonusRegen: isolated ? 3 : 0,
        message: isolated ? '四週無雜物干擾，回復翻倍為 6 點/步！' : undefined
      };
    }
  },

  // 5. 刺客短匕 (Assassin Dagger) - 1x1
  {
    id: 'assassin_dagger',
    name: '刺客短匕',
    type: 'weapon',
    rarity: 'rare',
    w: 1,
    h: 1,
    shape: [
      [1]
    ],
    icon: '🔪',
    color: '#1e1b4b',
    borderColor: '#c084fc',
    baseAtk: 3,
    baseDef: 0,
    critChance: 10,
    maxDurability: 30,
    desc: '輕巧無聲的淬毒暗殺短刃，擅長偷襲背刺。',
    synergyDesc: '【暗影背刺】：若此匕首上方「完全為空格或邊界」，暴擊爆發攻擊 +5。',
    evaluateSynergy: (ctx: SynergyContext): SynergyResult => {
      const r = ctx.item.gridR;
      const c = ctx.item.gridC;
      const topRow = r - 1;
      const topEmpty = topRow < 0 || ctx.grid[topRow][c] === null;
      return {
        active: topEmpty,
        bonusAtk: topEmpty ? 5 : 0,
        bonusCrit: topEmpty ? 15 : 0,
        message: topEmpty ? '上方通暢背刺，攻擊 +5，暴擊率 +15%' : undefined
      };
    }
  },

  // 6. 荊棘護甲 (Spiked Armor) - 2x1
  {
    id: 'spiked_armor',
    name: '荊棘護甲',
    type: 'armor',
    rarity: 'rare',
    w: 2,
    h: 1,
    shape: [
      [1, 1]
    ],
    icon: '🦺',
    color: '#1c3426',
    borderColor: '#2dd4bf',
    baseAtk: 1,
    baseDef: 3,
    maxDurability: 45,
    desc: '鑲滿倒刺的硬化皮甲，攻守兼備。',
    synergyDesc: '【荊棘壁壘】：只要相鄰有任何【盾牌】，護甲額外 +5，反傷攻擊 +2。',
    evaluateSynergy: (ctx: SynergyContext): SynergyResult => {
      const shieldNeighbors = ctx.neighbors.filter(n => n.type === 'shield' && n.instanceId !== ctx.item.instanceId);
      return {
        active: shieldNeighbors.length > 0,
        bonusDef: shieldNeighbors.length > 0 ? 5 : 0,
        bonusAtk: shieldNeighbors.length > 0 ? 2 : 0,
        message: shieldNeighbors.length > 0 ? '依託盾牌結陣，護甲 +5，攻擊 +2' : undefined,
        targetNeighborIds: shieldNeighbors.map(s => s.instanceId)
      };
    }
  },

  // 7. 吸血鬼尖牙 (Vampire Fang) - 1x1
  {
    id: 'vampire_fang',
    name: '吸血鬼尖牙',
    type: 'accessory',
    rarity: 'rare',
    w: 1,
    h: 1,
    shape: [
      [1]
    ],
    icon: '🧛',
    color: '#450a0a',
    borderColor: '#ef4444',
    baseAtk: 1,
    baseDef: 0,
    lifesteal: 15,
    maxDurability: 40,
    desc: '猩紅伯爵遺留的古老尖牙，每次攻擊吸收生命。',
    synergyDesc: '【血之渴望】：相鄰每有 1 把【武器】，吸血率額外 +10%，攻擊 +2。',
    evaluateSynergy: (ctx: SynergyContext): SynergyResult => {
      const weapons = ctx.neighbors.filter(n => n.type === 'weapon');
      const bonusLifesteal = weapons.length * 10;
      const bonusAtk = weapons.length * 2;
      return {
        active: weapons.length > 0,
        bonusLifesteal,
        bonusAtk,
        message: weapons.length > 0 ? `為武器賦予嗜血！吸血 +${bonusLifesteal}%，攻擊 +${bonusAtk}` : undefined,
        targetNeighborIds: weapons.map(w => w.instanceId)
      };
    }
  },

  // 8. 狂戰雙手斧 (Berserker Greataxe) - 2x2
  {
    id: 'berserker_axe',
    name: '狂戰雙手斧',
    type: 'weapon',
    rarity: 'legendary',
    w: 2,
    h: 2,
    shape: [
      [1, 1],
      [1, 0]
    ],
    icon: '🪓',
    color: '#3b0764',
    borderColor: '#d946ef',
    baseAtk: 10,
    baseDef: 0,
    critChance: 20,
    maxDurability: 35,
    desc: '沉重無比的巨大斬斧，揮動時帶起呼嘯狂風。',
    synergyDesc: '【魯莽狂怒】：若相鄰「完全沒有盾牌」，狂怒爆發：攻擊力 +8！',
    evaluateSynergy: (ctx: SynergyContext): SynergyResult => {
      const hasShield = ctx.neighbors.some(n => n.type === 'shield');
      const noShield = !hasShield;
      return {
        active: noShield,
        bonusAtk: noShield ? 8 : 0,
        message: noShield ? '拋棄盾牌純粹輸出！狂怒攻擊 +8' : '受到盾牌束縛，未能完全狂化'
      };
    }
  },

  // 9. 秘銀長弓 (Mithril Bow) - 1x3
  {
    id: 'mithril_bow',
    name: '秘銀長弓',
    type: 'weapon',
    rarity: 'rare',
    w: 1,
    h: 3,
    shape: [
      [1],
      [1],
      [1]
    ],
    icon: '🏹',
    color: '#064e3b',
    borderColor: '#10b981',
    baseAtk: 6,
    baseDef: 0,
    critChance: 20,
    maxDurability: 40,
    desc: '精靈古木與秘銀揉合打造的修長戰弓。',
    synergyDesc: '【遠程狙擊】：每相鄰 1 個【飾品】，暴擊率 +15%，攻擊 +3。',
    evaluateSynergy: (ctx: SynergyContext): SynergyResult => {
      const accessories = ctx.neighbors.filter(n => n.type === 'accessory');
      const bonusCrit = accessories.length * 15;
      const bonusAtk = accessories.length * 3;
      return {
        active: accessories.length > 0,
        bonusCrit,
        bonusAtk,
        message: accessories.length > 0 ? `精準校準！暴擊 +${bonusCrit}%，攻擊 +${bonusAtk}` : undefined,
        targetNeighborIds: accessories.map(a => a.instanceId)
      };
    }
  },

  // 10. 獵人箭袋 (Hunter Quiver) - 1x2
  {
    id: 'hunter_quiver',
    name: '獵人箭袋',
    type: 'accessory',
    rarity: 'common',
    w: 1,
    h: 2,
    shape: [
      [1],
      [1]
    ],
    icon: '🎯',
    color: '#713f12',
    borderColor: '#eab308',
    baseAtk: 1,
    baseDef: 1,
    maxDurability: 40,
    desc: '填滿淬毒黑羽箭矢的箭袋，能源源不絕供應彈藥。',
    synergyDesc: '【箭雨裝填】：相鄰每把【武器】攻擊力 +3。',
    evaluateSynergy: (ctx: SynergyContext): SynergyResult => {
      const weapons = ctx.neighbors.filter(n => n.type === 'weapon');
      return {
        active: weapons.length > 0,
        bonusAtk: 0,
        message: weapons.length > 0 ? `為 ${weapons.length} 把武器補給箭雨 (+3 攻擊)` : undefined,
        targetNeighborIds: weapons.map(w => w.instanceId)
      };
    }
  },

  // 11. 聖光十字架 (Holy Crucifix) - 2x2
  {
    id: 'holy_crucifix',
    name: '聖光十字架',
    type: 'relic',
    rarity: 'legendary',
    w: 2,
    h: 2,
    shape: [
      [0, 1],
      [1, 1]
    ],
    icon: '✝️',
    color: '#422006',
    borderColor: '#facc15',
    baseAtk: 2,
    baseDef: 4,
    baseMaxHp: 25,
    maxDurability: 60,
    desc: '大主教受膏的神聖護符，驅散陰霾與暗夜恐懼。',
    synergyDesc: '【神聖庇佑】：每相鄰 1 個物品，最大生命上限 +10，護甲 +2。',
    evaluateSynergy: (ctx: SynergyContext): SynergyResult => {
      const count = ctx.neighbors.length;
      return {
        active: count > 0,
        bonusHp: count * 10,
        bonusDef: count * 2,
        message: count > 0 ? `聖光賜福周遭！生命上限 +${count * 10}，護甲 +${count * 2}` : undefined,
        targetNeighborIds: ctx.neighbors.map(n => n.instanceId)
      };
    }
  },

  // 12. 熔岩火石 (Magma Core) - 1x1
  {
    id: 'magma_core',
    name: '熔岩火核',
    type: 'gem',
    rarity: 'legendary',
    w: 1,
    h: 1,
    shape: [
      [1]
    ],
    icon: '🔥',
    color: '#7c2d12',
    borderColor: '#fb923c',
    baseAtk: 4,
    baseDef: 0,
    maxDurability: 99,
    desc: '地底深處凝結的高熱火核，散發灼熱烈焰。',
    synergyDesc: '【烈火附魔】：使相鄰所有【武器】攻擊力 +5，並在戰鬥中灼燒敵人。',
    evaluateSynergy: (ctx: SynergyContext): SynergyResult => {
      const weapons = ctx.neighbors.filter(n => n.type === 'weapon');
      return {
        active: weapons.length > 0,
        bonusAtk: 0,
        message: weapons.length > 0 ? `烈焰熔鑄 ${weapons.length} 把武器 (+5 攻擊)` : undefined,
        targetNeighborIds: weapons.map(w => w.instanceId)
      };
    }
  },

  // 13. 守護巨塔盾 (Tower Shield) - 2x3
  {
    id: 'tower_shield',
    name: '守護巨塔盾',
    type: 'shield',
    rarity: 'rare',
    w: 2,
    h: 3,
    shape: [
      [1, 1],
      [1, 1],
      [1, 1]
    ],
    icon: '🏰',
    color: '#1e293b',
    borderColor: '#38bdf8',
    baseAtk: 0,
    baseDef: 16,
    baseMaxHp: 25,
    maxDurability: 55,
    desc: '如同城牆般高大的鋼鐵巨塔盾，提供絕對的防禦領域。',
    synergyDesc: '【固若金湯】：若左側或右側緊鄰背包邊緣，護甲額外 +10。',
    evaluateSynergy: (ctx: SynergyContext): SynergyResult => {
      const isAtEdge = ctx.item.gridC === 0 || (ctx.item.gridC + ctx.item.w) === ctx.gridSize;
      return {
        active: isAtEdge,
        bonusDef: isAtEdge ? 10 : 0,
        message: isAtEdge ? '依託背包側壁立起城防！護甲 +10' : undefined
      };
    }
  },

  // 14. 幸運金骰 (Lucky Golden Dice) - 1x1
  {
    id: 'golden_dice',
    name: '幸運金骰',
    type: 'relic',
    rarity: 'rare',
    w: 1,
    h: 1,
    shape: [
      [1]
    ],
    icon: '🎲',
    color: '#854d0e',
    borderColor: '#fde047',
    baseAtk: 1,
    baseDef: 1,
    critChance: 15,
    maxDurability: 50,
    desc: '命運女神眷顧的鍍金骰子，常帶來不可思議的好運。',
    synergyDesc: '【命運雙骰】：每有一面為空（相鄰無物品之空側），暴擊率 +8%。',
    evaluateSynergy: (ctx: SynergyContext): SynergyResult => {
      const totalPossible = 4;
      const occupiedDirect = ctx.directNeighbors.top.length + ctx.directNeighbors.bottom.length +
                             ctx.directNeighbors.left.length + ctx.directNeighbors.right.length;
      const freeSides = Math.max(0, totalPossible - occupiedDirect);
      const bonusCrit = freeSides * 8;
      return {
        active: freeSides > 0,
        bonusCrit,
        message: freeSides > 0 ? `有 ${freeSides} 個開闊自由面，暴擊率 +${bonusCrit}%` : undefined
      };
    }
  },

  // 15. 劇毒腺體 (Venom Sac) - 1x1
  {
    id: 'venom_sac',
    name: '劇毒腺體',
    type: 'accessory',
    rarity: 'rare',
    w: 1,
    h: 1,
    shape: [
      [1]
    ],
    icon: '🧪',
    color: '#14532d',
    borderColor: '#84cc16',
    baseAtk: 2,
    baseDef: 0,
    maxDurability: 40,
    desc: '沼澤毒蟒的心臟腺體，滴落著腐蝕劇毒。',
    synergyDesc: '【淬毒之刃】：使相鄰的【武器】攻擊力 +3，暴擊率 +10%。',
    evaluateSynergy: (ctx: SynergyContext): SynergyResult => {
      const weapons = ctx.neighbors.filter(n => n.type === 'weapon');
      return {
        active: weapons.length > 0,
        bonusAtk: 0,
        message: weapons.length > 0 ? `為 ${weapons.length} 把武器塗毒 (+3 攻, +10% 暴擊)` : undefined,
        targetNeighborIds: weapons.map(w => w.instanceId)
      };
    }
  },

  // 16. 工匠修復工具箱 (Repair Kit) - 1x1 [TOOL]
  {
    id: 'repair_kit',
    name: '修復工具箱',
    type: 'tool',
    rarity: 'common',
    w: 1,
    h: 1,
    shape: [
      [1]
    ],
    icon: '🧰',
    color: '#3b2f2f',
    borderColor: '#fbbf24',
    baseAtk: 0,
    baseDef: 0,
    maxDurability: 3, // Can be used 3 times
    isRepairTool: true,
    repairPower: 25,
    desc: '便攜式鐵匠維修工具包。在背包或托盤中點擊使用，可修復破損受損裝備 +25 點耐久度！',
    synergyDesc: '【戰場維修】：相鄰裝備每完成一次戰鬥額外恢復 2 點耐久度。',
    evaluateSynergy: (ctx: SynergyContext): SynergyResult => {
      return {
        active: ctx.neighbors.length > 0,
        message: '為相鄰裝備提供戰場整備維護'
      };
    }
  },

  // 17. 符文保養潤滑油 (Rune Polish) - 1x1 [TOOL]
  {
    id: 'rune_polish',
    name: '符文保養油',
    type: 'tool',
    rarity: 'rare',
    w: 1,
    h: 1,
    shape: [
      [1]
    ],
    icon: '🧴',
    color: '#1e3a5f',
    borderColor: '#60a5fa',
    baseAtk: 0,
    baseDef: 0,
    maxDurability: 2, // 2 uses
    isRepairTool: true,
    repairPower: 50,
    desc: '矮人秘傳符文淬火油。使用後徹底修復一件裝備 +50 點耐久度，令破損裝備神采奕奕！',
    synergyDesc: '【油膜防護】：相鄰裝備的耐久損耗速度降低 50%。',
    evaluateSynergy: (ctx: SynergyContext): SynergyResult => {
      return {
        active: ctx.neighbors.length > 0,
        message: '相鄰裝備獲得油膜保護'
      };
    }
  }
];

export function getItemTemplate(id: string): ItemTemplate {
  const found = ITEM_TEMPLATES.find(t => t.id === id);
  if (!found) return ITEM_TEMPLATES[0];
  return found;
}
