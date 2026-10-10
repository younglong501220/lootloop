import { MonsterStats } from '../types/game';

export interface MonsterArchetype {
  id: string;
  name: string;
  title: string;
  icon: string;
  baseHp: number;
  hpPerLoop: number;
  baseAtk: number;
  atkPerLoop: number;
  baseDef: number;
  defPerLoop: number;
  expReward: number;
  goldReward: number;
  lootDropCount: number;
  isBoss?: boolean;
  specialAbility?: string;
  minLoop?: number;
}

export const MONSTER_ARCHETYPES: MonsterArchetype[] = [
  {
    id: 'goblin_scout',
    name: '哥布林斥候',
    title: '林間伏兵',
    icon: '👺',
    baseHp: 14,
    hpPerLoop: 6,
    baseAtk: 4,
    atkPerLoop: 2,
    baseDef: 1,
    defPerLoop: 0.5,
    expReward: 15,
    goldReward: 6,
    lootDropCount: 1,
    minLoop: 1
  },
  {
    id: 'cave_bat',
    name: '暗窟吸血蝠',
    title: '暗影獵手',
    icon: '🦇',
    baseHp: 10,
    hpPerLoop: 5,
    baseAtk: 6,
    atkPerLoop: 3,
    baseDef: 0,
    defPerLoop: 0,
    expReward: 18,
    goldReward: 5,
    lootDropCount: 1,
    specialAbility: '敏捷撕咬：高攻速偷襲',
    minLoop: 1
  },
  {
    id: 'skeleton_warrior',
    name: '骷髏重甲兵',
    title: '荒塚復甦者',
    icon: '💀',
    baseHp: 22,
    hpPerLoop: 9,
    baseAtk: 5,
    atkPerLoop: 2.5,
    baseDef: 3,
    defPerLoop: 1,
    expReward: 25,
    goldReward: 10,
    lootDropCount: 1,
    specialAbility: '骨盾防禦：格擋部分傷害',
    minLoop: 2
  },
  {
    id: 'poison_slime',
    name: '腐蝕酸泥怪',
    title: '污穢聚合體',
    icon: '🦠',
    baseHp: 28,
    hpPerLoop: 11,
    baseAtk: 6,
    atkPerLoop: 3,
    baseDef: 2,
    defPerLoop: 1,
    expReward: 30,
    goldReward: 12,
    lootDropCount: 1,
    specialAbility: '劇毒腐蝕：破甲重擊',
    minLoop: 2
  },
  {
    id: 'orc_berserker',
    name: '獸人狂鬥士',
    title: '血腥狂怒者',
    icon: '👹',
    baseHp: 38,
    hpPerLoop: 14,
    baseAtk: 9,
    atkPerLoop: 4,
    baseDef: 4,
    defPerLoop: 1.5,
    expReward: 45,
    goldReward: 18,
    lootDropCount: 2,
    specialAbility: '狂暴怒火：生命越低攻擊越高',
    minLoop: 3
  },
  {
    id: 'stone_golem',
    name: '遠古石像鬼',
    title: '泰坦殘骸',
    icon: '🗿',
    baseHp: 50,
    hpPerLoop: 18,
    baseAtk: 7,
    atkPerLoop: 3,
    baseDef: 8,
    defPerLoop: 2,
    expReward: 55,
    goldReward: 22,
    lootDropCount: 2,
    specialAbility: '石膚壁壘：超高物理防禦',
    minLoop: 4
  },
  // Loop Boss 1
  {
    id: 'lich_king',
    name: '巫妖之王·卡爾薩斯',
    title: '循環宿命之縛',
    icon: '🧙‍♂️',
    baseHp: 90,
    hpPerLoop: 30,
    baseAtk: 14,
    atkPerLoop: 5,
    baseDef: 6,
    defPerLoop: 2,
    expReward: 150,
    goldReward: 60,
    lootDropCount: 3,
    isBoss: true,
    specialAbility: '凋零詛咒：循環掌控者',
    minLoop: 5
  },
  // Loop Boss 2
  {
    id: 'inferno_dragon',
    name: '深淵炎獄黑龍',
    title: '末日終焉巨龍',
    icon: '🐲',
    baseHp: 160,
    hpPerLoop: 45,
    baseAtk: 22,
    atkPerLoop: 7,
    baseDef: 10,
    defPerLoop: 3,
    expReward: 300,
    goldReward: 120,
    lootDropCount: 4,
    isBoss: true,
    specialAbility: '毀滅龍息：灼燒大地',
    minLoop: 10
  }
];

export function generateMonsterForLoop(loop: number, isBossNode = false): MonsterStats {
  if (isBossNode || (loop % 5 === 0 && loop >= 5)) {
    const bossArch = loop >= 10 
      ? MONSTER_ARCHETYPES.find(m => m.id === 'inferno_dragon')! 
      : MONSTER_ARCHETYPES.find(m => m.id === 'lich_king')!;
    
    const maxHp = Math.round(bossArch.baseHp + (loop - bossArch.minLoop!) * bossArch.hpPerLoop);
    const atk = Math.round(bossArch.baseAtk + (loop - bossArch.minLoop!) * bossArch.atkPerLoop);
    const def = Math.round(bossArch.baseDef + (loop - bossArch.minLoop!) * bossArch.defPerLoop);

    return {
      id: `${bossArch.id}_${Date.now()}`,
      name: bossArch.name,
      title: bossArch.title,
      icon: bossArch.icon,
      maxHp,
      currentHp: maxHp,
      atk,
      def,
      isBoss: true,
      expReward: bossArch.expReward * loop,
      goldReward: bossArch.goldReward * loop,
      lootDropCount: bossArch.lootDropCount,
      specialAbility: bossArch.specialAbility
    };
  }

  // Regular monster selection based on loop
  const available = MONSTER_ARCHETYPES.filter(m => !m.isBoss && (m.minLoop || 1) <= loop);
  const picked = available[Math.floor(Math.random() * available.length)] || MONSTER_ARCHETYPES[0];

  const loopFactor = Math.max(0, loop - 1);
  const maxHp = Math.round(picked.baseHp + loopFactor * picked.hpPerLoop);
  const atk = Math.round(picked.baseAtk + loopFactor * picked.atkPerLoop);
  const def = Math.round(picked.baseDef + loopFactor * picked.defPerLoop);

  return {
    id: `${picked.id}_${Date.now()}_${Math.random()}`,
    name: picked.name,
    title: picked.title,
    icon: picked.icon,
    maxHp,
    currentHp: maxHp,
    atk,
    def,
    isBoss: false,
    expReward: picked.expReward + loopFactor * 5,
    goldReward: picked.goldReward + loopFactor * 3,
    lootDropCount: picked.lootDropCount,
    specialAbility: picked.specialAbility
  };
}
