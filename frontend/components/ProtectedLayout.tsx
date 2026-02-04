'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';

interface ProtectedLayoutProps {
  children: React.ReactNode;
  requiredRole?: string | string[];
}

/**
 * Component untuk protect route
 * Cek apakah user sudah login dan memiliki role yang sesuai
 */
export default function ProtectedLayout({ children, requiredRole }: ProtectedLayoutProps) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      console.log('🔐 ProtectedLayout: Checking auth...');
      const token = Cookies.get('token');
      const userStr = Cookies.get('user');

      console.log('🍪 Token exists:', !!token);
      console.log('🍪 User exists:', !!userStr);

      if (!token || !userStr) {
        // Tidak ada token, redirect ke login
        console.warn('❌ No token or user found, redirecting to /login');
        setLoading(false);
        router.push('/login');
        return;
      }

      try {
        const user = JSON.parse(userStr);
        console.log('👤 User data:', { id: user.id, role: user.role });

        // Jika ada requirement role, cek role user
        if (requiredRole) {
          const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
          console.log('👤 Required role:', roles, 'User role:', user.role);
          
          if (!roles.includes(user.role)) {
            // Role tidak sesuai, redirect ke halaman error atau dashboard
            console.warn('❌ User role does not match required role');
            setLoading(false);
            router.push('/login');
            return;
          }
        }

        console.log('✅ Auth check passed!');
        setIsAuthorized(true);
        setLoading(false);
      } catch (error) {
        // Invalid token, redirect ke login
        console.error('❌ Error parsing user data:', error);
        setLoading(false);
        router.push('/login');
      }
    };

    checkAuth();
  }, [requiredRole, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  return isAuthorized ? <>{children}</> : null;
}
