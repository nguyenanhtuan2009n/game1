import type { 
  Character, 
  PowerTier, 
  CharacterProgression, 
  InnateTalent, 
  InnateTalentType,
  MagicSkills,
  SwordSkills
} from '../types/game.ts';
import { TIER_RANK_MAP, POWER_TIERS } from './mushokuRules.ts';
import { 
  TALENTS_CATALOG, 
  rollInnateTalentRng, 
  applyTalentToBaseStats, 
  syncCharacterTalentStats,
  evaluateTalentBreakthroughSupport,
  type TalentDefinition 
} from './mushokuTalents.ts';

// 6 Specialized Skill Branch Node definition
export interface SkillNodeInfo {
  id: string;
  name: string;
  branch: 1 | 2 | 3 | 4 | 5 | 6;
  branchName: string;
  description: string;
  currentTier: PowerTier;
  targetTier: PowerTier;
  spRequired: number;
  kpRequired: number;
  conditionDescription: string;
  isUnlocked: boolean;
  canBreakthrough: boolean;
  blockReason?: string;
  subSkills: string[];
}

export const LEGACY_STORAGE_KEY = 'mushoku_rpg_legacy_v1';

export interface CarriedLegacyProgression {
  lastCharacterName?: string;
  carriedSkillPoints: number;
  carriedKnowledgePoints: number;
  reincarnationCount: number;
  legacyPoints?: number;
  timestamp?: number;
}

export function saveCarriedProgression(char: Character, extraLegacyPoints: number = 0): void {
  try {
    const existing = getCarriedProgression();
    const currentSp = char.progression?.skillPoints ?? 60;
    const currentKp = char.progression?.knowledgePoints ?? 20;

    const legacyData: CarriedLegacyProgression = {
      lastCharacterName: char.name,
      carriedSkillPoints: currentSp,
      carriedKnowledgePoints: currentKp,
      reincarnationCount: (existing.reincarnationCount || 0) + 1,
      legacyPoints: (existing.legacyPoints || 0) + extraLegacyPoints,
      timestamp: Date.now(),
    };
    localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(legacyData));
  } catch {
    // localStorage fallback
  }
}

export function getCarriedProgression(): CarriedLegacyProgression {
  try {
    const raw = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        lastCharacterName: parsed.lastCharacterName || '',
        carriedSkillPoints: typeof parsed.carriedSkillPoints === 'number' ? parsed.carriedSkillPoints : (typeof parsed.skillPoints === 'number' ? parsed.skillPoints : 60),
        carriedKnowledgePoints: typeof parsed.carriedKnowledgePoints === 'number' ? parsed.carriedKnowledgePoints : (typeof parsed.knowledgePoints === 'number' ? parsed.knowledgePoints : 20),
        reincarnationCount: typeof parsed.reincarnationCount === 'number' ? parsed.reincarnationCount : 0,
        legacyPoints: parsed.legacyPoints || 0,
        timestamp: parsed.timestamp,
      };
    }
  } catch {}
  return {
    carriedSkillPoints: 60,
    carriedKnowledgePoints: 20,
    reincarnationCount: 0,
    legacyPoints: 0,
  };
}

export function ensureCharacterProgression(
  char: Character,
  initialSp?: number,
  initialKp?: number
): CharacterProgression {
  if (char.progression) {
    if (typeof initialSp === 'number' && char.progression.skillPoints < initialSp) {
      char.progression.skillPoints = initialSp;
    }
    if (typeof initialKp === 'number' && char.progression.knowledgePoints < initialKp) {
      char.progression.knowledgePoints = initialKp;
    }
    syncCharacterTalentStats(char);
    return char.progression;
  }

  // Determine Innate Talent from character or roll via RNG
  let assignedTalent: TalentDefinition | null = null;

  // 1. Check if character already carried a custom or pre-rolled talent in specialTraits or fields
  const carriedTalentId = (char as any).preRolledTalent || (char as any).progression?.innateTalent?.id;
  if (carriedTalentId && TALENTS_CATALOG[carriedTalentId]) {
    assignedTalent = TALENTS_CATALOG[carriedTalentId];
  } else {
    // MANDATORY TRUE RNG ROLL ACROSS 6 TIERS (ANTI-HARDCODE / NO DEFAULT TALENT)
    const rolled = rollInnateTalentRng();
    assignedTalent = rolled.talent;
    (char as any).preRolledTalent = assignedTalent.id;
    (char as any).talentRollResult = rolled;
  }

  // Safety fallback
  if (!assignedTalent) {
    const rolled = rollInnateTalentRng();
    assignedTalent = rolled.talent;
  }

  // Check if character already has some near-death memories
  const nearDeathMemories: string[] = [];
  const statusLower = (char.statusEffects || []).join(' ').toLowerCase();
  let nearDeathCount = 0;
  if (statusLower.includes('gãy xương') || statusLower.includes('trọng thương')) {
    nearDeathCount = 1;
    nearDeathMemories.push('Từng bị chấn thương nặng gãy xương nội tạng trong một trận chiến sinh tử.');
  }

  const sp = typeof initialSp === 'number' && initialSp > 0 ? initialSp : 60;
  const kp = typeof initialKp === 'number' && initialKp > 0 ? initialKp : 20;

  const progression: CharacterProgression = {
    skillPoints: sp,
    knowledgePoints: kp,
    nearDeathCount,
    nearDeathMemories,
    innateTalent: {
      id: assignedTalent.id,
      type: (assignedTalent.id in TALENTS_CATALOG ? assignedTalent.id : 'mortal') as InnateTalentType,
      name: assignedTalent.name,
      description: assignedTalent.description,
      tier: assignedTalent.tier,
      tierName: assignedTalent.tierName,
      tierProbability: assignedTalent.tierProbability,
      effectsSummary: assignedTalent.effectsSummary,
      modifiers: assignedTalent.modifiers,
    },
    combatWins: char.stats.age >= 7 ? 4 : 1,
    meteorologicalInsight: assignedTalent.id === 'nature_resonance',
    swordSaintReflex: assignedTalent.id === 'instant_sight' || assignedTalent.id === 'living_weapon',
    godDefeatedOrMonument: false,
    magicKnight: {
      elementalCoating: 'Chưa học',
      toukiSurge: char.stats.touki >= 20 ? 'Sơ cấp (Beginner)' : 'Chưa học',
      beastMartial: 'Chưa học',
    },
    crafting: {
      formations: 'Chưa học',
      artifactCrafting: 'Chưa học',
      summoningContracts: 'Chưa học',
    },
    demonEyes: {
      foresightEye: false,
      xrayEye: false,
      manaEye: false,
      farSightEye: false,
    },
    overallRank: calculateOverallRank(char),
  };

  char.progression = progression;
  syncCharacterTalentStats(char);
  return progression;
}

