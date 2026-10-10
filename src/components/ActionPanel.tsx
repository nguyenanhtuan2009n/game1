import React, { useState, useEffect } from 'react';
import type { TurnChoice, Character } from '../types/game.ts';
import { soundFx } from '../services/soundFx.ts';
import { HYBRID_MAGIC_RECIPES } from '../services/mushokuRules.ts';
import { getOffensiveSkillRepository } from '../services/mushokuCombatEngine.ts';
import { 
  Send, 
  FastForward, 
  Sparkles, 
  Sword, 
  BookOpen, 
  Footprints, 
  Edit3,
  Layers,
  Wand2,
  X,
  Crosshair,
  Zap,
  Heart,
  Shield,
  Compass,
  Users,
  Castle,
  Info
} from 'lucide-react';
import { TimeSkipModal } from './TimeSkipModal.tsx';

interface ActionPanelProps {
  choices: TurnChoice[];
  character?: Character;
  onSelectChoice: (choice: TurnChoice) => void;
  onCustomAction: (actionText: string) => void;
  onOpenCombatHub?: () => void;
  onOpenWorldMap?: () => void;
  onOpenShop?: () => void;
  onOpenInventory?: () => void;
  onOpenSkillTree?: () => void;
  onOpenTimeSkip?: () => void;
  disabled: boolean;
  currentAge: number;
  isInCombat?: boolean;
}

type SandboxTab = 'all' | 'explore' | 'combat' | 'cultivation' | 'factions' | 'settlement';

