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
  PackageCheck, ShoppingCart, Store, Crown, Calendar, Building2, CheckSquare,
  ExternalLink, Layers3, PlusCircle, Code
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
  if (xp >= 2000) return { title: 'Legend', level: 5, text: 'text-amber-700', bg: 'bg-amber-100 border-amber-300' };
  if (xp >= 1200) return { title: 'Master', level: 4, text: 'text-purple-700', bg: 'bg-purple-100 border-purple-300' };
  if (xp >= 700)  return { title: 'Expert', level: 3, text: 'text-indigo-700', bg: 'bg-indigo-100 border-indigo-300' };
  if (xp >= 300)  return { title: 'Scholar', level: 2, text: 'text-emerald-700', bg: 'bg-emerald-100 border-emerald-300' };
  return { title: 'Novice', level: 1, text: 'text-slate-700', bg: 'bg-slate-100 border-slate-300' };
};

// --- Educational Partners & Sponsors ---
const EDUCATIONAL_PARTNERS = [
  { name: 'Cambridge Assessment International', category: 'Exam Board Partner', logo: '🎓' },
  { name: 'Ministry of Education Maldives', category: 'Curriculum Sponsor', logo: '🇲🇻' },
  { name: 'Oxford University Press', category: 'Academic Library Partner', logo: '📚' },
  { name: 'Faber-Castell Maldives', category: 'LS Gift Shop Partner', logo: '✏️' },
  { name: 'Dhivehi Bahuge Academy', category: 'Language & Culture Sponsor', logo: '🖊️' }
];

// --- Datasets: Physical Gifts & Initial Books/Quizzes ---
const INITIAL_SHOP_ITEMS = [
  { id: 'item_p1', name: 'LS Stainless Steel Water Bottle', category: 'Physical Store', is_physical: true, cost: 450, icon: '🥛', desc: 'Official insulated 500ml Lhohee School Water Bottle. Claim at physical desk!' },
  { id: 'item_p2', name: 'LS Hardcover A5 Study Journal', category: 'Physical Store', is_physical: true, cost: 250, icon: '📓', desc: 'Embossed leatherette notebook for study notes and homework tracking.' },
  { id: 'item_p3', name: 'Faber-Castell Gel Pen 5-Pack', category: 'Physical Store', is_physical: true, cost: 180, icon: '✏️', desc: 'High quality smooth gel pens in blue, black, red, green, and purple.' },
  { id: 'item_p4', name: 'LS School Branded Hoodie', category: 'Physical Store', is_physical: true, cost: 850, icon: '🧥', desc: 'Cozy embroidered school hoodie. Pick up at LS store.' },
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
      "CHAPTER 1: THE LAWS OF MOTION\n\nPhysics is the fundamental science that seeks to understand how the universe behaves."
    ]
  }
];

const INITIAL_QUIZZES = [
  {
    id: 'daily_quiz_1',
    title: 'Kinematics & Acceleration Practice',
    subject: 'Physics',
    grade: 10,
    topic: 'Kinematics & Motion',
    is_daily_quiz: true,
    questions: [
      {
        id: 'dq_1',
        topic: 'Kinematics & Acceleration',
        question_text: 'A train accelerates uniformly from rest to 30 m/s in 10 seconds. Calculate its acceleration.',
        option_a: '2 m/s²', option_b: '3 m/s²', option_c: '5 m/s²', option_d: '300 m/s²',
        correct_option: 'B', explanation: 'Acceleration a = (v - u) / t = (30 - 0) / 10 = 3 m/s².'
      },
      {
        id: 'dq_2',
        topic: 'Velocity & Speed',
        question_text: 'What does the area under a velocity-time graph represent?',
        option_a: 'Acceleration', option_b: 'Displacement', option_c: 'Force', option_d: 'Speed',
        correct_option: 'B', explanation: 'The area under a v-t graph equals total displacement.'
      }
    ]
  },
  {
    id: 'g7_math_1',
    title: 'Grade 7 Mathematics - Algebraic Expressions',
    subject: 'Maths',
    grade: 7,
    topic: 'Algebraic Simplification',
    is_daily_quiz: false,
    questions: [
      {
        id: 'q7_1',
        topic: 'Algebraic Simplification',
        question_text: 'Simplify: 3x + 5x - 2x',
        option_a: '6x', option_b: '10x', option_c: '8x', option_d: '4x',
        correct_option: 'A', explanation: '(3 + 5 - 2)x = 6x.'
      }
    ]
  }
];

