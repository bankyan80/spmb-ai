import { google, sheets_v4 } from 'googleapis';
import { JWT } from 'google-auth-library';

let sheetsClient: sheets_v4.Sheets | null = null;
let sheetsError: string | null = null;

function getSheets(): sheets_v4.Sheets | null {
  if (sheetsClient) return sheetsClient;
  if (sheetsError) return null;

  const key = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!key) { sheetsError = 'Missing GOOGLE_SERVICE_ACCOUNT_KEY'; return null; }

  let credentials: { client_email: string; private_key: string };
  try {
    credentials = JSON.parse(key);
  } catch {
    try {
      credentials = JSON.parse(Buffer.from(key, 'base64').toString());
    } catch {
      sheetsError = 'Invalid GOOGLE_SERVICE_ACCOUNT_KEY';
      return null;
    }
  }

  try {
    const auth = new JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    sheetsClient = google.sheets({ version: 'v4', auth });
    return sheetsClient;
  } catch {
    sheetsError = 'Failed to initialize Google Sheets client';
    return null;
  }
}

const SPREADSHEET_ID = (): string | null => {
  const id = process.env.GOOGLE_SPREADSHEET_ID;
  if (!id) return null;
  return id;
};

export interface ColumnDef {
  field: string;
  type: 'string' | 'number' | 'boolean' | 'date';
}

export class SheetTable<T extends Record<string, unknown>> {
  private sheetName: string;
  public columns: ColumnDef[];

  constructor(sheetName: string, columns: ColumnDef[]) {
    this.sheetName = sheetName;
    this.columns = columns;
  }

  get headers(): string[] {
    return this.columns.map((c) => c.field);
  }

  private async getDataRange(): Promise<{ values: string[][]; headers: string[] }> {
    const sheets = getSheets();
    if (!sheets) return { values: [], headers: this.headers };
    const id = SPREADSHEET_ID();
    if (!id) return { values: [], headers: this.headers };
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: id,
      range: `${this.sheetName}!A:ZZ`,
      valueRenderOption: 'FORMATTED_VALUE',
    });
    const values = res.data.values || [];
    const headers = values.length > 0 ? values[0] : this.headers;
    return { values, headers };
  }

  private rowToObj(row: string[], headers: string[]): T {
    const obj: Record<string, unknown> = {};
    for (const col of this.columns) {
      const idx = headers.indexOf(col.field);
      if (idx === -1) continue;
      obj[col.field] = this.fromCell(row[idx], col);
    }
    return obj as T;
  }

  private objToRow(data: Record<string, unknown>): string[] {
    return this.headers.map((h) => {
      const col = this.columns.find((c) => c.field === h);
      return this.toCell(data[h], col);
    });
  }

  private fromCell(value: string | undefined, col: ColumnDef): unknown {
    if (value === undefined || value === '') {
      if (col.type === 'number') return 0;
      if (col.type === 'boolean') return false;
      return null;
    }
    if (col.type === 'number') {
      const n = parseFloat(value.replace(/,/g, ''));
      return isNaN(n) ? 0 : n;
    }
    if (col.type === 'boolean') return value === 'true' || value === 'TRUE' || value === '1';
    if (col.type === 'date') return value;
    return value;
  }

  private toCell(value: unknown, _col?: ColumnDef): string {
    if (value === null || value === undefined) return '';
    if (typeof value === 'boolean') return value ? 'true' : 'false';
    return String(value);
  }

  async findAll(): Promise<T[]> {
    const { values, headers } = await this.getDataRange();
    if (values.length < 2) return [];
    return values.slice(1).filter((r) => r.some((c) => c)).map((r) => this.rowToObj(r, headers));
  }

  async findById(id: string, idField?: string): Promise<T | null> {
    const records = await this.findAll();
    const key = idField || this.columns[0]?.field || 'id';
    return records.find((r) => (r as Record<string, unknown>)[key] === id) || null;
  }

  async find(filter: Partial<T>): Promise<T[]> {
    const records = await this.findAll();
    const keys = Object.keys(filter) as (keyof T)[];
    return records.filter((r) => keys.every((k) => (r as Record<string, unknown>)[k as string] === filter[k]));
  }

  async findFirst(filter: Partial<T>): Promise<T | null> {
    const results = await this.find(filter);
    return results[0] || null;
  }

  async count(): Promise<number> {
    const records = await this.findAll();
    return records.length;
  }

  async create(data: T): Promise<T | null> {
    const sheets = getSheets();
    if (!sheets) return null;
    const id = SPREADSHEET_ID();
    if (!id) return null;
    const row = this.objToRow(data as Record<string, unknown>);
    await sheets.spreadsheets.values.append({
      spreadsheetId: id,
      range: `${this.sheetName}!A:A`,
      valueInputOption: 'RAW',
      requestBody: { values: [row] },
    });
    return data;
  }

  async update(id: string, data: Partial<T>, idField?: string): Promise<T | null> {
    const sheets = getSheets();
    if (!sheets) return null;
    const id2 = SPREADSHEET_ID();
    if (!id2) return null;
    const { values, headers } = await this.getDataRange();
    if (values.length < 2) return null;
    const key = idField || this.columns[0]?.field || 'id';
    const idIdx = headers.indexOf(key);
    if (idIdx === -1) throw new Error(`Field "${key}" not found in sheet "${this.sheetName}"`);

    const dataRowIdx = values.slice(1).findIndex((r) => r[idIdx] === id);
    if (dataRowIdx === -1) return null;

    const sheetRowNum = dataRowIdx + 2;
    const existing = this.rowToObj(values[dataRowIdx + 1], headers);
    const merged = { ...existing, ...data } as Record<string, unknown>;
    const newRow = this.objToRow(merged);

    await sheets.spreadsheets.values.update({
      spreadsheetId: id2,
      range: `${this.sheetName}!A${sheetRowNum}`,
      valueInputOption: 'RAW',
      requestBody: { values: [newRow] },
    });
    return merged as T;
  }

  async delete(id: string, idField?: string): Promise<boolean> {
    const sheets = getSheets();
    if (!sheets) return false;
    const id2 = SPREADSHEET_ID();
    if (!id2) return false;
    const { values, headers } = await this.getDataRange();
    if (values.length < 2) return false;
    const key = idField || this.columns[0]?.field || 'id';
    const idIdx = headers.indexOf(key);
    if (idIdx === -1) return false;

    const dataRowIdx = values.slice(1).findIndex((r) => r[idIdx] === id);
    if (dataRowIdx === -1) return false;

    const sheetRowNum = dataRowIdx + 2;
    await sheets.spreadsheets.values.clear({
      spreadsheetId: id2,
      range: `${this.sheetName}!A${sheetRowNum}:ZZ${sheetRowNum}`,
    });

    if (process.env.GOOGLE_SHEETS_DELETE_ROWS === 'true') {
      try {
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId: id2,
          requestBody: {
            requests: [{
              deleteDimension: {
                range: {
                  sheetId: 0,
                  dimension: 'ROWS',
                  startIndex: sheetRowNum - 1,
                  endIndex: sheetRowNum,
                },
              },
            }],
          },
        });
      } catch {
        // fallback: clear is enough
      }
    }
    return true;
  }

  async upsert(id: string, data: T, idField?: string): Promise<T | null> {
    const existing = await this.findById(id, idField);
    if (existing) {
      await this.update(id, data as Partial<T>, idField);
      return data;
    }
    return this.create(data);
  }
}
