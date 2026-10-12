import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import confetti from 'canvas-confetti';
import {
  Trophy, Zap, Coins, Heart, Sparkles, BookOpen, LogOut,
  Clock, Flame, BrainCircuit, GraduationCap, CheckCircle2,
  XCircle, Check, RefreshCw, Upload, Lock, Trash2,
  Filter, ChevronRight, ChevronLeft, Search, Compass, Calculator,
  ShoppingBag, Award, User, Star, Gift, BarChart2,
  Book, BookOpenCheck, Library, Plus, ShieldCheck, Tag,
  Play, Pause, RotateCcw, FileText, KeyRound, ShieldAlert,
  Settings, Edit3, Sliders, Layers, Save, X, TrendingUp, Languages,
  AlertTriangle, Printer, ArrowRight, Mail, HelpCircle, Eye, EyeOff
} from 'lucide-react';

// --- Standardized Core Subjects ---
const ALL_SUBJECTS = [
  'Dhivehi',
  'Islam',
  'English',
  'Maths',
  'Physics',
  'Chemistry',
  'Biology',
  'Economics',
  'Business Studies',
  'Accounting',
  'Computer Science',
  'Social Studies',
  'Science'
];

// --- Helper for RTL Script Detection (Dhivehi & Islam) ---
const isRTLSubject = (subject) => {
  return subject === 'Dhivehi' || subject === 'Islam' || subject === 'ދިވެހި' || subject === 'އިސްލާމް';
};

// --- Dynamic Subject-Based Quiz Timer Helper ---
const getQuizTimeLimit = (quiz) => {
  if (!quiz) return 60;
  if (quiz.time_limit) return quiz.time_limit;

  const subj = (quiz.subject || '').toLowerCase();
  if (['maths', 'physics', 'chemistry', 'accounting', 'economics'].includes(subj)) {
    return 120;
  }
  return 60;
};

