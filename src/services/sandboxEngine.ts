import type { 
  Character, 
  TurnChoice, 
  PowerTier, 
  SandboxProgression, 
  SandboxCompanion, 
  SandboxFaction,
  SandboxCategory,
  InventoryItem 
} from '../types/game.ts';
import { TIER_RANK_MAP } from './mushokuRules.ts';
import { syncCharacterTalentStats } from './mushokuTalents.ts';

export interface SandboxRegion {
  id: string;
  name: string;
  category: 'metropolis' | 'wilderness' | 'frontier' | 'labyrinth' | 'holy' | 'coastal';
  description: string;
  dangerTier: 'An Toàn' | 'Nguy Hiểm Nhẹ' | 'Nguy Biến' | 'Tử Địa Cực Độ';
  features: string[];
  travelTargets: { id: string; name: string; costCoins: number; turns: number }[];
}

export const SANDBOX_REGIONS: Record<string, SandboxRegion> = {
  'valoria_city': {
    id: 'valoria_city',
    name: 'Đô Thành Hoàng Gia Valoria (Trung Tâm Đại Lục)',
    category: 'metropolis',
    description: 'Trái tim phồn hoa của đại lục, nơi tập trung các hoàng tộc, đại thương hội liên lục địa, Tổng bộ Hiệp hội Mạo hiểm giả và Học viện Ma pháp Tối cao.',
    dangerTier: 'An Toàn',
    features: ['Tổng bộ Mạo Hiểm Giả', 'Đại Thương Hội Hoán Đổi', 'Học Viện Ma Pháp', 'Đấu Trường La Mã'],
    travelTargets: [
      { id: 'verdant_valley', name: 'Thị Trấn Thung Lũng Xanh', costCoins: 10, turns: 1 },
      { id: 'shadowwood_forest', name: 'Đại Sâm Lâm Dạ Thú', costCoins: 25, turns: 1 },
      { id: 'seagull_port', name: 'Thương Cảng Hải Yến', costCoins: 30, turns: 1 },
    ],
  },
  'verdant_valley': {
    id: 'verdant_valley',
    name: 'Thị Trấn Thung Lũng Xanh (Biên Thùy Trù Phú)',
    category: 'frontier',
    description: 'Vùng bình nguyên xanh mướt với những cánh đồng lúa mì bạt ngàn, cối xay gió và những nông trang trù phú. Nơi lý tưởng để xây dựng trang viên và khởi đầu hành trình.',
    dangerTier: 'An Toàn',
    features: ['Khu Đất Xây Dựng Trang Viên', 'Võ Quán Kiếm Thuật Địa Phương', 'Chợ Phiên Nông Sản & Dược Thảo'],
    travelTargets: [
      { id: 'valoria_city', name: 'Đô Thành Hoàng Gia Valoria', costCoins: 10, turns: 1 },
      { id: 'shadowwood_forest', name: 'Đại Sâm Lâm Dạ Thú', costCoins: 15, turns: 1 },
      { id: 'crystal_labyrinth', name: 'Mê Cung Pha Lê Cổ Đại', costCoins: 35, turns: 1 },
    ],
  },
  'shadowwood_forest': {
    id: 'shadowwood_forest',
    name: 'Đại Sâm Lâm Dạ Thú (Lãnh Địa Thú Tộc & Tinh Linh)',
    category: 'wilderness',
    description: 'Rừng rậm nguyên sinh trải dài ngút ngàn, cây cổ thụ chọc trời. Nơi cư ngụ của các bộ tộc Thú nhân thiện chiến, tinh linh Elf ẩn dật và bầy ma thú hoang dã nguy hiểm.',
    dangerTier: 'Nguy Hiểm Nhẹ',
    features: ['Khu Săn Ma Thú Rừng Thiêng', 'Làng Tinh Linh Cổ Ngữ', 'Mỏ Thảo Dược Nghìn Năm'],
    travelTargets: [
      { id: 'verdant_valley', name: 'Thị Trấn Thung Lũng Xanh', costCoins: 15, turns: 1 },
      { id: 'valoria_city', name: 'Đô Thành Hoàng Gia Valoria', costCoins: 25, turns: 1 },
      { id: 'infernal_crag', name: 'Thung Lũng Hỏa Ngục & Lò Rèn', costCoins: 40, turns: 1 },
    ],
  },
  'crystal_labyrinth': {
    id: 'crystal_labyrinth',
    name: 'Mê Cung Pha Lê Cổ Đại (Hầm Ngục Vô Tận 50 Tầng)',
    category: 'labyrinth',
    description: 'Quần thể hầm ngục dưới lòng đất phát sáng lân tinh kỳ ảo do nền văn minh viễn cổ để lại. Nơi chôn giấu vô số rương kho báu, ma thạch thượng phẩm và quái vật hung tợn.',
    dangerTier: 'Nguy Biến',
    features: ['50 Tầng Thử Thách Hầm Ngục', 'Rương Báu Thần Khí Cổ', 'Phòng Thí Nghiệm Ma Tinh Thể'],
    travelTargets: [
      { id: 'verdant_valley', name: 'Thị Trấn Thung Lũng Xanh', costCoins: 35, turns: 1 },
      { id: 'dustland_desert', name: 'Sa Mạc Cổ Vương Bụi Cát', costCoins: 45, turns: 1 },
    ],
  },
  'dustland_desert': {
    id: 'dustland_desert',
    name: 'Sa Mạc Cổ Vương Bụi Cát (Tàn Tích Vương Triều Quên Lãng)',
    category: 'wilderness',
    description: 'Biển cát mênh mông rực nắng và hẻm núi đá đỏ cằn cỗi. Ẩn giấu dưới lớp cát là những kim tự tháp, chợ đen buôn lậu cổ vật và các loài bọ cạp ma tinh khổng lồ.',
    dangerTier: 'Nguy Biến',
    features: ['Khu Khảo Cổ Kim Tự Tháp', 'Thị Trường Chợ Đen Tội Phạm', 'Ốc Đảo Thương Nhân Sa Mạc'],
    travelTargets: [
      { id: 'crystal_labyrinth', name: 'Mê Cung Pha Lê Cổ Đại', costCoins: 45, turns: 1 },
      { id: 'infernal_crag', name: 'Thung Lũng Hỏa Ngục & Lò Rèn', costCoins: 30, turns: 1 },
      { id: 'valoria_city', name: 'Đô Thành Hoàng Gia Valoria', costCoins: 50, turns: 1 },
    ],
  },
  'infernal_crag': {
    id: 'infernal_crag',
    name: 'Thung Lũng Hỏa Ngục & Lò Rèn Thần (Thánh Địa Rèn Đúc)',
    category: 'frontier',
    description: 'Vùng đồi núi lửa sục sôi nhiệt lượng và các mỏ khoáng thạch huyền thiết quý giá. Nơi các đại sư rèn Dwarf và thợ chế tác Ma Đạo Khải rèn nên những vũ khí thần binh.',
    dangerTier: 'Nguy Hiểm Nhẹ',
    features: ['Lò Rèn Dung Nham Đại Sư Dwarf', 'Mỏ Khoáng Thạch Huyền Thiết', 'Xưởng Chế Tạo Ma Đạo Khải'],
    travelTargets: [
      { id: 'shadowwood_forest', name: 'Đại Sâm Lâm Dạ Thú', costCoins: 40, turns: 1 },
      { id: 'dustland_desert', name: 'Sa Mạc Cổ Vương Bụi Cát', costCoins: 30, turns: 1 },
      { id: 'valoria_city', name: 'Đô Thành Hoàng Gia Valoria', costCoins: 40, turns: 1 },
    ],
  },
  'seagull_port': {
    id: 'seagull_port',
    name: 'Thương Cảng Hải Yến (Thành Phố Tự Do Ven Biển)',
    category: 'coastal',
    description: 'Cảng biển tự do sầm uất với hàng ngàn cánh buồm căng gió. Điểm hội tụ của các thương thuyền viễn xứ, hải tặc hoán cải, và các món đặc sản kỳ trân dị bảo từ hải ngoại.',
    dangerTier: 'An Toàn',
    features: ['Hội Đấu Giá Kỳ Trân Dị Bảo', 'Tửu Quán Thủy Thủ Đồn Đại', 'Bến Cảng Thuyền Buôn Viễn Dương'],
    travelTargets: [
      { id: 'valoria_city', name: 'Đô Thành Hoàng Gia Valoria', costCoins: 30, turns: 1 },
      { id: 'eternal_frost', name: 'Bắc Lục Băng Nguyên Vĩnh Cửu', costCoins: 60, turns: 1 },
    ],
  },
  'eternal_frost': {
    id: 'eternal_frost',
    name: 'Bắc Lục Băng Nguyên Vĩnh Cửu (Tử Địa Băng Giá)',
    category: 'wilderness',
    description: 'Vùng đất cực bắc phủ tuyết trắng quanh năm, bão tuyết gầm thét không dứt. Nơi các cao thủ ẩn thế tu luyện tâm kiếm tuyệt đỉnh và thử thách giới hạn sinh tử con người.',
    dangerTier: 'Tử Địa Cực Độ',
    features: ['Đỉnh Băng Sơn Ngộ Kiếm Đạo', 'Hang Băng Ma Long Giấc Ngủ', 'Đền Thờ Băng Thần Viễn Cổ'],
    travelTargets: [
      { id: 'seagull_port', name: 'Thương Cảng Hải Yến', costCoins: 60, turns: 1 },
      { id: 'valoria_city', name: 'Đô Thành Hoàng Gia Valoria', costCoins: 70, turns: 1 },
    ],
  },
};

