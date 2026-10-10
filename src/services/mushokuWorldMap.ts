import type { 
  Character, 
  TurnChoice, 
  InventoryItem, 
  WorldDiscoveryState, 
  PowerTier 
} from '../types/game.ts';
import { soundFx } from './soundFx.ts';

export type WorldRegionId = 
  | 'millis' 
  | 'asura' 
  | 'northern' 
  | 'demon' 
  | 'great_forest';

export interface RegionalArtifact {
  id: string;
  name: string;
  regionId: WorldRegionId;
  category: 'grimoire' | 'artifact' | 'sword_style' | 'demon_eye' | 'medicine' | 'voice_magic';
  description: string;
  effect: string;
  requirements?: string;
  costSp?: number;
  costKp?: number;
  costCoins?: number;
  itemData?: Partial<InventoryItem>;
}

export interface TeleportRuin {
  id: string;
  name: string;
  sourceRegionId: WorldRegionId;
  destinationRegionId: WorldRegionId;
  destinationName: string;
  description: string;
  mpCostPercent: number; // 50% MP
  ambushRiskPercent: number; // 20% nguy cơ phục kích
  requiredKp: number; // Điểm tri thức giải mã cổ ngữ
}

export interface CaravanRoute {
  targetRegionId: WorldRegionId;
  targetName: string;
  travelMonths: number;
  costCoins: number;
  description: string;
}

export interface WorldRegion {
  id: WorldRegionId;
  name: string;
  continent: string;
  climate: string;
  geography: string;
  culture: string;
  dangerRank: string;
  capitalHub: string;
  exclusiveArtifacts: RegionalArtifact[];
  teleportRuins: TeleportRuin[];
  caravanRoutes: CaravanRoute[];
  themeColor: {
    border: string;
    bg: string;
    text: string;
    badge: string;
    glow: string;
  };
}

