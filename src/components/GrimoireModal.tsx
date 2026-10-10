import React from 'react';
import { 
  BookOpen, 
  X, 
  Sparkles, 
  Sword, 
  Shield, 
  Award, 
  Globe, 
  Zap, 
  Flame, 
  Droplets, 
  Mountain, 
  Wind 
} from 'lucide-react';
import { POWER_TIERS, SWORD_STYLES_INFO, MAGIC_ELEMENTS_INFO } from '../services/mushokuRules';

interface GrimoireModalProps {
  onClose: () => void;
}

export const GrimoireModal: React.FC<GrimoireModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md">
      <div className="bg-stone-900 border-2 border-amber-800/80 rounded-2xl max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl text-stone-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-stone-950 via-amber-950 to-stone-950 px-6 py-4 border-b border-amber-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <h2 className="font-serif font-bold text-lg text-amber-200">
              Đại Bách Khoa Toàn Thư Đại Lục (World Codex & RPG Mechanics)
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs sm:text-sm font-sans leading-relaxed">
          {/* Section 1: 7 Power Tiers */}
          <div className="space-y-2">
            <h3 className="font-serif font-bold text-base text-amber-400 flex items-center gap-2">
              <Award className="w-4 h-4" /> 1. Hệ Thống 7 Cấp Bậc Chuẩn (Power Tiers)
            </h3>
            <p className="text-stone-300">
              Áp dụng thống nhất cho cả Ma pháp, Kiếm thuật và phân loại hiểm họa ma vật trên toàn thế giới:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-xs">
              {POWER_TIERS.filter(t => t !== 'Chưa học').map((tier, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-stone-950 border border-stone-800 flex flex-col justify-between"
                >
                  <span className="text-amber-500 font-bold">Cấp {idx + 1}</span>
                  <span className="text-stone-200 font-serif mt-1">{tier}</span>
                </div>
              ))}
            </div>
            <p className="text-stone-400 text-xs italic">
              * Từ cấp Thánh trở lên, một cá nhân có thể thay đổi cục diện chiến tranh hoặc hủy diệt cả một đạo quân. Cấp Thần là những tồn tại huyền thoại chạm đến cảnh giới Thần thế.
            </p>
          </div>

          {/* Section 2: Magic & Chantless Rules */}
          <div className="space-y-3 border-t border-stone-800 pt-4">
            <h3 className="font-serif font-bold text-base text-cyan-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> 2. Cơ Chế Ma Pháp & Kỹ Năng [Vô Niệm Chú]
            </h3>
            <div className="bg-stone-950 p-3 rounded-xl border border-stone-800 space-y-2 text-stone-300 text-xs">
              <div className="font-bold text-amber-300">Quy trình 3 bước thi triển ma pháp:</div>
              {MAGIC_ELEMENTS_INFO.threeSteps.map((step, idx) => (
                <div key={idx} className="pl-2 border-l border-cyan-700/60 font-mono text-[11px] text-cyan-200">
                  {step}
                </div>
              ))}
              <div className="pt-2 text-stone-300">
                <strong className="text-amber-400">Bí mật [Vô Niệm Chú] (Chantless Magic):</strong> Phần lớn pháp sư trên thế giới học ma thuật qua câu chú ngữ định sẵn. Một khi đã quen với câu thần chú, não bộ mất đi khả năng cảm nhận dòng chảy mana tự nhiên. Chỉ những đứa trẻ luyện tập trước 5 tuổi — khi chưa biết nói hoặc biết chữ — mới có thể thao túng trực tiếp 3 bước trên bằng ý niệm, thi triển phép thuật tức thì không cần niệm!
              </div>
            </div>
          </div>

          {/* Section 3: 3 Sword Styles */}
          <div className="space-y-3 border-t border-stone-800 pt-4">
            <h3 className="font-serif font-bold text-base text-red-400 flex items-center gap-2">
              <Sword className="w-4 h-4" /> 3. Tam Đại Kiếm Phái & Đấu Khí (Touki)
            </h3>
            <p className="text-stone-300 text-xs">
              <strong>Đấu Khí (Touki):</strong> Lớp giáp mana vô thức bao phủ da thịt và thớ cơ, giúp kiếm sĩ chém đứt sắt thép, di chuyển nhanh hơn âm thanh và chống đỡ ma thuật.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-stone-950 p-3 rounded-xl border border-red-900/40">
                <div className="font-bold font-serif text-amber-300 text-xs">Kiếm Thần Phái (Sword God)</div>
                <p className="text-stone-400 text-xs mt-1 leading-relaxed">
                  {SWORD_STYLES_INFO.swordGod.philosophy}
                </p>
                <div className="mt-2 text-[11px] text-red-400 font-mono">
                  Tuyệt kỹ: {SWORD_STYLES_INFO.swordGod.ultimateMove}
                </div>
              </div>

              <div className="bg-stone-950 p-3 rounded-xl border border-blue-900/40">
                <div className="font-bold font-serif text-blue-300 text-xs">Thủy Thần Phái (Water God)</div>
                <p className="text-stone-400 text-xs mt-1 leading-relaxed">
                  {SWORD_STYLES_INFO.waterGod.philosophy}
                </p>
                <div className="mt-2 text-[11px] text-blue-400 font-mono">
                  Tuyệt kỹ: {SWORD_STYLES_INFO.waterGod.ultimateMove}
                </div>
              </div>

              <div className="bg-stone-950 p-3 rounded-xl border border-emerald-900/40">
                <div className="font-bold font-serif text-emerald-300 text-xs">Bắc Thần Phái (North God)</div>
                <p className="text-stone-400 text-xs mt-1 leading-relaxed">
                  {SWORD_STYLES_INFO.northGod.philosophy}
                </p>
                <div className="mt-2 text-[11px] text-emerald-400 font-mono">
                  Tuyệt kỹ: {SWORD_STYLES_INFO.northGod.ultimateMove}
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Golden Childhood Rule */}
          <div className="space-y-2 border-t border-stone-800 pt-4">
            <h3 className="font-serif font-bold text-base text-yellow-400 flex items-center gap-2">
              <Zap className="w-4 h-4" /> 4. Quy Luật Tuổi Thơ Vàng (0 - 10 Tuổi)
            </h3>
            <p className="text-stone-300 text-xs">
              Trong quy luật ma pháp của đại lục, bình chứa Mana (Mana Capacity) của sinh vật sống có thể gia tăng dung tích mạnh mẽ nhất khi liên tục xả cạn và hồi phục trước năm 10 tuổi. 
              Sau khi cơ thể trưởng thành, việc mở rộng dung lượng đòi hỏi đan dược, đột phá cảnh giới và công pháp cao cấp!
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-950 border-t border-stone-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-serif font-bold text-xs cursor-pointer"
          >
            Đóng Đại Bách Khoa
          </button>
        </div>
      </div>
    </div>
  );
};
