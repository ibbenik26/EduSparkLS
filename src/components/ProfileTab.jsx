import React, { useState } from 'react';
import { User, Shield, Award, Trophy, KeyRound } from 'lucide-react';
import { getStudentRank } from '../utils/helpers';
import { supabase } from '../lib/supabase';

export default function ProfileTab({ authName, role, switchRolePreview, coins, xp, readingHours, user }) {
  const rank = getStudentRank(xp);
  const [newPass, setNewPass] = useState('');

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!newPass) return;
    try {
      const { error } = await supabase.auth.updateUser({ password: newPass });
      if (error) throw error;
      alert("✅ Password updated successfully!");
      setNewPass('');
    } catch (err) {
      alert("❌ Password update failed: " + err.message);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex items-center space-x-4 border-b pb-6">
          <div className="w-16 h-16 bg-indigo-100 text-indigo-700 rounded-2xl flex items-center justify-center text-2xl font-black">
            {authName.charAt(0)}
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900">{authName}</h2>
            <p className="text-xs font-mono text-slate-500">{user?.email}</p>
            <span className="inline-block mt-1 bg-indigo-100 text-indigo-800 text-[10px] font-black uppercase px-2 py-0.5 rounded">
              Role: {role}
            </span>
          </div>
        </div>

        {role === 'student' && (
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-slate-50 border p-3 rounded-2xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Total XP</span>
              <span className="text-lg font-black text-indigo-600">{xp}</span>
            </div>
            <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl">
              <span className="text-[10px] font-bold text-amber-700 uppercase block">Rank</span>
              <span className="text-lg font-black text-amber-800">{rank.title}</span>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl">
              <span className="text-[10px] font-bold text-emerald-700 uppercase block">Reading Hours</span>
              <span className="text-lg font-black text-emerald-800">{readingHours}h</span>
            </div>
          </div>
        )}

        {/* Role Switcher Sandbox Tool */}
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2">
          <span className="text-xs font-bold text-slate-700 block">Preview Role Navigation Switcher</span>
          <div className="flex flex-wrap gap-2">
            {['student', 'teacher', 'shop_admin', 'super_admin'].map(r => (
              <button
                key={r}
                onClick={() => switchRolePreview(r)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition ${
                  role === r ? 'bg-indigo-600 text-white' : 'bg-white border text-slate-700'
                }`}
              >
                {r.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Change Password */}
        <form onSubmit={handleChangePassword} className="space-y-3 border-t pt-6">
          <h3 className="font-black text-slate-900 text-sm flex items-center space-x-1.5">
            <KeyRound className="w-4 h-4 text-indigo-600" />
            <span>Update Account Password</span>
          </h3>
          <div className="flex gap-2">
            <input
              type="password"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              placeholder="New password (min 6 chars)"
              className="flex-1 bg-slate-50 border rounded-xl px-3 py-2 text-xs"
              required
            />
            <button type="submit" className="bg-indigo-600 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-xs">
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}