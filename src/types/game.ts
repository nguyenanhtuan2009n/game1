export type PowerTier = 
  | 'Chưa học' 
  | 'Sơ cấp (Beginner)' 
  | 'Trung cấp (Intermediate)' 
  | 'Thượng cấp (Advanced)' 
  | 'Thánh cấp (Saint)' 
  | 'Vương cấp (King)' 
  | 'Đế cấp (Emperor)' 
  | 'Thần cấp (God)';

export type CombatDistance = 'Cận chiến (0-2m)' | 'Tầm trung (5-10m)' | 'Bắn xa (>20m)';
export type CombatPhase = 1 | 2 | 3;

export interface MonsterProfile {
  name: string;
  tier: PowerTier;
  desc: string;
  loot: string;
  rewardCoins: number;
}

export interface RegionalEcosystem {
  locationKey: string;
  zoneName: string;
  description: string;
  easyMonsters: MonsterProfile[];
  mediumMonsters: MonsterProfile[];
  hardMonsters: MonsterProfile[];
}

export type EnemyPersonality = 'coward' | 'cunning' | 'bloodthirsty';

export interface Opponent {
  id: string;
  name: string;
  title: string;
  type: 'monster' | 'swordsman' | 'mage' | 'hybrid' | 'god_entity';
  powerTier: PowerTier;
  swordStyle?: 'Kiếm Thần phái' | 'Thủy Thần phái' | 'Bắc Thần phái' | 'Hoang dã';
  magicSchool?: string;
  hpCurrent: number;
  hpMax: number;
  touki: number;
  mana: number;
  status: string; // Khỏe mạnh / Trọng thương / Mất cảnh giác / Đang tích mana...
  distance: CombatDistance;
  description: string;
  rewardCoins?: number;
  lootItem?: string;
  agility?: number;
  personality?: EnemyPersonality;
  psychologyStatus?: string;
}

export type CombatActionRole = 
  | 'healing'   // Nhóm Hồi phục và Trị liệu: Chỉ khép vết thương, cầm máu, hồi Sinh lực (+HP), không gây sát thương
  | 'defense'   // Nhóm Phòng thủ: Chặn đòn, dựng khiên, bọc đấu khí, né tránh (0 làm địch mất máu)
  | 'buff'      // Nhóm Cường hóa và Hỗ trợ: Tăng tạm thời độ dày Đấu khí, tốc độ phản xạ cho lượt sau (0 gây sát thương tức thì)
  | 'attack'    // Nhóm Tấn công: Nhóm duy nhất gây sát thương, phá vỡ Đấu khí và trừ Sinh lực kẻ địch
  | 'flee'      // Nhóm Bỏ chạy: Tính toán khả năng tẩu thoát dựa trên độ Nhanh nhẹn, không gây sát thương
  | 'probing'   // Nhóm Thăm dò / Quan sát (P1)
  | 'verdict'   // Nhóm Phán quyết (P3)
  | 'menu';     // Điều hướng menu

export interface CombatState {
  inCombat: boolean;
  phase: CombatPhase;
  phaseName: string; // 'Giai đoạn 1: Thăm dò & Nhịp độ' | 'Giai đoạn 2: Va chạm & Bức áp' | 'Giai đoạn 3: Đoạt mệnh & Đối mặt hậu quả'
  opponent: Opponent;
  turnInCombat: number;
  playerAdvantage: number; // -100 to 100
  terrain: string;
  lastClashConsequence?: string;
  huntCategory?: 'common' | 'dangerous' | 'sparring';
  escapeChancePercent?: number; // Tỷ lệ bỏ chạy thành công (%)
  selectedBranch?: 'all' | 'offense' | 'defense' | 'retreat' | 'healing' | 'buff'; // Nhánh chiến thuật đang lọc
  offensiveSubMenu?: 'menu' | 'skills' | 'basic' | 'custom'; // Menu con nhánh tấn công P2
  verdictTarget?: 'enemy' | 'player'; // Ai đang ở thế bị phán quyết ở Giai đoạn 3
  enemyReaction?: string; // Tâm lý & Phản ứng đối thủ ở Giai đoạn 3
  parryAdvantage?: boolean; // Lợi thế phản kích sau khi hóa giải đòn của địch thành công (chỉ kích hoạt lượt sau)
  activeToukiBuffTurns?: number; // Số lượt còn lại của hiệu ứng Bộc phát Đấu khí
  activeToukiBonus?: number;     // Điểm Đấu khí cộng thêm tạm thời
  activeReflexBonus?: number;    // Thể thuật thú tộc phản xạ né đòn cộng thêm
  lastActionReport?: {
    role: CombatActionRole;
    hpDiff: number;
    mpDiff: number;
    staminaDiff: number;
    enemyHpDiff: number;
    description: string;
  };
  round?: number;
  hasTriggeredNearDeath?: boolean;
}

