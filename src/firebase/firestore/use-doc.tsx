
'use client';

import { useState, useEffect } from 'react';
import {
  onSnapshot,
  doc,
  type DocumentReference,
  type DocumentData,
} from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';

export function useDoc<T = DocumentData>(
  docPath: string | DocumentReference
): { data: T | null; loading: boolean } {
  const firestore = useFirestore();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firestore) {
      return;
    }

    const docRef = typeof docPath === 'string' ? doc(firestore, docPath) : docPath;

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const docData = {
            id: snapshot.id,
            ...snapshot.data(),
          } as T;
          setData(docData);
        } else {
          setData(null);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching document:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [firestore, docPath]);

  return { data, loading };
}
