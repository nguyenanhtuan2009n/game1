import type { 
  Character, 
  AdventurerRank, 
  AdventurerQuest, 
  GreatPowerEntry, 
  SevenGreatPowersState, 
  PowerTier 
} from '../types/game.ts';
import { identifyCurrentRegion, type WorldRegionId } from './mushokuWorldMap.ts';

// =========================================================================
// 1. HỆ SINH THÁI QUÁI THÚ CHUẨN MUSHOKU TENSEI THEO KHU VỰC
// =========================================================================

export interface CanonMonster {
  id: string;
  name: string;
  tier: PowerTier;
  category: 'beast' | 'humanoid';
  desc: string;
  tactics: string;
  loot: string;
  rewardCoins: number;
  dangerRank: 'safe' | 'moderate' | 'dangerous' | 'fatal';
}

export interface RegionCanonEcosystem {
  regionId: WorldRegionId;
  regionName: string;
  dangerRankSummary: string;
  environmentDesc: string;
  midAndHighBeasts: CanonMonster[];
  humanoidEnemies: CanonMonster[];
}

export const CANON_REGIONAL_ECOSYSTEMS: Record<WorldRegionId, RegionCanonEcosystem> = {
  // 1. VƯƠNG QUỐC ASURA & VÙNG ĐẤT FEDGOA
  asura: {
    regionId: 'asura',
    regionName: 'Vương Quốc Asura & Vùng Đất Fedgoa / Fittoa',
    dangerRankSummary: 'Rank C - Rank S (Đạo trường & Thích khách)',
    environmentDesc: 'Đồng bằng phì nhiêu xen lẫn rừng rậm ôn đới và lòng sông trù phú, nơi quý tộc Asura phô trương quyền lực và mưu sát ngầm.',
    midAndHighBeasts: [
      {
        id: 'asura_assault_dog',
        name: 'Sói Đột Kích (Assault Dog)',
        tier: 'Trung cấp (Intermediate)',
        category: 'beast',
        desc: 'Loài dã thú lông xám săn mồi hung hãn vùng đồng bằng Asura.',
        tactics: 'Di chuyển theo bầy, phối hợp cắn xé gọng kìm từ hai phía.',
        loot: 'Da Sói Đột Kích & Răng Nanh Cấp Trung',
        rewardCoins: 35,
        dangerRank: 'moderate',
      },
      {
        id: 'asura_armored_boar',
        name: 'Heo Rừng Gai Sắt (Pachyderm / Armored Boar)',
        tier: 'Thượng cấp (Advanced)',
        category: 'beast',
        desc: 'Lớp giáp gai kim loại cứng bao bọc toàn bộ đầu và sống lưng.',
        tactics: 'Lao húc tốc độ cao phá vỡ hàng phòng ngự và khiên thép.',
        loot: 'Tấm Giáp Gai Sắt & Thịt Lợn Rừng Cực Phẩm',
        rewardCoins: 75,
        dangerRank: 'dangerous',
      },
      {
        id: 'asura_water_lizard',
        name: 'Thằn Lằn Trườn Nước Đầm Lầy (Swamp Water Lizard)',
        tier: 'Trung cấp (Intermediate)',
        category: 'beast',
        desc: 'Lớp da trơn bóng ngụy trang hoàn hảo dưới bùn lầy lưu vực sông Asura.',
        tactics: 'Ẩn mình dưới đáy bùn, bất ngờ phóng lưỡi dài ngoạm chặt mắt cá chân.',
        loot: 'Túi Nhầy Trơn & Da Bò Sát Kháng Nước',
        rewardCoins: 40,
        dangerRank: 'moderate',
      },
      {
        id: 'asura_giant_leech',
        name: 'Đỉa Khổng Lồ Hút Máu (Giant River Leech)',
        tier: 'Trung cấp (Intermediate)',
        category: 'beast',
        desc: 'Ký sinh trùng khổng lồ ẩn nấp vùng lòng sông nông Fedgoa.',
        tactics: 'Bám dính da thịt con mồi, tiết chất gây mê và rút cạn sinh lực trong im lặng.',
        loot: 'Túi Huyết Tinh & Dịch Kháng Đông Máu',
        rewardCoins: 45,
        dangerRank: 'moderate',
      },
    ],
    humanoidEnemies: [
      {
        id: 'asura_royal_knight',
        name: 'Kỵ Sĩ Cận Vệ Hoàng Gia Asura (Royal Guard Knight)',
        tier: 'Thượng cấp (Advanced)',
        category: 'humanoid',
        desc: 'Chiến binh xuất thân quý tộc được trang bị ma cụ phòng hộ tối tân.',
        tactics: 'Mang trang bị ma cụ cao cấp, khiên chắn bọc đá ma thuật và kiếm thuật kỷ luật.',
        loot: 'Huy Hiệu Hoàng Gia & Nhẫn Khắc Ma Trận',
        rewardCoins: 120,
        dangerRank: 'dangerous',
      },
      {
        id: 'asura_shadow_assassin',
        name: 'Sát Thủ Bóng Đêm Hoàng Tộc (Boreas / Grangell Shadow)',
        tier: 'Thượng cấp (Advanced)',
        category: 'humanoid',
        desc: 'Thích khách tử sĩ thuộc phe cánh Đệ Nhất Vương Tử Grangell hoặc Đệ Nhị Vương Nữ Ariel.',
        tactics: 'Đao găm tẩm độc tê liệt, ma pháp tàng hình và ám kích từ sau lưng.',
        loot: 'Dao Găm Độc Vị & Áo Choàng Tàng Hình Rách',
        rewardCoins: 160,
        dangerRank: 'dangerous',
      },
      {
        id: 'asura_renegade_sword_god',
        name: 'Môn Sinh Phản Đồ Kiếm Thần Phái (Renegade Sword Sanctum)',
        tier: 'Thánh cấp (Saint)',
        category: 'humanoid',
        desc: 'Kiếm sĩ kiêu ngạo rời bỏ đạo trường, lang bạt cướp bóc và khiêu chiến.',
        tactics: 'Tốc độ xuất kiếm Quang Tốc Trảm sắc lẹm, chém đứt vũ khí thông thường trong 1 nhịp.',
        loot: 'Kiếm Thép Rèn Kiếm Thần & Bí Kíp Trảm Kích',
        rewardCoins: 250,
        dangerRank: 'fatal',
      },
    ],
  },

  // 2. VƯƠNG QUỐC THẦN THÁNH MILLIS
  millis: {
    regionId: 'millis',
    regionName: 'Vương Quốc Thần Thánh Millis & Dãy Rồng Xanh',
    dangerRankSummary: 'Rank B - Rank S (Giáo hội & Kỵ sĩ đền thánh)',
    environmentDesc: 'Thánh địa bao bọc bởi hồ nước thiêng và dãy núi Rồng Xanh hùng vĩ, nơi luật pháp giáo hội thanh trừng tuyệt đối mọi ma tộc.',
    midAndHighBeasts: [
      {
        id: 'millis_silver_horn',
        name: 'Thú Sừng Bạc Cao Nguyên (Silver Horn Plateau Beast)',
        tier: 'Thượng cấp (Advanced)',
        category: 'beast',
        desc: 'Linh thú cao nguyên có cặp sừng bạc lấp lánh tích tụ ánh sáng thiêng.',
        tactics: 'Bắn tia mana quang học chói mắt và húc thủng đá tảng bằng sừng bạc.',
        loot: 'Cặp Sừng Bạc Quang Học & Lông Cừu Thánh',
        rewardCoins: 90,
        dangerRank: 'dangerous',
      },
      {
        id: 'millis_forest_bird',
        name: 'Ma Điểu Rừng Rậm (Holy Canopy Raptor)',
        tier: 'Thượng cấp (Advanced)',
        category: 'beast',
        desc: 'Loài chim săn mồi khổng lồ chao lượn trên tán rừng Doriar.',
        tactics: 'Sải cánh tạo gió xoáy, lao xuống quắp con mồi lên không trung rồi thả rơi.',
        loot: 'Lông Vũ Thần Phong & Móng Vuốt Sắc Bén',
        rewardCoins: 100,
        dangerRank: 'dangerous',
      },
      {
        id: 'millis_sacred_snow_wolf',
        name: 'Sói Tuyết Thần Thánh (Blue Dragon Sacred Snow Wolf)',
        tier: 'Thánh cấp (Saint)',
        category: 'beast',
        desc: 'Mãnh thú biên viễn ngự trị trên đỉnh dãy núi Rồng Xanh phủ đầy tuyết trắng.',
        tactics: 'Lông trắng ngụy trang trong bão tuyết, hơi thở đóng băng và đòn cắn bọc hàn khí cực độ.',
        loot: 'Da Sói Tuyết Thiêng Cấp Thánh & Tinh Thể Băng Vực',
        rewardCoins: 280,
        dangerRank: 'dangerous',
      },
    ],
    humanoidEnemies: [
      {
        id: 'millis_temple_knights',
        name: 'Kỵ Sĩ Đoàn Đền Tạm Millis (Temple Knights Triumvirate)',
        tier: 'Thánh cấp (Saint)',
        category: 'humanoid',
        desc: '3 phân đoàn thiện chiến: Bạch Kỵ Sĩ (kiếm sĩ), Thanh Kỵ Sĩ (pháp sư), Hoàng Kỵ Sĩ (kỵ binh).',
        tactics: 'Phối hợp tam giác: Hoàng Kỵ Sĩ càn quét, Bạch Kỵ Sĩ chém phá Đấu Khí, Thanh Kỵ Sĩ yểm trợ kết giới và hồi máu tức thì.',
        loot: 'Huy Chương Đền Tạm Thánh Địa & Thánh Kiếm Tôi Luyện',
        rewardCoins: 300,
        dangerRank: 'fatal',
      },
      {
        id: 'millis_inquisitor',
        name: 'Pháp Quan Tòa Án Dị Giáo (Holy Inquisitor)',
        tier: 'Thượng cấp (Advanced)',
        category: 'humanoid',
        desc: 'Các giáo sĩ cuồng tín với nhiệm vụ bài trừ triệt để Ma tộc và các tà thuyết dị giáo.',
        tactics: 'Dùng Kết giới giam cầm mana, xích thánh phong tỏa cử động và ngọn lửa thiêng thiêu đốt.',
        loot: 'Thánh Kinh Tòa Án Dị Giáo & Dây Xích Bạc Trói Ma',
        rewardCoins: 180,
        dangerRank: 'dangerous',
      },
      {
        id: 'millis_water_god_master',
        name: 'Đại Sư Thủy Thần Phái Đại Giáo Đường (Water God Sanctuary Master)',
        tier: 'Vương cấp (King)',
        category: 'humanoid',
        desc: 'Cao thủ phái Thủy Thần bảo vệ Đại Giáo Đường Milishion.',
        tactics: 'Tuyệt đối không tấn công trước; hóa giải 100% mọi đòn chém và phản kích chí mạng ngay khi địch hở sườn.',
        loot: 'Kiếm Liễu Thủy Thần Vương Cấp & Bí Tự Hóa Giải',
        rewardCoins: 450,
        dangerRank: 'fatal',
      },
    ],
  },

  // 3. CÁC TIỂU QUỐC PHÍA BẮC (NORTHERN KINGDOMS)
  northern: {
    regionId: 'northern',
    regionName: 'Khu Vực Khách Quan & Các Tiểu Quốc Phía Bắc',
    dangerRankSummary: 'Rank B - Rank Vương (Rồng đất & Bão tuyết)',
    environmentDesc: 'Băng giá quanh năm, chiến loạn giữa các công quốc Nerith, Shirone, Basherant, hội tụ lính đánh thuê tàn nhẫn.',
    midAndHighBeasts: [
      {
        id: 'north_earth_wyrm',
        name: 'Rồng Đất (Earth Wyrm)',
        tier: 'Thượng cấp (Advanced)',
        category: 'beast',
        desc: 'Phân loài rồng hoang dã bò sát sống trong hẻm núi tuyết.',
        tactics: 'Vảy đá dày đao kiếm khó đâm thủng, cú quật đuôi nặng ngàn cân nghiền nát giáp sắt.',
        loot: 'Vảy Rồng Đất Thô & Lõi Ma Tinh Nham Thạch',
        rewardCoins: 160,
        dangerRank: 'dangerous',
      },
      {
        id: 'north_snow_bear',
        name: 'Gấu Tuyết Vực Sâu (Abyss Snow Bear)',
        tier: 'Thượng cấp (Advanced)',
        category: 'beast',
        desc: 'Gấu khổng lồ cao 4 mét, ngủ đông sâu trong các vực băng hẻo lánh.',
        tactics: 'Lực tát xé toạc cỗ xe kéo, lớp mỡ dày triệt tiêu 40% chấn động vật lý.',
        loot: 'Da Gấu Tuyết Cực Phẩm & Túi Mật Gấu Băng',
        rewardCoins: 130,
        dangerRank: 'dangerous',
      },
      {
        id: 'north_lone_frost_wolf',
        name: 'Sói Băng Độc Hành (Lone Frost Wolf)',
        tier: 'Thượng cấp (Advanced)',
        category: 'beast',
        desc: 'Sói tuyết đơn độc bị xua đuổi khỏi bầy, hung dữ và ranh mãnh gấp bội.',
        tactics: 'Ẩn hiện theo gió tuyết, rình rập hàng ngày trời chờ con mồi mệt mỏi rồi cắn đứt cổ họng.',
        loot: 'Nanh Sói Băng Rút Gọn & Tinh Huyết Độc Hành',
        rewardCoins: 110,
        dangerRank: 'moderate',
      },
      {
        id: 'north_blizzard_spirit',
        name: 'Tinh Linh Băng Giá (Frost Blizzard Elemental)',
        tier: 'Thánh cấp (Saint)',
        category: 'beast',
        desc: 'Thực thể ma pháp sinh ra từ bão tuyết trăm năm phương Bắc.',
        tactics: 'Tạo bão tuyết hạ nhiệt độ xuống âm 50 độ C, đóng băng dòng chảy Mana đối thủ.',
        loot: 'Băng Tinh Tinh Linh Thánh Cấp & Ma Pháp Cuộn Phong Băng',
        rewardCoins: 260,
        dangerRank: 'dangerous',
      },
    ],
    humanoidEnemies: [
      {
        id: 'north_veteran_mercenary',
        name: 'Lính Đánh Thuê Phương Bắc (Northern Veteran Mercenary)',
        tier: 'Thượng cấp (Advanced)',
        category: 'humanoid',
        desc: 'Lính đánh thuê dạn dày sương gió, sinh tồn qua hàng chục cuộc chiến tranh công quốc.',
        tactics: 'Áp dụng tiểu xảo Bắc Thần phái: ném cát vào mắt, phi dao ngắn lén lút, giả chết phản công.',
        loot: 'Bộ Áo Da Thép Phương Bắc & Túi Tiền Lính Thuê',
        rewardCoins: 140,
        dangerRank: 'moderate',
      },
      {
        id: 'north_frost_battle_mage',
        name: 'Băng Ma Đạo Sĩ Biên Giới (Border Frost Battle Mage)',
        tier: 'Thượng cấp (Advanced)',
        category: 'humanoid',
        desc: 'Pháp sư quân đội phục vụ công quốc Shirone hoặc Nerith tranh chấp biên ải.',
        tactics: 'Dội tên băng áp lực cao từ tầm xa, dựng tường băng cản trở đường rút lui.',
        loot: 'Trượng Băng Gỗ Thông & Cuộn Phép Thượng Cấp',
        rewardCoins: 170,
        dangerRank: 'dangerous',
      },
      {
        id: 'north_corrupt_adventurer',
        name: 'Mạo Hiểm Giả Tha Hóa (Corrupt Gorge Scavenger)',
        tier: 'Thượng cấp (Advanced)',
        category: 'humanoid',
        desc: 'Kẻ tha hóa chuyên phục kích tân thủ và cướp đoạt chiến lợi phẩm nơi hẻm núi tuyết.',
        tactics: 'Đặt bẫy kẹp gấu giấu dưới tuyết, tấn công hội đồng khi con mồi kiệt sức.',
        loot: 'Trang Bị Cướp Bóc & Thẻ Mạo Hiểm Giả Nhuốm Máu',
        rewardCoins: 150,
        dangerRank: 'dangerous',
      },
    ],
  },

  // 4. LỤC ĐỊA MA & SA MẠC BEGARITT
  demon: {
    regionId: 'demon',
    regionName: 'Lục Địa Ma & Sa Mạc Cằn Cỗi Begaritt',
    dangerRankSummary: 'Rank S - Rank Đế (Vùng đất ma tộc & Xích Long)',
    environmentDesc: 'Vùng hoang mạc đá đỏ và biển cát rực lửa, nơi ma thú Rank S và tàn dư ma vương ngự trị.',
    midAndHighBeasts: [
      {
        id: 'demon_red_wyrm',
        name: 'Xích Long Thung Lũng (Valley Red Wyrm)',
        tier: 'Thánh cấp (Saint)',
        category: 'beast',
        desc: 'Bầy rồng đỏ thống trị Thung Lũng Rồng Đỏ (Red Dragon Valley).',
        tactics: 'Bay theo đàn, da vảy đỏ phản lại 70% sát thương ma pháp, móng vuốt xé nát giáp sắt.',
        loot: 'Xích Long Lân Thượng Hạng & Long Huyết Thánh Cấp',
        rewardCoins: 350,
        dangerRank: 'fatal',
      },
      {
        id: 'demon_sand_worm',
        name: 'Giun Cát Khổng Lồ (Succulent / Giant Sand Worm)',
        tier: 'Thánh cấp (Saint)',
        category: 'beast',
        desc: 'Quái vật sâu cát dài 30 mét trườn sâu dưới lòng sa mạc Begaritt.',
        tactics: 'Tạo hố sụt cát lún nuốt chửng cả đoàn xe ngựa, phun dịch axit ăn mòn mọi kim loại.',
        loot: 'Răng Hàm Giun Cát & Dịch Khử Axit Sa Mạc',
        rewardCoins: 280,
        dangerRank: 'dangerous',
      },
      {
        id: 'demon_bone_fiend',
        name: 'Ác Ma Xương Hóa (Ossified Bone Fiend)',
        tier: 'Thượng cấp (Advanced)',
        category: 'beast',
        desc: 'Bộ hài cốt ma thú cổ đại được ma lực đen sa mạc tái sinh.',
        tactics: 'Kháng hoàn toàn đòn đâm chém thông thường; chỉ có đập nát hoặc ma pháp lửa mới tiêu diệt được.',
        loot: 'Xương Ma Tinh Luyện & Cốt Tủy Hắc Ám',
        rewardCoins: 160,
        dangerRank: 'dangerous',
      },
      {
        id: 'demon_iron_scorpion',
        name: 'Bọ Cạp Thiết Giáp (Ironclad Dune Scorpion)',
        tier: 'Thượng cấp (Advanced)',
        category: 'beast',
        desc: 'Bọ cạp sa mạc mai cứng như sắt tôi, di chuyển thoăn thoắt trên đụn cát nóng.',
        tactics: 'Cặp càng kẹp gãy cổ đối phương, kim đuôi tiêm nọc độc hoại tử xuyên thấu Đấu Khí.',
        loot: 'Vỏ Giáp Bọ Cạp Thiết Giáp & Nọc Độc Hoại Tử',
        rewardCoins: 150,
        dangerRank: 'dangerous',
      },
      {
        id: 'demon_behemoth_ancient',
        name: 'Bê-hê-mốt Sa Mạc (Ancient Begaritt Behemoth)',
        tier: 'Vương cấp (King)',
        category: 'beast',
        desc: 'Cự thú cổ đại sừng sững như ngọn đồi nhỏ di động giữa bão cát Begaritt.',
        tactics: 'Lớp da dày như đá tảng đao thương bất nhập, mỗi cú giậm chân tạo địa chấn lật tung chiến trường.',
        loot: 'Đại Giác Bê-hê-mốt Vương Cấp & Trái Tim Cự Thú',
        rewardCoins: 500,
        dangerRank: 'fatal',
      },
    ],
    humanoidEnemies: [
      {
        id: 'demon_migurd_warrior',
        name: 'Chiến Binh Ma Tộc Di Cư (Migurd & Evil-Eye Tribesman)',
        tier: 'Thánh cấp (Saint)',
        category: 'humanoid',
        desc: 'Chiến binh Ma tộc dày dạn sinh tồn giữa môi trường khắc nghiệt.',
        tactics: 'Thần giao cách cảm phối hợp tác chiến, kết hợp Ma Nhãn Dự Tri nhìn thấu đòn đánh.',
        loot: 'Mảnh Khảm Ma Nhãn & Vũ Khí Ma Tộc Tinh Xảo',
        rewardCoins: 260,
        dangerRank: 'dangerous',
      },
      {
        id: 'demon_laplace_zealot',
        name: 'Tàn Dư Tôn Thờ Ma Thần Laplace (Laplace Revival Cultist)',
        tier: 'Thánh cấp (Saint)',
        category: 'humanoid',
        desc: 'Giáo phái bí mật chờ đợi ngày Ma Thần Laplace tái sinh để hủy diệt Nhân tộc.',
        tactics: 'Sử dụng tà thuật tự hủy, niệm chú ma pháp cổ đại cấm kỵ và cuồng sát không màng sống chết.',
        loot: 'Ấn Tín Laplace Bằng Đồng & Sách Ma Đạo Thất Truyền',
        rewardCoins: 300,
        dangerRank: 'fatal',
      },
    ],
  },

  // 5. ĐẠI RỪNG RẬM (GREAT FOREST)
  great_forest: {
    regionId: 'great_forest',
    regionName: 'Đại Rừng Rậm Đại Thần (Great Forest Doldia)',
    dangerRankSummary: 'Rank B - Rank Thánh (Thú tộc & Rừng thiêng)',
    environmentDesc: 'Đại ngàn cây Thần to lớn vươn tới mây xanh, đầm lầy sương mù và địa bàn của chiến binh Thú tộc tinh nhuệ.',
    midAndHighBeasts: [
      {
        id: 'forest_foul_swamp_monster',
        name: 'Quái Vật Đầm Lầy Dơ Bẩn (Foul Bog Stalker)',
        tier: 'Trung cấp (Intermediate)',
        category: 'beast',
        desc: 'Khối bùn thịt nhầy nhụa sống ký sinh dưới đầm lầy ẩm ướt.',
        tactics: 'Phun dịch bẩn làm mờ mắt và quấn siết chân con mồi kéo xuống bùn sâu.',
        loot: 'Chất Nhầy Đầm Lầy & Hạt Axit Hữu Cơ',
        rewardCoins: 50,
        dangerRank: 'moderate',
      },
      {
        id: 'forest_soul_root_python',
        name: 'Trăn Rễ Cây Nuốt Hồn (Soul-Tree Root Python)',
        tier: 'Thượng cấp (Advanced)',
        category: 'beast',
        desc: 'Trăn khổng lồ ngụy trang thành rễ Cây Thần treo lơ lửng trên cành cao.',
        tactics: 'Thả mình siết nghẹt lồng ngực đối phương trong chớp mắt, nanh độc gây tê liệt toàn thân.',
        loot: 'Da Trăn Ngụy Trang & Túi Mật Trăn Chúa',
        rewardCoins: 140,
        dangerRank: 'dangerous',
      },
      {
        id: 'forest_stone_thorn_tortoise',
        name: 'Rùa Gai Đá Lớn (Stone-Thorn Great Tortoise)',
        tier: 'Thượng cấp (Advanced)',
        category: 'beast',
        desc: 'Rùa khổng lồ mai phủ chông đá nhọn hoắt bò chậm rãi ven bìa rừng.',
        tactics: 'Thu mình vào mai gai chống đỡ mọi đòn tấn công, sau đó xoay tròn mai như bánh xe càn quét.',
        loot: 'Mai Gai Đá Siêu Cứng & Huyết Thạch Kháng Đòn',
        rewardCoins: 120,
        dangerRank: 'moderate',
      },
    ],
    humanoidEnemies: [
      {
        id: 'forest_doldia_hunter',
        name: 'Thợ Săn Thú Tộc Doldia (Doldia Beast-Tribe Hunter)',
        tier: 'Thánh cấp (Saint)',
        category: 'humanoid',
        desc: 'Nữ chiến binh hoặc thợ săn thú nhân (tộc Doldia, Adoldia) thiện chiến bảo vệ làng.',
        tactics: 'Kích hoạt Thanh Ma Thuật (Voice Magic) phát ra tiếng gầm chấn động làm tê liệt thần kinh và phá vỡ cấu trúc niệm chú đối thủ, sau đó bọc Đấu Khí vào móng vuốt xé rách hàng phòng ngự.',
        loot: 'Móng Vuốt Thú Thần & Cung Tên Gỗ Thế Kỷ',
        rewardCoins: 250,
        dangerRank: 'dangerous',
      },
    ],
  },
};

