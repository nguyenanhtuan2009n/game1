import React, { useState } from 'react';
import type { TurnLog } from '../types/game';
import { 
  X, 
  Scroll, 
  Search, 
  Clock, 
  MapPin, 
  ShieldAlert, 
  Sparkles, 
  Sword, 
  Copy, 
  Check,
  ChevronRight
} from 'lucide-react';
import { soundFx } from '../services/soundFx';

interface ChronicleHistoryModalProps {
  logs: TurnLog[];
  onClose: () => void;
}

export const ChronicleHistoryModal: React.FC<ChronicleHistoryModalProps> = ({ logs, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTurnId, setSelectedTurnId] = useState<string>(logs[logs.length - 1]?.id || '');
  const [copied, setCopied] = useState(false);

  const filteredLogs = logs.filter(log => {
    if (!searchQuery.trim()) return true;
    const q = (searchQuery || '').toLowerCase();
    return (
      (log.narration || '').toLowerCase().includes(q) ||
      (log.playerAction && log.playerAction.toLowerCase().includes(q)) ||
      (log.location || '').toLowerCase().includes(q) ||
      (log.ageDisplay || '').toLowerCase().includes(q) ||
      `lượt ${log.turnNumber}`.includes(q)
    );
  });

  const selectedLog = logs.find(l => l.id === selectedTurnId) || logs[logs.length - 1];

  const handleCopyHistory = () => {
    soundFx.playParchmentTurn();
    const text = logs.map(l => 
      `=== [LƯỢT #${l.turnNumber} - ${l.ageDisplay} tại ${l.location}] ===\n` +
      (l.playerAction ? `Hành động: "${l.playerAction}"\n` : '') +
      `Diễn biến:\n${l.narration}\n\n`
    ).join('\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-5xl h-[88vh] bg-stone-950/95 border-2 border-amber-600/40 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-stone-200">
        
        {/* Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-stone-900 via-stone-950 to-stone-900 border-b border-amber-600/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Scroll className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-cinzel font-bold text-amber-300 text-base sm:text-lg tracking-wide flex items-center gap-2">
                Biên Niên Sử Cuộc Đời
                <span className="text-xs font-mono font-normal text-amber-400/80 px-2 py-0.5 rounded bg-amber-950/60 border border-amber-800/40">
                  {logs.length} Lượt đã ghi chép
                </span>
              </h2>
              <p className="text-[11px] text-stone-400">
                Toàn bộ dòng thời gian, sự kiện và biến cố đã trải qua trong hành trình sandbox
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyHistory}
              className="px-2.5 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-amber-300 border border-stone-800 text-xs flex items-center gap-1.5 transition-all"
              title="Sao chép toàn bộ biên niên sử"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copied ? 'Đã chép' : 'Sao chép'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-stone-900 text-stone-400 hover:text-rose-400 border border-transparent hover:border-stone-800 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-3 bg-stone-900/50 border-b border-stone-800/80 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm theo sự kiện, tên nhân vật, địa danh, lượt hành động..."
              className="w-full pl-9 pr-4 py-1.5 rounded-lg bg-stone-950 border border-stone-800 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-600/60"
            />
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="px-2 py-1 text-xs text-stone-400 hover:text-amber-300"
            >
              Xóa lọc
            </button>
          )}
        </div>

        {/* Content: Left List & Right Detail */}
        <div className="flex-1 flex overflow-hidden">
          {/* Turn List Sidebar */}
          <div className="w-64 sm:w-80 shrink-0 border-r border-stone-800/80 overflow-y-auto p-2 space-y-1.5 bg-stone-950/60">
            {filteredLogs.length === 0 ? (
              <div className="p-4 text-center text-xs text-stone-500">
                Không tìm thấy lượt nào phù hợp với từ khóa.
              </div>
            ) : (
              filteredLogs.map((log, lIdx) => {
                const isSelected = log.id === (selectedLog?.id || '');
                return (
                  <button
                    key={`hist_${log.id}_${lIdx}`}
                    onClick={() => {
                      soundFx.playParchmentTurn();
                      setSelectedTurnId(log.id);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all text-xs flex items-center justify-between group ${
                      isSelected
                        ? 'bg-amber-950/40 border-amber-600/60 text-amber-200 shadow-md ring-1 ring-amber-500/30'
                        : 'bg-stone-900/40 border-stone-800/60 text-stone-300 hover:bg-stone-900 hover:border-stone-700'
                    }`}
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <div className="flex items-center gap-1.5 mb-1 font-mono">
                        <span className="font-bold text-amber-400">
                          #{log.turnNumber}
                        </span>
                        <span className="text-[10px] text-stone-400 truncate">
                          {log.ageDisplay}
                        </span>
                      </div>
                      <div className="text-[11px] text-stone-300 truncate font-story">
                        {log.playerAction ? `"${log.playerAction}"` : log.narration.substring(0, 45)}...
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${isSelected ? 'text-amber-400 translate-x-0.5' : 'text-stone-600 group-hover:text-stone-400'}`} />
                  </button>
                );
              })
            )}
          </div>

          {/* Turn Detail Reader */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-stone-950/40 space-y-5">
            {selectedLog ? (
              <div className="space-y-5 animate-fadeIn">
                {/* Turn Meta Header */}
                <div className="p-4 rounded-xl bg-stone-900/80 border border-stone-800 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 font-cinzel font-bold text-xs border border-amber-500/40">
                      LƯỢT #{selectedLog.turnNumber}
                    </span>
                    <span className="text-xs text-stone-300 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-400" /> {selectedLog.ageDisplay}
                    </span>
                    <span className="text-xs text-stone-400 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-rose-400" /> {selectedLog.location}
                    </span>
                  </div>
                  {selectedLog.dangerEncountered && (
                    <span className="px-2 py-0.5 rounded bg-rose-950/60 text-rose-300 text-[11px] border border-rose-800/60 flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3" /> Nguy biến / Chiến đấu
                    </span>
                  )}
                </div>

                {/* Player Action */}
                {selectedLog.playerAction && (
                  <div className="p-3 rounded-lg bg-amber-950/20 border-l-4 border-amber-600 text-xs text-amber-200/90 italic font-story">
                    <strong className="not-italic text-amber-400 font-sans">Hành động của bạn:</strong> "{selectedLog.playerAction}"
                  </div>
                )}

                {/* Narration */}
                <div className="p-5 rounded-xl bg-stone-900/60 border border-stone-800/80">
                  <div className="text-xs uppercase tracking-wider font-cinzel text-amber-400 font-bold mb-3 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Diễn Biến Sự Kiện
                  </div>
                  <div className="font-story text-sm sm:text-base leading-relaxed text-stone-200 whitespace-pre-line text-justify">
                    {selectedLog.narration}
                  </div>
                </div>

                {/* Status Summary if available */}
                {selectedLog.statusSummary && (
                  <div className="p-4 rounded-xl bg-stone-950 border border-stone-800/80 font-mono text-xs">
                    <div className="text-[11px] text-cyan-400 font-bold mb-2 flex items-center gap-1 font-sans uppercase">
                      <Sparkles className="w-3 h-3" /> Bảng Trạng Thái Tại Thời Điểm Này
                    </div>
                    <pre className="text-stone-300 whitespace-pre-wrap font-sans text-xs leading-relaxed">
                      {selectedLog.statusSummary}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-stone-500 text-sm">
                Chọn một lượt bên trái để xem lại diễn biến chi tiết.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-stone-900/80 border-t border-stone-800/80 flex items-center justify-between text-xs text-stone-400">
          <span>Hệ thống lưu trữ biên niên sử tự động ghi nhớ toàn bộ cuộc đời của bạn.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold transition-all shadow-md"
          >
            Đóng Biên Niên Sử
          </button>
        </div>

      </div>
    </div>
  );
};
