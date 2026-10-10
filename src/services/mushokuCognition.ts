import type { Character, PowerTier } from '../types/game.ts';
import { TIER_RANK_MAP } from './mushokuRules.ts';

export interface PlausibilityResult {
  isPlausible: boolean;
  isAbsurd: boolean;
  isFatal: boolean;
  punishmentReason?: string;
  punishmentType?: 'death' | 'imprisonment' | 'severe_penalty' | 'social_exile';
  isScientificInnovation?: boolean;
  innovationName?: string;
  scientificBonusNote?: string;
  isPsychologicalDiplomacy?: boolean;
  diplomacyNote?: string;
}

export interface CognitionEvaluation {
  plausibility: PlausibilityResult;
  npcPsychologyNote: string;
  rippleEffectText?: string;
  destinyInterventionNote?: string;
}

/**
 * BƯỚC 1: ĐÁNH GIÁ TÍNH KHẢ THI (PLAUSIBILITY CHECK)
 * Kiểm tra xem hành động của người chơi có vi phạm quy tắc vật lý, cấp bậc Đấu Khí, dòng chảy Mana hoặc giới hạn tuổi tác không.
 * Xử lý nghiêm khắc các hành động hoang đường/bất hợp lý (No Yes-Man AI), đồng thời khen thưởng sáng tạo khoa học.
 */
