import React, { useState } from 'react';
import type { Character, EquipmentSlotKey, InventoryItem } from '../types/game.ts';
import { EQUIPMENT_SLOT_LABELS } from '../types/game.ts';
import { 
  calculateTotalEquipBonuses, 
  equipItem, 
  unequipItem,
  getValidSlotsForItem,
  calculateItemSellValue,
  sellItem,
  sellAllLootItems,
  discardItem
} from '../services/mushokuRules.ts';
import { soundFx } from '../services/soundFx.ts';
import { 
  Package, 
  X, 
  Shield, 
  Sword, 
  Sparkles, 
  Zap, 
  Footprints, 
  Coins, 
  Heart, 
  PlusCircle, 
  ArrowUpRight, 
  Trash2,
  Sliders,
  Crown,
  AlertTriangle
} from 'lucide-react';

interface EquipmentInventoryModalProps {
  character: Character;
  onUpdateCharacter: (updated: Character) => void;
  onClose: () => void;
  onLogMessage: (msg: string) => void;
}

export const EquipmentInventoryModal: React.FC<EquipmentInventoryModalProps> = ({
  character,
  onUpdateCharacter,
  onClose,
  onLogMessage,
}) => {
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [selectedSlotForEquip, setSelectedSlotForEquip] = useState<EquipmentSlotKey | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<'all' | 'equipment' | 'loot' | 'consumable'>('all');
  const [itemToConfirmDiscard, setItemToConfirmDiscard] = useState<{ item: InventoryItem; slotKey?: EquipmentSlotKey } | null>(null);

  const accSlots: EquipmentSlotKey[] = ['accessory1', 'accessory2', 'accessory3', 'accessory4', 'accessory5'];

  const isEquippableItem = (item: InventoryItem | null | undefined): boolean => {
    if (!item) return false;
    return getValidSlotsForItem(item).length > 0;
  };

  const handleSelectItem = (item: InventoryItem) => {
    setSelectedItem(item);
    const valid = getValidSlotsForItem(item);
    if (valid.length > 0) {
      // If user had previously selected a target slot and it's valid for this item, keep it!
      if (selectedSlotForEquip && valid.includes(selectedSlotForEquip)) {
        // Keep selectedSlotForEquip
      } else if (item.type === 'accessory' || item.equipSlot === 'accessory' || valid.includes('accessory1')) {
        // Find first empty accessory slot (1 through 5)
        const freeAcc = accSlots.find(s => !character.equipment[s]);
        setSelectedSlotForEquip(freeAcc || 'accessory1');
      } else {
        const freeSlot = valid.find(s => !character.equipment[s]);
        setSelectedSlotForEquip(freeSlot || valid[0]);
      }
    } else {
      setSelectedSlotForEquip(undefined);
    }
    soundFx.playParchmentTurn();
  };

  const maxSlots = character.maxInventorySlots || 20;
  const currentItemCount = character.inventory.length;
  const totalBonuses = calculateTotalEquipBonuses(character.equipment);

  const equipmentSlots: { key: EquipmentSlotKey; label: string; icon: React.ReactNode }[] = [
    { key: 'head', label: 'Ô Đầu (Mũ / Khăn)', icon: <Crown className="w-4 h-4 text-amber-400" /> },
    { key: 'body', label: 'Ô Giáp Thân (Áo / Choàng)', icon: <Shield className="w-4 h-4 text-cyan-400" /> },
    { key: 'legs', label: 'Ô Quần (Quần giáp / Vải)', icon: <Sliders className="w-4 h-4 text-indigo-400" /> },
    { key: 'feet', label: 'Ô Giày (Bốt da / Phép)', icon: <Footprints className="w-4 h-4 text-emerald-400" /> },
    { key: 'leftHand', label: 'Tay Trái (Vũ khí / Khiên / Trượng)', icon: <Sword className="w-4 h-4 text-rose-400" /> },
    { key: 'rightHand', label: 'Tay Phải (Vũ khí / Khiên / Trượng)', icon: <Sword className="w-4 h-4 text-amber-300" /> },
    { key: 'accessory1', label: 'Trang Sức 1', icon: <Sparkles className="w-4 h-4 text-purple-400" /> },
    { key: 'accessory2', label: 'Trang Sức 2', icon: <Sparkles className="w-4 h-4 text-purple-400" /> },
    { key: 'accessory3', label: 'Trang Sức 3', icon: <Sparkles className="w-4 h-4 text-purple-400" /> },
    { key: 'accessory4', label: 'Trang Sức 4', icon: <Sparkles className="w-4 h-4 text-purple-400" /> },
    { key: 'accessory5', label: 'Trang Sức 5', icon: <Sparkles className="w-4 h-4 text-purple-400" /> },
  ];

  // Handle Equip from modal detail panel
  const handleEquipSelectedItem = (targetSlot?: EquipmentSlotKey) => {
    if (!selectedItem) return;
    const valid = getValidSlotsForItem(selectedItem);
    let chosenSlot = targetSlot || selectedSlotForEquip;
    if (!chosenSlot && valid.length > 0) {
      if (selectedItem.type === 'accessory' || selectedItem.equipSlot === 'accessory' || valid.includes('accessory1')) {
        const freeAcc = accSlots.find(s => !character.equipment[s]);
        chosenSlot = freeAcc || 'accessory1';
      } else {
        const freeSlot = valid.find(s => !character.equipment[s]);
        chosenSlot = freeSlot || valid[0];
      }
    }
    const res = equipItem(character, selectedItem.id, chosenSlot);
    if (res.success) {
      soundFx.playSwordClash();
      onUpdateCharacter(res.updatedCharacter);
      onLogMessage(res.message);
      setSelectedItem(null);
      setSelectedSlotForEquip(undefined);
    } else {
      soundFx.playParchmentTurn();
      onLogMessage(`⚠️ ${res.message}`);
    }
  };

  // Direct Equip any item immediately (e.g. from grid button or double click)
  const handleDirectEquipItem = (item: InventoryItem, targetSlot?: EquipmentSlotKey) => {
    const valid = getValidSlotsForItem(item);
    let chosenSlot = targetSlot;
    if (!chosenSlot && valid.length > 0) {
      if (item.type === 'accessory' || item.equipSlot === 'accessory' || valid.includes('accessory1')) {
        // Automatically find next available accessory slot!
        const freeAcc = accSlots.find(s => !character.equipment[s]);
        chosenSlot = freeAcc || 'accessory1';
      } else {
        const freeSlot = valid.find(s => !character.equipment[s]);
        chosenSlot = freeSlot || valid[0];
      }
    }
    const res = equipItem(character, item.id, chosenSlot);
    if (res.success) {
      soundFx.playSwordClash();
      onUpdateCharacter(res.updatedCharacter);
      onLogMessage(res.message);
      if (selectedItem?.id === item.id) {
        setSelectedItem(null);
        setSelectedSlotForEquip(undefined);
      }
    } else {
      soundFx.playParchmentTurn();
      onLogMessage(`⚠️ ${res.message}`);
    }
  };

  // Click on an equipment slot on the left
  const handleSlotClick = (slotKey: EquipmentSlotKey) => {
    const equipped = character.equipment[slotKey];
    if (equipped) {
      // If already equipped, view it
      setSelectedItem(equipped);
      setSelectedSlotForEquip(slotKey);
      soundFx.playParchmentTurn();
      return;
    }

    // Slot is empty: if an item is already selected and it fits this slot, immediately equip it!
    if (selectedItem) {
      const valid = getValidSlotsForItem(selectedItem);
      if (valid.includes(slotKey) || (slotKey.startsWith('accessory') && (selectedItem.type === 'accessory' || valid.includes('accessory1')))) {
        handleDirectEquipItem(selectedItem, slotKey);
        return;
      }
    }

    // Otherwise, filter to equipment tab and highlight target slot
    setActiveTab('equipment');
    setSelectedSlotForEquip(slotKey);
  };

  // Handle Unequip
  const handleUnequipSlot = (slotKey: EquipmentSlotKey) => {
    const res = unequipItem(character, slotKey);
    if (res.success) {
      soundFx.playParchmentTurn();
      onUpdateCharacter(res.updatedCharacter);
      onLogMessage(res.message);
      if (selectedItem && (character.equipment[slotKey]?.id === selectedItem.id)) {
        setSelectedItem(null);
      }
    } else {
      onLogMessage(`⚠️ ${res.message}`);
    }
  };

  // Handle Sell single item (from bag or equipment)
  const handleSellSingleItem = (item: InventoryItem, fromSlot?: EquipmentSlotKey) => {
    const res = sellItem(character, fromSlot || item.id);
    if (res.success) {
      soundFx.playLevelUp();
      onUpdateCharacter(res.updatedCharacter);
      onLogMessage(res.message);
      if (selectedItem?.id === item.id) {
        setSelectedItem(null);
        setSelectedSlotForEquip(undefined);
      }
    } else {
      onLogMessage(`⚠️ ${res.message}`);
    }
  };

  // Handle Sell all loot in bag
  const handleSellAllLoot = () => {
    const res = sellAllLootItems(character);
    if (res.success) {
      soundFx.playLevelUp();
      onUpdateCharacter(res.updatedCharacter);
      onLogMessage(res.message);
      if (selectedItem && selectedItem.type === 'loot') {
        setSelectedItem(null);
      }
    } else {
      onLogMessage(`⚠️ ${res.message}`);
    }
  };

  // Handle Discard item confirmation execution
  const executeDiscard = () => {
    if (!itemToConfirmDiscard) return;
    const { item, slotKey } = itemToConfirmDiscard;
    const res = discardItem(character, slotKey || item.id);
    if (res.success) {
      soundFx.playParchmentTurn();
      onUpdateCharacter(res.updatedCharacter);
      onLogMessage(res.message);
      if (selectedItem?.id === item.id) {
        setSelectedItem(null);
        setSelectedSlotForEquip(undefined);
      }
    } else {
      onLogMessage(`⚠️ ${res.message}`);
    }
    setItemToConfirmDiscard(null);
  };

  // Handle Use Consumable (Potion)
  const handleUseItem = (item: InventoryItem) => {
    const bonus = item.statBonus;
    if (!bonus || (!bonus.hpHealAmount && !bonus.staminaHealAmount)) return;

    const newInventory = character.inventory.filter(i => i.id !== item.id);
    const updated: Character = {
      ...character,
      stats: {
        ...character.stats,
        healthCurrent: Math.min(character.stats.healthMax, character.stats.healthCurrent + (bonus.hpHealAmount || 0)),
        staminaCurrent: Math.min(character.stats.staminaMax, character.stats.staminaCurrent + (bonus.staminaHealAmount || 0)),
      },
      inventory: newInventory,
    };
    soundFx.playLevelUp();
    onUpdateCharacter(updated);
    onLogMessage(`Đã sử dụng [${item.name}]: Hồi phục +${bonus.hpHealAmount || 0} HP, +${bonus.staminaHealAmount || 0} Thể lực.`);
    setSelectedItem(null);
  };

  // Expand bag capacity
  const handleExpandBag = (additionalSlots: number, cost: number, bagName: string) => {
    if ((character.stats.asuraCoins || 0) < cost) {
      onLogMessage(`⚠️ Không đủ tiền mua ${bagName}! Cần ${cost} Xu Asura.`);
      return;
    }
    const updated: Character = {
      ...character,
      maxInventorySlots: maxSlots + additionalSlots,
      stats: {
        ...character.stats,
        asuraCoins: (character.stats.asuraCoins || 0) - cost,
      },
    };
    soundFx.playLevelUp();
    onUpdateCharacter(updated);
    onLogMessage(`🎉 Đã mua thành công [${bagName}] (-${cost} Xu Asura)! Sức chứa túi đồ mở rộng lên ${updated.maxInventorySlots} ô.`);
  };

  // Filter inventory items
  const filteredInventory = character.inventory.filter(item => {
    if (activeTab === 'equipment') {
      return isEquippableItem(item);
    }
    if (activeTab === 'loot') {
      return item.type === 'loot';
    }
    if (activeTab === 'consumable') {
      return item.type === 'consumable';
    }
    return true;
  });

  const lootItems = character.inventory.filter(i => i.type === 'loot');
  const lootTotalSellValue = lootItems.reduce((acc, i) => acc + calculateItemSellValue(i), 0);

  // Generate 20+ grid slots array
  const gridCells = Array.from({ length: maxSlots }, (_, index) => {
    return filteredInventory[index] || null;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md">
      <div className="bg-stone-900 border-2 border-amber-800/80 rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl text-stone-200 overflow-hidden font-sans relative">
        
        {/* Discard Confirmation Modal Overlay */}
        {itemToConfirmDiscard && (
          <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-stone-950 border-2 border-red-700/80 rounded-2xl p-5 max-w-md w-full shadow-2xl text-stone-100 space-y-4 animate-in fade-in zoom-in-95">
              <div className="flex items-center gap-3 text-red-400">
                <div className="p-2 rounded-xl bg-red-950/80 border border-red-700">
                  <AlertTriangle className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-red-200">Xác Nhận Vứt Bỏ Vật Phẩm</h3>
                  <span className="text-[10px] font-mono text-stone-400 uppercase">Hành động không thể hoàn tác</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-stone-900 border border-stone-800 space-y-1.5 text-xs">
                <div className="font-serif font-bold text-amber-300 text-sm">
                  [{itemToConfirmDiscard.item.name}]
                </div>
                <p className="text-stone-400 font-serif text-[11px] line-clamp-2">
                  {itemToConfirmDiscard.item.description}
                </p>
                <div className="text-[10px] font-mono text-stone-500 pt-1 border-t border-stone-800 flex justify-between">
                  <span>Giá trị nếu bán: {calculateItemSellValue(itemToConfirmDiscard.item)} Xu</span>
                  <span>Giải phóng: 1 ô chứa</span>
                </div>
              </div>

              <p className="text-xs text-stone-300 font-serif">
                Bạn có chắc chắn muốn <span className="text-red-400 font-bold">tiêu hủy vĩnh viễn</span> vật phẩm này khỏi túi đồ/cơ thể?
              </p>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setItemToConfirmDiscard(null)}
                  className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-mono transition cursor-pointer"
                >
                  Hủy Bỏ / Giữ Lại
                </button>
                <button
                  type="button"
                  onClick={executeDiscard}
                  className="px-4 py-2 rounded-xl bg-red-700 hover:bg-red-600 text-white text-xs font-mono font-bold flex items-center gap-1.5 transition cursor-pointer shadow-lg shadow-red-950/60"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xác Nhận Vứt</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="bg-gradient-to-r from-stone-950 via-amber-950 to-stone-950 px-6 py-4 border-b border-amber-800/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-600/20 border border-amber-500/40 text-amber-400">
              <Package className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-amber-400 block">
                HỆ THỐNG TRANG BỊ & HÀNH TRANG • 11 Ô THÂN THỂ (5 TRANG SỨC) & LƯỚI TÚI ĐỒ
              </span>
              <h2 className="font-serif font-bold text-lg text-amber-100 flex items-center gap-2">
                Kho Đồ Của {character.name} ({currentItemCount} / {maxSlots} Ô chứa)
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Stats Banner */}
        <div className="bg-stone-950 px-6 py-2.5 border-b border-stone-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1.5 text-amber-300 font-mono">
              <Coins className="w-4 h-4 text-amber-400" />
              <span>Tiền tệ: <strong>{character.stats.asuraCoins || 0}</strong> Xu Asura</span>
            </div>
            <div className="flex items-center gap-1.5 text-cyan-300 font-mono">
              <Shield className="w-4 h-4 text-cyan-400" />
              <span>Giáp trang bị: <strong>+{totalBonuses.defenseBonus || 0}</strong></span>
            </div>
            <div className="flex items-center gap-1.5 text-rose-300 font-mono">
              <Sword className="w-4 h-4 text-rose-400" />
              <span>Xuyên giáp Touki: <strong>+{totalBonuses.toukiPenetration || 0}</strong></span>
            </div>
            <div className="flex items-center gap-1.5 text-purple-300 font-mono">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Sát thương phép: <strong>+{totalBonuses.magicDamageBonus || 0}</strong></span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-300 font-mono">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span>Nhanh nhẹn/Né: <strong>+{totalBonuses.speedAgilityBonus || 0}</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-stone-400">
            <button
              onClick={() => handleExpandBag(10, 50, 'Túi Da Ma Thú (+10 ô)')}
              className="text-[10px] px-2.5 py-1 rounded bg-stone-900 border border-amber-800/60 hover:bg-amber-950 text-amber-300 transition cursor-pointer flex items-center gap-1"
              title="Mua thêm 10 ô chứa túi đồ"
            >
              <PlusCircle className="w-3 h-3 text-amber-400" />
              <span>+10 Ô (50 xu)</span>
            </button>
            <button
              onClick={() => handleExpandBag(30, 150, 'Túi Không Gian Ma Pháp (+30 ô)')}
              className="text-[10px] px-2.5 py-1 rounded bg-stone-900 border border-purple-800/60 hover:bg-purple-950 text-purple-300 transition cursor-pointer flex items-center gap-1"
              title="Mua túi không gian ma thuật mở rộng 30 ô"
            >
              <Sparkles className="w-3 h-3 text-purple-400" />
              <span>+30 Ô (150 xu)</span>
            </button>
          </div>
        </div>

        {/* Main Content Layout: Left = 11 Equipment Slots, Right = Inventory 20 Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* LEFT COLUMN: 11 EQUIPMENT SLOTS (5 cols on large screen) */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-stone-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-cyan-400" /> 11 Ô Trang Bị Cơ Thể (5 Ô Trang Sức)
              </h3>
              <span className="text-[10px] font-mono text-purple-300">
                Đeo cùng lúc 5 trang sức
              </span>
            </div>

            <div className="space-y-1.5 max-h-[62vh] overflow-y-auto pr-1">
              {equipmentSlots.map((slot) => {
                const equippedItem = character.equipment[slot.key];
                const isTwoHandedOccupy = slot.key === 'rightHand' && character.equipment.leftHand?.isTwoHanded;
                const isTargetSlot = selectedSlotForEquip === slot.key;

                return (
                  <div
                    key={slot.key}
                    onClick={() => handleSlotClick(slot.key)}
                    className={`p-2 rounded-xl border transition-all flex items-center justify-between gap-2 cursor-pointer group ${
                      equippedItem
                        ? 'bg-stone-950/90 border-amber-700/60 shadow-sm hover:border-amber-500'
                        : isTwoHandedOccupy
                        ? 'bg-stone-950/40 border-stone-800/50 opacity-60 cursor-not-allowed'
                        : isTargetSlot
                        ? 'bg-amber-950/40 border-amber-500/80 ring-1 ring-amber-400'
                        : 'bg-stone-950/40 border-stone-800/70 hover:border-amber-700/70 hover:bg-stone-950/70'
                    }`}
                    title={equippedItem ? 'Nhấp để xem chi tiết / tháo / bán / vứt' : 'Nhấp để chọn lắp đồ vào ô này'}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-stone-900 border border-stone-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        {slot.icon}
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10px] font-mono text-stone-400 uppercase tracking-wider flex items-center gap-1">
                          <span>{slot.label}</span>
                          {equippedItem && (
                            <span className="text-[8px] px-1 py-0.2 rounded bg-amber-950 border border-amber-800 text-amber-300">
                              {equippedItem.tier || 'Cơ bản'}
                            </span>
                          )}
                        </div>

                        {equippedItem ? (
                          <div className="text-xs font-serif font-bold text-stone-100 truncate">
                            {equippedItem.name}
                            {equippedItem.isTwoHanded && (
                              <span className="text-[10px] text-rose-400 ml-1 font-sans font-normal">(Vũ khí 2 tay)</span>
                            )}
                          </div>
                        ) : isTwoHandedOccupy ? (
                          <div className="text-xs font-serif text-stone-500 italic">
                            [Chiếm bởi {character.equipment.leftHand?.name}]
                          </div>
                        ) : (
                          <div className="text-xs font-serif text-stone-600 italic group-hover:text-amber-400/80 transition-colors">
                            - Trống (Bấm để chọn ô này) -
                          </div>
                        )}

                        {/* Stat Bonuses */}
                        {equippedItem?.statBonus && (
                          <div className="flex items-center gap-2 text-[9px] text-amber-300/90 font-mono mt-0.5 flex-wrap">
                            {equippedItem.statBonus.defenseBonus && (
                              <span>+{equippedItem.statBonus.defenseBonus} Giáp</span>
                            )}
                            {equippedItem.statBonus.toukiPenetration && (
                              <span>+{equippedItem.statBonus.toukiPenetration} Xuyên Touki</span>
                            )}
                            {equippedItem.statBonus.physicalDamageBonus && (
                              <span>+{equippedItem.statBonus.physicalDamageBonus} ST</span>
                            )}
                            {equippedItem.statBonus.manaMaxBonus && (
                              <span>+{equippedItem.statBonus.manaMaxBonus} MP</span>
                            )}
                            {equippedItem.statBonus.speedAgilityBonus && (
                              <span>+{equippedItem.statBonus.speedAgilityBonus} Nhanh</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons for equipped slot */}
                    {equippedItem && !isTwoHandedOccupy && (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUnequipSlot(slot.key);
                          }}
                          className="px-2 py-0.5 rounded bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800 text-[10px] font-mono transition cursor-pointer"
                          title="Tháo trang bị cất lại vào túi đồ"
                        >
                          Tháo
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSellSingleItem(equippedItem, slot.key);
                          }}
                          className="px-1.5 py-0.5 rounded bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-800/80 text-[10px] font-mono transition cursor-pointer flex items-center gap-0.5"
                          title={`Bán trực tiếp kiếm ${calculateItemSellValue(equippedItem)} Xu Asura`}
                        >
                          <Coins className="w-2.5 h-2.5 text-amber-400" />
                          <span>{calculateItemSellValue(equippedItem)}</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT COLUMN: INVENTORY GRID SLOTS (7 cols on large screen) */}
          <div className="lg:col-span-7 flex flex-col gap-3">
            <div className="flex items-center justify-between pb-1 border-b border-stone-800 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-amber-400" /> Túi Đồ ({currentItemCount} / {maxSlots} Ô chứa)
                </h3>
              </div>

              {/* Filter tabs & Quick Sell All Loot */}
              <div className="flex items-center gap-1.5 text-[10px] font-mono flex-wrap">
                {lootItems.length > 0 && (
                  <button
                    type="button"
                    onClick={handleSellAllLoot}
                    className="px-2 py-0.5 rounded bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold transition cursor-pointer flex items-center gap-1 shadow-xs"
                    title={`Bán toàn bộ ${lootItems.length} chiến lợi phẩm thu hoạch`}
                  >
                    <Coins className="w-3 h-3 text-amber-950" />
                    <span>Bán Rác ({lootTotalSellValue} Xu)</span>
                  </button>
                )}

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setActiveTab('all')}
                    className={`px-2 py-0.5 rounded transition ${activeTab === 'all' ? 'bg-amber-600 text-stone-950 font-bold' : 'bg-stone-900 text-stone-400 hover:text-stone-200'}`}
                  >
                    Tất cả
                  </button>
                  <button
                    onClick={() => setActiveTab('equipment')}
                    className={`px-2 py-0.5 rounded transition ${activeTab === 'equipment' ? 'bg-amber-600 text-stone-950 font-bold' : 'bg-stone-900 text-stone-400 hover:text-stone-200'}`}
                  >
                    Trang bị
                  </button>
                  <button
                    onClick={() => setActiveTab('loot')}
                    className={`px-2 py-0.5 rounded transition ${activeTab === 'loot' ? 'bg-amber-600 text-stone-950 font-bold' : 'bg-stone-900 text-stone-400 hover:text-stone-200'}`}
                  >
                    Chiến lợi phẩm ({lootItems.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('consumable')}
                    className={`px-2 py-0.5 rounded transition ${activeTab === 'consumable' ? 'bg-amber-600 text-stone-950 font-bold' : 'bg-stone-900 text-stone-400 hover:text-stone-200'}`}
                  >
                    Dược phẩm
                  </button>
                </div>
              </div>
            </div>

            {/* Inventory Grid cells */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2.5 max-h-[36vh] overflow-y-auto pr-1">
              {gridCells.map((item, index) => {
                const isSelected = selectedItem?.id === item?.id;

                if (!item) {
                  return (
                    <div
                      key={`empty_slot_${index}`}
                      className="h-28 rounded-xl border border-stone-800/40 bg-stone-950/30 flex flex-col items-center justify-center text-stone-700 text-[10px] font-mono"
                    >
                      <span>Ô {index + 1}</span>
                      <span className="text-[9px] text-stone-800">Trống</span>
                    </div>
                  );
                }

                const equippable = isEquippableItem(item);
                const sellValue = calculateItemSellValue(item);

                return (
                  <div
                    key={`inv_item_${item.id || 'item'}_${index}`}
                    onClick={() => handleSelectItem(item)}
                    onDoubleClick={() => {
                      if (equippable) handleDirectEquipItem(item);
                      else if (item.type === 'consumable') handleUseItem(item);
                    }}
                    className={`h-28 p-2 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer group relative overflow-hidden select-none ${
                      isSelected
                        ? 'bg-amber-950/60 border-amber-500 shadow-md shadow-amber-950/50 ring-1 ring-amber-400'
                        : equippable
                        ? 'bg-stone-950 border-cyan-900/60 hover:border-cyan-500/80 hover:bg-cyan-950/20'
                        : item.type === 'consumable'
                        ? 'bg-stone-950 border-emerald-900/60 hover:border-emerald-500/80 hover:bg-emerald-950/20'
                        : 'bg-stone-950 border-stone-800 hover:border-stone-600'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-[9px] text-stone-500 font-mono mb-0.5">
                        <span>Ô {index + 1}</span>
                        {equippable && (
                          <span className="text-cyan-400 font-bold">
                            [{item.type === 'accessory' || item.equipSlot === 'accessory' ? 'Trang sức' : item.equipSlot && item.equipSlot !== 'none' ? item.equipSlot : 'Trang bị'}]
                          </span>
                        )}
                        {item.type === 'consumable' && (
                          <span className="text-emerald-400 font-bold">[Dược phẩm]</span>
                        )}
                        {item.type === 'loot' && (
                          <span className="text-amber-500 font-bold">[Rác/Loot]</span>
                        )}
                      </div>
                      <div className="text-[11px] font-serif font-bold text-stone-200 group-hover:text-amber-300 transition-colors line-clamp-2">
                        {item.name}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[9px] text-stone-400 font-mono">
                        <span>{item.tier || 'Cơ bản'}</span>
                        <span className="text-amber-400 flex items-center gap-0.5">
                          <Coins className="w-2.5 h-2.5 text-amber-500" />
                          {sellValue} xu
                        </span>
                      </div>

                      {/* Quick Action Button on card */}
                      <div className="flex items-center gap-1">
                        {equippable ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDirectEquipItem(item);
                            }}
                            className="flex-1 py-0.5 rounded bg-amber-600/90 hover:bg-amber-500 text-stone-950 font-bold text-[9px] font-mono transition flex items-center justify-center gap-0.5 shadow-xs cursor-pointer"
                            title="Lắp vào ô trang bị trống phù hợp"
                          >
                            <ArrowUpRight className="w-2.5 h-2.5" />
                            <span>Trang Bị</span>
                          </button>
                        ) : item.type === 'consumable' ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUseItem(item);
                            }}
                            className="flex-1 py-0.5 rounded bg-emerald-600/90 hover:bg-emerald-500 text-stone-950 font-bold text-[9px] font-mono transition flex items-center justify-center gap-0.5 shadow-xs cursor-pointer"
                          >
                            <Heart className="w-2.5 h-2.5" />
                            <span>Dùng</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSellSingleItem(item);
                            }}
                            className="flex-1 py-0.5 rounded bg-amber-900/60 hover:bg-amber-800 text-amber-200 font-bold text-[9px] font-mono transition flex items-center justify-center gap-0.5 shadow-xs cursor-pointer"
                            title={`Bán thu về +${sellValue} Xu`}
                          >
                            <Coins className="w-2.5 h-2.5 text-amber-400" />
                            <span>Bán ({sellValue}x)</span>
                          </button>
                        )}

                        {/* Quick discard button on card */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setItemToConfirmDiscard({ item });
                          }}
                          className="p-1 rounded bg-stone-900 hover:bg-red-950 text-stone-400 hover:text-red-300 border border-stone-800 hover:border-red-800 transition cursor-pointer"
                          title="Vứt bỏ vật phẩm khỏi túi đồ"
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Item Detail Panel with Sell, Discard, and Equip features */}
            {selectedItem ? (
              <div className="mt-2 p-3.5 rounded-xl bg-stone-950 border border-amber-700/60 space-y-2.5 animate-in fade-in duration-200">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 block font-bold">
                      CHI TIẾT VẬT PHẨM ĐANG CHỌN
                    </span>
                    <h4 className="font-serif font-bold text-sm text-amber-100 flex items-center gap-2">
                      {selectedItem.name}
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-900 border border-stone-700 text-stone-300">
                        {selectedItem.tier || 'Phổ thông'}
                      </span>
                      <span className="text-[10px] font-mono text-amber-400 flex items-center gap-1 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/80">
                        <Coins className="w-3 h-3 text-amber-400" />
                        Giá bán: {calculateItemSellValue(selectedItem)} Xu
                      </span>
                    </h4>
                    <p className="text-xs text-stone-400 font-serif mt-1">
                      {selectedItem.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {/* Check if item is currently equipped */}
                    {(() => {
                      const equippedSlotKey = (Object.keys(character.equipment || {}) as EquipmentSlotKey[]).find(
                        k => character.equipment[k]?.id === selectedItem.id
                      );

                      if (equippedSlotKey) {
                        return (
                          <div className="flex items-center gap-2 flex-wrap">
                            <button
                              type="button"
                              onClick={() => handleUnequipSlot(equippedSlotKey)}
                              className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-100 font-bold text-xs flex items-center gap-1 transition cursor-pointer shadow-md"
                            >
                              <span>Tháo Về Túi</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleSellSingleItem(selectedItem, equippedSlotKey)}
                              className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs flex items-center gap-1 transition cursor-pointer shadow-md"
                              title={`Bán trực tiếp món đồ đang đeo, thu về ${calculateItemSellValue(selectedItem)} Xu`}
                            >
                              <Coins className="w-3 h-3 text-amber-950" />
                              <span>Bán Ngay (+{calculateItemSellValue(selectedItem)} Xu)</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setItemToConfirmDiscard({ item: selectedItem, slotKey: equippedSlotKey })}
                              className="px-2.5 py-1.5 rounded-lg bg-red-950/90 hover:bg-red-900 text-red-200 border border-red-800 font-bold text-xs flex items-center gap-1 transition cursor-pointer shadow-md"
                              title="Vứt bỏ vĩnh viễn trang bị này khỏi người"
                            >
                              <Trash2 className="w-3 h-3 text-red-300" />
                              <span>Vứt Bỏ</span>
                            </button>
                          </div>
                        );
                      }

                      // If item is equippable and in inventory
                      if (isEquippableItem(selectedItem)) {
                        const validSlots = getValidSlotsForItem(selectedItem);
                        const isAcc = selectedItem.type === 'accessory' || selectedItem.equipSlot === 'accessory' || validSlots.includes('accessory1');
                        
                        let currentSlot = selectedSlotForEquip;
                        if (!currentSlot || !validSlots.includes(currentSlot)) {
                          if (isAcc) {
                            const freeAcc = accSlots.find(s => !character.equipment[s]);
                            currentSlot = freeAcc || 'accessory1';
                          } else {
                            const freeSlot = validSlots.find(s => !character.equipment[s]);
                            currentSlot = freeSlot || validSlots[0];
                          }
                        }

                        return (
                          <div className="flex items-center gap-2 flex-wrap">
                            {/* Detailed Slot Selector showing occupied / free status */}
                            {validSlots.length > 1 && (
                              <select
                                value={currentSlot}
                                onChange={(e) => setSelectedSlotForEquip(e.target.value as EquipmentSlotKey)}
                                className="text-[10px] font-mono px-2 py-1.5 rounded bg-stone-900 border border-stone-700 text-stone-200 focus:outline-none"
                              >
                                {validSlots.map((s) => {
                                  const occupant = character.equipment[s];
                                  const isFree = !occupant;
                                  return (
                                    <option key={s} value={s}>
                                      Vào {EQUIPMENT_SLOT_LABELS[s] || s} {isFree ? '★ (Trống)' : `(Đang đeo: ${occupant.name.slice(0, 15)}...)`}
                                    </option>
                                  );
                                })}
                              </select>
                            )}

                            <button
                              type="button"
                              onClick={() => handleEquipSelectedItem(currentSlot)}
                              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-stone-950 font-bold text-xs flex items-center gap-1 transition cursor-pointer shadow-md"
                            >
                              <ArrowUpRight className="w-3.5 h-3.5" />
                              <span>Trang Bị Vào Người</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleSellSingleItem(selectedItem)}
                              className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-amber-950 text-amber-300 border border-amber-800/80 font-bold text-xs flex items-center gap-1 transition cursor-pointer shadow-md"
                              title={`Bán thu về ${calculateItemSellValue(selectedItem)} Xu Asura`}
                            >
                              <Coins className="w-3 h-3 text-amber-400" />
                              <span>Bán (+{calculateItemSellValue(selectedItem)} Xu)</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setItemToConfirmDiscard({ item: selectedItem })}
                              className="px-2.5 py-1.5 rounded-lg bg-stone-900 hover:bg-red-950 text-stone-300 hover:text-red-300 border border-stone-800 hover:border-red-800 font-bold text-xs flex items-center gap-1 transition cursor-pointer shadow-md"
                              title="Vứt bỏ vật phẩm khỏi túi đồ vĩnh viễn"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Vứt</span>
                            </button>
                          </div>
                        );
                      }

                      // If item is consumable
                      if (selectedItem.type === 'consumable') {
                        return (
                          <div className="flex items-center gap-2 flex-wrap">
                            <button
                              type="button"
                              onClick={() => handleUseItem(selectedItem)}
                              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-stone-950 font-bold text-xs flex items-center gap-1 transition cursor-pointer shadow-md"
                            >
                              <Heart className="w-3.5 h-3.5" />
                              <span>Sử Dụng (Hồi Phục)</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleSellSingleItem(selectedItem)}
                              className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-amber-950 text-amber-300 border border-amber-800/80 font-bold text-xs flex items-center gap-1 transition cursor-pointer shadow-md"
                            >
                              <Coins className="w-3 h-3 text-amber-400" />
                              <span>Bán (+{calculateItemSellValue(selectedItem)} Xu)</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setItemToConfirmDiscard({ item: selectedItem })}
                              className="px-2.5 py-1.5 rounded-lg bg-stone-900 hover:bg-red-950 text-stone-300 hover:text-red-300 border border-stone-800 hover:border-red-800 font-bold text-xs flex items-center gap-1 transition cursor-pointer shadow-md"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Vứt</span>
                            </button>
                          </div>
                        );
                      }

                      // Loot / generic materials
                      return (
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            type="button"
                            onClick={() => handleSellSingleItem(selectedItem)}
                            className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs flex items-center gap-1 transition cursor-pointer shadow-md"
                          >
                            <Coins className="w-3.5 h-3.5 text-amber-950" />
                            <span>Bán Đồ (+{calculateItemSellValue(selectedItem)} Xu Asura)</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setItemToConfirmDiscard({ item: selectedItem })}
                            className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-red-950 text-stone-300 hover:text-red-300 border border-stone-800 hover:border-red-800 font-bold text-xs flex items-center gap-1 transition cursor-pointer shadow-md"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Vứt Bỏ (Hủy)</span>
                          </button>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Stat Bonuses */}
                {selectedItem.statBonus && (
                  <div className="pt-2 border-t border-stone-800/80 flex flex-wrap gap-3 text-xs font-mono">
                    <span className="text-stone-400 font-bold">Chỉ số gia tăng:</span>
                    {selectedItem.statBonus.defenseBonus && (
                      <span className="text-cyan-400">+{selectedItem.statBonus.defenseBonus} Giáp</span>
                    )}
                    {selectedItem.statBonus.toukiPenetration && (
                      <span className="text-rose-400">+{selectedItem.statBonus.toukiPenetration} Xuyên Đấu Khí</span>
                    )}
                    {selectedItem.statBonus.physicalDamageBonus && (
                      <span className="text-amber-400">+{selectedItem.statBonus.physicalDamageBonus} Sát thương vật lý</span>
                    )}
                    {selectedItem.statBonus.magicDamageBonus && (
                      <span className="text-purple-400">+{selectedItem.statBonus.magicDamageBonus} Sát thương phép</span>
                    )}
                    {selectedItem.statBonus.manaMaxBonus && (
                      <span className="text-blue-400">+{selectedItem.statBonus.manaMaxBonus} Mana Tối Đa</span>
                    )}
                    {selectedItem.statBonus.speedAgilityBonus && (
                      <span className="text-emerald-400">+{selectedItem.statBonus.speedAgilityBonus} Tốc độ né đòn</span>
                    )}
                    {selectedItem.statBonus.hpHealAmount && (
                      <span className="text-rose-300">+{selectedItem.statBonus.hpHealAmount} HP khi dùng</span>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-stone-950/60 border border-stone-800/60 text-stone-400 text-xs italic font-serif text-center">
                * Nhấp vào một vật phẩm bất kỳ để xem chi tiết, trang bị (hỗ trợ đeo cùng lúc 5 trang sức), bán kiếm Xu Asura hoặc vứt bỏ giải phóng túi đồ.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-stone-950 px-6 py-3 border-t border-stone-800 flex items-center justify-between text-xs text-stone-400 font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Hỗ trợ đeo 5 Trang Sức cùng lúc • Đầy đủ tính năng Bán & Vứt trang bị/vật phẩm không cần thiết</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 transition cursor-pointer"
          >
            Đóng Bảng Kho Đồ
          </button>
        </div>
      </div>
    </div>
  );
};