// =========================================================================
// 2. TỔ CHỨC THUỘC PHE CÁNH THẤT ĐẠI LIỆT CƯỜNG (GREAT POWER AFFILIATIONS)
// =========================================================================

export interface GreatPowerAffiliation {
  id: string;
  name: string;
  patron: string; // Tên Liệt Cường bảo hộ
  powerRange: string;
  description: string;
  tacticsAndTraits: string;
  specialLoot: string;
}

export const GREAT_POWER_AFFILIATIONS: GreatPowerAffiliation[] = [
  {
    id: 'affil_dragon_network',
    name: 'Mạng Lưới Rồng (Dragon Network)',
    patron: 'Đệ Nhị Cường: Long Thần Orsted',
    powerRange: 'Thượng cấp đến Đế cấp',
    description: 'Tập hợp các cao thủ Long tộc mai danh ẩn tích, thám tử trung thành truy lùng tung tích Nhân Thần (Hitogami) và người nắm giữ bí thuật Long Môn Trận.',
    tacticsAndTraits: 'Sử dụng Vô niệm ma pháp, Đấu khí bọc vũ khí Long cốt và trận pháp dịch chuyển bí mật của Long tộc.',
    specialLoot: 'Vảy Rồng Khắc Ký Tự Cổ & Thẻ Bài Long Môn Trận',
  },
  {
    id: 'affil_demon_laplace_remnants',
    name: 'Phe Cánh Ma Giới (Laplace Revivalist Cabal)',
    patron: 'Đệ Tứ Cường: Ma Thần Laplace',
    powerRange: 'Trung cấp đến Đế cấp',
    description: 'Tàn dư giáo phái cổ xưa phục hưng Ma Thần, dung hợp máu ma quỷ tạo ra quái vật đột biến mang ấn ký Laplace.',
    tacticsAndTraits: 'Ma pháp đen hủy diệt, quái thú lai tạp hung hãn và lời nguyền ngưng tụ mana.',
    specialLoot: 'Tinh Thể Ma Thần Ấn Ký & Cuộn Da Dê Thần Ma Đại Chiến',
  },
  {
    id: 'affil_fighting_god_berserkers',
    name: 'Quân Đoàn Đấu Khí Thao Túng (Fighting God Berserkers)',
    patron: 'Đệ Tam Cường: Đấu Thần Badigadi / Đấu Thần Giáp',
    powerRange: 'Thánh cấp đến Đế cấp',
    description: 'Võ sĩ cuồng chiến khao khát đỉnh cao thể chất, bị tha hóa bởi tà khí hoàng kim rò rỉ từ Đấu Thần Giáp.',
    tacticsAndTraits: 'Bộc phát Đấu khí cuồng nộ không cảm thấy đau đớn, mỗi đòn đánh rung chuyển đất trời, chiến đấu tới giọt máu cuối cùng.',
    specialLoot: 'Mảnh Hoàng Kim Giáp Tàn Dư & Lõi Đấu Khí Cuồng Nộ',
  },
  {
    id: 'affil_sword_north_assassins',
    name: 'Thích Khách & Đồ Đệ Kiếm Thần / Bắc Thần (Farion & Kalman Disciples)',
    patron: 'Đệ Lục Cường: Gull Farion & Đệ Thất Cường: Kalman III',
    powerRange: 'Thánh cấp đến Đế cấp',
    description: 'Các đệ tử chân truyền của Kiếm Thần Gull Farion đi khiêu chiến đoạt danh khắp đại lục, cùng lính đánh thuê đệ tử Bắc Thần Kalman mang binh khí dị hình.',
    tacticsAndTraits: 'Kiếm Thần trảm tốc độ ánh sáng kết hợp Bắc Thần biến ảo mưu mẹo, không từ bất kỳ thủ đoạn nào để giành chiến thắng.',
    specialLoot: 'Lệnh Bài Kiếm Thần Điện & Binh Khí Trọng Lực Dị Hình',
  },
];

