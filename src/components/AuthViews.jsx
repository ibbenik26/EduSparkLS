import React, { useState } from 'react';
import { Sparkles, ArrowRight, ShieldCheck, GraduationCap, CheckCircle, BookOpen, Star, Phone, Mail, Users, Award, Play, Menu, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ALL_SUBJECTS } from '../utils/helpers';

export function LandingPage({ onGoLogin, onGoRegister }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-indigo-50/60 text-slate-800 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top Announcement & Support Bar */}
      <div className="bg-slate-950 text-slate-300 text-[10px] sm:text-[11px] py-2 px-3 sm:py-2.5 sm:px-6 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-1.5 sm:gap-2 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1">
            <span className="flex items-center space-x-1.5 text-indigo-400 font-medium">
              <Phone className="w-3.5 h-3.5" />
              <span>Online Support: +960 332-1234</span>
            </span>
            <span className="hidden md:inline text-slate-600">|</span>
            <span className="hidden md:flex items-center space-x-1.5 text-slate-400">
              <Mail className="w-3.5 h-3.5" />
              <span>support@eduspark.edu.mv</span>
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-slate-400 font-bold text-center">
            <span className="bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full text-[10px] border border-emerald-500/30">
              🟢 Live Portal 2026
            </span>
            <span>Maldives Digital Learning Platform</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Header */}
      <header className="bg-white/90 backdrop-blur-xl border-b border-slate-200/80 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto w-full px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 cursor-pointer" onClick={onGoRegister}>
            <div className="bg-gradient-to-tr from-indigo-600 via-violet-600 to-purple-600 p-2 sm:p-2.5 rounded-xl sm:rounded-2xl shadow-lg shadow-indigo-600/25 text-white ring-1 ring-white/30 shrink-0">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h1 className="text-base sm:text-xl font-black text-slate-950 tracking-tight flex items-center whitespace-nowrap">
                EduSpark<span className="text-indigo-600">⚡</span>
              </h1>
              <p className="hidden xs:block text-[9px] sm:text-[10px] text-slate-500 font-semibold tracking-wide">Academic Operating System</p>
            </div>
          </div>

          <nav aria-label="Main navigation" className="hidden lg:flex items-center space-x-8 text-xs font-bold text-slate-700">
            <a href="#hero" className="hover:text-indigo-600 transition">Home</a>
            <a href="#categories" className="hover:text-indigo-600 transition">Categories</a>
            <a href="#about" className="hover:text-indigo-600 transition">About Us</a>
            <a href="#courses" className="hover:text-indigo-600 transition">Popular Curriculum</a>
          </nav>

          <div className="flex items-center gap-1 sm:gap-3 shrink-0">
            <button onClick={onGoLogin} className="text-slate-700 hover:text-indigo-700 font-bold px-2.5 sm:px-4 py-2.5 text-[11px] sm:text-xs transition-colors rounded-xl hover:bg-indigo-50 min-h-10">
              Sign In
            </button>
            <button onClick={onGoRegister} className="hidden min-[360px]:flex bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-bold px-3 sm:px-5 py-3 rounded-xl text-[11px] sm:text-xs shadow-lg shadow-indigo-600/20 transition-all items-center gap-1 min-h-10 whitespace-nowrap">
              <span>Try for Free</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="eduspark-mobile-navigation"
              onClick={() => setMobileMenuOpen(open => !open)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <nav id="eduspark-mobile-navigation" aria-label="Mobile navigation" className="lg:hidden border-t border-slate-200 bg-white px-4 py-3 shadow-lg">
            <div className="mx-auto max-w-7xl flex flex-col gap-1">
              <a href="#hero" onClick={closeMobileMenu} className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700">Home</a>
              <a href="#categories" onClick={closeMobileMenu} className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700">Categories</a>
              <a href="#about" onClick={closeMobileMenu} className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700">About Us</a>
              <a href="#courses" onClick={closeMobileMenu} className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700">Popular Curriculum</a>
              <div className="grid grid-cols-2 gap-2 border-t border-slate-100 mt-2 pt-3">
                <button onClick={() => { closeMobileMenu(); onGoLogin(); }} className="rounded-xl border border-slate-200 px-3 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50">Sign In</button>
                <button onClick={() => { closeMobileMenu(); onGoRegister(); }} className="rounded-xl bg-indigo-600 px-3 py-3 text-sm font-bold text-white hover:bg-indigo-700">Try for Free</button>
              </div>
            </div>
          </nav>
        )}
      </header>

      <main className="flex-1 space-y-12 sm:space-y-20 pb-10 sm:pb-16">
        {/* Hero Section */}
        <section id="hero" className="max-w-7xl mx-auto px-3 sm:px-6 pt-9 sm:pt-24 text-center space-y-5 sm:space-y-8">
          <span className="bg-white border border-indigo-200 text-indigo-700 font-black px-4 py-2 rounded-full text-[10px] sm:text-xs uppercase tracking-widest inline-flex items-center gap-2 shadow-sm shadow-indigo-100">
            The Best Academic Program To Enroll For ⚡
          </span>

          <h1 className="text-[2rem] min-[380px]:text-4xl sm:text-6xl lg:text-7xl font-black text-slate-950 leading-[1.12] sm:leading-[1.08] tracking-tight max-w-5xl mx-auto break-words">
            Empowering Excellence in Cambridge O-Levels & <span className="text-indigo-600">Dhivehi Curriculum</span>
          </h1>

          <p className="text-slate-600 max-w-2xl mx-auto text-sm sm:text-lg leading-relaxed px-1 sm:px-0">
            Interactive diagram MCQs, gamified coin rewards, digital library auto-rewards with Faruma Thaana font support, and teacher grade store management.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-stretch sm:items-center gap-3 sm:gap-4 pt-1 sm:pt-2 w-full max-w-md sm:max-w-none mx-auto">
            <button onClick={onGoRegister} className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-black px-5 sm:px-8 py-3.5 sm:py-4 rounded-2xl text-sm shadow-xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 min-h-12">
              <span>Enroll For Free</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button onClick={onGoLogin} className="w-full sm:w-auto bg-white hover:bg-slate-50 active:scale-[0.98] text-slate-800 font-bold px-5 sm:px-8 py-3.5 sm:py-4 rounded-2xl text-sm border border-slate-200 shadow-sm transition-all min-h-12">
              Sign In Existing Account
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 max-w-4xl mx-auto pt-4 sm:pt-8">
            <div className="bg-white/90 border border-slate-200/80 p-3 sm:p-5 rounded-xl sm:rounded-2xl text-center shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 min-w-0">
              <span className="text-xl sm:text-2xl font-black text-indigo-600 block break-words">10+</span>
              <span className="text-[10px] sm:text-[11px] text-slate-500 font-bold leading-tight">Grade Levels (1-10)</span>
            </div>
            <div className="bg-white/90 border border-slate-200/80 p-3 sm:p-5 rounded-xl sm:rounded-2xl text-center shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 min-w-0">
              <span className="text-lg sm:text-2xl font-black text-purple-600 block break-words">0625 / 4024</span>
              <span className="text-[10px] sm:text-[11px] text-slate-500 font-bold leading-tight">Cambridge O-Level Papers</span>
            </div>
            <div className="bg-white/90 border border-slate-200/80 p-3 sm:p-5 rounded-xl sm:rounded-2xl text-center shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 min-w-0">
              <span className="text-2xl font-black text-emerald-600 block">MV Faruma</span>
              <span className="text-[10px] sm:text-[11px] text-slate-500 font-bold leading-tight">Dhivehi Thaana RTL Font</span>
            </div>
            <div className="bg-white/90 border border-slate-200/80 p-3 sm:p-5 rounded-xl sm:rounded-2xl text-center shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 min-w-0">
              <span className="text-2xl font-black text-amber-500 block">100%</span>
              <span className="text-[10px] sm:text-[11px] text-slate-500 font-bold leading-tight">Grade Lock Voucher Store</span>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section id="categories" className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Core Categories</span>
            <h2 className="text-3xl font-black text-slate-900">Online Learning & Skill Programs</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="group bg-white border border-slate-200/80 p-6 rounded-3xl space-y-3 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-indigo-300 transition-all duration-200">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-black">
                <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Class Practice Vault</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Grade-filtered syllabus practice for Grade 1 through Grade 10 students.</p>
            </div>

            <div className="group bg-white border border-slate-200/80 p-6 rounded-3xl space-y-3 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-purple-300 transition-all duration-200">
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center font-black">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Cambridge O-Level Arena</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Timed past paper simulations with optics ray diagrams and mechanics physics models.</p>
            </div>

            <div className="group bg-white border border-slate-200/80 p-6 rounded-3xl space-y-3 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-emerald-300 transition-all duration-200">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center font-black">
                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">E-Library & Librarian Codes</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Dual reading mode: Live auto-timer online reader vs. physical book librarian voucher code claim.</p>
            </div>

            <div className="group bg-white border border-slate-200/80 p-6 rounded-3xl space-y-3 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-amber-300 transition-all duration-200">
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center font-black">
                <Award className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Teacher Grade Stores</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Teachers create class stores with photo uploads and grade-locked voucher codes (e.g. GR7-XXXX).</p>
            </div>
          </div>
        </section>

        {/* About Us Section */}
        <section id="about" className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white py-20 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div className="space-y-6">
              <span className="bg-indigo-500/20 text-indigo-300 font-bold px-3 py-1 rounded-full text-xs uppercase tracking-wider border border-indigo-400/30">
                About EduSpark Platform
              </span>
              <h2 className="text-3xl sm:text-4xl font-black leading-tight">
                Over 10 Years in Digital Education for Academic & Skill Development
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                Designed specifically for Maldivian school curriculum and international Cambridge secondary examinations. Empowers teachers with diagnostic class analytics while motivating students through gamified learning rewards.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs font-bold">
                <div className="flex items-center space-x-2 text-emerald-400">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>Expert Teacher Diagnostics</span>
                </div>
                <div className="flex items-center space-x-2 text-emerald-400">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>Dhivehi Faruma RTL Support</span>
                </div>
                <div className="flex items-center space-x-2 text-emerald-400">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>Fast JSON + Diagram Builder</span>
                </div>
                <div className="flex items-center space-x-2 text-emerald-400">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>Grade-Restricted Reward Stores</span>
                </div>
              </div>
            </div>

            <div className="bg-white/[0.06] backdrop-blur border border-white/10 p-8 rounded-3xl space-y-6 shadow-2xl shadow-black/20">
              <div className="flex items-center gap-1 sm:gap-3 shrink-0">
                <Users className="w-8 h-8 text-indigo-400" />
                <div>
                  <h3 className="font-bold text-white text-lg">Strict Security & Role Control</h3>
                  <p className="text-xs text-slate-400">Dedicated accounts for Students, Teachers, and Admins</p>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Only verified Teachers (staff passcode required) and Admins can create and edit quizzes, library books, or shop merchandise. Students enjoy a safe, focused environment locked to their designated grade level.
              </p>
              <button onClick={onGoRegister} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl text-xs transition">
                Create Student or Teacher Account
              </button>
            </div>
          </div>
        </section>

        {/* Popular Courses / Curriculum Preview */}
        <section id="courses" className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Popular Curriculum Papers</span>
            <h2 className="text-3xl font-black text-slate-900">Pick A Syllabus To Get Started</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 space-y-4 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200">
              <span className="bg-purple-50 text-purple-700 text-[10px] font-black uppercase px-2.5 py-1 rounded-md">Advanced • Cambridge O-Level</span>
              <h3 className="font-black text-slate-900 text-base">Physics 0625 - Ray & Optics Diagrams</h3>
              <div className="flex items-center space-x-1 text-amber-500 text-xs font-bold">
                <Star className="w-4 h-4 fill-amber-400" />
                <span>5.0 / 5.0 Rating • 2026 Paper 12</span>
              </div>
              <p className="text-xs text-slate-500">Includes light refraction diagrams and force vectors with step-by-step mark scheme explanations.</p>
              <button onClick={onGoRegister} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs transition">
                Start Practice Free
              </button>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 space-y-4 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200">
              <span className="bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase px-2.5 py-1 rounded-md">Intermediate • Dhivehi Curriculum</span>
              <h3 className="font-black text-slate-900 text-base font-dhivehi">ދިވެހި ބަސް - ގްރޭޑް 7 ނަންއިތުރު</h3>
              <div className="flex items-center space-x-1 text-amber-500 text-xs font-bold">
                <Star className="w-4 h-4 fill-amber-400" />
                <span>5.0 / 5.0 Rating • Grade 7</span>
              </div>
              <p className="text-xs text-slate-500"> Full Faruma Thaana font support with right-to-left alignment for grammar and literature questions.</p>
              <button onClick={onGoRegister} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs transition">
                Start Practice Free
              </button>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 space-y-4 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200">
              <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase px-2.5 py-1 rounded-md">National E-Library</span>
              <h3 className="font-black text-slate-900 text-base">Digital Textbooks & Librarian Codes</h3>
              <div className="flex items-center space-x-1 text-amber-500 text-xs font-bold">
                <Star className="w-4 h-4 fill-amber-400" />
                <span>5.0 / 5.0 Rating • Edu Points Rewards</span>
              </div>
              <p className="text-xs text-slate-500">Read textbook chapters online or claim secret voucher codes given by your school librarian.</p>
              <button onClick={onGoRegister} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs transition">
                Explore Library
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-slate-900 text-slate-400 text-xs py-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
          <div className="flex items-center space-x-2">
            <span className="text-white font-black">EduSpark<span className="text-indigo-400">⚡</span></span>
            <span>© 2026 EduSpark IQ Academic Platform. All Rights Reserved.</span>
          </div>
          <div className="flex space-x-4">
            <button onClick={onGoLogin} className="hover:text-white">Sign In</button>
            <button onClick={onGoRegister} className="hover:text-white">Register</button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function AuthForm({ authView, setAuthView }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [registerRole, setRegisterRole] = useState('student');
  const [grade, setGrade] = useState(7);
  const [indexNumber, setIndexNumber] = useState('');
  const [teacherSubject, setTeacherSubject] = useState('Physics');
  const [adminPasscode, setAdminPasscode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (authView === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else if (authView === 'register') {
        if (registerRole === 'teacher' && adminPasscode !== 'ADMIN2026') {
          alert('❌ Invalid Staff Passcode! Use passcode: ADMIN2026');
          setLoading(false);
          return;
        }

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              role: registerRole,
              grade: parseInt(grade),
              index_number: indexNumber,
              teacher_subject: teacherSubject
            }
          }
        });
        if (error) throw error;
        alert('🎉 Account created successfully! Please sign in.');
        setAuthView('login');
      }
    } catch (err) {
      alert('Authentication Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100svh] bg-gradient-to-br from-indigo-50 via-white to-violet-100 flex items-start sm:items-center justify-center p-2.5 sm:p-4 font-sans overflow-x-hidden">
      <div className="bg-white/95 backdrop-blur-xl border border-white rounded-2xl sm:rounded-3xl max-w-md w-full p-4 min-[380px]:p-5 sm:p-8 my-2 sm:my-0 space-y-5 sm:space-y-6 shadow-2xl shadow-indigo-900/10 ring-1 ring-slate-200/70">
        <div className="text-center space-y-2">
          <div className="bg-gradient-to-br from-indigo-600 to-violet-600 text-white p-3 rounded-2xl w-14 h-14 flex items-center justify-center mx-auto shadow-lg shadow-indigo-600/20">
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
            {authView === 'login' ? 'Sign In to EduSpark⚡' : 'Register Account'}
          </h2>
          <p className="text-xs text-slate-500">Digital School Portal Access</p>
        </div>

        <form onSubmit={handleAuthSubmit} className="space-y-3.5 sm:space-y-4">
          {authView === 'register' && (
            <>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Aminath Hassan"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm text-slate-900 font-medium outline-none transition focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Account Role</label>
                <select
                  value={registerRole}
                  onChange={(e) => setRegisterRole(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm font-bold text-indigo-700 outline-none transition focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher (Can CRUD Quizzes & Grade Store)</option>
                </select>
              </div>

              {registerRole === 'student' && (
                <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-3 min-[420px]:gap-2">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Grade Level</label>
                    <select
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm text-slate-900 font-medium outline-none transition focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
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
                      placeholder="STU-2026"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm text-slate-900 font-medium outline-none transition focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                      required
                    />
                  </div>
                </div>
              )}

              {registerRole === 'teacher' && (
                <>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Subject Lead</label>
                    <select
                      value={teacherSubject}
                      onChange={(e) => setTeacherSubject(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm text-slate-900 font-medium outline-none transition focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                    >
                      {ALL_SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-amber-700 block mb-1">Teacher Staff Passcode</label>
                    <input
                      type="password"
                      value={adminPasscode}
                      onChange={(e) => setAdminPasscode(e.target.value)}
                      placeholder="Enter ADMIN2026"
                      className="w-full bg-amber-50/50 border border-amber-300 rounded-xl p-3.5 text-sm text-slate-900 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
                      required
                    />
                  </div>
                </>
              )}
            </>
          )}

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@school.edu"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm text-slate-900 font-medium outline-none transition focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm text-slate-900 font-medium outline-none transition focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-bold py-3.5 rounded-xl text-sm shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : authView === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="flex justify-center items-center text-center text-xs text-slate-500 border-t border-slate-100 pt-4 pb-1">
          {authView === 'login' ? (
            <button onClick={() => setAuthView('register')} className="hover:text-indigo-600 font-bold mx-auto">
              Don't have an account? Register Here
            </button>
          ) : (
            <button onClick={() => setAuthView('login')} className="hover:text-indigo-600 font-bold mx-auto">
              Already have an account? Sign In
            </button>
          )}
        </div>
      </div>
    </div>
  );
}