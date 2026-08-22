import { EvaluationCriterion, SupplierInfo, EvaluatorSignatures } from '../types';

export const DEFAULT_CRITERIA: EvaluationCriterion[] = [
  // ด้านคุณภาพ (45 คะแนน)
  {
    id: 1,
    category: 'quality',
    categoryTitle: 'ด้านคุณภาพ (45 คะแนน)',
    title: 'การประเมินด้านคุณภาพของผลิตภัณฑ์ที่ส่งมอบ',
    maxScore: 15,
    score: 15,
    remark: '',
    evaluator: 'QA',
  },
  {
    id: 2,
    category: 'quality',
    categoryTitle: 'ด้านคุณภาพ (45 คะแนน)',
    title: 'การจัดส่งเอกสาร การตรวจสอบ ประกันคุณภาพของผลิตภัณฑ์ที่ส่งมอบ',
    maxScore: 5,
    score: 5,
    remark: '',
    evaluator: 'QA',
  },
  {
    id: 3,
    category: 'quality',
    categoryTitle: 'ด้านคุณภาพ (45 คะแนน)',
    title: 'การประเมินจำนวนครั้งที่เกิดปัญหาหลุดรอด ด้านคุณภาพ',
    maxScore: 10,
    score: 10,
    remark: '',
    evaluator: 'QA',
  },
  {
    id: 4,
    category: 'quality',
    categoryTitle: 'ด้านคุณภาพ (45 คะแนน)',
    title: 'การประเมิน ความร่วมมือในการแก้ไขปัญหาและระยะเวลา การตอบกลับปัญหา',
    maxScore: 5,
    score: 5,
    remark: '',
    evaluator: 'QA',
  },
  {
    id: 5,
    category: 'quality',
    categoryTitle: 'ด้านคุณภาพ (45 คะแนน)',
    title: 'การรบกวนกระบวนการของลูกค้า (การบริการด้าน Q)',
    maxScore: 10,
    score: 10,
    remark: '',
    evaluator: 'QA',
  },

  // ด้านการจัดส่ง (25 คะแนน)
  {
    id: 6,
    category: 'delivery',
    categoryTitle: 'ด้านการจัดส่ง (25 คะแนน)',
    title: 'การประเมินด้านความถูกต้องของผลิตภัณฑ์',
    maxScore: 10,
    score: 10,
    remark: '',
    evaluator: 'Store',
  },
  {
    id: 7,
    category: 'delivery',
    categoryTitle: 'ด้านการจัดส่ง (25 คะแนน)',
    title: 'การประเมินด้านสภาพการบรรจุหีบห่อ',
    maxScore: 5,
    score: 5,
    remark: '',
    evaluator: 'Store',
  },
  {
    id: 8,
    category: 'delivery',
    categoryTitle: 'ด้านการจัดส่ง (25 คะแนน)',
    title: 'การประเมินความถูกต้องของเอกสารในการจัดส่ง',
    maxScore: 5,
    score: 5,
    remark: '',
    evaluator: 'Store',
  },
  {
    id: 9,
    category: 'delivery',
    categoryTitle: 'ด้านการจัดส่ง (25 คะแนน)',
    title: 'การประเมินด้านค่าใช้จ่ายพิเศษในการส่งมอบ',
    maxScore: 5,
    score: 5,
    remark: '',
    evaluator: 'จัดซื้อ',
  },

  // ด้านส่งมอบ (30 คะแนน)
  {
    id: 10,
    category: 'performance',
    categoryTitle: 'ด้านส่งมอบ (30 คะแนน)',
    title: 'การประเมินความสามารถการส่งมอบได้ตามแผนเรียกเข้าที่กำหนด',
    maxScore: 10,
    score: 8,
    remark: '',
    evaluator: 'จัดซื้อ/สโตร์',
  },
  {
    id: 11,
    category: 'performance',
    categoryTitle: 'ด้านส่งมอบ (30 คะแนน)',
    title: 'การประเมินความร่วมมือในการตอบกลับเอกสาร PO',
    maxScore: 5,
    score: 5,
    remark: '',
    evaluator: 'จัดซื้อ',
  },
  {
    id: 12,
    category: 'performance',
    categoryTitle: 'ด้านส่งมอบ (30 คะแนน)',
    title: 'การประเมินความร่วมมือในการตอบกลับเอกสาร แผนเรียกเข้าชิ้นส่วน',
    maxScore: 5,
    score: 5,
    remark: '',
    evaluator: 'จัดซื้อ',
  },
  {
    id: 13,
    category: 'performance',
    categoryTitle: 'ด้านส่งมอบ (30 คะแนน)',
    title: 'การควบคุมผู้ให้บริการภายนอกด้านกระบวนการผลิตภัณฑ์ สถานะพิเศษที่ลูกค้าแจ้งตักเตือนซึ่งเป็นประเด็นปัญหาเกี่ยวข้องกับคุณภาพหรือการส่งมอบ',
    maxScore: 5,
    score: 5,
    remark: '',
    evaluator: 'QA/จัดซื้อ',
  },
  {
    id: 14,
    category: 'performance',
    categoryTitle: 'ด้านส่งมอบ (30 คะแนน)',
    title: 'เคลมคืนจากผู้ใช้งานพาหนะ',
    maxScore: 5,
    score: 5,
    remark: '',
    evaluator: 'QA',
  },
];

