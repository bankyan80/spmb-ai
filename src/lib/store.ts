// SPMB SD 2026/2027 - Zustand Store

import { create } from 'zustand';
import { AppPage, UserRole, User, Applicant, ChatMessage, ParentAccess, ChatAISettings, ChatStatusIndicator } from './types';
import { mockSchools, mockApplicants, mockSettings, mockUsers, mockAnnouncements } from './mock-data';
import type { School, SettingsSPMB, Announcement } from './types';

const DEFAULT_CHAT_AI_SETTINGS: ChatAISettings = {
  id: 'default',
  modelAI: 'gemini-2.0-flash',
  aktifkanGoogleSearch: true,
  aktifkanSlowTyping: true,
  kecepatanTyping: 'normal',
  maksimalHasilGoogle: 5,
  sumberUtama: 'data_aplikasi',
  sumberTambahan: 'google_search',
  systemPrompt: null,
  pesanFallback: 'Maaf, saya tidak dapat memproses pertanyaan Anda saat ini. Silakan coba lagi atau hubungi panitia SPMB.',
  updatedAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
};

interface SpmbState {
  // Navigation
  currentPage: AppPage;
  previousPage: AppPage | null;
  navigateTo: (page: AppPage) => void;
  goBack: () => void;

  // Auth
  currentUser: User | null;
  parentAccess: ParentAccess | null;
  isAuthenticated: boolean;
  authToken: string | null;
  setAuthToken: (token: string | null) => void;

  // Data
  schools: School[];
  applicants: Applicant[];
  settings: SettingsSPMB;
  announcements: Announcement[];
  users: User[];
  selectedApplicant: Applicant | null;

  // Chat
  chatMessages: ChatMessage[];
  chatAISettings: ChatAISettings;
  chatStatusIndicator: ChatStatusIndicator;
  chatSkipAnimation: boolean;

  // Registration
  registrationStep: number;
  registrationData: Partial<Applicant>;

  // Filters
  filterSekolah: string;
  filterJalur: string;
  filterStatus: string;
  filterStatusBerkas: string;
  filterTanggal: string;
  searchKeyword: string;

  // Actions
  loginWithGoogle: (email: string) => boolean;
  loginParent: (identifier: string, type: 'hp' | 'nik' | 'noreg') => boolean;
  verifyOtp: (otp: string) => boolean;
  logout: () => void;
  setParentAccess: (data: ParentAccess) => void;

  // Applicant actions
  addApplicant: (applicant: Applicant) => void;
  updateApplicant: (id: string, updates: Partial<Applicant>) => void;
  setSelectedApplicant: (applicant: Applicant | null) => void;
  verifyApplicant: (id: string, status: string, catatan: string) => void;

  // Chat actions
  addChatMessage: (message: ChatMessage) => void;
  updateChatMessage: (id: string, updates: Partial<ChatMessage>) => void;
  clearChat: () => void;
  setChatAISettings: (settings: Partial<ChatAISettings>) => void;
  setChatStatusIndicator: (status: ChatStatusIndicator) => void;
  setChatSkipAnimation: (skip: boolean) => void;

  // Registration actions
  setRegistrationStep: (step: number) => void;
  updateRegistrationData: (data: Partial<Applicant>) => void;
  resetRegistration: () => void;

  // Filter actions
  setFilterSekolah: (val: string) => void;
  setFilterJalur: (val: string) => void;
  setFilterStatus: (val: string) => void;
  setFilterStatusBerkas: (val: string) => void;
  setFilterTanggal: (val: string) => void;
  setSearchKeyword: (val: string) => void;
  resetFilters: () => void;

  // Admin actions
  updateSchool: (id: string, updates: Partial<School>) => void;
  updateSettings: (updates: Partial<SettingsSPMB>) => void;
  addAnnouncement: (announcement: Announcement) => void;
  updateAnnouncement: (id: string, updates: Partial<Announcement>) => void;
  addSchool: (school: School) => void;
  addUser: (user: User) => void;

  // Status daftar ulang
  reRegistrationStatus: Record<string, string>;
  submitReRegistration: (applicantId: string) => void;
}

