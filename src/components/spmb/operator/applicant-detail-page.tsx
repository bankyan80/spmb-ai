'use client';

import React from 'react';
import {
  User,
  MapPin,
  FileText,
  Phone,
  ShieldCheck,
  AlertTriangle,
  Edit,
  FileCheck,
  Calendar,
} from 'lucide-react';
import { useSpmbStore } from '@/lib/store';
import { StatusBadge } from '@/components/spmb/shared/status-badge';
import { Button } from '@/components/ui/button';
import { canVerifyApplicant, getJalurLabel, formatDate } from '@/lib/business-logic';

export function ApplicantDetailPage() {
  const store = useSpmbStore();
  const { selectedApplicant, currentUser, navigateTo, setSelectedApplicant, updateApplicant } = store;

  if (!selectedApplicant) {
    return (
      <div className="p-4 md:p-6 flex items-center justify-center min-h-[50vh]">
        <p className="text-sm" style={{ color: '#6B7280' }}>
          Tidak ada data pendaftar dipilih
        </p>
      </div>
    );
  }

  const a = selectedApplicant;
  const canVerify = currentUser
    ? canVerifyApplicant(currentUser.role, currentUser.schoolId, a.schoolId)
    : false;
  const isOperatorOnly = currentUser?.role === 'operator';
  const isReadOnly = isOperatorOnly && !canVerify;

  // Mock documents
  const mockDocuments = [
    { jenis: 'Kartu Keluarga (KK)', status: 'terverifikasi', catatan: '' },
    { jenis: 'Akta Kelahiran', status: 'terverifikasi', catatan: '' },
    { jenis: 'KTP Orang Tua/Wali', status: 'terverifikasi', catatan: '' },
    { jenis: 'Dokumen Pendukung', status: a.statusBerkas === 'perlu_perbaikan' ? 'perlu_perbaikan' : 'terverifikasi', catatan: a.statusBerkas === 'perlu_perbaikan' ? 'Akta kelahiran tidak jelas' : '' },
  ];

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Data Siswa card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
          <User className="size-4" style={{ color: '#1565C0' }} />
          <h2 className="text-sm font-semibold" style={{ color: '#1F2937' }}>
            Data Siswa
          </h2>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <InfoRow label="NIK" value={a.nik} />
            <InfoRow label="NISN" value={a.nisn || '-'} />
            <InfoRow label="Nama Lengkap" value={a.namaSiswa} />
            <InfoRow label="Tempat, Tanggal Lahir" value={`${a.tempatLahir}, ${formatDate(a.tanggalLahir)}`} />
            <InfoRow label="Jenis Kelamin" value={a.jenisKelamin} />
            <InfoRow label="Agama" value={a.agama} />
          </div>
        </div>
      </div>

      {/* Data Orang Tua card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
          <Phone className="size-4" style={{ color: '#1565C0' }} />
          <h2 className="text-sm font-semibold" style={{ color: '#1F2937' }}>
            Data Orang Tua
          </h2>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <InfoRow label="Nama Ayah" value={a.namaAyah} />
            <InfoRow label="NIK Ayah" value={a.nikAyah} />
            <InfoRow label="Pekerjaan Ayah" value={a.pekerjaanAyah} />
            <InfoRow label="Nama Ibu" value={a.namaIbu} />
            <InfoRow label="NIK Ibu" value={a.nikIbu} />
            <InfoRow label="Pekerjaan Ibu" value={a.pekerjaanIbu} />
            <InfoRow label="No HP Orang Tua" value={a.noHpOrtu} />
          </div>
        </div>
      </div>

      {/* Data Alamat card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
          <MapPin className="size-4" style={{ color: '#1565C0' }} />
          <h2 className="text-sm font-semibold" style={{ color: '#1F2937' }}>
            Data Alamat
          </h2>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <InfoRow label="Alamat" value={a.alamat} />
            <InfoRow label="Desa" value={a.desa} />
            <InfoRow label="Kecamatan" value={a.kecamatan} />
          </div>
        </div>
      </div>

      {/* Data Pendaftaran card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
          <Calendar className="size-4" style={{ color: '#1565C0' }} />
          <h2 className="text-sm font-semibold" style={{ color: '#1F2937' }}>
            Data Pendaftaran
          </h2>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <InfoRow label="Sekolah Tujuan" value={a.namaSekolah} />
            <InfoRow label="Jalur Pendaftaran" value={getJalurLabel(a.jalur)} />
            <InfoRow label="Nomor Pendaftaran" value={a.nomorPendaftaran} />
            <InfoRow label="Tanggal Daftar" value={formatDate(a.createdAt)} />
          </div>
        </div>
      </div>

      {/* Status card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
          <FileCheck className="size-4" style={{ color: '#1565C0' }} />
          <h2 className="text-sm font-semibold" style={{ color: '#1F2937' }}>
            Status
          </h2>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs" style={{ color: '#6B7280' }}>Status Berkas</span>
            <StatusBadge status={a.statusBerkas} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs" style={{ color: '#6B7280' }}>Status Pendaftaran</span>
            <StatusBadge status={a.statusPendaftaran} />
          </div>
          {a.catatanOperator && (
            <div className="mt-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
              <p className="text-xs font-medium" style={{ color: '#92400E' }}>Catatan Operator:</p>
              <p className="text-xs mt-1" style={{ color: '#78350F' }}>{a.catatanOperator}</p>
            </div>
          )}
        </div>
      </div>

      {/* Documents section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
          <FileText className="size-4" style={{ color: '#1565C0' }} />
          <h2 className="text-sm font-semibold" style={{ color: '#1F2937' }}>
            Dokumen
          </h2>
        </div>
        <div className="divide-y divide-gray-50">
          {mockDocuments.map((doc, idx) => (
            <div key={idx} className="flex items-center justify-between px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm truncate" style={{ color: '#1F2937' }}>{doc.jenis}</p>
                {doc.catatan && (
                  <p className="text-xs mt-0.5" style={{ color: '#DC2626' }}>{doc.catatan}</p>
                )}
              </div>
              <StatusBadge status={doc.status} />
            </div>
          ))}
        </div>
      </div>

      {/* Read-only notice */}
      {isReadOnly && (
        <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-center">
          <p className="text-xs" style={{ color: '#1565C0' }}>
            Anda hanya dapat melihat data pendaftar dari sekolah lain
          </p>
        </div>
      )}

      {/* Action buttons */}
      {canVerify && !isReadOnly && (
        <div className="flex flex-col md:flex-row gap-2">
          <Button
            className="flex-1 text-white font-semibold"
            style={{ backgroundColor: '#43A047' }}
            onClick={() => navigateTo('verification')}
          >
            <ShieldCheck className="size-4 mr-1" />
            Verifikasi
          </Button>
          <Button
            variant="outline"
            className="flex-1 font-semibold"
            style={{ color: '#F59E0B', borderColor: '#F59E0B' }}
            onClick={() => navigateTo('verification')}
          >
            <AlertTriangle className="size-4 mr-1" />
            Perlu Perbaikan
          </Button>
          <Button
            variant="outline"
            className="flex-1 font-semibold"
            style={{ color: '#1565C0', borderColor: '#1565C0' }}
            onClick={() => {
              const newStatus = prompt(
                'Ubah Status Pendaftaran:',
                a.statusPendaftaran
              );
              if (newStatus && newStatus !== a.statusPendaftaran) {
                updateApplicant(a.applicantId, {
                  statusPendaftaran: newStatus as any,
                });
                setSelectedApplicant({ ...a, statusPendaftaran: newStatus as any });
              }
            }}
          >
            <Edit className="size-4 mr-1" />
            Ubah Status
          </Button>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <span className="text-xs shrink-0 w-32" style={{ color: '#6B7280' }}>
        {label}
      </span>
      <span className="text-xs font-medium flex-1" style={{ color: '#1F2937' }}>
        {value}
      </span>
    </div>
  );
}
