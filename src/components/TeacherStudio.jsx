import React, { useState } from 'react';
import { Upload, Code, Image as ImageIcon, Trash2, Award, BarChart3, Lock } from 'lucide-react';
import { ALL_SUBJECTS, canUserCRUDQuizzes } from '../utils/helpers';

export default function TeacherStudio({
  role, teacherSubject = 'Physics', quizzes, setQuizzes,
  showDiagramUploadModal, setShowDiagramUploadModal, showToast, askConfirm
}) {
  const [studioTab, setStudioTab] = useState('diagnostics');
  const [jsonInput, setJsonInput] = useState(`[
  {
    "topic": "Registered Subject Focus",
    "question_text": "Sample question for teacher's registered subject class.",
    "option_a": "Option A", "option_b": "Option B", "option_c": "Option C", "option_d": "Option D",
    "correct_option": "A", "explanation": "Mark scheme verified."
  }
]`);

  const userCanCRUD = canUserCRUDQuizzes(role);

  // STRICT TEACHER RESTRICTION: Teachers can ONLY see & CRUD papers matching their assigned teacherSubject
  const myClassQuizzes = role === 'super_admin'
    ? quizzes
    : quizzes.filter(q => (q.subject || '').toLowerCase() === (teacherSubject || '').toLowerCase());

  const handleImportJson = () => {
    if (!userCanCRUD) return showToast("❌ Permission Denied!", "error");

    try {
      const parsed = JSON.parse(jsonInput);
      if (!Array.isArray(parsed)) throw new Error("JSON must be an array of questions.");

      const newQuiz = {
        id: `quiz_json_${Date.now()}`,
        title: `${teacherSubject} Custom Batch Paper`,
        subject: teacherSubject,
        grade: 10,
        subject_code: '0625',
        exam_year: 2026,
        variant: 'Teacher Custom',
        is_past_paper: true,
        has_diagrams: parsed.some(q => !!q.diagram_url),
        questions: parsed
      };

      setQuizzes([newQuiz, ...quizzes]);
      showToast(`🎉 Batch JSON Uploaded! Created ${teacherSubject} paper with ${parsed.length} questions.`, "success");
    } catch (e) {
      showToast("❌ Invalid JSON format: " + e.message, "error");
    }
  };

  const handleDeleteQuiz = (quiz) => {
    if (!userCanCRUD) return;
    if (role !== 'super_admin' && (quiz.subject || '').toLowerCase() !== (teacherSubject || '').toLowerCase()) {
      showToast(`❌ You can only delete quizzes for your registered subject (${teacherSubject}).`, "error");
      return;
    }

    askConfirm("Delete Exam Paper", `Remove "${quiz.title}" from the curriculum system?`, () => {
      setQuizzes(quizzes.filter(q => q.id !== quiz.id));
      showToast(`Deleted paper "${quiz.title}".`, "info");
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
        <div className="space-y-2">
          <span className="bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 font-bold px-3 py-1 rounded-full text-xs uppercase tracking-wider">
            {role === 'super_admin' ? 'Super Admin Command Studio' : `Registered Teacher Studio (${teacherSubject} Class)`}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black">Class Diagnostics & Registered Subject CRUD</h2>
          <p className="text-indigo-200 text-xs max-w-lg">
            Inspect student weak topics, issue printable achievement certificates, or publish Diagram papers for your class.
          </p>
        </div>

        {userCanCRUD && (
          <button
            onClick={() => setShowDiagramUploadModal(true)}
            className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-5 py-3 rounded-2xl text-xs shadow-md transition shrink-0 flex items-center space-x-1.5"
          >
            <ImageIcon className="w-4 h-4" />
            <span>+ Create {teacherSubject} Quiz</span>
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
          Class Topic Diagnostics
        </button>
        <button
          onClick={() => setStudioTab('manage_quizzes')}
          className={`px-4 py-2 font-bold rounded-xl text-xs transition ${
            studioTab === 'manage_quizzes' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
          }`}
        >
          Manage My Class Papers ({myClassQuizzes.length})
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
        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs">
          <h3 className="font-black text-slate-900 text-base">Student Performance Diagnostic ({teacherSubject})</h3>
          <p className="text-xs text-slate-500">Real-time weak topic diagnostics for your registered class.</p>
        </div>
      ) : studioTab === 'manage_quizzes' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {myClassQuizzes.map(q => (
            <div key={q.id} className="bg-white border border-slate-200 rounded-3xl p-5 flex justify-between items-center shadow-xs">
              <div>
                <span className="text-[10px] font-bold text-indigo-600 uppercase bg-indigo-50 px-2 py-0.5 rounded">{q.subject}</span>
                <h4 className="font-bold text-slate-900 text-sm mt-1">{q.title}</h4>
                <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{q.questions.length} Questions</span>
              </div>
              {userCanCRUD && (
                <button onClick={() => handleDeleteQuiz(q)} className="p-2.5 text-rose-600 hover:bg-rose-50 rounded-xl transition">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs">
          <h3 className="font-black text-slate-900 text-lg">Fast JSON Importer for {teacherSubject}</h3>
          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            rows={8}
            className="w-full bg-slate-900 text-emerald-400 font-mono text-xs p-4 rounded-2xl border border-slate-800"
          />
          <button
            onClick={handleImportJson}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-6 py-3 rounded-2xl text-xs shadow-md transition flex items-center space-x-2"
          >
            <Upload className="w-4 h-4" />
            <span>Publish {teacherSubject} Paper</span>
          </button>
        </div>
      )}
    </div>
  );
}