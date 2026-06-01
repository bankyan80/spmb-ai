'use client';

import React, { useEffect } from 'react';
import { useSpmbStore } from '@/lib/store';
import { SplashPage } from '@/components/spmb/splash-page';
import { PilihanAksesPage } from '@/components/spmb/pilihan-akses-page';
import { ParentHomePage } from '@/components/spmb/parent/parent-home-page';
import { ChatAiPage } from '@/components/spmb/parent/chat-ai-page';
import { InfoPendaftaranPage } from '@/components/spmb/parent/info-pendaftaran-page';
import { CekUsiaPage } from '@/components/spmb/parent/cek-usia-page';
import { CekDomisiliPage } from '@/components/spmb/parent/cek-domisili-page';
import { RegistrationPage } from '@/components/spmb/parent/registration-page';
import { StatusDaftarPage } from '@/components/spmb/parent/status-daftar-page';
import { PengumumanPage } from '@/components/spmb/parent/pengumuman-page';
import { DaftarUlangPage } from '@/components/spmb/parent/daftar-ulang-page';
import { BantuanPage } from '@/components/spmb/parent/bantuan-page';
import { PetugasLoginPage } from '@/components/spmb/operator/petugas-login-page';
import { UbahPasswordPage } from '@/components/spmb/operator/ubah-password-page';
import { OperatorApplicantsPage } from '@/components/spmb/operator/operator-applicants-page';
import { ApplicantDetailPage } from '@/components/spmb/operator/applicant-detail-page';
import { VerificationPage } from '@/components/spmb/operator/verification-page';
import { AdminDashboardPage } from '@/components/spmb/admin/admin-dashboard-page';
import { SchoolManagementPage } from '@/components/spmb/admin/school-management-page';
import { QuotaManagementPage } from '@/components/spmb/admin/quota-management-page';
import { ScheduleManagementPage } from '@/components/spmb/admin/schedule-management-page';
import { RequirementManagementPage } from '@/components/spmb/admin/requirement-management-page';
import { AnnouncementManagementPage } from '@/components/spmb/admin/announcement-management-page';
import { PromptAiManagementPage } from '@/components/spmb/admin/prompt-ai-management-page';
import { ChatAiSettingsPage } from '@/components/spmb/admin/chat-ai-settings-page';
import { OperatorAccountPage } from '@/components/spmb/admin/operator-account-page';
import { RekapPage } from '@/components/spmb/admin/rekap-page';
import { AdminLayout } from '@/components/spmb/shared/admin-layout';
import { OperatorLayout } from '@/components/spmb/shared/operator-layout';

// Parent/orang tua pages - mobile-only view
const PARENT_PAGES = new Set([
  'beranda',
  'chat-ai',
  'info-pendaftaran',
  'cek-usia',
  'cek-domisili',
  'registration',
  'status-daftar',
  'pengumuman',
  'daftar-ulang',
  'bantuan',
]);

// Admin pages - use AdminLayout with dark blue sidebar
const ADMIN_PAGES = new Set([
  'admin-dashboard',
  'school-management',
  'operator-applicants',
  'quota-management',
  'schedule-management',
  'requirement-management',
  'announcement-management',
  'prompt-ai-management',
  'chat-ai-settings',
  'operator-account',
  'rekap',
]);

// Operator pages - use OperatorLayout with teal sidebar
const OPERATOR_PAGES = new Set([
  'operator-applicants',
  'applicant-detail',
  'verification',
]);

export default function Home() {
  const currentPage = useSpmbStore((s) => s.currentPage);
  const currentUser = useSpmbStore((s) => s.currentUser);
  const initApp = useSpmbStore((s) => s.initApp);

  useEffect(() => { initApp(); }, [initApp]);

  const isAdminUser = currentUser?.role === 'admin';
  const isOperatorUser = currentUser?.role === 'operator';

  const renderPage = () => {
    switch (currentPage) {
      // Entry
      case 'splash':
        return <SplashPage />;

      case 'pilihan-akses':
        return <PilihanAksesPage />;

      // Beranda
      case 'beranda':
        return <ParentHomePage />;

      // Parent pages
      case 'chat-ai':
        return <ChatAiPage />;
      case 'info-pendaftaran':
        return <InfoPendaftaranPage />;
      case 'cek-usia':
        return <CekUsiaPage />;
      case 'cek-domisili':
        return <CekDomisiliPage />;
      case 'registration':
        return <RegistrationPage />;
      case 'status-daftar':
        return <StatusDaftarPage />;
      case 'pengumuman':
        return <PengumumanPage />;
      case 'daftar-ulang':
        return <DaftarUlangPage />;
      case 'bantuan':
        return <BantuanPage />;

      // Login
      case 'petugas-login':
        return <PetugasLoginPage />;
      case 'ubah-password':
        return <UbahPasswordPage />;

      // Operator & Admin shared pages
      case 'operator-applicants':
        return <OperatorApplicantsPage />;
      case 'applicant-detail':
        return <ApplicantDetailPage />;
      case 'verification':
        return <VerificationPage />;

      // Admin pages
      case 'admin-dashboard':
        return <AdminDashboardPage />;
      case 'school-management':
        return <SchoolManagementPage />;
      case 'quota-management':
        return <QuotaManagementPage />;
      case 'schedule-management':
        return <ScheduleManagementPage />;
      case 'requirement-management':
        return <RequirementManagementPage />;
      case 'announcement-management':
        return <AnnouncementManagementPage />;
      case 'prompt-ai-management':
        return <PromptAiManagementPage />;
      case 'chat-ai-settings':
        return <ChatAiSettingsPage />;
      case 'operator-account':
        return <OperatorAccountPage />;
      case 'rekap':
        return <RekapPage />;

      default:
        return <SplashPage />;
    }
  };

  // Determine layout wrapper
  const isParentPage = PARENT_PAGES.has(currentPage);

  // Admin layout: when an admin user is on any admin page OR on operator pages (applicant-detail, verification, operator-applicants)
  const useAdminLayout = isAdminUser && (
    ADMIN_PAGES.has(currentPage) || OPERATOR_PAGES.has(currentPage)
  );

  // Operator layout: when an operator user is on any operator page
  const useOperatorLayout = isOperatorUser && OPERATOR_PAGES.has(currentPage);

  // Parent & entry pages: mobile-only wrapper
  if (isParentPage || currentPage === 'splash' || currentPage === 'pilihan-akses') {
    return (
      <main className="min-h-screen bg-[#F3F8FF] max-w-[480px] mx-auto shadow-xl">
        {renderPage()}
      </main>
    );
  }

  // Petugas login page: full responsive (no max-w constraint)
  if (currentPage === 'petugas-login') {
    return (
      <main className="min-h-screen bg-[#F3F8FF]">
        {renderPage()}
      </main>
    );
  }

  // Admin layout
  if (useAdminLayout) {
    return (
      <AdminLayout>
        {renderPage()}
      </AdminLayout>
    );
  }

  // Operator layout
  if (useOperatorLayout) {
    return (
      <OperatorLayout>
        {renderPage()}
      </OperatorLayout>
    );
  }

  // Fallback: mobile-only for any unhandled page
  return (
    <main className="min-h-screen bg-[#F3F8FF] max-w-[480px] mx-auto shadow-xl">
      {renderPage()}
    </main>
  );
}
