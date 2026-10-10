import type { 
  Character, 
  TurnChoice, 
  Opponent, 
  AdventurerRank, 
  RegionalReputation, 
  CharacterReputationState,
  EpithetDefinition
} from '../types/game.ts';

// =========================================================================
// 1. CATALOG OF DYNAMIC EPITHETS (DANH MỤC BIỆT DANH ĐA TUYẾN)
// =========================================================================

export const EPITHET_CATALOG: Record<string, EpithetDefinition> = {
  // --- Mặc định ban đầu ---
  nameless_reincarnator: {
    id: 'nameless_reincarnator',
    title: 'Kẻ Vô Danh',
    description: 'Chưa để lại dấu ấn nào trên đại lục, vẫn là một sinh linh bé nhỏ chưa ai biết đến.',
    type: 'achievement',
    fearFactor: 0,
    renownScore: 0,
    shopDiscountPercent: 0,
    flavorQuote: 'Một linh hồn mới đến trong dòng chảy sinh mệnh.',
  },

  // --- Nhánh Combat: Khống chế Địa hình / Bùn Lầy (Quagmire) ---
  quagmire_novice: {
    id: 'quagmire_novice',
    title: 'Bùn Lầy (Quagmire)',
    description: 'Nổi tiếng với chiến thuật dùng đất sình và bùn lầy nén làm chậm, cô lập và vô hiệu hóa đối phương.',
    type: 'combat',
    fearFactor: 25,
    renownScore: 30,
    shopDiscountPercent: 5,
    flavorQuote: 'Bất kỳ ai đặt chân vào phạm vi ma pháp của người này đều chìm sâu vào tuyệt vọng.',
  },
  quagmire_master: {
    id: 'quagmire_master',
    title: 'Địa Phược Giả',
    description: 'Bậc thầy thao túng thổ nhưỡng, biến mặt đất thành cạm bẫy sống trói buộc mọi dã thú và kiếm sĩ.',
    type: 'combat',
    fearFactor: 45,
    renownScore: 60,
    shopDiscountPercent: 10,
    flavorQuote: 'Mặt đất dưới chân bạn không còn là điểm tựa, mà là xiềng xích vĩnh hằng.',
  },
  quagmire_apex: {
    id: 'quagmire_apex',
    title: 'Đầm Lầy Tử Thần',
    description: 'Cơn ác mộng nuốt chửng hàng vạn ma thú và đoàn quân trong vực thẳm bùn lầy không đáy.',
    type: 'combat',
    fearFactor: 75,
    renownScore: 90,
    shopDiscountPercent: 15,
    attractChallengers: true,
    flavorQuote: 'Nơi người ấy đi qua, chiến trường biến thành nấm mồ sa lầy của những kẻ kiêu ngạo.',
  },

  // --- Nhánh Combat: Berserker / Cuồng Bạo ---
  berserker_blade: {
    id: 'berserker_blade',
    title: 'Cuồng Nhận',
    description: 'Lối đánh điên cuồng, chém rách mọi hàng phòng ngự mà không bao giờ lùi nửa bước.',
    type: 'combat',
    fearFactor: 35,
    renownScore: 35,
    shopDiscountPercent: 0,
    flavorQuote: 'Lưỡi kiếm chỉ dừng lại khi đối thủ hoàn toàn gục ngã.',
  },
  blood_wolf: {
    id: 'blood_wolf',
    title: 'Huyết Lang',
    description: 'Dã tính hung tợn như sói đói ngửi thấy mùi máu, săn lùng triệt hạ kẻ thù đến hơi thở cuối cùng.',
    type: 'combat',
    fearFactor: 60,
    renownScore: 65,
    shopDiscountPercent: 5,
    attractChallengers: true,
    flavorQuote: 'Ánh mắt rực lửa khát máu khiến dã thú trong rừng sâu cũng phải né tránh.',
  },
  sword_demon: {
    id: 'sword_demon',
    title: 'Kiếm Quỷ',
    description: 'Một con quỷ kiếm thuật đích thực, nhát chém tàn độc reo rắc kinh hoàng khắp chiến trường.',
    type: 'combat',
    fearFactor: 85,
    renownScore: 95,
    shopDiscountPercent: 10,
    attractChallengers: true,
    flavorQuote: 'Bóng hình ma quái vung kiếm giữa biển máu, một huyền thoại kinh hoàng.',
  },

  // --- Nhánh Combat: Bắc Thần / Ám Khí / Mẹo Bẩn ---
  errant_blade: {
    id: 'errant_blade',
    title: 'Lạc Nhẫn',
    description: 'Đòn thế biến ảo bất quy tắc, xuất chiêu không theo lề lối khiến đối phương không thể lường trước.',
    type: 'combat',
    fearFactor: 20,
    renownScore: 30,
    shopDiscountPercent: 5,
    flavorQuote: 'Thắng lợi là trên hết, không có chỗ cho kiếm đạo hào nhoáng.',
  },
  poison_monkey: {
    id: 'poison_monkey',
    title: 'Độc Hầu',
    description: 'Thân pháp thoăn thoắt, chuyên dùng phi tiêu, độc dược và ám toán để hạ gục đối thủ to xác.',
    type: 'combat',
    fearFactor: 40,
    renownScore: 55,
    shopDiscountPercent: 5,
    guardInspectionRisk: true,
    flavorQuote: 'Một vết xước nhỏ cũng đủ để kết thúc một sinh mạng kiêu hãnh.',
  },
  alley_ghost: {
    id: 'alley_ghost',
    title: 'Bóng Ma Hẻm Tối',
    description: 'Kẻ ám sát vô ảnh vô tung, luôn ra tay từ góc khuất và kết liễu mục tiêu trước khi chúng kịp nhận ra.',
    type: 'combat',
    fearFactor: 70,
    renownScore: 80,
    shopDiscountPercent: 10,
    guardInspectionRisk: true,
    flavorQuote: 'Ngươi chỉ thấy hắn khi lưỡi dao độc đã kề sát cuống họng.',
  },

  // --- Nhánh Combat: Ma Pháp Pháo Kích Tầm Xa ---
  golden_gunner: {
    id: 'golden_gunner',
    title: 'Pháo Thủ Hoàng Kim',
    description: 'Niệm chú dồn dập, bắn ma pháp tầm xa hủy diệt liên thanh như một cỗ pháo đài ma thuật cơ động.',
    type: 'combat',
    fearFactor: 30,
    renownScore: 50,
    shopDiscountPercent: 10,
    flavorQuote: 'Đối thủ gục ngã trước khi kịp nhìn thấy diện mạo của kẻ thi triển.',
  },
  flame_lightning_starfall: {
    id: 'flame_lightning_starfall',
    title: 'Hỏa Lôi Diệt Tinh',
    description: 'Sức mạnh ma pháp bão táp hủy thiên diệt địa, một đòn thiêu rụi cả đạo quân và địa hình.',
    type: 'combat',
    fearFactor: 80,
    renownScore: 100,
    shopDiscountPercent: 20,
    attractChallengers: true,
    flavorQuote: 'Bầu trời rực sáng lôi hỏa, sự hủy diệt tuyệt đối từ cự ly hàng trăm trượng.',
  },

  // --- Nhánh Combat: Thủy Thần / Pure Defense ---
  cold_water_blade: {
    id: 'cold_water_blade',
    title: 'Lãnh Thủy Kiếm',
    description: 'Kiếm thế phẳng lặng như mặt nước hồ thu, hóa giải từng đường kiếm hung hiểm một cách ung dung.',
    type: 'combat',
    fearFactor: 20,
    renownScore: 40,
    shopDiscountPercent: 10,
    flavorQuote: 'Nước chảy đá mòn, đòn đánh dữ dội chỉ làm gãy kiếm của chính kẻ tấn công.',
  },
  immovable_fortress: {
    id: 'immovable_fortress',
    title: 'Tường Thành Bất Động',
    description: 'Bức tường thép kiên cố bảo vệ đồng đội, đối thủ không có bất kỳ cơ hội nào xuyên thủng thế thủ.',
    type: 'combat',
    fearFactor: 50,
    renownScore: 85,
    shopDiscountPercent: 15,
    flavorQuote: 'Dù phong ba bão táp hay cự long gầm thét, bước chân người ấy vẫn không hề suy chuyển.',
  },

  // --- Nhánh Đạo Đức: Heroic / Nhân Hậu ---
  saint_blade_buena: {
    id: 'saint_blade_buena',
    title: 'Thánh Kiếm Buena',
    description: 'Hiệp sĩ nhân ái của thôn dã, luôn bảo vệ dân lành và xóm làng trước móng vuốt ma thú.',
    type: 'karma',
    fearFactor: 15,
    renownScore: 50,
    shopDiscountPercent: 15,
    flavorQuote: 'Ánh sáng bảo hộ bình yên của những người nông phu hiền lành.',
  },
  forest_sage: {
    id: 'forest_sage',
    title: 'Hiền Giả Rừng Rậm',
    description: 'Hiền nhân thấu hiểu thiên nhiên và thảo mộc, sẵn sàng chữa trị miễn phí cho kẻ bần cùng.',
    type: 'karma',
    fearFactor: 10,
    renownScore: 70,
    shopDiscountPercent: 20,
    flavorQuote: 'Bàn tay cứu chữa ấm áp gieo rắc hy vọng giữa thế giới khắc nghiệt.',
  },
  righteous_champion: {
    id: 'righteous_champion',
    title: 'Đại Hiệp Khách Valoria',
    description: 'Vị anh hùng nghĩa hiệp danh chấn thiên hạ, được bá tánh khắp các vương quốc kính ngưỡng.',
    type: 'karma',
    fearFactor: 40,
    renownScore: 100,
    shopDiscountPercent: 25,
    flavorQuote: 'Công lý không nằm ở tước vị, mà ở mũi kiếm trừ gian diệt bạo.',
  },

  // --- Nhánh Đạo Đức: Ruthless / Tàn Bạo ---
  asura_executioner: {
    id: 'asura_executioner',
    title: 'Đao Phủ Vùng Asura',
    description: 'Kẻ xuống tay lạnh lùng không run rẩy, máu đối thủ vương trên áo giáp như một chiến lợi phẩm.',
    type: 'karma',
    fearFactor: 70,
    renownScore: 60,
    shopDiscountPercent: -15,
    guardInspectionRisk: true,
    flavorQuote: 'Lời van xin không có ý nghĩa trước mũi đao của kẻ hành quyết.',
  },
  newborn_demon: {
    id: 'newborn_demon',
    title: 'Ác Quỷ Sơ Sinh',
    description: 'Đứa trẻ mang tâm tính tàn khốc của ma vương cổ đại, khiến người lớn cũng phải rùng mình sợ hãi.',
    type: 'karma',
    fearFactor: 85,
    renownScore: 75,
    shopDiscountPercent: -25,
    guardInspectionRisk: true,
    flavorQuote: 'Ánh mắt trẻ thơ ẩn chứa sự lạnh lẽo của địa ngục sâu thẳm.',
  },
  wanted_bloodlord: {
    id: 'wanted_bloodlord',
    title: 'Huyết Ma Bị Truy Nã',
    description: 'Kẻ tội đồ đẫm máu bị các công hội và kỵ sĩ đoàn dán cáo thị truy nã với tiền thưởng kếch xù.',
    type: 'karma',
    fearFactor: 95,
    renownScore: 90,
    shopDiscountPercent: -40,
    attractChallengers: true,
    guardInspectionRisk: true,
    flavorQuote: 'Đầu của hắn đáng giá cả một rương vàng, nhưng chưa ai sống sót để nhận thưởng.',
  },

  // --- Nhánh Đơn Độc / Huyền Bí ---
  solitary_wanderer: {
    id: 'solitary_wanderer',
    title: 'Cô Độc Giả',
    description: 'Kẻ lữ hành đơn độc băng qua các đại lục, không kết bè phái và không bao giờ để lại danh tính.',
    type: 'karma',
    fearFactor: 20,
    renownScore: 40,
    shopDiscountPercent: 5,
    flavorQuote: 'Cô đơn là người bạn trung thành nhất trên con đường kiếm đạo.',
  },
  night_phantom: {
    id: 'night_phantom',
    title: 'Bóng Đêm Lang Thang',
    description: 'Xuất hiện như một bóng mờ trong truyền thuyết rồi tan biến, chỉ để lại những câu chuyện truyền miệng.',
    type: 'karma',
    fearFactor: 45,
    renownScore: 70,
    shopDiscountPercent: 10,
    flavorQuote: 'Người ta chỉ biết hắn vừa ở đây nhờ ngọn gió lạnh vừa thổi qua.',
  },
};

