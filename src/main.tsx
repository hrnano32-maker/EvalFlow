import React, { StrictMode, Component, ErrorInfo, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('App crashed with error:', error, errorInfo);
  }

  handleReset = () => {
    localStorage.removeItem('supplier_eval_records');
    localStorage.removeItem('supplier_eval_sheet_config');
    window.location.reload();
  };

  override render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-slate-800">
          <div className="max-w-md w-full bg-white p-8 rounded-xl border border-slate-200 shadow-lg text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto text-xl font-bold">
              !
            </div>
            <h2 className="text-lg font-bold text-slate-900">เกิดข้อผิดพลาดในการโหลดระบบ</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              {this.state.error?.message || 'ไม่สามารถโหลดส่วนติดต่อผู้ใช้ได้ กรุณากดปุ่มรีโหลดเพื่อเริ่มต้นใหม่'}
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider rounded transition"
              >
                รีโหลดหน้าเว็บ (Reload)
              </button>
              <button
                type="button"
                onClick={this.handleReset}
                className="w-full py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium rounded transition"
              >
                ล้างข้อมูลแคชและรีเซ็ตระบบ
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
