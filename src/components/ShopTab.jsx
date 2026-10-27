import React, { useState } from 'react';
import { 
  CreditCard, ShoppingCart, Plus, Minus, Trash2, Upload, Lock, Receipt, 
  Package, Coins, Sparkles, CheckCircle2, ArrowRight, X, History, 
  ShoppingBag, ShieldCheck, Tag, Search, Filter, AlertCircle, Award
} from 'lucide-react';
import { canUserCRUDShop } from '../utils/helpers';

export default function ShopTab({
  role, authName, studentGrade, shopItems, setShopItems,
  coins, setCoins, orders, setOrders, showToast, askConfirm
}) {
  const [activeTab, setActiveTab] = useState('store'); // 'store', 'orders', 'wallet_history'
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]); // [{ item, quantity }]
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);

  // New Item Form State (For Teachers/Admins)
  const [itemName, setItemName] = useState('');
  const [itemCategory, setItemCategory] = useState('Stationery');
  const [itemCost, setItemCost] = useState(200);
  const [itemStock, setItemStock] = useState(15);
  const [targetGrade, setTargetGrade] = useState(studentGrade || '7');
  const [itemImageUrl, setItemImageUrl] = useState('');
  const [uploadedImageData, setUploadedImageData] = useState(null);
  const [itemDesc, setItemDesc] = useState('');

  const canEditShop = canUserCRUDShop(role);

  const cartTotalCost = cart.reduce((sum, ci) => sum + (ci.item.cost * ci.quantity), 0);
  const cartTotalCount = cart.reduce((sum, ci) => sum + ci.quantity, 0);

  // Insufficient Coin Validation on Cart Additions
  const addToCart = (item) => {
    // 1. Grade restriction guard
    if (role === 'student' && item.target_grade !== 'All' && parseInt(item.target_grade) !== parseInt(studentGrade)) {
      showToast(`🔒 Grade Block! Reserved exclusively for Grade ${item.target_grade} students.`, "error");
      return;
    }

    // 2. Insufficient Coin Balance Guard
    const potentialCartTotal = cartTotalCost + item.cost;
    if (coins < item.cost || coins < potentialCartTotal) {
      showToast(`🪙 Not Enough Edu Coins!\nItem costs ${item.cost} coins (Your balance: ${coins} coins).\nPlay a quiz or read in the E-Library to earn more!`, "warning");
      return;
    }

    const existingIndex = cart.findIndex(ci => ci.item.id === item.id);
    if (existingIndex > -1) {
      const updatedCart = [...cart];
      updatedCart[existingIndex].quantity += 1;
      setCart(updatedCart);
    } else {
      setCart([...cart, { item, quantity: 1 }]);
    }
    showToast(`Added "${item.name}" to Edu Cart 🛒`, "success");
  };

  const updateQuantity = (itemId, delta) => {
    const targetItem = cart.find(ci => ci.item.id === itemId);
    if (delta > 0 && (cartTotalCost + targetItem.item.cost) > coins) {
      showToast(`🪙 Insufficient Coin Balance to add another item!`, "warning");
      return;
    }

    const updatedCart = cart.map(ci => {
      if (ci.item.id === itemId) {
        const newQty = ci.quantity + delta;
        return newQty > 0 ? { ...ci, quantity: newQty } : null;
      }
      return ci;
    }).filter(Boolean);
    setCart(updatedCart);
  };

  const removeFromCart = (itemId) => {
    setCart(cart.filter(ci => ci.item.id !== itemId));
  };

  // Wallet Checkout Processing
  const handleWalletCheckout = () => {
    if (cart.length === 0) return;

    if (coins < cartTotalCost) {
      showToast(`❌ Insufficient Edu Wallet Balance!\nTotal: ${cartTotalCost} coins (Balance: ${coins} coins).`, "warning");
      return;
    }

    const newOrders = [];
    cart.forEach(ci => {
      for (let q = 0; q < ci.quantity; q++) {
        const gradePrefix = ci.item.target_grade !== 'All' ? `GR${ci.item.target_grade}` : 'GEN';
        const voucherCode = `${gradePrefix}-${Math.floor(1000 + Math.random() * 9000)}`;

        newOrders.push({
          id: `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
          student_name: authName || 'Student User',
          name: ci.item.name,
          cost: ci.item.cost,
          date: new Date().toISOString().split('T')[0],
          status: 'Pending Collection',
          code: voucherCode
        });
      }
    });

    setCoins(prevCoins => prevCoins - cartTotalCost);
    setOrders([...newOrders, ...orders]);
    setCart([]);
    setShowCartDrawer(false);

    showToast(`🎉 Purchase Successful!\nSpent ${cartTotalCost} Coins on ${cartTotalCount} item(s).\nVouchers issued!`, "success");
  };

  // CRUD Actions
  const handleImageFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (uploadEvent) => setUploadedImageData(uploadEvent.target.result);
    reader.readAsDataURL(file);
  };

  const handleCreateShopItem = (e) => {
    e.preventDefault();
    if (!itemName) return showToast("Enter item name.", "warning");

    const finalImage = uploadedImageData || itemImageUrl.trim() || 'https://images.unsplash.com/photo-1585336261026-8f5786372969?auto=format&fit=crop&w=600&q=80';
    const newShopItem = {
      id: `item_${Date.now()}`,
      name: itemName,
      category: itemCategory,
      cost: parseInt(itemCost),
      stock: parseInt(itemStock),
      creator_name: authName || 'Teacher',
      target_grade: targetGrade === 'All' ? 'All' : parseInt(targetGrade),
      image_url: finalImage,
      desc: itemDesc || 'School merchandise item.'
    };

    setShopItems([newShopItem, ...shopItems]);
    setShowItemModal(false);
    setItemName(''); setUploadedImageData(null); setItemImageUrl('');
    showToast(`🎉 Published "${itemName}" for Grade ${targetGrade}!`, "success");
  };

  const handleDeleteItem = (item) => {
    if (!canEditShop) return;
    askConfirm("Remove Store Product", `Delete "${item.name}" from store catalog?`, () => {
      setShopItems(shopItems.filter(i => i.id !== item.id));
      showToast(`Removed "${item.name}".`, "info");
    });
  };

  const handleFulfillOrder = (orderId) => {
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'Delivered / Handed Over ✅' } : o));
    showToast("✅ Order voucher marked as delivered!", "success");
  };

  // Category Filtering
  const categories = ['All', 'Stationery', 'School Supplies', 'Privileges', 'Tech & Gear'];

  const filteredItems = shopItems.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (item.desc || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Sleek E-Commerce Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl border border-slate-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-300 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-400/30 inline-flex items-center space-x-1.5">
              <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
              <span>EduSpark Reward Storefront</span>
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Exchange Coins For Physical Goods & Passes
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Earn coins by completing quizzes & reading textbooks, then redeem them for stationery kits and class vouchers.
            </p>
          </div>

          {/* Edu Wallet Balance Ribbon */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 sm:p-5 flex items-center space-x-4 shrink-0 shadow-inner">
            <div className="w-12 h-12 bg-amber-400/20 rounded-2xl flex items-center justify-center border border-amber-400/30">
              <Coins className="w-7 h-7 text-amber-400 fill-amber-400" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block">Edu Wallet Balance</span>
              <span className="text-2xl font-black text-amber-400 font-mono">{coins} 🪙</span>
            </div>
            <button
              onClick={() => setShowCartDrawer(true)}
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs shadow-md transition flex items-center space-x-1.5 ml-2"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Cart ({cartTotalCount})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modern Filter & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Category Pill Tabs */}
          <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box & Teacher Publish Button */}
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search rewards..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {canEditShop && (
              <button
                onClick={() => setShowItemModal(true)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-black px-4 py-2 rounded-xl text-xs shadow-md transition shrink-0 flex items-center space-x-1"
              >
                <Plus className="w-4 h-4 text-amber-400" />
                <span>Publish Item</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('store')}
          className={`px-4 py-2 font-bold rounded-xl text-xs transition ${
            activeTab === 'store' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700'
          }`}
        >
          Store Catalog ({filteredItems.length})
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 font-bold rounded-xl text-xs transition flex items-center space-x-1.5 ${
            activeTab === 'orders' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700'
          }`}
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>{canEditShop ? 'Student Orders' : 'My Claimed Vouchers'} ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('wallet_history')}
          className={`px-4 py-2 font-bold rounded-xl text-xs transition flex items-center space-x-1.5 ${
            activeTab === 'wallet_history' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Wallet Statement Log</span>
        </button>
      </div>

      {/* Main Views */}
      {activeTab === 'store' ? (
        filteredItems.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center text-slate-400 text-xs font-medium space-y-2">
            <ShoppingBag className="w-12 h-12 mx-auto text-slate-300" />
            <p>No reward items found matching "{searchQuery}".</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => {
              const isGradeRestricted = item.target_grade !== 'All';
              const isStudentLocked = role === 'student' && isGradeRestricted && parseInt(item.target_grade) !== parseInt(studentGrade);
              const isAffordable = coins >= item.cost;
              const inCart = cart.find(ci => ci.item.id === item.id);

              return (
                <div key={item.id} className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden hover:shadow-xl transition duration-300 flex flex-col justify-between group">
                  {/* Image & Badges Overlay */}
                  <div className="h-52 bg-slate-100 relative overflow-hidden border-b border-slate-100">
                    <img 
                      src={item.image_url} 
                      alt={item.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                    />
                    
                    {/* Price Tag */}
                    <span className="absolute top-3 right-3 bg-slate-900/90 backdrop-blur-md text-amber-400 font-mono font-black text-xs px-3 py-1.5 rounded-xl shadow-md border border-slate-800 flex items-center space-x-1">
                      <Coins className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{item.cost} Coins</span>
                    </span>

                    {/* Grade Restriction Tag */}
                    {isGradeRestricted && (
                      <span className="absolute top-3 left-3 bg-purple-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-xl flex items-center space-x-1 shadow-md">
                        <Lock className="w-3 h-3" />
                        <span>Grade {item.target_grade} Reserved</span>
                      </span>
                    )}

                    {/* Admin Delete Action */}
                    {canEditShop && (
                      <button
                        onClick={() => handleDeleteItem(item)}
                        className="absolute bottom-3 right-3 bg-rose-600 hover:bg-rose-700 text-white p-2 rounded-xl text-xs shadow-md transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Content & Actions */}
                  <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-md uppercase">
                          {item.category || 'Stationery'}
                        </span>
                        {item.stock && (
                          <span className="text-[10px] font-bold text-slate-400">In Stock: {item.stock}</span>
                        )}
                      </div>

                      <h3 className="font-black text-slate-900 text-base leading-snug">{item.name}</h3>
                      <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                    </div>

                    {/* Purchase / Add to Cart Controls */}
                    {role === 'student' && (
                      <button
                        onClick={() => addToCart(item)}
                        disabled={isStudentLocked}
                        className={`w-full font-bold py-3.5 rounded-2xl text-xs shadow-md transition flex items-center justify-center space-x-2 ${
                          isStudentLocked
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                            : !isAffordable
                              ? 'bg-amber-500/10 border border-amber-300 text-amber-800 hover:bg-amber-500/20'
                              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        }`}
                      >
                        {!isAffordable && !isStudentLocked ? (
                          <>
                            <AlertCircle className="w-4 h-4 text-amber-600" />
                            <span>Needs {item.cost - coins} More Coins</span>
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="w-4 h-4" />
                            <span>
                              {isStudentLocked 
                                ? `Locked to Grade ${item.target_grade}` 
                                : inCart 
                                  ? `Add More (${inCart.quantity} in cart)` 
                                  : 'Add to Edu Cart'}
                            </span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : activeTab === 'orders' ? (
        /* Orders View */
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
          <h3 className="font-black text-slate-900 text-base flex items-center space-x-2">
            <Package className="w-5 h-5 text-indigo-600" />
            <span>{canEditShop ? 'Student Store Voucher Receipts' : 'My Claimed Vouchers'}</span>
          </h3>

          {orders.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">No store voucher receipts recorded.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                    <th className="py-3 px-3">Voucher ID</th>
                    <th className="py-3 px-3">Student</th>
                    <th className="py-3 px-3">Item Name</th>
                    <th className="py-3 px-3">Coins Spent</th>
                    <th className="py-3 px-3">Voucher Code</th>
                    <th className="py-3 px-3">Status</th>
                    {canEditShop && <th className="py-3 px-3 text-right">Teacher Action</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
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
      ) : (
        /* Statement Log View */
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
          <h3 className="font-black text-slate-900 text-base flex items-center space-x-2">
            <History className="w-5 h-5 text-indigo-600" />
            <span>Edu Wallet Account Transaction Statement</span>
          </h3>

          <div className="space-y-3 font-mono text-xs">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex justify-between items-center">
              <div>
                <span className="font-bold text-emerald-900 block">Quiz Completion Credit</span>
                <span className="text-[10px] text-emerald-700">Practice & Challenge Mode Rewards</span>
              </div>
              <span className="font-black text-emerald-700 text-sm">+250 Coins 🪙</span>
            </div>

            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex justify-between items-center">
              <div>
                <span className="font-bold text-emerald-900 block">E-Library Auto-Timer Claim</span>
                <span className="text-[10px] text-emerald-700">Digital Book Reading Session</span>
              </div>
              <span className="font-black text-emerald-700 text-sm">+100 Coins 🪙</span>
            </div>

            {orders.map((ord) => (
              <div key={ord.id} className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex justify-between items-center">
                <div>
                  <span className="font-bold text-rose-900 block">Store Merchandise Purchase</span>
                  <span className="text-[10px] text-rose-700">Item: {ord.name} ({ord.code})</span>
                </div>
                <span className="font-black text-rose-700 text-sm">-{ord.cost} Coins 🪙</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cart Drawer Modal */}
      {showCartDrawer && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex justify-end">
          <div className="bg-white max-w-md w-full h-full p-6 space-y-6 flex flex-col justify-between shadow-2xl overflow-y-auto animate-fade-in">
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b pb-4">
                <div className="flex items-center space-x-2">
                  <ShoppingCart className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-black text-slate-900 text-lg">My Edu Cart</h3>
                </div>
                <button onClick={() => setShowCartDrawer(false)} className="p-2 text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-16 text-slate-400 space-y-2">
                  <ShoppingBag className="w-12 h-12 mx-auto text-slate-300" />
                  <p className="text-xs font-bold">Your Edu Cart is currently empty.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map(({ item, quantity }) => (
                    <div key={item.id} className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <img src={item.image_url} alt={item.name} className="w-12 h-12 rounded-xl object-cover border" />
                        <div>
                          <h4 className="font-bold text-slate-900 text-xs">{item.name}</h4>
                          <span className="text-[10px] font-bold text-amber-600">{item.cost * quantity} Coins</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 bg-white border border-slate-200 rounded-xl p-1">
                        <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:bg-slate-100 rounded">
                          <Minus className="w-3 h-3 text-slate-600" />
                        </button>
                        <span className="text-xs font-black px-1.5">{quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-slate-100 rounded">
                          <Plus className="w-3 h-3 text-slate-600" />
                        </button>
                        <button onClick={() => removeFromCart(item.id)} className="p-1 text-rose-600 hover:bg-rose-50 rounded">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Checkout Footer */}
            {cart.length > 0 && (
              <div className="border-t border-slate-100 pt-4 space-y-4">
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Edu Wallet Balance:</span>
                    <span className="font-bold text-slate-900">{coins} 🪙</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Cart Total:</span>
                    <span className="font-bold text-amber-600">{cartTotalCost} 🪙</span>
                  </div>
                  <div className="flex justify-between text-slate-900 font-black text-sm pt-2 border-t">
                    <span>Balance After Payment:</span>
                    <span className={coins >= cartTotalCost ? 'text-emerald-600' : 'text-rose-600'}>
                      {coins - cartTotalCost} 🪙
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleWalletCheckout}
                  disabled={coins < cartTotalCost}
                  className={`w-full font-black py-4 rounded-2xl text-xs shadow-lg transition flex items-center justify-center space-x-2 ${
                    coins < cartTotalCost
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Pay {cartTotalCost} Coins with Edu Wallet</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Teacher Publish Modal */}
      {showItemModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-black text-slate-900 text-base">Publish Store Item</h3>
              <button onClick={() => setShowItemModal(false)} className="text-slate-400 font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateShopItem} className="space-y-3 text-xs font-medium">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Item Title</label>
                <input type="text" value={itemName} onChange={(e) => setItemName(e.target.value)} placeholder="e.g. Deluxe Geometry Compass" className="w-full bg-slate-50 border rounded-xl p-2.5" required />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category</label>
                  <select value={itemCategory} onChange={(e) => setItemCategory(e.target.value)} className="w-full bg-slate-50 border rounded-xl p-2.5 font-bold text-indigo-700">
                    <option value="Stationery">Stationery</option>
                    <option value="School Supplies">School Supplies</option>
                    <option value="Privileges">Privileges</option>
                    <option value="Tech & Gear">Tech & Gear</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Grade Restriction</label>
                  <select value={targetGrade} onChange={(e) => setTargetGrade(e.target.value)} className="w-full bg-slate-50 border rounded-xl p-2.5 font-bold text-purple-700">
                    <option value="All">All Grades</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(g => (
                      <option key={g} value={g}>Grade {g} Only</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Price (Edu Coins)</label>
                <input type="number" value={itemCost} onChange={(e) => setItemCost(e.target.value)} className="w-full bg-slate-50 border rounded-xl p-2.5 font-bold text-amber-600" required />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Upload Product Photo OR Web Image URL</label>
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

              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-md">
                Publish Product to Store 🚀
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}