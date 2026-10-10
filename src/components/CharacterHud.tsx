import React, { useState } from 'react';
import type { Character, PowerTier } from '../types/game';
import { 
  Sparkles, 
  Shield, 
  BookOpen, 
  Heart, 
  Zap, 
  Users, 
  MapPin, 
  Clock, 
  Award,
  ChevronRight,
  Flame,
  Droplets,
  Mountain,
  Wind,
  PlusCircle,
  Sword,
  Package,
  Compass,
  Star,
  CheckCircle2,
  Lock,
  Layers,
  Eye,
  FlameKindling
} from 'lucide-react';
import { ensureCharacterProgression, getProgressionSummaryDetails } from '../services/mushokuProgression';
import { CharacterAvatar } from './CharacterAvatar';
import { 
  MAGIC_SKILLS_CATALOG, 
  SWORD_SKILLS_CATALOG, 
  HYBRID_SKILLS_CATALOG, 
  isSkillUnlockedForCharacter 
} from '../services/skillsCatalog';
import { TIER_RANK_MAP } from '../services/mushokuRules';
import { TALENTS_CATALOG } from '../services/mushokuTalents';
import { ensureCharacterReputation } from '../services/mushokuReputation';

interface CharacterHudProps {
  character: Character;
  onOpenInventory?: () => void;
  onOpenSkillTree?: () => void;
}

type HudTab = 'skills' | 'magic' | 'sword' | 'reputation' | 'progression' | 'bonds';

