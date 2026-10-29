import React from 'react';

export default function LeaderboardTab({ profiles = [], currentUserId }) {
  const sortedStudents = [...profiles]
    .filter(p => p.role === 'student')
    .sort((a, b) => (b.xp || 0) - (a.xp || 0));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 rounded-3xl p-6 sm:p-8 text-white space-y-2 shadow-lg">
        <span className="bg-white/20 text-white font-bold px-3 py-1 rounded-full text-xs uppercase tracking-wider">
          Student Honors Roll
        </span>
        <h2 className="text-2xl sm:text-3xl font-black">National Academic Leaderboard</h2>
        <p className="text-amber-100 text-xs">
          Rankings are calculated dynamically based on total Quiz XP and E-Library book claim points.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs overflow-hidden">
        {sortedStudents.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            No registered student records available yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="py-3 px-3">Rank</th>
                  <th className="py-3 px-3">Student Name</th>
                  <th className="py-3 px-3">Grade</th>
                  <th className="py-3 px-3 text-center">Coins</th>
                  <th className="py-3 px-3 text-right">Total XP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedStudents.map((s, idx) => {
                  const isMe = currentUserId && s.id === currentUserId;
                  return (
                    <tr key={s.id || idx} className={`transition font-medium ${isMe ? 'bg-cyan-50' : 'hover:bg-slate-50'}`}>
                      <td className="py-3.5 px-3 font-bold text-slate-700">
                        {idx === 0 ? '🥇 1st' : idx === 1 ? '🥈 2nd' : idx === 2 ? '🥉 3rd' : `#${idx + 1}`}
                      </td>
                      <td className="py-3.5 px-3 font-bold text-slate-900">
                        <div className="flex items-center space-x-2">
                          <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-xs">
                            {(s.full_name || 'S').charAt(0)}
                          </div>
                          <span>{s.full_name || 'Student'}</span>
                          {isMe && <span className="text-[10px] font-black text-cyan-700 bg-cyan-100 px-1.5 py-0.5 rounded">You</span>}
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-slate-600">Grade {s.grade ?? '-'}</td>
                      <td className="py-3.5 px-3 text-center font-bold text-amber-600">
                        {s.coins ?? 0} 🪙
                      </td>
                      <td className="py-3.5 px-3 text-right font-black text-indigo-600 text-sm">
                        {s.xp ?? 0} XP
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
