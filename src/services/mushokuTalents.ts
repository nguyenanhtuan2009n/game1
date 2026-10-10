import type { Character, CharacterStats, PowerTier } from '../types/game';

export type TalentTier = 'curse' | 'common' | 'rare' | 'genius' | 'legendary' | 'godkin';

export interface TalentStatModifiers {
  hpMaxPercent?: number;              // Buff/Nerf HP tối đa (%)
  mpMaxPercent?: number;              // Buff/Nerf MP tối đa (%)
  toukiMaxPercent?: number;           // Buff/Nerf Đấu Khí tối đa (%)
  strPercent?: number;                // Buff/Nerf STR cơ bản (%)
  agiPercent?: number;                // Buff/Nerf AGI cơ bản (%)
  staminaRegenPercent?: number;       // Tốc độ hồi Thể lực (%)
  hpRegenPercent?: number;            // Tốc độ hồi HP (%)
  mpRegenPercent?: number;            // Tốc độ hồi MP (%)
  staminaCostSwordPercent?: number;   // Thể lực tiêu hao khi vung kiếm (%)
  manaCostPercent?: number;           // Tiêu hao Mana (%)
  physicalDamageTakenPercent?: number;// Sát thương vật lý nhận vào (%)
  magicDamageTakenPercent?: number;   // Kháng/nhận sát thương ma pháp (%)
  physicalDamageDealtPercent?: number;// Uy lực đòn đánh vật lý/chém (%)
  unarmedDamageDealtPercent?: number; // Uy lực cận chiến/tay không (%)
  elementalMagicDamagePercent?: number;// Uy lực ma pháp nguyên tố (%)
  chantTimePercent?: number;          // Thời gian niệm chú (%)
  chantlessChanceBonus?: number;      // Tỷ lệ tự ngộ [Vô niệm chú] (%)
  reflexSpeedPercent?: number;        // Tốc độ phản xạ đòn đánh (%)
  critWeaknessChanceBonus?: number;   // Tỷ lệ phát hiện tử huyệt/nhược điểm (%)
  evasionBonusPercent?: number;       // Tỷ lệ né tránh (%)
  craftingSuccessPercent?: number;    // Tỷ lệ thành công chế tác/rèn đúc (%)
  ambushDetectPercent?: number;       // Tỷ lệ phát hiện phục kích (%)
  panicMentalResistPercent?: number;  // Kháng hoảng loạn/áp chế tinh thần (%)
  mpAccumulationPre10Percent?: number;// Tốc độ tích lũy MP trước 10t (%)
  readingLangSpeedPercent?: number;   // Tốc độ đọc hiểu ngôn ngữ (%)
  skillExpBonusPercent?: number;      // Điểm kinh nghiệm kỹ năng (%)
  npcInitialFavorPercent?: number;    // Tỷ lệ hảo cảm ban đầu từ NPC (%)
  itemBuyPricePercent?: number;       // Giá mua vật phẩm (%)
  itemSellPricePercent?: number;      // Giá bán đồ (%)
  mimicSkillRate?: number;            // Tỷ lệ sao chép chiêu thức (%)
  mimicMasteryInitial?: number;       // Độ thuần thục chiêu vừa sao chép (%)
  poisonImmunity?: boolean;           // Miễn nhiễm 100% độc tố
  lethalWoundResistPercent?: number;  // Giảm nguy cơ tử vong do mất máu/đứt chi (%)
  multiStreamCastCount?: number;      // Cho phép thi triển đồng thời X luồng chiêu
  castActivationSpeedPercent?: number;// Tốc độ kích hoạt kỹ năng (%)
  comboHitRatePercent?: number;       // Tỷ lệ trúng đòn phối hợp (%)
  dualElementFusion?: boolean;        // Cho phép dung hợp 2 nguyên tố
  longBattlePenaltyTurns?: number;    // Lượt bắt đầu suy giảm 20% toàn bộ chỉ số
  lockMagic?: boolean;                // Khóa vĩnh viễn ma pháp
  lockTouki?: boolean;                // Khóa vĩnh viễn đấu khí
}

export interface TalentDefinition {
  id: string;
  name: string;
  tier: TalentTier;
  tierName: string;
  tierProbability: string; // "50%", "30%", "15%", "4%", "1%", "Đặc biệt / Cursed"
  icon: string;
  description: string;
  effectsSummary: string[];
  modifiers: TalentStatModifiers;
  themeColor: {
    border: string;
    bg: string;
    text: string;
    badge: string;
    glow: string;
  };
}

