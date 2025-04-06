'use client';

import { ReactNode } from 'react';
import { SupabaseProvider } from '@/contexts/SupabaseContext';

export default function ClientProvider({ children }: { children: ReactNode }) {
  return <SupabaseProvider>{children}</SupabaseProvider>;
}