export const SIX_FACED_WORLD_REGIONS: Record<WorldRegionId, WorldRegion> = {
  // 1. VƯƠNG QUỐC THẦN THÁNH MILLIS
  millis: {
    id: 'millis',
    name: 'Vương Quốc Thần Thánh Millis (Holy Land Millis)',
    continent: 'Lục địa Millis (Millis Continent)',
    climate: 'Khí hậu ôn hòa, nắng ấm quanh năm, nước thiêng thanh khiết.',
    geography: 'Trung tâm Lục địa Millis, tường thành trắng muốt bao bọc bởi hồ nước thiêng đại giáo đường và cánh rừng Doriar.',
    culture: 'Giáo hội Thần Thánh Millis cai trị, tôn sùng giáo lý thuần khiết, luật pháp nghiêm minh, cấm kỵ tà thuật ma quỷ.',
    dangerRank: 'Rank D - Rank S (Ngoại vi rừng Doriar)',
    capitalHub: 'Đại Thánh Đô Milishion (White Holy Capital)',
    themeColor: {
      border: 'border-blue-400',
      bg: 'bg-blue-950/40',
      text: 'text-blue-200',
      badge: 'bg-blue-900/80 border-blue-400 text-blue-100',
      glow: 'shadow-[0_0_25px_rgba(59,130,246,0.35)]',
    },
    exclusiveArtifacts: [
      {
        id: 'holy_grimoire_god',
        name: 'Thánh Thư Thần Cấp (God-Rank Holy Grimoire)',
        regionId: 'millis',
        category: 'grimoire',
        description: 'Bản gốc thánh thư tối thượng của Giáo hội Millian lưu giữ ma pháp Trị liệu, Giải độc và Kết giới cấp Thần.',
        effect: 'Mở khóa tư cách đột phá Trị Liệu & Giải Độc Thần Cấp. Khả năng hồi sinh tế bào bị hoại tử và tái tạo nội tạng bị nghiền nát.',
        requirements: 'Đã lĩnh hội Trị liệu Vương cấp & Có mặt tại Đại Thánh Đô Milishion',
        costKp: 45,
        costCoins: 300,
      },
      {
        id: 'holy_white_armor_sword',
        name: 'Thánh Giáp & Thánh Kiếm Trắng (White Holy Relics)',
        regionId: 'millis',
        category: 'artifact',
        description: 'Bộ trang bị đúc từ kim loại thiêng của hiệp sĩ đoàn đền thánh, được gia trì phúc lành bảo hộ vĩnh cửu.',
        effect: 'Kháng 60% sát thương Ma pháp hắc ám và độc tố, tăng 40 điểm Phòng ngự và 35 điểm Sát thương chém.',
        requirements: 'Có mặt tại Millis & Danh tiếng Giáo hội >= 30',
        costCoins: 450,
        itemData: {
          name: 'Thánh Kiếm Trắng Millis',
          type: 'weapon',
          equipSlot: 'rightHand',
          tier: 'Thánh cấp (Saint)',
          statBonus: { slashDamageBonus: 35, defenseBonus: 20 },
        },
      },
      {
        id: 'water_god_headquarters',
        name: 'Thủy Thần Đạo Trường (Water God Style HQ)',
        regionId: 'millis',
        category: 'sword_style',
        description: 'Trụ sở chính phái Thủy Thần lưu giữ toàn bộ bí truyền kiếm pháp hóa giải tuyệt đối của các đời Thủy Thần.',
        effect: 'Lĩnh hội tuyệt kỹ [Lưu Đức] và phản đòn tối thượng. Giảm 50% sát thương nhận vào khi ở thế thủ và phản sát 100% khi kẻ địch sơ hở.',
        requirements: 'Có mặt tại Millis & Kiếm thuật Thủy Thần >= Trung cấp',
        costSp: 50,
      },
    ],
    teleportRuins: [
      {
        id: 'ruin_millis_begaritt',
        name: 'Trận Pháp Dịch Chuyển Cổ Ngữ Millis - Begaritt',
        sourceRegionId: 'millis',
        destinationRegionId: 'demon',
        destinationName: 'Lục Địa Ma & Sa Mạc Begaritt',
        description: 'Ma pháp trận thất truyền khắc sâu dưới hầm ngầm cổ đại ngoại vi Milishion, kết nối thẳng tới tháp sa mạc Begaritt.',
        mpCostPercent: 50,
        ambushRiskPercent: 20,
        requiredKp: 20,
      },
    ],
    caravanRoutes: [
      {
        targetRegionId: 'asura',
        targetName: 'Đại Vương Quốc Asura',
        travelMonths: 3,
        costCoins: 120,
        description: 'Đoàn tàu buôn vượt eo biển duyên hải và xe ngựa hộ tống sang Lục Địa Trung Tâm.',
      },
      {
        targetRegionId: 'great_forest',
        targetName: 'Đại Rừng Rậm Đại Thần',
        travelMonths: 1,
        costCoins: 50,
        description: 'Tuyến đường bộ men theo sườn núi Doriar tiến sâu vào đại ngàn của Thú tộc.',
      },
    ],
  },

  // 2. ĐẠI VƯƠNG QUỐC ASURA
  asura: {
    id: 'asura',
    name: 'Đại Vương Quốc Asura (Asura Kingdom)',
    continent: 'Lục địa Trung Tâm (Central Continent)',
    climate: 'Bốn mùa ôn hòa, đồng bằng trù phú, mưa thuận gió hòa.',
    geography: 'Cái nôi văn minh giàu có nhất thế giới. Các đại thành trì Roa, Ars, Lãnh địa Fittoa phồn hoa đô hội.',
    culture: 'Xã hội quý tộc thượng lưu, tiền tài và ma cụ xa hoa, âm mưu cung đình và các sàn đấu kiếm thuật thượng đỉnh.',
    dangerRank: 'Rank F - Rank B (Ven rừng ma thú)',
    capitalHub: 'Hoàng Đô Ars & Lãnh Địa Fittoa',
    themeColor: {
      border: 'border-amber-400',
      bg: 'bg-amber-950/40',
      text: 'text-amber-200',
      badge: 'bg-amber-900/80 border-amber-400 text-amber-100',
      glow: 'shadow-[0_0_25px_rgba(245,158,11,0.35)]',
    },
    exclusiveArtifacts: [
      {
        id: 'royal_magic_tools',
        name: 'Kho Ma Cụ Hoàng Gia Asura (Royal Magic Artifacts)',
        regionId: 'asura',
        category: 'artifact',
        description: 'Kho báu cung đình lưu trữ các bảo vật ma pháp khảm ma thạch cấp Thượng/Thánh độc nhất vô nhị.',
        effect: 'Nhẫn & Dây chuyền tăng 50% hiệu quả hồi phục Mana, Áo choàng hoàng gia cho phép ẩn thân tuyệt đối trước ma thú.',
        requirements: 'Có mặt tại Asura & Sở hữu >= 250 Xu Asura',
        costCoins: 350,
        itemData: {
          name: 'Nhẫn Khuếch Đại Mana Hoàng Gia',
          type: 'accessory',
          equipSlot: 'accessory',
          tier: 'Thánh cấp (Saint)',
          statBonus: { magicDamageBonus: 30, manaCostReductionPercent: 20 },
        },
      },
      {
        id: 'sword_god_dojo',
        name: 'Bản Doanh Kiếm Thần Phái (Sword God Sanctuary)',
        regionId: 'asura',
        category: 'sword_style',
        description: 'Các đạo trường Kiếm Thần phái danh tiếng lẫy lừng nơi đào tạo đòn Quang Chi Thái Đao (Longsword of Light).',
        effect: 'Lĩnh hội tuyệt kỹ Kiếm Thần phái: Tốc độ xuất chiêu đạt vận tốc âm thanh, phá tan thế thủ trước khi địch kịp chớp mắt.',
        requirements: 'Có mặt tại Asura & Kiếm thuật Kiếm Thần >= Trung cấp',
        costSp: 50,
      },
      {
        id: 'ancient_magic_sword',
        name: 'Ma Kiếm Cổ Đại Đấu Giá Ngầm (Ancient God-War Blade)',
        regionId: 'asura',
        category: 'artifact',
        description: 'Thanh ma kiếm rèn từ thời Thần Ma Đại Chiến lưu hành qua chợ đen và các buổi đấu giá ngầm của đại quý tộc.',
        effect: 'Chém nát kết giới ma pháp thông thường, lực chém xuyên thấu 50% Đấu Khí bảo vệ của đối thủ.',
        requirements: 'Có mặt tại Asura & Tiền tệ >= 400 Xu Asura',
        costCoins: 400,
        itemData: {
          name: 'Ma Kiếm Cổ Thần Asura',
          type: 'weapon',
          equipSlot: 'rightHand',
          tier: 'Vương cấp (King)',
          statBonus: { slashDamageBonus: 45, defensePiercePercent: 50 },
        },
      },
    ],
    teleportRuins: [
      {
        id: 'ruin_asura_demon',
        name: 'Trận Pháp Cổ Ngữ Fittoa - Lục Địa Ma',
        sourceRegionId: 'asura',
        destinationRegionId: 'demon',
        destinationName: 'Lục Địa Ma (Demon Continent)',
        description: 'Trận pháp thời viễn cổ nằm sâu trong pháo đài hoang phế Fittoa, nối liền trực tiếp tới sa mạc Lục Địa Ma.',
        mpCostPercent: 50,
        ambushRiskPercent: 25,
        requiredKp: 25,
      },
    ],
    caravanRoutes: [
      {
        targetRegionId: 'northern',
        targetName: 'Khu Vực Khách Quan & Các Tiểu Quốc Phía Bắc',
        travelMonths: 2,
        costCoins: 80,
        description: 'Tuyến xa mã vượt qua ranh giới phía bắc Lục Địa Trung Tâm tới Sharia và Neris.',
      },
      {
        targetRegionId: 'millis',
        targetName: 'Vương Quốc Thần Thánh Millis',
        travelMonths: 3,
        costCoins: 120,
        description: 'Thương đoàn vượt duyên hải phía nam bằng thuyền buồm buôn bán ngũ cốc và tơ lụa.',
      },
    ],
  },

  // 3. KHU VỰC KHÁCH QUAN & CÁC TIỂU QUỐC PHÍA BẮC
  northern: {
    id: 'northern',
    name: 'Khu Vực Khách Quan & Các Tiểu Quốc Phía Bắc (Northern Kingdoms)',
    continent: 'Bắc Lục Địa (Northern Continent)',
    climate: 'Băng giá khắc nghiệt, bão tuyết quanh năm, cái lạnh thấu xương.',
    geography: 'Vùng đất của lính đánh thuê, pháo đài thép, Thành Phố Ma Pháp Sharia và các tiểu quốc Ranoa, Neris, Basherant.',
    culture: 'Chiến loạn triền miên, tôn trọng thực chiến sinh tồn, hội tụ mạo hiểm giả kỳ cựu và các pháp sư nghiên cứu cổ ngữ.',
    dangerRank: 'Rank C - Rank S (Hẻm núi Băng Quỷ)',
    capitalHub: 'Thành Phố Ma Pháp Sharia (Magic City Sharia)',
    themeColor: {
      border: 'border-cyan-400',
      bg: 'bg-cyan-950/40',
      text: 'text-cyan-200',
      badge: 'bg-cyan-900/80 border-cyan-400 text-cyan-100',
      glow: 'shadow-[0_0_25px_rgba(6,182,212,0.35)]',
    },
    exclusiveArtifacts: [
      {
        id: 'north_god_style_core',
        name: 'Bản Doanh Phái Bắc Thần (North God Style Core)',
        regionId: 'northern',
        category: 'sword_style',
        description: 'Nơi khởi nguồn kiếm thuật sinh tồn, kiếm thuật dị dạng, triệt hạ khớp xương và mưu mẹo ám khí của Bắc Thần.',
        effect: 'Miễn nhiễm các đòn bắt bài phản công. Tăng 40% khả năng dùng đạo cụ bẫy rập và kiếm chiêu biến ảo.',
        requirements: 'Có mặt tại Bắc Vương Quốc & Kiếm thuật Bắc Thần >= Trung cấp',
        costSp: 50,
      },
      {
        id: 'bloodsteel_warm_armor',
        name: 'Giáp Trụ Thép Ma Huyết (Bloodsteel Warm Armor)',
        regionId: 'northern',
        category: 'artifact',
        description: 'Áo giáp nhẹ trui rèn bằng quặng thép ma huyết phương bắc, giữ ấm tuyệt đối trong bão tuyết âm độ.',
        effect: 'Giảm 35% sát thương vật lý nhận vào từ đòn bổ nặng, triệt tiêu hoàn toàn hiệu ứng cóng buốt giảm tốc độ.',
        requirements: 'Có mặt tại Bắc Vương Quốc & Tiền tệ >= 200 Xu Asura',
        costCoins: 220,
        itemData: {
          name: 'Giáp Trụ Thép Ma Huyết',
          type: 'armor',
          equipSlot: 'body',
          tier: 'Thượng cấp (Advanced)',
          statBonus: { defenseBonus: 35, physicalDamageReductionPercent: 15 },
        },
      },
      {
        id: 'frost_ancient_formations',
        name: 'Trận Pháp Cổ Ngữ Phong Băng (Ancient Frost Scroll)',
        regionId: 'northern',
        category: 'grimoire',
        description: 'Cuộn giấy thất truyền khắc họa trận pháp phong tỏa nhiệt độ và tạo bão tuyết cực hàn của cổ nhân.',
        effect: 'Tăng 35% uy lực ma pháp Băng & Phong. Mở khóa kỹ năng triệu hồi Trận Băng Đông Cứng bước chân toàn bộ kẻ địch.',
        requirements: 'Có mặt tại Sharia & Tri thức (Knowledge) >= 30',
        costKp: 30,
        costCoins: 180,
      },
    ],
    teleportRuins: [
      {
        id: 'ruin_northern_millis',
        name: 'Trận Pháp Hang Động Băng Tuyết Neris - Millis',
        sourceRegionId: 'northern',
        destinationRegionId: 'millis',
        destinationName: 'Vương Quốc Thần Thánh Millis',
        description: 'Trận pháp phong ấn sâu trong hang động băng vĩnh cửu Neris kết nối thẳng về bờ biển Millis.',
        mpCostPercent: 50,
        ambushRiskPercent: 15,
        requiredKp: 20,
      },
    ],
    caravanRoutes: [
      {
        targetRegionId: 'asura',
        targetName: 'Đại Vương Quốc Asura',
        travelMonths: 2,
        costCoins: 80,
        description: 'Đoàn xe trượt tuyết và cỗ xe bốn ngựa vượt qua đèo băng tuyết về phương nam trù phú.',
      },
    ],
  },

  // 4. LỤC ĐỊA MA (BEGARITT & DEMON CONTINENT)
  demon: {
    id: 'demon',
    name: 'Lục Địa Ma (Begaritt & Demon Continent)',
    continent: 'Đại Lục Ma Giới & Sa Mạc Begaritt',
    climate: 'Khắc nghiệt cùng cực, ban ngày nắng thiêu đốt, ban đêm lạnh thấu xương, bão ma lực rít gào.',
    geography: 'Đất đá đỏ cằn cỗi, xương ma thú khổng lồ phơi mình giữa sa mạc, thị trấn đá Rikarisu và mê cung lòng đất.',
    culture: 'Luật rừng tôn sùng kẻ mạnh, nơi cư ngụ của Ma tộc đa dạng sừng/mắt, ma thú Rank A đến Rank S lộng hành.',
    dangerRank: 'Rank A - Rank S (Cực Kỳ Nguy Hiểm)',
    capitalHub: 'Thành Phố Đá Rikarisu (Stone City Rikarisu)',
    themeColor: {
      border: 'border-red-500',
      bg: 'bg-red-950/40',
      text: 'text-red-300',
      badge: 'bg-red-900/80 border-red-500 text-red-100',
      glow: 'shadow-[0_0_25px_rgba(239,68,68,0.4)]',
    },
    exclusiveArtifacts: [
      {
        id: 'ancient_demon_eye_sanctuary',
        name: 'Căn Cứ Ma Nhãn Cổ (Demon Eyes Awakening Sanctuary)',
        regionId: 'demon',
        category: 'demon_eye',
        description: 'Nơi giam giữ bí thuật ma nhãn cổ đại, cho phép khai mở hoặc dung nạp các dòng Ma Nhãn thần thoại.',
        effect: 'Thức tỉnh [Dự Tri Nhãn] (thấy trước tương lai 1 nhịp) hoặc [Ma Lực Nhãn] (thấu suốt cấu trúc mana kẻ địch).',
        requirements: 'Có mặt tại Lục Địa Ma & Sinh mệnh HP >= 50',
        costKp: 40,
        costCoins: 250,
      },
      {
        id: 'behemoth_bone_weapons',
        name: 'Vũ Khí Xương Ma Thú Cổ Đại (Behemoth Bone Relics)',
        regionId: 'demon',
        category: 'artifact',
        description: 'Binh khí rèn thủ công từ răng nanh Behemoth và sừng Ma Long sa mạc, mang độc tính ma khí dữ dội.',
        effect: 'Sát thương xuyên thấu hoàn toàn Đấu Khí kẻ địch. Đòn đánh có 35% cơ hội gây vết thương xé rách chảy máu liên tục.',
        requirements: 'Có mặt tại Lục Địa Ma & STR >= 25',
        costCoins: 320,
        itemData: {
          name: 'Đại Kích Xương Ma Long',
          type: 'weapon',
          equipSlot: 'rightHand',
          tier: 'Thánh cấp (Saint)',
          statBonus: { slashDamageBonus: 40, defensePiercePercent: 60 },
        },
      },
      {
        id: 'immortal_king_regeneration',
        name: 'Bí Thuật Tái Sinh Ma Vương (Immortal Regeneration Secret)',
        regionId: 'demon',
        category: 'artifact',
        description: 'Bí mật sinh học và ma thuật thể xác của Bất Tử Ma Vương Atofe trao cho dũng sĩ vượt qua khảo nghiệm.',
        effect: 'Tăng 300% tốc độ hồi phục HP và Thể lực sau mỗi lượt giao tranh. Giảm 80% nguy cơ tử vong khi bị thương nặng.',
        requirements: 'Có mặt tại Lục Địa Ma & Danh tiếng Ma Giới >= 40',
        costKp: 50,
        costSp: 40,
      },
    ],
    teleportRuins: [
      {
        id: 'ruin_demon_asura',
        name: 'Cổ Tháp Sa Mạc Begaritt - Fittoa (Asura)',
        sourceRegionId: 'demon',
        destinationRegionId: 'asura',
        destinationName: 'Đại Vương Quốc Asura',
        description: 'Ma pháp trận dịch chuyển cổ đại giấu dưới tầng sâu nhất của cổ tháp Begaritt, dẫn thẳng về trung tâm Asura.',
        mpCostPercent: 50,
        ambushRiskPercent: 30,
        requiredKp: 25,
      },
    ],
    caravanRoutes: [
      {
        targetRegionId: 'millis',
        targetName: 'Vương Quốc Thần Thánh Millis',
        travelMonths: 4,
        costCoins: 150,
        description: 'Đoàn thồ lạc đà bọc giáp vượt biển cát sa mạc Begaritt đón tàu buôn sang bến cảng Zant (Millis).',
      },
    ],
  },

  // 5. ĐẠI RỪNG RẬM ĐẠI THẦN
  great_forest: {
    id: 'great_forest',
    name: 'Đại Rừng Rậm Đại Thần (Great Forest)',
    continent: 'Lãnh Thổ Thú Tộc & Doriar',
    climate: 'Rừng mưa ẩm ướt, sấm chớp theo mùa, thảm thực vật bạt ngàn.',
    geography: 'Những thân cây cổ thụ đại ngàn to như tòa lâu đài, đầm lầy sương mù, thác nước linh thiêng và hang động thú vương.',
    culture: 'Lãnh thổ ngàn năm của Thú tộc (Hổ, Báo, Sói), thờ phụng Thần Cây, bài xích kẻ xấu nhưng tôn sùng kẻ dũng cảm.',
    dangerRank: 'Rank B - Rank S (Mùa mưa lũ và thú vương thức tỉnh)',
    capitalHub: 'Làng Doriar (Doriar Beast Village)',
    themeColor: {
      border: 'border-emerald-400',
      bg: 'bg-emerald-950/40',
      text: 'text-emerald-200',
      badge: 'bg-emerald-900/80 border-emerald-400 text-emerald-100',
      glow: 'shadow-[0_0_25px_rgba(16,185,129,0.35)]',
    },
    exclusiveArtifacts: [
      {
        id: 'beast_voice_roar',
        name: 'Tiếng Gầm Ma Thú - Thanh Ma Thuật (Beast Voice Roar)',
        regionId: 'great_forest',
        category: 'voice_magic',
        description: 'Bí truyền thể thuật cổ của dũng sĩ Thú tộc, chuyển hóa mana thành sóng âm chấn động phá hủy màng nhĩ.',
        effect: 'Tạo sóng âm làm choáng đối thủ trong 1-2 lượt, lập tức phá vỡ cấu trúc niệm chú ma pháp của kẻ địch.',
        requirements: 'Có mặt tại Đại Rừng Rậm & Đấu Khí >= 20',
        costSp: 45,
        costKp: 20,
      },
      {
        id: 'century_sacred_bow',
        name: 'Cung Gỗ Thế Kỷ (Century World-Tree Bow)',
        regionId: 'great_forest',
        category: 'artifact',
        description: 'Cây cung chế tác từ lõi Cây Thần ngàn năm của rừng thiêng, dây cung bện từ gân Ma Long thượng cổ.',
        effect: 'Tầm bắn xa cực hạn, mũi tên mang theo kình phong xé toạc lớp da dày và vảy giáp của quái vật khổng lồ.',
        requirements: 'Có mặt tại Đại Rừng Rậm & AGI >= 20',
        costCoins: 280,
        itemData: {
          name: 'Cung Gỗ Thế Kỷ Thần Mộc',
          type: 'weapon',
          equipSlot: 'leftHand',
          isTwoHanded: true,
          tier: 'Thánh cấp (Saint)',
          statBonus: { slashDamageBonus: 35, critRateBonus: 25 },
        },
      },
      {
        id: 'marsh_miracle_herbs',
        name: 'Dược Liệu Đầm Lầy Thần Dược (Sacred Marsh Herbs)',
        regionId: 'great_forest',
        category: 'medicine',
        description: 'Thảo dược kỳ diệu sinh trưởng dưới đầm lầy linh thiêng nơi tinh linh cư ngụ.',
        effect: 'Giải trừ 100% mọi loại độc tố dị trạng, hồi phục lập tức 80% HP và loại bỏ trạng thái gãy xương nội thương.',
        requirements: 'Có mặt tại Đại Rừng Rậm',
        costCoins: 120,
        itemData: {
          name: 'Thần Dược Đầm Lầy Doriar',
          type: 'consumable',
          tier: 'Thánh cấp (Saint)',
          statBonus: { hpHealAmount: 80, staminaHealAmount: 50 },
        },
      },
    ],
    teleportRuins: [
      {
        id: 'ruin_forest_millis',
        name: 'Trận Pháp Cổ Ngữ Đền Thờ Thần Cây - Millis',
        sourceRegionId: 'great_forest',
        destinationRegionId: 'millis',
        destinationName: 'Vương Quốc Thần Thánh Millis',
        description: 'Trận pháp thời thần thoại giấu dưới rễ Cây Thần cổ đại, mở lối tắt vượt qua hàng ngàn dặm về Millis.',
        mpCostPercent: 50,
        ambushRiskPercent: 15,
        requiredKp: 15,
      },
    ],
    caravanRoutes: [
      {
        targetRegionId: 'millis',
        targetName: 'Vương Quốc Thần Thánh Millis',
        travelMonths: 1,
        costCoins: 50,
        description: 'Tuyến đường bộ men theo bìa rừng Doriar do các thợ săn Thú tộc dẫn đường.',
      },
    ],
  },
};

