/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import type { Character, TurnChoice, TurnLog } from './types/game';
import { ReincarnationModal } from './components/ReincarnationModal';
import { CharacterHud } from './components/CharacterHud';
import { StoryLogView } from './components/StoryLogView';
import { ActionPanel } from './components/ActionPanel';
import { CombatHud } from './components/CombatHud';
import { PermadeathModal } from './components/PermadeathModal';
import { GrimoireModal } from './components/GrimoireModal';
import { HuntingHubModal } from './components/HuntingHubModal';
import { ShopCraftModal } from './components/ShopCraftModal';
import { EquipmentInventoryModal } from './components/EquipmentInventoryModal';
import { ChronicleHistoryModal } from './components/ChronicleHistoryModal';
import { SurrenderModal } from './components/SurrenderModal';
import { SkillTreeModal } from './components/SkillTreeModal';
import { TimeSkipModal } from './components/TimeSkipModal';
import { FantasyBackground } from './components/FantasyBackground';
import { WorldMapModal } from './components/WorldMapModal';
import { Navbar } from './components/Navbar';
import { generateInitialTurn, processProceduralTurn } from './services/proceduralGm';
import { 
  equipItem, 
  unequipItem, 
  formatEquipmentSummary, 
  matchSlotFromVietnamese,
  getValidSlotsForItem,
  discardItem,
  sellItem,
  sellAllLootItems
} from './services/mushokuRules';
import { 
  ensureCharacterProgression, 
  formatProgressionSummary,
  saveCarriedProgression,
  getCarriedProgression,
  type CarriedLegacyProgression
} from './services/mushokuProgression';
import { soundFx } from './services/soundFx';
import { syncCharacterTalentStats } from './services/mushokuTalents';

const STORAGE_KEY = 'mushoku_rpg_state_v1';
const CHECKPOINT_KEY = 'mushoku_rpg_checkpoint_v1';
const LEGACY_STORAGE_KEY = 'mushoku_rpg_legacy_v1';

