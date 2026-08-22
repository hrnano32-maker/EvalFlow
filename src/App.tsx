import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { EvaluationRecord, GoogleSheetConfig } from './types';
import {
  initAuth,
  googleSignIn,
  logout,
  getAccessToken,
  setAccessTokenManual,
} from './services/firebase';
import {
  createEvaluationSpreadsheet,
  appendEvaluationToSheet,
  fetchEvaluationsFromSheet,
} from './services/googleSheets';
import { DEFAULT_CRITERIA, INITIAL_SUPPLIER, INITIAL_EVALUATORS, calculateGrade } from './data/criteria';
import { Navbar } from './components/Navbar';
import { EvaluationForm } from './components/EvaluationForm';
import { HistoryDashboard } from './components/HistoryDashboard';
import { EvaluationPrintView } from './components/EvaluationPrintView';
import { GoogleSheetSyncModal } from './components/GoogleSheetSyncModal';
import { EmailConfirmModal } from './components/EmailConfirmModal';
import { Check, AlertCircle, FileSpreadsheet, X } from 'lucide-react';

// Seed sample historical records based on the user's PDF pages 1-5
const INITIAL_RECORDS: EvaluationRecord[] = [
  {
    id: 'EVAL_1',
    timestamp: '21/01/2569 09:30',
    supplier: {
      ...INITIAL_SUPPLIER,
      evaluationRound: '1',
      evaluationMonth: 'มกราคม 2569',
    },
    criteria: [
      { ...DEFAULT_CRITERIA[0], score: 13 },
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
    ],
    totalScore: 91,
    grade: 'A',
    gradeLabel: 'ดีมาก (91-100)',
    isPassed: true,
    evaluators: INITIAL_EVALUATORS,
    syncedToSheets: true,
  },
  {
    id: 'EVAL_2',
    timestamp: '20/02/2569 10:15',
    supplier: {
      ...INITIAL_SUPPLIER,
      evaluationRound: '2',
      evaluationMonth: 'กุมภาพันธ์ 2569',
    },
    criteria: [
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
    ],
    totalScore: 93,
    grade: 'A',
    gradeLabel: 'ดีมาก (91-100)',
    isPassed: true,
    evaluators: INITIAL_EVALUATORS,
    syncedToSheets: true,
  },
  {
    id: 'EVAL_3',
    timestamp: '22/03/2569 11:00',
    supplier: {
      ...INITIAL_SUPPLIER,
      evaluationRound: '3',
      evaluationMonth: 'มีนาคม 2569',
    },
    criteria: [
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
    ],
    totalScore: 93,
    grade: 'A',
    gradeLabel: 'ดีมาก (91-100)',
    isPassed: true,
    evaluators: INITIAL_EVALUATORS,
    syncedToSheets: true,
  },
  {
    id: 'EVAL_4',
    timestamp: '24/04/2569 14:20',
    supplier: {
      ...INITIAL_SUPPLIER,
      evaluationRound: '4',
      evaluationMonth: 'เมษายน 2569',
    },
    criteria: [
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
    ],
    totalScore: 93,
    grade: 'A',
    gradeLabel: 'ดีมาก (91-100)',
    isPassed: true,
    evaluators: INITIAL_EVALUATORS,
    syncedToSheets: true,
  },
  {
    id: 'EVAL_5',
    timestamp: '21/05/2569 15:45',
    supplier: {
      ...INITIAL_SUPPLIER,
      evaluationRound: '5',
      evaluationMonth: 'พฤษภาคม 2569',
    },
    criteria: [
      { ...DEFAULT_CRITERIA[0], score: 15 },
      { ...DEFAULT_CRITERIA[1], score: 5 },
      { ...DEFAULT_CRITERIA[2], score: 5 },
      { ...DEFAULT_CRITERIA[3], score: 5 },
      { ...DEFAULT_CRITERIA[4], score: 10 },
      { ...DEFAULT_CRITERIA[5], score: 10 },
      { ...DEFAULT_CRITERIA[6], score: 5 },
      { ...DEFAULT_CRITERIA[7], score: 5 },
      { ...DEFAULT_CRITERIA[8], score: 5 },
      { ...DEFAULT_CRITERIA[9], score: 9 },
      { ...DEFAULT_CRITERIA[10], score: 5 },
      { ...DEFAULT_CRITERIA[11], score: 5 },
      { ...DEFAULT_CRITERIA[12], score: 5 },
      { ...DEFAULT_CRITERIA[13], score: 5 },
    ],
    totalScore: 94,
    grade: 'A',
    gradeLabel: 'ดีมาก (91-100)',
    isPassed: true,
    evaluators: INITIAL_EVALUATORS,
    syncedToSheets: true,
  },
];

