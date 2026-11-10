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
            dark: '#0A1326',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0F1E36] rounded-3xl shadow-2xl border border-[#1E2E4E] overflow-hidden flex flex-col md:flex-row text-slate-100">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-[#172540] hover:bg-[#1E3359] border border-[#273B63] flex items-center justify-center text-[#94A3B8] hover:text-white transition-colors"
          title="ปิด"
        >
          <X className="w-5 h-5" />
        </button>

        {/* QR Code Presentation Box (High contrast for projector & mobile scanning) */}
        <div className="bg-[#070E1E] p-8 flex flex-col items-center justify-center text-center md:w-1/2 border-b md:border-b-0 md:border-r border-[#1E2E4E]">
          <div className="p-3.5 bg-white rounded-2xl shadow-xl shadow-black/40">
            <canvas ref={canvasRef} className="block rounded-lg max-w-full h-auto" />
          </div>
          
          <div className="mt-4 flex items-center gap-2 text-xs font-medium text-amber-200 bg-[#16233B] border border-[#2E4268] px-3.5 py-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
            <span>สแกนด้วยกล้องมือถือได้ทันที</span>
          </div>
        </div>

        {/* Info & Projector Callout */}
        <div className="p-6 md:p-8 md:w-1/2 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#D4AF37] mb-1">
              <QrIcon className="w-4 h-4" />
              <span>โหมดฉายขึ้นจอโปรเจกเตอร์</span>
            </div>
            
            <h3 className="text-xl font-bold text-white">
              ร่วมตอบแบบประเมิน
            </h3>
            
            <p className="text-xs text-[#94A3B8] mt-1.5 leading-relaxed">
              ผู้เข้าร่วมอบรมสามารถใช้กล้องโทรศัพท์มือถือสแกน QR Code นี้เพื่อเข้าทำแบบประเมิน 5 ข้อได้ทันทีโดยไม่ต้องลงชื่อเข้าใช้
            </p>

            {/* Live Counter on projector */}
            <div className="mt-5 p-3.5 bg-[#121E36] rounded-2xl border border-[#1E2E4E] flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#1A2B4D] border border-[#2B4068] text-amber-200 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-[#94A3B8] block">ผู้ส่งแบบประเมินแล้ว</span>
                <span className="text-lg font-bold text-white font-mono tabular-nums">
                  {totalRespondents} คน
                </span>
              </div>
            </div>

            {/* Direct URL Box */}
            <div className="mt-4">
              <span className="text-[11px] font-medium text-[#94A3B8] block mb-1.5">
                ลิงก์ตรงสำหรับผู้ตอบ
              </span>
              <div className="flex items-center gap-2 p-1.5 pl-3 bg-[#0A1326] rounded-xl border border-[#1E2E4E] text-xs">
                <span className="truncate text-[#CBD5E1] font-mono text-[11px] flex-1">
                  {surveyUrl}
                </span>
                <button
                  onClick={handleCopyLink}
                  className="px-2.5 py-1.5 bg-[#172540] hover:bg-[#1E3359] text-white rounded-lg font-medium shadow-xs border border-[#273B63] flex items-center gap-1 shrink-0 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-blue-400" />
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
          <div className="mt-6 flex items-center gap-2 pt-4 border-t border-[#1E2E4E]">
            <button
              onClick={handleDownloadQr}
              className="flex-1 py-2.5 px-3 bg-[#121E36] hover:bg-[#1A2B4D] text-[#CBD5E1] text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 border border-[#1E2E4E] transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>ดาวน์โหลดภาพ QR</span>
            </button>
            <a
              href={surveyUrl}
              target="_blank"
              rel="noreferrer"
              className="py-2.5 px-3.5 bg-[#1D4ED8] hover:bg-blue-600 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-colors border border-blue-500"
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
