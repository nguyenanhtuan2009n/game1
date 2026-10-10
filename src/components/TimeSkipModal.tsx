import React, { useState } from 'react';
import type { Character } from '../types/game.ts';
import { soundFx } from '../services/soundFx.ts';
import { 
  FastForward, 
  Sword, 
  Sparkles, 
  Zap, 
  X, 
  Check, 
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

export type TimeSkipTrainingType = 'sword' | 'magic' | 'body';

interface TimeSkipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (type: TimeSkipTrainingType, routineActionText: string) => void;
  currentAge: number;
  character?: Character;
  isInCombat?: boolean;
}

export const TimeSkipModal: React.FC<TimeSkipModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  currentAge,
  character,
  isInCombat = false,
}) => {
  const [selectedType, setSelectedType] = useState<TimeSkipTrainingType>('body');

  if (!isOpen) return null;

  const buildRoutineText = (type: TimeSkipTrainingType) => {
    const nextAge = currentAge + 1;
    if (type === 'sword') {
      return `Tua nhanh 1 năm: Khổ luyện Kiếm pháp chuyên sâu, vung kiếm gỗ hàng ngàn lần mỗi ngày, trau dồi thế kiếm và chiêu thức các lưu phái cho đến khi tròn ${nextAge} tuổi.`;
    }
    if (type === 'magic') {
      return `Tua nhanh 1 năm: Chuyên tâm luyện tập Ma pháp, xả cạn Mana vào mỗi buổi sáng và tối để mở rộng bình chứa tối đa và rèn luyện Vô niệm chú cho đến khi tròn ${nextAge} tuổi.`;
    }
    return `Tua nhanh 1 năm: Khổ luyện Thân thể toàn diện, tôi luyện cơ bắp và kinh mạch để tăng sinh mệnh tối đa (HP), mở rộng giới hạn Đấu Khí (Touki) và tăng cường sự nhanh nhẹn, phản xạ né đòn cho đến khi tròn ${nextAge} tuổi.`;
  };

  const handleExecute = (type: TimeSkipTrainingType) => {
    if (isInCombat) return;
    soundFx.playParchmentTurn();
    const actionText = buildRoutineText(type);
    onConfirm(type, actionText);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-stone-900 border-2 border-amber-500/80 rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-2xl text-stone-200 space-y-4 animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="time-skip-title"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500/30 to-amber-600/10 border border-amber-500/50 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              <FastForward className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 id="time-skip-title" className="font-serif font-bold text-lg text-amber-200 flex items-center gap-2">
                Tua Nhanh Thời Gian 1 Năm
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold">
                  365 Ngày Khổ Luyện
                </span>
              </h2>
              <span className="text-xs font-mono text-stone-400 block mt-0.5">
                Độ tuổi: <strong className="text-amber-400">{currentAge} tuổi</strong> ➔ Tiến tới <strong className="text-amber-300">{currentAge + 1} tuổi</strong>
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition cursor-pointer"
            aria-label="Đóng bảng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Combat warning if active */}
        {isInCombat && (
          <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-600 text-rose-200 text-xs flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
            <div>
              <div className="font-bold">Đang trong giao tranh sinh tử!</div>
              <div className="text-[11px] text-rose-300">Hãy đánh bại đối thủ hoặc tháo chạy an toàn trước khi có thể bế quan tu luyện 1 năm.</div>
            </div>
          </div>
        )}

        <p className="text-xs text-stone-300 leading-relaxed font-serif">
          Chọn 1 trong 3 phương thức khổ luyện kỷ luật thép suốt 365 ngày tiếp theo để đột phá năng lực:
        </p>

        {/* 3 Training Choices */}
        <div className="space-y-3">
          {/* Lựa chọn 1: Luyện Kiếm Pháp */}
          <div
            onClick={() => setSelectedType('sword')}
            className={`w-full text-left p-3.5 rounded-xl border text-xs transition-all cursor-pointer relative ${
              selectedType === 'sword'
                ? 'bg-rose-950/70 border-rose-500 ring-2 ring-rose-400/80 text-rose-100 shadow-lg shadow-rose-950/50'
                : 'bg-stone-950/80 border-stone-800 hover:border-rose-700/60 text-stone-300 hover:bg-stone-900/60'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-rose-900/40 border border-rose-700/50 text-rose-400 shrink-0 mt-0.5">
                  <Sword className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-serif font-bold text-sm text-rose-200 flex items-center gap-2">
                    1. Luyện Kiếm Pháp
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-rose-950 border border-rose-700 text-rose-300">
                      Kiếm Thuật & Đấu Khí
                    </span>
                  </div>
                  <div className="text-[11px] text-stone-300 mt-1 font-sans leading-relaxed">
                    Vung kiếm gỗ hàng ngàn lần mỗi ngày, tôi luyện bộ pháp, thế kiếm và kỹ năng đối kháng các lưu phái (Kiếm Thần, Thủy Thần, Bắc Thần).
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleExecute('sword');
                }}
                disabled={isInCombat}
                className="shrink-0 px-2.5 py-1 rounded-lg bg-rose-800 hover:bg-rose-700 text-rose-100 font-bold text-[11px] border border-rose-600 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                title="Tua 1 năm với Kiếm Pháp ngay"
              >
                <span>Tua Ngay</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-rose-900/40 text-[10px] font-mono text-rose-300 flex-wrap">
              <span className="px-1.5 py-0.5 rounded bg-rose-950/90 border border-rose-800 font-bold">+18 Đấu Khí (Touki)</span>
              <span className="px-1.5 py-0.5 rounded bg-rose-950/90 border border-rose-800">+30 Sinh Mệnh (HP)</span>
              <span className="px-1.5 py-0.5 rounded bg-rose-950/90 border border-rose-800">+35 Thể Lực (STA)</span>
              <span className="px-1.5 py-0.5 rounded bg-rose-950/90 border border-rose-800 font-semibold">+Thăng Cấp Kiếm Phái</span>
            </div>
          </div>

          {/* Lựa chọn 2: Luyện Ma Pháp */}
          <div
            onClick={() => setSelectedType('magic')}
            className={`w-full text-left p-3.5 rounded-xl border text-xs transition-all cursor-pointer relative ${
              selectedType === 'magic'
                ? 'bg-cyan-950/70 border-cyan-500 ring-2 ring-cyan-400/80 text-cyan-100 shadow-lg shadow-cyan-950/50'
                : 'bg-stone-950/80 border-stone-800 hover:border-cyan-700/60 text-stone-300 hover:bg-stone-900/60'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-900/40 border border-cyan-700/50 text-cyan-400 shrink-0 mt-0.5">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-serif font-bold text-sm text-cyan-200 flex items-center gap-2">
                    2. Luyện Ma Pháp
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-700 text-cyan-300">
                      Bình Chứa & Vô Niệm
                    </span>
                  </div>
                  <div className="text-[11px] text-stone-300 mt-1 font-sans leading-relaxed">
                    Xả cạn Mana vào mỗi sáng và tối đến ngất xỉu để kích hoạt tiềm năng mở rộng bình chứa tối đa (đặc biệt trước 10 tuổi), rèn luyện Vô niệm chú và nâng cấp pháp thuật nguyên tố.
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleExecute('magic');
                }}
                disabled={isInCombat}
                className="shrink-0 px-2.5 py-1 rounded-lg bg-cyan-800 hover:bg-cyan-700 text-cyan-100 font-bold text-[11px] border border-cyan-600 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                title="Tua 1 năm với Ma Pháp ngay"
              >
                <span>Tua Ngay</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-cyan-900/40 text-[10px] font-mono text-cyan-300 flex-wrap">
              <span className="px-1.5 py-0.5 rounded bg-cyan-950/90 border border-cyan-800 font-bold">+Mana Tối Đa (Tăng Vọt)</span>
              <span className="px-1.5 py-0.5 rounded bg-cyan-950/90 border border-cyan-800">+18 Kiểm Soát Mana</span>
              <span className="px-1.5 py-0.5 rounded bg-cyan-950/90 border border-cyan-800 font-bold">+35% Vô Niệm Chú</span>
              <span className="px-1.5 py-0.5 rounded bg-cyan-950/90 border border-cyan-800">+Pháp Thuật Nguyên Tố</span>
            </div>
          </div>

          {/* Lựa chọn 3: Luyện Thân Thể (tăng sinh mệnh và giới hạn đấu khí, sự nhanh nhẹn) */}
          <div
            onClick={() => setSelectedType('body')}
            className={`w-full text-left p-3.5 rounded-xl border text-xs transition-all cursor-pointer relative ${
              selectedType === 'body'
                ? 'bg-amber-950/70 border-amber-500 ring-2 ring-amber-400/80 text-amber-100 shadow-lg shadow-amber-950/50'
                : 'bg-stone-950/80 border-stone-800 hover:border-amber-700/60 text-stone-300 hover:bg-stone-900/60'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-amber-900/40 border border-amber-700/50 text-amber-400 shrink-0 mt-0.5">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-serif font-bold text-sm text-amber-200 flex items-center gap-2">
                    3. Luyện Thân Thể
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-amber-950 border border-amber-600 text-amber-300 font-bold">
                      Sinh Mệnh • Đấu Khí • Nhanh Nhẹn
                    </span>
                  </div>
                  <div className="text-[11px] text-stone-300 mt-1 font-sans leading-relaxed">
                    Khổ luyện thể chất khắc nghiệt suốt 365 ngày: chạy việt dã vượt núi đồi, mang vác nặng, chống đẩy ngàn nhịp, tắm thác băng, gia tăng sinh mệnh tối đa (HP), mở rộng giới hạn Đấu Khí (Touki) và tôi rèn phản xạ né đòn cực hạn.
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleExecute('body');
                }}
                disabled={isInCombat}
                className="shrink-0 px-2.5 py-1 rounded-lg bg-amber-700 hover:bg-amber-600 text-stone-950 font-bold text-[11px] border border-amber-500 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                title="Tua 1 năm với Thân Thể ngay"
              >
                <span>Tua Ngay</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-amber-900/40 text-[10px] font-mono text-amber-300 flex-wrap">
              <span className="px-1.5 py-0.5 rounded bg-amber-950/90 border border-amber-800 font-bold">+60 Sinh Mệnh (HP Max)</span>
              <span className="px-1.5 py-0.5 rounded bg-amber-950/90 border border-amber-800 font-bold">+25 Giới Hạn Đấu Khí (Touki)</span>
              <span className="px-1.5 py-0.5 rounded bg-amber-950/90 border border-amber-800 font-bold text-yellow-300">+20 Sự Nhanh Nhẹn & Phản Xạ</span>
              <span className="px-1.5 py-0.5 rounded bg-amber-950/90 border border-amber-800">+40 Thể Lực (STA)</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-serif transition cursor-pointer"
          >
            Hủy Bỏ
          </button>
          <button
            type="button"
            onClick={() => handleExecute(selectedType)}
            disabled={isInCombat}
            className="flex-2 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-serif font-bold text-xs shadow-lg transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4 text-stone-950 stroke-[3]" />
            <span>
              Xác Nhận Khổ Luyện: {selectedType === 'sword' ? 'Kiếm Pháp' : selectedType === 'magic' ? 'Ma Pháp' : 'Thân Thể (HP/Đấu Khí/Nhanh Nhẹn)'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
