import React, { useState } from 'react';
import { Play, BookOpen, Clock, Filter, Lock, Sparkles } from 'lucide-react';
import { ALL_SUBJECTS, isRTLSubject } from '../utils/helpers';

export default function StudentDashboard({ grade, quizzes, startQuiz, lockedChallengeQuizIds = [] }) {
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedTopic, setSelectedTopic] = useState('All');

  // Strictly filter quizzes for the student's locked enrolled grade
  const filteredQuizzes = quizzes.filter(q => {
    const matchesGrade = parseInt(q.grade) === parseInt(grade);
    const matchesSubject = selectedSubject === 'All' || q.subject === selectedSubject;
    const matchesTopic = selectedTopic === 'All' || (q.title || '').toLowerCase().includes(selectedTopic.toLowerCase());

    return matchesGrade && matchesSubject && matchesTopic;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white space-y-2 shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 font-bold px-3 py-1 rounded-full text-xs uppercase tracking-wider">
              Enrolled Grade {grade} Vault
            </span>
            <span className="bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 font-bold px-2.5 py-1 rounded-full text-[10px] uppercase flex items-center space-x-1">
              <Lock className="w-3 h-3" />
              <span>Grade Locked</span>
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black">Grade {grade} Curriculum Modules</h2>
          <p className="text-indigo-200 text-xs max-w-xl">
            Access curriculum-aligned practice sets and timed 5-heart challenges specifically reserved for Grade {grade}.
          </p>
        </div>
      </div>

      {/* Filter Panel with Locked Grade Indicator */}
      <div className="bg-white border border-slate-200 p-4 rounded-3xl shadow-xs space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-indigo-600" />
            <span>Curriculum Subject & Topic Filter</span>
          </div>
          <span className="text-[11px] text-slate-400 font-normal">
            Need a grade change? Update your grade in your Profile Settings.
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Locked Enrolled Grade Box */}
          <div>
            <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Your Enrolled Grade</label>
            <div className="w-full bg-slate-100 border border-slate-200 rounded-xl p-2.5 text-xs font-black text-slate-700 flex items-center justify-between cursor-not-allowed">
              <span>Grade {grade} (Locked)</span>
              <Lock className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>

          {/* Subject Filter */}
          <div>
            <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Subject</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-indigo-700 focus:outline-none focus:border-indigo-500"
            >
              <option value="All">All Subjects</option>
              {ALL_SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Topic Search Filter */}
          <div>
            <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Topic Search</label>
            <input
              type="text"
              value={selectedTopic === 'All' ? '' : selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value || 'All')}
              placeholder="e.g. Optics, Grammar, Fractions"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {filteredQuizzes.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-400 text-xs font-medium space-y-2">
          <p>No practice modules available for Grade {grade} in {selectedSubject}.</p>
          <p className="text-[10px] text-slate-400">Ask your class teacher to publish new paper modules from the Teacher Studio.</p>
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