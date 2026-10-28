import React, { useState } from 'react';
import { 
  Sparkles, BookOpen, Trophy, ShoppingBag, ShieldCheck, ArrowRight, 
  HeartHandshake, Building2, Gift, Check, X, Phone, Mail, User, Award, ExternalLink
} from 'lucide-react';
import { supabase } from '../lib/supabase';

export function LandingPage({ onGoLogin, onGoRegister, sponsors, setSponsors, showToast }) {
  const [showSponsorModal, setShowSponsorModal] = useState(false);

  const partnerLogos = [
    { name: 'Ministry of Education', icon: '🇲🇻', type: 'Government Partner' },
    { name: 'Bank of Maldives', icon: '🏦', type: 'Fintech Sponsor' },
    { name: 'Dhiraagu Telecom', icon: '📡', type: 'Digital Connectivity' },
    { name: 'Ooredoo Maldives', icon: '📱', type: 'EdTech Sponsor' },
    { name: 'Majeedhiyya Alumni', icon: '🎓', type: 'School Foundation' }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between font-sans relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      <header className="max-w-7xl w-full mx-auto p-6 flex justify-between items-center relative z-10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-black text-xl tracking-tight">EduSpark</span>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowSponsorModal(true)}
            className="text-slate-300 hover:text-white text-xs font-bold px-4 py-2 rounded-xl transition flex items-center space-x-1.5 bg-white/5 border border-white/10 hover:bg-white/10"
          >
            <HeartHandshake className="w-4 h-4 text-rose-400" />
            <span>Become a Partner</span>
          </button>

          <button
            onClick={onGoLogin}
            className="text-xs font-bold text-slate-300 hover:text-white px-4 py-2 rounded-xl transition"
          >
            Sign In
          </button>

          <button
            onClick={onGoRegister}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-black text-xs px-5 py-2.5 rounded-xl shadow-lg transition"
          >
            Get Started
          </button>
        </div>
      </header>

      <main className="max-w-5xl w-full mx-auto px-6 py-12 text-center space-y-8 relative z-10 my-auto">
        <span className="bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 font-bold px-4 py-1.5 rounded-full text-xs uppercase tracking-widest inline-flex items-center space-x-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>National Educational Ecosystem v2.0</span>
        </span>

        <h1 className="text-4xl sm:text-6xl font-black text-white leading-tight tracking-tight">
          Gamified Learning & Cambridge O-Level Preparation
        </h1>

        <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          Empowering students with curriculum-aligned practice vaults, 5-heart challenges, automated e-library rewards, and dynamic rank progression.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <button
            onClick={onGoRegister}
            className="w-full sm:w-auto bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 hover:opacity-95 text-white font-black px-8 py-4 rounded-2xl text-sm shadow-xl transition flex items-center justify-center space-x-2"
          >
            <span>Join as Student or Teacher</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowSponsorModal(true)}
            className="w-full sm:w-auto bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200 font-bold px-8 py-4 rounded-2xl text-sm transition flex items-center justify-center space-x-2"
          >
            <Building2 className="w-4 h-4 text-rose-400" />
            <span>Sponsor Rewards / Partner Form</span>
          </button>
        </div>

        <div className="pt-12 border-t border-slate-800/80 space-y-4">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Trusted & Supported By Secondary Education Partners
          </span>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            {partnerLogos.map((p, idx) => (
              <div
                key={idx}
                className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 px-4 py-2.5 rounded-2xl flex items-center space-x-2.5 transition"
              >
                <span className="text-xl">{p.icon}</span>
                <div className="text-left">
                  <span className="text-xs font-bold text-slate-200 block">{p.name}</span>
                  <span className="text-[9px] text-indigo-400 font-medium">{p.type}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="max-w-7xl w-full mx-auto p-6 text-center text-xs text-slate-500 border-t border-slate-900 relative z-10">
        © 2026 EduSpark Learning Platform. Designed for Maldivian Curriculum & Secondary Schools.
      </footer>

      {showSponsorModal && (
        <SponsorPartnerModal
          sponsors={sponsors}
          setSponsors={setSponsors}
          showToast={showToast}
          onClose={() => setShowSponsorModal(false)}
        />
      )}
    </div>
  );
}

function SponsorPartnerModal({ sponsors, setSponsors, showToast, onClose }) {
  const [applicantName, setApplicantName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [partnerType, setPartnerType] = useState('Parent Sponsor');
  const [contributionType, setContributionType] = useState('Physical Goods / Stationery');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newSponsorEntry = {
      id: `sp_${Date.now()}`,
      applicantName,
      email,
      phone,
      partnerType,
      contributionType,
      message,
      status: 'Pending Review ⏳',
      date: new Date().toISOString().split('T')[0]
    };

    // 1. Update React State & Local Cache
    setSponsors(prev => [newSponsorEntry, ...(prev || [])]);
    setSubmitted(true);

    // 2. Direct Sync to Supabase Table
    try {
      await supabase.from('sponsors').insert([{
        id: newSponsorEntry.id,
        applicant_name: applicantName,
        email: email,
        phone: phone,
        partner_type: partnerType,
        contribution_type: contributionType,
        message: message,
        status: 'Pending Review ⏳'
      }]);
    } catch (err) {
      console.warn("Supabase insert error (cached locally):", err);
    }

    if (showToast) showToast("🎉 Partnership Proposal Submitted!", "success");
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl relative text-left">
        <button onClick={onClose} className="absolute top-5 right-5 text-slate-400 hover:text-white p-1">
          <X className="w-5 h-5" />
        </button>

        {!submitted ? (
          <>
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-rose-400 bg-rose-500/20 px-3 py-1 rounded-full border border-rose-500/30 inline-flex items-center space-x-1.5">
                <HeartHandshake className="w-3.5 h-3.5" />
                <span>Partner & Sponsor Portal</span>
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white pt-1">Become an EduSpark Partner</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Parents, corporate sponsors, and alumni can partner with us to fund student physical merchandise, stationery rewards, or school grants.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs font-medium">
              <div>
                <label className="text-slate-300 font-bold block mb-1">Full Name / Organization Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    placeholder="e.g. Hassan Ibrahim (Parent) or Apex Maldives"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-white text-xs focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="sponsor@domain.com"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-white text-xs focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Contact Phone</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+960 790-0000"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-white text-xs focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Partner Role</label>
                  <select
                    value={partnerType}
                    onChange={(e) => setPartnerType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-indigo-300 font-bold focus:outline-none"
                  >
                    <option value="Parent Sponsor">Parent Sponsor</option>
                    <option value="Corporate Partner">Corporate Partner</option>
                    <option value="School Alumni">School Alumni</option>
                    <option value="Educational NGO">Educational NGO</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Sponsorship Type</label>
                  <select
                    value={contributionType}
                    onChange={(e) => setContributionType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-amber-300 font-bold focus:outline-none"
                  >
                    <option value="Physical Goods / Stationery">Physical Goods & Stationery</option>
                    <option value="Cash Grant / Financial Support">Cash Grant / Financial Support</option>
                    <option value="Tech Equipment & Books">Tech Equipment & Books</option>
                    <option value="Academic Excellence Award">Academic Excellence Award</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Details & Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe items you wish to donate or sponsorship details..."
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 hover:opacity-95 text-white font-black py-3.5 rounded-xl text-xs shadow-lg transition"
              >
                Submit Partnership Application 🚀
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-3xl flex items-center justify-center mx-auto border border-emerald-500/30">
              <Check className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-white">Application Received!</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                Thank you, <strong className="text-white font-bold">{applicantName}</strong>. Our school administration team will review your sponsorship proposal and reach out to you at <strong className="text-indigo-400 font-bold">{email}</strong>.
              </p>
            </div>

            <button
              onClick={onClose}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-6 py-2.5 rounded-xl text-xs transition"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function AuthForm({ authView, setAuthView, showToast }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedRole, setSelectedRole] = useState('student');
  const [studentGrade, setStudentGrade] = useState(7);
  const [teacherSubject, setTeacherSubject] = useState('Physics');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (authView === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        showToast("Welcome back!", "success");
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              role: selectedRole,
              grade: parseInt(studentGrade),
              teacher_subject: teacherSubject
            }
          }
        });
        if (error) throw error;
        showToast("Registration successful! Check email to confirm.", "success");
      }
    } catch (err) {
      showToast(err.message || "Authentication error", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4 font-sans">
      <div className="bg-slate-900 border border-slate-800 max-w-md w-full rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            {authView === 'login' ? 'Sign In to EduSpark' : 'Create Student / Teacher Account'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
          {authView === 'register' && (
            <>
              <div>
                <label className="text-slate-300 font-bold block mb-1">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Aminath Sarah"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Account Role</label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-indigo-300 font-bold focus:outline-none"
                  >
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                    <option value="shop_admin">Shop Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>

                {selectedRole === 'student' ? (
                  <div>
                    <label className="text-slate-300 font-bold block mb-1">Enrolled Grade</label>
                    <select
                      value={studentGrade}
                      onChange={(e) => setStudentGrade(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-purple-300 font-bold focus:outline-none"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(g => (
                        <option key={g} value={g}>Grade {g}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="text-slate-300 font-bold block mb-1">Teaching Subject</label>
                    <select
                      value={teacherSubject}
                      onChange={(e) => setTeacherSubject(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-indigo-300 font-bold focus:outline-none"
                    >
                      <option value="Physics">Physics</option>
                      <option value="Chemistry">Chemistry</option>
                      <option value="Maths">Maths</option>
                      <option value="Dhivehi">Dhivehi</option>
                      <option value="Islam">Islam</option>
                    </select>
                  </div>
                )}
              </div>
            </>
          )}

          <div>
            <label className="text-slate-300 font-bold block mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@school.edu"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="text-slate-300 font-bold block mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 hover:opacity-95 text-white font-black py-3.5 rounded-xl text-xs shadow-lg transition"
          >
            {loading ? 'Processing...' : authView === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800">
          {authView === 'login' ? (
            <p>
              Don't have an account?{' '}
              <button onClick={() => setAuthView('register')} className="text-indigo-400 font-bold hover:underline">
                Register here
              </button>
            </p>
          ) : (
            <p>
              Already registered?{' '}
              <button onClick={() => setAuthView('login')} className="text-indigo-400 font-bold hover:underline">
                Sign in here
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}