import React, { useState, useEffect } from 'react';
import { GoogleSheetConfig } from '../types';
import { createEvaluationSpreadsheet, listSpreadsheets } from '../services/googleSheets';
import { FileSpreadsheet, Plus, ExternalLink, Check, Loader2, Search, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  accessToken: string | null;
  currentConfig: GoogleSheetConfig | null;
  onConfigSaved: (config: GoogleSheetConfig) => void;
  onPromptLogin: () => void;
}

export const GoogleSheetSyncModal: React.FC<Props> = ({
  isOpen,
  onClose,
  accessToken,
  currentConfig,
  onConfigSaved,
  onPromptLogin,
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'existing'>('create');
  const [newTitle, setNewTitle] = useState('แบบประเมินผู้ขาย_Supplier_Evaluations');
  const [isCreating, setIsCreating] = useState(false);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [files, setFiles] = useState<Array<{ id: string; name: string; modifiedTime: string }>>([]);
  const [selectedFileId, setSelectedFileId] = useState<string>('');
  const [searchFilter, setSearchFilter] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && accessToken && activeTab === 'existing') {
      loadDriveFiles();
    }
  }, [isOpen, accessToken, activeTab]);

  const loadDriveFiles = async () => {
    if (!accessToken) return;
    setIsLoadingFiles(true);
    setError(null);
    try {
      const list = await listSpreadsheets(accessToken);
      setFiles(list);
    } catch (err: any) {
      setError(err.message || 'ไม่สามารถดึงรายชื่อไฟล์จาก Google Drive ได้');
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handleCreateNew = async () => {
    if (!accessToken) {
      onPromptLogin();
      return;
    }
    setIsCreating(true);
    setError(null);
    try {
      const config = await createEvaluationSpreadsheet(accessToken, newTitle.trim() || 'แบบประเมินผู้ขาย_Supplier_Evaluations');
      onConfigSaved(config);
      setSuccessMsg(`สร้าง Google Sheets เรียบร้อยแล้ว!`);
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'สร้างไฟล์ไม่สำเร็จ');
    } finally {
      setIsCreating(false);
    }
  };

  const handleSelectExisting = (file: { id: string; name: string }) => {
    const config: GoogleSheetConfig = {
      spreadsheetId: file.id,
      spreadsheetTitle: file.name,
      spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${file.id}/edit`,
      sheetName: 'บันทึกการประเมินผู้ขาย',
    };
    onConfigSaved(config);
    setSuccessMsg(`เชื่อมโยงกับ ${file.name} เรียบร้อยแล้ว!`);
    setTimeout(() => {
      setSuccessMsg(null);
      onClose();
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn font-ui">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 sm:px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">INTEGRATION</div>
              <h3 className="font-bold text-slate-900 text-lg leading-tight">ตั้งค่า Google Sheets</h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {!accessToken ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100">
                <FileSpreadsheet className="w-7 h-7" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-base">เข้าสู่ระบบด้วย Google ก่อนดำเนินการ</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
                  จำเป็นต้องให้สิทธิ์เข้าถึง Google Sheets &amp; Google Drive เพื่อสร้างและบันทึกข้อมูลคะแนนประเมินเข้าสู่ระบบอัตโนมัติ
                </p>
              </div>
              <button
                type="button"
                onClick={onPromptLogin}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold uppercase tracking-wider shadow-xs transition inline-flex items-center space-x-2"
              >
                <span>เข้าสู่ระบบ Google ทันที</span>
              </button>
            </div>
          ) : (
            <>
              {/* Current Active Sheet Info */}
              {currentConfig && (
                <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <div className="p-1.5 rounded bg-emerald-100 text-emerald-800">
                      <Check className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">กำลังเชื่อมต่อกับ:</p>
                      <p className="text-xs font-bold text-slate-900 truncate">{currentConfig.spreadsheetTitle}</p>
                    </div>
                  </div>
                  <a
                    href={currentConfig.spreadsheetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0 text-xs font-bold uppercase tracking-wider text-emerald-800 hover:underline flex items-center space-x-1 px-3 py-1.5 bg-white rounded border border-emerald-300 shadow-2xs"
                  >
                    <span>เปิด Sheet</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              {/* Tab Selector */}
              <div className="flex border-b border-slate-200 space-x-4">
                <button
                  type="button"
                  onClick={() => setActiveTab('create')}
                  className={`pb-2.5 px-2 text-xs font-bold uppercase tracking-wider border-b-2 transition ${
                    activeTab === 'create'
                      ? 'border-emerald-600 text-emerald-700'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Plus className="w-4 h-4 inline mr-1" />
                  สร้าง Google Sheet ใหม่
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('existing')}
                  className={`pb-2.5 px-2 text-xs font-bold uppercase tracking-wider border-b-2 transition ${
                    activeTab === 'existing'
                      ? 'border-emerald-600 text-emerald-700'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <FileSpreadsheet className="w-4 h-4 inline mr-1" />
                  เลือกจาก Google Drive
                </button>
              </div>

              {error && (
                <div className="p-3 text-xs text-rose-700 bg-rose-50 rounded border border-rose-200">
                  {error}
                </div>
              )}

              {successMsg && (
                <div className="p-3 text-xs text-emerald-800 bg-emerald-50 rounded border border-emerald-300 flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold">{successMsg}</span>
                </div>
              )}

              {activeTab === 'create' ? (
                <div className="space-y-4 pt-1">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      ชื่อไฟล์ Google Spreadsheet ที่ต้องการสร้าง
                    </label>
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="เช่น แบบประเมินผู้ขาย_Supplier_Evaluations_2569"
                      className="w-full px-4 py-2.5 rounded border border-slate-200 bg-white text-slate-900 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none shadow-2xs"
                    />
                  </div>

                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 space-y-2">
                    <p className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">
                      ตารางจะถูกสร้างพร้อมหัวข้อทางการ FM-PU-006-00 อัตโนมัติ:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-slate-600 text-[11px] leading-relaxed">
                      <li>ข้อมูลบริษัท, ผู้ขาย, รอบการประเมิน, ประจำเดือน</li>
                      <li>คะแนนรายข้อทั้ง 14 ข้อ (คุณภาพ 45 คะแนน, จัดส่ง 25 คะแนน, ส่งมอบ 30 คะแนน)</li>
                      <li>คะแนนรวม 100 คะแนน, เกรด (A/B/C/D*), สถานะผ่าน/ไม่ผ่านเกณฑ์</li>
                      <li>รายชื่อผู้ประเมินทุกฝ่าย (จัดซื้อ, QA, สโตร์, ผู้จัดการ)</li>
                    </ul>
                  </div>

                  <button
                    type="button"
                    onClick={handleCreateNew}
                    disabled={isCreating}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded shadow-xs transition flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>กำลังสร้าง Google Sheet และใส่โครงสร้างตาราง...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        <span>สร้างไฟล์สเปรดชีตและเริ่มใช้งาน</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="space-y-3 pt-1">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="text"
                      placeholder="ค้นหาชื่อ Google Sheet ใน Drive..."
                      value={searchFilter}
                      onChange={(e) => setSearchFilter(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded border border-slate-200 bg-white text-slate-900 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none shadow-2xs"
                    />
                  </div>

                  <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                    {isLoadingFiles ? (
                      <div className="py-8 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
                        <span>กำลังค้นหา Google Sheets จาก Google Drive...</span>
                      </div>
                    ) : files.length === 0 ? (
                      <div className="py-6 text-center text-slate-400 text-xs">
                        ไม่พบ Google Sheets ใน Drive หรือคุณสามารถสร้างไฟล์ใหม่ได้ที่แท็บด้านบน
                      </div>
                    ) : (
                      files
                        .filter((f) => f.name.toLowerCase().includes(searchFilter.toLowerCase()))
                        .map((f) => (
                          <div
                            key={f.id}
                            onClick={() => handleSelectExisting(f)}
                            className="p-3.5 rounded border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 cursor-pointer transition flex items-center justify-between shadow-2xs"
                          >
                            <div className="flex items-center space-x-3 min-w-0">
                              <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
                              <div className="truncate">
                                <p className="text-xs font-bold text-slate-900 truncate">{f.name}</p>
                                <p className="text-[10px] text-slate-400 font-mono">
                                  แก้ไขล่าสุด: {new Date(f.modifiedTime).toLocaleDateString('th-TH')}
                                </p>
                              </div>
                            </div>
                            <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded shrink-0">
                              เลือก
                            </span>
                          </div>
                        ))
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-200/60 rounded transition"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
