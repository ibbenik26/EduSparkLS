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

// --- Claim Reading Hours Verification Modal ---
function ClaimReadingHoursModal({ book, librarianPasscode, onVerified, onClose }) {
  const [studentAnswer, setStudentAnswer] = useState('');
  const [passcodeInput, setPasscodeInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const isRTL = isRTLSubject(book.subject);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!studentAnswer.trim()) {
      setErrorMsg('Please answer the book verification question.');
      return;
    }

    if (passcodeInput.trim() !== librarianPasscode) {
      setErrorMsg('Invalid Librarian Passcode! Please ask your school librarian for the correct code.');
      return;
    }

    onVerified(studentAnswer);
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
              <h3 className="font-black text-slate-900 text-base">Claim Reading Hours</h3>
              <p className="text-[11px] text-slate-500 font-medium">{book.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 font-bold">✕</button>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 text-xs text-emerald-900 flex justify-between items-center">
          <div>
            <span className="block font-bold text-[10px] uppercase text-emerald-700">Reading Credit Value</span>
            <span className="text-base font-black">{book.reading_hours || 2.0} School Reading Hours</span>
          </div>
          <span className="text-2xl">📚</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Question Box */}
          <div className="space-y-1.5" dir={isRTL ? 'rtl' : 'ltr'}>
            <label className="text-xs font-bold text-slate-800 block">
              ❓ Book Verification Question:
            </label>
            <p className={`p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 italic ${isRTL ? 'font-faruma' : ''}`}>
              {book.verification_question || `Briefly describe what you learned or summarize the main event in "${book.title}".`}
            </p>
            <textarea
              rows={3}
              value={studentAnswer}
              onChange={(e) => setStudentAnswer(e.target.value)}
              placeholder="Write your answer here..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          {/* Librarian Passcode */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 block flex items-center justify-between">
              <span>🔑 Librarian Passcode:</span>
              <span className="text-[10px] text-slate-400 font-normal">(Provided by school librarian)</span>
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                value={passcodeInput}
                onChange={(e) => setPasscodeInput(e.target.value)}
                placeholder="Enter Librarian Passcode"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-mono font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
          </div>

          {errorMsg && (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-semibold flex items-center space-x-1.5">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="flex space-x-2 pt-1">
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
              <span>Verify & Log {book.reading_hours || 2.0} Hours</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- Initial Datasets with Dual Reading Modes & Verification Questions ---
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
    book_type: 'Both', // Online E-Book & Physical Library
    verification_question: 'ދިވެހިބަހުގައި ހިމެނޭ ތާނައަކުރުގެ ޖުމްލަ ޢަދަދަކީ ކޮބާ؟',
    pages: [
      "ފުރަތަމަ ބާބު: ތާނަ އަކުރު\n\nދިވެހިބަހުން ލިޔުމަށް ބޭނުންކުރަނީ ތާނައަކުރެވެ. ތާނައަކުރުގައި ހިމެނެނީ 24 އަކުރާއި 11 ޒަވިޔަން އަކުރެވެ.\n\nއަސާސީ އަކުރުތަކަކީ: ހަ، ށަ، ނު، ރަ، ބަ، ޅަ، ކަ، އަ، ވު، މު، ފަ، ދު، ތަ، ލަ، ގަ، ޏަ، ސަ، ޑަ، ޒަ، ޓަ، ޔަ، ޕަ، ޖަ، ޗަ އެވެ.",
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
    extract: 'ފުރަތަމަ ފިލާވަޅު: އީމާންކަމުގެ އަރުކާންތައް... އީމާންކަމުގެ އަރުކާނަކީ 6 ކަމެކެވެ. 1. ﷲ އަށް އީމާންވުން...',
    reading_hours: 3.0,
    book_type: 'Both',
    verification_question: 'އީމާންކަމުގެ އަރުކާންތަކުގެ ތެރެއިން ފުރަތަމަ އަރުކާނަކީ ކޮބާ؟',
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
    book_type: 'Both',
    verification_question: 'What is Newton\'s First Law of Motion as described in Chapter 1?',
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
  const [librarianPasscode, setLibrarianPasscode] = useState('LIB-2026');
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
  const [readingHours, setReadingHours] = useState(5.5); // Total logged reading hours
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
  const [claimingBook, setClaimingBook] = useState(null); // Book currently triggering Claim Hours Modal
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

  // --- Admin CRUD State ---
  const [adminTab, setAdminTab] = useState('books');
  const [editingBook, setEditingBook] = useState(null);
  const [bookForm, setBookForm] = useState({
    title: '', author: '', subject: 'Dhivehi', cover_url: '', summary: '', extract: '', pageText: '',
    reading_hours: 2.0, book_type: 'Both', verification_question: ''
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
          book_type: b.book_type || 'Both',
          verification_question: b.verification_question || ''
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

  // --- Verified Claiming Handler ---
  const handleClaimVerifiedReadingHours = (book, studentAnswer) => {
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
        answerSubmitted: studentAnswer,
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
      book_type: bookForm.book_type || 'Both',
      verification_question: bookForm.verification_question || ''
    };

    if (editingBook) {
      try {
        await supabase.from('books').update(bookObject).eq('id', editingBook.id);
        setBooks(books.map(b => b.id === editingBook.id ? { ...b, ...bookObject } : b));
        setEditingBook(null);
        alert("✅ Book and Reading Hours updated!");
      } catch (err) { alert("Update failed: " + err.message); }
    } else {
      const newBook = { id: `book_${Date.now()}`, ...bookObject };
      try {
        await supabase.from('books').insert([newBook]);
        setBooks([newBook, ...books]);
        alert("✅ New Book published to Library!");
      } catch (err) { alert("Create failed: " + err.message); }
    }

    setBookForm({
      title: '', author: '', subject: 'Dhivehi', cover_url: '', summary: '', extract: '', pageText: '',
      reading_hours: 2.0, book_type: 'Both', verification_question: ''
    });
  };

  // --- Simple Auth & Tab Controls ---
  const navigateToTab = (tabName) => {
    setActiveQuiz(null);
    setSelectedBook(null);
    setClaimingBook(null);
    setIsFullScreenReader(false);
    setActiveTab(tabName);
  };

  // Filtered books
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
                  Read digital books online or borrow physical books from the school library! Verify your reading with a quick question and the **Librarian Passcode** to log your official **School Reading Hours**.
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

        {/* ADMIN STUDIO FOR SETTING READING HOURS & QUESTIONS */}
        {activeTab === 'settings' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white border p-6 rounded-3xl shadow-xs space-y-4">
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="font-black text-base text-slate-900">Book & School Reading Hours Manager</h3>
                <div className="flex items-center space-x-2 text-xs font-mono bg-purple-50 text-purple-800 px-3 py-1 rounded-xl border border-purple-200">
                  <span>Librarian Passcode: <strong>{librarianPasscode}</strong></span>
                </div>
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
                      📚 Availability Type
                    </label>
                    <select
                      value={bookForm.book_type}
                      onChange={(e) => setBookForm({ ...bookForm, book_type: e.target.value })}
                      className="w-full bg-slate-50 border rounded-xl p-2.5 text-xs font-bold text-slate-800"
                    >
                      <option value="Both">Both (Online E-Book & Physical Library)</option>
                      <option value="Physical">Physical School Library Only</option>
                      <option value="Online">Online E-Book Only</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    ❓ Excerpt Comprehension Question (Asked before claiming hours)
                  </label>
                  <input
                    type="text"
                    value={bookForm.verification_question}
                    onChange={(e) => setBookForm({ ...bookForm, verification_question: e.target.value })}
                    placeholder="e.g., What main scientific principle is introduced in Chapter 1?"
                    className="w-full bg-slate-50 border rounded-xl p-2.5 text-xs text-slate-800"
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

                <button type="submit" className="bg-emerald-600 text-white font-bold px-6 py-2.5 rounded-xl text-xs">
                  {editingBook ? 'Save Changes' : 'Publish Book & Assign Hours'}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* VERIFICATION CLAIM MODAL */}
      {claimingBook && (
        <ClaimReadingHoursModal
          book={claimingBook}
          librarianPasscode={librarianPasscode}
          onVerified={(studentAnswer) => handleClaimVerifiedReadingHours(claimingBook, studentAnswer)}
          onClose={() => setClaimingBook(null)}
        />
      )}
    </div>
  );
}