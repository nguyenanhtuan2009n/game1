import type { 
  Character, 
  CombatState, 
  TurnChoice, 
  Opponent, 
  EnemyPersonality, 
  PowerTier, 
  InventoryItem, 
  CombatDistance,
  CombatActionRole
} from '../types/game.ts';
import { TIER_RANK_MAP } from './mushokuRules.ts';
import { awardProgressionRewards } from './mushokuProgression.ts';

/**
 * Phân tích và trích xuất toàn bộ kho vũ khí & kỹ năng thực tế mà người chơi ĐÃ HỌC / ĐANG CÓ.
 * TUYỆT ĐỐI KHÔNG xuất hiện chiêu thức chưa học.
 */
export interface PlayerCombatArsenal {
  // Nguyên tố ma pháp đã học (> 'Chưa học')
  hasFire: boolean;
  fireTier: PowerTier;
  hasWater: boolean;
  waterTier: PowerTier;
  hasEarth: boolean;
  earthTier: PowerTier;
  hasWind: boolean;
  windTier: PowerTier;
  hasHealing: boolean;
  healingTier: PowerTier;
  hasDetox: boolean;
  hasBarrier: boolean;
  barrierTier: PowerTier;
  isChantless: boolean;

  // Tam đại kiếm phái đã học (> 'Chưa học')
  hasSwordGod: boolean;
  swordGodTier: PowerTier;
  hasWaterGod: boolean;
  waterGodTier: PowerTier;
  hasNorthGod: boolean;
  northGodTier: PowerTier;

  // Ma Kiếm Sĩ & Thể Thuật
  hasElementalCoating: boolean; // Ma Đao Thể Thuật
  hasToukiSurge: boolean;      // Bộc phát Đấu Khí
  hasBeastMartial: boolean;    // Thể thuật Thú tộc
  toukiStat: number;

  // Ma Nhãn đã thức tỉnh
  hasForesightEye: boolean;
  hasXrayEye: boolean;
  hasManaEye: boolean;
  hasFarSightEye: boolean;

  // Vật phẩm và trang bị sở hữu
  healingHerbs: InventoryItem[];
  hasShieldOrSubWeapon: boolean;
  equippedAmulets: InventoryItem[];
  equippedWeaponName: string;
}

export function extractPlayerArsenal(char: Character): PlayerCombatArsenal {
  const m = char.magic;
  const s = char.swordsmanship;
  const p = char.progression;

  const hasFire = m.fire !== 'Chưa học';
  const hasWater = m.water !== 'Chưa học';
  const hasEarth = m.earth !== 'Chưa học';
  const hasWind = m.wind !== 'Chưa học';
  const hasHealing = m.healing !== 'Chưa học';
  const hasDetox = m.detox !== 'Chưa học';
  const hasBarrier = m.barrier !== 'Chưa học';

  const hasSwordGod = s.swordGod !== 'Chưa học';
  const hasWaterGod = s.waterGod !== 'Chưa học';
  const hasNorthGod = s.northGod !== 'Chưa học';

  const mk = p?.magicKnight;
  const hasElementalCoating = mk ? mk.elementalCoating !== 'Chưa học' : false;
  const hasToukiSurge = (mk ? mk.toukiSurge !== 'Chưa học' : false) || (char.stats.touki >= 30);
  const hasBeastMartial = mk ? mk.beastMartial !== 'Chưa học' : false;

  const de = p?.demonEyes;
  const hasForesightEye = !!de?.foresightEye;
  const hasXrayEye = !!de?.xrayEye;
  const hasManaEye = !!de?.manaEye;
  const hasFarSightEye = !!de?.farSightEye;

  // Inventory healing items
  const healingHerbs = (char.inventory || []).filter(item => {
    const nameLower = (item?.name || '').toLowerCase();
    return item?.type === 'consumable' || nameLower.includes('dược') || nameLower.includes('thuốc') || nameLower.includes('thảo mộc');
  });

  // Shield or sub-weapon in left/right hand
  const left = char.equipment?.leftHand;
  const right = char.equipment?.rightHand;
  const hasShieldOrSubWeapon = !!(
    (left && ((left.name || '').toLowerCase().includes('khiên') || left.type === 'armor')) ||
    (right && ((right.name || '').toLowerCase().includes('khiên') || right.type === 'armor')) ||
    (left && right)
  );

  // Amulets
  const amulets: InventoryItem[] = [];
  ['accessory1', 'accessory2', 'accessory3', 'accessory4', 'accessory5'].forEach(k => {
    const item = (char.equipment as any)?.[k];
    if (item) amulets.push(item);
  });

  const mainWeapon = char.equipment?.leftHand?.name || char.equipment?.rightHand?.name || 'Thanh kiếm sắt';

  return {
    hasFire,
    fireTier: m.fire,
    hasWater,
    waterTier: m.water,
    hasEarth,
    earthTier: m.earth,
    hasWind,
    windTier: m.wind,
    hasHealing,
    healingTier: m.healing,
    hasDetox,
    hasBarrier,
    barrierTier: m.barrier,
    isChantless: !!m.chantless,

    hasSwordGod,
    swordGodTier: s.swordGod,
    hasWaterGod,
    waterGodTier: s.waterGod,
    hasNorthGod,
    northGodTier: s.northGod,

    hasElementalCoating,
    hasToukiSurge,
    hasBeastMartial,
    toukiStat: char.stats.touki || 0,

    hasForesightEye,
    hasXrayEye,
    hasManaEye,
    hasFarSightEye,

    healingHerbs,
    hasShieldOrSubWeapon,
    equippedAmulets: amulets,
    equippedWeaponName: mainWeapon,
  };
}

/**
 * Tính toán tỷ lệ phần trăm thoát chạy thành công của người chơi (Retreat Chance)
 */
export function calculateEscapeChance(player: Character, opponent: Opponent, hasSnare: boolean = false): number {
  const staminaRatio = player.stats.staminaMax > 0 ? (player.stats.staminaCurrent / player.stats.staminaMax) : 1;
  const swordBonus = player.swordsmanship.swordGod !== 'Chưa học' ? 25 : (player.swordsmanship.northGod !== 'Chưa học' ? 20 : 10);
  const playerAgility = Math.round(staminaRatio * 40 + swordBonus + (player.stats.touki || 0) * 0.3);
  const enemyAgility = opponent.agility || (TIER_RANK_MAP[opponent.powerTier] * 18 + 15);

  let baseRate = 50 + (playerAgility - enemyAgility) * 1.5;

  if (hasSnare) {
    baseRate += 25; // Có bẫy hoặc đầm lầy cản chân
  }

  // Đối thủ tính cách
  if (opponent.personality === 'bloodthirsty') {
    baseRate -= 25; // Cuồng chiến truy đuổi đến cùng
  } else if (opponent.personality === 'coward') {
    baseRate += 20; // Hèn nhát ngại truy đuổi
  }

  // Tỷ lệ giới hạn an toàn 10% - 90%
  return Math.max(10, Math.min(90, Math.round(baseRate)));
}

/**
 * Sinh danh sách lựa chọn cho GIAI ĐOẠN 1: THĂM DÒ & NHỊP ĐỘ (P1)
 */
export function generatePhase1Choices(player: Character, opponent: Opponent): TurnChoice[] {
  const a = extractPlayerArsenal(player);
  const choices: TurnChoice[] = [];

  // 1. Quan sát & Thăm dò (Luôn có sẵn)
  choices.push({
    id: 'p1_observe',
    label: '1. Quan sát & Thăm dò: Dò xét luồng Mana, thế thủ và địa hình',
    actionText: `Giữ khoảng cách ${opponent.distance}, hạ thấp hơi thở dò xét dòng chảy Mana và thế thủ của ${opponent.name}. Tận dụng địa hình xung quanh để chọn góc tiến thoái.`,
    riskLevel: 'safe',
    category: 'combat',
    combatBranch: 'P1_PROBING',
    combatRole: 'menu',
    combatSubCategory: '1. Quan sát & Thăm dò',
  });

  // 2. Đòn Đánh Phủ Đầu / Đột Kích (Chỉ hiện kỹ năng tầm xa/khống chế ĐÃ CÓ)
  if (a.hasFire || a.hasWater || a.hasWind) {
    let spellName = 'Hỏa Cầu tầm xa';
    let spellDesc = 'Bắn một quả cầu lửa rực cháy';
    if (a.hasWater) {
      spellName = 'Thủy Tiễn / Băng Tiễn tầm xa';
      spellDesc = 'Ngưng tụ tia nước nén áp suất cao xé gió bắn tới';
    } else if (a.hasWind) {
      spellName = 'Phong Nhận vô hình tầm xa';
      spellDesc = 'Chém ra lưỡi đao chân không trong suốt cản bước';
    }

    choices.push({
      id: 'p1_ranged_strike',
      label: `2. Đòn Đánh Phủ Đầu: Bắn ma pháp tầm xa [${spellName}]`,
      actionText: `${spellDesc} nhắm thẳng vào hạ bàn đối thủ ở cự ly ${opponent.distance} để thử phản xạ và ép đối phương bộc lộ sơ hở!`,
      riskLevel: 'moderate',
      category: 'combat',
      combatBranch: 'P1_PROBING',
      combatRole: 'attack',
      combatSubCategory: '2. Đòn Đánh Phủ Đầu',
      combatTactic: 'kite_magic',
      costMp: 10,
    });
  }

  // Khống chế địa hình diện rộng (nếu có Thổ / Nước / Phong / Hỏa)
  if (a.hasEarth) {
    choices.push({
      id: 'p1_quagmire_terrain',
      label: '2. Khống chế địa hình: Ma pháp Đầm Lầy (Quagmire) sa lầy bùn đất',
      actionText: 'Vận dụng Thổ Ma pháp làm tan rã kết cấu đất đá dưới chân đối phương thành bãi bùn lầy đặc quánh, khóa chặt bước chạy!',
      riskLevel: 'safe',
      category: 'combat',
      combatBranch: 'P1_PROBING',
      combatRole: 'attack',
      combatSubCategory: '2. Đòn Đánh Phủ Đầu',
      combatTactic: 'hybrid_magic',
      costMp: 12,
    });
  } else if (a.hasWater && TIER_RANK_MAP[a.waterTier] >= 2) {
    choices.push({
      id: 'p1_ice_terrain',
      label: '2. Khống chế địa hình: Đóng băng mặt đất tạo bẫy trơn trượt',
      actionText: 'Hạ nhiệt độ mặt đất cự ly gần thành một lớp băng bóng nhẵn, triệt tiêu độ bám đà của đối thủ khi lao tới!',
      riskLevel: 'safe',
      category: 'combat',
      combatBranch: 'P1_PROBING',
      combatRole: 'attack',
      combatSubCategory: '2. Đòn Đánh Phủ Đầu',
      costMp: 10,
    });
  } else if (a.hasWind || a.hasFire) {
    choices.push({
      id: 'p1_smoke_terrain',
      label: '2. Khống chế địa hình: Tung hỏa mù & Màn khói bụi cản tầm nhìn',
      actionText: 'Kích nổ lớp đất cát khô tạo màn khói bụi dày đặc che mắt đối thủ, làm mù định hướng giác quan!',
      riskLevel: 'safe',
      category: 'combat',
      combatBranch: 'P1_PROBING',
      combatRole: 'attack',
      combatSubCategory: '2. Đòn Đánh Phủ Đầu',
      costMp: 8,
    });
  } else {
    // Nếu không có phép tầm xa, ném đá/ám khí thăm dò
    choices.push({
      id: 'p1_throw_stone',
      label: '2. Đột kích thăm dò: Ném đá mồi nhử đo lường phản xạ',
      actionText: 'Nhặt một viên đá góc cạnh ném xoáy vào hốc mắt đối phương để đo tốc độ né tránh và hướng di chuyển.',
      riskLevel: 'safe',
      category: 'combat',
      combatBranch: 'P1_PROBING',
      combatRole: 'attack',
      combatSubCategory: '2. Đòn Đánh Phủ Đầu',
    });
  }

  // 3. Đánh Lén & Chơi Bẩn (Bắc Thần phái / Bản năng sinh tồn)
  choices.push({
    id: 'p1_dirty_trick',
    label: '3. Đánh Lén & Chơi Bẩn: Ném cát vào mắt & Giả vờ run sợ đánh lừa',
    actionText: 'Bốc nắm cát thô đá vụn ném thẳng vào mắt đối thủ, vờ lảo đảo sợ hãi lùi bước để lừa đối phương sơ hở lao vào bẫy!',
    riskLevel: 'safe',
    category: 'combat',
    combatBranch: 'P1_PROBING',
    combatRole: 'attack',
    combatSubCategory: '3. Đánh Lén & Chơi Bẩn',
    combatTactic: 'feint_north',
  });

  // 4. Triển Khai Thế Kiếm (Chỉ hiện các phái kiếm ĐÃ HỌC)
  if (a.hasSwordGod) {
    choices.push({
      id: 'p1_stance_swordgod',
      label: `4. Thế Kiếm: Kiếm Thần phái (${a.swordGodTier}) - Bộc phát Đấu Khí ép sát`,
      actionText: 'Hạ thấp trọng tâm, dồn Đấu Khí vào đùi và bàn chân, vào thế kiếm ép sát chớp nhoáng với tâm thế chém trước đoạt mạng!',
      riskLevel: 'moderate',
      category: 'combat',
      combatBranch: 'P1_PROBING',
      combatRole: 'attack',
      combatSubCategory: '4. Triển Khai Thế Kiếm',
      combatTactic: 'rush',
      costStamina: 10,
    });
  }
  if (a.hasWaterGod) {
    choices.push({
      id: 'p1_stance_watergod',
      label: `4. Thế Kiếm: Thủy Thần phái (${a.waterGodTier}) - Lùi nửa bước dựng thế thủ tuyệt đối`,
      actionText: 'Dựng thanh kiếm vuông góc trước ngực, lùi nửa bước vào thế thủ đón đầu, bất động như mặt hồ phẳng lặng chờ đối phương xuất chiêu.',
      riskLevel: 'safe',
      category: 'combat',
      combatBranch: 'P1_PROBING',
      combatRole: 'defense',
      combatSubCategory: '4. Triển Khai Thế Kiếm',
      combatTactic: 'counter',
      costStamina: 5,
    });
  }
  if (a.hasNorthGod) {
    choices.push({
      id: 'p1_stance_northgod',
      label: `4. Thế Kiếm: Bắc Thần phái (${a.northGodTier}) - Thủ thế dị dạng tận dụng môi trường`,
      actionText: 'Cầm kiếm bằng tay nghịch, hạ trọng tâm nghiêng người vào thế thủ bất quy tắc, mắt liếc các chướng ngại vật xung quanh để biến thành vũ khí.',
      riskLevel: 'safe',
      category: 'combat',
      combatBranch: 'P1_PROBING',
      combatRole: 'attack',
      combatSubCategory: '4. Triển Khai Thế Kiếm',
      combatTactic: 'feint_north',
      costStamina: 5,
    });
  }

  // 5. Bỏ Chạy / Đào Tẩu Sớm (Nhóm Bỏ Chạy)
  const escapeRate = calculateEscapeChance(player, opponent, a.hasEarth || a.hasWater);
  choices.push({
    id: 'p1_flee',
    label: `5. [Bỏ Chạy]: Rút lui cẩn trọng ngay từ giai đoạn thăm dò (Tỷ lệ: ${escapeRate}%)`,
    actionText: `[Bỏ Chạy: Tỷ lệ ${escapeRate}%]: Lùi bước cẩn trọng, ném chướng ngại vật cản đường và tháo lui an toàn trước khi giao tranh nổ ra. (Không gây sát thương)`,
    riskLevel: escapeRate >= 60 ? 'safe' : 'moderate',
    category: 'combat',
    combatBranch: 'C_RETREAT',
    combatRole: 'flee',
    combatSubCategory: 'Nhóm Bỏ Chạy',
    combatTactic: 'retreat',
  });

  // 6. Nhập tự do (Gợi ý hành động sáng tạo)
  choices.push({
    id: 'p1_free_action',
    label: '6. [Nhập tự do]: Tự nhập hành động thăm dò chiến thuật riêng',
    actionText: `Linh hoạt ứng biến: Vận dụng toàn bộ địa hình và giác quan để xử lý ${opponent.name}.`,
    riskLevel: 'safe',
    category: 'combat',
    combatBranch: 'P1_PROBING',
    combatRole: 'menu',
    combatSubCategory: '5. Hành động tự do',
  });

  return choices;
}

/**
 * =========================================================================
 * BẢNG TÍNH SÁT THƯƠNG KỸ NĂNG CHUẨN XÁC & MINH BẠCH (SKILL DAMAGE CALCULATOR)
 * Khắc phục triệt để lỗi "lúc dame to lúc dame yếu":
 * - Sát thương cơ bản được phân cấp rõ ràng theo 7 bậc (Sơ cấp -> Thần cấp).
 * - Sát thương cộng hưởng mượt mà theo Mana Control, Đấu Khí (Touki), Nhanh Nhẹn, Vũ Khí.
 * - Kháng cự và xuyên giáp của đối thủ được tính toán công bằng, không rơi vực thẳm vô lý.
 * =========================================================================
 */