export const useSpmbStore = create<SpmbState>((set, get) => ({
  // Navigation
  currentPage: 'beranda',
  previousPage: null,
  navigateTo: (page) =>
    set((state) => ({
      previousPage: state.currentPage,
      currentPage: page,
    })),
  goBack: () =>
    set((state) => ({
      currentPage: state.previousPage || 'beranda',
      previousPage: null,
    })),

  // Auth
  currentUser: null,
  parentAccess: null,
  isAuthenticated: false,
  authToken: null,
  setAuthToken: (token) => set({ authToken: token }),

  // Data
  schools: mockSchools,
  applicants: mockApplicants,
  settings: mockSettings,
  announcements: mockAnnouncements,
  users: mockUsers,
  selectedApplicant: null,

  // Chat
  chatMessages: [
    {
      id: '1',
      role: 'ai',
      content: 'Halo Bapak/Ibu, ada yang bisa saya bantu terkait SPMB SD?',
      timestamp: new Date().toISOString(),
      typingMode: 'instant',
      typingSpeed: 'normal',
      sourceType: 'data_aplikasi',
      model: 'gemini-2.0-flash',
    },
  ],
  chatAISettings: DEFAULT_CHAT_AI_SETTINGS,
  chatStatusIndicator: null,
  chatSkipAnimation: false,

  // Registration
  registrationStep: 1,
  registrationData: {},

  // Filters
  filterSekolah: 'semua',
  filterJalur: 'semua',
  filterStatus: 'semua',
  filterStatusBerkas: 'semua',
  filterTanggal: '',
  searchKeyword: '',

  // Actions
  loginWithGoogle: (email) => {
    const user = mockUsers.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.statusAktif
    );
    if (user) {
      set({ currentUser: user, isAuthenticated: true });
      if (user.mustChangePassword) {
        get().navigateTo('ubah-password');
      } else if (user.role === 'operator') {
        get().navigateTo('operator-applicants');
      } else {
        get().navigateTo('admin-dashboard');
      }
      return true;
    }
    return false;
  },

  loginParent: (identifier, type) => {
    let found = false;
    if (type === 'hp') {
      found = mockApplicants.some((a) => a.noHpOrtu === identifier);
    } else if (type === 'nik') {
      found = mockApplicants.some((a) => a.nik === identifier);
    } else if (type === 'noreg') {
      found = mockApplicants.some((a) => a.nomorPendaftaran === identifier);
    }

    if (found || identifier.length >= 5) {
      const applicant = mockApplicants.find((a) => {
        if (type === 'hp') return a.noHpOrtu === identifier;
        if (type === 'nik') return a.nik === identifier;
        if (type === 'noreg') return a.nomorPendaftaran === identifier;
        return false;
      });

      set({
        parentAccess: {
          parentId: `parent-${Date.now()}`,
          namaOrangTua: applicant?.namaAyah || 'Orang Tua',
          noHp: type === 'hp' ? identifier : applicant?.noHpOrtu || '',
          nikSiswa: type === 'nik' ? identifier : applicant?.nik || '',
          applicantId: applicant?.applicantId || '',
          lastLogin: new Date().toISOString(),
        },
        isAuthenticated: true,
      });
      return true;
    }
    return false;
  },

  verifyOtp: (_otp) => {
    // Simple OTP verification - always succeeds for demo
    set({ isAuthenticated: true });
    get().navigateTo('beranda');
    return true;
  },

  logout: () => {
    set({
      currentUser: null,
      parentAccess: null,
      isAuthenticated: false,
    });
    get().navigateTo('beranda');
  },

  setParentAccess: (data) => set({ parentAccess: data }),

  clearMustChangePassword: () => {
    const user = get().currentUser;
    if (user) {
      set({ currentUser: { ...user, mustChangePassword: false } });
      if (user.role === 'operator') {
        get().navigateTo('operator-applicants');
      } else {
        get().navigateTo('admin-dashboard');
      }
    }
  },

  // Applicant actions
  addApplicant: (applicant) =>
    set((state) => ({
      applicants: [...state.applicants, applicant],
    })),

  updateApplicant: (id, updates) =>
    set((state) => ({
      applicants: state.applicants.map((a) =>
        a.applicantId === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a
      ),
    })),

  setSelectedApplicant: (applicant) => set({ selectedApplicant: applicant }),

  verifyApplicant: (id, status, catatan) =>
    set((state) => ({
      applicants: state.applicants.map((a) =>
        a.applicantId === id
          ? {
              ...a,
              statusPendaftaran: status as Applicant['statusPendaftaran'],
              catatanOperator: catatan,
              updatedAt: new Date().toISOString(),
            }
          : a
      ),
      selectedApplicant:
        state.selectedApplicant?.applicantId === id
          ? {
              ...state.selectedApplicant,
              statusPendaftaran: status as Applicant['statusPendaftaran'],
              catatanOperator: catatan,
              updatedAt: new Date().toISOString(),
            }
          : state.selectedApplicant,
    })),

  // Chat actions
  addChatMessage: (message) =>
    set((state) => ({
      chatMessages: [...state.chatMessages, message],
    })),

  updateChatMessage: (id, updates) =>
    set((state) => ({
      chatMessages: state.chatMessages.map((m) =>
        m.id === id ? { ...m, ...updates } : m
      ),
    })),

  clearChat: () =>
    set({
      chatMessages: [
        {
          id: '1',
          role: 'ai',
          content: 'Halo Bapak/Ibu, ada yang bisa saya bantu terkait SPMB SD?',
          timestamp: new Date().toISOString(),
          typingMode: 'instant',
          typingSpeed: 'normal',
          sourceType: 'data_aplikasi',
          model: 'gemini-2.0-flash',
        },
      ],
      chatStatusIndicator: null,
    }),

  setChatAISettings: (settings) =>
    set((state) => ({
      chatAISettings: { ...state.chatAISettings, ...settings },
    })),

  setChatStatusIndicator: (status) => set({ chatStatusIndicator: status }),

  setChatSkipAnimation: (skip) => set({ chatSkipAnimation: skip }),

  // Registration actions
  setRegistrationStep: (step) => set({ registrationStep: step }),

  updateRegistrationData: (data) =>
    set((state) => ({
      registrationData: { ...state.registrationData, ...data },
    })),

  resetRegistration: () => set({ registrationStep: 1, registrationData: {} }),

  // Filter actions
  setFilterSekolah: (val) => set({ filterSekolah: val }),
  setFilterJalur: (val) => set({ filterJalur: val }),
  setFilterStatus: (val) => set({ filterStatus: val }),
  setFilterStatusBerkas: (val) => set({ filterStatusBerkas: val }),
  setFilterTanggal: (val) => set({ filterTanggal: val }),
  setSearchKeyword: (val) => set({ searchKeyword: val }),
  resetFilters: () =>
    set({
      filterSekolah: 'semua',
      filterJalur: 'semua',
      filterStatus: 'semua',
      filterStatusBerkas: 'semua',
      filterTanggal: '',
      searchKeyword: '',
    }),

  // Admin actions
  updateSchool: (id, updates) =>
    set((state) => ({
      schools: state.schools.map((s) =>
        s.schoolId === id ? { ...s, ...updates } : s
      ),
    })),

  updateSettings: (updates) =>
    set((state) => ({
      settings: { ...state.settings, ...updates, updatedAt: new Date().toISOString() },
    })),

  addAnnouncement: (announcement) =>
    set((state) => ({
      announcements: [...state.announcements, announcement],
    })),

  updateAnnouncement: (id, updates) =>
    set((state) => ({
      announcements: state.announcements.map((a) =>
        a.announcementId === id ? { ...a, ...updates } : a
      ),
    })),

  addSchool: (school) =>
    set((state) => ({
      schools: [...state.schools, school],
    })),

  addUser: (user) =>
    set((state) => ({
      users: [...state.users, user],
    })),

  // Re-registration
  reRegistrationStatus: {},

  submitReRegistration: (applicantId) =>
    set((state) => ({
      reRegistrationStatus: {
        ...state.reRegistrationStatus,
        [applicantId]: 'menunggu_verifikasi',
      },
      applicants: state.applicants.map((a) =>
        a.applicantId === applicantId
          ? { ...a, statusPendaftaran: 'sudah_daftar_ulang' }
          : a
      ),
    })),
}));
