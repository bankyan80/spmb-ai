'use client';

import React, { useState, useEffect } from 'react';
import { UserCog, Plus, Pencil, Save } from 'lucide-react';
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
import type { User } from '@/lib/types';

export function OperatorAccountPage() {
  const store = useSpmbStore();
  const { schools, users, addUser } = store;

  const [operators, setOperators] = useState<User[]>(
    () => users.filter((u) => u.role === 'operator')
  );

  useEffect(() => {
    if (users.length) {
      setOperators(users.filter((u) => u.role === 'operator'));
    }
  }, [users]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formNama, setFormNama] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formSchoolId, setFormSchoolId] = useState('');
  const [formStatusAktif, setFormStatusAktif] = useState(true);
  const [saving, setSaving] = useState(false);

  const openAddDialog = () => {
    setEditingId(null);
    setFormNama('');
    setFormEmail('');
    setFormPassword('');
    setFormSchoolId('');
    setFormStatusAktif(true);
    setDialogOpen(true);
  };

  const openEditDialog = (operator: User) => {
    setEditingId(operator.uid);
    setFormNama(operator.nama);
    setFormEmail(operator.email);
    setFormPassword('');
    setFormSchoolId(operator.schoolId);
    setFormStatusAktif(operator.statusAktif);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formNama.trim() || !formEmail.trim()) return;

    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 400));

    if (editingId) {
      setOperators(
        operators.map((op) =>
          op.uid === editingId
            ? {
                ...op,
                nama: formNama,
                email: formEmail,
                schoolId: formSchoolId,
                statusAktif: formStatusAktif,
              }
            : op
        )
      );
    } else {
      const newOperator: User = {
        uid: `usr-${Date.now()}`,
        nama: formNama,
        email: formEmail,
        role: 'operator',
        schoolId: formSchoolId,
        statusAktif: formStatusAktif,
        createdAt: new Date().toISOString(),
      };
      setOperators([...operators, newOperator]);
      addUser(newOperator);
    }

    setSaving(false);
    setDialogOpen(false);
  };

  const getSchoolName = (schoolId: string) => {
    const school = schools.find((s) => s.schoolId === schoolId);
    return school?.namaSekolah || '-';
  };

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Add button */}
      <Button
        onClick={openAddDialog}
        className="w-full md:w-auto py-3 text-white font-semibold rounded-xl"
        style={{ backgroundColor: '#1565C0' }}
      >
        <Plus className="size-4 mr-2" />
        Tambah Operator
      </Button>

      {/* Operators list - grid on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {operators.map((operator) => (
          <div
            key={operator.uid}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
          >
            <div className="flex items-start gap-3">
              <div
                className="flex items-center justify-center size-10 rounded-xl shrink-0"
                style={{ backgroundColor: '#E3F2FD' }}
              >
                <UserCog className="size-5" style={{ color: '#0D47A1' }} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold truncate" style={{ color: '#1F2937' }}>
                  {operator.nama}
                </p>
                <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>
                  {operator.email}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs" style={{ color: '#9CA3AF' }}>
                    {getSchoolName(operator.schoolId)}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <StatusBadge status={operator.statusAktif ? 'lengkap' : 'tidak_diterima'} />
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 size-8"
                onClick={() => openEditDialog(operator)}
              >
                <Pencil className="size-3.5" style={{ color: '#6B7280' }} />
              </Button>
            </div>
          </div>
        ))}

        {operators.length === 0 && (
          <div className="text-center py-12 col-span-full">
            <UserCog className="size-12 mx-auto mb-3" style={{ color: '#D1D5DB' }} />
            <p className="text-sm font-medium" style={{ color: '#6B7280' }}>
              Belum ada akun operator
            </p>
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Edit Operator' : 'Tambah Operator'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: '#6B7280' }}>
                Nama
              </label>
              <Input
                value={formNama}
                onChange={(e) => setFormNama(e.target.value)}
                placeholder="Nama operator"
                className="border-gray-200"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: '#6B7280' }}>
                Email
              </label>
              <Input
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder="Email operator"
                className="border-gray-200"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: '#6B7280' }}>
                Password{editingId ? ' (kosongkan jika tidak diubah)' : ''}
              </label>
              <Input
                type="password"
                value={formPassword}
                onChange={(e) => setFormPassword(e.target.value)}
                placeholder={editingId ? 'Kosongkan jika tidak diubah' : 'Password'}
                className="border-gray-200"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: '#6B7280' }}>
                Sekolah
              </label>
              <select
                value={formSchoolId}
                onChange={(e) => setFormSchoolId(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
              >
                <option value="">Pilih Sekolah</option>
                {schools.map((s) => (
                  <option key={s.schoolId} value={s.schoolId}>
                    {s.namaSekolah}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formStatusAktif}
                  onChange={(e) => setFormStatusAktif(e.target.checked)}
                  className="accent-teal-600"
                />
                <span className="text-sm" style={{ color: '#1F2937' }}>Status Aktif</span>
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Batal
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !formNama.trim() || !formEmail.trim()}
              className="text-white"
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
                  Simpan
                </div>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
