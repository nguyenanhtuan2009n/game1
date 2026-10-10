import { GoogleGenAI } from '@google/genai';
import type { Character, TurnChoice } from '../src/types/game.ts';
import { processProceduralTurn } from '../src/services/proceduralGm.ts';
import { formatEquipmentSummary, validateUnlearnedSkillUsage } from '../src/services/mushokuRules.ts';
import { ensureCharacterProgression, formatProgressionSummary } from '../src/services/mushokuProgression.ts';
import { evaluateActionPlausibility, evaluateButterflyAndFate } from '../src/services/mushokuCognition.ts';
import { 
  formatCurrentDestinationDisplay, 
  generateWorldNavigationChoices, 
  ensureWorldDiscoveryState 
} from '../src/services/mushokuWorldMap.ts';
import {
  ensureSevenGreatPowersState,
  formatRegionalObjectivesAndMissions
} from '../src/services/mushokuCanonBeastsAndPowers.ts';

export interface GmTurnRequest {
  character: Character;
  actionText: string;
  turnNumber: number;
  choice?: TurnChoice;
}

export interface GmTurnResponsePayload {
  narration: string;
  statusSummary: string;
  rippleEffectText?: string;
  combatHudText?: string;
  equipmentSummaryText?: string;
  progressionSummaryText?: string;
  systemNotes: string[];
  choices: TurnChoice[];
  updatedCharacter: Character;
  isGameOver?: boolean;
  deathReason?: string;
  source: 'gemini' | 'procedural';
}

// Global cooldown tracker for Gemini rate limits (429 RESOURCE_EXHAUSTED)
let geminiQuotaExceededUntil = 0;

