import React from 'react';
import type { Character } from '../types/game';
import { 
  Skull, 
  RotateCcw, 
  Award, 
  Clock, 
  Sparkles, 
  Sword, 
  Coins, 
  HeartHandshake, 
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { soundFx } from '../services/soundFx';

interface SurrenderModalProps {
  character: Character;
  turnCount: number;
  hasCheckpoint: boolean;
  onConfirmSurrender: () => void;
  onLoadCheckpoint: () => void;
  onClose: () => void;
}

export const SurrenderModal: React.FC<SurrenderModalProps> = ({
  character,
  turnCount,
  hasCheckpoint,
  onConfirmSurrender,
  onLoadCheckpoint,
  onClose,
}) => {
  // Calculate Legacy Score based on achievements
  const ageScore = character.stats.age * 20;
  const turnScore = turnCount * 5;
  const magicScore = character.magic.chantless ? 80 : character.magic.chantlessProgress;
  const toukiScore = character.stats.touki * 2;
  const knowledgeScore = character.stats.knowledge * 2;
  const totalLegacyScore = ageScore + turnScore + magicScore + toukiScore + knowledgeScore;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-xl bg-stone-950/95 border-2 border-stone-800 rounded-2xl shadow-2xl p-5 sm:p-6 text-stone-200 space-y-5 relative overflow-hidden">
        {/* Decorative Ambient Border */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-stone-700 via-amber-600/60 to-stone-700" />

        {/* Title Header */}
        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 rounded-full bg-stone-900 border border-stone-700 flex items-center justify-center mx-auto text-stone-400 shadow-inner">
            <Skull className="w-6 h-6 text-stone-400" />
          </div>
          <h2 className="font-cinzel text-xl sm:text-2xl font-bold text-stone-200 tracking-wide">
            Buông Xuôi Số Phận & Kết Thúc Cuộc Đời
          </h2>
          <p className="text-xs text-stone-400 font-vietnam max-w-md mx-auto">
            Hành trình của bạn tại đại lục này sẽ dừng lại tại đây. Tiến trình chơi sẽ được tổng kết và chuyển đổi thành <strong className="text-amber-300">Điểm Kế Thừa Kiếp Sau (Legacy NG+)</strong>.
          </p>
        </div>

        {/* Life Summary Card */}
        <div className="p-4 rounded-xl bg-stone-900/70 border border-stone-800/80 space-y-3 font-vietnam text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-stone-800">
            <div>
              <span className="font-cinzel font-bold text-amber-300 text-sm">{character.name}</span>
              <span className="text-[11px] text-stone-400 block">{character.title}</span>
            </div>
            <div className="text-right">
              <span className="text-stone-300 font-mono font-bold flex items-center gap-1 justify-end">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                {character.stats.age} tuổi {character.stats.month} tháng
              </span>
              <span className="text-[10px] text-stone-400">Trải qua {turnCount} lượt hành động</span>
            </div>
          </div>

          {/* Key Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
            <div className="p-2 rounded-lg bg-stone-950/80 border border-stone-800/60">
              <span className="text-stone-400 block text-[10px]">Mana tối đa:</span>
              <span className="font-mono font-bold text-cyan-300">{character.stats.manaMax} MP</span>
            </div>
            <div className="p-2 rounded-lg bg-stone-950/80 border border-stone-800/60">
              <span className="text-stone-400 block text-[10px]">Đấu Khí:</span>
              <span className="font-mono font-bold text-emerald-300">{character.stats.touki} Touki</span>
            </div>
            <div className="p-2 rounded-lg bg-stone-950/80 border border-stone-800/60">
              <span className="text-stone-400 block text-[10px]">Tài sản:</span>
              <span className="font-mono font-bold text-amber-300">{character.stats.asuraCoins || 0} Xu Asura</span>
            </div>
            <div className="p-2 rounded-lg bg-stone-950/80 border border-stone-800/60">
              <span className="text-stone-400 block text-[10px]">Vô niệm chú:</span>
              <span className="font-mono font-bold text-purple-300">
                {character.magic.chantless ? 'Hoàn thành' : `${character.magic.chantlessProgress}%`}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-stone-950/80 border border-stone-800/60">
              <span className="text-stone-400 block text-[10px]">Vật phẩm trong túi:</span>
              <span className="font-mono font-bold text-stone-200">{character.inventory.length} món</span>
            </div>
            <div className="p-2 rounded-lg bg-stone-950/80 border border-stone-800/60">
              <span className="text-stone-400 block text-[10px]">Bằng hữu:</span>
              <span className="font-mono font-bold text-stone-200">{character.bonds.length} người</span>
            </div>
          </div>

          {/* Legacy Score Box */}
          <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-600/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <div>
                <span className="font-cinzel font-bold text-amber-200 text-xs block">
                  Điểm Tích Lũy Kế Thừa Kiếp Sau (Legacy NG+)
                </span>
                <span className="text-[10px] text-amber-400/80">
                  Dùng để mở khóa tiềm năng và nhận thêm quà tặng khởi đầu ở kiếp mới!
                </span>
              </div>
            </div>
            <span className="font-mono font-bold text-amber-300 text-base sm:text-lg">
              +{totalLegacyScore}
            </span>
          </div>

          {/* Preserved SP & KP Box */}
          <div className="p-3 rounded-lg bg-purple-950/40 border border-purple-600/50 flex items-center justify-between shadow-inner">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400 shrink-0" />
              <div>
                <span className="font-cinzel font-bold text-purple-200 text-xs block">
                  🌟 Bảo Lưu Toàn Bộ SP &amp; KP Cũ Sang Kiếp Mới (100%)
                </span>
                <span className="text-[10px] text-purple-300/80">
                  Giữ lại toàn bộ Điểm Kỹ Năng &amp; Tri Thức để tiếp tục đột phá Cây Kỹ Năng ở kiếp tiếp theo!
                </span>
              </div>
            </div>
            <div className="font-mono font-bold text-xs bg-black/50 px-2.5 py-1.5 rounded border border-purple-500/40 text-right shrink-0">
              <span className="text-amber-300">{character.progression?.skillPoints ?? 60} SP</span>
              <span className="text-stone-500 mx-1.5">•</span>
              <span className="text-cyan-300">{character.progression?.knowledgePoints ?? 20} KP</span>
            </div>
          </div>
        </div>

        {/* Warning Notice */}
        <div className="px-3 py-2 rounded-lg bg-stone-900 border border-stone-800 text-[11px] text-stone-400 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            Hệ thống tuân thủ quy tắc: <strong className="text-stone-200">Tiến trình được bảo lưu liên tục</strong> cho đến khi bạn chính thức xác nhận bỏ cuộc hoặc tử vong.
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 pt-1 font-vietnam">
          <button
            onClick={() => {
              soundFx.playLevelUp();
              onConfirmSurrender();
            }}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-800 to-rose-700 hover:from-red-700 hover:to-rose-600 text-stone-100 font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
          >
            <Skull className="w-4 h-4" />
            <span>Xác nhận Bỏ Cuộc & Chuyển Sinh Kiếp Mới (+{totalLegacyScore} Điểm Kế Thừa)</span>
          </button>

          {hasCheckpoint && (
            <button
              onClick={() => {
                soundFx.playLevelUp();
                onLoadCheckpoint();
                onClose();
              }}
              className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-emerald-300 border border-emerald-700/50 hover:border-emerald-500 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-emerald-400" />
              <span>Nạp lại Điểm Lưu (Checkpoint An Toàn)</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="w-full py-2 rounded-xl bg-transparent hover:bg-stone-900 text-stone-400 hover:text-stone-200 text-xs transition-all cursor-pointer"
          >
            Hủy bỏ, tôi muốn tiếp tục sống và chiến đấu!
          </button>
        </div>
      </div>
    </div>
  );
};
