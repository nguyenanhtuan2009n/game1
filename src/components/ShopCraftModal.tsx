import React, { useState } from 'react';
import type { Character, InventoryItem, CraftingRecipe, EquipmentSlotKey, ItemEquipSlot } from '../types/game.ts';
import { CRAFTING_RECIPES, equipItem, unequipItem, getValidSlotsForItem, calculateItemSellValue, sellItem, sellAllLootItems } from '../services/mushokuRules.ts';
import { calculateShopDiscount } from '../services/mushokuReputation.ts';
import { EQUIPMENT_SLOT_LABELS } from '../types/game.ts';
import { soundFx } from '../services/soundFx.ts';
import { 
  Coins, 
  Hammer, 
  ShoppingBag, 
  X, 
  ShieldCheck, 
  Sparkles, 
  Zap, 
  Sword, 
  Check, 
  Package,
  Wand2,
  Shield,
  ArrowUpRight
} from 'lucide-react';

interface ShopCraftModalProps {
  character: Character;
  onUpdateCharacter: (updated: Character) => void;
  onClose: () => void;
  onLogMessage: (msg: string) => void;
}

const SHOP_ITEMS: { name: string; type: InventoryItem['type']; tier: string; cost: number; desc: string; statBonus?: any; equipSlot?: ItemEquipSlot; isTwoHanded?: boolean }[] = [
  { name: 'Thuốc Nước Hồi Phục (Healing Potion)', type: 'consumable', tier: 'Sơ cấp', cost: 15, desc: 'Dược thảo lên men, hồi 35 HP và 25 Thể lực.', statBonus: { hpHealAmount: 35, staminaHealAmount: 25 }, equipSlot: 'none' },
  { name: 'Sách Cổ Ngữ Ma Thần (Demon Primer)', type: 'grimoire', tier: 'Sơ cấp', cost: 40, desc: 'Tập hợp từ vựng và ngữ pháp Ma thần ngữ cơ bản.', equipSlot: 'none' },
  { name: 'Kiếm Sắt Rèn Thủ Công (Iron Shortsword)', type: 'weapon', tier: 'Sơ cấp', cost: 50, desc: 'Lưỡi kiếm sắt bén, tăng lực chém vật lý.', statBonus: { toukiPenetration: 5 }, equipSlot: 'hand' },
  { name: 'Áo Choàng Len Kháng Bụi Fittoa', type: 'armor', tier: 'Sơ cấp', cost: 35, desc: 'Áo choàng len dày, giảm sát thương ma thuật yếu.', statBonus: { defenseBonus: 5 }, equipSlot: 'body' },
];

