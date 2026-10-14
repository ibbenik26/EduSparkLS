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
  Building2, Bookmark, CheckSquare
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
              <span>Print Hard-Copy Certificate</span>
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

// --- Book-Specific Library Code Verification Modal ---
function ClaimReadingHoursModal({ book, onVerified, onClose }) {
  const [passcodeInput, setPasscodeInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const isRTL = isRTLSubject(book.subject);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    const targetCode = (book.claim_code || 'LIB-2026').trim().toUpperCase();
    const enteredCode = passcodeInput.trim().toUpperCase();

    if (enteredCode !== targetCode) {
      setErrorMsg(`Invalid Code for "${book.title}". Please ask your librarian for this book's specific code.`);
      return;
    }

    onVerified();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-100">
        <div className="flex justify-between items-center border-b pb-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
              <BookOpenCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base">Claim Library Reading Hours</h3>
              <p className="text-[11px] text-slate-500 font-medium">{book.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 font-bold">✕</button>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-900 flex justify-between items-center">
          <div>
            <span className="block font-bold text-[10px] uppercase text-emerald-700">Reading Credit Value</span>
            <span className="text-lg font-black">{book.reading_hours || 2.0} School Reading Hours</span>
          </div>
          <span className="text-3xl">📚</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-800 block flex items-center justify-between">
              <span>🔑 Enter Book Claim Code:</span>
              <span className="text-[10px] text-slate-400 font-normal">(Provided by school librarian)</span>
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={passcodeInput}
                onChange={(e) => setPasscodeInput(e.target.value)}
                placeholder="e.g. LIB-DHIV-01"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 text-xs font-mono font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 uppercase tracking-wide"
                required
              />
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-semibold flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="flex space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-2/3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-md transition flex items-center justify-center space-x-1"
            >
              <span>Submit Code & Claim</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- Teacher Student Topic Diagnostics Inspector Modal ---
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

// --- Subject Analytics Diagnostic Card Component ---
function SubjectAnalyticsCard({ subject, attempts }) {
  const stats = generateSubjectAnalytics(subject, attempts);
  if (!stats) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-black text-slate-900">{stats.subject} Syllabus Diagnostics</h3>
            {stats.isCompleteReportUnlocked ? (
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                ✓ Diagnostic Report Complete
              </span>
            ) : (
              <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full">
                Progress: {stats.completedCount}/10 Quizzes
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Topic mastery breakdown aggregated across attempted quizzes.</p>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-4 space-y-2">
          <h4 className="text-xs font-black text-emerald-800 flex items-center space-x-1">
            <span>👍 Topics Mastered ({stats.strongTopics.length})</span>
          </h4>
          {stats.strongTopics.length === 0 ? (
            <p className="text-xs text-emerald-700 italic">No mastered topics recorded yet.</p>
          ) : (
            <ul className="text-xs text-emerald-900 space-y-1">
              {stats.strongTopics.map((st, i) => (
                <li key={i} className="flex justify-between items-center bg-white/80 px-2.5 py-1.5 rounded-xl border border-emerald-100">
                  <span className="font-semibold text-slate-800">{st.topic}</span>
                  <span className="font-bold text-emerald-700">{st.accuracy}%</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-rose-50/60 border border-rose-200/80 rounded-2xl p-4 space-y-2">
          <h4 className="text-xs font-black text-rose-800 flex items-center space-x-1">
            <span>🎯 Weak Topics Needing Revision ({stats.weakTopics.length})</span>
          </h4>
          {stats.weakTopics.length === 0 ? (
            <p className="text-xs text-rose-700 italic">No weak topics found! Excellent work.</p>
          ) : (
            <ul className="text-xs text-rose-900 space-y-1.5">
              {stats.weakTopics.map((wt, i) => (
                <li key={i} className="bg-white/80 p-2 rounded-xl border border-rose-100 space-y-0.5">
                  <div className="flex justify-between font-bold text-slate-800">
                    <span>{wt.topic}</span>
                    <span className="text-rose-600">{wt.accuracy}%</span>
                  </div>
                  {wt.explanation && (
                    <p className="text-[10px] text-slate-500 italic">Focus: {wt.explanation}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Initial Datasets with Per-Book Claim Codes ---
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
    reading_hours: 2.5,
    claim_code: 'LIB-DHIV-01',
    pages: [
      "ފުރަތަމަ ބާބު: ތާނަ އަކުރު\n\nދިވެހިބަހުން ލިޔުމަށް ބޭނުންކުރަނީ ތާނައަކުރެވެ. ތާނައަކުރުގައި ހިމެނެނީ 24 އަކުރާއި 11 ޒަވިޔަން އަކުރެވެ.",
      "ދެވަނަ ބާބު: ފިލި\n\nތާނައިގައި 10 ފިލި ބޭނުންކުރެވެއެވެ."
    ]
  },
  {
    id: 'book_islam_1',
    title: 'އިސްލާމީ ތަރުބިޔަތު',
    subject: 'Islam',
    author: 'މިނިސްޓްރީ އޮފް އެޑިޔުކޭޝަން',
    cover_url: 'https://images.unsplash.com/photo-1585036156171-384164a8c675?auto=format&fit=crop&w=600&q=80',
    summary: 'އީމާންކަމުގެ އަސާސްތަކާއި އަޚްލާޤީ މިންގަނޑުތައް.',
    extract: 'ފުރަތަމަ ފިލާވަޅު: އީމާންކަމުގެ އަރުކާންތައް... އީމާންކަމުގެ އަރުކާނަކީ 6 ކަމެކެވެ.',
    reading_hours: 3.0,
    claim_code: 'LIB-ISLAM-02',
    pages: [
      "ފުރަތަމަ ފިލާވަޅު: އީމާންކަމުގެ އަރުކާންތައް\n\nއީމާންކަމުގެ އަރުކާނަކީ 6 ކަމެކެވެ.\n\n1. ﷲ އަށް އީމާންވުން\n2. މަލާއިކަތުންނަށް އީމާންވުން"
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
    reading_hours: 4.0,
    claim_code: 'LIB-PHYS-101',
    pages: [
      "CHAPTER 1: THE LAWS OF MOTION\n\nPhysics is the fundamental science that seeks to understand how the universe behaves."
    ]
  }
];

const INITIAL_BADGES = [
  { id: 'b1', title: 'First Step', desc: 'Completed your first quiz or reading log.', icon: '🎯', minQuizzes: 1, minBooks: 0, minXp: 0, minCoins: 0, minStreak: 0 },
  { id: 'b2', title: 'Bookworm', desc: 'Read at least 3 books or logged 10+ reading hours.', icon: '📚', minQuizzes: 0, minBooks: 3, minXp: 0, minCoins: 0, minStreak: 0 },
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
        topic: 'Kinematics & Motion',
        question_text: 'A car accelerates uniformly from rest to a velocity of 20 m/s in 5 seconds. What is its acceleration?',
        option_a: '2 m/s²', option_b: '4 m/s²', option_c: '5 m/s²', option_d: '100 m/s²',
        correct_option: 'B', explanation: 'Acceleration a = (v - u) / t = (20 - 0) / 5 = 4 m/s².'
      }
    ]
  }
];

export default function App() {
  // --- Auth View State ---
  const [authView, setAuthView] = useState('landing');

  // --- Auth Credentials State ---
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('student');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [indexNumber, setIndexNumber] = useState('');
  const [teacherPasscode, setTeacherPasscode] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  // --- Student Stats ---
  const [studentGrade, setStudentGrade] = useState(7);
  const [coins, setCoins] = useState(150);
  const [xp, setXp] = useState(240);
  const [streak, setStreak] = useState(1);
  const [quizzesCompleted, setQuizzesCompleted] = useState(0);
  const [booksRead, setBooksRead] = useState(0);
  const [readingHours, setReadingHours] = useState(5.5);
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
  const [claimingBook, setClaimingBook] = useState(null);
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
  const [userAnswers, setUserAnswers] = useState({});

  // --- Admin CRUD Center State ---
  const [adminTab, setAdminTab] = useState('books');
  const [editingBook, setEditingBook] = useState(null);
  const [bookForm, setBookForm] = useState({
    title: '', author: '', subject: 'Dhivehi', cover_url: '', summary: '', extract: '', pageText: '',
    reading_hours: 2.0, claim_code: ''
  });

  // --- Supabase Session Listener ---
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

    return () => subscription.unsubscribe();
  }, []);

  const fetchDatabaseBooks = async () => {
    try {
      const { data } = await supabase.from('books').select('*').order('created_at', { ascending: false });
      if (data && data.length > 0) {
        const formatted = data.map(b => ({
          ...b,
          pages: typeof b.pages === 'string' ? JSON.parse(b.pages) : b.pages,
          reading_hours: b.reading_hours || 2.0,
          claim_code: b.claim_code || 'LIB-2026'
        }));
        const dbIds = new Set(formatted.map(b => b.id));
        setBooks([...formatted, ...INITIAL_BOOKS.filter(b => !dbIds.has(b.id))]);
      }
    } catch (e) { console.warn("Books fetch error:", e); }
  };

  const fetchDatabaseQuizzes = async () => {
    try {
      const { data } = await supabase.from('quizzes').select('*').order('created_at', { ascending: false });
      if (data && data.length > 0) {
        const formatted = data.map(q => ({
          ...q,
          questions: typeof q.questions === 'string' ? JSON.parse(q.questions) : q.questions
        }));
        const dbIds = new Set(formatted.map(q => q.id));
        setQuizzes([...formatted, ...INITIAL_QUIZZES.filter(q => !dbIds.has(q.id))]);
      }
    } catch (e) { console.warn("Quizzes fetch error:", e); }
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
        setReadingHours(data.reading_hours ?? 5.5);
        setClaimedRewards(data.claimed_rewards || []);
        setActivityLog(data.activity_log || []);
        setCompletedChallenges(data.completed_challenges || []);
        setChallengeAttempts(data.challenge_attempts || []);
        setCompletedBookIds(data.completed_book_ids || []);
      }
    } catch (e) { console.warn("Profile fetch error:", e); }
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
        reading_hours: updates.reading_hours ?? readingHours,
        books_read: updates.books_read ?? booksRead,
        claimed_rewards: updates.claimed_rewards ?? claimedRewards,
        activity_log: updates.activity_log ?? activityLog,
        completed_book_ids: updates.completed_book_ids ?? completedBookIds,
        updated_at: new Date().toISOString()
      });
    } catch (e) { console.warn("Profile sync error:", e); }
  };

  // --- Claim Verified Reading Hours ---
  const handleClaimVerifiedReadingHours = (book) => {
    const hoursToCredit = parseFloat(book.reading_hours) || 2.0;
    const newReadingHours = Math.round((readingHours + hoursToCredit) * 10) / 10;
    const newCoins = coins + Math.round(hoursToCredit * 15);
    const newXp = xp + Math.round(hoursToCredit * 30);
    const newCompletedBookIds = Array.from(new Set([...completedBookIds, book.id]));
    const newBooksReadCount = booksRead + 1;

    const newLog = [
      {
        id: `act_${Date.now()}`,
        title: `📚 Logged Library Book: ${book.title}`,
        readingHoursLogged: hoursToCredit,
        coinsGained: Math.round(hoursToCredit * 15),
        xpGained: Math.round(hoursToCredit * 30),
        date: 'Just now'
      },
      ...activityLog
    ];

    setReadingHours(newReadingHours);
    setCoins(newCoins);
    setXp(newXp);
    setBooksRead(newBooksReadCount);
    setCompletedBookIds(newCompletedBookIds);
    setActivityLog(newLog);
    setClaimingBook(null);

    playSound('coin');
    confetti({ particleCount: 110, spread: 80 });

    syncProfileToSupabase({
      reading_hours: newReadingHours,
      coins: newCoins,
      xp: newXp,
      books_read: newBooksReadCount,
      completed_book_ids: newCompletedBookIds,
      activity_log: newLog
    });

    alert(`🎉 Verified! Logged +${hoursToCredit} Reading Hours, +${Math.round(hoursToCredit * 15)} EduCoins, and +${Math.round(hoursToCredit * 30)} XP!`);
  };

  // --- Save / Edit Book Admin Handler ---
  const handleSaveBook = async (e) => {
    e.preventDefault();
    if (!bookForm.title || !bookForm.author || !bookForm.pageText) return alert("Please fill title, author, and chapter page text.");
    if (!bookForm.claim_code.trim()) return alert("Please specify a unique Library Claim Code for this book.");

    const parsedPages = bookForm.pageText.includes('---PAGE---')
      ? bookForm.pageText.split('---PAGE---').map(p => p.trim())
      : [bookForm.pageText.trim()];

    const bookObject = {
      title: bookForm.title,
      author: bookForm.author,
      subject: bookForm.subject,
      cover_url: bookForm.cover_url || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=600&q=80',
      summary: bookForm.summary,
      extract: bookForm.extract || parsedPages[0].slice(0, 120) + '...',
      pages: parsedPages,
      reading_hours: parseFloat(bookForm.reading_hours) || 2.0,
      claim_code: bookForm.claim_code.trim().toUpperCase()
    };

    if (editingBook) {
      try {
        await supabase.from('books').update(bookObject).eq('id', editingBook.id);
        setBooks(books.map(b => b.id === editingBook.id ? { ...b, ...bookObject } : b));
        setEditingBook(null);
        alert("✅ Book and Claim Code updated!");
      } catch (err) { alert("Update failed: " + err.message); }
    } else {
      const newBook = { id: `book_${Date.now()}`, ...bookObject };
      try {
        await supabase.from('books').insert([newBook]);
        setBooks([newBook, ...books]);
        alert("✅ New Book published with unique claim code!");
      } catch (err) { alert("Create failed: " + err.message); }
    }

    setBookForm({
      title: '', author: '', subject: 'Dhivehi', cover_url: '', summary: '', extract: '', pageText: '',
      reading_hours: 2.0, claim_code: ''
    });
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
      pageText: Array.isArray(book.pages) ? book.pages.join('\n\n---PAGE---\n\n') : book.pages,
      reading_hours: book.reading_hours || 2.0,
      claim_code: book.claim_code || ''
    });
  };

  const handleDeleteBook = async (id) => {
    if (confirm("Delete this book?")) {
      try { await supabase.from('books').delete().eq('id', id); } catch (e) { console.warn(e); }
      setBooks(books.filter(b => b.id !== id));
    }
  };

  // --- Tab Navigation ---
  const navigateToTab = (tabName) => {
    setActiveQuiz(null);
    setSelectedBook(null);
    setClaimingBook(null);
    setIsFullScreenReader(false);
    setActiveTab(tabName);
  };

  const filteredBooks = books.filter(b => selectedSubject === 'All' || b.subject === selectedSubject);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* HEADER NAV */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigateToTab('dashboard')}>
            <div className="bg-indigo-600 p-2 rounded-xl text-white">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-900">EduSpark <span className="text-indigo-600">IQ</span></h1>
              <p className="text-[10px] text-slate-500 font-medium">School Library & Academic Portal</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-xs font-bold">
            <div className="bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full text-emerald-800 flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              <span>{readingHours} School Reading Hrs</span>
            </div>
            <div className="bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full text-amber-800 flex items-center space-x-1">
              <Coins className="w-3.5 h-3.5 text-amber-600" />
              <span>{coins} Coins</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 flex space-x-2 text-xs border-t py-1.5">
          <button onClick={() => navigateToTab('dashboard')} className={`px-3 py-1.5 rounded-xl font-bold ${activeTab === 'dashboard' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600'}`}>
            📖 Practice Vault
          </button>
          <button onClick={() => navigateToTab('library')} className={`px-3 py-1.5 rounded-xl font-bold ${activeTab === 'library' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600'}`}>
            📚 E-Library & Physical Books
          </button>
          <button onClick={() => navigateToTab('settings')} className={`px-3 py-1.5 rounded-xl font-bold ${activeTab === 'settings' ? 'bg-rose-50 text-rose-700' : 'text-slate-600'}`}>
            ⚙️ Admin / Librarian Studio
          </button>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">

        {/* E-LIBRARY & PHYSICAL SCHOOL LIBRARY SECTION */}
        {activeTab === 'library' && (
          <div className="space-y-6">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-emerald-800 via-teal-700 to-cyan-800 text-white p-6 sm:p-8 rounded-3xl shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-2 max-w-xl">
                <div className="flex items-center space-x-2">
                  <Library className="w-6 h-6 text-emerald-300" />
                  <h2 className="text-2xl sm:text-3xl font-black">School Library & E-Reading Hub</h2>
                </div>
                <p className="text-xs text-emerald-100 leading-relaxed">
                  Read digital books online or borrow physical books from the school library. Enter the **Book-Specific Code** provided by your librarian to log your official **School Reading Hours**.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl text-center space-y-1">
                <span className="text-[10px] text-emerald-200 block uppercase font-bold">Your Total Logged Reading</span>
                <span className="text-2xl font-black text-amber-300">{readingHours} Hours</span>
              </div>
            </div>

            {/* Subject Filters */}
            <div className="flex items-center space-x-2 overflow-x-auto py-1">
              <button
                onClick={() => setSelectedSubject('All')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 ${selectedSubject === 'All' ? 'bg-emerald-600 text-white' : 'bg-white border text-slate-600'}`}
              >
                All Subjects
              </button>
              {ALL_SUBJECTS.map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSubject(s)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 ${s === 'Dhivehi' || s === 'Islam' ? 'font-faruma' : ''} ${selectedSubject === s ? 'bg-emerald-600 text-white' : 'bg-white border text-slate-600'}`}
                >
                  {s === 'Dhivehi' ? '🇲🇻 ދިވެހި' : s === 'Islam' ? '☪️ އިސްލާމް' : s}
                </button>
              ))}
            </div>

            {/* Books Display Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredBooks.map((book) => {
                const isRTL = isRTLSubject(book.subject);
                const isLogged = completedBookIds.includes(book.id);

                return (
                  <div key={book.id} className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between">
                    <div>
                      {/* Cover & Reading Hours Badge */}
                      <div className="relative h-48 bg-slate-100 overflow-hidden">
                        <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
                        
                        <span className={`absolute top-3 left-3 text-[11px] font-bold px-2.5 py-1 rounded-xl shadow-xs ${isRTL ? 'bg-amber-500 text-white font-faruma' : 'bg-emerald-600 text-white'}`}>
                          {book.subject}
                        </span>

                        {/* Reading Hours Badge */}
                        <span className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-xs text-amber-300 text-[11px] font-black px-2.5 py-1 rounded-xl flex items-center space-x-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{book.reading_hours || 2.0} Reading Hrs</span>
                        </span>

                        {isLogged && (
                          <span className="absolute top-3 right-3 bg-emerald-500 text-white text-[10px] font-black px-2.5 py-1 rounded-xl flex items-center space-x-1 shadow-xs">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Logged</span>
                          </span>
                        )}
                      </div>

                      {/* Content details */}
                      <div className="p-5 space-y-3">
                        <div className={isRTL ? 'text-right font-faruma' : 'text-left'} dir={isRTL ? 'rtl' : 'ltr'}>
                          <h4 className={`font-black text-slate-900 ${isRTL ? 'text-xl' : 'text-base'}`}>{book.title}</h4>
                          <p className="text-xs text-slate-400 mt-0.5">By {book.author}</p>
                          
                          <div className={`mt-3 p-3 bg-slate-50 border border-slate-100 rounded-2xl text-slate-600 italic ${isRTL ? 'text-xs font-faruma' : 'text-xs font-serif'}`}>
                            "{book.extract || (Array.isArray(book.pages) ? book.pages[0].slice(0, 100) + '...' : '')}"
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="p-5 pt-0 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        {/* Read Online Button */}
                        <button
                          onClick={() => { setSelectedBook(book); setBookPageIndex(0); }}
                          className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 rounded-xl text-xs flex items-center justify-center space-x-1"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Read Online</span>
                        </button>

                        {/* Claim Library Reading Hours Button */}
                        <button
                          onClick={() => setClaimingBook(book)}
                          className={`w-full font-bold py-2 rounded-xl text-xs flex items-center justify-center space-x-1 transition ${
                            isLogged
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                          }`}
                        >
                          <Award className="w-3.5 h-3.5" />
                          <span>{isLogged ? '✓ Hours Logged' : 'Claim Hours'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ADMIN CONTROL PANEL */}
        {activeTab === 'settings' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white border p-6 rounded-3xl shadow-xs space-y-4">
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="font-black text-base text-slate-900">Book & Library Reading Hours Manager</h3>
              </div>

              <form onSubmit={handleSaveBook} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={bookForm.title}
                    onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })}
                    placeholder="Book Title"
                    className="bg-slate-50 border rounded-xl p-2.5 text-xs text-slate-800"
                    required
                  />
                  <input
                    type="text"
                    value={bookForm.author}
                    onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })}
                    placeholder="Author Name"
                    className="bg-slate-50 border rounded-xl p-2.5 text-xs text-slate-800"
                    required
                  />
                  <select
                    value={bookForm.subject}
                    onChange={(e) => setBookForm({ ...bookForm, subject: e.target.value })}
                    className="bg-slate-50 border rounded-xl p-2.5 text-xs font-bold text-slate-800"
                  >
                    {ALL_SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      ⏱️ Assigned Reading Hours (School Credit)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={bookForm.reading_hours}
                      onChange={(e) => setBookForm({ ...bookForm, reading_hours: e.target.value })}
                      placeholder="e.g. 2.5"
                      className="w-full bg-slate-50 border rounded-xl p-2.5 text-xs font-bold text-emerald-700"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      🔑 Unique Book Claim Code (Librarian Code)
                    </label>
                    <input
                      type="text"
                      value={bookForm.claim_code}
                      onChange={(e) => setBookForm({ ...bookForm, claim_code: e.target.value })}
                      placeholder="e.g. LIB-DHIV-01"
                      className="w-full bg-slate-50 border rounded-xl p-2.5 text-xs font-mono font-bold text-purple-700 uppercase"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="url"
                    value={bookForm.cover_url}
                    onChange={(e) => setBookForm({ ...bookForm, cover_url: e.target.value })}
                    placeholder="Cover Image URL (https://...)"
                    className="bg-slate-50 border rounded-xl p-2.5 text-xs text-slate-800"
                  />
                  <input
                    type="text"
                    value={bookForm.extract}
                    onChange={(e) => setBookForm({ ...bookForm, extract: e.target.value })}
                    placeholder="Short Extract / Teaser"
                    className="bg-slate-50 border rounded-xl p-2.5 text-xs text-slate-800"
                  />
                </div>

                <textarea
                  rows={4}
                  value={bookForm.pageText}
                  onChange={(e) => setBookForm({ ...bookForm, pageText: e.target.value })}
                  placeholder="Digital Page Text (Use ---PAGE--- for chapter splits)..."
                  className="w-full bg-slate-50 border rounded-xl p-3 text-xs"
                  required
                />

                <div className="flex space-x-2">
                  <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs">
                    {editingBook ? 'Save Changes' : 'Publish Book & Assign Code'}
                  </button>
                  {editingBook && (
                    <button type="button" onClick={() => setEditingBook(null)} className="bg-slate-100 text-slate-600 font-bold px-4 py-2.5 rounded-xl text-xs">
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Catalog list in admin */}
            <div className="bg-white border rounded-3xl p-6 shadow-xs space-y-3">
              <h3 className="text-sm font-black text-slate-900">Book Library Catalog & Claim Codes</h3>
              <div className="divide-y divide-slate-100">
                {books.map((b) => (
                  <div key={b.id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img src={b.cover_url} alt="" className="w-10 h-10 object-cover rounded-lg" />
                      <div>
                        <h4 className="font-bold text-xs text-slate-900">{b.title}</h4>
                        <span className="text-[11px] text-slate-500">
                          {b.subject} • {b.reading_hours || 2.0} hrs • Code: <strong className="font-mono text-purple-700">{b.claim_code || 'N/A'}</strong>
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button onClick={() => startEditBook(b)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl"><Edit3 className="w-4 h-4" /></button>
                      <button onClick={() => handleDeleteBook(b.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* VERIFICATION CLAIM MODAL */}
      {claimingBook && (
        <ClaimReadingHoursModal
          book={claimingBook}
          onVerified={() => handleClaimVerifiedReadingHours(claimingBook)}
          onClose={() => setClaimingBook(null)}
        />
      )}
    </div>
  );
}