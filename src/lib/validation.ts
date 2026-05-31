import { z } from 'zod/v4';

export const SchoolSchema = z.object({
  schoolId: z.string().optional(),
  namaSekolah: z.string().min(1, 'Nama sekolah wajib diisi'),
  npsn: z.string().min(1, 'NPSN wajib diisi'),
  jenjang: z.string().default('SD'),
  alamat: z.string().min(1, 'Alamat wajib diisi'),
  desa: z.string().min(1, 'Desa wajib diisi'),
  kecamatan: z.string().min(1, 'Kecamatan wajib diisi'),
  latitude: z.number(),
  longitude: z.number(),
  kuota: z.number().int().min(0),
  sisaKuota: z.number().int().min(0),
  statusAktif: z.boolean().default(true),
});

export const ApplicantSchema = z.object({
  nik: z.string().min(1, 'NIK wajib diisi'),
  namaSiswa: z.string().min(1, 'Nama siswa wajib diisi'),
  noHpOrtu: z.string().min(1, 'No HP orang tua wajib diisi'),
  schoolId: z.string().min(1, 'Sekolah tujuan wajib diisi'),
  jalur: z.enum(['domisili', 'afirmasi', 'mutasi', 'prestasi', 'zoning']),
});

export const ChatSettingsSchema = z.object({
  modelAI: z.string().optional(),
  aktifkanGoogleSearch: z.boolean().optional(),
  aktifkanSlowTyping: z.boolean().optional(),
  kecepatanTyping: z.enum(['lambat', 'normal', 'cepat']).optional(),
  maksimalHasilGoogle: z.number().int().min(1).max(10).optional(),
  sumberUtama: z.string().optional(),
  sumberTambahan: z.string().optional(),
  systemPrompt: z.string().nullable().optional(),
  pesanFallback: z.string().optional(),
});

export function formatZodErrors(error: unknown): string {
  if (error && typeof error === 'object' && 'issues' in error && Array.isArray(error.issues)) {
    return error.issues.map((e: any) => `${e.path?.join('.') || ''}: ${e.message}`).join(', ');
  }
  return 'Invalid request data';
}
