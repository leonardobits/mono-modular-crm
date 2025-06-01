import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';

export function useAuthRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'loading') return;

    const from = searchParams.get('from') || '/dashboard';

    if (session) {
      router.push(from);
    } else {
      router.push('/auth/login');
    }
  }, [session, status, router, searchParams]);
} 