export function calculateSkillDamageRange(
  player: Character,
  skillTier: number,
  offensiveGroup: 'magic' | 'sword' | 'hybrid' | 'basic' = 'sword',
  costMp: number = 0,
  costStamina: number = 0,
  costTouki: number = 0,
  opponent?: Opponent,
  castMode: 'chantless' | 'chanting' | 'sword' = 'chantless'
): { min: number; max: number; display: string } {
  // 1. Phân tầng sát thương cơ bản theo từng cấp bậc chuẩn Mushoku Tensei (Tối ưu minh bạch, ổn định)
  const baseTiers: Record<number, { min: number; max: number }> = {
    1: { min: 45, max: 65 },    // Sơ cấp / Đòn đánh cơ bản
    2: { min: 95, max: 130 },   // Trung cấp
    3: { min: 165, max: 225 },  // Thượng cấp
    4: { min: 275, max: 360 },  // Thánh cấp (Saint)
    5: { min: 420, max: 540 },  // Vương cấp (King)
    6: { min: 620, max: 780 },  // Đế cấp (Emperor)
    7: { min: 920, max: 1200 }, // Thần cấp (God)
  };

  const clampedTier = Math.max(1, Math.min(7, skillTier || 1));
  const base = baseTiers[clampedTier];

  // 2. Tỉ lệ cộng hưởng chỉ số nhân vật (Tăng trưởng mượt mà, không gián đoạn)
  let statBonus = 0;
  const manaCtrl = player.stats.manaControl || 0;
  const touki = (player.stats.touki || 0) + (player.combat?.activeToukiBonus || 0);
  const agility = player.stats.agility || 15;

  if (offensiveGroup === 'magic') {
    statBonus = Math.round(manaCtrl * 0.75 + Math.min(100, (player.stats.manaMax || 100) / 25));
  } else if (offensiveGroup === 'sword') {
    statBonus = Math.round(touki * 0.8 + agility * 0.45);
  } else if (offensiveGroup === 'hybrid') {
    statBonus = Math.round(manaCtrl * 0.5 + touki * 0.55 + agility * 0.35);
  } else {
    // Basic attack
    statBonus = Math.round(touki * 0.35 + agility * 0.25);
  }

  // 3. Trang bị vũ khí & bùa hộ mệnh
  let equipBonus = 0;
  const left = player.equipment?.leftHand;
  const right = player.equipment?.rightHand;
  if (left) equipBonus += (left.statBonus?.physicalDamageBonus || left.statBonus?.magicDamageBonus || left.statBonus?.toukiPenetration || 10);
  if (right) equipBonus += (right.statBonus?.physicalDamageBonus || right.statBonus?.magicDamageBonus || right.statBonus?.toukiPenetration || 10);

  // 4. Cơ chế niệm chú (Xướng ngôn tăng chuẩn 35% uy lực)
  let modeMultiplier = 1.0;
  if (castMode === 'chanting') {
    modeMultiplier = 1.35;
  }

  let minDmg = Math.round((base.min + statBonus + equipBonus) * modeMultiplier);
  let maxDmg = Math.round((base.max + statBonus + equipBonus) * modeMultiplier);

  // 4b. Hệ thống thiên phú quy đổi % (Percentage-based talent matrix)
  const talentMods = player.progression?.innateTalent?.modifiers;
  if (talentMods) {
    let talentMul = 1.0;
    if (offensiveGroup === 'magic' && talentMods.elementalMagicDamagePercent) {
      talentMul += talentMods.elementalMagicDamagePercent / 100;
    }
    if ((offensiveGroup === 'sword' || offensiveGroup === 'basic') && talentMods.physicalDamageDealtPercent) {
      talentMul += talentMods.physicalDamageDealtPercent / 100;
    }
    if (offensiveGroup === 'basic' && talentMods.unarmedDamageDealtPercent) {
      talentMul += talentMods.unarmedDamageDealtPercent / 100;
    }
    minDmg = Math.round(minDmg * talentMul);
    maxDmg = Math.round(maxDmg * talentMul);
  }

  // 5. Tính toán giáp & độ kháng cự của đối thủ (Cân bằng, không rơi vực thẳm)
  if (opponent) {
    const oppRank = TIER_RANK_MAP[opponent.powerTier] || 1;
    const diff = clampedTier - oppRank;
    if (diff < 0) {
      // Giảm trừ hợp lý theo chênh lệch bậc (tối đa 25%)
      const mitigation = Math.min(0.25, Math.abs(diff) * 0.08);
      minDmg = Math.round(minDmg * (1 - mitigation));
      maxDmg = Math.round(maxDmg * (1 - mitigation));
    } else if (diff > 0) {
      // Xuyên giáp (tối đa 25%)
      const pen = Math.min(0.25, diff * 0.08);
      minDmg = Math.round(minDmg * (1 + pen));
      maxDmg = Math.round(maxDmg * (1 + pen));
    }
  }

  minDmg = Math.max(20, minDmg);
  maxDmg = Math.max(minDmg + 15, maxDmg);

  const display = `${minDmg} - ${maxDmg} DMG`;
  return { min: minDmg, max: maxDmg, display };
}

/**
 * =========================================================================
 * KHO KỸ NĂNG TẤN CÔNG TÁC CHIẾN (OFFENSIVE SKILL REPOSITORY)
 * Trích xuất toàn bộ kỹ năng tấn công ĐÃ HỌC, ĐÃ CÓ của nhân vật kèm chi phí tài nguyên
 * và dự tính sát thương minh bạch chuẩn xác.
 * =========================================================================
 */