export interface MagicSkills {
  fire: PowerTier;
  water: PowerTier;
  earth: PowerTier;
  wind: PowerTier;
  healing: PowerTier;
  detox: PowerTier;
  barrier: PowerTier;
  summoning: PowerTier;
  chantless: boolean;
  chantlessProgress: number; // 0 to 100%
}

export interface SwordSkills {
  swordGod: PowerTier;   // Kiếm Thần phái: Tốc độ, tấn công tuyệt đối, Quang Chi Thái Đao
  waterGod: PowerTier;   // Thủy Thần phái: Phòng ngự phản công
  northGod: PowerTier;   // Bắc Thần phái: Mưu mẹo, thực chiến, ứng biến
  preferredStyle?: 'swordGod' | 'waterGod' | 'northGod' | 'none';
}

export interface Bond {
  id: string;
  name: string;
  relation: string;
  affection: number; // 0 to 100
  notes: string;
  isAlive: boolean;
}

export interface CharacterStats {
  age: number;               // Tuổi (bắt đầu 0)
  month: number;             // Tháng (1-12)
  location: string;          // Vị trí (VD: Làng Buena, Vương quốc Asura)
  manaCurrent: number;       // Mana hiện tại
  manaMax: number;           // Tổng lượng mana hiện tại
  manaPotentialMultiplier: number; // Hệ số tiềm năng do luyện trước 10t (1.0 -> 3.0+)
  manaControl: number;       // 0-100: Tốc độ kiểm soát mana
  touki: number;             // Đấu Khí hiện tại (bảo vệ và cường hóa cơ thể)
  toukiMax?: number;         // Giới hạn Đấu Khí tối đa (chuẩn: 100, mở rộng theo thiên phú lên 125, 200, 400 hoặc 0 nếu khóa)
  knowledge: number;         // 0-100: Thông thái
  healthCurrent: number;     // Máu hiện tại
  healthMax: number;         // Máu tối đa
  staminaCurrent: number;    // Thể lực hiện tại
  staminaMax: number;        // Thể lực tối đa
  asuraCoins: number;        // Tiền tệ (Đồng Asura kim loại/xu)
  fatigue: number;           // 0-100: Mức độ mệt mỏi tích lũy khi farm
  agility?: number;          // Sự nhanh nhẹn & phản xạ né đòn (0-100+)
  strength?: number;         // Sức mạnh cơ bắp & lực chém (STR: 10-200+)
  slashDamageBonus?: number; // Tăng sát thương đòn chém (%)
  meleeDamageBonus?: number; // Tăng sát thương cận chiến / tay không (%)
  incomingPhysicalDamageMultiplier?: number; // Hệ số sát thương vật lý nhận vào (default 1.0)
  incomingMagicDamageMultiplier?: number;    // Hệ số sát thương ma pháp nhận vào (default 1.0)
}

export type EquipmentSlotKey = 
  | 'head'
  | 'body'
  | 'legs'
  | 'feet'
  | 'leftHand'
  | 'rightHand'
  | 'accessory1'
  | 'accessory2'
  | 'accessory3'
  | 'accessory4'
  | 'accessory5';

