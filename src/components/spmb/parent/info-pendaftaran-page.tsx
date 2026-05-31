'use client';

import React from 'react';
import {
  Calendar,
  Baby,
  Route,
  School,
  FileText,
  ClipboardList,
  Search,
  Bell,
  CheckCircle,
  AlertTriangle,
  BookX,
} from 'lucide-react';
import { useSpmbStore } from '@/lib/store';
import { SpmbHeader } from '@/components/spmb/shared/spmb-header';
import { formatDate } from '@/lib/business-logic';
import {
  spmbSchedule,
  syaratDokumen,
  jalurPendaftaran,
  mockSettings,
  mockSchools,
} from '@/lib/mock-data';

interface InfoSectionProps {
  icon: React.ReactNode;
  title: string;
  color: string;
  children: React.ReactNode;
}

function InfoSection({ icon, title, color, children }: InfoSectionProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3" style={{ borderLeft: `4px solid ${color}` }}>
        <div
          className="flex items-center justify-center size-9 rounded-lg shrink-0"
          style={{ backgroundColor: `${color}15` }}
        >
          <div style={{ color }}>{icon}</div>
        </div>
        <h2 className="text-sm font-semibold" style={{ color: '#1F2937' }}>
          {title}
        </h2>
      </div>
      <div className="px-4 pb-4 pt-1">{children}</div>
    </div>
  );
}