export const CharacterHud: React.FC<CharacterHudProps> = ({ character, onOpenInventory, onOpenSkillTree }) => {
  const [activeTab, setActiveTab] = useState<HudTab>('skills');
  const [skillCategory, setSkillCategory] = useState<'magic' | 'sword' | 'hybrid'>('magic');
  const [selectedElement, setSelectedElement] = useState<'fire' | 'water' | 'earth' | 'wind' | 'healing'>('fire');
  const [selectedSwordStyle, setSelectedSwordStyle] = useState<'swordGod' | 'waterGod' | 'northGod'>('swordGod');

  const isChildhood = character.stats.age < 10;
  const yearsUntilFreeze = 10 - character.stats.age;
  const prog = ensureCharacterProgression(character);
  const rep = ensureCharacterReputation(character);

  // Helper for rank badge colors
  const getRankBadgeColor = (rankStr: string) => {
    if (rankStr.includes('Thần')) return 'bg-amber-400 text-amber-950 border-amber-500 font-extrabold shadow-sm';
    if (rankStr.includes('Đế')) return 'bg-purple-100 text-purple-900 border-purple-400 font-bold';
    if (rankStr.includes('Vương')) return 'bg-rose-100 text-rose-900 border-rose-400 font-bold';
    if (rankStr.includes('Thánh')) return 'bg-yellow-100 text-yellow-900 border-yellow-400 font-semibold';
    if (rankStr.includes('Thượng')) return 'bg-sky-100 text-sky-900 border-sky-400 font-semibold';
    if (rankStr.includes('Trung')) return 'bg-blue-100 text-blue-900 border-blue-400';
    return 'bg-stone-100 text-stone-700 border-stone-300';
  };

  return (
    <aside className="w-full lg:w-88 shrink-0 bg-white/92 border border-amber-300/80 rounded-2xl p-4 shadow-[0_10px_35px_rgba(217,119,6,0.12)] flex flex-col gap-3.5 text-stone-800 font-vietnam text-xs backdrop-blur-xl relative">
      {/* Decorative Runic Corner Embellishments */}
      <div className="absolute -top-1 -left-1 w-3.5 h-3.5 border-t-2 border-l-2 border-amber-500 pointer-events-none" />
      <div className="absolute -top-1 -right-1 w-3.5 h-3.5 border-t-2 border-r-2 border-amber-500 pointer-events-none" />
      <div className="absolute -bottom-1 -left-1 w-3.5 h-3.5 border-b-2 border-l-2 border-amber-500 pointer-events-none" />
      <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 border-b-2 border-r-2 border-amber-500 pointer-events-none" />

      {/* Anime Illustrated Character Portrait & Identity */}
      <CharacterAvatar character={character} onOpenSkillTree={onOpenSkillTree} />

      {/* Temporal & Spatial Coordinates */}
      <div className="grid grid-cols-2 gap-2 text-stone-700 text-[11px]">
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-50/90 border border-amber-200/90 shadow-2xs">
          <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span className="truncate">
            <strong className="text-amber-950 font-mono">{character.stats.age} tuổi</strong> {character.stats.month} tháng
          </span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-50/90 border border-amber-200/90 shadow-2xs truncate" title={character.stats.location}>
          <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
          <span className="truncate text-stone-800 font-medium">{character.stats.location}</span>
        </div>
      </div>

      {/* INNATE TALENT CARD & % SCALING MATRIX BANNER */}
      {(() => {
        const talent = prog.innateTalent;
        const talentDef = TALENTS_CATALOG[talent?.id || talent?.type || 'resilient_body'] || TALENTS_CATALOG.resilient_body;
        const mods = talentDef.modifiers;
        return (
          <div className={`p-3 rounded-2xl border ${talentDef.themeColor.border} ${talentDef.themeColor.bg} ${talentDef.themeColor.glow} transition-all space-y-2 shadow-xs`}>
            <div className="flex items-center justify-between gap-1 flex-wrap">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-lg shrink-0">{talentDef.icon}</span>
                <span className="font-serif font-bold text-xs truncate text-stone-900">
                  {talentDef.name}
                </span>
              </div>
              <span className={`text-[9.5px] font-mono font-bold px-2 py-0.5 rounded-full border shadow-2xs shrink-0 ${talentDef.themeColor.badge}`}>
                {talentDef.tierName} • {talentDef.tierProbability}
              </span>
            </div>

            {/* Quick % Modifier Badges */}
            <div className="flex flex-wrap gap-1 text-[9px] font-mono font-bold">
              {mods.hpMaxPercent !== undefined && (
                <span className={`px-1.5 py-0.5 rounded ${mods.hpMaxPercent > 0 ? 'bg-rose-100 text-rose-800 border border-rose-300' : 'bg-red-100 text-red-900 border border-red-400'}`}>
                  HP: {mods.hpMaxPercent > 0 ? `+${mods.hpMaxPercent}%` : `${mods.hpMaxPercent}%`}
                </span>
              )}
              {mods.mpMaxPercent !== undefined && (
                <span className={`px-1.5 py-0.5 rounded ${mods.mpMaxPercent > 0 ? 'bg-sky-100 text-sky-800 border border-sky-300' : 'bg-red-100 text-red-900 border border-red-400'}`}>
                  MP: {mods.mpMaxPercent > 0 ? `+${mods.mpMaxPercent}%` : `${mods.mpMaxPercent}% (Khóa)`}
                </span>
              )}
              {mods.toukiMaxPercent !== undefined && (
                <span className={`px-1.5 py-0.5 rounded ${mods.toukiMaxPercent > 0 ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-red-100 text-red-900 border border-red-400'}`}>
                  Đấu Khí: {mods.toukiMaxPercent > 0 ? `+${mods.toukiMaxPercent}%` : `${mods.toukiMaxPercent}% (Khóa)`}
                </span>
              )}
              {mods.strPercent !== undefined && (
                <span className="px-1.5 py-0.5 rounded bg-orange-100 text-orange-900 border border-orange-300">
                  STR: +{mods.strPercent}%
                </span>
              )}
              {mods.agiPercent !== undefined && (
                <span className="px-1.5 py-0.5 rounded bg-teal-100 text-teal-900 border border-teal-300">
                  AGI: +{mods.agiPercent}%
                </span>
              )}
              {mods.physicalDamageDealtPercent !== undefined && (
                <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-900 border border-purple-300">
                  Chém: +{mods.physicalDamageDealtPercent}%
                </span>
              )}
              {mods.unarmedDamageDealtPercent !== undefined && (
                <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                  Cận chiến: +{mods.unarmedDamageDealtPercent}%
                </span>
              )}
              {mods.elementalMagicDamagePercent !== undefined && (
                <span className="px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-900 border border-indigo-300">
                  Phép: +{mods.elementalMagicDamagePercent}%
                </span>
              )}
            </div>

            <p className="text-[10px] text-stone-600 line-clamp-2 leading-relaxed">
              {talentDef.description}
            </p>
          </div>
        );
      })()}

      {/* CORE VITALS: HP, MANA, TOUKI, STAMINA */}
      <div className="space-y-2.5 p-3 rounded-2xl bg-gradient-to-b from-stone-50 via-white to-amber-50/30 border border-amber-200/80 shadow-xs">
        {/* Health (HP) */}
        <div>
          <div className="flex justify-between items-center text-[11px] mb-1">
            <span className="text-rose-700 font-bold flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 fill-rose-500/20 text-rose-600" /> Sinh Mệnh (HP)
              {prog.innateTalent?.modifiers?.hpMaxPercent !== undefined && (
                <span className={`text-[9px] font-mono px-1 rounded font-bold ${prog.innateTalent.modifiers.hpMaxPercent > 0 ? 'bg-rose-100 text-rose-800' : 'bg-red-100 text-red-900'}`}>
                  {prog.innateTalent.modifiers.hpMaxPercent > 0 ? `+${prog.innateTalent.modifiers.hpMaxPercent}%` : `${prog.innateTalent.modifiers.hpMaxPercent}%`}
                </span>
              )}
            </span>
            <span className="font-mono font-bold text-rose-900">
              {character.stats.healthCurrent} / {character.stats.healthMax}
              <span className="text-[10px] text-stone-400 font-normal ml-1">
                ({Math.round((character.stats.healthCurrent / Math.max(1, character.stats.healthMax)) * 100)}%)
              </span>
            </span>
          </div>
          <div className={`w-full h-2.5 rounded-full bg-stone-200 overflow-hidden border ${
            character.stats.healthCurrent / Math.max(1, character.stats.healthMax) <= 0.3 
              ? 'border-red-400 shadow-[0_0_10px_rgba(239,68,68,0.5)] animate-pulse' 
              : 'border-rose-200'
          }`}>
            <div 
              className="h-full bg-gradient-to-r from-red-600 via-rose-500 to-amber-400 rounded-full transition-all duration-500 shadow-sm relative overflow-hidden"
              style={{ width: `${Math.min(100, Math.max(0, (character.stats.healthCurrent / Math.max(1, character.stats.healthMax)) * 100))}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent" />
            </div>
          </div>
        </div>

        {/* Mana (MP) */}
        <div>
          <div className="flex justify-between items-center text-[11px] mb-1">
            <span className="text-sky-800 font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 fill-sky-400/20 text-sky-600 animate-pulse" /> Tổng Lượng Mana
              {prog.innateTalent?.modifiers?.mpMaxPercent !== undefined && (
                <span className={`text-[9px] font-mono px-1 rounded font-bold ${prog.innateTalent.modifiers.mpMaxPercent > 0 ? 'bg-sky-100 text-sky-800' : 'bg-red-100 text-red-900'}`}>
                  {prog.innateTalent.modifiers.mpMaxPercent > 0 ? `+${prog.innateTalent.modifiers.mpMaxPercent}%` : `${prog.innateTalent.modifiers.mpMaxPercent}%`}
                </span>
              )}
            </span>
            <span className="font-mono font-bold text-sky-950">
              {character.stats.manaMax <= 0 ? (
                <span className="text-red-700">0 / 0 (Khóa vĩnh viễn)</span>
              ) : (
                <>
                  {character.stats.manaCurrent} / {character.stats.manaMax}
                  <span className="text-[10px] text-stone-400 font-normal ml-1">
                    ({Math.round((character.stats.manaCurrent / character.stats.manaMax) * 100)}%)
                  </span>
                </>
              )}
            </span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-stone-200 overflow-hidden border border-sky-300 shadow-2xs">
            <div 
              className="h-full bg-gradient-to-r from-sky-600 via-cyan-400 to-blue-500 rounded-full transition-all duration-500 shadow-sm relative overflow-hidden"
              style={{ width: `${character.stats.manaMax > 0 ? Math.min(100, Math.max(0, (character.stats.manaCurrent / character.stats.manaMax) * 100)) : 0}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-white/35 to-transparent" />
            </div>
          </div>
        </div>

        {/* Touki (Đấu Khí) */}
        <div>
          <div className="flex justify-between items-center text-[11px] mb-1">
            <span className="text-emerald-800 font-bold flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 fill-emerald-400/20 text-emerald-600" /> Đấu Khí (Touki)
              {prog.innateTalent?.modifiers?.toukiMaxPercent !== undefined && (
                <span className={`text-[9px] font-mono px-1 rounded font-bold ${prog.innateTalent.modifiers.toukiMaxPercent > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-900'}`}>
                  {prog.innateTalent.modifiers.toukiMaxPercent > 0 ? `+${prog.innateTalent.modifiers.toukiMaxPercent}%` : `${prog.innateTalent.modifiers.toukiMaxPercent}%`}
                </span>
              )}
            </span>
            <span className="font-mono font-bold text-emerald-950">
              {prog.innateTalent?.modifiers?.lockTouki || (character.stats.toukiMax === 0) ? (
                <span className="text-red-700">0 / 0 (Khóa vĩnh viễn)</span>
              ) : (
                <>
                  {character.stats.touki} / {character.stats.toukiMax ?? 100}
                  {(character.stats.toukiMax ?? 100) > 0 && (
                    <span className="text-[10px] text-stone-400 font-normal ml-1">
                      ({Math.round((character.stats.touki / (character.stats.toukiMax ?? 100)) * 100)}%)
                    </span>
                  )}
                </>
              )}
            </span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-stone-200 overflow-hidden border border-emerald-300 shadow-2xs">
            <div 
              className="h-full bg-gradient-to-r from-emerald-600 via-teal-400 to-amber-400 rounded-full transition-all duration-500 shadow-sm relative overflow-hidden"
              style={{ 
                width: `${(character.stats.toukiMax ?? 100) > 0 
                  ? Math.min(100, Math.max(0, (character.stats.touki / (character.stats.toukiMax ?? 100)) * 100)) 
                  : 0}%` 
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent" />
            </div>
          </div>
        </div>

        {/* Stamina & Fatigue */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="px-2 py-1.5 rounded-lg bg-amber-50/80 border border-amber-200">
            <div className="text-[10px] text-amber-800 font-bold flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-600" /> Thể Lực (STA)
            </div>
            <div className="font-mono font-bold text-amber-950 text-xs mt-0.5">
              {character.stats.staminaCurrent} / {character.stats.staminaMax}
            </div>
          </div>

          <div className="px-2 py-1.5 rounded-lg bg-white border border-stone-200">
            <div className="text-[10px] text-stone-600 font-bold flex items-center justify-between">
              <span>Mệt Mỏi:</span>
              <span className={`font-mono ${(character.stats.fatigue || 0) > 60 ? 'text-red-600' : 'text-emerald-700'}`}>
                {character.stats.fatigue || 0}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden mt-1">
              <div 
                className={`h-full rounded-full ${(character.stats.fatigue || 0) > 60 ? 'bg-red-500' : 'bg-emerald-500'}`}
                style={{ width: `${Math.min(100, character.stats.fatigue || 0)}%` }}
              />
            </div>
          </div>
        </div>

        {/* 4 Quick Core Stats: Coins, STR, AGI, Mana Control */}
        <div className="grid grid-cols-4 gap-1 pt-0.5">
          <div className="flex flex-col items-center justify-center p-1 rounded-lg bg-amber-100/70 border border-amber-300 text-[10px]">
            <span className="text-amber-900 font-semibold text-[8.5px]">🪙 Xu</span>
            <strong className="text-amber-950 font-mono text-xs">{character.stats.asuraCoins || 0}</strong>
          </div>
          <div className="flex flex-col items-center justify-center p-1 rounded-lg bg-orange-100/70 border border-orange-300 text-[10px]" title="Sức mạnh cơ bắp & lực chém">
            <span className="text-orange-950 font-semibold text-[8.5px] flex items-center gap-0.5">
              🗡️ STR
              {prog.innateTalent?.modifiers?.strPercent !== undefined && (
                <span className="text-[7.5px] text-orange-700 font-mono font-bold">+{prog.innateTalent.modifiers.strPercent}%</span>
              )}
            </span>
            <strong className="text-orange-950 font-mono text-xs">{character.stats.strength || 20}</strong>
          </div>
          <div className="flex flex-col items-center justify-center p-1 rounded-lg bg-emerald-100/70 border border-emerald-300 text-[10px]" title="Sự nhanh nhẹn và phản xạ né đòn">
            <span className="text-emerald-950 font-semibold text-[8.5px] flex items-center gap-0.5">
              ⚡ AGI
              {prog.innateTalent?.modifiers?.agiPercent !== undefined && (
                <span className="text-[7.5px] text-emerald-700 font-mono font-bold">+{prog.innateTalent.modifiers.agiPercent}%</span>
              )}
            </span>
            <strong className="text-emerald-950 font-mono text-xs">{character.stats.agility || 15}</strong>
          </div>
          <div className="flex flex-col items-center justify-center p-1 rounded-lg bg-sky-100/70 border border-sky-300 text-[10px]" title="Kiểm soát Mana">
            <span className="text-sky-900 font-semibold text-[8.5px]">Kiểm soát</span>
            <strong className="text-sky-950 font-mono text-xs">{character.stats.manaControl || 0}</strong>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* [ DANH TIẾNG & DANH XƯNG ] STATUS HUD CARD */}
      {/* ==================================================================== */}
      <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-50/95 via-stone-50/90 to-amber-100/60 border border-amber-300/80 shadow-xs space-y-2">
        <div className="flex items-center justify-between border-b border-amber-200/70 pb-1.5">
          <div className="flex items-center gap-1.5 font-cinzel font-bold text-amber-950 text-xs">
            <Award className="w-4 h-4 text-amber-600" />
            <span>[ DANH TIẾNG &amp; DANH XƯNG ]</span>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('reputation')}
            className={`text-[9.5px] font-mono font-bold px-2 py-0.5 rounded-full border shadow-2xs cursor-pointer transition hover:scale-105 ${getRankBadgeColor(rep.adventurerRank)}`}
            title="Nhấn để xem chi tiết 4 vùng danh tiếng"
          >
            Hạng [{rep.adventurerRank}] ▾
          </button>
        </div>

        <div className="space-y-1.5 text-[11px]">
          {/* Biệt danh hiện tại */}
          <div className="flex items-start justify-between gap-1.5">
            <span className="text-stone-600 font-medium shrink-0">Biệt danh hiện tại:</span>
            <div className="text-right min-w-0">
              <span className="font-serif font-black text-amber-900 bg-amber-100/90 px-2 py-0.5 rounded border border-amber-300 text-xs shadow-2xs inline-block truncate max-w-full">
                "{rep.currentEpithet}"
              </span>
              <div className="text-[10px] text-stone-500 italic mt-0.5 max-w-[200px] text-right truncate" title={rep.epithetDescription}>
                {rep.epithetDescription || 'Chưa định hình'}
              </div>
            </div>
          </div>

          {/* Xếp hạng Công hội */}
          <div className="flex items-center justify-between">
            <span className="text-stone-600 font-medium">Xếp hạng Công hội:</span>
            <span className="font-mono font-bold text-amber-950">
              [Hạng {rep.adventurerRank}] <span className="text-[10px] text-stone-500 font-normal">(Thẻ Phiêu Lưu Giả)</span>
            </span>
          </div>

          {/* Vị thế xã hội */}
          <div className="flex items-center justify-between gap-1">
            <span className="text-stone-600 font-medium shrink-0">Vị thế xã hội:</span>
            <span className="font-semibold text-stone-800 text-right truncate text-[10.5px]" title={rep.socialStanding}>
              {rep.socialStanding}
            </span>
          </div>
        </div>

        {/* 4 Regional Reputation Mini Indicators */}
        <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-amber-200/50 text-[10px] font-mono">
          <div className="flex items-center justify-between px-2 py-1 bg-white/70 rounded-lg border border-stone-200/70" title="Công hội Phiêu lưu giả (-100 đến +100)">
            <span className="text-stone-600 flex items-center gap-1">🛡️ Công hội:</span>
            <strong className={rep.regional.adventurerGuild >= 0 ? 'text-amber-800' : 'text-red-700'}>
              {rep.regional.adventurerGuild > 0 ? `+${rep.regional.adventurerGuild}` : rep.regional.adventurerGuild}
            </strong>
          </div>
          <div className="flex items-center justify-between px-2 py-1 bg-white/70 rounded-lg border border-stone-200/70" title="Giới Quý tộc Asura (-100 đến +100)">
            <span className="text-stone-600 flex items-center gap-1">👑 Quý tộc:</span>
            <strong className={rep.regional.asuraNobility >= 0 ? 'text-purple-800' : 'text-red-700'}>
              {rep.regional.asuraNobility > 0 ? `+${rep.regional.asuraNobility}` : rep.regional.asuraNobility}
            </strong>
          </div>
          <div className="flex items-center justify-between px-2 py-1 bg-white/70 rounded-lg border border-stone-200/70" title="Đại lục Ma giới (-100 đến +100)">
            <span className="text-stone-600 flex items-center gap-1">👹 Ma giới:</span>
            <strong className={rep.regional.demonContinent >= 0 ? 'text-emerald-800' : 'text-red-700'}>
              {rep.regional.demonContinent > 0 ? `+${rep.regional.demonContinent}` : rep.regional.demonContinent}
            </strong>
          </div>
          <div className="flex items-center justify-between px-2 py-1 bg-white/70 rounded-lg border border-stone-200/70" title="Giáo hội Millis (-100 đến +100)">
            <span className="text-stone-600 flex items-center gap-1">⛪ Giáo hội:</span>
            <strong className={rep.regional.millisChurch >= 0 ? 'text-sky-800' : 'text-red-700'}>
              {rep.regional.millisChurch > 0 ? `+${rep.regional.millisChurch}` : rep.regional.millisChurch}
            </strong>
          </div>
        </div>
      </div>

      {/* LOGICAL INFORMATION TABS */}
      <div className="flex items-center p-1 rounded-xl bg-stone-100 border border-stone-200 gap-1 text-[11px] font-bold">
        <button
          type="button"
          onClick={() => setActiveTab('skills')}
          className={`flex-1 py-1.5 rounded-lg transition cursor-pointer flex items-center justify-center gap-1 ${
            activeTab === 'skills'
              ? 'bg-amber-100 text-amber-950 border border-amber-300 shadow-sm'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-amber-600" />
          <span>Kỹ Năng</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('magic')}
          className={`flex-1 py-1.5 rounded-lg transition cursor-pointer flex items-center justify-center gap-1 ${
            activeTab === 'magic'
              ? 'bg-sky-100 text-sky-950 border border-sky-300 shadow-sm'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-sky-600" />
          <span>Thuộc Tính</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reputation')}
          className={`flex-1 py-1.5 rounded-lg transition cursor-pointer flex items-center justify-center gap-1 ${
            activeTab === 'reputation'
              ? 'bg-indigo-100 text-indigo-950 border border-indigo-300 shadow-sm'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Award className="w-3.5 h-3.5 text-indigo-600" />
          <span>Danh Tiếng</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('progression')}
          className={`flex-1 py-1.5 rounded-lg transition cursor-pointer flex items-center justify-center gap-1 ${
            activeTab === 'progression'
              ? 'bg-purple-100 text-purple-950 border border-purple-300 shadow-sm'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Star className="w-3.5 h-3.5 text-purple-600" />
          <span>Tiến Trình</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('bonds')}
          className={`flex-1 py-1.5 rounded-lg transition cursor-pointer flex items-center justify-center gap-1 ${
            activeTab === 'bonds'
              ? 'bg-rose-100 text-rose-950 border border-rose-300 shadow-sm'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-rose-600" />
          <span>Quan Hệ</span>
        </button>
      </div>

      {/* TAB CONTENT */}
      <div className="min-h-[175px] flex flex-col justify-between">
        {/* TAB: SKILLS */}
        {activeTab === 'skills' && (
          <div className="space-y-2.5 animate-turn-in text-[11px]">
            {/* Sub-Tabs: Ma Pháp, Kiếm Pháp, Ma Kiếm & Dị Chiêu */}
            <div className="flex items-center p-1 rounded-xl bg-stone-100/90 border border-stone-200 gap-1 font-bold text-[10px]">
              <button
                type="button"
                onClick={() => setSkillCategory('magic')}
                className={`flex-1 py-1 rounded-lg transition cursor-pointer flex items-center justify-center gap-1 ${
                  skillCategory === 'magic'
                    ? 'bg-sky-600 text-white shadow-xs font-bold'
                    : 'text-stone-700 hover:bg-stone-200/60'
                }`}
              >
                <Sparkles className="w-3 h-3" />
                <span>🔮 Ma Pháp</span>
              </button>

              <button
                type="button"
                onClick={() => setSkillCategory('sword')}
                className={`flex-1 py-1 rounded-lg transition cursor-pointer flex items-center justify-center gap-1 ${
                  skillCategory === 'sword'
                    ? 'bg-amber-600 text-white shadow-xs font-bold'
                    : 'text-stone-700 hover:bg-stone-200/60'
                }`}
              >
                <Sword className="w-3 h-3" />
                <span>🗡️ Kiếm Pháp</span>
              </button>

              <button
                type="button"
                onClick={() => setSkillCategory('hybrid')}
                className={`flex-1 py-1 rounded-lg transition cursor-pointer flex items-center justify-center gap-1 ${
                  skillCategory === 'hybrid'
                    ? 'bg-purple-600 text-white shadow-xs font-bold'
                    : 'text-stone-700 hover:bg-stone-200/60'
                }`}
              >
                <Layers className="w-3 h-3" />
                <span>🌟 Dị Chiêu</span>
              </button>
            </div>

            {/* If Magic: Element Selectors */}
            {skillCategory === 'magic' && (
              <div className="space-y-2">
                <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none text-[10px]">
                  {[
                    { key: 'fire', label: '🔥 Hỏa', tier: character.magic.fire },
                    { key: 'water', label: '💧 Thủy', tier: character.magic.water },
                    { key: 'earth', label: '⛰️ Thổ', tier: character.magic.earth },
                    { key: 'wind', label: '🌪️ Phong', tier: character.magic.wind },
                    { key: 'healing', label: '💖 Trị Liệu', tier: character.magic.healing },
                  ].map((el) => {
                    const isSelected = selectedElement === el.key;
                    const rankName = el.tier.split(' ')[0];
                    return (
                      <button
                        key={el.key}
                        type="button"
                        onClick={() => setSelectedElement(el.key as any)}
                        className={`px-2 py-1 rounded-lg border transition whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                          isSelected
                            ? 'bg-sky-100 text-sky-950 border-sky-400 font-bold shadow-2xs'
                            : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                        }`}
                      >
                        <span>{el.label}</span>
                        <span className="text-[9px] px-1 py-0.2 rounded bg-stone-100 border border-stone-300 font-mono">
                          {rankName}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Header Banner for Selected Element */}
                {(() => {
                  const currentTier = (character.magic as any)[selectedElement] || 'Chưa học';
                  const currentRank = TIER_RANK_MAP[currentTier as PowerTier] || 0;
                  const skills = MAGIC_SKILLS_CATALOG[selectedElement] || [];

                  return (
                    <div className="space-y-2">
                      <div className="p-2 rounded-xl bg-sky-50/90 border border-sky-200 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-sky-950 text-xs flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                            {selectedElement === 'fire' ? 'Hỏa Ma Pháp' : selectedElement === 'water' ? 'Thủy Ma Pháp' : selectedElement === 'earth' ? 'Thổ Ma Pháp' : selectedElement === 'wind' ? 'Phong Ma Pháp' : 'Ma Pháp Trị Liệu'}
                          </div>
                          <div className="text-[10px] text-sky-800">
                            Cảnh giới hiện tại: <strong className="font-mono">{currentTier}</strong>
                          </div>
                        </div>
                        {onOpenSkillTree && (
                          <button
                            type="button"
                            onClick={onOpenSkillTree}
                            className="px-2 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-[10px] font-bold shadow-2xs transition cursor-pointer"
                          >
                            Đột Phá (SP: {prog.skillPoints})
                          </button>
                        )}
                      </div>

                      {/* 7 CẤP BẬC KỸ NĂNG CÓ THỂ HỌC */}
                      <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-0.5">
                        {skills.map((skill) => {
                          const isLearned = currentRank >= skill.tier;
                          return (
                            <div
                              key={skill.id}
                              className={`p-2 rounded-xl border transition ${
                                isLearned
                                  ? 'bg-emerald-50/70 border-emerald-300 shadow-2xs'
                                  : 'bg-stone-50/80 border-stone-200 opacity-80'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-1 mb-1">
                                <div className="font-bold text-stone-900 text-[11px] flex items-center gap-1">
                                  {isLearned ? (
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                  ) : (
                                    <Lock className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                                  )}
                                  <span className={isLearned ? 'text-emerald-950 font-bold' : 'text-stone-700'}>
                                    [{skill.tierName.split(' ')[0]}] {skill.name}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 shrink-0 font-mono text-[9px]">
                                  <span className="px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 border border-sky-300 font-bold">
                                    {skill.costMp} MP
                                  </span>
                                  {isLearned ? (
                                    <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold">
                                      ĐÃ HỌC
                                    </span>
                                  ) : (
                                    <span className="px-1.5 py-0.5 rounded bg-stone-200 text-stone-600 border border-stone-300">
                                      CHƯA ĐẠT
                                    </span>
                                  )}
                                </div>
                              </div>

                              <p className="text-[10px] text-stone-600 leading-relaxed">
                                {skill.description}
                              </p>

                              <div className="mt-1 flex items-center justify-between text-[9px] pt-1 border-t border-stone-200/60 text-stone-500">
                                <span>Ước tính: <strong className="text-amber-800">{skill.damageEstimate}</strong></span>
                                {isLearned ? (
                                  <span className="text-emerald-700 font-semibold">⚡ Sẵn sàng thi triển khi chiến đấu</span>
                                ) : (
                                  <span className="text-stone-500 italic">Đột phá nhánh kĩ năng lên {skill.tierName.split(' ')[0]} để mở khóa</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* If Sword: School Selectors */}
            {skillCategory === 'sword' && (
              <div className="space-y-2">
                <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none text-[10px]">
                  {[
                    { key: 'swordGod', label: '⚔️ Kiếm Thần', tier: character.swordsmanship.swordGod },
                    { key: 'waterGod', label: '🛡️ Thủy Thần', tier: character.swordsmanship.waterGod },
                    { key: 'northGod', label: '🧭 Bắc Thần', tier: character.swordsmanship.northGod },
                  ].map((s) => {
                    const isSelected = selectedSwordStyle === s.key;
                    const rankName = s.tier.split(' ')[0];
                    return (
                      <button
                        key={s.key}
                        type="button"
                        onClick={() => setSelectedSwordStyle(s.key as any)}
                        className={`px-2 py-1 rounded-lg border transition whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                          isSelected
                            ? 'bg-amber-100 text-amber-950 border-amber-400 font-bold shadow-2xs'
                            : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                        }`}
                      >
                        <span>{s.label}</span>
                        <span className="text-[9px] px-1 py-0.2 rounded bg-stone-100 border border-stone-300 font-mono">
                          {rankName}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Header Banner for Selected School */}
                {(() => {
                  const currentTier = (character.swordsmanship as any)[selectedSwordStyle] || 'Chưa học';
                  const currentRank = TIER_RANK_MAP[currentTier as PowerTier] || 0;
                  const skills = SWORD_SKILLS_CATALOG[selectedSwordStyle] || [];

                  return (
                    <div className="space-y-2">
                      <div className="p-2 rounded-xl bg-amber-50/90 border border-amber-200 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-amber-950 text-xs flex items-center gap-1">
                            <Sword className="w-3.5 h-3.5 text-amber-600" />
                            {selectedSwordStyle === 'swordGod' ? 'Kiếm Thần Phái' : selectedSwordStyle === 'waterGod' ? 'Thủy Thần Phái' : 'Bắc Thần Phái'}
                          </div>
                          <div className="text-[10px] text-amber-800">
                            Cảnh giới hiện tại: <strong className="font-mono">{currentTier}</strong>
                          </div>
                        </div>
                        {onOpenSkillTree && (
                          <button
                            type="button"
                            onClick={onOpenSkillTree}
                            className="px-2 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-[10px] font-bold shadow-2xs transition cursor-pointer"
                          >
                            Đột Phá (SP: {prog.skillPoints})
                          </button>
                        )}
                      </div>

                      {/* 7 CẤP BẬC CHIÊU THỨC KIẾM PHÁP */}
                      <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-0.5">
                        {skills.map((skill) => {
                          const isLearned = currentRank >= skill.tier;
                          return (
                            <div
                              key={skill.id}
                              className={`p-2 rounded-xl border transition ${
                                isLearned
                                  ? 'bg-amber-50/70 border-amber-300 shadow-2xs'
                                  : 'bg-stone-50/80 border-stone-200 opacity-80'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-1 mb-1">
                                <div className="font-bold text-stone-900 text-[11px] flex items-center gap-1">
                                  {isLearned ? (
                                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                  ) : (
                                    <Lock className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                                  )}
                                  <span className={isLearned ? 'text-amber-950 font-bold' : 'text-stone-700'}>
                                    [{skill.tierName.split(' ')[0]}] {skill.name}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 shrink-0 font-mono text-[9px]">
                                  <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 font-bold">
                                    {skill.costStamina} STA{skill.costTouki ? ` + ${skill.costTouki} ĐK` : ''}
                                  </span>
                                  {isLearned ? (
                                    <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold">
                                      ĐÃ HỌC
                                    </span>
                                  ) : (
                                    <span className="px-1.5 py-0.5 rounded bg-stone-200 text-stone-600 border border-stone-300">
                                      CHƯA ĐẠT
                                    </span>
                                  )}
                                </div>
                              </div>

                              <p className="text-[10px] text-stone-600 leading-relaxed">
                                {skill.description}
                              </p>

                              <div className="mt-1 flex items-center justify-between text-[9px] pt-1 border-t border-stone-200/60 text-stone-500">
                                <span>Ước tính: <strong className="text-amber-800">{skill.damageEstimate}</strong></span>
                                {isLearned ? (
                                  <span className="text-emerald-700 font-semibold">⚔️ Sẵn sàng xuất chiêu khi chiến đấu</span>
                                ) : (
                                  <span className="text-stone-500 italic">Đột phá nhánh kĩ năng lên {skill.tierName.split(' ')[0]} để mở khóa</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* If Hybrid: Hybrid & Special Skills */}
            {skillCategory === 'hybrid' && (
              <div className="space-y-1.5 max-h-[320px] overflow-y-auto pr-0.5">
                {HYBRID_SKILLS_CATALOG.map((skill) => {
                  const isUnlocked = isSkillUnlockedForCharacter(character, skill);
                  return (
                    <div
                      key={skill.id}
                      className={`p-2.5 rounded-xl border transition ${
                        isUnlocked
                          ? 'bg-purple-50/70 border-purple-300 shadow-2xs'
                          : 'bg-stone-50/80 border-stone-200 opacity-80'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <div className="font-bold text-stone-900 text-[11px] flex items-center gap-1">
                          {isUnlocked ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                          ) : (
                            <Lock className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                          )}
                          <span className={isUnlocked ? 'text-purple-950 font-bold' : 'text-stone-700'}>
                            [{skill.subCategory}] {skill.name}
                          </span>
                        </div>
                        {isUnlocked ? (
                          <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-900 border border-purple-300 text-[9px] font-bold">
                            ĐÃ MỞ
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded bg-stone-200 text-stone-600 border border-stone-300 text-[9px]">
                            CHƯA MỞ
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-stone-600 leading-relaxed">{skill.description}</p>
                      {skill.effectHint && (
                        <p className="text-[9px] text-purple-800 mt-1 italic">
                          Hiệu ứng: {skill.effectHint}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB: MAGIC */}
        {activeTab === 'magic' && (
          <div className="space-y-2 animate-turn-in">
            {/* Chantless Feature */}
            <div className="p-2 rounded-xl bg-sky-50/80 border border-sky-200 flex items-center justify-between">
              <span className="font-bold text-sky-900 text-[11px] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                Thi Triển Vô Niệm Chú:
              </span>
              {character.magic.chantless ? (
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold">
                  ĐÃ GIÁC NGỘ
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded bg-white text-stone-700 border border-stone-300 text-[10px] font-mono">
                  {character.magic.chantlessProgress || 0}% Bình cảnh
                </span>
              )}
            </div>

            {/* Elements Grid */}
            <div className="grid grid-cols-2 gap-1.5">
              <div className="p-2 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-between">
                <span className="flex items-center gap-1 text-blue-800 font-bold">
                  <Droplets className="w-3.5 h-3.5 text-blue-600" /> Thủy:
                </span>
                <span className="text-stone-900 font-mono font-medium">{character.magic.water.split(' ')[0]}</span>
              </div>

              <div className="p-2 rounded-lg bg-red-50 border border-red-200 flex items-center justify-between">
                <span className="flex items-center gap-1 text-red-800 font-bold">
                  <Flame className="w-3.5 h-3.5 text-red-600" /> Hỏa:
                </span>
                <span className="text-stone-900 font-mono font-medium">{character.magic.fire.split(' ')[0]}</span>
              </div>

              <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-between">
                <span className="flex items-center gap-1 text-amber-800 font-bold">
                  <Mountain className="w-3.5 h-3.5 text-amber-600" /> Thổ:
                </span>
                <span className="text-stone-900 font-mono font-medium">{character.magic.earth.split(' ')[0]}</span>
              </div>

              <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <span className="flex items-center gap-1 text-emerald-800 font-bold">
                  <Wind className="w-3.5 h-3.5 text-emerald-600" /> Phong:
                </span>
                <span className="text-stone-900 font-mono font-medium">{character.magic.wind.split(' ')[0]}</span>
              </div>

              <div className="p-2 rounded-lg bg-pink-50 border border-pink-200 flex items-center justify-between col-span-2">
                <span className="flex items-center gap-1 text-pink-800 font-bold">
                  <PlusCircle className="w-3.5 h-3.5 text-pink-600" /> Trị Liệu / Giải Độc:
                </span>
                <span className="text-stone-900 font-mono font-medium">
                  {character.magic.healing.split(' ')[0]} / {character.magic.detox?.split(' ')[0] || 'Sơ cấp'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TAB: SWORDSMANSHIP */}
        {activeTab === 'sword' && (
          <div className="space-y-2 animate-turn-in">
            <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200 space-y-1.5">
              <div className="flex items-center justify-between border-b border-amber-200 pb-1">
                <span className="font-bold text-amber-900 flex items-center gap-1.5">
                  <Sword className="w-3.5 h-3.5 text-amber-600" /> Kiếm Thần Phái (Sword God)
                </span>
                <span className="font-mono font-bold text-amber-950">{character.swordsmanship.swordGod}</span>
              </div>
              <p className="text-[10px] text-stone-600 italic">Trường phái tốc độ tối thượng, chém đứt sinh mệnh trong chớp mắt.</p>
            </div>

            <div className="p-2.5 rounded-xl bg-blue-50/80 border border-blue-200 space-y-1.5">
              <div className="flex items-center justify-between border-b border-blue-200 pb-1">
                <span className="font-bold text-blue-900 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-blue-600" /> Thủy Thần Phái (Water God)
                </span>
                <span className="font-mono font-bold text-blue-950">{character.swordsmanship.waterGod}</span>
              </div>
              <p className="text-[10px] text-stone-600 italic">Phòng thủ phản đòn tuyệt đối, hóa giải mọi sát ý cận chiến.</p>
            </div>

            <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200 space-y-1.5">
              <div className="flex items-center justify-between border-b border-emerald-200 pb-1">
                <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-emerald-600" /> Bắc Thần Phái (North God)
                </span>
                <span className="font-mono font-bold text-emerald-950">{character.swordsmanship.northGod}</span>
              </div>
              <p className="text-[10px] text-stone-600 italic">Chiến thuật linh hoạt, thích ứng địa hình và tận dụng mọi sơ hở.</p>
            </div>
          </div>
        )}

        {/* TAB: PROGRESSION */}
        {activeTab === 'progression' && (() => {
          const details = getProgressionSummaryDetails(character);
          return (
            <div className="space-y-2.5 animate-turn-in text-[11px]">
              {/* Header Box: BẢNG TIẾN TRÌNH & ĐỘT PHÁ CẤP BẬC */}
              <div className="p-3 rounded-xl bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 border border-amber-500/40 space-y-2 shadow-xs text-stone-100">
                <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                  <span className="font-bold text-amber-300 font-cinzel text-xs flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" /> BẢNG TIẾN TRÌNH &amp; ĐỘT PHÁ
                  </span>
                  <span className="font-mono font-bold px-2 py-0.5 rounded bg-blue-900/60 text-blue-200 text-[10px] border border-blue-400/40">
                    RANK: {details.overallRank.split(' ')[0]}
                  </span>
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-base">{details.innateTalentIcon || '🌟'}</span>
                    <span className="font-bold text-stone-100 font-cinzel text-xs">[{details.innateTalentName}]</span>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/50 text-amber-300 font-mono font-bold">
                      {details.innateTalentTier || 'Phàm nhân'} • {details.innateTalentProbability || '50%'}
                    </span>
                  </div>
                  {/* Effects tags */}
                  {details.innateTalentEffects && details.innateTalentEffects.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {details.innateTalentEffects.slice(0, 3).map((eff, i) => (
                        <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-black/40 border border-white/10 text-stone-300">
                          {eff}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* SP & KP Counters */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-300 text-center shadow-xs">
                  <div className="text-[10px] text-purple-800 font-bold uppercase tracking-wider">Kỹ Năng (SP)</div>
                  <div className="text-base font-cinzel font-bold text-purple-950 mt-0.5">{details.skillPoints}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-300 text-center shadow-xs">
                  <div className="text-[10px] text-indigo-800 font-bold uppercase tracking-wider">Tri Thức (KP)</div>
                  <div className="text-base font-cinzel font-bold text-indigo-950 mt-0.5">{details.knowledgePoints}</div>
                </div>
              </div>

              {/* 6 NHÁNH KỸ NĂNG ĐA DIỆN */}
              <div className="p-2.5 rounded-xl bg-white border border-stone-200 space-y-2">
                <div className="flex items-center justify-between border-b border-stone-100 pb-1">
                  <span className="text-[10px] font-bold text-stone-800 uppercase tracking-wider">
                    6 Nhánh Kỹ Năng Đa Diện:
                  </span>
                  <span className="text-[10px] font-mono text-amber-700 font-bold">6/6 Nhánh Hoạt Động</span>
                </div>

                {/* Nhánh 1 */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-stone-800 font-semibold">1. Tứ Đại Nguyên Tố:</span>
                    <span className="font-mono text-blue-700 font-bold">{details.topMagic.tier.split(' ')[0]}</span>
                  </div>
                  <div className="text-[9px] text-stone-600 flex flex-wrap gap-1">
                    <span className="px-1 py-0.5 rounded bg-blue-50 border border-blue-200">Thủy: {details.branch1.water.split(' ')[0]}</span>
                    <span className="px-1 py-0.5 rounded bg-rose-50 border border-rose-200">Hỏa: {details.branch1.fire.split(' ')[0]}</span>
                    <span className="px-1 py-0.5 rounded bg-amber-50 border border-amber-200">Thổ: {details.branch1.earth.split(' ')[0]}</span>
                    <span className="px-1 py-0.5 rounded bg-emerald-50 border border-emerald-200">Phong: {details.branch1.wind.split(' ')[0]}</span>
                  </div>
                </div>

                {/* Nhánh 2 */}
                <div className="space-y-1 pt-1 border-t border-stone-100">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-stone-800 font-semibold">2. Thần Thánh &amp; Kết Giới:</span>
                    <span className="font-mono text-cyan-700 font-bold">{details.branch2.healing.split(' ')[0]}</span>
                  </div>
                  <div className="text-[9px] text-stone-600 flex flex-wrap gap-1">
                    <span className="px-1 py-0.5 rounded bg-cyan-50 border border-cyan-200">Trị liệu: {details.branch2.healing.split(' ')[0]}</span>
                    <span className="px-1 py-0.5 rounded bg-cyan-50 border border-cyan-200">Giải độc: {details.branch2.detox.split(' ')[0]}</span>
                    <span className="px-1 py-0.5 rounded bg-cyan-50 border border-cyan-200">Kết giới: {details.branch2.barrier.split(' ')[0]}</span>
                  </div>
                </div>

                {/* Nhánh 3 */}
                <div className="space-y-1 pt-1 border-t border-stone-100">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-stone-800 font-semibold">3. Tam Đại Kiếm Phái:</span>
                    <span className="font-mono text-red-700 font-bold">{details.topSword.tier.split(' ')[0]}</span>
                  </div>
                  <div className="text-[9px] text-stone-600 flex flex-wrap gap-1">
                    <span className="px-1 py-0.5 rounded bg-red-50 border border-red-200">Kiếm Thần: {details.branch3.swordGod.split(' ')[0]}</span>
                    <span className="px-1 py-0.5 rounded bg-blue-50 border border-blue-200">Thủy Thần: {details.branch3.waterGod.split(' ')[0]}</span>
                    <span className="px-1 py-0.5 rounded bg-emerald-50 border border-emerald-200">Bắc Thần: {details.branch3.northGod.split(' ')[0]}</span>
                  </div>
                </div>

                {/* Nhánh 4 */}
                <div className="space-y-1 pt-1 border-t border-stone-100">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-stone-800 font-semibold">4. Trận Pháp &amp; Ma Cụ:</span>
                    <span className="font-mono text-emerald-700 font-bold">{details.branch4.artifactCrafting.split(' ')[0]}</span>
                  </div>
                  <div className="text-[9px] text-stone-600 flex flex-wrap gap-1">
                    <span className="px-1 py-0.5 rounded bg-emerald-50 border border-emerald-200">Trận pháp: {details.branch4.formations.split(' ')[0]}</span>
                    <span className="px-1 py-0.5 rounded bg-emerald-50 border border-emerald-200">Luyện kim: {details.branch4.artifactCrafting.split(' ')[0]}</span>
                    <span className="px-1 py-0.5 rounded bg-emerald-50 border border-emerald-200">Triệu hồi: {details.branch4.summoningContracts.split(' ')[0]}</span>
                  </div>
                </div>

                {/* Nhánh 5 */}
                <div className="space-y-1 pt-1 border-t border-stone-100">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-stone-800 font-semibold">5. Ma Kiếm Sĩ &amp; Đấu Khí:</span>
                    <span className="font-mono text-purple-700 font-bold">{details.branch5.toukiSurge.split(' ')[0]}</span>
                  </div>
                  <div className="text-[9px] text-stone-600 flex flex-wrap gap-1">
                    <span className="px-1 py-0.5 rounded bg-purple-50 border border-purple-200">Ma đao: {details.branch5.elementalCoating.split(' ')[0]}</span>
                    <span className="px-1 py-0.5 rounded bg-purple-50 border border-purple-200">Bạo phát: {details.branch5.toukiSurge.split(' ')[0]}</span>
                    <span className="px-1 py-0.5 rounded bg-purple-50 border border-purple-200">Thú tộc: {details.branch5.beastMartial.split(' ')[0]}</span>
                  </div>
                </div>

                {/* Nhánh 6 */}
                <div className="space-y-1 pt-1 border-t border-stone-100">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-stone-800 font-semibold">6. Ma Nhãn Huyền Bí:</span>
                    <span className="font-mono text-indigo-700 font-bold">{details.branch6.activeCount}/4 Mắt</span>
                  </div>
                  <div className="text-[9px] text-stone-600 flex flex-wrap gap-1">
                    <span className={`px-1 py-0.5 rounded border ${details.branch6.foresightEye ? 'bg-indigo-100 text-indigo-900 border-indigo-300 font-bold' : 'bg-stone-50 text-stone-400 border-stone-200'}`}>Dự Tri</span>
                    <span className={`px-1 py-0.5 rounded border ${details.branch6.xrayEye ? 'bg-indigo-100 text-indigo-900 border-indigo-300 font-bold' : 'bg-stone-50 text-stone-400 border-stone-200'}`}>Thấu Thị</span>
                    <span className={`px-1 py-0.5 rounded border ${details.branch6.manaEye ? 'bg-indigo-100 text-indigo-900 border-indigo-300 font-bold' : 'bg-stone-50 text-stone-400 border-stone-200'}`}>Ma Lực</span>
                    <span className={`px-1 py-0.5 rounded border ${details.branch6.farSightEye ? 'bg-indigo-100 text-indigo-900 border-indigo-300 font-bold' : 'bg-stone-50 text-stone-400 border-stone-200'}`}>Vạn Lý</span>
                  </div>
                </div>
              </div>

              {/* King-tier Near-Death Challenge */}
              <div className="p-2 rounded-xl bg-white border border-stone-200 space-y-1">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-stone-700 font-semibold">Tiến Độ Sinh Tử (Cấp Vương):</span>
                  <span className={`font-mono font-bold ${details.nearDeathMet ? 'text-emerald-700' : 'text-rose-600'}`}>
                    {details.nearDeathCount} / 5 lần
                  </span>
                </div>
                <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-rose-500 to-amber-500 rounded-full"
                    style={{ width: `${Math.min(100, (details.nearDeathCount / 5) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Rào cản đột phá kế tiếp */}
              <div className="p-2 rounded-xl bg-amber-50/70 border border-amber-200 text-[10px] text-stone-800 leading-snug">
                <strong className="text-amber-900 block mb-0.5">Rào Cản Đột Phá Kế Tiếp:</strong>
                <span>{details.nextObstacle}</span>
              </div>

              {/* Open Skill Tree Button */}
              {onOpenSkillTree && (
                <button
                  type="button"
                  onClick={onOpenSkillTree}
                  className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-sm hover:scale-[1.02]"
                >
                  <Zap className="w-3.5 h-3.5 text-yellow-200" />
                  <span>Mở Cây Kỹ Năng Đa Diện (6 Nhánh)</span>
                </button>
              )}
            </div>
          );
        })()}

        {/* TAB: REPUTATION & EPITHET (HỆ THỐNG DANH TIẾNG & BIỆT DANH) */}
        {activeTab === 'reputation' && (
          <div className="space-y-2.5 animate-turn-in text-[11px]">
            {/* Header / Intro banner */}
            <div className="p-2.5 rounded-xl bg-gradient-to-r from-amber-900 via-stone-900 to-amber-950 text-white border border-amber-500/50 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span className="font-serif font-bold text-xs text-amber-200">
                    "{rep.currentEpithet}"
                  </span>
                </div>
                <span className={`text-[9.5px] font-mono font-bold px-2 py-0.5 rounded-full border ${getRankBadgeColor(rep.adventurerRank)}`}>
                  Hạng {rep.adventurerRank}
                </span>
              </div>
              <p className="text-[10px] text-stone-300 mt-1 italic">
                {rep.epithetDescription || 'Biệt danh phản ánh phong cách và danh tiếng của bạn.'}
              </p>
            </div>

            {/* Practical Effects: Fear & Commerce */}
            <div className="grid grid-cols-2 gap-1.5 text-[10.5px]">
              <div className="p-2 rounded-xl bg-red-50 border border-red-200">
                <div className="font-bold text-red-950 flex items-center gap-1 text-[10px]">
                  <span>⚡ Uy Áp Đối Thủ:</span>
                  <span className="font-mono text-red-700">{rep.fearFactor}/100</span>
                </div>
                <p className="text-[9.5px] text-stone-600 mt-0.5">
                  {rep.fearFactor >= 75
                    ? 'Kẻ địch yếu bỏ chạy ngay GĐ1 (-30% Touki)'
                    : rep.fearFactor >= 35
                    ? 'Làm giảm 15-20% Đấu khí kẻ địch yếu'
                    : 'Chưa đủ uy hiếp làm run sợ đối thủ'}
                </p>
              </div>

              <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200">
                <div className="font-bold text-emerald-950 flex items-center gap-1 text-[10px]">
                  <span>🪙 Thương Mại:</span>
                  <span className="font-mono text-emerald-700">
                    {rep.shopDiscountPercent > 0 ? `+${rep.shopDiscountPercent}%` : `${rep.shopDiscountPercent}%`}
                  </span>
                </div>
                <p className="text-[9.5px] text-stone-600 mt-0.5">
                  {rep.shopDiscountPercent > 0
                    ? `Được giảm giá ${rep.shopDiscountPercent}% khi mua sắm`
                    : rep.shopDiscountPercent < 0
                    ? `Bị phụ thu ${Math.abs(rep.shopDiscountPercent)}% do bị kỳ thị`
                    : 'Giá mua bán bình thường'}
                </p>
              </div>
            </div>

            {/* 4 Regional Reputations in Detail */}
            <div className="p-2.5 rounded-xl bg-white border border-stone-200 space-y-2">
              <span className="text-[10px] font-bold uppercase text-amber-900 block border-b pb-1">
                Chỉ Số Danh Tiếng 4 Vùng (-100 đến +100):
              </span>

              {/* 1. Adventurer Guild */}
              <div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="font-semibold text-stone-800 flex items-center gap-1">
                    🛡️ Công hội Phiêu lưu giả
                  </span>
                  <span className="font-mono font-bold text-amber-900">
                    {rep.regional.adventurerGuild > 0 ? `+${rep.regional.adventurerGuild}` : rep.regional.adventurerGuild} / 100
                  </span>
                </div>
                <div className="w-full h-1.5 bg-stone-200 rounded-full mt-0.5 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full"
                    style={{ width: `${Math.max(0, Math.min(100, (rep.regional.adventurerGuild + 100) / 2))}%` }}
                  />
                </div>
                <div className="text-[9px] text-stone-500 mt-0.5">Quyết định Hạng thẻ (F -&gt; S) và độ tin cậy nhiệm vụ</div>
              </div>

              {/* 2. Asura Nobility */}
              <div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="font-semibold text-stone-800 flex items-center gap-1">
                    👑 Giới Quý tộc Asura
                  </span>
                  <span className="font-mono font-bold text-purple-900">
                    {rep.regional.asuraNobility > 0 ? `+${rep.regional.asuraNobility}` : rep.regional.asuraNobility} / 100
                  </span>
                </div>
                <div className="w-full h-1.5 bg-stone-200 rounded-full mt-0.5 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-indigo-400 rounded-full"
                    style={{ width: `${Math.max(0, Math.min(100, (rep.regional.asuraNobility + 100) / 2))}%` }}
                  />
                </div>
                <div className="text-[9px] text-stone-500 mt-0.5">Quyết định cơ hội vào tiệc thượng lưu hay bị coi là thường dân</div>
              </div>

              {/* 3. Demon Continent */}
              <div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="font-semibold text-stone-800 flex items-center gap-1">
                    👹 Đại lục Ma giới
                  </span>
                  <span className="font-mono font-bold text-emerald-900">
                    {rep.regional.demonContinent > 0 ? `+${rep.regional.demonContinent}` : rep.regional.demonContinent} / 100
                  </span>
                </div>
                <div className="w-full h-1.5 bg-stone-200 rounded-full mt-0.5 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                    style={{ width: `${Math.max(0, Math.min(100, (rep.regional.demonContinent + 100) / 2))}%` }}
                  />
                </div>
                <div className="text-[9px] text-stone-500 mt-0.5">Tôn sùng kẻ mạnh; danh tiếng cao khiến quái thú kiêng dè</div>
              </div>

              {/* 4. Millis Church */}
              <div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="font-semibold text-stone-800 flex items-center gap-1">
                    ⛪ Giáo hội Millis
                  </span>
                  <span className="font-mono font-bold text-sky-900">
                    {rep.regional.millisChurch > 0 ? `+${rep.regional.millisChurch}` : rep.regional.millisChurch} / 100
                  </span>
                </div>
                <div className="w-full h-1.5 bg-stone-200 rounded-full mt-0.5 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-sky-500 to-blue-400 rounded-full"
                    style={{ width: `${Math.max(0, Math.min(100, (rep.regional.millisChurch + 100) / 2))}%` }}
                  />
                </div>
                <div className="text-[9px] text-stone-500 mt-0.5">Ảnh hưởng nếu liên quan Ma tộc hoặc tà thuật</div>
              </div>
            </div>

            {/* Combat Archetypes & Karma Badges */}
            <div className="p-2 rounded-xl bg-stone-50 border border-stone-200 space-y-1.5">
              <span className="text-[10px] font-bold uppercase text-stone-700 block">Hành Vi Tích Lũy:</span>
              <div className="grid grid-cols-2 gap-1 text-[9.5px]">
                <div className="px-1.5 py-0.5 rounded bg-white border border-stone-200 flex justify-between">
                  <span>Bùn lầy (Quagmire):</span>
                  <strong className="font-mono text-amber-800">{rep.combatTrack.quagmireCount}</strong>
                </div>
                <div className="px-1.5 py-0.5 rounded bg-white border border-stone-200 flex justify-between">
                  <span>Cuồng nhận (Berserk):</span>
                  <strong className="font-mono text-red-800">{rep.combatTrack.berserkerCount}</strong>
                </div>
                <div className="px-1.5 py-0.5 rounded bg-white border border-stone-200 flex justify-between">
                  <span>Bắc Thần / Ám khí:</span>
                  <strong className="font-mono text-purple-800">{rep.combatTrack.sneakTrickCount}</strong>
                </div>
                <div className="px-1.5 py-0.5 rounded bg-white border border-stone-200 flex justify-between">
                  <span>Pháo kích tầm xa:</span>
                  <strong className="font-mono text-blue-800">{rep.combatTrack.artilleryCount}</strong>
                </div>
                <div className="px-1.5 py-0.5 rounded bg-white border border-stone-200 flex justify-between">
                  <span>Thủy Thần / Thuần thủ:</span>
                  <strong className="font-mono text-cyan-800">{rep.combatTrack.guardianCount}</strong>
                </div>
                <div className="px-1.5 py-0.5 rounded bg-white border border-stone-200 flex justify-between">
                  <span>Nghĩa hiệp (Heroic):</span>
                  <strong className="font-mono text-emerald-800">{rep.karmaTrack.heroicCount}</strong>
                </div>
                <div className="px-1.5 py-0.5 rounded bg-white border border-stone-200 flex justify-between">
                  <span>Tàn bạo (Ruthless):</span>
                  <strong className="font-mono text-rose-800">{rep.karmaTrack.ruthlessCount}</strong>
                </div>
                <div className="px-1.5 py-0.5 rounded bg-white border border-stone-200 flex justify-between">
                  <span>Đơn độc (Reclusive):</span>
                  <strong className="font-mono text-stone-800">{rep.karmaTrack.reclusiveCount}</strong>
                </div>
              </div>
            </div>

            {/* Notable Feats & Epithet History */}
            <div className="p-2 rounded-xl bg-white border border-stone-200">
              <span className="text-[10px] font-bold uppercase text-amber-900 block mb-1">
                Lịch Sử Biệt Danh &amp; Chiến Tích:
              </span>
              <div className="space-y-1 max-h-28 overflow-y-auto pr-1">
                {rep.notableFeats.length === 0 ? (
                  <div className="text-[10px] text-stone-500 italic">Vẫn là một lữ khách vô danh, tiếp tục hành trình để lập chiến tích.</div>
                ) : (
                  rep.notableFeats.map((feat, fIdx) => (
                    <div key={`feat_${fIdx}`} className="text-[10px] text-stone-700 bg-amber-50/60 p-1.5 rounded border border-amber-200/60">
                      • {feat}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB: BONDS & SPECIAL TRAITS */}
        {activeTab === 'bonds' && (
          <div className="space-y-2 animate-turn-in">
            {/* Special Traits list */}
            {character.specialTraits.length > 0 && (
              <div className="p-2 rounded-xl bg-white border border-stone-200">
                <span className="text-[10px] font-bold uppercase text-amber-800 block mb-1">Thiên Phú &amp; Đặc Tính:</span>
                <div className="flex flex-wrap gap-1">
                  {character.specialTraits.map((t, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-stone-100 border border-stone-300 text-stone-800 text-[10px]">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Bonds List */}
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {character.bonds.length === 0 ? (
                <div className="p-3 text-center text-stone-500 italic text-[11px]">Chưa kết duyên với bằng hữu nào</div>
              ) : (
                character.bonds.map((bond, bIdx) => (
                  <div key={`bond_${bond.id || 'b'}_${bIdx}`} className="p-2 rounded-lg bg-white border border-stone-200 text-[11px]">
                    <div className="flex justify-between items-center font-bold">
                      <span className="text-stone-900">{bond.name}</span>
                      <span className="text-[10px] text-pink-600 font-mono">{bond.affection}% Thân thiết</span>
                    </div>
                    <div className="text-[10px] text-stone-600">{bond.relation}</div>
                    <div className="w-full h-1 bg-stone-200 rounded-full mt-1 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-pink-500 to-rose-400 rounded-full"
                        style={{ width: `${bond.affection}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* FOOTER QUICK ACTION DOCK */}
      <div className="pt-2 border-t border-amber-200 flex flex-col gap-2">
        {onOpenSkillTree && (
          <button
            type="button"
            onClick={onOpenSkillTree}
            className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:to-indigo-700 border border-purple-400 text-white font-bold font-serif text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(147,51,234,0.25)] hover:scale-[1.02]"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-200" />
            <span>Mở Cây Kỹ Năng Đa Diện (SP: {prog.skillPoints})</span>
          </button>
        )}

        {onOpenInventory && (
          <button
            type="button"
            onClick={onOpenInventory}
            className="w-full py-1.5 px-3 rounded-xl bg-white hover:bg-sky-50 border border-sky-300 text-sky-900 text-xs font-semibold transition cursor-pointer flex items-center justify-between shadow-xs"
          >
            <span className="flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-sky-600" />
              <span>11 Ô Trang Bị &amp; Túi Đồ</span>
            </span>
            <span className="font-mono text-[10px] text-stone-600">
              {character.inventory.length}/{character.maxInventorySlots || 20} Ô
            </span>
          </button>
        )}
      </div>
    </aside>
  );
};
