import React from 'react';
import { Sparkles, Coins, Trophy, LogOut, User, BookOpen, ShoppingBag, GraduationCap, Shield, Award } from 'lucide-react';
import { getStudentRank, ROLE_TABS } from '../utils/helpers';

export default function Navbar({ authName, role, studentGrade, coins, xp, activeTab, navigateToTab, handleLogout }) {
  const rank = getStudentRank(xp);
  const allowedTabs = ROLE_TABS[role] || ROLE_TABS.student;
  const isGrade8Plus = studentGrade >= 8 || role !== 'student';

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigateToTab(allowedTabs[0])}>
          <div className="bg-gradient-to-tr from-indigo-600 to-indigo-700 p-2.5 rounded-2xl shadow-sm">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-900 tracking-tight">EduSpark <span className="text-indigo-600">IQ</span></h1>
            <p className="text-[10px] text-slate-400 font-medium">Digital School Portal</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {role === 'student' && (
            <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-2xl">
              <div className="flex items-center space-x-1 text-amber-600 font-black text-xs">
                <Coins className="w-4 h-4 fill-amber-400 text-amber-600" />
                <span>{coins}</span>
              </div>
              <span className="text-slate-300">|</span>
              <div className="flex items-center space-x-1 font-bold text-xs">
                <Trophy className={`w-3.5 h-3.5 ${rank.text}`} />
                <span className={rank.text}>{rank.title}</span>
              </div>
            </div>
          )}

          <button
            onClick={() => navigateToTab('profile')}
            className="flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 transition px-3 py-1.5 rounded-xl text-xs font-bold text-slate-800"
          >
            <User className="w-4 h-4 text-indigo-600" />
            <span className="hidden sm:inline">{authName}</span>
            <span className="bg-indigo-100 text-indigo-800 text-[9px] uppercase px-1.5 py-0.5 rounded font-black">{role}</span>
          </button>

          <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="bg-slate-50 border-t border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 flex items-center space-x-1 overflow-x-auto py-2 scrollbar-none whitespace-nowrap">
          {allowedTabs.includes('dashboard') && (
            <button
              onClick={() => navigateToTab('dashboard')}
              className={`px-3.5 py-1.5 font-bold rounded-xl text-xs transition flex items-center space-x-1.5 ${
                activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Practice Vault</span>
            </button>
          )}

          {allowedTabs.includes('olevel') && isGrade8Plus && (
            <button
              onClick={() => navigateToTab('olevel')}
              className={`px-3.5 py-1.5 font-bold rounded-xl text-xs transition flex items-center space-x-1.5 ${
                activeTab === 'olevel' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>O-Level Arena (Grade 8+)</span>
            </button>
          )}

          {allowedTabs.includes('leaderboard') && (
            <button
              onClick={() => navigateToTab('leaderboard')}
              className={`px-3.5 py-1.5 font-bold rounded-xl text-xs transition flex items-center space-x-1.5 ${
                activeTab === 'leaderboard' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Leaderboard</span>
            </button>
          )}

          {allowedTabs.includes('library') && (
            <button
              onClick={() => navigateToTab('library')}
              className={`px-3.5 py-1.5 font-bold rounded-xl text-xs transition flex items-center space-x-1.5 ${
                activeTab === 'library' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>E-Library</span>
            </button>
          )}

          {allowedTabs.includes('shop') && (
            <button
              onClick={() => navigateToTab('shop')}
              className={`px-3.5 py-1.5 font-bold rounded-xl text-xs transition flex items-center space-x-1.5 ${
                activeTab === 'shop' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Reward Store</span>
            </button>
          )}

          {allowedTabs.includes('studio') && (
            <button
              onClick={() => navigateToTab('studio')}
              className={`px-3.5 py-1.5 font-bold rounded-xl text-xs transition flex items-center space-x-1.5 ${
                activeTab === 'studio' ? 'bg-indigo-800 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Teacher Studio (CRUD)</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}