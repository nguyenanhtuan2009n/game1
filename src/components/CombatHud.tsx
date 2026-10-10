import type { CombatState, Character } from '../types/game.ts';
import { 
  ShieldAlert, 
  Target, 
  Footprints, 
  Sparkles, 
  Sword, 
  Flame, 
  AlertTriangle,
  Zap,
  Activity,
  Award
} from 'lucide-react';

interface CombatHudProps {
  combat: CombatState;
  character?: Character;
  onQuickTactic?: (actionText: string) => void;
  disabled?: boolean;
}

export const CombatHud: React.FC<CombatHudProps> = ({
  combat,
  character,
  onQuickTactic,
  disabled,
}) => {
  const { opponent, phase, phaseName, terrain } = combat;
  const oppHpPercent = Math.max(0, Math.min(100, (opponent.hpCurrent / opponent.hpMax) * 100));

  return (
    <div className="bg-gradient-to-r from-rose-950/85 via-slate-900/90 to-rose-950/85 border-2 border-rose-500/60 rounded-2xl p-4 shadow-[0_0_30px_rgba(244,63,94,0.3)] text-stone-100 space-y-3 font-vietnam relative overflow-hidden animate-turn-in backdrop-blur-xl">
      {/* Top Banner: Combat Phase & Terrain */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-rose-500/30 pb-2.5">
        <div className="flex items-center gap-2.5">
          <span className="p-1.5 rounded-xl bg-rose-500/20 border border-rose-400/60 text-rose-300 shadow-[0_0_10px_rgba(244,63,94,0.4)]">
            <ShieldAlert className="w-4 h-4 animate-bounce" />
          </span>
          <div>
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-300 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
              CHIẾN TRƯỜNG THỰC TẾ • {phaseName}
            </div>
            <div className="text-xs font-cinzel font-bold text-amber-200">
              Địa hình: {terrain}
            </div>
          </div>
        </div>

        {/* 3-Phase Stepper Indicator */}
        <div className="flex items-center gap-1.5 text-[11px] font-mono">
          {[1, 2, 3].map((step) => {
            const isActive = step === phase;
            const isPassed = step < phase;
            return (
              <div
                key={step}
                className={`px-2.5 py-1 rounded-lg border flex items-center gap-1 transition-all ${
                  isActive
                    ? 'bg-rose-600 text-white font-bold border-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.5)]'
                    : isPassed
                    ? 'bg-amber-950/70 text-amber-300 border-amber-600/70 line-through'
                    : 'bg-slate-900 text-stone-500 border-slate-800'
                }`}
              >
                <span>P{step}</span>
                <span className="hidden sm:inline font-vietnam">
                  {step === 1 ? 'Thăm dò' : step === 2 ? 'Va chạm' : 'Đoạt mệnh'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Player's Epithet & Intimidation Aura in Combat */}
      {character?.reputation && (
        <div className="flex flex-wrap items-center justify-between gap-1.5 px-3 py-1.5 rounded-xl bg-amber-950/70 border border-amber-500/50 text-[11px]">
          <div className="flex items-center gap-1.5 text-amber-200">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>Biệt danh: <strong className="text-amber-100 font-serif">"{character.reputation.currentEpithet}"</strong></span>
            <span className="text-[10px] text-stone-400">({character.reputation.socialStanding})</span>
          </div>
          <div className="flex items-center gap-2 font-mono text-[10px]">
            <span className="text-stone-300">Khí thế uy áp: <strong className="text-rose-400">{character.reputation.fearFactor}/100</strong></span>
            {character.reputation.fearFactor >= 35 && (
              <span className="px-1.5 py-0.5 rounded bg-rose-900/80 text-rose-200 border border-rose-500 text-[9px] font-bold">
                ⚡ Áp đảo tinh thần
              </span>
            )}
          </div>
        </div>
      )}

      {/* Opponent Dossier Card */}
      <div className="bg-slate-950/80 border border-rose-500/30 rounded-xl p-3 grid grid-cols-1 sm:grid-cols-2 gap-3 shadow-inner">
        <div>
          <div className="flex items-center justify-between flex-wrap gap-1">
            <span className="font-cinzel font-bold text-sm text-rose-300 flex items-center gap-1.5">
              <Target className="w-4 h-4 text-rose-400" />
              {opponent.name}
            </span>
            <div className="flex items-center gap-1">
              {opponent.personality && (
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-bold ${
                  opponent.personality === 'bloodthirsty'
                    ? 'bg-red-950 border-red-500 text-red-200'
                    : opponent.personality === 'cunning'
                    ? 'bg-purple-950 border-purple-500 text-purple-200'
                    : 'bg-emerald-950 border-emerald-500 text-emerald-200'
                }`}>
                  {opponent.personality === 'bloodthirsty' ? '🩸 Cuồng Chiến' : opponent.personality === 'cunning' ? '🐍 Xảo Quyệt' : '😨 Hèn Nhát'}
                </span>
              )}
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-950 border border-rose-600 text-rose-200 font-bold shadow-sm">
                {opponent.powerTier}
              </span>
            </div>
          </div>
          <p className="text-[11px] text-stone-300 mt-0.5 italic">{opponent.title}</p>
          <div className="mt-2 flex items-center gap-2 text-[10px] font-mono text-stone-300">
            <span>Kiếm phái: <strong className="text-amber-300">{opponent.swordStyle || 'Hoang dã'}</strong></span>
            <span>•</span>
            <span>Đấu Khí: <strong className="text-emerald-300">{opponent.touki}</strong></span>
          </div>
        </div>

        {/* Distance & Status Meter */}
        <div className="flex flex-col justify-between gap-1.5">
          <div>
            <div className="flex justify-between items-center text-[10px] mb-1 font-mono">
              <span className="text-stone-300 flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-rose-400" /> Sinh lực đối thủ:
              </span>
              <span className="font-bold text-rose-200">
                {opponent.hpCurrent} / {opponent.hpMax} HP ({Math.round(oppHpPercent)}%)
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800 shadow-inner">
              <div
                className={`h-full transition-all duration-500 rounded-full shadow-[0_0_10px_rgba(244,63,94,0.5)] ${
                  oppHpPercent > 50
                    ? 'bg-gradient-to-r from-rose-600 via-red-500 to-rose-400'
                    : 'bg-gradient-to-r from-red-800 to-red-600'
                }`}
                style={{ width: `${oppHpPercent}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] pt-1 flex-wrap gap-1">
            <div className="flex items-center gap-1.5 text-stone-200 font-vietnam">
              <Footprints className="w-3.5 h-3.5 text-amber-400" />
              <span>Cự ly: <strong className="text-amber-300 font-mono font-bold">{opponent.distance}</strong></span>
            </div>
            <div className="text-[10px] text-rose-300 font-mono font-semibold flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-rose-400" />
              <span>{opponent.status}</span>
            </div>
          </div>

          {phase === 2 && combat.escapeChancePercent !== undefined && (
            <div className="text-[10px] font-mono text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded-lg border border-cyan-800/60 flex items-center justify-between mt-1">
              <span>🏃 Tỷ lệ đào tẩu dự đoán:</span>
              <strong className="text-cyan-200 font-bold">{combat.escapeChancePercent}%</strong>
            </div>
          )}
        </div>
      </div>

      {/* Active Tactical Buffs & Parry Advantage */}
      {(combat.parryAdvantage || combat.activeToukiBonus || combat.activeReflexBonus) && (
        <div className="flex flex-wrap items-center gap-1.5 p-2 bg-amber-950/70 border border-amber-500/50 rounded-xl text-xs font-vietnam">
          <span className="text-[10px] font-mono font-bold uppercase text-amber-300 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" /> Hiệu Ứng Kích Hoạt:
          </span>
          {combat.parryAdvantage && (
            <span className="px-2 py-0.5 rounded-full bg-sky-900/80 text-sky-200 border border-sky-400 font-bold text-[10px] flex items-center gap-1">
              ⚔️ LỢI THẾ PHẢN KÍCH (+50% Sát thương đòn sau)
            </span>
          )}
          {combat.activeToukiBonus && (
            <span className="px-2 py-0.5 rounded-full bg-amber-900/80 text-amber-200 border border-amber-400 font-bold text-[10px] flex items-center gap-1">
              🔥 ĐẤU KHÍ CƯỜNG HÓA (+{combat.activeToukiBonus} Touki - {combat.activeToukiBuffTurns} lượt)
            </span>
          )}
          {combat.activeReflexBonus && (
            <span className="px-2 py-0.5 rounded-full bg-cyan-900/80 text-cyan-200 border border-cyan-400 font-bold text-[10px] flex items-center gap-1">
              ⚡ PHẢN XẠ THÚ TỘC (+{combat.activeReflexBonus} Phản xạ)
            </span>
          )}
        </div>
      )}

      {/* Phase 3 Psychology Alert Box */}
      {phase === 3 && (
        <div className="p-3 rounded-xl bg-purple-950/80 border border-purple-500/60 text-purple-200 text-xs shadow-inner">
          <div className="font-cinzel font-bold text-amber-300 text-xs mb-1 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            Tâm Lý &amp; Phản Ứng Đối Thủ Khi Gục Ngã (Giai Đoạn 3):
          </div>
          <p className="font-vietnam text-xs leading-relaxed text-purple-100 whitespace-pre-line font-medium">
            {opponent.psychologyStatus ? `• Tình trạng: ${opponent.psychologyStatus}` : 'Đối thủ đã kiệt sức, nằm bất lực dưới đất.'}
          </p>
        </div>
      )}

      {/* Quick Tactical Hotkeys */}
      {onQuickTactic && !disabled && (
        <div className="pt-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-amber-300 mb-1.5 flex items-center gap-1 font-mono">
            <Zap className="w-3 h-3 text-amber-400" /> Gợi Ý Chiến Thuật Tương Khắc (Counter &amp; Tactic):
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => onQuickTactic('Thủ thế phòng ngự: Giữ vững bộ pháp, bảo vệ yếu huyệt và quan sát cẩn trọng đòn đánh của đối thủ')}
              className="p-2 rounded-xl bg-slate-900/80 border border-slate-700 hover:border-amber-400 text-amber-200 text-[11px] font-vietnam font-semibold text-left transition flex items-center gap-1.5 cursor-pointer shadow-sm hover:scale-105"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="truncate">Thủ Thế Phòng Ngự</span>
            </button>

            <button
              type="button"
              onClick={() => onQuickTactic('Kéo giãn cự ly: Lùi bước nhanh, giữ khoảng cách an toàn với đối phương')}
              className="p-2 rounded-xl bg-cyan-950/70 border border-cyan-500/50 hover:border-cyan-300 text-cyan-200 text-[11px] font-vietnam font-semibold text-left transition flex items-center gap-1.5 cursor-pointer shadow-sm hover:scale-105"
            >
              <Footprints className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="truncate">Kéo Giãn Cự Ly</span>
            </button>

            {character?.swordsmanship?.waterGod && character.swordsmanship.waterGod !== 'Chưa học' ? (
              <button
                type="button"
                onClick={() => onQuickTactic('Thủy Thần phái: Giữ yên kiếm bộ, dùng Lưu Đức phản kích đòn chém thẳng của đối thủ!')}
                className="p-2 rounded-xl bg-blue-950/70 border border-blue-500/50 hover:border-blue-300 text-blue-200 text-[11px] font-vietnam font-semibold text-left transition flex items-center gap-1.5 cursor-pointer shadow-sm hover:scale-105"
              >
                <Sword className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span className="truncate">Thủy Thần (Phản đòn)</span>
              </button>
            ) : character?.swordsmanship?.swordGod && character.swordsmanship.swordGod !== 'Chưa học' ? (
              <button
                type="button"
                onClick={() => onQuickTactic('Kiếm Thần phái: Vận Đấu Khí tốc kích, chém nhát kiếm thẳng uy lực dồn dập!')}
                className="p-2 rounded-xl bg-rose-950/70 border border-rose-500/50 hover:border-rose-300 text-rose-200 text-[11px] font-vietnam font-semibold text-left transition flex items-center gap-1.5 cursor-pointer shadow-sm hover:scale-105"
              >
                <Sword className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span className="truncate">Kiếm Thần (Tốc kích)</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onQuickTactic('Tấn công thăm dò: Tung đòn chém/đánh cơ bản đo lường phản xạ của đối thủ')}
                className="p-2 rounded-xl bg-rose-950/70 border border-rose-500/50 hover:border-rose-300 text-rose-200 text-[11px] font-vietnam font-semibold text-left transition flex items-center gap-1.5 cursor-pointer shadow-sm hover:scale-105"
              >
                <Sword className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span className="truncate">Tấn Công Thăm Dò</span>
              </button>
            )}

            {character?.magic?.chantless ? (
              <button
                type="button"
                onClick={() => onQuickTactic('Vô niệm chú: Ma pháp Đạn Đá thi triển tức thì bắn phá cản bước đối thủ!')}
                className="p-2 rounded-xl bg-emerald-950/70 border border-emerald-500/50 hover:border-emerald-300 text-emerald-200 text-[11px] font-vietnam font-semibold text-left transition flex items-center gap-1.5 cursor-pointer shadow-sm hover:scale-105"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">Đạn Đá Vô Niệm</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onQuickTactic('Quan sát đối thủ: Bình tĩnh chú ý tư thế và nhịp thở của đối phương')}
                className="p-2 rounded-xl bg-purple-950/70 border border-purple-500/50 hover:border-purple-300 text-purple-200 text-[11px] font-vietnam font-semibold text-left transition flex items-center gap-1.5 cursor-pointer shadow-sm hover:scale-105"
              >
                <Target className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span className="truncate">Quan Sát Nhịp Thở</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
