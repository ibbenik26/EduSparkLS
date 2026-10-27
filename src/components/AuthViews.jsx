
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-violet-100 flex items-center justify-center p-4 font-sans">
      <div className="bg-white/95 backdrop-blur-xl border border-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl shadow-indigo-900/10 ring-1 ring-slate-200/70">
        <div className="text-center space-y-2">
          <div className="bg-gradient-to-br from-indigo-600 to-violet-600 text-white p-3 rounded-2xl w-14 h-14 flex items-center justify-center mx-auto shadow-lg shadow-indigo-600/20">
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
                <div className="grid grid-cols-2 gap-2">
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
