'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  AuthUser,
  AuthResponse,
  LoginInput,
  RegisterInput,
  VerifyOtpInput,
  ResendOtpInput
} from '../shared/auth';
import { authClient, getStoredToken, clearStoredToken } from '../lib/auth-client';
import {
  clearDisclaimerPendingAfterLogin,
  markDisclaimerPendingAfterLogin,
  resetDisclaimerAcknowledgement
} from '../lib/disclaimer-storage';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (input: LoginInput) => Promise<AuthResponse>;
  register: (input: RegisterInput) => Promise<AuthResponse>;
  verifyOtp: (input: VerifyOtpInput) => Promise<AuthResponse>;
  resendOtp: (input: ResendOtpInput) => Promise<{ success: boolean; cooldownSeconds: number }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = useCallback(async () => {
    const savedToken = getStoredToken();
    if (!savedToken) {
      setUser(null);
      setToken(null);
      setIsLoading(false);
      return;
    }

    setToken(savedToken);
    try {
      const me = await authClient.getMe();
      setUser(me);
    } catch {
      clearStoredToken();
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (input: LoginInput): Promise<AuthResponse> => {
    const res = await authClient.login(input);
    // A fresh login should show the mandatory disclaimer exactly once again.
    resetDisclaimerAcknowledgement(res.user.id);
    markDisclaimerPendingAfterLogin();
    setUser(res.user);
    setToken(res.token);
    return res;
  };

  const register = async (input: RegisterInput): Promise<AuthResponse> => {
    const res = await authClient.register(input);
    resetDisclaimerAcknowledgement(res.user.id);
    markDisclaimerPendingAfterLogin();
    setUser(res.user);
    setToken(res.token);
    return res;
  };

  const verifyOtp = async (input: VerifyOtpInput): Promise<AuthResponse> => {
    const res = await authClient.verifyOtp(input);
    resetDisclaimerAcknowledgement(res.user.id);
    markDisclaimerPendingAfterLogin();
    setUser(res.user);
    setToken(res.token);
    return res;
  };

  const resendOtp = async (input: ResendOtpInput): Promise<{ success: boolean; cooldownSeconds: number }> => {
    return authClient.resendOtp(input);
  };

  const logout = async (): Promise<void> => {
    await authClient.logout();
    resetDisclaimerAcknowledgement();
    clearDisclaimerPendingAfterLogin();
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user && (user.isEmailVerified || user.isPhoneVerified || user.isActive !== false),
        login,
        register,
        verifyOtp,
        resendOtp,
        logout,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
