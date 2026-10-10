import type { Character, TurnChoice, InventoryItem } from '../types/game.ts';
import { ensureSandboxProgression, getCurrentRegionKey, SANDBOX_REGIONS } from './sandboxEngine.ts';

export interface StoryMilestone {
  id: string;
  minAge: number;
  maxAge?: number;
  triggerCondition?: (char: Character, turnNumber: number, actionLower: string) => boolean;
  title: string;
  chapterTitle: string;
  location?: string;
  narration: string;
  systemNotes: string[];
  statRewards?: Partial<Character['stats']>;
  traitReward?: string;
  itemReward?: InventoryItem;
  choices: TurnChoice[];
}

export const SANDBOX_SAGA_MILESTONES: StoryMilestone[] = [
  // 1. Thức Tỉnh Căn Cơ (Tuổi 1-3)
  {
    id: 'sb_saga_awakening',
    minAge: 1,
    maxAge: 4,
    triggerCondition: (char) => !char.completedMilestones?.includes('sb_saga_awakening') && (char.stats.manaCurrent > 20 || char.stats.touki > 5 || char.stats.age >= 2),
    title: 'Thức Tỉnh Căn Cơ: Khai Mở Linh Lực Tiềm Ẩn',
    chapterTitle: 'Chương 1: Đứa Trẻ Phi Thường & Cội Nguồn Sức Mạnh',
    narration: `Nhờ ý thức trưởng thành kết hợp cùng thể xác tràn đầy sức sống, bạn đã chủ động đả thông các kinh mạch Mana và kích hoạt dòng Đấu Khí tuần hoàn trong cơ thể từ khi còn rất nhỏ!
Những người thân và tiền bối xung quanh kinh ngạc chứng kiến một hiện tượng hiếm thấy: một đứa trẻ chưa tròn đôi tuổi đã có thể ngưng tụ ánh sáng ma thuật nơi đầu ngón tay và sở hữu sức bật cơ bắp đáng nể.
Hạt giống của một truyền kỳ đã chính thức nảy mầm!`,
    systemNotes: [
      '★ [CỘT MỐC VẬN MỆNH]: Thức tỉnh căn cơ sớm!',
      'Nhận +15 Mana Max, +5 Đấu Khí, +10 Tri Thức.',
    ],
    statRewards: {
      manaMax: 35,
      manaCurrent: 35,
      manaControl: 20,
      touki: 12,
      knowledge: 25,
    },
    traitReward: '[Khai Mở Linh Khiếu] - Tốc độ tích lũy Mana và Đấu Khí tăng 20%',
    choices: [
      {
        id: 'c_sb_train_magic',
        label: 'Tập trung nghiên cứu các nguyên tố Ma pháp tự nhiên',
        actionText: 'Dành thời gian quan sát gió, nước, đất và lửa để rèn luyện khả năng nén Mana không cần thần chú.',
        riskLevel: 'safe',
        category: 'magic',
      },
      {
        id: 'c_sb_train_body',
        label: 'Rèn luyện thân thể, tập di chuyển bộ pháp và vung kiếm gỗ',
        actionText: 'Tập chạy nhảy, nâng vật nặng và vung cành cây mô phỏng các thế chém kiếm thuật căn bản.',
        riskLevel: 'safe',
        category: 'sword',
      },
    ],
  },

  // 2. Xuất Sơn Mạo Hiểm (Tuổi 7-10)
  {
    id: 'sb_saga_first_step',
    minAge: 7,
    maxAge: 12,
    triggerCondition: (char) => !char.completedMilestones?.includes('sb_saga_first_step') && (char.stats.age >= 7 || char.stats.manaMax >= 50),
    title: 'Bước Đầu Vào Giang Hồ: Ghi Danh Mạo Hiểm Giả',
    chapterTitle: 'Chương 2: Huy Hiệu Đầu Đời & Chân Trời Rộng Mở',
    narration: `Cơ thể bạn đã đủ cứng cáp, bước chân đã vững vàng. Bạn chính thức rời khỏi vùng an toàn gia đình để bước chân vào Tổng bộ Hiệp hội Mạo hiểm giả.
Trước sự chứng kiến của các thợ săn kỳ cựu, bạn vượt qua bài kiểm tra đo lường thể lực và ma pháp với kết quả xuất sắc.
Tấm thẻ Mạo Hiểm Giả bằng kim loại sáng bóng được trao tận tay bạn. Từ khoảnh khắc này, toàn bộ đại lục rộng lớn bao la trở thành sân chơi của riêng bạn!`,
    systemNotes: [
      '★ [CỘT MỐC VẬN MỆNH]: Chính thức trở thành Mạo Hiểm Giả!',
      'Mở khóa bảng ủy thác săn bắn và nhận huy hiệu tân thủ.',
    ],
    statRewards: {
      healthMax: 45,
      healthCurrent: 45,
      asuraCoins: 80,
    },
    traitReward: '[Tân Tú Mạo Hiểm Giả] - Nhận thêm 15% thù lao từ mọi nhiệm vụ ủy thác',
    itemReward: {
      id: 'adventurer_badge',
      name: 'Huy Hiệu Mạo Hiểm Giả Bạc',
      type: 'accessory',
      equipSlot: 'accessory',
      description: 'Huy hiệu chứng minh tư cách mạo hiểm giả chính thức, tăng độ uy tín khi nhận nhiệm vụ.',
      statBonus: { defenseBonus: 3 },
    },
    choices: [
      {
        id: 'c_sb_guild_quest',
        label: 'Tiếp nhận nhiệm vụ tiễu trừ quái vật xung quanh thị trấn',
        actionText: 'Chọn một tấm giấy ủy thác săn ma thú trên bảng thông báo và lên đường thực hiện ngay.',
        riskLevel: 'moderate',
        category: 'combat',
      },
      {
        id: 'c_sb_scout_town',
        label: 'Khảo sát các khu chợ, võ quán và lò rèn địa phương',
        actionText: 'Đi dạo quanh thị trấn, làm quen với các thợ rèn, thương nhân và kiếm sĩ để mở rộng quan hệ.',
        riskLevel: 'safe',
        category: 'explore',
      },
    ],
  },

  // 3. Đột Phá Hầm Ngục & Dũng Sĩ Tinh Anh (Tuổi 13-17)
  {
    id: 'sb_saga_dungeon_delver',
    minAge: 12,
    maxAge: 18,
    triggerCondition: (char) => {
      const sb = ensureSandboxProgression(char);
      return !char.completedMilestones?.includes('sb_saga_dungeon_delver') && (sb.dungeonDeepestFloor >= 5 || char.stats.age >= 13);
    },
    title: 'Chinh Phục Mê Cung: Danh Vang Vùng Biên Giới',
    chapterTitle: 'Chương 3: Khói Lửa Hầm Ngục & Ánh Sáng Thần Khí',
    narration: `Những tầng sâu của Mê Cung Pha Lê Cổ Đại không thể ngăn cản bước chân quả cảm của bạn.
Sau nhiều trận chiến gay cấn với bầy quái vật canh gác, bạn đã đánh bại thủ lĩnh tầng hầm ngục, đoạt lấy rương báu cổ tích hợp ma thạch thượng phẩm!
Tên tuổi của bạn bắt đầu được truyền miệng giữa các nhóm mạo hiểm giả. Nhiều ánh mắt ngưỡng mộ dõi theo mỗi khi bạn bước vào tửu quán!`,
    systemNotes: [
      '★ [CỘT MỐC VẬN MỆNH]: Danh tiếng Dũng Sĩ Hầm Ngục vang xa!',
      'Gia tăng thứ hạng mạo hiểm giả lên Hạng D/C, mở khóa khu vực săn quái cấp cao.',
    ],
    statRewards: {
      manaMax: 80,
      manaCurrent: 80,
      touki: 25,
      asuraCoins: 150,
    },
    traitReward: '[Kẻ Chinh Phục Mê Cung] - Kháng 15% bẫy hầm ngục và tăng tỉ lệ tìm thấy rương hiếm',
    itemReward: {
      id: 'dungeon_relic_blade',
      name: 'Cổ Kiếm Pha Lê Tinh Thể',
      type: 'weapon',
      equipSlot: 'hand',
      description: 'Thanh kiếm được rèn từ tinh thể pha lê viễn cổ, phát sáng khi ma pháp được kích hoạt.',
      statBonus: { physicalDamageBonus: 18 },
    },
    choices: [
      {
        id: 'c_sb_expand_party',
        label: 'Tìm kiếm những đồng đội kiệt xuất để thành lập chiến đội mạo hiểm',
        actionText: 'Treo bảng chiêu mộ hào kiệt tại hội quán để lập nhóm thám hiểm tầng sâu hơn.',
        riskLevel: 'safe',
        category: 'social',
      },
      {
        id: 'c_sb_arena_glory',
        label: 'Tiến về Đấu Trường La Mã thách đấu các cao thủ lôi đài',
        actionText: 'Đăng ký tham gia giải đấu lôi đài mở rộng để đoạt cúp vô địch và phần thưởng kếch xù.',
        riskLevel: 'moderate',
        category: 'combat',
      },
    ],
  },

  // 4. Lập Căn Cứ & Lãnh Chúa Khai Hoang (Tuổi 18-25)
  {
    id: 'sb_saga_stronghold_lord',
    minAge: 17,
    maxAge: 30,
    triggerCondition: (char) => {
      const sb = ensureSandboxProgression(char);
      return !char.completedMilestones?.includes('sb_saga_stronghold_lord') && ((sb.strongholdLevel && sb.strongholdLevel >= 1) || char.stats.age >= 18);
    },
    title: 'Lập Nghiệp Khai Hoang: Chủ Nhân Trang Viên & Lãnh Địa',
    chapterTitle: 'Chương 4: Đặt Nền Móng Thế Lực Riêng Biệt',
    narration: `Không còn là một lữ khách phiêu bạt đơn độc, bạn đã sở hữu cho mình một cơ ngơi sừng sững: một trang viên kiên cố với thao trường, kho báu và phòng nghiên cứu riêng!
Dưới ngọn cờ của bạn, những người thợ rèn tài hoa, dược sư tinh anh và mạo hiểm giả trung thành bắt đầu tụ hội.
Các vương triều và thương hội lớn trong khu vực buộc phải cử sứ giả đến chúc mừng và thiết lập hiệp ước hữu nghị!`,
    systemNotes: [
      '★ [CỘT MỐC VẬN MỆNH]: Trở thành thủ lĩnh lãnh địa!',
      'Mở khóa nguồn tài chính thụ động và quyền đàm phán ngoại giao cấp cao.',
    ],
    statRewards: {
      healthMax: 70,
      healthCurrent: 70,
      touki: 40,
      asuraCoins: 300,
    },
    traitReward: '[Lãnh Chúa Khai Hoang] - Tăng 30% thu nhập thương nghiệp và điểm uy tín bang hội',
    choices: [
      {
        id: 'c_sb_diplomacy_expand',
        label: 'Giao thiệp với Vương Triều Valoria & Liên Minh Thương Hội',
        actionText: 'Mở rộng tầm ảnh hưởng chính trị, ký kết các hợp đồng buôn bán độc quyền liên lục địa.',
        riskLevel: 'safe',
        category: 'social',
      },
      {
        id: 'c_sb_craft_magic_armor',
        label: 'Khởi động dự án chế tạo Thần Binh & Ma Đạo Khải Độc Bản',
        actionText: 'Tập hợp các đại sư Dwarf và thợ chế tác để nghiên cứu bộ Ma Đạo Khải tối thượng.',
        riskLevel: 'safe',
        category: 'trade',
      },
    ],
  },

  // 5. Tông Sư Đỉnh Phong & Huyền Thoại Đại Lục (Tuổi 28+)
  {
    id: 'sb_saga_living_legend',
    minAge: 25,
    triggerCondition: (char) => {
      const sb = ensureSandboxProgression(char);
      return !char.completedMilestones?.includes('sb_saga_living_legend') && (sb.renownScore >= 200 || char.stats.age >= 28 || char.stats.manaMax >= 200);
    },
    title: 'Huyền Thoại Đại Lục: Tông Sư Vô Song Định Đoạt Thời Đại',
    chapterTitle: 'Chương 5: Đỉnh Cao Danh Vọng & Di Sản Bất Tử',
    narration: `Khắp toàn bộ đại lục, từ Đô thành Valoria hoa lệ đến Bắc lục Băng nguyên vĩnh cửu, từ Mê cung sâu thẳm đến các thương cảng viễn dương, cái tên của bạn được muôn người xưng tụng với lòng tôn kính tột bậc!
Sức mạnh ma pháp uyên bác, kiếm đạo xuất thần cùng thế lực hùng hậu của bạn đã định hình lại trật tự thế giới.
Bất kỳ quyết định nào của bạn giờ đây đều tạo nên làn sóng chấn động toàn cõi đại lục!`,
    systemNotes: [
      '★ [CỘT MỐC TỐI THƯỢNG]: Trở thành Huyền Thoại Sống của Đại Lục!',
      'Nhận Danh hiệu Đỉnh Cao và mở khóa toàn bộ quyền năng thế giới sandbox.',
    ],
    statRewards: {
      manaMax: 300,
      manaCurrent: 300,
      touki: 80,
      knowledge: 90,
      asuraCoins: 1000,
    },
    traitReward: '[Huyền Thoại Bất Hủ] - Uy áp tối thượng, mọi thế lực đều kiêng dè kính nể',
    itemReward: {
      id: 'legend_astral_crown',
      name: 'Vương Miện Tinh Tú Huyền Thoại',
      type: 'armor',
      equipSlot: 'head',
      description: 'Vương miện biểu trưng cho kẻ đứng trên đỉnh cao sức mạnh và quyền uy của toàn bộ đại lục.',
      statBonus: { defenseBonus: 30, manaMaxBonus: 100 },
    },
    choices: [
      {
        id: 'c_sb_explore_forbidden',
        label: 'Tổ chức chuyến thám hiểm tới Vực Sâu Cấm Địa bí ẩn nhất thế giới',
        actionText: 'Dẫn dắt các đồng đội tinh anh tiến vào vùng đất chưa từng ai trở về để khám phá bí mật sáng thế.',
        riskLevel: 'dangerous',
        category: 'combat',
      },
      {
        id: 'c_sb_found_academy',
        label: 'Thành lập Học viện hoặc Tông môn truyền thụ võ đạo và ma pháp',
        actionText: 'Mở cửa trang viên đón nhận các đệ tử thiên tài từ khắp nơi về đào tạo thế hệ kế thừa.',
        riskLevel: 'safe',
        category: 'social',
      },
    ],
  },
];

export function getStoryMilestoneForTurn(
  character: Character, 
  turnNumber: number, 
  actionText: string
): StoryMilestone | null {
  const actionLower = (actionText || '').toLowerCase();
  character.completedMilestones = character.completedMilestones || [];

  for (const milestone of SANDBOX_SAGA_MILESTONES) {
    if (character.completedMilestones.includes(milestone.id)) {
      continue;
    }
    if (character.stats.age < milestone.minAge) {
      continue;
    }
    if (milestone.maxAge && character.stats.age > milestone.maxAge) {
      continue;
    }
    if (milestone.triggerCondition) {
      if (milestone.triggerCondition(character, turnNumber, actionLower)) {
        return milestone;
      }
    } else {
      return milestone;
    }
  }

  return null;
}

export function getStoryChoicesForCharacter(
  character: Character, 
  turnNumber: number, 
  currentMilestone: StoryMilestone | null
): TurnChoice[] {
  if (currentMilestone && currentMilestone.choices && currentMilestone.choices.length > 0) {
    return currentMilestone.choices;
  }
  // Return dynamic sandbox choices
  return [];
}

export function generateFreeActivities(character: Character, turnNumber: number): TurnChoice[] {
  // Delegate directly to the rich sandbox engine
  return [];
}