export function getOffensiveSkillRepository(player: Character, opponent: Opponent): TurnChoice[] {
  const a = extractPlayerArsenal(player);
  const skills: TurnChoice[] = [];

  // =========================================================================
  // 1. DANH MỤC MA PHÁP TẤN CÔNG ĐÃ HỌC (TẤT CẢ CÁC CẤP BẬC ĐÃ ĐẠT ĐƯỢC)
  // =========================================================================

  // Hỏa Ma Pháp (1 -> 7)
  if (a.hasFire) {
    const rank = TIER_RANK_MAP[a.fireTier] || 1;
    if (rank >= 1) {
      skills.push({
        id: 'skill_fire_beginner',
        label: '[Ma Pháp Hỏa] Hỏa Cầu - Sơ cấp [5 MP]',
        actionText: `[Hỏa Cầu - Sơ cấp: 5 MP]: Ngưng tụ quả cầu lửa sơ cấp bắn thẳng vào mạn sườn của ${opponent.name}.`,
        riskLevel: 'safe',
        category: 'combat',
        combatBranch: 'A_OFFENSE',
        combatSubCategory: 'A1. Ma Pháp Tấn Công',
        combatTactic: 'kite_magic',
        costMp: 5,
        costStamina: 0,
        costTouki: 0,
        skillTier: 1,
        skillTierName: 'Sơ cấp (Beginner)',
        offensiveGroup: 'magic',
        offensiveSubCategory: 'skills',
      });
    }
    if (rank >= 2) {
      skills.push({
        id: 'skill_fire_inter',
        label: '[Ma Pháp Hỏa] Hỏa Pháo - Trung cấp [15 MP]',
        actionText: `[Hỏa Pháo - Trung cấp: 15 MP]: Nén áp suất ngọn lửa cực đại thành cột hỏa pháo bộc phá thiêu đốt ${opponent.name}.`,
        riskLevel: 'moderate',
        category: 'combat',
        combatBranch: 'A_OFFENSE',
        combatSubCategory: 'A1. Ma Pháp Tấn Công',
        combatTactic: 'kite_magic',
        costMp: 15,
        costStamina: 0,
        costTouki: 0,
        skillTier: 2,
        skillTierName: 'Trung cấp (Intermediate)',
        offensiveGroup: 'magic',
        offensiveSubCategory: 'skills',
      });
    }
    if (rank >= 3) {
      skills.push({
        id: 'skill_fire_adv',
        label: '[Ma Pháp Hỏa] Hỏa Diễm Bộc Phá - Thượng cấp [35 MP]',
        actionText: `[Hỏa Diễm Bộc Phá - Thượng cấp: 35 MP]: Giải phóng sóng nhiệt rực lửa diện rộng thiêu rụi lớp Đấu Khí bảo hộ của ${opponent.name}.`,
        riskLevel: 'dangerous',
        category: 'combat',
        combatBranch: 'A_OFFENSE',
        combatSubCategory: 'A1. Ma Pháp Tấn Công',
        combatTactic: 'kite_magic',
        costMp: 35,
        costStamina: 0,
        costTouki: 0,
        skillTier: 3,
        skillTierName: 'Thượng cấp (Advanced)',
        offensiveGroup: 'magic',
        offensiveSubCategory: 'skills',
      });
    }
    if (rank >= 4) {
      skills.push({
        id: 'skill_fire_saint',
        label: '[Ma Pháp Hỏa] Hỏa Phượng Hoàng - Thánh cấp [80 MP]',
        actionText: `[Hỏa Phượng Hoàng - Thánh cấp: 80 MP]: Triệu hồi chim phượng hoàng lửa bão táp giáng thế hủy diệt hoàn toàn ${opponent.name}!`,
        riskLevel: 'dangerous',
        category: 'combat',
        combatBranch: 'A_OFFENSE',
        combatSubCategory: 'A1. Ma Pháp Tấn Công',
        combatTactic: 'kite_magic',
        costMp: 80,
        costStamina: 0,
        costTouki: 0,
        skillTier: 4,
        skillTierName: 'Thánh cấp (Saint)',
        offensiveGroup: 'magic',
        offensiveSubCategory: 'skills',
      });
    }
    if (rank >= 5) {
      skills.push({
        id: 'skill_fire_king',
        label: '[Ma Pháp Hỏa] Hỏa Ngục Bộc Liệt - Vương cấp [120 MP]',
        actionText: `[Hỏa Ngục Bộc Liệt - Vương cấp: 120 MP]: Khởi tạo biển lửa dung nham thiêu đốt toàn bộ sinh lực của ${opponent.name}!`,
        riskLevel: 'fatal',
        category: 'combat',
        combatBranch: 'A_OFFENSE',
        combatSubCategory: 'A1. Ma Pháp Tấn Công',
        combatTactic: 'kite_magic',
        costMp: 120,
        costStamina: 0,
        costTouki: 0,
        skillTier: 5,
        skillTierName: 'Vương cấp (King)',
        offensiveGroup: 'magic',
        offensiveSubCategory: 'skills',
      });
    }
    if (rank >= 6) {
      skills.push({
        id: 'skill_fire_emperor',
        label: '[Ma Pháp Hỏa] Thái Dương Hỏa Tinh Cầu - Đế cấp [200 MP]',
        actionText: `[Thái Dương Hỏa Tinh Cầu - Đế cấp: 200 MP]: Nén quả cầu lửa tựa mặt trời thu nhỏ giáng đòn hủy diệt tuyệt đối lên ${opponent.name}!`,
        riskLevel: 'fatal',
        category: 'combat',
        combatBranch: 'A_OFFENSE',
        combatSubCategory: 'A1. Ma Pháp Tấn Công',
        combatTactic: 'kite_magic',
        costMp: 200,
        costStamina: 0,
        costTouki: 0,
        skillTier: 6,
        skillTierName: 'Đế cấp (Emperor)',
        offensiveGroup: 'magic',
        offensiveSubCategory: 'skills',
      });
    }
    if (rank >= 7) {
      skills.push({
        id: 'skill_fire_god',
        label: '[Ma Pháp Hỏa] Hỗn Độn Thần Hỏa - Thần cấp [350 MP]',
        actionText: `[Hỗn Độn Thần Hỏa - Thần cấp: 350 MP]: Hỏa diễm căn nguyên của thế giới thiêu rụi cả ma lực và quy luật vật lý của ${opponent.name}!`,
        riskLevel: 'fatal',
        category: 'combat',
        combatBranch: 'A_OFFENSE',
        combatSubCategory: 'A1. Ma Pháp Tấn Công',
        combatTactic: 'kite_magic',
        costMp: 350,
        costStamina: 0,
        costTouki: 0,
        skillTier: 7,
        skillTierName: 'Thần cấp (God)',
        offensiveGroup: 'magic',
        offensiveSubCategory: 'skills',
      });
    }
  }

  // Thủy Ma Pháp (1 -> 7)
  if (a.hasWater) {
    const rank = TIER_RANK_MAP[a.waterTier] || 1;
    if (rank >= 1) {
      skills.push({
        id: 'skill_water_beginner',
        label: '[Ma Pháp Thủy] Thủy Tiễn - Sơ cấp [5 MP]',
        actionText: `[Thủy Tiễn - Sơ cấp: 5 MP]: Bắn tia nước áp lực cao sắc bén xé gió hướng thẳng vào mắt ${opponent.name}.`,
        riskLevel: 'safe',
        category: 'combat',
        combatBranch: 'A_OFFENSE',
        combatSubCategory: 'A1. Ma Pháp Tấn Công',
        combatTactic: 'kite_magic',
        costMp: 5,
        costStamina: 0,
        costTouki: 0,
        skillTier: 1,
        skillTierName: 'Sơ cấp (Beginner)',
        offensiveGroup: 'magic',
        offensiveSubCategory: 'skills',
      });
    }
    if (rank >= 2) {
      skills.push({
        id: 'skill_water_inter',
        label: '[Ma Pháp Thủy] Băng Đạn Nén - Trung cấp [15 MP]',
        actionText: `[Băng Đạn Nén - Trung cấp: 15 MP]: Ngưng tụ và xoay tròn mũi tên băng nén áp suất cao xuyên phá khớp xương của ${opponent.name}.`,
        riskLevel: 'moderate',
        category: 'combat',
        combatBranch: 'A_OFFENSE',
        combatSubCategory: 'A1. Ma Pháp Tấn Công',
        combatTactic: 'kite_magic',
        costMp: 15,
        costStamina: 0,
        costTouki: 0,
        skillTier: 2,
        skillTierName: 'Trung cấp (Intermediate)',
        offensiveGroup: 'magic',
        offensiveSubCategory: 'skills',
      });
    }
    if (rank >= 3) {
      skills.push({
        id: 'skill_water_adv',
        label: '[Ma Pháp Thủy] Băng Long Xuyên Giáp - Thượng cấp [35 MP]',
        actionText: `[Băng Long Xuyên Giáp - Thượng cấp: 35 MP]: Phóng thích con rồng băng khổng lồ xoáy nát lớp giáp của ${opponent.name}.`,
        riskLevel: 'dangerous',
        category: 'combat',
        combatBranch: 'A_OFFENSE',
        combatSubCategory: 'A1. Ma Pháp Tấn Công',
        combatTactic: 'kite_magic',
        costMp: 35,
        costStamina: 0,
        costTouki: 0,
        skillTier: 3,
        skillTierName: 'Thượng cấp (Advanced)',
        offensiveGroup: 'magic',
        offensiveSubCategory: 'skills',
      });
    }
    if (rank >= 4) {
      skills.push({
        id: 'skill_water_saint',
        label: '[Ma Pháp Thủy] Bão Băng Tuyết Cumulonimbus - Thánh cấp [80 MP]',
        actionText: `[Bão Băng Tuyết Cumulonimbus - Thánh cấp: 80 MP]: Đóng băng toàn bộ không gian xung quanh ${opponent.name} thành vùng đất chết!`,
        riskLevel: 'dangerous',
        category: 'combat',
        combatBranch: 'A_OFFENSE',
        combatSubCategory: 'A1. Ma Pháp Tấn Công',
        combatTactic: 'kite_magic',
        costMp: 80,
        costStamina: 0,
        costTouki: 0,
        skillTier: 4,
        skillTierName: 'Thánh cấp (Saint)',
        offensiveGroup: 'magic',
        offensiveSubCategory: 'skills',
      });
    }
    if (rank >= 5) {
      skills.push({
        id: 'skill_water_king',
        label: '[Ma Pháp Thủy] Băng Phách Băng Hà - Vương cấp [120 MP]',
        actionText: `[Băng Phách Băng Hà - Vương cấp: 120 MP]: Đóng băng toàn bộ kinh mạch và huyết dịch của ${opponent.name} trong chớp mắt!`,
        riskLevel: 'fatal',
        category: 'combat',
        combatBranch: 'A_OFFENSE',
        combatSubCategory: 'A1. Ma Pháp Tấn Công',
        combatTactic: 'kite_magic',
        costMp: 120,
        costStamina: 0,
        costTouki: 0,
        skillTier: 5,
        skillTierName: 'Vương cấp (King)',
        offensiveGroup: 'magic',
        offensiveSubCategory: 'skills',
      });
    }
    if (rank >= 6) {
      skills.push({
        id: 'skill_water_emperor',
        label: '[Ma Pháp Thủy] Băng Hà Tuyệt Đối Chi Giới - Đế cấp [200 MP]',
        actionText: `[Băng Hà Tuyệt Đối Chi Giới - Đế cấp: 200 MP]: Không gian tiệm cận độ không tuyệt đối đông kết hoàn toàn ${opponent.name}!`,
        riskLevel: 'fatal',
        category: 'combat',
        combatBranch: 'A_OFFENSE',
        combatSubCategory: 'A1. Ma Pháp Tấn Công',
        combatTactic: 'kite_magic',
        costMp: 200,
        costStamina: 0,
        costTouki: 0,
        skillTier: 6,
        skillTierName: 'Đế cấp (Emperor)',
        offensiveGroup: 'magic',
        offensiveSubCategory: 'skills',
      });
    }
    if (rank >= 7) {
      skills.push({
        id: 'skill_water_god',
        label: '[Ma Pháp Thủy] Thủy Thần Chân Thủy - Thần cấp [350 MP]',
        actionText: `[Thủy Thần Chân Thủy - Thần cấp: 350 MP]: Đại hồng thủy nguyên thủy nuốt chửng hoàn toàn sinh mệnh của ${opponent.name}!`,
        riskLevel: 'fatal',
        category: 'combat',
        combatBranch: 'A_OFFENSE',
        combatSubCategory: 'A1. Ma Pháp Tấn Công',
        combatTactic: 'kite_magic',
        costMp: 350,
        costStamina: 0,
        costTouki: 0,
        skillTier: 7,
        skillTierName: 'Thần cấp (God)',
        offensiveGroup: 'magic',
        offensiveSubCategory: 'skills',
      });
    }
  }

  // Thổ Ma Pháp (1 -> 7)
  if (a.hasEarth) {
    const rank = TIER_RANK_MAP[a.earthTier] || 1;
    if (rank >= 1) {
      skills.push({
        id: 'skill_earth_beginner',
        label: '[Ma Pháp Thổ] Đạn Đá - Sơ cấp [5 MP]',
        actionText: `[Đạn Đá - Sơ cấp: 5 MP]: Bắn viên đạn đá đặc quánh tỷ trọng cao vào lồng ngực ${opponent.name}.`,
        riskLevel: 'safe',
        category: 'combat',
        combatBranch: 'A_OFFENSE',
        combatSubCategory: 'A1. Ma Pháp Tấn Công',
        combatTactic: 'kite_magic',
        costMp: 5,
        costStamina: 0,
        costTouki: 0,
        skillTier: 1,
        skillTierName: 'Sơ cấp (Beginner)',
        offensiveGroup: 'magic',
        offensiveSubCategory: 'skills',
      });
    }
    if (rank >= 2) {
      skills.push({
        id: 'skill_earth_inter',
        label: '[Ma Pháp Thổ] Bức Tường Đất Thép - Trung cấp [15 MP]',
        actionText: `[Bức Tường Đất Thép - Trung cấp: 15 MP]: Nâng vách đá dày cản phá đòn đánh rồi đổ ập đè nén ${opponent.name}.`,
        riskLevel: 'moderate',
        category: 'combat',
        combatBranch: 'A_OFFENSE',
        combatSubCategory: 'A1. Ma Pháp Tấn Công',
        combatTactic: 'kite_magic',
        costMp: 15,
        costStamina: 0,
        costTouki: 0,
        skillTier: 2,
        skillTierName: 'Trung cấp (Intermediate)',
        offensiveGroup: 'magic',
        offensiveSubCategory: 'skills',
      });
    }
    if (rank >= 3) {
      skills.push({
        id: 'skill_earth_adv',
        label: '[Ma Pháp Thổ] Địa Pháo Trọng Kích - Thượng cấp [35 MP]',
        actionText: `[Địa Pháo Trọng Kích - Thượng cấp: 35 MP]: Kích nổ cọc đá ngầm nặng hàng trăm cân nghiền nát xương cốt ${opponent.name}!`,
        riskLevel: 'dangerous',
        category: 'combat',
        combatBranch: 'A_OFFENSE',
        combatSubCategory: 'A1. Ma Pháp Tấn Công',
        combatTactic: 'kite_magic',
        costMp: 35,
        costStamina: 0,
        costTouki: 0,
        skillTier: 3,
        skillTierName: 'Thượng cấp (Advanced)',
        offensiveGroup: 'magic',
        offensiveSubCategory: 'skills',
      });
    }
    if (rank >= 4) {
      skills.push({
        id: 'skill_earth_saint',
        label: '[Ma Pháp Thổ] Địa Chấn Phá Thiên - Thánh cấp [90 MP]',
        actionText: `[Địa Chấn Phá Thiên - Thánh cấp: 90 MP]: Triệu hồi các mũi chông địa chấn khổng lồ xé toạc mặt đất dưới chân ${opponent.name}!`,
        riskLevel: 'fatal',
        category: 'combat',
        combatBranch: 'A_OFFENSE',
        combatSubCategory: 'A1. Ma Pháp Tấn Công',
        combatTactic: 'kite_magic',
        costMp: 90,
        costStamina: 0,
        costTouki: 0,
        skillTier: 4,
        skillTierName: 'Thánh cấp (Saint)',
        offensiveGroup: 'magic',
        offensiveSubCategory: 'skills',
      });
    }
    if (rank >= 5) {
      skills.push({
        id: 'skill_earth_king',
        label: '[Ma Pháp Thổ] Cương Nham Pháo Đài - Vương cấp [140 MP]',
        actionText: `[Cương Nham Pháo Đài - Vương cấp: 140 MP]: Hóa cứng cấu trúc đất đá thành hợp kim kim cương nghiền nát ${opponent.name}!`,
        riskLevel: 'fatal',
        category: 'combat',
        combatBranch: 'A_OFFENSE',
        combatSubCategory: 'A1. Ma Pháp Tấn Công',
        combatTactic: 'kite_magic',
        costMp: 140,
        costStamina: 0,
        costTouki: 0,
        skillTier: 5,
        skillTierName: 'Vương cấp (King)',
        offensiveGroup: 'magic',
        offensiveSubCategory: 'skills',
      });
    }
    if (rank >= 6) {
      skills.push({
        id: 'skill_earth_emperor',
        label: '[Ma Pháp Thổ] Trọng Lực Đại Địa Trụ - Đế cấp [220 MP]',
        actionText: `[Trọng Lực Đại Địa Trụ - Đế cấp: 220 MP]: Trụ đá thái cổ đè nén trọng lực gấp trăm lần nghiền nát Đấu Khí của ${opponent.name}!`,
        riskLevel: 'fatal',
        category: 'combat',
        combatBranch: 'A_OFFENSE',
        combatSubCategory: 'A1. Ma Pháp Tấn Công',
        combatTactic: 'kite_magic',
        costMp: 220,
        costStamina: 0,
        costTouki: 0,
        skillTier: 6,
        skillTierName: 'Đế cấp (Emperor)',
        offensiveGroup: 'magic',
        offensiveSubCategory: 'skills',
      });
    }
    if (rank >= 7) {
      skills.push({
        id: 'skill_earth_god',
        label: '[Ma Pháp Thổ] Lục Địa Sáng Thế Trảm - Thần cấp [380 MP]',
        actionText: `[Lục Địa Sáng Thế Trảm - Thần cấp: 380 MP]: Phân tách và dời non lấp biển toàn bộ mảng kiến tạo chôn vùi ${opponent.name}!`,
        riskLevel: 'fatal',
        category: 'combat',
        combatBranch: 'A_OFFENSE',
        combatSubCategory: 'A1. Ma Pháp Tấn Công',
        combatTactic: 'kite_magic',
        costMp: 380,
        costStamina: 0,
        costTouki: 0,
        skillTier: 7,
        skillTierName: 'Thần cấp (God)',
        offensiveGroup: 'magic',
        offensiveSubCategory: 'skills',
      });
    }
  }

  // Phong Ma Pháp (1 -> 7)
  if (a.hasWind) {
    const rank = TIER_RANK_MAP[a.windTier] || 1;
    if (rank >= 1) {
      skills.push({
        id: 'skill_wind_beginner',
        label: '[Ma Pháp Phong] Phong Nhận - Sơ cấp [5 MP]',
        actionText: `[Phong Nhận - Sơ cấp: 5 MP]: Chém ra lưỡi đao gió chân không trong suốt cắt rách da thịt ${opponent.name}.`,
        riskLevel: 'safe',
        category: 'combat',
        combatBranch: 'A_OFFENSE',
        combatSubCategory: 'A1. Ma Pháp Tấn Công',
        combatTactic: 'kite_magic',
        costMp: 5,
        costStamina: 0,
        costTouki: 0,
        skillTier: 1,
        skillTierName: 'Sơ cấp (Beginner)',
        offensiveGroup: 'magic',
        offensiveSubCategory: 'skills',
      });
    }
    if (rank >= 2) {
      skills.push({
        id: 'skill_wind_inter',
        label: '[Ma Pháp Phong] Phong Tiễn Xuyên Phá - Trung cấp [15 MP]',
        actionText: `[Phong Tiễn Xuyên Phá - Trung cấp: 15 MP]: Bắn chùm mũi tên gió áp suất cực lớn xé toạc luồng khí của ${opponent.name}.`,
        riskLevel: 'moderate',
        category: 'combat',
        combatBranch: 'A_OFFENSE',
        combatSubCategory: 'A1. Ma Pháp Tấn Công',
        combatTactic: 'kite_magic',
        costMp: 15,
        costStamina: 0,
        costTouki: 0,
        skillTier: 2,
        skillTierName: 'Trung cấp (Intermediate)',
        offensiveGroup: 'magic',
        offensiveSubCategory: 'skills',
      });
    }
    if (rank >= 3) {
      skills.push({
        id: 'skill_wind_adv',
        label: '[Ma Pháp Phong] Chân Không Trảm - Thượng cấp [35 MP]',
        actionText: `[Chân Không Trảm - Thượng cấp: 35 MP]: Chém đứt không khí tạo hố chân không cắt đứt cơ bắp của ${opponent.name}.`,
        riskLevel: 'dangerous',
        category: 'combat',
        combatBranch: 'A_OFFENSE',
        combatSubCategory: 'A1. Ma Pháp Tấn Công',
        combatTactic: 'kite_magic',
        costMp: 35,
        costStamina: 0,
        costTouki: 0,
        skillTier: 3,
        skillTierName: 'Thượng cấp (Advanced)',
        offensiveGroup: 'magic',
        offensiveSubCategory: 'skills',
      });
    }
    if (rank >= 4) {
      skills.push({
        id: 'skill_wind_saint',
        label: '[Ma Pháp Phong] Vòi Rồng Bão Tố - Thánh cấp [80 MP]',
        actionText: `[Vòi Rồng Bão Tố - Thánh cấp: 80 MP]: Cuộn xoáy vòi rồng chân không nghiền nát Đấu Khí của ${opponent.name}!`,
        riskLevel: 'fatal',
        category: 'combat',
        combatBranch: 'A_OFFENSE',
        combatSubCategory: 'A1. Ma Pháp Tấn Công',
        combatTactic: 'kite_magic',
        costMp: 80,
        costStamina: 0,
        costTouki: 0,
        skillTier: 4,
        skillTierName: 'Thánh cấp (Saint)',
        offensiveGroup: 'magic',
        offensiveSubCategory: 'skills',
      });
    }
    if (rank >= 5) {
      skills.push({
        id: 'skill_wind_king',
        label: '[Ma Pháp Phong] Cuồng Bão Diệt Thể - Vương cấp [130 MP]',
        actionText: `[Cuồng Bão Diệt Thể - Vương cấp: 130 MP]: Bão gió vận tốc siêu thanh cắt vụn mọi phòng tuyến của ${opponent.name}!`,
        riskLevel: 'fatal',
        category: 'combat',
        combatBranch: 'A_OFFENSE',
        combatSubCategory: 'A1. Ma Pháp Tấn Công',
        combatTactic: 'kite_magic',
        costMp: 130,
        costStamina: 0,
        costTouki: 0,
        skillTier: 5,
        skillTierName: 'Vương cấp (King)',
        offensiveGroup: 'magic',
        offensiveSubCategory: 'skills',
      });
    }
    if (rank >= 6) {
      skills.push({
        id: 'skill_wind_emperor',
        label: '[Ma Pháp Phong] Vô Cực Chân Không Giới - Đế cấp [210 MP]',
        actionText: `[Vô Cực Chân Không Giới - Đế cấp: 210 MP]: Không gian rút cạn dưỡng khí và triệt tiêu mọi ma lực của ${opponent.name}!`,
        riskLevel: 'fatal',
        category: 'combat',
        combatBranch: 'A_OFFENSE',
        combatSubCategory: 'A1. Ma Pháp Tấn Công',
        combatTactic: 'kite_magic',
        costMp: 210,
        costStamina: 0,
        costTouki: 0,
        skillTier: 6,
        skillTierName: 'Đế cấp (Emperor)',
        offensiveGroup: 'magic',
        offensiveSubCategory: 'skills',
      });
    }
    if (rank >= 7) {
      skills.push({
        id: 'skill_wind_god',
        label: '[Ma Pháp Phong] Thiên Phong Thần Trảm - Thần cấp [360 MP]',
        actionText: `[Thiên Phong Thần Trảm - Thần cấp: 360 MP]: Lưỡi đao gió chém đôi bầu khí quyển giáng đòn hủy diệt thần cấp lên ${opponent.name}!`,
        riskLevel: 'fatal',
        category: 'combat',
        combatBranch: 'A_OFFENSE',
        combatSubCategory: 'A1. Ma Pháp Tấn Công',
        combatTactic: 'kite_magic',
        costMp: 360,
        costStamina: 0,
        costTouki: 0,
        skillTier: 7,
        skillTierName: 'Thần cấp (God)',
        offensiveGroup: 'magic',
        offensiveSubCategory: 'skills',
      });
    }
  }

  // =========================================================================
  // 2. DANH MỤC KIẾM PHÁP TẤN CÔNG ĐÃ HỌC (TẤT CẢ CÁC CẤP BẬC ĐÃ ĐẠT ĐƯỢC)
  // =========================================================================

  // Kiếm Thần Phái (1 -> 7)
  if (a.hasSwordGod) {
    const rank = TIER_RANK_MAP[a.swordGodTier] || 1;
    if (rank >= 1) {
      skills.push({
        id: 'skill_sword_god_beginner',
        label: '[Kiếm Thần phái] Nhát Chém Bộc Tốc [8 Thể lực]',
        actionText: `[Nhát Chém Bộc Tốc - Kiếm Thần phái: 8 Thể lực]: Đạp mạnh đất bứt tốc vung kiếm chém sượt qua yết hầu ${opponent.name}.`,
        riskLevel: 'moderate',
        category: 'combat',
        combatBranch: 'A_OFFENSE',
        combatSubCategory: 'A2. Kiếm Pháp Tấn Công',
        combatTactic: 'rush',
        costMp: 0,
        costStamina: 8,
        costTouki: 0,
        skillTier: 1,
        skillTierName: 'Sơ cấp (Beginner)',
        offensiveGroup: 'sword',
        offensiveSubCategory: 'skills',
      });
    }
    if (rank >= 2) {
      skills.push({
        id: 'skill_sword_god_inter',
        label: '[Kiếm Thần phái] Kiếm Động (Nhất Kích Tuyệt Sát) [15 Thể lực]',
        actionText: `[Kiếm Động - Kiếm Thần phái: 15 Thể lực]: Hạ thấp trọng tâm dồn toàn lực vào cú rút kiếm chém xé toạc phòng tuyến của ${opponent.name}.`,
        riskLevel: 'dangerous',
        category: 'combat',
        combatBranch: 'A_OFFENSE',
        combatSubCategory: 'A2. Kiếm Pháp Tấn Công',
        combatTactic: 'rush',
        costMp: 0,
        costStamina: 15,
        costTouki: 0,
        skillTier: 2,
        skillTierName: 'Trung cấp (Intermediate)',
        offensiveGroup: 'sword',
        offensiveSubCategory: 'skills',
      });
    }
    if (rank >= 3) {
      skills.push({
        id: 'skill_sword_god_adv',
        label: '[Kiếm Thần phái] Kiếm Động Chấn Thần [25 Thể lực + 10 Đấu Khí]',
        actionText: `[Kiếm Động Chấn Thần - Kiếm Thần phái: 25 Thể lực + 10 Đấu Khí]: Bao bọc Đấu Khí quanh mũi kiếm, chém ra nhát kiếm phá vỡ giáp cốt ${opponent.name}.`,
        riskLevel: 'dangerous',
        category: 'combat',
        combatBranch: 'A_OFFENSE',
        combatSubCategory: 'A2. Kiếm Pháp Tấn Công',
        combatTactic: 'rush',
        costMp: 0,
        costStamina: 25,
        costTouki: 10,
        skillTier: 3,
        skillTierName: 'Thượng cấp (Advanced)',
        offensiveGroup: 'sword',
        offensiveSubCategory: 'skills',
      });
    }
    if (rank >= 4) {
      skills.push({
        id: 'skill_sword_god_saint',
        label: '[Kiếm Thần phái] Quang Chi Thái Đao [35 Thể lực + 20 Đấu Khí]',
        actionText: `[Quang Chi Thái Đao - Kiếm Thần phái: 35 Thể lực + 20 Đấu Khí]: Vung đường kiếm đạt vận tốc âm thanh/siêu thanh chém đứt không gian đoạt mạng ${opponent.name}!`,
        riskLevel: 'fatal',
        category: 'combat',
        combatBranch: 'A_OFFENSE',
        combatSubCategory: 'A2. Kiếm Pháp Tấn Công',
        combatTactic: 'rush',
        costMp: 0,
        costStamina: 35,
        costTouki: 20,
        skillTier: 4,
        skillTierName: 'Thánh cấp (Saint)',
        offensiveGroup: 'sword',
        offensiveSubCategory: 'skills',
      });
    }
    if (rank >= 5) {
      skills.push({
        id: 'skill_sword_god_king',
        label: '[Kiếm Thần phái] Vương Đãng Quang Tốc Kiếm [50 Thể lực + 30 Đấu Khí]',
        actionText: `[Vương Đãng Quang Tốc Kiếm - Kiếm Thần phái: 50 Thể lực + 30 Đấu Khí]: Đường kiếm siêu quang tốc vượt qua mọi phản xạ vật lý chém vỡ Đấu Khí của ${opponent.name}!`,
        riskLevel: 'fatal',
        category: 'combat',
        combatBranch: 'A_OFFENSE',
        combatSubCategory: 'A2. Kiếm Pháp Tấn Công',
        combatTactic: 'rush',
        costMp: 0,
        costStamina: 50,
        costTouki: 30,
        skillTier: 5,
        skillTierName: 'Vương cấp (King)',
        offensiveGroup: 'sword',
        offensiveSubCategory: 'skills',
      });
    }
    if (rank >= 6) {
      skills.push({
        id: 'skill_sword_god_emperor',
        label: '[Kiếm Thần phái] Quang Chi Thái Đao Cực Hạn [75 Thể lực + 50 Đấu Khí]',
        actionText: `[Quang Chi Thái Đao Cực Hạn - Kiếm Thần phái: 75 Thể lực + 50 Đấu Khí]: Vận tốc lưỡi kiếm tiệm cận tốc độ ánh sáng chia đôi chiến trường chém đứt ${opponent.name}!`,
        riskLevel: 'fatal',
        category: 'combat',
        combatBranch: 'A_OFFENSE',
        combatSubCategory: 'A2. Kiếm Pháp Tấn Công',
        combatTactic: 'rush',
        costMp: 0,
        costStamina: 75,
        costTouki: 50,
        skillTier: 6,
        skillTierName: 'Đế cấp (Emperor)',
        offensiveGroup: 'sword',
        offensiveSubCategory: 'skills',
      });
    }
    if (rank >= 7) {
      skills.push({
        id: 'skill_sword_god_god',
        label: '[Kiếm Thần phái] Thần Kiếm Trảm Đoạn Không Gian [100 Thể lực + 80 Đấu Khí]',
        actionText: `[Thần Kiếm Trảm Đoạn Không Gian - Kiếm Thần phái: 100 Thể lực + 80 Đấu Khí]: Nhát chém đạt cảnh giới tối thượng chém đứt cả thực tại và dòng chảy sinh mệnh của ${opponent.name}!`,
        riskLevel: 'fatal',
        category: 'combat',
        combatBranch: 'A_OFFENSE',
        combatSubCategory: 'A2. Kiếm Pháp Tấn Công',
        combatTactic: 'rush',
        costMp: 0,
        costStamina: 100,
        costTouki: 80,
        skillTier: 7,
        skillTierName: 'Thần cấp (God)',
        offensiveGroup: 'sword',
        offensiveSubCategory: 'skills',
      });
    }
  }

  // Thủy Thần Phái (1 -> 7)
  if (a.hasWaterGod) {
    const rank = TIER_RANK_MAP[a.waterGodTier] || 1;
    if (rank >= 1) {
      skills.push({
        id: 'skill_water_god_beginner',
        label: '[Thủy Thần phái] Lưu Thủy Nhu Kiếm [8 Thể lực]',
        actionText: `[Lưu Thủy Nhu Kiếm - Thủy Thần phái: 8 Thể lực]: Trượt kiếm nương theo đà chém của ${opponent.name} để đâm ngược vào nách.`,
        riskLevel: 'safe',
        category: 'combat',
        combatBranch: 'A_OFFENSE',
        combatSubCategory: 'A2. Kiếm Pháp Tấn Công',
        combatTactic: 'counter',
        costMp: 0,
        costStamina: 8,
        costTouki: 0,
        skillTier: 1,
        skillTierName: 'Sơ cấp (Beginner)',
        offensiveGroup: 'sword',
        offensiveSubCategory: 'skills',
      });
    }
    if (rank >= 2) {
      skills.push({
        id: 'skill_water_god_inter',
        label: '[Thủy Thần phái] Ba Đào Hóa Kính (Phản Đòn) [15 Thể lực + 5 Đấu Khí]',
        actionText: `[Ba Đào Hóa Kính - Thủy Thần phái: 15 Thể lực + 5 Đấu Khí]: Gạt chệch đòn đánh của ${opponent.name} rồi chém ngược yết hầu.`,
        riskLevel: 'safe',
        category: 'combat',
        combatBranch: 'A_OFFENSE',
        combatSubCategory: 'A2. Kiếm Pháp Tấn Công',
        combatTactic: 'counter',
        costMp: 0,
        costStamina: 15,
        costTouki: 5,
        skillTier: 2,
        skillTierName: 'Trung cấp (Intermediate)',
        offensiveGroup: 'sword',
        offensiveSubCategory: 'skills',
      });
    }
    if (rank >= 3) {
      skills.push({
        id: 'skill_water_god_adv',
        label: '[Thủy Thần phái] Lưu Đức Căn Bản [25 Thể lực + 10 Đấu Khí]',
        actionText: `[Lưu Đức Căn Bản - Thủy Thần phái: 25 Thể lực + 10 Đấu Khí]: Hóa kình phản chấn triệt tiêu toàn bộ đòn đánh của ${opponent.name} rồi chém dứt điểm.`,
        riskLevel: 'moderate',
        category: 'combat',
        combatBranch: 'A_OFFENSE',
        combatSubCategory: 'A2. Kiếm Pháp Tấn Công',
        combatTactic: 'counter',
        costMp: 0,
        costStamina: 25,
        costTouki: 10,
        skillTier: 3,
        skillTierName: 'Thượng cấp (Advanced)',
        offensiveGroup: 'sword',
        offensiveSubCategory: 'skills',
      });
    }
    if (rank >= 4) {
      skills.push({
        id: 'skill_water_god_saint',
        label: '[Thủy Thần phái] Lưu Đức Hoàn Mỹ [35 Thể lực + 20 Đấu Khí]',
        actionText: `[Lưu Đức Hoàn Mỹ - Thủy Thần phái: 35 Thể lực + 20 Đấu Khí]: Thế thủ bất khả xâm phạm, gạt phăng mọi đòn đánh của ${opponent.name} và phản kích chí mạng!`,
        riskLevel: 'dangerous',
        category: 'combat',
        combatBranch: 'A_OFFENSE',
        combatSubCategory: 'A2. Kiếm Pháp Tấn Công',
        combatTactic: 'counter',
        costMp: 0,
        costStamina: 35,
        costTouki: 20,
        skillTier: 4,
        skillTierName: 'Thánh cấp (Saint)',
        offensiveGroup: 'sword',
        offensiveSubCategory: 'skills',
      });
    }
    if (rank >= 5) {
      skills.push({
        id: 'skill_water_god_king',
        label: '[Thủy Thần phái] Thủy Kính Phản Sát [50 Thể lực + 30 Đấu Khí]',
        actionText: `[Thủy Kính Phản Sát - Thủy Thần phái: 50 Thể lực + 30 Đấu Khí]: Hoàn trả 200% toàn bộ sát thương của ${opponent.name} vào chính đối phương!`,
        riskLevel: 'fatal',
        category: 'combat',
        combatBranch: 'A_OFFENSE',
        combatSubCategory: 'A2. Kiếm Pháp Tấn Công',
        combatTactic: 'counter',
        costMp: 0,
        costStamina: 50,
        costTouki: 30,
        skillTier: 5,
        skillTierName: 'Vương cấp (King)',
        offensiveGroup: 'sword',
        offensiveSubCategory: 'skills',
      });
    }
    if (rank >= 6) {
      skills.push({
        id: 'skill_water_god_emperor',
        label: '[Thủy Thần phái] Vô Nhược Kiếm Vực [75 Thể lực + 50 Đấu Khí]',
        actionText: `[Vô Nhược Kiếm Vực - Thủy Thần phái: 75 Thể lực + 50 Đấu Khí]: Vùng phản đòn toàn phương vị 360 độ xé nát mọi đòn tấn công của ${opponent.name}!`,
        riskLevel: 'fatal',
        category: 'combat',
        combatBranch: 'A_OFFENSE',
        combatSubCategory: 'A2. Kiếm Pháp Tấn Công',
        combatTactic: 'counter',
        costMp: 0,
        costStamina: 75,
        costTouki: 50,
        skillTier: 6,
        skillTierName: 'Đế cấp (Emperor)',
        offensiveGroup: 'sword',
        offensiveSubCategory: 'skills',
      });
    }
    if (rank >= 7) {
      skills.push({
        id: 'skill_water_god_god',
        label: '[Thủy Thần phái] Bất Động Thần Vực [100 Thể lực + 80 Đấu Khí]',
        actionText: `[Bất Động Thần Vực - Thủy Thần phái: 100 Thể lực + 80 Đấu Khí]: Tuyệt đối không thể bị chạm tới, phản sát thần cấp đoạt mạng ${opponent.name}!`,
        riskLevel: 'fatal',
        category: 'combat',
        combatBranch: 'A_OFFENSE',
        combatSubCategory: 'A2. Kiếm Pháp Tấn Công',
        combatTactic: 'counter',
        costMp: 0,
        costStamina: 100,
        costTouki: 80,
        skillTier: 7,
        skillTierName: 'Thần cấp (God)',
        offensiveGroup: 'sword',
        offensiveSubCategory: 'skills',
      });
    }
  }

  // Bắc Thần Phái (1 -> 7)
  if (a.hasNorthGod) {
    const rank = TIER_RANK_MAP[a.northGodTier] || 1;
    if (rank >= 1) {
      skills.push({
        id: 'skill_north_god_beginner',
        label: '[Bắc Thần phái] Phi Đao Mê Tung & Tung Cát [8 Thể lực]',
        actionText: `[Phi Đao Mê Tung - Bắc Thần phái: 8 Thể lực]: Tung cát làm mờ mắt ${opponent.name} kết hợp ném phi đao chém đứt gân kheo.`,
        riskLevel: 'safe',
        category: 'combat',
        combatBranch: 'A_OFFENSE',
        combatSubCategory: 'A2. Kiếm Pháp Tấn Công',
        combatTactic: 'feint_north',
        costMp: 0,
        costStamina: 8,
        costTouki: 0,
        skillTier: 1,
        skillTierName: 'Sơ cấp (Beginner)',
        offensiveGroup: 'sword',
        offensiveSubCategory: 'skills',
      });
    }
    if (rank >= 2) {
      skills.push({
        id: 'skill_north_god_inter',
        label: '[Bắc Thần phái] Trọng Lực Biến Ảo Bộ Pháp [12 Thể lực + 5 Đấu Khí]',
        actionText: `[Trọng Lực Biến Ảo - Bắc Thần phái: 12 Thể lực + 5 Đấu Khí]: Trượt sát mặt đất luồn ra sau lưng ${opponent.name} chém vào tử huyệt.`,
        riskLevel: 'moderate',
        category: 'combat',
        combatBranch: 'A_OFFENSE',
        combatSubCategory: 'A2. Kiếm Pháp Tấn Công',
        combatTactic: 'feint_north',
        costMp: 0,
        costStamina: 12,
        costTouki: 5,
        skillTier: 2,
        skillTierName: 'Trung cấp (Intermediate)',
        offensiveGroup: 'sword',
        offensiveSubCategory: 'skills',
      });
    }
    if (rank >= 3) {
      skills.push({
        id: 'skill_north_god_adv',
        label: '[Bắc Thần phái] Bất Quy Tắc Loạn Vũ [20 Thể lực + 10 Đấu Khí]',
        actionText: `[Bất Quy Tắc Loạn Vũ - Bắc Thần phái: 20 Thể lực + 10 Đấu Khí]: Tung đòn chém chéo liên hoàn từ góc mù phá vỡ phòng tuyến ${opponent.name}.`,
        riskLevel: 'dangerous',
        category: 'combat',
        combatBranch: 'A_OFFENSE',
        combatSubCategory: 'A2. Kiếm Pháp Tấn Công',
        combatTactic: 'feint_north',
        costMp: 0,
        costStamina: 20,
        costTouki: 10,
        skillTier: 3,
        skillTierName: 'Thượng cấp (Advanced)',
        offensiveGroup: 'sword',
        offensiveSubCategory: 'skills',
      });
    }
    if (rank >= 4) {
      skills.push({
        id: 'skill_north_god_saint',
        label: '[Bắc Thần phái] Bắc Thần Biến Ảo (Đổi Tay Nghịch) [35 Thể lực + 20 Đấu Khí]',
        actionText: `[Bắc Thần Biến Ảo - Bắc Thần phái: 35 Thể lực + 20 Đấu Khí]: Đổi kiếm sang tay nghịch trong tích tắc tung nhát chém chí mạng vào ${opponent.name}!`,
        riskLevel: 'fatal',
        category: 'combat',
        combatBranch: 'A_OFFENSE',
        combatSubCategory: 'A2. Kiếm Pháp Tấn Công',
        combatTactic: 'feint_north',
        costMp: 0,
        costStamina: 35,
        costTouki: 20,
        skillTier: 4,
        skillTierName: 'Thánh cấp (Saint)',
        offensiveGroup: 'sword',
        offensiveSubCategory: 'skills',
      });
    }
    if (rank >= 5) {
      skills.push({
        id: 'skill_north_god_king',
        label: '[Bắc Thần phái] Trọng Lực Bạo Kích [50 Thể lực + 30 Đấu Khí]',
        actionText: `[Trọng Lực Bạo Kích - Bắc Thần phái: 50 Thể lực + 30 Đấu Khí]: Chém với trọng lực gấp chục lần nghiền nát vũ khí và giáp của ${opponent.name}!`,
        riskLevel: 'fatal',
        category: 'combat',
        combatBranch: 'A_OFFENSE',
        combatSubCategory: 'A2. Kiếm Pháp Tấn Công',
        combatTactic: 'feint_north',
        costMp: 0,
        costStamina: 50,
        costTouki: 30,
        skillTier: 5,
        skillTierName: 'Vương cấp (King)',
        offensiveGroup: 'sword',
        offensiveSubCategory: 'skills',
      });
    }
    if (rank >= 6) {
      skills.push({
        id: 'skill_north_god_emperor',
        label: '[Bắc Thần phái] Ảo Ảnh Tứ Diện [75 Thể lực + 50 Đấu Khí]',
        actionText: `[Ảo Ảnh Tứ Diện - Bắc Thần phái: 75 Thể lực + 50 Đấu Khí]: Tạo 4 phân thân thị giác ảo giác tấn công đồng thời xé toạc ${opponent.name}!`,
        riskLevel: 'fatal',
        category: 'combat',
        combatBranch: 'A_OFFENSE',
        combatSubCategory: 'A2. Kiếm Pháp Tấn Công',
        combatTactic: 'feint_north',
        costMp: 0,
        costStamina: 75,
        costTouki: 50,
        skillTier: 6,
        skillTierName: 'Đế cấp (Emperor)',
        offensiveGroup: 'sword',
        offensiveSubCategory: 'skills',
      });
    }
    if (rank >= 7) {
      skills.push({
        id: 'skill_north_god_god',
        label: '[Bắc Thần phái] Bắc Thần Vô Pháp [100 Thể lực + 80 Đấu Khí]',
        actionText: `[Bắc Thần Vô Pháp - Bắc Thần phái: 100 Thể lực + 80 Đấu Khí]: Đoạt mạng đối thủ bằng mọi giá, đòn kết liễu thần cấp tất sát ${opponent.name}!`,
        riskLevel: 'fatal',
        category: 'combat',
        combatBranch: 'A_OFFENSE',
        combatSubCategory: 'A2. Kiếm Pháp Tấn Công',
        combatTactic: 'feint_north',
        costMp: 0,
        costStamina: 100,
        costTouki: 80,
        skillTier: 7,
        skillTierName: 'Thần cấp (God)',
        offensiveGroup: 'sword',
        offensiveSubCategory: 'skills',
      });
    }
  }

  // =========================================================================
  // 3. KỸ NĂNG MA ĐAO & KẾT HỢP
  // =========================================================================
  if (a.hasElementalCoating || ((a.hasFire || a.hasWater || a.hasWind) && (a.hasSwordGod || a.hasWaterGod || a.hasNorthGod))) {
    skills.push({
      id: 'skill_combo_magic_sword',
      label: '[Ma Kiếm Kết Hợp] Hỏa / Băng Kiếm Trảm [8 MP + 10 Thể lực]',
      actionText: `[Ma Kiếm Trảm: 8 MP + 10 Thể lực]: Truyền luồng Mana rực cháy vào thân kiếm chém phát nổ lớp vảy của ${opponent.name}.`,
      riskLevel: 'moderate',
      category: 'combat',
      combatBranch: 'A_OFFENSE',
      combatSubCategory: 'A3. Kỹ Năng Kết Hợp / Tự Chế',
      combatTactic: 'hybrid_magic',
      costMp: 8,
      costStamina: 10,
      costTouki: 5,
      skillTier: 2,
      offensiveGroup: 'sword',
      offensiveSubCategory: 'skills',
    });
  }

  if (a.hasFire && a.hasWind) {
    skills.push({
      id: 'skill_combo_firestorm',
      label: '[Ma Pháp Ghép] Lốc Xoáy Bão Lửa (Firestorm) [25 MP]',
      actionText: `[Lốc Xoáy Bão Lửa: 25 MP]: Kết hợp Hỏa và Phong cuộn trào cột lửa xoáy bọc kín ${opponent.name}.`,
      riskLevel: 'moderate',
      category: 'combat',
      combatBranch: 'A_OFFENSE',
      combatSubCategory: 'A1. Ma Pháp Tấn Công',
      combatTactic: 'hybrid_magic',
      costMp: 25,
      costStamina: 0,
      costTouki: 0,
      skillTier: 3,
      offensiveGroup: 'magic',
      offensiveSubCategory: 'skills',
    });
  }

  if (a.hasFire && a.hasEarth) {
    skills.push({
      id: 'skill_combo_magma',
      label: '[Ma Pháp Ghép] Nham Thạch Nổ (Magma Blast) [25 MP]',
      actionText: `[Nham Thạch Nổ: 25 MP]: Hòa tan đất đá bằng nhiệt độ cực hạn tạo khối dung nham nổ tung vào ngực ${opponent.name}.`,
      riskLevel: 'moderate',
      category: 'combat',
      combatBranch: 'A_OFFENSE',
      combatSubCategory: 'A1. Ma Pháp Tấn Công',
      combatTactic: 'hybrid_magic',
      costMp: 25,
      costStamina: 0,
      costTouki: 0,
      skillTier: 3,
      offensiveGroup: 'magic',
      offensiveSubCategory: 'skills',
    });
  }

  if (a.hasWater && a.hasWind) {
    skills.push({
      id: 'skill_combo_lightning',
      label: '[Ma Pháp Ghép] Sét Nổ Xuyên Phá (Electric Shock) [30 MP]',
      actionText: `[Sét Nổ Xuyên Phá: 30 MP]: Tích tụ điện tích từ luồng hơi nước và gió tạo tia sét xé toạc Đấu Khí của ${opponent.name}.`,
      riskLevel: 'moderate',
      category: 'combat',
      combatBranch: 'A_OFFENSE',
      combatSubCategory: 'A1. Ma Pháp Tấn Công',
      combatTactic: 'hybrid_magic',
      costMp: 30,
      costStamina: 0,
      costTouki: 0,
      skillTier: 3,
      offensiveGroup: 'magic',
      offensiveSubCategory: 'skills',
    });
  }

  if (a.hasForesightEye) {
    skills.push({
      id: 'skill_combo_foresight',
      label: '[Ma Nhãn] Dự Tri Nhãn Bắt Bài Tử Huyệt [10 MP + 5 Thể lực]',
      actionText: `[Dự Tri Nhãn: 10 MP + 5 Thể lực]: Mở rộng Ma Nhãn nhìn trước tương lai 1 giây, lách người đâm trúng tử huyệt ${opponent.name}!`,
      riskLevel: 'safe',
      category: 'combat',
      combatBranch: 'A_OFFENSE',
      combatSubCategory: 'A3. Kỹ Năng Kết Hợp / Tự Chế',
      costMp: 10,
      costStamina: 5,
      costTouki: 0,
      skillTier: 3,
      offensiveGroup: 'sword',
      offensiveSubCategory: 'skills',
    });
  }

  return skills.map(s => {
    const dmg = calculateSkillDamageRange(
      player,
      s.skillTier || 1,
      s.offensiveGroup || 'sword',
      s.costMp || 0,
      s.costStamina || 0,
      s.costTouki || 0,
      opponent
    );
    return {
      ...s,
      estimatedDamage: { min: dmg.min, max: dmg.max },
      damageDisplay: dmg.display,
      combatRole: 'attack' as const,
      combatBranch: 'A_OFFENSE' as const,
    };
  });
}