/**
 * Ensure character has world discovery state initialized
 */
export function ensureWorldDiscoveryState(character: Character): WorldDiscoveryState {
  if (!character.worldDiscovery) {
    const currentRegion = identifyCurrentRegion(character.stats.location);
    character.worldDiscovery = {
      currentRegionId: currentRegion.id,
      unlockedRegionIds: [currentRegion.id],
      decodedRuinIds: [],
      collectedArtifactIds: [],
      travelCount: 0,
    };
  }
  return character.worldDiscovery;
}

/**
 * Identify current region based on location text
 */
export function identifyCurrentRegion(location: string = ''): WorldRegion {
  const loc = location.toLowerCase();

  if (loc.includes('millis') || loc.includes('milishion') || loc.includes('zant')) {
    return SIX_FACED_WORLD_REGIONS.millis;
  }
  if (loc.includes('asura') || loc.includes('buena') || loc.includes('roa') || loc.includes('fittoa') || loc.includes('ars')) {
    return SIX_FACED_WORLD_REGIONS.asura;
  }
  if (loc.includes('bắc') || loc.includes('sharia') || loc.includes('neris') || loc.includes('ranoa') || loc.includes('basherant') || loc.includes('north')) {
    return SIX_FACED_WORLD_REGIONS.northern;
  }
  if (loc.includes('ma') || loc.includes('demon') || loc.includes('begaritt') || loc.includes('rikarisu')) {
    return SIX_FACED_WORLD_REGIONS.demon;
  }
  if (loc.includes('rừng') || loc.includes('thú tộc') || loc.includes('forest') || loc.includes('doriar')) {
    return SIX_FACED_WORLD_REGIONS.great_forest;
  }

  // Default to Asura if unspecified
  return SIX_FACED_WORLD_REGIONS.asura;
}