export const TALENTS_CATALOG: Record<string, TalentDefinition> = {
  // -------------------------------------------------------------
  // 1. NHÓM THIÊN PHÚ GIẢM TRỪ / KHIẾM KHUYẾT NẶNG (NERF & CURSES)
  // -------------------------------------------------------------
  blocked_meridians: {
    id: 'blocked_meridians',
    name: 'Kinh Mạch Tắc Nghẽn',
    tier: 'curse',
    tierName: 'Khiếm Khuyết / Lời Nguyền',
    tierProbability: 'Nguyện cảnh / Nghịch cảnh',
    icon: '🚫',
    description: 'Các kinh mạch lưu chuyển linh khí trong cơ thể bị phong bế bẩm sinh, hoàn toàn không có khả năng dẫn truyền ma lực.',
    effectsSummary: [
      'MP tối đa: -100% (Khóa vĩnh viễn ở 0)',
      'Không thể học hoặc thi triển bất kỳ ma pháp nào',
      'Buộc phải rèn luyện con đường Thể thuật và Giáp trụ thuần túy',
    ],
    modifiers: {
      mpMaxPercent: -100,
      lockMagic: true,
    },
    themeColor: {
      border: 'border-red-600/80',
      bg: 'bg-red-950/40',
      text: 'text-red-400',
      badge: 'bg-red-900/60 border-red-500/80 text-red-300',
      glow: 'shadow-[0_0_20px_rgba(220,38,38,0.35)]',
    },
  },

  crippled_body: {
    id: 'crippled_body',
    name: 'Thể Trạng Tật Nguyền',
    tier: 'curse',
    tierName: 'Khiếm Khuyết / Lời Nguyền',
    tierProbability: 'Nguyện cảnh / Nghịch cảnh',
    icon: '🥀',
    description: 'Cơ thể ốm yếu dị tật từ nhỏ, xương khớp mỏng manh dễ tổn thương trước mọi va đập vật lý.',
    effectsSummary: [
      'HP tối đa: -40%',
      'Sát thương vật lý nhận vào: +50%',
      'Cần được bảo hộ tuyệt đối trong giao tranh',
    ],
    modifiers: {
      hpMaxPercent: -40,
      physicalDamageTakenPercent: 50,
    },
    themeColor: {
      border: 'border-rose-600/80',
      bg: 'bg-rose-950/40',
      text: 'text-rose-400',
      badge: 'bg-rose-900/60 border-rose-500/80 text-rose-300',
      glow: 'shadow-[0_0_20px_rgba(244,63,94,0.35)]',
    },
  },

  touki_resistant: {
    id: 'touki_resistant',
    name: 'Kháng Đấu Khí',
    tier: 'curse',
    tierName: 'Khiếm Khuyết / Lời Nguyền',
    tierProbability: 'Nguyện cảnh / Nghịch cảnh',
    icon: '🛡️❌',
    description: 'Tế bào cơ bắp từ chối dung nạp và phân tán Đấu Khí, tương tự khiếm khuyết cơ thể của Rudeus Greyrat.',
    effectsSummary: [
      'Hiệu quả bọc Đấu Khí: -100% (Khóa ở 0)',
      'Không thể tạo màng Đấu Khí cường hóa cơ thể',
      'Phòng ngự vật lý phụ thuộc hoàn toàn vào giáp trụ hoặc Ma Giáp ma thuật',
    ],
    modifiers: {
      toukiMaxPercent: -100,
      lockTouki: true,
    },
    themeColor: {
      border: 'border-amber-700/80',
      bg: 'bg-amber-950/40',
      text: 'text-amber-400',
      badge: 'bg-amber-900/60 border-amber-600/80 text-amber-300',
      glow: 'shadow-[0_0_20px_rgba(217,119,6,0.35)]',
    },
  },

  abandoned_curse: {
    id: 'abandoned_curse',
    name: 'Lời Nguyền Ruồng Bỏ',
    tier: 'curse',
    tierName: 'Khiếm Khuyết / Lời Nguyền',
    tierProbability: 'Nguyện cảnh / Nghịch cảnh',
    icon: '👁️‍🗨️',
    description: 'Khí chất âm u ghê rợn toát ra từ linh hồn khiến mọi sinh linh bản năng sinh lòng sợ hãi, xa lánh hoặc khinh miệt.',
    effectsSummary: [
      'Tỷ lệ hảo cảm ban đầu từ NPC: -80%',
      'Giá mua vật phẩm tại thương hội: +50%',
      'Giá bán đồ quy đổi tiền: -50%',
    ],
    modifiers: {
      npcInitialFavorPercent: -80,
      itemBuyPricePercent: 50,
      itemSellPricePercent: -50,
    },
    themeColor: {
      border: 'border-purple-800/80',
      bg: 'bg-purple-950/40',
      text: 'text-purple-400',
      badge: 'bg-purple-900/60 border-purple-600/80 text-purple-300',
      glow: 'shadow-[0_0_20px_rgba(147,51,234,0.35)]',
    },
  },

  short_lived_illness: {
    id: 'short_lived_illness',
    name: 'Đoản Thọ / Hàn Bệnh',
    tier: 'curse',
    tierName: 'Khiếm Khuyết / Lời Nguyền',
    tierProbability: 'Nguyện cảnh / Nghịch cảnh',
    icon: '⏳❄️',
    description: 'Hàn độc ngấm vào tim tủy, khí huyết suy kiệt nhanh chóng mỗi khi phải vận sức lâu trong các trận huyết chiến.',
    effectsSummary: [
      'Tốc độ hồi phục Thể lực & HP: -50%',
      'Suy giảm toàn bộ chỉ số 20% khi trận chiến kéo dài quá 5 lượt',
      'Buộc phải kết liễu đối thủ thần tốc bằng chiến thuật đánh nhanh thắng nhanh',
    ],
    modifiers: {
      staminaRegenPercent: -50,
      hpRegenPercent: -50,
      longBattlePenaltyTurns: 5,
    },
    themeColor: {
      border: 'border-blue-900/80',
      bg: 'bg-blue-950/40',
      text: 'text-blue-400',
      badge: 'bg-blue-900/60 border-blue-600/80 text-blue-300',
      glow: 'shadow-[0_0_20px_rgba(59,130,246,0.35)]',
    },
  },

  // -------------------------------------------------------------
  // 2. BẬC PHÀM NHÂN (COMMON - TỶ LỆ 50%)
  // -------------------------------------------------------------
  resilient_body: {
    id: 'resilient_body',
    name: 'Thân Thể Dẻo Dai',
    tier: 'common',
    tierName: 'Bậc Phàm Nhân',
    tierProbability: '50%',
    icon: '💪',
    description: 'Cơ bắp và gân cốt dẻo dai bẩm sinh của người lao động thuần phác, chịu khó và bền bỉ.',
    effectsSummary: [
      'HP tối đa: +10%',
      'Tốc độ hồi Thể lực: +15%',
      'Khởi đầu vững chắc cho con đường rèn luyện gian khổ',
    ],
    modifiers: {
      hpMaxPercent: 10,
      staminaRegenPercent: 15,
    },
    themeColor: {
      border: 'border-stone-600/60',
      bg: 'bg-stone-900/40',
      text: 'text-stone-300',
      badge: 'bg-stone-800/80 border-stone-600/80 text-stone-200',
      glow: 'shadow-[0_0_15px_rgba(168,162,158,0.2)]',
    },
  },

  unshakable_mind: {
    id: 'unshakable_mind',
    name: 'Tâm Trí Vững Vàng',
    tier: 'common',
    tierName: 'Bậc Phàm Nhân',
    tierProbability: '50%',
    icon: '🧘',
    description: 'Tâm tính trầm tĩnh, khó bị lay động trước hiểm cảnh hay những lời thị phi khiêu khích.',
    effectsSummary: [
      'Kháng hiệu ứng hoảng loạn/áp chế tinh thần: +20%',
      'Giảm nguy cơ mất kiểm soát ý thức khi đối đầu ma thú hung bạo',
    ],
    modifiers: {
      panicMentalResistPercent: 20,
    },
    themeColor: {
      border: 'border-teal-700/60',
      bg: 'bg-teal-950/40',
      text: 'text-teal-300',
      badge: 'bg-teal-900/70 border-teal-600/80 text-teal-200',
      glow: 'shadow-[0_0_15px_rgba(20,184,166,0.2)]',
    },
  },

  dexterous_hands: {
    id: 'dexterous_hands',
    name: 'Khéo Tay',
    tier: 'common',
    tierName: 'Bậc Phàm Nhân',
    tierProbability: '50%',
    icon: '🛠️',
    description: 'Đôi bàn tay thon thả, tỉ mỉ và nhạy bén với từng chi tiết cơ khí và chất liệu chế tạo.',
    effectsSummary: [
      'Tỷ lệ thành công rèn đúc / chế tác ma cụ / mổ xẻ ma thú: +15%',
      'Tiết kiệm nguyên liệu quý hiếm khi khắc trận pháp',
    ],
    modifiers: {
      craftingSuccessPercent: 15,
    },
    themeColor: {
      border: 'border-amber-700/60',
      bg: 'bg-amber-950/30',
      text: 'text-amber-300',
      badge: 'bg-amber-900/70 border-amber-600/80 text-amber-200',
      glow: 'shadow-[0_0_15px_rgba(245,158,11,0.2)]',
    },
  },

  sharp_hearing: {
    id: 'sharp_hearing',
    name: 'Thính Giác Nhạy Bén',
    tier: 'common',
    tierName: 'Bậc Phàm Nhân',
    tierProbability: '50%',
    icon: '👂🍃',
    description: 'Đôi tai có thể nghe thấy cả tiếng lá rơi và bước chân lén lút của thú săn mồi trong rừng rậm.',
    effectsSummary: [
      'Tỷ lệ phát hiện phục kích và dấu vết hoang dã: +20%',
      'Cảnh giác trước mọi nguy cơ tập kích ban đêm',
    ],
    modifiers: {
      ambushDetectPercent: 20,
    },
    themeColor: {
      border: 'border-emerald-700/60',
      bg: 'bg-emerald-950/30',
      text: 'text-emerald-300',
      badge: 'bg-emerald-900/70 border-emerald-600/80 text-emerald-200',
      glow: 'shadow-[0_0_15px_rgba(16,185,129,0.2)]',
    },
  },

  // -------------------------------------------------------------
  // 3. BẬC TÀI NĂNG HIẾM (RARE TALENT - TỶ LỆ 30%)
  // -------------------------------------------------------------
  clear_meridians: {
    id: 'clear_meridians',
    name: 'Kinh Mạch Thông Suốt',
    tier: 'rare',
    tierName: 'Bậc Tài Năng Hiếm',
    tierProbability: '30%',
    icon: '🌀💎',
    description: 'Đường dẫn mana trong cơ thể rộng mở tự nhiên, cho phép dòng mana lưu chuyển trơn tru không trở ngại.',
    effectsSummary: [
      'Tốc độ tích lũy MP trước 10 tuổi: +50%',
      'MP tối đa: +30%',
      'Tiêu hao Mana mọi chiêu thức: -15%',
    ],
    modifiers: {
      mpAccumulationPre10Percent: 50,
      mpMaxPercent: 30,
      manaCostPercent: -15,
    },
    themeColor: {
      border: 'border-cyan-600/70',
      bg: 'bg-cyan-950/40',
      text: 'text-cyan-300',
      badge: 'bg-cyan-900/70 border-cyan-500/80 text-cyan-200',
      glow: 'shadow-[0_0_20px_rgba(6,182,212,0.3)]',
    },
  },

  swordsman_bones: {
    id: 'swordsman_bones',
    name: 'Gân Cốt Kiếm Sĩ',
    tier: 'rare',
    tierName: 'Bậc Tài Năng Hiếm',
    tierProbability: '30%',
    icon: '⚔️🦴',
    description: 'Khung xương cứng chắc và các thớ cơ thích ứng tự nhiên với trọng lượng và nhịp độ của thanh kiếm.',
    effectsSummary: [
      'STR cơ bản: +20%',
      'Đấu Khí tối đa: +25%',
      'Thể lực tiêu hao khi vung kiếm: -20%',
    ],
    modifiers: {
      strPercent: 20,
      toukiMaxPercent: 25,
      staminaCostSwordPercent: -20,
    },
    themeColor: {
      border: 'border-sky-600/70',
      bg: 'bg-sky-950/40',
      text: 'text-sky-300',
      badge: 'bg-sky-900/70 border-sky-500/80 text-sky-200',
      glow: 'shadow-[0_0_20px_rgba(14,165,233,0.3)]',
    },
  },

  hunter_intuition: {
    id: 'hunter_intuition',
    name: 'Trực Giác Thợ Săn',
    tier: 'rare',
    tierName: 'Bậc Tài Năng Hiếm',
    tierProbability: '30%',
    icon: '🏹🎯',
    description: 'Giác quan thứ sáu nhạy bén mách bảo điểm rơi của đòn hiểm và sơ hở chí mạng của con mồi.',
    effectsSummary: [
      'AGI cơ bản: +15%',
      'Tỷ lệ né tránh đòn đánh bất ngờ: +30%',
      'Phản ứng kịp thời trước các bẫy rập và ma thú ẩn nấp',
    ],
    modifiers: {
      agiPercent: 15,
      evasionBonusPercent: 30,
    },
    themeColor: {
      border: 'border-emerald-600/70',
      bg: 'bg-emerald-950/40',
      text: 'text-emerald-300',
      badge: 'bg-emerald-900/70 border-emerald-500/80 text-emerald-200',
      glow: 'shadow-[0_0_20px_rgba(16,185,129,0.3)]',
    },
  },

  quick_absorption: {
    id: 'quick_absorption',
    name: 'Hấp Thụ Nhanh',
    tier: 'rare',
    tierName: 'Bậc Tài Năng Hiếm',
    tierProbability: '30%',
    icon: '📖💡',
    description: 'Trí tuệ minh mẫn, khả năng nắm bắt quy luật ngôn ngữ và nguyên lý chiêu thức nhanh gấp bội người thường.',
    effectsSummary: [
      'Tốc độ đọc hiểu và thông thạo ngôn ngữ mới: +100%',
      'Điểm kinh nghiệm kỹ năng (EXP/SP): +25%',
      'Rút ngắn thời gian đột phá các tầng kỹ năng căn bản',
    ],
    modifiers: {
      readingLangSpeedPercent: 100,
      skillExpBonusPercent: 25,
    },
    themeColor: {
      border: 'border-indigo-600/70',
      bg: 'bg-indigo-950/40',
      text: 'text-indigo-300',
      badge: 'bg-indigo-900/70 border-indigo-500/80 text-indigo-200',
      glow: 'shadow-[0_0_20px_rgba(99,102,241,0.3)]',
    },
  },

  // -------------------------------------------------------------
  // 4. BẬC THIÊN TÀI (GENIUS - TỶ LỆ 15%)
  // -------------------------------------------------------------
  nature_resonance: {
    id: 'nature_resonance',
    name: 'Đồng Điệu Tự Nhiên',
    tier: 'genius',
    tierName: 'Bậc Thiên Tài',
    tierProbability: '15%',
    icon: '🌿✨',
    description: 'Linh hồn hòa quyện với linh khí đất trời, thấu hiểu quy luật vận hành của các nguyên tố cơ bản.',
    effectsSummary: [
      'Thời gian niệm chú: -50%',
      'Uy lực ma pháp nguyên tố: +40%',
      'Tỷ lệ tự ngộ [Vô niệm chú] trước 7 tuổi: +70%',
      'Mở khóa trực tiếp điều kiện ngộ đạo Thánh cấp Ma Pháp',
    ],
    modifiers: {
      chantTimePercent: -50,
      elementalMagicDamagePercent: 40,
      chantlessChanceBonus: 70,
    },
    themeColor: {
      border: 'border-violet-500/80',
      bg: 'bg-violet-950/50',
      text: 'text-violet-300',
      badge: 'bg-violet-900/80 border-violet-400/80 text-violet-200',
      glow: 'shadow-[0_0_25px_rgba(139,92,246,0.4)]',
    },
  },

  instant_sight: {
    id: 'instant_sight',
    name: 'Nhãn Lực Sát Na',
    tier: 'genius',
    tierName: 'Bậc Thiên Tài',
    tierProbability: '15%',
    icon: '⚡👁️',
    description: 'Thị giác siêu giác quan có thể đóng băng thời gian trong chớp mắt để nhìn rõ quỹ đạo chuyển động nhanh nhất.',
    effectsSummary: [
      'Tốc độ phản xạ đòn đánh: +50%',
      'Tỷ lệ phát hiện tử huyệt/nhược điểm đối thủ: +35%',
      'Tự động đạt điều kiện phản xạ Kiếm thuật Thánh cấp',
    ],
    modifiers: {
      reflexSpeedPercent: 50,
      critWeaknessChanceBonus: 35,
    },
    themeColor: {
      border: 'border-fuchsia-500/80',
      bg: 'bg-fuchsia-950/50',
      text: 'text-fuchsia-300',
      badge: 'bg-fuchsia-900/80 border-fuchsia-400/80 text-fuchsia-200',
      glow: 'shadow-[0_0_25px_rgba(217,70,239,0.4)]',
    },
  },

  wargod_physique: {
    id: 'wargod_physique',
    name: 'Thể Chất Chiến Thần',
    tier: 'genius',
    tierName: 'Bậc Thiên Tài',
    tierProbability: '15%',
    icon: '🛡️🔥',
    description: 'Thân hình sinh ra để thống trị chiến trường, bắp thịt đúc bằng thép và khoang Đấu Khí cuộn trào như núi lửa.',
    effectsSummary: [
      'Đấu Khí tối đa: +100%',
      'Giảm sát thương va chạm vật lý: +30%',
      'STR cơ bản: +40%',
      'Giảm số lần thập tử nhất sinh cần thiết lên Vương cấp xuống 2',
    ],
    modifiers: {
      toukiMaxPercent: 100,
      physicalDamageTakenPercent: -30,
      strPercent: 40,
    },
    themeColor: {
      border: 'border-rose-500/80',
      bg: 'bg-rose-950/50',
      text: 'text-rose-300',
      badge: 'bg-rose-900/80 border-rose-400/80 text-rose-200',
      glow: 'shadow-[0_0_25px_rgba(244,63,94,0.4)]',
    },
  },

  multi_element_flex: {
    id: 'multi_element_flex',
    name: 'Đa Nguyên Tố Linh Hoạt',
    tier: 'genius',
    tierName: 'Bậc Thiên Tài',
    tierProbability: '15%',
    icon: '🔮⚡',
    description: 'Điều phối hai dòng mana tương khắc hoặc tương sinh song song mà không hề bị rối loạn xung đột dòng chảy.',
    effectsSummary: [
      'Cho phép dung hợp 2 nguyên tố cùng lúc (Băng, Sét, Quake...)',
      'Uy lực ma pháp kết hợp: +35%',
      'Giảm độ tiêu hao Mana khi cast liên tục: -25%',
    ],
    modifiers: {
      dualElementFusion: true,
      elementalMagicDamagePercent: 35,
      manaCostPercent: -25,
    },
    themeColor: {
      border: 'border-purple-500/80',
      bg: 'bg-purple-950/50',
      text: 'text-purple-300',
      badge: 'bg-purple-900/80 border-purple-400/80 text-purple-200',
      glow: 'shadow-[0_0_25px_rgba(168,85,247,0.4)]',
    },
  },

  // -------------------------------------------------------------
  // 5. BẬC THIÊN TÀI CỦA THIÊN TÀI / TRĂM NĂM CÓ MỘT (LEGENDARY - TỶ LỆ 4%)
  // -------------------------------------------------------------
  laplace_anomaly: {
    id: 'laplace_anomaly',
    name: 'Hạt Nhân Ma Lực Vô Tận (Laplace Anomaly)',
    tier: 'legendary',
    tierName: 'Bậc Thiên Tài Của Thiên Tài',
    tierProbability: '4%',
    icon: '🌌👑',
    description: 'Sở hữu Yếu tố Ma Thần Laplace thuần khiết nhất. Dung lượng mana sánh ngang thần linh, nhưng đổi lại hoàn toàn vô duyên với Đấu Khí.',
    effectsSummary: [
      'MP tối đa: +1000% (Gấp 10 lần người bình thường)',
      'Tốc độ hồi MP: +200%',
      'Đấu Khí tối đa: -100% (Khóa vĩnh viễn không thể dùng Đấu Khí)',
      'Đủ tư cách tối thượng đột phá Ma Pháp Đế Cấp & Thần Cấp!',
    ],
    modifiers: {
      mpMaxPercent: 1000,
      mpRegenPercent: 200,
      toukiMaxPercent: -100,
      lockTouki: true,
    },
    themeColor: {
      border: 'border-amber-400',
      bg: 'bg-amber-950/60',
      text: 'text-amber-300',
      badge: 'bg-amber-900/90 border-amber-300 text-amber-200 font-bold',
      glow: 'shadow-[0_0_30px_rgba(245,158,11,0.5)] ring-1 ring-amber-400/50',
    },
  },

  living_weapon: {
    id: 'living_weapon',
    name: 'Vũ Khí Sống Thuần Khiết',
    tier: 'legendary',
    tierName: 'Bậc Thiên Tài Của Thiên Tài',
    tierProbability: '4%',
    icon: '⚔️💥',
    description: 'Mỗi tấc cơ bắp, đốt ngón tay và ánh mắt đều được tôi luyện để trở thành cỗ máy đồ sát hoàn mỹ của kiếm đạo.',
    effectsSummary: [
      'Đấu Khí tối đa: +300%',
      'STR cơ bản: +150%',
      'AGI cơ bản: +100%',
      'Độ sắc bén / sát thương đòn chém: +80%',
      'Đủ tư cách tối thượng đột phá Kiếm Thuật Đế Cấp & Thần Cấp!',
    ],
    modifiers: {
      toukiMaxPercent: 300,
      strPercent: 150,
      agiPercent: 100,
      physicalDamageDealtPercent: 80,
    },
    themeColor: {
      border: 'border-yellow-400',
      bg: 'bg-yellow-950/60',
      text: 'text-yellow-300',
      badge: 'bg-yellow-900/90 border-yellow-300 text-yellow-200 font-bold',
      glow: 'shadow-[0_0_30px_rgba(234,179,8,0.5)] ring-1 ring-yellow-400/50',
    },
  },

  omni_cast: {
    id: 'omni_cast',
    name: 'Tâm Trí Phân Bào (Omni-Cast)',
    tier: 'legendary',
    tierName: 'Bậc Thiên Tài Của Thiên Tài',
    tierProbability: '4%',
    icon: '🧠✨⚡',
    description: 'Não bộ có khả năng phân tách đa luồng tư duy độc lập, thi triển nhiều thần thông đồng thời mà không hề phân tâm.',
    effectsSummary: [
      'Cho phép thi triển đồng thời 3 luồng chiêu thức trong một lượt',
      'Tốc độ kích hoạt kỹ năng: +100%',
      'Tỷ lệ trúng đòn phối hợp: +50%',
    ],
    modifiers: {
      multiStreamCastCount: 3,
      castActivationSpeedPercent: 100,
      comboHitRatePercent: 50,
    },
    themeColor: {
      border: 'border-cyan-400',
      bg: 'bg-cyan-950/60',
      text: 'text-cyan-300',
      badge: 'bg-cyan-900/90 border-cyan-300 text-cyan-200 font-bold',
      glow: 'shadow-[0_0_30px_rgba(6,182,212,0.5)] ring-1 ring-cyan-400/50',
    },
  },

  martial_mimicry: {
    id: 'martial_mimicry',
    name: 'Sao Chép Tuyệt Luân (Martial Mimicry)',
    tier: 'legendary',
    tierName: 'Bậc Thiên Tài Của Thiên Tài',
    tierProbability: '4%',
    icon: '🪞🥋',
    description: 'Đôi mắt thấu suốt mọi đường kiếm và ấn chú. Mọi tuyệt kỹ của kẻ địch đều bị lột trần và sao chép ngay khi vừa thấy.',
    effectsSummary: [
      'Tỷ lệ học lỏm thành công kỹ năng/kiếm chiêu đối thủ sau 1 lần quan sát: 80%',
      'Độ thuần thục chiêu vừa sao chép: đạt ngay 60%',
      'Tự thích nghi hóa giải các thế đòn lặp lại của đối phương',
    ],
    modifiers: {
      mimicSkillRate: 80,
      mimicMasteryInitial: 60,
    },
    themeColor: {
      border: 'border-fuchsia-400',
      bg: 'bg-fuchsia-950/60',
      text: 'text-fuchsia-300',
      badge: 'bg-fuchsia-900/90 border-fuchsia-300 text-fuchsia-200 font-bold',
      glow: 'shadow-[0_0_30px_rgba(217,70,239,0.5)] ring-1 ring-fuchsia-400/50',
    },
  },

  // -------------------------------------------------------------
  // 6. BẬC DỊ BIẾN HUYẾT THỐNG THẦN MA (GOD-KIN / MUTATION - TỶ LỆ 1%)
  // -------------------------------------------------------------
  immortal_bloodline: {
    id: 'immortal_bloodline',
    name: 'Mạch Máu Bất Tử',
    tier: 'godkin',
    tierName: 'Dị Biến Huyết Thống Thần Ma',
    tierProbability: '1%',
    icon: '🩸♾️',
    description: 'Dòng máu của Bất Tử Ma Tộc Atofe hoặc Long Thần cổ đại chảy trong huyết quản, tái sinh tế bào tức thì trước mọi chấn thương chí mạng.',
    effectsSummary: [
      'Tốc độ hồi phục HP: +500% (Tự hồi máu liên tục mỗi lượt)',
      'Giảm 90% nguy cơ tử vong do mất máu / đứt chi',
      'Miễn nhiễm 100% độc tố thông thường',
      'Tự động vượt qua thử thách thập tử nhất sinh để bước lên Vương Cấp & Đế Cấp!',
    ],
    modifiers: {
      hpRegenPercent: 500,
      lethalWoundResistPercent: 90,
      poisonImmunity: true,
    },
    themeColor: {
      border: 'border-red-400',
      bg: 'bg-red-950/70',
      text: 'text-red-300',
      badge: 'bg-gradient-to-r from-red-900 to-rose-900 border-red-300 text-red-100 font-black tracking-wider',
      glow: 'shadow-[0_0_35px_rgba(239,68,68,0.6)] ring-2 ring-red-400/70 animate-pulse',
    },
  },

  dragon_awakening: {
    id: 'dragon_awakening',
    name: 'Long Lực Thức Tỉnh',
    tier: 'godkin',
    tierName: 'Dị Biến Huyết Thống Thần Ma',
    tierProbability: '1%',
    icon: '🐉⚡👑',
    description: 'Thức tỉnh vảy rồng vô hình và huyết mạch nguyên thủy của Long Tộc Thượng Cổ, cơ thể bất hoại trước ma pháp và bão tố.',
    effectsSummary: [
      'Kháng toàn bộ sát thương Ma pháp: +70%',
      'Giảm sát thương vật lý nhận vào: +50%',
      'Uy lực đòn đánh tay không / cận chiến: +120%',
      'Đủ tư cách trực tiếp khiêu chiến Đỉnh Cao Thất Đại Liệt Cường!',
    ],
    modifiers: {
      magicDamageTakenPercent: -70,
      physicalDamageTakenPercent: -50,
      unarmedDamageDealtPercent: 120,
    },
    themeColor: {
      border: 'border-emerald-400',
      bg: 'bg-emerald-950/70',
      text: 'text-emerald-300',
      badge: 'bg-gradient-to-r from-emerald-900 to-teal-900 border-emerald-300 text-emerald-100 font-black tracking-wider',
      glow: 'shadow-[0_0_35px_rgba(16,185,129,0.6)] ring-2 ring-emerald-400/70 animate-pulse',
    },
  },
};

