'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/utils/apiClient';

export default function AdminListingsPage() {
  const router = useRouter();

  useEffect(() => {
    apiClient.get('/admin/me')
      .then(() => {
        // Admin is logged in, redirect to public listings page
        router.push('/listings');
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
