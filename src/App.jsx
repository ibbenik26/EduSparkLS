import React, { useState, useEffect, useRef } from 'react';
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
  AlertCircle, CheckCircle, Smile, UserCheck, UserX, Shield
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

const isRTLSubject = (subject) => {
  return subject === 'Dhivehi' || subject === 'Islam' || subject === 'ދިވެހި' || subject === 'އިސްލާމް';
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

// --- Initial Mock Data ---
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
    extract: 'ފުރަތަމަ ބާބު: ތާނަ އަކުރު... ދިވެހިބަހުން ލިޔުމަށް ބޭނުންކުރަނީ ތާނައަކުރެވެ.',
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
    extract: 'CHAPTER 1: THE LAWS OF MOTION — Physics is the fundamental science...',
    reading_hours: 4.0,
    claim_code: 'LIB-PHYS-101',
    pages: [
      "CHAPTER 1: THE LAWS OF MOTION\n\nPhysics is the fundamental science that seeks to understand how the universe behaves."
    ]
  }
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
  // --- Auth View & User State ---
  const [authView, setAuthView] = useState('landing');
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('student'); // 'student', 'teacher', 'shop_admin', 'super_admin'
  const [userStatus, setUserStatus] = useState('active'); // 'active', 'disabled'
  const [teacherSubject, setTeacherSubject] = useState('Physics');

  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [indexNumber, setIndexNumber] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // --- Student Metrics ---
  const [studentGrade, setStudentGrade] = useState(7);
  const [coins, setCoins] = useState(350);
  const [xp, setXp] = useState(420);
  const [totalEarned, setTotalEarned] = useState(600);
  const [totalSpent, setTotalSpent] = useState(250);
  const [readingHours, setReadingHours] = useState(5.5);
  const [quizzesCompleted, setQuizzesCompleted] = useState(0);
  const [booksRead, setBooksRead] = useState(0);

  // --- Separate Tracking Records ---
  const [onlineReadBookIds, setOnlineReadBookIds] = useState([]);
  const [physicalClaimedBookIds, setPhysicalClaimedBookIds] = useState([]);
  const [completedChallenges, setCompletedChallenges] = useState([]);

  // --- App Collections & State ---
  const [quizzes, setQuizzes] = useState(INITIAL_QUIZZES);
  const [books, setBooks] = useState(INITIAL_BOOKS);
  const [shopItems, setShopItems] = useState(INITIAL_SHOP_ITEMS);
  const [orders, setOrders] = useState([]);
  const [allProfiles, setAllProfiles] = useState([]);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // --- E-Reader & Auto Reading Timer ---
  const [selectedBook, setSelectedBook] = useState(null);
  const [bookPageIndex, setBookPageIndex] = useState(0);
  const [activeReadingSeconds, setActiveReadingSeconds] = useState(0);
  const [claimingBook, setClaimingBook] = useState(null);
  const [claimPasscode, setClaimPasscode] = useState('');

  // --- Quiz Runner State ---
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [quizMode, setQuizMode] = useState('practice');
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  // --- Shop Management Form ---
  const [shopForm, setShopForm] = useState({ name: '', category: 'School Supplies', cost: 200, stock: 10, is_real: true, icon: '🎒', desc: '' });
  const [editingShopItem, setEditingShopItem] = useState(null);

  // --- Teacher Quiz Creator Form ---
  const [quizForm, setQuizForm] = useState({ title: '', subject: 'Physics', grade: 7, is_past_paper: false, questionsJson: '' });

  // Navigation Helper
  const navigateToTab = (tabName) => {
    setActiveQuiz(null);
    setSelectedBook(null);
    setActiveTab(tabName);
  };

  // --- Supabase Profiles Sync ---
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
        setRole(data.role || 'student');
        setUserStatus(data.status || 'active');
        setTeacherSubject(data.teacher_subject || 'Physics');
        setStudentGrade(data.grade || 7);
        setCoins(data.coins ?? 350);
        setXp(data.xp ?? 420);
        setReadingHours(data.reading_hours ?? 5.5);
        setOnlineReadBookIds(data.online_read_book_ids || []);
        setPhysicalClaimedBookIds(data.physical_claimed_book_ids || []);
        setCompletedChallenges(data.completed_challenges || []);
      }
      if (data?.role === 'super_admin') {
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

  const updateUserRoleOrStatus = async (targetUserId, updates) => {
    try {
      await supabase.from('profiles').update(updates).eq('id', targetUserId);
      setAllProfiles(allProfiles.map(p => p.id === targetUserId ? { ...p, ...updates } : p));
      alert("✅ User account updated successfully!");
    } catch (e) {
      alert("Failed to update user: " + e.message);
    }
  };

  // --- Reading Auto-Timer Effect ---
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

  // --- Auth Handlers ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password: authPassword
      });
      if (error) throw error;

      // Check if user is blocked by Super Admin
      const { data: profile } = await supabase.from('profiles').select('status').eq('id', data.user.id).single();
      if (profile && profile.status === 'disabled') {
        await supabase.auth.signOut();
        alert("❌ Your account has been disabled by the Super Admin. Please contact school administration.");
        setUser(null);
        return;
      }
    } catch (err) {
      alert("Login Error: " + err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: authEmail,
        password: authPassword,
        options: {
          data: { full_name: authName, role: role, grade: studentGrade }
        }
      });
      if (error) throw error;

      if (data?.user) {
        await supabase.from('profiles').insert([{
          id: data.user.id,
          full_name: authName,
          index_number: role === 'student' ? indexNumber : `STAFF-${Math.floor(100 + Math.random() * 900)}`,
          role: role,
          status: 'active',
          teacher_subject: role === 'teacher' ? teacherSubject : null,
          grade: studentGrade,
          coins: 350,
          xp: 420,
          reading_hours: 0,
          online_read_book_ids: [],
          physical_claimed_book_ids: []
        }]);
      }
      alert(`✅ Registration successful as ${role.toUpperCase()}!`);
    } catch (err) {
      alert("Registration Error: " + err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  // --- E-Book Reader Finish (Auto Detected Time & Rewards) ---
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

    supabase.from('profiles').update({
      reading_hours: newReadingHours,
      coins: newCoins,
      xp: newXp,
      online_read_book_ids: newOnlineReads
    }).eq('id', user.id);

    alert(`🎉 Reading Session Logged!\n• Time Read: ${elapsedMinutes} mins (${hoursEarned} hrs)\n• Earned: +${coinsEarned} EduCoins & +${xpEarned} XP!`);
  };

  // --- Physical Library Claim Verification ---
  const handleClaimPhysicalBook = (e) => {
    e.preventDefault();
    if (!claimingBook) return;

    const targetCode = (claimingBook.claim_code || 'LIB-2026').trim().toUpperCase();
    if (claimPasscode.trim().toUpperCase() !== targetCode) {
      alert(`❌ Invalid Code for "${claimingBook.title}". Please ask your librarian for this book's claim code.`);
      return;
    }

    if (physicalClaimedBookIds.includes(claimingBook.id)) {
      alert("⚠️ You have already claimed the physical library copy of this book.");
      setClaimingBook(null);
      return;
    }

    const hours = parseFloat(claimingBook.reading_hours) || 2.0;
    const coinsGained = Math.round(hours * 15);
    const newHours = Math.round((readingHours + hours) * 10) / 10;
    const newCoins = coins + coinsGained;
    const newPhysicalReads = [...physicalClaimedBookIds, claimingBook.id];

    setReadingHours(newHours);
    setCoins(newCoins);
    setPhysicalClaimedBookIds(newPhysicalReads);
    setClaimingBook(null);
    setClaimPasscode('');

    playSound('coin');
    confetti({ particleCount: 100, spread: 70 });

    supabase.from('profiles').update({
      reading_hours: newHours,
      coins: newCoins,
      physical_claimed_book_ids: newPhysicalReads
    }).eq('id', user.id);

    alert(`🎉 Physical Library Book Verified!\n• Added +${hours} Reading Hours\n• Earned +${coinsGained} EduCoins!`);
  };

  // --- Quiz Engine ---
  const startQuiz = (quiz, mode) => {
    setActiveQuiz(quiz);
    setQuizMode(mode);
    setCurrentQuestionIdx(0);
    setSelectedOption(null);
    setShowExplanation(false);
    setScore(0);
    setQuizFinished(false);
  };

  const handleAnswerSubmit = (option) => {
    const currentQ = activeQuiz.questions[currentQuestionIdx];
    const isCorrect = option === currentQ.correct_option;
    setSelectedOption(option);
    setShowExplanation(true);
    if (isCorrect) {
      playSound('correct');
      setScore(s => s + 1);
    } else {
      playSound('wrong');
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
      setCoins(c => c + score * 15);
      setXp(x => x + score * 30);
    }
  };

  // --- Teacher Quiz Publishing (Restricted to assigned subject unless Super Admin) ---
  const handleTeacherCreateQuiz = (e) => {
    e.preventDefault();
    if (role === 'teacher' && quizForm.subject !== teacherSubject) {
      alert(`⚠️ You can only create quizzes for your assigned subject: ${teacherSubject}`);
      return;
    }

    try {
      const parsedQuestions = JSON.parse(quizForm.questionsJson);
      const newQuiz = {
        id: `quiz_${Date.now()}`,
        title: quizForm.title,
        subject: quizForm.subject,
        grade: parseInt(quizForm.grade),
        is_past_paper: quizForm.is_past_paper,
        questions: parsedQuestions
      };

      setQuizzes([newQuiz, ...quizzes]);
      setQuizForm({ title: '', subject: teacherSubject, grade: 7, is_past_paper: false, questionsJson: '' });
      alert("✅ New Quiz successfully created and published!");
    } catch (err) {
      alert("Invalid Questions JSON Format: " + err.message);
    }
  };

  // --- Shop Item Purchase ---
  const handlePurchaseItem = (item) => {
    if (coins < item.cost) {
      alert(`❌ You need ${item.cost - coins} more EduCoins to buy this item.`);
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
    alert(`🎉 Purchased! Claim Code: ${claimCode}`);
  };

  // =========================================================================
  // --- UNAUTHENTICATED / LANDING PAGE ---
  // =========================================================================
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between font-sans relative overflow-hidden">
        <header className="max-w-7xl w-full mx-auto px-6 py-6 flex items-center justify-between z-10">
          <div onClick={() => setAuthView('landing')} className="flex items-center space-x-3 cursor-pointer">
            <div className="bg-gradient-to-tr from-indigo-500 to-purple-600 p-2.5 rounded-2xl shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white">EduSpark <span className="text-indigo-400">IQ</span></h1>
              <p className="text-[10px] text-slate-400 font-mono">School Portal & E-Library</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button onClick={() => setAuthView('login')} className="px-5 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white">Sign In</button>
            <button onClick={() => setAuthView('register')} className="bg-white text-slate-900 px-5 py-2 rounded-xl text-xs font-bold shadow-md">Register</button>
          </div>
        </header>

        {authView === 'landing' && (
          <main className="max-w-5xl w-full mx-auto px-6 py-12 text-center space-y-8">
            <span className="bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold px-4 py-1.5 rounded-full inline-block">
              🎓 Complete Multi-Role Education Portal
            </span>
            <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight">
              Empowering Students, Teachers & Shop Admins
            </h1>
            <p className="text-slate-300 max-w-2xl mx-auto text-sm sm:text-base">
              Interactive O-Level practice, live online book reader with auto-time detection, teacher subject quiz studio, and kid's store management.
            </p>

            <div className="flex justify-center gap-4">
              <button onClick={() => setAuthView('register')} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-3 rounded-2xl text-xs shadow-lg">
                Create Account
              </button>
              <button onClick={() => setAuthView('login')} className="bg-slate-800 text-slate-200 font-bold px-8 py-3 rounded-2xl text-xs border border-slate-700">
                Sign In
              </button>
            </div>
          </main>
        )}

        {authView === 'login' && (
          <main className="max-w-md w-full mx-auto px-6 py-12">
            <div className="bg-slate-800 border border-slate-700 p-8 rounded-3xl shadow-2xl space-y-6">
              <h2 className="text-2xl font-black text-white text-center">Sign In</h2>
              <form onSubmit={handleLogin} className="space-y-4">
                <input type="email" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} placeholder="Email address" className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white" required />
                <input type="password" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} placeholder="Password" className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white" required />
                <button type="submit" disabled={authLoading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl text-xs">
                  {authLoading ? 'Signing In...' : 'Sign In'}
                </button>
              </form>
            </div>
          </main>
        )}

        {authView === 'register' && (
          <main className="max-w-md w-full mx-auto px-6 py-8">
            <div className="bg-slate-800 border border-slate-700 p-8 rounded-3xl shadow-2xl space-y-5">
              <h2 className="text-2xl font-black text-white text-center">Register Account</h2>
              <form onSubmit={handleRegister} className="space-y-3">
                <div className="grid grid-cols-2 gap-1.5">
                  <button type="button" onClick={() => setRole('student')} className={`py-2 text-[11px] font-bold rounded-xl border ${role === 'student' ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'}`}>🎓 Student</button>
                  <button type="button" onClick={() => setRole('teacher')} className={`py-2 text-[11px] font-bold rounded-xl border ${role === 'teacher' ? 'bg-purple-600 border-purple-600 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'}`}>👨‍🏫 Teacher</button>
                  <button type="button" onClick={() => setRole('shop_admin')} className={`py-2 text-[11px] font-bold rounded-xl border ${role === 'shop_admin' ? 'bg-amber-600 border-amber-600 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'}`}>🏬 Shop Admin</button>
                  <button type="button" onClick={() => setRole('super_admin')} className={`py-2 text-[11px] font-bold rounded-xl border ${role === 'super_admin' ? 'bg-rose-600 border-rose-600 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'}`}>👑 Super Admin</button>
                </div>

                <input type="text" value={authName} onChange={(e) => setAuthName(e.target.value)} placeholder="Full Name" className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white" required />
                <input type="email" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} placeholder="Email Address" className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white" required />
                <input type="password" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} placeholder="Password" className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white" required />

                {role === 'teacher' && (
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">Assigned Teaching Subject</label>
                    <select value={teacherSubject} onChange={(e) => setTeacherSubject(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white">
                      {ALL_SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                )}

                <button type="submit" disabled={authLoading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs mt-2">
                  Complete Registration
                </button>
              </form>
            </div>
          </main>
        )}

        <footer className="py-4 text-center text-xs text-slate-500 border-t border-slate-800">
          EduSpark IQ © 2026 • Multi-Role Access Control Enabled
        </footer>
      </div>
    );
  }

  // =========================================================================
  // --- AUTHENTICATED PORTAL ---
  // =========================================================================
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigateToTab('dashboard')}>
            <div className="bg-gradient-to-tr from-indigo-600 to-purple-600 p-2 rounded-xl shadow-md">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-900">EduSpark <span className="text-indigo-600">IQ</span></h1>
              <p className="text-[10px] text-slate-500 font-medium uppercase font-mono">Role: {role}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-xs font-bold">
            <div className="hidden sm:flex items-center space-x-2 bg-slate-100 px-3 py-1.5 rounded-full">
              <Clock className="w-3.5 h-3.5 text-teal-600" />
              <span>{readingHours} Read Hrs</span>
              <Coins className="w-3.5 h-3.5 text-amber-600 ml-2" />
              <span>{coins} Coins</span>
            </div>

            <button onClick={() => supabase.auth.signOut()} className="p-2 text-slate-400 hover:text-slate-700">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dynamic Navigation Based on Role */}
        <div className="max-w-7xl mx-auto px-4 flex items-center space-x-2 overflow-x-auto text-xs border-t border-slate-100 py-2 scrollbar-none">
          <button onClick={() => navigateToTab('dashboard')} className={`px-3.5 py-1.5 font-bold rounded-xl transition ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
            📖 Practice Vault
          </button>

          <button onClick={() => navigateToTab('library')} className={`px-3.5 py-1.5 font-bold rounded-xl transition ${activeTab === 'library' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
            📚 E-Library & Reading
          </button>

          <button onClick={() => navigateToTab('shop')} className={`px-3.5 py-1.5 font-bold rounded-xl transition ${activeTab === 'shop' ? 'bg-amber-500 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
            🎒 Student Shop
          </button>

          {(role === 'shop_admin' || role === 'super_admin') && (
            <button onClick={() => navigateToTab('shop_management')} className={`px-3.5 py-1.5 font-bold rounded-xl transition ${activeTab === 'shop_management' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
              🏬 Shop Control Panel
            </button>
          )}

          {(role === 'teacher' || role === 'super_admin') && (
            <button onClick={() => navigateToTab('teacher_studio')} className={`px-3.5 py-1.5 font-bold rounded-xl transition ${activeTab === 'teacher_studio' ? 'bg-purple-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
              👨‍🏫 Subject Quiz Studio
            </button>
          )}

          {role === 'super_admin' && (
            <button onClick={() => navigateToTab('super_admin_console')} className={`px-3.5 py-1.5 font-bold rounded-xl transition ${activeTab === 'super_admin_console' ? 'bg-rose-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
              👑 Super Admin Control Center
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">

        {/* TAB: PRACTICE VAULT (Students & Teachers can play) */}
        {activeTab === 'dashboard' && !activeQuiz && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-slate-900">Quiz Practice Vault</h3>
              <p className="text-xs text-slate-500">Students and Teachers can attempt quizzes!</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quizzes.map((quiz) => (
                <div key={quiz.id} className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs hover:border-indigo-300 transition flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-1 rounded-lg font-bold">{quiz.subject}</span>
                    <h4 className="font-bold text-slate-900 mt-2">{quiz.title}</h4>
                    <p className="text-xs text-slate-400 mt-1">{quiz.questions.length} Questions</p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 mt-4">
                    <button onClick={() => startQuiz(quiz, 'practice')} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-xl text-xs font-bold shadow-xs">
                      Play Quiz
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: E-LIBRARY & READING */}
        {activeTab === 'library' && !activeQuiz && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-emerald-800 to-teal-700 text-white p-6 rounded-3xl shadow-md flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black">Interactive E-Library</h2>
                <p className="text-xs text-emerald-100 mt-1">
                  Read online (time is automatically tracked) OR claim physical copies borrowed from the school library!
                </p>
              </div>
              <div className="bg-white/10 p-3 rounded-2xl text-center">
                <span className="text-[10px] text-emerald-200 block uppercase font-bold">Total Read</span>
                <span className="text-xl font-black text-amber-300">{readingHours} Hours</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {books.map((book) => {
                const isOnlineRead = onlineReadBookIds.includes(book.id);
                const isPhysicalClaimed = physicalClaimedBookIds.includes(book.id);

                return (
                  <div key={book.id} className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs flex flex-col justify-between">
                    <div>
                      <img src={book.cover_url} alt="" className="h-44 w-full object-cover" />
                      <div className="p-5 space-y-2">
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">{book.subject}</span>
                        <h4 className="font-bold text-slate-900 text-base">{book.title}</h4>
                        <p className="text-xs text-slate-500">By {book.author}</p>
                      </div>
                    </div>

                    <div className="p-5 pt-0 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => { setSelectedBook(book); setBookPageIndex(0); }}
                          className={`py-2.5 rounded-xl text-xs font-bold transition ${isOnlineRead ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
                        >
                          {isOnlineRead ? '✓ Read Online' : 'Read Online'}
                        </button>

                        <button
                          onClick={() => setClaimingBook(book)}
                          className={`py-2.5 rounded-xl text-xs font-bold transition ${isPhysicalClaimed ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'}`}
                        >
                          {isPhysicalClaimed ? '✓ Physical Claimed' : 'Claim Physical'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB: SHOP CONTROL PANEL (Shop Admin & Super Admin) */}
        {activeTab === 'shop_management' && (role === 'shop_admin' || role === 'super_admin') && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-lg">
              <h2 className="text-xl font-black">🏬 Store Sales & Order Fulfillment Console</h2>
              <p className="text-xs text-slate-400">Process student orders, update stock levels, and hand over physical goods.</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
              <h3 className="font-bold text-slate-900 text-base">Student Orders Ledger</h3>
              <div className="divide-y divide-slate-100">
                {orders.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4">No recent student purchases.</p>
                ) : (
                  orders.map(ord => (
                    <div key={ord.id} className="py-3 flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-slate-900">{ord.student_name}</span> — {ord.item_name}
                        <span className="block text-[10px] text-slate-400 font-mono">Code: {ord.claim_code}</span>
                      </div>
                      <span className="bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full font-bold">{ord.status}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB: TEACHER SUBJECT QUIZ STUDIO (Teacher & Super Admin) */}
        {activeTab === 'teacher_studio' && (role === 'teacher' || role === 'super_admin') && (
          <div className="space-y-6 max-w-3xl mx-auto">
            <div className="bg-purple-900 text-white p-6 rounded-3xl shadow-lg">
              <h2 className="text-xl font-black">👨‍🏫 Teacher Quiz Studio</h2>
              <p className="text-xs text-purple-200">
                {role === 'teacher' ? `Assigned Subject: ${teacherSubject}. You can create/edit quizzes for ${teacherSubject}.` : 'Super Admin Mode: Full Quiz Creation Access.'}
              </p>
            </div>

            <form onSubmit={handleTeacherCreateQuiz} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
              <h3 className="font-bold text-slate-900 text-sm">Create New Subject Quiz</h3>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Quiz Title</label>
                <input type="text" value={quizForm.title} onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })} placeholder="e.g. Chapter 2 Force & Motion Test" className="w-full bg-slate-50 border rounded-xl p-2.5 text-xs" required />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Subject</label>
                  <select
                    value={quizForm.subject}
                    disabled={role === 'teacher'} // Locked to teacher subject
                    onChange={(e) => setQuizForm({ ...quizForm, subject: e.target.value })}
                    className="w-full bg-slate-50 border rounded-xl p-2.5 text-xs font-bold"
                  >
                    {ALL_SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Grade Level</label>
                  <select value={quizForm.grade} onChange={(e) => setQuizForm({ ...quizForm, grade: e.target.value })} className="w-full bg-slate-50 border rounded-xl p-2.5 text-xs font-bold">
                    {[1,2,3,4,5,6,7,8,9,10].map(g => <option key={g} value={g}>Grade {g}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Questions JSON Format</label>
                <textarea
                  rows={6}
                  value={quizForm.questionsJson}
                  onChange={(e) => setQuizForm({ ...quizForm, questionsJson: e.target.value })}
                  placeholder={`[\n  {\n    "question_text": "What is unit of force?",\n    "option_a": "Newton", "option_b": "Joule", "option_c": "Watt", "option_d": "Gram",\n    "correct_option": "A",\n    "explanation": "Force is measured in Newtons."\n  }\n]`}
                  className="w-full bg-slate-50 border rounded-xl p-3 text-xs font-mono"
                  required
                />
              </div>

              <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-2xl text-xs shadow-md">
                Publish Subject Quiz
              </button>
            </form>
          </div>
        )}

        {/* TAB: SUPER ADMIN CONTROL CENTER */}
        {activeTab === 'super_admin_console' && role === 'super_admin' && (
          <div className="space-y-6 max-w-5xl mx-auto">
            <div className="bg-rose-950 text-white p-6 rounded-3xl shadow-lg flex justify-between items-center">
              <div>
                <div className="flex items-center space-x-2 text-rose-400">
                  <Shield className="w-5 h-5" />
                  <span className="text-xs font-bold uppercase tracking-wider">Master System Control</span>
                </div>
                <h2 className="text-2xl font-black mt-1">Super Admin User & Access Control</h2>
                <p className="text-xs text-rose-200">Control who can log in, enable/disable accounts, and reassign user roles.</p>
              </div>

              <button onClick={fetchAllProfiles} className="bg-rose-800 hover:bg-rose-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1">
                <RefreshCw className="w-3.5 h-3.5" /> <span>Refresh Users</span>
              </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
              <h3 className="font-bold text-slate-900 text-base">Registered System Users ({allProfiles.length})</h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                      <th className="py-2.5 px-3">User Name</th>
                      <th className="py-2.5 px-3">Index / Staff ID</th>
                      <th className="py-2.5 px-3">Assigned Role</th>
                      <th className="py-2.5 px-3">Login Status</th>
                      <th className="py-2.5 px-3 text-right">Super Admin Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {allProfiles.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="py-3 px-3 font-bold text-slate-900">{p.full_name || 'User'}</td>
                        <td className="py-3 px-3 font-mono text-slate-500">{p.index_number || 'N/A'}</td>
                        <td className="py-3 px-3">
                          <select
                            value={p.role || 'student'}
                            onChange={(e) => updateUserRoleOrStatus(p.id, { role: e.target.value })}
                            className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-indigo-700"
                          >
                            <option value="student">Student</option>
                            <option value="teacher">Teacher</option>
                            <option value="shop_admin">Shop Admin</option>
                            <option value="super_admin">Super Admin</option>
                          </select>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${p.status === 'disabled' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}`}>
                            {p.status === 'disabled' ? '🔒 Disabled' : '✓ Active'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => updateUserRoleOrStatus(p.id, { status: p.status === 'disabled' ? 'active' : 'disabled' })}
                            className={`px-3 py-1.5 rounded-xl text-[11px] font-bold shadow-xs ${
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

      </main>

      {/* ONLINE READ MODAL WITH AUTO TIME DETECTOR */}
      {selectedBook && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">{selectedBook.subject}</span>
                <h3 className="font-black text-slate-900 text-lg">{selectedBook.title}</h3>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-xs font-mono font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Time: {Math.floor(activeReadingSeconds / 60)}m {activeReadingSeconds % 60}s</span>
                </span>
                <button onClick={() => setSelectedBook(null)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
              </div>
            </div>

            <div className="bg-slate-50 border p-5 rounded-2xl min-h-[220px] text-xs leading-relaxed whitespace-pre-line font-serif">
              {Array.isArray(selectedBook.pages) ? selectedBook.pages[bookPageIndex] : selectedBook.pages}
            </div>

            <div className="flex justify-between items-center border-t pt-3">
              <span className="text-xs font-bold text-slate-500">Auto-Detecting Active Reading Time...</span>
              <button
                onClick={() => handleFinishOnlineReading(selectedBook)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-md"
              >
                Finish & Save Reading Time
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PHYSICAL BOOK CLAIM CODE MODAL */}
      {claimingBook && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-black text-slate-900 text-base">Claim Physical Library Copy</h3>
              <button onClick={() => setClaimingBook(null)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <p className="text-xs text-slate-600">
              Enter the official librarian code for <strong>"{claimingBook.title}"</strong> to log {claimingBook.reading_hours || 2.0} hours.
            </p>

            <form onSubmit={handleClaimPhysicalBook} className="space-y-4">
              <input
                type="text"
                value={claimPasscode}
                onChange={(e) => setClaimPasscode(e.target.value)}
                placeholder="e.g. LIB-DHIV-01"
                className="w-full bg-slate-50 border rounded-xl p-3 text-xs font-mono font-bold uppercase"
                required
              />
              <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-md">
                Verify Code & Claim Hours
              </button>
            </form>
          </div>
        </div>
      )}

      {/* QUIZ OVERLAY */}
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
                <p className="text-xs text-slate-500">Score: {score} / {activeQuiz.questions.length}</p>
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