// Aliases to ensure prompt IDs and alternative keys match identically
TALENTS_CATALOG.steady_mind = TALENTS_CATALOG.unshakable_mind;
TALENTS_CATALOG.keen_hearing = TALENTS_CATALOG.sharp_hearing;
TALENTS_CATALOG.swordsman_sinew = TALENTS_CATALOG.swordsman_bones;
TALENTS_CATALOG.dual_element_flexibility = TALENTS_CATALOG.multi_element_flex;

// -------------------------------------------------------------
// LISTS BY TIER FOR RNG DICE ROLLING
// -------------------------------------------------------------
export const TALENT_TIER_POOLS: Record<TalentTier, TalentDefinition[]> = {
  curse: [
    TALENTS_CATALOG.blocked_meridians,
    TALENTS_CATALOG.crippled_body,
    TALENTS_CATALOG.touki_resistant,
    TALENTS_CATALOG.abandoned_curse,
    TALENTS_CATALOG.short_lived_illness,
  ],
  common: [
    TALENTS_CATALOG.resilient_body,
    TALENTS_CATALOG.unshakable_mind,
    TALENTS_CATALOG.dexterous_hands,
    TALENTS_CATALOG.sharp_hearing,
  ],
  rare: [
    TALENTS_CATALOG.clear_meridians,
    TALENTS_CATALOG.swordsman_bones,
    TALENTS_CATALOG.hunter_intuition,
    TALENTS_CATALOG.quick_absorption,
  ],
  genius: [
    TALENTS_CATALOG.nature_resonance,
    TALENTS_CATALOG.instant_sight,
    TALENTS_CATALOG.wargod_physique,
    TALENTS_CATALOG.multi_element_flex,
  ],
  legendary: [
    TALENTS_CATALOG.laplace_anomaly,
    TALENTS_CATALOG.living_weapon,
    TALENTS_CATALOG.omni_cast,
    TALENTS_CATALOG.martial_mimicry,
  ],
  godkin: [
    TALENTS_CATALOG.immortal_bloodline,
    TALENTS_CATALOG.dragon_awakening,
  ],
};

