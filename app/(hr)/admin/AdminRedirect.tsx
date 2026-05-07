'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/utils/apiClient';

export default function AdminRedirect() {
  const router = useRouter();

  useEffect(() => {
    apiClient.get('/admin/me')
      .then(() => {
        router.push('/');
      })
      .catch(() => {
        router.push('/admin/login');
      });
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
    </div>
  );
}