/**
 * Danh sách đòn đánh thường & thế đòn cơ bản (Luôn thuộc nhóm Tấn Công)
 */
export function getBasicAttacks(player: Character, opponent: Opponent): TurnChoice[] {
  const mainWeapon = player.equipment?.leftHand?.name || player.equipment?.rightHand?.name || 'Thanh kiếm sắt';
  
  const slashDmg = calculateSkillDamageRange(player, 1, 'basic', 0, 5, 0, opponent);
  const kickDmg = calculateSkillDamageRange(player, 1, 'basic', 0, 5, 0, opponent);
  const pommelDmg = calculateSkillDamageRange(player, 1, 'basic', 0, 3, 0, opponent);

  const attacks: TurnChoice[] = [
    {
      id: 'basic_slash',
      label: `⚔️ [Tấn Công: Đòn Thường] Vung [${mainWeapon}] Chém Thẳng [5 Thể lực]`,
      actionText: `[Tấn Công: 5 Thể lực]: Vung ${mainWeapon} chém một nhát trực diện vào sơ hở của ${opponent.name}.`,
      riskLevel: 'safe',
      category: 'combat',
      combatBranch: 'A_OFFENSE',
      combatRole: 'attack',
      combatSubCategory: '2. Đòn Đánh Thường Cơ Bản',
      costMp: 0,
      costStamina: 5,
      costTouki: 0,
      skillTier: 1,
      estimatedDamage: { min: slashDmg.min, max: slashDmg.max },
      damageDisplay: slashDmg.display,
      offensiveGroup: 'basic',
      offensiveSubCategory: 'basic',
    },
    {
      id: 'basic_kick',
      label: '⚔️ [Tấn Công: Đòn Thường] Cú Đấm / Đá Hạ Bàn Đoạt Đà [5 Thể lực]',
      actionText: `[Tấn Công: 5 Thể lực]: Hạ thấp người tung cú đá quét vào ống quyển chân của ${opponent.name} làm mất thăng bằng.`,
      riskLevel: 'safe',
      category: 'combat',
      combatBranch: 'A_OFFENSE',
      combatRole: 'attack',
      combatSubCategory: '2. Đòn Đánh Thường Cơ Bản',
      costMp: 0,
      costStamina: 5,
      costTouki: 0,
      skillTier: 1,
      estimatedDamage: { min: kickDmg.min, max: kickDmg.max },
      damageDisplay: kickDmg.display,
      offensiveGroup: 'basic',
      offensiveSubCategory: 'basic',
    },
    {
      id: 'basic_pommel',
      label: '⚔️ [Tấn Công: Đòn Thường] Vung Cán Vũ Khí Cản Bước [3 Thể lực]',
      actionText: `[Tấn Công: 3 Thể lực]: Đập chuôi/cán vũ khí vào cằm ${opponent.name} để đẩy lùi đối thủ.`,
      riskLevel: 'safe',
      category: 'combat',
      combatBranch: 'A_OFFENSE',
      combatRole: 'attack',
      combatSubCategory: '2. Đòn Đánh Thường Cơ Bản',
      costMp: 0,
      costStamina: 3,
      costTouki: 0,
      skillTier: 1,
      estimatedDamage: { min: pommelDmg.min, max: pommelDmg.max },
      damageDisplay: pommelDmg.display,
      offensiveGroup: 'basic',
      offensiveSubCategory: 'basic',
    },
  ];
  return attacks;
}