// -------------------------------------------------------------
// RNG DICE ROLL MECHANISM
// 50% Common, 30% Rare, 15% Genius, 4% Legendary, 1% Godkin
// (Optional curse chance or challenge mode)
// -------------------------------------------------------------
export interface TalentRollResult {
  talent: TalentDefinition;
  rollScore: number;
  tierAwarded: string;
  tierProbability: string;
  rollDetails: string;
  headerNotice: string;
}

/**
 * MANDATORY TRUE RNG ROLL ACROSS ALL 6 TIERS
 * 1. Bậc Khiếm Khuyết / Lời Nguyền (Nerf/Curse): 5% (roll < 5)
 * 2. Bậc Phàm Nhân (Common): 45% (roll >= 5 && roll < 50)
 * 3. Bậc Ưu Tú / Hiếm (Rare): 30% (roll >= 50 && roll < 80)
 * 4. Bậc Thiên Tài (Genius): 15% (roll >= 80 && roll < 95)
 * 5. Bậc Thiên Tài Của Thiên Tài (Legendary): 4% (roll >= 95 && roll < 99)
 * 6. Bậc Dị Biến Huyết Thống Thần Ma (Godkin): 1% (roll >= 99)
 */
export function rollInnateTalentRng(): TalentRollResult {
  const roll = Math.random() * 100; // 0.00 to 100.00

  let chosenTier: TalentTier = 'common';
  let tierAwarded = 'Bậc Phàm Nhân';
  let tierProbability = '45%';

  if (roll >= 99) {
    chosenTier = 'godkin';
    tierAwarded = 'Dị Biến Huyết Thống Thần Ma';
    tierProbability = '1%';
  } else if (roll >= 95) {
    chosenTier = 'legendary';
    tierAwarded = 'Bậc Thiên Tài Của Thiên Tài';
    tierProbability = '4%';
  } else if (roll >= 80) {
    chosenTier = 'genius';
    tierAwarded = 'Bậc Thiên Tài';
    tierProbability = '15%';
  } else if (roll >= 50) {
    chosenTier = 'rare';
    tierAwarded = 'Bậc Ưu Tú / Hiếm';
    tierProbability = '30%';
  } else if (roll >= 5) {
    chosenTier = 'common';
    tierAwarded = 'Bậc Phàm Nhân';
    tierProbability = '45%';
  } else {
    chosenTier = 'curse';
    tierAwarded = 'Khiếm Khuyết / Lời Nguyền';
    tierProbability = '5%';
  }

  const pool = TALENT_TIER_POOLS[chosenTier] || TALENT_TIER_POOLS.common;
  const selected = pool[Math.floor(Math.random() * pool.length)];
  const rollScore = Number(roll.toFixed(2));

  // Build effects description summary string
  const effectsFormatted = (selected.effectsSummary || []).join(', ') || 'Không có';

  // MANDATORY QUẢN TRÒ DICE ROLL ANNOUNCEMENT FORMAT (RULE 2):
  const headerNotice = `[KẾT QUẢ ĐỔ XÚC XẮC THIÊN PHÚ]:
- Đổ bậc phẩm chất: ${selected.tierName} (${tierProbability} - Điểm xúc xắc: ${rollScore}/100)
- Thiên phú nhận được: ${selected.name} (Hiệu ứng: ${effectsFormatted})`;

  return {
    talent: selected,
    rollScore,
    tierAwarded: selected.tierName,
    tierProbability,
    rollDetails: `Xúc xắc Thiên Phú: ${rollScore}/100 -> Gán [${selected.tierName}] (${tierProbability}): [${selected.name}]`,
    headerNotice,
  };
}

