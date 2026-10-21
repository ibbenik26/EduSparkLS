import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import confetti from 'canvas-confetti';
import {
  Trophy, Coins, Heart, Sparkles, BookOpen, LogOut,
  Clock, BrainCircuit, GraduationCap, Upload, Lock,
  ShoppingBag, Award, User, Library, Plus, Shield, Settings, KeyRound,
  ShieldAlert, Play, ArrowRight, Mail, Eye, EyeOff, Image as ImageIcon
} from 'lucide-react';

import {
  ALL_SUBJECTS, ROLE_TABS, getDefaultTabForRole,
  getQuizTimeLimit, playSound, getStudentRank
} from './utils/helpers';

import { INITIAL_QUIZZES, INITIAL_BOOKS, INITIAL_SHOP_ITEMS } from './data/initialData';

import TeacherStudentTracker from './components/TeacherStudentTracker';
import DiagramUploadModal from './components/DiagramUploadModal';
import QuizRunnerModal from './components/QuizRunnerModal';

export default function App() {
  const [authView, setAuthView] = useState('landing');
  const [isPasswordResetFlow, setIsPasswordResetFlow] = useState(false);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('student');
  const [teacherSubject, setTeacherSubject] = useState('Physics');

  const [registerRole, setRegisterRole] = useState('student');
  const [adminPasscode, setAdminPasscode] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [indexNumber, setIndexNumber] = useState('');
  const [registerSubject, setRegisterSubject] = useState('Physics');
  const [authLoading, setAuthLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [newRecoveryPassword, setNewRecoveryPassword] = useState('');

  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [forcedNewPassword, setForcedNewPassword] = useState('');
  const [confirmForcedPassword, setConfirmForcedPassword] = useState('');
  const [profileNewPassword, setProfileNewPassword] = useState('');

  const [studentGrade, setStudentGrade] = useState(7);
  const [coins, setCoins] = useState(350);
  const [xp, setXp] = useState(420);
  const [readingHours, setReadingHours] = useState(5.5);

  const [quizzes, setQuizzes] = useState(INITIAL_QUIZZES);
  const [books, setBooks] = useState(INITIAL_BOOKS);
  const [shopItems, setShopItems] = useState(INITIAL_SHOP_ITEMS);
  const [orders, setOrders] = useState([]);
  const [allProfiles, setAllProfiles] = useState([]);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [olevelSubjectFilter, setOlevelSubjectFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

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

  const [studioGrade, setStudioGrade] = useState(10);
  const [studioSubject, setStudioSubject] = useState('Physics');
  const [studioVariant, setStudioVariant] = useState('Paper 12');

  const [draftTopic, setDraftTopic] = useState('Optics & Light Rays');
  const [draftQuestionText, setDraftQuestionText] = useState('');
  const [draftOptA, setDraftOptA] = useState('');
  const [draftOptB, setDraftOptB] = useState('');
  const [draftOptC, setDraftOptC] = useState('');
  const [draftOptD, setDraftOptD] = useState('');
  const [draftCorrectOpt, setDraftCorrectOpt] = useState('A');
  const [draftExplanation, setDraftExplanation] = useState('');
  const [draftDiagramImage, setDraftDiagramImage] = useState(null);
  const [stagedQuestions, setStagedQuestions] = useState([]);

  const [showDiagramUploadModal, setShowDiagramUploadModal] = useState(false);

  const handleImageFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert("❌ Please select a valid image file (PNG, JPG, SVG, WebP).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setDraftDiagramImage(uploadEvent.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleAddQuestionToStage = (e) => {
    e.preventDefault();
    if (!draftQuestionText.trim() || !draftOptA || !draftOptB) {
      alert("Please provide question text and options A & B.");
      return;
    }

    const newQuestion = {
      id: `q_${Date.now()}_${stagedQuestions.length + 1}`,
      topic: draftTopic || studioSubject,
      diagram_url: draftDiagramImage || null,
      question_text: draftQuestionText,
      option_a: draftOptA,
      option_b: draftOptB,
      option_c: draftOptC || 'None of the above',
      option_d: draftOptD || 'All of the above',
      correct_option: draftCorrectOpt,
      explanation: draftExplanation || 'Option verified against subject scheme.'
    };

    setStagedQuestions([...stagedQuestions, newQuestion]);
    setDraftQuestionText('');
    setDraftOptA('');
    setDraftOptB('');
    setDraftOptC('');
    setDraftOptD('');
    setDraftExplanation('');
    setDraftDiagramImage(null);
  };

  const handlePublishStagedQuiz = () => {
    if (stagedQuestions.length === 0) {
      alert("⚠️ Please add at least 1 question to the staged list before publishing.");
      return;
    }

    const hasDiagrams = stagedQuestions.some(q => !!q.diagram_url);

    const newQuiz = {
      id: `quiz_${Date.now()}`,
      title: `Grade ${studioGrade} ${studioSubject} Exam Paper (${studioVariant})`,
      subject: studioSubject,
      grade: parseInt(studioGrade),
      subject_code: '0625',
      exam_year: 2026,
      variant: studioVariant,
      is_past_paper: true,
      has_diagrams: hasDiagrams,
      questions: stagedQuestions
    };

    setQuizzes([newQuiz, ...quizzes]);
    setStagedQuestions([]);
    setShowDiagramUploadModal(false);
    alert(`🎉 Quiz Successfully Published with ${stagedQuestions.length} Questions!`);
  };

  useEffect(() => {
    const allowedTabs = ROLE_TABS[role] || ROLE_TABS.student;
    if (!allowedTabs.includes(activeTab)) {
      setActiveTab(getDefaultTabForRole(role));
    }
  }, [role, activeTab]);

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

  useEffect(() => {
    if (window.location.hash && window.location.hash.includes('type=recovery')) {
      setIsPasswordResetFlow(true);
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchUserProfile(session.user);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsPasswordResetFlow(true);
      } else if (session?.user) {
        setUser(session.user);
        fetchUserProfile(session.user);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (authUser) => {
    const userId = authUser?.id;
    if (!userId) return;

    try {
      const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
      const metadataRole = authUser?.user_metadata?.role;
      const dbRole = data?.role;

      let effectiveRole = 'student';
      if (metadataRole && metadataRole !== 'student') {
        effectiveRole = metadataRole;
      } else if (dbRole) {
        effectiveRole = dbRole;
      }

      setAuthName(data?.full_name || authUser?.user_metadata?.full_name || 'User');
      setRole(effectiveRole);
      setTeacherSubject(data?.teacher_subject || authUser?.user_metadata?.teacher_subject || 'Physics');
      setStudentGrade(data?.grade || authUser?.user_metadata?.grade || 7);
      setCoins(data?.coins ?? 350);
      setXp(data?.xp ?? 420);
      setReadingHours(data?.reading_hours ?? 5.5);

      if (data?.must_change_password) {
        setMustChangePassword(true);
      }

      setActiveTab(getDefaultTabForRole(effectiveRole));
    } catch (e) {
      console.warn("Profile fetch error:", e);
    }
  };

  useEffect(() => {
    let countdownInterval = null;
    if (activeQuiz && !quizFinished && !gameOver && (quizMode === 'challenge' || quizMode === 'olevel')) {
      countdownInterval = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            clearInterval(countdownInterval);
            setGameOver(true);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(countdownInterval);
  }, [activeQuiz, quizFinished, gameOver, quizMode]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!authEmail || !authPassword) return alert('Please enter email and password.');
    setAuthLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password: authPassword
      });
      if (error) throw error;
    } catch (err) {
      alert("Login Error: " + err.message);
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

    const limit = getQuizTimeLimit(quiz);
    setTimeLeft(limit);
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
          const nextHearts = h - 1;
          if (nextHearts <= 0) {
            setGameOver(true);
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
      confetti({ particleCount: 100 });
      const earnedCoins = score * 15;
      const earnedXp = score * 30;
      setCoins(c => c + earnedCoins);
      setXp(x => x + earnedXp);
    }
  };

  const gradePracticeQuizzes = quizzes.filter(q => q.grade === parseInt(studentGrade) && (selectedSubject === 'All' || q.subject === selectedSubject));
  
  const olevelPastPapers = quizzes.filter(q => {
    if (!q.is_past_paper) return false;
    if (olevelSubjectFilter === 'Diagrams') {
      return q.has_diagrams || q.questions?.some(item => !!item.diagram_url);
    }
    return olevelSubjectFilter === 'All' || q.subject === olevelSubjectFilter;
  });

  const currentRank = getStudentRank(xp);

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between font-sans relative">
        <header className="max-w-7xl w-full mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer">
            <div className="bg-gradient-to-tr from-indigo-500 to-purple-600 p-2.5 rounded-2xl shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white">EduSpark <span className="text-indigo-400">IQ</span></h1>
              <p className="text-[10px] text-slate-400 font-mono">School Portal & E-Library</p>
            </div>
          </div>

          <button onClick={() => setAuthView('login')} className="bg-indigo-600 text-white font-bold px-5 py-2 rounded-xl text-xs">
            Sign In
          </button>
        </header>

        <main className="max-w-md w-full mx-auto px-6 py-8 flex-1 flex flex-col justify-center">
          <div className="bg-slate-800 border border-slate-700 p-8 rounded-3xl space-y-6">
            <h2 className="text-2xl font-black text-white text-center">Sign In</h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="email"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                placeholder="user@school.edu"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white"
                required
              />
              <input
                type="password"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white"
                required
              />
              <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl text-xs">
                {authLoading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-black text-slate-900">EduSpark <span className="text-indigo-600">IQ</span></h1>
          <div className="flex items-center space-x-3">
            <button onClick={() => navigateToTab('profile')} className="p-2 rounded-xl bg-slate-100 text-xs font-bold">
              {authName}
            </button>
            <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-slate-700">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* RESPONSIVE SCROLLABLE NAVIGATION BAR */}
        <div className="bg-slate-50 border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-4 flex items-center space-x-2 overflow-x-auto py-2 scrollbar-none whitespace-nowrap">
            <button
              onClick={() => navigateToTab('dashboard')}
              className={`px-3 py-1.5 font-bold rounded-xl text-xs shrink-0 ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white' : 'text-slate-600'}`}
            >
              Grade {studentGrade} Vault
            </button>
            <button
              onClick={() => navigateToTab('olevel')}
              className={`px-3 py-1.5 font-bold rounded-xl text-xs shrink-0 ${activeTab === 'olevel' ? 'bg-purple-600 text-white' : 'text-slate-600'}`}
            >
              O-Level Arena
            </button>
            <button
              onClick={() => navigateToTab('studio')}
              className={`px-3 py-1.5 font-bold rounded-xl text-xs shrink-0 ${activeTab === 'studio' ? 'bg-purple-600 text-white' : 'text-slate-600'}`}
            >
              Teacher Studio
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <h3 className="text-xl font-black text-slate-900">Grade {studentGrade} Practice Vault</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {gradePracticeQuizzes.map((quiz) => (
                <div key={quiz.id} className="bg-white border rounded-3xl p-5 space-y-3">
                  <h3 className="font-bold text-slate-900">{quiz.title}</h3>
                  <button onClick={() => startQuiz(quiz, 'practice')} className="w-full bg-indigo-600 text-white py-2 rounded-xl text-xs font-bold">
                    Start Practice Mode
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'olevel' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-purple-900 text-white p-6 rounded-3xl">
              <h2 className="text-2xl font-black">Cambridge O-Level Exam Arena</h2>
              <button onClick={() => setShowDiagramUploadModal(true)} className="bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs">
                ➕ Upload Diagram MCQ
              </button>
            </div>

            <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none whitespace-nowrap">
              <button
                onClick={() => setOlevelSubjectFilter('All')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 ${olevelSubjectFilter === 'All' ? 'bg-purple-600 text-white' : 'bg-white border'}`}
              >
                All Papers
              </button>
              <button
                onClick={() => setOlevelSubjectFilter('Diagrams')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 flex items-center space-x-1 ${olevelSubjectFilter === 'Diagrams' ? 'bg-amber-500 text-white' : 'bg-amber-50 border border-amber-200 text-amber-800'}`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>📐 Diagram MCQs Tab</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {olevelPastPapers.map((paper) => (
                <div key={paper.id} className="bg-white border rounded-3xl p-6 space-y-3">
                  <h3 className="font-black text-slate-900">{paper.title}</h3>
                  <button onClick={() => startQuiz(paper, 'olevel')} className="w-full bg-purple-600 text-white py-3 rounded-2xl text-xs font-bold">
                    Begin Timed Cambridge Exam
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'studio' && (
          <TeacherStudentTracker subjects={ALL_SUBJECTS} />
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