import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import confetti from 'canvas-confetti';
import {
  Trophy, Zap, Coins, Heart, Sparkles, BookOpen, LogOut,
  Clock, Flame, BrainCircuit, GraduationCap, CheckCircle2,
  XCircle, Check, RefreshCw, Upload, Lock, Trash2,
  Filter, ChevronRight, ChevronLeft, Search, Compass, Calculator,
  ShoppingBag, Award, User, Star, Gift, BarChart2,
  Book, BookOpenCheck, Library, Plus, ShieldCheck, Tag,
  Play, Pause, RotateCcw, FileText, KeyRound, ShieldAlert,
  Settings, Edit3, Sliders, Layers, Save, X, TrendingUp, Languages,
  AlertTriangle, Printer, Quote, ArrowRight, HelpCircle, UserCheck
} from 'lucide-react';

// --- Standardized Core Subjects ---
const ALL_SUBJECTS = [
  'Dhivehi',
  'Islam',
  'English',
  'Maths',
  'Physics',
  'Chemistry',
  'Biology',
  'Economics',
  'Business Studies',
  'Accounting',
  'Computer Science',
  'Social Studies',
  'Science'
];

// --- Helper for RTL Script Detection (Dhivehi & Islam) ---
const isRTLSubject = (subject) => {
  return subject === 'Dhivehi' || subject === 'Islam' || subject === 'ދިވެހި' || subject === 'އިސްލާމް';
};

// --- Dynamic Subject-Based Quiz Timer Helper ---
const getQuizTimeLimit = (quiz) => {
  if (!quiz) return 60;
  if (quiz.time_limit) return quiz.time_limit;

  const subj = (quiz.subject || '').toLowerCase();
  if (['maths', 'physics', 'chemistry', 'accounting', 'economics'].includes(subj)) {
    return 120;
  }
  return 60;
};

// --- Web Audio Synthesizer ---
const playSound = (type) => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'correct') {
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } else if (type === 'wrong') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } else if (type === 'coin') {
      osc.frequency.setValueAtTime(987.77, ctx.currentTime);
      osc.frequency.setValueAtTime(1318.51, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    }
  } catch (e) {
    console.warn("Audio Context error:", e);
  }
};

// --- Rank Calculator ---
const getStudentRank = (xp) => {
  if (xp >= 2000) return { title: 'Legend', level: 5, text: 'text-amber-600', bg: 'bg-amber-100' };
  if (xp >= 1200) return { title: 'Master', level: 4, text: 'text-purple-600', bg: 'bg-purple-100' };
  if (xp >= 700)  return { title: 'Expert', level: 3, text: 'text-blue-600', bg: 'bg-blue-100' };
  if (xp >= 300)  return { title: 'Scholar', level: 2, text: 'text-emerald-600', bg: 'bg-emerald-100' };
  return { title: 'Novice', level: 1, text: 'text-slate-600', bg: 'bg-slate-100' };
};

// --- 10-Quiz Subject Analytics & Feedback Engine ---
const generateSubjectAnalytics = (subject, attempts = []) => {
  const subjectAttempts = attempts.filter(a => (a.subject || '').toLowerCase() === subject.toLowerCase());
  const completedCount = subjectAttempts.length;

  if (completedCount === 0) return null;

  let totalScore = 0;
  let totalQuestions = 0;
  let totalTimeSeconds = 0;

  subjectAttempts.forEach(a => {
    totalScore += a.score || 0;
    totalQuestions += a.total || 0;
    totalTimeSeconds += a.timeSpentSeconds || (a.total * 30);
  });

  const accuracy = totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0;
  const avgSecondsPerQ = totalQuestions > 0 ? Math.round(totalTimeSeconds / totalQuestions) : 0;

  let predictedGrade = 'F';
  let gradeColor = 'text-rose-600';
  let gradeBg = 'bg-rose-50 border-rose-200';

  if (accuracy >= 85) { predictedGrade = 'A*'; gradeColor = 'text-purple-600'; gradeBg = 'bg-purple-50 border-purple-200'; }
  else if (accuracy >= 75) { predictedGrade = 'A'; gradeColor = 'text-indigo-600'; gradeBg = 'bg-indigo-50 border-indigo-200'; }
  else if (accuracy >= 65) { predictedGrade = 'B'; gradeColor = 'text-emerald-600'; gradeBg = 'bg-emerald-50 border-emerald-200'; }
  else if (accuracy >= 50) { predictedGrade = 'C'; gradeColor = 'text-amber-600'; gradeBg = 'bg-amber-50 border-amber-200'; }
  else if (accuracy >= 40) { predictedGrade = 'D'; gradeColor = 'text-orange-600'; gradeBg = 'bg-orange-50 border-orange-200'; }

  const strengths = [];
  const weaknesses = [];

  if (accuracy >= 75) {
    strengths.push('High concept retention and option elimination accuracy.');
    strengths.push('Consistent execution under timed challenge conditions.');
  } else if (accuracy >= 55) {
    strengths.push('Good grasp of basic syllabus concepts.');
    weaknesses.push('Occasional errors on multi-step analytical questions.');
  } else {
    weaknesses.push('Core concept gaps requiring immediate revision of fundamental topics.');
  }

  if (avgSecondsPerQ < 20 && accuracy < 60) {
    weaknesses.push('Rushing through questions (Avg <20s/Q). Read all choices carefully.');
  } else if (avgSecondsPerQ > 50 && accuracy >= 70) {
    strengths.push('Careful, methodical problem-solving style.');
    weaknesses.push('Pacing is slow (Avg >50s/Q). Practice timed drills to improve speed.');
  } else if (avgSecondsPerQ <= 40 && accuracy >= 80) {
    strengths.push('Optimal balance of high accuracy and fast pace!');
  }

  let trendMessage = 'Steady consistency across test sessions.';
  if (completedCount >= 4) {
    const half = Math.floor(completedCount / 2);
    const firstHalfAvg = subjectAttempts.slice(0, half).reduce((s, a) => s + (a.percentage || 0), 0) / half;
    const secondHalfAvg = subjectAttempts.slice(half).reduce((s, a) => s + (a.percentage || 0), 0) / (completedCount - half);

    if (secondHalfAvg - firstHalfAvg >= 8) {
      trendMessage = `📈 Strong improvement! Score accuracy increased by +${Math.round(secondHalfAvg - firstHalfAvg)}% in recent tests.`;
    } else if (firstHalfAvg - secondHalfAvg >= 8) {
      trendMessage = `📉 Score dip noticed (-${Math.round(firstHalfAvg - secondHalfAvg)}%). Re-visit difficult topics in the E-Library.`;
    }
  }

  return {
    subject,
    completedCount,
    totalScore,
    totalQuestions,
    accuracy,
    avgSecondsPerQ,
    predictedGrade,
    gradeColor,
    gradeBg,
    strengths,
    weaknesses,
    trendMessage,
    isCompleteReportUnlocked: completedCount >= 10
  };
};

