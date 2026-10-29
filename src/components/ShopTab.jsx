import React, { useState } from 'react';
import { ShoppingBag, Plus, Trash2, CheckCircle, Tag, Sparkles } from 'lucide-react';
import { canUserCRUDShop } from '../utils/helpers';

export default function ShopTab({
  role, authName, studentGrade, shopItems, onAddShopItem, onDeleteShopItem,
  coins, setCoins, orders, setOrders, showToast, askConfirm
}) {
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('Stationery');
  const [cost, setCost] = useState(150);
  const [stock, setStock] = useState(10);
  const [desc, setDesc] = useState('');
  const [targetGrade, setTargetGrade] = useState('All');

  const canEditShop = canUserCRUDShop(role);

  const handlePurchase = (item) => {
    if (coins < item.cost) {
      showToast("❌ Not enough coins! Complete Timed Challenge Quizzes to earn more.", "error");
      return;
    }

    askConfirm("Confirm Store Purchase", `Spend ${item.cost} Coins on "${item.name}"?`, () => {
      setCoins(c => c - item.cost);
      
      const newOrder = {
        id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
        student_name: authName,
        name: item.name,
        cost: item.cost,
        date: new Date().toISOString().split('T')[0],
        status: 'Pending Teacher Collection',
        code: `GR${studentGrade}-${Math.floor(1000 + Math.random() * 9000)}`
      };

      setOrders(prev => [newOrder, ...prev]);
      showToast(`🎉 Claimed ${item.name}! Show collection code '${newOrder.code}' to your teacher.`, "success");
    });
  };

  const handleCreateShopItem = (e) => {
    e.preventDefault();
    if (!itemName) return showToast("Enter item name", "warning");

    const newItem = {
      id: `shop_${Date.now()}`,
      name: itemName,
      category,
      cost: parseInt(cost),
      stock: parseInt(stock),
      creator_name: authName,
      target_grade: targetGrade,
      rating: 5.0,
      desc
    };

    onAddShopItem(newItem);
    setShowAddItemModal(false);
    setItemName(''); setDesc('');
  };

  const handleDeleteItem = (itemId, name) => {
    askConfirm("Delete Reward Item", `Remove "${name}" from the Reward Store?`, () => {
      onDeleteShopItem(itemId);
      showToast(`Removed "${name}" from store.`, "info");
    });
  };

  return (
    <div className="space-y-6">
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {shopItems.map((item) => (
          <div key={item.id} className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4 shadow-xs hover:shadow-md transition flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-50 border border-amber-200 text-amber-800 px-2.5 py-1 rounded-lg">
                  {item.category} • Grade {item.target_grade || 'All'}
                </span>
                {canEditShop && (
                  <button onClick={() => handleDeleteItem(item.id, item.name)} className="text-slate-300 hover:text-rose-600 p-1 rounded-lg transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <h3 className="font-black text-slate-900 text-base">{item.name}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{item.desc || 'Curriculum reward item.'}</p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-amber-600 font-black text-sm flex items-center space-x-1">
                <span>🪙</span>
                <span>{item.cost} Coins</span>
              </span>

              {role === 'student' ? (
                <button
                  onClick={() => handlePurchase(item)}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black px-4 py-2 rounded-xl text-xs transition shadow-xs"
                >
                  Claim Item
                </button>
              ) : (
                <span className="text-xs font-bold text-slate-400">Stock: {item.stock || 10}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {showAddItemModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 text-slate-900 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-black">Add Reward Store Item</h3>
            <form onSubmit={handleCreateShopItem} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Item Title</label>
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
                  <label className="font-bold block mb-1">Initial Stock</label>
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
                <label className="font-bold block mb-1">Description</label>
                <textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  rows={2}
                  placeholder="Details about collection..."
                  className="w-full border rounded-xl p-2.5"
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button type="button" onClick={() => setShowAddItemModal(false)} className="w-full bg-slate-100 hover:bg-slate-200 font-bold py-2.5 rounded-xl transition">
                  Cancel
                </button>
                <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black py-2.5 rounded-xl transition">
                  Save to Supabase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}