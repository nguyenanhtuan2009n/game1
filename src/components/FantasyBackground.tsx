import React, { memo } from 'react';

/**
 * High-Fidelity Bright Fantasy Background (Tone Màu Sáng)
 * High-fantasy sandbox world atmosphere:
 * - Luminous azure-to-amber morning sky with celestial god rays
 * - Distant mythical mountain range & towering fantasy spires of Valoria
 * - Floating mystical sky islands with cascading crystalline waterfalls & ancient ruins
 * - Grand celestial astrolabe / ancient rotating magic circles
 * - Soaring wyverns gliding in the morning clouds
 * - Radiant floating golden mana motes & sun sparkles
 */
export const FantasyBackground: React.FC = memo(() => {
  return (
    <div 
      className="fixed inset-0 pointer-events-none overflow-hidden -z-10 select-none" 
      aria-hidden="true"
    >
      {/* 1. Base Radiant Sky Gradient */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-[#bae6fd] via-[#fef08a]/35 to-[#f8fafc]"
        style={{
          background: 'linear-gradient(180deg, #cbebfb 0%, #dff2fe 28%, #fef9c3 65%, #f8fafc 100%)'
        }}
      />

      {/* 2. Panoramic Fantasy Vector Landscape SVG */}
      <svg 
        className="absolute inset-0 w-full h-full object-cover preserve-3d"
        viewBox="0 0 1920 1080"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Radiant Sun Glow */}
          <radialGradient id="sunGlow" cx="72%" cy="16%" r="45%" fx="72%" fy="16%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="12%" stopColor="#fef08a" stopOpacity="0.8" />
            <stop offset="35%" stopColor="#fde047" stopOpacity="0.45" />
            <stop offset="70%" stopColor="#f59e0b" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
          </radialGradient>

          {/* God Rays Gradient */}
          <linearGradient id="godRay" x1="0%" y1="0%" x2="70%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.38" />
            <stop offset="45%" stopColor="#fef08a" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#fef08a" stopOpacity="0" />
          </linearGradient>

          {/* Far Mountains Gradient */}
          <linearGradient id="farMountainGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#cbd5e1" stopOpacity="0.5" />
            <stop offset="50%" stopColor="#dbeafe" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#e0f2fe" stopOpacity="0.85" />
          </linearGradient>

          {/* Mid Mountains Gradient */}
          <linearGradient id="midMountainGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.6" />
            <stop offset="60%" stopColor="#bfdbfe" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#dbeafe" stopOpacity="0.9" />
          </linearGradient>

          {/* Near Mountain & Hills Gradient */}
          <linearGradient id="nearHillsGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#86efac" stopOpacity="0.45" />
            <stop offset="40%" stopColor="#bbf7d0" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#f1f5f9" stopOpacity="0.95" />
          </linearGradient>

          {/* Floating Island Rock Gradient */}
          <linearGradient id="islandRockGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#a3e635" stopOpacity="0.85" />
            <stop offset="22%" stopColor="#65a30d" stopOpacity="0.9" />
            <stop offset="60%" stopColor="#78716c" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#44403c" stopOpacity="0.95" />
          </linearGradient>

          {/* Island 2 Rock Gradient */}
          <linearGradient id="islandRockGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#86efac" stopOpacity="0.9" />
            <stop offset="25%" stopColor="#15803d" stopOpacity="0.85" />
            <stop offset="70%" stopColor="#71717a" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#3f3f46" stopOpacity="0.95" />
          </linearGradient>

          {/* Waterfall Gradient */}
          <linearGradient id="waterfallGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="30%" stopColor="#7dd3fc" stopOpacity="0.75" />
            <stop offset="85%" stopColor="#38bdf8" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>

          {/* Distant Citadel Silhouette Gradient */}
          <linearGradient id="citadelGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.75" />
            <stop offset="45%" stopColor="#60a5fa" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#93c5fd" stopOpacity="0.75" />
          </linearGradient>

          {/* Soft Cloud Gradient */}
          <linearGradient id="cloudGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
            <stop offset="60%" stopColor="#fef08a" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* 2.1 Radiant Sun Orb & Solar Halo */}
        <circle cx="1380" cy="170" r="320" fill="url(#sunGlow)" />
        <circle cx="1380" cy="170" r="45" fill="#ffffff" filter="drop-shadow(0 0 25px rgba(254,240,138,0.9))" />

        {/* 2.2 God Rays / Sun Beams radiating through the bright sky */}
        <g opacity="0.7">
          <polygon points="1380,170 -100,500 -100,680" fill="url(#godRay)" />
          <polygon points="1380,170 200,900 380,950" fill="url(#godRay)" />
          <polygon points="1380,170 650,1100 880,1100" fill="url(#godRay)" />
          <polygon points="1380,170 1200,1100 1500,1100" fill="url(#godRay)" />
          <polygon points="1380,170 1800,900 2020,950" fill="url(#godRay)" />
        </g>

        {/* 2.3 Grand Celestial Magic Astrolabe in High Sky (Ancient World Astrolabe) */}
        <g transform="translate(1380, 170)" opacity="0.45">
          {/* Main outer ring */}
          <circle cx="0" cy="0" r="260" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="6 4" />
          <circle cx="0" cy="0" r="248" fill="none" stroke="#38bdf8" strokeWidth="1" />
          <circle cx="0" cy="0" r="210" fill="none" stroke="#f59e0b" strokeWidth="1.2" strokeDasharray="14 8 4 8" />
          <circle cx="0" cy="0" r="160" fill="none" stroke="#fbbf24" strokeWidth="1" />
          <circle cx="0" cy="0" r="120" fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="8 6" />

          {/* Astrolabe Axis and Crosses */}
          <line x1="-280" y1="0" x2="280" y2="0" stroke="#f59e0b" strokeWidth="1" strokeOpacity="0.5" />
          <line x1="0" y1="-280" x2="0" y2="280" stroke="#f59e0b" strokeWidth="1" strokeOpacity="0.5" />
          <line x1="-198" y1="-198" x2="198" y2="198" stroke="#38bdf8" strokeWidth="0.8" strokeOpacity="0.4" />
          <line x1="198" y1="-198" x2="-198" y2="198" stroke="#38bdf8" strokeWidth="0.8" strokeOpacity="0.4" />

          {/* Hexagram Sacred Star */}
          <polygon points="0,-160 138.5,80 -138.5,80" fill="none" stroke="#f59e0b" strokeWidth="1.2" strokeOpacity="0.4" />
          <polygon points="0,160 138.5,-80 -138.5,-80" fill="none" stroke="#f59e0b" strokeWidth="1.2" strokeOpacity="0.4" />

          {/* Arcane Compass Diamonds */}
          <polygon points="0,-270 8,-260 0,-250 -8,-260" fill="#f59e0b" />
          <polygon points="0,270 8,260 0,250 -8,260" fill="#f59e0b" />
          <polygon points="-270,0 -260,8 -250,0 -260,-8" fill="#f59e0b" />
          <polygon points="270,0 260,8 250,0 260,-8" fill="#f59e0b" />
        </g>

        {/* 2.4 Distant Dreamy Clouds in Upper Sky */}
        <g opacity="0.65">
          <path d="M 120 220 Q 180 180 260 200 Q 320 160 400 180 Q 480 170 540 220 Q 560 250 500 270 L 160 270 Z" fill="url(#cloudGrad)" />
          <path d="M 800 140 Q 860 110 930 130 Q 980 90 1060 120 Q 1120 110 1160 150 Q 1180 180 1120 200 L 820 200 Z" fill="url(#cloudGrad)" />
          <path d="M 1480 320 Q 1550 280 1640 300 Q 1710 260 1800 290 Q 1880 280 1930 330 L 1490 350 Z" fill="url(#cloudGrad)" />
        </g>

        {/* 2.5 Soaring Wyverns / Dragons in Distant Sky */}
        <g fill="#475569" opacity="0.4">
          {/* Wyvern 1 */}
          <path d="M 940 220 Q 955 210 970 216 Q 960 225 940 220 Z M 955 210 Q 970 198 985 204 Q 975 218 955 214 Z" />
          {/* Wyvern 2 (smaller, leading) */}
          <path d="M 995 205 Q 1007 197 1018 202 Q 1010 209 995 205 Z M 1007 197 Q 1018 188 1030 193 Q 1022 204 1007 200 Z" />
          {/* Wyvern 3 (distant follower) */}
          <path d="M 915 235 Q 924 227 933 231 Q 926 237 915 235 Z" />
        </g>

        {/* 2.6 Majestic Far Mountain Ranges (Soft Lavender & Blue Haze) */}
        <path 
          d="M -50 680 L 120 540 L 280 620 L 460 480 L 620 590 L 780 460 L 980 580 L 1180 430 L 1360 560 L 1540 450 L 1720 580 L 1880 490 L 2000 580 L 2000 1080 L -50 1080 Z" 
          fill="url(#farMountainGrad)" 
        />

        {/* 2.7 Distant Fantasy Citadel & Spired Palace of Roa / Royal Capital */}
        <g opacity="0.85">
          {/* Main Central Cathedral Spire */}
          <polygon points="1020,380 1028,490 1012,490" fill="url(#citadelGrad)" />
          <polygon points="1020,360 1022,382 1018,382" fill="#fbbf24" />
          <circle cx="1020" cy="380" r="5" fill="#fef08a" />
          
          {/* Flanking Spires */}
          <polygon points="985,410 992,500 978,500" fill="url(#citadelGrad)" />
          <polygon points="1055,415 1062,500 1048,500" fill="url(#citadelGrad)" />
          <polygon points="950,440 956,510 944,510" fill="url(#citadelGrad)" />
          <polygon points="1090,435 1096,510 1084,510" fill="url(#citadelGrad)" />

          {/* Palace Walls, Domes & Flying Buttress Arches */}
          <rect x="960" y="480" width="120" height="40" rx="4" fill="url(#citadelGrad)" />
          <path d="M 975 480 Q 1020 450 1065 480 Z" fill="#60a5fa" opacity="0.7" />
          <path d="M 940 500 Q 960 485 980 500" stroke="#fbbf24" strokeWidth="1.5" fill="none" opacity="0.6" />
          <path d="M 1060 500 Q 1080 485 1100 500" stroke="#fbbf24" strokeWidth="1.5" fill="none" opacity="0.6" />
        </g>

        {/* 2.8 Mid-Range Mountains & Verdant Ridges */}
        <path 
          d="M -50 780 L 160 630 L 340 730 L 520 600 L 720 710 L 890 590 L 1090 710 L 1280 580 L 1480 690 L 1690 570 L 1860 680 L 2000 600 L 2000 1080 L -50 1080 Z" 
          fill="url(#midMountainGrad)" 
        />

        {/* 2.9 Rolling Emerald-Golden Foothills */}
        <path 
          d="M -50 890 Q 220 740 500 830 Q 820 760 1140 850 Q 1480 770 1780 840 Q 1920 810 2000 860 L 2000 1080 L -50 1080 Z" 
          fill="url(#nearHillsGrad)" 
        />

        {/* 2.10 FLOATING ISLAND 1: Grand Mystic Isle with Cascading Waterfall (Left) */}
        <g transform="translate(180, 240)" filter="drop-shadow(0 20px 25px rgba(0,0,0,0.15))">
          {/* Inverted Levitation Island Base (Rough crags) */}
          <polygon 
            points="40,90 280,75 320,105 270,180 200,240 180,260 150,210 110,185 30,130" 
            fill="url(#islandRockGrad)" 
          />
          {/* Lush Green Plateau Surface */}
          <ellipse cx="175" cy="85" rx="145" ry="22" fill="#84cc16" />
          <ellipse cx="175" cy="82" rx="135" ry="18" fill="#bef264" />

          {/* Ancient Temple / Wizard Tower on Floating Island */}
          <polygon points="140,40 148,82 132,82" fill="#e2e8f0" />
          <polygon points="140,28 142,42 138,42" fill="#f59e0b" />
          <circle cx="140" cy="26" r="3.5" fill="#fef08a" />
          
          <polygon points="165,30 175,82 155,82" fill="#cbd5e1" />
          <polygon points="165,18 168,32 162,32" fill="#38bdf8" />
          <circle cx="165" cy="16" r="4" fill="#67e8f9" filter="drop-shadow(0 0 6px #38bdf8)" />

          {/* Lush Fantasy Trees on Island */}
          <circle cx="80" cy="74" r="16" fill="#15803d" />
          <circle cx="75" cy="68" r="13" fill="#22c55e" />
          <circle cx="95" cy="76" r="12" fill="#16a34a" />
          <circle cx="230" cy="72" r="18" fill="#15803d" />
          <circle cx="242" cy="76" r="14" fill="#22c55e" />
          <circle cx="265" cy="80" r="11" fill="#4ade80" />

          {/* Cascading Crystalline Waterfall pouring into the sky */}
          <path 
            d="M 195 85 Q 192 140 188 200 Q 185 270 182 350 L 194 350 Q 198 270 200 200 Q 202 140 203 85 Z" 
            fill="url(#waterfallGrad)" 
            opacity="0.85" 
          />
          {/* Waterfall Mist particles at termination */}
          <ellipse cx="188" cy="350" rx="20" ry="8" fill="#ffffff" opacity="0.6" filter="blur(2px)" />

          {/* Detached floating miniature rock clusters */}
          <polygon points="340,140 355,145 350,165 335,158" fill="#78716c" opacity="0.8" />
          <polygon points="20,160 32,165 28,180 15,172" fill="#78716c" opacity="0.75" />
          <polygon points="160,285 170,290 166,305 156,298" fill="#57534e" opacity="0.7" />
        </g>

        {/* 2.11 FLOATING ISLAND 2: Crystal Mana Monolith Isle (Upper Center-Right) */}
        <g transform="translate(1080, 180)" filter="drop-shadow(0 15px 20px rgba(0,0,0,0.12))">
          {/* Island Body */}
          <polygon 
            points="30,70 190,55 220,80 170,145 130,195 105,160 30,105" 
            fill="url(#islandRockGrad2)" 
          />
          {/* Verdant Surface */}
          <ellipse cx="120" cy="65" rx="95" ry="16" fill="#a7f3d0" />
          <ellipse cx="120" cy="63" rx="85" ry="13" fill="#6ee7b7" />

          {/* Giant Radiant Mana Crystal Spire */}
          <polygon points="115,0 128,62 102,62" fill="#38bdf8" opacity="0.85" />
          <polygon points="115,0 135,35 128,62" fill="#0284c7" opacity="0.7" />
          <polygon points="115,0 102,62 95,35" fill="#7dd3fc" opacity="0.9" />
          {/* Crystal Glow Halo */}
          <circle cx="115" cy="15" r="18" fill="#bae6fd" opacity="0.6" filter="blur(6px)" />

          {/* Secondary amber crystals */}
          <polygon points="148,35 154,62 142,62" fill="#fbbf24" opacity="0.85" />
          <polygon points="85,42 92,63 80,63" fill="#34d399" opacity="0.85" />

          {/* Floating pebble satellites */}
          <polygon points="235,95 245,100 240,112 230,107" fill="#71717a" opacity="0.8" />
          <polygon points="5,90 15,95 12,106 3,101" fill="#71717a" opacity="0.75" />
        </g>

        {/* 2.12 FLOATING ISLAND 3: Distant Floating Sanctuary (Far Upper Right) */}
        <g transform="translate(1620, 280)" opacity="0.75">
          <polygon points="20,40 120,32 140,50 100,95 80,125 65,100 15,60" fill="url(#islandRockGrad)" />
          <ellipse cx="78" cy="38" rx="60" ry="10" fill="#bef264" />
          {/* Shrine arch silhouette */}
          <path d="M 68 38 L 68 22 Q 78 14 88 22 L 88 38 Z" fill="#e2e8f0" />
          <circle cx="78" cy="18" r="3" fill="#fef08a" />
        </g>
      </svg>

      {/* 3. Celestial Arcane Rings Overlay (Rotating with CSS Animations) */}
      <div className="absolute -top-24 -right-24 w-[520px] h-[520px] rounded-full border border-amber-400/25 border-dashed animate-spin [animation-duration:180s]" />
      <div className="absolute -top-12 -right-12 w-[420px] h-[420px] rounded-full border border-sky-400/35 border-dotted animate-spin [animation-duration:130s] [animation-direction:reverse]" />
      <div className="absolute top-1/4 -left-48 w-[500px] h-[500px] rounded-full border border-amber-300/20 border-dashed animate-spin [animation-duration:220s]" />

      {/* 4. Ambient Floating Mana Particles & Sun Sparkles (Vivid Light Atmosphere) */}
      <div 
        className="absolute top-[10%] left-[8%] w-3.5 h-3.5 rounded-full bg-amber-400/80 blur-[0.5px] animate-float-slow shadow-[0_0_12px_rgba(251,191,36,0.8)]" 
        style={{ animationDuration: '6.5s' }}
      />
      <div 
        className="absolute top-[18%] right-[14%] w-3 h-3 rounded-full bg-sky-400/70 blur-[0.5px] animate-float-slow shadow-[0_0_10px_rgba(56,189,248,0.7)]" 
        style={{ animationDuration: '8.5s', animationDelay: '1.2s' }}
      />
      <div 
        className="absolute top-[32%] left-[16%] w-2.5 h-2.5 rounded-full bg-emerald-400/70 blur-[0.5px] animate-float-slow shadow-[0_0_10px_rgba(52,211,153,0.7)]" 
        style={{ animationDuration: '9.5s', animationDelay: '2s' }}
      />
      <div 
        className="absolute top-[48%] right-[22%] w-3 h-3 rounded-full bg-yellow-300/85 blur-[0.5px] animate-float-slow shadow-[0_0_12px_rgba(253,224,71,0.8)]" 
        style={{ animationDuration: '7s', animationDelay: '3.5s' }}
      />
      <div 
        className="absolute top-[64%] left-[28%] w-2 h-2 rounded-full bg-purple-400/60 blur-[0.5px] animate-float-slow shadow-[0_0_8px_rgba(192,132,252,0.6)]" 
        style={{ animationDuration: '10s', animationDelay: '0.8s' }}
      />
      <div 
        className="absolute top-[75%] right-[10%] w-3.5 h-3.5 rounded-full bg-amber-300/75 blur-[0.5px] animate-float-slow shadow-[0_0_12px_rgba(252,211,77,0.7)]" 
        style={{ animationDuration: '8s', animationDelay: '2.5s' }}
      />
      <div 
        className="absolute top-[42%] left-[45%] w-2.5 h-2.5 rounded-full bg-sky-300/80 blur-[0.5px] animate-float-slow shadow-[0_0_10px_rgba(125,211,252,0.7)]" 
        style={{ animationDuration: '11s', animationDelay: '4s' }}
      />

      {/* 5. Subtle Vignette & Parchment Warmth Overlay to preserve high text contrast */}
      <div 
        className="absolute inset-0 bg-radial-[circle_at_50%_40%] from-transparent via-white/10 to-amber-900/[0.04] pointer-events-none" 
      />
    </div>
  );
});

FantasyBackground.displayName = 'FantasyBackground';