/**
 * Formats the exact HUD line:
 * [VỊ TRÍ HIỆN TẠI]: [Tên Vương Quốc/Địa danh cụ thể] - [Lục địa]
 */
export function formatCurrentDestinationDisplay(character: Character): string {
  const region = identifyCurrentRegion(character.stats.location);
  const specificLoc = character.stats.location || region.capitalHub;
  return `[VỊ TRÍ HIỆN TẠI]: ${specificLoc} - ${region.continent}`;
}

/**
 * Execute Caravan Fast Travel:
 * - Deducts Asura coins
 * - Advances character time (months, potentially age)
 * - Updates character location
 */
export function executeCaravanTravel(
  character: Character, 
  targetRegionId: WorldRegionId
): { success: boolean; message: string; updatedCharacter: Character } {
  const currentRegion = identifyCurrentRegion(character.stats.location);
  const route = currentRegion.caravanRoutes.find(r => r.targetRegionId === targetRegionId);

  if (!route) {
    return {
      success: false,
      message: `Không có tuyến thương đội trực tiếp từ ${currentRegion.name} sang ${SIX_FACED_WORLD_REGIONS[targetRegionId].name}!`,
      updatedCharacter: character,
    };
  }

  const currentCoins = character.stats.asuraCoins || 0;
  if (currentCoins < route.costCoins) {
    return {
      success: false,
      message: `Không đủ tiền lộ phí! Cần ${route.costCoins} Xu Asura (Bạn hiện có ${currentCoins} Xu).`,
      updatedCharacter: character,
    };
  }

  // Deduct coins
  character.stats.asuraCoins = currentCoins - route.costCoins;

  // Advance time
  const currentMonth = character.stats.month || 1;
  const newMonthTotal = currentMonth + route.travelMonths;
  if (newMonthTotal > 12) {
    character.stats.age += Math.floor((newMonthTotal - 1) / 12);
    character.stats.month = ((newMonthTotal - 1) % 12) + 1;
  } else {
    character.stats.month = newMonthTotal;
  }

  // Update location
  const targetRegion = SIX_FACED_WORLD_REGIONS[targetRegionId];
  character.stats.location = targetRegion.capitalHub;

  // Update discovery
  const discovery = ensureWorldDiscoveryState(character);
  discovery.currentRegionId = targetRegionId;
  if (!discovery.unlockedRegionIds.includes(targetRegionId)) {
    discovery.unlockedRegionIds.push(targetRegionId);
  }
  discovery.travelCount += 1;

  soundFx.playParchmentTurn();

  return {
    success: true,
    message: `🐎 [LỮ HÀNH THƯƠNG ĐỘI]: Sau ${route.travelMonths} tháng vượt đường dài cùng đoàn buôn và tiêu tốn ${route.costCoins} Xu Asura, bạn đã an toàn đặt chân tới ${targetRegion.capitalHub} (${targetRegion.continent})!`,
    updatedCharacter: character,
  };
}

