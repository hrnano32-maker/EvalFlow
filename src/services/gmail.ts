import { EvaluationRecord } from '../types';

/**
 * Base64 URL safe encoder that handles UTF-8 correctly
 */
function utf8ToBase64Url(str: string): string {
  const utf8Bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < utf8Bytes.length; i++) {
    binary += String.fromCharCode(utf8Bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Send an evaluation report email via Gmail API
 */
export async function sendEvaluationEmail(
  accessToken: string,
  options: {
    to: string;
    senderEmail?: string;
    record: EvaluationRecord;
    sheetUrl?: string;
  }
): Promise<{ messageId: string }> {
  const { to, senderEmail, record, sheetUrl } = options;

  const subject = `[ผลการประเมินผู้ขาย] ${record.supplier.companyName} ประจำงวด ${record.supplier.evaluationMonth} (เกรด ${record.grade})`;

  const emailBodyHtml = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #1e293b; background-color: #f8fafc; margin: 0; padding: 20px; }
  .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; padding: 24px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
  .header { border-bottom: 2px solid #3b82f6; padding-bottom: 12px; margin-bottom: 20px; }
  .title { font-size: 20px; font-weight: bold; color: #0f172a; margin: 0; }
  .subtitle { font-size: 14px; color: #64748b; margin-top: 4px; }
  .score-badge { display: inline-block; padding: 8px 16px; border-radius: 9999px; font-size: 24px; font-weight: bold; margin: 16px 0; background-color: ${
    record.grade === 'A'
      ? '#ecfdf5; color: #047857; border: 1px solid #a7f3d0;'
      : record.grade === 'B'
      ? '#eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe;'
      : record.grade === 'C'
      ? '#fffbeb; color: #b45309; border: 1px solid #fde68a;'
      : '#fef2f2; color: #b91c1c; border: 1px solid #fecaca;'
  } }
  .table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 14px; }
  .table th, .table td { border: 1px solid #e2e8f0; padding: 8px 12px; text-align: left; }
  .table th { background-color: #f1f5f9; color: #334155; }
  .button { display: inline-block; background-color: #2563eb; color: #ffffff !important; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: 500; margin-top: 20px; }
  .footer { margin-top: 24px; font-size: 12px; color: #94a3b8; text-align: center; }
</style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h2 class="title">ใบแจ้งสรุปผลการประเมินผู้ขาย (Supplier Evaluation)</h2>
      <div class="subtitle">ระบบบันทึกผลการประเมินออนไลน์ เชื่อมโยง Google Sheets อัตโนมัติ</div>
    </div>

    <p><strong>เรียน ผู้เกี่ยวข้อง / ตัวแทนบริษัท ${record.supplier.companyName}</strong></p>
    <p>ขอแจ้งผลการประเมินผลการดำเนินงานของผู้ขาย ประจำรอบที่ <strong>${record.supplier.evaluationRound}</strong> ปี <strong>${record.supplier.evaluationYear}</strong> (${record.supplier.evaluationMonth}) โดยมีรายละเอียดดังนี้:</p>

    <div style="text-align: center;">
      <div class="score-badge">
        คะแนนรวม ${record.totalScore} / 100 &nbsp;|&nbsp; เกรด ${record.grade}
      </div>
      <div style="font-size: 14px; font-weight: bold; color: ${record.isPassed ? '#059669' : '#dc2626'};">
        สถานะ: ${record.isPassed ? '✓ ผ่านเกณฑ์การประเมิน' : '⚠️ ไม่ผ่านเกณฑ์ (ต้องปรับปรุง)'}
      </div>
    </div>

    <table class="table">
      <tr>
        <th style="width: 35%;">ข้อมูลผู้ขาย</th>
        <td>${record.supplier.companyName} (${record.supplier.productType})</td>
      </tr>
      <tr>
        <th>ผู้ประสานงาน</th>
        <td>${record.supplier.coordinatorName} (โทร: ${record.supplier.phone})</td>
      </tr>
      <tr>
        <th>1. ด้านคุณภาพ (45 คะแนน)</th>
        <td><strong>${record.criteria.filter(c => c.category === 'quality').reduce((sum, c) => sum + c.score, 0)}</strong> / 45 คะแนน</td>
      </tr>
      <tr>
        <th>2. ด้านการจัดส่ง (25 คะแนน)</th>
        <td><strong>${record.criteria.filter(c => c.category === 'delivery').reduce((sum, c) => sum + c.score, 0)}</strong> / 25 คะแนน</td>
      </tr>
      <tr>
        <th>3. ด้านส่งมอบ/บริการ (30 คะแนน)</th>
        <td><strong>${record.criteria.filter(c => c.category === 'performance').reduce((sum, c) => sum + c.score, 0)}</strong> / 30 คะแนน</td>
      </tr>
      <tr>
        <th>ผู้ประเมิน</th>
        <td>จัดซื้อ: ${record.evaluators.purchaserName} | QA: ${record.evaluators.qaName} | สโตร์: ${record.evaluators.storeOfficerName}</td>
      </tr>
    </table>

    ${
      sheetUrl
        ? `<div style="text-align: center;"><a href="${sheetUrl}" class="button" target="_blank">เปิดดูข้อมูลใน Google Sheets 📊</a></div>`
        : ''
    }

    <div class="footer">
      เอกสารรหัส FM-PU-006-00 &bull; ส่งผ่านระบบประเมินผู้ขายออนไลน์ Google Workspace Integration
    </div>
  </div>
</body>
</html>
`;

  // Encode in RFC 2822 format with UTF-8 MIME headers
  const utf8Subject = `=?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`;
  const rawEmail = [
    `To: ${to}`,
    senderEmail ? `From: ${senderEmail}` : '',
    `Subject: ${utf8Subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    '',
    emailBodyHtml,
  ]
    .filter(Boolean)
    .join('\r\n');

  const encodedMessage = utf8ToBase64Url(rawEmail);

  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      raw: encodedMessage,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `ส่งอีเมลผ่าน Gmail ไม่สำเร็จ: ${errorData?.error?.message || response.statusText}`
    );
  }

  const result = await response.json();
  return { messageId: result.id };
}
