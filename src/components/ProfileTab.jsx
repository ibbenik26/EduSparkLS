import React from 'react';
import { User, Shield, Coins, Award, Clock, Sparkles } from 'lucide-react';
import { getStudentRank, BADGES } from '../utils/helpers';

export default function ProfileTab({ authName, role, coins, xp, readingHours, user }) {
  const rank = getStudentRank(xp);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Overview Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 text-center sm:text-left">
          <div className="w-20 h-20 bg-gradient-to-tr from-indigo-600 to-purple-600 text-white rounded-3xl flex items-center justify-center font-black text-2xl shadow-md">
            {authName ? authName[0].toUpperCase() : 'U'}
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-center sm:justify-start space-x-2">
              <h2 className="text-2xl font-black text-slate-900">{authName || 'Student User'}</h2>
              <span className="bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                {role}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">{user?.email || 'user@school.edu'}</p>
          </div>
        </div>

        {/* Academic Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-center">
            <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Rank Level</span>
            <span className="text-lg font-black text-slate-900 flex items-center justify-center space-x-1">
              <span>{rank.icon}</span>
              <span>{rank.title}</span>
            </span>
          </div>

          <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl text-center">
            <span className="text-[10px] font-bold uppercase text-amber-700 block mb-0.5">Edu Coins</span>
            <span className="text-lg font-black text-amber-600 flex items-center justify-center space-x-1">
              <Coins className="w-4 h-4 fill-amber-500" />
              <span>{coins}</span>
            </span>
          </div>

          <div className="bg-purple-50 border border-purple-200 p-4 rounded-2xl text-center">
            <span className="text-[10px] font-bold uppercase text-purple-700 block mb-0.5">Total XP</span>
            <span className="text-lg font-black text-purple-600 flex items-center justify-center space-x-1">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span>{xp} XP</span>
            </span>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-center">
            <span className="text-[10px] font-bold uppercase text-emerald-700 block mb-0.5">Reading Hours</span>
            <span className="text-lg font-black text-emerald-700 flex items-center justify-center space-x-1">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>{readingHours}h</span>
            </span>
          </div>
        </div>
      </div>

      {/* Badges & Achievements */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs">
        <h3 className="font-black text-slate-900 text-base flex items-center space-x-2">
          <Award className="w-5 h-5 text-indigo-600" />
          <span>Earned Academic Badges</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(BADGES || []).map((b) => (
            <div key={b.id} className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl flex items-center space-x-3">
              <span className="text-2xl">{b.icon}</span>
              <div>
                <h4 className="font-bold text-slate-900 text-xs">{b.name}</h4>
                <p className="text-[11px] text-slate-500">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}