// =========================================================================
// 2. ENSURE & INITIALIZE CHARACTER REPUTATION
// =========================================================================

export function ensureCharacterReputation(character: Character): CharacterReputationState {
  if (character.reputation) {
    // Ensure all subfields are defined
    character.reputation.regional = character.reputation.regional || {
      adventurerGuild: 0,
      asuraNobility: 0,
      demonContinent: 0,
      millisChurch: 0,
    };
    character.reputation.combatTrack = character.reputation.combatTrack || {
      quagmireCount: 0,
      berserkerCount: 0,
      sneakTrickCount: 0,
      artilleryCount: 0,
      guardianCount: 0,
    };
    character.reputation.karmaTrack = character.reputation.karmaTrack || {
      heroicCount: 0,
      ruthlessCount: 0,
      reclusiveCount: 0,
    };
    character.reputation.epithetHistory = character.reputation.epithetHistory || [character.reputation.currentEpithet || 'Kẻ Vô Danh'];
    character.reputation.notableFeats = character.reputation.notableFeats || [];
    return character.reputation;
  }

  // Derive initial adventurer rank based on age & origin
  const isOldEnough = character.stats.age >= 7;
  const initialRank: AdventurerRank = isOldEnough ? 'F' : 'F';
  const initialStanding = character.stats.age < 7 
    ? 'Hài nhi Chuyển sinh (Chưa vào đời)' 
    : 'Thường dân tự do';

  const defaultEpithet = EPITHET_CATALOG.nameless_reincarnator;

  const newRep: CharacterReputationState = {
    currentEpithet: defaultEpithet.title,
    epithetTitle: defaultEpithet.title,
    epithetDescription: defaultEpithet.description,
    epithetType: defaultEpithet.type,
    fearFactor: defaultEpithet.fearFactor,
    shopDiscountPercent: defaultEpithet.shopDiscountPercent,
    attractChallengers: false,
    guardInspectionRisk: false,
    epithetHistory: [defaultEpithet.title],
    adventurerRank: initialRank,
    socialStanding: initialStanding,
    regional: {
      adventurerGuild: 5,
      asuraNobility: character.origin.toLowerCase().includes('asura') ? 10 : 0,
      demonContinent: character.race.toLowerCase().includes('ma') ? 15 : 0,
      millisChurch: 0,
    },
    combatTrack: {
      quagmireCount: 0,
      berserkerCount: 0,
      sneakTrickCount: 0,
      artilleryCount: 0,
      guardianCount: 0,
    },
    karmaTrack: {
      heroicCount: 0,
      ruthlessCount: 0,
      reclusiveCount: 0,
    },
    notableFeats: [],
  };

  character.reputation = newRep;
  return newRep;
}

