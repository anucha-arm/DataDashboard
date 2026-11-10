import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Copy, Check, Download, X, ExternalLink, QrCode as QrIcon, Users } from 'lucide-react';

interface QrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  surveyUrl: string;
  totalRespondents: number;
}

export const QrCodeModal: React.FC<QrCodeModalProps> = ({
  isOpen,
  onClose,
  surveyUrl,
  totalRespondents
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && canvasRef.current && surveyUrl) {
      QRCode.toCanvas(
        canvasRef.current,
        surveyUrl,
        {
          width: 320,
          margin: 2,
          color: {
            dark: '#0F1E36',
            light: '#FFFFFF'
          }
        },
        (error) => {
          if (error) console.error('QR code generation error:', error);
        }
      );
    }
  }, [isOpen, surveyUrl]);

  if (!isOpen) return null;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(surveyUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleDownloadQr = () => {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'training_survey_qrcode.png';
    link.href = url;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#E5E0D8] overflow-hidden flex flex-col md:flex-row text-slate-900">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-[#FAF8F5] hover:bg-[#F3EFEA] border border-[#E5E0D8] flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors"
          title="ปิด"
        >
          <X className="w-5 h-5" />
        </button>

        {/* QR Code Presentation Box */}
        <div className="bg-[#FAF8F5] p-8 flex flex-col items-center justify-center text-center md:w-1/2 border-b md:border-b-0 md:border-r border-[#E5E0D8]">
          <div className="p-3.5 bg-white rounded-2xl shadow-md border border-[#E5E0D8]">
            <canvas ref={canvasRef} className="block rounded-lg max-w-full h-auto" />
          </div>
          
          <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-[#1E3A8A] bg-blue-50 border border-blue-200 px-3.5 py-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
            <span>สแกนด้วยกล้องมือถือได้ทันที</span>
          </div>
        </div>

        {/* Info & Projector Callout */}
        <div className="p-6 md:p-8 md:w-1/2 flex flex-col justify-between bg-white">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#8C6D3F] mb-1">
              <QrIcon className="w-4 h-4" />
              <span>โหมดฉายขึ้นจอโปรเจกเตอร์</span>
            </div>
            
            <h3 className="text-xl font-bold text-[#0F1E36]">
              ร่วมตอบแบบประเมิน
            </h3>
            
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              ผู้เข้าร่วมอบรมสามารถใช้กล้องโทรศัพท์มือถือสแกน QR Code นี้เพื่อเข้าทำแบบประเมิน 5 ข้อได้ทันทีโดยไม่ต้องลงชื่อเข้าใช้
            </p>

            {/* Live Counter on projector */}
            <div className="mt-5 p-3.5 bg-[#EFF6FF] rounded-2xl border border-blue-200 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-blue-200 text-[#1E3A8A] flex items-center justify-center shrink-0 shadow-2xs">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-[#1E3A8A] block font-medium">ผู้ส่งแบบประเมินแล้ว</span>
                <span className="text-lg font-bold text-[#0F1E36] font-mono tabular-nums">
                  {totalRespondents} คน
                </span>
              </div>
            </div>

            {/* Direct URL Box */}
            <div className="mt-4">
              <span className="text-[11px] font-medium text-slate-500 block mb-1.5">
                ลิงก์ตรงสำหรับผู้ตอบ
              </span>
              <div className="flex items-center gap-2 p-1.5 pl-3 bg-[#FAF8F5] rounded-xl border border-[#E5E0D8] text-xs">
                <span className="truncate text-slate-700 font-mono text-[11px] flex-1">
                  {surveyUrl}
                </span>
                <button
                  onClick={handleCopyLink}
                  className="px-2.5 py-1.5 bg-white hover:bg-[#F3EFEA] text-[#0F1E36] rounded-lg font-medium shadow-2xs border border-[#E5E0D8] flex items-center gap-1 shrink-0 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-blue-600" />
                      <span className="text-[11px]">คัดลอกแล้ว</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span className="text-[11px]">คัดลอก</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-6 flex items-center gap-2 pt-4 border-t border-slate-100">
            <button
              onClick={handleDownloadQr}
              className="flex-1 py-2.5 px-3 bg-[#FAF8F5] hover:bg-[#F3EFEA] text-slate-700 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 border border-[#E5E0D8] transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>ดาวน์โหลดภาพ QR</span>
            </button>
            <a
              href={surveyUrl}
              target="_blank"
              rel="noreferrer"
              className="py-2.5 px-3.5 bg-[#1E3A8A] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span>เปิดหน้าตอบ</span>
            </a>
          </div>

        </div>

      </div>
    </div>
  );
};
