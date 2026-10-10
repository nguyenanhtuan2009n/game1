import React, { useState } from 'react';
import type { Character, AdventurerQuest, PowerTier } from '../types/game.ts';
import { 
  CANON_REGIONAL_ECOSYSTEMS,
  GREAT_POWER_AFFILIATIONS,
  CANON_BOSSES,
  SEVEN_GREAT_POWERS_CANON,
  CANON_ADVENTURER_QUESTS,
  ensureSevenGreatPowersState,
  evaluateGreatPowerChallenge,
  type CanonMonster,
  type CanonBoss
} from '../services/mushokuCanonBeastsAndPowers.ts';
import { identifyCurrentRegion, SIX_FACED_WORLD_REGIONS, type WorldRegionId } from '../services/mushokuWorldMap.ts';
import { soundFx } from '../services/soundFx.ts';
import { 
  Crosshair, 
  X, 
  MapPin, 
  ShieldAlert, 
  Coins, 
  Swords, 
  Skull, 
  Sparkles,
  Award,
  Crown,
  Scroll,
  Eye,
  AlertTriangle,
  Zap,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface HuntingHubModalProps {
  character: Character;
  onSelectHunt: (huntAction: string) => void;
  onClose: () => void;
  disabled?: boolean;
}

type TabType = 'ecosystem' | 'affiliations' | 'guild_quests' | 'great_powers';

export const HuntingHubModal: React.FC<HuntingHubModalProps> = ({
  character,
  onSelectHunt,
  onClose,
  disabled,
}) => {
  const currentRegion = identifyCurrentRegion(character.stats.location);
  const [selectedRegionId, setSelectedRegionId] = useState<WorldRegionId>(currentRegion.id);
  const [activeTab, setActiveTab] = useState<TabType>('ecosystem');
  const [warningPowerRank, setWarningPowerRank] = useState<number | null>(null);

  const monument = ensureSevenGreatPowersState(character);
  const coins = character.stats.asuraCoins || 0;
  const playerRank = character.reputation?.adventurerRank || 'F';
  const currentTier = character.progression?.overallRank || 'Sơ cấp (Beginner)';
  const isHighTier = currentTier === 'Đế cấp (Emperor)' || currentTier === 'Thần cấp (God)';

  const ecosystem = CANON_REGIONAL_ECOSYSTEMS[selectedRegionId] || CANON_REGIONAL_ECOSYSTEMS.asura;

  const handleLaunch = (actionText: string) => {
    soundFx.playSwordClash();
    onSelectHunt(actionText);
    onClose();
  };

  const handleChallengePower = (powerRank: number) => {
    const evalResult = evaluateGreatPowerChallenge(character, powerRank);
    if (evalResult.isInstakill) {
      setWarningPowerRank(powerRank);
    } else {
      handleLaunch(`Tiến lên đỉnh núi tuyết phương Bắc, bước lên võ đài sinh tử khiêu chiến Đệ ${powerRank} Cường trên Bia Đá Thế Giới!`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-turn-in font-sans">
      <div className="bg-stone-900 border-2 border-amber-700/80 rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl text-stone-200 overflow-hidden">
        
        {/* Top Header */}
        <div className="bg-gradient-to-r from-stone-950 via-amber-950 to-stone-950 px-4 sm:px-6 py-3.5 border-b border-amber-800/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-600/20 border border-amber-500/40 text-amber-400">
              <Crown className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-amber-400 block">
                MUSHOKU TENSEI • THẾ GIỚI SÁU MẶT CHUẨN NGUYÊN TÁC
              </span>
              <h2 className="font-serif font-bold text-base sm:text-lg text-amber-100 flex items-center gap-2">
                Hệ Thống Quái Vật, Hội Mạo Hiểm Giả & Thất Đại Liệt Cường
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Sub-Banner: Location, Rank & Coins */}
        <div className="bg-stone-950 px-4 sm:px-6 py-2.5 border-b border-stone-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5 text-rose-300 font-mono">
              <MapPin className="w-4 h-4 text-rose-400" />
              <span>Vị trí: <strong>{character.stats.location}</strong></span>
            </div>
            <div className="flex items-center gap-1.5 text-amber-300 font-mono">
              <Coins className="w-4 h-4 text-amber-400" />
              <span>Ví tiền: <strong>{coins}</strong> Xu Asura</span>
            </div>
            <div className="flex items-center gap-1.5 text-blue-300 font-mono">
              <Award className="w-4 h-4 text-blue-400" />
              <span>Hội Mạo Hiểm Giả: <strong className="px-1.5 py-0.5 rounded bg-blue-950 border border-blue-700 text-blue-200">Rank {playerRank}</strong></span>
            </div>
            <div className="flex items-center gap-1.5 text-purple-300 font-mono">
              <Zap className="w-4 h-4 text-purple-400" />
              <span>Thực lực: <strong>{currentTier}</strong></span>
            </div>
          </div>

          {monument.playerRank && (
            <div className="text-amber-300 font-bold font-serif text-[11px] bg-amber-950/80 px-2.5 py-1 rounded-full border border-amber-600/70 flex items-center gap-1.5">
              <span>👑</span>
              <span>Bạn đang giữ Đệ {monument.playerRank} Cường Thế Giới!</span>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="bg-stone-950/60 px-4 sm:px-6 py-2 border-b border-stone-800 flex flex-wrap gap-2">
          <button
            onClick={() => {
              soundFx.playClick();
              setActiveTab('ecosystem');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'ecosystem'
                ? 'bg-amber-600 text-stone-950 font-bold shadow-md'
                : 'bg-stone-800/80 text-stone-300 hover:bg-stone-800 hover:text-amber-200'
            }`}
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>1. Sinh Thái 5 Khu Vực</span>
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              setActiveTab('affiliations');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'affiliations'
                ? 'bg-amber-600 text-stone-950 font-bold shadow-md'
                : 'bg-stone-800/80 text-stone-300 hover:bg-stone-800 hover:text-amber-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>2. Phe Cánh Thất Đại Cường</span>
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              setActiveTab('guild_quests');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'guild_quests'
                ? 'bg-amber-600 text-stone-950 font-bold shadow-md'
                : 'bg-stone-800/80 text-stone-300 hover:bg-stone-800 hover:text-amber-200'
            }`}
          >
            <Scroll className="w-3.5 h-3.5" />
            <span>3. Hội Mạo Hiểm Giả (Rank F-S)</span>
            {character.activeQuest && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping ml-1" />
            )}
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              setActiveTab('great_powers');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'great_powers'
                ? 'bg-amber-600 text-stone-950 font-bold shadow-md'
                : 'bg-stone-800/80 text-stone-300 hover:bg-stone-800 hover:text-amber-200'
            }`}
          >
            <Crown className="w-3.5 h-3.5" />
            <span>4. Bia Đá & Boss Thế Giới</span>
          </button>
        </div>

        {/* Tab 1: Sinh Thái Ma Thú 5 Khu Vực */}
        {activeTab === 'ecosystem' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
            {/* Region Selector Pills */}
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-xs text-stone-400 font-mono uppercase">Chọn Khu Vực:</span>
              {(Object.keys(CANON_REGIONAL_ECOSYSTEMS) as WorldRegionId[]).map((rId) => {
                const reg = SIX_FACED_WORLD_REGIONS[rId];
                const isSelected = selectedRegionId === rId;
                const isCurrent = currentRegion.id === rId;
                return (
                  <button
                    key={rId}
                    onClick={() => {
                      soundFx.playClick();
                      setSelectedRegionId(rId);
                    }}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold transition cursor-pointer border ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-500 text-amber-200 shadow-sm'
                        : 'bg-stone-950/60 border-stone-800 text-stone-400 hover:text-stone-200 hover:border-stone-700'
                    }`}
                  >
                    <span>{reg.name}</span>
                    {isCurrent && <span className="ml-1 text-[10px] text-emerald-400 font-bold">(Hiện Tại)</span>}
                  </button>
                );
              })}
            </div>

            {/* Region Environmental Brief */}
            <div className="bg-stone-950/80 p-3.5 rounded-xl border border-stone-800 text-xs sm:text-sm space-y-1">
              <div className="flex justify-between items-center">
                <h3 className="font-serif font-bold text-amber-200 text-sm sm:text-base flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-rose-400" />
                  {ecosystem.regionName}
                </h3>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-rose-950/80 border border-rose-800/80 text-rose-300">
                  {ecosystem.dangerRankSummary}
                </span>
              </div>
              <p className="text-stone-300 text-xs leading-relaxed italic">{ecosystem.environmentDesc}</p>
            </div>

            {/* Part 1: Canon Beasts */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-2 border-b border-stone-800 pb-1.5">
                <Crosshair className="w-3.5 h-3.5" />
                <span>Ma Thú Chuẩn Nguyên Tác (Trung Cấp, Thượng Cấp, Thánh Cấp, Vương Cấp)</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {ecosystem.midAndHighBeasts.map((beast) => (
                  <div
                    key={beast.id}
                    className="p-3.5 rounded-xl bg-stone-950 border border-stone-800 hover:border-rose-700/60 transition flex flex-col justify-between gap-2.5"
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="font-serif font-bold text-sm text-amber-100">{beast.name}</span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${
                          beast.tier.includes('Vương') ? 'bg-purple-950 text-purple-200 border-purple-700' :
                          beast.tier.includes('Thánh') ? 'bg-red-950 text-red-200 border-red-700' :
                          'bg-amber-950 text-amber-200 border-amber-800'
                        }`}>
                          {beast.tier.split(' ')[0]}
                        </span>
                      </div>
                      <p className="text-xs text-stone-300 mt-1">{beast.desc}</p>
                      <div className="text-[11px] text-stone-400 mt-1 italic">
                        ⚔️ <strong>Hành vi & Tác chiến:</strong> {beast.tactics}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-stone-800/80 flex items-center justify-between text-[11px] text-stone-400 font-mono">
                      <span className="truncate">Rơi: {beast.loot}</span>
                      <span className="text-amber-400 shrink-0 font-bold">+{beast.rewardCoins} Xu</span>
                    </div>

                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => handleLaunch(`Tiến hành truy vết và săn bắt ma thú đặc thù [${beast.name}] tại ${ecosystem.regionName}!`)}
                      className="w-full py-1.5 px-3 rounded-lg bg-rose-900/70 hover:bg-rose-800 text-rose-100 font-serif font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Crosshair className="w-3.5 h-3.5 text-rose-300" />
                      <span>Truy Vết & Săn Bắt Ma Thú Này</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Part 2: Humanoid Enemies */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-2 border-b border-stone-800 pb-1.5">
                <Swords className="w-3.5 h-3.5" />
                <span>Kẻ Địch Dạng Người & Chiến Binh Ma Tộc Địa Phương</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {ecosystem.humanoidEnemies.map((enemy) => (
                  <div
                    key={enemy.id}
                    className="p-3.5 rounded-xl bg-stone-950 border border-stone-800 hover:border-purple-700/60 transition flex flex-col justify-between gap-2.5"
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="font-serif font-bold text-sm text-purple-200">{enemy.name}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-200 border border-purple-800 font-semibold">
                          {enemy.tier.split(' ')[0]}
                        </span>
                      </div>
                      <p className="text-xs text-stone-300 mt-1">{enemy.desc}</p>
                      <div className="text-[11px] text-stone-400 mt-1 italic">
                        ⚡ <strong>Võ học & Thủ đoạn:</strong> {enemy.tactics}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-stone-800/80 flex items-center justify-between text-[11px] text-stone-400 font-mono">
                      <span className="truncate">Rơi: {enemy.loot}</span>
                      <span className="text-amber-400 shrink-0 font-bold">+{enemy.rewardCoins} Xu</span>
                    </div>

                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => handleLaunch(`Thách đấu và đối mặt với thế lực [${enemy.name}] tại ${ecosystem.regionName}!`)}
                      className="w-full py-1.5 px-3 rounded-lg bg-purple-900/70 hover:bg-purple-800 text-purple-100 font-serif font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Swords className="w-3.5 h-3.5 text-purple-300" />
                      <span>Giao Chiến / Thách Đấu Thế Lực Này</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Phe Cánh Thất Đại Liệt Cường */}
        {activeTab === 'affiliations' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            <div className="bg-stone-950/80 p-3.5 rounded-xl border border-stone-800 text-xs sm:text-sm">
              <h3 className="font-serif font-bold text-amber-200 flex items-center gap-2">
                <Crown className="w-4 h-4 text-amber-400" />
                Các Tổ Chức & Sứ Đồ Phục Vụ Dưới Trướng Thất Đại Liệt Cường
              </h3>
              <p className="text-stone-300 text-xs mt-1 leading-relaxed">
                Người chơi có thể đụng độ, hợp tác hoặc bị săn lùng bởi các phe cánh phục vụ 7 kẻ mạnh nhất thế giới.
                Mỗi phe cánh sở hữu bí thuật độc quyền, từ Vô niệm ma pháp, Đấu thần khí, đến kiếm thuật tốc độ ánh sáng!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {GREAT_POWER_AFFILIATIONS.map((affil) => (
                <div
                  key={affil.id}
                  className="p-4 rounded-xl bg-stone-950 border border-stone-800 hover:border-amber-600/70 transition flex flex-col justify-between gap-3"
                >
                  <div>
                    <div className="flex justify-between items-start">
                      <h4 className="font-serif font-bold text-sm text-amber-200">{affil.name}</h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                        {affil.powerRange}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-purple-300 mt-1">
                      Bảo trợ: <strong>{affil.patron}</strong>
                    </div>
                    <p className="text-xs text-stone-300 mt-2 leading-relaxed">{affil.description}</p>
                    <div className="text-[11px] text-stone-400 mt-2 bg-stone-900 p-2 rounded-lg border border-stone-800">
                      ⚡ <strong>Kỹ năng & Đặc trưng:</strong> {affil.tacticsAndTraits}
                    </div>
                    <div className="text-[11px] text-amber-400 font-mono mt-2">
                      ⭐ Vật phẩm rơi đặc thù: {affil.specialLoot}
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => handleLaunch(`Truy vết manh mối và tiếp xúc với nhân vật thuộc phe cánh [${affil.name}]!`)}
                    className="w-full py-2 px-3 rounded-xl bg-amber-900/60 hover:bg-amber-800 border border-amber-700/60 text-amber-100 font-serif font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Eye className="w-3.5 h-3.5 text-amber-300" />
                    <span>Thám Thính & Tiếp Xúc Phe Cánh Này</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Hội Mạo Hiểm Giả (Rank F -> S & Bài Sát Hạch) */}
        {activeTab === 'guild_quests' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {/* Active Quest Alert Banner if exists */}
            {character.activeQuest && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950 via-stone-950 to-emerald-950 border-2 border-emerald-500/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-900 text-emerald-200 border border-emerald-700">
                      ỦY THÁC ĐANG TIẾN HÀNH • RANK {character.activeQuest.rank}
                    </span>
                    {character.activeQuest.isExam && (
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-rose-900 text-rose-200 border border-rose-700 animate-pulse">
                        BÀI THI THĂNG HẠNG SINH TỬ
                      </span>
                    )}
                  </div>
                  <h4 className="font-serif font-bold text-sm text-emerald-100 mt-1">
                    {character.activeQuest.title}
                  </h4>
                  <p className="text-xs text-stone-300 mt-1">
                    Mục tiêu: {character.activeQuest.objective} ({character.activeQuest.location})
                  </p>
                  <div className="text-[11px] text-amber-300 font-mono mt-1">
                    Thưởng: +{character.activeQuest.rewardCoins} Xu Asura | +{character.activeQuest.rewardSp} SP | +{character.activeQuest.rewardKp} KP
                  </div>
                </div>

                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => handleLaunch(`Bàn giao ủy thác [${character.activeQuest!.title}] tại Hội Mạo Hiểm Giả và nhận thưởng!`)}
                  className="shrink-0 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-serif font-bold text-xs shadow-md transition cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Bàn Giao & Hoàn Tất Ủy Thác</span>
                </button>
              </div>
            )}

            {/* Guild Info Header */}
            <div className="bg-stone-950/80 p-3.5 rounded-xl border border-stone-800 text-xs sm:text-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <h3 className="font-serif font-bold text-amber-200 flex items-center gap-2">
                  <Scroll className="w-4 h-4 text-amber-400" />
                  Bảng Ủy Thác Hội Mạo Hiểm Giả (Adventurer Guild Board)
                </h3>
                <p className="text-stone-300 text-xs mt-0.5">
                  Phân hạng nghiêm ngặt từ Rank F đến Rank S. Muốn lên hạng phải tích lũy đủ ủy thác và vượt qua bài thi sát hạch sinh tử!
                </p>
              </div>
              <div className="text-right text-xs font-mono text-stone-400">
                Ủy thác đã xong: <strong className="text-emerald-400">{character.completedQuestsCount || 0}</strong>
              </div>
            </div>

            {/* Quests List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {CANON_ADVENTURER_QUESTS.map((quest) => {
                const isCurrentActive = character.activeQuest?.id === quest.id;
                return (
                  <div
                    key={quest.id}
                    className={`p-3.5 rounded-xl bg-stone-950 border transition flex flex-col justify-between gap-2.5 ${
                      isCurrentActive
                        ? 'border-emerald-500 shadow-md ring-1 ring-emerald-500'
                        : quest.isExam
                        ? 'border-rose-800/80 hover:border-rose-600'
                        : 'border-stone-800 hover:border-amber-700/60'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                            quest.rank === 'S' ? 'bg-purple-950 text-purple-200 border-purple-700' :
                            quest.rank === 'A' || quest.rank === 'B' ? 'bg-red-950 text-red-200 border-red-700' :
                            quest.rank === 'C' || quest.rank === 'D' ? 'bg-amber-950 text-amber-200 border-amber-700' :
                            'bg-stone-800 text-stone-300 border-stone-600'
                          }`}>
                            Rank {quest.rank}
                          </span>
                          {quest.isExam && (
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-700 font-bold">
                              SÁT HẠCH LÊN RANK {quest.targetRank}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] font-mono text-amber-400 font-bold">
                          +{quest.rewardCoins} Xu
                        </span>
                      </div>

                      <h4 className="font-serif font-bold text-xs sm:text-sm text-stone-100 mt-1.5">
                        {quest.title}
                      </h4>
                      <div className="text-[11px] text-stone-400 font-mono mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-rose-400" />
                        <span>{quest.location}</span>
                      </div>
                      <p className="text-xs text-stone-300 mt-1 leading-relaxed">{quest.description}</p>
                      <div className="text-[11px] text-stone-300 mt-1 bg-stone-900/80 p-1.5 rounded border border-stone-800/80">
                        🎯 <strong>Mục tiêu:</strong> {quest.objective}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-stone-800 flex items-center justify-between text-[11px] text-stone-400 font-mono">
                      <span>Phần thưởng: +{quest.rewardSp} SP | +{quest.rewardKp} KP</span>
                      <span className={`px-1.5 py-0.2 rounded ${
                        quest.dangerLevel === 'fatal' ? 'text-rose-400' :
                        quest.dangerLevel === 'dangerous' ? 'text-amber-400' : 'text-emerald-400'
                      }`}>
                        Độ nguy hiểm: {quest.dangerLevel}
                      </span>
                    </div>

                    <button
                      type="button"
                      disabled={disabled || isCurrentActive}
                      onClick={() => handleLaunch(`Tiến đến bảng thông báo Hội Mạo Hiểm Giả, nhận ủy thác [${quest.title}] và lên đường thực hiện!`)}
                      className={`w-full py-1.5 px-3 rounded-lg font-serif font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm ${
                        isCurrentActive
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-700 cursor-not-allowed'
                          : quest.isExam
                          ? 'bg-rose-900 hover:bg-rose-800 text-rose-100'
                          : 'bg-amber-800/80 hover:bg-amber-700 text-amber-100'
                      }`}
                    >
                      <Scroll className="w-3.5 h-3.5" />
                      <span>{isCurrentActive ? 'Đang Nhận Ủy Thác Này' : quest.isExam ? 'Bắt Đầu Bài Sát Hạch Sinh Tử' : 'Tiếp Nhận Ủy Thác Này'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 4: Bia Đá Thất Đại Liệt Cường & Boss Thế Giới */}
        {activeTab === 'great_powers' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            
            {/* Warning Rule: Quy Tắc Bất Khả Thi */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-red-950 via-stone-950 to-red-950 border-2 border-red-700 flex items-start gap-3 shadow-lg">
              <AlertTriangle className="w-6 h-6 text-red-400 shrink-0 mt-0.5 animate-pulse" />
              <div className="text-xs sm:text-sm">
                <h4 className="font-serif font-bold text-red-300 uppercase tracking-wide">
                  QUY TẮC BẤT KHẢ THI VỀ THẤT ĐẠI LIỆT CƯỜNG (THE 7 GREAT POWERS)
                </h4>
                <p className="text-stone-300 mt-1 leading-relaxed">
                  Đây <strong>KHÔNG PHẢI</strong> quái vật thông thường để săn cày cấp! 
                  Đụng độ một trong 7 kẻ này khi người chơi chưa đạt ngưỡng <strong>Đế cấp (Emperor) hoặc Thần cấp (God)</strong> đồng nghĩa với 
                  <strong className="text-red-400"> CÁI CHẾT TRONG VÒNG CHƯA ĐẦY 1 GIÂY</strong>! 
                  Chỉ khi đạt đỉnh phong võ học hoặc sở hữu Ma Đạo Khải thần thoại, người chơi mới có tư cách khiêu chiến đoạt vị và khắc tên mình lên bia đá thế giới!
                </p>
              </div>
            </div>

            {/* In-Modal Warning Prompt if user clicked challenge under Emperor tier */}
            {warningPowerRank && (
              <div className="p-4 rounded-xl bg-red-950 border-2 border-red-500 text-xs sm:text-sm space-y-2">
                <div className="flex items-center gap-2 text-red-300 font-bold">
                  <Skull className="w-5 h-5 text-red-400" />
                  <span>CẢNH BÁO TỬ VONG: BẠN CHƯA ĐẠT CẢNH GIỚI ĐẾ CẤP / THẦN CẤP!</span>
                </div>
                <p className="text-stone-200">
                  Thực lực hiện tại của bạn là <strong>{currentTier}</strong>. Khiêu chiến Đệ {warningPowerRank} Cường ngay bây giờ sẽ dẫn đến cái chết tức thì (Instakill) trong chưa đầy 1 giây theo quy tắc bất khả thi!
                </p>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => {
                      setWarningPowerRank(null);
                      handleLaunch(`Bất chấp chênh lệch cảnh giới, liều mạng xông lên khiêu chiến Đệ ${warningPowerRank} Cường trên Bia Đá Thế Giới!`);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-red-700 hover:bg-red-600 text-white font-bold cursor-pointer"
                  >
                    Vẫn Khiêu Chiến (Chấp Nhận Tử Vong)
                  </button>
                  <button
                    onClick={() => setWarningPowerRank(null)}
                    className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 cursor-pointer"
                  >
                    Rút Lui & Tu Luyện Thêm
                  </button>
                </div>
              </div>
            )}

            {/* Seven Great Powers Canon Monument */}
            <div className="space-y-3">
              <div className="flex justify-between items-center border-b border-stone-800 pb-2">
                <h3 className="font-serif font-bold text-amber-200 text-sm sm:text-base flex items-center gap-2">
                  <Crown className="w-4 h-4 text-amber-400" />
                  Bia Đá Thất Đại Liệt Cường (Monument of the Seven Great Powers)
                </h3>
                <span className="text-[11px] text-stone-400 font-mono italic">
                  Khắc bởi Kỹ Thần Laplace trên đỉnh núi phương Bắc
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {monument.powers.map((power) => {
                  const isUsurped = power.usurpedByPlayer;
                  return (
                    <div
                      key={power.rank}
                      className={`p-4 rounded-xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition ${
                        isUsurped
                          ? 'bg-amber-950/40 border-amber-500 shadow-lg ring-1 ring-amber-500/80'
                          : 'bg-stone-950 border-stone-800 hover:border-amber-700/60'
                      }`}
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xl">{power.crestIcon}</span>
                          <span className="font-serif font-bold text-sm sm:text-base text-amber-200">
                            {power.title}: [{power.name}]
                          </span>
                          <span className="text-xs text-stone-400 font-mono">({power.alias})</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-200 border border-purple-800 font-bold">
                            {power.powerTier}
                          </span>
                          {isUsurped && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500 text-stone-950 font-bold">
                              ★ BẠN ĐÃ ĐOẠT VỊ
                            </span>
                          )}
                        </div>

                        <div className="text-[11px] font-mono text-amber-400">
                          Biểu tượng: <strong>{power.symbol}</strong>
                        </div>

                        <p className="text-xs text-stone-300 leading-relaxed">{power.description}</p>

                        <div className="text-[11px] text-stone-400 italic">
                          ⚔️ <strong>Điều kiện khiêu chiến:</strong> {power.defeatConditions}
                        </div>
                      </div>

                      <div className="shrink-0 flex flex-col gap-2 w-full md:w-auto">
                        <button
                          type="button"
                          disabled={disabled || isUsurped}
                          onClick={() => handleChallengePower(power.rank)}
                          className={`px-4 py-2 rounded-xl font-serif font-bold text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-2 ${
                            isUsurped
                              ? 'bg-amber-900 text-amber-200 cursor-not-allowed'
                              : isHighTier
                              ? 'bg-amber-600 hover:bg-amber-500 text-stone-950'
                              : 'bg-stone-800 hover:bg-red-900/60 text-stone-300 border border-stone-700'
                          }`}
                        >
                          <Crown className="w-3.5 h-3.5" />
                          <span>{isUsurped ? 'Đã Nắm Giữ Vị Trí Này' : 'Khiêu Chiến Đoạt Vị'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Boss Thế Giới & Mini Boss Chuẩn Nguyên Tác */}
            <div className="space-y-3 pt-4 border-t border-stone-800">
              <h3 className="font-serif font-bold text-red-300 text-sm sm:text-base flex items-center gap-2">
                <Skull className="w-4 h-4 text-red-400" />
                Hệ Thống Boss & Mini Boss Thế Giới Chuẩn Nguyên Tác
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {CANON_BOSSES.map((boss) => (
                  <div
                    key={boss.id}
                    className="p-4 rounded-xl bg-stone-950 border border-red-900/60 hover:border-red-600 transition flex flex-col justify-between gap-3"
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="font-serif font-bold text-sm text-red-200">{boss.name}</span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-bold ${
                          boss.category === 'world_boss'
                            ? 'bg-red-950 text-red-200 border-red-700 animate-pulse'
                            : 'bg-amber-950 text-amber-200 border-amber-700'
                        }`}>
                          {boss.category === 'world_boss' ? 'BOSS THẾ GIỚI' : 'MINI BOSS VÙNG'}
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-stone-400 mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-rose-400" />
                        <span>{boss.locationName} | Cảnh giới: {boss.tier}</span>
                      </div>
                      <p className="text-xs text-stone-300 mt-2">{boss.description}</p>
                      <div className="text-[11px] text-stone-300 mt-2 bg-stone-900 p-2 rounded-lg border border-stone-800">
                        ⚡ <strong>Cơ chế độc quyền:</strong> {boss.specialMechanic}
                      </div>
                      <div className="text-[11px] text-amber-300 font-mono mt-2">
                        ⭐ Phần thưởng: [Danh hiệu: {boss.rewardTitle}] + {boss.defeatRewardCoins} Xu Asura
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => handleLaunch(`Tiến vào sào huyệt tại ${boss.locationName}, trực diện đối đầu và khiêu chiến ${boss.name}!`)}
                      className="w-full py-2 px-3 rounded-xl bg-red-800 hover:bg-red-700 text-stone-100 font-serif font-bold text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Skull className="w-3.5 h-3.5 text-red-300" />
                      <span>Khiêu Chiến Boss Này</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* Modal Bottom Footer */}
        <div className="p-3 bg-stone-950 border-t border-stone-800 flex justify-between items-center text-xs">
          <span className="text-stone-400 italic text-[11px] hidden sm:inline">
            Tất cả dữ liệu ma thú, nhiệm vụ, boss và Thất Đại Liệt Cường được căn cứ 100% chuẩn xác theo tiểu thuyết Mushoku Tensei.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-serif ml-auto cursor-pointer"
          >
            Đóng Bảng
          </button>
        </div>
      </div>
    </div>
  );
};
