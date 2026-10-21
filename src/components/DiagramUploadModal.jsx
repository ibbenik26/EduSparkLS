import React, { useState } from 'react';
import { Image as ImageIcon, Plus, Code, Upload } from 'lucide-react';

export default function DiagramUploadModal({
  studioSubject,
  setStudioSubject,
  studioVariant,
  setStudioVariant,
  draftDiagramImage,
  setDraftDiagramImage,
  draftQuestionText,
  setDraftQuestionText,
  draftOptA, setDraftOptA,
  draftOptB, setDraftOptB,
  draftOptC, setDraftOptC,
  draftOptD, setDraftOptD,
  draftCorrectOpt, setDraftCorrectOpt,
  stagedQuestions,
  handleImageFileUpload,
  handleAddQuestionToStage,
  handlePublishStagedQuiz,
  allSubjects,
  onClose
}) {
  const [modalTab, setModalTab] = useState('visual');
  const [jsonPasteText, setJsonPasteText] = useState(`[
  {
    "topic": "Optics & Light Rays",
    "diagram_url": "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80",
    "question_text": "Study the optics diagram above. What phenomenon takes place when light enters the prism?",
    "option_a": "Refraction & Dispersion",
    "option_b": "Total Internal Reflection",
    "option_c": "Diffraction",
    "option_d": "Polarization",
    "correct_option": "A",
    "explanation": "White light separates into spectral colors through refraction and dispersion in glass."
  }
]`);

  const handleJsonPastePublish = () => {
    try {
      const parsed = JSON.parse(jsonPasteText);
      if (!Array.isArray(parsed)) throw new Error("JSON must be an array of question objects.");

      // Add each question to the staged question list
      parsed.forEach((q, idx) => {
        stagedQuestions.push({
          id: `q_json_${Date.now()}_${idx}`,
          topic: q.topic || studioSubject,
          diagram_url: q.diagram_url || null,
          question_text: q.question_text,
          option_a: q.option_a,
          option_b: q.option_b,
          option_c: q.option_c || 'None',
          option_d: q.option_d || 'All',
          correct_option: q.correct_option || 'A',
          explanation: q.explanation || 'Option verified against mark scheme.'
        });
      });

      handlePublishStagedQuiz();
    } catch (e) {
      alert("❌ Invalid JSON format: " + e.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl my-8">
        <div className="flex justify-between items-center border-b pb-3">
          <h3 className="font-black text-slate-900 text-lg flex items-center space-x-2">
            <ImageIcon className="w-5 h-5 text-indigo-600" />
            <span>Diagram MCQ & JSON Creator</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 font-bold text-lg">✕</button>
        </div>

        <div className="flex space-x-2 border-b pb-2">
          <button
            onClick={() => setModalTab('visual')}
            className={`px-3 py-1.5 font-bold rounded-xl text-xs ${modalTab === 'visual' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'}`}
          >
            Form Mode
          </button>
          <button
            onClick={() => setModalTab('json')}
            className={`px-3 py-1.5 font-bold rounded-xl text-xs flex items-center space-x-1 ${modalTab === 'json' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'}`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Fast JSON Mode</span>
          </button>
        </div>

        {modalTab === 'visual' ? (
          <form onSubmit={handleAddQuestionToStage} className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Subject</label>
                <select
                  value={studioSubject}
                  onChange={(e) => setStudioSubject(e.target.value)}
                  className="w-full bg-slate-50 border rounded-xl p-2.5 text-xs font-bold text-indigo-700"
                >
                  {allSubjects.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Exam Variant</label>
                <input
                  type="text"
                  value={studioVariant}
                  onChange={(e) => setStudioVariant(e.target.value)}
                  placeholder="e.g. 2026 Paper 12"
                  className="w-full bg-slate-50 border rounded-xl p-2.5 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Upload Image OR Paste Image URL</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  value={draftDiagramImage || ''}
                  onChange={(e) => setDraftDiagramImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="bg-slate-50 border rounded-xl p-2.5 text-xs"
                />
                <label className="cursor-pointer bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl p-2.5 text-xs text-center flex items-center justify-center space-x-1">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Choose Image File</span>
                  <input type="file" accept="image/*" onChange={handleImageFileUpload} className="hidden" />
                </label>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Question Text</label>
              <input
                type="text"
                value={draftQuestionText}
                onChange={(e) => setDraftQuestionText(e.target.value)}
                placeholder="Question referencing the diagram..."
                className="w-full bg-slate-50 border rounded-xl p-2.5 text-xs"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <input type="text" value={draftOptA} onChange={(e) => setDraftOptA(e.target.value)} placeholder="Option A" className="bg-slate-50 border rounded-xl p-2 text-xs" required />
              <input type="text" value={draftOptB} onChange={(e) => setDraftOptB(e.target.value)} placeholder="Option B" className="bg-slate-50 border rounded-xl p-2 text-xs" required />
              <input type="text" value={draftOptC} onChange={(e) => setDraftOptC(e.target.value)} placeholder="Option C" className="bg-slate-50 border rounded-xl p-2 text-xs" />
              <input type="text" value={draftOptD} onChange={(e) => setDraftOptD(e.target.value)} placeholder="Option D" className="bg-slate-50 border rounded-xl p-2 text-xs" />
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-700">Correct Answer:</span>
              <select
                value={draftCorrectOpt}
                onChange={(e) => setDraftCorrectOpt(e.target.value)}
                className="bg-emerald-50 border border-emerald-300 rounded-xl px-3 py-1 text-xs font-bold text-emerald-800"
              >
                <option value="A">Option A</option>
                <option value="B">Option B</option>
                <option value="C">Option C</option>
                <option value="D">Option D</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center space-x-1">
                <Plus className="w-3.5 h-3.5" />
                <span>Add Question ({stagedQuestions.length})</span>
              </button>
              <button
                type="button"
                onClick={handlePublishStagedQuiz}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs"
              >
                🚀 Publish Paper
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-700 block">Paste JSON Question Array (With `diagram_url`)</label>
            <textarea
              value={jsonPasteText}
              onChange={(e) => setJsonPasteText(e.target.value)}
              rows={10}
              className="w-full bg-slate-900 text-emerald-400 font-mono text-xs p-3 rounded-2xl border"
            />
            <button
              onClick={handleJsonPastePublish}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-xs shadow-md"
            >
              🚀 Publish JSON Diagram Paper
            </button>
          </div>
        )}
      </div>
    </div>
  );
}