export function calculateOverallRank(char: Character): PowerTier {
  const tiers: PowerTier[] = [
    char.magic.fire,
    char.magic.water,
    char.magic.earth,
    char.magic.wind,
    char.magic.healing,
    char.magic.detox,
    char.magic.barrier,
    char.magic.summoning,
    char.swordsmanship.swordGod,
    char.swordsmanship.waterGod,
    char.swordsmanship.northGod,
    char.progression?.magicKnight?.elementalCoating || 'Chưa học',
    char.progression?.magicKnight?.toukiSurge || 'Chưa học',
  ];

  let maxRank = 1; // Sơ cấp
  for (const t of tiers) {
    const r = TIER_RANK_MAP[t] || 0;
    if (r > maxRank) maxRank = r;
  }

  return POWER_TIERS[maxRank] || 'Sơ cấp (Beginner)';
}

// -------------------------------------------------------------
// EXPONENTIAL BOTTLENECK THRESHOLDS & REQUIREMENTS
// -------------------------------------------------------------

export interface BreakthroughRequirements {
  targetTier: PowerTier;
  spRequired: number;
  kpRequired: number;
  specialConditionMet: boolean;
  specialConditionDescription: string;
  dangerLevel: 'none' | 'moderate' | 'mortal_abyss' | 'emperor_calamity';
}

