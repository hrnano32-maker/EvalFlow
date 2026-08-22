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
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface Props {
  accessToken: string | null;
  sheetConfig: GoogleSheetConfig | null;
  records?: EvaluationRecord[];
  onPromptLogin: () => void;
  onOpenSheetModal: () => void;
  onSaveRecord: (record: EvaluationRecord) => Promise<void>;
  isSaving: boolean;
  onViewPrintable: (record: EvaluationRecord) => void;
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
}) => {
  const [supplier, setSupplier] = useState<SupplierInfo>(INITIAL_SUPPLIER);
  const [criteria, setCriteria] = useState<EvaluationCriterion[]>(DEFAULT_CRITERIA);
  const [evaluators, setEvaluators] = useState<EvaluatorSignatures>(INITIAL_EVALUATORS);
  const [generalNotes, setGeneralNotes] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'quality' | 'delivery' | 'performance'>('all');
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
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

  const handleTriggerSubmit = () => {
    if (!accessToken) {
      onPromptLogin();
      return;
    }
    if (!sheetConfig) {
      onOpenSheetModal();
      return;
    }
    setShowConfirmSubmit(true);
  };

  const handleFinalSubmit = async () => {
    setShowConfirmSubmit(false);
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
      syncedToSheets: !!sheetConfig,
    };

    try {
      await onSaveRecord(newRecord);
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
    <div className="space-y-8 max-w-5xl mx-auto pb-28">
      {/* Geometric Balance Top Section: Hero Grid & Live Destination Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Hero Card */}
        <div className="lg:col-span-7 bg-white p-7 sm:p-8 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center space-x-2 text-[10px] font-bold text-blue-600 uppercase tracking-[0.2em] mb-2.5">
              <span>FM-PU-006-00</span>
              <span>&bull;</span>
              <span>SUPPLIER EVALUATION</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-light text-slate-900 leading-tight">
              แบบฟอร์มประเมินผู้ขาย<br />
              <span className="font-bold text-slate-900">ระบบบันทึก Google Sheets อัตโนมัติ</span>
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-3 leading-relaxed">
              ประเมินตามเกณฑ์มาตรฐาน 14 ข้อ (100 คะแนนเต็ม) ระบบจะคำนวณคะแนนรวม ตัดเกรด A/B/C/D และซิงค์ข้อมูลเข้า Google Spreadsheet แบบทันที
            </p>
          </div>

          {/* Quick PDF Presets */}
          <div className="pt-4 border-t border-slate-100">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-2.5">
              โหลดข้อมูลตัวอย่างจากเอกสารจริง (PDF Reference):
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => loadPreset(1)}
                className="px-3 py-1.5 text-xs font-bold bg-slate-50 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 text-slate-700 rounded border border-slate-200 transition-all uppercase tracking-wider shadow-2xs"
              >
                ครั้งที่ 1 (ม.ค. 91 คะแนน)
              </button>
              <button
                type="button"
                onClick={() => loadPreset(2)}
                className="px-3 py-1.5 text-xs font-bold bg-slate-50 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 text-slate-700 rounded border border-slate-200 transition-all uppercase tracking-wider shadow-2xs"
              >
                ครั้งที่ 2 (ก.พ. 93 คะแนน)
              </button>
              <button
                type="button"
                onClick={() => loadPreset(5)}
                className="px-3 py-1.5 text-xs font-bold bg-slate-50 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 text-slate-700 rounded border border-slate-200 transition-all uppercase tracking-wider shadow-2xs"
              >
                ครั้งที่ 5 (พ.ค. 94 คะแนน)
              </button>
            </div>
          </div>
        </div>

        {/* Right Destination File Card (Geometric Balance Style) */}
        <div className="lg:col-span-5 bg-slate-900 p-7 rounded-xl text-white shadow-2xl border border-slate-800 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                Destination File
              </span>
              <div className="flex items-center space-x-1.5 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Live Sync</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="text-sm font-bold text-slate-100 truncate flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{sheetConfig ? sheetConfig.spreadsheetTitle : 'ยังไม่ได้เชื่อมโยง Google Sheet'}</span>
              </div>
              <div className="text-[11px] text-slate-500 font-mono truncate">
                {sheetConfig ? `spreadsheets/d/${sheetConfig.spreadsheetId}` : 'กดปุ่มเพื่อสร้างหรือเลือก Sheet'}
              </div>
            </div>
          </div>

          <div className="pt-5 border-t border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-widest">CRITERIA COUNT</div>
              <div className="text-xl font-mono font-bold text-emerald-400">14 หัวข้อ</div>
            </div>

            {sheetConfig ? (
              <a
                href={sheetConfig.spreadsheetUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold uppercase tracking-wider transition flex items-center space-x-2"
              >
                <span>เปิดดู Sheet</span>
                <ExternalLink className="w-3 h-3 text-emerald-400" />
              </a>
            ) : (
              <button
                type="button"
                onClick={onOpenSheetModal}
                className="px-3.5 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider transition shadow-sm"
              >
                เชื่อมต่อ Sheet
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Section 01: Supplier Info */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-3">
          <div className="flex items-center space-x-3.5">
            <div className="w-8 h-8 rounded bg-blue-50 text-blue-600 font-mono text-sm font-bold flex items-center justify-center shrink-0 border border-blue-100">
              01
            </div>
            <div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900">
                ข้อมูลผู้ขายและรอบการประเมิน (Supplier Information)
              </h3>
              <p className="text-[11px] text-slate-400">ระบุชื่อสถานประกอบการ รายละเอียดสินค้า และงวดที่ทำการประเมิน</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleNewSupplierBlank}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold uppercase tracking-wider transition shadow-2xs"
              title="ล้างฟอร์มเพื่อกรอกข้อมูลผู้ขายเจ้าใหม่"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+ กรอก Supplier เจ้าใหม่</span>
            </button>
            <div className="hidden sm:block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest pl-2">
              FM-PU-006-00
            </div>
          </div>
        </div>

        {/* Quick Supplier Switcher / Directory Bar */}
        <div className="p-4 rounded-lg bg-slate-50/80 border border-slate-200 space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              <span>เลือกผู้ขายจากประวัติ / รายชื่อที่มีในระบบ ({knownSuppliers.length} รายการ):</span>
            </label>
            <span className="text-[11px] text-slate-400">
              หรือพิมพ์ชื่อผู้ขายเจ้าใหม่ในช่องด้านล่างได้โดยตรง
            </span>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <select
              value={selectedSupplierName}
              onChange={(e) => handleSelectExistingSupplier(e.target.value)}
              className="flex-1 px-3.5 py-2 rounded border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-600 outline-none shadow-2xs"
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
              className="px-3.5 py-2 rounded bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold uppercase tracking-wider transition whitespace-nowrap shadow-2xs"
            >
              ล้างฟอร์ม (Clear)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] block">
              ชื่อบริษัท / โรงงาน / ห้างหุ้นส่วน *
            </label>
            <input
              type="text"
              required
              value={supplier.companyName}
              onChange={(e) => {
                setSupplier({ ...supplier, companyName: e.target.value });
                setSelectedSupplierName('__CUSTOM__');
              }}
              placeholder="เช่น บริษัท ตัวอย่าง อุตสาหกรรม จำกัด"
              className="w-full px-4 py-3 rounded border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all outline-none bg-white text-sm shadow-xs font-medium text-slate-900"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] block">
              ประเภทของสินค้าที่ขาย *
            </label>
            <input
              type="text"
              value={supplier.productType}
              onChange={(e) => setSupplier({ ...supplier, productType: e.target.value })}
              placeholder="เช่น STAY, NUT, ชิ้นส่วนโลหะ"
              className="w-full px-4 py-3 rounded border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all outline-none bg-white text-sm shadow-xs font-medium text-slate-900"
            />
          </div>

          <div className="md:col-span-3 space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] block">
              สถานที่ประกอบการ
            </label>
            <input
              type="text"
              value={supplier.businessAddress}
              onChange={(e) => setSupplier({ ...supplier, businessAddress: e.target.value })}
              placeholder="ที่อยู่ เลขที่ ถนน ตำบล/แขวง อำเภอ/เขต จังหวัด"
              className="w-full px-4 py-3 rounded border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all outline-none bg-white text-sm shadow-xs font-medium text-slate-900"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] block">
              เบอร์โทรศัพท์
            </label>
            <input
              type="text"
              value={supplier.phone}
              onChange={(e) => setSupplier({ ...supplier, phone: e.target.value })}
              placeholder="02-xxx-xxxx"
              className="w-full px-4 py-3 rounded border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all outline-none bg-white text-sm shadow-xs font-medium text-slate-900"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] block">
              เบอร์แฟกซ์
            </label>
            <input
              type="text"
              value={supplier.fax}
              onChange={(e) => setSupplier({ ...supplier, fax: e.target.value })}
              placeholder="02-xxx-xxxx"
              className="w-full px-4 py-3 rounded border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all outline-none bg-white text-sm shadow-xs font-medium text-slate-900"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] block">
              ชื่อผู้ประสานงาน
            </label>
            <input
              type="text"
              value={supplier.coordinatorName}
              onChange={(e) => setSupplier({ ...supplier, coordinatorName: e.target.value })}
              placeholder="ชื่อ-นามสกุล ผู้ติดต่อ"
              className="w-full px-4 py-3 rounded border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all outline-none bg-white text-sm shadow-xs font-medium text-slate-900"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] block">
              ประเมิน ครั้งที่ *
            </label>
            <input
              type="text"
              value={supplier.evaluationRound}
              onChange={(e) => setSupplier({ ...supplier, evaluationRound: e.target.value })}
              className="w-full px-4 py-3 rounded border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all outline-none bg-white text-sm shadow-xs text-center font-bold text-slate-900"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] block">
              ปีที่ประเมิน (พ.ศ.) *
            </label>
            <input
              type="text"
              value={supplier.evaluationYear}
              onChange={(e) => setSupplier({ ...supplier, evaluationYear: e.target.value })}
              placeholder="69 หรือ 2569"
              className="w-full px-4 py-3 rounded border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all outline-none bg-white text-sm shadow-xs text-center font-bold text-slate-900"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] block">
              ผลการประเมินประจำเดือน *
            </label>
            <input
              type="text"
              value={supplier.evaluationMonth}
              onChange={(e) => setSupplier({ ...supplier, evaluationMonth: e.target.value })}
              placeholder="เช่น มกราคม 2569"
              className="w-full px-4 py-3 rounded border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all outline-none bg-white text-sm shadow-xs font-medium text-slate-900"
            />
          </div>
        </div>
      </div>

      {/* Section 02: Criteria Evaluation */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Category Header & Filter Tabs */}
        <div className="p-6 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 bg-slate-50/50">
          <div className="flex items-center space-x-3.5">
            <div className="w-8 h-8 rounded bg-blue-50 text-blue-600 font-mono text-sm font-bold flex items-center justify-center shrink-0 border border-blue-100">
              02
            </div>
            <div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900">
                ข้อมูลการประเมิน (14 หัวข้อ / 100 คะแนนเต็ม)
              </h3>
              <p className="text-[11px] text-slate-400">คลิกปรับคะแนน เลื่อนสไลเดอร์ หรือใส่หมายเหตุเพิ่มเติมในแต่ละข้อ</p>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-1 p-1 bg-slate-200/70 rounded-lg text-xs font-bold uppercase tracking-wider">
            <button
              type="button"
              onClick={() => setActiveCategory('all')}
              className={`px-3 py-1.5 rounded transition ${
                activeCategory === 'all'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ทั้งหมด (100)
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory('quality')}
              className={`px-3 py-1.5 rounded transition ${
                activeCategory === 'quality'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              คุณภาพ ({qualityScore}/45)
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory('delivery')}
              className={`px-3 py-1.5 rounded transition ${
                activeCategory === 'delivery'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              การจัดส่ง ({deliveryScore}/25)
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory('performance')}
              className={`px-3 py-1.5 rounded transition ${
                activeCategory === 'performance'
                  ? 'bg-white text-blue-600 shadow-xs'
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
              className="p-4 hover:bg-slate-50/80 rounded-lg transition-all space-y-3 border border-transparent hover:border-slate-200"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start space-x-3.5">
                  <div className="text-blue-600 font-mono text-xs font-bold bg-blue-50 w-7 h-7 flex items-center justify-center rounded border border-blue-100 shrink-0 mt-0.5">
                    {c.id < 10 ? `0${c.id}` : c.id}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 leading-snug">
                      {c.title}
                    </h4>
                    <span className="text-[11px] text-slate-400">
                      {c.categoryTitle} &bull; ผู้ประเมิน:{' '}
                      <span className="font-semibold text-slate-700">{c.evaluator}</span>
                    </span>
                  </div>
                </div>

                {/* Score Controls */}
                <div className="flex items-center space-x-3 self-end sm:self-auto shrink-0">
                  <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded border border-slate-200">
                    <button
                      type="button"
                      onClick={() => handleScoreChange(c.id, c.score - 1)}
                      disabled={c.score <= 0}
                      className="w-7 h-7 rounded bg-white text-slate-700 font-bold flex items-center justify-center hover:bg-slate-200 disabled:opacity-30 shadow-2xs border border-slate-200 text-xs"
                    >
                      -
                    </button>
                    <span className="w-10 text-center font-mono font-bold text-sm text-blue-600">
                      {c.score}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleScoreChange(c.id, c.score + 1)}
                      disabled={c.score >= c.maxScore}
                      className="w-7 h-7 rounded bg-white text-slate-700 font-bold flex items-center justify-center hover:bg-slate-200 disabled:opacity-30 shadow-2xs border border-slate-200 text-xs"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-slate-400 w-14 text-right">
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
                    className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-200 rounded"
                  />
                  <div className="text-[11px] font-mono font-bold text-slate-500 shrink-0 w-12 text-right">
                    {((c.score / c.maxScore) * 100).toFixed(0)}%
                  </div>
                </div>
                <div className="md:col-span-5">
                  <input
                    type="text"
                    placeholder="หมายเหตุเพิ่มเติม..."
                    value={c.remark || ''}
                    onChange={(e) => handleRemarkChange(c.id, e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded border border-slate-200 bg-white text-slate-800 outline-none focus:ring-1 focus:ring-blue-600 shadow-2xs placeholder:text-slate-400"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 03: Signatures & Notes */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-8 h-8 rounded bg-blue-50 text-blue-600 font-mono text-sm font-bold flex items-center justify-center shrink-0 border border-blue-100">
              03
            </div>
            <div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900">
                ผู้ประเมินและการลงนาม (FM-PU-006-00)
              </h3>
              <p className="text-[11px] text-slate-400">ระบุชื่อเจ้าหน้าที่ผู้รับผิดชอบ 4 ฝ่ายตามแบบฟอร์มทางการ</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] block">
              เจ้าหน้าที่จัดซื้อ
            </label>
            <input
              type="text"
              value={evaluators.purchaserName}
              onChange={(e) => setEvaluators({ ...evaluators, purchaserName: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded border border-slate-200 bg-white text-slate-900 text-xs font-semibold focus:ring-2 focus:ring-blue-600 outline-none shadow-2xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] block">
              ประกันคุณภาพ (QA)
            </label>
            <input
              type="text"
              value={evaluators.qaName}
              onChange={(e) => setEvaluators({ ...evaluators, qaName: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded border border-slate-200 bg-white text-slate-900 text-xs font-semibold focus:ring-2 focus:ring-blue-600 outline-none shadow-2xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] block">
              เจ้าหน้าที่สโตร์
            </label>
            <input
              type="text"
              value={evaluators.storeOfficerName}
              onChange={(e) => setEvaluators({ ...evaluators, storeOfficerName: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded border border-slate-200 bg-white text-slate-900 text-xs font-semibold focus:ring-2 focus:ring-blue-600 outline-none shadow-2xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] block">
              ผู้จัดการฝ่ายจัดซื้อ
            </label>
            <input
              type="text"
              value={evaluators.purchasingManagerName}
              onChange={(e) => setEvaluators({ ...evaluators, purchasingManagerName: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded border border-slate-200 bg-white text-slate-900 text-xs font-semibold focus:ring-2 focus:ring-blue-600 outline-none shadow-2xs"
            />
          </div>
        </div>

        <div className="space-y-1.5 pt-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] block">
            หมายเหตุหรือข้อเสนอแนะเพิ่มเติมสำหรับการประเมิน
          </label>
          <textarea
            rows={2}
            value={generalNotes}
            onChange={(e) => setGeneralNotes(e.target.value)}
            placeholder="รายละเอียดหรือบันทึกเพิ่มเติมสำหรับรอบนี้..."
            className="w-full px-4 py-3 rounded border border-slate-200 bg-white text-slate-900 text-xs font-medium focus:ring-2 focus:ring-blue-600 outline-none shadow-2xs resize-none"
          />
        </div>
      </div>

      {/* Sticky Bottom Bar with Geometric Balance High-Contrast Slate Theme */}
      <div className="sticky bottom-6 z-40 bg-slate-900 text-white p-5 rounded-xl shadow-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-5">
        {/* Score & Grade Display */}
        <div className="flex items-center space-x-6">
          <div>
            <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-[0.2em]">
              TOTAL SCORE
            </span>
            <div className="text-3xl font-mono font-bold text-emerald-400">
              {totalScore} <span className="text-xs text-slate-500 font-sans">/ 100</span>
            </div>
          </div>

          <div className="h-10 w-[1px] bg-slate-800" />

          <div className="flex items-center space-x-3.5">
            <div
              className={`w-12 h-12 rounded flex items-center justify-center text-xl font-bold font-mono border ${
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
                  <span className="text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> ผ่านเกณฑ์การประเมิน
                  </span>
                ) : (
                  <span className="text-rose-400 font-bold uppercase tracking-wider flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> ไม่ผ่านเกณฑ์ (ปรับปรุง)
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons in Geometric Balance Style */}
        <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
          <button
            type="button"
            onClick={() => onViewPrintable(currentEvaluationRecord)}
            className="px-4 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-bold uppercase tracking-wider transition border border-slate-700"
          >
            ดูตัวอย่างฟอร์มพิมพ์
          </button>

          <button
            type="button"
            onClick={handleTriggerSubmit}
            disabled={isSaving}
            className="flex-1 md:flex-initial bg-blue-600 hover:bg-blue-700 text-white py-3.5 px-6 rounded font-bold text-xs tracking-[0.2em] uppercase transition-all flex items-center justify-center space-x-3 shadow-xl shadow-blue-900/40 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>SYNCING TO SHEETS...</span>
              </>
            ) : (
              <>
                <FileSpreadsheet className="w-4 h-4" />
                <span>SUBMIT & SYNC TO G-SHEET</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Confirmation Modal Before Writing to Google Sheets */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl border border-slate-200 p-7 space-y-5">
            <div className="flex items-center space-x-3 text-blue-600">
              <div className="w-10 h-10 bg-blue-50 rounded flex items-center justify-center border border-blue-100">
                <FileSpreadsheet className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base uppercase tracking-tight">ยืนยันบันทึกผลการประเมิน</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">GOOGLE SHEETS AUTOMATION</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded border border-slate-200 text-xs space-y-2 text-slate-700 font-sans">
              <p>
                <strong className="text-slate-900">บริษัท:</strong> {supplier.companyName}
              </p>
              <p>
                <strong className="text-slate-900">งวดประเมิน:</strong> ครั้งที่ {supplier.evaluationRound}/{supplier.evaluationYear} ({supplier.evaluationMonth})
              </p>
              <p>
                <strong className="text-slate-900">คะแนนรวม:</strong> <span className="font-bold text-blue-600 font-mono">{totalScore} / 100</span> (เกรด {gradeInfo.grade})
              </p>
              <p>
                <strong className="text-slate-900">ไฟล์ปลายทาง:</strong> {sheetConfig?.spreadsheetTitle}
              </p>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              เมื่อกดยืนยัน ข้อมูลคะแนน 14 ข้อ พร้อมผลการตัดเกรดจะถูกบันทึกเป็นแถวใหม่ใน Google Spreadsheet ทันที
            </p>

            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmSubmit(false)}
                className="flex-1 py-3 text-xs font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-100 rounded border border-slate-200 transition"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleFinalSubmit}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider rounded shadow-md transition"
              >
                ยืนยันและส่งข้อมูล
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