// =========================================================================
// 3. ADVENTURER RANK & SOCIAL STANDING CALCULATOR
// =========================================================================

export function calculateAdventurerRank(character: Character): AdventurerRank {
  const rep = ensureCharacterReputation(character);
  const wins = character.progression?.combatWins || 0;
  const guildRep = rep.regional.adventurerGuild;
  const highestTier = character.progression?.overallRank || 'Sơ cấp (Beginner)';

  if (highestTier.includes('Thần') || highestTier.includes('Đế') || wins >= 45 || guildRep >= 90) {
    return 'S';
  }
  if (highestTier.includes('Vương') || highestTier.includes('Thánh') || wins >= 30 || guildRep >= 75) {
    return 'A';
  }
  if (highestTier.includes('Thượng') || wins >= 18 || guildRep >= 55) {
    return 'B';
  }
  if (highestTier.includes('Trung') || wins >= 10 || guildRep >= 35) {
    return 'C';
  }
  if (wins >= 5 || guildRep >= 20) {
    return 'D';
  }
  if (wins >= 2 || guildRep >= 10) {
    return 'E';
  }
  return 'F';
}

export function calculateSocialStanding(character: Character): string {
  const rep = ensureCharacterReputation(character);
  const noble = rep.regional.asuraNobility;
  const guild = rep.regional.adventurerGuild;
  const church = rep.regional.millisChurch;
  const rank = rep.adventurerRank;
  const ruthless = rep.karmaTrack.ruthlessCount;

  if (ruthless >= 5 || noble <= -30 || church <= -40) {
    return 'Tội phạm truy nã đặc biệt (Mức độ Nguy hiểm Cao)';
  }
  if (ruthless >= 3 || noble <= -15) {
    return 'Kẻ nguy hiểm bị giới chức giám sát gắt gao';
  }
  if (noble >= 60) {
    return 'Đại Quý tộc Thượng lưu Vương quốc Asura';
  }
  if (noble >= 30) {
    return 'Quý tộc hạ cấp / Hiệp sĩ danh dự';
  }
  if (rank === 'S') {
    return 'Huyền Thoại Phiêu Lưu Giả (Hạng S - Liệt Cường)';
  }
  if (rank === 'A') {
    return 'Đại Hiệp Khách Phiêu Lưu Giả (Hạng A)';
  }
  if (character.stats.age < 7) {
    return 'Hài nhi Chuyển sinh (Đang được gia đình bảo bọc)';
  }
  if (guild >= 10 || character.stats.age >= 7) {
    return `Phiêu lưu giả chính thức (Hạng ${rank})`;
  }
  return 'Thường dân tự do';
}

