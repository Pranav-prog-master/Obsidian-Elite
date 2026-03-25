'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { removeToken } from '@/lib/auth';

export default function Navbar() {
  const path = usePathname();
  const router = useRouter();

  const links = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/upload', label: 'Notes' },
    { href: '/doubt', label: 'Ask AI' },
    { href: '/explain', label: 'Concepts' },
    { href: '/performance', label: 'Progress' },
    { href: '/studyplan', label: 'Plan' },
  ];

  const logout = () => { removeToken(); router.push('/login'); };

  return (
    <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', height: 64, background: 'rgba(250,240,230,0.85)', backdropFilter: 'blur(12px)', borderRadius: 20, marginBottom: 28, border: '1px solid rgba(255,255,255,0.7)', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
      <Link href="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--teal)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: 'white', fontSize: 16 }}>✦</span>
        </div>
        <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 18, color: 'var(--dark)' }}>EduMentor</span>
      </Link>

      <div style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
        {links.map(l => (
          <Link key={l.href} href={l.href} className={`nav-link ${path.startsWith(l.href) ? 'active' : ''}`}>{l.label}</Link>
        ))}
      </div>

      <button className="btn btn-ghost btn-sm" onClick={logout}>Log out</button>
    </nav>
  );
}