/**
 * Formats the exact header notice for an already assigned or pre-rolled talent
 */
export function formatTalentRollHeaderNotice(talent: TalentDefinition, rollScore?: number): string {
  const effectsFormatted = (talent.effectsSummary || []).join(', ') || 'Không có';
  const scoreText = typeof rollScore === 'number' ? ` - Điểm xúc xắc: ${rollScore}/100` : '';
  return `[KẾT QUẢ ĐỔ XÚC XẮC THIÊN PHÚ]:
- Đổ bậc phẩm chất: ${talent.tierName} (${talent.tierProbability}${scoreText})
- Thiên phú nhận được: ${talent.name} (Hiệu ứng: ${effectsFormatted})`;
}

/**
 * Standard unbuffed baseline stats for Age 0 (Newborn infant)
 * Rule 3 Step 1: HP gốc = 10, MP gốc = 10, STR = 2, AGI = 2, Đấu Khí = 0
 */
export function getAgeZeroBaseStats(race: string = 'Nhân tộc (Human)', location: string = 'Làng Buena (Vương quốc Asura)'): CharacterStats {
  const raceLower = race.toLowerCase();
  const isBeast = raceLower.includes('thú');
  const isDragon = raceLower.includes('long') || raceLower.includes('dragon');

  const baseHp = isDragon ? 15 : (isBeast ? 12 : 10);
  const baseMp = isDragon ? 15 : (isBeast ? 8 : 10);
  const baseStr = isDragon ? 4 : (isBeast ? 3 : 2);
  const baseAgi = isDragon ? 3 : (isBeast ? 3 : 2);

  return {
    healthCurrent: baseHp,
    healthMax: baseHp,
    manaCurrent: baseMp,
    manaMax: baseMp,
    manaPotentialMultiplier: 1.0,
    manaControl: 5,
    touki: 0,
    toukiMax: 100,
    knowledge: 10,
    strength: baseStr,
    agility: baseAgi,
    staminaCurrent: 20,
    staminaMax: 20,
    asuraCoins: 50,
    fatigue: 0,
    age: 0,
    month: 1,
    location,
  };
}

