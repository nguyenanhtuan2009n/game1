import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Sword, 
  Shield, 
  Zap, 
  Flame, 
  Droplets, 
  Mountain, 
  Wind, 
  PlusCircle, 
  Eye, 
  Hammer, 
  AlertTriangle, 
  Skull,
  Award,
  HeartPulse,
  FlameKindling,
  Compass,
  CheckCircle2,
  Layers,
  Scroll
} from 'lucide-react';
import type { Character, PowerTier } from '../types/game.ts';
import { 
  ensureCharacterProgression, 
  getBreakthroughRequirements, 
  executeBreakthrough,
  BreakthroughResult,
  awakenDemonEye
} from '../services/mushokuProgression.ts';
import { soundFx } from '../services/soundFx.ts';
import { 
  MAGIC_SKILLS_CATALOG, 
  SWORD_SKILLS_CATALOG 
} from '../services/skillsCatalog.ts';
import { TIER_RANK_MAP } from '../services/mushokuRules.ts';
import { TALENTS_CATALOG } from '../services/mushokuTalents.ts';

interface SkillTreeModalProps {
  character: Character;
  onUpdateCharacter: (char: Character) => void;
  onClose: () => void;
  onLogMessage?: (msg: string) => void;
  onShowToast?: (msg: string) => void;
}

