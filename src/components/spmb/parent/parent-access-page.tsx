'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, CreditCard, Hash } from 'lucide-react';
import { useSpmbStore } from '@/lib/store';
import { SpmbHeader } from '@/components/spmb/shared/spmb-header';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

type LoginType = 'hp' | 'nik' | 'noreg';

const loginOptions: { value: LoginType; label: string; icon: React.ElementType; placeholder: string; hint: string }[] = [
  { value: 'hp', label: 'Nomor HP', icon: Phone, placeholder: '08xxxxxxxxxx', hint: 'Masukkan nomor HP orang tua/wali' },
  { value: 'nik', label: 'NIK Anak', icon: CreditCard, placeholder: '16 digit NIK', hint: 'Masukkan NIK sesuai KK' },
  { value: 'noreg', label: 'No. Registrasi', icon: Hash, placeholder: 'SPMB-2026-XXXXXX', hint: 'Masukkan nomor pendaftaran' },
];

export function ParentAccessPage() {
  const { goBack, loginParent, navigateTo } = useSpmbStore();
  const [activeTab, setActiveTab] = useState<LoginType>('hp');
  const [identifier, setIdentifier] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const currentOption = loginOptions.find((o) => o.value === activeTab)!;

  const handleSubmit = async () => {
    if (!identifier.trim()) {
      setError('Harap isi kolom ini');
      return;
    }

    if (activeTab === 'hp' && identifier.length < 10) {
      setError('Nomor HP minimal 10 digit');
      return;
    }

    if (activeTab === 'nik' && identifier.length !== 16) {
      setError('NIK harus 16 digit');
      return;
    }

    setError('');
    setIsLoading(true);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const success = loginParent(identifier.trim(), activeTab);
    if (success) {
      navigateTo('beranda');
    } else {
      setError('Data tidak ditemukan. Periksa kembali input Anda.');
    }
    setIsLoading(false);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value as LoginType);
    setIdentifier('');
    setError('');
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <SpmbHeader title="Masuk Orang Tua/Wali" showBack onBack={goBack} />

      <div className="flex-1 px-5 py-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Info text */}
          <p className="text-sm mb-6" style={{ color: '#6B7280' }}>
            Masuk menggunakan salah satu opsi berikut
          </p>

          {/* Tabs for login type selection */}
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="w-full grid grid-cols-3 h-auto p-1 rounded-xl" style={{ backgroundColor: '#F3F8FF' }}>
              {loginOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <TabsTrigger
                    key={option.value}
                    value={option.value}
                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm"
                  >
                    <Icon className="size-4" />
                    {option.label}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {loginOptions.map((option) => (
              <TabsContent key={option.value} value={option.value} className="mt-5">
                <div className="space-y-3">
                  <label
                    htmlFor={`input-${option.value}`}
                    className="text-sm font-medium"
                    style={{ color: '#1F2937' }}
                  >
                    {option.hint}
                  </label>
                  <Input
                    id={`input-${option.value}`}
                    type={option.value === 'hp' ? 'tel' : 'text'}
                    placeholder={option.placeholder}
                    value={activeTab === option.value ? identifier : ''}
                    onChange={(e) => {
                      if (activeTab === option.value) {
                        setIdentifier(e.target.value);
                        setError('');
                      }
                    }}
                    className="h-12 rounded-xl text-base px-4 border-gray-200 focus:border-[#1565C0] focus:ring-[#1565C0]/20"
                    maxLength={option.value === 'nik' ? 16 : undefined}
                    disabled={isLoading}
                  />
                </div>
              </TabsContent>
            ))}
          </Tabs>

          {/* Error message */}
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm mt-3 font-medium"
              style={{ color: '#EF4444' }}
            >
              {error}
            </motion.p>
          )}

          {/* Submit button */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full mt-8 py-3.5 rounded-xl text-white font-semibold text-base shadow-lg transition-shadow hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
            style={{
              background: 'linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)',
            }}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <svg className="animate-spin size-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Memproses...
              </div>
            ) : (
              'Lanjutkan'
            )}
          </motion.button>

          {/* Help text */}
          <p className="text-xs text-center mt-4" style={{ color: '#6B7280' }}>
            Kode verifikasi akan dikirim ke {currentOption.label === 'Nomor HP' ? 'nomor HP Anda' : ' kontak terdaftar'}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
