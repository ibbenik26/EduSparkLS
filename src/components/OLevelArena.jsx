import React from 'react';
import { Sparkles, Clock, Image as ImageIcon, Award, Play } from 'lucide-react';

export default function OLevelArena({
  quizzes,
  olevelSubjectFilter,
  setOlevelSubjectFilter,
  startQuiz,
  onOpenDiagramUpload
}) {
  const olevelPapers = quizzes.filter(q => {
    if (!q.is_past_paper) return false;
    if (olevelSubjectFilter === 'Diagrams') {
      return q.has_diagrams || q.questions?.some(item => !!item.diagram_url);
    }
    return olevelSubjectFilter === 'All' || q.subject === olevelSubjectFilter;
  });

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
        <div className="space-y-2">
          <span className="bg-purple-500/20 border border-purple-400/30 text-purple-300 font-bold px-3 py-1 rounded-full text-xs uppercase tracking-wider">
            Cambridge Secondary Arena
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
          <span>Upload Diagram Paper</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none whitespace-nowrap">
        <button
          onClick={() => setOlevelSubjectFilter('All')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
            olevelSubjectFilter === 'All' ? 'bg-purple-600 text-white' : 'bg-white border text-slate-700'
          }`}
        >
          All O-Level Papers
        </button>
        <button
          onClick={() => setOlevelSubjectFilter('Diagrams')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
            olevelSubjectFilter === 'Diagrams' ? 'bg-amber-500 text-white' : 'bg-amber-50 border border-amber-200 text-amber-800'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Diagram Special Papers</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {olevelPapers.map((paper) => (
          <div key={paper.id} className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 hover:shadow-md transition">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-purple-700 bg-purple-50 border border-purple-100 px-2.5 py-1 rounded-lg">
                Code {paper.subject_code || '0625'} • {paper.variant || 'Paper 12'}
              </span>
              <span className="text-xs font-mono font-bold text-slate-500 flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>{paper.time_limit || 120}s limit</span>
              </span>
            </div>

            <h3 className="font-black text-slate-900 text-lg leading-snug">{paper.title}</h3>

            <button
              onClick={() => startQuiz(paper, 'olevel')}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black py-3 rounded-2xl text-xs shadow-md transition flex items-center justify-center space-x-2"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Begin Timed Cambridge Simulation</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}