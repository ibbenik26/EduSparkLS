import React from 'react';
import { Clock, Flame, Heart, X, CheckCircle2, XCircle, Sparkles, ChevronRight, RotateCcw, Trophy, Image as ImageIcon } from 'lucide-react';
import { isRTLSubject } from '../utils/helpers';

export default function QuizRunnerModal({
  activeQuiz,
  quizMode,
  currentQuestionIdx,
  hearts,
  timeLeft,
  streak,
  selectedOption,
  showExplanation,
  score,
  quizFinished,
  gameOver,
  handleAnswerSubmit,
  nextQuestion,
  startQuiz,
  onClose
}) {
  if (!activeQuiz) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 transition-all duration-300">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-8 space-y-5 shadow-2xl border border-slate-100 relative overflow-hidden max-h-[95vh] overflow-y-auto">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

        {!quizFinished && !gameOver ? (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-3">
                <span className="bg-slate-100 text-slate-700 font-extrabold text-xs px-3 py-1.5 rounded-xl border border-slate-200/80">
                  Q {currentQuestionIdx + 1} / {activeQuiz.questions.length}
                </span>

                {(quizMode === 'challenge' || quizMode === 'olevel') && (
                  <div className="flex items-center space-x-1.5 bg-rose-50 border border-rose-200/60 px-3 py-1.5 rounded-xl">
                    {[...Array(3)].map((_, i) => (
                      <Heart
                        key={i}
                        className={`w-4 h-4 transition-all duration-300 ${
                          i < hearts
                            ? 'text-rose-500 fill-rose-500 scale-100 drop-shadow-xs'
                            : 'text-slate-300 fill-slate-200 scale-90 opacity-40'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2.5">
                {(quizMode === 'challenge' || quizMode === 'olevel') && (
                  <div className={`flex items-center space-x-1.5 font-mono font-bold text-xs px-3 py-1.5 rounded-xl border transition-colors ${
                    timeLeft < 15
                      ? 'bg-rose-50 border-rose-300 text-rose-600 animate-pulse'
                      : 'bg-amber-50 border-amber-200 text-amber-700'
                  }`}>
                    <Clock className="w-3.5 h-3.5" />
                    <span>{Math.floor(timeLeft / 60)}m {String(timeLeft % 60).padStart(2, '0')}s</span>
                  </div>
                )}

                {streak > 1 && (
                  <div className="flex items-center space-x-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black text-xs px-3 py-1.5 rounded-xl shadow-xs">
                    <Flame className="w-3.5 h-3.5 fill-white" />
                    <span>{streak}x Streak</span>
                  </div>
                )}

                <button
                  onClick={onClose}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* DIAGRAM DISPLAY AREA */}
            {activeQuiz.questions[currentQuestionIdx].diagram_url && (
              <div className="w-full bg-slate-900/5 border border-slate-200 rounded-2xl p-2.5 flex flex-col justify-center items-center space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1 self-start px-1">
                  <ImageIcon className="w-3 h-3 text-indigo-600" />
                  <span>Question Reference Diagram</span>
                </span>
                <img
                  src={activeQuiz.questions[currentQuestionIdx].diagram_url}
                  alt="Question Diagram"
                  className="max-h-56 sm:max-h-64 w-auto object-contain rounded-xl shadow-xs border border-white"
                />
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold tracking-wider uppercase text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-lg">
                  {activeQuiz.questions[currentQuestionIdx].topic || activeQuiz.subject}
                </span>
                <span className="text-xs text-slate-400 font-medium">{activeQuiz.title}</span>
              </div>

              <h3 className={`text-base sm:text-lg font-black text-slate-900 leading-snug pt-1 ${
                isRTLSubject(activeQuiz.subject) ? 'text-right dir-rtl font-thana' : ''
              }`}>
                {activeQuiz.questions[currentQuestionIdx].question_text}
              </h3>
            </div>

            <div className="space-y-2.5">
              {['A', 'B', 'C', 'D'].map((opt) => {
                const optionText = activeQuiz.questions[currentQuestionIdx][`option_${opt.toLowerCase()}`];
                if (!optionText) return null;

                const isCorrectOpt = opt === activeQuiz.questions[currentQuestionIdx].correct_option;
                const isSelectedOpt = selectedOption === opt;

                let btnStyle = "bg-slate-50 border-slate-200 text-slate-800 hover:bg-indigo-50/50 hover:border-indigo-300";
                let badgeStyle = "bg-white text-slate-700 border-slate-300";

                if (showExplanation) {
                  if (isCorrectOpt) {
                    btnStyle = "bg-emerald-50 border-emerald-400 text-emerald-950 font-bold shadow-xs ring-2 ring-emerald-400/20";
                    badgeStyle = "bg-emerald-600 text-white border-emerald-600";
                  } else if (isSelectedOpt) {
                    btnStyle = "bg-rose-50 border-rose-400 text-rose-950 font-bold shadow-xs";
                    badgeStyle = "bg-rose-600 text-white border-rose-600";
                  } else {
                    btnStyle = "bg-slate-50/50 border-slate-200 text-slate-400 opacity-50";
                    badgeStyle = "bg-slate-100 text-slate-400 border-slate-200";
                  }
                }

                return (
                  <button
                    key={opt}
                    onClick={() => handleAnswerSubmit(opt)}
                    disabled={showExplanation}
                    className={`w-full p-3.5 rounded-2xl border-2 text-left text-xs sm:text-sm font-medium transition-all duration-200 flex items-center space-x-3 group ${btnStyle}`}
                  >
                    <span className={`w-7 h-7 rounded-xl border flex items-center justify-center font-black text-xs shrink-0 transition-colors ${badgeStyle}`}>
                      {opt}
                    </span>
                    <span className="flex-1 leading-normal">{optionText}</span>
                    {showExplanation && isCorrectOpt && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    )}
                    {showExplanation && isSelectedOpt && !isCorrectOpt && (
                      <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {showExplanation && (
              <div className="space-y-4 pt-1">
                <div className="bg-gradient-to-r from-slate-50 to-indigo-50/30 border border-slate-200 p-4 rounded-2xl space-y-1">
                  <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wide flex items-center space-x-1">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Mark Scheme & Concept Breakdown</span>
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed font-normal">
                    {activeQuiz.questions[currentQuestionIdx].explanation || 'Option verified against subject mark scheme.'}
                  </p>
                </div>

                <button
                  onClick={nextQuestion}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-black py-3.5 rounded-2xl text-xs sm:text-sm shadow-md transition flex items-center justify-center space-x-2"
                >
                  <span>{currentQuestionIdx + 1 < activeQuiz.questions.length ? 'Next Question' : 'View Quiz Summary'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        ) : gameOver ? (
          <div className="text-center py-8 space-y-5">
            <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-3xl flex items-center justify-center mx-auto border border-rose-200">
              <Heart className="w-10 h-10 text-rose-500" />
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-black text-slate-900">Session Ended</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                You ran out of lives or time during this session. Review your weak topics to strengthen your performance!
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl max-w-sm mx-auto flex justify-around text-center text-xs">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Questions Attempted</span>
                <span className="text-base font-black text-slate-800">{currentQuestionIdx} / {activeQuiz.questions.length}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Correct Answers</span>
                <span className="text-base font-black text-emerald-600">{score}</span>
              </div>
            </div>

            <div className="flex justify-center space-x-3 pt-2">
              <button
                onClick={() => startQuiz(activeQuiz, quizMode)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-2xl text-xs shadow-md transition flex items-center space-x-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Try Again</span>
              </button>
              <button
                onClick={onClose}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-6 py-3 rounded-2xl text-xs transition"
              >
                Return to Vault
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 space-y-6">
            <div className="w-20 h-20 bg-gradient-to-tr from-amber-400 to-yellow-300 text-amber-900 rounded-3xl flex items-center justify-center mx-auto shadow-lg border-2 border-amber-200">
              <Trophy className="w-10 h-10 text-amber-900" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full">
                Quiz Completed!
              </span>
              <h3 className="text-2xl font-black text-slate-900 pt-1">{activeQuiz.title}</h3>
            </div>

            <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Score</span>
                <span className="text-lg font-black text-slate-900">{score} / {activeQuiz.questions.length}</span>
              </div>
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl text-center">
                <span className="text-[10px] font-bold text-amber-700 uppercase block">+Coins</span>
                <span className="text-lg font-black text-amber-600">+{score * 15}</span>
              </div>
              <div className="bg-purple-50 border border-purple-200 p-3 rounded-2xl text-center">
                <span className="text-[10px] font-bold text-purple-700 uppercase block">+XP Gained</span>
                <span className="text-lg font-black text-purple-600">+{score * 30}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-3.5 rounded-2xl text-xs shadow-md transition"
            >
              Return to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}