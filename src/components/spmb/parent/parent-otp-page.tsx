'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Smartphone } from 'lucide-react';
import { useSpmbStore } from '@/lib/store';
import { SpmbHeader } from '@/components/spmb/shared/spmb-header';
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from '@/components/ui/input-otp';

export function ParentOtpPage() {
  const { goBack, verifyOtp, parentAccess } = useSpmbStore();
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(60);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Mask the identifier for display
  const maskedIdentifier = React.useMemo(() => {
    const noHp = parentAccess?.noHp || '';
    if (noHp.length >= 8) {
      return noHp.slice(0, 4) + '****' + noHp.slice(-4);
    }
    return noHp || 'nomor Anda';
  }, [parentAccess]);

  // Countdown timer for resend
  useEffect(() => {
    if (resendCooldown > 0) {
      timerRef.current = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [resendCooldown]);

  const handleVerify = async () => {
    if (otp.length < 6) {
      setError('Masukkan 6 digit kode verifikasi');
      return;
    }

    setError('');
    setIsLoading(true);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const success = verifyOtp(otp);
    if (!success) {
      setError('Kode verifikasi salah. Silakan coba lagi.');
    }
    setIsLoading(false);
  };

  const handleResend = () => {
    if (resendCooldown > 0) return;
    setResendCooldown(60);
    setOtp('');
    setError('');
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <SpmbHeader title="Verifikasi" showBack onBack={goBack} />

      <div className="flex-1 flex flex-col items-center px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm flex flex-col items-center"
        >
          {/* Illustration */}
          <div
            className="flex items-center justify-center size-20 rounded-2xl mb-6"
            style={{
              background: 'linear-gradient(135deg, #1565C0 0%, #009688 100%)',
              boxShadow: '0 8px 24px rgba(21, 101, 192, 0.25)',
            }}
          >
            <Smartphone className="size-10 text-white" strokeWidth={1.5} />
          </div>

          {/* Shield check icon overlay */}
          <div
            className="flex items-center justify-center size-8 rounded-full -mt-10 ml-10 mb-4 border-2 border-white"
            style={{ backgroundColor: '#009688' }}
          >
            <ShieldCheck className="size-4 text-white" strokeWidth={2.5} />
          </div>

          {/* Description */}
          <h2 className="text-lg font-semibold mb-2" style={{ color: '#1F2937' }}>
            Masukkan Kode Verifikasi
          </h2>
          <p className="text-sm text-center mb-8" style={{ color: '#6B7280' }}>
            Kode verifikasi telah dikirim ke
            <br />
            <span className="font-semibold" style={{ color: '#1565C0' }}>
              {maskedIdentifier}
            </span>
          </p>

          {/* OTP Input */}
          <div className="mb-6">
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={(value) => {
                setOtp(value);
                setError('');
              }}
            >
              <InputOTPGroup>
                <InputOTPSlot
                  index={0}
                  className="size-12 text-lg font-bold rounded-lg border-2 data-[active=true]:border-[#1565C0]"
                />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot
                  index={1}
                  className="size-12 text-lg font-bold rounded-lg border-2 data-[active=true]:border-[#1565C0]"
                />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot
                  index={2}
                  className="size-12 text-lg font-bold rounded-lg border-2 data-[active=true]:border-[#1565C0]"
                />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot
                  index={3}
                  className="size-12 text-lg font-bold rounded-lg border-2 data-[active=true]:border-[#1565C0]"
                />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot
                  index={4}
                  className="size-12 text-lg font-bold rounded-lg border-2 data-[active=true]:border-[#1565C0]"
                />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot
                  index={5}
                  className="size-12 text-lg font-bold rounded-lg border-2 data-[active=true]:border-[#1565C0]"
                />
              </InputOTPGroup>
            </InputOTP>
          </div>

          {/* Error message */}
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm font-medium mb-4"
              style={{ color: '#EF4444' }}
            >
              {error}
            </motion.p>
          )}

          {/* Verify button */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleVerify}
            disabled={isLoading || otp.length < 6}
            className="w-full py-3.5 rounded-xl text-white font-semibold text-base shadow-lg transition-shadow hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
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
                Memverifikasi...
              </div>
            ) : (
              'Verifikasi'
            )}
          </motion.button>

          {/* Resend code */}
          <div className="mt-6 text-center">
            {resendCooldown > 0 ? (
              <p className="text-sm" style={{ color: '#6B7280' }}>
                Kirim ulang kode dalam{' '}
                <span className="font-semibold" style={{ color: '#1565C0' }}>
                  {resendCooldown}s
                </span>
              </p>
            ) : (
              <button
                onClick={handleResend}
                className="text-sm font-semibold transition-opacity hover:opacity-80"
                style={{ color: '#1565C0' }}
              >
                Kirim Ulang Kode
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