// --- Printable Stage Certificate Modal ---
function PrintableCertificateModal({ student, subject, onClose }) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-2 space-y-4 shadow-2xl overflow-hidden">
        <div className="flex justify-between items-center px-6 pt-4 print:hidden">
          <span className="text-xs font-bold text-slate-500">Certificate Preview (Press Print for Hard Copy)</span>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition flex items-center space-x-1.5 shadow-md"
            >
              <Printer className="w-4 h-4" />
              <span>Print Hard-Copy Certificate</span>
            </button>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 font-bold text-lg">✕</button>
          </div>
        </div>

        <div className="p-8 sm:p-12 border-8 border-double border-amber-500 rounded-2xl bg-gradient-to-b from-amber-50/40 via-white to-amber-50/20 text-center space-y-6 relative print:p-8 print:border-4">
          <div className="absolute top-3 left-3 text-2xl text-amber-500">🎓</div>
          <div className="absolute top-3 right-3 text-2xl text-amber-500">🏆</div>
          <div className="absolute bottom-3 left-3 text-2xl text-amber-500">⭐</div>
          <div className="absolute bottom-3 right-3 text-2xl text-amber-500">📜</div>

          <div className="space-y-1">
            <p className="text-xs font-black tracking-widest uppercase text-amber-800">EduSpark IQ Academic Excellence Award</p>
            <h1 className="text-3xl sm:text-4xl font-serif font-black text-slate-900 tracking-tight">Certificate of Achievement</h1>
            <div className="w-24 h-1 bg-amber-500 mx-auto rounded-full mt-2"></div>
          </div>

          <div className="space-y-2 py-2">
            <p className="text-xs text-slate-500 font-medium italic">This certificate is proudly awarded to</p>
            <h2 className="text-2xl sm:text-3xl font-black text-indigo-900 underline decoration-amber-400 decoration-2 underline-offset-8">
              {student.full_name}
            </h2>
            <p className="text-xs font-mono text-slate-500 pt-1">
              Student Index No: <span className="font-bold text-slate-700">{student.index_number || 'STU-2026-N/A'}</span> • Grade {student.grade}
            </p>
          </div>

          <div className="max-w-lg mx-auto bg-white/80 border border-amber-200 p-4 rounded-2xl text-xs text-slate-700 leading-relaxed shadow-xs">
            For outstanding academic dedication, conceptual mastery, and exceptional performance in <span className="font-bold text-amber-900">{subject}</span> tests and diagnostic quizzes.
          </div>

          <div className="grid grid-cols-3 gap-3 max-w-md mx-auto pt-2">
            <div className="bg-amber-100/50 p-2.5 rounded-xl border border-amber-200">
              <span className="text-[10px] text-amber-800 block font-bold">Accuracy</span>
              <span className="text-base font-black text-amber-900">{student.subjectAccuracy}%</span>
            </div>
            <div className="bg-indigo-100/50 p-2.5 rounded-xl border border-indigo-200">
              <span className="text-[10px] text-indigo-800 block font-bold">Tests Completed</span>
              <span className="text-base font-black text-indigo-900">{student.subjectQuizzesDone}</span>
            </div>
            <div className="bg-emerald-100/50 p-2.5 rounded-xl border border-emerald-200">
              <span className="text-[10px] text-emerald-800 block font-bold">Predicted Grade</span>
              <span className="text-base font-black text-emerald-900">{student.subjectGrade}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-200 max-w-lg mx-auto text-xs">
            <div className="text-center space-y-1">
              <div className="h-8 border-b border-slate-400 max-w-[140px] mx-auto"></div>
              <p className="font-bold text-slate-800 pt-1">{subject} Subject Lead</p>
              <p className="text-[10px] text-slate-400">Teacher Signature</p>
            </div>
            <div className="text-center space-y-1">
              <div className="h-8 flex items-end justify-center font-mono font-bold text-slate-700 border-b border-slate-400 max-w-[140px] mx-auto">
                {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
              </div>
              <p className="font-bold text-slate-800 pt-1">Date of Award</p>
              <p className="text-[10px] text-slate-400">School Portal Verification</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Live Teacher Student Quiz Tracker Component ---
function TeacherStudentTracker({ subjects = ALL_SUBJECTS }) {
  const [selectedSubj, setSelectedSubj] = useState('Physics');
  const [selectedGradeFilter, setSelectedGradeFilter] = useState('All');
  const [studentProfiles, setStudentProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [certStudent, setCertStudent] = useState(null);

  useEffect(() => {
    fetchStudentQuizStatus();
  }, []);

  const fetchStudentQuizStatus = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'student');

      if (data) setStudentProfiles(data);
    } catch (e) {
      console.warn("Error fetching student profiles:", e);
    } finally {
      setLoading(false);
    }
  };

  const processedStudents = studentProfiles.map(s => {
    const attempts = s.challenge_attempts || [];
    const subjAttempts = attempts.filter(a => (a.subject || '').toLowerCase() === selectedSubj.toLowerCase());

    let totalScore = 0;
    let totalQuestions = 0;
    subjAttempts.forEach(a => {
      totalScore += a.score || 0;
      totalQuestions += a.total || 0;
    });

    const accuracy = totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0;
    
    let grade = 'N/A';
    if (subjAttempts.length > 0) {
      if (accuracy >= 85) grade = 'A*';
      else if (accuracy >= 75) grade = 'A';
      else if (accuracy >= 65) grade = 'B';
      else if (accuracy >= 50) grade = 'C';
      else grade = 'D';
    }

    return {
      ...s,
      subjectQuizzesDone: subjAttempts.length,
      subjectAccuracy: accuracy,
      subjectMarks: `${totalScore}/${totalQuestions}`,
      subjectGrade: grade
    };
  })
  .filter(s => selectedGradeFilter === 'All' || s.grade === parseInt(selectedGradeFilter))
  .sort((a, b) => b.subjectAccuracy - a.subjectAccuracy || b.subjectQuizzesDone - a.subjectQuizzesDone);

  return (
    <div className="space-y-5 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-lg font-black text-slate-900">Student Quiz Status & Stage Award Panel</h3>
          <p className="text-xs text-slate-500">Monitor quiz participation and print certificates for top performers.</p>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={selectedSubj}
            onChange={(e) => setSelectedSubj(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-indigo-700"
          >
            {subjects.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <select
            value={selectedGradeFilter}
            onChange={(e) => setSelectedGradeFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700"
          >
            <option value="All">All Grades</option>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(g => (
              <option key={g} value={g}>Grade {g}</option>
            ))}
          </select>

          <button onClick={fetchStudentQuizStatus} className="p-2 text-slate-500 hover:text-indigo-600 rounded-xl bg-slate-100">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-xs text-slate-400">Loading student records...</div>
      ) : processedStudents.length === 0 ? (
        <div className="text-center py-8 text-xs text-slate-400">No students found matching current filters.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                <th className="py-2.5 px-3">Rank</th>
                <th className="py-2.5 px-3">Student Name</th>
                <th className="py-2.5 px-3">Index #</th>
                <th className="py-2.5 px-3">Grade</th>
                <th className="py-2.5 px-3 text-center">Quizzes Done</th>
                <th className="py-2.5 px-3 text-center">Accuracy</th>
                <th className="py-2.5 px-3 text-center">Predicted Grade</th>
                <th className="py-2.5 px-3 text-right">Certificate Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {processedStudents.map((s, idx) => (
                <tr key={s.id || idx} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-3 font-bold text-slate-500">
                    {idx === 0 ? '🥇 1st' : idx === 1 ? '🥈 2nd' : idx === 2 ? '🥉 3rd' : `#${idx + 1}`}
                  </td>
                  <td className="py-3 px-3 font-bold text-slate-900">{s.full_name || 'Student'}</td>
                  <td className="py-3 px-3 font-mono text-slate-500">{s.index_number || 'N/A'}</td>
                  <td className="py-3 px-3 font-medium text-slate-700">Grade {s.grade}</td>
                  <td className="py-3 px-3 text-center font-bold text-indigo-600">{s.subjectQuizzesDone}</td>
                  <td className="py-3 px-3 text-center font-bold text-emerald-600">{s.subjectAccuracy}%</td>
                  <td className="py-3 px-3 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-100 text-purple-800">
                      {s.subjectGrade}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => setCertStudent(s)}
                      disabled={s.subjectQuizzesDone === 0}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition flex items-center space-x-1 ml-auto ${
                        s.subjectQuizzesDone > 0
                          ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                      }`}
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>Issue Certificate</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {certStudent && (
        <PrintableCertificateModal
          student={certStudent}
          subject={selectedSubj}
          onClose={() => setCertStudent(null)}
        />
      )}
    </div>
  );
}

// --- Subject Analytics Diagnostic Card Component ---
function SubjectAnalyticsCard({ subject, attempts }) {
  const stats = generateSubjectAnalytics(subject, attempts);
  if (!stats) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-black text-slate-900">{stats.subject} Performance Summary</h3>
            {stats.isCompleteReportUnlocked ? (
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                ✓ 10-Quiz Diagnostic Complete
              </span>
            ) : (
              <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full">
                Progress: {stats.completedCount}/10 Quizzes
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Performance profile based on completed quiz attempts.</p>
        </div>

        <div className={`px-4 py-2 rounded-2xl border text-center font-black ${stats.gradeBg}`}>
          <span className="text-[10px] block text-slate-400 font-bold uppercase">Predicted Grade</span>
          <span className={`text-2xl ${stats.gradeColor}`}>{stats.predictedGrade}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-50 p-3 rounded-2xl border text-center">
          <span className="text-[10px] font-bold text-slate-400 block">Overall Accuracy</span>
          <span className="text-xl font-black text-slate-900">{stats.accuracy}%</span>
        </div>
        <div className="bg-slate-50 p-3 rounded-2xl border text-center">
          <span className="text-[10px] font-bold text-slate-400 block">Avg Time / Question</span>
          <span className="text-xl font-black text-indigo-600">{stats.avgSecondsPerQ}s</span>
        </div>
        <div className="bg-slate-50 p-3 rounded-2xl border text-center">
          <span className="text-[10px] font-bold text-slate-400 block">Total Marks</span>
          <span className="text-xl font-black text-emerald-600">{stats.totalScore}/{stats.totalQuestions}</span>
        </div>
      </div>

      {!stats.isCompleteReportUnlocked && (
        <div className="space-y-1.5 bg-amber-50/60 p-3 rounded-2xl border border-amber-200/60">
          <div className="flex justify-between text-xs font-bold text-amber-900">
            <span>Complete 10 quizzes for full diagnostic report</span>
            <span>{stats.completedCount} / 10 Quizzes</span>
          </div>
          <div className="w-full bg-amber-200/50 h-2 rounded-full overflow-hidden">
            <div
              className="bg-amber-500 h-full transition-all duration-500"
              style={{ width: `${(stats.completedCount / 10) * 100}%` }}
            ></div>
          </div>
        </div>
      )}

      <div className="bg-slate-50 p-3 rounded-xl text-xs font-semibold text-slate-700 border">
        {stats.trendMessage}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-emerald-50/50 border border-emerald-200/60 rounded-2xl p-4 space-y-2">
          <h4 className="text-xs font-black text-emerald-800">👍 Areas Good (Strengths)</h4>
          <ul className="text-xs text-emerald-900 space-y-1 list-disc list-inside font-medium">
            {stats.strengths.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </div>

        <div className="bg-rose-50/50 border border-rose-200/60 rounded-2xl p-4 space-y-2">
          <h4 className="text-xs font-black text-rose-800">🎯 Areas Needing Improvement</h4>
          <ul className="text-xs text-rose-900 space-y-1 list-disc list-inside font-medium">
            {stats.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
          </ul>
        </div>
      </div>
    </div>
  );
}

// --- Initial Datasets ---
const INITIAL_SHOP_ITEMS = [
  { id: 'item_1', name: 'Homework Waiver Pass', category: 'Privilege', cost: 300, icon: '🎟️', desc: '1 homework waiver card approved by your class teacher.' },
  { id: 'item_2', name: 'Golden Profile Border', category: 'Digital Perk', cost: 150, icon: '👑', desc: 'Custom shiny gold frame around your avatar on the leaderboard.' },
  { id: 'item_3', name: '24h Double XP Booster', category: 'Booster', cost: 200, icon: '⚡', desc: 'Earn 2x XP for all quizzes and library reading completed today.' }
];

const INITIAL_BOOKS = [
  {
    id: 'book_dhivehi_1',
    title: 'ދިވެހިބަހުގެ ގަވާއިދު',
    subject: 'Dhivehi',
    author: 'އަލްއުސްތާޛު މުޙައްމަދު ޖަމީލު',
    cover_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    summary: 'ދިވެހިބަހުގެ އަސާސީ ގަވާއިދުތަކާއި ތާނައަކުރުތަކުގެ ބޭނުންކުރާނެ ގޮތުގެ ތަފްޞީލު.',
    extract: 'ފުރަތަމަ ބާބު: ތާނަ އަކުރު... ދިވެހިބަހުން ލިޔުމަށް ބޭނުންކުރަނީ ތާނައަކުރެވެ. ތާނައަކުރުގައި ހިމެނެނީ 24 އަކުރާއި 11 ޒަވިޔަން އަކުރެވެ.',
    pages: [
      "ފުރަތަމަ ބާބު: ތާނަ އަކުރު\n\nދިވެހިބަހުން ލިޔުމަށް ބޭނުންކުރަނީ ތާނައަކުރެވެ. ތާނައަކުރުގައި ހިމެނެނީ 24 އަކުރާއި 11 ޒަވިޔަން އަކުރެވެ.\n\nއަސާސީ އަކުރުތަކަކީ: ހަ، ށަ، ނު، ރަ، ބަ، ޅަ، ކަ، އަ، ވު، މު، ފަ، ދު، ތަ، ލަ، ގަ، ޏަ، ސަ، ޑަ، ޒަ، ޓަ، ޔަ، ޕަ، ޖަ، ޗަ އެވެ.",
      "ދެވަނަ ބާބު: ފިލި\n\nތާނައިގައި 10 ފިލި ބޭނުންކުރެވެއެވެ. އެއީ:\n1. އަބަފިލި (ަ)\n2. އާބަފިލި (ާ)\n3. އިބަފިލި (ި)\n4. އީބަފިލި (ީ)\n5. އުބަފިލި (ު)\n6. އޫބަފިލި (ޫ)\n7. އެބަފިލި (ެ)\n8. އޭބަފިލި (ޭ)\n9. އޮބަފިލި (ޮ)\n10. އޯބަފިލި (ޯ)"
    ]
  },
  {
    id: 'book_islam_1',
    title: 'އިސްލާމީ ތަރުބިޔަތު',
    subject: 'Islam',
    author: 'މިނިސްޓްރީ އޮފް އެޑިޔުކޭޝަން',
    cover_url: 'https://images.unsplash.com/photo-1585036156171-384164a8c675?auto=format&fit=crop&w=600&q=80',
    summary: 'އީމާންކަމުގެ އަސާސްތަކާއި އަޚްލާޤީ މިންގަނޑުތައް.',
    extract: 'ފުރަތަމަ ފިލާވަޅު: އީމާންކަމުގެ އަރުކާންތައް... އީމާންކަމުގެ އަރުކާނަކީ 6 ކަމެކެވެ. 1. ﷲ އަށް އީމާންވުން...',
    pages: [
      "ފުރަތަމަ ފިލާވަޅު: އީމާންކަމުގެ އަރުކާންތައް\n\nއީމާންކަމުގެ އަރުކާނަކީ 6 ކަމެކެވެ.\n\n1. ﷲ އަށް އީމާންވުން\n2. މަލާއިކަތުންނަށް އީމާންވުން\n3. ފޮތްތަކަށް އީމާންވުން\n4. ރަސޫލުންނަށް އީމާންވުން\n5. އާޚިރަތް ދުވަހަށް އީމާންވުން\n6. ޤަދަރު މިންވަރަށް އީމާންވުން"
    ]
  },
  {
    id: 'book_1',
    title: 'Physics in Everyday Life',
    subject: 'Physics',
    author: 'Dr. Marcus Vance',
    cover_url: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?auto=format&fit=crop&w=600&q=80',
    summary: 'Explore forces, energy, gravity, thermodynamics, and electromagnetism.',
    extract: 'CHAPTER 1: THE LAWS OF MOTION — Physics is the fundamental science that seeks to understand how the universe behaves...',
    pages: [
      "CHAPTER 1: THE LAWS OF MOTION\n\nPhysics is the fundamental science that seeks to understand how the universe behaves. Isaac Newton formulated three foundational principles known as Newton's Laws of Motion."
    ]
  }
];

const INITIAL_BADGES = [
  { id: 'b1', title: 'First Step', desc: 'Completed your first quiz or reading log.', icon: '🎯', minQuizzes: 1, minBooks: 0, minXp: 0, minCoins: 0, minStreak: 0 },
  { id: 'b2', title: 'Bookworm', desc: 'Read at least 3 books or 30+ reading minutes.', icon: '📚', minQuizzes: 0, minBooks: 3, minXp: 0, minCoins: 0, minStreak: 0 },
  { id: 'b3', title: 'Academic Master', desc: 'Reached Master rank (1,200+ XP).', icon: '🏆', minQuizzes: 0, minBooks: 0, minXp: 1200, minCoins: 0, minStreak: 0 }
];

const INITIAL_QUIZZES = [
  {
    id: 'olevel_1',
    title: 'Cambridge O-Level Physics 0625 - Mechanics & Motion',
    subject: 'Physics',
    grade: 10,
    subject_code: '0625',
    exam_year: 2024,
    variant: 'Paper 12',
    is_past_paper: true,
    questions: [
      {
        id: 'q1_1',
        question_text: 'A car accelerates uniformly from rest to a velocity of 20 m/s in 5 seconds. What is its acceleration?',
        option_a: '2 m/s²', option_b: '4 m/s²', option_c: '5 m/s²', option_d: '100 m/s²',
        correct_option: 'B', explanation: 'Acceleration a = (v - u) / t = (20 - 0) / 5 = 4 m/s².'
      }
    ]
  },
  {
    id: 'olevel_2',
    title: 'Cambridge O-Level Computer Science 2210 - Algorithms',
    subject: 'Computer Science',
    grade: 10,
    subject_code: '2210',
    exam_year: 2024,
    variant: 'Paper 21',
    is_past_paper: true,
    questions: [
      {
        id: 'q2_1',
        question_text: 'Which data structure operates on a First-In, First-Out (FIFO) basis?',
        option_a: 'Stack', option_b: 'Queue', option_c: 'Array', option_d: 'Tree',
        correct_option: 'B', explanation: 'Queues process items in the order they arrive (FIFO).'
      }
    ]
  },
  {
    id: 'g7_math_1',
    title: 'Grade 7 Mathematics - Algebraic Expressions',
    subject: 'Maths',
    grade: 7,
    is_past_paper: false,
    questions: [
      {
        id: 'q7_1',
        question_text: 'Simplify: 3x + 5x - 2x',
        option_a: '6x', option_b: '10x', option_c: '8x', option_d: '4x',
        correct_option: 'A', explanation: '(3 + 5 - 2)x = 6x.'
      }
    ]
  }
];

// --- Daily Quiz of the Day Teaser Question ---
const DAILY_QUIZ_QUESTION = {
  subject: 'Physics & Dhivehi Special',
  title: 'Quiz of the Day (2026 Academic Edition)',
  question_text: 'An object is dropped from a height. Ignoring air resistance, what remains CONSTANT as it falls?',
  option_a: 'Its kinetic energy',
  option_b: 'Its speed',
  option_c: 'Its gravitational acceleration (g)',
  option_d: 'Its potential energy',
  correct_option: 'C',
  explanation: 'Near Earth\'s surface, acceleration due to gravity (g = 9.8 m/s²) remains constant while speed increases.'
};

export default function App() {
  // --- Auth State ---
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('student');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [indexNumber, setIndexNumber] = useState('');
  const [teacherPasscode, setTeacherPasscode] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authTab, setAuthTab] = useState('signin'); // 'signin' or 'register'

  // --- Landing Page Interactive "Quiz of the Day" State ---
  const [landingAnswer, setLandingAnswer] = useState(null);
  const [landingSubmitted, setLandingSubmitted] = useState(false);

  // --- Student Stats ---
  const [studentGrade, setStudentGrade] = useState(7);
  const [coins, setCoins] = useState(150);
  const [xp, setXp] = useState(240);
  const [streak, setStreak] = useState(1);
  const [quizzesCompleted, setQuizzesCompleted] = useState(0);
  const [booksRead, setBooksRead] = useState(0);
  const [readingMinutes, setReadingMinutes] = useState(0);
  const [claimedRewards, setClaimedRewards] = useState([]);
  const [activityLog, setActivityLog] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');

  // --- Subject Analytics & Challenge Tracking ---
  const [completedChallenges, setCompletedChallenges] = useState([]);
  const [challengeAttempts, setChallengeAttempts] = useState([]);
  const [completedBookIds, setCompletedBookIds] = useState([]);

  // --- Dynamic Collections ---
  const [quizzes, setQuizzes] = useState(INITIAL_QUIZZES);
  const [books, setBooks] = useState(INITIAL_BOOKS);
  const [shopItems, setShopItems] = useState(INITIAL_SHOP_ITEMS);
  const [badges, setBadges] = useState(INITIAL_BADGES);
  const [leaderboardUsers, setLeaderboardUsers] = useState([]);

  // --- E-Library State & Mobile Easy Reader Controls ---
  const [bookBatchIndex, setBookBatchIndex] = useState(0);
  const [selectedBook, setSelectedBook] = useState(null);
  const [bookPageIndex, setBookPageIndex] = useState(0);
  const [readerFontSize, setReaderFontSize] = useState('base');
  const [readerTheme, setReaderTheme] = useState('light');
  const [isFullScreenReader, setIsFullScreenReader] = useState(false);

  // --- Global Filter State ---
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // --- Quiz Runner State ---
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [quizMode, setQuizMode] = useState('practice');
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [hearts, setHearts] = useState(5);
  const [timer, setTimer] = useState(60);
  const [quizFinished, setQuizFinished] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  // --- Admin / Studio State ---
  const [targetArena, setTargetArena] = useState('olevel');
  const [studioGrade, setStudioGrade] = useState(7);
  const [studioSubject, setStudioSubject] = useState('Maths');
  const [studioSubjectCode, setStudioSubjectCode] = useState('0580');
  const [studioYear, setStudioYear] = useState('2024');
  const [studioVariant, setStudioVariant] = useState('Paper 22');
  const [jsonInputText, setJsonInputText] = useState(`[
  {
    "question_text": "What is the capital of Japan?",
    "option_a": "Beijing",
    "option_b": "Tokyo",
    "option_c": "Seoul",
    "option_d": "Bangkok",
    "correct_option": "B",
    "explanation": "Tokyo is the capital city of Japan."
  }
]`);
  const [studioMsg, setStudioMsg] = useState({ type: '', text: '' });

  // --- Admin CRUD Center State ---
  const [adminTab, setAdminTab] = useState('books');
  const [editingBook, setEditingBook] = useState(null);
  const [bookForm, setBookForm] = useState({ title: '', author: '', subject: 'Dhivehi', cover_url: '', summary: '', extract: '', pageText: '' });

  const [editingPrize, setEditingPrize] = useState(null);
  const [prizeForm, setPrizeForm] = useState({ name: '', category: 'Privilege', cost: 200, icon: '🎁', desc: '' });

  const [editingBadge, setEditingBadge] = useState(null);
  const [badgeForm, setBadgeForm] = useState({ title: '', desc: '', icon: '🏅', minQuizzes: 0, minBooks: 0, minXp: 0, minCoins: 0, minStreak: 0 });

  const [editingQuiz, setEditingQuiz] = useState(null);
  const [quizForm, setQuizForm] = useState({ title: '', subject: 'Maths', grade: 7, subject_code: '', exam_year: 2024, variant: 'Paper 12', is_past_paper: false });

  // --- Navigation & History Routing ---
  const navigateToTab = (tabName) => {
    setActiveQuiz(null);
    setSelectedBook(null);
    setIsFullScreenReader(false);
    setActiveTab(tabName);
    setSelectedSubject('All');
    window.history.pushState({ tab: tabName }, '', `#${tabName}`);
  };

  useEffect(() => {
    window.history.replaceState({ tab: activeTab }, '', `#${activeTab}`);

    const handlePopState = (e) => {
      if (selectedBook) {
        setSelectedBook(null);
        setIsFullScreenReader(false);
        return;
      }
      if (activeQuiz) {
        setActiveQuiz(null);
        return;
      }
      if (e.state && e.state.tab) {
        setActiveTab(e.state.tab);
      } else {
        setActiveTab('dashboard');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [activeQuiz, selectedBook, activeTab]);

  // --- Supabase Session Sync ---
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchUserProfile(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        fetchUserProfile(session.user.id);
      } else {
        setUser(null);
      }
    });

    fetchDatabaseQuizzes();
    fetchDatabaseBooks();
    fetchDatabaseShop();
    fetchDatabaseBadges();
    fetchLeaderboard();

    return () => subscription.unsubscribe();
  }, []);

  // --- Database Fetchers ---
  const fetchDatabaseQuizzes = async () => {
    try {
      const { data } = await supabase.from('quizzes').select('*').order('created_at', { ascending: false });
      if (data && data.length > 0) {
        const formatted = data.map(q => ({
          ...q,
          questions: typeof q.questions === 'string' ? JSON.parse(q.questions) : q.questions,
          is_past_paper: q.is_past_paper === true || q.is_past_paper === 'true'
        }));
        const dbIds = new Set(formatted.map(q => q.id));
        setQuizzes([...formatted, ...INITIAL_QUIZZES.filter(q => !dbIds.has(q.id))]);
      }
    } catch (e) { console.warn("Quizzes fetch error:", e); }
  };

  const fetchDatabaseBooks = async () => {
    try {
      const { data } = await supabase.from('books').select('*').order('created_at', { ascending: false });
      if (data && data.length > 0) {
        const formatted = data.map(b => ({
          ...b,
          pages: typeof b.pages === 'string' ? JSON.parse(b.pages) : b.pages
        }));
        const dbIds = new Set(formatted.map(b => b.id));
        setBooks([...formatted, ...INITIAL_BOOKS.filter(b => !dbIds.has(b.id))]);
      }
    } catch (e) { console.warn("Books fetch error:", e); }
  };

  const fetchDatabaseShop = async () => {
    try {
      const { data } = await supabase.from('shop_items').select('*').order('created_at', { ascending: false });
      if (data && data.length > 0) {
        const dbIds = new Set(data.map(i => i.id));
        setShopItems([...data, ...INITIAL_SHOP_ITEMS.filter(i => !dbIds.has(i.id))]);
      }
    } catch (e) { console.warn("Shop fetch error:", e); }
  };

  const fetchDatabaseBadges = async () => {
    try {
      const { data } = await supabase.from('badges').select('*').order('created_at', { ascending: false });
      if (data && data.length > 0) {
        const dbIds = new Set(data.map(b => b.id));
        setBadges([...data, ...INITIAL_BADGES.filter(b => !dbIds.has(b.id))]);
      }
    } catch (e) { console.warn("Badges fetch error:", e); }
  };

  const fetchUserProfile = async (userId) => {
    try {
      const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (data) {
        setAuthName(data.full_name || 'User');
        setIndexNumber(data.index_number || 'STU-2026-0000');
        setRole(data.role || 'student');
        setStudentGrade(data.grade || 7);
        setCoins(data.coins ?? 150);
        setXp(data.xp ?? 240);
        setStreak(data.streak ?? 1);
        setQuizzesCompleted(data.quizzes_completed ?? 0);
        setBooksRead(data.books_read ?? 0);
        setReadingMinutes(data.reading_minutes ?? 0);
        setClaimedRewards(data.claimed_rewards || []);
        setActivityLog(data.activity_log || []);
        setCompletedChallenges(data.completed_challenges || []);
        setChallengeAttempts(data.challenge_attempts || []);
        setCompletedBookIds(data.completed_book_ids || []);
      }
    } catch (e) { console.warn("Profile fetch error:", e); }
    fetchLeaderboard();
  };

  const syncProfileToSupabase = async (updates) => {
    if (!user) return;
    try {
      await supabase.from('profiles').upsert({
        id: user.id,
        full_name: authName,
        index_number: indexNumber,
        role: role,
        grade: studentGrade,
        coins: updates.coins ?? coins,
        xp: updates.xp ?? xp,
        streak: updates.streak ?? streak,
        quizzes_completed: updates.quizzes_completed ?? quizzesCompleted,
        books_read: updates.books_read ?? booksRead,
        reading_minutes: updates.reading_minutes ?? readingMinutes,
        claimed_rewards: updates.claimed_rewards ?? claimedRewards,
        activity_log: updates.activity_log ?? activityLog,
        completed_challenges: updates.completed_challenges ?? completedChallenges,
        challenge_attempts: updates.challenge_attempts ?? challengeAttempts,
        completed_book_ids: updates.completed_book_ids ?? completedBookIds,
        updated_at: new Date().toISOString()
      });
      fetchLeaderboard();
    } catch (e) { console.warn("Profile sync error:", e); }
  };

  const fetchLeaderboard = async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('full_name, index_number, grade, xp, streak, coins, books_read, quizzes_completed')
        .order('xp', { ascending: false })
        .limit(10);
      if (data) setLeaderboardUsers(data);
    } catch (e) { console.warn("Leaderboard error:", e); }
  };

  // --- Auth Handlers ---
  const handleAuth = async (isSignUp) => {
    if (!authEmail || !authPassword) return alert('Please enter email and password.');
    setAuthLoading(true);

    try {
      let finalAssignedRole = 'student';
      if (isSignUp) {
        if (!authName.trim()) throw new Error('Please enter your full name.');
        if (role === 'teacher' || role === 'admin') {
          if (!teacherPasscode.trim()) throw new Error('Secret Passcode required for Teacher/Admin registration.');
          const { data: settingData } = await supabase.from('app_settings').select('value').eq('key', 'teacher_passcode').single();
          const validPasscode = settingData?.value || 'SCH-TEACHER-2026';
          if (teacherPasscode.trim() !== validPasscode) throw new Error('Invalid Secret Passcode!');
          finalAssignedRole = role;
        }

        const { data, error } = await supabase.auth.signUp({
          email: authEmail,
          password: authPassword,
          options: {
            data: { full_name: authName, index_number: role === 'student' ? indexNumber : `STAFF-${Math.floor(100 + Math.random() * 900)}`, role: finalAssignedRole, grade: studentGrade }
          }
        });
        if (error) throw error;
        if (data?.user) {
          await supabase.from('profiles').insert([{
            id: data.user.id, full_name: authName, index_number: role === 'student' ? indexNumber : `STAFF-${Math.floor(100 + Math.random() * 900)}`,
            role: finalAssignedRole, grade: studentGrade, coins: 150, xp: 240, streak: 1, quizzes_completed: 0, books_read: 0, reading_minutes: 0,
            claimed_rewards: [], activity_log: [{ id: 'init_1', title: `Registered as ${finalAssignedRole.toUpperCase()}`, date: 'Just now' }],
            completed_challenges: [], challenge_attempts: [], completed_book_ids: []
          }]);
        }
        alert(`Registered as ${finalAssignedRole.toUpperCase()}! Logging in...`);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword });
        if (error) throw error;
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setActiveQuiz(null);
  };

  // --- Quiz Runner Engine ---
  useEffect(() => {
    let interval = null;
    if (activeQuiz && quizMode === 'challenge' && !quizFinished && !gameOver && !showExplanation && timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    } else if (timer === 0 && activeQuiz && !quizFinished && !gameOver && !showExplanation) {
      handleAnswerSubmit(null);
    }
    return () => clearInterval(interval);
  }, [activeQuiz, quizMode, quizFinished, gameOver, showExplanation, timer]);

  const startQuiz = (quiz, mode) => {
    if (mode === 'challenge' && completedChallenges.includes(quiz.id)) {
      alert("⚠️ You have already completed Challenge Mode for this test! You can continue practicing in Practice Mode.");
      return;
    }

    const duration = getQuizTimeLimit(quiz);

    setActiveQuiz(quiz);
    setQuizMode(mode);
    setCurrentQuestionIdx(0);
    setSelectedOption(null);
    setShowExplanation(false);
    setScore(0);
    setHearts(5);
    setTimer(duration);
    setQuizFinished(false);
    setGameOver(false);

    window.history.pushState({ quizId: quiz.id }, '', `#quiz-${quiz.id}`);
  };

  const openBookModal = (book) => {
    setSelectedBook(book);
    setBookPageIndex(0);
    setIsFullScreenReader(false);
    window.history.pushState({ bookId: book.id }, '', `#book-${book.id}`);
  };

  const handleAnswerSubmit = (option) => {
    if (selectedOption !== null && showExplanation) return;

    const currentQ = activeQuiz.questions[currentQuestionIdx];
    const isCorrect = option === currentQ.correct_option;
    setSelectedOption(option);
    setShowExplanation(true);

    if (isCorrect) {
      playSound('correct');
      setScore(s => s + 1);
    } else {
      playSound('wrong');
      if (quizMode === 'challenge') {
        const remainingHearts = hearts - 1;
        setHearts(remainingHearts);
        if (remainingHearts <= 0) {
          setGameOver(true);
        }
      }
    }
  };

  const nextQuestion = () => {
    setSelectedOption(null);
    setShowExplanation(false);
    
    const duration = getQuizTimeLimit(activeQuiz);
    setTimer(duration);

    if (currentQuestionIdx + 1 < activeQuiz.questions.length) {
      setCurrentQuestionIdx(idx => idx + 1);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    setQuizFinished(true);
    playSound('coin');
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });

    const coinsEarned = score * 15;
    const xpEarned = score * 30;
    const newCoins = coins + coinsEarned;
    const newXp = xp + xpEarned;
    const newQuizzesCount = quizzesCompleted + 1;

    let updatedCompletedChallenges = completedChallenges;
    let updatedChallengeAttempts = challengeAttempts;

    if (quizMode === 'challenge' && activeQuiz) {
      if (!completedChallenges.includes(activeQuiz.id)) {
        updatedCompletedChallenges = [...completedChallenges, activeQuiz.id];
      }
      
      const totalQ = activeQuiz.questions.length;
      const initialLimit = getQuizTimeLimit(activeQuiz);
      const estTimePerQ = Math.max(10, initialLimit - timer);

      const attemptRecord = {
        quizId: activeQuiz.id,
        quizTitle: activeQuiz.title,
        subject: activeQuiz.subject || 'General',
        score: score,
        total: totalQ,
        percentage: Math.round((score / totalQ) * 100),
        timeSpentSeconds: estTimePerQ * totalQ,
        date: new Date().toLocaleDateString()
      };
      
      updatedChallengeAttempts = [attemptRecord, ...challengeAttempts];
      setCompletedChallenges(updatedCompletedChallenges);
      setChallengeAttempts(updatedChallengeAttempts);
    }

    const newLog = [
      {
        id: `act_${Date.now()}`,
        title: `${quizMode === 'challenge' ? '🔥 Challenge Test' : '📖 Practice Quiz'}: ${activeQuiz.title}`,
        score: `${score}/${activeQuiz.questions.length}`,
        coinsGained: coinsEarned,
        xpGained: xpEarned,
        date: 'Just now'
      },
      ...activityLog
    ];

    setCoins(newCoins);
    setXp(newXp);
    setQuizzesCompleted(newQuizzesCount);
    setActivityLog(newLog);

    syncProfileToSupabase({
      coins: newCoins,
      xp: newXp,
      quizzes_completed: newQuizzesCount,
      activity_log: newLog,
      completed_challenges: updatedCompletedChallenges,
      challenge_attempts: updatedChallengeAttempts
    });
  };

  // --- Redeem Reward ---
  const handleRedeemReward = (item) => {
    if (coins < item.cost) return alert(`Insufficient EduCoins! You need ${item.cost - coins} more coins.`);
    if (confirm(`Redeem "${item.name}" for ${item.cost} EduCoins?`)) {
      const newCoins = coins - item.cost;
      const redemption = { id: `claimed_${Date.now()}`, name: item.name, date: new Date().toISOString().split('T')[0], code: `ES-${Math.floor(1000 + Math.random() * 9000)}` };
      const newClaimed = [redemption, ...claimedRewards];
      const newLog = [{ id: `act_${Date.now()}`, title: `Redeemed Reward: ${item.name}`, cost: item.cost, date: 'Just now' }, ...activityLog];

      setCoins(newCoins); setClaimedRewards(newClaimed); setActivityLog(newLog);
      playSound('coin'); confetti({ particleCount: 100, spread: 70 });
      syncProfileToSupabase({ coins: newCoins, claimed_rewards: newClaimed, activity_log: newLog });
    }
  };

  // --- Admin CRUD Operations ---
  const handleSaveBook = async (e) => {
    e.preventDefault();
    if (!bookForm.title || !bookForm.author || !bookForm.pageText) return alert("Please fill title, author, and chapter page text.");

    const parsedPages = bookForm.pageText.includes('---PAGE---')
      ? bookForm.pageText.split('---PAGE---').map(p => p.trim())
      : [bookForm.pageText.trim()];

    if (editingBook) {
      const updatedBook = {
        ...editingBook,
        title: bookForm.title,
        author: bookForm.author,
        subject: bookForm.subject,
        cover_url: bookForm.cover_url || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=600&q=80',
        summary: bookForm.summary,
        extract: bookForm.extract || parsedPages[0].slice(0, 120) + '...',
        pages: parsedPages
      };
      try {
        await supabase.from('books').update(updatedBook).eq('id', editingBook.id);
        setBooks(books.map(b => b.id === editingBook.id ? updatedBook : b));
        setEditingBook(null);
        alert("✅ Book updated!");
      } catch (err) { alert("Update failed: " + err.message); }
    } else {
      const newBook = {
        id: `book_${Date.now()}`,
        title: bookForm.title,
        author: bookForm.author,
        subject: bookForm.subject,
        cover_url: bookForm.cover_url || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=600&q=80',
        summary: bookForm.summary || `A book on ${bookForm.subject} by ${bookForm.author}.`,
        extract: bookForm.extract || parsedPages[0].slice(0, 120) + '...',
        pages: parsedPages
      };
      try {
        await supabase.from('books').insert([newBook]);
        setBooks([newBook, ...books]);
        alert("✅ Book created!");
      } catch (err) { alert("Create failed: " + err.message); }
    }
    setBookForm({ title: '', author: '', subject: 'Dhivehi', cover_url: '', summary: '', extract: '', pageText: '' });
  };

  const startEditBook = (book) => {
    setEditingBook(book);
    setBookForm({
      title: book.title,
      author: book.author,
      subject: book.subject,
      cover_url: book.cover_url || '',
      summary: book.summary || '',
      extract: book.extract || '',
      pageText: Array.isArray(book.pages) ? book.pages.join('\n\n---PAGE---\n\n') : book.pages
    });
  };

  const handleDeleteBook = async (id) => {
    if (confirm("Delete this book?")) {
      try { await supabase.from('books').delete().eq('id', id); } catch (e) { console.warn(e); }
      setBooks(books.filter(b => b.id !== id));
    }
  };

  const handleSavePrize = async (e) => {
    e.preventDefault();
    if (!prizeForm.name || !prizeForm.cost) return alert("Please fill prize name and cost.");

    if (editingPrize) {
      const updatedPrize = { ...editingPrize, name: prizeForm.name, category: prizeForm.category, cost: parseInt(prizeForm.cost), icon: prizeForm.icon, desc: prizeForm.desc };
      try {
        await supabase.from('shop_items').update(updatedPrize).eq('id', editingPrize.id);
        setShopItems(shopItems.map(i => i.id === editingPrize.id ? updatedPrize : i));
        setEditingPrize(null);
        alert("✅ Shop prize updated!");
      } catch (err) { alert("Update failed: " + err.message); }
    } else {
      const newPrize = { id: `item_${Date.now()}`, name: prizeForm.name, category: prizeForm.category, cost: parseInt(prizeForm.cost), icon: prizeForm.icon, desc: prizeForm.desc };
      try {
        await supabase.from('shop_items').insert([newPrize]);
        setShopItems([newPrize, ...shopItems]);
        alert("✅ Shop prize created!");
      } catch (err) { alert("Create failed: " + err.message); }
    }
    setPrizeForm({ name: '', category: 'Privilege', cost: 200, icon: '🎁', desc: '' });
  };

  const startEditPrize = (item) => {
    setEditingPrize(item);
    setPrizeForm({ name: item.name, category: item.category, cost: item.cost, icon: item.icon, desc: item.desc || '' });
  };

  const handleDeletePrize = async (id) => {
    if (confirm("Delete this shop prize?")) {
      try { await supabase.from('shop_items').delete().eq('id', id); } catch (e) { console.warn(e); }
      setShopItems(shopItems.filter(i => i.id !== id));
    }
  };

  const handleSaveBadge = async (e) => {
    e.preventDefault();
    if (!badgeForm.title || !badgeForm.desc) return alert("Please fill badge title and description.");

    const formattedBadge = {
      title: badgeForm.title,
      desc: badgeForm.desc,
      icon: badgeForm.icon || '🏅',
      min_quizzes: parseInt(badgeForm.minQuizzes) || 0,
      min_books: parseInt(badgeForm.minBooks) || 0,
      min_xp: parseInt(badgeForm.minXp) || 0,
      min_coins: parseInt(badgeForm.minCoins) || 0,
      min_streak: parseInt(badgeForm.minStreak) || 0
    };

    if (editingBadge) {
      const updated = { ...editingBadge, ...formattedBadge };
      try {
        await supabase.from('badges').update(updated).eq('id', editingBadge.id);
        setBadges(badges.map(b => b.id === editingBadge.id ? updated : b));
        setEditingBadge(null);
        alert("✅ Badge updated!");
      } catch (err) { alert("Update failed: " + err.message); }
    } else {
      const newBadge = { id: `b_${Date.now()}`, ...formattedBadge };
      try {
        await supabase.from('badges').insert([newBadge]);
        setBadges([newBadge, ...badges]);
        alert("✅ Badge created!");
      } catch (err) { alert("Create failed: " + err.message); }
    }
    setBadgeForm({ title: '', desc: '', icon: '🏅', minQuizzes: 0, minBooks: 0, minXp: 0, minCoins: 0, minStreak: 0 });
  };

  const startEditBadge = (badge) => {
    setEditingBadge(badge);
    setBadgeForm({
      title: badge.title,
      desc: badge.desc,
      icon: badge.icon || '🏅',
      minQuizzes: badge.min_quizzes || badge.minQuizzes || 0,
      minBooks: badge.min_books || badge.minBooks || 0,
      minXp: badge.min_xp || badge.minXp || 0,
      minCoins: badge.min_coins || badge.minCoins || 0,
      minStreak: badge.min_streak || badge.minStreak || 0
    });
  };

  const handleDeleteBadge = async (id) => {
    if (confirm("Delete this badge?")) {
      try { await supabase.from('badges').delete().eq('id', id); } catch (e) { console.warn(e); }
      setBadges(badges.filter(b => b.id !== id));
    }
  };

  const handleSaveQuizMetadata = async (e) => {
    e.preventDefault();
    if (!quizForm.title) return alert("Please enter a quiz title.");

    if (editingQuiz) {
      const updatedQuiz = {
        ...editingQuiz,
        title: quizForm.title,
        subject: quizForm.subject,
        grade: parseInt(quizForm.grade),
        subject_code: quizForm.subject_code,
        exam_year: parseInt(quizForm.exam_year),
        variant: quizForm.variant,
        is_past_paper: quizForm.is_past_paper
      };
      try {
        await supabase.from('quizzes').update(updatedQuiz).eq('id', editingQuiz.id);
        setQuizzes(quizzes.map(q => q.id === editingQuiz.id ? updatedQuiz : q));
        setEditingQuiz(null);
        alert("✅ Quiz updated!");
      } catch (err) { alert("Update failed: " + err.message); }
    }
  };

  const startEditQuiz = (quiz) => {
    setEditingQuiz(quiz);
    setQuizForm({
      title: quiz.title,
      subject: quiz.subject || 'Maths',
      grade: quiz.grade || 7,
      subject_code: quiz.subject_code || '',
      exam_year: quiz.exam_year || 2024,
      variant: quiz.variant || 'Paper 12',
      is_past_paper: quiz.is_past_paper === true || quiz.is_past_paper === 'true'
    });
  };

  const deleteQuiz = async (quizId) => {
    if (confirm('Delete this quiz?')) {
      try { await supabase.from('quizzes').delete().eq('id', quizId); } catch (e) { console.warn(e); }
      setQuizzes((prev) => prev.filter(q => q.id !== quizId));
    }
  };

  // --- Teacher Studio JSON Import ---
  const handleJsonImport = async () => {
    setStudioMsg({ type: '', text: '' });
    try {
      const parsed = JSON.parse(jsonInputText);
      if (!Array.isArray(parsed)) throw new Error("JSON must be an array of question objects [...]");

      const formattedQuestions = parsed.map((q, idx) => ({
        id: `q_json_${Date.now()}_${idx}`,
        question_text: q.question_text || q.question || 'Question Text',
        option_a: q.option_a || (q.options ? q.options[0] : 'Option A'),
        option_b: q.option_b || (q.options ? q.options[1] : 'Option B'),
        option_c: q.option_c || (q.options ? q.options[2] : 'Option C'),
        option_d: q.option_d || (q.options ? q.options[3] : 'Option D'),
        correct_option: (q.correct_option || q.answer || 'A').toUpperCase().charAt(0),
        explanation: q.explanation || 'No step-by-step explanation provided.'
      }));

      const isOLevel = targetArena === 'olevel';
      const newQuiz = {
        id: `quiz_${Date.now()}`,
        title: isOLevel
          ? `Cambridge O-Level ${studioSubject} (${studioSubjectCode}) - ${studioYear} ${studioVariant}`
          : `Grade ${studioGrade} ${studioSubject} Practice Test (${studioYear})`,
        subject: studioSubject,
        grade: isOLevel ? 10 : parseInt(studioGrade),
        subject_code: isOLevel ? studioSubjectCode : null,
        exam_year: parseInt(studioYear),
        variant: isOLevel ? studioVariant : null,
        is_past_paper: isOLevel,
        questions: formattedQuestions
      };

      const { error } = await supabase.from('quizzes').insert([newQuiz]);
      if (error) throw error;

      setQuizzes((prev) => [newQuiz, ...prev]);
      setStudioMsg({ type: 'success', text: `✅ Saved quiz with ${formattedQuestions.length} questions to database!` });
    } catch (err) {
      setStudioMsg({ type: 'error', text: `Failed to save quiz: ${err.message}` });
    }
  };

  // --- Filtered Datasets ---
  const gradePracticeQuizzes = quizzes.filter(q => {
    const isGradeMatch = q.grade === parseInt(studentGrade);
    const isNotPastPaper = !q.is_past_paper;
    const isSubjectMatch = selectedSubject === 'All' || q.subject === selectedSubject;
    const matchesSearch = (q.title || '').toLowerCase().includes(searchQuery.toLowerCase());
    return isGradeMatch && isNotPastPaper && isSubjectMatch && matchesSearch;
  });

  const oLevelQuizzes = quizzes.filter(q => {
    const matchesSearch = (q.title || '').toLowerCase().includes(searchQuery.toLowerCase());
    const isSubjectMatch = selectedSubject === 'All' || q.subject === selectedSubject;
    const isPast = q.is_past_paper === true || q.is_past_paper === 'true';
    return isPast && matchesSearch && isSubjectMatch;
  });

  const filteredLibraryBooks = books.filter(b => selectedSubject === 'All' || b.subject === selectedSubject);
  const currentBookBatch = filteredLibraryBooks.slice(bookBatchIndex * 3, (bookBatchIndex * 3) + 3);

  const rotateBookBatch = () => {
    const totalBatches = Math.ceil(filteredLibraryBooks.length / 3) || 1;
    setBookBatchIndex((prev) => (prev + 1) % totalBatches);
  };

  const currentRank = getStudentRank(xp);

  // =========================================================================
  // 🌟 ELEGANT PUBLIC LANDING & LOGIN PAGE (WHEN !USER)
  // =========================================================================
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
        {/* LANDING NAVIGATION BAR */}
        <header className="border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 via-purple-500 to-amber-400 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xl font-black tracking-tight text-white">
                  EduSpark <span className="text-indigo-400">IQ</span>
                </span>
                <span className="hidden sm:inline-block text-[10px] bg-indigo-950 text-indigo-300 font-bold px-2 py-0.5 rounded-md ml-2 border border-indigo-800/50">
                  2026 Academic Edition
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <a href="#daily-quiz" className="hidden md:inline-block text-xs font-bold text-slate-300 hover:text-white transition">
                ⚡ Quiz of the Day
              </a>
              <a href="#books-showcase" className="hidden md:inline-block text-xs font-bold text-slate-300 hover:text-white transition">
                📚 Books of the Week
              </a>
              <a
                href="#auth-section"
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-md shadow-indigo-600/30 flex items-center space-x-1.5"
              >
                <span>Student / Staff Login</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </header>

        {/* HERO SECTION WITH EMBEDDED LOGIN/REGISTER CARD */}
        <section className="relative overflow-hidden py-12 lg:py-20 px-4 sm:px-6 max-w-7xl mx-auto w-full">
          {/* Background Ambient Glows */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none"></div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* HERO LEFT TEXT & INFOGRAPHICS */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 bg-indigo-950/80 border border-indigo-800/60 px-3.5 py-1.5 rounded-full text-xs font-bold text-indigo-300">
                <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
                <span>Maldives Premier Student E-Portal & Dhivehi Library</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
                Empowering Students with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-amber-300">Interactive Intelligence</span>
              </h1>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Master Cambridge O-Levels and Grade 1–10 syllabus with timed quizzes, custom Faruma Thaana Dhivehi books, automatic 10-quiz performance diagnostics, and printable stage award certificates.
              </p>

              {/* LIVE PORTAL STATS INFOGRAPHIC BAR */}
              <div className="grid grid-cols-3 gap-3 pt-4 max-w-lg mx-auto lg:mx-0">
                <div className="bg-slate-800/60 border border-slate-700/60 p-3.5 rounded-2xl text-center backdrop-blur-xs">
                  <span className="text-xl sm:text-2xl font-black text-indigo-400 block">1,200+</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Active Students</span>
                </div>
                <div className="bg-slate-800/60 border border-slate-700/60 p-3.5 rounded-2xl text-center backdrop-blur-xs">
                  <span className="text-xl sm:text-2xl font-black text-amber-400 block">500+</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Exam Quizzes</span>
                </div>
                <div className="bg-slate-800/60 border border-slate-700/60 p-3.5 rounded-2xl text-center backdrop-blur-xs">
                  <span className="text-xl sm:text-2xl font-black text-emerald-400 block">🇲🇻 Faruma</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Native Dhivehi</span>
                </div>
              </div>
            </div>

            {/* HERO RIGHT: SLEEK AUTHENTICATION CARD */}
            <div id="auth-section" className="lg:col-span-5 w-full">
              <div className="bg-slate-800/90 border border-slate-700/80 p-6 sm:p-8 rounded-3xl shadow-2xl shadow-indigo-950/50 backdrop-blur-md space-y-6">
                
                {/* LOGIN / REGISTER TOGGLE TABS */}
                <div className="flex bg-slate-900/80 p-1.5 rounded-2xl border border-slate-700/60">
                  <button
                    type="button"
                    onClick={() => setAuthTab('signin')}
                    className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition ${authTab === 'signin' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                  >
                    🔑 Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthTab('register')}
                    className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition ${authTab === 'register' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                  >
                    ✨ Register Account
                  </button>
                </div>

                {/* ROLE PICKER */}
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-2">I am signing in as:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole('student')}
                      className={`py-2.5 px-3 text-xs font-bold rounded-xl border transition flex items-center justify-center space-x-1.5 ${
                        role === 'student' ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300' : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <GraduationCap className="w-4 h-4 text-indigo-400" />
                      <span>🎓 Student</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('teacher')}
                      className={`py-2.5 px-3 text-xs font-bold rounded-xl border transition flex items-center justify-center space-x-1.5 ${
                        role === 'teacher' ? 'bg-purple-600/30 border-purple-500 text-purple-300' : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4 text-purple-400" />
                      <span>👨‍🏫 Teacher / Admin</span>
                    </button>
                  </div>
                </div>

                {/* AUTH FORM INPUTS */}
                <div className="space-y-3.5">
                  {authTab === 'register' && (
                    <div>
                      <label className="text-[11px] font-bold text-slate-300 block mb-1">Full Name</label>
                      <input
                        type="text"
                        value={authName}
                        onChange={(e) => setAuthName(e.target.value)}
                        placeholder="e.g. Aminath Hassan"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                  )}

                  {role === 'student' ? (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-bold text-slate-300 block mb-1">Grade Level</label>
                        <select
                          value={studentGrade}
                          onChange={(e) => setStudentGrade(parseInt(e.target.value))}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-100 focus:outline-none"
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((g) => (
                            <option key={g} value={g}>Grade {g}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-300 block mb-1">Index Number</label>
                        <input
                          type="text"
                          value={indexNumber}
                          onChange={(e) => setIndexNumber(e.target.value)}
                          placeholder="STU-2026-104"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="bg-purple-950/60 border border-purple-800/60 p-3 rounded-2xl space-y-1.5">
                      <div className="flex items-center space-x-1.5 text-purple-300 font-bold text-xs">
                        <ShieldAlert className="w-3.5 h-3.5 text-purple-400" />
                        <span>Teacher Passcode Security</span>
                      </div>
                      <input
                        type="password"
                        value={teacherPasscode}
                        onChange={(e) => setTeacherPasscode(e.target.value)}
                        placeholder="Passcode: SCH-TEACHER-2026"
                        className="w-full bg-slate-900 border border-purple-800/80 rounded-xl px-3 py-2 text-xs font-mono text-purple-200 placeholder-slate-500 focus:outline-none"
                      />
                    </div>
                  )}

                  <div>
                    <label className="text-[11px] font-bold text-slate-300 block mb-1">Email Address</label>
                    <input
                      type="email"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      placeholder="student@school.edu.mv"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-300 block mb-1">Password</label>
                    <input
                      type="password"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAuth(authTab === 'register')}
                    disabled={authLoading}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold py-3 rounded-xl text-xs transition shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 mt-2"
                  >
                    <span>{authLoading ? 'Verifying Account...' : authTab === 'signin' ? 'Sign In to Student Portal' : 'Create Free Student Account'}</span>
                    <ArrowRight className="w-4 h-4" />