/**
 * Menu cấp con của [MỤC A: TẤN CÔNG]
 */
export function getP2OffensiveMenuChoices(player: Character, opponent: Opponent): TurnChoice[] {
  const repo = getOffensiveSkillRepository(player, opponent);
  return [
    {
      id: 'p2_sub_skills',
      label: `⚔️ 1) [Skills Tấn Công (Kỹ năng đã học)] - Xem ${repo.length} chiêu thức đã mở khóa`,
      actionText: `!p2_skills`,
      riskLevel: 'safe',
      category: 'combat',
      combatBranch: 'A_OFFENSE',
      combatRole: 'menu',
      combatSubCategory: 'Menu Cấp Con Mục A',
      offensiveSubCategory: 'skills',
    },
    {
      id: 'p2_sub_basic',
      label: '⚔️ 2) [Đòn Đánh Thường / Thế Đánh Cơ Bản] - Chém, đấm, đá cơ bản',
      actionText: `!p2_basic`,
      riskLevel: 'safe',
      category: 'combat',
      combatBranch: 'A_OFFENSE',
      combatRole: 'menu',
      combatSubCategory: 'Menu Cấp Con Mục A',
      offensiveSubCategory: 'basic',
    },
    {
      id: 'p2_sub_custom',
      label: '⚔️ 3) [Hành Động Tùy Ý / Biến Tấu Chiến Thuật] - Nhập tự do chiến thuật',
      actionText: `!custom_action`,
      riskLevel: 'safe',
      category: 'combat',
      combatBranch: 'A_OFFENSE',
      combatRole: 'menu',
      combatSubCategory: 'Menu Cấp Con Mục A',
      offensiveSubCategory: 'custom',
    },
  ];
}

/**
 * =========================================================================
 * NHÓM 1: HỒI PHỤC VÀ TRỊ LIỆU (HEALING & RECOVERY)
 * Chỉ khép vết thương, cầm máu và hồi lại Sinh lực. 
 * Tuyệt đối không gây sát thương lên kẻ địch hay bản thân.
 * =========================================================================
 */
export function getHealingChoices(player: Character, opponent: Opponent): TurnChoice[] {
  const a = extractPlayerArsenal(player);
  const choices: TurnChoice[] = [];

  // 1. Ma pháp Trị liệu (nếu đã học)
  if (a.hasHealing) {
    const tier = player.magic.healing;
    const rank = TIER_RANK_MAP[tier] || 1;
    const costMp = rank >= 4 ? 50 : rank === 3 ? 35 : rank === 2 ? 18 : 8;
    const healVal = rank >= 4 ? 150 : rank === 3 ? 80 : rank === 2 ? 45 : 25;
    choices.push({
      id: 'p2_heal_magic',
      label: `💖 [Hồi Phục & Trị Liệu] Ma Pháp Trị Liệu [${tier}] (+${healVal} HP) [${costMp} MP]`,
      actionText: `[Hồi Phục & Trị Liệu: ${costMp} MP]: Vận dụng ma pháp Trị liệu cấp ${tier} bao phủ miệng vết thương rách thịt, nhanh chóng khép vảy, cầm máu và hồi sinh lực!`,
      riskLevel: 'safe',
      category: 'magic',
      combatBranch: 'B_DEFENSE',
      combatRole: 'healing',
      combatSubCategory: 'Nhóm Hồi Phục & Trị Liệu',
      costMp,
      costStamina: 0,
      costTouki: 0,
      healHp: healVal,
    });
  }

  // 2. Ma pháp Giải độc & Thanh tẩy (nếu có)
  if (a.hasDetox) {
    choices.push({
      id: 'p2_heal_detox',
      label: `💖 [Hồi Phục & Trị Liệu] Ma Pháp Giải Độc / Thanh Tẩy [${player.magic.detox}] (+15 HP) [10 MP]`,
      actionText: `[Hồi Phục & Trị Liệu: 10 MP]: Vận chuyển dòng Mana thanh tẩy kinh mạch, trung hòa nọc độc và thanh lọc độc tố của ${opponent.name}!`,
      riskLevel: 'safe',
      category: 'magic',
      combatBranch: 'B_DEFENSE',
      combatRole: 'healing',
      combatSubCategory: 'Nhóm Hồi Phục & Trị Liệu',
      costMp: 10,
      costStamina: 0,
      costTouki: 0,
      healHp: 15,
    });
  }

  // 3. Nuốt dược thảo / Thảo mộc trong túi đồ (nếu có)
  if (a.healingHerbs.length > 0) {
    const herb = a.healingHerbs[0];
    choices.push({
      id: 'p2_heal_herb',
      label: `💖 [Hồi Phục & Trị Liệu] Cắn Dược Thảo: Dùng [${herb.name}] (+35 HP, +15 Thể Lực) [0 MP]`,
      actionText: `[Hồi Phục & Trị Liệu: 1 Dược thảo]: Rút [${herb.name}] từ túi đồ nuốt khẩn cấp, dòng dược lực giúp lành vết thương và phục hồi thể lực!`,
      riskLevel: 'safe',
      category: 'combat',
      combatBranch: 'B_DEFENSE',
      combatRole: 'healing',
      combatSubCategory: 'Nhóm Hồi Phục & Trị Liệu',
      costMp: 0,
      costStamina: 0,
      costTouki: 0,
      healHp: 35,
      healStamina: 15,
    });
  }

  // 4. Sơ cứu băng bó dã chiến (Luôn khả dụng để không bao giờ bị bế tắc khi cạn mana)
  choices.push({
    id: 'p2_heal_bandage',
    label: '💖 [Hồi Phục & Trị Liệu] Sơ Cứu Băng Bó Dã Chiến: Ép Vết Thương Cầm Máu (+15 HP) [5 Thể Lực]',
    actionText: '[Hồi Phục & Trị Liệu: 5 Thể lực]: Xé gấu áo siết chặt miệng vết thương đang rỉ máu, nén đau đớn cố định cơ bắp để hồi lại sinh lực!',
    riskLevel: 'safe',
    category: 'combat',
    combatBranch: 'B_DEFENSE',
    combatRole: 'healing',
    combatSubCategory: 'Nhóm Hồi Phục & Trị Liệu',
    costMp: 0,
    costStamina: 5,
    costTouki: 0,
    healHp: 15,
  });

  return choices;
}

/**
 * =========================================================================
 * NHÓM 2: PHÒNG THỦ (DEFENSE)
 * Chỉ chặn đòn, dựng khiên, bọc đấu khí chịu lực hoặc né tránh để giảm sát thương.
 * Tuyệt đối không làm kẻ địch mất máu. 
 * Đòn phản công chỉ kích hoạt sau khi đã hóa giải đòn của địch thành công.
 * =========================================================================
 */
export function getDefenseChoices(player: Character, opponent: Opponent): TurnChoice[] {
  const a = extractPlayerArsenal(player);
  const choices: TurnChoice[] = [];

  // 1. Phản đòn Thủy Thần (nếu học Thủy Thần phái)
  if (a.hasWaterGod) {
    choices.push({
      id: 'p2_def_watergod_parry',
      label: `🛡️ [Phòng Thủ & Hóa Giải] Phản Đòn Thủy Thần (${a.waterGodTier}): Hóa Kình Gạt Phăng Vũ Khí [8 Thể Lực]`,
      actionText: '[Phòng Thủ & Hóa Giải: 8 Thể lực]: Trượt mũi kiếm theo đà chém của địch, triệt tiêu 100% lực đòn đánh và gạt văng vũ khí làm đối thủ mất đà lộ sơ hở lớn (Không làm địch mất máu lượt này, kích hoạt lợi thế phản kích lượt sau)!',
      riskLevel: 'safe',
      category: 'sword',
      combatBranch: 'B_DEFENSE',
      combatRole: 'defense',
      combatSubCategory: 'Nhóm Phòng Thủ',
      combatTactic: 'counter',
      costMp: 0,
      costStamina: 8,
      costTouki: 0,
    });
  }

  // 2. Đỡ đòn bằng Khiên / Vũ khí phụ (nếu có)
  if (a.hasShieldOrSubWeapon) {
    choices.push({
      id: 'p2_def_shield_block',
      label: '🛡️ [Phòng Thủ & Giảm Sát Thương] Dựng Khiên / Vũ Khí Phụ Chặn Đòn Trực Diện [8 Thể Lực]',
      actionText: 'Đưa mặt khiên/vũ khí phụ ra chặn đứng đòn đánh trực diện, ghìm chặt vũ khí kẻ địch để triệt tiêu toàn bộ sát thương!',
      riskLevel: 'safe',
      category: 'combat',
      combatBranch: 'B_DEFENSE',
      combatRole: 'defense',
      costMp: 0,
      costStamina: 8,
      costTouki: 0,
    });
  }

  // 3. Kết Giới Ma Thuật (nếu có Ma pháp Kết Giới)
  if (a.hasBarrier) {
    choices.push({
      id: 'p2_def_barrier',
      label: `🛡️ [Phòng Thủ & Giảm Sát Thương] Kết Giới Ma Thuật [${player.magic.barrier}]: Dựng Màng Chắn Bảo Hộ [15 MP]`,
      actionText: 'Dựng màng kết giới ma thuật ngũ giác trong suốt bao bọc xung quanh, miễn nhiễm 100% sát thương đòn đánh của địch!',
      riskLevel: 'safe',
      category: 'magic',
      combatBranch: 'B_DEFENSE',
      combatRole: 'defense',
      costMp: 15,
      costStamina: 0,
      costTouki: 0,
    });
  }

  // 4. Bọc Đấu Khí chịu lực (nếu có Touki)
  if (a.toukiStat >= 20 || a.hasToukiSurge) {
    choices.push({
      id: 'p2_def_touki_hardening',
      label: '🛡️ [Phòng Thủ & Giảm Sát Thương] Bọc Đấu Khí Chịu Lực: Triệt Tiêu Va Đập & Phản Lực [6 Thể Lực]',
      actionText: 'Vận chuyển Đấu Khí bọc quanh thân thể thành màng bảo vệ, gồng mình triệt tiêu xung chấn và bảo vệ tạng phủ!',
      riskLevel: 'safe',
      category: 'combat',
      combatBranch: 'B_DEFENSE',
      combatRole: 'defense',
      costMp: 0,
      costStamina: 6,
      costTouki: 0,
    });
  }

  // 5. Bộ Pháp Né Đòn & Lướt Kéo Giãn Cự Ly (Luôn khả dụng)
  choices.push({
    id: 'p2_def_dodge_kite',
    label: '🛡️ [Phòng Thủ & Né Đòn] Bộ Pháp Né Đòn: Uốn Người Lùi 5m Thoát Cận Chiến [5 Thể Lực]',
    actionText: 'Nhún chân búng người lùi nhanh 5-7 mét về phía sau, né tránh cú vồ/nhát chém và kéo giãn cự ly an toàn!',
    riskLevel: 'safe',
    category: 'combat',
    combatBranch: 'B_DEFENSE',
    combatRole: 'defense',
    combatTactic: 'kite_magic',
    costMp: 0,
    costStamina: 5,
    costTouki: 0,
  });

  return choices;
}

/**
 * =========================================================================
 * NHÓM 3: CƯỜNG HÓA VÀ HỖ TRỢ (BUFF & SUPPORT)
 * Chỉ tăng tạm thời độ dày Đấu khí, tốc độ phản xạ hoặc sức mạnh cho các lượt đánh kế tiếp.
 * Tuyệt đối không gây sát thương tức thì khi kích hoạt.
 * =========================================================================
 */
export function getBuffChoices(player: Character, opponent: Opponent): TurnChoice[] {
  const a = extractPlayerArsenal(player);
  const choices: TurnChoice[] = [];

  // 1. Bộc Phát Đấu Khí (Touki Surge)
  if (a.hasToukiSurge) {
    choices.push({
      id: 'p2_buff_touki_surge',
      label: '⚡ [Cường Hóa & Hỗ Trợ] Bộc Phát Đấu Khí (Touki Surge): Cường Hóa Giáp & Lực Đánh (+20 Touki) [10 Thể Lực / 5 MP]',
      actionText: '[Cường Hóa & Hỗ Trợ: 10 Thể lực, 5 MP]: Bộc phát luồng Đấu Khí vô hình bao bọc toàn thân, tăng độ dày phòng hộ và sức mạnh cho các lượt đánh sau (Không gây sát thương tức thì)!',
      riskLevel: 'safe',
      category: 'combat',
      combatBranch: 'B_DEFENSE',
      combatRole: 'buff',
      costMp: 5,
      costStamina: 10,
      costTouki: 0,
      buffTouki: 20,
    });
  }

  // 2. Thể Thuật Thú Tộc (Beast Martial)
  if (a.hasBeastMartial) {
    choices.push({
      id: 'p2_buff_beast_martial',
      label: '⚡ [Cường Hóa & Hỗ Trợ] Bản Năng Thú Tộc: Thức Tỉnh Phản Xạ & Tốc Độ (+15 Phản Xạ) [8 Thể Lực]',
      actionText: '[Cường Hóa & Hỗ Trợ: 8 Thể lực]: Kích hoạt bản năng dã thú trong huyết quản, tăng mạnh tốc độ phản xạ né đòn và chuẩn bị góc phản kích!',
      riskLevel: 'safe',
      category: 'combat',
      combatBranch: 'B_DEFENSE',
      combatRole: 'buff',
      costMp: 0,
      costStamina: 8,
      costTouki: 0,
      buffReflex: 15,
    });
  }

  // 3. Ma Nhãn (Dự Tri Nhãn / Ma Lực Nhãn)
  if (a.hasForesightEye) {
    choices.push({
      id: 'p2_buff_foresight_eye',
      label: '⚡ [Cường Hóa & Hỗ Trợ] Kích Hoạt Dự Tri Nhãn: Nhìn Trước 2 Giây Quỹ Đạo Đòn Đánh [8 MP]',
      actionText: '[Cường Hóa & Hỗ Trợ: 8 MP]: Mở Dự Tri Nhãn, đọc trước tương lai gần 2 giây để đòn tấn công ở lượt sau chắc chắn trúng tử huyệt đối thủ!',
      riskLevel: 'safe',
      category: 'magic',
      combatBranch: 'B_DEFENSE',
      combatRole: 'buff',
      costMp: 8,
      costStamina: 0,
      costTouki: 0,
    });
  }

  // 4. Kích Hoạt Bùa Hộ Mệnh (nếu có amulets)
  if (a.equippedAmulets.length > 0) {
    const amulet = a.equippedAmulets[0];
    choices.push({
      id: 'p2_buff_amulet',
      label: `⚡ [Cường Hóa & Hỗ Trợ] Kích Hoạt Bùa Hộ Mệnh [${amulet.name}]: Dựng Màng Bảo Hộ Phụ Trợ [4 MP]`,
      actionText: `[Cường Hóa & Hỗ Trợ: 4 MP]: Dẫn truyền tia Mana kích hoạt bùa hộ mệnh [${amulet.name}], gia tăng lực phòng ngự bổ trợ!`,
      riskLevel: 'safe',
      category: 'combat',
      combatBranch: 'B_DEFENSE',
      combatRole: 'buff',
      costMp: 4,
      costStamina: 0,
      costTouki: 0,
    });
  }

  // 5. Định Tâm Vận Khí & Điều Hòa Hơi Thở (Luôn khả dụng)
  choices.push({
    id: 'p2_buff_focus_breath',
    label: '⚡ [Cường Hóa & Hỗ Trợ] Định Tâm Vận Khí: Điều Hòa Hơi Thở & Tích Tụ Sức Mạnh (+10 Thể Lực) [0 Tiêu hao]',
    actionText: '[Cường Hóa & Hỗ Trợ: 0 Tiêu hao]: Hạ thấp nhịp thở, điều hòa dòng chảy Mana và Đấu Khí, hồi phục thể lực và chuẩn bị cho đợt công kích quyết định!',
    riskLevel: 'safe',
    category: 'combat',
    combatBranch: 'B_DEFENSE',
    combatRole: 'buff',
    costMp: 0,
    costStamina: 0,
    costTouki: 0,
    healStamina: 10,
  });

  return choices;
}

