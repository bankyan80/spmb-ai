'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap } from 'lucide-react';
import { useSpmbStore } from '@/lib/store';

export function SplashPage() {
  const navigateTo = useSpmbStore((s) => s.navigateTo);

  useEffect(() => {
    const timer = setTimeout(() => {
      navigateTo('pilihan-akses');
    }, 2500);
    return () => clearTimeout(timer);
  }, [navigateTo]);

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen px-6"
      style={{ backgroundColor: '#F3F8FF' }}
    >
      {/* School illustration */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="mb-8"
      >
        <div
          className="flex items-center justify-center size-28 rounded-3xl shadow-lg"
          style={{
            background: 'linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)',
          }}
        >
          <GraduationCap className="size-16 text-white" strokeWidth={1.5} />
        </div>
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="text-4xl font-extrabold tracking-tight mb-2"
        style={{
          background: 'linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        SPMB SD 2026/2027
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="text-base font-medium"
        style={{ color: '#6B7280' }}
      >
        Seleksi Penerimaan Murid Baru
      </motion.p>

      {/* Decorative school SVG illustration */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.7 }}
        className="mt-12"
      >
        <svg
          width="200"
          height="120"
          viewBox="0 0 200 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* School building */}
          <rect x="60" y="40" width="80" height="60" rx="4" fill="#0D47A1" opacity="0.15" />
          <rect x="70" y="50" width="20" height="20" rx="2" fill="#1565C0" opacity="0.3" />
          <rect x="110" y="50" width="20" height="20" rx="2" fill="#1565C0" opacity="0.3" />
          <rect x="90" y="70" width="20" height="30" rx="2" fill="#1565C0" opacity="0.5" />
          {/* Roof */}
          <path d="M50 42L100 15L150 42H50Z" fill="#1565C0" opacity="0.25" />
          {/* Flag */}
          <line x1="100" y1="15" x2="100" y2="5" stroke="#1565C0" strokeWidth="2" opacity="0.4" />
          <rect x="100" y="5" width="12" height="8" rx="1" fill="#009688" opacity="0.5" />
          {/* Tree left */}
          <rect x="25" y="75" width="6" height="25" rx="2" fill="#43A047" opacity="0.3" />
          <circle cx="28" cy="65" r="15" fill="#43A047" opacity="0.2" />
          {/* Tree right */}
          <rect x="165" y="75" width="6" height="25" rx="2" fill="#43A047" opacity="0.3" />
          <circle cx="168" cy="65" r="15" fill="#43A047" opacity="0.2" />
          {/* Ground */}
          <rect x="10" y="100" width="180" height="4" rx="2" fill="#1565C0" opacity="0.1" />
        </svg>
      </motion.div>

      {/* Loading indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1.2 }}
        className="mt-10"
      >
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="size-2 rounded-full"
              style={{ backgroundColor: '#1565C0' }}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
