import { PlacedItemInstance, SynergyContext, SynergyResult, ItemRarity, ItemAffix, InventoryItem } from '../types/game';
import { getItemTemplate } from '../data/items';
import { rollRandomRarity, rollAffixesForRarity } from '../data/affixes';

let globalInstanceCounter = 1;

export function createItemInstance(
  templateId: string,
  rarityOverride?: ItemRarity,
  customAffixes?: ItemAffix[]
): PlacedItemInstance {
  const t = getItemTemplate(templateId);
  const rarity = rarityOverride || rollRandomRarity();
  
  let affixes = customAffixes;
  let name = t.name;

  if (!affixes) {
    const rollRes = rollAffixesForRarity(rarity);
    affixes = rollRes.affixes;
    const prefixStr = rollRes.fullNameModifier.prefix ? `${rollRes.fullNameModifier.prefix} ` : '';
    const suffixStr = rollRes.fullNameModifier.suffix ? `${rollRes.fullNameModifier.suffix}` : '';
    name = `${prefixStr}${t.name}${suffixStr}`;
  }

  // Border & Color tweaks based on rarity
  let borderColor = t.borderColor;
  if (rarity === 'legendary') {
    borderColor = '#f59e0b'; // Radiant Gold
  } else if (rarity === 'rare') {
    borderColor = '#a855f7'; // Purple / Blue
  }

  return {
    instanceId: `item_${globalInstanceCounter++}_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    templateId: t.id,
    name,
    baseName: t.name,
    type: t.type,
    rarity,
    w: t.w,
    h: t.h,
    shape: JSON.parse(JSON.stringify(t.shape)),
    icon: t.icon,
    color: t.color,
    borderColor,
    baseAtk: t.baseAtk,
    baseDef: t.baseDef,
    baseMaxHp: t.baseMaxHp || 0,
    stepRegen: t.stepRegen || 0,
    lifesteal: t.lifesteal || 0,
    critChance: t.critChance || 0,
    desc: t.desc,
    synergyDesc: t.synergyDesc,
    gridR: 0,
    gridC: 0,
    maxDurability: t.maxDurability || 35,
    currentDurability: t.maxDurability || 35,
    isBroken: false,
    isRepairTool: t.isRepairTool || false,
    repairPower: t.repairPower || 25,
    affixes: affixes || [],
    bonusAtk: 0,
    bonusDef: 0,
    bonusHp: 0,
    bonusRegen: 0,
    bonusLifesteal: 0,
    bonusCrit: 0,
    bonusDodge: 0,
    bonusLootFind: 0,
    isSynergyActive: false,
    linkedInstanceIds: []
  };
}

export function rotateShape(shape: number[][], w: number, h: number): { newShape: number[][]; newW: number; newH: number } {
  const newH = w;
  const newW = h;
  const newShape: number[][] = Array(newH).fill(0).map(() => Array(newW).fill(0));

  for (let r = 0; r < h; r++) {
    for (let c = 0; c < w; c++) {
      newShape[c][h - 1 - r] = shape[r][c];
    }
  }

  return { newShape, newW, newH };
}

export function canPlaceItem(
  item: { w: number; h: number; shape: number[][] },
  startR: number,
  startC: number,
  grid: (PlacedItemInstance | null)[][],
  gridSize: number,
  ignoreInstanceId?: string
): boolean {
  if (startR < 0 || startC < 0) return false;
  if (startR + item.h > gridSize || startC + item.w > gridSize) return false;

  for (let r = 0; r < item.h; r++) {
    for (let c = 0; c < item.w; c++) {
      if (item.shape[r][c] === 1) {
        const cell = grid[startR + r][startC + c];
        if (cell !== null && cell.instanceId !== ignoreInstanceId) {
          return false;
        }
      }
    }
  }

  return true;
}

export function buildGrid(items: PlacedItemInstance[], gridSize: number): (PlacedItemInstance | null)[][] {
  const grid: (PlacedItemInstance | null)[][] = Array(gridSize)
    .fill(null)
    .map(() => Array(gridSize).fill(null));

  for (const item of items) {
    for (let r = 0; r < item.h; r++) {
      for (let c = 0; c < item.w; c++) {
        if (item.shape[r][c] === 1) {
          const targetR = item.gridR + r;
          const targetC = item.gridC + c;
          if (targetR >= 0 && targetR < gridSize && targetC >= 0 && targetC < gridSize) {
            grid[targetR][targetC] = item;
          }
        }
      }
    }
  }

  return grid;
}

// Calculate the percentage of occupied cells in the backpack (0 - 100)
export function getBackpackFillRate(items: PlacedItemInstance[], gridSize: number): number {
  const totalCells = gridSize * gridSize;
  let occupied = 0;
  for (const item of items) {
    for (let r = 0; r < item.h; r++) {
      for (let c = 0; c < item.w; c++) {
        if (item.shape[r][c] === 1) {
          occupied++;
        }
      }
    }
  }
  return Math.min(100, Math.round((occupied / totalCells) * 100));
}

// Estimate merchant price
export function calculateItemPrice(item: PlacedItemInstance | InventoryItem): number {
  let basePrice = 20;
  if (item.rarity === 'rare') basePrice = 45;
  if (item.rarity === 'legendary') basePrice = 85;

  const statWorth = (item.baseAtk * 4) + (item.baseDef * 3) + ((item.baseMaxHp || 0) * 1.5) + (item.affixes.length * 15);
  return Math.max(15, Math.round(basePrice + statWorth));
}

export function calculateSynergies(
  placedItems: PlacedItemInstance[],
  gridSize: number,
  baseStats: { baseAtk: number; baseDef: number }
): {
  totalAtk: number;
  totalDef: number;
  maxHpBonus: number;
  stepRegen: number;
  lifesteal: number;
  critChance: number;
  dodgeRate: number;
  lootFindPct: number;
  activeSynergiesCount: number;
  updatedItems: PlacedItemInstance[];
} {
  // Clone items to avoid mutating directly
  const updatedItems: PlacedItemInstance[] = placedItems.map(item => ({
    ...item,
    bonusAtk: 0,
    bonusDef: 0,
    bonusHp: 0,
    bonusRegen: 0,
    bonusLifesteal: 0,
    bonusCrit: 0,
    bonusDodge: 0,
    bonusLootFind: 0,
    isSynergyActive: false,
    linkedInstanceIds: [],
    synergyDetail: undefined
  }));

  // Apply affix bonuses first!
  for (const item of updatedItems) {
    for (const affix of item.affixes) {
      if (affix.bonusAtk) item.bonusAtk += affix.bonusAtk;
      if (affix.bonusAtkPct) item.bonusAtk += Math.round((item.baseAtk * affix.bonusAtkPct) / 100);
      if (affix.bonusDef) item.bonusDef += affix.bonusDef;
      if (affix.bonusDefPct) item.bonusDef += Math.round((item.baseDef * affix.bonusDefPct) / 100);
      if (affix.bonusHp) item.bonusHp += affix.bonusHp;
      if (affix.bonusRegen) item.bonusRegen += affix.bonusRegen;
      if (affix.bonusLifesteal) item.bonusLifesteal += affix.bonusLifesteal;
      if (affix.bonusCrit) item.bonusCrit += affix.bonusCrit;
      if (affix.bonusDodge) item.bonusDodge = (item.bonusDodge || 0) + affix.bonusDodge;
      if (affix.bonusLootFind) item.bonusLootFind = (item.bonusLootFind || 0) + affix.bonusLootFind;
    }
  }

  // Build grid with updatedItems references
  const evalGrid: (PlacedItemInstance | null)[][] = Array(gridSize)
    .fill(null)
    .map(() => Array(gridSize).fill(null));

  for (const item of updatedItems) {
    for (let r = 0; r < item.h; r++) {
      for (let c = 0; c < item.w; c++) {
        if (item.shape[r][c] === 1) {
          const targetR = item.gridR + r;
          const targetC = item.gridC + c;
          if (targetR >= 0 && targetR < gridSize && targetC >= 0 && targetC < gridSize) {
            evalGrid[targetR][targetC] = item;
          }
        }
      }
    }
  }

  let activeSynergiesCount = 0;

  // Evaluate individual item synergies
  for (const item of updatedItems) {
    const template = getItemTemplate(item.templateId);
    
    // Find all unique neighbors
    const neighborMap = new Map<string, PlacedItemInstance>();
    const directNeighbors = {
      top: new Map<string, PlacedItemInstance>(),
      bottom: new Map<string, PlacedItemInstance>(),
      left: new Map<string, PlacedItemInstance>(),
      right: new Map<string, PlacedItemInstance>(),
      diagonal: new Map<string, PlacedItemInstance>()
    };

    for (let ir = 0; ir < item.h; ir++) {
      for (let ic = 0; ic < item.w; ic++) {
        if (item.shape[ir][ic] === 1) {
          const curR = item.gridR + ir;
          const curC = item.gridC + ic;

          // Check cardinal directions
          const dirs: [number, number, 'top' | 'bottom' | 'left' | 'right'][] = [
            [-1, 0, 'top'],
            [1, 0, 'bottom'],
            [0, -1, 'left'],
            [0, 1, 'right']
          ];

          for (const [dr, dc, dirName] of dirs) {
            const nr = curR + dr;
            const nc = curC + dc;
            if (nr >= 0 && nr < gridSize && nc >= 0 && nc < gridSize) {
              const nb = evalGrid[nr][nc];
              if (nb && nb.instanceId !== item.instanceId) {
                neighborMap.set(nb.instanceId, nb);
                directNeighbors[dirName].set(nb.instanceId, nb);
              }
            }
          }

          // Check diagonals
          const diagDirs = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
          for (const [dr, dc] of diagDirs) {
            const nr = curR + dr;
            const nc = curC + dc;
            if (nr >= 0 && nr < gridSize && nc >= 0 && nc < gridSize) {
              const nb = evalGrid[nr][nc];
              if (nb && nb.instanceId !== item.instanceId) {
                directNeighbors.diagonal.set(nb.instanceId, nb);
              }
            }
          }
        }
      }
    }

    const neighbors = Array.from(neighborMap.values());
    const context: SynergyContext = {
      item,
      allPlaced: updatedItems,
      grid: evalGrid,
      gridSize,
      neighbors,
      directNeighbors: {
        top: Array.from(directNeighbors.top.values()),
        bottom: Array.from(directNeighbors.bottom.values()),
        left: Array.from(directNeighbors.left.values()),
        right: Array.from(directNeighbors.right.values()),
        diagonal: Array.from(directNeighbors.diagonal.values())
      }
    };

    if (template.evaluateSynergy) {
      const res: SynergyResult = template.evaluateSynergy(context);
      if (res.active) {
        item.isSynergyActive = true;
        activeSynergiesCount++;
        item.bonusAtk += res.bonusAtk || 0;
        item.bonusDef += res.bonusDef || 0;
        item.bonusHp += res.bonusHp || 0;
        item.bonusRegen += res.bonusRegen || 0;
        item.bonusLifesteal += res.bonusLifesteal || 0;
        item.bonusCrit += res.bonusCrit || 0;
        item.synergyDetail = res.message;
        item.linkedInstanceIds = res.targetNeighborIds || [];
      }
    }

    // Whetstone (砥石) buffs adjacent weapons
    if (template.id === 'whetstone') {
      const neighborWeapons = neighbors.filter(n => n.type === 'weapon');
      if (neighborWeapons.length > 0) {
        item.isSynergyActive = true;
        activeSynergiesCount++;
        item.linkedInstanceIds = neighborWeapons.map(n => n.instanceId);
        neighborWeapons.forEach(w => {
          w.bonusAtk += 4;
          w.isSynergyActive = true;
          if (!w.linkedInstanceIds?.includes(item.instanceId)) {
            w.linkedInstanceIds = [...(w.linkedInstanceIds || []), item.instanceId];
          }
        });
      }
    }

    // Hunter Quiver (獵人箭袋) buffs weapons
    if (template.id === 'hunter_quiver') {
      const neighborWeapons = neighbors.filter(n => n.type === 'weapon');
      if (neighborWeapons.length > 0) {
        item.isSynergyActive = true;
        activeSynergiesCount++;
        item.linkedInstanceIds = neighborWeapons.map(n => n.instanceId);
        neighborWeapons.forEach(w => {
          w.bonusAtk += 3;
          w.isSynergyActive = true;
        });
      }
    }

    // Magma Core (熔岩火核) buffs weapons
    if (template.id === 'magma_core') {
      const neighborWeapons = neighbors.filter(n => n.type === 'weapon');
      if (neighborWeapons.length > 0) {
        item.isSynergyActive = true;
        activeSynergiesCount++;
        item.linkedInstanceIds = neighborWeapons.map(n => n.instanceId);
        neighborWeapons.forEach(w => {
          w.bonusAtk += 5;
          w.isSynergyActive = true;
        });
      }
    }

    // Venom Sac (劇毒腺體) buffs weapons
    if (template.id === 'venom_sac') {
      const neighborWeapons = neighbors.filter(n => n.type === 'weapon');
      if (neighborWeapons.length > 0) {
        item.isSynergyActive = true;
        activeSynergiesCount++;
        item.linkedInstanceIds = neighborWeapons.map(n => n.instanceId);
        neighborWeapons.forEach(w => {
          w.bonusAtk += 3;
          w.bonusCrit += 10;
          w.isSynergyActive = true;
        });
      }
    }
  }

  // Sum up all statistics
  let totalAtk = baseStats.baseAtk;
  let totalDef = baseStats.baseDef;
  let maxHpBonus = 0;
  let stepRegen = 0;
  let lifesteal = 0;
  let critChance = 5;
  let dodgeRate = 0;
  let lootFindPct = 0;

  for (const item of updatedItems) {
    item.isBroken = item.currentDurability <= 0;
    const effMultiplier = item.isBroken ? 0.5 : 1.0;

    totalAtk += Math.round((item.baseAtk + item.bonusAtk) * effMultiplier);
    totalDef += Math.round((item.baseDef + item.bonusDef) * effMultiplier);
    maxHpBonus += Math.round((item.baseMaxHp + item.bonusHp) * effMultiplier);
    stepRegen += Math.round((item.stepRegen + item.bonusRegen) * effMultiplier);
    lifesteal += Math.round((item.lifesteal + item.bonusLifesteal) * effMultiplier);
    critChance += Math.round((item.critChance + item.bonusCrit) * effMultiplier);
    dodgeRate += Math.round((item.bonusDodge || 0) * effMultiplier);
    lootFindPct += Math.round((item.bonusLootFind || 0) * effMultiplier);

    if (item.isBroken) {
      item.synergyDetail = (item.synergyDetail ? `${item.synergyDetail} • ` : '') + '⚠️ 耐久耗盡！數值效果減半';
    }
  }

  return {
    totalAtk: Math.max(1, totalAtk),
    totalDef: Math.max(0, totalDef),
    maxHpBonus: Math.max(0, maxHpBonus),
    stepRegen: Math.max(0, stepRegen),
    lifesteal: Math.min(100, Math.max(0, lifesteal)),
    critChance: Math.min(100, Math.max(0, critChance)),
    dodgeRate: Math.min(75, Math.max(0, dodgeRate)),
    lootFindPct: Math.max(0, lootFindPct),
    activeSynergiesCount,
    updatedItems
  };
}

export function repairItem<T extends PlacedItemInstance | InventoryItem>(item: T, amount: number): T {
  const newDur = Math.min(item.maxDurability, item.currentDurability + amount);
  return {
    ...item,
    currentDurability: newDur,
    isBroken: newDur <= 0
  };
}