// =========================================================================
// 3. HỆ THỐNG BOSS & MINI BOSS THẾ GIỚI CHUẨN NGUYÊN TÁC
// =========================================================================

export interface CanonBoss {
  id: string;
  name: string;
  category: 'mini_boss' | 'world_boss';
  tier: PowerTier;
  locationName: string;
  description: string;
  specialMechanic: string;
  hpPool: number;
  tactics?: string;
  defeatRewardCoins: number;
  rewardTitle: string;
  rewardItemName: string;
}

export const CANON_BOSSES: CanonBoss[] = [
  // MINI BOSS VÙNG (Cấp Thánh - Cấp Vương)
  {
    id: 'mini_red_wyrm_alpha',
    name: 'Đầu Đàn Xích Long Biến Dị (Mutated Alpha Red Wyrm)',
    category: 'mini_boss',
    tier: 'Thánh cấp (Saint)',
    locationName: 'Thung Lũng Rồng Đỏ (Red Dragon Valley) - Lục Địa Ma',
    description: 'Con Xích Long khổng lồ dẫn đầu bầy tại Thung lũng Rồng Đỏ, sinh ra từ ổ ấp nồng độ mana cực hạn.',
    specialMechanic: 'Vảy rồng cứng ngang kim cương, kháng 80% mọi ma pháp sơ và trung cấp, hơi thở dung nham diện rộng.',
    hpPool: 350,
    defeatRewardCoins: 400,
    rewardTitle: 'Dũng Sĩ Diệt Xích Long',
    rewardItemName: 'Đại Huyết Long Lân Kháng Ma Cực Phẩm',
  },
  {
    id: 'mini_ancient_behemoth_chief',
    name: 'Tù Trưởng Bê-hê-mốt Cổ Xưa (Ancient Behemoth Chieftain)',
    category: 'mini_boss',
    tier: 'Vương cấp (King)',
    locationName: 'Lòng Đất Sa Mạc Begaritt',
    description: 'Cổ thú thức tỉnh từ giấc ngủ ngàn năm dưới đáy biển cát Begaritt khi cảm nhận dao động mana.',
    specialMechanic: 'Mỗi cú giậm tạo sóng chấn động địa chấn làm ngã và choáng váng toàn bộ kẻ địch trong phạm vi 100 mét.',
    hpPool: 450,
    defeatRewardCoins: 500,
    rewardTitle: 'Kẻ Đập Tan Đại Cự Thú',
    rewardItemName: 'Sừng Khổng Lồ Bê-hê-mốt Trọng Sát',
  },
  {
    id: 'mini_wandering_sword_king',
    name: 'Kiếm Vương Lang Bạt (Wandering Sword King Exiled)',
    category: 'mini_boss',
    tier: 'Vương cấp (King)',
    locationName: 'Các Tửu Quán Phương Bắc / Hẻm Núi Băng',
    description: 'Đệ tử phá môn xuất chúng của Kiếm Thần phái, cuồng sát và lang thang khiêu chiến các cao thủ.',
    tactics: 'Quang Tốc Trảm hoàn thiện kết hợp tốc độ rút kiếm siêu thanh; chém đứt vũ khí kẻ thù ngay giây mở màn.',
    specialMechanic: 'Bộc phát Quang Tốc Trảm ngay lượt đầu tiên nếu người chơi không vào thế thủ vững chắc.',
    hpPool: 280,
    defeatRewardCoins: 450,
    rewardTitle: 'Kiếm Vương Bại Tướng Trảm',
    rewardItemName: 'Thanh Kiếm Vương Cổ Ngữ Sát Ý',
  },

  // BOSS THẾ GIỚI / TAI ƯƠNG THẾ HỆ (Cấp Vương - Cấp Đế)
  {
    id: 'boss_atofe_immortal',
    name: 'Ma Vương Bất Tử Atofe (Atoferatofe Rybak)',
    category: 'world_boss',
    tier: 'Đế cấp (Emperor)',
    locationName: 'Lâu Đài Băng Atofe - Lục Địa Ma Tộc',
    description: 'Một trong những Ma Vương huyền thoại sống sót từ Thần Ma Đại Chiến. Tính cách ngu ngơ, hiếu chiến cùng cực.',
    specialMechanic: 'Thân thể bất tử của Ma tộc: Chém đứt đầu hay nát thân thể vẫn tái sinh tức thì! Đi kèm Đội Hộ Vệ Thân Tín bọc Đấu khí dày đặc. Nếu người chơi bị đánh bại, bà ta ép ký khế ước làm thuộc hạ muôn đời!',
    hpPool: 800,
    defeatRewardCoins: 1000,
    rewardTitle: 'Kẻ Vượt Qua Thử Thách Ma Vương Bất Tử',
    rewardItemName: 'Khế Ước Minh Ước Bất Tử Tộc Atofe',
  },
  {
    id: 'boss_wyrm_king_abyss',
    name: 'Cự Long Vương Vực Sâu (Wyrm King of the Abyss)',
    category: 'world_boss',
    tier: 'Đế cấp (Emperor)',
    locationName: 'Đỉnh Núi Băng Vĩnh Cửu - Phương Bắc',
    description: 'Chúa tể cổ xưa của loài rồng hoang dã ngự trị trên đỉnh núi tuyết cao nhất phương Bắc.',
    specialMechanic: 'Hơi thở Băng Tuyệt Đối đóng băng vạn vật trong nháy mắt, phủ Đấu Khí Rồng dày khiến đòn tấn công vật lý nảy ngược.',
    hpPool: 900,
    defeatRewardCoins: 1200,
    rewardTitle: 'Chúa Tể Chinh Phục Cự Long',
    rewardItemName: 'Long Châu Băng Tuyệt Đối Cấp Đế',
  },
  {
    id: 'boss_ancient_valley_red_wyrm',
    name: 'Xích Long Cổ Đại - Chúa Tể Thung Lũng (Ancient Sky Red Wyrm)',
    category: 'world_boss',
    tier: 'Đế cấp (Emperor)',
    locationName: 'Hẻm Vực Sâu Thung Lũng Rồng Đỏ',
    description: 'Cá thể rồng đỏ thượng cổ sống sót từ thời thần thoại với sải cánh che kín bầu trời.',
    specialMechanic: 'Sải cánh tạo lốc xoáy lửa thiêu rụi cả ngọn đồi thành tro tàn, lớp vảy rồng đỏ phản ma pháp 80% và móng vuốt xé nát giáp sắt.',
    hpPool: 850,
    defeatRewardCoins: 1100,
    rewardTitle: 'Huyền Thoại Trảm Xích Long Vương',
    rewardItemName: 'Bộ Giáp Vảy Xích Long Cổ Đại Bất Hoại',
  },
];