export const INITIAL_FACTIONS: SandboxFaction[] = [
  {
    id: 'adventurer_guild',
    name: 'Hiệp Hội Mạo Hiểm Giả Toàn Cầu',
    description: 'Liên minh độc lập bảo vệ các thành thị, cung cấp ủy thác săn bắn, thám hiểm và phân cấp thứ hạng mạo hiểm giả.',
    reputation: 20,
    tier: 'continental',
  },
  {
    id: 'valoria_monarchy',
    name: 'Vương Triều Hoàng Gia Valoria',
    description: 'Chính quyền phong kiến thống trị vùng trung tâm đại lục, sở hữu quân đội thiết kỵ và kho báu khổng lồ.',
    reputation: 15,
    tier: 'continental',
  },
  {
    id: 'magic_academy',
    name: 'Học Viện Ma Pháp Tháp Tri Thức',
    description: 'Cái nôi nghiên cứu ma pháp, trận pháp và ma đạo cụ của các đại pháp sư kiệt xuất.',
    reputation: 10,
    tier: 'regional',
  },
  {
    id: 'merchant_consortium',
    name: 'Liên Minh Thương Hội Đại Lục',
    description: 'Tổ chức tài chính kiểm soát toàn bộ dòng tiền, các đoàn xe buôn và các phiên đấu giá bảo vật.',
    reputation: 10,
    tier: 'continental',
  },
  {
    id: 'shadow_syndicate',
    name: 'Hội Sát Thủ & Hắc Thị Bóng Đêm',
    description: 'Mạng lưới ngầm hoạt động trong bóng tối, buôn bán tin tức mật, độc dược và đồ cổ cấm kỵ.',
    reputation: 0,
    tier: 'regional',
  },
];

