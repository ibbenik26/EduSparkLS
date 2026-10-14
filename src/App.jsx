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
  PackageCheck, ShoppingCart, Store, Sparkle, Crown, Calendar
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

// --- Physical LS Gift Claim Voucher Modal ---
function PhysicalGiftVoucherModal({ redemption, onClose }) {
  if (!redemption) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-amber-200 relative overflow-hidden">
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 -mx-6 -mt-6 p-6 text-white text-center space-y-1">
          <Store className="w-10 h-10 mx-auto text-amber-100" />
          <h3 className="text-xl font-black">LS Gift Store Claim Voucher</h3>
          <p className="text-xs text-amber-100">Official Physical Item Pickup Receipt</p>
        </div>

        <div className="space-y-4 text-center">
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl space-y-1">
            <span className="text-[10px] font-bold uppercase text-amber-800 block">Item Purchased</span>
            <span className="text-lg font-black text-slate-900">{redemption.name}</span>
            <span className="text-xs text-amber-700 block font-medium">Cost: {redemption.cost} EduCoins</span>
          </div>

          <div className="space-y-1 bg-slate-50 border p-4 rounded-2xl">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Pickup Claim Code</span>
            <span className="text-2xl font-mono font-black text-indigo-700 tracking-wider">{redemption.code}</span>
            <p className="text-[10px] text-slate-500 pt-1">Show this claim code to the librarian or school shop manager to claim your real physical item!</p>
          </div>
        </div>

        <div className="flex space-x-2 pt-2">
          <button
            onClick={() => window.print()}
            className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center space-x-1"
          >
            <Printer className="w-4 h-4" />
            <span>Print Voucher</span>
          </button>
          <button
            onClick={onClose}
            className="w-1/2 bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 rounded-xl text-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Book-Specific Library Code Verification Modal ---
function ClaimReadingHoursModal({ book, onVerified, onClose }) {
  const [passcodeInput, setPasscodeInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

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

// --- Datasets: Real LS Physical Gifts & Digital Items ---
const INITIAL_SHOP_ITEMS = [
  { id: 'item_p1', name: 'LS Stainless Steel Water Bottle', category: 'Physical Store', is_physical: true, cost: 450, icon: '🥛', desc: 'Official insulated 500ml LS School Water Bottle. Claim in physical library store!' },
  { id: 'item_p2', name: 'LS Hardcover A5 Study Journal', category: 'Physical Store', is_physical: true, cost: 250, icon: '📓', desc: 'Embossed leatherette notebook for study notes and homework tracking.' },
  { id: 'item_p3', name: 'Faber-Castell Gel Pen 5-Pack', category: 'Physical Store', is_physical: true, cost: 180, icon: '✏️', desc: 'High quality smooth gel pens in blue, black, red, green, and purple.' },
  { id: 'item_p4', name: 'LS School Branded Hoodie', category: 'Physical Store', is_physical: true, cost: 850, icon: '🧥', desc: 'Cozy embroidered school hoodie. Choose size when picking up at LS store.' },
  { id: 'item_1', name: 'Homework Waiver Pass', category: 'Privilege', is_physical: false, cost: 300, icon: '🎟️', desc: '1 homework waiver card approved by your class teacher.' },
  { id: 'item_2', name: 'Golden Profile Border', category: 'Digital Perk', is_physical: false, cost: 150, icon: '👑', desc: 'Custom shiny gold frame around your avatar on the leaderboard.' },
  { id: 'item_3', name: '24h Double XP Booster', category: 'Booster', is_physical: false, cost: 200, icon: '⚡', desc: 'Earn 2x XP for all quizzes and library reading completed today.' }
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
    topic: 'Kinematics & Acceleration',
    subject_code: '0625',
    exam_year: 2024,
    variant: 'Paper 12',
    is_past_paper: true,
    questions: [
      {
        id: 'q1_1',
        topic: 'Kinematics & Acceleration',
        question_text: 'A car accelerates uniformly from rest to a velocity of 20 m/s in 5 seconds. What is its acceleration?',
        option_a: '2 m/s²', option_b: '4 m/s²', option_c: '5 m/s²', option_d: '100 m/s²',
        correct_option: 'B', explanation: 'Acceleration a = (v - u) / t = (20 - 0) / 5 = 4 m/s².'
      },
      {
        id: 'q1_2',
        topic: 'Thermal Physics',
        question_text: 'Which method of thermal energy transfer does NOT require a medium?',
        option_a: 'Conduction', option_b: 'Convection', option_c: 'Radiation', option_d: 'Evaporation',
        correct_option: 'C', explanation: 'Radiation travels via electromagnetic waves and works in a vacuum.'
      }
    ]
  },
  {
    id: 'olevel_2',
    title: 'Cambridge O-Level Computer Science 2210 - Algorithms',
    subject: 'Computer Science',
    grade: 10,
    topic: 'Data Structures & FIFO',
    subject_code: '2210',
    exam_year: 2024,
    variant: 'Paper 21',
    is_past_paper: true,
    questions: [
      {
        id: 'q2_1',
        topic: 'Data Structures & FIFO',
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
    topic: 'Algebraic Simplification',
    is_past_paper: false,
    questions: [
      {
        id: 'q7_1',
        topic: 'Algebraic Simplification',
        question_text: 'Simplify: 3x + 5x - 2x',
        option_a: '6x', option_b: '10x', option_c: '8x', option_d: '4x',
        correct_option: 'A', explanation: '(3 + 5 - 2)x = 6x.'
      }
    ]
  },
  {
    id: 'g7_dhivehi_1',
    title: 'Grade 7 Dhivehi - ތާނަ އަކުރު އަދި ފިލި',
    subject: 'Dhivehi',
    grade: 7,
    topic: 'ތާނަ އަކުރުތައް',
    is_past_paper: false,
    questions: [
      {
        id: 'q7_dh_1',
        topic: 'ތާނަ އަކުރުތައް',
        question_text: 'ދިވެހި ތާނައަކުރުގައި ހިމެނެނީ ކިތައް އަކުރު؟',
        option_a: '20 އަކުރު', option_b: '24 އަކުރު', option_c: '28 އަކުރު', option_d: '30 އަކުރު',
        correct_option: 'B', explanation: 'ތާނަ އަކުރުގައި ހިމެނެނީ 24 އަކުރެވެ.'
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
  const [coins, setCoins] = useState(250);
  const [xp, setXp] = useState(480);
  const [streak, setStreak] = useState(3);
  const [quizzesCompleted, setQuizzesCompleted] = useState(4);
  const [booksRead, setBooksRead] = useState(2);
  const [readingHours, setReadingHours] = useState(6.5);
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
  const [leaderboardUsers, setLeaderboardUsers] = useState([
    { full_name: 'Aminath Raya', index_number: 'STU-1002', grade: 10, xp: 2850, streak: 12, coins: 890, reading_hours: 42.0 },
    { full_name: 'Hassan Zayan', index_number: 'STU-1045', grade: 9, xp: 2100, streak: 9, coins: 620, reading_hours: 31.5 },
    { full_name: 'Mariyam Yumna', index_number: 'STU-1088', grade: 8, xp: 1750, streak: 7, coins: 450, reading_hours: 24.0 },
  ]);

  // --- E-Library State & Physical Voucher State ---
  const [selectedBook, setSelectedBook] = useState(null);
  const [claimingBook, setClaimingBook] = useState(null);
  const [viewingVoucher, setViewingVoucher] = useState(null);
  const [bookPageIndex, setBookPageIndex] = useState(0);
  const [readerFontSize, setReaderFontSize] = useState('base');
  const [readerTheme, setReaderTheme] = useState('light');
  const [isFullScreenReader, setIsFullScreenReader] = useState(false);

  // --- Global Filter State ---
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedTopic, setSelectedTopic] = useState('All');
  const [shopFilter, setShopFilter] = useState('All');
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

  const [editingPrize, setEditingPrize] = useState(null);
  const [prizeForm, setPrizeForm] = useState({ name: '', category: 'Physical Store', is_physical: true, cost: 200, icon: '🎒', desc: '' });

  const [editingBadge, setEditingBadge] = useState(null);
  const [badgeForm, setBadgeForm] = useState({ title: '', desc: '', icon: '🏅', minQuizzes: 0, minBooks: 0, minXp: 0, minCoins: 0, minStreak: 0 });

  const [editingQuiz, setEditingQuiz] = useState(null);
  const [quizForm, setQuizForm] = useState({ title: '', subject: 'Maths', topic: 'General Topic', grade: 7, subject_code: '', exam_year: 2024, variant: 'Paper 12', is_past_paper: false });

  // --- Navigation Controls ---
  const navigateToTab = (tabName) => {
    setActiveQuiz(null);
    setSelectedBook(null);
    setClaimingBook(null);
    setIsFullScreenReader(false);
    setActiveTab(tabName);
    setSelectedSubject('All');
    setSelectedTopic('All');
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

  // --- Supabase Listeners & Fetchers ---
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
          pages: typeof b.pages === 'string' ? JSON.parse(b.pages) : b.pages,
          reading_hours: b.reading_hours || 2.0,
          claim_code: b.claim_code || 'LIB-2026'
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
        setCoins(data.coins ?? 250);
        setXp(data.xp ?? 480);
        setStreak(data.streak ?? 3);
        setQuizzesCompleted(data.quizzes_completed ?? 4);
        setBooksRead(data.books_read ?? 2);
        setReadingHours(data.reading_hours ?? 6.5);
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
        reading_hours: updates.reading_hours ?? readingHours,
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
        .select('full_name, index_number, grade, xp, streak, coins, books_read, reading_hours')
        .order('xp', { ascending: false })
        .limit(10);
      if (data && data.length > 0) setLeaderboardUsers(data);
    } catch (e) { console.warn("Leaderboard error:", e); }
  };

  // --- Auth Handlers ---
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!authEmail || !authPassword) return alert('Please enter your email and password.');
    setAuthLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password: authPassword,
      });
      if (error) throw error;
    } catch (err) {
      alert("Login Error: " + err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!authName.trim()) return alert('Please enter your full name.');
    if (!authEmail.trim() || !authPassword.trim()) return alert('Please enter an email and password.');

    if (role === 'student' && !indexNumber.trim()) {
      return alert('Please enter your Student Index Number.');
    }

    if (role === 'teacher' || role === 'admin') {
      if (!teacherPasscode.trim()) return alert('Secret Admin Passcode required for Teacher registration.');
      try {
        const { data: settingData } = await supabase.from('app_settings').select('value').eq('key', 'teacher_passcode').single();
        const validPasscode = settingData?.value || 'SCH-TEACHER-2026';
        if (teacherPasscode.trim() !== validPasscode) throw new Error('Invalid Secret Admin Passcode!');
      } catch (e) {
        if (e.message.includes('Invalid Secret')) return alert(e.message);
      }
    }

    setAuthLoading(true);
    try {
      const assignedIndex = role === 'student' ? indexNumber : `STAFF-${Math.floor(100 + Math.random() * 900)}`;

      const { data, error } = await supabase.auth.signUp({
        email: authEmail,
        password: authPassword,
        options: {
          data: { full_name: authName, index_number: assignedIndex, role, grade: studentGrade }
        }
      });
      if (error) throw error;

      if (data?.user) {
        await supabase.from('profiles').insert([{
          id: data.user.id,
          full_name: authName,
          index_number: assignedIndex,
          role,
          grade: studentGrade,
          coins: 250,
          xp: 480,
          streak: 1,
          quizzes_completed: 0,
          books_read: 0,
          reading_hours: 0.0,
          claimed_rewards: [],
          activity_log: [{ id: 'init_1', title: `Registered as ${role.toUpperCase()}`, date: 'Just now' }],
          completed_challenges: [],
          challenge_attempts: [],
          completed_book_ids: []
        }]);
      }
      alert(`✅ Account registered successfully as ${role.toUpperCase()}! Welcome to EduSpark IQ.`);
    } catch (err) {
      alert("Registration Error: " + err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!authEmail.trim()) return alert('Please enter your registered email address.');
    setAuthLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(authEmail, {
        redirectTo: window.location.origin
      });
      if (error) throw error;
      setResetSent(true);
    } catch (err) {
      alert("Password Reset Error: " + err.message);
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

  // --- Quiz Engine ---
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
    setUserAnswers({});

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

    const qKey = currentQ.id || currentQuestionIdx;
    setUserAnswers(prev => ({ ...prev, [qKey]: option }));

    if (isCorrect) {
      playSound('correct');
      setScore(s => s + 1);
    } else {
      playSound('wrong');
      if (quizMode === 'challenge') {
        const remainingHearts = hearts - 1;
        setHearts(remainingHearts);
        if (remainingHearts <= 0) setGameOver(true);
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
        date: new Date().toLocaleDateString(),
        questionDetails: activeQuiz.questions.map((q, idx) => {
          const qKey = q.id || idx;
          const chosen = userAnswers[qKey] || null;
          return {
            id: qKey,
            topic: q.topic || activeQuiz.topic || 'General Concept',
            question_text: q.question_text,
            correct_option: q.correct_option,
            user_option: chosen,
            is_correct: chosen === q.correct_option,
            explanation: q.explanation || ''
          };
        })
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

  // --- Redeem Physical & Digital Gift Store Rewards ---
  const handleRedeemReward = (item) => {
    if (coins < item.cost) return alert(`Insufficient EduCoins! You need ${item.cost - coins} more coins.`);
    
    const confirmMsg = item.is_physical
      ? `Redeem real physical item "${item.name}" for ${item.cost} EduCoins?\n\nYou will receive an official LS Store pickup code to collect it at the school library/store desk!`
      : `Redeem "${item.name}" for ${item.cost} EduCoins?`;

    if (confirm(confirmMsg)) {
      const newCoins = coins - item.cost;
      const redemption = {
        id: `claimed_${Date.now()}`,
        name: item.name,
        cost: item.cost,
        is_physical: item.is_physical || item.category === 'Physical Store',
        date: new Date().toISOString().split('T')[0],
        code: `LS-GIFT-${Math.floor(1000 + Math.random() * 9000)}`
      };
      
      const newClaimed = [redemption, ...claimedRewards];
      const newLog = [{ id: `act_${Date.now()}`, title: `LS Gift Shop: ${item.name}`, cost: item.cost, date: 'Just now' }, ...activityLog];

      setCoins(newCoins);
      setClaimedRewards(newClaimed);
      setActivityLog(newLog);

      playSound('coin');
      confetti({ particleCount: 120, spread: 80 });

      syncProfileToSupabase({ coins: newCoins, claimed_rewards: newClaimed, activity_log: newLog });

      if (redemption.is_physical) {
        setViewingVoucher(redemption);
      } else {
        alert(`🎉 Purchased ${item.name}! Your reward is now active.`);
      }
    }
  };

  // --- Admin CRUD Handlers ---
  const handleSaveBook = async (e) => {
    e.preventDefault();
    if (!bookForm.title || !bookForm.author || !bookForm.pageText) return alert("Please fill title, author, and chapter page text.");
    if (!bookForm.claim_code.trim()) return alert("Please assign a unique Library Claim Code for this book.");

    const parsedPages = bookForm.pageText.includes('---PAGE---')
      ? bookForm.pageText.split('---PAGE---').map(p => p.trim())
      : [bookForm.pageText.trim()];

    const bookObject = {
      title: bookForm.title,
      author: bookForm.author,
      subject: bookForm.subject,
      cover_url: bookForm.cover_url || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=600&q=80',
      summary: bookForm.summary || `Book on ${bookForm.subject} by ${bookForm.author}`,
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
        alert("✅ New Book created!");
      } catch (err) { alert("Create failed: " + err.message); }
    }
    setBookForm({ title: '', author: '', subject: 'Dhivehi', cover_url: '', summary: '', extract: '', pageText: '', reading_hours: 2.0, claim_code: '' });
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

  const handleSavePrize = async (e) => {
    e.preventDefault();
    if (!prizeForm.name || !prizeForm.cost) return alert("Please fill prize name and cost.");

    const prizeData = {
      name: prizeForm.name,
      category: prizeForm.category,
      is_physical: prizeForm.is_physical || prizeForm.category === 'Physical Store',
      cost: parseInt(prizeForm.cost),
      icon: prizeForm.icon || '🎒',
      desc: prizeForm.desc
    };

    if (editingPrize) {
      const updatedPrize = { ...editingPrize, ...prizeData };
      try {
        await supabase.from('shop_items').update(updatedPrize).eq('id', editingPrize.id);
        setShopItems(shopItems.map(i => i.id === editingPrize.id ? updatedPrize : i));
        setEditingPrize(null);
        alert("✅ LS Shop item updated!");
      } catch (err) { alert("Update failed: " + err.message); }
    } else {
      const newPrize = { id: `item_${Date.now()}`, ...prizeData };
      try {
        await supabase.from('shop_items').insert([newPrize]);
        setShopItems([newPrize, ...shopItems]);
        alert("✅ LS Shop item published!");
      } catch (err) { alert("Create failed: " + err.message); }
    }
    setPrizeForm({ name: '', category: 'Physical Store', is_physical: true, cost: 200, icon: '🎒', desc: '' });
  };

  const startEditPrize = (item) => {
    setEditingPrize(item);
    setPrizeForm({
      name: item.name,
      category: item.category || 'Physical Store',
      is_physical: item.is_physical ?? true,
      cost: item.cost,
      icon: item.icon,
      desc: item.desc || ''
    });
  };

  const handleDeletePrize = async (id) => {
    if (confirm("Delete this shop item?")) {
      try { await supabase.from('shop_items').delete().eq('id', id); } catch (e) { console.warn(e); }
      setShopItems(shopItems.filter(i => i.id !== id));
    }
  };

  // --- Dynamic Topic Extractor for Filter Selector ---
  const availableTopics = Array.from(new Set(
    quizzes
      .filter(q => selectedSubject === 'All' || q.subject === selectedSubject)
      .map(q => q.topic || (q.questions && q.questions[0]?.topic) || 'General Topic')
      .filter(Boolean)
  ));

  // --- Filtered Quiz Datasets ---
  const gradePracticeQuizzes = quizzes.filter(q => {
    const isGradeMatch = q.grade === parseInt(studentGrade);
    const isNotPastPaper = !q.is_past_paper;
    const isSubjectMatch = selectedSubject === 'All' || q.subject === selectedSubject;
    const quizTopic = q.topic || (q.questions && q.questions[0]?.topic) || 'General Topic';
    const isTopicMatch = selectedTopic === 'All' || quizTopic.toLowerCase() === selectedTopic.toLowerCase();
    const matchesSearch = (q.title || '').toLowerCase().includes(searchQuery.toLowerCase());
    return isGradeMatch && isNotPastPaper && isSubjectMatch && isTopicMatch && matchesSearch;
  });

  const oLevelQuizzes = quizzes.filter(q => {
    const matchesSearch = (q.title || '').toLowerCase().includes(searchQuery.toLowerCase());
    const isSubjectMatch = selectedSubject === 'All' || q.subject === selectedSubject;
    const isPast = q.is_past_paper === true || q.is_past_paper === 'true';
    return isPast && matchesSearch && isSubjectMatch;
  });

  const filteredLibraryBooks = books.filter(b => selectedSubject === 'All' || b.subject === selectedSubject);

  const filteredShopItems = shopItems.filter(i => {
    if (shopFilter === 'Physical') return i.is_physical || i.category === 'Physical Store';
    if (shopFilter === 'Digital') return !i.is_physical && i.category !== 'Physical Store';
    return true;
  });

  const currentRank = getStudentRank(xp);

  // =========================================================================
  // --- AUTHENTICATION & ENHANCED LANDING PAGE VIEWS ---
  // =========================================================================
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans relative overflow-hidden">
        {/* Glowing Background Orbs */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-amber-600/15 rounded-full blur-3xl pointer-events-none"></div>

        {/* HEADER NAV */}
        <header className="max-w-7xl w-full mx-auto px-6 py-6 flex items-center justify-between z-10">
          <div onClick={() => setAuthView('landing')} className="flex items-center space-x-3 cursor-pointer">
            <div className="bg-gradient-to-tr from-indigo-500 via-purple-500 to-amber-500 p-2.5 rounded-2xl shadow-xl">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-white">
                EduSpark <span className="text-amber-400">IQ</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-medium font-mono">School Portal & LS Gift Store</p>
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
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-5 py-2 rounded-xl text-xs font-black shadow-lg transition"
            >
              Register Now
            </button>
          </div>
        </header>

        {/* HIGH-ENERGY ELEGANT LANDING PAGE */}
        {authView === 'landing' && (
          <main className="max-w-7xl w-full mx-auto px-6 py-8 z-10 space-y-16 flex-1">
            {/* HERO BANNER */}
            <section className="text-center space-y-6 max-w-4xl mx-auto pt-4">
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-amber-500/20 via-indigo-500/20 to-purple-500/20 border border-amber-500/30 px-4 py-1.5 rounded-full text-amber-300 text-xs font-bold shadow-xs">
                <Store className="w-4 h-4 text-amber-400" />
                <span>LS Physical Gift Shop & Topic-Wise Vault Now Live!</span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
                Master Topics. Read Books.{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-amber-200">
                  Buy Real Gifts.
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
                EduSpark IQ empowers students with topic-wise practice, O-Level past paper drills, Dhivehi and Islam reading logs, and real physical prizes at the LS Gift Shop!
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                <button
                  onClick={() => setAuthView('register')}
                  className="w-full sm:w-auto bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black px-8 py-4 rounded-2xl text-sm shadow-2xl transition flex items-center justify-center space-x-2"
                >
                  <span>Student Portal Registration</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setAuthView('login')}
                  className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold px-8 py-4 rounded-2xl text-sm transition"
                >
                  Existing User Sign In
                </button>
              </div>
            </section>

            {/* HIGH-IMPACT FEATURE SHOWCASE CARDS */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* FEATURE 1: QUIZ OF THE DAY */}
              <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 p-6 rounded-3xl space-y-4 shadow-xl relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-2xl">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-black bg-amber-500 text-slate-950 px-2.5 py-1 rounded-full uppercase">
                    2x Coins Bonus
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-indigo-300 uppercase block">Quiz of the Day</span>
                  <h3 className="text-lg font-black text-white">Physics — Kinematics & Motion</h3>
                  <p className="text-xs text-slate-400">Complete today's featured topic test to earn double EduCoins!</p>
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs font-bold text-indigo-300">
                  <span>Grade 10 Syllabus</span>
                  <span>10 Questions • 120s</span>
                </div>
              </div>

              {/* FEATURE 2: STUDENT OF THE MONTH */}
              <div className="bg-gradient-to-br from-slate-900 via-amber-950/40 to-slate-900 border border-amber-500/30 p-6 rounded-3xl space-y-4 shadow-xl relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl">
                    <Crown className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-black bg-amber-400/20 border border-amber-400/30 text-amber-300 px-2.5 py-1 rounded-full uppercase">
                    🏆 Spotlight Award
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-amber-400 uppercase block">Student of the Month</span>
                  <h3 className="text-lg font-black text-white">Aminath Raya</h3>
                  <p className="text-xs text-slate-400">Grade 10 • Index: STU-1002 • 42.0 Logged Reading Hours</p>
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs font-bold text-amber-300">
                  <span>XP Score: 2,850 XP</span>
                  <span>Master Rank 🔥</span>
                </div>
              </div>

              {/* FEATURE 3: LS GIFT SHOP SHOWCASE */}
              <div className="bg-gradient-to-br from-slate-900 via-purple-950/40 to-slate-900 border border-purple-500/30 p-6 rounded-3xl space-y-4 shadow-xl relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <div className="p-3 bg-purple-500/20 text-purple-400 rounded-2xl">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-black bg-emerald-500 text-slate-950 px-2.5 py-1 rounded-full uppercase">
                    Real Physical Goods
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-purple-300 uppercase block">LS Gift Store</span>
                  <h3 className="text-lg font-black text-white">Real Rewards for Learning</h3>
                  <p className="text-xs text-slate-400">Buy LS Water Bottles, Hoodies, Faber-Castell pens, and journals with EduCoins!</p>
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs font-bold text-purple-300">
                  <span>Physical Pickup Vouchers</span>
                  <span>In-Stock 🎒</span>
                </div>
              </div>
            </section>

            {/* REAL PHYSICAL GIFTS PREVIEW GRID */}
            <section className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-white flex items-center space-x-2">
                    <span>🎒 LS Gift Shop Highlights</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">Students earn EduCoins by attempting quizzes and logging physical reading hours.</p>
                </div>
                <button
                  onClick={() => setAuthView('register')}
                  className="text-xs font-bold text-amber-400 hover:underline flex items-center space-x-1"
                >
                  <span>View All Shop Rewards</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {INITIAL_SHOP_ITEMS.filter(i => i.is_physical).map((item) => (
                  <div key={item.id} className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-4 flex flex-col justify-between space-y-3">
                    <div className="space-y-2">
                      <span className="text-3xl block">{item.icon}</span>
                      <h4 className="font-bold text-white text-sm">{item.name}</h4>
                      <p className="text-[11px] text-slate-400 line-clamp-2">{item.desc}</p>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-slate-700/60">
                      <span className="text-xs font-black text-amber-400">{item.cost} EduCoins</span>
                      <span className="text-[10px] font-bold bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                        Physical
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* LIVE LEADERBOARD SHOWCASE */}
            <section className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="text-center space-y-2 max-w-md mx-auto">
                <Trophy className="w-10 h-10 text-amber-400 mx-auto" />
                <h2 className="text-2xl font-black text-white">Top Student Leaderboard</h2>
                <p className="text-xs text-slate-400">Live school rankings based on quiz accuracy and library reading logs.</p>
              </div>

              <div className="max-w-2xl mx-auto space-y-2">
                {leaderboardUsers.slice(0, 3).map((student, idx) => (
                  <div key={idx} className="bg-slate-800/80 border border-slate-700/60 p-4 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl font-black w-8">
                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                      </span>
                      <div>
                        <h4 className="font-black text-white text-sm">{student.full_name}</h4>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {student.index_number} • Grade {student.grade} • {student.reading_hours} Reading Hrs
                        </span>
                      </div>
                    </div>
                    <span className="text-sm font-black text-amber-400">{student.xp} XP</span>
                  </div>
                ))}
              </div>
            </section>
          </main>
        )}

        {/* LOGIN MODAL */}
        {authView === 'login' && (
          <main className="max-w-md w-full mx-auto px-6 py-12 z-10 flex-1 flex flex-col justify-center">
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-black text-white">Welcome Back</h2>
                <p className="text-xs text-slate-400">Sign in to your EduSpark IQ account</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5">User Email Address</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      placeholder="student@school.edu"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-amber-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-bold text-slate-300">Password</label>
                    <button
                      type="button"
                      onClick={() => setAuthView('forgot_password')}
                      className="text-[11px] font-bold text-amber-400 hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-amber-500"
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
                  className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black py-3 rounded-xl text-xs transition shadow-md"
                >
                  {authLoading ? 'Signing In...' : 'Sign In'}
                </button>
              </form>

              <div className="text-center pt-2 border-t border-slate-800">
                <p className="text-xs text-slate-400">
                  Don't have an account?{' '}
                  <button onClick={() => setAuthView('register')} className="text-amber-400 font-bold hover:underline">
                    Register Now
                  </button>
                </p>
              </div>
            </div>
          </main>
        )}

        {/* REGISTER MODAL */}
        {authView === 'register' && (
          <main className="max-w-md w-full mx-auto px-6 py-8 z-10 flex-1 flex flex-col justify-center">
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl space-y-5">
              <div className="text-center space-y-1">
                <h2 className="text-2xl font-black text-white">Create Account</h2>
                <p className="text-xs text-slate-400">Register as a Student or Teacher</p>
              </div>

              <form onSubmit={handleRegister} className="space-y-3.5">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Account Role</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole('student')}
                      className={`py-2 text-xs font-bold rounded-xl border transition ${role === 'student' ? 'bg-amber-500 border-amber-500 text-slate-950' : 'bg-slate-950 border-slate-800 text-slate-400'}`}
                    >
                      🎓 Student
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('teacher')}
                      className={`py-2 text-xs font-bold rounded-xl border transition ${role === 'teacher' ? 'bg-purple-600 border-purple-600 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'}`}
                    >
                      👨‍🏫 Teacher
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
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Email Address</label>
                  <input
                    type="email"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="email@school.edu"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
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
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                    required
                  />
                </div>

                {role === 'student' ? (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Grade Level</label>
                      <select
                        value={studentGrade}
                        onChange={(e) => setStudentGrade(parseInt(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(g => (
                          <option key={g} value={g}>Grade {g}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Index Number</label>
                      <input
                        type="text"
                        value={indexNumber}
                        onChange={(e) => setIndexNumber(e.target.value)}
                        placeholder="STU-2026-104"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                        required
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="text-xs font-bold text-purple-300 block mb-1">Admin Passcode</label>
                    <input
                      type="password"
                      value={teacherPasscode}
                      onChange={(e) => setTeacherPasscode(e.target.value)}
                      placeholder="SCH-TEACHER-2026"
                      className="w-full bg-slate-950 border border-purple-500/40 rounded-xl px-3 py-2 text-xs font-mono text-purple-200"
                      required
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black py-2.5 rounded-xl text-xs transition shadow-md mt-2"
                >
                  {authLoading ? 'Creating Account...' : 'Complete Registration'}
                </button>
              </form>

              <div className="text-center pt-2 border-t border-slate-800">
                <p className="text-xs text-slate-400">
                  Already registered?{' '}
                  <button onClick={() => setAuthView('login')} className="text-amber-400 font-bold hover:underline">
                    Sign In
                  </button>
                </p>
              </div>
            </div>
          </main>
        )}

        {/* FORGOT PASSWORD MODAL */}
        {authView === 'forgot_password' && (
          <main className="max-w-md w-full mx-auto px-6 py-12 z-10 flex-1 flex flex-col justify-center">
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl space-y-6">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center mx-auto">
                  <HelpCircle className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-black text-white">Reset Password</h2>
                <p className="text-xs text-slate-400">Enter your email to receive a password reset link.</p>
              </div>

              {resetSent ? (
                <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-2xl text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                  <p className="text-xs font-bold text-emerald-300">Password Reset Link Sent!</p>
                  <p className="text-[11px] text-slate-400">Please check your email inbox to set a new password.</p>
                  <button
                    onClick={() => { setResetSent(false); setAuthView('login'); }}
                    className="mt-2 bg-amber-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs"
                  >
                    Return to Sign In
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1.5">Registered Email</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        type="email"
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        placeholder="email@school.edu"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-slate-500"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-3 rounded-xl text-xs transition shadow-md"
                  >
                    {authLoading ? 'Sending Reset Email...' : 'Send Reset Link'}
                  </button>
                </form>
              )}

              <div className="text-center pt-2 border-t border-slate-800">
                <button onClick={() => setAuthView('login')} className="text-xs text-slate-400 hover:text-white font-bold">
                  ← Back to Sign In
                </button>
              </div>
            </div>
          </main>
        )}

        <footer className="py-4 text-center text-xs text-slate-500 border-t border-slate-900">
          EduSpark IQ © 2026 • School Student Portal & LS Gift Store
        </footer>
      </div>
    );
  }

  // =========================================================================
  // --- AUTHENTICATED PORTAL APP INTERFACE ---
  // =========================================================================
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-xs print:hidden">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center justify-between w-full sm:w-auto">
            <div 
              onClick={() => navigateToTab('dashboard')} 
              className="flex items-center space-x-3 cursor-pointer hover:opacity-85 transition"
            >
              <div className="bg-gradient-to-tr from-indigo-600 via-purple-600 to-amber-500 p-2 rounded-xl shadow-md">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-black tracking-tight text-slate-900">
                  EduSpark <span className="text-indigo-600">IQ</span>
                </h1>
                <p className="text-[11px] text-slate-500 font-medium">School Portal & LS Gift Store</p>
              </div>
            </div>

            <button onClick={handleLogout} className="sm:hidden p-2 text-slate-400 hover:text-slate-700 rounded-lg">
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 sm:gap-3 w-full sm:w-auto">
            <div className="flex items-center space-x-2.5 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-full text-xs font-bold text-slate-700">
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-black ${currentRank.bg} ${currentRank.text}`}>
                {role === 'teacher' ? '👨‍🏫 Teacher' : currentRank.title}
              </span>
              <div className="flex items-center space-x-1 text-emerald-700">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                <span>{readingHours} Reading Hrs</span>
              </div>
              <div className="flex items-center space-x-1 text-amber-600">
                <Coins className="w-3.5 h-3.5" />
                <span>{coins} Coins</span>
              </div>
              <div className="flex items-center space-x-1 text-indigo-600">
                <Zap className="w-3.5 h-3.5" />
                <span>{xp} XP</span>
              </div>
            </div>

            <button
              onClick={() => navigateToTab('profile')}
              className="flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 px-3 py-1.5 rounded-xl transition text-xs font-bold text-slate-700"
            >
              <User className="w-3.5 h-3.5 text-indigo-600" />
              <span>{authName || 'Profile'}</span>
            </button>

            <button onClick={handleLogout} className="hidden sm:block p-2 text-slate-400 hover:text-slate-700 rounded-lg">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="max-w-7xl mx-auto px-4 flex items-center space-x-1 sm:space-x-2 overflow-x-auto text-xs border-t border-slate-100 py-1.5 scrollbar-none">
          <button
            onClick={() => navigateToTab('dashboard')}
            className={`px-3.5 py-1.5 font-bold flex items-center space-x-1.5 rounded-xl transition shrink-0 whitespace-nowrap ${activeTab === 'dashboard' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-600" /> <span>Topic-Wise Vault</span>
          </button>

          <button
            onClick={() => navigateToTab('library')}
            className={`px-3.5 py-1.5 font-bold flex items-center space-x-1.5 rounded-xl transition shrink-0 whitespace-nowrap ${activeTab === 'library' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <Library className="w-3.5 h-3.5 text-emerald-600" /> <span>E-Library & School Books</span>
          </button>

          {(role === 'teacher' || role === 'admin' || studentGrade >= 8) && (
            <button
              onClick={() => navigateToTab('olevel')}
              className={`px-3.5 py-1.5 font-bold flex items-center space-x-1.5 rounded-xl transition shrink-0 whitespace-nowrap ${activeTab === 'olevel' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <GraduationCap className="w-3.5 h-3.5 text-amber-600" /> <span>O-Level Arena</span>
            </button>
          )}

          <button
            onClick={() => navigateToTab('shop')}
            className={`px-3.5 py-1.5 font-bold flex items-center space-x-1.5 rounded-xl transition shrink-0 whitespace-nowrap ${activeTab === 'shop' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <Store className="w-3.5 h-3.5" /> <span>🎒 LS Physical Gift Shop</span>
          </button>

          <button
            onClick={() => navigateToTab('profile')}
            className={`px-3.5 py-1.5 font-bold flex items-center space-x-1.5 rounded-xl transition shrink-0 whitespace-nowrap ${activeTab === 'profile' ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <User className="w-3.5 h-3.5 text-purple-600" /> <span>My Profile & Topic Stats</span>
          </button>

          <button
            onClick={() => { navigateToTab('leaderboard'); fetchLeaderboard(); }}
            className={`px-3.5 py-1.5 font-bold flex items-center space-x-1.5 rounded-xl transition shrink-0 whitespace-nowrap ${activeTab === 'leaderboard' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <Trophy className="w-3.5 h-3.5 text-yellow-600" /> <span>Leaderboard</span>
          </button>

          {(role === 'teacher' || role === 'admin') && (
            <>
              <button
                onClick={() => navigateToTab('studio')}
                className={`px-3.5 py-1.5 font-bold flex items-center space-x-1.5 rounded-xl transition shrink-0 whitespace-nowrap ${activeTab === 'studio' ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                <BrainCircuit className="w-3.5 h-3.5 text-purple-600" /> <span>Teacher Studio</span>
              </button>

              <button
                onClick={() => navigateToTab('settings')}
                className={`px-3.5 py-1.5 font-bold flex items-center space-x-1.5 rounded-xl transition shrink-0 whitespace-nowrap ${activeTab === 'settings' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                <Settings className="w-3.5 h-3.5 text-rose-600" /> <span>⚙️ Admin Settings</span>
              </button>
            </>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">

        {/* TAB 1: TOPIC-WISE GRADE PRACTICE VAULT */}
        {activeTab === 'dashboard' && !activeQuiz && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-black text-slate-900">Grade {studentGrade} Topic Practice Vault</h3>
                <p className="text-xs text-slate-500">Practice questions organized topic-by-topic for your syllabus.</p>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search quizzes or topics..."
                  className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800"
                />

                {(role === 'teacher' || role === 'admin') && (
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

            {/* Subject Filters */}
            <div className="flex items-center space-x-2 overflow-x-auto scrollbar-none py-1 w-full">
              <button
                onClick={() => { setSelectedSubject('All'); setSelectedTopic('All'); }}
                className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap ${selectedSubject === 'All' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                All Subjects
              </button>
              {ALL_SUBJECTS.map((subj) => (
                <button
                  key={subj}
                  onClick={() => { setSelectedSubject(subj); setSelectedTopic('All'); }}
                  className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap ${subj === 'Dhivehi' || subj === 'Islam' ? 'font-faruma' : ''} ${selectedSubject === subj ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                >
                  {subj === 'Dhivehi' ? '🇲🇻 ދިވެހި' : subj === 'Islam' ? '☪️ އިސްލާމް' : subj}
                </button>
              ))}
            </div>

            {/* TOPIC SELECTOR FILTER BAR */}
            {availableTopics.length > 0 && (
              <div className="bg-indigo-50/60 border border-indigo-100 p-3 rounded-2xl flex items-center space-x-2 overflow-x-auto">
                <span className="text-[11px] font-bold text-indigo-900 shrink-0 flex items-center space-x-1">
                  <Tag className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Topic Filter:</span>
                </span>
                <button
                  onClick={() => setSelectedTopic('All')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold shrink-0 transition ${selectedTopic === 'All' ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-800 hover:bg-indigo-100'}`}
                >
                  All Topics
                </button>
                {availableTopics.map((top) => (
                  <button
                    key={top}
                    onClick={() => setSelectedTopic(top)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold shrink-0 transition ${selectedTopic === top ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-800 hover:bg-indigo-100'}`}
                  >
                    {top}
                  </button>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {gradePracticeQuizzes.map((quiz) => {
                const isChallengeDone = completedChallenges.includes(quiz.id);
                const quizTopic = quiz.topic || (quiz.questions && quiz.questions[0]?.topic) || 'General Topic';

                return (
                  <div key={quiz.id} className="bg-white border border-slate-200 rounded-3xl p-5 flex flex-col justify-between hover:border-indigo-300 transition shadow-xs space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg font-bold">
                          {quiz.subject}
                        </span>
                        {(role === 'teacher' || role === 'admin') && (
                          <button onClick={() => deleteQuiz(quiz.id)} className="p-1 text-slate-400 hover:text-red-600">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-slate-900">{quiz.title}</h3>

                      <div className="mt-2 inline-flex items-center space-x-1 bg-purple-50 text-purple-700 border border-purple-100 px-2.5 py-1 rounded-lg text-[11px] font-bold">
                        <Tag className="w-3 h-3 text-purple-600" />
                        <span>Syllabus Topic: {quizTopic}</span>
                      </div>

                      <p className="text-xs text-slate-500 mt-2">{quiz.questions.length} Practice Questions</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100">
                      <button onClick={() => startQuiz(quiz, 'practice')} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-xl text-xs font-bold transition">
                        Practice Mode
                      </button>
                      
                      <button
                        onClick={() => startQuiz(quiz, 'challenge')}
                        disabled={isChallengeDone}
                        className={`w-full py-2 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1 ${isChallengeDone ? 'bg-emerald-50 border border-emerald-200 text-emerald-700 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'}`}
                      >
                        {isChallengeDone ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>✓ Completed</span>
                          </>
                        ) : (
                          <>
                            <Flame className="w-3.5 h-3.5 text-amber-300" />
                            <span>Challenge</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: ONLINE E-LIBRARY & PHYSICAL SCHOOL BOOKS */}
        {activeTab === 'library' && !activeQuiz && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-emerald-800 via-teal-700 to-cyan-800 text-white p-6 sm:p-8 rounded-3xl shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <div className="flex items-center space-x-2">
                  <Library className="w-6 h-6 text-emerald-300" />
                  <h2 className="text-2xl sm:text-3xl font-black">Interactive E-Library & Reading Hub</h2>
                </div>
                <p className="text-xs text-emerald-100">
                  Read digital books online or borrow physical books from the school library! Enter the **Book-Specific Code** provided by your librarian to log official **School Reading Hours**.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl text-center space-y-1">
                <span className="text-[10px] text-emerald-200 block uppercase font-bold">Your Logged Reading</span>
                <span className="text-2xl font-black text-amber-300">{readingHours} Hours</span>
              </div>
            </div>

            {/* Subject Filter Bar */}
            <div className="flex items-center space-x-2 overflow-x-auto scrollbar-none py-1 w-full">
              <button
                onClick={() => setSelectedSubject('All')}
                className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap ${selectedSubject === 'All' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                All Subjects
              </button>
              {ALL_SUBJECTS.map((subj) => (
                <button
                  key={subj}
                  onClick={() => setSelectedSubject(subj)}
                  className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap ${subj === 'Dhivehi' || subj === 'Islam' ? 'font-faruma' : ''} ${selectedSubject === subj ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                >
                  {subj === 'Dhivehi' ? '🇲🇻 ދިވެހި' : subj === 'Islam' ? '☪️ އިސްލާމް' : subj}
                </button>
              ))}
            </div>

            {/* Book Grid Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredLibraryBooks.map((book) => {
                const isRTL = isRTLSubject(book.subject);
                const isCompleted = completedBookIds.includes(book.id);

                return (
                  <div key={book.id} className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between">
                    <div>
                      {/* Cover Image Container */}
                      <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                        <img
                          src={book.cover_url || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=600&q=80'}
                          alt={book.title}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        />
                        
                        <span className={`absolute top-3 left-3 text-[11px] font-bold px-2.5 py-1 rounded-xl shadow-xs ${isRTL ? 'bg-amber-500 text-white font-faruma' : 'bg-emerald-600 text-white'}`}>
                          {book.subject}
                        </span>

                        <span className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-xs text-amber-300 text-[11px] font-black px-2.5 py-1 rounded-xl flex items-center space-x-1 shadow-xs">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{book.reading_hours || 2.0} Reading Hrs</span>
                        </span>

                        {isCompleted && (
                          <span className="absolute top-3 right-3 bg-emerald-500 text-white text-[10px] font-black px-2.5 py-1 rounded-xl flex items-center space-x-1 shadow-xs">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Logged</span>
                          </span>
                        )}
                      </div>

                      {/* Card Body */}
                      <div className="p-5 space-y-3">
                        <div className={isRTL ? 'text-right font-faruma' : 'text-left'} dir={isRTL ? 'rtl' : 'ltr'}>
                          <h4 className={`font-black text-slate-900 ${isRTL ? 'text-xl' : 'text-base'}`}>{book.title}</h4>
                          <p className="text-xs text-slate-400 mt-0.5">By {book.author}</p>
                          
                          <div className={`mt-3 p-3 bg-slate-50 border border-slate-100 rounded-2xl text-slate-600 italic ${isRTL ? 'text-xs leading-relaxed font-faruma' : 'text-xs leading-relaxed font-serif'}`}>
                            "{book.extract || (Array.isArray(book.pages) ? book.pages[0].slice(0, 120) + '...' : '')}"
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="p-5 pt-0 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => openBookModal(book)}
                          className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-2xl text-xs flex items-center justify-center space-x-1 transition"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Read Online</span>
                        </button>

                        <button
                          onClick={() => setClaimingBook(book)}
                          className={`w-full font-bold py-2.5 rounded-2xl text-xs flex items-center justify-center space-x-1 transition ${
                            isCompleted
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                          }`}
                        >
                          <Award className="w-3.5 h-3.5" />
                          <span>{isCompleted ? '✓ Logged' : 'Claim Hours'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: O-LEVEL ARENA */}
        {activeTab === 'olevel' && !activeQuiz && (role === 'teacher' || role === 'admin' || studentGrade >= 8) && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-amber-900 via-yellow-900 to-amber-950 text-white rounded-3xl p-6 sm:p-8 shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black">O-Level Past Paper Arena 🎓</h2>
                <p className="text-xs text-amber-100">Official Cambridge O-Level exam papers across all subjects.</p>
              </div>

              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search past papers..."
                  className="bg-white/10 text-white placeholder-amber-200 border border-amber-700/50 rounded-xl px-3 py-1.5 text-xs w-full sm:w-48 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 overflow-x-auto scrollbar-none py-1 w-full">
              <button
                onClick={() => setSelectedSubject('All')}
                className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap ${selectedSubject === 'All' ? 'bg-amber-600 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                All Subjects
              </button>
              {ALL_SUBJECTS.map((subj) => (
                <button
                  key={subj}
                  onClick={() => setSelectedSubject(subj)}
                  className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap ${subj === 'Dhivehi' || subj === 'Islam' ? 'font-faruma' : ''} ${selectedSubject === subj ? 'bg-amber-600 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                >
                  {subj === 'Dhivehi' ? '🇲🇻 ދިވެހި' : subj === 'Islam' ? '☪️ އިސްލާމް' : subj}
                </button>
              ))}
            </div>

            {oLevelQuizzes.length === 0 ? (
              <div className="text-center py-12 bg-white border border-slate-200 rounded-3xl p-6 space-y-3">
                <GraduationCap className="w-10 h-10 text-amber-600 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">No O-Level Past Papers Found for "{selectedSubject}"</h3>
                <p className="text-xs text-slate-500">Teachers can add O-Level past papers for this subject in the Teacher Studio!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {oLevelQuizzes.map((quiz) => {
                  const isChallengeDone = completedChallenges.includes(quiz.id);
                  return (
                    <div key={quiz.id} className="bg-white border border-slate-200 rounded-3xl p-5 flex flex-col justify-between shadow-xs hover:border-amber-300 transition">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs bg-amber-50 text-amber-800 px-2.5 py-1 rounded-lg font-bold">
                            {quiz.subject} {quiz.subject_code ? `(${quiz.subject_code})` : ''}
                          </span>
                          {(role === 'teacher' || role === 'admin') && (
                            <button onClick={() => deleteQuiz(quiz.id)} className="p-1 text-slate-400 hover:text-red-600">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        <h3 className="text-base font-bold text-slate-900">{quiz.title}</h3>
                        <p className="text-xs text-slate-500 mt-1 mb-4">{quiz.questions.length} Exam Questions</p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100">
                        <button onClick={() => startQuiz(quiz, 'practice')} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-xl text-xs font-bold transition">
                          Practice Mode
                        </button>
                        
                        <button
                          onClick={() => startQuiz(quiz, 'challenge')}
                          disabled={isChallengeDone}
                          className={`w-full py-2 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1 ${isChallengeDone ? 'bg-amber-50 border border-amber-200 text-amber-800 cursor-not-allowed' : 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs'}`}
                        >
                          {isChallengeDone ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                              <span>✓ Completed</span>
                            </>
                          ) : (
                            <span>Timed Exam</span>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: LS PHYSICAL GIFT SHOP */}
        {activeTab === 'shop' && !activeQuiz && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <Store className="w-7 h-7 text-slate-950" />
                  <h2 className="text-2xl sm:text-3xl font-black">LS Physical Gift Store</h2>
                </div>
                <p className="text-xs text-slate-900 font-medium mt-1">
                  Buy real school water bottles, study journals, pen sets, and hoodies with your earned EduCoins!
                </p>
              </div>

              <div className="bg-slate-950 text-amber-400 px-5 py-3 rounded-2xl font-black text-base flex items-center space-x-2 shadow-lg">
                <Coins className="w-5 h-5 text-amber-400" />
                <span>{coins} EduCoins</span>
              </div>
            </div>

            {/* Shop Category Filter */}
            <div className="flex items-center space-x-2 border-b border-slate-200 pb-3">
              <button
                onClick={() => setShopFilter('All')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${shopFilter === 'All' ? 'bg-amber-500 text-slate-950' : 'bg-white border text-slate-600 hover:bg-slate-50'}`}
              >
                All Items ({shopItems.length})
              </button>
              <button
                onClick={() => setShopFilter('Physical')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${shopFilter === 'Physical' ? 'bg-amber-500 text-slate-950' : 'bg-white border text-slate-600 hover:bg-slate-50'}`}
              >
                🎒 Real Physical Goods
              </button>
              <button
                onClick={() => setShopFilter('Digital')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${shopFilter === 'Digital' ? 'bg-amber-500 text-slate-950' : 'bg-white border text-slate-600 hover:bg-slate-50'}`}
              >
                🎟️ Digital Perks & Passes
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredShopItems.map((item) => (
                <div key={item.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs hover:shadow-md transition flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="text-4xl p-3 bg-amber-50 rounded-2xl border border-amber-100 block">{item.icon}</span>
                      {item.is_physical || item.category === 'Physical Store' ? (
                        <span className="text-[10px] font-black bg-amber-500 text-slate-950 px-2.5 py-1 rounded-full uppercase">
                          Physical Store Item
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full uppercase">
                          {item.category}
                        </span>
                      )}
                    </div>

                    <h3 className="font-black text-slate-900 text-base">{item.name}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                  </div>

                  <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Price</span>
                      <span className="font-black text-amber-600 text-base">{item.cost} Coins</span>
                    </div>

                    <button
                      onClick={() => handleRedeemReward(item)}
                      disabled={coins < item.cost}
                      className={`px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-xs ${
                        coins >= item.cost
                          ? 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      {item.is_physical ? 'Buy Real Item' : 'Redeem Perk'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: MY PROFILE & TOPIC ANALYTICS */}
        {activeTab === 'profile' && !activeQuiz && (
          <div className="space-y-6 max-w-5xl mx-auto">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 text-center sm:text-left">
                <div className="w-20 h-20 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center text-white text-3xl font-black shadow-lg">
                  {authName ? authName.charAt(0).toUpperCase() : 'U'}
                </div>

                <div className="space-y-1.5 flex-1">
                  <h2 className="text-2xl font-black text-slate-900">{authName || 'User'}</h2>
                  <p className="text-xs text-slate-500 font-medium">
                    ID: <span className="font-mono font-bold text-indigo-600">{indexNumber}</span> • Grade {studentGrade} • Role: <span className="uppercase font-bold text-purple-600">{role}</span>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-4 border-t border-slate-100">
                <div className="bg-slate-50 p-3.5 rounded-2xl border text-center">
                  <span className="text-[11px] font-bold text-slate-400 block">Quizzes Done</span>
                  <span className="text-lg font-black text-slate-900">{quizzesCompleted}</span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-2xl border text-center">
                  <span className="text-[11px] font-bold text-slate-400 block">Books Read</span>
                  <span className="text-lg font-black text-emerald-600">{completedBookIds.length || booksRead}</span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-2xl border text-center">
                  <span className="text-[11px] font-bold text-slate-400 block">Reading Hours</span>
                  <span className="text-lg font-black text-teal-600">{readingHours} hrs</span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-2xl border text-center">
                  <span className="text-[11px] font-bold text-slate-400 block">EduCoins</span>
                  <span className="text-lg font-black text-amber-600">{coins}</span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-2xl border text-center col-span-2 sm:col-span-1">
                  <span className="text-[11px] font-bold text-slate-400 block">Daily Streak</span>
                  <span className="text-lg font-black text-orange-600">{streak} Days 🔥</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <BarChart2 className="w-6 h-6 text-indigo-600" />
                <h3 className="text-lg font-black text-slate-900">Syllabus Topic Strengths & Weaknesses</h3>
              </div>
              
              {ALL_SUBJECTS.map((subj) => (
                <SubjectAnalyticsCard
                  key={subj}
                  subject={subj}
                  attempts={challengeAttempts}
                />
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: TEACHER STUDIO */}
        {activeTab === 'studio' && (role === 'teacher' || role === 'admin') && (
          <div className="max-w-5xl mx-auto space-y-6">
            <TeacherStudentTracker subjects={ALL_SUBJECTS} />
          </div>
        )}

        {/* TAB 7: COMPLETE ADMIN CRUD CENTER */}
        {activeTab === 'settings' && (role === 'teacher' || role === 'admin') && (
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-xs space-y-4">
              <div className="flex items-center space-x-3">
                <Settings className="w-7 h-7 text-rose-600" />
                <div>
                  <h2 className="text-xl font-black text-slate-900">Admin CRUD Management Center</h2>
                  <p className="text-xs text-slate-500">Full Create, Read, Edit, and Delete access for Books, LS Shop Gifts, Badges, and Quizzes.</p>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2 border-t border-slate-100 overflow-x-auto scrollbar-none">
                <button onClick={() => setAdminTab('books')} className={`px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 whitespace-nowrap ${adminTab === 'books' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>📚 Manage Books ({books.length})</button>
                <button onClick={() => setAdminTab('prizes')} className={`px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 whitespace-nowrap ${adminTab === 'prizes' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600'}`}>🎒 LS Shop Gifts ({shopItems.length})</button>
                <button onClick={() => setAdminTab('badges')} className={`px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 whitespace-nowrap ${adminTab === 'badges' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600'}`}>🏅 Badges ({badges.length})</button>
                <button onClick={() => setAdminTab('quizzes')} className={`px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 whitespace-nowrap ${adminTab === 'quizzes' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>📝 Quizzes ({quizzes.length})</button>
              </div>
            </div>

            {/* BOOKS CRUD */}
            {adminTab === 'books' && (
              <div className="space-y-6">
                <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-xs space-y-4">
                  <h3 className="text-base font-black text-slate-900">{editingBook ? '✏️ Edit Book' : '➕ Create New Multi-Page Book'}</h3>
                  <form onSubmit={handleSaveBook} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input type="text" value={bookForm.title} onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })} placeholder="Book Title" className="bg-slate-50 border rounded-xl p-2.5 text-xs text-slate-800" required />
                      <input type="text" value={bookForm.author} onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })} placeholder="Author Name" className="bg-slate-50 border rounded-xl p-2.5 text-xs text-slate-800" required />
                      <select value={bookForm.subject} onChange={(e) => setBookForm({ ...bookForm, subject: e.target.value })} className="bg-slate-50 border rounded-xl p-2.5 text-xs font-bold text-slate-800">
                        {ALL_SUBJECTS.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">⏱️ Assigned Reading Hours</label>
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
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">🔑 Book Claim Code (Librarian Code)</label>
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

                    <textarea rows={4} value={bookForm.pageText} onChange={(e) => setBookForm({ ...bookForm, pageText: e.target.value })} placeholder="Page text... Use ---PAGE--- for chapter splits." className="w-full bg-slate-50 border rounded-xl p-3 text-xs" required />
                    
                    <div className="flex space-x-2">
                      <button type="submit" className="bg-emerald-600 text-white font-bold px-6 py-2.5 rounded-xl text-xs">{editingBook ? 'Save Changes' : 'Publish Book'}</button>
                      {editingBook && <button type="button" onClick={() => setEditingBook(null)} className="bg-slate-100 text-slate-600 font-bold px-4 py-2.5 rounded-xl text-xs">Cancel</button>}
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* SHOP CRUD WITH PHYSICAL ITEM TOGGLE */}
            {adminTab === 'prizes' && (
              <div className="space-y-6">
                <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-xs space-y-4">
                  <h3 className="text-base font-black text-slate-900">{editingPrize ? '✏️ Edit LS Shop Gift' : '➕ Create New LS Shop Gift'}</h3>
                  <form onSubmit={handleSavePrize} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <input type="text" value={prizeForm.name} onChange={(e) => setPrizeForm({ ...prizeForm, name: e.target.value })} placeholder="Item Name" className="bg-slate-50 border rounded-xl p-2.5 text-xs text-slate-800" required />
                      <input type="number" value={prizeForm.cost} onChange={(e) => setPrizeForm({ ...prizeForm, cost: e.target.value })} placeholder="EduCoins Cost" className="bg-slate-50 border rounded-xl p-2.5 text-xs text-slate-800" required />
                      <input type="text" value={prizeForm.icon} onChange={(e) => setPrizeForm({ ...prizeForm, icon: e.target.value })} placeholder="Emoji Icon (e.g. 🎒)" className="bg-slate-50 border rounded-xl p-2.5 text-xs text-slate-800" />
                      <select value={prizeForm.category} onChange={(e) => setPrizeForm({ ...prizeForm, category: e.target.value })} className="bg-slate-50 border rounded-xl p-2.5 text-xs font-bold text-slate-800">
                        <option value="Physical Store">Physical Store Item</option>
                        <option value="Privilege">School Privilege</option>
                        <option value="Digital Perk">Digital Perk</option>
                        <option value="Booster">Booster</option>
                      </select>
                    </div>

                    <div className="flex items-center space-x-2 pt-1">
                      <input
                        type="checkbox"
                        id="phys_item_chk"
                        checked={prizeForm.is_physical}
                        onChange={(e) => setPrizeForm({ ...prizeForm, is_physical: e.target.checked })}
                      />
                      <label htmlFor="phys_item_chk" className="text-xs font-bold text-slate-700">
                        Real Physical Goods (Requires Physical Store Claim Voucher)
                      </label>
                    </div>

                    <input type="text" value={prizeForm.desc} onChange={(e) => setPrizeForm({ ...prizeForm, desc: e.target.value })} placeholder="Item Description" className="w-full bg-slate-50 border rounded-xl p-2.5 text-xs text-slate-800" />

                    <div className="flex space-x-2">
                      <button type="submit" className="bg-amber-500 text-slate-950 font-black px-6 py-2.5 rounded-xl text-xs">{editingPrize ? 'Save Changes' : 'Publish Item'}</button>
                      {editingPrize && <button type="button" onClick={() => setEditingPrize(null)} className="bg-slate-100 text-slate-600 font-bold px-4 py-2.5 rounded-xl text-xs">Cancel</button>}
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 8: LEADERBOARD */}
        {activeTab === 'leaderboard' && (
          <div className="max-w-xl mx-auto space-y-4">
            <div className="bg-white border border-slate-200 p-6 rounded-3xl text-center space-y-2 shadow-xs">
              <Trophy className="w-10 h-10 text-yellow-500 mx-auto" />
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">School Leaderboard</h2>
              <p className="text-xs text-slate-500">Live ranks calculated from combined quiz & reading XP!</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl divide-y divide-slate-100 shadow-xs">
              {leaderboardUsers.map((s, idx) => (
                <div key={idx} className="p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-base font-bold w-6">{idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}`}</span>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900">{s.full_name || 'Student'}</h4>
                      <span className="text-[11px] text-slate-500 font-mono">ID: {s.index_number || 'N/A'} • Grade {s.grade} • {s.reading_hours || 0} Reading Hrs</span>
                    </div>
                  </div>
                  <span className="text-xs sm:text-sm font-black text-indigo-600">{s.xp} XP</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quiz Runner Overlay */}
        {activeQuiz && (
          <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-3xl p-5 sm:p-8 shadow-md">
            {gameOver ? (
              <div className="text-center py-6 space-y-5">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto text-3xl">💔</div>
                <h2 className="text-2xl font-black text-slate-900">Game Over!</h2>
                <div className="flex justify-center space-x-3 pt-2">
                  <button onClick={() => setActiveQuiz(null)} className="bg-indigo-600 text-white font-bold px-6 py-2.5 rounded-xl text-xs">Back to Portal</button>
                </div>
              </div>
            ) : !quizFinished ? (
              <>
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                  <span className="text-xs font-semibold text-slate-500">Question {currentQuestionIdx + 1} of {activeQuiz.questions.length}</span>
                </div>

                <h2 className="text-base sm:text-lg font-extrabold text-slate-900 mb-6 leading-relaxed">
                  {activeQuiz.questions[currentQuestionIdx].question_text}
                </h2>

                <div className="space-y-2.5 mb-6">
                  {['A', 'B', 'C', 'D'].map((optKey) => {
                    const optionText = activeQuiz.questions[currentQuestionIdx][`option_${optKey.toLowerCase()}`];
                    const isSelected = selectedOption === optKey;
                    const isCorrect = optKey === activeQuiz.questions[currentQuestionIdx].correct_option;

                    let btnStyle = 'bg-slate-50 border-slate-200 text-slate-700';
                    if (showExplanation) {
                      if (isCorrect) btnStyle = 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold';
                      else if (isSelected) btnStyle = 'bg-red-50 border-red-400 text-red-900';
                    }

                    return (
                      <button
                        key={optKey}
                        onClick={() => handleAnswerSubmit(optKey)}
                        disabled={showExplanation}
                        className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition ${btnStyle}`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="w-6 h-6 rounded-lg bg-white border flex items-center justify-center font-bold text-xs text-indigo-700">
                            {optKey}
                          </span>
                          <span className="text-xs sm:text-sm">{optionText}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {showExplanation && (
                  <button
                    onClick={nextQuestion}
                    className="w-full bg-indigo-600 text-white font-bold py-3 rounded-2xl transition flex items-center justify-center space-x-2"
                  >
                    <span>{currentQuestionIdx + 1 < activeQuiz.questions.length ? 'Next Question' : 'Finish Test'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </>
            ) : (
              <div className="text-center py-4 space-y-6">
                <Trophy className="w-12 h-12 text-amber-600 mx-auto" />
                <h2 className="text-2xl font-black text-slate-900">Quiz Complete!</h2>
                <button onClick={() => setActiveQuiz(null)} className="bg-indigo-600 text-white font-bold px-8 py-3 rounded-2xl text-xs">Return to Portal</button>
              </div>
            )}
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

      {/* PHYSICAL GIFT CLAIM VOUCHER MODAL */}
      {viewingVoucher && (
        <PhysicalGiftVoucherModal
          redemption={viewingVoucher}
          onClose={() => setViewingVoucher(null)}
        />
      )}
    </div>
  );
}