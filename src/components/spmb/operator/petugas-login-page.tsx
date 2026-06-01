'use client';

import React, { useState } from 'react';
import { Shield, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useSpmbStore } from '@/lib/store';

export function PetugasLoginPage() {
  const navigateTo = useSpmbStore((s) => s.navigateTo);
  const loginPetugas = useSpmbStore((s) => s.loginPetugas);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) { setError('Masukkan email'); return; }
    if (!password) { setError('Masukkan password'); return; }

    setLoading(true);

    const success = loginPetugas(email.trim(), password);

    if (!success) {
      setError('Email atau password salah.');
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#F3F8FF' }}>
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 md:py-12">
        <div className="w-full max-w-sm md:max-w-md relative z-10">
          <button
            onClick={() => navigateTo('chat-ai')}
            className="flex items-center gap-1.5 text-sm mb-6 hover:opacity-70 transition-opacity"
            style={{ color: '#6B7280' }}
          >
            <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Kembali ke Chat AI
          </button>

          <div className="bg-white rounded-2xl shadow-lg md:shadow-xl border border-gray-100 overflow-hidden">
            <div
              className="px-6 py-6 text-center"
              style={{ background: 'linear-gradient(135deg, #009688 0%, #00796B 100%)' }}
            >
              <div className="flex items-center justify-center size-16 rounded-2xl mx-auto mb-3 shadow-lg" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                <Shield className="size-8 text-white" strokeWidth={1.5} />
              </div>
              <h2 className="text-xl font-bold text-white">Login Petugas & Admin</h2>
              <p className="text-sm mt-1 text-white/75">Masuk menggunakan email dan password</p>
            </div>

            <div className="px-6 py-5">
              <form onSubmit={handleLogin} className="space-y-4">
                {error && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700 text-center">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-5" style={{ color: '#9CA3AF' }} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@spmb.kec.id"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-5" style={{ color: '#9CA3AF' }} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Masukkan password"
                      className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showPassword ? (
                        <EyeOff className="size-5" style={{ color: '#9CA3AF' }} />
                      ) : (
                        <Eye className="size-5" style={{ color: '#9CA3AF' }} />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl px-5 py-3.5 shadow-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Memproses...</span>
                    </div>
                  ) : (
                    'Masuk'
                  )}
                </button>
              </form>

              <div className="mt-4 p-3 rounded-lg bg-teal-50 border border-teal-200">
                <p className="text-xs text-center" style={{ color: '#00796B' }}>
                  Password default: <strong>spmb2026</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
