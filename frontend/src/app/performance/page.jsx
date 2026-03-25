'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { getPerformance, getSubjects, generateStudyPlan } from '@/services/api';
import { isLoggedIn } from '@/lib/auth';

export default function PerformancePage() {
  const router = useRouter();
  const [subjects, setSubjects] = useState([]);
  const [subjectId, setSubjectId] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [examDate, setExamDate] = useState('');
  const [dailyHours, setDailyHours] = useState(4);
  const [planLoading, setPlanLoading] = useState(false);

  useEffect(() => {
    if (!isLoggedIn()) { router.push('/login'); return; }
    getSubjects().then(r => {
      setSubjects(r.data);
      if (r.data.length) { setSubjectId(r.data[0].id); }
    });
  }, []);

  useEffect(() => {
    if (subjectId) fetchPerformance();
  }, [subjectId]);

  const fetchPerformance = async () => {
    setLoading(true);
    try {
      const res = await getPerformance(subjectId);
      setData(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleGeneratePlan = async () => {
    if (!examDate) { alert('Please select your exam date.'); return; }
    setPlanLoading(true);
    try {
      await generateStudyPlan({ exam_date: examDate, daily_hours: dailyHours });
      router.push('/studyplan');
    } catch (e) { alert('Failed to generate plan.'); }
    finally { setPlanLoading(false); }
  };

  const sessions = data?.sessions || [];
  const weakTopics = data?.weak_topics || [];
  const maxScore = 100;

  return (
    <div className="shell">
      <div style={{ width: '100%', maxWidth: 1000 }}>
        <Navbar />

        <div className="anim-1" style={{ marginBottom: 24 }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, fontWeight: 700, color: 'white' }}>Performance Tracker</h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 15, marginTop: 4 }}>Track your progress and identify weak areas</p>
        </div>

        {/* Subject selector */}
        <div className="card anim-2" style={{ padding: '16px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--mid)', whiteSpace: 'nowrap' }}>Viewing subject:</span>
          <select className="inp" value={subjectId} onChange={e => setSubjectId(e.target.value)} style={{ maxWidth: 320, minWidth: 220, flex: 1 }}>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.exam_target})</option>)}
          </select>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'rgba(255,255,255,0.7)' }}>Loading performance data...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>

            {/* Chart area */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="card anim-2" style={{ padding: 28 }}>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, fontWeight: 600, color: 'var(--dark)', marginBottom: 20 }}>Score Trend</h3>

                {sessions.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--light)' }}>
                    <div style={{ fontSize: 36, marginBottom: 10 }}>📊</div>
                    <p>No quiz sessions yet. Take a quiz to see your progress.</p>
                  </div>
                ) : (
                  <>
                    {/* Simple custom bar chart */}
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 180, padding: '0 8px' }}>
                      {sessions.slice(-10).map((s, i) => {
                        const h = Math.max(8, (s.percentage / maxScore) * 160);
                        const color = s.percentage >= 70 ? 'var(--teal)' : s.percentage >= 40 ? 'var(--blush)' : '#e05555';
                        return (
                          <div key={s.id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--mid)' }}>{s.percentage}%</span>
                            <div style={{ width: '100%', height: h, background: color, borderRadius: '6px 6px 0 0', opacity: 0.85, transition: 'height 0.4s', minHeight: 8 }} title={`Quiz ${i + 1}: ${s.percentage}%`} />
                            <span style={{ fontSize: 10, color: 'var(--light)', textAlign: 'center' }}>
                              {new Date(s.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <div style={{ display: 'flex', gap: 16, marginTop: 16, fontSize: 12 }}>
                      {[['var(--teal)', '70%+'], ['var(--blush)', '40–69%'], ['#e05555', 'Below 40%']].map(([c, l]) => (
                        <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--mid)' }}>
                          <div style={{ width: 10, height: 10, borderRadius: 3, background: c }} />{l}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Sessions table */}
              {sessions.length > 0 && (
                <div className="card anim-3" style={{ padding: 24 }}>
                  <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 600, color: 'var(--dark)', marginBottom: 16 }}>Quiz History</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {sessions.slice().reverse().map((s, i) => (
                      <div key={s.id} className="card-white" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(42,157,143,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>📝</div>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark)' }}>Quiz #{sessions.length - i}</div>
                            <div style={{ fontSize: 12, color: 'var(--light)' }}>{new Date(s.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <span style={{ fontSize: 13, color: 'var(--mid)' }}>{s.score}/{s.total}</span>
                          <span className={`tag ${s.percentage >= 70 ? 'tag-teal' : s.percentage >= 40 ? 'tag-blush' : 'tag-red'}`}>{s.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right col */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Summary stats */}
              <div className="card anim-2" style={{ padding: 24 }}>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 600, color: 'var(--dark)', marginBottom: 16 }}>Summary</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {[
                    { label: 'Total Quizzes', value: sessions.length },
                    { label: 'Best Score', value: sessions.length ? Math.max(...sessions.map(s => s.percentage)) + '%' : '—' },
                    { label: 'Average Score', value: sessions.length ? Math.round(sessions.reduce((a, s) => a + s.percentage, 0) / sessions.length) + '%' : '—' },
                    { label: 'Weak Topics', value: weakTopics.length },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(42,157,143,0.08)' }}>
                      <span style={{ fontSize: 13, color: 'var(--mid)' }}>{label}</span>
                      <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: 'var(--teal)' }}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weak topics */}
              {weakTopics.length > 0 && (
                <div className="card anim-3" style={{ padding: 24 }}>
                  <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 600, color: 'var(--dark)', marginBottom: 16 }}>⚠️ Weak Topics</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {weakTopics.map(t => (
                      <div key={t.topic} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 13, color: 'var(--dark)' }}>{t.topic}</span>
                        <span className="tag tag-red">{t.fail_rate}% fail</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Study plan generator */}
              <div className="card anim-4" style={{ padding: 24 }}>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 600, color: 'var(--dark)', marginBottom: 6 }}>📅 Generate Study Plan</h3>
                <p style={{ fontSize: 13, color: 'var(--mid)', marginBottom: 16 }}>Get a personalized day-by-day schedule based on your weak areas</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--mid)', display: 'block', marginBottom: 5 }}>Exam Date</label>
                    <input type="date" className="inp" value={examDate} onChange={e => setExamDate(e.target.value)} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--mid)', display: 'block', marginBottom: 5 }}>Daily study hours: {dailyHours}h</label>
                    <input type="range" min={1} max={10} value={dailyHours} onChange={e => setDailyHours(+e.target.value)}
                      style={{ width: '100%', accentColor: 'var(--teal)' }} />
                  </div>
                  <button className="btn btn-blush" onClick={handleGeneratePlan} disabled={planLoading} style={{ justifyContent: 'center' }}>
                    {planLoading ? 'Generating...' : 'Generate Plan →'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
