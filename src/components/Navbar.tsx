import React from 'react';
import { User } from 'firebase/auth';
import { GoogleSheetConfig } from '../types';
import {
  FileSpreadsheet,
  Layers,
  Printer,
  PlusCircle,
  LogOut,
  ExternalLink,
  Settings2,
  CheckCircle2,
  AlertCircle,
  Activity,
} from 'lucide-react';

interface Props {
  activeView: 'form' | 'history' | 'print';
  setActiveView: (view: 'form' | 'history' | 'print') => void;
  user: User | null;
  sheetConfig: GoogleSheetConfig | null;
  onLogin: () => void;
  onLogout: () => void;
  onOpenSheetModal: () => void;
  isLoggingIn: boolean;
}

export const Navbar: React.FC<Props> = ({
  activeView,
  setActiveView,
  user,
  sheetConfig,
  onLogin,
  onLogout,
  onOpenSheetModal,
  isLoggingIn,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          {/* Logo & System Title */}
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-black text-lg shadow-sm shadow-blue-500/20 shrink-0">
              E
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 font-ui">
                  ระบบประเมินผู้ขาย
                </span>
                <span className="hidden sm:inline-flex items-center text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200/80 uppercase tracking-wider font-mono">
                  FM-PU-006-00
                </span>
              </div>
              <p className="text-[10.5px] text-slate-400 font-medium tracking-wide">
                Supplier Evaluation &bull; Google Sheets Sync
              </p>
            </div>
          </div>

          {/* Navigation Tabs - Modern Segmented Control */}
          <nav className="hidden lg:flex items-center space-x-1 p-1 bg-slate-100/90 rounded-xl border border-slate-200/80">
            <button
              onClick={() => setActiveView('form')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                activeView === 'form'
                  ? 'bg-white text-blue-700 shadow-sm border border-slate-200/80 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5 text-blue-600" />
              <span>แบบประเมินผู้ขาย</span>
            </button>

            <button
              onClick={() => setActiveView('history')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                activeView === 'history'
                  ? 'bg-white text-blue-700 shadow-sm border border-slate-200/80 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              <span>ประวัติและสถิติ</span>
            </button>

            <button
              onClick={() => setActiveView('print')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                activeView === 'print'
                  ? 'bg-white text-blue-700 shadow-sm border border-slate-200/80 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Printer className="w-3.5 h-3.5 text-blue-600" />
              <span>ฟอร์มทางการ A4</span>
            </button>
          </nav>

          {/* Right Action Controls: Google Sheets Status + User Auth */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Live Sheet Status Indicator */}
            {user ? (
              sheetConfig ? (
                <div className="flex items-center space-x-2 text-[11px] font-semibold text-emerald-700 bg-emerald-50/90 px-3.5 py-1.5 rounded-lg border border-emerald-200/80 shadow-2xs">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="max-w-[110px] sm:max-w-[160px] truncate font-medium">
                    {sheetConfig.spreadsheetTitle}
                  </span>
                  <a
                    href={sheetConfig.spreadsheetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-700 hover:text-emerald-900 p-0.5 transition"
                    title="เปิดดูใน Google Sheets"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={onOpenSheetModal}
                    className="text-slate-400 hover:text-slate-600 p-0.5 transition"
                    title="ตั้งค่า Google Sheet"
                  >
                    <Settings2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={onOpenSheetModal}
                  className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg border border-amber-300 bg-amber-50 text-amber-900 text-xs font-semibold hover:bg-amber-100 transition shadow-2xs"
                >
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  <span>เชื่อมโยง Google Sheet</span>
                </button>
              )
            ) : null}

            <div className="hidden sm:block h-7 w-[1px] bg-slate-200" />

            {/* Reference / User Block */}
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="hidden xl:block text-right">
                  <p className="text-xs font-bold text-slate-800 leading-tight">
                    {user.displayName || 'ผู้ใช้งาน'}
                  </p>
                  <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider truncate max-w-[130px]">
                    {user.email}
                  </p>
                </div>

                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    referrerPolicy="no-referrer"
                    className="w-9 h-9 rounded-full border border-slate-200 ring-2 ring-blue-50"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                    {user.displayName?.[0] || 'U'}
                  </div>
                )}

                <button
                  onClick={onLogout}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  title="ออกจากระบบ"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onLogin}
                disabled={isLoggingIn}
                className="text-xs font-semibold py-2 px-4 rounded-lg border border-slate-200/80 bg-white hover:bg-slate-50 text-slate-800 shadow-2xs flex items-center space-x-2.5 transition disabled:opacity-50"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                  <path fill="none" d="M0 0h48v48H0z"></path>
                </svg>
                <span>{isLoggingIn ? 'กำลังเชื่อมต่อ...' : 'เข้าสู่ระบบ'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="flex lg:hidden border-t border-slate-200/80 py-2.5 space-x-2 overflow-x-auto">
          <button
            onClick={() => setActiveView('form')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold text-center whitespace-nowrap transition ${
              activeView === 'form'
                ? 'bg-blue-600 text-white shadow-xs font-bold'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            แบบประเมินผู้ขาย
          </button>
          <button
            onClick={() => setActiveView('history')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold text-center whitespace-nowrap transition ${
              activeView === 'history'
                ? 'bg-blue-600 text-white shadow-xs font-bold'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            ประวัติและสถิติ
          </button>
          <button
            onClick={() => setActiveView('print')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold text-center whitespace-nowrap transition ${
              activeView === 'print'
                ? 'bg-blue-600 text-white shadow-xs font-bold'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            ฟอร์มทางการ A4
          </button>
        </div>
      </div>
    </header>
  );
};
