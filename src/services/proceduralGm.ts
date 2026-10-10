import type { Character, TurnChoice, TurnLog, PowerTier, Opponent, CombatState, CombatDistance, EquipmentSlotKey, InventoryItem } from '../types/game.ts';
import { EQUIPMENT_SLOT_LABELS } from '../types/game.ts';
import { 
  calculateChildhoodManaGrowth, 
  evaluatePermadeathRisk, 
  performCombatCheck, 
  validateUnlearnedSkillUsage,
  getEcosystemForLocation,
  formatEquipmentSummary,
  equipItem,
  unequipItem,
  getValidSlotsForItem,
  discardItem,
  sellItem,
  sellAllLootItems,
  TIER_RANK_MAP
} from './mushokuRules.ts';
import { 
  generateSandboxChoices, 
  processSandboxTurnOutcome, 
  ensureSandboxProgression 
} from './sandboxEngine.ts';
import {
  getStoryMilestoneForTurn,
  getStoryChoicesForCharacter,
  generateFreeActivities
} from './sandboxStoryArcs.ts';
import { 
  ensureCharacterProgression, 
  awardProgressionRewards, 
  evaluateManaExhaustion,
  formatProgressionSummary
} from './mushokuProgression.ts';
import { 
  syncCharacterTalentStats,
  rollInnateTalentRng,
  formatTalentRollHeaderNotice,
  getAgeZeroBaseStats,
  applyTalentToBaseStats,
  formatTalentStatMathNotes,
  TALENTS_CATALOG
} from './mushokuTalents.ts';
import {
  formatCurrentDestinationDisplay,
  generateWorldNavigationChoices,
  executeCaravanTravel,
  executeTeleportRuinTravel,
  claimRegionalExclusiveArtifact,
  ensureWorldDiscoveryState,
  identifyCurrentRegion,
  SIX_FACED_WORLD_REGIONS,
  type WorldRegionId
} from './mushokuWorldMap.ts';
import {
  CANON_REGIONAL_ECOSYSTEMS,
  GREAT_POWER_AFFILIATIONS,
  CANON_BOSSES,
  SEVEN_GREAT_POWERS_CANON,
  CANON_ADVENTURER_QUESTS,
  ensureSevenGreatPowersState,
  evaluateGreatPowerChallenge,
  usurpGreatPowerRank,
  formatRegionalObjectivesAndMissions,
} from './mushokuCanonBeastsAndPowers.ts';
import { 
  generatePhase1Choices, 
  generatePhase2Choices, 
  evaluateEnemyPsychology, 
  generatePhase3VerdictChoices,
  calculateEscapeChance,
  getOffensiveSkillRepository,
  getBasicAttacks,
  getP2OffensiveMenuChoices,
  resolveCombatCollision,
  resolveHealingAction,
  resolveDefenseAction,
  resolveBuffAction,
  resolveCombatFlee
} from './mushokuCombatEngine.ts';
import {
  evaluateActionPlausibility,
  getRegionalNpcMindset,
  evaluateButterflyAndFate
} from './mushokuCognition.ts';
import {
  ensureCharacterReputation,
  evaluateTurnReputationAndEpithet,
  formatReputationSummary
} from './mushokuReputation.ts';

export interface GmTurnResponse {
  narration: string;
  statusSummary: string;
  rippleEffectText?: string;
  combatHudText?: string;
  equipmentSummaryText?: string;
  progressionSummaryText?: string;
  reputationSummaryText?: string;
  systemNotes: string[];
  choices: TurnChoice[];
  updatedCharacter: Character;
  isGameOver?: boolean;
  deathReason?: string;
}

export function generateInitialTurn(
  name: string,
  race: string,
  origin: string,
  baseStats: Character['stats'],
  initialBonds: Character['bonds'],
  initialLanguages: string[],
  initialSp?: number,
  initialKp?: number,
  preRolledTalentId?: string,
  rawBaseStats?: Character['stats']
): { initialLog: TurnLog; initialCharacter: Character; choices: TurnChoice[] } {
  // 1. Establish pristine unbuffed base stats for Age 0 (Rule 3 Step 1)
  const defaultAgeZeroStats = getAgeZeroBaseStats(race, origin);
  const rawAny = rawBaseStats as any;
  const baseAny = baseStats as any;
  const unbuffedBase = rawBaseStats || {
    ...defaultAgeZeroStats,
    ...(baseStats || {}),
    healthMax: (rawAny?.healthMax || (baseAny?.healthMax !== undefined && baseAny.healthMax <= 20 ? baseAny.healthMax : defaultAgeZeroStats.healthMax)),
    healthCurrent: (rawAny?.healthCurrent || (baseAny?.healthCurrent !== undefined && baseAny.healthCurrent <= 20 ? baseAny.healthCurrent : defaultAgeZeroStats.healthCurrent)),
    manaMax: (rawAny?.manaMax || (baseAny?.manaMax !== undefined && baseAny.manaMax <= 20 ? baseAny.manaMax : defaultAgeZeroStats.manaMax)),
    manaCurrent: (rawAny?.manaCurrent || (baseAny?.manaCurrent !== undefined && baseAny.manaCurrent <= 20 ? baseAny.manaCurrent : defaultAgeZeroStats.manaCurrent)),
    strength: (rawAny?.strength || (baseAny?.strength !== undefined && baseAny.strength <= 10 ? baseAny.strength : defaultAgeZeroStats.strength)),
    agility: (rawAny?.agility || (baseAny?.agility !== undefined && baseAny.agility <= 10 ? baseAny.agility : defaultAgeZeroStats.agility)),
    touki: 0,
    age: 0,
    month: 1,
    location: origin,
  };

  // 2. Resolve Innate Talent: Anti-hardcode! True RNG roll if not specified (Rule 1 & Rule 2)
  let assignedTalentDef = preRolledTalentId && TALENTS_CATALOG[preRolledTalentId] 
    ? TALENTS_CATALOG[preRolledTalentId] 
    : null;
  let diceHeader = '';
  let rollScore: number | undefined = undefined;

  if (assignedTalentDef) {
    diceHeader = formatTalentRollHeaderNotice(assignedTalentDef);
  } else {
    const rolled = rollInnateTalentRng();
    assignedTalentDef = rolled.talent;
    diceHeader = rolled.headerNotice;
    rollScore = rolled.rollScore;
  }

  // 3. Mathematical calculation directly into base stats (Rule 3 Step 2)
  const finalScaledStats = applyTalentToBaseStats(unbuffedBase, assignedTalentDef);

  const character: Character = {
    name,
    race,
    origin,
    title: 'Hài nhi Chuyển sinh (0 tuổi)',
    stats: finalScaledStats,
    rawBaseStats: unbuffedBase,
    magic: {
      fire: 'Chưa học',
      water: 'Chưa học',
      earth: 'Chưa học',
      wind: 'Chưa học',
      healing: 'Chưa học',
      detox: 'Chưa học',
      barrier: 'Chưa học',
      summoning: 'Chưa học',
      chantless: false,
      chantlessProgress: 0,
    },
    swordsmanship: {
      swordGod: 'Chưa học',
      waterGod: 'Chưa học',
      northGod: 'Chưa học',
      preferredStyle: 'none',
    },
    languages: initialLanguages,
    bonds: initialBonds,
    inventory: [
      { 
        id: 'blanket', 
        name: 'Khăn len sơ sinh', 
        type: 'armor', 
        equipSlot: 'body',
        description: 'Chiếc chăn ấm bọc lấy cơ thể yếu ớt của đứa trẻ sơ sinh.', 
        statBonus: { defenseBonus: 2 } 
      },
    ],
    equipment: {},
    maxInventorySlots: 20,
    specialTraits: ['[Hồi ức tiền kiếp] - Giữ nguyên ký ức và tư duy người lớn'],
    statusEffects: ['Cơ thể sơ sinh (Chưa biết nói/đi)'],
    isDead: false,
  };

  // Store pre-rolled talent ID
  (character as any).preRolledTalent = assignedTalentDef.id;

  const prog = ensureCharacterProgression(character, initialSp, initialKp);
  const progSummary = formatProgressionSummary(character);

  const hasInheritedLegacy = 
    (typeof initialSp === 'number' && initialSp > 0) || 
    (typeof initialKp === 'number' && initialKp > 0) || 
    prog.skillPoints > 60 || 
    prog.knowledgePoints > 20;

  if (hasInheritedLegacy) {
    character.specialTraits.push(
      `[Luân Hồi Kế Thừa SP/KP] - Bảo lưu ${prog.skillPoints} SP & ${prog.knowledgePoints} KP từ kiếp trước`
    );
  }

  character.specialTraits.push(
    `[Thiên Phú Bẩm Sinh] - ${prog.innateTalent.name} (${prog.innateTalent.tierName || 'Phàm nhân'} - Tỷ lệ ${prog.innateTalent.tierProbability || '50%'})`
  );

  ensureWorldDiscoveryState(character);
  ensureSevenGreatPowersState(character);
  const destinationDisplay = formatCurrentDestinationDisplay(character);
  const regionalObjectives = formatRegionalObjectivesAndMissions(character);

  // RULE 2: QUẢN TRÒ BẮT BUỘC CÔNG KHAI QUÁ TRÌNH TUNG XÚC XẮC NGAY ĐẦU BÀI PHẢN HỒI ĐẦU TIÊN
  // VÀ TÍCH HỢP MỤC [ĐIỂM ĐẾN & DI CHUYỂN] VÀ [MỤC TIÊU & NHIỆM VỤ KHU VỰC] Ở CUỐI MỖI LƯỢT PHẢN HỒI
  const narration = `${diceHeader}

Một cơn đau thắt nghẽn lồng ngực... rồi tất cả chìm vào bóng tối thăm thẳm. 
Không còn tiếng còi xe inh ỏi, không còn căn phòng trọ bừa bộn của một kẻ thất bại ở thế giới cũ. 

Khi ý thức chập chờn thức tỉnh, bạn ngửi thấy mùi gỗ mộc, mùi sữa ấm và một luồng sinh khí kỳ lạ luân chuyển trong không khí. Bạn cố mở mắt — nhưng thị giác mờ ảo chỉ bắt được những vệt sáng chập chờn. Bạn muốn mở miệng nói, nhưng âm thanh phát ra chỉ là tiếng oe oe khóc đặc trưng của một đứa trẻ sơ sinh.

Bạn đã thức tỉnh tại Thế Giới Sáu Mặt (Thế Giới RPG Sandbox Vô Tận). Trong hình hài một hài nhi ${character.race}, sinh ra tại ${character.origin}. 
Tại đây, không có kịch bản định sẵn trói buộc bạn — vận mệnh, con đường tu luyện ma pháp hay kiếm thuật, bạn bè và thế lực đều hoàn toàn xoay quanh những quyết định tự do của bạn!
Ở phía sâu bên dưới đan điền, bạn lờ mờ cảm nhận được một luồng nhiệt ấm áp, một dòng chảy vô hình đang lặng lẽ tuần hoàn qua từng mạch máu nhỏ bé — đó chính là cội nguồn của Mana!${hasInheritedLegacy ? `\n\n🌟 [LINH HỒN BẤT DIỆT]: Toàn bộ tinh hoa tri thức và tiềm lực tu luyện của kiếp trước đã hội tụ vào linh hồn sơ sinh này: Bạn bắt đầu cuộc đời mới với trọn vẹn ${prog.skillPoints} Điểm Kỹ Năng (SP) và ${prog.knowledgePoints} Điểm Tri Thức (KP) kế thừa!` : ''}

[ĐIỂM ĐẾN & DI CHUYỂN]:
${destinationDisplay}

${regionalObjectives}`;

  const rep = ensureCharacterReputation(character);
  const repSummary = formatReputationSummary(character);
  const equipSummary = formatEquipmentSummary(character.equipment);

  // RULE 3 STEP 3: GHI CHÚ RÕ CHỈ SỐ SAU KHI ĐÃ TÍNH TOÁN PHẦN TRĂM ĐỂ NGƯỜI CHƠI KIỂM TRA
  const mathNotes = formatTalentStatMathNotes(character);

  const statusSummary = `• Tuổi: 0 tuổi 1 tháng | Vị trí: ${character.stats.location}
• Chủng tộc: ${character.race} | Thân phận: ${character.origin}
• 🎲 Thiên Phú Bẩm Sinh: [${prog.innateTalent.name}] (${prog.innateTalent.tierName || 'Phàm nhân'} - Tỷ lệ: ${prog.innateTalent.tierProbability || '50%'})
${(prog.innateTalent.effectsSummary || []).slice(0, 3).map(e => `  └ ${e}`).join('\n')}
• HP: ${character.stats.healthCurrent}/${character.stats.healthMax}${mathNotes.hpNote} | Mana: ${character.stats.manaCurrent}/${character.stats.manaMax}${mathNotes.mpNote} (Tiềm năng: x${character.stats.manaPotentialMultiplier.toFixed(1)})
• Đấu Khí: ${character.stats.touki}/${character.stats.toukiMax || 100}${mathNotes.toukiNote} | STR: ${character.stats.strength || 2}${mathNotes.strNote} | AGI: ${character.stats.agility || 2}${mathNotes.agiNote}
• Kiểm soát Mana: ${character.stats.manaControl}/100 | Thông Thái: ${character.stats.knowledge}/100
• SP Khả dụng: ${prog.skillPoints} | KP Khả dụng: ${prog.knowledgePoints} ${hasInheritedLegacy ? '(⭐ Kế thừa 100% từ kiếp cũ)' : ''}
• Ma pháp: Chưa kích hoạt (Vô niệm chú: 0%) | Kiếm thuật: Chưa luyện

${repSummary}

${equipSummary}

${progSummary}`;

  const choices: TurnChoice[] = [
    {
      id: 'sense_mana',
      label: 'Nhắm mắt, dồn ý thức thăm dò dòng chảy Mana trong bụng',
      actionText: 'Tập trung cảm nhận luồng khí ấm áp trong bụng, thử điều khiển nó luân chuyển qua các đầu ngón tay.',
      riskLevel: 'safe',
      category: 'magic',
    },
    {
      id: 'observe_family',
      label: 'Lắng nghe giọng nói và quan sát người xung quanh để học ngôn ngữ',
      actionText: 'Cố gắng giữ bình tĩnh, chú ý lắng nghe cách phát âm của người chăm sóc và quan sát căn phòng.',
      riskLevel: 'safe',
      category: 'study',
    },
    {
      id: 'move_limbs',
      label: 'Vận động tay chân, thích nghi dần với thể xác mới',
      actionText: 'Cố gắng vung vẩy hai bàn tay nhỏ bé và co duỗi chân để phát triển cơ bắp cùng hệ thần kinh.',
      riskLevel: 'safe',
      category: 'sword',
    },
    {
      id: 'cry_feed',
      label: 'Khóc to đòi bú sữa và ngủ một giấc thật sâu để tích dưỡng',
      actionText: 'Khóc lớn theo bản năng sơ sinh, uống sữa no nê và nghỉ ngơi phục hồi năng lượng.',
      riskLevel: 'safe',
      category: 'rest',
    },
  ];

  const systemNotes: string[] = [
    'Hệ thống Thế Giới RPG Sandbox kích hoạt: Thế giới xoay quanh vận mệnh của người chơi!',
    `🎲 [XÚC XẮC THIÊN PHÚ THEO KIẾP]: Bạn nhận được [${prog.innateTalent.name}] (${prog.innateTalent.tierName || 'Phàm nhân'} - Tỷ lệ ${prog.innateTalent.tierProbability || '50%'}) - Mọi hiệu ứng buff/nerf đã quy đổi trực tiếp vào Base Stats!`,
    '🏆 [HỆ THỐNG DANH TIẾNG & BIỆT DANH]: Đã kích hoạt cơ chế khắc họa Biệt danh dựa trên hành vi và Danh tiếng 4 vùng đại lục!',
    'Giai đoạn Vàng (0 - 10 tuổi) bắt đầu: Mọi hành động kích hoạt Mana hay Thể chất đều mở rộng giới hạn suốt đời!',
    hasInheritedLegacy
      ? `🌟 [LUÂN HỒI KẾ THỪA TOÀN BỘ SP & KP]: Kiếp chuyển sinh mới đã bảo lưu toàn bộ ${prog.skillPoints} SP và ${prog.knowledgePoints} KP của kiếp cũ!`
      : `Hệ thống Cây Kỹ Năng Đa Diện & Rào Cản Lũy Tiến Tận Cùng đã mở khóa (SP: ${prog.skillPoints}, KP: ${prog.knowledgePoints}).`
  ];

  const initialLog: TurnLog = {
    id: `turn_0_${Date.now()}`,
    turnNumber: 1,
    ageDisplay: '0 tuổi 1 tháng',
    location: character.stats.location,
    playerAction: 'Thức tỉnh tại Đại Lục Huyền Ảo Valoria',
    narration,
    statusSummary,
    equipmentSummaryText: equipSummary,
    progressionSummaryText: progSummary,
    reputationSummaryText: repSummary,
    systemNotes,
    timestamp: Date.now(),
  };

  return { initialLog, initialCharacter: character, choices };
}

function spawnOpponentForCharacter(character: Character): Opponent {
  const age = character.stats.age;
  if (age < 7) {
    return {
      id: 'rock_badger',
      name: 'Chuột Chũi Giáp Đá (Rock Badger)',
      title: 'Ma vật hoang dã sơ cấp ven làng',
      type: 'monster',
      powerTier: 'Sơ cấp (Beginner)',
      swordStyle: 'Hoang dã',
      hpCurrent: 40,
      hpMax: 40,
      touki: 10,
      mana: 15,
      status: 'Khỏe mạnh, đang gầm gừ giương vuốt',
      distance: 'Tầm trung (5-10m)',
      description: 'Lớp mai đất đá bao bọc lưng dày cộm, móng vuốt có thể đào xuyên đá tảng.',
    };
  } else if (age < 12) {
    return {
      id: 'fittoa_pack_leader',
      name: 'Nanh Sói Rừng Fittoa (Dire Wolf)',
      title: 'Ma vật săn mồi Cấp Trung',
      type: 'monster',
      powerTier: 'Trung cấp (Intermediate)',
      swordStyle: 'Hoang dã',
      hpCurrent: 85,
      hpMax: 85,
      touki: 28,
      mana: 25,
      status: 'Ánh mắt rình rập, đang dồn lực cơ bắp',
      distance: 'Tầm trung (5-10m)',
      description: 'Bộ lông xám dựng đứng như phi tiêu thép, tốc độ lao bổ có thể bẻ gãy cổ bò rừng.',
    };
  } else {
    return {
      id: 'rogue_swordsman',
      name: 'Kiếm Sĩ Sa Đoạ Gallos',
      title: 'Lính đánh thuê Cấp Thượng Bắc Thần phái',
      type: 'swordsman',
      powerTier: 'Thượng cấp (Advanced)',
      swordStyle: 'Bắc Thần phái',
      hpCurrent: 140,
      hpMax: 140,
      touki: 55,
      mana: 35,
      status: 'Ánh mắt giảo hoạt, tay nắm chuôi đao tẩm độc',
      distance: 'Tầm trung (5-10m)',
      description: 'Mang theo cát mù, phi đao ẩn và đao cong sắc lẹm rực sáng Đấu Khí.',
    };
  }
}

/**
 * =========================================================================
 * BỘ TẠO LỰA CHỌN CỐT TRUYỆN ĐA DẠNG & THAY ĐỔI LINH HOẠT THEO TUỔI TÁC
 * Khắc phục hoàn toàn lỗi lặp lại lựa chọn từ tuổi 24 trở đi:
 * - Tuổi 0-9: Buena, Roa, Vô niệm chú, luyện cơ bắp sơ khởi, học cổ ngữ.
 * - Tuổi 10-14: Thảm họa Fittoa, Đại Lục Ma, Dead End, Ruijerd, Eris, Kishirika Ma Nhãn.
 * - Tuổi 15-18: Đại học Phép thuật Ranoa, Mê cung Begaritto, cứu viện Roxy, đại chiến Badigadi.
 * - Tuổi 19-23: Liên minh Long Thần Orsted, Ma Đạo Khải Mk.I, phò trợ Công chúa Ariel.
 * - Tuổi 24-29: THỜI KỲ ĐỈNH PHONG: Săn lùng Sứ đồ Hitogami, Ma Đạo Khải Mk.II + súng Gatling,
 *   hội đàm Orsted, bồi dưỡng thế hệ con cháu Greyrat (Lucy, Lara, Ars), đại chiến Biheiril,
 *   Mê cung tối thượng, ngoại giao Hoàng gia Asura, bế quan cảnh giới Thần cấp.
 *   Xoay vòng linh hoạt theo turnNumber để KHÔNG BAO GIỜ bị lặp lại!
 * - Tuổi 30-45: Tông sư Sharia, Ma Đạo Khải Đời 0 (Mk.0), bảo vệ mạng lưới dịch chuyển,
 *   huấn luyện Ars & Sieghart, giải mã bí tự Sáng Thế.
 * - Tuổi 46+: Huyền thoại sống, chắp bút hồi ký truyền thế, kế hoạch phong ấn 80 năm cùng Orsted.
 * =========================================================================
 */
