'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { register as registerAPI } from '@/services/api';
import { setToken } from '@/lib/auth';

export default function RegisterPage() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const onSubmit = async (data) => {
    setLoading(true); setError('');
    try {
      const res = await registerAPI({ email: data.email, password: data.password });
      setToken(res.data.access_token);
      router.push('/dashboard');
    } catch (e) {
      setError(e.response?.data?.detail || 'Registration failed.');
    } finally { setLoading(false); }
  };

  return (
    <div className="shell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={{ width: '100%', maxWidth: 440 }}>

        <div className="anim-1" style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 52, height: 52, borderRadius: 16, background: 'var(--teal)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
            <span style={{ color: 'white', fontSize: 24 }}>✦</span>
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: 'white' }}>Join EduMentor AI</h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, marginTop: 4 }}>Free personalized tutoring for every student</p>
        </div>

        <div className="card anim-2" style={{ padding: 36 }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 600, color: 'var(--dark)', marginBottom: 6 }}>Create your account</h2>
          <p style={{ color: 'var(--mid)', fontSize: 14, marginBottom: 28 }}>Start learning smarter today</p>

          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--mid)', marginBottom: 6 }}>Email address</label>
              <input className="inp" type="email" placeholder="you@example.com"
                {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' } })} />
              {errors.email && <p style={{ color: '#dc2626', fontSize: 12, marginTop: 4 }}>{errors.email.message}</p>}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--mid)', marginBottom: 6 }}>Password</label>
              <input className="inp" type="password" placeholder="Min. 8 characters"
                {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'At least 8 characters' } })} />
              {errors.password && <p style={{ color: '#dc2626', fontSize: 12, marginTop: 4 }}>{errors.password.message}</p>}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--mid)', marginBottom: 6 }}>Confirm password</label>
              <input className="inp" type="password" placeholder="Repeat password"
                {...register('confirm', { required: 'Please confirm', validate: v => v === watch('password') || 'Passwords do not match' })} />
              {errors.confirm && <p style={{ color: '#dc2626', fontSize: 12, marginTop: 4 }}>{errors.confirm.message}</p>}
            </div>

            {error && (
              <div style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#dc2626' }}>
                {error}
              </div>
            )}

            <button type="submit" className="btn btn-teal" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}>
              {loading ? 'Creating account...' : 'Create Account →'}
            </button>
          </form>

          <div className="divider" style={{ margin: '24px 0' }} />
          <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--mid)' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: 'var(--teal)', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