export const EQUIPMENT_SLOT_LABELS: Record<EquipmentSlotKey, string> = {
  head: 'Ô Đầu (Mũ / Vương miện / Khăn)',
  body: 'Ô Giáp Thân (Áo giáp / Choàng ma pháp)',
  legs: 'Ô Quần (Quần giáp / Vải ma thuật)',
  feet: 'Ô Giày (Bốt da / Giày ma pháp)',
  leftHand: 'Tay Trái (Vũ khí chính / Khiên / Trượng)',
  rightHand: 'Tay Phải (Vũ khí phụ / Khiên / Trượng)',
  accessory1: 'Trang sức 1 (Nhẫn / Dây chuyền / Bùa)',
  accessory2: 'Trang sức 2 (Nhẫn / Dây chuyền / Bùa)',
  accessory3: 'Trang sức 3 (Nhẫn / Dây chuyền / Bùa)',
  accessory4: 'Trang sức 4 (Nhẫn / Dây chuyền / Bùa)',
  accessory5: 'Trang sức 5 (Nhẫn / Dây chuyền / Bùa)',
};

export type ItemEquipSlot = 
  | 'head' 
  | 'body' 
  | 'legs' 
  | 'feet' 
  | 'hand' // Left or right hand
  | 'leftHand'
  | 'rightHand'
  | 'twoHanded' // Takes both left and right hand
  | 'accessory' // Any of the 5 accessory slots
  | 'none';

export interface ItemStatBonus {
  toukiPenetration?: number; // Gia tăng lực xuyên phá Đấu Khí (+5, +15, +30...)
  manaCostReduction?: number; // Giảm tiêu hao Mana (%)
  defenseBonus?: number;     // Giảm sát thương nhận vào (+5, +12, +25...)
  physicalDamageBonus?: number; // Tăng sát thương vật lý
  magicDamageBonus?: number;    // Tăng sát thương ma pháp / dẫn truyền mana
  speedAgilityBonus?: number;   // Tăng tốc độ di chuyển / phản xạ né đòn
  manaMaxBonus?: number;        // Tăng dung lượng Mana tối đa
  manaRegenBonus?: number;      // Tăng tốc độ hồi phục Mana
  magicResistanceBonus?: number;// Kháng ma pháp (%)
  poisonResistanceBonus?: number;// Kháng độc (%)
  luckBonus?: number;           // Điểm may mắn né đòn chí mạng
  hpHealAmount?: number;     // Hồi máu khi dùng
  staminaHealAmount?: number;// Hồi thể lực khi dùng
  slashDamageBonus?: number; // Tăng sát thương kiếm thuật / chém
  defensePiercePercent?: number; // Xuyên giáp / Đấu khí (%)
  physicalDamageReductionPercent?: number; // Giảm sát thương vật lý (%)
  critRateBonus?: number; // Tăng tỷ lệ bộc kích (%)
  manaCostReductionPercent?: number; // Giảm tiêu hao Mana (%)
}

export interface InventoryItem {
  id: string;
  name: string;
  type: 'weapon' | 'staff' | 'grimoire' | 'armor' | 'item' | 'consumable' | 'loot' | 'accessory';
  description: string;
  tier?: string;
  valueCoins?: number;
  isEquipped?: boolean;
  equipSlot?: ItemEquipSlot;
  isTwoHanded?: boolean;
  statBonus?: ItemStatBonus;
  durability?: number; // 0-100%
  quantity?: number;
  dropSource?: string;
}

export interface EquipmentSet {
  head?: InventoryItem;
  body?: InventoryItem;
  legs?: InventoryItem;
  feet?: InventoryItem;
  leftHand?: InventoryItem;
  rightHand?: InventoryItem;
  accessory1?: InventoryItem;
  accessory2?: InventoryItem;
  accessory3?: InventoryItem;
  accessory4?: InventoryItem;
  accessory5?: InventoryItem;
}

export interface CraftingRecipe {
  id: string;
  name: string;
  resultType: 'weapon' | 'staff' | 'consumable' | 'armor' | 'accessory';
  tier: string;
  costCoins: number;
  requiredMaterials: { name: string; quantity: number }[];
  statBonus: ItemStatBonus;
  description: string;
  equipSlot?: ItemEquipSlot;
  isTwoHanded?: boolean;
}

