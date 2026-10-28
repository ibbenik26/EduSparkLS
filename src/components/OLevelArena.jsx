import React, { useState } from 'react';
import { Clock, Image as ImageIcon, Play, Filter, BookOpen, Trash2, Search, Check, CheckCircle2 } from 'lucide-react';
import { ALL_SUBJECTS, isRTLSubject, canUserCRUDOLevel, lenientMatch } from '../utils/helpers';

export default function OLevelArena({
  role,
  quizzes,
  onDeleteQuiz,
  startQuiz,
  completedQuizModes = [],
  onOpenDiagramUpload,
  showToast,
  askConfirm
}) {
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const canEditOLevel = canUserCRUDOLevel(role);

  const olevelPapers = quizzes.filter(q => {
    if (!q.is_past_paper) return false;

    const matchesSubject = selectedSubject === 'All' || q.subject === selectedSubject;
    const matchesYear = selectedYear === 'All' || String(q.exam_year) === String(selectedYear);

    const questionTextBuffer = (q.questions || []).map(qItem => `${qItem.question_text} ${qItem.topic}`).join(' ');
    const searchableBuffer = `${q.title} ${q.subject} ${q.variant || ''} ${q.exam_year || ''} ${questionTextBuffer}`;

    const matchesSearch = lenientMatch(searchableBuffer, searchQuery);

    return matchesSubject && matchesYear && matchesSearch;
  });

  const handleDeletePaper = (paper) => {
    if (!canEditOLevel) return;
    askConfirm("Delete O-Level Past Paper", `Remove "${paper.title}" from the Cambridge Arena?`, () => {
      onDeleteQuiz(paper.id);
      showToast(`Deleted O-Level paper "${paper.title}".`, "info");
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
        <div className="space-y-2">
          <span className="bg-purple-500/20 border border-purple-400/30 text-purple-300 font-bold px-3 py-1 rounded-full text-xs uppercase tracking-wider">
            Cambridge Secondary Arena (Grade 8+)
          </span>
          <h2 className="text-2xl sm:text-3xl font-black">Cambridge O-Level Past Papers</h2>
          <p className="text-purple-200 text-xs max-w-lg">
            Practice Mode can be taken anytime. Timed Paper 1 & 2 simulations can only be completed ONCE per student!
          </p>
        </div>

        {canEditOLevel && (
          <button
            onClick={onOpenDiagramUpload}
            className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-5 py-3 rounded-2xl text-xs transition shadow-md shrink-0 flex items-center space-x-2"
          >
            <ImageIcon className="w-4 h-4" />
            <span>+ Upload O-Level Paper</span>
          </button>
        )}
      </div>

      {/* Filter Panel */}
      <div className="bg-white border border-slate-200 p-4 rounded-3xl shadow-xs space-y-3">
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-700">
          <Filter className="w-4 h-4 text-purple-600" />
          <span>Filter Cambridge Papers</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Subject</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-indigo-700 focus:outline-none"
            >
              <option value="All">All Subjects</option>
              {ALL_SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Exam Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:outline-none"
            >
              <option value="All">All Exam Years</option>
              {[2026, 2025, 2024, 2023, 2022, 2021, 2020].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
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
                placeholder="Search year or paper..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
        </div>
      </div>

      {olevelPapers.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-400 text-xs">
          No Cambridge past papers match "{searchQuery || 'selected criteria'}".
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {olevelPapers.map((paper) => {
            const isDhivehi = isRTLSubject(paper.subject);
            const isSimulationCompleted = completedQuizModes.includes(`${paper.id}_olevel`);

            return (
              <div key={paper.id} className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 hover:shadow-md transition relative group">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <span className={`text-xs font-bold text-purple-700 bg-purple-50 border border-purple-100 px-2.5 py-1 rounded-lg ${isDhivehi ? 'font-dhivehi' : ''}`}>
                    {paper.subject} • {paper.exam_year || 2026}
                  </span>

                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-bold text-slate-500 flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>{paper.time_limit || 120}s limit</span>
                    </span>

                    {canEditOLevel && (
                      <button
                        onClick={() => handleDeletePaper(paper)}
                        className="text-slate-300 hover:text-rose-600 p-1 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className={`font-black text-slate-900 text-lg leading-snug ${isDhivehi ? 'font-dhivehi' : ''}`}>
                    {paper.title}
                  </h3>

                  {isSimulationCompleted && (
                    <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md mt-1.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Simulation Completed ✅</span>
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  {/* Practice Button: Always Open */}
                  <button
                    onClick={() => startQuiz(paper, 'practice')}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2.5 rounded-xl text-xs transition flex items-center justify-center space-x-1"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-purple-600" />
                    <span>Practice</span>
                  </button>

                  {/* Timed Simulation Button: Locked Once Completed */}
                  <button
                    onClick={() => startQuiz(paper, 'olevel')}
                    disabled={isSimulationCompleted}
                    className={`font-bold py-2.5 rounded-xl text-xs transition flex items-center justify-center space-x-1 shadow-xs ${
                      isSimulationCompleted
                        ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 cursor-not-allowed font-black'
                        : 'bg-purple-600 hover:bg-purple-700 text-white'
                    }`}
                  >
                    {isSimulationCompleted ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Completed ✅</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5" />
                        <span>Timed Simulation</span>
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