export function InfoPendaftaranPage() {
  const { navigateTo, goBack } = useSpmbStore();

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#F3F8FF' }}>
      {/* Header */}
      <SpmbHeader
        title="Info Pendaftaran"
        showBack
        onBack={() => goBack()}
      />

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-4">

        {/* Regulasi & Dasar Hukum */}
        <InfoSection icon={<BookX className="size-5" />} title="Dasar Regulasi" color="#1565C0">
          <div className="space-y-2">
            <p className="text-sm leading-relaxed" style={{ color: '#374151' }}>
              Sistem Penerimaan Murid Baru (SPMB) atau Penerimaan Peserta Didik Baru (PPDB) untuk jenjang SD Tahun Ajaran 2026/2027 secara nasional mengacu pada regulasi terbaru Kemendikdasmen (Permendikdasmen No. 3 Tahun 2025).
            </p>
            <p className="text-sm leading-relaxed" style={{ color: '#374151' }}>
              Proses seleksi menitikberatkan pada aspek <strong>usia</strong> dan <strong>domisili</strong>, serta secara tegas melarang tes membaca, menulis, dan berhitung (calistung) sebagai syarat masuk.
            </p>
          </div>
        </InfoSection>

        {/* Syarat Usia */}
        <InfoSection icon={<Baby className="size-5" />} title="Syarat Usia" color="#009688">
          <div className="space-y-3">
            <p className="text-xs font-medium" style={{ color: '#6B7280' }}>
              Penentuan usia dihitung per <strong>{formatDate(mockSettings.tanggalAcuanUsia)}</strong>:
            </p>

            <div
              className="rounded-lg p-3 border"
              style={{ backgroundColor: '#E8F5E9', borderColor: '#A5D6A7' }}
            >
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="size-4" style={{ color: '#2E7D32' }} />
                <p className="text-sm font-semibold" style={{ color: '#1B5E20' }}>
                  Usia Prioritas Utama: {mockSettings.usiaPrioritasSD} Tahun
                </p>
              </div>
              <p className="text-xs" style={{ color: '#2E7D32' }}>
                Calon murid yang sudah berusia {mockSettings.usiaPrioritasSD} tahun wajib diterima dan mendapatkan prioritas tertinggi dalam antrean seleksi.
              </p>
            </div>

            <div
              className="rounded-lg p-3 border"
              style={{ backgroundColor: '#E3F2FD', borderColor: '#90CAF9' }}
            >
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="size-4" style={{ color: '#1565C0' }} />
                <p className="text-sm font-semibold" style={{ color: '#0D47A1' }}>
                  Usia Minimal Standar: {mockSettings.usiaMinimalSD} Tahun
                </p>
              </div>
              <p className="text-xs" style={{ color: '#1565C0' }}>
                Calon murid berusia paling rendah {mockSettings.usiaMinimalSD} tahun diperbolehkan mendaftar.
              </p>
            </div>

            <div
              className="rounded-lg p-3 border"
              style={{ backgroundColor: '#FFF3E0', borderColor: '#FFCC80' }}
            >
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="size-4" style={{ color: '#E65100' }} />
                <p className="text-sm font-semibold" style={{ color: '#E65100' }}>
                  Pengecualian Khusus: 5 Tahun 6 Bulan
                </p>
              </div>
              <p className="text-xs" style={{ color: '#E65100' }}>
                Anak yang berusia minimal 5 tahun 6 bulan boleh mendaftar <strong>hanya jika</strong> memiliki potensi kecerdasan/bakat istimewa serta kesiapan psikologis, dibuktikan dengan <strong>surat rekomendasi tertulis dari psikolog profesional</strong> (atau Dewan Guru sekolah jika psikolog tidak tersedia di daerah tersebut).
              </p>
            </div>

            <div
              className="rounded-lg p-3 text-xs flex items-start gap-2"
              style={{ backgroundColor: '#FFEBEE', color: '#C62828', border: '1px solid #EF9A9A' }}
            >
              <BookX className="size-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Dilarang Tes Calistung!</p>
                <p className="mt-0.5">
                  Sekolah dilarang keras mengadakan tes Membaca, Menulis, dan Berhitung (Calistung) sebagai standar seleksi masuk kelas 1 SD.
                </p>
              </div>
            </div>
          </div>
        </InfoSection>

        {/* Jalur Pendaftaran */}
        <InfoSection icon={<Route className="size-5" />} title="Jalur Pendaftaran & Kuota" color="#1565C0">
          <div className="space-y-3">
            {jalurPendaftaran.map((jalur) => (
              <div
                key={jalur.id}
                className="rounded-lg p-3"
                style={{ backgroundColor: '#F3F8FF' }}
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium" style={{ color: '#1F2937' }}>
                    {jalur.nama}
                  </p>
                  <span
                    className="shrink-0 text-xs font-bold px-2.5 py-1 rounded-full"
                    style={{ backgroundColor: '#1565C0', color: '#FFFFFF' }}
                  >
                    {jalur.kuota}%
                  </span>
                </div>
                <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>
                  {jalur.deskripsi}
                </p>
              </div>
            ))}

            <div
              className="rounded-lg p-3 text-xs"
              style={{ backgroundColor: '#FEF3C7', color: '#92400E', border: '1px solid #FDE68A' }}
            >
              <p className="font-medium">Catatan:</p>
              <p>Proporsi kuota dapat sedikit bervariasi tergantung kebijakan pemerintah daerah masing-masing.</p>
            </div>
          </div>
        </InfoSection>

        {/* Dokumen Persyaratan */}
        <InfoSection icon={<FileText className="size-5" />} title="Dokumen Persyaratan" color="#009688">
          <div className="space-y-3">
            <p className="text-xs" style={{ color: '#6B7280' }}>
              Siapkan berkas berikut (asli dan hasil scan digital, maksimal 1 MB per file):
            </p>
            {syaratDokumen.map((doc, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div
                  className="flex items-center justify-center size-6 rounded-full shrink-0 text-xs font-bold"
                  style={{ backgroundColor: '#E0F2F1', color: '#009688' }}
                >
                  {idx + 1}
                </div>
                <p className="text-sm" style={{ color: '#1F2937' }}>{doc}</p>
              </div>
            ))}
          </div>
        </InfoSection>

        {/* Jadwal Pendaftaran */}
        <InfoSection icon={<Calendar className="size-5" />} title="Jadwal Pendaftaran" color="#1565C0">
          <div className="space-y-3">
            <p className="text-xs" style={{ color: '#6B7280' }}>
              Perkiraan timeline pelaksanaan SPMB SD 2026/2027:
            </p>
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center size-7 rounded-full shrink-0 text-xs font-bold" style={{ backgroundColor: '#E3F2FD', color: '#1565C0' }}>1</div>
                <div>
                  <p className="text-xs font-medium" style={{ color: '#6B7280' }}>Awal - Pertengahan Juni 2026</p>
                  <p className="text-sm" style={{ color: '#1F2937' }}>
                    Sosialisasi, pembuatan akun, unggah berkas, dan pendaftaran jalur afirmasi/mutasi
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center size-7 rounded-full shrink-0 text-xs font-bold" style={{ backgroundColor: '#E0F2F1', color: '#009688' }}>2</div>
                <div>
                  <p className="text-xs font-medium" style={{ color: '#6B7280' }}>Pertengahan - Akhir Juni 2026</p>
                  <p className="text-sm" style={{ color: '#1F2937' }}>
                    Pendaftaran jalur domisili/zonasi dan verifikasi berkas oleh sekolah
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center size-7 rounded-full shrink-0 text-xs font-bold" style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}>3</div>
                <div>
                  <p className="text-xs font-medium" style={{ color: '#6B7280' }}>Akhir Juni - Awal Juli 2026</p>
                  <p className="text-sm" style={{ color: '#1F2937' }}>
                    Pengumuman hasil seleksi, masa sanggah, dan proses daftar ulang
                  </p>
                </div>
              </div>
            </div>
          </div>
        </InfoSection>

        {/* Kuota Sekolah */}
        <InfoSection icon={<School className="size-5" />} title="Kuota Sekolah" color="#43A047">
          <div className="space-y-2">
            {mockSchools.map((school) => {
              const percentage = Math.round((school.sisaKuota / school.kuota) * 100);
              const isFull = school.sisaKuota === 0;
              const isLow = school.sisaKuota > 0 && school.sisaKuota <= school.kuota * 0.2;
              const barColor = isFull ? '#EF4444' : isLow ? '#F59E0B' : '#43A047';
              const statusText = isFull ? 'Penuh' : isLow ? 'Hampir Penuh' : 'Tersedia';
              const statusBg = isFull ? '#FEE2E2' : isLow ? '#FEF3C7' : '#E8F5E9';
              const statusColor = isFull ? '#DC2626' : isLow ? '#D97706' : '#2E7D32';

              return (
                <div
                  key={school.schoolId}
                  className="rounded-lg p-3"
                  style={{ backgroundColor: '#F9FAFB' }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium" style={{ color: '#1F2937' }}>
                        {school.namaSekolah}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>
                        {school.alamat}
                      </p>
                    </div>
                    <span
                      className="shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: statusBg, color: statusColor }}
                    >
                      {statusText}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${percentage}%`, backgroundColor: barColor }}
                      />
                    </div>
                    <span className="text-xs font-medium shrink-0" style={{ color: '#1F2937' }}>
                      {school.sisaKuota}/{school.kuota}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </InfoSection>

        {/* Cara Daftar */}
        <InfoSection icon={<ClipboardList className="size-5" />} title="Cara Daftar" color="#1565C0">
          <div className="space-y-3">
            {[
              'Cek usia anak melalui menu "Cek Usia Anak"',
              'Cek domisili dan pilih sekolah melalui menu "Cek Domisili"',
              'Siapkan dokumen persyaratan (scan digital max 1 MB)',
              'Klik menu "Daftar" untuk memulai pendaftaran',
              'Isi data diri anak dan orang tua/wali',
              'Upload dokumen yang diperlukan',
              'Submit pendaftaran dan simpan nomor registrasi',
              'Tunggu verifikasi dari operator sekolah',
            ].map((step, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div
                  className="flex items-center justify-center size-7 rounded-full shrink-0 text-xs font-bold"
                  style={{ backgroundColor: '#E3F2FD', color: '#1565C0' }}
                >
                  {idx + 1}
                </div>
                <p className="text-sm mt-0.5" style={{ color: '#1F2937' }}>{step}</p>
              </div>
            ))}
          </div>
        </InfoSection>

        {/* Cara Cek Status */}
        <InfoSection icon={<Search className="size-5" />} title="Cara Cek Status" color="#009688">
          <div className="space-y-3">
            {[
              'Buka menu "Status Daftar"',
              'Masukkan nomor pendaftaran, NIK, atau nomor HP',
              'Sistem akan menampilkan status terkini pendaftaran',
              'Jika status "Perlu Perbaikan", segera lengkapi dokumen',
            ].map((step, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div
                  className="flex items-center justify-center size-7 rounded-full shrink-0 text-xs font-bold"
                  style={{ backgroundColor: '#E0F2F1', color: '#009688' }}
                >
                  {idx + 1}
                </div>
                <p className="text-sm mt-0.5" style={{ color: '#1F2937' }}>{step}</p>
              </div>
            ))}
          </div>
        </InfoSection>

        {/* Cara Pengumuman */}
        <InfoSection icon={<Bell className="size-5" />} title="Cara Pengumuman" color="#F59E0B">
          <div className="space-y-3">
            {[
              'Pengumuman diumumkan pada akhir Juni - awal Juli 2026',
              'Buka menu "Pengumuman" di aplikasi',
              'Masukkan nomor pendaftaran untuk melihat hasil',
              'Hasil bisa diterima, cadangan, atau tidak diterima',
            ].map((step, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div
                  className="flex items-center justify-center size-7 rounded-full shrink-0 text-xs font-bold"
                  style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}
                >
                  {idx + 1}
                </div>
                <p className="text-sm mt-0.5" style={{ color: '#1F2937' }}>{step}</p>
              </div>
            ))}
          </div>
        </InfoSection>

        {/* Cara Daftar Ulang */}
        <InfoSection icon={<CheckCircle className="size-5" />} title="Cara Daftar Ulang" color="#43A047">
          <div className="space-y-3">
            {[
              'Hanya untuk siswa dengan status "Diterima"',
              'Buka menu "Daftar Ulang"',
              'Isi data lengkap siswa dan keluarga',
              'Upload dokumen asli yang sudah diverifikasi',
              'Tunggu verifikasi daftar ulang dari operator',
              'Setelah terverifikasi, siswa resmi terdaftar',
            ].map((step, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div
                  className="flex items-center justify-center size-7 rounded-full shrink-0 text-xs font-bold"
                  style={{ backgroundColor: '#E8F5E9', color: '#43A047' }}
                >
                  {idx + 1}
                </div>
                <p className="text-sm mt-0.5" style={{ color: '#1F2937' }}>{step}</p>
              </div>
            ))}
          </div>
        </InfoSection>

      </div>
    </div>
  );
}