export const ShopCraftModal: React.FC<ShopCraftModalProps> = ({
  character,
  onUpdateCharacter,
  onClose,
  onLogMessage,
}) => {
  const [activeTab, setActiveTab] = useState<'trade' | 'craft' | 'equip'>('trade');

  const shopDiscount = calculateShopDiscount(character, character.stats.location);
  const getItemEffectiveCost = (baseCost: number) => {
    if (shopDiscount.discountPercent > 0) {
      return Math.max(1, Math.round(baseCost * (1 - shopDiscount.discountPercent / 100)));
    }
    if (shopDiscount.surchargePercent > 0) {
      return Math.round(baseCost * (1 + shopDiscount.surchargePercent / 100));
    }
    return baseCost;
  };

  // Sell single item (loot, equipment, or consumable)
  const handleSellItem = (item: InventoryItem) => {
    const res = sellItem(character, item.id);
    if (res.success) {
      soundFx.playLevelUp();
      onUpdateCharacter(res.updatedCharacter);
      onLogMessage(res.message);
    } else {
      onLogMessage(`⚠️ ${res.message}`);
    }
  };

  // Sell all loot
  const handleSellAllLoot = () => {
    const res = sellAllLootItems(character);
    if (res.success) {
      soundFx.playLevelUp();
      onUpdateCharacter(res.updatedCharacter);
      onLogMessage(res.message);
    } else {
      onLogMessage(`⚠️ ${res.message}`);
    }
  };

  // Buy Shop Item
  const handleBuyItem = (shopItem: typeof SHOP_ITEMS[0]) => {
    if (shopDiscount.isRefused) {
      onLogMessage(shopDiscount.reason || '🚫 [TỪ CHỐI PHỤC VỤ]: Thương nhân hoảng sợ nhận diện bạn và từ chối giao dịch!');
      return;
    }

    const effectiveCost = getItemEffectiveCost(shopItem.cost);
    if ((character.stats.asuraCoins || 0) < effectiveCost) {
      soundFx.playParchmentTurn();
      return;
    }

    const defaultSlot: ItemEquipSlot = 
      shopItem.equipSlot || 
      (shopItem.type === 'weapon' || shopItem.type === 'staff' ? 'hand' : 
       shopItem.type === 'armor' ? 'body' : 
       shopItem.type === 'accessory' ? 'accessory' : 'none');

    const newItem: InventoryItem = {
      id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: shopItem.name,
      type: shopItem.type,
      tier: shopItem.tier,
      description: shopItem.desc,
      statBonus: shopItem.statBonus,
      equipSlot: defaultSlot,
      isTwoHanded: shopItem.isTwoHanded,
      valueCoins: Math.round(effectiveCost * 0.6),
    };

    const updated: Character = {
      ...character,
      stats: {
        ...character.stats,
        asuraCoins: (character.stats.asuraCoins || 0) - effectiveCost,
      },
      inventory: [...character.inventory, newItem],
    };

    soundFx.playParchmentTurn();
    onUpdateCharacter(updated);
    onLogMessage(`Đã mua [${shopItem.name}] với giá ${effectiveCost} Xu Asura${shopDiscount.discountPercent > 0 ? ` (Ưu đãi -${shopDiscount.discountPercent}% nhờ Danh Tiếng)` : ''}.`);
  };

  // Craft item from recipe
  const handleCraft = (recipe: CraftingRecipe) => {
    if ((character.stats.asuraCoins || 0) < recipe.costCoins) return;

    // Check material requirements
    let hasAll = true;
    for (const req of recipe.requiredMaterials) {
      const reqLower = (req?.name || '').toLowerCase();
      const match = character.inventory.find((i) => i?.name && reqLower && i.name.toLowerCase().includes(reqLower));
      if (!match) {
        hasAll = false;
        break;
      }
    }
    if (!hasAll) return;

    // Consume materials
    let newInventory = [...character.inventory];
    for (const req of recipe.requiredMaterials) {
      const reqLower = (req?.name || '').toLowerCase();
      const idx = newInventory.findIndex((i) => i?.name && reqLower && i.name.toLowerCase().includes(reqLower));
      if (idx !== -1) {
        newInventory.splice(idx, 1);
      }
    }

    const defaultSlot: ItemEquipSlot = 
      recipe.equipSlot || 
      (recipe.resultType === 'weapon' || recipe.resultType === 'staff' 
        ? (recipe.isTwoHanded ? 'twoHanded' : 'hand') 
        : recipe.resultType === 'accessory' 
        ? 'accessory' 
        : 'body');

    // Add crafted item
    const craftedItem: InventoryItem = {
      id: `craft_${recipe.id}_${Date.now()}`,
      name: recipe.name,
      type: recipe.resultType,
      tier: recipe.tier,
      description: recipe.description,
      statBonus: recipe.statBonus,
      equipSlot: defaultSlot,
      isTwoHanded: recipe.isTwoHanded,
      isEquipped: false,
      valueCoins: recipe.costCoins * 2,
    };

    newInventory.push(craftedItem);

    let updated: Character = {
      ...character,
      stats: {
        ...character.stats,
        asuraCoins: (character.stats.asuraCoins || 0) - recipe.costCoins,
      },
      inventory: newInventory,
    };

    // Auto equip crafted gear into equipment slots
    const equipRes = equipItem(updated, craftedItem.id);
    if (equipRes.success) {
      updated = equipRes.updatedCharacter;
    }

    soundFx.playSwordClash();
    onUpdateCharacter(updated);
    onLogMessage(`★ Rèn thành công trang bị đỉnh cấp: [${recipe.name}] (${recipe.tier})! Đã trang bị vào người.`);
  };

  // Toggle Equip status using real equipItem / unequipItem
  const handleToggleEquip = (itemId: string) => {
    // Check if item is currently equipped in character.equipment
    const equippedSlot = (Object.keys(character.equipment || {}) as EquipmentSlotKey[]).find(
      (k) => character.equipment[k]?.id === itemId
    );

    if (equippedSlot) {
      const res = unequipItem(character, equippedSlot);
      if (res.success) {
        soundFx.playParchmentTurn();
        onUpdateCharacter(res.updatedCharacter);
        onLogMessage(res.message);
      } else {
        onLogMessage(`⚠️ ${res.message}`);
      }
    } else {
      const res = equipItem(character, itemId);
      if (res.success) {
        soundFx.playSwordClash();
        onUpdateCharacter(res.updatedCharacter);
        onLogMessage(res.message);
      } else {
        soundFx.playParchmentTurn();
        onLogMessage(`⚠️ ${res.message}`);
      }
    }
  };

  // Consume Potion
  const handleConsume = (item: InventoryItem) => {
    if (item.type !== 'consumable') return;
    const healHp = item.statBonus?.hpHealAmount || 30;
    const healSta = item.statBonus?.staminaHealAmount || 20;

    const newInventory = character.inventory.filter((i) => i.id !== item.id);
    const updated: Character = {
      ...character,
      stats: {
        ...character.stats,
        healthCurrent: Math.min(character.stats.healthMax, character.stats.healthCurrent + healHp),
        staminaCurrent: Math.min(character.stats.staminaMax, character.stats.staminaCurrent + healSta),
        fatigue: Math.max(0, (character.stats.fatigue || 0) - 20),
      },
      inventory: newInventory,
    };
    soundFx.playMagicCast();
    onUpdateCharacter(updated);
    onLogMessage(`Đã sử dụng [${item.name}]: Hồi phục +${healHp} HP và +${healSta} Thể lực, xua tan bớt mệt mỏi!`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md">
      <div className="bg-stone-900 border-2 border-amber-800/80 rounded-2xl max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl text-stone-200 overflow-hidden font-sans">
        {/* Header */}
        <div className="bg-gradient-to-r from-stone-950 via-amber-950 to-stone-950 px-6 py-4 border-b border-amber-800/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-600/20 border border-amber-500/40 text-amber-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-amber-400 block">
                CÔNG HỘI THƯƠNG MẠI & LÒ RÈN MA PHÁP
              </span>
              <h2 className="font-serif font-bold text-base sm:text-lg text-amber-100 flex items-center gap-2">
                Hệ Thống Mua Bán, Chế Tác & Quản Lý Trang Bị
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

        {/* Currency & Tabs Bar */}
        <div className="bg-stone-950 px-6 py-2.5 border-b border-stone-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 font-mono text-amber-300">
            <Coins className="w-4 h-4 text-amber-400" />
            <span>Túi tiền: <strong>{character.stats.asuraCoins || 0}</strong> Xu Asura</span>
          </div>

          <div className="flex items-center gap-1 bg-stone-900 p-1 rounded-xl border border-stone-800 text-[11px] font-serif">
            <button
              onClick={() => setActiveTab('trade')}
              className={`px-3 py-1 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'trade'
                  ? 'bg-amber-600 text-stone-950 font-bold shadow'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Giao Dịch</span>
            </button>

            <button
              onClick={() => setActiveTab('craft')}
              className={`px-3 py-1 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'craft'
                  ? 'bg-amber-600 text-stone-950 font-bold shadow'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Hammer className="w-3.5 h-3.5" />
              <span>Lò Rèn (Chế Tạo)</span>
            </button>

            <button
              onClick={() => setActiveTab('equip')}
              className={`px-3 py-1 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'equip'
                  ? 'bg-amber-600 text-stone-950 font-bold shadow'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Trang Bị ({Object.values(character.equipment || {}).filter(Boolean).length})</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Trade (Sell Loot & Buy Goods) */}
        {activeTab === 'trade' && (
          <div className="p-6 overflow-y-auto space-y-6 text-xs">
            {/* Sell Loot Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-serif font-bold text-xs uppercase text-amber-300 flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-amber-400" />
                  Bán Chiến Lợi Phẩm Thu Hoạch ({character.inventory.filter((i) => i.type === 'loot').length} món)
                </h3>
                {character.inventory.some((i) => i.type === 'loot') && (
                  <button
                    onClick={handleSellAllLoot}
                    className="px-3 py-1 rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300 font-bold text-[11px] transition cursor-pointer"
                  >
                    Bán Toàn Bộ Chiến Lợi Phẩm
                  </button>
                )}
              </div>

              {character.inventory.filter((i) => i.type === 'loot').length === 0 ? (
                <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 text-stone-500 italic text-center">
                  Hành trang không có chiến lợi phẩm quái vật nào để bán. Hãy đi săn tại [Mục Chiến Đấu]!
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {character.inventory
                    .filter((i) => i.type === 'loot')
                    .map((item, idx) => (
                      <div
                        key={`loot_${item.id || 'loot'}_${idx}`}
                        className="p-2.5 rounded-xl bg-stone-950 border border-stone-800 flex items-center justify-between gap-2"
                      >
                        <div>
                          <div className="font-serif font-bold text-stone-200 text-xs">{item.name}</div>
                          <div className="text-[10px] text-stone-400 line-clamp-1">{item.description}</div>
                        </div>
                        <button
                          onClick={() => handleSellItem(item)}
                          className="px-2.5 py-1.5 rounded-lg bg-amber-950/60 hover:bg-amber-900 border border-amber-700/60 text-amber-300 font-mono text-[11px] shrink-0 transition cursor-pointer"
                        >
                          Bán +{item.valueCoins || 15} Xu
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Buy Goods Section */}
            <div className="border-t border-stone-800 pt-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-serif font-bold text-xs uppercase text-amber-300 flex items-center gap-1.5">
                  <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
                  Cửa Hàng Thương Hội (Mua Vật Phẩm Thiết Yếu)
                </h3>
                {character.reputation && (
                  <span className="text-[10px] font-mono text-stone-400">
                    Danh xưng: <strong className="text-amber-300">"{character.reputation.currentEpithet}"</strong>
                  </span>
                )}
              </div>

              {/* Status Banner for Reputation Impact */}
              {shopDiscount.isRefused && (
                <div className="p-3 mb-3 rounded-xl bg-red-950/80 border border-red-500 text-red-200 text-xs">
                  {shopDiscount.reason || '🚫 [TỪ CHỐI PHỤC VỤ]: Thương nhân hoảng sợ nhận diện bạn là tội phạm nguy hiểm và đóng sập cửa!'}
                </div>
              )}
              {!shopDiscount.isRefused && shopDiscount.discountPercent > 0 && (
                <div className="p-2 mb-3 rounded-xl bg-emerald-950/70 border border-emerald-500 text-emerald-200 text-xs flex items-center justify-between">
                  <span>✨ <strong>Ưu đãi Danh Tiếng:</strong> Nhờ uy danh <em>"{character.reputation?.currentEpithet}"</em>, được giảm <strong>-{shopDiscount.discountPercent}%</strong> giá mua!</span>
                  <span className="font-mono font-bold text-[10px] bg-emerald-900 px-2 py-0.5 rounded border border-emerald-400">-{shopDiscount.discountPercent}%</span>
                </div>
              )}
              {!shopDiscount.isRefused && shopDiscount.surchargePercent > 0 && (
                <div className="p-2 mb-3 rounded-xl bg-rose-950/70 border border-rose-500 text-rose-200 text-xs flex items-center justify-between">
                  <span>⚠️ <strong>Phụ thu Danh Tiếng:</strong> Tăng giá <strong>+{shopDiscount.surchargePercent}%</strong> do người dân lo sợ danh tiếng của bạn!</span>
                  <span className="font-mono font-bold text-[10px] bg-rose-900 px-2 py-0.5 rounded border border-rose-400">+{shopDiscount.surchargePercent}%</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {SHOP_ITEMS.map((item, idx) => {
                  const effectiveCost = getItemEffectiveCost(item.cost);
                  const canAfford = !shopDiscount.isRefused && (character.stats.asuraCoins || 0) >= effectiveCost;
                  return (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-stone-950 border border-stone-800 flex flex-col justify-between gap-2"
                    >
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="font-serif font-bold text-stone-200 text-xs">{item.name}</span>
                          <div className="flex items-center gap-1.5 font-mono text-xs">
                            {effectiveCost !== item.cost && (
                              <span className="line-through text-stone-500 text-[10px]">{item.cost} Xu</span>
                            )}
                            <span className={`font-bold ${shopDiscount.discountPercent > 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                              {effectiveCost} Xu
                            </span>
                          </div>
                        </div>
                        <p className="text-[11px] text-stone-400 mt-1">{item.desc}</p>
                      </div>
                      <button
                        disabled={!canAfford}
                        onClick={() => handleBuyItem(item)}
                        className={`w-full py-1.5 rounded-lg text-xs font-serif font-bold transition ${
                          shopDiscount.isRefused
                            ? 'bg-red-950/70 text-red-400 border border-red-800 cursor-not-allowed'
                            : canAfford
                            ? 'bg-amber-600 hover:bg-amber-500 text-stone-950 cursor-pointer shadow'
                            : 'bg-stone-800 text-stone-500 cursor-not-allowed'
                        }`}
                      >
                        {shopDiscount.isRefused ? 'Bị Từ Chối Phục Vụ' : canAfford ? 'Mua Vật Phẩm' : 'Không Đủ Xu'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Crafting (Forge) */}
        {activeTab === 'craft' && (
          <div className="p-6 overflow-y-auto space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-800/40 text-stone-300 text-xs font-serif leading-relaxed">
              Sử dụng các nguyên liệu ma thuật thu thập được từ quái vật (Lõi Mana, Nanh Vuốt, Long Tinh...) để rèn nên các vũ khí và pháp trượng tối thượng, gia tăng trực tiếp sức mạnh chiến đấu!
            </div>

            <div className="grid grid-cols-1 gap-3">
              {CRAFTING_RECIPES.map((recipe) => {
                const canAffordCoins = (character.stats.asuraCoins || 0) >= recipe.costCoins;
                let hasMaterials = true;
                const matStatuses = recipe.requiredMaterials.map((req) => {
                  const reqLower = (req?.name || '').toLowerCase();
                  const exists = character.inventory.some((i) => i?.name && reqLower && i.name.toLowerCase().includes(reqLower));
                  if (!exists) hasMaterials = false;
                  return { name: req.name, exists };
                });

                const canCraft = canAffordCoins && hasMaterials;

                return (
                  <div
                    key={recipe.id}
                    className="p-3.5 rounded-xl bg-stone-950 border border-stone-800 hover:border-amber-700/60 transition flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-serif font-bold text-sm text-amber-200">{recipe.name}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                          {recipe.tier}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-400">{recipe.description}</p>
                      
                      {/* Stat bonus badges */}
                      <div className="flex flex-wrap gap-1.5 pt-1 text-[10px] font-mono">
                        {recipe.statBonus.manaCostReduction && (
                          <span className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                            Giảm {recipe.statBonus.manaCostReduction}% tiêu hao Mana
                          </span>
                        )}
                        {recipe.statBonus.toukiPenetration && (
                          <span className="px-1.5 py-0.5 rounded bg-red-950 text-red-300 border border-red-800">
                            +{recipe.statBonus.toukiPenetration} Xuyên phá Đấu Khí
                          </span>
                        )}
                        {recipe.statBonus.defenseBonus && (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                            +{recipe.statBonus.defenseBonus} Kháng sát thương
                          </span>
                        )}
                      </div>

                      {/* Required materials */}
                      <div className="text-[10px] text-stone-400 pt-1 flex flex-wrap gap-2">
                        <span>Chi phí: <strong className={canAffordCoins ? 'text-amber-300' : 'text-red-400'}>{recipe.costCoins} Xu</strong></span>
                        <span>•</span>
                        <span>Nguyên liệu:</span>
                        {matStatuses.map((m, mIdx) => (
                          <span
                            key={mIdx}
                            className={`font-mono ${m.exists ? 'text-emerald-400' : 'text-red-400'}`}
                          >
                            {m.exists ? '✓' : '✗'} {m.name}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      disabled={!canCraft}
                      onClick={() => handleCraft(recipe)}
                      className={`shrink-0 px-4 py-2.5 rounded-xl font-serif font-bold text-xs transition ${
                        canCraft
                          ? 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-stone-950 cursor-pointer shadow-lg shadow-amber-950/50'
                          : 'bg-stone-800 text-stone-500 cursor-not-allowed'
                      }`}
                    >
                      {canCraft ? 'Chế Tác Ngay' : 'Thiếu Nguyên Liệu / Xu'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 3: Equip / Inventory Manager */}
        {activeTab === 'equip' && (
          <div className="p-6 overflow-y-auto space-y-5 text-xs">
            {/* 1. Trang bị đang mang trên người */}
            <div className="space-y-2">
              <h4 className="font-serif font-bold text-xs uppercase text-amber-300 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                Trang Bị Đang Mặc Trên Người ({Object.values(character.equipment || {}).filter(Boolean).length} món)
              </h4>
              {Object.values(character.equipment || {}).filter(Boolean).length === 0 ? (
                <div className="p-3 rounded-xl bg-stone-950/60 border border-stone-800 text-stone-500 italic text-center">
                  Chưa trang bị món đồ nào trên người.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(Object.keys(character.equipment || {}) as EquipmentSlotKey[]).map((slotKey) => {
                    const item = character.equipment[slotKey];
                    if (!item) return null;
                    return (
                      <div
                        key={slotKey}
                        className="p-3 rounded-xl border border-amber-600/70 bg-amber-950/30 text-amber-100 flex flex-col justify-between gap-2 shadow"
                      >
                        <div>
                          <div className="flex justify-between items-start">
                            <span className="font-serif font-bold text-xs flex items-center gap-1.5">
                              <Shield className="w-3.5 h-3.5 text-amber-400" />
                              {item.name}
                            </span>
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                              {EQUIPMENT_SLOT_LABELS[slotKey] || slotKey}
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-400 mt-1">{item.description}</p>
                          {item.statBonus && (
                            <div className="mt-1.5 flex flex-wrap gap-1 text-[10px] font-mono">
                              {item.statBonus.defenseBonus && (
                                <span className="text-emerald-400">+{item.statBonus.defenseBonus} Giáp</span>
                              )}
                              {item.statBonus.toukiPenetration && (
                                <span className="text-red-400">+{item.statBonus.toukiPenetration} Xuyên Touki</span>
                              )}
                              {item.statBonus.physicalDamageBonus && (
                                <span className="text-amber-400">+{item.statBonus.physicalDamageBonus} ST</span>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="pt-1 border-t border-stone-800/80 flex justify-end">
                          <button
                            onClick={() => handleToggleEquip(item.id)}
                            className="px-3 py-1 rounded-lg bg-stone-800 hover:bg-red-950 hover:text-red-300 text-stone-300 font-serif font-bold text-[11px] cursor-pointer transition"
                          >
                            Tháo Trang Bị
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 2. Vật phẩm trong hành trang */}
            <div className="space-y-2 pt-3 border-t border-stone-800">
              <h4 className="font-serif font-bold text-xs uppercase text-amber-300 flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-amber-400" />
                Vật Phẩm Trong Túi Đồ ({character.inventory.length} món)
              </h4>
              {character.inventory.length === 0 ? (
                <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 text-stone-500 italic text-center">
                  Hành trang không có vật phẩm nào.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {character.inventory.map((item, idx) => {
                    const isEquippable = getValidSlotsForItem(item).length > 0;
                    return (
                      <div
                        key={`inv_item_${item.id || 'item'}_${idx}`}
                        className="p-3 rounded-xl border border-stone-800 bg-stone-950 text-stone-300 flex flex-col justify-between gap-2"
                      >
                        <div>
                          <div className="flex justify-between items-start">
                            <span className="font-serif font-bold text-xs flex items-center gap-1.5">
                              {item.type === 'weapon' ? <Sword className="w-3.5 h-3.5 text-red-400" /> : item.type === 'staff' ? <Wand2 className="w-3.5 h-3.5 text-cyan-400" /> : <Package className="w-3.5 h-3.5 text-stone-400" />}
                              {item.name}
                            </span>
                            {isEquippable && (
                              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                                {item.equipSlot || 'Trang bị'}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-stone-400 mt-1">{item.description}</p>
                          {item.statBonus && (
                            <div className="mt-1.5 flex flex-wrap gap-1 text-[10px] font-mono">
                              {item.statBonus.toukiPenetration && (
                                <span className="text-red-400">+{item.statBonus.toukiPenetration} Xuyên Touki</span>
                              )}
                              {item.statBonus.manaCostReduction && (
                                <span className="text-cyan-400">-{item.statBonus.manaCostReduction}% Mana</span>
                              )}
                              {item.statBonus.defenseBonus && (
                                <span className="text-emerald-400">+{item.statBonus.defenseBonus} Phòng ngự</span>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2 pt-1 border-t border-stone-800/80">
                          {item.type === 'consumable' ? (
                            <button
                              onClick={() => handleConsume(item)}
                              className="flex-1 py-1.5 rounded-lg bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 font-serif font-bold text-[11px] cursor-pointer"
                            >
                              Sử Dụng Hồi Phục
                            </button>
                          ) : isEquippable ? (
                            <button
                              onClick={() => handleToggleEquip(item.id)}
                              className="flex-1 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 font-serif font-bold text-[11px] cursor-pointer transition flex items-center justify-center gap-1"
                            >
                              <ArrowUpRight className="w-3 h-3" />
                              <span>Trang Bị Lên Người</span>
                            </button>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 bg-stone-950 border-t border-stone-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-serif font-bold text-xs cursor-pointer"
          >
            Đóng Cửa Hàng
          </button>
        </div>
      </div>
    </div>
  );
};
