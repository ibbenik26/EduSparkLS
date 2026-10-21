import React from 'react';
import { ALL_SUBJECTS, generateSubjectAnalytics } from '../utils/helpers';

export default function StudentTopicDiagnosticModal({ student, subjects = ALL_SUBJECTS, onClose }) {
  if (!student) return null;
  const attempts = student.challenge_attempts || [];

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Teacher Topic Diagnostic Inspector</span>
            <h2 className="text-xl font-black text-slate-900 mt-0.5">{student.full_name} — Syllabus Topic Breakdown</h2>
            <p className="text-xs text-slate-500 font-mono">Index No: {student.index_number || 'N/A'} • Grade {student.grade}</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 font-bold text-lg">✕</button>
        </div>

        {attempts.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            This student has not submitted any quiz challenges yet.
          </div>
        ) : (
          <div className="space-y-4">
            {subjects.map(subj => {
              const stats = generateSubjectAnalytics(subj, attempts);
              if (!stats) return null;

              return (
                <div key={subj} className="border border-slate-200 rounded-2xl p-4 bg-slate-50 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                    <h3 className="font-bold text-sm text-slate-900">{subj} Topic Report</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-black ${stats.gradeBg} ${stats.gradeColor}`}>
                      Grade: {stats.predictedGrade} ({stats.accuracy}%)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 space-y-1">
                      <h4 className="text-xs font-black text-emerald-800">👍 Syllabus Topics Mastered ({stats.strongTopics.length})</h4>
                      {stats.strongTopics.length === 0 ? (
                        <p className="text-[11px] text-emerald-700 italic">No mastered topics recorded yet.</p>
                      ) : (
                        <ul className="text-xs text-emerald-900 space-y-1">
                          {stats.strongTopics.map((st, i) => (
                            <li key={i} className="flex justify-between items-center bg-white/70 px-2 py-1 rounded-lg">
                              <span className="font-medium truncate max-w-[180px]">{st.topic}</span>
                              <span className="font-bold text-emerald-700">{st.accuracy}%</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 space-y-1">
                      <h4 className="text-xs font-black text-rose-800">🎯 Weak Topics Needing Re-teaching ({stats.weakTopics.length})</h4>
                      {stats.weakTopics.length === 0 ? (
                        <p className="text-[11px] text-rose-700 italic">No weak topics! Excellent overall performance.</p>
                      ) : (
                        <ul className="text-xs text-rose-900 space-y-1">
                          {stats.weakTopics.map((wt, i) => (
                            <li key={i} className="bg-white/70 p-2 rounded-lg space-y-0.5">
                              <div className="flex justify-between font-bold">
                                <span className="truncate max-w-[180px]">{wt.topic}</span>
                                <span className="text-rose-700">{wt.accuracy}%</span>
                              </div>
                              {wt.explanation && (
                                <p className="text-[10px] text-slate-600 italic">Syllabus Focus: {wt.explanation}</p>
                              )}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}