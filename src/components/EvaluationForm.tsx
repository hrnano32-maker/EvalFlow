import React, { useState, useEffect, useMemo } from 'react';
import { EvaluationCriterion, SupplierInfo, EvaluatorSignatures, EvaluationRecord, GoogleSheetConfig } from '../types';
import { DEFAULT_CRITERIA, INITIAL_SUPPLIER, INITIAL_EVALUATORS, MONTHS_THAI, calculateGrade } from '../data/criteria';
import {
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Send,
  Loader2,
  Sparkles,
  RotateCcw,
  Building,
  Building2,
  ClipboardList,
  UserCheck,
  ExternalLink,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  PlusCircle,
  Search,
  Check,
  Printer,
  Save,
  FileCheck2,
  History,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SignatureUploadBox } from './SignatureUploadBox';

interface Props {
  accessToken: string | null;
  sheetConfig: GoogleSheetConfig | null;
  records?: EvaluationRecord[];
  onPromptLogin: () => void;
  onOpenSheetModal: () => void;
  onSaveRecord: (record: EvaluationRecord) => Promise<void>;
  isSaving: boolean;
  onViewPrintable: (record: EvaluationRecord) => void;
  onGoToHistory?: () => void;
}

// Pre-defined sample suppliers for quick testing
const SAMPLE_SUPPLIERS: SupplierInfo[] = [
  INITIAL_SUPPLIER,
  {
    companyName: 'บริษัท สยาม พรีซิชั่น เอ็นจิเนียริ่ง จำกัด',
    productType: 'BOLT, SCREW & FASTENERS',
    businessAddress: '88/12 หมู่ 4 นิคมอุตสาหกรรมบางพลี ถ.เทพารักษ์ ต.บางเสาธง จ.สมุทรปราการ 10540',
    phone: '02-3159800',
    fax: '02-3159805',
    coordinatorName: 'กนกวรรณ',
    position: 'ฝ่ายประสานงานขาย',
    evaluationMonth: 'พฤษภาคม 2569',
    evaluationRound: '1',
    evaluationYear: '69',
  },
  {
    companyName: 'บริษัท ไทยเพรสซิ่ง พาร์ทส์ แอนด์ ออโตเมชั่น จำกัด',
    productType: 'BRACKET, METAL STAMPING',
    businessAddress: '55 หมู่ 2 ถ.กิ่งแก้ว ต.ราชาเทวะ อ.บางพลี จ.สมุทรปราการ 10540',
    phone: '02-7389100',
    fax: '02-7389109',
    coordinatorName: 'สมชาย',
    position: 'ผู้จัดการฝ่ายขาย',
    evaluationMonth: 'พฤษภาคม 2569',
    evaluationRound: '1',
    evaluationYear: '69',
  },
];

