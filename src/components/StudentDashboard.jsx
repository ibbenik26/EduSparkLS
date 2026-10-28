import React, { useState } from 'react';
import { Play, BookOpen, Lock, Plus, Trash2, Search, CheckCircle2, Check, Filter } from 'lucide-react';
import { ALL_SUBJECTS, isRTLSubject, canUserCRUDPracticeVault, lenientMatch } from '../utils/helpers';

export default function StudentDashboard({
  role,
  grade,
  quizzes,
  onDeleteQuiz,
  startQuiz,
  lockedChallengeQuizIds = [],
  completedQuizModes = [],
  onOpenDiagramUpload,
  showToast,
  askConfirm
}) {
  const [selectedGrade, setSelectedGrade] = useState(grade || 7);
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const canEditVault = canUserCRUDPracticeVault(role);

  const filteredQuizzes = quizzes.filter(q => {
    const matchesGrade = role === 'student'
      ? parseInt(q.grade) === parseInt(grade)
      : parseInt(q.grade) === parseInt(selectedGrade);

    const matchesSubject = selectedSubject === 'All' || q.subject === selectedSubject;

    const questionTextBuffer = (q.questions || []).map(qItem => `${qItem.question_text} ${qItem.topic}`).join(' ');
    const searchableBuffer = `${q.title} ${q.subject} ${q.variant || ''} ${q.exam_year || ''} Grade ${q.grade} ${questionTextBuffer}`;

    const matchesSearch = lenientMatch(searchableBuffer, searchQuery);

    return matchesGrade && matchesSubject && matchesSearch;
  });

  const handleDeleteQuizAction = (quiz) => {
    if (!canEditVault) return;
    askConfirm("Delete Practice Quiz", `Are you sure you want to delete "${quiz.title}" from the Grade ${quiz.grade} vault?`, () => {
      onDeleteQuiz(quiz.id);
      showToast(`Deleted paper "${quiz.title}".`, "info");
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-cyan-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white space-y-2 shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="bg-cyan-500/20 border border-cyan-400/30 text-cyan-200 font-bold px-3 py-1 rounded-full text-xs uppercase tracking-wider">
              {role === 'student' ? `Enrolled Grade ${grade} Vault` : `Grade ${selectedGrade} Curriculum Vault`}
            </span>
            {role === 'student' && (
              <span className="bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 font-bold px-2.5 py-1 rounded-full text-[10px] uppercase flex items-center space-x-1">
                <Lock className="w-3 h-3" />
                <span>Grade Locked</span>
              </span>
            )}
          </div>
          <h2 className="text-2xl sm:text-3xl font-black">Curriculum Practice Vault</h2>
          <p className="text-cyan-200 text-xs max-w-xl">
            Students can replay Practice Mode anytime (0 coins/XP). Timed 5-Heart Challenges can be taken ONCE to earn up to 25 coins!
          </p>
        </div>

        {canEditVault && (
          <button
            onClick={onOpenDiagramUpload}
            className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-5 py-3 rounded-2xl text-xs transition shadow-md shrink-0 flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Quiz to Grade {selectedGrade}</span>
          </button>
        )}
      </div>

      {/* Filter Panel */}
      <div className="bg-white border border-slate-200 p-4 rounded-3xl shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between text-xs font-bold text-slate-700 gap-2">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-cyan-600" />
            <span>Filter Practice Vault (Lenient Search)</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
              {role === 'student' ? 'Your Enrolled Grade' : 'Select Grade Vault'}
            </label>
            {role === 'student' ? (
              <div className="w-full bg-slate-100 border border-slate-200 rounded-xl p-2.5 text-xs font-black text-slate-700 flex items-center justify-between cursor-not-allowed">
                <span>Grade {grade} (Locked)</span>
                <Lock className="w-3.5 h-3.5 text-slate-400" />
              </div>
            ) : (
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-black text-cyan-700 focus:outline-none"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(g => (
                  <option key={g} value={g}>Grade {g} Vault</option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Subject</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-cyan-700 focus:outline-none"
            >
              <option value="All">All Subjects</option>
              {ALL_SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Search Keywords</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search topic or question..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </div>
      </div>

      {filteredQuizzes.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-400 text-xs font-medium">
          No practice modules found matching "{searchQuery || 'selected criteria'}".
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredQuizzes.map((quiz) => {
            const isDhivehi = isRTLSubject(quiz.subject);
            const isPracticeDone = completedQuizModes.includes(`${quiz.id}_practice`);
            const isChallengeCompleted = completedQuizModes.includes(`${quiz.id}_challenge`);
            const isChallengeLocked = lockedChallengeQuizIds.includes(quiz.id) || !isPracticeDone;

            return (
              <div key={quiz.id} className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4 hover:shadow-md transition relative group">
                <div className="flex justify-between items-start">
                  <span className={`text-[10px] font-black uppercase tracking-wider bg-cyan-50 border border-cyan-100 text-cyan-700 px-2.5 py-1 rounded-lg ${
                    isDhivehi ? 'font-dhivehi' : ''
                  }`}>
                    {quiz.subject} • Grade {quiz.grade}
                  </span>

                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-slate-400 font-medium">{quiz.questions.length} Qs</span>
                    {canEditVault && (
                      <button
                        onClick={() => handleDeleteQuizAction(quiz)}
                        className="text-slate-300 hover:text-rose-600 p-1 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className={`font-black text-slate-900 text-base leading-snug ${isDhivehi ? 'font-dhivehi' : ''}`}>
                    {quiz.title}
                  </h3>

                  {isChallengeCompleted && (
                    <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md mt-1.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Completed ✅ (Coins Claimed)</span>
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  {/* Practice Mode Button: Always Open & Playable Anytime! */}
                  <button
                    onClick={() => startQuiz(quiz, 'practice')}
                    className={`font-bold py-2.5 rounded-xl text-xs transition flex items-center justify-center space-x-1 ${
                      isPracticeDone
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5 text-cyan-600" />
                    <span>{isPracticeDone ? 'Practice Mode 📖' : 'Practice Mode'}</span>
                  </button>

                  {/* Timed Challenge Button: Locked Once Completed! */}
                  <button
                    onClick={() => startQuiz(quiz, 'challenge')}
                    disabled={isChallengeLocked || isChallengeCompleted}
                    className={`font-bold py-2.5 rounded-xl text-xs transition flex items-center justify-center space-x-1 shadow-xs ${
                      isChallengeCompleted
                        ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 cursor-not-allowed font-black'
                        : isChallengeLocked
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                          : 'bg-cyan-600 hover:bg-cyan-700 text-white'
                    }`}
                  >
                    {isChallengeCompleted ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Completed ✅</span>
                      </>
                    ) : isChallengeLocked ? (
                      <>
                        <Lock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Practice First</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5" />
                        <span>Timed 5-Lives</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}