/**
 * =========================================================================
 * NHÓM 5: BỎ CHẠY (FLEE / ESCAPE)
 * Chỉ tính toán khả năng tẩu thoát dựa trên độ Nhanh nhẹn đôi bên, không gây sát thương.
 * =========================================================================
 */
export function getFleeChoices(player: Character, opponent: Opponent): TurnChoice[] {
  const a = extractPlayerArsenal(player);
  const escapeRate = calculateEscapeChance(player, opponent, a.hasEarth || a.hasWater);
  return [
    {
      id: 'p2_c_flee',
      label: `🏃 [Bỏ Chạy] Đào Tẩu Khẩn Cấp (Tỷ lệ thoát: ${escapeRate}%)`,
      actionText: `[Bỏ Chạy: Tỷ lệ ${escapeRate}%]: Quay người bứt tốc tháo chạy, ném cát bụi và chướng ngại vật cản đường để thoát khỏi giao tranh! (Nếu thất bại sẽ bị hở lưng và nhận đòn chí mạng)`,
      riskLevel: escapeRate >= 60 ? 'moderate' : 'dangerous',
      category: 'combat',
      combatBranch: 'C_RETREAT',
      combatRole: 'flee',
      combatSubCategory: 'Nhóm Bỏ Chạy',
      combatTactic: 'retreat',
    }
  ];
}

/**
 * Sinh danh sách lựa chọn cho GIAI ĐOẠN 2: VA CHẠM & BỨC ÁP (P2)
 * Chuẩn hóa rõ ràng 5 vai trò:
 * 1) Nhóm Hồi Phục & Trị Liệu (Healing)
 * 2) Nhóm Phòng Thủ & Né Đòn (Defense)
 * 3) Nhóm Cường Hóa & Hỗ Trợ (Buff)
 * 4) Nhóm Tấn Công (Attack)
 * 5) Nhóm Bỏ Chạy (Flee)
 */
export function generatePhase2Choices(
  player: Character, 
  opponent: Opponent, 
  activeBranch: 'all' | 'offense' | 'defense' | 'healing' | 'buff' | 'retreat' = 'all',
  offensiveSubMenu: 'menu' | 'skills' | 'basic' | 'custom' = 'skills'
): TurnChoice[] {
  const choices: TurnChoice[] = [];

  if (activeBranch === 'healing') {
    return getHealingChoices(player, opponent);
  }

  if (activeBranch === 'defense') {
    return getDefenseChoices(player, opponent);
  }

  if (activeBranch === 'buff') {
    return getBuffChoices(player, opponent);
  }

  if (activeBranch === 'retreat') {
    return getFleeChoices(player, opponent);
  }

  if (activeBranch === 'offense') {
    if (offensiveSubMenu === 'skills') {
      const skills = getOffensiveSkillRepository(player, opponent);
      choices.push(...skills);
      choices.push({
        id: 'p2_to_basic',
        label: '⚔️ 2) [Đòn Đánh Thường]: Chuyển sang thế đánh thường cơ bản',
        actionText: '!p2_basic',
        riskLevel: 'safe',
        category: 'combat',
        combatBranch: 'A_OFFENSE',
        combatRole: 'menu',
        combatSubCategory: '2. Đòn Đánh Thường Cơ Bản',
        offensiveSubCategory: 'basic',
      });
    } else if (offensiveSubMenu === 'basic') {
      const basicList = getBasicAttacks(player, opponent);
      choices.push(...basicList);
      choices.push({
        id: 'p2_to_skills',
        label: '⚔️ 1) [Skills Tấn Công]: Mở kho kỹ năng ma pháp / kiếm thuật đã học',
        actionText: '!p2_skills',
        riskLevel: 'safe',
        category: 'combat',
        combatBranch: 'A_OFFENSE',
        combatRole: 'menu',
        combatSubCategory: '1. Skills Tấn Công',
        offensiveSubCategory: 'skills',
      });
    } else {
      const subMenus = getP2OffensiveMenuChoices(player, opponent);
      choices.push(...subMenus);
      const skills = getOffensiveSkillRepository(player, opponent);
      choices.push(...skills);
    }
    return choices;
  }

  // activeBranch === 'all': Cung cấp đầy đủ và đại diện các lựa chọn cho cả 5 nhóm hành động
  // 1. Nhóm Hồi Phục & Trị Liệu
  choices.push(...getHealingChoices(player, opponent));

  // 2. Nhóm Phòng Thủ & Né Đòn
  choices.push(...getDefenseChoices(player, opponent));

  // 3. Nhóm Cường Hóa & Hỗ Trợ
  choices.push(...getBuffChoices(player, opponent));

  // 4. Nhóm Tấn Công
  if (offensiveSubMenu === 'basic') {
    choices.push(...getBasicAttacks(player, opponent));
  } else {
    choices.push(...getOffensiveSkillRepository(player, opponent));
  }

  // 5. Nhóm Bỏ Chạy
  choices.push(...getFleeChoices(player, opponent));

  return choices;
}

/**
 * Sinh phản ứng tâm lý của kẻ địch ở Giai đoạn 3 (Enemy Psychology Check)
 */
export function evaluateEnemyPsychology(opponent: Opponent): { personality: EnemyPersonality; text: string; reactionStatus: string } {
  let personality = opponent.personality;
  if (!personality) {
    const oppName = (opponent?.name || '').toLowerCase();
    if (opponent.type === 'monster' || (opponent?.id || '').includes('wolf') || (opponent?.id || '').includes('beast')) {
      personality = 'bloodthirsty';
    } else if (oppName.includes('đạo tặc') || oppName.includes('cướp')) {
      personality = Math.random() > 0.5 ? 'cunning' : 'coward';
    } else {
      personality = 'bloodthirsty';
    }
    opponent.personality = personality;
  }

  if (personality === 'coward') {
    return {
      personality,
      text: `[TÂM LÝ KẺ ĐỊCH: HÈN HẠ & KHIẾP NHƯỢC]\n${opponent.name} run rẩy quỳ sụp xuống nền đất, trán dập liên hồi xuống sỏi đá đến bật máu, vừa khóc lóc vừa van xin tha mạng: "Xin đại nhân tha mạng! Tôi chỉ là kẻ bị xúi giục, toàn bộ tiền của trang bị trên người tôi xin dâng nộp hết cho ngài!"`,
      reactionStatus: 'Quỳ rạp van xin tha mạng, sẵn sàng dâng nộp tài sản',
    };
  } else if (personality === 'cunning') {
    return {
      personality,
      text: `[TÂM LÝ KẺ ĐỊCH: XẢO QUYỆT & TÂM CƠ HIỂM ĐỘC]\n${opponent.name} gục đầu ôm vết thương rên rỉ thảm thiết, hai mắt ươn ướt vờ như hoàn toàn đầu hàng để bạn mất cảnh giác. Thế nhưng dưới vạt áo rách, bàn tay gã đang siết chặt cán dao găm tẩm độc bí mật, sẵn sàng tung đòn phản sát liều chết ngay khi bạn bước tới gần!`,
      reactionStatus: 'Giả vờ cầu xin đầu hàng để rình cơ hội phản công liều mạng',
    };
  } else {
    return {
      personality,
      text: `[TÂM LÝ KẺ ĐỊCH: CUỒNG CHIẾN & BẤT KHUẤT]\n${opponent.name} dù gãy xương tứ chi và máu chảy ướt đẫm vẫn quắc mắt đỏ ngầu gầm thét dữ dội. Ánh mắt cuồng loạn của kẻ mang danh dự chiến binh thà chết không chịu khuất phục, miệng vẫn rít lên tiếng gầm gừ đe dọa liều chết đến hơi thở cuối cùng!`,
      reactionStatus: 'Tuyệt đối không khuất phục, gầm thét căm hận đến hơi thở cuối cùng',
    };
  }
}

/**
 * Sinh danh sách 5 lựa chọn phán quyết của người chơi ở GIAI ĐOẠN 3 (Player Verdict Choices)
 */
export function generatePhase3VerdictChoices(player: Character, opponent: Opponent): TurnChoice[] {
  return [
    {
      id: 'p3_verdict_kill',
      label: '1) [Hạ Sát / Đoạt Mạng]: Xuống tay dứt khoát kết liễu hoàn toàn để trừ hậu họa',
      actionText: `Vung kiếm dứt khoát đoạt mạng ${opponent.name}, tiêu trừ hoàn toàn mối nguy hiểm và khẳng định uy danh chiến binh tàn khốc!`,
      riskLevel: 'safe',
      category: 'combat',
      combatBranch: 'P3_VERDICT',
      combatSubCategory: 'Phán Quyết Đoạt Mệnh',
    },
    {
      id: 'p3_verdict_loot',
      label: '2) [Cướp Bóc / Lột Sạch Đồ]: Tịch thu toàn bộ vũ khí, trang bị và tiền xu Asura',
      actionText: `Lột sạch toàn bộ trang bị, vũ khí, túi tiền xu Asura và vật phẩm mang theo của ${opponent.name} trước khi quyết định số phận tiếp theo.`,
      riskLevel: 'safe',
      category: 'combat',
      combatBranch: 'P3_VERDICT',
      combatSubCategory: 'Phán Quyết Đoạt Mệnh',
    },
    {
      id: 'p3_verdict_interrogate',
      label: '3) [Tra Khảo / Tống Tiền / Trao Đổi]: Ép khai bí mật, giao nộp bí kíp võ học hoặc sách phép',
      actionText: `Kề mũi kiếm vào cuống họng ép ${opponent.name} khai báo nguồn gốc, chỉ điểm vị trí kho báu bí mật hoặc chuyển giao bí kíp võ học/sách phép!`,
      riskLevel: 'moderate',
      category: 'combat',
      combatBranch: 'P3_VERDICT',
      combatSubCategory: 'Phán Quyết Đoạt Mệnh',
    },
    {
      id: 'p3_verdict_mercy',
      label: '4) [Khoan Dung & Chữa Trị]: Băng bó vết thương thể hiện sự độ lượng',
      actionText: `Thu kiếm vào vỏ, lấy thuốc hoặc ma pháp trị liệu cầm máu vết thương cho ${opponent.name}. Thể hiện sự khoan dung của bậc cường giả để hóa giải ân oán.`,
      riskLevel: 'safe',
      category: 'combat',
      combatBranch: 'P3_VERDICT',
      combatSubCategory: 'Phán Quyết Đoạt Mệnh',
    },
    {
      id: 'p3_verdict_leave',
      label: '5) [Rút Lui / Mặc Kệ]: Thu dọn vũ khí và rời đi, để mặc số phận cho hoang dã định đoạt',
      actionText: `Lau sạch vết máu trên lưỡi kiếm, quay lưng rời khỏi chiến trường để mặc số phận ${opponent.name} cho hoang dã định đoạt.`,
      riskLevel: 'safe',
      category: 'combat',
      combatBranch: 'P3_VERDICT',
      combatSubCategory: 'Phán Quyết Đoạt Mệnh',
    },
  ];
}

export interface CollisionResolutionResult {
  damageToOpponent: number;
  damageToPlayer: number;
  isArmorPenetrated: boolean;
  isCritical: boolean;
  clashNarrative: string;
  resourcePenaltyNote?: string;
  isResourceDepleted: boolean;
  isOpponentDefeated: boolean;
  costMp?: number;
  costStamina?: number;
  costTouki?: number;
  actionRole?: CombatActionRole;
  isRiposteFromParry?: boolean;
}

/**
 * =========================================================================
 * THỰC THI NHÓM 1: HỒI PHỤC VÀ TRỊ LIỆU
 * Chỉ khép vết thương, cầm máu và hồi lại Sinh lực.
 * Tuyệt đối không gây sát thương lên kẻ địch hay bản thân.
 * =========================================================================
 */
export function resolveHealingAction(
  character: Character,
  opponent: Opponent,
  actionText: string = '',
  choice?: TurnChoice
): {
  narration: string;
  systemNotes: string[];
  hpRestored: number;
  mpCost: number;
  staminaCost: number;
  consumedItemName?: string;
} {
  const text = actionText.toLowerCase();
  const systemNotes: string[] = [];
  let hpRestored = choice?.healHp || 25;
  let mpCost = choice?.costMp !== undefined ? choice.costMp : 0;
  let staminaCost = choice?.costStamina !== undefined ? choice.costStamina : 0;
  let consumedItemName: string | undefined = undefined;

  const isHerb = text.includes('dược thảo') || text.includes('thảo mộc') || text.includes('nuốt [') || text.includes('cắn dược');
  const isBandage = text.includes('băng bó') || text.includes('sơ cứu') || text.includes('dã chiến');
  const isDetox = text.includes('giải độc') || text.includes('thanh tẩy');

  if (isHerb) {
    const herbIdx = (character.inventory || []).findIndex(item => {
      const n = (item?.name || '').toLowerCase();
      return item?.type === 'consumable' || n.includes('dược') || n.includes('thuốc') || n.includes('thảo mộc');
    });
    if (herbIdx >= 0) {
      consumedItemName = character.inventory[herbIdx].name;
      if (character.inventory[herbIdx].quantity && character.inventory[herbIdx].quantity! > 1) {
        character.inventory[herbIdx].quantity! -= 1;
      } else {
        character.inventory.splice(herbIdx, 1);
      }
      hpRestored = 35;
      systemNotes.push(`Đã sử dụng [${consumedItemName}] từ túi đồ.`);
    } else {
      hpRestored = 15;
      staminaCost = 5;
      systemNotes.push('Túi đồ không còn dược thảo! Tự động chuyển sang sơ cứu băng bó dã chiến.');
    }
  } else if (isBandage) {
    hpRestored = 15;
    staminaCost = 5;
    if (character.stats.staminaCurrent < staminaCost) {
      hpRestored = 8;
      staminaCost = character.stats.staminaCurrent;
    }
  } else if (isDetox) {
    mpCost = 10;
    hpRestored = 15;
    if (character.stats.manaCurrent < mpCost) {
      mpCost = character.stats.manaCurrent;
      hpRestored = 5;
      systemNotes.push('⚠️ Mana không đủ để giải trừ toàn bộ độc tố!');
    }
    character.statusEffects = (character.statusEffects || []).filter(e => !e.toLowerCase().includes('độc'));
    systemNotes.push('★ Ma pháp Giải độc đã thanh lọc kinh mạch, giải trừ trạng thái nhiễm độc!');
  } else {
    // Ma pháp Trị liệu
    const tier = character.magic?.healing || 'Sơ cấp (Beginner)';
    const rank = TIER_RANK_MAP[tier] || 1;
    if (mpCost === 0) {
      if (rank >= 4) {
        hpRestored = Math.min(150, Math.round(character.stats.healthMax * 0.8));
        mpCost = 50;
      } else if (rank === 3) {
        hpRestored = 80;
        mpCost = 35;
      } else if (rank === 2) {
        hpRestored = 45;
        mpCost = 18;
      } else {
        hpRestored = 25;
        mpCost = 8;
      }
    }

    if (character.stats.manaCurrent < mpCost) {
      systemNotes.push(`⚠️ Không đủ Mana (${character.stats.manaCurrent}/${mpCost} MP)! Ma pháp Trị liệu chỉ có thể cầm máu nhẹ.`);
      hpRestored = 8;
      mpCost = character.stats.manaCurrent;
    }
  }

  // Deduct resources
  character.stats.manaCurrent = Math.max(0, character.stats.manaCurrent - mpCost);
  character.stats.staminaCurrent = Math.max(0, character.stats.staminaCurrent - staminaCost);

  // Apply heal strictly to player health
  const oldHp = character.stats.healthCurrent;
  character.stats.healthCurrent = Math.min(character.stats.healthMax, character.stats.healthCurrent + hpRestored);
  const actualHeal = character.stats.healthCurrent - oldHp;

  // Xóa hiệu ứng vết thương / chảy máu
  character.statusEffects = (character.statusEffects || []).filter(
    e => !e.toLowerCase().includes('chảy máu') && !e.toLowerCase().includes('rách thịt')
  );

  const narration = `[NHÓM HỒI PHỤC & TRỊ LIỆU - THÀNH CÔNG]
${isHerb 
  ? `Bạn nhanh chóng cắn nát ${consumedItemName || 'dược thảo'}, dòng dược lực thanh mát lập tức ngấm vào cuống họng và lan tỏa khắp lục phủ ngũ tạng.`
  : isBandage 
  ? `Lợi dụng khoảnh khắc đối thủ chững lại, bạn xé dải vải quấn chặt miệng vết thương, dùng lực siết cầm máu và cố định vùng cơ bị tổn thương.`
  : `Ánh sáng xanh lục dịu mát của ma pháp Trị liệu bùng lên trên lòng bàn tay. Từng mao mạch bị đứt và thớ cơ rách toạc nhanh chóng đan kết lại, lớp da non bắt đầu khép miệng, cơn đau thấu xương dịu đi rõ rệt.`}

★ KẾT QUẢ HỒI PHỤC:
• Khép miệng vết thương, cầm máu và hồi phục trực tiếp: **+${actualHeal} Sinh lực** (HP hiện tại: ${character.stats.healthCurrent}/${character.stats.healthMax})!
${mpCost > 0 ? `• Tiêu hao Mana: -${mpCost} MP (Còn lại: ${character.stats.manaCurrent}/${character.stats.manaMax})\n` : ''}${staminaCost > 0 ? `• Tiêu hao Thể lực: -${staminaCost} (Còn lại: ${character.stats.staminaCurrent}/${character.stats.staminaMax})\n` : ''}• Sát thương lên đối thủ: **0 HP** (Tuyệt đối không gây sát thương lên kẻ địch hay bản thân: ${opponent.name} vẫn ở mức ${opponent.hpCurrent}/${opponent.hpMax} HP).`;

  systemNotes.push(`[HỒI PHỤC]: +${actualHeal} HP | Mana: -${mpCost} MP | Thể lực: -${staminaCost}`);

  return {
    narration,
    systemNotes,
    hpRestored: actualHeal,
    mpCost,
    staminaCost,
    consumedItemName,
  };
}

