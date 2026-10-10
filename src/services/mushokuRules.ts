import type { 
  Character, 
  PowerTier, 
  CombatDistance, 
  Opponent, 
  CombatState, 
  RegionalEcosystem, 
  CraftingRecipe,
  EquipmentSet,
  EquipmentSlotKey,
  InventoryItem,
  ItemStatBonus
} from '../types/game.ts';
import { EQUIPMENT_SLOT_LABELS } from '../types/game.ts';

export const POWER_TIERS: PowerTier[] = [
  'Chưa học',
  'Sơ cấp (Beginner)',
  'Trung cấp (Intermediate)',
  'Thượng cấp (Advanced)',
  'Thánh cấp (Saint)',
  'Vương cấp (King)',
  'Đế cấp (Emperor)',
  'Thần cấp (God)',
];

export const TIER_RANK_MAP: Record<PowerTier, number> = {
  'Chưa học': 0,
  'Sơ cấp (Beginner)': 1,
  'Trung cấp (Intermediate)': 2,
  'Thượng cấp (Advanced)': 3,
  'Thánh cấp (Saint)': 4,
  'Vương cấp (King)': 5,
  'Đế cấp (Emperor)': 6,
  'Thần cấp (God)': 7,
};

export const HYBRID_MAGIC_RECIPES = [
  {
    id: 'quagmire',
    name: 'Đầm Lầy (Quagmire)',
    elements: ['Thổ (Earth)', 'Thủy (Water)'],
    description: 'Làm tan chảy mặt đất bên dưới chân đối thủ thành vũng bùn lầy đặc quánh, khóa cứng bộ pháp và triệt tiêu tốc độ xuất kiếm.',
    effect: 'Kéo khoảng cách từ Cận chiến ra Tầm trung, vô hiệu hóa đòn lao tới của Kiếm sĩ, giảm 50% né tránh của đối thủ.',
  },
  {
    id: 'dense_fog',
    name: 'Sương Mù Dày (Dense Mist & Ice)',
    elements: ['Thủy (Water)', 'Phong (Wind)'],
    description: 'Hạ nhiệt độ không khí đột ngột và phát tán hơi ẩm tạo thành màn sương mù mịt mùng kết hợp gai băng vụn.',
    effect: 'Chặn tầm nhìn của đối thủ, che giấu tung tích người chơi, hóa giải các đòn tấn công tầm xa.',
  },
  {
    id: 'magma',
    name: 'Dung Nham (Lava / Magma Surge)',
    elements: ['Thổ (Earth)', 'Hỏa (Fire)'],
    description: 'Nung chảy nham thạch thành dòng dung nham nóng đỏ hàng ngàn độ, thiêu đốt Đấu Khí bảo vệ của đối thủ.',
    effect: 'Sát thương xuyên giáp Touki, buộc đối thủ phải lùi xa, để lại địa hình dung nham ngăn cản áp sát.',
  },
  {
    id: 'firestorm',
    name: 'Bão Lửa (Firestorm)',
    elements: ['Hỏa (Fire)', 'Phong (Wind)'],
    description: 'Dùng lốc xoáy gió cung cấp oxy cuồn cuộn nén ngọn lửa bùng phát thành quả cầu lửa xoáy khổng lồ.',
    effect: 'Sát thương diện rộng cực lớn, càn quét toàn bộ quái vật và phá hủy vũ khí tầm thường.',
  },
  {
    id: 'lightning',
    name: 'Lôi Ma Pháp (Lightning / Điện áp cao)',
    elements: ['Phong (Wind)', 'Thủy (Water)', 'Hỏa (Fire)'],
    description: 'Dồn nén ion đối nghịch trong đám mây ẩm tạo ra tia sét chớp nhoáng với tốc độ ánh sáng.',
    effect: 'Tốc độ không thể né tránh, gây tê liệt hệ thần kinh và sốc tim bất kể Đấu Khí dày đến đâu.',
  },
];

export const WORLD_LANGUAGES = [
  'Nhân thần ngữ (Human God Tongue - Thông dụng Trung Đại Lục)',
  'Ma thần ngữ (Demon God Tongue - Lục địa Ma tộc)',
  'Thú thần ngữ (Beast God Tongue - Đại Sâm Lâm)',
  'Hải thần ngữ (Sea God Tongue - Biển và Duyên hải)',
  'Thiên thần ngữ (Heaven God Tongue - Lục địa Thiên giới)',
  'Đấu thần ngữ (Fighting God Tongue - Cổ ngữ chiến binh)',
];

export const SWORD_STYLES_INFO = {
  swordGod: {
    name: 'Kiếm Thần phái (Sword God Style)',
    founder: 'Sơ đại Kiếm Thần',
    philosophy: 'Tốc độ, tấn công tuyệt đối và đòn đầu tiên tất sát. Triết lý: Ai vung kiếm trước và nhanh hơn, kẻ đó đoạt mạng đối thủ.',
    ultimateMove: 'Quang Chi Thái Đao (Longsword of Light) - Đòn chém đạt vận tốc âm thanh hoặc siêu thanh.',
    counters: 'Khắc chế Bắc Thần phái (Tốc độ đè bẹp mưu mẹo, không cho đối thủ kịp dùng đạo cụ). Bị khắc chế bởi Thủy Thần phái.',
  },
  waterGod: {
    name: 'Thủy Thần phái (Water God Style)',
    founder: 'Sơ đại Thủy Thần',
    philosophy: 'Phòng ngự phản công hoàn mỹ. Đứng yên bất động, hóa giải mọi đòn tấn công của đối thủ và phản sát tức thì.',
    ultimateMove: 'Lưu Đức (Ryuutoku) & Phản đòn tối thượng - Không thể bị đâm trúng nếu chưa ra tay trước.',
    counters: 'Khắc chế Kiếm Thần phái (Tận dụng quán tính đòn đánh thẳng tốc độ cao để chuyển hướng chém ngược). Bị khắc chế bởi Bắc Thần phái.',
  },
  northGod: {
    name: 'Bắc Thần phái (North God Style)',
    founder: 'Bắc Thần Kalman I',
    philosophy: 'Mưu lược, sinh tồn thực chiến, phóng phi đao, tung cát, tận dụng mọi địa hình và đạo cụ. Chiến thắng bằng mọi giá.',
    ultimateMove: 'Trọng lực biến ảo, phân thân thị giác và kiếm pháp bất quy tắc.',
    counters: 'Khắc chế Thủy Thần phái (Chiêu trò ném cát, đổi vũ khí, động tác giả khiến thế thủ Thủy Thần bị phá vỡ). Bị Kiếm Thần phái đè bẹp.',
  },
};

export const MAGIC_ELEMENTS_INFO = {
  fourBasics: ['Hỏa (Fire)', 'Thủy (Water)', 'Thổ (Earth)', 'Phong (Wind)'],
  supportMagic: ['Trị liệu (Healing)', 'Giải độc (Detoxification)', 'Kết giới (Barrier)', 'Thần thánh (Divine)'],
  specialMagic: ['Lôi (Lightning / Hỗn hợp)', 'Trọng lực (Gravity)', 'Triệu hồi (Summoning)', 'Thấu thị / Âm thanh'],
  threeSteps: [
    '1. Tập trung (Concentration): Dẫn truyền và tích tụ Mana từ bụng hoặc lõi cơ thể.',
    '2. Định hình (Forming/Shaping): Xác lập nguyên tố, quy mô, nhiệt độ, tốc độ ban đầu và hình dạng.',
    '3. Giải phóng (Release): Bắn ra hoặc kích hoạt hiện tượng ma pháp vào thế giới thực.',
  ],
};

