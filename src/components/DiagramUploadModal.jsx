import React, { useState } from 'react';
import { Image as ImageIcon, Code, Upload, CheckCircle2 } from 'lucide-react';
import { ALL_SUBJECTS } from '../utils/helpers';
import { normalizeQuestions } from '../utils/quizValidation';

const MAX_DIAGRAM_WIDTH = 1000;

// Shrinks uploaded images so the base64 string stored in the quiz row stays small.
function readAndShrinkImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read the image file.'));
    reader.onload = () => {
      const dataUrl = reader.result;

      if (file.type === 'image/svg+xml') {
        if (dataUrl.length > 300000) reject(new Error('SVG is too large (keep it under ~200 KB).'));
        else resolve(dataUrl);
        return;
      }

      const img = new Image();
      img.onerror = () => reject(new Error('That file is not a valid image.'));
      img.onload = () => {
        const scale = Math.min(1, MAX_DIAGRAM_WIDTH / img.width);
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });
}

export default function DiagramUploadModal({ onAddQuiz, showToast, onClose, defaultSubject, lockSubject = false }) {
  const [quizScope, setQuizScope] = useState('olevel'); // 'olevel' or 'grade'
  const [gradeLevel, setGradeLevel] = useState(10);
  const [subject, setSubject] = useState(defaultSubject || 'Physics');
  const [subjectCode, setSubjectCode] = useState('');
  const [examYear, setExamYear] = useState(2026);
  const [paperTopic, setPaperTopic] = useState('Paper 12 (Optics & Ray Diagrams)');
  const [saving, setSaving] = useState(false);

  const [diagramMode, setDiagramMode] = useState('file'); // 'file' or 'url'
  const [diagramUrl, setDiagramUrl] = useState('');
  const [uploadedDiagramData, setUploadedDiagramData] = useState(null);

  const [jsonQuestionsText, setJsonQuestionsText] = useState(`[
  {
    "topic": "Optics & Light Rays",
    "question_text": "Study the diagram above. What phenomenon takes place when light passes through the boundary?",
    "option_a": "Refraction and Dispersion",
    "option_b": "Total Internal Reflection",
    "option_c": "Diffraction",
    "option_d": "Polarization",
    "correct_option": "A",
    "explanation": "White light bends and disperses into spectral colors when passing through a glass prism."
  }
]`);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('❌ Please select a valid image file (PNG, JPG, SVG, WebP).', 'error');
      return;
    }

    try {
      setUploadedDiagramData(await readAndShrinkImage(file));
    } catch (err) {
      showToast(`❌ ${err.message}`, 'error');
    }
  };

  const handlePublishQuiz = async (e) => {
    e.preventDefault();
    if (saving) return;

    let parsed;
    try {
      parsed = JSON.parse(jsonQuestionsText);
    } catch (err) {
      showToast(`❌ Invalid JSON: ${err.message}`, 'error');
      return;
    }

    const activeDiagram = diagramMode === 'file' ? uploadedDiagramData : diagramUrl.trim();
    const { questions, errors } = normalizeQuestions(parsed, { defaultTopic: paperTopic, diagram: activeDiagram || null });
    if (errors.length) {
      showToast(`❌ ${errors.slice(0, 3).join('\n')}${errors.length > 3 ? `\n...and ${errors.length - 3} more` : ''}`, 'error');
      return;
    }

    const isOLevel = quizScope === 'olevel';
    const newQuiz = {
      id: `quiz_${Date.now()}`,
      title: isOLevel
        ? `Cambridge O-Level ${subject} (${examYear}) - ${paperTopic}`
        : `Grade ${gradeLevel} ${subject} - ${paperTopic}`,
      subject,
      grade: isOLevel ? 10 : parseInt(gradeLevel),
      subject_code: subjectCode.trim(),
      exam_year: isOLevel ? parseInt(examYear) : null,
      variant: paperTopic,
      is_past_paper: isOLevel,
      has_diagrams: questions.some(q => !!q.diagram_url),
      questions
    };

    setSaving(true);
    const ok = await onAddQuiz(newQuiz);
    setSaving(false);
    if (ok) onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-8 border border-slate-100">
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600 p-2.5 rounded-2xl text-white shadow-xs">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-lg">Fast Quiz & Diagram Builder</h3>
              <p className="text-xs text-slate-500">Upload diagrams directly or use image URLs with fast JSON batch questions.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 font-bold text-lg">✕</button>
        </div>

        <form onSubmit={handlePublishQuiz} className="space-y-5">
          <div className="grid grid-cols-2 gap-3 bg-slate-100 p-1.5 rounded-2xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setQuizScope('olevel')}
              className={`py-2.5 rounded-xl transition ${quizScope === 'olevel' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600'}`}
            >
              🎓 Cambridge O-Level Arena Paper
            </button>
            <button
              type="button"
              onClick={() => setQuizScope('grade')}
              className={`py-2.5 rounded-xl transition ${quizScope === 'grade' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600'}`}
            >
              🎒 Grade Curriculum Quiz
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {quizScope === 'grade' ? (
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Class / Grade</label>
                <select
                  value={gradeLevel}
                  onChange={(e) => setGradeLevel(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-900"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(g => (
                    <option key={g} value={g}>Grade {g}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Exam Year</label>
                <select
                  value={examYear}
                  onChange={(e) => setExamYear(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-900"
                >
                  {[2026, 2025, 2024, 2023, 2022, 2021, 2020].map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Subject</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                disabled={lockSubject}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-indigo-700 disabled:opacity-70"
              >
                {ALL_SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Syllabus Code (optional)</label>
              <input
                type="text"
                value={subjectCode}
                onChange={(e) => setSubjectCode(e.target.value)}
                placeholder="e.g. 5054"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-mono text-slate-900"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Paper Variant / Topic</label>
              <input
                type="text"
                value={paperTopic}
                onChange={(e) => setPaperTopic(e.target.value)}
                placeholder="e.g. Paper 12 or Mechanics"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium text-slate-900"
                required
              />
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                <ImageIcon className="w-4 h-4 text-indigo-600" />
                <span>Diagram Option (Optional, applied to every question without its own diagram_url)</span>
              </span>
              <div className="flex space-x-1 text-[11px] font-bold shrink-0">
                <button
                  type="button"
                  onClick={() => setDiagramMode('file')}
                  className={`px-2.5 py-1 rounded-lg ${diagramMode === 'file' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'}`}
                >
                  File Upload
                </button>
                <button
                  type="button"
                  onClick={() => setDiagramMode('url')}
                  className={`px-2.5 py-1 rounded-lg ${diagramMode === 'url' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'}`}
                >
                  Image URL
                </button>
              </div>
            </div>

            {diagramMode === 'file' ? (
              <div className="border-2 border-dashed border-indigo-200 rounded-xl p-4 text-center bg-white">
                {uploadedDiagramData ? (
                  <div className="space-y-2">
                    <img src={uploadedDiagramData} alt="Diagram Preview" className="max-h-36 mx-auto rounded-lg border shadow-xs" />
                    <button
                      type="button"
                      onClick={() => setUploadedDiagramData(null)}
                      className="text-xs font-bold text-rose-600 hover:underline"
                    >
                      ✕ Clear Uploaded Image
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center justify-center space-y-1.5 py-2">
                    <Upload className="w-6 h-6 text-indigo-600" />
                    <span className="text-xs font-bold text-indigo-700">Click to Choose Diagram Image File</span>
                    <span className="text-[10px] text-slate-400">PNG, JPG, SVG, WebP supported (auto-resized)</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                )}
              </div>
            ) : (
              <input
                type="url"
                value={diagramUrl}
                onChange={(e) => setDiagramUrl(e.target.value)}
                placeholder="Paste diagram image web URL (e.g., https://.../diagram.jpg)"
                className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 font-mono"
              />
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span className="flex items-center space-x-1.5">
                <Code className="w-4 h-4 text-emerald-600" />
                <span>Paste Questions JSON Array</span>
              </span>
              <span className="text-[10px] text-slate-400">correct_option: A, B, C or D</span>
            </label>
            <textarea
              value={jsonQuestionsText}
              onChange={(e) => setJsonQuestionsText(e.target.value)}
              rows={8}
              className="w-full bg-slate-900 text-emerald-400 font-mono text-xs p-3.5 rounded-2xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-60 text-white font-black py-3.5 rounded-2xl text-xs shadow-md transition flex items-center justify-center space-x-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{saving ? 'Saving...' : `Publish Paper (${quizScope === 'olevel' ? 'O-Level Arena' : `Grade ${gradeLevel}`})`}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