export function getBreakthroughRequirements(
  currentTier: PowerTier,
  category: 'magic' | 'sword' | 'knight' | 'craft' | 'eye',
  skillId: string,
  char: Character
): BreakthroughRequirements {
  const currentRank = TIER_RANK_MAP[currentTier] || 0;
  const targetRank = currentRank + 1;
  const targetTier = POWER_TIERS[targetRank] || 'Thần cấp (God)';

  const prog = ensureCharacterProgression(char);

  if (targetRank <= 1) {
    // Sơ cấp (Mới học)
    return {
      targetTier: 'Sơ cấp (Beginner)',
      spRequired: 15,
      kpRequired: 5,
      specialConditionMet: true,
      specialConditionDescription: 'Lĩnh hội căn bản niệm chú và dòng chảy ma lực/đấu khí cơ sở.',
      dangerLevel: 'none',
    };
  }

  if (targetRank === 2) {
    // SƠ CẤP -> TRUNG CẤP (Giai đoạn cơ bản)
    return {
      targetTier: 'Trung cấp (Intermediate)',
      spRequired: 35,
      kpRequired: 15,
      specialConditionMet: true,
      specialConditionDescription: 'Nắm vững cấu trúc niệm chú hoặc hình dung mana/bộ pháp cơ bản.',
      dangerLevel: 'none',
    };
  }

  const talent = prog.innateTalent;
  const talentDef = TALENTS_CATALOG[talent.id || talent.type];

  // Direct talent lockout checks
  if (category === 'magic' && (talentDef?.modifiers.lockMagic || talent.type === 'blocked_meridians')) {
    return {
      targetTier: POWER_TIERS[targetRank - 1],
      spRequired: 9999,
      kpRequired: 9999,
      specialConditionMet: false,
      specialConditionDescription: '🚫 Khóa Thiên Phú: [Kinh Mạch Tắc Nghẽn] - MP bị khóa vĩnh viễn ở 0, không thể học hay đột phá ma pháp!',
      dangerLevel: 'emperor_calamity',
    };
  }

  if (category === 'sword' && (talentDef?.modifiers.lockTouki || talent.type === 'touki_resistant') && targetRank >= 4) {
    return {
      targetTier: POWER_TIERS[targetRank - 1],
      spRequired: 9999,
      kpRequired: 9999,
      specialConditionMet: false,
      specialConditionDescription: '🚫 Khóa Thiên Phú: [Kháng Đấu Khí] - Không thể tạo màng Đấu Khí, cơ thể phàm nhân không thể chịu nổi tốc độ và lực chấn từ Thánh cấp trở lên!',
      dangerLevel: 'emperor_calamity',
    };
  }

  // Calculate SP discounts from talents
  let spModDiscount = 0;
  if (talentDef?.modifiers.skillExpBonusPercent) {
    spModDiscount += talentDef.modifiers.skillExpBonusPercent;
  }
  if (category === 'magic' && talentDef?.modifiers.manaCostPercent && talentDef.modifiers.manaCostPercent < 0) {
    spModDiscount += Math.abs(talentDef.modifiers.manaCostPercent);
  }
  if (category === 'sword' && talentDef?.modifiers.staminaCostSwordPercent && talentDef.modifiers.staminaCostSwordPercent < 0) {
    spModDiscount += Math.abs(talentDef.modifiers.staminaCostSwordPercent);
  }

  if (targetRank === 3) {
    // TRUNG CẤP -> THƯỢNG CẤP (Bức tường thực chiến ban đầu)
    const baseSp = 80;
    const finalSp = Math.max(30, Math.round(baseSp * (1 - spModDiscount / 100)));
    const hasEnoughWins = (prog.combatWins || 0) >= 3;
    return {
      targetTier: 'Thượng cấp (Advanced)',
      spRequired: finalSp,
      kpRequired: 35,
      specialConditionMet: hasEnoughWins,
      specialConditionDescription: `Bức tường thực chiến: Cần trải qua tối thiểu 3 trận chiến thực tế thắng lợi (Hiện tại: ${prog.combatWins || 0}/3 trận).${spModDiscount > 0 ? ` (Ưu đãi Thiên Phú: Giảm ${spModDiscount}% SP)` : ''}`,
      dangerLevel: 'moderate',
    };
  }

  if (targetRank === 4) {
    // THƯỢNG CẤP -> THÁNH CẤP [SAINT] (ĐỘ KHÓ TĂNG GẤP 5 LẦN, < 2% DÂN SỐ)
    const baseSp = 220;
    const finalSp = Math.max(100, Math.round(baseSp * (1 - spModDiscount / 100)));
    let conditionMet = false;
    let desc = '';

    if (category === 'magic') {
      const autoNature = talentDef?.id === 'nature_resonance';
      conditionMet = autoNature || prog.meteorologicalInsight || char.stats.age >= 10 || char.stats.knowledge >= 70;
      desc = autoNature
        ? '🌟 Thiên Phú [Đồng Điệu Tự Nhiên]: Linh hồn hòa cùng khí tượng tự nhiên, tự động lĩnh hội cảnh giới Thánh cấp Ma Pháp!'
        : 'Lĩnh hội quy mô khí tượng / hiện tượng tự nhiên (Tạo Cumulonimbus, sóng thần, bão lửa hoặc động đất cục bộ).';
    } else {
      const autoReflex = talentDef?.id === 'instant_sight' || talentDef?.id === 'living_weapon';
      conditionMet = autoReflex || prog.swordSaintReflex || char.stats.touki >= 60 || (char.stats.staminaMax >= 80 && char.stats.age >= 12);
      desc = autoReflex
        ? `🌟 Thiên Phú [${talentDef.name}]: Thị giác sát na và bản năng vũ khí sống tự động đạt tới tốc độ phản xạ Kiếm Thánh!`
        : skillId.includes('swordGod')
        ? 'Chém đứt rào cản âm thanh (Quang Chi Thái Đao đạt vận tốc siêu thanh).'
        : skillId.includes('waterGod')
        ? 'Hóa giải hoàn toàn đòn đánh từ 8 hướng cùng một lúc (Bát Phương Phản Kích).'
        : 'Biến toàn bộ môi trường và vật dụng thành vũ khí sát thương chí mạng.';
    }

    return {
      targetTier: 'Thánh cấp (Saint)',
      spRequired: finalSp,
      kpRequired: 90,
      specialConditionMet: conditionMet,
      specialConditionDescription: desc,
      dangerLevel: 'moderate',
    };
  }

  if (targetRank === 5) {
    // THÁNH CẤP -> VƯƠNG CẤP [KING] (VỰC THẲM PHÀM NHÂN - ĐỘ KHÓ TĂNG GẤP 20 LẦN, < 0.1% DÂN SỐ)
    const baseSp = 550;
    const finalSp = Math.max(250, Math.round(baseSp * (1 - spModDiscount / 100)));

    // Scaling Near-Death requirement based on talent tier:
    let requiredNearDeath = 5;
    if (talentDef?.tier === 'godkin') {
      requiredNearDeath = 1; // Thể chất thần ma tự sinh tồn
    } else if (talentDef?.tier === 'legendary') {
      requiredNearDeath = 2; // Cốt cách truyền thuyết chỉ cần 2 lần giác ngộ sinh tử
    } else if (talentDef?.id === 'wargod_physique') {
      requiredNearDeath = 2; // Thể chất chiến thần
    } else if (talentDef?.tier === 'genius') {
      requiredNearDeath = 3; // Thiên tài cần 3 lần
    } else if (talentDef?.tier === 'rare') {
      requiredNearDeath = 4; // Bậc hiếm cần 4 lần
    } else {
      requiredNearDeath = 5; // Phàm nhân / Lời nguyền: 5 lần bắt buộc!
    }

    const nearDeathMet = prog.nearDeathCount >= requiredNearDeath;
    return {
      targetTier: 'Vương cấp (King)',
      spRequired: finalSp,
      kpRequired: 250,
      specialConditionMet: nearDeathMet,
      specialConditionDescription: `Bắt buộc trải qua tối thiểu [${requiredNearDeath} LẦN CẬN KỀ CÁI CHẾT THỰC SỰ] (Căn cơ [${talentDef?.tierName || 'Phàm nhân'}]: Cần ${requiredNearDeath} lần, Hiện tại: ${prog.nearDeathCount}/${requiredNearDeath} lần). Không có đường tắt!`,
      dangerLevel: 'mortal_abyss',
    };
  }

  if (targetRank === 6) {
    // VƯƠNG CẤP -> ĐẾ CẤP [EMPEROR] (LÃNH ĐỊA QUÁI VẬT & THIÊN TÀI - ĐỘ KHÓ TĂNG GẤP 100 LẦN, ~0.001%)
    const baseSp = 1400;
    const finalSp = Math.max(800, Math.round(baseSp * (1 - spModDiscount / 100)));

    // Eligible if talent is Genius, Legendary, or God-Kin, or classic factor
    const tier = talentDef?.tier;
    const hasTalent = 
      tier === 'genius' || 
      tier === 'legendary' || 
      tier === 'godkin' ||
      talent.type === 'laplace_factor' || 
      talent.type === 'divine_bloodline' || 
      talent.type === 'founder_truth';

    return {
      targetTier: 'Đế cấp (Emperor)',
      spRequired: finalSp,
      kpRequired: 600,
      specialConditionMet: hasTalent,
      specialConditionDescription: hasTalent
        ? `🌟 Thiên Phú [${talent.name}] (Bậc ${talentDef?.tierName || 'Dị Biệt'}): Đạt tư cách thiên phú bứt phá cảnh giới Đế cấp!`
        : 'Rào cản Thiên bẩm: Bậc Phàm Nhân hoặc Khiếm Khuyết không thể đột phá Đế Cấp! Nỗ lực phàm nhân là hoàn toàn vô nghĩa trước bức tường quy luật thế giới!',
      dangerLevel: 'emperor_calamity',
    };
  }

  // ĐẾ CẤP -> THẦN CẤP [GOD] (ĐỈNH CAO THẤT ĐẠI LIỆT CƯỜNG)
  const isGodkin = talentDef?.tier === 'godkin' || talentDef?.tier === 'legendary';
  const godMet = prog.godDefeatedOrMonument || (isGodkin && (prog.combatWins || 0) >= 15);

  return {
    targetTier: 'Thần cấp (God)',
    spRequired: 3500,
    kpRequired: 1500,
    specialConditionMet: godMet,
    specialConditionDescription: godMet
      ? `🌟 Đủ tư cách Thần Cấp: Đã đánh bại Thần đương nhiệm hoặc khắc danh trên Bia Đá Thất Đại Liệt Cường (hoặc Huyết mạch Thần Ma đã đạt đủ chiến công)!`
      : 'Trực tiếp khiêu chiến và đánh bại một vị Thần đương nhiệm, hoặc được khắc tên trên Bia Đá Thất Đại Liệt Cường!',
    dangerLevel: 'emperor_calamity',
  };
}