export const PRESET_BACKGROUNDS = [
  {
    id: 'valoria_noble',
    name: 'Đô Thành Valoria - Quý Tộc Sa Sút (Dòng Dõi Hiệp Sĩ)',
    location: 'Đô Thành Hoàng Gia Valoria (Trung Tâm Đại Lục)',
    race: 'Nhân tộc (Human)',
    description: 'Sinh ra trong gia tộc hiệp sĩ từng phụng sự hoàng gia. Được học lễ nghi, kiếm thuật căn bản và có mối quan hệ với tầng lớp thống trị đô thành.',
    initialBonds: [
      { id: 'mentor', name: 'Hiệp Sĩ Trưởng Garrett', relation: 'Sư phụ dạy kiếm', affection: 80, notes: 'Nghiêm khắc, trung trinh, tinh thông thế kiếm quý tộc.', isAlive: true },
      { id: 'steward', name: 'Quản gia Kenneth', relation: 'Quản gia trung thành', affection: 85, notes: 'Gắn bó với gia đình qua nhiều thế hệ, am hiểu lễ nghi và kinh tế.', isAlive: true },
    ],
    initialLanguages: ['Nhân thần ngữ (Human God Tongue)'],
    baseStats: {
      manaCurrent: 20,
      manaMax: 20,
      manaPotentialMultiplier: 1.1,
      manaControl: 12,
      touki: 8,
      knowledge: 25,
      healthCurrent: 30,
      healthMax: 30,
      staminaCurrent: 25,
      staminaMax: 25,
      asuraCoins: 120,
      fatigue: 0,
    },
  },
  {
    id: 'verdant_free',
    name: 'Thung Lũng Xanh - Thiếu Niên Nông Gia Tự Do',
    location: 'Thị Trấn Thung Lũng Xanh (Biên Thùy Trù Phú)',
    race: 'Nhân tộc (Human)',
    description: 'Lớn lên giữa đồng lúa mì và trang viên thanh bình. Tự do rèn luyện thân thể, săn bắn ven rừng và tự học ma pháp mà không bị gò bó bởi quy củ thế gia.',
    initialBonds: [
      { id: 'hunter_mentor', name: 'Thợ Săn Già Varek', relation: 'Người dẫn đường hoang dã', affection: 85, notes: 'Kỳ cựu, am hiểu dấu vết ma thú và thảo dược.', isAlive: true },
      { id: 'village_chief', name: 'Trưởng trấn Elian', relation: 'Trưởng trấn phúc hậu', affection: 75, notes: 'Luôn bảo bọc và tạo điều kiện cho thiếu niên mạo hiểm.', isAlive: true },
    ],
    initialLanguages: ['Nhân thần ngữ (Human God Tongue)'],
    baseStats: {
      manaCurrent: 25,
      manaMax: 25,
      manaPotentialMultiplier: 1.2,
      manaControl: 15,
      touki: 5,
      knowledge: 15,
      healthCurrent: 28,
      healthMax: 28,
      staminaCurrent: 30,
      staminaMax: 30,
      asuraCoins: 60,
      fatigue: 0,
    },
  },
  {
    id: 'shadowwood_beast',
    name: 'Đại Sâm Lâm - Dũng Sĩ Hoang Dã (Thú Tộc & Tinh Linh)',
    location: 'Đại Sâm Lâm Dạ Thú (Lãnh Địa Thú Tộc & Tinh Linh)',
    race: 'Thú tộc (Beast Tribe - Hổ tộc / Lang tộc)',
    description: 'Sinh ra nơi rừng sâu thăm thẳm. Các giác quan, tốc độ phản xạ và thể lực vượt trội, sử dụng ngôn ngữ cổ và ma thuật âm thanh hoang dã.',
    initialBonds: [
      { id: 'chieftain', name: 'Đại Tù Trưởng Korath', relation: 'Chiến binh bảo hộ tộc', affection: 80, notes: 'Dũng mãnh, coi trọng lòng can đảm và bản năng chiến binh.', isAlive: true },
      { id: 'herbalist', name: 'Dược sư Tinh Linh Sylva', relation: 'Trị liệu sư rừng thiêng', affection: 75, notes: 'Hiền hòa, am hiểu ma thuật cỏ cây và độc thảo quý.', isAlive: true },
    ],
    initialLanguages: ['Thú thần ngữ (Beast God Tongue)', 'Nhân thần ngữ (Human God Tongue)'],
    baseStats: {
      manaCurrent: 20,
      manaMax: 20,
      manaPotentialMultiplier: 1.0,
      manaControl: 10,
      touki: 15,
      knowledge: 12,
      healthCurrent: 38,
      healthMax: 38,
      staminaCurrent: 35,
      staminaMax: 35,
      asuraCoins: 40,
      fatigue: 0,
    },
  },
  {
    id: 'dustland_nomad',
    name: 'Sa Mạc Cổ Vương - Kẻ Du Mục & Khảo Cổ Ma Tộc',
    location: 'Sa Mạc Cổ Vương Bụi Cát (Tàn Tích Vương Triều Quên Lãng)',
    race: 'Ma tộc (Demon Tribe - Tai nhọn viễn xứ)',
    description: 'Lớn lên giữa bão cát và tàn tích kim tự tháp cổ. Khả năng chịu đựng sinh tồn phi thường, tiềm năng ma thuật nén ép cao và am hiểu bảo vật di tích cổ.',
    initialBonds: [
      { id: 'caravan_leader', name: 'Thương nhân Sa mạc Tariq', relation: 'Thủ lĩnh đoàn buôn lạc đà', affection: 75, notes: 'Thực dụng, sành sỏi mua bán cổ vật và khoáng thạch.', isAlive: true },
    ],
    initialLanguages: ['Ma thần ngữ (Demon God Tongue)', 'Nhân thần ngữ (Human God Tongue)'],
    baseStats: {
      manaCurrent: 45,
      manaMax: 45,
      manaPotentialMultiplier: 1.3,
      manaControl: 18,
      touki: 8,
      knowledge: 20,
      healthCurrent: 32,
      healthMax: 32,
      staminaCurrent: 32,
      staminaMax: 32,
      asuraCoins: 50,
      fatigue: 0,
    },
  },
  {
    id: 'seagull_merchant',
    name: 'Thương Cảng Hải Yến - Kế Thừa Thương Hội Viễn Dương',
    location: 'Thương Cảng Hải Yến (Thành Phố Tự Do Ven Biển)',
    race: 'Nhân tộc (Human) hoặc Dwarf',
    description: 'Sinh ra trong gia đình thương gia sở hữu thương thuyền viễn xứ. Tiền tài dồi dào, am hiểu định giá ma thạch, hàng hóa và tài đàm phán thương thuyết.',
    initialBonds: [
      { id: 'captain', name: 'Thuyền trưởng Morgan', relation: 'Thuyền trưởng kỳ cựu', affection: 80, notes: 'Phong sương, am hiểu hải trình và các đảo thần bí hải ngoại.', isAlive: true },
    ],
    initialLanguages: ['Nhân thần ngữ (Human God Tongue)', 'Hải thần ngữ (Sea God Tongue)'],
    baseStats: {
      manaCurrent: 25,
      manaMax: 25,
      manaPotentialMultiplier: 1.0,
      manaControl: 12,
      touki: 5,
      knowledge: 30,
      healthCurrent: 26,
      healthMax: 26,
      staminaCurrent: 25,
      staminaMax: 25,
      asuraCoins: 250,
      fatigue: 0,
    },
  },
];

/**
 * Calculates mana capacity bonus during Golden Childhood (Age 0 - 10)
 */
export function calculateChildhoodManaGrowth(
  currentAge: number,
  actionType: 'magic_exhaustion' | 'magic_practice' | 'sword_training' | 'study',
  currentMultiplier: number
): { manaBonus: number; newMultiplier: number; chantlessBonus: number } {
  if (currentAge >= 10) {
    return { manaBonus: 1, newMultiplier: currentMultiplier, chantlessBonus: 0 };
  }

  if (currentAge < 5) {
    if (actionType === 'magic_exhaustion') {
      return {
        manaBonus: Math.round(15 * currentMultiplier),
        newMultiplier: Math.min(4.0, currentMultiplier + 0.1),
        chantlessBonus: 15,
      };
    }
    if (actionType === 'magic_practice') {
      return {
        manaBonus: Math.round(8 * currentMultiplier),
        newMultiplier: Math.min(3.5, currentMultiplier + 0.05),
        chantlessBonus: 8,
      };
    }
    if (actionType === 'sword_training') {
      return {
        manaBonus: 1,
        newMultiplier: currentMultiplier,
        chantlessBonus: 0,
      };
    }
  } else {
    if (actionType === 'magic_exhaustion') {
      return {
        manaBonus: Math.round(10 * currentMultiplier),
        newMultiplier: Math.min(3.0, currentMultiplier + 0.03),
        chantlessBonus: 5,
      };
    }
    if (actionType === 'magic_practice') {
      return {
        manaBonus: Math.round(5 * currentMultiplier),
        newMultiplier: Math.min(2.5, currentMultiplier + 0.02),
        chantlessBonus: 3,
      };
    }
  }

  return { manaBonus: 2, newMultiplier: currentMultiplier, chantlessBonus: 1 };
}

/**
 * Combat Engine: Evaluates hidden stat checks (Tier Gap, Touki, Chantless, Stance Counters)
 */
export interface CombatCheckResult {
  tierGap: number;
  isDirectAttackNullified: boolean;
  toukiDiff: number;
  isArmorPenetrated: boolean;
  stanceAdvantage: 'advantage' | 'disadvantage' | 'neutral';
  stanceNote?: string;
  distanceEffect: 'melee_danger' | 'range_advantage' | 'balanced';
  calculatedDamagePlayer: number;
  calculatedDamageOpponent: number;
  isFatal: boolean;
  fatalReason?: string;
}

export interface SkillValidationResult {
  isValid: boolean;
  backfireReason?: string;
  hpPenalty: number;
  manaPenalty: number;
  isFatal?: boolean;
}

/**
 * RULE 2 & RULE 3: Ràng buộc kỹ năng chưa học & Ba đại kiếm phái
 */