export const ActionPanel: React.FC<ActionPanelProps> = ({
  choices,
  character,
  onSelectChoice,
  onCustomAction,
  onOpenCombatHub,
  onOpenWorldMap,
  onOpenShop,
  onOpenInventory,
  onOpenSkillTree,
  onOpenTimeSkip,
  disabled,
  currentAge,
  isInCombat = false,
}) => {
  const [customText, setCustomText] = useState('');
  const [showTimeSkipModal, setShowTimeSkipModal] = useState(false);
  const [showHybridModal, setShowHybridModal] = useState(false);
  const hasChantless = !!character?.magic?.chantless;
  const [castMode, setCastMode] = useState<'chantless' | 'chanting'>(() => hasChantless ? 'chantless' : 'chanting');

  useEffect(() => {
    if (!character?.magic?.chantless && castMode === 'chantless') {
      setCastMode('chanting');
    }
  }, [character?.magic?.chantless]);
  
  // Non-combat sandbox tab
  const [sandboxTab, setSandboxTab] = useState<SandboxTab>('all');

  // Combat role filters & Offensive Sub-Menu (chia ra Ma pháp và Kiếm pháp)
  const [combatRoleFilter, setCombatRoleFilter] = useState<'all' | 'attack' | 'defense' | 'healing' | 'buff' | 'flee'>('all');
  const [offensiveSubFilter, setOffensiveSubFilter] = useState<'magic' | 'sword' | 'all' | 'basic' | 'custom'>('magic');

  // Classified Sandbox Choices
  const exploreChoices = choices.filter(c => 
    c.sandboxCategory === 'explore' || 
    c.category === 'explore' || 
    c.id?.startsWith('travel_') ||
    c.id?.startsWith('sb_explore') || 
    c.id?.startsWith('sb_travel') || 
    c.id?.startsWith('sb_tavern')
  );

  const combatChoices = choices.filter(c => 
    c.sandboxCategory === 'combat' || 
    c.category === 'combat' || 
    c.category === 'hunt' || 
    c.freeCategory === 'hunting' ||
    c.id?.startsWith('sb_dungeon') || 
    c.id?.startsWith('sb_arena') || 
    c.id?.startsWith('sb_boss') ||
    c.id?.includes('combat')
  );

  const cultivationChoices = choices.filter(c => 
    c.sandboxCategory === 'cultivation' || 
    c.sandboxCategory === 'seclusion' || 
    c.category === 'sword' || 
    c.category === 'magic' || 
    c.category === 'timeskip' || 
    c.freeCategory === 'training' || 
    c.freeCategory === 'power_up' ||
    c.id?.startsWith('sb_train') || 
    c.id?.startsWith('sb_seclusion') ||
    c.id === 'timeskip_year'
  );

  const factionChoices = choices.filter(c => 
    c.sandboxCategory === 'factions' || 
    c.sandboxCategory === 'companions' || 
    c.category === 'social' || 
    c.freeCategory === 'family' ||
    c.id?.startsWith('sb_faction') || 
    c.id?.startsWith('sb_companion')
  );

  const settlementChoices = choices.filter(c => 
    c.sandboxCategory === 'settlement' || 
    c.sandboxCategory === 'trade' || 
    c.category === 'trade' || 
    c.freeCategory === 'crafting' || 
    c.freeCategory === 'research' || 
    c.id?.startsWith('sb_stronghold') || 
    c.id?.startsWith('sb_trade') || 
    c.id?.startsWith('sb_craft')
  );

  // Combat choices filtering & Skill Repository integration
  const hasCombatBranches = isInCombat && (choices.some(c => c.combatBranch || c.combatRole) || !!character?.combat?.inCombat);
  const healingChoices = choices.filter(c => c.combatRole === 'healing');
  const defenseChoices = choices.filter(c => c.combatRole === 'defense');
  const buffChoices = choices.filter(c => c.combatRole === 'buff');
  const fleeChoices = choices.filter(c => c.combatRole === 'flee' || c.combatBranch === 'C_RETREAT');

  // Load all offensive skills from repository if character exists
  const opp = character?.combat?.opponent || {
    id: 'opp_field',
    name: 'Đối thủ',
    title: 'Kẻ địch',
    type: 'monster' as const,
    powerTier: 'Sơ cấp (Beginner)' as const,
    hpCurrent: 100,
    hpMax: 100,
    touki: 20,
    mana: 20,
    status: 'Đang chiến đấu',
    distance: 'Cận chiến (0-2m)' as const,
    description: 'Đối thủ trên chiến trường',
  };

  const repoSkills = (isInCombat && character) ? getOffensiveSkillRepository(character, opp) : [];
  
  // Merge all attack choices cleanly
  const attackChoicesMap = new Map<string, TurnChoice>();
  repoSkills.forEach(s => attackChoicesMap.set(s.id, s));
  choices.forEach(c => {
    if (c.combatRole === 'attack' || (c.combatBranch === 'A_OFFENSE' && c.combatRole !== 'menu')) {
      if (!attackChoicesMap.has(c.id)) {
        attackChoicesMap.set(c.id, c);
      }
    }
  });

  const attackChoices = Array.from(attackChoicesMap.values());

  const magicAttackChoices = attackChoices.filter(c => 
    c.offensiveGroup === 'magic' || 
    c.category === 'magic' || 
    c.combatSubCategory?.includes('Ma Pháp') || 
    c.label?.includes('Ma Pháp') ||
    c.id?.startsWith('skill_fire') ||
    c.id?.startsWith('skill_water') ||
    c.id?.startsWith('skill_earth') ||
    c.id?.startsWith('skill_wind') ||
    c.id?.startsWith('skill_combo_')
  );

  const swordAttackChoices = attackChoices.filter(c => 
    c.offensiveGroup === 'sword' || 
    c.category === 'sword' || 
    c.combatSubCategory?.includes('Kiếm') || 
    c.label?.includes('Kiếm') ||
    c.id?.startsWith('skill_sword') ||
    c.id?.startsWith('skill_north') ||
    c.id?.startsWith('skill_combo_magic_sword')
  );

  const basicAttackChoices = attackChoices.filter(c => 
    c.offensiveGroup === 'basic' || 
    c.offensiveSubCategory === 'basic' ||
    c.id?.startsWith('basic_') ||
    (!c.costMp && (c.costStamina || 0) <= 5 && !c.costTouki)
  );

  const customAttackChoices = choices.filter(c => 
    c.offensiveSubCategory === 'custom' || c.id?.includes('custom') || c.id?.includes('free')
  );

  const filteredChoices = (() => {
    if (isInCombat) {
      if (combatRoleFilter === 'healing') return healingChoices.length > 0 ? healingChoices : choices;
      if (combatRoleFilter === 'defense') return defenseChoices.length > 0 ? defenseChoices : choices;
      if (combatRoleFilter === 'buff') return buffChoices.length > 0 ? buffChoices : choices;
      if (combatRoleFilter === 'flee') return fleeChoices.length > 0 ? fleeChoices : choices;

      if (combatRoleFilter === 'attack') {
        if (offensiveSubFilter === 'magic') {
          return magicAttackChoices.length > 0 ? magicAttackChoices : attackChoices;
        }
        if (offensiveSubFilter === 'sword') {
          return swordAttackChoices.length > 0 ? swordAttackChoices : attackChoices;
        }
        if (offensiveSubFilter === 'basic') {
          return basicAttackChoices.length > 0 ? basicAttackChoices : attackChoices;
        }
        if (offensiveSubFilter === 'custom') {
          return customAttackChoices.length > 0 ? customAttackChoices : attackChoices;
        }
        return attackChoices.length > 0 ? attackChoices : choices;
      }

      if (combatRoleFilter === 'all') {
        return choices.length > 0 ? choices : attackChoices;
      }

      return choices;
    }

    // Ngoài giao tranh: Lọc theo Tab Sandbox RPG
    if (sandboxTab === 'explore') return exploreChoices.length > 0 ? exploreChoices : choices;
    if (sandboxTab === 'combat') return combatChoices.length > 0 ? combatChoices : choices;
    if (sandboxTab === 'cultivation') return cultivationChoices.length > 0 ? cultivationChoices : choices;
    if (sandboxTab === 'factions') return factionChoices.length > 0 ? factionChoices : choices;
    if (sandboxTab === 'settlement') return settlementChoices.length > 0 ? settlementChoices : choices;
    return choices;
  })();

  const handleChoiceClick = (choice: TurnChoice) => {
    if (disabled) return;

    if (choice.id === 'timeskip_year' || choice.category === 'timeskip') {
      soundFx.playParchmentTurn();
      if (onOpenTimeSkip) {
        onOpenTimeSkip();
        return;
      }
      setShowTimeSkipModal(true);
      return;
    }

    if (choice.category === 'magic' || choice.combatTactic === 'hybrid_magic') {
      soundFx.playMagicCast();
    } else if (choice.category === 'sword' || choice.combatTactic === 'rush' || choice.combatTactic === 'counter') {
      soundFx.playSwordClash();
    } else {
      soundFx.playParchmentTurn();
    }

    // Append casting mode prefix if magical choice
    let finalAction = choice.actionText || choice.label || '';
    if (choice.category === 'magic' || choice.combatTactic === 'kite_magic' || choice.combatTactic === 'hybrid_magic') {
      const lower = finalAction.toLowerCase();
      if (castMode === 'chanting' && !lower.includes('xướng ngôn')) {
        finalAction = `[Xướng ngôn Thần chú - Tăng 40% uy lực]: ${finalAction}`;
      } else if (castMode === 'chantless' && hasChantless && !lower.includes('vô niệm')) {
        finalAction = `[Vô niệm chú - Thi triển tức thì]: ${finalAction}`;
      }
    }

    onSelectChoice({
      ...choice,
      actionText: finalAction,
    });
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customText.trim() || disabled) return;

    soundFx.playParchmentTurn();

    let textToSend = customText.trim();
    if (isInCombat) {
      const lower = textToSend.toLowerCase();
      if (castMode === 'chanting' && !lower.includes('xướng ngôn')) {
        textToSend = `[Xướng ngôn Thần chú]: ${textToSend}`;
      } else if (castMode === 'chantless' && hasChantless && !lower.includes('vô niệm')) {
        textToSend = `[Vô niệm chú]: ${textToSend}`;
      }
    }

    onCustomAction(textToSend);
    setCustomText('');
  };

  const handleApplyHybridMagic = (recipe: typeof HYBRID_MAGIC_RECIPES[0]) => {
    setShowHybridModal(false);
    soundFx.playMagicCast();
    const action = `Vô niệm chú: Ma pháp ghép ${recipe.name} (${recipe.elements.join(' + ')}) - ${recipe.description}. Tác động: ${recipe.effect}`;
    onCustomAction(action);
  };

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case 'magic':
        return <Sparkles className="w-3.5 h-3.5 text-cyan-600" />;
      case 'sword':
        return <Sword className="w-3.5 h-3.5 text-rose-600" />;
      case 'combat':
        return <Crosshair className="w-3.5 h-3.5 text-rose-600" />;
      case 'study':
        return <BookOpen className="w-3.5 h-3.5 text-amber-600" />;
      case 'timeskip':
        return <FastForward className="w-3.5 h-3.5 text-yellow-600" />;
      case 'explore':
        return <Compass className="w-3.5 h-3.5 text-emerald-600" />;
      case 'social':
        return <Users className="w-3.5 h-3.5 text-purple-600" />;
      case 'trade':
        return <Castle className="w-3.5 h-3.5 text-amber-700" />;
      default:
        return <Footprints className="w-3.5 h-3.5 text-stone-600" />;
    }
  };

  const getRiskBadge = (risk?: string) => {
    switch (risk) {
      case 'fatal':
      case 'dangerous':
        return (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-900 border border-rose-300 font-mono font-semibold">
            Nguy Hiểm
          </span>
        );
      case 'moderate':
        return (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-950 border border-amber-300 font-mono font-medium">
            Thử Thách
          </span>
        );
      default:
        return (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 font-mono">
            An Toàn
          </span>
        );
    }
  };

  const getRoleBadge = (choice: TurnChoice) => {
    if (choice.combatRole === 'healing') {
      return (
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-pink-100 text-pink-900 border border-pink-300 font-bold flex items-center gap-1 shadow-2xs">
          <Heart className="w-3 h-3 text-pink-600 fill-pink-500" /> Hồi Phục
        </span>
      );
    }
    if (choice.combatRole === 'defense') {
      return (
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-100 text-sky-900 border border-sky-300 font-bold flex items-center gap-1 shadow-2xs">
          <Shield className="w-3 h-3 text-sky-600 fill-sky-500" /> Phòng Thủ
        </span>
      );
    }
    if (choice.combatRole === 'buff') {
      return (
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-bold flex items-center gap-1 shadow-2xs">
          <Zap className="w-3 h-3 text-amber-600 fill-amber-500" /> Cường Hóa
        </span>
      );
    }
    if (choice.combatRole === 'attack') {
      return (
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-100 text-rose-900 border border-rose-300 font-bold flex items-center gap-1 shadow-2xs">
          <Sword className="w-3 h-3 text-rose-600" /> Tấn Công {choice.damageDisplay ? `[${choice.damageDisplay}]` : ''}
        </span>
      );
    }
    if (choice.combatRole === 'flee') {
      return (
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-stone-100 text-stone-800 border border-stone-300 font-bold flex items-center gap-1 shadow-2xs">
          <Footprints className="w-3 h-3 text-stone-600" /> Bỏ Chạy
        </span>
      );
    }
    return null;
  };

  return (
    <div className="bg-white/95 border border-amber-300/80 rounded-2xl p-4 sm:p-5 shadow-[0_12px_40px_rgba(217,119,6,0.12)] space-y-4 backdrop-blur-xl relative text-stone-900">
      {/* Decorative Corner Accents */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-amber-500 pointer-events-none" />
      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-amber-500 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-amber-500 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-amber-500 pointer-events-none" />

      {/* Header Controls: Choices & Mode selectors */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-amber-200 pb-3">
        <h2 className="text-xs sm:text-sm font-cinzel font-bold uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-950 via-amber-900 to-stone-900 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span>[QUYẾT ĐỊNH &amp; HÀNH ĐỘNG TIẾP THEO]</span>
        </h2>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Casting Mode Selector */}
          <div className="flex items-center bg-stone-100 rounded-xl p-0.5 border border-stone-200 text-[11px] font-mono">
            <button
              type="button"
              onClick={() => setCastMode('chantless')}
              className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1 cursor-pointer ${
                castMode === 'chantless'
                  ? 'bg-amber-100 text-amber-950 font-bold border border-amber-400 shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <span>⚡ Vô Niệm (Tức thì)</span>
            </button>
            <button
              type="button"
              onClick={() => setCastMode('chanting')}
              className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1 cursor-pointer ${
                castMode === 'chanting'
                  ? 'bg-blue-100 text-blue-950 font-bold border border-blue-400 shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <span>📜 Xướng Ngôn (+40%)</span>
            </button>
          </div>

          {/* Hybrid Magic Recipe Crafter Button */}
          <button
            type="button"
            onClick={() => setShowHybridModal(true)}
            className="text-xs px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-300 flex items-center gap-1.5 transition cursor-pointer shadow-2xs hover:scale-102 font-medium"
          >
            <Layers className="w-3.5 h-3.5 text-sky-600" /> 
            <span>Ma Pháp Ghép</span>
          </button>

          {/* Combat Hub Button */}
          {!isInCombat && onOpenCombatHub && (
            <button
              type="button"
              onClick={onOpenCombatHub}
              disabled={disabled}
              className="text-xs px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs hover:scale-102"
            >
              <Crosshair className="w-3.5 h-3.5 text-yellow-200 animate-pulse" />
              <span>Sảnh Khiêu Chiến</span>
            </button>
          )}

          {/* World Map & Fast Travel Button */}
          {!isInCombat && onOpenWorldMap && (
            <button
              type="button"
              onClick={onOpenWorldMap}
              disabled={disabled}
              className="text-xs px-3 py-1.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs hover:scale-102"
              title="Bản Đồ Thế Giới Sáu Mặt & Dịch Chuyển Nhanh"
            >
              <Compass className="w-3.5 h-3.5 text-teal-200 animate-spin-slow" />
              <span>Bản Đồ &amp; Dịch Chuyển</span>
            </button>
          )}

          {/* Tua nhanh 1 năm */}
          <button
            type="button"
            onClick={() => {
              if (onOpenTimeSkip) {
                onOpenTimeSkip();
              } else {
                setShowTimeSkipModal(true);
              }
            }}
            disabled={disabled}
            className="text-xs px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-stone-950 border border-amber-300 font-bold flex items-center gap-1.5 transition cursor-pointer hover:scale-102 shadow-xs"
            title="Tua nhanh thời gian 1 năm: Bế quan tu luyện (Kiếm Pháp, Ma Pháp, Thân Thể)"
          >
            <FastForward className="w-3.5 h-3.5 text-stone-950 animate-pulse" />
            <span>Tua Nhanh 1 Năm</span>
          </button>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* PHÂN HỆ SANDBOX NGOÀI GIAO TRANH: CÁC NHÓM HOẠT ĐỘNG RPG TỰ DO       */}
      {/* ===================================================================== */}
      {!isInCombat && (
        <div className="space-y-2">
          {/* Main Sandbox Categories Switcher */}
          <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-gradient-to-r from-stone-900 via-stone-950 to-stone-900 rounded-2xl border border-amber-600/30 shadow-md">
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setSandboxTab('all');
              }}
              className={`py-2 px-3 rounded-xl text-xs font-cinzel font-bold transition-all cursor-pointer flex items-center gap-1.5 btn-tactile ${
                sandboxTab === 'all'
                  ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-stone-950 shadow-md'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800/80'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>TẤT CẢ ({choices.length})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setSandboxTab('explore');
              }}
              className={`py-2 px-3 rounded-xl text-xs font-cinzel font-bold transition-all cursor-pointer flex items-center gap-1.5 btn-tactile ${
                sandboxTab === 'explore'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800/80'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>KHÁM PHÁ ({exploreChoices.length})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setSandboxTab('combat');
              }}
              className={`py-2 px-3 rounded-xl text-xs font-cinzel font-bold transition-all cursor-pointer flex items-center gap-1.5 btn-tactile ${
                sandboxTab === 'combat'
                  ? 'bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-md'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800/80'
              }`}
            >
              <Sword className="w-3.5 h-3.5" />
              <span>HẦM NGỤC &amp; ĐẤU TRƯỜNG ({combatChoices.length})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setSandboxTab('cultivation');
              }}
              className={`py-2 px-3 rounded-xl text-xs font-cinzel font-bold transition-all cursor-pointer flex items-center gap-1.5 btn-tactile ${
                sandboxTab === 'cultivation'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800/80'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>TU LUYỆN ({cultivationChoices.length})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setSandboxTab('factions');
              }}
              className={`py-2 px-3 rounded-xl text-xs font-cinzel font-bold transition-all cursor-pointer flex items-center gap-1.5 btn-tactile ${
                sandboxTab === 'factions'
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800/80'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>THẾ LỰC &amp; ĐỒNG ĐỘI ({factionChoices.length})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setSandboxTab('settlement');
              }}
              className={`py-2 px-3 rounded-xl text-xs font-cinzel font-bold transition-all cursor-pointer flex items-center gap-1.5 btn-tactile ${
                sandboxTab === 'settlement'
                  ? 'bg-gradient-to-r from-amber-600 to-yellow-600 text-white shadow-md'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800/80'
              }`}
            >
              <Castle className="w-3.5 h-3.5" />
              <span>CĂN CỨ &amp; CHẾ TÁC ({settlementChoices.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* PHÂN HỆ GIAO TRANH: 5 VAI TRÒ CHIẾN ĐẤU (ATTACK, DEF, HEAL, BUFF, FLEE)*/}
      {/* ===================================================================== */}
      {hasCombatBranches && (
        <div className="flex flex-wrap items-center gap-1.5 p-2 bg-gradient-to-r from-stone-50 via-amber-50/50 to-orange-50/60 rounded-xl border border-amber-200/90 text-xs font-vietnam shadow-inner">
          <span className="text-[11px] font-bold text-amber-950 px-1.5 flex items-center gap-1 font-mono uppercase tracking-wide">
            <Sword className="w-3.5 h-3.5 text-rose-600" />
            Nhóm Hành Động:
          </span>
          <button
            type="button"
            onClick={() => setCombatRoleFilter('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
              combatRoleFilter === 'all'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white text-stone-700 hover:bg-amber-100 border border-stone-200'
            }`}
          >
            🌟 Tất Cả ({choices.length})
          </button>
          <button
            type="button"
            onClick={() => {
              setCombatRoleFilter('attack');
              setOffensiveSubFilter('all');
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
              combatRoleFilter === 'attack'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-white text-rose-900 hover:bg-rose-50 border border-rose-200'
            }`}
          >
            ⚔️ Tấn Công ({attackChoices.length})
          </button>
          <button
            type="button"
            onClick={() => setCombatRoleFilter('defense')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
              combatRoleFilter === 'defense'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-white text-sky-900 hover:bg-sky-50 border border-sky-200'
            }`}
          >
            🛡️ Phòng Thủ ({defenseChoices.length})
          </button>
          <button
            type="button"
            onClick={() => setCombatRoleFilter('healing')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
              combatRoleFilter === 'healing'
                ? 'bg-pink-600 text-white shadow-xs'
                : 'bg-white text-pink-900 hover:bg-pink-50 border border-pink-200'
            }`}
          >
            💖 Hồi Phục ({healingChoices.length})
          </button>
          <button
            type="button"
            onClick={() => setCombatRoleFilter('buff')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
              combatRoleFilter === 'buff'
                ? 'bg-amber-700 text-white shadow-xs'
                : 'bg-white text-amber-900 hover:bg-amber-50 border border-amber-200'
            }`}
          >
            ⚡ Cường Hóa ({buffChoices.length})
          </button>
          <button
            type="button"
            onClick={() => setCombatRoleFilter('flee')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
              combatRoleFilter === 'flee'
                ? 'bg-stone-800 text-white shadow-xs'
                : 'bg-white text-stone-800 hover:bg-stone-100 border border-stone-300'
            }`}
          >
            🏃 Bỏ Chạy ({fleeChoices.length})
          </button>
        </div>
      )}

      {/* Offensive Sub-Menu: CHIA RA MA PHÁP VÀ KIẾM PHÁP */}
      {hasCombatBranches && (combatRoleFilter === 'attack' || combatRoleFilter === 'all') && (
        <div className="space-y-2 p-3 bg-gradient-to-r from-rose-50/90 via-amber-50/70 to-sky-50/90 border border-amber-300/80 rounded-2xl shadow-xs text-xs font-vietnam">
          <div className="flex items-center justify-between flex-wrap gap-2 pb-1.5 border-b border-amber-200/80">
            <span className="font-bold text-amber-950 flex items-center gap-1.5 text-xs font-mono uppercase">
              <Zap className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
              Mục Tấn Công: Phân Nhánh Kỹ Năng &amp; Xuất Chiêu
            </span>
            <span className="text-[10px] text-stone-600 italic">
              Tất cả kỹ năng đã học trong mục skills đều hiển thị đầy đủ tại đây
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                soundFx.playParchmentTurn();
                setCombatRoleFilter('attack');
                setOffensiveSubFilter('magic');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                combatRoleFilter === 'attack' && offensiveSubFilter === 'magic'
                  ? 'bg-sky-600 text-white shadow-sm ring-2 ring-sky-300'
                  : 'bg-white text-sky-900 hover:bg-sky-50 border border-sky-300'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-sky-300" />
              <span>🔮 Ma Pháp ({magicAttackChoices.length})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundFx.playParchmentTurn();
                setCombatRoleFilter('attack');
                setOffensiveSubFilter('sword');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                combatRoleFilter === 'attack' && offensiveSubFilter === 'sword'
                  ? 'bg-amber-600 text-white shadow-sm ring-2 ring-amber-300'
                  : 'bg-white text-amber-950 hover:bg-amber-50 border border-amber-300'
              }`}
            >
              <Sword className="w-3.5 h-3.5 text-amber-300" />
              <span>🗡️ Kiếm Pháp ({swordAttackChoices.length})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundFx.playParchmentTurn();
                setCombatRoleFilter('attack');
                setOffensiveSubFilter('all');
              }}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                combatRoleFilter === 'attack' && offensiveSubFilter === 'all'
                  ? 'bg-rose-700 text-white shadow-sm font-bold'
                  : 'bg-white text-rose-950 hover:bg-rose-50 border border-rose-300'
              }`}
            >
              🌟 Tất Cả Kỹ Năng ({attackChoices.length})
            </button>

            <button
              type="button"
              onClick={() => {
                soundFx.playParchmentTurn();
                setCombatRoleFilter('attack');
                setOffensiveSubFilter('basic');
              }}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                combatRoleFilter === 'attack' && offensiveSubFilter === 'basic'
                  ? 'bg-stone-800 text-white shadow-sm font-bold'
                  : 'bg-white text-stone-800 hover:bg-stone-100 border border-stone-300'
              }`}
            >
              👊 Đòn Đánh Thường ({basicAttackChoices.length})
            </button>

            <button
              type="button"
              onClick={() => {
                soundFx.playParchmentTurn();
                setCombatRoleFilter('attack');
                setOffensiveSubFilter('custom');
              }}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                combatRoleFilter === 'attack' && offensiveSubFilter === 'custom'
                  ? 'bg-purple-700 text-white shadow-sm font-bold'
                  : 'bg-white text-purple-950 hover:bg-purple-50 border border-purple-300'
              }`}
            >
              🎭 Tùy Ý ({customAttackChoices.length})
            </button>
          </div>
        </div>
      )}

      {/* Choice Action Cards Grid */}
      {filteredChoices.length === 0 ? (
        <div className="p-6 rounded-2xl bg-amber-50/60 border border-amber-200/80 text-center">
          <p className="text-stone-700 text-xs sm:text-sm font-medium mb-3">
            Chưa có hành động cụ thể nào trong danh mục này. Bạn có thể chuyển lại tab &quot;Tất Cả&quot; hoặc tự do hành động!
          </p>
          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              setSandboxTab('all');
              setCombatRoleFilter('all');
            }}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-xs transition cursor-pointer"
          >
            🧭 Hiển Thị Toàn Bộ Lựa Chọn
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredChoices.map((choice, idx) => {
            return (
              <button
                key={`choice_${choice.id || 'c'}_${idx}`}
                disabled={disabled}
                onClick={() => handleChoiceClick(choice)}
                className="group text-left p-4 rounded-xl transition-all duration-200 flex flex-col justify-between gap-2.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed btn-tactile hover:scale-[1.012] active:scale-[0.985] shadow-xs hover:shadow-md border border-stone-200/90 bg-white hover:border-amber-400 hover:bg-amber-50/30"
              >
                {/* Top Row: Index, Title & Badges */}
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs sm:text-sm font-cinzel font-bold text-stone-900 group-hover:text-amber-950 transition-colors flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg flex items-center justify-center text-xs shrink-0 font-mono font-bold bg-amber-100 border border-amber-300 text-amber-950 shadow-2xs">
                      {idx + 1}
                    </span>
                    <span className="line-clamp-1">{choice.label}</span>
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                    {choice.sandboxCategory && (
                      <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-800 border border-stone-300 font-mono text-[9px] font-bold">
                        {choice.sandboxCategory === 'explore' && '🗺️ Khám Phá'}
                        {choice.sandboxCategory === 'combat' && '⚔️ Khiêu Chiến'}
                        {choice.sandboxCategory === 'cultivation' && '🔮 Tu Luyện'}
                        {choice.sandboxCategory === 'factions' && '🤝 Thế Lực'}
                        {choice.sandboxCategory === 'companions' && '👥 Đồng Đội'}
                        {choice.sandboxCategory === 'settlement' && '🏰 Căn Cứ'}
                        {choice.sandboxCategory === 'trade' && '💰 Giao Thương'}
                        {choice.sandboxCategory === 'seclusion' && '⚡ Bế Quan'}
                      </span>
                    )}
                    {getRoleBadge(choice)}
                    {getRiskBadge(choice.riskLevel)}
                  </div>
                </div>

                {/* Action Description */}
                <div className="text-xs text-stone-700 group-hover:text-stone-900 font-vietnam line-clamp-2 leading-relaxed pl-8">
                  {choice.actionText}
                </div>

                {/* Consequence Hint / Informational Callout */}
                {choice.consequenceHint && (
                  <div className="text-[10.5px] text-amber-950 bg-amber-50/80 border border-amber-200/80 rounded-lg py-1 px-2.5 font-vietnam flex items-center gap-1.5 ml-8 shadow-2xs">
                    <Info className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                    <span className="line-clamp-2">{choice.consequenceHint}</span>
                  </div>
                )}

                {/* Bottom Metadata & Resource Cost Badges */}
                <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] text-stone-500 font-mono mt-1 pt-2 border-t border-stone-100 group-hover:border-amber-200 pl-8">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {getCategoryIcon(choice.category)}
                    <span className="capitalize text-stone-700 font-vietnam text-[11px] font-medium">{choice.category || 'Hành động'}</span>

                    {choice.healHp !== undefined && choice.healHp > 0 && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-pink-100 text-pink-900 border border-pink-300 font-bold">
                        💚 +{choice.healHp} HP
                      </span>
                    )}
                    {choice.healStamina !== undefined && choice.healStamina > 0 && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold">
                        💪 +{choice.healStamina} Thể Lực
                      </span>
                    )}
                    {choice.buffTouki !== undefined && choice.buffTouki > 0 && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 font-bold">
                        🛡️ +{choice.buffTouki} Đấu Khí
                      </span>
                    )}
                    {choice.buffReflex !== undefined && choice.buffReflex > 0 && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-100 text-cyan-900 border border-cyan-300 font-bold">
                        ⚡ +{choice.buffReflex} Phản Xạ
                      </span>
                    )}

                    {/* Resource Costs */}
                    {choice.costMp !== undefined && choice.costMp > 0 && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-300 font-bold">
                        ⚡ {choice.costMp} MP
                      </span>
                    )}
                    {choice.costStamina !== undefined && choice.costStamina > 0 && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold">
                        💪 {choice.costStamina} Thể Lực
                      </span>
                    )}
                    {choice.damageDisplay && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-100 text-rose-900 border border-rose-300 font-bold">
                        💥 {choice.damageDisplay}
                      </span>
                    )}
                    {choice.offensiveGroup === 'magic' && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-100 text-sky-900 border border-sky-300 font-semibold">
                        🔮 Ma Pháp
                      </span>
                    )}
                    {choice.offensiveGroup === 'sword' && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 font-semibold">
                        🗡️ Kiếm Pháp
                      </span>
                    )}
                  </div>

                  {choice.combatTactic && (
                    <span className="text-rose-800 font-vietnam font-semibold text-[11px] bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                      {choice.combatTactic}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Custom Action Free-Text Input */}
      <div className="pt-3 border-t border-amber-200 space-y-2.5">
        <form onSubmit={handleCustomSubmit} className="space-y-2">
          <label className="text-xs font-medium text-stone-700 flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-vietnam">
              <Edit3 className="w-3.5 h-3.5 text-amber-600" />
              <strong className="text-amber-950 font-bold">[Hành Động Tùy Ý]</strong> - Tự do nhập quyết định của riêng bạn (Sandbox GM sẽ phản hồi):
            </span>
            <span className="text-[10px] font-mono text-stone-500">
              Thi triển: <strong className="text-amber-900">{castMode === 'chantless' ? 'Vô niệm chú' : 'Xướng ngôn'}</strong>
            </span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={customText}
              disabled={disabled}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="VD: Tiến vào rừng tìm thảo dược hiếm, mở gian hàng buôn bán ma thạch, hoặc chiêu mộ thợ rèn..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-500 focus:bg-white focus:ring-1 focus:ring-amber-500 text-xs sm:text-sm font-vietnam transition-all shadow-inner"
            />
            <button
              type="submit"
              disabled={disabled || !customText.trim()}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white font-cinzel font-bold text-xs sm:text-sm flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:scale-102"
            >
              <Send className="w-4 h-4" />
              <span>Gửi</span>
            </button>
          </div>

          {/* Tactical Quick Suggestions */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-amber-900 font-mono text-[10px] font-bold">Gợi ý nhanh:</span>
            <button
              type="button"
              disabled={disabled}
              onClick={() => onCustomAction((character?.stats?.touki || 0) > 0 ? 'Vận Đấu Khí bảo vệ toàn thân, tập trung phòng thủ và thám sát' : 'Vào thế phòng thủ cẩn trọng, tập trung bảo vệ các yếu huyệt')}
              className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-vietnam text-[11px] cursor-pointer transition"
            >
              {(character?.stats?.touki || 0) > 0 ? '🛡️ Vận Đấu Khí' : '🛡️ Thủ Thế Phòng Ngự'}
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={() => onCustomAction(hasChantless ? 'Thi triển ma pháp vô niệm chú phóng Đạn Đá thăm dò' : 'Tập trung niệm chú ma pháp thăm dò đối thủ')}
              className="px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-300 font-vietnam text-[11px] cursor-pointer transition"
            >
              {hasChantless ? '⚡ Đạn Đá Vô Niệm' : '✨ Niệm Phép Thăm Dò'}
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={() => onCustomAction('Vào thế kiếm chuẩn bị phản kích thần tốc')}
              className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 font-vietnam text-[11px] cursor-pointer transition"
            >
              🗡️ Thế Kiếm Phản Kích
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={() => onCustomAction('Thám sát địa hình xung quanh, tìm điểm sơ hở hoặc lối đi an toàn')}
              className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 font-vietnam text-[11px] cursor-pointer transition"
            >
              🔍 Thám Sát Địa Hình
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={() => onCustomAction('Bình tĩnh đối thoại, dò xét thái độ và mục đích của đối phương')}
              className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-300 font-vietnam text-[11px] cursor-pointer transition"
            >
              💬 Đối Thoại &amp; Đàm Phán
            </button>
          </div>
        </form>
      </div>

      {/* Hybrid Magic Crafter Modal */}
      {showHybridModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-sm">
          <div className="bg-stone-900 border border-cyan-800/80 rounded-2xl max-w-lg w-full p-5 shadow-2xl text-stone-200 space-y-4">
            <div className="flex items-center justify-between border-b border-cyan-900/40 pb-3">
              <div className="flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-cyan-400" />
                <h3 className="font-serif font-bold text-base text-cyan-200">
                  Phòng Thí Nghiệm Ma Pháp Ghép (Hybrid Magic)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowHybridModal(false)}
                className="text-stone-400 hover:text-stone-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed">
              Theo nguyên lý ma pháp đại lục, người chơi có thể kết hợp hai hoặc nhiều nguyên tố tự nhiên để tạo ra hiện tượng ma thuật mới khắc chế đối thủ:
            </p>

            <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
              {HYBRID_MAGIC_RECIPES.map((recipe) => (
                <div
                  key={recipe.id}
                  className="p-3 rounded-xl bg-stone-950 border border-stone-800 hover:border-cyan-600/70 transition space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-serif font-bold text-xs text-cyan-300">
                      {recipe.name}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-400">
                      {recipe.elements.join(' + ')}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-300">{recipe.description}</p>
                  <div className="text-[10px] text-amber-300 font-mono italic">
                    ⚡ Hiệu quả: {recipe.effect}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleApplyHybridMagic(recipe)}
                    className="w-full mt-2 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 text-cyan-200 font-serif font-bold text-xs border border-cyan-700/60 transition cursor-pointer"
                  >
                    Khai Triển Ma Pháp Này Ngay
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Time Skip Modal */}
      <TimeSkipModal
        isOpen={showTimeSkipModal}
        onClose={() => setShowTimeSkipModal(false)}
        onConfirm={(_type, actionText) => {
          onCustomAction(actionText);
        }}
        currentAge={currentAge}
        isInCombat={isInCombat}
      />
    </div>
  );
};
