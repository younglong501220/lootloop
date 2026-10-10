import { EquipmentPreset, PlacedItemInstance } from '../types/game';
import { createItemInstance } from '../utils/inventory';

function createPlaced(
  templateId: string,
  gridR: number,
  gridC: number,
  rarity?: 'common' | 'rare' | 'legendary'
): PlacedItemInstance {
  const item = createItemInstance(templateId, rarity);
  item.gridR = gridR;
  item.gridC = gridC;
  return item;
}

export function getBuiltInPresets(): EquipmentPreset[] {
  return [
    {
      id: 'builtin_berserker',
      name: '⚔️ 狂戰士破甲流',
      description: '重兵器巨劍搭配磨刀石與暗影匕首，發揮極致爆發力與破壞斬擊。',
      createdAt: 1700000001000,
      isBuiltIn: true,
      items: [
        createPlaced('greatsword', 0, 0, 'rare'),
        createPlaced('iron_sword', 0, 2, 'common'),
        createPlaced('dagger', 0, 3, 'rare'),
        createPlaced('whetstone', 1, 3, 'rare'),
        createPlaced('blood_ring', 2, 2, 'rare'),
        createPlaced('repair_kit', 3, 0, 'common')
      ],
      summary: {
        totalAtk: 28,
        totalDef: 2,
        itemCount: 6,
        tag: '極致輸出 / 暴擊'
      }
    },
    {
      id: 'builtin_paladin',
      name: '🛡️ 聖騎堅壁流',
      description: '重木盾、板金鎧甲與聖冠護盾多重格擋連攜，穩如磐石，反制一切魔物猛攻。',
      createdAt: 1700000002000,
      isBuiltIn: true,
      items: [
        createPlaced('wooden_shield', 0, 0, 'common'),
        createPlaced('spiked_shield', 0, 2, 'rare'),
        createPlaced('iron_plate', 2, 0, 'rare'),
        createPlaced('aegis_crest', 2, 2, 'legendary'),
        createPlaced('iron_sword', 2, 3, 'common')
      ],
      summary: {
        totalAtk: 8,
        totalDef: 32,
        itemCount: 5,
        tag: '極限格擋 / 荊棘反傷'
      }
    },
    {
      id: 'builtin_vampiric',
      name: '🩸 吸血狂瀾流',
      description: '吸血鬼之牙搭配鮮血指環與治癒靈藥，戰鬥中越打血量越滿，持久續航永動機。',
      createdAt: 1700000003000,
      isBuiltIn: true,
      items: [
        createPlaced('vampire_fang', 0, 0, 'legendary'),
        createPlaced('blood_ring', 0, 1, 'rare'),
        createPlaced('iron_sword', 0, 2, 'common'),
        createPlaced('dagger', 0, 3, 'rare'),
        createPlaced('healing_potion', 1, 1, 'common'),
        createPlaced('wooden_shield', 2, 0, 'common')
      ],
      summary: {
        totalAtk: 18,
        totalDef: 12,
        itemCount: 6,
        tag: '吸血續航 / 高暴擊'
      }
    },
    {
      id: 'builtin_treasure',
      name: '💰 幸運打寶流',
      description: '盜賊手套與幸運金幣加持，大幅提升高階詞綴裝備掉落率與閃避率。',
      createdAt: 1700000004000,
      isBuiltIn: true,
      items: [
        createPlaced('lucky_coin', 0, 0, 'rare'),
        createPlaced('thief_gloves', 0, 1, 'rare'),
        createPlaced('swift_boots', 1, 1, 'rare'),
        createPlaced('iron_sword', 0, 3, 'common'),
        createPlaced('wooden_shield', 2, 0, 'common'),
        createPlaced('rune_polish', 2, 2, 'rare')
      ],
      summary: {
        totalAtk: 12,
        totalDef: 14,
        itemCount: 6,
        tag: '金幣掉寶 / 閃避身法'
      }
    }
  ];
}