export function validateUnlearnedSkillUsage(
  character: Character,
  actionText: string = '',
  isSystemChoice: boolean = false
): SkillValidationResult {
  // System-generated choices and guided story actions are always valid
  if (isSystemChoice) {
    return { isValid: true, hpPenalty: 0, manaPenalty: 0 };
  }

  const text = (actionText || '').toLowerCase();

  // Training, exploring, learning or basic conditioning actions are completely allowed
  const isTrainingOrExploring = 
    text.includes('luyện') || text.includes('tập') || text.includes('học') || 
    text.includes('cảm nhận') || text.includes('thử') || text.includes('nghiên cứu') || 
    text.includes('đọc') || text.includes('thiền') || text.includes('thăm dò') || 
    text.includes('quan sát') || text.includes('hỏi') || text.includes('xin') || 
    text.includes('nghe') || text.includes('bò') || text.includes('co duỗi') || 
    text.includes('vận động') || text.includes('khóc') || text.includes('bú') || 
    text.includes('nghỉ') || text.includes('tĩnh tọa') || text.includes('điều hòa') ||
    text.includes('bước chân') || text.includes('sơ khai') || text.includes('nền tảng') ||
    text.includes('thủ thế') || text.includes('phòng ngự') || text.includes('kéo giãn');

  if (isTrainingOrExploring) {
    return { isValid: true, hpPenalty: 0, manaPenalty: 0 };
  }

  // Helper to ensure backfire never kills the player
  const currentHp = character.stats.healthCurrent || 20;
  const calcSafePenalty = (rawPenalty: number) => {
    if (character.progression?.innateTalent?.id === 'immortal_bloodline') return 0;
    return Math.max(1, Math.min(Math.max(1, Math.floor(currentHp * 0.2)), rawPenalty));
  };

  // 1. RÀNG BUỘC KỸ NĂNG VÀ MA PHÁP (RULE 2)
  const attemptsFire = (text.includes('hỏa') || text.includes('lửa') || text.includes('fire') || text.includes('flame') || text.includes('hỏa cầu') || text.includes('đốm lửa')) && !text.includes('luyện');
  if (attemptsFire && character.magic.fire === 'Chưa học') {
    return {
      isValid: false,
      backfireReason: '🚫 [PHẢN PHỆ MA LỰC - CHƯA HỌC HỎA MA PHÁP]: Bạn chưa từng được sư phụ hướng dẫn hay nghiên cứu thành công Hỏa Ma Pháp! Khi cố tình dồn ép Mana tạo lửa, ngọn lửa mất kiểm soát phát nổ làm bỏng rát lòng bàn tay!',
      hpPenalty: calcSafePenalty(8),
      manaPenalty: 10,
    };
  }

  const attemptsWater = (text.includes('thủy') || text.includes('nước') || text.includes('băng') || text.includes('water') || text.includes('ice') || text.includes('thủy pháo') || text.includes('mũi tên băng')) && !text.includes('thủy thần');
  if (attemptsWater && character.magic.water === 'Chưa học') {
    return {
      isValid: false,
      backfireReason: '🚫 [PHẢN PHỆ MA LỰC - CHƯA HỌC THỦY MA PHÁP]: Bạn chưa từng học hoặc định hình Thủy Ma Pháp! Nước ngưng tụ sai cấu trúc phân rã thành luồng hàn khí thấu xương làm tê liệt cánh tay!',
      hpPenalty: calcSafePenalty(12),
      manaPenalty: 20,
    };
  }

  const attemptsEarth = text.includes('thổ') || text.includes('đất') || text.includes('đạn đá') || text.includes('tường đá') || text.includes('bùn lầy') || text.includes('quagmire') || text.includes('đầm lầy') || text.includes('nham thạch');
  if (attemptsEarth && character.magic.earth === 'Chưa học' && character.magic.water === 'Chưa học') {
    return {
      isValid: false,
      backfireReason: '🚫 [PHẢN PHỆ MA LỰC - CHƯA HỌC THỔ MA PHÁP]: Bạn chưa từng nắm vững nguyên lý ma pháp Đất đá! Mặt đất dưới chân sụt lở mất kiểm soát khiến bạn mất thăng bằng và ngã dập mặt!',
      hpPenalty: calcSafePenalty(10),
      manaPenalty: 15,
    };
  }

  const attemptsWind = text.includes('phong') || text.includes('gió') || text.includes('lốc') || text.includes('phong nhận') || text.includes('lưỡi dao gió');
  if (attemptsWind && character.magic.wind === 'Chưa học') {
    return {
      isValid: false,
      backfireReason: '🚫 [PHẢN PHỆ MA LỰC - CHƯA HỌC PHONG MA PHÁP]: Bạn chưa từng học cách tạo áp suất khí quyển! Cơn lốc ngược đập thẳng vào ngực khiến bạn nghẹt thở ho ra máu!',
      hpPenalty: calcSafePenalty(14),
      manaPenalty: 20,
    };
  }

  const attemptsHealing = text.includes('trị liệu') || text.includes('chữa lành') || text.includes('phục hồi vết thương') || text.includes('chữa trị') || text.includes('healing');
  if (attemptsHealing && character.magic.healing === 'Chưa học') {
    return {
      isValid: false,
      backfireReason: '🚫 [THẤT BẠI - CHƯA HỌC MA PHÁP TRỊ LIỆU]: Ma pháp Trị liệu đòi hỏi tần số Mana thần thánh tinh tế mà bạn chưa từng được truyền dạy! Vết thương không những không lành mà tế bào còn bị kích thích sưng tấy đau đớn!',
      hpPenalty: calcSafePenalty(8),
      manaPenalty: 25,
    };
  }

  const attemptsDetox = text.includes('giải độc') || text.includes('detox');
  if (attemptsDetox && character.magic.detox === 'Chưa học') {
    return {
      isValid: false,
      backfireReason: '🚫 [THẤT BẠI - CHƯA HỌC GIẢI ĐỘC]: Bạn không nắm vững công thức trung hòa độc tố! Ma lực kích hoạt khiến độc tố trong cơ thể lan nhanh hơn!',
      hpPenalty: calcSafePenalty(15),
      manaPenalty: 20,
    };
  }

  const attemptsBarrier = text.includes('kết giới') || text.includes('màng chắn ma pháp') || text.includes('barrier');
  if (attemptsBarrier && character.magic.barrier === 'Chưa học') {
    return {
      isValid: false,
      backfireReason: '🚫 [THẤT BẠI - CHƯA HỌC KẾT GIỚI]: Bạn chưa từng học lý thuyết cấu trúc Kết Giới! Ma lực giải phóng phân tán hỗn loạn vào không khí, tiêu hao vô ích và khiến lồng ngực đau nhói!',
      hpPenalty: calcSafePenalty(6),
      manaPenalty: 20,
    };
  }

  const attemptsSummoning = text.includes('triệu hồi') || text.includes('summon');
  if (attemptsSummoning && (!character.magic.summoning || character.magic.summoning === 'Chưa học')) {
    return {
      isValid: false,
      backfireReason: '🚫 [THẤT BẠI - CHƯA HỌC MA PHÁP TRIỆU HỒI]: Triệu hồi đòi hỏi ma pháp trận chuẩn xác và khế ước linh hồn! Cố ý niệm phép không có công thức khiến vòng tròn ma lực sụp đổ, chấn động kinh mạch!',
      hpPenalty: calcSafePenalty(18),
      manaPenalty: 30,
    };
  }

  const attemptsChantlessExplicit = text.includes('vô niệm chú') || text.includes('không cần niệm') || text.includes('không đọc chú') || text.includes('bắn tức thì không cần câu chú') || text.includes('chantless');
  const hasChantlessAffinity = character.magic.chantless || character.progression?.innateTalent?.id === 'nature_resonance' || (character.magic.chantlessProgress || 0) >= 100;
  if (attemptsChantlessExplicit && !hasChantlessAffinity) {
    return {
      isValid: false,
      backfireReason: '🚫 [PHẢN PHỆ VÔ NIỆM CHÚ - CHƯA MỞ KHÓA]: Bạn chưa nắm vững bí thuật Vô Niệm Chú (Chantless Magic)! Ép buộc giải phóng ma pháp mà không niệm chú khiến dòng mana bị xáo trộn nhẹ!',
      hpPenalty: calcSafePenalty(5),
      manaPenalty: 10,
    };
  }

  const attemptsNuclearOrSaint = text.includes('đạn hạch') || text.includes('nuclear') || text.includes('cumulonimbus') || text.includes('lôi quang') || text.includes('lôi ma pháp') || text.includes('bão sấm');
  const hasSaintMagic = character.magic.water === 'Thánh cấp (Saint)' || character.magic.water === 'Vương cấp (King)' || character.magic.water === 'Đế cấp (Emperor)' || character.magic.water === 'Thần cấp (God)';
  if (attemptsNuclearOrSaint && !hasSaintMagic && character.stats.age < 12) {
    return {
      isValid: false,
      backfireReason: '🚫 [CẤM THUẬT VƯỢT CẤP - PHẢN PHỆ HẠCH TÂM]: Bạn cố gắng thi triển ma pháp cấp Thánh/Vương có sức công phá thời tiết khi bình chứa Mana chưa hoàn thiện! Vòng xoáy ma lực nổ tung tại chỗ thiêu đốt 40% sinh mệnh!',
      hpPenalty: calcSafePenalty(20),
      manaPenalty: 50,
    };
  }

  // 2. RÀNG BUỘC ĐẤU KHÍ (TOUKI)
  const attemptsTouki = text.includes('đấu khí') || text.includes('phủ đấu khí') || text.includes('bọc đấu khí') || text.includes('dồn đấu khí') || text.includes('touki');
  const hasNoTouki = (!character.stats.touki || character.stats.touki <= 0) && 
    character.swordsmanship.swordGod === 'Chưa học' && 
    character.swordsmanship.waterGod === 'Chưa học' && 
    character.swordsmanship.northGod === 'Chưa học';
  if (attemptsTouki && hasNoTouki) {
    return {
      isValid: false,
      backfireReason: '🚫 [CHƯA KHAI MỞ ĐẤU KHÍ (TOUKI)]: Cơ thể bạn chưa từng được rèn luyện thể chất đạt ngưỡng thức tỉnh Đấu Khí! Việc cố gồng ép cơ bắp chỉ khiến bạn bị chuột rút toàn thân và rách cơ bắp!',
      hpPenalty: calcSafePenalty(8),
      manaPenalty: 5,
    };
  }

  // 3. RÀNG BUỘC BA ĐẠI KIẾM PHÁI (RULE 3)
  const attemptsSwordGod = text.includes('kiếm thần phái') || text.includes('kiếm thần lưu') || text.includes('kiếm thần') || text.includes('quang chi thái đao') || text.includes('longsword of light');
  if (attemptsSwordGod && character.swordsmanship.swordGod === 'Chưa học') {
    return {
      isValid: false,
      backfireReason: '🚫 [KIẾM PHÁI CHƯA HỌC - KIẾM THẦN PHÁI]: Bạn chưa từng bái sư gia nhập Kiếm Thần phái! Đòn chém chỉ là "vung kiếm bản năng của thường dân", hoàn toàn không có bộ pháp dồn trọng tâm và Đấu Khí bảo hộ, vũ khí bị chấn nứt rạn và mất sạch đà thế!',
      hpPenalty: calcSafePenalty(10),
      manaPenalty: 10,
    };
  }

  const attemptsWaterGod = text.includes('thủy thần phái') || text.includes('thủy thần lưu') || text.includes('thủy thần') || text.includes('thế thủ lưu đức') || text.includes('lưu đạo phản công');
  if (attemptsWaterGod && character.swordsmanship.waterGod === 'Chưa học') {
    return {
      isValid: false,
      backfireReason: '🚫 [KIẾM PHÁI CHƯA HỌC - THỦY THẦN PHÁI]: Bạn chưa từng học Thủy Thần phái! Đòn đánh chỉ là bản năng thường dân, cố gắng đứng yên bắt chước thế thủ phản đòn khiến bạn bị đánh mất đà ngã nhào, lãnh trọn đòn tấn công của đối thủ!',
      hpPenalty: calcSafePenalty(12),
      manaPenalty: 10,
    };
  }

  const attemptsNorthGod = text.includes('bắc thần phái') || text.includes('bắc thần lưu') || text.includes('bắc thần') || text.includes('mưu mẹo bắc thần');
  if (attemptsNorthGod && character.swordsmanship.northGod === 'Chưa học') {
    return {
      isValid: false,
      backfireReason: '🚫 [KIẾM PHÁI CHƯA HỌC - BẮC THẦN PHÁI]: Bạn chưa từng nghiên cứu kiếm thuật Bắc Thần phái! Thiếu kỹ thuật Đấu Khí và bộ pháp, mưu mẹo vụng về của thường dân dễ dàng bị đối phương nhìn thấu và phản đòn chí mạng!',
      hpPenalty: calcSafePenalty(10),
      manaPenalty: 10,
    };
  }

  return { isValid: true, hpPenalty: 0, manaPenalty: 0 };
}