const INITIAL_SHOP_ORDERS = [
  {
    id: 'ord_101',
    student_name: 'Aminath Raya',
    student_index: 'STU-1002',
    grade: 10,
    item_name: 'LS Stainless Steel Water Bottle',
    cost: 450,
    claim_code: 'LS-GIFT-8821',
    status: 'Pending Pickup',
    date: '2026-10-14'
  },
  {
    id: 'ord_102',
    student_name: 'Hassan Zayan',
    student_index: 'STU-1045',
    grade: 9,
    item_name: 'LS Hardcover A5 Study Journal',
    cost: 250,
    claim_code: 'LS-GIFT-3312',
    status: 'Fulfilled / Given',
    date: '2026-10-12'
  }
];

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

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    const targetCode = (book.claim_code || 'LIB-2026').trim().toUpperCase();
    const enteredCode = passcodeInput.trim().toUpperCase();

    if (enteredCode !== targetCode) {
      setErrorMsg(`Invalid Code for "${book.title}". Please check the claim code shown for this book.`);
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
              <span className="text-[10px] text-slate-400 font-normal">(e.g. {book.claim_code})</span>
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={passcodeInput}
                onChange={(e) => setPasscodeInput(e.target.value)}
                placeholder={`e.g. ${book.claim_code || 'LIB-DHIV-01'}`}
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
            <ul className="text-xs text-rose-900 space-y-1">
              {stats.weakTopics.map((wt, i) => (
                <li key={i} className="bg-white/80 p-2 rounded-xl space-y-0.5 border border-rose-100">
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
}

// =========================================================================
// --- MAIN APP COMPONENT ---
// =========================================================================
export default function App() {
  // --- Auth & Profile State ---
  const [authView, setAuthView] = useState('landing');
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('student');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [indexNumber, setIndexNumber] = useState('');

  // --- Student Metrics ---
  const [studentGrade, setStudentGrade] = useState(7);
  const [coins, setCoins] = useState(250);
  const [xp, setXp] = useState(480);
  const [readingHours, setReadingHours] = useState(6.5);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [challengeAttempts, setChallengeAttempts] = useState([]);

  // --- Collections ---
  const [quizzes, setQuizzes] = useState(INITIAL_QUIZZES);
  const [books, setBooks] = useState(INITIAL_BOOKS);
  const [shopItems, setShopItems] = useState(INITIAL_SHOP_ITEMS);
  const [shopOrders, setShopOrders] = useState(INITIAL_SHOP_ORDERS);
  
  // Leaderboard state
  const [leaderboardUsers] = useState([
    { full_name: 'Aminath Raya', index_number: 'STU-1002', grade: 10, xp: 2850, streak: 12, coins: 890, reading_hours: 42.0 },
    { full_name: 'Hassan Zayan', index_number: 'STU-1045', grade: 9, xp: 2100, streak: 9, coins: 620, reading_hours: 31.5 },
    { full_name: 'Mariyam Yumna', index_number: 'STU-1088', grade: 8, xp: 1750, streak: 7, coins: 450, reading_hours: 24.0 },
  ]);

  // Derived Top Student (Star of the Month) directly from Leaderboard #1
  const starOfTheMonth = leaderboardUsers.reduce((top, current) => (current.xp > top.xp ? current : top), leaderboardUsers[0]);

  // Dynamic Quiz of the Day
  const quizOfTheDay = quizzes.find(q => q.is_daily_quiz) || quizzes[0];

  // --- Reader & Claim Modals ---
  const [selectedBook, setSelectedBook] = useState(null);
  const [claimingBook, setClaimingBook] = useState(null);
  const [viewingVoucher, setViewingVoucher] = useState(null);

  // --- Filter Controls ---
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [orderStatusFilter, setOrderStatusFilter] = useState('All');

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
  const [questionDetails, setQuestionDetails] = useState([]);

  // --- ADMIN CREATOR / JSON PASTE STATE ---
  const [adminTab, setAdminTab] = useState('shop_orders');
  const [quizJsonInput, setQuizJsonInput] = useState('');
  const [bookJsonInput, setBookJsonInput] = useState('');

  const [newShopName, setNewShopName] = useState('');
  const [newShopCost, setNewShopCost] = useState(200);
  const [newShopIcon, setNewShopIcon] = useState('🎒');
  const [newShopDesc, setNewShopDesc] = useState('');

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

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId) => {
    try {
      const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (data) {
        setAuthName(data.full_name || 'User');
        setIndexNumber(data.index_number || 'STU-1002');
        setRole(data.role || 'student');
        setStudentGrade(data.grade || 7);
        setCoins(data.coins ?? 250);
        setXp(data.xp ?? 480);
        setReadingHours(data.reading_hours ?? 6.5);
        if (data.challenge_attempts) setChallengeAttempts(data.challenge_attempts);
      }
    } catch (e) { console.warn("Profile sync warning:", e); }
  };

  // --- Navigation & Quiz Handlers ---
  const navigateToTab = (tabName) => {
    setActiveQuiz(null);
    setSelectedBook(null);
    setActiveTab(tabName);
  };

  const handleStartDailyQuiz = () => {
    if (!quizOfTheDay) return alert("No daily quiz available!");
    if (!user) {
      setAuthView('login');
    } else {
      startQuiz(quizOfTheDay, 'challenge');
    }
  };

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
    setQuestionDetails([]);
  };

  const handleAnswerSubmit = (option) => {
    if (selectedOption !== null && showExplanation) return;
    const currentQ = activeQuiz.questions[currentQuestionIdx];
    const isCorrect = option === currentQ.correct_option;
    setSelectedOption(option);
    setShowExplanation(true);

    const detailObj = {
      question_id: currentQ.id || `q_${currentQuestionIdx}`,
      topic: currentQ.topic || activeQuiz.topic || 'General Concept',
      question_text: currentQ.question_text,
      is_correct: isCorrect,
      selected_option: option,
      correct_option: currentQ.correct_option,
      explanation: currentQ.explanation || ''
    };

    setQuestionDetails(prev => [...prev, detailObj]);

    if (isCorrect) {
      playSound('correct');
      setScore(s => s + 1);
    } else {
      playSound('wrong');
      if (quizMode === 'challenge') {
        const remaining = hearts - 1;
        setHearts(remaining);
      }
    }
  };

  const nextQuestion = () => {
    setSelectedOption(null);
    setShowExplanation(false);
    setTimer(getQuizTimeLimit(activeQuiz));

    if (currentQuestionIdx + 1 < activeQuiz.questions.length) {
      setCurrentQuestionIdx(idx => idx + 1);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    setQuizFinished(true);
    playSound('coin');
    confetti({ particleCount: 120, spread: 80 });

    const multiplier = activeQuiz.is_daily_quiz ? 2 : 1;
    const coinsEarned = score * 15 * multiplier;
    const xpEarned = score * 30 * multiplier;
    setCoins(c => c + coinsEarned);
    setXp(x => x + xpEarned);

    // Track attempt in local history for diagnostics
    const newAttempt = {
      id: `att_${Date.now()}`,
      quiz_id: activeQuiz.id,
      title: activeQuiz.title,
      subject: activeQuiz.subject,
      score,
      total: activeQuiz.questions.length,
      timeSpentSeconds: activeQuiz.questions.length * 25,
      date: new Date().toISOString(),
      questionDetails
    };

    setChallengeAttempts(prev => [newAttempt, ...prev]);
  };

  // --- Redeem LS Shop Gift ---
  const handleRedeemReward = (item) => {
    if (coins < item.cost) return alert(`Insufficient EduCoins! You need ${item.cost - coins} more coins.`);
    
    if (confirm(`Redeem "${item.name}" for ${item.cost} EduCoins?`)) {
      const claimCode = `LS-GIFT-${Math.floor(1000 + Math.random() * 9000)}`;
      const newOrder = {
        id: `ord_${Date.now()}`,
        student_name: authName || 'Student User',
        student_index: indexNumber || 'STU-1001',
        grade: studentGrade,
        item_name: item.name,
        cost: item.cost,
        claim_code: claimCode,
        status: 'Pending Pickup',
        date: new Date().toISOString().split('T')[0]
      };

      setShopOrders([newOrder, ...shopOrders]);
      setCoins(c => c - item.cost);
      playSound('coin');
      confetti({ particleCount: 120, spread: 80 });

      if (item.is_physical) setViewingVoucher(newOrder);
      else alert(`🎉 Redeemed ${item.name}! Perk is now active on your account.`);
    }
  };

  // --- Verify E-Library Book Claim Code Callback ---
  const handleClaimVerified = () => {
    if (!claimingBook) return;
    const addedHours = claimingBook.reading_hours || 2.0;
    setReadingHours(r => r + addedHours);
    setCoins(c => c + 50);
    playSound('coin');
    confetti({ particleCount: 120, spread: 80 });
    alert(`✅ Claim Code Verified! Earned +${addedHours} Reading Hours and +50 EduCoins!`);
    setClaimingBook(null);
  };

  // --- Store Admin Order Fulfillment Action ---
  const handleFulfillOrder = (orderId) => {
    setShopOrders(shopOrders.map(o => o.id === orderId ? { ...o, status: 'Fulfilled / Given' } : o));
    alert("✅ Order marked as Fulfilled / Given to student!");
  };

  // --- JSON Paste Handlers for Quiz & Book Admin ---
  const handleImportQuizJSON = (e) => {
    e.preventDefault();
    try {
      const parsed = JSON.parse(quizJsonInput);
      const newArray = Array.isArray(parsed) ? parsed : [parsed];
      setQuizzes([...newArray, ...quizzes]);
      alert(`🎉 Successfully imported ${newArray.length} quiz(zes) into the Topic Vault!`);
      setQuizJsonInput('');
    } catch (err) {
      alert("Invalid JSON format! Please check your syntax.");
    }
  };

  const handleImportBookJSON = (e) => {
    e.preventDefault();
    try {
      const parsed = JSON.parse(bookJsonInput);
      const newArray = Array.isArray(parsed) ? parsed : [parsed];
      setBooks([...newArray, ...books]);
      alert(`📚 Successfully imported ${newArray.length} book(s) into the E-Library!`);
      setBookJsonInput('');
    } catch (err) {
      alert("Invalid JSON format! Please check your syntax.");
    }
  };

  const handleCreateShopItemSubmit = (e) => {
    e.preventDefault();
    if (!newShopName.trim()) return alert('Please enter item name.');

    const newItem = {
      id: `item_${Date.now()}`,
      name: newShopName,
      category: 'Physical Store',
      is_physical: true,
      cost: parseInt(newShopCost),
      icon: newShopIcon || '🎒',
      desc: newShopDesc || 'Available at physical gift store desk.'
    };

    setShopItems([newItem, ...shopItems]);
    alert('🎒 New Product added to LS Gift Shop!');
    setNewShopName('');
    setNewShopDesc('');
  };

  const currentRank = getStudentRank(xp);

  const filteredQuizzes = quizzes.filter(q => {
    return selectedSubject === 'All' || q.subject === selectedSubject;
  });

  const filteredOrders = shopOrders.filter(ord => {
    if (orderStatusFilter === 'Pending') return ord.status === 'Pending Pickup';
    if (orderStatusFilter === 'Fulfilled') return ord.status === 'Fulfilled / Given';
    return true;
  });

  // =========================================================================
  // --- LANDING PAGE & AUTHENTICATION VIEWS (LIGHT LHOHEE THEME) ---
  // =========================================================================
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col justify-between font-sans relative overflow-hidden">
        {/* Soft Ambient Glows */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-200/50 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-amber-200/40 rounded-full blur-3xl pointer-events-none"></div>

        {/* HEADER NAV */}
        <header className="max-w-7xl w-full mx-auto px-6 py-5 flex items-center justify-between z-10">
          <div onClick={() => setAuthView('landing')} className="flex items-center space-x-3 cursor-pointer">
            <div className="bg-gradient-to-tr from-indigo-600 via-purple-600 to-amber-500 p-2.5 rounded-2xl shadow-md">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-slate-900">
                Lhohee <span className="text-indigo-600">EduSpark IQ</span>
              </h1>
              <p className="text-[11px] text-slate-500 font-medium">Lhohee School Student Portal & LS Gift Store</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setAuthView('login')}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition ${authView === 'login' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-700 hover:bg-slate-200'}`}
            >
              Sign In
            </button>
            <button
              onClick={() => setAuthView('register')}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-5 py-2 rounded-xl text-xs font-black shadow-sm transition"
            >
              Register Now
            </button>
          </div>
        </header>

        {/* ELEGANT LANDING PAGE */}
        {authView === 'landing' && (
          <main className="max-w-7xl w-full mx-auto px-6 py-8 z-10 space-y-12 flex-1">
            {/* HERO BANNER */}
            <section className="text-center space-y-6 max-w-4xl mx-auto pt-4">
              <div className="inline-flex items-center space-x-2 bg-indigo-50 border border-indigo-200 px-4 py-1.5 rounded-full text-indigo-700 text-xs font-bold shadow-xs">
                <Store className="w-4 h-4 text-amber-500" />
                <span>LS Physical Gift Shop & Daily Quiz Active</span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-tight">
                Learn Topics. Score Higher.{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-amber-600">
                  Buy Real School Gifts.
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto font-medium">
                EduSpark IQ turns study time and reading into EduCoins. Redeem real school water bottles, study notebooks, and gel pen packs right at the LS School Gift Store!
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                <button
                  onClick={() => setAuthView('register')}
                  className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-black px-8 py-4 rounded-2xl text-sm shadow-lg transition flex items-center justify-center space-x-2"
                >
                  <span>Student Portal Registration</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={handleStartDailyQuiz}
                  className="w-full sm:w-auto bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold px-8 py-4 rounded-2xl text-sm transition flex items-center justify-center space-x-2 shadow-xs"
                >
                  <Flame className="w-4 h-4 text-amber-500" />
                  <span>Launch Quiz of the Day (2x Coins)</span>
                </button>
              </div>
            </section>

            {/* FEATURE SHOWCASE CARDS */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* CARD 1: DIRECT LINK TO QUIZ OF THE DAY */}
              <div className="bg-white border border-indigo-100 p-6 rounded-3xl space-y-4 shadow-sm relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-black bg-amber-400 text-slate-950 px-2.5 py-1 rounded-full uppercase">
                    2x Coins Bonus
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-indigo-600 uppercase block">Featured Challenge</span>
                  <h3 className="text-lg font-black text-slate-900">Quiz of the Day</h3>
                  <p className="text-xs text-slate-500">
                    Featured: {quizOfTheDay?.title || 'Daily Quiz'}. Score high to double your daily EduCoins balance!
                  </p>
                </div>

                <button
                  onClick={handleStartDailyQuiz}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center space-x-1.5 transition"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Launch Daily Quiz Now</span>
                </button>
              </div>

              {/* CARD 2: AUTOMATIC STAR OF THE MONTH */}
              <div className="bg-white border border-amber-200 p-6 rounded-3xl space-y-4 shadow-sm relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                    <Crown className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-1 rounded-full uppercase">
                    🏆 Star of the Month
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-amber-600 uppercase block">Leaderboard #1 Achiever</span>
                  <h3 className="text-lg font-black text-slate-900">{starOfTheMonth.full_name}</h3>
                  <p className="text-xs text-slate-500">
                    Grade {starOfTheMonth.grade} • ID: {starOfTheMonth.index_number} • {starOfTheMonth.reading_hours} Reading Hrs Logged
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs font-bold text-slate-700">
                  <span>Score: {starOfTheMonth.xp} XP</span>
                  <span className="text-amber-600 font-black">Rank #1 Legend 🔥</span>
                </div>
              </div>

              {/* CARD 3: LS GIFT SHOP */}
              <div className="bg-white border border-purple-100 p-6 rounded-3xl space-y-4 shadow-sm relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full uppercase">
                    Physical Rewards
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-purple-600 uppercase block">LS Gift Store</span>
                  <h3 className="text-lg font-black text-slate-900">Real Rewards Store</h3>
                  <p className="text-xs text-slate-500">Redeem school water bottles, journals, and pens with your EduCoins!</p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs font-bold text-slate-700">
                  <span>In-School Desk Pickup</span>
                  <span className="text-purple-600 font-black">In-Stock 🎒</span>
                </div>
              </div>
            </section>

            {/* LEADERBOARD PREVIEW SECTION */}
            <section className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-lg font-black text-slate-900">Academic Leaderboard</h3>
                  <p className="text-xs text-slate-500">Top scoring students at Lhohee School</p>
                </div>
                <Trophy className="w-6 h-6 text-yellow-500" />
              </div>

              <div className="divide-y divide-slate-100">
                {leaderboardUsers.map((s, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-base font-bold w-6">{idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}</span>
                      <div>
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900">{s.full_name}</h4>
                        <span className="text-[11px] text-slate-500 font-mono">ID: {s.index_number} • Grade {s.grade}</span>
                      </div>
                    </div>
                    <span className="text-xs sm:text-sm font-black text-indigo-600">{s.xp} XP</span>
                  </div>
                ))}
              </div>
            </section>

            {/* EDUCATIONAL PARTNERS & SPONSORS */}
            <section className="bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-6 shadow-xs">
              <div className="space-y-1 max-w-md mx-auto">
                <span className="text-[11px] font-bold uppercase tracking-widest text-indigo-600 block">Our Network</span>
                <h3 className="text-xl font-black text-slate-900">Educational Partners & Sponsors</h3>
                <p className="text-xs text-slate-500">Supported by curriculum bodies and school reward sponsors.</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 pt-2">
                {EDUCATIONAL_PARTNERS.map((partner, idx) => (
                  <div key={idx} className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2 hover:border-indigo-300 transition">
                    <span className="text-3xl block">{partner.logo}</span>
                    <h4 className="font-bold text-xs text-slate-800 leading-tight">{partner.name}</h4>
                    <span className="text-[9px] text-slate-500 block">{partner.category}</span>
                  </div>
                ))}
              </div>
            </section>
          </main>
        )}

        {/* LOGIN MODAL */}
        {authView === 'login' && (
          <main className="max-w-md w-full mx-auto px-6 py-12 z-10 flex-1 flex flex-col justify-center">
            <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-xl space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-black text-slate-900">Welcome Back</h2>
                <p className="text-xs text-slate-500">Sign in to Lhohee EduSpark IQ</p>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); setUser({ id: 'u1' }); setAuthView('landing'); }} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Email Address</label>
                  <input
                    type="email"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="student@school.edu"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Password</label>
                  <input
                    type="password"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900"
                    required
                  />
                </div>

                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3 rounded-xl text-xs transition shadow-md">
                  Sign In
                </button>
              </form>

              <div className="text-center pt-2 border-t border-slate-100">
                <p className="text-xs text-slate-500">
                  Need an account?{' '}
                  <button onClick={() => setAuthView('register')} className="text-indigo-600 font-bold hover:underline">
                    Register Here
                  </button>
                </p>
              </div>
            </div>
          </main>
        )}

        {/* REGISTER MODAL */}
        {authView === 'register' && (
          <main className="max-w-md w-full mx-auto px-6 py-8 z-10 flex-1 flex flex-col justify-center">
            <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-xl space-y-5">
              <div className="text-center space-y-1">
                <h2 className="text-2xl font-black text-slate-900">Student & Teacher Registration</h2>
                <p className="text-xs text-slate-500">Create your EduSpark account</p>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); setUser({ id: 'u1' }); }} className="space-y-3.5">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Account Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole('student')}
                      className={`py-2 text-xs font-bold rounded-xl border transition ${role === 'student' ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
                    >
                      🎓 Student
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('teacher')}
                      className={`py-2 text-xs font-bold rounded-xl border transition ${role === 'teacher' ? 'bg-purple-600 border-purple-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
                    >
                      👨‍🏫 Teacher
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Full Name</label>
                  <input
                    type="text"
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                    required
                  />
                </div>

                {role === 'student' && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Grade Level</label>
                      <select
                        value={studentGrade}
                        onChange={(e) => setStudentGrade(parseInt(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(g => (
                          <option key={g} value={g}>Grade {g}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Index Number</label>
                      <input
                        type="text"
                        value={indexNumber}
                        onChange={(e) => setIndexNumber(e.target.value)}
                        placeholder="STU-1002"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                        required
                      />
                    </div>
                  </div>
                )}

                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-2.5 rounded-xl text-xs transition shadow-md mt-2">
                  Complete Registration
                </button>
              </form>

              <div className="text-center pt-2 border-t border-slate-100">
                <p className="text-xs text-slate-500">
                  Already registered?{' '}
                  <button onClick={() => setAuthView('login')} className="text-indigo-600 font-bold hover:underline">
                    Sign In
                  </button>
                </p>
              </div>
            </div>
          </main>
        )}

        <footer className="py-4 text-center text-xs text-slate-500 border-t border-slate-200">
          Lhohee EduSpark IQ © 2026 • Lhohee School Student Portal & LS Gift Store
        </footer>
      </div>
    );
  }

  // =========================================================================
  // --- AUTHENTICATED PORTAL APP INTERFACE ---
  // =========================================================================
  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans">
      {/* HEADER NAV BAR */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center justify-between w-full sm:w-auto">
            <div onClick={() => navigateToTab('dashboard')} className="flex items-center space-x-3 cursor-pointer">
              <div className="bg-gradient-to-tr from-indigo-600 via-purple-600 to-amber-500 p-2 rounded-xl shadow-md">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-black tracking-tight text-slate-900">
                  Lhohee <span className="text-indigo-600">EduSpark IQ</span>
                </h1>
                <p className="text-[11px] text-slate-500 font-medium">LS Student Portal & LS Gift Store</p>
              </div>
            </div>

            <button onClick={() => setUser(null)} className="sm:hidden p-2 text-slate-400 hover:text-slate-700">
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 sm:gap-3 w-full sm:w-auto">
            {/* DIRECT QUIZ OF THE DAY HEADER LINK */}
            <button
              onClick={handleStartDailyQuiz}
              className="bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 px-3 py-1.5 rounded-full text-xs font-bold flex items-center space-x-1 transition"
            >
              <Flame className="w-3.5 h-3.5 text-amber-600" />
              <span>Quiz of the Day</span>
            </button>

            <div className="flex items-center space-x-2.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full text-xs font-bold text-slate-700">
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-black border ${currentRank.bg} ${currentRank.text}`}>
                {role === 'teacher' ? '👨‍🏫 Teacher' : currentRank.title}
              </span>
              <div className="flex items-center space-x-1 text-emerald-700">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                <span>{readingHours} Hrs</span>
              </div>
              <div className="flex items-center space-x-1 text-amber-600">
                <Coins className="w-3.5 h-3.5 text-amber-500" />
                <span>{coins} Coins</span>
              </div>
            </div>

            <button onClick={() => setUser(null)} className="hidden sm:block p-2 text-slate-400 hover:text-slate-700 rounded-lg">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dynamic Navigation Bar */}
        <div className="max-w-7xl mx-auto px-4 flex items-center space-x-1 sm:space-x-2 overflow-x-auto text-xs border-t border-slate-100 py-1.5 scrollbar-none">
          <button
            onClick={() => navigateToTab('dashboard')}
            className={`px-3.5 py-1.5 font-bold flex items-center space-x-1.5 rounded-xl transition whitespace-nowrap ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <BookOpen className="w-3.5 h-3.5" /> <span>Topic Vault</span>
          </button>

          <button
            onClick={() => navigateToTab('library')}
            className={`px-3.5 py-1.5 font-bold flex items-center space-x-1.5 rounded-xl transition whitespace-nowrap ${activeTab === 'library' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <Library className="w-3.5 h-3.5" /> <span>E-Library</span>
          </button>

          <button
            onClick={() => navigateToTab('shop')}
            className={`px-3.5 py-1.5 font-bold flex items-center space-x-1.5 rounded-xl transition whitespace-nowrap ${activeTab === 'shop' ? 'bg-amber-500 text-slate-950 font-black shadow-xs' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <Store className="w-3.5 h-3.5" /> <span>🎒 LS Gift Shop</span>
          </button>

          <button
            onClick={() => navigateToTab('leaderboard')}
            className={`px-3.5 py-1.5 font-bold flex items-center space-x-1.5 rounded-xl transition whitespace-nowrap ${activeTab === 'leaderboard' ? 'bg-yellow-500 text-slate-950 font-bold shadow-xs' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <Trophy className="w-3.5 h-3.5" /> <span>Leaderboard</span>
          </button>

          {/* DEDICATED STORE & ADMIN CONTROL TABS */}
          {(role === 'teacher' || role === 'admin') && (
            <>
              <div className="h-4 w-px bg-slate-200 mx-1"></div>
              
              <button
                onClick={() => { navigateToTab('admin'); setAdminTab('shop_orders'); }}
                className={`px-3.5 py-1.5 font-bold flex items-center space-x-1.5 rounded-xl transition whitespace-nowrap ${activeTab === 'admin' && (adminTab === 'shop_orders' || adminTab === 'shop_items') ? 'bg-amber-600 text-white shadow-xs' : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'}`}
              >
                <PackageCheck className="w-3.5 h-3.5 text-amber-600" /> <span>🛒 LS Shop Admin</span>
              </button>

              <button
                onClick={() => { navigateToTab('admin'); setAdminTab('quiz_maker'); }}
                className={`px-3.5 py-1.5 font-bold flex items-center space-x-1.5 rounded-xl transition whitespace-nowrap ${activeTab === 'admin' && adminTab === 'quiz_maker' ? 'bg-purple-600 text-white shadow-xs' : 'bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100'}`}
              >
                <PlusCircle className="w-3.5 h-3.5 text-purple-600" /> <span>📝 Quiz Admin (JSON)</span>
              </button>

              <button
                onClick={() => { navigateToTab('admin'); setAdminTab('book_maker'); }}
                className={`px-3.5 py-1.5 font-bold flex items-center space-x-1.5 rounded-xl transition whitespace-nowrap ${activeTab === 'admin' && adminTab === 'book_maker' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'}`}
              >
                <Book className="w-3.5 h-3.5 text-emerald-600" /> <span>📚 Library Admin (JSON)</span>
              </button>
            </>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">

        {/* TAB 1: TOPIC PRACTICE VAULT & DIAGNOSTICS */}
        {activeTab === 'dashboard' && !activeQuiz && (
          <div className="space-y-6">
            {/* FEATURED BANNER */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-3xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 px-2.5 py-1 rounded-full">
                  Featured Challenge
                </span>
                <h2 className="text-2xl font-black mt-2">Quiz of the Day</h2>
                <p className="text-xs text-indigo-100 mt-1">
                  Topic: {quizOfTheDay?.title || 'Daily Quiz'}. Score high to earn double EduCoins!
                </p>
              </div>

              <button
                onClick={handleStartDailyQuiz}
                className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-black px-6 py-3 rounded-2xl text-xs flex items-center space-x-2 transition shadow-md"
              >
                <Flame className="w-4 h-4 fill-slate-950" />
                <span>Launch Quiz of the Day (2x Coins)</span>
              </button>
            </div>

            {/* SYLLABUS TOPIC DIAGNOSTICS FOR CURRENT SUBJECT */}
            {selectedSubject !== 'All' && (
              <SubjectAnalyticsCard subject={selectedSubject} attempts={challengeAttempts} />
            )}

            {/* Subject Filters */}
            <div className="flex items-center space-x-2 overflow-x-auto scrollbar-none py-1 w-full">
              <button
                onClick={() => setSelectedSubject('All')}
                className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap ${selectedSubject === 'All' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'}`}
              >
                All Subjects
              </button>
              {ALL_SUBJECTS.map((subj) => (
                <button
                  key={subj}
                  onClick={() => setSelectedSubject(subj)}
                  className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap ${selectedSubject === subj ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                >
                  {subj}
                </button>
              ))}
            </div>

            {/* Quiz Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredQuizzes.map((quiz) => (
                <div key={quiz.id} className="bg-white border border-slate-200 rounded-3xl p-5 flex flex-col justify-between shadow-xs space-y-3 hover:border-indigo-300 transition">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg font-bold">
                        {quiz.subject}
                      </span>
                      {quiz.is_daily_quiz && (
                        <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full font-bold">
                          🔥 Daily Quiz
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-slate-900">{quiz.title}</h3>

                    <div className="mt-2 inline-flex items-center space-x-1 bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg text-[11px] font-bold">
                      <Tag className="w-3 h-3 text-indigo-600" />
                      <span>Topic: {quiz.topic}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100">
                    <button onClick={() => startQuiz(quiz, 'practice')} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 py-2 rounded-xl text-xs font-bold transition">
                      Practice
                    </button>
                    <button onClick={() => startQuiz(quiz, 'challenge')} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-xl text-xs font-bold transition shadow-xs">
                      Challenge
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: E-LIBRARY */}
        {activeTab === 'library' && !selectedBook && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-black text-slate-900">Lhohee School E-Library</h3>
              <p className="text-xs text-slate-500">Read books, verify claim codes, and log study hours to earn EduCoins.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {books.map((b) => (
                <div key={b.id} className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs flex flex-col justify-between space-y-4">
                  <div className="flex space-x-4">
                    <img src={b.cover_url} alt={b.title} className="w-20 h-28 object-cover rounded-xl border border-slate-200 shadow-xs" />
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md">{b.subject}</span>
                      <h4 className="font-bold text-slate-900 text-sm leading-snug">{b.title}</h4>
                      <p className="text-xs text-slate-500">{b.author}</p>
                      <p className="text-[11px] text-emerald-700 font-bold mt-1">+{b.reading_hours} Reading Hrs Credit</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2">{b.summary}</p>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setSelectedBook(b)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2 rounded-xl text-xs transition"
                    >
                      Read Book
                    </button>

                    <button
                      onClick={() => setClaimingBook(b)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-xl text-xs transition shadow-xs"
                    >
                      Claim Credit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* READ BOOK READER OVERLAY */}
        {selectedBook && (
          <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-lg space-y-4 max-w-3xl mx-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <span className="text-xs font-bold text-emerald-700">{selectedBook.subject}</span>
                <h2 className="text-xl font-black text-slate-900">{selectedBook.title}</h2>
              </div>
              <button onClick={() => setSelectedBook(null)} className="p-2 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div
              dir={isRTLSubject(selectedBook.subject) ? 'rtl' : 'ltr'}
              className="bg-slate-50 p-6 rounded-2xl border border-slate-200 min-h-[220px] whitespace-pre-wrap text-sm leading-relaxed text-slate-800"
            >
              {selectedBook.pages[0]}
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => { const b = selectedBook; setSelectedBook(null); setClaimingBook(b); }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-6 py-2.5 rounded-xl text-xs transition shadow-xs"
              >
                Claim Reading Hours Credit
              </button>
            </div>
          </div>
        )}

        {/* CLAIM READING HOURS MODAL */}
        {claimingBook && (
          <ClaimReadingHoursModal
            book={claimingBook}
            onVerified={handleClaimVerified}
            onClose={() => setClaimingBook(null)}
          />
        )}

        {/* TAB 3: LS PHYSICAL GIFT STORE */}
        {activeTab === 'shop' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 p-6 sm:p-8 rounded-3xl shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <Store className="w-7 h-7 text-slate-950" />
                  <h2 className="text-2xl sm:text-3xl font-black">LS Physical Gift Store</h2>
                </div>
                <p className="text-xs text-slate-900 font-medium mt-1">
                  Redeem real physical school items with your earned EduCoins balance!
                </p>
              </div>

              <div className="bg-slate-950 text-amber-400 px-5 py-3 rounded-2xl font-black text-base flex items-center space-x-2 shadow-md">
                <Coins className="w-5 h-5 text-amber-400" />
                <span>{coins} EduCoins Available</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {shopItems.map((item) => (
                <div key={item.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between hover:border-amber-400 transition">
                  <div className="space-y-3">
                    <span className="text-4xl p-3 bg-amber-50 rounded-2xl border border-amber-100 inline-block">{item.icon}</span>
                    <h3 className="font-black text-slate-900 text-base">{item.name}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                  </div>

                  <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="font-black text-amber-600 text-base">{item.cost} Coins</span>
                    <button
                      onClick={() => handleRedeemReward(item)}
                      disabled={coins < item.cost}
                      className={`px-5 py-2.5 rounded-xl text-xs font-bold transition ${coins >= item.cost ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-xs' : 'bg-slate-100 text-slate-400'}`}
                    >
                      {item.is_physical ? 'Buy Physical Gift' : 'Redeem Perk'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: LEADERBOARD */}
        {activeTab === 'leaderboard' && (
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="bg-white border border-slate-200 p-6 rounded-3xl text-center space-y-2 shadow-xs">
              <Trophy className="w-10 h-10 text-yellow-500 mx-auto" />
              <h2 className="text-2xl font-black text-slate-900">Lhohee School Leaderboard</h2>
              <p className="text-xs text-slate-500">Top scoring students this academic term</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl divide-y divide-slate-100 shadow-xs">
              {leaderboardUsers.map((s, idx) => (
                <div key={idx} className="p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-base font-bold w-6">{idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}</span>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{s.full_name}</h4>
                      <span className="text-xs text-slate-500 font-mono">ID: {s.index_number} • Grade {s.grade}</span>
                    </div>
                  </div>
                  <span className="text-sm font-black text-indigo-600">{s.xp} XP</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: TEACHER & ADMIN PANEL */}
        {activeTab === 'admin' && (role === 'teacher' || role === 'admin') && (
          <div className="max-w-5xl mx-auto space-y-6">
            {/* SUB-NAVIGATION CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <button
                onClick={() => setAdminTab('shop_orders')}
                className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition ${adminTab === 'shop_orders' ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
              >
                <PackageCheck className="w-6 h-6 mb-2" />
                <div>
                  <h4 className="font-black text-xs">Shop Orders Panel</h4>
                  <p className="text-[10px] opacity-80">{shopOrders.length} Purchases</p>
                </div>
              </button>

              <button
                onClick={() => setAdminTab('shop_items')}
                className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition ${adminTab === 'shop_items' ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
              >
                <Store className="w-6 h-6 mb-2" />
                <div>
                  <h4 className="font-black text-xs">Manage Products</h4>
                  <p className="text-[10px] opacity-80">{shopItems.length} Products</p>
                </div>
              </button>

              <button
                onClick={() => setAdminTab('quiz_maker')}
                className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition ${adminTab === 'quiz_maker' ? 'bg-purple-600 text-white border-purple-600 shadow-sm' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
              >
                <Code className="w-6 h-6 mb-2" />
                <div>
                  <h4 className="font-black text-xs">Quiz Admin (JSON)</h4>
                  <p className="text-[10px] opacity-80">Import or Paste Quizzes</p>
                </div>
              </button>

              <button
                onClick={() => setAdminTab('book_maker')}
                className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition ${adminTab === 'book_maker' ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
              >
                <Book className="w-6 h-6 mb-2" />
                <div>
                  <h4 className="font-black text-xs">Library Admin (JSON)</h4>
                  <p className="text-[10px] opacity-80">Import Books & Codes</p>
                </div>
              </button>
            </div>

            {/* LIVE TEACHER DIAGNOSTIC TRACKER COMPONENT */}
            <TeacherStudentTracker subjects={ALL_SUBJECTS} />

            {/* VIEW 1: DEDICATED LS SHOP ORDER FULFILLMENT */}
            {adminTab === 'shop_orders' && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-4">
                  <div>
                    <h3 className="text-lg font-black text-slate-900">LS Shop Student Order Fulfillment</h3>
                    <p className="text-xs text-slate-500">Teachers & Store Keepers: verify student claim codes to record physical gifts as given.</p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button onClick={() => setOrderStatusFilter('All')} className={`px-3 py-1.5 rounded-xl text-xs font-bold ${orderStatusFilter === 'All' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}>All</button>
                    <button onClick={() => setOrderStatusFilter('Pending')} className={`px-3 py-1.5 rounded-xl text-xs font-bold ${orderStatusFilter === 'Pending' ? 'bg-amber-500 text-slate-950' : 'bg-slate-100 text-slate-600'}`}>Pending Pickup</button>
                    <button onClick={() => setOrderStatusFilter('Fulfilled')} className={`px-3 py-1.5 rounded-xl text-xs font-bold ${orderStatusFilter === 'Fulfilled' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>Fulfilled</button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b text-slate-400 uppercase text-[10px] font-bold">
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Student Name</th>
                        <th className="py-2.5 px-3">Index #</th>
                        <th className="py-2.5 px-3">Item Purchased</th>
                        <th className="py-2.5 px-3">Claim Voucher Code</th>
                        <th className="py-2.5 px-3 text-center">Status</th>
                        <th className="py-2.5 px-3 text-right">Shop Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredOrders.map((ord) => (
                        <tr key={ord.id} className="hover:bg-slate-50 transition">
                          <td className="py-3 px-3 font-mono text-slate-500">{ord.date}</td>
                          <td className="py-3 px-3 font-bold text-slate-900">{ord.student_name}</td>
                          <td className="py-3 px-3 font-mono text-slate-600">{ord.student_index} (Grade {ord.grade})</td>
                          <td className="py-3 px-3 font-bold text-amber-700">{ord.item_name}</td>
                          <td className="py-3 px-3 font-mono font-bold text-purple-700">{ord.claim_code}</td>
                          <td className="py-3 px-3 text-center">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                              ord.status === 'Fulfilled / Given' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                            }`}>
                              {ord.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            {ord.status !== 'Fulfilled / Given' ? (
                              <button
                                onClick={() => handleFulfillOrder(ord.id)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl text-[11px] transition shadow-xs"
                              >
                                Mark as Given
                              </button>
                            ) : (
                              <span className="text-[11px] text-slate-400 font-bold">✓ Complete</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* VIEW 2: ADD STORE PRODUCT */}
            {adminTab === 'shop_items' && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
                <h3 className="text-lg font-black text-slate-900">Add New Physical Product to LS Gift Store</h3>
                <form onSubmit={handleCreateShopItemSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Product Name</label>
                      <input
                        type="text"
                        value={newShopName}
                        onChange={(e) => setNewShopName(e.target.value)}
                        placeholder="LS Branded Notebook"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">EduCoins Price</label>
                      <input
                        type="number"
                        value={newShopCost}
                        onChange={(e) => setNewShopCost(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-amber-600"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Icon Emoji</label>
                      <input
                        type="text"
                        value={newShopIcon}
                        onChange={(e) => setNewShopIcon(e.target.value)}
                        placeholder="🎒"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Description</label>
                    <textarea
                      value={newShopDesc}
                      onChange={(e) => setNewShopDesc(e.target.value)}
                      placeholder="Product details for store pick-up..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs h-20"
                    />
                  </div>

                  <button type="submit" className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black px-6 py-2.5 rounded-xl text-xs transition shadow-sm">
                    Publish Product
                  </button>
                </form>
              </div>
            )}

            {/* VIEW 3: QUIZ ADMIN (JSON PASTE & CODE MANAGER) */}
            {adminTab === 'quiz_maker' && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-5">
                <div className="border-b pb-3">
                  <h3 className="text-lg font-black text-slate-900">Quiz JSON Copy-Paste & Manager</h3>
                  <p className="text-xs text-slate-500">Paste raw JSON quiz sets directly or edit topic questions.</p>
                </div>

                <form onSubmit={handleImportQuizJSON} className="space-y-3">
                  <label className="text-xs font-bold text-slate-700 block">Copy-Paste Quiz JSON Array</label>
                  <textarea
                    value={quizJsonInput}
                    onChange={(e) => setQuizJsonInput(e.target.value)}
                    placeholder={`[
  {
    "id": "quiz_physics_01",
    "title": "Grade 10 Kinematics",
    "subject": "Physics",
    "grade": 10,
    "topic": "Kinematics & Motion",
    "questions": [
      {
        "question_text": "What is acceleration?",
        "option_a": "Rate of change of velocity",
        "option_b": "Speed multiplied by time",
        "correct_option": "A",
        "explanation": "Acceleration is a = dv/dt."
      }
    ]
  }
]`}
                    className="w-full font-mono text-xs bg-slate-900 text-emerald-400 p-4 rounded-2xl border border-slate-800 h-60"
                    required
                  />

                  <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-black px-6 py-2.5 rounded-xl text-xs transition shadow-md">
                    Import Quiz JSON to Topic Vault
                  </button>
                </form>
              </div>
            )}

            {/* VIEW 4: LIBRARY ADMIN (JSON PASTE & CODE MANAGER) */}
            {adminTab === 'book_maker' && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
                <div className="border-b pb-3">
                  <h3 className="text-lg font-black text-slate-900">E-Library Book JSON Copy-Paste</h3>
                  <p className="text-xs text-slate-500">Paste book JSON structures with claim codes to credit reading hours.</p>
                </div>

                <form onSubmit={handleImportBookJSON} className="space-y-3">
                  <label className="text-xs font-bold text-slate-700 block">Copy-Paste Book JSON Array</label>
                  <textarea
                    value={bookJsonInput}
                    onChange={(e) => setBookJsonInput(e.target.value)}
                    placeholder={`[
  {
    "id": "book_dhivehi_02",
    "title": "ދިވެހި ވާހަކަތައް",
    "subject": "Dhivehi",
    "author": "އަލްއުސްތާޛު ޖަމީލު",
    "reading_hours": 3.0,
    "claim_code": "LIB-DHIV-02",
    "pages": ["ފުރަތަމަ ޞަފްޙާ..."]
  }
]`}
                    className="w-full font-mono text-xs bg-slate-900 text-emerald-400 p-4 rounded-2xl border border-slate-800 h-60"
                    required
                  />

                  <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-6 py-2.5 rounded-xl text-xs transition shadow-md">
                    Import Book JSON to E-Library
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* ACTIVE QUIZ OVERLAY */}
        {activeQuiz && (
          <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-3xl p-6 shadow-xl space-y-6">
            {!quizFinished ? (
              <>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-xs font-bold text-slate-500">Question {currentQuestionIdx + 1} of {activeQuiz.questions.length}</span>
                  <span className="text-xs font-black text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg">Timer: {timer}s</span>
                </div>

                <h2
                  dir={isRTLSubject(activeQuiz.subject) ? 'rtl' : 'ltr'}
                  className="text-lg font-extrabold text-slate-900 leading-relaxed"
                >
                  {activeQuiz.questions[currentQuestionIdx].question_text}
                </h2>

                <div className="space-y-2.5">
                  {['A', 'B', 'C', 'D'].map((optKey) => {
                    const optionText = activeQuiz.questions[currentQuestionIdx][`option_${optKey.toLowerCase()}`];
                    const isSelected = selectedOption === optKey;
                    const isCorrect = optKey === activeQuiz.questions[currentQuestionIdx].correct_option;

                    let btnStyle = 'bg-slate-50 border-slate-200 text-slate-800';
                    if (showExplanation) {
                      if (isCorrect) btnStyle = 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold';
                      else if (isSelected) btnStyle = 'bg-red-50 border-red-400 text-red-900';
                    }

                    return (
                      <button
                        key={optKey}
                        onClick={() => handleAnswerSubmit(optKey)}
                        disabled={showExplanation}
                        dir={isRTLSubject(activeQuiz.subject) ? 'rtl' : 'ltr'}
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
                  <button onClick={nextQuestion} className="w-full bg-indigo-600 text-white font-bold py-3 rounded-2xl transition shadow-md">
                    Next Question
                  </button>
                )}
              </>
            ) : (
              <div className="text-center py-6 space-y-4">
                <Trophy className="w-12 h-12 text-amber-500 mx-auto" />
                <h2 className="text-2xl font-black text-slate-900">Quiz Completed!</h2>
                <p className="text-xs text-slate-600">Great job testing your knowledge!</p>
                <button onClick={() => setActiveQuiz(null)} className="bg-indigo-600 text-white font-bold px-8 py-3 rounded-2xl text-xs transition shadow-md">
                  Return to Portal
                </button>
              </div>
            )}
          </div>
        )}

        {/* CLAIM VOUCHER MODAL */}
        {viewingVoucher && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white border border-slate-200 p-6 rounded-3xl max-w-sm w-full space-y-4 text-center shadow-2xl">
              <div className="p-3 bg-amber-100 text-amber-800 rounded-full w-12 h-12 mx-auto flex items-center justify-center">
                <Gift className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900">Physical Pickup Voucher</h3>
              <p className="text-xs text-slate-500">Show this voucher code at the school shop desk to collect your item.</p>

              <div className="bg-slate-100 p-4 rounded-2xl border border-dashed border-slate-300">
                <span className="text-xs font-bold text-slate-500 block">CLAIM VOUCHER CODE</span>
                <span className="text-2xl font-black text-purple-700 font-mono tracking-wider">{viewingVoucher.claim_code}</span>
              </div>

              <div className="text-left text-xs space-y-1 text-slate-600 bg-slate-50 p-3 rounded-xl">
                <p><strong>Item:</strong> {viewingVoucher.item_name}</p>
                <p><strong>Student:</strong> {viewingVoucher.student_name}</p>
                <p><strong>Index Number:</strong> {viewingVoucher.student_index}</p>
              </div>

              <button onClick={() => setViewingVoucher(null)} className="w-full bg-slate-900 text-white font-bold py-2.5 rounded-xl text-xs">
                Close Voucher
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}