export function evaluateActionPlausibility(char: Character, actionText: string = ''): PlausibilityResult {
  const text = (actionText || '').toLowerCase().trim();
  const age = char?.stats?.age ?? 0;
  const location = char?.stats?.location || '';
  const touki = char?.stats?.touki ?? 0;
  const swordGodTier = char?.swordsmanship?.swordGod ? (TIER_RANK_MAP[char.swordsmanship.swordGod] || 0) : 0;

  // 1. Phản đòn hành động hoang đường / lố bịch (Absurd Actions)
  // Quyến rũ Thần, sỉ nhục tối cao, tự sát hoang đường
  if (
    (text.includes('quyến rũ') || text.includes('tán tỉnh') || text.includes('seduce')) &&
    (text.includes('thần') || text.includes('hitogami') || text.includes('orsted') || text.includes('kishirika') || text.includes('nhân thần') || text.includes('long thần'))
  ) {
    return {
      isPlausible: false,
      isAbsurd: true,
      isFatal: true,
      punishmentType: 'death',
      punishmentReason: '🚫 [HÀNH ĐỘNG HOANG ĐƯỜNG - TỬ VONG]: Ý đồ quyến rũ thực thể cấp Thần! Uy áp thần thánh chỉ cần một cái liếc mắt đã nghiền nát ý thức và lục phủ ngũ tạng của bạn thành tro bụi.',
    };
  }

  // Khiêu khích vô cớ kẻ mạnh hơn 3 cấp hoặc thực thể Thần mà không có thực lực
  if (
    (text.includes('khiêu khích') || text.includes('chửi') || text.includes('nhổ nước bọt') || text.includes('tát vào mặt')) &&
    (text.includes('orsted') || text.includes('long thần') || text.includes('quý tộc asura') || text.includes('thánh hiệp sĩ') || text.includes('hoàng tộc'))
  ) {
    if (age < 12 || (touki < 40 && swordGodTier < 3)) {
      return {
        isPlausible: false,
        isAbsurd: true,
        isFatal: true,
        punishmentType: 'death',
        punishmentReason: '🚫 [HẬU QUẢ NGHIÊM KHẮC - TỬ TRẬN]: Bạn khiêu khích vô cớ một thế lực vượt trội hơn 3 cấp bậc mà không có khả năng tự vệ. Nhát chém trừng phạt trong chớp mắt đã lấy đi sinh mạng của bạn!',
      };
    }
  }

  // Hành vi khiếm nhã lố bịch giữa cuộc họp quý tộc hoặc cung điện hoàng gia
  if (
    (text.includes('cởi truồng') || text.includes('tụt quần') || text.includes('tiểu bậy') || text.includes('hét toáng lên đòi làm vua')) &&
    (location.includes('Roa') || location.includes('Asura') || location.includes('Lâu đài') || location.includes('Millis'))
  ) {
    return {
      isPlausible: false,
      isAbsurd: true,
      isFatal: false,
      punishmentType: 'imprisonment',
      punishmentReason: '⚠️ [HÀNH VI LỐ BỊCH - TỐNG GIAM]: Vệ binh hoàng gia và kỵ sĩ lập tức đè nghiến bạn xuống đất, khóa chặt tay chân và tống bạn vào ngục tối vì tội làm nhục thể diện quý tộc!',
    };
  }

  // Nhảy vực / nhảy từ độ cao hàng trăm mét mà đòi không sao
  if (
    (text.includes('nhảy xuống vực') || text.includes('nhảy từ trên tháp') || text.includes('nhảy xuống nham thạch')) &&
    char?.magic?.wind === 'Chưa học' &&
    touki < 50
  ) {
    return {
      isPlausible: false,
      isAbsurd: true,
      isFatal: true,
      punishmentType: 'death',
      punishmentReason: '🚫 [VI PHẠM QUY TẮC VẬT LÝ - TỬ VONG]: Cơ thể người phàm rơi từ độ cao cực lớn mà không có ma pháp gió cản đà hay Đấu Khí Cấp Thánh bao bọc sẽ nát vụn khi chạm đất.',
    };
  }

  // 2. Khen thưởng Sáng tạo Khoa học Hợp lý (Scientific Innovation)
  // Kết hợp nguyên lý nhiệt động lực học, áp suất, xoay ly tâm, điện hóa
  const scientificKeywords = [
    'chênh lệch nhiệt độ',
    'áp suất',
    'nén xoay',
    'nén ly tâm',
    'chân không',
    'điện phân',
    'quang học',
    'hội tụ',
    'đạn nén',
    'bão lốc',
    'lực đàn hồi',
    'quán tính',
    'trọng tâm',
  ];

  const matchedKeywords = scientificKeywords.filter(k => text.includes(k));
  if (matchedKeywords.length > 0) {
    let innovationName = 'Ma Pháp Biến Thể Khoa Học';
    if (text.includes('chênh lệch nhiệt độ') || text.includes('bão lốc')) {
      innovationName = 'Nhiệt Luồng Xoáy Khí (Thermal Cyclone)';
    } else if (text.includes('nén xoay') || text.includes('đạn nén') || text.includes('áp suất')) {
      innovationName = 'Địa Pháo Nén Xoay Cao Tốc (Rotary Armor-Piercing Cannon)';
    } else if (text.includes('quang học') || text.includes('hội tụ')) {
      innovationName = 'Thấu Kính Quang Ma (Optical Focus Blast)';
    }

    return {
      isPlausible: true,
      isAbsurd: false,
      isFatal: false,
      isScientificInnovation: true,
      innovationName,
      scientificBonusNote: `★ SÁNG TẠO ĐỘT PHÁ: Bạn đã vận dụng nguyên lý khoa học [${matchedKeywords.join(', ')}] để tái định hình dòng chảy ma lực! Uy lực chiêu thức tăng vượt cấp và bạn nhận thêm +25 Tri Thức (KP).`,
    };
  }

  // 3. Sử dụng Đòn Tâm Lý, Đàm Phán, Lợi Dụng Mâu Thuẫn Thế Lực
  const diplomaticKeywords = [
    'thuyết phục',
    'đàm phán',
    'thỏa hiệp',
    'lợi dụng mâu thuẫn',
    'ly gián',
    'khích tướng',
    'giả vờ thần phục',
    'bắt bài tâm lý',
    'trao đổi lợi ích',
    'đưa ra bằng chứng',
  ];

  if (diplomaticKeywords.some(k => text.includes(k))) {
    return {
      isPlausible: true,
      isAbsurd: false,
      isFatal: false,
      isPsychologicalDiplomacy: true,
      diplomacyNote: '★ ĐÒN BẨY TÂM LÝ & ĐÀM PHÁN: Bạn đã nắm bắt động cơ của đối phương, xoay chuyển tình thế bằng lời nói sắc bén thay vì đơn thuần đổ máu.',
    };
  }

  return {
    isPlausible: true,
    isAbsurd: false,
    isFatal: false,
  };
}

/**
 * BƯỚC 2: PHÂN TÍCH TÂM LÝ NPC & VĂN HÓA KHU VỰC
 */
