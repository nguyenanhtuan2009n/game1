import React, { memo, useState } from 'react';
import type { Character } from '../types/game';
import { 
  Eye, 
  Sparkles, 
  Shield, 
  Zap, 
  Flame, 
  Droplet, 
  Mountain, 
  Wind,
  Crown
} from 'lucide-react';
import { soundFx } from '../services/soundFx';

interface CharacterAvatarProps {
  character: Character;
  onOpenSkillTree?: () => void;
}

export const CharacterAvatar: React.FC<CharacterAvatarProps> = memo(({
  character,
  onOpenSkillTree,
}) => {
  const [demonEyeActive, setDemonEyeActive] = useState<boolean>(true);

  const age = character.stats.age;
  const hasDemonEye = character.specialTraits.some(t => 
    t.toLowerCase().includes('ma nhãn') || 
    t.toLowerCase().includes('dự toán') || 
    t.toLowerCase().includes('vạn lý')
  ) || age >= 10;

  const hasMagicArmor = (character.peakStoryProgression?.magicArmorTechStage || 0) > 0 ||
    character.inventory.some(i => i.id?.includes('magic_armor'));

  const manaPct = Math.min(100, Math.round((character.stats.manaCurrent / character.stats.manaMax) * 100));
  const toukiVal = character.stats.touki || 0;

  const toggleDemonEye = () => {
    soundFx.playRuneHum();
    setDemonEyeActive(!demonEyeActive);
  };

  // Determine stage title & styling
  let lifeStage = 'Thơ Ấu (Làng Buena)';
  let coatColor = '#16a34a'; // green
  let hairStyle = 'Tóc nâu hạt dẻ ngắn buông xõa';

  if (age >= 24) {
    lifeStage = 'Thất Đại Liệt Cường (Huyền Thoại Sharia)';
    coatColor = '#1e293b'; // slate dark coat with magic armor crest
    hairStyle = 'Tóc dài buộc gọn, ánh mắt kiên định của bậc gia trưởng';
  } else if (age >= 15) {
    lifeStage = 'Học Viện Ranoa & Mạo Hiểm Giả Đầm Lầy';
    coatColor = '#475569'; // gray trenchcoat
    hairStyle = 'Tóc nâu lãng tử, ánh mắt từng trải sau phong ba';
  } else if (age >= 7) {
    lifeStage = 'Gia Sư Roa & Mạo Hiểm Giả Dead End';
    coatColor = '#b45309'; // amber adventurer tunic
    hairStyle = 'Thiếu niên kiên cường phong sương Đại Lục Ma';
  }

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-amber-300/80 bg-gradient-to-b from-stone-900 via-stone-950 to-stone-900 text-white p-3.5 shadow-md">
      {/* Dynamic Mana / Touki Aura Halo */}
      <div 
        className={`absolute inset-0 pointer-events-none transition-opacity duration-700 ${
          toukiVal > 40 ? 'opacity-40 animate-pulse' : 'opacity-20'
        }`}
        style={{
          background: `radial-gradient(circle at 50% 40%, rgba(56, 189, 248, ${manaPct / 200}), rgba(245, 158, 11, ${toukiVal / 250}), transparent 75%)`
        }}
      />

      <div className="flex items-center gap-3.5 relative z-10">
        {/* Anime Illustrated Portrait Frame */}
        <div className="relative shrink-0">
          {/* Outer Runic Ring */}
          <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl p-1 bg-gradient-to-tr from-amber-500 via-yellow-300 to-amber-600 shadow-lg relative group">
            <div className="w-full h-full rounded-xl overflow-hidden bg-slate-900 relative flex items-center justify-center">
              {/* SVG Handcrafted Anime Portrait of Protagonist Hero */}
              <svg 
                viewBox="0 0 100 100" 
                className="w-full h-full object-cover"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="skinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#ffedd5" />
                    <stop offset="100%" stopColor="#fed7aa" />
                  </linearGradient>
                  <linearGradient id="hairGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#78350f" />
                    <stop offset="60%" stopColor="#92400e" />
                    <stop offset="100%" stopColor="#451a03" />
                  </linearGradient>
                  <linearGradient id="eyeForesight" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#22d3ee" />
                    <stop offset="50%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#0891b2" />
                  </linearGradient>
                </defs>

                {/* Background Aura Inside Frame */}
                <rect width="100" height="100" fill={age >= 24 ? '#090d16' : '#1e1b4b'} />
                <circle cx="50" cy="50" r="45" fill="none" stroke="#f59e0b" strokeWidth="0.75" strokeDasharray="3 2" opacity="0.4" />

                {/* Cloak / Shoulders */}
                <path 
                  d="M 15 100 C 20 75, 40 70, 50 72 C 60 70, 80 75, 85 100 Z" 
                  fill={coatColor} 
                />
                {/* White Inner Shirt / Collar */}
                <polygon points="44,72 56,72 53,88 47,88" fill="#ffffff" />
                <polygon points="46,80 50,88 54,80" fill="#dc2626" />

                {/* Magic Armor Mk.I Shoulder Insignia if owned */}
                {hasMagicArmor && (
                  <circle cx="28" cy="85" r="5" fill="#38bdf8" stroke="#ffffff" strokeWidth="1" filter="drop-shadow(0 0 3px #0284c7)" />
                )}

                {/* Neck */}
                <rect x="44" y="62" width="12" height="14" fill="#fdba74" rx="2" />

                {/* Head Base (Face) */}
                <path 
                  d="M 32 45 C 32 30, 68 30, 68 45 C 68 60, 58 68, 50 70 C 42 68, 32 60, 32 45 Z" 
                  fill="url(#skinGrad)" 
                />

                {/* Hair: Brown Anime Bangs */}
                <path 
                  d="M 28 42 C 26 24, 74 24, 72 42 C 68 32, 58 32, 50 35 C 42 32, 32 34, 28 42 Z" 
                  fill="url(#hairGrad)" 
                />
                {/* Sideburns & Tufts */}
                <polygon points="30,40 32,54 36,44" fill="#78350f" />
                <polygon points="70,40 68,54 64,44" fill="#78350f" />
                <polygon points="42,34 45,46 48,35" fill="#92400e" />
                <polygon points="48,34 52,48 55,35" fill="#78350f" />

                {/* Left Eye (Normal Brown / Blue hero eyes) */}
                <ellipse cx="42" cy="50" rx="3.5" ry="4" fill="#ffffff" />
                <circle cx="42" cy="50" r="2.5" fill="#1e3a8a" />
                <circle cx="41" cy="49" r="0.8" fill="#ffffff" />

                {/* Right Eye: Demon Eye of Foresight (Ma Nhãn) or Normal */}
                <ellipse cx="58" cy="50" rx="3.5" ry="4" fill="#ffffff" />
                {hasDemonEye && demonEyeActive ? (
                  <g>
                    {/* Glowing Cyan Demon Eye */}
                    <circle cx="58" cy="50" r="3" fill="url(#eyeForesight)" filter="drop-shadow(0 0 3px #22d3ee)" />
                    {/* Ocular Rune Star in Pupil */}
                    <circle cx="58" cy="50" r="1.2" fill="#ffffff" />
                    <line x1="55" y1="50" x2="61" y2="50" stroke="#cffafe" strokeWidth="0.8" />
                    <line x1="58" y1="47" x2="58" y2="53" stroke="#cffafe" strokeWidth="0.8" />
                  </g>
                ) : (
                  <g>
                    <circle cx="58" cy="50" r="2.5" fill="#1e3a8a" />
                    <circle cx="57" cy="49" r="0.8" fill="#ffffff" />
                  </g>
                )}

                {/* Eyebrows & Gentle Determined Expression */}
                <path d="M 38 44 Q 42 42, 46 44" stroke="#451a03" strokeWidth="1.2" fill="none" />
                <path d="M 54 44 Q 58 42, 62 44" stroke="#451a03" strokeWidth="1.2" fill="none" />

                {/* Nose & Subtle Smile */}
                <line x1="50" y1="53" x2="49" y2="57" stroke="#ea580c" strokeWidth="0.8" opacity="0.6" />
                <path d="M 47 62 Q 50 64, 53 62" stroke="#9a3412" strokeWidth="1" fill="none" />

                {/* Forehead Mana Crystal / Laplace Factor indicator */}
                {character.specialTraits.some(t => t.includes('Laplace')) && (
                  <circle cx="50" cy="38" r="1.5" fill="#38bdf8" opacity="0.85" />
                )}
              </svg>

              {/* Demon Eye Active Glow Badge Overlay */}
              {hasDemonEye && demonEyeActive && (
                <div className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
              )}
            </div>

            {/* Level / Age Tag Badge */}
            <div className="absolute -bottom-2 -right-1 px-1.5 py-0.5 rounded-full bg-amber-500 border border-amber-300 text-[9.5px] font-mono font-extrabold text-stone-950 shadow-xs flex items-center gap-0.5">
              <span>{age}t</span>
            </div>
          </div>
        </div>

        {/* Character Bio & Titles */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1.5">
              <h3 className="font-cinzel font-bold text-sm sm:text-base text-amber-200 truncate">
                {character.name}
              </h3>
              {age >= 24 && (
                <span title="Thất Đại Liệt Cường Đệ Thất Vị">
                  <Crown className="w-4 h-4 text-yellow-400 shrink-0" />
                </span>
              )}
            </div>

            {/* Demon Eye Interactive Toggle Button */}
            {hasDemonEye && (
              <button
                type="button"
                onClick={toggleDemonEye}
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full border transition flex items-center gap-1 cursor-pointer ${
                  demonEyeActive 
                    ? 'bg-cyan-950/90 text-cyan-200 border-cyan-400 animate-demon-eye' 
                    : 'bg-stone-800 text-stone-400 border-stone-600 hover:text-stone-200'
                }`}
                title="Bật/Tắt Dự Toán Ma Nhãn (Nhìn trước 1-2 giây tương lai)"
              >
                <Eye className="w-3 h-3 text-cyan-400" />
                <span>{demonEyeActive ? 'Ma Nhãn: BẬT' : 'Ma Nhãn: TẮT'}</span>
              </button>
            )}
          </div>

          <div className="text-[11px] font-story text-stone-300 line-clamp-1 italic">
            "{character.title || 'Người Chuyển Sinh'}"
          </div>

          <div className="text-[10.5px] font-vietnam text-stone-400 flex items-center gap-2">
            <span>{lifeStage}</span>
            <span>•</span>
            <span className="text-amber-300 font-mono">Rank: {character.progression?.overallRank || 'Thánh Cấp'}</span>
          </div>

          {/* Elemental Magic Aptitude Mini Glyphs */}
          <div className="flex items-center gap-1.5 pt-0.5 flex-wrap">
            <span className="text-[9.5px] font-mono px-1.5 py-0.2 rounded bg-blue-950/80 text-blue-300 border border-blue-600/60 flex items-center gap-0.5" title={`Thủy Ma Pháp: ${character.magic.water}`}>
              <Droplet className="w-2.5 h-2.5 text-blue-400" /> {character.magic.water}
            </span>
            <span className="text-[9.5px] font-mono px-1.5 py-0.2 rounded bg-amber-950/80 text-amber-300 border border-amber-600/60 flex items-center gap-0.5" title={`Thổ Ma Pháp: ${character.magic.earth}`}>
              <Mountain className="w-2.5 h-2.5 text-amber-400" /> {character.magic.earth}
            </span>
            <span className="text-[9.5px] font-mono px-1.5 py-0.2 rounded bg-rose-950/80 text-rose-300 border border-rose-600/60 flex items-center gap-0.5" title={`Hỏa Ma Pháp: ${character.magic.fire}`}>
              <Flame className="w-2.5 h-2.5 text-rose-400" /> {character.magic.fire}
            </span>
            <span className="text-[9.5px] font-mono px-1.5 py-0.2 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-600/60 flex items-center gap-0.5" title={`Phong Ma Pháp: ${character.magic.wind}`}>
              <Wind className="w-2.5 h-2.5 text-emerald-400" /> {character.magic.wind}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});