/**
 * =========================================================================
 * THỰC THI NHÓM 2: PHÒNG THỦ
 * Chỉ chặn đòn, dựng khiên, bọc đấu khí chịu lực hoặc né tránh để giảm sát thương.
 * Tuyệt đối không làm kẻ địch mất máu. 
 * Đòn phản công chỉ kích hoạt sau khi đã hóa giải đòn của địch thành công.
 * =========================================================================
 */
export function resolveDefenseAction(
  character: Character,
  opponent: Opponent,
  actionText: string = '',
  choice?: TurnChoice
): {
  narration: string;
  systemNotes: string[];
  damageTaken: number;
  staminaCost: number;
  mpCost: number;
  parryAdvantageGranted: boolean;
  distChanged?: string;
} {
  const text = actionText.toLowerCase();
  const systemNotes: string[] = [];
  let damageTaken = 0;
  let staminaCost = choice?.costStamina !== undefined ? choice.costStamina : 5;
  let mpCost = choice?.costMp !== undefined ? choice.costMp : 0;
  let parryAdvantageGranted = false;
  let distChanged: string | undefined = undefined;

  const isWaterGod = text.includes('thủy thần') || text.includes('hóa kình') || text.includes('gạt phăng');
  const isShield = text.includes('khiên') || text.includes('vũ khí phụ') || text.includes('khóa kẹp');
  const isBarrier = text.includes('kết giới') || text.includes('barrier');
  const isDodge = text.includes('né đòn') || text.includes('bộ pháp') || text.includes('lùi');
  const isToukiHardening = text.includes('bọc đấu khí') || text.includes('gồng mình') || text.includes('chịu lực');

  let defenseDesc = '';

  if (isWaterGod) {
    staminaCost = 8;
    damageTaken = 0;
    parryAdvantageGranted = true;
    if (character.combat) {
      character.combat.parryAdvantage = true;
    }
    opponent.status = 'Bị kiếm Thủy Thần hóa kình gạt văng vũ khí, mất đà lảo đảo lộ sơ hở chí mạng!';
    defenseDesc = `Áp dụng tuyệt kỹ phòng thủ của Thủy Thần phái, bạn giữ kiếm ở tư thế đón gió.
Khoảnh khắc đòn bổ sấm sét của ${opponent.name} vừa chạm tới, sống kiếm của bạn khẽ nghiêng một góc hoàn hảo, mượn lực đả lực dẫn toàn bộ kình lực của đối phương trượt sang bên!
"KENGGG!" Một tiếng ngân trong trẻo vang lên, vuốt/vũ khí của ${opponent.name} bị hất văng sang một bên. 
Cú hụt đà cực mạnh làm thân hình nó chúi nhủi về phía trước, lộ toang toàn bộ lồng ngực và yếu huyệt ngay trước tầm kiếm của bạn!`;
    systemNotes.push('★ HÓA GIẢI HOÀN TOÀN: Triệt tiêu 100% sát thương đòn đánh của kẻ địch!');
    systemNotes.push('⚡ KÍCH HOẠT LỢI THẾ PHẢN KÍCH: Đòn Tấn Công ở lượt kế tiếp sẽ được tăng 50% uy lực và chắc chắn tạo đòn chí mạng!');
  } else if (isBarrier) {
    mpCost = 15;
    staminaCost = 0;
    damageTaken = 0;
    defenseDesc = `Hai tay bạn kết ấn trong chớp mắt, một màng kết giới ma thuật ngũ giác trong suốt lập tức dựng lên trước mặt!
"ẦM!" Cú vồ dữ dội của ${opponent.name} đập mạnh vào kết giới ma thuật tạo nên những làn sóng năng lượng gợn sóng lấp lánh rồi tiêu tán hoàn toàn vào không khí. Bạn đứng vững vàng không hề suy suyển!`;
    systemNotes.push('★ KẾT GIỚI BẢO HỘ: Miễn nhiễm 100% sát thương đòn đánh!');
  } else if (isShield) {
    staminaCost = 8;
    damageTaken = 0;
    defenseDesc = `Bạn đưa mặt khiên chắc chắn lên đón đầu cú công kích. 
"BOONG!" Lực va chạm dội thẳng vào khiên thép, hai chân bạn lún sâu xuống nền đất nửa tấc nhưng cánh tay vẫn ghìm chặt khóa cứng đường tiến của đối phương. Bạn đã bảo vệ trọn vẹn toàn bộ các cơ quan trọng yếu!`;
    systemNotes.push('★ CHẶN ĐÒN THÀNH CÔNG: Chặn đứng đòn đánh trực diện, sát thương nhận vào: 0 HP.');
  } else if (isDodge) {
    staminaCost = 6;
    damageTaken = 0;
    distChanged = 'Tầm trung (5-10m)';
    opponent.distance = 'Tầm trung (5-10m)';
    defenseDesc = `Đôi mắt bạn nhận diện quỹ đạo ra đòn của ${opponent.name}. 
Bằng một động tác nhún chân uyển chuyển và cú lộn người búng lùi điệu nghệ, lưỡi vuốt/nhát kiếm của đối thủ chỉ chém trúng luồng gió thoảng.
Bạn tiếp đất nhẹ nhàng cách xa 6 mét, kéo giãn cự ly thành **${opponent.distance}** an toàn!`;
    systemNotes.push('★ NÉ TRÁNH THÀNH CÔNG: Hoàn toàn né sạch đòn đánh, kéo giãn khoảng cách ra xa an toàn.');
  } else if (isToukiHardening) {
    staminaCost = 6;
    damageTaken = 0;
    defenseDesc = `Bạn điều hòa hơi thở, vận Đấu Khí cô đọng thành một lớp màng bảo hộ vững chắc bao bọc ngoài da.
Cú va đập của ${opponent.name} giáng xuống bị lớp Đấu Khí đàn hồi phân tán lực xung chấn ra xung quanh, triệt tiêu hoàn toàn lực sát thương!`;
    systemNotes.push('★ ĐẤU KHÍ BẢO VỆ: Triệt tiêu xung chấn, sát thương nhận vào: 0 HP.');
  } else {
    staminaCost = 5;
    damageTaken = 0;
    defenseDesc = `Bạn lui một bước thủ thế vững vàng, dùng vũ khí gạt nhẹ đường kiếm của đối thủ sang hướng khác, hóa giải an toàn đòn áp sát.`;
  }

  // Deduct resources
  character.stats.staminaCurrent = Math.max(0, character.stats.staminaCurrent - staminaCost);
  character.stats.manaCurrent = Math.max(0, character.stats.manaCurrent - mpCost);
  if (damageTaken > 0) {
    character.stats.healthCurrent = Math.max(1, character.stats.healthCurrent - damageTaken);
  }

  const narration = `[NHÓM PHÒNG THỦ & NÉ ĐÒN - THÀNH CÔNG]
${defenseDesc}

★ KẾT QUẢ PHÒNG THỦ:
• Sát thương người chơi nhận vào: **${damageTaken} HP** (HP hiện tại: ${character.stats.healthCurrent}/${character.stats.healthMax})
• Tiêu hao: -${staminaCost} Thể lực (Còn lại: ${character.stats.staminaCurrent}/${character.stats.staminaMax})${mpCost > 0 ? `, -${mpCost} MP` : ''}
• Sát thương lên đối thủ: **0 HP** (Quy tắc phòng thủ tuyệt đối không làm kẻ địch mất máu: ${opponent.hpCurrent}/${opponent.hpMax} HP)
${parryAdvantageGranted ? '• [LỢI THẾ PHẢN KÍCH]: Đã hóa giải thành công đòn của địch, sẵn sàng tung đòn phản sát ở lượt sau!' : ''}`;

  return {
    narration,
    systemNotes,
    damageTaken,
    staminaCost,
    mpCost,
    parryAdvantageGranted,
    distChanged,
  };
}

/**
 * =========================================================================
 * THỰC THI NHÓM 3: CƯỜNG HÓA VÀ HỖ TRỢ
 * Chỉ tăng tạm thời độ dày Đấu khí, tốc độ phản xạ hoặc sức mạnh cho các lượt đánh kế tiếp.
 * Tuyệt đối không gây sát thương tức thì khi kích hoạt.
 * =========================================================================
 */
export function resolveBuffAction(
  character: Character,
  opponent: Opponent,
  actionText: string = '',
  choice?: TurnChoice
): {
  narration: string;
  systemNotes: string[];
  toukiBonus: number;
  reflexBonus: number;
  staminaCost: number;
  mpCost: number;
  buffDurationTurns: number;
} {
  const text = actionText.toLowerCase();
  const systemNotes: string[] = [];
  let toukiBonus = choice?.buffTouki || 0;
  let reflexBonus = choice?.buffReflex || 0;
  let staminaCost = choice?.costStamina !== undefined ? choice.costStamina : 0;
  let mpCost = choice?.costMp !== undefined ? choice.costMp : 0;
  let buffDurationTurns = 2;
  let buffName = '';
  let buffDesc = '';

  const isToukiSurge = text.includes('bộc phát đấu khí') || text.includes('touki surge');
  const isBeastMartial = text.includes('thú tộc') || text.includes('hoang dã') || text.includes('bản năng');
  const isDemonEye = text.includes('dự tri') || text.includes('ma nhãn') || text.includes('ma lực nhãn');
  const isAmulet = text.includes('bùa hộ mệnh') || text.includes('trang sức');

  if (isToukiSurge) {
    buffName = 'Bộc Phát Đấu Khí (Touki Surge)';
    staminaCost = 10;
    mpCost = 5;
    toukiBonus = 20;
    buffDesc = `Dưới ý chí tập trung tột độ, mạch Đấu Khí trong cơ thể bạn bùng nổ dữ dội! 
Một luồng hào quang vô hình cuồn cuộn bao phủ toàn thân như lớp áo giáp thép rực sáng. Cơ bắp căng tràn sức mạnh, từng sợi gân cốt như được tôi luyện thêm một bậc!`;
    systemNotes.push('★ CƯỜNG HÓA THÀNH CÔNG: Độ dày Đấu Khí tăng tạm thời +20 Touki cho 2 lượt tiếp theo!');
  } else if (isBeastMartial) {
    buffName = 'Thể Thuật Thú Tộc (Beast Instinct)';
    staminaCost = 8;
    reflexBonus = 15;
    buffDesc = `Bản năng loài săn mồi thức tỉnh trong huyết mạch! Con ngươi bạn co lại, thính giác và khứu giác nhạy bén gấp bội. 
Tốc độ phản xạ và bước chân trở nên thanh thoát, nhẹ nhàng như loài báo săn trong rừng thẳm!`;
    systemNotes.push('★ CƯỜNG HÓA THÀNH CÔNG: Tốc độ phản xạ né đòn tăng +15 cho các lượt tiếp theo!');
  } else if (isDemonEye) {
    buffName = 'Thức Tỉnh Ma Nhãn (Demon Eye Focus)';
    mpCost = 8;
    reflexBonus = 20;
    buffDesc = `Tròng mắt bạn lóe lên ánh hào quang tím huyền bí của Ma Nhãn!
Mọi chuyển động trong chiến trường như chậm lại vài nhịp. Bạn nhìn thấy trước quỹ đạo vung vuốt và chuyển hướng của ${opponent.name} trước 2 giây!`;
    systemNotes.push('★ DỰ TRI MA NHÃN: Đọc trước quỹ đạo công kích của đối phương, tăng mạnh độ chính xác đòn sau!');
  } else if (isAmulet) {
    buffName = 'Kích Hoạt Bùa Hộ Mệnh';
    mpCost = 4;
    toukiBonus = 10;
    buffDesc = `Bạn rót một tia Mana kích hoạt linh phù hộ mệnh trên cổ áo. Một lớp màng bảo hộ ấm áp tỏa ra, gia tăng sức chịu đựng của cơ thể.`;
    systemNotes.push('★ TRANG BỊ PHỤ TRỢ: Tăng cường lực bảo hộ +10 Touki.');
  } else {
    buffName = 'Định Tâm Vận Khí';
    staminaCost = 0;
    toukiBonus = 8;
    character.stats.staminaCurrent = Math.min(character.stats.staminaMax, character.stats.staminaCurrent + 10);
    buffDesc = `Bạn hít một hơi thật sâu, điều hòa nhịp tim đang đập dồn dập, tích lũy kình lực vào hai bàn tay chuẩn bị cho cú xuất chiêu tiếp theo.`;
    systemNotes.push('★ ĐỊNH TÂM: Hồi phục +10 Thể lực, tăng nhẹ uy lực lượt sau.');
  }

  // Deduct costs
  character.stats.staminaCurrent = Math.max(0, character.stats.staminaCurrent - staminaCost);
  character.stats.manaCurrent = Math.max(0, character.stats.manaCurrent - mpCost);

  // Set buff tracking in character.combat
  if (character.combat) {
    character.combat.activeToukiBuffTurns = buffDurationTurns;
    character.combat.activeToukiBonus = (character.combat.activeToukiBonus || 0) + toukiBonus;
    character.combat.activeReflexBonus = (character.combat.activeReflexBonus || 0) + reflexBonus;
  }

  const narration = `[NHÓM CƯỜNG HÓA & HỖ TRỢ - KÍCH HOẠT THÀNH CÔNG]
${buffDesc}

★ KẾT QUẢ CƯỜNG HÓA:
• Hiệu ứng: [${buffName}] được kích hoạt thành công!
${toukiBonus > 0 ? `• Tăng tạm thời độ dày Đấu Khí: **+${toukiBonus} Touki** (Duy trì trong ${buffDurationTurns} lượt)\n` : ''}${reflexBonus > 0 ? `• Tăng tốc độ phản xạ & né đòn: **+${reflexBonus}** cho các lượt tiếp theo\n` : ''}• Tiêu hao: ${staminaCost > 0 ? `-${staminaCost} Thể lực ` : ''}${mpCost > 0 ? `-${mpCost} MP ` : ''}(Đã cập nhật tức thì vào Bảng trạng thái)
• Sát thương tức thì lên đối thủ: **0 HP** (Quy tắc cường hóa tuyệt đối không gây sát thương tức thì: ${opponent.name} vẫn ở mức ${opponent.hpCurrent}/${opponent.hpMax} HP).`;

  return {
    narration,
    systemNotes,
    toukiBonus,
    reflexBonus,
    staminaCost,
    mpCost,
    buffDurationTurns,
  };
}

/**
 * =========================================================================
 * THỰC THI NHÓM 5: BỎ CHẠY
 * Chỉ tính toán khả năng tẩu thoát dựa trên độ Nhanh nhẹn đôi bên, không gây sát thương.
 * =========================================================================
 */
export function resolveCombatFlee(
  character: Character,
  opponent: Opponent,
  actionText: string = ''
): {
  isSuccess: boolean;
  damageTaken: number;
  fatigueCost: number;
  narration: string;
  systemNotes: string[];
} {
  const escapeRate = character.combat?.escapeChancePercent || calculateEscapeChance(character, opponent);
  const escapeRoll = Math.random() * 100;
  const systemNotes: string[] = [];

  if (escapeRoll <= escapeRate) {
    const fatigueCost = 15;
    character.stats.fatigue = Math.min(100, (character.stats.fatigue || 0) + fatigueCost);
    character.combat = undefined; // Thoát giao tranh

    const narration = `[NHÓM BỎ CHẠY - ĐÀO TẨU THÀNH CÔNG (RETREAT SUCCESS)]
Nhận thấy tình thế hiểm nghèo, bạn tận dụng tối đa địa hình phức tạp và chướng ngại vật xung quanh, bất ngờ ném cát đất tung hỏa mù cản bước!
Dưới sự hỗ trợ của bước chạy thoăn thoắt, bạn guồng chân bứt tốc hết sức bình sinh, luồn lách qua các bụi rậm và khe đá hẹp. 
${opponent.name} gầm thét dữ dội phía sau nhưng bị vướng chướng ngại vật và dần mất dấu vết. 
Sau một hồi chạy thục mạng, bạn dựa lưng vào một gốc cây cổ thụ thở dốc, tim đập thình thịch trong lồng ngực. Bạn đã an toàn thoát khỏi nanh vuốt kẻ địch trong gang tấc!

★ KẾT QUẢ ĐÀO TẨU:
• Trạng thái: Đã thoát khỏi giao tranh an toàn (Không còn trong chiến đấu).
• Sát thương lên kẻ địch: **0 HP** (Quy tắc bỏ chạy tuyệt đối không gây sát thương: ${opponent.name} giữ nguyên ${opponent.hpCurrent}/${opponent.hpMax} HP).
• Sát thương nhận vào: **0 HP**.
• Mệt mỏi tăng: +${fatigueCost}% (Hiện tại: ${character.stats.fatigue}%).`;

    systemNotes.push(`Đào tẩu thành công! Đã cắt đuôi an toàn [${opponent.name}] (Tỷ lệ thoát: ${escapeRate}%).`);

    return {
      isSuccess: true,
      damageTaken: 0,
      fatigueCost,
      narration,
      systemNotes,
    };
  } else {
    // Thoát thất bại: Nhận đòn áp chế từ phía sau
    const critDmg = Math.max(15, Math.round(character.stats.healthMax * 0.28));
    character.stats.healthCurrent = Math.max(0, character.stats.healthCurrent - critDmg);
    opponent.distance = 'Cận chiến (0-2m)';
    opponent.status = 'Vừa tung đòn chặn đường, khóa chặt cự ly cận chiến hung bạo!';

    const narration = `[NHÓM BỎ CHẠY - ĐÀO TẨU THẤT BẠI]
Bạn quay đầu toan tháo chạy, nhưng độ Nhanh Nhẹn của ${opponent.name} quá vượt trội!
Trước khi bạn kịp bứt tốc, một luồng kình lực rít lên sau lưng. "ẦM!" Một cú vồ/nhát chém sượt ngang mạn sườn làm bạn loạng choạng ngã nhào (-${critDmg} HP).
${opponent.name} lập tức áp sát ở cự ly ${opponent.distance}, chặn đứng đường lùi với ánh mắt khát máu!

★ KẾT QUẢ ĐÀO TẨU:
• Tình trạng: Thoát chạy thất bại! Bị đối thủ bắt kịp chặn đường.
• Sát thương nhận vào: **-${critDmg} HP** (HP hiện tại: ${character.stats.healthCurrent}/${character.stats.healthMax}).
• Sát thương lên đối thủ: **0 HP** (Quy tắc bỏ chạy không gây sát thương lên kẻ địch: ${opponent.hpCurrent}/${opponent.hpMax} HP).`;

    systemNotes.push(`Đào tẩu thất bại: Nhận đòn chặn đường (-${critDmg} HP), bị ép lại cự ly 0-2m!`);

    return {
      isSuccess: false,
      damageTaken: critDmg,
      fatigueCost: 5,
      narration,
      systemNotes,
    };
  }
}

