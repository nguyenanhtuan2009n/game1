import React, { memo, useState } from 'react';
import { 
  Compass, 
  Sun, 
  Moon, 
  CloudRain, 
  Sparkles, 
  Wind, 
  Eye, 
  MapPin, 
  Flame, 
  ShieldAlert, 
  Volume2, 
  VolumeX,
  Maximize2
} from 'lucide-react';
import { soundFx } from '../services/soundFx';

interface SceneVisualBannerProps {
  location: string;
  age: number;
  month?: number;
  narrationSnippet?: string;
  isCombat?: boolean;
  dangerEncountered?: boolean;
}

export type SceneEnvironment = 
  | 'buena_village' 
  | 'roa_citadel' 
  | 'demon_continent' 
  | 'ranoa_academy' 
  | 'begaritto_labyrinth' 
  | 'biheiril_forest' 
  | 'magic_armor_forge'
  | 'default_fantasy';

export const SceneVisualBanner: React.FC<SceneVisualBannerProps> = memo(({
  location,
  age,
  month = 1,
  narrationSnippet = '',
  isCombat = false,
  dangerEncountered = false,
}) => {
  const [timeOfDay, setTimeOfDay] = useState<'day' | 'sunset' | 'night'>('day');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(soundFx.enabled);

  // Determine current scene environment based on location keywords and narration
  const locLower = (location || '').toLowerCase();
  const narrLower = (narrationSnippet || '').toLowerCase();

  let env: SceneEnvironment = 'default_fantasy';
  let title = 'Vương Quốc Asura - Lục Địa Trung Tâm';
  let subtitle = 'Đại lục Sandbox huyền ảo';
  let weatherText = 'Trời quang đãng · Gió xuân dịu nhẹ';

  if (narrLower.includes('ma đạo khải') || narrLower.includes('mk.i') || narrLower.includes('mk.ii') || narrLower.includes('mk.zero') || narrLower.includes('xưởng')) {
    env = 'magic_armor_forge';
    title = 'Xưởng Nghiên Cứu Ma Đạo Khải Sharia';
    subtitle = 'Nơi rèn đúc những kỳ tích cơ khí ma thuật tối thượng';
    weatherText = 'Nhiệt khí lò nung · Bụi ma thạch lấp lánh';
  } else if (locLower.includes('buena') || locLower.includes('làng')) {
    env = 'buena_village';
    title = 'Làng Buena - Lãnh Địa Fittoa';
    subtitle = 'Vùng nông thôn thanh bình nơi bạn bắt đầu hành trình huyền thoại';
    weatherText = 'Nắng sớm chan hòa · Hương đồng cỏ nội';
  } else if (locLower.includes('roa') || locLower.includes('boreas') || locLower.includes('sauros')) {
    env = 'roa_citadel';
    title = 'Đô Thành Roa - Lâu Đài Gia Tộc Boreas';
    subtitle = 'Trung tâm quyền lực phồn hoa của vùng Fittoa';
    weatherText = 'Gió thổi cờ hiệu · Tiếng xe ngựa nhộn nhịp';
  } else if (locLower.includes('ma') || locLower.includes('demon') || locLower.includes('hẻm núi đá đỏ') || locLower.includes('đại lục ma') || locLower.includes('migurd')) {
    env = 'demon_continent';
    title = 'Đại Lục Ma - Hẻm Núi Đá Đỏ Cằn Cỗi';
    subtitle = 'Vùng đất khắc nghiệt của Ma tộc và hiểm họa rình rập';
    weatherText = 'Gió cát khô nóng · Hai mặt trăng tím huyền bí';
  } else if (locLower.includes('ranoa') || locLower.includes('sharia') || locLower.includes('học viện') || locLower.includes('phép thuật')) {
    env = 'ranoa_academy';
    title = 'Học Viện Ma Pháp Ranoa - Thành Phố Ma Thuật Sharia';
    subtitle = 'Thánh đường tri thức và nơi hội tụ các pháp sư kiệt xuất';
    weatherText = 'Bông tuyết trắng rơi · Vòng tròn ma pháp lơ lửng';
  } else if (locLower.includes('begaritto') || locLower.includes('mê cung') || locLower.includes('sa mạc') || locLower.includes('hydra') || narrLower.includes('labyrinth')) {
    env = 'begaritto_labyrinth';
    title = 'Mê Cung Dịch Chuyển Begaritto';
    subtitle = 'Hầm ngục pha lê cổ đại chôn giấu bí mật sinh tử';
    weatherText = 'Ánh sáng tinh thể xanh thẫm · Ma lực ngưng tụ';
  } else if (locLower.includes('biheiril') || locLower.includes('đấu thần') || locLower.includes('rừng')) {
    env = 'biheiril_forest';
    title = 'Rừng Rậm Biheiril - Chiến Tuyến Đấu Thần';
    subtitle = 'Vùng rừng thiêng cổ xưa nơi diễn ra trận đại chiến số phận';
    weatherText = 'Sương mù dày đặc · Tia sét hoàng kim rền vang';
  }

  const toggleSound = () => {
    soundFx.enabled = !soundFx.enabled;
    setSoundEnabled(soundFx.enabled);
    if (soundFx.enabled) {
      soundFx.playClick();
    }
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-amber-400/60 shadow-[0_8px_30px_rgba(217,119,6,0.15)] bg-slate-950 text-white select-none transition-all duration-300">
      {/* 1. Canvas / SVG Atmospheric Background Layer */}
      <div className="relative h-32 sm:h-40 w-full overflow-hidden">
        {/* Sky / Ambient Gradient depending on Environment & Time of Day */}
        {env === 'buena_village' && (
          <div className="absolute inset-0 bg-gradient-to-b from-sky-400 via-emerald-300/40 to-amber-100/30" />
        )}
        {env === 'roa_citadel' && (
          <div className="absolute inset-0 bg-gradient-to-b from-amber-700 via-rose-900/60 to-stone-900" />
        )}
        {env === 'demon_continent' && (
          <div className="absolute inset-0 bg-gradient-to-b from-purple-950 via-rose-950 to-stone-950" />
        )}
        {env === 'ranoa_academy' && (
          <div className="absolute inset-0 bg-gradient-to-b from-slate-800 via-sky-900/50 to-blue-950" />
        )}
        {env === 'begaritto_labyrinth' && (
          <div className="absolute inset-0 bg-gradient-to-b from-cyan-950 via-teal-950 to-stone-950" />
        )}
        {env === 'biheiril_forest' && (
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-950 via-amber-950/60 to-stone-950" />
        )}
        {env === 'magic_armor_forge' && (
          <div className="absolute inset-0 bg-gradient-to-b from-orange-950 via-stone-900 to-cyan-950" />
        )}
        {env === 'default_fantasy' && (
          <div className="absolute inset-0 bg-gradient-to-b from-sky-600 via-amber-600/40 to-stone-900" />
        )}

        {/* SVG Detailed Scenic Illustration Artwork */}
        <svg
          className="absolute inset-0 w-full h-full object-cover"
          viewBox="0 0 960 240"
          preserveAspectRatio="xMidYMid slice"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient id="sunFlare" cx="80%" cy="20%" r="60%">
              <stop offset="0%" stopColor="#fffbeb" stopOpacity="0.9" />
              <stop offset="25%" stopColor="#fde047" stopOpacity="0.4" />
              <stop offset="70%" stopColor="#f59e0b" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="canyonGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#7c2d12" />
              <stop offset="50%" stopColor="#451a03" />
              <stop offset="100%" stopColor="#1c1917" />
            </linearGradient>
            <linearGradient id="crystalGlow" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#0369a1" stopOpacity="0.4" />
            </linearGradient>
            <linearGradient id="armorForgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#f97316" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#1e293b" stopOpacity="0.9" />
            </linearGradient>
          </defs>

          {/* Atmospheric Sun / Moon */}
          {env === 'demon_continent' ? (
            <g>
              {/* Twin violet moons of the Demon Continent */}
              <circle cx="820" cy="50" r="28" fill="#d8b4fe" opacity="0.85" filter="drop-shadow(0 0 10px #c084fc)" />
              <circle cx="760" cy="80" r="14" fill="#f43f5e" opacity="0.7" filter="drop-shadow(0 0 6px #fb7185)" />
            </g>
          ) : (
            <g>
              <circle cx="820" cy="45" r="45" fill="url(#sunFlare)" />
              <circle cx="820" cy="45" r="18" fill="#ffffff" opacity="0.9" />
            </g>
          )}

          {/* Environment-Specific Horizons & Landmarks */}
          {env === 'buena_village' && (
            <g>
              {/* Distant Mountain Silhouettes */}
              <path d="M 0 160 Q 150 110, 300 150 T 600 140 T 960 170 L 960 240 L 0 240 Z" fill="#6ee7b7" opacity="0.45" />
              <path d="M 0 180 Q 200 140, 450 170 T 800 160 T 960 190 L 960 240 L 0 240 Z" fill="#34d399" opacity="0.6" />
              {/* Rolling Hills of Buena & Cottages */}
              <path d="M 0 195 Q 220 170, 500 190 T 960 185 L 960 240 L 0 240 Z" fill="#15803d" />
              {/* Windmill & Cottage */}
              <rect x="220" y="160" width="22" height="26" fill="#fef3c7" rx="2" />
              <polygon points="215,160 231,142 247,160" fill="#b45309" />
              <line x1="231" y1="145" x2="231" y2="135" stroke="#fef3c7" strokeWidth="2" />
              <line x1="220" y1="140" x2="242" y2="140" stroke="#fef3c7" strokeWidth="2" />
              {/* Thatched House Rudy's home */}
              <rect x="680" y="165" width="45" height="28" fill="#fef08a" rx="3" />
              <polygon points="672,165 702,142 733,165" fill="#92400e" />
              <rect x="696" y="174" width="12" height="19" fill="#78350f" />
              {/* Waving Grass & Trees */}
              <circle cx="160" cy="180" r="14" fill="#166534" />
              <circle cx="178" cy="185" r="11" fill="#15803d" />
              <circle cx="750" cy="180" r="16" fill="#14532d" />
            </g>
          )}

          {env === 'roa_citadel' && (
            <g>
              {/* Grand Roa Castle Battlements & Spires */}
              <path d="M 0 180 L 120 180 L 120 140 L 145 140 L 145 180 L 280 180 L 280 110 L 315 80 L 350 110 L 350 180 L 520 180 L 520 130 L 545 130 L 545 180 L 700 180 L 700 90 L 730 60 L 760 90 L 760 180 L 960 180 L 960 240 L 0 240 Z" fill="#292524" opacity="0.9" />
              <path d="M 280 110 L 315 80 L 350 110 Z" fill="#dc2626" />
              <path d="M 700 90 L 730 60 L 760 90 Z" fill="#b91c1c" />
              {/* Windows with amber firelight */}
              <circle cx="315" cy="125" r="4" fill="#fbbf24" />
              <circle cx="315" cy="145" r="4" fill="#fbbf24" />
              <circle cx="730" cy="115" r="4" fill="#fbbf24" />
              <circle cx="730" cy="135" r="4" fill="#fbbf24" />
            </g>
          )}

          {env === 'demon_continent' && (
            <g>
              {/* Sharp Jagged Crimson Canyons of Red Canyon / Demon Continent */}
              <polygon points="0,240 80,120 160,200 240,90 340,210 460,80 560,190 700,70 820,180 960,100 960,240" fill="url(#canyonGrad)" />
              <polygon points="0,240 140,160 280,240 420,150 620,240 760,140 960,220 960,240" fill="#1c1917" opacity="0.9" />
              {/* Volcanic magma fissures */}
              <path d="M 120 220 Q 180 210, 240 225 T 380 215" stroke="#ef4444" strokeWidth="2.5" fill="none" opacity="0.8" />
              <path d="M 600 225 Q 680 218, 780 226" stroke="#f97316" strokeWidth="2" fill="none" opacity="0.8" />
            </g>
          )}

          {env === 'ranoa_academy' && (
            <g>
              {/* Snow-covered Magic Academy spires and floating arcane crystals */}
              <polygon points="380,240 410,70 440,240" fill="#1e293b" />
              <polygon points="400,70 410,40 420,70" fill="#38bdf8" />
              <polygon points="460,240 490,90 520,240" fill="#334155" />
              <polygon points="480,90 490,65 500,90" fill="#67e8f9" />
              <polygon points="260,240 280,120 300,240" fill="#1e293b" />
              {/* Academy Main Hall with Archways */}
              <rect x="330" y="160" width="220" height="70" fill="#0f172a" rx="4" />
              <path d="M 370 230 A 20 20 0 0 1 410 230 Z" fill="#facc15" opacity="0.8" />
              <path d="M 470 230 A 20 20 0 0 1 510 230 Z" fill="#facc15" opacity="0.8" />
              {/* Floating Arcane Glyph Ring */}
              <circle cx="410" cy="50" r="16" stroke="#38bdf8" strokeWidth="1.5" fill="none" strokeDasharray="4 2" opacity="0.85" />
              <circle cx="490" cy="70" r="12" stroke="#a855f7" strokeWidth="1.2" fill="none" strokeDasharray="3 2" opacity="0.85" />
            </g>
          )}

          {env === 'begaritto_labyrinth' && (
            <g>
              {/* Deep Crystal Cave Pillars & Teleport Rings */}
              <polygon points="60,0 80,140 100,0" fill="url(#crystalGlow)" />
              <polygon points="220,0 240,170 260,0" fill="url(#crystalGlow)" />
              <polygon points="720,0 740,150 760,0" fill="url(#crystalGlow)" />
              <polygon points="860,0 875,130 890,0" fill="url(#crystalGlow)" />
              {/* Cavern Arch Floor */}
              <path d="M 0 240 Q 480 180, 960 240 Z" fill="#09090b" />
              {/* Magic Teleportation Circle on the Floor */}
              <ellipse cx="480" cy="215" rx="140" ry="20" stroke="#06b6d4" strokeWidth="2" fill="none" strokeDasharray="6 3" />
              <ellipse cx="480" cy="215" rx="80" ry="12" stroke="#38bdf8" strokeWidth="1.5" fill="none" />
            </g>
          )}

          {env === 'magic_armor_forge' && (
            <g>
              {/* Magic Armor Giant Silhouette in the Workshop */}
              {/* Furnace Glow */}
              <circle cx="200" cy="180" r="50" fill="#f97316" opacity="0.3" filter="drop-shadow(0 0 20px #ea580c)" />
              {/* Magic Armor Mk.I Head & Shoulders Silhouette */}
              <path d="M 440 240 L 440 150 L 460 120 L 500 120 L 520 150 L 520 240 Z" fill="#0f172a" />
              {/* Massive Shoulders & Gatling Gauntlet */}
              <rect x="380" y="145" width="60" height="40" rx="4" fill="#1e293b" />
              <rect x="520" y="145" width="60" height="40" rx="4" fill="#1e293b" />
              {/* Glowing Mana Core & Visor */}
              <circle cx="480" cy="165" r="9" fill="#38bdf8" filter="drop-shadow(0 0 8px #0284c7)" />
              <rect x="465" y="132" width="30" height="6" rx="2" fill="#38bdf8" />
              {/* Conduits / Tubes with Blue Mana */}
              <path d="M 440 170 Q 400 190, 360 180" stroke="#38bdf8" strokeWidth="3" fill="none" opacity="0.9" />
              <path d="M 520 170 Q 560 190, 600 180" stroke="#38bdf8" strokeWidth="3" fill="none" opacity="0.9" />
            </g>
          )}

          {env === 'biheiril_forest' && (
            <g>
              {/* Deep enchanted ancient forest trees and golden thunder of Badigadi */}
              <polygon points="120,240 160,80 200,240" fill="#064e3b" />
              <polygon points="260,240 300,60 340,240" fill="#022c22" />
              <polygon points="620,240 660,70 700,240" fill="#064e3b" />
              <polygon points="760,240 800,50 840,240" fill="#022c22" />
              {/* Golden Thunder of Fighting God Armor */}
              <path d="M 480 30 L 470 80 L 495 100 L 475 160" stroke="#eab308" strokeWidth="2.5" fill="none" opacity="0.85" filter="drop-shadow(0 0 6px #facc15)" />
            </g>
          )}
        </svg>

        {/* Ambient Floating Particle Effects */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/6 w-1.5 h-1.5 rounded-full bg-amber-300 animate-ping opacity-75" />
          <div className="absolute top-1/3 right-1/4 w-2 h-2 rounded-full bg-cyan-300 animate-pulse opacity-80" />
          <div className="absolute top-2/3 left-1/2 w-1.5 h-1.5 rounded-full bg-white animate-bounce opacity-70" />
          <div className="absolute top-1/2 left-3/4 w-2 h-2 rounded-full bg-amber-200 animate-pulse opacity-60" />
        </div>

        {/* Vignette Overlay for Crisp Contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-transparent to-slate-950/80" />

        {/* Top Controls Bar (Sound & Weather) */}
        <div className="absolute top-2.5 left-3 right-3 flex items-center justify-between z-10 text-xs">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-amber-500/40 text-amber-300 font-mono text-[10.5px] font-bold flex items-center gap-1.5 shadow-sm">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span className="truncate max-w-[200px] sm:max-w-xs">{location || 'Đại Lục Asura'}</span>
            </span>

            {isCombat && (
              <span className="px-2.5 py-1 rounded-full bg-rose-950/90 backdrop-blur-md border border-rose-500 text-rose-200 font-mono text-[10.5px] font-bold flex items-center gap-1 animate-pulse">
                <Flame className="w-3.5 h-3.5 text-rose-400" />
                CHIẾN TRƯỜNG SINH TỬ
              </span>
            )}
          </div>
        </div>

        {/* Bottom Banner Title & Atmosphere Details */}
        <div className="absolute bottom-3 left-4 right-4 flex flex-wrap items-end justify-between gap-2 z-10">
          <div className="space-y-0.5">
            <div className="text-[10.5px] uppercase tracking-widest text-amber-400/90 font-mono font-bold flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>{weatherText}</span>
            </div>
            <h3 className="text-base sm:text-lg font-cinzel font-bold text-white tracking-wide drop-shadow-md">
              {title}
            </h3>
            <p className="text-xs text-stone-300 font-story line-clamp-1 italic max-w-xl">
              {subtitle}
            </p>
          </div>

          <div className="text-right hidden sm:block">
            <span className="text-[11px] font-mono text-amber-300/80 bg-black/40 px-2.5 py-1 rounded-lg border border-amber-500/30 backdrop-blur-sm">
              Thời gian: {age} tuổi {month} tháng
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});
