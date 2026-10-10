import { SkillRune } from '../types/game';

export const SKILL_RUNES: SkillRune[] = [
  {
    id: 'rune_divine_aegis',
    name: '聖光神盾',
    title: '群體護盾符文',
    icon: '🛡️',
    color: 'from-amber-500/20 to-yellow-600/20',
    borderColor: 'border-yellow-400',
    description: '充能完畢時自動觸發：賦予勇者相當於 35% 最大生命值的神聖護盾（最高 80 點吸收護盾），抵擋隨後的致命攻擊！',
    cooldownMax: 6,
    type: 'shield'
  },
  {
    id: 'rune_thunder_stun',
    name: '雷霆震擊',
    title: '瞬間擊暈符文',
    icon: '⚡',
    color: 'from-cyan-500/20 to-blue-600/20',
    borderColor: 'border-cyan-400',
    description: '充能完畢時自動觸發：召喚萬鈞雷霆轟擊魔物，造成 40 點雷電傷害並使魔物陷入眩暈狀態，跳過 1 回合攻擊！',
    cooldownMax: 5,
    type: 'stun'
  },
  {
    id: 'rune_rage_burst',
    name: '狂怒爆發',
    title: '極限斬殺符文',
    icon: '🔥',
    color: 'from-rose-500/20 to-red-600/20',
    borderColor: 'border-rose-400',
    description: '充能完畢時自動觸發：引爆體內狂戰之血，造成 250% 暴擊真實傷害（無視防禦），並使下次回合攻擊力提升 50%！',
    cooldownMax: 4.5,
    type: 'rage'
  },
  {
    id: 'rune_nature_rejuvenation',
    name: '甘霖回春',
    title: '生命潮湧符文',
    icon: '🌿',
    color: 'from-emerald-500/20 to-green-600/20',
    borderColor: 'border-emerald-400',
    description: '充能完畢時自動觸發：祈請自然甘霖，立即回復 30% 最大生命值，並為背包中所有受損裝備修復 5 點耐久！',
    cooldownMax: 7,
    type: 'heal'
  },
  {
    id: 'rune_arcane_barrage',
    name: '奧術轟炸',
    title: '秘法連彈符文',
    icon: '🔮',
    color: 'from-purple-500/20 to-indigo-600/20',
    borderColor: 'border-purple-400',
    description: '充能完畢時自動觸發：瞬發 3 枚高能奧術飛彈，每枚造成 25 點純粹奧術傷害（無視目標防禦，總計 75 點）！',
    cooldownMax: 5.5,
    type: 'arcane'
  }
];

export const DEFAULT_EQUIPPED_SKILL_IDS = ['rune_divine_aegis', 'rune_thunder_stun'];

export function getSkillRune(id: string): SkillRune {
  return SKILL_RUNES.find(r => r.id === id) || SKILL_RUNES[0];
}
