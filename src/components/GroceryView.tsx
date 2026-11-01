import React, { useState, useMemo } from 'react';
import { useFamily } from '../context/FamilyContext';
import {
  ShoppingCart,
  Plus,
  Check,
  Trash2,
  AlertCircle,
  Filter,
  Share2,
  UtensilsCrossed,
  Tag,
  Search,
  Sparkles,
} from 'lucide-react';
import { GroceryCategory, GroceryItem } from '../types/family';
import { canPerformAction } from '../utils/familyLogic';

const CATEGORIES: GroceryCategory[] = [
  'Produce',
  'Dairy & Eggs',
  'Pantry & Spices',
  'Grains & Bakery',
  'Meat & Fish',
  'Household & Care',
  'Snacks & Drinks',
  'Other',
];

const QUICK_PRESETS = [
  { name: 'Cow Milk', cat: 'Dairy & Eggs', qty: '1 L' },
  { name: 'Eggs (12 pcs)', cat: 'Dairy & Eggs', qty: '1 Dozen' },
  { name: 'Whole Wheat Atta', cat: 'Grains & Bakery', qty: '5 kg' },
  { name: 'Basmati Rice', cat: 'Grains & Bakery', qty: '5 kg' },
  { name: 'Cooking Oil (Sunflower)', cat: 'Pantry & Spices', qty: '1 L' },
  { name: 'Tomatoes & Onions', cat: 'Produce', qty: '2 kg' },
  { name: 'Fresh Coriander & Mint', cat: 'Produce', qty: '1 bunch' },
  { name: 'Brown Bread', cat: 'Grains & Bakery', qty: '1 pkt' },
];