// =========================================================================
// 4. DANH SÁCH THẤT ĐẠI LIỆT CƯỜNG CHUẨN XÁC TRÊN BIA ĐÁ THẾ GIỚI
// =========================================================================

export const SEVEN_GREAT_POWERS_CANON: GreatPowerEntry[] = [
  {
    rank: 1,
    title: 'ĐỆ NHẤT CƯỜNG',
    name: 'KỸ THẦN',
    alias: 'Technique God (Laplace)',
    crestIcon: '⚙️',
    symbol: 'Bánh Răng Tri Thức & Võ Thuật Sáng Thế',
    powerTier: 'Thần cấp (God)',
    description: 'Bản thể phân tách mang toàn bộ tri thức và kỹ năng võ thuật của Laplace. Ẩn cư tại ngọn núi cao nhất phương Bắc, nắm giữ toàn bộ kỹ thuật của thế giới.',
    usurpedByPlayer: false,
    defeatConditions: 'Chỉ có thể chạm trán khi thông thạo toàn bộ võ thuật và ma thuật thế giới, sở hữu trang bị thần thoại.',
    specialWarning: 'TUYỆT ĐỐI BẤT KHẢ THI cho bất kỳ ai dưới cảnh giới Thần cấp tối thượng!',
  },
  {
    rank: 2,
    title: 'ĐỆ NHỊ CƯỜNG',
    name: 'LONG THẦN ORSTED',
    alias: 'Dragon God Orsted',
    crestIcon: '🐉',
    symbol: 'Long Môn Bí Thuật & Vô Niệm Toàn Năng',
    powerTier: 'Thần cấp (God)',
    description: 'Tồn tại mạnh nhất còn di chuyển tự do trên thế giới. Sở hữu Long Môn, vận dụng toàn bộ ma pháp mọi hệ không cần niệm chú, Đấu Khí vô địch, nhưng bị hạn chế bởi lời nguyền phục hồi ma lực cực chậm và lời nguyền khiến vạn vật căm ghét/sợ hãi.',
    usurpedByPlayer: false,
    defeatConditions: 'Yêu cầu Ma Đạo Khải Mk.I/Mk.Zero, kho vũ khí thần khí, sự phối hợp chiến thuật chuẩn xác và tiêu hao toàn bộ mana của ông ta.',
    specialWarning: 'Đụng độ trực diện khi chưa đạt Đế cấp/Thần cấp đồng nghĩa với cái chết diễn ra trong chưa đầy 1 giây!',
  },
  {
    rank: 3,
    title: 'ĐỆ TAM CƯỜNG',
    name: 'ĐẤU THẦN BADIGADI / ĐẤU THẦN GIÁP',
    alias: 'Fighting God (Golden Armor)',
    crestIcon: '🛡️',
    symbol: 'Hoàng Kim Đấu Thần Giáp',
    powerTier: 'Thần cấp (God)',
    description: 'Danh hiệu gắn liền với Đấu Thần Giáp (bộ giáp hoàng kim ma đạo do Laplace rèn). Khi giáp thức tỉnh trên cơ thể Bất Tử Ma Vương Badigadi, nó trở thành cỗ máy chiến tranh nuốt chửng ý thức người mặc, sức mạnh phá hủy sơn hà.',
    usurpedByPlayer: false,
    defeatConditions: 'Phải phá hủy liên kết giữa bộ giáp và sinh mệnh bất tử, hoặc phong ấn linh hồn giáp bằng pháp trận cấp Thần.',
    specialWarning: 'Sức tàn phá có thể xóa sổ cả một lục địa nếu giáp bộc phát tối đa!',
  },
  {
    rank: 4,
    title: 'ĐỆ TỨ CƯỜNG',
    name: 'MA THẦN LAPLACE',
    alias: 'Demon God Laplace',
    crestIcon: '👁️',
    symbol: 'Con Mắt Thứ Ba Ma Pháp & Ấn Ký Phong Ấn',
    powerTier: 'Thần cấp (God)',
    description: 'Nửa kia mang trọn vẹn sức mạnh ma lực khổng lồ của Laplace bị phong ấn sau Thần Ma Đại Chiến. Đại diện cho nguồn gốc thảm họa và sự tái sinh ma lực.',
    usurpedByPlayer: false,
    defeatConditions: 'Chờ đợi thời khắc tái sinh theo lời tiên tri hoặc giải mã cổ trận phong ấn đại chiến.',
    specialWarning: 'Ma lực vô tận có thể làm tan rã thể xác bất kỳ sinh vật nào đến gần khi thức tỉnh!',
  },
  {
    rank: 5,
    title: 'ĐỆ NGŨ CƯỜNG',
    name: 'TỬ THẦN RANDOLPH MARIANNE',
    alias: 'Death God Randolph Marianne',
    crestIcon: '💀',
    symbol: 'Ảo Ảnh Kiếm & Kiếm Gỉ Sét',
    powerTier: 'Đế cấp (Emperor)',
    description: 'Mang dòng máu hỗn huyết người và ma tộc, ngụ tại Vương quốc Vương Long. Sử dụng kiếm kỹ ảo ảnh quyến rũ kết hợp ma pháp làm chậm và thanh kiếm gỉ sét đoạt mạng bất ngờ.',
    usurpedByPlayer: false,
    defeatConditions: 'Cần nhãn quan phân tích ảo ảnh, phá vỡ ma pháp làm chậm và tốc độ phản xạ vượt qua kiếm ảo.',
    specialWarning: 'Kẻ bất cẩn sẽ bị thanh kiếm gỉ sét chém đứt đầu mà vẫn tưởng đối phương chưa hề rút kiếm!',
  },
  {
    rank: 6,
    title: 'ĐỆ LỤC CƯỜNG',
    name: 'KIẾM THẦN GULL FARION',
    alias: 'Sword God Gull Farion',
    crestIcon: '⚔️',
    symbol: 'Thánh Địa Kiếm & Quang Chi Thái Đao',
    powerTier: 'Thần cấp (God)',
    description: 'Đỉnh cao của Đạo trường Kiếm Thần tại Thánh Địa Kiếm. Nắm giữ tuyệt kỹ [Kiếm Chi Quang Tốc] hoàn hảo đạt vận tốc ánh sáng, chém đứt mọi thứ trước khi đối thủ kịp chớp mắt.',
    usurpedByPlayer: false,
    defeatConditions: 'Đánh bại trực diện tại Đạo trường Kiếm Thần trong một trận quyết đấu công khai được cả phái công nhận.',
    specialWarning: 'Đòn Quang Chi Thái Đao của ông ta trảm đứt mọi thế thủ trong tích tắc; chỉ có phản đòn Thủy Thần hoàn hảo hoặc Đấu khí cấp Đế mới mong cản lại!',
  },
  {
    rank: 7,
    title: 'ĐỆ THẤT CƯỜNG',
    name: 'BẮC THẦN KALMAN III - ALEKSANDER RYBAK',
    alias: 'North God Aleksander (Kalman III)',
    crestIcon: '🗡️',
    symbol: 'Vương Long Kiếm Kajakuto & Trọng Lực Thuật',
    powerTier: 'Thần cấp (God)',
    description: 'Hậu duệ Bắc Thần sở hữu Vương Long Kiếm Kajakuto có khả năng bẻ cong và điều khiển trọng lực. Phong cách chiến đấu biến ảo khôn lường, vận dụng mọi địa hình và mưu mẹo thực chiến.',
    usurpedByPlayer: false,
    defeatConditions: 'Tước đoạt hoặc vô hiệu hóa uy lực điều khiển trọng lực của thanh Vương Long Kiếm Kajakuto trong trận giao tranh công khai.',
    specialWarning: 'Đối thủ có thể bay lượn, đổi hướng rơi giữa không trung và đè bẹp đối thủ bằng trọng lực gấp mười lần!',
  },
];