// -------------------------------------------------------------
// STATS SCALING & MODIFIER APPLICATION
// "Tất cả hiệu ứng buff/nerf tính toán trực tiếp vào chỉ số gốc (Base Stats) theo tỷ lệ phần trăm (%)"
// -------------------------------------------------------------
export function applyTalentToBaseStats(
  rawStats: CharacterStats,
  talent: TalentDefinition
): CharacterStats {
  const stats: CharacterStats = { ...rawStats };
  const mods = talent.modifiers;
  const isNewborn = (stats.age === 0);

  // 1. HP Max scaling: 10 - 40% = 6, 10 + 10% = 11, etc.
  if (typeof mods.hpMaxPercent === 'number') {
    const factor = 1 + mods.hpMaxPercent / 100;
    stats.healthMax = Math.max(1, Math.round(rawStats.healthMax * factor));
    const prevRatio = rawStats.healthMax > 0 ? (rawStats.healthCurrent / rawStats.healthMax) : 1;
    stats.healthCurrent = Math.max(1, Math.min(stats.healthMax, Math.round(stats.healthMax * prevRatio)));
  }

  // 2. MP Max scaling: 10 + 1000% = 110, lockMagic = 0
  if (mods.lockMagic || (typeof mods.mpMaxPercent === 'number' && mods.mpMaxPercent <= -100)) {
    stats.manaMax = 0;
    stats.manaCurrent = 0;
  } else if (typeof mods.mpMaxPercent === 'number') {
    const factor = 1 + mods.mpMaxPercent / 100;
    stats.manaMax = Math.max(0, Math.round(rawStats.manaMax * factor));
    const prevRatio = rawStats.manaMax > 0 ? (rawStats.manaCurrent / rawStats.manaMax) : 1;
    stats.manaCurrent = Math.max(0, Math.min(stats.manaMax, Math.round(stats.manaMax * prevRatio)));
  }

  // 3. Touki Max & Current scaling
  const baseToukiMax = rawStats.toukiMax || 100;
  if (mods.lockTouki || (typeof mods.toukiMaxPercent === 'number' && mods.toukiMaxPercent <= -100)) {
    stats.toukiMax = 0;
    stats.touki = 0;
  } else {
    const toukiMod = typeof mods.toukiMaxPercent === 'number' ? mods.toukiMaxPercent : 0;
    stats.toukiMax = Math.max(10, Math.round(baseToukiMax * (1 + toukiMod / 100)));

    if (isNewborn && (rawStats.touki === 0 || rawStats.touki === undefined)) {
      if (toukiMod > 0) {
        // Early infant spark (e.g. Living Weapon +300% sparks 20 Touki from birth)
        const spark = Math.round(5 * (1 + toukiMod / 100));
        stats.touki = Math.min(stats.toukiMax, spark);
      } else {
        stats.touki = 0;
      }
    } else {
      const rawVal = rawStats.touki || 0;
      const scaleFactor = 1 + Math.max(0, toukiMod) / 100;
      stats.touki = Math.min(stats.toukiMax, Math.max(0, Math.round(rawVal * (toukiMod > 0 ? scaleFactor : 1))));
    }
  }

  // 4. STR scaling
  if (typeof mods.strPercent === 'number') {
    const baseStr = rawStats.strength !== undefined ? rawStats.strength : (isNewborn ? 2 : 20);
    const factor = 1 + mods.strPercent / 100;
    stats.strength = Math.max(1, Math.round(baseStr * factor));
  } else if (stats.strength === undefined) {
    stats.strength = isNewborn ? 2 : 20;
  }

  // 5. AGI scaling
  if (typeof mods.agiPercent === 'number') {
    const baseAgi = rawStats.agility !== undefined ? rawStats.agility : (isNewborn ? 2 : 15);
    const factor = 1 + mods.agiPercent / 100;
    stats.agility = Math.max(1, Math.round(baseAgi * factor));
  } else if (stats.agility === undefined) {
    stats.agility = isNewborn ? 2 : 15;
  }

  // 6. Stamina Max scaling
  stats.staminaMax = rawStats.staminaMax || (isNewborn ? 20 : 100);
  stats.staminaCurrent = Math.min(stats.staminaMax, rawStats.staminaCurrent ?? stats.staminaMax);

  // 7. Damage bonuses & multipliers
  if (typeof mods.physicalDamageTakenPercent === 'number') {
    stats.incomingPhysicalDamageMultiplier = 1 + mods.physicalDamageTakenPercent / 100;
  }
  if (typeof mods.magicDamageTakenPercent === 'number') {
    stats.incomingMagicDamageMultiplier = 1 + mods.magicDamageTakenPercent / 100;
  }
  if (typeof mods.physicalDamageDealtPercent === 'number') {
    stats.slashDamageBonus = (stats.slashDamageBonus || 0) + mods.physicalDamageDealtPercent;
  }
  if (typeof mods.unarmedDamageDealtPercent === 'number') {
    stats.meleeDamageBonus = (stats.meleeDamageBonus || 0) + mods.unarmedDamageDealtPercent;
  }

  return stats;
}

