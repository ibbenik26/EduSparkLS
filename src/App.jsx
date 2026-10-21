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
  AlertTriangle, Printer, ArrowRight, Mail, HelpCircle, Eye, EyeOff,
  Package, ShoppingCart, DollarSign, PiggyBank, History, Box,
  AlertCircle, CheckCircle, UserCheck, UserX, Shield, Image as ImageIcon
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

const QUICK_EMOJIS = ['🎒', '📓', '📐', '🖍️', '🎨', '🎟️', '⚡', '🎁', '⚽', '🏆', '📱', '📚', '🧩', '🎮', '🎧', '✏️'];

// --- Strict Role Navigation Matrix ---
const ROLE_TABS = {
  student: ['dashboard', 'olevel', 'library', 'shop', 'profile'],
  teacher: ['studio', 'profile'],
  shop_admin: ['shop_management', 'profile'],
  super_admin: ['dashboard', 'olevel', 'library', 'shop', 'shop_management', 'studio', 'super_admin_console', 'profile']
};

const getDefaultTabForRole = (userRole) => {
  switch (userRole) {
    case 'teacher': return 'studio';
    case 'shop_admin': return 'shop_management';
    case 'super_admin': return 'super_admin_console';
    default: return 'dashboard';
  }
};

const isRTLSubject = (subject) => {
  return subject === 'Dhivehi' || subject === 'Islam' || subject === 'ދިވެހި' || subject === 'އިސްލާމް';
};

const getQuizTimeLimit = (quiz) => {
  if (!quiz) return 60;
  if (quiz.time_limit) return quiz.time_limit;

  const subj = (quiz.subject || '').toLowerCase();
  if (['maths', 'physics', 'chemistry', 'accounting', 'economics'].includes(subj)) {
    return 120;
  }
  return 60;
};

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

const getStudentRank = (xp) => {
  if (xp >= 2000) return { title: 'Legend', level: 5, text: 'text-amber-600', bg: 'bg-amber-100' };
  if (xp >= 1200) return { title: 'Master', level: 4, text: 'text-purple-600', bg: 'bg-purple-100' };
  if (xp >= 700)  return { title: 'Expert', level: 3, text: 'text-blue-600', bg: 'bg-blue-100' };
  if (xp >= 300)  return { title: 'Scholar', level: 2, text: 'text-emerald-600', bg: 'bg-emerald-100' };
  return { title: 'Novice', level: 1, text: 'text-slate-600', bg: 'bg-slate-100' };
};

