import React, { useState, useRef } from 'react';
import { Upload, X, PenTool, Image as ImageIcon } from 'lucide-react';

interface SignatureUploadBoxProps {
  id: string;
  roleTitle: string;
  roleSubtitle?: string;
  name: string;
  onNameChange: (name: string) => void;
  signatureImage?: string;
  onSignatureChange: (dataUrl?: string) => void;
  placeholderName?: string;
}

export const SignatureUploadBox: React.FC<SignatureUploadBoxProps> = ({
  id,
  roleTitle,
  roleSubtitle,
  name,
  onNameChange,
  signatureImage,
  onSignatureChange,
  placeholderName = 'ชื่อ-นามสกุล ผู้ลงนาม',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileProcess = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('กรุณาอัปโหลดไฟล์รูปภาพ (PNG, JPG, SVG, WebP)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        onSignatureChange(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleFileProcess(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      handleFileProcess(file);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSignatureChange(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/90 flex flex-col justify-between space-y-3">
      {/* Role Header */}
      <div>
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <PenTool className="w-3.5 h-3.5 text-blue-600" />
            <span>{roleTitle}</span>
          </label>
          {roleSubtitle && (
            <span className="text-[10px] text-slate-400 font-mono">{roleSubtitle}</span>
          )}
        </div>
      </div>

      {/* Signature Box (Upload / Preview) */}
      <div
        id={`sig-dropzone-${id}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative h-28 rounded-lg border-2 border-dashed flex flex-col items-center justify-center p-2 text-center transition-all cursor-pointer overflow-hidden ${
          signatureImage
            ? 'bg-white border-blue-300'
            : isDragging
            ? 'bg-blue-50/80 border-blue-500 scale-[1.01]'
            : 'bg-white/80 border-slate-200 hover:border-blue-400 hover:bg-blue-50/30'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png, image/jpeg, image/webp, image/svg+xml"
          onChange={handleFileChange}
          className="hidden"
          id={`file-input-${id}`}
        />

        {signatureImage ? (
          <div className="w-full h-full flex flex-col items-center justify-center relative group">
            <img
              src={signatureImage}
              alt={`ลายเซ็น ${roleTitle}`}
              referrerPolicy="no-referrer"
              className="max-h-20 max-w-full object-contain filter contrast-125"
            />
            {/* Hover Overlay Actions */}
            <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center gap-2">
              <span className="text-[11px] text-white font-medium flex items-center gap-1 bg-slate-800/80 px-2 py-1 rounded">
                <Upload className="w-3 h-3" /> เปลี่ยนรูป
              </span>
              <button
                type="button"
                onClick={handleRemove}
                className="p-1.5 rounded bg-rose-600 text-white hover:bg-rose-700 transition"
                title="ลบลายเซ็น"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-1.5 py-2">
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <Upload className="w-4 h-4" />
            </div>
            <div className="text-[11px] font-semibold text-slate-700">
              คลิกหรือลากรูปลายเซ็นมาวาง
            </div>
            <p className="text-[10px] text-slate-400">
              รองรับ PNG, JPG (พื้นหลังโปร่งใสได้)
            </p>
          </div>
        )}
      </div>

      {/* Signer Name Input */}
      <div className="space-y-1">
        <label className="text-[10.5px] font-medium text-slate-500 block">
          ชื่อผู้ลงนาม (พิมพ์ชื่อ-นามสกุล):
        </label>
        <input
          type="text"
          id={`sig-name-${id}`}
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder={placeholderName}
          className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-900 font-medium focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none shadow-2xs placeholder:text-slate-400"
        />
      </div>
    </div>
  );
};