export const SkillTreeModal: React.FC<SkillTreeModalProps> = ({
  character,
  onUpdateCharacter,
  onClose,
  onLogMessage,
  onShowToast,
}) => {
  // Default to 0: Show ALL 6 BRANCHES simultaneously so the player sees the complete multi-faceted skill tree
  const [activeBranch, setActiveBranch] = useState<0 | 1 | 2 | 3 | 4 | 5 | 6>(0);
  const [lastResult, setLastResult] = useState<BreakthroughResult | null>(null);

  const prog = ensureCharacterProgression(character);

  const handleBreakthrough = (branchNumber: 1 | 2 | 3 | 4 | 5 | 6, skillKey: string) => {
    soundFx.playSwordClash();
    const res = executeBreakthrough(character, branchNumber, skillKey);
    setLastResult(res);

    if (res.success) {
      soundFx.playLevelUp();
      onUpdateCharacter(res.updatedCharacter);
      if (onShowToast) onShowToast(res.message);
      if (onLogMessage) onLogMessage(res.message);
    } else if (res.isFatal) {
      soundFx.playDeathGong();
      onUpdateCharacter(res.updatedCharacter);
      if (onShowToast) onShowToast('💥 CƯỠNG CẦU ĐỘT PHÁ THẤT BẠI - TỬ VONG!');
      if (onLogMessage) onLogMessage('💥 CƯỠNG CẦU ĐỘT PHÁ THẤT BẠI: Bạn đã tử vong do nứt vỡ kinh mạch và suy kiệt linh hồn!');
    } else {
      if (res.statDebuff) {
        soundFx.playDeathGong();
        onUpdateCharacter(res.updatedCharacter);
      }
      if (onShowToast) onShowToast(res.message);
      if (onLogMessage) onLogMessage(res.message);
    }
  };

  // Branch 1: Tứ Đại Nguyên Tố & Ma Pháp Ghép
  const renderBranch1 = () => (
    <div className="space-y-4">
      <div className="bg-amber-50/80 p-4 rounded-xl border border-amber-300 shadow-xs">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="font-serif font-bold text-amber-950 text-sm flex items-center gap-2">
            <FlameKindling className="w-4 h-4 text-amber-600" />
            Nhánh 1: Tứ Đại Nguyên Tố &amp; Biến Thể Tự Nhiên
          </h3>
          <span className="px-2 py-0.5 rounded bg-amber-200/80 text-amber-900 text-[10px] font-bold">
            4 Hệ Cơ Bản + 3 Ma Pháp Ghép
          </span>
        </div>
        <p className="text-stone-700 text-xs mt-1">
          Rèn luyện từ hình dung niệm chú sơ cấp đến lĩnh hội quy mô hiện tượng tự nhiên ở cấp Thánh, và vượt qua lằn ranh sinh tử để bước vào Vương cảnh.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {[
          {
            key: 'water',
            name: 'Hệ Nước (Water Magic)',
            tier: character.magic.water,
            icon: Droplets,
            color: 'text-blue-700',
            bg: 'bg-blue-50/80 border-blue-200',
            btnBg: 'bg-blue-600 hover:bg-blue-500 text-white',
            desc: 'Thao túng dòng chảy -> Mũi tên nước -> Băng tiễn nén lạnh -> Băng hà vĩnh cửu -> [Thánh: Vũ Điệu Cuồng Phong / Mưa Axit]',
          },
          {
            key: 'fire',
            name: 'Hệ Lửa (Fire Magic)',
            tier: character.magic.fire,
            icon: Flame,
            color: 'text-rose-700',
            bg: 'bg-rose-50/80 border-rose-200',
            btnBg: 'bg-rose-600 hover:bg-rose-500 text-white',
            desc: 'Đốm lửa -> Hỏa Cầu -> Hỏa Xà thiêu đốt -> Lửa nén nhiệt độ mặt trời -> [Thánh: Hỏa Ngục Phần Thiên]',
          },
          {
            key: 'earth',
            name: 'Hệ Đất (Earth Magic)',
            tier: character.magic.earth,
            icon: Mountain,
            color: 'text-amber-800',
            bg: 'bg-amber-50/80 border-amber-200',
            btnBg: 'bg-amber-600 hover:bg-amber-500 text-white',
            desc: 'Nén đất thành đá -> Địa Đạn cao tốc -> Bức Tường Pháo Đài -> Thao túng địa chấn -> Sa lầy hóa lỏng -> [Thánh: Đạn Pháo Nén Siêu Tỷ Trọng]',
          },
          {
            key: 'wind',
            name: 'Hệ Gió (Wind Magic)',
            tier: character.magic.wind,
            icon: Wind,
            color: 'text-emerald-700',
            bg: 'bg-emerald-50/80 border-emerald-200',
            btnBg: 'bg-emerald-600 hover:bg-emerald-500 text-white',
            desc: 'Lưỡi dao gió -> Áp suất đẩy lùi -> Chân Không Trảm -> Âm Ba Kích -> [Thánh: Vòi Rồng Bão Tố]',
          },
        ].map((item) => {
          const req = getBreakthroughRequirements(item.tier, 'magic', item.key, character);
          const Icon = item.icon;
          return (
            <div key={item.key} className={`p-4 rounded-xl border ${item.bg} flex flex-col justify-between shadow-xs`}>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`font-serif font-bold text-sm flex items-center gap-1.5 ${item.color}`}>
                    <Icon className="w-4 h-4" /> {item.name}
                  </span>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-white border border-stone-300 text-stone-900 shadow-2xs">
                    {item.tier}
                  </span>
                </div>
                <p className="text-stone-700 text-[11px] mb-3 leading-relaxed">{item.desc}</p>
                
                <div className="bg-white/90 p-2.5 rounded-lg border border-stone-200 space-y-1 text-[11px]">
                  <div className="flex justify-between text-stone-800">
                    <span>Mục tiêu tiếp theo:</span>
                    <strong className={item.color}>{req.targetTier}</strong>
                  </div>
                  <div className="flex justify-between text-stone-600 font-mono">
                    <span>Chi phí:</span>
                    <span>{req.spRequired} SP | {req.kpRequired} KP</span>
                  </div>
                  <div className="text-[10px] text-stone-600 italic pt-1 border-t border-stone-100">
                    Điều kiện: {req.specialConditionDescription}
                  </div>
                </div>

                {/* Danh sách kỹ năng mở khóa ở mỗi cấp bậc ma pháp */}
                <div className="mt-2.5 p-2 rounded-lg bg-stone-50/90 border border-stone-200 text-[10px] space-y-1">
                  <div className="font-bold text-stone-800 flex items-center justify-between text-[10px]">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-600" /> Kỹ năng ở mỗi cấp bậc:
                    </span>
                    <span className="text-[9px] text-stone-500 font-mono">7 Cấp Bậc</span>
                  </div>
                  <div className="space-y-0.5 max-h-24 overflow-y-auto pr-0.5">
                    {(MAGIC_SKILLS_CATALOG[item.key] || []).map((sk) => {
                      const curRank = TIER_RANK_MAP[item.tier as PowerTier] || 0;
                      const isLearned = curRank >= sk.tier;
                      const isNext = sk.tier === curRank + 1;
                      return (
                        <div
                          key={sk.id}
                          className={`flex items-center justify-between px-1.5 py-0.5 rounded text-[9px] ${
                            isLearned
                              ? 'bg-emerald-100/70 text-emerald-950 font-semibold'
                              : isNext
                              ? 'bg-amber-100/80 text-amber-950 font-bold border border-amber-300'
                              : 'text-stone-500'
                          }`}
                        >
                          <span className="truncate">
                            {sk.tierName.split(' ')[0]}: {sk.name}
                          </span>
                          <span className="font-mono text-[8.5px] shrink-0 ml-1">
                            {isLearned ? '✅ Đã mở' : isNext ? `⚡ Mở kế tiếp (${sk.costMp} MP)` : `[${sk.costMp} MP]`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-200/80 flex items-center justify-between">
                <span className={`text-[10px] font-bold flex items-center gap-1 ${req.specialConditionMet ? 'text-emerald-700' : 'text-rose-600'}`}>
                  {req.specialConditionMet ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                  {req.specialConditionMet ? 'Đủ điều kiện' : 'Bị chặn rào cản'}
                </span>
                <button
                  onClick={() => handleBreakthrough(1, item.key)}
                  className={`px-3 py-1.5 rounded-lg font-bold font-serif text-xs transition cursor-pointer shadow-xs hover:scale-105 ${item.btnBg}`}
                >
                  Đột Phá Lên {req.targetTier.split(' ')[0]}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Ma Pháp Ghép */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-300 space-y-2">
        <h4 className="font-bold text-amber-950 text-xs flex items-center gap-1.5 font-serif">
          <Layers className="w-4 h-4 text-amber-700" /> Phân Nhánh Dị Biến &amp; Ma Pháp Ghép (Hybrid Magic)
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
          <div className="p-2.5 rounded-lg bg-white border border-amber-200">
            <strong className="text-amber-800 block mb-0.5">Nham Thạch (Lava):</strong>
            <span className="text-stone-700">Lửa + Đất. Nung chảy kết cấu đất đá thành dung nham xuyên thấu Touki.</span>
          </div>
          <div className="p-2.5 rounded-lg bg-white border border-sky-200">
            <strong className="text-sky-800 block mb-0.5">Lôi Điện &amp; Bão Sét:</strong>
            <span className="text-stone-700">Gió + Nước. Xung điện áp cao tức thì, không thể né tránh bằng mắt thường.</span>
          </div>
          <div className="p-2.5 rounded-lg bg-white border border-indigo-200">
            <strong className="text-indigo-800 block mb-0.5">Sương Mù Ảo Ảnh:</strong>
            <span className="text-stone-700">Nước + Lửa. Che khuất tầm nhìn diện rộng, làm nhiễu loạn cảm ứng Mana.</span>
          </div>
        </div>
      </div>
    </div>
  );

  // Branch 2: Thần Thánh & Kết Giới Học
  const renderBranch2 = () => (
    <div className="space-y-4">
      <div className="bg-cyan-50/80 p-4 rounded-xl border border-cyan-300 shadow-xs">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="font-serif font-bold text-cyan-950 text-sm flex items-center gap-2">
            <PlusCircle className="w-4 h-4 text-cyan-600" />
            Nhánh 2: Ma Pháp Thần Thánh &amp; Kết Giới Học (Chữa Trị &amp; Bảo Hộ)
          </h3>
          <span className="px-2 py-0.5 rounded bg-cyan-200/80 text-cyan-900 text-[10px] font-bold">
            Trị Liệu • Giải Độc • Kết Giới
          </span>
        </div>
        <p className="text-stone-700 text-xs mt-1">
          Hệ thống pháp thuật thiêng liêng xuất xứ từ giáo phái Millis và các bí thuật bảo hộ, khúc xạ ma pháp không gian.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {[
          {
            key: 'healing',
            name: 'Trị Liệu (Healing)',
            tier: character.magic.healing,
            desc: 'Cầm máu ngoài da -> Chữa lành cơ bắp -> Nối liền gân cốt vỡ vụn -> Tái tạo nội tạng tổn thương -> [Thánh: Hồi phục sinh mệnh diện rộng]',
          },
          {
            key: 'detox',
            name: 'Giải Độc & Giải Nguyền',
            tier: character.magic.detox,
            desc: 'Giải độc thực vật -> Hóa giải nọc ma thú -> Trục xuất nguyền rủa cấp thấp -> [Thánh: Tịnh hóa chướng khí ô uế]',
          },
          {
            key: 'barrier',
            name: 'Kết Giới (Barrier Arts)',
            tier: character.magic.barrier,
            desc: 'Màng chắn mana đơn hướng -> Khiên khúc xạ ma pháp -> Lồng giam không gian -> [Thánh: Thánh Vực Bất Xâm Phạm]',
          },
        ].map((item) => {
          const req = getBreakthroughRequirements(item.tier, 'magic', item.key, character);
          return (
            <div key={item.key} className="p-4 rounded-xl bg-cyan-50/70 border border-cyan-200 flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-serif font-bold text-sm text-cyan-950">{item.name}</span>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-white border border-stone-300 text-stone-900">
                    {item.tier}
                  </span>
                </div>
                <p className="text-stone-700 text-[11px] mb-3 leading-relaxed">{item.desc}</p>
                
                <div className="bg-white/90 p-2.5 rounded-lg border border-stone-200 space-y-1 text-[11px]">
                  <div className="flex justify-between text-stone-800">
                    <span>Mục tiêu:</span>
                    <strong className="text-cyan-800">{req.targetTier}</strong>
                  </div>
                  <div className="flex justify-between text-stone-600 font-mono">
                    <span>Chi phí:</span>
                    <span>{req.spRequired} SP | {req.kpRequired} KP</span>
                  </div>
                  <div className="text-[10px] text-stone-600 italic pt-1 border-t border-stone-100">
                    Rào cản: {req.specialConditionDescription}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-200/80 flex items-center justify-between">
                <span className={`text-[10px] font-bold ${req.specialConditionMet ? 'text-emerald-700' : 'text-rose-600'}`}>
                  {req.specialConditionMet ? '✓ Đạt chuẩn' : '✗ Chưa đạt'}
                </span>
                <button
                  onClick={() => handleBreakthrough(2, item.key)}
                  className="px-3 py-1.5 rounded-lg bg-cyan-700 hover:bg-cyan-600 active:bg-cyan-800 text-white font-bold font-serif text-xs transition cursor-pointer shadow-xs hover:scale-105"
                >
                  Đột Phá Lên {req.targetTier.split(' ')[0]}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // Branch 3: Tam Đại Kiếm Phái Truyền Thừa
  const renderBranch3 = () => (
    <div className="space-y-4">
      <div className="bg-red-50/80 p-4 rounded-xl border border-red-300 shadow-xs">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="font-serif font-bold text-red-950 text-sm flex items-center gap-2">
            <Sword className="w-4 h-4 text-red-600" />
            Nhánh 3: Tam Đại Kiếm Phái Truyền Thừa Chuyên Sâu
          </h3>
          <span className="px-2 py-0.5 rounded bg-red-200/80 text-red-900 text-[10px] font-bold">
            Kiếm Thần • Thủy Thần • Bắc Thần
          </span>
        </div>
        <p className="text-stone-700 text-xs mt-1">
          Đỉnh cao Đấu Khí và kỹ năng đoạt mạng cận chiến. Từ rèn bước chân đến nhát chém siêu thanh, phản đòn 8 hướng và mưu lược sinh tồn.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {[
          {
            key: 'swordGod',
            name: 'Kiếm Thần Phái (Sword God)',
            tier: character.swordsmanship.swordGod,
            color: 'text-amber-900',
            bg: 'bg-amber-50/70 border-amber-200',
            btnBg: 'bg-amber-600 hover:bg-amber-500 text-white',
            desc: 'Tốc độ & sát thủ 1 đòn. Thánh: [Kiếm Chi Quang Tốc (Long Haul Sword)]. Vương: [Vô Ảnh Trảm]. Đế/Thần: [Quang Chi Tuyệt Diệt].',
          },
          {
            key: 'waterGod',
            name: 'Thủy Thần Phái (Water God)',
            tier: character.swordsmanship.waterGod,
            color: 'text-blue-900',
            bg: 'bg-blue-50/70 border-blue-200',
            btnBg: 'bg-blue-600 hover:bg-blue-500 text-white',
            desc: 'Phòng thủ & phản công tuyệt đối. Thượng: [Lưu Thủy Đoán Bộ]. Thánh: [Bát Phương Phản Kích]. Vương: [Tước Kiếm Lưu bẻ gãy kiếm].',
          },
          {
            key: 'northGod',
            name: 'Bắc Thần Phái (North God)',
            tier: character.swordsmanship.northGod,
            color: 'text-emerald-900',
            bg: 'bg-emerald-50/70 border-emerald-200',
            btnBg: 'bg-emerald-600 hover:bg-emerald-500 text-white',
            desc: 'Biến ảo, mưu lược & sinh tồn. Thượng: Kiếm thuật hỗn hợp. Thánh: [Bắc Thần Thập Tự Kiếm]. Vương: Dùng cơ thể làm mồi nhử kết liễu.',
          },
        ].map((item) => {
          const req = getBreakthroughRequirements(item.tier, 'sword', item.key, character);
          return (
            <div key={item.key} className={`p-4 rounded-xl border ${item.bg} flex flex-col justify-between shadow-xs`}>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`font-serif font-bold text-sm ${item.color}`}>{item.name}</span>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-white border border-stone-300 text-stone-900">
                    {item.tier}
                  </span>
                </div>
                <p className="text-stone-700 text-[11px] mb-3 leading-relaxed">{item.desc}</p>
                
                <div className="bg-white/90 p-2.5 rounded-lg border border-stone-200 space-y-1 text-[11px]">
                  <div className="flex justify-between text-stone-800">
                    <span>Mục tiêu:</span>
                    <strong className={item.color}>{req.targetTier}</strong>
                  </div>
                  <div className="flex justify-between text-stone-600 font-mono">
                    <span>Chi phí:</span>
                    <span>{req.spRequired} SP | {req.kpRequired} KP</span>
                  </div>
                  <div className="text-[10px] text-stone-600 italic pt-1 border-t border-stone-100">
                    Yêu cầu: {req.specialConditionDescription}
                  </div>
                </div>

                {/* Danh sách chiêu thức kiếm pháp mở khóa ở mỗi cấp bậc */}
                <div className="mt-2.5 p-2 rounded-lg bg-stone-50/90 border border-stone-200 text-[10px] space-y-1">
                  <div className="font-bold text-stone-800 flex items-center justify-between text-[10px]">
                    <span className="flex items-center gap-1">
                      <Sword className="w-3 h-3 text-amber-600" /> Chiêu thức ở mỗi cấp bậc:
                    </span>
                    <span className="text-[9px] text-stone-500 font-mono">7 Cấp Bậc</span>
                  </div>
                  <div className="space-y-0.5 max-h-24 overflow-y-auto pr-0.5">
                    {(SWORD_SKILLS_CATALOG[item.key] || []).map((sk) => {
                      const curRank = TIER_RANK_MAP[item.tier as PowerTier] || 0;
                      const isLearned = curRank >= sk.tier;
                      const isNext = sk.tier === curRank + 1;
                      return (
                        <div
                          key={sk.id}
                          className={`flex items-center justify-between px-1.5 py-0.5 rounded text-[9px] ${
                            isLearned
                              ? 'bg-amber-100/70 text-amber-950 font-semibold'
                              : isNext
                              ? 'bg-amber-200/80 text-amber-950 font-bold border border-amber-400'
                              : 'text-stone-500'
                          }`}
                        >
                          <span className="truncate">
                            {sk.tierName.split(' ')[0]}: {sk.name}
                          </span>
                          <span className="font-mono text-[8.5px] shrink-0 ml-1">
                            {isLearned ? '✅ Đã mở' : isNext ? `⚡ Mở kế tiếp (${sk.costStamina} STA)` : `[${sk.costStamina} STA]`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-200/80 flex items-center justify-between">
                <span className={`text-[10px] font-bold ${req.specialConditionMet ? 'text-emerald-700' : 'text-rose-600'}`}>
                  {req.specialConditionMet ? '✓ Đủ điều kiện' : '✗ Bị chặn rào cản'}
                </span>
                <button
                  onClick={() => handleBreakthrough(3, item.key)}
                  className={`px-3 py-1.5 rounded-lg font-bold font-serif text-xs transition cursor-pointer shadow-xs hover:scale-105 ${item.btnBg}`}
                >
                  Đột Phá Kiếm Cảnh
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // Branch 4: Ma Đạo Trận & Chế Tác Khí
  const renderBranch4 = () => (
    <div className="space-y-4">
      <div className="bg-emerald-50/80 p-4 rounded-xl border border-emerald-300 shadow-xs">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="font-serif font-bold text-emerald-950 text-sm flex items-center gap-2">
            <Hammer className="w-4 h-4 text-emerald-700" />
            Nhánh 4: Ma Đạo Trận, Chế Tác Khí &amp; Khế Ước Triệu Hồi
          </h3>
          <span className="px-2 py-0.5 rounded bg-emerald-200/80 text-emerald-900 text-[10px] font-bold">
            Trận Pháp • Luyện Kim • Triệu Hồi
          </span>
        </div>
        <p className="text-stone-700 text-xs mt-1">
          Khoa học ma thuật cổ xưa: Khắc trận pháp dịch chuyển, tôi luyện ma cụ, chế tạo Ma Giáp (Magic Armor) và triệu hồi tinh linh nguyên tố.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {[
          {
            key: 'formations',
            name: 'Khắc Khóa Trận Pháp',
            tier: prog.crafting.formations,
            desc: 'Vẽ trận dịch chuyển khoảng cách ngắn -> Khắc bẫy ma pháp tự kích hoạt -> Trận phong tỏa dòng chảy mana.',
          },
          {
            key: 'artifactCrafting',
            name: 'Luyện Kim & Chế Tạo Ma Cụ',
            tier: prog.crafting.artifactCrafting,
            desc: 'Tôi luyện khoáng thạch dẫn mana -> Rèn vũ khí ma thuật -> Tạo lõi năng lượng cho Ma Giáp (Magic Armor).',
          },
          {
            key: 'summoningContracts',
            name: 'Triệu Hồi Thuật (Summoning)',
            tier: prog.crafting.summoningContracts,
            desc: 'Ký khế ước với tinh linh nguyên tố -> Triệu hồi ma thú trinh sát -> Khế ước hộ mệnh cổ đại.',
          },
        ].map((item) => {
          const req = getBreakthroughRequirements(item.tier, 'craft', item.key, character);
          return (
            <div key={item.key} className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-serif font-bold text-sm text-emerald-950">{item.name}</span>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-white border border-stone-300 text-stone-900">
                    {item.tier}
                  </span>
                </div>
                <p className="text-stone-700 text-[11px] mb-3 leading-relaxed">{item.desc}</p>
                
                <div className="bg-white/90 p-2.5 rounded-lg border border-stone-200 space-y-1 text-[11px]">
                  <div className="flex justify-between text-stone-800">
                    <span>Mục tiêu tiếp theo:</span>
                    <strong className="text-emerald-800">{req.targetTier}</strong>
                  </div>
                  <div className="flex justify-between text-stone-600 font-mono">
                    <span>Chi phí:</span>
                    <span>{req.spRequired} SP | {req.kpRequired} KP</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-200/80 flex items-center justify-between">
                <span className={`text-[10px] font-bold ${req.specialConditionMet ? 'text-emerald-700' : 'text-rose-600'}`}>
                  {req.specialConditionMet ? '✓ Đạt chuẩn' : '✗ Chưa đạt'}
                </span>
                <button
                  onClick={() => handleBreakthrough(4, item.key)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 active:bg-emerald-800 text-white font-bold font-serif text-xs transition cursor-pointer shadow-xs hover:scale-105"
                >
                  Nghiên Cứu
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // Branch 5: Ma Kiếm Sĩ & Đấu Khí Biến Tính
  const renderBranch5 = () => (
    <div className="space-y-4">
      <div className="bg-purple-50/80 p-4 rounded-xl border border-purple-300 shadow-xs">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="font-serif font-bold text-purple-950 text-sm flex items-center gap-2">
            <Shield className="w-4 h-4 text-purple-700" />
            Nhánh 5: Ma Kiếm Sĩ &amp; Đấu Khí Biến Tính
          </h3>
          <span className="px-2 py-0.5 rounded bg-purple-200/80 text-purple-900 text-[10px] font-bold">
            Ma Đao • Đấu Khí Bạo Phát • Thể Thuật Thú
          </span>
        </div>
        <p className="text-stone-700 text-xs mt-1">
          Dung hợp tinh túy giữa Ma pháp và Kiếm thuật, truyền ma lực nguyên tố trực tiếp vào Đấu Khí và giải phóng bản năng hoang dã.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {[
          {
            key: 'elementalCoating',
            name: 'Ma Đao Thể Thuật (Elemental Coating)',
            tier: prog.magicKnight.elementalCoating,
            desc: 'Truyền trực tiếp ma pháp nguyên tố vào Đấu Khí bao quanh vũ khí (Kiếm Lửa thiêu đốt, Kiếm Sét gây tê liệt).',
          },
          {
            key: 'toukiSurge',
            name: 'Đấu Khí Bạo Phát (Touki Surge)',
            tier: prog.magicKnight.toukiSurge,
            desc: 'Cường hóa cơ bắp đến cực hạn, tăng sức bật và độ bền chịu đòn mà không cần mặc giáp nặng.',
          },
          {
            key: 'beastMartial',
            name: 'Thể Thuật Thú Tộc (Beast Martial Arts)',
            tier: prog.magicKnight.beastMartial,
            desc: 'Vận dụng bản năng hoang dã, móng vuốt và tiếng gầm rúng động tinh thần đối thủ.',
          },
        ].map((item) => {
          const req = getBreakthroughRequirements(item.tier, 'knight', item.key, character);
          return (
            <div key={item.key} className="p-4 rounded-xl bg-purple-50/70 border border-purple-200 flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-serif font-bold text-sm text-purple-950">{item.name}</span>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-white border border-stone-300 text-stone-900">
                    {item.tier}
                  </span>
                </div>
                <p className="text-stone-700 text-[11px] mb-3 leading-relaxed">{item.desc}</p>
                
                <div className="bg-white/90 p-2.5 rounded-lg border border-stone-200 space-y-1 text-[11px]">
                  <div className="flex justify-between text-stone-800">
                    <span>Mục tiêu tiếp theo:</span>
                    <strong className="text-purple-800">{req.targetTier}</strong>
                  </div>
                  <div className="flex justify-between text-stone-600 font-mono">
                    <span>Chi phí:</span>
                    <span>{req.spRequired} SP | {req.kpRequired} KP</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-200/80 flex items-center justify-between">
                <span className={`text-[10px] font-bold ${req.specialConditionMet ? 'text-emerald-700' : 'text-rose-600'}`}>
                  {req.specialConditionMet ? '✓ Đạt chuẩn' : '✗ Chưa đạt'}
                </span>
                <button
                  onClick={() => handleBreakthrough(5, item.key)}
                  className="px-3 py-1.5 rounded-lg bg-purple-700 hover:bg-purple-600 active:bg-purple-800 text-white font-bold font-serif text-xs transition cursor-pointer shadow-xs hover:scale-105"
                >
                  Cường Hóa
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // Branch 6: Ma Nhãn & Cảm Quan Linh Hồn
  const renderBranch6 = () => (
    <div className="space-y-4">
      <div className="bg-indigo-50/80 p-4 rounded-xl border border-indigo-300 shadow-xs">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="font-serif font-bold text-indigo-950 text-sm flex items-center gap-2">
            <Eye className="w-4 h-4 text-indigo-700" />
            Nhánh 6: Ma Nhãn &amp; Cảm Quan Linh Hồn (Kỳ Ngộ Huyền Bí)
          </h3>
          <span className="px-2 py-0.5 rounded bg-indigo-200/80 text-indigo-900 text-[10px] font-bold">
            4 Loại Ma Nhãn Truyền Thuyết
          </span>
        </div>
        <p className="text-stone-700 text-xs mt-1">
          Chỉ có thể đạt được khi gặp Ma Giới Đại Đế Kishirika Kishirisu hoặc cấy ghép Ma Nhãn từ di tích cổ đại.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {[
          {
            key: 'foresightEye',
            name: 'Dự Tri Nhãn (Eye of Foresight)',
            active: prog.demonEyes.foresightEye,
            desc: 'Nhìn thấy trước vài giây tương lai gần trong chiến đấu, giúp né tránh mọi đòn tất sát hoặc bắt bài nhịp độ.',
          },
          {
            key: 'xrayEye',
            name: 'Thấu Thị Nhãn (Eye of X-Ray)',
            active: prog.demonEyes.xrayEye,
            desc: 'Nhìn xuyên vật cản, địa hình và cấu trúc bên trong cơ thể kẻ địch để phát hiện sơ hở chí mạng.',
          },
          {
            key: 'manaEye',
            name: 'Ma Lực Nhãn (Eye of Mana)',
            active: prog.demonEyes.manaEye,
            desc: 'Nhìn thấy rõ dòng chảy và sự tích tụ mana của đối phương, phát hiện sớm bẫy ma pháp hoặc thuật thức đang niệm.',
          },
          {
            key: 'farSightEye',
            name: 'Vạn Lý Nhãn (Eye of Far Sight)',
            active: prog.demonEyes.farSightEye,
            desc: 'Mở rộng tầm nhìn xa hàng chục dặm, bao quát toàn bộ chiến trường và phòng ngừa phục kích từ xa.',
          },
        ].map((item) => (
          <div key={item.key} className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-serif font-bold text-sm text-indigo-950 flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-indigo-600" /> {item.name}
                </span>
                <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded border ${
                  item.active 
                    ? 'bg-emerald-100 border-emerald-400 text-emerald-900' 
                    : 'bg-white border-stone-300 text-stone-600'
                }`}>
                  {item.active ? 'ĐÃ THỨC TỈNH' : 'CHƯA MỞ KHÓA'}
                </span>
              </div>
              <p className="text-stone-700 text-[11px] mb-3 leading-relaxed">{item.desc}</p>
            </div>

            <div className="mt-3 pt-3 border-t border-stone-200/80 flex items-center justify-between text-[11px]">
              <span className={item.active ? 'text-emerald-700 font-bold' : 'text-stone-600'}>
                {item.active ? '★ Đã thức tỉnh & Kích hoạt' : 'Kỳ ngộ Kishirika hoặc Di tích'}
              </span>
              {!item.active && (
                <button
                  onClick={() => {
                    soundFx.playMagicCast();
                    const res = awakenDemonEye(character, item.key as any);
                    if (res.success) {
                      soundFx.playLevelUp();
                      onUpdateCharacter(res.updatedCharacter);
                      if (onShowToast) onShowToast(res.message);
                      if (onLogMessage) onLogMessage(res.message);
                    } else {
                      soundFx.playDeathGong();
                      if (onShowToast) onShowToast(res.message);
                    }
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold font-serif text-[11px] transition cursor-pointer shadow-xs hover:scale-105"
                >
                  Thức Tỉnh (180 SP | 80 KP)
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-md text-stone-900">
      <div className="bg-white/95 border-2 border-amber-400/90 rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-[0_20px_60px_rgba(217,119,6,0.25)] overflow-hidden font-vietnam backdrop-blur-xl">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-100 via-amber-50 to-orange-100 px-6 py-4 border-b border-amber-300 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-amber-950 shadow-sm border border-amber-400">
              <Zap className="w-5 h-5 text-amber-950 animate-pulse" />
            </div>
            <div>
              <h2 className="font-cinzel font-bold text-base sm:text-lg text-amber-950 tracking-wide">
                HỆ THỐNG CÂY KỸ NĂNG ĐA DIỆN (6 NHÁNH CHUYÊN SÂU)
              </h2>
              <p className="text-xs text-amber-800">
                Thang đo độ khó bình cảnh lũy tiến tận cùng (Exponential Bottlenecks: Thánh ➔ Vương ➔ Đế ➔ Thần)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-600 hover:text-stone-950 hover:bg-amber-200/60 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Resource Banner */}
        <div className="bg-stone-50/90 px-6 py-3 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 bg-amber-100 border border-amber-300 px-3 py-1.5 rounded-lg shadow-2xs">
              <Sparkles className="w-4 h-4 text-amber-700" />
              <span className="text-amber-900">SP Khả dụng:</span>
              <strong className="font-mono text-amber-950 text-sm font-bold">{prog.skillPoints}</strong>
            </div>

            <div className="flex items-center gap-1.5 bg-indigo-100 border border-indigo-300 px-3 py-1.5 rounded-lg shadow-2xs">
              <Award className="w-4 h-4 text-indigo-700" />
              <span className="text-indigo-900">KP Khả dụng:</span>
              <strong className="font-mono text-indigo-950 text-sm font-bold">{prog.knowledgePoints}</strong>
            </div>

            <div className="flex items-center gap-1.5 bg-rose-100 border border-rose-300 px-3 py-1.5 rounded-lg shadow-2xs">
              <HeartPulse className="w-4 h-4 text-rose-700" />
              <span className="text-rose-900">Lần Sinh Tử (Cấp Vương):</span>
              <strong className={`font-mono text-sm font-bold ${prog.nearDeathCount >= 5 ? 'text-emerald-800' : 'text-rose-800'}`}>
                {prog.nearDeathCount}/5
              </strong>
            </div>
          </div>

          {/* Talent Information & Scaling Banner */}
          {(() => {
            const talentDef = TALENTS_CATALOG[prog.innateTalent.id || prog.innateTalent.type];
            const neededNearDeath = talentDef?.tier === 'godkin' ? 1 : talentDef?.tier === 'legendary' ? 2 : talentDef?.tier === 'genius' ? 3 : 5;
            return (
              <div className="w-full mt-2 p-3 rounded-xl bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 border border-amber-500/40 text-stone-100 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-inner">
                <div className="flex items-start gap-2.5">
                  <span className="text-2xl p-1.5 bg-black/50 rounded-lg border border-white/10 shrink-0">
                    {talentDef?.icon || '🌟'}
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs uppercase tracking-wider text-amber-400 font-bold font-sans">
                        Thiên Phú Căn Cơ:
                      </span>
                      <span className="font-bold font-cinzel text-sm text-stone-100">
                        [{prog.innateTalent.name}]
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/50 text-amber-300 font-mono font-bold">
                        {talentDef?.tierName || prog.innateTalent.tierName || 'Phàm nhân'} • Tỷ lệ {talentDef?.tierProbability || prog.innateTalent.tierProbability || '50%'}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/50 text-blue-300 font-mono font-bold">
                        RANK: {prog.overallRank}
                      </span>
                    </div>
                    {/* Effects chips */}
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {(talentDef?.effectsSummary || prog.innateTalent.effectsSummary || []).map((eff, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-black/40 border border-white/10 text-stone-300 font-vietnam">
                          {eff}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2 text-xs font-mono bg-black/40 px-3 py-1.5 rounded-lg border border-white/10">
                  <span className="text-stone-400">Sinh tử Cấp Vương:</span>
                  <span className={`font-bold ${prog.nearDeathCount >= neededNearDeath ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {prog.nearDeathCount}/{neededNearDeath} lần
                  </span>
                </div>
              </div>
            );
          })()}
        </div>

        {/* 6 Branch Selector Tabs + View ALL Tab */}
        <div className="flex border-b border-stone-200 bg-white overflow-x-auto text-xs font-serif font-bold p-1 gap-1">
          <button
            onClick={() => setActiveBranch(0)}
            className={`px-3.5 py-2.5 rounded-xl transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeBranch === 0 
                ? 'bg-amber-500 text-amber-950 shadow-xs' 
                : 'text-stone-600 hover:text-stone-950 hover:bg-stone-100'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-950" />
            🌟 Toàn Bộ 6 Nhánh (Đầy đủ)
          </button>

          <button
            onClick={() => setActiveBranch(1)}
            className={`px-3.5 py-2.5 rounded-xl transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeBranch === 1 
                ? 'bg-amber-100 text-amber-950 border border-amber-400 shadow-xs' 
                : 'text-stone-600 hover:text-stone-950 hover:bg-stone-100'
            }`}
          >
            <FlameKindling className="w-4 h-4 text-amber-600" />
            1. Tứ Đại Nguyên Tố
          </button>

          <button
            onClick={() => setActiveBranch(2)}
            className={`px-3.5 py-2.5 rounded-xl transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeBranch === 2 
                ? 'bg-cyan-100 text-cyan-950 border border-cyan-400 shadow-xs' 
                : 'text-stone-600 hover:text-stone-950 hover:bg-stone-100'
            }`}
          >
            <PlusCircle className="w-4 h-4 text-cyan-600" />
            2. Thần Thánh &amp; Kết Giới
          </button>

          <button
            onClick={() => setActiveBranch(3)}
            className={`px-3.5 py-2.5 rounded-xl transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeBranch === 3 
                ? 'bg-red-100 text-red-950 border border-red-400 shadow-xs' 
                : 'text-stone-600 hover:text-stone-950 hover:bg-stone-100'
            }`}
          >
            <Sword className="w-4 h-4 text-red-600" />
            3. Tam Đại Kiếm Phái
          </button>

          <button
            onClick={() => setActiveBranch(4)}
            className={`px-3.5 py-2.5 rounded-xl transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeBranch === 4 
                ? 'bg-emerald-100 text-emerald-950 border border-emerald-400 shadow-xs' 
                : 'text-stone-600 hover:text-stone-950 hover:bg-stone-100'
            }`}
          >
            <Hammer className="w-4 h-4 text-emerald-600" />
            4. Trận Pháp &amp; Ma Cụ
          </button>

          <button
            onClick={() => setActiveBranch(5)}
            className={`px-3.5 py-2.5 rounded-xl transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeBranch === 5 
                ? 'bg-purple-100 text-purple-950 border border-purple-400 shadow-xs' 
                : 'text-stone-600 hover:text-stone-950 hover:bg-stone-100'
            }`}
          >
            <Shield className="w-4 h-4 text-purple-600" />
            5. Ma Kiếm Sĩ &amp; Thể Thuật
          </button>

          <button
            onClick={() => setActiveBranch(6)}
            className={`px-3.5 py-2.5 rounded-xl transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeBranch === 6 
                ? 'bg-indigo-100 text-indigo-950 border border-indigo-400 shadow-xs' 
                : 'text-stone-600 hover:text-stone-950 hover:bg-stone-100'
            }`}
          >
            <Eye className="w-4 h-4 text-indigo-600" />
            6. Ma Nhãn Huyền Bí
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-xs leading-relaxed flex-1">
          {/* Notification banner if action was performed */}
          {lastResult && (
            <div
              className={`p-3.5 rounded-xl border flex items-start gap-2.5 ${
                lastResult.success
                  ? 'bg-emerald-50 border-emerald-400 text-emerald-950'
                  : 'bg-red-50 border-red-400 text-red-950'
              }`}
            >
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="whitespace-pre-line text-xs font-vietnam font-medium">{lastResult.message}</div>
            </div>
          )}

          {/* MODE 0: TOÀN BỘ 6 NHÁNH CÙNG LÚC */}
          {activeBranch === 0 && (
            <div className="space-y-8">
              <div className="p-4 rounded-xl bg-gradient-to-r from-amber-100/80 via-white to-amber-100/80 border border-amber-300 text-center space-y-1">
                <span className="font-cinzel font-bold text-amber-950 text-sm block">
                  CÂY KỸ NĂNG TỰ DO: 6 NHÁNH PHÁT TRIỂN ĐỘC LẬP
                </span>
                <p className="text-stone-700 text-xs">
                  Bạn có thể xem và trực tiếp đột phá mọi kỹ năng ở cả 6 nhánh bên dưới hoặc chọn tab riêng ở trên để tập trung.
                </p>
              </div>

              {/* Branch 1 */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 border-b border-amber-300 pb-1.5">
                  <span className="w-6 h-6 rounded-full bg-amber-500 text-amber-950 font-bold flex items-center justify-center text-xs">1</span>
                  <h3 className="font-serif font-bold text-sm text-amber-950 uppercase tracking-wide">
                    Nhánh 1: Tứ Đại Nguyên Tố &amp; Ma Pháp Ghép
                  </h3>
                </div>
                {renderBranch1()}
              </section>

              {/* Branch 2 */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 border-b border-cyan-300 pb-1.5">
                  <span className="w-6 h-6 rounded-full bg-cyan-600 text-white font-bold flex items-center justify-center text-xs">2</span>
                  <h3 className="font-serif font-bold text-sm text-cyan-950 uppercase tracking-wide">
                    Nhánh 2: Ma Pháp Thần Thánh &amp; Kết Giới Học
                  </h3>
                </div>
                {renderBranch2()}
              </section>

              {/* Branch 3 */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 border-b border-red-300 pb-1.5">
                  <span className="w-6 h-6 rounded-full bg-red-600 text-white font-bold flex items-center justify-center text-xs">3</span>
                  <h3 className="font-serif font-bold text-sm text-red-950 uppercase tracking-wide">
                    Nhánh 3: Tam Đại Kiếm Phái Truyền Thừa Chuyên Sâu
                  </h3>
                </div>
                {renderBranch3()}
              </section>

              {/* Branch 4 */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 border-b border-emerald-300 pb-1.5">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">4</span>
                  <h3 className="font-serif font-bold text-sm text-emerald-950 uppercase tracking-wide">
                    Nhánh 4: Ma Đạo Trận, Chế Tác Khí &amp; Triệu Hồi Thuật
                  </h3>
                </div>
                {renderBranch4()}
              </section>

              {/* Branch 5 */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 border-b border-purple-300 pb-1.5">
                  <span className="w-6 h-6 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-xs">5</span>
                  <h3 className="font-serif font-bold text-sm text-purple-950 uppercase tracking-wide">
                    Nhánh 5: Ma Kiếm Sĩ &amp; Đấu Khí Biến Tính
                  </h3>
                </div>
                {renderBranch5()}
              </section>

              {/* Branch 6 */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 border-b border-indigo-300 pb-1.5">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">6</span>
                  <h3 className="font-serif font-bold text-sm text-indigo-950 uppercase tracking-wide">
                    Nhánh 6: Ma Nhãn &amp; Cảm Quan Linh Hồn (Kỳ Ngộ Huyền Bí)
                  </h3>
                </div>
                {renderBranch6()}
              </section>
            </div>
          )}

          {/* INDIVIDUAL BRANCH VIEWS */}
          {activeBranch === 1 && renderBranch1()}
          {activeBranch === 2 && renderBranch2()}
          {activeBranch === 3 && renderBranch3()}
          {activeBranch === 4 && renderBranch4()}
          {activeBranch === 5 && renderBranch5()}
          {activeBranch === 6 && renderBranch6()}

          {/* Near-death records summary */}
          <div className="bg-rose-50/80 p-4 rounded-xl border border-rose-300 space-y-2">
            <h4 className="font-bold text-rose-950 text-xs flex items-center gap-2 font-serif">
              <Skull className="w-4 h-4 text-rose-600" /> Hồ Sơ Thập Tử Nhất Sinh ({prog.nearDeathCount}/5 Lần)
            </h4>
            <p className="text-stone-700 text-[11px]">
              Để phá vỡ "Vực thẳm của phàm nhân" bước vào Vương cấp (King), cơ thể và ý chí người phàm bắt buộc phải vượt qua tối thiểu 5 lần cận kề cái chết thực sự.
            </p>
            {prog.nearDeathMemories.length > 0 ? (
              <div className="space-y-1.5 mt-2">
                {prog.nearDeathMemories.map((mem, idx) => (
                  <div key={idx} className="p-2 rounded-lg bg-white border border-rose-200 text-[11px] text-stone-800">
                    <strong className="text-rose-700">Lần {idx + 1}:</strong> {mem}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-stone-500 italic text-[11px]">
                (Chưa có lần cận kề cái chết nào được ghi nhận. Hãy đối đầu thử thách nguy hiểm để tôi luyện ý chí!)
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-stone-50 px-6 py-3 border-t border-stone-200 flex items-center justify-between text-xs">
          <span className="text-stone-600">
            Hệ thống Cây Kỹ Năng Đa Diện: 6 Nhánh độc lập &amp; Rào cản lũy tiến tận cùng.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-amber-950 font-bold transition cursor-pointer shadow-sm hover:scale-105"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
