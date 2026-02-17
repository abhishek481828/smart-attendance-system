'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      router.push('/login');
      return;
    }

    try {
      // Decode JWT token (payload is the middle part)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const role = payload.role;

      if (role === 'TEACHER') {
        router.push('/teacher');
      } else if (role === 'STUDENT') {
        router.push('/student');
      } else if (role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/login');
      }
    } catch (error) {
      // Invalid token, redirect to login
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p>Redirecting...</p>
    </div>
  );
}
