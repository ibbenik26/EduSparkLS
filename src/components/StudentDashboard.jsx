import React, { useState } from 'react';
import { Play, BookOpen, Clock, Heart, Sparkles, ChevronRight, CheckCircle2 } from 'lucide-react';
import { ALL_SUBJECTS, isRTLSubject } from '../utils/helpers';

export default function StudentDashboard({ grade, quizzes, selectedSubject, setSelectedSubject, startQuiz }) {
  const filteredQuizzes = quizzes.filter(q => 
    q.grade === parseInt(grade) && (selectedSubject === 'All' || q.subject === selectedSubject)
  );

  // Grade 1 Special 1-Question Card Focus Mode
  const [g1QuestionIdx, setG1QuestionIdx] = useState(0);
  const [g1Selected, setG1Selected] = useState(null);

  if (grade === 1) {
    const grade1Questions = quizzes.flatMap(q => q.questions || []);
    const currentQ = grade1Questions[g1QuestionIdx];

    return (
      <div className="max-w-xl mx-auto space-y-6 py-4">
        <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-3xl p-6 text-center space-y-2 shadow-lg">
          <span className="text-3xl">🌟</span>
          <h2 className="text-2xl font-black">Grade 1 Fun Practice</h2>
          <p className="text-xs text-pink-100 font-bold">Answer one question at a time to earn stars!</p>
        </div>

        {currentQ ? (
          <div className="bg-white border-2 border-rose-200 rounded-3xl p-6 space-y-6 shadow-md text-center">
            <span className="text-xs font-bold bg-rose-50 border border-rose-200 text-rose-700 px-3 py-1 rounded-full">
              Question {g1QuestionIdx + 1} / {grade1Questions.length}
            </span>

            <h3 className={`text-xl font-black text-slate-900 ${isRTLSubject(currentQ.topic) ? 'font-dhivehi' : ''}`}>
              {currentQ.question_text}
            </h3>

            <div className="grid grid-cols-1 gap-3">
              {['A', 'B', 'C', 'D'].map(opt => {
                const optText = currentQ[`option_${opt.toLowerCase()}`];
                if (!optText) return null;
                const isCorrect = opt === currentQ.correct_option;
                const isSelected = g1Selected === opt;

                return (
                  <button
                    key={opt}
                    onClick={() => setG1Selected(opt)}
                    className={`p-4 rounded-2xl border-2 font-bold text-sm transition flex items-center justify-between ${
                      isSelected
                        ? isCorrect
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-900'
                          : 'bg-rose-50 border-rose-500 text-rose-900'
                        : 'bg-slate-50 border-slate-200 hover:border-indigo-300'
                    }`}
                  >
                    <span>{optText}</span>
                    {isSelected && (isCorrect ? '✅ Great Job!' : '❌ Try Again')}
                  </button>
                );
              })}
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                disabled={g1QuestionIdx === 0}
                onClick={() => { setG1QuestionIdx(i => i - 1); setG1Selected(null); }}
                className="px-4 py-2 border rounded-xl text-xs font-bold disabled:opacity-30"
              >
                Previous
              </button>

              <button
                disabled={g1QuestionIdx + 1 >= grade1Questions.length}
                onClick={() => { setG1QuestionIdx(i => i + 1); setG1Selected(null); }}
                className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black shadow-sm"
              >
                Next Question ➡️
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-slate-400 font-bold">No Grade 1 practice questions loaded yet.</div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white space-y-2 shadow-md">
        <span className="bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 font-bold px-3 py-1 rounded-full text-xs uppercase tracking-wider">
          Grade {grade} Practice Vault
        </span>
        <h2 className="text-2xl sm:text-3xl font-black">Curriculum Practice Modules</h2>
        <p className="text-indigo-200 text-xs max-w-xl">
          Choose Practice Mode to review explanations or Challenge Mode to test under timed hearts conditions.
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
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-400 text-xs font-medium">
          No practice tests available for Grade {grade} in {selectedSubject}.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredQuizzes.map((quiz) => (
            <div key={quiz.id} className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4 hover:shadow-md transition">
              <div className="flex justify-between items-start">
                <span className={`text-[10px] font-black uppercase tracking-wider bg-indigo-50 border border-indigo-100 text-indigo-700 px-2.5 py-1 rounded-lg ${
                  isRTLSubject(quiz.subject) ? 'font-dhivehi' : ''
                }`}>
                  {quiz.subject}
                </span>
                <span className="text-xs text-slate-400 font-medium">{quiz.questions.length} Qs</span>
              </div>

              <h3 className={`font-black text-slate-900 text-base leading-snug ${isRTLSubject(quiz.subject) ? 'font-dhivehi text-right' : ''}`}>
                {quiz.title}
              </h3>

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
                  <span>Timed Lives</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}