// -------------------------------------------------------------
// BREAKTHROUGH EXECUTION WITH REAL CONSEQUENCES
// -------------------------------------------------------------

export interface BreakthroughResult {
  success: boolean;
  message: string;
  isFatal?: boolean;
  fatalReason?: string;
  hpDeduction?: number;
  manaDeduction?: number;
  statDebuff?: string;
  updatedCharacter: Character;
}

export function executeBreakthrough(
  char: Character,
  branchNumber: 1 | 2 | 3 | 4 | 5 | 6,
  skillKey: string
): BreakthroughResult {
  const updatedChar: Character = JSON.parse(JSON.stringify(char));
  const prog = ensureCharacterProgression(updatedChar);

  // Retrieve current tier
  let currentTier: PowerTier = 'Chưa học';
  let category: 'magic' | 'sword' | 'knight' | 'craft' | 'eye' = 'magic';

  if (branchNumber === 1 || branchNumber === 2) {
    category = 'magic';
    currentTier = (updatedChar.magic as any)[skillKey] || 'Chưa học';
  } else if (branchNumber === 3) {
    category = 'sword';
    currentTier = (updatedChar.swordsmanship as any)[skillKey] || 'Chưa học';
  } else if (branchNumber === 5) {
    category = 'knight';
    currentTier = (prog.magicKnight as any)[skillKey] || 'Chưa học';
  } else if (branchNumber === 4) {
    category = 'craft';
    currentTier = (prog.crafting as any)[skillKey] || 'Chưa học';
  }

  const req = getBreakthroughRequirements(currentTier, category, skillKey, updatedChar);
  const targetRank = TIER_RANK_MAP[req.targetTier] || 0;

  // Check talent lockout
  const talent = prog.innateTalent;
  const talentDef = TALENTS_CATALOG[talent.id || talent.type];
  if (category === 'magic' && (talentDef?.modifiers.lockMagic || talent.type === 'blocked_meridians')) {
    return {
      success: false,
      message: '🚫 KHÓA THIÊN PHÚ: [Kinh Mạch Tắc Nghẽn]! MP tối đa bị khóa vĩnh viễn ở 0, không thể học hoặc đột phá bất kỳ kỹ năng ma pháp nào.',
      updatedCharacter: char,
    };
  }
  if ((category === 'sword' || category === 'knight') && (talentDef?.modifiers.lockTouki || talent.type === 'touki_resistant') && targetRank >= 4) {
    return {
      success: false,
      message: '🚫 KHÓA THIÊN PHÚ: [Kháng Đấu Khí]! Cơ thể không thể tạo màng Đấu Khí để cường hóa cơ bắp, không thể đột phá cảnh giới kiếm thuật/thể thuật từ Thánh cấp trở lên.',
      updatedCharacter: char,
    };
  }

  // 1. Check Resources
  if (prog.skillPoints < req.spRequired || prog.knowledgePoints < req.kpRequired) {
    return {
      success: false,
      message: `🚫 KHÔNG ĐỦ TÀI NGUYÊN: Để đột phá lên [${req.targetTier}], bạn cần tối thiểu ${req.spRequired} SP và ${req.kpRequired} KP. (Hiện có: ${prog.skillPoints} SP, ${prog.knowledgePoints} KP).`,
      updatedCharacter: char,
    };
  }

  // 2. CHECK VƯƠNG CẤP (KING) - BỨC TƯỜNG THẬP TỬ NHẤT SINH
  if (targetRank === 5 && !req.specialConditionMet) {
    return {
      success: false,
      message: `🚫 VỰC THẲM CỦA PHÀM NHÂN BỊ PHONG TỎA: ${req.specialConditionDescription}`,
      updatedCharacter: char,
    };
  }

  // 3. CHECK ĐẾ CẤP (EMPEROR) - RÀO CẢN THIÊN BẨM
  if (targetRank === 6 && !req.specialConditionMet) {
    return {
      success: false,
      isFatal: false,
      message: `🚫 BÌNH CẢNH ĐẾ CẤP (EMPEROR) BỊ PHONG TỎA:\n${req.specialConditionDescription}`,
      updatedCharacter: char,
    };
  }

  // 4. CHECK THÁNH CẤP & CÁC CẤP KHÁC
  if (targetRank === 4 && !req.specialConditionMet) {
    return {
      success: false,
      message: `🚫 BÌNH CẢNH THÁNH CẤP CHƯA ĐƯỢC KHAI MỞ:\n${req.specialConditionDescription}`,
      updatedCharacter: char,
    };
  }

  if (targetRank === 7 && !req.specialConditionMet) {
    return {
      success: false,
      message: `🚫 ĐỈNH CAO THẦN CẤP CHƯA CHẤP NHẬN: Bạn chưa từng khiêu chiến Thần đương nhiệm hoặc chưa được Bia Đá Thất Đại Liệt Cường công nhận!`,
      updatedCharacter: char,
    };
  }

  // SUCCESSFUL BREAKTHROUGH!
  prog.skillPoints -= req.spRequired;
  prog.knowledgePoints -= req.kpRequired;

  // Apply skill upgrade
  if (branchNumber === 1 || branchNumber === 2) {
    (updatedChar.magic as any)[skillKey] = req.targetTier;
  } else if (branchNumber === 3) {
    (updatedChar.swordsmanship as any)[skillKey] = req.targetTier;
  } else if (branchNumber === 5) {
    (prog.magicKnight as any)[skillKey] = req.targetTier;
  } else if (branchNumber === 4) {
    (prog.crafting as any)[skillKey] = req.targetTier;
  }

  // Stat boost based on tier reached
  updatedChar.rawBaseStats = updatedChar.rawBaseStats || { ...updatedChar.stats };
  if (targetRank >= 4) {
    updatedChar.stats.manaControl = Math.min(100, updatedChar.stats.manaControl + 10);
    updatedChar.rawBaseStats.touki = (updatedChar.rawBaseStats.touki || 0) + 12;
  }
  if (targetRank >= 5) {
    updatedChar.rawBaseStats.healthMax = (updatedChar.rawBaseStats.healthMax || 10) + 40;
    updatedChar.rawBaseStats.staminaMax = (updatedChar.rawBaseStats.staminaMax || 20) + 30;
  }

  syncCharacterTalentStats(updatedChar);
  prog.overallRank = calculateOverallRank(updatedChar);

  return {
    success: true,
    message: `🎉 ĐỘT PHÁ THÀNH CÔNG!\nKỹ năng [${skillKey}] đã chính thức bước vào cảnh giới: 【${req.targetTier}】!\nTiêu hao: -${req.spRequired} SP, -${req.kpRequired} KP. Khí tức và Đấu Khí toàn thân bùng nổ sang một tầm vóc hoàn toàn mới!`,
    updatedCharacter: updatedChar,
  };
}

