'use client';

import React, { useState } from 'react';
import { useSpmbStore } from '@/lib/store';
import { KeyRound } from 'lucide-react';

export function UbahPasswordPage() {
  const user = useSpmbStore((s) => s.currentUser);
  const clearMustChangePassword = useSpmbStore((s) => s.clearMustChangePassword);

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password minimal 6 karakter');
      return;
    }
    if (password !== confirm) {
      setError('Konfirmasi password tidak cocok');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: user?.uid, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Gagal mengubah password');
      }

      setSuccess(true);
      setTimeout(() => clearMustChangePassword(), 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal mengubah password');
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#F3F8FF' }}>
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div
              className="px-6 py-6 text-center"
              style={{ background: 'linear-gradient(135deg, #009688 0%, #00796B 100%)' }}
            >
              <div className="flex items-center justify-center size-16 rounded-2xl mx-auto mb-3 shadow-lg" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                <KeyRound className="size-8 text-white" strokeWidth={1.5} />
              </div>
              <h2 className="text-xl font-bold text-white">Ubah Password</h2>
              <p className="text-sm mt-1 text-white/75">
                {user?.nama} — Silakan ubah password default Anda
              </p>
            </div>

            <div className="px-6 py-5">
              {success ? (
                <div className="p-4 rounded-lg bg-green-50 border border-green-200 text-center">
                  <p className="text-green-700 font-medium">Password berhasil diubah!</p>
                  <p className="text-xs text-green-600 mt-1">Mengalihkan...</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700 text-center">
                      {error}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>
                      Password Baru
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimal 6 karakter"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>
                      Konfirmasi Password Baru
                    </label>
                    <input
                      type="password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="Ketik ulang password baru"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl px-5 py-3.5 shadow-sm transition-all disabled:opacity-60"
                  >
                    {loading ? 'Menyimpan...' : 'Simpan Password'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
