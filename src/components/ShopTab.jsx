import React, { useState } from 'react';
import { Coins, ShoppingBag, Plus, Trash2, Upload, Lock, ShieldCheck, Receipt, Package, UserCheck } from 'lucide-react';
import { canUserCRUDShop } from '../utils/helpers';

export default function ShopTab({ role, authName, studentGrade, shopItems, setShopItems, coins, setCoins, orders, setOrders }) {
  const [shopView, setShopView] = useState('catalog');
  const canEditShop = canUserCRUDShop(role);

  // Teacher / Admin Shop Item Creation Modal
  const [showItemModal, setShowItemModal] = useState(false);
  const [itemName, setItemName] = useState('');
  const [itemCategory, setItemCategory] = useState('School Supplies');
  const [itemCost, setItemCost] = useState(200);
  const [itemStock, setItemStock] = useState(10);
  const [targetGrade, setTargetGrade] = useState(studentGrade || '7'); // Grade restriction
  const [itemImageUrl, setItemImageUrl] = useState('');
  const [uploadedImageData, setUploadedImageData] = useState(null);
  const [itemDesc, setItemDesc] = useState('');

  const handleImageFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (uploadEvent) => setUploadedImageData(uploadEvent.target.result);
    reader.readAsDataURL(file);
  };

  const handleCreateShopItem = (e) => {
    e.preventDefault();
    if (!itemName) return alert("Please enter item name.");

    const finalImage = uploadedImageData || itemImageUrl.trim() || 'https://images.unsplash.com/photo-1585336261026-8f5786372969?auto=format&fit=crop&w=600&q=80';
    const newShopItem = {
      id: `item_${Date.now()}`,
      name: itemName,
      category: itemCategory,
      cost: parseInt(itemCost),
      stock: parseInt(itemStock),
      creator_name: authName || 'Class Teacher',
      target_grade: targetGrade === 'All' ? 'All' : parseInt(targetGrade),
      image_url: finalImage,
      desc: itemDesc || 'Teacher custom student merchandise item.'
    };

    setShopItems([newShopItem, ...shopItems]);
    setShowItemModal(false);
    setItemName(''); setUploadedImageData(null); setItemImageUrl('');
    alert(`🎉 Teacher Store Item Created for Grade ${targetGrade}!`);
  };

  const handleDeleteItem = (id) => {
    if (!canEditShop) return;
    if (window.confirm("Delete this item from the store?")) {
      setShopItems(shopItems.filter(i => i.id !== id));
    }
  };

  const handleBuyItem = (item) => {
    // Strict Grade Restriction Guard
    if (role === 'student' && item.target_grade !== 'All' && parseInt(item.target_grade) !== parseInt(studentGrade)) {
      alert(`❌ Grade Restriction Block!\nThis item was created specifically for Grade ${item.target_grade} students.\nYou are registered in Grade ${studentGrade}.`);
      return;
    }

    if (coins < item.cost) {
      alert(`❌ Insufficient Coins! You need ${item.cost - coins} more coins.`);
      return;
    }

    const gradePrefix = item.target_grade !== 'All' ? `GR${item.target_grade}` : 'GEN';
    const claimCode = `${gradePrefix}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder = {
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      student_name: authName || 'Student',
      name: item.name,
      cost: item.cost,
      date: new Date().toISOString().split('T')[0],
      status: 'Pending Teacher Collection',
      code: claimCode
    };

    setCoins(c => c - item.cost);
    setOrders([newOrder, ...orders]);
    alert(`🎉 Voucher Claimed!\nItem: ${item.name}\nVoucher Code: ${claimCode}\nShow this voucher code to your teacher to collect your item.`);
  };

  const handleFulfillOrder = (orderId) => {
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'Handed Over / Delivered ✅' } : o));
    alert("✅ Voucher order marked as delivered to student!");
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row justify-between items-center gap-4 shadow-md">
        <div className="space-y-2">
          <span className="bg-white/20 text-white font-bold px-3 py-1 rounded-full text-xs uppercase tracking-wider">
            {role === 'teacher' ? 'Teacher Class Store Hub' : 'Student Reward Store'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black">EduSpark Store & Voucher Center</h2>
          <p className="text-amber-100 text-xs max-w-lg">
            {role === 'teacher' 
              ? 'Teachers can publish merchandise and stationary items exclusive to their grade students.'
              : 'Redeem your earned Edu Coins for physical stationery and special class vouchers.'}
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          {role === 'student' && (
            <div className="bg-white/20 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/30 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider block text-amber-100">Coin Balance</span>
              <div className="flex items-center space-x-1.5 text-2xl font-black">
                <Coins className="w-6 h-6 fill-white" />
                <span>{coins}</span>
              </div>
            </div>
          )}

          {canEditShop && (
            <button
              onClick={() => setShowItemModal(true)}
              className="bg-slate-900 hover:bg-slate-800 text-white font-black px-5 py-3 rounded-2xl text-xs transition shadow-md flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>+ Create Grade Item (CRUD)</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Bar */}
      <div className="flex space-x-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setShopView('catalog')}
          className={`px-4 py-2 font-bold rounded-xl text-xs transition ${
            shopView === 'catalog' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-700'
          }`}
        >
          Store Catalog
        </button>
        <button
          onClick={() => setShopView('ledger')}
          className={`px-4 py-2 font-bold rounded-xl text-xs transition flex items-center space-x-1.5 ${
            shopView === 'ledger' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-700'
          }`}
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>{canEditShop ? 'Student Voucher Orders' : 'My Claimed Vouchers'} ({orders.length})</span>
        </button>
      </div>

      {shopView === 'catalog' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {shopItems.map((item) => {
            const isGradeRestricted = item.target_grade !== 'All';
            const isStudentLocked = role === 'student' && isGradeRestricted && parseInt(item.target_grade) !== parseInt(studentGrade);

            return (
              <div key={item.id} className="bg-white border border-slate-200 rounded-3xl overflow-hidden hover:shadow-md transition flex flex-col justify-between relative">
                <div className="h-44 bg-slate-100 relative border-b">
                  <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                  
                  <span className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-lg">
                    {item.cost} Coins
                  </span>

                  {isGradeRestricted && (
                    <span className="absolute top-2 left-2 bg-purple-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center space-x-1">
                      <Lock className="w-3 h-3" />
                      <span>Grade {item.target_grade} Reserved</span>
                    </span>
                  )}

                  {canEditShop && (
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="absolute bottom-2 right-2 bg-rose-600 text-white p-2 rounded-xl text-xs shadow-md"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <h3 className="font-black text-slate-900 text-base leading-snug">{item.name}</h3>
                    </div>
                    {item.creator_name && (
                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded inline-block">
                        By {item.creator_name}
                      </span>
                    )}
                    <p className="text-xs text-slate-500 leading-relaxed pt-1">{item.desc}</p>
                  </div>

                  {role === 'student' && (
                    <button
                      onClick={() => handleBuyItem(item)}
                      disabled={isStudentLocked}
                      className={`w-full font-bold py-2.5 rounded-xl text-xs shadow-md transition flex items-center justify-center space-x-1.5 ${
                        isStudentLocked
                          ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                          : 'bg-amber-500 hover:bg-amber-600 text-white'
                      }`}
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>{isStudentLocked ? `Locked to Grade ${item.target_grade} Students` : `Redeem for ${item.cost} Coins`}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Voucher Fulfillment Ledger */
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
          <h3 className="font-black text-slate-900 text-base flex items-center space-x-2">
            <Package className="w-5 h-5 text-amber-500" />
            <span>{canEditShop ? 'Student Store Voucher Receipts & Fulfillment' : 'My Claimed Vouchers'}</span>
          </h3>

          {orders.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">No store vouchers recorded.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                    <th className="py-3 px-3">Voucher ID</th>
                    <th className="py-3 px-3">Student Name</th>
                    <th className="py-3 px-3">Item Name</th>
                    <th className="py-3 px-3">Coins</th>
                    <th className="py-3 px-3">Claim Code</th>
                    <th className="py-3 px-3">Status</th>
                    {canEditShop && <th className="py-3 px-3 text-right">Teacher Action</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-3 font-mono font-bold text-slate-600">{ord.id}</td>
                      <td className="py-3.5 px-3 font-bold text-slate-900">{ord.student_name}</td>
                      <td className="py-3.5 px-3 font-bold text-slate-800">{ord.name}</td>
                      <td className="py-3.5 px-3 font-bold text-amber-600">{ord.cost} 🪙</td>
                      <td className="py-3.5 px-3">
                        <span className="font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-lg">
                          {ord.code}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                          ord.status.includes('Delivered') ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {ord.status}
                        </span>
                      </td>
                      {canEditShop && (
                        <td className="py-3.5 px-3 text-right">
                          {!ord.status.includes('Delivered') && (
                            <button
                              onClick={() => handleFulfillOrder(ord.id)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl text-[11px] shadow-xs"
                            >
                              Mark Delivered ✅
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Teacher / Admin Store Item Creation Modal */}
      {showItemModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-black text-slate-900 text-base">Create Grade Merchandise Item</h3>
              <button onClick={() => setShowItemModal(false)} className="text-slate-400 font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateShopItem} className="space-y-3 text-xs font-medium">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Item Name</label>
                <input type="text" value={itemName} onChange={(e) => setItemName(e.target.value)} placeholder="e.g. Grade 7 Geometry Kit" className="w-full bg-slate-50 border rounded-xl p-2.5" required />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Target Grade Lock</label>
                  <select value={targetGrade} onChange={(e) => setTargetGrade(e.target.value)} className="w-full bg-slate-50 border rounded-xl p-2.5 font-bold text-purple-700">
                    <option value="All">All Grades</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(g => (
                      <option key={g} value={g}>Grade {g} Only</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Cost (Coins)</label>
                  <input type="number" value={itemCost} onChange={(e) => setItemCost(e.target.value)} className="w-full bg-slate-50 border rounded-xl p-2.5 font-bold text-amber-600" required />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Upload Product Photo OR Image URL</label>
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" value={itemImageUrl} onChange={(e) => setItemImageUrl(e.target.value)} placeholder="https://..." className="bg-slate-50 border rounded-xl p-2 text-xs" />
                  <label className="cursor-pointer bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold rounded-xl p-2 text-center flex items-center justify-center space-x-1">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload File</span>
                    <input type="file" accept="image/*" onChange={handleImageFileUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Item Description</label>
                <textarea value={itemDesc} onChange={(e) => setItemDesc(e.target.value)} rows={2} className="w-full bg-slate-50 border rounded-xl p-2.5" />
              </div>

              <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl shadow-md">
                Publish Item for Grade {targetGrade} 🚀
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}