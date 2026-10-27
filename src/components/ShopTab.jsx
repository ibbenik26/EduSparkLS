import React, { useState } from 'react';
import { 
  CreditCard, ShoppingCart, Plus, Minus, Trash2, Upload, Lock, Receipt, 
  Package, Coins, Sparkles, CheckCircle2, ArrowRight, X, History, 
  ShoppingBag, ShieldCheck, Tag
} from 'lucide-react';
import { canUserCRUDShop } from '../utils/helpers';

export default function ShopTab({
  role, authName, studentGrade, shopItems, setShopItems,
  coins, setCoins, orders, setOrders, showToast, askConfirm
}) {
  const [activeTab, setActiveTab] = useState('store'); // 'store', 'orders', 'wallet_history'
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

  // Cart Mechanics
  const addToCart = (item) => {
    // Grade restriction guard
    if (role === 'student' && item.target_grade !== 'All' && parseInt(item.target_grade) !== parseInt(studentGrade)) {
      showToast(`🔒 Grade Block! Reserved exclusively for Grade ${item.target_grade} students.`, "error");
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

  const cartTotalCost = cart.reduce((sum, ci) => sum + (ci.item.cost * ci.quantity), 0);
  const cartTotalCount = cart.reduce((sum, ci) => sum + ci.quantity, 0);

  // Wallet Checkout Processing
  const handleWalletCheckout = () => {
    if (cart.length === 0) return;

    if (coins < cartTotalCost) {
      showToast(`❌ Insufficient Edu Wallet Balance!\nYour total is ${cartTotalCost} coins, but you have ${coins} coins.`, "warning");
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

    showToast(`🎉 Edu Wallet Payment Successful!\nSpent ${cartTotalCost} Coins on ${cartTotalCount} item(s).\nVouchers created!`, "success");
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
      desc: itemDesc || 'School custom merchandise item.'
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

  return (
    <div className="space-y-6">
      {/* Edu Wallet Digital Card Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Digital Wallet Card */}
        <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl border border-slate-700/80 flex flex-col justify-between min-h-[220px]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex justify-between items-start relative z-10">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-300 bg-indigo-500/20 px-3 py-1 rounded-full border border-indigo-400/30 flex items-center space-x-1.5 w-fit">
                <CreditCard className="w-3.5 h-3.5 text-indigo-400" />
                <span>EduSpark Digital Student Wallet</span>
              </span>
              <h2 className="text-xl font-black mt-2 text-white">{authName || 'Student Account'}</h2>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Account Grade</span>
              <span className="text-xs font-black bg-white/10 px-2.5 py-1 rounded-lg border border-white/20">Grade {studentGrade}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-700/60 relative z-10">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Wallet Balance</span>
              <div className="flex items-center space-x-1.5 text-2xl font-black text-amber-400">
                <Coins className="w-6 h-6 fill-amber-400" />
                <span>{coins} 🪙</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Vouchers Claimed</span>
              <span className="text-2xl font-black text-white">{orders.length}</span>
            </div>

            <div className="col-span-2 sm:col-span-1 flex items-center justify-end">
              <button
                onClick={() => setShowCartDrawer(true)}
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black px-5 py-3 rounded-2xl text-xs shadow-lg transition flex items-center space-x-2 relative"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>View Cart</span>
                {cartTotalCount > 0 && (
                  <span className="bg-slate-950 text-amber-400 text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center border border-amber-400">
                    {cartTotalCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions & Teacher Command */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col justify-between space-y-4 shadow-xs">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Wallet Command Center</span>
            <h3 className="font-black text-slate-900 text-lg mt-0.5">Quick Actions</h3>
            <p className="text-xs text-slate-500 leading-relaxed mt-1">
              Add products to your Edu Cart and checkout using your accumulated Edu Coins balance.
            </p>
          </div>

          {canEditShop ? (
            <button
              onClick={() => setShowItemModal(true)}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-3.5 rounded-2xl text-xs shadow-md transition flex items-center justify-center space-x-2"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              <span>Publish Grade Item (CRUD)</span>
            </button>
          ) : (
            <button
              onClick={() => setActiveTab(activeTab === 'wallet_history' ? 'store' : 'wallet_history')}
              className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold py-3 rounded-2xl text-xs transition flex items-center justify-center space-x-2"
            >
              <History className="w-4 h-4" />
              <span>{activeTab === 'wallet_history' ? 'Back to Store' : 'Wallet Statement Log'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex space-x-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('store')}
          className={`px-4 py-2 font-bold rounded-xl text-xs transition ${
            activeTab === 'store' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700'
          }`}
        >
          Store Catalog
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 font-bold rounded-xl text-xs transition flex items-center space-x-1.5 ${
            activeTab === 'orders' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700'
          }`}
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>{canEditShop ? 'Student Voucher Orders' : 'My Claimed Vouchers'} ({orders.length})</span>
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

      {/* Main Tab Views */}
      {activeTab === 'store' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {shopItems.map((item) => {
            const isGradeRestricted = item.target_grade !== 'All';
            const isStudentLocked = role === 'student' && isGradeRestricted && parseInt(item.target_grade) !== parseInt(studentGrade);
            const inCart = cart.find(ci => ci.item.id === item.id);

            return (
              <div key={item.id} className="bg-white border border-slate-200 rounded-3xl overflow-hidden hover:shadow-md transition flex flex-col justify-between relative group">
                <div className="h-48 bg-slate-100 relative overflow-hidden border-b border-slate-100">
                  <img src={item.image_url} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                  
                  <span className="absolute top-2.5 right-2.5 bg-slate-900/90 backdrop-blur-xs text-amber-400 font-mono font-bold text-xs px-3 py-1 rounded-xl shadow-md">
                    {item.cost} Coins 🪙
                  </span>

                  {isGradeRestricted && (
                    <span className="absolute top-2.5 left-2.5 bg-purple-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center space-x-1 shadow-md">
                      <Lock className="w-3 h-3" />
                      <span>Grade {item.target_grade} Only</span>
                    </span>
                  )}

                  {canEditShop && (
                    <button
                      onClick={() => handleDeleteItem(item)}
                      className="absolute bottom-2.5 right-2.5 bg-rose-600 hover:bg-rose-700 text-white p-2 rounded-xl text-xs shadow-md transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <h3 className="font-black text-slate-900 text-base leading-snug">{item.name}</h3>
                    {item.creator_name && (
                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded inline-block">
                        By {item.creator_name}
                      </span>
                    )}
                    <p className="text-xs text-slate-500 leading-relaxed pt-1">{item.desc}</p>
                  </div>

                  {role === 'student' && (
                    <button
                      onClick={() => addToCart(item)}
                      disabled={isStudentLocked}
                      className={`w-full font-bold py-3 rounded-2xl text-xs shadow-sm transition flex items-center justify-center space-x-2 ${
                        isStudentLocked
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      }`}
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>
                        {isStudentLocked 
                          ? `Locked to Grade ${item.target_grade}` 
                          : inCart 
                            ? `Add More to Cart (${inCart.quantity} in cart)` 
                            : 'Add to Edu Cart'}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : activeTab === 'orders' ? (
        /* Orders & Voucher Fulfillment */
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
        /* Wallet Statement Log View */
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
                    <span>Cart Items Total:</span>
                    <span className="font-bold text-amber-600">{cartTotalCost} 🪙</span>
                  </div>
                  <div className="flex justify-between text-slate-900 font-black text-sm pt-2 border-t">
                    <span>Balance Remaining:</span>
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
                      : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950'
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

      {/* Teacher / Admin Store Item Creation Modal */}
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
                  <label className="font-bold text-slate-700 block mb-1">Grade Restriction</label>
                  <select value={targetGrade} onChange={(e) => setTargetGrade(e.target.value)} className="w-full bg-slate-50 border rounded-xl p-2.5 font-bold text-purple-700">
                    <option value="All">All Grades</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(g => (
                      <option key={g} value={g}>Grade {g} Only</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Price (Edu Coins)</label>
                  <input type="number" value={itemCost} onChange={(e) => setItemCost(e.target.value)} className="w-full bg-slate-50 border rounded-xl p-2.5 font-bold text-amber-600" required />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Upload Product Image OR Web URL</label>
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