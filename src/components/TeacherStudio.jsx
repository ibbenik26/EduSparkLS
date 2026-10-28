import React, { useState } from 'react';
import { Upload, Code, Image as ImageIcon, Trash2, Award, Plus, Sparkles, Shield, HeartHandshake, Mail, Phone } from 'lucide-react';
import { ALL_SUBJECTS, canUserCRUDQuizzes } from '../utils/helpers';

export default function TeacherStudio({
  role, teacherSubject = 'Physics', quizzes, setQuizzes,
  badges, setBadges, ranks, setRanks,
  sponsors = [], setSponsors,
  showDiagramUploadModal, setShowDiagramUploadModal, showToast, askConfirm
}) {
  const [studioTab, setStudioTab] = useState('diagnostics'); // 'diagnostics', 'manage_quizzes', 'json_upload', 'badges_ranks', 'sponsors'
  const [jsonInput, setJsonInput] = useState(`[
  {
    "topic": "Registered Subject Focus",
    "question_text": "Sample question for teacher's registered subject class.",
    "option_a": "Option A", "option_b": "Option B", "option_c": "Option C", "option_d": "Option D",
    "correct_option": "A", "explanation": "Mark scheme verified."
  }
]`);

  // New Badge Form
  const [badgeName, setBadgeName] = useState('');
  const [badgeIcon, setBadgeIcon] = useState('🏆');
  const [badgeDesc, setBadgeDesc] = useState('');
  const [badgeReqXp, setBadgeReqXp] = useState(250);

  const userCanCRUD = canUserCRUDQuizzes(role);

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
    askConfirm("Delete Exam Paper", `Remove "${quiz.title}" from the curriculum system?`, () => {
      setQuizzes(quizzes.filter(q => q.id !== quiz.id));
      showToast(`Deleted paper "${quiz.title}".`, "info");
    });
  };

  // BADGE CRUD
  const handleAddBadge = (e) => {
    e.preventDefault();
    if (!badgeName) return showToast("Enter badge name.", "warning");

    const newBadge = {
      id: `badge_${Date.now()}`,
      name: badgeName,
      icon: badgeIcon || '🎓',
      desc: badgeDesc || 'Academic achievement milestone.',
      reqXp: parseInt(badgeReqXp)
    };

    setBadges([...badges, newBadge]);
    setBadgeName(''); setBadgeDesc('');
    showToast(`🎉 Added new badge "${badgeName}"!`, "success");
  };

  const handleDeleteBadge = (badgeId) => {
    askConfirm("Delete Badge", "Delete this achievement badge from system?", () => {
      setBadges(badges.filter(b => b.id !== badgeId));
      showToast("Deleted badge.", "info");
    });
  };

  // RANK XP UPDATE
  const handleUpdateRankMinXp = (rankId, newMinXp) => {
    setRanks(ranks.map(r => r.id === rankId ? { ...r, minXp: parseInt(newMinXp) || 0 } : r));
    showToast("Updated Rank XP Threshold!", "success");
  };

  // SPONSOR STATUS MANAGEMENT
  const handleUpdateSponsorStatus = (sponsorId, newStatus) => {
    setSponsors(sponsors.map(s => s.id === sponsorId ? { ...s, status: newStatus } : s));
    showToast(`Updated sponsor status to "${newStatus}"!`, "success");
  };

  const handleDeleteSponsor = (sponsorId) => {
    askConfirm("Delete Sponsor Application", "Remove this application entry?", () => {
      setSponsors(sponsors.filter(s => s.id !== sponsorId));
      showToast("Removed sponsor proposal.", "info");
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
        <div className="space-y-2">
          <span className="bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 font-bold px-3 py-1 rounded-full text-xs uppercase tracking-wider">
            {role === 'super_admin' ? 'Super Admin Command Studio' : `Registered Teacher Studio (${teacherSubject} Class)`}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black">Teacher & Admin Management Studio</h2>
          <p className="text-indigo-200 text-xs max-w-lg">
            Manage quizzes, diagnostics, fast JSON uploads, Academic Badges, and review Sponsor/Partner applications.
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

      <div className="flex space-x-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setStudioTab('diagnostics')}
          className={`px-4 py-2 font-bold rounded-xl text-xs transition shrink-0 ${
            studioTab === 'diagnostics' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
          }`}
        >
          Class Diagnostics
        </button>

        <button
          onClick={() => setStudioTab('manage_quizzes')}
          className={`px-4 py-2 font-bold rounded-xl text-xs transition shrink-0 ${
            studioTab === 'manage_quizzes' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
          }`}
        >
          Class Papers ({myClassQuizzes.length})
        </button>

        <button
          onClick={() => setStudioTab('sponsors')}
          className={`px-4 py-2 font-bold rounded-xl text-xs transition shrink-0 flex items-center space-x-1 font-bold ${
            studioTab === 'sponsors' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
          }`}
        >
          <HeartHandshake className="w-3.5 h-3.5 text-rose-400" />
          <span>Sponsor Proposals ({sponsors.length})</span>
        </button>

        <button
          onClick={() => setStudioTab('badges_ranks')}
          className={`px-4 py-2 font-bold rounded-xl text-xs transition shrink-0 flex items-center space-x-1 ${
            studioTab === 'badges_ranks' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Manage Badges & Ranks</span>
        </button>

        {userCanCRUD && (
          <button
            onClick={() => setStudioTab('json_upload')}
            className={`px-4 py-2 font-bold rounded-xl text-xs transition shrink-0 flex items-center space-x-1.5 ${
              studioTab === 'json_upload' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>JSON Importer</span>
          </button>
        )}
      </div>

      {studioTab === 'diagnostics' ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs">
          <h3 className="font-black text-slate-900 text-base">Student Performance Diagnostic ({teacherSubject})</h3>
          <p className="text-xs text-slate-500">Real-time weak topic diagnostics for your registered class.</p>
        </div>
      ) : studioTab === 'sponsors' ? (
        /* SPONSORS & PARTNERS MANAGEMENT VIEW */
        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs">
          <div className="flex justify-between items-center border-b pb-4">
            <div>
              <h3 className="font-black text-slate-900 text-base flex items-center space-x-2">
                <HeartHandshake className="w-5 h-5 text-rose-600" />
                <span>Partner & Sponsor Proposals Portal</span>
              </h3>
              <p className="text-xs text-slate-500">Review applications submitted from the landing page by parents, businesses, and alumni.</p>
            </div>
          </div>

          {sponsors.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">No sponsor proposals submitted yet.</div>
          ) : (
            <div className="space-y-4">
              {sponsors.map((sp) => (
                <div key={sp.id} className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-3 relative">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-200/80 pb-3">
                    <div>
                      <span className="text-[10px] font-black uppercase text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-md">
                        {sp.partnerType} • {sp.contributionType}
                      </span>
                      <h4 className="font-black text-slate-900 text-base mt-1">{sp.applicantName}</h4>
                    </div>

                    <div className="flex items-center space-x-2">
                      <select
                        value={sp.status || 'Pending Review'}
                        onChange={(e) => handleUpdateSponsorStatus(sp.id, e.target.value)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-xl border focus:outline-none ${
                          sp.status === 'Approved Partner ✅' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                          sp.status === 'Contacted 📞' ? 'bg-indigo-100 text-indigo-800 border-indigo-300' :
                          'bg-amber-100 text-amber-800 border-amber-300'
                        }`}
                      >
                        <option value="Pending Review">Pending Review ⏳</option>
                        <option value="Contacted 📞">Contacted 📞</option>
                        <option value="Approved Partner ✅">Approved Partner ✅</option>
                      </select>

                      <button
                        onClick={() => handleDeleteSponsor(sp.id)}
                        className="p-1.5 text-rose-600 hover:bg-rose-100 rounded-xl transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed bg-white border border-slate-100 p-3 rounded-xl">
                    "{sp.message}"
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500 pt-1">
                    <span className="flex items-center space-x-1">
                      <Mail className="w-3.5 h-3.5 text-indigo-600" />
                      <a href={`mailto:${sp.email}`} className="text-indigo-600 font-bold hover:underline">{sp.email}</a>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{sp.phone}</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono ml-auto">Submitted: {sp.date}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
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
      ) : studioTab === 'badges_ranks' ? (
        /* BADGES & RANKS MANAGER VIEW */
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs">
            <h3 className="font-black text-slate-900 text-base flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <span>Student Rank Level XP Requirements</span>
            </h3>
            <p className="text-xs text-slate-500">Modify minimum XP required for students to unlock each rank tier.</p>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {ranks.map(r => (
                <div key={r.id} className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl text-center space-y-2">
                  <span className="text-2xl">{r.icon}</span>
                  <h4 className="font-bold text-slate-900 text-xs">{r.title}</h4>
                  <div>
                    <label className="text-[9px] font-bold uppercase text-slate-400 block mb-0.5">Min XP</label>
                    <input
                      type="number"
                      value={r.minXp}
                      onChange={(e) => handleUpdateRankMinXp(r.id, e.target.value)}
                      className="w-full bg-white border rounded-lg p-1 text-center font-bold text-indigo-700 text-xs"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-6 shadow-xs">
            <div className="flex justify-between items-center border-b pb-4">
              <div>
                <h3 className="font-black text-slate-900 text-base flex items-center space-x-2">
                  <Award className="w-5 h-5 text-indigo-600" />
                  <span>Academic Achievement Badges (CRUD)</span>
                </h3>
                <p className="text-xs text-slate-500">Create or delete achievement badges displayed on student profiles.</p>
              </div>
            </div>

            <form onSubmit={handleAddBadge} className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-3 text-xs">
              <h4 className="font-bold text-slate-800">Add New Achievement Badge</h4>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                <input
                  type="text"
                  value={badgeName}
                  onChange={(e) => setBadgeName(e.target.value)}
                  placeholder="Badge Name (e.g. Science Hero)"
                  className="bg-white border rounded-xl p-2.5 text-slate-900 font-bold"
                  required
                />
                <input
                  type="text"
                  value={badgeIcon}
                  onChange={(e) => setBadgeIcon(e.target.value)}
                  placeholder="Emoji Icon (e.g. 🧪)"
                  className="bg-white border rounded-xl p-2.5 text-slate-900 text-center text-lg"
                  required
                />
                <input
                  type="number"
                  value={badgeReqXp}
                  onChange={(e) => setBadgeReqXp(e.target.value)}
                  placeholder="Req XP"
                  className="bg-white border rounded-xl p-2.5 font-bold text-indigo-700"
                  required
                />
                <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl transition flex items-center justify-center space-x-1">
                  <Plus className="w-4 h-4" />
                  <span>Create Badge</span>
                </button>
              </div>
              <input
                type="text"
                value={badgeDesc}
                onChange={(e) => setBadgeDesc(e.target.value)}
                placeholder="Badge Criteria Description"
                className="w-full bg-white border rounded-xl p-2.5 text-slate-900"
              />
            </form>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {badges.map(b => (
                <div key={b.id} className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">{b.icon}</span>
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs">{b.name}</h4>
                      <p className="text-[11px] text-slate-500">{b.desc}</p>
                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded mt-1 inline-block">
                        Unlocks at {b.reqXp || 100} XP
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteBadge(b.id)}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
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