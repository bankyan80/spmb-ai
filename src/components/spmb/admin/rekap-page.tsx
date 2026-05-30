'use client';

import React, { useMemo } from 'react';
import { MapPin, School, Download, BarChart3 } from 'lucide-react';
import { useSpmbStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/spmb/shared/status-badge';

export function RekapPage() {
  const store = useSpmbStore();
  const { applicants, schools } = store;

  // Statistics by kecamatan
  const kecamatanStats = useMemo(() => {
    const map: Record<string, { count: number; schools: Record<string, { name: string; count: number }> }> = {};
    applicants.forEach((a) => {
      if (!map[a.kecamatan]) {
        map[a.kecamatan] = { count: 0, schools: {} };
      }
      map[a.kecamatan].count++;
      if (!map[a.kecamatan].schools[a.schoolId]) {
        const school = schools.find((s) => s.schoolId === a.schoolId);
        map[a.kecamatan].schools[a.schoolId] = {
          name: school?.namaSekolah || 'Unknown',
          count: 0,
        };
      }
      map[a.kecamatan].schools[a.schoolId].count++;
    });
    return Object.entries(map)
      .map(([kecamatan, data]) => ({ kecamatan, ...data }))
      .sort((a, b) => b.count - a.count);
  }, [applicants, schools]);

  // Statistics by school
  const schoolStats = useMemo(() => {
    const map: Record<string, { name: string; total: number; statusBreakdown: Record<string, number> }> = {};
    applicants.forEach((a) => {
      if (!map[a.schoolId]) {
        const school = schools.find((s) => s.schoolId === a.schoolId);
        map[a.schoolId] = {
          name: school?.namaSekolah || 'Unknown',
          total: 0,
          statusBreakdown: {},
        };
      }
      map[a.schoolId].total++;
      const status = a.statusPendaftaran;
      map[a.schoolId].statusBreakdown[status] = (map[a.schoolId].statusBreakdown[status] || 0) + 1;
    });
    return Object.entries(map)
      .map(([schoolId, data]) => ({ schoolId, ...data }))
      .sort((a, b) => b.total - a.total);
  }, [applicants, schools]);

  const maxApplicants = Math.max(...schoolStats.map((s) => s.total), 1);

  // Export handler
  const handleExport = async () => {
    try {
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicants,
          schoolName: 'rekap-kecamatan',
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'rekap-spmb-kecamatan.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch {
      console.error('Export failed');
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Export button */}
      <Button
        onClick={handleExport}
        className="w-full md:w-auto py-3 text-white font-semibold rounded-xl"
        style={{ backgroundColor: '#43A047' }}
      >
        <Download className="size-4 mr-2" />
        Unduh Rekap
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Statistics by Kecamatan */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
            <MapPin className="size-4" style={{ color: '#1565C0' }} />
            <h2 className="text-sm font-semibold" style={{ color: '#1F2937' }}>
              Statistik Per Kecamatan
            </h2>
          </div>
          <div className="divide-y divide-gray-50 max-h-96 overflow-y-auto">
            {kecamatanStats.map((item) => (
              <div key={item.kecamatan} className="px-4 py-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold" style={{ color: '#1F2937' }}>
                    Kec. {item.kecamatan}
                  </p>
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: '#E3F2FD', color: '#1565C0' }}
                  >
                    {item.count} pendaftar
                  </span>
                </div>
                <div className="space-y-1 ml-3">
                  {Object.values(item.schools).map((school) => (
                    <div key={school.name} className="flex items-center justify-between text-xs">
                      <span style={{ color: '#6B7280' }}>{school.name}</span>
                      <span className="font-medium" style={{ color: '#1F2937' }}>
                        {school.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Statistics by School */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
            <School className="size-4" style={{ color: '#1565C0' }} />
            <h2 className="text-sm font-semibold" style={{ color: '#1F2937' }}>
              Statistik Per Sekolah
            </h2>
          </div>
          <div className="divide-y divide-gray-50 max-h-96 overflow-y-auto">
            {schoolStats.map((item) => (
              <div key={item.schoolId} className="px-4 py-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold" style={{ color: '#1F2937' }}>
                    {item.name}
                  </p>
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: '#D1FAE5', color: '#065F46' }}
                  >
                    {item.total}
                  </span>
                </div>

                {/* Status breakdown */}
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {Object.entries(item.statusBreakdown).map(([status, count]) => (
                    <div key={status} className="flex items-center gap-1">
                      <StatusBadge status={status} />
                      <span className="text-xs font-medium" style={{ color: '#1F2937' }}>
                        {count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
          <BarChart3 className="size-4" style={{ color: '#1565C0' }} />
          <h2 className="text-sm font-semibold" style={{ color: '#1F2937' }}>
            Grafik Pendaftar Per Sekolah
          </h2>
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          {schoolStats.map((item) => {
            const percentage = (item.total / maxApplicants) * 100;
            return (
              <div key={item.schoolId}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium truncate max-w-[60%]" style={{ color: '#1F2937' }}>
                    {item.name}
                  </span>
                  <span className="text-xs font-bold" style={{ color: '#1565C0' }}>
                    {item.total}
                  </span>
                </div>
                <div className="h-6 rounded-full overflow-hidden" style={{ backgroundColor: '#F3F4F6' }}>
                  <div
                    className="h-full rounded-full transition-all duration-500 flex items-center pl-2"
                    style={{
                      width: `${Math.max(percentage, 8)}%`,
                      background: 'linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)',
                    }}
                  >
                    {percentage > 20 && (
                      <span className="text-xs text-white font-medium">{item.total}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
