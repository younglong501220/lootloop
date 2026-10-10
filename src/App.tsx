import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  PlayerStats,
  PlacedItemInstance,
  InventoryItem,
  MonsterStats,
  CombatLogEntry,
  TrackNode,
  Achievement,
  CombatRecord,
  CombatAction,
  DamagePopup,
  KeybindingsConfig,
  SkillRune,
  ActiveSkillState,
  EquipmentPreset,
  EnvironmentalEvent
} from './types/game';
import { DEFAULT_TRACK_NODES } from './data/track';
import { ITEM_TEMPLATES, getItemTemplate } from './data/items';
import { generateMonsterForLoop } from './data/monsters';
import { INITIAL_ACHIEVEMENTS } from './data/achievements';
import { rollRandomRarity } from './data/affixes';
import { SKILL_RUNES, DEFAULT_EQUIPPED_SKILL_IDS, getSkillRune } from './data/skills';
import { getBuiltInPresets } from './data/presets';
import { getRandomEnvironmentalEvent } from './data/environmentalEvents';
import {
  createItemInstance,
  rotateShape,
  canPlaceItem,
  calculateSynergies,
  buildGrid,
  getBackpackFillRate,
  calculateItemPrice
} from './utils/inventory';
import { soundFX } from './utils/audio';
import { TrackCanvas } from './components/TrackCanvas';
import { BackpackGrid } from './components/BackpackGrid';
import { LootTray } from './components/LootTray';
import { CombatDisplay } from './components/CombatDisplay';
import { ItemTooltip } from './components/ItemTooltip';
import { CodexModal } from './components/CodexModal';
import { GameOverModal } from './components/GameOverModal';
import { MerchantModal } from './components/MerchantModal';
import { AchievementsModal } from './components/AchievementsModal';
import { AchievementToast } from './components/AchievementToast';
import { CombatReplayModal } from './components/CombatReplayModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { KeybindingsModal } from './components/KeybindingsModal';
import { SkillRunesModal } from './components/SkillRunesModal';
import { PresetsModal } from './components/PresetsModal';
import {
  Play,
  Pause,
  FastForward,
  Zap,
  Volume2,
  VolumeX,
  BookOpen,
  RotateCcw,
  Sparkles,
  Heart,
  Swords,
  Shield,
  Coins,
  Trophy,
  History,
  HelpCircle,
  ShoppingBag,
  Keyboard,
  Wrench,
  BookmarkCheck
} from 'lucide-react';