export function ensureSandboxProgression(character: Character): SandboxProgression {
  if (character.sandbox) {
    if (!character.sandbox.factions || character.sandbox.factions.length === 0) {
      character.sandbox.factions = [...INITIAL_FACTIONS];
    }
    if (!character.sandbox.companions) {
      character.sandbox.companions = [];
    }
    if (!character.sandbox.unlockedRegions) {
      character.sandbox.unlockedRegions = ['valoria_city', 'verdant_valley', 'shadowwood_forest'];
    }
    return character.sandbox;
  }

  const initialSandbox: SandboxProgression = {
    adventurerRank: 'F',
    reputationTitle: 'Vô Danh Lữ Khách',
    renownScore: 50,
    strongholdName: undefined,
    strongholdLevel: 0,
    dungeonDeepestFloor: 1,
    arenaVictories: 0,
    tradeEmpireValue: character.stats.asuraCoins || 50,
    factions: [...INITIAL_FACTIONS],
    companions: [],
    unlockedRegions: ['valoria_city', 'verdant_valley', 'shadowwood_forest'],
  };

  character.sandbox = initialSandbox;
  return initialSandbox;
}

export function getCurrentRegionKey(location: string): string {
  const locLower = (location || '').toLowerCase();
  if (locLower.includes('thung lũng xanh') || locLower.includes('verdant') || locLower.includes('buena') || locLower.includes('làng')) {
    return 'verdant_valley';
  }
  if (locLower.includes('rừng') || locLower.includes('shadowwood') || locLower.includes('thú tộc') || locLower.includes('sâm lâm') || locLower.includes('doldia')) {
    return 'shadowwood_forest';
  }
  if (locLower.includes('sa mạc') || locLower.includes('dustland') || locLower.includes('đá đỏ') || locLower.includes('hẻm núi') || locLower.includes('rikarisu')) {
    return 'dustland_desert';
  }
  if (locLower.includes('mê cung') || locLower.includes('crystal') || locLower.includes('labyrinth') || locLower.includes('pha lê')) {
    return 'crystal_labyrinth';
  }
  if (locLower.includes('lò rèn') || locLower.includes('hỏa ngục') || locLower.includes('infernal') || locLower.includes('núi lửa')) {
    return 'infernal_crag';
  }
  if (locLower.includes('hải yến') || locLower.includes('cảng') || locLower.includes('seagull') || locLower.includes('biển')) {
    return 'seagull_port';
  }
  if (locLower.includes('băng nguyên') || locLower.includes('eternal frost') || locLower.includes('băng giá') || locLower.includes('núi tuyết')) {
    return 'eternal_frost';
  }
  return 'valoria_city';
}