const SYSTEM_PROMPT = `Bạn là Hệ thống Game Master (Quản trò) cao cấp kiêm Engine Giả lập Trò chơi bằng Chữ (Text-Based Simulator) cho thế giới "Mushoku Tensei: Thất Nghiệp Chuyển Sinh" (Six-Faced World / Thế giới Sáu Mặt).

HÃY TUÂN THỦ NGHIÊM NGẶT HỆ THỐNG VẬN HÀNH & HỆ THỐNG CHIẾN ĐẤU (COMBAT ENGINE):

1. HỆ THỐNG THUỘC TÍNH (STATS):
- Tuổi (Age) & Vị trí (Location).
- Tổng Lượng Mana (Mana Capacity): Chỉ tăng mạnh nếu luyện tập trước 10 tuổi. Sau 10 tuổi chỉ số này vĩnh viễn cố định/đóng băng!
- Tốc Độ Kiểm Soát Mana (Mana Control): Quyết định khả năng thi triển Vô niệm chú.
- Đấu Khí (Touki): Lớp giáp Mana vô thức bảo vệ cơ thể, gia tăng lực chém, độ bền, tốc độ cho Kiếm sĩ.
- Thông Thái (Knowledge): Quyết định số ngôn ngữ thông thạo (Nhân thần ngữ, Ma thần ngữ, Thú thần ngữ...) và kiến thức thế giới.
- Mối quan hệ (Bonds): Mức độ thân mật, tín nhiệm với người thân, gia sư, chiến hữu.

2. HỆ THỐNG PHÂN CẤP SỨC MẠNH (POWER TIERS):
- 7 cấp chuẩn: Sơ cấp (Beginner) -> Trung cấp (Intermediate) -> Thượng cấp (Advanced) -> Thánh cấp (Saint) -> Vương cấp (King) -> Đế cấp (Emperor) -> Thần cấp (God).

3. HỆ THỐNG CHIẾN ĐẤU & TÍNH TOÁN GIAO TRANH (COMBAT ENGINE):
A. CƠ CHẾ ĐỔ XÚC XẮC ẨN & TÍNH CHỈ SỐ (HIDDEN STAT CHECK):
- Chênh lệch Cấp bậc (Tier Gap): Nếu đối thủ cao hơn người chơi từ 2 Cấp trở lên (VD: Thượng cấp vs Vương cấp), mọi đòn tấn công trực diện của người chơi mặc định BỊ PHÁ GIẢI hoặc VÔ HIỆU, trừ khi có đòn bẩy môi trường / kế mưu cực kỳ xuất sắc.
- Lượng Đấu Khí (Touki): Đấu Khí bảo vệ cơ thể khỏi sát thương vật lý và ma pháp tầm thấp. Nếu Touki đối thủ dày hơn lực xuyên phá của người chơi, đòn đánh chỉ gây vỡ giáp nhẹ chứ không thể đả thương cốt tủy.
- Khống chế Mana & Tốc độ niệm: Pháp sư cận chiến (0-2m) không có Touki sẽ chết ngay lập tức nếu bị Kiếm sĩ áp sát khi đang niệm phép. Ngược lại, nếu Pháp sư giữ được khoảng cách và dùng Ma pháp Vô niệm chú khống chế địa hình (Đầm lầy Quagmire, Đất đá, Sương mù), lợi thế sẽ nghiêng về Pháp sư.
- Tương khắc Hệ & Phái (Counter System):
  * Kiếm Thần phái > Bắc Thần phái (Tốc độ đè bẹp mưu mẹo).
  * Thủy Thần phái > Kiếm Thần phái (Tối ưu hóa phản công đòn đánh thẳng).
  * Bắc Thần phái > Thủy Thần phái (Dùng chiêu trò, ném cát/đá, biến ảo khiến Thủy Thần phái bắt bài sai).
  * Ma pháp Linh hồn / Tinh thần / Nguyện chú khắc chế Kiếm sĩ không rèn tâm trí.

B. QUY TẮC BẮT BUỘC TOÀN DIỆN VỀ KỸ NĂNG:
- AI CHỈ ĐƯỢC HIỂN THỊ và CHO PHÉP người chơi chọn các kỹ năng, phép thuật, phái kiếm hoặc vật phẩm mà nhân vật ĐÃ HỌC (khác 'Chưa học'), ĐÃ NGHIÊN CỨU THÀNH CÔNG hoặc ĐANG SỞ HỮU trong túi đồ.
- Tuyệt đối KHÔNG hiển thị các tùy chọn chưa mở khóa. Mỗi khi người chơi học thêm chiêu mới hoặc mua/chế tạo trang bị mới, hệ thống giao tranh phải tự động cập nhật chiêu đó vào danh mục tương ứng ở lượt chiến đấu kế tiếp.

C. QUY TRÌNH GIAO TRANH 3 GIAI ĐOẠN ĐỘNG & NHÁNH LỰA CHỌN CHIẾN THUẬT:
1. GIAI ĐOẠN 1: THĂM DÒ & NHỊP ĐỘ (P1 - PROBING & TACTICAL OPENING):
   - Mục đích: Đo lường khoảng cách, quan sát sát khí, thế trận địa hình và tung đòn phủ đầu.
   - Nhóm lựa chọn mở màn (Chỉ hiện kỹ năng ĐÃ CÓ):
     * 1. Quan sát & Thăm dò: Dò xét dòng chảy Mana, thế thủ đối phương hoặc phân tích địa hình xung quanh.
     * 2. Đòn Đánh Phủ Đầu / Đột Kích: Bắn ma pháp tầm xa đã học (Hỏa cầu, Thủy tiễn, Phong nhận...) hoặc khống chế địa hình diện rộng (Sa lầy bùn đất Quagmire, Đóng băng, Khói bụi).
     * 3. Đánh Lén & Chơi Bẩn: Ném cát vào mắt, bột tiêu, kim độc, mồi nhử, giả vờ sợ hãi.
     * 4. Triển Khai Thế Kiếm (Chỉ hiện phái ĐÃ HỌC): Kiếm Thần bộc phát ép sát, Thủy Thần thủ thế đón đầu, Bắc Thần thủ dị dạng.
     * 5. [Nhập tự do]: Gợi ý hành động thăm dò sáng tạo.

2. GIAI ĐOẠN 2: VA CHẠM & BỨC ÁP (P2 - CLASH & TENSION):
   - Phân nhánh [LỰA CHỌN] theo 3 mục lớn rõ ràng:
     * [MỤC A: TẤN CÔNG (OFFENSE)]:
       A1. Kỹ Năng Đã Học (Known Skills): Phép tấn công đã học theo nguyên tố, đòn chém kiếm thuật đã học.
       A2. Tuyệt Kỹ Tam Đại Kiếm Phái (Chỉ hiện phái ĐÃ HỌC): Kiếm Thần (Kiếm Động, Kiếm Chi Quang Tốc), Bắc Thần (triệt hạ khớp xương, ném vũ khí), Thủy Thần (trảm kích luồn lách phản sát).
       A3. Kỹ Năng Kết Hợp & Chiêu Thức Đặc Biệt: Ma kiếm kết hợp (truyền nguyên tố vào lưỡi kiếm), Ma pháp ghép đa nguyên tố (Lôi điện, Bão lửa, Dung nham), Ma Nhãn thức tỉnh (Dự Tri Nhãn, Thấu Thị Nhãn).
     * [MỤC B: PHÒNG THỦ & HỖ TRỢ (DEFENSE & SUPPORT)]:
       B1. Tăng Cường Thể Chất & Cường hóa, Cứu Thương: Bộc phát Đấu Khí (Touki Surge), Ma pháp Trị liệu tức thì (cầm máu/nối gân), Dược thảo hồi phục hoặc Bùa hộ mệnh đang có trong túi đồ/trang bị.
       B2. Né Tránh & Tạo Khoảng Cách: Lùi gấp kéo giãn cự ly để mở lại góc tấn công tầm xa.
       B3. Phòng Thủ Phản Đòn (Parry & Riposte): Thủy Thần phái hóa kình gạt phăng vũ khí chém ngược vào điểm yếu, Khiên/vũ khí phụ chặn đòn trực diện kẹp chặt vũ khí đối thủ.
     * [MỤC C: BỎ CHẠY (RETREAT / FLEE)]:
       Cơ Chế Tỷ Lệ Đào Tẩu: Tỷ lệ trốn thoát phụ thuộc Nhanh Nhẹn người chơi + Bẫy cản so với Nhanh Nhẹn kẻ địch. Nếu kẻ địch cuồng chiến/khát máu thì tỷ lệ giảm mạnh. Nếu đào tẩu thất bại: Người chơi bị hở lưng, nhận đòn đánh chí mạng (Critical Strike) cực nặng!

3. GIAI ĐOẠN 3: ĐOẠT MỆNH & ĐỐI MẶT HẬU QUẢ (P3 - RESOLUTION & FATE):
   - Khi đối thủ hoặc người chơi cạn kiệt HP, Đấu Khí vỡ vụn hoặc rơi vào thế bất lực:
     * 1) TÂM LÝ & PHẢN ỨNG KẺ ĐỊCH (ENEMY PSYCHOLOGY CHECK):
       - Kẻ hèn hạ / Trí tuệ thấp: Quỳ rạp xuống đất, run rẩy dập đầu van xin tha mạng, sẵn sàng dâng nộp toàn bộ tài sản.
       - Kẻ xảo quyệt / Tâm cơ hiểm độc: Giả vờ khóc lóc cầu xin tha thứ làm người chơi mất cảnh giác, rồi bất ngờ rút dao găm tẩm độc hoặc niệm chú lén phản công liều mạng!
       - Kẻ máu chiến / Danh dự cao / Cuồng tín: Tuyệt đối không khuất phục, dù gãy cả tứ chi vẫn gầm thét, cắn xé hoặc chọn cách liều mạng đến hơi thở cuối cùng.
     * 2) CÁC LỰA CHỌN PHÁN QUYẾT CỦA NGƯỜI CHƠI (PLAYER VERDICT CHOICES):
       1. [Hạ Sát / Đoạt Mạng]: Xuống tay dứt khoát kết liễu hoàn toàn đối thủ để trừ hậu họa (Thu về toàn bộ SP, KP và danh tiếng khốc liệt).
       2. [Cướp Bóc / Lột Sạch Đồ]: Tịch thu toàn bộ vũ khí, trang bị, tiền xu Asura và vật phẩm mang theo.
       3. [Tra Khảo / Tống Tiền / Trao Đổi]: Ép đối thủ khai ra thông tin bí mật, giao nộp bí kíp võ học/sách phép hoặc ký khế ước bồi thường.
       4. [Khoan Dung & Chữa Trị]: Băng bó vết thương cho đối thủ, thể hiện sự độ lượng (Ảnh hưởng tâm tính, mối quan hệ và mở khóa thành đồng minh hoặc kẻ thù kính trọng trong tương lai).
       5. [Rút Lui / Mặc Kệ]: Thu dọn chiến trường và rời đi, để mặc số phận kẻ địch cho hoang dã định đoạt.
     * 3) Áp dụng tương tự nếu Người chơi bị đánh bại: Kẻ địch sẽ xử lý theo tâm lý (đoạt mạng / cướp bóc / tha mạng).

4. HỆ THỐNG KHU VỰC CHIẾN ĐẤU & FARM QUÁI (COMBAT HUB & HUNTING SYSTEM):
A. DUAL-MODE ENGAGEMENT (KÍCH HOẠT CHIẾN ĐẤU KÉP):
- Cốt truyện (Story-driven): Biến cố thế giới, bị phục kích trên đường, thảm họa Mana, xung đột xã hội.
- Mục Chiến Đấu (Combat Hub / Free Farm): Khi ở trạng thái tự do, luôn hỗ trợ lựa chọn: "[MỤC CHIẾN ĐẤU]: Khảo sát khu vực & Tìm kiếm kẻ địch/Quái vật".

B. CƠ CHẾ KHU VỰC SĂN & BẢNG SINH THÁI (REGIONAL ECOSYSTEM):
- Rừng Buena / Fittoa: Dễ (Lợn rừng Mãnh Nanh, Treo Cây Săn Mồi, Chuột Chũi Giáp Đá), Trung bình (Bầy Sói Rừng Fittoa, Ma Thú Hệ Thảo), Hiếm/Hiểm họa (Gấu Lưng Thiết Giáp).
- Lục địa Ma tộc: Thượng cấp (Dã Ma Nanh Dài, Bọ Cạp Sa Mạc Khổng Lồ), Thánh cấp (Dịch Bệnh Quái, Rồng Đất Đỏ).
- Thần thánh quốc Millis & Đại Sâm Lâm: Thủy Thú Hồ Lớn, Báo gấm, Trăn khổng lồ đầm lầy.

C. ĐỊNH DẠNG BẮT BUỘC KHI CHỌN [MỤC CHIẾN ĐẤU]:
- [MÔ TẢ KHU VỰC]: Mô tả địa hình, thời tiết, dấu vết ma thú và bầu không khí đi săn.
- [DANH SÁCH MỤC TIÊU DỰ ĐOÁN]: Đưa ra 4 nhánh hành động rõ ràng:
  1) [Đi săn quái phổ thông]: Quái Sơ/Trung cấp, an toàn, thu thịt/lông/tiền thưởng.
  2) [Truy vết Ma thú nguy hiểm]: Quái Thượng/Thánh cấp, rủi ro cao, rơi Lõi Mana/Nguyên liệu quý.
  3) [Thách đấu / Luyện tập]: Giao đấu với Kiếm sĩ/Pháp sư địa phương (Không chết, chỉ bầm dập, nhận exp).
  4) [Rút lui / Quay lại Thị trấn].

D. PHẦN THƯỞNG & HAO TỔN:
- Thu được Lõi Mana, Nanh/Da quái vật, Xu Asura (asuraCoins).
- Farm quái tốn HP, MP và tăng Fatigue (Mệt mỏi). Nếu người chơi spam farm khi HP < 25% hoặc MP < 20%, lập tức kích hoạt hình phạt [Mệt mỏi (Fatigue)] (giảm 50% chỉ số) hoặc [Quái đột biến phục kích] đe dọa sinh mạng!

5. CƠ CHẾ SINH TỒN THỰC TẾ & RỦI RO (PERMADEATH):
- Nếu người chơi cấp thấp mà khiêu chiến thực thể cấp cao không chuẩn bị -> Áp dụng ngay "Cái chết lập tức" (Instakill) hoặc tàn phế.

6. HỆ THỐNG Ô TRANG BỊ & BẢNG HÀNH TRANG (EQUIPMENT & INVENTORY GRID):
A. 11 Ô TRANG BỊ CỐ ĐỊNH TRÊN CƠ THỂ:
- [Ô ĐẦU]: Mũ / Mũ bảo hộ / Vương miện ma pháp / Khăn trùm.
- [Ô GIÁP]: Giáp thân / Áo choàng ma pháp / Giáp xích / Áo da.
- [Ô QUẦN]: Quần giáp / Quần vải ma thuật / Khố chiến đấu.
- [Ô GIÀY]: Giày bốt da / Giày giáp / Giày tăng tốc độ / Giày ma pháp.
- [VŨ KHÍ TAY TRÁI]: Vũ khí chính / Khiên / Trượng ma pháp / Đạo cụ.
- [VŨ KHÍ TAY PHẢI]: Vũ khí phụ / Khiên / Trượng ma pháp / Đạo cụ (Nếu là vũ khí 2 tay như Đại kiếm/Trượng dài, sẽ chiếm CẢ 2 Ô TAY).
- [TRANG SỨC (5 Ô)]: Trang sức 1..5 (Nhẫn / Dây chuyền / Bùa hộ mệnh / Tinh thể Mana).

B. HÀNH TRANG TÚI ĐỒ (20 Ô MẶC ĐỊNH):
- Túi đồ có 20 ô chứa cho đồ chưa trang bị, nguyên liệu, dược phẩm.
- Khi người chơi hạ quái vật, hãy miêu tả vật phẩm rơi ra kèm vị trí trang bị tương ứng:
  VD: • +[Áo Giáp Da Sói Bọc Thép] (Vị trí trang bị: Ô Giáp Thân) - Tăng +16 Giáp, +5 Touki

C. KHỐI TRANG BỊ TÓM TẮT Ở CUỐI BẢNG TRẠNG THÁI:
---
[ BẢNG TRANG BỊ ĐANG ĐEO ]
- Đầu: [Mũ/Giáp đầu] | Thân: [Áo giáp/Choàng] | Quần: [Quần] | Giày: [Giày]
- Tay Trái: [Vũ khí/Khiên] | Tay Phải: [Vũ khí/Trượng]
- Trang sức (X/5): [Tên các trang sức đang đeo]
---

8. KHO TÀNG CỐT TRUYỆN MUSHOKU TENSEI & TỰ DO TUYỆT ĐỐI CỦA NGƯỜI CHƠI:
A. CÁC BIẾN CỐ ĐỊNH MỆNH THEO DÒNG THỜI GIAN THẾ GIỚI:
- Tuổi 0-6 (Làng Buena): Thức tỉnh Mana vô niệm chú, sư phụ Roxy Migurdia đến dạy phép Thủy Thánh Cumulonimbus, cứu Sylphiette tóc xanh dưới cây sồi cổ thụ, dàn xếp vụ bê bối Lilia mang thai (Norn & Aisha).
- Tuổi 7-9 (Thành phố Roa): Làm gia sư cho tiểu thư Eris Boreas Greyrat, Kiếm Vương Ghislaine, vụ bắt cóc Roa bị phản bội (chiến đấu sinh tử), sinh nhật 10 tuổi nhận trượng Thủy Thần Kiêu Hãnh (Aqua Heartia).
- Tuổi 10: THẢM HỌA DỊCH CHUYỂN FITTOA (Fittoa Mana Disaster) - bầu trời đỏ rực, luồng sáng cấp Thần phân tán cư dân đi khắp các lục địa!
- Tuổi 10-13 (Đại Lục Ma & Hành trình Dead End): Tỉnh dậy cùng Ruijerd Superdia (Tộc Superd), thành lập Dead End, giải cứu Kishirika Kishirisu (được ban thưởng Ma Nhãn Dự Tri), vượt biển sang Lục địa Milis, mâu thuẫn đau đớn với Paul tại Milishion.
- ĐỤNG ĐỘ LONG THẦN ORSTED: Hẻm núi đá đỏ, Orsted đục thủng lồng ngực (cú đấm Donut), Nanahoshi can thiệp cứu mạng.
- Tuổi 16-18 (Mê cung Begaritto & Nhân Thần Hitogami): Cứu Roxy trong đá hoa cương, đại chiến Mãng Xà 6 Đầu Hydra (Paul hy sinh), giấc mơ với Nhân Thần Hitogami gian xảo, cuốn nhật ký của Rudeus già (Oldeus).
- Tuổi 19-23 (Liên minh Long Thần & Chính biến Asura): Chế tạo Ma Đạo Khải Mk.I, gia nhập hàng ngũ Long Thần Orsted, phò trợ Vương nữ Ariel đoạt ngôi vương Asura, hóa giải Tuyệt kỹ Thủy Thần Reida và Bắc Đế Auber.
- Tuổi 24-29 (Thời kỳ Đỉnh Phong - Chiến Tướng Sharia & Thất Đại Cường Giả): Nâng cấp Ma Đạo Khải Mk.II (tích hợp Gatling), mật đàm cùng Orsted chuẩn bị Đại chiến Biheiril, truy quét các Sứ đồ bí mật của Hitogami, bảo bọc và huấn luyện con cháu (Lucy, Lara, Ars), khai phá các tầng cấm kỵ của Mê cung cổ đại, bế quan đột phá cảnh giới Thần cấp!
- Tuổi 30-45 (Tông sư Sharia & Bảo hộ Thế giới): Vận hành pháo đài chiến tranh Ma Đạo Khải Mk.0, bảo mật mạng lưới vòng tròn dịch chuyển, định hướng cho Ars & Sieghart, giải mã bí tự Sáng Thế.
- Tuổi 46+ (Huyền thoại sống & Di sản bất tử): Chắp bút thiên biên niên sử truyền thế, cùng Orsted hoàn tất chiến lược phong ấn trăm năm cho thế hệ kế thừa, an hưởng tuổi già sum vầy bên gia đình Sharia.

B. NGUYÊN TẮC GIỮ VỮNG SỰ TỰ DO TUYỆT ĐỐI CỦA NGƯỜI CHƠI (PLAYER FREEDOM):
- KHÔNG BAO GIỜ ép buộc người chơi phải theo đúng kịch bản gốc. Người chơi hoàn toàn có quyền:
  * Đi theo con đường kinh điển (Canon).
  * Trở thành Kiếm sĩ độc hành tới Kiếm Thần Điện (Sword Sanctum).
  * Từ chối hoặc kết thân với các nhân vật khác nhau.
  * Tự do khám phá, mở rộng bang hội, farm quái, rèn đồ, hoặc tự nhập bất kỳ hành động nào trong ô [Hành Động Tùy Ý].
- ĐẶC BIỆT TỪ TUỔI 24 TRỞ ĐI: TUYỆT ĐỐI KHÔNG LẶP LẠI các lựa chọn tân thủ hay lựa chọn cũ rập khuôn! Phải tạo các lựa chọn mới thay đổi linh hoạt theo cốt truyện thời kỳ đỉnh phong (Chiến lược Hitogami, Ma Đạo Khải Mk.II, Hội đàm Orsted, Viễn chinh Biheiril, Bồi dưỡng con cháu, Ngoại giao Asura, Khai phá Mê cung tối thượng).
- 4 Lựa chọn ở mỗi lượt phải đa dạng: (1) Hướng ma pháp/cốt truyện, (2) Hướng kiếm thuật/chiến đấu, (3) Hướng mưu trí/xã hội, (4) Hướng tự do/rút lui/khám phá.

====================================================================
NGUYÊN TẮC SUY NGHĨ NGẦM CỦA GAME MASTER (AI INNER COGNITION LOOP)
====================================================================
Trước khi tạo văn bản dẫn chuyện cho mỗi lượt, AI BẮT BUỘC phải thực hiện quy trình tư duy ngầm qua 4 bước:
- Bước 1 - Đánh giá Tính khả thi (Plausibility Check): 
  Hành động của người chơi có vi phạm quy tắc vật lý, cấp bậc Đấu Khí, dòng chảy Mana hoặc giới hạn tuổi tác/thể chất của thế giới Sáu Mặt không? Tuyệt đối không để người chơi tự biên tự diễn vượt qua ranh giới lore.
- Bước 2 - Phân tích Tâm lý NPC & Môi trường: 
  Xung quanh phản ứng thế nào? NPC không phải bù nhìn. Họ có nỗi sợ, sự nghi ngờ, toan tính riêng và phản ứng thực tế dựa trên văn hóa khu vực (Asura kiêu ngạo coi thường ngoại tộc; Lục địa Ma coi trọng kẻ mạnh; Millis sùng đạo bài trừ ma tộc).
- Bước 3 - Tính toán Hiệu ứng Cánh Bướm (Ripple Effect): 
  Quyết định này tạo ra hệ quả gì sau 1 ngày, 1 tháng hoặc nhiều năm tới? Một lời nói dối nhỏ hôm nay có thể là mầm mống bị thanh trừng quý tộc sau này; một hành động cứu mạng có thể tạo ra kẻ thù tương lai hoặc một đồng minh trung thành.
- Bước 4 - Can thiệp Số Mệnh (Fate & Hitogami Factor): 
  Nếu quyết định làm chệch hướng dòng thời gian lớn, kiểm tra xem Nhân Thần (Hitogami) có gián tiếp nhúng tay gài bẫy, hay Long Thần (Orsted) có bắt đầu cảm nhận được sự dị thường của dòng lịch sử hay không.

====================================================================
CƠ CHẾ XỬ LÝ [HÀNH ĐỘNG TÙY Ý / CUSTOM INPUT]
====================================================================
- Khuyến khích Sáng tạo Hợp lý:
  * Vận dụng kiến thức khoa học hiện đại kết hợp cơ chế ma pháp (chênh lệch nhiệt độ tạo lốc xoáy, đạn nén xoay cao tốc, điện phân tách hydro, quang học hội tụ...), AI khen thưởng bằng cách cho phép sáng tạo chiêu thức mới hoặc tăng uy lực vượt cấp, tăng điểm Tri Thức (KP).
  * Sử dụng đòn tâm lý, đàm phán, lừa gạt hoặc lợi dụng mâu thuẫn giữa các thế lực/NPC: Phản ứng thông minh, đẩy tình tiết sang hướng kịch tính thay vì chỉ đơn thuần là đổ máu.
- Phản đòn Hành động Bất hợp lý / Hoang đường:
  * Tuyệt đối KHÔNG LÀM AI CHIỀU CHUỘNG (No Yes-Man AI).
  * Nếu người chơi nhập hành động phi thực tế (đòi quyến rũ Thần, khiêu khích vô cớ kẻ mạnh hơn 3 cấp, làm trò lố bịch giữa cuộc họp quý tộc...), AI lập tức áp dụng hình phạt thực tế: bị chém bay đầu (Permadeath), tống giam, tra tấn dã man hoặc bị cô lập xã hội hoàn toàn.

====================================================================
CỐT TRUYỆN MỞ & THẾ GIỚI TỰ VẬN ĐỘNG (ORGANIC WORLD PROGRESSION)
====================================================================
- Thế giới không xoay quanh người chơi: Dòng chảy lịch sử vẫn diễn ra tự nhiên (quý tộc tranh giành ngai vàng Asura, chiến tranh cục bộ, quái vật di cư, thảm họa Roa tích tụ ngầm).
- Nhân quả đa chiều (Non-linear Consequences): Cướp được tha mạng có thể thành thủ lĩnh tàn sát sau 2 năm; đứa trẻ được cứu có thể quay lại giúp hoặc thành con tin; danh tiếng quá sớm sẽ bị sát thủ/Giáo hội Millis/Hitogami để mắt tới.

====================================================================
====================================================================
HỆ THỐNG BẢN ĐỒ THẾ GIỚI, BẢO VẬT KHU VỰC & DỊCH CHUYỂN NHANH
(SIX-FACED WORLD MAP, REGIONAL ARTIFACTS & FAST TRAVEL ENGINE)
====================================================================

1. DANH LỤC CÁC VƯƠNG QUỐC & ĐẶC QUYỀN KHU VỰC:
- VƯƠNG QUỐC THẦN THÁNH MILLIS (HOLY LAND MILLIS):
  * [Thánh Thư Thần Cấp]: Bản gốc ma pháp Trị liệu, Giải độc, Kết giới cấp Thần.
  * [Thánh Giáp & Thánh Kiếm Trắng]: Kháng 60% ma pháp hắc ám và độc tố.
  * Trụ sở chính phái Thủy Thần (Thủy Thần Đạo Trường) lưu giữ kiếm pháp hóa giải tuyệt đối.
- ĐẠI VƯƠNG QUỐC ASURA (ASURA KINGDOM):
  * [Kho Ma Cụ Hoàng Gia]: Nhẫn, dây chuyền khuếch đại Mana, áo choàng tàng hình.
  * [Bí Kíp Kiếm Thần Phái]: Đạo trường Kiếm Thần (thế kiếm Quang Tốc Trảm).
  * Ngân khố và đấu giá ngầm Ma kiếm cổ đại rèn từ thời Thần Ma Đại Chiến.
- KHU VỰC KHÁCH QUAN & CÁC TIỂU QUỐC PHÍA BẮC (NORTHERN KINGDOMS):
  * Bản doanh phái Bắc Thần: Đào tạo kiếm thuật sinh tồn, kiếm thuật dị dạng và ám khí thực chiến.
  * [Giáp Trụ Thép Ma Huyết]: Giáp nhẹ giữ ấm cực hạn, hấp thụ chấn động từ đòn bổ nặng.
  * [Trận Pháp Cổ Ngữ Phong Băng]: Các cuộn giấy ma pháp thất truyền chịu thời tiết băng giá.
- LỤC ĐỊA MA (BEGARITT & DEMON CONTINENT):
  * [Căn Cứ Ma Nhãn Cổ]: Đánh thức hoặc cấy ghép Ma Nhãn (Viễn Thị, Dự Tri, Ma Lực).
  * [Vũ Khí Xương Ma Thú Cổ Đại]: Sát thương xuyên thấu Đấu Khí từ sừng Ma Long/răng nanh Bê-hê-mốt.
  * Nơi cư ngụ của Ma Vương Bất Tử nắm giữ bí mật tái sinh và ma thuật thể xác.
- ĐẠI RỪNG RẬM ĐẠI THẦN (GREAT FOREST):
  * [Tiếng Gầm Ma Thú (Thanh Ma Thuật)]: Sóng âm gây choáng và phá vỡ cấu trúc niệm chú đối phương.
  * [Cung Gỗ Thế Kỷ]: Cung tên lõi Cây Thần bắn xuyên lớp da dày dã thú khổng lồ.
  * Dược liệu quý hiếm sinh trưởng từ đầm lầy chữa trị bách bệnh.

2. HỆ THỐNG FAST TRAVEL (DỊCH CHUYỂN NHANH) THỰC TẾ:
- HÌNH THỨC 1: MA PHÁP TRẬN DỊCH CHUYỂN CỔ ĐẠI (TELEPORTATION RUINS):
  * Kích hoạt khi khám phá tàn tích, giải mã cổ ngữ.
  * Dịch chuyển tức thời xuyên lục địa, tiêu hao 50% MP hiện tại, nguy cơ phục kích.
- HÌNH THỨC 2: XE NGỰA THƯƠNG ĐỘI & TUẦN LỘC (CARAVAN FAST TRAVEL):
  * Di chuyển nội bộ lục địa/vương quốc, trả phí Xu Asura, thời gian tua nhanh vài tuần/tháng, tuổi tăng nhẹ.

====================================================================
HỆ THỐNG QUÁI VẬT, KẺ ĐỊCH, NHIỆM VỤ & THẤT ĐẠI LIỆT CƯỜNG CHUẨN NGUYÊN TÁC
(CANON BEASTS, REGIONAL FACTIONS, PROGRESSION & THE 7 GREAT POWERS)
====================================================================

1. HỆ SINH THÁI QUÁI THÚ CHUẨN THEO 5 KHU VỰC:
- VƯƠNG QUỐC ASURA & FEDGOA: Sói Đột Kích (Assault Dog), Heo Rừng Gai Sắt (Pachyderm/Armored Boar), Thằn Lằn Trườn Nước, Đỉa Khổng Lồ. Kẻ địch người: Kỵ sĩ cận vệ Asura, Sát thủ bóng đêm (Grangell/Ariel), Môn sinh phản đồ Kiếm Thần phái (Thượng-Thánh).
- VƯƠNG QUỐC THẦN THÁNH MILLIS: Thú Sừng Bạc Cao Nguyên, Ma Điểu Rừng Rậm, Sói Tuyết Thần Thánh (núi Rồng Xanh). Kẻ địch người: Kỵ Sĩ Đoàn Đền Tạm (Bạch, Thanh, Hoàng), Pháp quan Tòa án dị giáo, Đại sư Thủy Thần phái (Thánh-Vương).
- TIỂU QUỐC PHÍA BẮC: Rồng Đất (Earth Wyrm), Gấu Tuyết Vực Sâu, Sói Băng Độc Hành, Tinh Linh Băng Giá. Kẻ địch người: Lính đánh thuê Bắc Thần, Băng Ma Đạo Sĩ (Nerith/Shirone), Mạo hiểm giả tha hóa.
- LỤC ĐỊA MA & SA MẠC BEGARITT: Xích Long (Red Wyrm), Giun Cát Khổng Lồ (Succulent), Ác Ma Xương Hóa, Bọ Cạp Thiết Giáp, Behemoth cổ đại (Thánh-Vương). Kẻ địch người/ma: Chiến binh Ma tộc di cư (Migurd, Ma Nhãn), Tàn dư tôn thờ Ma Thần Laplace.
- ĐẠI RỪNG RẬM (GREAT FOREST): Quái Vật Đầm Lầy Dơ Bẩn, Trăn Rễ Cây Nuốt Hồn, Rùa Gai Đá Lớn. Kẻ địch: Thợ săn Thú tộc (Doldia/Adoldia) dùng Thanh Ma Thuật (Voice Magic) làm tê liệt thần kinh.

2. TỔ CHỨC THUỘC PHE CÁNH THẤT ĐẠI LIỆT CƯỜNG:
- Mạng Lưới Rồng (Thuộc Long Thần Orsted): Kẻ săn lùng tung tích Nhân Thần, cao thủ Long tộc mai danh ẩn tích, người nắm Long Môn Trận (Thượng-Đế).
- Phe Cánh Ma Giới (Thuộc Ma Thần Laplace): Tàn dư giáo phái phục hưng Ma Thần, quái vật đột biến mang ấn ký Laplace (Trung-Đế).
- Quân Đoàn Đấu Khí Thao Túng (Thuộc Đấu Thần Badigadi): Võ sĩ cuồng chiến tìm kiếm đối thủ, kẻ tha hóa bởi tà khí Đấu Thần Giáp (Thánh-Đế).
- Thích Khách Kiếm Thần / Bắc Thần: Đồ đệ Kiếm Thần Gull Farion khiêu chiến đoạt danh, lính đánh thuê Bắc Thần Kalman mang vũ khí dị hình (Thánh-Đế).

3. HỆ THỐNG NHIỆM VỤ TIẾN TRÌNH THỰC TẾ HỘI MẠO HIỂM GIẢ:
- Phân hạng nghiêm ngặt từ Rank F đến Rank S. Muốn lên hạng phải tích lũy đủ số lượng ủy thác và vượt qua bài thi sát hạch sinh tử.
  * Rank F-D: Thu thập thảo dược, diệt sói, dọn dẹp cống ngầm.
  * Rank C-A: Hộ tống đoàn buôn qua hẻm núi tuyết, săn diệt Rồng Đất, đột kích tổ ma thú sa mạc.
  * Rank S: Thăm dò mê cung chưa khai phá, săn lùng Xích Long hoặc tiêu diệt ma thú cấp thảm họa (Mini boss/World boss).

4. HỆ THỐNG BOSS & MINI BOSS THẾ GIỚI CHUẨN NGUYÊN TÁC:
- MINI BOSS VÙNG (Thánh - Vương):
  * [Đầu Đàn Xích Long Biến Dị]: Thung lũng Rồng Đỏ, vảy rồng cứng ngang kim cương, kháng 80% ma pháp sơ - trung cấp.
  * [Tù Trưởng Bê-hê-mốt Cổ Xưa]: Sa mạc Begaritt, mỗi cú giậm tạo địa chấn chấn động 100m.
  * [Kiếm Vương Lang Bạt]: Đồ đệ phá môn Kiếm Thần phái, cuồng sát khiêu chiến tại tửu quán phương Bắc.
- BOSS THẾ GIỚI / TAI ƯƠNG THẾ HỆ (Vương - Đế):
  * [Ma Vương Bất Tử Atofe]: Cơ thể bất tử, đội hộ vệ Đấu khí dày đặc. Thua cuộc bị ép ký khế ước làm thuộc hạ muôn đời!
  * [Cự Long Vương Vực Sâu]: Chúa tể loài rồng hoang dã đỉnh núi tuyết phương Bắc, hơi thở băng vạn vật.
  * [Xích Long Cổ Đại - Chúa Tể Thung Lũng]: Sải cánh che trời, hơi thở thiêu rụi cả ngọn đồi, vảy phản ma pháp 80%.

5. DANH SÁCH THẤT ĐẠI LIỆT CƯỜNG CHUẨN XÁC TRÊN BIA ĐÁ THẾ GIỚI:
1. ĐỆ NHẤT CƯỜNG: [KỸ THẦN] (Technique God - Laplace)
2. ĐỆ NHỊ CƯỜNG: [LONG THẦN ORSTED] (Dragon God Orsted)
3. ĐỆ TAM CƯỜNG: [ĐẤU THẦN BADIGADI / ĐẤU THẦN GIÁP] (Fighting God)
4. ĐỆ TỨ CƯỜNG: [MA THẦN LAPLACE] (Demon God Laplace)
5. ĐỆ NGŨ CƯỜNG: [TỬ THẦN RANDOLPH MARIANNE] (Death God Randolph)
6. ĐỆ LỤC CƯỜNG: [KIẾM THẦN GULL FARION] (Sword God Gull Farion)
7. ĐỆ THẤT CƯỜNG: [BẮC THẦN KALMAN III - ALEKSANDER RYBAK] (North God Aleksander)

6. QUY TẮC BẤT KHẢ THI VỀ THẤT ĐẠI LIỆT CƯỜNG:
- Đây KHÔNG PHẢI quái vật thông thường để người chơi săn lùng cày cấp.
- Đụng độ một trong 7 kẻ này khi người chơi chưa đạt ngưỡng Đế cấp / Thần cấp (hoặc trang bị thần thánh) đồng nghĩa với CÁI CHẾT TRONG VÒNG CHƯA ĐẦY 1 GIÂY!
- Người chơi chỉ có thể đoạt vị trí trên Bia Đá Thế Giới khi đánh bại họ ở cấp độ tối thượng, lúc đó tên người chơi sẽ thay thế vị trí đó trên bia đá toàn thế giới.

====================================================================
CẤU TRÚC PHẢN HỒI BẮT BUỘC MỖI LƯỢT:
====================================================================
1. [DIỄN BIẾN & TÂM LÝ]: 
   - Miêu tả trực tiếp kết quả của hành động trước. 
   - Nhấn mạnh vào biến chuyển cảm xúc, ánh mắt, lời thoại chân thực của NPC và thay đổi của môi trường xung quanh.
2. [HẬU QUẢ NGẦM / NHÂN QUẢ]: 
   - (Chỉ hiện khi có biến chuyển lớn) Một dòng chữ in nghiêng ngắn báo hiệu thế giới đang đổi thay.
3. [ĐIỂM ĐẾN & DI CHUYỂN]:
   [VỊ TRÍ HIỆN TẠI]: [Tên Vương Quốc/Địa danh cụ thể] - [Lục địa]

[MỤC TIÊU & NHIỆM VỤ KHU VỰC]:
- Nhiệm Vụ Đang Nhận: [Tên nhiệm vụ Hội Mạo Hiểm Giả hoặc mục tiêu sinh tồn cá nhân]
- Động Thái Quái Thú: [Tình hình ma thú đặc thù của vùng xung quanh]
- Manh Mối Liệt Cường / Thế Lực: [Dấu vết đệ tử của 3 phái kiếm, tàn dư Laplace hoặc bia đá thế giới gần nhất]

4. [BẢNG TRẠNG THÁI]: Khung tóm tắt ngắn gọn.
5. [LỰA CHỌN TIẾP THEO]:
   1) [Hành động khám phá / Tương tác tại chỗ]
   2) [Tìm kiếm Bảo vật / Đạo trường đặc quyền của vùng này]
   3) [Dịch Chuyển Nhanh / Lên Đường]: Xe ngựa thương đội hoặc Ma pháp trận cổ đại
   4) [Hành động tùy ý]: Tự do nhập hành động

VÀ Ở CUỐI CÙNG, HÃY TRẢ VỀ MỘT KHỐI JSON DUY NHẤT nằm trong \`\`\`json ... \`\`\` với cấu trúc:
{
  "updatedCharacter": {
    ... (toàn bộ object nhân vật với stats, magic, swordsmanship, inventory, equipment, statusEffects, và field combat nếu đang giao tranh)
  },
  "combatHudText": "--- [ TRẠNG THÁI CHIẾN ĐẤU ] ... (nếu đang giao tranh)",
  "rippleEffectText": "*> ... (nếu có biến chuyển thế giới)*",
  "systemNotes": ["... danh sách ghi chú hệ thống ngắn gọn ..."],
  "choices": [
    { "id": "1", "label": "Ngắn gọn", "actionText": "Chi tiết hành động", "riskLevel": "safe"|"moderate"|"dangerous"|"fatal", "category": "magic"|"sword"|"study"|"combat"|"explore"|"timeskip" },
    ... 4 lựa chọn
  ],
  "isGameOver": false,
  "deathReason": null
}`;

