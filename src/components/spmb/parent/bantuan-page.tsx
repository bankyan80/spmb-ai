'use client';

import React, { useState } from 'react';
import {
  HelpCircle,
  Phone,
  Mail,
  MapPin,
  ChevronDown,
  MessageSquare,
  Clock,
  Building,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpmbStore } from '@/lib/store';
import { SpmbHeader } from '@/components/spmb/shared/spmb-header';

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: 'Bagaimana cara mendaftar?',
    answer:
      'Untuk mendaftar, klik menu "Daftar" pada halaman utama. Isi formulir pendaftaran yang terdiri dari 4 langkah: Data Siswa, Data Orang Tua, Data Tambahan, dan Konfirmasi. Setelah semua data diisi dengan benar, klik "Kirim Pendaftaran". Anda akan menerima nomor registrasi sebagai bukti pendaftaran.',
  },
  {
    question: 'Berapa usia minimal untuk masuk SD?',
    answer:
      'Usia minimal untuk masuk SD adalah 6 (enam) tahun pada tanggal 1 Juli tahun berjalan. Calon siswa yang berusia 5 tahun 6 bulan dapat dipertimbangkan dengan rekomendasi khusus. Gunakan fitur "Cek Usia Anak" untuk memastikan kelayakan usia putra-putri Anda.',
  },
  {
    question: 'Dokumen apa saja yang diperlukan?',
    answer:
      'Dokumen yang diperlukan untuk pendaftaran: 1) Kartu Keluarga (KK), 2) Akta Kelahiran, 3) KTP Orang Tua/Wali, 4) KIP/KKS/PKH (jika mendaftar jalur afirmasi), 5) Dokumen Pendukung sesuai jalur pendaftaran (surat keterangan pindah tugas untuk jalur mutasi, piagam penghargaan untuk jalur prestasi, dll). Semua dokumen diupload dalam format PDF atau gambar.',
  },
  {
    question: 'Bagaimana cara cek status pendaftaran?',
    answer:
      'Untuk mengecek status pendaftaran, klik menu "Status Daftar" pada halaman utama. Masukkan Nomor Registrasi, NIK Siswa, atau Nomor HP yang digunakan saat pendaftaran. Sistem akan menampilkan status terkini pendaftaran Anda beserta catatan dari operator jika ada.',
  },
  {
    question: 'Kapan pengumuman hasil SPMB?',
    answer:
      'Pengumuman hasil SPMB dijadwalkan pada tanggal 1 Maret 2026. Anda dapat mengecek pengumuman melalui menu "Pengumuman" pada aplikasi ini dengan memasukkan nomor registrasi. Pastikan Anda terus memantau aplikasi untuk informasi terbaru.',
  },
  {
    question: 'Apa yang harus dilakukan setelah diterima?',
    answer:
      'Setelah dinyatakan diterima, Anda harus melakukan daftar ulang dalam periode yang telah ditentukan (2 Maret - 15 Maret 2026). Klik menu "Daftar Ulang" untuk melengkapi data dan mengupload dokumen yang diperlukan. Jika tidak melakukan daftar ulang dalam periode yang ditentukan, maka pendaftaran akan dibatalkan.',
  },
  {
    question: 'Bagaimana jika memerlukan bantuan lebih lanjut?',
    answer:
      'Jika Anda memerlukan bantuan lebih lanjut, Anda dapat: 1) Menggunakan fitur Chat AI untuk bertanya langsung, 2) Menghubungi panitia melalui telepon atau email yang tertera di bawah, 3) Datang langsung ke Dinas Pendidikan atau sekolah tujuan pada jam kerja. Tim kami siap membantu Anda.',
  },
];