export const GroceryView: React.FC = () => {
  const {
    groceries,
    addGroceryItem,
    toggleGroceryBought,
    deleteGroceryItem,
    clearBoughtGroceries,
    currentUser,
    sendMessage,
    addNotification,
  } = useFamily();

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [filterMode, setFilterMode] = useState<'all' | 'pending' | 'urgent' | 'bought'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New item form state
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<GroceryCategory>('Produce');
  const [newItemQty, setNewItemQty] = useState('1 unit');
  const [newItemUrgent, setNewItemUrgent] = useState(false);
  const [newItemNotes, setNewItemNotes] = useState('');

  const canManage = canPerformAction(currentUser, 'canManageGroceries');

  const filteredItems = useMemo(() => {
    return groceries.filter((item) => {
      // Category filter
      if (activeCategory !== 'all' && item.category !== activeCategory) return false;

      // Status filter
      if (filterMode === 'pending' && item.isBought) return false;
      if (filterMode === 'bought' && !item.isBought) return false;
      if (filterMode === 'urgent' && (!item.isUrgent || item.isBought)) return false;

      // Search query
      if (
        searchQuery &&
        !item.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !item.notes?.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      return true;
    });
  }, [groceries, activeCategory, filterMode, searchQuery]);

  const pendingCount = groceries.filter((i) => !i.isBought).length;
  const urgentCount = groceries.filter((i) => i.isUrgent && !i.isBought).length;
  const boughtCount = groceries.filter((i) => i.isBought).length;

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    addGroceryItem({
      name: newItemName.trim(),
      category: newItemCategory,
      quantity: newItemQty.trim() || '1 unit',
      isUrgent: newItemUrgent,
      notes: newItemNotes.trim() || undefined,
    });

    setNewItemName('');
    setNewItemQty('1 unit');
    setNewItemNotes('');
    setNewItemUrgent(false);
    setIsAddModalOpen(false);
  };

  const handleQuickAdd = (preset: typeof QUICK_PRESETS[0]) => {
    addGroceryItem({
      name: preset.name,
      category: preset.cat as GroceryCategory,
      quantity: preset.qty,
      isUrgent: false,
    });
  };

  const shareListToChat = () => {
    const unbought = groceries.filter((i) => !i.isBought);
    if (unbought.length === 0) {
      sendMessage('🛒 Grocery list is all clear! Everything has been purchased.', 'text');
      return;
    }

    const itemsSummary = unbought
      .map((i) => `• ${i.name} (${i.quantity})${i.isUrgent ? ' 🚨[URGENT]' : ''}`)
      .join('\n');

    sendMessage(
      `🛒 *Shared Family Grocery List (${unbought.length} items to buy):*\n${itemsSummary}\n\nPlease check off items as you shop!`,
      'grocery_alert'
    );

    addNotification({
      type: 'grocery_added',
      title: 'Grocery List Shared to Family Chat',
      message: `Posted list of ${unbought.length} items for everyone to see.`,
      priority: 'normal',
      actionTab: 'chat',
    });
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100">
                Shared Grocery List
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Real-time shared list synced with weekly meal plan ingredients
              </p>
            </div>
          </div>

          {/* Quick stats pills */}
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
              {pendingCount} To Buy
            </span>
            {urgentCount > 0 && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-800 animate-pulse">
                🚨 {urgentCount} Urgent
              </span>
            )}
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {boughtCount} Bought
            </span>
          </div>
        </div>

        {/* Top actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={shareListToChat}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-2 transition-colors"
          >
            <Share2 className="w-4 h-4 text-indigo-500" />
            <span>Share to Family Chat</span>
          </button>

          {canManage && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-emerald-600/25 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Item</span>
            </button>
          )}
        </div>
      </div>

      {/* Permission warning if user doesn't have grocery rights */}
      {!canManage && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>
            You currently have view-only access to groceries. Contact Shaikh Hanif (Admin) to enable item management permissions.
          </span>
        </div>
      )}

      {/* Quick Add Presets Bar */}
      {canManage && (
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Quick Add Common Essentials:</span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {QUICK_PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => handleQuickAdd(preset)}
                className="shrink-0 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-400 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-emerald-600 flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <Plus className="w-3 h-3 text-emerald-500" />
                <span>{preset.name}</span>
                <span className="text-[10px] text-slate-400 font-normal">({preset.qty})</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search & Filters */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search groceries or meal origin..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-hidden"
            />
          </div>

          {/* Filter tabs */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shrink-0 self-start">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                filterMode === 'all'
                  ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              All ({groceries.length})
            </button>
            <button
              onClick={() => setFilterMode('pending')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                filterMode === 'pending'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              To Buy ({pendingCount})
            </button>
            <button
              onClick={() => setFilterMode('urgent')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                filterMode === 'urgent'
                  ? 'bg-white dark:bg-slate-900 text-red-600 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Urgent ({urgentCount})
            </button>
            <button
              onClick={() => setFilterMode('bought')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                filterMode === 'bought'
                  ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Bought ({boughtCount})
            </button>
          </div>
        </div>

        {/* Categories scroll row */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setActiveCategory('all')}
            className={`shrink-0 px-3 py-1.5 rounded-xl font-bold transition-colors ${
              activeCategory === 'all'
                ? 'bg-emerald-600 text-white'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
            }`}
          >
            All Categories
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 px-3 py-1.5 rounded-xl font-medium transition-colors ${
                activeCategory === cat
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grocery Items List */}
      <div className="space-y-2.5">
        {filteredItems.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6">
            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <ShoppingCart className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
              No grocery items match your filter
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Add new groceries above or sync ingredients directly from the Weekly Meal Plan!
            </p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                item.isBought
                  ? 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/60 opacity-65'
                  : item.isUrgent
                  ? 'bg-red-50/30 dark:bg-red-950/20 border-red-200 dark:border-red-900/60 shadow-xs'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xs hover:border-emerald-300'
              }`}
            >
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                {/* Checkbox */}
                <button
                  onClick={() => toggleGroceryBought(item.id)}
                  disabled={!canManage}
                  aria-label={`Mark ${item.name} as ${item.isBought ? 'unbought' : 'bought'}`}
                  className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border transition-all ${
                    item.isBought
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : 'border-slate-300 dark:border-slate-600 hover:border-emerald-500 bg-white dark:bg-slate-800'
                  }`}
                >
                  {item.isBought && <Check className="w-4 h-4 stroke-[3]" />}
                </button>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-sm font-bold truncate ${
                        item.isBought
                          ? 'line-through text-slate-400 dark:text-slate-500'
                          : 'text-slate-800 dark:text-slate-100'
                      }`}
                    >
                      {item.name}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {item.quantity}
                    </span>
                    {item.isUrgent && !item.isBought && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-100 text-red-700 dark:bg-red-900/60 dark:text-red-300 animate-pulse">
                        URGENT
                      </span>
                    )}
                  </div>

                  {/* Metadata: Category, origin, added by */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400 mt-1">
                    <span className="flex items-center gap-1 text-slate-500">
                      <Tag className="w-3 h-3 text-slate-400" />
                      <span>{item.category}</span>
                    </span>

                    {item.mealPlanOrigin && (
                      <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                        <UtensilsCrossed className="w-3 h-3" />
                        <span>{item.mealPlanOrigin}</span>
                      </span>
                    )}

                    <span>
                      Added by <strong className="text-slate-600 dark:text-slate-300">{item.addedByName}</strong>
                    </span>

                    {item.isBought && item.boughtByName && (
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                        ✓ Bought by {item.boughtByName}
                      </span>
                    )}
                  </div>

                  {item.notes && (
                    <p className="text-xs text-slate-500 italic mt-0.5">Note: {item.notes}</p>
                  )}
                </div>
              </div>

              {canManage && (
                <button
                  onClick={() => deleteGroceryItem(item.id)}
                  aria-label={`Delete ${item.name}`}
                  className="p-2 rounded-xl text-slate-300 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Clear bought items button */}
      {boughtCount > 0 && canManage && (
        <div className="flex justify-end pt-2">
          <button
            onClick={clearBoughtGroceries}
            className="text-xs font-semibold text-slate-500 hover:text-red-600 flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Completed ({boughtCount} items)</span>
          </button>
        </div>
      )}

      {/* Add Item Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-hidden">
            <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 mb-1">
              Add Grocery Item
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Add something needed by the family. Visible to everyone in real-time.
            </p>

            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Item Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mustard Seeds (Rai), Whole Wheat Bread, Milk"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-hidden text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value as GroceryCategory)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-hidden text-slate-800 dark:text-slate-100"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Quantity / Unit
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 2 kg, 1 pkt, 500g"
                    value={newItemQty}
                    onChange={(e) => setNewItemQty(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-hidden text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Specific Brand / Note (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Amul Gold, or get organic if available"
                  value={newItemNotes}
                  onChange={(e) => setNewItemNotes(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-hidden text-slate-800 dark:text-slate-100"
                />
              </div>

              <label className="flex items-center gap-3 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newItemUrgent}
                  onChange={(e) => setNewItemUrgent(e.target.checked)}
                  className="w-4 h-4 rounded text-red-600 focus:ring-red-500"
                />
                <div className="text-xs">
                  <span className="font-bold text-red-700 dark:text-red-300">
                    Mark as Urgent (Need Today)
                  </span>
                  <p className="text-[10px] text-red-600/80">
                    Sends an instant alert notification to family members
                  </p>
                </div>
              </label>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/25 flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add to List</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
