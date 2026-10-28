import React, { useState } from 'react';
import { Upload, Code, Image as ImageIcon, Trash2, Award, Plus, Sparkles, HeartHandshake, Mail, Phone } from 'lucide-react';
import { canUserCRUDPracticeVault } from '../utils/helpers';

export default function TeacherStudio({
  role, teacherSubject = 'Physics', quizzes, onAddQuiz, onDeleteQuiz,
  badges, setBadges, ranks, setRanks,
  sponsors = [], setSponsors,
  showDiagramUploadModal, setShowDiagramUploadModal, showToast, askConfirm
}) {
  const [studioTab, setStudioTab] = useState('manage_quizzes');
  const [jsonInput, setJsonInput] = useState(`[
  {
    "topic": "Light Rays & Lenses",
    "question_text": "Which lens converges parallel light rays to a real focal point?",
    "option_a": "Convex Lens", "option_b": "Concave Lens", "option_c": "Flat Glass", "option_d": "Prism",
    "correct_option": "A", "explanation": "A convex lens is thicker in the middle and converges incoming parallel light rays."
  }
]`);

  const [badgeName, setBadgeName] = useState('');
  const [badgeIcon, setBadgeIcon] = useState('🏆');
  const [badgeDesc, setBadgeDesc] = useState('');
  const [badgeReqXp, setBadgeReqXp] = useState(250);

  const canEditVault = canUserCRUDPracticeVault(role);
  const isAdmin = role === 'super_admin';

  const myClassQuizzes = isAdmin
    ? quizzes
    : quizzes.filter(q => (q.subject || '').toLowerCase() === (teacherSubject || '').toLowerCase());

  const handleImportJson = async () => {
    if (!canEditVault) return showToast("❌ Permission Denied!", "error");

    try {
      const parsed = JSON.parse(jsonInput);
      if (!Array.isArray(parsed)) throw new Error("JSON must be an array of questions.");

      const newQuiz = {
        id: `quiz_json_${Date.now()}`,
        title: `${teacherSubject} Grade 10 Practice Paper`,
        subject: teacherSubject,
        grade: 10,
        subject_code: '0625',
        exam_year: 2026,
        variant: 'Teacher Custom',
        is_past_paper: false,
        has_diagrams: parsed.some(q => !!q.diagram_url),
        questions: parsed
      };

      await onAddQuiz(newQuiz);
      showToast(`🎉 Published ${teacherSubject} paper with ${parsed.length} questions to Supabase!`, "success");
    } catch (e) {
      showToast("❌ Invalid JSON format: " + e.message, "error");
    }
  };

  const handleDeleteQuizAction = (quiz) => {
    if (!canEditVault) return;
    askConfirm("Delete Exam Paper", `Remove "${quiz.title}" from the database?`, () => {
      onDeleteQuiz(quiz.id);
      showToast(`Deleted paper "${quiz.title}".`, "info");
    });
  };

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
    askConfirm("Delete Badge", "Delete this achievement badge?", () => {
      setBadges(badges.filter(b => b.id !== badgeId));
      showToast("Deleted badge.", "info");
    });
  };

  const handleUpdateRankMinXp = (rankId, newMinXp) => {
    setRanks(ranks.map(r => r.id === rankId ? { ...r, minXp: parseInt(newMinXp) || 0 } : r));
    showToast("Updated Rank XP Threshold!", "success");
  };

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
      <div className="bg-gradient-to-r from-cyan-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
        <div className="space-y-2">
          <span className="bg-cyan-500/20 border border-cyan-400/30 text-cyan-200 font-bold px-3 py-1 rounded-full text-xs uppercase tracking-wider">
            {isAdmin ? 'Super Admin Command Dashboard' : `Teacher Practice Studio (${teacherSubject} Class)`}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black">
            {isAdmin ? 'Super Admin Command Center' : 'Teacher Practice Vault Studio'}
          </h2>
          <p className="text-cyan-200 text-xs max-w-lg">
            {isAdmin 
              ? 'Manage system-wide practice papers, Cambridge arena, student badges, and sponsor proposals.' 
              : `Create and publish practice vault quizzes for your registered ${teacherSubject} class across all grades.`}
          </p>
        </div>

        {canEditVault && (
          <button
            onClick={() => setShowDiagramUploadModal(true)}
            className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-5 py-3 rounded-2xl text-xs shadow-md transition shrink-0 flex items-center space-x-1.5"
          >
            <ImageIcon className="w-4 h-4" />
            <span>+ Add {teacherSubject} Practice Quiz</span>
          </button>
        )}
      </div>

      <div className="flex space-x-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setStudioTab('manage_quizzes')}
          className={`px-4 py-2 font-bold rounded-xl text-xs transition shrink-0 ${
            studioTab === 'manage_quizzes' ? 'bg-cyan-600 text-white' : 'bg-slate-100 text-slate-700'
          }`}
        >
          Practice Vault Quizzes ({myClassQuizzes.length})
        </button>

        {isAdmin && (
          <>
            <button
              onClick={() => setStudioTab('sponsors')}
              className={`px-4 py-2 font-bold rounded-xl text-xs transition shrink-0 flex items-center space-x-1 font-bold ${
                studioTab === 'sponsors' ? 'bg-cyan-600 text-white' : 'bg-slate-100 text-slate-700'
              }`}
            >
              <HeartHandshake className="w-3.5 h-3.5 text-rose-400" />
              <span>Sponsor Proposals ({sponsors.length})</span>
            </button>

            <button
              onClick={() => setStudioTab('badges_ranks')}
              className={`px-4 py-2 font-bold rounded-xl text-xs transition shrink-0 flex items-center space-x-1 ${
                studioTab === 'badges_ranks' ? 'bg-cyan-600 text-white' : 'bg-slate-100 text-slate-700'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Manage Badges & Ranks</span>
            </button>
          </>
        )}

        <button
          onClick={() => setStudioTab('json_upload')}
          className={`px-4 py-2 font-bold rounded-xl text-xs transition shrink-0 flex items-center space-x-1.5 ${
            studioTab === 'json_upload' ? 'bg-cyan-600 text-white' : 'bg-slate-100 text-slate-700'
          }`}
        >
          <Code className="w-3.5 h-3.5" />
          <span>JSON Importer</span>
        </button>
      </div>

      {studioTab === 'manage_quizzes' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {myClassQuizzes.map(q => (
            <div key={q.id} className="bg-white border border-slate-200 rounded-3xl p-5 flex justify-between items-center shadow-xs">
              <div>
                <span className="text-[10px] font-bold text-cyan-700 uppercase bg-cyan-50 px-2 py-0.5 rounded">
                  {q.subject} • Grade {q.grade}
                </span>
                <h4 className="font-bold text-slate-900 text-sm mt-1">{q.title}</h4>
                <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{q.questions.length} Questions</span>
              </div>
              {canEditVault && (
                <button onClick={() => handleDeleteQuizAction(q)} className="p-2.5 text-rose-600 hover:bg-rose-50 rounded-xl transition">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      ) : studioTab === 'sponsors' && isAdmin ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs">
          <div className="flex justify-between items-center border-b pb-4">
            <div>
              <h3 className="font-black text-slate-900 text-base flex items-center space-x-2">
                <HeartHandshake className="w-5 h-5 text-rose-600" />
                <span>Partner & Sponsor Proposals Dashboard</span>
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
                      <span className="text-[10px] font-black uppercase text-cyan-800 bg-cyan-50 border border-cyan-200 px-2.5 py-0.5 rounded-md">
                        {sp.partnerType} • {sp.contributionType}
                      </span>
                      <h4 className="font-black text-slate-900 text-base mt-1">{sp.applicantName}</h4>
                    </div>

                    <div className="flex items-center space-x-2">
                      <select
                        value={sp.status || 'Pending Review ⏳'}
                        onChange={(e) => handleUpdateSponsorStatus(sp.id, e.target.value)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-xl border focus:outline-none ${
                          sp.status === 'Approved Partner ✅' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                          sp.status === 'Contacted 📞' ? 'bg-indigo-100 text-indigo-800 border-indigo-300' :
                          'bg-amber-100 text-amber-800 border-amber-300'
                        }`}
                      >
                        <option value="Pending Review ⏳">Pending Review ⏳</option>
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
                      <Mail className="w-3.5 h-3.5 text-cyan-600" />
                      <a href={`mailto:${sp.email}`} className="text-cyan-600 font-bold hover:underline">{sp.email}</a>
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
      ) : studioTab === 'badges_ranks' && isAdmin ? (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs">
            <h3 className="font-black text-slate-900 text-base flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-cyan-600" />
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
                      className="w-full bg-white border rounded-lg p-1 text-center font-bold text-cyan-700 text-xs"
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
                  <Award className="w-5 h-5 text-cyan-600" />
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
                  className="bg-white border rounded-xl p-2.5 font-bold text-cyan-700"
                  required
                />
                <button type="submit" className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2.5 rounded-xl transition flex items-center justify-center space-x-1">
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
                      <span className="text-[10px] font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded mt-1 inline-block">
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
            className="bg-cyan-600 hover:bg-cyan-700 text-white font-black px-6 py-3 rounded-2xl text-xs shadow-md transition flex items-center space-x-2"
          >
            <Upload className="w-4 h-4" />
            <span>Publish {teacherSubject} Paper to Supabase</span>
          </button>
        </div>
      )}
    </div>
  );
}