export default function App() {
  const [character, setCharacter] = useState<Character | null>(null);
  const [logs, setLogs] = useState<TurnLog[]>([]);
  const [historyLogs, setHistoryLogs] = useState<TurnLog[]>([]);
  const [choices, setChoices] = useState<TurnChoice[]>([]);
  const [turnCount, setTurnCount] = useState<number>(1);
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const [isAiProcessing, setIsAiProcessing] = useState<boolean>(false);
  const [hasCheckpoint, setHasCheckpoint] = useState<boolean>(false);
  const [checkpointMeta, setCheckpointMeta] = useState<{
    savedAtAge: number;
    savedLocation: string;
    savedTimestamp?: number;
  } | undefined>(undefined);
  const [showGrimoire, setShowGrimoire] = useState<boolean>(false);
  const [showHuntingHub, setShowHuntingHub] = useState<boolean>(false);
  const [showShopModal, setShowShopModal] = useState<boolean>(false);
  const [showInventoryModal, setShowInventoryModal] = useState<boolean>(false);
  const [showSkillTreeModal, setShowSkillTreeModal] = useState<boolean>(false);
  const [showTimeSkipModal, setShowTimeSkipModal] = useState<boolean>(false);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [showSurrenderModal, setShowSurrenderModal] = useState<boolean>(false);
  const [showWorldMapModal, setShowWorldMapModal] = useState<boolean>(false);
  const [showReincarnateModal, setShowReincarnateModal] = useState<boolean>(true);
  const [carriedProgression, setCarriedProgression] = useState<CarriedLegacyProgression>({
    carriedSkillPoints: 60,
    carriedKnowledgePoints: 20,
    reincarnationCount: 0,
  });
  const [legacyNgBonus, setLegacyNgBonus] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isScreenShaking, setIsScreenShaking] = useState<boolean>(false);

  const triggerImpactShake = () => {
    setIsScreenShaking(true);
    setTimeout(() => {
      setIsScreenShaking(false);
    }, 450);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Load saved state or check for checkpoint
  useEffect(() => {
    try {
      // Always load carried SP & KP progression for next life
      const carried = getCarriedProgression();
      setCarriedProgression(carried);

      const savedCp = localStorage.getItem(CHECKPOINT_KEY);
      if (savedCp) {
        const parsedCp = JSON.parse(savedCp);
        setHasCheckpoint(true);
        if (parsedCp.meta) {
          setCheckpointMeta(parsedCp.meta);
        } else if (parsedCp.character) {
          setCheckpointMeta({
            savedAtAge: parsedCp.character.stats.age,
            savedLocation: parsedCp.character.stats.location,
            savedTimestamp: parsedCp.savedTimestamp || Date.now(),
          });
        }
      }

      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.character && parsed.logs && parsed.logs.length > 0) {
          setCharacter(parsed.character);
          const fullHist: TurnLog[] = parsed.historyLogs && parsed.historyLogs.length > 0 ? parsed.historyLogs : parsed.logs;
          setHistoryLogs(fullHist);
          // Only show latest turn to keep screen clean and clear per user request
          setLogs(fullHist.length > 0 ? [fullHist[fullHist.length - 1]] : parsed.logs);
          setChoices(parsed.choices || []);
          setTurnCount(parsed.turnCount || parsed.logs.length);
          setHasStarted(true);
          setShowReincarnateModal(false);
        }
      }
    } catch {
      // LocalStorage access fallback
    }
  }, []);

  // Auto-save to localStorage whenever state updates
  useEffect(() => {
    if (hasStarted && character && (logs.length > 0 || historyLogs.length > 0)) {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            character,
            logs,
            historyLogs: historyLogs.length > 0 ? historyLogs : logs,
            choices,
            turnCount,
          })
        );
        // Persist accumulated SP and KP to ensure 100% inheritance safety
        if (character.progression) {
          saveCarriedProgression(character);
          const updated = getCarriedProgression();
          setCarriedProgression(updated);
        }
      } catch {
        // ignore storage errors
      }
    }
  }, [character, logs, historyLogs, choices, turnCount, hasStarted]);

  // Handle Initial Reincarnation Turn (Age 0)
  const handleStartReincarnation = async (data: {
    name: string;
    race: string;
    origin: string;
    baseStats: any;
    initialBonds: any[];
    initialLanguages: string[];
    specialGift: string;
    preRolledTalent?: string;
    rawBaseStats?: any;
  }) => {
    setIsAiProcessing(true);
    setShowReincarnateModal(false);

    // Retrieve carried SP and KP from previous life
    const carried = getCarriedProgression();
    const carriedSp = carried.carriedSkillPoints;
    const carriedKp = carried.carriedKnowledgePoints;

    try {
      let initData: { initialLog: TurnLog; initialCharacter: Character; choices: TurnChoice[] };

      // Try server endpoint
      const res = await fetch('/api/gm/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, carriedSp, carriedKp }),
      });

      if (res.ok) {
        initData = await res.json();
      } else {
        initData = generateInitialTurn(
          data.name,
          data.race,
          data.origin,
          data.baseStats,
          data.initialBonds,
          data.initialLanguages,
          carriedSp,
          carriedKp,
          data.preRolledTalent,
          (data as any).rawBaseStats
        );
      }

      // Sync character stats with talent
      syncCharacterTalentStats(initData.initialCharacter);

      setCharacter(initData.initialCharacter);
      setLogs([initData.initialLog]);
      setHistoryLogs([initData.initialLog]);
      setChoices(initData.choices);
      setTurnCount(1);
      setHasStarted(true);

      // Save initial checkpoint
      localStorage.setItem(
        CHECKPOINT_KEY,
        JSON.stringify({
          character: initData.initialCharacter,
          logs: [initData.initialLog],
          historyLogs: [initData.initialLog],
          choices: initData.choices,
          turnCount: 1,
        })
      );
      setHasCheckpoint(true);
      showToast(`🌟 Khởi tạo kiếp mới thành công! Giữ lại trọn vẹn ${initData.initialCharacter.progression?.skillPoints ?? carriedSp} SP & ${initData.initialCharacter.progression?.knowledgePoints ?? carriedKp} KP từ kiếp cũ!`);
    } catch {
      // Procedural fallback
      const initData = generateInitialTurn(
        data.name,
        data.race,
        data.origin,
        data.baseStats,
        data.initialBonds,
        data.initialLanguages,
        carriedSp,
        carriedKp,
        data.preRolledTalent,
        (data as any).rawBaseStats
      );
      syncCharacterTalentStats(initData.initialCharacter);
      setCharacter(initData.initialCharacter);
      setLogs([initData.initialLog]);
      setHistoryLogs([initData.initialLog]);
      setChoices(initData.choices);
      setTurnCount(1);
      setHasStarted(true);
    } finally {
      setIsAiProcessing(false);
    }
  };

  // Execute a game turn (either guided choice or custom action text)
  const handleExecuteTurn = async (actionText: string = '', selectedChoice?: TurnChoice) => {
    if (!character || isAiProcessing || character.isDead) return;

    const trimmed = (actionText || '').trim().toLowerCase();

    // ==========================================
    // SYSTEM COMMAND 1: !save / lưu game
    // ==========================================
    if (trimmed === '!save' || trimmed === 'lưu game' || trimmed === '!checkpoint') {
      handleSaveCheckpoint();
      const saveLog: TurnLog = {
        id: `sys_save_${Date.now()}`,
        turnNumber: turnCount,
        ageDisplay: `${character.stats.age} tuổi ${character.stats.month} tháng`,
        location: character.stats.location,
        playerAction: actionText,
        narration: `[LỆNH HỆ THỐNG: LƯU GAME / SAVE CHECKPOINT]
AI Game Master đã ghi nhận Điểm Lưu (Checkpoint) an toàn của bạn!
• Thời điểm: ${character.stats.age} tuổi ${character.stats.month} tháng
• Địa điểm: ${character.stats.location}
• Cấp bậc sinh lực: ${character.stats.healthCurrent}/${character.stats.healthMax} HP | ${character.stats.manaCurrent}/${character.stats.manaMax} MP
• Đấu Khí (Touki): ${character.stats.touki}/${character.stats.toukiMax || 100} Touki | Thể lực: ${character.stats.staminaCurrent}/${character.stats.staminaMax}
Nếu gặp bất trắc hoặc tử vong trong các trận chiến sinh tử, bạn có thể nạp lại ngay từ điểm lưu này!`,
        statusSummary: `• Checkpoint: Đã lưu an toàn\n• Mốc tuổi: ${character.stats.age} tuổi ${character.stats.month} tháng\n• Vị trí: ${character.stats.location}`,
        systemNotes: [
          'Điểm lưu hiện tại đã được ghi nhận vào bộ nhớ trình duyệt!',
          'Bạn cũng có thể xuất file JSON từ menu để sao lưu vĩnh viễn.'
        ],
        timestamp: Date.now(),
        dangerEncountered: false,
      };
      setLogs((prev) => [...prev, saveLog]);
      return;
    }

    // ==========================================
    // SYSTEM COMMAND 2: !status / xem trạng thái
    // ==========================================
    if (trimmed === '!status' || trimmed === 'xem trạng thái' || trimmed === '!thongtin') {
      soundFx.playParchmentTurn();
      ensureCharacterProgression(character);
      const progSummary = formatProgressionSummary(character);

      const inventoryList = character.inventory.length > 0
        ? character.inventory.map((item, idx) => `  ${idx + 1}. [${item.name}] (${item.tier || 'Phổ thông'}) - ${item.description}${item.isEquipped ? ' [Đang trang bị]' : ''}`).join('\n')
        : '  (Trống rỗng)';

      const bondsList = character.bonds.length > 0
        ? character.bonds.map((b) => `  • ${b.name} (${b.relation}): ${b.affection}% hảo cảm - ${b.notes} (${b.isAlive ? 'Còn sống' : 'Đã mất'})`).join('\n')
        : '  (Chưa thiết lập mối quan hệ sâu sắc)';

      const traitsList = character.specialTraits.length > 0
        ? character.specialTraits.join(', ')
        : 'Không có';

      const statusLog: TurnLog = {
        id: `sys_status_${Date.now()}`,
        turnNumber: turnCount,
        ageDisplay: `${character.stats.age} tuổi ${character.stats.month} tháng`,
        location: character.stats.location,
        playerAction: actionText,
        narration: `[BẢNG CHỈ SỐ CHI TIẾT & HÀNH TRANG ĐẦY ĐỦ]
======================================================
Hồ sơ nhân vật: ${character.name} | Danh hiệu: ${character.title || 'Người Chuyển Sinh'}
Chủng tộc: ${character.race} | Xuất thân: ${character.origin}
Thời gian: ${character.stats.age} tuổi ${character.stats.month} tháng | Địa điểm: ${character.stats.location}

[CHỈ SỐ SINH TỒN & CHIẾN LỰC]:
• Sinh lực (HP): ${character.stats.healthCurrent} / ${character.stats.healthMax}
• Mana: ${character.stats.manaCurrent} / ${character.stats.manaMax} (Kiểm soát Mana: ${character.stats.manaControl || 0})
• Đấu Khí (Touki): ${character.stats.touki} / ${character.stats.toukiMax || 100} | Thể lực: ${character.stats.staminaCurrent} / ${character.stats.staminaMax}
• Mức độ Mệt Mỏi (Fatigue): ${character.stats.fatigue || 0}%
• Tiền tệ: ${character.stats.asuraCoins || 0} Xu Asura

[MA PHÁP (MAGIC)]:
• Hỏa: ${character.magic.fire} | Thủy: ${character.magic.water} | Thổ: ${character.magic.earth} | Phong: ${character.magic.wind}
• Trị liệu: ${character.magic.healing} | Giải độc: ${character.magic.detox} | Kết giới: ${character.magic.barrier}
• Vô niệm chú (Chantless): ${character.magic.chantless ? 'ĐÃ MỞ KHÓA (Thi triển tức thì)' : `Chưa mở khóa (${character.magic.chantlessProgress || 0}%)`}

[KIẾM THUẬT (SWORDSMANSHIP)]:
• Kiếm Thần phái: ${character.swordsmanship.swordGod}
• Thủy Thần phái: ${character.swordsmanship.waterGod}
• Bắc Thần phái: ${character.swordsmanship.northGod}

[HÀNH TRANG & CHIẾN LỢI PHẨM (${character.inventory.length} MÓN)]:
${inventoryList}

[MỐI QUAN HỆ & BẰNG HỮU]:
${bondsList}

[DỊ NĂNG & THIÊN PHÚ]:
${traitsList}

${progSummary}`,
        statusSummary: `• Sinh lực: ${character.stats.healthCurrent}/${character.stats.healthMax} HP | Mana: ${character.stats.manaCurrent}/${character.stats.manaMax} MP
• Đấu Khí: ${character.stats.touki}/${character.stats.toukiMax || 100} Touki | Thể lực: ${character.stats.staminaCurrent}/${character.stats.staminaMax} | Tiền: ${character.stats.asuraCoins || 0} Xu Asura
• Kho đồ: ${character.inventory.length} vật phẩm

${progSummary}`,
        systemNotes: [
          'Đã hiển thị toàn bộ hồ sơ chỉ số và bảng tiến trình đột phá chi tiết.',
          'Gõ "!skills" hoặc nhấn nút [Cây Kỹ Năng] để sử dụng SP và KP đột phá cảnh giới.'
        ],
        timestamp: Date.now(),
        dangerEncountered: false,
      };
      setLogs((prev) => [...prev, statusLog]);
      return;
    }

    // ==========================================
    // SYSTEM COMMAND 2.5: !skills / cây kỹ năng / đột phá / !tiendo
    // ==========================================
    if (
      trimmed === '!skills' || 
      trimmed === '!skill' || 
      trimmed === '!kynang' || 
      trimmed === 'cây kỹ năng' || 
      trimmed === '!caykynang' || 
      trimmed === '!tiendo' || 
      trimmed === 'tiến trình' || 
      trimmed === 'đột phá' ||
      trimmed === '!dotpha'
    ) {
      soundFx.playParchmentTurn();
      setShowSkillTreeModal(true);
      return;
    }

    // ==========================================
    // SYSTEM COMMAND 3: !history / tóm tắt / biên niên sử
    // ==========================================
    if (trimmed === '!history' || trimmed === 'tóm tắt' || trimmed === '!lichsu' || trimmed === 'biên niên sử') {
      soundFx.playParchmentTurn();
      setShowHistoryModal(true);
      return;
    }

    // ==========================================
    // SYSTEM COMMAND 3.5: !surrender / bỏ cuộc / đầu hàng / buông xuôi
    // ==========================================
    if (trimmed === '!surrender' || trimmed === 'bỏ cuộc' || trimmed === 'đầu hàng' || trimmed === 'buông xuôi') {
      soundFx.playParchmentTurn();
      setShowSurrenderModal(true);
      return;
    }

    // ==========================================
    // SYSTEM COMMAND 4: !inventory / xem túi đồ / túi đồ
    // ==========================================
    if (trimmed === '!inventory' || trimmed === 'xem túi đồ' || trimmed === '!túi đồ' || trimmed === 'túi đồ' || trimmed === '!bag') {
      soundFx.playParchmentTurn();
      setShowInventoryModal(true);
      const equipSummary = formatEquipmentSummary(character.equipment);
      const maxSlots = character.maxInventorySlots || 20;
      const invItemsList = character.inventory.length > 0
        ? character.inventory.map((item, idx) => {
            const slotText = item.equipSlot ? ` [Vị trí: ${item.equipSlot}]` : '';
            return `  Ô ${idx + 1}: [${item.name}] (${item.tier || 'Phổ thông'})${slotText}${item.isEquipped ? ' [Đang đeo]' : ''} - ${item.description}`;
          }).join('\n')
        : '  (Túi đồ hiện đang trống rỗng)';

      const invLog: TurnLog = {
        id: `sys_inv_${Date.now()}`,
        turnNumber: turnCount,
        ageDisplay: `${character.stats.age} tuổi ${character.stats.month} tháng`,
        location: character.stats.location,
        playerAction: actionText,
        narration: `[BẢNG CHI TIẾT 11 Ô TRANG BỊ & 20 Ô HÀNH TRANG TÚI ĐỒ]
======================================================
SỨC CHỨA TÚI ĐỒ: ${character.inventory.length} / ${maxSlots} Ô chứa (Grid Slots)
${character.inventory.length >= maxSlots ? '⚠️ CẢNH BÁO: Túi đồ đã đầy! Cần bán bớt hoặc mở rộng túi.' : 'Không gian túi đồ vẫn còn chỗ trống.'}

${equipSummary}

DANH SÁCH VẬT PHẨM TRONG TÚI ĐỒ (${character.inventory.length} / ${maxSlots} Ô):
${invItemsList}

HƯỚNG DẪN THAO TÁC NHANH:
- Gõ: "Trang bị [Tên vật phẩm] vào [Tên ô]" (Ví dụ: "Trang bị Áo Giáp Da Sói vào Thân")
- Gõ: "Tháo [Tên ô]" (Ví dụ: "Tháo Đầu", "Tháo Tay Phải", "Tháo Thân")
- Bấm nút [Ô Trang Bị] trên thanh công cụ để mở giao diện trực quan!`,
        statusSummary: `• Túi đồ: ${character.inventory.length}/${maxSlots} ô | Tiền tệ: ${character.stats.asuraCoins || 0} Xu Asura\n\n${equipSummary}`,
        equipmentSummaryText: equipSummary,
        systemNotes: [
          'Đã mở bảng kiểm kê Ô Trang Bị và Túi Đồ.',
          'Các chỉ số của vật phẩm đang đeo được cộng trực tiếp vào thuộc tính ngầm khi chiến đấu!'
        ],
        timestamp: Date.now(),
        dangerEncountered: false,
      };
      setLogs((prev) => [...prev, invLog]);
      return;
    }

    // ==========================================
    // SYSTEM COMMAND 5: Trang bị [Tên vật phẩm] vào [Tên ô]
    // ==========================================
    const isEquipAction = trimmed.startsWith('trang bị') || trimmed.startsWith('đeo ') || trimmed.startsWith('mặc ') || trimmed.startsWith('equip ') || trimmed.startsWith('lắp ') || trimmed.startsWith('gắn ');
    if (isEquipAction) {
      let targetSlotKey = matchSlotFromVietnamese(actionText || '');
      let queryName = (actionText || '')
        .replace(/^(?:trang bị|đeo|mặc|equip|lắp|gắn)[:\s]+/i, '')
        .replace(/\s+(?:vào|sang|ở|in|to)\s+.*$/i, '')
        .replace(/[\[\]]/g, '')
        .trim()
        .toLowerCase();

      // Find best matching item in inventory
      const foundItem = character.inventory.find(i => 
        (i?.name && queryName && i.name.toLowerCase().includes(queryName)) || 
        (queryName && i?.name && queryName.includes(i.name.toLowerCase())) ||
        (i?.id && queryName && (i.id.toLowerCase() === queryName || queryName.includes(i.id.toLowerCase())))
      ) || (queryName === '' ? character.inventory.find(i => getValidSlotsForItem(i).length > 0) : undefined);

      if (foundItem) {
        const res = equipItem(character, foundItem.id, targetSlotKey || undefined);
        if (res.success) {
          soundFx.playSwordClash();
          setCharacter(res.updatedCharacter);
          showToast(res.message);
          const equipSummary = formatEquipmentSummary(res.updatedCharacter.equipment);
          const equipLog: TurnLog = {
            id: `sys_equip_${Date.now()}`,
            turnNumber: turnCount,
            ageDisplay: `${character.stats.age} tuổi ${character.stats.month} tháng`,
            location: character.stats.location,
            playerAction: actionText,
            narration: `[THAO TÁC ĐEO TRANG BỊ]\n${res.message}\n\nHiệu ứng thuộc tính của [${foundItem.name}] đã được kích hoạt và truyền dẫn vào cơ thể.`,
            statusSummary: `• Thao tác: ${res.message}\n• Túi đồ: ${res.updatedCharacter.inventory.length}/${res.updatedCharacter.maxInventorySlots || 20} ô\n\n${equipSummary}`,
            equipmentSummaryText: equipSummary,
            systemNotes: [res.message],
            timestamp: Date.now(),
            dangerEncountered: false,
          };
          setLogs((prev) => [...prev, equipLog]);
          return;
        } else {
          showToast(res.message);
        }
      }
    }

    // ==========================================
    // SYSTEM COMMAND 6: Tháo [Tên ô]
    // ==========================================
    const isUnequipAction = trimmed.startsWith('tháo ') || trimmed.startsWith('unequip ') || trimmed.startsWith('gỡ ');
    if (isUnequipAction) {
      const slotQuery = (actionText || '').replace(/^(?:tháo|unequip|gỡ)\s+/i, '').replace(/[\[\]]/g, '').trim();
      let targetSlotKey = matchSlotFromVietnamese(slotQuery);

      if (!targetSlotKey && slotQuery) {
        // Try to match by item name currently equipped
        const slots: (keyof typeof character.equipment)[] = [
          'leftHand', 'rightHand', 'body', 'head', 'legs', 'feet', 
          'accessory1', 'accessory2', 'accessory3', 'accessory4', 'accessory5'
        ];
        for (const s of slots) {
          if (character.equipment && character.equipment[s] && character.equipment[s]?.name && character.equipment[s]!.name.toLowerCase().includes(slotQuery.toLowerCase())) {
            targetSlotKey = s as any;
            break;
          }
        }
      }

      if (targetSlotKey) {
        const res = unequipItem(character, targetSlotKey);
        if (res.success) {
          soundFx.playParchmentTurn();
          setCharacter(res.updatedCharacter);
          showToast(res.message);
          const equipSummary = formatEquipmentSummary(res.updatedCharacter.equipment);
          const unequipLog: TurnLog = {
            id: `sys_unequip_${Date.now()}`,
            turnNumber: turnCount,
            ageDisplay: `${character.stats.age} tuổi ${character.stats.month} tháng`,
            location: character.stats.location,
            playerAction: actionText,
            narration: `[THAO TÁC THÁO TRANG BỊ]\n${res.message}\n\nVật phẩm đã được tháo khỏi cơ thể và cất lại vào túi đồ.`,
            statusSummary: `• Thao tác: ${res.message}\n• Túi đồ: ${res.updatedCharacter.inventory.length}/${res.updatedCharacter.maxInventorySlots || 20} ô\n\n${equipSummary}`,
            equipmentSummaryText: equipSummary,
            systemNotes: [res.message],
            timestamp: Date.now(),
            dangerEncountered: false,
          };
          setLogs((prev) => [...prev, unequipLog]);
          return;
        } else {
          showToast(res.message);
        }
      }
    }

    // ==========================================
    // SYSTEM COMMAND 7: Bán [Vật phẩm / Chiến lợi phẩm]
    // ==========================================
    const isSellAction = trimmed.startsWith('bán ') || trimmed.startsWith('sell ');
    if (isSellAction) {
      const sellQuery = trimmed.replace(/^(?:bán|sell)[:\s]+/i, '').replace(/[\[\]]/g, '').trim();
      if (sellQuery.includes('chiến lợi phẩm') || sellQuery.includes('loot') || sellQuery.includes('rác') || sellQuery.includes('tất cả')) {
        const res = sellAllLootItems(character);
        if (res.success) {
          soundFx.playLevelUp();
          setCharacter(res.updatedCharacter);
          showToast(res.message);
          const equipSummary = formatEquipmentSummary(res.updatedCharacter.equipment);
          const sellLog: TurnLog = {
            id: `sys_sell_loot_${Date.now()}`,
            turnNumber: turnCount,
            ageDisplay: `${character.stats.age} tuổi ${character.stats.month} tháng`,
            location: character.stats.location,
            playerAction: actionText,
            narration: `[THAO TÁC BÁN CHIẾN LỢI PHẨM]\n${res.message}\n\nThương nhân đã kiểm đếm và giao đủ số Xu Asura vào túi tiền của bạn.`,
            statusSummary: `• Thao tác: ${res.message}\n• Túi đồ: ${res.updatedCharacter.inventory.length}/${res.updatedCharacter.maxInventorySlots || 20} ô | Tiền: ${res.updatedCharacter.stats.asuraCoins || 0} Xu Asura\n\n${equipSummary}`,
            equipmentSummaryText: equipSummary,
            systemNotes: [res.message],
            timestamp: Date.now(),
            dangerEncountered: false,
          };
          setLogs((prev) => [...prev, sellLog]);
          return;
        } else {
          showToast(res.message);
          return;
        }
      } else {
        const res = sellItem(character, sellQuery);
        if (res.success) {
          soundFx.playLevelUp();
          setCharacter(res.updatedCharacter);
          showToast(res.message);
          const equipSummary = formatEquipmentSummary(res.updatedCharacter.equipment);
          const sellLog: TurnLog = {
            id: `sys_sell_${Date.now()}`,
            turnNumber: turnCount,
            ageDisplay: `${character.stats.age} tuổi ${character.stats.month} tháng`,
            location: character.stats.location,
            playerAction: actionText,
            narration: `[THAO TÁC BÁN VẬT PHẨM]\n${res.message}`,
            statusSummary: `• Thao tác: ${res.message}\n• Túi đồ: ${res.updatedCharacter.inventory.length}/${res.updatedCharacter.maxInventorySlots || 20} ô | Tiền: ${res.updatedCharacter.stats.asuraCoins || 0} Xu Asura\n\n${equipSummary}`,
            equipmentSummaryText: equipSummary,
            systemNotes: [res.message],
            timestamp: Date.now(),
            dangerEncountered: false,
          };
          setLogs((prev) => [...prev, sellLog]);
          return;
        } else {
          showToast(res.message);
          return;
        }
      }
    }

    // ==========================================
    // SYSTEM COMMAND 8: Vứt / Hủy [Vật phẩm]
    // ==========================================
    const isDiscardAction = trimmed.startsWith('vứt ') || trimmed.startsWith('hủy ') || trimmed.startsWith('bỏ ') || trimmed.startsWith('vứt bỏ ') || trimmed.startsWith('drop ') || trimmed.startsWith('discard ');
    if (isDiscardAction) {
      const discardQuery = trimmed.replace(/^(?:vứt\s+bỏ|vứt|hủy|bỏ|drop|discard)[:\s]+/i, '').replace(/[\[\]]/g, '').trim();
      const res = discardItem(character, discardQuery);
      if (res.success) {
        soundFx.playParchmentTurn();
        setCharacter(res.updatedCharacter);
        showToast(res.message);
        const equipSummary = formatEquipmentSummary(res.updatedCharacter.equipment);
        const discardLog: TurnLog = {
          id: `sys_discard_${Date.now()}`,
          turnNumber: turnCount,
          ageDisplay: `${character.stats.age} tuổi ${character.stats.month} tháng`,
          location: character.stats.location,
          playerAction: actionText,
          narration: `[THAO TÁC VỨT BỎ VẬT PHẨM]\n${res.message}`,
          statusSummary: `• Thao tác: ${res.message}\n• Túi đồ: ${res.updatedCharacter.inventory.length}/${res.updatedCharacter.maxInventorySlots || 20} ô\n\n${equipSummary}`,
          equipmentSummaryText: equipSummary,
          systemNotes: [res.message],
          timestamp: Date.now(),
          dangerEncountered: false,
        };
        setLogs((prev) => [...prev, discardLog]);
        return;
      } else {
        showToast(res.message);
        return;
      }
    }

    setIsAiProcessing(true);
    const nextTurnNumber = turnCount + 1;

    try {
      // Dynamic audio feedback based on action category
      if (selectedChoice?.category === 'magic' || actionText.toLowerCase().includes('ma pháp') || actionText.toLowerCase().includes('phép')) {
        soundFx.playMagicCast();
      } else if (selectedChoice?.category === 'sword' || actionText.toLowerCase().includes('kiếm') || actionText.toLowerCase().includes('trảm')) {
        soundFx.playSwordClash();
      } else {
        soundFx.playClick();
      }

      // Smooth micro-transition delay (130ms) for tactile responsiveness
      await new Promise((resolve) => setTimeout(resolve, 130));

      const turnResult = processProceduralTurn(character, actionText, nextTurnNumber, selectedChoice);

      const updatedChar = turnResult.updatedCharacter || character;

      // Visual & Audio Impact Feedback
      if (turnResult.isGameOver || turnResult.narration?.includes('💀') || turnResult.narration?.includes('CÁI CHẾT')) {
        soundFx.playDeathGong();
        triggerImpactShake();
      } else if (turnResult.narration?.includes('💥') || turnResult.narration?.includes('SÁT THƯƠNG')) {
        soundFx.playCriticalStrike();
        triggerImpactShake();
      } else if (updatedChar.magic.chantless && !character.magic.chantless) {
        soundFx.playLevelUp();
        showToast('★ ĐÃ MỞ KHÓA VÔ NIỆM CHÚ (Chantless Magic)!');
      } else if (updatedChar.combat?.inCombat) {
        soundFx.playSwordClash();
      }

      const newLog: TurnLog = {
        id: `turn_${nextTurnNumber}_${Date.now()}`,
        turnNumber: nextTurnNumber,
        ageDisplay: `${updatedChar.stats.age} tuổi ${updatedChar.stats.month} tháng`,
        location: updatedChar.stats.location,
        playerAction: actionText,
        narration: turnResult.narration,
        rippleEffectText: turnResult.rippleEffectText,
        statusSummary: turnResult.statusSummary,
        combatHudText: turnResult.combatHudText,
        equipmentSummaryText: turnResult.equipmentSummaryText,
        reputationSummaryText: turnResult.reputationSummaryText,
        systemNotes: turnResult.systemNotes || [],
        timestamp: Date.now(),
        dangerEncountered: turnResult.isGameOver || updatedChar.combat?.inCombat,
      };

      if (
        updatedChar.reputation?.currentEpithet &&
        character.reputation?.currentEpithet &&
        updatedChar.reputation.currentEpithet !== character.reputation.currentEpithet
      ) {
        soundFx.playLevelUp();
        showToast(`🏆 Được xưng tụng danh xưng mới: [${updatedChar.reputation.currentEpithet}]!`);
      }

      setCharacter(updatedChar);
      // Qua lượt mới thì xóa lượt cũ đi: chỉ hiển thị lượt mới nhất trên màn hình chính!
      setLogs([newLog]);
      const nextHistory = [...historyLogs, newLog];
      setHistoryLogs(nextHistory);
      setChoices(turnResult.choices || []);
      setTurnCount(nextTurnNumber);

      // Lưu tiến trình tức thì và liên tục vào localStorage
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            character: updatedChar,
            logs: [newLog],
            historyLogs: nextHistory,
            choices: turnResult.choices || [],
            turnCount: nextTurnNumber,
          })
        );
      } catch {}

      // Auto-save checkpoint at milestones (every 2 years or age 5, 7, 10, 15)
      if (
        (updatedChar.stats.age > character.stats.age &&
          [3, 5, 7, 10, 12, 15].includes(updatedChar.stats.age)) &&
        !updatedChar.isDead
      ) {
        handleSaveCheckpoint();
        showToast(`Tự động lưu Checkpoint tại cột mốc ${updatedChar.stats.age} tuổi!`);
      }
    } catch (turnErr) {
      console.error('Turn simulation error, recovering safely:', turnErr);
      try {
        const turnResult = processProceduralTurn(character, actionText, nextTurnNumber, selectedChoice);
        const newLog: TurnLog = {
          id: `turn_${nextTurnNumber}_${Date.now()}`,
          turnNumber: nextTurnNumber,
          ageDisplay: `${turnResult.updatedCharacter?.stats?.age ?? character.stats.age} tuổi ${turnResult.updatedCharacter?.stats?.month ?? character.stats.month} tháng`,
          location: turnResult.updatedCharacter?.stats?.location ?? character.stats.location,
          playerAction: actionText,
          narration: turnResult.narration || `Bạn đã thực hiện hành động: "${actionText}". Không gian xung quanh ghi nhận phản ứng của quyết định này.`,
          rippleEffectText: turnResult.rippleEffectText,
          statusSummary: turnResult.statusSummary || `• Vị trí: ${character.stats.location}\n• HP: ${character.stats.healthCurrent}/${character.stats.healthMax}`,
          combatHudText: turnResult.combatHudText,
          equipmentSummaryText: turnResult.equipmentSummaryText,
          systemNotes: turnResult.systemNotes || ['Đã hoàn tất lượt chơi.'],
          timestamp: Date.now(),
          dangerEncountered: turnResult.isGameOver || !!turnResult.updatedCharacter?.combat?.inCombat,
        };

        if (turnResult.updatedCharacter?.combat?.inCombat) {
          soundFx.playSwordClash();
        }

        const safeChar = turnResult.updatedCharacter || character;
        setCharacter(safeChar);
        setLogs([newLog]);
        const nextHistory = [...historyLogs, newLog];
        setHistoryLogs(nextHistory);
        setChoices(turnResult.choices && turnResult.choices.length > 0 ? turnResult.choices : choices);
        setTurnCount(nextTurnNumber);
      } catch (fatalErr) {
        console.error('Fatal procedural error, using emergency state:', fatalErr);
        // Emergency state: Advance age slightly and provide safe continuation
        const safeChar = { ...character };
        const safeLog: TurnLog = {
          id: `turn_safe_${nextTurnNumber}_${Date.now()}`,
          turnNumber: nextTurnNumber,
          ageDisplay: `${safeChar.stats.age} tuổi ${safeChar.stats.month} tháng`,
          location: safeChar.stats.location,
          playerAction: actionText,
          narration: `[TIẾP TỤC HÀNH TRÌNH]\nBạn cẩn trọng triển khai: "${actionText}". Mọi diễn biến tại ${safeChar.stats.location} diễn ra bình ổn, bạn tích lũy thêm kinh nghiệm thực tế.`,
          statusSummary: `• HP: ${safeChar.stats.healthCurrent}/${safeChar.stats.healthMax} | MP: ${safeChar.stats.manaCurrent}/${safeChar.stats.manaMax}`,
          systemNotes: ['Hệ thống đã tự động bảo lưu an toàn dữ liệu nhân vật.'],
          timestamp: Date.now(),
        };
        setCharacter(safeChar);
        setLogs([safeLog]);
        setHistoryLogs([...historyLogs, safeLog]);
        const fallbackChoices: TurnChoice[] = (choices && choices.length > 0) ? choices : [
          {
            id: 'safe_continue_1',
            label: 'Quan sát cẩn trọng tình hình xung quanh và điều hòa hơi thở',
            actionText: 'Tập trung quan sát địa hình xung quanh, tĩnh tâm điều hòa nhịp thở và kiểm tra trạng thái.',
            riskLevel: 'safe' as const,
            category: 'explore' as const,
            sandboxCategory: 'explore' as const,
          },
          {
            id: 'safe_continue_2',
            label: 'Ngồi thiền định cảm nhận dòng chảy năng lượng trong cơ thể',
            actionText: 'Ngồi thiền định, kiểm soát dòng chảy mana và thể lực để ổn định trạng thái.',
            riskLevel: 'safe' as const,
            category: 'magic' as const,
            sandboxCategory: 'cultivation' as const,
          }
        ];
        setChoices(fallbackChoices);
        setTurnCount(nextTurnNumber);
      }
    } finally {
      setIsAiProcessing(false);
    }
  };

  // Checkpoint Operations
  const handleSaveCheckpoint = () => {
    if (!character || character.isDead) return;
    try {
      const meta = {
        savedAtAge: character.stats.age,
        savedLocation: character.stats.location,
        savedTimestamp: Date.now(),
      };
      localStorage.setItem(
        CHECKPOINT_KEY,
        JSON.stringify({
          character,
          logs,
          choices,
          turnCount,
          meta,
          historyLogs: historyLogs.length > 0 ? historyLogs : logs,
        })
      );
      setHasCheckpoint(true);
      setCheckpointMeta(meta);
      soundFx.playParchmentTurn();
      showToast('Đã lưu Điểm Lưu (Checkpoint) an toàn!');
    } catch {
      showToast('Lỗi khi ghi nhớ Checkpoint vào bộ nhớ.');
    }
  };

  const handleLoadCheckpoint = () => {
    try {
      const savedCp = localStorage.getItem(CHECKPOINT_KEY);
      if (savedCp) {
        const parsed = JSON.parse(savedCp);
        setCharacter(parsed.character);
        const full = parsed.historyLogs && parsed.historyLogs.length > 0 ? parsed.historyLogs : parsed.logs;
        setHistoryLogs(full);
        setLogs(full.length > 0 ? [full[full.length - 1]] : parsed.logs);
        setChoices(parsed.choices);
        setTurnCount(parsed.turnCount);
        soundFx.playLevelUp();
        showToast('Đã phục hồi thành công từ Điểm Lưu (Checkpoint)!');
      } else {
        showToast('Chưa có Checkpoint nào được lưu.');
      }
    } catch {
      showToast('Không thể tải Checkpoint.');
    }
  };

  // Export & Import Save JSON
  const handleExportSave = () => {
    if (!character) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(
      JSON.stringify({ 
        character, 
        logs, 
        historyLogs: historyLogs.length > 0 ? historyLogs : logs, 
        choices, 
        turnCount 
      }, null, 2)
    );
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `MushokuRPG_${character.name}_Age${character.stats.age}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Đã xuất file lưu trữ JSON.');
  };

  const handleImportSave = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed.character && (parsed.logs || parsed.historyLogs)) {
            setCharacter(parsed.character);
            const full = parsed.historyLogs && parsed.historyLogs.length > 0 ? parsed.historyLogs : parsed.logs;
            setHistoryLogs(full);
            setLogs(full.length > 0 ? [full[full.length - 1]] : parsed.logs);
            setChoices(parsed.choices || []);
            setTurnCount(parsed.turnCount || parsed.logs.length);
            setHasStarted(true);
            setShowReincarnateModal(false);
            soundFx.playLevelUp();
            showToast('Đã nạp file lưu thành công!');
          }
        } catch {
          showToast('File lưu không hợp lệ.');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleConfirmSurrender = () => {
    if (!character) return;
    try {
      const ageScore = character.stats.age * 20;
      const turnScore = turnCount * 5;
      const magicScore = character.magic.chantless ? 80 : character.magic.chantlessProgress;
      const toukiScore = character.stats.touki * 2;
      const knowledgeScore = character.stats.knowledge * 2;
      const totalPoints = ageScore + turnScore + magicScore + toukiScore + knowledgeScore;

      // Preserve all SP & KP into legacy storage
      saveCarriedProgression(character, totalPoints);
      const updatedCarried = getCarriedProgression();
      setCarriedProgression(updatedCarried);

      setLegacyNgBonus(`+${totalPoints} Điểm Kế Thừa Kiếp Sau từ cuộc đời của ${character.name}! (Bảo lưu toàn bộ ${updatedCarried.carriedSkillPoints} SP & ${updatedCarried.carriedKnowledgePoints} KP)`);

      // Clear active progress
      localStorage.removeItem(STORAGE_KEY);

      setShowSurrenderModal(false);
      setCharacter(null);
      setLogs([]);
      setHistoryLogs([]);
      setChoices([]);
      setTurnCount(1);
      setHasStarted(false);
      setShowReincarnateModal(true);
      showToast(`Đã buông xuôi cuộc đời. Bảo lưu toàn bộ ${updatedCarried.carriedSkillPoints} SP & ${updatedCarried.carriedKnowledgePoints} KP cho kiếp mới!`);
    } catch {
      showToast('Có lỗi xảy ra khi hoàn tất buông xuôi.');
    }
  };

  const handleNewReincarnation = (legacyBonus?: string) => {
    // Nếu người chơi vẫn còn sống và cuộc đời đang tiếp diễn, yêu cầu xác nhận đầu hàng/buông xuôi thay vì xóa mất tiến trình
    if (character && !character.isDead && hasStarted) {
      setShowSurrenderModal(true);
      return;
    }

    if (character) {
      saveCarriedProgression(character);
      const updatedCarried = getCarriedProgression();
      setCarriedProgression(updatedCarried);
    }

    if (legacyBonus) {
      setLegacyNgBonus(legacyBonus);
    }

    // Nếu người chơi đã tử vong hoặc đồng ý làm mới, tiến trình cũ mới bị xóa để bắt đầu kiếp mới
    if (character?.isDead) {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {}
      setCharacter(null);
      setLogs([]);
      setHistoryLogs([]);
      setChoices([]);
      setTurnCount(1);
      setHasStarted(false);
    }

    const carried = getCarriedProgression();
    setCarriedProgression(carried);
    setShowReincarnateModal(true);
  };

  return (
    <div className="min-h-screen bg-transparent text-stone-900 flex flex-col font-vietnam relative overflow-x-hidden selection:bg-amber-400/40 selection:text-amber-950">
      {/* High-Fidelity Bright Fantasy Background */}
      <FantasyBackground />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 right-4 z-50 px-4 py-2.5 rounded-xl bg-slate-900/95 border border-amber-500/60 text-amber-200 text-xs font-vietnam shadow-[0_0_20px_rgba(245,158,11,0.3)] backdrop-blur-md animate-bounce flex items-center gap-2">
          <span className="text-amber-400">✨</span>
          <span className="font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <div className="relative z-30">
        <Navbar
        onOpenGrimoire={() => setShowGrimoire(true)}
        onOpenWorldMap={() => setShowWorldMapModal(true)}
        onOpenCombatHub={() => setShowHuntingHub(true)}
        onOpenShop={() => setShowShopModal(true)}
        onOpenInventory={() => setShowInventoryModal(true)}
        onOpenSkillTree={() => {
          soundFx.playParchmentTurn();
          setShowSkillTreeModal(true);
        }}
        onOpenTimeSkip={() => {
          soundFx.playParchmentTurn();
          setShowTimeSkipModal(true);
        }}
        onOpenSurrender={() => setShowSurrenderModal(true)}
        onSaveCheckpoint={handleSaveCheckpoint}
        onLoadCheckpoint={handleLoadCheckpoint}
        onNewGame={handleNewReincarnation}
        hasCheckpoint={hasCheckpoint}
        onExportSave={handleExportSave}
        onImportSave={handleImportSave}
      />
      </div>

      {/* Main Play Area */}
      <main className={`flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 flex flex-col lg:flex-row gap-5 relative z-10 transition-transform duration-200 ${isScreenShaking ? 'animate-combat-shake' : ''}`}>
        {character ? (
          <>
            {/* Left HUD: Character Attributes, Tiers, Bonds */}
            <CharacterHud 
              character={character} 
              onOpenInventory={() => setShowInventoryModal(true)}
              onOpenSkillTree={() => {
                soundFx.playParchmentTurn();
                setShowSkillTreeModal(true);
              }}
            />

            {/* Right Column: Story Chronicles & Interactive Actions */}
            <section className="flex-1 flex flex-col gap-4 min-w-0">
              <StoryLogView 
                logs={logs} 
                totalChronicleCount={historyLogs.length > 0 ? historyLogs.length : logs.length}
                isAiProcessing={isAiProcessing} 
                onClearOldLogs={() => {
                  if (logs.length > 1) {
                    setLogs([logs[logs.length - 1]]);
                    showToast('Đã dọn dẹp các lượt cũ, chỉ giữ 1 lượt hiện tại!');
                  }
                }}
                onOpenHistory={() => setShowHistoryModal(true)}
              />

              {/* Combat HUD when in battle */}
              {character.combat?.inCombat && (
                <CombatHud
                  combat={character.combat}
                  character={character}
                  onQuickTactic={(tactic) => handleExecuteTurn(tactic)}
                  disabled={isAiProcessing}
                />
              )}

              {!character.isDead && (
                <ActionPanel
                  choices={choices}
                  character={character}
                  onSelectChoice={(choice) => handleExecuteTurn(choice.actionText || choice.label || '', choice)}
                  onCustomAction={(customText) => handleExecuteTurn(customText)}
                  onOpenCombatHub={() => setShowHuntingHub(true)}
                  onOpenWorldMap={() => setShowWorldMapModal(true)}
                  onOpenShop={() => setShowShopModal(true)}
                  onOpenInventory={() => setShowInventoryModal(true)}
                  onOpenSkillTree={() => {
                    soundFx.playParchmentTurn();
                    setShowSkillTreeModal(true);
                  }}
                  onOpenTimeSkip={() => {
                    soundFx.playParchmentTurn();
                    setShowTimeSkipModal(true);
                  }}
                  disabled={isAiProcessing}
                  currentAge={character.stats.age}
                  isInCombat={character.combat?.inCombat}
                />
              )}
            </section>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center min-h-[60vh] text-stone-400 font-serif">
            Đang chuẩn bị không gian hư vô chuyển sinh...
          </div>
        )}
      </main>

      {/* Reincarnation Creation Modal */}
      {showReincarnateModal && (
        <ReincarnationModal 
          onStart={handleStartReincarnation}
          carriedSp={carriedProgression.carriedSkillPoints}
          carriedKp={carriedProgression.carriedKnowledgePoints}
          lastCharacterName={carriedProgression.lastCharacterName}
        />
      )}

      {/* Combat Hub & Regional Hunting Modal */}
      {showHuntingHub && character && (
        <HuntingHubModal
          character={character}
          onSelectHunt={(huntAction) => handleExecuteTurn(huntAction)}
          onClose={() => setShowHuntingHub(false)}
          disabled={isAiProcessing}
        />
      )}

      {/* Shop, Trade & Crafting Modal */}
      {showShopModal && character && (
        <ShopCraftModal
          character={character}
          onUpdateCharacter={(updated) => setCharacter(updated)}
          onClose={() => setShowShopModal(false)}
          onLogMessage={(msg) => {
            showToast(msg);
            const shopLog: TurnLog = {
              id: `shop_${Date.now()}`,
              turnNumber: turnCount,
              ageDisplay: `${character.stats.age} tuổi ${character.stats.month} tháng`,
              location: character.stats.location,
              playerAction: 'Giao dịch tại Thương Hội / Chế tạo trang bị',
              narration: `[THƯƠNG HỘI & CHẾ TẠO TRANG BỊ]\n${msg}`,
              statusSummary: `• Tiền tệ: ${character.stats.asuraCoins || 0} Xu Asura | Kho đồ: ${character.inventory.length} vật phẩm`,
              systemNotes: ['Giao dịch thành công tại Thương Hội.'],
              timestamp: Date.now(),
              dangerEncountered: false,
            };
            setLogs((prev) => [...prev, shopLog]);
          }}
        />
      )}

      {/* Equipment Slots & Inventory Grid Modal */}
      {showInventoryModal && character && (
        <EquipmentInventoryModal
          character={character}
          onUpdateCharacter={(updated) => setCharacter(updated)}
          onClose={() => setShowInventoryModal(false)}
          onLogMessage={(msg) => {
            showToast(msg);
            const equipLog: TurnLog = {
              id: `equip_log_${Date.now()}`,
              turnNumber: turnCount,
              ageDisplay: `${character.stats.age} tuổi ${character.stats.month} tháng`,
              location: character.stats.location,
              playerAction: 'Thao tác trên Bảng Ô Trang Bị & Túi Đồ',
              narration: `[THAY ĐỔI TRANG BỊ & TÚI ĐỒ]\n${msg}`,
              statusSummary: `• Túi đồ: ${character.inventory.length}/${character.maxInventorySlots || 20} ô | Tiền tệ: ${character.stats.asuraCoins || 0} Xu Asura\n\n${formatEquipmentSummary(character.equipment)}`,
              equipmentSummaryText: formatEquipmentSummary(character.equipment),
              systemNotes: [msg],
              timestamp: Date.now(),
              dangerEncountered: false,
            };
            setLogs((prev) => [...prev, equipLog]);
          }}
        />
      )}

      {/* 1-Year Fast Forward / Seclusion Training Modal */}
      {showTimeSkipModal && character && (
        <TimeSkipModal
          isOpen={showTimeSkipModal}
          onClose={() => setShowTimeSkipModal(false)}
          onConfirm={(_type, routineActionText) => {
            handleExecuteTurn(routineActionText);
          }}
          currentAge={character.stats.age}
          character={character}
          isInCombat={character.combat?.inCombat}
        />
      )}

      {/* Permadeath / Game Over Modal */}
      {character && character.isDead && (
        <PermadeathModal
          character={character}
          deathReason={character.deathReason}
          hasCheckpoint={hasCheckpoint}
          checkpointInfo={checkpointMeta}
          onLoadCheckpoint={handleLoadCheckpoint}
          onNewReincarnation={handleNewReincarnation}
        />
      )}

      {/* Lore Grimoire Modal */}
      {showGrimoire && <GrimoireModal onClose={() => setShowGrimoire(false)} />}

      {/* Chronicle History Modal */}
      {showHistoryModal && (
        <ChronicleHistoryModal
          logs={historyLogs.length > 0 ? historyLogs : logs}
          onClose={() => setShowHistoryModal(false)}
        />
      )}

      {/* Surrender / Give Up Modal */}
      {showSurrenderModal && character && (
        <SurrenderModal
          character={character}
          turnCount={turnCount}
          hasCheckpoint={hasCheckpoint}
          onConfirmSurrender={handleConfirmSurrender}
          onLoadCheckpoint={handleLoadCheckpoint}
          onClose={() => setShowSurrenderModal(false)}
        />
      )}

      {/* Six-Faced World Map & Fast Travel Engine Modal */}
      {showWorldMapModal && character && (
        <WorldMapModal
          character={character}
          onUpdateCharacter={(updated) => {
            setCharacter(updated);
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            } catch (e) {
              console.error('Failed to save character state:', e);
            }
          }}
          onClose={() => setShowWorldMapModal(false)}
          onLogMessage={(msg: string) => {
            showToast(msg);
            const travelLog: TurnLog = {
              id: `travel_${Date.now()}`,
              turnNumber: turnCount,
              ageDisplay: `${character.stats.age} tuổi ${character.stats.month} tháng`,
              location: character.stats.location,
              playerAction: 'Dịch Chuyển Nhanh / Lữ Hành Thế Giới Sáu Mặt',
              narration: `[BẢN ĐỒ THẾ GIỚI & DỊCH CHUYỂN NHANH]\n${msg}`,
              statusSummary: `• Vị trí mới: ${character.stats.location} | Tuổi: ${character.stats.age} tuổi ${character.stats.month} tháng\n• Mana: ${character.stats.manaCurrent}/${character.stats.manaMax} | Xu Asura: ${character.stats.asuraCoins || 0}`,
              systemNotes: [msg],
              timestamp: Date.now(),
              dangerEncountered: msg.includes('CẢNH BÁO PHỤC KÍCH'),
            };
            setLogs((prev) => [...prev, travelLog]);
          }}
        />
      )}

      {/* Exponential Bottleneck Skill Tree & Breakthrough Modal */}
      {showSkillTreeModal && character && (
        <SkillTreeModal
          character={character}
          onClose={() => setShowSkillTreeModal(false)}
          onUpdateCharacter={(updated) => {
            setCharacter(updated);
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            } catch (e) {
              console.error('Failed to save character state:', e);
            }
          }}
          onLogMessage={(msg: string) => {
            showToast(msg);
            const breakthroughLog: TurnLog = {
              id: `breakthrough_${Date.now()}`,
              turnNumber: turnCount,
              ageDisplay: `${character.stats.age} tuổi ${character.stats.month} tháng`,
              location: character.stats.location,
              playerAction: 'Đột phá cảnh giới trên Cây Kỹ Năng Đa Diện',
              narration: `[TIẾN TRÌNH & ĐỘT PHÁ CẢNH GIỚI]\n${msg}`,
              statusSummary: `• SP Khả dụng: ${character.progression?.skillPoints || 0} | KP Khả dụng: ${character.progression?.knowledgePoints || 0}\n• Rank tổng thể: ${character.progression?.overallRank || 'Chưa định hình'}`,
              systemNotes: [msg],
              timestamp: Date.now(),
              dangerEncountered: false,
            };
            setLogs((prev) => [...prev, breakthroughLog]);
          }}
        />
      )}
    </div>
  );
}
