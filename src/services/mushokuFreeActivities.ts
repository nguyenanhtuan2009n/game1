import type { Character, TurnChoice } from '../types/game.ts';

/**
 * ============================================================================
 * KHO HOẠT ĐỘNG TỰ DO (FREE ACTIVITIES & CULTIVATION ENGINE)
 * Tuyệt đối không liên quan đến mạch cốt truyện chính, người chơi có thể tự do
 * lựa chọn để tu luyện, cày cuốc, nâng cấp trang bị, chế tạo Ma Đạo Khải,
 * farm quái săn nguyên liệu và chăm sóc gia đình bất kỳ lúc nào!
 * ============================================================================
 */

export function generateFreeActivities(character: Character, turnNumber: number): TurnChoice[] {
  const age = character.stats.age;
  const seed = turnNumber * 17 + age * 11 + (character.stats.month || 1);
  const choices: TurnChoice[] = [];

  const armorStage = character.peakStoryProgression?.magicArmorTechStage || 0;
  const chantlessUnlocked = character.magic.chantless;
  const isAdult = age >= 15;
  const isMaster = age >= 24;

  // ==========================================================================
  // NHÓM 1: ⚔️ LUYỆN TẬP & KHỔ TU (Kiếm thuật 3 phái, Ma pháp 4 hệ, Đấu Khí)
  // ==========================================================================

  // 1.1 Khổ luyện Kiếm Thần Phái
  choices.push({
    id: `free_train_sword_god_${seed % 3}`,
    label: '⚔️ [Kiếm Thần Phái]: Luyện bộ pháp bứt tốc & Quang Chi Thái Đao',
    actionText: 'Rút kiếm vung 1,000 nhát chém chớp nhoáng theo kiếm lý Kiếm Thần Phái, tối ưu hóa tốc độ xuất kiếm đoạt mạng trong nửa chớp mắt.',
    activityType: 'free',
    freeCategory: 'training',
    category: 'sword',
    riskLevel: 'safe',
    costStamina: 15,
    buffTouki: 6,
    consequenceHint: 'Tăng tiến cảnh giới Kiếm Thần phái, mở rộng lượng Đấu Khí và tốc độ phản xạ.',
  });

  // 1.2 Khổ luyện Thủy Thần Phái
  choices.push({
    id: `free_train_water_god_${seed % 3}`,
    label: '🛡️ [Thủy Thần Phái]: Luyện thế thủ Lưu Đạo & Phản kích tuyệt đối',
    actionText: 'Hạ thấp trọng tâm, nhắm mắt lắng nghe tiếng gió, tập đón đỡ và chuyển hướng mọi lực va chạm từ vật thể lao tới theo Thủy Thần Phái.',
    activityType: 'free',
    freeCategory: 'training',
    category: 'sword',
    riskLevel: 'safe',
    costStamina: 12,
    buffTouki: 8,
    consequenceHint: 'Củng cố khả năng phòng ngự, tạo lợi thế phản kích sau khi hóa giải đòn đánh của địch.',
  });

  // 1.3 Khổ luyện Bắc Thần Phái
  choices.push({
    id: `free_train_north_god_${seed % 3}`,
    label: '🗡️ [Bắc Thần Phái]: Luyện mưu mẹo thực chiến & Kiếm thuật ứng biến',
    actionText: 'Tập luyện kỹ thuật ném cát, đổi thế cầm kiếm, tận dụng địa hình và phi đao bất ngờ theo triết lý thực dụng của Bắc Thần Phái.',
    activityType: 'free',
    freeCategory: 'training',
    category: 'sword',
    riskLevel: 'safe',
    costStamina: 10,
    buffReflex: 5,
    consequenceHint: 'Gia tăng độ linh hoạt trong chiến đấu, mở khóa các phương án ứng biến quái dị.',
  });

  // 1.4 Khổ luyện Ma Pháp Vô Niệm Chú / Nén Mana
  if (!chantlessUnlocked && age <= 10) {
    choices.push({
      id: 'free_train_chantless_early',
      label: '🔮 [Vô Niệm Chú]: Xả cạn bình chứa Mana trước khi ngủ để mở rộng dung lượng',
      actionText: 'Liên tục tụ giải ma pháp nước và lửa không niệm thần chú cho đến khi kiệt sức để mở rộng cực hạn bình chứa Mana.',
      activityType: 'free',
      freeCategory: 'training',
      category: 'magic',
      riskLevel: 'moderate',
      costMp: Math.max(10, Math.floor(character.stats.manaMax * 0.8)),
      consequenceHint: 'Giai đoạn vàng trước 10 tuổi: Giúp phình to bình chứa Mana gấp nhiều lần và mở khóa Vô niệm chú!',
    });
  } else {
    choices.push({
      id: `free_train_magic_elements_${seed % 4}`,
      label: '🔮 [Ma Pháp Tinh Thông]: Luyện nén áp suất Đạn Đá & Đầm Lầy sâu',
      actionText: 'Vận dụng tư duy vật lý nén viên đạn đất đá tới độ cứng của kim cương và xoay tròn với vận tốc siêu âm, đồng thời hóa lỏng mặt đất tạo đầm lầy trói chân.',
      activityType: 'free',
      freeCategory: 'training',
      category: 'magic',
      riskLevel: 'safe',
      costMp: 25,
      consequenceHint: 'Nâng cao độ chính xác, sát thương ma pháp tầm xa và khả năng kiểm soát Mana.',
    });
  }

  // 1.5 Khổ luyện Thân Thể & Đấu Khí (Touki)
  choices.push({
    id: `free_train_body_touki_${seed % 3}`,
    label: '💪 [Rèn Luyện Thể Chất]: Vác cự thạch, tắm thác & Kích hoạt màng Đấu Khí',
    actionText: 'Chạy việt dã 20km mang theo tảng đá nặng, ngâm mình dưới dòng thác buốt giá và kích hoạt dòng Đấu Khí bảo bọc từng thớ cơ bắp.',
    activityType: 'free',
    freeCategory: 'training',
    category: 'sword',
    riskLevel: 'safe',
    costStamina: 25,
    buffTouki: 12,
    consequenceHint: 'Tăng HP Max, Thể lực Max và độ dày của lớp Đấu Khí (Touki) bảo vệ thân thể.',
  });

  // ==========================================================================
  // NHÓM 2: 🛡️ CHẾ TẠO GIÁP & KHÍ GIỚI (MA ĐẠO KHẢI, GĂNG TAY ĐÁ, TRƯỢNG...)
  // ==========================================================================

  if (isAdult) {
    // 2.1 Chế tạo / Nâng cấp Ma Đạo Khải (Magic Armor Mk.I & Mk.II)
    if (armorStage === 0) {
      choices.push({
        id: 'free_craft_magic_armor_mk1',
        label: '🛡️ [Chế Tạo Giáp]: Cùng Zanoba & Cliff rèn đúc [Ma Đạo Khải Nhất Thức (Mk.I)]',
        actionText: 'Tập hợp quặng hợp kim ma thuật và lõi hấp thụ Mana, bắt đầu rèn đúc bộ Ma Đạo Khải Nhất Thức Mk.I khổng lồ sở hữu sức mạnh cấp Thần.',
        activityType: 'free',
        freeCategory: 'crafting',
        category: 'trade',
        riskLevel: 'moderate',
        costMp: 80,
        consequenceHint: 'Tạo ra Siêu Giáp Ma Đạo Mk.I: Tăng cực hạn HP Max, Đấu Khí và khả năng chống chịu các đòn đánh cấp Thần!',
      });
    } else if (armorStage === 1) {
      choices.push({
        id: 'free_craft_magic_armor_mk2',
        label: '🛡️ [Nâng Cấp Giáp]: Chế tạo [Ma Đạo Khải Nhị Thức (Mk.II)] thon gọn cơ động',
        actionText: 'Thu nhỏ cấu trúc giáp thành kích thước người mặc, gắn nẹp cường hóa Đấu Khí và cơ chế tiết kiệm tiêu hao Mana cho chiến đấu dài ngày.',
        activityType: 'free',
        freeCategory: 'crafting',
        category: 'trade',
        riskLevel: 'safe',
        costMp: 50,
        consequenceHint: 'Sở hữu bộ giáp gọn nhẹ Mk.II: Tăng mạnh độ Nhanh Nhẹn, Phản xạ né đòn và giảm tiêu hao Mana.',
      });
    } else {
      choices.push({
        id: 'free_craft_magic_armor_mk_zero',
        label: '🛡️ [Tuyệt Tác Giáp]: Lắp ráp [Ma Đạo Khải Đời 0 (Mk.Zero)] đối đầu Đấu Thần',
        actionText: 'Tích hợp toàn bộ tinh hoa công nghệ ma đạo Sharia, trang bị động cơ Mana áp suất cao và vũ khí Long Vương kiếm bản sao để chuẩn bị cho trận quyết chiến đỉnh cao.',
        activityType: 'free',
        freeCategory: 'crafting',
        category: 'trade',
        riskLevel: 'moderate',
        costMp: 120,
        consequenceHint: 'Hoàn thiện Ma Đạo Khải Tối Thượng Mk.0: Đỉnh cao công nghệ ma đạo thế giới Sáu Mặt!',
      });
    }

    // 2.2 Chế tạo Găng tay đá nén khí Gatling (Stone Cannon Gatling)
    choices.push({
      id: 'free_craft_gatling_gauntlet',
      label: '⚡ [Chế Tạo Khí Giới]: Rèn đúc [Găng Tay Phóng Đạn Đá Gatling Ma Thuật]',
      actionText: 'Chế tạo ổ xoay 6 nòng dẫn Mana gắn vào cổ tay Ma Đạo Khải, cho phép bắn liên thanh hàng chục viên đạn đá xoay tốc độ cao mỗi giây.',
      activityType: 'free',
      freeCategory: 'crafting',
      category: 'trade',
      riskLevel: 'safe',
      costMp: 40,
      consequenceHint: 'Trang bị Găng Gatling: Tăng cực đại sát thương ma pháp tầm trung và hỏa lực bắn phá diện rộng.',
    });

    // 2.3 Rèn đúc Khiên Chống Ma Thuật & Áo Choàng Bền Bỉ
    choices.push({
      id: 'free_craft_anti_magic_gear',
      label: '🛡️ [Khắc Ấn Phòng Hộ]: Đúc Khiên Hợp Kim Kháng Phép & Áo Choàng Da Rồng',
      actionText: 'Khắc trận pháp phản xạ ma lực lên mặt khiên hợp kim và phủ lớp vảy ma thú chịu nhiệt lên áo choàng để triệt tiêu các đòn đánh hiểm hóc.',
      activityType: 'free',
      freeCategory: 'crafting',
      category: 'trade',
      riskLevel: 'safe',
      consequenceHint: 'Tăng kháng ma pháp, giảm sát thương nguyên tố và nâng cao chỉ số phòng thủ.',
    });
  } else {
    // Thời niên thiếu: Chế tạo đũa phép, rèn gậy tập, chế thuốc giải độc
    choices.push({
      id: 'free_craft_young_tools',
      label: '🔨 [Chế Tác Dụng Cụ]: Tự nặn Tượng Ma Đạo và rèn đũa phép phụ trợ',
      actionText: 'Dùng ma pháp đất nặn các pho tượng tinh xảo để rèn luyện độ tỉ mỉ của Mana, đồng thời gắn lõi ma thạch vào cành sồi chế tác đũa phép phụ.',
      activityType: 'free',
      freeCategory: 'crafting',
      category: 'trade',
      riskLevel: 'safe',
      consequenceHint: 'Gia tăng khả năng kiểm soát Mana, kiếm thêm tiền từ việc bán tượng ma thuật.',
    });
  }

  // ==========================================================================
  // NHÓM 3: 🌟 NÂNG CẤP SỨC MẠNH & BẾ QUAN (Đột phá bình cảnh, Ma Nhãn, Căn cơ)
  // ==========================================================================

  // 3.1 Bế quan ngưng tụ Mana đột phá cảnh giới
  choices.push({
    id: `free_breakthrough_meditation_${seed % 3}`,
    label: '🧘 [Bế Quan Tu Luyện]: Tĩnh tọa ngưng tụ Mana, chuẩn bị đột phá cảnh giới mới',
    actionText: 'Ngồi kiết già trong phòng cách âm ma lực, tuần hoàn kinh mạch, nén chặt dòng Mana và Đấu Khí để phá bỏ bức tường bình cảnh sức mạnh.',
    activityType: 'free',
    freeCategory: 'power_up',
    category: 'magic',
    riskLevel: 'safe',
    buffTouki: 10,
    consequenceHint: 'Tích lũy Điểm Kỹ Năng (SP) và Điểm Tri Thức (KP), đẩy nhanh tiến trình thăng cấp từ Thánh lên Vương, Đế, Thần.',
  });

  // 3.2 Luyện tập và nâng cấp Ma Nhãn (Demon Eyes)
  if (character.progression?.demonEyes.foresightEye || isMaster) {
    choices.push({
      id: 'free_train_demon_eye',
      label: '👁️ [Khai Mở Ma Nhãn]: Rèn luyện Dự Tri Nhãn nhìn trước tương lai vài giây',
      actionText: 'Vận Mana kích hoạt con mắt quỷ, tập làm quen với bóng ảnh tương lai lao tới trước khi sự việc diễn ra để né tránh đòn đánh tuyệt đối.',
      activityType: 'free',
      freeCategory: 'power_up',
      category: 'magic',
      riskLevel: 'safe',
      buffReflex: 10,
      consequenceHint: 'Gia tăng cực đại sự Nhanh Nhẹn, Phản xạ né đòn và tỉ lệ né đòn chí mạng trong giao tranh.',
    });
  } else {
    choices.push({
      id: 'free_deepen_mana_core',
      label: '✨ [Củng Cố Căn Cơ]: Thanh lọc tạp chất kinh mạch, tôi luyện nguồn sinh mệnh',
      actionText: 'Dẫn dòng ma lực ấm áp tuần hoàn khắp ngũ tạng lục phủ, loại bỏ độc tố tích tụ và khai mở các huyệt đạo tiềm ẩn.',
      activityType: 'free',
      freeCategory: 'power_up',
      category: 'study',
      riskLevel: 'safe',
      healHp: 30,
      consequenceHint: 'Hồi phục thể trạng, xóa mỏi mệt và tăng vĩnh viễn giới hạn Sinh lực tối đa.',
    });
  }

  // ==========================================================================
  // NHÓM 4: 🐉 FARM QUÁI & THÁM HIỂM MÊ CUNG (Hầm ngục, Săn ma thú, Kiếm Xu)
  // ==========================================================================

  // 4.1 Khảo sát khu vực & Săn quái (Mở Hub Chiến Đấu)
  choices.push({
    id: 'free_hunt_combat_hub',
    label: '🐉 [Farm Quái]: Khảo sát khu vực xung quanh & Săn bắt ma thú thu thập chiến lợi phẩm',
    actionText: '[MỤC CHIẾN ĐẤU]: Khảo sát khu vực & Tìm kiếm kẻ địch/Quái vật để đi săn farm tài nguyên.',
    activityType: 'free',
    freeCategory: 'hunting',
    category: 'hunt',
    riskLevel: 'moderate',
    consequenceHint: 'Kích hoạt giao tranh với ma thú theo vùng: Nhận tiền xu Asura, quặng ma thạch, chiến lợi phẩm và kinh nghiệm thực chiến!',
  });

  // 4.2 Thám hiểm Mê Cung & Dọn dẹp Hầm Ngục Cổ Đại
  choices.push({
    id: `free_dungeon_dive_${seed % 3}`,
    label: '🗝️ [Thám Hiểm Mê Cung]: Tiến vào tầng sâu hang động càn quét bầy ma thú',
    actionText: 'Trang bị đuốc sáng và dao găm ma thuật, càn quét các đàn dơi hút máu, sói bóng đêm và nhện khổng lồ để thu thập lõi tinh thể ma pháp quý giá.',
    activityType: 'free',
    freeCategory: 'hunting',
    category: 'explore',
    riskLevel: 'dangerous',
    consequenceHint: 'Cơ hội thu hoạch lượng lớn Xu Asura và trang bị hiếm, có thể mất chút máu và thể lực.',
  });

  // 4.3 Nhận Ủy thác Mạo Hiểm Giả tại Hội
  choices.push({
    id: `free_guild_commission_${seed % 3}`,
    label: '📜 [Hội Mạo Hiểm Giả]: Nhận ủy thác hộ tống thương đoàn hoặc thảo phạt ma thú',
    actionText: 'Tới quầy tiếp tân nhận lệnh truy nã quái vật quấy nhiễu biên cương, vừa nâng cấp hạng thẻ mạo hiểm vừa kiếm tiền thù lao hậu hĩnh.',
    activityType: 'free',
    freeCategory: 'hunting',
    category: 'trade',
    riskLevel: 'moderate',
    consequenceHint: 'Kiếm được tiền xu Asura dồi dào, gia tăng danh tiếng và gắn kết đồng đội.',
  });

  // ==========================================================================
  // NHÓM 5: 🔮 NGHIÊN CỨU MA CỤ & HỢP TÁC (Cliff, Zanoba, Hybrid Magic)
  // ==========================================================================

  // 5.1 Thí nghiệm Ma Pháp Ghép (Hybrid Magic)
  choices.push({
    id: `free_hybrid_magic_lab_${seed % 3}`,
    label: '⚡ [Ma Pháp Ghép]: Thí nghiệm dung hợp Đầm Lầy Hóa Băng hoặc Tia Sét Điện Từ',
    actionText: 'Kết hợp ma pháp Thổ với Thủy tạo đầm lầy, sau đó lập tức phóng Hỏa và Phong tạo điện từ trường cực mạnh, phát triển các chiêu thức khắc chế đối thủ.',
    activityType: 'free',
    freeCategory: 'research',
    category: 'magic',
    riskLevel: 'safe',
    costMp: 30,
    consequenceHint: 'Lĩnh hội công thức ma pháp ghép mới, tối ưu hóa khả năng khống chế và sốc sát thương.',
  });

  // 5.2 Nghiên cứu Ma Cụ & Vòng Tròn Dịch Chuyển (Cliff & Zanoba)
  if (isAdult) {
    choices.push({
      id: 'free_magitech_research_cliff',
      label: '🔬 [Nghiên Cứu Ma Cụ]: Cùng Zanoba và Cliff giải mã vòng ma pháp dịch chuyển',
      actionText: 'Ngồi trong phòng thí nghiệm giải mã cấu trúc cổ tự dịch chuyển và vòng ma thuật giải trừ nguyền rủa, chuẩn bị mạng lưới di chuyển bảo mật.',
      activityType: 'free',
      freeCategory: 'research',
      category: 'study',
      riskLevel: 'safe',
      consequenceHint: 'Nâng cao Tri thức (KP), hoàn thiện công nghệ kết nối các vùng đất trên thế giới Sáu Mặt.',
    });
  }

  // ==========================================================================
  // NHÓM 6: 🏡 ĐỜI SỐNG THƯỜNG NHẬT & GIA ĐÌNH (Nấu ăn, Dạy dỗ con cái, Sum vầy)
  // ==========================================================================

  if (isMaster) {
    choices.push({
      id: `free_family_legacy_${seed % 3}`,
      label: '🏡 [Dạy Dỗ Con Cái]: Cầm tay dạy Lucy, Lara, Ars và Sieg luyện kiếm & ma pháp',
      actionText: 'Ra sân vườn Sharia cầm tay các con nhỏ hướng dẫn từng thế vung kiếm cơ bản và nguyên lý tụ mana không xướng ngôn trong tiếng cười ấm áp.',
      activityType: 'free',
      freeCategory: 'family',
      category: 'social',
      riskLevel: 'safe',
      healHp: 20,
      healStamina: 20,
      consequenceHint: 'Gắn kết sâu sắc tình thân gia đình, bồi dưỡng thế hệ cứu thế kế thừa, xóa bỏ mệt mỏi.',
    });

    choices.push({
      id: 'free_family_feast_sharia',
      label: '🍲 [Ẩm Thực Tiền Kiếp]: Trổ tài nấu mì Ramen và cơm cuộn chiêu đãi gia đình',
      actionText: 'Vào bếp trổ tài tái hiện các món ăn ngon của kiếp trước, cùng những người bạn đời Sylphie, Roxy, Eris và người thân thưởng thức bữa tối đầm ấm.',
      activityType: 'free',
      freeCategory: 'family',
      category: 'rest',
      riskLevel: 'safe',
      healHp: 50,
      healStamina: 50,
      consequenceHint: 'Hồi phục 100% Thể lực & Sinh lực, giải tỏa áp lực tinh thần, tăng điểm tình cảm với mọi người.',
    });
  } else {
    choices.push({
      id: 'free_family_bonding_young',
      label: '🏡 [Sum Vầy Gia Đình]: Trò chuyện, giúp đỡ việc nhà và ăn bữa cơm ấm cúng',
      actionText: 'Dành buổi tối quây quần bên người thân, phụ giúp làm việc nhà, cùng ăn bữa tối nóng hổi và cảm nhận hơi ấm thiêng liêng của gia đình.',
      activityType: 'free',
      freeCategory: 'family',
      category: 'social',
      riskLevel: 'safe',
      healHp: 30,
      healStamina: 30,
      consequenceHint: 'Hồi phục thể lực, giảm mệt mỏi, gia tăng mức độ gắn bó tình cảm với người thân.',
    });
  }

  // ==========================================================================
  // NHÓM 7: ⏩ TUA NHANH 1 NĂM (BẾ QUAN TU LUYỆN CHUYÊN SÂU)
  // ==========================================================================
  choices.push({
    id: 'timeskip_year',
    label: `⚡ [Tua Nhanh 1 Năm]: Bế quan tu luyện chuyên sâu tiến tới ${age + 1} tuổi`,
    actionText: `Tua nhanh 1 năm: Bế quan tu luyện chuyên sâu để tiến tới ${age + 1} tuổi.`,
    activityType: 'free',
    freeCategory: 'timeskip',
    category: 'timeskip',
    riskLevel: 'safe',
    consequenceHint: 'Tăng 1 tuổi, tăng vọt HP Max, MP Max, Đấu Khí và tiến độ luyện tập mà không chịu rủi ro tử vong.',
  });

  return choices;
}