export function getRegionalNpcMindset(location: string = ''): string {
  const loc = (location || '').toLowerCase();
  if (loc.includes('asura') || loc.includes('roa') || loc.includes('buena') || loc.includes('fittoa')) {
    return 'Văn hóa Quý tộc Asura: Kiêu hãnh, đề cao địa vị huyết thống, đa nghi và coi thường ngoại tộc ma tộc.';
  }
  if (loc.includes('millis') || loc.includes('milishion')) {
    return 'Văn hóa Thần thánh quốc Millis: Tôn sùng Giáo phái Millis, bài trừ tà thuật và ma tộc, ranh giới đạo đức hà khắc.';
  }
  if (loc.includes('ma tộc') || loc.includes('demon') || loc.includes('rikashu') || loc.includes('wind')) {
    return 'Văn hóa Lục địa Ma: Tôn sùng sức mạnh thực chiến, thẳng thắn tàn nhẫn, kẻ yếu phải cúi đầu trước cường giả.';
  }
  if (loc.includes('đại sâm lâm') || loc.includes('thú tộc') || loc.includes('doldia')) {
    return 'Văn hóa Thú tộc Đại Sâm Lâm: Bản năng tự nhiên, trung thành tuyệt đối với thị tộc, tôn trọng thợ săn dũng cảm.';
  }
  return 'Thế giới Sáu Mặt: Con người và sinh vật luôn hành xử dựa trên nỗi sợ, mưu cầu sinh tồn và toan tính danh lợi.';
}

/**
 * BƯỚC 3 & BƯỚC 4: TÍNH TOÁN HIỆU ỨNG CÁNH BƯỚM & CAN THIỆP SỐ MỆNH
 * Tạo ra dòng chữ in nghiêng báo hiệu biến chuyển ngầm của thế giới.
 */
export function evaluateButterflyAndFate(
  char: Character, 
  actionText: string = '', 
  turnNumber: number = 1
): { rippleEffectText?: string; fateNote?: string } {
  const text = (actionText || '').toLowerCase();
  const age = char?.stats?.age ?? 0;
  const location = char?.stats?.location || '';

  // 1. Can thiệp của Nhân Thần (Hitogami) nếu người chơi có hành động làm chệch hướng lớn
  if (
    text.includes('hitogami') || 
    text.includes('nhân thần') || 
    (text.includes('ruijerd') && text.includes('cứu')) ||
    (text.includes('khuyên') && text.includes('paul')) ||
    char?.completedMilestones?.includes('fittoa_teleport')
  ) {
    if (Math.random() < 0.35 || text.includes('hitogami')) {
      return {
        rippleEffectText: '*> Một ánh nhìn hư vô từ khoảng không trắng xóa đang lướt qua vận mệnh của bạn. Nhân Thần đã nhận ra một vết nứt lạ lùng trong tương lai...*',
        fateNote: 'Nhân Thần (Hitogami) bắt đầu để mắt tới sự tồn tại khác thường của bạn.',
      };
    }
  }

  // 2. Can thiệp Long Thần Orsted
  if (text.includes('orsted') || text.includes('long thần') || text.includes('hẻm núi')) {
    return {
      rippleEffectText: '*> Dòng chảy luân hồi hàng trăm năm của Long Thần Orsted vừa xuất hiện một gợn sóng biến dị mà ông chưa từng chứng kiến...*',
      fateNote: 'Long Thần Orsted cảm nhận được dị biến trong dòng thời gian.',
    };
  }

  // 3. Cứu người / Tha mạng
  if (text.includes('khoan dung') || text.includes('tha mạng') || text.includes('cứu sống')) {
    return {
      rippleEffectText: '*> Sinh mạng bạn tha thứ hôm nay đã gieo một hạt giống nhân quả sâu sắc. Tương lai của vùng đất này sẽ vì thế mà rẽ sang một ngã rẽ hoàn toàn mới...*',
    };
  }

  // 4. Lừa gạt / Giết chóc / Âm mưu quý tộc
  if (text.includes('hạ sát') || text.includes('đoạt mạng') || text.includes('lừa') || text.includes('ám sát')) {
    return {
      rippleEffectText: '*> Vết máu trên chiến trường không bao giờ khô hẳn. Đâu đó trong bóng tối, những tai mắt thám tử đã ghi nhớ diện mạo và phong cách ra chiêu của bạn...*',
    };
  }

  // 5. Thảm họa Roa tích tụ ngầm theo độ tuổi
  if (age >= 8 && age <= 10 && !char?.completedMilestones?.includes('fittoa_teleport')) {
    if (turnNumber % 4 === 0) {
      return {
        rippleEffectText: '*> Trên bầu trời cao Fittoa, mật độ Mana vô hình đang cô đặc với tốc độ bất thường. Một thảm họa chấn động đang âm thầm đếm ngược từng ngày...*',
      };
    }
  }

  // 6. Tranh giành quyền lực Asura
  if (location.includes('Roa') || location.includes('Asura')) {
    if (turnNumber % 5 === 0) {
      return {
        rippleEffectText: '*> Cục diện tranh đoạt ngai vàng Vương quốc Asura đang sôi sục ngầm giữa phe Đệ Nhị Hoàng Tử và Đệ Nhất Vương Tử...*',
      };
    }
  }

  return {};
}
