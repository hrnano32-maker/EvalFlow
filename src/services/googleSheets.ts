import { EvaluationRecord, GoogleSheetConfig } from '../types';

export const SHEET_TAB_NAME = 'บันทึกการประเมินผู้ขาย';

export const HEADERS = [
  'วันที่/เวลาประเมิน',
  'ครั้งที่',
  'ปี',
  'ประจำเดือน',
  'ชื่อบริษัท / ผู้ขาย',
  'ประเภทสินค้า',
  'ที่อยู่',
  'เบอร์โทรศัพท์',
  'ผู้ประสานงาน',
  'คะแนนรวม (เต็ม 100)',
  'เกรด',
  'ผลประเมิน',
  'ข้อ 1 คุณภาพผลิตภัณฑ์ (15)',
  'ข้อ 2 เอกสารตรวจสอบ/ประกัน (5)',
  'ข้อ 3 จำนวนครั้งหลุดรอด (10)',
  'ข้อ 4 ความร่วมมือแก้ปัญหา (5)',
  'ข้อ 5 รบกวนกระบวนการ Q (10)',
  'ข้อ 6 ความถูกต้องผลิตภัณฑ์ (10)',
  'ข้อ 7 สภาพบรรจุหีบห่อ (5)',
  'ข้อ 8 ความถูกต้องเอกสารจัดส่ง (5)',
  'ข้อ 9 ค่าใช้จ่ายพิเศษจัดส่ง (5)',
  'ข้อ 10 ส่งมอบตามแผนเรียกเข้า (10)',
  'ข้อ 11 ตอบกลับเอกสาร PO (5)',
  'ข้อ 12 ตอบกลับแผนเรียกเข้า (5)',
  'ข้อ 13 ควบคุมภายนอก/สถานะพิเศษ (5)',
  'ข้อ 14 เคลมคืนผู้ใช้พาหนะ (5)',
  'เจ้าหน้าที่จัดซื้อ',
  'ประกันคุณภาพ',
  'เจ้าหน้าที่สโตร์',
  'ผู้จัดการฝ่ายจัดซื้อ',
  'หมายเหตุเพิ่มเติม',
];

/**
 * Creates a formatted evaluation Google Sheet in user's Google Drive
 */
export async function createEvaluationSpreadsheet(
  accessToken: string,
  title: string = 'แบบประเมินผู้ขาย_Supplier_Evaluations'
): Promise<GoogleSheetConfig> {
  const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title,
      },
      sheets: [
        {
          properties: {
            title: SHEET_TAB_NAME,
            gridProperties: {
              frozenRowCount: 1,
            },
          },
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `สร้าง Google Sheets ไม่สำเร็จ: ${errorData?.error?.message || response.statusText}`
    );
  }

  const data = await response.json();
  const spreadsheetId = data.spreadsheetId;
  const spreadsheetUrl = data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  // Write Header row
  await writeHeadersToSheet(accessToken, spreadsheetId, SHEET_TAB_NAME);

  return {
    spreadsheetId,
    spreadsheetTitle: title,
    spreadsheetUrl,
    sheetName: SHEET_TAB_NAME,
  };
}

/**
 * Write Headers and format the sheet header row
 */
export async function writeHeadersToSheet(
  accessToken: string,
  spreadsheetId: string,
  sheetName: string = SHEET_TAB_NAME
): Promise<void> {
  const range = `${sheetName}!A1:AE1`;
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
      range
    )}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        range,
        majorDimension: 'ROWS',
        values: [HEADERS],
      }),
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(`เขียนหัวตารางไม่สำเร็จ: ${err?.error?.message || response.statusText}`);
  }
}

/**
 * Append an evaluation record to Google Sheets
 */
export async function appendEvaluationToSheet(
  accessToken: string,
  spreadsheetId: string,
  record: EvaluationRecord,
  sheetName: string = SHEET_TAB_NAME
): Promise<{ updatedRange: string; updatedRows: number }> {
  const criteriaMap = new Map<number, number>();
  record.criteria.forEach((c) => criteriaMap.set(c.id, c.score));

  const rowData = [
    record.timestamp,
    record.supplier.evaluationRound,
    record.supplier.evaluationYear,
    record.supplier.evaluationMonth,
    record.supplier.companyName,
    record.supplier.productType,
    record.supplier.businessAddress,
    record.supplier.phone,
    record.supplier.coordinatorName,
    record.totalScore,
    record.grade,
    record.isPassed ? 'ผ่านเกณฑ์' : 'ไม่ผ่านเกณฑ์ (ปรับปรุง)',
    criteriaMap.get(1) ?? 0,
    criteriaMap.get(2) ?? 0,
    criteriaMap.get(3) ?? 0,
    criteriaMap.get(4) ?? 0,
    criteriaMap.get(5) ?? 0,
    criteriaMap.get(6) ?? 0,
    criteriaMap.get(7) ?? 0,
    criteriaMap.get(8) ?? 0,
    criteriaMap.get(9) ?? 0,
    criteriaMap.get(10) ?? 0,
    criteriaMap.get(11) ?? 0,
    criteriaMap.get(12) ?? 0,
    criteriaMap.get(13) ?? 0,
    criteriaMap.get(14) ?? 0,
    record.evaluators.purchaserName,
    record.evaluators.qaName,
    record.evaluators.storeOfficerName,
    record.evaluators.purchasingManagerName,
    record.notes || '',
  ];

  const range = `${sheetName}!A:AE`;
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
      range
    )}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        range,
        majorDimension: 'ROWS',
        values: [rowData],
      }),
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(`บันทึกข้อมูลลง Google Sheets ไม่สำเร็จ: ${err?.error?.message || response.statusText}`);
  }

  const result = await response.json();
  return {
    updatedRange: result.updates?.updatedRange || '',
    updatedRows: result.updates?.updatedRows || 1,
  };
}

/**
 * Fetch rows from Google Sheets
 */
export async function fetchEvaluationsFromSheet(
  accessToken: string,
  spreadsheetId: string,
  sheetName: string = SHEET_TAB_NAME
): Promise<any[][]> {
  const range = `${sheetName}!A2:AE500`;
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
      range
    )}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(`ดึงข้อมูลจาก Google Sheets ไม่สำเร็จ: ${err?.error?.message || response.statusText}`);
  }

  const data = await response.json();
  return data.values || [];
}

/**
 * List recent spreadsheets created in Drive
 */
export async function listSpreadsheets(
  accessToken: string
): Promise<Array<{ id: string; name: string; modifiedTime: string }>> {
  const q = encodeURIComponent("mimeType='application/vnd.google-apps.spreadsheet' and trashed=false");
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name,modifiedTime)&pageSize=15&orderBy=modifiedTime desc`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    return [];
  }

  const data = await response.json();
  return data.files || [];
}
