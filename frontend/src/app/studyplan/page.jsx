'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { getStudyPlan } from '@/services/api';
import { isLoggedIn } from '@/lib/auth';

const TASK_COLORS = { read: 'tag-teal', practice: 'tag-blush', revise: 'tag-red' };
const TASK_ICONS = { read: '📖', practice: '✏️', revise: '🔁' };

export default function StudyPlanPage() {
  const router = useRouter();
  const [plan, setPlan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!isLoggedIn()) { router.push('/login'); return; }
    getStudyPlan()
      .then(r => setPlan(r.data?.plan || []))
      .catch(() => setPlan([]))
      .finally(() => setLoading(false));
  }, []);

  // Group by date
  const grouped = plan.reduce((acc, item) => {
    const d = item.date;
    if (!acc[d]) acc[d] = [];
    acc[d].push(item);
    return acc;
  }, {});

  const dates = Object.keys(grouped).sort();
  const filtered = filter === 'all' ? dates : dates.filter(d => grouped[d].some(i => i.task_type === filter));

  const today = new Date().toISOString().split('T')[0];
  const totalItems = plan.length;
  const totalMinutes = plan.reduce((a, i) => a + (i.duration_minutes || 0), 0);

  return (
    <div className="shell">
      <div style={{ width: '100%', maxWidth: 920 }}>
        <Navbar />

        <div className="anim-1" style={{ marginBottom: 24 }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, fontWeight: 700, color: 'white' }}>Study Plan</h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 15, marginTop: 4 }}>Your personalized day-by-day exam preparation schedule</p>
        </div>

        {/* Stats row */}
        {!loading && plan.length > 0 && (
          <div className="anim-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 24 }}>
            {[
              { icon: '📅', label: 'Total Days', value: dates.length },
              { icon: '📌', label: 'Total Sessions', value: totalItems },
              { icon: '⏱', label: 'Total Hours', value: Math.round(totalMinutes / 60) + 'h' },
            ].map(s => (
              <div key={s.label} className="card" style={{ padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(42,157,143,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{s.icon}</div>
                <div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: 'var(--dark)' }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: 'var(--mid)' }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Filter buttons */}
        {plan.length > 0 && (
          <div className="anim-2" style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
            {['all', 'read', 'practice', 'revise'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`btn btn-sm ${filter === f ? 'btn-teal' : 'btn-ghost'}`}
                style={{ textTransform: 'capitalize' }}>
                {f === 'all' ? '📋 All' : `${TASK_ICONS[f]} ${f}`}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'rgba(255,255,255,0.7)' }}>Loading your study plan...</div>
        ) : plan.length === 0 ? (
          <div className="card anim-2" style={{ padding: 60, textAlign: 'center' }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>📅</div>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: 'var(--dark)', marginBottom: 8 }}>No study plan yet</h3>
            <p style={{ color: 'var(--mid)', fontSize: 14, marginBottom: 24 }}>Go to Performance tracker and generate your personalized plan</p>
            <button className="btn btn-teal" onClick={() => router.push('/performance')}>Go to Performance →</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {filtered.map((date, di) => {
              const items = filter === 'all' ? grouped[date] : grouped[date].filter(i => i.task_type === filter);
              if (!items?.length) return null;
              const isToday = date === today;
              const isPast = date < today;
              return (
                <div key={date} className={`card anim-${Math.min(di + 2, 4)}`} style={{ padding: 24, opacity: isPast ? 0.75 : 1, border: isToday ? '2px solid var(--teal)' : undefined }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 14, background: isToday ? 'var(--teal)' : 'rgba(42,157,143,0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: isToday ? 'white' : 'var(--teal)', lineHeight: 1 }}>
                          {new Date(date).getDate()}
                        </span>
                        <span style={{ fontSize: 9, color: isToday ? 'rgba(255,255,255,0.8)' : 'var(--light)', textTransform: 'uppercase' }}>
                          {new Date(date).toLocaleDateString('en-IN', { month: 'short' })}
                        </span>
                      </div>
                      <div>
                        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 600, color: 'var(--dark)' }}>
                          {new Date(date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </div>
                        {isToday && <span className="tag tag-teal" style={{ marginTop: 2 }}>Today</span>}
                        {isPast && <span style={{ fontSize: 11, color: 'var(--light)' }}>Completed</span>}
                      </div>
                    </div>
                    <span style={{ fontSize: 13, color: 'var(--light)' }}>
                      {items.reduce((a, i) => a + (i.duration_minutes || 0), 0)} min
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
                    {items.map((item, ii) => (
                      <div key={ii} className="cal-cell" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 16 }}>{TASK_ICONS[item.task_type] || '📌'}</span>
                          <span className={`tag ${TASK_COLORS[item.task_type] || 'tag-teal'}`}>{item.task_type}</span>
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--dark)' }}>{item.subject}</div>
                        <div style={{ fontSize: 12, color: 'var(--mid)' }}>{item.topic}</div>
                        <div style={{ fontSize: 11, color: 'var(--light)' }}>⏱ {item.duration_minutes} min</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
