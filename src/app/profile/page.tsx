'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { ProfileView } from '../../components/ProfileView';
import { useAuth } from '../../context/AuthContext';
import { ChevronRight, Shield, User, LayoutDashboard, Crown } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/golin?redirect=/profile');
    }
  }, [isLoading, isAuthenticated, router]);

  return (
    <div className="min-h-screen bg-[#05070e] text-slate-100 flex flex-col selection:bg-amber-500 selection:text-black">
      <Navbar />

      <main className="flex-1 py-8 sm:py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-2 text-xs font-display uppercase tracking-wider text-slate-400 mb-6">
            <Link href="/" className="hover:text-amber-400 transition-colors">
              Home
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
            <Link href="/dashboard" className="hover:text-amber-400 transition-colors">
              Dashboard
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
            <span className="text-amber-400 font-bold">My Profile</span>
          </nav>

          {/* Core Profile Management System */}
          <ProfileView />
        </div>
      </main>

      <Footer />
    </div>
  );
}