/**
 * Formats mathematical breakdown notes for [BẢNG TRẠNG THÁI]
 * Rule 3 Step 3: ghi chú rõ chỉ số sau khi đã tính toán phần trăm để người chơi kiểm tra.
 */
export function formatTalentStatMathNotes(char: Character): {
  hpNote: string;
  mpNote: string;
  toukiNote: string;
  strNote: string;
  agiNote: string;
} {
  const talentDef = TALENTS_CATALOG[char.progression?.innateTalent?.id || 'resilient_body'] || TALENTS_CATALOG.resilient_body;
  const mods = talentDef.modifiers;
  const raw = char.rawBaseStats || char.stats;

  let hpNote = '';
  if (mods.hpMaxPercent !== undefined && mods.hpMaxPercent !== 0) {
    hpNote = ` (Gốc: ${raw.healthMax} [${mods.hpMaxPercent > 0 ? `+${mods.hpMaxPercent}%` : `${mods.hpMaxPercent}%`} ${talentDef.name}])`;
  }

  let mpNote = '';
  if (mods.lockMagic || (mods.mpMaxPercent !== undefined && mods.mpMaxPercent <= -100)) {
    mpNote = ` (Khóa vĩnh viễn - 0 MP [${talentDef.name}])`;
  } else if (mods.mpMaxPercent !== undefined && mods.mpMaxPercent !== 0) {
    mpNote = ` (Gốc: ${raw.manaMax} [${mods.mpMaxPercent > 0 ? `+${mods.mpMaxPercent}%` : `${mods.mpMaxPercent}%`} ${talentDef.name}])`;
  }

  let toukiNote = '';
  if (mods.lockTouki || (mods.toukiMaxPercent !== undefined && mods.toukiMaxPercent <= -100)) {
    toukiNote = ` (Khóa vĩnh viễn - 0 Đấu Khí [${talentDef.name}])`;
  } else if (mods.toukiMaxPercent !== undefined && mods.toukiMaxPercent !== 0) {
    const rawMax = raw.toukiMax || 100;
    const finalMax = char.stats.toukiMax || Math.round(rawMax * (1 + mods.toukiMaxPercent / 100));
    toukiNote = ` (Giới hạn: ${finalMax} [Gốc: ${rawMax} ${mods.toukiMaxPercent > 0 ? `+${mods.toukiMaxPercent}%` : `${mods.toukiMaxPercent}%`} ${talentDef.name}])`;
  }

  let strNote = '';
  if (mods.strPercent !== undefined && mods.strPercent !== 0) {
    strNote = ` (Gốc: ${raw.strength || 2} [+${mods.strPercent}% ${talentDef.name}])`;
  }

  let agiNote = '';
  if (mods.agiPercent !== undefined && mods.agiPercent !== 0) {
    agiNote = ` (Gốc: ${raw.agility || 2} [+${mods.agiPercent}% ${talentDef.name}])`;
  }

  return { hpNote, mpNote, toukiNote, strNote, agiNote };
}

/**
 * Synchronize character talent % buff/nerf scaling into base stats and progression.
 * Ensures consistent, idempotent calculations without double-multiplying.
 */
