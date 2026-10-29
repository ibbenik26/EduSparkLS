import React, { useState } from 'react';
import { Plus, Trash2, Image as ImageIcon } from 'lucide-react';
import { canUserCRUDShop } from '../utils/helpers';

export default function ShopTab({
  role, authName, studentGrade, shopItems, onAddShopItem, onDeleteShopItem,
  onPurchase, coins, showToast, askConfirm
}) {
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('Stationery');
  const [cost, setCost] = useState(150);
  const [stock, setStock] = useState(10);
  const [desc, setDesc] = useState('');
  const [targetGrade, setTargetGrade] = useState('All');
  const [imageUrl, setImageUrl] = useState('');

  const canEditShop = canUserCRUDShop(role);

  // Default sample images for quick selection
  const presetImages = [
    { label: 'Stationery Kit', url: 'https://images.unsplash.com/photo-1585336261026-6757688719d3?auto=format&fit=crop&q=80&w=600' },
    { label: 'Maths & Geometry', url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=600' },
    { label: 'Books & Science', url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=600' },
    { label: 'School Bag', url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=600' }
  ];

  // Students only see items meant for their grade (or for everyone)
  const visibleItems = role === 'student'
    ? shopItems.filter(i => !i.target_grade || i.target_grade === 'All' || String(i.target_grade) === String(studentGrade))
    : shopItems;

  const handleCreateShopItem = async (e) => {
    e.preventDefault();
    if (!itemName.trim()) return showToast("Enter item name", "warning");
    if (!(parseInt(cost) > 0)) return showToast("Cost must be at least 1 coin.", "warning");
    if (!(parseInt(stock) >= 0)) return showToast("Stock cannot be negative.", "warning");

    const newItem = {
      id: `shop_${Date.now()}`,
      name: itemName.trim(),
      category,
      cost: parseInt(cost),
      stock: parseInt(stock),
      creator_name: authName,
      target_grade: targetGrade,
      image_url: imageUrl || presetImages[0].url,
      rating: 5.0,
      desc
    };

    const ok = await onAddShopItem(newItem);
    if (!ok) return;
    setShowAddItemModal(false);
    setItemName(''); setDesc(''); setImageUrl('');
  };

  const handleDeleteItem = (itemId, name) => {
    askConfirm("Delete Reward Item", `Remove "${name}" from the Reward Store permanently?`, async () => {
      const ok = await onDeleteShopItem(itemId);
      if (ok) showToast(`Removed "${name}" from store.`, "info");
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-rose-600 to-slate-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-lg">
        <div className="space-y-2">
          <span className="bg-amber-400/20 border border-amber-300/30 text-amber-200 font-bold px-3 py-1 rounded-full text-xs uppercase tracking-wider">
            Student Reward & Gift Vault
          </span>
          <h2 className="text-2xl sm:text-3xl font-black">Edusparkls Reward Store</h2>
          <p className="text-amber-100 text-xs max-w-lg">
            Redeem your earned coins for physical stationery, geometry kits, and school supplies!
          </p>
        </div>

        {canEditShop && (
          <button
            onClick={() => setShowAddItemModal(true)}
            className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-5 py-3 rounded-2xl text-xs transition shadow-md shrink-0 flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Reward Item</span>
          </button>
        )}
      </div>

      {/* Item Cards Grid with Display Images */}
      {visibleItems.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-400 text-xs font-medium">
          No reward items are available for your grade yet.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {visibleItems.map((item) => (
          <div key={item.id} className="bg-white border border-slate-200 rounded-3xl p-5 space-y-3 shadow-xs hover:shadow-md transition flex flex-col justify-between group">
            <div className="space-y-3">
              {/* Product Card Image Banner */}
              <div className="w-full h-40 rounded-2xl overflow-hidden bg-slate-100 relative">
                <img
                  src={item.image_url || 'https://images.unsplash.com/photo-1585336261026-6757688719d3?auto=format&fit=crop&q=80&w=600'}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <span className="absolute top-2.5 left-2.5 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg">
                  {item.category}
                </span>

                {canEditShop && (
                  <button
                    onClick={() => handleDeleteItem(item.id, item.name)}
                    className="absolute top-2.5 right-2.5 bg-rose-600/90 hover:bg-rose-600 text-white p-1.5 rounded-xl transition shadow-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div>
                <span className="text-[10px] font-bold text-amber-700 uppercase bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                  Target: Grade {item.target_grade || 'All'}
                </span>
                <h3 className="font-black text-slate-900 text-base mt-1.5 leading-snug">{item.name}</h3>
                <p className="text-xs text-slate-500 leading-relaxed mt-1">{item.desc || 'Curriculum reward item.'}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-amber-600 font-black text-base flex items-center space-x-1">
                  <span>🪙</span>
                  <span>{item.cost} Coins</span>
                </span>
                <span className="text-[10px] text-slate-400 block font-bold">Stock Remaining: {item.stock ?? 0}</span>
              </div>

              {role === 'student' ? (
                <button
                  onClick={() => onPurchase(item)}
                  disabled={(item.stock ?? 0) <= 0}
                  className="bg-amber-500 hover:bg-amber-600 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs transition shadow-xs"
                >
                  {(item.stock ?? 0) <= 0 ? 'Out of Stock' : 'Claim Item'}
                </button>
              ) : (
                <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-xl">In Inventory</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Item Modal with Image Upload Options */}
      {showAddItemModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 text-slate-900 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-black flex items-center space-x-2">
              <ImageIcon className="w-5 h-5 text-amber-600" />
              <span>Add Reward Store Item</span>
            </h3>

            <form onSubmit={handleCreateShopItem} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Item Name</label>
                <input
                  type="text"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="e.g. Cambridge Mathematical Set"
                  className="w-full border rounded-xl p-2.5 font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold block mb-1">Cost (Coins)</label>
                  <input
                    type="number"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    className="w-full border rounded-xl p-2.5 font-bold text-amber-600"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full border rounded-xl p-2.5 font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1">Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border rounded-xl p-2.5 font-bold">
                  <option value="Stationery">Stationery</option>
                  <option value="Maths & Physics Tools">Maths & Physics Tools</option>
                  <option value="E-Books & Books">E-Books & Books</option>
                  <option value="Merchandise">Merchandise</option>
                </select>
              </div>

              <div>
                <label className="font-bold block mb-1">Target Grade</label>
                <select value={targetGrade} onChange={(e) => setTargetGrade(e.target.value)} className="w-full border rounded-xl p-2.5 font-bold">
                  <option value="All">All Grades</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(g => <option key={g} value={String(g)}>Grade {g}</option>)}
                </select>
              </div>

              <div>
                <label className="font-bold block mb-1">Item Image URL</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full border rounded-xl p-2.5 font-mono text-[11px]"
                />

                <div className="mt-2 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 block">Or select a preset sample thumbnail:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {presetImages.map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setImageUrl(p.url)}
                        className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition ${
                          imageUrl === p.url ? 'bg-amber-500 text-white border-amber-600' : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1">Description</label>
                <textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  rows={2}
                  placeholder="Details about item collection..."
                  className="w-full border rounded-xl p-2.5"
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button type="button" onClick={() => setShowAddItemModal(false)} className="w-full bg-slate-100 hover:bg-slate-200 font-bold py-2.5 rounded-xl transition">
                  Cancel
                </button>
                <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black py-2.5 rounded-xl transition shadow-sm">
                  Save Item 🚀
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}