/**
 * Execute Ancient Teleportation Ruin Travel:
 * - Requires ruin knowledge
 * - Drains 50% current MP
 * - Instant arrival across continents
 * - Ambush chance check
 */
export function executeTeleportRuinTravel(
  character: Character, 
  ruinId: string
): { 
  success: boolean; 
  message: string; 
  ambushTriggered: boolean; 
  updatedCharacter: Character 
} {
  const currentRegion = identifyCurrentRegion(character.stats.location);
  const ruin = currentRegion.teleportRuins.find(r => r.id === ruinId);

  if (!ruin) {
    return {
      success: false,
      message: 'Không tìm thấy ma pháp trận dịch chuyển tương ứng tại khu vực này!',
      ambushTriggered: false,
      updatedCharacter: character,
    };
  }

  // Check MP
  const currentMp = character.stats.manaCurrent || 0;
  if (currentMp < 10 && !character.progression?.innateTalent?.modifiers?.lockMagic) {
    return {
      success: false,
      message: 'Lượng Mana còn lại quá cạn kiệt để cung cấp năng lượng kích hoạt mạch ma pháp trận cổ đại!',
      ambushTriggered: false,
      updatedCharacter: character,
    };
  }

  // Drain 50% MP
  const drainedMp = Math.floor(currentMp * 0.5);
  character.stats.manaCurrent = Math.max(1, currentMp - drainedMp);

  // Instant travel
  const destRegion = SIX_FACED_WORLD_REGIONS[ruin.destinationRegionId];
  character.stats.location = destRegion.capitalHub;

  // Ambush roll
  const ambushRoll = Math.random() * 100;
  const ambushTriggered = ambushRoll < ruin.ambushRiskPercent;

  // Update discovery
  const discovery = ensureWorldDiscoveryState(character);
  discovery.currentRegionId = ruin.destinationRegionId;
  if (!discovery.decodedRuinIds.includes(ruinId)) {
    discovery.decodedRuinIds.push(ruinId);
  }
  if (!discovery.unlockedRegionIds.includes(ruin.destinationRegionId)) {
    discovery.unlockedRegionIds.push(ruin.destinationRegionId);
  }
  discovery.travelCount += 1;

  soundFx.playPowerUp();

  return {
    success: true,
    message: `🌀 [MA PHÁP TRẬN DỊCH CHUYỂN CỔ ĐẠI KÍCH HOẠT]: Một luồng ánh sáng ma lực chói lòa bùng phát! Không gian bẻ cong, hút mất ${drainedMp} MP (50% Mana) và dịch chuyển bạn tức thì xuyên qua ngàn dặm lục địa tới thẳng ${destRegion.name}!${
      ambushTriggered ? ' ⚠️ [CẢNH BÁO PHỤC KÍCH]: Lối ra của trận pháp nằm trong hang ổ ma thú hung hãn!' : ''
    }`,
    ambushTriggered,
    updatedCharacter: character,
  };
}

