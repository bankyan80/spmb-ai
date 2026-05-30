'use client';

import React, { useState } from 'react';
import { ShieldCheck, Save, CheckCircle } from 'lucide-react';
import { useSpmbStore } from '@/lib/store';
import { StatusBadge } from '@/components/spmb/shared/status-badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { getJalurLabel } from '@/lib/business-logic';

export function VerificationPage() {
  const store = useSpmbStore();
  const { selectedApplicant, verifyApplicant, navigateTo, setSelectedApplicant, updateApplicant } = store;

  const [statusBerkas, setStatusBerkas] = useState<string>(
    selectedApplicant?.statusBerkas || 'lengkap'
  );
  const [statusPendaftaran, setStatusPendaftaran] = useState<string>(
    selectedApplicant?.statusPendaftaran || 'terverifikasi'
  );
  const [catatan, setCatatan] = useState<string>(
    selectedApplicant?.catatanOperator || ''
  );
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

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

  const handleSave = async () => {
    setSaving(true);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Update both status berkas and status pendaftaran
    updateApplicant(a.applicantId, {
      statusBerkas: statusBerkas as any,
      statusPendaftaran: statusPendaftaran as any,
      catatanOperator: catatan,
    });

    verifyApplicant(a.applicantId, statusPendaftaran, catatan);

    setSelectedApplicant({
      ...a,
      statusBerkas: statusBerkas as any,
      statusPendaftaran: statusPendaftaran as any,
      catatanOperator: catatan,
    });

    setSaving(false);
    setShowSuccess(true);

    setTimeout(() => {
      navigateTo('operator-applicants');
    }, 1500);
  };

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 max-w-3xl">
      {/* Applicant summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-start gap-3">
          <div
            className="flex items-center justify-center size-10 rounded-xl shrink-0"
            style={{ backgroundColor: '#E3F2FD' }}
          >
            <ShieldCheck className="size-5" style={{ color: '#1565C0' }} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold truncate" style={{ color: '#1F2937' }}>
              {a.namaSiswa}
            </p>
            <p className="text-xs" style={{ color: '#6B7280' }}>
              {a.namaSekolah}
            </p>
            <p className="text-xs" style={{ color: '#9CA3AF' }}>
              {a.nomorPendaftaran} • {getJalurLabel(a.jalur)}
            </p>
          </div>
        </div>
      </div>

      {/* Current status display */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="text-sm font-semibold mb-3" style={{ color: '#1F2937' }}>
          Status Saat Ini
        </h3>
        <div className="flex items-center gap-4">
          <div>
            <p className="text-xs" style={{ color: '#6B7280' }}>Status Berkas</p>
            <StatusBadge status={a.statusBerkas} />
          </div>
          <div>
            <p className="text-xs" style={{ color: '#6B7280' }}>Status Pendaftaran</p>
            <StatusBadge status={a.statusPendaftaran} />
          </div>
        </div>
      </div>

      {/* Verification form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-4">
        <h3 className="text-sm font-semibold" style={{ color: '#1F2937' }}>
          Form Verifikasi
        </h3>

        {/* Status Berkas */}
        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: '#6B7280' }}>
            Status Berkas
          </label>
          <div className="space-y-2">
            {[
              { value: 'lengkap', label: 'Lengkap' },
              { value: 'belum_lengkap', label: 'Belum Lengkap' },
              { value: 'perlu_perbaikan', label: 'Perlu Perbaikan' },
            ].map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="radio"
                  name="statusBerkas"
                  value={option.value}
                  checked={statusBerkas === option.value}
                  onChange={(e) => setStatusBerkas(e.target.value)}
                  className="accent-teal-600"
                />
                <span className="text-sm" style={{ color: '#1F2937' }}>
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Status Pendaftaran */}
        <div>
          <label
            htmlFor="statusPendaftaran"
            className="block text-xs font-medium mb-2"
            style={{ color: '#6B7280' }}
          >
            Status Pendaftaran
          </label>
          <select
            id="statusPendaftaran"
            value={statusPendaftaran}
            onChange={(e) => setStatusPendaftaran(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
          >
            <option value="terverifikasi">Terverifikasi</option>
            <option value="perlu_perbaikan">Perlu Perbaikan</option>
            <option value="diterima">Diterima</option>
            <option value="cadangan">Cadangan</option>
            <option value="tidak_diterima">Tidak Diterima</option>
          </select>
        </div>

        {/* Catatan Operator */}
        <div>
          <label
            htmlFor="catatan"
            className="block text-xs font-medium mb-2"
            style={{ color: '#6B7280' }}
          >
            Catatan Operator
          </label>
          <Textarea
            id="catatan"
            placeholder="Tulis catatan verifikasi..."
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            className="bg-white border-gray-200 min-h-[100px] resize-none"
          />
        </div>
      </div>

      {/* Success message */}
      {showSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle className="size-5 shrink-0" style={{ color: '#059669' }} />
          <div>
            <p className="text-sm font-semibold" style={{ color: '#065F46' }}>
              Verifikasi Berhasil Disimpan!
            </p>
            <p className="text-xs" style={{ color: '#047857' }}>
              Mengalihkan ke halaman data pendaftar...
            </p>
          </div>
        </div>
      )}

      {/* Save button */}
      <Button
        onClick={handleSave}
        disabled={saving || showSuccess}
        className="w-full py-3 text-white font-semibold rounded-xl shadow-lg"
        style={{ backgroundColor: '#43A047' }}
      >
        {saving ? (
          <div className="flex items-center gap-2">
            <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Menyimpan...
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Save className="size-4" />
            Simpan Verifikasi
          </div>
        )}
      </Button>
    </div>
  );
}
