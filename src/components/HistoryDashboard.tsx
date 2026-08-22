import React, { useState } from 'react';
import { EvaluationRecord, GoogleSheetConfig } from '../types';
import {
  FileSpreadsheet,
  Search,
  ExternalLink,
  Printer,
  Share2,
  RefreshCw,
  TrendingUp,
  Award,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Calendar,
  Layers,
} from 'lucide-react';

interface Props {
  records: EvaluationRecord[];
  sheetConfig: GoogleSheetConfig | null;
  onRefreshFromSheet: () => void;
  isLoadingSheet: boolean;
  onSelectRecordToView: (record: EvaluationRecord) => void;
  onSelectRecordToEmail: (record: EvaluationRecord) => void;
  onOpenSheetModal: () => void;
}

export const HistoryDashboard: React.FC<Props> = ({
  records,
  sheetConfig,
  onRefreshFromSheet,
  isLoadingSheet,
  onSelectRecordToView,
  onSelectRecordToEmail,
  onOpenSheetModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<string>('ALL');

  const filteredRecords = records.filter((r) => {
    const matchesSearch =
      r.supplier.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.supplier.productType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.supplier.evaluationMonth.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade = selectedGradeFilter === 'ALL' || r.grade === selectedGradeFilter;
    return matchesSearch && matchesGrade;
  });

  const totalEvaluations = records.length;
  const avgScore =
    totalEvaluations > 0
      ? (records.reduce((sum, r) => sum + r.totalScore, 0) / totalEvaluations).toFixed(1)
      : '0.0';
  const gradeACount = records.filter((r) => r.grade === 'A').length;
  const gradeBCount = records.filter((r) => r.grade === 'B').length;
  const gradeCCount = records.filter((r) => r.grade === 'C').length;
  const gradeDCount = records.filter((r) => r.grade === 'D*').length;
  const passRate =
    totalEvaluations > 0
      ? ((records.filter((r) => r.isPassed).length / totalEvaluations) * 100).toFixed(0)
      : '0';

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20 font-ui">
      {/* Header & Google Sheet Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-sm">
        <div>
          <div className="flex items-center space-x-2 text-[11px] font-bold text-blue-600 uppercase tracking-widest mb-2">
            <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200/80 font-mono">FM-PU-006-00</span>
            <span className="text-slate-300">&bull;</span>
            <span className="text-slate-500 font-medium">AUDIT RECORDS &amp; ANALYTICS</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
            ประวัติและรายงานสรุป<span className="text-blue-600">การประเมินผู้ขาย</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
            ข้อมูลทั้งหมดถูกบันทึกและซิงค์แบบ Real-time เข้ากับ Google Sheets ขององค์กร
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          {sheetConfig ? (
            <>
              <button
                type="button"
                onClick={onRefreshFromSheet}
                disabled={isLoadingSheet}
                className="inline-flex items-center space-x-2 px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition disabled:opacity-50 shadow-2xs"
                title="ดึงข้อมูลล่าสุดจาก Google Sheets"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingSheet ? 'animate-spin' : ''}`} />
                <span>รีเฟรชชีต</span>
              </button>
              <a
                href={sheetConfig.spreadsheetUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl transition shadow-2xs"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="truncate max-w-[200px]">{sheetConfig.spreadsheetTitle}</span>
                <ExternalLink className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              </a>
            </>
          ) : (
            <button
              type="button"
              onClick={onOpenSheetModal}
              className="inline-flex items-center space-x-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow-sm"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>เชื่อมต่อ Google Sheets</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">TOTAL EVALS</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-mono font-black text-slate-900">{totalEvaluations}</div>
            <div className="text-xs text-slate-400 mt-1 font-medium">บันทึกทั้งสิ้น {totalEvaluations} รายการ</div>
          </div>
        </div>

        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">AVERAGE SCORE</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-mono font-black text-emerald-600">
              {avgScore} <span className="text-xs font-sans font-normal text-slate-400">/ 100</span>
            </div>
            <div className="text-xs text-slate-400 mt-1 font-medium">อัตราผ่านเกณฑ์ {passRate}%</div>
          </div>
        </div>

        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">EXCELLENT (A)</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-mono font-black text-emerald-600">{gradeACount}</div>
            <div className="text-xs text-slate-400 mt-1 font-medium">
              คิดเป็น {totalEvaluations > 0 ? ((gradeACount / totalEvaluations) * 100).toFixed(0) : 0}% ของทั้งหมด
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">WARNING (D*)</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-mono font-black text-rose-600">{gradeDCount}</div>
            <div className="text-xs text-slate-400 mt-1 font-medium">เสี่ยงเพิกถอน AVL หากครบ 3 ครั้ง</div>
          </div>
        </div>
      </div>

      {/* Grade Distribution Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-700 gap-2">
          <span>สัดส่วนระดับเกรดการประเมิน:</span>
          <div className="flex gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-xs bg-emerald-500"></span> A ({gradeACount})</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-xs bg-blue-500"></span> B ({gradeBCount})</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-xs bg-amber-500"></span> C ({gradeCCount})</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-xs bg-rose-500"></span> D* ({gradeDCount})</span>
          </div>
        </div>

        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex border border-slate-200">
          {totalEvaluations > 0 ? (
            <>
              <div style={{ width: `${(gradeACount / totalEvaluations) * 100}%` }} className="bg-emerald-500 h-full transition-all" title={`เกรด A: ${gradeACount}`} />
              <div style={{ width: `${(gradeBCount / totalEvaluations) * 100}%` }} className="bg-blue-500 h-full transition-all" title={`เกรด B: ${gradeBCount}`} />
              <div style={{ width: `${(gradeCCount / totalEvaluations) * 100}%` }} className="bg-amber-500 h-full transition-all" title={`เกรด C: ${gradeCCount}`} />
              <div style={{ width: `${(gradeDCount / totalEvaluations) * 100}%` }} className="bg-rose-500 h-full transition-all" title={`เกรด D*: ${gradeDCount}`} />
            </>
          ) : (
            <div className="w-full bg-slate-200 h-full" />
          )}
        </div>
      </div>

      {/* Filter and Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        {/* Search & Filter Bar */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 bg-slate-50/70">
          <div className="relative flex-1 min-w-[260px]">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="ค้นหาชื่อบริษัท, ชนิดสินค้า, หรือเดือนประเมิน..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none shadow-2xs placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">เกรด:</span>
            {['ALL', 'A', 'B', 'C', 'D*'].map((grade) => (
              <button
                type="button"
                key={grade}
                onClick={() => setSelectedGradeFilter(grade)}
                className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg border transition ${
                  selectedGradeFilter === grade
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {grade === 'ALL' ? 'ทั้งหมด' : grade}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-5">ครั้งที่ / ปี</th>
                <th className="py-3.5 px-5">ประจำเดือน</th>
                <th className="py-3.5 px-5">บริษัทผู้ขาย (Supplier)</th>
                <th className="py-3.5 px-5">ประเภทสินค้า</th>
                <th className="py-3.5 px-5 text-center">คะแนนรวม</th>
                <th className="py-3.5 px-5 text-center">เกรด</th>
                <th className="py-3.5 px-5 text-center">สถานะ</th>
                <th className="py-3.5 px-5 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400 font-sans">
                    ไม่พบรายการประเมินที่ตรงกับเงื่อนไขการค้นหา
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-5 font-mono font-bold text-slate-800">
                      #{rec.supplier.evaluationRound}/{rec.supplier.evaluationYear}
                    </td>
                    <td className="py-4 px-5 font-medium text-slate-700">
                      <div className="flex items-center space-x-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{rec.supplier.evaluationMonth}</span>
                      </div>
                    </td>
                    <td className="py-4 px-5 font-bold text-slate-900">
                      {rec.supplier.companyName}
                    </td>
                    <td className="py-4 px-5 text-slate-500 font-medium">
                      {rec.supplier.productType}
                    </td>
                    <td className="py-4 px-5 text-center font-mono font-bold text-sm text-blue-600">
                      {rec.totalScore}
                      <span className="text-[10px] text-slate-400 font-sans font-normal">/100</span>
                    </td>
                    <td className="py-4 px-5 text-center">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-lg font-mono font-bold text-xs border ${
                          rec.grade === 'A'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : rec.grade === 'B'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : rec.grade === 'C'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {rec.grade}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-center">
                      {rec.isPassed ? (
                        <span className="inline-flex items-center space-x-1 text-emerald-600 text-xs font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>ผ่านเกณฑ์</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 text-rose-600 text-xs font-semibold">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>ไม่ผ่าน</span>
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-5 text-right">
                      <div className="inline-flex items-center space-x-1.5">
                        <button
                          type="button"
                          onClick={() => onSelectRecordToView(rec)}
                          className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg border border-transparent hover:border-blue-100 transition shadow-2xs"
                          title="ดูแบบฟอร์ม FM-PU-006-00 สำหรับพิมพ์"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onSelectRecordToEmail(rec)}
                          className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg border border-transparent hover:border-blue-100 transition shadow-2xs"
                          title="ส่งอีเมลแจ้งผลสรุป"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
