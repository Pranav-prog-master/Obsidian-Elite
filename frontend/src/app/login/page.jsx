'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { login } from '@/services/api';
import { setToken } from '@/lib/auth';

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const onSubmit = async (data) => {
    setLoading(true); setError('');
    try {
      const res = await login(data);
      setToken(res.data.access_token);
      router.push('/dashboard');
    } catch (e) {
      setError(e.response?.data?.detail || 'Login failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="shell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '16px' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>

        {/* Logo */}
        <div className="anim-1" style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--teal)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
            <span style={{ color: 'white', fontSize: 20 }}>✦</span>
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, color: 'white' }}>EduMentor AI</h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, marginTop: 4 }}>Your personalized study companion</p>
        </div>

        {/* Card */}
        <div className="card anim-2" style={{ padding: 24 }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 600, color: 'var(--dark)', marginBottom: 4 }}>Welcome back</h2>
          <p style={{ color: 'var(--mid)', fontSize: 13, marginBottom: 20 }}>Sign in to continue your learning journey</p>

          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--mid)', marginBottom: 5 }}>Email address</label>
              <input className="inp" type="email" placeholder="you@example.com"
                {...register('email', { required: 'Email is required' })} />
              {errors.email && <p style={{ color: '#dc2626', fontSize: 11, marginTop: 3 }}>{errors.email.message}</p>}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--mid)', marginBottom: 5 }}>Password</label>
              <input className="inp" type="password" placeholder="••••••••"
                {...register('password', { required: 'Password is required' })} />
              {errors.password && <p style={{ color: '#dc2626', fontSize: 11, marginTop: 3 }}>{errors.password.message}</p>}
            </div>

            {error && (
              <div style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 10, padding: '10px 12px', fontSize: 12, color: '#dc2626' }}>
                {error}
              </div>
            )}

            <button type="submit" className="btn btn-teal" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}>
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>

          <div className="divider" style={{ margin: '20px 0' }} />

          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--mid)' }}>
            Don&apos;t have an account?{' '}
            <Link href="/register" style={{ color: 'var(--teal)', fontWeight: 600, textDecoration: 'none' }}>Create one free</Link>
          </p>
        </div>

        {/* Stats strip */}
        <div className="anim-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 16 }}>
          {[['250M+', 'Students'], ['Free', 'Always'], ['24/7', 'Support']].map(([val, label]) => (
            <div key={val} style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: '12px 8px', textAlign: 'center', WebkitBackdropFilter: 'blur(8px)', backdropFilter: 'blur(8px)' }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, color: 'white' }}>{val}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
