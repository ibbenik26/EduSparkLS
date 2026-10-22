import React, { useState } from 'react';
import { Sparkles, ArrowRight, ShieldCheck, GraduationCap, CheckCircle, BookOpen, Star, Phone, Mail, Users, Award, Play } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ALL_SUBJECTS } from '../utils/helpers';

export function LandingPage({ onGoLogin, onGoRegister }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Top Announcement & Support Bar */}
      <div className="bg-slate-900 text-slate-300 text-[11px] py-2 px-6 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center space-x-4">
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
          <div className="flex items-center space-x-3 text-slate-400 font-bold">
            <span className="bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full text-[10px] border border-emerald-500/30">
              🟢 Live Portal 2026
            </span>
            <span>Maldives Digital Learning Platform</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Header */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={onGoRegister}>
            <div className="bg-gradient-to-tr from-indigo-600 to-purple-600 p-2.5 rounded-2xl shadow-sm text-white">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center">
                EduSpark<span className="text-indigo-600">⚡</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-semibold tracking-wide">Academic Operating System</p>
            </div>
          </div>

          <div className="hidden lg:flex items-center space-x-8 text-xs font-bold text-slate-700">
            <a href="#hero" className="hover:text-indigo-600 transition">Home</a>
            <a href="#categories" className="hover:text-indigo-600 transition">Categories</a>
            <a href="#about" className="hover:text-indigo-600 transition">About Us</a>
            <a href="#courses" className="hover:text-indigo-600 transition">Popular Curriculum</a>
          </div>

          <div className="flex items-center space-x-3">
            <button onClick={onGoLogin} className="text-slate-700 hover:text-indigo-600 font-bold px-4 py-2 text-xs transition">
              Sign In
            </button>
            <button onClick={onGoRegister} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-md transition flex items-center space-x-1">
              <span>Try for Free</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 space-y-20 pb-16">
        {/* Hero Section */}
        <section id="hero" className="max-w-7xl mx-auto px-6 pt-12 sm:pt-20 text-center space-y-8">
          <span className="bg-indigo-50 border border-indigo-200 text-indigo-700 font-black px-4 py-1.5 rounded-full text-xs uppercase tracking-widest inline-block shadow-xs">
            The Best Academic Program To Enroll For ⚡
          </span>

          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 leading-tight tracking-tight max-w-4xl mx-auto">
            Empowering Excellence in Cambridge O-Levels & <span className="text-indigo-600">Dhivehi Curriculum</span>
          </h1>

          <p className="text-slate-600 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            Interactive diagram MCQs, gamified coin rewards, digital library auto-rewards with Faruma Thaana font support, and teacher grade store management.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-2">
            <button onClick={onGoRegister} className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-black px-8 py-4 rounded-2xl text-sm shadow-lg transition flex items-center justify-center space-x-2">
              <span>Enroll For Free</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button onClick={onGoLogin} className="w-full sm:w-auto bg-white hover:bg-slate-100 text-slate-800 font-bold px-8 py-4 rounded-2xl text-sm border border-slate-300 shadow-xs transition">
              Sign In Existing Account
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8">
            <div className="bg-white border border-slate-200 p-4 rounded-2xl text-center shadow-xs">
              <span className="text-2xl font-black text-indigo-600 block">10+</span>
              <span className="text-[11px] text-slate-500 font-bold">Grade Levels (1-10)</span>
            </div>
            <div className="bg-white border border-slate-200 p-4 rounded-2xl text-center shadow-xs">
              <span className="text-2xl font-black text-purple-600 block">0625 / 4024</span>
              <span className="text-[11px] text-slate-500 font-bold">Cambridge O-Level Papers</span>
            </div>
            <div className="bg-white border border-slate-200 p-4 rounded-2xl text-center shadow-xs">
              <span className="text-2xl font-black text-emerald-600 block">MV Faruma</span>
              <span className="text-[11px] text-slate-500 font-bold">Dhivehi Thaana RTL Font</span>
            </div>
            <div className="bg-white border border-slate-200 p-4 rounded-2xl text-center shadow-xs">
              <span className="text-2xl font-black text-amber-500 block">100%</span>
              <span className="text-[11px] text-slate-500 font-bold">Grade Lock Voucher Store</span>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section id="categories" className="max-w-7xl mx-auto px-6 space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Core Categories</span>
            <h2 className="text-3xl font-black text-slate-900">Online Learning & Skill Programs</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white border border-slate-200 p-6 rounded-3xl space-y-3 shadow-xs hover:border-indigo-300 transition">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-black">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Class Practice Vault</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Grade-filtered syllabus practice for Grade 1 through Grade 10 students.</p>
            </div>

            <div className="bg-white border border-slate-200 p-6 rounded-3xl space-y-3 shadow-xs hover:border-purple-300 transition">
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center font-black">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Cambridge O-Level Arena</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Timed past paper simulations with optics ray diagrams and mechanics physics models.</p>
            </div>

            <div className="bg-white border border-slate-200 p-6 rounded-3xl space-y-3 shadow-xs hover:border-emerald-300 transition">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center font-black">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">E-Library & Librarian Codes</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Dual reading mode: Live auto-timer online reader vs. physical book librarian voucher code claim.</p>
            </div>

            <div className="bg-white border border-slate-200 p-6 rounded-3xl space-y-3 shadow-xs hover:border-amber-300 transition">
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center font-black">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Teacher Grade Stores</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Teachers create class stores with photo uploads and grade-locked voucher codes (e.g. GR7-XXXX).</p>
            </div>
          </div>
        </section>

        {/* About Us Section */}
        <section id="about" className="bg-slate-900 text-white py-16">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
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

            <div className="bg-slate-800/80 border border-slate-700 p-8 rounded-3xl space-y-6 shadow-xl">
              <div className="flex items-center space-x-3">
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
        <section id="courses" className="max-w-7xl mx-auto px-6 space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Popular Curriculum Papers</span>
            <h2 className="text-3xl font-black text-slate-900">Pick A Syllabus To Get Started</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 hover:shadow-md transition">
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

            <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 hover:shadow-md transition">
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

            <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 hover:shadow-md transition">
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
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-8 space-y-6 shadow-xl">
        <div className="text-center space-y-2">
          <div className="bg-indigo-50 text-indigo-600 p-3 rounded-2xl w-12 h-12 flex items-center justify-center mx-auto border border-indigo-100">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">
            {authView === 'login' ? 'Sign In to EduSpark⚡' : 'Register Account'}
          </h2>
          <p className="text-xs text-slate-500">Digital School Portal Access</p>
        </div>

        <form onSubmit={handleAuthSubmit} className="space-y-4">
          {authView === 'register' && (
            <>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Aminath Hassan"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 font-medium"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Account Role</label>
                <select
                  value={registerRole}
                  onChange={(e) => setRegisterRole(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-indigo-700"
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher (Can CRUD Quizzes & Grade Store)</option>
                </select>
              </div>

              {registerRole === 'student' && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Grade Level</label>
                    <select
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 font-medium"
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
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 font-medium"
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
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 font-medium"
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
                      className="w-full bg-amber-50/50 border border-amber-300 rounded-xl p-3 text-xs text-slate-900"
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
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 font-medium"
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
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 font-medium"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl text-xs shadow-md transition"
          >
            {loading ? 'Processing...' : authView === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="flex justify-between items-center text-xs text-slate-500 border-t border-slate-100 pt-4">
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