export function syncCharacterTalentStats(char: Character): Character {
  if (!char || !char.stats) return char;

  // 1. Identify talent definition - NEVER hardcode defaults!
  let talentId = (char as any).preRolledTalent || 
    char.progression?.innateTalent?.id || 
    char.progression?.innateTalent?.type;
  
  if (!talentId || !TALENTS_CATALOG[talentId]) {
    // True independent RNG roll across 6 tiers if not specified
    const rolled = rollInnateTalentRng();
    talentId = rolled.talent.id;
    (char as any).preRolledTalent = talentId;
    (char as any).talentRollResult = rolled;
  }

  const talentDef = TALENTS_CATALOG[talentId] || TALENTS_CATALOG.resilient_body;
  const mods = talentDef.modifiers;
  const hpMod = mods.hpMaxPercent || 0;
  const mpMod = mods.mpMaxPercent || 0;
  const toukiMod = mods.toukiMaxPercent || 0;
  const strMod = mods.strPercent || 0;
  const agiMod = mods.agiPercent || 0;

  // 2. Initialize or maintain raw unbuffed base stats
  if (!char.rawBaseStats) {
    if (char.stats.age === 0) {
      char.rawBaseStats = getAgeZeroBaseStats(char.race, char.stats.location);
    } else {
      char.rawBaseStats = {
        ...char.stats,
        healthMax: hpMod !== 0 ? Math.max(1, Math.round(char.stats.healthMax / (1 + hpMod / 100))) : (char.stats.healthMax || 30),
        manaMax: (!mods.lockMagic && mpMod > -100 && mpMod !== 0) ? Math.max(0, Math.round(char.stats.manaMax / (1 + mpMod / 100))) : (char.stats.manaMax || 30),
        touki: (!mods.lockTouki && toukiMod > -100 && toukiMod > 0) ? Math.max(0, Math.round(char.stats.touki / (1 + toukiMod / 100))) : (char.stats.touki || 0),
        toukiMax: 100,
        strength: strMod !== 0 ? Math.max(1, Math.round((char.stats.strength || 20) / (1 + strMod / 100))) : (char.stats.strength || 20),
        agility: agiMod !== 0 ? Math.max(1, Math.round((char.stats.agility || 15) / (1 + agiMod / 100))) : (char.stats.agility || 15),
        staminaMax: char.stats.staminaMax || 100,
      };
    }
  } else {
    // Forward-sync rawBaseStats with any progress made on stats so gains are NEVER overwritten or lost
    char.rawBaseStats.toukiMax = char.rawBaseStats.toukiMax || 100;

    const currentExpectedHpMax = Math.round((char.rawBaseStats.healthMax || 10) * (1 + hpMod / 100));
    if (char.stats.healthMax > currentExpectedHpMax) {
      const derivedRawHp = hpMod !== 0 ? Math.round(char.stats.healthMax / (1 + hpMod / 100)) : char.stats.healthMax;
      char.rawBaseStats.healthMax = Math.max(char.rawBaseStats.healthMax || 10, derivedRawHp);
    }

    if (!mods.lockMagic && mpMod > -100) {
      const currentExpectedMpMax = Math.round((char.rawBaseStats.manaMax || 10) * (1 + mpMod / 100));
      if (char.stats.manaMax > currentExpectedMpMax) {
        const derivedRawMp = mpMod !== 0 ? Math.round(char.stats.manaMax / (1 + mpMod / 100)) : char.stats.manaMax;
        char.rawBaseStats.manaMax = Math.max(char.rawBaseStats.manaMax || 10, derivedRawMp);
      }
    }

    if (!mods.lockTouki) {
      if ((char.stats.touki || 0) > (char.rawBaseStats.touki || 0)) {
        char.rawBaseStats.touki = char.stats.touki;
      }
    }

    if (char.stats.strength && char.stats.strength > Math.round((char.rawBaseStats.strength || 2) * (1 + strMod / 100))) {
      char.rawBaseStats.strength = strMod !== 0 ? Math.round(char.stats.strength / (1 + strMod / 100)) : char.stats.strength;
    }
    if (char.stats.agility && char.stats.agility > Math.round((char.rawBaseStats.agility || 2) * (1 + agiMod / 100))) {
      char.rawBaseStats.agility = agiMod !== 0 ? Math.round(char.stats.agility / (1 + agiMod / 100)) : char.stats.agility;
    }
    if (char.stats.staminaMax && char.stats.staminaMax > (char.rawBaseStats.staminaMax || 20)) {
      char.rawBaseStats.staminaMax = char.stats.staminaMax;
    }
  }

  // 3. Scale stats deterministically from raw base stats
  const scaledStats = applyTalentToBaseStats(char.rawBaseStats!, talentDef);
  
  // Preserve current values, clamped to new maxes
  const prevHpMax = char.stats.healthMax || scaledStats.healthMax;
  const prevHpCur = char.stats.healthCurrent !== undefined ? char.stats.healthCurrent : scaledStats.healthMax;
  const hpRatio = prevHpMax > 0 ? prevHpCur / prevHpMax : 1;

  char.stats.healthMax = scaledStats.healthMax;
  char.stats.healthCurrent = Math.max(1, Math.min(scaledStats.healthMax, Math.round(scaledStats.healthMax * hpRatio)));

  if (mods.lockMagic || mpMod <= -100) {
    char.stats.manaMax = 0;
    char.stats.manaCurrent = 0;
  } else {
    const prevMpMax = char.stats.manaMax || scaledStats.manaMax;
    const prevMpCur = char.stats.manaCurrent !== undefined ? char.stats.manaCurrent : scaledStats.manaMax;
    const mpRatio = prevMpMax > 0 ? prevMpCur / prevMpMax : 1;
    char.stats.manaMax = scaledStats.manaMax;
    char.stats.manaCurrent = Math.max(0, Math.min(scaledStats.manaMax, Math.round(scaledStats.manaMax * mpRatio)));
  }

  if (mods.lockTouki || toukiMod <= -100) {
    char.stats.toukiMax = 0;
    char.stats.touki = 0;
  } else {
    char.stats.toukiMax = scaledStats.toukiMax;
    char.stats.touki = Math.min(scaledStats.toukiMax, Math.max(char.stats.touki || 0, scaledStats.touki || 0));
  }

  char.stats.strength = scaledStats.strength;
  char.stats.agility = scaledStats.agility;
  if (scaledStats.incomingPhysicalDamageMultiplier !== undefined) {
    char.stats.incomingPhysicalDamageMultiplier = scaledStats.incomingPhysicalDamageMultiplier;
  }
  if (scaledStats.incomingMagicDamageMultiplier !== undefined) {
    char.stats.incomingMagicDamageMultiplier = scaledStats.incomingMagicDamageMultiplier;
  }
  if (scaledStats.slashDamageBonus !== undefined) {
    char.stats.slashDamageBonus = scaledStats.slashDamageBonus;
  }
  if (scaledStats.meleeDamageBonus !== undefined) {
    char.stats.meleeDamageBonus = scaledStats.meleeDamageBonus;
  }

  // 4. Update rich talent info in progression if progression exists
  if (char.progression) {
    char.progression.innateTalent = {
      id: talentDef.id,
      type: talentDef.id as any,
      name: talentDef.name,
      description: talentDef.description,
      tier: talentDef.tier,
      tierName: talentDef.tierName,
      tierProbability: talentDef.tierProbability,
      icon: talentDef.icon,
      effectsSummary: talentDef.effectsSummary,
      modifiers: talentDef.modifiers,
    };
  }

  return char;
}

// -------------------------------------------------------------
// BOTTLENECK & BREAKTHROUGH COMPATIBILITY
// Evaluates how the talent influences power tiers
// -------------------------------------------------------------
export function evaluateTalentBreakthroughSupport(
  talent: TalentDefinition,
  targetTier: PowerTier,
  branchCategory: 'magic' | 'sword' | 'crafting' | 'magicKnight'
): {
  isBlocked: boolean;
  blockedReason?: string;
  isFavored: boolean;
  advantageDescription?: string;
  spDiscountPercent: number;
} {
  // Check direct lock
  if (branchCategory === 'magic' && talent.modifiers.lockMagic) {
    return {
      isBlocked: true,
      blockedReason: `Thiên phú [${talent.name}] khóa vĩnh viễn dòng chảy ma lực! Không thể học hoặc đột phá ma pháp.`,
      isFavored: false,
      spDiscountPercent: 0,
    };
  }

  if ((branchCategory === 'sword' || branchCategory === 'magicKnight') && talent.modifiers.lockTouki) {
    if (targetTier === 'Đế cấp (Emperor)' || targetTier === 'Thần cấp (God)') {
      return {
        isBlocked: true,
        blockedReason: `Thiên phú [${talent.name}] không thể tạo Đấu Khí, cơ thể phàm nhân không thể chịu nổi phản chấn của Kiếm Vương / Kiếm Đế!`,
        isFavored: false,
        spDiscountPercent: 0,
      };
    }
  }

  let spDiscount = 0;
  if (talent.modifiers.skillExpBonusPercent) {
    spDiscount += talent.modifiers.skillExpBonusPercent;
  }

  // Favored conditions
  if (branchCategory === 'magic') {
    if (talent.id === 'laplace_anomaly') {
      return {
        isBlocked: false,
        isFavored: true,
        advantageDescription: 'Yếu Tố Laplace Ma Lực Vô Tận: Không có rào cản bình cảnh ma lực!',
        spDiscountPercent: spDiscount + 30,
      };
    }
    if (talent.id === 'nature_resonance') {
      return {
        isBlocked: false,
        isFavored: true,
        advantageDescription: 'Đồng Điệu Tự Nhiên: Tự ngộ quy mô khí tượng và Vô niệm chú!',
        spDiscountPercent: spDiscount + 20,
      };
    }
  }

  if (branchCategory === 'sword') {
    if (talent.id === 'living_weapon') {
      return {
        isBlocked: false,
        isFavored: true,
        advantageDescription: 'Vũ Khí Sống Thuần Khiết: Cốt cách Kiếm Đế bẩm sinh, chém đứt rào cản phàm nhân!',
        spDiscountPercent: spDiscount + 35,
      };
    }
    if (talent.id === 'wargod_physique') {
      return {
        isBlocked: false,
        isFavored: true,
        advantageDescription: 'Thể Chất Chiến Thần: Giảm số lần sinh tử cần thiết để đột phá cấp Vương!',
        spDiscountPercent: spDiscount + 20,
      };
    }
  }

  if (talent.tier === 'godkin') {
    return {
      isBlocked: false,
      isFavored: true,
      advantageDescription: 'Huyết Thống Thần Ma Cổ Đại: Thể phách siêu việt không sợ rào cản thông thường!',
      spDiscountPercent: spDiscount + 25,
    };
  }

  return {
    isBlocked: false,
    isFavored: false,
    spDiscountPercent: spDiscount,
  };
}