export function performCombatCheck(
  player: Character,
  opponent: Opponent,
  playerActionText: string,
  castMode: 'chantless' | 'chanting' | 'sword' = 'chantless'
): CombatCheckResult {
  const playerHighestTier = Math.max(
    TIER_RANK_MAP[player.magic.water] || 0,
    TIER_RANK_MAP[player.magic.fire] || 0,
    TIER_RANK_MAP[player.magic.earth] || 0,
    TIER_RANK_MAP[player.magic.wind] || 0,
    TIER_RANK_MAP[player.swordsmanship.swordGod] || 0,
    TIER_RANK_MAP[player.swordsmanship.waterGod] || 0,
    TIER_RANK_MAP[player.swordsmanship.northGod] || 0,
    player.stats.age <= 5 ? 1 : 2
  );

  const safeActionText = playerActionText || '';
  const opponentRank = TIER_RANK_MAP[opponent.powerTier] || 2;
  const tierGap = opponentRank - playerHighestTier;

  // RULE 4: BỨC TƯỜNG CẤP BẬC & QUY LUẬT HIỆU LỰC GIẢM DẦN
  const isDirectAttackNullified = tierGap >= 2;

  // Rule 2: Touki armor check & Equipment bonuses
  const equipBonuses = calculateTotalEquipBonuses(player.equipment);
  const equipPenetration = equipBonuses.toukiPenetration || 0;
  const equipDefense = equipBonuses.defenseBonus || 0;

  const playerPenetration = (player.stats.touki * 0.8) + (player.stats.manaControl * 0.5) + equipPenetration;
  const toukiDiff = opponent.touki - playerPenetration;
  const isArmorPenetrated = toukiDiff <= 15;

  let distanceEffect: 'melee_danger' | 'range_advantage' | 'balanced' = 'balanced';
  let isFatal = false;
  let fatalReason: string | undefined = undefined;

  const isPlayerMage = player.stats.touki < 15 && player.stats.manaMax >= 50;
  const isOpponentSwordsman = opponent.type === 'swordsman' || opponent.swordStyle !== 'Hoang dã';

  if (opponent.distance === 'Cận chiến (0-2m)' && isPlayerMage && isOpponentSwordsman && castMode === 'chanting') {
    distanceEffect = 'melee_danger';
  } else if (opponent.distance === 'Bắn xa (>20m)' && player.magic.chantless) {
    distanceEffect = 'range_advantage';
  }

  // Sword Style Counter Matrix
  let stanceAdvantage: 'advantage' | 'disadvantage' | 'neutral' = 'neutral';
  let stanceNote: string | undefined = undefined;
  const actionLower = safeActionText.toLowerCase();

  const isPlayerSwordGod = actionLower.includes('kiếm thần') || player.swordsmanship.preferredStyle === 'swordGod';
  const isPlayerWaterGod = actionLower.includes('thủy thần') || player.swordsmanship.preferredStyle === 'waterGod';
  const isPlayerNorthGod = actionLower.includes('bắc thần') || actionLower.includes('mưu') || actionLower.includes('cát') || player.swordsmanship.preferredStyle === 'northGod';

  if (opponent.swordStyle === 'Bắc Thần phái' && isPlayerSwordGod) {
    stanceAdvantage = 'advantage';
    stanceNote = 'Kiếm Thần phái khắc chế Bắc Thần phái: Tốc độ áp đảo bóp nghẹt mọi mưu mẹo!';
  } else if (opponent.swordStyle === 'Kiếm Thần phái' && isPlayerWaterGod) {
    stanceAdvantage = 'advantage';
    stanceNote = 'Thủy Thần phái khắc chế Kiếm Thần phái: Hóa giải đòn đánh thẳng thần tốc và phản công hoàn mỹ!';
  } else if (opponent.swordStyle === 'Thủy Thần phái' && isPlayerNorthGod) {
    stanceAdvantage = 'advantage';
    stanceNote = 'Bắc Thần phái khắc chế Thủy Thần phái: Đòn biến ảo và đạo cụ phá vỡ thế phòng thủ định sẵn!';
  } else if (opponent.swordStyle === 'Kiếm Thần phái' && isPlayerNorthGod) {
    stanceAdvantage = 'disadvantage';
    stanceNote = 'Bắc Thần phái bị Kiếm Thần phái khắc chế: Tốc độ của đối thủ quá nhanh để tung chiêu trò!';
  } else if (opponent.swordStyle === 'Thủy Thần phái' && isPlayerSwordGod) {
    stanceAdvantage = 'disadvantage';
    stanceNote = 'Kiếm Thần phái bị Thủy Thần phái khắc chế: Nhát chém thẳng bị đối phương bắt bài hoàn toàn!';
  } else if (opponent.swordStyle === 'Bắc Thần phái' && isPlayerWaterGod) {
    stanceAdvantage = 'disadvantage';
    stanceNote = 'Thủy Thần phái bị Bắc Thần phái khắc chế: Mưu mô bất quy tắc làm loạn phản xạ!';
  }

  // Damage Calculation with Strict Tier Wall (Rule 4)
  let calculatedDamageOpponent = 20;
  let calculatedDamagePlayer = 12;

  if (tierGap >= 2) {
    // Cao hơn 2 Cấp trở lên: HOÀN TOÀN KHÔNG CÓ TÁC DỤNG!
    calculatedDamageOpponent = 0;
    
    // Nếu chênh lệch cấp bậc quá lớn (tierGap >= 2)
    calculatedDamagePlayer = Math.max(25, Math.min(Math.round(player.stats.healthMax * 0.65), player.stats.healthCurrent - 5));
    if (player.progression?.innateTalent?.id === 'immortal_bloodline') {
      calculatedDamagePlayer = Math.min(calculatedDamagePlayer, Math.round(player.stats.healthMax * 0.3));
    }
    stanceNote = (stanceNote ? stanceNote + ' | ' : '') + `⚠️ [BỨC TƯỜNG CẤP BẬC +${tierGap} CẤP]: Đòn đánh của bạn hoàn toàn bị lớp Đấu Khí đối thủ tán vụn! Đối phương phản chấn dữ dội làm chấn thương kinh mạch, hãy kéo giãn cự ly hoặc đào tẩu ngay!`;
    isFatal = false;
  } else if (tierGap === 1) {
    // Cao hơn 1 Cấp: BỊ GIẢM MẠNH HIỆU QUẢ (75% bị triệt tiêu)
    calculatedDamageOpponent = Math.max(1, Math.round(calculatedDamageOpponent * 0.25));
    calculatedDamagePlayer = Math.round(calculatedDamagePlayer * 1.6);
    stanceNote = (stanceNote ? stanceNote + ' | ' : '') + '⚠️ [BỨC TƯỜNG CẤP BẬC +1 CẤP]: Đối thủ cao hơn 1 cấp bậc, lớp Đấu Khí triệt tiêu 75% sát thương của bạn và dễ dàng bắt bài nhịp độ!';
  } else {
    // Cùng cấp hoặc thấp hơn
    if (stanceAdvantage === 'advantage') {
      calculatedDamageOpponent += 20;
      calculatedDamagePlayer = Math.max(2, calculatedDamagePlayer - 10);
    } else if (stanceAdvantage === 'disadvantage') {
      calculatedDamageOpponent = Math.max(2, calculatedDamageOpponent - 10);
      calculatedDamagePlayer += 15;
    }

    if (!isArmorPenetrated) {
      calculatedDamageOpponent = Math.round(calculatedDamageOpponent * 0.3);
    }

    if (castMode === 'chanting') {
      calculatedDamageOpponent = Math.round(calculatedDamageOpponent * 1.4);
    }

    const weaponBonus = (equipBonuses.physicalDamageBonus || 0) + (equipBonuses.magicDamageBonus || 0);
    calculatedDamageOpponent += weaponBonus;

    let reduction = equipDefense;
    if (opponent.magicSchool || opponent.mana > 30) {
      reduction += Math.round(calculatedDamagePlayer * ((equipBonuses.magicResistanceBonus || 0) / 100));
    }
    calculatedDamagePlayer = Math.max(1, calculatedDamagePlayer - reduction);

    if ((equipBonuses.speedAgilityBonus || 0) >= 15) {
      calculatedDamagePlayer = Math.max(1, Math.round(calculatedDamagePlayer * 0.8));
    }
  }

  return {
    tierGap,
    isDirectAttackNullified,
    toukiDiff,
    isArmorPenetrated,
    stanceAdvantage,
    stanceNote,
    distanceEffect,
    calculatedDamagePlayer,
    calculatedDamageOpponent,
    isFatal,
    fatalReason,
  };
}

/**
 * Calculate total active bonuses from all equipped slots
 */
export function calculateTotalEquipBonuses(equipment?: EquipmentSet): ItemStatBonus {
  const total: ItemStatBonus = {
    toukiPenetration: 0,
    manaCostReduction: 0,
    defenseBonus: 0,
    physicalDamageBonus: 0,
    magicDamageBonus: 0,
    speedAgilityBonus: 0,
    manaMaxBonus: 0,
    manaRegenBonus: 0,
    magicResistanceBonus: 0,
    poisonResistanceBonus: 0,
    luckBonus: 0,
    hpHealAmount: 0,
    staminaHealAmount: 0,
  };

  if (!equipment) return total;

  const slots: (keyof EquipmentSet)[] = [
    'head', 'body', 'legs', 'feet', 'leftHand', 'rightHand',
    'accessory1', 'accessory2', 'accessory3', 'accessory4', 'accessory5'
  ];

  for (const slot of slots) {
    const item = equipment[slot];
    if (!item || !item.statBonus) continue;

    // Two-handed weapon occupies both hands (leftHand and rightHand share the same weapon)
    // Only count it once by skipping rightHand when it's the same two-handed weapon
    if (
      slot === 'rightHand' && 
      equipment.leftHand?.id && 
      equipment.leftHand.id === equipment.rightHand?.id && 
      (item.isTwoHanded || item.equipSlot === 'twoHanded')
    ) {
      continue;
    }

    const b = item.statBonus;
    if (b.toukiPenetration) total.toukiPenetration! += b.toukiPenetration;
    if (b.manaCostReduction) total.manaCostReduction! += b.manaCostReduction;
    if (b.defenseBonus) total.defenseBonus! += b.defenseBonus;
    if (b.physicalDamageBonus) total.physicalDamageBonus! += b.physicalDamageBonus;
    if (b.magicDamageBonus) total.magicDamageBonus! += b.magicDamageBonus;
    if (b.speedAgilityBonus) total.speedAgilityBonus! += b.speedAgilityBonus;
    if (b.manaMaxBonus) total.manaMaxBonus! += b.manaMaxBonus;
    if (b.manaRegenBonus) total.manaRegenBonus! += b.manaRegenBonus;
    if (b.magicResistanceBonus) total.magicResistanceBonus! += b.magicResistanceBonus;
    if (b.poisonResistanceBonus) total.poisonResistanceBonus! += b.poisonResistanceBonus;
    if (b.luckBonus) total.luckBonus! += b.luckBonus;
  }

  return total;
}

/**
 * Format standard Equipment HUD block for turn summaries (only showing filled slots)
 */
export function formatEquipmentSummary(equipment?: EquipmentSet): string {
  if (!equipment) {
    return `---
[ BẢNG TRANG BỊ ĐANG ĐEO ]
(Chưa có trang bị nào được đeo trên người)
---`;
  }

  const head = equipment.head?.name;
  const body = equipment.body?.name;
  const legs = equipment.legs?.name;
  const feet = equipment.feet?.name;
  const leftHand = equipment.leftHand?.name;
  const rightHand = equipment.rightHand?.name;

  const accessories: string[] = [];
  const accSlots: (keyof EquipmentSet)[] = ['accessory1', 'accessory2', 'accessory3', 'accessory4', 'accessory5'];
  for (const s of accSlots) {
    if (equipment[s]) {
      accessories.push(equipment[s]!.name);
    }
  }

  const hasAnyEquip = head || body || legs || feet || leftHand || rightHand || accessories.length > 0;
  if (!hasAnyEquip) {
    return `---
[ BẢNG TRANG BỊ ĐANG ĐEO ]
(Chưa có trang bị nào được đeo trên người - Dùng lệnh hoặc mở Túi đồ)
---`;
  }

  const armorRowParts: string[] = [];
  if (head) armorRowParts.push(`Đầu: [${head}]`);
  if (body) armorRowParts.push(`Thân: [${body}]`);
  if (legs) armorRowParts.push(`Quần: [${legs}]`);
  if (feet) armorRowParts.push(`Giày: [${feet}]`);

  const weaponRowParts: string[] = [];
  if (equipment.leftHand?.id && equipment.leftHand.id === equipment.rightHand?.id && (equipment.leftHand.isTwoHanded || equipment.leftHand.equipSlot === 'twoHanded')) {
    weaponRowParts.push(`Cả 2 Tay: [${equipment.leftHand.name}] (Vũ khí 2 tay)`);
  } else {
    if (leftHand) weaponRowParts.push(`Tay Trái: [${leftHand}]`);
    if (rightHand) weaponRowParts.push(`Tay Phải: [${rightHand}]`);
  }

  const lines: string[] = ['---', '[ BẢNG TRANG BỊ ĐANG ĐEO ]'];
  if (armorRowParts.length > 0) {
    lines.push(`- ${armorRowParts.join(' | ')}`);
  }
  if (weaponRowParts.length > 0) {
    lines.push(`- ${weaponRowParts.join(' | ')}`);
  }
  if (accessories.length > 0) {
    lines.push(`- Trang sức (${accessories.length}/5): ${accessories.map(a => `[${a}]`).join(', ')}`);
  }
  lines.push('---');

  return lines.join('\n');
}

