'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  CheckCircle,
  Circle,
  ChevronRight,
  ChevronLeft,
  Upload,
  X,
  Search,
  FileText,
  User,
  MapPin,
  ClipboardCheck,
  AlertCircle,
  Download,
  ExternalLink,
  Route,
  Navigation,
  ArrowRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpmbStore } from '@/lib/store';
import { SpmbHeader } from '@/components/spmb/shared/spmb-header';
import { StatusBadge } from '@/components/spmb/shared/status-badge';
import { calculateAge, generateRegistrationNumber, formatDate, getJalurLabel, calculateDistance, findNearestSchools, checkQuota, formatDistance } from '@/lib/business-logic';
import { jalurPendaftaran } from '@/lib/mock-data';
import type { Applicant, JalurPendaftaran, SchoolDistance } from '@/lib/types';

const STEPS = [
  { step: 1, title: 'Data Siswa', icon: User },
  { step: 2, title: 'Data Orang Tua', icon: User },
  { step: 3, title: 'Data Tambahan', icon: MapPin },
  { step: 4, title: 'Konfirmasi', icon: ClipboardCheck },
];

const AGAMA_OPTIONS = ['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu'];

interface RegistrationFormData {
  // Step 1
  nik: string;
  nisn: string;
  namaSiswa: string;
  tempatLahir: string;
  tanggalLahir: string;
  jenisKelamin: string;
  agama: string;
  schoolId: string;
  namaSekolah: string;
  jalur: JalurPendaftaran | '';
  // Step 2
  namaAyah: string;
  nikAyah: string;
  pekerjaanAyah: string;
  namaIbu: string;
  nikIbu: string;
  pekerjaanIbu: string;
  noHpOrtu: string;
  // Step 3
  alamat: string;
  desa: string;
  kecamatan: string;
  dokumenKK: string;
  dokumenAkta: string;
  dokumenKTP: string;
  dokumenKIP: string;
  dokumenPendukung: string;
}

interface ValidationErrors {
  [key: string]: string;
}

const initialFormData: RegistrationFormData = {
  nik: '',
  nisn: '',
  namaSiswa: '',
  tempatLahir: '',
  tanggalLahir: '',
  jenisKelamin: '',
  agama: '',
  schoolId: '',
  namaSekolah: '',
  jalur: '',
  namaAyah: '',
  nikAyah: '',
  pekerjaanAyah: '',
  namaIbu: '',
  nikIbu: '',
  pekerjaanIbu: '',
  noHpOrtu: '',
  alamat: '',
  desa: '',
  kecamatan: '',
  dokumenKK: '',
  dokumenAkta: '',
  dokumenKTP: '',
  dokumenKIP: '',
  dokumenPendukung: '',
};

