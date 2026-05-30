'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Users, Shield, HelpCircle, BookOpen, Phone } from 'lucide-react';
import { useSpmbStore } from '@/lib/store';

export function PilihanAksesPage() {
  const navigateTo = useSpmbStore((s) => s.navigateTo);

  return (
    <div
      className="flex flex-col min-h-screen"
      style={{ backgroundColor: '#F3F8FF' }}
    >
      {/* Top section with logo */}
      <div className="flex flex-col items-center pt-12 pb-6 px-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3 mb-3"
        >
          <div
            className="flex items-center justify-center size-12 rounded-xl shadow-md"
            style={{
              background: 'linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)',
            }}
          >
            <GraduationCap className="size-7 text-white" strokeWidth={1.5} />
          </div>
          <h1
            className="text-2xl font-extrabold tracking-tight"
            style={{
              background: 'linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            SPMB AI
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-sm font-medium"
          style={{ color: '#6B7280' }}
        >
          Asisten Pendaftaran Sekolah SD
        </motion.p>
      </div>

      {/* School illustration */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.3 }}
        className="flex justify-center px-6 mb-8"
      >
        <svg
          width="280"
          height="160"
          viewBox="0 0 280 160"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* Sky elements - clouds */}
          <ellipse cx="60" cy="25" rx="25" ry="10" fill="#1565C0" opacity="0.06" />
          <ellipse cx="55" cy="22" rx="15" ry="8" fill="#1565C0" opacity="0.06" />
          <ellipse cx="210" cy="30" rx="20" ry="8" fill="#1565C0" opacity="0.06" />
          <ellipse cx="205" cy="27" rx="12" ry="7" fill="#1565C0" opacity="0.06" />

          {/* Sun */}
          <circle cx="240" cy="25" r="15" fill="#F59E0B" opacity="0.15" />
          <circle cx="240" cy="25" r="10" fill="#F59E0B" opacity="0.2" />

          {/* Main school building */}
          <rect x="75" y="55" width="130" height="70" rx="4" fill="#0D47A1" opacity="0.12" />

          {/* Building details - windows */}
          <rect x="90" y="65" width="22" height="18" rx="2" fill="#1565C0" opacity="0.25" />
          <line x1="101" y1="65" x2="101" y2="83" stroke="#1565C0" strokeWidth="1" opacity="0.15" />
          <line x1="90" y1="74" x2="112" y2="74" stroke="#1565C0" strokeWidth="1" opacity="0.15" />

          <rect x="130" y="65" width="22" height="18" rx="2" fill="#1565C0" opacity="0.25" />
          <line x1="141" y1="65" x2="141" y2="83" stroke="#1565C0" strokeWidth="1" opacity="0.15" />
          <line x1="130" y1="74" x2="152" y2="74" stroke="#1565C0" strokeWidth="1" opacity="0.15" />

          <rect x="168" y="65" width="22" height="18" rx="2" fill="#1565C0" opacity="0.25" />
          <line x1="179" y1="65" x2="179" y2="83" stroke="#1565C0" strokeWidth="1" opacity="0.15" />
          <line x1="168" y1="74" x2="190" y2="74" stroke="#1565C0" strokeWidth="1" opacity="0.15" />

          {/* Door */}
          <rect x="125" y="90" width="28" height="35" rx="3" fill="#1565C0" opacity="0.35" />
          <circle cx="148" cy="108" r="2" fill="#F59E0B" opacity="0.5" />

          {/* Roof */}
          <path d="M65 57L140 20L215 57H65Z" fill="#1565C0" opacity="0.2" />

          {/* Flag on top */}
          <line x1="140" y1="20" x2="140" y2="5" stroke="#0D47A1" strokeWidth="2" opacity="0.4" />
          <rect x="140" y="5" width="15" height="10" rx="1.5" fill="#009688" opacity="0.5" />

          {/* Clock on building */}
          <circle cx="140" cy="45" r="8" fill="white" opacity="0.6" />
          <circle cx="140" cy="45" r="7" fill="white" opacity="0.3" stroke="#1565C0" strokeWidth="0.5" />
          <line x1="140" y1="45" x2="140" y2="40" stroke="#0D47A1" strokeWidth="1" opacity="0.4" />
          <line x1="140" y1="45" x2="144" y2="45" stroke="#0D47A1" strokeWidth="1" opacity="0.4" />

          {/* Left tree */}
          <rect x="30" y="90" width="8" height="35" rx="3" fill="#43A047" opacity="0.3" />
          <ellipse cx="34" cy="75" rx="18" ry="20" fill="#43A047" opacity="0.18" />
          <ellipse cx="34" cy="68" rx="12" ry="14" fill="#43A047" opacity="0.15" />

          {/* Right tree */}
          <rect x="242" y="90" width="8" height="35" rx="3" fill="#43A047" opacity="0.3" />
          <ellipse cx="246" cy="75" rx="18" ry="20" fill="#43A047" opacity="0.18" />
          <ellipse cx="246" cy="68" rx="12" ry="14" fill="#43A047" opacity="0.15" />

          {/* Bushes */}
          <ellipse cx="60" cy="125" rx="12" ry="8" fill="#43A047" opacity="0.12" />
          <ellipse cx="220" cy="125" rx="12" ry="8" fill="#43A047" opacity="0.12" />

          {/* Path to door */}
          <path d="M125 125L130 135L150 135L155 125" fill="#1565C0" opacity="0.08" />

          {/* Ground */}
          <rect x="10" y="125" width="260" height="6" rx="3" fill="#1565C0" opacity="0.08" />

          {/* Small flowers */}
          <circle cx="50" cy="120" r="2.5" fill="#F59E0B" opacity="0.25" />
          <circle cx="55" cy="122" r="2" fill="#EF4444" opacity="0.2" />
          <circle cx="225" cy="120" r="2.5" fill="#F59E0B" opacity="0.25" />
          <circle cx="230" cy="122" r="2" fill="#EF4444" opacity="0.2" />
        </svg>
      </motion.div>

      {/* Buttons section */}
      <div className="flex-1 flex flex-col items-center px-6 gap-4">
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigateTo('chat-ai')}
          className="w-full max-w-sm flex items-center gap-4 rounded-2xl px-5 py-4 shadow-lg transition-shadow hover:shadow-xl"
          style={{
            background: 'linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)',
          }}
        >
          <div className="flex items-center justify-center size-12 rounded-xl bg-white/20 shrink-0">
            <Users className="size-6 text-white" strokeWidth={2} />
          </div>
          <div className="text-left">
            <p className="text-white font-semibold text-base">Masuk sebagai Orang Tua/Wali</p>
            <p className="text-white/70 text-xs mt-0.5">Akses layanan pendaftaran siswa</p>
          </div>
        </motion.button>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigateTo('petugas-login')}
          className="w-full max-w-sm flex items-center gap-4 rounded-2xl px-5 py-4 shadow-lg transition-shadow hover:shadow-xl"
          style={{
            background: 'linear-gradient(135deg, #009688 0%, #00796B 100%)',
          }}
        >
          <div className="flex items-center justify-center size-12 rounded-xl bg-white/20 shrink-0">
            <Shield className="size-6 text-white" strokeWidth={2} />
          </div>
          <div className="text-left">
            <p className="text-white font-semibold text-base">Login Petugas SPMB</p>
            <p className="text-white/70 text-xs mt-0.5">Akses panel verifikasi & admin</p>
          </div>
        </motion.button>
      </div>

      {/* Footer links */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1 }}
        className="flex items-center justify-center gap-6 py-6 mt-auto"
      >
        <button
          onClick={() => navigateTo('bantuan')}
          className="flex items-center gap-1.5 text-xs font-medium transition-colors hover:opacity-80"
          style={{ color: '#6B7280' }}
        >
          <HelpCircle className="size-3.5" />
          Bantuan
        </button>
        <button
          className="flex items-center gap-1.5 text-xs font-medium transition-colors hover:opacity-80"
          style={{ color: '#6B7280' }}
        >
          <BookOpen className="size-3.5" />
          Panduan
        </button>
        <button
          className="flex items-center gap-1.5 text-xs font-medium transition-colors hover:opacity-80"
          style={{ color: '#6B7280' }}
        >
          <Phone className="size-3.5" />
          Kontak Panitia
        </button>
      </motion.div>
    </div>
  );
}
