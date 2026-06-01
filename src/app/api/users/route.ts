import { NextResponse } from 'next/server';
import { usersTable } from '@/lib/sheet-config';

export async function GET() {
  try {
    let users = await usersTable.findAll();
    users = users.map((u) => ({
      uid: u.uid,
      nama: u.nama,
      email: u.email,
      role: u.role,
      schoolId: u.schoolId || '',
      statusAktif: u.statusAktif !== false,
      mustChangePassword: u.mustChangePassword === true,
      createdAt: u.createdAt || new Date().toISOString(),
    }));

    return NextResponse.json({ success: true, data: users });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
