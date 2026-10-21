import React, { useState } from 'react';
import { Sparkles, ArrowRight, ShieldCheck, GraduationCap } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ALL_SUBJECTS } from '../utils/helpers';

export function LandingPage({ onGoLogin, onGoRegister }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between font-sans">
      <header className="max-w-7xl w-full mx-auto px-6 py-6 flex items-center justify-between border-b border-slate-200/60 bg-white">
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-600 p-2.5 rounded-2xl shadow-md text-white">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">EduSpark <span className="text-indigo-600">IQ</span></h1>
            <p className="text-[10px] text-slate-500 font-medium">Digital School & Examination Portal</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button onClick={onGoLogin} className="text-slate-600 hover:text-slate-900 font-bold px-4 py-2 text-xs transition">
            Sign In
          </button>
          <button onClick={onGoRegister} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-md transition">
            Create Account
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-16 text-center space-y-8 my-auto">
        <span className="bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold px-4 py-1.5 rounded-full text-xs uppercase tracking-widest inline-block shadow-xs">
          Interactive Curriculum & Examination System
        </span>

        <h1 className="text-4xl sm:text-6xl font-black text-slate-900 leading-tight tracking-tight">
          Master Cambridge O-Levels & <span className="text-indigo-600">Dhivehi Curriculum</span>
        </h1>

        <p className="text-slate-600 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
          Diagram MCQs, Gamified Coin Rewards, Live E-Library with Thaana font support, and Teacher Topic Diagnostic Analytics.
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
          <button onClick={onGoRegister} className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-black px-8 py-4 rounded-2xl text-sm shadow-lg transition flex items-center justify-center space-x-2">
            <span>Get Started Free</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button onClick={onGoLogin} className="w-full sm:w-auto bg-white hover:bg-slate-100 text-slate-800 font-bold px-8 py-4 rounded-2xl text-sm border border-slate-300 shadow-xs transition">
            Sign In Existing Account
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-12 text-left">
          <div className="bg-white border border-slate-200 p-6 rounded-3xl space-y-2 shadow-xs">
            <GraduationCap className="w-8 h-8 text-indigo-600 mb-2" />
            <h3 className="font-bold text-slate-900 text-base">Cambridge O-Level Papers</h3>
            <p className="text-xs text-slate-500 leading-relaxed">Full timed exam simulation featuring optical ray and force vector diagram questions.</p>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-3xl space-y-2 shadow-xs">
            <Sparkles className="w-8 h-8 text-amber-500 mb-2" />
            <h3 className="font-bold text-slate-900 text-base">Library Claim Codes</h3>
            <p className="text-xs text-slate-500 leading-relaxed">Read textbooks, enter unique claim codes, and earn Edu Points on the student leaderboard.</p>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-3xl space-y-2 shadow-xs">
            <ShieldCheck className="w-8 h-8 text-emerald-600 mb-2" />
            <h3 className="font-bold text-slate-900 text-base">Teacher Diagnostics & CRUD</h3>
            <p className="text-xs text-slate-500 leading-relaxed">Teachers can publish JSON/Diagram papers, play test quizzes, and inspect weak student topics.</p>
          </div>
        </div>
      </main>

      <footer className="text-center py-6 text-xs text-slate-400 border-t border-slate-200 bg-white">
        © 2026 EduSpark IQ Academic Portal. All Rights Reserved.
      </footer>
    </div>
  );
}

export function AuthForm({ authView, setAuthView }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [registerRole, setRegisterRole] = useState('student'); // Only Student or Teacher
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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-8 space-y-6 shadow-xl">
        <div className="text-center space-y-2">
          <div className="bg-indigo-50 text-indigo-600 p-3 rounded-2xl w-12 h-12 flex items-center justify-center mx-auto border border-indigo-100">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">
            {authView === 'login' ? 'Sign In' : 'Register Account'}
          </h2>
          <p className="text-xs text-slate-500">EduSpark IQ Learning Portal</p>
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
                <label className="text-xs font-bold text-slate-700 block mb-1">Select Role</label>
                <select
                  value={registerRole}
                  onChange={(e) => setRegisterRole(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-indigo-700"
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                </select>
              </div>

              {registerRole === 'student' && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Grade</label>
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