export default function App() {
  const [activeView, setActiveView] = useState<'form' | 'history' | 'print'>('form');
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingSheet, setIsLoadingSheet] = useState(false);

  const [records, setRecords] = useState<EvaluationRecord[]>(() => {
    const saved = localStorage.getItem('supplier_eval_records');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_RECORDS;
      }
    }
    return INITIAL_RECORDS;
  });

  const [sheetConfig, setSheetConfig] = useState<GoogleSheetConfig | null>(() => {
    const saved = localStorage.getItem('supplier_eval_sheet_config');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [selectedRecordForPrint, setSelectedRecordForPrint] = useState<EvaluationRecord>(INITIAL_RECORDS[0]);
  const [selectedRecordForEmail, setSelectedRecordForEmail] = useState<EvaluationRecord | null>(null);
  const [isSheetModalOpen, setIsSheetModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Initialize Firebase Auth listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (authUser, token) => {
        setUser(authUser);
        setAccessToken(token);
      },
      () => {
        setUser(null);
        setAccessToken(null);
      }
    );
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Sync records to localStorage
  useEffect(() => {
    localStorage.setItem('supplier_eval_records', JSON.stringify(records));
  }, [records]);

  // Sync sheetConfig to localStorage
  useEffect(() => {
    if (sheetConfig) {
      localStorage.setItem('supplier_eval_sheet_config', JSON.stringify(sheetConfig));
    }
  }, [sheetConfig]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setAccessToken(result.accessToken);
        showToast(`ยินดีต้อนรับคุณ ${result.user.displayName || 'เข้าสู่ระบบ'}`, 'success');

        // If no sheet config yet, prompt user or auto create
        if (!sheetConfig) {
          setIsSheetModalOpen(true);
        }
      }
    } catch (err: any) {
      showToast(err.message || 'เข้าสู่ระบบไม่สำเร็จ', 'error');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setAccessToken(null);
    showToast('ออกจากระบบเรียบร้อยแล้ว', 'info');
  };

  const handleSaveRecord = async (newRecord: EvaluationRecord) => {
    setIsSaving(true);
    try {
      let currentToken = accessToken || (await getAccessToken());

      // If user is signed in & has Google Sheets config, append to Google Sheets
      if (currentToken && sheetConfig) {
        await appendEvaluationToSheet(currentToken, sheetConfig.spreadsheetId, newRecord);
        newRecord.syncedToSheets = true;
        showToast(
          `บันทึกผลการประเมินลงใน Google Sheets "${sheetConfig.spreadsheetTitle}" สำเร็จ!`,
          'success'
        );
      } else {
        showToast('บันทึกผลการประเมินในเครื่องเรียบร้อยแล้ว', 'success');
      }

      setRecords((prev) => [newRecord, ...prev]);
      setSelectedRecordForPrint(newRecord);
      setActiveView('history');
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'บันทึกเข้า Google Sheets ไม่สำเร็จ', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRefreshFromSheet = async () => {
    let currentToken = accessToken || (await getAccessToken());
    if (!currentToken) {
      showToast('กรุณาเข้าสู่ระบบ Google ก่อนดึงข้อมูล', 'error');
      return;
    }
    if (!sheetConfig) {
      setIsSheetModalOpen(true);
      return;
    }

    setIsLoadingSheet(true);
    try {
      const rows = await fetchEvaluationsFromSheet(currentToken, sheetConfig.spreadsheetId);
      if (rows && rows.length > 0) {
        showToast(`ดึงข้อมูลจาก Google Sheets สำเร็จ (${rows.length} แถว)`, 'success');
      } else {
        showToast('ไม่พบแถวข้อมูลใหม่ใน Google Sheets', 'info');
      }
    } catch (err: any) {
      showToast(err.message || 'ดึงข้อมูลไม่สำเร็จ', 'error');
    } finally {
      setIsLoadingSheet(false);
    }
  };

  const handleViewPrintable = (record: EvaluationRecord) => {
    setSelectedRecordForPrint(record);
    setActiveView('print');
  };

  const handleOpenEmailModal = (record: EvaluationRecord) => {
    if (!user || !accessToken) {
      showToast('กรุณาเข้าสู่ระบบ Google ก่อนส่งอีเมลแจ้งผล', 'error');
      handleLogin();
      return;
    }
    setSelectedRecordForEmail(record);
    setIsEmailModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#1e293b] flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Geometric Balance Header / Navbar */}
      <div className="print:hidden">
        <Navbar
          activeView={activeView}
          setActiveView={setActiveView}
          user={user}
          sheetConfig={sheetConfig}
          onLogin={handleLogin}
          onLogout={handleLogout}
          onOpenSheetModal={() => setIsSheetModalOpen(true)}
          isLoggingIn={isLoggingIn}
        />
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-24 right-6 z-50 animate-slideIn print:hidden">
          <div
            className={`flex items-center space-x-3 px-4 py-3 rounded border text-xs font-bold uppercase tracking-wider shadow-xl max-w-sm ${
              toast.type === 'success'
                ? 'bg-slate-900 text-white border-emerald-500/80 shadow-slate-900/20'
                : toast.type === 'error'
                ? 'bg-rose-600 text-white border-rose-700 shadow-rose-900/20'
                : 'bg-slate-900 text-white border-slate-700'
            }`}
          >
            {toast.type === 'success' ? (
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-300 shrink-0" />
            )}
            <span className="flex-1 font-sans normal-case text-xs font-semibold">{toast.message}</span>
            <button onClick={() => setToast(null)} className="p-1 text-slate-400 hover:text-white transition">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto print:p-0 print:m-0 print:max-w-full">
        {activeView === 'form' && (
          <EvaluationForm
            accessToken={accessToken}
            sheetConfig={sheetConfig}
            records={records}
            onPromptLogin={handleLogin}
            onOpenSheetModal={() => setIsSheetModalOpen(true)}
            onSaveRecord={handleSaveRecord}
            isSaving={isSaving}
            onViewPrintable={handleViewPrintable}
          />
        )}

        {activeView === 'history' && (
          <HistoryDashboard
            records={records}
            sheetConfig={sheetConfig}
            onRefreshFromSheet={handleRefreshFromSheet}
            isLoadingSheet={isLoadingSheet}
            onSelectRecordToView={handleViewPrintable}
            onSelectRecordToEmail={handleOpenEmailModal}
            onOpenSheetModal={() => setIsSheetModalOpen(true)}
          />
        )}

        {activeView === 'print' && (
          <EvaluationPrintView
            record={selectedRecordForPrint}
            sheetUrl={sheetConfig?.spreadsheetUrl}
            onBack={() => setActiveView('form')}
            onSendEmail={() => handleOpenEmailModal(selectedRecordForPrint)}
          />
        )}
      </main>

      {/* Geometric Balance Footer */}
      <footer className="print:hidden h-14 border-t border-slate-200 bg-white px-6 sm:px-12 flex flex-col sm:flex-row items-center justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 gap-2">
        <div className="flex items-center space-x-3">
          <div className="w-2 h-2 bg-emerald-500 rounded-full" />
          <span>System Online — Google Drive API v3 &bull; Sheets v4</span>
        </div>
        <div className="flex items-center space-x-6 sm:space-x-10 text-slate-500">
          <span>FM-PU-006-00</span>
          <span>© 2026 EvalFlow Engine</span>
        </div>
      </footer>

      {/* Google Sheet Sync Modal */}
      <GoogleSheetSyncModal
        isOpen={isSheetModalOpen}
        onClose={() => setIsSheetModalOpen(false)}
        accessToken={accessToken}
        currentConfig={sheetConfig}
        onConfigSaved={(cfg) => {
          setSheetConfig(cfg);
          showToast(`เชื่อมโยง Google Sheet "${cfg.spreadsheetTitle}" สำเร็จ`, 'success');
        }}
        onPromptLogin={handleLogin}
      />

      {/* Email Confirm Modal */}
      <EmailConfirmModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        record={selectedRecordForEmail}
        accessToken={accessToken}
        sheetUrl={sheetConfig?.spreadsheetUrl}
        senderEmail={user?.email || undefined}
        onSuccess={() => {
          showToast('ส่งอีเมลแจ้งผลประเมินสำเร็จเรียบร้อย', 'success');
        }}
      />
    </div>
  );
}
