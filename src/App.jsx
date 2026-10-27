import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';

import { ALL_SUBJECTS, ROLE_TABS, INITIAL_BADGES, INITIAL_RANKS, getDefaultTabForRole, getQuizTimeLimit, playSound } from './utils/helpers';
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

  const [coins, setCoins] = useState(350);
  const [xp, setXp] = useState(420);
  const [readingHours, setReadingHours] = useState(5.5);
  const [claimedCodes, setClaimedCodes] = useState([]);

  // Badges & Ranks Global State
  const [badges, setBadges] = useState(INITIAL_BADGES);
  const [ranks, setRanks] = useState(INITIAL_RANKS);

  const [quizzes, setQuizzes] = useState(INITIAL_QUIZZES);
  const [books, setBooks] = useState(INITIAL_BOOKS);
  const [shopItems, setShopItems] = useState(INITIAL_SHOP_ITEMS);
  const [orders, setOrders] = useState([
    { id: 'ORD-9021', student_name: 'Hassan Ali', name: 'Grade 7 Geometry Kit', cost: 250, date: '2026-10-18', status: 'Pending Teacher Collection', code: 'GR7-8821' }
  ]);
  const [allProfiles, setAllProfiles] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');

  const [lockedChallengeQuizIds, setLockedChallengeQuizIds] = useState([]);

  // Toast State
  const [toasts, setToasts] = useState([]);
  const showToast = (message, type = 'info') => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    setToasts(prev => [...prev, { id, message, type }]);
  };
  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  // Confirm Modal State
  const [confirmState, setConfirmState] = useState({ isOpen: false, title: '', message: '', onConfirm: null });
  const askConfirm = (title, message, onConfirm) => {
    setConfirmState({
      isOpen: true, title, message,
      onConfirm: () => {
        onConfirm();
        setConfirmState(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // Quiz Execution Modal State
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

  const [showDiagramUploadModal, setShowDiagramUploadModal] = useState(false);

  // -------------------------------------------------------------
  // SPA HISTORY & BROWSER / MOBILE BACK BUTTON NAVIGATION FIX
  // -------------------------------------------------------------
  useEffect(() => {
    const handlePopState = (e) => {
      // If a modal is open, close it first without navigating away
      if (activeQuiz) {
        setActiveQuiz(null);
        return;
      }
      if (showDiagramUploadModal) {
        setShowDiagramUploadModal(false);
        return;
      }

      // Sync active tab with browser hash
      const hashTab = window.location.hash.replace('#', '');
      if (hashTab && (ROLE_TABS[role] || ROLE_TABS.student).includes(hashTab)) {
        setActiveTab(hashTab);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [activeQuiz, showDiagramUploadModal, role]);

  const navigateToTab = (tabName) => {
    const allowed = ROLE_TABS[role] || ROLE_TABS.student;
    if (!allowed.includes(tabName)) return;

    setActiveQuiz(null);
    setActiveTab(tabName);
    window.history.pushState({ tab: tabName }, '', `#${tabName}`);
  };

  // Active Quiz Countdown Timer
  useEffect(() => {
    let timer = null;
    if (activeQuiz && (quizMode === 'challenge' || quizMode === 'olevel') && !quizFinished && !gameOver) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setGameOver(true);
            if (!lockedChallengeQuizIds.includes(activeQuiz.id)) {
              setLockedChallengeQuizIds(prevIds => [...prevIds, activeQuiz.id]);
            }
            showToast("⏱️ Time expired! Practice Mode must be completed to unlock Challenge again.", "error");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [activeQuiz, quizMode, quizFinished, gameOver, lockedChallengeQuizIds]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchUserProfile(session.user);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
        fetchUserProfile(session.user);
      } else {
        setUser(null);
      }
    });

    fetchAllProfiles();
    return () => subscription.unsubscribe();
  }, []);

  const fetchAllProfiles = async () => {
    try {
      const { data } = await supabase.from('profiles').select('*');
      if (data) setAllProfiles(data);
    } catch (e) {
      console.warn("Profiles fetch error:", e);
    }
  };

  const fetchUserProfile = async (authUser) => {
    const userId = authUser?.id;
    if (!userId) return;

    try {
      const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
      const metaRole = authUser?.user_metadata?.role;
      const effectiveRole = metaRole || data?.role || 'student';

      setAuthName(data?.full_name || authUser?.user_metadata?.full_name || 'User');
      setRole(effectiveRole);
      setStudentGrade(data?.grade || authUser?.user_metadata?.grade || 7);
      setSchoolName(data?.school_name || authUser?.user_metadata?.school_name || 'Majeedhiyya School');
      setStudentAddress(data?.student_address || authUser?.user_metadata?.student_address || 'M. Henveiru, Malé');
      setIndexNumber(data?.index_number || authUser?.user_metadata?.index_number || 'STU-2026');
      setTeacherSubject(data?.teacher_subject || authUser?.user_metadata?.teacher_subject || 'Physics');
      setCoins(data?.coins ?? 350);
      setXp(data?.xp ?? 420);
      
      const initialTab = getDefaultTabForRole(effectiveRole);
      setActiveTab(initialTab);
      window.history.replaceState({ tab: initialTab }, '', `#${initialTab}`);
    } catch (e) {
      console.warn("Profile fetch error:", e);
    }
  };

  const handleUpdateProfile = async (updatedFields) => {
    setAuthName(updatedFields.full_name);
    setStudentGrade(updatedFields.grade);
    setSchoolName(updatedFields.school_name);
    setStudentAddress(updatedFields.student_address);
    setIndexNumber(updatedFields.index_number);

    if (user?.id) {
      try {
        await supabase.from('profiles').upsert({
          id: user.id,
          full_name: updatedFields.full_name,
          grade: updatedFields.grade,
          school_name: updatedFields.school_name,
          student_address: updatedFields.student_address,
          index_number: updatedFields.index_number,
          role
        });
      } catch (err) {
        console.warn("Supabase profile sync error:", err);
      }
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setActiveQuiz(null);
    setAuthView('landing');
    showToast("Signed out successfully.", "info");
  };

  const startQuiz = (quiz, mode) => {
    if (mode === 'challenge' && lockedChallengeQuizIds.includes(quiz.id)) {
      showToast("🔒 Practice Mode Required! You must finish Practice Mode first to unlock Challenge Mode.", "warning");
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
    setTimeLeft(getQuizTimeLimit(quiz));

    window.history.pushState({ modal: 'quiz' }, '', '#quiz');
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
        setHearts((prevHearts) => {
          const nextHearts = prevHearts - 1;
          if (nextHearts <= 0) {
            setGameOver(true);
            if (!lockedChallengeQuizIds.includes(activeQuiz.id)) {
              setLockedChallengeQuizIds(prevIds => [...prevIds, activeQuiz.id]);
            }
            showToast("💔 Out of hearts! Complete Practice Mode to unlock Challenge again.", "error");
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
      setCoins(c => c + score * 15);
      setXp(x => x + score * 30);

      if (quizMode === 'practice') {
        setLockedChallengeQuizIds(prev => prev.filter(id => id !== activeQuiz.id));
        showToast(`🎉 Practice Completed! Challenge Mode for "${activeQuiz.title}" is UNLOCKED 🔓`, "success");
      } else {
        showToast(`🏆 Challenge Passed! +${score * 15} Coins & +${score * 30} XP Earned!`, "success");
      }
    }
  };

  if (!user) {
    if (authView === 'landing') {
      return <LandingPage onGoLogin={() => setAuthView('login')} onGoRegister={() => setAuthView('register')} />;
    }
    return <AuthForm authView={authView} setAuthView={setAuthView} showToast={showToast} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      <ConfirmModal
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
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
            setQuizzes={setQuizzes}
            startQuiz={startQuiz}
            lockedChallengeQuizIds={lockedChallengeQuizIds}
            onOpenDiagramUpload={() => {
              setShowDiagramUploadModal(true);
              window.history.pushState({ modal: 'diagram' }, '', '#diagram');
            }}
            showToast={showToast}
            askConfirm={askConfirm}
          />
        )}

        {activeTab === 'olevel' && (
          <OLevelArena
            role={role}
            quizzes={quizzes}
            setQuizzes={setQuizzes}
            startQuiz={startQuiz}
            onOpenDiagramUpload={() => {
              setShowDiagramUploadModal(true);
              window.history.pushState({ modal: 'diagram' }, '', '#diagram');
            }}
            showToast={showToast}
            askConfirm={askConfirm}
          />
        )}

        {activeTab === 'leaderboard' && (
          <LeaderboardTab profiles={allProfiles} />
        )}

        {activeTab === 'library' && (
          <LibraryTab
            role={role} books={books} setBooks={setBooks}
            setCoins={setCoins} setXp={setXp} setReadingHours={setReadingHours}
            claimedCodes={claimedCodes} setClaimedCodes={setClaimedCodes}
            showToast={showToast} askConfirm={askConfirm}
          />
        )}

        {activeTab === 'shop' && (
          <ShopTab
            role={role} authName={authName} studentGrade={studentGrade}
            shopItems={shopItems} setShopItems={setShopItems}
            coins={coins} setCoins={setCoins}
            orders={orders} setOrders={setOrders}
            showToast={showToast} askConfirm={askConfirm}
          />
        )}

        {activeTab === 'studio' && (
          <TeacherStudio
            role={role}
            teacherSubject={teacherSubject}
            quizzes={quizzes}
            setQuizzes={setQuizzes}
            badges={badges}
            setBadges={setBadges}
            ranks={ranks}
            setRanks={setRanks}
            showDiagramUploadModal={showDiagramUploadModal}
            setShowDiagramUploadModal={setShowDiagramUploadModal}
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
          quizzes={quizzes}
          setQuizzes={setQuizzes}
          showToast={showToast}
          onClose={() => {
            setShowDiagramUploadModal(false);
            if (window.location.hash.includes('diagram')) window.history.back();
          }}
        />
      )}

      {activeQuiz && (
        <QuizRunnerModal
          activeQuiz={activeQuiz} quizMode={quizMode} currentQuestionIdx={currentQuestionIdx}
          hearts={hearts} timeLeft={timeLeft} streak={streak} selectedOption={selectedOption}
          showExplanation={showExplanation} score={score} quizFinished={quizFinished} gameOver={gameOver}
          handleAnswerSubmit={handleAnswerSubmit} nextQuestion={nextQuestion} startQuiz={startQuiz}
          onClose={() => {
            setActiveQuiz(null);
            if (window.location.hash.includes('quiz')) window.history.back();
          }}
        />
      )}
    </div>
  );
}