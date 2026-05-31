import { google, sheets_v4 } from 'googleapis';
import { JWT } from 'google-auth-library';

let sheetsClient: sheets_v4.Sheets | null = null;

function getSheets(): sheets_v4.Sheets {
  if (sheetsClient) return sheetsClient;

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
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  sheetsClient = google.sheets({ version: 'v4', auth });
  return sheetsClient;
}

const SPREADSHEET_ID = () => {
  const id = process.env.GOOGLE_SPREADSHEET_ID;
  if (!id) throw new Error('Missing GOOGLE_SPREADSHEET_ID');
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
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID(),
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

  async create(data: T): Promise<T> {
    const sheets = getSheets();
    const row = this.objToRow(data as Record<string, unknown>);
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID(),
      range: `${this.sheetName}!A:A`,
      valueInputOption: 'RAW',
      requestBody: { values: [row] },
    });
    return data;
  }

  async update(id: string, data: Partial<T>, idField?: string): Promise<T | null> {
    const sheets = getSheets();
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
      spreadsheetId: SPREADSHEET_ID(),
      range: `${this.sheetName}!A${sheetRowNum}`,
      valueInputOption: 'RAW',
      requestBody: { values: [newRow] },
    });
    return merged as T;
  }

  async delete(id: string, idField?: string): Promise<boolean> {
    const sheets = getSheets();
    const { values, headers } = await this.getDataRange();
    if (values.length < 2) return false;
    const key = idField || this.columns[0]?.field || 'id';
    const idIdx = headers.indexOf(key);
    if (idIdx === -1) return false;

    const dataRowIdx = values.slice(1).findIndex((r) => r[idIdx] === id);
    if (dataRowIdx === -1) return false;

    const sheetRowNum = dataRowIdx + 2;
    await sheets.spreadsheets.values.clear({
      spreadsheetId: SPREADSHEET_ID(),
      range: `${this.sheetName}!A${sheetRowNum}:ZZ${sheetRowNum}`,
    });

    if (process.env.GOOGLE_SHEETS_DELETE_ROWS === 'true') {
      try {
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId: SPREADSHEET_ID(),
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

  async upsert(id: string, data: T, idField?: string): Promise<T> {
    const existing = await this.findById(id, idField);
    if (existing) {
      await this.update(id, data as Partial<T>, idField);
      return data;
    }
    return this.create(data);
  }
}
