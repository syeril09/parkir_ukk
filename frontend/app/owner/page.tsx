'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OwnerPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect ke dashboard
    router.push('/owner/dashboard');
  }, [router]);

  return null;
}