// -------------------------------------------------------------
// RESOURCE ACQUISITION & NEAR DEATH DETECTOR
// -------------------------------------------------------------

export function awardProgressionRewards(
  char: Character,
  oppTier: PowerTier,
  oppType: string,
  isVictory: boolean
): { spGain: number; kpGain: number; notes: string[] } {
  const prog = ensureCharacterProgression(char);
  const notes: string[] = [];

  let spGain = 0;
  let kpGain = 0;

  const rank = TIER_RANK_MAP[oppTier] || 1;

  if (isVictory) {
    prog.combatWins = (prog.combatWins || 0) + 1;

    if (rank <= 2) {
      // Sơ - Trung cấp: Ít SP, rất hiếm KP
      spGain = Math.floor(Math.random() * 10) + 8; // 8-17 SP
      kpGain = Math.random() > 0.7 ? 1 : 0;        // 0-1 KP
    } else if (rank === 3) {
      // Thượng cấp
      spGain = Math.floor(Math.random() * 25) + 30; // 30-55 SP
      kpGain = Math.floor(Math.random() * 8) + 5;   // 5-12 KP
    } else if (rank === 4) {
      // Thánh cấp
      spGain = Math.floor(Math.random() * 50) + 80;  // 80-130 SP
      kpGain = Math.floor(Math.random() * 20) + 25; // 25-45 KP
    } else {
      // Vương / Đế / Thần cấp
      spGain = Math.floor(Math.random() * 150) + 200;
      kpGain = Math.floor(Math.random() * 80) + 100;
    }

    prog.skillPoints += spGain;
    prog.knowledgePoints += kpGain;
    notes.push(`Thu được tài nguyên phát triển: +${spGain} SP, +${kpGain} KP!`);
  }

  // Detect Near-Death situation (HP < 15% or high damage taken)
  const healthPercent = (char.stats.healthCurrent / char.stats.healthMax) * 100;
  if (healthPercent > 0 && healthPercent <= 15) {
    prog.nearDeathCount = (prog.nearDeathCount || 0) + 1;
    const memory = `Cận kề cái chết trước [${oppType} - ${oppTier}] (HP chạm đáy ${char.stats.healthCurrent}/${char.stats.healthMax}).`;
    prog.nearDeathMemories.push(memory);
    notes.push(`⚡ KHẮC GHI THẬP TỬ NHẤT SINH: Bạn vừa vượt qua lằn ranh sinh tử (${prog.nearDeathCount}/5 lần cần thiết để đột phá Vương cấp)!`);
  }

  return { spGain, kpGain, notes };
}

// -------------------------------------------------------------
// MANA EXHAUSTION STAGES (3 GIAI ĐOẠN KIỆT QUỆ MANA)
// -------------------------------------------------------------

export interface ManaExhaustionEffect {
  stage: 0 | 1 | 2 | 3;
  warningText?: string;
  isFatal?: boolean;
  fatalReason?: string;
}

