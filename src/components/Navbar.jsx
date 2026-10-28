import React from 'react';
import { 
  LayoutDashboard, BookOpen, Award, Library, ShoppingBag, 
  User, LogOut, Coins, Sparkles, Wrench 
} from 'lucide-react';
import { ROLE_TABS, getStudentRank } from '../utils/helpers';

export default function Navbar({
  authName, role, studentGrade, coins, xp, activeTab, navigateToTab, handleLogout
}) {
  const allowedTabs = ROLE_TABS[role] || ROLE_TABS.student;
  const rank = getStudentRank(xp);

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        
        {/* Brand Header */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigateToTab(allowedTabs[0])}>
          <img 
            src="Lhohi School Logo PNG.png" 
            alt="Edusparkls Logo" 
            className="w-9 h-9 object-contain drop-shadow-xs" 
          />
          <div>
            <span className="font-black text-lg tracking-tight text-white block leading-none">Edusparkls</span>
            <span className="text-[8px] font-bold text-cyan-400 uppercase tracking-wider block pt-0.5">Students Learning Platform</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center space-x-1">
          {allowedTabs.includes('dashboard') && (
            <button
              onClick={() => navigateToTab('dashboard')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                activeTab === 'dashboard' ? 'bg-cyan-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Practice Vault</span>
            </button>
          )}

          {allowedTabs.includes('olevel') && (
            <button
              onClick={() => navigateToTab('olevel')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                activeTab === 'olevel' ? 'bg-cyan-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Cambridge Arena</span>
            </button>
          )}

          {allowedTabs.includes('studio') && (
            <button
              onClick={() => navigateToTab('studio')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                activeTab === 'studio' ? 'bg-cyan-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Wrench className="w-4 h-4 text-amber-400" />
              <span>Studio</span>
            </button>
          )}

          {allowedTabs.includes('leaderboard') && (
            <button
              onClick={() => navigateToTab('leaderboard')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                activeTab === 'leaderboard' ? 'bg-cyan-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Leaderboard</span>
            </button>
          )}

          {allowedTabs.includes('library') && (
            <button
              onClick={() => navigateToTab('library')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                activeTab === 'library' ? 'bg-cyan-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Library className="w-4 h-4" />
              <span>E-Library</span>
            </button>
          )}

          {allowedTabs.includes('shop') && (
            <button
              onClick={() => navigateToTab('shop')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                activeTab === 'shop' ? 'bg-cyan-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Reward Store</span>
            </button>
          )}

          {allowedTabs.includes('profile') && (
            <button
              onClick={() => navigateToTab('profile')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                activeTab === 'profile' ? 'bg-cyan-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Profile</span>
            </button>
          )}
        </nav>

        {/* User Badges & Actions */}
        <div className="flex items-center space-x-3">
          {role === 'student' && (
            <div className="flex items-center space-x-2 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 text-xs font-mono font-bold">
              <span className="text-amber-400 flex items-center space-x-1">
                <Coins className="w-3.5 h-3.5 fill-amber-400" />
                <span>{coins}</span>
              </span>
              <span className="text-slate-600">|</span>
              <span className="text-cyan-400 flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{xp} XP</span>
              </span>
            </div>
          )}

          <div className="text-right hidden sm:block">
            <span className="text-xs font-bold text-slate-200 block leading-tight">{authName}</span>
            <span className="text-[10px] text-cyan-400 font-bold uppercase">{role} {role === 'student' ? `• Gr ${studentGrade}` : ''}</span>
          </div>

          <button
            onClick={handleLogout}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}