function FAQAccordionItem({
  item,
  isOpen,
  onToggle,
}: {
  item: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className="rounded-xl border overflow-hidden transition-all"
      style={{
        borderColor: isOpen ? '#1565C0' : '#E5E7EB',
        backgroundColor: isOpen ? '#F3F8FF' : '#FFFFFF',
      }}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-start justify-between p-4 text-left gap-3"
      >
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div
            className="flex items-center justify-center size-6 rounded-full shrink-0 mt-0.5"
            style={{ backgroundColor: isOpen ? '#1565C0' : '#E5E7EB' }}
          >
            <HelpCircle
              className="size-3.5"
              style={{ color: isOpen ? '#FFFFFF' : '#9CA3AF' }}
            />
          </div>
          <span
            className="text-sm font-medium leading-snug"
            style={{ color: isOpen ? '#1565C0' : '#1F2937' }}
          >
            {item.question}
          </span>
        </div>
        <ChevronDown
          className="size-4 shrink-0 mt-1 transition-transform duration-200"
          style={{
            color: isOpen ? '#1565C0' : '#9CA3AF',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pl-[52px]">
              <p className="text-xs leading-relaxed" style={{ color: '#4B5563' }}>
                {item.answer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function BantuanPage() {
  const { navigateTo, goBack } = useSpmbStore();

  const [openFAQ, setOpenFAQ] = useState<number | null>(0);

  const handleToggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#F3F8FF' }}>
      <SpmbHeader
        title="Bantuan"
        showBack
        onBack={() => goBack()}
      />

      <div className="flex-1 overflow-y-auto px-4 py-4 pb-4 space-y-4">
        {/* Chat AI CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-5 shadow-md"
          style={{
            background: 'linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)',
          }}
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center size-12 rounded-xl bg-white/20 shrink-0">
              <MessageSquare className="size-6 text-white" strokeWidth={1.5} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-white font-semibold text-sm">
                Butuh Bantuan Langsung?
              </p>
              <p className="text-white/70 text-xs mt-0.5 leading-relaxed">
                Tanyakan apa saja tentang SPMB SD kepada asisten AI kami
              </p>
            </div>
            <button
              onClick={() => navigateTo('chat-ai')}
              className="h-9 px-4 rounded-lg bg-white text-sm font-semibold shrink-0 transition-all active:scale-[0.98]"
              style={{ color: '#1565C0' }}
            >
              Chat
            </button>
          </div>
        </motion.div>

        {/* FAQ Section */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <HelpCircle className="size-4" style={{ color: '#1565C0' }} />
            <h2 className="text-sm font-semibold" style={{ color: '#1F2937' }}>
              Pertanyaan yang Sering Diajukan
            </h2>
          </div>

          <div className="space-y-2">
            {faqData.map((item, index) => (
              <FAQAccordionItem
                key={index}
                item={item}
                isOpen={openFAQ === index}
                onToggle={() => handleToggleFAQ(index)}
              />
            ))}
          </div>
        </div>

        {/* Contact Section */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Phone className="size-4" style={{ color: '#009688' }} />
            <h2 className="text-sm font-semibold" style={{ color: '#1F2937' }}>
              Hubungi Kami
            </h2>
          </div>

          <div className="space-y-3">
            {/* Telepon */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center gap-3">
                <div
                  className="flex items-center justify-center size-10 rounded-lg shrink-0"
                  style={{ backgroundColor: '#E0F2F1' }}
                >
                  <Phone className="size-5" style={{ color: '#009688' }} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs" style={{ color: '#6B7280' }}>Telepon Panitia</p>
                  <p className="text-sm font-semibold" style={{ color: '#1F2937' }}>
                    (021) 8888-7777
                  </p>
                </div>
                <div className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-full" style={{ backgroundColor: '#E0F2F1', color: '#009688' }}>
                  <Clock className="size-3" />
                  08:00 - 15:00
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center gap-3">
                <div
                  className="flex items-center justify-center size-10 rounded-lg shrink-0"
                  style={{ backgroundColor: '#E3F2FD' }}
                >
                  <Mail className="size-5" style={{ color: '#1565C0' }} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs" style={{ color: '#6B7280' }}>Email</p>
                  <p className="text-sm font-semibold" style={{ color: '#1F2937' }}>
                    spmb@dinaspendidikan.go.id
                  </p>
                </div>
              </div>
            </div>

            {/* Alamat */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-start gap-3">
                <div
                  className="flex items-center justify-center size-10 rounded-lg shrink-0 mt-0.5"
                  style={{ backgroundColor: '#FFF7ED' }}
                >
                  <MapPin className="size-5" style={{ color: '#F59E0B' }} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs" style={{ color: '#6B7280' }}>Alamat Dinas Pendidikan</p>
                  <p className="text-sm font-semibold leading-relaxed" style={{ color: '#1F2937' }}>
                    Jl. Pendidikan No. 1, Bekasi, Jawa Barat 17111
                  </p>
                  <div className="flex items-center gap-1 text-[10px] mt-1 px-2 py-1 rounded-full w-fit" style={{ backgroundColor: '#FFF7ED', color: '#F59E0B' }}>
                    <Building className="size-3" />
                    Senin - Jumat
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* App Info */}
        <div className="rounded-xl p-4 border text-center" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}>
          <p className="text-xs font-medium" style={{ color: '#6B7280' }}>
            SPMB SD 2026/2027 v1.0.0
          </p>
          <p className="text-[10px] mt-1" style={{ color: '#9CA3AF' }}>
            Sistem Penerimaan Murid Baru SD Tahun Ajaran 2026/2027
          </p>
          <p className="text-[10px] mt-0.5" style={{ color: '#9CA3AF' }}>
            Dinas Pendidikan Kabupaten Bekasi
          </p>
        </div>
      </div>

    </div>
  );
}
