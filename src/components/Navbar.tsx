import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Volume2, 
  VolumeX, 
  BookOpen, 
  Save, 
  RotateCcw, 
  PlusCircle, 
  Download, 
  Upload,
  ShoppingBag,
  Package,
  Skull,
  Zap,
  HardDrive,
  ChevronDown,
  Compass,
  MapPin,
  Crown
} from 'lucide-react';
import { soundFx } from '../services/soundFx';

interface NavbarProps {
  onOpenGrimoire: () => void;
  onOpenWorldMap?: () => void;
  onOpenCombatHub?: () => void;
  onOpenShop?: () => void;
  onOpenInventory?: () => void;
  onOpenSkillTree?: () => void;
  onOpenTimeSkip?: () => void;
  onOpenSurrender?: () => void;
  onSaveCheckpoint: () => void;
  onLoadCheckpoint: () => void;
  onNewGame: () => void;
  hasCheckpoint: boolean;
  onExportSave: () => void;
  onImportSave: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenGrimoire,
  onOpenWorldMap,
  onOpenCombatHub,
  onOpenShop,
  onOpenInventory,
  onOpenSkillTree,
  onOpenSurrender,
  onSaveCheckpoint,
  onLoadCheckpoint,
  onNewGame,
  hasCheckpoint,
  onExportSave,
  onImportSave,
}) => {
  const [isMuted, setIsMuted] = useState(!soundFx.enabled);
  const [showSaveMenu, setShowSaveMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleSound = () => {
    soundFx.enabled = !soundFx.enabled;
    setIsMuted(!soundFx.enabled);
    if (soundFx.enabled) {
      soundFx.playMagicCast();
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowSaveMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-white/95 border-b border-amber-300/80 px-3 sm:px-5 py-2.5 backdrop-blur-xl sticky top-0 z-40 shadow-[0_4px_25px_rgba(217,119,6,0.1)] text-stone-900">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Brand / Logo */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <div className="relative">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 flex items-center justify-center text-amber-950 shadow-[0_0_16px_rgba(245,158,11,0.35)] border border-amber-300">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-950" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] uppercase font-mono tracking-widest text-amber-800 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span>OPEN SANDBOX RPG</span>
            </div>
            <span className="font-cinzel font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-950 via-amber-900 to-stone-900 text-xs sm:text-sm md:text-base tracking-wide drop-shadow-xs">
              Valoria: Thế Giới Mở Vận Mệnh
            </span>
          </div>
        </div>

        {/* Clean, Organized Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Main Gameplay Features */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            {/* Grimoire / Bách Khoa */}
            <button
              onClick={() => {
                soundFx.playClick();
                onOpenGrimoire();
              }}
              title="Đại bách khoa toàn thư thế giới đại lục"
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-2xs hover:scale-102"
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden md:inline">Bách Khoa</span>
            </button>

            {/* Shop & Crafting */}
            {onOpenShop && (
              <button
                onClick={() => {
                  soundFx.playClick();
                  onOpenShop();
                }}
                title="Giao dịch tại Thương Hội & Chế tạo trang bị"
                className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-2xs hover:scale-102"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden md:inline">Thương Hội</span>
              </button>
            )}

            {/* Equipment & Inventory */}
            {onOpenInventory && (
              <button
                onClick={() => {
                  soundFx.playClick();
                  onOpenInventory();
                }}
                title="Mở Bảng 11 Ô Trang Bị và 20 Ô Túi Đồ"
                className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-300 text-sky-900 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-2xs hover:scale-102"
              >
                <Package className="w-3.5 h-3.5 text-sky-600" />
                <span className="hidden md:inline">Túi & Trang Bị</span>
              </button>
            )}

            {/* World Map & Fast Travel */}
            {onOpenWorldMap && (
              <button
                onClick={() => {
                  soundFx.playParchmentTurn();
                  onOpenWorldMap();
                }}
                title="Bản Đồ Thế Giới Sáu Mặt & Dịch Chuyển Nhanh"
                className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 border border-teal-300 text-teal-950 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs hover:scale-102"
              >
                <Compass className="w-3.5 h-3.5 text-teal-600 animate-spin-slow" />
                <span>Bản Đồ</span>
              </button>
            )}

            {/* Skill Tree */}
            {onOpenSkillTree && (
              <button
                onClick={() => {
                  soundFx.playRuneHum();
                  onOpenSkillTree();
                }}
                title="Mở Cây Kỹ Năng Đa Diện & Đột Phá Bình Cảnh"
                className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-purple-100 hover:bg-purple-200 border border-purple-400 text-purple-950 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs hover:scale-102"
              >
                <Zap className="w-3.5 h-3.5 text-purple-700" />
                <span>Kỹ Năng</span>
              </button>
            )}

            {/* Seven Great Powers & Hunting Hub */}
            {onOpenCombatHub && (
              <button
                onClick={() => {
                  soundFx.playSwordClash();
                  onOpenCombatHub();
                }}
                title="Hệ thống Ma thú, Hội Mạo Hiểm Giả & Bia Đá Thất Đại Liệt Cường"
                className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 border border-amber-500 text-amber-950 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs hover:scale-102"
              >
                <Crown className="w-3.5 h-3.5 text-amber-700 animate-pulse" />
                <span>Liệt Cường</span>
              </button>
            )}
          </div>

          <div className="h-4 w-px bg-stone-300 mx-0.5 hidden sm:block" />

          {/* Sound Mute Toggle */}
          <button
            onClick={toggleSound}
            title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
            className="p-1.5 sm:p-2 rounded-xl bg-white border border-stone-200 text-stone-600 hover:text-amber-700 hover:border-amber-400 transition cursor-pointer shadow-2xs"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-stone-400" /> : <Volume2 className="w-4 h-4 text-amber-600" />}
          </button>

          {/* Consolidated Save & System Dropdown Menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => {
                soundFx.playClick();
                setShowSaveMenu(!showSaveMenu);
              }}
              title="Quản lý Lưu trữ, Tải lại, Xuất/Nhập dữ liệu & Bắt đầu lại"
              className={`px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-2xs ${
                showSaveMenu
                  ? 'bg-amber-100 text-amber-950 border-amber-400'
                  : 'bg-white hover:bg-amber-50/60 text-stone-700 hover:text-amber-900 border-stone-300'
              }`}
            >
              <HardDrive className="w-3.5 h-3.5 text-amber-600" />
              <span>Dữ Liệu</span>
              <ChevronDown className={`w-3 h-3 text-stone-500 transition-transform ${showSaveMenu ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Popover */}
            {showSaveMenu && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white/98 border border-amber-300 shadow-xl p-2 z-50 text-stone-800 text-xs backdrop-blur-xl animate-turn-in space-y-1">
                <div className="px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-stone-500 border-b border-stone-100 mb-1">
                  Điểm Kiểm Tra (Checkpoint)
                </div>

                {/* Save Checkpoint */}
                <button
                  onClick={() => {
                    setShowSaveMenu(false);
                    onSaveCheckpoint();
                  }}
                  className="w-full px-2.5 py-2 rounded-lg hover:bg-emerald-50 text-stone-800 hover:text-emerald-800 flex items-center gap-2.5 transition text-left cursor-pointer"
                >
                  <Save className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <div className="font-semibold">Lưu Điểm Checkpoint</div>
                    <div className="text-[10px] text-stone-500">Bảo vệ tiến trình trước cái chết</div>
                  </div>
                </button>

                {/* Load Checkpoint */}
                <button
                  onClick={() => {
                    setShowSaveMenu(false);
                    onLoadCheckpoint();
                  }}
                  disabled={!hasCheckpoint}
                  className="w-full px-2.5 py-2 rounded-lg hover:bg-sky-50 text-stone-800 hover:text-sky-800 flex items-center gap-2.5 transition text-left cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <RotateCcw className="w-4 h-4 text-sky-600 shrink-0" />
                  <div>
                    <div className="font-semibold">Tải Lại Checkpoint</div>
                    <div className="text-[10px] text-stone-500">{hasCheckpoint ? 'Quay về điểm đã lưu gần nhất' : 'Chưa có bản lưu'}</div>
                  </div>
                </button>

                <div className="my-1 border-t border-stone-200" />

                <div className="px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-stone-500">
                  Tệp Dữ Liệu (File)
                </div>

                {/* Export Save */}
                <button
                  onClick={() => {
                    setShowSaveMenu(false);
                    onExportSave();
                  }}
                  className="w-full px-2.5 py-1.5 rounded-lg hover:bg-amber-50 text-stone-700 hover:text-amber-900 flex items-center gap-2.5 transition text-left cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Xuất File Lưu (.json)</span>
                </button>

                {/* Import Save */}
                <button
                  onClick={() => {
                    setShowSaveMenu(false);
                    onImportSave();
                  }}
                  className="w-full px-2.5 py-1.5 rounded-lg hover:bg-amber-50 text-stone-700 hover:text-amber-900 flex items-center gap-2.5 transition text-left cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Nhập File Lưu (.json)</span>
                </button>

                <div className="my-1 border-t border-stone-200" />

                {/* Surrender */}
                {onOpenSurrender && (
                  <button
                    onClick={() => {
                      setShowSaveMenu(false);
                      onOpenSurrender();
                    }}
                    className="w-full px-2.5 py-1.5 rounded-lg hover:bg-rose-50 text-rose-700 flex items-center gap-2.5 transition text-left cursor-pointer"
                  >
                    <Skull className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span>Bỏ Cuộc (Nhận Kế Thừa)</span>
                  </button>
                )}

                {/* New Reincarnation */}
                <button
                  onClick={() => {
                    setShowSaveMenu(false);
                    onNewGame();
                  }}
                  className="w-full px-2.5 py-1.5 rounded-lg hover:bg-amber-50 text-amber-800 font-semibold flex items-center gap-2.5 transition text-left cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Chuyển Sinh Mới</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
