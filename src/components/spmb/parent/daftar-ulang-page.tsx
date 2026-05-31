'use client';

import React, { useState, useCallback } from 'react';
import {
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
  Upload,
  FileText,
  User,
  MapPin,
  Phone,
  Heart,
  Download,
  ClipboardCheck,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpmbStore } from '@/lib/store';
import { SpmbHeader } from '@/components/spmb/shared/spmb-header';
import { formatDate } from '@/lib/business-logic';
import type { Applicant, ReRegistrationForm } from '@/lib/types';

interface DaftarUlangDoc {
  key: string;
  label: string;
  required: boolean;
  filename: string;
}

const initialDocs: DaftarUlangDoc[] = [
  { key: 'kk', label: 'Kartu Keluarga', required: true, filename: '' },
  { key: 'akta', label: 'Akta Kelahiran', required: true, filename: '' },
  { key: 'ktpAyah', label: 'KTP Ayah', required: true, filename: '' },
  { key: 'ktpIbu', label: 'KTP Ibu', required: true, filename: '' },
  { key: 'pasFoto', label: 'Pas Foto Anak', required: true, filename: '' },
  { key: 'kipKksPkh', label: 'KIP/KKS/PKH (jika ada)', required: false, filename: '' },
  { key: 'suratTk', label: 'Surat Keterangan TK/PAUD (jika ada)', required: false, filename: '' },
  { key: 'dokumenLain', label: 'Dokumen Pendukung Lainnya', required: false, filename: '' },
];

const docFilenames: Record<string, string> = {
  kk: 'kartu_keluarga.pdf',
  akta: 'akta_kelahiran.pdf',
  ktpAyah: 'ktp_ayah.pdf',
  ktpIbu: 'ktp_ibu.pdf',
  pasFoto: 'pas_foto_anak.jpg',
  kipKksPkh: 'kip_kks_pkh.pdf',
  suratTk: 'surat_tk_paud.pdf',
  dokumenLain: 'dokumen_pendukung.pdf',
};