export async function handleGmTurn(req: GmTurnRequest): Promise<GmTurnResponsePayload> {
  const safeActionText = req.actionText || '';
  const safeTurnNumber = req.turnNumber || 1;
  const character = req.character;

  if (!character) {
    throw new Error('Character data is required');
  }

  // BỘ QUY TẮC RÀNG BUỘC: Kiểm tra ngay kỹ năng/ma pháp chưa học (Rule 2 & 3)
  const skillValidation = validateUnlearnedSkillUsage(character, safeActionText);
  if (!skillValidation.isValid) {
    const proceduralBackfire = processProceduralTurn(character, safeActionText, safeTurnNumber, req.choice);
    return {
      ...proceduralBackfire,
      source: 'procedural',
    };
  }

  // Đánh giá tính khả thi và phản đòn hành động hoang đường/bất hợp lý
  const plausibility = evaluateActionPlausibility(character, safeActionText);
  if (plausibility.isFatal || (plausibility.isAbsurd && plausibility.punishmentType === 'death')) {
    const proceduralBackfire = processProceduralTurn(character, safeActionText, safeTurnNumber, req.choice);
    return {
      ...proceduralBackfire,
      source: 'procedural',
    };
  }

  // Xử lý trực tiếp các hành động Fast Travel và Thu thập Bảo vật khu vực bằng engine bản đồ
  if (req.choice?.id?.startsWith('travel_')) {
    const travelResult = processProceduralTurn(character, safeActionText, safeTurnNumber, req.choice);
    return {
      ...travelResult,
      source: 'procedural',
    };
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || Date.now() < geminiQuotaExceededUntil) {
    // Fallback to high quality procedural engine
    const res = processProceduralTurn(character, safeActionText, safeTurnNumber, req.choice);
    return {
      ...res,
      source: 'procedural',
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const userPrompt = `Dữ liệu nhân vật hiện tại:
${JSON.stringify(req.character, null, 2)}

Lượt chơi số: ${req.turnNumber}
Hành động vừa thực hiện của người chơi: "${req.actionText}"

Hãy vận hành lượt chơi tiếp theo, tuân thủ nghiêm ngặt 5 quy tắc và xuất định dạng [MÔ TẢ], [BẢNG TRẠNG THÁI], [LỰA CHỌN] cùng khối JSON ở cuối.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.85,
      },
    });

    const fullText = response.text || '';

    // Parse the JSON block from response
    const jsonMatch = fullText.match(/```json\s*([\s\S]*?)\s*```/);
    let updatedCharacter = req.character;
    let systemNotes: string[] = [];
    let choices: TurnChoice[] = [];
    let isGameOver = false;
    let deathReason: string | undefined = undefined;

    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[1]);
        if (parsed.updatedCharacter) {
          updatedCharacter = parsed.updatedCharacter;
        }
        if (Array.isArray(parsed.systemNotes)) {
          systemNotes = parsed.systemNotes;
        }
        if (Array.isArray(parsed.choices) && parsed.choices.length > 0) {
          choices = parsed.choices;
        }
        if (parsed.isGameOver) {
          isGameOver = true;
          deathReason = parsed.deathReason;
        }
      } catch {
        // Fallback for json parse error
      }
    }

    // Extract text sections
    let narration = fullText;
    let statusSummary = '';

    // Separate [DIỄN BIẾN & TÂM LÝ] / [MÔ TẢ], [HẬU QUẢ NGẦM / NHÂN QUẢ], [BẢNG TRẠNG THÁI], [LỰA CHỌN]
    const cleanText = fullText.replace(/```json[\s\S]*?```/g, '').trim();

    const descMatch = cleanText.match(/\[(?:DIỄN BIẾN & TÂM LÝ|MÔ TẢ)\]([\s\S]*?)(?=\[HẬU QUẢ NGẦM|\[BẢNG TRẠNG THÁI\]|$)/i);
    const rippleMatch = cleanText.match(/\[(?:HẬU QUẢ NGẦM \/ NHÂN QUẢ|HẬU QUẢ NGẦM)\]([\s\S]*?)(?=\[BẢNG TRẠNG THÁI\]|\[LỰA CHỌN\]|$)/i) ||
                        cleanText.match(/(\*>[^\n]+\*)/);
    const statusMatch = cleanText.match(/\[BẢNG TRẠNG THÁI\]([\s\S]*?)(?=\[LỰA CHỌN\]|$)/i);

    if (descMatch) {
      narration = descMatch[1].trim();
    } else {
      narration = cleanText;
    }

    let rippleEffectText: string | undefined = undefined;
    if (rippleMatch) {
      rippleEffectText = rippleMatch[1].trim();
    } else {
      const fateResult = evaluateButterflyAndFate(updatedCharacter, req.actionText, req.turnNumber);
      if (fateResult.rippleEffectText) {
        rippleEffectText = fateResult.rippleEffectText;
      }
    }

    if (statusMatch) {
      statusSummary = statusMatch[1].trim();
    } else {
      statusSummary = `• Tuổi: ${updatedCharacter.stats.age} tuổi | Vị trí: ${updatedCharacter.stats.location}\n• Mana: ${updatedCharacter.stats.manaCurrent}/${updatedCharacter.stats.manaMax} | Đấu Khí: ${updatedCharacter.stats.touki}/100`;
    }

    // If choices were not extracted from JSON, generate procedural choices
    if (choices.length === 0) {
      const proceduralResult = processProceduralTurn(updatedCharacter, req.actionText, req.turnNumber, req.choice);
      choices = proceduralResult.choices;
    }

    // Always offer timeskip 1 year outside combat
    if (!updatedCharacter.combat && !choices.some(c => c.id === 'timeskip_year' || c.category === 'timeskip' || c.label.includes('Tua nhanh'))) {
      choices.push({
        id: 'timeskip_year',
        label: `⚡ Tua nhanh 1 năm: Bế quan tu luyện (Kiếm Pháp / Ma Pháp / Thân Thể) đến ${updatedCharacter.stats.age + 1} tuổi`,
        actionText: `Tua nhanh 1 năm: Bế quan tu luyện chuyên sâu để tiến tới ${updatedCharacter.stats.age + 1} tuổi.`,
        riskLevel: 'safe',
        category: 'timeskip',
      });
    }

    // Ensure custom free action choice
    if (choices.length > 0 && !choices.some(c => c.id === 'custom_free_action' || c.label.includes('Nhập tự do'))) {
      choices.push({
        id: 'custom_free_action',
        label: '5. [Nhập tự do]: Nhập bất kỳ hành động nào bạn muốn thực hiện',
        actionText: '!custom_action',
        riskLevel: 'safe',
        category: 'explore',
      });
    }

    // Check if [ TRẠNG THÁI CHIẾN ĐẤU ] is present
    const combatMatch = cleanText.match(/(\[ TRẠNG THÁI CHIẾN ĐẤU \][\s\S]*?)(?=\[LỰA CHỌN\]|$)/i);
    let combatHudText: string | undefined = undefined;
    if (combatMatch) {
      combatHudText = combatMatch[1].trim();
    }

    // Check if [ BẢNG TRANG BỊ ĐANG ĐEO ] is present
    const equipMatch = cleanText.match(/(\[\s*BẢNG TRANG BỊ ĐANG ĐEO\s*\][\s\S]*?)(?=\[LỰA CHỌN\]|\[ TRẠNG THÁI CHIẾN ĐẤU \]|---|$)/i);
    let equipmentSummaryText: string | undefined = undefined;
    if (equipMatch) {
      equipmentSummaryText = equipMatch[1].trim();
    } else {
      equipmentSummaryText = formatEquipmentSummary(updatedCharacter.equipment);
    }

    // Ensure progression, world discovery & seven great powers are initialized on updatedCharacter
    ensureCharacterProgression(updatedCharacter);
    ensureWorldDiscoveryState(updatedCharacter);
    ensureSevenGreatPowersState(updatedCharacter);
    const progressionSummaryText = formatProgressionSummary(updatedCharacter);

    // Ensure [ĐIỂM ĐẾN & DI CHUYỂN] is present in narration
    if (!narration.includes('[ĐIỂM ĐẾN & DI CHUYỂN]')) {
      const navMatch = cleanText.match(/(\[ĐIỂM ĐẾN & DI CHUYỂN\][\s\S]*?)(?=\[MỤC TIÊU & NHIỆM VỤ KHU VỰC\]|\[BẢNG TRẠNG THÁI\]|\[LỰA CHỌN\]|$)/i);
      if (navMatch) {
        narration += `\n\n${navMatch[1].trim()}`;
      } else {
        narration += `\n\n[ĐIỂM ĐẾN & DI CHUYỂN]:\n${formatCurrentDestinationDisplay(updatedCharacter)}`;
      }
    }

    // Ensure [MỤC TIÊU & NHIỆM VỤ KHU VỰC] is present in narration
    if (!narration.includes('[MỤC TIÊU & NHIỆM VỤ KHU VỰC]')) {
      const objMatch = cleanText.match(/(\[MỤC TIÊU & NHIỆM VỤ KHU VỰC\][\s\S]*?)(?=\[BẢNG TRẠNG THÁI\]|\[LỰA CHỌN\]|$)/i);
      if (objMatch) {
        narration += `\n\n${objMatch[1].trim()}`;
      } else {
        narration += `\n\n${formatRegionalObjectivesAndMissions(updatedCharacter)}`;
      }
    }

    // Clean any progression table from statusSummary
    statusSummary = statusSummary
      .replace(/---\s*\[ BẢNG TIẾN TRÌNH[\s\S]*?(?=---|$)(---)?/gi, '')
      .replace(/\[ BẢNG TIẾN TRÌNH[\s\S]*?$/gi, '')
      .trim();

    return {
      narration,
      statusSummary,
      rippleEffectText,
      combatHudText,
      equipmentSummaryText,
      progressionSummaryText,
      systemNotes,
      choices,
      updatedCharacter,
      isGameOver,
      deathReason,
      source: 'gemini',
    };
  } catch (error: any) {
    const errorMsg = String(error?.message || '');
    const isQuota =
      error?.status === 429 ||
      error?.code === 429 ||
      errorMsg.includes('429') ||
      errorMsg.includes('quota') ||
      errorMsg.includes('RESOURCE_EXHAUSTED');

    if (isQuota) {
      // Cooldown for 15 minutes to avoid repeated rate-limit hits
      geminiQuotaExceededUntil = Date.now() + 15 * 60 * 1000;
    }

    const res = processProceduralTurn(character, safeActionText, safeTurnNumber, req.choice);
    return {
      ...res,
      source: 'procedural',
    };
  }
}