/**
 * Determine which equipment slots are compatible with an item.
 * Supports explicit slot keys, slot categories, and smart keyword / type inferences.
 */
export function getValidSlotsForItem(item: InventoryItem | null | undefined): EquipmentSlotKey[] {
  if (!item) return [];

  // Direct exact slot key match
  const allSlotKeys: EquipmentSlotKey[] = [
    'head', 'body', 'legs', 'feet', 'leftHand', 'rightHand',
    'accessory1', 'accessory2', 'accessory3', 'accessory4', 'accessory5'
  ];
  if (item.equipSlot && (allSlotKeys as string[]).includes(item.equipSlot)) {
    if (item.equipSlot.startsWith('accessory')) {
      return ['accessory1', 'accessory2', 'accessory3', 'accessory4', 'accessory5'];
    }
    return [item.equipSlot as EquipmentSlotKey];
  }

  // Generic categories / Aliases
  const slotStr = (item.equipSlot as string) || '';
  if (slotStr === 'twoHanded' || item.isTwoHanded) return ['leftHand'];
  if (slotStr === 'hand' || slotStr === 'weapon' || slotStr === 'staff') return ['leftHand', 'rightHand'];
  if (slotStr === 'accessory' || slotStr.startsWith('accessory')) {
    return ['accessory1', 'accessory2', 'accessory3', 'accessory4', 'accessory5'];
  }
  if (slotStr === 'armor' || slotStr === 'body') return ['body'];
  if (slotStr === 'head') return ['head'];
  if (slotStr === 'legs') return ['legs'];
  if (slotStr === 'feet') return ['feet'];

  const name = (item.name || '').toLowerCase();
  const type = (item.type || '').toLowerCase();

  // 1. Shields (Hands, NOT body even if type === 'armor')
  if (
    name.includes('khiên') || name.includes('thuẫn') || name.includes('shield') ||
    name.includes('buckler') || name.includes('tấm chắn')
  ) {
    return ['leftHand', 'rightHand'];
  }

  // 2. Head
  if (
    name.includes('mũ') || name.includes('nón') || name.includes('khăn') || 
    name.includes('vương miện') || name.includes('helmet') || name.includes('circlet') || 
    name.includes('tiara') || name.includes('hood') || name.includes('băng trán') ||
    name.includes('mặt nạ')
  ) {
    return ['head'];
  }

  // 3. Feet
  if (
    name.includes('giày') || name.includes('bốt') || name.includes('hài') || 
    name.includes('ủng') || name.includes('boots') || name.includes('shoes')
  ) {
    return ['feet'];
  }

  // 4. Legs
  if (
    name.includes('quần') || name.includes('giáp chân') || name.includes('xà cạp') || 
    name.includes('pants') || name.includes('greaves') || name.includes('leggings') ||
    name.includes('khố')
  ) {
    return ['legs'];
  }

  // 5. Weapons & Staffs & Grimoires & Books
  if (
    type === 'weapon' || type === 'staff' || type === 'grimoire' ||
    name.includes('kiếm') || name.includes('đao') || name.includes('dao') || 
    name.includes('trượng') || name.includes('pháp trượng') || name.includes('cung') || 
    name.includes('thương') || name.includes('giáo') || name.includes('rìu') || name.includes('búa') || 
    name.includes('sách') || name.includes('kinh') || name.includes('quyển') ||
    name.includes('sword') || name.includes('blade') || name.includes('dagger') || 
    name.includes('staff') || name.includes('wand') || name.includes('bow')
  ) {
    if (item.isTwoHanded || name.includes('hai tay') || name.includes('2 tay') || name.includes('đại kiếm')) {
      return ['leftHand'];
    }
    return ['leftHand', 'rightHand'];
  }

  // 6. Body Armor
  if (
    type === 'armor' ||
    name.includes('áo') || name.includes('choàng') || name.includes('giáp thân') || 
    name.includes('giáp ngực') || name.includes('giáp trụ') || name.includes('robe') || name.includes('armor') || 
    name.includes('cloak') || name.includes('cuirass') || name.includes('tunic') ||
    name.includes('bào') || name.includes('y phục')
  ) {
    return ['body'];
  }

  // 7. Accessories
  if (
    type === 'accessory' ||
    name.includes('nhẫn') || name.includes('dây chuyền') || name.includes('vòng') || 
    name.includes('bùa') || name.includes('ngọc') || name.includes('khuyên') || 
    name.includes('hộ mệnh') || name.includes('ring') || name.includes('amulet') || 
    name.includes('necklace') || name.includes('pendant') || name.includes('talisman') ||
    name.includes('huy hiệu') || name.includes('huy chương') || name.includes('tinh thể') ||
    name.includes('đá ma thuật')
  ) {
    return ['accessory1', 'accessory2', 'accessory3', 'accessory4', 'accessory5'];
  }

  // 8. Fallback for any non-consumable item that has stat bonuses
  if (type !== 'consumable' && type !== 'loot' && item.statBonus) {
    if (item.statBonus.defenseBonus) {
      return ['body', 'accessory1', 'accessory2', 'accessory3', 'accessory4', 'accessory5'];
    }
    if (item.statBonus.physicalDamageBonus || item.statBonus.toukiPenetration) {
      return ['leftHand', 'rightHand', 'accessory1', 'accessory2', 'accessory3', 'accessory4', 'accessory5'];
    }
    return ['accessory1', 'accessory2', 'accessory3', 'accessory4', 'accessory5'];
  }

  return [];
}

/**
 * Equip an item into a character's equipment slot
 */
export function equipItem(
  character: Character,
  itemId: string,
  targetSlot?: EquipmentSlotKey
): { success: boolean; message: string; updatedCharacter: Character } {
  const updated: Character = JSON.parse(JSON.stringify(character));
  if (!updated.equipment) {
    updated.equipment = {};
  }
  if (!updated.inventory) {
    updated.inventory = [];
  }

  const searchId = (itemId || '').toLowerCase().trim();
  const itemIndex = updated.inventory.findIndex(i => {
    if (!i) return false;
    if (i.id === itemId) return true;
    if (i.id && i.id.toLowerCase() === searchId) return true;
    if (i.name && i.name.toLowerCase() === searchId) return true;
    if (i.name && searchId.length >= 3 && (i.name.toLowerCase().includes(searchId) || searchId.includes(i.name.toLowerCase()))) return true;
    return false;
  });

  if (itemIndex === -1) {
    return { success: false, message: 'Không tìm thấy vật phẩm trong túi đồ.', updatedCharacter: character };
  }

  const itemToEquip = { ...updated.inventory[itemIndex] };
  const validSlots = getValidSlotsForItem(itemToEquip);

  if (validSlots.length === 0) {
    return { 
      success: false, 
      message: `Vật phẩm [${itemToEquip.name}] không thể trang bị (đây là vật phẩm tiêu hao hoặc nguyên liệu).`, 
      updatedCharacter: character 
    };
  }

  const isAccessory = itemToEquip.equipSlot === 'accessory' || itemToEquip.type === 'accessory' || validSlots.includes('accessory1');
  const accSlots: EquipmentSlotKey[] = ['accessory1', 'accessory2', 'accessory3', 'accessory4', 'accessory5'];

  // Normalize targetSlot if generic 'hand' or 'accessory'
  let normalizedTargetSlot = targetSlot;
  if ((targetSlot as any) === 'hand') {
    normalizedTargetSlot = !updated.equipment.leftHand ? 'leftHand' : (!updated.equipment.rightHand ? 'rightHand' : 'leftHand');
  } else if ((targetSlot as any) === 'accessory' || (!targetSlot && isAccessory)) {
    // If no specific slot was passed, find the first EMPTY accessory slot (1 to 5)
    const freeAcc = accSlots.find(s => !updated.equipment[s]);
    normalizedTargetSlot = freeAcc || 'accessory1';
  }

  let finalSlot: EquipmentSlotKey = normalizedTargetSlot || (isAccessory ? (accSlots.find(s => !updated.equipment[s]) || 'accessory1') : validSlots[0]);

  if (!normalizedTargetSlot || !validSlots.includes(normalizedTargetSlot)) {
    if (isAccessory) {
      const freeAcc = accSlots.find(s => !updated.equipment[s]);
      finalSlot = freeAcc || 'accessory1';
    } else if (itemToEquip.isTwoHanded || itemToEquip.equipSlot === 'twoHanded') {
      finalSlot = 'leftHand';
    } else if (validSlots.includes('leftHand') || validSlots.includes('rightHand')) {
      if (!updated.equipment.leftHand) {
        finalSlot = 'leftHand';
      } else if (!updated.equipment.rightHand) {
        finalSlot = 'rightHand';
      } else {
        finalSlot = 'leftHand';
      }
    } else {
      finalSlot = validSlots[0];
    }
  }

  // Remove the item from inventory
  updated.inventory.splice(itemIndex, 1);
  itemToEquip.isEquipped = true;

  // Ensure equipSlot is properly recorded on the item
  if (finalSlot.startsWith('accessory')) {
    itemToEquip.equipSlot = 'accessory';
  } else if (!itemToEquip.equipSlot || itemToEquip.equipSlot === 'none') {
    if (finalSlot === 'head') itemToEquip.equipSlot = 'head';
    else if (finalSlot === 'body') itemToEquip.equipSlot = 'body';
    else if (finalSlot === 'legs') itemToEquip.equipSlot = 'legs';
    else if (finalSlot === 'feet') itemToEquip.equipSlot = 'feet';
    else if (itemToEquip.isTwoHanded) itemToEquip.equipSlot = 'twoHanded';
    else itemToEquip.equipSlot = 'hand';
  }

  // Handle Two-handed weapon logic
  if (itemToEquip.isTwoHanded || itemToEquip.equipSlot === 'twoHanded') {
    if (updated.equipment.leftHand) {
      const prevLeft = { ...updated.equipment.leftHand, isEquipped: false };
      updated.inventory.push(prevLeft);
    }
    if (updated.equipment.rightHand && updated.equipment.rightHand.id !== updated.equipment.leftHand?.id) {
      const prevRight = { ...updated.equipment.rightHand, isEquipped: false };
      updated.inventory.push(prevRight);
    }
    updated.equipment.leftHand = itemToEquip;
    updated.equipment.rightHand = itemToEquip;
  } else {
    // If equipping a 1-handed item into hand and a 2-handed weapon was equipped, unequip it
    if (finalSlot === 'leftHand' || finalSlot === 'rightHand') {
      if (updated.equipment.leftHand?.isTwoHanded) {
        const twoHanded = { ...updated.equipment.leftHand, isEquipped: false };
        updated.inventory.push(twoHanded);
        delete updated.equipment.leftHand;
        delete updated.equipment.rightHand;
      }
    }

    // Vacate the existing item in the target slot
    if (updated.equipment[finalSlot]) {
      const prevItem = { ...updated.equipment[finalSlot]!, isEquipped: false };
      if (finalSlot.startsWith('accessory')) {
        prevItem.equipSlot = 'accessory';
      }
      updated.inventory.push(prevItem);
    }

    updated.equipment[finalSlot] = itemToEquip;
  }

  const slotLabel = EQUIPMENT_SLOT_LABELS[finalSlot] || finalSlot;
  return {
    success: true,
    message: `Đã trang bị [${itemToEquip.name}] vào ${slotLabel}.`,
    updatedCharacter: updated,
  };
}