export function DaftarUlangPage() {
  const { navigateTo, applicants, submitReRegistration } = useSpmbStore();

  const [step, setStep] = useState<'check' | 'form' | 'success'>('check');
  const [nomorRegistrasi, setNomorRegistrasi] = useState('');
  const [applicantData, setApplicantData] = useState<Applicant | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [notAccepted, setNotAccepted] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  // Form state
  const [form, setForm] = useState<ReRegistrationForm>({
    nomorPendaftaran: '',
    nikSiswa: '',
    nisn: '',
    namaLengkap: '',
    tempatLahir: '',
    tanggalLahir: '',
    jenisKelamin: '',
    agama: '',
    alamatLengkap: '',
    dataAyah: '',
    dataIbu: '',
    noHpAktif: '',
    sekolahAsalTk: '',
    kontakDarurat: '',
    dataKesehatan: '',
  });
  const [docs, setDocs] = useState<DaftarUlangDoc[]>(initialDocs);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleCheck = () => {
    if (!nomorRegistrasi.trim()) return;

    setIsChecking(true);
    setNotFound(false);
    setNotAccepted(false);
    setApplicantData(null);

    setTimeout(() => {
      const found = applicants.find(
        (a) => a.nomorPendaftaran === nomorRegistrasi.trim()
      );

      if (!found) {
        setNotFound(true);
        setIsChecking(false);
        return;
      }

      if (found.statusPendaftaran !== 'diterima') {
        setNotAccepted(true);
        setApplicantData(found);
        setIsChecking(false);
        return;
      }

      // Found and accepted - populate form
      setApplicantData(found);
      setForm({
        nomorPendaftaran: found.nomorPendaftaran,
        nikSiswa: found.nik,
        nisn: found.nisn,
        namaLengkap: found.namaSiswa,
        tempatLahir: found.tempatLahir,
        tanggalLahir: found.tanggalLahir,
        jenisKelamin: found.jenisKelamin,
        agama: found.agama,
        alamatLengkap: found.alamat,
        dataAyah: `${found.namaAyah} - ${found.pekerjaanAyah}`,
        dataIbu: `${found.namaIbu} - ${found.pekerjaanIbu}`,
        noHpAktif: found.noHpOrtu,
        sekolahAsalTk: '',
        kontakDarurat: '',
        dataKesehatan: '',
      });
      setStep('form');
      setIsChecking(false);
    }, 500);
  };

  const updateFormField = useCallback((field: keyof ReRegistrationForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }, [errors]);

  const handleDocUpload = (key: string) => {
    setDocs((prev) =>
      prev.map((d) =>
        d.key === key
          ? { ...d, filename: d.filename ? '' : docFilenames[key] || 'dokumen.pdf' }
          : d
      )
    );
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.alamatLengkap.trim()) {
      newErrors.alamatLengkap = 'Alamat wajib diisi';
    }
    if (!form.noHpAktif.trim()) {
      newErrors.noHpAktif = 'Nomor HP wajib diisi';
    }

    // Check required documents
    const missingDocs = docs.filter((d) => d.required && !d.filename);
    if (missingDocs.length > 0) {
      newErrors.documents = `${missingDocs.length} dokumen wajib belum diupload`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm() || !applicantData) return;

    submitReRegistration(applicantData.applicantId);
    setStep('success');
  };

  // Step: Check
  const renderCheckStep = () => (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center gap-2 mb-4">
          <div
            className="flex items-center justify-center size-8 rounded-lg"
            style={{ backgroundColor: '#E8F5E9' }}
          >
            <ClipboardCheck className="size-4" style={{ color: '#43A047' }} />
          </div>
          <h2 className="text-sm font-semibold" style={{ color: '#1F2937' }}>
            Daftar Ulang
          </h2>
        </div>

        <p className="text-xs mb-4" style={{ color: '#6B7280' }}>
          Masukkan nomor registrasi Anda untuk memulai proses daftar ulang.
          Hanya calon siswa yang dinyatakan <strong>diterima</strong> yang dapat melakukan daftar ulang.
        </p>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#6B7280' }}>
              Nomor Registrasi
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={nomorRegistrasi}
                onChange={(e) => setNomorRegistrasi(e.target.value)}
                placeholder="SPMB-2026-XXXXXX"
                className="flex-1 h-11 rounded-lg border px-3 text-sm outline-none transition-colors"
                style={{ borderColor: '#E5E7EB', backgroundColor: '#F9FAFB', color: '#1F2937' }}
                onFocus={(e) => { e.target.style.borderColor = '#43A047'; }}
                onBlur={(e) => { e.target.style.borderColor = '#E5E7EB'; }}
                onKeyDown={(e) => { if (e.key === 'Enter') handleCheck(); }}
              />
              <button
                onClick={handleCheck}
                disabled={!nomorRegistrasi.trim() || isChecking}
                className="h-11 px-5 rounded-lg text-white text-sm font-semibold flex items-center gap-2 transition-all active:scale-[0.98] disabled:opacity-40"
                style={{ backgroundColor: nomorRegistrasi.trim() ? '#43A047' : '#9CA3AF' }}
              >
                {isChecking ? (
                  <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Search className="size-4" />
                )}
                Cek
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Not Found */}
      <AnimatePresence>
        {notFound && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center"
          >
            <div
              className="flex items-center justify-center size-16 rounded-full mx-auto mb-3"
              style={{ backgroundColor: '#FEE2E2' }}
            >
              <AlertCircle className="size-8" style={{ color: '#EF4444' }} />
            </div>
            <h3 className="text-sm font-semibold mb-1" style={{ color: '#1F2937' }}>
              Data Tidak Ditemukan
            </h3>
            <p className="text-xs" style={{ color: '#6B7280' }}>
              Pastikan nomor registrasi yang dimasukkan sudah benar.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Not Accepted */}
      <AnimatePresence>
        {notAccepted && applicantData && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-xl border p-4"
            style={{
              backgroundColor: '#FFEBEE',
              borderColor: '#EF9A9A',
            }}
          >
            <div className="flex items-start gap-3">
              <XCircle className="size-6 shrink-0 mt-0.5" style={{ color: '#EF4444' }} />
              <div>
                <p className="text-sm font-semibold" style={{ color: '#C62828' }}>
                  Tidak Dapat Daftar Ulang
                </p>
                <p className="text-xs mt-1 leading-relaxed" style={{ color: '#C62828' }}>
                  Mohon maaf, daftar ulang hanya dapat dilakukan oleh calon siswa yang sudah dinyatakan
                  diterima. Status pendaftaran Anda saat ini:{' '}
                  <strong>{applicantData.statusPendaftaran.replace(/_/g, ' ')}</strong>.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick suggestions */}
      {!applicantData && !notFound && !notAccepted && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-xs font-medium mb-3" style={{ color: '#6B7280' }}>
            Coba nomor registrasi berikut (demo - cari yang &quot;diterima&quot;):
          </p>
          <div className="space-y-2">
            {applicants
              .filter((a) => a.statusPendaftaran === 'diterima')
              .slice(0, 3)
              .map((a) => (
                <button
                  key={a.applicantId}
                  onClick={() => setNomorRegistrasi(a.nomorPendaftaran)}
                  className="w-full text-left p-3 rounded-lg border transition-colors hover:bg-gray-50"
                  style={{ borderColor: '#E5E7EB' }}
                >
                  <p className="text-xs font-medium" style={{ color: '#43A047' }}>
                    {a.nomorPendaftaran}
                  </p>
                  <p className="text-[10px] mt-0.5" style={{ color: '#6B7280' }}>
                    {a.namaSiswa} - {a.namaSekolah}
                  </p>
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );

  // Step: Form
  const renderFormStep = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-4"
    >
      {/* Auto-filled data card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center gap-2 mb-4">
          <div
            className="flex items-center justify-center size-8 rounded-lg"
            style={{ backgroundColor: '#E3F2FD' }}
          >
            <User className="size-4" style={{ color: '#1565C0' }} />
          </div>
          <h3 className="text-sm font-semibold" style={{ color: '#1F2937' }}>
            Data Siswa
          </h3>
        </div>

        <div className="space-y-3">
          {[
            { label: 'Nomor Registrasi', value: form.nomorPendaftaran },
            { label: 'NIK Siswa', value: form.nikSiswa },
            { label: 'NISN', value: form.nisn || '-' },
            { label: 'Nama Lengkap', value: form.namaLengkap },
            { label: 'Tempat Lahir', value: form.tempatLahir },
            { label: 'Tanggal Lahir', value: form.tanggalLahir ? formatDate(form.tanggalLahir) : '-' },
            { label: 'Jenis Kelamin', value: form.jenisKelamin },
            { label: 'Agama', value: form.agama },
          ].map((item, i) => (
            <div key={i}>
              <div className="flex justify-between items-start">
                <span className="text-xs" style={{ color: '#6B7280' }}>{item.label}</span>
                <span className="text-xs font-medium text-right max-w-[60%]" style={{ color: '#1F2937' }}>
                  {item.value}
                </span>
              </div>
              {i < 7 && <div className="h-px mt-2" style={{ backgroundColor: '#F3F4F6' }} />}
            </div>
          ))}
        </div>
      </div>

      {/* Editable form fields */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center gap-2 mb-4">
          <div
            className="flex items-center justify-center size-8 rounded-lg"
            style={{ backgroundColor: '#E8F5E9' }}
          >
            <MapPin className="size-4" style={{ color: '#43A047' }} />
          </div>
          <h3 className="text-sm font-semibold" style={{ color: '#1F2937' }}>
            Data Tambahan
          </h3>
        </div>

        <div className="space-y-4">
          {/* Alamat */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#6B7280' }}>
              Alamat Lengkap <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <textarea
              value={form.alamatLengkap}
              onChange={(e) => updateFormField('alamatLengkap', e.target.value)}
              placeholder="Alamat lengkap tempat tinggal"
              rows={3}
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors resize-none"
              style={{
                borderColor: errors.alamatLengkap ? '#EF4444' : '#E5E7EB',
                backgroundColor: '#F9FAFB',
                color: '#1F2937',
              }}
              onFocus={(e) => { if (!errors.alamatLengkap) e.target.style.borderColor = '#43A047'; }}
              onBlur={(e) => { e.target.style.borderColor = errors.alamatLengkap ? '#EF4444' : '#E5E7EB'; }}
            />
            {errors.alamatLengkap && (
              <p className="text-xs mt-1 flex items-center gap-1" style={{ color: '#EF4444' }}>
                <AlertCircle className="size-3" /> {errors.alamatLengkap}
              </p>
            )}
          </div>

          {/* Data Ayah */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#6B7280' }}>
              Data Ayah
            </label>
            <input
              type="text"
              value={form.dataAyah}
              onChange={(e) => updateFormField('dataAyah', e.target.value)}
              placeholder="Nama - Pekerjaan"
              className="w-full h-11 rounded-lg border px-3 text-sm outline-none transition-colors"
              style={{ borderColor: '#E5E7EB', backgroundColor: '#F9FAFB', color: '#1F2937' }}
              onFocus={(e) => { e.target.style.borderColor = '#43A047'; }}
              onBlur={(e) => { e.target.style.borderColor = '#E5E7EB'; }}
            />
          </div>

          {/* Data Ibu */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#6B7280' }}>
              Data Ibu
            </label>
            <input
              type="text"
              value={form.dataIbu}
              onChange={(e) => updateFormField('dataIbu', e.target.value)}
              placeholder="Nama - Pekerjaan"
              className="w-full h-11 rounded-lg border px-3 text-sm outline-none transition-colors"
              style={{ borderColor: '#E5E7EB', backgroundColor: '#F9FAFB', color: '#1F2937' }}
              onFocus={(e) => { e.target.style.borderColor = '#43A047'; }}
              onBlur={(e) => { e.target.style.borderColor = '#E5E7EB'; }}
            />
          </div>

          {/* No HP Aktif */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#6B7280' }}>
              Nomor HP Aktif <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <input
              type="tel"
              value={form.noHpAktif}
              onChange={(e) => updateFormField('noHpAktif', e.target.value)}
              placeholder="08xxxxxxxxxx"
              className="w-full h-11 rounded-lg border px-3 text-sm outline-none transition-colors"
              style={{
                borderColor: errors.noHpAktif ? '#EF4444' : '#E5E7EB',
                backgroundColor: '#F9FAFB',
                color: '#1F2937',
              }}
              onFocus={(e) => { if (!errors.noHpAktif) e.target.style.borderColor = '#43A047'; }}
              onBlur={(e) => { e.target.style.borderColor = errors.noHpAktif ? '#EF4444' : '#E5E7EB'; }}
            />
            {errors.noHpAktif && (
              <p className="text-xs mt-1 flex items-center gap-1" style={{ color: '#EF4444' }}>
                <AlertCircle className="size-3" /> {errors.noHpAktif}
              </p>
            )}
          </div>

          {/* Sekolah Asal TK/PAUD */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#6B7280' }}>
              Sekolah Asal TK/PAUD
            </label>
            <input
              type="text"
              value={form.sekolahAsalTk}
              onChange={(e) => updateFormField('sekolahAsalTk', e.target.value)}
              placeholder="Nama TK/PAUD (jika ada)"
              className="w-full h-11 rounded-lg border px-3 text-sm outline-none transition-colors"
              style={{ borderColor: '#E5E7EB', backgroundColor: '#F9FAFB', color: '#1F2937' }}
              onFocus={(e) => { e.target.style.borderColor = '#43A047'; }}
              onBlur={(e) => { e.target.style.borderColor = '#E5E7EB'; }}
            />
          </div>

          {/* Kontak Darurat */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#6B7280' }}>
              Kontak Darurat
            </label>
            <input
              type="text"
              value={form.kontakDarurat}
              onChange={(e) => updateFormField('kontakDarurat', e.target.value)}
              placeholder="Nama - Nomor HP"
              className="w-full h-11 rounded-lg border px-3 text-sm outline-none transition-colors"
              style={{ borderColor: '#E5E7EB', backgroundColor: '#F9FAFB', color: '#1F2937' }}
              onFocus={(e) => { e.target.style.borderColor = '#43A047'; }}
              onBlur={(e) => { e.target.style.borderColor = '#E5E7EB'; }}
            />
          </div>

          {/* Data Kesehatan */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#6B7280' }}>
              Data Kesehatan
            </label>
            <textarea
              value={form.dataKesehatan}
              onChange={(e) => updateFormField('dataKesehatan', e.target.value)}
              placeholder="Riwayat penyakit, alergi, dll (jika ada)"
              rows={2}
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors resize-none"
              style={{ borderColor: '#E5E7EB', backgroundColor: '#F9FAFB', color: '#1F2937' }}
              onFocus={(e) => { e.target.style.borderColor = '#43A047'; }}
              onBlur={(e) => { e.target.style.borderColor = '#E5E7EB'; }}
            />
          </div>
        </div>
      </div>

      {/* Upload Dokumen */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center gap-2 mb-4">
          <div
            className="flex items-center justify-center size-8 rounded-lg"
            style={{ backgroundColor: '#E0F2F1' }}
          >
            <Upload className="size-4" style={{ color: '#009688' }} />
          </div>
          <h3 className="text-sm font-semibold" style={{ color: '#1F2937' }}>
            Upload Dokumen
          </h3>
        </div>

        <div className="space-y-3">
          {docs.map((doc) => (
            <div
              key={doc.key}
              className="flex items-center justify-between p-3 rounded-lg border"
              style={{
                borderColor: doc.filename ? '#43A047' : '#E5E7EB',
                backgroundColor: doc.filename ? '#F0FFF4' : '#F9FAFB',
              }}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <FileText
                  className="size-4 shrink-0"
                  style={{ color: doc.filename ? '#43A047' : '#9CA3AF' }}
                />
                <div className="min-w-0">
                  <p className="text-xs font-medium truncate" style={{ color: '#1F2937' }}>
                    {doc.label}
                    {doc.required && <span style={{ color: '#EF4444' }}> *</span>}
                  </p>
                  {doc.filename && (
                    <p className="text-[10px] truncate" style={{ color: '#43A047' }}>
                      {doc.filename}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleDocUpload(doc.key)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 ml-2"
                style={{
                  backgroundColor: doc.filename ? '#FEE2E2' : '#E3F2FD',
                  color: doc.filename ? '#EF4444' : '#1565C0',
                }}
              >
                {doc.filename ? (
                  <>
                    <X className="size-3" /> Hapus
                  </>
                ) : (
                  <>
                    <Upload className="size-3" /> Upload
                  </>
                )}
              </button>
            </div>
          ))}
        </div>

        {errors.documents && (
          <p className="text-xs mt-3 flex items-center gap-1" style={{ color: '#EF4444' }}>
            <AlertCircle className="size-3" /> {errors.documents}
          </p>
        )}
      </div>

      {/* Submit button */}
      <button
        onClick={handleSubmit}
        className="w-full h-14 rounded-xl text-white text-base font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg"
        style={{ backgroundColor: '#43A047' }}
      >
        <CheckCircle className="size-5" />
        Kirim Daftar Ulang
      </button>
    </motion.div>
  );

  // Step: Success
  const renderSuccessStep = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center px-4 py-8"
    >
      <div
        className="w-full max-w-sm rounded-2xl p-6 text-center shadow-lg"
        style={{
          background: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)',
          border: '1px solid #A5D6A7',
        }}
      >
        <div
          className="flex items-center justify-center size-20 rounded-full mx-auto mb-4"
          style={{ backgroundColor: '#43A047' }}
        >
          <CheckCircle className="size-10 text-white" />
        </div>

        <h2 className="text-xl font-bold mb-2" style={{ color: '#2E7D32' }}>
          Daftar Ulang Berhasil!
        </h2>

        <p className="text-sm mb-4" style={{ color: '#388E3C' }}>
          Data daftar ulang Anda telah berhasil dikirim dan akan diverifikasi.
        </p>

        {applicantData && (
          <div
            className="rounded-xl p-4 mb-6"
            style={{ backgroundColor: '#FFFFFF', border: '1px solid #C8E6C9' }}
          >
            <p className="text-xs mb-1" style={{ color: '#6B7280' }}>Nomor Registrasi</p>
            <p className="text-lg font-bold tracking-wider" style={{ color: '#1565C0' }}>
              {applicantData.nomorPendaftaran}
            </p>
            <p className="text-xs mt-2" style={{ color: '#6B7280' }}>Nama Siswa</p>
            <p className="text-sm font-semibold" style={{ color: '#1F2937' }}>
              {applicantData.namaSiswa}
            </p>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={() => {
              alert('Bukti daftar ulang akan diunduh (demo)');
            }}
            className="w-full h-12 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            style={{
              backgroundColor: '#FFFFFF',
              color: '#1565C0',
              border: '2px solid #1565C0',
            }}
          >
            <Download className="size-4" />
            Unduh Bukti Daftar Ulang
          </button>

          <button
            onClick={() => {
              setStep('check');
              setNomorRegistrasi('');
              setApplicantData(null);
              navigateTo('status-daftar');
            }}
            className="w-full h-12 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            style={{ backgroundColor: '#1565C0' }}
          >
            <Search className="size-4" />
            Cek Status Daftar Ulang
          </button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#F3F8FF' }}>
      <SpmbHeader
        title="Daftar Ulang"
        showBack
        onBack={() => {
          if (step === 'form') {
            setStep('check');
          } else {
            navigateTo('beranda');
          }
        }}
      />

      <div className="flex-1 overflow-y-auto px-4 py-4 pb-4">
        {step === 'check' && renderCheckStep()}
        {step === 'form' && renderFormStep()}
        {step === 'success' && renderSuccessStep()}
      </div>

    </div>
  );
}