export interface MagicKnightSkills {
  elementalCoating: PowerTier; // Ma Đao Thể Thuật (truyền Lửa/Sét vào vũ khí)
  toukiSurge: PowerTier;       // Đấu Khí Bạo Phát (cường hóa cơ bắp cực hạn)
  beastMartial: PowerTier;     // Thể Thuật Thú Tộc (bản năng hoang dã, móng vuốt, tiếng gầm)
}

export interface CraftingSkills {
  formations: PowerTier;       // Khắc Khóa Trận Pháp (dịch chuyển cự ly ngắn, bẫy ma pháp, phong tỏa mana)
  artifactCrafting: PowerTier; // Luyện Kim & Chế Tạo Ma Cụ (khoáng thạch dẫn mana, vũ khí ma thuật, lõi Ma Giáp)
  summoningContracts: PowerTier; // Khế Ước Triệu Hồi (tinh linh nguyên tố, ma thú trinh sát, hộ mệnh cổ đại)
}

export interface DemonEyes {
  foresightEye: boolean; // Dự Tri Nhãn (nhìn trước vài giây tương lai gần trong chiến đấu)
  xrayEye: boolean;      // Thấu Thị Nhãn (nhìn xuyên vật cản, địa hình và cấu trúc bên trong cơ thể kẻ địch)
  manaEye: boolean;      // Ma Lực Nhãn (nhìn thấy rõ dòng chảy và sự tích tụ mana của đối phương)
  farSightEye: boolean;  // Vạn Lý Nhãn (mở rộng tầm nhìn xa hàng chục dặm)
}

export type TalentTier = 'curse' | 'common' | 'rare' | 'genius' | 'legendary' | 'godkin';

export type InnateTalentType = 
  | 'mortal'             // Người phàm / Ý chí thép
  | 'laplace_factor'     // Yếu Tố Laplace (Mana vô tận, dị chủng)
  | 'divine_bloodline'   // Huyết Mạch Thần Ma (Long tộc, Bất Tử Ma tộc, Cự Thần tộc)
  | 'founder_truth'      // Khai Sáng Chân Lý (Tổ sư sáng phái)
  // 1. Nhóm khiếm khuyết / lời nguyền
  | 'blocked_meridians'      // Kinh Mạch Tắc Nghẽn
  | 'crippled_body'          // Thể Trạng Tật Nguyền
  | 'touki_resistant'        // Kháng Đấu Khí
  | 'abandoned_curse'        // Lời Nguyền Ruồng Bỏ
  | 'short_lived_illness'    // Đoản Thọ / Hàn Bệnh
  // 2. Bậc phàm nhân (50%)
  | 'resilient_body'         // Thân Thể Dẻo Dai
  | 'unshakable_mind'        // Tâm Trí Vững Vàng
  | 'dexterous_hands'        // Khéo Tay
  | 'sharp_hearing'          // Thính Giác Nhạy Bén
  // 3. Bậc tài năng hiếm (30%)
  | 'clear_meridians'        // Kinh Mạch Thông Suốt
  | 'swordsman_bones'        // Gân Cốt Kiếm Sĩ
  | 'hunter_intuition'       // Trực Giác Thợ Săn
  | 'quick_absorption'       // Hấp Thụ Nhanh
  // 4. Bậc thiên tài (15%)
  | 'nature_resonance'       // Đồng Điệu Tự Nhiên
  | 'instant_sight'          // Nhãn Lực Sát Na
  | 'wargod_physique'        // Thể Chất Chiến Thần
  | 'multi_element_flex'     // Đa Nguyên Tố Linh Hoạt
  // 5. Bậc thiên tài của thiên tài (4%)
  | 'laplace_anomaly'        // Hạt Nhân Ma Lực Vô Tận (Laplace Anomaly)
  | 'living_weapon'          // Vũ Khí Sống Thuần Khiết
  | 'omni_cast'              // Tâm Trí Phân Bào (Omni-Cast)
  | 'martial_mimicry'        // Sao Chép Tuyệt Luân (Martial Mimicry)
  // 6. Bậc dị biến huyết thống thần ma (1%)
  | 'immortal_bloodline'     // Mạch Máu Bất Tử
  | 'dragon_awakening';      // Long Lực Thức Tỉnh