export default function App() {
  // --- Game State ---
  const [player, setPlayer] = useState<PlayerStats>({
    maxHp: 100,
    hp: 100,
    baseAtk: 2,
    baseDef: 0,
    totalAtk: 2,
    totalDef: 0,
    stepRegen: 0,
    lifesteal: 0,
    critChance: 5,
    gold: 0,
    loop: 1,
    nodeIndex: 0,
    progressOnTrack: 0,
    totalKills: 0,
    totalSteps: 0,
    totalDamageDealt: 0,
    backpackGridSize: 5,
    dodgeRate: 0,
    lootFindPct: 0
  });

  const [trackNodes, setTrackNodes] = useState<TrackNode[]>(DEFAULT_TRACK_NODES);
  const [placedItems, setPlacedItems] = useState<PlacedItemInstance[]>([]);
  const [lootTrayItems, setLootTrayItems] = useState<InventoryItem[]>([]);
  const [heldItem, setHeldItem] = useState<InventoryItem | null>(null);

  // Combat State & Visual Feedback
  const [isInCombat, setIsInCombat] = useState<boolean>(false);
  const [currentMonster, setCurrentMonster] = useState<MonsterStats | null>(null);
  const [currentCombatActions, setCurrentCombatActions] = useState<CombatAction[]>([]);
  const [combatRecords, setCombatRecords] = useState<CombatRecord[]>(() => {
    try {
      const sample1 = createItemInstance('iron_sword', 'rare');
      const sample2 = createItemInstance('assassin_dagger', 'legendary');
      return [
        {
          id: 'initial_combat_sample',
          timestamp: Date.now() - 30000,
          monsterName: '哥布林斥候',
          monsterIcon: '👺',
          monsterMaxHp: 28,
          isBoss: false,
          loop: 1,
          victory: true,
          totalRounds: 2,
          goldEarned: 15,
          lootCount: 2,
          droppedItems: [sample1, sample2],
          actions: [
            {
              round: 1,
              actor: 'player',
              type: 'attack',
              damage: 14,
              blocked: 0,
              healed: 0,
              playerHpAfter: 100,
              monsterHpAfter: 14,
              description: '🗡️ 勇者施展迅捷斬擊，對哥布林斥候造成 14 點傷害！'
            },
            {
              round: 1,
              actor: 'monster',
              type: 'attack',
              damage: 6,
              blocked: 4,
              healed: 0,
              playerHpAfter: 98,
              monsterHpAfter: 14,
              description: '🪵 哥布林斥候揮動狼牙棒反擊 (傷害 6，重木盾吸收 4)'
            },
            {
              round: 2,
              actor: 'player',
              type: 'crit',
              damage: 18,
              blocked: 0,
              healed: 2,
              playerHpAfter: 100,
              monsterHpAfter: 0,
              description: '💥 暴擊！勇者精準刺穿弱點，造成 18 點暴擊重創！'
            },
            {
              round: 2,
              actor: 'player',
              type: 'defeat',
              damage: 0,
              blocked: 0,
              healed: 0,
              playerHpAfter: 100,
              monsterHpAfter: 0,
              description: '✨ 成功擊潰魔物【哥布林斥候】！贏得 15 金幣！'
            }
          ]
        }
      ];
    } catch {
      return [];
    }
  });
  const [damagePopups, setDamagePopups] = useState<DamagePopup[]>([]);
  const [shakeTarget, setShakeTarget] = useState<'player' | 'monster' | null>(null);

  // Speed: 0 = paused, 1 = normal, 2 = fast, 3 = turbo
  const [gameSpeed, setGameSpeed] = useState<number>(1);
  const prevGameSpeedRef = useRef<number>(1);

  // Achievements
  const [achievements, setAchievements] = useState<Achievement[]>(INITIAL_ACHIEVEMENTS);
  const [latestUnlockedAchievement, setLatestUnlockedAchievement] = useState<Achievement | null>(null);

  // Merchant Shop
  const [isMerchantOpen, setIsMerchantOpen] = useState<boolean>(false);
  const [merchantGoods, setMerchantGoods] = useState<InventoryItem[]>([]);

  // Modals
  const [isAchievementsOpen, setIsAchievementsOpen] = useState<boolean>(false);
  const [isReplayOpen, setIsReplayOpen] = useState<boolean>(false);
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState<boolean>(false);
  const [isCodexOpen, setIsCodexOpen] = useState<boolean>(false);
  const [isKeybindingsOpen, setIsKeybindingsOpen] = useState<boolean>(false);
  const [isSkillRunesOpen, setIsSkillRunesOpen] = useState<boolean>(false);
  const [isPresetsOpen, setIsPresetsOpen] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Active Skill Runes System
  const [equippedRuneIds, setEquippedRuneIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('loop_equipped_runes');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_EQUIPPED_SKILL_IDS;
  });

  const [activeSkills, setActiveSkills] = useState<ActiveSkillState[]>(() => {
    return DEFAULT_EQUIPPED_SKILL_IDS.map(id => {
      const rune = getSkillRune(id);
      return {
        rune,
        currentCooldown: 0,
        isReady: true,
        totalCasts: 0
      };
    });
  });

  const [activeCastRuneId, setActiveCastRuneId] = useState<string | null>(null);
  const [monsterStunnedTurns, setMonsterStunnedTurns] = useState<number>(0);
  const [playerShieldPoints, setPlayerShieldPoints] = useState<number>(0);
  const [currentEnvironmentalEvent, setCurrentEnvironmentalEvent] = useState<EnvironmentalEvent | null>(null);

  // Presets System
  const [presets, setPresets] = useState<EquipmentPreset[]>(() => {
    const builtin = getBuiltInPresets();
    try {
      const saved = localStorage.getItem('loop_backpack_presets');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return [...builtin, ...parsed];
        }
      }
    } catch {}
    return builtin;
  });

  // Keybindings Configuration
  const [keybindings, setKeybindings] = useState<KeybindingsConfig>(() => {
    try {
      const saved = localStorage.getItem('loot_loop_keybindings');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {
      rotateItem: 'r',
      togglePause: ' ',
      speed1: '1',
      speed2: '2',
      speed3: '3',
      autoEquip: 'e',
      openCodex: 'c',
      openAchievements: 'a',
      openReplay: 'v',
      openHelp: 'h',
      openSettings: 'k'
    };
  });

  // UI States
  const [logs, setLogs] = useState<CombatLogEntry[]>([]);
  const [hoveredItem, setHoveredItem] = useState<PlacedItemInstance | InventoryItem | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Refs for loop execution
  const playerRef = useRef(player);
  playerRef.current = player;

  const placedItemsRef = useRef(placedItems);
  placedItemsRef.current = placedItems;

  const heldItemRef = useRef(heldItem);
  heldItemRef.current = heldItem;

  const keybindingsRef = useRef(keybindings);
  keybindingsRef.current = keybindings;

  const isInCombatRef = useRef(isInCombat);
  isInCombatRef.current = isInCombat;

  const currentMonsterRef = useRef(currentMonster);
  currentMonsterRef.current = currentMonster;

  const gameSpeedRef = useRef(gameSpeed);
  gameSpeedRef.current = gameSpeed;

  const isGameOverRef = useRef(isGameOver);
  isGameOverRef.current = isGameOver;

  const isMerchantOpenRef = useRef(isMerchantOpen);
  isMerchantOpenRef.current = isMerchantOpen;

  const activeSkillsRef = useRef(activeSkills);
  activeSkillsRef.current = activeSkills;

  const monsterStunnedTurnsRef = useRef(monsterStunnedTurns);
  monsterStunnedTurnsRef.current = monsterStunnedTurns;

  const playerShieldPointsRef = useRef(playerShieldPoints);
  playerShieldPointsRef.current = playerShieldPoints;

  const currentEnvironmentalEventRef = useRef(currentEnvironmentalEvent);
  currentEnvironmentalEventRef.current = currentEnvironmentalEvent;

  // Real-time Cooldown ticking for active skill runes
  useEffect(() => {
    if (isGameOver || gameSpeed === 0) return;
    const speedMult = gameSpeed === 3 ? 2.5 : gameSpeed === 2 ? 1.5 : 1;
    const interval = setInterval(() => {
      setActiveSkills(prev =>
        prev.map(skill => {
          if (skill.currentCooldown <= 0) {
            return skill.isReady ? skill : { ...skill, isReady: true, currentCooldown: 0 };
          }
          const nextCd = Math.max(0, skill.currentCooldown - (0.2 * speedMult));
          return {
            ...skill,
            currentCooldown: nextCd,
            isReady: nextCd <= 0
          };
        })
      );
    }, 200);

    return () => clearInterval(interval);
  }, [isGameOver, gameSpeed]);

  // Sync active skills when equipped runes change
  useEffect(() => {
    setActiveSkills(prev => {
      return equippedRuneIds.map(runeId => {
        const rune = getSkillRune(runeId);
        const existing = prev.find(p => p.rune.id === runeId);
        if (existing) return { ...existing, rune };
        return {
          rune,
          currentCooldown: 0,
          isReady: true,
          totalCasts: 0
        };
      });
    });
  }, [equippedRuneIds]);

  // Add Log Entry
  const addLog = useCallback((text: string, type: CombatLogEntry['type'] = 'info') => {
    const entry: CombatLogEntry = {
      id: `log_${Date.now()}_${Math.random()}`,
      timestamp: Date.now(),
      text,
      type
    };
    setLogs(prev => [entry, ...prev.slice(0, 49)]);
  }, []);

  // Floating Damage Popup helper
  const addDamagePopup = useCallback((text: string, type: DamagePopup['type'], target: DamagePopup['target']) => {
    const popup: DamagePopup = {
      id: `popup_${Date.now()}_${Math.random()}`,
      text,
      type,
      target,
      createdAt: Date.now()
    };
    setDamagePopups(prev => [...prev.slice(-6), popup]);
    setTimeout(() => {
      setDamagePopups(prev => prev.filter(p => p.id !== popup.id));
    }, 980);
  }, []);

  // Impact Shake helper
  const triggerShake = useCallback((target: 'player' | 'monster') => {
    setShakeTarget(target);
    setTimeout(() => {
      setShakeTarget(null);
    }, 350);
  }, []);

  // Unlock achievement helper
  const unlockAchievement = useCallback((id: string) => {
    setAchievements(prev => {
      const target = prev.find(a => a.id === id);
      if (!target || target.isUnlocked) return prev;

      // Award gold
      setPlayer(p => ({ ...p, gold: p.gold + target.goldReward }));

      // Audio & Visual celebratory fanfare
      soundFX.playLoopComplete();
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.8 } });

      const updated = {
        ...target,
        isUnlocked: true,
        progress: target.maxProgress,
        unlockedAt: Date.now()
      };

      setLatestUnlockedAchievement(updated);
      setTimeout(() => {
        setLatestUnlockedAchievement(null);
      }, 5000);

      addLog(`🏆 成就解鎖！【${target.title}】獲得 +${target.goldReward} 金幣獎勵！`, 'buff');

      return prev.map(a => (a.id === id ? updated : a));
    });
  }, [addLog]);

  // Check achievements progress
  const evaluateAchievements = useCallback((
    curPlayer: PlayerStats,
    curPlaced: PlacedItemInstance[],
    activeSynergies: number,
    isBossKilled = false
  ) => {
    const fillRate = getBackpackFillRate(curPlaced, curPlayer.backpackGridSize || 5);
    const hasLegendary = curPlaced.some(p => p.rarity === 'legendary');

    // 1. First blood (1 kill)
    if (curPlayer.totalKills >= 1) unlockAchievement('first_blood');

    // 2. 50 monster kills
    if (curPlayer.totalKills >= 50) unlockAchievement('monster_slayer_50');

    // 3. 90% backpack fill rate
    if (fillRate >= 90) unlockAchievement('backpack_packrat_90');

    // 4. Reach loop 10
    if (curPlayer.loop >= 10) unlockAchievement('reach_loop_10');

    // 5. 3 Synergies active
    if (activeSynergies >= 3) unlockAchievement('synergy_master_3');

    // 6. 150 gold hoarder
    if (curPlayer.gold >= 150) unlockAchievement('gold_hoarder_150');

    // 7. Legendary gear equipped
    if (hasLegendary) unlockAchievement('legendary_gear');

    // 8. Boss killed
    if (isBossKilled) unlockAchievement('boss_slayer');

    // 9. Backpack expanded to >= 6
    if ((curPlayer.backpackGridSize || 5) >= 6) unlockAchievement('backpack_expanded');

    // Update progress numbers
    setAchievements(prev =>
      prev.map(a => {
        if (a.isUnlocked) return a;
        if (a.id === 'monster_slayer_50') return { ...a, progress: Math.min(50, curPlayer.totalKills) };
        if (a.id === 'backpack_packrat_90') return { ...a, progress: Math.min(90, fillRate) };
        if (a.id === 'reach_loop_10') return { ...a, progress: Math.min(10, curPlayer.loop) };
        if (a.id === 'synergy_master_3') return { ...a, progress: Math.min(3, activeSynergies) };
        if (a.id === 'gold_hoarder_150') return { ...a, progress: Math.min(150, curPlayer.gold) };
        return a;
      })
    );
  }, [unlockAchievement]);

  // Update item synergies and player stats
  const syncSynergiesAndStats = useCallback((items: PlacedItemInstance[], currentHp?: number) => {
    const curPlayer = playerRef.current;
    const curGridSize = curPlayer.backpackGridSize || 5;

    const {
      totalAtk,
      totalDef,
      maxHpBonus,
      stepRegen,
      lifesteal,
      critChance,
      dodgeRate,
      lootFindPct,
      activeSynergiesCount,
      updatedItems
    } = calculateSynergies(items, curGridSize, {
      baseAtk: curPlayer.baseAtk,
      baseDef: curPlayer.baseDef
    });

    const newMaxHp = 100 + maxHpBonus;
    const resolvedHp = currentHp !== undefined
      ? Math.min(newMaxHp, currentHp)
      : Math.min(newMaxHp, curPlayer.hp);

    setPlacedItems(updatedItems);
    setPlayer(prev => {
      const updatedPlayer = {
        ...prev,
        maxHp: newMaxHp,
        hp: resolvedHp,
        totalAtk,
        totalDef,
        stepRegen,
        lifesteal,
        critChance,
        dodgeRate,
        lootFindPct
      };
      evaluateAchievements(updatedPlayer, updatedItems, activeSynergiesCount);
      return updatedPlayer;
    });

    return updatedItems;
  }, [evaluateAchievements]);

  // Generate Merchant Goods
  const generateMerchantGoods = useCallback(() => {
    const goods: InventoryItem[] = [];
    // 1 guaranteed repair tool so players can always maintain equipment
    const toolTmpl = Math.random() < 0.6 ? getItemTemplate('repair_kit') : getItemTemplate('rune_polish');
    const toolItem = createItemInstance(toolTmpl.id, toolTmpl.rarity);
    goods.push({ ...toolItem, price: calculateItemPrice(toolItem) });

    // 3 Rare and Legendary items with rich random affixes
    const gearTemplates = ITEM_TEMPLATES.filter(t => t.type !== 'tool').sort(() => Math.random() - 0.5);
    for (let i = 0; i < 3; i++) {
      const tmpl = gearTemplates[i % gearTemplates.length];
      const rarity = i >= 1 ? 'legendary' : 'rare';
      const item = createItemInstance(tmpl.id, rarity);
      const price = calculateItemPrice(item);
      goods.push({ ...item, price });
    }
    return goods;
  }, []);

  // Initialize Game on Mount
  const initializeGame = useCallback(() => {
    // Starting items: 1 Iron Sword, 1 Heavy Wood Shield
    const sword = createItemInstance('iron_sword', 'common');
    sword.gridR = 1;
    sword.gridC = 1;

    const shield = createItemInstance('wooden_shield', 'common');
    shield.gridR = 1;
    shield.gridC = 3;

    const initialPlaced = [sword, shield];

    // Loot tray starts with a Potion and a Whetstone
    const potion = createItemInstance('health_potion', 'common');
    const whetstone = createItemInstance('whetstone', 'rare');

    setPlacedItems(initialPlaced);
    setLootTrayItems([potion, whetstone]);
    setHeldItem(null);
    setIsInCombat(false);
    setCurrentMonster(null);
    setIsGameOver(false);
    setIsMerchantOpen(false);
    setCurrentCombatActions([]);
    setCombatRecords([]);

    setPlayer({
      maxHp: 100,
      hp: 100,
      baseAtk: 2,
      baseDef: 0,
      totalAtk: 2,
      totalDef: 0,
      stepRegen: 0,
      lifesteal: 0,
      critChance: 5,
      gold: 20, // Starting gold
      loop: 1,
      nodeIndex: 0,
      progressOnTrack: 0,
      totalKills: 0,
      totalSteps: 0,
      totalDamageDealt: 0,
      backpackGridSize: 5,
      dodgeRate: 0,
      lootFindPct: 0
    });

    setLogs([]);
    addLog('⚔️ 冒險啟程！收集各類幾何裝備與詞綴，在無限循環中活下去！', 'buff');

    // Run first calculation
    syncSynergiesAndStats(initialPlaced, 100);
  }, [addLog, syncSynergiesAndStats]);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  // Drop random loot into tray (factoring in player's lootFindPct)
  const dropLoot = useCallback((count = 1): InventoryItem[] => {
    const curP = playerRef.current;
    const newItems: InventoryItem[] = [];
    for (let i = 0; i < count; i++) {
      const randT = ITEM_TEMPLATES[Math.floor(Math.random() * ITEM_TEMPLATES.length)];
      const rarity = rollRandomRarity(curP.lootFindPct || 0);
      const item = createItemInstance(randT.id, rarity);
      newItems.push(item);
      const rarityBadge = item.rarity === 'legendary' ? '【傳說】' : item.rarity === 'rare' ? '【稀有】' : '【普通】';
      addLog(`🎁 獲得新戰利品：${rarityBadge} ${item.name} (${item.w}×${item.h})`, 'loot');
    }

    // Dynamic drop: If hero has broken or severely damaged equipment, high chance to drop emergency repair kit!
    const hasBrokenGear = placedItemsRef.current.some(p => p.isBroken || (p.maxDurability > 0 && p.currentDurability < 15));
    if (hasBrokenGear && Math.random() < 0.6) {
      const toolT = Math.random() < 0.7 ? 'repair_kit' : 'rune_polish';
      const toolItem = createItemInstance(toolT);
      newItems.push(toolItem);
      addLog(`🧰 戰利品中尋得應急維修工具：【${toolItem.name}】！可用於修復破損裝備。`, 'loot');
    }

    soundFX.playChest();
    setLootTrayItems(prev => [...prev, ...newItems]);
    return newItems;
  }, [addLog]);

  // Auto-fill loot into available slots in backpack
  const handleAutoEquipAll = useCallback(() => {
    const curGridSize = playerRef.current.backpackGridSize || 5;
    const curGrid = buildGrid(placedItemsRef.current, curGridSize);
    const remainingLoot: InventoryItem[] = [];
    const newlyPlaced: PlacedItemInstance[] = [...placedItemsRef.current];

    for (const lootItem of lootTrayItems) {
      let placed = false;
      for (let r = 0; r < curGridSize && !placed; r++) {
        for (let c = 0; c < curGridSize && !placed; c++) {
          if (canPlaceItem(lootItem, r, c, curGrid, curGridSize)) {
            const placedInst: PlacedItemInstance = {
              ...(lootItem as PlacedItemInstance),
              gridR: r,
              gridC: c
            };
            newlyPlaced.push(placedInst);
            for (let ir = 0; ir < lootItem.h; ir++) {
              for (let ic = 0; ic < lootItem.w; ic++) {
                if (lootItem.shape[ir][ic] === 1) {
                  curGrid[r + ir][c + ic] = placedInst;
                }
              }
            }
            placed = true;
          }
        }
      }
      if (!placed) {
        remainingLoot.push(lootItem);
      }
    }

    if (newlyPlaced.length > placedItemsRef.current.length) {
      soundFX.playItemPlace();
      syncSynergiesAndStats(newlyPlaced);
      setLootTrayItems(remainingLoot);
      addLog(`✨ 自動裝備了 ${newlyPlaced.length - placedItemsRef.current.length} 件物品！`, 'buff');
    } else {
      addLog('⚠️ 背包空間不足或形狀不吻合，無法自動裝備更多物品。', 'info');
    }
  }, [lootTrayItems, syncSynergiesAndStats, addLog]);

  // Process node step event
  const processNodeEvent = useCallback((node: TrackNode) => {
    const curP = playerRef.current;

    // Passive step regen from potions
    if (curP.stepRegen > 0 && curP.hp < curP.maxHp) {
      const healAmount = curP.stepRegen;
      const newHp = Math.min(curP.maxHp, curP.hp + healAmount);
      setPlayer(prev => ({ ...prev, hp: newHp }));
      soundFX.playHeal();
      addLog(`🧪 藥水協同滋養：回復了 ${healAmount} 點生命值`, 'camp');
    }

    if (node.type === 'camp') {
      const healAmount = Math.round(25 + curP.maxHp * 0.1);
      const newHp = Math.min(curP.maxHp, curP.hp + healAmount);
      setPlayer(prev => ({ ...prev, hp: newHp }));
      soundFX.playHeal();

      // Camp event repairs all gear by +5 durability
      let anyRepaired = false;
      const repairedGear = placedItemsRef.current.map(item => {
        if (item.maxDurability > 0 && item.currentDurability < item.maxDurability) {
          anyRepaired = true;
          const newDur = Math.min(item.maxDurability, item.currentDurability + 5);
          return { ...item, currentDurability: newDur, isBroken: newDur <= 0 };
        }
        return item;
      });

      if (anyRepaired) {
        syncSynergiesAndStats(repairedGear);
        addLog(`⛺ 營地營火整備：生命回復 ${healAmount} 點，全套裝備磨礪保養 +5 耐久度！`, 'camp');
      } else {
        addLog(`⛺ 抵達營地休憩！生命值回復 ${healAmount} 點`, 'camp');
      }
    } else if (node.type === 'merchant') {
      // Wandering merchant encountered!
      prevGameSpeedRef.current = gameSpeedRef.current;
      setGameSpeed(0); // Pause game
      soundFX.playChest();
      setMerchantGoods(generateMerchantGoods());
      setIsMerchantOpen(true);
      addLog('🧙‍♂️ 巧遇流浪商人！已暫停遊戲開啟神秘商店。', 'buff');
    } else if (node.type === 'monster') {
      const monster = generateMonsterForLoop(curP.loop, false);
      setCurrentMonster(monster);
      setIsInCombat(true);
      setCurrentCombatActions([]);
      setMonsterStunnedTurns(0);
      setPlayerShieldPoints(0);
      setCurrentEnvironmentalEvent(null);
      soundFX.playAttack();
      addLog(`⚔️ 遭遇魔物【${monster.name}】(HP: ${monster.maxHp}, 攻: ${monster.atk})！`, 'combat');
    } else if (node.type === 'chest') {
      addLog(`💎 發現寶庫寶箱！`, 'loot');
      dropLoot(2);
    } else if (node.type === 'shrine') {
      const goldGain = 20 + curP.loop * 8;
      setPlayer(prev => ({ ...prev, gold: prev.gold + goldGain }));
      soundFX.playChest();
      addLog(`⛩️ 古老神龕賜福：獲得 ${goldGain} 枚閃耀金幣！`, 'buff');
    } else if (node.type === 'forge') {
      // Forge restores all placed equipment to 100% full durability!
      const fullyRepaired = placedItemsRef.current.map(item => {
        if (item.maxDurability > 0) {
          return { ...item, currentDurability: item.maxDurability, isBroken: false };
        }
        return item;
      });
      syncSynergiesAndStats(fullyRepaired);

      const gem = createItemInstance('magma_core', 'legendary');
      setLootTrayItems(prev => [...prev, gem]);
      soundFX.playBlock();
      addLog(`⚒️ 荒野鐵砧聖火鍛造：所有裝備徹底修復至滿耐久度！並獲得史詩鍛造物【${gem.name}】！`, 'buff');
    }
  }, [addLog, dropLoot, generateMerchantGoods, syncSynergiesAndStats]);

  // Combat Step Execution Loop
  useEffect(() => {
    if (!isInCombat || !currentMonster || isGameOver) return;

    const combatIntervalMs = gameSpeedRef.current === 3 ? 180 : gameSpeedRef.current === 2 ? 350 : 650;
    if (gameSpeedRef.current === 0) return; // paused

    const timer = setTimeout(() => {
      const curPlayer = playerRef.current;
      const monster = currentMonsterRef.current;
      if (!monster) return;

      const currentRound = Math.floor(currentCombatActions.length / 2) + 1;

      // 0. Active Skills Automatic Trigger on Cooldown Ready!
      let skillBonusDmg = 0;
      activeSkillsRef.current.forEach(skill => {
        if (skill.isReady || skill.currentCooldown <= 0) {
          const rune = skill.rune;
          setActiveCastRuneId(rune.id);
          setTimeout(() => setActiveCastRuneId(null), 650);

          if (rune.type === 'shield') {
            const shieldGain = Math.min(80, Math.max(25, Math.round(curPlayer.maxHp * 0.35)));
            setPlayerShieldPoints(prev => prev + shieldGain);
            soundFX.playSkillCast();
            addDamagePopup(`🛡️ 聖光神盾 +${shieldGain}`, 'skill', 'player');
            addLog(`✨ 【聖光神盾】神聖符文充能完畢！勇者獲得 ${shieldGain} 點吸收護盾！`, 'buff');
          } else if (rune.type === 'stun') {
            setMonsterStunnedTurns(prev => prev + 1);
            skillBonusDmg += 40;
            soundFX.playSkillCast();
            triggerShake('monster');
            addDamagePopup('⚡ 雷霆震擊! -40 [眩暈]', 'skill', 'monster');
            addLog(`⚡ 【雷霆震擊】神霄雷霆轟頂！對【${monster.name}】造成 40 點雷傷害，並使魔物陷入眩暈！`, 'combat');
          } else if (rune.type === 'rage') {
            const rageDmg = Math.round(curPlayer.totalAtk * 2.5);
            skillBonusDmg += rageDmg;
            soundFX.playCrit();
            triggerShake('monster');
            addDamagePopup(`🔥 狂怒斬擊! -${rageDmg} [真傷]`, 'skill', 'monster');
            addLog(`🔥 【狂怒爆發】狂戰熱血沸騰！瞬發真實斬擊重創【${monster.name}】造成 ${rageDmg} 點暴擊傷害！`, 'combat');
          } else if (rune.type === 'heal') {
            const healAmt = Math.round(curPlayer.maxHp * 0.3);
            setPlayer(prev => ({ ...prev, hp: Math.min(prev.maxHp, prev.hp + healAmt) }));
            soundFX.playHeal();
            addDamagePopup(`🌿 甘霖回春! +${healAmt} HP [修復+5]`, 'skill', 'player');
            addLog(`🌿 【甘霖回春】大地生命狂湧！回復 ${healAmt} 點生命，並修復全套裝備 5 點耐久！`, 'buff');
            const repaired = placedItemsRef.current.map(p => {
              if (p.maxDurability > 0 && p.currentDurability < p.maxDurability) {
                const nd = Math.min(p.maxDurability, p.currentDurability + 5);
                return { ...p, currentDurability: nd, isBroken: false };
              }
              return p;
            });
            syncSynergiesAndStats(repaired);
          } else if (rune.type === 'arcane') {
            const arcaneDmg = 75;
            skillBonusDmg += arcaneDmg;
            soundFX.playSkillCast();
            triggerShake('monster');
            addDamagePopup(`🔮 奧術連彈! -${arcaneDmg}`, 'skill', 'monster');
            addLog(`🔮 【奧術轟炸】三連發高能奧術飛彈齊射！對【${monster.name}】造成 ${arcaneDmg} 點無視防禦魔法傷害！`, 'combat');
          }

          // Reset cooldown
          setActiveSkills(prev =>
            prev.map(s => (s.rune.id === rune.id ? { ...s, currentCooldown: rune.cooldownMax, isReady: false, totalCasts: s.totalCasts + 1 } : s))
          );
        }
      });

      // Environmental Random Event Trigger (~28% chance per combat tick when not currently active)
      let envBonusDmgToMonster = 0;
      let envDmgToPlayer = 0;
      if (!currentEnvironmentalEventRef.current && Math.random() < 0.28) {
        const envEvent = getRandomEnvironmentalEvent();
        setCurrentEnvironmentalEvent(envEvent);
        currentEnvironmentalEventRef.current = envEvent;
        setTimeout(() => {
          setCurrentEnvironmentalEvent(null);
        }, 3200);

        if (envEvent.type === 'storm') {
          // Storm: All targets damage
          const stormDmgMonster = Math.floor(Math.random() * 16) + 35; // 35-50
          const stormDmgPlayer = Math.max(3, Math.floor(Math.random() * 5) + 8 - Math.floor(curPlayer.totalDef * 0.3));
          envBonusDmgToMonster += stormDmgMonster;
          envDmgToPlayer += stormDmgPlayer;
          soundFX.playSkillCast();
          triggerShake('monster');
          addDamagePopup(`⚡ 風暴天殛! -${stormDmgMonster}`, 'event', 'monster');
          addDamagePopup(`⚡ 暴風波及! -${stormDmgPlayer}`, 'event', 'player');
          addLog(`🌪️ 【${envEvent.name}】狂怒暴風雨席捲戰場！【${monster.name}】受 ${stormDmgMonster} 點雷殛，勇者受 ${stormDmgPlayer} 點感電傷害！`, 'danger');
        } else if (envEvent.type === 'blessing') {
          // Blessing: Holy heal + shield
          const healVal = Math.floor(Math.random() * 20) + 25; // 25-45
          const shieldVal = 15;
          setPlayer(prev => ({ ...prev, hp: Math.min(prev.maxHp, prev.hp + healVal) }));
          setPlayerShieldPoints(prev => prev + shieldVal);
          soundFX.playHeal();
          addDamagePopup(`✨ 聖光恩賜! +${healVal} HP`, 'event', 'player');
          addDamagePopup(`🛡️ 神聖護盾 +${shieldVal}`, 'skill', 'player');
          addLog(`✨ 【${envEvent.name}】遠古聖樹光環降臨！勇者回復 ${healVal} 點生命，並構築 ${shieldVal} 點神聖屏障！`, 'buff');
        } else if (envEvent.type === 'volcano') {
          // Volcano: Heavy flame damage
          const fireDmg = Math.floor(Math.random() * 25) + 40; // 40-65
          envBonusDmgToMonster += fireDmg;
          soundFX.playCrit();
          triggerShake('monster');
          addDamagePopup(`🌋 熔岩火海! -${fireDmg}`, 'event', 'monster');
          addLog(`🌋 【${envEvent.name}】地熱熔漿破土噴發！對【${monster.name}】造成 ${fireDmg} 點火焰灼燒傷害！`, 'combat');
        } else if (envEvent.type === 'arcane_fog') {
          // Arcane fog: Mist confuses enemy, cancels next monster attack
          setMonsterStunnedTurns(prev => prev + 1);
          soundFX.playRotate();
          addDamagePopup('🌫️ 幻境秘霧 [敵方迷失]', 'event', 'monster');
          addLog(`🌫️ 【${envEvent.name}】濃密秘霧瀰漫戰場！【${monster.name}】完全失去目標，本回合攻擊將落空！`, 'buff');
        } else if (envEvent.type === 'fortune_winds') {
          // Fortune winds: bonus gold & inspiration
          const bonusGold = Math.floor(Math.random() * 15) + 15;
          setPlayer(prev => ({ ...prev, gold: prev.gold + bonusGold }));
          soundFX.playLoopComplete();
          addDamagePopup(`🪙 祥風餽贈! +${bonusGold}G`, 'event', 'player');
          addLog(`🪙 【${envEvent.name}】古老財富之風席捲戰場！立即拾獲 ${bonusGold} 枚散落金幣！`, 'loot');
        }
      }

      if (envDmgToPlayer > 0) {
        setPlayer(prev => ({ ...prev, hp: Math.max(1, prev.hp - envDmgToPlayer) }));
      }

      // 1. Player attacks monster
      const isCrit = Math.random() * 100 < curPlayer.critChance;
      const baseDmg = curPlayer.totalAtk;
      const playerDamage = isCrit ? Math.round(baseDmg * 1.5) : baseDmg;

      const monsterDef = monster.def;
      const normalDmgToMonster = Math.max(1, playerDamage - monsterDef);
      const actualDmgToMonster = normalDmgToMonster + skillBonusDmg + envBonusDmgToMonster;
      const newMonsterHp = Math.max(0, monster.currentHp - actualDmgToMonster);

      // Trigger target shake & damage popup!
      triggerShake('monster');
      if (isCrit) {
        addDamagePopup(`💥 暴擊! -${actualDmgToMonster}`, 'crit', 'monster');
      } else {
        addDamagePopup(`-${actualDmgToMonster}`, 'damage', 'monster');
      }

      // Lifesteal heal
      let lifestealHealed = 0;
      if (curPlayer.lifesteal > 0) {
        lifestealHealed = Math.round((actualDmgToMonster * curPlayer.lifesteal) / 100);
        if (lifestealHealed > 0) {
          addDamagePopup(`💖 +${lifestealHealed} HP`, 'heal', 'player');
        }
      }

      const playerAction: CombatAction = {
        round: currentRound,
        actor: 'player',
        type: isCrit ? 'crit' : 'attack',
        damage: actualDmgToMonster,
        blocked: 0,
        healed: lifestealHealed,
        playerHpAfter: Math.min(curPlayer.maxHp, curPlayer.hp + lifestealHealed),
        monsterHpAfter: newMonsterHp,
        description: isCrit
          ? `💥 勇者暴擊斬擊，造成 ${actualDmgToMonster} 點暴擊傷害！`
          : `🗡️ 勇者揮劍攻擊，造成 ${actualDmgToMonster} 點傷害。`
      };

      setPlayer(prev => ({
        ...prev,
        hp: Math.min(prev.maxHp, prev.hp + lifestealHealed),
        totalDamageDealt: prev.totalDamageDealt + actualDmgToMonster
      }));

      // Durability loss for weapons on attack
      let weaponBroke = false;
      const itemsAfterWeaponAtk = placedItemsRef.current.map(item => {
        if (item.type === 'weapon' && item.maxDurability > 0) {
          const newDur = Math.max(0, item.currentDurability - 1);
          if (newDur === 0 && !item.isBroken) weaponBroke = true;
          return {
            ...item,
            currentDurability: newDur,
            isBroken: newDur <= 0
          };
        }
        return item;
      });

      if (weaponBroke) {
        addDamagePopup('⚠️ 武器破損!', 'damage', 'player');
        addLog('⚠️ 激烈斬擊導致武器耐久耗盡破損！攻擊力效果減半，請儘速修理！', 'danger');
      }
      syncSynergiesAndStats(itemsAfterWeaponAtk);

      if (isCrit) {
        soundFX.playCrit();
        addLog(`💥 暴擊！對【${monster.name}】造成 ${actualDmgToMonster} 點暴擊重創！`, 'combat');
      } else {
        soundFX.playAttack();
        addLog(`🗡️ 你斬擊【${monster.name}】，造成 ${actualDmgToMonster} 點傷害。`, 'combat');
      }

      // Check Monster Defeat
      if (newMonsterHp <= 0) {
        soundFX.playLoopComplete();
        const goldGain = monster.goldReward;
        const defeatAction: CombatAction = {
          round: currentRound,
          actor: 'player',
          type: 'defeat',
          damage: 0,
          blocked: 0,
          healed: 0,
          playerHpAfter: curPlayer.hp,
          monsterHpAfter: 0,
          description: `✨ 成功擊潰魔物【${monster.name}】！贏得 ${goldGain} 金幣！`
        };

        const finalActions = [...currentCombatActions, playerAction, defeatAction];

        // Drop loot items and associate with combat replay record!
        const droppedItems = dropLoot(monster.lootDropCount);

        // Save into combat replay records!
        const record: CombatRecord = {
          id: `combat_${Date.now()}`,
          timestamp: Date.now(),
          monsterName: monster.name,
          monsterIcon: monster.icon,
          monsterMaxHp: monster.maxHp,
          isBoss: monster.isBoss,
          loop: curPlayer.loop,
          victory: true,
          totalRounds: currentRound,
          goldEarned: goldGain,
          lootCount: droppedItems.length,
          droppedItems,
          actions: finalActions
        };

        setCombatRecords(prev => [record, ...prev.slice(0, 9)]);
        setCurrentCombatActions([]);

        setPlayer(prev => {
          const updated = {
            ...prev,
            gold: prev.gold + goldGain,
            totalKills: prev.totalKills + 1
          };
          evaluateAchievements(updated, placedItemsRef.current, 0, !!monster.isBoss);
          return updated;
        });

        setIsInCombat(false);
        setCurrentMonster(null);
        addLog(`🎉 成功擊殺【${monster.name}】！獲得 ${goldGain} 金幣！`, 'buff');
        return;
      }

      // 2. Monster survives, attacks player (Check Stun, Dodge & Armor/Shield Block)
      if (monsterStunnedTurnsRef.current > 0) {
        setMonsterStunnedTurns(prev => Math.max(0, prev - 1));
        addDamagePopup('💫 眩暈癱瘓! 跳過攻擊', 'dodge', 'monster');
        addLog(`💫 【${monster.name}】受到雷霆震擊眩暈癱瘓，本回合無法攻擊！`, 'buff');

        const stunAction: CombatAction = {
          round: currentRound,
          actor: 'monster',
          type: 'dodge',
          damage: 0,
          blocked: 0,
          healed: 0,
          playerHpAfter: curPlayer.hp,
          monsterHpAfter: newMonsterHp,
          description: `💫 【${monster.name}】受雷霆眩暈癱瘓，跳過本回合反擊！`
        };

        setCurrentCombatActions(prev => [...prev, playerAction, stunAction]);
        setCurrentMonster(prev => (prev ? { ...prev, currentHp: newMonsterHp } : null));
        return;
      }

      const isDodged = Math.random() * 100 < (curPlayer.dodgeRate || 0);

      if (isDodged) {
        soundFX.playRotate();
        addDamagePopup('💨 完美閃避！0', 'dodge', 'player');
        addLog(`💨 勇者身法靈動，成功閃避了【${monster.name}】的攻擊！`, 'buff');

        const dodgeAction: CombatAction = {
          round: currentRound,
          actor: 'monster',
          type: 'dodge',
          damage: 0,
          blocked: 0,
          healed: 0,
          playerHpAfter: curPlayer.hp,
          monsterHpAfter: newMonsterHp,
          description: `💨 勇者靈動閃避了【${monster.name}】的攻擊！毫髮無傷！`
        };

        setCurrentCombatActions(prev => [...prev, playerAction, dodgeAction]);
        setCurrentMonster(prev => (prev ? { ...prev, currentHp: newMonsterHp } : null));
        return;
      }

      // If not dodged:
      triggerShake('player');
      const incomingAtk = monster.atk;
      const damageBlocked = curPlayer.totalDef;
      let actualDmgToPlayer = Math.max(1, incomingAtk - damageBlocked);

      // Check Shield Points absorb
      if (playerShieldPointsRef.current > 0) {
        const absorb = Math.min(playerShieldPointsRef.current, actualDmgToPlayer);
        setPlayerShieldPoints(prev => Math.max(0, prev - absorb));
        actualDmgToPlayer = Math.max(0, actualDmgToPlayer - absorb);
        addDamagePopup(`🛡️ 護盾吸收 -${absorb}`, 'block', 'player');
        addLog(`🛡️ 聖光神盾抵擋了 ${absorb} 點傷害！剩餘護盾：${Math.max(0, playerShieldPointsRef.current - absorb)}`, 'buff');
      }

      const newPlayerHp = Math.max(0, curPlayer.hp - actualDmgToPlayer);

      if (damageBlocked > 0) {
        addDamagePopup(`🛡️ 格擋 -${Math.min(incomingAtk, damageBlocked)}`, 'block', 'player');
      }
      addDamagePopup(`-${actualDmgToPlayer}`, 'damage', 'player');

      const monsterAction: CombatAction = {
        round: currentRound,
        actor: 'monster',
        type: damageBlocked > 0 ? 'block' : 'attack',
        damage: actualDmgToPlayer,
        blocked: damageBlocked,
        healed: 0,
        playerHpAfter: newPlayerHp,
        monsterHpAfter: newMonsterHp,
        description: `🛡️ 【${monster.name}】反擊！護甲格擋 ${damageBlocked} 點，勇者受到 ${actualDmgToPlayer} 點傷害。`
      };

      setCurrentCombatActions(prev => [...prev, playerAction, monsterAction]);

      // Durability loss for shields & armors on taking attack / blocking
      let armorBroke = false;
      const itemsAfterArmorDef = placedItemsRef.current.map(item => {
        if ((item.type === 'shield' || item.type === 'armor') && item.maxDurability > 0) {
          const newDur = Math.max(0, item.currentDurability - 1);
          if (newDur === 0 && !item.isBroken) armorBroke = true;
          return {
            ...item,
            currentDurability: newDur,
            isBroken: newDur <= 0
          };
        }
        return item;
      });

      if (armorBroke) {
        addDamagePopup('⚠️ 防具破損!', 'damage', 'player');
        addLog('⚠️ 劇烈格擋導致防具耐久耗盡破損！護甲效果減半，請儘速修理！', 'danger');
      }
      syncSynergiesAndStats(itemsAfterArmorDef);

      if (damageBlocked > 0) {
        soundFX.playBlock();
      } else {
        soundFX.playHit();
      }

      addLog(
        `🛡️ 【${monster.name}】反擊！護甲格擋 ${Math.min(incomingAtk, damageBlocked)}，受到 ${actualDmgToPlayer} 點傷害。`,
        'danger'
      );

      setPlayer(prev => ({ ...prev, hp: newPlayerHp }));
      setCurrentMonster(prev => (prev ? { ...prev, currentHp: newMonsterHp } : null));

      // Player Defeated Check
      if (newPlayerHp <= 0) {
        soundFX.playGameOver();
        setIsGameOver(true);
        setIsInCombat(false);
        addLog(`💀 體力不支...你在第 ${curPlayer.loop} 圈倒下了！`, 'danger');
      }
    }, combatIntervalMs);

    return () => clearTimeout(timer);
  }, [isInCombat, currentMonster, isGameOver, gameSpeed, currentCombatActions, addLog, dropLoot, evaluateAchievements]);

  // Main Movement & Track Loop
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loopStep = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      if (!isInCombatRef.current && !isGameOverRef.current && !isMerchantOpenRef.current && gameSpeedRef.current > 0) {
        const speedMultiplier = gameSpeedRef.current === 3 ? 3.0 : gameSpeedRef.current === 2 ? 1.8 : 1.0;
        const progressIncrement = dt * 1.3 * speedMultiplier;

        setPlayer(prev => {
          let newProgress = prev.progressOnTrack + progressIncrement;
          let newNodeIndex = prev.nodeIndex;
          let newLoop = prev.loop;

          if (newProgress >= 1.0) {
            newProgress = 0;
            newNodeIndex = (prev.nodeIndex + 1) % trackNodes.length;
            soundFX.playStep();

            // Completed full loop circuit!
            if (newNodeIndex === 0) {
              newLoop += 1;
              soundFX.playLoopComplete();
              addLog(`🏁 成功完成第 ${prev.loop} 圈巡航！進入第 ${newLoop} 圈，魔物實力提升！`, 'buff');
              if (newLoop % 3 === 0) {
                confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
              }
            }

            const targetNode = trackNodes[newNodeIndex];
            setTimeout(() => {
              processNodeEvent(targetNode);
            }, 0);
          }

          return {
            ...prev,
            progressOnTrack: newProgress,
            nodeIndex: newNodeIndex,
            loop: newLoop,
            totalSteps: prev.totalSteps + 1
          };
        });
      }

      animId = requestAnimationFrame(loopStep);
    };

    animId = requestAnimationFrame(loopStep);
    return () => cancelAnimationFrame(animId);
  }, [trackNodes, addLog, processNodeEvent]);

  // Mouse move tracker for drag preview
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Keybindings saving and reset
  const handleSaveKeybindings = useCallback((newConfig: KeybindingsConfig) => {
    setKeybindings(newConfig);
    try {
      localStorage.setItem('loot_loop_keybindings', JSON.stringify(newConfig));
    } catch {
      // ignore
    }
    addLog('⌨️ 已成功儲存自訂快捷鍵設定！', 'buff');
  }, [addLog]);

  const handleResetKeybindings = useCallback(() => {
    const defaults: KeybindingsConfig = {
      rotateItem: 'r',
      togglePause: ' ',
      speed1: '1',
      speed2: '2',
      speed3: '3',
      autoEquip: 'e',
      openCodex: 'c',
      openAchievements: 'a',
      openReplay: 'v',
      openHelp: 'h',
      openSettings: 'k'
    };
    handleSaveKeybindings(defaults);
  }, [handleSaveKeybindings]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const targetTag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (targetTag === 'input' || targetTag === 'textarea') return;

      const k = e.key.toLowerCase();
      const cfg = keybindingsRef.current;

      if (k === cfg.rotateItem.toLowerCase()) {
        if (heldItemRef.current) {
          e.preventDefault();
          handleRotateHeldItem();
        }
      } else if (k === cfg.togglePause.toLowerCase()) {
        e.preventDefault();
        setGameSpeed(prev => (prev === 0 ? 1 : 0));
      } else if (k === cfg.speed1.toLowerCase()) {
        e.preventDefault();
        setGameSpeed(1);
      } else if (k === cfg.speed2.toLowerCase()) {
        e.preventDefault();
        setGameSpeed(2);
      } else if (k === cfg.speed3.toLowerCase()) {
        e.preventDefault();
        setGameSpeed(3);
      } else if (k === cfg.autoEquip.toLowerCase()) {
        e.preventDefault();
        handleAutoEquipAll();
      } else if (k === cfg.openCodex.toLowerCase()) {
        e.preventDefault();
        setIsCodexOpen(prev => !prev);
      } else if (k === cfg.openAchievements.toLowerCase()) {
        e.preventDefault();
        setIsAchievementsOpen(prev => !prev);
      } else if (k === cfg.openReplay.toLowerCase()) {
        e.preventDefault();
        setIsReplayOpen(prev => !prev);
      } else if (k === cfg.openHelp.toLowerCase()) {
        e.preventDefault();
        setIsHowToPlayOpen(prev => !prev);
      } else if (k === cfg.openSettings.toLowerCase()) {
        e.preventDefault();
        setIsKeybindingsOpen(prev => !prev);
      } else if (e.key === 'Escape') {
        if (heldItemRef.current) {
          handleCancelHeldItem();
        } else if (isMerchantOpenRef.current) {
          setIsMerchantOpen(false);
          setGameSpeed(prevGameSpeedRef.current || 1);
        } else if (isKeybindingsOpen) {
          setIsKeybindingsOpen(false);
        } else if (isAchievementsOpen) {
          setIsAchievementsOpen(false);
        } else if (isReplayOpen) {
          setIsReplayOpen(false);
        } else if (isHowToPlayOpen) {
          setIsHowToPlayOpen(false);
        } else if (isCodexOpen) {
          setIsCodexOpen(false);
        } else if (isSkillRunesOpen) {
          setIsSkillRunesOpen(false);
        } else if (isPresetsOpen) {
          setIsPresetsOpen(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleAutoEquipAll, isAchievementsOpen, isCodexOpen, isHowToPlayOpen, isKeybindingsOpen, isPresetsOpen, isReplayOpen, isSkillRunesOpen]);

  // Rotate held item
  const handleRotateHeldItem = () => {
    if (!heldItemRef.current) return;
    const item = heldItemRef.current;
    const { newShape, newW, newH } = rotateShape(item.shape, item.w, item.h);
    soundFX.playRotate();
    setHeldItem(prev => {
      if (!prev) return null;
      return {
        ...prev,
        w: newW,
        h: newH,
        shape: newShape
      };
    });
  };

  // Pick item from backpack
  const handlePickBackpackItem = (item: PlacedItemInstance) => {
    soundFX.playItemPickup();
    const remaining = placedItems.filter(p => p.instanceId !== item.instanceId);
    setPlacedItems(remaining);
    syncSynergiesAndStats(remaining);
    setHeldItem(item);
  };

  // Place held item onto backpack
  const handlePlaceBackpackItem = (r: number, c: number) => {
    if (!heldItem) return;

    soundFX.playItemPlace();
    const placedInstance: PlacedItemInstance = {
      ...(heldItem as PlacedItemInstance),
      gridR: r,
      gridC: c
    };

    const newPlaced = [...placedItems, placedInstance];
    syncSynergiesAndStats(newPlaced);
    setHeldItem(null);

    setTimeout(() => {
      const activeSynergies = placedItemsRef.current.filter(p => p.isSynergyActive);
      if (activeSynergies.length > 0) {
        soundFX.playSynergy();
      }
    }, 50);
  };

  // Repair item with held repair tool
  const handleRepairItemWithHeldTool = useCallback((targetItem: PlacedItemInstance) => {
    const curTool = heldItemRef.current;
    if (!curTool || !curTool.isRepairTool) return;

    if (targetItem.maxDurability <= 0 || targetItem.type === 'potion' || targetItem.type === 'gem') {
      addLog('⚠️ 該物品不需要修復。', 'info');
      return;
    }

    if (targetItem.currentDurability >= targetItem.maxDurability) {
      addLog(`✨ 【${targetItem.name}】耐久度已滿 (${targetItem.maxDurability}/${targetItem.maxDurability})，無須修理。`, 'info');
      return;
    }

    const repairAmount = curTool.repairPower || 25;
    const newDur = Math.min(targetItem.maxDurability, targetItem.currentDurability + repairAmount);

    soundFX.playBlock();
    addDamagePopup(`🔨 +${repairAmount} 耐久`, 'heal', 'player');
    addLog(`🔨 使用【${curTool.name}】成功為【${targetItem.name}】修復 +${repairAmount} 耐久！(${newDur}/${targetItem.maxDurability})`, 'buff');

    const updated = placedItemsRef.current.map(p => {
      if (p.instanceId === targetItem.instanceId) {
        return {
          ...p,
          currentDurability: newDur,
          isBroken: false
        };
      }
      return p;
    });
    syncSynergiesAndStats(updated);

    // Decrement tool usage
    const chargesLeft = (curTool.currentDurability || 1) - 1;
    if (chargesLeft <= 0) {
      setHeldItem(null);
      addLog(`🧰 修理工具【${curTool.name}】次數已用盡。`, 'info');
    } else {
      setHeldItem(prev => (prev ? { ...prev, currentDurability: chargesLeft } : null));
      addLog(`🧰 工具剩餘使用次數：${chargesLeft} 次`, 'info');
    }
  }, [addDamagePopup, addLog, syncSynergiesAndStats]);

  // One-click quick repair with repair tool from Loot Tray
  const handleUseRepairToolFromTray = useCallback((toolItem: InventoryItem) => {
    const placed = placedItemsRef.current.filter(p => p.maxDurability > 0 && p.type !== 'potion' && p.type !== 'gem');
    if (placed.length === 0) {
      addLog('⚠️ 背包內尚無可修復的裝備。', 'info');
      return;
    }

    // Sort by durability percentage ascending
    const sorted = [...placed].sort((a, b) => (a.currentDurability / a.maxDurability) - (b.currentDurability / b.maxDurability));
    const target = sorted[0];

    if (target.currentDurability >= target.maxDurability) {
      addLog('✨ 背包內所有裝備均為滿耐久狀態，無需修復！', 'info');
      return;
    }

    const repairAmount = toolItem.repairPower || 25;
    const newDur = Math.min(target.maxDurability, target.currentDurability + repairAmount);

    soundFX.playBlock();
    addDamagePopup(`🔨 +${repairAmount} 耐久`, 'heal', 'player');
    addLog(`🔨 使用【${toolItem.name}】一鍵修復了受損最嚴重的【${target.name}】+${repairAmount} 耐久！(${newDur}/${target.maxDurability})`, 'buff');

    const updated = placedItemsRef.current.map(p => {
      if (p.instanceId === target.instanceId) {
        return {
          ...p,
          currentDurability: newDur,
          isBroken: false
        };
      }
      return p;
    });
    syncSynergiesAndStats(updated);

    const chargesLeft = (toolItem.currentDurability || 1) - 1;
    if (chargesLeft <= 0) {
      setLootTrayItems(prev => prev.filter(i => i.instanceId !== toolItem.instanceId));
      addLog(`🧰 修理工具【${toolItem.name}】次數已用盡。`, 'info');
    } else {
      setLootTrayItems(prev => prev.map(i => i.instanceId === toolItem.instanceId ? { ...i, currentDurability: chargesLeft } : i));
    }
  }, [addDamagePopup, addLog, syncSynergiesAndStats]);

  // Pick item from loot tray
  const handlePickLootItem = (item: InventoryItem, index: number) => {
    soundFX.playItemPickup();
    setLootTrayItems(prev => prev.filter((_, idx) => idx !== index));
    setHeldItem(item);
  };

  // Cancel held item -> put back into loot tray
  const handleCancelHeldItem = () => {
    if (!heldItem) return;
    setLootTrayItems(prev => [heldItem, ...prev]);
    setHeldItem(null);
  };

  // Discard all loot
  const handleDiscardAllLoot = () => {
    if (lootTrayItems.length === 0) return;
    setLootTrayItems([]);
    addLog('🗑️ 丟棄了所有暫存區戰利品。', 'info');
  };

  // Merchant actions
  const handleBuyMerchantItem = (item: InventoryItem, price: number): boolean => {
    if (player.gold < price) return false;
    setPlayer(p => ({ ...p, gold: p.gold - price }));
    setLootTrayItems(prev => [...prev, item]);
    addLog(`🛍️ 從流浪商人處購買了【${item.name}】，已送至暫存區！`, 'loot');
    return true;
  };

  const handleExpandBackpack = (newSize: number, cost: number): boolean => {
    if (player.gold < cost) return false;
    setPlayer(p => {
      const updated = { ...p, gold: p.gold - cost, backpackGridSize: newSize };
      evaluateAchievements(updated, placedItemsRef.current, 0);
      return updated;
    });
    addLog(`🧰 背包空間成功擴充至 ${newSize}×${newSize}！`, 'buff');
    return true;
  };

  const handleHealFull = (cost: number): boolean => {
    if (player.gold < cost) return false;
    setPlayer(p => ({ ...p, gold: p.gold - cost, hp: p.maxHp }));
    addLog(`💖 沐浴在流浪商人的聖泉中，生命值完全回復！`, 'camp');
    return true;
  };

  const handleRepairAllGear = (cost: number): boolean => {
    if (player.gold < cost) return false;
    setPlayer(p => ({ ...p, gold: p.gold - cost }));
    const fullyRepaired = placedItemsRef.current.map(item => {
      if (item.maxDurability > 0) {
        return { ...item, currentDurability: item.maxDurability, isBroken: false };
      }
      return item;
    });
    syncSynergiesAndStats(fullyRepaired);
    soundFX.playBlock();
    addLog(`🧰 流浪商人熟練工匠徹底修繕了背包內所有裝備！耐久度全滿！`, 'buff');
    return true;
  };

  const handleRerollMerchantGoods = (cost: number) => {
    if (player.gold < cost) return;
    setPlayer(p => ({ ...p, gold: p.gold - cost }));
    setMerchantGoods(generateMerchantGoods());
    addLog(`🔄 流浪商人翻新了貨架上的稀有神兵！`, 'info');
  };

  // Active Skill Rune handlers
  const handleEquipRune = useCallback((runeId: string, slotIdx: number) => {
    setEquippedRuneIds(prev => {
      const next = [...prev];
      const otherSlot = slotIdx === 0 ? 1 : 0;
      if (next[otherSlot] === runeId) {
        next[otherSlot] = next[slotIdx];
      }
      next[slotIdx] = runeId;
      try {
        localStorage.setItem('loop_equipped_runes', JSON.stringify(next));
      } catch {}
      return next;
    });
    soundFX.playItemPlace();
    const rune = getSkillRune(runeId);
    addLog(`✨ 成功將【${rune.name}】裝備至技能槽位 ${slotIdx + 1}！`, 'buff');
  }, [addLog]);

  // Presets handlers
  const handleSavePreset = useCallback((name: string, description?: string) => {
    const curItems = placedItemsRef.current;
    const curP = playerRef.current;
    const newPreset: EquipmentPreset = {
      id: `preset_${Date.now()}`,
      name,
      description: description || `包含 ${curItems.length} 件裝備的自訂配置`,
      createdAt: Date.now(),
      isBuiltIn: false,
      items: JSON.parse(JSON.stringify(curItems)),
      summary: {
        totalAtk: curP.totalAtk,
        totalDef: curP.totalDef,
        itemCount: curItems.length,
        tag: '玩家自訂'
      }
    };

    setPresets(prev => {
      const updated = [...prev, newPreset];
      const customOnly = updated.filter(p => !p.isBuiltIn);
      try {
        localStorage.setItem('loop_backpack_presets', JSON.stringify(customOnly));
      } catch {}
      return updated;
    });

    soundFX.playItemPlace();
    addDamagePopup('📁 預設儲存成功!', 'heal', 'center');
    addLog(`📁 成功將當前背包儲存為預設組合【${name}】！`, 'buff');
  }, [addLog, addDamagePopup]);

  const handleApplyPreset = useCallback((preset: EquipmentPreset) => {
    const clonedItems: PlacedItemInstance[] = JSON.parse(JSON.stringify(preset.items));
    setPlacedItems(clonedItems);
    placedItemsRef.current = clonedItems;
    syncSynergiesAndStats(clonedItems);
    soundFX.playPresetApply();
    addDamagePopup('🔄 預設套用成功!', 'heal', 'center');
    addLog(`🔄 已成功切換至裝備預設【${preset.name}】！共載入 ${clonedItems.length} 件裝備！`, 'buff');
  }, [syncSynergiesAndStats, addLog, addDamagePopup]);

  const handleDeletePreset = useCallback((presetId: string) => {
    setPresets(prev => {
      const updated = prev.filter(p => p.id !== presetId);
      const customOnly = updated.filter(p => !p.isBuiltIn);
      try {
        localStorage.setItem('loop_backpack_presets', JSON.stringify(customOnly));
      } catch {}
      return updated;
    });
    addLog('🗑️ 已刪除該自訂預設配置。', 'info');
  }, [addLog]);

  const currentBackpackSize = player.backpackGridSize || 5;
  const gridMatrix = buildGrid(placedItems, currentBackpackSize);
  const unlockedAchievementsCount = achievements.filter(a => a.isUnlocked).length;

  return (
    <div className="min-h-screen bg-[#0b0d13] text-slate-200 flex flex-col font-sans select-none">
      {/* Top Navigation Header */}
      <header className="w-full bg-slate-900/95 border-b border-slate-800/80 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <span className="text-2xl filter drop-shadow">⚔️</span>
          <div>
            <h1 className="text-base font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-500 font-serif">
              LOOT LOOP 循環掠奪者
            </h1>
            <p className="text-[10px] text-slate-400 -mt-0.5">
              Loop Hero 自動軌道 × Backpack Hero 背包相鄰連鎖
            </p>
          </div>
        </div>

        {/* Center: Controls & Game Speeds */}
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-xl bg-slate-950 p-1 border border-slate-800 shadow-inner">
            <button
              type="button"
              onClick={() => setGameSpeed(0)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                gameSpeed === 0
                  ? 'bg-rose-500 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="暫停遊戲 (Space)"
            >
              <Pause className="w-3.5 h-3.5" />
              <span>暫停</span>
            </button>
            <button
              type="button"
              onClick={() => setGameSpeed(1)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                gameSpeed === 1
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="正常速度 (1)"
            >
              <Play className="w-3.5 h-3.5" />
              <span>1x</span>
            </button>
            <button
              type="button"
              onClick={() => setGameSpeed(2)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                gameSpeed === 2
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="加速 (2)"
            >
              <FastForward className="w-3.5 h-3.5" />
              <span>2x</span>
            </button>
            <button
              type="button"
              onClick={() => setGameSpeed(3)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                gameSpeed === 3
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="極速 (3)"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>3x</span>
            </button>
          </div>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={() => {
              const muted = soundFX.toggleMute();
              setIsMuted(muted);
            }}
            className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition"
            title={isMuted ? '開啟音效' : '靜音'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>

        {/* Feature Buttons: Achievements, Combat Replay, How to Play, Codex */}
        <div className="flex items-center gap-2">
          {/* Presets button */}
          <button
            type="button"
            onClick={() => setIsPresetsOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/40 text-xs font-bold text-indigo-300 transition"
            title="戰術裝備預設組合 (Presets)"
          >
            <BookmarkCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>預設組合</span>
          </button>

          {/* Skill Runes button */}
          <button
            type="button"
            onClick={() => setIsSkillRunesOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/40 text-xs font-bold text-purple-300 transition"
            title="主動技能符文 (Active Skill Runes)"
          >
            <Zap className="w-3.5 h-3.5 text-purple-400" />
            <span>技能符文</span>
          </button>

          {/* Achievements button */}
          <button
            type="button"
            onClick={() => setIsAchievementsOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-xs font-bold text-amber-300 transition"
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>成就 ({unlockedAchievementsCount}/{achievements.length})</span>
          </button>

          {/* Combat Replay button */}
          <button
            type="button"
            onClick={() => setIsReplayOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-xs font-bold text-rose-300 transition"
          >
            <History className="w-3.5 h-3.5" />
            <span>戰鬥回放 ({combatRecords.length})</span>
          </button>

          {/* How to Play button */}
          <button
            type="button"
            onClick={() => setIsHowToPlayOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/40 text-xs font-bold text-sky-300 transition"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>玩法說明</span>
          </button>

          {/* Codex Compendium button */}
          <button
            type="button"
            onClick={() => setIsCodexOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-300 transition"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>圖鑑</span>
          </button>

          {/* Keybindings button */}
          <button
            type="button"
            onClick={() => setIsKeybindingsOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-300 transition"
            title="自訂按鍵綁定 (K)"
          >
            <Keyboard className="w-3.5 h-3.5 text-amber-400" />
            <span>快捷鍵</span>
          </button>
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3.5 grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start">
        {/* Left Side: Track Map, Hero Stats, Combat Log */}
        <section className="lg:col-span-6 flex flex-col gap-3">
          {/* Track Canvas Box */}
          <div className="h-[340px] w-full">
            <TrackCanvas
              nodes={trackNodes}
              heroNodeIndex={player.nodeIndex}
              heroProgress={player.progressOnTrack}
              currentMonster={currentMonster}
              isInCombat={isInCombat}
              loop={player.loop}
            />
          </div>

          {/* Hero Stats Dashboard Bar */}
          <div className="grid grid-cols-4 gap-2.5">
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 flex flex-col items-center">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 text-rose-400" /> 生命值
              </span>
              <span className="text-base font-black text-rose-400 font-mono mt-0.5">
                {Math.max(0, player.hp)} / {player.maxHp}
              </span>
              <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden mt-1 border border-rose-950">
                <div
                  className="bg-rose-500 h-full transition-all duration-200"
                  style={{ width: `${Math.max(0, Math.min(100, (player.hp / player.maxHp) * 100))}%` }}
                />
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 flex flex-col items-center">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Swords className="w-3.5 h-3.5 text-amber-400" /> 總攻擊
              </span>
              <span className="text-base font-black text-amber-400 font-mono mt-0.5">
                {player.totalAtk}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                暴擊: {player.critChance}%
              </span>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 flex flex-col items-center">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-sky-400" /> 總護甲
              </span>
              <span className="text-base font-black text-sky-400 font-mono mt-0.5">
                {player.totalDef}
              </span>
              <span className="text-[10px] text-teal-400 font-mono font-semibold">
                💨 閃避: {player.dodgeRate || 0}%
              </span>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 flex flex-col items-center">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Coins className="w-3.5 h-3.5 text-yellow-400" /> 金幣
              </span>
              <span className="text-base font-black text-yellow-400 font-mono mt-0.5">
                {player.gold} G
              </span>
              <span className="text-[10px] text-amber-400 font-mono font-semibold">
                🧲 尋寶: +{player.lootFindPct || 0}%
              </span>
            </div>
          </div>

          {/* Combat Display & Live Logs with Shake and Damage Popups */}
          <CombatDisplay
            player={player}
            monster={currentMonster}
            isInCombat={isInCombat}
            logs={logs}
            shakeTarget={shakeTarget}
            popups={damagePopups}
            activeSkills={activeSkills}
            onOpenRuneModal={() => setIsSkillRunesOpen(true)}
            activeCastRuneId={activeCastRuneId}
            activeEvent={currentEnvironmentalEvent}
          />
        </section>

        {/* Right Side: Backpack Grid, Synergies, and Loot Tray */}
        <section className="lg:col-span-6 flex flex-col gap-3">
          {/* Backpack Management Card */}
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 shadow-xl flex flex-col items-center">
            <BackpackGrid
              gridSize={currentBackpackSize}
              placedItems={placedItems}
              heldItem={heldItem}
              onPickItem={handlePickBackpackItem}
              onPlaceItem={handlePlaceBackpackItem}
              onRotateHeldItem={handleRotateHeldItem}
              onCancelHeldItem={handleCancelHeldItem}
              onRepairItemWithHeldTool={handleRepairItemWithHeldTool}
              onHoverItem={(item, pos) => {
                setHoveredItem(item);
                setTooltipPos(pos);
              }}
              gridMatrix={gridMatrix}
            />

            {/* Active Synergy Summary Pill Bar */}
            <div className="w-full mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-center gap-2">
              <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> 啟動連鎖：
              </span>
              {placedItems.filter(p => p.isSynergyActive).length === 0 ? (
                <span className="text-[11px] text-slate-500 italic">
                  暫無連鎖，請嘗試將武器相鄰或將盾牌緊密包夾
                </span>
              ) : (
                placedItems
                  .filter(p => p.isSynergyActive)
                  .map(p => (
                    <span
                      key={p.instanceId}
                      className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1 shadow-sm"
                    >
                      <span>{p.icon}</span>
                      <span>{p.name}</span>
                    </span>
                  ))
              )}
            </div>
          </div>

          {/* Loot Tray */}
          <LootTray
            items={lootTrayItems}
            heldItem={heldItem}
            onPickLootItem={handlePickLootItem}
            onDiscardAll={handleDiscardAllLoot}
            onAutoEquipAll={handleAutoEquipAll}
            onUseRepairTool={handleUseRepairToolFromTray}
            onHoverItem={(item, pos) => {
              setHoveredItem(item);
              setTooltipPos(pos);
            }}
          />
        </section>
      </main>

      {/* Floating Cursor Ghost Preview when holding an item */}
      {heldItem && (
        <div
          className="fixed pointer-events-none z-50 opacity-80 transition-transform duration-75 flex flex-col items-center justify-center rounded-xl shadow-2xl border-2"
          style={{
            left: `${mousePos.x + 15}px`,
            top: `${mousePos.y + 15}px`,
            width: `${heldItem.w * (currentBackpackSize >= 7 ? 44 : currentBackpackSize === 6 ? 48 : 52) + (heldItem.w - 1) * 4}px`,
            height: `${heldItem.h * (currentBackpackSize >= 7 ? 44 : currentBackpackSize === 6 ? 48 : 52) + (heldItem.h - 1) * 4}px`,
            backgroundColor: heldItem.color,
            borderColor: heldItem.borderColor
          }}
        >
          <span className="text-2xl filter drop-shadow">{heldItem.icon}</span>
          <span className="text-[9px] font-bold text-white tracking-wider drop-shadow">
            {heldItem.name}
          </span>
          <span className="text-[8px] font-mono text-amber-300">
            {heldItem.isRepairTool ? '🔨 點擊裝備修復' : '按 R / 右鍵 旋轉'}
          </span>
        </div>
      )}

      {/* Floating Hover Tooltip */}
      <ItemTooltip item={hoveredItem} position={tooltipPos} />

      {/* Wandering Merchant Modal */}
      <MerchantModal
        isOpen={isMerchantOpen}
        onClose={() => {
          setIsMerchantOpen(false);
          setGameSpeed(prevGameSpeedRef.current || 1);
        }}
        player={player}
        goods={merchantGoods}
        onBuyItem={handleBuyMerchantItem}
        onExpandBackpack={handleExpandBackpack}
        onHealFull={handleHealFull}
        onRepairAllGear={handleRepairAllGear}
        onRerollGoods={handleRerollMerchantGoods}
      />

      {/* Presets Modal */}
      <PresetsModal
        isOpen={isPresetsOpen}
        onClose={() => setIsPresetsOpen(false)}
        presets={presets}
        currentPlacedItems={placedItems}
        onApplyPreset={handleApplyPreset}
        onSavePreset={handleSavePreset}
        onDeletePreset={handleDeletePreset}
      />

      {/* Skill Runes Modal */}
      <SkillRunesModal
        isOpen={isSkillRunesOpen}
        onClose={() => setIsSkillRunesOpen(false)}
        equippedRuneIds={equippedRuneIds}
        onEquipRune={handleEquipRune}
      />

      {/* Keybindings Modal */}
      <KeybindingsModal
        isOpen={isKeybindingsOpen}
        onClose={() => setIsKeybindingsOpen(false)}
        config={keybindings}
        onSaveConfig={handleSaveKeybindings}
        onResetDefaults={handleResetKeybindings}
      />

      {/* Achievements Compendium Modal */}
      <AchievementsModal
        isOpen={isAchievementsOpen}
        onClose={() => setIsAchievementsOpen(false)}
        achievements={achievements}
      />

      {/* Combat Replay Modal */}
      <CombatReplayModal
        isOpen={isReplayOpen}
        onClose={() => setIsReplayOpen(false)}
        records={combatRecords}
      />

      {/* How to Play Rules Modal */}
      <HowToPlayModal
        isOpen={isHowToPlayOpen}
        onClose={() => setIsHowToPlayOpen(false)}
      />

      {/* Codex Encyclopedia Modal */}
      <CodexModal isOpen={isCodexOpen} onClose={() => setIsCodexOpen(false)} />

      {/* Game Over Modal */}
      <GameOverModal
        isOpen={isGameOver}
        player={player}
        onRestart={initializeGame}
      />

      {/* Achievement Unlocked Toast Notification */}
      <AchievementToast
        achievement={latestUnlockedAchievement}
        onClose={() => setLatestUnlockedAchievement(null)}
      />
    </div>
  );
}