// --- Syllabus Topic Analytics Engine ---
const generateSubjectAnalytics = (subject, attempts = []) => {
  const subjectAttempts = attempts.filter(a => (a.subject || '').toLowerCase() === subject.toLowerCase());
  const completedCount = subjectAttempts.length;

  if (completedCount === 0) return null;

  let totalScore = 0;
  let totalQuestions = 0;
  let totalTimeSeconds = 0;

  const topicStats = {};

  subjectAttempts.forEach(a => {
    totalScore += a.score || 0;
    totalQuestions += a.total || 0;
    totalTimeSeconds += a.timeSpentSeconds || (a.total * 30);

    if (a.questionDetails && Array.isArray(a.questionDetails)) {
      a.questionDetails.forEach(qd => {
        const topicName = qd.topic || qd.question_text || 'General Concept';
        if (!topicStats[topicName]) {
          topicStats[topicName] = { correct: 0, total: 0, explanations: [] };
        }
        topicStats[topicName].total += 1;
        if (qd.is_correct) {
          topicStats[topicName].correct += 1;
        } else if (qd.explanation && !topicStats[topicName].explanations.includes(qd.explanation)) {
          topicStats[topicName].explanations.push(qd.explanation);
        }
      });
    }
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

  const strongTopics = [];
  const weakTopics = [];

  Object.entries(topicStats).forEach(([topic, stat]) => {
    const topicAcc = Math.round((stat.correct / stat.total) * 100);
    if (topicAcc >= 70) {
      strongTopics.push({ topic, accuracy: topicAcc, totalAttempted: stat.total });
    } else {
      weakTopics.push({
        topic,
        accuracy: topicAcc,
        totalAttempted: stat.total,
        explanation: stat.explanations.join(' • ') || 'Needs foundational review.'
      });
    }
  });

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
    strongTopics,
    weakTopics,
    isCompleteReportUnlocked: completedCount >= 10
  };
};

// --- Printable Certificate Modal ---
function PrintableCertificateModal({ student, subject, onClose }) {
  const handlePrint = () => { window.print(); };

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
              <span>Print Certificate</span>
            </button>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 font-bold text-lg">✕</button>
          </div>
        </div>

        <div className="p-8 sm:p-12 border-8 border-double border-amber-500 rounded-2xl bg-gradient-to-b from-amber-50/40 via-white to-amber-50/20 text-center space-y-6 relative print:p-8 print:border-4">
          <div className="absolute top-3 left-3 text-2xl text-amber-500">🎓</div>
          <div className="absolute top-3 right-3 text-2xl text-amber-500">🏆</div>

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

// --- Student Topic Diagnostic Inspector Modal ---
function StudentTopicDiagnosticModal({ student, subjects = ALL_SUBJECTS, onClose }) {
  if (!student) return null;

  const attempts = student.challenge_attempts || [];

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Teacher Topic Diagnostic Inspector</span>
            <h2 className="text-xl font-black text-slate-900 mt-0.5">{student.full_name} — Syllabus Topic Breakdown</h2>
            <p className="text-xs text-slate-500 font-mono">Index No: {student.index_number || 'N/A'} • Grade {student.grade}</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 font-bold text-lg">✕</button>
        </div>

        {attempts.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            This student has not submitted any quiz challenges yet.
          </div>
        ) : (
          <div className="space-y-4">
            {subjects.map(subj => {
              const stats = generateSubjectAnalytics(subj, attempts);
              if (!stats) return null;

              return (
                <div key={subj} className="border border-slate-200 rounded-2xl p-4 bg-slate-50 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                    <h3 className="font-bold text-sm text-slate-900">{subj} Topic Report</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-black ${stats.gradeBg} ${stats.gradeColor}`}>
                      Grade: {stats.predictedGrade} ({stats.accuracy}%)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 space-y-1">
                      <h4 className="text-xs font-black text-emerald-800">👍 Syllabus Topics Mastered ({stats.strongTopics.length})</h4>
                      {stats.strongTopics.length === 0 ? (
                        <p className="text-[11px] text-emerald-700 italic">No mastered topics recorded yet.</p>
                      ) : (
                        <ul className="text-xs text-emerald-900 space-y-1">
                          {stats.strongTopics.map((st, i) => (
                            <li key={i} className="flex justify-between items-center bg-white/70 px-2 py-1 rounded-lg">
                              <span className="font-medium truncate max-w-[180px]">{st.topic}</span>
                              <span className="font-bold text-emerald-700">{st.accuracy}%</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 space-y-1">
                      <h4 className="text-xs font-black text-rose-800">🎯 Weak Topics Needing Re-teaching ({stats.weakTopics.length})</h4>
                      {stats.weakTopics.length === 0 ? (
                        <p className="text-[11px] text-rose-700 italic">No weak topics! Excellent overall performance.</p>
                      ) : (
                        <ul className="text-xs text-rose-900 space-y-1">
                          {stats.weakTopics.map((wt, i) => (
                            <li key={i} className="bg-white/70 p-2 rounded-lg space-y-0.5">
                              <div className="flex justify-between font-bold">
                                <span className="truncate max-w-[180px]">{wt.topic}</span>
                                <span className="text-rose-700">{wt.accuracy}%</span>
                              </div>
                              {wt.explanation && (
                                <p className="text-[10px] text-slate-600 italic">Syllabus Focus: {wt.explanation}</p>
                              )}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
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
  const [inspectStudent, setInspectStudent] = useState(null);

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
          <h3 className="text-lg font-black text-slate-900">Class Topic Diagnostics & Award Panel</h3>
          <p className="text-xs text-slate-500">Teachers can inspect individual student weak topics and issue certificates.</p>
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
                <th className="py-2.5 px-3 text-right">Teacher Action</th>
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
                  <td className="py-3 px-3 text-right flex items-center justify-end space-x-1.5">
                    <button
                      onClick={() => setInspectStudent(s)}
                      className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition flex items-center space-x-1"
                    >
                      <BarChart2 className="w-3.5 h-3.5" />
                      <span>Inspect Weak Topics</span>
                    </button>

                    <button
                      onClick={() => setCertStudent(s)}
                      disabled={s.subjectQuizzesDone === 0}
                      className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition flex items-center space-x-1 ${
                        s.subjectQuizzesDone > 0
                          ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                      }`}
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>Certificate</span>
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

      {inspectStudent && (
        <StudentTopicDiagnosticModal
          student={inspectStudent}
          subjects={subjects}
          onClose={() => setInspectStudent(null)}
        />
      )}
    </div>
  );
}

const INITIAL_SHOP_ITEMS = [
  { id: 'item_1', name: 'Deluxe Geometry Set', category: 'School Supplies', cost: 250, stock: 12, is_real: true, icon: '📐', desc: 'Complete metal geometry compass set for Math class.' },
  { id: 'item_2', name: 'EduSpark Branded Notebook', category: 'Stationery', cost: 180, stock: 20, is_real: true, icon: '📓', desc: 'Hardcover 200-page lined notebook.' },
  { id: 'item_3', name: 'Homework Waiver Pass', category: 'Privileges', cost: 300, stock: 50, is_real: false, icon: '🎟️', desc: '1 homework waiver card approved by your class teacher.' },
  { id: 'item_4', name: 'Color Marker Set (12 Pack)', category: 'School Supplies', cost: 200, stock: 8, is_real: true, icon: '🖍️', desc: 'Highlighter & marker dual-tip set.' },
  { id: 'item_5', name: '24h Double XP Booster', category: 'Digital Perks', cost: 150, stock: 999, is_real: false, icon: '⚡', desc: 'Earn 2x XP for all quizzes and library reading completed today.' }
];

const INITIAL_BOOKS = [
  {
    id: 'book_dhivehi_1',
    title: 'ދިވެހިބަހުގެ ގަވާއިދު',
    subject: 'Dhivehi',
    author: 'އަލްއުސްތާޛު މުޙައްމަދު ޖަމީލު',
    cover_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    summary: 'ދިވެހިބަހުގެ އަސާސީ ގަވާއިދުތަކާއި ތާނައަކުރުތަކުގެ ބޭނުންކުރާނެ ގޮތުގެ ތަފްޞީލު.',
    reading_hours: 2.5,
    claim_code: 'LIB-DHIV-01',
    pages: [
      "ފުރަތަމަ ބާބު: ތާނަ އަކުރު\n\nދިވެހިބަހުން ލިޔުމަށް ބޭނުންކުރަނީ ތާނައަކުރެވެ. ތާނައަކުރުގައި ހިމެނެނީ 24 އަކުރާއި 11 ޒަވިޔަން އަކުރެވެ.",
      "ދެވަނަ ބާބު: ފިލި\n\nތާނައިގައި 10 ފިލި ބޭނުންކުރެވެއެވެ."
    ]
  },
  {
    id: 'book_1',
    title: 'Physics in Everyday Life',
    subject: 'Physics',
    author: 'Dr. Marcus Vance',
    cover_url: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?auto=format&fit=crop&w=600&q=80',
    summary: 'Explore forces, energy, gravity, thermodynamics, and electromagnetism.',
    reading_hours: 4.0,
    claim_code: 'LIB-PHYS-101',
    pages: [
      "CHAPTER 1: THE LAWS OF MOTION\n\nPhysics is the fundamental science that seeks to understand how the universe behaves.",
      "CHAPTER 2: ENERGY & WORK\n\nEnergy cannot be created or destroyed, only transformed from one form to another."
    ]
  }
];

const INITIAL_QUIZZES = [
  {
    id: 'olevel_diagram_1',
    title: 'Cambridge O-Level Physics 0625 - Ray & Optics Diagrams',
    subject: 'Physics',
    grade: 10,
    subject_code: '0625',
    exam_year: 2024,
    variant: 'Paper 12 (Diagram Special)',
    is_past_paper: true,
    has_diagrams: true,
    time_limit: 120,
    questions: [
      {
        id: 'qd1_1',
        topic: 'Optics & Lenses',
        diagram_url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80',
        question_text: 'Study the optical ray diagram shown above. What phenomenon is represented when light passes through the boundary?',
        option_a: 'Total Internal Reflection', option_b: 'Refraction and Dispersion', option_c: 'Diffraction', option_d: 'Polarization',
        correct_option: 'B', explanation: 'The diagram illustrates refraction and color dispersion as white light passes through a glass prism.'
      },
      {
        id: 'qd1_2',
        topic: 'Vectors & Forces',
        diagram_url: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80',
        question_text: 'Based on the force vector diagram above, if $F_1 = 30\\text{ N}$ to the right and $F_2 = 10\\text{ N}$ to the left, what is the resultant force?',
        option_a: '40 N to the right', option_b: '20 N to the right', option_c: '20 N to the left', option_d: '300 N',
        correct_option: 'B', explanation: 'Resultant force $F_{\\text{net}} = 30\\text{ N} - 10\\text{ N} = 20\\text{ N}$ acting in the direction of the larger force.'
      }
    ]
  },
  {
    id: 'olevel_1',
    title: 'Cambridge O-Level Physics 0625 - Mechanics & Motion',
    subject: 'Physics',
    grade: 10,
    subject_code: '0625',
    exam_year: 2024,
    variant: 'Paper 12',
    is_past_paper: true,
    has_diagrams: false,
    time_limit: 120,
    questions: [
      {
        id: 'q1_1',
        topic: 'Kinematics & Motion',
        question_text: 'A car accelerates uniformly from rest to a velocity of $20\\text{ m/s}$ in $5\\text{ seconds}$. What is its acceleration?',
        option_a: '2 m/s²', option_b: '4 m/s²', option_c: '5 m/s²', option_d: '100 m/s²',
        correct_option: 'B', explanation: 'Acceleration $a = \\frac{v - u}{t} = \\frac{20 - 0}{5} = 4\\text{ m/s}^2$.'
      },
      {
        id: 'q1_2',
        topic: 'Forces & Energy',
        question_text: 'Which quantity is calculated by multiplying force by distance moved in the direction of the force?',
        option_a: 'Power', option_b: 'Work done', option_c: 'Pressure', option_d: 'Acceleration',
        correct_option: 'B', explanation: 'Work done $W = \\text{Force} \\times \\text{Distance}$.'
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
    variant: 'Paper 22',
    is_past_paper: true,
    has_diagrams: false,
    time_limit: 90,
    questions: [
      {
        id: 'q2_1',
        topic: 'Data Types',
        question_text: 'Which data type is best suited to store a true/false condition in pseudocode?',
        option_a: 'Integer', option_b: 'Boolean', option_c: 'String', option_d: 'Real',
        correct_option: 'B', explanation: 'A Boolean variable holds binary logical states (TRUE or FALSE).'
      }
    ]
  }
];

export default function App() {
  // --- Auth View States ---
  const [authView, setAuthView] = useState('landing');
  const [isPasswordResetFlow, setIsPasswordResetFlow] = useState(false);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('student');
  const [userStatus, setUserStatus] = useState('active');
  const [teacherSubject, setTeacherSubject] = useState('Physics');

  // Multi-Role Registration States
  const [registerRole, setRegisterRole] = useState('student');
  const [adminPasscode, setAdminPasscode] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [indexNumber, setIndexNumber] = useState('');
  const [registerSubject, setRegisterSubject] = useState('Physics');
  const [authLoading, setAuthLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Password Recovery / Password Reset Modal
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [newRecoveryPassword, setNewRecoveryPassword] = useState('');

  // Forced Password Change
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [forcedNewPassword, setForcedNewPassword] = useState('');
  const [confirmForcedPassword, setConfirmForcedPassword] = useState('');
  const [profileNewPassword, setProfileNewPassword] = useState('');

  // --- Student Metrics ---
  const [studentGrade, setStudentGrade] = useState(7);
  const [coins, setCoins] = useState(350);
  const [xp, setXp] = useState(420);
  const [readingHours, setReadingHours] = useState(5.5);

  // --- Decoupled Records ---
  const [onlineReadBookIds, setOnlineReadBookIds] = useState([]);
  const [physicalClaimedBookIds, setPhysicalClaimedBookIds] = useState([]);

  // --- Datasets ---
  const [quizzes, setQuizzes] = useState(INITIAL_QUIZZES);
  const [books, setBooks] = useState(INITIAL_BOOKS);
  const [shopItems, setShopItems] = useState(INITIAL_SHOP_ITEMS);
  const [orders, setOrders] = useState([]);
  const [allProfiles, setAllProfiles] = useState([]);

  // --- Navigation & Controls ---
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [olevelSubjectFilter, setOlevelSubjectFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // --- Live E-Reader ---
  const [selectedBook, setSelectedBook] = useState(null);
  const [bookPageIndex, setBookPageIndex] = useState(0);
  const [activeReadingSeconds, setActiveReadingSeconds] = useState(0);
  const [claimingBook, setClaimingBook] = useState(null);
  const [physicalClaimInput, setPhysicalClaimInput] = useState('');

  // --- Quiz Runner States ---
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [quizMode, setQuizMode] = useState('practice');
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [quizFinished, setQuizFinished] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  // --- Teacher Quiz Studio ---
  const [studioGrade, setStudioGrade] = useState(7);
  const [studioSubject, setStudioSubject] = useState('Physics');
  const [jsonInputText, setJsonInputText] = useState(`[
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

  // Modals
  const [showNewBookModal, setShowNewBookModal] = useState(false);
  const [newBookTitle, setNewBookTitle] = useState('');
  const [newBookAuthor, setNewBookAuthor] = useState('');
  const [newBookSubject, setNewBookSubject] = useState('Physics');
  const [newBookHours, setNewBookHours] = useState(2.0);
  const [newBookSummary, setNewBookSummary] = useState('');
  const [newBookPageText, setNewBookPageText] = useState('');

  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Stationery');
  const [newItemCost, setNewItemCost] = useState(150);
  const [newItemStock, setNewItemStock] = useState(10);
  const [newItemIcon, setNewItemIcon] = useState('📓');
  const [newItemDesc, setNewItemDesc] = useState('');

  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffPass, setNewStaffPass] = useState('Teacher2026!');
  const [newStaffSubject, setNewStaffSubject] = useState('Physics');

  // --- Automatic Role Tab Enforcer ---
  useEffect(() => {
    const allowedTabs = ROLE_TABS[role] || ROLE_TABS.student;
    if (!allowedTabs.includes(activeTab)) {
      setActiveTab(getDefaultTabForRole(role));
    }
  }, [role, activeTab]);

  const switchRolePreview = (newRole) => {
    setRole(newRole);
    setActiveTab(getDefaultTabForRole(newRole));
  };

  const navigateToTab = (tabName) => {
    const allowed = ROLE_TABS[role] || ROLE_TABS.student;
    if (!allowed.includes(tabName)) return;

    setActiveQuiz(null);
    setSelectedBook(null);
    setActiveTab(tabName);
  };

  useEffect(() => {
    if (window.location.hash && window.location.hash.includes('type=recovery')) {
      setIsPasswordResetFlow(true);
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchUserProfile(session.user);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsPasswordResetFlow(true);
      } else if (session?.user) {
        setUser(session.user);
        fetchUserProfile(session.user);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (authUser) => {
    const userId = authUser?.id;
    if (!userId) return;

    try {
      const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
      
      const metadataRole = authUser?.user_metadata?.role;
      const dbRole = data?.role;

      let effectiveRole = 'student';
      if (metadataRole && metadataRole !== 'student') {
        effectiveRole = metadataRole;
      } else if (dbRole) {
        effectiveRole = dbRole;
      }

      setAuthName(data?.full_name || authUser?.user_metadata?.full_name || 'User');
      setRole(effectiveRole);
      setUserStatus(data?.status || 'active');
      setTeacherSubject(data?.teacher_subject || authUser?.user_metadata?.teacher_subject || 'Physics');
      setStudentGrade(data?.grade || authUser?.user_metadata?.grade || 7);
      setCoins(data?.coins ?? 350);
      setXp(data?.xp ?? 420);
      setReadingHours(data?.reading_hours ?? 5.5);
      setOnlineReadBookIds(data?.online_read_book_ids || []);
      setPhysicalClaimedBookIds(data?.physical_claimed_book_ids || []);

      if (data?.must_change_password) {
        setMustChangePassword(true);
      }

      setActiveTab(getDefaultTabForRole(effectiveRole));

      if (effectiveRole === 'super_admin') {
        fetchAllProfiles();
      }
    } catch (e) {
      console.warn("Profile fetch error:", e);
    }
  };

  const fetchAllProfiles = async () => {
    try {
      const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      if (data) setAllProfiles(data);
    } catch (e) {
      console.warn("Profiles list error:", e);
    }
  };

  useEffect(() => {
    let timerInterval = null;
    if (selectedBook) {
      timerInterval = setInterval(() => {
        setActiveReadingSeconds(sec => sec + 1);
      }, 1000);
    } else {
      setActiveReadingSeconds(0);
    }
    return () => clearInterval(timerInterval);
  }, [selectedBook]);

  useEffect(() => {
    let countdownInterval = null;
    if (activeQuiz && !quizFinished && !gameOver && (quizMode === 'challenge' || quizMode === 'olevel')) {
      countdownInterval = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            clearInterval(countdownInterval);
            setGameOver(true);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(countdownInterval);
  }, [activeQuiz, quizFinished, gameOver, quizMode]);

  // Auth Handlers
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!authEmail || !authPassword) return alert('Please enter email and password.');
    setAuthLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password: authPassword
      });
      if (error) throw error;

      if (data?.user) {
        const { data: profile } = await supabase.from('profiles').select('status').eq('id', data.user.id).single();
        if (profile && profile.status === 'disabled') {
          await supabase.auth.signOut();
          setUser(null);
          alert("🔒 Account Disabled: Please contact your school administrator.");
          return;
        }
      }
    } catch (err) {
      alert("Login Error: " + err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!authName.trim() || !authEmail.trim() || !authPassword.trim()) {
      return alert('Please complete all required fields.');
    }

    if (registerRole !== 'student') {
      const passcode = adminPasscode.trim().toUpperCase();
      if (passcode !== 'ADMIN2026' && passcode !== 'EDUSPARK2026' && passcode !== 'SUPER2026') {
        return alert('❌ Invalid Admin Passcode! Use ADMIN2026 or EDUSPARK2026 for staff registration.');
      }
    }

    setAuthLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: authEmail,
        password: authPassword,
        options: {
          data: {
            full_name: authName,
            index_number: indexNumber || `STU-${Math.floor(1000 + Math.random() * 9000)}`,
            role: registerRole,
            grade: studentGrade,
            teacher_subject: registerRole === 'teacher' ? registerSubject : null
          }
        }
      });
      if (error) throw error;

      if (data?.user) {
        await supabase.from('profiles').upsert([{
          id: data.user.id,
          full_name: authName,
          index_number: indexNumber || `${registerRole.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
          role: registerRole,
          status: 'active',
          grade: studentGrade,
          teacher_subject: registerRole === 'teacher' ? registerSubject : null,
          must_change_password: false,
          coins: registerRole === 'student' ? 350 : 0,
          xp: registerRole === 'student' ? 420 : 0,
          reading_hours: 0,
          online_read_book_ids: [],
          physical_claimed_book_ids: []
        }], { onConflict: 'id' });

        await fetchUserProfile(data.user);
      }

      alert(`🎉 Registration successful as ${registerRole.toUpperCase()}! You can now sign in.`);
      setAuthView('login');
    } catch (err) {
      alert("Registration Error: " + err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!resetEmail.trim()) return alert("Please enter your registered email address.");
    setAuthLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail.trim(), {
        redirectTo: window.location.href
      });
      if (error) throw error;
      setResetSent(true);
    } catch (err) {
      alert("Password Reset Error: " + err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSetNewPasswordFromRecovery = async (e) => {
    e.preventDefault();
    if (newRecoveryPassword.length < 6) return alert("Password must be at least 6 characters.");

    setAuthLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newRecoveryPassword });
      if (error) throw error;

      alert("✅ Password updated successfully! You can now log in with your new password.");
      setIsPasswordResetFlow(false);
      setNewRecoveryPassword('');
      setAuthView('login');
    } catch (err) {
      alert("Failed to update password: " + err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleCompleteForcedPasswordChange = async (e) => {
    e.preventDefault();
    if (forcedNewPassword.length < 6) return alert("Password must be at least 6 characters.");
    if (forcedNewPassword !== confirmForcedPassword) return alert("Passwords do not match.");

    setAuthLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: forcedNewPassword });
      if (error) throw error;

      await supabase.from('profiles').update({ must_change_password: false }).eq('id', user.id);
      setMustChangePassword(false);
      alert("✅ Password updated! Welcome to your dashboard.");
    } catch (err) {
      alert("Failed to update password: " + err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleUserSelfChangePassword = async (e) => {
    e.preventDefault();
    if (profileNewPassword.length < 6) return alert("Password must be at least 6 characters long.");

    setAuthLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: profileNewPassword });
      if (error) throw error;

      setProfileNewPassword('');
      alert("✅ Password updated successfully!");
    } catch (err) {
      alert("Error updating password: " + err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setActiveQuiz(null);
    setAuthView('landing');
  };

  // E-Book & Physical Reading
  const handleFinishOnlineReading = (book) => {
    const elapsedMinutes = Math.max(1, Math.round(activeReadingSeconds / 60));
    const hoursEarned = Math.round((elapsedMinutes / 60) * 100) / 100;
    const coinsEarned = elapsedMinutes * 2;
    const xpEarned = elapsedMinutes * 5;

    const newReadingHours = Math.round((readingHours + hoursEarned) * 100) / 100;
    const newCoins = coins + coinsEarned;
    const newXp = xp + xpEarned;
    const newOnlineReads = Array.from(new Set([...onlineReadBookIds, book.id]));

    setReadingHours(newReadingHours);
    setCoins(newCoins);
    setXp(newXp);
    setOnlineReadBookIds(newOnlineReads);
    setSelectedBook(null);

    playSound('coin');
    confetti({ particleCount: 80, spread: 60 });

    if (user) {
      supabase.from('profiles').update({
        reading_hours: newReadingHours,
        coins: newCoins,
        xp: newXp,
        online_read_book_ids: newOnlineReads
      }).eq('id', user.id);
    }

    alert(`🎉 Reading Session Logged!\n• Time Read: ${elapsedMinutes} mins (+${hoursEarned} hrs)\n• Earned: +${coinsEarned} EduCoins & +${xpEarned} XP!`);
  };

  const handleClaimPhysicalBook = (e, book) => {
    e.preventDefault();
    const targetCode = (book.claim_code || 'LIB-2026').trim().toUpperCase();
    if (physicalClaimInput.trim().toUpperCase() !== targetCode) {
      alert(`❌ Invalid Code for "${book.title}". Ask your librarian for this book's official claim code.`);
      return;
    }

    const hours = parseFloat(book.reading_hours) || 2.0;
    const coinsGained = Math.round(hours * 15);
    const newHours = Math.round((readingHours + hours) * 10) / 10;
    const newCoins = coins + coinsGained;
    const newPhysicalReads = Array.from(new Set([...physicalClaimedBookIds, book.id]));

    setReadingHours(newHours);
    setCoins(newCoins);
    setPhysicalClaimedBookIds(newPhysicalReads);
    setClaimingBook(null);
    setPhysicalClaimInput('');

    playSound('coin');
    confetti({ particleCount: 100, spread: 70 });

    if (user) {
      supabase.from('profiles').update({
        reading_hours: newHours,
        coins: newCoins,
        physical_claimed_book_ids: newPhysicalReads
      }).eq('id', user.id);
    }

    alert(`🎉 Physical Book Verified!\n• Added +${hours} Reading Hours\n• Earned +${coinsGained} EduCoins!`);
  };

  const handleCreateNewBook = (e) => {
    e.preventDefault();
    if (!newBookTitle.trim()) return alert("Please enter a book title.");

    const generatedCode = `LIB-${newBookSubject.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
    const newBook = {
      id: `book_${Date.now()}`,
      title: newBookTitle,
      subject: newBookSubject,
      author: newBookAuthor || 'School Library',
      cover_url: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=600&q=80',
      summary: newBookSummary || 'Interactive school reading book.',
      reading_hours: parseFloat(newBookHours) || 2.0,
      claim_code: generatedCode,
      pages: [newBookPageText || 'Page 1 content...']
    };

    setBooks([newBook, ...books]);
    setShowNewBookModal(false);
    setNewBookTitle('');
    setNewBookPageText('');
    alert(`✅ New book published to library! Physical Claim Code: ${generatedCode}`);
  };

  // Gift Shop & Store
  const handlePurchaseItem = (item) => {
    if (coins < item.cost) {
      alert(`❌ You need ${item.cost - coins} more EduCoins to purchase this item.`);
      return;
    }
    const claimCode = `ES-SHOP-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder = {
      id: `ord_${Date.now()}`,
      student_name: authName,
      item_name: item.name,
      cost: item.cost,
      status: 'Pending',
      claim_code: claimCode,
      date: new Date().toLocaleDateString()
    };
    setCoins(c => c - item.cost);
    setOrders([newOrder, ...orders]);
    playSound('coin');
    confetti({ particleCount: 90, spread: 60 });
    alert(`🎉 Purchase Successful!\n\nItem: ${item.name}\nClaim Code: ${claimCode}\nShow this claim code to the school store manager to receive your item.`);
  };

  const handleCreateShopItem = (e) => {
    e.preventDefault();
    if (!newItemName.trim()) return alert("Please enter item name.");

    const newItem = {
      id: `item_${Date.now()}`,
      name: newItemName,
      category: newItemCategory,
      cost: parseInt(newItemCost) || 100,
      stock: parseInt(newItemStock) || 10,
      is_real: true,
      icon: newItemIcon || '📦',
      desc: newItemDesc || 'School shop reward item.'
    };

    setShopItems([...shopItems, newItem]);
    setNewItemName('');
    setNewItemDesc('');
    alert("✅ New store item added to Student Gift Shop!");
  };

  const handleFulfillOrder = (orderId) => {
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'Fulfilled' } : o));
    alert("✅ Order status updated to Fulfilled!");
  };

  // Quiz Runner Methods
  const startQuiz = (quiz, mode) => {
    setActiveQuiz(quiz);
    setQuizMode(mode);
    setCurrentQuestionIdx(0);
    setSelectedOption(null);
    setShowExplanation(false);
    setScore(0);
    setHearts(3);
    setStreak(0);
    setQuizFinished(false);
    setGameOver(false);

    const limit = getQuizTimeLimit(quiz);
    setTimeLeft(limit);
  };

  const handleAnswerSubmit = (option) => {
    const currentQ = activeQuiz.questions[currentQuestionIdx];
    const isCorrect = option === currentQ.correct_option;
    setSelectedOption(option);
    setShowExplanation(true);

    if (isCorrect) {
      playSound('correct');
      setScore(s => s + 1);
      setStreak(st => st + 1);
    } else {
      playSound('wrong');
      setStreak(0);

      if (quizMode === 'challenge' || quizMode === 'olevel') {
        setHearts(h => {
          const nextHearts = h - 1;
          if (nextHearts <= 0) {
            setGameOver(true);
          }
          return nextHearts;
        });
      }
    }
  };

  const nextQuestion = () => {
    setSelectedOption(null);
    setShowExplanation(false);

    if (currentQuestionIdx + 1 < activeQuiz.questions.length) {
      setCurrentQuestionIdx(idx => idx + 1);
    } else {
      setQuizFinished(true);
      playSound('coin');
      confetti({ particleCount: 100 });
      const earnedCoins = score * 15;
      const earnedXp = score * 30;
      setCoins(c => c + earnedCoins);
      setXp(x => x + earnedXp);

      if (user) {
        supabase.from('profiles').update({
          coins: coins + earnedCoins,
          xp: xp + earnedXp
        }).eq('id', user.id);
      }
    }
  };

  // Teacher Quiz Creation
  const handleTeacherCreateQuiz = (e) => {
    e.preventDefault();
    if (role === 'teacher' && studioSubject !== teacherSubject) {
      alert(`⚠️ Teachers can only create quizzes for their assigned subject (${teacherSubject}).`);
      return;
    }

    try {
      const parsedQuestions = JSON.parse(jsonInputText);
      const hasDiagrams = parsedQuestions.some(q => !!q.diagram_url);

      const newQuiz = {
        id: `quiz_${Date.now()}`,
        title: `Grade ${studioGrade} ${studioSubject} Quiz`,
        subject: studioSubject,
        grade: parseInt(studioGrade),
        has_diagrams: hasDiagrams,
        questions: parsedQuestions
      };

      setQuizzes([newQuiz, ...quizzes]);
      alert(`✅ Quiz successfully published under ${studioSubject}! ${hasDiagrams ? '(Includes Diagram MCQs)' : ''}`);
    } catch (err) {
      alert("Invalid JSON format for questions: " + err.message);
    }
  };

  // Admin Provisioning
  const handleSuperAdminProvisionTeacher = async (e) => {
    e.preventDefault();
    if (!newStaffEmail || !newStaffName || !newStaffPass) return alert("Please complete teacher details.");

    try {
      const { data, error } = await supabase.auth.signUp({
        email: newStaffEmail,
        password: newStaffPass,
        options: { data: { full_name: newStaffName, role: 'teacher' } }
      });
      if (error) throw error;

      if (data?.user) {
        await supabase.from('profiles').insert([{
          id: data.user.id,
          full_name: newStaffName,
          index_number: `STAFF-${Math.floor(100 + Math.random() * 900)}`,
          role: 'teacher',
          status: 'active',
          teacher_subject: newStaffSubject,
          must_change_password: true,
          coins: 0,
          xp: 0,
          reading_hours: 0
        }]);
      }

      alert(`✅ Teacher Provisioned Successfully!\n\nEmail: ${newStaffEmail}\nDefault Password: ${newStaffPass}\nSubject: ${newStaffSubject}`);
      setNewStaffEmail('');
      setNewStaffName('');
      setNewStaffPass('Teacher2026!');
      fetchAllProfiles();
    } catch (err) {
      alert("Provisioning Error: " + err.message);
    }
  };

  const handleUpdateUserByAdmin = async (targetUserId, updates) => {
    try {
      await supabase.from('profiles').update(updates).eq('id', targetUserId);
      setAllProfiles(allProfiles.map(p => p.id === targetUserId ? { ...p, ...updates } : p));
      alert("✅ User profile updated!");
    } catch (err) {
      alert("Update failed: " + err.message);
    }
  };

  const gradePracticeQuizzes = quizzes.filter(q => q.grade === parseInt(studentGrade) && (selectedSubject === 'All' || q.subject === selectedSubject));
  
  const olevelPastPapers = quizzes.filter(q => {
    if (!q.is_past_paper) return false;
    if (olevelSubjectFilter === 'Diagrams') {
      return q.has_diagrams || q.questions?.some(item => !!item.diagram_url);
    }
    return olevelSubjectFilter === 'All' || q.subject === olevelSubjectFilter;
  });

  const filteredLibraryBooks = books.filter(b => selectedSubject === 'All' || b.subject === selectedSubject);
  const currentRank = getStudentRank(xp);

  // =========================================================================
  // --- PASSWORD RECOVERY RESET OVERLAY ---
  // =========================================================================
  if (isPasswordResetFlow) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center items-center p-4">
        <div className="bg-slate-800 border border-slate-700 p-8 rounded-3xl shadow-2xl max-w-md w-full space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto">
              <KeyRound className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black text-white">Reset Your Password</h2>
            <p className="text-xs text-slate-400">Enter a new secure password for your account</p>
          </div>

          <form onSubmit={handleSetNewPasswordFromRecovery} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">New Password</label>
              <input
                type="password"
                value={newRecoveryPassword}
                onChange={(e) => setNewRecoveryPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl text-xs transition shadow-md"
            >
              {authLoading ? 'Updating Password...' : 'Save New Password & Continue'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // =========================================================================
  // --- LANDING & AUTHENTICATION (UNAUTHENTICATED) ---
  // =========================================================================
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between font-sans relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>

        <header className="max-w-7xl w-full mx-auto px-6 py-6 flex items-center justify-between z-10">
          <div onClick={() => setAuthView('landing')} className="flex items-center space-x-3 cursor-pointer">
            <div className="bg-gradient-to-tr from-indigo-500 to-purple-600 p-2.5 rounded-2xl shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-white">
                EduSpark <span className="text-indigo-400">IQ</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-medium font-mono">School Portal & E-Library</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setAuthView('login')}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition ${authView === 'login' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-300 hover:text-white'}`}
            >
              Sign In
            </button>
            <button
              onClick={() => setAuthView('register')}
              className="bg-white hover:bg-slate-100 text-slate-900 px-5 py-2 rounded-xl text-xs font-bold shadow-md transition"
            >
              Create Account
            </button>
          </div>
        </header>

        {authView === 'landing' && (
          <main className="max-w-6xl w-full mx-auto px-6 py-10 z-10 flex-1 flex flex-col justify-center items-center text-center space-y-10">
            <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/30 px-4 py-1.5 rounded-full text-indigo-300 text-xs font-bold">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Next-Generation School Portal for Students & Educators</span>
            </div>

            <div className="space-y-4 max-w-3xl">
              <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
                Empowering Students with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">Smart Topic Diagnostics</span>
              </h1>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
                Access Cambridge O-Level past papers, diagram-based MCQs, grade practice vaults, bilingual Dhivehi and Islam library e-books, and kids cash gift shop.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
              <button
                onClick={() => setAuthView('register')}
                className="w-full sm:w-auto bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold px-8 py-3.5 rounded-2xl text-sm shadow-xl transition flex items-center justify-center space-x-2"
              >
                <span>Create Account</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setAuthView('login')}
                className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold px-8 py-3.5 rounded-2xl text-sm transition"
              >
                Existing User Sign In
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full py-4 border-y border-slate-800 text-center">
              <div>
                <span className="text-2xl font-black text-indigo-400 block">Grade 1–10</span>
                <span className="text-[11px] text-slate-400 font-medium">Curriculum Practice Vaults</span>
              </div>
              <div>
                <span className="text-2xl font-black text-purple-400 block">Cambridge 0625/2210</span>
                <span className="text-[11px] text-slate-400 font-medium">O-Level Timed Exam Arena</span>
              </div>
              <div>
                <span className="text-2xl font-black text-emerald-400 block">🇲🇻 Dhivehi & Islam</span>
                <span className="text-[11px] text-slate-400 font-medium">Interactive RTL Reader</span>
              </div>
              <div>
                <span className="text-2xl font-black text-amber-400 block">Kids Economics</span>
                <span className="text-[11px] text-slate-400 font-medium">EduCoins & Real Gift Shop</span>
              </div>
            </div>
          </main>
        )}

        {authView === 'login' && (
          <main className="max-w-md w-full mx-auto px-6 py-8 z-10 flex-1 flex flex-col justify-center">
            <div className="bg-slate-800 border border-slate-700 p-8 rounded-3xl shadow-2xl space-y-6">
              <div className="text-center space-y-1">
                <h2 className="text-2xl font-black text-white">Welcome Back</h2>
                <p className="text-xs text-slate-400">Sign in to your school account</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5">Email Address</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      placeholder="user@school.edu"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-bold text-slate-300">Password</label>
                    <button
                      type="button"
                      onClick={() => { setResetSent(false); setAuthView('forgot_password'); }}
                      className="text-[11px] font-bold text-indigo-400 hover:underline"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl text-xs transition shadow-md"
                >
                  {authLoading ? 'Signing In...' : 'Sign In'}
                </button>
              </form>

              <div className="text-center pt-2 border-t border-slate-700/60">
                <p className="text-xs text-slate-400">
                  Need an Account?{' '}
                  <button onClick={() => setAuthView('register')} className="text-indigo-400 font-bold hover:underline">
                    Create Account
                  </button>
                </p>
              </div>
            </div>
          </main>
        )}

        {authView === 'forgot_password' && (
          <main className="max-w-md w-full mx-auto px-6 py-8 z-10 flex-1 flex flex-col justify-center">
            <div className="bg-slate-800 border border-slate-700 p-8 rounded-3xl shadow-2xl space-y-6">
              <div className="text-center space-y-1">
                <h2 className="text-2xl font-black text-white">Reset Password</h2>
                <p className="text-xs text-slate-400">We will send a password reset link to your email</p>
              </div>

              {!resetSent ? (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1.5">Registered Email Address</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        type="email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        placeholder="email@school.edu"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl text-xs transition shadow-md"
                  >
                    {authLoading ? 'Sending Reset Email...' : 'Send Reset Link'}
                  </button>
                </form>
              ) : (
                <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-2xl text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                  <h3 className="text-sm font-bold text-emerald-300">Reset Email Sent!</h3>
                  <p className="text-xs text-slate-300">Please check your inbox at <strong>{resetEmail}</strong> for the reset link.</p>
                </div>
              )}

              <div className="text-center pt-2 border-t border-slate-700/60">
                <button onClick={() => setAuthView('login')} className="text-xs text-indigo-400 font-bold hover:underline">
                  ← Back to Sign In
                </button>
              </div>
            </div>
          </main>
        )}

        {/* ROLE-BASED REGISTRATION FORM */}
        {authView === 'register' && (
          <main className="max-w-md w-full mx-auto px-6 py-8 z-10 flex-1 flex flex-col justify-center">
            <div className="bg-slate-800 border border-slate-700 p-8 rounded-3xl shadow-2xl space-y-5">
              <div className="text-center space-y-1">
                <h2 className="text-2xl font-black text-white">Create Account</h2>
                <p className="text-xs text-slate-400">Register as Student, Teacher, or Shop Manager</p>
              </div>

              <form onSubmit={handleRegister} className="space-y-3.5">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5">Account Role</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setRegisterRole('student')}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border transition ${
                        registerRole === 'student' ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm' : 'bg-slate-900 border-slate-700 text-slate-400'
                      }`}
                    >
                      🎓 Student
                    </button>
                    <button
                      type="button"
                      onClick={() => setRegisterRole('teacher')}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border transition ${
                        registerRole === 'teacher' ? 'bg-purple-600 text-white border-purple-500 shadow-sm' : 'bg-slate-900 border-slate-700 text-slate-400'
                      }`}
                    >
                      👨‍🏫 Teacher
                    </button>
                    <button
                      type="button"
                      onClick={() => setRegisterRole('shop_admin')}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border transition ${
                        registerRole === 'shop_admin' ? 'bg-amber-600 text-white border-amber-500 shadow-sm' : 'bg-slate-900 border-slate-700 text-slate-400'
                      }`}
                    >
                      🏬 Shop CP
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Full Name</label>
                  <input
                    type="text"
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Email Address</label>
                  <input
                    type="email"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="user@school.edu"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Password</label>
                  <input
                    type="password"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    required
                  />
                </div>

                {registerRole === 'student' ? (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Grade Level</label>
                      <select
                        value={studentGrade}
                        onChange={(e) => setStudentGrade(parseInt(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(g => (
                          <option key={g} value={g}>Grade {g}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Student Index No.</label>
                      <input
                        type="text"
                        value={indexNumber}
                        onChange={(e) => setIndexNumber(e.target.value)}
                        placeholder="STU-2026-104"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                  </div>
                ) : registerRole === 'teacher' ? (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Teaching Subject</label>
                      <select
                        value={registerSubject}
                        onChange={(e) => setRegisterSubject(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white"
                      >
                        {ALL_SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-amber-400 block mb-1">Admin Passcode (Required)</label>
                      <input
                        type="password"
                        value={adminPasscode}
                        onChange={(e) => setAdminPasscode(e.target.value)}
                        placeholder="Enter ADMIN2026 or EDUSPARK2026"
                        className="w-full bg-slate-900 border border-amber-500/50 rounded-xl px-3 py-2 text-xs text-white"
                        required
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="text-xs font-bold text-amber-400 block mb-1">Admin Passcode (Required)</label>
                    <input
                      type="password"
                      value={adminPasscode}
                      onChange={(e) => setAdminPasscode(e.target.value)}
                      placeholder="Enter ADMIN2026 or EDUSPARK2026"
                      className="w-full bg-slate-900 border border-amber-500/50 rounded-xl px-3 py-2 text-xs text-white"
                      required
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs transition shadow-md mt-2"
                >
                  {authLoading ? 'Registering Account...' : 'Complete Registration'}
                </button>
              </form>

              <div className="text-center pt-2 border-t border-slate-700/60">
                <p className="text-xs text-slate-400">
                  Already registered?{' '}
                  <button onClick={() => setAuthView('login')} className="text-indigo-400 font-bold hover:underline">
                    Sign In
                  </button>
                </p>
              </div>
            </div>
          </main>
        )}

        <footer className="py-4 text-center text-xs text-slate-500 border-t border-slate-800">
          EduSpark IQ © 2026 • Production Custom Domain Web Portal
        </footer>
      </div>
    );
  }

  // =========================================================================
  // --- AUTHENTICATED PORTAL APP INTERFACE ---
  // =========================================================================
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans relative">
      
      {mustChangePassword && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 space-y-5 shadow-2xl border border-indigo-100">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-black text-slate-900">Security Update Required</h2>
              <p className="text-xs text-slate-500">
                Your account was assigned a default temporary password. Please set a new private password to activate your account.
              </p>
            </div>

            <form onSubmit={handleCompleteForcedPasswordChange} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">New Secure Password</label>
                <input
                  type="password"
                  value={forcedNewPassword}
                  onChange={(e) => setForcedNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmForcedPassword}
                  onChange={(e) => setConfirmForcedPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-800"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-2xl text-xs shadow-md transition"
              >
                {authLoading ? 'Updating Password...' : 'Save Password & Continue'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* RESPONSIVE HEADER BAR */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
          <div onClick={() => navigateToTab(getDefaultTabForRole(role))} className="flex items-center space-x-2.5 cursor-pointer shrink-0">
            <div className="bg-gradient-to-tr from-indigo-600 to-purple-600 p-2 rounded-xl shadow-md">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 leading-tight">
                EduSpark <span className="text-indigo-600">IQ</span>
              </h1>
              <p className="text-[10px] text-slate-500 font-medium hidden sm:block">School Portal & Analytics</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            <div className="flex items-center space-x-2 bg-slate-100 border border-slate-200 px-2.5 py-1.5 rounded-full text-xs font-bold text-slate-700">
              <span className={`px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-black whitespace-nowrap ${
                role === 'super_admin' ? 'bg-rose-100 text-rose-800' :
                role === 'teacher' ? 'bg-purple-100 text-purple-800' :
                role === 'shop_admin' ? 'bg-amber-100 text-amber-800' : currentRank.bg + ' ' + currentRank.text
              }`}>
                {role === 'super_admin' ? '👑 Admin' :
                 role === 'teacher' ? `👨‍🏫 ${teacherSubject}` :
                 role === 'shop_admin' ? '🏬 Shop' : currentRank.title}
              </span>

              {role === 'student' && (
                <>
                  <div className="hidden md:flex items-center space-x-1 text-emerald-700">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{readingHours}h</span>
                  </div>
                  <div className="flex items-center space-x-1 text-amber-600">
                    <Coins className="w-3.5 h-3.5" />
                    <span>{coins}</span>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={() => navigateToTab('profile')}
              className={`p-2 rounded-xl border font-bold text-xs flex items-center space-x-1 transition ${
                activeTab === 'profile' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-100 border-slate-200 text-slate-700'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span className="hidden md:inline truncate max-w-[100px]">{authName}</span>
            </button>

            <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-slate-700 rounded-lg transition">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* RESPONSIVE SCROLLABLE NAVIGATION SUB-BAR */}
        <div className="bg-slate-50/80 border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-4 flex items-center space-x-1.5 overflow-x-auto py-2 scrollbar-none whitespace-nowrap">
            
            {/* STUDENT / SUPER ADMIN ONLY TABS */}
            {(role === 'student' || role === 'super_admin') && (
              <button
                onClick={() => navigateToTab('dashboard')}
                className={`px-3 py-1.5 font-bold flex items-center space-x-1.5 rounded-xl transition shrink-0 text-xs ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200/60'}`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Grade {studentGrade} Vault</span>
              </button>
            )}

            {(role === 'student' || role === 'super_admin') && (
              <button
                onClick={() => navigateToTab('olevel')}
                className={`px-3 py-1.5 font-bold flex items-center space-x-1.5 rounded-xl transition shrink-0 text-xs ${activeTab === 'olevel' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200/60'}`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>O-Level Arena</span>
              </button>
            )}

            {(role === 'student' || role === 'super_admin') && (
              <button
                onClick={() => navigateToTab('library')}
                className={`px-3 py-1.5 font-bold flex items-center space-x-1.5 rounded-xl transition shrink-0 text-xs ${activeTab === 'library' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200/60'}`}
              >
                <Library className="w-3.5 h-3.5" />
                <span>E-Library</span>
              </button>
            )}

            {(role === 'student' || role === 'super_admin') && (
              <button
                onClick={() => navigateToTab('shop')}
                className={`px-3 py-1.5 font-bold flex items-center space-x-1.5 rounded-xl transition shrink-0 text-xs ${activeTab === 'shop' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200/60'}`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Student Gift Shop</span>
              </button>
            )}

            {/* SHOP ADMIN & SUPER ADMIN TAB */}
            {(role === 'shop_admin' || role === 'super_admin') && (
              <button
                onClick={() => navigateToTab('shop_management')}
                className={`px-3 py-1.5 font-bold flex items-center space-x-1.5 rounded-xl transition shrink-0 text-xs ${activeTab === 'shop_management' ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-200/80 text-slate-800 hover:bg-slate-300'}`}
              >
                <Settings className="w-3.5 h-3.5 text-amber-400" />
                <span>🏬 Store Sales CP</span>
              </button>
            )}

            {/* TEACHER & SUPER ADMIN TAB */}
            {(role === 'teacher' || role === 'super_admin') && (
              <button
                onClick={() => navigateToTab('studio')}
                className={`px-3 py-1.5 font-bold flex items-center space-x-1.5 rounded-xl transition shrink-0 text-xs ${activeTab === 'studio' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200/60'}`}
              >
                <BrainCircuit className="w-3.5 h-3.5" />
                <span>Teacher Quiz Studio</span>
              </button>
            )}

            {/* SUPER ADMIN MASTER TAB */}
            {role === 'super_admin' && (
              <button
                onClick={() => navigateToTab('super_admin_console')}
                className={`px-3 py-1.5 font-bold flex items-center space-x-1.5 rounded-xl transition shrink-0 text-xs ${activeTab === 'super_admin_console' ? 'bg-rose-600 text-white shadow-xs' : 'bg-rose-100 text-rose-800 hover:bg-rose-200'}`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>👑 Admin Controls</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">

        {/* PRACTICE VAULT (STUDENT / SUPER ADMIN ONLY) */}
        {activeTab === 'dashboard' && (role === 'student' || role === 'super_admin') && !activeQuiz && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-black text-slate-900">Grade {studentGrade} Practice Vault</h3>
                <p className="text-xs text-slate-500 font-medium">Test your knowledge across grade curriculum quizzes.</p>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search quizzes..."
                  className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800"
                />
                {role === 'super_admin' && (
                  <select
                    value={studentGrade}
                    onChange={(e) => setStudentGrade(parseInt(e.target.value))}
                    className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-indigo-600"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(g => (
                      <option key={g} value={g}>Grade {g}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {gradePracticeQuizzes.map((quiz) => (
                <div key={quiz.id} className="bg-white border border-slate-200 rounded-3xl p-5 flex flex-col justify-between hover:border-indigo-300 transition shadow-xs">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg font-bold">
                        {quiz.subject}
                      </span>
                      {quiz.has_diagrams && (
                        <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md font-bold flex items-center space-x-1">
                          <ImageIcon className="w-3 h-3" />
                          <span>Diagrams</span>
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mt-2 mb-1">{quiz.title}</h3>
                    <p className="text-xs text-slate-500 mb-4">{quiz.questions.length} Questions</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100">
                    <button onClick={() => startQuiz(quiz, 'practice')} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-xl text-xs font-bold transition">
                      Practice Mode
                    </button>
                    <button onClick={() => startQuiz(quiz, 'challenge')} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-xl text-xs font-bold transition shadow-xs">
                      Timed Challenge
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CAMBRIDGE O-LEVEL ARENA (STUDENT / SUPER ADMIN ONLY) */}
        {activeTab === 'olevel' && (role === 'student' || role === 'super_admin') && !activeQuiz && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <div className="flex items-center space-x-2">
                  <GraduationCap className="w-6 h-6 text-purple-400" />
                  <h2 className="text-2xl sm:text-3xl font-black">Cambridge O-Level Exam Arena</h2>
                </div>
                <p className="text-xs text-purple-200">
                  Timed past paper exam sessions with **Ray, Optical, Circuit & Graph Diagram MCQs**, 3-Hearts mechanic ($\text{❤️ ❤️ ❤️}$), and detailed mark schemes.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex items-center space-x-3">
                <Trophy className="w-8 h-8 text-amber-400" />
                <div>
                  <span className="text-[10px] text-purple-200 block font-bold uppercase">Target Exam Grade</span>
                  <span className="text-xl font-black text-white">Grade 8 – 10 O-Level</span>
                </div>
              </div>
            </div>

            {/* O-LEVEL ARENA DIAGRAM & SUBJECT FILTER BAR */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none whitespace-nowrap">
              <span className="text-xs font-bold text-slate-500 mr-2 shrink-0">Filter Arena:</span>
              <button
                onClick={() => setOlevelSubjectFilter('All')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                  olevelSubjectFilter === 'All' ? 'bg-purple-600 text-white shadow-xs' : 'bg-white border text-slate-600 hover:bg-slate-100'
                }`}
              >
                All Papers
              </button>

              <button
                onClick={() => setOlevelSubjectFilter('Diagrams')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 flex items-center space-x-1.5 ${
                  olevelSubjectFilter === 'Diagrams' ? 'bg-amber-500 text-white shadow-xs' : 'bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>📐 Diagram MCQs Tab</span>
              </button>

              {['Physics', 'Computer Science', 'Maths', 'Chemistry', 'Biology'].map((subj) => (
                <button
                  key={subj}
                  onClick={() => setOlevelSubjectFilter(subj)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                    olevelSubjectFilter === subj ? 'bg-purple-600 text-white shadow-xs' : 'bg-white border text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {subj}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {olevelPastPapers.map((paper) => (
                <div key={paper.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs hover:shadow-md transition space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="bg-purple-100 text-purple-800 text-[10px] font-black px-2.5 py-1 rounded-md font-mono">
                          Code: {paper.subject_code}
                        </span>
                        <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2.5 py-1 rounded-md">
                          {paper.exam_year} • {paper.variant}
                        </span>
                        {(paper.has_diagrams || paper.questions?.some(q => !!q.diagram_url)) && (
                          <span className="bg-indigo-100 text-indigo-800 text-[10px] font-black px-2 py-0.5 rounded-md flex items-center space-x-1">
                            <ImageIcon className="w-3 h-3" />
                            <span>Diagrams Included</span>
                          </span>
                        )}
                      </div>
                      <h3 className="font-black text-slate-900 text-base pt-1">{paper.title}</h3>
                    </div>

                    <div className="flex items-center space-x-1 text-rose-500 bg-rose-50 px-2.5 py-1 rounded-full text-xs font-bold shrink-0">
                      <Heart className="w-3.5 h-3.5 fill-rose-500" />
                      <span>3 Lives</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Time Limit: {getQuizTimeLimit(paper)} Mins</span>
                    </span>
                    <span>{paper.questions.length} Exam Questions</span>
                  </div>

                  <button
                    onClick={() => startQuiz(paper, 'olevel')}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-2xl text-xs shadow-md transition flex items-center justify-center space-x-2"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>Begin Timed Cambridge Exam</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* E-LIBRARY (STUDENT / SUPER ADMIN ONLY) */}
        {activeTab === 'library' && (role === 'student' || role === 'super_admin') && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-emerald-800 via-teal-700 to-cyan-800 text-white p-6 sm:p-8 rounded-3xl shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <div className="flex items-center space-x-2">
                  <Library className="w-6 h-6 text-emerald-300" />
                  <h2 className="text-2xl sm:text-3xl font-black">Interactive E-Library & Reading Hub</h2>
                </div>
                <p className="text-xs text-emerald-100">
                  Read online with **auto-time tracking** OR claim physical copies borrowed from the school library!
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl text-center space-y-1">
                  <span className="text-[10px] text-emerald-200 block uppercase font-bold">Total Reading Hours</span>
                  <span className="text-2xl font-black text-amber-300">{readingHours} Hours</span>
                </div>

                {role === 'super_admin' && (
                  <button
                    onClick={() => setShowNewBookModal(true)}
                    className="bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold px-4 py-3 rounded-2xl text-xs shadow-md transition flex items-center space-x-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Book</span>
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredLibraryBooks.map((book) => {
                const isOnlineRead = onlineReadBookIds.includes(book.id);
                const isPhysicalClaimed = physicalClaimedBookIds.includes(book.id);

                return (
                  <div key={book.id} className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between">
                    <div>
                      <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                        <img
                          src={book.cover_url}
                          alt={book.title}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        />
                        <span className="absolute top-3 left-3 bg-emerald-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-xl">
                          {book.subject}
                        </span>
                        <span className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-xs text-amber-300 text-[10px] font-mono px-2 py-0.5 rounded-md">
                          Code: {book.claim_code}
                        </span>
                      </div>

                      <div className="p-5 space-y-3">
                        <h4 className="font-black text-slate-900 text-base">{book.title}</h4>
                        <p className="text-xs text-slate-400">By {book.author}</p>
                        <p className="text-xs text-slate-600 italic bg-slate-50 p-2.5 rounded-xl">"{book.summary}"</p>
                      </div>
                    </div>

                    <div className="p-5 pt-0 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => { setSelectedBook(book); setBookPageIndex(0); }}
                          className={`w-full font-bold py-2.5 rounded-2xl text-xs flex items-center justify-center space-x-1 transition ${
                            isOnlineRead ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>{isOnlineRead ? '✓ Read Online' : 'Read Online'}</span>
                        </button>

                        <button
                          onClick={() => { setClaimingBook(book); setPhysicalClaimInput(''); }}
                          className={`w-full font-bold py-2.5 rounded-2xl text-xs flex items-center justify-center space-x-1 transition ${
                            isPhysicalClaimed ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                          }`}
                        >
                          <Award className="w-3.5 h-3.5" />
                          <span>{isPhysicalClaimed ? '✓ Claimed' : 'Claim Physical'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STUDENT GIFT SHOP (STUDENT / SUPER ADMIN ONLY) */}
        {activeTab === 'shop' && (role === 'student' || role === 'super_admin') && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-600 text-white p-6 sm:p-8 rounded-3xl shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <div className="flex items-center space-x-2">
                  <ShoppingBag className="w-6 h-6 text-yellow-200" />
                  <h2 className="text-2xl sm:text-3xl font-black">Student Rewards Gift Shop</h2>
                </div>
                <p className="text-xs text-amber-100">
                  Spend your hard-earned **EduCoins** on stationery, homework passes, and school store items!
                </p>
              </div>

              <div className="bg-white/20 backdrop-blur-md border border-white/30 p-4 rounded-2xl text-center space-y-1">
                <span className="text-[10px] text-amber-100 block uppercase font-bold">Your Balance</span>
                <span className="text-2xl font-black text-white flex items-center justify-center space-x-1">
                  <Coins className="w-5 h-5 text-amber-200" />
                  <span>{coins} EduCoins</span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {shopItems.map((item) => (
                <div key={item.id} className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-3xl">{item.icon}</span>
                      <span className="text-xs font-black text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full flex items-center space-x-1">
                        <Coins className="w-3.5 h-3.5" />
                        <span>{item.cost} Coins</span>
                      </span>
                    </div>

                    <h4 className="font-black text-slate-900 text-base">{item.name}</h4>
                    <p className="text-xs text-slate-500">{item.desc}</p>
                    <span className="inline-block text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-md">
                      Category: {item.category}
                    </span>
                  </div>

                  <div className="pt-4 border-t border-slate-100 mt-4">
                    <button
                      onClick={() => handlePurchaseItem(item)}
                      className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 rounded-xl text-xs shadow-xs transition"
                    >
                      Purchase Item ({item.cost} Coins)
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {orders.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
                <h3 className="font-black text-slate-900 text-base">Your Active Claim Codes & Order History</h3>
                <div className="divide-y divide-slate-100">
                  {orders.map((ord) => (
                    <div key={ord.id} className="py-3 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-900">{ord.item_name}</span>
                        <span className="block text-[10px] font-mono text-indigo-600">Claim Code: <strong>{ord.claim_code}</strong></span>
                      </div>
                      <div className="text-right">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                          ord.status === 'Fulfilled' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {ord.status}
                        </span>
                        <span className="block text-[10px] text-slate-400 mt-0.5">{ord.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* STORE SALES CP (SHOP ADMIN / SUPER ADMIN ONLY) */}
        {activeTab === 'shop_management' && (role === 'shop_admin' || role === 'super_admin') && (
          <div className="space-y-6 max-w-5xl mx-auto">
            <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-lg space-y-2">
              <h2 className="text-2xl font-black">🏬 Store Sales & Order Fulfillment Console</h2>
              <p className="text-xs text-slate-400">
                Process student purchases, check claim codes, and manage physical store inventory.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
              <h3 className="font-bold text-slate-900 text-base">Add New Shop Inventory Item</h3>
              <form onSubmit={handleCreateShopItem} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Item Name</label>
                  <input
                    type="text"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    placeholder="e.g. Dual-Tip Highlighters"
                    className="w-full bg-slate-50 border rounded-xl p-2.5 text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Cost (EduCoins)</label>
                  <input
                    type="number"
                    value={newItemCost}
                    onChange={(e) => setNewItemCost(e.target.value)}
                    className="w-full bg-slate-50 border rounded-xl p-2.5 text-xs font-bold text-amber-600"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Icon Emoji</label>
                  <select
                    value={newItemIcon}
                    onChange={(e) => setNewItemIcon(e.target.value)}
                    className="w-full bg-slate-50 border rounded-xl p-2.5 text-xs font-bold"
                  >
                    {QUICK_EMOJIS.map(em => <option key={em} value={em}>{em} Emoji</option>)}
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <label className="text-xs font-bold text-slate-700 block mb-1">Description</label>
                  <input
                    type="text"
                    value={newItemDesc}
                    onChange={(e) => setNewItemDesc(e.target.value)}
                    placeholder="Short item description for students..."
                    className="w-full bg-slate-50 border rounded-xl p-2.5 text-xs"
                  />
                </div>

                <div className="sm:col-span-3 pt-2">
                  <button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-xs">
                    Add Item to Shop
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
              <h3 className="font-bold text-slate-900 text-base">Student Orders & Handover Ledger</h3>
              {orders.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No orders logged yet.</p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {orders.map((ord) => (
                    <div key={ord.id} className="py-3 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-900">{ord.student_name}</span> — {ord.item_name}
                        <span className="block text-[10px] font-mono text-indigo-600">Claim Code: <strong>{ord.claim_code}</strong></span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                          ord.status === 'Fulfilled' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {ord.status}
                        </span>
                        {ord.status === 'Pending' && (
                          <button
                            onClick={() => handleFulfillOrder(ord.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1 rounded-xl text-[10px]"
                          >
                            Mark Fulfilled
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TEACHER QUIZ STUDIO (TEACHER / SUPER ADMIN ONLY) */}
        {activeTab === 'studio' && (role === 'teacher' || role === 'super_admin') && (
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="bg-purple-900 text-white p-6 sm:p-8 rounded-3xl shadow-lg space-y-2">
              <h2 className="text-2xl font-black">👨‍🏫 Teacher Subject Quiz Studio</h2>
              <p className="text-xs text-purple-200">
                {role === 'teacher'
                  ? `Assigned Subject: ${teacherSubject}. Quizzes will be created under ${teacherSubject}.`
                  : 'Super Admin Mode: Full Subject Creation & Editing Unlocked.'}
              </p>
            </div>

            <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-xs space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Teaching Subject</label>
                  <select
                    value={studioSubject}
                    disabled={role === 'teacher'}
                    onChange={(e) => setStudioSubject(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800"
                  >
                    {ALL_SUBJECTS.map(subj => (
                      <option key={subj} value={subj}>{subj}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Grade Level</label>
                  <select
                    value={studioGrade}
                    onChange={(e) => setStudioGrade(parseInt(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(g => (
                      <option key={g} value={g}>Grade {g}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-700">Questions JSON Format</label>
                  <span className="text-[10px] text-indigo-600 font-bold">Supports "diagram_url" parameter</span>
                </div>
                <textarea
                  rows={9}
                  value={jsonInputText}
                  onChange={(e) => setJsonInputText(e.target.value)}
                  className="w-full bg-slate-50 border rounded-xl p-3 text-xs font-mono"
                />
              </div>

              <button
                onClick={handleTeacherCreateQuiz}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-2xl text-xs shadow-md transition"
              >
                Publish {studioSubject} Quiz
              </button>
            </div>

            <TeacherStudentTracker subjects={ALL_SUBJECTS} />
          </div>
        )}

        {/* SUPER ADMIN CONSOLE */}
        {activeTab === 'super_admin_console' && role === 'super_admin' && (
          <div className="space-y-6 max-w-5xl mx-auto">
            <div className="bg-rose-950 text-white p-6 sm:p-8 rounded-3xl shadow-lg space-y-3">
              <div className="flex items-center space-x-2 text-rose-400">
                <Shield className="w-6 h-6" />
                <span className="text-xs font-bold uppercase tracking-wider">Super Admin Master Controls</span>
              </div>
              <h2 className="text-2xl font-black">User Accounts & Staff Provisioning</h2>
              <p className="text-xs text-rose-200">
                Provision new Teacher/Shop Admin staff accounts with temporary default passwords.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
              <h3 className="font-bold text-slate-900 text-base">Provision New Staff Account</h3>
              <form onSubmit={handleSuperAdminProvisionTeacher} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Full Name</label>
                  <input
                    type="text"
                    value={newStaffName}
                    onChange={(e) => setNewStaffName(e.target.value)}
                    placeholder="e.g. Ms. Sarah Ahmed"
                    className="w-full bg-slate-50 border rounded-xl p-2.5 text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">School Email Address</label>
                  <input
                    type="email"
                    value={newStaffEmail}
                    onChange={(e) => setNewStaffEmail(e.target.value)}
                    placeholder="sarah@school.edu"
                    className="w-full bg-slate-50 border rounded-xl p-2.5 text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Assigned Subject</label>
                  <select
                    value={newStaffSubject}
                    onChange={(e) => setNewStaffSubject(e.target.value)}
                    className="w-full bg-slate-50 border rounded-xl p-2.5 text-xs font-bold text-slate-800"
                  >
                    {ALL_SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Default Temporary Password</label>
                  <input
                    type="text"
                    value={newStaffPass}
                    onChange={(e) => setNewStaffPass(e.target.value)}
                    className="w-full bg-slate-50 border rounded-xl p-2.5 text-xs font-mono font-bold"
                    required
                  />
                </div>

                <div className="sm:col-span-2 pt-2">
                  <button type="submit" className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-xs">
                    Provision Teacher Account
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
              <h3 className="text-base font-black text-slate-900">User Login & Role Matrix ({allProfiles.length})</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b text-slate-400 font-bold uppercase text-[10px]">
                      <th className="py-2.5 px-3">User</th>
                      <th className="py-2.5 px-3">Role</th>
                      <th className="py-2.5 px-3">Subject</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {allProfiles.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="py-3 px-3 font-bold text-slate-900">{p.full_name}</td>
                        <td className="py-3 px-3">
                          <select
                            value={p.role || 'student'}
                            onChange={(e) => handleUpdateUserByAdmin(p.id, { role: e.target.value })}
                            className="bg-slate-50 border rounded-xl px-2 py-1 text-xs font-bold text-indigo-700"
                          >
                            <option value="student">Student</option>
                            <option value="teacher">Teacher</option>
                            <option value="shop_admin">Shop Admin</option>
                            <option value="super_admin">Super Admin</option>
                          </select>
                        </td>
                        <td className="py-3 px-3">{p.teacher_subject || '—'}</td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${p.status === 'disabled' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}`}>
                            {p.status === 'disabled' ? '🔒 Disabled' : '✓ Active'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => handleUpdateUserByAdmin(p.id, { status: p.status === 'disabled' ? 'active' : 'disabled' })}
                            className={`px-3 py-1 rounded-xl text-[11px] font-bold ${p.status === 'disabled' ? 'bg-emerald-600 text-white' : 'bg-rose-100 text-rose-800'}`}
                          >
                            {p.status === 'disabled' ? 'Enable' : 'Disable'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* PROFILE (ROLE-TAILORED) */}
        {activeTab === 'profile' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-xs space-y-5">
              <div className="flex items-center space-x-3 pb-4 border-b">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-700 rounded-2xl flex items-center justify-center font-black text-lg">
                  {authName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">{authName}</h3>
                  <p className="text-xs text-slate-500">Email: {user.email}</p>
                </div>
              </div>

              {/* Instant Role Preview Switcher */}
              <div className="bg-indigo-50/70 border border-indigo-200 p-4 rounded-2xl space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider">Switch Active Role Preview</span>
                  <span className="text-[10px] text-indigo-600 font-bold">Current: {role.toUpperCase()}</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    onClick={() => switchRolePreview('student')}
                    className={`py-2 text-[11px] font-bold rounded-xl border transition ${role === 'student' ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs' : 'bg-white text-slate-700 border-slate-200'}`}
                  >
                    🎓 Student
                  </button>
                  <button
                    onClick={() => switchRolePreview('teacher')}
                    className={`py-2 text-[11px] font-bold rounded-xl border transition ${role === 'teacher' ? 'bg-purple-600 text-white border-purple-600 shadow-xs' : 'bg-white text-slate-700 border-slate-200'}`}
                  >
                    👨‍🏫 Teacher
                  </button>
                  <button
                    onClick={() => switchRolePreview('shop_admin')}
                    className={`py-2 text-[11px] font-bold rounded-xl border transition ${role === 'shop_admin' ? 'bg-amber-600 text-white border-amber-600 shadow-xs' : 'bg-white text-slate-700 border-slate-200'}`}
                  >
                    🏬 Shop CP
                  </button>
                  <button
                    onClick={() => switchRolePreview('super_admin')}
                    className={`py-2 text-[11px] font-bold rounded-xl border transition ${role === 'super_admin' ? 'bg-rose-600 text-white border-rose-600 shadow-xs' : 'bg-white text-slate-700 border-slate-200'}`}
                  >
                    👑 Admin
                  </button>
                </div>
              </div>

              {/* Role-Specific Credentials Card */}
              <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl space-y-2 text-xs">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Account Information</h4>
                
                {role === 'teacher' ? (
                  <div className="grid grid-cols-2 gap-2 text-slate-700">
                    <div><span className="text-slate-400">Role:</span> <strong>👨‍🏫 Teacher</strong></div>
                    <div><span className="text-slate-400">Subject:</span> <strong className="text-purple-700">{teacherSubject}</strong></div>
                  </div>
                ) : role === 'shop_admin' ? (
                  <div className="grid grid-cols-2 gap-2 text-slate-700">
                    <div><span className="text-slate-400">Role:</span> <strong>🏬 Store CP Manager</strong></div>
                    <div><span className="text-slate-400">Permissions:</span> <strong>Store & Order Handover</strong></div>
                  </div>
                ) : role === 'super_admin' ? (
                  <div className="grid grid-cols-2 gap-2 text-slate-700">
                    <div><span className="text-slate-400">Role:</span> <strong>👑 Super Admin</strong></div>
                    <div><span className="text-slate-400">Permissions:</span> <strong>Master Universal Access</strong></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 text-slate-700">
                    <div><span className="text-slate-400">Role:</span> <strong>🎓 Student</strong></div>
                    <div><span className="text-slate-400">Grade:</span> <strong>Grade {studentGrade}</strong></div>
                    <div><span className="text-slate-400">EduCoins:</span> <strong>{coins} Coins</strong></div>
                    <div><span className="text-slate-400">Reading Hours:</span> <strong>{readingHours} Hours</strong></div>
                  </div>
                )}
              </div>

              <div className="space-y-3 pt-1">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Update Account Password</h4>
                <form onSubmit={handleUserSelfChangePassword} className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">New Secure Password</label>
                    <input
                      type="password"
                      value={profileNewPassword}
                      onChange={(e) => setProfileNewPassword(e.target.value)}
                      placeholder="Enter new password (min 6 characters)"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={authLoading}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-xs"
                  >
                    {authLoading ? 'Updating Password...' : 'Save Password'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* NEW BOOK MODAL */}
      {showNewBookModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-black text-slate-900 text-base">Add New Library Book</h3>
              <button onClick={() => setShowNewBookModal(false)} className="text-slate-400 font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateNewBook} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Book Title</label>
                <input
                  type="text"
                  value={newBookTitle}
                  onChange={(e) => setNewBookTitle(e.target.value)}
                  placeholder="Book Title"
                  className="w-full bg-slate-50 border rounded-xl p-2.5 text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Subject</label>
                  <select
                    value={newBookSubject}
                    onChange={(e) => setNewBookSubject(e.target.value)}
                    className="w-full bg-slate-50 border rounded-xl p-2.5 text-xs font-bold"
                  >
                    {ALL_SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Author</label>
                  <input
                    type="text"
                    value={newBookAuthor}
                    onChange={(e) => setNewBookAuthor(e.target.value)}
                    placeholder="Author Name"
                    className="w-full bg-slate-50 border rounded-xl p-2.5 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Summary</label>
                <input
                  type="text"
                  value={newBookSummary}
                  onChange={(e) => setNewBookSummary(e.target.value)}
                  placeholder="Short overview..."
                  className="w-full bg-slate-50 border rounded-xl p-2.5 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Page 1 Content</label>
                <textarea
                  rows={4}
                  value={newBookPageText}
                  onChange={(e) => setNewBookPageText(e.target.value)}
                  placeholder="Enter book text..."
                  className="w-full bg-slate-50 border rounded-xl p-2.5 text-xs font-serif"
                />
              </div>

              <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-md">
                Publish Book
              </button>
            </form>
          </div>
        </div>
      )}

      {/* PHYSICAL BOOK CLAIM CODE VERIFICATION MODAL */}
      {claimingBook && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-black text-slate-900 text-base">Claim Physical Library Book</h3>
              <button onClick={() => setClaimingBook(null)} className="text-slate-400 font-bold">✕</button>
            </div>

            <p className="text-xs text-slate-500">
              Enter the official verification claim code printed inside <strong>"{claimingBook.title}"</strong> or provided by your school librarian.
            </p>

            <form onSubmit={(e) => handleClaimPhysicalBook(e, claimingBook)} className="space-y-3">
              <input
                type="text"
                value={physicalClaimInput}
                onChange={(e) => setPhysicalClaimInput(e.target.value)}
                placeholder="e.g. LIB-PHYS-101"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono font-bold text-center text-slate-800"
                required
              />

              <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 rounded-xl text-xs shadow-md">
                Verify & Claim +{claimingBook.reading_hours} Hours
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ONLINE E-READER MODAL */}
      {selectedBook && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-md">{selectedBook.subject}</span>
                <h3 className="font-black text-slate-900 text-lg mt-1">{selectedBook.title}</h3>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-xs font-mono font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Time Read: {Math.floor(activeReadingSeconds / 60)}m {activeReadingSeconds % 60}s</span>
                </span>
                <button onClick={() => setSelectedBook(null)} className="text-slate-400 font-bold text-lg">✕</button>
              </div>
            </div>

            <div className={`bg-slate-50 border border-slate-200 p-6 rounded-2xl min-h-[220px] text-xs leading-relaxed whitespace-pre-line font-serif text-slate-800 ${
              isRTLSubject(selectedBook.subject) ? 'text-right dir-rtl font-thana' : ''
            }`}>
              {Array.isArray(selectedBook.pages) ? selectedBook.pages[bookPageIndex] : selectedBook.pages}
            </div>

            <div className="flex justify-between items-center border-t pt-3">
              <span className="text-xs font-bold text-slate-500">Auto-Detecting Reading Time...</span>
              <button
                onClick={() => handleFinishOnlineReading(selectedBook)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-md transition"
              >
                Finish & Save Reading Time
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QUIZ RUNNER OVERLAY WITH DIAGRAM SUPPORT */}
      {activeQuiz && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 transition-all duration-300">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-8 space-y-5 shadow-2xl border border-slate-100 relative overflow-hidden max-h-[95vh] overflow-y-auto">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

            {!quizFinished && !gameOver ? (
              <>
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div className="flex items-center space-x-3">
                    <span className="bg-slate-100 text-slate-700 font-extrabold text-xs px-3 py-1.5 rounded-xl border border-slate-200/80">
                      Q {currentQuestionIdx + 1} / {activeQuiz.questions.length}
                    </span>

                    {(quizMode === 'challenge' || quizMode === 'olevel') && (
                      <div className="flex items-center space-x-1.5 bg-rose-50 border border-rose-200/60 px-3 py-1.5 rounded-xl">
                        {[...Array(3)].map((_, i) => (
                          <Heart
                            key={i}
                            className={`w-4 h-4 transition-all duration-300 ${
                              i < hearts
                                ? 'text-rose-500 fill-rose-500 scale-100 drop-shadow-xs'
                                : 'text-slate-300 fill-slate-200 scale-90 opacity-40'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2.5">
                    {(quizMode === 'challenge' || quizMode === 'olevel') && (
                      <div className={`flex items-center space-x-1.5 font-mono font-bold text-xs px-3 py-1.5 rounded-xl border transition-colors ${
                        timeLeft < 15
                          ? 'bg-rose-50 border-rose-300 text-rose-600 animate-pulse'
                          : 'bg-amber-50 border-amber-200 text-amber-700'
                      }`}>
                        <Clock className="w-3.5 h-3.5" />
                        <span>{Math.floor(timeLeft / 60)}m {String(timeLeft % 60).padStart(2, '0')}s</span>
                      </div>
                    )}

                    {streak > 1 && (
                      <div className="flex items-center space-x-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black text-xs px-3 py-1.5 rounded-xl shadow-xs">
                        <Flame className="w-3.5 h-3.5 fill-white" />
                        <span>{streak}x Streak</span>
                      </div>
                    )}

                    <button
                      onClick={() => setActiveQuiz(null)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* DIAGRAM DISPLAY AREA */}
                {activeQuiz.questions[currentQuestionIdx].diagram_url && (
                  <div className="w-full bg-slate-900/5 border border-slate-200 rounded-2xl p-2.5 flex flex-col justify-center items-center space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1 self-start px-1">
                      <ImageIcon className="w-3 h-3 text-indigo-600" />
                      <span>Question Reference Diagram</span>
                    </span>
                    <img
                      src={activeQuiz.questions[currentQuestionIdx].diagram_url}
                      alt="Question Diagram"
                      className="max-h-56 sm:max-h-64 w-auto object-contain rounded-xl shadow-xs border border-white"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold tracking-wider uppercase text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-lg">
                      {activeQuiz.questions[currentQuestionIdx].topic || activeQuiz.subject}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">{activeQuiz.title}</span>
                  </div>

                  <h3 className={`text-base sm:text-lg font-black text-slate-900 leading-snug pt-1 ${
                    isRTLSubject(activeQuiz.subject) ? 'text-right dir-rtl font-thana' : ''
                  }`}>
                    {activeQuiz.questions[currentQuestionIdx].question_text}
                  </h3>
                </div>

                <div className="space-y-2.5">
                  {['A', 'B', 'C', 'D'].map((opt) => {
                    const optionText = activeQuiz.questions[currentQuestionIdx][`option_${opt.toLowerCase()}`];
                    if (!optionText) return null;

                    const isCorrectOpt = opt === activeQuiz.questions[currentQuestionIdx].correct_option;
                    const isSelectedOpt = selectedOption === opt;

                    let btnStyle = "bg-slate-50 border-slate-200 text-slate-800 hover:bg-indigo-50/50 hover:border-indigo-300";
                    let badgeStyle = "bg-white text-slate-700 border-slate-300";

                    if (showExplanation) {
                      if (isCorrectOpt) {
                        btnStyle = "bg-emerald-50 border-emerald-400 text-emerald-950 font-bold shadow-xs ring-2 ring-emerald-400/20";
                        badgeStyle = "bg-emerald-600 text-white border-emerald-600";
                      } else if (isSelectedOpt) {
                        btnStyle = "bg-rose-50 border-rose-400 text-rose-950 font-bold shadow-xs";
                        badgeStyle = "bg-rose-600 text-white border-rose-600";
                      } else {
                        btnStyle = "bg-slate-50/50 border-slate-200 text-slate-400 opacity-50";
                        badgeStyle = "bg-slate-100 text-slate-400 border-slate-200";
                      }
                    }

                    return (
                      <button
                        key={opt}
                        onClick={() => handleAnswerSubmit(opt)}
                        disabled={showExplanation}
                        className={`w-full p-3.5 rounded-2xl border-2 text-left text-xs sm:text-sm font-medium transition-all duration-200 flex items-center space-x-3 group ${btnStyle}`}
                      >
                        <span className={`w-7 h-7 rounded-xl border flex items-center justify-center font-black text-xs shrink-0 transition-colors ${badgeStyle}`}>
                          {opt}
                        </span>
                        <span className="flex-1 leading-normal">{optionText}</span>
                        {showExplanation && isCorrectOpt && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        )}
                        {showExplanation && isSelectedOpt && !isCorrectOpt && (
                          <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {showExplanation && (
                  <div className="space-y-4 pt-1">
                    <div className="bg-gradient-to-r from-slate-50 to-indigo-50/30 border border-slate-200 p-4 rounded-2xl space-y-1">
                      <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wide flex items-center space-x-1">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Mark Scheme & Concept Breakdown</span>
                      </span>
                      <p className="text-xs text-slate-700 leading-relaxed font-normal">
                        {activeQuiz.questions[currentQuestionIdx].explanation || 'Option verified against subject mark scheme.'}
                      </p>
                    </div>

                    <button
                      onClick={nextQuestion}
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-black py-3.5 rounded-2xl text-xs sm:text-sm shadow-md transition flex items-center justify-center space-x-2"
                    >
                      <span>{currentQuestionIdx + 1 < activeQuiz.questions.length ? 'Next Question' : 'View Quiz Summary'}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            ) : gameOver ? (
              <div className="text-center py-8 space-y-5">
                <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-3xl flex items-center justify-center mx-auto border border-rose-200">
                  <Heart className="w-10 h-10 text-rose-500" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-slate-900">Session Ended</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    You ran out of lives or time during this session. Review your weak topics to strengthen your performance!
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl max-w-sm mx-auto flex justify-around text-center text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Questions Attempted</span>
                    <span className="text-base font-black text-slate-800">{currentQuestionIdx} / {activeQuiz.questions.length}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Correct Answers</span>
                    <span className="text-base font-black text-emerald-600">{score}</span>
                  </div>
                </div>

                <div className="flex justify-center space-x-3 pt-2">
                  <button
                    onClick={() => startQuiz(activeQuiz, quizMode)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-2xl text-xs shadow-md transition flex items-center space-x-1.5"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Try Again</span>
                  </button>
                  <button
                    onClick={() => setActiveQuiz(null)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-6 py-3 rounded-2xl text-xs transition"
                  >
                    Return to Vault
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 space-y-6">
                <div className="w-20 h-20 bg-gradient-to-tr from-amber-400 to-yellow-300 text-amber-900 rounded-3xl flex items-center justify-center mx-auto shadow-lg border-2 border-amber-200">
                  <Trophy className="w-10 h-10 text-amber-900" />
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full">
                    Quiz Completed!
                  </span>
                  <h3 className="text-2xl font-black text-slate-900 pt-1">{activeQuiz.title}</h3>
                </div>

                <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
                  <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Score</span>
                    <span className="text-lg font-black text-slate-900">{score} / {activeQuiz.questions.length}</span>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl text-center">
                    <span className="text-[10px] font-bold text-amber-700 uppercase block">+Coins</span>
                    <span className="text-lg font-black text-amber-600">+{score * 15}</span>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 p-3 rounded-2xl text-center">
                    <span className="text-[10px] font-bold text-purple-700 uppercase block">+XP Gained</span>
                    <span className="text-lg font-black text-purple-600">+{score * 30}</span>
                  </div>
                </div>

                <button
                  onClick={() => setActiveQuiz(null)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-3.5 rounded-2xl text-xs shadow-md transition"
                >
                  Return to Dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}