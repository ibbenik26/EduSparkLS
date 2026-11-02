import React, { useState, useRef } from 'react';
import { ShoppingBag, Plus, Trash2, Image as ImageIcon, Upload, Tag, Sparkles, CheckCircle, Camera, X } from 'lucide-react';
import { canUserCRUDShop } from '../utils/helpers';
import { supabase } from '../lib/supabase';

export default function ShopTab({
  role, authName, studentGrade, shopItems, onAddShopItem, onDeleteShopItem, onPurchaseItem,
  coins, setCoins, orders, setOrders, showToast, askConfirm
}) {
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('Stationery');
  const [cost, setCost] = useState(150);
  const [stock, setStock] = useState(10);
  const [desc, setDesc] = useState('');
  const [targetGrade, setTargetGrade] = useState('All');
  const [imageUrl, setImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  const fileInputRef = useRef(null);
  const canEditShop = canUserCRUDShop(role);

  // Automatic browser image compression handler (handles phone camera photos seamlessly)
  const handleImageFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);

    try {
      // 1. Try uploading directly to Supabase Storage if bucket exists
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
      console.warn("Storage bucket upload fallback to local canvas compression:", err);
    }

    // 2. Client-side canvas compression fallback (compresses high-res photo to lightweight JPEG)
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
        
        // Export compressed image string
        const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
        setImageUrl(dataUrl);
        setUploadingImage(false);
        showToast("📸 Photo processed & attached!", "success");
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
            Redeem your earned coins for physical stationery, geometry kits, and school supplies synced to Supabase!
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

      {/* Item Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {shopItems.map((item) => (
          <div key={item.id} className="bg-white border border-slate-200 rounded-3xl p-5 space-y-3 shadow-xs hover:shadow-md transition flex flex-col justify-between group">
            <div className="space-y-3">
              {/* Product Image Display */}
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

      {/* Add Item Modal with Direct File Upload */}
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

              {/* DIRECT IMAGE FILE UPLOADER */}
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