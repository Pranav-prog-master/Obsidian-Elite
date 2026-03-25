'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { getSubjects, createSubject } from '@/services/api';
import { isLoggedIn } from '@/lib/auth';

const EXAM_ICONS = { JEE: '⚗️', NEET: '🧬', UPSC: '📜', BOARD: '📚', OTHER: '🎓' };
const SUBJECT_COLORS = ['#2a9d8f', '#e8a99a', '#6b9080', '#a4c3b2', '#c47a6a'];

export default function DashboardPage() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', exam_target: 'JEE' });
  const [creating, setCreating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn()) { router.push('/login'); return; }
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const res = await getSubjects();
      setSubjects(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleCreate = async () => {
    if (!form.name.trim()) return;
    setCreating(true);
    try {
      await createSubject(form);
      await fetchSubjects();
      setShowModal(false);
      setForm({ name: '', exam_target: 'JEE' });
    } catch (e) { console.error(e); }
    finally { setCreating(false); }
  };

  return (
    <div className="shell">
      <div style={{ width: '100%', maxWidth: 1100 }}>
        <Navbar />

        {/* Header */}
        <div className="anim-1" style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700, color: 'white' }}>Your Subjects</h1>
              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 15, marginTop: 4 }}>Manage your study materials and track progress</p>
            </div>
            <button className="btn btn-blush" onClick={() => setShowModal(true)}>+ New Subject</button>
          </div>
        </div>

        {/* Stats row */}
        <div className="anim-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
          {[
            { label: 'Subjects', value: subjects.length, icon: '📚' },
            { label: 'Quizzes Taken', value: subjects.reduce((a, s) => a + (s.quiz_count || 0), 0), icon: '📝' },
            { label: 'Avg Score', value: subjects.length ? Math.round(subjects.reduce((a, s) => a + (s.last_score || 0), 0) / subjects.length) + '%' : '—', icon: '🎯' },
          ].map(s => (
            <div key={s.label} className="card" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(42,157,143,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{s.icon}</div>
              <div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: 'var(--dark)' }}>{s.value}</div>
                <div style={{ fontSize: 13, color: 'var(--mid)' }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Subjects grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'rgba(255,255,255,0.7)' }}>Loading subjects...</div>
        ) : subjects.length === 0 ? (
          <div className="card anim-3" style={{ padding: 60, textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📖</div>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: 'var(--dark)', marginBottom: 8 }}>No subjects yet</h3>
            <p style={{ color: 'var(--mid)', fontSize: 14, marginBottom: 24 }}>Create your first subject to get started</p>
            <button className="btn btn-teal" onClick={() => setShowModal(true)}>Create Subject</button>
          </div>
        ) : (
          <div className="anim-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
            {subjects.map((sub, i) => (
              <div key={sub.id} className="card" style={{ padding: 24, position: 'relative', overflow: 'hidden' }}>
                {/* Color accent */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: SUBJECT_COLORS[i % SUBJECT_COLORS.length], borderRadius: '24px 24px 0 0' }} />

                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 28, marginBottom: 6 }}>{EXAM_ICONS[sub.exam_target] || '📚'}</div>
                    <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 600, color: 'var(--dark)' }}>{sub.name}</h3>
                    <span className="tag tag-teal" style={{ marginTop: 6 }}>{sub.exam_target}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "'Playfair Display', serif", color: 'var(--teal)' }}>
                      {sub.last_score != null ? `${sub.last_score}%` : '—'}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--light)' }}>last score</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8, marginBottom: 16, fontSize: 13, color: 'var(--mid)' }}>
                  <span>📄 {sub.notes_count || 0} notes</span>
                  <span style={{ color: 'var(--light)' }}>·</span>
                  <span>📝 {sub.quiz_count || 0} quizzes</span>
                </div>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <Link href={`/quiz?subject_id=${sub.id}`} className="btn btn-teal btn-sm" style={{ textDecoration: 'none', flex: 1, justifyContent: 'center' }}>Take Quiz</Link>
                  <Link href={`/doubt?subject_id=${sub.id}`} className="btn btn-ghost btn-sm" style={{ textDecoration: 'none', flex: 1, justifyContent: 'center' }}>Ask Doubt</Link>
                  <Link href={`/explain?subject_id=${sub.id}`} className="btn btn-ghost btn-sm" style={{ textDecoration: 'none', flex: 1, justifyContent: 'center' }}>Explain</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Subject Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(4px)' }}>
          <div className="card" style={{ padding: 36, width: 420 }}>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 600, color: 'var(--dark)', marginBottom: 24 }}>Create New Subject</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--mid)', marginBottom: 6 }}>Subject name</label>
                <input className="inp" placeholder="e.g. Physics, Chemistry, History..."
                  value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--mid)', marginBottom: 6 }}>Exam target</label>
                <select className="inp" value={form.exam_target} onChange={e => setForm(f => ({ ...f, exam_target: e.target.value }))}>
                  {['JEE', 'NEET', 'UPSC', 'BOARD', 'OTHER'].map(e => <option key={e}>{e}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-teal" style={{ flex: 1, justifyContent: 'center' }} onClick={handleCreate} disabled={creating}>
                {creating ? 'Creating...' : 'Create Subject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