// =========================================================================
// 4. DYNAMIC EPITHET ENGINE (THE CORE RESOLUTION)
// =========================================================================

export interface EpithetResolutionResult {
  updatedReputation: CharacterReputationState;
  epithetChanged: boolean;
  oldEpithet: string;
  newEpithet: string;
  announcement?: string;
  fearMoraleDebuff?: {
    debuffApplied: boolean;
    toukiReduction: number; // Điểm Đấu khí bị giảm
    enemyFled: boolean;     // Kẻ địch bỏ chạy ngay Giai đoạn 1
    narrative: string;
  };
  challengerEncounter?: {
    hasChallenger: boolean;
    challengerName: string;
    narrative: string;
  };
}

export function evaluateTurnReputationAndEpithet(
  character: Character,
  actionText: string = '',
  choice?: TurnChoice,
  isCombat: boolean = false,
  opponent?: Opponent,
  isOpponentDefeated: boolean = false
): EpithetResolutionResult {
  const rep = ensureCharacterReputation(character);
  const oldEpithet = rep.currentEpithet;
  const text = (actionText || '').toLowerCase();
  const choiceCat = choice?.category || '';
  const choiceTactic = choice?.combatTactic || '';
  const location = character.stats.location.toLowerCase();

  // -------------------------------------------------------------
  // A. TRACK COMBAT ARCHETYPE BEHAVIORS
  // -------------------------------------------------------------
  if (
    text.includes('bùn lầy') || text.includes('quagmire') || text.includes('sa lầy') || 
    text.includes('đầm lầy') || text.includes('địa đạn') || text.includes('làm chậm') || 
    text.includes('chôn vùi') || text.includes('khống chế chân')
  ) {
    rep.combatTrack.quagmireCount += 1;
  }

  if (
    text.includes('cuồng nộ') || text.includes('xả kiếm') || text.includes('chém điên cuồng') || 
    text.includes('không lùi bước') || text.includes('huyết sát') || text.includes('chém đứt đôi') ||
    text.includes('truy cùng giết tận') || choiceTactic === 'rush'
  ) {
    rep.combatTrack.berserkerCount += 1;
  }

  if (
    text.includes('ám khí') || text.includes('bẫy') || text.includes('độc') || 
    text.includes('bắc thần') || text.includes('mẹo bẩn') || text.includes('hất cát') || 
    text.includes('lừa đòn') || text.includes('cắn lén') || text.includes('đánh lén')
  ) {
    rep.combatTrack.sneakTrickCount += 1;
  }

  if (
    text.includes('hỏa pháo') || text.includes('pháo kích') || text.includes('cumulonimbus') || 
    text.includes('hủy diệt') || text.includes('bão sấm') || text.includes('hỏa lôi') || 
    text.includes('diệt tinh') || text.includes('bắn phá tầm xa') || choiceTactic === 'kite_magic'
  ) {
    rep.combatTrack.artilleryCount += 1;
  }

  if (
    text.includes('lưu đức') || text.includes('thủy thần') || text.includes('phòng thủ') || 
    text.includes('hóa giải') || text.includes('chắn đòn') || text.includes('bảo vệ đồng đội') || 
    text.includes('tường thành') || choiceTactic === 'counter'
  ) {
    rep.combatTrack.guardianCount += 1;
  }

  // -------------------------------------------------------------
  // B. TRACK KARMA & MORAL CHOICES
  // -------------------------------------------------------------
  if (
    text.includes('cứu') || text.includes('giúp') || text.includes('bảo vệ dân') || 
    text.includes('trợ giúp') || text.includes('hào hiệp') || text.includes('chữa trị miễn phí') ||
    text.includes('thả tha mạng') || text.includes('từ thiện')
  ) {
    rep.karmaTrack.heroicCount += 1;
    rep.regional.adventurerGuild = Math.min(100, rep.regional.adventurerGuild + 4);
    rep.regional.asuraNobility = Math.min(100, rep.regional.asuraNobility + 3);
    rep.regional.millisChurch = Math.min(100, rep.regional.millisChurch + 3);
  }

  if (
    text.includes('đồ sát') || text.includes('cướp') || text.includes('giết sạch') || 
    text.includes('hành quyết') || text.includes('tra tấn') || text.includes('phản bội') || 
    text.includes('lột đồ') || text.includes('không chừa một ai')
  ) {
    rep.karmaTrack.ruthlessCount += 1;
    rep.regional.adventurerGuild = Math.max(-100, rep.regional.adventurerGuild - 6);
    rep.regional.asuraNobility = Math.max(-100, rep.regional.asuraNobility - 8);
    rep.regional.millisChurch = Math.max(-100, rep.regional.millisChurch - 10);
    // Ma tộc tôn sùng kẻ mạnh và sự tàn bạo thực tế
    rep.regional.demonContinent = Math.min(100, rep.regional.demonContinent + 5);
  }

  if (
    text.includes('ẩn mình') || text.includes('biến mất') || text.includes('lẻn đi') || 
    text.includes('đơn độc') || text.includes('không để lại danh tính') || text.includes('giấu mặt')
  ) {
    rep.karmaTrack.reclusiveCount += 1;
  }

  // Combat victory rewards regional fame
  if (isOpponentDefeated && opponent) {
    const oppRank = opponent.powerTier || 'Sơ cấp (Beginner)';
    const bonus = oppRank.includes('Thánh') ? 15 : (oppRank.includes('Thượng') ? 8 : 3);
    rep.regional.adventurerGuild = Math.min(100, rep.regional.adventurerGuild + bonus);
    if (location.includes('ma') || location.includes('demon') || location.includes('rikarisu')) {
      rep.regional.demonContinent = Math.min(100, rep.regional.demonContinent + bonus + 2);
    } else if (location.includes('asura') || location.includes('roa') || location.includes('buena')) {
      rep.regional.asuraNobility = Math.min(100, rep.regional.asuraNobility + Math.round(bonus * 0.7));
    } else if (location.includes('millis') || location.includes('milishion')) {
      rep.regional.millisChurch = Math.min(100, rep.regional.millisChurch + bonus);
    }
  }

  // -------------------------------------------------------------
  // C. DYNAMIC EPITHET EVALUATION (TIÊU CHÍ XẾP ĐẶT BIỆT DANH)
  // -------------------------------------------------------------
  let candidateEpithet: EpithetDefinition = EPITHET_CATALOG.nameless_reincarnator;

  const { quagmireCount, berserkerCount, sneakTrickCount, artilleryCount, guardianCount } = rep.combatTrack;
  const { heroicCount, ruthlessCount, reclusiveCount } = rep.karmaTrack;

  // 1. Karma Dominance
  if (ruthlessCount >= 6) {
    candidateEpithet = EPITHET_CATALOG.wanted_bloodlord;
  } else if (ruthlessCount >= 4) {
    candidateEpithet = EPITHET_CATALOG.newborn_demon;
  } else if (ruthlessCount >= 2) {
    candidateEpithet = EPITHET_CATALOG.asura_executioner;
  } else if (heroicCount >= 6) {
    candidateEpithet = EPITHET_CATALOG.righteous_champion;
  } else if (heroicCount >= 4) {
    candidateEpithet = EPITHET_CATALOG.forest_sage;
  } else if (heroicCount >= 2) {
    candidateEpithet = EPITHET_CATALOG.saint_blade_buena;
  } else if (reclusiveCount >= 5) {
    candidateEpithet = EPITHET_CATALOG.night_phantom;
  } else if (reclusiveCount >= 2) {
    candidateEpithet = EPITHET_CATALOG.solitary_wanderer;
  } 
  // 2. Combat Archetype Dominance
  else if (quagmireCount >= 6) {
    candidateEpithet = EPITHET_CATALOG.quagmire_apex;
  } else if (quagmireCount >= 4) {
    candidateEpithet = EPITHET_CATALOG.quagmire_master;
  } else if (quagmireCount >= 2) {
    candidateEpithet = EPITHET_CATALOG.quagmire_novice;
  } else if (berserkerCount >= 6) {
    candidateEpithet = EPITHET_CATALOG.sword_demon;
  } else if (berserkerCount >= 4) {
    candidateEpithet = EPITHET_CATALOG.blood_wolf;
  } else if (berserkerCount >= 2) {
    candidateEpithet = EPITHET_CATALOG.berserker_blade;
  } else if (sneakTrickCount >= 6) {
    candidateEpithet = EPITHET_CATALOG.alley_ghost;
  } else if (sneakTrickCount >= 4) {
    candidateEpithet = EPITHET_CATALOG.poison_monkey;
  } else if (sneakTrickCount >= 2) {
    candidateEpithet = EPITHET_CATALOG.errant_blade;
  } else if (artilleryCount >= 5) {
    candidateEpithet = EPITHET_CATALOG.flame_lightning_starfall;
  } else if (artilleryCount >= 2) {
    candidateEpithet = EPITHET_CATALOG.golden_gunner;
  } else if (guardianCount >= 5) {
    candidateEpithet = EPITHET_CATALOG.immovable_fortress;
  } else if (guardianCount >= 2) {
    candidateEpithet = EPITHET_CATALOG.cold_water_blade;
  }

  // Update Epithet in state
  let epithetChanged = false;
  let announcement: string | undefined = undefined;

  if (candidateEpithet.title !== rep.currentEpithet && candidateEpithet.id !== 'nameless_reincarnator') {
    epithetChanged = true;
    rep.currentEpithet = candidateEpithet.title;
    rep.epithetTitle = candidateEpithet.title;
    rep.epithetDescription = candidateEpithet.description;
    rep.epithetType = candidateEpithet.type;
    rep.fearFactor = candidateEpithet.fearFactor;
    rep.shopDiscountPercent = candidateEpithet.shopDiscountPercent;
    rep.attractChallengers = !!candidateEpithet.attractChallengers;
    rep.guardInspectionRisk = !!candidateEpithet.guardInspectionRisk;

    if (!rep.epithetHistory.includes(candidateEpithet.title)) {
      rep.epithetHistory.push(candidateEpithet.title);
    }

    const featNote = `Thời điểm ${character.stats.age} tuổi: Chính thức được thế nhân truyền tụng biệt danh [${candidateEpithet.title}] (${candidateEpithet.description})`;
    rep.notableFeats.push(featNote);

    character.title = candidateEpithet.title;

    announcement = `🏆 [DANH XƯNG & BIỆT DANH MỚI]: Bạn chính thức được giang hồ xưng tụng danh hiệu [${candidateEpithet.title}]!\n• Đặc điểm: ${candidateEpithet.description}\n• Khí thế uy hiếp: ${candidateEpithet.fearFactor}/100 | Ưu đãi giao thương: ${candidateEpithet.shopDiscountPercent > 0 ? `+${candidateEpithet.shopDiscountPercent}% Giảm giá` : `${candidateEpithet.shopDiscountPercent}% Bị kỳ thị`}`;
  }

  // Refresh rank & social standing
  rep.adventurerRank = calculateAdventurerRank(character);
  rep.socialStanding = calculateSocialStanding(character);

  // -------------------------------------------------------------
  // D. TÁC ĐỘNG THỰC CHIẾN (FEAR MORALE DEBUFF & CHALLEGERS)
  // -------------------------------------------------------------
  let fearMoraleDebuff: EpithetResolutionResult['fearMoraleDebuff'] = undefined;
  if (isCombat && opponent && rep.fearFactor >= 35) {
    const oppRankStr = opponent.powerTier || '';
    const isWeakOpponent = 
      oppRankStr.includes('Sơ cấp') || 
      oppRankStr.includes('Trung cấp') || 
      opponent.personality === 'coward';

    if (isWeakOpponent) {
      const reductionPercent = rep.fearFactor >= 75 ? 30 : 20;
      const reduction = Math.max(3, Math.round(opponent.touki * (reductionPercent / 100)));
      opponent.touki = Math.max(0, opponent.touki - reduction);

      const willFleeInP1 = rep.fearFactor >= 70 && opponent.hpCurrent <= opponent.hpMax * 0.7;

      fearMoraleDebuff = {
        debuffApplied: true,
        toukiReduction: reduction,
        enemyFled: willFleeInP1,
        narrative: `⚠️ [UY ÁP BIỆT DANH "${rep.currentEpithet}"]: Đối thủ ${opponent.name} nhận ra danh xưng của bạn! Tinh thần chiến đấu hoảng loạn, Đấu Khí sụt giảm -${reduction} (${reductionPercent}% suy sụp tinh thần)${willFleeInP1 ? '! Kẻ địch đã bắt đầu run rẩy chuẩn bị bỏ chạy!' : '.'}`,
      };
    }
  }

  // Challenger encounter when exploring with high fame or provocative epithet
  let challengerEncounter: EpithetResolutionResult['challengerEncounter'] = undefined;
  if (!isCombat && rep.attractChallengers && Math.random() < 0.12 && character.stats.age >= 10) {
    challengerEncounter = {
      hasChallenger: true,
      challengerName: 'Kiếm sĩ Háo Danh Lang Thang',
      narrative: `⚔️ [KẺ KHIÊU CHIẾN TÌM ĐẾN]: Tiếng tăm của danh xưng [${rep.currentEpithet}] lan truyền quá nhanh! Một kiếm sĩ háo danh muốn lấy đầu bạn để lập danh vọng đã chặn đường thách đấu!`,
    };
  }

  return {
    updatedReputation: rep,
    epithetChanged,
    oldEpithet,
    newEpithet: rep.currentEpithet,
    announcement,
    fearMoraleDebuff,
    challengerEncounter,
  };
}

