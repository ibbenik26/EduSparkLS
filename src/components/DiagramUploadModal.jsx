import React from 'react';
import { Image as ImageIcon, Plus } from 'lucide-react';

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
  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl my-8">
        <div className="flex justify-between items-center border-b pb-3">
          <h3 className="font-black text-slate-900 text-lg flex items-center space-x-2">
            <ImageIcon className="w-5 h-5 text-indigo-600" />
            <span>Upload O-Level Diagram MCQ Paper</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 font-bold text-lg">✕</button>
        </div>

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
              <label className="text-xs font-bold text-slate-700 block mb-1">Exam Year & Variant</label>
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
            <label className="text-xs font-bold text-slate-700 block">Select Diagram Image File</label>
            <div className="border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-slate-50/50 rounded-2xl p-4 text-center transition">
              {draftDiagramImage ? (
                <div className="space-y-2">
                  <img src={draftDiagramImage} alt="Diagram Preview" className="max-h-40 mx-auto rounded-xl shadow-xs border" />
                  <button
                    type="button"
                    onClick={() => setDraftDiagramImage(null)}
                    className="text-xs text-rose-600 font-bold hover:underline"
                  >
                    ✕ Remove Diagram
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer flex flex-col items-center justify-center space-y-2 py-3">
                  <ImageIcon className="w-8 h-8 text-indigo-500" />
                  <span className="text-xs font-bold text-indigo-700">Choose Image File from Computer</span>
                  <input type="file" accept="image/*" onChange={handleImageFileUpload} className="hidden" />
                </label>
              )}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Question Text</label>
            <input
              type="text"
              value={draftQuestionText}
              onChange={(e) => setDraftQuestionText(e.target.value)}
              placeholder="Question text referencing the diagram..."
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
              className="bg-emerald-50 border border-emerald-300 rounded-xl px-3 py-1.5 text-xs font-bold text-emerald-800"
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
              <span>Add Question</span>
            </button>
            <button
              type="button"
              onClick={handlePublishStagedQuiz}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs"
            >
              🚀 Publish Paper ({stagedQuestions.length})
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}