export interface InnateTalent {
  id?: string;
  type: InnateTalentType;
  name: string;
  description: string;
  tier?: TalentTier;
  tierName?: string;
  tierProbability?: string;
  icon?: string;
  effectsSummary?: string[];
  modifiers?: Record<string, any>;
}

export interface CharacterProgression {
  skillPoints: number;        // SP: Điểm Kỹ Năng khả dụng
  knowledgePoints: number;    // KP: Điểm Tri Thức / Căn Cơ khả dụng
  nearDeathCount: number;     // Số lần thập tử nhất sinh (cần >= 5 để lên Vương cấp)
  nearDeathMemories: string[];// Lịch sử các lần cận kề cái chết
  innateTalent: InnateTalent; // Căn Cơ / Thiên Phú
  combatWins: number;         // Số trận thực chiến thắng lợi (cần để lên Thượng cấp)
  meteorologicalInsight: boolean; // Lĩnh hội quy mô khí tượng tự nhiên (yêu cầu Ma pháp Thánh cấp)
  swordSaintReflex: boolean;  // Chạm tới cảnh giới phản xạ siêu phàm (yêu cầu Kiếm thuật Thánh cấp)
  godDefeatedOrMonument: boolean; // Khiêu chiến Thần đương nhiệm hoặc khắc tên trên Bia Đá Liệt Cường (Thần cấp)
  magicKnight: MagicKnightSkills;
  crafting: CraftingSkills;
  demonEyes: DemonEyes;
  overallRank: PowerTier;     // RANK TỔNG THỂ HIỆN TẠI
}

export interface Character {
  name: string;
  race: string;              // Nhân tộc, Ma tộc, Thú tộc, Elf, Dwarf, Long tộc...
  origin: string;            // Vùng đất & Gia cảnh xuất thân
  title: string;             // Danh hiệu (Hài nhi chuyển sinh, Pháp sư sơ cấp...)
  stats: CharacterStats;
  rawBaseStats?: CharacterStats; // Chỉ số gốc thuần túy chưa nhân buff thiên phú
  preRolledTalent?: string;
  magic: MagicSkills;
  swordsmanship: SwordSkills;
  progression?: CharacterProgression; // Hệ thống tiến trình & bình cảnh đột phá
  languages: string[];       // Nhân thần ngữ, Ma thần ngữ, Thú thần ngữ...
  bonds: Bond[];
  inventory: InventoryItem[];
  equipment: EquipmentSet;   // 11 ô trang bị cố định
  maxInventorySlots: number; // Mặc định 20 ô, có thể mở rộng
  specialTraits: string[];   // [Vô niệm chú], [Hồi ức tiền kiếp], [Yếu tố Laplace], etc.
  statusEffects: string[];   // Hiệu ứng trạng thái: Khỏe mạnh, Kiệt sức mana, Gãy xương, Mệt mỏi...
  completedMilestones?: string[]; // Danh sách các cột mốc cốt truyện đã hoàn thành
  isDead: boolean;
  deathReason?: string;
  combat?: CombatState;      // Trạng thái giao tranh hiện tại (nếu có)
  legacyNgPlusBonus?: string; // Kế thừa từ tiền kiếp (New Game Plus)
  butterflyEffects?: string[]; // Nhật ký các hiệu ứng cánh bướm ngầm đang tích tụ
  peakStoryProgression?: PeakStoryProgression; // Tiến trình cốt truyện đa tuyến đỉnh phong (từ tuổi 24 trở đi)
  sandbox?: SandboxProgression; // Hệ thống dữ liệu RPG Sandbox người chơi
  reputation?: CharacterReputationState; // Hệ thống danh tiếng & biệt danh dựa trên hành vi (Epithet & Regional Reputation)
  worldDiscovery?: WorldDiscoveryState; // Bản đồ thế giới sáu mặt & tiến trình khám phá
  activeQuest?: AdventurerQuest; // Nhiệm vụ đang nhận của Hội Mạo Hiểm Giả
  completedQuestsCount?: number; // Số lượng ủy thác mạo hiểm đã hoàn thành
  sevenGreatPowersMonument?: SevenGreatPowersState; // Bia đá Thất Đại Liệt Cường & tiến trình đoạt vị
}

