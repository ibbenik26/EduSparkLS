import React, { useState } from 'react';
import { Plus, Upload, Code, Image as ImageIcon, Shield, Play, Trash2 } from 'lucide-react';
import TeacherStudentTracker from './TeacherStudentTracker';
import DiagramUploadModal from './DiagramUploadModal';
import { ALL_SUBJECTS, canUserCRUD } from '../utils/helpers';

export default function TeacherStudio({
  role, quizzes, setQuizzes, startQuiz,
  studioSubject, setStudioSubject,
  studioVariant, setStudioVariant,
  showDiagramUploadModal, setShowDiagramUploadModal
}) {
  const [studioTab, setStudioTab] = useState('diagnostics');
  const [jsonInput, setJsonInput] = useState(`[
  {
    "topic": "Optics & Light Rays",
    "diagram_url": "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80",
    "question_text": "Study the optics diagram. What phenomenon takes place when light enters the prism?",
    "option_a": "Refraction & Dispersion",
    "option_b": "Total Internal Reflection",
    "option_c": "Diffraction",
    "option_d": "Polarization",
    "correct_option": "A",
    "explanation": "White light separates into spectral colors through refraction."
  }
]`);

  const userCanCRUD = canUserCRUD(role);

  const handleImportJson = () => {
    if (!userCanCRUD) {
      alert("❌ Permission Denied: Only teachers and admins can CRUD quizzes.");
      return;
    }

    try {
      const parsed = JSON.parse(jsonInput);
      if (!Array.isArray(parsed)) throw new Error("JSON must be an array of question objects.");

      const newQuiz = {
        id: `quiz_json_${Date.now()}`,
        title: `${studioSubject} Custom Batch Paper (${studioVariant})`,
        subject: studioSubject,
        grade: 10,
        subject_code: '0625',
        exam_year: 2026,
        variant: studioVariant,
        is_past_paper: true,
        has_diagrams: parsed.some(q => !!q.diagram_url),
        questions: parsed
      };

      setQuizzes([newQuiz, ...quizzes]);
      alert(`🎉 Batch JSON Uploaded! Created quiz with ${parsed.length} questions.`);
    } catch (e) {
      alert("❌ Invalid JSON format: " + e.message);
    }
  };

  const handleDeleteQuiz = (quizId) => {
    if (!userCanCRUD) return alert("❌ Permission Denied!");
    if (window.confirm("Are you sure you want to delete this quiz paper?")) {
      setQuizzes(quizzes.filter(q => q.id !== quizId));
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
        <div className="space-y-2">
          <span className="bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 font-bold px-3 py-1 rounded-full text-xs uppercase tracking-wider">
            Teacher Command Studio
          </span>
          <h2 className="text-2xl sm:text-3xl font-black">Teacher & Admin Management Studio</h2>
          <p className="text-indigo-200 text-xs max-w-lg">
            Inspect weak student topics, award certificates, play test quizzes, and CRUD Diagram/JSON papers.
          </p>
        </div>

        {userCanCRUD && (
          <button
            onClick={() => setShowDiagramUploadModal(true)}
            className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-4 py-2.5 rounded-2xl text-xs shadow-md transition flex items-center space-x-1.5 shrink-0"
          >
            <ImageIcon className="w-4 h-4" />
            <span>+ Diagram MCQ</span>
          </button>
        )}
      </div>

      <div className="flex space-x-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setStudioTab('diagnostics')}
          className={`px-4 py-2 font-bold rounded-xl text-xs transition ${
            studioTab === 'diagnostics' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
          }`}
        >
          Class Diagnostics & Certificates
        </button>
        <button
          onClick={() => setStudioTab('play_tests')}
          className={`px-4 py-2 font-bold rounded-xl text-xs transition ${
            studioTab === 'play_tests' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
          }`}
        >
          Play & Test Quizzes
        </button>
        {userCanCRUD && (
          <button
            onClick={() => setStudioTab('json_upload')}
            className={`px-4 py-2 font-bold rounded-xl text-xs transition flex items-center space-x-1.5 ${
              studioTab === 'json_upload' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Copy-Paste JSON Import</span>
          </button>
        )}
      </div>

      {studioTab === 'diagnostics' ? (
        <TeacherStudentTracker subjects={ALL_SUBJECTS} />
      ) : studioTab === 'play_tests' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quizzes.map(q => (
            <div key={q.id} className="bg-white border border-slate-200 rounded-3xl p-5 space-y-3 flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold text-indigo-600 uppercase bg-indigo-50 px-2 py-0.5 rounded">{q.subject}</span>
                <h4 className="font-bold text-slate-900 text-sm mt-1">{q.title}</h4>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => startQuiz(q, 'practice')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Play Test</span>
                </button>
                {userCanCRUD && (
                  <button onClick={() => handleDeleteQuiz(q.id)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs">
          <h3 className="font-black text-slate-900 text-lg">Copy-Paste JSON Quiz Importer</h3>
          <p className="text-xs text-slate-500">Paste structured question JSON with image URLs to create a new paper instantly.</p>

          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            rows={10}
            className="w-full bg-slate-900 text-emerald-400 font-mono text-xs p-4 rounded-2xl border"
          />

          <button
            onClick={handleImportJson}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-6 py-3 rounded-2xl text-xs shadow-md transition flex items-center space-x-2"
          >
            <Upload className="w-4 h-4" />
            <span>Publish JSON Paper</span>
          </button>
        </div>
      )}
    </div>
  );
}