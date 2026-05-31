'use client';

import React, { useState } from 'react';
import { Shield } from 'lucide-react';
import { useSpmbStore } from '@/lib/store';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export function PetugasLoginPage() {
  const navigateTo = useSpmbStore((s) => s.navigateTo);
  const loginWithGoogle = useSpmbStore((s) => s.loginWithGoogle);
  const setAuthToken = useSpmbStore((s) => s.setAuthToken);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);

    try {
      let email: string;
      let idToken: string | null = null;

      if (auth && typeof signInWithPopup === 'function') {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        email = result.user.email || '';
        idToken = await result.user.getIdToken();
      } else {
        // Fallback: mock login (Firebase not configured)
        const selectedEmail = prompt(
          'Pilih akun Google untuk login (demo):\n\n1. petugas1@spmb.kec.id\n2. petugas2@spmb.kec.id\n3. admin@spmb.kec.id\n\nAtau masukkan email lain:',
          'petugas1@spmb.kec.id'
        );
        if (!selectedEmail) { setLoading(false); return; }
        email = selectedEmail.trim();
      }

      if (idToken) setAuthToken(idToken);

      const success = loginWithGoogle(email);

      if (!success) {
        setError(`Email "${email}" tidak terdaftar sebagai petugas/admin SPMB.`);
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.message?.includes('popup')) {
        setError('Popup ditutup. Silakan coba lagi.');
      } else {
        setError('Gagal login. Silakan coba lagi.');
      }
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
              <p className="text-sm mt-1 text-white/75">Masuk menggunakan akun Google yang sudah terdaftar</p>
            </div>

            <div className="px-6 py-5 space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700 text-center">
                  {error}
                </div>
              )}

              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-xl px-5 py-3.5 shadow-sm hover:shadow-md active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="size-5 border-2 border-teal-500/30 border-t-teal-500 rounded-full animate-spin" />
                    <span className="text-sm font-medium" style={{ color: '#1F2937' }}>Memproses...</span>
                  </div>
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    <span className="text-sm font-semibold" style={{ color: '#1F2937' }}>Masuk dengan Google</span>
                  </>
                )}
              </button>

              <div className="p-3 rounded-lg bg-teal-50 border border-teal-200">
                <p className="text-xs text-center" style={{ color: '#00796B' }}>
                  Login via Google akan mengirim token autentikasi ke server untuk verifikasi.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
