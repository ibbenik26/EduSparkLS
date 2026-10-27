import React, { useState } from 'react';
import { Play, BookOpen, Clock, Filter, Lock } from 'lucide-react';
import { ALL_SUBJECTS, isRTLSubject } from '../utils/helpers';

export default function StudentDashboard({ grade, quizzes, startQuiz, lockedChallengeQuizIds = [] }) {
  const [selectedGrade, setSelectedGrade] = useState(grade || 7);
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedTopic, setSelectedTopic] = useState('All');

  const filteredQuizzes = quizzes.filter(q => {
    const matchesGrade = q.grade === parseInt(selectedGrade);
    const matchesSubject = selectedSubject === 'All' || q.subject === selectedSubject;
    const matchesTopic = selectedTopic === 'All' || (q.title || '').toLowerCase().includes(selectedTopic.toLowerCase());

    return matchesGrade && matchesSubject && matchesTopic;
  });

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white space-y-2 shadow-md">
        <span className="bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 font-bold px-3 py-1 rounded-full text-xs uppercase tracking-wider">
          Class Grade Curriculum Vault
        </span>
        <h2 className="text-2xl sm:text-3xl font-black">Curriculum Practice Modules</h2>
        <p className="text-indigo-200 text-xs max-w-xl">
          Select your class, subject, and topic to access practice questions and 5-heart timed challenges.
        </p>
      </div>

      <div className="bg-white border border-slate-200 p-4 rounded-3xl shadow-xs space-y-3">
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-700">
          <Filter className="w-4 h-4 text-indigo-600" />
          <span>Select Class Grade, Subject, and Topic</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Class Grade</label>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-900"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(g => (
                <option key={g} value={g}>Grade {g}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Subject</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-indigo-700"
            >
              <option value="All">All Subjects</option>
              {ALL_SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Topic Search</label>
            <input
              type="text"
              value={selectedTopic === 'All' ? '' : selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value || 'All')}
              placeholder="e.g. Optics, Grammar, Algebra"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium text-slate-900"
            />
          </div>
        </div>
      </div>

      {filteredQuizzes.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-400 text-xs font-medium">
          No curriculum quizzes found for Grade {selectedGrade} matching your criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredQuizzes.map((quiz) => {
            const isDhivehi = isRTLSubject(quiz.subject);
            const isChallengeLocked = lockedChallengeQuizIds.includes(quiz.id);

            return (
              <div key={quiz.id} className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4 hover:shadow-md transition">
                <div className="flex justify-between items-start">
                  <span className={`text-[10px] font-black uppercase tracking-wider bg-indigo-50 border border-indigo-100 text-indigo-700 px-2.5 py-1 rounded-lg ${
                    isDhivehi ? 'font-dhivehi' : ''
                  }`}>
                    {quiz.subject} • Grade {quiz.grade}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">{quiz.questions.length} Qs</span>
                </div>

                <h3 className={`font-black text-slate-900 text-base leading-snug ${isDhivehi ? 'font-dhivehi' : ''}`}>
                  {quiz.title}
                </h3>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    onClick={() => startQuiz(quiz, 'practice')}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2.5 rounded-xl text-xs transition flex items-center justify-center space-x-1"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Practice Mode</span>
                  </button>

                  <button
                    onClick={() => startQuiz(quiz, 'challenge')}
                    disabled={isChallengeLocked}
                    className={`font-bold py-2.5 rounded-xl text-xs transition flex items-center justify-center space-x-1 shadow-xs ${
                      isChallengeLocked
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`}
                  >
                    {isChallengeLocked ? (
                      <>
                        <Lock className="w-3.5 h-3.5 text-slate-500" />
                        <span>Practice Required</span>
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