'use client';
import { Suspense, useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { askDoubt, getSubjects } from '@/services/api';
import { isLoggedIn } from '@/lib/auth';

const SUGGESTIONS = [
  'Explain Newton\'s third law with an example',
  'What is the difference between mitosis and meiosis?',
  'How does photosynthesis work?',
  'What is Ohm\'s Law and when does it apply?',
  'Explain the water cycle briefly',
];

function DoubtPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [subjects, setSubjects] = useState([]);
  const [subjectId, setSubjectId] = useState(searchParams.get('subject_id') || '');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!isLoggedIn()) { router.push('/login'); return; }
    getSubjects().then(r => { setSubjects(r.data); if (!subjectId && r.data.length) setSubjectId(r.data[0].id); });
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async (question) => {
    const q = question || input.trim();
    if (!q) return;
    setInput('');
    setMessages(p => [...p, { role: 'user', text: q }]);
    setLoading(true);
    try {
      const res = await askDoubt({ subject_id: subjectId, question: q });
      setMessages(p => [...p, { role: 'ai', text: res.data.answer }]);
    } catch (e) {
      setMessages(p => [...p, { role: 'ai', text: 'Sorry, I could not process your question. Please try again.' }]);
    } finally { setLoading(false); }
  };

  return (
    <div className="shell">
      <div style={{ width: '100%', maxWidth: 800 }}>
        <Navbar />

        <div className="anim-1" style={{ marginBottom: 20 }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, fontWeight: 700, color: 'white' }}>AI Doubt Solver</h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 15, marginTop: 4 }}>Ask any question — get instant answers with real-life examples</p>
        </div>

        <div className="card anim-2" style={{ display: 'flex', flexDirection: 'column', height: 620 }}>
          {/* Subject selector */}
          <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(42,157,143,0.1)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--mid)', whiteSpace: 'nowrap' }}>Subject:</span>
            <select className="inp" value={subjectId} onChange={e => setSubjectId(e.target.value)} style={{ padding: '8px 14px', fontSize: 13 }}>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <span style={{ fontSize: 12, color: 'var(--light)', whiteSpace: 'nowrap' }}>
              {messages.length} messages
            </span>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {messages.length === 0 ? (
              <div style={{ margin: 'auto 0', paddingTop: 20 }}>
                <p style={{ textAlign: 'center', color: 'var(--mid)', fontSize: 14, marginBottom: 20 }}>✨ Try one of these questions:</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {SUGGESTIONS.map(s => (
                    <button key={s} onClick={() => send(s)} style={{ background: 'rgba(42,157,143,0.07)', border: '1px solid rgba(42,157,143,0.15)', borderRadius: 12, padding: '12px 16px', fontSize: 14, color: 'var(--mid)', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}
                      onMouseEnter={e => e.target.style.background = 'rgba(42,157,143,0.12)'}
                      onMouseLeave={e => e.target.style.background = 'rgba(42,157,143,0.07)'}>
                      💬 {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((m, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  {m.role === 'ai' && (
                    <div style={{ width: 30, height: 30, borderRadius: 10, background: 'var(--teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 8, flexShrink: 0, fontSize: 14 }}>✦</div>
                  )}
                  <div className={m.role === 'user' ? 'bubble-user' : 'bubble-ai'}>{m.text}</div>
                </div>
              ))
            )}
            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 30, height: 30, borderRadius: 10, background: 'var(--teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>✦</div>
                <div className="bubble-ai" style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  {[0, 1, 2].map(i => <span key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--light)', display: 'inline-block', animation: `bounce 1.2s ${i * 0.2}s infinite` }} />)}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(42,157,143,0.1)', display: 'flex', gap: 10 }}>
            <input className="inp" placeholder="Ask any question..." value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
              disabled={loading} style={{ flex: 1 }} />
            <button className="btn btn-teal" onClick={() => send()} disabled={loading || !input.trim()}>Send →</button>
          </div>
        </div>
      </div>
      <style>{`@keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function DoubtPage() {
  return (
    <Suspense fallback={<div className="shell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p style={{ color: 'white' }}>Loading...</p></div>}>
      <DoubtPageContent />
    </Suspense>
  );
}