export function evaluateManaExhaustion(char: Character, spellAttemptWhenZero = false): ManaExhaustionEffect {
  const manaRatio = char.stats.manaCurrent / Math.max(1, char.stats.manaMax);

  // If player has immortal bloodline or blocked meridians (never had mana), do not punish
  if (char.progression?.innateTalent?.id === 'immortal_bloodline' || char.progression?.innateTalent?.id === 'blocked_meridians') {
    return { stage: 0 };
  }

  // Stage 3: Cố ép dùng phép khi đã hết sạch MP
  if (char.stats.manaCurrent <= 0 && spellAttemptWhenZero && char.stats.manaMax > 0) {
    const isVeryLowHp = char.stats.healthCurrent < 15;
    char.stats.healthCurrent = Math.max(1, char.stats.healthCurrent - 5);
    return {
      stage: 3,
      isFatal: false,
      warningText: '⚠️ [KIỆT QUỆ MANA GIAI ĐOẠN 3]: Dòng chảy Mana cạn kiệt! Bạn bị kiệt sức, choáng váng hoa mắt và buộc phải nghỉ ngơi hồi phục!',
    };
  }

  // Stage 2: MP = 0%
  if (char.stats.manaCurrent <= 0) {
    return {
      stage: 2,
      warningText: '⚠️ [KIỆT QUỆ MANA GIAI ĐOẠN 2]: Mana chạm đáy 0%! Cơn buồn nôn dữ dội và sốt cao ập đến, toàn thân bất lực, bạn ngất xỉu và buộc phải hồi sức!',
    };
  }

  // Stage 1: MP < 10%
  if (manaRatio <= 0.10) {
    return {
      stage: 1,
      warningText: '⚠️ [KIỆT QUỆ MANA GIAI ĐOẠN 1]: Mana sụt giảm dưới 10%! Bạn cảm thấy hoa mắt chóng mặt, tốc độ niệm chú chậm đi 50% và sức mạnh thể chất suy giảm rõ rệt!',
    };
  }

  return { stage: 0 };
}

// -------------------------------------------------------------
// ADVANCED HUD FORMATTER: [ BẢNG TIẾN TRÌNH & ĐỘT PHÁ CẤP BẬC ]
// -------------------------------------------------------------

export function formatProgressionSummary(char: Character): string {
  const prog = ensureCharacterProgression(char);

  // Identify main magic & sword
  const magicEntries: [string, PowerTier][] = [
    ['Thủy (Water)', char.magic.water],
    ['Hỏa (Fire)', char.magic.fire],
    ['Thổ (Earth)', char.magic.earth],
    ['Phong (Wind)', char.magic.wind],
    ['Trị Liệu', char.magic.healing],
  ];
  let topMagic = magicEntries[0];
  let maxMagicRank = 0;
  for (const m of magicEntries) {
    const r = TIER_RANK_MAP[m[1]] || 0;
    if (r > maxMagicRank) {
      maxMagicRank = r;
      topMagic = m;
    }
  }

  const swordEntries: [string, PowerTier][] = [
    ['Kiếm Thần phái', char.swordsmanship.swordGod],
    ['Thủy Thần phái', char.swordsmanship.waterGod],
    ['Bắc Thần phái', char.swordsmanship.northGod],
  ];
  let topSword = swordEntries[0];
  let maxSwordRank = 0;
  for (const s of swordEntries) {
    const r = TIER_RANK_MAP[s[1]] || 0;
    if (r > maxSwordRank) {
      maxSwordRank = r;
      topSword = s;
    }
  }

  // Bottleneck progress estimate
  const magicReq = getBreakthroughRequirements(topMagic[1], 'magic', topMagic[0], char);
  const magicSpPercent = Math.min(100, Math.round((prog.skillPoints / Math.max(1, magicReq.spRequired)) * 100));

  const swordReq = getBreakthroughRequirements(topSword[1], 'sword', topSword[0], char);
  const swordSpPercent = Math.min(100, Math.round((prog.skillPoints / Math.max(1, swordReq.spRequired)) * 100));

  let nextObstacle = '';
  const currentOverallRank = prog.overallRank || 'Sơ cấp (Beginner)';
  const rankNum = TIER_RANK_MAP[currentOverallRank] || 1;

  if (rankNum === 1) {
    nextObstacle = 'Trung cấp: Cần rèn luyện căn bản và tích lũy 35 SP, 15 KP.';
  } else if (rankNum === 2) {
    nextObstacle = `Thượng cấp: Bức tường thực chiến (${prog.combatWins || 0}/3 trận thắng thực chiến cần thiết).`;
  } else if (rankNum === 3) {
    nextObstacle = 'Thánh cấp (Saint): Đòi hỏi ngộ đạo quy mô khí tượng (Ma pháp) hoặc chém đứt âm thanh / phản đòn 8 hướng (Kiếm thuật).';
  } else if (rankNum === 4) {
    nextObstacle = `Vương cấp (King) - Vực thẳm phàm nhân: Bắt buộc tối thiểu 5 lần cận kề cái chết (${prog.nearDeathCount}/5 lần). Không có đường tắt!`;
  } else if (rankNum === 5) {
    nextObstacle = 'Đế cấp (Emperor): Yêu cầu Thiên tài Laplace / Huyết mạch Thần Ma. Người phàm cố ép sẽ tử vong do phản phệ!';
  } else {
    nextObstacle = 'Thần cấp (God): Đánh bại Thần đương nhiệm hoặc khắc danh trên Bia Đá Thất Đại Liệt Cường!';
  }

  const activeEyes: string[] = [];
  if (prog.demonEyes.foresightEye) activeEyes.push('Dự Tri Nhãn');
  if (prog.demonEyes.xrayEye) activeEyes.push('Thấu Thị Nhãn');
  if (prog.demonEyes.manaEye) activeEyes.push('Ma Lực Nhãn');
  if (prog.demonEyes.farSightEye) activeEyes.push('Vạn Lý Nhãn');
  const activeEyesText = activeEyes.length > 0 ? activeEyes.join(', ') : 'Chưa thức tỉnh';

  return `---
[ BẢNG TIẾN TRÌNH & ĐỘT PHÁ CẤP BẬC (6 NHÁNH ĐA DIỆN) ]
- Căn Cơ / Thiên Phú: [${prog.innateTalent.name}]
- Tài Nguyên: SP Khả dụng: [${prog.skillPoints}] | KP Khả dụng: [${prog.knowledgePoints}]
- TIẾN ĐỘ 6 NHÁNH KỸ NĂNG:
  * Nhánh 1 (Tứ Đại Nguyên Tố): Thủy [${char.magic.water}], Hỏa [${char.magic.fire}], Thổ [${char.magic.earth}], Phong [${char.magic.wind}]
  * Nhánh 2 (Thần Thánh & Kết Giới): Trị Liệu [${char.magic.healing}], Giải Độc [${char.magic.detox}], Kết Giới [${char.magic.barrier}]
  * Nhánh 3 (Tam Đại Kiếm Phái): Kiếm Thần [${char.swordsmanship.swordGod}], Thủy Thần [${char.swordsmanship.waterGod}], Bắc Thần [${char.swordsmanship.northGod}]
  * Nhánh 4 (Trận Pháp & Ma Cụ): Khắc Trận [${prog.crafting.formations}], Luyện Kim [${prog.crafting.artifactCrafting}], Triệu Hồi [${prog.crafting.summoningContracts}]
  * Nhánh 5 (Ma Kiếm Sĩ & Thể Thuật): Ma Đao [${prog.magicKnight.elementalCoating}], Đấu Khí [${prog.magicKnight.toukiSurge}], Thú Tộc [${prog.magicKnight.beastMartial}]
  * Nhánh 6 (Ma Nhãn Huyền Bí): [${activeEyesText}]
- Tiến Độ Sinh Tử (Chỉ dành cho mục tiêu Cấp Vương): [${prog.nearDeathCount}/5 lần thập tử nhất sinh]
- Rào Cản Đột Phá Kế Tiếp: ${nextObstacle}
- RANK TỔNG THỂ HIỆN TẠI: [${currentOverallRank}]
---`;
}

