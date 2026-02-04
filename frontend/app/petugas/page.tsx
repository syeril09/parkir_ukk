'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PetugasPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect ke dashboard
    router.push('/petugas/dashboard');
  }, [router]);

  return null;
}