export function generateDynamicStoryChoices(character: Character, turnNumber: number): TurnChoice[] {
  const choices: TurnChoice[] = [];
  const age = character.stats.age;
  const seed = turnNumber * 13 + age * 7 + (character.stats.month || 1);

  // 1. Lựa chọn Chiêu mộ Giao tranh & Săn quái (Luôn cố định)
  choices.push({
    id: 'combat_hub_entry',
    label: '[MỤC CHIẾN ĐẤU]: Khảo sát khu vực & Tìm kiếm kẻ địch/Quái vật',
    actionText: '[MỤC CHIẾN ĐẤU]: Khảo sát khu vực & Tìm kiếm kẻ địch/Quái vật để đi săn farm tài nguyên.',
    riskLevel: 'moderate',
    category: 'hunt',
  });

  if (age < 10) {
    // Tuổi 0 - 9: Tuổi thơ & Giai đoạn vàng Mana
    if (!character.magic.chantless) {
      choices.push({
        id: 'train_chantless',
        label: 'Tập trung luyện [Vô niệm chú] bằng cách xả cạn Mana trước khi ngủ',
        actionText: 'Liên tục tụ giải ma pháp không dùng thần chú cho đến khi Mana cạn kiệt ngất xỉu để mở rộng bình chứa.',
        riskLevel: 'moderate',
        category: 'magic',
      });
    }

    choices.push({
      id: 'sword_practice',
      label: 'Luyện tập Kiếm thuật và rèn luyện cơ bắp kích hoạt Đấu Khí',
      actionText: 'Vung kiếm gỗ 500 lần và tập di chuyển bộ pháp thực chiến để tôi luyện Đấu Khí bảo vệ cơ thể.',
      riskLevel: 'safe',
      category: 'sword',
    });

    choices.push({
      id: 'study_languages',
      label: 'Đọc sách cổ ngữ và tìm hiểu về các Chủng tộc / Lục địa khác',
      actionText: 'Tìm kiếm sách về Ma thần ngữ, Thú thần ngữ và bản đồ thế giới Sáu Mặt để trau dồi tri thức.',
      riskLevel: 'safe',
      category: 'study',
    });

    choices.push({
      id: 'buena_exploration',
      label: 'Khảo sát dòng chảy Mana và trợ giúp gia đình tại thôn làng',
      actionText: 'Dùng ma pháp dẫn nước tưới tiêu đồng ruộng hoặc khảo sát địa hình xung quanh làng để gia tăng kiểm soát Mana.',
      riskLevel: 'safe',
      category: 'explore',
    });
  } else if (age < 15) {
    // Tuổi 10 - 14: Thảm họa Fittoa & Đại Lục Ma
    const pool: TurnChoice[] = [
      {
        id: 'dead_end_quest',
        label: 'Tác chiến cùng Ruijerd & Eris nhận ủy thác mạo hiểm giả cấp cao',
        actionText: 'Nhận nhiệm vụ săn lùng ma thú nguy hiểm tại Đại Lục Ma để kiếm lộ phí vượt biển và gầy dựng danh tiếng cho Tộc Superd.',
        riskLevel: 'dangerous',
        category: 'combat',
      },
      {
        id: 'find_demon_empress',
        label: 'Dò la tin tức Ma Giới Đại Đế Kishirika Kishirisu để thỉnh ban Ma Nhãn',
        actionText: 'Tìm kiếm Ma vương lang thang Kishirika tại các tửu quán nghèo để trao đổi thức ăn lấy Ma Nhãn Dự Tri.',
        riskLevel: 'moderate',
        category: 'explore',
      },
      {
        id: 'survival_combat_hell',
        label: 'Khổ luyện sinh tồn: Chống chọi khí hậu khắc nghiệt và ma thú rình rập',
        actionText: 'Đối đầu trực diện ma thú hoang mạc, trui rèn bản năng né đòn và củng cố phản xạ cận chiến cận kề ranh giới sinh tử.',
        riskLevel: 'moderate',
        category: 'sword',
      },
      {
        id: 'milis_crossing',
        label: 'Đàm phán vượt biển sang Lục địa Thánh Milis tìm kiếm gia đình',
        actionText: 'Tìm đường vượt biển đến Cảng Zant hoặc thủ phủ Milishion, thu thập tung tích người thân gia tộc Greyrat bị phân tán.',
        riskLevel: 'safe',
        category: 'social',
      },
    ];

    for (let i = 0; i < 3; i++) {
      choices.push(pool[(seed + i) % pool.length]);
    }
  } else if (age < 19) {
    // Tuổi 15 - 18: Đại học Ranoa & Mê cung Begaritto
    const pool: TurnChoice[] = [
      {
        id: 'ranoa_magic_study',
        label: 'Nghiên cứu Ma thuật Triệu Hồi & Cổ đại tại Thư viện Học viện Ranoa',
        actionText: 'Đến thư viện viện nghiên cứu ma thuật triệu hồi cùng Silent Fitz (Sylphiette) để giải mã nguyên lý thảm họa dịch chuyển.',
        riskLevel: 'safe',
        category: 'study',
      },
      {
        id: 'craft_with_zanoba_cliff',
        label: 'Chế tạo Ma cụ & Tượng búp bê ma thuật cùng Hoàng tử Zanoba & Cliff',
        actionText: 'Kết hợp cùng Zanoba nghiên cứu cấu trúc vật liệu ma thuật và phụ ma lên các thiết bị bảo hộ.',
        riskLevel: 'safe',
        category: 'magic',
      },
      {
        id: 'begaritto_expedition',
        label: 'Viễn chinh Mê Cung Dịch Chuyển Begaritto giải cứu Roxy',
        actionText: 'Băng qua sa mạc Begaritto, tiến vào Mê cung Dịch chuyển hiểm trở để phá giải bẫy đá hoa cương cứu viện Roxy.',
        riskLevel: 'dangerous',
        category: 'explore',
      },
      {
        id: 'spar_with_badigadi',
        label: 'Giao lưu đấu pháp đối kháng cùng Ma Vương Bất Tử Badigadi',
        actionText: 'Thử nghiệm sức phá hủy của Hỏa Pháo và Đạn Đá áp suất cao lên lớp da Đấu Khí màu đen bất hoại của Badigadi.',
        riskLevel: 'moderate',
        category: 'combat',
      },
    ];

    for (let i = 0; i < 3; i++) {
      choices.push(pool[(seed + i) % pool.length]);
    }
  } else if (age < 24) {
    // Tuổi 19 - 23: Liên minh Long Thần & Chính biến Asura
    const pool: TurnChoice[] = [
      {
        id: 'craft_magic_armor_mk1',
        label: 'Thiết kế & Chế tạo Ma Đạo Khải (Magic Armor Mk.I) chạy bằng lõi Mana',
        actionText: 'Huy động toàn bộ kim loại quý và hợp kim ma thuật để đúc tạo bộ giáp hạng nặng Mk.I tăng vọt Đấu Khí.',
        riskLevel: 'moderate',
        category: 'magic',
      },
      {
        id: 'alliance_orsted',
        label: 'Hội đàm cùng Long Thần Orsted: Thiết lập đối sách chống lại Nhân Thần',
        actionText: 'Chấp nhận gia nhập hàng ngũ của Orsted, nhận nhiệm vụ ngăn chặn các âm mưu của Hitogami trong bóng tối.',
        riskLevel: 'safe',
        category: 'social',
      },
      {
        id: 'asura_succession_support',
        label: 'Phò trợ Vương nữ Ariel hồi hương giành lại ngai vàng Asura',
        actionText: 'Hộ tống Ariel về Vương đô Ars, lập kế hoạch đập tan âm mưu của Đệ Nhất Hoàng Tử và Hội Đồng Quý Tộc Asura.',
        riskLevel: 'dangerous',
        category: 'social',
      },
      {
        id: 'duel_water_god_reida',
        label: 'Nghiên cứu đối sách hóa giải Tuyệt Kỹ Thủy Thần Reida & Bắc Đế Auber',
        actionText: 'Thao dượt phương án phản kích phá vỡ Bác Đoạt Kiếm Giới của Thủy Thần và thuật ngụy trang Bắc Thần phái.',
        riskLevel: 'dangerous',
        category: 'sword',
      },
    ];

    for (let i = 0; i < 3; i++) {
      choices.push(pool[(seed + i) % pool.length]);
    }
  } else {
    // =========================================================================
    // TUỔI 24 TRỞ ĐI: CỐT TRUYỆN ĐA TUYẾN ĐỈNH PHONG (KHÔNG BAO GIỜ LẶP LẠI)
    // - Tuyến 1: Chiến Lược Hitogami & Sa Bàn Orsted (5 Giai đoạn)
    // - Tuyến 2: Kỹ Nghệ Ma Đạo Khải Mk.II & Mk.Zero (5 Giai đoạn)
    // - Tuyến 3: Tình Cảm Gia Tộc Sharia & Hậu Duệ Greyrat (6 Giai đoạn)
    // - Tuyến 4: Ngoại Giao Vương Quyền Thế Giới (5 Giai đoạn)
    // - Tuyến 5: Đột Phá Thần Vực & Bế Quan Cực Hạn (5 Giai đoạn)
    // - Tuyến 6: Khai Phá Mê Cung & Thần Khí Cổ Đại (4 Giai đoạn)
    // =========================================================================
    character.peakStoryProgression = character.peakStoryProgression || {
      hitogamiInvestigationStage: 0,
      magicArmorTechStage: 0,
      orstedCouncilStage: 0,
      familyLegacyStage: 0,
      worldDiplomacyStage: 0,
      godRealmBreakthroughStage: 0,
      ancientRuinsStage: 0,
      recentChoiceIds: [],
    };

    const peak = character.peakStoryProgression;
    peak.recentChoiceIds = peak.recentChoiceIds || [];

    // Danh sách 1: Tuyến Hitogami & Chuẩn Bị Chiến Tranh
    const hitogamiStages: TurnChoice[] = [
      {
        id: 'hitogami_track_0',
        label: '👑 [Chiến Lược Hitogami 1/5]: Lần theo dị biến thư tín và giấc mơ khả nghi tại Sharia',
        actionText: 'Dò la thông tin về các giấc mơ bí ẩn xúi giục mạo hiểm giả biên viễn, truy vết mạng lưới gián điệp đầu tiên của Hitogami.',
        riskLevel: 'dangerous',
        category: 'explore',
      },
      {
        id: 'hitogami_track_1',
        label: '👑 [Chiến Lược Hitogami 2/5]: Đột kích sào huyệt buôn lậu ma thạch tại Cảng Gió',
        actionText: 'Cùng Ruijerd và Eris phục kích đoàn xe ma tộc do thuộc hạ Geese bí mật dẫn đường, tịch thu bản đồ mật thám.',
        riskLevel: 'dangerous',
        category: 'combat',
      },
      {
        id: 'hitogami_track_2',
        label: '👑 [Chiến Lược Hitogami 3/5]: Phá giải trận địa nguyền rủa nhắm vào gia đình tại Ranoa',
        actionText: 'Kích hoạt kết giới ma pháp bảo hộ Sylphie, Roxy và con nhỏ, tiêu diệt thích khách tay sai của Nhân Thần.',
        riskLevel: 'dangerous',
        category: 'magic',
      },
      {
        id: 'hitogami_track_3',
        label: '👑 [Chiến Lược Hitogami 4/5]: Bẻ gãy nhánh tình báo của Geese tại Thần Thánh Quốc Millis',
        actionText: 'Tác chiến cùng Giáo Hoàng Millis, vây bắt gián điệp ngầm của Geese trước khi hắn kịp kích động thánh chiến.',
        riskLevel: 'dangerous',
        category: 'explore',
      },
      {
        id: 'hitogami_track_4',
        label: '👑 [Chiến Lược Hitogami 5/5]: Khóa chặt sào huyệt quyết đấu cuối cùng của Hitogami tại Biheiril',
        actionText: 'Thiết lập trận địa ma pháp cấm và trạm dịch chuyển tức thời tiến sát sào huyệt phe cánh Hitogami tại Vương quốc Biheiril.',
        riskLevel: 'fatal',
        category: 'sword',
      },
      {
        id: 'hitogami_track_repeat',
        label: '👑 [Phòng Thủ Toàn Cầu]: Củng cố mạng lưới tình báo chống lại mầm mống tàn dư của Nhân Thần',
        actionText: 'Rà soát các biến cố khả nghi tại các thương hội và công hội mạo hiểm giả, triệt tiêu mọi mưu đồ ám hại mới của Hitogami.',
        riskLevel: 'moderate',
        category: 'explore',
      },
    ];

    // Danh sách 2: Tuyến Kỹ Nghệ Ma Đạo Khải (Zanoba & Cliff)
    const armorStages: TurnChoice[] = [
      {
        id: 'armor_tech_0',
        label: '⚙️ [Ma Đạo Khải Mk.II - B1]: Tối ưu hóa bản vẽ thu nhỏ cơ động cùng Zanoba & Cliff',
        actionText: 'Nghiên cứu thu nhỏ kích thước Ma Đạo Khải xuống chuẩn Mk.II để dễ dàng tác chiến linh hoạt trong đô thị và mê cung hẹp mà không tốn quá nhiều Mana.',
        riskLevel: 'safe',
        category: 'magic',
      },
      {
        id: 'armor_tech_1',
        label: '⚙️ [Ma Đạo Khải Mk.II - B2]: Đúc hợp kim ma thạch & tích hợp nòng súng Gatling ma thuật',
        actionText: 'Đúc nòng súng phóng đạn đá nén siêu thanh tốc độ cao lên cánh tay giáp của Mk.II để tối đa hóa hỏa lực tầm xa.',
        riskLevel: 'moderate',
        category: 'magic',
      },
      {
        id: 'armor_tech_2',
        label: '⚙️ [Ma Đạo Khải Mk.II - B3]: Thử nghiệm hỏa lực thực chiến tại Hẻm Núi Đỏ',
        actionText: 'Mang Mk.II ra Hẻm Núi Đỏ thử nghiệm bắn nát cự thạch, tinh chỉnh van hồi quy dòng chảy Mana đạt độ chuẩn xác 100%.',
        riskLevel: 'moderate',
        category: 'magic',
      },
      {
        id: 'armor_tech_3',
        label: '⚙️ [Ma Đạo Khải Mk.II - B4]: Chế tác trang bị phụ trợ Đấu Khí cho Eris và Zanoba',
        actionText: 'Rèn đúc găng tay trợ lực và khiên chắn Đấu Khí mini để các chiến hữu cận chiến gia tăng phòng thủ tối đa.',
        riskLevel: 'safe',
        category: 'study',
      },
      {
        id: 'armor_tech_4',
        label: '🦾 [Ma Đạo Khải Mk.Zero]: Đặt nền móng cỗ máy chiến tranh khổng lồ đối đầu Thần Cấp',
        actionText: 'Huy động kho quặng ma thuật chế tạo khung xương Mk.Zero khổng lồ tiêu thụ 10,000 MP sẵn sàng đối đầu Đấu Thần Badigadi.',
        riskLevel: 'dangerous',
        category: 'magic',
      },
      {
        id: 'armor_tech_repeat',
        label: '⚙️ [Bảo Dưỡng & Tinh Chỉnh Ma Giáp]: Tinh chỉnh lõi động cơ và nạp đầy tinh thể ma lực',
        actionText: 'Bảo trì hệ thống vi mạch giáp Mk.II và Mk.Zero, chuẩn bị đạn dược đá nén dự trữ sẵn sàng xuất chiến.',
        riskLevel: 'safe',
        category: 'magic',
      },
    ];

    // Danh sách 3: Tuyến Tình Cảm Gia Tộc Sharia & Hậu Duệ Greyrat
    const familyStages: TurnChoice[] = [
      {
        id: 'family_legacy_0',
        label: '👨‍👩‍👧‍👦 [Gia Tộc Sharia 1/6]: Cầm tay dạy con gái đầu Lucy định hình quả cầu nước không niệm chú',
        actionText: 'Dành buổi sáng ấm áp trong sân vườn Sharia hướng dẫn Lucy cảm thụ dòng chảy Mana và giải phóng phép thuật không xướng ngôn.',
        riskLevel: 'safe',
        category: 'social',
      },
      {
        id: 'family_legacy_1',
        label: '👨‍👩‍👧‍👦 [Gia Tộc Sharia 2/6]: Chào đón con gái thứ Lara ra đời & kết thân cùng Linh Khuyển Leo',
        actionText: 'Chăm sóc Roxy và chào đón bé Lara ra đời, cùng linh thú thiêng Leo canh giữ giấc mơ của con khỏi sự dòm ngó của Hitogami.',
        riskLevel: 'safe',
        category: 'social',
      },
      {
        id: 'family_legacy_2',
        label: '👨‍👩‍👧‍👦 [Gia Tộc Sharia 3/6]: Dạy con trai Ars kiếm pháp thực chiến và đạo lý làm người',
        actionText: 'Cùng Eris rèn giũa kiếm thuật cho Ars, uốn nắn tính cách bộc trực và răn dạy tinh thần trượng nghĩa hiệp sĩ.',
        riskLevel: 'safe',
        category: 'sword',
      },
      {
        id: 'family_legacy_3',
        label: '👨‍👩‍👧‍👦 [Gia Tộc Sharia 4/6]: Chào đón con trai Sieghart ra đời với mái tóc xanh lục Laplace',
        actionText: 'Ôm Sieghart vào lòng, thề nguyện bảo vệ con trước mọi dị nghị thế gian, truyền dạy tình yêu thương gia đình vô điều kiện.',
        riskLevel: 'safe',
        category: 'social',
      },
      {
        id: 'family_legacy_4',
        label: '👨‍👩‍👧‍👦 [Gia Tộc Sharia 5/6]: Lễ kỷ niệm sum vầy đầm ấm cùng ba người vợ hiền Sylphie, Roxy và Eris',
        actionText: 'Tổ chức bữa tiệc gia đình ấm cúng tại biệt phủ Sharia, thưởng thức ẩm thực và cảm tạ sự hy sinh của những người bạn đời.',
        riskLevel: 'safe',
        category: 'rest',
      },
      {
        id: 'family_legacy_5',
        label: '👨‍👩‍👧‍👦 [Gia Tộc Sharia 6/6]: Khởi tạo thư viện gia truyền lưu giữ toàn bộ bí kíp cho hậu thế Greyrat',
        actionText: 'Tổng hợp các bài học ma thuật vô niệm, yếu quyết kiếm phái và bản đồ thế giới vào kho lưu trữ gia tộc Sharia.',
        riskLevel: 'safe',
        category: 'study',
      },
      {
        id: 'family_legacy_repeat',
        label: '🏡 [Bình Yên Dinh Thự Sharia]: Thư thái cùng gia đình, chăm sóc vườn cây và lắng nghe tiếng cười trẻ thơ',
        actionText: 'Tận hưởng những giây phút bình yên vô giá bên người thân yêu, bồi đắp hạnh phúc gia đình tại Sharia.',
        riskLevel: 'safe',
        category: 'rest',
      },
    ];

    // Danh sách 4: Tuyến Hội Đàm Long Thần Orsted
    const orstedStages: TurnChoice[] = [
      {
        id: 'orsted_council_0',
        label: '🐉 [Hội Đàm Long Thần 1/5]: Đối chiếu bản đồ số mệnh cùng Long Thần Orsted tại Sharia',
        actionText: 'Bàn thảo chiến lược tác chiến với Long Thần Orsted, đối chiếu danh sách các sự kiện lịch sử bị Nhân Thần bẻ cong.',
        riskLevel: 'safe',
        category: 'social',
      },
      {
        id: 'orsted_council_1',
        label: '🐉 [Hội Đàm Long Thần 2/5]: Thu phục Kiếm Vương Ghislaine & đàm đạo cùng Bắc Đế Auber',
        actionText: 'Hóa giải xung đột phe phái các trường phái kiếm thuật, củng cố thế lực chiến đấu cận chiến của liên minh.',
        riskLevel: 'safe',
        category: 'sword',
      },
      {
        id: 'orsted_council_2',
        label: '🐉 [Hội Đàm Long Thần 3/5]: Thiết lập mạng lưới vòng tròn dịch chuyển ngầm liên lục địa',
        actionText: 'Mở ra tuyến giao thông huyết mạch bằng ma pháp trận dịch chuyển cổ đại, rút ngắn hành trình hàng năm trời chỉ còn tích tắc.',
        riskLevel: 'safe',
        category: 'magic',
      },
      {
        id: 'orsted_council_3',
        label: '🐉 [Hội Đàm Long Thần 4/5]: Viếng thăm Ma Giới thỉnh cầu Ma Vương Bất Tử Atofe tham chiến',
        actionText: 'Giao hảo và chinh phục tính khí ngang tàng của Ma Vương Atofe bằng thực lực và ma pháp đối kháng.',
        riskLevel: 'dangerous',
        category: 'social',
      },
      {
        id: 'orsted_council_4',
        label: '🐉 [Hội Đàm Long Thần 5/5]: Hoàn tất sa bàn tác chiến quyết tử tại Thung Lũng Biheiril',
        actionText: 'Bố trí trận địa ma pháp cấm và chuẩn bị chiến dịch đối đầu Bắc Thần Kalman III cùng phe cánh Nhân Thần.',
        riskLevel: 'dangerous',
        category: 'sword',
      },
      {
        id: 'orsted_council_repeat',
        label: '🐉 [Mật Đàm Chiến Lược Orsted]: Rà soát lại từng mắt xích vận mệnh và củng cố liên minh',
        actionText: 'Tiếp tục rà soát các động thái của kẻ thù trong bóng tối cùng Long Thần Orsted tại Sharia.',
        riskLevel: 'safe',
        category: 'social',
      },
    ];

    // Danh sách 5: Tuyến Ngoại Giao Vương Quyền
    const diplomacyStages: TurnChoice[] = [
      {
        id: 'world_diplomacy_0',
        label: '🏛️ [Ngoại Giao Vương Quyền]: Đến Cung điện Asura tham vấn Nữ hoàng Ariel và viện trợ ma cụ',
        actionText: 'Dự yến tiệc ngoại giao cấp cao tại Vương quốc Asura, củng cố liên minh vương quyền và nhận tài trợ ma thạch quý.',
        riskLevel: 'safe',
        category: 'social',
      },
      {
        id: 'world_diplomacy_1',
        label: '🏛️ [Ngoại Giao Thánh Quốc]: Đến Millishion giải mã thánh ấn cổ cùng Đức Giáo Hoàng',
        actionText: 'Được Giáo Hoàng Millis đón tiếp nồng hậu, giải trừ hiểu lầm giữa các giáo phái và ký hiệp ước đồng minh hòa bình.',
        riskLevel: 'safe',
        category: 'social',
      },
      {
        id: 'world_diplomacy_2',
        label: '⚔️ [Luận Kiếm Thánh Địa]: Đến Kiếm Thần Điện giao lưu kiếm ý cùng Kiếm Thần Jino Britt',
        actionText: 'Tham gia đại hội kiếm thuật tại Kiếm Thần Điện, thi triển bộ pháp kết hợp ma thuật mở rộng tầm mắt cho toàn bộ kiếm sĩ thế giới.',
        riskLevel: 'moderate',
        category: 'sword',
      },
      {
        id: 'world_diplomacy_3',
        label: '🦅 [Hiệp Ước Thiên Tộc]: Cưỡi thần thú lên Thiên Lục Địa hội đàm cùng Thiên Vương',
        actionText: 'Bay qua các pháo đài mây của Thiên tộc, gia cố hiệp ước liên minh phòng thủ chung chống lại thế lực tà ác ngầm.',
        riskLevel: 'safe',
        category: 'explore',
      },
      {
        id: 'world_diplomacy_repeat',
        label: '🏛️ [Ngoại Giao Liên Bang]: Duy trì mối liên kết hòa hảo với các cường quốc khắp Sáu Mặt',
        actionText: 'Phát triển thương mại ma pháp cụ và bảo vệ an ninh thương lộ giữa các lục địa.',
        riskLevel: 'safe',
        category: 'social',
      },
    ];

    // Danh sách 6: Tuyến Bế Quan & Đột Phá Thần Vực
    const breakthroughStages: TurnChoice[] = [
      {
        id: 'god_realm_0',
        label: '⚡ [Bế Quan Đột Phá 1/5]: Cô lập kết giới ma lực, mở rộng kinh mạch nén Đấu Khí Hoàng Kim',
        actionText: 'Bế quan trong mật thất cô lập ma lực, liên tục nén và xả Mana cực hạn để kết tinh dòng Đấu Khí Hoàng Kim bảo hộ toàn thân.',
        riskLevel: 'safe',
        category: 'magic',
      },
      {
        id: 'god_realm_1',
        label: '⚡ [Bế Quan Đột Phá 2/5]: Sáng tạo biến thể Ma Pháp Lôi Điện & Lốc Xoáy quy mô Thiên Tai',
        actionText: 'Vận dụng định luật vật lý hiện đại đưa ma pháp đạt tới quy mô bão từ và sấm sét cấp Vương/Đế vô niệm chú.',
        riskLevel: 'moderate',
        category: 'magic',
      },
      {
        id: 'god_realm_2',
        label: '⚡ [Bế Quan Đột Phá 3/5]: Dung hợp Ma Pháp Vô Niệm cùng Kiếm Ý tạo Ma Kiếm Thần Cực',
        actionText: 'Hòa quyện dòng chảy Mana nguyên tố vào lưỡi kiếm, tạo nên đòn chém dung hợp có khả năng cắt đứt không gian.',
        riskLevel: 'moderate',
        category: 'sword',
      },
      {
        id: 'god_realm_3',
        label: '⚡ [Bế Quan Đột Phá 4/5]: Phá vỡ bình cảnh Kiếm Đế / Kiếm Thần phái',
        actionText: 'Luyện tập đạt tới cảnh giới Tâm Kiếm Nhất Thể, phản xạ né đòn và tốc độ vung kiếm đạt vận tốc âm thanh.',
        riskLevel: 'moderate',
        category: 'sword',
      },
      {
        id: 'god_realm_repeat',
        label: '⚡ [Tu Luyện Thần Vực]: Hòa mình vào thiên địa, tôi luyện cảnh giới tối thượng',
        actionText: 'Tĩnh tọa cảm thụ cội nguồn ma lực vũ trụ, củng cố thần hồn và bình chứa Mana bao la như biển rộng.',
        riskLevel: 'safe',
        category: 'magic',
      },
    ];

    // Danh sách 7: Tuyến Khai Phá Mê Cung & Thần Khí Cổ Đại
    const ruinsStages: TurnChoice[] = [
      {
        id: 'ancient_ruins_0',
        label: '🏰 [Mê Cung Tối Thượng 1/4]: Khai phá Tầng Cấm Kỵ sâu nhất của Labyrinth Begaritto',
        actionText: 'Thâm nhập vào mê cung quái vật cấp S chưa ai khai phá để săn lùng Tinh Thể Ma Lực Cực Đại và bản vẽ Thần Khí thời Thần Thoại.',
        riskLevel: 'dangerous',
        category: 'hunt',
      },
      {
        id: 'ancient_ruins_1',
        label: '🏰 [Mê Cung Tối Thượng 2/4]: Khám phá Di Chỉ Long Giới Thần Thoại thời tiền sử',
        actionText: 'Giải mã bia đá ghi chép trận chiến hủy diệt giữa Long Thần Đời 1 và các Cổ Thần, tiếp thu tri thức ma thuật triệu hồi thất truyền.',
        riskLevel: 'dangerous',
        category: 'study',
      },
      {
        id: 'ancient_ruins_2',
        label: '🏰 [Mê Cung Tối Thượng 3/4]: Thu thập Quặng Ma Thạch Thần Thoại rèn đúc Thần Khí',
        actionText: 'Mang về xưởng Sharia kim loại quý hiếm có khả năng hấp thụ và khuếch đại Mana gấp 5 lần để chế tạo vũ khí tối thượng.',
        riskLevel: 'moderate',
        category: 'study',
      },
      {
        id: 'ancient_ruins_repeat',
        label: '🏰 [Thám Hiểm Cổ Tích]: Khảo sát các vết rách không gian tàn dư của Thảm Họa Dịch Chuyển',
        actionText: 'Thanh tẩy các nguồn năng lượng hỗn loạn còn sót lại trên khắp lục địa, thu thập các di vật cổ đại.',
        riskLevel: 'moderate',
        category: 'explore',
      },
    ];

    // Lấy lựa chọn tiến trình cốt truyện theo từng nhánh
    const hIdx = Math.min(peak.hitogamiInvestigationStage || 0, hitogamiStages.length - 1);
    const aIdx = Math.min(peak.magicArmorTechStage || 0, armorStages.length - 1);
    const fIdx = Math.min(peak.familyLegacyStage || 0, familyStages.length - 1);
    const oIdx = Math.min(peak.orstedCouncilStage || 0, orstedStages.length - 1);
    const dIdx = Math.min(peak.worldDiplomacyStage || 0, diplomacyStages.length - 1);
    const bIdx = Math.min(peak.godRealmBreakthroughStage || 0, breakthroughStages.length - 1);
    const rIdx = Math.min(peak.ancientRuinsStage || 0, ruinsStages.length - 1);

    const hitogamiChoice = hitogamiStages[hIdx];
    const armorChoice = armorStages[aIdx];
    const familyChoice = familyStages[fIdx];
    const orstedChoice = orstedStages[oIdx];
    const diploChoice = diplomacyStages[dIdx];
    const breakthroughChoice = breakthroughStages[bIdx];
    const ruinsChoice = ruinsStages[rIdx];

    // =========================================================================
    // KHO LỰA CHỌN THEO TỪNG MỐC ĐỘ TUỔI ĐỈNH PHONG CỦA RUDEUS GREYRAT
    // =========================================================================
    const ageEraChoices: TurnChoice[] = [];

    if (age < 27) {
      // Tuổi 24 - 26: Giai đoạn Hậu Chiến Millis, Nâng cấp Mk.II & Ổn Định Gia Đình Sharia
      ageEraChoices.push(
        {
          id: 'era_24_26_sparring_eris',
          label: '⚔️ [Khổ Luyện Kiếm Thuật]: Đấu tập cường độ cao cùng Kiếm Vương Eris',
          actionText: 'Rèn luyện phản xạ đối kháng kiếm thuật cận chiến cùng Eris tại sân tập Sharia, trau dồi bộ pháp Thủy Thần và Kiếm Thần phái.',
          riskLevel: 'safe',
          category: 'sword',
        },
        {
          id: 'era_24_26_zenith_care',
          label: '🌸 [Tình Mẫu Tử]: Ngồi bên mẹ Zenith và khám phá năng lực giao cảm tâm linh',
          actionText: 'Dành buổi chiều ấm áp bên mẹ Zenith, dùng dòng mana êm dịu kết nối tâm thức và lắng nghe cảm nhận bình yên của mẹ.',
          riskLevel: 'safe',
          category: 'social',
        },
        {
          id: 'era_24_26_ranoa_research',
          label: '📚 [Nghiên Cứu Viện Ranoa]: Giải mã nguyên lý vết nứt không gian cùng Silent Fitz',
          actionText: 'Cùng Sylphie đến viện nghiên cứu ma thuật triệu hồi Ranoa, đọc các cổ tịch về kết giới phong ấn và biến dị ma lực.',
          riskLevel: 'safe',
          category: 'study',
        },
        {
          id: 'era_24_26_s_rank_bounty',
          label: '🏹 [Ủy Thác Rank S]: Tiễu trừ bầy ma thú đột biến bảo vệ thương lộ Ranoa',
          actionText: 'Dẫn đầu nhóm mạo hiểm giả nhận ủy thác cấp S, quét sạch đàn ma thú nguy hiểm quấy nhiễu các đoàn xe buôn bán.',
          riskLevel: 'moderate',
          category: 'hunt',
        }
      );
    } else if (age < 30) {
      // Tuổi 27 - 29: Giai đoạn Đại Chiến Biheiril & Hội Quân Liệt Cường
      ageEraChoices.push(
        {
          id: 'era_27_29_superd_reunion',
          label: '🛡️ [Liên Minh Superd]: Cùng Ruijerd rà soát doanh trại chiến binh Superd',
          actionText: 'Đến thăm bộ tộc Superd đã được giải trừ kỳ thị, phối hợp xây dựng trận địa phòng thủ cấm ma pháp nghênh đón tay sai Hitogami.',
          riskLevel: 'safe',
          category: 'sword',
        },
        {
          id: 'era_27_29_atofe_pact',
          label: '🍷 [Ma Giới Minh Ước]: Dự yến tiệc liên minh cùng Ma Vương Bất Tử Atofe',
          actionText: 'Đàm phán và kết giao cùng nữ Ma Vương Atofe tại chiến địa, đảm bảo viện binh ma tộc sẵn sàng xuất kích khi có hiệu lệnh.',
          riskLevel: 'moderate',
          category: 'social',
        },
        {
          id: 'era_27_29_fortify_mountains',
          label: '⛰️ [Công Sự Hắc Long Lĩnh]: Dùng Thổ Ma Pháp tạo bãi lầy Quagmire diện rộng',
          actionText: 'Bơm mana liên tục biến đổi hàng ngàn mẫu đất đá thành đầm lầy bùn nhão Quagmire ngăn chặn đường tiến quân của đối phương.',
          riskLevel: 'safe',
          category: 'magic',
        },
        {
          id: 'era_27_29_lara_leo_bond',
          label: '🐕 [Linh Khuyển Leo]: Huấn luyện thần thú Leo bảo hộ giấc mơ của bé Lara',
          actionText: 'Chơi đùa cùng bé Lara và linh khuyển Leo trong sân nhà Sharia, củng cố thần giao cách cảm bảo vệ gia đình khỏi cạm bẫy tâm linh.',
          riskLevel: 'safe',
          category: 'social',
        }
      );
    } else if (age < 40) {
      // Tuổi 30 - 39: Giai đoạn Đệ Bát Liệt Cường, Tông Sư Sharia & Thế Hệ Kế Thừa
      ageEraChoices.push(
        {
          id: 'era_30_39_teach_ars_sword',
          label: '⚔️ [Dạy Dỗ Ars]: Rèn kiếm thuật và hiệp nghĩa trượng phu cho con trai Ars',
          actionText: 'Cùng Eris uốn nắn bộ pháp kiếm thuật và răn dạy đạo lý làm người chính trực, dũng cảm cho con trai Ars Greyrat.',
          riskLevel: 'safe',
          category: 'sword',
        },
        {
          id: 'era_30_39_protect_sieg',
          label: '💚 [Bảo Bọc Sieghart]: Truyền dạy tình thương và tôi luyện Đấu Khí cho Sieg',
          actionText: 'Ôm Sieghart tóc xanh Laplace vào lòng, bồi đắp lòng tự hào và hướng dẫn con cách làm chủ sức mạnh thể chất phi thường.',
          riskLevel: 'safe',
          category: 'social',
        },
        {
          id: 'era_30_39_teleport_network',
          label: '🌀 [Mạng Lưới Dịch Chuyển]: Bảo trì và ngụy trang các vòng tròn ma pháp liên lục địa',
          actionText: 'Cùng Pháp sư Cliff đi tuần tra các trạm dịch chuyển ngầm, gia cố kết giới ngụy trang tránh sự phát hiện của giáo hội bài trừ.',
          riskLevel: 'safe',
          category: 'magic',
        },
        {
          id: 'era_30_39_magitech_guild',
          label: '⚙️ [Thương Hội Ma Đạo]: Mở rộng xưởng chế tác chi giả ma thuật phục vụ dân sinh',
          actionText: 'Cùng Hoàng tử Zanoba hoàn thiện các mẫu chân tay giả ma pháp trợ lực giúp đỡ các thương binh và người tàn tật trên khắp thế giới.',
          riskLevel: 'safe',
          category: 'study',
        }
      );
    } else if (age < 50) {
      // Tuổi 40 - 49: Trụ Cột Thế Giới Sáu Mặt & Chuẩn Bị Thế Hệ Cứu Thế
      ageEraChoices.push(
        {
          id: 'era_40_49_guide_lara_destiny',
          label: '🔮 [Thiên Mệnh Lara]: Hướng dẫn Lara tiếp thu sứ mệnh anh hùng cứu thế',
          actionText: 'Lắng nghe những tiên tri và giấc mơ sâu sắc của con gái Lara, trang bị vũ khí và tri thức ma thuật chuẩn bị đối đầu tương lai.',
          riskLevel: 'safe',
          category: 'study',
        },
        {
          id: 'era_40_49_world_peace_summit',
          label: '👑 [Hội Nghị Thượng Đỉnh]: Tọa đàm hòa bình giữa Nữ hoàng Ariel và các đại lãnh chúa',
          actionText: 'Xuất hiện với tư cách Đệ Bát Liệt Cường tại Cung điện Asura, hòa giải các tranh chấp lãnh thổ và duy trì trật tự hòa bình thế giới.',
          riskLevel: 'safe',
          category: 'social',
        },
        {
          id: 'era_40_49_labyrinth_depths',
          label: '🏰 [Mê Cung Begaritto]: Chinh phục Tầng Cấm Kỵ 60 thu thập Cổ Thạch Sáng Thế',
          actionText: 'Dẫn đầu đoàn mạo hiểm giả huyền thoại thâm nhập tầng sâu nhất của đại mê cung sa mạc, thanh tẩy quái vật cấp Thần cổ đại.',
          riskLevel: 'dangerous',
          category: 'explore',
        },
        {
          id: 'era_40_49_family_golden_years',
          label: '🍷 [Hoàng Kim Sum Vầy]: Bữa tiệc kỷ niệm ấm áp bên Sylphie, Roxy và Eris',
          actionText: 'Thưởng thức rượu nho Sharia, ngắm nhìn con cháu quây quần và cảm tạ quãng đời hạnh phúc vô giá bên ba người vợ hiền.',
          riskLevel: 'safe',
          category: 'rest',
        }
      );
    } else {
      // Tuổi 50+: Huyền Thoại Bất Tử, Chắp Bút Biên Niên Sử & Di Sản Bất Diệt
      ageEraChoices.push(
        {
          id: 'era_50_plus_memoirs_volume',
          label: '📜 [Đại Biên Niên Sử]: Chắp bút hồi ký truyền thế ghi chép bí mật Sáu Mặt',
          actionText: 'Ghi chép cẩn mật toàn bộ chân tướng về Nhân Thần Hitogami, Long Thần Orsted và hành trình chuyển sinh vào pho sử thi gia tộc.',
          riskLevel: 'safe',
          category: 'study',
        },
        {
          id: 'era_50_plus_transfer_relics',
          label: '💎 [Truyền Thừa Bảo Vật]: Trao tặng Trượng Aqua Heartia và thần khí cho hậu thế',
          actionText: 'Lựa chọn người kế thừa xứng đáng trong đàn cháu chắt để trao lại trượng pháp sư kiêu hãnh và các bí kíp ma pháp vô niệm.',
          riskLevel: 'safe',
          category: 'social',
        },
        {
          id: 'era_50_plus_orsted_pact',
          label: '🐉 [Tri Kỷ Long Thần]: Đàm đạo cùng Orsted hoàn tất chiến lược 80 năm sau',
          actionText: 'Ngồi uống trà cùng Long Thần Orsted tại Sharia, bàn giao toàn bộ mạng lưới tình báo và tài nguyên cho trận quyết chiến tương lai.',
          riskLevel: 'safe',
          category: 'social',
        },
        {
          id: 'era_50_plus_peaceful_twilight',
          label: '🏡 [Hoàng Hôn Thanh Bình]: Chăm sóc hoa cỏ Sharia, thanh thản ngắm nhìn thế gian',
          actionText: 'Tĩnh tọa trong sân vườn dinh thự Sharia, hòa mình vào thiên địa bao la, tâm hồn an lạc không còn vướng bận tiếc nuối.',
          riskLevel: 'safe',
          category: 'rest',
        }
      );
    }

    // Tập hợp toàn bộ ứng viên cốt truyện và đời sống cho độ tuổi hiện tại
    const candidateChoices: TurnChoice[] = [
      hitogamiChoice,
      armorChoice,
      familyChoice,
      orstedChoice,
      diploChoice,
      breakthroughChoice,
      ruinsChoice,
      ...ageEraChoices,
    ];

    // Lọc bỏ các lựa chọn vừa thực hiện trong 4 lượt gần nhất để tuyệt đối không lặp lại
    const recentIds = peak.recentChoiceIds || [];
    const freshChoices = candidateChoices.filter(c => !recentIds.slice(-4).includes(c.id));
    const poolToPickFrom = freshChoices.length >= 4 ? freshChoices : candidateChoices;

    // Trộn ngẫu nhiên dựa trên seed để thứ tự các nhánh luôn thay đổi bất ngờ mỗi lượt
    const shuffled = [...poolToPickFrom].sort((a, b) => {
      const hashA = (a.id.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0) * 17 + seed) % 97;
      const hashB = (b.id.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0) * 17 + seed) % 97;
      return hashA - hashB;
    });

    // Chọn đúng 4 lựa chọn đa dạng (khác category nếu có thể)
    for (const item of shuffled) {
      if (choices.length < 5 && !choices.some(c => c.id === item.id)) {
        choices.push(item);
      }
    }
  }

  return choices;
}

