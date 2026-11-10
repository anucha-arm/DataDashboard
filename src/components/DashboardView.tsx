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
  Award
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

  const interpretation = getInterpretation(overallAvg);

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

  // Formal Color Palette for Donut Segments: Navy, Gray, Beige
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
      color: '#3B82F6' // Navy Light / Cobalt
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
    <div className="min-h-screen bg-[#0A1326] text-slate-100 pb-16 selection:bg-[#1D4ED8] selection:text-white">
      
      {/* Top Bar: Official Navy & Warm Beige Theme */}
      <header className="sticky top-0 z-30 bg-[#070E1E]/95 backdrop-blur-md border-b border-[#1E2E4E] px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
        
        {/* Zone 1: Formal Brand Lockup */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1E3A8A] to-[#1D4ED8] flex items-center justify-center text-[#F5EFEB] shadow-md border border-[#2A3E66]">
            <TrendingUp className="w-5 h-5 text-amber-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-white tracking-tight whitespace-nowrap">
                Live Training Satisfaction
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#112344] text-[#EFE7DC] border border-[#2B4068]">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
                <span>Real-Time Sync</span>
              </span>
            </div>
            <p className="text-[11px] text-[#A5B4CB] hidden sm:block">
              รายงานผลการประเมินความพึงพอใจโครงการฝึกอบรมแบบเรียลไทม์
            </p>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <div className="hidden lg:flex items-center gap-6 text-xs font-medium text-[#94A3B8]">
          <button
            onClick={onGoToSurvey}
            className="hover:text-white transition-colors flex items-center gap-1.5 whitespace-nowrap"
          >
            <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
            <span>หน้าตอบแบบสอบถาม (มือถือ)</span>
          </button>
          <button
            onClick={onOpenDeployGuide}
            className="hover:text-white transition-colors flex items-center gap-1.5 whitespace-nowrap text-[#D4AF37]"
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>โค้ดแยก 2 ไฟล์ & คู่มือ Firebase</span>
          </button>
        </div>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenQr}
            className="px-3.5 py-2 bg-[#1E3A8A] hover:bg-[#1D4ED8] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md border border-[#2E4A7D] transition-all active:scale-95"
            title="ฉาย QR Code ขึ้นจอให้ผู้เข้าอบรมสแกน"
          >
            <QrCode className="w-4 h-4 text-amber-200" />
            <span className="hidden sm:inline">ฉาย QR Code ขึ้นจอ</span>
            <span className="sm:hidden">QR</span>
          </button>

          <button
            onClick={handleExportCSV}
            disabled={totalCount === 0}
            className="px-3 py-2 bg-[#121E36] hover:bg-[#1A2B4D] text-[#EDE7DC] border border-[#223354] rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            title="ดาวน์โหลดข้อมูลเป็นไฟล์ CSV (UTF-8 รองรับ Excel ไทย)"
          >
            <Download className="w-3.5 h-3.5 text-slate-300" />
            <span className="hidden md:inline">ดาวน์โหลด CSV</span>
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2 bg-[#121E36] hover:bg-[#1A2B4D] text-[#CBD5E1] border border-[#223354] rounded-xl transition-colors"
            title={isFullscreen ? 'ออกจากโหมดเต็มจอ' : 'ขึ้นจอโปรเจกเตอร์เต็มจอ'}
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>

      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        
        {/* Quick Toolbar for Organizer */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#0F1E36]/90 border border-[#1E2E4E] rounded-2xl text-xs">
          <div className="flex items-center gap-2 text-[#94A3B8]">
            <span className="w-2 h-2 rounded-full bg-blue-400"></span>
            <span className="text-[#D8C9B3] font-medium">โหมดวิทยากร / ผู้จัดอบรม:</span>
            <span className="text-[#CBD5E1]">
              ข้อมูลจะอัปเดตบนกราฟวงกลมโดนัทและค่าเฉลี่ยทันทีที่มีคนส่งคำตอบ
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleAddSampleData}
              className="px-2.5 py-1.5 bg-[#172540] hover:bg-[#1E3359] text-[#EFE7DC] border border-[#273B63] rounded-lg flex items-center gap-1 transition-colors"
              title="จำลองคำตอบเพิ่มอีก 3 คน เพื่อทดสอบการเคลื่อนไหวของกราฟ"
            >
              <PlusCircle className="w-3.5 h-3.5 text-blue-400" />
              <span>+3 จำลองคำตอบ</span>
            </button>

            <button
              onClick={handleSeedDefaults}
              className="px-2.5 py-1.5 bg-[#172540] hover:bg-[#1E3359] text-[#CBD5E1] border border-[#273B63] rounded-lg flex items-center gap-1 transition-colors"
              title="รีเซ็ตกลับเป็นข้อมูลตัวอย่างชุดเริ่มต้น"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>ชุดตัวอย่าง</span>
            </button>

            <button
              onClick={() => setShowConfirmReset(true)}
              className="px-2.5 py-1.5 bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border border-rose-900/60 rounded-lg flex items-center gap-1 transition-colors"
            >
              <span>ล้างข้อมูล</span>
            </button>
          </div>
        </div>

        {/* Confirmation Modal for Reset */}
        {showConfirmReset && (
          <div className="p-4 bg-rose-950/90 border border-rose-800 rounded-2xl text-xs flex items-center justify-between gap-4 animate-in fade-in">
            <span className="text-rose-200 font-medium">
              ยืนยันการล้างข้อมูลการประเมินทั้งหมดหรือไม่? (ข้อมูลจะถูกล้างสำหรับเริ่มคอร์สอบรมใหม่)
            </span>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleResetData}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg"
              >
                ยืนยันล้าง
              </button>
              <button
                onClick={() => setShowConfirmReset(false)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        )}

        {/* Top 4 KPI Metrics Strip: Formal Navy & Warm Beige Surfaces */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Total Respondents */}
          <div className="bg-[#101C33] border border-[#1E2E4E] rounded-2xl p-5 relative overflow-hidden shadow-xs">
            <div className="flex items-center justify-between text-[#94A3B8] text-xs font-medium">
              <span>จำนวนผู้ตอบทั้งหมด</span>
              <Users className="w-4 h-4 text-blue-400" />
            </div>
            <div className="flex items-baseline gap-2 mt-3">
              <span className="text-4xl sm:text-5xl font-extrabold text-white font-mono tabular-nums">
                {totalCount}
              </span>
              <span className="text-sm text-[#94A3B8] font-medium">คน</span>
            </div>
            <p className="text-[11px] text-blue-300 mt-2 flex items-center gap-1 font-medium">
              <CheckCircle className="w-3.5 h-3.5 text-blue-400" />
              <span>ซิงก์ข้อมูลแบบเรียลไทม์</span>
            </p>
          </div>

          {/* Card 2: Overall Mean Score */}
          <div className="bg-[#101C33] border border-[#1E2E4E] rounded-2xl p-5 relative overflow-hidden shadow-xs">
            <div className="flex items-center justify-between text-[#94A3B8] text-xs font-medium">
              <span>คะแนนเฉลี่ยรวม (Overall Mean)</span>
              <Award className="w-4 h-4 text-[#D4AF37]" />
            </div>
            <div className="flex items-baseline gap-2 mt-3">
              <span className="text-4xl sm:text-5xl font-extrabold text-white font-mono tabular-nums">
                {totalCount > 0 ? overallAvg.toFixed(2) : '0.00'}
              </span>
              <span className="text-sm text-[#94A3B8] font-medium">/ 5.00</span>
            </div>
            <p className="text-[11px] text-[#D8C9B3] mt-2 font-medium">
              ระดับ: <span className="font-bold text-amber-200">{interpretation.label}</span>
            </p>
          </div>

          {/* Card 3: Academic Interpretation Tier */}
          <div className="bg-[#101C33] border border-[#1E2E4E] rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between text-[#94A3B8] text-xs font-medium">
              <span>ผลการแปลความหมาย</span>
              <span className="text-[10px] text-[#A38E75]">มาตรฐาน 5 ระดับ</span>
            </div>
            <div className="mt-2.5">
              <div className="inline-block px-3 py-1 rounded-xl bg-[#172540] border border-[#2B4068] text-amber-200 font-bold text-base sm:text-lg">
                {interpretation.label}
              </div>
              <p className="text-[11px] text-[#94A3B8] mt-2 leading-snug">
                {interpretation.description}
              </p>
            </div>
          </div>

          {/* Card 4: High Satisfaction Rate */}
          <div className="bg-[#101C33] border border-[#1E2E4E] rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between text-[#94A3B8] text-xs font-medium">
              <span>สัดส่วนความพึงพอใจสูง (4-5 ดาว)</span>
              <span className="text-[10px] text-[#94A3B8]">ระดับมาก-มากที่สุด</span>
            </div>
            <div className="flex items-baseline gap-2 mt-3">
              <span className="text-4xl sm:text-5xl font-extrabold text-[#D4AF37] font-mono tabular-nums">
                {highRatingPercentage}%
              </span>
              <span className="text-xs text-[#94A3B8]">
                ({highRatingCount}/{totalIndividualAnswers} คำตอบ)
              </span>
            </div>
            <div className="w-full bg-[#0A1326] h-2 rounded-full mt-3 overflow-hidden p-0.5 border border-[#1E2E4E]">
              <div
                className="bg-gradient-to-r from-[#1D4ED8] to-[#D4AF37] h-full rounded-full transition-all duration-500"
                style={{ width: `${highRatingPercentage}%` }}
              />
            </div>
          </div>

        </div>

        {/* 5-Tier Criteria Reference Strip (Formal Beige & Navy Highlights) */}
        <div className="p-4 bg-[#101C33]/70 border border-[#1E2E4E] rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#EDE7DC] flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
              <span>เกณฑ์มาตรฐานการแปลผลค่าเฉลี่ย 5 ระดับ (Likert Scale Standard)</span>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
            <div className={`p-2.5 rounded-xl border ${overallAvg >= 4.51 ? 'bg-[#12254C] border-[#2A4C8F] text-blue-100 ring-2 ring-blue-500/30 font-semibold' : 'bg-[#0B1428] border-[#1A2744] text-[#8695AA]'}`}>
              <span className="font-bold font-mono block text-blue-300">4.51 – 5.00</span>
              <span className="font-semibold text-xs mt-0.5 block text-slate-100">มากที่สุด</span>
              <span className="text-[10px] text-[#A5B4CB]">Excellent</span>
            </div>

            <div className={`p-2.5 rounded-xl border ${overallAvg >= 3.51 && overallAvg <= 4.50 ? 'bg-[#12254C] border-[#2A4C8F] text-blue-100 ring-2 ring-blue-500/30 font-semibold' : 'bg-[#0B1428] border-[#1A2744] text-[#8695AA]'}`}>
              <span className="font-bold font-mono block text-blue-400">3.51 – 4.50</span>
              <span className="font-semibold text-xs mt-0.5 block text-slate-100">มาก</span>
              <span className="text-[10px] text-[#A5B4CB]">Good</span>
            </div>

            <div className={`p-2.5 rounded-xl border ${overallAvg >= 2.51 && overallAvg <= 3.50 ? 'bg-[#29241C] border-[#8C7A62] text-[#F5EBD9] ring-2 ring-amber-500/30 font-semibold' : 'bg-[#0B1428] border-[#1A2744] text-[#8695AA]'}`}>
              <span className="font-bold font-mono block text-[#D4AF37]">2.51 – 3.50</span>
              <span className="font-semibold text-xs mt-0.5 block text-[#EFE7DC]">ปานกลาง</span>
              <span className="text-[10px] text-[#A38E75]">Moderate</span>
            </div>

            <div className={`p-2.5 rounded-xl border ${overallAvg >= 1.51 && overallAvg <= 2.50 ? 'bg-[#1E2533] border-[#475569] text-slate-200 ring-2 ring-slate-500/30' : 'bg-[#0B1428] border-[#1A2744] text-[#8695AA]'}`}>
              <span className="font-bold font-mono block text-slate-300">1.51 – 2.50</span>
              <span className="font-semibold text-xs mt-0.5 block text-slate-300">น้อย</span>
              <span className="text-[10px] text-[#8695AA]">Low</span>
            </div>

            <div className={`p-2.5 rounded-xl border ${overallAvg < 1.51 && totalCount > 0 ? 'bg-[#261E24] border-[#734A60] text-rose-200' : 'bg-[#0B1428] border-[#1A2744] text-[#8695AA]'}`}>
              <span className="font-bold font-mono block text-slate-400">1.00 – 1.50</span>
              <span className="font-semibold text-xs mt-0.5 block text-slate-400">น้อยที่สุด</span>
              <span className="text-[10px] text-[#8695AA]">Needs Work</span>
            </div>
          </div>
        </div>

        {/* Middle Two-Column Grid: 5 Questions Visualization & DONUT CHART for Score Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column (7 cols): 5 Questions Visualizer (Donut Gauges or Bar Chart) */}
          <div className="lg:col-span-7 bg-[#101C33] border border-[#1E2E4E] rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">
                    ผลการประเมินแยกตามรายข้อ (5 ด้าน)
                  </h3>
                </div>
                
                {/* View Switcher: Donut vs Bar */}
                <div className="flex items-center gap-1 bg-[#0A1326] p-1 rounded-xl border border-[#1E2E4E]">
                  <button
                    onClick={() => setQuestionChartType('donut')}
                    className={`px-2.5 py-1 text-xs font-medium rounded-lg flex items-center gap-1 transition-all ${
                      questionChartType === 'donut'
                        ? 'bg-[#1D4ED8] text-white shadow-xs'
                        : 'text-[#94A3B8] hover:text-white'
                    }`}
                    title="แสดงแบบกราฟโดนัทกลม"
                  >
                    <PieChart className="w-3.5 h-3.5" />
                    <span>กราฟโดนัท</span>
                  </button>
                  <button
                    onClick={() => setQuestionChartType('bar')}
                    className={`px-2.5 py-1 text-xs font-medium rounded-lg flex items-center gap-1 transition-all ${
                      questionChartType === 'bar'
                        ? 'bg-[#1D4ED8] text-white shadow-xs'
                        : 'text-[#94A3B8] hover:text-white'
                    }`}
                    title="แสดงแบบแท่งกราฟ"
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>กราฟแท่ง</span>
                  </button>
                </div>
              </div>

              <p className="text-xs text-[#94A3B8] mb-5">
                คะแนนเฉลี่ยรายด้าน สเกล 1.00 – 5.00 พร้อมการแปลระดับความพึงพอใจ
              </p>

              {/* View 1: 5 Questions Donut Radial Rings */}
              {questionChartType === 'donut' ? (
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 py-2">
                  {EVALUATION_QUESTIONS.map((q, idx) => {
                    const score = questionAvgs[q.id] || 0;
                    const percent = (score / 5) * 100;
                    const itemInterp = getInterpretation(score);
                    const ringCircumference = 2 * Math.PI * 34;
                    const ringOffset = ringCircumference - (percent / 100) * ringCircumference;

                    return (
                      <div
                        key={q.id}
                        className="bg-[#0A1326] border border-[#1E2E4E] rounded-2xl p-3 flex flex-col items-center text-center justify-between hover:border-[#2F4775] transition-all"
                      >
                        <span className="text-[11px] font-bold text-amber-200">
                          ข้อ {idx + 1}
                        </span>

                        {/* Circular Donut Ring */}
                        <div className="relative w-20 h-20 my-2">
                          <svg className="w-20 h-20 transform -rotate-90">
                            <circle
                              cx="40"
                              cy="40"
                              r="34"
                              stroke="#1E2E4E"
                              strokeWidth="7"
                              fill="transparent"
                            />
                            <circle
                              cx="40"
                              cy="40"
                              r="34"
                              stroke={score >= 4.5 ? '#1D4ED8' : score >= 3.5 ? '#3B82F6' : '#D4AF37'}
                              strokeWidth="7"
                              strokeDasharray={ringCircumference}
                              strokeDashoffset={ringOffset}
                              strokeLinecap="round"
                              fill="transparent"
                              className="transition-all duration-700 ease-out"
                            />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-base font-bold font-mono text-white leading-none">
                              {score.toFixed(1)}
                            </span>
                            <span className="text-[9px] text-[#94A3B8] font-mono mt-0.5">
                              / 5.0
                            </span>
                          </div>
                        </div>

                        <div>
                          <span className="text-xs font-semibold text-slate-200 block truncate max-w-full">
                            {q.category}
                          </span>
                          <span className="text-[10px] text-[#A5B4CB] block mt-0.5">
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
                    const itemInterp = getInterpretation(score);

                    return (
                      <div key={q.id} className="space-y-1.5">
                        <div className="flex items-start justify-between gap-3 text-xs">
                          <div>
                            <span className="font-semibold text-white">
                              {idx + 1}. {q.category}:
                            </span>{' '}
                            <span className="text-[#CBD5E1]">{q.title}</span>
                          </div>
                          <div className="flex items-baseline gap-2 shrink-0">
                            <span className="font-bold text-blue-300 font-mono text-sm">
                              {score.toFixed(2)}
                            </span>
                            <span className="text-[10px] text-[#A5B4CB] font-normal">
                              ({itemInterp.label})
                            </span>
                          </div>
                        </div>

                        {/* Bar Track with Navy & Beige Gradient */}
                        <div className="relative w-full bg-[#0A1326] h-3.5 rounded-xl overflow-hidden p-0.5 border border-[#1E2E4E]">
                          <div
                            className="h-full rounded-lg bg-gradient-to-r from-[#1D4ED8] to-[#3B82F6] transition-all duration-500 ease-out"
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
            <div className="mt-6 pt-4 border-t border-[#1E2E4E] flex items-center justify-between text-[11px] text-[#94A3B8]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1D4ED8]"></span>
                <span>ค่าเฉลี่ยจริง</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37]"></span>
                <span>โทนสีทางการ (น้ำเงิน เทา เบจ)</span>
              </div>
            </div>
          </div>

          {/* Right Column (5 cols): DONUT CHART for Score Distribution (as requested by user!) */}
          <div className="lg:col-span-5 bg-[#101C33] border border-[#1E2E4E] rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-[#D4AF37]" />
                  <h3 className="text-base font-bold text-white">
                    การกระจายคะแนน (Score Distribution)
                  </h3>
                </div>
                <span className="text-xs text-[#D8C9B3] font-mono">
                  {totalIndividualAnswers} ครั้ง
                </span>
              </div>
              <p className="text-xs text-[#94A3B8] mb-4">
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
              />
            </div>

            {/* Quick Summary Note */}
            <div className="mt-4 pt-4 border-t border-[#1E2E4E] text-xs text-[#CBD5E1] flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-blue-400 shrink-0" />
              <span>
                ผู้ตอบส่วนใหญ่ ({distribution[5] + distribution[4]} จาก {totalIndividualAnswers} คำตอบ) ประเมินในระดับมากถึงมากที่สุด
              </span>
            </div>
          </div>

        </div>

        {/* Bottom Section: Recent Suggestions Feed with Search */}
        <div className="bg-[#101C33] border border-[#1E2E4E] rounded-2xl p-5 sm:p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-400" />
                <h3 className="text-base font-bold text-white">
                  ข้อเสนอแนะล่าสุดจากผู้เข้าอบรม
                </h3>
              </div>
              <p className="text-xs text-[#94A3B8] mt-0.5">
                ความคิดเห็นและข้อเสนอแนะเพิ่มเติมสำหรับวิทยากรและทีมผู้จัด
              </p>
            </div>

            {/* Filter and Search */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="ค้นหาข้อเสนอแนะ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-[#0A1326] border border-[#1E2E4E] rounded-xl text-xs text-slate-100 placeholder:text-[#64748B] focus:outline-none focus:ring-1 focus:ring-blue-500 w-44 sm:w-56"
                />
              </div>

              <select
                value={filterRating}
                onChange={(e) =>
                  setFilterRating(e.target.value === 'all' ? 'all' : Number(e.target.value))
                }
                className="py-1.5 px-2.5 bg-[#0A1326] border border-[#1E2E4E] rounded-xl text-xs text-slate-200 focus:outline-none"
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
            <div className="py-12 text-center text-[#64748B] text-xs">
              {suggestionsList.length === 0
                ? 'ยังไม่มีข้อเสนอแนะเพิ่มเติมจากผู้เข้าอบรม'
                : 'ไม่พบข้อเสนอแนะที่ตรงกับคำค้นหา'}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 max-h-[480px] overflow-y-auto pr-1">
              {filteredSuggestions.map((item) => {
                const itemInterp = getInterpretation(item.averageScore);

                return (
                  <div
                    key={item.id}
                    className="p-4 bg-[#0A1326] border border-[#1E2E4E] rounded-2xl flex flex-col justify-between hover:border-[#2F4775] transition-colors shadow-xs"
                  >
                    <p className="text-xs text-[#EDE7DC] leading-relaxed mb-3">
                      "{item.suggestion}"
                    </p>

                    <div className="pt-2.5 border-t border-[#162542] flex items-center justify-between text-[11px] text-[#94A3B8]">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#64748B]" />
                        <span>{item.dateFormatted}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-blue-300">
                          {item.averageScore.toFixed(2)} ★
                        </span>
                        <span className="text-[10px] text-[#A5B4CB]">
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