// =========================================================================
// 5. HỆ THỐNG NHIỆM VỤ TIẾN TRÌNH THỰC TẾ (REALISTIC ADVENTURER QUESTS)
// =========================================================================

export const CANON_ADVENTURER_QUESTS: AdventurerQuest[] = [
  // RANK F - D
  {
    id: 'quest_gather_herbs_f',
    title: 'Thu Thập Thảo Dược Trị Thương Biên Rừng',
    rank: 'F',
    regionId: 'asura',
    location: 'Lãnh địa Fittoa (Asura)',
    description: 'Chi nhánh Hội Mạo Hiểm Giả cần gom gấp dược thảo chữa trị vết thương nông cho đội tuần tra.',
    objective: 'Tìm kiếm 5 bụi Cỏ Hồi Sinh ven bìa rừng Buena.',
    rewardCoins: 25,
    rewardSp: 5,
    rewardKp: 5,
    status: 'active',
    dangerLevel: 'safe',
  },
  {
    id: 'quest_cull_assault_dogs_e',
    title: 'Tiễu Trừ Đàn Sói Đột Kích Quấy Nhiễu Nông Trại',
    rank: 'E',
    regionId: 'asura',
    location: 'Ngoại ô Thành Roa (Asura)',
    description: 'Đàn Sói Đột Kích tràn xuống từ sườn đồi cắn xé gia súc của nông dân.',
    objective: 'Hạ gục đàn sói 4 con và thu hồi nanh thú làm bằng chứng.',
    rewardCoins: 50,
    rewardSp: 10,
    rewardKp: 5,
    status: 'active',
    dangerLevel: 'moderate',
  },
  {
    id: 'quest_clean_sewers_d',
    title: 'Dọn Dẹp Đỉa Khổng Lồ Cống Ngầm & Lòng Sông',
    rank: 'D',
    regionId: 'asura',
    location: 'Lưu vực sông Fedgoa (Asura)',
    description: 'Đỉa Khổng Lồ và thằn lằn nước sinh sôi cản trở thuyền bè bến đỗ.',
    objective: 'Tiêu diệt 3 con Đỉa Khổng Lồ hút máu và dọn sạch lòng kênh.',
    rewardCoins: 80,
    rewardSp: 15,
    rewardKp: 10,
    status: 'active',
    dangerLevel: 'moderate',
  },

  // EXAM D -> C
  {
    id: 'quest_exam_d_to_c',
    title: 'Sát Hạch Thăng Hạng Rank C: Huyết Chiến Heo Rừng Gai Sắt',
    rank: 'D',
    regionId: 'asura',
    location: 'Khu rừng cấm ngoại ô Asura',
    description: 'Hội Mạo Hiểm Giả cử giám thị theo dõi bài kiểm tra độc lập một chọi một với ma thú cấp Thượng.',
    objective: 'Đơn độc đối đầu và hạ sát 1 con Heo Rừng Gai Sắt đang cuồng nộ.',
    rewardCoins: 120,
    rewardSp: 25,
    rewardKp: 15,
    isExam: true,
    targetRank: 'C',
    status: 'active',
    dangerLevel: 'dangerous',
  },

  // RANK C - A
  {
    id: 'quest_caravan_escort_c',
    title: 'Hộ Tống Đoàn Buôn Vượt Đèo Tuyết Phương Bắc',
    rank: 'C',
    regionId: 'northern',
    location: 'Đèo Băng Tuyết Nerith (Northern Kingdoms)',
    description: 'Thương đoàn vận chuyển ma thạch và tơ lụa cần mạo hiểm giả cảnh giác trước sói băng và thổ phỉ.',
    objective: 'Bảo vệ an toàn cho cỗ xe ngựa suốt 2 tuần hành trình qua hẻm núi tuyết.',
    rewardCoins: 180,
    rewardSp: 30,
    rewardKp: 20,
    status: 'active',
    dangerLevel: 'dangerous',
  },
  {
    id: 'quest_hunt_earth_wyrm_b',
    title: 'Truy Tìm & Tiêu Diệt Rồng Đất Hung Hãn',
    rank: 'B',
    regionId: 'northern',
    location: 'Hẻm Núi Băng Quỷ (Northern Kingdoms)',
    description: 'Một con Rồng Đất hoang dã phá nát tiền đồn quân sự của công quốc biên cảnh.',
    objective: 'Truy vết vào hang động đá băng và chém đứt lớp vảy rồng cứng cỏi.',
    rewardCoins: 280,
    rewardSp: 45,
    rewardKp: 25,
    status: 'active',
    dangerLevel: 'dangerous',
  },
  {
    id: 'quest_raid_sand_worm_nest_a',
    title: 'Đột Kích Ổ Giun Cát Khổng Lồ Sa Mạc Begaritt',
    rank: 'A',
    regionId: 'demon',
    location: 'Biển Cát Begaritt (Demon Continent)',
    description: 'Hố sụt cát lún của loài Giun Cát khổng lồ cắt đứt tuyến đường liên lạc tới ốc đảo.',
    objective: 'Thâm nhập hố cát, đánh bại Giun Cát chúa dài 30 mét và thu thập dịch khử axit.',
    rewardCoins: 450,
    rewardSp: 60,
    rewardKp: 35,
    status: 'active',
    dangerLevel: 'fatal',
  },

  // EXAM A -> S
  {
    id: 'quest_exam_a_to_s',
    title: 'Sát Hạch Thăng Hạng Rank S: Sinh Tử Khảo Nghiệm Mê Cung',
    rank: 'A',
    regionId: 'demon',
    location: 'Tàn tích Mê Cung Cổ Đại Begaritt',
    description: 'Bài khảo nghiệm huyền thoại của Hội Mạo Hiểm Giả để ghi tên vào hàng ngũ Tinh Anh Rank S đại lục.',
    objective: 'Sống sót qua 3 tầng mê cung ma thú Rank S và trảm sát thủ lĩnh hầm ngục.',
    rewardCoins: 600,
    rewardSp: 80,
    rewardKp: 50,
    isExam: true,
    targetRank: 'S',
    status: 'active',
    dangerLevel: 'fatal',
  },

  // RANK S
  {
    id: 'quest_red_wyrm_valley_s',
    title: 'Thám Hiểm & Săn Lùng Xích Long Thung Lũng Rồng Đỏ',
    rank: 'S',
    regionId: 'demon',
    location: 'Thung Lũng Rồng Đỏ (Red Dragon Valley)',
    description: 'Ủy thác cấp thảm họa quốc gia do Hoàng gia hoặc Liên minh mạo hiểm giả phát lệnh.',
    objective: 'Tiến sâu vào lãnh địa cấm kỵ, đẩy lui đàn Xích Long và đoạt lấy Lõi Long Tinh Thánh Cấp.',
    rewardCoins: 800,
    rewardSp: 100,
    rewardKp: 60,
    status: 'active',
    dangerLevel: 'fatal',
  },
];

