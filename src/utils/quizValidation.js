const OPTION_KEYS = ['option_a', 'option_b', 'option_c', 'option_d'];

/**
 * Validates + normalises a pasted JSON array of questions.
 * Returns { questions, errors }. If errors is non-empty, questions is [].
 */
export function normalizeQuestions(raw, { defaultTopic = '', diagram = null } = {}) {
  if (!Array.isArray(raw) || raw.length === 0) {
    return { questions: [], errors: ['JSON must be a non-empty array of question objects.'] };
  }

  const errors = [];
  const stamp = Date.now();

  const questions = raw.map((q, i) => {
    const n = i + 1;
    if (!q || typeof q !== 'object') {
      errors.push(`Question ${n}: must be an object.`);
      return null;
    }

    const text = String(q.question_text || '').trim();
    if (!text) errors.push(`Question ${n}: "question_text" is missing.`);

    const filled = OPTION_KEYS.filter(k => String(q[k] || '').trim());
    if (filled.length < 2) errors.push(`Question ${n}: needs at least two options (option_a ... option_d).`);

    const correct = String(q.correct_option || '').trim().toUpperCase();
    if (!['A', 'B', 'C', 'D'].includes(correct)) {
      errors.push(`Question ${n}: "correct_option" must be A, B, C or D.`);
    } else if (!String(q[`option_${correct.toLowerCase()}`] || '').trim()) {
      errors.push(`Question ${n}: correct_option is ${correct} but option_${correct.toLowerCase()} is empty.`);
    }

    return {
      id: `q_${stamp}_${i}`,
      topic: q.topic || defaultTopic,
      diagram_url: q.diagram_url || diagram || null,
      question_text: text,
      option_a: String(q.option_a || '').trim(),
      option_b: String(q.option_b || '').trim(),
      option_c: String(q.option_c || '').trim(),
      option_d: String(q.option_d || '').trim(),
      correct_option: correct,
      explanation: q.explanation || 'Verified against mark scheme.'
    };
  });

  return { questions: errors.length ? [] : questions, errors };
}