export const INITIAL_SUPPLIER: SupplierInfo = {
  companyName: 'ราโต้ดันดัสเตรียล (ประเทศไทย) จำกัด',
  productType: 'STAY, NUT',
  businessAddress: '104/65 ม.12 ต.บางปลา อ.บางพลี จ.สมุทรปราการ 10540',
  phone: '02-1746090-2',
  fax: '02-1746094',
  coordinatorName: 'สุชีดา',
  position: 'เจ้าหน้าที่ประสานงานขาย',
  evaluationMonth: 'พฤษภาคม 2569',
  evaluationRound: '5',
  evaluationYear: '69',
};

export const INITIAL_EVALUATORS: EvaluatorSignatures = {
  purchaserName: 'เจ้าหน้าที่จัดซื้อ',
  purchaserDate: new Date().toISOString().split('T')[0],
  qaName: 'ประกันคุณภาพ',
  qaDate: new Date().toISOString().split('T')[0],
  storeOfficerName: 'เจ้าหน้าที่สโตร์',
  storeOfficerDate: new Date().toISOString().split('T')[0],
  purchasingManagerName: 'ผู้จัดการฝ่ายจัดซื้อ',
  purchasingManagerDate: new Date().toISOString().split('T')[0],
  supplierConfirmName: 'ตัวแทนผู้ขาย',
  supplierConfirmDate: new Date().toISOString().split('T')[0],
};

export const MONTHS_THAI = [
  'มกราคม',
  'กุมภาพันธ์',
  'มีนาคม',
  'เมษายน',
  'พฤษภาคม',
  'มิถุนายน',
  'กรกฎาคม',
  'สิงหาคม',
  'กันยายน',
  'ตุลาคม',
  'พฤศจิกายน',
  'ธันวาคม',
];

export function calculateGrade(score: number): {
  grade: 'A' | 'B' | 'C' | 'D*';
  gradeLabel: string;
  isPassed: boolean;
  color: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
} {
  if (score >= 91) {
    return {
      grade: 'A',
      gradeLabel: 'ดีมาก (91-100)',
      isPassed: true,
      color: 'emerald',
      badgeBg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
      badgeBorder: 'border-emerald-300 dark:border-emerald-600',
      badgeText: 'text-emerald-700 dark:text-emerald-300',
    };
  } else if (score >= 81) {
    return {
      grade: 'B',
      gradeLabel: 'ดี (81-90)',
      isPassed: true,
      color: 'blue',
      badgeBg: 'bg-blue-500/10 dark:bg-blue-500/20',
      badgeBorder: 'border-blue-300 dark:border-blue-600',
      badgeText: 'text-blue-700 dark:text-blue-300',
    };
  } else if (score >= 71) {
    return {
      grade: 'C',
      gradeLabel: 'พอใช้ (71-80)',
      isPassed: true,
      color: 'amber',
      badgeBg: 'bg-amber-500/10 dark:bg-amber-500/20',
      badgeBorder: 'border-amber-300 dark:border-amber-600',
      badgeText: 'text-amber-700 dark:text-amber-300',
    };
  } else {
    return {
      grade: 'D*',
      gradeLabel: 'ปรับปรุง (0-70) *ไม่ผ่านเกณฑ์',
      isPassed: false,
      color: 'rose',
      badgeBg: 'bg-rose-500/10 dark:bg-rose-500/20',
      badgeBorder: 'border-rose-300 dark:border-rose-600',
      badgeText: 'text-rose-700 dark:text-rose-300',
    };
  }
}