// =========================================================================
// 5. SHOPPING & COMMERCE REPUTATION LOGIC
// =========================================================================

export function calculateShopDiscount(
  character: Character, 
  location: string = ''
): { discountPercent: number; isRefused: boolean; surchargePercent: number; reason?: string } {
  const rep = ensureCharacterReputation(character);
  const locLower = location.toLowerCase();

  // If player is a wanted criminal in civilized cities
  const isCivilized = locLower.includes('asura') || locLower.includes('roa') || locLower.includes('millis') || locLower.includes('buena');
  if (isCivilized && (rep.karmaTrack.ruthlessCount >= 5 || rep.regional.asuraNobility <= -35)) {
    return {
      discountPercent: 0,
      isRefused: true,
      surchargePercent: 0,
      reason: `🚫 [TỪ CHỐI PHỤC VỤ - TRUY NÃ]: Danh tiếng [${rep.currentEpithet}] của bạn quá tàn bạo! Chủ quán nhận ra khuôn mặt bạn liền thét lên đóng sập cửa và gọi lính gác tuần tra!`,
    };
  }

  // Guild or Noble discount
  let discount = rep.shopDiscountPercent || 0;
  if (rep.regional.adventurerGuild >= 50) discount += 5;
  if (rep.regional.asuraNobility >= 50 && isCivilized) discount += 10;
  if (rep.adventurerRank === 'S') discount += 10;
  if (rep.adventurerRank === 'A') discount += 5;

  discount = Math.min(30, Math.max(-40, discount));

  if (discount < 0) {
    return {
      discountPercent: 0,
      isRefused: false,
      surchargePercent: Math.abs(discount),
      reason: `⚠️ [PHỤ THU DANH TIẾNG]: Người bán có thái độ thù ghét danh xưng của bạn, tăng giá thêm +${Math.abs(discount)}% phí nguy hiểm!`,
    };
  }

  return {
    discountPercent: discount,
    isRefused: false,
    surchargePercent: 0,
    reason: discount > 0 ? `✨ [ƯU ĐÃI DANH TIẾNG]: Nhờ uy danh [${rep.currentEpithet}] và Hạng ${rep.adventurerRank}, thương nhân giảm giá ${discount}% cho bạn!` : undefined,
  };
}

// =========================================================================
// 6. FORMAT REPUTATION STATUS SECTION FOR HUD / LOGS
// =========================================================================

export function formatReputationSummary(character: Character): string {
  const rep = ensureCharacterReputation(character);
  const sign = (val: number) => (val > 0 ? `+${val}` : `${val}`);

  return `---
[ DANH TIẾNG & DANH XƯNG ]
- Biệt danh hiện tại: "${rep.currentEpithet}" (${rep.epithetDescription || 'Chưa định hình'})
- Xếp hạng Công hội: [Hạng ${rep.adventurerRank}]
- Vị thế xã hội: [${rep.socialStanding}]
- Điểm danh tiếng theo vùng (-100 đến +100):
  * Công hội Phiêu lưu giả: ${sign(rep.regional.adventurerGuild)} / 100
  * Giới Quý tộc Asura: ${sign(rep.regional.asuraNobility)} / 100
  * Đại lục Ma giới: ${sign(rep.regional.demonContinent)} / 100
  * Giáo hội Millis: ${sign(rep.regional.millisChurch)} / 100
---`;
}