export function generateSandboxChoices(character: Character, turnNumber: number): TurnChoice[] {
  const sandbox = ensureSandboxProgression(character);
  const regionKey = getCurrentRegionKey(character.stats.location);
  const region = SANDBOX_REGIONS[regionKey] || SANDBOX_REGIONS['valoria_city'];
  const choices: TurnChoice[] = [];

  const charName = character.name || 'Người Chơi';
  const age = character.stats.age;
  const rank = sandbox.adventurerRank;
  const dungeonFloor = sandbox.dungeonDeepestFloor;
  const companionCount = sandbox.companions.length;

  // =========================================================================
  // 1. NHÓM 1: THÁM HIỂM & NHIỆM VỤ THẾ GIỚI (EXPLORATION & QUESTS)
  // =========================================================================
  choices.push({
    id: `sb_quest_bounty_${regionKey}_${turnNumber}`,
    label: `Nhận Ủy Thác Bang Hội: Tiễu Trừ Ma Quái Phụ Cận`,
    actionText: `Đến bảng thông báo Hiệp hội Mạo hiểm giả tại ${region.name}, nhận nhiệm vụ tiễu trừ đàn ma thú đang đe dọa cư dân để nhận thù lao và điểm danh vọng.`,
    riskLevel: 'moderate',
    category: 'explore',
    sandboxCategory: 'explore',
    costStamina: 10,
    costMp: 5,
    consequenceHint: `Hoàn thành tăng Danh Vọng Bang Hội, thăng tiến thứ hạng Mạo Hiểm Giả và nhận Thưởng Kim lớn.`,
  });

  choices.push({
    id: `sb_explore_ruins_${regionKey}_${turnNumber}`,
    label: `Thám Hiểm Bí Cảnh & Tàn Tích Khu Vực`,
    actionText: `Dò xét các khu vực chưa ai đặt chân tới tại ${region.name}, tìm kiếm các hang động ẩn giấu, bia đá ma thuật cổ xưa hoặc dược thảo quý hiếm.`,
    riskLevel: 'moderate',
    category: 'explore',
    sandboxCategory: 'explore',
    costStamina: 15,
    consequenceHint: `Cơ hội phát hiện di tích cổ, mở khóa bí mật thế giới hoặc thu hoạch thảo dược quý.`,
  });

  // Fast Travel to connected regions
  if (region.travelTargets && region.travelTargets.length > 0) {
    const target = region.travelTargets[(turnNumber) % region.travelTargets.length];
    choices.push({
      id: `sb_travel_${target.id}_${turnNumber}`,
      label: `Lên Đường Du Hành: Tiến Về ${target.name}`,
      actionText: `Thu xếp hành lý, thuê xe ngựa của đoàn thương nhân và lên đường du hành đến ${target.name} để mở rộng tầm mắt và khám phá vùng đất mới.`,
      riskLevel: 'safe',
      category: 'explore',
      sandboxCategory: 'explore',
      costStamina: 5,
      consequenceHint: `Chuyển dịch địa bàn hoạt động sang ${target.name}, mở khóa hệ sinh thái và cơ hội mới.`,
    });
  }

  // Gathering rumors at tavern
  choices.push({
    id: `sb_tavern_intel_${regionKey}_${turnNumber}`,
    label: `Ghé Tửu Quán Địa Phương: Thu Thập Tin Tức Tình Báo`,
    actionText: `Gọi một ly rượu mật ong tại quán trọ đông đúc, lắng nghe những tin đồn của các lữ khách và thương nhân về bảo vật, thế lực và những biến cố lớn trong vùng.`,
    riskLevel: 'safe',
    category: 'explore',
    sandboxCategory: 'explore',
    costStamina: 2,
    consequenceHint: `Thu thập tin tình báo quan trọng, phát hiện manh mối boss hiếm hoặc cơ hội đầu cơ.`,
  });

  // =========================================================================
  // 2. NHÓM 2: CHIẾN ĐẤU & HẦM NGỤC (COMBAT & DUNGEONS)
  // =========================================================================
  choices.push({
    id: `sb_dungeon_descent_${dungeonFloor}_${turnNumber}`,
    label: `Đột Phá Tầng Sâu Hầm Ngục: Tầng ${dungeonFloor}`,
    actionText: `Chuẩn bị trang bị và vũ khí, tiến vào cổng Mê Cung Pha Lê Cổ Đại, chinh phục tầng thứ ${dungeonFloor} với bầy quái vật canh gác để đoạt rương báu quý hiếm.`,
    riskLevel: dungeonFloor > 10 ? 'dangerous' : 'moderate',
    category: 'combat',
    sandboxCategory: 'combat',
    costMp: 15,
    costStamina: 20,
    costTouki: 10,
    consequenceHint: `Vượt tầng thành công ghi danh kỷ lục sâu hơn, nhận Ma Thạch Thượng Phẩm và trang bị di tích.`,
  });

  choices.push({
    id: `sb_arena_duel_${regionKey}_${turnNumber}`,
    label: `Lên Lôi Đài Tỷ Thí: Thách Đấu Cao Thủ Địa Phương`,
    actionText: `Bước lên sàn đấu trường công khai, khiêu chiến các kiếm sĩ và pháp sư danh tiếng để tôi luyện thực chiến, khẳng định danh xưng và kiếm tiền thưởng cược.`,
    riskLevel: 'moderate',
    category: 'combat',
    sandboxCategory: 'combat',
    costStamina: 15,
    costTouki: 10,
    consequenceHint: `Tăng số trận thắng thực chiến lôi đài, nâng cao danh tiếng cá nhân và nhận tiền thưởng.`,
  });

  choices.push({
    id: `sb_boss_hunt_${regionKey}_${turnNumber}`,
    label: `Săn Lùng Ma Thú Đầu Đàn (Alpha Monster)`,
    actionText: `Theo dõi dấu vết móng vuốt để phục kích con ma thú đầu đàn to lớn thống trị phụ cận ${region.name}, tiêu diệt nó để thu hoạch sừng quý và lõi ma thạch.`,
    riskLevel: 'dangerous',
    category: 'combat',
    sandboxCategory: 'combat',
    costMp: 25,
    costStamina: 25,
    costTouki: 15,
    consequenceHint: `Rủi ro thương vong cao nếu thiếu chuẩn bị, nhưng phần thưởng là nguyên liệu chế tác ma đạo khí cực hiếm!`,
  });

  // =========================================================================
  // 3. NHÓM 3: TU LUYỆN & ĐỘT PHÁ CẢNH GIỚI (CULTIVATION & MASTERY)
  // =========================================================================
  choices.push({
    id: `sb_train_swordsmanship_${turnNumber}`,
    label: `Khổ Luyện Kiếm Thuật: Tôi Luyện Bộ Pháp & Tốc Độ`,
    actionText: `Dành trọn vẹn cả ngày vung kiếm 1.000 lần, tôi luyện phản xạ cơ bắp, thế thủ và sự gắn kết giữa Đấu Khí và lưỡi gươm.`,
    riskLevel: 'safe',
    category: 'sword',
    sandboxCategory: 'cultivation',
    costStamina: 20,
    buffTouki: 5,
    healStamina: 5,
    consequenceHint: `Gia tăng độ thuần thục Kiếm Thuật, làm dày lớp Đấu Khí Touki bảo vệ cơ thể.`,
  });

  choices.push({
    id: `sb_train_magic_elements_${turnNumber}`,
    label: `Thiền Định Khai Mở Mạch Mana & Nghiên Cứu Ma Pháp`,
    actionText: `Ngồi thiền hòa nhập ý thức với các dòng chảy nguyên tố tự nhiên (Thủy, Hỏa, Thổ, Phong), rèn luyện khả năng nén Mana và thi triển thần tốc.`,
    riskLevel: 'safe',
    category: 'magic',
    sandboxCategory: 'cultivation',
    costMp: 20,
    healHp: 10,
    consequenceHint: `Tăng dung lượng và khả năng kiểm soát Mana, đẩy nhanh tiến trình giác ngộ Vô Niệm Chú.`,
  });

  choices.push({
    id: `sb_train_demon_eyes_${turnNumber}`,
    label: `Tôi Luyện Ma Nhãn & Cảm Quan Trực Giác Cực Hạn`,
    actionText: `Tập trung nguồn năng lượng tinh thần vào hốc mắt, kích hoạt các ma nhãn để nhìn thấu dòng chảy mana xung quanh và dự đoán quỹ đạo đòn đánh trước 1 nhịp.`,
    riskLevel: 'safe',
    category: 'magic',
    sandboxCategory: 'cultivation',
    costMp: 15,
    consequenceHint: `Gia tăng độ nhạy bén của Dự Tri Nhãn và Ma Lực Nhãn, tăng phản xạ né tránh đòn hiểm.`,
  });

  // =========================================================================
  // 4. NHÓM 4: THẾ LỰC, CĂN CỨ & ĐỒNG ĐỘI (FACTION, STRONGHOLD & COMPANIONS)
  // =========================================================================
  if (companionCount < 4) {
    choices.push({
      id: `sb_recruit_companion_${turnNumber}`,
      label: `Chiêu Mộ Đồng Đội: Tìm Kiếm Hào Kiệt Lập Nhóm`,
      actionText: `Đến hội quán mạo hiểm giả hoặc khu chợ tự do, phỏng vấn và chiêu mộ một đồng đội tài ba (pháp sư, kiếm sĩ hoặc trị liệu sư) để cùng sát cánh chiến đấu.`,
      riskLevel: 'safe',
      category: 'social',
      sandboxCategory: 'faction',
      costStamina: 5,
      consequenceHint: `Bổ sung thêm một đồng đội đắc lực vào nhóm, gia tăng hỏa lực và hỗ trợ hồi phục khi giao tranh.`,
    });
  } else {
    choices.push({
      id: `sb_bond_companions_${turnNumber}`,
      label: `Giao Lưu & Bồi Dưỡng Tình Cảm Với Đồng Đội`,
      actionText: `Cùng các thành viên trong nhóm tổ chức một bữa tiệc lửa trại ấm cúng, chia sẻ kinh nghiệm chiến đấu và thắt chặt mối quan hệ gắn bó.`,
      riskLevel: 'safe',
      category: 'social',
      sandboxCategory: 'faction',
      costStamina: 5,
      consequenceHint: `Gia tăng chỉ số trung thành của đồng đội, mở khóa các đòn phối hợp combo nhóm uy lực.`,
    });
  }

  choices.push({
    id: `sb_stronghold_build_${turnNumber}`,
    label: !sandbox.strongholdLevel 
      ? `Mua Đất & Đặt Nền Móng Xây Dựng Căn Cứ Riêng` 
      : `Nâng Cấp Trang Viên & Doanh Trại Căn Cứ (Cấp ${(sandbox.strongholdLevel || 0) + 1})`,
    actionText: sandbox.strongholdLevel === 0
      ? `Bỏ vốn mua một mảnh đất phong thủy tại ${region.name}, xây dựng một căn cứ riêng biệt để lưu trữ tài sản, luyện tập và làm điểm tựa thế lực.`
      : `Mở rộng quy mô trang viên căn cứ, gia cố hàng rào phòng thủ, xây dựng lò rèn riêng và phòng thiền định ma pháp.`,
    riskLevel: 'safe',
    category: 'social',
    sandboxCategory: 'faction',
    costStamina: 10,
    consequenceHint: `Nâng tầm thế lực cá nhân, mở ra nguồn thu nhập thụ động và nơi an dưỡng hồi phục tối đa.`,
  });

  choices.push({
    id: `sb_faction_diplomacy_${turnNumber}`,
    label: `Ngoại Giao Thế Lực: Tạo Dựng Quan Hệ Với Vương Triều & Thương Hội`,
    actionText: `Gặp gỡ các sứ giả hoặc lãnh chúa địa phương, thực hiện các thỏa thuận hợp tác cùng có lợi để gia tăng tiếng nói và nhận được sự bảo hộ chính trị.`,
    riskLevel: 'safe',
    category: 'social',
    sandboxCategory: 'faction',
    costStamina: 5,
    consequenceHint: `Gia tăng điểm uy tín với các thế lực lớn, mở khóa quyền mua các bảo vật cấm và quyền lợi đặc khu.`,
  });

  // =========================================================================
  // 5. NHÓM 5: THƯƠNG NGHIỆP & CHẾ TẠO (TRADE, CRAFTING & ECONOMY)
  // =========================================================================
  choices.push({
    id: `sb_trade_goods_${regionKey}_${turnNumber}`,
    label: `Giao Thương Buôn Bán: Đầu Cơ Hàng Hóa Kiếm Lời`,
    actionText: `Khảo sát giá cả ma thạch, nông sản và dược thảo giữa các khu vực, gom mua hàng giá rẻ tại ${region.name} để bán lại kiếm lời chênh lệch lớn.`,
    riskLevel: 'safe',
    category: 'trade',
    sandboxCategory: 'trade',
    costStamina: 10,
    consequenceHint: `Thu về lượng Xu Asura dồi dào, nâng cao tích lũy kinh tế cho bản thân và bang phái.`,
  });

  choices.push({
    id: `sb_craft_equipment_${turnNumber}`,
    label: `Rèn Đúc Vũ Khí & Chế Tạo Ma Đạo Khải Tại Xưởng Thợ`,
    actionText: `Tận dụng các ma thạch và khoáng sản đã thu thập được trong hành trình, đích thân rèn đúc một thanh vũ khí sắc bén hoặc chế tạo giáp bảo vệ độc bản.`,
    riskLevel: 'safe',
    category: 'trade',
    sandboxCategory: 'trade',
    costStamina: 15,
    costMp: 10,
    consequenceHint: `Tạo ra trang bị chất lượng cao với các thuộc tính cộng dồn phù hợp với lối chơi của bạn.`,
  });

  choices.push({
    id: `sb_auction_attend_${turnNumber}`,
    label: `Tham Gia Phiên Đấu Giá Kỳ Trân Dị Bảo`,
    actionText: `Đến hội trường đấu giá hoa lệ, cạnh tranh ra giá với các phú thương và quý tộc để sở hữu các thánh tích cổ, bí tịch ma thuật hoặc trứng ma thú độc nhất vô nhị.`,
    riskLevel: 'safe',
    category: 'trade',
    sandboxCategory: 'trade',
    costStamina: 5,
    consequenceHint: `Cơ hội sở hữu bảo vật cấp Thánh/Vương mà bình thường tiền bạc không thể mua được.`,
  });

  // =========================================================================
  // 6. NHÓM 6: BẾ QUAN TU HÀNH 1 NĂM (TIME SKIP DEEP SECLUSION)
  // =========================================================================
  choices.push({
    id: `sb_timeskip_year_${turnNumber}`,
    label: `Bế Quan Tu Luyện 1 Năm: Đột Phá Giới Hạn Thân Tâm`,
    actionText: `Tạm gác lại mọi âu lo trần tục, vào phòng luyện kín bế quan suốt 1 năm ròng để nghiền ngẫm kiếm đạo, dung hợp ma pháp và gia tăng toàn diện chỉ số sinh mệnh.`,
    riskLevel: 'safe',
    category: 'timeskip',
    sandboxCategory: 'timeskip',
    costStamina: 0,
    buffTouki: 10,
    healHp: 20,
    consequenceHint: `Thời gian trôi qua 1 năm tuổi. Tăng vọt lượng Mana, Đấu Khí, Thể Lực và củng cố vững chắc nền tảng tu vi!`,
  });

  return choices;
}

