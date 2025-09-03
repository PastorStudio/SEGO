
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This page will now redirect to the login page by default.
// The initial setup of creating an admin user is no longer the primary function of the root page.
export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/login');
  }, [router]);

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background">
      <p>Redirigiendo al inicio de sesión...</p>
    </div>
  );
}
