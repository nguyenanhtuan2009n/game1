import React, { useState } from 'react';
import { PRESET_BACKGROUNDS } from '../services/mushokuRules';
import { soundFx } from '../services/soundFx';
import { 
  Sparkles, 
  Compass, 
  Shield, 
  BookOpen, 
  User, 
  Flame, 
  Dices, 
  RotateCcw, 
  Check, 
  Zap, 
  AlertTriangle, 
  Skull, 
  Award, 
  ChevronDown, 
  ChevronUp, 
  Info,
  CheckCircle2
} from 'lucide-react';
import { 
  TALENTS_CATALOG, 
  TALENT_TIER_POOLS, 
  rollInnateTalentRng, 
  applyTalentToBaseStats, 
  getAgeZeroBaseStats,
  type TalentDefinition, 
  type TalentTier 
} from '../services/mushokuTalents';

interface ReincarnationModalProps {
  carriedSp?: number;
  carriedKp?: number;
  lastCharacterName?: string;
  onStart: (data: {
    name: string;
    race: string;
    origin: string;
    baseStats: any;
    rawBaseStats?: any;
    initialBonds: any[];
    initialLanguages: string[];
    specialGift: string;
    preRolledTalent?: string;
  }) => void;
}

export const ReincarnationModal: React.FC<ReincarnationModalProps> = ({ 
  onStart, 
  carriedSp = 60, 
  carriedKp = 20,
  lastCharacterName 
}) => {
  const [name, setName] = useState('Arthur');
  const [selectedPresetId, setSelectedPresetId] = useState(PRESET_BACKGROUNDS[0].id);
  const [customRace, setCustomRace] = useState('Nhân tộc (Human)');
  const [customOrigin, setCustomOrigin] = useState('');

  // Initial RNG Dice Roll for Innate Talent across all 6 tiers
  const [currentTalent, setCurrentTalent] = useState<TalentDefinition>(() => {
    return rollInnateTalentRng().talent;
  });
  const [lastRollInfo, setLastRollInfo] = useState<string>('Khởi tạo vận mệnh ban đầu');
  const [isRolling, setIsRolling] = useState(false);
  const [showCatalogBrowser, setShowCatalogBrowser] = useState(false);
  const [catalogTierTab, setCatalogTierTab] = useState<TalentTier | 'all'>('all');
  const [allowCurseRolls, setAllowCurseRolls] = useState(true);

  const activePreset = PRESET_BACKGROUNDS.find(p => p.id === selectedPresetId) || PRESET_BACKGROUNDS[0];

  // Re-roll Talent Dice across all 6 tiers
  const handleRollDice = () => {
    setIsRolling(true);
    soundFx.playDiceRoll();

    setTimeout(() => {
      const rolled = rollInnateTalentRng();
      setCurrentTalent(rolled.talent);
      setLastRollInfo(`Điểm xúc xắc: ${rolled.rollScore}/100 • Gán [${rolled.talent.tierName}] (${rolled.tierProbability})`);
      setIsRolling(false);
      soundFx.playPowerUp();
    }, 400);
  };

  // Helper to get standard unbuffed Age 0 CharacterStats (HP: 10, MP: 10, STR: 2, AGI: 2, Touki: 0)
  const getFullPresetStats = () => {
    const race = customRace.trim() ? customRace : activePreset.race;
    const location = customOrigin.trim() ? customOrigin : activePreset.location;
    return getAgeZeroBaseStats(race, location);
  };

  // Preview Scaled Base Stats
  const scaledPreviewStats = applyTalentToBaseStats(getFullPresetStats(), currentTalent);

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    soundFx.playMagicCast();

    const origin = customOrigin.trim() ? customOrigin : activePreset.location;
    const race = customRace.trim() ? customRace : activePreset.race;

    // Apply all % talent scaling directly to Age-0 Base Stats
    const rawStats = getAgeZeroBaseStats(race, origin);
    const finalBaseStats = applyTalentToBaseStats(rawStats, currentTalent);

    onStart({
      name: name.trim(),
      race,
      origin,
      baseStats: finalBaseStats,
      rawBaseStats: rawStats,
      initialBonds: activePreset.initialBonds,
      initialLanguages: activePreset.initialLanguages,
      specialGift: currentTalent.id,
      preRolledTalent: currentTalent.id,
    });
  };

  const tierColors: Record<TalentTier, { badge: string; border: string; glow: string }> = {
    curse: {
      badge: 'bg-red-950/80 border-red-500/80 text-red-300',
      border: 'border-red-600/80',
      glow: 'shadow-[0_0_25px_rgba(239,68,68,0.35)] ring-1 ring-red-500/40',
    },
    common: {
      badge: 'bg-stone-800/80 border-stone-600/80 text-stone-200',
      border: 'border-stone-600/60',
      glow: 'shadow-[0_0_15px_rgba(168,162,158,0.2)]',
    },
    rare: {
      badge: 'bg-cyan-950/80 border-cyan-500/80 text-cyan-200',
      border: 'border-cyan-500/70',
      glow: 'shadow-[0_0_20px_rgba(6,182,212,0.3)] ring-1 ring-cyan-400/40',
    },
    genius: {
      badge: 'bg-violet-950/80 border-violet-400/80 text-violet-200',
      border: 'border-violet-500/80',
      glow: 'shadow-[0_0_25px_rgba(139,92,246,0.4)] ring-1 ring-violet-400/50',
    },
    legendary: {
      badge: 'bg-amber-950/90 border-amber-400/90 text-amber-200 font-bold',
      border: 'border-amber-400',
      glow: 'shadow-[0_0_30px_rgba(245,158,11,0.5)] ring-1 ring-amber-300/60',
    },
    godkin: {
      badge: 'bg-gradient-to-r from-red-900 to-rose-900 border-red-300 text-red-100 font-black',
      border: 'border-rose-400',
      glow: 'shadow-[0_0_35px_rgba(244,63,94,0.6)] ring-2 ring-rose-400/70 animate-pulse',
    },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl my-6 bg-slate-950/95 border-2 border-amber-500/50 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] text-stone-100 overflow-hidden flex flex-col backdrop-blur-xl">
        {/* Ancient Grimoire Header Banner */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 px-6 py-5 border-b border-amber-500/30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-amber-500/30 to-amber-700/40 border border-amber-400/60 rounded-xl text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-widest text-amber-400 font-mono font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                RPG SANDBOX • HỆ THỐNG THIÊN PHÚ THEO KIẾP &amp; QUY ĐỔI %
              </span>
              <h2 className="text-2xl font-cinzel font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300 tracking-wide drop-shadow">
                Thức Tỉnh Tại Đại Lục Huyền Ảo Valoria
              </h2>
            </div>
          </div>
          <p className="mt-3 text-xs sm:text-sm text-stone-200 italic leading-relaxed bg-black/50 p-3.5 rounded-xl border border-amber-500/20 font-story">
            "Khi khởi tạo hoặc chuyển sinh, AI tự động tung xúc xắc ngầm (RNG) để gán thiên phú. Tất cả hiệu ứng buff/nerf tính toán trực tiếp vào chỉ số gốc (Base Stats) theo tỷ lệ phần trăm (%)."
          </p>

          {/* Carried SP & KP Legacy Banner */}
          <div className="mt-3 p-3.5 rounded-xl bg-gradient-to-r from-purple-950/80 via-slate-900/90 to-purple-950/80 border-2 border-purple-500/60 shadow-[0_0_20px_rgba(168,85,247,0.25)] flex flex-col sm:flex-row items-center justify-between gap-3 text-stone-100">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-900/60 border border-purple-400 text-purple-300 shrink-0">
                <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
              </div>
              <div>
                <div className="font-cinzel font-bold text-xs uppercase tracking-wider text-purple-300 flex items-center gap-2">
                  <span>🌟 Luân Hồi Kế Thừa: Giữ Trọn SP &amp; KP Kiếp Cũ</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 font-mono font-bold">
                    BẢO LƯU 100%
                  </span>
                </div>
                <p className="text-[11px] text-stone-300 mt-0.5 font-vietnam">
                  {lastCharacterName ? `Kế thừa từ [${lastCharacterName}]: ` : ''}
                  Toàn bộ Điểm Kỹ Năng ({carriedSp} SP) và Điểm Tri Thức ({carriedKp} KP) được chuyển giao nguyên vẹn!
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 font-mono font-bold text-sm bg-black/50 px-3.5 py-1.5 rounded-lg border border-purple-500/40 shrink-0 shadow-inner">
              <span className="text-amber-300 flex items-center gap-1">
                <span className="text-[10px] text-amber-400/80 font-sans">SP:</span> {carriedSp}
              </span>
              <span className="text-stone-500">•</span>
              <span className="text-cyan-300 flex items-center gap-1">
                <span className="text-[10px] text-cyan-400/80 font-sans">KP:</span> {carriedKp}
              </span>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleStart} className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
          {/* Section 1: Name and Identity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-amber-300 font-semibold mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-400" /> Tên Nhân Vật (Nhận diện bản thân):
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: Arthur, Rudeus, Eris, Sylphy..."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-amber-500/40 text-amber-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 font-vietnam text-sm font-semibold shadow-inner"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-amber-300 font-semibold mb-1.5 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-amber-400" /> Chủng Tộc:
              </label>
              <input
                type="text"
                value={customRace}
                onChange={(e) => setCustomRace(e.target.value)}
                placeholder="VD: Nhân tộc, Long tộc, Thú tộc, Elf, Ma tộc..."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-amber-500/40 text-amber-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 font-vietnam text-sm font-semibold shadow-inner"
              />
            </div>
          </div>

          {/* Section 2: Preset Origin */}
          <div className="space-y-2">
            <label className="block text-xs uppercase tracking-wider text-amber-300 font-semibold flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-amber-400" /> Xuất Thân &amp; Gia Cảnh Khởi Đầu:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {PRESET_BACKGROUNDS.map((preset) => {
                const isSelected = preset.id === selectedPresetId;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      setSelectedPresetId(preset.id);
                      setCustomRace(preset.race);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-950/50 border-amber-400 text-amber-100 ring-1 ring-amber-400/40 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                        : 'bg-slate-900/60 border-slate-800 text-stone-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold text-xs text-amber-200">{preset.name}</div>
                    <div className="text-[11px] text-stone-400 mt-0.5 line-clamp-1">{preset.description}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ==================================================================== */}
          {/* Section 3: THE PERCENTAGE-BASED TALENT MATRIX & SCALING SYSTEM */}
          {/* ==================================================================== */}
          <div className="space-y-3 pt-2 border-t border-amber-500/20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-cinzel font-bold uppercase tracking-wider text-amber-300 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-400" /> 3. Thiên Phú Tái Sinh &amp; Quy Đổi Chỉ Số % (Talent Matrix)
                </h3>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  Tung xúc xắc ngầm định hình căn cơ kiếp này. Buff/nerf % áp dụng trực tiếp vào Base Stats.
                </p>
              </div>

              {/* Dice Action Controls */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRollDice}
                  disabled={isRolling}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-slate-950 font-cinzel font-bold text-xs shadow-[0_0_20px_rgba(245,158,11,0.35)] flex items-center gap-2 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  <Dices className={`w-4 h-4 ${isRolling ? 'animate-spin' : ''}`} />
                  {isRolling ? 'ĐANG TUNG XÚC XẮC...' : '🎲 ĐỔ XÚC XẮC VẬN MỆNH'}
                </button>

                <button
                  type="button"
                  onClick={() => setShowCatalogBrowser(!showCatalogBrowser)}
                  className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-amber-400/60 text-stone-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  {showCatalogBrowser ? 'Ẩn Tra Cứu' : 'Tra 23 Thiên Phú'}
                  {showCatalogBrowser ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Checkbox for allowing curse rolls */}
            <div className="flex items-center justify-between bg-black/40 px-3 py-2 rounded-lg border border-slate-800 text-[11px]">
              <label className="flex items-center gap-2 text-stone-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={allowCurseRolls}
                  onChange={(e) => setAllowCurseRolls(e.target.checked)}
                  className="rounded border-slate-700 text-amber-500 focus:ring-0 cursor-pointer"
                />
                <span className="flex items-center gap-1 text-red-300 font-semibold">
                  <Skull className="w-3.5 h-3.5 text-red-400" />
                  Chế độ Thử Thách Nghịch Cảnh (Kích hoạt 15% cơ hội rơi vào Nhóm Lời Nguyền / Khiếm Khuyết Nặng)
                </span>
              </label>
              <span className="text-stone-500 font-mono text-[10px] hidden sm:inline">
                {lastRollInfo}
              </span>
            </div>

            {/* Current Rolled Talent Display Card */}
            <div className={`p-4 rounded-xl border-2 transition-all ${currentTalent.themeColor.bg} ${currentTalent.themeColor.border} ${currentTalent.themeColor.glow}`}>
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="text-3xl shrink-0 p-2 bg-black/50 rounded-xl border border-white/10 shadow-inner">
                    {currentTalent.icon}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-base font-cinzel font-bold text-stone-100">
                        [{currentTalent.name}]
                      </span>
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full border font-mono font-bold ${tierColors[currentTalent.tier].badge}`}>
                        {currentTalent.tierName.toUpperCase()} • TỶ LỆ {currentTalent.tierProbability}
                      </span>
                    </div>
                    <p className="text-xs text-stone-300 mt-1 italic font-story leading-relaxed">
                      "{currentTalent.description}"
                    </p>
                  </div>
                </div>

                <div className="shrink-0 flex sm:flex-col items-center sm:items-end justify-between gap-1 text-[11px] font-mono bg-black/40 p-2.5 rounded-lg border border-white/10">
                  <span className="text-stone-400">Trạng Thái:</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> ĐÃ GÁN KIẾP NÀY
                  </span>
                </div>
              </div>

              {/* Percentage Effects Grid */}
              <div className="mt-3 pt-3 border-t border-white/10">
                <div className="text-[11px] uppercase tracking-wider font-semibold text-amber-300/90 mb-2 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  Hiệu Ứng Quy Đổi Vào Chỉ Số Gốc (Base Stats % &amp; Rào Cản Bình Cảnh):
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {currentTalent.effectsSummary.map((effect, idx) => {
                    const isNerf = effect.includes('-') || effect.includes('Khóa') || effect.includes('Không thể') || effect.includes('Suy giảm');
                    return (
                      <div
                        key={idx}
                        className={`p-2 rounded-lg text-xs font-vietnam leading-tight border flex items-start gap-1.5 ${
                          isNerf 
                            ? 'bg-red-950/40 border-red-800/60 text-red-200' 
                            : 'bg-emerald-950/30 border-emerald-800/50 text-emerald-200'
                        }`}
                      >
                        <span className={`font-mono text-xs font-bold ${isNerf ? 'text-red-400' : 'text-emerald-400'}`}>
                          {isNerf ? '▼' : '▲'}
                        </span>
                        <span>{effect}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Base Stats Preview Comparison */}
              <div className="mt-3 p-3 bg-black/60 rounded-xl border border-white/10 grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs font-mono">
                <div className="p-1.5 rounded bg-slate-900/80 border border-slate-800">
                  <div className="text-[10px] text-stone-400">HP TỐI ĐA</div>
                  <div className="font-bold text-rose-300 mt-0.5">
                    {scaledPreviewStats.healthMax}
                    <span className="text-[10px] text-stone-500 ml-1">({activePreset.baseStats.healthMax})</span>
                  </div>
                </div>

                <div className="p-1.5 rounded bg-slate-900/80 border border-slate-800">
                  <div className="text-[10px] text-stone-400">MANA MAX</div>
                  <div className="font-bold text-cyan-300 mt-0.5">
                    {scaledPreviewStats.manaMax}
                    <span className="text-[10px] text-stone-500 ml-1">({activePreset.baseStats.manaMax})</span>
                  </div>
                </div>

                <div className="p-1.5 rounded bg-slate-900/80 border border-slate-800">
                  <div className="text-[10px] text-stone-400">ĐẤU KHÍ (GIỚI HẠN)</div>
                  <div className="font-bold text-emerald-300 mt-0.5">
                    {currentTalent.modifiers.lockTouki ? (
                      <span className="text-red-400 text-xs">0 (Khóa vĩnh viễn)</span>
                    ) : (
                      <>
                        {scaledPreviewStats.touki} / {scaledPreviewStats.toukiMax || 100}
                        <span className="text-[10px] text-stone-500 ml-1">(Gốc: 100)</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="p-1.5 rounded bg-slate-900/80 border border-slate-800">
                  <div className="text-[10px] text-stone-400">STR (CƠ BẮP)</div>
                  <div className="font-bold text-amber-300 mt-0.5">
                    {scaledPreviewStats.strength || 20}
                    <span className="text-[10px] text-stone-500 ml-1">(20)</span>
                  </div>
                </div>

                <div className="p-1.5 rounded bg-slate-900/80 border border-slate-800 col-span-2 sm:col-span-1">
                  <div className="text-[10px] text-stone-400">AGI (PHẢN XẠ)</div>
                  <div className="font-bold text-purple-300 mt-0.5">
                    {scaledPreviewStats.agility || 15}
                    <span className="text-[10px] text-stone-500 ml-1">({(activePreset.baseStats as any).agility || 15})</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Optional Catalog Browser Drawer */}
            {showCatalogBrowser && (
              <div className="p-4 bg-slate-900/95 rounded-xl border border-amber-500/40 space-y-3 animate-fadeIn">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                  <div className="font-cinzel font-bold text-xs uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-400" />
                    Thư Viện 23 Thiên Phú Theo 6 Cấp Bậc (Tra Cứu &amp; Chọn Trực Tiếp)
                  </div>
                  {/* Tier Filter Tabs */}
                  <div className="flex flex-wrap gap-1">
                    {(['all', 'godkin', 'legendary', 'genius', 'rare', 'common', 'curse'] as const).map((tierKey) => (
                      <button
                        key={tierKey}
                        type="button"
                        onClick={() => setCatalogTierTab(tierKey)}
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all cursor-pointer ${
                          catalogTierTab === tierKey
                            ? 'bg-amber-500 text-slate-950 font-bold'
                            : 'bg-black/40 text-stone-400 hover:text-stone-200'
                        }`}
                      >
                        {tierKey === 'all' ? 'Tất cả' : tierKey.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Talent Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-64 overflow-y-auto pr-1">
                  {Object.values(TALENTS_CATALOG)
                    .filter((t) => catalogTierTab === 'all' || t.tier === catalogTierTab)
                    .map((t) => {
                      const isSelected = currentTalent.id === t.id;
                      return (
                        <div
                          key={t.id}
                          onClick={() => {
                            setCurrentTalent(t);
                            setLastRollInfo(`Chọn thủ công: [${t.name}]`);
                            soundFx.playMagicCast();
                          }}
                          className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-amber-950/60 border-amber-400 ring-1 ring-amber-400/50'
                              : 'bg-black/40 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1.5">
                            <span className="font-bold text-xs text-stone-200 flex items-center gap-1">
                              <span>{t.icon}</span> {t.name}
                            </span>
                            <span className={`text-[9px] px-1.5 py-0.2 rounded border font-mono ${tierColors[t.tier].badge}`}>
                              {t.tierProbability}
                            </span>
                          </div>
                          <div className="text-[10px] text-stone-400 mt-1 line-clamp-1">
                            {t.effectsSummary.join(' • ')}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 hover:from-amber-500 hover:to-yellow-400 text-slate-950 font-cinzel font-bold text-base sm:text-lg shadow-[0_0_25px_rgba(245,158,11,0.4)] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01]"
            >
              <Sparkles className="w-5 h-5 text-slate-950" />
              BẮT ĐẦU NĂM 0 TUỔI (THỨC TỈNH VỚI THIÊN PHÚ [{currentTalent.name.toUpperCase()}])
            </button>
            <p className="mt-2 text-center text-[11px] text-stone-400 font-mono">
              Hệ thống áp dụng cơ chế Permadeath, tự do rèn luyện Mana và Đấu Khí trong thế giới RPG Sandbox mở.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