/**
 * Unequip an item from a character's equipment slot back to inventory
 */
export function unequipItem(
  character: Character,
  slotKey: EquipmentSlotKey
): { success: boolean; message: string; updatedCharacter: Character } {
  const updated: Character = JSON.parse(JSON.stringify(character));
  if (!updated.equipment || !updated.equipment[slotKey]) {
    return { 
      success: false, 
      message: `Ô ${EQUIPMENT_SLOT_LABELS[slotKey] || slotKey} đang trống, không có trang bị để tháo.`, 
      updatedCharacter: character 
    };
  }

  const maxSlots = updated.maxInventorySlots || 20;
  if (updated.inventory.length >= maxSlots) {
    return {
      success: false,
      message: `Túi đồ đã đầy (${updated.inventory.length}/${maxSlots} ô)! Hãy bán bớt hoặc mở rộng túi trước khi tháo trang bị.`,
      updatedCharacter: character,
    };
  }

  const itemToUnequip = { ...updated.equipment[slotKey]!, isEquipped: false };
  if (slotKey.startsWith('accessory')) {
    itemToUnequip.equipSlot = 'accessory';
  }

  // If item is two-handed, clear both leftHand and rightHand
  if (itemToUnequip.isTwoHanded) {
    delete updated.equipment.leftHand;
    delete updated.equipment.rightHand;
  } else {
    delete updated.equipment[slotKey];
  }

  updated.inventory.push(itemToUnequip);

  return {
    success: true,
    message: `Đã tháo [${itemToUnequip.name}] cất vào túi đồ.`,
    updatedCharacter: updated,
  };
}

/**
 * Vứt bỏ / Hủy vật phẩm khỏi túi đồ hoặc cơ thể vĩnh viễn (giải phóng ô chứa)
 */
export function discardItem(
  character: Character,
  itemIdOrSlot: string
): { success: boolean; message: string; updatedCharacter: Character } {
  const updated: Character = JSON.parse(JSON.stringify(character));
  if (!updated.inventory) updated.inventory = [];
  if (!updated.equipment) updated.equipment = {};

  const query = (itemIdOrSlot || '').toLowerCase().trim();

  // 1. Check if it's an equipment slot key
  const slotKeys: EquipmentSlotKey[] = [
    'head', 'body', 'legs', 'feet', 'leftHand', 'rightHand',
    'accessory1', 'accessory2', 'accessory3', 'accessory4', 'accessory5'
  ];
  if (slotKeys.includes(query as EquipmentSlotKey)) {
    const slot = query as EquipmentSlotKey;
    const equipped = updated.equipment[slot];
    if (!equipped) {
      return { success: false, message: `Ô ${EQUIPMENT_SLOT_LABELS[slot] || slot} không có trang bị để vứt.`, updatedCharacter: character };
    }
    const name = equipped.name;
    if (equipped.isTwoHanded) {
      delete updated.equipment.leftHand;
      delete updated.equipment.rightHand;
    } else {
      delete updated.equipment[slot];
    }
    return {
      success: true,
      message: `Đã vứt bỏ trang bị [${name}] khỏi ô ${EQUIPMENT_SLOT_LABELS[slot] || slot}.`,
      updatedCharacter: updated,
    };
  }

  // 2. Check if it matches an item in inventory by ID or name
  const invIndex = updated.inventory.findIndex(i => {
    if (!i) return false;
    if (i.id === itemIdOrSlot) return true;
    if (i.id && i.id.toLowerCase() === query) return true;
    if (i.name && i.name.toLowerCase() === query) return true;
    if (i.name && query.length >= 3 && (i.name.toLowerCase().includes(query) || query.includes(i.name.toLowerCase()))) return true;
    return false;
  });

  if (invIndex !== -1) {
    const removedItem = updated.inventory.splice(invIndex, 1)[0];
    return {
      success: true,
      message: `Đã vứt bỏ [${removedItem.name}] khỏi túi đồ, giải phóng 1 ô chứa.`,
      updatedCharacter: updated,
    };
  }

  // 3. Check if it's equipped by name
  for (const s of slotKeys) {
    const eq = updated.equipment[s];
    if (eq && (eq.id === itemIdOrSlot || eq.name.toLowerCase().includes(query) || query.includes(eq.name.toLowerCase()))) {
      const name = eq.name;
      if (eq.isTwoHanded) {
        delete updated.equipment.leftHand;
        delete updated.equipment.rightHand;
      } else {
        delete updated.equipment[s];
      }
      return {
        success: true,
        message: `Đã vứt bỏ trang bị [${name}] đang đeo trên cơ thể.`,
        updatedCharacter: updated,
      };
    }
  }

  return {
    success: false,
    message: `Không tìm thấy vật phẩm [${itemIdOrSlot}] trong túi đồ hoặc trên cơ thể để vứt bỏ.`,
    updatedCharacter: character,
  };
}

/**
 * Bán một vật phẩm hoặc trang bị kiếm Xu Asura
 */
export function sellItem(
  character: Character,
  itemIdOrSlot: string
): { success: boolean; message: string; updatedCharacter: Character; valueGained: number } {
  const updated: Character = JSON.parse(JSON.stringify(character));
  if (!updated.inventory) updated.inventory = [];
  if (!updated.equipment) updated.equipment = {};
  if (!updated.stats) updated.stats = {} as any;

  const query = (itemIdOrSlot || '').toLowerCase().trim();
  const slotKeys: EquipmentSlotKey[] = [
    'head', 'body', 'legs', 'feet', 'leftHand', 'rightHand',
    'accessory1', 'accessory2', 'accessory3', 'accessory4', 'accessory5'
  ];

  // 1. Check if selling directly from equipment slot
  if (slotKeys.includes(query as EquipmentSlotKey)) {
    const slot = query as EquipmentSlotKey;
    const equipped = updated.equipment[slot];
    if (!equipped) {
      return { success: false, message: `Ô ${EQUIPMENT_SLOT_LABELS[slot] || slot} đang trống, không có trang bị để bán.`, updatedCharacter: character, valueGained: 0 };
    }
    const val = calculateItemSellValue(equipped, updated);
    const name = equipped.name;
    if (equipped.isTwoHanded) {
      delete updated.equipment.leftHand;
      delete updated.equipment.rightHand;
    } else {
      delete updated.equipment[slot];
    }
    updated.stats.asuraCoins = (updated.stats.asuraCoins || 0) + val;
    return {
      success: true,
      message: `Đã bán trang bị [${name}] trên người, thu về +${val} Xu Asura.`,
      updatedCharacter: updated,
      valueGained: val,
    };
  }

  // 2. Check in inventory
  const invIndex = updated.inventory.findIndex(i => {
    if (!i) return false;
    if (i.id === itemIdOrSlot) return true;
    if (i.id && i.id.toLowerCase() === query) return true;
    if (i.name && i.name.toLowerCase() === query) return true;
    if (i.name && query.length >= 3 && (i.name.toLowerCase().includes(query) || query.includes(i.name.toLowerCase()))) return true;
    return false;
  });

  if (invIndex !== -1) {
    const item = updated.inventory.splice(invIndex, 1)[0];
    const val = calculateItemSellValue(item, updated);
    updated.stats.asuraCoins = (updated.stats.asuraCoins || 0) + val;
    return {
      success: true,
      message: `Đã bán [${item.name}] tại thương nhân, thu về +${val} Xu Asura.`,
      updatedCharacter: updated,
      valueGained: val,
    };
  }

  // 3. Check equipped items by name
  for (const s of slotKeys) {
    const eq = updated.equipment[s];
    if (eq && (eq.id === itemIdOrSlot || eq.name.toLowerCase().includes(query) || query.includes(eq.name.toLowerCase()))) {
      const val = calculateItemSellValue(eq, updated);
      const name = eq.name;
      if (eq.isTwoHanded) {
        delete updated.equipment.leftHand;
        delete updated.equipment.rightHand;
      } else {
        delete updated.equipment[s];
      }
      updated.stats.asuraCoins = (updated.stats.asuraCoins || 0) + val;
      return {
        success: true,
        message: `Đã bán trang bị [${name}] đang đeo, thu về +${val} Xu Asura.`,
        updatedCharacter: updated,
        valueGained: val,
      };
    }
  }

  return {
    success: false,
    message: `Không tìm thấy vật phẩm [${itemIdOrSlot}] trong túi đồ để bán.`,
    updatedCharacter: character,
    valueGained: 0,
  };
}

/**
 * Bán toàn bộ chiến lợi phẩm (loot) trong túi đồ
 */
export function sellAllLootItems(
  character: Character
): { success: boolean; message: string; updatedCharacter: Character; count: number; totalGained: number } {
  const updated: Character = JSON.parse(JSON.stringify(character));
  if (!updated.inventory) updated.inventory = [];
  if (!updated.stats) updated.stats = {} as any;

  const lootItems = updated.inventory.filter(i => i.type === 'loot');
  if (lootItems.length === 0) {
    return {
      success: false,
      message: 'Trong túi đồ hiện không có chiến lợi phẩm (nguyên liệu quái) nào để bán.',
      updatedCharacter: character,
      count: 0,
      totalGained: 0,
    };
  }

  let totalGained = 0;
  lootItems.forEach(item => {
    totalGained += calculateItemSellValue(item, updated);
  });

  updated.inventory = updated.inventory.filter(i => i.type !== 'loot');
  updated.stats.asuraCoins = (updated.stats.asuraCoins || 0) + totalGained;

  return {
    success: true,
    message: `Đã bán toàn bộ ${lootItems.length} chiến lợi phẩm thu hoạch từ quái vật, thu về +${totalGained} Xu Asura!`,
    updatedCharacter: updated,
    count: lootItems.length,
    totalGained,
  };
}

/**
 * Tính toán giá trị bán ra (bằng Xu Asura) cho bất kỳ vật phẩm hay trang bị nào
 */
