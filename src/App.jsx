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
  const [allProfiles, setAllProfiles] = useState([]);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [olevelSubjectFilter, setOlevelSubjectFilter] = useState('All');

  // Quiz Runner Modal State
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

  // Diagram Modal State
  const [showDiagramUploadModal, setShowDiagramUploadModal] = useState(false);
  const [studioSubject, setStudioSubject] = useState('Physics');
  const [studioVariant, setStudioVariant] = useState('Paper 12');
  const [draftDiagramImage, setDraftDiagramImage] = useState(null);
  const [draftQuestionText, setDraftQuestionText] = useState('');
  const [draftOptA, setDraftOptA] = useState('');
  const [draftOptB, setDraftOptB] = useState('');
  const [draftOptC, setDraftOptC] = useState('');
  const [draftOptD, setDraftOptD] = useState('');
  const [draftCorrectOpt, setDraftCorrectOpt] = useState('A');
  const [stagedQuestions, setStagedQuestions] = useState([]);

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

  const switchRolePreview = (newRole) => {
    setRole(newRole);
    setActiveTab(getDefaultTabForRole(newRole));
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

  const handleImageFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (uploadEvent) => setDraftDiagramImage(uploadEvent.target.result);
    reader.readAsDataURL(file);
  };

  const handleAddQuestionToStage = (e) => {
    e.preventDefault();
    if (!draftQuestionText.trim() || !draftOptA || !draftOptB) return alert("Fill in required fields.");

    const newQ = {
      id: `q_${Date.now()}`,
      topic: studioSubject,
      diagram_url: draftDiagramImage || null,
      question_text: draftQuestionText,
      option_a: draftOptA,
      option_b: draftOptB,
      option_c: draftOptC || 'None',
      option_d: draftOptD || 'All',
      correct_option: draftCorrectOpt,
      explanation: 'Verified against subject mark scheme.'
    };

    setStagedQuestions([...stagedQuestions, newQ]);
    setDraftQuestionText('');
    setDraftOptA('');
    setDraftOptB('');
    setDraftOptC('');
    setDraftOptD('');
    setDraftDiagramImage(null);
  };

  const handlePublishStagedQuiz = () => {
    if (stagedQuestions.length === 0) return alert("Add at least 1 question first.");

    const newQuiz = {
      id: `quiz_${Date.now()}`,
      title: `Grade 10 ${studioSubject} MCQ Paper (${studioVariant})`,
      subject: studioSubject,
      grade: 10,
      subject_code: '0625',
      exam_year: 2026,
      variant: studioVariant,
      is_past_paper: true,
      has_diagrams: stagedQuestions.some(q => !!q.diagram_url),
      questions: stagedQuestions
    };

    setQuizzes([newQuiz, ...quizzes]);
    setStagedQuestions([]);
    setShowDiagramUploadModal(false);
    alert("🎉 Diagram Quiz Published!");
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
          <StudentDashboard
            grade={studentGrade}
            quizzes={quizzes}
            selectedSubject={selectedSubject}
            setSelectedSubject={setSelectedSubject}
            startQuiz={startQuiz}
          />
        )}

        {activeTab === 'olevel' && (
          <OLevelArena
            quizzes={quizzes}
            olevelSubjectFilter={olevelSubjectFilter}
            setOlevelSubjectFilter={setOlevelSubjectFilter}
            startQuiz={startQuiz}
            onOpenDiagramUpload={() => setShowDiagramUploadModal(true)}
          />
        )}

        {activeTab === 'leaderboard' && (
          <LeaderboardTab profiles={allProfiles} />
        )}

        {activeTab === 'library' && (
          <LibraryTab
            books={books}
            coins={coins}
            setCoins={setCoins}
            setXp={setXp}
            claimedCodes={claimedCodes}
            setClaimedCodes={setClaimedCodes}
          />
        )}

        {activeTab === 'shop' && (
          <ShopTab shopItems={shopItems} coins={coins} setCoins={setCoins} />
        )}

        {activeTab === 'studio' && (
          <TeacherStudio
            role={role}
            quizzes={quizzes} setQuizzes={setQuizzes}
            startQuiz={startQuiz}
            studioSubject={studioSubject} setStudioSubject={setStudioSubject}
            studioVariant={studioVariant} setStudioVariant={setStudioVariant}
            showDiagramUploadModal={showDiagramUploadModal}
            setShowDiagramUploadModal={setShowDiagramUploadModal}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileTab
            authName={authName} role={role} switchRolePreview={switchRolePreview}
            coins={coins} xp={xp} readingHours={readingHours} user={user}
          />
        )}
      </main>

      {showDiagramUploadModal && (
        <DiagramUploadModal
          studioSubject={studioSubject} setStudioSubject={setStudioSubject}
          studioVariant={studioVariant} setStudioVariant={setStudioVariant}
          draftDiagramImage={draftDiagramImage} setDraftDiagramImage={setDraftDiagramImage}
          draftQuestionText={draftQuestionText} setDraftQuestionText={setDraftQuestionText}
          draftOptA={draftOptA} setDraftOptA={setDraftOptA}
          draftOptB={draftOptB} setDraftOptB={setDraftOptB}
          draftOptC={draftOptC} setDraftOptC={setDraftOptC}
          draftOptD={draftOptD} setDraftOptD={setDraftOptD}
          draftCorrectOpt={draftCorrectOpt} setDraftCorrectOpt={setDraftCorrectOpt}
          stagedQuestions={stagedQuestions}
          handleImageFileUpload={handleImageFileUpload}
          handleAddQuestionToStage={handleAddQuestionToStage}
          handlePublishStagedQuiz={handlePublishStagedQuiz}
          allSubjects={ALL_SUBJECTS}
          onClose={() => setShowDiagramUploadModal(false)}
        />
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