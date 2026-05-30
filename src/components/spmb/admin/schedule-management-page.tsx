'use client';

import React, { useState } from 'react';
import { Calendar, Save } from 'lucide-react';
import { useSpmbStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function ScheduleManagementPage() {
  const store = useSpmbStore();
  const { settings, updateSettings } = store;

  const [tahunAjaran, setTahunAjaran] = useState(settings.tahunAjaran);
  const [tanggalAcuanUsia, setTanggalAcuanUsia] = useState(settings.tanggalAcuanUsia);
  const [usiaMinimalSD, setUsiaMinimalSD] = useState(String(settings.usiaMinimalSD));
  const [usiaPrioritasSD, setUsiaPrioritasSD] = useState(String(settings.usiaPrioritasSD));
  const [statusPendaftaran, setStatusPendaftaran] = useState(settings.statusPendaftaran);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    updateSettings({
      tahunAjaran,
      tanggalAcuanUsia,
      usiaMinimalSD: parseInt(usiaMinimalSD) || 6,
      usiaPrioritasSD: parseInt(usiaPrioritasSD) || 7,
      statusPendaftaran,
    });

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 max-w-3xl">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
          <Calendar className="size-4" style={{ color: '#1565C0' }} />
          <h2 className="text-sm font-semibold" style={{ color: '#1F2937' }}>
            Pengaturan Jadwal SPMB
          </h2>
        </div>
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: '#6B7280' }}>
                Tahun Ajaran
              </label>
              <Input
                type="text"
                value={tahunAjaran}
                onChange={(e) => setTahunAjaran(e.target.value)}
                placeholder="Contoh: 2026/2027"
                className="border-gray-200"
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: '#6B7280' }}>
                Tanggal Acuan Usia
              </label>
              <Input
                type="date"
                value={tanggalAcuanUsia}
                onChange={(e) => setTanggalAcuanUsia(e.target.value)}
                className="border-gray-200"
              />
              <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>
                Tanggal yang dijadikan acuan untuk menghitung usia siswa
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: '#6B7280' }}>
                Usia Minimal SD (tahun)
              </label>
              <Input
                type="number"
                value={usiaMinimalSD}
                onChange={(e) => setUsiaMinimalSD(e.target.value)}
                className="border-gray-200"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: '#6B7280' }}>
                Usia Prioritas SD (tahun)
              </label>
              <Input
                type="number"
                value={usiaPrioritasSD}
                onChange={(e) => setUsiaPrioritasSD(e.target.value)}
                className="border-gray-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#6B7280' }}>
              Status Pendaftaran
            </label>
            <select
              value={statusPendaftaran}
              onChange={(e) => setStatusPendaftaran(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
            >
              <option value="dibuka">Dibuka</option>
              <option value="ditutup">Ditutup</option>
            </select>
          </div>

          {/* Current status indicator */}
          <div
            className="p-3 rounded-lg flex items-center gap-2"
            style={{
              backgroundColor: statusPendaftaran === 'dibuka' ? '#D1FAE5' : '#FEE2E2',
            }}
          >
            <div
              className="size-3 rounded-full"
              style={{
                backgroundColor: statusPendaftaran === 'dibuka' ? '#059669' : '#DC2626',
              }}
            />
            <span
              className="text-sm font-medium"
              style={{
                color: statusPendaftaran === 'dibuka' ? '#065F46' : '#991B1B',
              }}
            >
              Pendaftaran {statusPendaftaran === 'dibuka' ? 'Dibuka' : 'Ditutup'}
            </span>
          </div>
        </div>
      </div>

      {/* Save button */}
      <Button
        onClick={handleSave}
        disabled={saving}
        className="w-full py-3 text-white font-semibold rounded-xl shadow-lg"
        style={{ backgroundColor: '#43A047' }}
      >
        {saving ? (
          <div className="flex items-center gap-2">
            <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Menyimpan...
          </div>
        ) : saved ? (
          <div className="flex items-center gap-2">✓ Tersimpan</div>
        ) : (
          <div className="flex items-center gap-2">
            <Save className="size-4" />
            Simpan
          </div>
        )}
      </Button>
    </div>
  );
}