// --- Web Audio Synthesizer ---
const playSound = (type) => {
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

// --- Rank Calculator ---
const getStudentRank = (xp) => {
  if (xp >= 2000) return { title: 'Legend', level: 5, text: 'text-amber-600', bg: 'bg-amber-100' };
  if (xp >= 1200) return { title: 'Master', level: 4, text: 'text-purple-600', bg: 'bg-purple-100' };
  if (xp >= 700)  return { title: 'Expert', level: 3, text: 'text-blue-600', bg: 'bg-blue-100' };
  if (xp >= 300)  return { title: 'Scholar', level: 2, text: 'text-emerald-600', bg: 'bg-emerald-100' };
  return { title: 'Novice', level: 1, text: 'text-slate-600', bg: 'bg-slate-100' };
};

// --- 10-Quiz Subject Analytics & Feedback Engine ---
const generateSubjectAnalytics = (subject, attempts = []) => {
  const subjectAttempts = attempts.filter(a => (a.subject || '').toLowerCase() === subject.toLowerCase());
  const completedCount = subjectAttempts.length;

  if (completedCount === 0) return null;

  let totalScore = 0;
  let totalQuestions = 0;
  let totalTimeSeconds = 0;

  subjectAttempts.forEach(a => {
    totalScore += a.score || 0;
    totalQuestions += a.total || 0;
    totalTimeSeconds += a.timeSpentSeconds || (a.total * 30);
  });

  const accuracy = totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0;
  const avgSecondsPerQ = totalQuestions > 0 ? Math.round(totalTimeSeconds / totalQuestions) : 0;

  let predictedGrade = 'F';
  let gradeColor = 'text-rose-600';
  let gradeBg = 'bg-rose-50 border-rose-200';

  if (accuracy >= 85) { predictedGrade = 'A*'; gradeColor = 'text-purple-600'; gradeBg = 'bg-purple-50 border-purple-200'; }
  else if (accuracy >= 75) { predictedGrade = 'A'; gradeColor = 'text-indigo-600'; gradeBg = 'bg-indigo-50 border-indigo-200'; }
  else if (accuracy >= 65) { predictedGrade = 'B'; gradeColor = 'text-emerald-600'; gradeBg = 'bg-emerald-50 border-emerald-200'; }
  else if (accuracy >= 50) { predictedGrade = 'C'; gradeColor = 'text-amber-600'; gradeBg = 'bg-amber-50 border-amber-200'; }
  else if (accuracy >= 40) { predictedGrade = 'D'; gradeColor = 'text-orange-600'; gradeBg = 'bg-orange-50 border-orange-200'; }

  const strengths = [];
  const weaknesses = [];

  if (accuracy >= 75) {
    strengths.push('High concept retention and option elimination accuracy.');
    strengths.push('Consistent execution under timed challenge conditions.');
  } else if (accuracy >= 55) {
    strengths.push('Good grasp of basic syllabus concepts.');
    weaknesses.push('Occasional errors on multi-step analytical questions.');
  } else {
    weaknesses.push('Core concept gaps requiring immediate revision of fundamental topics.');
  }

  if (avgSecondsPerQ < 20 && accuracy < 60) {
    weaknesses.push('Rushing through questions (Avg <20s/Q). Read all choices carefully.');
  } else if (avgSecondsPerQ > 50 && accuracy >= 70) {
    strengths.push('Careful, methodical problem-solving style.');
    weaknesses.push('Pacing is slow (Avg >50s/Q). Practice timed drills to improve speed.');
  } else if (avgSecondsPerQ <= 40 && accuracy >= 80) {
    strengths.push('Optimal balance of high accuracy and fast pace!');
  }

  let trendMessage = 'Steady consistency across test sessions.';
  if (completedCount >= 4) {
    const half = Math.floor(completedCount / 2);
    const firstHalfAvg = subjectAttempts.slice(0, half).reduce((s, a) => s + (a.percentage || 0), 0) / half;
    const secondHalfAvg = subjectAttempts.slice(half).reduce((s, a) => s + (a.percentage || 0), 0) / (completedCount - half);

    if (secondHalfAvg - firstHalfAvg >= 8) {
      trendMessage = `📈 Strong improvement! Score accuracy increased by +${Math.round(secondHalfAvg - firstHalfAvg)}% in recent tests.`;
    } else if (firstHalfAvg - secondHalfAvg >= 8) {
      trendMessage = `📉 Score dip noticed (-${Math.round(firstHalfAvg - secondHalfAvg)}%). Re-visit difficult topics in the E-Library.`;
    }
  }

  return {
    subject,
    completedCount,
    totalScore,
    totalQuestions,
    accuracy,
    avgSecondsPerQ,
    predictedGrade,
    gradeColor,
    gradeBg,
    strengths,
    weaknesses,
    trendMessage,
    isCompleteReportUnlocked: completedCount >= 10
  };
};

// --- Printable Certificate Modal ---
function PrintableCertificateModal({ student, subject, onClose }) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-2 space-y-4 shadow-2xl overflow-hidden">
        <div className="flex justify-between items-center px-6 pt-4 print:hidden">
          <span className="text-xs font-bold text-slate-500">Certificate Preview (Press Print for Hard Copy)</span>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition flex items-center space-x-1.5 shadow-md"
            >
              <Printer className="w-4 h-4" />
              <span>Print Hard-Copy Certificate</span>
            </button>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 font-bold text-lg">✕</button>
          </div>
        </div>

        <div className="p-8 sm:p-12 border-8 border-double border-amber-500 rounded-2xl bg-gradient-to-b from-amber-50/40 via-white to-amber-50/20 text-center space-y-6 relative print:p-8 print:border-4">
          <div className="absolute top-3 left-3 text-2xl text-amber-500">🎓</div>
          <div className="absolute top-3 right-3 text-2xl text-amber-500">🏆</div>
          <div className="absolute bottom-3 left-3 text-2xl text-amber-500">⭐</div>
          <div className="absolute bottom-3 right-3 text-2xl text-amber-500">📜</div>

          <div className="space-y-1">
            <p className="text-xs font-black tracking-widest uppercase text-amber-800">EduSpark IQ Academic Excellence Award</p>
            <h1 className="text-3xl sm:text-4xl font-serif font-black text-slate-900 tracking-tight">Certificate of Achievement</h1>
            <div className="w-24 h-1 bg-amber-500 mx-auto rounded-full mt-2"></div>
          </div>

          <div className="space-y-2 py-2">
            <p className="text-xs text-slate-500 font-medium italic">This certificate is proudly awarded to</p>
            <h2 className="text-2xl sm:text-3xl font-black text-indigo-900 underline decoration-amber-400 decoration-2 underline-offset-8">
              {student.full_name}
            </h2>
            <p className="text-xs font-mono text-slate-500 pt-1">
              Student Index No: <span className="font-bold text-slate-700">{student.index_number || 'STU-2026-N/A'}</span> • Grade {student.grade}
            </p>
          </div>

          <div className="max-w-lg mx-auto bg-white/80 border border-amber-200 p-4 rounded-2xl text-xs text-slate-700 leading-relaxed shadow-xs">
            For outstanding academic dedication, conceptual mastery, and exceptional performance in <span className="font-bold text-amber-900">{subject}</span> tests and diagnostic quizzes.
          </div>

          <div className="grid grid-cols-3 gap-3 max-w-md mx-auto pt-2">
            <div className="bg-amber-100/50 p-2.5 rounded-xl border border-amber-200">
              <span className="text-[10px] text-amber-800 block font-bold">Accuracy</span>
              <span className="text-base font-black text-amber-900">{student.subjectAccuracy}%</span>
            </div>
            <div className="bg-indigo-100/50 p-2.5 rounded-xl border border-indigo-200">
              <span className="text-[10px] text-indigo-800 block font-bold">Tests Completed</span>
              <span className="text-base font-black text-indigo-900">{student.subjectQuizzesDone}</span>
            </div>
            <div className="bg-emerald-100/50 p-2.5 rounded-xl border border-emerald-200">
              <span className="text-[10px] text-emerald-800 block font-bold">Predicted Grade</span>
              <span className="text-base font-black text-emerald-900">{student.subjectGrade}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-200 max-w-lg mx-auto text-xs">
            <div className="text-center space-y-1">
              <div className="h-8 border-b border-slate-400 max-w-[140px] mx-auto"></div>
              <p className="font-bold text-slate-800 pt-1">{subject} Subject Lead</p>
              <p className="text-[10px] text-slate-400">Teacher Signature</p>
            </div>
            <div className="text-center space-y-1">
              <div className="h-8 flex items-end justify-center font-mono font-bold text-slate-700 border-b border-slate-400 max-w-[140px] mx-auto">
                {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
              </div>
              <p className="font-bold text-slate-800 pt-1">Date of Award</p>
              <p className="text-[10px] text-slate-400">School Portal Verification</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Teacher Quiz Weak Area & Misconception Inspector ---
function ClassQuizDiagnosticModal({ quiz, studentProfiles, onClose }) {
  if (!quiz) return null;

  const allAttempts = studentProfiles.flatMap(s => s.challenge_attempts || []).filter(a => a.quizId === quiz.id);

  const questionStats = quiz.questions.map((q, idx) => {
    const qKey = q.id || idx;
    let correctCount = 0;
    let wrongCount = 0;
    const choiceDistributions = { A: 0, B: 0, C: 0, D: 0 };

    allAttempts.forEach(attempt => {
      const qDetail = (attempt.questionDetails || []).find(qd => qd.id === qKey || qd.question_text === q.question_text);
      if (qDetail) {
        if (qDetail.is_correct) correctCount++;
        else wrongCount++;

        if (qDetail.user_option && choiceDistributions[qDetail.user_option] !== undefined) {
          choiceDistributions[qDetail.user_option]++;
        }
      }
    });

    const totalAttempts = correctCount + wrongCount;
    const failureRate = totalAttempts > 0 ? Math.round((wrongCount / totalAttempts) * 100) : 0;

    return {
      question_text: q.question_text,
      correct_option: q.correct_option,
      explanation: q.explanation,
      totalAttempts,
      correctCount,
      wrongCount,
      failureRate,
      choiceDistributions
    };
  }).sort((a, b) => b.failureRate - a.failureRate);

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Class Weak Areas & Misconception Inspector</span>
            <h2 className="text-xl font-black text-slate-900 mt-0.5">{quiz.title}</h2>
            <p className="text-xs text-slate-500">Aggregated performance across {allAttempts.length} student submission logs.</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 font-bold text-lg">✕</button>
        </div>

        {allAttempts.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            No student attempt data recorded for this quiz yet.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900 space-y-1">
                <p className="font-bold">Teaching Action Plan:</p>
                <p>Questions below are ordered from highest student failure rate to lowest. Focus classroom revision on questions with failure rates over 40%.</p>
              </div>
            </div>

            <div className="space-y-3">
              {questionStats.map((qs, i) => (
                <div key={i} className={`p-4 rounded-2xl border ${qs.failureRate >= 40 ? 'bg-rose-50/40 border-rose-200' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-black ${qs.failureRate >= 40 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}`}>
                        {qs.failureRate}% Student Error Rate
                      </span>
                      <span className="text-xs text-slate-500 font-medium">({qs.wrongCount} wrong / {qs.totalAttempts} answers)</span>
                    </div>
                    <span className="text-xs font-bold font-mono text-indigo-700">Correct Choice: Option {qs.correct_option}</span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 mb-2">{qs.question_text}</h4>

                  <div className="grid grid-cols-4 gap-2 my-3 text-[11px] font-bold">
                    {['A', 'B', 'C', 'D'].map(opt => (
                      <div key={opt} className={`p-2 rounded-xl text-center border ${opt === qs.correct_option ? 'bg-emerald-100 border-emerald-300 text-emerald-900' : 'bg-white border-slate-200 text-slate-600'}`}>
                        <span>Option {opt}: {qs.choiceDistributions[opt] || 0} votes</span>
                      </div>
                    ))}
                  </div>

                  {qs.explanation && (
                    <p className="text-xs text-slate-600 bg-white/80 p-2.5 rounded-xl border border-slate-200/60 mt-2">
                      <span className="font-bold text-slate-800">Concept Explanation:</span> {qs.explanation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Live Teacher Student Quiz Tracker Component ---
function TeacherStudentTracker({ subjects = ALL_SUBJECTS, quizzes = [] }) {
  const [selectedSubj, setSelectedSubj] = useState('Physics');
  const [selectedGradeFilter, setSelectedGradeFilter] = useState('All');
  const [studentProfiles, setStudentProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [certStudent, setCertStudent] = useState(null);
  const [selectedQuizDiagnostic, setSelectedQuizDiagnostic] = useState(null);

  useEffect(() => {
    fetchStudentQuizStatus();
  }, []);

  const fetchStudentQuizStatus = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'student');

      if (data) setStudentProfiles(data);
    } catch (e) {
      console.warn("Error fetching student profiles:", e);
    } finally {
      setLoading(false);
    }
  };

  const processedStudents = studentProfiles.map(s => {
    const attempts = s.challenge_attempts || [];
    const subjAttempts = attempts.filter(a => (a.subject || '').toLowerCase() === selectedSubj.toLowerCase());

    let totalScore = 0;
    let totalQuestions = 0;
    subjAttempts.forEach(a => {
      totalScore += a.score || 0;
      totalQuestions += a.total || 0;
    });

    const accuracy = totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0;
    
    let grade = 'N/A';
    if (subjAttempts.length > 0) {
      if (accuracy >= 85) grade = 'A*';
      else if (accuracy >= 75) grade = 'A';
      else if (accuracy >= 65) grade = 'B';
      else if (accuracy >= 50) grade = 'C';
      else grade = 'D';
    }

    return {
      ...s,
      subjectQuizzesDone: subjAttempts.length,
      subjectAccuracy: accuracy,
      subjectMarks: `${totalScore}/${totalQuestions}`,
      subjectGrade: grade
    };
  })
  .filter(s => selectedGradeFilter === 'All' || s.grade === parseInt(selectedGradeFilter))
  .sort((a, b) => b.subjectAccuracy - a.subjectAccuracy || b.subjectQuizzesDone - a.subjectQuizzesDone);

  const subjectQuizzes = quizzes.filter(q => (q.subject || '').toLowerCase() === selectedSubj.toLowerCase());

  return (
    <div className="space-y-5 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-lg font-black text-slate-900">Student Quiz Tracker & Award Panel</h3>
          <p className="text-xs text-slate-500">Monitor quiz participation and print certificates for top performers.</p>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={selectedSubj}
            onChange={(e) => setSelectedSubj(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-indigo-700"
          >
            {subjects.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <select
            value={selectedGradeFilter}
            onChange={(e) => setSelectedGradeFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700"
          >
            <option value="All">All Grades</option>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(g => (
              <option key={g} value={g}>Grade {g}</option>
            ))}
          </select>

          <button onClick={fetchStudentQuizStatus} className="p-2 text-slate-500 hover:text-indigo-600 rounded-xl bg-slate-100">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {subjectQuizzes.length > 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
          <span className="text-[11px] font-bold text-slate-500 block uppercase">Class Misconception Inspector</span>
          <div className="flex flex-wrap gap-2">
            {subjectQuizzes.map(q => (
              <button
                key={q.id}
                onClick={() => setSelectedQuizDiagnostic(q)}
                className="bg-white border border-slate-200 hover:border-indigo-400 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-800 flex items-center space-x-1.5 transition shadow-2xs"
              >
                <BarChart2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>Inspect: {q.title}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8 text-xs text-slate-400">Loading student records...</div>
      ) : processedStudents.length === 0 ? (
        <div className="text-center py-8 text-xs text-slate-400">No students found matching current filters.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                <th className="py-2.5 px-3">Rank</th>
                <th className="py-2.5 px-3">Student Name</th>
                <th className="py-2.5 px-3">Index #</th>
                <th className="py-2.5 px-3">Grade</th>
                <th className="py-2.5 px-3 text-center">Quizzes Done</th>
                <th className="py-2.5 px-3 text-center">Accuracy</th>
                <th className="py-2.5 px-3 text-center">Predicted Grade</th>
                <th className="py-2.5 px-3 text-right">Certificate Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {processedStudents.map((s, idx) => (
                <tr key={s.id || idx} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-3 font-bold text-slate-500">
                    {idx === 0 ? '🥇 1st' : idx === 1 ? '🥈 2nd' : idx === 2 ? '🥉 3rd' : `#${idx + 1}`}
                  </td>
                  <td className="py-3 px-3 font-bold text-slate-900">{s.full_name || 'Student'}</td>
                  <td className="py-3 px-3 font-mono text-slate-500">{s.index_number || 'N/A'}</td>
                  <td className="py-3 px-3 font-medium text-slate-700">Grade {s.grade}</td>
                  <td className="py-3 px-3 text-center font-bold text-indigo-600">{s.subjectQuizzesDone}</td>
                  <td className="py-3 px-3 text-center font-bold text-emerald-600">{s.subjectAccuracy}%</td>
                  <td className="py-3 px-3 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-100 text-purple-800">
                      {s.subjectGrade}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => setCertStudent(s)}
                      disabled={s.subjectQuizzesDone === 0}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition flex items-center space-x-1 ml-auto ${
                        s.subjectQuizzesDone > 0
                          ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                      }`}
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>Issue Certificate</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {certStudent && (
        <PrintableCertificateModal
          student={certStudent}
          subject={selectedSubj}
          onClose={() => setCertStudent(null)}
        />
      )}

      {selectedQuizDiagnostic && (
        <ClassQuizDiagnosticModal
          quiz={selectedQuizDiagnostic}
          studentProfiles={studentProfiles}
          onClose={() => setSelectedQuizDiagnostic(null)}
        />
      )}
    </div>
  );
}

// --- Subject Analytics Diagnostic Card Component ---
function SubjectAnalyticsCard({ subject, attempts }) {
  const stats = generateSubjectAnalytics(subject, attempts);
  if (!stats) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-black text-slate-900">{stats.subject} Performance Summary</h3>
            {stats.isCompleteReportUnlocked ? (
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                ✓ 10-Quiz Diagnostic Complete
              </span>
            ) : (
              <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full">
                Progress: {stats.completedCount}/10 Quizzes
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Performance profile based on completed quiz attempts.</p>
        </div>

        <div className={`px-4 py-2 rounded-2xl border text-center font-black ${stats.gradeBg}`}>
          <span className="text-[10px] block text-slate-400 font-bold uppercase">Predicted Grade</span>
          <span className={`text-2xl ${stats.gradeColor}`}>{stats.predictedGrade}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-50 p-3 rounded-2xl border text-center">
          <span className="text-[10px] font-bold text-slate-400 block">Overall Accuracy</span>
          <span className="text-xl font-black text-slate-900">{stats.accuracy}%</span>
        </div>
        <div className="bg-slate-50 p-3 rounded-2xl border text-center">
          <span className="text-[10px] font-bold text-slate-400 block">Avg Time / Question</span>
          <span className="text-xl font-black text-indigo-600">{stats.avgSecondsPerQ}s</span>
        </div>
        <div className="bg-slate-50 p-3 rounded-2xl border text-center">
          <span className="text-[10px] font-bold text-slate-400 block">Total Marks</span>
          <span className="text-xl font-black text-emerald-600">{stats.totalScore}/{stats.totalQuestions}</span>
        </div>
      </div>

      {!stats.isCompleteReportUnlocked && (
        <div className="space-y-1.5 bg-amber-50/60 p-3 rounded-2xl border border-amber-200/60">
          <div className="flex justify-between text-xs font-bold text-amber-900">
            <span>Complete 10 quizzes for full diagnostic report</span>
            <span>{stats.completedCount} / 10 Quizzes</span>
          </div>
          <div className="w-full bg-amber-200/50 h-2 rounded-full overflow-hidden">
            <div
              className="bg-amber-500 h-full transition-all duration-500"
              style={{ width: `${(stats.completedCount / 10) * 100}%` }}
            ></div>
          </div>
        </div>
      )}

      <div className="bg-slate-50 p-3 rounded-xl text-xs font-semibold text-slate-700 border">
        {stats.trendMessage}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-emerald-50/50 border border-emerald-200/60 rounded-2xl p-4 space-y-2">
          <h4 className="text-xs font-black text-emerald-800">👍 Areas Good (Strengths)</h4>
          <ul className="text-xs text-emerald-900 space-y-1 list-disc list-inside font-medium">
            {stats.strengths.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </div>

        <div className="bg-rose-50/50 border border-rose-200/60 rounded-2xl p-4 space-y-2">
          <h4 className="text-xs font-black text-rose-800">🎯 Areas Needing Improvement</h4>
          <ul className="text-xs text-rose-900 space-y-1 list-disc list-inside font-medium">
            {stats.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
          </ul>
        </div>
      </div>
    </div>
  );
}

// --- Initial Datasets ---
const INITIAL_SHOP_ITEMS = [
  { id: 'item_1', name: 'Homework Waiver Pass', category: 'Privilege', cost: 300, icon: '🎟️', desc: '1 homework waiver card approved by your class teacher.' },
  { id: 'item_2', name: 'Golden Profile Border', category: 'Digital Perk', cost: 150, icon: '👑', desc: 'Custom shiny gold frame around your avatar on the leaderboard.' },
  { id: 'item_3', name: '24h Double XP Booster', category: 'Booster', cost: 200, icon: '⚡', desc: 'Earn 2x XP for all quizzes and library reading completed today.' }
];

const INITIAL_BOOKS = [
  {
    id: 'book_dhivehi_1',
    title: 'ދިވެހިބަހުގެ ގަވާއިދު',
    subject: 'Dhivehi',
    author: 'އަލްއުސްތާޛު މުޙައްމަދު ޖަމީލު',
    cover_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    summary: 'ދިވެހިބަހުގެ އަސާސީ ގަވާއިދުތަކާއި ތާނައަކުރުތަކުގެ ބޭނުންކުރާނެ ގޮތުގެ ތަފްޞީލު.',
    extract: 'ފުރަތަމަ ބާބު: ތާނަ އަކުރު... ދިވެހިބަހުން ލިޔުމަށް ބޭނުންކުރަނީ ތާނައަކުރެވެ. ތާނައަކުރުގައި ހިމެނެނީ 24 އަކުރާއި 11 ޒަވިޔަން އަކުރެވެ.',
    pages: [
      "ފުރަތަމަ ބާބު: ތާނަ އަކުރު\n\nދިވެހިބަހުން ލިޔުމަށް ބޭނުންކުރަނީ ތާނައަކުރެވެ. ތާނައަކުރުގައި ހިމެނެނީ 24 އަކުރާއި 11 ޒަވިޔަން އަކުރެވެ.\n\nއަސާސީ އަކުރުތަކަކީ: ހަ، ށަ، ނު، ރަ، ބަ، ޅަ، ކަ، އަ، ވު، މު، ފަ، ދު، ތަ، ލަ، ގަ، ޏަ، ސަ، ޑަ، ޒަ، ޓަ، ޔަ، ޕަ، ޖަ، ޗަ އެވެ.",
      "ދެވަނަ ބާބު: ފިލި\n\nތާނައިގައި 10 ފިލި ބޭނުންކުރެވެއެވެ. އެއީ:\n1. އަބަފިލި (ަ)\n2. އާބަފިލި (ާ)\n3. އިބަފިލި (ި)\n4. އީބަފިލި (ީ)\n5. އުބަފިލި (ު)\n6. އޫބަފިލި (ޫ)\n7. އެބަފިލި (ެ)\n8. އޭބަފިލި (ޭ)\n9. އޮބަފިލި (ޮ)\n10. އޯބަފިލި (ޯ)"
    ]
  },
  {
    id: 'book_islam_1',
    title: 'އިސްލާމީ ތަރުބިޔަތު',
    subject: 'Islam',
    author: 'މިނިސްޓްރީ އޮފް އެޑިޔުކޭޝަން',
    cover_url: 'https://images.unsplash.com/photo-1585036156171-384164a8c675?auto=format&fit=crop&w=600&q=80',
    summary: 'އީމާންކަމުގެ އަސާސްތަކާއި އަޚްލާޤީ މިންގަނޑުތައް.',
    extract: 'ފުރަތަމަ ފިލާވަޅު: އީމާންކަމުގެ އަރުކާންތައް... އީމާންކަމުގެ އަރުކާނަކީ 6 ކަމެކެވެ. 1. ﷲ އަށް އީމާންވުން...',
    pages: [
      "ފުރަތަމަ ފިލާވަޅު: އީމާންކަމުގެ އަރުކާންތައް\n\nއީމާންކަމުގެ އަރުކާނަކީ 6 ކަމެކެވެ.\n\n1. ﷲ އަށް އީމާންވުން\n2. މަލާއިކަތުންނަށް އީމާންވުން\n3. ފޮތްތަކަށް އީމާންވުން\n4. ރަސޫލުންނަށް އީމާންވުން\n5. އާޚިރަތް ދުވަހަށް އީމާންވުން\n6. ޤަދަރު މިންވަރަށް އީމާންވުން"
    ]
  },
  {
    id: 'book_1',
    title: 'Physics in Everyday Life',
    subject: 'Physics',
    author: 'Dr. Marcus Vance',
    cover_url: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?auto=format&fit=crop&w=600&q=80',
    summary: 'Explore forces, energy, gravity, thermodynamics, and electromagnetism.',
    extract: 'CHAPTER 1: THE LAWS OF MOTION — Physics is the fundamental science that seeks to understand how the universe behaves...',
    pages: [
      "CHAPTER 1: THE LAWS OF MOTION\n\nPhysics is the fundamental science that seeks to understand how the universe behaves. Isaac Newton formulated three foundational principles known as Newton's Laws of Motion."
    ]
  }
];

const INITIAL_BADGES = [
  { id: 'b1', title: 'First Step', desc: 'Completed your first quiz or reading log.', icon: '🎯', minQuizzes: 1, minBooks: 0, minXp: 0, minCoins: 0, minStreak: 0 },
  { id: 'b2', title: 'Bookworm', desc: 'Read at least 3 books or 30+ reading minutes.', icon: '📚', minQuizzes: 0, minBooks: 3, minXp: 0, minCoins: 0, minStreak: 0 },
  { id: 'b3', title: 'Academic Master', desc: 'Reached Master rank (1,200+ XP).', icon: '🏆', minQuizzes: 0, minBooks: 0, minXp: 1200, minCoins: 0, minStreak: 0 }
];

const INITIAL_QUIZZES = [
  {
    id: 'olevel_1',
    title: 'Cambridge O-Level Physics 0625 - Mechanics & Motion',
    subject: 'Physics',
    grade: 10,
    subject_code: '0625',
    exam_year: 2024,
    variant: 'Paper 12',
    is_past_paper: true,
    questions: [
      {
        id: 'q1_1',
        question_text: 'A car accelerates uniformly from rest to a velocity of 20 m/s in 5 seconds. What is its acceleration?',
        option_a: '2 m/s²', option_b: '4 m/s²', option_c: '5 m/s²', option_d: '100 m/s²',
        correct_option: 'B', explanation: 'Acceleration a = (v - u) / t = (20 - 0) / 5 = 4 m/s².'
      }
    ]
  },
  {
    id: 'olevel_2',
    title: 'Cambridge O-Level Computer Science 2210 - Algorithms',
    subject: 'Computer Science',
    grade: 10,
    subject_code: '2210',
    exam_year: 2024,
    variant: 'Paper 21',
    is_past_paper: true,
    questions: [
      {
        id: 'q2_1',
        question_text: 'Which data structure operates on a First-In, First-Out (FIFO) basis?',
        option_a: 'Stack', option_b: 'Queue', option_c: 'Array', option_d: 'Tree',
        correct_option: 'B', explanation: 'Queues process items in the order they arrive (FIFO).'
      }
    ]
  },
  {
    id: 'g7_math_1',
    title: 'Grade 7 Mathematics - Algebraic Expressions',
    subject: 'Maths',
    grade: 7,
    is_past_paper: false,
    questions: [
      {
        id: 'q7_1',
        question_text: 'Simplify: 3x + 5x - 2x',
        option_a: '6x', option_b: '10x', option_c: '8x', option_d: '4x',
        correct_option: 'A', explanation: '(3 + 5 - 2)x = 6x.'
      }
    ]
  }
];

export default function App() {
  // --- Auth View State ---
  // Modes: 'landing' | 'login' | 'register' | 'forgot_password'
  const [authView, setAuthView] = useState('landing');

  // --- Auth Credentials State ---
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('student');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [indexNumber, setIndexNumber] = useState('');
  const [teacherPasscode, setTeacherPasscode] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  // --- Student Stats ---
  const [studentGrade, setStudentGrade] = useState(7);
  const [coins, setCoins] = useState(150);
  const [xp, setXp] = useState(240);
  const [streak, setStreak] = useState(1);
  const [quizzesCompleted, setQuizzesCompleted] = useState(0);
  const [booksRead, setBooksRead] = useState(0);
  const [readingMinutes, setReadingMinutes] = useState(0);
  const [claimedRewards, setClaimedRewards] = useState([]);
  const [activityLog, setActivityLog] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');

  // --- Subject Analytics & Challenge Tracking ---
  const [completedChallenges, setCompletedChallenges] = useState([]);
  const [challengeAttempts, setChallengeAttempts] = useState([]);
  const [completedBookIds, setCompletedBookIds] = useState([]);

  // --- Dynamic Collections ---
  const [quizzes, setQuizzes] = useState(INITIAL_QUIZZES);
  const [books, setBooks] = useState(INITIAL_BOOKS);
  const [shopItems, setShopItems] = useState(INITIAL_SHOP_ITEMS);
  const [badges, setBadges] = useState(INITIAL_BADGES);
  const [leaderboardUsers, setLeaderboardUsers] = useState([]);

  // --- E-Library State & Mobile Easy Reader Controls ---
  const [bookBatchIndex, setBookBatchIndex] = useState(0);
  const [selectedBook, setSelectedBook] = useState(null);
  const [bookPageIndex, setBookPageIndex] = useState(0);
  const [readerFontSize, setReaderFontSize] = useState('base');
  const [readerTheme, setReaderTheme] = useState('light');
  const [isFullScreenReader, setIsFullScreenReader] = useState(false);

  // --- Global Filter State ---
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // --- Quiz Runner State ---
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [quizMode, setQuizMode] = useState('practice');
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [hearts, setHearts] = useState(5);
  const [timer, setTimer] = useState(60);
  const [quizFinished, setQuizFinished] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [userAnswers, setUserAnswers] = useState({});

  // --- Admin / Studio State ---
  const [targetArena, setTargetArena] = useState('olevel');
  const [studioGrade, setStudioGrade] = useState(7);
  const [studioSubject, setStudioSubject] = useState('Maths');
  const [studioSubjectCode, setStudioSubjectCode] = useState('0580');
  const [studioYear, setStudioYear] = useState('2024');
  const [studioVariant, setStudioVariant] = useState('Paper 22');
  const [jsonInputText, setJsonInputText] = useState(`[
  {
    "question_text": "What is the capital of Japan?",
    "option_a": "Beijing",
    "option_b": "Tokyo",
    "option_c": "Seoul",
    "option_d": "Bangkok",
    "correct_option": "B",
    "explanation": "Tokyo is the capital city of Japan."
  }
]`);
  const [studioMsg, setStudioMsg] = useState({ type: '', text: '' });

  // --- Admin CRUD Center State ---
  const [adminTab, setAdminTab] = useState('books');
  const [editingBook, setEditingBook] = useState(null);
  const [bookForm, setBookForm] = useState({ title: '', author: '', subject: 'Dhivehi', cover_url: '', summary: '', extract: '', pageText: '' });

  const [editingPrize, setEditingPrize] = useState(null);
  const [prizeForm, setPrizeForm] = useState({ name: '', category: 'Privilege', cost: 200, icon: '🎁', desc: '' });

  const [editingBadge, setEditingBadge] = useState(null);
  const [badgeForm, setBadgeForm] = useState({ title: '', desc: '', icon: '🏅', minQuizzes: 0, minBooks: 0, minXp: 0, minCoins: 0, minStreak: 0 });

  const [editingQuiz, setEditingQuiz] = useState(null);
  const [quizForm, setQuizForm] = useState({ title: '', subject: 'Maths', grade: 7, subject_code: '', exam_year: 2024, variant: 'Paper 12', is_past_paper: false });

  // --- Navigation & History Control ---
  const navigateToTab = (tabName) => {
    setActiveQuiz(null);
    setSelectedBook(null);
    setIsFullScreenReader(false);
    setActiveTab(tabName);
    setSelectedSubject('All');
    window.history.pushState({ tab: tabName }, '', `#${tabName}`);
  };

  useEffect(() => {
    window.history.replaceState({ tab: activeTab }, '', `#${activeTab}`);

    const handlePopState = (e) => {
      if (selectedBook) {
        setSelectedBook(null);
        setIsFullScreenReader(false);
        return;
      }
      if (activeQuiz) {
        setActiveQuiz(null);
        return;
      }
      if (e.state && e.state.tab) {
        setActiveTab(e.state.tab);
      } else {
        setActiveTab('dashboard');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [activeQuiz, selectedBook, activeTab]);

  // --- Supabase Session Listener ---
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchUserProfile(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        fetchUserProfile(session.user.id);
      } else {
        setUser(null);
      }
    });

    fetchDatabaseQuizzes();
    fetchDatabaseBooks();
    fetchDatabaseShop();
    fetchDatabaseBadges();
    fetchLeaderboard();

    return () => subscription.unsubscribe();
  }, []);

  // --- Fetchers ---
  const fetchDatabaseQuizzes = async () => {
    try {
      const { data } = await supabase.from('quizzes').select('*').order('created_at', { ascending: false });
      if (data && data.length > 0) {
        const formatted = data.map(q => ({
          ...q,
          questions: typeof q.questions === 'string' ? JSON.parse(q.questions) : q.questions,
          is_past_paper: q.is_past_paper === true || q.is_past_paper === 'true'
        }));
        const dbIds = new Set(formatted.map(q => q.id));
        setQuizzes([...formatted, ...INITIAL_QUIZZES.filter(q => !dbIds.has(q.id))]);
      }
    } catch (e) { console.warn("Quizzes fetch error:", e); }
  };

  const fetchDatabaseBooks = async () => {
    try {
      const { data } = await supabase.from('books').select('*').order('created_at', { ascending: false });
      if (data && data.length > 0) {
        const formatted = data.map(b => ({
          ...b,
          pages: typeof b.pages === 'string' ? JSON.parse(b.pages) : b.pages
        }));
        const dbIds = new Set(formatted.map(b => b.id));
        setBooks([...formatted, ...INITIAL_BOOKS.filter(b => !dbIds.has(b.id))]);
      }
    } catch (e) { console.warn("Books fetch error:", e); }
  };

  const fetchDatabaseShop = async () => {
    try {
      const { data } = await supabase.from('shop_items').select('*').order('created_at', { ascending: false });
      if (data && data.length > 0) {
        const dbIds = new Set(data.map(i => i.id));
        setShopItems([...data, ...INITIAL_SHOP_ITEMS.filter(i => !dbIds.has(i.id))]);
      }
    } catch (e) { console.warn("Shop fetch error:", e); }
  };

  const fetchDatabaseBadges = async () => {
    try {
      const { data } = await supabase.from('badges').select('*').order('created_at', { ascending: false });
      if (data && data.length > 0) {
        const dbIds = new Set(data.map(b => b.id));
        setBadges([...data, ...INITIAL_BADGES.filter(b => !dbIds.has(b.id))]);
      }
    } catch (e) { console.warn("Badges fetch error:", e); }
  };

  const fetchUserProfile = async (userId) => {
    try {
      const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (data) {
        setAuthName(data.full_name || 'User');
        setIndexNumber(data.index_number || 'STU-2026-0000');
        setRole(data.role || 'student');
        setStudentGrade(data.grade || 7);
        setCoins(data.coins ?? 150);
        setXp(data.xp ?? 240);
        setStreak(data.streak ?? 1);
        setQuizzesCompleted(data.quizzes_completed ?? 0);
        setBooksRead(data.books_read ?? 0);
        setReadingMinutes(data.reading_minutes ?? 0);
        setClaimedRewards(data.claimed_rewards || []);
        setActivityLog(data.activity_log || []);
        setCompletedChallenges(data.completed_challenges || []);
        setChallengeAttempts(data.challenge_attempts || []);
        setCompletedBookIds(data.completed_book_ids || []);
      }
    } catch (e) { console.warn("Profile fetch error:", e); }
    fetchLeaderboard();
  };

  const syncProfileToSupabase = async (updates) => {
    if (!user) return;
    try {
      await supabase.from('profiles').upsert({
        id: user.id,
        full_name: authName,
        index_number: indexNumber,
        role: role,
        grade: studentGrade,
        coins: updates.coins ?? coins,
        xp: updates.xp ?? xp,
        streak: updates.streak ?? streak,
        quizzes_completed: updates.quizzes_completed ?? quizzesCompleted,
        books_read: updates.books_read ?? booksRead,
        reading_minutes: updates.reading_minutes ?? readingMinutes,
        claimed_rewards: updates.claimed_rewards ?? claimedRewards,
        activity_log: updates.activity_log ?? activityLog,
        completed_challenges: updates.completed_challenges ?? completedChallenges,
        challenge_attempts: updates.challenge_attempts ?? challengeAttempts,
        completed_book_ids: updates.completed_book_ids ?? completedBookIds,
        updated_at: new Date().toISOString()
      });
      fetchLeaderboard();
    } catch (e) { console.warn("Profile sync error:", e); }
  };

  const fetchLeaderboard = async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('full_name, index_number, grade, xp, streak, coins, books_read, quizzes_completed')
        .order('xp', { ascending: false })
        .limit(10);
      if (data) setLeaderboardUsers(data);
    } catch (e) { console.warn("Leaderboard error:", e); }
  };

  // --- Auth Handlers ---
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!authEmail || !authPassword) return alert('Please enter your email or user ID and password.');
    setAuthLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password: authPassword,
      });
      if (error) throw error;
    } catch (err) {
      alert("Login Error: " + err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!authName.trim()) return alert('Please enter your full name.');
    if (!authEmail.trim() || !authPassword.trim()) return alert('Please enter an email and password.');

    if (role === 'student' && !indexNumber.trim()) {
      return alert('Please enter your Student Index Number.');
    }

    if (role === 'teacher' || role === 'admin') {
      if (!teacherPasscode.trim()) return alert('Secret Admin Passcode required for Teacher registration.');
      try {
        const { data: settingData } = await supabase.from('app_settings').select('value').eq('key', 'teacher_passcode').single();
        const validPasscode = settingData?.value || 'SCH-TEACHER-2026';
        if (teacherPasscode.trim() !== validPasscode) throw new Error('Invalid Secret Admin Passcode!');
      } catch (e) {
        if (e.message.includes('Invalid Secret')) return alert(e.message);
      }
    }

    setAuthLoading(true);
    try {
      const assignedIndex = role === 'student' ? indexNumber : `STAFF-${Math.floor(100 + Math.random() * 900)}`;

      const { data, error } = await supabase.auth.signUp({
        email: authEmail,
        password: authPassword,
        options: {
          data: { full_name: authName, index_number: assignedIndex, role, grade: studentGrade }
        }
      });
      if (error) throw error;

      if (data?.user) {
        await supabase.from('profiles').insert([{
          id: data.user.id,
          full_name: authName,
          index_number: assignedIndex,
          role,
          grade: studentGrade,
          coins: 150,
          xp: 240,
          streak: 1,
          quizzes_completed: 0,
          books_read: 0,
          reading_minutes: 0,
          claimed_rewards: [],
          activity_log: [{ id: 'init_1', title: `Registered as ${role.toUpperCase()}`, date: 'Just now' }],
          completed_challenges: [],
          challenge_attempts: [],
          completed_book_ids: []
        }]);
      }
      alert(`✅ Account registered successfully as ${role.toUpperCase()}! Welcome to EduSpark IQ.`);
    } catch (err) {
      alert("Registration Error: " + err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!authEmail.trim()) return alert('Please enter your registered email address.');
    setAuthLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(authEmail, {
        redirectTo: window.location.origin
      });
      if (error) throw error;
      setResetSent(true);
    } catch (err) {
      alert("Password Reset Error: " + err.message);
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

  // --- Quiz Engine ---
  useEffect(() => {
    let interval = null;
    if (activeQuiz && quizMode === 'challenge' && !quizFinished && !gameOver && !showExplanation && timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    } else if (timer === 0 && activeQuiz && !quizFinished && !gameOver && !showExplanation) {
      handleAnswerSubmit(null);
    }
    return () => clearInterval(interval);
  }, [activeQuiz, quizMode, quizFinished, gameOver, showExplanation, timer]);

  const startQuiz = (quiz, mode) => {
    if (mode === 'challenge' && completedChallenges.includes(quiz.id)) {
      alert("⚠️ You have already completed Challenge Mode for this test! You can continue practicing in Practice Mode.");
      return;
    }

    const duration = getQuizTimeLimit(quiz);

    setActiveQuiz(quiz);
    setQuizMode(mode);
    setCurrentQuestionIdx(0);
    setSelectedOption(null);
    setShowExplanation(false);
    setScore(0);
    setHearts(5);
    setTimer(duration);
    setQuizFinished(false);
    setGameOver(false);
    setUserAnswers({});

    window.history.pushState({ quizId: quiz.id }, '', `#quiz-${quiz.id}`);
  };

  const openBookModal = (book) => {
    setSelectedBook(book);
    setBookPageIndex(0);
    setIsFullScreenReader(false);
    window.history.pushState({ bookId: book.id }, '', `#book-${book.id}`);
  };

  const handleAnswerSubmit = (option) => {
    if (selectedOption !== null && showExplanation) return;

    const currentQ = activeQuiz.questions[currentQuestionIdx];
    const isCorrect = option === currentQ.correct_option;
    setSelectedOption(option);
    setShowExplanation(true);

    const qKey = currentQ.id || currentQuestionIdx;
    setUserAnswers(prev => ({ ...prev, [qKey]: option }));

    if (isCorrect) {
      playSound('correct');
      setScore(s => s + 1);
    } else {
      playSound('wrong');
      if (quizMode === 'challenge') {
        const remainingHearts = hearts - 1;
        setHearts(remainingHearts);
        if (remainingHearts <= 0) setGameOver(true);
      }
    }
  };

  const nextQuestion = () => {
    setSelectedOption(null);
    setShowExplanation(false);
    
    const duration = getQuizTimeLimit(activeQuiz);
    setTimer(duration);

    if (currentQuestionIdx + 1 < activeQuiz.questions.length) {
      setCurrentQuestionIdx(idx => idx + 1);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    setQuizFinished(true);
    playSound('coin');
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });

    const coinsEarned = score * 15;
    const xpEarned = score * 30;
    const newCoins = coins + coinsEarned;
    const newXp = xp + xpEarned;
    const newQuizzesCount = quizzesCompleted + 1;

    let updatedCompletedChallenges = completedChallenges;
    let updatedChallengeAttempts = challengeAttempts;

    if (quizMode === 'challenge' && activeQuiz) {
      if (!completedChallenges.includes(activeQuiz.id)) {
        updatedCompletedChallenges = [...completedChallenges, activeQuiz.id];
      }

      const totalQ = activeQuiz.questions.length;
      const initialLimit = getQuizTimeLimit(activeQuiz);
      const estTimePerQ = Math.max(10, initialLimit - timer);

      const attemptRecord = {
        quizId: activeQuiz.id,
        quizTitle: activeQuiz.title,
        subject: activeQuiz.subject || 'General',
        score: score,
        total: totalQ,
        percentage: Math.round((score / totalQ) * 100),
        timeSpentSeconds: estTimePerQ * totalQ,
        date: new Date().toLocaleDateString(),
        questionDetails: activeQuiz.questions.map((q, idx) => {
          const qKey = q.id || idx;
          const chosen = userAnswers[qKey] || null;
          return {
            id: qKey,
            question_text: q.question_text,
            correct_option: q.correct_option,
            user_option: chosen,
            is_correct: chosen === q.correct_option,
            explanation: q.explanation || ''
          };
        })
      };

      updatedChallengeAttempts = [attemptRecord, ...challengeAttempts];
      setCompletedChallenges(updatedCompletedChallenges);
      setChallengeAttempts(updatedChallengeAttempts);
    }

    const newLog = [
      {
        id: `act_${Date.now()}`,
        title: `${quizMode === 'challenge' ? '🔥 Challenge Test' : '📖 Practice Quiz'}: ${activeQuiz.title}`,
        score: `${score}/${activeQuiz.questions.length}`,
        coinsGained: coinsEarned,
        xpGained: xpEarned,
        date: 'Just now'
      },
      ...activityLog
    ];

    setCoins(newCoins);
    setXp(newXp);
    setQuizzesCompleted(newQuizzesCount);
    setActivityLog(newLog);

    syncProfileToSupabase({
      coins: newCoins,
      xp: newXp,
      quizzes_completed: newQuizzesCount,
      activity_log: newLog,
      completed_challenges: updatedCompletedChallenges,
      challenge_attempts: updatedChallengeAttempts
    });
  };

  // --- Redeem Reward ---
  const handleRedeemReward = (item) => {
    if (coins < item.cost) return alert(`Insufficient EduCoins! You need ${item.cost - coins} more coins.`);
    if (confirm(`Redeem "${item.name}" for ${item.cost} EduCoins?`)) {
      const newCoins = coins - item.cost;
      const redemption = { id: `claimed_${Date.now()}`, name: item.name, date: new Date().toISOString().split('T')[0], code: `ES-${Math.floor(1000 + Math.random() * 9000)}` };
      const newClaimed = [redemption, ...claimedRewards];
      const newLog = [{ id: `act_${Date.now()}`, title: `Redeemed Reward: ${item.name}`, cost: item.cost, date: 'Just now' }, ...activityLog];

      setCoins(newCoins); setClaimedRewards(newClaimed); setActivityLog(newLog);
      playSound('coin'); confetti({ particleCount: 100, spread: 70 });
      syncProfileToSupabase({ coins: newCoins, claimed_rewards: newClaimed, activity_log: newLog });
    }
  };

  // --- Admin CRUD Operations ---
  const handleSaveBook = async (e) => {
    e.preventDefault();
    if (!bookForm.title || !bookForm.author || !bookForm.pageText) return alert("Please fill title, author, and chapter page text.");

    const parsedPages = bookForm.pageText.includes('---PAGE---')
      ? bookForm.pageText.split('---PAGE---').map(p => p.trim())
      : [bookForm.pageText.trim()];

    if (editingBook) {
      const updatedBook = {
        ...editingBook,
        title: bookForm.title,
        author: bookForm.author,
        subject: bookForm.subject,
        cover_url: bookForm.cover_url || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=600&q=80',
        summary: bookForm.summary,
        extract: bookForm.extract || parsedPages[0].slice(0, 120) + '...',
        pages: parsedPages
      };
      try {
        await supabase.from('books').update(updatedBook).eq('id', editingBook.id);
        setBooks(books.map(b => b.id === editingBook.id ? updatedBook : b));
        setEditingBook(null);
        alert("✅ Book updated!");
      } catch (err) { alert("Update failed: " + err.message); }
    } else {
      const newBook = {
        id: `book_${Date.now()}`,
        title: bookForm.title,
        author: bookForm.author,
        subject: bookForm.subject,
        cover_url: bookForm.cover_url || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=600&q=80',
        summary: bookForm.summary || `A book on ${bookForm.subject} by ${bookForm.author}.`,
        extract: bookForm.extract || parsedPages[0].slice(0, 120) + '...',
        pages: parsedPages
      };
      try {
        await supabase.from('books').insert([newBook]);
        setBooks([newBook, ...books]);
        alert("✅ Book created!");
      } catch (err) { alert("Create failed: " + err.message); }
    }
    setBookForm({ title: '', author: '', subject: 'Dhivehi', cover_url: '', summary: '', extract: '', pageText: '' });
  };

  const startEditBook = (book) => {
    setEditingBook(book);
    setBookForm({
      title: book.title,
      author: book.author,
      subject: book.subject,
      cover_url: book.cover_url || '',
      summary: book.summary || '',
      extract: book.extract || '',
      pageText: Array.isArray(book.pages) ? book.pages.join('\n\n---PAGE---\n\n') : book.pages
    });
  };

  const handleDeleteBook = async (id) => {
    if (confirm("Delete this book?")) {
      try { await supabase.from('books').delete().eq('id', id); } catch (e) { console.warn(e); }
      setBooks(books.filter(b => b.id !== id));
    }
  };

  const handleSavePrize = async (e) => {
    e.preventDefault();
    if (!prizeForm.name || !prizeForm.cost) return alert("Please fill prize name and cost.");

    if (editingPrize) {
      const updatedPrize = { ...editingPrize, name: prizeForm.name, category: prizeForm.category, cost: parseInt(prizeForm.cost), icon: prizeForm.icon, desc: prizeForm.desc };
      try {
        await supabase.from('shop_items').update(updatedPrize).eq('id', editingPrize.id);
        setShopItems(shopItems.map(i => i.id === editingPrize.id ? updatedPrize : i));
        setEditingPrize(null);
        alert("✅ Shop prize updated!");
      } catch (err) { alert("Update failed: " + err.message); }
    } else {
      const newPrize = { id: `item_${Date.now()}`, name: prizeForm.name, category: prizeForm.category, cost: parseInt(prizeForm.cost), icon: prizeForm.icon, desc: prizeForm.desc };
      try {
        await supabase.from('shop_items').insert([newPrize]);
        setShopItems([newPrize, ...shopItems]);
        alert("✅ Shop prize created!");
      } catch (err) { alert("Create failed: " + err.message); }
    }
    setPrizeForm({ name: '', category: 'Privilege', cost: 200, icon: '🎁', desc: '' });
  };

  const startEditPrize = (item) => {
    setEditingPrize(item);
    setPrizeForm({ name: item.name, category: item.category, cost: item.cost, icon: item.icon, desc: item.desc || '' });
  };

  const handleDeletePrize = async (id) => {
    if (confirm("Delete this shop prize?")) {
      try { await supabase.from('shop_items').delete().eq('id', id); } catch (e) { console.warn(e); }
      setShopItems(shopItems.filter(i => i.id !== id));
    }
  };

  const handleSaveBadge = async (e) => {
    e.preventDefault();
    if (!badgeForm.title || !badgeForm.desc) return alert("Please fill badge title and description.");

    const formattedBadge = {
      title: badgeForm.title,
      desc: badgeForm.desc,
      icon: badgeForm.icon || '🏅',
      min_quizzes: parseInt(badgeForm.minQuizzes) || 0,
      min_books: parseInt(badgeForm.minBooks) || 0,
      min_xp: parseInt(badgeForm.minXp) || 0,
      min_coins: parseInt(badgeForm.minCoins) || 0,
      min_streak: parseInt(badgeForm.minStreak) || 0
    };

    if (editingBadge) {
      const updated = { ...editingBadge, ...formattedBadge };
      try {
        await supabase.from('badges').update(updated).eq('id', editingBadge.id);
        setBadges(badges.map(b => b.id === editingBadge.id ? updated : b));
        setEditingBadge(null);
        alert("✅ Badge updated!");
      } catch (err) { alert("Update failed: " + err.message); }
    } else {
      const newBadge = { id: `b_${Date.now()}`, ...formattedBadge };
      try {
        await supabase.from('badges').insert([newBadge]);
        setBadges([newBadge, ...badges]);
        alert("✅ Badge created!");
      } catch (err) { alert("Create failed: " + err.message); }
    }
    setBadgeForm({ title: '', desc: '', icon: '🏅', minQuizzes: 0, minBooks: 0, minXp: 0, minCoins: 0, minStreak: 0 });
  };

  const startEditBadge = (badge) => {
    setEditingBadge(badge);
    setBadgeForm({
      title: badge.title,
      desc: badge.desc,
      icon: badge.icon || '🏅',
      minQuizzes: badge.min_quizzes || badge.minQuizzes || 0,
      minBooks: badge.min_books || badge.minBooks || 0,
      minXp: badge.min_xp || badge.minXp || 0,
      minCoins: badge.min_coins || badge.minCoins || 0,
      minStreak: badge.min_streak || badge.minStreak || 0
    });
  };

  const handleDeleteBadge = async (id) => {
    if (confirm("Delete this badge?")) {
      try { await supabase.from('badges').delete().eq('id', id); } catch (e) { console.warn(e); }
      setBadges(badges.filter(b => b.id !== id));
    }
  };

  const handleSaveQuizMetadata = async (e) => {
    e.preventDefault();
    if (!quizForm.title) return alert("Please enter a quiz title.");

    if (editingQuiz) {
      const updatedQuiz = {
        ...editingQuiz,
        title: quizForm.title,
        subject: quizForm.subject,
        grade: parseInt(quizForm.grade),
        subject_code: quizForm.subject_code,
        exam_year: parseInt(quizForm.exam_year),
        variant: quizForm.variant,
        is_past_paper: quizForm.is_past_paper
      };
      try {
        await supabase.from('quizzes').update(updatedQuiz).eq('id', editingQuiz.id);
        setQuizzes(quizzes.map(q => q.id === editingQuiz.id ? updatedQuiz : q));
        setEditingQuiz(null);
        alert("✅ Quiz updated!");
      } catch (err) { alert("Update failed: " + err.message); }
    }
  };

  const startEditQuiz = (quiz) => {
    setEditingQuiz(quiz);
    setQuizForm({
      title: quiz.title,
      subject: quiz.subject || 'Maths',
      grade: quiz.grade || 7,
      subject_code: quiz.subject_code || '',
      exam_year: quiz.exam_year || 2024,
      variant: quiz.variant || 'Paper 12',
      is_past_paper: quiz.is_past_paper === true || quiz.is_past_paper === 'true'
    });
  };

  const deleteQuiz = async (quizId) => {
    if (confirm('Delete this quiz?')) {
      try { await supabase.from('quizzes').delete().eq('id', quizId); } catch (e) { console.warn(e); }
      setQuizzes((prev) => prev.filter(q => q.id !== quizId));
    }
  };

  // --- Teacher Studio JSON Import ---
  const handleJsonImport = async () => {
    setStudioMsg({ type: '', text: '' });
    try {
      const parsed = JSON.parse(jsonInputText);
      if (!Array.isArray(parsed)) throw new Error("JSON must be an array of question objects [...]");

      const formattedQuestions = parsed.map((q, idx) => ({
        id: `q_json_${Date.now()}_${idx}`,
        question_text: q.question_text || q.question || 'Question Text',
        option_a: q.option_a || (q.options ? q.options[0] : 'Option A'),
        option_b: q.option_b || (q.options ? q.options[1] : 'Option B'),
        option_c: q.option_c || (q.options ? q.options[2] : 'Option C'),
        option_d: q.option_d || (q.options ? q.options[3] : 'Option D'),
        correct_option: (q.correct_option || q.answer || 'A').toUpperCase().charAt(0),
        explanation: q.explanation || 'No step-by-step explanation provided.'
      }));

      const isOLevel = targetArena === 'olevel';
      const newQuiz = {
        id: `quiz_${Date.now()}`,
        title: isOLevel
          ? `Cambridge O-Level ${studioSubject} (${studioSubjectCode}) - ${studioYear} ${studioVariant}`
          : `Grade ${studioGrade} ${studioSubject} Practice Test (${studioYear})`,
        subject: studioSubject,
        grade: isOLevel ? 10 : parseInt(studioGrade),
        subject_code: isOLevel ? studioSubjectCode : null,
        exam_year: parseInt(studioYear),
        variant: isOLevel ? studioVariant : null,
        is_past_paper: isOLevel,
        questions: formattedQuestions
      };

      const { error } = await supabase.from('quizzes').insert([newQuiz]);
      if (error) throw error;

      setQuizzes((prev) => [newQuiz, ...prev]);
      setStudioMsg({ type: 'success', text: `✅ Saved quiz with ${formattedQuestions.length} questions to database!` });
    } catch (err) {
      setStudioMsg({ type: 'error', text: `Failed to save quiz: ${err.message}` });
    }
  };

  // --- Filtered Datasets ---
  const gradePracticeQuizzes = quizzes.filter(q => {
    const isGradeMatch = q.grade === parseInt(studentGrade);
    const isNotPastPaper = !q.is_past_paper;
    const isSubjectMatch = selectedSubject === 'All' || q.subject === selectedSubject;
    const matchesSearch = (q.title || '').toLowerCase().includes(searchQuery.toLowerCase());
    return isGradeMatch && isNotPastPaper && isSubjectMatch && matchesSearch;
  });

  const oLevelQuizzes = quizzes.filter(q => {
    const matchesSearch = (q.title || '').toLowerCase().includes(searchQuery.toLowerCase());
    const isSubjectMatch = selectedSubject === 'All' || q.subject === selectedSubject;
    const isPast = q.is_past_paper === true || q.is_past_paper === 'true';
    return isPast && matchesSearch && isSubjectMatch;
  });

  const filteredLibraryBooks = books.filter(b => selectedSubject === 'All' || b.subject === selectedSubject);
  const currentBookBatch = filteredLibraryBooks.slice(bookBatchIndex * 3, (bookBatchIndex * 3) + 3);

  const rotateBookBatch = () => {
    const totalBatches = Math.ceil(filteredLibraryBooks.length / 3) || 1;
    setBookBatchIndex((prev) => (prev + 1) % totalBatches);
  };

  const currentRank = getStudentRank(xp);

  // =========================================================================
  // --- AUTHENTICATION & LANDING PAGE VIEWS (UNAUTHENTICATED) ---
  // =========================================================================
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between font-sans relative overflow-hidden">
        {/* Ambient Glow Elements */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Landing Navigation Header */}
        <header className="max-w-7xl w-full mx-auto px-6 py-6 flex items-center justify-between z-10">
          <div onClick={() => setAuthView('landing')} className="flex items-center space-x-3 cursor-pointer">
            <div className="bg-gradient-to-tr from-indigo-500 to-purple-600 p-2.5 rounded-2xl shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-white">
                EduSpark <span className="text-indigo-400">IQ</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-medium">Educational Portal & E-Library</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setAuthView('login')}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition ${authView === 'login' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-300 hover:text-white'}`}
            >
              Sign In
            </button>
            <button
              onClick={() => setAuthView('register')}
              className="bg-white hover:bg-slate-100 text-slate-900 px-5 py-2 rounded-xl text-xs font-bold shadow-md transition"
            >
              Register Now
            </button>
          </div>
        </header>

        {/* HERO / LANDING PAGE VIEW */}
        {authView === 'landing' && (
          <main className="max-w-6xl w-full mx-auto px-6 py-12 z-10 flex-1 flex flex-col justify-center items-center text-center space-y-10">
            <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/30 px-4 py-1.5 rounded-full text-indigo-300 text-xs font-bold">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Next-Generation School Portal for Students & Teachers</span>
            </div>

            <div className="space-y-4 max-w-3xl">
              <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
                Empowering Students with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">Smart Diagnostic Learning</span>
              </h1>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
                Access Cambridge O-Level past papers, grade practice vaults, bilingual Dhivehi and Islam library e-books, gamified reward systems, and real-time teacher analytics.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
              <button
                onClick={() => setAuthView('register')}
                className="w-full sm:w-auto bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold px-8 py-3.5 rounded-2xl text-sm shadow-xl transition flex items-center justify-center space-x-2"
              >
                <span>Get Started — Student / Teacher</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setAuthView('login')}
                className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold px-8 py-3.5 rounded-2xl text-sm transition"
              >
                Existing User Sign In
              </button>
            </div>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full pt-8 text-left">
              <div className="bg-slate-800/60 border border-slate-700/60 p-5 rounded-3xl space-y-2">
                <div className="w-10 h-10 bg-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-400">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white">Cambridge O-Level Arena</h3>
                <p className="text-xs text-slate-400">Interactive timed practice with instant explanations and score reports.</p>
              </div>

              <div className="bg-slate-800/60 border border-slate-700/60 p-5 rounded-3xl space-y-2">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400">
                  <Library className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white">Interactive E-Library</h3>
                <p className="text-xs text-slate-400">Dhivehi (ދިވެހި), Islam, and English books with mobile font scaling & themes.</p>
              </div>

              <div className="bg-slate-800/60 border border-slate-700/60 p-5 rounded-3xl space-y-2">
                <div className="w-10 h-10 bg-amber-500/20 rounded-2xl flex items-center justify-center text-amber-400">
                  <BarChart2 className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white">Class Misconception Inspector</h3>
                <p className="text-xs text-slate-400">Question-level error tracking for teachers to pinpoint weak class areas.</p>
              </div>

              <div className="bg-slate-800/60 border border-slate-700/60 p-5 rounded-3xl space-y-2">
                <div className="w-10 h-10 bg-purple-500/20 rounded-2xl flex items-center justify-center text-purple-400">
                  <Coins className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white">Gamified Rewards</h3>
                <p className="text-xs text-slate-400">Earn EduCoins for reading and testing to redeem shop privileges.</p>
              </div>
            </div>
          </main>
        )}

        {/* LOGIN MODAL (User ID/Email + Password ONLY) */}
        {authView === 'login' && (
          <main className="max-w-md w-full mx-auto px-6 py-12 z-10 flex-1 flex flex-col justify-center">
            <div className="bg-slate-800 border border-slate-700 p-8 rounded-3xl shadow-2xl space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-black text-white">Welcome Back</h2>
                <p className="text-xs text-slate-400">Sign in to your EduSpark IQ account</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5">User ID / Email Address</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      placeholder="student@school.edu"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-bold text-slate-300">Password</label>
                    <button
                      type="button"
                      onClick={() => setAuthView('forgot_password')}
                      className="text-[11px] font-bold text-indigo-400 hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl text-xs transition shadow-md"
                >
                  {authLoading ? 'Signing In...' : 'Sign In'}
                </button>
              </form>

              <div className="text-center pt-2 border-t border-slate-700/60">
                <p className="text-xs text-slate-400">
                  Don't have an account?{' '}
                  <button onClick={() => setAuthView('register')} className="text-indigo-400 font-bold hover:underline">
                    Register Now
                  </button>
                </p>
              </div>
            </div>
          </main>
        )}

        {/* REGISTER MODAL (Name, Email, Password, Grade, Index #) */}
        {authView === 'register' && (
          <main className="max-w-md w-full mx-auto px-6 py-8 z-10 flex-1 flex flex-col justify-center">
            <div className="bg-slate-800 border border-slate-700 p-8 rounded-3xl shadow-2xl space-y-5">
              <div className="text-center space-y-1">
                <h2 className="text-2xl font-black text-white">Create Account</h2>
                <p className="text-xs text-slate-400">Register as a Student or Teacher</p>
              </div>

              <form onSubmit={handleRegister} className="space-y-3.5">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Account Role</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole('student')}
                      className={`py-2 text-xs font-bold rounded-xl border transition ${role === 'student' ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'}`}
                    >
                      🎓 Student
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('teacher')}
                      className={`py-2 text-xs font-bold rounded-xl border transition ${role === 'teacher' ? 'bg-purple-600 border-purple-600 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'}`}
                    >
                      👨‍🏫 Teacher
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Full Name</label>
                  <input
                    type="text"
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Email Address</label>
                  <input
                    type="email"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="email@school.edu"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Password</label>
                  <input
                    type="password"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    required
                  />
                </div>

                {role === 'student' ? (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Grade Level</label>
                      <select
                        value={studentGrade}
                        onChange={(e) => setStudentGrade(parseInt(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(g => (
                          <option key={g} value={g}>Grade {g}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Index Number</label>
                      <input
                        type="text"
                        value={indexNumber}
                        onChange={(e) => setIndexNumber(e.target.value)}
                        placeholder="STU-2026-104"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                        required
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="text-xs font-bold text-purple-300 block mb-1">Admin Passcode</label>
                    <input
                      type="password"
                      value={teacherPasscode}
                      onChange={(e) => setTeacherPasscode(e.target.value)}
                      placeholder="SCH-TEACHER-2026"
                      className="w-full bg-slate-900 border border-purple-500/40 rounded-xl px-3 py-2 text-xs font-mono text-purple-200"
                      required
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs transition shadow-md mt-2"
                >
                  {authLoading ? 'Creating Account...' : 'Complete Registration'}
                </button>
              </form>

              <div className="text-center pt-2 border-t border-slate-700/60">
                <p className="text-xs text-slate-400">
                  Already registered?{' '}
                  <button onClick={() => setAuthView('login')} className="text-indigo-400 font-bold hover:underline">
                    Sign In
                  </button>
                </p>
              </div>
            </div>
          </main>
        )}

        {/* FORGOT PASSWORD MODAL */}
        {authView === 'forgot_password' && (
          <main className="max-w-md w-full mx-auto px-6 py-12 z-10 flex-1 flex flex-col justify-center">
            <div className="bg-slate-800 border border-slate-700 p-8 rounded-3xl shadow-2xl space-y-6">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto">
                  <HelpCircle className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-black text-white">Reset Password</h2>
                <p className="text-xs text-slate-400">Enter your email to receive a password reset link.</p>
              </div>

              {resetSent ? (
                <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-2xl text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                  <p className="text-xs font-bold text-emerald-300">Password Reset Link Sent!</p>
                  <p className="text-[11px] text-slate-400">Please check your email inbox to set a new password.</p>
                  <button
                    onClick={() => { setResetSent(false); setAuthView('login'); }}
                    className="mt-2 bg-indigo-600 text-white font-bold px-4 py-2 rounded-xl text-xs"
                  >
                    Return to Sign In
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1.5">Registered Email</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        type="email"
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        placeholder="email@school.edu"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-slate-500"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl text-xs transition shadow-md"
                  >
                    {authLoading ? 'Sending Reset Email...' : 'Send Reset Link'}
                  </button>
                </form>
              )}

              <div className="text-center pt-2 border-t border-slate-700/60">
                <button onClick={() => setAuthView('login')} className="text-xs text-slate-400 hover:text-white font-bold">
                  ← Back to Sign In
                </button>
              </div>
            </div>
          </main>
        )}

        <footer className="py-4 text-center text-xs text-slate-500 border-t border-slate-800">
          EduSpark IQ © 2026 • School Student Portal & E-Library
        </footer>
      </div>
    );
  }

  // =========================================================================
  // --- AUTHENTICATED PORTAL APP INTERFACE ---
  // =========================================================================
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-xs print:hidden">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center justify-between w-full sm:w-auto">
            <div 
              onClick={() => navigateToTab('dashboard')} 
              className="flex items-center space-x-3 cursor-pointer hover:opacity-85 transition"
            >
              <div className="bg-gradient-to-tr from-indigo-600 to-purple-600 p-2 rounded-xl shadow-md">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-black tracking-tight text-slate-900">
                  EduSpark <span className="text-indigo-600">IQ</span>
                </h1>
                <p className="text-[11px] text-slate-500 font-medium">School Student Portal & E-Library</p>
              </div>
            </div>

            <button onClick={handleLogout} className="sm:hidden p-2 text-slate-400 hover:text-slate-700 rounded-lg">
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 sm:gap-3 w-full sm:w-auto">
            <div className="flex items-center space-x-2.5 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-full text-xs font-bold text-slate-700">
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-black ${currentRank.bg} ${currentRank.text}`}>
                {role === 'teacher' ? '👨‍🏫 Teacher' : currentRank.title}
              </span>
              <div className="flex items-center space-x-1 text-amber-600">
                <Coins className="w-3.5 h-3.5" />
                <span>{coins}</span>
              </div>
              <div className="flex items-center space-x-1 text-indigo-600">
                <Zap className="w-3.5 h-3.5" />
                <span>{xp} XP</span>
              </div>
            </div>

            <button
              onClick={() => navigateToTab('profile')}
              className="flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 px-3 py-1.5 rounded-xl transition text-xs font-bold text-slate-700"
            >
              <User className="w-3.5 h-3.5 text-indigo-600" />
              <span>{authName || 'Profile'}</span>
            </button>

            <button onClick={handleLogout} className="hidden sm:block p-2 text-slate-400 hover:text-slate-700 rounded-lg">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="max-w-7xl mx-auto px-4 flex items-center space-x-1 sm:space-x-2 overflow-x-auto text-xs border-t border-slate-100 py-1.5 scrollbar-none">
          <button
            onClick={() => navigateToTab('dashboard')}
            className={`px-3.5 py-1.5 font-bold flex items-center space-x-1.5 rounded-xl transition shrink-0 whitespace-nowrap ${activeTab === 'dashboard' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-600" /> <span>Grade {studentGrade} Vault</span>
          </button>

          <button
            onClick={() => navigateToTab('library')}
            className={`px-3.5 py-1.5 font-bold flex items-center space-x-1.5 rounded-xl transition shrink-0 whitespace-nowrap ${activeTab === 'library' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <Library className="w-3.5 h-3.5 text-emerald-600" /> <span>Online Library & Dhivehi Section</span>
          </button>

          <button
            onClick={() => navigateToTab('olevel')}
            className={`px-3.5 py-1.5 font-bold flex items-center space-x-1.5 rounded-xl transition shrink-0 whitespace-nowrap ${activeTab === 'olevel' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <GraduationCap className="w-3.5 h-3.5 text-amber-600" /> <span>O-Level Arena</span>
          </button>

          <button
            onClick={() => navigateToTab('shop')}
            className={`px-3.5 py-1.5 font-bold flex items-center space-x-1.5 rounded-xl transition shrink-0 whitespace-nowrap ${activeTab === 'shop' ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <ShoppingBag className="w-3.5 h-3.5 text-amber-600" /> <span>Reward Shop</span>
          </button>

          <button
            onClick={() => navigateToTab('profile')}
            className={`px-3.5 py-1.5 font-bold flex items-center space-x-1.5 rounded-xl transition shrink-0 whitespace-nowrap ${activeTab === 'profile' ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <User className="w-3.5 h-3.5 text-purple-600" /> <span>My Profile & Stats</span>
          </button>

          <button
            onClick={() => { navigateToTab('leaderboard'); fetchLeaderboard(); }}
            className={`px-3.5 py-1.5 font-bold flex items-center space-x-1.5 rounded-xl transition shrink-0 whitespace-nowrap ${activeTab === 'leaderboard' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <Trophy className="w-3.5 h-3.5 text-yellow-600" /> <span>Leaderboard</span>
          </button>

          {(role === 'teacher' || role === 'admin') && (
            <>
              <button
                onClick={() => navigateToTab('studio')}
                className={`px-3.5 py-1.5 font-bold flex items-center space-x-1.5 rounded-xl transition shrink-0 whitespace-nowrap ${activeTab === 'studio' ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                <BrainCircuit className="w-3.5 h-3.5 text-purple-600" /> <span>Teacher Studio</span>
              </button>

              <button
                onClick={() => navigateToTab('settings')}
                className={`px-3.5 py-1.5 font-bold flex items-center space-x-1.5 rounded-xl transition shrink-0 whitespace-nowrap ${activeTab === 'settings' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                <Settings className="w-3.5 h-3.5 text-rose-600" /> <span>⚙️ Admin Settings</span>
              </button>
            </>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">

        {/* TAB 1: PRACTICE VAULT */}
        {activeTab === 'dashboard' && !activeQuiz && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-black text-slate-900">Grade {studentGrade} Practice Vault</h3>
                <p className="text-xs text-slate-500">Unlimited practice mode open for all students. Challenge mode is 1-attempt per quiz.</p>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search quizzes..."
                  className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800"
                />
                <select
                  value={studentGrade}
                  onChange={(e) => setStudentGrade(parseInt(e.target.value))}
                  className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-indigo-600"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(g => (
                    <option key={g} value={g}>Grade {g}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-2 overflow-x-auto scrollbar-none py-1 w-full">
              <button
                onClick={() => setSelectedSubject('All')}
                className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap ${selectedSubject === 'All' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                All Subjects
              </button>
              {ALL_SUBJECTS.map((subj) => (
                <button
                  key={subj}
                  onClick={() => setSelectedSubject(subj)}
                  className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap ${subj === 'Dhivehi' || subj === 'Islam' ? 'font-faruma' : ''} ${selectedSubject === subj ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                >
                  {subj === 'Dhivehi' ? '🇲🇻 ދިވެހި' : subj === 'Islam' ? '☪️ އިސްލާމް' : subj}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {gradePracticeQuizzes.map((quiz) => {
                const isChallengeDone = completedChallenges.includes(quiz.id);
                return (
                  <div key={quiz.id} className="bg-white border border-slate-200 rounded-3xl p-5 flex flex-col justify-between hover:border-indigo-300 transition shadow-xs">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg font-bold">
                          {quiz.subject}
                        </span>
                        {(role === 'teacher' || role === 'admin') && (
                          <button onClick={() => deleteQuiz(quiz.id)} className="p-1 text-slate-400 hover:text-red-600">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mb-2">{quiz.title}</h3>
                      <p className="text-xs text-slate-500 mb-4">{quiz.questions.length} Questions</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100">
                      <button onClick={() => startQuiz(quiz, 'practice')} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-xl text-xs font-bold transition">
                        Practice
                      </button>
                      
                      <button
                        onClick={() => startQuiz(quiz, 'challenge')}
                        disabled={isChallengeDone}
                        className={`w-full py-2 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1 ${isChallengeDone ? 'bg-emerald-50 border border-emerald-200 text-emerald-700 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'}`}
                      >
                        {isChallengeDone ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>✓ Completed</span>
                          </>
                        ) : (
                          <>
                            <Flame className="w-3.5 h-3.5 text-amber-300" />
                            <span>Challenge</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: ONLINE LIBRARY WITH COVERS & EXTRACTS */}
        {activeTab === 'library' && !activeQuiz && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-emerald-800 via-teal-700 to-cyan-800 text-white p-6 sm:p-8 rounded-3xl shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <div className="flex items-center space-x-2">
                  <Languages className="w-6 h-6 text-emerald-300" />
                  <h2 className="text-2xl sm:text-3xl font-black">Interactive E-Library</h2>
                </div>
                <p className="text-xs text-emerald-100">
                  Read books in English, Dhivehi (ދިވެހި), and Islam. Completing a book awards EduCoins and permanently updates your library profile.
                </p>
              </div>

              <button onClick={rotateBookBatch} className="bg-white text-emerald-800 font-bold px-4 py-2 rounded-xl text-xs shadow-md hover:bg-emerald-50 transition">
                🔄 Load Next Set of Books
              </button>
            </div>

            {/* Subject Filter Bar */}
            <div className="flex items-center space-x-2 overflow-x-auto scrollbar-none py-1 w-full">
              <button
                onClick={() => { setSelectedSubject('All'); setBookBatchIndex(0); }}
                className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap ${selectedSubject === 'All' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                All Subjects
              </button>
              {ALL_SUBJECTS.map((subj) => (
                <button
                  key={subj}
                  onClick={() => { setSelectedSubject(subj); setBookBatchIndex(0); }}
                  className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap ${subj === 'Dhivehi' || subj === 'Islam' ? 'font-faruma' : ''} ${selectedSubject === subj ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                >
                  {subj === 'Dhivehi' ? '🇲🇻 ދިވެހި' : subj === 'Islam' ? '☪️ އިސްލާމް' : subj}
                </button>
              ))}
            </div>

            {/* Book Grid Cards with Cover Images & Extracts */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {currentBookBatch.map((book) => {
                const isRTL = isRTLSubject(book.subject);
                const isCompleted = completedBookIds.includes(book.id);

                return (
                  <div key={book.id} className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between">
                    <div>
                      {/* Cover Image Container */}
                      <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                        <img
                          src={book.cover_url || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=600&q=80'}
                          alt={book.title}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        />
                        
                        {/* Subject Badge */}
                        <span className={`absolute top-3 left-3 text-[11px] font-bold px-2.5 py-1 rounded-xl shadow-xs ${isRTL ? 'bg-amber-500 text-white font-faruma' : 'bg-emerald-600 text-white'}`}>
                          {book.subject}
                        </span>

                        {/* Completed Badge */}
                        {isCompleted && (
                          <span className="absolute top-3 right-3 bg-emerald-500 text-white text-[10px] font-black px-2.5 py-1 rounded-xl flex items-center space-x-1 shadow-xs">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Read</span>
                          </span>
                        )}
                      </div>

                      {/* Card Body & Extract */}
                      <div className="p-5 space-y-3">
                        <div className={isRTL ? 'text-right font-faruma' : 'text-left'} dir={isRTL ? 'rtl' : 'ltr'}>
                          <h4 className={`font-black text-slate-900 ${isRTL ? 'text-xl' : 'text-base'}`}>{book.title}</h4>
                          <p className="text-xs text-slate-400 mt-0.5">By {book.author}</p>
                          
                          {/* Extract / Teaser Box */}
                          <div className={`mt-3 p-3 bg-slate-50 border border-slate-100 rounded-2xl text-slate-600 italic ${isRTL ? 'text-xs leading-relaxed font-faruma' : 'text-xs leading-relaxed font-serif'}`}>
                            "{book.extract || (Array.isArray(book.pages) ? book.pages[0].slice(0, 120) + '...' : book.pages.slice(0, 120) + '...')}"
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Read Action Button */}
                    <div className="p-5 pt-0">
                      <button
                        onClick={() => openBookModal(book)}
                        className={`w-full text-white font-bold py-2.5 rounded-2xl text-xs transition flex items-center justify-center space-x-1.5 ${
                          isCompleted
                            ? 'bg-slate-800 hover:bg-slate-900'
                            : isRTL
                            ? 'bg-amber-600 hover:bg-amber-700 font-faruma text-sm'
                            : 'bg-emerald-600 hover:bg-emerald-700'
                        }`}
                      >
                        <BookOpen className="w-4 h-4" />
                        <span>{isCompleted ? (isRTL ? 'އަލުން ކިޔާ' : 'Read Again') : (isRTL ? 'ފޮތް ކިޔަން ފަށާ' : 'Read Book')}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: O-LEVEL ARENA */}
        {activeTab === 'olevel' && !activeQuiz && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-amber-900 via-yellow-900 to-amber-950 text-white rounded-3xl p-6 sm:p-8 shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black">O-Level Past Paper Arena 🎓</h2>
                <p className="text-xs text-amber-100">Official Cambridge O-Level exam papers across all subjects.</p>
              </div>

              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search past papers..."
                  className="bg-white/10 text-white placeholder-amber-200 border border-amber-700/50 rounded-xl px-3 py-1.5 text-xs w-full sm:w-48 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 overflow-x-auto scrollbar-none py-1 w-full">
              <button
                onClick={() => setSelectedSubject('All')}
                className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap ${selectedSubject === 'All' ? 'bg-amber-600 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                All Subjects
              </button>
              {ALL_SUBJECTS.map((subj) => (
                <button
                  key={subj}
                  onClick={() => setSelectedSubject(subj)}
                  className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap ${subj === 'Dhivehi' || subj === 'Islam' ? 'font-faruma' : ''} ${selectedSubject === subj ? 'bg-amber-600 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                >
                  {subj === 'Dhivehi' ? '🇲🇻 ދިވެހި' : subj === 'Islam' ? '☪️ އިސްލާމް' : subj}
                </button>
              ))}
            </div>

            {oLevelQuizzes.length === 0 ? (
              <div className="text-center py-12 bg-white border border-slate-200 rounded-3xl p-6 space-y-3">
                <GraduationCap className="w-10 h-10 text-amber-600 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">No O-Level Past Papers Found for "{selectedSubject}"</h3>
                <p className="text-xs text-slate-500">Teachers can add O-Level past papers for this subject in the Teacher Studio!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {oLevelQuizzes.map((quiz) => {
                  const isChallengeDone = completedChallenges.includes(quiz.id);
                  return (
                    <div key={quiz.id} className="bg-white border border-slate-200 rounded-3xl p-5 flex flex-col justify-between shadow-xs hover:border-amber-300 transition">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs bg-amber-50 text-amber-800 px-2.5 py-1 rounded-lg font-bold">
                            {quiz.subject} {quiz.subject_code ? `(${quiz.subject_code})` : ''}
                          </span>
                          {(role === 'teacher' || role === 'admin') && (
                            <button onClick={() => deleteQuiz(quiz.id)} className="p-1 text-slate-400 hover:text-red-600">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        <h3 className="text-base font-bold text-slate-900">{quiz.title}</h3>
                        <p className="text-xs text-slate-500 mt-1 mb-4">{quiz.questions.length} Exam Questions</p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100">
                        <button onClick={() => startQuiz(quiz, 'practice')} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-xl text-xs font-bold transition">
                          Practice Mode
                        </button>
                        
                        <button
                          onClick={() => startQuiz(quiz, 'challenge')}
                          disabled={isChallengeDone}
                          className={`w-full py-2 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1 ${isChallengeDone ? 'bg-amber-50 border border-amber-200 text-amber-800 cursor-not-allowed' : 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs'}`}
                        >
                          {isChallengeDone ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                              <span>✓ Completed</span>
                            </>
                          ) : (
                            <span>Timed Exam</span>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: REWARD SHOP */}
        {activeTab === 'shop' && !activeQuiz && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white p-6 sm:p-8 rounded-3xl shadow-lg flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black">EduCoins Reward Shop</h2>
                <p className="text-xs text-amber-100">Redeem rewards earned from quizzes!</p>
              </div>
              <div className="bg-white text-amber-600 px-4 py-2 rounded-2xl font-black text-sm">{coins} Coins</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {shopItems.map((item) => (
                <div key={item.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
                  <div>
                    <span className="text-3xl">{item.icon}</span>
                    <h3 className="font-bold text-slate-900 text-base mt-2">{item.name}</h3>
                    <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="font-black text-amber-600 text-sm">{item.cost} Coins</span>
                    <button
                      onClick={() => handleRedeemReward(item)}
                      disabled={coins < item.cost}
                      className={`px-4 py-2 rounded-xl text-xs font-bold ${coins >= item.cost ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-400'}`}
                    >
                      Redeem
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: MY PROFILE & 10-QUIZ SUBJECT ANALYTICS */}
        {activeTab === 'profile' && !activeQuiz && (
          <div className="space-y-6 max-w-5xl mx-auto">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 text-center sm:text-left">
                <div className="w-20 h-20 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center text-white text-3xl font-black shadow-lg">
                  {authName ? authName.charAt(0).toUpperCase() : 'U'}
                </div>

                <div className="space-y-1.5 flex-1">
                  <h2 className="text-2xl font-black text-slate-900">{authName || 'User'}</h2>
                  <p className="text-xs text-slate-500 font-medium">
                    ID: <span className="font-mono font-bold text-indigo-600">{indexNumber}</span> • Grade {studentGrade} • Role: <span className="uppercase font-bold text-purple-600">{role}</span>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-4 border-t border-slate-100">
                <div className="bg-slate-50 p-3.5 rounded-2xl border text-center">
                  <span className="text-[11px] font-bold text-slate-400 block">Quizzes Done</span>
                  <span className="text-lg font-black text-slate-900">{quizzesCompleted}</span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-2xl border text-center">
                  <span className="text-[11px] font-bold text-slate-400 block">Books Read</span>
                  <span className="text-lg font-black text-emerald-600">{completedBookIds.length || booksRead}</span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-2xl border text-center">
                  <span className="text-[11px] font-bold text-slate-400 block">Reading Mins</span>
                  <span className="text-lg font-black text-teal-600">{readingMinutes}m</span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-2xl border text-center">
                  <span className="text-[11px] font-bold text-slate-400 block">EduCoins</span>
                  <span className="text-lg font-black text-amber-600">{coins}</span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-2xl border text-center col-span-2 sm:col-span-1">
                  <span className="text-[11px] font-bold text-slate-400 block">Daily Streak</span>
                  <span className="text-lg font-black text-orange-600">{streak} Days 🔥</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <BarChart2 className="w-6 h-6 text-indigo-600" />
                <h3 className="text-lg font-black text-slate-900">Subject Diagnostics & 10-Quiz Diagnostic Reports</h3>
              </div>
              
              {ALL_SUBJECTS.map((subj) => (
                <SubjectAnalyticsCard
                  key={subj}
                  subject={subj}
                  attempts={challengeAttempts}
                />
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: TEACHER STUDIO */}
        {activeTab === 'studio' && (role === 'teacher' || role === 'admin') && (
          <div className="max-w-5xl mx-auto space-y-6">
            <TeacherStudentTracker subjects={ALL_SUBJECTS} quizzes={quizzes} />

            <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-xs space-y-4">
              <div className="flex items-center space-x-3">
                <BrainCircuit className="w-7 h-7 text-purple-600" />
                <div>
                  <h2 className="text-xl font-black text-slate-900">Teacher Quiz Publishing Studio</h2>
                  <p className="text-xs text-slate-500">Configure metadata and publish custom practice quizzes or O-Level past papers.</p>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Select Target Arena</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setTargetArena('olevel')}
                    className={`py-2.5 rounded-2xl text-xs font-bold border transition ${targetArena === 'olevel' ? 'bg-amber-500 border-amber-500 text-white' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
                  >
                    🎓 O-Level Past Paper Arena
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetArena('vault')}
                    className={`py-2.5 rounded-2xl text-xs font-bold border transition ${targetArena === 'vault' ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
                  >
                    📖 Grade Practice Vault
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                {targetArena === 'vault' ? (
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Grade Level</label>
                    <select
                      value={studioGrade}
                      onChange={(e) => setStudioGrade(parseInt(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(g => (
                        <option key={g} value={g}>Grade {g}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Subject Code</label>
                    <input
                      type="text"
                      value={studioSubjectCode}
                      onChange={(e) => setStudioSubjectCode(e.target.value)}
                      placeholder="e.g. 0625"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                    />
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Subject Name</label>
                  <select
                    value={studioSubject}
                    onChange={(e) => setStudioSubject(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
                  >
                    {ALL_SUBJECTS.map((subj) => (
                      <option key={subj} value={subj}>{subj}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Exam Year</label>
                  <input
                    type="number"
                    value={studioYear}
                    onChange={(e) => setStudioYear(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Paper / Variant</label>
                  <input
                    type="text"
                    value={studioVariant}
                    onChange={(e) => setStudioVariant(e.target.value)}
                    placeholder="Paper 12"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <textarea rows={8} value={jsonInputText} onChange={(e) => setJsonInputText(e.target.value)} className="w-full bg-slate-50 border rounded-xl p-3 text-xs font-mono" />
                <button onClick={handleJsonImport} className="w-full bg-purple-600 text-white font-bold py-3 rounded-2xl text-xs shadow-md hover:bg-purple-700 transition">
                  Save JSON Quiz to Supabase
                </button>
              </div>

              {studioMsg.text && (
                <div className={`p-3 rounded-xl text-xs ${studioMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'}`}>
                  {studioMsg.text}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 7: COMPLETE ADMIN CRUD CENTER */}
        {activeTab === 'settings' && (role === 'teacher' || role === 'admin') && (
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-xs space-y-4">
              <div className="flex items-center space-x-3">
                <Settings className="w-7 h-7 text-rose-600" />
                <div>
                  <h2 className="text-xl font-black text-slate-900">Admin CRUD Management Center</h2>
                  <p className="text-xs text-slate-500">Full Create, Read, Edit, and Delete access for Books, Shop Prizes, Badges, and Quizzes.</p>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2 border-t border-slate-100 overflow-x-auto scrollbar-none">
                <button onClick={() => setAdminTab('books')} className={`px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 whitespace-nowrap ${adminTab === 'books' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>📚 Manage Books ({books.length})</button>
                <button onClick={() => setAdminTab('prizes')} className={`px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 whitespace-nowrap ${adminTab === 'prizes' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600'}`}>🎁 Shop Prizes ({shopItems.length})</button>
                <button onClick={() => setAdminTab('badges')} className={`px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 whitespace-nowrap ${adminTab === 'badges' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600'}`}>🏅 Badges ({badges.length})</button>
                <button onClick={() => setAdminTab('quizzes')} className={`px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 whitespace-nowrap ${adminTab === 'quizzes' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>📝 Quizzes ({quizzes.length})</button>
              </div>
            </div>

            {/* 1. BOOKS CRUD */}
            {adminTab === 'books' && (
              <div className="space-y-6">
                <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-xs space-y-4">
                  <h3 className="text-base font-black text-slate-900">{editingBook ? '✏️ Edit Book' : '➕ Create New Multi-Page Book'}</h3>
                  <form onSubmit={handleSaveBook} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input type="text" value={bookForm.title} onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })} placeholder="Book Title" className="bg-slate-50 border rounded-xl p-2.5 text-xs text-slate-800" required />
                      <input type="text" value={bookForm.author} onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })} placeholder="Author Name" className="bg-slate-50 border rounded-xl p-2.5 text-xs text-slate-800" required />
                      <select value={bookForm.subject} onChange={(e) => setBookForm({ ...bookForm, subject: e.target.value })} className="bg-slate-50 border rounded-xl p-2.5 text-xs font-bold text-slate-800">
                        {ALL_SUBJECTS.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input type="url" value={bookForm.cover_url} onChange={(e) => setBookForm({ ...bookForm, cover_url: e.target.value })} placeholder="Cover Image URL (https://...)" className="bg-slate-50 border rounded-xl p-2.5 text-xs text-slate-800" />
                      <input type="text" value={bookForm.extract} onChange={(e) => setBookForm({ ...bookForm, extract: e.target.value })} placeholder="Short Extract / Teaser" className="bg-slate-50 border rounded-xl p-2.5 text-xs text-slate-800" />
                    </div>
                    <textarea rows={5} value={bookForm.pageText} onChange={(e) => setBookForm({ ...bookForm, pageText: e.target.value })} placeholder="Page text... Use ---PAGE--- for chapter splits." className="w-full bg-slate-50 border rounded-xl p-3 text-xs" required />
                    <div className="flex space-x-2">
                      <button type="submit" className="bg-emerald-600 text-white font-bold px-6 py-2.5 rounded-xl text-xs">{editingBook ? 'Save Changes' : 'Publish Book'}</button>
                      {editingBook && <button type="button" onClick={() => setEditingBook(null)} className="bg-slate-100 text-slate-600 font-bold px-4 py-2.5 rounded-xl text-xs">Cancel</button>}
                    </div>
                  </form>
                </div>

                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-3">
                  <h3 className="text-base font-black text-slate-900">Book Catalog</h3>
                  <div className="divide-y divide-slate-100">
                    {books.map((b) => (
                      <div key={b.id} className="py-3 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <img src={b.cover_url || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=600&q=80'} alt="" className="w-10 h-10 object-cover rounded-lg" />
                          <div>
                            <h4 className="font-bold text-xs text-slate-900">{b.title}</h4>
                            <span className="text-[11px] text-slate-400">{b.subject} • By {b.author}</span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button onClick={() => startEditBook(b)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl"><Edit3 className="w-4 h-4" /></button>
                          <button onClick={() => handleDeleteBook(b.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 2. SHOP PRIZES CRUD */}
            {adminTab === 'prizes' && (
              <div className="space-y-6">
                <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-xs space-y-4">
                  <h3 className="text-base font-black text-slate-900">{editingPrize ? '✏️ Edit Shop Prize' : '➕ Create New Shop Prize'}</h3>
                  <form onSubmit={handleSavePrize} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <input type="text" value={prizeForm.name} onChange={(e) => setPrizeForm({ ...prizeForm, name: e.target.value })} placeholder="Prize Name" className="bg-slate-50 border rounded-xl p-2.5 text-xs text-slate-800" required />
                      <input type="number" value={prizeForm.cost} onChange={(e) => setPrizeForm({ ...prizeForm, cost: e.target.value })} placeholder="EduCoins Cost" className="bg-slate-50 border rounded-xl p-2.5 text-xs text-slate-800" required />
                      <input type="text" value={prizeForm.icon} onChange={(e) => setPrizeForm({ ...prizeForm, icon: e.target.value })} placeholder="Emoji Icon (e.g. 🎟️)" className="bg-slate-50 border rounded-xl p-2.5 text-xs text-slate-800" />
                      <select value={prizeForm.category} onChange={(e) => setPrizeForm({ ...prizeForm, category: e.target.value })} className="bg-slate-50 border rounded-xl p-2.5 text-xs font-bold text-slate-800">
                        <option value="Privilege">Privilege</option>
                        <option value="Digital Perk">Digital Perk</option>
                        <option value="Booster">Booster</option>
                      </select>
                    </div>
                    <input type="text" value={prizeForm.desc} onChange={(e) => setPrizeForm({ ...prizeForm, desc: e.target.value })} placeholder="Reward Description" className="w-full bg-slate-50 border rounded-xl p-2.5 text-xs text-slate-800" />
                    <div className="flex space-x-2">
                      <button type="submit" className="bg-amber-600 text-white font-bold px-6 py-2.5 rounded-xl text-xs">{editingPrize ? 'Save Changes' : 'Create Prize'}</button>
                      {editingPrize && <button type="button" onClick={() => setEditingPrize(null)} className="bg-slate-100 text-slate-600 font-bold px-4 py-2.5 rounded-xl text-xs">Cancel</button>}
                    </div>
                  </form>
                </div>

                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-3">
                  <h3 className="text-base font-black text-slate-900">Shop Catalog</h3>
                  <div className="divide-y divide-slate-100">
                    {shopItems.map((item) => (
                      <div key={item.id} className="py-3 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{item.icon}</span>
                          <div>
                            <h4 className="font-bold text-xs text-slate-900">{item.name}</h4>
                            <span className="text-[11px] text-amber-600 font-bold">{item.cost} Coins • {item.category}</span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button onClick={() => startEditPrize(item)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl"><Edit3 className="w-4 h-4" /></button>
                          <button onClick={() => handleDeletePrize(item.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 3. BADGES CRUD */}
            {adminTab === 'badges' && (
              <div className="space-y-6">
                <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-xs space-y-4">
                  <h3 className="text-base font-black text-slate-900">{editingBadge ? '✏️ Edit Badge' : '➕ Create New Badge'}</h3>
                  <form onSubmit={handleSaveBadge} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input type="text" value={badgeForm.title} onChange={(e) => setBadgeForm({ ...badgeForm, title: e.target.value })} placeholder="Badge Title" className="bg-slate-50 border rounded-xl p-2.5 text-xs text-slate-800" required />
                      <input type="text" value={badgeForm.desc} onChange={(e) => setBadgeForm({ ...badgeForm, desc: e.target.value })} placeholder="Description" className="bg-slate-50 border rounded-xl p-2.5 text-xs text-slate-800" required />
                      <input type="text" value={badgeForm.icon} onChange={(e) => setBadgeForm({ ...badgeForm, icon: e.target.value })} placeholder="Icon (e.g. 🏅)" className="bg-slate-50 border rounded-xl p-2.5 text-xs text-slate-800" />
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block">Min Quizzes</label>
                        <input type="number" value={badgeForm.minQuizzes} onChange={(e) => setBadgeForm({ ...badgeForm, minQuizzes: e.target.value })} className="w-full bg-white border rounded-lg p-1.5 text-xs" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block">Min Books</label>
                        <input type="number" value={badgeForm.minBooks} onChange={(e) => setBadgeForm({ ...badgeForm, minBooks: e.target.value })} className="w-full bg-white border rounded-lg p-1.5 text-xs" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block">Min XP</label>
                        <input type="number" value={badgeForm.minXp} onChange={(e) => setBadgeForm({ ...badgeForm, minXp: e.target.value })} className="w-full bg-white border rounded-lg p-1.5 text-xs" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block">Min Coins</label>
                        <input type="number" value={badgeForm.minCoins} onChange={(e) => setBadgeForm({ ...badgeForm, minCoins: e.target.value })} className="w-full bg-white border rounded-lg p-1.5 text-xs" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block">Min Streak</label>
                        <input type="number" value={badgeForm.minStreak} onChange={(e) => setBadgeForm({ ...badgeForm, minStreak: e.target.value })} className="w-full bg-white border rounded-lg p-1.5 text-xs" />
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <button type="submit" className="bg-purple-600 text-white font-bold px-6 py-2.5 rounded-xl text-xs">{editingBadge ? 'Save Changes' : 'Create Badge'}</button>
                      {editingBadge && <button type="button" onClick={() => setEditingBadge(null)} className="bg-slate-100 text-slate-600 font-bold px-4 py-2.5 rounded-xl text-xs">Cancel</button>}
                    </div>
                  </form>
                </div>

                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-3">
                  <h3 className="text-base font-black text-slate-900">Badges Collection</h3>
                  <div className="divide-y divide-slate-100">
                    {badges.map((b) => (
                      <div key={b.id} className="py-3 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{b.icon || '🏅'}</span>
                          <div>
                            <h4 className="font-bold text-xs text-slate-900">{b.title}</h4>
                            <span className="text-[11px] text-slate-500">{b.desc}</span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button onClick={() => startEditBadge(b)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl"><Edit3 className="w-4 h-4" /></button>
                          <button onClick={() => handleDeleteBadge(b.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 4. QUIZZES CRUD */}
            {adminTab === 'quizzes' && (
              <div className="space-y-6">
                {editingQuiz && (
                  <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-xs space-y-4">
                    <h3 className="text-base font-black text-slate-900">✏️ Edit Quiz Metadata</h3>
                    <form onSubmit={handleSaveQuizMetadata} className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <input type="text" value={quizForm.title} onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })} placeholder="Quiz Title" className="bg-slate-50 border rounded-xl p-2.5 text-xs text-slate-800" required />
                        <select value={quizForm.subject} onChange={(e) => setQuizForm({ ...quizForm, subject: e.target.value })} className="bg-slate-50 border rounded-xl p-2.5 text-xs font-bold text-slate-800">
                          {ALL_SUBJECTS.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                        <select value={quizForm.grade} onChange={(e) => setQuizForm({ ...quizForm, grade: parseInt(e.target.value) })} className="bg-slate-50 border rounded-xl p-2.5 text-xs font-bold text-slate-800">
                          {[1,2,3,4,5,6,7,8,9,10].map(g => (
                            <option key={g} value={g}>Grade {g}</option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <input type="text" value={quizForm.subject_code} onChange={(e) => setQuizForm({ ...quizForm, subject_code: e.target.value })} placeholder="Subject Code (e.g. 0625)" className="bg-slate-50 border rounded-xl p-2.5 text-xs text-slate-800" />
                        <input type="number" value={quizForm.exam_year} onChange={(e) => setQuizForm({ ...quizForm, exam_year: e.target.value })} placeholder="Exam Year" className="bg-slate-50 border rounded-xl p-2.5 text-xs text-slate-800" />
                        <input type="text" value={quizForm.variant} onChange={(e) => setQuizForm({ ...quizForm, variant: e.target.value })} placeholder="Variant (Paper 12)" className="bg-slate-50 border rounded-xl p-2.5 text-xs text-slate-800" />
                      </div>

                      <div className="flex items-center space-x-2 pt-1">
                        <input type="checkbox" id="past_paper_chk" checked={quizForm.is_past_paper} onChange={(e) => setQuizForm({ ...quizForm, is_past_paper: e.target.checked })} />
                        <label htmlFor="past_paper_chk" className="text-xs font-bold text-slate-700">Set as O-Level Past Paper</label>
                      </div>

                      <div className="flex space-x-2">
                        <button type="submit" className="bg-indigo-600 text-white font-bold px-6 py-2.5 rounded-xl text-xs">Save Quiz Changes</button>
                        <button type="button" onClick={() => setEditingQuiz(null)} className="bg-slate-100 text-slate-600 font-bold px-4 py-2.5 rounded-xl text-xs">Cancel</button>
                      </div>
                    </form>
                  </div>
                )}

                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-3">
                  <h3 className="text-base font-black text-slate-900">Published Quizzes Database ({quizzes.length})</h3>
                  <div className="divide-y divide-slate-100">
                    {quizzes.map((q) => (
                      <div key={q.id} className="py-3 flex items-center justify-between">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">{q.subject}</span>
                            {q.is_past_paper && <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800">O-Level</span>}
                          </div>
                          <h4 className="font-bold text-xs text-slate-900 mt-1">{q.title}</h4>
                          <span className="text-[11px] text-slate-400">{q.questions ? q.questions.length : 0} Questions • Grade {q.grade}</span>
                        </div>
                        <div className="flex space-x-2">
                          <button onClick={() => startEditQuiz(q)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl"><Edit3 className="w-4 h-4" /></button>
                          <button onClick={() => deleteQuiz(q.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 8: LEADERBOARD */}
        {activeTab === 'leaderboard' && (
          <div className="max-w-xl mx-auto space-y-4">
            <div className="bg-white border border-slate-200 p-6 rounded-3xl text-center space-y-2 shadow-xs">
              <Trophy className="w-10 h-10 text-yellow-500 mx-auto" />
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">School Leaderboard</h2>
              <p className="text-xs text-slate-500">Live ranks calculated from combined quiz & reading XP!</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl divide-y divide-slate-100 shadow-xs">
              {leaderboardUsers.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">Loading student rankings from Supabase...</div>
              ) : (
                leaderboardUsers.map((s, idx) => (
                  <div key={idx} className="p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-base font-bold w-6">{idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}`}</span>
                      <div>
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900">{s.full_name || 'Student'}</h4>
                        <span className="text-[11px] text-slate-500 font-mono">ID: {s.index_number || 'N/A'} • Grade {s.grade}</span>
                      </div>
                    </div>
                    <span className="text-xs sm:text-sm font-black text-indigo-600">{s.xp} XP</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* MOBILE-OPTIMIZED EASY READING E-BOOK READER MODAL */}
        {selectedBook && (() => {
          const isRTL = isRTLSubject(selectedBook.subject);

          const themeStyles = {
            light: {
              bg: 'bg-white',
              cardBg: 'bg-slate-50 border-slate-200',
              text: 'text-slate-900',
              subText: 'text-slate-500',
              border: 'border-slate-200'
            },
            sepia: {
              bg: 'bg-[#f8f1e5]',
              cardBg: 'bg-[#f0e6d2] border-[#e2d5bd]',
              text: 'text-[#433422]',
              subText: 'text-[#7c664d]',
              border: 'border-[#e2d5bd]'
            },
            dark: {
              bg: 'bg-slate-900',
              cardBg: 'bg-slate-800 border-slate-700',
              text: 'text-slate-100',
              subText: 'text-slate-400',
              border: 'border-slate-800'
            }
          };

          const currentTheme = themeStyles[readerTheme] || themeStyles.light;

          const fontSizeClasses = {
            sm: isRTL ? 'text-sm leading-relaxed' : 'text-xs sm:text-sm leading-relaxed',
            base: isRTL ? 'text-base sm:text-lg leading-loose' : 'text-sm sm:text-base leading-relaxed',
            lg: isRTL ? 'text-lg sm:text-xl leading-loose' : 'text-base sm:text-lg leading-relaxed',
            xl: isRTL ? 'text-xl sm:text-2xl leading-loose' : 'text-lg sm:text-xl leading-relaxed',
            '2xl': isRTL ? 'text-2xl sm:text-3xl leading-loose' : 'text-xl sm:text-2xl leading-relaxed'
          };

          return (
            <div
              className={`fixed inset-0 z-50 flex items-center justify-center ${
                isFullScreenReader ? 'p-0' : 'p-2 sm:p-4 bg-slate-900/70 backdrop-blur-xs'
              }`}
            >
              <div
                className={`${currentTheme.bg} ${currentTheme.text} transition-colors duration-200 ${
                  isFullScreenReader
                    ? 'w-full h-full rounded-none p-4 sm:p-8 flex flex-col justify-between overflow-y-auto'
                    : 'rounded-3xl max-w-3xl w-full p-5 sm:p-8 space-y-5 max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col justify-between border ' + currentTheme.border
                }`}
              >
                {/* HEADER CONTROLS BAR */}
                <div className={`border-b ${currentTheme.border} pb-3 space-y-3`}>
                  <div className="flex items-center justify-between">
                    <div className={isRTL ? 'text-right font-faruma' : 'text-left'} dir={isRTL ? 'rtl' : 'ltr'}>
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md ${isRTL ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                        {selectedBook.subject}
                      </span>
                      <h3 className="text-base sm:text-xl font-black mt-1 leading-snug">{selectedBook.title}</h3>
                      <p className={`text-xs ${currentTheme.subText}`}>By {selectedBook.author}</p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setIsFullScreenReader(!isFullScreenReader)}
                        className={`p-2 rounded-xl text-xs font-bold border transition ${
                          isFullScreenReader ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
                        }`}
                        title={isFullScreenReader ? "Exit Full Screen" : "Read in Full Screen"}
                      >
                        {isFullScreenReader ? '📉 Exit Fullscreen' : '📺 Fullscreen'}
                      </button>

                      <button
                        onClick={() => {
                          setSelectedBook(null);
                          setIsFullScreenReader(false);
                        }}
                        className={`p-2 text-lg font-bold ${currentTheme.subText} hover:opacity-75`}
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  {/* EASY READING TOOLBAR */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <div className="flex items-center space-x-1 bg-slate-100/80 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold border border-slate-200/60 dark:border-slate-700">
                      <span className="text-[10px] text-slate-500 px-1 font-sans">Font Size:</span>
                      <button
                        disabled={readerFontSize === 'sm'}
                        onClick={() => {
                          const sizes = ['sm', 'base', 'lg', 'xl', '2xl'];
                          const idx = sizes.indexOf(readerFontSize);
                          if (idx > 0) setReaderFontSize(sizes[idx - 1]);
                        }}
                        className="px-2 py-1 rounded-lg bg-white dark:bg-slate-700 shadow-2xs font-mono font-black text-slate-800 dark:text-slate-100 disabled:opacity-40"
                      >
                        A-
                      </button>
                      <span className="text-xs font-mono px-1 font-bold uppercase">{readerFontSize}</span>
                      <button
                        disabled={readerFontSize === '2xl'}
                        onClick={() => {
                          const sizes = ['sm', 'base', 'lg', 'xl', '2xl'];
                          const idx = sizes.indexOf(readerFontSize);
                          if (idx < sizes.length - 1) setReaderFontSize(sizes[idx + 1]);
                        }}
                        className="px-2 py-1 rounded-lg bg-white dark:bg-slate-700 shadow-2xs font-mono font-black text-slate-800 dark:text-slate-100 disabled:opacity-40"
                      >
                        A+
                      </button>
                    </div>

                    <div className="flex items-center space-x-1.5 bg-slate-100/80 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold border border-slate-200/60 dark:border-slate-700">
                      <button
                        onClick={() => setReaderTheme('light')}
                        className={`px-2.5 py-1 rounded-lg text-xs transition ${
                          readerTheme === 'light' ? 'bg-white text-slate-900 shadow-2xs font-black' : 'text-slate-500'
                        }`}
                      >
                        ☀️ Light
                      </button>
                      <button
                        onClick={() => setReaderTheme('sepia')}
                        className={`px-2.5 py-1 rounded-lg text-xs transition ${
                          readerTheme === 'sepia' ? 'bg-[#f0e6d2] text-[#433422] shadow-2xs font-black' : 'text-slate-500'
                        }`}
                      >
                        📜 Sepia
                      </button>
                      <button
                        onClick={() => setReaderTheme('dark')}
                        className={`px-2.5 py-1 rounded-lg text-xs transition ${
                          readerTheme === 'dark' ? 'bg-slate-900 text-white shadow-2xs font-black' : 'text-slate-500'
                        }`}
                      >
                        🌙 Dark
                      </button>
                    </div>
                  </div>
                </div>

                {/* READING DISPLAY BODY */}
                <div className="flex-1 my-4">
                  <div
                    dir={isRTL ? 'rtl' : 'ltr'}
                    className={`${currentTheme.cardBg} p-5 sm:p-8 rounded-2xl border ${currentTheme.border} ${currentTheme.text} whitespace-pre-line min-h-[280px] ${
                      fontSizeClasses[readerFontSize]
                    } ${isRTL ? 'text-right font-faruma tracking-wide' : 'text-left font-serif'}`}
                  >
                    {Array.isArray(selectedBook.pages)
                      ? selectedBook.pages[bookPageIndex] || selectedBook.pages[0]
                      : selectedBook.pages}
                  </div>
                </div>

                {/* FOOTER PAGINATION BAR */}
                <div className={`pt-3 border-t ${currentTheme.border} flex items-center justify-between`}>
                  <div className="flex items-center space-x-2">
                    <button
                      disabled={bookPageIndex === 0}
                      onClick={() => setBookPageIndex(p => Math.max(0, p - 1))}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1 ${
                        bookPageIndex === 0 ? 'opacity-40 cursor-not-allowed bg-slate-200/50 text-slate-400' : 'bg-emerald-600 text-white shadow-xs hover:bg-emerald-700'
                      }`}
                    >
                      <ChevronLeft className="w-4 h-4" /> <span>Prev Page</span>
                    </button>

                    <span className="text-xs font-bold px-2">
                      Page {bookPageIndex + 1} of {Array.isArray(selectedBook.pages) ? selectedBook.pages.length : 1}
                    </span>

                    {Array.isArray(selectedBook.pages) && bookPageIndex < selectedBook.pages.length - 1 && (
                      <button
                        onClick={() => setBookPageIndex(p => p + 1)}
                        className="px-3.5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center space-x-1 hover:bg-emerald-700"
                      >
                        <span>Next Page</span> <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {(!Array.isArray(selectedBook.pages) || bookPageIndex === selectedBook.pages.length - 1) && (
                    <button
                      onClick={() => {
                        const newCompleted = Array.from(new Set([...completedBookIds, selectedBook.id]));
                        const newCoins = coins + 15;
                        const newXp = xp + 30;
                        const newBooksCount = booksRead + 1;

                        setSelectedBook(null);
                        setIsFullScreenReader(false);
                        setCompletedBookIds(newCompleted);
                        setCoins(newCoins);
                        setXp(newXp);
                        setBooksRead(newBooksCount);

                        playSound('coin');
                        confetti({ particleCount: 90, spread: 70 });

                        syncProfileToSupabase({
                          coins: newCoins,
                          xp: newXp,
                          books_read: newBooksCount,
                          completed_book_ids: newCompleted
                        });

                        alert("📖 Book Completed! Earned +15 EduCoins and +30 XP! Library status updated.");
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-5 py-2 rounded-xl text-xs shadow-md transition flex items-center space-x-1"
                    >
                      <span>Finish & Claim</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

        {/* Quiz Runner Overlay */}
        {activeQuiz && (
          <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-3xl p-5 sm:p-8 shadow-md">
            {gameOver ? (
              <div className="text-center py-6 space-y-5">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto text-3xl">
                  💔
                </div>
                <h2 className="text-2xl font-black text-slate-900">Game Over!</h2>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  You ran out of hearts (lives) in Challenge Mode. Practice questions in Practice Mode to boost your confidence and try again!
                </p>
                <div className="flex justify-center space-x-3 pt-2">
                  <button
                    onClick={() => startQuiz(activeQuiz, 'practice')}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-6 py-2.5 rounded-xl text-xs transition"
                  >
                    Switch to Practice Mode
                  </button>
                  <button
                    onClick={() => setActiveQuiz(null)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition"
                  >
                    Back to Portal
                  </button>
                </div>
              </div>
            ) : !quizFinished ? (
              <>
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                  <span className="text-xs font-semibold text-slate-500">Question {currentQuestionIdx + 1} of {activeQuiz.questions.length}</span>
                  {quizMode === 'challenge' && (
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1">
                        {[...Array(hearts)].map((_, i) => (
                          <Heart key={i} className="w-4 h-4 text-red-500 fill-red-500" />
                        ))}
                      </div>
                      <div className="flex items-center space-x-1 text-amber-700 font-mono font-bold text-xs bg-amber-50 px-2.5 py-1 rounded-full">
                        <Clock className="w-3.5 h-3.5" /> <span>{timer}s</span>
                      </div>
                    </div>
                  )}
                </div>

                <h2 className="text-base sm:text-lg font-extrabold text-slate-900 mb-6 leading-relaxed">
                  {activeQuiz.questions[currentQuestionIdx].question_text}
                </h2>

                <div className="space-y-2.5 mb-6">
                  {['A', 'B', 'C', 'D'].map((optKey) => {
                    const optionText = activeQuiz.questions[currentQuestionIdx][`option_${optKey.toLowerCase()}`];
                    const isSelected = selectedOption === optKey;
                    const isCorrect = optKey === activeQuiz.questions[currentQuestionIdx].correct_option;

                    let btnStyle = 'bg-slate-50 border-slate-200 text-slate-700';
                    if (showExplanation) {
                      if (isCorrect) btnStyle = 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold';
                      else if (isSelected) btnStyle = 'bg-red-50 border-red-400 text-red-900';
                    }

                    return (
                      <button
                        key={optKey}
                        onClick={() => handleAnswerSubmit(optKey)}
                        disabled={showExplanation}
                        className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition ${btnStyle}`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="w-6 h-6 rounded-lg bg-white border flex items-center justify-center font-bold text-xs text-indigo-700">
                            {optKey}
                          </span>
                          <span className="text-xs sm:text-sm">{optionText}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {showExplanation && (
                  <button
                    onClick={nextQuestion}
                    className="w-full bg-indigo-600 text-white font-bold py-3 rounded-2xl transition flex items-center justify-center space-x-2"
                  >
                    <span>{currentQuestionIdx + 1 < activeQuiz.questions.length ? 'Next Question' : 'Finish Test'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </>
            ) : (
              <div className="text-center py-4 space-y-6">
                <Trophy className="w-12 h-12 text-amber-600 mx-auto" />
                <h2 className="text-2xl font-black text-slate-900">Quiz Complete!</h2>
                <p className="text-xs text-slate-500">Score: {score} / {activeQuiz.questions.length} • +{score * 15} EduCoins</p>
                <button onClick={() => setActiveQuiz(null)} className="bg-indigo-600 text-white font-bold px-8 py-3 rounded-2xl text-xs">Return to Portal</button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}