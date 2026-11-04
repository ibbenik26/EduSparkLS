import React, { useState } from 'react';
import { Plus, Trash2, HelpCircle, Award, Layers, Code, Check, FileText } from 'lucide-react';
import { ALL_SUBJECTS, canUserCRUDPracticeVault, getDhivehiFormat } from '../utils/helpers';
import { normalizeQuestions } from './QuizRunnerModal';

export default function TeacherStudio({
  role, teacherSubject, quizzes, onAddQuiz, onDeleteQuiz,
  badges, onAddBadge, onDeleteBadge, ranks, setRanks,
  sponsors, setSponsors, onOpenDiagramUpload, showToast, askConfirm
}) {
  const [studioSubTab, setStudioSubTab] = useState('quiz_builder');
  const [showCreateQuizModal, setShowCreateQuizModal] = useState(false);
  const [expandedQuizId, setExpandedQuizId] = useState(null);

  // New Quiz Metadata State
  const [quizTitle, setQuizTitle] = useState('');
  const [quizSubject, setQuizSubject] = useState(teacherSubject || 'Physics');
  const [quizGrade, setQuizGrade] = useState(7);
  const [subjectCode, setSubjectCode] = useState('');
  const [examYear, setExamYear] = useState('');
  const [variant, setVariant] = useState('');
  const [isPastPaper, setIsPastPaper] = useState(false);

  // Question Creation Mode Toggle ('form' | 'json')
  const [creationMode, setCreationMode] = useState('form');

  // Mode 1: Form Questions Builder State
  const [questions, setQuestions] = useState([
    {
      id: `q_${Date.now()}`,
      question: '',
      options: ['', '', '', ''],
      correct_option: '',
      correct_option_index: 0,
      explanation: '',
      topic: 'General Concepts',
      image_url: ''
    }
  ]);

  // Mode 2: Raw JSON String State
  const [jsonInput, setJsonInput] = useState('');

  const sampleJsonTemplate = `[
  {
    "question": "A lens refracts light to form a real image at 2f. What is the magnification ratio?",
    "options": ["1:1 (Same size)", "2:1 (Magnified)", "1:2 (Diminished)", "Virtual"],
    "correct_option": "1:1 (Same size)",
    "image_url": "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=600",
    "explanation": "At 2f distance, magnification is exactly 1.",
    "topic": "Lens Optics"
  }
]`;

  const canEditStudio = canUserCRUDPracticeVault(role);

  const handleQuestionChange = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const handleOptionChange = (qIndex, optIndex, value) => {
    const updated = [...questions];
    const previousValue = updated[qIndex].options[optIndex];
    updated[qIndex].options[optIndex] = value;
    
    if (updated[qIndex].correct_option_index === optIndex || updated[qIndex].correct_option === previousValue || !updated[qIndex].correct_option) {
      updated[qIndex].correct_option = value;
      updated[qIndex].correct_option_index = optIndex;
    }
    setQuestions(updated);
  };

  const handleSelectCorrectOption = (qIndex, optIndex) => {
    const updated = [...questions];
    updated[qIndex].correct_option_index = optIndex;
    updated[qIndex].correct_option = updated[qIndex].options[optIndex] || '';
    setQuestions(updated);
  };

  const addQuestionField = () => {
    setQuestions(prev => [
      ...prev,
      {
        id: `q_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        question: '',
        options: ['', '', '', ''],
        correct_option: '',
        correct_option_index: 0,
        explanation: '',
        topic: 'General Concepts',
        image_url: ''
      }
    ]);
  };

  const removeQuestionField = (index) => {
    if (questions.length <= 1) {
      return showToast("A quiz must have at least 1 question!", "warning");
    }
    setQuestions(prev => prev.filter((_, idx) => idx !== index));
  };

  const parseAndInsertJson = () => {
    if (!jsonInput.trim()) return showToast("Paste JSON code first", "warning");

    try {
      const parsed = JSON.parse(jsonInput.trim());
      const normalized = normalizeQuestions({ questions: parsed });

      if (normalized.length === 0) {
        return showToast("❌ Invalid JSON schema. Ensure it is an array of question objects!", "error");
      }

      setQuestions(normalized);
      setCreationMode('form');
      showToast(`✅ Successfully parsed ${normalized.length} questions from JSON!`, "success");
    } catch (err) {
      showToast(`❌ JSON Syntax Error: ${err.message}`, "error");
    }
  };

  const handleCreateQuizSubmit = (e) => {
    e.preventDefault();
    if (!quizTitle.trim()) return showToast("Enter quiz title", "warning");

    let finalQuestions = questions;

    // Handle JSON mode submission directly
    if (creationMode === 'json') {
      try {
        const parsed = JSON.parse(jsonInput.trim());
        finalQuestions = normalizeQuestions({ questions: parsed });
      } catch (err) {
        return showToast(`❌ Fix JSON Syntax Error before submitting: ${err.message}`, "error");
      }
    }

    for (let i = 0; i < finalQuestions.length; i++) {
      const q = finalQuestions[i];
      if (!q.question.trim()) {
        return showToast(`Question #${i + 1} text is empty!`, "warning");
      }
      const validOptions = (q.options || []).filter(opt => String(opt).trim() !== '');
      if (validOptions.length < 2) {
        return showToast(`Question #${i + 1} must have at least 2 options!`, "warning");
      }
      if (!q.correct_option.trim()) {
        return showToast(`Select a correct answer for Question #${i + 1}!`, "warning");
      }
    }

    const newQuiz = {
      id: `quiz_${Date.now()}`,
      title: quizTitle.trim(),
      subject: quizSubject,
      grade: parseInt(quizGrade),
      subject_code: subjectCode,
      exam_year: examYear ? parseInt(examYear) : null,
      variant,
      is_past_paper: isPastPaper,
      has_diagrams: finalQuestions.some(q => !!q.image_url),
      questions: finalQuestions
    };

    onAddQuiz(newQuiz);
    setShowCreateQuizModal(false);
    
    setQuizTitle('');
    setSubjectCode('');
    setExamYear('');
    setVariant('');
    setIsPastPaper(false);
    setJsonInput('');
    setQuestions([
      {
        id: `q_${Date.now()}`,
        question: '',
        options: ['', '', '', ''],
        correct_option: '',
        correct_option_index: 0,
        explanation: '',
        topic: 'General Concepts',
        image_url: ''
      }
    ]);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-slate-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-lg">
        <div className="space-y-2">
          <span className="bg-purple-400/20 border border-purple-300/30 text-purple-200 font-bold px-3 py-1 rounded-full text-xs uppercase tracking-wider">
            Teacher & Admin Curriculum Control
          </span>
          <h2 className="text-2xl sm:text-3xl font-black">Question & Quiz Studio</h2>
          <p className="text-purple-100 text-xs max-w-lg">
            Create quizzes, insert multiple-choice questions with Dhivehi RTL support, upload diagrams, and manage badges.
          </p>
        </div>

        {canEditStudio && (
          <button
            onClick={() => setShowCreateQuizModal(true)}
            className="bg-purple-400 hover:bg-purple-300 text-slate-950 font-black px-4 py-2.5 rounded-2xl text-xs transition shadow-md flex items-center space-x-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create Quiz & Questions</span>
          </button>
        )}
      </div>

      {/* Sub-Tabs */}
      <div className="flex border-b border-slate-200 space-x-6 text-sm font-bold text-slate-500">
        <button
          onClick={() => setStudioSubTab('quiz_builder')}
          className={`pb-3 transition flex items-center space-x-2 border-b-2 ${
            studioSubTab === 'quiz_builder' ? 'border-purple-600 text-purple-700 font-black' : 'border-transparent hover:text-slate-800'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Quiz & Questions Vault ({quizzes.length})</span>
        </button>

        <button
          onClick={() => setStudioSubTab('badge_manager')}
          className={`pb-3 transition flex items-center space-x-2 border-b-2 ${
            studioSubTab === 'badge_manager' ? 'border-purple-600 text-purple-700 font-black' : 'border-transparent hover:text-slate-800'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Badges & Ranks ({badges.length})</span>
        </button>
      </div>

      {/* Quiz & Questions Vault Sub-Tab */}
      {studioSubTab === 'quiz_builder' && (
        <div className="space-y-4">
          {quizzes.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-400 text-xs font-medium">
              No quizzes created yet. Click "+ Create Quiz & Questions" to add your first quiz!
            </div>
          ) : (
            <div className="space-y-4">
              {quizzes.map((quiz) => {
                const quizQuestions = normalizeQuestions(quiz);
                const isExpanded = expandedQuizId === quiz.id;
                const dhivehiFmt = getDhivehiFormat(quiz.subject, quiz.title);

                return (
                  <div key={quiz.id} className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4 shadow-xs">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div dir={dhivehiFmt.dir}>
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-black uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-0.5 rounded-md">
                            {quiz.subject} • Grade {quiz.grade}
                          </span>
                          {quiz.is_past_paper && (
                            <span className="text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-md">
                              Past Paper {quiz.exam_year}
                            </span>
                          )}
                        </div>
                        <h3 className={`text-base font-black text-slate-900 mt-1 ${dhivehiFmt.className}`}>
                          {quiz.title}
                        </h3>
                        <span className="text-xs text-slate-400 font-bold">
                          Contains {quizQuestions.length} Questions
                        </span>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        <button
                          onClick={() => setExpandedQuizId(isExpanded ? null : quiz.id)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-2 rounded-xl transition flex items-center space-x-1"
                        >
                          <Layers className="w-3.5 h-3.5" />
                          <span>{isExpanded ? 'Hide Questions' : 'View Questions'}</span>
                        </button>

                        {canEditStudio && (
                          <button
                            onClick={() => askConfirm("Delete Quiz", `Delete "${quiz.title}" and all its questions permanently?`, () => onDeleteQuiz(quiz.id))}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-600 p-2 rounded-xl transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Questions Accordion Details */}
                    {isExpanded && (
                      <div className="pt-3 border-t border-slate-100 space-y-3">
                        <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">
                          Questions List ({quizQuestions.length})
                        </h4>

                        <div className="space-y-3">
                          {quizQuestions.map((q, qIdx) => {
                            const qFmt = getDhivehiFormat(quiz.subject, q.question);
                            const opts = q.options || [];
                            const diag = q.image_url || '';

                            return (
                              <div key={q.id || qIdx} className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2" dir={qFmt.dir}>
                                <div className="flex justify-between items-start">
                                  <span className="text-[10px] font-bold text-slate-400">
                                    Q{qIdx + 1}. Topic: {q.topic || 'General'}
                                  </span>
                                </div>

                                <p className={`text-sm font-black text-slate-900 ${qFmt.className}`}>
                                  {q.question}
                                </p>

                                {diag && (
                                  <div className="my-2 text-center bg-white p-2 rounded-xl border border-slate-200">
                                    <img src={diag} alt="Diagram Preview" className="max-h-40 mx-auto object-contain rounded-lg" />
                                  </div>
                                )}

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                                  {opts.map((opt, optIdx) => {
                                    const isCorrect = opt === q.correct_option;
                                    return (
                                      <div
                                        key={optIdx}
                                        className={`p-2.5 rounded-xl text-xs font-bold border ${
                                          isCorrect 
                                            ? 'bg-emerald-50 border-emerald-300 text-emerald-900' 
                                            : 'bg-white border-slate-200 text-slate-700'
                                        } ${qFmt.className}`}
                                      >
                                        <span>{opt}</span>
                                        {isCorrect && <span className="ml-2 text-emerald-600">✓ Correct</span>}
                                      </div>
                                    );
                                  })}
                                </div>

                                {q.explanation && (
                                  <p className={`text-[11px] text-slate-500 pt-1 italic ${qFmt.className}`}>
                                    Explanation: {q.explanation}
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* CREATE QUIZ & QUESTIONS MODAL */}
      {showCreateQuizModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 text-slate-900 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-900 flex items-center space-x-2">
                <Plus className="w-5 h-5 text-purple-600" />
                <span>Create New Quiz & Questions</span>
              </h3>
              <button onClick={() => setShowCreateQuizModal(false)} className="text-slate-400 hover:text-slate-700 font-bold">
                ✕
              </button>
            </div>

            {/* Mode Switcher Buttons */}
            <div className="flex bg-slate-100 p-1 rounded-2xl text-xs font-bold space-x-1">
              <button
                type="button"
                onClick={() => setCreationMode('form')}
                className={`flex-1 py-2 rounded-xl transition flex items-center justify-center space-x-1.5 ${
                  creationMode === 'form' ? 'bg-white text-purple-700 shadow-xs font-black' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>📝 Visual Form Builder</span>
              </button>

              <button
                type="button"
                onClick={() => setCreationMode('json')}
                className={`flex-1 py-2 rounded-xl transition flex items-center justify-center space-x-1.5 ${
                  creationMode === 'json' ? 'bg-white text-purple-700 shadow-xs font-black' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Code className="w-4 h-4" />
                <span>💻 Bulk JSON Code Import</span>
              </button>
            </div>

            <form onSubmit={handleCreateQuizSubmit} className="space-y-5 text-xs">
              {/* Quiz Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="font-bold block mb-1">Quiz Title (Dhivehi or English)</label>
                  <input
                    type="text"
                    value={quizTitle}
                    onChange={(e) => setQuizTitle(e.target.value)}
                    placeholder="e.g. Physics Optics Quiz / ދިވެހި ބަހުގެ ގަވާއިދު"
                    className="w-full border rounded-xl p-2.5 font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1">Subject</label>
                  <select
                    value={quizSubject}
                    onChange={(e) => setQuizSubject(e.target.value)}
                    className="w-full border rounded-xl p-2.5 font-bold"
                  >
                    {ALL_SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <label className="font-bold block mb-1">Target Grade</label>
                  <select
                    value={quizGrade}
                    onChange={(e) => setQuizGrade(e.target.value)}
                    className="w-full border rounded-xl p-2.5 font-bold"
                  >
                    {[7, 8, 9, 10].map(g => <option key={g} value={g}>Grade {g}</option>)}
                  </select>
                </div>
              </div>

              {/* MODE 1: FORM-BASED BUILDER */}
              {creationMode === 'form' && (
                <div className="space-y-4 border-t border-slate-200 pt-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-black text-slate-900 text-sm flex items-center space-x-1.5">
                      <HelpCircle className="w-4 h-4 text-purple-600" />
                      <span>Questions ({questions.length})</span>
                    </h4>

                    <button
                      type="button"
                      onClick={addQuestionField}
                      className="bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold px-3 py-1.5 rounded-xl text-xs transition"
                    >
                      + Add Another Question
                    </button>
                  </div>

                  {questions.map((q, qIndex) => {
                    const qFormat = getDhivehiFormat(quizSubject, q.question);

                    return (
                      <div key={q.id || qIndex} className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-3 relative">
                        <div className="flex justify-between items-center">
                          <span className="font-black text-slate-700 text-xs">
                            Question #{qIndex + 1}
                          </span>
                          {questions.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeQuestionField(qIndex)}
                              className="text-rose-600 hover:text-rose-700 p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        <div>
                          <label className="font-bold block mb-1">Question Text</label>
                          <textarea
                            value={q.question}
                            onChange={(e) => handleQuestionChange(qIndex, 'question', e.target.value)}
                            placeholder="Type question here..."
                            rows={2}
                            dir={qFormat.dir}
                            className={`w-full border rounded-xl p-2.5 bg-white font-medium ${qFormat.className}`}
                            required
                          />
                        </div>

                        <div>
                          <label className="font-bold block mb-1">Diagram Image URL (Optional)</label>
                          <input
                            type="url"
                            value={q.image_url}
                            onChange={(e) => handleQuestionChange(qIndex, 'image_url', e.target.value)}
                            placeholder="https://images.unsplash.com/photo-..."
                            className="w-full border rounded-xl p-2 bg-white"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="font-bold block">Answer Options & Correct Answer Radio Selection</label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2" dir={qFormat.dir}>
                            {q.options.map((opt, optIndex) => (
                              <div key={optIndex} className="flex items-center space-x-2 bg-white border border-slate-200 p-2 rounded-xl">
                                <input
                                  type="radio"
                                  name={`correct_opt_${qIndex}`}
                                  checked={q.correct_option_index === optIndex || (q.correct_option === opt && opt !== '')}
                                  onChange={() => handleSelectCorrectOption(qIndex, optIndex)}
                                  className="w-4 h-4 text-purple-600 focus:ring-purple-500 shrink-0"
                                />
                                <input
                                  type="text"
                                  value={opt}
                                  onChange={(e) => handleOptionChange(qIndex, optIndex, e.target.value)}
                                  placeholder={`Option ${optIndex + 1}`}
                                  className={`w-full border-none p-1 text-xs font-medium focus:outline-none ${qFormat.className}`}
                                  required
                                />
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="font-bold block mb-1">Explanation (Optional)</label>
                          <input
                            type="text"
                            value={q.explanation}
                            onChange={(e) => handleQuestionChange(qIndex, 'explanation', e.target.value)}
                            placeholder="Why this option is correct..."
                            dir={qFormat.dir}
                            className={`w-full border rounded-xl p-2 bg-white ${qFormat.className}`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* MODE 2: RAW JSON CODE IMPORT */}
              {creationMode === 'json' && (
                <div className="space-y-3 border-t border-slate-200 pt-4">
                  <div className="flex justify-between items-center">
                    <label className="font-black text-slate-900 block">Paste Raw JSON Questions Array</label>
                    <button
                      type="button"
                      onClick={() => setJsonInput(sampleJsonTemplate)}
                      className="text-purple-600 hover:text-purple-700 font-bold text-[11px]"
                    >
                      Load Sample Template
                    </button>
                  </div>

                  <textarea
                    value={jsonInput}
                    onChange={(e) => setJsonInput(e.target.value)}
                    rows={8}
                    placeholder="Paste JSON array here..."
                    className="w-full font-mono text-xs border rounded-2xl p-3 bg-slate-900 text-emerald-400 focus:outline-none focus:border-purple-500 leading-relaxed"
                  />

                  <button
                    type="button"
                    onClick={parseAndInsertJson}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-black px-4 py-2.5 rounded-xl text-xs transition shadow-sm flex items-center space-x-1.5"
                  >
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Parse & Convert to Form Questions</span>
                  </button>
                </div>
              )}

              {/* Submit Action Bar */}
              <div className="flex space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateQuizModal(false)}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-black py-2.5 rounded-xl transition shadow-md"
                >
                  Save Quiz & Questions to Supabase 🚀
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}