export const EvaluationForm: React.FC<Props> = ({
  accessToken,
  sheetConfig,
  records = [],
  onPromptLogin,
  onOpenSheetModal,
  onSaveRecord,
  isSaving,
  onViewPrintable,
  onGoToHistory,
}) => {
  const [supplier, setSupplier] = useState<SupplierInfo>(INITIAL_SUPPLIER);
  const [criteria, setCriteria] = useState<EvaluationCriterion[]>(DEFAULT_CRITERIA);
  const [evaluators, setEvaluators] = useState<EvaluatorSignatures>(INITIAL_EVALUATORS);
  const [generalNotes, setGeneralNotes] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'quality' | 'delivery' | 'performance'>('all');
  const [savedSuccessRecord, setSavedSuccessRecord] = useState<EvaluationRecord | null>(null);
  const [selectedSupplierName, setSelectedSupplierName] = useState<string>(INITIAL_SUPPLIER.companyName);

  // Compute distinct known suppliers from existing records + samples
  const knownSuppliers = useMemo(() => {
    const map = new Map<string, SupplierInfo>();
    
    // 1. Add samples
    SAMPLE_SUPPLIERS.forEach((s) => {
      map.set(s.companyName.trim().toLowerCase(), s);
    });

    // 2. Add from historical records
    records.forEach((r) => {
      if (r.supplier?.companyName) {
        const key = r.supplier.companyName.trim().toLowerCase();
        if (!map.has(key)) {
          map.set(key, r.supplier);
        }
      }
    });

    return Array.from(map.values());
  }, [records]);

  const handleSelectExistingSupplier = (companyName: string) => {
    setSelectedSupplierName(companyName);
    if (companyName === '__NEW__') {
      // Clear form for brand new supplier
      setSupplier({
        companyName: '',
        productType: '',
        businessAddress: '',
        phone: '',
        fax: '',
        coordinatorName: '',
        position: 'ผู้ติดต่อ',
        evaluationMonth: 'พฤษภาคม 2569',
        evaluationRound: '1',
        evaluationYear: '69',
      });
      return;
    }

    const matched = knownSuppliers.find((s) => s.companyName === companyName);
    if (matched) {
      setSupplier({
        ...matched,
        evaluationRound: supplier.evaluationRound || '1',
        evaluationMonth: supplier.evaluationMonth || 'พฤษภาคม 2569',
        evaluationYear: supplier.evaluationYear || '69',
      });
    }
  };

  const handleNewSupplierBlank = () => {
    setSelectedSupplierName('__NEW__');
    setSupplier({
      companyName: '',
      productType: '',
      businessAddress: '',
      phone: '',
      fax: '',
      coordinatorName: '',
      position: 'ผู้ติดต่อ',
      evaluationMonth: 'พฤษภาคม 2569',
      evaluationRound: '1',
      evaluationYear: '69',
    });
    // Reset criteria scores to 0 or defaults
    setCriteria(DEFAULT_CRITERIA.map((c) => ({ ...c, score: c.maxScore, remark: '' })));
  };

  // Compute live scores
  const totalScore = criteria.reduce((sum, c) => sum + (Number(c.score) || 0), 0);
  const gradeInfo = calculateGrade(totalScore);

  const qualityScore = criteria
    .filter((c) => c.category === 'quality')
    .reduce((sum, c) => sum + (Number(c.score) || 0), 0);
  const deliveryScore = criteria
    .filter((c) => c.category === 'delivery')
    .reduce((sum, c) => sum + (Number(c.score) || 0), 0);
  const performanceScore = criteria
    .filter((c) => c.category === 'performance')
    .reduce((sum, c) => sum + (Number(c.score) || 0), 0);

  const handleScoreChange = (id: number, newScore: number) => {
    setCriteria((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const clamped = Math.max(0, Math.min(item.maxScore, newScore));
          return { ...item, score: clamped };
        }
        return item;
      })
    );
  };

  const handleRemarkChange = (id: number, remark: string) => {
    setCriteria((prev) =>
      prev.map((item) => (item.id === id ? { ...item, remark } : item))
    );
  };

  // Sample data presets from the PDF
  const loadPreset = (presetNumber: number) => {
    if (presetNumber === 1) {
      // มกราคม 2569 (91 pts)
      setSupplier({
        ...INITIAL_SUPPLIER,
        evaluationRound: '1',
        evaluationMonth: 'มกราคม 2569',
      });
      setCriteria([
        { ...DEFAULT_CRITERIA[0], score: 13 }, // ข้อ 1
        { ...DEFAULT_CRITERIA[1], score: 5 },  // ข้อ 2
        { ...DEFAULT_CRITERIA[2], score: 5 },  // ข้อ 3
        { ...DEFAULT_CRITERIA[3], score: 5 },  // ข้อ 4
        { ...DEFAULT_CRITERIA[4], score: 10 }, // ข้อ 5
        { ...DEFAULT_CRITERIA[5], score: 10 }, // ข้อ 6
        { ...DEFAULT_CRITERIA[6], score: 5 },  // ข้อ 7
        { ...DEFAULT_CRITERIA[7], score: 5 },  // ข้อ 8
        { ...DEFAULT_CRITERIA[8], score: 5 },  // ข้อ 9
        { ...DEFAULT_CRITERIA[9], score: 8 },  // ข้อ 10
        { ...DEFAULT_CRITERIA[10], score: 5 }, // ข้อ 11
        { ...DEFAULT_CRITERIA[11], score: 5 }, // ข้อ 12
        { ...DEFAULT_CRITERIA[12], score: 5 }, // ข้อ 13
        { ...DEFAULT_CRITERIA[13], score: 5 }, // ข้อ 14
      ]);
    } else if (presetNumber === 2) {
      // กุมภาพันธ์ 2569 (93 pts)
      setSupplier({
        ...INITIAL_SUPPLIER,
        evaluationRound: '2',
        evaluationMonth: 'กุมภาพันธ์ 2569',
      });
      setCriteria([
        { ...DEFAULT_CRITERIA[0], score: 15 },
        { ...DEFAULT_CRITERIA[1], score: 5 },
        { ...DEFAULT_CRITERIA[2], score: 5 },
        { ...DEFAULT_CRITERIA[3], score: 5 },
        { ...DEFAULT_CRITERIA[4], score: 10 },
        { ...DEFAULT_CRITERIA[5], score: 10 },
        { ...DEFAULT_CRITERIA[6], score: 5 },
        { ...DEFAULT_CRITERIA[7], score: 5 },
        { ...DEFAULT_CRITERIA[8], score: 5 },
        { ...DEFAULT_CRITERIA[9], score: 8 },
        { ...DEFAULT_CRITERIA[10], score: 5 },
        { ...DEFAULT_CRITERIA[11], score: 5 },
        { ...DEFAULT_CRITERIA[12], score: 5 },
        { ...DEFAULT_CRITERIA[13], score: 5 },
      ]);
    } else if (presetNumber === 5) {
      // พฤษภาคม 2569 (94 pts)
      setSupplier({
        ...INITIAL_SUPPLIER,
        evaluationRound: '5',
        evaluationMonth: 'พฤษภาคม 2569',
      });
      setCriteria([
        { ...DEFAULT_CRITERIA[0], score: 15 },
        { ...DEFAULT_CRITERIA[1], score: 5 },
        { ...DEFAULT_CRITERIA[2], score: 5 },
        { ...DEFAULT_CRITERIA[3], score: 5 },
        { ...DEFAULT_CRITERIA[4], score: 10 },
        { ...DEFAULT_CRITERIA[5], score: 10 },
        { ...DEFAULT_CRITERIA[6], score: 5 },
        { ...DEFAULT_CRITERIA[7], score: 5 },
        { ...DEFAULT_CRITERIA[8], score: 5 },
        { ...DEFAULT_CRITERIA[9], score: 9 }, // 9 pts for item 10
        { ...DEFAULT_CRITERIA[10], score: 5 },
        { ...DEFAULT_CRITERIA[11], score: 5 },
        { ...DEFAULT_CRITERIA[12], score: 5 },
        { ...DEFAULT_CRITERIA[13], score: 5 },
      ]);
    }
  };

  const handleSaveEvaluation = async () => {
    if (!supplier.companyName.trim()) {
      alert('กรุณาระบุชื่อบริษัทผู้ขาย (Supplier Name) ก่อนทำการบันทึก');
      return;
    }

    const newRecord: EvaluationRecord = {
      id: 'EVAL_' + Date.now(),
      timestamp: new Date().toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' }),
      supplier,
      criteria,
      totalScore,
      grade: gradeInfo.grade,
      gradeLabel: gradeInfo.gradeLabel,
      isPassed: gradeInfo.isPassed,
      notes: generalNotes,
      evaluators,
      syncedToSheets: !!(accessToken && sheetConfig),
    };

    try {
      await onSaveRecord(newRecord);
      setSavedSuccessRecord(newRecord);
      if (gradeInfo.grade === 'A' || gradeInfo.grade === 'B') {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const currentEvaluationRecord: EvaluationRecord = {
    id: 'DRAFT_' + Date.now(),
    timestamp: new Date().toLocaleString('th-TH'),
    supplier,
    criteria,
    totalScore,
    grade: gradeInfo.grade,
    gradeLabel: gradeInfo.gradeLabel,
    isPassed: gradeInfo.isPassed,
    notes: generalNotes,
    evaluators,
    syncedToSheets: false,
  };

  const filteredCriteria =
    activeCategory === 'all'
      ? criteria
      : criteria.filter((c) => c.category === activeCategory);

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-28 font-ui">
      {/* Modern Executive Hero Grid & Live Destination Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Hero Card */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center space-x-2 text-[11px] font-bold text-blue-600 uppercase tracking-widest mb-2">
              <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200/80 font-mono">FM-PU-006-00</span>
              <span className="text-slate-300">&bull;</span>
              <span className="text-slate-500 font-medium">SUPPLIER EVALUATION</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
              แบบฟอร์มประเมินผู้ขาย<br />
              <span className="text-blue-600">บันทึกผลและซิงค์ Google Sheets</span>
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-2.5 leading-relaxed">
              ประเมินตามเกณฑ์มาตรฐาน 14 ข้อ (100 คะแนนเต็ม) ระบบคำนวณคะแนนรวม ตัดเกรด A/B/C/D อัตโนมัติ พร้อมส่งออกฟอร์มทางการ A4
            </p>
          </div>

          {/* Quick PDF Presets */}
          <div className="pt-4 border-t border-slate-100">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              โหลดข้อมูลตัวอย่างจากเอกสารจริง (Presets):
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => loadPreset(1)}
                className="px-3 py-1.5 text-xs font-semibold bg-slate-50 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 text-slate-700 rounded-lg border border-slate-200 transition shadow-2xs"
              >
                ครั้งที่ 1 (ม.ค. 91 คะแนน)
              </button>
              <button
                type="button"
                onClick={() => loadPreset(2)}
                className="px-3 py-1.5 text-xs font-semibold bg-slate-50 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 text-slate-700 rounded-lg border border-slate-200 transition shadow-2xs"
              >
                ครั้งที่ 2 (ก.พ. 93 คะแนน)
              </button>
              <button
                type="button"
                onClick={() => loadPreset(5)}
                className="px-3 py-1.5 text-xs font-semibold bg-slate-50 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 text-slate-700 rounded-lg border border-slate-200 transition shadow-2xs"
              >
                ครั้งที่ 5 (พ.ค. 94 คะแนน)
              </button>
            </div>
          </div>
        </div>

        {/* Right Destination File Card */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-6 sm:p-7 rounded-2xl text-white shadow-xl border border-slate-800 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                DESTINATION FILE
              </span>
              <div className="flex items-center space-x-1.5 text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-800/80">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Live Sync</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="text-sm font-bold text-slate-100 truncate flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{sheetConfig ? sheetConfig.spreadsheetTitle : 'ยังไม่ได้เชื่อมโยง Google Sheet'}</span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono truncate">
                {sheetConfig ? `ID: ${sheetConfig.spreadsheetId}` : 'กดปุ่มเพื่อสร้างหรือเลือก Sheet'}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-widest">เกณฑ์ประเมิน</div>
              <div className="text-lg font-mono font-bold text-emerald-400">14 หัวข้อ (100 คะแนน)</div>
            </div>

            {sheetConfig ? (
              <a
                href={sheetConfig.spreadsheetUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold tracking-wide transition flex items-center space-x-2 shadow-2xs"
              >
                <span>เปิดชีต</span>
                <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
              </a>
            ) : (
              <button
                type="button"
                onClick={onOpenSheetModal}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold tracking-wide transition shadow-sm"
              >
                เชื่อมต่อ Sheet
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Section 01: Supplier Info */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
          <div className="flex items-center space-x-3.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 font-mono text-sm font-bold flex items-center justify-center shrink-0 border border-blue-200/80">
              01
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 tracking-tight">
                ข้อมูลผู้ขายและรอบการประเมิน (Supplier Information)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">ระบุชื่อสถานประกอบการ รายละเอียดสินค้า และงวดที่ทำการประเมิน</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleNewSupplierBlank}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition shadow-2xs"
              title="ล้างฟอร์มเพื่อกรอกข้อมูลผู้ขายเจ้าใหม่"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+ กรอกผู้ขายเจ้าใหม่</span>
            </button>
            <div className="hidden sm:block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest pl-2">
              FM-PU-006-00
            </div>
          </div>
        </div>

        {/* Quick Supplier Switcher / Directory Bar */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              <span>เลือกผู้ขายจากประวัติในระบบ ({knownSuppliers.length} รายการ):</span>
            </label>
            <span className="text-[11px] text-slate-400">
              หรือพิมพ์ชื่อผู้ขายเจ้าใหม่ในช่องด้านล่างได้ทันที
            </span>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <select
              value={selectedSupplierName}
              onChange={(e) => handleSelectExistingSupplier(e.target.value)}
              className="flex-1 px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none shadow-2xs"
            >
              <option value="__NEW__">-- [+] กรอกผู้ขายเจ้าใหม่ (Blank Form) --</option>
              {knownSuppliers.map((s, idx) => (
                <option key={idx} value={s.companyName}>
                  {s.companyName} ({s.productType || 'ไม่ระบุสินค้า'})
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleNewSupplierBlank}
              className="px-4 py-2 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold transition whitespace-nowrap shadow-2xs"
            >
              ล้างฟอร์ม
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 block">
              ชื่อบริษัท / โรงงาน / ห้างหุ้นส่วน <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={supplier.companyName}
              onChange={(e) => {
                setSupplier({ ...supplier, companyName: e.target.value });
                setSelectedSupplierName('__CUSTOM__');
              }}
              placeholder="เช่น บริษัท สยาม พรีซิชั่น เอ็นจิเนียริ่ง จำกัด"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200/90 focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all outline-none bg-white text-sm shadow-2xs font-medium text-slate-900 placeholder:text-slate-400"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 block">
              ประเภทของสินค้าที่ขาย <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={supplier.productType}
              onChange={(e) => setSupplier({ ...supplier, productType: e.target.value })}
              placeholder="เช่น STAY, NUT, ชิ้นส่วนโลหะ"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200/90 focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all outline-none bg-white text-sm shadow-2xs font-medium text-slate-900 placeholder:text-slate-400"
            />
          </div>

          <div className="md:col-span-3 space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 block">
              สถานที่ประกอบการ
            </label>
            <input
              type="text"
              value={supplier.businessAddress}
              onChange={(e) => setSupplier({ ...supplier, businessAddress: e.target.value })}
              placeholder="ที่อยู่ เลขที่ ถนน ตำบล/แขวง อำเภอ/เขต จังหวัด"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200/90 focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all outline-none bg-white text-sm shadow-2xs font-medium text-slate-900 placeholder:text-slate-400"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 block">
              เบอร์โทรศัพท์
            </label>
            <input
              type="text"
              value={supplier.phone}
              onChange={(e) => setSupplier({ ...supplier, phone: e.target.value })}
              placeholder="02-xxx-xxxx"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200/90 focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all outline-none bg-white text-sm shadow-2xs font-medium text-slate-900 placeholder:text-slate-400"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 block">
              เบอร์แฟกซ์
            </label>
            <input
              type="text"
              value={supplier.fax}
              onChange={(e) => setSupplier({ ...supplier, fax: e.target.value })}
              placeholder="02-xxx-xxxx"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200/90 focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all outline-none bg-white text-sm shadow-2xs font-medium text-slate-900 placeholder:text-slate-400"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 block">
              ชื่อผู้ประสานงาน
            </label>
            <input
              type="text"
              value={supplier.coordinatorName}
              onChange={(e) => setSupplier({ ...supplier, coordinatorName: e.target.value })}
              placeholder="ชื่อ-นามสกุล ผู้ติดต่อ"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200/90 focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all outline-none bg-white text-sm shadow-2xs font-medium text-slate-900 placeholder:text-slate-400"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 block">
              ประเมิน ครั้งที่ <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={supplier.evaluationRound}
              onChange={(e) => setSupplier({ ...supplier, evaluationRound: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200/90 focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all outline-none bg-white text-sm shadow-2xs text-center font-bold text-slate-900"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 block">
              ปีที่ประเมิน (พ.ศ.) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={supplier.evaluationYear}
              onChange={(e) => setSupplier({ ...supplier, evaluationYear: e.target.value })}
              placeholder="69 หรือ 2569"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200/90 focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all outline-none bg-white text-sm shadow-2xs text-center font-bold text-slate-900"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 block">
              ผลการประเมินประจำเดือน <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={supplier.evaluationMonth}
              onChange={(e) => setSupplier({ ...supplier, evaluationMonth: e.target.value })}
              placeholder="เช่น พฤษภาคม 2569"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200/90 focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all outline-none bg-white text-sm shadow-2xs font-medium text-slate-900"
            />
          </div>
        </div>
      </div>

      {/* Section 02: Criteria Evaluation */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        {/* Category Header & Filter Tabs */}
        <div className="p-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 bg-slate-50/70">
          <div className="flex items-center space-x-3.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 font-mono text-sm font-bold flex items-center justify-center shrink-0 border border-blue-200/80">
              02
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 tracking-tight">
                ข้อมูลการประเมิน (14 หัวข้อ / 100 คะแนนเต็ม)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">กดปุ่ม +/- หรือเลื่อนแถบสไลเดอร์เพื่อระบุคะแนนในแต่ละข้อ</p>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-1 p-1 bg-slate-200/70 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveCategory('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeCategory === 'all'
                  ? 'bg-white text-blue-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ทั้งหมด (100)
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory('quality')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeCategory === 'quality'
                  ? 'bg-white text-blue-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              คุณภาพ ({qualityScore}/45)
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory('delivery')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeCategory === 'delivery'
                  ? 'bg-white text-blue-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              การจัดส่ง ({deliveryScore}/25)
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory('performance')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeCategory === 'performance'
                  ? 'bg-white text-blue-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ส่งมอบ ({performanceScore}/30)
            </button>
          </div>
        </div>

        {/* Criteria List */}
        <div className="divide-y divide-slate-100 p-3 sm:p-6 space-y-2">
          {filteredCriteria.map((c) => (
            <div
              key={c.id}
              className="p-4 hover:bg-slate-50/90 rounded-xl transition-all space-y-3 border border-transparent hover:border-slate-200/70"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start space-x-3.5">
                  <div className="text-blue-700 font-mono text-xs font-bold bg-blue-50 w-7 h-7 flex items-center justify-center rounded-lg border border-blue-200/70 shrink-0 mt-0.5">
                    {c.id < 10 ? `0${c.id}` : c.id}
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                      {c.title}
                    </h4>
                    <div className="text-[11.5px] text-slate-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
                      <span className="font-medium text-slate-500">{c.categoryTitle}</span>
                      <span>&bull;</span>
                      <span>ผู้ประเมิน: <span className="font-semibold text-slate-700">{c.evaluator}</span></span>
                    </div>
                  </div>
                </div>

                {/* Score Controls */}
                <div className="flex items-center space-x-3 self-end sm:self-auto shrink-0">
                  <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
                    <button
                      type="button"
                      onClick={() => handleScoreChange(c.id, c.score - 1)}
                      disabled={c.score <= 0}
                      className="w-7 h-7 rounded bg-white text-slate-700 font-bold flex items-center justify-center hover:bg-slate-200 disabled:opacity-30 shadow-2xs border border-slate-200 text-xs transition"
                    >
                      -
                    </button>
                    <span className="w-10 text-center font-mono font-bold text-sm text-blue-700">
                      {c.score}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleScoreChange(c.id, c.score + 1)}
                      disabled={c.score >= c.maxScore}
                      className="w-7 h-7 rounded bg-white text-slate-700 font-bold flex items-center justify-center hover:bg-slate-200 disabled:opacity-30 shadow-2xs border border-slate-200 text-xs transition"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-400 w-14 text-right">
                    /{c.maxScore} PTS
                  </span>
                </div>
              </div>

              {/* Slider & Remark Bar */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center pt-1">
                <div className="md:col-span-7 flex items-center space-x-3">
                  <input
                    type="range"
                    min="0"
                    max={c.maxScore}
                    value={c.score}
                    onChange={(e) => handleScoreChange(c.id, Number(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                  />
                  <div className="text-xs font-mono font-bold text-slate-500 shrink-0 w-12 text-right">
                    {((c.score / c.maxScore) * 100).toFixed(0)}%
                  </div>
                </div>
                <div className="md:col-span-5">
                  <input
                    type="text"
                    placeholder="หมายเหตุเพิ่มเติมสำหรับข้อนี้..."
                    value={c.remark || ''}
                    onChange={(e) => handleRemarkChange(c.id, e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent shadow-2xs placeholder:text-slate-400 font-normal"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 03: Signatures & Notes */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-2">
          <div className="flex items-center space-x-3.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 font-mono text-sm font-bold flex items-center justify-center shrink-0 border border-blue-200/80">
              03
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 tracking-tight">
                ผู้ประเมินและการลงนาม / อัปโหลดลายเซ็น (FM-PU-006-00)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                สามารถพิมพ์ชื่อและอัปโหลดไฟล์รูปลายเซ็น (PNG/JPG) เพื่อนำไปแสดงในแบบฟอร์มเอกสารทางการ A4 ได้โดยอัตโนมัติ
              </p>
            </div>
          </div>
          <div className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/60 self-start sm:self-auto">
            ✓ รองรับลากไฟล์วาง (Drag & Drop)
          </div>
        </div>

        {/* 4 Evaluators Signature Upload Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SignatureUploadBox
            id="purchaser"
            roleTitle="เจ้าหน้าที่จัดซื้อ"
            roleSubtitle="PURCHASER"
            name={evaluators.purchaserName}
            onNameChange={(val) => setEvaluators({ ...evaluators, purchaserName: val })}
            signatureImage={evaluators.purchaserSignature}
            onSignatureChange={(dataUrl) => setEvaluators({ ...evaluators, purchaserSignature: dataUrl })}
            placeholderName="ชื่อ-นามสกุล เจ้าหน้าที่จัดซื้อ"
          />

          <SignatureUploadBox
            id="qa"
            roleTitle="ประกันคุณภาพ (QA)"
            roleSubtitle="QA OFFICER"
            name={evaluators.qaName}
            onNameChange={(val) => setEvaluators({ ...evaluators, qaName: val })}
            signatureImage={evaluators.qaSignature}
            onSignatureChange={(dataUrl) => setEvaluators({ ...evaluators, qaSignature: dataUrl })}
            placeholderName="ชื่อ-นามสกุล ฝ่าย QA"
          />

          <SignatureUploadBox
            id="store"
            roleTitle="เจ้าหน้าที่สโตร์"
            roleSubtitle="STORE OFFICER"
            name={evaluators.storeOfficerName}
            onNameChange={(val) => setEvaluators({ ...evaluators, storeOfficerName: val })}
            signatureImage={evaluators.storeOfficerSignature}
            onSignatureChange={(dataUrl) => setEvaluators({ ...evaluators, storeOfficerSignature: dataUrl })}
            placeholderName="ชื่อ-นามสกุล เจ้าหน้าที่สโตร์"
          />

          <SignatureUploadBox
            id="manager"
            roleTitle="ผู้จัดการฝ่ายจัดซื้อ"
            roleSubtitle="PURCHASING MGR"
            name={evaluators.purchasingManagerName}
            onNameChange={(val) => setEvaluators({ ...evaluators, purchasingManagerName: val })}
            signatureImage={evaluators.purchasingManagerSignature}
            onSignatureChange={(dataUrl) => setEvaluators({ ...evaluators, purchasingManagerSignature: dataUrl })}
            placeholderName="ชื่อ-นามสกุล ผู้จัดการฝ่าย"
          />
        </div>

        {/* Optional Supplier Confirm Signature Box */}
        <div className="pt-2 border-t border-slate-100">
          <div className="max-w-md">
            <SignatureUploadBox
              id="supplier-confirm"
              roleTitle="การลงนามรับทราบของผู้ขาย (Supplier Confirm)"
              roleSubtitle="OPTIONAL"
              name={evaluators.supplierConfirmName || ''}
              onNameChange={(val) => setEvaluators({ ...evaluators, supplierConfirmName: val })}
              signatureImage={evaluators.supplierConfirmSignature}
              onSignatureChange={(dataUrl) => setEvaluators({ ...evaluators, supplierConfirmSignature: dataUrl })}
              placeholderName="ชื่อ-นามสกุล ตัวแทนผู้ขาย (ถ้ามี)"
            />
          </div>
        </div>

        <div className="space-y-1.5 pt-2">
          <label className="text-xs font-semibold text-slate-600 block">
            หมายเหตุหรือข้อเสนอแนะเพิ่มเติมสำหรับการประเมิน
          </label>
          <textarea
            rows={2}
            value={generalNotes}
            onChange={(e) => setGeneralNotes(e.target.value)}
            placeholder="รายละเอียดหรือบันทึกเพิ่มเติมสำหรับรอบนี้..."
            className="w-full px-4 py-3 rounded-xl border border-slate-200/90 bg-white text-slate-900 text-xs font-medium focus:ring-2 focus:ring-blue-600 outline-none shadow-2xs resize-none"
          />
        </div>
      </div>

      {/* Sticky Bottom Bar with High-End Dark Palette */}
      <div className="sticky bottom-6 z-40 bg-slate-900/95 backdrop-blur-md text-white p-4 sm:p-5 rounded-2xl shadow-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-5">
        {/* Score & Grade Display */}
        <div className="flex items-center space-x-6">
          <div>
            <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-widest">
              TOTAL SCORE
            </span>
            <div className="text-3xl font-mono font-black text-emerald-400 tracking-tight">
              {totalScore} <span className="text-xs text-slate-500 font-sans font-normal">/ 100</span>
            </div>
          </div>

          <div className="h-10 w-[1px] bg-slate-800" />

          <div className="flex items-center space-x-3.5">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold font-mono border ${
                gradeInfo.grade === 'A'
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                  : gradeInfo.grade === 'B'
                  ? 'bg-blue-500/20 text-blue-400 border-blue-500/50'
                  : gradeInfo.grade === 'C'
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/50'
                  : 'bg-rose-500/20 text-rose-400 border-rose-500/50'
              }`}
            >
              {gradeInfo.grade}
            </div>

            <div>
              <div className="text-xs font-bold text-slate-200">
                เกรด: {gradeInfo.gradeLabel}
              </div>
              <div className="text-[11px] mt-0.5">
                {gradeInfo.isPassed ? (
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> ผ่านเกณฑ์การประเมิน
                  </span>
                ) : (
                  <span className="text-rose-400 font-semibold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> ไม่ผ่านเกณฑ์ (ปรับปรุง)
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center w-full md:w-auto justify-end">
          <button
            type="button"
            id="btn-save-evaluation"
            onClick={handleSaveEvaluation}
            disabled={isSaving}
            className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3.5 px-8 rounded-xl font-bold text-sm tracking-wide transition-all flex items-center justify-center space-x-2.5 shadow-lg shadow-blue-600/30 hover:shadow-blue-600/40 active:scale-[0.99] disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>กำลังบันทึกข้อมูล...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>บันทึกผลประเมิน</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Post-Save Success Modal with Instant Print & History Options */}
      {savedSuccessRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm animate-fadeIn font-ui">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 p-6 sm:p-7 space-y-5 text-center">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-200 shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-xl font-extrabold text-slate-900">บันทึกผลการประเมินสำเร็จ!</h3>
              <p className="text-xs text-slate-500 mt-1">
                บันทึกเข้าสู่ระบบประวัติและสถิติเรียบร้อยแล้ว {savedSuccessRecord.syncedToSheets && '(ซิงค์เข้า Google Sheets)'}
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-left text-xs space-y-2 font-ui">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">บริษัทผู้ขาย:</span>
                <span className="font-bold text-slate-900">{savedSuccessRecord.supplier.companyName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">คะแนนรวม:</span>
                <span className="font-bold text-blue-600 font-mono text-sm">{savedSuccessRecord.totalScore} / 100 ({savedSuccessRecord.grade})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">ผลการประเมิน:</span>
                <span className={`font-bold ${savedSuccessRecord.isPassed ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {savedSuccessRecord.isPassed ? '✓ ผ่านเกณฑ์การประเมิน' : '✗ ไม่ผ่านเกณฑ์'}
                </span>
              </div>
            </div>

            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  const rec = savedSuccessRecord;
                  setSavedSuccessRecord(null);
                  onViewPrintable(rec);
                }}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition flex items-center justify-center space-x-2"
              >
                <Printer className="w-4 h-4" />
                <span>เปิดดูและพิมพ์ใบประเมิน (Print A4 / PDF)</span>
              </button>

              {onGoToHistory && (
                <button
                  type="button"
                  onClick={() => {
                    setSavedSuccessRecord(null);
                    onGoToHistory();
                  }}
                  className="w-full py-3 text-xs font-bold uppercase tracking-wider text-slate-700 hover:bg-slate-100 rounded-xl border border-slate-200 transition flex items-center justify-center space-x-2"
                >
                  <History className="w-4 h-4 text-slate-500" />
                  <span>ไปที่หน้ารายงาน ประวัติและสถิติ</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setSavedSuccessRecord(null);
                  handleNewSupplierBlank();
                }}
                className="w-full py-2.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition"
              >
                + ทำรายการประเมินผู้ขายรายใหม่ (ล้างฟอร์ม)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
