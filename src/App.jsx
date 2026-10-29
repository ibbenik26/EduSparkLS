import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from './lib/supabase';

import { ROLE_TABS, INITIAL_BADGES, INITIAL_RANKS, getDefaultTabForRole, getQuizTimeLimit, playSound } from './utils/helpers';
import { INITIAL_QUIZZES, INITIAL_BOOKS, INITIAL_SHOP_ITEMS } from './data/initialData';

import Navbar from './components/Navbar';
import { LandingPage, AuthForm } from './components/AuthViews';
import StudentDashboard from './components/StudentDashboard';
import OLevelArena from './components/OLevelArena';
import LeaderboardTab from './components/LeaderboardTab';
import LibraryTab from './components/LibraryTab';
import ShopTab from './components/ShopTab';
import TeacherStudio from './components/TeacherStudio';
import ProfileTab from './components/ProfileTab';

import QuizRunnerModal from './components/QuizRunnerModal';
import DiagramUploadModal from './components/DiagramUploadModal';
import { ToastContainer, ConfirmModal } from './components/NotificationToast';

const TIMED_MODES = ['challenge', 'olevel'];

const lsGet = (key, fallback) => {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
};
const lsSet = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage full / blocked */ }
};

export default function App() {
  const [authView, setAuthView] = useState('landing');
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('student');
  const [authName, setAuthName] = useState('User');
  const [studentGrade, setStudentGrade] = useState(7);
  const [schoolName, setSchoolName] = useState('Majeedhiyya School');
  const [studentAddress, setStudentAddress] = useState('M. Henveiru, Malé');
  const [indexNumber, setIndexNumber] = useState('STU-2026');
  const [teacherSubject, setTeacherSubject] = useState('Physics');

  // New accounts start at zero (the old 350 coins / 420 XP defaults were demo values)
  const [coins, setCoins] = useState(0);
  const [xp, setXp] = useState(0);
  const [readingHours, setReadingHours] = useState(0);
  const [claimedCodes, setClaimedCodes] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [profileLoaded, setProfileLoaded] = useState(false);

  const [ranks, setRanks] = useState(INITIAL_RANKS);
  const [badges, setBadges] = useState(INITIAL_BADGES);

  // Sponsor proposals contain personal details (email/phone), so they are only
  // loaded for super admins and are NOT cached in localStorage any more.
  const [sponsors, setSponsors] = useState([]);

  const [quizzes, setQuizzes] = useState(INITIAL_QUIZZES);
  const [books, setBooks] = useState(INITIAL_BOOKS);
  const [shopItems, setShopItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [allProfiles, setAllProfiles] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');

  const [lockedChallengeQuizIds, setLockedChallengeQuizIds] = useState([]);
  const [completedQuizModes, setCompletedQuizModes] = useState([]);

  // ---------- Toasts & confirm modal ----------
  const [toasts, setToasts] = useState([]);
  const showToast = useCallback((message, type = 'info') => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);
  const removeToast = useCallback((id) => setToasts(prev => prev.filter(t => t.id !== id)), []);

  const [confirmState, setConfirmState] = useState({ isOpen: false, title: '', message: '', onConfirm: null, confirmLabel: 'Confirm Delete', danger: true });
  const askConfirm = (title, message, onConfirm, options = {}) => {
    setConfirmState({
      isOpen: true,
      title,
      message,
      confirmLabel: options.confirmLabel || 'Confirm Delete',
      danger: options.danger !== false,
      onConfirm: () => {
        setConfirmState(prev => ({ ...prev, isOpen: false }));
        onConfirm();
      }
    });
  };

  // ---------- Quiz runner state ----------
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [quizMode, setQuizMode] = useState('practice');
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [hearts, setHearts] = useState(5);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [quizFinished, setQuizFinished] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [answerLog, setAnswerLog] = useState([]);
  const [reward, setReward] = useState({ coins: 0, xp: 0 });

  const [showDiagramUploadModal, setShowDiagramUploadModal] = useState(false);

  // Always-fresh snapshot for event handlers that outlive a render (popstate, confirm callbacks)
  const quizRef = useRef({});
  quizRef.current = { activeQuiz, quizMode, quizFinished, gameOver, score, answerLog };
  const roleRef = useRef(role);
  roleRef.current = role;
  const attemptsRef = useRef(attempts);
  attemptsRef.current = attempts;
  const loadedUserRef = useRef(null);

  // ---------- Per-user local persistence ----------
  useEffect(() => {
    if (!user?.id) return;
    setCompletedQuizModes(lsGet(`edusparkls_completed_${user.id}`, []));
    setLockedChallengeQuizIds(lsGet(`edusparkls_locked_${user.id}`, []));
    setClaimedCodes(lsGet(`edusparkls_claimed_${user.id}`, []));
  }, [user?.id]);

  const recordUserCompletion = (completionKey) => {
    setCompletedQuizModes(prev => {
      if (prev.includes(completionKey)) return prev;
      const updated = [...prev, completionKey];
      if (user?.id) lsSet(`edusparkls_completed_${user.id}`, updated);
      return updated;
    });
  };

  const updateLockedChallenges = (updater) => {
    setLockedChallengeQuizIds(prev => {
      const next = updater(prev);
      if (user?.id) lsSet(`edusparkls_locked_${user.id}`, next);
      return next;
    });
  };

  // Accepts either a new array or an updater function (LibraryTab uses the array form)
  const updateClaimedCodes = (valueOrFn) => {
    setClaimedCodes(prev => {
      const next = typeof valueOrFn === 'function' ? valueOrFn(prev) : valueOrFn;
      if (user?.id) lsSet(`edusparkls_claimed_${user.id}`, next);
      return next;
    });
  };

  // ---------- Auth + data loading ----------
  const resetSession = () => {
    setUser(null);
    setRole('student');
    setCoins(0);
    setXp(0);
    setReadingHours(0);
    setAttempts([]);
    setProfileLoaded(false);
    setActiveQuiz(null);
    setCompletedQuizModes([]);
    setLockedChallengeQuizIds([]);
    setClaimedCodes([]);
    setAllProfiles([]);
    setSponsors([]);
    setOrders([]);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session?.user) {
        loadedUserRef.current = null;
        resetSession();
        return;
      }

      // Token refreshes hand us a new object for the same user: keep the old one so nothing re-renders/reloads
      setUser(prev => (prev?.id === session.user.id ? prev : session.user));

      // Load the profile once per login (not on every token refresh / tab refocus)
      if (loadedUserRef.current !== session.user.id) {
        loadedUserRef.current = session.user.id;
        setTimeout(() => fetchUserProfile(session.user), 0);
      }
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUserProfile = async (authUser) => {
    const userId = authUser?.id;
    if (!userId) return;

    try {
      const meta = authUser.user_metadata || {};
      let { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
      if (error) throw error;

      if (!data) {
        // First login: create the profile row. Role is ALWAYS 'student' here;
        // teachers/admins are promoted by editing profiles.role in Supabase.
        const fresh = {
          id: userId,
          full_name: meta.full_name || 'Student',
          role: 'student',
          grade: parseInt(meta.grade) || 7,
          coins: 0,
          xp: 0
        };
        const { data: created, error: insertError } = await supabase.from('profiles').insert([fresh]).select().maybeSingle();
        if (insertError) console.warn('Profile create error:', insertError.message);
        data = created || fresh;
      }

      // Role comes from the database only. user_metadata can be edited by the user.
      const effectiveRole = data.role || 'student';
      const savedAttempts = Array.isArray(data.challenge_attempts) ? data.challenge_attempts : [];

      setAuthName(data.full_name || meta.full_name || 'User');
      setRole(effectiveRole);
      setStudentGrade(data.grade || parseInt(meta.grade) || 7);
      setSchoolName(data.school_name || 'Majeedhiyya School');
      setStudentAddress(data.student_address || 'M. Henveiru, Malé');
      setIndexNumber(data.index_number || 'STU-2026');
      setTeacherSubject(data.teacher_subject || 'Physics');
      setCoins(data.coins ?? 0);
      setXp(data.xp ?? 0);
      setAttempts(savedAttempts);

      // Completed timed quizzes are also derived from the server-side attempt history,
      // so clearing browser storage no longer resets the "once only" rule.
      const serverKeys = savedAttempts.filter(a => a.completed).map(a => `${a.quiz_id}_${a.mode}`);
      setCompletedQuizModes(prev => Array.from(new Set([...prev, ...serverKeys])));

      setProfileLoaded(true);

      const initialTab = getDefaultTabForRole(effectiveRole);
      setActiveTab(initialTab);
      window.history.replaceState({ tab: initialTab }, '', `#${initialTab}`);

      loadAppData(effectiveRole);
    } catch (e) {
      console.warn('Profile fetch error:', e);
      showToast('⚠️ Could not load your profile. Please refresh the page.', 'error');
    }
  };

  const loadAppData = (effectiveRole) => {
    fetchQuizzesFromSupabase();
    fetchShopItemsFromSupabase(effectiveRole);
    fetchBadgesFromSupabase();
    fetchLeaderboard();
    if (effectiveRole === 'super_admin') fetchSponsorsFromSupabase();
  };

  const fetchQuizzesFromSupabase = async () => {
    try {
      const { data, error } = await supabase.from('quizzes').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      if (data && data.length > 0) {
        setQuizzes(data.map(q => ({
          ...q,
          grade: parseInt(q.grade) || 7,
          questions: typeof q.questions === 'string' ? JSON.parse(q.questions) : (q.questions || [])
        })));
      }
    } catch (e) {
      console.warn('Quizzes fetch info:', e);
    }
  };

  const fetchShopItemsFromSupabase = async (effectiveRole) => {
    try {
      const { data, error } = await supabase.from('shop_items').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      if (data && data.length > 0) {
        setShopItems(data);
      } else if (effectiveRole === 'super_admin') {
        // Seed default inventory ONCE, in a single batch, and only from an admin session
        const rows = INITIAL_SHOP_ITEMS.map(i => ({
          id: i.id,
          name: i.name,
          category: i.category,
          cost: i.cost,
          stock: i.stock ?? 10,
          creator_name: 'Admin',
          target_grade: i.target_grade || 'All',
          image_url: i.image_url || 'https://images.unsplash.com/photo-1585336261026-6757688719d3?auto=format&fit=crop&q=80&w=600',
          rating: 4.9,
          desc: i.desc || ''
        }));
        const { error: seedError } = await supabase.from('shop_items').insert(rows);
        if (!seedError) setShopItems(rows);
        else console.warn('Shop seed error:', seedError.message);
      }
    } catch (e) {
      console.warn('Shop items fetch info:', e);
    }
  };

  const fetchBadgesFromSupabase = async () => {
    try {
      const { data, error } = await supabase.from('badges').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      if (data && data.length > 0) {
        setBadges(data.map(b => ({ id: b.id, name: b.name, icon: b.icon, desc: b.desc, reqXp: b.req_xp })));
      }
    } catch (e) {
      console.warn('Badges fetch info:', e);
    }
  };

  // Leaderboard only needs a few public columns. Prefer a `leaderboard` view (see supabase_setup.sql)
  // so students never download other students' attempts/addresses; fall back to profiles.
  const fetchLeaderboard = async () => {
    try {
      let res = await supabase.from('leaderboard').select('id, full_name, grade, coins, xp');
      if (res.error) {
        res = await supabase.from('profiles').select('id, full_name, grade, coins, xp, role').eq('role', 'student');
      }
      if (!res.error && res.data) {
        setAllProfiles(res.data.map(p => ({ ...p, role: 'student' })));
      }
    } catch (e) {
      console.warn('Leaderboard fetch error:', e);
    }
  };

  const fetchSponsorsFromSupabase = async () => {
    try {
      const { data, error } = await supabase.from('sponsors').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setSponsors((data || []).map(d => ({
        id: d.id,
        applicantName: d.applicant_name,
        email: d.email,
        phone: d.phone,
        partnerType: d.partner_type,
        contributionType: d.contribution_type,
        message: d.message,
        status: d.status || 'Pending Review ⏳',
        date: d.created_at ? d.created_at.split('T')[0] : new Date().toISOString().split('T')[0]
      })));
    } catch (e) {
      console.warn('Supabase sponsors fetch info:', e);
    }
  };

  // Refresh the leaderboard whenever its tab is opened
  useEffect(() => {
    if (user?.id && activeTab === 'leaderboard') fetchLeaderboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, user?.id]);

  // Save coins / XP whenever they change (debounced). Covers quizzes, library and shop in one place.
  useEffect(() => {
    if (!user?.id || !profileLoaded || role !== 'student') return;
    const t = setTimeout(async () => {
      const { error } = await supabase.from('profiles').update({ coins, xp }).eq('id', user.id);
      if (error) console.warn('Progress save error:', error.message);
    }, 800);
    return () => clearTimeout(t);
  }, [coins, xp, user?.id, profileLoaded, role]);

  // ---------- Quiz / shop / badge / sponsor CRUD (each checks the Supabase result) ----------
  const handleAddShopItem = async (newItem) => {
    const { error } = await supabase.from('shop_items').insert([{
      id: newItem.id,
      name: newItem.name,
      category: newItem.category,
      cost: parseInt(newItem.cost),
      stock: parseInt(newItem.stock ?? 10),
      creator_name: newItem.creator_name || authName,
      target_grade: newItem.target_grade || 'All',
      image_url: newItem.image_url,
      rating: newItem.rating || 4.9,
      desc: newItem.desc || ''
    }]);

    if (error) {
      showToast(`⚠️ Could not save item: ${error.message}`, 'error');
      return false;
    }
    setShopItems(prev => [newItem, ...prev]);
    showToast('🎉 Reward item saved!', 'success');
    return true;
  };

  const handleDeleteShopItem = async (itemId) => {
    const { error } = await supabase.from('shop_items').delete().eq('id', itemId);
    if (error) {
      showToast(`⚠️ Could not delete item: ${error.message}`, 'error');
      return false;
    }
    setShopItems(prev => prev.filter(i => i.id !== itemId));
    return true;
  };

  const handlePurchaseItem = (item) => {
    const stock = Number(item.stock ?? 0);
    if (stock <= 0) return showToast('❌ Sorry, this item is out of stock.', 'error');
    if (coins < item.cost) return showToast('❌ Not enough coins! Complete Timed Challenge Quizzes to earn more.', 'error');

    askConfirm('Confirm Store Purchase', `Spend ${item.cost} Coins on "${item.name}"?`, () => {
      setCoins(c => c - item.cost);
      setShopItems(prev => prev.map(i => (i.id === item.id ? { ...i, stock: stock - 1 } : i)));

      const newOrder = {
        id: `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
        student_id: user.id,
        student_name: authName,
        item_id: item.id,
        name: item.name,
        cost: item.cost,
        date: new Date().toISOString().split('T')[0],
        status: 'Pending Teacher Collection',
        code: `GR${studentGrade}-${Math.floor(10000 + Math.random() * 90000)}`
      };
      setOrders(prev => [newOrder, ...prev]);
      showToast(`🎉 Claimed ${item.name}! Show collection code '${newOrder.code}' to your teacher.`, 'success');

      // Best-effort server sync (needs the policies / table from supabase_setup.sql)
      supabase.from('shop_items').update({ stock: stock - 1 }).eq('id', item.id)
        .then(({ error }) => { if (error) console.warn('Stock sync error:', error.message); });
      supabase.from('orders').insert([{
        id: newOrder.id, student_id: user.id, student_name: authName, item_id: item.id,
        item_name: item.name, cost: item.cost, status: newOrder.status, code: newOrder.code
      }]).then(({ error }) => { if (error) console.warn('Order sync error:', error.message); });
    }, { confirmLabel: 'Buy Now', danger: false });
  };

  const handleAddBadge = async (newBadge) => {
    const { error } = await supabase.from('badges').insert([{
      id: newBadge.id,
      name: newBadge.name,
      icon: newBadge.icon,
      desc: newBadge.desc,
      req_xp: parseInt(newBadge.reqXp)
    }]);
    if (error) {
      showToast(`⚠️ Could not save badge: ${error.message}`, 'error');
      return false;
    }
    setBadges(prev => [...prev, newBadge]);
    showToast('🎉 Achievement badge saved!', 'success');
    return true;
  };

  const handleDeleteBadge = async (badgeId) => {
    const { error } = await supabase.from('badges').delete().eq('id', badgeId);
    if (error) {
      showToast(`⚠️ Could not delete badge: ${error.message}`, 'error');
      return false;
    }
    setBadges(prev => prev.filter(b => b.id !== badgeId));
    return true;
  };

  const handleAddQuiz = async (newQuiz) => {
    const { error } = await supabase.from('quizzes').insert([{
      id: newQuiz.id,
      title: newQuiz.title,
      subject: newQuiz.subject,
      grade: parseInt(newQuiz.grade),
      subject_code: newQuiz.subject_code || '',
      exam_year: newQuiz.exam_year ? parseInt(newQuiz.exam_year) : null,
      variant: newQuiz.variant || '',
      is_past_paper: !!newQuiz.is_past_paper,
      has_diagrams: !!newQuiz.has_diagrams,
      questions: newQuiz.questions
    }]);
    if (error) {
      showToast(`⚠️ Could not save quiz: ${error.message}`, 'error');
      return false;
    }
    setQuizzes(prev => [newQuiz, ...prev]);
    showToast(`🎉 Quiz published with ${newQuiz.questions.length} questions!`, 'success');
    return true;
  };

  const handleDeleteQuiz = async (quizId) => {
    const { error } = await supabase.from('quizzes').delete().eq('id', quizId);
    if (error) {
      showToast(`⚠️ Could not delete quiz: ${error.message}`, 'error');
      return false;
    }
    setQuizzes(prev => prev.filter(q => q.id !== quizId));
    return true;
  };

  const handleUpdateSponsorStatus = async (sponsorId, newStatus) => {
    const { error } = await supabase.from('sponsors').update({ status: newStatus }).eq('id', sponsorId);
    if (error) return showToast(`⚠️ Could not update status: ${error.message}`, 'error');
    setSponsors(prev => prev.map(s => (s.id === sponsorId ? { ...s, status: newStatus } : s)));
    showToast(`Updated sponsor status to "${newStatus}"!`, 'success');
  };

  const handleDeleteSponsor = async (sponsorId) => {
    const { error } = await supabase.from('sponsors').delete().eq('id', sponsorId);
    if (error) return showToast(`⚠️ Could not delete proposal: ${error.message}`, 'error');
    setSponsors(prev => prev.filter(s => s.id !== sponsorId));
    showToast('Removed sponsor proposal.', 'info');
  };

  // ---------- Profile ----------
  const handleUpdateProfile = async (updatedFields) => {
    if (!user?.id) return;
    // .update() (not upsert) so the role column can never be touched from the client
    const { error } = await supabase.from('profiles').update({
      full_name: updatedFields.full_name,
      grade: updatedFields.grade,
      school_name: updatedFields.school_name,
      student_address: updatedFields.student_address,
      index_number: updatedFields.index_number
    }).eq('id', user.id);

    if (error) {
      showToast(`⚠️ Profile not saved: ${error.message}`, 'error');
      return;
    }
    setAuthName(updatedFields.full_name);
    setStudentGrade(updatedFields.grade);
    setSchoolName(updatedFields.school_name);
    setStudentAddress(updatedFields.student_address);
    setIndexNumber(updatedFields.index_number);
  };

  const handleLogout = async () => {
    if (user?.id && profileLoaded && role === 'student') {
      await supabase.from('profiles').update({ coins, xp }).eq('id', user.id);
    }
    await supabase.auth.signOut();
    setAuthView('landing');
    showToast('Signed out successfully.', 'info');
  };

  // ---------- Quiz engine ----------
  const startQuiz = (quiz, mode) => {
    if (!quiz?.questions?.length) {
      showToast('This quiz has no questions yet.', 'warning');
      return;
    }

    const completionKey = `${quiz.id}_${mode}`;

    if (TIMED_MODES.includes(mode) && completedQuizModes.includes(completionKey)) {
      showToast('🔒 Quiz Completed! Timed simulation quizzes can only be taken once.', 'warning');
      return;
    }

    if (mode === 'challenge' && lockedChallengeQuizIds.includes(quiz.id)) {
      showToast('🔒 Challenge Locked! Complete Practice Mode first to re-unlock!', 'warning');
      return;
    }

    setActiveQuiz(quiz);
    setQuizMode(mode);
    setCurrentQuestionIdx(0);
    setSelectedOption(null);
    setShowExplanation(false);
    setScore(0);
    setHearts(5);
    setStreak(0);
    setQuizFinished(false);
    setGameOver(false);
    setAnswerLog([]);
    setReward({ coins: 0, xp: 0 });
    setTimeLeft(getQuizTimeLimit(quiz));

    if (window.location.hash !== '#quiz') window.history.pushState({ modal: 'quiz' }, '', '#quiz');
  };

  // Saves a timed attempt to the student's profile so teachers can see it in the tracker
  const saveAttempt = (quiz, mode, finalScore, finalLog, completed) => {
    const byTopic = {};
    finalLog.forEach(({ topic, correct }) => {
      const key = topic || quiz.subject;
      byTopic[key] = byTopic[key] || { topic: key, correct: 0, total: 0 };
      byTopic[key].total += 1;
      if (correct) byTopic[key].correct += 1;
    });

    const attempt = {
      quiz_id: quiz.id,
      quiz_title: quiz.title,
      subject: quiz.subject,
      mode,
      score: finalScore,
      total: quiz.questions.length,
      completed,
      date: new Date().toISOString(),
      topics: Object.values(byTopic)
    };

    const next = [...attemptsRef.current, attempt].slice(-300);
    attemptsRef.current = next;
    setAttempts(next);

    if (user?.id) {
      supabase.from('profiles').update({ challenge_attempts: next }).eq('id', user.id)
        .then(({ error }) => { if (error) console.warn('Attempt save error:', error.message); });
    }
  };

  // Hearts ran out, time ran out, or the student quit a timed quiz
  const failTimedQuiz = (reason, finalScore, finalLog, { silent = false } = {}) => {
    const { activeQuiz: quiz, quizMode: mode } = quizRef.current;
    if (!quiz) return;

    if (mode === 'challenge') {
      updateLockedChallenges(prev => (prev.includes(quiz.id) ? prev : [...prev, quiz.id]));
    } else if (mode === 'olevel') {
      recordUserCompletion(`${quiz.id}_olevel`);
    }
    saveAttempt(quiz, mode, finalScore, finalLog, false);

    if (!silent) {
      setGameOver(true);
      showToast(
        mode === 'olevel'
          ? (reason === 'time' ? '⏰ Time is up! This timed simulation is now closed.' : '💔 Out of hearts! This timed simulation is now closed.')
          : (reason === 'time' ? '⏰ Time is up! Complete Practice Mode again to unlock Challenge mode.' : '💔 Out of hearts! Complete Practice Mode again to unlock Challenge mode.'),
        'error'
      );
    }
  };

  // Countdown for timed modes
  const timedRunning = !!activeQuiz && TIMED_MODES.includes(quizMode) && !quizFinished && !gameOver;

  useEffect(() => {
    if (!timedRunning) return;
    const id = setInterval(() => setTimeLeft(t => (t > 0 ? t - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [timedRunning]);

  useEffect(() => {
    if (timedRunning && timeLeft <= 0) {
      failTimedQuiz('time', score, answerLog);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, timedRunning]);

  const handleAnswerSubmit = (option) => {
    if (!activeQuiz || showExplanation) return;

    const currentQ = activeQuiz.questions[currentQuestionIdx];
    const isCorrect = option === String(currentQ.correct_option || '').trim().toUpperCase();
    const newScore = isCorrect ? score + 1 : score;
    const newLog = [...answerLog, { topic: currentQ.topic || activeQuiz.subject, correct: isCorrect }];

    setSelectedOption(option);
    setShowExplanation(true);
    setAnswerLog(newLog);

    if (isCorrect) {
      playSound('correct');
      setScore(newScore);
      setStreak(st => st + 1);
    } else {
      playSound('wrong');
      setStreak(0);
      if (TIMED_MODES.includes(quizMode)) {
        const nextHearts = hearts - 1;
        setHearts(nextHearts);
        if (nextHearts <= 0) failTimedQuiz('hearts', newScore, newLog);
      }
    }
  };

  const finishQuiz = () => {
    const completionKey = `${activeQuiz.id}_${quizMode}`;

    if (quizMode === 'practice') {
      updateLockedChallenges(prev => prev.filter(id => id !== activeQuiz.id));
      recordUserCompletion(completionKey);
      setReward({ coins: 0, xp: 0 });
      showToast('📖 Practice Mode Completed! Challenge Mode UNLOCKED 🔓 (0 Coins & 0 XP awarded in Practice)', 'info');
    } else {
      const totalQuestions = activeQuiz.questions.length;
      const isPerfect5Hearts = hearts === 5 && score === totalQuestions;
      const totalCoins = isPerfect5Hearts ? 25 : score * 2;
      const earnedXp = score * 10;
      const isFirstTimeCompletion = !completedQuizModes.includes(completionKey);

      saveAttempt(activeQuiz, quizMode, score, answerLog, true);

      if (isFirstTimeCompletion) {
        playSound('coin');
        setCoins(c => c + totalCoins);
        setXp(x => x + earnedXp);
        recordUserCompletion(completionKey);
        setReward({ coins: totalCoins, xp: earnedXp });

        const detailMsg = isPerfect5Hearts
          ? '⭐ PERFECT 5-HEART BONUS! 25 Coins Claimed!'
          : `${score} correct × 2 coins = ${totalCoins} Coins Claimed!`;
        showToast(`🏆 Timed Quiz Completed! +${totalCoins} Coins (${detailMsg}) & +${earnedXp} XP! Quiz locked.`, 'success');
      }
    }
    setQuizFinished(true);
  };

  const nextQuestion = () => {
    setSelectedOption(null);
    setShowExplanation(false);

    if (currentQuestionIdx + 1 < activeQuiz.questions.length) {
      setCurrentQuestionIdx(idx => idx + 1);
    } else {
      finishQuiz();
    }
  };

  // Closing a timed quiz half-way counts as giving up (otherwise you could peek and retry)
  const closeQuizNow = (forfeit) => {
    const q = quizRef.current;
    if (forfeit && q.activeQuiz) failTimedQuiz('quit', q.score, q.answerLog, { silent: true });
    quizRef.current = { ...q, activeQuiz: null };
    setActiveQuiz(null);
    if (window.location.hash === '#quiz') window.history.back();
  };

  const closeQuiz = () => {
    const q = quizRef.current;
    const inProgress = q.activeQuiz && TIMED_MODES.includes(q.quizMode) && !q.quizFinished && !q.gameOver;
    if (inProgress) {
      askConfirm(
        'Quit this timed quiz?',
        q.quizMode === 'olevel'
          ? 'Quitting uses up your one attempt at this timed simulation.'
          : 'Quitting locks Challenge mode until you complete Practice Mode again.',
        () => closeQuizNow(true),
        { confirmLabel: 'Quit Quiz' }
      );
    } else {
      closeQuizNow(false);
    }
  };

  // ---------- Navigation / browser back button ----------
  useEffect(() => {
    const onPop = (e) => {
      const s = e.state || {};
      if (s.modal) return;

      const q = quizRef.current;
      if (q.activeQuiz) {
        const inProgress = TIMED_MODES.includes(q.quizMode) && !q.quizFinished && !q.gameOver;
        if (inProgress) failTimedQuiz('quit', q.score, q.answerLog, { silent: true });
        quizRef.current = { ...q, activeQuiz: null };
        setActiveQuiz(null);
      }
      setShowDiagramUploadModal(false);

      const allowed = ROLE_TABS[roleRef.current] || ROLE_TABS.student;
      if (s.tab && allowed.includes(s.tab)) setActiveTab(s.tab);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const navigateToTab = (tabName) => {
    const allowed = ROLE_TABS[role] || ROLE_TABS.student;
    if (!allowed.includes(tabName)) return;

    setActiveQuiz(null);
    setActiveTab(tabName);
    window.history.pushState({ tab: tabName }, '', `#${tabName}`);
  };

  const openDiagramUpload = () => {
    setShowDiagramUploadModal(true);
    window.history.pushState({ modal: 'diagram' }, '', '#diagram');
  };

  // ---------- Render ----------
  if (!user) {
    return (
      <>
        <ToastContainer toasts={toasts} removeToast={removeToast} />
        {authView === 'landing' ? (
          <LandingPage
            onGoLogin={() => setAuthView('login')}
            onGoRegister={() => setAuthView('register')}
            sponsors={sponsors}
            setSponsors={setSponsors}
            showToast={showToast}
          />
        ) : (
          <AuthForm authView={authView} setAuthView={setAuthView} showToast={showToast} />
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <ConfirmModal
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        confirmLabel={confirmState.confirmLabel}
        danger={confirmState.danger}
        onConfirm={confirmState.onConfirm}
        onCancel={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
      />

      <Navbar
        authName={authName}
        role={role}
        studentGrade={studentGrade}
        coins={coins}
        xp={xp}
        activeTab={activeTab}
        navigateToTab={navigateToTab}
        handleLogout={handleLogout}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {activeTab === 'dashboard' && (
          <StudentDashboard
            role={role}
            grade={studentGrade}
            quizzes={quizzes}
            onDeleteQuiz={handleDeleteQuiz}
            startQuiz={startQuiz}
            lockedChallengeQuizIds={lockedChallengeQuizIds}
            completedQuizModes={completedQuizModes}
            onOpenDiagramUpload={openDiagramUpload}
            showToast={showToast}
            askConfirm={askConfirm}
          />
        )}

        {activeTab === 'olevel' && (
          <OLevelArena
            role={role}
            quizzes={quizzes}
            onDeleteQuiz={handleDeleteQuiz}
            startQuiz={startQuiz}
            completedQuizModes={completedQuizModes}
            onOpenDiagramUpload={openDiagramUpload}
            showToast={showToast}
            askConfirm={askConfirm}
          />
        )}

        {activeTab === 'leaderboard' && (
          <LeaderboardTab profiles={allProfiles} currentUserId={user.id} />
        )}

        {activeTab === 'library' && (
          <LibraryTab
            role={role} books={books} setBooks={setBooks}
            setCoins={setCoins} setXp={setXp} setReadingHours={setReadingHours}
            claimedCodes={claimedCodes} setClaimedCodes={updateClaimedCodes}
            showToast={showToast} askConfirm={askConfirm}
          />
        )}

        {activeTab === 'shop' && (
          <ShopTab
            role={role} authName={authName} studentGrade={studentGrade}
            shopItems={shopItems} onAddShopItem={handleAddShopItem} onDeleteShopItem={handleDeleteShopItem}
            onPurchase={handlePurchaseItem} coins={coins}
            showToast={showToast} askConfirm={askConfirm}
          />
        )}

        {activeTab === 'studio' && (
          <TeacherStudio
            role={role}
            teacherSubject={teacherSubject}
            quizzes={quizzes}
            onAddQuiz={handleAddQuiz}
            onDeleteQuiz={handleDeleteQuiz}
            badges={badges}
            onAddBadge={handleAddBadge}
            onDeleteBadge={handleDeleteBadge}
            ranks={ranks}
            setRanks={setRanks}
            sponsors={sponsors}
            onUpdateSponsorStatus={handleUpdateSponsorStatus}
            onDeleteSponsor={handleDeleteSponsor}
            onOpenDiagramUpload={openDiagramUpload}
            showToast={showToast}
            askConfirm={askConfirm}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileTab
            authName={authName} role={role} studentGrade={studentGrade}
            schoolName={schoolName} studentAddress={studentAddress} indexNumber={indexNumber}
            coins={coins} xp={xp} readingHours={readingHours} user={user}
            badges={badges} ranks={ranks}
            onUpdateProfile={handleUpdateProfile} showToast={showToast}
          />
        )}
      </main>

      {showDiagramUploadModal && (
        <DiagramUploadModal
          onAddQuiz={handleAddQuiz}
          showToast={showToast}
          defaultSubject={role === 'teacher' ? teacherSubject : undefined}
          lockSubject={role === 'teacher'}
          onClose={() => {
            setShowDiagramUploadModal(false);
            if (window.location.hash === '#diagram') window.history.back();
          }}
        />
      )}

      {activeQuiz && (
        <QuizRunnerModal
          activeQuiz={activeQuiz} quizMode={quizMode} currentQuestionIdx={currentQuestionIdx}
          hearts={hearts} timeLeft={timeLeft} streak={streak} selectedOption={selectedOption}
          showExplanation={showExplanation} score={score} quizFinished={quizFinished} gameOver={gameOver}
          reward={reward}
          handleAnswerSubmit={handleAnswerSubmit} nextQuestion={nextQuestion} startQuiz={startQuiz}
          onClose={closeQuiz}
        />
      )}
    </div>
  );
}