export interface AdventurerQuest {
  id: string;
  title: string;
  rank: AdventurerRank;
  regionId: string;
  location: string;
  description: string;
  objective: string;
  rewardCoins: number;
  rewardSp: number;
  rewardKp: number;
  isExam?: boolean; // Bài kiểm tra sát hạch sinh tử để thăng hạng
  targetRank?: AdventurerRank;
  status: 'active' | 'completed' | 'failed';
  dangerLevel: 'safe' | 'moderate' | 'dangerous' | 'fatal';
}

export interface GreatPowerEntry {
  rank: number; // 1 -> 7
  title: string;
  name: string;
  alias: string;
  crestIcon: string;
  symbol: string;
  powerTier: PowerTier;
  description: string;
  usurpedByPlayer?: boolean;
  defeatConditions: string;
  specialWarning: string;
}

export interface SevenGreatPowersState {
  powers: GreatPowerEntry[];
  monumentVisited: boolean;
  playerRank: number | null; // null nếu chưa đoạt vị, 1..7 nếu đã đoạt vị
  playerPrestigeScore: number;
  lastUsurpationNews?: string;
}

export interface WorldDiscoveryState {
  currentRegionId: string;
  unlockedRegionIds: string[];
  decodedRuinIds: string[];
  collectedArtifactIds: string[];
  travelCount: number;
}

export type AdventurerRank = 'F' | 'E' | 'D' | 'C' | 'B' | 'A' | 'S';

export interface RegionalReputation {
  adventurerGuild: number; // -100 to +100: Công hội Phiêu lưu giả
  asuraNobility: number;   // -100 to +100: Giới Quý tộc Asura
  demonContinent: number;  // -100 to +100: Đại lục Ma giới
  millisChurch: number;    // -100 to +100: Giáo hội Millis
}

export interface CombatArchetypeTrack {
  quagmireCount: number;   // Khống chế địa hình / bùn lầy / quagmire
  berserkerCount: number;  // Cuồng bạo / chém giết không lùi bước
  sneakTrickCount: number; // Ám khí / bẫy rập / độc dược / mẹo Bắc Thần
  artilleryCount: number;  // Ma pháp hủy diệt tầm xa / pháo kích
  guardianCount: number;   // Thuần thủ / bảo vệ đồng đội / Thủy Thần phái
}

export interface KarmaTrack {
  heroicCount: number;     // Cứu dân lành / hào hiệp vô tư
  ruthlessCount: number;   // Đồ sát / cướp bóc / phản bội
  reclusiveCount: number;  // Đơn độc / ẩn tung tích
}

export interface EpithetDefinition {
  id: string;
  title: string;           // Tên danh xưng, VD: "Bùn Lầy", "Thánh Kiếm Buena"
  description: string;
  type: 'combat' | 'karma' | 'achievement' | 'legend';
  fearFactor: number;      // 0-100: Mức độ đe dọa (giảm 15-30% Đấu khí kẻ địch yếu hoặc khiến chúng tháo chạy)
  renownScore: number;     // Độ vang danh tổng quát
  shopDiscountPercent: number; // % giảm giá tại shop (-50 đến +30)
  attractChallengers?: boolean;// Kẻ háo danh / sát thủ tìm tới khiêu chiến
  guardInspectionRisk?: boolean;// Lính gác kiểm tra gắt gao / từ chối phục vụ
  flavorQuote?: string;
}

export interface CharacterReputationState {
  currentEpithet: string; // Biệt danh hiện tại (VD: "Bùn Lầy", "Cuồng Nhận", "Thánh Kiếm Buena")
  epithetTitle: string;   // Danh hiệu đầy đủ
  epithetDescription: string;
  epithetType: 'combat' | 'karma' | 'achievement' | 'legend';
  fearFactor: number;     // 0-100
  shopDiscountPercent: number;
  attractChallengers: boolean;
  guardInspectionRisk: boolean;
  epithetHistory: string[]; // Lịch sử các biệt danh từng nhận
  adventurerRank: AdventurerRank; // F -> S
  socialStanding: string; // Vị thế xã hội (Thường dân, Phiêu lưu giả Hạng B, Quý tộc hạ cấp, Tội phạm truy nã...)
  regional: RegionalReputation;
  combatTrack: CombatArchetypeTrack;
  karmaTrack: KarmaTrack;
  notableFeats: string[]; // Danh sách các chiến tích chấn động
}

