export type ItemType = 'weapon' | 'shield' | 'accessory' | 'potion' | 'armor' | 'relic' | 'gem' | 'tool';

export type ItemRarity = 'common' | 'rare' | 'legendary';

export interface ItemAffix {
  id: string;
  name: string;
  description: string;
  type: 'prefix' | 'suffix';
  bonusAtk?: number;
  bonusDef?: number;
  bonusAtkPct?: number;
  bonusDefPct?: number;
  bonusHp?: number;
  bonusRegen?: number;
  bonusLifesteal?: number;
  bonusCrit?: number;
  bonusGoldPct?: number;
  bonusDodge?: number;      // e.g. +2% ~ +5% 閃避率
  bonusLootFind?: number;   // e.g. +10% 物品拾取範圍 / 尋寶率
}

export interface ItemTemplate {
  id: string;
  name: string;
  type: ItemType;
  rarity: ItemRarity;
  w: number;
  h: number;
  shape: number[][]; // 2D array, 1 for occupied, 0 for empty
  icon: string;
  color: string;
  borderColor: string;
  baseAtk: number;
  baseDef: number;
  baseMaxHp?: number;
  stepRegen?: number;
  lifesteal?: number;
  critChance?: number;
  maxDurability?: number;  // e.g. 30, 50, etc.
  isRepairTool?: boolean;  // whether this is a repair tool
  repairPower?: number;    // how much durability it repairs (e.g. +15 or +30)
  desc: string;
  synergyDesc: string;
  evaluateSynergy?: (context: SynergyContext) => SynergyResult;
}

export interface PlacedItemInstance {
  instanceId: string;
  templateId: string;
  name: string;
  baseName: string;
  type: ItemType;
  rarity: ItemRarity;
  w: number;
  h: number;
  shape: number[][];
  icon: string;
  color: string;
  borderColor: string;
  baseAtk: number;
  baseDef: number;
  baseMaxHp: number;
  stepRegen: number;
  lifesteal: number;
  critChance: number;
  desc: string;
  synergyDesc: string;
  
  // Placement coordinates
  gridR: number; // Row index in backpack
  gridC: number; // Col index in backpack

  // Durability System
  maxDurability: number;
  currentDurability: number;
  isBroken: boolean;
  isRepairTool?: boolean;
  repairPower?: number;

  // Random Affixes
  affixes: ItemAffix[];

  // Calculated at runtime
  bonusAtk: number;
  bonusDef: number;
  bonusHp: number;
  bonusRegen: number;
  bonusLifesteal: number;
  bonusCrit: number;
  bonusDodge?: number;
  bonusLootFind?: number;
  isSynergyActive: boolean;
  synergyDetail?: string;
  linkedInstanceIds?: string[];
}

export interface InventoryItem extends Omit<PlacedItemInstance, 'gridR' | 'gridC'> {
  gridR?: number;
  gridC?: number;
  price?: number; // Shop price if in store
}

export interface SynergyContext {
  item: PlacedItemInstance;
  allPlaced: PlacedItemInstance[];
  grid: (PlacedItemInstance | null)[][];
  gridSize: number;
  neighbors: PlacedItemInstance[];
  directNeighbors: {
    top: PlacedItemInstance[];
    bottom: PlacedItemInstance[];
    left: PlacedItemInstance[];
    right: PlacedItemInstance[];
    diagonal: PlacedItemInstance[];
  };
}

export interface SynergyResult {
  active: boolean;
  bonusAtk?: number;
  bonusDef?: number;
  bonusHp?: number;
  bonusRegen?: number;
  bonusLifesteal?: number;
  bonusCrit?: number;
  message?: string;
  targetNeighborIds?: string[];
}

export type TileType = 'camp' | 'road' | 'monster' | 'chest' | 'shrine' | 'forge' | 'boss' | 'merchant';

export interface TrackNode {
  index: number;
  x: number;
  y: number;
  type: TileType;
  name: string;
  subName?: string;
  biome?: string;
  icon: string;
  monsterTemplateId?: string;
}

export interface MonsterStats {
  id: string;
  name: string;
  title: string;
  icon: string;
  maxHp: number;
  currentHp: number;
  atk: number;
  def: number;
  isBoss?: boolean;
  expReward: number;
  goldReward: number;
  lootDropCount: number;
  specialAbility?: string;
}

export interface PlayerStats {
  maxHp: number;
  hp: number;
  baseAtk: number;
  baseDef: number;
  totalAtk: number;
  totalDef: number;
  stepRegen: number;
  lifesteal: number;
  critChance: number;
  dodgeRate: number;       // Evade chance % (e.g. 0% + affixes)
  lootFindPct: number;     // Loot pickup & find range %
  gold: number;
  loop: number;
  nodeIndex: number;
  progressOnTrack: number; // 0 to 1 between nodes
  totalKills: number;
  totalSteps: number;
  totalDamageDealt: number;
  backpackGridSize: number; // 5, 6, 7
}

export interface CombatLogEntry {
  id: string;
  timestamp: number;
  text: string;
  type: 'info' | 'combat' | 'loot' | 'camp' | 'buff' | 'danger';
}

export interface DamagePopup {
  id: string;
  target: 'player' | 'monster' | 'center';
  text: string;
  type: 'damage' | 'crit' | 'block' | 'heal' | 'dodge' | 'skill' | 'event';
  createdAt: number;
}

export type EnvironmentalEventType = 'storm' | 'blessing' | 'volcano' | 'arcane_fog' | 'fortune_winds';

export interface EnvironmentalEvent {
  id: string;
  type: EnvironmentalEventType;
  name: string;
  icon: string;
  badgeColor: string;
  description: string;
  effectSummary: string;
  timestamp: number;
}

export interface SkillRune {
  id: string;
  name: string;
  title: string;
  icon: string;
  color: string;
  borderColor: string;
  description: string;
  cooldownMax: number; // in seconds
  type: 'shield' | 'stun' | 'rage' | 'heal' | 'arcane';
}

export interface ActiveSkillState {
  rune: SkillRune;
  currentCooldown: number; // 0 when ready!
  isReady: boolean;
  totalCasts: number;
}

export interface EquipmentPreset {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
  isBuiltIn?: boolean;
  items: PlacedItemInstance[];
  summary: {
    totalAtk: number;
    totalDef: number;
    itemCount: number;
    tag?: string;
  };
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  goldReward: number;
  isUnlocked: boolean;
  unlockedAt?: number;
  progress: number;
  maxProgress: number;
}

export interface CombatAction {
  round: number;
  actor: 'player' | 'monster';
  type: 'attack' | 'crit' | 'block' | 'lifesteal' | 'defeat' | 'dodge';
  damage: number;
  blocked: number;
  healed: number;
  playerHpAfter: number;
  monsterHpAfter: number;
  description: string;
}

export interface CombatRecord {
  id: string;
  timestamp: number;
  monsterName: string;
  monsterIcon: string;
  monsterMaxHp: number;
  isBoss?: boolean;
  loop: number;
  victory: boolean;
  totalRounds: number;
  goldEarned: number;
  lootCount: number;
  actions: CombatAction[];
  droppedItems?: InventoryItem[];
}

export interface KeybindingsConfig {
  rotateItem: string;      // default: 'r'
  togglePause: string;     // default: ' '
  speed1: string;          // default: '1'
  speed2: string;          // default: '2'
  speed3: string;          // default: '3'
  openCodex: string;       // default: 'c'
  openAchievements: string;// default: 'a'
  openReplay: string;      // default: 'v'
  openHelp: string;        // default: 'h'
  openSettings: string;    // default: 'k'
  autoEquip: string;       // default: 'e'
}
