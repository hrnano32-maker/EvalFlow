export interface EvaluationCriterion {
  id: number;
  category: 'quality' | 'delivery' | 'performance';
  categoryTitle: string;
  title: string;
  maxScore: number;
  score: number;
  remark?: string;
  evaluator?: string;
}

export interface SupplierInfo {
  companyName: string;
  productType: string;
  businessAddress: string;
  phone: string;
  fax: string;
  coordinatorName: string;
  position: string;
  evaluationMonth: string;
  evaluationRound: string; // e.g. "1", "2", "3"
  evaluationYear: string;  // e.g. "69" or "2569"
}

export interface EvaluatorSignatures {
  purchaserName: string;
  purchaserDate?: string;
  purchaserSignature?: string; // Base64 data URL
  qaName: string;
  qaDate?: string;
  qaSignature?: string; // Base64 data URL
  storeOfficerName: string;
  storeOfficerDate?: string;
  storeOfficerSignature?: string; // Base64 data URL
  purchasingManagerName: string;
  purchasingManagerDate?: string;
  purchasingManagerSignature?: string; // Base64 data URL
  supplierConfirmName: string;
  supplierConfirmDate?: string;
  supplierConfirmSignature?: string; // Base64 data URL
}

export type GradeType = 'A' | 'B' | 'C' | 'D*';

export interface EvaluationRecord {
  id: string;
  timestamp: string;
  supplier: SupplierInfo;
  criteria: EvaluationCriterion[];
  totalScore: number;
  grade: GradeType;
  gradeLabel: string;
  isPassed: boolean;
  notes?: string;
  evaluators: EvaluatorSignatures;
  syncedToSheets?: boolean;
  sheetRowIndex?: number;
}

export interface GoogleSheetConfig {
  spreadsheetId: string;
  spreadsheetTitle: string;
  spreadsheetUrl: string;
  sheetName: string;
}
