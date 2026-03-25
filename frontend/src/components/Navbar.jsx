'use client';
import Link from 'next/link';
import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { removeToken } from '@/lib/auth';

export default function Navbar() {
  const path = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const links = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/upload', label: 'Notes' },
    { href: '/doubt', label: 'Ask AI' },
    { href: '/explain', label: 'Concepts' },
    { href: '/performance', label: 'Progress' },
    { href: '/studyplan', label: 'Plan' },
  ];

  const logout = () => { removeToken(); router.push('/login'); };

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <nav className="navbar-container">
      <Link href="/dashboard" className="navbar-logo">
        <div className="navbar-logo-icon">
          <span>✦</span>
        </div>
        <span className="navbar-logo-text">EduMentor</span>
      </Link>

      {/* Desktop menu */}
      <div className="navbar-links-desktop">
        {links.map(l => (
          <Link key={l.href} href={l.href} className={`nav-link ${path.startsWith(l.href) ? 'active' : ''}`}>{l.label}</Link>
        ))}
      </div>

      {/* Mobile menu button */}
      <button className="navbar-mobile-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle navigation menu" aria-expanded={mobileMenuOpen}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="navbar-links-mobile">
          {links.map(l => (
            <Link key={l.href} href={l.href} className={`nav-link-mobile ${path.startsWith(l.href) ? 'active' : ''}`} onClick={closeMenu}>{l.label}</Link>
          ))}
          <button className="btn btn-ghost btn-sm w-full" onClick={() => { logout(); closeMenu(); }}>Log out</button>
        </div>
      )}

      {/* Desktop logout button */}
      <button className="btn btn-ghost btn-sm navbar-logout-desktop" onClick={logout}>Log out</button>
    </nav>
  );
}
