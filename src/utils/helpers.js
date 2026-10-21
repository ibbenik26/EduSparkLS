export const ALL_SUBJECTS = [
  'Dhivehi', 'Islam', 'English', 'Maths', 'Physics',
  'Chemistry', 'Biology', 'Economics', 'Business Studies',
  'Accounting', 'Computer Science', 'Social Studies', 'Science'
];

export const QUICK_EMOJIS = ['🎒', '📓', '📐', '🖍️', '🎨', '🎟️', '⚡', '🎁', '⚽', '🏆', '📱', '📚', '🧩', '🎮', '🎧', '✏️'];

export const ROLE_TABS = {
  student: ['dashboard', 'olevel', 'library', 'shop', 'profile'],
  teacher: ['studio', 'profile'],
  shop_admin: ['shop_management', 'profile'],
  super_admin: ['dashboard', 'olevel', 'library', 'shop', 'shop_management', 'studio', 'super_admin_console', 'profile']
};

export const getDefaultTabForRole = (userRole) => {
  switch (userRole) {
    case 'teacher': return 'studio';
    case 'shop_admin': return 'shop_management';
    case 'super_admin': return 'super_admin_console';
    default: return 'dashboard';
  }
};

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
  if (xp >= 2000) return { title: 'Legend', level: 5, text: 'text-amber-600', bg: 'bg-amber-100' };
  if (xp >= 1200) return { title: 'Master', level: 4, text: 'text-purple-600', bg: 'bg-purple-100' };
  if (xp >= 700)  return { title: 'Expert', level: 3, text: 'text-blue-600', bg: 'bg-blue-100' };
  if (xp >= 300)  return { title: 'Scholar', level: 2, text: 'text-emerald-600', bg: 'bg-emerald-100' };
  return { title: 'Novice', level: 1, text: 'text-slate-600', bg: 'bg-slate-100' };
};

export const generateSubjectAnalytics = (subject, attempts = []) => {
  const subjectAttempts = attempts.filter(a => (a.subject || '').toLowerCase() === subject.toLowerCase());
  if (subjectAttempts.length === 0) return null;

  let totalScore = 0;
  let totalQuestions = 0;
  const topicStats = {};

  subjectAttempts.forEach(a => {
    totalScore += a.score || 0;
    totalQuestions += a.total || 0;
    if (a.questionDetails && Array.isArray(a.questionDetails)) {
      a.questionDetails.forEach(qd => {
        const topicName = qd.topic || qd.question_text || 'General Concept';
        if (!topicStats[topicName]) topicStats[topicName] = { correct: 0, total: 0, explanations: [] };
        topicStats[topicName].total += 1;
        if (qd.is_correct) topicStats[topicName].correct += 1;
        else if (qd.explanation && !topicStats[topicName].explanations.includes(qd.explanation)) {
          topicStats[topicName].explanations.push(qd.explanation);
        }
      });
    }
  });

  const accuracy = totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0;
  let predictedGrade = 'F';
  let gradeColor = 'text-rose-600';
  let gradeBg = 'bg-rose-50 border-rose-200';

  if (accuracy >= 85) { predictedGrade = 'A*'; gradeColor = 'text-purple-600'; gradeBg = 'bg-purple-50 border-purple-200'; }
  else if (accuracy >= 75) { predictedGrade = 'A'; gradeColor = 'text-indigo-600'; gradeBg = 'bg-indigo-50 border-indigo-200'; }
  else if (accuracy >= 65) { predictedGrade = 'B'; gradeColor = 'text-emerald-600'; gradeBg = 'bg-emerald-50 border-emerald-200'; }
  else if (accuracy >= 50) { predictedGrade = 'C'; gradeColor = 'text-amber-600'; gradeBg = 'bg-amber-50 border-amber-200'; }
  else if (accuracy >= 40) { predictedGrade = 'D'; gradeColor = 'text-orange-600'; gradeBg = 'bg-orange-50 border-orange-200'; }

  const strongTopics = [];
  const weakTopics = [];

  Object.entries(topicStats).forEach(([topic, stat]) => {
    const topicAcc = Math.round((stat.correct / stat.total) * 100);
    if (topicAcc >= 70) strongTopics.push({ topic, accuracy: topicAcc, totalAttempted: stat.total });
    else weakTopics.push({ topic, accuracy: topicAcc, totalAttempted: stat.total, explanation: stat.explanations.join(' • ') || 'Needs review.' });
  });

  return {
    subject, completedCount: subjectAttempts.length, totalScore, totalQuestions, accuracy,
    predictedGrade, gradeColor, gradeBg, strongTopics, weakTopics
  };
};