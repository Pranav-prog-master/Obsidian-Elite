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
    <div className="shell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={{ width: '100%', maxWidth: 440 }}>

        {/* Logo */}
        <div className="anim-1" style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 52, height: 52, borderRadius: 16, background: 'var(--teal)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
            <span style={{ color: 'white', fontSize: 24 }}>✦</span>
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: 'white' }}>EduMentor AI</h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, marginTop: 4 }}>Your personalized study companion</p>
        </div>

        {/* Card */}
        <div className="card anim-2" style={{ padding: 36 }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 600, color: 'var(--dark)', marginBottom: 6 }}>Welcome back</h2>
          <p style={{ color: 'var(--mid)', fontSize: 14, marginBottom: 28 }}>Sign in to continue your learning journey</p>

          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--mid)', marginBottom: 6 }}>Email address</label>
              <input className="inp" type="email" placeholder="you@example.com"
                {...register('email', { required: 'Email is required' })} />
              {errors.email && <p style={{ color: '#dc2626', fontSize: 12, marginTop: 4 }}>{errors.email.message}</p>}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--mid)', marginBottom: 6 }}>Password</label>
              <input className="inp" type="password" placeholder="••••••••"
                {...register('password', { required: 'Password is required' })} />
              {errors.password && <p style={{ color: '#dc2626', fontSize: 12, marginTop: 4 }}>{errors.password.message}</p>}
            </div>

            {error && (
              <div style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#dc2626' }}>
                {error}
              </div>
            )}

            <button type="submit" className="btn btn-teal" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}>
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>

          <div className="divider" style={{ margin: '24px 0' }} />

          <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--mid)' }}>
            Don&apos;t have an account?{' '}
            <Link href="/register" style={{ color: 'var(--teal)', fontWeight: 600, textDecoration: 'none' }}>Create one free</Link>
          </p>
        </div>

        {/* Stats strip */}
        <div className="anim-3" style={{ display: 'flex', gap: 12, marginTop: 20 }}>
          {[['250M+', 'Students in India'], ['Free', 'Always'], ['24/7', 'AI Support']].map(([val, label]) => (
            <div key={val} style={{ flex: 1, background: 'rgba(255,255,255,0.2)', borderRadius: 14, padding: '14px 12px', textAlign: 'center', backdropFilter: 'blur(8px)' }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: 'white' }}>{val}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