export function processSandboxTurnOutcome(
  character: Character, 
  choice: TurnChoice, 
  actionText: string, 
  turnNumber: number
): {
  narration: string;
  systemNotes: string[];
  rippleEffectText: string;
} {
  const sandbox = ensureSandboxProgression(character);
  const actionLower = (actionText || '').toLowerCase();
  const charName = character.name || 'Người Chơi';
  const regionKey = getCurrentRegionKey(character.stats.location);
  const region = SANDBOX_REGIONS[regionKey] || SANDBOX_REGIONS['valoria_city'];

  const systemNotes: string[] = [];
  let narration = '';
  let rippleEffectText = '';

  // 1. Handling Travel
  if (actionLower.includes('du hành') || actionLower.includes('tiến về') || actionLower.includes('lên đường')) {
    const targetRegionKey = Object.keys(SANDBOX_REGIONS).find(k => actionLower.includes(SANDBOX_REGIONS[k].name.toLowerCase()) || actionLower.includes(k));
    if (targetRegionKey && SANDBOX_REGIONS[targetRegionKey]) {
      const target = SANDBOX_REGIONS[targetRegionKey];
      character.stats.location = target.name;
      if (!sandbox.unlockedRegions.includes(target.id)) {
        sandbox.unlockedRegions.push(target.id);
        sandbox.renownScore += 15;
        systemNotes.push(`🗺️ Mở khóa vùng đất mới: ${target.name}! (+15 Danh Vọng)`);
      }
      narration = `[HÀNH TRÌNH DU HÀNH LIÊN VÙNG]
Đoàn xe ngựa lóc cóc lăn bánh qua những bình nguyên và rặng núi trùng điệp. Gió lộng mang theo phong vị mới lạ của vùng đất mới.
Sau một chuyến hành trình an toàn, bạn đã chính thức đặt chân tới [${target.name}]!
Không khí nơi đây mang sắc thái hoàn toàn khác biệt: ${target.description}
Một trang sử mạo hiểm mới lại mở ra trước mắt bạn!`;
      rippleEffectText = `Việc bạn đặt chân đến ${target.name} đã thu hút sự chú ý của các thế lực và thợ săn tiền thưởng địa phương.`;
      systemNotes.push(`Đã di chuyển thành công đến ${target.name}.`);
      return { narration, systemNotes, rippleEffectText };
    }
  }

  // 2. Handling Dungeon Floor Delve
  if (actionLower.includes('hầm ngục') || actionLower.includes('mê cung') || actionLower.includes('tầng')) {
    const floor = sandbox.dungeonDeepestFloor;
    const gainedCoins = Math.floor(40 + floor * 15 + Math.random() * 30);
    character.stats.asuraCoins = (character.stats.asuraCoins || 0) + gainedCoins;
    character.stats.healthCurrent = Math.max(10, character.stats.healthCurrent - 10);
    character.stats.manaCurrent = Math.max(5, character.stats.manaCurrent - 15);
    character.stats.touki = Math.min(character.stats.toukiMax || 100, (character.stats.touki || 0) + 2);
    if (character.rawBaseStats) {
      character.rawBaseStats.touki = (character.rawBaseStats.touki || 0) + 2;
    }
    sandbox.dungeonDeepestFloor += 1;
    sandbox.renownScore += 20;

    narration = `[CHINH PHỤC HẦM NGỤC: TẦNG THỨ ${floor}]
Lưỡi kiếm và ma pháp của bạn rực sáng xé toạc màn sương mù u tối dưới lòng đất. Bầy ma thú canh gác tầng ${floor} gầm thét lao tới với tốc độ chớp nhoáng!
Với kinh nghiệm chiến đấu lão luyện, bạn linh hoạt vận Đấu Khí bảo vệ thân thể, kết hợp ma pháp chế ngự cự ly, tung đòn quyết định hạ gục thủ lĩnh quái vật trong tích tắc.
Tại góc phòng giam sâu thẳm, một chiếc rương cổ mạ vàng hé mở, tỏa ra ánh sáng rực rỡ của ma tinh thạch và tiền cổ!`;
    rippleEffectText = `Kỷ lục chinh phục Tầng ${sandbox.dungeonDeepestFloor} hầm ngục của bạn được khắc ghi trên Bảng Danh Dự Hiệp Hội!`;
    systemNotes.push(`Đột phá thành công Tầng ${floor}! Khai mở Tầng ${sandbox.dungeonDeepestFloor}.`);
    systemNotes.push(`Thu hoạch chiến lợi phẩm: +${gainedCoins} Xu Asura, +2 Đấu Khí, +20 Danh Vọng.`);
    return { narration, systemNotes, rippleEffectText };
  }

  // 3. Handling Arena Duel
  if (actionLower.includes('lôi đài') || actionLower.includes('tỷ thí') || actionLower.includes('đấu trường')) {
    const arenaPrize = 50 + sandbox.arenaVictories * 20;
    character.stats.asuraCoins = (character.stats.asuraCoins || 0) + arenaPrize;
    character.stats.touki = Math.min(character.stats.toukiMax || 100, (character.stats.touki || 0) + 3);
    if (character.rawBaseStats) {
      character.rawBaseStats.touki = (character.rawBaseStats.touki || 0) + 3;
    }
    sandbox.arenaVictories += 1;
    sandbox.renownScore += 25;

    narration = `[KHẢNG ĐỊNH DANH TIẾNG TRÊN LÔI ĐÀI TỶ THÍ]
Tiếng hò reo cổ vũ của hàng ngàn khán giả vang dội khắp bốn phía khán đài đấu trường.
Đối thủ của bạn là một chiến binh dạn dày kinh nghiệm với thanh cự kiếm nặng trịch. Hai bên giao tranh nảy lửa qua hàng chục hiệp đấu nghẹt thở.
Nắm bắt sơ hở trong một khắc đối phương thu hồi thế kiếm, bạn tung đòn thần tốc bẻ gãy đà công, buộc trọng tài phải tuyên bố chiến thắng tuyệt đối thuộc về bạn!`;
    rippleEffectText = `Chiến thắng lôi đài thứ ${sandbox.arenaVictories} khiến tên tuổi bạn trở thành đề tài đàm tiếu ngưỡng mộ của giới võ quán.`;
    systemNotes.push(`Thắng lợi trận đấu thứ ${sandbox.arenaVictories} trên đấu trường! Nhận +${arenaPrize} Xu tiền thưởng và +25 Danh Vọng.`);
    return { narration, systemNotes, rippleEffectText };
  }

  // 4. Handling Recruiting Companions
  if (actionLower.includes('chiêu mộ') || actionLower.includes('đồng đội') || actionLower.includes('lập nhóm')) {
    const roles: SandboxCompanion['role'][] = ['mage', 'swordsman', 'healer', 'rogue'];
    const selectedRole = roles[sandbox.companions.length % roles.length];
    const roleNames: Record<SandboxCompanion['role'], string> = {
      mage: 'Pháp Sư Tinh Anh',
      swordsman: 'Kiếm Sĩ Thần Phái',
      healer: 'Trị Liệu Sư Tận Tâm',
      rogue: 'Thợ Săn Trinh Sát',
      artificer: 'Thợ Rèn Ma Khí',
      beast: 'Chiến Binh Thú Tộc',
    };
    const sampleNames = ['Kaelen', 'Lyra', 'Doran', 'Sylvia', 'Boran', 'Mira'];
    const compName = sampleNames[(sandbox.companions.length + turnNumber) % sampleNames.length];

    const newCompanion: SandboxCompanion = {
      id: `comp_${Date.now()}`,
      name: `${compName} (${roleNames[selectedRole]})`,
      role: selectedRole,
      tier: 'Trung cấp (Intermediate)',
      loyalty: 85,
      trait: 'Trung thành, gan dạ trong hiểm nguy',
      status: 'Sẵn sàng tác chiến',
    };
    sandbox.companions.push(newCompanion);

    narration = `[CHIÊU MỘ ĐỒNG ĐỘI MỚI VÀO ĐỘI NGŨ]
Tại hội quán mạo hiểm giả, bạn gặp gỡ [${newCompanion.name}]. Sau một cuộc trò chuyện cởi mở về lý tưởng và phong cách tác chiến, người này vô cùng ấn tượng trước khí chất của bạn.
Hai bên nâng ly chúc mừng và lập lời thề đồng đội gắn kết, cùng chia sẻ vinh quang và hiểm nguy trên mọi nẻo đường mạo hiểm!`;
    rippleEffectText = `Đội ngũ mạo hiểm giả của bạn hiện có ${sandbox.companions.length} thành viên, thanh thế ngày một vang dội.`;
    systemNotes.push(`Đã chiêu mộ thành công đồng đội: ${newCompanion.name}!`);
    return { narration, systemNotes, rippleEffectText };
  }

  // 5. Handling Stronghold / Base Building
  if (actionLower.includes('trang viên') || actionLower.includes('căn cứ') || actionLower.includes('mua đất') || actionLower.includes('doanh trại')) {
    sandbox.strongholdLevel = (sandbox.strongholdLevel || 0) + 1;
    sandbox.strongholdName = sandbox.strongholdName || `Trang Viên Danh Vọng Của ${charName}`;
    sandbox.renownScore += 40;

    narration = `[XÂY DỰNG & MỞ RỘNG CĂN CỨ THẾ LỰC]
Mảnh đất trù phú thuộc quyền sở hữu của bạn giờ đây đã mọc lên [${sandbox.strongholdName}] sừng sững và tráng lệ (Cấp ${sandbox.strongholdLevel}).
Cổng sắt kiên cố, thao trường luyện võ rộng rãi, kho chứa nguyên liệu và phòng thí nghiệm ma thuật đã đi vào hoạt động hoàn chỉnh.
Rất nhiều người hầu, thợ thủ công và mạo hiểm giả tự do tìm đến xin gia nhập dưới trướng thế lực của bạn!`;
    rippleEffectText = `Bạn đã có một lãnh địa và căn cứ vững chắc, trở thành một thế lực có tiếng nói trong khu vực.`;
    systemNotes.push(`Nâng cấp căn cứ lên Cấp ${sandbox.strongholdLevel}: ${sandbox.strongholdName}! (+40 Danh Vọng)`);
    return { narration, systemNotes, rippleEffectText };
  }

  // 6. Handling Trade & Economy
  if (actionLower.includes('giao thương') || actionLower.includes('buôn bán') || actionLower.includes('thương hội')) {
    const profit = Math.floor(60 + Math.random() * 80);
    character.stats.asuraCoins = (character.stats.asuraCoins || 0) + profit;
    sandbox.tradeEmpireValue += profit;

    narration = `[HOẠT ĐỘNG THƯƠNG NGHIỆP & GIAO THƯƠNG ĐẠI LỤC]
Bằng sự nhạy bén thương trường, bạn tận dụng sự chênh lệch cung cầu giữa các thành phố để giao dịch những lô hàng ma thạch và dược phẩm quý.
Thương vụ kết thúc tốt đẹp với lợi nhuận ròng đáng kinh ngạc. Các thương gia lớn đều phải nghiêng mình trước đầu óc kinh doanh sắc bén của bạn!`;
    rippleEffectText = `Dòng tiền của bạn lưu chuyển mạnh mẽ, giúp nâng cao chỉ số tín nhiệm tại các ngân hàng thương hội.`;
    systemNotes.push(`Giao dịch thương nghiệp thành công! Lợi nhuận ròng: +${profit} Xu Asura.`);
    return { narration, systemNotes, rippleEffectText };
  }

  // 7. Handling Cultivation / Breakthrough
  if (actionLower.includes('luyện kiếm') || actionLower.includes('thiền định') || actionLower.includes('tu luyện') || actionLower.includes('ma pháp')) {
    character.rawBaseStats = character.rawBaseStats || { ...character.stats };
    character.rawBaseStats.manaMax = (character.rawBaseStats.manaMax || 10) + 15;
    character.rawBaseStats.touki = (character.rawBaseStats.touki || 0) + 5;
    character.rawBaseStats.healthMax = (character.rawBaseStats.healthMax || 10) + 5;
    syncCharacterTalentStats(character);

    narration = `[KHỔ LUYỆN ĐỘT PHÁ & THĂNG TIẾN THỰC LỰC]
Từng giọt mồ hôi rơi xuống mặt sàn thao trường khi bạn dồn toàn tâm toàn ý vào từng đường kiếm và luồng mana luân chuyển.
Một cảm giác thông suốt bỗng trào dâng trong tâm khảm. Ranh giới nghẽn mạch ma lực được đả thông, Đấu Khí ngưng tụ thành một lớp màng vàng kim vững chắc bao phủ toàn thân.
Thực lực chiến đấu của bạn đã có một bước nhảy vọt đáng kinh ngạc!`;
    rippleEffectText = `Sự tiến bộ thần tốc của bạn khiến các bậc tiền bối xung quanh không khỏi kinh ngạc và thán phục.`;
    systemNotes.push(`Tu luyện đạt thành quả lớn: +15 Max Mana, +5 Max HP, +5 Đấu Khí Touki!`);
    return { narration, systemNotes, rippleEffectText };
  }

  // 8. General Sandbox Resolution
  narration = `[HÀNH ĐỘNG TỰ DO NHẬP VAI TRONG THẾ GIỚI SANDBOX]
Bạn đã quyết định: "${actionText}".
Thế giới Sáu Mặt sống động lập tức phản hồi lại lựa chọn của bạn. Mọi hành vi và quyết định của bạn đều tạo nên làn sóng ảnh hưởng rõ rệt tới những người xung quanh và môi trường xung quanh.
Bạn cảm nhận rõ rệt bản lĩnh sinh tồn và vị thế của mình ngày một vững chắc trong thế giới bao la này!`;
  rippleEffectText = `Những gì bạn vừa làm đang âm thầm định hình số phận và những biến cố tiếp theo trong hành trình của bạn.`;
  systemNotes.push(`Đã ghi nhận và thực hiện trọn vẹn hành động của người chơi.`);

  return { narration, systemNotes, rippleEffectText };
}
