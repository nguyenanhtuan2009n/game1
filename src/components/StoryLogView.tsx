import React, { useEffect, useRef, useState } from 'react';
import type { TurnLog } from '../types/game';
import { 
  Scroll, 
  Sparkles, 
  MapPin, 
  Clock, 
  Shield, 
  ShieldAlert,
  Trash2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  History,
  CheckCircle2,
  Compass,
  Feather,
  Zap,
  ChevronDown,
  ChevronUp,
  Award,
} from 'lucide-react';
import { soundFx } from '../services/soundFx';
import { SceneVisualBanner } from './SceneVisualBanner';

interface StoryLogViewProps {
  logs: TurnLog[];
  totalChronicleCount?: number;
  isAiProcessing: boolean;
  onClearOldLogs?: () => void;
  onOpenHistory?: () => void;
}

export const StoryLogView: React.FC<StoryLogViewProps> = ({ 
  logs, 
  totalChronicleCount = logs.length,
  isAiProcessing,
  onClearOldLogs,
  onOpenHistory,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [fontSizeLevel, setFontSizeLevel] = useState<'normal' | 'large' | 'huge'>('normal');
  const [showOnlyLatest, setShowOnlyLatest] = useState<boolean>(true);
  const [expandedStatusIds, setExpandedStatusIds] = useState<Record<string, boolean>>({});

  const toggleStatusExpand = (logId: string) => {
    soundFx.playClick();
    setExpandedStatusIds(prev => ({ ...prev, [logId]: !prev[logId] }));
  };

  // Automatically scroll to bottom when new log arrives or processing state changes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [logs, isAiProcessing]);

  // If showOnlyLatest is active and we have logs, display only the last log; otherwise display all
  const displayedLogs = showOnlyLatest && logs.length > 0 ? [logs[logs.length - 1]] : logs;

  const fontClasses = {
    normal: 'text-sm sm:text-base leading-relaxed',
    large: 'text-base sm:text-lg leading-loose',
    huge: 'text-lg sm:text-xl leading-loose',
  }[fontSizeLevel];

  // Helper to format dialogues with stylish accent color on light parchment
  const renderHighlightedNarration = (text: string) => {
    return text.split('\n').map((paragraph, pIdx) => {
      const trimmed = paragraph.trim();
      if (!trimmed) {
        return <div key={pIdx} className="h-3" />;
      }

      // Highlight Talent RNG Dice Announcement prominently
      if (trimmed.includes('[KẾT QUẢ ĐỔ XÚC XẮC THIÊN PHÚ]')) {
        return (
          <div key={pIdx} className="my-3.5 p-3 rounded-xl bg-gradient-to-r from-amber-100/90 via-yellow-50 to-amber-100/80 border-2 border-amber-400 text-amber-950 font-cinzel font-bold text-xs sm:text-sm tracking-wide shadow-sm flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-amber-600 text-white shadow-xs text-base">🎲</span>
            <span>[KẾT QUẢ ĐỔ XÚC XẮC THIÊN PHÚ]:</span>
          </div>
        );
      }

      if (trimmed.startsWith('- Đổ bậc phẩm chất:') || trimmed.startsWith('- Thiên phú nhận được:')) {
        const isTalentName = trimmed.startsWith('- Thiên phú nhận được:');
        return (
          <div key={pIdx} className={`my-1.5 px-3.5 py-2 rounded-xl border text-xs sm:text-sm font-vietnam font-medium leading-relaxed ${
            isTalentName 
              ? 'bg-amber-50/90 border-amber-300 text-amber-950 font-semibold' 
              : 'bg-white/90 border-stone-200 text-stone-800'
          }`}>
            <span className="text-amber-700 font-bold mr-1.5">✦</span>
            <span>{trimmed.replace(/^-\s*/, '')}</span>
          </div>
        );
      }

      // Highlight World Map & Destination Section
      if (trimmed.includes('[ĐIỂM ĐẾN & DI CHUYỂN]')) {
        return (
          <div key={pIdx} className="my-3 p-3 rounded-xl bg-gradient-to-r from-emerald-100/90 via-teal-50 to-blue-100/80 border-2 border-emerald-400 text-emerald-950 font-cinzel font-bold text-xs sm:text-sm tracking-wide shadow-sm flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-emerald-600 text-white shadow-xs text-base">🧭</span>
            <span>[ĐIỂM ĐẾN & DI CHUYỂN]:</span>
          </div>
        );
      }

      // Highlight Regional Objectives & Canon Ecosystem / Powers Intel
      if (trimmed.includes('[MỤC TIÊU & NHIỆM VỤ KHU VỰC]')) {
        return (
          <div key={pIdx} className="my-3 p-3 rounded-xl bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 border-2 border-amber-600/80 text-amber-200 font-cinzel font-bold text-xs sm:text-sm tracking-wide shadow-md flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-amber-600/30 text-amber-300 border border-amber-500/40 text-base">🛡️</span>
            <span>[MỤC TIÊU & NHIỆM VỤ KHU VỰC]:</span>
          </div>
        );
      }

      if (trimmed.startsWith('- Nhiệm Vụ Đang Nhận:')) {
        return (
          <div key={pIdx} className="my-1.5 px-3.5 py-2 rounded-xl border border-amber-700/50 bg-amber-950/30 text-amber-100 font-vietnam text-xs sm:text-sm flex items-start gap-2 shadow-xs">
            <span className="text-amber-400 font-bold shrink-0 mt-0.5">📜</span>
            <div>
              <strong className="text-amber-300 font-semibold">Nhiệm Vụ Đang Nhận:</strong>{' '}
              <span>{trimmed.replace('- Nhiệm Vụ Đang Nhận:', '').trim()}</span>
            </div>
          </div>
        );
      }

      if (trimmed.startsWith('- Động Thái Quái Thú:')) {
        return (
          <div key={pIdx} className="my-1.5 px-3.5 py-2 rounded-xl border border-rose-700/50 bg-rose-950/30 text-rose-100 font-vietnam text-xs sm:text-sm flex items-start gap-2 shadow-xs">
            <span className="text-rose-400 font-bold shrink-0 mt-0.5">🐾</span>
            <div>
              <strong className="text-rose-300 font-semibold">Động Thái Quái Thú:</strong>{' '}
              <span>{trimmed.replace('- Động Thái Quái Thú:', '').trim()}</span>
            </div>
          </div>
        );
      }

      if (trimmed.startsWith('- Manh Mối Liệt Cường / Thế Lực:')) {
        return (
          <div key={pIdx} className="my-1.5 px-3.5 py-2 rounded-xl border border-purple-700/50 bg-purple-950/30 text-purple-100 font-vietnam text-xs sm:text-sm flex items-start gap-2 shadow-xs">
            <span className="text-purple-400 font-bold shrink-0 mt-0.5">⚡</span>
            <div>
              <strong className="text-purple-300 font-semibold">Manh Mối Liệt Cường / Thế Lực:</strong>{' '}
              <span>{trimmed.replace('- Manh Mối Liệt Cường / Thế Lực:', '').trim()}</span>
            </div>
          </div>
        );
      }

      if (trimmed.startsWith('[VỊ TRÍ HIỆN TẠI]:')) {
        return (
          <div key={pIdx} className="my-2 px-3.5 py-2.5 rounded-xl border border-teal-300 bg-teal-50/90 text-teal-950 font-vietnam text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-xs">
            <span className="text-teal-600 text-base">📍</span>
            <span>{trimmed}</span>
          </div>
        );
      }

      if (trimmed.startsWith('[LỰA CHỌN TIẾP THEO]:') || trimmed.includes('[LỰA CHỌN TIẾP THEO]')) {
        return (
          <div key={pIdx} className="my-2.5 px-3 py-1.5 rounded-lg border border-amber-300 bg-amber-100/70 text-amber-950 font-cinzel font-bold text-xs sm:text-sm tracking-wide flex items-center gap-2 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
            <span>[LỰA CHỌN TIẾP THEO]:</span>
          </div>
        );
      }

      // Check if line is a section heading like [KẾT QUẢ], [CHIẾN BÁO], [GIAI ĐOẠN X], etc.
      if (trimmed.startsWith('[') && (trimmed.endsWith(']') || trimmed.endsWith(']:'))) {
        const isCombat = trimmed.includes('CHIẾN') || trimmed.includes('GIAI ĐOẠN') || trimmed.includes('HẬU QUẢ');
        const isProg = trimmed.includes('TIẾN TRÌNH') || trimmed.includes('ĐỘT PHÁ') || trimmed.includes('KỸ NĂNG');
        
        let headerColor = 'text-amber-900 border-amber-300 bg-amber-100/70';
        let dotColor = 'bg-amber-600';
        if (isCombat) {
          headerColor = 'text-rose-950 border-rose-300 bg-rose-100/70';
          dotColor = 'bg-rose-600';
        } else if (isProg) {
          headerColor = 'text-purple-950 border-purple-300 bg-purple-100/70';
          dotColor = 'bg-purple-600';
        }

        return (
          <div key={pIdx} className={`my-3 px-3 py-1.5 rounded-lg border font-cinzel font-bold text-xs sm:text-sm tracking-wider flex items-center gap-2 ${headerColor} shadow-xs`}>
            <span className={`w-2 h-2 rounded-full ${dotColor} animate-pulse`} />
            <span>{trimmed}</span>
          </div>
        );
      }

      // Highlight Combat Damage lines prominently
      if (trimmed.includes('💥') || trimmed.includes('SÁT THƯƠNG GÂY RA:') || trimmed.includes('Sát thương:')) {
        return (
          <div key={pIdx} className="my-3 p-3 rounded-xl bg-gradient-to-r from-rose-100 via-amber-50 to-orange-50 border-2 border-rose-400 text-rose-950 font-vietnam font-bold text-xs sm:text-sm shadow-sm flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-gradient-to-br from-rose-600 to-red-700 text-white shadow-xs shrink-0 text-base">💥</span>
            <span className="leading-snug">{trimmed.replace(/^💥\s*/, '')}</span>
          </div>
        );
      }

      // Highlight quotes inside the paragraph (dialogues) with crisp, readable styling
      const parts = paragraph.split(/(["“][^"”]+["”])/g);
      return (
        <p key={pIdx} className="mb-3 text-stone-900 font-story font-normal leading-relaxed text-justify">
          {parts.map((part, idx) => {
            if ((part.startsWith('"') && part.endsWith('"')) || (part.startsWith('“') && part.endsWith('”'))) {
              return (
                <span key={idx} className="text-amber-950 font-semibold italic bg-amber-100/60 px-1 py-0.5 rounded border border-amber-300/50">
                  {part}
                </span>
              );
            }
            return <span key={idx}>{part}</span>;
          })}
        </p>
      );
    });
  };

  return (
    <div className="flex-1 min-h-[540px] flex flex-col bg-white/92 rounded-2xl border border-amber-300/80 shadow-[0_12px_40px_rgba(217,119,6,0.12)] overflow-hidden backdrop-blur-xl relative text-stone-900">
      {/* Decorative Runic Frame Corners */}
      <div className="absolute top-0 left-0 w-3.5 h-3.5 border-t-2 border-l-2 border-amber-500 pointer-events-none" />
      <div className="absolute top-0 right-0 w-3.5 h-3.5 border-t-2 border-r-2 border-amber-500 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-3.5 h-3.5 border-b-2 border-l-2 border-amber-500 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-3.5 h-3.5 border-b-2 border-r-2 border-amber-500 pointer-events-none" />

      {/* Chronicle Header Banner */}
      <div className="bg-gradient-to-r from-amber-50/90 via-white to-amber-50/90 px-4 sm:px-5 py-3 border-b border-amber-200 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-100 border border-amber-300 text-amber-800 shadow-sm">
            <Scroll className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-cinzel font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-950 via-amber-900 to-stone-900 text-sm sm:text-base tracking-wide flex items-center gap-2 drop-shadow-xs">
              Biên Niên Sử Vận Mệnh Đại Lục (Chronicles of Destiny)
            </h2>
            <div className="text-[11px] text-stone-600 font-vietnam flex items-center gap-2 mt-0.5">
              <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                <CheckCircle2 className="w-3 h-3" />
                {showOnlyLatest ? 'Chế độ 1 lượt tập trung' : 'Chế độ cuộn toàn bộ'}
              </span>
              <span className="text-stone-400">•</span>
              <span className="text-amber-900 font-mono font-bold">
                Lượt #{logs[logs.length - 1]?.turnNumber || 1}
              </span>
            </div>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Toggle View Mode */}
          <button
            onClick={() => {
              soundFx.playParchmentTurn();
              setShowOnlyLatest(!showOnlyLatest);
            }}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-vietnam font-medium border transition-all flex items-center gap-1.5 cursor-pointer ${
              showOnlyLatest
                ? 'bg-amber-100 text-amber-950 border-amber-400 shadow-xs'
                : 'bg-white text-stone-700 border-stone-300 hover:border-stone-400'
            }`}
            title={showOnlyLatest ? 'Đang bật: Tinh gọn 1 lượt hiện tại' : 'Đang bật: Xem toàn bộ các lượt cuộn'}
          >
            {showOnlyLatest ? (
              <>
                <Minimize2 className="w-3.5 h-3.5 text-amber-700" />
                <span>1 Lượt (Rút gọn)</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5 text-stone-600" />
                <span>Toàn bộ lượt</span>
              </>
            )}
          </button>

          {/* Quick Clear Old Turns */}
          {onClearOldLogs && logs.length > 1 && (
            <button
              onClick={() => {
                soundFx.playParchmentTurn();
                onClearOldLogs();
              }}
              className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-stone-50 text-stone-700 hover:text-rose-700 border border-stone-300 text-xs flex items-center gap-1 transition cursor-pointer shadow-xs"
              title="Dọn dẹp các lượt cũ để màn hình tinh gọn"
            >
              <Trash2 className="w-3.5 h-3.5 text-stone-500" />
              <span className="hidden sm:inline">Dọn lượt cũ</span>
            </button>
          )}

          {/* Chronicle History Button */}
          {onOpenHistory && (
            <button
              onClick={() => {
                soundFx.playParchmentTurn();
                onOpenHistory();
              }}
              className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
              title="Xem lại toàn bộ lịch sử các lượt trước"
            >
              <History className="w-3.5 h-3.5 text-amber-700" />
              <span>Biên niên sử ({totalChronicleCount})</span>
            </button>
          )}

          {/* Font Size Adjuster */}
          <div className="hidden sm:flex items-center rounded-xl bg-white border border-stone-200 p-0.5 text-xs text-stone-700 shadow-xs">
            <button
              onClick={() => {
                if (fontSizeLevel === 'huge') setFontSizeLevel('large');
                else if (fontSizeLevel === 'large') setFontSizeLevel('normal');
              }}
              className="p-1 hover:text-amber-800 disabled:opacity-40 cursor-pointer"
              disabled={fontSizeLevel === 'normal'}
              title="Giảm kích thước chữ"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-1 text-[10px] font-mono font-bold text-amber-900">
              {fontSizeLevel === 'normal' ? 'Chuẩn' : fontSizeLevel === 'large' ? 'Lớn' : 'Rất lớn'}
            </span>
            <button
              onClick={() => {
                if (fontSizeLevel === 'normal') setFontSizeLevel('large');
                else if (fontSizeLevel === 'large') setFontSizeLevel('huge');
              }}
              className="p-1 hover:text-amber-800 disabled:opacity-40 cursor-pointer"
              disabled={fontSizeLevel === 'huge'}
              title="Tăng kích thước chữ"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Narrative Body Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-stone-900">
        {/* Scenic Atmospheric Landscape Illustration */}
        {displayedLogs.length > 0 && (
          <SceneVisualBanner
            location={displayedLogs[displayedLogs.length - 1].location || 'Vương Quốc Asura'}
            age={parseInt(displayedLogs[displayedLogs.length - 1].ageDisplay || '5', 10) || 5}
            narrationSnippet={displayedLogs[displayedLogs.length - 1].narration}
            isCombat={displayedLogs[displayedLogs.length - 1].dangerEncountered}
          />
        )}

        {displayedLogs.map((log, index) => {
          const isLatest = index === displayedLogs.length - 1;

          return (
            <article
              key={`log_${log.id}_${index}`}
              className={`p-4 sm:p-6 rounded-2xl border transition-all duration-300 animate-turn-in relative ${
                isLatest
                  ? 'bg-gradient-to-b from-amber-50/70 via-white to-amber-50/40 border-amber-300 shadow-[0_4px_20px_rgba(217,119,6,0.08)] ring-1 ring-amber-400/40'
                  : 'bg-white/80 border-stone-200 opacity-95'
              }`}
            >
              {/* Ornate Top Banner / Turn Header */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 mb-4 border-b border-amber-200">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  {/* Turn Badge */}
                  <div className="px-3 py-1 rounded-xl bg-gradient-to-r from-amber-200 to-amber-100 text-amber-950 font-cinzel font-bold text-xs sm:text-sm border border-amber-400 shadow-xs flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-700 animate-pulse" />
                    <span>LƯỢT #{log.turnNumber}</span>
                  </div>

                  {/* Age Badge */}
                  <span className="px-2.5 py-1 rounded-xl bg-white border border-stone-200 text-stone-700 text-xs font-vietnam flex items-center gap-1.5 shadow-xs">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <strong className="text-amber-950">{log.ageDisplay}</strong>
                  </span>

                  {/* Location Badge */}
                  <span className="px-2.5 py-1 rounded-xl bg-white border border-stone-200 text-stone-700 text-xs font-vietnam flex items-center gap-1.5 truncate max-w-[280px] shadow-xs">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span className="truncate font-medium">{log.location}</span>
                  </span>
                </div>

                {log.dangerEncountered && (
                  <div className="px-3 py-1 rounded-xl bg-rose-100 border border-rose-300 text-rose-900 text-xs font-vietnam font-bold flex items-center gap-1.5 shadow-xs animate-pulse">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                    <span>Nguy Biến / Chiến Đấu</span>
                  </div>
                )}
              </div>

              {/* Player's Chosen Action Banner */}
              {log.playerAction && (
                <div className="mb-5 p-3.5 rounded-xl bg-gradient-to-r from-amber-100/80 via-amber-50 to-transparent border-l-4 border-amber-500 border-y border-r border-amber-200 text-xs sm:text-sm text-amber-950 shadow-xs">
                  <div className="text-[10px] uppercase font-cinzel font-bold tracking-wider text-amber-800 mb-1 flex items-center gap-1.5">
                    <Feather className="w-3.5 h-3.5 text-amber-700" />
                    Ý Nguyện / Hành Động Của Bạn:
                  </div>
                  <div className="italic text-amber-950 pl-1 font-serif text-sm sm:text-base font-medium">
                    "{log.playerAction}"
                  </div>
                </div>
              )}

              {/* [MÔ TẢ DIỄN BIẾN] SECTION */}
              <div className="space-y-3 font-story">
                <div className="text-[11px] font-cinzel font-bold uppercase tracking-widest text-amber-800 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-600 shadow-sm" />
                  Diễn Biến Lời Kể
                </div>
                
                <div className={`${fontClasses} font-story text-stone-900 text-justify antialiased leading-relaxed pl-1`}>
                  {renderHighlightedNarration(log.narration)}
                </div>
              </div>

              {/* [HẬU QUẢ NGẦM / NHÂN QUẢ] (RIPPLE EFFECT) SECTION */}
              {log.rippleEffectText && (
                <div className="mt-3.5 p-3 rounded-xl bg-gradient-to-r from-amber-50 via-purple-50/70 to-amber-50 border border-purple-300 text-purple-950 shadow-xs flex items-start gap-2.5">
                  <span className="p-1.5 rounded-lg bg-purple-100 text-purple-700 shrink-0 mt-0.5 shadow-xs">
                    <Compass className="w-4 h-4 text-purple-700" />
                  </span>
                  <div>
                    <div className="text-[10px] font-cinzel font-bold uppercase tracking-wider text-purple-900 mb-0.5 flex items-center gap-1">
                      <span>[ HẬU QUẢ NGẦM / NHÂN QUẢ ]</span>
                    </div>
                    <div className="text-xs sm:text-sm font-vietnam italic text-purple-950 font-medium leading-relaxed">
                      {log.rippleEffectText.replace(/^\*>\s*/, '').replace(/\*$/, '')}
                    </div>
                  </div>
                </div>
              )}

              {/* System Feedback Notes */}
              {log.systemNotes && log.systemNotes.length > 0 && (
                <div className="mt-3.5 space-y-1.5">
                  {log.systemNotes.map((note, nIdx) => (
                    <div
                      key={nIdx}
                      className="px-3 py-1.5 rounded-xl bg-amber-100/70 border border-amber-300 text-xs font-vietnam text-amber-950 flex items-center gap-2 shadow-xs font-medium"
                    >
                      <span className="text-amber-700 font-bold">⚡</span>
                      <span>{note}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Collapsible Status & Technical Breakdown */}
              {log.statusSummary && (
                <div className="mt-3 pt-2 border-t border-amber-100">
                  <button
                    type="button"
                    onClick={() => toggleStatusExpand(log.id)}
                    className="text-[11px] font-mono text-stone-500 hover:text-amber-800 flex items-center gap-1.5 transition cursor-pointer py-1"
                  >
                    {expandedStatusIds[log.id] ? (
                      <>
                        <ChevronUp className="w-3.5 h-3.5 text-amber-600" />
                        <span>Thu gọn chi tiết thông số lượt này</span>
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
                        <span>Xem chi tiết thông số &amp; trang bị lượt này</span>
                      </>
                    )}
                  </button>

                  {expandedStatusIds[log.id] && (
                    <div className="mt-2 bg-stone-50/90 p-3.5 rounded-xl border border-stone-200 text-xs font-vietnam animate-turn-in space-y-3">
                      <div className="text-stone-700 text-xs leading-relaxed whitespace-pre-wrap font-mono">
                        {log.statusSummary
                          .replace(/---\s*\[ TRẠNG THÁI CHIẾN ĐẤU \][\s\S]*?---/g, '')
                          .replace(/---\s*\[ BẢNG TRANG BỊ ĐANG ĐEO \][\s\S]*?---/g, '')
                          .replace(/---\s*\[ BẢNG TIẾN TRÌNH[\s\S]*?(?=---|$)(---)?/g, '')
                          .replace(/\[ BẢNG TIẾN TRÌNH[\s\S]*?$/g, '')
                          .replace(/---\s*\[ DANH TIẾNG & DANH XƯNG \][\s\S]*?---/g, '')
                          .trim()}
                      </div>

                      {/* Dedicated Reputation & Epithet block if present */}
                      {(log.reputationSummaryText || log.statusSummary.includes('[ DANH TIẾNG & DANH XƯNG ]')) && (
                        <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-300 text-indigo-950">
                          <div className="text-[10px] font-mono font-bold uppercase text-indigo-900 mb-1 flex items-center gap-1.5">
                            <Award className="w-3.5 h-3.5 text-indigo-600" />
                            [ Danh Tiếng &amp; Danh Xưng ]
                          </div>
                          <div className="text-indigo-950 whitespace-pre-wrap font-mono text-xs leading-relaxed bg-white/80 p-2 rounded border border-indigo-200">
                            {(log.reputationSummaryText ||
                              log.statusSummary.match(/\[ DANH TIẾNG & DANH XƯNG \][\s\S]*?(?=---|$)/)?.[0] ||
                              '')
                              .replace(/---/g, '')
                              .replace(/\[ DANH TIẾNG & DANH XƯNG \]/g, '')
                              .trim()}
                          </div>
                        </div>
                      )}

                      {/* Dedicated Combat HUD block if present */}
                      {(log.combatHudText || log.statusSummary.includes('[ TRẠNG THÁI CHIẾN ĐẤU ]')) && (
                        <div className="p-3 rounded-lg bg-rose-50 border border-rose-300 text-rose-950">
                          <div className="text-[10px] font-mono font-bold uppercase text-rose-900 mb-1">
                            [ Trạng Thái Chiến Đấu ]
                          </div>
                          <pre className="text-rose-950 whitespace-pre-wrap font-mono text-xs leading-relaxed bg-white/80 p-2 rounded border border-rose-200">
                            {log.combatHudText ||
                              log.statusSummary.match(/\[ TRẠNG THÁI CHIẾN ĐẤU \][\s\S]*?(?=---|$)/)?.[0] ||
                              ''}
                          </pre>
                        </div>
                      )}

                      {/* Dedicated Equipment Summary block if present */}
                      {(log.equipmentSummaryText || log.statusSummary.includes('[ BẢNG TRANG BỊ ĐANG ĐEO ]')) && (
                        <div className="p-3 rounded-lg bg-amber-50 border border-amber-300 text-amber-950">
                          <div className="text-[10px] font-mono font-bold uppercase text-amber-900 mb-1">
                            [ Trang Bị Đang Đeo ]
                          </div>
                          <div className="text-amber-950 whitespace-pre-wrap font-mono text-xs leading-relaxed bg-white/80 p-2 rounded border border-amber-200">
                            {(log.equipmentSummaryText ||
                              log.statusSummary.match(/\[ BẢNG TRANG BỊ ĐANG ĐEO \][\s\S]*?(?=---|$)/)?.[0] ||
                              '')
                              .replace(/---/g, '')
                              .replace(/\[ BẢNG TRANG BỊ ĐANG ĐEO \]/g, '')
                              .trim()}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </article>
          );
        })}

        {/* AI Typing / Processing State */}
        {isAiProcessing && (
          <div className="p-5 rounded-2xl bg-amber-50/90 border border-amber-300 animate-pulse flex items-center gap-3.5 text-amber-950 font-story shadow-sm">
            <div className="w-5 h-5 rounded-full border-2 border-amber-600 border-t-transparent animate-spin shrink-0" />
            <div className="text-xs sm:text-sm">
              <strong className="text-amber-900 font-cinzel">Game Master đang vận hành thế giới Sandbox:</strong> Mô phỏng phản ứng NPC, biến động thời cuộc và tính toán kết quả theo quyết định của bạn...
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
};
