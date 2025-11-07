
'use client';

import { useState, useEffect } from 'react';
import {
  onSnapshot,
  collection,
  query,
  where,
  orderBy,
  limit,
  startAt,
  endAt,
  type Query,
  type DocumentData,
  type CollectionReference,
} from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';

interface UseCollectionOptions {
  queryConstraints?: any[];
}

export function useCollection<T = DocumentData>(
  collectionPath: string | CollectionReference,
  options?: UseCollectionOptions
): { data: T[] | null; loading: boolean } {
  const firestore = useFirestore();
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firestore) {
      return;
    }

    let colRef: Query;
    if (typeof collectionPath === 'string') {
        colRef = collection(firestore, collectionPath);
    } else {
        colRef = collectionPath;
    }

    if (options?.queryConstraints) {
      colRef = query(colRef, ...options.queryConstraints);
    }

    const unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        const docs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as T[];
        setData(docs);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching collection:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [firestore, collectionPath, options]);

  return { data, loading };
}
