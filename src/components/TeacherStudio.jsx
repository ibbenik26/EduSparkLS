import React, { useState } from 'react';
import { Plus, Trash2, HelpCircle, Award, Layers, Code, Check, FileText, Sparkles, BookOpen, ShieldCheck } from 'lucide-react';
import { ALL_SUBJECTS, canUserCRUDPracticeVault, getDhivehiFormat } from '../utils/helpers';
import { normalizeQuestions } from './QuizRunnerModal';

export default function TeacherStudio({
  role, teacherSubject, quizzes, onAddQuiz, onDeleteQuiz,
  badges, onAddBadge, onDeleteBadge, ranks, setRanks,
  sponsors, setSponsors, onOpenDiagramUpload, showToast, askConfirm
}) {
  const [studioSubTab, setStudioSubTab] = useState('quiz_builder'); // 'quiz_builder' | 'badge_manager'
  const [showCreateQuizModal, setShowCreateQuizModal] = useState(false);
  const [showCreateBadgeModal, setShowCreateBadgeModal] = useState(false);
  const [expandedQuizId, setExpandedQuizId] = useState(null);

  // New Badge State
  const [badgeName, setBadgeName] = useState('');
  const [badgeIcon, setBadgeIcon] = useState('🏆');
  const [badgeDesc, setBadgeDesc] = useState('');
  const [badgeReqXp, setBadgeReqXp] = useState(100);

  // Quiz Form & JSON state
  const [quizTitle, setQuizTitle] = useState('');
  const [quizSubject, setQuizSubject] = useState(teacherSubject || 'Physics');
  const [quizGrade, setQuizGrade] = useState(7);
  const [subjectCode, setSubjectCode] = useState('');
  const [examYear, setExamYear] = useState('');
  const [variant, setVariant] = useState('');
  const [isPastPaper, setIsPastPaper] = useState(false);
  const [creationMode, setCreationMode] = useState('manual');
  const [jsonInput, setJsonInput] = useState('');

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

  const canEditStudio = canUserCRUDPracticeVault(role);

  // Question manipulation handlers
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

  const handleCreateBadgeSubmit = (e) => {
    e.preventDefault();
    if (!badgeName.trim()) return showToast("Enter badge title", "warning");

    const newBadge = {
      id: `badge_${Date.now()}`,
      name: badgeName.trim(),
      icon: badgeIcon,
      desc: badgeDesc.trim(),
      reqXp: parseInt(badgeReqXp) || 100
    };

    onAddBadge(newBadge);
    setShowCreateBadgeModal(false);
    setBadgeName(''); setBadgeDesc(''); setBadgeIcon('🏆'); setBadgeReqXp(100);
  };

  const handleCreateQuizSubmit = (e) => {
    e.preventDefault();
    if (!quizTitle.trim()) return showToast("Enter quiz title", "warning");

    let finalQuestions = questions;
    if (creationMode === 'json') {
      try {
        const parsed = JSON.parse(jsonInput.trim());
        finalQuestions = normalizeQuestions(parsed);
      } catch (err) {
        return showToast(`❌ Fix JSON Syntax Error before submitting: ${err.message}`, "error");
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
    setQuizTitle(''); setSubjectCode(''); setExamYear(''); setVariant(''); setIsPastPaper(false); setJsonInput('');
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-slate-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-lg">
        <div className="space-y-2">
          <span className="bg-purple-400/20 border border-purple-300/30 text-purple-200 font-bold px-3 py-1 rounded-full text-xs uppercase tracking-wider">
            Teacher & Admin Control Center
          </span>
          <h2 className="text-2xl sm:text-3xl font-black">Admin Management Studio</h2>
          <p className="text-purple-100 text-xs max-w-lg">
            Manage quizzes, student achievement badges, rank requirements, and curriculum parameters.
          </p>
        </div>

        {canEditStudio && (
          <div className="flex flex-wrap gap-2 shrink-0">
            <button
              onClick={() => setShowCreateQuizModal(true)}
              className="bg-purple-400 hover:bg-purple-300 text-slate-950 font-black px-4 py-2.5 rounded-2xl text-xs transition shadow-md flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>+ Create Quiz</span>
            </button>

            <button
              onClick={() => setShowCreateBadgeModal(true)}
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-4 py-2.5 rounded-2xl text-xs transition shadow-md flex items-center space-x-1.5"
            >
              <Award className="w-4 h-4" />
              <span>+ Create Badge</span>
            </button>
          </div>
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

      {/* SUB-TAB 1: QUIZ VAULT */}
      {studioSubTab === 'quiz_builder' && (
        <div className="space-y-4">
          {quizzes.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-400 text-xs font-medium">
              No quizzes created yet. Click "+ Create Quiz" to add your first quiz!
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
                            onClick={() => askConfirm("Delete Quiz", `Delete "${quiz.title}" permanently?`, () => onDeleteQuiz(quiz.id))}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-600 p-2 rounded-xl transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="pt-3 border-t border-slate-100 space-y-3">
                        {quizQuestions.map((q, qIdx) => (
                          <div key={q.id || qIdx} className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2">
                            <span className="text-[10px] font-bold text-slate-400">Q{qIdx + 1}. Topic: {q.topic || 'General'}</span>
                            <p className="text-sm font-black text-slate-900">{q.question}</p>
                            <div className="grid grid-cols-2 gap-2">
                              {(q.options || []).map((opt, optIdx) => (
                                <div key={optIdx} className={`p-2 rounded-xl text-xs font-bold border ${opt === q.correct_option ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-white text-slate-700'}`}>
                                  {opt} {opt === q.correct_option && '✓'}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: BADGES & RANKS MANAGER */}
      {studioSubTab === 'badge_manager' && (
        <div className="space-y-6">
          {/* Badges Vault Grid */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-black text-slate-900 text-base flex items-center space-x-2">
                <Award className="w-5 h-5 text-amber-500" />
                <span>Student Achievement Badges ({badges.length})</span>
              </h3>

              {canEditStudio && (
                <button
                  onClick={() => setShowCreateBadgeModal(true)}
                  className="bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold px-3 py-1.5 rounded-xl text-xs transition border border-amber-200"
                >
                  + Add Custom Badge
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {badges.map((b) => (
                <div key={b.id} className="bg-white border border-slate-200 p-4 rounded-2xl space-y-2 shadow-xs relative">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl">{b.icon}</span>
                    <span className="text-[10px] font-black uppercase tracking-wider bg-purple-50 text-purple-700 px-2 py-0.5 rounded">
                      Req XP: {b.reqXp}
                    </span>
                  </div>

                  <h4 className="font-black text-slate-900 text-sm">{b.name}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{b.desc}</p>

                  {canEditStudio && (
                    <button
                      onClick={() => askConfirm("Delete Badge", `Remove badge "${b.name}"?`, () => onDeleteBadge(b.id))}
                      className="text-rose-600 hover:text-rose-700 p-1 text-xs font-bold pt-2 block"
                    >
                      Delete Badge 🗑️
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Rank Tier System */}
          <div className="space-y-3 border-t border-slate-200 pt-5">
            <h3 className="font-black text-slate-900 text-base">Student Rank Threshold Tiers</h3>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {ranks.map((r) => (
                <div key={r.id} className={`${r.bg} border border-slate-200 p-4 rounded-2xl space-y-1 text-center`}>
                  <span className="text-2xl block">{r.icon}</span>
                  <span className={`font-black text-sm block ${r.text}`}>{r.title}</span>
                  <span className="text-[11px] font-bold text-slate-500 block">{r.minXp}+ XP</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CREATE BADGE MODAL */}
      {showCreateBadgeModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 text-slate-900 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-black flex items-center space-x-2">
              <Award className="w-5 h-5 text-amber-500" />
              <span>Create Achievement Badge</span>
            </h3>

            <form onSubmit={handleCreateBadgeSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Badge Name</label>
                <input
                  type="text"
                  value={badgeName}
                  onChange={(e) => setBadgeName(e.target.value)}
                  placeholder="e.g. Optics Master"
                  className="w-full border rounded-xl p-2.5 font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold block mb-1">Badge Icon (Emoji)</label>
                  <input
                    type="text"
                    value={badgeIcon}
                    onChange={(e) => setBadgeIcon(e.target.value)}
                    placeholder="🏆"
                    className="w-full border rounded-xl p-2.5 font-bold text-center text-lg"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1">Required XP</label>
                  <input
                    type="number"
                    value={badgeReqXp}
                    onChange={(e) => setBadgeReqXp(e.target.value)}
                    className="w-full border rounded-xl p-2.5 font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1">Description</label>
                <textarea
                  value={badgeDesc}
                  onChange={(e) => setBadgeDesc(e.target.value)}
                  rows={2}
                  placeholder="How students unlock this badge..."
                  className="w-full border rounded-xl p-2.5"
                  required
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button type="button" onClick={() => setShowCreateBadgeModal(false)} className="w-full bg-slate-100 font-bold py-2.5 rounded-xl">
                  Cancel
                </button>
                <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black py-2.5 rounded-xl">
                  Save Badge 🚀
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE QUIZ MODAL */}
      {showCreateQuizModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 text-slate-900 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-900 flex items-center space-x-2">
                <Plus className="w-5 h-5 text-purple-600" />
                <span>Create New Quiz & Questions</span>
              </h3>
              <button onClick={() => setShowCreateQuizModal(false)} className="text-slate-400 hover:text-slate-700 font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateQuizSubmit} className="space-y-5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="font-bold block mb-1">Quiz Title</label>
                  <input
                    type="text"
                    value={quizTitle}
                    onChange={(e) => setQuizTitle(e.target.value)}
                    placeholder="e.g. Physics Optics Quiz"
                    className="w-full border rounded-xl p-2.5 font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1">Subject</label>
                  <select value={quizSubject} onChange={(e) => setQuizSubject(e.target.value)} className="w-full border rounded-xl p-2.5 font-bold">
                    {ALL_SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <label className="font-bold block mb-1">Target Grade</label>
                  <select value={quizGrade} onChange={(e) => setQuizGrade(e.target.value)} className="w-full border rounded-xl p-2.5 font-bold">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(g => <option key={g} value={g}>Grade {g}</option>)}
                  </select>
                </div>
              </div>

              {/* Questions Section */}
              <div className="space-y-4 border-t border-slate-200 pt-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-black text-slate-900 text-sm">Questions ({questions.length})</h4>
                  <button type="button" onClick={addQuestionField} className="bg-purple-50 text-purple-700 font-bold px-3 py-1.5 rounded-xl">+ Add Question</button>
                </div>

                {questions.map((q, qIndex) => (
                  <div key={q.id || qIndex} className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-black text-slate-700">Question #{qIndex + 1}</span>
                      {questions.length > 1 && (
                        <button type="button" onClick={() => removeQuestionField(qIndex)} className="text-rose-600 p-1"><Trash2 className="w-4 h-4" /></button>
                      )}
                    </div>

                    <textarea
                      value={q.question}
                      onChange={(e) => handleQuestionChange(qIndex, 'question', e.target.value)}
                      placeholder="Type question here..."
                      rows={2}
                      className="w-full border rounded-xl p-2.5 font-medium bg-white"
                      required
                    />

                    <div className="grid grid-cols-2 gap-2">
                      {q.options.map((opt, optIndex) => (
                        <div key={optIndex} className="flex items-center space-x-2 bg-white border p-2 rounded-xl">
                          <input
                            type="radio"
                            name={`correct_opt_${qIndex}`}
                            checked={q.correct_option_index === optIndex || (q.correct_option === opt && opt !== '')}
                            onChange={() => handleSelectCorrectOption(qIndex, optIndex)}
                            className="w-4 h-4 text-purple-600"
                          />
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => handleOptionChange(qIndex, optIndex, e.target.value)}
                            placeholder={`Option ${optIndex + 1}`}
                            className="w-full border-none p-1 text-xs font-medium focus:outline-none"
                            required
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex space-x-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowCreateQuizModal(false)} className="w-full bg-slate-100 font-bold py-2.5 rounded-xl">Cancel</button>
                <button type="submit" className="w-full bg-purple-600 text-white font-black py-2.5 rounded-xl">Save Quiz & Questions 🚀</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}