export function RegistrationPage() {
  const {
    navigateTo,
    registrationStep,
    setRegistrationStep,
    registrationData,
    updateRegistrationData,
    resetRegistration,
    addApplicant,
    applicants,
    settings,
    schools,
  } = useSpmbStore();

  const [formData, setFormData] = useState<RegistrationFormData>({
    ...initialFormData,
    ...(registrationData as Partial<RegistrationFormData>),
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [nomorRegistrasi, setNomorRegistrasi] = useState('');
  const [nikChecking, setNikChecking] = useState(false);
  const [nikFound, setNikFound] = useState<{ found: boolean; lembaga: string; jenis: string } | null>(null);
  const [autoFilledFields, setAutoFilledFields] = useState<Set<string>>(new Set());
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLon, setUserLon] = useState<number | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [nearestSchools, setNearestSchools] = useState<SchoolDistance[]>([]);

  const getGpsLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGpsError('GPS tidak didukung di perangkat ini');
      return;
    }
    setGpsLoading(true);
    setGpsError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLat(pos.coords.latitude);
        setUserLon(pos.coords.longitude);
        setGpsLoading(false);
        const nearest = findNearestSchools(pos.coords.latitude, pos.coords.longitude, schools, 10);
        setNearestSchools(nearest);
      },
      (err) => {
        setGpsLoading(false);
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setGpsError('Izin GPS ditolak. Aktifkan GPS di pengaturan perangkat.');
            break;
          case err.POSITION_UNAVAILABLE:
            setGpsError('Lokasi tidak tersedia. Coba di luar ruangan.');
            break;
          default:
            setGpsError('Gagal mendapatkan lokasi. Coba lagi.');
        }
      },
      { enableHighAccuracy: true, timeout: 15000 },
    );
  }, []);

  // Sync form data with store
  useEffect(() => {
    updateRegistrationData(formData as Partial<Applicant>);
  }, [formData]);

  const updateField = useCallback((field: keyof RegistrationFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when field changes
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }, [errors]);

  // Auto-check NIK from database TK/PAUD/KB (Google Sheet data)
  const checkNik = useCallback(async (nik: string) => {
    if (nik.length === 16) {
      setNikChecking(true);
      setNikFound(null);
      setAutoFilledFields(new Set());

      try {
        // First check existing applicants in SPMB
        const existing = applicants.find((a) => a.nik === nik);
        if (existing) {
          setFormData((prev) => ({
            ...prev,
            namaSiswa: existing.namaSiswa,
            tempatLahir: existing.tempatLahir,
            tanggalLahir: existing.tanggalLahir,
            jenisKelamin: existing.jenisKelamin,
            agama: existing.agama,
            namaAyah: existing.namaAyah,
            nikAyah: existing.nikAyah,
            namaIbu: existing.namaIbu,
            nikIbu: existing.nikIbu,
            noHpOrtu: existing.noHpOrtu,
            alamat: existing.alamat,
            desa: existing.desa,
            kecamatan: existing.kecamatan,
          }));
          setAutoFilledFields(new Set([
            'namaSiswa', 'tempatLahir', 'tanggalLahir', 'jenisKelamin', 'agama',
            'namaAyah', 'nikAyah', 'namaIbu', 'nikIbu', 'noHpOrtu',
            'alamat', 'desa', 'kecamatan',
          ]));
          setNikFound({ found: true, lembaga: existing.namaSekolah, jenis: 'SPMB' });
          setNikChecking(false);
          return;
        }

        // Then check database TK/PAUD/KB (from Google Sheets)
        const res = await fetch(`/api/siswa-tk/lookup?nik=${nik}`);
        const data = await res.json();

        if (data.success && data.data) {
          const d = data.data;
          const filled = new Set<string>();

          setFormData((prev) => {
            const updated = { ...prev };

            // Only fill empty fields (don't overwrite user input)
            const fieldMap: [string, string][] = [
              ['nisn', d.nisn],
              ['namaSiswa', d.namaSiswa],
              ['tempatLahir', d.tempatLahir],
              ['tanggalLahir', d.tanggalLahir],
              ['jenisKelamin', d.jenisKelamin],
              ['agama', d.agama],
              ['alamat', d.alamat],
              ['desa', d.desa || d.kelurahan],
              ['kecamatan', d.kecamatan],
              ['namaAyah', d.namaAyah],
              ['nikAyah', d.nikAyah],
              ['pekerjaanAyah', d.pekerjaanAyah],
              ['namaIbu', d.namaIbu],
              ['nikIbu', d.nikIbu],
              ['pekerjaanIbu', d.pekerjaanIbu],
              ['noHpOrtu', d.noHpOrtu || d.hp],
            ];

            fieldMap.forEach(([field, value]) => {
              if (value && value.trim() !== '') {
                (updated as any)[field] = value;
                filled.add(field);
              }
            });

            setAutoFilledFields(filled);
            return updated;
          });

          setNikFound({
            found: true,
            lembaga: d.asalLembaga?.nama || 'TK/PAUD/KB',
            jenis: d.asalLembaga?.jenis || '',
          });
        } else {
          setNikFound({ found: false, lembaga: '', jenis: '' });
        }
      } catch (error) {
        console.error('NIK lookup error:', error);
        setNikFound({ found: false, lembaga: '', jenis: '' });
      }

      setNikChecking(false);
    }
  }, [applicants]);

  // Validate step
  const validateStep = (step: number): boolean => {
    const newErrors: ValidationErrors = {};

    if (step === 1) {
      if (!formData.nik || formData.nik.length !== 16) {
        newErrors.nik = 'NIK harus 16 digit';
      }
      if (!formData.namaSiswa.trim()) {
        newErrors.namaSiswa = 'Nama siswa wajib diisi';
      }
      if (!formData.tempatLahir.trim()) {
        newErrors.tempatLahir = 'Tempat lahir wajib diisi';
      }
      if (!formData.tanggalLahir) {
        newErrors.tanggalLahir = 'Tanggal lahir wajib diisi';
      } else {
        const usiaCheck = calculateAge(formData.tanggalLahir, settings.tanggalAcuanUsia, settings.usiaMinimalSD, settings.usiaPrioritasSD);
        if (usiaCheck.statusUsia === 'belum_memenuhi' || usiaCheck.statusUsia === 'perlu_rekomendasi') {
          newErrors.tanggalLahir = usiaCheck.pesan;
        }
      }
      if (!formData.jenisKelamin) {
        newErrors.jenisKelamin = 'Jenis kelamin wajib dipilih';
      }
      if (!formData.agama) {
        newErrors.agama = 'Agama wajib dipilih';
      }
      if (!formData.schoolId) {
        newErrors.schoolId = 'Sekolah tujuan wajib dipilih';
      }
      if (!formData.jalur) {
        newErrors.jalur = 'Jalur pendaftaran wajib dipilih';
      } else if (formData.jalur === 'domisili') {
        if (userLat === null || userLon === null) {
          newErrors.jalur = 'Aktifkan GPS untuk verifikasi jarak domisili dengan sekolah';
        } else if (formData.schoolId) {
          const selectedSchool = schools.find((s) => s.schoolId === formData.schoolId);
          if (selectedSchool && selectedSchool.latitude && selectedSchool.longitude) {
            const jarak = calculateDistance(userLat, userLon, selectedSchool.latitude, selectedSchool.longitude);
            if (jarak > 10) {
              newErrors.jalur = `Jarak domisili ke sekolah ${jarak} km melebihi batas maksimal 10 km untuk Jalur Domisili`;
            }
          }
        }
      }
    } else if (step === 2) {
      if (!formData.namaAyah.trim()) {
        newErrors.namaAyah = 'Nama ayah wajib diisi';
      }
      if (formData.nikAyah && formData.nikAyah.length !== 16) {
        newErrors.nikAyah = 'NIK ayah harus 16 digit';
      }
      if (!formData.namaIbu.trim()) {
        newErrors.namaIbu = 'Nama ibu wajib diisi';
      }
      if (formData.nikIbu && formData.nikIbu.length !== 16) {
        newErrors.nikIbu = 'NIK ibu harus 16 digit';
      }
      if (!formData.noHpOrtu.trim()) {
        newErrors.noHpOrtu = 'Nomor HP wajib diisi';
      } else if (formData.noHpOrtu.length < 10) {
        newErrors.noHpOrtu = 'Nomor HP minimal 10 digit';
      }
    } else if (step === 3) {
      if (!formData.alamat.trim()) {
        newErrors.alamat = 'Alamat wajib diisi';
      }
      if (!formData.desa.trim()) {
        newErrors.desa = 'Desa/Kelurahan wajib diisi';
      }
      if (!formData.kecamatan.trim()) {
        newErrors.kecamatan = 'Kecamatan wajib diisi';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(registrationStep)) {
      setRegistrationStep(registrationStep + 1);
    }
  };

  const handlePrev = () => {
    if (registrationStep > 1) {
      setRegistrationStep(registrationStep - 1);
    }
  };

  const handleGoToStep = (step: number) => {
    // Only allow going to completed steps or current step
    if (step < registrationStep) {
      setRegistrationStep(step);
    }
  };

  const handleSubmit = () => {
    // Re-validate age as safety net
    if (formData.tanggalLahir) {
      const usiaCheck = calculateAge(formData.tanggalLahir, settings.tanggalAcuanUsia, settings.usiaMinimalSD, settings.usiaPrioritasSD);
      if (usiaCheck.statusUsia === 'belum_memenuhi' || usiaCheck.statusUsia === 'perlu_rekomendasi') {
        setErrors({ tanggalLahir: usiaCheck.pesan });
        setRegistrationStep(1);
        return;
      }
    }

    // Re-validate domisili distance as safety net
    if (formData.jalur === 'domisili' && formData.schoolId && userLat !== null && userLon !== null) {
      const selectedSchool = schools.find((s) => s.schoolId === formData.schoolId);
      if (selectedSchool?.latitude && selectedSchool?.longitude) {
        const jarak = calculateDistance(userLat, userLon, selectedSchool.latitude, selectedSchool.longitude);
        if (jarak > 10) {
          setErrors({ jalur: `Jarak domisili ke sekolah ${jarak} km melebihi batas maksimal 10 km` });
          setRegistrationStep(1);
          return;
        }
      }
    }

    const nomor = generateRegistrationNumber();
    setNomorRegistrasi(nomor);

    const selectedSchool = schools.find((s) => s.schoolId === formData.schoolId);

    const newApplicant: Applicant = {
      applicantId: `app-${Date.now()}`,
      nomorPendaftaran: nomor,
      nik: formData.nik,
      nisn: formData.nisn,
      namaSiswa: formData.namaSiswa,
      tempatLahir: formData.tempatLahir,
      tanggalLahir: formData.tanggalLahir,
      jenisKelamin: formData.jenisKelamin,
      agama: formData.agama,
      alamat: formData.alamat,
      desa: formData.desa,
      kecamatan: formData.kecamatan,
      namaAyah: formData.namaAyah,
      nikAyah: formData.nikAyah,
      pekerjaanAyah: formData.pekerjaanAyah,
      namaIbu: formData.namaIbu,
      nikIbu: formData.nikIbu,
      pekerjaanIbu: formData.pekerjaanIbu,
      noHpOrtu: formData.noHpOrtu,
      schoolId: formData.schoolId,
      namaSekolah: selectedSchool?.namaSekolah || '',
      jalur: (formData.jalur || 'domisili') as JalurPendaftaran,
      statusBerkas: 'belum_lengkap',
      statusPendaftaran: 'terkirim',
      catatanOperator: '',
      latitudeDomisili: formData.jalur === 'domisili' && userLat !== null ? userLat : undefined,
      longitudeDomisili: formData.jalur === 'domisili' && userLon !== null ? userLon : undefined,
      jarakDomisiliKm: formData.jalur === 'domisili' && userLat !== null && userLon !== null && selectedSchool?.latitude && selectedSchool?.longitude
        ? calculateDistance(userLat, userLon, selectedSchool.latitude, selectedSchool.longitude)
        : undefined,
      schoolLatitude: selectedSchool?.latitude,
      schoolLongitude: selectedSchool?.longitude,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addApplicant(newApplicant);
    setSubmitted(true);
  };

  // Calculate age from tanggalLahir
  const ageResult = formData.tanggalLahir
    ? calculateAge(formData.tanggalLahir, settings.tanggalAcuanUsia, settings.usiaMinimalSD, settings.usiaPrioritasSD)
    : null;

  // Render stepper
  const renderStepper = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
      <div className="flex items-center justify-between">
        {STEPS.map((stepInfo, index) => {
          const isCompleted = registrationStep > stepInfo.step;
          const isActive = registrationStep === stepInfo.step;
          const Icon = stepInfo.icon;

          return (
            <React.Fragment key={stepInfo.step}>
              {/* Step circle */}
              <button
                onClick={() => handleGoToStep(stepInfo.step)}
                className="flex flex-col items-center gap-1.5 min-w-[56px]"
              >
                <div
                  className="flex items-center justify-center size-9 rounded-full transition-all"
                  style={{
                    backgroundColor: isCompleted
                      ? '#43A047'
                      : isActive
                        ? '#1565C0'
                        : '#E5E7EB',
                    color: isCompleted || isActive ? '#FFFFFF' : '#9CA3AF',
                  }}
                >
                  {isCompleted ? (
                    <CheckCircle className="size-5" />
                  ) : (
                    <span className="text-sm font-bold">{stepInfo.step}</span>
                  )}
                </div>
                <span
                  className="text-[10px] font-medium text-center leading-tight max-w-[60px]"
                  style={{
                    color: isActive
                      ? '#1565C0'
                      : isCompleted
                        ? '#43A047'
                        : '#9CA3AF',
                  }}
                >
                  {stepInfo.title}
                </span>
              </button>

              {/* Connector line */}
              {index < STEPS.length - 1 && (
                <div
                  className="flex-1 h-0.5 mx-1 rounded-full mt-[-16px]"
                  style={{
                    backgroundColor:
                      registrationStep > stepInfo.step ? '#43A047' : '#E5E7EB',
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );

  // Render field with label and error (with auto-fill indicator)
  const renderField = (
    id: string,
    label: string,
    required: boolean,
    children: React.ReactNode,
    error?: string,
  ) => (
    <div>
      <label
        htmlFor={id}
        className="block text-xs font-medium mb-1.5 flex items-center gap-1.5"
        style={{ color: '#6B7280' }}
      >
        {label}
        {required && <span style={{ color: '#EF4444' }}> *</span>}
        {autoFilledFields.has(id) && (
          <span
            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-medium"
            style={{ backgroundColor: '#E8F5E9', color: '#2E7D32' }}
          >
            <CheckCircle className="size-2.5" /> Auto
          </span>
        )}
      </label>
      {children}
      {error && (
        <p className="text-xs mt-1 flex items-center gap-1" style={{ color: '#EF4444' }}>
          <AlertCircle className="size-3" />
          {error}
        </p>
      )}
    </div>
  );

  // Step 1 - Data Siswa
  const renderStep1 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center gap-2 mb-4">
          <div
            className="flex items-center justify-center size-8 rounded-lg"
            style={{ backgroundColor: '#E3F2FD' }}
          >
            <User className="size-4" style={{ color: '#1565C0' }} />
          </div>
          <h3 className="text-sm font-semibold" style={{ color: '#1F2937' }}>
            Data Siswa
          </h3>
        </div>

        <div className="space-y-4">
          {renderField('nik', 'NIK Siswa', true,
            <div>
              <div className="relative">
                <input
                  id="nik"
                  type="text"
                  inputMode="numeric"
                  maxLength={16}
                  value={formData.nik}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    updateField('nik', val);
                    if (val.length === 16) checkNik(val);
                    if (val.length < 16) {
                      setNikFound(null);
                      setAutoFilledFields(new Set());
                    }
                  }}
                  placeholder="Masukkan 16 digit NIK siswa"
                  className="w-full h-11 rounded-lg border px-3 text-sm outline-none transition-colors pr-10"
                  style={{
                    borderColor: errors.nik ? '#EF4444' : nikFound?.found ? '#43A047' : '#E5E7EB',
                    backgroundColor: nikFound?.found ? '#F0FFF4' : '#F9FAFB',
                    color: '#1F2937',
                  }}
                  onFocus={(e) => { if (!errors.nik && !nikFound?.found) e.target.style.borderColor = '#1565C0'; }}
                  onBlur={(e) => { e.target.style.borderColor = errors.nik ? '#EF4444' : nikFound?.found ? '#43A047' : '#E5E7EB'; }}
                />
                {nikChecking && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="size-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                  </div>
                )}
                {!nikChecking && nikFound?.found && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <CheckCircle className="size-5" style={{ color: '#43A047' }} />
                  </div>
                )}
              </div>
              {/* Auto-fill status message */}
              {nikFound?.found && nikFound.lembaga && (
                <div
                  className="mt-2 flex items-center gap-2 rounded-lg px-3 py-2 text-xs"
                  style={{ backgroundColor: '#E8F5E9', color: '#2E7D32', border: '1px solid #C8E6C9' }}
                >
                  <CheckCircle className="size-4 shrink-0" />
                  <span>
                    Data ditemukan dari <strong>{nikFound.lembaga}</strong>
                    {nikFound.jenis ? ` (${nikFound.jenis})` : ''} — field otomatis terisi dan masih bisa diedit
                  </span>
                </div>
              )}
              {!nikChecking && nikFound && !nikFound.found && formData.nik.length === 16 && (
                <div
                  className="mt-2 flex items-center gap-2 rounded-lg px-3 py-2 text-xs"
                  style={{ backgroundColor: '#FFF3E0', color: '#E65100', border: '1px solid #FFE0B2' }}
                >
                  <AlertCircle className="size-4 shrink-0" />
                  <span>NIK tidak ditemukan di database TK/PAUD/KB. Silakan isi data manual.</span>
                </div>
              )}
            </div>,
            errors.nik,
          )}

          {renderField('nisn', 'NISN', false,
            <input
              id="nisn"
              type="text"
              value={formData.nisn}
              onChange={(e) => updateField('nisn', e.target.value)}
              placeholder="NISN (opsional)"
              className="w-full h-11 rounded-lg border px-3 text-sm outline-none transition-colors"
              style={{ borderColor: '#E5E7EB', backgroundColor: '#F9FAFB', color: '#1F2937' }}
              onFocus={(e) => { e.target.style.borderColor = '#1565C0'; }}
              onBlur={(e) => { e.target.style.borderColor = '#E5E7EB'; }}
            />,
          )}

          {renderField('namaSiswa', 'Nama Siswa', true,
            <input
              id="namaSiswa"
              type="text"
              value={formData.namaSiswa}
              onChange={(e) => updateField('namaSiswa', e.target.value)}
              placeholder="Nama lengkap siswa"
              className="w-full h-11 rounded-lg border px-3 text-sm outline-none transition-colors"
              style={{
                borderColor: errors.namaSiswa ? '#EF4444' : '#E5E7EB',
                backgroundColor: '#F9FAFB',
                color: '#1F2937',
              }}
              onFocus={(e) => { if (!errors.namaSiswa) e.target.style.borderColor = '#1565C0'; }}
              onBlur={(e) => { e.target.style.borderColor = errors.namaSiswa ? '#EF4444' : '#E5E7EB'; }}
            />,
            errors.namaSiswa,
          )}

          {renderField('tempatLahir', 'Tempat Lahir', true,
            <input
              id="tempatLahir"
              type="text"
              value={formData.tempatLahir}
              onChange={(e) => updateField('tempatLahir', e.target.value)}
              placeholder="Kota/Kabupaten"
              className="w-full h-11 rounded-lg border px-3 text-sm outline-none transition-colors"
              style={{
                borderColor: errors.tempatLahir ? '#EF4444' : '#E5E7EB',
                backgroundColor: '#F9FAFB',
                color: '#1F2937',
              }}
              onFocus={(e) => { if (!errors.tempatLahir) e.target.style.borderColor = '#1565C0'; }}
              onBlur={(e) => { e.target.style.borderColor = errors.tempatLahir ? '#EF4444' : '#E5E7EB'; }}
            />,
            errors.tempatLahir,
          )}

          {renderField('tanggalLahir', 'Tanggal Lahir', true,
            <div>
              <input
                id="tanggalLahir"
                type="date"
                value={formData.tanggalLahir}
                onChange={(e) => updateField('tanggalLahir', e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="w-full h-11 rounded-lg border px-3 text-sm outline-none transition-colors"
                style={{
                  borderColor: errors.tanggalLahir ? '#EF4444' : '#E5E7EB',
                  backgroundColor: '#F9FAFB',
                  color: '#1F2937',
                }}
                onFocus={(e) => { if (!errors.tanggalLahir) e.target.style.borderColor = '#1565C0'; }}
                onBlur={(e) => { e.target.style.borderColor = errors.tanggalLahir ? '#EF4444' : '#E5E7EB'; }}
              />
              {ageResult && (
                <p className="text-xs mt-1" style={{ color: '#6B7280' }}>
                  Usia per {formatDate(settings.tanggalAcuanUsia)}:{' '}
                  <strong>
                    {ageResult.usiaTahun} tahun {ageResult.usiaBulan} bulan
                  </strong>
                </p>
              )}
            </div>,
            errors.tanggalLahir,
          )}

          {renderField('jenisKelamin', 'Jenis Kelamin', true,
            <div className="flex gap-3">
              {['Laki-laki', 'Perempuan'].map((jk) => (
                <label
                  key={jk}
                  className="flex items-center gap-2 cursor-pointer flex-1 h-11 rounded-lg border px-3 transition-colors"
                  style={{
                    borderColor: formData.jenisKelamin === jk ? '#1565C0' : '#E5E7EB',
                    backgroundColor: formData.jenisKelamin === jk ? '#E3F2FD' : '#F9FAFB',
                  }}
                >
                  <input
                    type="radio"
                    name="jenisKelamin"
                    value={jk}
                    checked={formData.jenisKelamin === jk}
                    onChange={(e) => updateField('jenisKelamin', e.target.value)}
                    className="accent-[#1565C0]"
                  />
                  <span className="text-sm" style={{ color: '#1F2937' }}>{jk}</span>
                </label>
              ))}
            </div>,
            errors.jenisKelamin,
          )}

          {renderField('agama', 'Agama', true,
            <select
              id="agama"
              value={formData.agama}
              onChange={(e) => updateField('agama', e.target.value)}
              className="w-full h-11 rounded-lg border px-3 text-sm outline-none transition-colors appearance-none"
              style={{
                borderColor: errors.agama ? '#EF4444' : '#E5E7EB',
                backgroundColor: '#F9FAFB',
                color: '#1F2937',
              }}
            >
              <option value="">Pilih Agama</option>
              {AGAMA_OPTIONS.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>,
            errors.agama,
          )}

          {formData.jalur !== 'domisili' ? (
            renderField('schoolId', 'Sekolah Tujuan', true,
              <select
                id="schoolId"
                value={formData.schoolId}
                onChange={(e) => {
                  const school = schools.find((s) => s.schoolId === e.target.value);
                  updateField('schoolId', e.target.value);
                  if (school) updateField('namaSekolah', school.namaSekolah);
                }}
                className="w-full h-11 rounded-lg border px-3 text-sm outline-none transition-colors appearance-none"
                style={{
                  borderColor: errors.schoolId ? '#EF4444' : '#E5E7EB',
                  backgroundColor: '#F9FAFB',
                  color: '#1F2937',
                }}
              >
                <option value="">Pilih Sekolah Tujuan</option>
                {schools.map((s) => (
                  <option key={s.schoolId} value={s.schoolId}>
                    {s.namaSekolah} (Kuota: {s.sisaKuota})
                  </option>
                ))}
              </select>,
              errors.schoolId,
            )
          ) : userLat !== null && userLon !== null && nearestSchools.length > 0 ? (
            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: '#6B7280' }}>
                Sekolah Terdekat <span style={{ color: '#EF4444' }}> *</span>
              </label>
              <div className="space-y-2">
                {nearestSchools.slice(0, 5).map((sd, idx) => {
                  const qc = checkQuota(sd.school);
                  const isFull = qc.statusKuota === 'Penuh';
                  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${sd.school.latitude},${sd.school.longitude}`;
                  const routeUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLon}&destination=${sd.school.latitude},${sd.school.longitude}&travelmode=driving`;

                  return (
                    <button
                      key={sd.school.schoolId}
                      type="button"
                      onClick={() => {
                        if (!isFull) {
                          updateField('schoolId', sd.school.schoolId);
                          updateField('namaSekolah', sd.school.namaSekolah);
                        }
                      }}
                      disabled={isFull}
                      className="w-full text-left rounded-xl border p-3 transition-all"
                      style={{
                        borderColor: formData.schoolId === sd.school.schoolId ? '#1565C0' : '#E5E7EB',
                        backgroundColor: formData.schoolId === sd.school.schoolId ? '#E3F2FD' : '#FFFFFF',
                        opacity: isFull ? 0.5 : 1,
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="flex items-center justify-center size-6 rounded-full shrink-0 text-[10px] font-bold" style={{ backgroundColor: '#E3F2FD', color: '#1565C0' }}>
                            {idx + 1}
                          </span>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold truncate" style={{ color: '#1F2937' }}>
                              {sd.school.namaSekolah}
                            </p>
                            <p className="text-xs" style={{ color: '#6B7280' }}>
                              Desa {sd.school.desa} — {formatDistance(sd.jarakKm)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: qc.statusKuota === 'Tersedia' ? '#E8F5E9' : qc.statusKuota === 'Terbatas' ? '#FFF3E0' : '#FFEBEE',
                              color: qc.statusKuota === 'Tersedia' ? '#2E7D32' : qc.statusKuota === 'Terbatas' ? '#E65100' : '#C62828',
                            }}
                          >
                            {qc.statusKuota === 'Penuh' ? 'Penuh' : `Sisa ${sd.school.sisaKuota}`}
                          </span>
                          {formData.schoolId === sd.school.schoolId && (
                            <CheckCircle className="size-4" style={{ color: '#1565C0' }} />
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex-1 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${Math.min(100, Math.round((sd.school.sisaKuota / Math.max(sd.school.kuota, 1)) * 100))}%`,
                              backgroundColor: isFull ? '#EF4444' : qc.statusKuota === 'Terbatas' ? '#F59E0B' : '#43A047',
                            }}
                          />
                        </div>
                        <div className="flex gap-1">
                          <a
                            href={mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center size-6 rounded text-[10px] font-medium"
                            style={{ backgroundColor: '#F3F8FF', color: '#1565C0', border: '1px solid #BBDEFB' }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink className="size-3" />
                          </a>
                          <a
                            href={routeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center size-6 rounded text-[10px] font-medium"
                            style={{ backgroundColor: '#E8F5E9', color: '#2E7D32', border: '1px solid #C8E6C9' }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Route className="size-3" />
                          </a>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              {errors.schoolId && (
                <p className="text-xs mt-1 flex items-center gap-1" style={{ color: '#EF4444' }}>
                  <AlertCircle className="size-3" />
                  {errors.schoolId}
                </p>
              )}
            </div>
          ) : null}

          {renderField('jalur', 'Jalur Pendaftaran', true,
            <select
              id="jalur"
              value={formData.jalur}
              onChange={(e) => {
                updateField('jalur', e.target.value);
                if (e.target.value !== 'domisili') {
                  setNearestSchools([]);
                }
              }}
              className="w-full h-11 rounded-lg border px-3 text-sm outline-none transition-colors appearance-none"
              style={{
                borderColor: errors.jalur ? '#EF4444' : '#E5E7EB',
                backgroundColor: '#F9FAFB',
                color: '#1F2937',
              }}
            >
              <option value="">Pilih Jalur Pendaftaran</option>
              {jalurPendaftaran.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.nama} (Kuota: {j.kuota}%)
                </option>
              ))}
            </select>,
            errors.jalur,
          )}

          {formData.jalur && (
            <div
              className="rounded-lg p-3 text-xs"
              style={{
                backgroundColor: '#E3F2FD',
                color: '#1565C0',
                border: '1px solid #BBDEFB',
              }}
            >
              <p className="font-medium">
                {jalurPendaftaran.find((j) => j.id === formData.jalur)?.deskripsi}
              </p>
            </div>
          )}

          {formData.jalur === 'domisili' && (
            <div>
              {userLat !== null && userLon !== null ? (
                <div
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs"
                  style={{ backgroundColor: '#E8F5E9', color: '#2E7D32', border: '1px solid #C8E6C9' }}
                >
                  <CheckCircle className="size-4 shrink-0" />
                  <span>Lokasi terdeteksi: {userLat.toFixed(4)}, {userLon.toFixed(4)}</span>
                </div>
              ) : (
                <button
                  onClick={getGpsLocation}
                  disabled={gpsLoading}
                  className="w-full h-11 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
                  style={{
                    backgroundColor: '#F3F8FF',
                    color: '#1565C0',
                    border: '1px solid #BBDEFB',
                  }}
                >
                  {gpsLoading ? (
                    <>
                      <div className="size-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                      Mendeteksi lokasi...
                    </>
                  ) : (
                    <>
                      <Navigation className="size-4" />
                      Ambil Lokasi GPS untuk Cari Sekolah Terdekat
                    </>
                  )}
                </button>
              )}
              {gpsError && (
                <p className="text-xs mt-1 flex items-center gap-1" style={{ color: '#EF4444' }}>
                  <AlertCircle className="size-3" />
                  {gpsError}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );

  // Step 2 - Data Orang Tua
  const renderStep2 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        {/* Data Ayah */}
        <div className="flex items-center gap-2 mb-4">
          <div
            className="flex items-center justify-center size-8 rounded-lg"
            style={{ backgroundColor: '#E8F5E9' }}
          >
            <User className="size-4" style={{ color: '#43A047' }} />
          </div>
          <h3 className="text-sm font-semibold" style={{ color: '#1F2937' }}>
            Data Ayah
          </h3>
        </div>

        <div className="space-y-4 mb-6">
          {renderField('namaAyah', 'Nama Ayah', true,
            <input
              id="namaAyah"
              type="text"
              value={formData.namaAyah}
              onChange={(e) => updateField('namaAyah', e.target.value)}
              placeholder="Nama lengkap ayah"
              className="w-full h-11 rounded-lg border px-3 text-sm outline-none transition-colors"
              style={{
                borderColor: errors.namaAyah ? '#EF4444' : '#E5E7EB',
                backgroundColor: '#F9FAFB',
                color: '#1F2937',
              }}
              onFocus={(e) => { if (!errors.namaAyah) e.target.style.borderColor = '#1565C0'; }}
              onBlur={(e) => { e.target.style.borderColor = errors.namaAyah ? '#EF4444' : '#E5E7EB'; }}
            />,
            errors.namaAyah,
          )}

          {renderField('nikAyah', 'NIK Ayah', false,
            <input
              id="nikAyah"
              type="text"
              inputMode="numeric"
              maxLength={16}
              value={formData.nikAyah}
              onChange={(e) => updateField('nikAyah', e.target.value.replace(/\D/g, ''))}
              placeholder="16 digit NIK ayah"
              className="w-full h-11 rounded-lg border px-3 text-sm outline-none transition-colors"
              style={{
                borderColor: errors.nikAyah ? '#EF4444' : '#E5E7EB',
                backgroundColor: '#F9FAFB',
                color: '#1F2937',
              }}
              onFocus={(e) => { if (!errors.nikAyah) e.target.style.borderColor = '#1565C0'; }}
              onBlur={(e) => { e.target.style.borderColor = errors.nikAyah ? '#EF4444' : '#E5E7EB'; }}
            />,
            errors.nikAyah,
          )}

          {renderField('pekerjaanAyah', 'Pekerjaan Ayah', false,
            <input
              id="pekerjaanAyah"
              type="text"
              value={formData.pekerjaanAyah}
              onChange={(e) => updateField('pekerjaanAyah', e.target.value)}
              placeholder="Pekerjaan ayah"
              className="w-full h-11 rounded-lg border px-3 text-sm outline-none transition-colors"
              style={{ borderColor: '#E5E7EB', backgroundColor: '#F9FAFB', color: '#1F2937' }}
              onFocus={(e) => { e.target.style.borderColor = '#1565C0'; }}
              onBlur={(e) => { e.target.style.borderColor = '#E5E7EB'; }}
            />,
          )}
        </div>

        <div className="h-px mb-6" style={{ backgroundColor: '#F3F4F6' }} />

        {/* Data Ibu */}
        <div className="flex items-center gap-2 mb-4">
          <div
            className="flex items-center justify-center size-8 rounded-lg"
            style={{ backgroundColor: '#FCE4EC' }}
          >
            <User className="size-4" style={{ color: '#E91E63' }} />
          </div>
          <h3 className="text-sm font-semibold" style={{ color: '#1F2937' }}>
            Data Ibu
          </h3>
        </div>

        <div className="space-y-4 mb-6">
          {renderField('namaIbu', 'Nama Ibu', true,
            <input
              id="namaIbu"
              type="text"
              value={formData.namaIbu}
              onChange={(e) => updateField('namaIbu', e.target.value)}
              placeholder="Nama lengkap ibu"
              className="w-full h-11 rounded-lg border px-3 text-sm outline-none transition-colors"
              style={{
                borderColor: errors.namaIbu ? '#EF4444' : '#E5E7EB',
                backgroundColor: '#F9FAFB',
                color: '#1F2937',
              }}
              onFocus={(e) => { if (!errors.namaIbu) e.target.style.borderColor = '#1565C0'; }}
              onBlur={(e) => { e.target.style.borderColor = errors.namaIbu ? '#EF4444' : '#E5E7EB'; }}
            />,
            errors.namaIbu,
          )}

          {renderField('nikIbu', 'NIK Ibu', false,
            <input
              id="nikIbu"
              type="text"
              inputMode="numeric"
              maxLength={16}
              value={formData.nikIbu}
              onChange={(e) => updateField('nikIbu', e.target.value.replace(/\D/g, ''))}
              placeholder="16 digit NIK ibu"
              className="w-full h-11 rounded-lg border px-3 text-sm outline-none transition-colors"
              style={{
                borderColor: errors.nikIbu ? '#EF4444' : '#E5E7EB',
                backgroundColor: '#F9FAFB',
                color: '#1F2937',
              }}
              onFocus={(e) => { if (!errors.nikIbu) e.target.style.borderColor = '#1565C0'; }}
              onBlur={(e) => { e.target.style.borderColor = errors.nikIbu ? '#EF4444' : '#E5E7EB'; }}
            />,
            errors.nikIbu,
          )}

          {renderField('pekerjaanIbu', 'Pekerjaan Ibu', false,
            <input
              id="pekerjaanIbu"
              type="text"
              value={formData.pekerjaanIbu}
              onChange={(e) => updateField('pekerjaanIbu', e.target.value)}
              placeholder="Pekerjaan ibu"
              className="w-full h-11 rounded-lg border px-3 text-sm outline-none transition-colors"
              style={{ borderColor: '#E5E7EB', backgroundColor: '#F9FAFB', color: '#1F2937' }}
              onFocus={(e) => { e.target.style.borderColor = '#1565C0'; }}
              onBlur={(e) => { e.target.style.borderColor = '#E5E7EB'; }}
            />,
          )}
        </div>

        <div className="h-px mb-6" style={{ backgroundColor: '#F3F4F6' }} />

        {/* No HP */}
        {renderField('noHpOrtu', 'Nomor HP Orang Tua', true,
          <input
            id="noHpOrtu"
            type="tel"
            inputMode="tel"
            value={formData.noHpOrtu}
            onChange={(e) => updateField('noHpOrtu', e.target.value)}
            placeholder="08xxxxxxxxxx"
            className="w-full h-11 rounded-lg border px-3 text-sm outline-none transition-colors"
            style={{
              borderColor: errors.noHpOrtu ? '#EF4444' : '#E5E7EB',
              backgroundColor: '#F9FAFB',
              color: '#1F2937',
            }}
            onFocus={(e) => { if (!errors.noHpOrtu) e.target.style.borderColor = '#1565C0'; }}
            onBlur={(e) => { e.target.style.borderColor = errors.noHpOrtu ? '#EF4444' : '#E5E7EB'; }}
          />,
          errors.noHpOrtu,
        )}
      </div>
    </motion.div>
  );

  // Step 3 - Data Tambahan
  const renderStep3 = () => {
    const handleFileUpload = (field: keyof RegistrationFormData) => {
      const filenames: Record<string, string> = {
        dokumenKK: 'kartu_keluarga.pdf',
        dokumenAkta: 'akta_kelahiran.pdf',
        dokumenKTP: 'ktp_ortu.pdf',
        dokumenKIP: 'kip_kks_pkh.pdf',
        dokumenPendukung: 'dokumen_pendukung.pdf',
      };
      setFormData((prev) => ({
        ...prev,
        [field]: prev[field] ? '' : filenames[field] || 'dokumen.pdf',
      }));
    };

    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="space-y-4"
      >
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-4">
            <div
              className="flex items-center justify-center size-8 rounded-lg"
              style={{ backgroundColor: '#E0F2F1' }}
            >
              <MapPin className="size-4" style={{ color: '#009688' }} />
            </div>
            <h3 className="text-sm font-semibold" style={{ color: '#1F2937' }}>
              Alamat
            </h3>
          </div>

          <div className="space-y-4">
            {renderField('alamat', 'Alamat Lengkap', true,
              <textarea
                id="alamat"
                value={formData.alamat}
                onChange={(e) => updateField('alamat', e.target.value)}
                placeholder="Jl. ... RT/RW ... No. ..."
                rows={3}
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors resize-none"
                style={{
                  borderColor: errors.alamat ? '#EF4444' : '#E5E7EB',
                  backgroundColor: '#F9FAFB',
                  color: '#1F2937',
                }}
                onFocus={(e) => { if (!errors.alamat) e.target.style.borderColor = '#1565C0'; }}
                onBlur={(e) => { e.target.style.borderColor = errors.alamat ? '#EF4444' : '#E5E7EB'; }}
              />,
              errors.alamat,
            )}

            {renderField('desa', 'Desa/Kelurahan', true,
              <input
                id="desa"
                type="text"
                value={formData.desa}
                onChange={(e) => updateField('desa', e.target.value)}
                placeholder="Nama desa/kelurahan"
                className="w-full h-11 rounded-lg border px-3 text-sm outline-none transition-colors"
                style={{
                  borderColor: errors.desa ? '#EF4444' : '#E5E7EB',
                  backgroundColor: '#F9FAFB',
                  color: '#1F2937',
                }}
                onFocus={(e) => { if (!errors.desa) e.target.style.borderColor = '#1565C0'; }}
                onBlur={(e) => { e.target.style.borderColor = errors.desa ? '#EF4444' : '#E5E7EB'; }}
              />,
              errors.desa,
            )}

            {renderField('kecamatan', 'Kecamatan', true,
              <input
                id="kecamatan"
                type="text"
                value={formData.kecamatan}
                onChange={(e) => updateField('kecamatan', e.target.value)}
                placeholder="Nama kecamatan"
                className="w-full h-11 rounded-lg border px-3 text-sm outline-none transition-colors"
                style={{
                  borderColor: errors.kecamatan ? '#EF4444' : '#E5E7EB',
                  backgroundColor: '#F9FAFB',
                  color: '#1F2937',
                }}
                onFocus={(e) => { if (!errors.kecamatan) e.target.style.borderColor = '#1565C0'; }}
                onBlur={(e) => { e.target.style.borderColor = errors.kecamatan ? '#EF4444' : '#E5E7EB'; }}
              />,
              errors.kecamatan,
            )}
          </div>
        </div>

        {/* Upload Dokumen */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-4">
            <div
              className="flex items-center justify-center size-8 rounded-lg"
              style={{ backgroundColor: '#E3F2FD' }}
            >
              <Upload className="size-4" style={{ color: '#1565C0' }} />
            </div>
            <h3 className="text-sm font-semibold" style={{ color: '#1F2937' }}>
              Upload Dokumen
            </h3>
          </div>

          <p className="text-[10px] mb-1" style={{ color: '#9CA3AF' }}>
            Format: PDF, JPG, JPEG, PNG — Upload dokumen yang asli (bukan fotokopi)
          </p>
          <div className="space-y-3">
            {[
              { key: 'dokumenKK' as keyof RegistrationFormData, label: 'Kartu Keluarga', required: true },
              { key: 'dokumenAkta' as keyof RegistrationFormData, label: 'Akta Kelahiran', required: true },
              { key: 'dokumenKTP' as keyof RegistrationFormData, label: 'KTP Orang Tua', required: true },
              { key: 'dokumenKIP' as keyof RegistrationFormData, label: 'KIP/KKS/PKH', required: false },
              { key: 'dokumenPendukung' as keyof RegistrationFormData, label: 'Dokumen Pendukung', required: false },
            ].map((doc) => (
              <div
                key={doc.key}
                className="flex items-center justify-between p-3 rounded-lg border"
                style={{
                  borderColor: formData[doc.key] ? '#43A047' : '#E5E7EB',
                  backgroundColor: formData[doc.key] ? '#F0FFF4' : '#F9FAFB',
                }}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <FileText
                    className="size-4 shrink-0"
                    style={{ color: formData[doc.key] ? '#43A047' : '#9CA3AF' }}
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate" style={{ color: '#1F2937' }}>
                      {doc.label}
                      {doc.required && <span style={{ color: '#EF4444' }}> *</span>}
                    </p>
                    {formData[doc.key] && (
                      <p className="text-[10px] truncate" style={{ color: '#43A047' }}>
                        {formData[doc.key]}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleFileUpload(doc.key)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 ml-2"
                  style={{
                    backgroundColor: formData[doc.key] ? '#FEE2E2' : '#E3F2FD',
                    color: formData[doc.key] ? '#EF4444' : '#1565C0',
                  }}
                >
                  {formData[doc.key] ? (
                    <>
                      <X className="size-3" /> Hapus
                    </>
                  ) : (
                    <>
                      <Upload className="size-3" /> Upload
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    );
  };

  // Step 4 - Konfirmasi
  const renderStep4 = () => {
    const selectedSchool = schools.find((s) => s.schoolId === formData.schoolId);
    const selectedJalur = jalurPendaftaran.find((j) => j.id === formData.jalur);

    const sections = [
      {
        title: 'Data Siswa',
        step: 1,
        icon: <User className="size-4" style={{ color: '#1565C0' }} />,
        bgColor: '#E3F2FD',
        items: [
          { label: 'NIK', value: formData.nik },
          { label: 'NISN', value: formData.nisn || '-' },
          { label: 'Nama Siswa', value: formData.namaSiswa },
          { label: 'Tempat Lahir', value: formData.tempatLahir },
          { label: 'Tanggal Lahir', value: formData.tanggalLahir ? formatDate(formData.tanggalLahir) : '-' },
          { label: 'Jenis Kelamin', value: formData.jenisKelamin },
          { label: 'Agama', value: formData.agama },
          { label: 'Sekolah Tujuan', value: selectedSchool?.namaSekolah || '-' },
          { label: 'Jalur Pendaftaran', value: selectedJalur?.nama || '-' },
        ],
      },
      {
        title: 'Data Orang Tua',
        step: 2,
        icon: <User className="size-4" style={{ color: '#43A047' }} />,
        bgColor: '#E8F5E9',
        items: [
          { label: 'Nama Ayah', value: formData.namaAyah },
          { label: 'NIK Ayah', value: formData.nikAyah || '-' },
          { label: 'Pekerjaan Ayah', value: formData.pekerjaanAyah || '-' },
          { label: 'Nama Ibu', value: formData.namaIbu },
          { label: 'NIK Ibu', value: formData.nikIbu || '-' },
          { label: 'Pekerjaan Ibu', value: formData.pekerjaanIbu || '-' },
          { label: 'No HP Ortu', value: formData.noHpOrtu },
        ],
      },
      {
        title: 'Data Tambahan',
        step: 3,
        icon: <MapPin className="size-4" style={{ color: '#009688' }} />,
        bgColor: '#E0F2F1',
        items: [
          { label: 'Alamat', value: formData.alamat },
          { label: 'Desa/Kelurahan', value: formData.desa },
          { label: 'Kecamatan', value: formData.kecamatan },
          { label: 'Kartu Keluarga', value: formData.dokumenKK ? '✓ Diupload' : '✗ Belum' },
          { label: 'Akta Kelahiran', value: formData.dokumenAkta ? '✓ Diupload' : '✗ Belum' },
          { label: 'KTP Orang Tua', value: formData.dokumenKTP ? '✓ Diupload' : '✗ Belum' },
          { label: 'KIP/KKS/PKH', value: formData.dokumenKIP ? '✓ Diupload' : '-' },
          { label: 'Dokumen Pendukung', value: formData.dokumenPendukung ? '✓ Diupload' : '-' },
        ],
      },
    ];

    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="space-y-4"
      >
        {sections.map((section) => (
          <div
            key={section.step}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <div
              className="flex items-center justify-between px-4 py-3"
              style={{ backgroundColor: section.bgColor }}
            >
              <div className="flex items-center gap-2">
                {section.icon}
                <h3 className="text-sm font-semibold" style={{ color: '#1F2937' }}>
                  {section.title}
                </h3>
              </div>
              <button
                onClick={() => handleGoToStep(section.step)}
                className="text-xs font-medium px-3 py-1 rounded-lg"
                style={{ backgroundColor: '#FFFFFF', color: '#1565C0' }}
              >
                Edit
              </button>
            </div>
            <div className="p-4 space-y-2">
              {section.items.map((item, i) => (
                <div key={i} className="flex justify-between items-start">
                  <span className="text-xs" style={{ color: '#6B7280' }}>
                    {item.label}
                  </span>
                  <span
                    className="text-xs font-medium text-right max-w-[60%]"
                    style={{ color: '#1F2937' }}
                  >
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          className="w-full h-14 rounded-xl text-white text-base font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg"
          style={{ backgroundColor: '#43A047' }}
        >
          <ClipboardCheck className="size-5" />
          Kirim Pendaftaran
        </button>
      </motion.div>
    );
  };

  // Success view after submission
  const renderSuccess = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center px-4 py-8"
    >
      <div
        className="w-full max-w-sm rounded-2xl p-6 text-center shadow-lg"
        style={{
          background: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)',
          border: '1px solid #A5D6A7',
        }}
      >
        <div
          className="flex items-center justify-center size-20 rounded-full mx-auto mb-4"
          style={{ backgroundColor: '#43A047' }}
        >
          <CheckCircle className="size-10 text-white" />
        </div>

        <h2
          className="text-xl font-bold mb-2"
          style={{ color: '#2E7D32' }}
        >
          Pendaftaran Berhasil!
        </h2>

        <p className="text-sm mb-4" style={{ color: '#388E3C' }}>
          Data pendaftaran Anda telah berhasil dikirim.
        </p>

        <div
          className="rounded-xl p-4 mb-6"
          style={{ backgroundColor: '#FFFFFF', border: '1px solid #C8E6C9' }}
        >
          <p className="text-xs mb-1" style={{ color: '#6B7280' }}>
            Nomor Registrasi
          </p>
          <p
            className="text-lg font-bold tracking-wider"
            style={{ color: '#1565C0' }}
          >
            {nomorRegistrasi}
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => {
              // Demo: show alert
              alert('Bukti pendaftaran akan diunduh (demo)');
            }}
            className="w-full h-12 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            style={{
              backgroundColor: '#FFFFFF',
              color: '#1565C0',
              border: '2px solid #1565C0',
            }}
          >
            <Download className="size-4" />
            Unduh Bukti Daftar
          </button>

          <button
            onClick={() => {
              resetRegistration();
              setSubmitted(false);
              navigateTo('status-daftar');
            }}
            className="w-full h-12 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            style={{ backgroundColor: '#1565C0' }}
          >
            <Search className="size-4" />
            Cek Status
          </button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#F3F8FF' }}>
      <SpmbHeader
        title="Pendaftaran Siswa Baru"
        showBack
        onBack={() => {
          if (registrationStep > 1 && !submitted) {
            handlePrev();
          } else {
            resetRegistration();
            setSubmitted(false);
            navigateTo('beranda');
          }
        }}
      />

      <div className="flex-1 overflow-y-auto px-4 py-4 pb-4">
        {submitted ? (
          renderSuccess()
        ) : (
          <>
            {renderStepper()}

            <AnimatePresence mode="wait">
              {registrationStep === 1 && <div key="step1">{renderStep1()}</div>}
              {registrationStep === 2 && <div key="step2">{renderStep2()}</div>}
              {registrationStep === 3 && <div key="step3">{renderStep3()}</div>}
              {registrationStep === 4 && <div key="step4">{renderStep4()}</div>}
            </AnimatePresence>

            {/* Navigation buttons */}
            {registrationStep < 4 && (
              <div className="flex gap-3 mt-4">
                {registrationStep > 1 && (
                  <button
                    onClick={handlePrev}
                    className="flex-1 h-12 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                    style={{
                      backgroundColor: '#FFFFFF',
                      color: '#6B7280',
                      border: '1px solid #E5E7EB',
                    }}
                  >
                    <ChevronLeft className="size-4" />
                    Sebelumnya
                  </button>
                )}
                <button
                  onClick={handleNext}
                  className="flex-1 h-12 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                  style={{ backgroundColor: '#1565C0' }}
                >
                  Selanjutnya
                  <ChevronRight className="size-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

    </div>
  );
}
