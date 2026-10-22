import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';

import { ALL_SUBJECTS, ROLE_TABS, getDefaultTabForRole, getQuizTimeLimit, playSound } from './utils/helpers';
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

export default function App() {
  const [authView, setAuthView] = useState('landing');
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('student');
  const [authName, setAuthName] = useState('User');
  const [studentGrade, setStudentGrade] = useState(7);

  const [coins, setCoins] = useState(350);
  const [xp, setXp] = useState(420);
  const [readingHours, setReadingHours] = useState(5.5);
  const [claimedCodes, setClaimedCodes] = useState([]);

  const [quizzes, setQuizzes] = useState(INITIAL_QUIZZES);
  const [books, setBooks] = useState(INITIAL_BOOKS);
  const [shopItems, setShopItems] = useState(INITIAL_SHOP_ITEMS);
  const [orders, setOrders] = useState([
    { id: 'ORD-9021', student_name: 'Hassan Ali', name: 'Grade 7 Geometry Kit', cost: 250, date: '2026-10-18', status: 'Pending Teacher Collection', code: 'GR7-8821' }
  ]);
  const [allProfiles, setAllProfiles] = useState([]);

  const [activeTab, setActiveTab] = useState('dashboard');

  // Quiz Execution Modal State
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [quizMode, setQuizMode] = useState('practice');
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [quizFinished, setQuizFinished] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  // Diagram Builder State
  const [showDiagramUploadModal, setShowDiagramUploadModal] = useState(false);

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
      setCoins(data?.coins ?? 350);
      setXp(data?.xp ?? 420);
      setActiveTab(getDefaultTabForRole(effectiveRole));
    } catch (e) {
      console.warn("Profile fetch error:", e);
    }
  };

  const navigateToTab = (tabName) => {
    const allowed = ROLE_TABS[role] || ROLE_TABS.student;
    if (!allowed.includes(tabName)) return;
    setActiveQuiz(null);
    setActiveTab(tabName);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setActiveQuiz(null);
    setAuthView('landing');
  };

  const startQuiz = (quiz, mode) => {
    setActiveQuiz(quiz);
    setQuizMode(mode);
    setCurrentQuestionIdx(0);
    setSelectedOption(null);
    setShowExplanation(false);
    setScore(0);
    setHearts(3);
    setStreak(0);
    setQuizFinished(false);
    setGameOver(false);
    setTimeLeft(getQuizTimeLimit(quiz));
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
        setHearts(h => {
          const next = h - 1;
          if (next <= 0) setGameOver(true);
          return next;
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
    }
  };

  if (!user) {
    if (authView === 'landing') {
      return <LandingPage onGoLogin={() => setAuthView('login')} onGoRegister={() => setAuthView('register')} />;
    }
    return <AuthForm authView={authView} setAuthView={setAuthView} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
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
          <StudentDashboard grade={studentGrade} quizzes={quizzes} startQuiz={startQuiz} />
        )}

        {activeTab === 'olevel' && (
          <OLevelArena quizzes={quizzes} startQuiz={startQuiz} onOpenDiagramUpload={() => setShowDiagramUploadModal(true)} />
        )}

        {activeTab === 'leaderboard' && (
          <LeaderboardTab profiles={allProfiles} />
        )}

        {activeTab === 'library' && (
          <LibraryTab
            role={role} books={books} setBooks={setBooks}
            coins={coins} setCoins={setCoins} setXp={setXp}
            readingHours={readingHours} setReadingHours={setReadingHours}
            claimedCodes={claimedCodes} setClaimedCodes={setClaimedCodes}
          />
        )}

        {activeTab === 'shop' && (
          <ShopTab
            role={role} authName={authName} studentGrade={studentGrade}
            shopItems={shopItems} setShopItems={setShopItems}
            coins={coins} setCoins={setCoins}
            orders={orders} setOrders={setOrders}
          />
        )}

        {activeTab === 'studio' && (
          <TeacherStudio
            role={role} quizzes={quizzes} setQuizzes={setQuizzes}
            showDiagramUploadModal={showDiagramUploadModal} setShowDiagramUploadModal={setShowDiagramUploadModal}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileTab authName={authName} role={role} coins={coins} xp={xp} readingHours={readingHours} user={user} />
        )}
      </main>

      {showDiagramUploadModal && (
        <DiagramUploadModal quizzes={quizzes} setQuizzes={setQuizzes} onClose={() => setShowDiagramUploadModal(false)} />
      )}

      {activeQuiz && (
        <QuizRunnerModal
          activeQuiz={activeQuiz} quizMode={quizMode} currentQuestionIdx={currentQuestionIdx}
          hearts={hearts} timeLeft={timeLeft} streak={streak} selectedOption={selectedOption}
          showExplanation={showExplanation} score={score} quizFinished={quizFinished} gameOver={gameOver}
          handleAnswerSubmit={handleAnswerSubmit} nextQuestion={nextQuestion} startQuiz={startQuiz}
          onClose={() => setActiveQuiz(null)}
        />
      )}
    </div>
  );
}