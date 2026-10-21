import React from 'react';
import { Coins, ShoppingBag, CheckCircle, Gift } from 'lucide-react';

export default function ShopTab({ shopItems, coins, setCoins }) {
  const handleBuyItem = (item) => {
    if (coins < item.cost) {
      alert(`❌ Insufficient Coins! You need ${item.cost - coins} more coins.`);
      return;
    }
    setCoins(c => c - item.cost);
    alert(`🎉 Purchase Successful!\nItem: ${item.name}\nClaim Reference: ITEM-${Math.floor(1000 + Math.random() * 9000)}`);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 rounded-3xl p-6 sm:p-8 text-white flex justify-between items-center shadow-lg">
        <div className="space-y-2">
          <span className="bg-white/20 text-white font-bold px-3 py-1 rounded-full text-xs uppercase tracking-wider">
            Student Store & Redemption
          </span>
          <h2 className="text-2xl sm:text-3xl font-black">EduSpark Store</h2>
          <p className="text-amber-100 text-xs max-w-lg">
            Exchange earned test coins for real stationery, homework waivers, and digital boosters.
          </p>
        </div>

        <div className="bg-white/20 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/30 text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider block text-amber-100">Your Coin Balance</span>
          <div className="flex items-center space-x-1.5 text-2xl font-black">
            <Coins className="w-6 h-6 fill-white" />
            <span>{coins}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {shopItems.map((item) => (
          <div key={item.id} className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 hover:shadow-md transition flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-3xl">{item.icon}</span>
                <span className="text-xs font-bold bg-amber-50 border border-amber-200 text-amber-800 px-2.5 py-1 rounded-lg flex items-center space-x-1">
                  <Coins className="w-3.5 h-3.5 fill-amber-500 text-amber-600" />
                  <span>{item.cost} Coins</span>
                </span>
              </div>

              <div>
                <h3 className="font-black text-slate-900 text-base">{item.name}</h3>
                <span className="text-[10px] font-bold text-slate-400 uppercase">{item.category}</span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
            </div>

            <button
              onClick={() => handleBuyItem(item)}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 rounded-xl text-xs shadow-md transition flex items-center justify-center space-x-1.5 mt-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Redeem for {item.cost} Coins</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}