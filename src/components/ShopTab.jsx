import React, { useState, useRef } from 'react';
import { Plus, Trash2, Upload, Camera, X, Wallet, ShoppingBag, Clock, CheckCircle2, Copy, Check, Search, RefreshCw } from 'lucide-react';
import { canUserCRUDShop } from '../utils/helpers';
import { supabase } from '../lib/supabase';

export default function ShopTab({
  role, authName, studentGrade, shopItems, onAddShopItem, onDeleteShopItem, onPurchaseItem,
  coins, setCoins, orders, setOrders, onCancelOrder, onFulfillOrder, showToast, askConfirm
}) {
  const [shopSubTab, setShopSubTab] = useState('inventory');
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('Stationery');
  const [cost, setCost] = useState(150);
  const [stock, setStock] = useState(10);
  const [desc, setDesc] = useState('');
  const [targetGrade, setTargetGrade] = useState('All');
  const [imageUrl, setImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [copiedCodeId, setCopiedCodeId] = useState(null);

  const fileInputRef = useRef(null);
  const canEditShop = canUserCRUDShop(role);

  const myOrders = role === 'student' ? orders.filter(o => o.student_name === authName) : orders;
  const activePendingOrders = myOrders.filter(o => o.status === 'Pending Teacher Collection');
  const totalCoinsSpent = myOrders.reduce((sum, o) => o.status !== 'Cancelled & Refunded' ? sum + (o.cost || 0) : sum, 0);

  const copyCollectionCode = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    showToast(`Copied code '${code}' to clipboard!`, "info");
    setTimeout(() => setCopiedCodeId(null), 2500);
  };

  const handleImageFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `item_${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `items/${fileName}`;

      const { data, error } = await supabase.storage.from('shop_images').upload(filePath, file);

      if (!error && data) {
        const { data: { publicUrl } } = supabase.storage.from('shop_images').getPublicUrl(filePath);
        setImageUrl(publicUrl);
        setUploadingImage(false);
        showToast("📸 Photo uploaded to Supabase Storage!", "success");
        return;
      }
    } catch (err) {
      console.warn("Storage upload fallback to canvas compression:", err);
    }

    const img = new Image();
    const reader = new FileReader();

    reader.onload = (event) => {
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
        setImageUrl(dataUrl);
        setUploadingImage(false);
        showToast("📸 Photo processed & attached!", "info");
      };
    };
    reader.readAsDataURL(file);
  };

  const handlePurchase = (item) => {
    if (item.stock <= 0) {
      showToast("❌ Item is currently out of stock!", "error");
      return;
    }

    if (coins < item.cost) {
      showToast("❌ Not enough coins! Complete Timed Challenge Quizzes to earn more.", "error");
      return;
    }

    askConfirm("Confirm Store Purchase", `Spend ${item.cost} Coins on "${item.name}"?`, () => {
      onPurchaseItem(item);
    });
  };

  const handleCreateShopItem = (e) => {
    e.preventDefault();
    if (!itemName) return showToast("Enter item name", "warning");

    const fallbackDefault = 'https://images.unsplash.com/photo-1585336261026-6757688719d3?auto=format&fit=crop&q=80&w=600';

    const newItem = {
      id: `shop_${Date.now()}`,
      name: itemName,
      category,
      cost: parseInt(cost),
      stock: parseInt(stock),
      creator_name: authName,
      target_grade: targetGrade,
      image_url: imageUrl || fallbackDefault,
      rating: 5.0,
      desc
    };

    onAddShopItem(newItem);
    setShowAddItemModal(false);
    setItemName(''); setDesc(''); setImageUrl(''); setStock(10); setCost(150);
  };

  const handleDeleteItem = (itemId, name) => {
    askConfirm("Delete Reward Item", `Remove "${name}" permanently from database?`, () => {
      onDeleteShopItem(itemId);
      showToast(`Removed "${name}" from store.`, "info");
    });
  };

  const filteredFulfillmentOrders = orders.filter(o => {
    const text = `${o.student_name} ${o.name} ${o.code} ${o.id}`.toLowerCase();
    return text.includes(orderSearchQuery.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Wallet Header */}
      <div className="bg-gradient-to-r from-amber-600 via-rose-600 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-2">
            <span className="bg-amber-400/20 border border-amber-300/30 text-amber-200 font-bold px-3 py-1 rounded-full text-xs uppercase tracking-wider flex items-center space-x-1.5 w-fit">
              <Wallet className="w-3.5 h-3.5" />
              <span>Student Wallet & Gift Center</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-black">Edusparkls Reward Store</h2>
            <p className="text-amber-100 text-xs max-w-lg">
              Redeem earned quiz coins for physical geometry sets, stationery, and books!
            </p>
          </div>

          {canEditShop && (
            <button
              onClick={() => setShowAddItemModal(true)}
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-5 py-3 rounded-2xl text-xs transition shadow-md shrink-0 flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Gift Item</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex items-center space-x-3">
            <div className="p-3 bg-amber-400 text-slate-950 rounded-xl font-black text-xl">🪙</div>
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-200 block">Available Coins</span>
              <span className="text-xl font-black text-white">{coins} Coins</span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex items-center space-x-3">
            <div className="p-3 bg-rose-400/30 text-rose-200 rounded-xl font-black text-xl">🛍️</div>
            <div>
              <span className="text-[10px] uppercase font-bold text-rose-200 block">Active Claims</span>
              <span className="text-xl font-black text-white">{activePendingOrders.length} Pending</span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex items-center space-x-3">
            <div className="p-3 bg-emerald-400/30 text-emerald-200 rounded-xl font-black text-xl">✨</div>
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-200 block">Total Redeemed</span>
              <span className="text-xl font-black text-white">{totalCoinsSpent} Coins</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 space-x-6 text-sm font-bold text-slate-500">
        <button
          onClick={() => setShopSubTab('inventory')}
          className={`pb-3 transition flex items-center space-x-2 border-b-2 ${
            shopSubTab === 'inventory' ? 'border-amber-500 text-amber-600 font-black' : 'border-transparent hover:text-slate-800'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Gift Store ({shopItems.length})</span>
        </button>

        <button
          onClick={() => setShopSubTab('my_orders')}
          className={`pb-3 transition flex items-center space-x-2 border-b-2 relative ${
            shopSubTab === 'my_orders' ? 'border-amber-500 text-amber-600 font-black' : 'border-transparent hover:text-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>My Claimed History ({myOrders.length})</span>
          {activePendingOrders.length > 0 && (
            <span className="bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
              {activePendingOrders.length}
            </span>
          )}
        </button>

        {canEditShop && (
          <button
            onClick={() => setShopSubTab('teacher_fulfillment')}
            className={`pb-3 transition flex items-center space-x-2 border-b-2 ${
              shopSubTab === 'teacher_fulfillment' ? 'border-amber-500 text-amber-600 font-black' : 'border-transparent hover:text-slate-800'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Order Collection Studio ({orders.length})</span>
          </button>
        )}
      </div>

      {/* Store Inventory Tab */}
      {shopSubTab === 'inventory' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {shopItems.map((item) => (
            <div key={item.id} className="bg-white border border-slate-200 rounded-3xl p-5 space-y-3 shadow-xs hover:shadow-md transition flex flex-col justify-between group">
              <div className="space-y-3">
                <div className="w-full h-44 rounded-2xl overflow-hidden bg-slate-100 relative">
                  <img
                    src={item.image_url || 'https://images.unsplash.com/photo-1585336261026-6757688719d3?auto=format&fit=crop&q=80&w=600'}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  
                  <span className="absolute top-2.5 left-2.5 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg">
                    {item.category}
                  </span>

                  <span className={`absolute bottom-2.5 right-2.5 text-[10px] font-bold px-2.5 py-1 rounded-lg backdrop-blur-xs border ${
                    item.stock > 0 
                      ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300' 
                      : 'bg-rose-950/80 border-rose-500/40 text-rose-300'
                  }`}>
                    {item.stock > 0 ? `Stock: ${item.stock}` : 'Out of Stock ❌'}
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
                </div>

                {role === 'student' ? (
                  <button
                    onClick={() => handlePurchase(item)}
                    disabled={item.stock <= 0}
                    className={`font-black px-4 py-2.5 rounded-xl text-xs transition shadow-xs ${
                      item.stock > 0 
                        ? 'bg-amber-500 hover:bg-amber-600 text-slate-950' 
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {item.stock > 0 ? 'Claim Item' : 'Sold Out'}
                  </button>
                ) : (
                  <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl">
                    {item.stock} Available
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cart & Claimed Orders Tab */}
      {shopSubTab === 'my_orders' && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 font-medium flex items-start space-x-3">
            <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Collection Instructions:</p>
              <p className="mt-0.5">Show your <strong>Collection Code</strong> to your teacher to pick up your claimed items!</p>
            </div>
          </div>

          {myOrders.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-400 text-xs font-medium">
              You haven't claimed any items yet. Visit the Gift Store to spend your earned coins!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myOrders.map((order) => {
                const isPending = order.status === 'Pending Teacher Collection';
                const isCollected = order.status === 'Collected & Verified ✅';
                const isCancelled = order.status === 'Cancelled & Refunded';

                return (
                  <div key={order.id} className="bg-white border border-slate-200 rounded-3xl p-5 space-y-3 shadow-xs hover:shadow-md transition">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase bg-slate-100 px-2 py-0.5 rounded">
                        {order.id} • {order.date}
                      </span>

                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg border ${
                        isCollected
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                          : isCancelled
                            ? 'bg-rose-50 border-rose-200 text-rose-700'
                            : 'bg-amber-50 border-amber-200 text-amber-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-black text-slate-900 text-base">{order.name}</h4>
                      <span className="text-amber-600 font-black text-xs flex items-center space-x-1 mt-0.5">
                        <span>🪙</span>
                        <span>{order.cost} Coins</span>
                      </span>
                    </div>

                    <div className="bg-slate-900 text-white rounded-2xl p-3.5 flex items-center justify-between">
                      <div>
                        <span className="text-[9px] font-bold uppercase text-slate-400 block">Collection Verification Code</span>
                        <span className="text-base font-mono font-black tracking-wider text-amber-400">{order.code}</span>
                      </div>

                      <button
                        onClick={() => copyCollectionCode(order.code, order.id)}
                        className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-xl transition flex items-center space-x-1 text-xs font-bold"
                      >
                        {copiedCodeId === order.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        <span>{copiedCodeId === order.id ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>

                    {isPending && (
                      <div className="pt-1 flex justify-end">
                        <button
                          onClick={() => askConfirm("Cancel Claim", `Cancel claim for "${order.name}" and refund ${order.cost} Coins?`, () => onCancelOrder(order))}
                          className="text-rose-600 hover:text-rose-700 text-xs font-bold flex items-center space-x-1"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Cancel Order & Refund Coins</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Teacher Fulfillment Studio */}
      {shopSubTab === 'teacher_fulfillment' && canEditShop && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 p-4 rounded-3xl shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={orderSearchQuery}
                onChange={(e) => setOrderSearchQuery(e.target.value)}
                placeholder="Search by student name or code..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-amber-500"
              />
            </div>

            <span className="text-xs font-bold text-slate-500">
              Total Managed Orders: {orders.length}
            </span>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-4">Student</th>
                    <th className="p-4">Item & Cost</th>
                    <th className="p-4">Collection Code</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {filteredFulfillmentOrders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400">
                        No orders match your search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredFulfillmentOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-slate-50/80 transition">
                        <td className="p-4">
                          <span className="font-black text-slate-900 block">{ord.student_name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{ord.date} • {ord.id}</span>
                        </td>

                        <td className="p-4">
                          <span className="font-bold text-slate-900 block">{ord.name}</span>
                          <span className="text-amber-600 font-black text-[11px]">🪙 {ord.cost} Coins</span>
                        </td>

                        <td className="p-4 font-mono font-black text-amber-600 text-sm">
                          {ord.code}
                        </td>

                        <td className="p-4">
                          <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg border inline-block ${
                            ord.status === 'Collected & Verified ✅'
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                              : ord.status === 'Cancelled & Refunded'
                                ? 'bg-rose-50 border-rose-200 text-rose-700'
                                : 'bg-amber-50 border-amber-200 text-amber-800'
                          }`}>
                            {ord.status}
                          </span>
                        </td>

                        <td className="p-4 text-right space-x-2">
                          {ord.status === 'Pending Teacher Collection' && (
                            <>
                              <button
                                onClick={() => askConfirm("Fulfill Claim", `Mark "${ord.name}" for ${ord.student_name} as Delivered?`, () => onFulfillOrder(ord))}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl text-[11px] transition"
                              >
                                Fulfill & Mark Collected
                              </button>

                              <button
                                onClick={() => askConfirm("Cancel Claim", `Cancel order and refund ${ord.cost} Coins to ${ord.student_name}?`, () => onCancelOrder(ord))}
                                className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold px-3 py-1.5 rounded-xl text-[11px] transition"
                              >
                                Refund Coins
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {showAddItemModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 text-slate-900 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-black flex items-center space-x-2">
              <Camera className="w-5 h-5 text-amber-600" />
              <span>Add Reward Store Gift</span>
            </h3>

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

              <div className="space-y-2 bg-amber-50/60 border border-amber-200/80 p-3.5 rounded-2xl">
                <label className="font-black text-amber-950 block">Upload Product Image</label>
                
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageFileSelect}
                  className="hidden"
                />

                {!imageUrl ? (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="w-full bg-white border-2 border-dashed border-amber-300 hover:border-amber-500 p-6 rounded-2xl flex flex-col items-center justify-center space-y-2 transition text-amber-800"
                  >
                    <Upload className="w-6 h-6 text-amber-600" />
                    <span className="font-black text-xs">
                      {uploadingImage ? 'Processing Photo...' : 'Click to Upload Photo / Take Camera Picture'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">Supports PNG, JPG, WEBP</span>
                  </button>
                ) : (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 group">
                    <img src={imageUrl} alt="Uploaded item preview" className="w-full h-36 object-cover" />
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="absolute top-2 right-2 bg-slate-950/80 text-white p-1.5 rounded-xl hover:bg-rose-600 transition"
                      title="Remove image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-2 left-2 bg-emerald-950/80 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-md">
                      Ready to Save ✅
                    </div>
                  </div>
                )}
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
                <button
                  type="submit"
                  disabled={uploadingImage}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black py-2.5 rounded-xl transition shadow-sm"
                >
                  {uploadingImage ? 'Processing...' : 'Save Item to Supabase 🚀'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}