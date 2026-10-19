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

const QUICK_EMOJIS = ['🎒', '📓', '📐', '🖍️', '🎨', '🎟️', '⚡', '🎁', '⚽', '🏆', '📱', '📚', '🧩', '🎮', '🎧', '✏️'];

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
  // --- Auth View State ---
  const [authView, setAuthView] = useState('landing');

  // --- Authenticated User State ---
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

  // --- Student Metrics ---
  const [studentGrade, setStudentGrade] = useState(7);
  const [coins, setCoins] = useState(350);
  const [xp, setXp] = useState(420);
  const [readingHours, setReadingHours] = useState(5.5);
  const [quizzesCompleted, setQuizzesCompleted] = useState(0);

  // --- Decoupled Reading Records ---
  const [onlineReadBookIds, setOnlineReadBookIds] = useState([]);
  const [physicalClaimedBookIds, setPhysicalClaimedBookIds] = useState([]);
  const [completedChallenges, setCompletedChallenges] = useState([]);

  // --- App Collections ---
  const [quizzes, setQuizzes] = useState(INITIAL_QUIZZES);
  const [books, setBooks] = useState(INITIAL_BOOKS);
  const [shopItems, setShopItems] = useState(INITIAL_SHOP_ITEMS);
  const [orders, setOrders] = useState([]);
  const [allProfiles, setAllProfiles] = useState([]);

  // --- Navigation & View Controls ---
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // --- Live E-Reader Auto-Timer ---
  const [selectedBook, setSelectedBook] = useState(null);
  const [bookPageIndex, setBookPageIndex] = useState(0);
  const [activeReadingSeconds, setActiveReadingSeconds] = useState(0);
  const [claimingBook, setClaimingBook] = useState(null);

  // --- Quiz Runner ---
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [quizMode, setQuizMode] = useState('practice');
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  // --- Studio State ---
  const [studioGrade, setStudioGrade] = useState(7);
  const [studioSubject, setStudioSubject] = useState('Physics');
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

  const handleUpdateUserByAdmin = async (targetUserId, updates) => {
    try {
      await supabase.from('profiles').update(updates).eq('id', targetUserId);
      setAllProfiles(allProfiles.map(p => p.id === targetUserId ? { ...p, ...updates } : p));
      alert("✅ User account updated successfully!");
    } catch (err) {
      alert("Failed to update user: " + err.message);
    }
  };

  // --- E-Reader Auto-Timer ---
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
  const handleLogin = async (e, customEmail = null, customPassword = null) => {
    if (e) e.preventDefault();
    const targetEmail = customEmail || authEmail;
    const targetPassword = customPassword || authPassword;

    if (!targetEmail || !targetPassword) return alert('Please enter your email and password.');
    setAuthLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: targetEmail,
        password: targetPassword
      });
      if (error) throw error;

      if (data?.user) {
        const { data: profile } = await supabase.from('profiles').select('status, role').eq('id', data.user.id).single();
        if (profile && profile.status === 'disabled') {
          await supabase.auth.signOut();
          setUser(null);
          alert("🔒 Your account has been disabled by the Super Admin. Please contact school administration.");
          return;
        }
      }
    } catch (err) {
      alert("Login Error: " + err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  // --- PUBLIC STUDENT REGISTRATION (Role Locked to 'student') ---
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!authName.trim()) return alert('Please enter your full name.');
    if (!authEmail.trim() || !authPassword.trim()) return alert('Please enter email and password.');
    if (!indexNumber.trim()) return alert('Please enter your Student Index Number.');

    setAuthLoading(true);
    try {
      // SECURITY ENFORCEMENT: Public registration is strictly forced to 'student'
      const assignedRole = 'student';

      const { data, error } = await supabase.auth.signUp({
        email: authEmail,
        password: authPassword,
        options: {
          data: { full_name: authName, index_number: indexNumber, role: assignedRole, grade: studentGrade }
        }
      });
      if (error) throw error;

      if (data?.user) {
        await supabase.from('profiles').insert([{
          id: data.user.id,
          full_name: authName,
          index_number: indexNumber,
          role: assignedRole,
          status: 'active',
          grade: studentGrade,
          coins: 350,
          xp: 420,
          reading_hours: 0,
          online_read_book_ids: [],
          physical_claimed_book_ids: []
        }]);
      }
      alert(`🎉 Student account registered successfully! Welcome to EduSpark IQ.`);
    } catch (err) {
      alert("Registration Error: " + err.message);
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

  // --- E-Book Reader Finish ---
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

    alert(`🎉 Reading Session Logged!\n• Time Read: ${elapsedMinutes} mins (+${hoursEarned} hrs)\n• Earned: +${coinsEarned} EduCoins & +${xpEarned} XP!`);
  };

  // --- Physical Library Claim ---
  const handleClaimPhysicalBook = (e, book, code) => {
    e.preventDefault();
    const targetCode = (book.claim_code || 'LIB-2026').trim().toUpperCase();
    if (code.trim().toUpperCase() !== targetCode) {
      alert(`❌ Invalid Code for "${book.title}". Ask your librarian for this book's claim code.`);
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

  // --- Teacher Quiz Studio ---
  const handleTeacherCreateQuiz = (e) => {
    e.preventDefault();
    if (role === 'teacher' && studioSubject !== teacherSubject) {
      alert(`⚠️ Teachers can only publish quizzes for their assigned subject (${teacherSubject}).`);
      return;
    }

    try {
      const parsedQuestions = JSON.parse(jsonInputText);
      const newQuiz = {
        id: `quiz_${Date.now()}`,
        title: `Grade ${studioGrade} ${studioSubject} Quiz`,
        subject: studioSubject,
        grade: parseInt(studioGrade),
        is_past_paper: false,
        questions: parsedQuestions
      };

      setQuizzes([newQuiz, ...quizzes]);
      alert("✅ Quiz successfully created!");
    } catch (err) {
      alert("Invalid Questions JSON Format: " + err.message);
    }
  };

  // --- Shop Purchase ---
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
    alert(`🎉 Purchase Successful! Claim Code: ${claimCode}`);
  };

  const gradePracticeQuizzes = quizzes.filter(q => q.grade === parseInt(studentGrade) && (selectedSubject === 'All' || q.subject === selectedSubject));
  const filteredLibraryBooks = books.filter(b => selectedSubject === 'All' || b.subject === selectedSubject);
  const currentRank = getStudentRank(xp);

  // =========================================================================
  // --- AUTHENTICATION & LANDING PAGE VIEWS ---
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
              Student Register
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
                <span>Student Sign Up</span>
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

              {/* DEMO / TESTING QUICK LOGIN REFERENCE */}
              <div className="bg-slate-900/80 border border-slate-700/80 p-4 rounded-2xl space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 block">
                  💡 Quick Demo Logins:
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
                  New Student?{' '}
                  <button onClick={() => setAuthView('register')} className="text-indigo-400 font-bold hover:underline">
                    Create Student Account
                  </button>
                </p>
              </div>
            </div>
          </main>
        )}

        {/* PUBLIC REGISTER VIEW (STUDENT-ONLY REGISTRATION) */}
        {authView === 'register' && (
          <main className="max-w-md w-full mx-auto px-6 py-8 z-10 flex-1 flex flex-col justify-center">
            <div className="bg-slate-800 border border-slate-700 p-8 rounded-3xl shadow-2xl space-y-5">
              <div className="text-center space-y-1">
                <h2 className="text-2xl font-black text-white">Student Registration</h2>
                <p className="text-xs text-slate-400">Join EduSpark IQ to start practicing and earning rewards</p>
              </div>

              <form onSubmit={handleRegister} className="space-y-3.5">
                <div className="bg-indigo-500/10 border border-indigo-500/30 p-2.5 rounded-xl text-center">
                  <span className="text-xs font-bold text-indigo-300">🎓 Student Account Sign Up</span>
                  <p className="text-[10px] text-slate-400 mt-0.5">Teacher & Store accounts are assigned by Super Admin.</p>
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
                    placeholder="student@school.edu"
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
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs transition shadow-md mt-2"
                >
                  {authLoading ? 'Registering Account...' : 'Complete Student Registration'}
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

          <button
            onClick={() => navigateToTab('shop')}
            className={`px-3.5 py-1.5 font-bold flex items-center space-x-1.5 rounded-xl transition shrink-0 whitespace-nowrap ${activeTab === 'shop' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <ShoppingBag className="w-3.5 h-3.5" /> <span>Student Gift Shop</span>
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

        {/* TAB 2: E-LIBRARY */}
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
                          onClick={() => { setSelectedBook(book); setBookPageIndex(0); }}
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
                <span className="text-xs font-bold uppercase tracking-wider">Super Admin Control Console</span>
              </div>
              <h2 className="text-2xl font-black">User Accounts, Roles & Access Control</h2>
              <p className="text-xs text-rose-200">
                Manage login status (`Active` / `Disabled`), assign staff roles (**Teachers**, **Shop Admins**), and assign teacher subject leads.
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
                      <th className="py-2.5 px-3">Teacher Subject</th>
                      <th className="py-2.5 px-3">Login Status</th>
                      <th className="py-2.5 px-3 text-right">Action Controls</th>
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
                          {p.role === 'teacher' ? (
                            <select
                              value={p.teacher_subject || 'Physics'}
                              onChange={(e) => handleUpdateUserByAdmin(p.id, { teacher_subject: e.target.value })}
                              className="bg-purple-50 border border-purple-200 rounded-xl px-2.5 py-1 text-xs font-bold text-purple-800"
                            >
                              {ALL_SUBJECTS.map(subj => (
                                <option key={subj} value={subj}>{subj}</option>
                              ))}
                            </select>
                          ) : (
                            <span className="text-slate-400 font-mono text-[10px]">N/A</span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                            p.status === 'disabled' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {p.status === 'disabled' ? '🔒 Disabled' : '✓ Active'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
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

        {/* TAB 4: SHOP SALES CP */}
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
                    <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full text-[10px] font-black">
                      {ord.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: TEACHER QUIZ STUDIO */}
        {activeTab === 'studio' && (role === 'teacher' || role === 'super_admin') && (
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="bg-purple-900 text-white p-6 sm:p-8 rounded-3xl shadow-lg space-y-2">
              <h2 className="text-2xl font-black">👨‍🏫 Teacher Subject Quiz Studio</h2>
              <p className="text-xs text-purple-200">
                {role === 'teacher'
                  ? `Assigned Subject: ${teacherSubject}. Quizzes will be created under ${teacherSubject}.`
                  : 'Super Admin Mode: Full Subject Creation Control.'}
              </p>
            </div>

            <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-xs space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Teaching Subject</label>
                  <select
                    value={studioSubject}
                    disabled={role === 'teacher'} // Locked to assigned subject for teachers
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
                <label className="text-xs font-bold text-slate-700 block mb-1">Questions JSON Format</label>
                <textarea
                  rows={8}
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
          </div>
        )}

      </main>

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