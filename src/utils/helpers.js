export const ALL_SUBJECTS = [
  'Dhivehi', 'Islam', 'English', 'Maths', 'Physics',
  'Chemistry', 'Biology', 'Economics', 'Business Studies',
  'Accounting', 'Computer Science', 'Social Studies', 'Science'
];

export const ROLE_TABS = {
  student: ['dashboard', 'olevel', 'leaderboard', 'library', 'shop', 'profile'],
  teacher: ['studio', 'library', 'shop', 'dashboard', 'olevel', 'leaderboard', 'profile'],
  shop_admin: ['shop', 'profile'],
  super_admin: ['dashboard', 'olevel', 'leaderboard', 'library', 'shop', 'studio', 'profile']
};

export const BADGES = [
  { id: 'b1', name: 'Optics Master', icon: '🔍', desc: 'Scored 100% on a Physics Diagram Quiz' },
  { id: 'b2', name: 'Thaana Scholar', icon: '🇲🇻', desc: 'Completed 5 Dhivehi reading sessions' },
  { id: 'b3', name: 'Bookworm', icon: '📚', desc: 'Read over 5 hours in E-Library' },
  { id: 'b4', name: 'Streak Champion', icon: '🔥', desc: 'Achieved a 5x question streak' }
];

export const getDefaultTabForRole = (userRole) => {
  switch (userRole) {
    case 'teacher': return 'studio';
    case 'shop_admin': return 'shop';
    case 'super_admin': return 'studio';
    default: return 'dashboard';
  }
};

export const canUserCRUDQuizzes = (role) => ['teacher', 'super_admin'].includes(role);
export const canUserCRUDShop = (role) => ['teacher', 'shop_admin', 'super_admin'].includes(role);
export const canUserCRUDLibrary = (role) => ['teacher', 'super_admin'].includes(role);

export const isRTLSubject = (subject) => {
  return subject === 'Dhivehi' || subject === 'Islam' || subject === 'ދިވެހި' || subject === 'އިސްލާމް';
};

export const getQuizTimeLimit = (quiz) => {
  if (!quiz) return 60;
  if (quiz.time_limit) return quiz.time_limit;
  const subj = (quiz.subject || '').toLowerCase();
  return ['maths', 'physics', 'chemistry', 'accounting', 'economics'].includes(subj) ? 120 : 60;
};

// HYPER-LENIENT SEARCH HELPER
export const lenientMatch = (targetContent, searchQuery) => {
  if (!searchQuery || searchQuery.trim() === '' || searchQuery === 'All') return true;

  const q = searchQuery.toLowerCase().trim();
  const text = String(targetContent || '').toLowerCase();

  // 1. Direct Substring Check
  if (text.includes(q)) return true;

  // 2. Number Words <-> Digits Matching (e.g. '2' matches 'two', '1' matches 'one')
  const numToWord = { '1': 'one', '2': 'two', '3': 'three', '4': 'four', '5': 'five', '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine', '10': 'ten' };
  const wordToNum = { 'one': '1', 'two': '2', 'three': '3', 'four': '4', 'five': '5', 'six': '6', 'seven': '7', 'eight': '8', 'nine': '9', 'ten': '10' };

  if (numToWord[q] && text.includes(numToWord[q])) return true;
  if (wordToNum[q] && text.includes(wordToNum[q])) return true;

  // 3. Token-by-token Partial Match
  const tokens = q.split(/\s+/);
  return tokens.some(token => text.includes(token));
};

export const generateSubjectAnalytics = (subject = 'Physics', studentData = []) => {
  return [
    { topic: 'Optics & Refraction Rays', avgScore: 82, totalAttempts: 24, weakStudentsCount: 3, masteryLevel: 'High' },
    { topic: 'Forces & Vector Mechanics', avgScore: 64, totalAttempts: 18, weakStudentsCount: 7, masteryLevel: 'Medium' },
    { topic: 'Kinematics & Motion', avgScore: 91, totalAttempts: 30, weakStudentsCount: 1, masteryLevel: 'Mastered' },
    { topic: 'Thermal Physics & Energy', avgScore: 55, totalAttempts: 15, weakStudentsCount: 9, masteryLevel: 'Needs Attention' }
  ];
};

export const playSound = (type) => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'correct') {
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } else if (type === 'wrong') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } else if (type === 'coin') {
      osc.frequency.setValueAtTime(987.77, ctx.currentTime);
      osc.frequency.setValueAtTime(1318.51, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    }
  } catch (e) {
    console.warn("Audio Context error:", e);
  }
};

export const getStudentRank = (xp) => {
  if (xp >= 2000) return { title: 'Legend', level: 5, text: 'text-amber-600', bg: 'bg-amber-100', icon: '👑' };
  if (xp >= 1200) return { title: 'Master', level: 4, text: 'text-purple-600', bg: 'bg-purple-100', icon: '🥇' };
  if (xp >= 700)  return { title: 'Expert', level: 3, text: 'text-blue-600', bg: 'bg-blue-100', icon: '🥈' };
  if (xp >= 300)  return { title: 'Scholar', level: 2, text: 'text-emerald-600', bg: 'bg-emerald-100', icon: '🥉' };
  return { title: 'Novice', level: 1, text: 'text-slate-600', bg: 'bg-slate-100', icon: '🌱' };
};