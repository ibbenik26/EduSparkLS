import React from 'react';
import { X, Heart, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { getDhivehiFormat } from '../utils/helpers';

export default function QuizRunnerModal({
  activeQuiz, quizMode, currentQuestionIdx, hearts, timeLeft, streak, selectedOption,
  showExplanation, score, quizFinished, gameOver, handleAnswerSubmit, nextQuestion, startQuiz, onClose
}) {
  if (!activeQuiz) return null;

  // Safely parse questions array (handles string, double-stringified JSON, or raw arrays)
  let rawQuestions = activeQuiz.questions;
  if (typeof rawQuestions === 'string') {
    try {
      rawQuestions = JSON.parse(rawQuestions);
      if (typeof rawQuestions === 'string') {
        rawQuestions = JSON.parse(rawQuestions);
      }
    } catch (e) {
      rawQuestions = [];
    }
  }

  const questions = Array.isArray(rawQuestions) ? rawQuestions : [];
  const totalQuestions = questions.length;
  const currentQuestion = questions[currentQuestionIdx] || {};

  // Extract Question Text across key aliases
  const questionText = currentQuestion.question || 
                       currentQuestion.question_text || 
                       currentQuestion.text || 
                       currentQuestion.prompt || 
                       'No question text available.';

  // Universal Options Extractor
  const extractOptions = (q) => {
    if (!q) return [];
    let raw = q.options || q.choices || q.answers || q.opts || q.option_list;

    if (typeof raw === 'string') {
      try {
        raw = JSON.parse(raw);
      } catch (e) {
        if (raw.includes(',')) {
          raw = raw.split(',').map(s => s.trim());
        }
      }
    }

    if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
      raw = Object.values(raw);
    }

    if (!Array.isArray(raw) || raw.length === 0) {
      const keys = ['option1', 'option2', 'option3', 'option4', 
                    'option_a', 'option_b', 'option_c', 'option_d',
                    'opt1', 'opt2', 'opt3', 'opt4',
                    'a', 'b', 'c', 'd', 'A', 'B', 'C', 'D'];
      const collected = [];
      for (const k of keys) {
        if (q[k] !== undefined && q[k] !== null && String(q[k]).trim() !== '') {
          collected.push(String(q[k]).trim());
        }
      }
      if (collected.length >= 2) raw = collected;
    }

    if (!Array.isArray(raw)) return [];

    return raw
      .map(opt => {
        if (opt === null || opt === undefined) return '';
        if (typeof opt === 'object') {
          return opt.text || opt.option || opt.label || opt.value || Object.values(opt)[0] || '';
        }
        return String(opt);
      })
      .map(s => String(s).trim())
      .filter(s => s.length > 0);
  };

  const options = extractOptions(currentQuestion);

  // Correct Option Matcher
  const correctOption = String(
    currentQuestion.correct_option || 
    currentQuestion.correctOption || 
    currentQuestion.answer || 
    currentQuestion.correct_answer || 
    currentQuestion.correct || 
    currentQuestion.right_option || 
    ''
  ).trim();

  // Extract Diagram Image URL across all key aliases
  const diagramUrl = currentQuestion.image_url || 
                     currentQuestion.imageUrl || 
                     currentQuestion.diagram_url || 
                     currentQuestion.diagram || 
                     currentQuestion.image || 
                     currentQuestion.img_url || 
                     currentQuestion.img || '';

  const isLastQuestion = currentQuestionIdx === totalQuestions - 1;

  // Detect Dhivehi / Islam / Quran formatting & Faruma font
  const questionFormat = getDhivehiFormat(activeQuiz.subject || '', questionText);

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 text-slate-900 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        
        {/* Header Bar */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 px-2.5 py-1 rounded-lg">
              {activeQuiz.subject || 'General'} • Grade {activeQuiz.grade || 7}
            </span>
            <h2 className={`text-lg font-black mt-1 text-slate-900 ${questionFormat.className}`}>
              {activeQuiz.title || 'Quiz'}
            </h2>
          </div>

          <div className="flex items-center space-x-3">
            {(quizMode === 'challenge' || quizMode === 'olevel') && (
              <div className="flex items-center space-x-1 text-rose-600 font-black text-sm bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200">
                <Heart className="w-4 h-4 fill-rose-600" />
                <span>{hearts}</span>
              </div>
            )}

            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-700 transition">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Empty Questions Fallback */}
        {totalQuestions === 0 ? (
          <div className="text-center py-8 space-y-4">
            <p className="text-sm font-bold text-slate-500">No questions found in this quiz.</p>
            <button onClick={onClose} className="bg-slate-900 text-white font-bold px-5 py-2.5 rounded-xl text-xs">
              Close Quiz
            </button>
          </div>
        ) : quizFinished || gameOver ? (
          /* Finished / Game Over Screen */
          <div className="text-center py-8 space-y-4">
            <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto text-3xl font-black shadow-inner">
              {gameOver ? '💔' : score === totalQuestions ? '⭐' : '🏆'}
            </div>

            <h3 className="text-2xl font-black text-slate-900">
              {gameOver ? 'Out of Hearts!' : score === totalQuestions ? 'Perfect Score!' : 'Quiz Completed!'}
            </h3>

            <p className="text-sm text-slate-500 font-bold max-w-sm mx-auto">
              You scored <span className="text-amber-600 font-black">{score}</span> out of <span className="font-black">{totalQuestions}</span> questions correctly.
            </p>

            <div className="pt-4 flex justify-center space-x-3">
              <button
                onClick={onClose}
                className="bg-slate-900 hover:bg-slate-800 text-white font-black px-6 py-3 rounded-2xl text-xs transition shadow-md"
              >
                Close & Return
              </button>
            </div>
          </div>
        ) : (
          /* Active Question View */
          <div className="space-y-6">
            <div className="flex justify-between items-center text-xs font-bold text-slate-400">
              <span>Question {currentQuestionIdx + 1} of {totalQuestions}</span>
              {streak > 1 && <span className="text-amber-600 font-black">🔥 {streak}x Streak!</span>}
            </div>

            {/* Question Text Box */}
            <div
              dir={questionFormat.dir}
              className={`bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-3 ${questionFormat.className}`}
            >
              <h3 className="text-lg font-black text-slate-900 leading-relaxed">
                {questionText}
              </h3>

              {/* Diagram Image Container */}
              {diagramUrl && (
                <div className="mt-4 bg-white p-3 rounded-2xl border border-slate-200 text-center shadow-xs">
                  <img
                    src={diagramUrl}
                    alt="Optics / Question Diagram"
                    className="max-h-72 w-full object-contain rounded-xl mx-auto"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>

            {/* Options List */}
            {options.length === 0 ? (
              <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl text-xs font-bold">
                ⚠️ No options available for this question.
              </div>
            ) : (
              <div className="space-y-3" dir={questionFormat.dir}>
                {options.map((opt, idx) => {
                  const optTrimmed = String(opt).trim();
                  const isSelected = selectedOption === optTrimmed || selectedOption === opt;
                  
                  const isCorrect = (optTrimmed === correctOption) ||
                                    (optTrimmed.toLowerCase() === correctOption.toLowerCase()) ||
                                    (correctOption.length === 1 && ['a','b','c','d'].includes(correctOption.toLowerCase()) && idx === ['a','b','c','d'].indexOf(correctOption.toLowerCase()));

                  let btnStyle = "bg-white border-slate-200 hover:border-amber-400 text-slate-800";
                  if (showExplanation) {
                    if (isCorrect) btnStyle = "bg-emerald-50 border-emerald-500 text-emerald-950 font-bold";
                    else if (isSelected) btnStyle = "bg-rose-50 border-rose-500 text-rose-950 font-bold";
                  } else if (isSelected) {
                    btnStyle = "bg-amber-500 text-slate-950 font-bold border-amber-600";
                  }

                  return (
                    <button
                      key={idx}
                      disabled={showExplanation}
                      onClick={() => handleAnswerSubmit(optTrimmed)}
                      className={`w-full p-4 rounded-2xl border-2 transition flex items-center justify-between font-bold text-sm ${btnStyle} ${questionFormat.className}`}
                    >
                      <span className="leading-relaxed">{optTrimmed}</span>
                      {showExplanation && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 ml-2" />}
                      {showExplanation && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-rose-600 shrink-0 ml-2" />}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Explanation Box */}
            {showExplanation && (
              <div
                dir={questionFormat.dir}
                className={`p-4 rounded-2xl border bg-amber-50 border-amber-200 text-amber-950 text-xs leading-relaxed space-y-1 ${questionFormat.className}`}
              >
                <span className="font-black block uppercase tracking-wider text-[10px] text-amber-700">
                  Explanation / ތަފްޞީލު:
                </span>
                <p>{currentQuestion.explanation || 'No detailed explanation provided.'}</p>
              </div>
            )}

            {/* Next Question Button */}
            {showExplanation && (
              <button
                onClick={nextQuestion}
                className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black py-3.5 rounded-2xl text-xs transition shadow-md flex items-center justify-center space-x-2"
              >
                <span>{isLastQuestion ? 'Complete Quiz' : 'Next Question'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}