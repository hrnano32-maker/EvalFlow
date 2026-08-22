import React from 'react';
import { EvaluationRecord } from '../types';
import { Printer, ArrowLeft, ExternalLink, Share2 } from 'lucide-react';

interface Props {
  record: EvaluationRecord;
  sheetUrl?: string;
  onBack: () => void;
  onSendEmail: () => void;
}

export const EvaluationPrintView: React.FC<Props> = ({
  record,
  sheetUrl,
  onBack,
  onSendEmail,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const qualityItems = record.criteria.filter((c) => c.category === 'quality');
  const deliveryItems = record.criteria.filter((c) => c.category === 'delivery');
  const performanceItems = record.criteria.filter((c) => c.category === 'performance');

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16 print:space-y-0 print:max-w-full print:p-0 print:m-0 print:pb-0">
      {/* Control Bar (Hidden when printing) */}
      <div className="print:hidden bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center space-x-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>กลับไปหน้าแบบฟอร์ม</span>
        </button>

        <div className="flex items-center gap-2.5 flex-wrap">
          {sheetUrl && (
            <a
              href={sheetUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-2 px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded transition shadow-2xs"
            >
              <span>เปิดดูใน Google Sheets</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}

          <button
            type="button"
            onClick={onSendEmail}
            className="inline-flex items-center space-x-2 px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded transition shadow-2xs"
          >
            <Share2 className="w-4 h-4" />
            <span>ส่งอีเมลแจ้งผล</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center space-x-2 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-700 rounded shadow-md transition"
          >
            <Printer className="w-4 h-4" />
            <span>พิมพ์ / บันทึกเป็น PDF (A4)</span>
          </button>
        </div>
      </div>

      {/* Official Form Document (FM-PU-006-00) - Calibrated to fit full single A4 page */}
      <div className="a4-print-sheet bg-white text-black p-5 sm:p-7 border-2 border-black rounded-none shadow-md print:shadow-none print:border-2 print:border-black text-[11px] leading-snug font-sans min-h-[270mm] print:min-h-0 print:h-[276mm] flex flex-col justify-between">
        {/* Top Section Wrapper */}
        <div className="flex flex-col space-y-2">
          {/* Document Header */}
          <div className="flex justify-between items-center border-b-2 border-black pb-2">
            <div className="flex items-center gap-3.5">
              <div className="border-2 border-black rounded-full px-4 py-1 text-base font-black tracking-widest uppercase">
                NANO
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight leading-none">ใบประเมินผู้ขาย</h1>
                <p className="text-[10.5px] text-gray-700 font-semibold tracking-wider mt-0.5">SUPPLIER EVALUATION FORM</p>
              </div>
            </div>

            <div className="text-right leading-tight">
              <div className="text-sm font-bold">
                ประเมิน ครั้งที่ : <span className="inline-block border-b border-dotted border-black px-2 min-w-[30px] text-center">{record.supplier.evaluationRound || '-'}</span> &nbsp;&nbsp; ปี : <span className="inline-block border-b border-dotted border-black px-2 min-w-[38px] text-center">{record.supplier.evaluationYear || '69'}</span>
              </div>
              <div className="text-xs text-gray-700 mt-1">
                ประจำเดือน : <span className="font-bold text-black">{record.supplier.evaluationMonth}</span>
              </div>
            </div>
          </div>

          {/* Supplier Info Table */}
          <table className="w-full border-collapse border border-black text-[11px]">
            <tbody>
              <tr>
                <td className="border border-black px-2.5 py-1.5 font-bold w-[24%] bg-gray-50/80">ชื่อบริษัท / โรงงาน / ห้างหุ้นส่วน :</td>
                <td className="border border-black px-2.5 py-1.5 font-semibold w-[42%]">{record.supplier.companyName}</td>
                <td className="border border-black px-2.5 py-1.5 font-bold w-[18%] bg-gray-50/80">ประเภทสินค้าที่ขาย :</td>
                <td className="border border-black px-2.5 py-1.5 font-semibold">{record.supplier.productType}</td>
              </tr>
              <tr>
                <td className="border border-black px-2.5 py-1.5 font-bold bg-gray-50/80">สถานที่ประกอบการ :</td>
                <td colSpan={3} className="border border-black px-2.5 py-1.5">{record.supplier.businessAddress}</td>
              </tr>
              <tr>
                <td className="border border-black px-2.5 py-1.5 font-bold bg-gray-50/80">เบอร์โทรศัพท์ :</td>
                <td className="border border-black px-2.5 py-1.5">{record.supplier.phone}</td>
                <td className="border border-black px-2.5 py-1.5 font-bold bg-gray-50/80">แฟกซ์ :</td>
                <td className="border border-black px-2.5 py-1.5">{record.supplier.fax || '-'}</td>
              </tr>
              <tr>
                <td className="border border-black px-2.5 py-1.5 font-bold bg-gray-50/80">ชื่อผู้ประสานงาน :</td>
                <td className="border border-black px-2.5 py-1.5 font-medium">{record.supplier.coordinatorName}</td>
                <td className="border border-black px-2.5 py-1.5 font-bold bg-gray-50/80">ตำแหน่ง :</td>
                <td className="border border-black px-2.5 py-1.5">{record.supplier.position || '-'}</td>
              </tr>
            </tbody>
          </table>

          {/* Section Title */}
          <div className="border border-black bg-gray-100 text-center font-bold py-1 text-xs tracking-wider uppercase">
            ✉ ข้อมูลการประเมิน
          </div>

          {/* Criteria Evaluation Table */}
          <table className="w-full border-collapse border border-black text-[10.5px]">
            <thead>
              <tr className="bg-gray-100 font-bold">
                <th className="border border-black px-1.5 py-1 text-center w-[6%]">หัวข้อ</th>
                <th className="border border-black px-2 py-1 text-center w-[54%]">หัวข้อการประเมิน</th>
                <th className="border border-black px-1.5 py-1 text-center w-[10%]">คะแนนเต็ม</th>
                <th className="border border-black px-1.5 py-1 text-center w-[10%]">ค่าที่ได้</th>
                <th className="border border-black px-1.5 py-1 text-center w-[10%]">หมายเหตุ</th>
                <th className="border border-black px-1.5 py-1 text-center w-[10%]">ผู้ประเมิน</th>
              </tr>
            </thead>
            <tbody>
              {/* Category 1: ด้านคุณภาพ */}
              <tr className="bg-gray-50/80 font-bold">
                <td colSpan={6} className="border border-black px-2 py-0.5">ด้านคุณภาพ (45 คะแนน)</td>
              </tr>
              {qualityItems.map((item) => (
                <tr key={item.id}>
                  <td className="border border-black p-0.5 text-center font-medium">{item.id}</td>
                  <td className="border border-black px-2 py-0.5">{item.title}</td>
                  <td className="border border-black p-0.5 text-center font-semibold">{item.maxScore}</td>
                  <td className="border border-black p-0.5 text-center font-bold">{item.score}</td>
                  <td className="border border-black p-0.5 text-center text-[10px]">{item.remark || '-'}</td>
                  <td className="border border-black p-0.5 text-center text-[10px]">{item.evaluator || 'QA'}</td>
                </tr>
              ))}

              {/* Category 2: ด้านการจัดส่ง */}
              <tr className="bg-gray-50/80 font-bold">
                <td colSpan={6} className="border border-black px-2 py-0.5">ด้านการจัดส่ง (25 คะแนน)</td>
              </tr>
              {deliveryItems.map((item) => (
                <tr key={item.id}>
                  <td className="border border-black p-0.5 text-center font-medium">{item.id}</td>
                  <td className="border border-black px-2 py-0.5">{item.title}</td>
                  <td className="border border-black p-0.5 text-center font-semibold">{item.maxScore}</td>
                  <td className="border border-black p-0.5 text-center font-bold">{item.score}</td>
                  <td className="border border-black p-0.5 text-center text-[10px]">{item.remark || '-'}</td>
                  <td className="border border-black p-0.5 text-center text-[10px]">{item.evaluator || 'Store'}</td>
                </tr>
              ))}

              {/* Category 3: ด้านส่งมอบ */}
              <tr className="bg-gray-50/80 font-bold">
                <td colSpan={6} className="border border-black px-2 py-0.5">ด้านส่งมอบ (30 คะแนน)</td>
              </tr>
              {performanceItems.map((item) => (
                <tr key={item.id}>
                  <td className="border border-black p-0.5 text-center font-medium">{item.id}</td>
                  <td className="border border-black px-2 py-0.5">{item.title}</td>
                  <td className="border border-black p-0.5 text-center font-semibold">{item.maxScore}</td>
                  <td className="border border-black p-0.5 text-center font-bold">{item.score}</td>
                  <td className="border border-black p-0.5 text-center text-[10px]">{item.remark || '-'}</td>
                  <td className="border border-black p-0.5 text-center text-[10px]">{item.evaluator || 'จัดซื้อ'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom Section Wrapper */}
        <div className="flex flex-col space-y-2 pt-2">
          {/* Summary Header Row */}
          <div className="border border-black bg-gray-100 text-center font-bold py-1 text-xs tracking-wider uppercase">
            สรุปผลการประเมิน [ คะแนนเต็ม 100 คะแนน ]
          </div>

          {/* Score and Grade Big Box */}
          <div className="border border-black flex text-center text-xs">
            <div className="w-1/4 p-1.5 font-bold border-r border-black flex items-center justify-center bg-gray-50/80">
              คะแนนรวมที่ได้
            </div>
            <div className="w-1/4 p-1.5 text-xl font-black border-r border-black flex items-center justify-center">
              {record.totalScore}
            </div>
            <div className="w-1/4 p-1.5 font-bold border-r border-black flex items-center justify-center bg-gray-50/80">
              คะแนน / เกรด
            </div>
            <div className="w-1/4 p-1.5 text-2xl font-black flex items-center justify-center">
              {record.grade}
            </div>
          </div>

          {/* Grade Breakdown Criteria Box & Pass/Fail Status & Signatures */}
          <div className="border border-black grid grid-cols-12">
            {/* Left: Grade Legend */}
            <div className="col-span-5 border-r border-black p-2 text-[10.5px] space-y-0.5">
              <div className="font-bold border-b border-black pb-1 mb-1">เกณฑ์การตัดเกรด</div>
              <div className="flex justify-between px-1">
                <span>91 - 100</span>
                <span>=</span>
                <span className="font-semibold">A (ดีมาก)</span>
              </div>
              <div className="flex justify-between px-1">
                <span>81 - 90</span>
                <span>=</span>
                <span className="font-semibold">B (ดี)</span>
              </div>
              <div className="flex justify-between px-1">
                <span>71 - 80</span>
                <span>=</span>
                <span className="font-semibold">C (พอใช้)</span>
              </div>
              <div className="flex justify-between px-1">
                <span>0 - 70</span>
                <span>=</span>
                <span className="font-semibold">D* (ปรับปรุง)</span>
              </div>
              <div className="pt-1 text-[9px] text-gray-700 leading-tight">
                * กรณีที่ทางผู้ขาย (Supplier) ได้เกรด D ติดต่อกัน 3 ครั้ง จะถูกดำเนินการออกใบเพิกถอนรายชื่อผู้ขาย AVL
              </div>
            </div>

            {/* Middle: Pass / Fail Checkbox Box */}
            <div className="col-span-3 border-r border-black flex flex-col justify-between">
              <div className="border-b border-black p-1.5 flex items-center justify-between">
                <span className="font-bold text-xs">ผ่านเกณฑ์</span>
                <div className="w-5 h-5 border-2 border-black flex items-center justify-center font-bold text-sm">
                  {record.isPassed ? '✓' : ''}
                </div>
              </div>
              <div className="p-1.5 flex items-center justify-between bg-gray-50/50">
                <span className="font-bold text-xs">ไม่ผ่านเกณฑ์</span>
                <div className="w-5 h-5 border-2 border-black flex items-center justify-center font-bold text-sm">
                  {!record.isPassed ? '✓' : ''}
                </div>
              </div>
              <div className="border-t border-black p-1.5 text-center text-[10px] bg-gray-50/80">
                <div className="border border-dashed border-gray-400 p-1 min-h-[28px] flex items-center justify-center font-medium">
                  {record.evaluators.supplierConfirmName || 'ตัวแทนผู้ขาย'}
                </div>
                <div className="text-[9px] font-bold text-gray-700 mt-0.5">SUPPLIER CONFIRM</div>
              </div>
            </div>

            {/* Right: Evaluator Signatures */}
            <div className="col-span-4 p-2 text-[10px] space-y-1.5 flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-gray-300 pb-0.5">
                <span>( {record.evaluators.purchaserName || 'เจ้าหน้าที่จัดซื้อ'} )</span>
                <span className="text-gray-600 text-[9px]">เจ้าหน้าที่จัดซื้อ</span>
              </div>
              <div className="flex items-center justify-between border-b border-gray-300 pb-0.5">
                <span>( {record.evaluators.qaName || 'ประกันคุณภาพ'} )</span>
                <span className="text-gray-600 text-[9px]">ประกันคุณภาพ</span>
              </div>
              <div className="flex items-center justify-between border-b border-gray-300 pb-0.5">
                <span>( {record.evaluators.storeOfficerName || 'เจ้าหน้าที่สโตร์'} )</span>
                <span className="text-gray-600 text-[9px]">เจ้าหน้าที่สโตร์</span>
              </div>
              <div className="flex items-center justify-between">
                <span>( {record.evaluators.purchasingManagerName || 'ผู้จัดการฝ่ายจัดซื้อ'} )</span>
                <span className="text-gray-700 text-[9px] font-bold">ผู้จัดการฝ่ายจัดซื้อ</span>
              </div>
            </div>
          </div>

          {/* Footer Document Stamp */}
          <div className="flex justify-between items-center text-[10px] text-gray-600 pt-1 border-t border-gray-200">
            <div>บันทึกอัตโนมัติลง Google Sheets • วันที่ออกประเมิน: {record.timestamp}</div>
            <div className="font-mono font-bold text-black">FM-PU-006-00 : 27/03/18</div>
          </div>
        </div>
      </div>
    </div>
  );
};
