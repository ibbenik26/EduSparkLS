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
  PackageCheck, ShoppingCart, Store, Crown, Calendar, Building2, CheckSquare
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

// --- Educational Partners & Corporate Sponsors List ---
const EDUCATIONAL_PARTNERS = [
  { name: 'Cambridge Assessment International', category: 'Exam Board Partner', logo: '🎓' },
  { name: 'Ministry of Education Maldives', category: 'National Curriculum Sponsor', logo: '🇲🇻' },
  { name: 'Oxford University Press', category: 'Academic Library Partner', logo: '📚' },
  { name: 'Faber-Castell Maldives', category: 'LS Gift Shop Sponsor', logo: '✏️' },
  { name: 'Dhivehi Bahuge Academy', category: 'Language & Culture Sponsor', logo: '🖊️' }
];

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

const INITIAL_QUIZZES = [
  {
    id: 'daily_quiz_1',
    title: '🌟 Quiz of the Day: Physics Kinematics & Velocity',
    subject: 'Physics',
    grade: 10,
    topic: 'Kinematics & Motion',
    subject_code: '0625',
    is_daily_quiz: true,
    is_past_paper: false,
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
        correct_option: 'B', explanation: 'The area under a v-t graph equals total displacement (distance moved in a direction).'
      }
    ]
  },
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
  const [shopOrders, setShopOrders] = useState(INITIAL_SHOP_ORDERS);
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

  // --- Global Filter State ---
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedTopic, setSelectedTopic] = useState('All');
  const [shopFilter, setShopFilter] = useState('All');
  const [orderStatusFilter, setOrderStatusFilter] = useState('All');
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
  const [adminTab, setAdminTab] = useState('orders');
  const [editingBook, setEditingBook] = useState(null);
  const [bookForm, setBookForm] = useState({ title: '', author: '', subject: 'Dhivehi', cover_url: '', summary: '', extract: '', pageText: '', reading_hours: 2.0, claim_code: '' });
  const [editingPrize, setEditingPrize] = useState(null);
  const [prizeForm, setPrizeForm] = useState({ name: '', category: 'Physical Store', is_physical: true, cost: 200, icon: '🎒', desc: '' });

  // --- Navigation Controls ---
  const navigateToTab = (tabName) => {
    setActiveQuiz(null);
    setSelectedBook(null);
    setClaimingBook(null);
    setActiveTab(tabName);
    setSelectedSubject('All');
    setSelectedTopic('All');
    window.history.pushState({ tab: tabName }, '', `#${tabName}`);
  };

  useEffect(() => {
    window.history.replaceState({ tab: activeTab }, '', `#${activeTab}`);

    const handlePopState = (e) => {
      if (selectedBook) { setSelectedBook(null); return; }
      if (activeQuiz) { setActiveQuiz(null); return; }
      if (e.state && e.state.tab) { setActiveTab(e.state.tab); }
      else { setActiveTab('dashboard'); }
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
    fetchDatabaseOrders();

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
    } catch (e) { console.warn("Quizzes error:", e); }
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
    } catch (e) { console.warn("Books error:", e); }
  };

  const fetchDatabaseShop = async () => {
    try {
      const { data } = await supabase.from('shop_items').select('*').order('created_at', { ascending: false });
      if (data && data.length > 0) {
        const dbIds = new Set(data.map(i => i.id));
        setShopItems([...data, ...INITIAL_SHOP_ITEMS.filter(i => !dbIds.has(i.id))]);
      }
    } catch (e) { console.warn("Shop error:", e); }
  };

  const fetchDatabaseOrders = async () => {
    try {
      const { data } = await supabase.from('shop_orders').select('*').order('created_at', { ascending: false });
      if (data && data.length > 0) {
        setShopOrders(data);
      }
    } catch (e) { console.warn("Orders fetch error:", e); }
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
    } catch (e) { console.warn("Profile sync error:", e); }
  };

  // --- Auth Actions ---
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!authEmail || !authPassword) return alert('Please enter your email and password.');
    setAuthLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword });
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
    if (!authEmail.trim() || !authPassword.trim()) return alert('Please enter email and password.');

    if (role === 'student' && !indexNumber.trim()) {
      return alert('Please enter your Student Index Number.');
    }

    setAuthLoading(true);
    try {
      const assignedIndex = role === 'student' ? indexNumber : `STAFF-${Math.floor(100 + Math.random() * 900)}`;

      const { data, error } = await supabase.auth.signUp({
        email: authEmail,
        password: authPassword,
        options: { data: { full_name: authName, index_number: assignedIndex, role, grade: studentGrade } }
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
      alert(`✅ Registered successfully as ${role.toUpperCase()}! Welcome to EduSpark IQ.`);
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

  // --- Quiz Launch Handlers ---
  const handleStartDailyQuiz = () => {
    const dailyQuizObj = quizzes.find(q => q.is_daily_quiz) || quizzes[0];
    if (dailyQuizObj) {
      if (!user) {
        setAuthView('login');
      } else {
        startQuiz(dailyQuizObj, 'challenge');
      }
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
    setGameOver(false);
    setUserAnswers({});
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

    const isDaily = activeQuiz.is_daily_quiz;
    const multiplier = isDaily ? 2 : 1;
    const coinsEarned = score * 15 * multiplier;
    const xpEarned = score * 30 * multiplier;
    const newCoins = coins + coinsEarned;
    const newXp = xp + xpEarned;
    const newQuizzesCount = quizzesCompleted + 1;

    setCoins(newCoins);
    setXp(newXp);
    setQuizzesCompleted(newQuizzesCount);

    syncProfileToSupabase({
      coins: newCoins,
      xp: newXp,
      quizzes_completed: newQuizzesCount
    });
  };

  // --- Redeem LS Shop Physical or Digital Item ---
  const handleRedeemReward = async (item) => {
    if (coins < item.cost) return alert(`Insufficient EduCoins! You need ${item.cost - coins} more coins.`);
    
    const confirmMsg = item.is_physical
      ? `Buy real physical item "${item.name}" for ${item.cost} EduCoins?\n\nYour order will be sent to the LS Shop Admin, and you will get a physical claim voucher to pick it up!`
      : `Redeem "${item.name}" for ${item.cost} EduCoins?`;

    if (confirm(confirmMsg)) {
      const newCoins = coins - item.cost;
      const claimCode = `LS-GIFT-${Math.floor(1000 + Math.random() * 9000)}`;
      
      const newOrder = {
        id: `ord_${Date.now()}`,
        student_name: authName || 'Student User',
        student_index: indexNumber || 'STU-2026-N/A',
        grade: studentGrade || 7,
        item_name: item.name,
        cost: item.cost,
        claim_code: claimCode,
        status: 'Pending Pickup',
        date: new Date().toISOString().split('T')[0]
      };

      try {
        await supabase.from('shop_orders').insert([newOrder]);
      } catch (e) {
        console.warn("Supabase order insert warning:", e);
      }

      const updatedOrders = [newOrder, ...shopOrders];
      setShopOrders(updatedOrders);
      setCoins(newCoins);

      playSound('coin');
      confetti({ particleCount: 130, spread: 85 });

      syncProfileToSupabase({ coins: newCoins });

      if (item.is_physical) {
        setViewingVoucher(newOrder);
      } else {
        alert(`🎉 Purchased ${item.name}! Your reward pass is now active.`);
      }
    }
  };

  // --- Shop Admin Order Fulfillment Action ---
  const handleFulfillOrder = async (orderId) => {
    const updatedOrders = shopOrders.map(ord => ord.id === orderId ? { ...ord, status: 'Fulfilled / Given' } : ord);
    setShopOrders(updatedOrders);

    try {
      await supabase.from('shop_orders').update({ status: 'Fulfilled / Given' }).eq('id', orderId);
    } catch (e) { console.warn(e); }

    alert("✅ Order marked as Fulfilled / Given to student!");
  };

  // --- Dynamic Topic Extractor for Filter ---
  const availableTopics = Array.from(new Set(
    quizzes
      .filter(q => selectedSubject === 'All' || q.subject === selectedSubject)
      .map(q => q.topic || (q.questions && q.questions[0]?.topic) || 'General Topic')
      .filter(Boolean)
  ));

  const gradePracticeQuizzes = quizzes.filter(q => {
    const isGradeMatch = q.grade === parseInt(studentGrade);
    const isNotPastPaper = !q.is_past_paper;
    const isSubjectMatch = selectedSubject === 'All' || q.subject === selectedSubject;
    const quizTopic = q.topic || (q.questions && q.questions[0]?.topic) || 'General Topic';
    const isTopicMatch = selectedTopic === 'All' || quizTopic.toLowerCase() === selectedTopic.toLowerCase();
    const matchesSearch = (q.title || '').toLowerCase().includes(searchQuery.toLowerCase());
    return isGradeMatch && isNotPastPaper && isSubjectMatch && isTopicMatch && matchesSearch;
  });

  const filteredOrders = shopOrders.filter(ord => {
    if (orderStatusFilter === 'Pending') return ord.status === 'Pending Pickup';
    if (orderStatusFilter === 'Fulfilled') return ord.status === 'Fulfilled / Given';
    return true;
  });

  const currentRank = getStudentRank(xp);

  // =========================================================================
  // --- AUTHENTICATION & LANDING PAGE VIEWS ---
  // =========================================================================
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans relative overflow-hidden">
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

        {/* ELEGANT LANDING PAGE WITH QUIZ OF THE DAY & PARTNERS */}
        {authView === 'landing' && (
          <main className="max-w-7xl w-full mx-auto px-6 py-8 z-10 space-y-16 flex-1">
            {/* HERO BANNER */}
            <section className="text-center space-y-6 max-w-4xl mx-auto pt-4">
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-amber-500/20 via-indigo-500/20 to-purple-500/20 border border-amber-500/30 px-4 py-1.5 rounded-full text-amber-300 text-xs font-bold shadow-xs">
                <Store className="w-4 h-4 text-amber-400" />
                <span>LS Physical Gift Shop & Quiz of the Day Now Live!</span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
                Master Topics. Read Books.{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-amber-200">
                  Buy Real Gifts.
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
                EduSpark IQ bridges academic effort with real physical rewards. Earn EduCoins through topic quizzes and library reading logs to buy real school merchandise at the LS Gift Shop!
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
                  onClick={handleStartDailyQuiz}
                  className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-4 rounded-2xl text-sm transition flex items-center justify-center space-x-2 shadow-xl"
                >
                  <Flame className="w-4 h-4 text-amber-300" />
                  <span>Start Quiz of the Day (2x Coins)</span>
                </button>
              </div>
            </section>

            {/* FEATURE SHOWCASE CARDS */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* FEATURE 1: DIRECT QUIZ OF THE DAY LINK */}
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
                  <span className="text-[11px] font-bold text-indigo-300 uppercase block">Daily Challenge</span>
                  <h3 className="text-lg font-black text-white">Quiz of the Day</h3>
                  <p className="text-xs text-slate-400">Featured Physics topic quiz. Score high to earn double EduCoins today!</p>
                </div>

                <button
                  onClick={handleStartDailyQuiz}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center space-x-1.5 transition"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Launch Daily Quiz Now</span>
                </button>
              </div>

              {/* FEATURE 2: STUDENT OF THE MONTH SPOTLIGHT */}
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
                  <p className="text-xs text-slate-400">Grade 10 • Index: STU-1002 • 42.0 Reading Hours Logged</p>
                </div>

                <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs font-bold text-amber-300">
                  <span>Score: 2,850 XP</span>
                  <span>Master Rank 🔥</span>
                </div>
              </div>

              {/* FEATURE 3: LS GIFT SHOP */}
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
                  <p className="text-xs text-slate-400">Buy LS Water Bottles, Hoodies, Faber-Castell pens, and study journals with EduCoins!</p>
                </div>

                <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs font-bold text-purple-300">
                  <span>Physical Store Pickup</span>
                  <span>In-Stock 🎒</span>
                </div>
              </div>
            </section>

            {/* PARTNERS & EDUCATIONAL SPONSORS LOGO SHOWCASE */}
            <section className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 text-center space-y-6">
              <div className="space-y-1 max-w-md mx-auto">
                <span className="text-[11px] font-bold uppercase tracking-widest text-amber-400 block">Our Esteemed Network</span>
                <h3 className="text-xl font-black text-white">Educational Partners & Sponsors</h3>
                <p className="text-xs text-slate-400">Empowering curriculum standards and real-world student incentives.</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 pt-2">
                {EDUCATIONAL_PARTNERS.map((partner, idx) => (
                  <div key={idx} className="bg-slate-800/80 border border-slate-700/60 p-4 rounded-2xl space-y-2 hover:border-amber-500/40 transition">
                    <span className="text-3xl block">{partner.logo}</span>
                    <h4 className="font-bold text-xs text-white leading-tight">{partner.name}</h4>
                    <span className="text-[9px] text-slate-400 block">{partner.category}</span>
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
                  <label className="text-xs font-bold text-slate-300 block mb-1.5">Password</label>
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

                {role === 'student' && (
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
            <div onClick={() => navigateToTab('dashboard')} className="flex items-center space-x-3 cursor-pointer">
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
            </div>

            <button
              onClick={() => navigateToTab('profile')}
              className="flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700"
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
            <BookOpen className="w-3.5 h-3.5 text-indigo-600" /> <span>Topic Vault</span>
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
            <Store className="w-3.5 h-3.5" /> <span>🎒 LS Gift Shop</span>
          </button>

          <button
            onClick={() => navigateToTab('profile')}
            className={`px-3.5 py-1.5 font-bold flex items-center space-x-1.5 rounded-xl transition shrink-0 whitespace-nowrap ${activeTab === 'profile' ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <User className="w-3.5 h-3.5 text-purple-600" /> <span>My Profile</span>
          </button>

          <button
            onClick={() => { navigateToTab('leaderboard'); }}
            className={`px-3.5 py-1.5 font-bold flex items-center space-x-1.5 rounded-xl transition shrink-0 whitespace-nowrap ${activeTab === 'leaderboard' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <Trophy className="w-3.5 h-3.5 text-yellow-600" /> <span>Leaderboard</span>
          </button>

          {(role === 'teacher' || role === 'admin') && (
            <button
              onClick={() => navigateToTab('settings')}
              className={`px-3.5 py-1.5 font-bold flex items-center space-x-1.5 rounded-xl transition shrink-0 whitespace-nowrap ${activeTab === 'settings' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <Settings className="w-3.5 h-3.5 text-rose-600" /> <span>⚙️ Admin & Shop Orders</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">

        {/* TAB 1: TOPIC PRACTICE VAULT */}
        {activeTab === 'dashboard' && !activeQuiz && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-black text-slate-900">Grade {studentGrade} Topic Practice Vault</h3>
                <p className="text-xs text-slate-500">Practice questions organized topic-by-topic for your syllabus.</p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleStartDailyQuiz}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center space-x-1 shadow-xs"
                >
                  <Flame className="w-3.5 h-3.5 text-amber-300" />
                  <span>Quiz of the Day</span>
                </button>
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

            {/* Topic Filter Bar */}
            {availableTopics.length > 0 && (
              <div className="bg-indigo-50/60 border border-indigo-100 p-3 rounded-2xl flex items-center space-x-2 overflow-x-auto">
                <span className="text-[11px] font-bold text-indigo-900 shrink-0 flex items-center space-x-1">
                  <Tag className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Topic Filter:</span>
                </span>
                <button
                  onClick={() => setSelectedTopic('All')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold shrink-0 transition ${selectedTopic === 'All' ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-800'}`}
                >
                  All Topics
                </button>
                {availableTopics.map((top) => (
                  <button
                    key={top}
                    onClick={() => setSelectedTopic(top)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold shrink-0 transition ${selectedTopic === top ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-800'}`}
                  >
                    {top}
                  </button>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {gradePracticeQuizzes.map((quiz) => {
                const quizTopic = quiz.topic || (quiz.questions && quiz.questions[0]?.topic) || 'General Topic';
                return (
                  <div key={quiz.id} className="bg-white border border-slate-200 rounded-3xl p-5 flex flex-col justify-between shadow-xs space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg font-bold">
                          {quiz.subject}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900">{quiz.title}</h3>

                      <div className="mt-2 inline-flex items-center space-x-1 bg-purple-50 text-purple-700 border border-purple-100 px-2.5 py-1 rounded-lg text-[11px] font-bold">
                        <Tag className="w-3 h-3 text-purple-600" />
                        <span>Syllabus Topic: {quizTopic}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100">
                      <button onClick={() => startQuiz(quiz, 'practice')} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-xl text-xs font-bold">
                        Practice
                      </button>
                      <button onClick={() => startQuiz(quiz, 'challenge')} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-xl text-xs font-bold">
                        Challenge
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {shopItems.map((item) => (
                <div key={item.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
                  <div className="space-y-3">
                    <span className="text-4xl p-3 bg-amber-50 rounded-2xl border border-amber-100 block">{item.icon}</span>
                    <h3 className="font-black text-slate-900 text-base">{item.name}</h3>
                    <p className="text-xs text-slate-500">{item.desc}</p>
                  </div>

                  <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="font-black text-amber-600 text-base">{item.cost} Coins</span>
                    <button
                      onClick={() => handleRedeemReward(item)}
                      disabled={coins < item.cost}
                      className={`px-5 py-2.5 rounded-xl text-xs font-bold ${coins >= item.cost ? 'bg-amber-500 text-slate-950' : 'bg-slate-100 text-slate-400'}`}
                    >
                      {item.is_physical ? 'Buy Real Item' : 'Redeem Perk'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: ADMIN & SHOP FULFILLMENT MANAGEMENT */}
        {activeTab === 'settings' && (role === 'teacher' || role === 'admin') && (
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-xs space-y-4">
              <div className="flex items-center space-x-3">
                <Settings className="w-7 h-7 text-rose-600" />
                <div>
                  <h2 className="text-xl font-black text-slate-900">Admin Control & LS Shop Fulfillment Panel</h2>
                  <p className="text-xs text-slate-500">Track student purchases, verify claim codes, and mark items as given/fulfilled.</p>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2 border-t border-slate-100 overflow-x-auto">
                <button onClick={() => setAdminTab('orders')} className={`px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${adminTab === 'orders' ? 'bg-amber-500 text-slate-950' : 'bg-slate-100 text-slate-600'}`}>
                  📦 Student Shop Orders ({shopOrders.length})
                </button>
                <button onClick={() => setAdminTab('books')} className={`px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${adminTab === 'books' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  📚 Manage Books ({books.length})
                </button>
              </div>
            </div>

            {/* SHOP ORDERS FULFILLMENT PANEL */}
            {adminTab === 'orders' && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-4">
                  <div>
                    <h3 className="text-base font-black text-slate-900">Student Purchase Records & Redemptions</h3>
                    <p className="text-xs text-slate-500">When a student visits the library desk to collect a gift, search their index or code below.</p>
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
                        <th className="py-2.5 px-3">Claim Code</th>
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
                          <td className="py-3 px-3 font-bold text-indigo-700">{ord.item_name}</td>
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
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl text-[11px] transition"
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
          </div>
        )}

        {/* LEADERBOARD TAB */}
        {activeTab === 'leaderboard' && (
          <div className="max-w-xl mx-auto space-y-4">
            <div className="bg-white border border-slate-200 p-6 rounded-3xl text-center space-y-2 shadow-xs">
              <Trophy className="w-10 h-10 text-yellow-500 mx-auto" />
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">School Leaderboard</h2>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl divide-y divide-slate-100">
              {leaderboardUsers.map((s, idx) => (
                <div key={idx} className="p-4 flex items-center justify-between">
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
          </div>
        )}

        {/* Quiz Runner Overlay */}
        {activeQuiz && (
          <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-3xl p-5 sm:p-8 shadow-md">
            {gameOver ? (
              <div className="text-center py-6 space-y-5">
                <h2 className="text-2xl font-black text-slate-900">Game Over!</h2>
                <button onClick={() => setActiveQuiz(null)} className="bg-indigo-600 text-white font-bold px-6 py-2.5 rounded-xl text-xs">Back to Portal</button>
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
                  <button onClick={nextQuestion} className="w-full bg-indigo-600 text-white font-bold py-3 rounded-2xl transition">
                    Next Question
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
    </div>
  );
}