// =========================================================================
// 6. HELPER FUNCTIONS: INITIALIZATION & TURN REASONING
// =========================================================================

/**
 * Ensure character has Seven Great Powers state initialized
 */
export function ensureSevenGreatPowersState(character: Character): SevenGreatPowersState {
  if (!character.sevenGreatPowersMonument) {
    character.sevenGreatPowersMonument = {
      powers: JSON.parse(JSON.stringify(SEVEN_GREAT_POWERS_CANON)),
      monumentVisited: false,
      playerRank: null,
      playerPrestigeScore: 0,
    };
  }
  return character.sevenGreatPowersMonument;
}

/**
 * Check if player meets condition to attempt usurping a Great Power
 */
export function evaluateGreatPowerChallenge(
  character: Character, 
  powerRank: number
): { canChallenge: boolean; isInstakill: boolean; reason: string } {
  const currentTier = character.progression?.overallRank || 'Sơ cấp (Beginner)';
  const isHighTier = currentTier === 'Đế cấp (Emperor)' || currentTier === 'Thần cấp (God)';
  const hasGodLevelItems = character.inventory.some(i => i.tier === 'Thần cấp (God)') || 
                           character.equipment.body?.tier === 'Thần cấp (God)';

  // If below Emperor/God tier, mandatory instakill in under 1 second!
  if (!isHighTier && !hasGodLevelItems) {
    return {
      canChallenge: false,
      isInstakill: true,
      reason: `Quy tắc bất khả thi: Đụng độ một trong Thất Đại Liệt Cường (Đệ ${powerRank} Cường) khi thực lực chưa đạt ngưỡng Đế cấp/Thần cấp đồng nghĩa với cái chết diễn ra trong chưa đầy 1 giây! Khí tức áp đảo nghiền nát Đấu Khí và phá hủy kinh mạch bạn tức thì!`,
    };
  }

  return {
    canChallenge: true,
    isInstakill: false,
    reason: `Bạn đã đạt tới cảnh giới tột cùng đủ tư cách bước lên võ đài sinh tử khiêu chiến Đệ ${powerRank} Cường!`,
  };
}

