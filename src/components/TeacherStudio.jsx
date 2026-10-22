import React, { useState } from 'react';
import { Upload, Code, Image as ImageIcon, Shield, Trash2, Plus } from 'lucide-react';
import TeacherStudentTracker from './TeacherStudentTracker';
import DiagramUploadModal from './DiagramUploadModal';
import { ALL_SUBJECTS, canUserCRUDQuizzes } from '../utils/helpers';

export default function TeacherStudio({
  role, quizzes, setQuizzes,
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

  const userCanCRUD = canUserCRUDQuizzes(role);

  const handleImportJson = () => {
    if (!userCanCRUD) return alert("❌ Permission Denied!");

    try {
      const parsed = JSON.parse(jsonInput);
      if (!Array.isArray(parsed)) throw new Error("JSON must be an array of questions.");

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
      alert(`🎉 Batch JSON Uploaded! Created paper with ${parsed.length} questions.`);
    } catch (e) {
      alert("❌ Invalid JSON format: " + e.message);
    }
  };

  const handleDeleteQuiz = (id) => {
    if (!userCanCRUD) return;
    if (window.confirm("Remove this exam paper from the system?")) {
      setQuizzes(quizzes.filter(q => q.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
        <div className="space-y-2">
          <span className="bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 font-bold px-3 py-1 rounded-full text-xs uppercase tracking-wider">
            Teacher Command Studio
          </span>
          <h2 className="text-2xl sm:text-3xl font-black">Class Diagnostics & Curriculum Studio</h2>
          <p className="text-indigo-200 text-xs max-w-lg">
            Inspect student weak topics, issue printable achievement certificates, or publish Diagram & JSON papers.
          </p>
        </div>

        {userCanCRUD && (
          <button
            onClick={() => setShowDiagramUploadModal(true)}
            className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-5 py-3 rounded-2xl text-xs shadow-md transition shrink-0 flex items-center space-x-1.5"
          >
            <ImageIcon className="w-4 h-4" />
            <span>+ Create Diagram Quiz</span>
          </button>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setStudioTab('diagnostics')}
          className={`px-4 py-2 font-bold rounded-xl text-xs transition ${
            studioTab === 'diagnostics' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
          }`}
        >
          Class Topic Diagnostics & Certificates
        </button>
        <button
          onClick={() => setStudioTab('manage_quizzes')}
          className={`px-4 py-2 font-bold rounded-xl text-xs transition ${
            studioTab === 'manage_quizzes' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
          }`}
        >
          Manage Published Papers ({quizzes.length})
        </button>
        {userCanCRUD && (
          <button
            onClick={() => setStudioTab('json_upload')}
            className={`px-4 py-2 font-bold rounded-xl text-xs transition flex items-center space-x-1.5 ${
              studioTab === 'json_upload' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Fast JSON Importer</span>
          </button>
        )}
      </div>

      {studioTab === 'diagnostics' ? (
        <TeacherStudentTracker subjects={ALL_SUBJECTS} />
      ) : studioTab === 'manage_quizzes' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quizzes.map(q => (
            <div key={q.id} className="bg-white border border-slate-200 rounded-3xl p-5 flex justify-between items-center shadow-xs">
              <div>
                <span className="text-[10px] font-bold text-indigo-600 uppercase bg-indigo-50 px-2 py-0.5 rounded">{q.subject}</span>
                <h4 className="font-bold text-slate-900 text-sm mt-1">{q.title}</h4>
                <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{q.questions.length} Questions</span>
              </div>
              {userCanCRUD && (
                <button onClick={() => handleDeleteQuiz(q.id)} className="p-2.5 text-rose-600 hover:bg-rose-50 rounded-xl transition">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs">
          <h3 className="font-black text-slate-900 text-lg">Fast JSON Question Importer</h3>
          <p className="text-xs text-slate-500">Paste structured question JSON with image URLs to create an exam paper instantly.</p>

          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            rows={10}
            className="w-full bg-slate-900 text-emerald-400 font-mono text-xs p-4 rounded-2xl border border-slate-800"
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