import React, { useState } from 'react';
import { 
  ArrowRight, HeartHandshake, Building2, Check, X, Phone, Mail, User, ShieldAlert, AlertCircle 
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
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Navigation Header */}
      <header className="max-w-7xl w-full mx-auto p-6 flex justify-between items-center relative z-10">
        <div className="flex items-center space-x-3">
          <img 
            src="/logo.png" 
            alt="Edusparkls Logo" 
            className="w-10 h-10 object-contain drop-shadow-md" 
          />
          <div className="flex flex-col">
            <span className="font-black text-xl tracking-tight text-white leading-none">Edusparkls</span>
            <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest pt-0.5">Students Learning Platform</span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onGoLogin}
            className="text-xs font-bold text-slate-300 hover:text-white px-4 py-2 rounded-xl transition"
          >
            Sign In
          </button>

          <button
            onClick={onGoRegister}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-black text-xs px-5 py-2.5 rounded-xl shadow-lg transition"
          >
            Student Register
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-5xl w-full mx-auto px-6 py-12 text-center space-y-8 relative z-10 my-auto">
        <span className="bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 font-bold px-4 py-1.5 rounded-full text-xs uppercase tracking-widest inline-flex items-center space-x-2">
          <span>Students Learning Platform</span>
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
            className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:opacity-95 text-white font-black px-8 py-4 rounded-2xl text-sm shadow-xl transition flex items-center justify-center space-x-2"
          >
            <span>Join as Student</span>
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

        {/* Partner Logos Banner - Horizontal Scroll on Mobile + Glowing Thin Border Lines */}
        <div className="pt-12 border-t border-slate-800/80 space-y-4">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">
            Trusted & Supported By Secondary Education Partners
          </span>

          <div className="flex overflow-x-auto sm:flex-wrap items-center justify-start sm:justify-center gap-3 sm:gap-4 pb-4 pt-1 snap-x scrollbar-none">
            {partnerLogos.map((p, idx) => (
              <div
                key={idx}
                className="shrink-0 snap-center bg-slate-900/90 border border-cyan-500/40 shadow-[0_0_15px_-2px_rgba(6,182,212,0.3)] hover:shadow-[0_0_22px_0px_rgba(6,182,212,0.55)] hover:border-cyan-400 transition-all duration-300 px-4 py-3 rounded-2xl flex items-center space-x-3 cursor-pointer"
              >
                <span className="text-2xl">{p.icon}</span>
                <div className="text-left">
                  <span className="text-xs font-bold text-slate-100 block whitespace-nowrap">{p.name}</span>
                  <span className="text-[9px] text-cyan-400 font-semibold uppercase tracking-wider block">{p.type}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl w-full mx-auto p-6 text-center text-xs text-slate-500 border-t border-slate-900 relative z-10">
        © 2026 Edusparkls - Students Learning Platform. Designed for Maldivian Curriculum & Secondary Schools.
      </footer>

      {/* Sponsor Application Modal */}
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

    setSponsors(prev => [newSponsorEntry, ...(prev || [])]);
    setSubmitted(true);

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
      console.warn("Supabase insert info:", err);
    }

    if (showToast) showToast("🎉 Partnership Proposal Submitted!", "success");
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-cyan-500/40 shadow-[0_0_30px_rgba(6,182,212,0.25)] text-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 relative text-left">
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
              <h3 className="text-xl sm:text-2xl font-black text-white pt-1">Become an Edusparkls Partner</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Parents, corporate sponsors, and alumni can partner with Edusparkls to fund student physical merchandise, stationery rewards, or school grants.
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
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-white text-xs focus:outline-none focus:border-cyan-500"
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
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-white text-xs focus:outline-none focus:border-cyan-500"
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
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-white text-xs focus:outline-none focus:border-cyan-500"
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
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-cyan-300 font-bold focus:outline-none"
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
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:opacity-95 text-white font-black py-3.5 rounded-xl text-xs shadow-lg transition"
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
                Thank you, <strong className="text-white font-bold">{applicantName}</strong>. Our administration team will review your sponsorship proposal for <strong className="text-cyan-400 font-bold">Edusparkls</strong> and reach out to you at <strong className="text-cyan-400 font-bold">{email}</strong>.
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
  const [studentGrade, setStudentGrade] = useState(7);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

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
              role: 'student',
              grade: parseInt(studentGrade)
            }
          }
        });
        if (error) throw error;
        showToast("Registration successful! Check email to confirm.", "success");
      }
    } catch (err) {
      const formattedMsg = err.message === 'Invalid login credentials' 
        ? '❌ Incorrect email or password. Please check your credentials and try again.' 
        : `❌ ${err.message || 'Authentication error'}`;

      setErrorMessage(formattedMsg);
      if (showToast) showToast(formattedMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4 font-sans">
      <div className="bg-slate-900 border border-slate-800 max-w-md w-full rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative">
        <div className="text-center space-y-2">
          <img 
            src="/logo.png" 
            alt="Edusparkls Logo" 
            className="w-14 h-14 object-contain mx-auto drop-shadow-md" 
          />
          <h2 className="text-2xl font-black text-white tracking-tight">
            {authView === 'login' ? 'Sign In to Edusparkls' : 'Student Account Registration'}
          </h2>
          <p className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">Students Learning Platform</p>
        </div>

        {/* Inline Error Alert Box */}
        {errorMessage && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 p-3.5 rounded-2xl flex items-start space-x-2 text-xs leading-relaxed">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span className="font-semibold">{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
          {authView === 'register' && (
            <>
              <div>
                <label className="text-slate-300 font-bold block mb-1">Full Student Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Aminath Sarah"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Enrolled Grade</label>
                <select
                  value={studentGrade}
                  onChange={(e) => setStudentGrade(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-cyan-300 font-bold focus:outline-none"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(g => (
                    <option key={g} value={g}>Grade {g}</option>
                  ))}
                </select>
              </div>

              <div className="bg-slate-800/60 border border-slate-700/80 p-3 rounded-xl flex items-center space-x-2 text-[11px] text-slate-400">
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Teacher & Staff credentials are issued directly by School Administration.</span>
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
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-cyan-500"
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
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-cyan-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:opacity-95 text-white font-black py-3.5 rounded-xl text-xs shadow-lg transition"
          >
            {loading ? 'Processing...' : authView === 'login' ? 'Sign In' : 'Register Student Account'}
          </button>
        </form>

        <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800">
          {authView === 'login' ? (
            <p>
              Don't have a student account?{' '}
              <button onClick={() => { setErrorMessage(''); setAuthView('register'); }} className="text-cyan-400 font-bold hover:underline">
                Register here
              </button>
            </p>
          ) : (
            <p>
              Already registered?{' '}
              <button onClick={() => { setErrorMessage(''); setAuthView('login'); }} className="text-cyan-400 font-bold hover:underline">
                Sign in here
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}