/**
 * Execute Usurpation of a Great Power
 */
export function usurpGreatPowerRank(
  character: Character, 
  powerRank: number
): { success: boolean; announcement: string; updatedCharacter: Character } {
  const monument = ensureSevenGreatPowersState(character);
  const targetPower = monument.powers.find(p => p.rank === powerRank);

  if (!targetPower) {
    return {
      success: false,
      announcement: 'Không tìm thấy vị trí Liệt Cường tương ứng trên bia đá!',
      updatedCharacter: character,
    };
  }

  // Update monument
  targetPower.usurpedByPlayer = true;
  targetPower.alias = `${character.name} (Tân Liệt Cường)`;
  targetPower.symbol = `Ấn Tín Đoạt Vị Của ${character.name}`;
  monument.playerRank = powerRank;
  monument.playerPrestigeScore += 500;
  monument.lastUsurpationNews = `Thế giới chấn động! Bia đá Thất Đại Liệt Cường vừa tự động thay đổi biểu tượng: ${character.name} đã chính thức đoạt vị trí Đệ ${powerRank} Cường!`;

  // Grant massive prestige and titles
  const powerTitle = `ĐỆ ${powerRank} CƯỜNG THẾ GIỚI: [${character.name.toUpperCase()}]`;
  character.title = powerTitle;
  character.specialTraits.push(`[Thất Đại Liệt Cường - Đệ ${powerRank} Cường]`);
  if (character.reputation) {
    character.reputation.fearFactor = Math.min(100, character.reputation.fearFactor + 40);
    character.reputation.socialStanding = `Thất Đại Liệt Cường (Đệ ${powerRank} Cường)`;
    character.reputation.notableFeats.push(`Đoạt vị trí Đệ ${powerRank} Cường trên Bia Đá Thế Giới của Kỹ Thần`);
  }

  return {
    success: true,
    announcement: `🌟 [ĐOẠT VỊ BIA ĐÁ THẾ GIỚI THÀNH CÔNG]!\n${monument.lastUsurpationNews}\nDanh hiệu mới: ${powerTitle}\nUy áp của bạn lên toàn thế giới tăng vọt lên mức tối đa!`,
    updatedCharacter: character,
  };
}

