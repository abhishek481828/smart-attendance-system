'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { getAuthUser, logout } from '@/lib/auth';
import Button from './Button';
import Badge from './Badge';

export default function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<{ email: string; role: string } | null>(null);

  useEffect(() => {
    const authUser = getAuthUser();
    if (authUser) {
      setUser({ email: authUser.email, role: authUser.role });
    }
  }, []);

  const navLinks = () => {
    if (!user) return [];
    switch (user.role) {
      case 'TEACHER':
        return [{ href: '/teacher', label: 'Dashboard' }];
      case 'STUDENT':
        return [{ href: '/student', label: 'Scan' }];
      case 'ADMIN':
        return [{ href: '/admin', label: 'Admin' }];
      default:
        return [];
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 glass-strong border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shadow-lg shadow-accent/25 group-hover:shadow-accent/40 transition-shadow">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <span className="text-lg font-semibold text-slate-100">AttendX</span>
          </Link>

          {/* Nav links */}
          <div className="flex items-center gap-1">
            {navLinks().map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`
                  px-3 py-2 rounded-lg text-sm transition-colors
                  ${pathname === link.href
                    ? 'text-white bg-white/10'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }
                `}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* User menu */}
          <div className="flex items-center gap-3">
            {user && (
              <>
                <Badge variant="accent">{user.role}</Badge>
                <span className="text-sm text-slate-400 hidden sm:inline">{user.email}</span>
                <Button variant="ghost" size="sm" onClick={logout}>
                  Logout
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