/**
 * Claim or Train exclusive artifact / martial style in current region
 */
export function claimRegionalExclusiveArtifact(
  character: Character, 
  artifactId: string
): { success: boolean; message: string; updatedCharacter: Character } {
  const currentRegion = identifyCurrentRegion(character.stats.location);
  const artifact = currentRegion.exclusiveArtifacts.find(a => a.id === artifactId);

  if (!artifact) {
    return {
      success: false,
      message: 'Bảo vật hoặc bí kíp này không thuộc vùng đất bạn đang hiện diện!',
      updatedCharacter: character,
    };
  }

  const discovery = ensureWorldDiscoveryState(character);
  if (discovery.collectedArtifactIds.includes(artifactId)) {
    return {
      success: false,
      message: `Bạn đã từng lĩnh hội hoặc thu thập [${artifact.name}] rồi!`,
      updatedCharacter: character,
    };
  }

  // Check currency or points if needed
  if (artifact.costCoins && (character.stats.asuraCoins || 0) < artifact.costCoins) {
    return {
      success: false,
      message: `Không đủ tiền xu! Cần ${artifact.costCoins} Xu Asura.`,
      updatedCharacter: character,
    };
  }

  if (artifact.costSp && (character.progression?.skillPoints || 0) < artifact.costSp) {
    return {
      success: false,
      message: `Không đủ Điểm Kỹ Năng (SP)! Cần ${artifact.costSp} SP để tu luyện.`,
      updatedCharacter: character,
    };
  }

  if (artifact.costKp && (character.progression?.knowledgePoints || 0) < artifact.costKp) {
    return {
      success: false,
      message: `Không đủ Điểm Tri Thức (KP)! Cần ${artifact.costKp} KP để giải mã.`,
      updatedCharacter: character,
    };
  }

  // Deduct
  if (artifact.costCoins) character.stats.asuraCoins -= artifact.costCoins;
  if (artifact.costSp && character.progression) character.progression.skillPoints -= artifact.costSp;
  if (artifact.costKp && character.progression) character.progression.knowledgePoints -= artifact.costKp;

  // Grant rewards
  if (artifact.category === 'sword_style') {
    if (artifact.id === 'water_god_headquarters') {
      character.swordsmanship.waterGod = 'Thánh cấp (Saint)';
      character.specialTraits.push('[Thủy Thần Phái - Lưu Đức Tối Thượng]');
    } else if (artifact.id === 'sword_god_dojo') {
      character.swordsmanship.swordGod = 'Thánh cấp (Saint)';
      character.specialTraits.push('[Kiếm Thần Phái - Quang Chi Thái Đao]');
    } else if (artifact.id === 'north_god_style_core') {
      character.swordsmanship.northGod = 'Thánh cấp (Saint)';
      character.specialTraits.push('[Bắc Thần Phái - Sinh Tồn & Dị Dạng]');
    }
  } else if (artifact.category === 'voice_magic') {
    if (character.progression) {
      character.progression.magicKnight.beastMartial = 'Thánh cấp (Saint)';
    }
    character.specialTraits.push('[Thanh Ma Thuật - Tiếng Gầm Ma Thú]');
  } else if (artifact.category === 'demon_eye') {
    if (character.progression) {
      character.progression.demonEyes.foresightEye = true;
      character.progression.demonEyes.manaEye = true;
    }
    character.specialTraits.push('[Ma Nhãn Thức Tỉnh - Dự Tri & Ma Lực Nhãn]');
  } else if (artifact.itemData) {
    // Physical artifact item to inventory
    const newItem: InventoryItem = {
      id: `art_${artifact.id}_${Date.now()}`,
      name: artifact.itemData.name || artifact.name,
      type: artifact.itemData.type || 'weapon',
      description: artifact.description,
      tier: artifact.itemData.tier || 'Thánh cấp (Saint)',
      equipSlot: artifact.itemData.equipSlot,
      statBonus: artifact.itemData.statBonus,
      isTwoHanded: artifact.itemData.isTwoHanded,
      isEquipped: false,
    };
    character.inventory.push(newItem);
  }

  discovery.collectedArtifactIds.push(artifactId);
  soundFx.playLevelUp();

  return {
    success: true,
    message: `✨ [BẢO VẬT ĐỘC QUYỀN VÙNG]: Chúc mừng! Bạn đã thành công sở hữu/lĩnh hội [${artifact.name}] tại ${currentRegion.name}!\nHiệu quả: ${artifact.effect}`,
    updatedCharacter: character,
  };
}