export interface ProgressionDetails {
  innateTalentName: string;
  innateTalentType: InnateTalentType;
  innateTalentTier?: string;
  innateTalentProbability?: string;
  innateTalentEffects?: string[];
  innateTalentIcon?: string;
  skillPoints: number;
  knowledgePoints: number;
  branch1: { earth: PowerTier; water: PowerTier; fire: PowerTier; wind: PowerTier };
  branch2: { healing: PowerTier; detox: PowerTier; barrier: PowerTier };
  branch3: { swordGod: PowerTier; waterGod: PowerTier; northGod: PowerTier };
  branch4: { formations: PowerTier; artifactCrafting: PowerTier; summoningContracts: PowerTier };
  branch5: { elementalCoating: PowerTier; toukiSurge: PowerTier; beastMartial: PowerTier };
  branch6: { foresightEye: boolean; xrayEye: boolean; manaEye: boolean; farSightEye: boolean; activeCount: number };
  topMagic: { name: string; tier: PowerTier; percent: number };
  topSword: { name: string; tier: PowerTier; percent: number };
  nearDeathCount: number;
  nearDeathMet: boolean;
  nextObstacle: string;
  overallRank: PowerTier;
}

export function getProgressionSummaryDetails(char: Character): ProgressionDetails {
  const prog = ensureCharacterProgression(char);

  const magicEntries: [string, PowerTier][] = [
    ['Thủy (Water)', char.magic.water],
    ['Hỏa (Fire)', char.magic.fire],
    ['Thổ (Earth)', char.magic.earth],
    ['Phong (Wind)', char.magic.wind],
    ['Trị Liệu', char.magic.healing],
  ];
  let topMagic = magicEntries[0];
  let maxMagicRank = 0;
  for (const m of magicEntries) {
    const r = TIER_RANK_MAP[m[1]] || 0;
    if (r > maxMagicRank) {
      maxMagicRank = r;
      topMagic = m;
    }
  }

  const swordEntries: [string, PowerTier][] = [
    ['Kiếm Thần phái', char.swordsmanship.swordGod],
    ['Thủy Thần phái', char.swordsmanship.waterGod],
    ['Bắc Thần phái', char.swordsmanship.northGod],
  ];
  let topSword = swordEntries[0];
  let maxSwordRank = 0;
  for (const s of swordEntries) {
    const r = TIER_RANK_MAP[s[1]] || 0;
    if (r > maxSwordRank) {
      maxSwordRank = r;
      topSword = s;
    }
  }

  const magicReq = getBreakthroughRequirements(topMagic[1], 'magic', topMagic[0], char);
  const magicSpPercent = Math.min(100, Math.round((prog.skillPoints / Math.max(1, magicReq.spRequired)) * 100));

  const swordReq = getBreakthroughRequirements(topSword[1], 'sword', topSword[0], char);
  const swordSpPercent = Math.min(100, Math.round((prog.skillPoints / Math.max(1, swordReq.spRequired)) * 100));

  let nextObstacle = '';
  const currentOverallRank = prog.overallRank || 'Sơ cấp (Beginner)';
  const rankNum = TIER_RANK_MAP[currentOverallRank] || 1;

  if (rankNum === 1) {
    nextObstacle = 'Trung cấp: Cần rèn luyện căn bản và tích lũy 35 SP, 15 KP.';
  } else if (rankNum === 2) {
    nextObstacle = `Thượng cấp: Bức tường thực chiến (${prog.combatWins || 0}/3 trận thắng thực chiến cần thiết).`;
  } else if (rankNum === 3) {
    nextObstacle = 'Thánh cấp (Saint): Đòi hỏi ngộ đạo quy mô khí tượng (Ma pháp) hoặc chém đứt âm thanh / phản đòn 8 hướng (Kiếm thuật).';
  } else if (rankNum === 4) {
    nextObstacle = `Vương cấp (King) - Vực thẳm phàm nhân: Bắt buộc tối thiểu 5 lần cận kề cái chết (${prog.nearDeathCount}/5 lần). Không có đường tắt!`;
  } else if (rankNum === 5) {
    nextObstacle = 'Đế cấp (Emperor): Yêu cầu Thiên tài Laplace / Huyết mạch Thần Ma. Người phàm cố ép sẽ tử vong do phản phệ!';
  } else {
    nextObstacle = 'Thần cấp (God): Đánh bại Thần đương nhiệm hoặc khắc danh trên Bia Đá Thất Đại Liệt Cường!';
  }

  let eyeCount = 0;
  if (prog.demonEyes.foresightEye) eyeCount++;
  if (prog.demonEyes.xrayEye) eyeCount++;
  if (prog.demonEyes.manaEye) eyeCount++;
  if (prog.demonEyes.farSightEye) eyeCount++;

  const talentDef = TALENTS_CATALOG[prog.innateTalent.id || prog.innateTalent.type];

  return {
    innateTalentName: prog.innateTalent.name,
    innateTalentType: prog.innateTalent.type,
    innateTalentTier: talentDef?.tierName || prog.innateTalent.tierName || 'Phàm nhân',
    innateTalentProbability: talentDef?.tierProbability || prog.innateTalent.tierProbability || '50%',
    innateTalentEffects: talentDef?.effectsSummary || prog.innateTalent.effectsSummary || [],
    innateTalentIcon: talentDef?.icon || '🌟',
    skillPoints: prog.skillPoints,
    knowledgePoints: prog.knowledgePoints,
    branch1: {
      earth: char.magic.earth,
      water: char.magic.water,
      fire: char.magic.fire,
      wind: char.magic.wind,
    },
    branch2: {
      healing: char.magic.healing,
      detox: char.magic.detox,
      barrier: char.magic.barrier,
    },
    branch3: {
      swordGod: char.swordsmanship.swordGod,
      waterGod: char.swordsmanship.waterGod,
      northGod: char.swordsmanship.northGod,
    },
    branch4: {
      formations: prog.crafting.formations,
      artifactCrafting: prog.crafting.artifactCrafting,
      summoningContracts: prog.crafting.summoningContracts,
    },
    branch5: {
      elementalCoating: prog.magicKnight.elementalCoating,
      toukiSurge: prog.magicKnight.toukiSurge,
      beastMartial: prog.magicKnight.beastMartial,
    },
    branch6: {
      foresightEye: prog.demonEyes.foresightEye,
      xrayEye: prog.demonEyes.xrayEye,
      manaEye: prog.demonEyes.manaEye,
      farSightEye: prog.demonEyes.farSightEye,
      activeCount: eyeCount,
    },
    topMagic: { name: topMagic[0], tier: topMagic[1], percent: magicSpPercent },
    topSword: { name: topSword[0], tier: topSword[1], percent: swordSpPercent },
    nearDeathCount: prog.nearDeathCount,
    nearDeathMet: prog.nearDeathCount >= 5,
    nextObstacle,
    overallRank: currentOverallRank,
  };
}