export function calculateItemSellValue(item: InventoryItem, character?: Character): number {
  let baseValue = 15;
  if (typeof item.valueCoins === 'number' && item.valueCoins > 0) {
    baseValue = item.valueCoins;
  } else {
    const tier = (item.tier || '').toLowerCase();
    if (item.type === 'weapon' || item.type === 'staff' || item.type === 'armor' || item.type === 'accessory') {
      baseValue = 35;
      if (tier.includes('thần') || tier.includes('god')) baseValue = 5000;
      else if (tier.includes('đế') || tier.includes('emperor')) baseValue = 2000;
      else if (tier.includes('vương') || tier.includes('king')) baseValue = 800;
      else if (tier.includes('thánh') || tier.includes('saint')) baseValue = 300;
      else if (tier.includes('thượng') || tier.includes('advanced')) baseValue = 120;
      else if (tier.includes('trung') || tier.includes('intermediate')) baseValue = 60;
    } else if (item.type === 'consumable') {
      baseValue = 15;
      if (tier.includes('thượng')) baseValue = 50;
      else if (tier.includes('trung')) baseValue = 30;
    } else {
      // loot / nguyên liệu
      baseValue = 20;
      if (tier.includes('thần') || tier.includes('đế')) baseValue = 1000;
      else if (tier.includes('vương')) baseValue = 400;
      else if (tier.includes('thánh')) baseValue = 180;
      else if (tier.includes('thượng')) baseValue = 70;
      else if (tier.includes('trung')) baseValue = 35;
    }
  }

  // Áp dụng thiên phú buff/nerf giá bán (%): e.g. Lời Nguyền Ruồng Bỏ (-50%)
  const sellMod = character?.progression?.innateTalent?.modifiers?.itemSellPricePercent;
  if (typeof sellMod === 'number') {
    baseValue = Math.max(1, Math.round(baseValue * (1 + sellMod / 100)));
  }

  return baseValue;
}

/**
 * Normalizes slot name string from natural Vietnamese commands
 */
export function matchSlotFromVietnamese(slotStr?: string | null): EquipmentSlotKey | null {
  if (!slotStr || typeof slotStr !== 'string') return null;
  const norm = slotStr.toLowerCase().trim();
  if (norm.includes('đầu') || norm.includes('dau') || norm.includes('mũ') || norm.includes('mu') || norm.includes('khăn') || norm.includes('vương miện')) {
    return 'head';
  }
  if (norm.includes('thân') || norm.includes('than') || norm.includes('giáp thân') || norm.includes('áo') || norm.includes('ao') || norm.includes('giáp') || norm.includes('choàng')) {
    return 'body';
  }
  if (norm.includes('quần') || norm.includes('quan') || norm.includes('khố')) {
    return 'legs';
  }
  if (norm.includes('giày') || norm.includes('giay') || norm.includes('bốt') || norm.includes('chân')) {
    return 'feet';
  }
  if (norm.includes('tay trái') || norm.includes('tay trai') || norm.includes('trái')) {
    return 'leftHand';
  }
  if (norm.includes('tay phải') || norm.includes('tay phai') || norm.includes('phải')) {
    return 'rightHand';
  }
  if (norm.includes('trang sức 1') || norm.includes('nhẫn 1') || norm.includes('ts 1')) {
    return 'accessory1';
  }
  if (norm.includes('trang sức 2') || norm.includes('nhẫn 2') || norm.includes('ts 2')) {
    return 'accessory2';
  }
  if (norm.includes('trang sức 3') || norm.includes('nhẫn 3') || norm.includes('ts 3')) {
    return 'accessory3';
  }
  if (norm.includes('trang sức 4') || norm.includes('nhẫn 4') || norm.includes('ts 4')) {
    return 'accessory4';
  }
  if (norm.includes('trang sức 5') || norm.includes('nhẫn 5') || norm.includes('ts 5')) {
    return 'accessory5';
  }
  return null;
}

/**
 * Checks if an action or encounter leads to permadeath or catastrophic injury
 */
export function evaluatePermadeathRisk(
  character: Character,
  actionText: string = ''
): { isFatal: boolean; reason?: string } {
  // Immortal bloodline completely prevents sudden death
  if (character.progression?.innateTalent?.id === 'immortal_bloodline') {
    return { isFatal: false };
  }

  const text = (actionText || '').toLowerCase();

  // Explicit reckless attacks/provocations against untouchable supreme bosses while weak
  const isDirectHostileAssault = 
    (text.includes('khiêu chiến trực diện') || text.includes('lao vào chém') || text.includes('tấn công liều chết') || text.includes('ám sát')) &&
    (text.includes('orsted') || text.includes('hitogami') || text.includes('nhân thần') || text.includes('long thần orsted'));

  if (isDirectHostileAssault && character.stats.age < 15 && character.magic.fire !== 'Thánh cấp (Saint)' && character.swordsmanship.swordGod !== 'Thánh cấp (Saint)') {
    return {
      isFatal: true,
      reason: `Bạn đã liều lĩnh tấn công trực diện một thực thể Tối Cao khi thực lực chưa đạt cảnh giới Thánh cấp. Sự chênh lệch tuyệt đối về quyền năng khiến bạn bị đánh gục tức thì!`,
    };
  }

  return { isFatal: false };
}

export const REGIONAL_ECOSYSTEMS: Record<string, RegionalEcosystem> = {
  asura_fittoa: {
    locationKey: 'asura_fittoa',
    zoneName: 'Rừng Rậm Lãnh Địa Fittoa (Gần Làng Buena)',
    description: 'Thảm thực vật trù phú của Trung Đại Lục. Rừng rậm ôn đới với nhiều loài dã thú và ma vật từ Sơ cấp đến Thượng cấp ẩn nấp sâu trong rừng già.',
    easyMonsters: [
      { name: 'Lợn Rừng Mãnh Nanh (Great Fang Boar)', tier: 'Sơ cấp (Beginner)', desc: 'Cặp nanh cong sắc nhọn, da dày, thịt thơm ngon có giá trị cao.', loot: 'Nanh Lợn Rừng & Thịt Tươi', rewardCoins: 15 },
      { name: 'Treo Cây Săn Mồi (Tree Hunter)', tier: 'Sơ cấp (Beginner)', desc: 'Ngụy trang dạng dây leo, phóng tơ dính phục kích từ trên cành cao.', loot: 'Dây Leo Co Giãn & Tuyến Tơ', rewardCoins: 18 },
      { name: 'Chuột Chũi Giáp Đá (Rock Badger)', tier: 'Sơ cấp (Beginner)', desc: 'Vảy đá cứng bao bọc mai, móng vuốt đào xuyên đá tảng.', loot: 'Mảnh Giáp Nham Thạch', rewardCoins: 12 },
    ],
    mediumMonsters: [
      { name: 'Bầy Sói Rừng Fittoa (Fittoa Dire Wolf Pack)', tier: 'Trung cấp (Intermediate)', desc: 'Lông xám như gai nhọn, săn mồi theo bầy với chiến thuật gọng kìm phối hợp.', loot: 'Da Sói Băng Giá & Nanh Sói Cấp Trung', rewardCoins: 45 },
      { name: 'Ma Thú Hệ Thảo (Treant Vine Creeper)', tier: 'Trung cấp (Intermediate)', desc: 'Rễ cây biến dị hấp thụ mana đất, quất roi rễ nghiền nát giáp sắt.', loot: 'Lõi Gỗ Ma Thuật & Nhựa Cây Tinh Khiết', rewardCoins: 50 },
    ],
    hardMonsters: [
      { name: 'Gấu Lưng Thiết Giáp (Ironback Bear)', tier: 'Thượng cấp (Advanced)', desc: 'Tấm lưng phủ lớp kim loại hữu cơ đao thương bất nhập, một cú tát nghiền nát cỗ xe ngựa.', loot: 'Thiết Giáp Bì & Lõi Mana Thượng Cấp', rewardCoins: 150 },
    ],
  },
  demon_continent: {
    locationKey: 'demon_continent',
    zoneName: 'Hoang Mạc Cằn Cỗi Lục Địa Ma Tộc (Khu vực Rikarisu)',
    description: 'Vùng đất cằn cỗi với nồng độ Mana dày đặc nhưng hỗn loạn. Quái vật ở đây hung tợn và khát máu gấp mười lần Trung Đại Lục.',
    easyMonsters: [
      { name: 'Bọ Hung Càng Gai (Spike Beetle)', tier: 'Trung cấp (Intermediate)', desc: 'Giáp xác cứng như thép nung, phun axit ăn mòn.', loot: 'Vỏ Giáp Kháng Axit', rewardCoins: 35 },
      { name: 'Thằn Lằn Độc Cát (Sand Viper Lizard)', tier: 'Trung cấp (Intermediate)', desc: 'Lẩn khuất dưới bão cát, nanh tiết chất độc làm đông máu.', loot: 'Túi Nọc Độc Tê Liệt', rewardCoins: 40 },
    ],
    mediumMonsters: [
      { name: 'Dã Ma Nanh Dài (Saber-Tooth Demon Beast)', tier: 'Thượng cấp (Advanced)', desc: 'Đấu Khí hoang dã bao quanh cơ bắp, tốc độ chớp nhoáng như báo gấm.', loot: 'Cặp Nanh Dài Cực Phẩm & Ma Thạch Thượng Cấp', rewardCoins: 120 },
      { name: 'Bọ Cạp Sa Mạc Khổng Lồ (Giant Desert Scorpion)', tier: 'Thượng cấp (Advanced)', desc: 'Thân hình to như ngôi nhà nhỏ, kim độc chọc thủng khiên sắt.', loot: 'Đuôi Kim Độc & Giáp Vảy Bọ Cạp', rewardCoins: 140 },
    ],
    hardMonsters: [
      { name: 'Rồng Đất Đỏ (Red Land Dragon)', tier: 'Thánh cấp (Saint)', desc: 'Á vương của loài bò sát sa mạc, lớp vảy rồng đỏ chịu được ma pháp cấp Thượng, hơi thở thiêu rụi cả ốc đảo.', loot: 'Long Lân Đỏ & Lõi Long Tinh Thánh Cấp', rewardCoins: 500 },
      { name: 'Dịch Bệnh Quái (Plague Demon Lord)', tier: 'Thánh cấp (Saint)', desc: 'Hiện thân của nguyền rủa và sương độc, làm thối rữa sinh mệnh xung quanh.', loot: 'Tinh Thể Nguyền Rủa & Tro Cốt Ma Vương', rewardCoins: 450 },
    ],
  },
  millis_holy: {
    locationKey: 'millis_holy',
    zoneName: 'Vùng Hồ Lớn & Rừng Thần Thánh Millis',
    description: 'Thánh địa tôn nghiêm được bao bọc bởi hồ nước ngọt khổng lồ và rừng cây cổ thụ.',
    easyMonsters: [
      { name: 'Thủy Thú Vảy Bạc (Silver Scale River Beast)', tier: 'Sơ cấp (Beginner)', desc: 'Bơi lội thần tốc dưới hồ nước ngọt, bắn tia nước áp suất cao.', loot: 'Vảy Bạc Lấp Lánh & Bong Bóng Thủy Lực', rewardCoins: 20 },
      { name: 'Đạo Tặc Rừng Xanh (Greenwood Ruffian)', tier: 'Sơ cấp (Beginner)', desc: 'Côn đồ vũ trang dao găm và nỏ bắn lén.', loot: 'Túi Tiền & Dao Găm Răng Cưa', rewardCoins: 25 },
    ],
    mediumMonsters: [
      { name: 'Báo Rừng Thần Thánh (Sacred Forest Panther)', tier: 'Trung cấp (Intermediate)', desc: 'Bộ lông hòa lẫn màu lá, móng vuốt phủ Đấu Khí sắc bén.', loot: 'Da Báo Cực Phẩm & Móng Vuốt Sắc', rewardCoins: 60 },
    ],
    hardMonsters: [
      { name: 'Thủy Quái Hồ Lớn Cấp Thánh (Leviathan Lake Serpent)', tier: 'Thánh cấp (Saint)', desc: 'Thủy xà khổng lồ ngự trị lòng hồ Milishion, thao túng sóng thần cuốn phăng tàu thuyền bè.', loot: 'Thủy Thần Châu & Long Cốt Lòng Hồ', rewardCoins: 600 },
    ],
  },
  great_forest: {
    locationKey: 'great_forest',
    zoneName: 'Đại Sâm Lâm Rừng Rậm Nguyên Sinh (Bộ tộc Doldia)',
    description: 'Rừng cây khổng lồ vươn tới trời cao. Mùa mưa kéo dài ba tháng biến mặt đất thành biển bùn lầy nguy hiểm.',
    easyMonsters: [
      { name: 'Khỉ Đột Gai Rừng (Thorn Baboon)', tier: 'Sơ cấp (Beginner)', desc: 'Ném quả gai nhọn và di chuyển linh hoạt trên tán cây cao.', loot: 'Quả Gai Nổ & Lông Gai Rậm', rewardCoins: 20 },
    ],
    mediumMonsters: [
      { name: 'Báo Gấm Đại Sâm Lâm (Great Forest Leopard)', tier: 'Trung cấp (Intermediate)', desc: 'Phản xạ thần tốc, gầm sóng âm làm tê liệt thính giác.', loot: 'Xương Cổ Họng Thú Thần & Da Báo Hoa', rewardCoins: 70 },
    ],
    hardMonsters: [
      { name: 'Trăn Khổng Lồ Đầm Lầy (Swamp Behemoth Python)', tier: 'Thượng cấp (Advanced)', desc: 'Thân dài hàng chục mét, siết gãy xương voi rừng trong tích tắc.', loot: 'Túi Mật Trăn Chúa & Da Trăn Kháng Phép', rewardCoins: 180 },
    ],
  },
};

