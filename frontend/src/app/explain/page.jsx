'use client';
import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { explainTopic, getSubjects } from '@/services/api';
import { isLoggedIn } from '@/lib/auth';

function ExplainPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [subjects, setSubjects] = useState([]);
  const [subjectId, setSubjectId] = useState(searchParams.get('subject_id') || '');
  const [topic, setTopic] = useState('');
  const [explanation, setExplanation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (!isLoggedIn()) { router.push('/login'); return; }
    getSubjects().then(r => { setSubjects(r.data); if (!subjectId && r.data.length) setSubjectId(r.data[0].id); });
  }, []);

  const handleExplain = async () => {
    if (!topic.trim() || !subjectId) return;
    setLoading(true); setExplanation(null);
    try {
      const res = await explainTopic({ subject_id: subjectId, topic_name: topic });
      const exp = res.data.explanation;
      setExplanation(exp);
      setHistory(p => [{ topic, explanation: exp, id: Date.now() }, ...p.slice(0, 9)]);
    } catch (e) { alert('Failed to fetch explanation.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="shell">
      <div style={{ width: '100%', maxWidth: 960 }}>
        <Navbar />
        <div className="anim-1" style={{ marginBottom: 24 }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, fontWeight: 700, color: 'white' }}>Concept Explainer</h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 15, marginTop: 4 }}>Structured AI explanations with real-life analogies</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="card anim-2" style={{ padding: 24 }}>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 600, color: 'var(--dark)', marginBottom: 16 }}>Explain a Topic</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <select className="inp" value={subjectId} onChange={e => setSubjectId(e.target.value)}>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <input className="inp" placeholder="e.g. Newton Laws, Osmosis..." value={topic}
                  onChange={e => setTopic(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleExplain()} />
                <button className="btn btn-teal" onClick={handleExplain} disabled={loading || !topic.trim()} style={{ justifyContent: 'center' }}>
                  {loading ? 'Explaining...' : 'Explain ✦'}
                </button>
              </div>
            </div>
            {history.length > 0 && (
              <div className="card anim-3" style={{ padding: 20 }}>
                <h3 style={{ fontSize: 12, fontWeight: 600, color: 'var(--mid)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.6px' }}>Recent Topics</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {history.map(h => (
                    <button key={h.id} onClick={() => { setTopic(h.topic); setExplanation(h.explanation); }}
                      style={{ background: 'rgba(42,157,143,0.07)', border: '1px solid rgba(42,157,143,0.15)', borderRadius: 10, padding: '9px 14px', fontSize: 13, color: 'var(--mid)', cursor: 'pointer', textAlign: 'left' }}>
                      📖 {h.topic}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="card anim-2" style={{ padding: 32, minHeight: 400 }}>
            {!explanation && !loading && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 340, textAlign: 'center', color: 'var(--light)' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🧠</div>
                <p style={{ fontSize: 15 }}>Enter a topic and click Explain</p>
              </div>
            )}
            {loading && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 340, gap: 16 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid rgba(42,157,143,0.2)', borderTopColor: 'var(--teal)', animation: 'spin 0.7s linear infinite' }} />
                <p style={{ color: 'var(--mid)', fontSize: 14 }}>Generating explanation...</p>
              </div>
            )}
            {explanation && !loading && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 12, background: 'var(--teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 16 }}>✦</div>
                  <div>
                    <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: 'var(--dark)' }}>{topic}</h2>
                    <span className="tag tag-teal">AI Explanation</span>
                  </div>
                </div>
                <div className="divider" style={{ marginBottom: 20 }} />
                <div style={{ fontSize: 15, color: 'var(--dark)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{explanation}</div>
              </div>
            )}
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function ExplainPage() {
  return (
    <Suspense fallback={<div className="shell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p style={{ color: 'white' }}>Loading...</p></div>}>
      <ExplainPageContent />
    </Suspense>
  );
}
