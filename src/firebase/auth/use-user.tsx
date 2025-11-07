
'use client';

import { useState, useEffect } from 'react';
import { type User } from 'firebase/auth';

interface UseUser {
  user: User | null;
  loading: boolean;
}

// Mock user data for demo purposes
const mockUser = {
  uid: 'mock-user-id',
  email: 'fleet.manager@sas.com',
  displayName: 'Fleet Manager',
  photoURL: null,
  emailVerified: true,
  isAnonymous: false,
  metadata: {},
  providerData: [],
  refreshToken: '',
  tenantId: null,
  delete: async () => {},
  getIdToken: async () => 'mock-token',
  getIdTokenResult: async () => ({
    token: 'mock-token',
    expirationTime: '',
    authTime: '',
    issuedAtTime: '',
    signInProvider: null,
    signInSecondFactor: null,
    claims: {},
  }),
  reload: async () => {},
  toJSON: () => ({}),
} as User;


export function useUser(): UseUser {
  // Return a mock user to bypass authentication for the prototype
  return {
    user: mockUser,
    loading: false,
  };
}
