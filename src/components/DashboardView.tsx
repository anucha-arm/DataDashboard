import React, { useState, useMemo } from 'react';
import {
  EVALUATION_QUESTIONS,
  FeedbackSubmission,
  getInterpretation
} from '../types/feedback';
import { storageService } from '../services/storage';
import { DonutChart, DonutSegment } from './DonutChart';
import {
  Users,
  Download,
  Maximize,
  Minimize,
  QrCode,
  TrendingUp,
  MessageSquare,
  FileCode,
  RotateCcw,
  PlusCircle,
  HelpCircle,
  Search,
  ExternalLink,
  CheckCircle,
  Clock,
  PieChart,
  BarChart3,
  Award,
  Sun,
  Moon
} from 'lucide-react';

interface DashboardViewProps {
  submissions: FeedbackSubmission[];
  onOpenQr: () => void;
  onOpenDeployGuide: () => void;
  onGoToSurvey: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  submissions,
  onOpenQr,
  onOpenDeployGuide,
  onGoToSurvey
}) => {
  // Theme state: defaults to 'light' as requested
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const isDark = theme === 'dark';

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [questionChartType, setQuestionChartType] = useState<'donut' | 'bar'>('donut');

  // Overall calculations
  const totalCount = submissions.length;

  const { overallAvg, questionAvgs, distribution, suggestionsList } = useMemo(() => {
    if (totalCount === 0) {
      return {
        overallAvg: 0,
        questionAvgs: { q1: 0, q2: 0, q3: 0, q4: 0, q5: 0 },
        distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        suggestionsList: []
      };
    }

    const sums = { q1: 0, q2: 0, q3: 0, q4: 0, q5: 0 };
    const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let totalScoreSum = 0;

    submissions.forEach((sub) => {
      sums.q1 += sub.ratings.q1;
      sums.q2 += sub.ratings.q2;
      sums.q3 += sub.ratings.q3;
      sums.q4 += sub.ratings.q4;
      sums.q5 += sub.ratings.q5;
      totalScoreSum += sub.averageScore;

      const allQuestionScores = [
        sub.ratings.q1,
        sub.ratings.q2,
        sub.ratings.q3,
        sub.ratings.q4,
        sub.ratings.q5
      ];
      allQuestionScores.forEach((val) => {
        if (dist[val as keyof typeof dist] !== undefined) {
          dist[val as keyof typeof dist]++;
        }
      });
    });

    const qAvgs = {
      q1: Number((sums.q1 / totalCount).toFixed(2)),
      q2: Number((sums.q2 / totalCount).toFixed(2)),
      q3: Number((sums.q3 / totalCount).toFixed(2)),
      q4: Number((sums.q4 / totalCount).toFixed(2)),
      q5: Number((sums.q5 / totalCount).toFixed(2))
    };

    const mean = Number((totalScoreSum / totalCount).toFixed(2));
    const suggestions = submissions.filter((s) => s.suggestion && s.suggestion.trim() !== '');

    return {
      overallAvg: mean,
      questionAvgs: qAvgs,
      distribution: dist,
      suggestionsList: suggestions
    };
  }, [submissions, totalCount]);

  const interpretation = getInterpretation(overallAvg, isDark);

  // Filtered suggestions
  const filteredSuggestions = useMemo(() => {
    return suggestionsList.filter((item) => {
      const matchSearch =
        item.suggestion.toLowerCase().includes(searchTerm.toLowerCase());
      const matchRating =
        filterRating === 'all' || Math.round(item.averageScore) === filterRating;
      return matchSearch && matchRating;
    });
  }, [suggestionsList, searchTerm, filterRating]);

  // Projector Fullscreen Handler
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const handleExportCSV = () => {
    storageService.exportToCSV(submissions);
  };

  const handleAddSampleData = () => {
    const sampleIdeas = [
      'ชอบ Workshop ในช่วงบ่ายมากครับ ได้ลองโค้ดจริง',
      'วิทยากรให้คำแนะนำเรื่องเทคนิคได้ละเอียดและเข้าใจง่ายมาก',
      'เอกสารประกอบการสอนดีมาก นำไปใช้งานต่อกับทีมได้เลย',
      'อยากให้มีเวลาฝึกภาคปฏิบัตินานกว่านี้อีกนิดครับ โดยรวมยอดเยี่ยม',
      'บรรยากาศเป็นกันเองมาก ไม่เกร็งเลย ถามได้ตลอดเวลา'
    ];
    for (let i = 0; i < 3; i++) {
      const rndScore = () => (Math.random() > 0.35 ? 5 : 4);
      storageService.addSubmission(
        {
          q1: rndScore(),
          q2: rndScore(),
          q3: rndScore(),
          q4: rndScore(),
          q5: rndScore()
        },
        sampleIdeas[Math.floor(Math.random() * sampleIdeas.length)]
      );
    }
  };

  const handleResetData = () => {
    storageService.clearAllData();
    setShowConfirmReset(false);
  };

  const handleSeedDefaults = () => {
    storageService.resetToSampleData();
  };

  const totalIndividualAnswers = totalCount * 5;
  const highRatingCount = (distribution[5] || 0) + (distribution[4] || 0);
  const highRatingPercentage =
    totalIndividualAnswers > 0
      ? Math.round((highRatingCount / totalIndividualAnswers) * 100)
      : 0;

  // Formal Color Palette: Navy, Slate Gray, Beige
  const scoreDonutSegments: DonutSegment[] = [
    {
      key: 5,
      label: '5 ดาว · มากที่สุด',
      sublabel: 'สัดส่วนสูงสุด',
      value: distribution[5] || 0,
      color: '#1D4ED8' // Royal Navy
    },
    {
      key: 4,
      label: '4 ดาว · มาก',
      sublabel: 'สัดส่วนระดับดี',
      value: distribution[4] || 0,
      color: '#2563EB' // Cobalt Blue
    },
    {
      key: 3,
      label: '3 ดาว · ปานกลาง',
      sublabel: 'ระดับพอใช้',
      value: distribution[3] || 0,
      color: '#D4AF37' // Warm Beige / Gold
    },
    {
      key: 2,
      label: '2 ดาว · น้อย',
      sublabel: 'ควรปรับปรุง',
      value: distribution[2] || 0,
      color: '#94A3B8' // Slate Gray
    },
    {
      key: 1,
      label: '1 ดาว · น้อยที่สุด',
      sublabel: 'ควรแก้ไขด่วน',
      value: distribution[1] || 0,
      color: '#64748B' // Dark Gray
    }
  ];

  return (
    <div
      className={`min-h-screen pb-16 transition-colors duration-200 ${
        isDark
          ? 'bg-[#0A1326] text-slate-100 selection:bg-[#1D4ED8] selection:text-white'
          : 'bg-[#F8F7F4] text-slate-900 selection:bg-[#1E3A8A] selection:text-white'
      }`}
    >
      
      {/* Top Bar (Light & Dark theme aware, formal Navy, Gray, Beige) */}
      <header
        className={`sticky top-0 z-30 px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4 backdrop-blur-md border-b transition-colors ${
          isDark
            ? 'bg-[#070E1E]/95 border-[#1E2E4E] text-white'
            : 'bg-white/95 border-[#E5E0D8] text-slate-900 shadow-xs'
        }`}
      >
        
        {/* Zone 1: Formal Brand Lockup */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1E3A8A] to-[#1D4ED8] flex items-center justify-center text-white shadow-md border border-[#2A3E66]">
            <TrendingUp className="w-5 h-5 text-amber-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-base font-bold tracking-tight whitespace-nowrap ${isDark ? 'text-white' : 'text-[#0F1E36]'}`}>
                Live Training Satisfaction
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                  isDark
                    ? 'bg-[#112344] text-[#EFE7DC] border-[#2B4068]'
                    : 'bg-blue-50 text-[#1E3A8A] border-blue-200'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                <span>Real-Time Sync</span>
              </span>
            </div>
            <p className={`text-[11px] hidden sm:block ${isDark ? 'text-[#A5B4CB]' : 'text-slate-500'}`}>
              รายงานผลการประเมินความพึงพอใจโครงการฝึกอบรมแบบเรียลไทม์ (ธีมสว่างทางการ)
            </p>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <div className={`hidden lg:flex items-center gap-6 text-xs font-medium ${isDark ? 'text-[#94A3B8]' : 'text-slate-600'}`}>
          <button
            onClick={onGoToSurvey}
            className="hover:text-[#1E3A8A] transition-colors flex items-center gap-1.5 whitespace-nowrap"
          >
            <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
            <span>หน้าตอบแบบสอบถาม (มือถือ)</span>
          </button>
          <button
            onClick={onOpenDeployGuide}
            className={`hover:opacity-80 transition-opacity flex items-center gap-1.5 whitespace-nowrap font-semibold ${
              isDark ? 'text-[#D4AF37]' : 'text-[#8C6D3F]'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>โค้ดแยก 2 ไฟล์ & คู่มือ Firebase</span>
          </button>
        </div>

        {/* Zone 3: Primary Actions + Theme Switcher */}
        <div className="flex items-center gap-2 shrink-0">
          
          {/* Theme Toggle Button (Light / Dark) */}
          <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
              isDark
                ? 'bg-[#121E36] hover:bg-[#1A2B4D] text-[#EDE7DC] border-[#223354]'
                : 'bg-[#FAF8F5] hover:bg-[#F3EFEA] text-[#0F1E36] border-[#E5E0D8] shadow-xs'
            }`}
            title={isDark ? 'สลับเป็นธีมสว่าง' : 'สลับเป็นธีมมืด'}
          >
            {isDark ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-300" />
                <span className="hidden md:inline">ธีมสว่าง</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-[#1E3A8A]" />
                <span className="hidden md:inline">ธีมมืด</span>
              </>
            )}
          </button>

          <button
            onClick={onOpenQr}
            className="px-3.5 py-2 bg-[#1E3A8A] hover:bg-[#1D4ED8] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm border border-[#2E4A7D] transition-all active:scale-95"
            title="ฉาย QR Code ขึ้นจอให้ผู้เข้าอบรมสแกน"
          >
            <QrCode className="w-4 h-4 text-amber-200" />
            <span className="hidden sm:inline">ฉาย QR Code ขึ้นจอ</span>
            <span className="sm:hidden">QR</span>
          </button>

          <button
            onClick={handleExportCSV}
            disabled={totalCount === 0}
            className={`px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed border ${
              isDark
                ? 'bg-[#121E36] hover:bg-[#1A2B4D] text-[#EDE7DC] border-[#223354]'
                : 'bg-white hover:bg-[#FAF8F5] text-slate-700 border-[#E5E0D8] shadow-xs'
            }`}
            title="ดาวน์โหลดข้อมูลเป็นไฟล์ CSV (UTF-8 รองรับ Excel ไทย)"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden md:inline">ดาวน์โหลด CSV</span>
          </button>

          <button
            onClick={toggleFullscreen}
            className={`p-2 rounded-xl border transition-colors ${
              isDark
                ? 'bg-[#121E36] hover:bg-[#1A2B4D] text-[#CBD5E1] border-[#223354]'
                : 'bg-white hover:bg-[#FAF8F5] text-slate-700 border-[#E5E0D8] shadow-xs'
            }`}
            title={isFullscreen ? 'ออกจากโหมดเต็มจอ' : 'ขึ้นจอโปรเจกเตอร์เต็มจอ'}
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>

      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        
        {/* Quick Toolbar for Organizer */}
        <div
          className={`flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl text-xs border transition-colors ${
            isDark
              ? 'bg-[#0F1E36]/90 border-[#1E2E4E]'
              : 'bg-white border-[#E5E0D8] shadow-xs'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
            <span className={`font-semibold ${isDark ? 'text-[#D8C9B3]' : 'text-[#0F1E36]'}`}>
              โหมดวิทยากร / ผู้จัดอบรม:
            </span>
            <span className={isDark ? 'text-[#CBD5E1]' : 'text-slate-600'}>
              ข้อมูลจะอัปเดตบนกราฟวงกลมโดนัทและค่าเฉลี่ยทันทีที่มีคนส่งคำตอบ
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleAddSampleData}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium border transition-colors ${
                isDark
                  ? 'bg-[#172540] hover:bg-[#1E3359] text-[#EFE7DC] border-[#273B63]'
                  : 'bg-[#EFF6FF] hover:bg-blue-100 text-[#1E3A8A] border-blue-200'
              }`}
              title="จำลองคำตอบเพิ่มอีก 3 คน เพื่อทดสอบการเคลื่อนไหวของกราฟ"
            >
              <PlusCircle className="w-3.5 h-3.5 text-blue-600" />
              <span>+3 จำลองคำตอบ</span>
            </button>

            <button
              onClick={handleSeedDefaults}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium border transition-colors ${
                isDark
                  ? 'bg-[#172540] hover:bg-[#1E3359] text-[#CBD5E1] border-[#273B63]'
                  : 'bg-[#FAF8F5] hover:bg-[#F3EFEA] text-slate-700 border-[#E5E0D8]'
              }`}
              title="รีเซ็ตกลับเป็นข้อมูลตัวอย่างชุดเริ่มต้น"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>ชุดตัวอย่าง</span>
            </button>

            <button
              onClick={() => setShowConfirmReset(true)}
              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg flex items-center gap-1 transition-colors font-medium"
            >
              <span>ล้างข้อมูล</span>
            </button>
          </div>
        </div>

        {/* Confirmation Modal for Reset */}
        {showConfirmReset && (
          <div className="p-4 bg-rose-50 border border-rose-300 rounded-2xl text-xs flex items-center justify-between gap-4 animate-in fade-in">
            <span className="text-rose-900 font-medium">
              ยืนยันการล้างข้อมูลการประเมินทั้งหมดหรือไม่? (ข้อมูลจะถูกล้างสำหรับเริ่มคอร์สอบรมใหม่)
            </span>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleResetData}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg shadow-xs"
              >
                ยืนยันล้าง
              </button>
              <button
                onClick={() => setShowConfirmReset(false)}
                className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        )}

        {/* Top 4 KPI Metrics Strip: Formal Light Beige & Navy Surfaces */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Total Respondents */}
          <div
            className={`border rounded-2xl p-5 relative overflow-hidden transition-colors ${
              isDark
                ? 'bg-[#101C33] border-[#1E2E4E]'
                : 'bg-white border-[#E5E0D8] shadow-xs'
            }`}
          >
            <div className={`flex items-center justify-between text-xs font-medium ${isDark ? 'text-[#94A3B8]' : 'text-slate-500'}`}>
              <span>จำนวนผู้ตอบทั้งหมด</span>
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex items-baseline gap-2 mt-3">
              <span className={`text-4xl sm:text-5xl font-extrabold font-mono tabular-nums ${isDark ? 'text-white' : 'text-[#0F1E36]'}`}>
                {totalCount}
              </span>
              <span className={`text-sm font-medium ${isDark ? 'text-[#94A3B8]' : 'text-slate-500'}`}>คน</span>
            </div>
            <p className="text-[11px] text-blue-600 mt-2 flex items-center gap-1 font-medium">
              <CheckCircle className="w-3.5 h-3.5 text-blue-600" />
              <span>ซิงก์ข้อมูลแบบเรียลไทม์</span>
            </p>
          </div>

          {/* Card 2: Overall Mean Score */}
          <div
            className={`border rounded-2xl p-5 relative overflow-hidden transition-colors ${
              isDark
                ? 'bg-[#101C33] border-[#1E2E4E]'
                : 'bg-white border-[#E5E0D8] shadow-xs'
            }`}
          >
            <div className={`flex items-center justify-between text-xs font-medium ${isDark ? 'text-[#94A3B8]' : 'text-slate-500'}`}>
              <span>คะแนนเฉลี่ยรวม (Overall Mean)</span>
              <Award className="w-4 h-4 text-[#D4AF37]" />
            </div>
            <div className="flex items-baseline gap-2 mt-3">
              <span className={`text-4xl sm:text-5xl font-extrabold font-mono tabular-nums ${isDark ? 'text-white' : 'text-[#1E3A8A]'}`}>
                {totalCount > 0 ? overallAvg.toFixed(2) : '0.00'}
              </span>
              <span className={`text-sm font-medium ${isDark ? 'text-[#94A3B8]' : 'text-slate-500'}`}>/ 5.00</span>
            </div>
            <p className={`text-[11px] mt-2 font-medium ${isDark ? 'text-[#D8C9B3]' : 'text-slate-600'}`}>
              ระดับ: <span className="font-bold text-[#1E3A8A]">{interpretation.label}</span>
            </p>
          </div>

          {/* Card 3: Academic Interpretation Tier */}
          <div
            className={`border rounded-2xl p-5 transition-colors ${
              isDark
                ? 'bg-[#101C33] border-[#1E2E4E]'
                : 'bg-white border-[#E5E0D8] shadow-xs'
            }`}
          >
            <div className={`flex items-center justify-between text-xs font-medium ${isDark ? 'text-[#94A3B8]' : 'text-slate-500'}`}>
              <span>ผลการแปลความหมาย</span>
              <span className={`text-[10px] ${isDark ? 'text-[#A38E75]' : 'text-slate-400'}`}>มาตรฐาน 5 ระดับ</span>
            </div>
            <div className="mt-2.5">
              <div
                className={`inline-block px-3 py-1 rounded-xl font-bold text-base sm:text-lg border ${
                  isDark
                    ? 'bg-[#172540] border-[#2B4068] text-amber-200'
                    : 'bg-[#EFF6FF] border-[#BFDBFE] text-[#1E3A8A]'
                }`}
              >
                {interpretation.label}
              </div>
              <p className={`text-[11px] mt-2 leading-snug ${isDark ? 'text-[#94A3B8]' : 'text-slate-600'}`}>
                {interpretation.description}
              </p>
            </div>
          </div>

          {/* Card 4: High Satisfaction Rate */}
          <div
            className={`border rounded-2xl p-5 transition-colors ${
              isDark
                ? 'bg-[#101C33] border-[#1E2E4E]'
                : 'bg-white border-[#E5E0D8] shadow-xs'
            }`}
          >
            <div className={`flex items-center justify-between text-xs font-medium ${isDark ? 'text-[#94A3B8]' : 'text-slate-500'}`}>
              <span>สัดส่วนความพึงพอใจสูง (4-5 ดาว)</span>
              <span className={`text-[10px] ${isDark ? 'text-[#94A3B8]' : 'text-slate-400'}`}>ระดับมาก-มากที่สุด</span>
            </div>
            <div className="flex items-baseline gap-2 mt-3">
              <span className={`text-4xl sm:text-5xl font-extrabold font-mono tabular-nums ${isDark ? 'text-[#D4AF37]' : 'text-[#1E3A8A]'}`}>
                {highRatingPercentage}%
              </span>
              <span className={`text-xs ${isDark ? 'text-[#94A3B8]' : 'text-slate-500'}`}>
                ({highRatingCount}/{totalIndividualAnswers} คำตอบ)
              </span>
            </div>
            <div
              className={`w-full h-2 rounded-full mt-3 overflow-hidden p-0.5 border ${
                isDark ? 'bg-[#0A1326] border-[#1E2E4E]' : 'bg-slate-100 border-slate-200'
              }`}
            >
              <div
                className="bg-gradient-to-r from-[#1D4ED8] to-[#D4AF37] h-full rounded-full transition-all duration-500"
                style={{ width: `${highRatingPercentage}%` }}
              />
            </div>
          </div>

        </div>

        {/* 5-Tier Criteria Reference Strip (Formal Beige & Navy Highlights) */}
        <div
          className={`p-4 rounded-2xl border transition-colors ${
            isDark ? 'bg-[#101C33]/70 border-[#1E2E4E]' : 'bg-white border-[#E5E0D8] shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between mb-2.5">
            <span className={`text-xs font-semibold flex items-center gap-1.5 ${isDark ? 'text-[#EDE7DC]' : 'text-[#0F1E36]'}`}>
              <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
              <span>เกณฑ์มาตรฐานการแปลผลค่าเฉลี่ย 5 ระดับ (Likert Scale Standard)</span>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
            <div
              className={`p-2.5 rounded-xl border transition-all ${
                overallAvg >= 4.51
                  ? isDark
                    ? 'bg-[#12254C] border-[#2A4C8F] text-blue-100 ring-2 ring-blue-500/30'
                    : 'bg-[#EFF6FF] border-blue-400 text-[#1E3A8A] ring-2 ring-blue-500/20 font-bold'
                  : isDark
                  ? 'bg-[#0B1428] border-[#1A2744] text-[#8695AA]'
                  : 'bg-[#FAF8F5] border-[#E8E2D8] text-slate-600'
              }`}
            >
              <span className={`font-bold font-mono block ${overallAvg >= 4.51 && !isDark ? 'text-[#1D4ED8]' : 'text-blue-600'}`}>
                4.51 – 5.00
              </span>
              <span className={`font-semibold text-xs mt-0.5 block ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>มากที่สุด</span>
              <span className={`text-[10px] ${isDark ? 'text-[#A5B4CB]' : 'text-slate-400'}`}>Excellent</span>
            </div>

            <div
              className={`p-2.5 rounded-xl border transition-all ${
                overallAvg >= 3.51 && overallAvg <= 4.50
                  ? isDark
                    ? 'bg-[#12254C] border-[#2A4C8F] text-blue-100 ring-2 ring-blue-500/30'
                    : 'bg-[#EFF6FF] border-blue-400 text-[#1E3A8A] ring-2 ring-blue-500/20 font-bold'
                  : isDark
                  ? 'bg-[#0B1428] border-[#1A2744] text-[#8695AA]'
                  : 'bg-[#FAF8F5] border-[#E8E2D8] text-slate-600'
              }`}
            >
              <span className="font-bold font-mono block text-blue-600">3.51 – 4.50</span>
              <span className={`font-semibold text-xs mt-0.5 block ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>มาก</span>
              <span className={`text-[10px] ${isDark ? 'text-[#A5B4CB]' : 'text-slate-400'}`}>Good</span>
            </div>

            <div
              className={`p-2.5 rounded-xl border transition-all ${
                overallAvg >= 2.51 && overallAvg <= 3.50
                  ? isDark
                    ? 'bg-[#29241C] border-[#8C7A62] text-[#F5EBD9] ring-2 ring-amber-500/30'
                    : 'bg-[#FAF5ED] border-[#D4AF37] text-[#8C6D3F] ring-2 ring-amber-500/20 font-bold'
                  : isDark
                  ? 'bg-[#0B1428] border-[#1A2744] text-[#8695AA]'
                  : 'bg-[#FAF8F5] border-[#E8E2D8] text-slate-600'
              }`}
            >
              <span className="font-bold font-mono block text-[#B88E1C]">2.51 – 3.50</span>
              <span className={`font-semibold text-xs mt-0.5 block ${isDark ? 'text-[#EFE7DC]' : 'text-slate-800'}`}>ปานกลาง</span>
              <span className={`text-[10px] ${isDark ? 'text-[#A38E75]' : 'text-slate-400'}`}>Moderate</span>
            </div>

            <div
              className={`p-2.5 rounded-xl border transition-all ${
                overallAvg >= 1.51 && overallAvg <= 2.50
                  ? isDark
                    ? 'bg-[#1E2533] border-[#475569] text-slate-200'
                    : 'bg-slate-100 border-slate-400 text-slate-800 font-bold'
                  : isDark
                  ? 'bg-[#0B1428] border-[#1A2744] text-[#8695AA]'
                  : 'bg-[#FAF8F5] border-[#E8E2D8] text-slate-600'
              }`}
            >
              <span className="font-bold font-mono block text-slate-600">1.51 – 2.50</span>
              <span className={`font-semibold text-xs mt-0.5 block ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>น้อย</span>
              <span className={`text-[10px] ${isDark ? 'text-[#8695AA]' : 'text-slate-400'}`}>Low</span>
            </div>

            <div
              className={`p-2.5 rounded-xl border transition-all ${
                overallAvg < 1.51 && totalCount > 0
                  ? isDark
                    ? 'bg-[#261E24] border-[#734A60] text-rose-200'
                    : 'bg-rose-50 border-rose-300 text-rose-800 font-bold'
                  : isDark
                  ? 'bg-[#0B1428] border-[#1A2744] text-[#8695AA]'
                  : 'bg-[#FAF8F5] border-[#E8E2D8] text-slate-600'
              }`}
            >
              <span className="font-bold font-mono block text-slate-500">1.00 – 1.50</span>
              <span className={`font-semibold text-xs mt-0.5 block ${isDark ? 'text-slate-400' : 'text-slate-800'}`}>น้อยที่สุด</span>
              <span className={`text-[10px] ${isDark ? 'text-[#8695AA]' : 'text-slate-400'}`}>Needs Work</span>
            </div>
          </div>
        </div>

        {/* Middle Two-Column Grid: 5 Questions Visualization & DONUT CHART for Score Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column (7 cols): 5 Questions Visualizer (Donut Gauges or Bar Chart) */}
          <div
            className={`lg:col-span-7 rounded-2xl p-5 sm:p-6 flex flex-col justify-between border transition-colors ${
              isDark
                ? 'bg-[#101C33] border-[#1E2E4E]'
                : 'bg-white border-[#E5E0D8] shadow-xs'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-[#0F1E36]'}`}>
                    ผลการประเมินแยกตามรายข้อ (5 ด้าน)
                  </h3>
                </div>
                
                {/* View Switcher: Donut vs Bar */}
                <div
                  className={`flex items-center gap-1 p-1 rounded-xl border ${
                    isDark ? 'bg-[#0A1326] border-[#1E2E4E]' : 'bg-[#FAF8F5] border-[#E5E0D8]'
                  }`}
                >
                  <button
                    onClick={() => setQuestionChartType('donut')}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg flex items-center gap-1 transition-all ${
                      questionChartType === 'donut'
                        ? 'bg-[#1E3A8A] text-white shadow-xs'
                        : isDark
                        ? 'text-[#94A3B8] hover:text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="แสดงแบบกราฟโดนัทกลม"
                  >
                    <PieChart className="w-3.5 h-3.5" />
                    <span>กราฟโดนัท</span>
                  </button>
                  <button
                    onClick={() => setQuestionChartType('bar')}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg flex items-center gap-1 transition-all ${
                      questionChartType === 'bar'
                        ? 'bg-[#1E3A8A] text-white shadow-xs'
                        : isDark
                        ? 'text-[#94A3B8] hover:text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="แสดงแบบแท่งกราฟ"
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>กราฟแท่ง</span>
                  </button>
                </div>
              </div>

              <p className={`text-xs mb-5 ${isDark ? 'text-[#94A3B8]' : 'text-slate-500'}`}>
                คะแนนเฉลี่ยรายด้าน สเกล 1.00 – 5.00 พร้อมการแปลระดับความพึงพอใจ
              </p>

              {/* View 1: 5 Questions Donut Radial Rings */}
              {questionChartType === 'donut' ? (
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 py-2">
                  {EVALUATION_QUESTIONS.map((q, idx) => {
                    const score = questionAvgs[q.id] || 0;
                    const percent = (score / 5) * 100;
                    const itemInterp = getInterpretation(score, isDark);
                    const ringCircumference = 2 * Math.PI * 34;
                    const ringOffset = ringCircumference - (percent / 100) * ringCircumference;

                    return (
                      <div
                        key={q.id}
                        className={`rounded-2xl p-3 flex flex-col items-center text-center justify-between border transition-all ${
                          isDark
                            ? 'bg-[#0A1326] border-[#1E2E4E] hover:border-[#2F4775]'
                            : 'bg-[#FAF8F5] border-[#E8E2D8] hover:border-[#1E3A8A]/40 hover:shadow-xs'
                        }`}
                      >
                        <span className={`text-[11px] font-bold ${isDark ? 'text-amber-200' : 'text-[#1E3A8A]'}`}>
                          ข้อ {idx + 1}
                        </span>

                        {/* Circular Donut Ring */}
                        <div className="relative w-20 h-20 my-2">
                          <svg className="w-20 h-20 transform -rotate-90">
                            <circle
                              cx="40"
                              cy="40"
                              r="34"
                              stroke={isDark ? '#1E2E4E' : '#E2E8F0'}
                              strokeWidth="7"
                              fill="transparent"
                            />
                            <circle
                              cx="40"
                              cy="40"
                              r="34"
                              stroke={score >= 4.5 ? '#1E3A8A' : score >= 3.5 ? '#2563EB' : '#D4AF37'}
                              strokeWidth="7"
                              strokeDasharray={ringCircumference}
                              strokeDashoffset={ringOffset}
                              strokeLinecap="round"
                              fill="transparent"
                              className="transition-all duration-700 ease-out"
                            />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className={`text-base font-bold font-mono leading-none ${isDark ? 'text-white' : 'text-[#0F1E36]'}`}>
                              {score.toFixed(1)}
                            </span>
                            <span className={`text-[9px] font-mono mt-0.5 ${isDark ? 'text-[#94A3B8]' : 'text-slate-400'}`}>
                              / 5.0
                            </span>
                          </div>
                        </div>

                        <div>
                          <span className={`text-xs font-semibold block truncate max-w-full ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                            {q.category}
                          </span>
                          <span className={`text-[10px] block mt-0.5 ${isDark ? 'text-[#A5B4CB]' : 'text-slate-500'}`}>
                            {itemInterp.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* View 2: Horizontal Bar List */
                <div className="space-y-4">
                  {EVALUATION_QUESTIONS.map((q, idx) => {
                    const score = questionAvgs[q.id] || 0;
                    const percent = (score / 5) * 100;
                    const itemInterp = getInterpretation(score, isDark);

                    return (
                      <div key={q.id} className="space-y-1.5">
                        <div className="flex items-start justify-between gap-3 text-xs">
                          <div>
                            <span className={`font-semibold ${isDark ? 'text-white' : 'text-[#0F1E36]'}`}>
                              {idx + 1}. {q.category}:
                            </span>{' '}
                            <span className={isDark ? 'text-[#CBD5E1]' : 'text-slate-600'}>{q.title}</span>
                          </div>
                          <div className="flex items-baseline gap-2 shrink-0">
                            <span className={`font-bold font-mono text-sm ${isDark ? 'text-blue-300' : 'text-[#1E3A8A]'}`}>
                              {score.toFixed(2)}
                            </span>
                            <span className={`text-[10px] font-normal ${isDark ? 'text-[#A5B4CB]' : 'text-slate-400'}`}>
                              ({itemInterp.label})
                            </span>
                          </div>
                        </div>

                        {/* Bar Track with Navy & Beige Gradient */}
                        <div
                          className={`relative w-full h-3.5 rounded-xl overflow-hidden p-0.5 border ${
                            isDark ? 'bg-[#0A1326] border-[#1E2E4E]' : 'bg-slate-100 border-slate-200'
                          }`}
                        >
                          <div
                            className="h-full rounded-lg bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] transition-all duration-500 ease-out"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Target Legend */}
            <div
              className={`mt-6 pt-4 border-t flex items-center justify-between text-[11px] ${
                isDark ? 'border-[#1E2E4E] text-[#94A3B8]' : 'border-slate-200 text-slate-500'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1E3A8A]"></span>
                <span>ค่าเฉลี่ยจริง</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37]"></span>
                <span>โทนสีทางการ (น้ำเงิน เทา เบจ)</span>
              </div>
            </div>
          </div>

          {/* Right Column (5 cols): DONUT CHART for Score Distribution */}
          <div
            className={`lg:col-span-5 rounded-2xl p-5 sm:p-6 flex flex-col justify-between border transition-colors ${
              isDark
                ? 'bg-[#101C33] border-[#1E2E4E]'
                : 'bg-white border-[#E5E0D8] shadow-xs'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-[#D4AF37]" />
                  <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-[#0F1E36]'}`}>
                    การกระจายคะแนน (Score Distribution)
                  </h3>
                </div>
                <span className={`text-xs font-mono font-semibold ${isDark ? 'text-[#D8C9B3]' : 'text-[#8C6D3F]'}`}>
                  {totalIndividualAnswers} ครั้ง
                </span>
              </div>
              <p className={`text-xs mb-4 ${isDark ? 'text-[#94A3B8]' : 'text-slate-500'}`}>
                กราฟวงกลมโดนัทแสดงสัดส่วนการให้คะแนนจาก 1 ดาว ถึง 5 ดาว
              </p>

              {/* The Interactive SVG Donut Chart */}
              <DonutChart
                segments={scoreDonutSegments}
                totalLabel="รวมทั้งหมด"
                centerTitle={totalIndividualAnswers.toString()}
                centerSubtitle="จำนวนคำตอบ"
                size={190}
                strokeWidth={28}
                isDark={isDark}
              />
            </div>

            {/* Quick Summary Note */}
            <div
              className={`mt-4 pt-4 border-t text-xs flex items-center gap-2 ${
                isDark ? 'border-[#1E2E4E] text-[#CBD5E1]' : 'border-slate-200 text-slate-600'
              }`}
            >
              <CheckCircle className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                ผู้ตอบส่วนใหญ่ ({distribution[5] + distribution[4]} จาก {totalIndividualAnswers} คำตอบ) ประเมินในระดับมากถึงมากที่สุด
              </span>
            </div>
          </div>

        </div>

        {/* Bottom Section: Recent Suggestions Feed with Search */}
        <div
          className={`rounded-2xl p-5 sm:p-6 border transition-colors ${
            isDark
              ? 'bg-[#101C33] border-[#1E2E4E]'
              : 'bg-white border-[#E5E0D8] shadow-xs'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-[#0F1E36]'}`}>
                  ข้อเสนอแนะล่าสุดจากผู้เข้าอบรม
                </h3>
              </div>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-[#94A3B8]' : 'text-slate-500'}`}>
                ความคิดเห็นและข้อเสนอแนะเพิ่มเติมสำหรับวิทยากรและทีมผู้จัด
              </p>
            </div>

            {/* Filter and Search */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-[#94A3B8]' : 'text-slate-400'}`} />
                <input
                  type="text"
                  placeholder="ค้นหาข้อเสนอแนะ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`pl-8 pr-3 py-1.5 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 w-44 sm:w-56 border ${
                    isDark
                      ? 'bg-[#0A1326] border-[#1E2E4E] text-slate-100 placeholder:text-[#64748B]'
                      : 'bg-[#FAF8F5] border-[#E2DCCE] text-slate-900 placeholder:text-slate-400'
                  }`}
                />
              </div>

              <select
                value={filterRating}
                onChange={(e) =>
                  setFilterRating(e.target.value === 'all' ? 'all' : Number(e.target.value))
                }
                className={`py-1.5 px-2.5 rounded-xl text-xs focus:outline-none border ${
                  isDark
                    ? 'bg-[#0A1326] border-[#1E2E4E] text-slate-200'
                    : 'bg-[#FAF8F5] border-[#E2DCCE] text-slate-700'
                }`}
              >
                <option value="all">ทุกระดับคะแนน</option>
                <option value="5">5 ดาว</option>
                <option value="4">4 ดาว</option>
                <option value="3">3 ดาว</option>
              </select>
            </div>
          </div>

          {/* Suggestions Cards */}
          {filteredSuggestions.length === 0 ? (
            <div className={`py-12 text-center text-xs ${isDark ? 'text-[#64748B]' : 'text-slate-400'}`}>
              {suggestionsList.length === 0
                ? 'ยังไม่มีข้อเสนอแนะเพิ่มเติมจากผู้เข้าอบรม'
                : 'ไม่พบข้อเสนอแนะที่ตรงกับคำค้นหา'}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 max-h-[480px] overflow-y-auto pr-1">
              {filteredSuggestions.map((item) => {
                const itemInterp = getInterpretation(item.averageScore, isDark);

                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-2xl flex flex-col justify-between border transition-all ${
                      isDark
                        ? 'bg-[#0A1326] border-[#1E2E4E] hover:border-[#2F4775]'
                        : 'bg-[#FAF8F5] border-[#E8E2D8] hover:border-[#1E3A8A]/40 hover:bg-white shadow-xs'
                    }`}
                  >
                    <p className={`text-xs leading-relaxed mb-3 ${isDark ? 'text-[#EDE7DC]' : 'text-[#1E293B]'}`}>
                      "{item.suggestion}"
                    </p>

                    <div
                      className={`pt-2.5 border-t flex items-center justify-between text-[11px] ${
                        isDark ? 'border-[#162542] text-[#94A3B8]' : 'border-[#E8E2D8] text-slate-500'
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{item.dateFormatted}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className={`font-mono font-bold ${isDark ? 'text-blue-300' : 'text-[#1E3A8A]'}`}>
                          {item.averageScore.toFixed(2)} ★
                        </span>
                        <span className={`text-[10px] ${isDark ? 'text-[#A5B4CB]' : 'text-slate-500'}`}>
                          ({itemInterp.label})
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </main>

    </div>
  );
};
