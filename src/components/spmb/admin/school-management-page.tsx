'use client';

import React, { useState } from 'react';
import { School as SchoolIcon, Plus, Pencil, MapPin, Users } from 'lucide-react';
import { useSpmbStore } from '@/lib/store';
import { StatusBadge } from '@/components/spmb/shared/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

export function SchoolManagementPage() {
  const store = useSpmbStore();
  const { schools, updateSchool, addSchool } = store;

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState(schools[0] || null);
  const [newSchool, setNewSchool] = useState({
    namaSekolah: '',
    npsn: '',
    jenjang: 'SD',
    alamat: '',
    desa: '',
    kecamatan: '',
    latitude: -6.35,
    longitude: 106.9,
    kuota: 0,
    sisaKuota: 0,
    statusAktif: true,
  });

  const handleEdit = (school: typeof schools[0]) => {
    setEditingSchool({ ...school });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (editingSchool) {
      updateSchool(editingSchool.schoolId, editingSchool);
      setEditDialogOpen(false);
    }
  };

  const handleAdd = () => {
    const id = `sch-${String(schools.length + 1).padStart(3, '0')}`;
    addSchool({
      schoolId: id,
      ...newSchool,
    });
    setAddDialogOpen(false);
    setNewSchool({
      namaSekolah: '',
      npsn: '',
      jenjang: 'SD',
      alamat: '',
      desa: '',
      kecamatan: '',
      latitude: -6.35,
      longitude: 106.9,
      kuota: 0,
      sisaKuota: 0,
      statusAktif: true,
    });
  };

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Add school button */}
      <Button
        onClick={() => setAddDialogOpen(true)}
        className="w-full md:w-auto py-3 text-white font-semibold rounded-xl"
        style={{ backgroundColor: '#1565C0' }}
      >
        <Plus className="size-4 mr-2" />
        Tambah Sekolah
      </Button>

      {/* Schools list - grid on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {schools.map((school) => (
          <div
            key={school.schoolId}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
          >
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <div
                    className="flex items-center justify-center size-8 rounded-lg shrink-0"
                    style={{ backgroundColor: '#E3F2FD' }}
                  >
                    <SchoolIcon className="size-4" style={{ color: '#1565C0' }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: '#1F2937' }}>
                      {school.namaSekolah}
                    </p>
                    <p className="text-xs" style={{ color: '#9CA3AF' }}>
                      NPSN: {school.npsn}
                    </p>
                  </div>
                </div>
              </div>
              <StatusBadge status={school.statusAktif ? 'lengkap' : 'belum_lengkap'} />
            </div>

            <div className="space-y-1.5 mb-3">
              <div className="flex items-center gap-1.5 text-xs" style={{ color: '#6B7280' }}>
                <MapPin className="size-3" />
                <span className="truncate">{school.alamat}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs" style={{ color: '#6B7280' }}>
                <span className="ml-[18px]">{school.desa}, {school.kecamatan}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 mb-3">
              <div className="flex items-center gap-1.5">
                <Users className="size-3.5" style={{ color: '#1565C0' }} />
                <span className="text-xs font-medium" style={{ color: '#1F2937' }}>
                  Kuota: {school.kuota}
                </span>
              </div>
              <span className="text-xs font-medium" style={{ color: school.sisaKuota > 0 ? '#43A047' : '#EF4444' }}>
                Sisa: {school.sisaKuota}
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={() => handleEdit(school)}
            >
              <Pencil className="size-3 mr-1" />
              Edit Sekolah
            </Button>
          </div>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Sekolah</DialogTitle>
          </DialogHeader>
          {editingSchool && (
            <div className="space-y-3">
              <FieldInput
                label="Nama Sekolah"
                value={editingSchool.namaSekolah}
                onChange={(v) => setEditingSchool({ ...editingSchool, namaSekolah: v })}
              />
              <FieldInput
                label="NPSN"
                value={editingSchool.npsn}
                onChange={(v) => setEditingSchool({ ...editingSchool, npsn: v })}
              />
              <FieldInput
                label="Jenjang"
                value={editingSchool.jenjang}
                onChange={(v) => setEditingSchool({ ...editingSchool, jenjang: v })}
              />
              <FieldInput
                label="Alamat"
                value={editingSchool.alamat}
                onChange={(v) => setEditingSchool({ ...editingSchool, alamat: v })}
              />
              <FieldInput
                label="Desa"
                value={editingSchool.desa}
                onChange={(v) => setEditingSchool({ ...editingSchool, desa: v })}
              />
              <FieldInput
                label="Kecamatan"
                value={editingSchool.kecamatan}
                onChange={(v) => setEditingSchool({ ...editingSchool, kecamatan: v })}
              />
              <div className="grid grid-cols-2 gap-3">
                <FieldInput
                  label="Kuota"
                  type="number"
                  value={String(editingSchool.kuota)}
                  onChange={(v) => setEditingSchool({ ...editingSchool, kuota: parseInt(v) || 0 })}
                />
                <FieldInput
                  label="Sisa Kuota"
                  type="number"
                  value={String(editingSchool.sisaKuota)}
                  onChange={(v) => setEditingSchool({ ...editingSchool, sisaKuota: parseInt(v) || 0 })}
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingSchool.statusAktif}
                    onChange={(e) => setEditingSchool({ ...editingSchool, statusAktif: e.target.checked })}
                    className="accent-teal-600"
                  />
                  <span className="text-sm" style={{ color: '#1F2937' }}>Status Aktif</span>
                </label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleSaveEdit} className="text-white" style={{ backgroundColor: '#1565C0' }}>
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tambah Sekolah</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <FieldInput
              label="Nama Sekolah"
              value={newSchool.namaSekolah}
              onChange={(v) => setNewSchool({ ...newSchool, namaSekolah: v })}
            />
            <FieldInput
              label="NPSN"
              value={newSchool.npsn}
              onChange={(v) => setNewSchool({ ...newSchool, npsn: v })}
            />
            <FieldInput
              label="Alamat"
              value={newSchool.alamat}
              onChange={(v) => setNewSchool({ ...newSchool, alamat: v })}
            />
            <FieldInput
              label="Desa"
              value={newSchool.desa}
              onChange={(v) => setNewSchool({ ...newSchool, desa: v })}
            />
            <FieldInput
              label="Kecamatan"
              value={newSchool.kecamatan}
              onChange={(v) => setNewSchool({ ...newSchool, kecamatan: v })}
            />
            <div className="grid grid-cols-2 gap-3">
              <FieldInput
                label="Kuota"
                type="number"
                value={String(newSchool.kuota)}
                onChange={(v) => setNewSchool({ ...newSchool, kuota: parseInt(v) || 0 })}
              />
              <FieldInput
                label="Sisa Kuota"
                type="number"
                value={String(newSchool.sisaKuota)}
                onChange={(v) => setNewSchool({ ...newSchool, sisaKuota: parseInt(v) || 0 })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleAdd} className="text-white" style={{ backgroundColor: '#1565C0' }}>
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FieldInput({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1" style={{ color: '#6B7280' }}>
        {label}
      </label>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border-gray-200"
      />
    </div>
  );
}