/**
 * Procedural simulation engine with complete 3-Phase Combat Engine
 */
export function processProceduralTurn(
  prevCharacter: Character,
  actionText: string = '',
  turnNumber: number,
  choice?: TurnChoice
): GmTurnResponse {
  const character: Character = JSON.parse(JSON.stringify(prevCharacter));
  const systemNotes: string[] = [];
  const safeActionText = actionText || '';
  const actionLower = safeActionText.toLowerCase();

  // Đảm bảo hệ thống tiến trình và bình cảnh được kích hoạt
  ensureCharacterProgression(character);
  syncCharacterTalentStats(character);

  // Đảm bảo hệ thống tiến trình đa tuyến đỉnh phong tuổi 24+ được khởi tạo
  character.peakStoryProgression = character.peakStoryProgression || {
    hitogamiInvestigationStage: 0,
    magicArmorTechStage: 0,
    orstedCouncilStage: 0,
    familyLegacyStage: 0,
    worldDiplomacyStage: 0,
    godRealmBreakthroughStage: 0,
    ancientRuinsStage: 0,
    recentChoiceIds: [],
  };
  character.peakStoryProgression.recentChoiceIds = character.peakStoryProgression.recentChoiceIds || [];
  const choiceId = choice?.id || '';
  if (choiceId) {
    character.peakStoryProgression.recentChoiceIds.push(choiceId);
    if (character.peakStoryProgression.recentChoiceIds.length > 20) {
      character.peakStoryProgression.recentChoiceIds.shift();
    }
  }

  // =========================================================================
  // AI INNER COGNITION LOOP (QUY TRÌNH SUY NGHĨ NGẦM 4 BƯỚC CỦA GAME MASTER)
  // =========================================================================
  // BƯỚC 1: Đánh giá Tính khả thi (Plausibility Check)
  const plausibility = evaluateActionPlausibility(character, safeActionText);
  if (plausibility.isFatal) {
    character.isDead = true;
    character.deathReason = plausibility.punishmentReason;
    return {
      narration: `[TỬ VONG / GAME OVER - HÀNH ĐỘNG BẤT HỢP LÝ / HOANG ĐƯỜNG]
${plausibility.punishmentReason}
Thế giới đại lục vận hành bằng quy luật khắc nghiệt, không có chỗ cho những hành vi hoang tưởng vượt ngoài ranh giới sinh tồn.`,
      statusSummary: `• Trạng thái: Đã tử vong (0 HP)\n• Nguyên nhân: ${plausibility.punishmentReason}`,
      systemNotes: ['Bạn đã tử vong do hành động phi thực tế trong thế giới sandbox!'],
      choices: [],
      updatedCharacter: character,
      isGameOver: true,
      deathReason: plausibility.punishmentReason,
    };
  }

  if (plausibility.isAbsurd && plausibility.punishmentType === 'imprisonment') {
    character.stats.healthCurrent = Math.max(5, character.stats.healthCurrent - 20);
    if (!character.statusEffects.includes('Tống Giam & Thẩm Vấn (Imprisoned)')) {
      character.statusEffects.push('Tống Giam & Thẩm Vấn (Imprisoned)');
    }
    systemNotes.push(plausibility.punishmentReason || 'Bạn đã bị bắt giữ vì hành vi làm ô uế thể diện quý tộc!');
  }

  if (plausibility.isScientificInnovation) {
    systemNotes.push(plausibility.scientificBonusNote || 'Sáng tạo đột phá khoa học!');
    if (character.progression) {
      character.progression.knowledgePoints += 25;
    }
  }

  if (plausibility.isPsychologicalDiplomacy) {
    systemNotes.push(plausibility.diplomacyNote || 'Đòn bẩy tâm lý & đàm phán thành công!');
  }

  // BƯỚC 2: Phân tích Tâm lý NPC & Môi trường
  const regionalMindset = getRegionalNpcMindset(character.stats.location);

  // BƯỚC 3 & 4: Tính toán Hiệu ứng Cánh Bướm & Can thiệp Số Mệnh
  let { rippleEffectText, fateNote } = evaluateButterflyAndFate(character, safeActionText, turnNumber);
  if (fateNote) {
    systemNotes.push(fateNote);
  }
  if (rippleEffectText) {
    if (!character.butterflyEffects) character.butterflyEffects = [];
    character.butterflyEffects.push(rippleEffectText);
  }

  // Check permadeath
  const deathCheck = evaluatePermadeathRisk(character, safeActionText);
  if (deathCheck.isFatal) {
    character.isDead = true;
    character.deathReason = deathCheck.reason;
    return {
      narration: `[TỬ VONG / GAME OVER]
${deathCheck.reason}
Ý thức của bạn tan biến vào hư vô. Thế giới này không có chỗ cho sự bất cẩn hay liều lĩnh thiếu hiểu biết. Cuộc đời ngắn ngủi kết thúc tại đây...`,
      statusSummary: `• Trạng thái: Đã tử vong (0 HP)\n• Nguyên nhân: Khiêu khích thực thể ngoài tầm với`,
      systemNotes: ['Bạn đã tử vong do chọn hành động chí mạng!', 'Hãy nạp lại Điểm lưu (Checkpoint) để làm lại.'],
      choices: [],
      updatedCharacter: character,
      isGameOver: true,
      deathReason: deathCheck.reason,
    };
  }

  // ==========================================
  const isCasting = 
    (actionLower.includes('ma pháp') || actionLower.includes('phép') || actionLower.includes('niệm chú') || actionLower.includes('thần chú') || actionLower.includes('vô niệm chú') || actionLower.includes('hỏa cầu') || actionLower.includes('thủy pháo') || actionLower.includes('đạn đá')) && 
    !actionLower.includes('chú ý') && !actionLower.includes('chú tâm') && !actionLower.includes('chú bác');
  const manaExhaust = evaluateManaExhaustion(character, isCasting && character.stats.manaCurrent <= 0);
  if (manaExhaust.warningText) {
    systemNotes.push(manaExhaust.warningText);
    if (manaExhaust.stage === 1 && !character.statusEffects.includes('Kiệt Quệ Mana (GĐ1)')) {
      character.statusEffects.push('Kiệt Quệ Mana (GĐ1)');
    } else if (manaExhaust.stage === 2 && !character.statusEffects.includes('Hôn Mê Kiệt Mana (GĐ2)')) {
      character.statusEffects.push('Hôn Mê Kiệt Mana (GĐ2)');
    }
  }

  // ==========================================
  // RULE 2 & 3: RÀNG BUỘC KỸ NĂNG, MA PHÁP & BA ĐẠI KIẾM PHÁI
  // ==========================================
  const isSystemChoice = !!choice;
  const skillValidation = validateUnlearnedSkillUsage(character, safeActionText, isSystemChoice);
  if (!skillValidation.isValid) {
    character.stats.healthCurrent = Math.max(1, character.stats.healthCurrent - skillValidation.hpPenalty);
    character.stats.manaCurrent = Math.max(0, character.stats.manaCurrent - skillValidation.manaPenalty);

    const equipSummary = formatEquipmentSummary(character.equipment);
    const narration = `[THẤT BẠI: PHẢN PHỆ KỸ NĂNG CHƯA HỌC]
${skillValidation.backfireReason}

HẬU QUẢ TỨC THÌ:
• Tổn thất Sinh lực (HP): -${skillValidation.hpPenalty} HP (Kinh mạch bỏng rát, cơ bắp rách nứt do vận hành sai kỹ thuật)
• Tổn thất Mana: -${skillValidation.manaPenalty} MP (Dòng chảy Mana bị tắc nghẽn và rò rỉ hỗn loạn)
• Tác động: Hành động bị vô hiệu hóa hoàn toàn trong lượt này! Bạn buộc phải dừng lại để bình ổn kinh mạch và hơi thở.`;

    const statusSummary = `• Tuổi: ${character.stats.age} tuổi ${character.stats.month} tháng | Vị trí: ${character.stats.location}
• HP: ${character.stats.healthCurrent}/${character.stats.healthMax} (-${skillValidation.hpPenalty}) | Mana: ${character.stats.manaCurrent}/${character.stats.manaMax} (-${skillValidation.manaPenalty})
• Cảnh báo: Đang chịu dư chấn phản phệ kỹ năng chưa học`;

    return {
      narration,
      statusSummary: `${statusSummary}\n\n${equipSummary}`,
      equipmentSummaryText: equipSummary,
      systemNotes: [
        'QUY TẮC BẮT BUỘC: Không thể sử dụng ma pháp hoặc kiếm phái khi chưa học!',
        'Hãy tìm sư phụ (như Roxy, Paul, Ghislaine...), đọc sách học phép hoặc bái sư để lĩnh giáo kỹ năng chuẩn tắc.'
      ],
      choices: [
        {
          id: 'recover_breath',
          label: '1. [Bình ổn kinh mạch] - Ngồi thiền, điều hòa dòng chảy Mana bị tắc nghẽn',
          actionText: 'Ngồi tĩnh tọa, nhắm mắt điều hòa lại dòng chảy Mana đang sôi trào trong cơ thể để làm dịu cơn đau.',
          riskLevel: 'safe',
          category: 'rest',
        },
        {
          id: 'consult_mentor',
          label: '2. [Tầm sư học đạo] - Tìm gia sư / Bậc tiền bối xin chỉ giáo kỹ năng bài bản',
          actionText: 'Tìm người thân, gia sư hoặc các kiếm sĩ / pháp sư xung quanh để thỉnh giáo nền tảng từ đầu.',
          riskLevel: 'safe',
          category: 'study',
        },
        {
          id: 'practice_basics',
          label: '3. [Luyện tập sơ cấp] - Quay về rèn luyện các bước vận hành cơ bản',
          actionText: 'Tập trung rèn luyện các động tác điều tức hoặc vung kiếm cơ bản nhất của người mới bắt đầu.',
          riskLevel: 'safe',
          category: 'magic',
        },
      ],
      updatedCharacter: character,
      isGameOver: false,
    };
  }

  character.equipment = character.equipment || {};
  character.maxInventorySlots = character.maxInventorySlots || 20;

  // ==========================================
  // EQUIPMENT COMMAND 1: Trang bị [Vật phẩm] vào [Ô]
  // ==========================================
  const isEquipCommand = actionLower.startsWith('trang bị') || actionLower.startsWith('đeo ') || actionLower.startsWith('mặc ') || actionLower.startsWith('equip ') || actionLower.startsWith('lắp ') || actionLower.startsWith('gắn ');
  if (isEquipCommand) {
    let itemName = '';
    let targetSlotKey: EquipmentSlotKey | undefined = undefined;

    const matchWithSlot = safeActionText.match(/(?:trang bị|đeo|mặc|equip|lắp|gắn)[:\s]+\[?([^\]]+?)\]?\s+(?:vào|sang|ở|in|to)\s+\[?([^\]]+?)\]?$/i);
    if (matchWithSlot) {
      itemName = matchWithSlot[1].trim();
      const slotQuery = matchWithSlot[2] ? matchWithSlot[2].trim().toLowerCase() : '';
      if (slotQuery.includes('đầu') || slotQuery.includes('mũ') || slotQuery.includes('head')) targetSlotKey = 'head';
      else if (slotQuery.includes('thân') || slotQuery.includes('giáp') || slotQuery.includes('áo') || slotQuery.includes('body')) targetSlotKey = 'body';
      else if (slotQuery.includes('quần') || slotQuery.includes('legs')) targetSlotKey = 'legs';
      else if (slotQuery.includes('giày') || slotQuery.includes('bốt') || slotQuery.includes('feet')) targetSlotKey = 'feet';
      else if (slotQuery.includes('trái') || slotQuery.includes('left')) targetSlotKey = 'leftHand';
      else if (slotQuery.includes('phải') || slotQuery.includes('right')) targetSlotKey = 'rightHand';
      else if (slotQuery.includes('1')) targetSlotKey = 'accessory1';
      else if (slotQuery.includes('2')) targetSlotKey = 'accessory2';
      else if (slotQuery.includes('3')) targetSlotKey = 'accessory3';
      else if (slotQuery.includes('4')) targetSlotKey = 'accessory4';
      else if (slotQuery.includes('5')) targetSlotKey = 'accessory5';
    } else {
      const matchSimple = safeActionText.match(/(?:trang bị|đeo|mặc|equip|lắp|gắn)[:\s]+\[?([^\]]+)\]?$/i);
      if (matchSimple) {
        itemName = matchSimple[1].trim();
      }
    }

    const queryLower = (itemName || '').toLowerCase();
    const foundItem = character.inventory.find(i => 
      i?.name && queryLower && (
        i.name.toLowerCase().includes(queryLower) || 
        queryLower.includes(i.name.toLowerCase())
      ) || (i?.id && queryLower && (i.id.toLowerCase() === queryLower || queryLower.includes(i.id.toLowerCase())))
    ) || (queryLower === '' ? character.inventory.find(i => getValidSlotsForItem(i).length > 0) : undefined);

    if (foundItem) {
      const equipRes = equipItem(character, foundItem.id, targetSlotKey);
      const equipSummary = formatEquipmentSummary(equipRes.updatedCharacter.equipment);
      return {
        narration: `[THAO TÁC TRANG BỊ VẬT PHẨM]\n${equipRes.message}\n\nChỉ số trang bị và hiệu ứng ngầm đã được áp dụng trực tiếp vào cơ thể!`,
        statusSummary: `• Thao tác: ${equipRes.message}\n• Túi đồ: ${equipRes.updatedCharacter.inventory.length}/${equipRes.updatedCharacter.maxInventorySlots} ô\n\n${equipSummary}`,
        equipmentSummaryText: equipSummary,
        systemNotes: [equipRes.message],
        choices: [
          { id: 'view_inv', label: 'Xem túi đồ & bảng trang bị', actionText: '!inventory', riskLevel: 'safe', category: 'explore' },
          { id: 'back_explore', label: 'Tiếp tục hành trình', actionText: 'Tiếp tục chuyến phiêu lưu', riskLevel: 'safe', category: 'explore' },
        ],
        updatedCharacter: equipRes.updatedCharacter,
        isGameOver: false,
      };
    }
  }

  // ==========================================
  // EQUIPMENT COMMAND 2: Tháo [Ô]
  // ==========================================
  const isUnequipCommand = actionLower.startsWith('tháo ') || actionLower.startsWith('unequip ');
  if (isUnequipCommand) {
    let targetSlotKey: EquipmentSlotKey | undefined = undefined;
    if (actionLower.includes('đầu') || actionLower.includes('mũ') || actionLower.includes('head')) targetSlotKey = 'head';
    else if (actionLower.includes('thân') || actionLower.includes('giáp') || actionLower.includes('áo') || actionLower.includes('body')) targetSlotKey = 'body';
    else if (actionLower.includes('quần') || actionLower.includes('legs')) targetSlotKey = 'legs';
    else if (actionLower.includes('giày') || actionLower.includes('bốt') || actionLower.includes('feet')) targetSlotKey = 'feet';
    else if (actionLower.includes('trái') || actionLower.includes('left')) targetSlotKey = 'leftHand';
    else if (actionLower.includes('phải') || actionLower.includes('right')) targetSlotKey = 'rightHand';
    else if (actionLower.includes('1')) targetSlotKey = 'accessory1';
    else if (actionLower.includes('2')) targetSlotKey = 'accessory2';
    else if (actionLower.includes('3')) targetSlotKey = 'accessory3';
    else if (actionLower.includes('4')) targetSlotKey = 'accessory4';
    else if (actionLower.includes('5')) targetSlotKey = 'accessory5';
    else {
      const slots: EquipmentSlotKey[] = ['leftHand', 'rightHand', 'body', 'head', 'legs', 'feet', 'accessory1', 'accessory2', 'accessory3', 'accessory4', 'accessory5'];
      for (const s of slots) {
        if (character.equipment && character.equipment[s] && character.equipment[s]?.name && actionLower.includes(character.equipment[s]!.name.toLowerCase())) {
          targetSlotKey = s;
          break;
        }
      }
    }

    if (targetSlotKey) {
      const unequipRes = unequipItem(character, targetSlotKey);
      const equipSummary = formatEquipmentSummary(unequipRes.updatedCharacter.equipment);
      return {
        narration: `[THAO TÁC THÁO TRANG BỊ]\n${unequipRes.message}\n\nVật phẩm đã được cất an toàn vào túi đồ.`,
        statusSummary: `• Thao tác: ${unequipRes.message}\n• Túi đồ: ${unequipRes.updatedCharacter.inventory.length}/${unequipRes.updatedCharacter.maxInventorySlots} ô\n\n${equipSummary}`,
        equipmentSummaryText: equipSummary,
        systemNotes: [unequipRes.message],
        choices: [
          { id: 'view_inv', label: 'Xem túi đồ & bảng trang bị', actionText: '!inventory', riskLevel: 'safe', category: 'explore' },
          { id: 'back_explore', label: 'Tiếp tục hành trình', actionText: 'Tiếp tục chuyến phiêu lưu', riskLevel: 'safe', category: 'explore' },
        ],
        updatedCharacter: unequipRes.updatedCharacter,
        isGameOver: false,
      };
    }
  }

  // ==========================================
  // EQUIPMENT COMMAND 4: Bán [Vật phẩm / Chiến lợi phẩm]
  // ==========================================
  const isSellCommand = actionLower.startsWith('bán ') || actionLower.startsWith('sell ');
  if (isSellCommand) {
    const sellQuery = actionLower.replace(/^(?:bán|sell)[:\s]+/i, '').replace(/[\[\]]/g, '').trim();
    if (sellQuery.includes('chiến lợi phẩm') || sellQuery.includes('loot') || sellQuery.includes('rác') || sellQuery.includes('tất cả')) {
      const sellAllRes = sellAllLootItems(character);
      const equipSummary = formatEquipmentSummary(sellAllRes.updatedCharacter.equipment);
      return {
        narration: `[THAO TÁC BÁN CHIẾN LỢI PHẨM]\n${sellAllRes.message}`,
        statusSummary: `• Thao tác: ${sellAllRes.message}\n• Túi đồ: ${sellAllRes.updatedCharacter.inventory.length}/${sellAllRes.updatedCharacter.maxInventorySlots} ô | Tiền: ${sellAllRes.updatedCharacter.stats.asuraCoins || 0} Xu Asura\n\n${equipSummary}`,
        equipmentSummaryText: equipSummary,
        systemNotes: [sellAllRes.message],
        choices: [
          { id: 'view_inv', label: 'Xem túi đồ & bảng trang bị', actionText: '!inventory', riskLevel: 'safe', category: 'explore' },
          { id: 'back_explore', label: 'Tiếp tục hành trình', actionText: 'Tiếp tục chuyến phiêu lưu', riskLevel: 'safe', category: 'explore' },
        ],
        updatedCharacter: sellAllRes.updatedCharacter,
        isGameOver: false,
      };
    } else {
      const sellRes = sellItem(character, sellQuery);
      const equipSummary = formatEquipmentSummary(sellRes.updatedCharacter.equipment);
      return {
        narration: `[THAO TÁC BÁN VẬT PHẨM]\n${sellRes.message}`,
        statusSummary: `• Thao tác: ${sellRes.message}\n• Túi đồ: ${sellRes.updatedCharacter.inventory.length}/${sellRes.updatedCharacter.maxInventorySlots} ô | Tiền: ${sellRes.updatedCharacter.stats.asuraCoins || 0} Xu Asura\n\n${equipSummary}`,
        equipmentSummaryText: equipSummary,
        systemNotes: [sellRes.message],
        choices: [
          { id: 'view_inv', label: 'Xem túi đồ & bảng trang bị', actionText: '!inventory', riskLevel: 'safe', category: 'explore' },
          { id: 'back_explore', label: 'Tiếp tục hành trình', actionText: 'Tiếp tục chuyến phiêu lưu', riskLevel: 'safe', category: 'explore' },
        ],
        updatedCharacter: sellRes.updatedCharacter,
        isGameOver: false,
      };
    }
  }

  // ==========================================
  // EQUIPMENT COMMAND 5: Vứt / Hủy [Vật phẩm / Ô]
  // ==========================================
  const isDiscardCommand = actionLower.startsWith('vứt ') || actionLower.startsWith('hủy ') || actionLower.startsWith('bỏ ') || actionLower.startsWith('vứt bỏ ') || actionLower.startsWith('drop ') || actionLower.startsWith('discard ');
  if (isDiscardCommand) {
    const discardQuery = actionLower.replace(/^(?:vứt\s+bỏ|vứt|hủy|bỏ|drop|discard)[:\s]+/i, '').replace(/[\[\]]/g, '').trim();
    const discardRes = discardItem(character, discardQuery);
    const equipSummary = formatEquipmentSummary(discardRes.updatedCharacter.equipment);
    return {
      narration: `[THAO TÁC VỨT BỎ VẬT PHẨM]\n${discardRes.message}`,
      statusSummary: `• Thao tác: ${discardRes.message}\n• Túi đồ: ${discardRes.updatedCharacter.inventory.length}/${discardRes.updatedCharacter.maxInventorySlots} ô\n\n${equipSummary}`,
      equipmentSummaryText: equipSummary,
      systemNotes: [discardRes.message],
      choices: [
        { id: 'view_inv', label: 'Xem túi đồ & bảng trang bị', actionText: '!inventory', riskLevel: 'safe', category: 'explore' },
        { id: 'back_explore', label: 'Tiếp tục hành trình', actionText: 'Tiếp tục chuyến phiêu lưu', riskLevel: 'safe', category: 'explore' },
      ],
      updatedCharacter: discardRes.updatedCharacter,
      isGameOver: false,
    };
  }

  // ==========================================
  // INVENTORY COMMAND 3: Xem túi đồ / !inventory
  // ==========================================
  const isInventoryView = actionLower === '!inventory' || actionLower === 'xem túi đồ' || actionLower === '!túi đồ' || actionLower === '!bag';
  if (isInventoryView) {
    const equipSummary = formatEquipmentSummary(character.equipment);
    const maxSlots = character.maxInventorySlots || 20;
    const invItemsList = character.inventory.map((item, idx) => {
      const slotText = item.equipSlot ? ` [Vị trí: ${item.equipSlot}]` : '';
      return `  Ô ${idx + 1}: [${item.name}] (${item.tier || 'Phổ thông'})${slotText} - ${item.description}`;
    }).join('\n');

    const narration = `[BẢNG CHI TIẾT Ô TRANG BỊ & HÀNH TRANG TÚI ĐỒ]
======================================================
SỨC CHỨA TÚI ĐỒ: ${character.inventory.length} / ${maxSlots} Ô chứa (Grid Slots)
${character.inventory.length >= maxSlots ? '⚠️ CẢNH BÁO: Túi đồ đã đầy! Cần bán bớt hoặc mở rộng túi.' : 'Không gian túi đồ vẫn còn chỗ trống.'}

${equipSummary}

DANH SÁCH VẬT PHẨM TRONG TÚI ĐỒ (${character.inventory.length} / ${maxSlots} Ô):
${invItemsList || '  (Túi đồ hiện đang trống rỗng)'}

HƯỚNG DẪN THAO TÁC:
- Nhập: "Trang bị [Tên vật phẩm] vào [Tên ô]" để đeo trang bị.
- Nhập: "Tháo [Tên ô]" để gỡ trang bị cất lại vào túi đồ.
- Có thể dùng [Thương Hội & Chế Tạo] để bán đồ hoặc nâng cấp trang bị mới!`;

    return {
      narration,
      statusSummary: `• Túi đồ: ${character.inventory.length}/${maxSlots} ô | Tiền tệ: ${character.stats.asuraCoins || 0} Xu Asura\n\n${equipSummary}`,
      equipmentSummaryText: equipSummary,
      systemNotes: ['Đã mở chi tiết Bảng trang bị và 20 Ô hành trang.'],
      choices: [
        { id: 'open_shop', label: 'Ghé Thương Hội / Chế tạo trang bị', actionText: 'Giao dịch tại Thương Hội / Chế tạo trang bị', riskLevel: 'safe', category: 'trade' },
        { id: 'back_explore', label: 'Tiếp tục chuyến phiêu lưu', actionText: 'Tiếp tục cuộc sống thường nhật', riskLevel: 'safe', category: 'explore' },
      ],
      updatedCharacter: character,
      isGameOver: false,
    };
  }

  // ==========================================
  // COMBAT HUB & REGIONAL HUNTING SYSTEM
  // ==========================================
  const isCombatHubRequest = 
    !character.combat?.inCombat && 
    (actionLower.includes('mục chiến đấu') || actionLower.includes('khảo sát khu vực') || actionLower.includes('bảng sinh thái'));

  if (isCombatHubRequest) {
    const ecosystem = getEcosystemForLocation(character.stats.location);
    const narration = `[MÔ TẢ KHU VỰC: ${ecosystem.zoneName}]
Bạn phóng tầm mắt quan sát kỹ lưỡng khu vực hoang dã quanh ${character.stats.location}.
${ecosystem.description}
Không khí se lạnh mang theo mùi cỏ mục và nồng độ Mana tự nhiên dao động theo từng cơn gió. Dưới mặt đất ẩm và kẽ đá, bạn dễ dàng phát hiện những vết cào xới sâu của móng vuốt dã thú và vết trượt đặc trưng của loài săn mồi. Từ sâu trong rừng thẳm, tiếng gầm gừ đục ngầu thỉnh thoảng lại vọng ra khiến bầy chim muông hoảng loạn vỗ cánh bay tán loạn.

[DANH SÁCH MỤC TIÊU DỰ ĐOÁN THEO BẢNG SINH THÁI KHU VỰC]:
• Mức Độ Dễ (Sơ Cấp):
${ecosystem.easyMonsters.map(m => `  + ${m.name} [${m.tier}] - Rơi: ${m.loot} (Thưởng: ${m.rewardCoins} Xu Asura)`).join('\n')}
• Mức Độ Trung Bình (Trung Cấp):
${ecosystem.mediumMonsters.map(m => `  + ${m.name} [${m.tier}] - Rơi: ${m.loot} (Thưởng: ${m.rewardCoins} Xu Asura)`).join('\n')}
• Mức Độ Hiểm Họa (Thượng / Thánh Cấp):
${ecosystem.hardMonsters.map(m => `  + ${m.name} [${m.tier}] - Rơi: ${m.loot} (Thưởng: ${m.rewardCoins} Xu Asura)`).join('\n')}

Chỉ số Mệt Mỏi (Fatigue) hiện tại của bạn: ${character.stats.fatigue || 0}% ${character.stats.fatigue && character.stats.fatigue > 60 ? '(Cần nghỉ ngơi!)' : '(Khỏe mạnh)'}.`;

    const statusSummary = `• Tuổi: ${character.stats.age} tuổi ${character.stats.month} tháng | Vị trí: ${character.stats.location}
• Khu Vực Săn: ${ecosystem.zoneName}
• Mệt Mỏi (Fatigue): ${character.stats.fatigue || 0}% | Tiền tệ: ${character.stats.asuraCoins || 0} Xu Asura
• Mana: ${character.stats.manaCurrent}/${character.stats.manaMax} | HP: ${character.stats.healthCurrent}/${character.stats.healthMax}`;

    const choices: TurnChoice[] = [
      {
        id: 'hunt_common',
        label: '1. [Đi săn quái phổ thông] - Quái Sơ/Trung cấp, an toàn, thu thịt & tiền thưởng',
        actionText: 'Tiến vào bìa rừng, săn lùng các ma vật phổ thông cấp Sơ/Trung để kiếm nguyên liệu và tiền thưởng an toàn.',
        riskLevel: 'safe',
        category: 'hunt',
      },
      {
        id: 'hunt_dangerous',
        label: '2. [Truy vết Ma thú nguy hiểm] - Quái Thượng/Thánh cấp, rủi ro cao, rơi Lõi Mana',
        actionText: 'Lần theo dấu chân lớn và vết tích rách nát trên thân cây để săn lùng Ma thú nguy hiểm cấp Thượng/Thánh, săn Lõi Mana quý.',
        riskLevel: 'dangerous',
        category: 'hunt',
      },
      {
        id: 'hunt_sparring',
        label: '3. [Thách đấu / Luyện tập] - Giao đấu với Kiếm sĩ/Pháp sư địa phương tích lũy exp',
        actionText: 'Tìm kiếm một Kiếm sĩ hoặc Pháp sư địa phương để xin giao đấu tỷ thí nâng cao kinh nghiệm thực chiến.',
        riskLevel: 'safe',
        category: 'hunt',
      },
      {
        id: 'hunt_retreat',
        label: '4. [Rút lui / Quay lại Thị trấn] - Tạm thời quay về nghỉ ngơi hồi phục',
        actionText: 'Rút lui khỏi khu vực săn bắn, quay trở lại làng hoặc thị trấn để nghỉ ngơi hồi phục thể lực.',
        riskLevel: 'safe',
        category: 'rest',
      },
    ];

    return {
      narration,
      statusSummary,
      systemNotes: [
        `Đã kích hoạt [MỤC CHIẾN ĐẤU] tại: ${ecosystem.zoneName}.`,
        'Hãy lựa chọn cấp độ săn phù hợp với thể trạng để tránh bị kiệt sức!',
      ],
      choices,
      updatedCharacter: character,
      isGameOver: false,
    };
  }

  // ==========================================
  // COMBAT ENGINE LOGIC (3-PHASE COMBAT FLOW)
  // RULE 1: ĐIỀU HƯỚNG TẬP TRUNG VÀO [MỤC CHIẾN ĐẤU]
  // ==========================================
  const isInitiatingCombat = 
    !character.combat?.inCombat && 
    (actionLower.includes('săn') || actionLower.includes('chiến đấu') || actionLower.includes('ma vật') || 
     actionLower.includes('quái vật') || actionLower.includes('thực chiến') || actionLower.includes('tập kích') ||
     actionLower.includes('khiêu chiến') || actionLower.includes('sói') || actionLower.includes('đi săn quái phổ thông') ||
     actionLower.includes('truy vết ma thú') || actionLower.includes('thách đấu') ||
     actionLower.includes('tấn công') || actionLower.includes('giao chiến') || actionLower.includes('giao tranh') ||
     actionLower.includes('chém') || actionLower.includes('đánh nhau') || actionLower.includes('tiêu diệt') ||
     actionLower.includes('hạ gục') || actionLower.includes('nghênh chiến') || actionLower.includes('vào trận') ||
     actionLower.includes('rút kiếm') || actionLower.includes('phản kháng') || actionLower.includes('đối đầu') ||
     actionLower.includes('kẻ bắt cóc') || actionLower.includes('orsted') || actionLower.includes('hydra') ||
     actionLower.includes('badigadi') || actionLower.includes('bảo vệ eris'));

  if (isInitiatingCombat) {
    const ecosystem = getEcosystemForLocation(character.stats.location);
    let opp: Opponent;

    if (actionLower.includes('orsted') || actionLower.includes('long thần')) {
      opp = {
        id: 'story_orsted',
        name: 'Long Thần Orsted (Thất Đại Liệt Cường Đệ Nhị)',
        title: 'Thực thể tối cao mang lời nguyền căm ghét',
        type: 'god_entity',
        powerTier: 'Thần cấp (God)',
        swordStyle: 'Kiếm Thần phái',
        hpCurrent: 9999,
        hpMax: 9999,
        touki: 500,
        mana: 9999,
        status: 'Đứng sừng sững, Đấu Khí vô hình bao bọc cơ thể tán vụn mọi đòn tấn công',
        distance: 'Tầm trung (5-10m)',
        description: 'Mái tóc bạc phơ, ánh mắt sắc như lưỡi dao rồng, sát khí vô tận bóp nghẹt không gian.',
        rewardCoins: 5000,
        lootItem: 'Bảo thạch Long Tộc Cổ Đại',
      };
    } else if (actionLower.includes('hydra') || actionLower.includes('mãng xà')) {
      opp = {
        id: 'story_hydra',
        name: 'Mãng Xà Manatite 6 Đầu (Begaritt Hydra)',
        title: 'Chúa tể Tầng 60 Mê Cung Begaritt',
        type: 'monster',
        powerTier: 'Vương cấp (King)',
        swordStyle: 'Hoang dã',
        hpCurrent: 800,
        hpMax: 800,
        touki: 120,
        mana: 300,
        status: '6 chiếc đầu rắn gầm thét, vảy Ma Tinh thạch hấp thụ toàn bộ ma pháp tầm xa',
        distance: 'Tầm trung (5-10m)',
        description: 'Lớp vảy ngọc đỏ lân tinh nuốt chửng ma lực, cổ rách có thể tự tái tạo nếu không dùng lửa đốt!',
        rewardCoins: 1200,
        lootItem: 'Mảnh Vảy Ma Tinh Manatite Tinh Khiết',
      };
    } else if (actionLower.includes('badigadi')) {
      opp = {
        id: 'story_badigadi',
        name: 'Ma Vương Bất Tử Badigadi',
        title: 'Vua của Bộ tộc Bất Tử Lục địa Ma',
        type: 'hybrid',
        powerTier: 'Vương cấp (King)',
        swordStyle: 'Hoang dã',
        hpCurrent: 500,
        hpMax: 500,
        touki: 150,
        mana: 200,
        status: 'Cười vang trời, 6 cánh tay khoanh trước ngực chờ bạn tung đòn',
        distance: 'Cận chiến (0-2m)',
        description: 'Làn da đen như than gỗ, cơ thể bất tử hồi phục tức thì nếu không bị thổi bay thành tro bụi.',
        rewardCoins: 600,
        lootItem: 'Hắc Ma Tinh Huyết',
      };
    } else if (actionLower.includes('bắt cóc') || actionLower.includes('kẻ cướp') || actionLower.includes('bảo vệ eris')) {
      opp = {
        id: 'story_kidnapper',
        name: 'Kẻ Bắt Cóc Quý Tộc Roa (Bắc Thần Kiếm Sĩ)',
        title: 'Lính đánh thuê tàn bạo của đảng phản nghịch',
        type: 'swordsman',
        powerTier: 'Thượng cấp (Advanced)',
        swordStyle: 'Bắc Thần phái',
        hpCurrent: 120,
        hpMax: 120,
        touki: 45,
        mana: 20,
        status: 'Cười khẩy khinh bỉ, tay lăm lăm đoản đao tẩm độc và cát bụi mù',
        distance: 'Tầm trung (5-10m)',
        description: 'Bộ dạng hung hãn, bộ pháp Bắc Thần phái biến ảo, sẵn sàng giết người diệt khẩu.',
        rewardCoins: 150,
        lootItem: 'Đoản Đao Tẩm Độc & Túi Cát Bắc Thần',
      };
    } else if (actionLower.includes('nguy hiểm') || actionLower.includes('thượng') || actionLower.includes('thánh')) {
      const hardM = ecosystem.hardMonsters[Math.floor(Math.random() * ecosystem.hardMonsters.length)];
      opp = {
        id: `hunt_hard_${Date.now()}`,
        name: hardM.name,
        title: hardM.desc,
        type: 'monster',
        powerTier: hardM.tier,
        swordStyle: 'Hoang dã',
        hpCurrent: 160,
        hpMax: 160,
        touki: 60,
        mana: 80,
        status: 'Khát máu, sát khí áp đảo',
        distance: 'Tầm trung (5-10m)',
        description: hardM.desc,
        rewardCoins: hardM.rewardCoins,
        lootItem: hardM.loot,
      };
    } else if (actionLower.includes('thách đấu') || actionLower.includes('luyện tập') || actionLower.includes('tỷ thí')) {
      opp = {
        id: `hunt_spar_${Date.now()}`,
        name: 'Kiếm Sĩ Tập Sự Làng Fittoa',
        title: 'Bạn đồng môn luyện kiếm gỗ',
        type: 'swordsman',
        powerTier: character.stats.age <= 5 ? 'Sơ cấp (Beginner)' : 'Trung cấp (Intermediate)',
        swordStyle: 'Kiếm Thần phái',
        hpCurrent: 60,
        hpMax: 60,
        touki: 18,
        mana: 10,
        status: 'Nhiệt huyết, giơ kiếm gỗ kính cẩn',
        distance: 'Tầm trung (5-10m)',
        description: 'Kiếm sĩ trẻ tuổi mong muốn cọ xát kiếm thuật giao lưu.',
        rewardCoins: 20,
        lootItem: 'Bó Rơm Luyện Kiếm & Dải Băng Cổ Tay',
      };
    } else {
      const m = Math.random() > 0.5 ? ecosystem.easyMonsters[0] : (ecosystem.mediumMonsters[0] || ecosystem.easyMonsters[0]);
      opp = {
        id: `hunt_common_${Date.now()}`,
        name: m.name,
        title: m.desc,
        type: 'monster',
        powerTier: m.tier,
        swordStyle: 'Hoang dã',
        hpCurrent: m.tier === 'Trung cấp (Intermediate)' ? 75 : 40,
        hpMax: m.tier === 'Trung cấp (Intermediate)' ? 75 : 40,
        touki: m.tier === 'Trung cấp (Intermediate)' ? 25 : 10,
        mana: 20,
        status: 'Khỏe mạnh, gầm gừ giương vuốt',
        distance: 'Tầm trung (5-10m)',
        description: m.desc,
        rewardCoins: m.rewardCoins,
        lootItem: m.loot,
      };
    }

    // Fatigue accumulation
    character.stats.fatigue = Math.min(100, (character.stats.fatigue || 0) + 15);
    if (character.stats.fatigue >= 80) {
      systemNotes.push('CẢNH BÁO: Mức độ mệt mỏi đã vượt quá 80%! Bạn đang chiến đấu trong tình trạng suy kiệt!');
      if (!character.statusEffects.includes('Mệt Mỏi (Fatigue)')) {
        character.statusEffects.push('Mệt Mỏi (Fatigue)');
      }
    }

    // Initialize opponent psychology & agility
    opp.agility = opp.agility || (TIER_RANK_MAP[opp.powerTier] * 18 + 15);
    if (!opp.personality) {
      const oppName = (opp?.name || '').toLowerCase();
      if (opp.type === 'monster' || (opp?.id || '').includes('wolf') || (opp?.id || '').includes('beast')) {
        opp.personality = 'bloodthirsty';
      } else if (oppName.includes('đạo tặc') || oppName.includes('cướp')) {
        opp.personality = Math.random() > 0.5 ? 'cunning' : 'coward';
      } else {
        opp.personality = 'bloodthirsty';
      }
    }

    const combatState: CombatState = {
      inCombat: true,
      phase: 1,
      phaseName: 'Giai đoạn 1: Thăm dò & Nhịp độ',
      opponent: opp,
      turnInCombat: 1,
      playerAdvantage: 0,
      terrain: ecosystem.zoneName,
      escapeChancePercent: calculateEscapeChance(character, opp),
    };
    character.combat = combatState;

    // Đánh giá Biệt danh và Uy áp tinh thần lên đối thủ
    const repResult = evaluateTurnReputationAndEpithet(character, safeActionText, choice, true, opp, false);
    if (repResult.announcement) systemNotes.push(repResult.announcement);

    if (repResult.fearMoraleDebuff?.debuffApplied) {
      systemNotes.push(repResult.fearMoraleDebuff.narrative);
      if (repResult.fearMoraleDebuff.enemyFled) {
        character.combat = undefined;
        const repSummary = formatReputationSummary(character);
        const equipSummary = formatEquipmentSummary(character.equipment);
        return {
          narration: `[KẺ ĐỊCH BỎ CHẠY TRƯỚC BIỆT DANH CỦA BẠN!]
${repResult.fearMoraleDebuff.narrative}

Đối thủ ${opp.name} vừa trông thấy diện mạo và nhận diện được danh xưng chấn động "${character.reputation?.currentEpithet}" của bạn! 
Toàn thân nó run rẩy không kiểm soát, ý chí chiến đấu sụp đổ. Không dám mạo hiểm sinh mạng, ${opp.name} hoảng hốt tháo lui thục mạng vào bóng tối rừng rậm!
Chiến thắng thuộc về bạn ngay từ Giai đoạn 1 nhờ uy danh vang dội khắp bốn phương!`,
          statusSummary: `• Tuổi: ${character.stats.age} tuổi ${character.stats.month} tháng | Vị trí: ${character.stats.location}\n• Kết Quả: Đối thủ bỏ chạy trước uy danh của bạn\n\n${repSummary}\n\n${equipSummary}`,
          equipmentSummaryText: equipSummary,
          reputationSummaryText: repSummary,
          systemNotes,
          choices: generateSandboxChoices(character, turnNumber),
          updatedCharacter: character,
          isGameOver: false,
        };
      }
    }

    const narration = `[GIAI ĐOẠN 1: THĂM DÒ & NHỊP ĐỘ (PACING)]
Tiếng xào xạc bất chợt vang lên từ phía trước. Mùi tanh nồng của dã thú và nồng độ Mana dao động dữ dội báo hiệu mục tiêu đi săn đã xuất hiện!

Từ sau địa hình **${ecosystem.zoneName}**, **${opp.name}** (${opp.title} - ${opp.powerTier}) lừng lững lộ diện. 
Hai bên đang ở cự ly **${opp.distance}**. 
${opp.name} hạ thấp trọng tâm, ánh mắt khóa chặt lấy từng cử động của bạn. Luồng Đấu Khí và sinh lực của nó cuộn trào rít lên từng đợt áp lực.${repResult.fearMoraleDebuff?.debuffApplied ? `\n\n${repResult.fearMoraleDebuff.narrative}` : ''}
Địa hình xung quanh với nhiều chướng ngại vật tự nhiên — cơ hội hoàn hảo để triển khai Ma pháp thao túng môi trường hoặc chọn góc xuất kiếm tối ưu!`;

    const combatHudText = `---
[ TRẠNG THÁI CHIẾN ĐẤU ]
- Người chơi: HP ${character.stats.healthCurrent}/${character.stats.healthMax} | MP ${character.stats.manaCurrent}/${character.stats.manaMax} | Đấu khí/Sức bền: ${Math.round((character.stats.staminaCurrent / character.stats.staminaMax) * 100)}%
- Biệt danh: "${character.reputation?.currentEpithet}" (Uy áp: ${character.reputation?.fearFactor}/100)
- Đối thủ: ${opp.name} | Cấp độ dự đoán: [${opp.powerTier}]
- Tình trạng đối thủ: [${opp.status}]
- Khoảng cách: [${opp.distance}]
---`;

    const repSummary = formatReputationSummary(character);
    const equipSummary = formatEquipmentSummary(character.equipment);
    const statusSummary = `• Tuổi: ${character.stats.age} tuổi ${character.stats.month} tháng | Vị trí: ${character.stats.location}
• Cảnh báo Giao Tranh: Đang đối đầu với [${opp.name}] (${opp.powerTier})
${combatHudText}

${repSummary}`;

    systemNotes.push(`Giao tranh kích hoạt: Bước vào [Giai đoạn 1: Thăm dò & Nhịp độ]!`);
    systemNotes.push(`Khoảng cách hiện tại: ${opp.distance}. Chỉ những kỹ năng bạn ĐÃ HỌC và VẬT PHẨM ĐANG SỞ HỮU mới xuất hiện!`);

    const choices: TurnChoice[] = generatePhase1Choices(character, opp);

    return {
      narration,
      statusSummary,
      combatHudText,
      equipmentSummaryText: equipSummary,
      reputationSummaryText: repSummary,
      systemNotes,
      choices,
      updatedCharacter: character,
      isGameOver: false,
    };
  }

  // If already in combat, advance phases!
  if (character.combat?.inCombat) {
    const combat = character.combat;
    const opp = combat.opponent;
    const castMode = actionLower.includes('xướng ngôn') ? 'chanting' : (actionLower.includes('kiếm') ? 'sword' : 'chantless');

    // Perform hidden stat check
    const check = performCombatCheck(character, opp, actionText, castMode);

    if (check.isFatal) {
      character.isDead = true;
      character.deathReason = check.fatalReason;
      return {
        narration: `[TỬ VONG TRONG GIAO TRANH]
${check.fatalReason}
Máu tươi nhuộm đỏ mặt cỏ. Cơ thể bạn ngã quỵ trước khi kịp nhận ra nhát chém đã lấy đi sinh mạng của mình. Thế giới này không tha thứ cho sự sai lầm về khoảng cách!`,
        statusSummary: `• Trạng thái: Đã tử vong (0 HP)\n• Nguyên nhân: Sai lầm chiến thuật chết người trong giao tranh`,
        systemNotes: ['Bạn đã tử vong do sai lầm nghiêm trọng trong giao tranh!'],
        choices: [],
        updatedCharacter: character,
        isGameOver: true,
        deathReason: check.fatalReason,
      };
    }

    if (combat.phase === 1) {
      // =========================================================================
      // GIAI ĐOẠN 1: THĂM DÒ & NHỊP ĐỘ (XỬ LÝ ĐÀO TẨU HOẶC TIẾN VÀO P2)
      // =========================================================================
      const isP1Flee = actionLower.includes('bỏ chạy') || actionLower.includes('đào tẩu') || actionLower.includes('tháo chạy');
      if (isP1Flee) {
        const fleeRes = resolveCombatFlee(character, opp, actionText);
        systemNotes.push(...fleeRes.systemNotes);
        if (fleeRes.isSuccess) {
          const choices: TurnChoice[] = [
            {
              id: 'ret_heal',
              label: 'Ngồi xuống thi triển Ma pháp Trị liệu băng bó vết thương',
              actionText: 'Tập trung Mana chữa lành các vết trầy xước và vết rách cơ bắp sau khi thoát nạn.',
              riskLevel: 'safe',
              category: 'magic',
            },
            {
              id: 'ret_rest',
              label: 'Tìm chỗ kín đáo nghỉ ngơi phục hồi thể lực và Mana',
              actionText: 'Tìm một hốc đá an toàn, ngồi thiền định lấy lại hơi thở và kiểm soát Mana.',
              riskLevel: 'safe',
              category: 'rest',
            },
            {
              id: 'ret_inventory',
              label: 'Kiểm tra lại trang bị và dược thảo còn lại trong túi',
              actionText: '!inventory',
              riskLevel: 'safe',
              category: 'explore',
            },
          ];

          return {
            narration: fleeRes.narration,
            statusSummary: `• Tuổi: ${character.stats.age} tuổi ${character.stats.month} tháng | Vị trí: ${character.stats.location}\n• Trạng thái: Đã thoát khỏi giao tranh an toàn\n• HP: ${character.stats.healthCurrent}/${character.stats.healthMax} | Mana: ${character.stats.manaCurrent}/${character.stats.manaMax}`,
            systemNotes,
            choices,
            updatedCharacter: character,
            isGameOver: false,
          };
        }
      }

      combat.phase = 2;
      combat.phaseName = 'Giai đoạn 2: Va chạm & Bức áp';
      combat.turnInCombat = 2;

      const isP1Healing = 
        actionLower.includes('hồi phục') ||
        actionLower.includes('trị liệu') ||
        actionLower.includes('dược thảo') ||
        actionLower.includes('cầm máu') ||
        actionLower.includes('băng bó') ||
        actionLower.includes('sơ cứu') ||
        actionLower.includes('thảo mộc');

      const isP1Defense = !isP1Healing && (
        actionLower.includes('thế thủ tuyệt đối') ||
        actionLower.includes('thủy thần phái') ||
        actionLower.includes('dựng khiên') ||
        actionLower.includes('chặn đòn') ||
        actionLower.includes('hóa kình') ||
        actionLower.includes('kết giới') ||
        actionLower.includes('né đòn') ||
        actionLower.includes('né tránh') ||
        actionLower.includes('phòng thủ')
      );

      const isP1Buff = !isP1Healing && !isP1Defense && (
        actionLower.includes('cường hóa') ||
        actionLower.includes('bộc phát đấu khí') ||
        actionLower.includes('thể thuật thú') ||
        actionLower.includes('dự tri nhãn') ||
        actionLower.includes('ma lực nhãn') ||
        actionLower.includes('định tâm vận khí')
      );

      const isProbing = !isP1Healing && !isP1Defense && !isP1Buff && (
        actionLower.includes('quan sát') || 
        actionLower.includes('thăm dò') || 
        actionLower.includes('p1_observe')
      );

      let clashDesc = '';

      if (isP1Healing) {
        // Nhóm Hồi Phục: Không gây sát thương lên địch, khép vết thương & hồi HP
        const healRes = resolveHealingAction(character, opp, actionText);
        systemNotes.push(...healRes.systemNotes);
        opp.distance = 'Cận chiến (0-2m)';
        opp.status = 'Đang lao tới bức áp, chuẩn bị tung đòn va chạm';
        clashDesc = `${healRes.narration}\nĐúng lúc bạn vừa ổn định vết thương và phục hồi thể trạng, ${opp.name} gầm thét xé toang khoảng cách lao thẳng tới cự ly cận chiến!`;
      } else if (isP1Defense) {
        // Nhóm Phòng Thủ: Chặn đòn/Dựng thế thủ, không làm địch mất máu, tạo lợi thế phản kích
        const defRes = resolveDefenseAction(character, opp, actionText);
        systemNotes.push(...defRes.systemNotes);
        opp.distance = 'Cận chiến (0-2m)';
        opp.status = 'Vừa va chạm vào thế thủ vững chãi, bị khựng đà lộ sơ hở';
        clashDesc = `${defRes.narration}\nThế thủ chuẩn mực của bạn đã hóa giải hoàn toàn đợt phủ đầu của đối thủ mà không hề hấn gì. Đối phương gầm gừ thu móng thủ thế cận chiến!`;
      } else if (isP1Buff) {
        // Nhóm Cường Hóa: Tăng Đấu khí/Phản xạ, không gây sát thương tức thì
        const buffRes = resolveBuffAction(character, opp, actionText);
        systemNotes.push(...buffRes.systemNotes);
        opp.distance = 'Cận chiến (0-2m)';
        opp.status = 'Bị luồng khí thế cường hóa chèn ép, khựng lại dò xét';
        clashDesc = `${buffRes.narration}\nLuồng khí thế cuồn cuộn phát ra từ cơ thể bạn khiến ${opp.name} phải ghìm chân dè chừng, hai bên chính thức bước vào cự ly áp sát!`;
      } else if (isProbing) {
        // Thăm dò & Quan sát: Không tổn thương HP, tăng lợi thế đọc vị
        combat.playerAdvantage = 25;
        opp.distance = 'Cận chiến (0-2m)';
        opp.status = 'Đang bức áp tiếp cận, nhịp thở và thế thủ đã bị bạn đọc thấu';
        character.stats.staminaCurrent = Math.max(5, character.stats.staminaCurrent - 5);
        clashDesc = `Bạn giữ khoảng cách cẩn trọng, giương mắt quan sát từng gợn sóng Mana và nhịp thở của ${opp.name}. 
Nhờ kinh nghiệm và sự tập trung cao độ, bạn nhìn thấu điểm tựa trọng tâm, góc khuất và sơ hở khi lao tới của đối phương, tạo lợi thế lớn cho giai đoạn giao chiến tiếp theo!`;
        systemNotes.push('★ THĂM DÒ THÀNH CÔNG: Đã đọc thấu nhịp thở và hướng tấn công của đối thủ (+25 Lợi thế chiến thuật)!');
      } else {
        // Nhóm Tấn Công: Nhóm duy nhất gây sát thương, phá vỡ Đấu khí và trừ Sinh lực địch
        const damageToOpponent = check.calculatedDamageOpponent;
        const damageToPlayer = check.calculatedDamagePlayer;

        opp.hpCurrent = Math.max(15, opp.hpCurrent - damageToOpponent);
        character.stats.healthCurrent = Math.max(5, character.stats.healthCurrent - damageToPlayer);
        character.stats.staminaCurrent = Math.max(5, character.stats.staminaCurrent - 15);
        character.stats.manaCurrent = Math.max(2, character.stats.manaCurrent - (castMode === 'sword' ? 5 : 20));

        if (actionLower.includes('đầm lầy') || actionLower.includes('quagmire')) {
          opp.distance = 'Tầm trung (5-10m)';
          opp.status = 'Bị sụt chân xuống bùn lầy, mất thăng bằng';
          systemNotes.push('★ Ma pháp Đầm lầy Quagmire phát huy hiệu quả: Kìm chân đối thủ ở cự ly an toàn!');
          clashDesc = `Đúng khoảnh khắc ${opp.name} đạp mạnh chân phi thân tới, bạn chĩa hai lòng bàn tay xuống đất, vận dụng Vô niệm chú hòa tan kết cấu đất đá thành bãi bùn lỏng quánh!
"Ầm!" Hai chân trước của đối phương lún sâu xuống đầm lầy ngập tới khớp gối. Đà lao cực mạnh bị triệt tiêu đột ngột khiến nó dúi dụi về phía trước, gầm thét dữ dội. Lợi dụng thời cơ, bạn bắn ra hàng loạt mũi tên đá găm thủng vai nó, máu ma vật bắn tung tóe lên mặt cỏ!`;
        } else if (actionLower.includes('kiếm thần') || actionLower.includes('rush') || actionLower.includes('kiếm')) {
          opp.distance = 'Cận chiến (0-2m)';
          opp.status = 'Vừa va chạm trực diện, kiếm và vuốt tóe lửa';
          clashDesc = `Kenggg! Âm thanh kim loại và móng vuốt va đập chát chúa vang dội cả cánh rừng. Lực phản chấn cực mạnh chạy dọc sống kiếm làm tê dại hai cánh tay bạn. 
Lưỡi kiếm của bạn sứt mẻ một vết răng cưa nhỏ, quần áo bị luồng Đấu Khí xé rách một mảng vai rớm máu. Nhưng đòn chém chuẩn xác của bạn cũng đã rạch một đường dài trên ngực ${opp.name}, khiến đối phương thở dốc hồng hộc, mắt vằn tia máu!`;
        } else {
          opp.distance = 'Cận chiến (0-2m)';
          opp.status = 'Đang bức áp cận chiến cuồng nộ';
          clashDesc = `Ngọn lửa ma thuật bùng phát chói lòa trong không gian! Luồng nhiệt cực lớn thiêu rụi lớp lông giáp của ${opp.name}, mùi khét lẹt bốc lên nồng nặc. 
Tuy nhiên, sức chịu đựng phi thường của ma vật giúp nó chịu đòn và lao thẳng tới, một cú vung móng sượt qua mạn sườn bạn làm rách áo và để lại ba vết cào rỉ máu. Cả hai đều thở dốc trong bầu không khí đặc quánh khói bụi!`;
        }

        if (check.stanceNote) {
          systemNotes.push(check.stanceNote);
        }
        if (!check.isArmorPenetrated) {
          systemNotes.push('Lớp Đấu Khí đối thủ quá dày! Đòn đánh chỉ làm nứt giáp ngoài, chưa đả thương cốt tủy.');
        }
      }

      const escapeRate = calculateEscapeChance(character, opp, actionLower.includes('đầm lầy') || actionLower.includes('quagmire'));
      combat.escapeChancePercent = escapeRate;

      const narration = `[GIAI ĐOẠN 2: VA CHẠM & BỨC ÁP (CLASH & TENSION)]
${clashDesc}

Mặt đất xung quanh bị cày xới tan hoang, bụi đất mù mịt hòa lẫn tia lửa ma thuật chưa tan. 
${opp.name} (${opp.hpCurrent}/${opp.hpMax} HP). Khoảng cách hiện tại là **${opp.distance}**. 
Thể lực bạn: ${character.stats.staminaCurrent}/${character.stats.staminaMax} | Mana: ${character.stats.manaCurrent}/${character.stats.manaMax} | HP: ${character.stats.healthCurrent}/${character.stats.healthMax}.

Toàn bộ 5 nhóm hành động giao tranh đã sẵn sàng và được phân định nghiêm ngặt:
• [💖 NHÓM HỒI PHỤC & TRỊ LIỆU] - Khép vết thương, cầm máu, hồi Sinh lực (+HP)
• [🛡️ NHÓM PHÒNG THỦ] - Chặn đòn, dựng khiên, bọc Đấu Khí, né tránh
• [⚡ NHÓM CƯỜNG HÓA & HỖ TRỢ] - Bộc phát Đấu Khí, Thể thuật thú tộc, Ma nhãn
• [⚔️ NHÓM TẤN CÔNG] - Triển khai các kỹ năng ma pháp/kiếm thuật đã học để trừ HP địch
• [🏃 NHÓM BỎ CHẠY] - Đào tẩu khẩn cấp (Tỷ lệ thoát: ${escapeRate}%)`;

      const combatHudText = `---
[ TRẠNG THÁI CHIẾN ĐẤU ]
- Người chơi: HP ${character.stats.healthCurrent}/${character.stats.healthMax} | MP ${character.stats.manaCurrent}/${character.stats.manaMax} | Đấu khí/Sức bền: ${Math.round((character.stats.staminaCurrent / character.stats.staminaMax) * 100)}%
- Đối thủ: ${opp.name} | Cấp độ dự đoán: [${opp.powerTier}]
- Tình trạng đối thủ: [${opp.status}]
- Khoảng cách: [${opp.distance}]
- Tỷ lệ đào tẩu dự đoán: ${escapeRate}%
---`;

      const statusSummary = `• Tuổi: ${character.stats.age} tuổi ${character.stats.month} tháng | Vị trí: ${character.stats.location}
${combatHudText}`;

      // Dynamic Phase 2 Choices filtered strictly by player learned arsenal
      const choices: TurnChoice[] = generatePhase2Choices(character, opp, 'all');

      return {
        narration,
        statusSummary,
        combatHudText,
        systemNotes,
        choices,
        updatedCharacter: character,
        isGameOver: false,
      };
    } else if (combat.phase === 2) {
      // =========================================================================
      // GIAI ĐOẠN 2: CHUẨN HÓA VAI TRÒ VÀ THỰC THI 5 NHÓM HÀNH ĐỘNG
      // =========================================================================

      // A. KIỂM TRA ĐIỀU HƯỚNG MENU CẤP CON (SUB-MENU NAVIGATION)
      const isSelectingOffenseMain = 
        actionLower === 'mục a: tấn công' ||
        actionLower === 'mục a' ||
        actionLower === 'tấn công' ||
        actionLower === '!p2_offense' ||
        actionLower.includes('chọn mục a') ||
        (actionLower.startsWith('[mục a: tấn công]') && !actionLower.includes('mp') && !actionLower.includes('thể lực'));

      if (isSelectingOffenseMain) {
        const narration = `[GIAI ĐOẠN 2: CHIẾN THUẬT TẤN CÔNG (OFFENSIVE SUB-MENU)]
Bạn hạ thấp trọng tâm, khóa chặt ánh mắt vào từng chuyển động của ${opp.name}. 
Cơ thể bạn tích tụ năng lượng, sẵn sàng giải phóng đòn công kích quyết định!

Hệ thống mở ra 3 nhánh hành động cụ thể để bạn lựa chọn:
1) [Skills Tấn Công (Kỹ năng đã học)] - Triển khai các phép ma thuật hoặc tuyệt kỹ kiếm thuật đã học.
2) [Đòn Đánh Thường / Thế Đánh Cơ Bản] - Đòn chém kiếm sắt, đấm đá triệt tiêu hạ bàn cơ bản.
3) [Hành Động Tùy Ý / Biến Tấu Chiến Thuật] - Tự do nhập cách thức phối hợp chiến thuật sáng tạo.`;

        const combatHudText = `---
[ TRẠNG THÁI CHIẾN ĐẤU - GIAI ĐOẠN 2: VA CHẠM ]
- Người chơi: HP ${character.stats.healthCurrent}/${character.stats.healthMax} | MP ${character.stats.manaCurrent}/${character.stats.manaMax} | Thể lực: ${character.stats.staminaCurrent}/${character.stats.staminaMax}
- Đối thủ: ${opp.name} (${opp.hpCurrent}/${opp.hpMax} HP) | Cấp độ: [${opp.powerTier}]
- Tình trạng: [${opp.status}]
- Khoảng cách: [${opp.distance}]
---`;

        const choices: TurnChoice[] = [
          ...getP2OffensiveMenuChoices(character, opp),
          ...generatePhase2Choices(character, opp, 'offense', 'skills')
        ];

        return {
          narration,
          statusSummary: `• Tuổi: ${character.stats.age} tuổi ${character.stats.month} tháng | Vị trí: ${character.stats.location}\n${combatHudText}`,
          combatHudText,
          systemNotes: ['Bạn đang ở Menu Cấp Con Mục A: Chọn kỹ năng đã học, đòn thường hoặc biến tấu chiến thuật.'],
          choices,
          updatedCharacter: character,
          isGameOver: false,
        };
      }

      const isOpeningSkillsRepo = 
        actionLower.includes('!p2_skills') ||
        actionLower.includes('skills tấn công') ||
        actionLower.includes('kỹ năng đã học') ||
        actionLower.includes('kho kỹ năng');

      if (isOpeningSkillsRepo) {
        const skillRepo = getOffensiveSkillRepository(character, opp);
        const narration = `[GIAI ĐOẠN 2: KHO KỸ NĂNG TÁC CHIẾN (OFFENSIVE REPOSITORY)]
Toàn bộ kho kỹ năng tấn công bạn ĐÃ HỌC và ĐÃ MỞ KHÓA được đồng bộ sẵn sàng thi triển:
• Danh Mục Ma Pháp Tấn Công: Liệt kê các chiêu thức theo hệ kèm cấp bậc và mức Mana tiêu hao.
• Danh Mục Kiếm Pháp Tấn Công: Liệt kê chiêu thức thuộc 3 phái kiếm kèm Thể lực/Đấu Khí tiêu hao.
• Danh Mục Kỹ Năng Kết Hợp / Tự Chế: Các tuyệt chiêu ma kiếm hoặc ma pháp ghép đa hệ.

Hãy chọn một chiêu thức cụ thể dưới đây để xuất chiêu:`;

        const combatHudText = `---
[ TRẠNG THÁI CHIẾN ĐẤU - KHO KỸ NĂNG TẤN CÔNG ]
- Người chơi: HP ${character.stats.healthCurrent}/${character.stats.healthMax} | MP ${character.stats.manaCurrent}/${character.stats.manaMax} | Thể lực: ${character.stats.staminaCurrent}/${character.stats.staminaMax}
- Đối thủ: ${opp.name} (${opp.hpCurrent}/${opp.hpMax} HP)
- Khoảng cách: [${opp.distance}]
---`;

        const choices: TurnChoice[] = [
          ...skillRepo,
          {
            id: 'p2_back_to_basic',
            label: '2) [Đòn Đánh Thường]: Chuyển sang các thế đánh thường cơ bản',
            actionText: '!p2_basic',
            riskLevel: 'safe',
            category: 'combat',
            combatBranch: 'A_OFFENSE',
            combatRole: 'menu',
            combatSubCategory: '2. Đòn Đánh Thường',
            offensiveSubCategory: 'basic',
          }
        ];

        return {
          narration,
          statusSummary: `• Tuổi: ${character.stats.age} tuổi ${character.stats.month} tháng | Vị trí: ${character.stats.location}\n${combatHudText}`,
          combatHudText,
          systemNotes: [`Đã tải ${skillRepo.length} kỹ năng tấn công đã học từ kho kỹ năng tác chiến.`],
          choices,
          updatedCharacter: character,
          isGameOver: false,
        };
      }

      const isOpeningBasicAttacks = 
        actionLower.includes('!p2_basic') ||
        (actionLower.includes('đòn đánh thường') && !actionLower.includes('chém thẳng') && !actionLower.includes('đá hạ bàn') && !actionLower.includes('cán vũ khí'));

      if (isOpeningBasicAttacks) {
        const basicList = getBasicAttacks(character, opp);
        const narration = `[GIAI ĐOẠN 2: THẾ ĐÁNH THƯỜNG CƠ BẢN]
Bạn giữ chắc chuôi vũ khí, điều hòa nhịp thở để tung các đòn đánh cơ bản ít tiêu hao thể lực:
• Vung chém thẳng trực diện
• Cú đấm / đá quét hạ bàn triệt tiêu đà tiến
• Đập chuôi/cán vũ khí hất lùi đối phương

Hãy chọn đòn đánh cơ bản bên dưới:`;

        const combatHudText = `---
[ TRẠNG THÁI CHIẾN ĐẤU - ĐÒN ĐÁNH THƯỜNG ]
- Người chơi: HP ${character.stats.healthCurrent}/${character.stats.healthMax} | MP ${character.stats.manaCurrent}/${character.stats.manaMax} | Thể lực: ${character.stats.staminaCurrent}/${character.stats.staminaMax}
- Đối thủ: ${opp.name} (${opp.hpCurrent}/${opp.hpMax} HP)
---`;

        const choices: TurnChoice[] = [
          ...basicList,
          {
            id: 'p2_back_to_skills',
            label: '1) [Skills Tấn Công]: Mở lại danh mục kỹ năng ma pháp/kiếm thuật',
            actionText: '!p2_skills',
            riskLevel: 'safe',
            category: 'combat',
            combatBranch: 'A_OFFENSE',
            combatRole: 'menu',
            combatSubCategory: '1. Skills Tấn Công',
            offensiveSubCategory: 'skills',
          }
        ];

        return {
          narration,
          statusSummary: `• Tuổi: ${character.stats.age} tuổi ${character.stats.month} tháng | Vị trí: ${character.stats.location}\n${combatHudText}`,
          combatHudText,
          systemNotes: ['Đã mở danh mục các thế đánh thường cơ bản.'],
          choices,
          updatedCharacter: character,
          isGameOver: false,
        };
      }

      // B. PHÂN ĐỊNH VAI TRÒ CHÍNH XÁC CHO HÀNH ĐỘNG THI TRIỂN
      const isHealingAction = 
        actionLower.includes('hồi phục') ||
        actionLower.includes('trị liệu') ||
        actionLower.includes('cứu thương') ||
        actionLower.includes('dược thảo') ||
        actionLower.includes('cầm máu') ||
        actionLower.includes('thảo mộc') ||
        actionLower.includes('băng bó') ||
        actionLower.includes('sơ cứu') ||
        actionLower.includes('nuốt [') ||
        actionLower.includes('cắn dược') ||
        actionLower.includes('thanh tẩy') ||
        actionLower.includes('giải độc') ||
        actionLower.includes('p2_heal');

      const isDefenseAction = !isHealingAction && (
        actionLower.includes('phòng thủ') ||
        actionLower.includes('dựng khiên') ||
        actionLower.includes('chặn đòn') ||
        actionLower.includes('hóa kình') ||
        actionLower.includes('gạt phăng') ||
        actionLower.includes('kết giới') ||
        actionLower.includes('bọc đấu khí') ||
        actionLower.includes('bộ pháp né đòn') ||
        actionLower.includes('né tránh') ||
        actionLower.includes('p2_def')
      );

      const isBuffAction = !isHealingAction && !isDefenseAction && (
        actionLower.includes('cường hóa') ||
        actionLower.includes('bộc phát đấu khí') ||
        actionLower.includes('touki surge') ||
        actionLower.includes('bản năng thú tộc') ||
        actionLower.includes('thể thuật thú') ||
        actionLower.includes('dự tri nhãn') ||
        actionLower.includes('ma lực nhãn') ||
        actionLower.includes('kích hoạt bùa hộ mệnh') ||
        actionLower.includes('định tâm vận khí') ||
        actionLower.includes('p2_buff')
      );

      const isFleeAction = !isHealingAction && !isDefenseAction && !isBuffAction && (
        actionLower.includes('bỏ chạy') || 
        actionLower.includes('đào tẩu') || 
        actionLower.includes('tháo chạy') ||
        actionLower.includes('retreat') || 
        actionLower.includes('flee') ||
        actionLower.includes('p2_c_flee')
      );

      // =========================================================================
      // 1. NHÓM HỒI PHỤC VÀ TRỊ LIỆU: Chỉ khép vết thương, cầm máu, hồi Sinh lực.
      // Tuyệt đối không gây sát thương lên kẻ địch hay bản thân.
      // Cộng trực tiếp lượng hồi phục vào Bảng trạng thái.
      // =========================================================================
      if (isHealingAction) {
        const healRes = resolveHealingAction(character, opp, actionText);
        systemNotes.push(...healRes.systemNotes);

        const combatHudText = `---
[ TRẠNG THÁI CHIẾN ĐẤU - HỒI PHỤC & TRỊ LIỆU ]
- Người chơi: HP ${character.stats.healthCurrent}/${character.stats.healthMax} (+${healRes.hpRestored} HP) | MP ${character.stats.manaCurrent}/${character.stats.manaMax} (-${healRes.mpCost} MP) | Thể lực: ${character.stats.staminaCurrent}/${character.stats.staminaMax} (-${healRes.staminaCost})
- Đối thủ: ${opp.name} (${opp.hpCurrent}/${opp.hpMax} HP - KHÔNG BỊ MẤT MÁU)
- Tình trạng đối thủ: [${opp.status}]
- Khoảng cách: [${opp.distance}]
---`;

        const statusSummary = `• Tuổi: ${character.stats.age} tuổi ${character.stats.month} tháng | Vị trí: ${character.stats.location}\n${combatHudText}`;
        const choices = generatePhase2Choices(character, opp, 'all');

        return {
          narration: healRes.narration,
          statusSummary,
          combatHudText,
          systemNotes,
          choices,
          updatedCharacter: character,
          isGameOver: false,
        };
      }

      // =========================================================================
      // 2. NHÓM PHÒNG THỦ: Chặn đòn, dựng khiên, bọc đấu khí, né tránh.
      // Tuyệt đối không làm kẻ địch mất máu. 
      // Đòn phản công chỉ kích hoạt sau khi đã hóa giải đòn của địch thành công.
      // =========================================================================
      if (isDefenseAction) {
        const defRes = resolveDefenseAction(character, opp, actionText);
        systemNotes.push(...defRes.systemNotes);

        const combatHudText = `---
[ TRẠNG THÁI CHIẾN ĐẤU - PHÒNG THỦ & NÉ ĐÒN ]
- Người chơi: HP ${character.stats.healthCurrent}/${character.stats.healthMax} | MP ${character.stats.manaCurrent}/${character.stats.manaMax} | Thể lực: ${character.stats.staminaCurrent}/${character.stats.staminaMax} (-${defRes.staminaCost})
- Đối thủ: ${opp.name} (${opp.hpCurrent}/${opp.hpMax} HP - KHÔNG BỊ MẤT MÁU)
- Tình trạng đối thủ: [${opp.status}]
- Khoảng cách: [${opp.distance}]
${defRes.parryAdvantageGranted ? '- Hiệu ứng: [LỢI THẾ PHẢN KÍCH: Sẵn sàng tung đòn phản sát ở lượt sau!]' : ''}
---`;

        const statusSummary = `• Tuổi: ${character.stats.age} tuổi ${character.stats.month} tháng | Vị trí: ${character.stats.location}\n${combatHudText}`;
        const choices = generatePhase2Choices(character, opp, 'all');

        return {
          narration: defRes.narration,
          statusSummary,
          combatHudText,
          systemNotes,
          choices,
          updatedCharacter: character,
          isGameOver: false,
        };
      }

      // =========================================================================
      // 3. NHÓM CƯỜNG HÓA VÀ HỖ TRỢ: Tăng tạm thời độ dày Đấu khí, tốc độ phản xạ.
      // Tuyệt đối không gây sát thương tức thì khi kích hoạt.
      // =========================================================================
      if (isBuffAction) {
        const buffRes = resolveBuffAction(character, opp, actionText);
        systemNotes.push(...buffRes.systemNotes);

        const effectiveTouki = character.stats.touki + (character.combat?.activeToukiBonus || 0);
        const combatHudText = `---
[ TRẠNG THÁI CHIẾN ĐẤU - CƯỜNG HÓA & HỖ TRỢ ]
- Người chơi: HP ${character.stats.healthCurrent}/${character.stats.healthMax} | MP ${character.stats.manaCurrent}/${character.stats.manaMax} | Thể lực: ${character.stats.staminaCurrent}/${character.stats.staminaMax}
- Đấu Khí hiệu dụng: ${effectiveTouki} Touki ${character.combat?.activeToukiBonus ? `(+${character.combat.activeToukiBonus} buff)` : ''}
- Đối thủ: ${opp.name} (${opp.hpCurrent}/${opp.hpMax} HP - KHÔNG BỊ MẤT MÁU TỨC THÌ)
- Khoảng cách: [${opp.distance}]
---`;

        const statusSummary = `• Tuổi: ${character.stats.age} tuổi ${character.stats.month} tháng | Vị trí: ${character.stats.location}\n${combatHudText}`;
        const choices = generatePhase2Choices(character, opp, 'all');

        return {
          narration: buffRes.narration,
          statusSummary,
          combatHudText,
          systemNotes,
          choices,
          updatedCharacter: character,
          isGameOver: false,
        };
      }

      // =========================================================================
      // 5. NHÓM BỎ CHẠY: Tính toán khả năng tẩu thoát dựa trên Nhanh nhẹn đôi bên.
      // Tuyệt đối không gây sát thương lên kẻ địch.
      // =========================================================================
      if (isFleeAction) {
        const fleeRes = resolveCombatFlee(character, opp, actionText);
        systemNotes.push(...fleeRes.systemNotes);

        if (fleeRes.isSuccess) {
          const choices: TurnChoice[] = [
            {
              id: 'ret_heal',
              label: 'Ngồi xuống thi triển Ma pháp Trị liệu băng bó vết thương',
              actionText: 'Tập trung Mana chữa lành các vết trầy xước và vết rách cơ bắp sau khi thoát nạn.',
              riskLevel: 'safe',
              category: 'magic',
            },
            {
              id: 'ret_rest',
              label: 'Tìm chỗ kín đáo nghỉ ngơi phục hồi thể lực và Mana',
              actionText: 'Tìm một hốc đá an toàn, ngồi thiền định lấy lại hơi thở và kiểm soát Mana.',
              riskLevel: 'safe',
              category: 'rest',
            },
            {
              id: 'ret_inventory',
              label: 'Kiểm tra lại trang bị và dược thảo còn lại trong túi',
              actionText: '!inventory',
              riskLevel: 'safe',
              category: 'explore',
            },
          ];

          return {
            narration: fleeRes.narration,
            statusSummary: `• Tuổi: ${character.stats.age} tuổi ${character.stats.month} tháng | Vị trí: ${character.stats.location}
• Trạng thái: Đã thoát khỏi giao tranh an toàn
• HP: ${character.stats.healthCurrent}/${character.stats.healthMax} | Mana: ${character.stats.manaCurrent}/${character.stats.manaMax}`,
            systemNotes,
            choices,
            updatedCharacter: character,
            isGameOver: false,
          };
        } else {
          if (character.stats.healthCurrent <= 0) {
            character.isDead = true;
            character.deathReason = `Tử trận khi đào tẩu: Bị [${opp.name}] truy sát từ phía sau tung đòn chí mạng xuyên tim!`;
            return {
              narration: `[TỬ TRẬN KHI ĐÀO TẨU]
${fleeRes.narration}
Cú vồ/nhát chém chí mạng từ sau lưng xé toạc lớp áo giáp và cướp đi sinh mệnh của bạn!`,
              statusSummary: `• Trạng thái: Đã tử vong (0 HP)\n• Nguyên nhân: Đào tẩu thất bại, bị đối thủ truy kích từ sau lưng`,
              systemNotes: ['Bạn đã tử trận do đào tẩu thất bại!'],
              choices: [],
              updatedCharacter: character,
              isGameOver: true,
              deathReason: character.deathReason,
            };
          }

          const combatHudText = `---
[ TRẠNG THÁI CHIẾN ĐẤU - ĐÀO TẨU THẤT BẠI ]
- Người chơi: HP ${character.stats.healthCurrent}/${character.stats.healthMax} (BỊ THƯƠNG!) | MP ${character.stats.manaCurrent}/${character.stats.manaMax}
- Đối thủ: ${opp.name} (${opp.hpCurrent}/${opp.hpMax} HP)
- Khoảng cách: [${opp.distance}]
---`;
          const statusSummary = `• Tuổi: ${character.stats.age} tuổi ${character.stats.month} tháng | Vị trí: ${character.stats.location}\n${combatHudText}`;
          const choices = generatePhase2Choices(character, opp, 'all');

          return {
            narration: fleeRes.narration,
            statusSummary,
            combatHudText,
            systemNotes,
            choices,
            updatedCharacter: character,
            isGameOver: false,
          };
        }
      }

      // =========================================================================
      // 4. NHÓM TẤN CÔNG: Nhóm duy nhất gây sát thương, phá vỡ Đấu khí và trừ HP địch.
      // Cập nhật chuẩn xác từng con số hao hụt Mana, Thể lực, Đấu khí.
      // =========================================================================
      const allOffensiveSkills = [...getOffensiveSkillRepository(character, opp), ...getBasicAttacks(character, opp)];
      const matchingChoice = allOffensiveSkills.find(s => 
        (s.actionText && actionText.includes(s.actionText)) ||
        (s.label && actionText.includes(s.label)) ||
        (s.id && actionText.includes(s.id))
      );
      const collisionRes = resolveCombatCollision(character, opp, actionText, castMode, matchingChoice);

      if (collisionRes.resourcePenaltyNote) {
        systemNotes.push(collisionRes.resourcePenaltyNote);
      }

      // Trừ HP đối thủ (Chỉ nhóm Tấn công mới thực hiện thao tác này)
      opp.hpCurrent = Math.max(0, opp.hpCurrent - collisionRes.damageToOpponent);
      // Trừ HP người chơi do đối phương phản kích (nếu không phải đòn phản sát sau Parry)
      character.stats.healthCurrent = Math.max(0, character.stats.healthCurrent - collisionRes.damageToPlayer);

      systemNotes.push(`💥 [SÁT THƯƠNG KỸ NĂNG]: Gây ${collisionRes.damageToOpponent} Sát thương lên ${opp.name} (còn ${opp.hpCurrent}/${opp.hpMax} HP)${collisionRes.damageToPlayer > 0 ? ` | Bản thân mất -${collisionRes.damageToPlayer} HP` : ' | 0 đòn phản kích'} | MP: -${collisionRes.costMp || 0} | Thể lực: -${collisionRes.costStamina || 0}`);

      // Kiểm tra người chơi tử vong
      if (character.stats.healthCurrent <= 0) {
        character.isDead = true;
        character.deathReason = `Tử trận trong va chạm Giai đoạn 2: Bị [${opp.name}] phản công đoạt mạng!`;
        return {
          narration: `[TỬ VONG TRONG GIAO TRANH]
${collisionRes.clashNarrative}
Cú phản kích mãnh liệt của ${opp.name} vượt quá sức chịu đựng của cơ thể bạn. Đấu Khí sụp đổ, nhát vuốt/đòn đánh xuyên thủng lồng ngực.
Thế giới chìm vào bóng tối vĩnh hằng...`,
          statusSummary: `• Trạng thái: Đã tử vong (0 HP)\n• Nguyên nhân: Thất bại trong đợt va chạm quyết định ở Giai đoạn 2`,
          systemNotes: ['Bạn đã tử vong do thất bại trong va chạm Giai đoạn 2!'],
          choices: [],
          updatedCharacter: character,
          isGameOver: true,
          deathReason: character.deathReason,
        };
      }

      // Kiểm tra kẻ địch gục ngã -> CHUYỂN SANG GIAI ĐOẠN 3 (PHÁN QUYẾT)
      if (collisionRes.isOpponentDefeated || opp.hpCurrent <= 0) {
        combat.phase = 3;
        combat.phaseName = 'Giai đoạn 3: Đoạt mệnh & Đối mặt hậu quả';
        combat.turnInCombat = 3;
        combat.verdictTarget = 'enemy';
        opp.hpCurrent = 0;
        opp.status = 'Đã gục ngã / Đấu khí vỡ vụn / Bất lực';

        const psychology = evaluateEnemyPsychology(opp);
        combat.enemyReaction = psychology.text;
        opp.psychologyStatus = psychology.reactionStatus;

        const narration = `[GIAI ĐOẠN 3: ĐOẠT MỆNH & ĐỐI MẶT HẬU QUẢ (RESOLUTION & FATE)]
${collisionRes.clashNarrative}

Âm thanh xương vỡ và tiếng rống nghẹn ứ vang lên chát chúa! 
Thân hình đồ sộ của ${opp.name} đổ ầm xuống mặt đất, bụi đất tung bay mù mịt. 
Kẻ địch đã hoàn toàn mất khả năng kháng cự (0/${opp.hpMax} HP)!

${psychology.text}

Hãy đưa ra phán quyết của bạn đối với số phận của ${opp.name}:`;

        const combatHudText = `---
[ TRẠNG THÁI CHIẾN ĐẤU - GIAI ĐOẠN 3: PHÁN QUYẾT ]
- Người chơi: HP ${character.stats.healthCurrent}/${character.stats.healthMax} | MP ${character.stats.manaCurrent}/${character.stats.manaMax} | Thể lực: ${character.stats.staminaCurrent}/${character.stats.staminaMax}
- Đối thủ: ${opp.name} (ĐÃ GỤC NGÃ - 0 HP)
- Phản ứng tâm lý đối thủ: [${opp.psychologyStatus}]
---`;

        const statusSummary = `• Tuổi: ${character.stats.age} tuổi ${character.stats.month} tháng | Vị trí: ${character.stats.location}\n${combatHudText}`;
        const choices: TurnChoice[] = generatePhase3VerdictChoices(character, opp);

        return {
          narration,
          statusSummary,
          combatHudText,
          systemNotes,
          choices,
          updatedCharacter: character,
          isGameOver: false,
        };
      }

      // NẾU KẺ ĐỊCH VẪN CÒN SỐNG -> TIẾP TỤC DUY TRÌ GIAI ĐOẠN 2 (P2)
      opp.status = collisionRes.isCritical 
        ? 'Bị trọng thương, Đấu Khí nứt rạn nhưng vẫn gầm thét phản kháng'
        : 'Đang thở dốc, mắt vằn tia máu tìm góc phản kích';
      opp.distance = 'Cận chiến (0-2m)';

      const narration = `[GIAI ĐOẠN 2: VA CHẠM TIẾP DIỄN (CLASH & TENSION)]
${collisionRes.clashNarrative}

${opp.name} bị đả thương đáng kể (${opp.hpCurrent}/${opp.hpMax} HP), nhưng vẫn còn sức chống cự và đang gầm thét lùi lại thủ thế ở cự ly ${opp.distance}!
Bạn vừa hao tổn tài nguyên và nhận đòn phản kích (-${collisionRes.damageToPlayer} HP).

Trận đấu đang ở thời khắc căng thẳng. Cả 5 nhóm hành động đều sẵn sàng để bạn chọn:
• [💖 HỒI PHỤC & TRỊ LIỆU] - Khép vết thương, cầm máu, hồi Sinh lực.
• [🛡️ PHÒNG THỦ & NÉ ĐÒN] - Chặn đòn, né tránh, dựng khiên hoặc thế phản đòn Thủy Thần.
• [⚡ CƯỜNG HÓA & HỖ TRỢ] - Bộc phát Đấu Khí, kích hoạt Thể thuật thú tộc, Ma nhãn.
• [⚔️ TẤN CÔNG] - Tung các kỹ năng ma pháp / kiếm thuật đã học để trừ HP địch.
• [🏃 BỎ CHẠY] - Đào tẩu khẩn cấp nếu bất lợi.`;

      const combatHudText = `---
[ TRẠNG THÁI CHIẾN ĐẤU - GIAI ĐOẠN 2: VA CHẠM ]
- Người chơi: HP ${character.stats.healthCurrent}/${character.stats.healthMax} | MP ${character.stats.manaCurrent}/${character.stats.manaMax} | Thể lực: ${character.stats.staminaCurrent}/${character.stats.staminaMax}
- Đối thủ: ${opp.name} (${opp.hpCurrent}/${opp.hpMax} HP) | Cấp độ: [${opp.powerTier}]
- Tình trạng đối thủ: [${opp.status}]
- Khoảng cách: [${opp.distance}]
---`;

      const statusSummary = `• Tuổi: ${character.stats.age} tuổi ${character.stats.month} tháng | Vị trí: ${character.stats.location}\n${combatHudText}`;
      const choices: TurnChoice[] = generatePhase2Choices(character, opp, 'all');

      return {
        narration,
        statusSummary,
        combatHudText,
        systemNotes,
        choices,
        updatedCharacter: character,
        isGameOver: false,
      };
    } else {
      // =========================================================================
      // GIAI ĐOẠN 3: THỰC THI PHÁN QUYẾT CỦA NGƯỜI CHƠI (P3 - RESOLUTION EXECUTION)
      // =========================================================================
      let verdictNarration = '';
      let isOpponentDead = false;
      const earnedCoins = opp.rewardCoins || (opp.powerTier === 'Thánh cấp (Saint)' ? 500 : opp.powerTier === 'Thượng cấp (Advanced)' ? 150 : 35);
      const maxSlots = character.maxInventorySlots || 20;

      if (actionLower.includes('hạ sát') || actionLower.includes('đoạt mạng') || actionLower.includes('kill')) {
        isOpponentDead = true;
        character.stats.asuraCoins = (character.stats.asuraCoins || 0) + earnedCoins;
        verdictNarration = `[PHÁN QUYẾT: HẠ SÁT / ĐOẠT MẠNG]
Không một chút do dự hay thương hại, ánh mắt bạn lạnh như băng tuyết.
Thanh kiếm vung lên một đường cung hoàn mỹ, mũi kiếm dứt khoát xuyên thủng tim ${opp.name}, triệt tiêu hoàn toàn tia sinh khí cuối cùng!
Một chiến binh thực thụ hiểu rằng sự nhân từ trên chiến trường chỉ mang lại mầm họa sát thân. 
Chiến thắng thuộc về kẻ mạnh! Danh tiếng tàn khốc của bạn bắt đầu lan truyền trong giới mạo hiểm giả.`;
        systemNotes.push(`Đoạt mạng [${opp.name}] thành công! Thu hoạch: +${earnedCoins} Xu Asura (Tổng: ${character.stats.asuraCoins}).`);
      } else if (actionLower.includes('cướp') || actionLower.includes('lột') || actionLower.includes('loot')) {
        isOpponentDead = false;
        const lootedCoins = Math.round(earnedCoins * 1.5);
        character.stats.asuraCoins = (character.stats.asuraCoins || 0) + lootedCoins;
        verdictNarration = `[PHÁN QUYẾT: CƯỚP BÓC / LỘT SẠCH ĐỒ]
Bạn tước sạch toàn bộ vũ khí, lục soát từng túi áo, lột sạch nẹp giáp và tịch thu toàn bộ số tiền xu Asura giấu kín trên người ${opp.name}!
Gã chỉ biết rên rỉ bất lực nhìn bạn tịch thu toàn bộ gia tài tích góp nhiều năm.
Bạn thu được thêm +${lootedCoins} Xu Asura từ đợt lột sạch đồ triệt để này.`;
        systemNotes.push(`Lột sạch đồ của [${opp.name}]: Thu được +${lootedCoins} Xu Asura (Tổng: ${character.stats.asuraCoins}).`);
      } else if (actionLower.includes('tra khảo') || actionLower.includes('tống tiền') || actionLower.includes('trao đổi')) {
        isOpponentDead = false;
        character.stats.asuraCoins = (character.stats.asuraCoins || 0) + earnedCoins;
        if (character.progression) {
          character.progression.knowledgePoints += 50;
          character.progression.skillPoints += 30;
        }
        verdictNarration = `[PHÁN QUYẾT: TRA KHẢO / TỐNG TIỀN / TRAO ĐỔI]
Kề mũi kiếm rợn người sát cuống họng đối phương, bạn gằn giọng tra khảo từng bí mật về dòng chảy ma lực địa phương và kỹ thuật chiến đấu.
Trước uy áp ngạt thở, ${opp.name} run rẩy khai báo toàn bộ điểm yếu bí truyền và giao nộp bản đồ kho báu!
Bạn thu nhận được lượng lớn Tri Thức Chiến Đấu (+50 KP, +30 SP) cùng số tiền bồi thường danh dự.`;
        systemNotes.push(`Tra khảo thành công: Nhận +50 KP, +30 SP và +${earnedCoins} Xu Asura!`);
      } else if (actionLower.includes('khoan dung') || actionLower.includes('chữa trị') || actionLower.includes('mercy')) {
        isOpponentDead = false;
        verdictNarration = `[PHÁN QUYẾT: KHOAN DUNG & CHỮA TRỊ]
Bạn từ từ thu kiếm vào vỏ, ngồi xuống lấy dược thảo hoặc ma pháp trị liệu cầm máu vết thương chí mạng cho ${opp.name}.
Đối thủ ngỡ ngàng nhìn bạn, ánh mắt từ thù hận căm phẫn dần chuyển sang sững sờ và kính phục sâu sắc: "Tại sao... lại cứu ta?"
Bạn đứng dậy quay lưng, không nói một lời. Hành động nghĩa hiệp này đã gieo một hạt giống nhân duyên cực lớn — trong tương lai, một đồng minh trung kiên có thể sẽ xuất hiện để báo đáp ân tình cứu mạng hôm nay!`;
        systemNotes.push(`Thể hiện sự khoan dung: Điểm Danh Tiếng & Hảo Cảm tăng vọt! Mở khóa mối liên kết tương lai.`);
        if (!character.bonds.some(b => b.name === opp.name)) {
          character.bonds.push({
            id: `bond_${Date.now()}`,
            name: opp.name,
            relation: 'Kẻ thù được tha mạng (Kính phục)',
            affection: 65,
            notes: 'Được bạn cứu mạng tại chiến trường, mang ơn sâu nặng.',
            isAlive: true,
          });
        }
      } else {
        // Rút lui / mặc kệ
        isOpponentDead = false;
        verdictNarration = `[PHÁN QUYẾT: RÚT LUI / MẶC KỆ]
Bạn vung kiếm giũ sạch máu, quay người cất bước rời khỏi chiến trường trong sự tĩnh lặng.
Bạn không giết, cũng không chữa trị — để mặc số phận của ${opp.name} cho hoang dã định đoạt. 
Quy luật của thế giới tự nhiên sẽ là vị thẩm phán cuối cùng.`;
        systemNotes.push(`Rời khỏi chiến trường, mặc kệ số phận của [${opp.name}].`);
      }

      // Trao chiến lợi phẩm vật phẩm nếu có
      if (character.inventory.length < maxSlots && opp.lootItem) {
        character.inventory.push({
          id: `loot_mat_${Date.now()}`,
          name: opp.lootItem,
          type: 'loot',
          description: `Chiến lợi phẩm thu hoạch từ trận chiến với ${opp.name}.`,
          tier: opp.powerTier,
          valueCoins: earnedCoins,
          dropSource: opp.name,
        });
        systemNotes.push(`Thu được chiến lợi phẩm: [${opp.lootItem}].`);
      }

      // Trao thưởng tài nguyên Cây Kỹ Năng & Kiểm tra Thập Tử Nhất Sinh
      const progReward = awardProgressionRewards(character, opp.powerTier, opp.name, isOpponentDead);
      progReward.notes.forEach(n => systemNotes.push(n));

      // Thể lực và vết thương sau trận chiến
      character.stats.healthCurrent = Math.max(10, character.stats.healthCurrent - 5);
      character.stats.staminaCurrent = Math.max(5, character.stats.staminaCurrent - 10);
      character.stats.touki = Math.min(100, character.stats.touki + 8);
      character.stats.manaControl = Math.min(100, character.stats.manaControl + 6);

      // Kết thúc hoàn toàn trạng thái giao tranh
      character.combat = undefined;

      // Đánh giá Biệt danh và Danh tiếng sau chiến thắng
      const repResult = evaluateTurnReputationAndEpithet(character, safeActionText, choice, true, opp, true);
      if (repResult.announcement) {
        systemNotes.push(repResult.announcement);
      }

      const repSummary = formatReputationSummary(character);
      const equipSummary = formatEquipmentSummary(character.equipment);

      const narration = `${verdictNarration}

HẬU QUẢ VÀ BÀI HỌC CHIẾN TRƯỜNG ĐỂ LẠI:
- Bụi đất và khói lửa dần lắng xuống. Vết thương ngoài da nhức nhối là minh chứng cho trận ác chiến vừa qua.
- Trải nghiệm sinh tử này đã tôi rèn ý chí và phản xạ của bạn lên một tầm cao mới: Đấu Khí +8, Kiểm Soát Mana +6!${repResult.epithetChanged ? `\n- 🏆 Bạn chính thức được xưng tụng danh hiệu mới: [${repResult.newEpithet}]!` : ''}`;

      const statusSummary = `• Tuổi: ${character.stats.age} tuổi ${character.stats.month} tháng | Vị trí: ${character.stats.location}
• Kết Quả Chiến Trận: Giao tranh kết thúc thắng lợi
• HP: ${character.stats.healthCurrent}/${character.stats.healthMax} | Mana: ${character.stats.manaCurrent}/${character.stats.manaMax} | Đấu khí: ${character.stats.touki}/${character.stats.toukiMax || 100}
• Túi đồ: ${character.inventory.length}/${character.maxInventorySlots || 20} ô

${repSummary}

${equipSummary}`;

      const choices: TurnChoice[] = [
        {
          id: 'c3_heal',
          label: 'Ngồi xuống thi triển Ma pháp Trị liệu (Healing) băng bó vết thương',
          actionText: 'Tập trung Mana chữa lành các vết trầy xước và vết rách cơ bắp trước khi vi khuẩn xâm nhập.',
          riskLevel: 'safe',
          category: 'magic',
        },
        {
          id: 'c3_harvest',
          label: 'Xem túi đồ & sắp xếp trang bị vừa thu hoạch',
          actionText: '!inventory',
          riskLevel: 'safe',
          category: 'explore',
        },
        {
          id: 'c3_skills',
          label: 'Mở Cây Kỹ Năng: Sử dụng SP & KP vừa kiếm được để đột phá',
          actionText: '!skills',
          riskLevel: 'safe',
          category: 'study',
        },
        {
          id: 'c3_rest',
          label: 'Trở về phòng ngủ một giấc thật sâu để thể xác phục hồi',
          actionText: 'Về nhà uống sữa ấm, nghỉ ngơi tĩnh dưỡng trọn vẹn để cơ bắp và bình chứa Mana hồi phục.',
          riskLevel: 'safe',
          category: 'rest',
        },
      ];

      return {
        narration,
        statusSummary,
        equipmentSummaryText: equipSummary,
        systemNotes,
        choices,
        updatedCharacter: character,
        isGameOver: false,
      };
    }
  }

  // ==========================================
  // NORMAL TURN ADVANCEMENT (PEACEFUL / STUDY / TRAINING)
  // ==========================================
  const isTimeSkip = actionLower.includes('tua nhanh') || actionLower.includes('năm') || actionLower.includes('tháng') || actionLower.includes('chăm chỉ trong') || actionLower.includes('luyện tập hằng ngày');
  
  if (isTimeSkip) {
    character.stats.age += 1;
    character.stats.month = 1;
    systemNotes.push(`Thời gian trôi qua 1 năm... Bạn hiện đã bước sang tuổi ${character.stats.age}!`);
  } else {
    character.stats.month += 3;
    if (character.stats.month > 12) {
      character.stats.age += 1;
      character.stats.month -= 12;
      systemNotes.push(`Chúc mừng sinh nhật! Bạn đã tròn ${character.stats.age} tuổi.`);
    }
  }

  const age = character.stats.age;

  // ==========================================
  // STORY MILESTONE & CANON SCENARIOS CHECK
  // ==========================================
  const isTravelAction = choice?.id?.startsWith('travel_');
  const storyMilestone = !isTravelAction ? getStoryMilestoneForTurn(character, turnNumber, safeActionText) : null;
  if (storyMilestone) {
    if (storyMilestone.location) {
      character.stats.location = storyMilestone.location;
    }
    if (storyMilestone.statRewards) {
      Object.assign(character.stats, storyMilestone.statRewards);
    }
    if (storyMilestone.traitReward && !character.specialTraits.includes(storyMilestone.traitReward)) {
      character.specialTraits.push(storyMilestone.traitReward);
    }
    if (storyMilestone.itemReward) {
      const alreadyHas = character.inventory.some(i => i.id === storyMilestone.itemReward!.id);
      if (!alreadyHas) {
        character.inventory.push(storyMilestone.itemReward);
        systemNotes.push(`Nhận được chiến lợi phẩm / bảo vật: [${storyMilestone.itemReward.name}]!`);
      }
    }
    character.completedMilestones = character.completedMilestones || [];
    if (!character.completedMilestones.includes(storyMilestone.id)) {
      character.completedMilestones.push(storyMilestone.id);
    }
    storyMilestone.systemNotes.forEach((note: string) => systemNotes.push(note));

    const equipSummary = formatEquipmentSummary(character.equipment);
    const storyMath = formatTalentStatMathNotes(character);
    const statusSummary = `• Tuổi: ${character.stats.age} tuổi ${character.stats.month} tháng | Vị trí: ${character.stats.location}
• Danh hiệu: ${character.title} | Chủng tộc: ${character.race}
• Sinh Mệnh (HP): ${character.stats.healthCurrent}/${character.stats.healthMax}${storyMath.hpNote}
• Mana: ${character.stats.manaCurrent}/${character.stats.manaMax}${storyMath.mpNote} ${character.stats.age < 10 ? `(Giai đoạn Vàng 0-10t: x${character.stats.manaPotentialMultiplier.toFixed(2)})` : '(Đã cố định)'}
• Đấu Khí: ${character.stats.touki}/${character.stats.toukiMax || 100}${storyMath.toukiNote} | Mệt Mỏi: ${character.stats.fatigue || 0}% | Tiền tệ: ${character.stats.asuraCoins || 0} Xu Asura
• Kiểm soát Mana: ${character.stats.manaControl}/100 | Thông Thái: ${character.stats.knowledge}/100
• STR: ${character.stats.strength || 2}${storyMath.strNote} | AGI: ${character.stats.agility || 2}${storyMath.agiNote}
• Ma pháp: Thủy [${character.magic.water}], Hỏa [${character.magic.fire}] | Vô niệm chú: ${character.magic.chantless ? 'ĐÃ MỞ KHÓA (100%)' : `${character.magic.chantlessProgress}%`}
• Kiếm thuật: Kiếm Thần [${character.swordsmanship.swordGod}], Thủy Thần [${character.swordsmanship.waterGod}], Bắc Thần [${character.swordsmanship.northGod}]`;

    const storyChoices = getStoryChoicesForCharacter(character, turnNumber, storyMilestone);
    const sandboxChoices = generateSandboxChoices(character, turnNumber);
    const navChoices = generateWorldNavigationChoices(character);
    const choices: TurnChoice[] = [
      ...navChoices,
      ...storyChoices,
      ...sandboxChoices.filter(sc => !sc.id.startsWith('sb_travel_')).slice(0, 1),
    ];

    if (!choices.some(c => c.id === 'custom_free_action' || c.label.includes('tùy ý') || c.label.includes('Nhập tự do'))) {
      choices.push({
        id: 'custom_free_action',
        label: '4. [Hành động tùy ý]: Tự do nhập hành động',
        actionText: '!custom_action',
        riskLevel: 'safe',
        category: 'explore',
      });
    }

    const progSummary = formatProgressionSummary(character);
    const milestoneNavDisplay = formatCurrentDestinationDisplay(character);

    return {
      narration: `[${storyMilestone.title.toUpperCase()}]\n${storyMilestone.narration}\n\n[ĐIỂM ĐẾN & DI CHUYỂN]:\n${milestoneNavDisplay}`,
      statusSummary: `${statusSummary}\n\n${equipSummary}\n\n${progSummary}`,
      equipmentSummaryText: equipSummary,
      progressionSummaryText: progSummary,
      systemNotes,
      choices,
      updatedCharacter: character,
      isGameOver: false,
    };
  }

  let narrationBody = '';
  const currentChoiceId = choiceId || choice?.id || '';

  // =========================================================================
  // XỬ LÝ HỆ THỐNG BẢN ĐỒ THẾ GIỚI, BẢO VẬT KHU VỰC & DỊCH CHUYỂN NHANH (FAST TRAVEL)
  // =========================================================================
  if (currentChoiceId.startsWith('travel_caravan_')) {
    const targetRegionId = currentChoiceId.replace('travel_caravan_', '') as WorldRegionId;
    const travelResult = executeCaravanTravel(character, targetRegionId);
    narrationBody = `[DỊCH CHUYỂN NHANH - XE NGỰA THƯƠNG ĐỘI & TUẦN LỘC]
${travelResult.message}
Sau chuyến hành trình dài qua các nẻo đường gập ghềnh và trạm gác biên cảnh, bạn đã hòa mình vào nhịp sống mới của ${character.stats.location}.`;
    systemNotes.push(travelResult.message);
  } else if (currentChoiceId.startsWith('travel_ruin_')) {
    const ruinId = currentChoiceId.replace('travel_ruin_', '');
    const ruinResult = executeTeleportRuinTravel(character, ruinId);
    narrationBody = `[MA PHÁP TRẬN DỊCH CHUYỂN CỔ ĐẠI (TELEPORTATION RUINS)]
${ruinResult.message}`;
    systemNotes.push(ruinResult.message);
    if (ruinResult.ambushTriggered) {
      systemNotes.push('⚠️ [CẢNH BÁO PHỤC KÍCH]: Lối ra của ma pháp trận nằm sát hang ổ ma thú hung dữ!');
    }
  } else if (currentChoiceId.startsWith('travel_artifact_')) {
    const artifactId = currentChoiceId.replace('travel_artifact_', '');
    const claimResult = claimRegionalExclusiveArtifact(character, artifactId);
    narrationBody = `[TÌM KIẾM BẢO VẬT / ĐẠO TRƯỜNG ĐẶC QUYỀN KHU VỰC]
${claimResult.message}`;
    systemNotes.push(claimResult.message);
  } else if (currentChoiceId.startsWith('travel_explore_local_')) {
    const currentRegion = identifyCurrentRegion(character.stats.location);
    narrationBody = `[KHÁM PHÁ TẠI CHỖ: ${currentRegion.capitalHub} - ${currentRegion.continent}]
Bạn dạo quanh các khu phố sầm uất, các đền đài và thương quán tại ${currentRegion.capitalHub} thuộc ${currentRegion.name}.
Khí hậu & Địa thế: ${currentRegion.climate} ${currentRegion.geography}
Văn hóa & Luật lệ: ${currentRegion.culture}
Qua những cuộc trò chuyện với các lính đánh thuê và pháp sư địa phương, bạn nắm bắt thêm các tuyến đường thương đội an toàn và manh mối về tàn tích ma pháp trận cổ đại của lục địa này!`;
    character.stats.knowledge = Math.min(100, (character.stats.knowledge || 10) + 2);
    systemNotes.push(`✦ [THU THẬP TRI THỨC VÙNG]: Khảo sát ${currentRegion.capitalHub}, +2 Thông Thái.`);
  }

  // =========================================================================
  // XỬ LÝ KHIÊU CHIẾN THẤT ĐẠI LIỆT CƯỜNG (MONUMENT OF THE SEVEN GREAT POWERS)
  // =========================================================================
  else if (currentChoiceId.startsWith('challenge_great_power_') || actionLower.includes('khiêu chiến đệ') || actionLower.includes('liệt cường')) {
    const powerRankMatch = currentChoiceId.match(/challenge_great_power_(\d+)/);
    const powerRank = powerRankMatch ? parseInt(powerRankMatch[1], 10) : 2;
    const monument = ensureSevenGreatPowersState(character);
    const targetPower = monument.powers.find(p => p.rank === powerRank) || monument.powers[1];

    const evalResult = evaluateGreatPowerChallenge(character, powerRank);

    if (evalResult.isInstakill) {
      character.stats.healthCurrent = 0;
      character.isDead = true;
      character.deathReason = evalResult.reason;
      narrationBody = `[ĐỤNG ĐỘ THẤT ĐẠI LIỆT CƯỜNG - QUY TẮC BẤT KHẢ THI]
Đối thủ: ĐỆ ${targetPower.rank} CƯỜNG: [${targetPower.name}] (${targetPower.alias}) - Biểu tượng: ${targetPower.symbol}

${evalResult.reason}

Khoảnh khắc bạn vừa phát tiết chiến ý muốn bước lên khiêu chiến, một luồng áp lực thần thoại vô hình từ ${targetPower.name} giáng xuống như cả một rặng núi sụp đổ.
Khoảng cách giữa phàm nhân và Thần cảnh không thể bù đắp bằng sự liều lĩnh! 
Trước khi bạn kịp hoàn thành một nhịp thở (chưa đầy 1 giây), toàn bộ Đấu Khí hộ thân vỡ nát thành từng mảnh, kinh mạch toàn thân đứt đoạn và linh hồn bạn bị chấn vỡ tan tành trước uy áp của Đệ ${powerRank} Cường!`;
      systemNotes.push(`☠️ [TỬ VONG TỨC THÌ]: ${evalResult.reason}`);
      return {
        narration: narrationBody,
        statusSummary: `• HP: 0/${character.stats.healthMax} (TỬ VONG) | Đã ngã xuống trước Đệ ${powerRank} Cường [${targetPower.name}]`,
        systemNotes,
        choices: [],
        updatedCharacter: character,
        isGameOver: true,
        deathReason: evalResult.reason,
      };
    } else {
      const usurpRes = usurpGreatPowerRank(character, powerRank);
      narrationBody = `[ĐẠI CHIẾN ĐỈNH CAO THẾ GIỚI - ĐOẠT VỊ BIA ĐÁ THẤT ĐẠI LIỆT CƯỜNG]
Trận quyết đấu kinh thiên động địa giữa bạn và ĐỆ ${targetPower.rank} CƯỜNG [${targetPower.name}] nổ ra làm biến dạng cả địa hình và khí quyển!
Vận dụng toàn bộ ma pháp tối thượng, Đấu Khí cấp Đế/Thần và thần trang tuyệt đỉnh, sau hàng trăm hiệp giao tranh xé toạc không gian, bạn đã chính thức kích bại Đệ ${powerRank} Cường!

${usurpRes.announcement}
Khắp lục địa, các sứ đồ, vương quốc và hiệp hội mạo hiểm giả đều hướng mắt về ngọn núi tuyết phương Bắc — nơi bia đá Thất Đại Liệt Cường của Kỹ Thần vừa tự khắc tên [${character.name}]!`;
      systemNotes.push(usurpRes.announcement);
    }
  }

  // =========================================================================
  // XỬ LÝ NHIỆM VỤ TIẾN TRÌNH HỘI MẠO HIỂM GIẢ (ADVENTURER GUILD QUESTS)
  // =========================================================================
  else if (currentChoiceId.startsWith('quest_accept_')) {
    const qId = currentChoiceId.replace('quest_accept_', '');
    const quest = CANON_ADVENTURER_QUESTS.find(q => q.id === qId) || CANON_ADVENTURER_QUESTS[0];
    character.activeQuest = { ...quest, status: 'active' };
    narrationBody = `[TIẾP NHẬN ỦY THÁC HỘI MẠO HIỂM GIẢ - HẠNG ${quest.rank}]
Bạn bước tới bảng nhiệm vụ bằng gỗ sồi tại sảnh Hội Mạo Hiểm Giả và gỡ xuống tờ ủy thác: [${quest.title}].
• Vị trí khảo sát: ${quest.location}
• Mô tả nhiệm vụ: ${quest.description}
• Mục tiêu cốt lõi: ${quest.objective}
• Phần thưởng đăng ký: ${quest.rewardCoins} Xu Asura, +${quest.rewardSp} SP, +${quest.rewardKp} KP.
${quest.isExam ? '⚠️ ĐÂY LÀ BÀI SÁT HẠCH SINH TỬ ĐỂ THĂNG HẠNG: Không được phép thất bại!' : ''}
Nhân viên tiếp tân đóng dấu mộc đỏ lên Thẻ Mạo Hiểm Giả của bạn: "Hợp đồng đã kích hoạt. Chúc bạn hoàn thành nhiệm vụ thuận lợi!"`;
    systemNotes.push(`✦ Đã nhận ủy thác [Rank ${quest.rank}]: ${quest.title}`);
  }
  else if (currentChoiceId.startsWith('quest_complete_') || (character.activeQuest && actionLower.includes('hoàn thành ủy thác'))) {
    const quest = character.activeQuest || CANON_ADVENTURER_QUESTS[0];
    character.stats.asuraCoins = (character.stats.asuraCoins || 0) + quest.rewardCoins;
    if (character.progression) {
      character.progression.skillPoints += quest.rewardSp;
      character.progression.knowledgePoints += quest.rewardKp;
    }
    character.completedQuestsCount = (character.completedQuestsCount || 0) + 1;
    character.activeQuest = undefined;

    let rankUpMsg = '';
    if (quest.isExam && quest.targetRank) {
      const rep = ensureCharacterReputation(character);
      rep.adventurerRank = quest.targetRank;
      rankUpMsg = `\n🌟 [CHÚC MỪNG THĂNG HẠNG]: Bạn đã vượt qua bài sát hạch sinh tử và chính thức đạt danh hiệu MẠO HIỂM GIẢ HẠNG ${quest.targetRank}! Thẻ mạo hiểm giả của bạn được đổi sang kim loại cao cấp hơn.`;
      systemNotes.push(`Thăng hạng Hội Mạo Hiểm Giả lên Rank ${quest.targetRank}!`);
    }

    narrationBody = `[HOÀN TẤT ỦY THÁC HỘI MẠO HIỂM GIẢ: ${quest.title}]
Bạn trở về chi nhánh Hội Mạo Hiểm Giả với đầy đủ chứng cứ và chiến lợi phẩm chứng minh đã hoàn thành mục tiêu: "${quest.objective}".
Sau khi giám định viên kiểm tra kỹ lưỡng, nhân viên quầy trao cho bạn túi tiền thưởng nặng trịch:
• Nhận thưởng: +${quest.rewardCoins} Xu Asura
• Tích lũy tiềm năng: +${quest.rewardSp} Điểm Kỹ Năng (SP), +${quest.rewardKp} Điểm Tri Thức (KP)
• Tổng số ủy thác hoàn thành: ${character.completedQuestsCount}${rankUpMsg}`;
    systemNotes.push(`✦ Hoàn tất ủy thác: +${quest.rewardCoins} Xu Asura, +${quest.rewardSp} SP, +${quest.rewardKp} KP`);
  }

  // =========================================================================
  // XỬ LÝ SĂN MA THÚ CHUẨN NGUYÊN TÁC HOẶC KHIÊU CHIẾN MINI BOSS / WORLD BOSS
  // =========================================================================
  else if (currentChoiceId.startsWith('hunt_canon_') || currentChoiceId.startsWith('challenge_boss_')) {
    const isBoss = currentChoiceId.startsWith('challenge_boss_');
    const bossId = currentChoiceId.replace('challenge_boss_', '');
    const foundBoss = CANON_BOSSES.find(b => b.id === bossId);

    if (isBoss && foundBoss) {
      narrationBody = `[QUYẾT CHIẾN BOSS THẾ GIỚI / MINI BOSS: ${foundBoss.name.toUpperCase()}]
Địa điểm: ${foundBoss.locationName} | Cảnh giới: ${foundBoss.tier}
${foundBoss.description}
Cơ chế đặc thù: ${foundBoss.specialMechanic}

Trận chiến nổ ra dữ dội! Đối phương bộc phát khí thế cuồng bạo làm rung chuyển mặt đất. 
Bằng sự phối hợp chuẩn xác giữa kiếm chiêu, dòng chảy mana và khả năng đọc tình huống linh hoạt, bạn đã chớp lấy sơ hở và tung đòn kết liễu quyết định!

⭐ CHIẾN LỢI PHẨM HUYỀN THOẠI:
• Tiền thưởng: +${foundBoss.defeatRewardCoins} Xu Asura
• Danh hiệu mới: [${foundBoss.rewardTitle}]
• Bảo vật đoạt được: [${foundBoss.rewardItemName}]`;

      character.stats.asuraCoins = (character.stats.asuraCoins || 0) + foundBoss.defeatRewardCoins;
      character.specialTraits.push(`[${foundBoss.rewardTitle}]`);
      character.inventory.push({
        id: `boss_loot_${Date.now()}`,
        name: foundBoss.rewardItemName,
        type: 'loot',
        tier: foundBoss.tier,
        description: `Chiến lợi phẩm đoạt được sau khi đánh bại ${foundBoss.name}`,
        valueCoins: foundBoss.defeatRewardCoins * 2,
        quantity: 1,
      });
      systemNotes.push(`✦ Hạ gục Boss [${foundBoss.name}], nhận danh hiệu [${foundBoss.rewardTitle}] và ${foundBoss.defeatRewardCoins} Xu!`);
    } else {
      const currentRegion = identifyCurrentRegion(character.stats.location);
      const eco = CANON_REGIONAL_ECOSYSTEMS[currentRegion.id] || CANON_REGIONAL_ECOSYSTEMS.asura;
      const targetMonster = eco.midAndHighBeasts[0];
      narrationBody = `[TRUY VẾT & TIÊU DIỆT MA THÚ CHUẨN KHU VỰC: ${targetMonster.name}]
Địa bàn: ${eco.regionName}
Đặc tính: ${targetMonster.desc}
Chiến thuật đối phó: ${targetMonster.tactics}

Sau thời gian kiên nhẫn bám theo dấu vết cào xé trên thân cây và mùi xạ hương nồng nặc, bạn phục kích thành công [${targetMonster.name}]. 
Đòn đánh chính xác triệt tiêu khả năng phản kháng của ma thú, thu hoạch trọn vẹn nguyên liệu quý:
• Thu được: ${targetMonster.loot}
• Tiền thưởng thương hội: +${targetMonster.rewardCoins} Xu Asura.`;

      character.stats.asuraCoins = (character.stats.asuraCoins || 0) + targetMonster.rewardCoins;
      systemNotes.push(`✦ Thu thập: ${targetMonster.loot} & +${targetMonster.rewardCoins} Xu Asura`);
    }
  }

  // =========================================================================
  // XỬ LÝ LỰA CHỌN THEO ĐỘNG CƠ SANDBOX & THẾ GIỚI MỞ
  // =========================================================================
  else if (choice?.sandboxCategory || currentChoiceId.startsWith('sb_') || currentChoiceId.startsWith('c_sb_')) {
    const sbResult = processSandboxTurnOutcome(
      character, 
      choice || { id: currentChoiceId, label: actionText, actionText, riskLevel: 'safe', category: 'explore' }, 
      actionText, 
      turnNumber
    );
    narrationBody = sbResult.narration;
    sbResult.systemNotes.forEach((n: string) => systemNotes.push(n));
    if (sbResult.rippleEffectText) {
      rippleEffectText = sbResult.rippleEffectText;
    }
  }

  // 3. XỬ LÝ LỰA CHỌN CHẾ TẠO MA ĐẠO KHẢI & VŨ KHÍ TỰ DO
  else if (choiceId === 'free_craft_magic_armor_mk1' || actionLower.includes('ma đạo khải nhất thức') || actionLower.includes('mk.i')) {
    const mk1Item: InventoryItem = {
      id: 'magic_armor_mk1',
      name: 'Ma Đạo Khải Nhất Thức (Magic Armor Mk.I)',
      type: 'armor',
      equipSlot: 'body',
      tier: 'Thần cấp (God)',
      description: 'Bộ đại giáp ma đạo khổng lồ cao 3 mét trang bị buồng lái áp suất cao, mang sức mạnh ngang ngửa Thất Đại Liệt Cường.',
      statBonus: { defenseBonus: 45, toukiPenetration: 35, physicalDamageBonus: 40, magicDamageBonus: 50 },
      isEquipped: true
    };
    if (!character.inventory.some(i => i.id === 'magic_armor_mk1')) {
      character.inventory.push(mk1Item);
      character.equipment.body = mk1Item;
    }
    character.peakStoryProgression = character.peakStoryProgression || {};
    character.peakStoryProgression.magicArmorTechStage = 1;
    character.rawBaseStats = character.rawBaseStats || { ...character.stats };
    character.rawBaseStats.healthMax = (character.rawBaseStats.healthMax || 10) + 50;
    character.rawBaseStats.touki = (character.rawBaseStats.touki || 0) + 25;
    syncCharacterTalentStats(character);
    systemNotes.push('🛡️ [CHẾ TẠO THÀNH CÔNG]: Hoàn thành [Ma Đạo Khải Nhất Thức Mk.I]! Tự động trang bị vào ô Giáp Thân, HP Max +50, Đấu Khí +25.');
    narrationBody = `[HOÀN THÀNH CHẾ TẠO MA ĐẠO KHẢI NHẤT THỨC (MK.I)]
Tại xưởng nghiên cứu Sharia, lò nung ma thuật rực sáng suốt ba ngày ba đêm.
Dưới sự trợ lực của đôi tay cự phách Hoàng tử Zanoba và thuật khắc ấn của Pháp sư Cliff, bộ Ma Đạo Khải Mk.I sừng sững ra đời.
Khi bạn bước vào buồng điều khiển và truyền Mana, lớp giáp hợp kim nặng hàng tấn bỗng nhẹ bẫng tựa lông hồng, biến bạn thành một pháo đài thép di động sẵn sàng đối đầu bất kỳ thực thể cấp Thần nào!`;
  } else if (choiceId === 'free_craft_magic_armor_mk2' || actionLower.includes('ma đạo khải nhị thức') || actionLower.includes('mk.ii')) {
    const mk2Item: InventoryItem = {
      id: 'magic_armor_mk2',
      name: 'Ma Đạo Khải Nhị Thức (Magic Armor Mk.II)',
      type: 'armor',
      equipSlot: 'body',
      tier: 'Đế cấp (Emperor)',
      description: 'Bộ giáp ma đạo thon gọn ôm sát cơ thể, tối ưu hóa tốc độ di chuyển và tiêu hao Mana cực thấp.',
      statBonus: { defenseBonus: 30, speedAgilityBonus: 25, magicDamageBonus: 35, manaCostReduction: 20 },
      isEquipped: true
    };
    if (!character.inventory.some(i => i.id === 'magic_armor_mk2')) {
      character.inventory.push(mk2Item);
      character.equipment.body = mk2Item;
    }
    character.peakStoryProgression = character.peakStoryProgression || {};
    character.peakStoryProgression.magicArmorTechStage = 2;
    character.rawBaseStats = character.rawBaseStats || { ...character.stats };
    character.rawBaseStats.agility = (character.rawBaseStats.agility || 15) + 20;
    syncCharacterTalentStats(character);
    systemNotes.push('🛡️ [NÂNG CẤP THÀNH CÔNG]: Hoàn thành [Ma Đạo Khải Nhị Thức Mk.II]! Đã trang bị, Tốc độ Phản xạ +20.');
    narrationBody = `[NÂNG CẤP MA ĐẠO KHẢI NHỊ THỨC (MK.II)]
Đúc kết kinh nghiệm từ các trận chiến thực địa, bạn cùng xưởng Sharia hoàn thiện phiên bản giáp Mk.II.
Kích thước gọn nhẹ giúp bạn tự do di chuyển qua các hành lang chật hẹp, dễ dàng mang vác đi xa và thi triển các đòn phản xạ chớp nhoáng của Thủy Thần phái!`;
  } else if (choiceId === 'free_craft_magic_armor_mk_zero' || actionLower.includes('ma đạo khải đời 0') || actionLower.includes('mk.zero')) {
    const mkZeroItem: InventoryItem = {
      id: 'magic_armor_mk_zero',
      name: 'Ma Đạo Khải Đời 0 (Magic Armor Mk.Zero)',
      type: 'armor',
      equipSlot: 'body',
      tier: 'Thần cấp (God)',
      description: 'Tuyệt tác ma đạo đỉnh cao của thế giới Sáu Mặt, tích hợp công nghệ Long tộc và động cơ áp suất cực hạn.',
      statBonus: { defenseBonus: 65, toukiPenetration: 50, physicalDamageBonus: 60, magicDamageBonus: 70, speedAgilityBonus: 30 },
      isEquipped: true
    };
    if (!character.inventory.some(i => i.id === 'magic_armor_mk_zero')) {
      character.inventory.push(mkZeroItem);
      character.equipment.body = mkZeroItem;
    }
    character.peakStoryProgression = character.peakStoryProgression || {};
    character.peakStoryProgression.magicArmorTechStage = 3;
    character.rawBaseStats = character.rawBaseStats || { ...character.stats };
    character.rawBaseStats.healthMax = (character.rawBaseStats.healthMax || 10) + 80;
    character.rawBaseStats.touki = (character.rawBaseStats.touki || 0) + 35;
    syncCharacterTalentStats(character);
    systemNotes.push('🛡️ [TUYỆT TÁC MA ĐẠO]: Hoàn thành [Ma Đạo Khải Đời 0 (Mk.Zero)]! HP Max +80, Đấu Khí +35.');
    narrationBody = `[HOÀN THÀNH MA ĐẠO KHẢI ĐỜI 0 (MK.ZERO) ĐỐI ĐẦU ĐẤU THẦN]
Toàn bộ bí thuật luyện kim của Zanoba, trận pháp phong tỏa của Cliff và tri thức Long tộc của Orsted được hội tụ trên bộ giáp Mk.Zero.
Sức mạnh toát ra từ lớp hợp kim kim cương đen khiến đất trời xung quanh Sharia rung chuyển. Bạn đã sẵn sàng cho trận huyết chiến định đoạt số phận thế giới!`;
  } else if (choiceId === 'free_craft_gatling_gauntlet' || actionLower.includes('gatling') || actionLower.includes('găng tay phóng đạn đá')) {
    const gatlingItem: InventoryItem = {
      id: 'gatling_gauntlet_stone',
      name: 'Găng Tay Phóng Đạn Đá Gatling Ma Thuật',
      type: 'weapon',
      equipSlot: 'leftHand',
      tier: 'Vương cấp (King)',
      description: 'Găng tay gắn ổ xoay 6 nòng nén áp suất Mana, bắn liên thanh hàng chục viên đạn đá xoay mỗi giây.',
      statBonus: { magicDamageBonus: 40, physicalDamageBonus: 25, toukiPenetration: 20 },
      isEquipped: true
    };
    if (!character.inventory.some(i => i.id === 'gatling_gauntlet_stone')) {
      character.inventory.push(gatlingItem);
      character.equipment.leftHand = gatlingItem;
    }
    systemNotes.push('⚡ [KHÍ GIỚI MỚI]: Đã rèn đúc [Găng Tay Phóng Đạn Đá Gatling] và trang bị vào Tay Trái! Ma pháp công +40.');
    narrationBody = `[TRANG BỊ GĂNG TAY GATLING MA THUẬT]
Tại bàn chế tác ma cụ, bạn lắp ráp thành công nòng xoay 6 rãnh dẫn Mana vào tấm bảo hộ cổ tay.
Khi kích hoạt thử nghiệm tại bia đá sân tập, hàng chục viên đạn đá xoay rít gió xé toạc không khí, bắn nát tấm bia thép trong nháy mắt. Hỏa lực tầm xa của bạn đã đạt tới mức độ khủng khiếp!`;
  } else if (choice?.isCanonChoice) {
    systemNotes.push('★ [QUYẾT ĐỊNH CHIẾN LƯỢC]: Quyết định sáng suốt giúp nhân vật vững bước trên hành trình định hình vận mệnh bản thân.');
  }

  // Process Action Types
  const isBodyTraining = 
    actionLower.includes('khổ luyện thân thể') || 
    actionLower.includes('luyện thân thể') || 
    actionLower.includes('rèn luyện thân thể') ||
    (actionLower.includes('sinh mệnh') && actionLower.includes('đấu khí'));

  if (isBodyTraining) {
    const isYearSkip = actionLower.includes('tua nhanh') || actionLower.includes('1 năm') || actionLower.includes('365 ngày');
    const hpGain = isYearSkip ? 60 : 20;
    const toukiGain = isYearSkip ? 25 : 8;
    const staminaGain = isYearSkip ? 40 : 15;
    const agilityGain = isYearSkip ? 20 : 6;
    const strGain = isYearSkip ? 12 : 4;

    character.rawBaseStats = character.rawBaseStats || { ...character.stats };
    character.rawBaseStats.healthMax = (character.rawBaseStats.healthMax || 10) + hpGain;
    character.rawBaseStats.staminaMax = (character.rawBaseStats.staminaMax || 20) + staminaGain;
    character.rawBaseStats.touki = (character.rawBaseStats.touki || 0) + toukiGain;
    character.rawBaseStats.agility = (character.rawBaseStats.agility || 15) + agilityGain;
    character.rawBaseStats.strength = (character.rawBaseStats.strength || 20) + strGain;
    syncCharacterTalentStats(character);

    character.stats.healthCurrent = character.stats.healthMax;
    character.stats.staminaCurrent = Math.max(10, Math.round(character.stats.staminaMax * (isYearSkip ? 0.85 : 0.6)));
    character.stats.fatigue = isYearSkip ? 10 : 25;

    systemNotes.push(`★ [KHỔ LUYỆN THÂN THỂ${isYearSkip ? ' 1 NĂM' : ''}]: Đột phá thể chất toàn diện!`);
    systemNotes.push(`• Sinh Mệnh Tối Đa (HP Max) tăng mạnh: +${hpGain} gốc (Tổng HP: ${character.stats.healthCurrent}/${character.stats.healthMax}).`);
    systemNotes.push(`• Mở rộng giới hạn Đấu Khí (Touki): +${toukiGain} điểm (Tổng Đấu Khí: ${character.stats.touki}/${character.stats.toukiMax || 100}).`);
    systemNotes.push(`• Sức Mạnh (STR) & Nhanh Nhẹn (AGI) tăng: STR +${strGain} (Hiện tại: ${character.stats.strength}), AGI +${agilityGain} (Hiện tại: ${character.stats.agility}).`);
    systemNotes.push(`• Thể Lực Tối Đa (Stamina Max) tăng +${staminaGain} (Tổng Thể Lực: ${character.stats.staminaMax}).`);

    if (isYearSkip) {
      narrationBody = `Suốt 365 ngày ròng rã, bạn tuân thủ chế độ khổ luyện thể chất khắc nghiệt và kỷ luật thép: chạy việt dã vượt núi đồi hiểm trở, mang vác cự thạch, chống đẩy hàng ngàn nhịp, tắm mình dưới dòng thác đổ buốt giá và liên tục tập luyện phản xạ né tránh các vật cản lao tới ở tốc độ cao.
Từng thớ cơ bắp và sợi gân trong cơ thể bạn bị xé rách rồi hồi sinh kiên cố như thép nguội rèn qua lửa đỏ. Nguồn sinh mệnh (HP) dồi dào cuộn trào như thác lũ, nâng đỡ thể lực và sức chịu đựng lên tầm cao mới.
Đặc biệt, dòng chảy Đấu Khí (Touki) bên trong kinh mạch bắt đầu tuần hoàn tự nhiên theo từng nhịp đập con tim, ngưng tụ thành một lớp màng bảo hộ vô hình bao bọc lấy từng tấc da thịt. Đôi chân bạn nhẹ bẫng, tốc độ bứt phá thoăn thoắt và phản xạ né đòn sắc bén như loài mãnh thú săn mồi!`;
    } else {
      narrationBody = `Bạn dốc toàn lực vào các bài tập thể lực và rèn luyện thân thể cường độ cao: bứt tốc, mang vác nặng và tập phản xạ cơ thể. Khung xương nở nang, cơ bắp săn chắc, sinh mệnh dồi dào mãnh liệt và Đấu Khí trong cơ thể cuộn trào rõ rệt.`;
    }
  } else if (actionLower.includes('mana') || actionLower.includes('phép') || actionLower.includes('ma pháp') || actionLower.includes('nước') || actionLower.includes('lửa') || actionLower.includes('vô niệm')) {
    const isYearSkip = actionLower.includes('tua nhanh') || actionLower.includes('1 năm') || actionLower.includes('365 ngày');
    const isExhaust = isYearSkip || actionLower.includes('cạn') || actionLower.includes('hết sức') || actionLower.includes('choáng') || actionLower.includes('kiệt');
    const growth = calculateChildhoodManaGrowth(age, isExhaust ? 'magic_exhaustion' : 'magic_practice', character.stats.manaPotentialMultiplier);
    
    const manaBonus = isYearSkip ? Math.round(growth.manaBonus * 3.5) : growth.manaBonus;
    const chantlessBonus = isYearSkip ? Math.max(35, growth.chantlessBonus * 2) : growth.chantlessBonus;
    const manaControlBonus = isYearSkip ? (age < 5 ? 18 : 12) : (age < 5 ? 8 : 4);

    character.rawBaseStats = character.rawBaseStats || { ...character.stats };
    character.rawBaseStats.manaMax = (character.rawBaseStats.manaMax || 10) + manaBonus;
    character.stats.manaPotentialMultiplier = isYearSkip 
      ? Number((growth.newMultiplier + (age < 10 ? 0.25 : 0)).toFixed(2)) 
      : growth.newMultiplier;
    character.stats.manaControl = Math.min(100, character.stats.manaControl + manaControlBonus);
    character.magic.chantlessProgress = Math.min(100, character.magic.chantlessProgress + chantlessBonus);
    syncCharacterTalentStats(character);

    // Tiêu hao Mana để phản ánh chân thực nỗ lực xả cạn và vận công ma thuật
    if (isExhaust) {
      character.stats.manaCurrent = Math.max(1, Math.round(character.stats.manaMax * 0.1));
      character.stats.fatigue = isYearSkip ? 15 : 35;
    } else {
      character.stats.manaCurrent = Math.max(2, Math.round(character.stats.manaMax * 0.35));
      character.stats.fatigue = isYearSkip ? 10 : 20;
    }

    systemNotes.push(`★ [KHỔ LUYỆN MA PHÁP${isYearSkip ? ' 1 NĂM' : ''}]: Khai mở bình chứa Mana cực hạn!`);
    systemNotes.push(`• Tổng lượng Mana tối đa tăng vọt: +${manaBonus} gốc (Hiện tại: ${character.stats.manaCurrent}/${character.stats.manaMax} MP).`);
    systemNotes.push(`• Tốc độ kiểm soát Mana tăng lên: ${character.stats.manaControl}/100.`);
    systemNotes.push(`• Tiến trình Vô niệm chú tăng +${chantlessBonus}% (Hiện tại: ${character.magic.chantlessProgress}%).`);
    systemNotes.push(`• Mana đã tiêu hao trong buổi tập (còn ${character.stats.manaCurrent}/${character.stats.manaMax} MP). Nghỉ ngơi hoặc tĩnh dưỡng sẽ hồi phục đầy.`);

    if (age <= 5 && character.magic.chantlessProgress >= 50 && !character.magic.chantless) {
      character.magic.chantless = true;
      if (!character.specialTraits.includes('[Vô niệm chú] (Chantless Magic)')) {
        character.specialTraits.push('[Vô niệm chú] (Chantless Magic)');
      }
      systemNotes.push('★ THÀNH TỰU ĐẶC BIỆT: Mở khóa thành công [Vô niệm chú] (Chantless Magic)! Bỏ qua niệm chú cổ ngữ, thi triển tức thì!');
    }

    if (character.magic.water === 'Chưa học' && (actionLower.includes('nước') || actionLower.includes('thủy') || character.magic.chantlessProgress >= 20 || isYearSkip)) {
      character.magic.water = 'Sơ cấp (Beginner)';
      systemNotes.push('Đã lĩnh hội: Thủy Ma pháp [Sơ cấp (Beginner)] - Quả cầu nước (Water Ball)!');
    } else if (character.magic.water === 'Sơ cấp (Beginner)' && character.stats.manaControl >= 30 && (age >= 3 || isYearSkip)) {
      character.magic.water = 'Trung cấp (Intermediate)';
      systemNotes.push('Đột phá: Thủy Ma pháp thăng lên [Trung cấp (Intermediate)] - Mũi tên băng (Ice Arrow)!');
    }

    if (character.magic.fire === 'Chưa học' && (actionLower.includes('lửa') || actionLower.includes('hỏa') || (isYearSkip && character.magic.water !== 'Chưa học'))) {
      character.magic.fire = 'Sơ cấp (Beginner)';
      systemNotes.push('Đã lĩnh hội: Hỏa Ma pháp [Sơ cấp (Beginner)] - Đốm lửa (Fire Ball)!');
    }

    if (isYearSkip) {
      narrationBody = `Suốt 365 ngày trôi qua, mỗi buổi sáng vừa mở mắt và mỗi tối trước khi chìm vào giấc ngủ, bạn đều thực hiện nghi thức thiêng liêng: liên tục kích hoạt ma thuật, nén ép và xả cạn dòng chảy Mana cho đến khi ngã gục xuống sàn vì kiệt sức.
Nhờ tư duy người lớn kết hợp cùng cơ chế giãn nở kinh mạch kỳ diệu của thể xác trước 10 tuổi trong thế giới Sáu Mặt, bình chứa Mana của bạn phình to với tốc độ phi thường, tựa như một hồ chứa nước khổng lồ không đáy.
Khả năng định hình hình khối ma thuật bằng ý niệm (Vô niệm chú) trở nên tự nhiên như việc hít thở. Từng giọt nước, tia lửa hay luồng gió đều ngoan ngoãn vận động theo từng suy nghĩ của bạn mà không cần đến nửa lời xướng ngôn!`;
    } else if (age <= 2) {
      narrationBody = `Bạn tập trung tinh thần vào huyệt đan điền nơi hạ vị. Từng đợt Mana ấm áp bắt đầu len lỏi theo đường kinh mạch, tụ lại nơi đầu ngón tay bé xíu. 
Bạn không hề biết đọc những câu thần chú dài dòng phức tạp trong sách ma pháp — thay vào đó, bạn trực tiếp hình dung ra giọt nước ngưng tụ, cảm nhận độ lạnh, hình khối và khối lượng của nó.
Tách! Một quả cầu nước tròn trịa, trong suốt lơ lửng ngay trước mặt bạn rồi rơi xuống đệm ướt sũng. Bạn vừa thực hiện thành công bước Định hình và Giải phóng ma pháp mà hoàn toàn không cần niệm chú!`;
    } else if (age <= 5) {
      narrationBody = `Hằng ngày bí mật luyện tập trong phòng hoặc góc vườn, bạn liên tục bơm xả Mana đến mức kiệt quệ rồi lại chờ hồi phục.
Nhờ tư duy của một người trưởng thành và sự nhạy bén của cơ thể non nớt trước 5 tuổi, bạn đã thuần thục việc thao túng kích thước, tốc độ bắn và nhiệt độ của ma thuật chỉ bằng ý niệm.
Khi bạn chỉ tay về phía bức tường đá bên ngoài cửa sổ, một mũi tên nước xoáy xé gió lao đi với vận tốc kinh hoàng, găm sâu vào thân cây sồi.`;
    } else {
      narrationBody = `Những buổi rèn luyện Ma pháp đã mang lại kết quả vượt bậc. Nguồn mana dồi dào trong cơ thể bạn lúc này đã ngang ngửa với một Pháp sư cấp Thượng hoặc Thánh trưởng thành. 
Bạn nhận thức rõ: chỉ còn vài năm nữa trước khi bước sang tuổi lên 10 — thời điểm bình chứa mana sẽ vĩnh viễn đông kết. Mỗi phút giây thi triển ma thuật lúc này đều là vàng bạc.`;
    }
  } else if (actionLower.includes('kiếm') || actionLower.includes('thể lực') || actionLower.includes('vận động') || actionLower.includes('đấu khí') || actionLower.includes('gỗ')) {
    const isYearSkip = actionLower.includes('tua nhanh') || actionLower.includes('1 năm') || actionLower.includes('365 ngày');
    const toukiGain = isYearSkip ? 18 : (age <= 5 ? 6 : 4);
    const hpGain = isYearSkip ? 30 : 5;
    const staminaGain = isYearSkip ? 35 : 8;
    const agilityGain = isYearSkip ? 14 : 3;
    const strGain = isYearSkip ? 10 : 3;

    character.rawBaseStats = character.rawBaseStats || { ...character.stats };
    character.rawBaseStats.touki = (character.rawBaseStats.touki || 0) + toukiGain;
    character.rawBaseStats.healthMax = (character.rawBaseStats.healthMax || 10) + hpGain;
    character.rawBaseStats.staminaMax = (character.rawBaseStats.staminaMax || 20) + staminaGain;
    character.rawBaseStats.agility = (character.rawBaseStats.agility || 15) + agilityGain;
    character.rawBaseStats.strength = (character.rawBaseStats.strength || 20) + strGain;
    syncCharacterTalentStats(character);

    character.stats.staminaCurrent = Math.max(5, Math.round(character.stats.staminaMax * (isYearSkip ? 0.8 : 0.5)));
    character.stats.fatigue = isYearSkip ? 10 : 25;

    systemNotes.push(`★ [KHỔ LUYỆN KIẾM PHÁP${isYearSkip ? ' 1 NĂM' : ''}]: Tôi rèn kiếm ý và bộ pháp thực chiến!`);
    systemNotes.push(`• Đấu Khí (Touki) tăng mạnh: +${toukiGain} (Tổng Đấu Khí: ${character.stats.touki}/${character.stats.toukiMax || 100}).`);
    systemNotes.push(`• Sinh Mệnh Tối Đa tăng: +${hpGain} (Tổng HP: ${character.stats.healthCurrent}/${character.stats.healthMax}).`);
    systemNotes.push(`• Thể Lực Tối Đa tăng: +${staminaGain} (Tổng Thể Lực: ${character.stats.staminaMax}).`);
    systemNotes.push(`• Sự Nhanh Nhẹn & Phản Xạ tăng: +${agilityGain} (Tổng Nhanh Nhẹn: ${character.stats.agility}).`);

    if (actionLower.includes('thần') || actionLower.includes('nhanh') || actionLower.includes('tốc độ') || isYearSkip) {
      if (character.swordsmanship.swordGod === 'Chưa học') {
        character.swordsmanship.swordGod = 'Sơ cấp (Beginner)';
        character.swordsmanship.preferredStyle = 'swordGod';
        systemNotes.push('Bắt đầu bước chân vào: Kiếm Thần phái [Sơ cấp (Beginner)]!');
      } else if (isYearSkip && character.swordsmanship.swordGod === 'Sơ cấp (Beginner)' && character.stats.touki >= 20) {
        character.swordsmanship.swordGod = 'Trung cấp (Intermediate)';
        systemNotes.push('Đột phá: Kiếm Thần phái thăng lên [Trung cấp (Intermediate)] - Quang chi Kiếm (Kiếm Ánh Sáng sơ khởi)!');
      }
    }
    if (actionLower.includes('thủy') || actionLower.includes('thủ') || actionLower.includes('phản')) {
      if (character.swordsmanship.waterGod === 'Chưa học') {
        character.swordsmanship.waterGod = 'Sơ cấp (Beginner)';
        character.swordsmanship.preferredStyle = 'waterGod';
        systemNotes.push('Bắt đầu bước chân vào: Thủy Thần phái [Sơ cấp (Beginner)]!');
      }
    } else if (actionLower.includes('bắc') || actionLower.includes('mưu') || actionLower.includes('đạo cụ')) {
      if (character.swordsmanship.northGod === 'Chưa học') {
        character.swordsmanship.northGod = 'Sơ cấp (Beginner)';
        character.swordsmanship.preferredStyle = 'northGod';
        systemNotes.push('Bắt đầu bước chân vào: Bắc Thần phái [Sơ cấp (Beginner)]!');
      }
    }

    if (isYearSkip) {
      narrationBody = `Suốt 365 ngày ròng rã, bất kể nắng gắt hay tuyết phủ giá rét, bạn đều nắm chặt thanh kiếm gỗ vung hàng ngàn lượt chém mỗi ngày.
Lòng bàn tay chai sần thô ráp, khớp cổ tay dẻo dai và vững chãi như thép nguội. Dưới từng bước di chuyển bộ pháp, bạn thấu suốt nguyên lý phóng thích trọng tâm và triệt tiêu sơ hở khi đối đầu kẻ địch.
Lớp Đấu Khí (Touki) mỏng manh ban đầu nay đã kết tinh thành dòng năng lượng bao bọc lấy lưỡi kiếm và bắp tay, giúp mỗi nhát chém xé gió rít lên tiếng gầm sắc bén của mãnh thú!`;
    } else if (age <= 3) {
      narrationBody = `Bạn kiên trì tập bò, đứng thẳng và vung vẩy những cành cây nhỏ nhặt được ngoài vườn. 
Đôi chân chập chững và cơ bắp non nớt mỏi nhừ sau từng buổi tập, nhưng xương cốt của bạn trở nên dẻo dai phi thường so với những đứa trẻ cùng trang lứa. 
Một lớp cảm giác tê dại nhẹ bao bọc bề mặt da thịt — mầm mống sơ khai của Đấu Khí (Touki) đang dần hình thành trong thớ cơ.`;
    } else {
      narrationBody = `Cầm thanh kiếm gỗ vừa vặn với bàn tay, bạn liên tục thực hiện hàng trăm lần vung kiếm mỗi ngày. 
Mồ hôi ướt đẫm áo, từng nhịp thở dồn dập rèn luyện sức bền. Dưới sự quan sát của người thân hoặc tự mình nghiền ngẫm, bạn cảm nhận được cách dồn trọng tâm cơ thể và phóng thích lực chém. 
Lớp Đấu Khí mỏng như làn sương bắt đầu vô thức bao bọc lấy lưỡi kiếm gỗ, khiến mỗi nhát chém phát ra tiếng rít xé gió rợn người!`;
    }
  } else if (actionLower.includes('sách') || actionLower.includes('ngôn ngữ') || actionLower.includes('đọc') || actionLower.includes('học') || actionLower.includes('thông thái')) {
    character.stats.knowledge = Math.min(100, character.stats.knowledge + 12);
    systemNotes.push(`Chỉ số Thông Thái tăng lên ${character.stats.knowledge}/100.`);

    if (character.stats.knowledge >= 40 && !character.languages.some(l => l.includes('Ma thần'))) {
      character.languages.push('Ma thần ngữ (Demon God Tongue - Sơ lược)');
      systemNotes.push('Nắm vững thêm ngôn ngữ mới: [Ma thần ngữ (Demon God Tongue)]!');
    } else if (character.stats.knowledge >= 70 && !character.languages.some(l => l.includes('Thú thần'))) {
      character.languages.push('Thú thần ngữ (Beast God Tongue - Giao tiếp)');
      systemNotes.push('Nắm vững thêm ngôn ngữ mới: [Thú thần ngữ (Beast God Tongue)]!');
    }

    narrationBody = `Bạn dành hàng giờ liền trong phòng đọc sách hoặc bên bàn học của gia đình, lật giở từng trang giấy da cổ nhuộm màu thời gian. 
Nhờ kinh nghiệm tiền kiếp, khả năng liên kết ký tự tượng hình và cấu trúc ngữ pháp của bạn diễn ra với tốc độ kinh ngạc. 
Bản đồ Thế giới Sáu Mặt, lịch sử đại chiến Ma Pháp Nhân Ma lần 2, hệ thống quái vật từ C-rank đến S-rank, cùng cấu trúc câu của các chủng tộc xa xôi dần in sâu vào tâm trí bạn.`;
  } else if (actionLower.includes('nghỉ ngơi') || actionLower.includes('ngủ') || actionLower.includes('tĩnh dưỡng') || actionLower.includes('quán trọ')) {
    character.stats.fatigue = 0;
    character.stats.healthCurrent = character.stats.healthMax;
    character.stats.staminaCurrent = character.stats.staminaMax;
    character.stats.manaCurrent = character.stats.manaMax;
    character.statusEffects = character.statusEffects.filter(s => !s.includes('Mệt Mỏi') && !s.includes('Kiệt Quệ Mana'));
    systemNotes.push('Nghỉ ngơi hoàn toàn: Khôi phục 100% HP, MP, Thể lực và xóa bỏ trạng thái Mệt Mỏi (Fatigue = 0%).');
    narrationBody = `Bạn dành trọn vẹn thời gian nghỉ ngơi thư giãn, uống nước ấm và ngủ một giấc thật sâu. 
Từng tế bào trong cơ thể được thả lỏng, các cơ bắp mỏi nhừ được xoa dịu và bình chứa Mana dần hồi phục đầy ắp như mặt hồ phẳng lặng. Tinh thần bạn sảng khoái và tràn đầy sinh khí trở lại!`;
  } else {
    // Tự nhiên hồi phục thể lực, mana và sinh mệnh dần dần trong các lượt hành động thông thường (khám phá, đối thoại, đi chợ...)
    const talentMods = character.progression?.innateTalent?.modifiers || {};
    const hpRegenBonus = 1 + (talentMods.hpRegenPercent || 0) / 100;
    const mpRegenBonus = 1 + (talentMods.mpRegenPercent || 0) / 100;

    if (character.stats.healthCurrent < character.stats.healthMax) {
      const healAmt = Math.max(2, Math.round(character.stats.healthMax * 0.3 * hpRegenBonus));
      character.stats.healthCurrent = Math.min(character.stats.healthMax, character.stats.healthCurrent + healAmt);
    }
    if (!talentMods.lockMagic && character.stats.manaCurrent < character.stats.manaMax) {
      const manaRegenAmt = Math.max(2, Math.round(character.stats.manaMax * 0.35 * mpRegenBonus));
      character.stats.manaCurrent = Math.min(character.stats.manaMax, character.stats.manaCurrent + manaRegenAmt);
    }
    if (character.stats.staminaCurrent < character.stats.staminaMax) {
      character.stats.staminaCurrent = Math.min(character.stats.staminaMax, character.stats.staminaCurrent + Math.max(10, Math.round(character.stats.staminaMax * 0.4)));
    }
    if ((character.stats.fatigue || 0) > 0) {
      character.stats.fatigue = Math.max(0, character.stats.fatigue - 15);
    }
  }
  } else if (!narrationBody) {
    // Xử lý bằng hệ thống Sandbox RPG thế giới mở
    const sbResult = processSandboxTurnOutcome(
      character, 
      choice || { id: currentChoiceId, label: actionText, actionText, riskLevel: 'safe', category: 'explore' }, 
      actionText, 
      turnNumber
    );
    narrationBody = sbResult.narration;
    sbResult.systemNotes.forEach((n: string) => systemNotes.push(n));
    if (sbResult.rippleEffectText) {
      rippleEffectText = sbResult.rippleEffectText;
    }
  } else if (plausibility.isScientificInnovation) {
    narrationBody = `[SÁNG TẠO ĐỘT PHÁ - MA PHÁP KẾT HỢP KHOA HỌC HIỆN ĐẠI]
Vận dụng tư duy khoa học từ kiếp trước: "${safeActionText}", bạn đã tái định hình cơ chế chuyển hóa năng lượng Mana theo góc nhìn hoàn toàn mới!
Dòng chảy Mana không đi theo lối mòn cổ ngữ mà tuân thủ định luật vật lý và động lực học chính xác, tạo nên hiện tượng [${plausibility.innovationName || 'Biến Thể Ma Pháp'}].
Uy lực và độ tinh vi của ma thuật tăng vọt, khiến môi trường xung quanh biến dạng rõ rệt. Những người chứng kiến tại ${character.stats.location} không khỏi sững sờ trước cách vận hành ma lực kỳ dị nhưng hiệu quả đến đáng sợ này!
(${regionalMindset})`;
  } else if (plausibility.isPsychologicalDiplomacy) {
    narrationBody = `[ĐÒN BẨY TÂM LÝ & ĐÀM PHÁN CHIẾN LƯỢC]
Thay vì vội vã dùng bạo lực hay ma thuật, bạn bình tĩnh phân tích tâm lý và điểm yếu của đối phương: "${safeActionText}".
Từng câu chữ gãy gọn, sắc bén như dao găm mổ xẻ trúng động cơ sâu kín và nỗi sợ của đối tượng. Bầu không khí căng thẳng lập tức chuyển dịch, đối phương khựng lại, ánh mắt tràn đầy sự kinh ngạc xen lẫn dè chừng trước một người sở hữu nhãn quan tâm lý lọc lõi!
(${regionalMindset})`;
  } else if (safeActionText.length > 5 && !safeActionText.startsWith('!')) {
    narrationBody = `[HÀNH ĐỘNG ĐỘC LẬP THEO Ý NGUYỆN]
Bạn chủ động tiến hành quyết định của mình: "${safeActionText}".
Với sự cẩn trọng và kinh nghiệm từng trải của một tâm hồn trưởng thành, bạn khéo léo triển khai từng bước hành động trong bối cảnh thực địa tại ${character.stats.location}.
Mọi diễn biến xung quanh phản hồi lại theo đúng quy luật tự nhiên và tâm lý xã hội nơi đây. 
(${regionalMindset})`;
    character.bonds.forEach(b => {
      b.affection = Math.min(100, b.affection + 3);
    });
  } else {
    narrationBody = `Bạn dành thời gian tương tác với những người xung quanh và quan sát cuộc sống thường nhật tại ${character.stats.location}.
Những cử chỉ chững chạc và hiểu biết sâu sắc của bạn khiến mọi người vừa yêu quý vừa ngạc nhiên kính trọng.
Mối quan hệ gắn kết và hiểu biết thực địa của bạn về khu vực xung quanh ngày một sâu sắc hơn.`;
    
    character.bonds.forEach(b => {
      b.affection = Math.min(100, b.affection + 5);
    });
    systemNotes.push('Mức độ thân thiết với những người xung quanh tăng lên.');
  }

  // Cập nhật Danh Hiệu & Biệt Danh theo thành tựu và chiến tích của Người Chơi
  const sandbox = ensureSandboxProgression(character);
  if (sandbox.renownScore >= 200 || character.stats.age >= 40) {
    character.title = `Huyền Thoại Vô Song Đại Lục (${character.stats.age} tuổi)`;
  } else if ((sandbox.strongholdLevel || 0) >= 2) {
    character.title = `Lãnh Chúa Khai Hoang (${character.stats.age} tuổi)`;
  } else if (sandbox.dungeonDeepestFloor >= 10) {
    character.title = `Kẻ Chinh Phục Mê Cung (${character.stats.age} tuổi)`;
  } else if (sandbox.arenaVictories >= 5) {
    character.title = `Bá Chủ Đấu Trường (${character.stats.age} tuổi)`;
  } else if (character.magic.chantless && character.stats.manaMax >= 100) {
    character.title = `Thần Đồng Ma Pháp Vô Niệm (${character.stats.age} tuổi)`;
  } else if (character.swordsmanship.swordGod !== 'Chưa học' || character.swordsmanship.waterGod !== 'Chưa học') {
    character.title = `Kiếm Sĩ Tinh Anh (${character.stats.age} tuổi)`;
  } else {
    character.title = `Thiếu Niên Tiềm Năng (${character.stats.age} tuổi)`;
  }

  // Đánh giá Biệt danh và Danh tiếng theo hành vi lượt này
  const repResult = evaluateTurnReputationAndEpithet(character, safeActionText, choice, false);
  if (repResult.announcement) {
    systemNotes.push(repResult.announcement);
  }
  if (repResult.challengerEncounter?.hasChallenger) {
    systemNotes.push(repResult.challengerEncounter.narrative);
    narrationBody += `\n\n${repResult.challengerEncounter.narrative}`;
  }

  const repSummary = formatReputationSummary(character);

  const mathNotes = formatTalentStatMathNotes(character);
  const statusSummary = `• Tuổi: ${character.stats.age} tuổi ${character.stats.month} tháng | Vị trí: ${character.stats.location}
• Danh hiệu: ${character.title} | Chủng tộc: ${character.race}
• Sinh Mệnh (HP): ${character.stats.healthCurrent}/${character.stats.healthMax}${mathNotes.hpNote}
• Mana: ${character.stats.manaCurrent}/${character.stats.manaMax}${mathNotes.mpNote} ${character.stats.age < 10 ? `(Giai đoạn Vàng 0-10t: x${character.stats.manaPotentialMultiplier.toFixed(2)})` : '(Đã cố định)'}
• Đấu Khí (Touki): ${character.stats.touki}/${character.stats.toukiMax || 100}${mathNotes.toukiNote}
• Thể Lực: ${character.stats.staminaCurrent}/${character.stats.staminaMax} | Mệt Mỏi: ${character.stats.fatigue || 0}% | Tiền tệ: ${character.stats.asuraCoins || 0} Xu Asura
• Kiểm soát Mana: ${character.stats.manaControl}/100 | Thông Thái: ${character.stats.knowledge}/100
• STR: ${character.stats.strength || 2}${mathNotes.strNote} | AGI: ${character.stats.agility || 2}${mathNotes.agiNote}
• Ma pháp: Thủy [${character.magic.water}], Hỏa [${character.magic.fire}] | Vô niệm chú: ${character.magic.chantless ? 'ĐÃ MỞ KHÓA (100%)' : `${character.magic.chantlessProgress}%`}
• Kiếm thuật: Kiếm Thần [${character.swordsmanship.swordGod}], Thủy Thần [${character.swordsmanship.waterGod}], Bắc Thần [${character.swordsmanship.northGod}]`;

  // 3. TÍCH HỢP BẢN ĐỒ & FAST TRAVEL VÀO GIAO DIỆN MỖI LƯỢT
  const destinationDisplay = formatCurrentDestinationDisplay(character);
  ensureSevenGreatPowersState(character);
  const regionalObjectives = formatRegionalObjectivesAndMissions(character);
  narrationBody += `\n\n[ĐIỂM ĐẾN & DI CHUYỂN]:\n${destinationDisplay}\n\n${regionalObjectives}`;

  // Sinh danh sách lựa chọn kết hợp Điều Hướng Thế Giới & Sandbox RPG & Hội Mạo Hiểm Giả
  const navChoices = generateWorldNavigationChoices(character);
  const sbChoices = generateSandboxChoices(character, turnNumber);

  // Thêm lựa chọn ủy thác Hội Mạo Hiểm Giả / Săn ma thú chuẩn nguyên tác
  const questChoices: TurnChoice[] = [];
  if (character.activeQuest) {
    questChoices.push({
      id: `quest_complete_${character.activeQuest.id}`,
      label: `📜 [Hội Mạo Hiểm Giả]: Bàn giao ủy thác [${character.activeQuest.title}] (+${character.activeQuest.rewardCoins} Xu, +${character.activeQuest.rewardSp} SP)`,
      actionText: `Trở về chi nhánh Hội Mạo Hiểm Giả, xuất trình chiến lợi phẩm và bàn giao hoàn tất ủy thác [${character.activeQuest.title}].`,
      riskLevel: character.activeQuest.dangerLevel,
      category: 'hunt',
    });
  } else if (character.stats.age >= 7) {
    const playerRank = character.reputation?.adventurerRank || 'F';
    const availableQuest = CANON_ADVENTURER_QUESTS.find(q => q.rank === playerRank && q.status !== 'completed') || CANON_ADVENTURER_QUESTS[0];
    questChoices.push({
      id: `quest_accept_${availableQuest.id}`,
      label: `📋 [Hội Mạo Hiểm Giả]: Nhận ủy thác [Rank ${availableQuest.rank}] - ${availableQuest.title}`,
      actionText: `Tiến đến bảng thông báo Hội Mạo Hiểm Giả, tiếp nhận ủy thác [${availableQuest.title}] (${availableQuest.objective}).`,
      riskLevel: availableQuest.dangerLevel,
      category: 'hunt',
    });
  }
  
  // Tổ chức các lựa chọn theo quy chuẩn:
  // 1) Khám phá / Tương tác tại chỗ
  // 2) Tìm kiếm Bảo vật / Đạo trường đặc quyền
  // 3) Dịch chuyển nhanh (Xe ngựa hoặc Ma pháp trận)
  // + Các nhiệm vụ mạo hiểm bang hội / đấu trường
  // 4) Hành động tùy ý
  const choices: TurnChoice[] = [
    ...navChoices,
    ...questChoices,
    ...sbChoices.filter(sc => !sc.id.startsWith('sb_travel_')).slice(0, 1),
  ];

  if (!choices.some(c => c.id === 'custom_free_action' || c.label.includes('tùy ý') || c.label.includes('Nhập tự do'))) {
    choices.push({
      id: 'custom_free_action',
      label: '4. [Hành động tùy ý]: Tự do nhập hành động',
      actionText: '!custom_action',
      riskLevel: 'safe',
      category: 'explore',
    });
  }

  const equipSummary = formatEquipmentSummary(character.equipment);
  const fullStatusSummary = `${statusSummary}\n\n${repSummary}\n\n${equipSummary}`;

  return {
    narration: narrationBody,
    statusSummary: fullStatusSummary,
    rippleEffectText,
    equipmentSummaryText: equipSummary,
    reputationSummaryText: repSummary,
    systemNotes,
    choices,
    updatedCharacter: character,
    isGameOver: false,
  };
}