/**
 * =========================================================================
 * THỰC THI NHÓM 4: TẤN CÔNG (COLLISION RESOLUTION)
 * Nhóm duy nhất gây sát thương, phá vỡ Đấu khí và trừ Sinh lực của kẻ địch.
 * Cập nhật chuẩn xác hao hụt tài nguyên (Mana, Thể lực, Đấu khí).
 * =========================================================================
 */
export function resolveCombatCollision(
  character: Character,
  opponent: Opponent,
  actionText: string = '',
  castMode: 'chantless' | 'chanting' | 'sword' = 'chantless',
  choice?: TurnChoice
): CollisionResolutionResult {
  const text = actionText.toLowerCase();

  // 1. Phân tích cấp bậc kỹ năng và tiêu hao tài nguyên
  let costMp = choice?.costMp !== undefined ? choice.costMp : 0;
  let costStamina = choice?.costStamina !== undefined ? choice.costStamina : 5;
  let costTouki = choice?.costTouki !== undefined ? choice.costTouki : 0;
  let skillTier = choice?.skillTier !== undefined ? choice.skillTier : 1;
  let offensiveGroup: 'magic' | 'sword' | 'hybrid' | 'basic' = choice?.offensiveGroup || 'sword';

  // Fallback thông minh nếu không có choice object truyền vào (ví dụ người chơi tự nhập lệnh tự do)
  if (!choice) {
    // Trích xuất chi phí tài nguyên qua Regex linh hoạt
    const mpMatch = text.match(/(\d+)\s*(?:mp|mana)/i);
    if (mpMatch) costMp = parseInt(mpMatch[1], 10);

    const staMatch = text.match(/(\d+)\s*(?:thể lực|stamina)/i);
    if (staMatch) costStamina = parseInt(staMatch[1], 10);

    const toukiMatch = text.match(/(\d+)\s*(?:đấu khí|touki)/i);
    if (toukiMatch) costTouki = parseInt(toukiMatch[1], 10);

    // Xác định cấp bậc kỹ năng (Skill Tier) từ 1 (Sơ cấp) -> 7 (Thần cấp)
    if (text.includes('thần cấp') || text.includes('god') || text.includes('thần kiếm') || text.includes('khải huyền') || text.includes('trảm đoạn không gian') || text.includes('thần hải') || costMp >= 300 || costStamina >= 65) {
      skillTier = 7;
      if (!costMp && !costStamina) { costMp = 350; costTouki = 50; }
      offensiveGroup = text.includes('kiếm') || text.includes('trảm') ? 'sword' : 'magic';
    } else if (text.includes('đế cấp') || text.includes('emperor') || text.includes('đế kiếm') || text.includes('thái dương') || text.includes('băng hà tuyệt đối') || costMp >= 180 || costStamina >= 55) {
      skillTier = 6;
      if (!costMp && !costStamina) { costMp = 200; costTouki = 40; }
      offensiveGroup = text.includes('kiếm') || text.includes('trảm') ? 'sword' : 'magic';
    } else if (text.includes('vương cấp') || text.includes('king') || text.includes('vương kiếm') || text.includes('vương đãng') || text.includes('hỏa ngục') || costMp >= 100 || costStamina >= 45) {
      skillTier = 5;
      if (!costMp && !costStamina) { costMp = 120; costStamina = 50; costTouki = 30; }
      offensiveGroup = text.includes('kiếm') || text.includes('trảm') ? 'sword' : 'magic';
    } else if (text.includes('thánh cấp') || text.includes('saint') || text.includes('thánh kiếm') || text.includes('quang tốc') || text.includes('cumulonimbus') || text.includes('phượng hoàng') || costMp >= 60 || costStamina >= 30) {
      skillTier = 4;
      if (!costMp && !costStamina) { costMp = 80; costStamina = 35; costTouki = 20; }
      offensiveGroup = text.includes('kiếm') || text.includes('trảm') ? 'sword' : 'magic';
    } else if (text.includes('thượng cấp') || text.includes('advanced') || text.includes('thập tự') || text.includes('chấn thần') || text.includes('chân không trảm') || text.includes('bão lửa') || text.includes('nham thạch') || text.includes('băng long') || text.includes('sét nổ') || costMp >= 25 || costStamina >= 20) {
      skillTier = 3;
      if (!costMp && !costStamina) { costMp = 35; costStamina = 25; costTouki = 10; }
      offensiveGroup = text.includes('ma kiếm') || text.includes('ghép') ? 'hybrid' : (text.includes('kiếm') ? 'sword' : 'magic');
    } else if (text.includes('trung cấp') || text.includes('intermediate') || text.includes('hỏa pháo') || text.includes('băng đạn') || text.includes('phong tiễn') || text.includes('địa đạn') || text.includes('luồn lách') || text.includes('triệt hạ') || text.includes('ma kiếm') || costMp >= 12 || costStamina >= 10) {
      skillTier = 2;
      if (!costMp && !costStamina) { costMp = 15; costStamina = 12; }
      offensiveGroup = text.includes('ma kiếm') ? 'hybrid' : (text.includes('kiếm') ? 'sword' : 'magic');
    } else if (text.includes('đòn đánh thường') || text.includes('đòn thường') || text.includes('chém thẳng') || text.includes('đá hạ bàn') || text.includes('cán vũ khí')) {
      skillTier = 1;
      costMp = 0;
      costStamina = 5;
      offensiveGroup = 'basic';
    } else {
      skillTier = 1;
      if (text.includes('ma pháp') || text.includes('mp') || text.includes('cầu')) {
        costMp = 5;
        offensiveGroup = 'magic';
      } else {
        costStamina = 8;
        offensiveGroup = 'sword';
      }
    }
  }

  // Áp dụng thiên phú giảm hao phí tài nguyên
  const talentMods = character.progression?.innateTalent?.modifiers;
  if (talentMods) {
    if (offensiveGroup === 'sword' && talentMods.staminaCostSwordPercent) {
      costStamina = Math.max(1, Math.round(costStamina * (1 + talentMods.staminaCostSwordPercent / 100)));
    }
    if ((offensiveGroup === 'magic' || offensiveGroup === 'hybrid') && talentMods.manaCostPercent) {
      costMp = Math.max(1, Math.round(costMp * (1 + talentMods.manaCostPercent / 100)));
    }
  }

  // 2. Kiểm tra tài nguyên người chơi
  let isResourceDepleted = false;
  let penaltyNote = '';
  let extraPlayerDmg = 0;

  if (costMp > 0 && character.stats.manaCurrent < costMp) {
    isResourceDepleted = true;
    penaltyNote = '⚠️ [THIẾU HỤT MANA]: Mana hiện tại không đủ! Đòn đánh phát huy một phần uy lực.';
    extraPlayerDmg += 4;
    character.stats.manaCurrent = 0;
  } else if (costMp > 0) {
    character.stats.manaCurrent = Math.max(0, character.stats.manaCurrent - costMp);
  }

  if (costStamina > 0 && character.stats.staminaCurrent < costStamina) {
    isResourceDepleted = true;
    const staminaMsg = '⚠️ [THIẾU HỤT THỂ LỰC]: Thể lực giảm sút! Đòn đánh bị hụt nhịp đôi chút.';
    penaltyNote = penaltyNote ? `${penaltyNote}\n${staminaMsg}` : staminaMsg;
    extraPlayerDmg += 4;
    character.stats.staminaCurrent = 0;
  } else if (costStamina > 0) {
    character.stats.staminaCurrent = Math.max(0, character.stats.staminaCurrent - costStamina);
  }

  // 3. Kiểm tra Buff & Lợi thế phản kích từ Thủy Thần Parry
  const hasParryAdvantage = !!character.combat?.parryAdvantage;
  if (hasParryAdvantage && character.combat) {
    character.combat.parryAdvantage = false; // Tiêu thụ lợi thế
  }

  const activeToukiBonus = character.combat?.activeToukiBonus || 0;
  if (character.combat?.activeToukiBuffTurns) {
    character.combat.activeToukiBuffTurns -= 1;
    if (character.combat.activeToukiBuffTurns <= 0) {
      character.combat.activeToukiBonus = 0;
    }
  }

  // 4. Tính toán khoảng sát thương chuẩn hóa
  const dmgRange = calculateSkillDamageRange(
    character,
    skillTier,
    offensiveGroup,
    costMp,
    costStamina,
    costTouki,
    opponent,
    castMode
  );

  let rolledDamage = Math.floor(dmgRange.min + Math.random() * (dmgRange.max - dmgRange.min + 1));

  // Kiểm tra thiên phú Omni-Cast (3 luồng chiêu đồng thời + 50% combo)
  if (talentMods?.multiStreamCastCount && talentMods.multiStreamCastCount >= 3) {
    rolledDamage = Math.round(rolledDamage * 1.35);
  }

  // Kiểm tra suy giảm 20% khi trận chiến kéo dài quá 5 lượt (Đoản Thọ / Hàn Bệnh)
  const combatRound = (character.combat?.round || 1);
  if (talentMods?.longBattlePenaltyTurns && combatRound >= talentMods.longBattlePenaltyTurns) {
    rolledDamage = Math.max(10, Math.round(rolledDamage * 0.8));
    penaltyNote = penaltyNote ? `${penaltyNote}\n❄️ [ĐOẢN THỌ / HÀN BỆNH]: Thể lực suy kiệt sau 5 lượt chiến đấu, toàn bộ chỉ số suy giảm 20%!` : '❄️ [ĐOẢN THỌ / HÀN BỆNH]: Thể lực suy kiệt sau 5 lượt chiến đấu, toàn bộ chỉ số suy giảm 20%!';
  }

  let isArmorPenetrated = false;
  let isCritical = false;
  const oppRank = TIER_RANK_MAP[opponent.powerTier] || 1;
  const effectiveTouki = (character.stats.touki || 0) + activeToukiBonus;

  // Tính toán phản kích của đối thủ lên người chơi (giảm dần theo Đấu Khí và Thiên Phú)
  const rawRetaliation = oppRank * 8 + 3;
  let oppRetaliation = Math.max(2, rawRetaliation - Math.round(effectiveTouki * 0.25));
  if (talentMods?.physicalDamageTakenPercent) {
    oppRetaliation = Math.max(1, Math.round(oppRetaliation * (1 + talentMods.physicalDamageTakenPercent / 100)));
  }

  // Kiểm tra Né tránh từ Trực Giác Thợ Săn (+30% né đòn)
  if (talentMods?.evasionBonusPercent && Math.random() * 100 < talentMods.evasionBonusPercent) {
    oppRetaliation = 0;
  }

  // Kiểm tra Nhãn Lực Sát Na (+35% Crit tử huyệt)
  if (talentMods?.critWeaknessChanceBonus && Math.random() * 100 < talentMods.critWeaknessChanceBonus) {
    isCritical = true;
    rolledDamage = Math.round(rolledDamage * 1.35);
  }

  let damageToOpponent = rolledDamage;
  let damageToPlayer = extraPlayerDmg;
  let clashNarrative = '';

  const tierNames = ['', 'Sơ cấp', 'Trung cấp', 'Thượng cấp', 'Thánh cấp (Saint)', 'Vương cấp (King)', 'Đế cấp (Emperor)', 'Thần cấp (God)'];
  const currentTierName = tierNames[skillTier] || `Bậc ${skillTier}`;

  if (hasParryAdvantage) {
    isArmorPenetrated = true;
    isCritical = true;
    damageToOpponent = Math.round(rolledDamage * 1.35);
    damageToPlayer = extraPlayerDmg;
    clashNarrative = `[KÍCH HOẠT PHẢN SÁT SAU KHI HÓA GIẢI THÀNH CÔNG (CRITICAL RIPOSTE)]
Chớp lấy thời cơ vàng khi ${opponent.name} vừa bị gạt văng đòn đánh và mất thăng bằng lộ toàn bộ yếu huyệt, bạn tung đòn kết liễu xé gió giáng thẳng vào tử huyệt!
Đòn đánh bộc phát uy lực tột đỉnh, xuyên phá tuyệt đối lớp phòng ngự còn sót lại! Tiếng thét đau đớn vang dội cả chiến trường!`;
  } else if (skillTier > oppRank) {
    isArmorPenetrated = true;
    isCritical = true;
    damageToOpponent = rolledDamage;
    damageToPlayer += Math.max(1, Math.round(oppRetaliation * 0.35));
    clashNarrative = `Đòn công kích uy lực vượt trội hoàn toàn! 
Nhát chém/luồng ma pháp xé toạc lớp Đấu Khí bảo hộ của ${opponent.name}, bổ thẳng vào tử huyệt tạo đòn đánh chí mạng áp đảo!
Máu ma vật bắn tung tóe, vũ khí của đối thủ xuất hiện vết nứt toác, ${opponent.name} rú lên đau đớn bị hất văng lùi lại!`;
  } else if (skillTier === oppRank) {
    isArmorPenetrated = true;
    damageToOpponent = rolledDamage;
    damageToPlayer += Math.round(oppRetaliation * 0.65);
    clashNarrative = `Một cú va chạm nghẹt thở giữa hai luồng sức mạnh tương đương! 
Ánh kiếm và vuốt thép va vào nhau tóe lửa chát chúa, chấn động nội tạng làm cả hai cùng lảo đảo lùi lại. 
Vũ khí của bạn bị mẻ một vết nhỏ, nhưng đối phương cũng để lại vết thương rách thịt rớm máu dài trên ngực!`;
  } else {
    isArmorPenetrated = false;
    damageToOpponent = rolledDamage;
    damageToPlayer += oppRetaliation;
    clashNarrative = `Lớp Đấu Khí và giáp xác của ${opponent.name} khá kiên cố! 
Dù chịu tổn thất sinh lực từ chiêu thức của bạn, đối thủ vẫn trụ vững phản chấn lại một phần lực. 
Lực va chạm chạy dọc cánh tay làm bạn ê ẩm, trong khi ${opponent.name} chớp thời cơ tung đòn vuốt cào sượt qua vai bạn!`;
  }

  // Phạt sát thương nếu cạn kiệt tài nguyên
  if (isResourceDepleted) {
    damageToOpponent = Math.max(10, Math.round(damageToOpponent * 0.5));
    clashNarrative = `[TÌNH THẾ BẤT LỢI DO THIẾU HỤT TÀI NGUYÊN]
Do không đủ Mana hoặc Thể lực để giải phóng trọn vẹn chiêu thức, bạn bị hụt hơi ngay trước khoảnh khắc va chạm! Uy lực đòn đánh bị suy giảm 50%.
${clashNarrative}`;
  }

  // Bảo vệ sinh mạng người chơi: Mạch Máu Bất Tử (Immortal Bloodline) hoặc Cơ chế Thập Tử Nhất Sinh
  if (talentMods?.lethalWoundResistPercent && damageToPlayer >= (character.stats.healthCurrent || 1)) {
    damageToPlayer = Math.max(0, (character.stats.healthCurrent || 1) - 1);
    penaltyNote = penaltyNote ? `${penaltyNote}\n🩸 [MẠCH MÁU BẤT TỬ]: Sinh mệnh bất tử đã chặn đứng đòn sát thương chí mạng, bảo toàn 1 HP!` : '🩸 [MẠCH MÁU BẤT TỬ]: Sinh mệnh bất tử đã chặn đứng đòn sát thương chí mạng, bảo toàn 1 HP!';
  } else if (damageToPlayer >= (character.stats.healthCurrent || 1) && (character.stats.healthCurrent || 0) > 1 && (!character.combat?.hasTriggeredNearDeath)) {
    damageToPlayer = Math.max(0, (character.stats.healthCurrent || 1) - 1);
    if (character.combat) {
      (character.combat as any).hasTriggeredNearDeath = true;
    }
    const nearDeathMsg = '⚠️ [THẬP TỬ NHẤT SINH]: Cú phản kích suýt lấy mạng bạn! Bạn cắn răng trụ vững ở 1 HP nhờ bản năng sinh tồn, hãy lập tức kéo giãn cự ly, phòng thủ hoặc trị liệu!';
    penaltyNote = penaltyNote ? `${penaltyNote}\n${nearDeathMsg}` : nearDeathMsg;
  }

  const oldOppHp = opponent.hpCurrent;
  const remainingHp = Math.max(0, opponent.hpCurrent - damageToOpponent);
  const isOpponentDefeated = remainingHp <= 0;

  // Bổ sung dòng thông báo sát thương rõ ràng, nổi bật vào narrative
  clashNarrative = `${clashNarrative}

💥 **SÁT THƯƠNG GÂY RA:** Đòn đánh [${currentTierName}] giáng trúng mục tiêu, gây **${damageToOpponent} Sát thương** (Dự tính: ${dmgRange.display} | Sinh lực ${opponent.name}: ${oldOppHp} ➔ ${remainingHp}/${opponent.hpMax} HP)${damageToPlayer > 0 ? ` | Bản thân nhận **-${damageToPlayer} HP** phản kích.` : ' | 0 phản kích.'}`;

  return {
    damageToOpponent,
    damageToPlayer,
    isArmorPenetrated,
    isCritical,
    clashNarrative,
    resourcePenaltyNote: penaltyNote || undefined,
    isResourceDepleted,
    isOpponentDefeated,
    costMp,
    costStamina,
    costTouki,
    actionRole: 'attack',
    isRiposteFromParry: hasParryAdvantage,
  };
}