/**
 * Generate Next Choices incorporating World Navigation (Rule 3)
 */
export function generateWorldNavigationChoices(character: Character): TurnChoice[] {
  const currentRegion = identifyCurrentRegion(character.stats.location);
  const choices: TurnChoice[] = [];

  // 1) [Hành động khám phá / Tương tác tại chỗ]
  choices.push({
    id: `travel_explore_local_${currentRegion.id}`,
    label: `1. [Khám phá tại chỗ]: Dạo quanh ${currentRegion.capitalHub} & thu thập tin tức`,
    actionText: `Dạo quanh khu vực ${currentRegion.capitalHub} của ${currentRegion.name}, quan sát phong tục địa phương và lắng nghe tin tức mạo hiểm giả.`,
    riskLevel: 'safe',
    category: 'explore',
  });

  // 2) [Tìm kiếm Bảo vật / Đạo trường đặc quyền của vùng này]
  const discovery = ensureWorldDiscoveryState(character);
  const uncollected = currentRegion.exclusiveArtifacts.filter(a => !discovery.collectedArtifactIds.includes(a.id));
  const targetArtifact = uncollected[0] || currentRegion.exclusiveArtifacts[0];

  choices.push({
    id: `travel_artifact_${targetArtifact.id}`,
    label: `2. [Bảo vật khu vực]: Tìm kiếm [${targetArtifact.name}] (${targetArtifact.category === 'sword_style' ? 'Đạo trường bí kíp' : 'Kỳ bảo'})`,
    actionText: `Tìm kiếm và tìm cách lĩnh hội hoặc sở hữu bảo vật/bí kíp độc quyền [${targetArtifact.name}] của ${currentRegion.name}.`,
    riskLevel: 'moderate',
    category: 'study',
  });

  // 3) [Dịch Chuyển Nhanh / Lên Đường]:
  // A. Caravan Fast Travel
  if (currentRegion.caravanRoutes.length > 0) {
    const route = currentRegion.caravanRoutes[0];
    choices.push({
      id: `travel_caravan_${route.targetRegionId}`,
      label: `3A. [Xe ngựa thương đội]: Lên đường tới ${route.targetName} (${route.travelMonths} tháng, ${route.costCoins} Xu)`,
      actionText: `Thuê xe ngựa thương đoàn và lính đánh thuê hộ tống, lên đường tới ${route.targetName}.`,
      riskLevel: 'safe',
      category: 'explore',
    });
  }

  // B. Teleportation Ruin (if available)
  if (currentRegion.teleportRuins.length > 0) {
    const ruin = currentRegion.teleportRuins[0];
    choices.push({
      id: `travel_ruin_${ruin.id}`,
      label: `3B. [Ma pháp trận cổ đại]: Kích hoạt cổng dịch chuyển tới ${ruin.destinationName} (Rút 50% MP)`,
      actionText: `Giải mã và truyền mana kích hoạt Ma pháp trận cổ đại [${ruin.name}], lập tức dịch chuyển xuyên lục địa sang ${ruin.destinationName}.`,
      riskLevel: 'dangerous',
      category: 'magic',
    });
  }

  return choices;
}
