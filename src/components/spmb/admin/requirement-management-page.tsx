'use client';

import React, { useState } from 'react';
import { Route, FileText, Plus, Pencil, Trash2, Save } from 'lucide-react';
import { useSpmbStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { jalurPendaftaran, syaratDokumen } from '@/lib/mock-data';

export function RequirementManagementPage() {
  const store = useSpmbStore();

  const [jalurList, setJalurList] = useState(
    jalurPendaftaran.map((j) => ({ ...j }))
  );
  const [syaratList, setSyaratList] = useState([...syaratDokumen]);
  const [newSyarat, setNewSyarat] = useState('');
  const [editingJalur, setEditingJalur] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const handleSaveJalur = () => {
    setEditingJalur(null);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleAddSyarat = () => {
    if (newSyarat.trim()) {
      setSyaratList([...syaratList, newSyarat.trim()]);
      setNewSyarat('');
    }
  };

  const handleRemoveSyarat = (index: number) => {
    setSyaratList(syaratList.filter((_, i) => i !== index));
  };

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Jalur Pendaftaran section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
          <Route className="size-4" style={{ color: '#1565C0' }} />
          <h2 className="text-sm font-semibold" style={{ color: '#1F2937' }}>
            Jalur Pendaftaran
          </h2>
        </div>
        <div className="divide-y divide-gray-50">
          {jalurList.map((jalur, idx) => (
            <div key={jalur.id} className="p-4">
              {editingJalur === jalur.id ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: '#6B7280' }}>
                      Nama Jalur
                    </label>
                    <Input
                      value={jalur.nama}
                      onChange={(e) => {
                        const updated = [...jalurList];
                        updated[idx] = { ...updated[idx], nama: e.target.value };
                        setJalurList(updated);
                      }}
                      className="border-gray-200"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium mb-1" style={{ color: '#6B7280' }}>
                        Kuota (%)
                      </label>
                      <Input
                        type="number"
                        value={String(jalur.kuota)}
                        onChange={(e) => {
                          const updated = [...jalurList];
                          updated[idx] = { ...updated[idx], kuota: parseInt(e.target.value) || 0 };
                          setJalurList(updated);
                        }}
                        className="border-gray-200"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: '#6B7280' }}>
                      Deskripsi
                    </label>
                    <Textarea
                      value={jalur.deskripsi}
                      onChange={(e) => {
                        const updated = [...jalurList];
                        updated[idx] = { ...updated[idx], deskripsi: e.target.value };
                        setJalurList(updated);
                      }}
                      className="border-gray-200 min-h-[60px] resize-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleSaveJalur}
                      className="text-white"
                      style={{ backgroundColor: '#43A047' }}
                    >
                      <Save className="size-3 mr-1" />
                      Simpan
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingJalur(null)}
                    >
                      Batal
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold" style={{ color: '#1F2937' }}>
                        {jalur.nama}
                      </p>
                      <span
                        className="text-xs font-medium px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: '#E3F2FD', color: '#1565C0' }}
                      >
                        Kuota: {jalur.kuota}%
                      </span>
                    </div>
                    <p className="text-xs mt-1" style={{ color: '#6B7280' }}>
                      {jalur.deskripsi}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 size-8"
                    onClick={() => setEditingJalur(jalur.id)}
                  >
                    <Pencil className="size-3.5" style={{ color: '#6B7280' }} />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Syarat Dokumen section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
          <FileText className="size-4" style={{ color: '#1565C0' }} />
          <h2 className="text-sm font-semibold" style={{ color: '#1F2937' }}>
            Syarat Dokumen
          </h2>
        </div>
        <div className="p-4 space-y-3">
          {/* Add new syarat */}
          <div className="flex gap-2">
            <Input
              placeholder="Tambah syarat dokumen baru..."
              value={newSyarat}
              onChange={(e) => setNewSyarat(e.target.value)}
              className="border-gray-200"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddSyarat();
              }}
            />
            <Button
              onClick={handleAddSyarat}
              disabled={!newSyarat.trim()}
              className="shrink-0 text-white"
              style={{ backgroundColor: '#1565C0' }}
            >
              <Plus className="size-4" />
            </Button>
          </div>

          {/* Syarat list */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {syaratList.map((syarat, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 p-2.5 rounded-lg bg-gray-50 border border-gray-100"
              >
                <span className="text-xs font-medium flex-1" style={{ color: '#1F2937' }}>
                  {idx + 1}. {syarat}
                </span>
                <button
                  onClick={() => handleRemoveSyarat(idx)}
                  className="shrink-0 size-6 flex items-center justify-center rounded hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="size-3" style={{ color: '#EF4444' }} />
                </button>
              </div>
            ))}
          </div>

          {syaratList.length === 0 && (
            <p className="text-xs text-center py-4" style={{ color: '#9CA3AF' }}>
              Belum ada syarat dokumen
            </p>
          )}
        </div>
      </div>

      {/* Save indicator */}
      {saved && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-center">
          <p className="text-xs font-medium" style={{ color: '#059669' }}>
            ✓ Perubahan tersimpan
          </p>
        </div>
      )}
    </div>
  );
}