export interface PeakStoryProgression {
  hitogamiInvestigationStage?: number; // 0..5 (Truy vết Sứ đồ Hitogami)
  magicArmorTechStage?: number;        // 0..5 (Nâng cấp Ma Đạo Khải Mk.II & Mk.Zero)
  orstedCouncilStage?: number;         // 0..5 (Hội đàm & Chiến lược Long Thần)
  familyLegacyStage?: number;          // 0..6 (Thế hệ kế thừa Greyrat: Lucy, Lara, Ars, Sieg)
  worldDiplomacyStage?: number;        // 0..5 (Ngoại giao Asura, Millis, Atofe, Kiếm Thần Điện)
  godRealmBreakthroughStage?: number;  // 0..5 (Đột phá cảnh giới Vương/Đế/Thần)
  ancientRuinsStage?: number;          // 0..4 (Khai phá Mê cung & Thần khí cổ đại)
  recentChoiceIds?: string[];          // Lịch sử các lựa chọn đã thực hiện để không lặp lại
}

export type SandboxCategory = 
  | 'explore'      // Thám hiểm & Du hành & Nhiệm vụ
  | 'combat'       // Chiến đấu & Hầm ngục & Lôi đài
  | 'cultivation'  // Tu luyện & Sáng tạo & Đột phá
  | 'faction'      // Thế lực & Bang phái
  | 'factions'     // Thế lực & Bang phái
  | 'companions'   // Chiêu mộ & Đồng đội
  | 'settlement'   // Xây dựng Căn cứ & Lãnh địa
  | 'trade'        // Thương nghiệp & Chế tạo & Đấu giá
  | 'seclusion'    // Bế quan tu luyện dài hạn
  | 'timeskip';    // Bế quan tu hành 1 năm

export interface SandboxFaction {
  id: string;
  name: string;
  description: string;
  reputation: number; // -100 (Thù địch) đến 100 (Minh chủ)
  tier: 'local' | 'regional' | 'continental';
}

export interface SandboxCompanion {
  id: string;
  name: string;
  role: 'swordsman' | 'mage' | 'healer' | 'rogue' | 'artificer' | 'beast';
  tier: PowerTier;
  loyalty: number; // 0-100
  trait: string;
  status: string;
}

export interface SandboxProgression {
  adventurerRank: 'F' | 'E' | 'D' | 'C' | 'B' | 'A' | 'S' | 'SS (Huyền Thoại)';
  reputationTitle: string;
  renownScore: number;
  strongholdName?: string;
  strongholdLevel?: number;
  dungeonDeepestFloor: number;
  arenaVictories: number;
  tradeEmpireValue: number;
  factions: SandboxFaction[];
  companions: SandboxCompanion[];
  unlockedRegions: string[];
}

