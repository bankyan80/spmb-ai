'use client';

import React, { useState } from 'react';
import { PieChart, Save } from 'lucide-react';
import { useSpmbStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function QuotaManagementPage() {
  const store = useSpmbStore();
  const { settings, schools, updateSettings, updateSchool } = store;

  const [kuotaDomisili, setKuotaDomisili] = useState(String(settings.kuotaDomisili));
  const [kuotaAfirmasi, setKuotaAfirmasi] = useState(String(settings.kuotaAfirmasi));
  const [kuotaMutasi, setKuotaMutasi] = useState(String(settings.kuotaMutasi));
  const [schoolQuotas, setSchoolQuotas] = useState<Record<string, string>>(
    Object.fromEntries(schools.map((s) => [s.schoolId, String(s.kuota)]))
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    updateSettings({
      kuotaDomisili: parseInt(kuotaDomisili) || 0,
      kuotaAfirmasi: parseInt(kuotaAfirmasi) || 0,
      kuotaMutasi: parseInt(kuotaMutasi) || 0,
    });

    // Update each school quota
    schools.forEach((s) => {
      const newKuota = parseInt(schoolQuotas[s.schoolId]) || 0;
      if (newKuota !== s.kuota) {
        const diff = newKuota - s.kuota;
        updateSchool(s.schoolId, {
          kuota: newKuota,
          sisaKuota: Math.max(0, s.sisaKuota + diff),
        });
      }
    });

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 max-w-4xl">
      {/* General quota settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
          <PieChart className="size-4" style={{ color: '#1565C0' }} />
          <h2 className="text-sm font-semibold" style={{ color: '#1F2937' }}>
            Kuota Per Jalur Pendaftaran
          </h2>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: '#6B7280' }}>
                Kuota Domisili (%)
              </label>
              <Input
                type="number"
                value={kuotaDomisili}
                onChange={(e) => setKuotaDomisili(e.target.value)}
                className="border-gray-200"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: '#6B7280' }}>
                Kuota Afirmasi (%)
              </label>
              <Input
                type="number"
                value={kuotaAfirmasi}
                onChange={(e) => setKuotaAfirmasi(e.target.value)}
                className="border-gray-200"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: '#6B7280' }}>
                Kuota Mutasi (%)
              </label>
              <Input
                type="number"
                value={kuotaMutasi}
                onChange={(e) => setKuotaMutasi(e.target.value)}
                className="border-gray-200"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Per-school quota table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="text-sm font-semibold" style={{ color: '#1F2937' }}>
            Kuota Per Sekolah
          </h2>
        </div>
        <div className="divide-y divide-gray-50">
          {schools.map((school) => (
            <div key={school.schoolId} className="px-4 py-3">
              <div className="flex items-center justify-between gap-2 mb-2">
                <p className="text-sm font-medium truncate flex-1" style={{ color: '#1F2937' }}>
                  {school.namaSekolah}
                </p>
                <span
                  className="text-xs font-medium px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: school.sisaKuota > 0 ? '#D1FAE5' : '#FEE2E2',
                    color: school.sisaKuota > 0 ? '#065F46' : '#991B1B',
                  }}
                >
                  Sisa: {school.sisaKuota}
                </span>
              </div>
              <div className="w-32">
                <label className="block text-xs mb-1" style={{ color: '#6B7280' }}>
                  Total Kuota
                </label>
                <Input
                  type="number"
                  value={schoolQuotas[school.schoolId] || '0'}
                  onChange={(e) =>
                    setSchoolQuotas({
                      ...schoolQuotas,
                      [school.schoolId]: e.target.value,
                    })
                  }
                  className="border-gray-200 h-8 text-sm"
                />
              </div>
            </div>
          ))}
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
          <div className="flex items-center gap-2">
            ✓ Tersimpan
          </div>
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
