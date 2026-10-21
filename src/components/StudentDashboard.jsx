import React from 'react';
import { Play, Flame, Heart, Trophy, Clock, BookOpen } from 'lucide-react';
import { ALL_SUBJECTS } from '../utils/helpers';

export default function StudentDashboard({ grade, quizzes, selectedSubject, setSelectedSubject, startQuiz }) {
  const filteredQuizzes = quizzes.filter(q => 
    q.grade === parseInt(grade) && (selectedSubject === 'All' || q.subject === selectedSubject)
  );

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 rounded-3xl p-6 sm:p-8 text-white space-y-3 shadow-lg">
        <span className="bg-white/10 border border-white/20 text-indigo-200 font-bold px-3 py-1 rounded-full text-xs uppercase tracking-wider">
          Grade {grade} Student Vault
        </span>
        <h2 className="text-2xl sm:text-3xl font-black">Interactive Curriculum Practice</h2>
        <p className="text-indigo-200 text-xs sm:text-sm max-w-xl">
          Complete subject practice modules to earn coins and unlock academic achievement certificates.
        </p>
      </div>

      {/* Subject Filter Bar */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none whitespace-nowrap">
        <button
          onClick={() => setSelectedSubject('All')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
            selectedSubject === 'All' ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-700'
          }`}
        >
          All Subjects
        </button>
        {ALL_SUBJECTS.map(subj => (
          <button
            key={subj}
            onClick={() => setSelectedSubject(subj)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              selectedSubject === subj ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-700'
            }`}
          >
            {subj}
          </button>
        ))}
      </div>

      {filteredQuizzes.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-400 text-xs">
          No practice tests available for Grade {grade} in {selectedSubject}.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredQuizzes.map((quiz) => (
            <div key={quiz.id} className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4 hover:shadow-md transition">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-50 border border-indigo-100 text-indigo-700 px-2.5 py-1 rounded-lg">
                  {quiz.subject}
                </span>
                <span className="text-xs text-slate-400 font-medium">{quiz.questions.length} Qs</span>
              </div>

              <h3 className="font-black text-slate-900 text-base leading-snug">{quiz.title}</h3>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => startQuiz(quiz, 'practice')}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2.5 rounded-xl text-xs transition flex items-center justify-center space-x-1"
                >
                  <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Practice</span>
                </button>
                <button
                  onClick={() => startQuiz(quiz, 'challenge')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs transition flex items-center justify-center space-x-1 shadow-xs"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Challenge</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}