export function awakenDemonEye(
  char: Character,
  eyeKey: 'foresightEye' | 'xrayEye' | 'manaEye' | 'farSightEye'
): { success: boolean; message: string; updatedCharacter: Character } {
  const updatedChar: Character = JSON.parse(JSON.stringify(char));
  const prog = ensureCharacterProgression(updatedChar);

  if (prog.demonEyes[eyeKey]) {
    return {
      success: false,
      message: 'Ma Nhãn này đã được thức tỉnh từ trước!',
      updatedCharacter: char,
    };
  }

  const spCost = 180;
  const kpCost = 80;

  if (prog.skillPoints < spCost || prog.knowledgePoints < kpCost) {
    return {
      success: false,
      message: `🚫 CẦN KỲ NGỘ HOẶC TÀI NGUYÊN: Để thức tỉnh Ma Nhãn từ di tích cổ hoặc đón nhận ban tặng từ Ma Giới Đại Đế Kishirika Kishirisu, bạn cần tối thiểu ${spCost} SP và ${kpCost} KP (Hiện có: ${prog.skillPoints} SP, ${prog.knowledgePoints} KP).`,
      updatedCharacter: char,
    };
  }

  prog.skillPoints -= spCost;
  prog.knowledgePoints -= kpCost;
  prog.demonEyes[eyeKey] = true;

  const eyeNames: Record<string, string> = {
    foresightEye: 'Dự Tri Nhãn (Eye of Foresight) - Nhìn thấy trước vài giây tương lai gần',
    xrayEye: 'Thấu Thị Nhãn (Eye of X-Ray) - Nhìn xuyên vật cản, địa hình và cấu trúc bên trong',
    manaEye: 'Ma Lực Nhãn (Eye of Mana) - Thấy rõ dòng chảy & sự tích tụ mana của đối phương',
    farSightEye: 'Vạn Lý Nhãn (Eye of Far Sight) - Mở rộng tầm nhìn xa hàng chục dặm',
  };

  const traitName = `[Ma Nhãn]: ${eyeNames[eyeKey] || eyeKey}`;
  if (!updatedChar.specialTraits.includes(traitName)) {
    updatedChar.specialTraits.push(traitName);
  }

  return {
    success: true,
    message: `👁️ THỨC TỈNH MA NHÃN THÀNH CÔNG!\nBạn đã mở khóa thành công: 【${eyeNames[eyeKey] || eyeKey}】!\nTiêu hao: -${spCost} SP, -${kpCost} KP.\nThế giới quan và tri giác chiến đấu thay đổi vĩnh viễn!`,
    updatedCharacter: updatedChar,
  };
}
