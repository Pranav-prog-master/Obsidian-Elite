'use client';
import { Suspense, useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { generateQuiz, submitQuiz, getSubjects } from '@/services/api';
import { isLoggedIn } from '@/lib/auth';

function QuizPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const subjectIdParam = searchParams.get('subject_id');

  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(subjectIdParam || '');
  const [phase, setPhase] = useState('select'); // select | quiz | result
  const [questions, setQuestions] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timer, setTimer] = useState(60);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoggedIn()) { router.push('/login'); return; }
    getSubjects().then(r => { setSubjects(r.data); if (!selectedSubject && r.data.length) setSelectedSubject(r.data[0].id); });
  }, []);

  // Timer
  useEffect(() => {
    if (phase !== 'quiz') return;
    if (timer === 0) { handleNext(); return; }
    const t = setTimeout(() => setTimer(p => p - 1), 1000);
    return () => clearTimeout(t);
  }, [timer, phase]);

  const startQuiz = async () => {
    if (!selectedSubject) return;
    setLoading(true);
    try {
      const res = await generateQuiz(selectedSubject);
      setQuestions(res.data.questions);
      setSessionId(res.data.session_id);
      setAnswers({});
      setCurrent(0);
      setTimer(60);
      setPhase('quiz');
    } catch (e) {
      alert('Failed to generate quiz. Make sure you have uploaded notes for this subject.');
    } finally { setLoading(false); }
  };

  const handleNext = useCallback(() => {
    if (current < questions.length - 1) {
      setCurrent(p => p + 1);
      setTimer(60);
    } else {
      handleSubmit();
    }
  }, [current, questions.length]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = { session_id: sessionId, answers: Object.entries(answers).map(([qid, ans]) => ({ question_id: qid, user_answer: ans })) };
      const res = await submitQuiz(payload);
      setResult(res.data);
      setPhase('result');
    } catch (e) { alert('Submit failed.'); }
    finally { setLoading(false); }
  };

  const selectAnswer = (qid, opt) => setAnswers(p => ({ ...p, [qid]: opt }));
  const q = questions[current];
  const pct = questions.length ? Math.round(((current + 1) / questions.length) * 100) : 0;

  if (phase === 'select') return (
    <div className="shell">
      <div style={{ width: '100%', maxWidth: 600 }}>
        <Navbar />
        <div className="card anim-2" style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>📝</div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: 'var(--dark)', marginBottom: 8 }}>Generate Quiz</h2>
          <p style={{ color: 'var(--mid)', fontSize: 15, marginBottom: 28 }}>AI will create 10 questions from your uploaded notes</p>
          <select className="inp" value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} style={{ marginBottom: 20, textAlign: 'left' }}>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.exam_target})</option>)}
          </select>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 28 }}>
            {[['⏱', '60s per question'], ['🤖', 'AI generated'], ['📊', '10 questions']].map(([icon, label]) => (
              <div key={label} style={{ background: 'rgba(42,157,143,0.08)', borderRadius: 12, padding: '10px 16px', fontSize: 13, color: 'var(--mid)' }}>
                {icon} {label}
              </div>
            ))}
          </div>
          <button className="btn btn-teal" onClick={startQuiz} disabled={loading || !selectedSubject} style={{ width: '100%', justifyContent: 'center', fontSize: 15 }}>
            {loading ? 'Generating quiz...' : 'Start Quiz →'}
          </button>
        </div>
      </div>
    </div>
  );

  if (phase === 'quiz' && q) return (
    <div className="shell">
      <div style={{ width: '100%', maxWidth: 700 }}>
        <Navbar />
        {/* Progress */}
        <div className="anim-1" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 8 }}>
            <span>Question {current + 1} of {questions.length}</span>
            <span>{pct}% complete</span>
          </div>
          <div className="progress-track"><div className="progress-fill" style={{ width: `${pct}%` }} /></div>
        </div>

        <div className="card anim-2" style={{ padding: 32 }}>
          {/* Timer + Q number */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <span className="tag tag-teal">Q{current + 1}</span>
            <div className={`timer-ring ${timer <= 10 ? 'urgent' : ''}`}>{timer}</div>
          </div>

          <h3 style={{ fontSize: 18, fontWeight: 500, color: 'var(--dark)', lineHeight: 1.5, marginBottom: 24 }}>{q.question}</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {['a', 'b', 'c', 'd'].map(opt => (
              <button key={opt} className={`quiz-option ${answers[q.id] === opt ? 'selected' : ''}`}
                onClick={() => selectAnswer(q.id, opt)}>
                <span style={{ fontWeight: 600, color: 'var(--teal)', marginRight: 10 }}>{opt.toUpperCase()}.</span>
                {q[`option_${opt}`]}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24, gap: 12 }}>
            {current > 0 && <button className="btn btn-ghost" onClick={() => { setCurrent(p => p - 1); setTimer(60); }}>← Back</button>}
            <button className="btn btn-teal" onClick={handleNext} disabled={loading}>
              {current === questions.length - 1 ? (loading ? 'Submitting...' : 'Submit Quiz') : 'Next →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (phase === 'result' && result) return (
    <div className="shell">
      <div style={{ width: '100%', maxWidth: 760 }}>
        <Navbar />

        <div className="card anim-1" style={{ padding: 36, marginBottom: 24, textAlign: 'center' }}>
          <div style={{ fontSize: 52, marginBottom: 12 }}>{result.percentage >= 70 ? '🎉' : result.percentage >= 40 ? '👍' : '💪'}</div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: 'var(--dark)', marginBottom: 6 }}>Quiz Complete!</h2>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 48, fontWeight: 700, color: 'var(--teal)', margin: '12px 0' }}>{result.percentage}%</div>
          <p style={{ color: 'var(--mid)', fontSize: 15 }}>{result.score} out of {result.total} correct</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 20 }}>
            <button className="btn btn-teal" onClick={() => { setPhase('select'); setQuestions([]); setResult(null); }}>Take Another Quiz</button>
            <button className="btn btn-ghost" onClick={() => router.push('/performance')}>View Progress</button>
          </div>
        </div>

        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 600, color: 'white', marginBottom: 16 }}>Question Review</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {result.questions?.map((q, i) => (
            <div key={q.id} className="card anim-2" style={{ padding: 24 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 12 }}>
                <span style={{ fontSize: 18 }}>{q.is_correct ? '✅' : '❌'}</span>
                <p style={{ fontSize: 15, color: 'var(--dark)', lineHeight: 1.5 }}>{i + 1}. {q.question_text}</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                {['a', 'b', 'c', 'd'].map(opt => {
                  let cls = 'quiz-option';
                  if (opt === q.correct_option) cls += ' correct';
                  else if (opt === q.user_answer && !q.is_correct) cls += ' wrong';
                  return <div key={opt} className={cls} style={{ cursor: 'default', fontSize: 13 }}><b>{opt.toUpperCase()}.</b> {q[`option_${opt}`]}</div>;
                })}
              </div>
              {!q.is_correct && q.explanation && (
                <div style={{ background: 'rgba(42,157,143,0.06)', borderRadius: 12, padding: '12px 16px', fontSize: 13, color: 'var(--mid)', borderLeft: '3px solid var(--teal)' }}>
                  💡 {q.explanation}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return <div className="shell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p style={{ color: 'white' }}>Loading...</p></div>;
}

export default function QuizPage() {
  return (
    <Suspense fallback={<div className="shell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p style={{ color: 'white' }}>Loading...</p></div>}>
      <QuizPageContent />
    </Suspense>
  );
}
