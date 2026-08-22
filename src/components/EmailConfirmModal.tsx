import React, { useState } from 'react';
import { EvaluationRecord } from '../types';
import { sendEvaluationEmail } from '../services/gmail';
import { Mail, Send, Loader2, Check, AlertCircle, X, ShieldCheck } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  record: EvaluationRecord | null;
  accessToken: string | null;
  sheetUrl?: string;
  senderEmail?: string;
  onSuccess?: () => void;
}

export const EmailConfirmModal: React.FC<Props> = ({
  isOpen,
  onClose,
  record,
  accessToken,
  sheetUrl,
  senderEmail,
  onSuccess,
}) => {
  const [recipientEmail, setRecipientEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !record) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) {
      setErrorMsg('กรุณาเข้าสู่ระบบ Google ก่อนส่งอีเมล');
      setStatus('error');
      return;
    }
    if (!recipientEmail || !recipientEmail.includes('@')) {
      setErrorMsg('กรุณาระบุอีเมลผู้รับที่ถูกต้อง');
      setStatus('error');
      return;
    }

    setIsSending(true);
    setErrorMsg('');
    setStatus('idle');

    try {
      await sendEvaluationEmail(accessToken, {
        to: recipientEmail.trim(),
        senderEmail,
        record,
        sheetUrl,
      });
      setStatus('success');
      if (onSuccess) onSuccess();
      setTimeout(() => {
        setStatus('idle');
        onClose();
      }, 1500);
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการส่งอีเมล');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn font-ui">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 sm:px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">NOTIFICATION</div>
              <h3 className="font-bold text-slate-900 text-lg leading-tight">ยืนยันส่งอีเมลแจ้งผลประเมิน</h3>
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

        {/* Body */}
        <form onSubmit={handleSend} className="p-6 space-y-5">
          <div className="p-4 bg-blue-50/60 rounded-lg border border-blue-100 text-xs text-blue-900 flex items-start space-x-3">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-bold uppercase tracking-wider text-[10px]">การแจ้งเตือนทางการ:</span> ระบบจะส่งอีเมลสรุปผลประเมินของ{' '}
              <strong>{record.supplier.companyName}</strong> (เกรด <strong>{record.grade}</strong>, คะแนน{' '}
              <strong>{record.totalScore}</strong>/100) ไปยังอีเมลที่ระบุด้านล่าง
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              อีเมลผู้รับ (เช่น ตัวแทนผู้ขาย หรือ ผู้จัดการฝ่ายจัดซื้อ)
            </label>
            <input
              type="email"
              required
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="supplier@company.com หรือ manager@mycompany.com"
              className="w-full px-4 py-2.5 rounded border border-slate-200 bg-white text-slate-900 text-xs font-medium focus:ring-2 focus:ring-blue-600 outline-none shadow-2xs placeholder:text-slate-400"
            />
          </div>

          {/* Preview Card */}
          <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 text-xs space-y-2.5 text-slate-700">
            <div className="flex justify-between items-center pb-2.5 border-b border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">หัวข้ออีเมล:</span>
              <span className="font-bold text-slate-800 truncate max-w-[280px]">
                [ผลการประเมินผู้ขาย] {record.supplier.companyName} (เกรด {record.grade})
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
              <div>
                <span className="text-slate-400 font-sans">งวดประเมิน:</span> {record.supplier.evaluationMonth}
              </div>
              <div>
                <span className="text-slate-400 font-sans">ครั้งที่:</span> #{record.supplier.evaluationRound} / {record.supplier.evaluationYear}
              </div>
              <div>
                <span className="text-slate-400 font-sans">คะแนนรวม:</span>{' '}
                <span className="font-bold text-slate-900">{record.totalScore} / 100</span>
              </div>
              <div>
                <span className="text-slate-400 font-sans">ผลการประเมิน:</span>{' '}
                <span className={`font-bold ${record.isPassed ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {record.isPassed ? 'ผ่านเกณฑ์' : 'ไม่ผ่านเกณฑ์'}
                </span>
              </div>
            </div>
          </div>

          {status === 'error' && (
            <div className="p-3 text-xs text-rose-700 bg-rose-50 rounded border border-rose-200 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {status === 'success' && (
            <div className="p-3 text-xs text-emerald-800 bg-emerald-50 rounded border border-emerald-300 flex items-center space-x-2">
              <Check className="w-4 h-4 shrink-0 text-emerald-600" />
              <span className="font-semibold">ส่งอีเมลเรียบร้อยแล้ว!</span>
            </div>
          )}

          {/* Buttons */}
          <div className="flex space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-100 rounded transition border border-slate-200"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isSending}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded shadow-xs transition flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isSending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>กำลังส่ง...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>ยืนยันส่งอีเมล</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
