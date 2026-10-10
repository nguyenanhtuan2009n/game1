import React, { useEffect } from 'react';
import type { Character } from '../types/game.ts';
import { soundFx } from '../services/soundFx.ts';
import { Skull, RotateCcw, Sparkles, MapPin, Clock } from 'lucide-react';

interface PermadeathModalProps {
  character: Character;
  deathReason?: string;
  hasCheckpoint: boolean;
  checkpointInfo?: {
    savedAtAge: number;
    savedLocation: string;
    savedTimestamp?: number;
  };
  onLoadCheckpoint: () => void;
  onNewReincarnation: (legacyBonus?: string) => void;
}

export const PermadeathModal: React.FC<PermadeathModalProps> = ({
  character,
  deathReason,
  hasCheckpoint,
  checkpointInfo,
  onLoadCheckpoint,
  onNewReincarnation,
}) => {
  useEffect(() => {
    soundFx.playDeathGong();
  }, []);

  const handleNgPlus = () => {
    const legacy = '[Kế thừa Tiền Kiếp (NG+)] - Tăng 20% Mana tiềm năng và +10 Đấu Khí bẩm sinh';
    onNewReincarnation(legacy);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md font-sans">
      <div className="bg-stone-950 border-2 border-red-900/80 rounded-2xl max-w-lg w-full p-6 shadow-2xl shadow-red-950/60 text-stone-200 text-center space-y-5">
        {/* Skull Icon */}
        <div className="w-16 h-16 mx-auto rounded-full bg-red-950/60 border border-red-700/60 flex items-center justify-center text-red-500 animate-pulse shadow-lg shadow-red-900/40">
          <Skull className="w-8 h-8" />
        </div>

        <div>
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-red-500">
            CƠ CHẾ SINH TỒN THỰC TẾ • PERMADEATH
          </span>
          <h2 className="text-2xl font-serif font-bold text-red-200 mt-1">
            VẬN MỆNH NGẮN NGỦI KHÉP LẠI
          </h2>
          <p className="text-xs text-stone-400 font-serif italic mt-1">
            Đại lục khắc nghiệt không có sự khoan nhượng cho những quyết định sai lầm khi đương đầu thử thách vượt cấp.
          </p>
        </div>

        {/* Death Cause Card */}
        <div className="bg-stone-900/80 border border-red-900/40 p-4 rounded-xl text-left space-y-2 text-xs font-serif leading-relaxed">
          <div className="font-bold text-red-400 font-sans uppercase tracking-wider text-[11px]">
            Nguyên Nhân Tử Vong:
          </div>
          <p className="text-stone-300">
            {deathReason || character.deathReason || 'Bạn đã gục ngã trước quái vật hoặc thực thể cấp cao do chênh lệch sức mạnh quá lớn.'}
          </p>
          <div className="pt-2 border-t border-stone-800 text-[11px] text-stone-400 font-mono">
            Hưởng thọ: {character.stats.age} tuổi {character.stats.month} tháng | Địa điểm: {character.stats.location}
          </div>
        </div>

        {/* SP & KP Inheritance Notice */}
        <div className="bg-purple-950/40 border border-purple-800/60 p-3 rounded-xl text-left text-xs font-serif text-purple-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-inner">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-300 shrink-0 animate-pulse" />
            <div>
              <div className="font-mono text-[10px] text-purple-300 font-bold uppercase tracking-wider">
                🌟 BẢO LƯU 100% TIẾN TRÌNH LUÂN HỒI:
              </div>
              <div className="text-[11px] text-stone-300 font-vietnam">
                Toàn bộ SP &amp; KP tích lũy được bảo lưu vĩnh viễn cho kiếp sau.
              </div>
            </div>
          </div>
          <div className="font-mono font-bold text-xs bg-black/50 px-2.5 py-1 rounded border border-purple-500/40 self-end sm:self-auto">
            <span className="text-amber-300">{character.progression?.skillPoints ?? 60} SP</span>
            <span className="text-stone-500 mx-1.5">•</span>
            <span className="text-cyan-300">{character.progression?.knowledgePoints ?? 20} KP</span>
          </div>
        </div>

        {/* Checkpoint Details Banner */}
        {hasCheckpoint && checkpointInfo && (
          <div className="bg-stone-900/60 border border-amber-800/40 p-3 rounded-xl text-left text-xs font-serif text-stone-300 space-y-1">
            <div className="font-mono text-[10px] text-amber-400 font-bold uppercase flex items-center gap-1">
              <Clock className="w-3 h-3" /> Điểm Lưu An Toàn Gần Nhất (Checkpoint):
            </div>
            <div className="flex items-center gap-2 text-stone-200">
              <span>Mốc: <strong>{checkpointInfo.savedAtAge} tuổi</strong></span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-rose-400" />
                {checkpointInfo.savedLocation}
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          {hasCheckpoint && (
            <button
              onClick={onLoadCheckpoint}
              className="flex-1 py-3 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 border border-stone-600 text-stone-200 font-serif font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-amber-400" />
              <span>Tải Lại Checkpoint ({checkpointInfo?.savedAtAge ? `${checkpointInfo.savedAtAge}t` : 'Gần nhất'})</span>
            </button>
          )}

          <button
            onClick={handleNgPlus}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-red-800 to-red-600 hover:from-red-700 hover:to-red-500 text-stone-100 font-serif font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-red-950/40"
          >
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span>Chuyển Sinh Kiếp Mới (NG+)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
