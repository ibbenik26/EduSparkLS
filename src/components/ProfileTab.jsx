import React, { useState } from 'react';
import { User, Shield, Coins, Award, Clock, Sparkles, Edit3, Save, MapPin, School, Hash } from 'lucide-react';
import { getStudentRank } from '../utils/helpers';

export default function ProfileTab({
  authName, role, studentGrade, schoolName, studentAddress, indexNumber,
  coins, xp, readingHours, user, badges = [], ranks = [],
  onUpdateProfile, showToast
}) {
  const rank = getStudentRank(xp, ranks);

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(authName || '');
  const [editGrade, setEditGrade] = useState(studentGrade || 7);
  const [editSchool, setEditSchool] = useState(schoolName || 'Majeedhiyya School');
  const [editAddress, setEditAddress] = useState(studentAddress || 'M. Henveiru, Malé');
  const [editIndex, setEditIndex] = useState(indexNumber || 'STU-2026');

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!editName.trim()) return showToast("Name cannot be empty.", "warning");

    onUpdateProfile({
      full_name: editName.trim(),
      grade: parseInt(editGrade),
      school_name: editSchool.trim(),
      student_address: editAddress.trim(),
      index_number: editIndex.trim()
    });

    setIsEditing(false);
    showToast("🎉 Profile Details & Grade Promoted Successfully!", "success");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Overview Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center justify-between border-b border-slate-100 pb-6 gap-4">
          <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-5 text-center sm:text-left">
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

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-4 py-2.5 rounded-2xl text-xs transition flex items-center space-x-1.5 shadow-xs shrink-0"
          >
            <Edit3 className="w-4 h-4 text-indigo-600" />
            <span>{isEditing ? 'Cancel Editing' : 'Edit Profile & Grade'}</span>
          </button>
        </div>

        {/* Profile Edit Mode Form */}
        {isEditing ? (
          <form onSubmit={handleSaveProfile} className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-4 text-xs font-medium">
            <h3 className="font-black text-slate-900 text-sm flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Update Student Profile & Grade Advancement</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Student Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-900 font-bold"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-indigo-700 block mb-1">Grade Level (Class Advancement)</label>
                <select
                  value={editGrade}
                  onChange={(e) => setEditGrade(e.target.value)}
                  className="w-full bg-indigo-50 border border-indigo-200 rounded-xl p-2.5 text-indigo-900 font-black"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(g => (
                    <option key={g} value={g}>Grade {g}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">School Name</label>
                <input
                  type="text"
                  value={editSchool}
                  onChange={(e) => setEditSchool(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Index Number</label>
                <input
                  type="text"
                  value={editIndex}
                  onChange={(e) => setEditIndex(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700 block mb-1">Residential Address</label>
                <input
                  type="text"
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-900"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3 rounded-xl text-xs shadow-md transition flex items-center justify-center space-x-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Save & Update Enrolled Grade</span>
            </button>
          </form>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl flex items-center space-x-3">
              <School className="w-5 h-5 text-indigo-600 shrink-0" />
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">School</span>
                <span className="text-xs font-bold text-slate-900">{schoolName || 'Majeedhiyya School'}</span>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-rose-600 shrink-0" />
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Address</span>
                <span className="text-xs font-bold text-slate-900">{studentAddress || 'M. Henveiru, Malé'}</span>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl flex items-center space-x-3">
              <Hash className="w-5 h-5 text-purple-600 shrink-0" />
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Index ID</span>
                <span className="text-xs font-mono font-bold text-slate-900">{indexNumber || 'STU-2026'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Academic Rank Stats Grid */}
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

      {/* Dynamic Academic Badges */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs">
        <h3 className="font-black text-slate-900 text-base flex items-center space-x-2">
          <Award className="w-5 h-5 text-indigo-600" />
          <span>Earned Academic Badges</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {badges.map((b) => {
            const isUnlocked = xp >= (b.reqXp || 0);

            return (
              <div
                key={b.id}
                className={`p-3.5 rounded-2xl flex items-center space-x-3 border transition ${
                  isUnlocked ? 'bg-slate-50 border-slate-200' : 'bg-slate-100/60 border-slate-200 opacity-60'
                }`}
              >
                <span className="text-2xl">{b.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 text-xs">{b.name}</h4>
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                      isUnlocked ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {isUnlocked ? 'Unlocked ✅' : `Req: ${b.reqXp || 100} XP`}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">{b.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}