import React, { useState } from 'react';
import type { Character } from '../types/game.ts';
import { 
  SIX_FACED_WORLD_REGIONS, 
  identifyCurrentRegion, 
  executeCaravanTravel, 
  executeTeleportRuinTravel, 
  claimRegionalExclusiveArtifact, 
  ensureWorldDiscoveryState,
  type WorldRegionId, 
  type WorldRegion,
  type RegionalArtifact
} from '../services/mushokuWorldMap.ts';
import { soundFx } from '../services/soundFx.ts';
import { 
  MapPin, 
  Compass, 
  X, 
  Sparkles, 
  Zap, 
  ShieldAlert, 
  Clock, 
  Coins, 
  BookOpen, 
  Sword, 
  Eye, 
  Trees, 
  Mountain, 
  Castle, 
  Flame, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

interface WorldMapModalProps {
  character: Character;
  onUpdateCharacter: (updated: Character) => void;
  onClose: () => void;
  onLogMessage?: (msg: string) => void;
}

export const WorldMapModal: React.FC<WorldMapModalProps> = ({
  character,
  onUpdateCharacter,
  onClose,
  onLogMessage,
}) => {
  const currentRegion = identifyCurrentRegion(character.stats.location);
  const [selectedRegionId, setSelectedRegionId] = useState<WorldRegionId>(currentRegion.id);
  const [travelNotice, setTravelNotice] = useState<string | null>(null);

  const selectedRegion = SIX_FACED_WORLD_REGIONS[selectedRegionId];
  const isPlayerHere = currentRegion.id === selectedRegion.id;
  const discovery = ensureWorldDiscoveryState(character);

  // Handle Caravan Travel
  const handleCaravanTravel = (targetRegionId: WorldRegionId) => {
    soundFx.playClick();
    const result = executeCaravanTravel(character, targetRegionId);
    if (result.success) {
      onUpdateCharacter({ ...result.updatedCharacter });
      setTravelNotice(result.message);
      if (onLogMessage) onLogMessage(result.message);
      setSelectedRegionId(targetRegionId);
    } else {
      soundFx.playDeathGong();
      setTravelNotice(`❌ ${result.message}`);
    }
  };

  // Handle Teleport Ruin Travel
  const handleTeleportTravel = (ruinId: string) => {
    soundFx.playMagicCast();
    const result = executeTeleportRuinTravel(character, ruinId);
    if (result.success) {
      onUpdateCharacter({ ...result.updatedCharacter });
      setTravelNotice(result.message);
      if (onLogMessage) onLogMessage(result.message);
      setSelectedRegionId(result.updatedCharacter.worldDiscovery?.currentRegionId as WorldRegionId || 'asura');
    } else {
      soundFx.playDeathGong();
      setTravelNotice(`❌ ${result.message}`);
    }
  };

  // Handle Claiming Exclusive Artifact
  const handleClaimArtifact = (artifact: RegionalArtifact) => {
    soundFx.playClick();
    const result = claimRegionalExclusiveArtifact(character, artifact.id);
    if (result.success) {
      onUpdateCharacter({ ...result.updatedCharacter });
      setTravelNotice(result.message);
      if (onLogMessage) onLogMessage(result.message);
    } else {
      soundFx.playDeathGong();
      setTravelNotice(`❌ ${result.message}`);
    }
  };

  const getRegionIcon = (id: WorldRegionId) => {
    switch (id) {
      case 'millis': return <Castle className="w-4 h-4 text-blue-500" />;
      case 'asura': return <Coins className="w-4 h-4 text-amber-500" />;
      case 'northern': return <Mountain className="w-4 h-4 text-cyan-500" />;
      case 'demon': return <Flame className="w-4 h-4 text-red-500" />;
      case 'great_forest': return <Trees className="w-4 h-4 text-emerald-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-fade-in text-stone-900">
      <div className="bg-gradient-to-b from-amber-50 via-stone-50 to-amber-100/90 w-full max-w-5xl rounded-3xl border-2 border-amber-400 shadow-[0_20px_60px_rgba(217,119,6,0.25)] flex flex-col max-h-[92vh] overflow-hidden relative">
        {/* Decorative corner runes */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-amber-600 pointer-events-none" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-amber-600 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-amber-600 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-amber-600 pointer-events-none" />

        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3.5 bg-gradient-to-r from-amber-100 via-amber-50 to-stone-100 border-b border-amber-300 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500 text-amber-900 shadow-sm">
              <Compass className="w-5 h-5 text-amber-700 animate-spin-slow" />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-amber-800 font-bold flex items-center gap-1.5">
                <span>THẾ GIỚI SÁU MẶT • SIX-FACED CONTINENTAL MAP</span>
              </div>
              <h2 className="font-cinzel font-bold text-amber-950 text-base sm:text-lg flex items-center gap-2">
                Bản Đồ Thế Giới &amp; Động Cơ Dịch Chuyển Nhanh
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-xl bg-white/90 border border-amber-300 text-xs font-mono font-bold text-amber-950 shadow-2xs">
              <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span>Hiện tại: {character.stats.location}</span>
            </div>

            <button
              onClick={() => {
                soundFx.playClick();
                onClose();
              }}
              className="p-2 rounded-xl hover:bg-amber-200/60 text-stone-700 hover:text-stone-900 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notice feedback banner */}
        {travelNotice && (
          <div className="px-4 py-2 bg-amber-100/90 border-b border-amber-300 text-amber-950 text-xs font-vietnam font-medium flex items-center justify-between gap-2 animate-fade-in">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-700 shrink-0" />
              <span>{travelNotice}</span>
            </div>
            <button
              onClick={() => setTravelNotice(null)}
              className="text-[10px] text-stone-500 hover:text-stone-800 underline cursor-pointer"
            >
              Đóng
            </button>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* 5 Great Regions Selector Bar */}
          <div>
            <div className="text-xs font-cinzel font-bold text-amber-900 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Năm Đại Vương Quốc &amp; Đại Lục Trọng Yếu</span>
              <span className="text-[11px] font-mono text-stone-600 font-normal">
                (Nhấp chọn vùng đất để khảo sát bảo vật &amp; lộ trình dịch chuyển)
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-2.5">
              {(Object.keys(SIX_FACED_WORLD_REGIONS) as WorldRegionId[]).map((rId) => {
                const reg = SIX_FACED_WORLD_REGIONS[rId];
                const isSelected = selectedRegionId === rId;
                const isCurrentLoc = currentRegion.id === rId;

                return (
                  <button
                    key={rId}
                    type="button"
                    onClick={() => {
                      soundFx.playClick();
                      setSelectedRegionId(rId);
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all duration-200 relative cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? `${reg.themeColor.border} bg-white shadow-md ring-2 ring-amber-400/60 scale-101`
                        : 'border-amber-200/80 bg-white/70 hover:bg-white hover:border-amber-300'
                    }`}
                  >
                    {isCurrentLoc && (
                      <span className="absolute -top-2 right-2 px-1.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-rose-600 text-white shadow-xs animate-pulse flex items-center gap-0.5">
                        <MapPin className="w-2.5 h-2.5" /> Ở Đây
                      </span>
                    )}

                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        {getRegionIcon(rId)}
                        <span className="font-cinzel font-bold text-xs truncate text-stone-900">
                          {reg.name.split('(')[0].trim()}
                        </span>
                      </div>
                      <p className="text-[10px] text-stone-500 font-mono truncate">
                        {reg.continent}
                      </p>
                    </div>

                    <div className="mt-2 pt-1.5 border-t border-stone-100 flex items-center justify-between text-[9px] font-mono text-stone-600">
                      <span>{reg.dangerRank.split(' ')[0]}</span>
                      <span className="text-amber-800 font-semibold">{reg.exclusiveArtifacts.length} Bảo vật</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detailed Region Overview Card */}
          <div className="bg-white/95 rounded-2xl border-2 border-amber-300/80 p-4 sm:p-5 shadow-xs space-y-4">
            {/* Header of Selected Region */}
            <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-amber-200">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold border ${selectedRegion.themeColor.badge}`}>
                    {selectedRegion.continent}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-stone-100 text-stone-700 border border-stone-300">
                    Nguy biến: {selectedRegion.dangerRank}
                  </span>
                  {isPlayerHere && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-vietnam font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Bạn đang có mặt tại đây
                    </span>
                  )}
                </div>

                <h3 className="font-cinzel font-bold text-lg sm:text-xl text-amber-950 mt-1.5">
                  {selectedRegion.name}
                </h3>
                <p className="text-xs text-stone-600 font-vietnam mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  Đại đô thị trung tâm: <strong className="text-amber-950">{selectedRegion.capitalHub}</strong>
                </p>
              </div>

              {/* Status Indicator */}
              <div className="text-right">
                <div className="text-[11px] font-mono text-stone-500">Tài sản khả dụng:</div>
                <div className="text-sm font-mono font-bold text-amber-900">
                  {character.stats.asuraCoins || 0} Xu Asura • {character.stats.manaCurrent}/{character.stats.manaMax} MP
                </div>
              </div>
            </div>

            {/* Geography & Culture Lore */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-amber-50/50 p-3 rounded-xl border border-amber-200/70">
              <div>
                <strong className="text-amber-900 block font-cinzel mb-0.5">Địa Thế &amp; Khí Hậu:</strong>
                <p className="text-stone-700 leading-relaxed font-vietnam">{selectedRegion.geography}</p>
                <p className="text-stone-500 italic mt-1 font-vietnam text-[11px]">Khí hậu: {selectedRegion.climate}</p>
              </div>
              <div>
                <strong className="text-amber-900 block font-cinzel mb-0.5">Văn Hóa &amp; Cai Trị:</strong>
                <p className="text-stone-700 leading-relaxed font-vietnam">{selectedRegion.culture}</p>
              </div>
            </div>

            {/* SECTION 1: KHO BẢO VẬT & BÍ KÍP ĐỘC QUYỀN */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <h4 className="font-cinzel font-bold text-sm text-amber-950 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  Kho Bảo Vật &amp; Bí Kíp Độc Quyền Vùng Này
                </h4>
                <span className="text-[11px] font-mono text-stone-500">
                  {isPlayerHere ? '🟢 Có thể tiếp cận trực tiếp' : '🔒 Chỉ tiếp cận khi đặt chân tới đây'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {selectedRegion.exclusiveArtifacts.map((art) => {
                  const isObtained = discovery.collectedArtifactIds.includes(art.id);

                  return (
                    <div 
                      key={art.id} 
                      className={`p-3 rounded-xl border transition flex flex-col justify-between ${
                        isObtained
                          ? 'bg-emerald-50/80 border-emerald-300 ring-1 ring-emerald-400/40'
                          : 'bg-white border-amber-200/90 hover:border-amber-400'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="font-serif font-bold text-xs text-amber-950 line-clamp-1">
                            {art.name}
                          </span>
                          {isObtained ? (
                            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 shrink-0">
                              Đã có
                            </span>
                          ) : (
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-stone-100 text-stone-600 border border-stone-200 shrink-0">
                              Chưa học
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-stone-600 line-clamp-2 leading-relaxed mb-2 font-vietnam">
                          {art.description}
                        </p>

                        <div className="p-2 rounded-lg bg-amber-50/80 border border-amber-200/60 text-[10px] text-amber-950 space-y-1 mb-2 font-vietnam">
                          <div><strong>Hiệu quả:</strong> {art.effect}</div>
                          {art.requirements && (
                            <div className="text-stone-500 italic">Yêu cầu: {art.requirements}</div>
                          )}
                        </div>
                      </div>

                      {/* Action Button */}
                      <div>
                        {isObtained ? (
                          <div className="text-[10px] text-center font-mono font-bold text-emerald-700 py-1 bg-emerald-100/60 rounded border border-emerald-200">
                            ✓ Đã Lĩnh Hội / Sở Hữu
                          </div>
                        ) : isPlayerHere ? (
                          <button
                            type="button"
                            onClick={() => handleClaimArtifact(art)}
                            className="w-full py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-amber-950 font-vietnam font-bold text-xs transition cursor-pointer shadow-2xs hover:scale-101"
                          >
                            Lĩnh Hội / Thu Thập Tại Đây
                            {art.costCoins ? ` (${art.costCoins} Xu)` : art.costSp ? ` (${art.costSp} SP)` : ''}
                          </button>
                        ) : (
                          <div className="text-[10px] text-center font-mono text-stone-400 py-1 bg-stone-50 rounded border border-stone-200">
                            🔒 Cần đặt chân tới vùng này
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SECTION 2: HỆ THỐNG FAST TRAVEL (DỊCH CHUYỂN NHANH) THỰC TẾ */}
            <div className="pt-3 border-t border-amber-200 space-y-3">
              <h4 className="font-cinzel font-bold text-sm text-amber-950 flex items-center gap-2">
                <Compass className="w-4 h-4 text-amber-600" />
                Mạng Lưới Dịch Chuyển Nhanh (Fast Travel Network)
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* HÌNH THỨC 1: MA PHÁP TRẬN DỊCH CHUYỂN CỔ ĐẠI */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-purple-50/80 to-indigo-50/60 border border-purple-300 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-cinzel font-bold text-xs text-purple-950 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-purple-700" />
                      1. Ma Pháp Trận Cổ Đại (Teleportation Ruin)
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-purple-100 text-purple-900 border border-purple-300 font-bold">
                      Xuyên Lục Địa
                    </span>
                  </div>

                  <p className="text-[11px] text-stone-700 leading-relaxed font-vietnam">
                    Trận pháp cổ đại thời Thần Ma Đại Chiến. Cho phép dịch chuyển lập tức xuyên lục địa nhưng tiêu hao 50% Mana và có nguy cơ phục kích.
                  </p>

                  {selectedRegion.teleportRuins.length > 0 ? (
                    selectedRegion.teleportRuins.map((ruin) => (
                      <div key={ruin.id} className="p-2.5 rounded-xl bg-white/90 border border-purple-200 space-y-1.5">
                        <div className="font-mono font-bold text-xs text-purple-950 flex items-center justify-between">
                          <span>{ruin.name}</span>
                          <span className="text-[10px] text-rose-600 flex items-center gap-0.5">
                            <AlertTriangle className="w-3 h-3" /> {ruin.ambushRiskPercent}% Phục Kích
                          </span>
                        </div>
                        <p className="text-[10px] text-stone-600 font-vietnam">
                          Điểm đến: <strong>{ruin.destinationName}</strong> (Tiêu tốn: 50% MP hiện tại)
                        </p>

                        <button
                          type="button"
                          disabled={!isPlayerHere}
                          onClick={() => handleTeleportTravel(ruin.id)}
                          className={`w-full py-1.5 rounded-lg text-xs font-vietnam font-bold transition flex items-center justify-center gap-1.5 shadow-2xs ${
                            isPlayerHere
                              ? 'bg-purple-700 hover:bg-purple-800 text-white cursor-pointer hover:scale-101'
                              : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                          }`}
                        >
                          <Zap className="w-3.5 h-3.5" />
                          {isPlayerHere ? 'Kích Hoạt Ma Pháp Trận (Tức thì)' : 'Chỉ kích hoạt tại vùng này'}
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="p-2.5 rounded-xl bg-white/60 border border-stone-200 text-center text-[11px] text-stone-500 font-vietnam">
                      Vùng này không có cổng ma pháp trận kết nối trực tiếp.
                    </div>
                  )}
                </div>

                {/* HÌNH THỨC 2: XE NGỰA THƯƠNG ĐỘI & TUẦN LỘC */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-50/80 to-orange-50/60 border border-amber-300 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-cinzel font-bold text-xs text-amber-950 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-700" />
                      2. Xe Ngựa Thương Đội (Caravan Travel)
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 font-bold">
                      Đường Bộ &amp; Đường Thủy
                    </span>
                  </div>

                  <p className="text-[11px] text-stone-700 leading-relaxed font-vietnam">
                    Lên đường cùng đoàn thương nhân và lính đánh thuê. An toàn cao, tiêu hao lộ phí Xu Asura và mất từ 1 đến 4 tháng hành trình.
                  </p>

                  {/* Show routes FROM current region TO selected region if player is not here, or routes outward if player is here */}
                  {(() => {
                    const availableRoutes = isPlayerHere
                      ? currentRegion.caravanRoutes
                      : currentRegion.caravanRoutes.filter(r => r.targetRegionId === selectedRegion.id);

                    if (availableRoutes.length === 0) {
                      return (
                        <div className="p-2.5 rounded-xl bg-white/60 border border-stone-200 text-center text-[11px] text-stone-500 font-vietnam">
                          {isPlayerHere 
                            ? 'Không có tuyến thương đoàn xuất phát từ đây.' 
                            : `Không có tuyến thương đoàn trực tiếp từ vị trí hiện tại (${currentRegion.name}) sang ${selectedRegion.name}. Hãy di chuyển qua các trạm trung gian!`}
                        </div>
                      );
                    }

                    return availableRoutes.map((route) => (
                      <div key={route.targetRegionId} className="p-2.5 rounded-xl bg-white/90 border border-amber-200 space-y-1.5">
                        <div className="font-mono font-bold text-xs text-amber-950 flex items-center justify-between">
                          <span>Tuyến tới: {route.targetName}</span>
                          <span className="text-[10px] text-amber-800">
                            {route.travelMonths} tháng • {route.costCoins} Xu
                          </span>
                        </div>
                        <p className="text-[10px] text-stone-600 font-vietnam leading-snug">
                          {route.description}
                        </p>

                        <button
                          type="button"
                          onClick={() => handleCaravanTravel(route.targetRegionId)}
                          className="w-full py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-amber-950 text-xs font-vietnam font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs hover:scale-101"
                        >
                          <Coins className="w-3.5 h-3.5 text-amber-900" />
                          Lên Đường Bằng Xe Ngựa ({route.costCoins} Xu Asura)
                        </button>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-4 sm:px-6 py-3 bg-amber-100/70 border-t border-amber-300 flex items-center justify-between text-xs font-vietnam text-stone-600 shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-amber-950">
              Tổng số chuyến lữ hành: {discovery.travelCount}
            </span>
            <span>•</span>
            <span>Đã mở khóa: {discovery.unlockedRegionIds.length}/5 Đại Lục</span>
          </div>

          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="px-4 py-1.5 rounded-xl bg-white hover:bg-stone-50 border border-stone-300 font-bold text-stone-800 transition cursor-pointer shadow-2xs"
          >
            Đóng Bản Đồ
          </button>
        </div>
      </div>
    </div>
  );
};
