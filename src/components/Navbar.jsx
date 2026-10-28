import React, { useState } from 'react';
import { 
  Sparkles, Coins, LogOut, Menu, X, LayoutDashboard, Trophy, 
  BookOpen, ShoppingBag, Shield, User, Award, HeartHandshake 
} from 'lucide-react';
import { ROLE_TABS } from '../utils/helpers';

export default function Navbar({
  authName,
  role,
  studentGrade,
  coins,
  xp,
  activeTab,
  navigateToTab,
  handleLogout
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const allowedTabs = ROLE_TABS[role] || ROLE_TABS.student;

  const tabLabels = {
    dashboard: { label: 'Practice Vault', icon: <LayoutDashboard className="w-4 h-4" /> },
    olevel: { label: 'O-Level Arena', icon: <Trophy className="w-4 h-4" /> },
    leaderboard: { label: 'Leaderboard', icon: <Award className="w-4 h-4" /> },
    library: { label: 'E-Library', icon: <BookOpen className="w-4 h-4" /> },
    shop: { label: 'Reward Store', icon: <ShoppingBag className="w-4 h-4" /> },
    studio: { label: 'Teacher Studio', icon: <Shield className="w-4 h-4" /> },
    profile: { label: 'My Profile', icon: <User className="w-4 h-4" /> }
  };

  const handleMobileNav = (tabKey) => {
    navigateToTab(tabKey);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => handleMobileNav(allowedTabs[0])}>
          <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-md">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-black text-lg tracking-tight text-white flex items-center space-x-1.5">
              <span>EduSpark</span>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">
                v2.0
              </span>
            </h1>
            <p className="text-[10px] text-slate-400 font-medium hidden sm:block">National Secondary Learning Platform</p>
          </div>
        </div>

        {/* Desktop Navigation Tabs */}
        <nav className="hidden md:flex items-center space-x-1">
          {allowedTabs.map((tabKey) => {
            const tabObj = tabLabels[tabKey];
            if (!tabObj) return null;
            const isActive = activeTab === tabKey;

            return (
              <button
                key={tabKey}
                onClick={() => navigateToTab(tabKey)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                {tabObj.icon}
                <span>{tabObj.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Desktop Profile & Actions */}
        <div className="hidden md:flex items-center space-x-3">
          {/* Coins Display */}
          <div className="bg-slate-800/90 border border-amber-500/30 px-3 py-1.5 rounded-xl flex items-center space-x-1.5 shadow-inner">
            <Coins className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="font-mono font-black text-xs text-amber-400">{coins} 🪙</span>
          </div>

          {/* User Badge */}
          <div className="flex items-center space-x-2.5 bg-slate-800/80 border border-slate-700/80 px-3 py-1.5 rounded-xl">
            <div className="w-7 h-7 bg-indigo-600 text-white font-black rounded-lg flex items-center justify-center text-xs">
              {authName ? authName[0].toUpperCase() : 'U'}
            </div>
            <div className="text-left">
              <span className="text-xs font-bold text-slate-200 block leading-tight">{authName}</span>
              <span className="text-[9px] font-bold uppercase text-indigo-400">
                {role === 'student' ? `Grade ${studentGrade}` : role}
              </span>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex md:hidden items-center space-x-2">
          <div className="bg-slate-800 border border-amber-500/30 px-2.5 py-1 rounded-lg flex items-center space-x-1">
            <Coins className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="font-mono font-black text-xs text-amber-400">{coins}</span>
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 pt-3 pb-6 space-y-4 animate-fade-in">
          {/* User Info Bar */}
          <div className="bg-slate-800/80 border border-slate-700/80 p-3 rounded-2xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-indigo-600 text-white font-black rounded-xl flex items-center justify-center text-sm">
                {authName ? authName[0].toUpperCase() : 'U'}
              </div>
              <div>
                <h4 className="font-bold text-slate-100 text-xs">{authName}</h4>
                <span className="text-[10px] font-bold uppercase text-indigo-400">
                  {role === 'student' ? `Grade ${studentGrade} Student` : role}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">XP Points</span>
              <span className="text-xs font-black text-purple-400">{xp} XP</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            {allowedTabs.map((tabKey) => {
              const tabObj = tabLabels[tabKey];
              if (!tabObj) return null;
              const isActive = activeTab === tabKey;

              return (
                <button
                  key={tabKey}
                  onClick={() => handleMobileNav(tabKey)}
                  className={`p-3 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {tabObj.icon}
                  <span>{tabObj.label}</span>
                </button>
              );
            })}
          </div>

          {/* Logout Mobile Action */}
          <button
            onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }}
            className="w-full bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 font-black py-3 rounded-xl text-xs transition flex items-center justify-center space-x-2 pt-3"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out of Account</span>
          </button>
        </div>
      )}
    </header>
  );
}