import React, { useState } from 'react';
import { Sparkles, Clock, Image as ImageIcon, Play, Filter, Calendar, BookOpen } from 'lucide-react';
import { ALL_SUBJECTS } from '../utils/helpers';

export default function OLevelArena({
  quizzes,
  startQuiz,
  onOpenDiagramUpload
}) {
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedTopic, setSelectedTopic] = useState('All');

  const olevelPapers = quizzes.filter(q => {
    if (!q.is_past_paper) return false;

    const matchesSubject = selectedSubject === 'All' || q.subject === selectedSubject;
    const matchesYear = selectedYear === 'All' || String(q.exam_year) === String(selectedYear);
    const matchesTopic = selectedTopic === 'All' || (q.variant || '').toLowerCase().includes(selectedTopic.toLowerCase());

    return matchesSubject && matchesYear && matchesTopic;
  });

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
        <div className="space-y-2">
          <span className="bg-purple-500/20 border border-purple-400/30 text-purple-300 font-bold px-3 py-1 rounded-full text-xs uppercase tracking-wider">
            Cambridge Secondary Arena (Grade 8+)
          </span>
          <h2 className="text-2xl sm:text-3xl font-black">Cambridge O-Level Past Papers</h2>
          <p className="text-purple-200 text-xs max-w-lg">
            Timed Paper 1 & Paper 2 exam simulations featuring optical ray diagrams and force vector physics questions.
          </p>
        </div>

        <button
          onClick={onOpenDiagramUpload}
          className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-5 py-3 rounded-2xl text-xs transition shadow-md shrink-0 flex items-center space-x-2"
        >
          <ImageIcon className="w-4 h-4" />
          <span>+ Upload Diagram Paper</span>
        </button>
      </div>

      {/* Multi-Parameter Filter Panel */}
      <div className="bg-white border border-slate-200 p-4 rounded-3xl shadow-xs space-y-3">
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-700">
          <Filter className="w-4 h-4 text-purple-600" />
          <span>Filter Cambridge Papers by Subject, Year, or Topic</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Subject Filter */}
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

          {/* Exam Year Filter */}
          <div>
            <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Exam Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-900"
            >
              <option value="All">All Exam Years</option>
              {[2026, 2025, 2024, 2023, 2022, 2021, 2020].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {/* Paper / Topic Filter */}
          <div>
            <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Paper / Topic Search</label>
            <input
              type="text"
              value={selectedTopic === 'All' ? '' : selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value || 'All')}
              placeholder="e.g. Paper 12, Optics, Mechanics"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium text-slate-900"
            />
          </div>
        </div>
      </div>

      {olevelPapers.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-400 text-xs">
          No Cambridge past papers match your selected filter criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {olevelPapers.map((paper) => (
            <div key={paper.id} className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 hover:shadow-md transition">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <span className="text-xs font-bold text-purple-700 bg-purple-50 border border-purple-100 px-2.5 py-1 rounded-lg">
                  {paper.subject} • {paper.exam_year || 2026}
                </span>
                <span className="text-xs font-mono font-bold text-slate-500 flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>{paper.time_limit || 120}s limit</span>
                </span>
              </div>

              <h3 className="font-black text-slate-900 text-lg leading-snug">{paper.title}</h3>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => startQuiz(paper, 'practice')}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2.5 rounded-xl text-xs transition flex items-center justify-center space-x-1"
                >
                  <BookOpen className="w-3.5 h-3.5 text-purple-600" />
                  <span>Practice</span>
                </button>

                <button
                  onClick={() => startQuiz(paper, 'olevel')}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 rounded-xl text-xs transition flex items-center justify-center space-x-1 shadow-xs"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Timed Simulation</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}