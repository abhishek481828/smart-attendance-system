'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Spinner } from '@/components';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      router.push('/login');
      return;
    }

    try {
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
    } catch {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}
