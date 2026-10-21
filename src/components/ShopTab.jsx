import React, { useState } from 'react';
import { Coins, ShoppingBag, CheckCircle, Package, Receipt } from 'lucide-react';

export default function ShopTab({ shopItems, coins, setCoins }) {
  const [orders, setOrders] = useState([
    { id: 'ORD-9021', name: 'Deluxe Geometry Set', cost: 250, date: '2026-10-18', status: 'Ready for Collection', code: 'CLM-GEO-88' },
    { id: 'ORD-7712', name: '24h Double XP Booster', cost: 150, date: '2026-10-15', status: 'Activated', code: 'CLM-XP-12' }
  ]);

  const [shopView, setShopView] = useState('catalog');

  const handleBuyItem = (item) => {
    if (coins < item.cost) {
      alert(`❌ Insufficient Coins! You need ${item.cost - coins} more coins.`);
      return;
    }

    const claimCode = `CLM-${item.name.substring(0, 3).toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`;
    const newOrder = {
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      name: item.name,
      cost: item.cost,
      date: new Date().toISOString().split('T')[0],
      status: item.is_real ? 'Ready for Collection' : 'Activated Digital Perk',
      code: claimCode
    };

    setCoins(c => c - item.cost);
    setOrders([newOrder, ...orders]);
    alert(`🎉 Redemption Successful!\nItem: ${item.name}\nClaim Code: ${claimCode}\nShow this code to the school admin to collect your item.`);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row justify-between items-center gap-4 shadow-md">
        <div className="space-y-2">
          <span className="bg-white/20 text-white font-bold px-3 py-1 rounded-full text-xs uppercase tracking-wider">
            Student Store & Purchase Ledger
          </span>
          <h2 className="text-2xl sm:text-3xl font-black">EduSpark Reward Store</h2>
          <p className="text-amber-100 text-xs max-w-lg">
            Exchange earned test coins for physical geometry sets, school notebooks, passes, or digital boosters.
          </p>
        </div>

        <div className="bg-white/20 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/30 text-center shrink-0">
          <span className="text-[10px] font-bold uppercase tracking-wider block text-amber-100">Coin Balance</span>
          <div className="flex items-center space-x-1.5 text-2xl font-black">
            <Coins className="w-6 h-6 fill-white" />
            <span>{coins}</span>
          </div>
        </div>
      </div>

      {/* Navigation Toggle */}
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
          <span>My Purchase Ledger ({orders.length})</span>
        </button>
      </div>

      {shopView === 'catalog' ? (
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
      ) : (
        /* Purchase Ledger View */
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
          <h3 className="font-black text-slate-900 text-base flex items-center space-x-2">
            <Package className="w-5 h-5 text-amber-500" />
            <span>My Claimed Rewards & Order Receipts</span>
          </h3>

          {orders.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              You haven't claimed any items from the shop yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                    <th className="py-3 px-3">Order ID</th>
                    <th className="py-3 px-3">Item Name</th>
                    <th className="py-3 px-3">Coins Spent</th>
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3">Claim Reference Code</th>
                    <th className="py-3 px-3 text-right">Fulfillment Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-3 font-mono font-bold text-slate-600">{ord.id}</td>
                      <td className="py-3.5 px-3 font-bold text-slate-900">{ord.name}</td>
                      <td className="py-3.5 px-3 font-bold text-amber-600">{ord.cost} 🪙</td>
                      <td className="py-3.5 px-3 text-slate-500 font-mono">{ord.date}</td>
                      <td className="py-3.5 px-3">
                        <span className="font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-lg">
                          {ord.code}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-full text-[10px] font-black">
                          {ord.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}