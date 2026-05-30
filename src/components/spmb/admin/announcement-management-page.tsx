'use client';

import React, { useState } from 'react';
import { Megaphone, Plus, Pencil, Save } from 'lucide-react';
import { useSpmbStore } from '@/lib/store';
import { StatusBadge } from '@/components/spmb/shared/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { formatDate } from '@/lib/business-logic';
import type { Announcement } from '@/lib/types';

export function AnnouncementManagementPage() {
  const store = useSpmbStore();
  const { announcements, addAnnouncement, updateAnnouncement } = store;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formStatus, setFormStatus] = useState('draft');
  const [saving, setSaving] = useState(false);

  const openAddDialog = () => {
    setEditingId(null);
    setFormTitle('');
    setFormContent('');
    setFormStatus('draft');
    setDialogOpen(true);
  };

  const openEditDialog = (announcement: Announcement) => {
    setEditingId(announcement.announcementId);
    setFormTitle(announcement.title);
    setFormContent(announcement.content);
    setFormStatus(announcement.statusPublikasi);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formTitle.trim() || !formContent.trim()) return;

    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 400));

    if (editingId) {
      updateAnnouncement(editingId, {
        title: formTitle,
        content: formContent,
        statusPublikasi: formStatus,
      });
    } else {
      addAnnouncement({
        announcementId: `ann-${Date.now()}`,
        title: formTitle,
        content: formContent,
        tahunAjaran: '2026/2027',
        statusPublikasi: formStatus,
        createdAt: new Date().toISOString(),
      });
    }

    setSaving(false);
    setDialogOpen(false);
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
        Tambah Pengumuman
      </Button>

      {/* Announcements list - grid on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {announcements.map((announcement) => (
          <div
            key={announcement.announcementId}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Megaphone className="size-4 shrink-0" style={{ color: '#EC4899' }} />
                  <p className="text-sm font-semibold truncate" style={{ color: '#1F2937' }}>
                    {announcement.title}
                  </p>
                </div>
                <p className="text-xs line-clamp-2" style={{ color: '#6B7280' }}>
                  {announcement.content}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <StatusBadge
                  status={announcement.statusPublikasi === 'publish' ? 'diterima' : 'draft'}
                />
                <span className="text-xs" style={{ color: '#9CA3AF' }}>
                  {formatDate(announcement.createdAt)}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-7"
                onClick={() => openEditDialog(announcement)}
              >
                <Pencil className="size-3 mr-1" />
                Edit
              </Button>
            </div>
          </div>
        ))}

        {announcements.length === 0 && (
          <div className="text-center py-12 col-span-full">
            <Megaphone className="size-12 mx-auto mb-3" style={{ color: '#D1D5DB' }} />
            <p className="text-sm font-medium" style={{ color: '#6B7280' }}>
              Belum ada pengumuman
            </p>
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Edit Pengumuman' : 'Tambah Pengumuman'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: '#6B7280' }}>
                Judul
              </label>
              <Input
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Judul pengumuman"
                className="border-gray-200"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: '#6B7280' }}>
                Konten
              </label>
              <Textarea
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                placeholder="Isi pengumuman..."
                className="border-gray-200 min-h-[120px] resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: '#6B7280' }}>
                Status Publikasi
              </label>
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
              >
                <option value="draft">Draft</option>
                <option value="publish">Publish</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Batal
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !formTitle.trim() || !formContent.trim()}
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
