import { google, drive_v3 } from 'googleapis';
import { JWT } from 'google-auth-library';

let driveClient: drive_v3.Drive | null = null;

function getDrive(): drive_v3.Drive {
  if (driveClient) return driveClient;

  const key = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!key) throw new Error('Missing GOOGLE_SERVICE_ACCOUNT_KEY');

  let credentials: { client_email: string; private_key: string };
  try {
    credentials = JSON.parse(key);
  } catch {
    credentials = JSON.parse(Buffer.from(key, 'base64').toString());
  }

  const auth = new JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: ['https://www.googleapis.com/auth/drive.file'],
  });

  driveClient = google.drive({ version: 'v3', auth });
  return driveClient;
}

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink: string;
  size?: string;
}

const UPLOAD_FOLDER = process.env.GOOGLE_DRIVE_UPLOAD_FOLDER_ID || 'root';

export async function uploadFile(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string,
): Promise<DriveFile> {
  const drive = getDrive();

  const res = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: UPLOAD_FOLDER !== 'root' ? [UPLOAD_FOLDER] : [],
      mimeType,
    },
    media: {
      mimeType,
      body: fileBuffer,
    },
    fields: 'id,name,mimeType,webViewLink,size',
  });

  const file = res.data;
  if (!file.id) throw new Error('Failed to upload file');

  // Make file publicly accessible via link
  try {
    await drive.permissions.create({
      fileId: file.id,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });
  } catch {
    // permission setting may fail; return link anyway
  }

  return {
    id: file.id,
    name: file.name || fileName,
    mimeType: file.mimeType || mimeType,
    webViewLink: file.webViewLink || `https://drive.google.com/file/d/${file.id}/view`,
    size: file.size || undefined,
  };
}

export async function deleteFile(fileId: string): Promise<void> {
  const drive = getDrive();
  await drive.files.delete({ fileId });
}

export async function getFile(fileId: string): Promise<DriveFile | null> {
  const drive = getDrive();
  try {
    const res = await drive.files.get({
      fileId,
      fields: 'id,name,mimeType,webViewLink,size',
    });
    const file = res.data;
    if (!file.id) return null;
    return {
      id: file.id,
      name: file.name || '',
      mimeType: file.mimeType || '',
      webViewLink: file.webViewLink || `https://drive.google.com/file/d/${file.id}/view`,
      size: file.size || undefined,
    };
  } catch {
    return null;
  }
}