export interface TurnChoice {
  id: string;
  label: string;
  actionText: string;
  riskLevel?: 'safe' | 'moderate' | 'dangerous' | 'fatal';
  category?: 'magic' | 'sword' | 'study' | 'social' | 'explore' | 'rest' | 'timeskip' | 'combat' | 'hunt' | 'trade';
  combatTactic?: 'counter' | 'rush' | 'kite_magic' | 'hybrid_magic' | 'feint_north' | 'retreat';
  combatBranch?: 'A_OFFENSE' | 'B_DEFENSE' | 'C_RETREAT' | 'P1_PROBING' | 'P3_VERDICT' | 'HEALING' | 'DEFENSE' | 'BUFF' | 'OFFENSE' | 'FLEE';
  combatRole?: CombatActionRole; // Chuẩn hóa vai trò: 'healing' | 'defense' | 'buff' | 'attack' | 'flee'
  combatSubCategory?: string; // Ví dụ: 'A1. Kỹ Năng Đã Học', 'Nhóm Hồi Phục & Trị Liệu', 'Nhóm Phòng Thủ', v.v.
  costMp?: number;            // Tiêu hao Mana
  costStamina?: number;       // Tiêu hao Thể lực
  costTouki?: number;         // Tiêu hao Đấu Khí
  offensiveGroup?: 'magic' | 'sword' | 'hybrid' | 'basic'; // Phân nhóm trong kho kỹ năng
  offensiveSubCategory?: 'skills' | 'basic' | 'custom';    // Cấp con của Mục A
  healHp?: number;            // Lượng Sinh lực hồi phục
  healStamina?: number;       // Lượng Thể lực hồi phục
  buffTouki?: number;         // Lượng Đấu Khí gia tăng tạm thời
  buffReflex?: number;        // Lượng Phản xạ/Nhanh nhẹn gia tăng
  damageDisplay?: string;     // Text hiển thị sát thương (VD: '85 - 110 DMG')
  estimatedDamage?: { min: number; max: number }; // Khoảng sát thương dự tính
  skillTier?: number;         // Cấp bậc kỹ năng: 1 (Sơ cấp) -> 7 (Thần cấp)
  skillTierName?: PowerTier;  // Tên phân cấp
  activityType?: 'story' | 'free'; // 'story' (Cốt truyện chính Mushoku Tensei) | 'free' (Hoạt động tự do)
  freeCategory?: 'training' | 'crafting' | 'power_up' | 'hunting' | 'research' | 'family' | 'timeskip'; // Phân loại hoạt động tự do
  isCanonChoice?: boolean;          // true: Chuẩn 100% nguyên tác cốt truyện; false: Khác nguyên tác (hệ quả bất ngờ / nguy hiểm)
  consequenceHint?: string;         // Gợi ý hệ quả / cảnh báo rủi ro (Ví dụ: "Hệ quả: Rủi ro đụng độ tử vong nếu thiếu chuẩn bị!")
  canonNote?: string;               // Ghi chú chi tiết bối cảnh chuẩn nguyên tác tiểu thuyết
  sandboxCategory?: SandboxCategory;// Phân loại Sandbox: explore | combat | cultivation | faction | trade | timeskip
}

export interface TurnLog {
  id: string;
  turnNumber: number;
  ageDisplay: string;
  location: string;
  playerAction: string;
  narration: string;         // Phần [DIỄN BIẾN & TÂM LÝ]
  rippleEffectText?: string; // Phần [HẬU QUẢ NGẦM / NHÂN QUẢ]
  statusSummary: string;     // Phần [BẢNG TRẠNG THÁI]
  combatHudText?: string;    // Phần [ TRẠNG THÁI CHIẾN ĐẤU ] (khi có giao tranh)
  equipmentSummaryText?: string; // Phần [ BẢNG TRANG BỊ ĐANG ĐEO ]
  progressionSummaryText?: string; // Phần [ BẢNG TIẾN TRÌNH & ĐỘT PHÁ CẤP BẬC ]
  reputationSummaryText?: string;  // Phần [ DANH TIẾNG & DANH XƯNG ]
  destinationSummaryText?: string; // Phần [ĐIỂM ĐẾN & DI CHUYỂN] / [VỊ TRÍ HIỆN TẠI]
  systemNotes?: string[];    // Các sự kiện hệ thống ghi nhận
  timestamp: number;
  dangerEncountered?: boolean;
}

export interface CheckpointData {
  character: Character;
  turnCount: number;
  logs: TurnLog[];
  summary: string;
  savedAtAge: number;
  savedLocation: string;
  savedTimestamp: number;
}

export interface GameState {
  character: Character;
  turnCount: number;
  logs: TurnLog[];
  currentChoices: TurnChoice[];
  checkpoint?: CheckpointData;
  hasStarted: boolean;
  isAiProcessing: boolean;
}

// Runtime placeholder exports to prevent Node.js ESM type-stripping export missing errors
export const Character = {};
export const TurnChoice = {};
export const TurnLog = {};
export const InventoryItem = {};
export const CombatState = {};
export const CraftingRecipe = {};
export const Opponent = {};
export const RegionalEcosystem = {};
export const MonsterProfile = {};
export const EquipmentSet = {};
export const GameState = {};
export const CheckpointData = {};

