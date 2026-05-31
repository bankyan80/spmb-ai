import { NextRequest, NextResponse } from 'next/server';
import * as admin from 'firebase-admin';

function getAdmin() {
  if (admin.apps.length === 0) {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    if (!projectId) return null;
    try {
      admin.initializeApp({
        projectId,
        credential: admin.credential.applicationDefault(),
      });
    } catch {
      return null;
    }
  }
  return admin;
}

export async function POST(req: NextRequest) {
  try {
    const { uid, password } = await req.json();

    if (!uid || !password || password.length < 6) {
      return NextResponse.json({ error: 'UID dan password (min 6 karakter) diperlukan' }, { status: 400 });
    }

    const fbAdmin = getAdmin();
    if (!fbAdmin) {
      return NextResponse.json({ error: 'Firebase Admin tidak tersedia' }, { status: 503 });
    }

    await fbAdmin.auth().updateUser(uid, { password });
    await fbAdmin.auth().setCustomUserClaims(uid, { mustChangePassword: false });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Gagal mengubah password';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
