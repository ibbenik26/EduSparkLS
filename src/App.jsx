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
  AlertCircle, CheckCircle, Smile, Shield, UserCheck, UserX
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

// Quick Emoji Palette for Gift Shop Items
const QUICK_EMOJIS = ['🎒', '📓', '📐', '🖍️', '🎨', '🎟️', '⚡', '🎁', '⚽', '🏆', '📱', '📚', '🧩', '🎮', '🎧', '✏️'];

// --- Helper for RTL Script Detection ---
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

// --- Claim Physical Library Book Verification Modal ---
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
              <span className="text-[10px] text-slate-400 font-normal">(Provided by librarian)</span>
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

// --- Initial Datasets ---
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
    subject_code: '2210',
    exam_year: 2024,
    variant: 'Paper 21',
    is_past_paper: true,
    questions: [
      {
        id: 'q2_1',
        topic: 'Data Structures',
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
        topic: 'Algebraic Expressions',
        question_text: 'Simplify: 3x + 5x - 2x',
        option_a: '6x', option_b: '10x', option_c: '8x', option_d: '4x',
        correct_option: 'A', explanation: '(3 + 5 - 2)x = 6x.'
      }
    ]
  }
];

export default function App() {
  // --- Auth View State ---
  const [authView, setAuthView] = useState('landing');

  // --- Auth User State ---
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('student'); // 'student', 'teacher', 'shop_admin', 'super_admin'
  const [userStatus, setUserStatus] = useState('active'); // 'active', 'disabled'
  const [teacherSubject, setTeacherSubject] = useState('Physics');

  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [indexNumber, setIndexNumber] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  // --- Student Metrics & Wallet ---
  const [studentGrade, setStudentGrade] = useState(7);
  const [coins, setCoins] = useState(350);
  const [xp, setXp] = useState(420);
  const [totalEarned, setTotalEarned] = useState(600);
  const [totalSpent, setTotalSpent] = useState(250);
  const [savingsGoal, setSavingsGoal] = useState({ item: 'Deluxe Geometry Set', target: 250 });
  const [streak, setStreak] = useState(1);
  const [quizzesCompleted, setQuizzesCompleted] = useState(0);
  const [booksRead, setBooksRead] = useState(0);
  const [readingHours, setReadingHours] = useState(5.5);
  const [claimedRewards, setClaimedRewards] = useState([]);
  const [activityLog, setActivityLog] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');

  // --- Independent Decoupled Reading Records ---
  const [onlineReadBookIds, setOnlineReadBookIds] = useState([]);
  const [physicalClaimedBookIds, setPhysicalClaimedBookIds] = useState([]);
  const [completedChallenges, setCompletedChallenges] = useState([]);
  const [challengeAttempts, setChallengeAttempts] = useState([]);

  // --- App Collections ---
  const [quizzes, setQuizzes] = useState(INITIAL_QUIZZES);
  const [books, setBooks] = useState(INITIAL_BOOKS);
  const [shopItems, setShopItems] = useState(INITIAL_SHOP_ITEMS);
  const [badges, setBadges] = useState(INITIAL_BADGES);
  const [orders, setOrders] = useState([
    {
      id: 'ord_101',
      student_id: 'stu_1',
      student_name: 'Adam Zahir',
      index_number: 'STU-2026-012',
      item_id: 'item_2',
      item_name: 'EduSpark Branded Notebook',
      cost: 180,
      status: 'Pending',
      date: '2026-10-14 10:30 AM',
      claim_code: 'ES-SHOP-8821'
    }
  ]);
  const [allProfiles, setAllProfiles] = useState([]);
  const [leaderboardUsers, setLeaderboardUsers] = useState([]);

  // --- Live Online E-Reader & Auto Time Detector ---
  const [selectedBook, setSelectedBook] = useState(null);
  const [claimingBook, setClaimingBook] = useState(null);
  const [bookPageIndex, setBookPageIndex] = useState(0);
  const [readerFontSize, setReaderFontSize] = useState('base');
  const [readerTheme, setReaderTheme] = useState('light');
  const [isFullScreenReader, setIsFullScreenReader] = useState(false);
  const [activeReadingSeconds, setActiveReadingSeconds] = useState(0);

  // --- Global Filters ---
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

  // --- Studio State ---
  const [targetArena, setTargetArena] = useState('olevel');
  const [studioGrade, setStudioGrade] = useState(7);
  const [studioSubject, setStudioSubject] = useState('Physics');
  const [studioSubjectCode, setStudioSubjectCode] = useState('0625');
  const [studioYear, setStudioYear] = useState('2024');
  const [studioVariant, setStudioVariant] = useState('Paper 12');
  const [jsonInputText, setJsonInputText] = useState(`[
  {
    "topic": "Kinematics & Motion",
    "question_text": "What does the gradient of a distance-time graph represent?",
    "option_a": "Acceleration",
    "option_b": "Speed",
    "option_c": "Displacement",
    "option_d": "Force",
    "correct_option": "B",
    "explanation": "Speed is given by the gradient (change in distance over time)."
  }
]`);
  const [studioMsg, setStudioMsg] = useState({ type: '', text: '' });

  // --- Admin / CRUD Forms ---
  const [adminTab, setAdminTab] = useState('users');
  const [editingBook, setEditingBook] = useState(null);
  const [bookForm, setBookForm] = useState({
    title: '', author: '', subject: 'Dhivehi', cover_url: '', summary: '', extract: '', pageText: '',
    reading_hours: 2.0, claim_code: ''
  });

  const [editingShopItem, setEditingShopItem] = useState(null);
  const [shopItemForm, setShopItemForm] = useState({
    name: '', category: 'School Supplies', cost: 200, stock: 10, is_real: true, icon: '🎒', desc: ''
  });

  const [editingBadge, setEditingBadge] = useState(null);
  const [badgeForm, setBadgeForm] = useState({ title: '', desc: '', icon: '🏅', minQuizzes: 0, minBooks: 0, minXp: 0, minCoins: 0, minStreak: 0 });

  const [editingQuiz, setEditingQuiz] = useState(null);
  const [quizForm, setQuizForm] = useState({ title: '', subject: 'Physics', grade: 7, subject_code: '0625', exam_year: 2024, variant: 'Paper 12', is_past_paper: false });

  // --- Navigation Controls ---
  const navigateToTab = (tabName) => {
    setActiveQuiz(null);
    setSelectedBook(null);
    setClaimingBook(null);
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

  // --- Auto-timer Effect for E-Reader ---
  useEffect(() => {
    let readingInterval = null;
    if (selectedBook) {
      readingInterval = setInterval(() => {
        setActiveReadingSeconds(sec => sec + 1);
      }, 1000);
    } else {
      setActiveReadingSeconds(0);
    }
    return () => clearInterval(readingInterval);
  }, [selectedBook]);

  // --- Supabase Session & Profile Subscriptions ---
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
        setUserStatus(data.status || 'active');
        setTeacherSubject(data.teacher_subject || 'Physics');
        setStudentGrade(data.grade || 7);
        setCoins(data.coins ?? 350);
        setXp(data.xp ?? 420);
        setTotalEarned(data.total_earned ?? 600);
        setTotalSpent(data.total_spent ?? 250);
        setStreak(data.streak ?? 1);
        setQuizzesCompleted(data.quizzes_completed ?? 0);
        setBooksRead(data.books_read ?? 0);
        setReadingHours(data.reading_hours ?? 5.5);
        setClaimedRewards(data.claimed_rewards || []);
        setActivityLog(data.activity_log || []);
        setCompletedChallenges(data.completed_challenges || []);
        setChallengeAttempts(data.challenge_attempts || []);
        setOnlineReadBookIds(data.online_read_book_ids || []);
        setPhysicalClaimedBookIds(data.physical_claimed_book_ids || []);
      }
      if (data?.role === 'super_admin') {
        fetchAllProfiles();
      }
    } catch (e) { console.warn("Profile fetch error:", e); }
    fetchLeaderboard();
  };

  const fetchAllProfiles = async () => {
    try {
      const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      if (data) setAllProfiles(data);
    } catch (e) { console.warn("Profiles list error:", e); }
  };

  const syncProfileToSupabase = async (updates) => {
    if (!user) return;
    try {
      await supabase.from('profiles').upsert({
        id: user.id,
        full_name: authName,
        index_number: indexNumber,
        role: role,
        status: userStatus,
        teacher_subject: teacherSubject,
        grade: studentGrade,
        coins: updates.coins ?? coins,
        xp: updates.xp ?? xp,
        total_earned: updates.total_earned ?? totalEarned,
        total_spent: updates.total_spent ?? totalSpent,
        streak: updates.streak ?? streak,
        quizzes_completed: updates.quizzes_completed ?? quizzesCompleted,
        books_read: updates.books_read ?? booksRead,
        reading_hours: updates.reading_hours ?? readingHours,
        claimed_rewards: updates.claimed_rewards ?? claimedRewards,
        activity_log: updates.activity_log ?? activityLog,
        completed_challenges: updates.completed_challenges ?? completedChallenges,
        challenge_attempts: updates.challenge_attempts ?? challengeAttempts,
        online_read_book_ids: updates.online_read_book_ids ?? onlineReadBookIds,
        physical_claimed_book_ids: updates.physical_claimed_book_ids ?? physicalClaimedBookIds,
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
  const handleLogin = async (e, customEmail = null, customPassword = null) => {
    if (e) e.preventDefault();
    const targetEmail = customEmail || authEmail;
    const targetPassword = customPassword || authPassword;

    if (!targetEmail || !targetPassword) return alert('Please enter your email and password.');
    setAuthLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: targetEmail,
        password: targetPassword,
      });
      if (error) throw error;

      if (data?.user) {
        const { data: profile } = await supabase.from('profiles').select('status, role').eq('id', data.user.id).single();
        if (profile && profile.status === 'disabled') {
          await supabase.auth.signOut();
          setUser(null);
          alert("🔒 Your account login has been disabled by the Super Admin. Please contact school administration.");
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
    if (!authName.trim()) return alert('Please enter your full name.');
    if (!authEmail.trim() || !authPassword.trim()) return alert('Please enter an email and password.');

    if (role === 'student' && !indexNumber.trim()) {
      return alert('Please enter your Student Index Number.');
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
          role: role, // 'student' or 'teacher'
          status: 'active',
          teacher_subject: role === 'teacher' ? teacherSubject : null,
          grade: studentGrade,
          coins: 350,
          xp: 420,
          total_earned: 600,
          total_spent: 250,
          streak: 1,
          quizzes_completed: 0,
          books_read: 0,
          reading_hours: 5.5,
          claimed_rewards: [],
          activity_log: [{ id: 'init_1', title: `Registered as ${role.toUpperCase()}`, date: 'Just now' }],
          completed_challenges: [],
          challenge_attempts: [],
          online_read_book_ids: [],
          physical_claimed_book_ids: []
        }]);
      }
      alert(`✅ Account registered successfully as ${role.toUpperCase()}! Welcome to EduSpark IQ.`);
    } catch (err) {
      alert("Registration Error: " + err.message);
    } fontally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setActiveQuiz(null);
    setAuthView('landing');
  };

  // --- Super Admin User Management Operations ---
  const handleUpdateUserByAdmin = async (targetUserId, updates) => {
    try {
      await supabase.from('profiles').update(updates).eq('id', targetUserId);
      setAllProfiles(allProfiles.map(p => p.id === targetUserId ? { ...p, ...updates } : p));
      alert("✅ User account updated successfully!");
    } catch (err) {
      alert("Failed to update user: " + err.message);
    }
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
    setActiveReadingSeconds(0);
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
    const newTotalEarned = totalEarned + coinsEarned;
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
            topic: q.topic || 'General Concept',
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
    setTotalEarned(newTotalEarned);
    setXp(newXp);
    setQuizzesCompleted(newQuizzesCount);
    setActivityLog(newLog);

    syncProfileToSupabase({
      coins: newCoins,
      total_earned: newTotalEarned,
      xp: newXp,
      quizzes_completed: newQuizzesCount,
      activity_log: newLog,
      completed_challenges: updatedCompletedChallenges,
      challenge_attempts: updatedChallengeAttempts
    });
  };

  // --- Finish Online Reading Session (Auto-Detected Reading Time) ---
  const handleFinishOnlineReading = (book) => {
    const elapsedMinutes = Math.max(1, Math.round(activeReadingSeconds / 60));
    const hoursEarned = Math.round((elapsedMinutes / 60) * 100) / 100;
    const coinsEarned = elapsedMinutes * 2;
    const xpEarned = elapsedMinutes * 5;

    const newReadingHours = Math.round((readingHours + hoursEarned) * 100) / 100;
    const newCoins = coins + coinsEarned;
    const newTotalEarned = totalEarned + coinsEarned;
    const newXp = xp + xpEarned;
    const newOnlineReads = Array.from(new Set([...onlineReadBookIds, book.id]));

    const newLog = [
      {
        id: `act_${Date.now()}`,
        title: `📖 Online E-Reader Session: ${book.title}`,
        readingHoursLogged: hoursEarned,
        coinsGained: coinsEarned,
        xpGained: xpEarned,
        date: 'Just now'
      },
      ...activityLog
    ];

    setSelectedBook(null);
    setIsFullScreenReader(false);
    setReadingHours(newReadingHours);
    setCoins(newCoins);
    setTotalEarned(newTotalEarned);
    setXp(newXp);
    setOnlineReadBookIds(newOnlineReads);
    setActivityLog(newLog);

    playSound('coin');
    confetti({ particleCount: 90, spread: 70 });

    syncProfileToSupabase({
      reading_hours: newReadingHours,
      coins: newCoins,
      total_earned: newTotalEarned,
      xp: newXp,
      online_read_book_ids: newOnlineReads,
      activity_log: newLog
    });

    alert(`🎉 Online Reading Time Logged!\n• Time Spent: ${elapsedMinutes} mins (+${hoursEarned} hrs)\n• Earned: +${coinsEarned} EduCoins & +${xpEarned} XP!`);
  };

  // --- Claim Physical Library Book Hours ---
  const handleClaimVerifiedReadingHours = (book) => {
    const hoursToCredit = parseFloat(book.reading_hours) || 2.0;
    const newReadingHours = Math.round((readingHours + hoursToCredit) * 10) / 10;
    const coinsGained = Math.round(hoursToCredit * 15);
    const newCoins = coins + coinsGained;
    const newTotalEarned = totalEarned + coinsGained;
    const newXp = xp + Math.round(hoursToCredit * 30);
    const newPhysicalClaimed = Array.from(new Set([...physicalClaimedBookIds, book.id]));

    const newLog = [
      {
        id: `act_${Date.now()}`,
        title: `📚 Logged Library Book: ${book.title}`,
        readingHoursLogged: hoursToCredit,
        coinsGained: coinsGained,
        xpGained: Math.round(hoursToCredit * 30),
        date: 'Just now'
      },
      ...activityLog
    ];

    setReadingHours(newReadingHours);
    setCoins(newCoins);
    setTotalEarned(newTotalEarned);
    setXp(newXp);
    setPhysicalClaimedBookIds(newPhysicalClaimed);
    setActivityLog(newLog);
    setClaimingBook(null);

    playSound('coin');
    confetti({ particleCount: 110, spread: 80 });

    syncProfileToSupabase({
      reading_hours: newReadingHours,
      coins: newCoins,
      total_earned: newTotalEarned,
      xp: newXp,
      physical_claimed_book_ids: newPhysicalClaimed,
      activity_log: newLog
    });

    alert(`🎉 Verified Physical Library Book!\nLogged +${hoursToCredit} Reading Hours, +${coinsGained} EduCoins, and +${Math.round(hoursToCredit * 30)} XP!`);
  };

  // --- Shop Purchase Handlers ---
  const handlePurchaseItem = (item) => {
    if (coins < item.cost) {
      alert(`❌ Insufficient EduCoins!\nYou need ${item.cost - coins} more EduCoins to purchase this item. Keep learning to earn more!`);
      return;
    }

    if (item.stock <= 0) {
      alert("⚠️ Sorry, this item is currently out of stock in the school shop!");
      return;
    }

    if (confirm(`Confirm Purchase:\nItem: ${item.name}\nCost: ${item.cost} EduCoins\n\nYour balance after purchase: ${coins - item.cost} EduCoins`)) {
      const newCoins = coins - item.cost;
      const newSpent = totalSpent + item.cost;
      const claimCode = `ES-SHOP-${Math.floor(1000 + Math.random() * 9000)}`;

      const newOrder = {
        id: `ord_${Date.now()}`,
        student_id: user?.id || 'stu_demo',
        student_name: authName || 'Student Learner',
        index_number: indexNumber || 'STU-2026-001',
        item_id: item.id,
        item_name: item.name,
        cost: item.cost,
        status: 'Pending',
        date: new Date().toLocaleString(),
        claim_code: claimCode
      };

      const updatedItems = shopItems.map(i => i.id === item.id ? { ...i, stock: Math.max(0, i.stock - 1) } : i);

      setCoins(newCoins);
      setTotalSpent(newSpent);
      setOrders([newOrder, ...orders]);
      setShopItems(updatedItems);

      playSound('coin');
      confetti({ particleCount: 100, spread: 70 });

      syncProfileToSupabase({ coins: newCoins, total_spent: newSpent });
      alert(`🎉 Purchase Successful!\nShow Claim Code "${claimCode}" at the School Gift Shop to collect your physical item.`);
    }
  };

  // --- Shop Management Handlers ---
  const handleSaveInventoryItem = async (e) => {
    e.preventDefault();
    if (!shopItemForm.name || !shopItemForm.cost) return alert("Please specify item name and cost.");

    const formattedItem = {
      name: shopItemForm.name,
      category: shopItemForm.category,
      cost: parseInt(shopItemForm.cost),
      stock: parseInt(shopItemForm.stock),
      is_real: shopItemForm.is_real,
      icon: shopItemForm.icon || '🎒',
      desc: shopItemForm.desc || ''
    };

    if (editingShopItem) {
      const updated = { ...editingShopItem, ...formattedItem };
      try {
        await supabase.from('shop_items').update(updated).eq('id', editingShopItem.id);
        setShopItems(shopItems.map(i => i.id === editingShopItem.id ? updated : i));
        setEditingShopItem(null);
        alert("✅ Gift Shop Item Updated!");
      } catch (err) { alert("Update failed: " + err.message); }
    } else {
      const newItem = { id: `item_${Date.now()}`, ...formattedItem };
      try {
        await supabase.from('shop_items').insert([newItem]);
        setShopItems([newItem, ...shopItems]);
        alert("✅ New Gift Shop Item Created!");
      } catch (err) { alert("Create failed: " + err.message); }
    }
    setShopItemForm({ name: '', category: 'School Supplies', cost: 200, stock: 10, is_real: true, icon: '🎒', desc: '' });
  };

  const handleUpdateOrderStatus = (orderId, newStatus) => {
    const targetOrder = orders.find(o => o.id === orderId);
    if (!targetOrder) return;

    if (newStatus === 'Cancelled') {
      if (confirm(`Cancel order for ${targetOrder.student_name} and refund ${targetOrder.cost} EduCoins?`)) {
        setCoins(prev => prev + targetOrder.cost);
        setTotalSpent(prev => Math.max(0, prev - targetOrder.cost));
        setShopItems(shopItems.map(i => i.id === targetOrder.item_id ? { ...i, stock: i.stock + 1 } : i));
        setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'Cancelled' } : o));
      }
      return;
    }

    setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
  };

  const handleDeleteInventoryItem = async (id) => {
    if (confirm("Delete this shop item?")) {
      try { await supabase.from('shop_items').delete().eq('id', id); } catch (e) { console.warn(e); }
      setShopItems(shopItems.filter(i => i.id !== id));
    }
  };

  // --- Admin Books CRUD ---
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

  // --- Teacher Studio JSON Import ---
  const handleJsonImport = async () => {
    setStudioMsg({ type: '', text: '' });

    if (role === 'teacher' && studioSubject !== teacherSubject) {
      setStudioMsg({ type: 'error', text: `⚠️ Teachers can only import/publish quizzes for their assigned subject (${teacherSubject}).` });
      return;
    }

    try {
      const parsed = JSON.parse(jsonInputText);
      if (!Array.isArray(parsed)) throw new Error("JSON must be an array of question objects [...]");

      const formattedQuestions = parsed.map((q, idx) => ({
        id: `q_json_${Date.now()}_${idx}`,
        topic: q.topic || 'General Concept',
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

  const deleteQuiz = async (quizId) => {
    if (confirm('Delete this quiz?')) {
      try { await supabase.from('quizzes').delete().eq('id', quizId); } catch (e) { console.warn(e); }
      setQuizzes((prev) => prev.filter(q => q.id !== quizId));
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
  const currentRank = getStudentRank(xp);

  // =========================================================================
  // --- AUTHENTICATION & RESTORED LANDING PAGE VIEWS (UNAUTHENTICATED) ---
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
              Register Now
            </button>
          </div>
        </header>

        {/* HERO LANDING VIEW */}
        {authView === 'landing' && (
          <main className="max-w-6xl w-full mx-auto px-6 py-10 z-10 flex-1 flex flex-col justify-center items-center text-center space-y-10">
            <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/30 px-4 py-1.5 rounded-full text-indigo-300 text-xs font-bold">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Next-Generation School Portal for Students, Teachers & Store Managers</span>
            </div>

            <div className="space-y-4 max-w-3xl">
              <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
                Empowering Students with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">Smart Topic Diagnostics</span>
              </h1>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
                Access Cambridge O-Level past papers, grade practice vaults, bilingual Dhivehi and Islam library e-books, physical library reading hour logging, and kids cash management gift shop.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
              <button
                onClick={() => setAuthView('register')}
                className="w-full sm:w-auto bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold px-8 py-3.5 rounded-2xl text-sm shadow-xl transition flex items-center justify-center space-x-2"
              >
                <span>Get Started — Student / Teacher Registration</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setAuthView('login')}
                className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold px-8 py-3.5 rounded-2xl text-sm transition"
              >
                Existing User Sign In
              </button>
            </div>

            {/* PLATFORM STATS TICKER */}
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full text-left">
              <div className="bg-slate-800/60 border border-slate-700/60 p-5 rounded-3xl space-y-2">
                <div className="w-10 h-10 bg-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-400">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white">Cambridge O-Level Arena</h3>
                <p className="text-xs text-slate-400">Interactive timed practice for Grades 8–10 with instant explanations.</p>
              </div>

              <div className="bg-slate-800/60 border border-slate-700/60 p-5 rounded-3xl space-y-2">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400">
                  <Library className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white">E-Library & Reading Hours</h3>
                <p className="text-xs text-slate-400">Dhivehi, Islam, and English books with online reader & library claim codes.</p>
              </div>

              <div className="bg-slate-800/60 border border-slate-700/60 p-5 rounded-3xl space-y-2">
                <div className="w-10 h-10 bg-amber-500/20 rounded-2xl flex items-center justify-center text-amber-400">
                  <BarChart2 className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white">Teacher Topic Inspector</h3>
                <p className="text-xs text-slate-400">Topic-by-topic weakness matrix showing teachers exact areas to re-teach.</p>
              </div>

              <div className="bg-slate-800/60 border border-slate-700/60 p-5 rounded-3xl space-y-2">
                <div className="w-10 h-10 bg-purple-500/20 rounded-2xl flex items-center justify-center text-purple-400">
                  <Coins className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white">Kids Cash & Gift Shop</h3>
                <p className="text-xs text-slate-400">Earn EduCoins for reading and testing to buy real items at the school shop.</p>
              </div>
            </div>
          </main>
        )}

        {/* LOGIN VIEW WITH DEMO LOGINS */}
        {authView === 'login' && (
          <main className="max-w-md w-full mx-auto px-6 py-8 z-10 flex-1 flex flex-col justify-center">
            <div className="bg-slate-800 border border-slate-700 p-8 rounded-3xl shadow-2xl space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-black text-white">Welcome Back</h2>
                <p className="text-xs text-slate-400">Sign in to your EduSpark IQ account</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5">User Email / Login ID</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      placeholder="student@school.edu"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-bold text-slate-300">Password</label>
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

              {/* DEMO / TESTING QUICK LOGIN PANEL */}
              <div className="bg-slate-900/80 border border-slate-700/80 p-4 rounded-2xl space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 block">
                  💡 Demo Credentials Reference:
                </span>
                <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                  <button
                    onClick={(e) => {
                      setAuthEmail('student@school.edu');
                      setAuthPassword('student123');
                      handleLogin(e, 'student@school.edu', 'student123');
                    }}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-left text-slate-300 border border-slate-700"
                  >
                    🎓 <strong>Student:</strong><br/>student@school.edu
                  </button>
                  <button
                    onClick={(e) => {
                      setAuthEmail('teacher@school.edu');
                      setAuthPassword('teacher123');
                      handleLogin(e, 'teacher@school.edu', 'teacher123');
                    }}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-left text-purple-300 border border-slate-700"
                  >
                    👨‍🏫 <strong>Teacher:</strong><br/>teacher@school.edu
                  </button>
                  <button
                    onClick={(e) => {
                      setAuthEmail('shop@school.edu');
                      setAuthPassword('shop123');
                      handleLogin(e, 'shop@school.edu', 'shop123');
                    }}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-left text-amber-300 border border-slate-700"
                  >
                    🏬 <strong>Shop CP:</strong><br/>shop@school.edu
                  </button>
                  <button
                    onClick={(e) => {
                      setAuthEmail('superadmin@school.edu');
                      setAuthPassword('super123');
                      handleLogin(e, 'superadmin@school.edu', 'super123');
                    }}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-left text-rose-300 border border-slate-700"
                  >
                    👑 <strong>Super Admin:</strong><br/>superadmin@school.edu
                  </button>
                </div>
              </div>

              <div className="text-center pt-2 border-t border-slate-700/60">
                <p className="text-xs text-slate-400">
                  Don't have an account?{' '}
                  <button onClick={() => setAuthView('register')} className="text-indigo-400 font-bold hover:underline">
                    Register Student/Teacher
                  </button>
                </p>
              </div>
            </div>
          </main>
        )}

        {/* PUBLIC REGISTER VIEW (STUDENT & TEACHER ONLY) */}
        {authView === 'register' && (
          <main className="max-w-md w-full mx-auto px-6 py-8 z-10 flex-1 flex flex-col justify-center">
            <div className="bg-slate-800 border border-slate-700 p-8 rounded-3xl shadow-2xl space-y-5">
              <div className="text-center space-y-1">
                <h2 className="text-2xl font-black text-white">Create Account</h2>
                <p className="text-xs text-slate-400">Register as Student or Teacher</p>
              </div>

              <form onSubmit={handleRegister} className="space-y-3.5">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Account Role</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole('student')}
                      className={`py-2 text-[11px] font-bold rounded-xl border transition ${role === 'student' ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'}`}
                    >
                      🎓 Student
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('teacher')}
                      className={`py-2 text-[11px] font-bold rounded-xl border transition ${role === 'teacher' ? 'bg-purple-600 border-purple-600 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'}`}
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
                    placeholder="email@school.edu"
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

                {role === 'student' ? (
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
                      <label className="text-xs font-bold text-slate-300 block mb-1">Index Number</label>
                      <input
                        type="text"
                        value={indexNumber}
                        onChange={(e) => setIndexNumber(e.target.value)}
                        placeholder="STU-2026-104"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                        required
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="text-xs font-bold text-purple-300 block mb-1">Assigned Teaching Subject</label>
                    <select
                      value={teacherSubject}
                      onChange={(e) => setTeacherSubject(e.target.value)}
                      className="w-full bg-slate-900 border border-purple-500/40 rounded-xl px-3 py-2 text-xs font-bold text-purple-200"
                    >
                      {ALL_SUBJECTS.map(subj => (
                        <option key={subj} value={subj}>{subj}</option>
                      ))}
                    </select>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs transition shadow-md mt-2"
                >
                  {authLoading ? 'Creating Account...' : 'Complete Registration'}
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
          EduSpark IQ © 2026 • School Student Portal & E-Library
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
              <div className="bg-gradient-to-tr from-indigo-600 to-purple-600 p-2 rounded-xl shadow-md">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-black tracking-tight text-slate-900">
                  EduSpark <span className="text-indigo-600">IQ</span>
                </h1>
                <p className="text-[11px] text-slate-500 font-medium">School Student Portal & E-Library</p>
              </div>
            </div>

            <button onClick={handleLogout} className="sm:hidden p-2 text-slate-400 hover:text-slate-700 rounded-lg">
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 sm:gap-3 w-full sm:w-auto">
            {/* Wallet Widget */}
            <div className="flex items-center space-x-2.5 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-full text-xs font-bold text-slate-700">
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
                role === 'super_admin' ? 'bg-rose-100 text-rose-800' :
                role === 'teacher' ? 'bg-purple-100 text-purple-800' :
                role === 'shop_admin' ? 'bg-amber-100 text-amber-800' : currentRank.bg + ' ' + currentRank.text
              }`}>
                {role === 'super_admin' ? '👑 Super Admin' :
                 role === 'teacher' ? `👨‍🏫 ${teacherSubject} Teacher` :
                 role === 'shop_admin' ? '🏬 Shop CP' : currentRank.title}
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
            <BookOpen className="w-3.5 h-3.5 text-indigo-600" /> <span>Grade {studentGrade} Vault</span>
          </button>

          <button
            onClick={() => navigateToTab('library')}
            className={`px-3.5 py-1.5 font-bold flex items-center space-x-1.5 rounded-xl transition shrink-0 whitespace-nowrap ${activeTab === 'library' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <Library className="w-3.5 h-3.5 text-emerald-600" /> <span>E-Library & School Books</span>
          </button>

          {(role === 'teacher' || role === 'super_admin' || studentGrade >= 8) && (
            <button
              onClick={() => navigateToTab('olevel')}
              className={`px-3.5 py-1.5 font-bold flex items-center space-x-1.5 rounded-xl transition shrink-0 whitespace-nowrap ${activeTab === 'olevel' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <GraduationCap className="w-3.5 h-3.5 text-amber-600" /> <span>O-Level Arena</span>
            </button>
          )}

          <button
            onClick={() => navigateToTab('shop')}
            className={`px-3.5 py-1.5 font-bold flex items-center space-x-1.5 rounded-xl transition shrink-0 whitespace-nowrap ${activeTab === 'shop' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <ShoppingBag className="w-3.5 h-3.5" /> <span>Student Gift Shop</span>
          </button>

          <button
            onClick={() => navigateToTab('my_orders')}
            className={`px-3.5 py-1.5 font-bold flex items-center space-x-1.5 rounded-xl transition shrink-0 whitespace-nowrap ${activeTab === 'my_orders' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <History className="w-3.5 h-3.5" /> <span>My Orders & Ledger</span>
          </button>

          {(role === 'shop_admin' || role === 'super_admin') && (
            <button
              onClick={() => navigateToTab('shop_management')}
              className={`px-3.5 py-1.5 font-bold flex items-center space-x-1.5 rounded-xl transition shrink-0 whitespace-nowrap ${activeTab === 'shop_management' ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 text-slate-800 hover:bg-slate-200'}`}
            >
              <Settings className="w-3.5 h-3.5 text-amber-400" /> <span>🏬 Store Sales CP</span>
            </button>
          )}

          {(role === 'teacher' || role === 'super_admin') && (
            <button
              onClick={() => navigateToTab('studio')}
              className={`px-3.5 py-1.5 font-bold flex items-center space-x-1.5 rounded-xl transition shrink-0 whitespace-nowrap ${activeTab === 'studio' ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <BrainCircuit className="w-3.5 h-3.5 text-purple-600" /> <span>Teacher Quiz Studio</span>
            </button>
          )}

          {role === 'super_admin' && (
            <button
              onClick={() => navigateToTab('super_admin_console')}
              className={`px-3.5 py-1.5 font-bold flex items-center space-x-1.5 rounded-xl transition shrink-0 whitespace-nowrap ${activeTab === 'super_admin_console' ? 'bg-rose-600 text-white shadow-xs' : 'bg-rose-50 text-rose-800 hover:bg-rose-100'}`}
            >
              <Shield className="w-3.5 h-3.5" /> <span>👑 Super Admin Console</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">

        {/* TAB 1: PRACTICE VAULT (ALL ROLES CAN PLAY) */}
        {activeTab === 'dashboard' && !activeQuiz && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-black text-slate-900">Grade {studentGrade} Practice Vault</h3>
                <p className="text-xs text-slate-500">Students and teachers can test knowledge across all grade quizzes.</p>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search quizzes..."
                  className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800"
                />

                {(role === 'teacher' || role === 'super_admin') && (
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
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg font-bold">
                        {quiz.subject}
                      </span>
                      {role === 'super_admin' && (
                        <button onClick={() => deleteQuiz(quiz.id)} className="p-1 text-slate-400 hover:text-red-600">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mb-2">{quiz.title}</h3>
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

        {/* TAB 2: E-LIBRARY (DECOUPLED ONLINE READER & PHYSICAL CLAIM) */}
        {activeTab === 'library' && !activeQuiz && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-emerald-800 via-teal-700 to-cyan-800 text-white p-6 sm:p-8 rounded-3xl shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <div className="flex items-center space-x-2">
                  <Library className="w-6 h-6 text-emerald-300" />
                  <h2 className="text-2xl sm:text-3xl font-black">Interactive E-Library & Reading Hub</h2>
                </div>
                <p className="text-xs text-emerald-100">
                  Read online with **auto-time tracking** OR claim physical copies borrowed from the school library! Both can be completed independently for every book.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl text-center space-y-1">
                <span className="text-[10px] text-emerald-200 block uppercase font-bold">Total Reading Hours</span>
                <span className="text-2xl font-black text-amber-300">{readingHours} Hours</span>
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
                          src={book.cover_url || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=600&q=80'}
                          alt={book.title}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        />
                        <span className="absolute top-3 left-3 bg-emerald-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-xl">
                          {book.subject}
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
                          onClick={() => openBookModal(book)}
                          className={`w-full font-bold py-2.5 rounded-2xl text-xs flex items-center justify-center space-x-1 transition ${
                            isOnlineRead ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>{isOnlineRead ? '✓ Read Online' : 'Read Online'}</span>
                        </button>

                        <button
                          onClick={() => setClaimingBook(book)}
                          className={`w-full font-bold py-2.5 rounded-2xl text-xs flex items-center justify-center space-x-1 transition ${
                            isPhysicalClaimed ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                          }`}
                        >
                          <Award className="w-3.5 h-3.5" />
                          <span>{isPhysicalClaimed ? '✓ Physical Claimed' : 'Claim Physical'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: SUPER ADMIN CONTROL CENTER */}
        {activeTab === 'super_admin_console' && role === 'super_admin' && (
          <div className="space-y-6 max-w-5xl mx-auto">
            <div className="bg-rose-950 text-white p-6 sm:p-8 rounded-3xl shadow-lg space-y-3">
              <div className="flex items-center space-x-2 text-rose-400">
                <Shield className="w-6 h-6" />
                <span className="text-xs font-bold uppercase tracking-wider">Super Admin Master Controls</span>
              </div>
              <h2 className="text-2xl font-black">User Accounts, Roles & Access Manager</h2>
              <p className="text-xs text-rose-200">
                Control login status (`Active` / `Disabled`), reassign staff roles (e.g. create and assign **Shop Admins**), and manage platform settings.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-black text-slate-900">User Login & Role Matrix ({allProfiles.length})</h3>
                <button onClick={fetchAllProfiles} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600">
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                      <th className="py-2.5 px-3">User</th>
                      <th className="py-2.5 px-3">Index / Staff ID</th>
                      <th className="py-2.5 px-3">Assigned Role</th>
                      <th className="py-2.5 px-3">Login Status</th>
                      <th className="py-2.5 px-3 text-right">Action Controls</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {allProfiles.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="py-3 px-3 font-bold text-slate-900">
                          {p.full_name || 'User'}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-500">{p.index_number || 'N/A'}</td>
                        <td className="py-3 px-3">
                          <select
                            value={p.role || 'student'}
                            onChange={(e) => handleUpdateUserByAdmin(p.id, { role: e.target.value })}
                            className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs font-bold text-indigo-700"
                          >
                            <option value="student">Student</option>
                            <option value="teacher">Teacher</option>
                            <option value="shop_admin">Shop Admin (Store Sales)</option>
                            <option value="super_admin">Super Admin</option>
                          </select>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                            p.status === 'disabled' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {p.status === 'disabled' ? '🔒 Disabled' : '✓ Active'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right space-x-1">
                          <button
                            onClick={() => handleUpdateUserByAdmin(p.id, { status: p.status === 'disabled' ? 'active' : 'disabled' })}
                            className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition shadow-xs ${
                              p.status === 'disabled' ? 'bg-emerald-600 text-white' : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                            }`}
                          >
                            {p.status === 'disabled' ? 'Enable Login' : 'Disable Login'}
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

        {/* TAB 4: SHOP SALES CP (STORE SALES HANDLING ONLY) */}
        {activeTab === 'shop_management' && (role === 'shop_admin' || role === 'super_admin') && (
          <div className="space-y-6 max-w-5xl mx-auto">
            <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-lg space-y-2">
              <h2 className="text-2xl font-black">🏬 Store Sales & Order Fulfillment Console</h2>
              <p className="text-xs text-slate-400">
                Process student purchases, check claim codes, and manage physical store inventory.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
              <h3 className="font-bold text-slate-900 text-base">Student Orders & Handover Ledger</h3>
              <div className="divide-y divide-slate-100">
                {orders.map((ord) => (
                  <div key={ord.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900">{ord.student_name}</span> — {ord.item_name}
                      <span className="block text-[10px] font-mono text-indigo-600">Code: {ord.claim_code}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                        ord.status === 'Fulfilled' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {ord.status}
                      </span>
                      {ord.status === 'Pending' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(ord.id, 'Fulfilled')}
                          className="bg-emerald-600 text-white px-2.5 py-1 rounded-lg font-bold text-[11px]"
                        >
                          Hand Over
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: TEACHER QUIZ STUDIO (RESTRICTED TO TEACHER'S SUBJECT) */}
        {activeTab === 'studio' && (role === 'teacher' || role === 'super_admin') && (
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="bg-purple-900 text-white p-6 sm:p-8 rounded-3xl shadow-lg space-y-2">
              <h2 className="text-2xl font-black">👨‍🏫 Teacher Subject Quiz Studio</h2>
              <p className="text-xs text-purple-200">
                {role === 'teacher'
                  ? `You are assigned to ${teacherSubject}. Quizzes will be created under ${teacherSubject}.`
                  : 'Super Admin Mode: Full Subject Creation Control.'}
              </p>
            </div>

            <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-xs space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Teaching Subject</label>
                  <select
                    value={studioSubject}
                    disabled={role === 'teacher'} // Locked for teachers
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

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Exam Year</label>
                  <input
                    type="number"
                    value={studioYear}
                    onChange={(e) => setStudioYear(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Questions JSON Format</label>
                <textarea
                  rows={8}
                  value={jsonInputText}
                  onChange={(e) => setJsonInputText(e.target.value)}
                  className="w-full bg-slate-50 border rounded-xl p-3 text-xs font-mono"
                />
              </div>

              <button
                onClick={handleJsonImport}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-2xl text-xs shadow-md transition"
              >
                Publish {studioSubject} Quiz
              </button>

              {studioMsg.text && (
                <div className={`p-3 rounded-xl text-xs ${studioMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'}`}>
                  {studioMsg.text}
                </div>
              )}
            </div>
          </div>
        )}

      </main>

      {/* ONLINE E-READER MODAL WITH AUTO-DETECTED READING TIME */}
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
                <button onClick={() => setSelectedBook(null)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">✕</button>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl min-h-[220px] text-xs leading-relaxed whitespace-pre-line font-serif text-slate-800">
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

      {/* PHYSICAL LIBRARY BOOK VERIFICATION CLAIM MODAL */}
      {claimingBook && (
        <ClaimReadingHoursModal
          book={claimingBook}
          onVerified={() => handleClaimVerifiedReadingHours(claimingBook)}
          onClose={() => setClaimingBook(null)}
        />
      )}

      {/* QUIZ RUNNER OVERLAY */}
      {activeQuiz && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl">
            {!quizFinished ? (
              <>
                <div className="flex justify-between items-center border-b pb-3">
                  <span className="text-xs font-bold text-slate-500">Question {currentQuestionIdx + 1} / {activeQuiz.questions.length}</span>
                  <button onClick={() => setActiveQuiz(null)} className="text-slate-400 font-bold">✕</button>
                </div>

                <h3 className="font-black text-slate-900 text-base leading-relaxed">
                  {activeQuiz.questions[currentQuestionIdx].question_text}
                </h3>

                <div className="space-y-2">
                  {['A', 'B', 'C', 'D'].map((opt) => {
                    const optionText = activeQuiz.questions[currentQuestionIdx][`option_${opt.toLowerCase()}`];
                    return (
                      <button
                        key={opt}
                        onClick={() => handleAnswerSubmit(opt)}
                        disabled={showExplanation}
                        className={`w-full p-3 rounded-xl border text-left text-xs font-semibold transition ${
                          showExplanation
                            ? opt === activeQuiz.questions[currentQuestionIdx].correct_option
                              ? 'bg-emerald-100 border-emerald-500 text-emerald-900'
                              : selectedOption === opt
                              ? 'bg-rose-100 border-rose-500 text-rose-900'
                              : 'bg-slate-50'
                            : 'bg-slate-50 hover:bg-slate-100'
                        }`}
                      >
                        <strong>{opt}:</strong> {optionText}
                      </button>
                    );
                  })}
                </div>

                {showExplanation && (
                  <button onClick={nextQuestion} className="w-full bg-indigo-600 text-white font-bold py-2.5 rounded-xl text-xs">
                    Next Question →
                  </button>
                )}
              </>
            ) : (
              <div className="text-center py-6 space-y-4">
                <Trophy className="w-12 h-12 text-amber-500 mx-auto" />
                <h3 className="text-xl font-black text-slate-900">Quiz Completed!</h3>
                <p className="text-xs text-slate-500">Score: {score} / {activeQuiz.questions.length} • +{score * 15} EduCoins</p>
                <button onClick={() => setActiveQuiz(null)} className="bg-indigo-600 text-white font-bold px-6 py-2 rounded-xl text-xs">
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