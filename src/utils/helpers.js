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