export function getEcosystemForLocation(locationString: string = ''): RegionalEcosystem {
  const loc = (locationString || '').toLowerCase();
  if (loc.includes('ma tộc') || loc.includes('demon') || loc.includes('rikarisu')) {
    return REGIONAL_ECOSYSTEMS.demon_continent;
  }
  if (loc.includes('millis') || loc.includes('milishion')) {
    return REGIONAL_ECOSYSTEMS.millis_holy;
  }
  if (loc.includes('đại sâm lâm') || loc.includes('doldia') || loc.includes('rừng nguyên sinh')) {
    return REGIONAL_ECOSYSTEMS.great_forest;
  }
  return REGIONAL_ECOSYSTEMS.asura_fittoa;
}

export const CRAFTING_RECIPES: CraftingRecipe[] = [
  {
    id: 'oak_staff',
    name: 'Trượng Ma Pháp Sơ Cấp (Oak Wand)',
    resultType: 'staff',
    tier: 'Sơ cấp (Beginner)',
    costCoins: 30,
    requiredMaterials: [
      { name: 'Mảnh Giáp Nham Thạch', quantity: 1 },
    ],
    statBonus: { manaCostReduction: 10, magicDamageBonus: 8 },
    equipSlot: 'hand',
    description: 'Trượng gỗ sồi nạm mảnh đá ma thuật giúp dòng chảy Mana ổn định, giảm 10% tiêu hao mana khi thi triển phép.',
  },
  {
    id: 'quagmire_staff',
    name: 'Pháp Trượng Đầm Lầy (Quagmire Staff)',
    resultType: 'staff',
    tier: 'Trung cấp (Intermediate)',
    costCoins: 80,
    requiredMaterials: [
      { name: 'Lõi Gỗ Ma Thuật & Nhựa Cây Tinh Khiết', quantity: 1 },
    ],
    statBonus: { manaCostReduction: 20, defenseBonus: 5, magicDamageBonus: 16 },
    equipSlot: 'hand',
    description: 'Trượng pháp tăng tốc định hình ma pháp Thổ và Thủy, giảm 20% tiêu hao Mana.',
  },
  {
    id: 'dragon_staff',
    name: 'Trượng Ma Pháp Lõi Rồng (Dragon King Wand)',
    resultType: 'staff',
    tier: 'Thánh cấp (Saint)',
    costCoins: 400,
    requiredMaterials: [
      { name: 'Lõi Long Tinh Thánh Cấp', quantity: 1 },
      { name: 'Long Lân Đỏ', quantity: 1 },
    ],
    statBonus: { manaCostReduction: 35, toukiPenetration: 25, magicDamageBonus: 35 },
    equipSlot: 'twoHanded',
    isTwoHanded: true,
    description: 'Đại pháp trượng đỉnh cấp chế tác từ Lõi Rồng Đất Đỏ (chiếm 2 tay), giảm 35% tiêu hao Mana và tăng cực đại uy lực phá vỡ Đấu Khí.',
  },
  {
    id: 'touki_steel_sword',
    name: 'Kiếm Thép Đấu Khí (Touki Infused Blade)',
    resultType: 'weapon',
    tier: 'Trung cấp (Intermediate)',
    costCoins: 60,
    requiredMaterials: [
      { name: 'Nanh Sói Cấp Trung', quantity: 1 },
    ],
    statBonus: { toukiPenetration: 15, physicalDamageBonus: 12 },
    equipSlot: 'hand',
    description: 'Thanh kiếm thép tôi luyện từ nanh quái vật, dẫn truyền Đấu Khí cực tốt, tăng 15 điểm xuyên giáp.',
  },
  {
    id: 'water_god_broken_blade',
    name: 'Kiếm Gãy Của Thủy Thần (Remnant of Water God)',
    resultType: 'weapon',
    tier: 'Thánh cấp (Saint)',
    costCoins: 350,
    requiredMaterials: [
      { name: 'Thủy Thần Châu & Long Cốt Lòng Hồ', quantity: 1 },
    ],
    statBonus: { toukiPenetration: 30, defenseBonus: 15, physicalDamageBonus: 28 },
    equipSlot: 'hand',
    description: 'Cổ kiếm thất lạc mang linh khí của Thủy Thần phái, tăng 35% khả năng phản đòn Lưu Đức và giảm 15 sát thương nhận vào.',
  },
  {
    id: 'heavy_claymore',
    name: 'Đại Kiếm Sắt Cường Lực (Two-Handed Claymore)',
    resultType: 'weapon',
    tier: 'Trung cấp (Intermediate)',
    costCoins: 90,
    requiredMaterials: [
      { name: 'Nanh Sói Cấp Trung', quantity: 1 },
    ],
    statBonus: { physicalDamageBonus: 26, toukiPenetration: 22 },
    equipSlot: 'twoHanded',
    isTwoHanded: true,
    description: 'Đại kiếm khổng lồ nặng hơn 30kg chiếm cả 2 tay (Tay Trái + Tay Phải), nhát chém uy lực vô song bổ đôi giáp sắt!',
  },
  {
    id: 'fittoa_hood',
    name: 'Khăn Trùm Thợ Săn Fittoa',
    resultType: 'armor',
    tier: 'Sơ cấp (Beginner)',
    costCoins: 25,
    requiredMaterials: [
      { name: 'Mảnh Giáp Nham Thạch', quantity: 1 },
    ],
    statBonus: { defenseBonus: 5, speedAgilityBonus: 6 },
    equipSlot: 'head',
    description: 'Mũ trùm may bằng da mềm và len Fittoa giúp bảo vệ vùng đầu và tăng độ nhanh nhẹn luồn lách.',
  },
  {
    id: 'wolf_leather_armor',
    name: 'Áo Giáp Da Sói Bọc Thép',
    resultType: 'armor',
    tier: 'Trung cấp (Intermediate)',
    costCoins: 75,
    requiredMaterials: [
      { name: 'Nanh Sói Cấp Trung', quantity: 1 },
    ],
    statBonus: { defenseBonus: 16, toukiPenetration: 5 },
    equipSlot: 'body',
    description: 'Áo giáp thân thuộc chế tác từ da sói rừng Fittoa và nẹp thép dẻo, tăng 16 điểm phòng thủ giáp.',
  },
  {
    id: 'hunting_greaves_pants',
    name: 'Quần Giáp Da Thú Săn Mồi',
    resultType: 'armor',
    tier: 'Sơ cấp (Beginner)',
    costCoins: 35,
    requiredMaterials: [
      { name: 'Mảnh Giáp Nham Thạch', quantity: 1 },
    ],
    statBonus: { defenseBonus: 7, speedAgilityBonus: 5 },
    equipSlot: 'legs',
    description: 'Quần da thú bọc nẹp gối, bảo vệ hạ bàn vững vàng khi tung cước hoặc di chuyển bộ pháp.',
  },
  {
    id: 'magic_leather_boots',
    name: 'Giày Bốt Da Bò Ma Thuật',
    resultType: 'armor',
    tier: 'Sơ cấp (Beginner)',
    costCoins: 40,
    requiredMaterials: [
      { name: 'Dây Leo Co Giãn & Tuyến Tơ', quantity: 1 },
    ],
    statBonus: { defenseBonus: 5, speedAgilityBonus: 15 },
    equipSlot: 'feet',
    description: 'Giày bốt cao cổ bọc đệm khí, tăng 15 điểm tốc độ di chuyển và hỗ trợ né tránh đòn hiểm.',
  },
  {
    id: 'sapphire_ring',
    name: 'Nhẫn Ngọc Lam Ma Pháp (Sapphire Ring)',
    resultType: 'accessory',
    tier: 'Trung cấp (Intermediate)',
    costCoins: 65,
    requiredMaterials: [
      { name: 'Lõi Gỗ Ma Thuật & Nhựa Cây Tinh Khiết', quantity: 1 },
    ],
    statBonus: { manaMaxBonus: 35, manaRegenBonus: 5, magicResistanceBonus: 10 },
    equipSlot: 'accessory',
    description: 'Nhẫn trang sức nạm ngọc lam, tăng 35 Mana tối đa và đẩy nhanh tốc độ phục hồi Mana.',
  },
  {
    id: 'wolf_fang_pendant',
    name: 'Dây Chuyền Nanh Sói Chúa',
    resultType: 'accessory',
    tier: 'Trung cấp (Intermediate)',
    costCoins: 50,
    requiredMaterials: [
      { name: 'Nanh Sói Cấp Trung', quantity: 1 },
    ],
    statBonus: { toukiPenetration: 10, physicalDamageBonus: 8 },
    equipSlot: 'accessory',
    description: 'Dây chuyền bùa chú đính nanh sói đầu đàn, khuấy động Đấu Khí và tăng sát thương đòn đánh.',
  },
  {
    id: 'healing_elixir',
    name: 'Thần Dược Hồi Phục Fittoa (Healing Elixir)',
    resultType: 'consumable',
    tier: 'Sơ cấp (Beginner)',
    costCoins: 20,
    requiredMaterials: [
      { name: 'Dây Leo Co Giãn & Tuyến Tơ', quantity: 1 },
    ],
    statBonus: { hpHealAmount: 40, staminaHealAmount: 30 },
    description: 'Thuốc nước thảo dược lên men, hồi 40 HP và 30 Thể lực ngay lập tức.',
  },
];