/**
 * Formats the exact environmental intelligence required at the end of each turn:
 * [MỤC TIÊU & NHIỆM VỤ KHU VỰC]:
 * - Nhiệm Vụ Đang Nhận: [Tên nhiệm vụ Hội Mạo Hiểm Giả hoặc mục tiêu sinh tồn cá nhân]
 * - Động Thái Quái Thú: [Tình hình ma thú đặc thù của vùng xung quanh]
 * - Manh Mối Liệt Cường / Thế Lực: [Dấu vết đệ tử của 3 phái kiếm, tàn dư Laplace hoặc bia đá thế giới gần nhất]
 */
export function formatRegionalObjectivesAndMissions(character: Character): string {
  const currentRegion = identifyCurrentRegion(character.stats.location);
  const ecosystem = CANON_REGIONAL_ECOSYSTEMS[currentRegion.id] || CANON_REGIONAL_ECOSYSTEMS.asura;

  // 1. Nhiệm vụ đang nhận
  let activeQuestText = 'Chưa nhận ủy thác (Hãy tới Bảng Hội Mạo Hiểm Giả để nhận việc)';
  if (character.activeQuest) {
    const q = character.activeQuest;
    activeQuestText = `[Rank ${q.rank}] ${q.title} - Mục tiêu: ${q.objective} (Thưởng: ${q.rewardCoins} Xu, +${q.rewardSp} SP)`;
  } else if (character.stats.age < 5) {
    activeQuestText = 'Mục tiêu sơ sinh: Cảm thụ Mana vô niệm chú & rèn luyện thể chất non trẻ';
  } else if (character.stats.age < 10) {
    activeQuestText = 'Mục tiêu vàng: Mở rộng dung lượng Mana trước sinh nhật 10 tuổi';
  }

  // 2. Động thái quái thú
  const randomBeast = ecosystem.midAndHighBeasts[Math.floor(Math.random() * ecosystem.midAndHighBeasts.length)];
  const randomHumanoid = ecosystem.humanoidEnemies[Math.floor(Math.random() * ecosystem.humanoidEnemies.length)];
  const beastDynamic = `Khu vực ghi nhận dấu vết [${randomBeast.name}] (${randomBeast.tier}) - ${randomBeast.tactics}; đề phòng [${randomHumanoid.name}] tuần tra rình rập.`;

  // 3. Manh mối Liệt Cường / Thế Lực
  let greatPowerClue = '';
  switch (currentRegion.id) {
    case 'asura':
      greatPowerClue = 'Manh mối: Dấu vết thích khách Đạo trường Kiếm Thần (đệ tử Kiếm Thần Gull Farion) và tai mắt mật thám của Mạng Lưới Rồng.';
      break;
    case 'millis':
      greatPowerClue = 'Manh mối: Dấu vết đại sư Thủy Thần phái tại Đại Giáo Đường và bia đá cổ dẫn tới Thung lũng Rồng Xanh.';
      break;
    case 'northern':
      greatPowerClue = 'Manh mối: Đồ đệ Bắc Thần Kalman III mang binh khí trọng lực dị hình đang khiêu chiến tại các tửu quán Sharia; Bia Đá Thất Đại Liệt Cường nằm trên đỉnh núi tuyết phương Bắc.';
      break;
    case 'demon':
      greatPowerClue = 'Manh mối: Dấu tích tàn dư giáo phái Ma Thần Laplace tại Begaritt; Long Thần Orsted từng xuất hiện tại Thung lũng Rồng Đỏ.';
      break;
    case 'great_forest':
      greatPowerClue = 'Manh mối: Thợ săn Thú tộc cảnh giác trước các thám tử Mạng Lưới Rồng lùng sục thông tin về Nhân Thần.';
      break;
  }

  return `[MỤC TIÊU & NHIỆM VỤ KHU VỰC]:
- Nhiệm Vụ Đang Nhận: ${activeQuestText}
- Động Thái Quái Thú: ${beastDynamic}
- Manh Mối Liệt Cường / Thế Lực: ${greatPowerClue}`;
}
