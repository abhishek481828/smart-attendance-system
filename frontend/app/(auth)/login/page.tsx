'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { Card, Input, Button, Alert } from '@/components';

function generateDeviceId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      let deviceId = localStorage.getItem('deviceId');
      if (!deviceId) {
        deviceId = generateDeviceId();
        localStorage.setItem('deviceId', deviceId);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const deviceId = localStorage.getItem('deviceId');
      const response = await api.post('/auth/login', {
        email,
        password,
        deviceId,
      });
      const { access_token } = response.data;

      localStorage.setItem('token', access_token);

      const payload = JSON.parse(atob(access_token.split('.')[1]));
      const role = payload.role;

      if (role === 'TEACHER') {
        router.push('/teacher');
      } else if (role === 'STUDENT') {
        router.push('/student');
      }
    } catch (err: any) {
      if (err.code === 'ERR_NETWORK') {
        setError('Cannot connect to server. Please check if backend is running.');
      } else {
        setError(err.response?.data?.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-4">
      <Card glass padding="lg">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-accent/20 flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
            <svg className="w-7 h-7 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-100">Welcome back</h1>
          <p className="text-slate-400 mt-1 text-sm">Sign in to your account</p>
        </div>

        {error && (
          <Alert variant="error" onDismiss={() => setError('')} className="mb-6">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />
          <Button type="submit" loading={loading} fullWidth size="lg">
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <p className="text-center text-sm text-slate-400 mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-accent hover:text-accent-hover transition-colors">
            Register
          </Link>
        </p>
      </Card>
    </div>
  );
}
