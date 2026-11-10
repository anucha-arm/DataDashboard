import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  EVALUATION_QUESTIONS,
  RATING_LEVELS,
  FeedbackSubmission,
  getInterpretation
} from '../types/feedback';
import { storageService } from '../services/storage';
import { CheckCircle2, RotateCcw, Send, Sparkles, MessageSquare, ShieldCheck, ArrowRight } from 'lucide-react';

interface SurveyViewProps {
  onGoToDashboard: () => void;
  onOpenQr: () => void;
}

export const SurveyView: React.FC<SurveyViewProps> = ({ onGoToDashboard, onOpenQr }) => {
  const [ratings, setRatings] = useState<{ [key: string]: number | null }>({
    q1: null,
    q2: null,
    q3: null,
    q4: null,
    q5: null
  });
  const [suggestion, setSuggestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [lastSubmission, setLastSubmission] = useState<FeedbackSubmission | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (storageService.hasSubmitted()) {
      setHasSubmitted(true);
      const all = storageService.getSubmissions();
      if (all.length > 0) {
        setLastSubmission(all[0]);
      }
    }
  }, []);

  const answeredCount = Object.values(ratings).filter((v) => v !== null).length;
  const progressPercent = (answeredCount / 5) * 100;

  const handleSelectScore = (questionId: string, score: number) => {
    setRatings((prev) => ({ ...prev, [questionId]: score }));
    if (validationError) setValidationError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const unanswered = EVALUATION_QUESTIONS.filter((q) => ratings[q.id] === null);
    if (unanswered.length > 0) {
      setValidationError(`กรุณาตอบแบบประเมินให้ครบทั้ง 5 ข้อ (ยังเหลืออีก ${unanswered.length} ข้อ)`);
      const firstUnansweredEl = document.getElementById(`card-${unanswered[0].id}`);
      firstUnansweredEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setIsSubmitting(true);
    setValidationError(null);

    try {
      const payloadRatings = {
        q1: ratings.q1 as number,
        q2: ratings.q2 as number,
        q3: ratings.q3 as number,
        q4: ratings.q4 as number,
        q5: ratings.q5 as number
      };

      const submission = await storageService.addSubmission(payloadRatings, suggestion);
      setLastSubmission(submission);
      setHasSubmitted(true);

      confetti({
        particleCount: 50,
        spread: 65,
        origin: { y: 0.6 }
      });
    } catch (err) {
      console.error(err);
      setValidationError('เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForTesting = () => {
    storageService.setHasSubmitted(false);
    setHasSubmitted(false);
    setRatings({ q1: null, q2: null, q3: null, q4: null, q5: null });
    setSuggestion('');
    setLastSubmission(null);
    setValidationError(null);
  };

  // Screen when user has already submitted (Duplicate Prevention)
  if (hasSubmitted) {
    const avgScore = lastSubmission ? lastSubmission.averageScore : 5.0;
    const interp = getInterpretation(avgScore);

    return (
      <div className="min-h-screen bg-[#F5F2EB] px-4 py-8 flex flex-col items-center justify-center text-[#1E293B]">
        <div className="w-full max-w-lg bg-white rounded-3xl border border-[#D8D2C5] shadow-xl p-6 sm:p-8 text-center animate-in zoom-in-95 duration-300">
          
          <div className="w-16 h-16 rounded-2xl bg-[#EBE5D8] text-[#1E3A8A] flex items-center justify-center mx-auto mb-4 border border-[#D8D2C5]">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <span className="text-xs font-semibold text-[#1E3A8A] tracking-wide uppercase">
            บันทึกคำตอบเรียบร้อยแล้ว
          </span>

          <h2 className="text-xl sm:text-2xl font-bold text-[#0F1E36] mt-1 mb-2">
            ขอบคุณสำหรับข้อคิดเห็นของคุณ
          </h2>

          <p className="text-xs sm:text-sm text-[#475569] leading-relaxed max-w-md mx-auto mb-6">
            ข้อมูลการประเมินความพึงพอใจของท่านถูกส่งต่อไปยัง Dashboard ของวิทยากรแบบเรียลไทม์แล้ว เพื่อนำไปพัฒนาคุณภาพหลักสูตร
          </p>

          {/* Submission Summary Card */}
          {lastSubmission && (
            <div className="p-4 bg-[#FBF9F5] rounded-2xl border border-[#E2DCCE] mb-6 text-left">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-[#64748B]">
                  คะแนนประเมินของคุณ
                </span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full border bg-[#1E3A8A] text-white border-[#1E3A8A]">
                  {interp.label}
                </span>
              </div>

              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-3xl font-bold text-[#0F1E36] font-mono">
                  {lastSubmission.averageScore.toFixed(2)}
                </span>
                <span className="text-xs text-[#64748B]">/ 5.00 คะแนนเฉลี่ย</span>
              </div>

              <div className="grid grid-cols-5 gap-1.5 py-2 border-t border-[#E2DCCE] text-center">
                {EVALUATION_QUESTIONS.map((q) => (
                  <div key={q.id} className="p-1.5 bg-white rounded-lg border border-[#E2DCCE]">
                    <span className="block text-[10px] text-[#64748B] font-medium">{q.category}</span>
                    <span className="text-xs font-bold text-[#1E3A8A] font-mono">
                      {lastSubmission.ratings[q.id]}
                    </span>
                  </div>
                ))}
              </div>

              {lastSubmission.suggestion && (
                <div className="mt-3 pt-2.5 border-t border-[#E2DCCE] text-xs text-[#475569]">
                  <span className="font-semibold block text-[#0F1E36] mb-0.5">ข้อเสนอแนะ:</span>
                  <p className="italic bg-white p-2 rounded-lg border border-[#E2DCCE]">
                    "{lastSubmission.suggestion}"
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Duplicate Prevention Notice */}
          <div className="flex items-center justify-center gap-2 text-xs text-[#64748B] mb-6">
            <ShieldCheck className="w-4 h-4 text-[#1E3A8A]" />
            <span>ระบบป้องกันการตอบซ้ำจากอุปกรณ์เดิม (Device Lock)</span>
          </div>

          {/* Action CTAs */}
          <div className="space-y-2.5">
            <button
              onClick={onGoToDashboard}
              className="w-full py-3.5 px-4 bg-[#1E3A8A] hover:bg-[#1D4ED8] active:scale-[0.99] text-white text-sm font-semibold rounded-2xl shadow-md shadow-[#1E3A8A]/20 flex items-center justify-center gap-2 transition-all"
            >
              <span>ดูผลลัพธ์บน Live Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={handleResetForTesting}
              className="w-full py-3 px-4 bg-[#EBE5D8] hover:bg-[#E2DCCE] text-[#334155] text-xs font-medium rounded-2xl flex items-center justify-center gap-1.5 transition-colors border border-[#D8D2C5]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>ต้องการทดสอบตอบใหม่อีกครั้ง (Reset Test Lock)</span>
            </button>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F2EB] text-[#1E293B] pb-20">
      
      {/* Sticky Header */}
      <header className="sticky top-0 z-30 bg-[#0F1E36]/95 backdrop-blur-md text-white border-b border-[#1E2E4E] transition-colors">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37]"></span>
              <h1 className="text-sm font-bold text-white truncate">
                แบบประเมินความพึงพอใจการอบรม
              </h1>
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-mono font-semibold text-amber-200">
                {answeredCount}/5 ข้อ
              </span>
              <button
                type="button"
                onClick={onGoToDashboard}
                className="text-xs font-medium px-2.5 py-1 bg-[#1A2B4D] hover:bg-[#223863] text-slate-200 rounded-lg transition-colors flex items-center gap-1 border border-[#2B4068]"
              >
                <span>Dashboard</span>
              </button>
            </div>
          </div>

          {/* Progress Bar Line */}
          <div className="w-full bg-[#1A2B4D] h-1.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#D4AF37] rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-2xl mx-auto px-4 pt-5">
        
        {/* Banner Card in Deep Oxford Navy & Warm Beige */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#0F1E36] to-[#1E3A8A] text-white rounded-3xl p-5 sm:p-6 mb-6 shadow-md border border-[#2B4068]">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-[11px] font-semibold text-amber-200 mb-2.5 border border-white/10">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Real-Time Feedback Collection</span>
            </div>
            
            <h2 className="text-lg sm:text-xl font-bold tracking-tight">
              การประเมินความพึงพอใจในการอบรม
            </h2>
            
            <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed max-w-xl">
              ความคิดเห็นของคุณมีคุณค่าอย่างยิ่งในการพัฒนาคุณภาพหลักสูตรและวิทยากร โปรดเลือกคะแนนตามความรู้สึกจริง (1 = น้อยที่สุด จนถึง 5 = มากที่สุด)
            </p>
          </div>
        </div>

        {/* Validation Warning Alert */}
        {validationError && (
          <div className="p-3.5 bg-rose-50 border border-rose-300 text-rose-800 rounded-2xl text-xs font-medium mb-6 flex items-center justify-between animate-in fade-in">
            <span>{validationError}</span>
            <button
              onClick={() => setValidationError(null)}
              className="text-xs underline font-semibold ml-2"
            >
              ปิด
            </button>
          </div>
        )}

        {/* Survey Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {EVALUATION_QUESTIONS.map((question, qIndex) => {
            const currentScore = ratings[question.id];
            const isAnswered = currentScore !== null;

            return (
              <div
                key={question.id}
                id={`card-${question.id}`}
                className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all duration-200 shadow-xs ${
                  isAnswered
                    ? 'border-[#1E3A8A] ring-1 ring-[#1E3A8A]/20'
                    : 'border-[#D8D2C5]'
                }`}
              >
                {/* Question Header */}
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div>
                    <span className="text-[11px] font-bold text-[#1E3A8A] uppercase tracking-wider">
                      ข้อที่ {qIndex + 1} · {question.category}
                    </span>
                    <h3 className="text-sm sm:text-base font-semibold text-[#0F1E36] mt-0.5 leading-snug">
                      {question.title}
                    </h3>
                  </div>

                  {isAnswered ? (
                    <span className="shrink-0 text-[11px] font-bold text-white bg-[#1E3A8A] px-2.5 py-0.5 rounded-full">
                      คะแนน: {currentScore}
                    </span>
                  ) : (
                    <span className="shrink-0 text-[11px] text-rose-500 font-bold">*</span>
                  )}
                </div>

                <p className="text-xs text-[#64748B] mb-4 leading-relaxed">
                  {question.description}
                </p>

                {/* 5-Level Rating Buttons (Formal Navy & Beige Styling) */}
                <div className="grid grid-cols-5 gap-1.5 sm:gap-2.5">
                  {RATING_LEVELS.map((level) => {
                    const isSelected = currentScore === level.score;

                    return (
                      <button
                        key={level.score}
                        type="button"
                        onClick={() => handleSelectScore(question.id, level.score)}
                        className={`min-h-[64px] sm:min-h-[72px] p-2 rounded-2xl border transition-all flex flex-col items-center justify-center select-none active:scale-95 ${
                          isSelected
                            ? 'bg-[#1E3A8A] text-white border-[#1E3A8A] shadow-md shadow-[#1E3A8A]/25 scale-[1.02]'
                            : 'bg-[#FBF9F5] border-[#D8D2C5] hover:border-[#1E3A8A] text-[#1E293B]'
                        }`}
                      >
                        <span className="text-xl sm:text-2xl mb-1">{level.emoji}</span>
                        <span
                          className={`text-xs sm:text-sm font-bold font-mono ${
                            isSelected ? 'text-white' : 'text-[#0F1E36]'
                          }`}
                        >
                          {level.score}
                        </span>
                        <span
                          className={`text-[9px] sm:text-[10px] leading-tight mt-0.5 truncate max-w-full ${
                            isSelected ? 'text-amber-200 font-medium' : 'text-[#64748B]'
                          }`}
                        >
                          {level.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Suggestions Textarea (Optional) */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#D8D2C5] shadow-xs">
            <div className="flex items-center gap-2 mb-1">
              <MessageSquare className="w-4 h-4 text-[#1E3A8A]" />
              <label
                htmlFor="suggestionInput"
                className="text-sm font-semibold text-[#0F1E36]"
              >
                ข้อเสนอแนะเพิ่มเติมสำหรับวิทยากรและผู้จัด (ไม่บังคับ)
              </label>
            </div>
            
            <p className="text-xs text-[#64748B] mb-3">
              เช่น สิ่งที่ประทับใจ การนำไปประยุกต์ใช้ หรือหัวข้อที่ต้องการเรียนรู้เพิ่มเติมในอนาคต
            </p>

            <textarea
              id="suggestionInput"
              rows={3}
              value={suggestion}
              onChange={(e) => setSuggestion(e.target.value)}
              placeholder="พิมพ์ความคิดเห็นหรือข้อเสนอแนะของคุณที่นี่..."
              className="w-full text-xs sm:text-sm p-3.5 bg-[#FBF9F5] border border-[#D8D2C5] rounded-xl focus:ring-2 focus:ring-[#1E3A8A] focus:outline-none transition-all placeholder:text-[#94A3B8] text-[#1E293B]"
            />
          </div>

          {/* Sticky or Pinned Bottom CTA */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-14 bg-[#1E3A8A] hover:bg-[#1D4ED8] active:scale-[0.99] text-white text-base font-semibold rounded-2xl shadow-lg shadow-[#1E3A8A]/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-[#2B4068]"
            >
              {isSubmitting ? (
                <span>กำลังบันทึกข้อมูล...</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>ส่งแบบประเมินความพึงพอใจ</span>
                </>
              )}
            </button>
          </div>

        </form>

        {/* Quick Footer Links */}
        <div className="mt-8 pt-4 border-t border-[#D8D2C5] flex items-center justify-between text-xs text-[#64748B]">
          <button
            type="button"
            onClick={onOpenQr}
            className="hover:text-[#0F1E36] transition-colors"
          >
            แสดง QR Code สำหรับแชร์
          </button>
          <span>ไม่เก็บชื่อผู้ตอบ · ปลอดภัย 100%</span>
        </div>

      </main>

    </div>
  );
};
