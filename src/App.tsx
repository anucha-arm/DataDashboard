import { useState, useEffect } from 'react';
import { FeedbackSubmission } from './types/feedback';
import { storageService } from './services/storage';
import { SurveyView } from './components/SurveyView';
import { DashboardView } from './components/DashboardView';
import { QrCodeModal } from './components/QrCodeModal';
import { FirebaseDeployGuideModal } from './components/FirebaseDeployGuideModal';
import { Smartphone, LayoutDashboard, QrCode, BookOpen, Bell } from 'lucide-react';

export default function App() {
  const [currentMode, setCurrentMode] = useState<'survey' | 'dashboard'>('dashboard');
  const [submissions, setSubmissions] = useState<FeedbackSubmission[]>([]);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isDeployGuideOpen, setIsDeployGuideOpen] = useState(false);
  const [toastNotification, setToastNotification] = useState<string | null>(null);

  // Initialize and read URL query parameters (?mode=survey or ?mode=dashboard)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const modeParam = params.get('mode');
      if (modeParam === 'survey') {
        setCurrentMode('survey');
      } else if (modeParam === 'dashboard') {
        setCurrentMode('dashboard');
      }
    }

    // Subscribe to storage service
    let prevCount = 0;
    const unsubscribe = storageService.subscribe((updated) => {
      setSubmissions(updated);
      if (prevCount > 0 && updated.length > prevCount) {
        setToastNotification('มีผู้ตอบแบบประเมินรายใหม่เข้ามา! (อัปเดตเรียลไทม์)');
        setTimeout(() => setToastNotification(null), 3500);
      }
      prevCount = updated.length;
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleModeChange = (mode: 'survey' | 'dashboard') => {
    setCurrentMode(mode);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('mode', mode);
      window.history.replaceState({}, '', url.toString());
    }
  };

  // Direct survey URL for QR Code
  const surveyUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}${window.location.pathname}?mode=survey`
      : 'https://example.com?mode=survey';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Toast Notification for Real-Time submissions */}
      {toastNotification && (
        <div className="fixed top-4 right-4 z-50 p-3.5 bg-emerald-600 text-white rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-top-4 duration-300">
          <Bell className="w-4 h-4 animate-bounce" />
          <span>{toastNotification}</span>
        </div>
      )}

      {/* Mode Switcher Floating Ribbon (Formal Navy, Slate, and Beige theme) */}
      <div className="sticky top-0 z-40 bg-[#070E1E]/90 backdrop-blur-md border-b border-[#1E2E4E] py-2 px-4 text-slate-100">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          
          {/* Segmented Mode Control */}
          <div className="flex items-center gap-1 bg-[#101C33] p-1 rounded-xl border border-[#1E2E4E]">
            <button
              onClick={() => handleModeChange('dashboard')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
                currentMode === 'dashboard'
                  ? 'bg-[#1D4ED8] text-white shadow-xs'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>หน้า Dashboard (จอโปรเจกเตอร์)</span>
            </button>

            <button
              onClick={() => handleModeChange('survey')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
                currentMode === 'survey'
                  ? 'bg-[#1D4ED8] text-white shadow-xs'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>หน้าแบบสอบถาม (มือถือผู้เข้าอบรม)</span>
            </button>
          </div>

          {/* Quick Helper Tools */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsQrModalOpen(true)}
              className="px-2.5 py-1.5 text-xs font-medium text-[#EDE7DC] hover:bg-[#121E36] rounded-lg flex items-center gap-1.5 transition-colors border border-[#1E2E4E]"
              title="แสดง QR Code สำหรับผู้เข้าอบรม"
            >
              <QrCode className="w-3.5 h-3.5 text-amber-200" />
              <span className="hidden sm:inline">QR Code ผู้ตอบ</span>
            </button>

            <button
              onClick={() => setIsDeployGuideOpen(true)}
              className="px-2.5 py-1.5 text-xs font-medium text-[#D4AF37] hover:bg-[#1D2B44] rounded-lg flex items-center gap-1.5 transition-colors border border-[#3E382C]"
              title="ดูโค้ดแยก 2 ไฟล์ (survey.html & dashboard.html) และวิธีตั้งค่า Firebase"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">โค้ดแยก 2 ไฟล์ & Firebase</span>
            </button>
          </div>

        </div>
      </div>

      {/* Main Content View */}
      {currentMode === 'dashboard' ? (
        <DashboardView
          submissions={submissions}
          onOpenQr={() => setIsQrModalOpen(true)}
          onOpenDeployGuide={() => setIsDeployGuideOpen(true)}
          onGoToSurvey={() => handleModeChange('survey')}
        />
      ) : (
        <SurveyView
          onGoToDashboard={() => handleModeChange('dashboard')}
          onOpenQr={() => setIsQrModalOpen(true)}
        />
      )}

      {/* Modals */}
      <QrCodeModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        surveyUrl={surveyUrl}
        totalRespondents={submissions.length}
      />

      <FirebaseDeployGuideModal
        isOpen={isDeployGuideOpen}
        onClose={() => setIsDeployGuideOpen(false)}
      />

    </div>
  );
}
