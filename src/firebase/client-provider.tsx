'use client';

import { ReactNode } from 'react';
import { initializeFirebase } from '@/firebase';
import { FirebaseProvider } from '@/firebase/provider';

// Initialize Firebase on the client
const { firebaseApp, auth, firestore } = initializeFirebase();

export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  return (
    <FirebaseProvider
      firebaseApp={firebaseApp}
      auth={auth}
      firestore={firestore}
    >
      {children}
    </FirebaseProvider>
  );
}
