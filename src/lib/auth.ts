import { NextResponse } from 'next/server';
import * as admin from 'firebase-admin';

function getFirebaseAdmin() {
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

export async function verifyAuth(request: Request): Promise<{ uid: string; email: string } | null> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;

  const token = authHeader.slice(7);
  if (!token) return null;

  try {
    const fbAdmin = getFirebaseAdmin();
    if (!fbAdmin) return null;
    const decoded = await fbAdmin.auth().verifyIdToken(token);
    return { uid: decoded.uid, email: decoded.email || '' };
  } catch {
    return null;
  }
}

export function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

export function forbidden() {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
