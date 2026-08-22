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

      {/* Official Form Document (FM-PU-006-00) - Exact layout matching the official template image, scaled to fill A4 */}
      <div className="a4-print-sheet bg-white text-black p-4 sm:p-6 border-2 border-black rounded-none shadow-md print:shadow-none print:border-2 print:border-black text-[11px] leading-snug font-sans">
        {/* Top Header Box (Logo + Title) */}
        <div className="border-2 border-black flex mb-2.5">
          {/* Left: Red NANO Logo */}
          <div className="w-[28%] border-r-2 border-black flex items-center justify-center p-2 bg-white">
            <svg viewBox="0 0 160 65" className="w-32 h-13" aria-label="NANO Logo">
              {/* Outer oval ring */}
              <ellipse cx="80" cy="32.5" rx="74" ry="26" fill="none" stroke="#E11D48" strokeWidth="3" />
              {/* Dynamic curved accent loop */}
              <path
                d="M 14 32 C 30 14, 70 12, 110 20 C 145 27, 150 45, 130 52 C 95 59, 38 54, 18 36"
                fill="none"
                stroke="#E11D48"
                strokeWidth="2.2"
              />
              {/* NANO Text */}
              <text
                x="84"
                y="41"
                textAnchor="middle"
                fill="#E11D48"
                fontSize="23"
                fontWeight="900"
                fontFamily="system-ui, -apple-system, Arial, sans-serif"
                letterSpacing="1.5"
              >
                NANO
              </text>
            </svg>
          </div>

          {/* Right: Title & Evaluation Round */}
          <div className="w-[72%] flex flex-col justify-center items-center py-2.5 text-center">
            <h1 className="text-2xl font-extrabold tracking-wide leading-none text-black">
              ใบประเมินผู้ขาย
            </h1>
            <div className="mt-2 text-sm font-bold text-black flex items-baseline justify-center">
              <span>ประเมิน ครั้งที่</span>
              <span className="inline-block border-b border-dotted border-black min-w-[140px] mx-2 text-center font-bold">
                {record.supplier.evaluationRound ? `${record.supplier.evaluationRound} / ${record.supplier.evaluationYear || '69'}` : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Supplier Info Section with Dotted Lines */}
        <div className="space-y-2 py-1 text-[11px]">
          {/* Row 1 */}
          <div className="flex items-baseline justify-between gap-4">
            <div className="flex items-baseline flex-1 min-w-0">
              <span className="font-bold whitespace-nowrap">ชื่อบริษัท / โรงงาน / ห้างหุ้นส่วน :</span>
              <span className="flex-1 border-b border-dotted border-black ml-1.5 px-1 font-semibold truncate">
                {record.supplier.companyName || ''}
              </span>
            </div>
            <div className="flex items-baseline w-[40%]">
              <span className="font-bold whitespace-nowrap">ประเภทของสินค้าที่ขาย :</span>
              <span className="flex-1 border-b border-dotted border-black ml-1.5 px-1 font-semibold truncate">
                {record.supplier.productType || ''}
              </span>
            </div>
          </div>

          {/* Row 2 */}
          <div className="flex items-baseline">
            <span className="font-bold whitespace-nowrap">สถานที่ประกอบการ :</span>
            <span className="flex-1 border-b border-dotted border-black ml-1.5 px-1 truncate">
              {record.supplier.businessAddress || ''}
            </span>
          </div>

          {/* Row 3 */}
          <div className="flex items-baseline justify-between gap-4">
            <div className="flex items-baseline flex-1 min-w-0">
              <span className="font-bold whitespace-nowrap">เบอร์โทรศัพท์ :</span>
              <span className="flex-1 border-b border-dotted border-black ml-1.5 px-1 truncate">
                {record.supplier.phone || ''}
              </span>
            </div>
            <div className="flex items-baseline w-[40%]">
              <span className="font-bold whitespace-nowrap">แฟกซ์ :</span>
              <span className="flex-1 border-b border-dotted border-black ml-1.5 px-1 truncate">
                {record.supplier.fax || '-'}
              </span>
            </div>
          </div>

          {/* Row 4 */}
          <div className="flex items-baseline justify-between gap-4">
            <div className="flex items-baseline flex-1 min-w-0">
              <span className="font-bold whitespace-nowrap">ชื่อของผู้ประสานงาน :</span>
              <span className="flex-1 border-b border-dotted border-black ml-1.5 px-1 truncate">
                {record.supplier.coordinatorName || ''}
              </span>
            </div>
            <div className="flex items-baseline w-[40%]">
              <span className="font-bold whitespace-nowrap">ตำแหน่ง :</span>
              <span className="flex-1 border-b border-dotted border-black ml-1.5 px-1 truncate">
                {record.supplier.position || '-'}
              </span>
            </div>
          </div>

          {/* Row 5 */}
          <div className="flex items-baseline">
            <span className="font-bold whitespace-nowrap">ผลการประเมินประจำเดือน :</span>
            <span className="flex-1 border-b border-dotted border-black ml-1.5 px-1 font-semibold truncate">
              {record.supplier.evaluationMonth || ''}
            </span>
          </div>
        </div>

        {/* Solid Section Divider */}
        <div className="border-b-2 border-black my-2"></div>

        {/* Section Header: ข้อมูลการประเมิน */}
        <div className="text-center font-bold text-xs tracking-wider uppercase py-0.5 flex items-center justify-center gap-1.5 mb-1">
          <span>✉</span>
          <span>ข้อมูลการประเมิน</span>
        </div>

        {/* Evaluation Criteria Table */}
        <table className="w-full border-collapse border border-black text-[10.5px]">
          <thead>
            <tr className="border-b border-black font-bold">
              <th className="border-r border-black py-1.5 px-1 text-center w-[5.5%]">หัวข้อ</th>
              <th className="border-r border-black py-1.5 px-2 text-center w-[54.5%]">หัวข้อการประเมิน</th>
              <th className="border-r border-black py-1.5 px-1 text-center w-[10%]">คะแนนเต็ม</th>
              <th className="border-r border-black py-1.5 px-1 text-center w-[10%]">ค่าที่ได้</th>
              <th className="border-r border-black py-1.5 px-1 text-center w-[10%]">หมายเหตุ</th>
              <th className="py-1.5 px-1 text-center w-[10%]">ผู้ประเมิน</th>
            </tr>
          </thead>
          <tbody>
            {/* Category 1: ด้านคุณภาพ */}
            <tr>
              <td colSpan={6} className="border-r border-black px-2.5 pt-1.5 pb-0.5 font-bold underline">
                ด้านคุณภาพ
              </td>
            </tr>
            {qualityItems.map((item) => (
              <tr key={item.id} className="border-b border-dotted border-black">
                <td className="border-r border-black py-1 px-0.5 text-center font-medium">{item.id}</td>
                <td className="border-r border-black py-1 px-2.5">{item.title}</td>
                <td className="border-r border-black py-1 px-0.5 text-center font-semibold">{item.maxScore}</td>
                <td className="border-r border-black py-1 px-0.5 text-center font-bold">{item.score}</td>
                <td className="border-r border-black py-1 px-0.5 text-center text-[10px]">{item.remark || ''}</td>
                <td className="py-1 px-0.5 text-center text-[10px]">{item.evaluator || 'QA'}</td>
              </tr>
            ))}

            {/* Category 2: ด้านการจัดส่ง */}
            <tr>
              <td colSpan={6} className="border-r border-black px-2.5 pt-1.5 pb-0.5 font-bold underline">
                ด้านการจัดส่ง
              </td>
            </tr>
            {deliveryItems.map((item) => (
              <tr key={item.id} className="border-b border-dotted border-black">
                <td className="border-r border-black py-1 px-0.5 text-center font-medium">{item.id}</td>
                <td className="border-r border-black py-1 px-2.5">{item.title}</td>
                <td className="border-r border-black py-1 px-0.5 text-center font-semibold">{item.maxScore}</td>
                <td className="border-r border-black py-1 px-0.5 text-center font-bold">{item.score}</td>
                <td className="border-r border-black py-1 px-0.5 text-center text-[10px]">{item.remark || ''}</td>
                <td className="py-1 px-0.5 text-center text-[10px]">{item.evaluator || 'Store'}</td>
              </tr>
            ))}

            {/* Category 3: ด้านส่งมอบ */}
            <tr>
              <td colSpan={6} className="border-r border-black px-2.5 pt-1.5 pb-0.5 font-bold underline">
                ด้านส่งมอบ
              </td>
            </tr>
            {performanceItems.slice(0, 3).map((item) => (
              <tr key={item.id} className="border-b border-dotted border-black">
                <td className="border-r border-black py-1 px-0.5 text-center font-medium">{item.id}</td>
                <td className="border-r border-black py-1 px-2.5">{item.title}</td>
                <td className="border-r border-black py-1 px-0.5 text-center font-semibold">{item.maxScore}</td>
                <td className="border-r border-black py-1 px-0.5 text-center font-bold">{item.score}</td>
                <td className="border-r border-black py-1 px-0.5 text-center text-[10px]">{item.remark || ''}</td>
                <td className="py-1 px-0.5 text-center text-[10px]">{item.evaluator || 'จัดซื้อ'}</td>
              </tr>
            ))}

            {/* Category 4 / Sub: การควบคุมผู้ให้บริการภายนอกด้านกระบวนการผลิตฯ */}
            <tr>
              <td colSpan={6} className="border-r border-black px-2.5 pt-1.5 pb-0.5 font-bold underline">
                การควบคุมผู้ให้บริการภายนอกด้านกระบวนการผลิตภัณฑ์ฯ
              </td>
            </tr>
            {performanceItems.slice(3).map((item) => (
              <tr key={item.id} className="border-b border-dotted border-black last:border-b-0">
                <td className="border-r border-black py-1 px-0.5 text-center font-medium">{item.id}</td>
                <td className="border-r border-black py-1 px-2.5 leading-snug">{item.title}</td>
                <td className="border-r border-black py-1 px-0.5 text-center font-semibold">{item.maxScore}</td>
                <td className="border-r border-black py-1 px-0.5 text-center font-bold">{item.score}</td>
                <td className="border-r border-black py-1 px-0.5 text-center text-[10px]">{item.remark || ''}</td>
                <td className="py-1 px-0.5 text-center text-[10px]">{item.evaluator || 'QA/จัดซื้อ'}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Summary Title Bar */}
        <div className="border border-black text-center font-bold py-1 text-xs mt-2.5">
          สรุปผลการประเมิน [ คะแนนเต็ม 100 คะแนน ]
        </div>

        {/* Score & Grade Boxes with Light Cyan & Yellow fills matching the template */}
        <div className="border-x border-b border-black grid grid-cols-12 text-xs">
          <div className="col-span-3 py-2 px-1 font-bold border-r border-black flex items-center justify-center">
            คะแนนรวมที่ได้ =
          </div>
          {/* Light Cyan/Blue box for score */}
          <div className="col-span-3 py-2 px-1 text-xl font-black border-r border-black flex items-center justify-center bg-[#dcfce7]/60 text-black">
            {record.totalScore}
          </div>
          <div className="col-span-3 py-2 px-1 font-bold border-r border-black flex items-center justify-center">
            คะแนน / เกรด
          </div>
          {/* Light Yellow box for grade */}
          <div className="col-span-3 py-2 px-1 text-2xl font-black flex items-center justify-center bg-[#fef08a]/80 text-black">
            {record.grade}
          </div>
        </div>

        {/* Bottom Section (3 Columns: Legend/Notes, Pass/Fail + Confirm, Signatures) */}
        <div className="border-x border-b border-black grid grid-cols-12 mt-0 text-[10px]">
          {/* Left Column: Grade Criteria & Notes (~50% width) */}
          <div className="col-span-6 border-r border-black p-2.5 space-y-1.5">
            <div className="font-bold underline text-[10.5px]">หมายเหตุ</div>
            <div className="space-y-1 px-2">
              <div className="flex justify-between max-w-[220px]">
                <span className="font-medium">91 ~ 100</span>
                <span>=</span>
                <span className="font-bold">A (ดีมาก)</span>
              </div>
              <div className="flex justify-between max-w-[220px]">
                <span className="font-medium">81 ~ 90</span>
                <span>=</span>
                <span className="font-bold">B (ดี)</span>
              </div>
              <div className="flex justify-between max-w-[220px]">
                <span className="font-medium">71 ~ 80</span>
                <span>=</span>
                <span className="font-bold">C (พอใช้)</span>
              </div>
              <div className="flex justify-between max-w-[220px]">
                <span className="font-medium">0 ~ 70</span>
                <span>=</span>
                <span className="font-bold">D* (ปรับปรุง)</span>
              </div>
            </div>

            <div className="pt-2 text-[8.5px] text-black leading-tight space-y-1">
              <p>
                * คะแนนเกณฑ์การประเมิน คิดเป็นค่าเฉลี่ย % ของคะแนน ในกรณีที่มีการหักคะแนน ทางฝ่ายที่เกี่ยวข้องจะทำการแจ้งให้ Action ทราบจากใบแจกแจงข้อบกพร่องต่างๆ ตามหัวข้อที่ไม่ผ่านเกณฑ์การประเมิน
              </p>
              <p>
                * กรณีที่ทางผู้ขาย (Supplier) ได้เกรด D ติดต่อกัน 3 ครั้ง จะถูกดำเนินการออกใบเพิกถอนรายชื่อผู้ขาย AVL
              </p>
            </div>
          </div>

          {/* Middle Column: Pass / Fail & Supplier Confirm (~25% width) */}
          <div className="col-span-3 border-r border-black flex flex-col justify-between p-2">
            <div className="space-y-2">
              <div className="border border-black p-1.5 flex items-center justify-between text-[11px] font-bold">
                <span>ผ่านเกณฑ์</span>
                <span className="w-5 h-5 border border-black flex items-center justify-center text-sm font-bold">
                  {record.isPassed ? '✓' : ''}
                </span>
              </div>
              <div className="border border-black p-1.5 flex items-center justify-between text-[11px] font-bold">
                <span>ไม่ผ่านเกณฑ์</span>
                <span className="w-5 h-5 border border-black flex items-center justify-center text-sm font-bold">
                  {!record.isPassed ? '✓' : ''}
                </span>
              </div>
            </div>

            {/* Supplier Confirm Box */}
            <div className="border border-black p-2 text-center mt-3">
              <div className="text-[9px] text-gray-700 min-h-[26px] flex items-end justify-center">
                ( {record.evaluators.supplierConfirmName || '...................................................'} )
              </div>
              <div className="text-[8.5px] font-bold tracking-wider uppercase mt-1">
                SUPPLIER CONFIRM
              </div>
            </div>
          </div>

          {/* Right Column: 4 Signature Lines (~25% width) */}
          <div className="col-span-3 p-2 flex flex-col justify-between text-[9.5px]">
            <div className="text-center py-1 border-b border-dotted border-gray-400">
              <div className="text-[8.5px] text-gray-700">
                ( {record.evaluators.purchaserName || '                                  '} )
              </div>
              <div className="font-semibold text-black mt-0.5">เจ้าหน้าที่จัดซื้อ</div>
            </div>

            <div className="text-center py-1 border-b border-dotted border-gray-400">
              <div className="text-[8.5px] text-gray-700">
                ( {record.evaluators.qaName || '                                  '} )
              </div>
              <div className="font-semibold text-black mt-0.5">ประกันคุณภาพ</div>
            </div>

            <div className="text-center py-1 border-b border-dotted border-gray-400">
              <div className="text-[8.5px] text-gray-700">
                ( {record.evaluators.storeOfficerName || '                                  '} )
              </div>
              <div className="font-semibold text-black mt-0.5">เจ้าหน้าที่สโตร์</div>
            </div>

            <div className="text-center py-1">
              <div className="text-[8.5px] text-gray-700">
                ( {record.evaluators.purchasingManagerName || '                                  '} )
              </div>
              <div className="font-bold text-black mt-0.5">ผู้จัดการฝ่ายจัดซื้อ</div>
            </div>
          </div>
        </div>

        {/* Footer Document Code */}
        <div className="text-right text-[9px] font-mono font-bold text-black pt-1.5">
          FM-PU-006-00 : 27/03/18
        </div>
      </div>
    </div>
  );
};
