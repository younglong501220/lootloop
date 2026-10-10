import { EnvironmentalEvent, EnvironmentalEventType } from '../types/game';

export interface EnvironmentalEventTemplate {
  type: EnvironmentalEventType;
  name: string;
  icon: string;
  badgeColor: string;
  borderColor: string;
  bgGradient: string;
  description: string;
  effectSummary: string;
}

export const ENVIRONMENTAL_EVENT_TEMPLATES: EnvironmentalEventTemplate[] = [
  {
    type: 'storm',
    name: '雷霆風暴 (Tempest Storm)',
    icon: '⚡',
    badgeColor: 'text-amber-300 bg-amber-950/80 border-amber-500/60',
    borderColor: 'border-amber-400',
    bgGradient: 'from-amber-950/40 via-purple-950/30 to-slate-900',
    description: '狂怒的雷雲遮蔽天空！狂暴閃電同時轟擊魔物與勇者！',
    effectSummary: '全體天候傷害：魔物受 35-50 點雷擊，勇者受 8-12 點微量感電！'
  },
  {
    type: 'blessing',
    name: '神聖祝福光環 (Divine Blessing Aura)',
    icon: '✨',
    badgeColor: 'text-emerald-300 bg-emerald-950/80 border-emerald-500/60',
    borderColor: 'border-emerald-400',
    bgGradient: 'from-emerald-950/40 via-teal-950/30 to-slate-900',
    description: '遠古聖樹的光芒灑落！溫暖神聖的光環籠罩勇者！',
    effectSummary: '恩賜回復：勇者立即回復 25-45 點生命值，並獲得神聖護甲！'
  },
  {
    type: 'volcano',
    name: '熔岩熾熱 (Volcanic Eruption)',
    icon: '🌋',
    badgeColor: 'text-rose-300 bg-rose-950/80 border-rose-500/60',
    borderColor: 'border-rose-500',
    bgGradient: 'from-rose-950/50 via-orange-950/40 to-slate-900',
    description: '地熱熔漿破土噴發！滾燙熱浪侵蝕戰場，重創敵方防線！',
    effectSummary: '烈焰重擊：對魔物造成 40-65 點灼燒傷害並使其破甲！'
  },
  {
    type: 'arcane_fog',
    name: '幻境秘霧 (Arcane Fog)',
    icon: '🌫️',
    badgeColor: 'text-cyan-300 bg-cyan-950/80 border-cyan-500/60',
    borderColor: 'border-cyan-400',
    bgGradient: 'from-cyan-950/40 via-indigo-950/30 to-slate-900',
    description: '詭譎莫測的秘術幻霧瀰漫，讓敵人的視野完全失焦！',
    effectSummary: '秘霧幻影：使勇者身形若隱若現，大幅提升本回合閃避！'
  },
  {
    type: 'fortune_winds',
    name: '豐饒祥風 (Winds of Fortune)',
    icon: '🪙',
    badgeColor: 'text-yellow-300 bg-yellow-950/80 border-yellow-500/60',
    borderColor: 'border-yellow-400',
    bgGradient: 'from-yellow-950/40 via-amber-950/30 to-slate-900',
    description: '幸運與財富的靈風席捲而來，戰場上飛舞著失落金幣！',
    effectSummary: '戰利品激勵：立即拾取 15-30 枚額外金幣，激發士氣！'
  }
];

export function getRandomEnvironmentalEvent(): EnvironmentalEvent {
  const template = ENVIRONMENTAL_EVENT_TEMPLATES[Math.floor(Math.random() * ENVIRONMENTAL_EVENT_TEMPLATES.length)];
  return {
    id: `event_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    type: template.type,
    name: template.name,
    icon: template.icon,
    badgeColor: template.badgeColor,
    description: template.description,
    effectSummary: template.effectSummary,
    timestamp: Date.now()
  };
}
