/**
 * Generates standalone HTML/JS files:
 * 1. survey.html (Mobile-first survey form connected to Firebase Realtime Database in Navy/Beige/Gray)
 * 2. dashboard.html (Live projector dashboard with SVG Donut Chart and Navy/Beige/Gray formal theme)
 * 3. database.rules.json (Firebase security rules)
 */

export function generateSurveyHtml(firebaseConfigJson?: string): string {
  const config = firebaseConfigJson || `{
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
}`;

  return `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>แบบประเมินความพึงพอใจการอบรม</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Prompt', sans-serif; -webkit-tap-highlight-color: transparent; }
  </style>
  <!-- Firebase App & Realtime Database SDKs -->
  <script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-database-compat.js"></script>
</head>
<body class="bg-[#F5F2EB] text-[#1E293B] min-h-screen pb-12">

  <!-- Header (Formal Navy) -->
  <header class="bg-[#0F1E36] text-white border-b border-[#1E2E4E] sticky top-0 z-20 shadow-sm">
    <div class="max-w-xl mx-auto px-4 py-3 flex items-center justify-between">
      <div>
        <h1 class="text-base font-bold text-white">แบบประเมินความพึงพอใจ</h1>
        <p class="text-xs text-[#94A3B8]">โครงการฝึกอบรมและพัฒนาทักษะ</p>
      </div>
      <div id="progressBadge" class="text-xs font-semibold px-2.5 py-1 bg-[#1A2B4D] text-amber-200 rounded-full border border-[#2B4068]">
        0/5 ข้อ
      </div>
    </div>
  </header>

  <main class="max-w-xl mx-auto px-4 pt-5">
    
    <!-- Notice Card -->
    <div class="bg-gradient-to-r from-[#0F1E36] to-[#1E3A8A] text-white p-5 rounded-2xl mb-6 shadow-md border border-[#2B4068]">
      <h2 class="font-bold text-base mb-1 text-white">คำชี้แจงการประเมิน</h2>
      <p class="text-xs text-[#CBD5E1] leading-relaxed">
        ความคิดเห็นของท่านมีคุณค่าอย่างยิ่งในการพัฒนาหลักสูตรครั้งต่อไป
        (เกณฑ์การให้คะแนน: 1 = น้อยที่สุด จนถึง 5 = มากที่สุด)
      </p>
    </div>

    <!-- Already Submitted Screen (Hidden by default) -->
    <div id="submittedBox" class="hidden bg-white border border-[#D8D2C5] rounded-2xl p-6 text-center shadow-md my-6">
      <div class="w-16 h-16 bg-[#EBE5D8] text-[#1E3A8A] rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold border border-[#D8D2C5]">
        ✓
      </div>
      <h3 class="text-lg font-bold text-[#0F1E36] mb-2">ส่งแบบประเมินเรียบร้อยแล้ว</h3>
      <p class="text-sm text-[#475569] mb-5 leading-relaxed">
        ระบบได้บันทึกคะแนนความพึงพอใจของท่านลงในฐานข้อมูลแบบเรียลไทม์แล้ว ขอบคุณที่สละเวลาครับ/ค่ะ
      </p>
      <button onclick="resetSubmission()" class="text-xs text-[#1E3A8A] underline font-medium hover:text-[#1D4ED8]">
        ต้องการแก้ไขหรือทดสอบส่งอีกครั้ง
      </button>
    </div>

    <!-- Form Section -->
    <form id="evalForm" onsubmit="handleFormSubmit(event)" class="space-y-5">
      
      <!-- Question 1 -->
      <div class="bg-white border border-[#D8D2C5] rounded-2xl p-4 shadow-xs">
        <div class="flex items-start justify-between mb-2">
          <div>
            <span class="text-xs font-bold text-[#1E3A8A] uppercase tracking-wide">ข้อที่ 1 · วิทยากร</span>
            <h3 class="text-sm font-semibold text-[#0F1E36] mt-0.5">ความรู้ความสามารถและการถ่ายทอดของวิทยากร</h3>
          </div>
          <span class="text-xs text-rose-500 font-bold">*</span>
        </div>
        <p class="text-xs text-[#64748B] mb-4">เทคนิคการสอน การสื่อสารเข้าใจง่าย และการตอบข้อซักถาม</p>
        <div class="grid grid-cols-5 gap-2" data-question="q1">
          <button type="button" onclick="selectScore('q1', 1)" class="score-btn p-2 rounded-xl border border-[#D8D2C5] flex flex-col items-center justify-center transition-all bg-[#FBF9F5]" data-val="1">
            <span class="text-xl">😞</span>
            <span class="text-xs font-bold mt-1 text-[#0F1E36]">1</span>
            <span class="text-[9px] text-[#64748B] truncate">น้อยสุด</span>
          </button>
          <button type="button" onclick="selectScore('q1', 2)" class="score-btn p-2 rounded-xl border border-[#D8D2C5] flex flex-col items-center justify-center transition-all bg-[#FBF9F5]" data-val="2">
            <span class="text-xl">🙁</span>
            <span class="text-xs font-bold mt-1 text-[#0F1E36]">2</span>
            <span class="text-[9px] text-[#64748B] truncate">น้อย</span>
          </button>
          <button type="button" onclick="selectScore('q1', 3)" class="score-btn p-2 rounded-xl border border-[#D8D2C5] flex flex-col items-center justify-center transition-all bg-[#FBF9F5]" data-val="3">
            <span class="text-xl">😐</span>
            <span class="text-xs font-bold mt-1 text-[#0F1E36]">3</span>
            <span class="text-[9px] text-[#64748B] truncate">ปานกลาง</span>
          </button>
          <button type="button" onclick="selectScore('q1', 4)" class="score-btn p-2 rounded-xl border border-[#D8D2C5] flex flex-col items-center justify-center transition-all bg-[#FBF9F5]" data-val="4">
            <span class="text-xl">😊</span>
            <span class="text-xs font-bold mt-1 text-[#0F1E36]">4</span>
            <span class="text-[9px] text-[#64748B] truncate">มาก</span>
          </button>
          <button type="button" onclick="selectScore('q1', 5)" class="score-btn p-2 rounded-xl border border-[#D8D2C5] flex flex-col items-center justify-center transition-all bg-[#FBF9F5]" data-val="5">
            <span class="text-xl">🤩</span>
            <span class="text-xs font-bold mt-1 text-[#0F1E36]">5</span>
            <span class="text-[9px] text-[#64748B] truncate">มากสุด</span>
          </button>
        </div>
      </div>

      <!-- Question 2 -->
      <div class="bg-white border border-[#D8D2C5] rounded-2xl p-4 shadow-xs">
        <div class="flex items-start justify-between mb-2">
          <div>
            <span class="text-xs font-bold text-[#1E3A8A] uppercase tracking-wide">ข้อที่ 2 · เนื้อหา</span>
            <h3 class="text-sm font-semibold text-[#0F1E36] mt-0.5">ความสมบูรณ์ ทันสมัย และตรงประเด็นของเนื้อหา</h3>
          </div>
          <span class="text-xs text-rose-500 font-bold">*</span>
        </div>
        <p class="text-xs text-[#64748B] mb-4">เนื้อหามีความน่าสนใจ ตรงตามวัตถุประสงค์ และมีลำดับขั้นตอนชัดเจน</p>
        <div class="grid grid-cols-5 gap-2" data-question="q2">
          <button type="button" onclick="selectScore('q2', 1)" class="score-btn p-2 rounded-xl border border-[#D8D2C5] flex flex-col items-center justify-center transition-all bg-[#FBF9F5]" data-val="1">
            <span class="text-xl">😞</span>
            <span class="text-xs font-bold mt-1 text-[#0F1E36]">1</span>
            <span class="text-[9px] text-[#64748B] truncate">น้อยสุด</span>
          </button>
          <button type="button" onclick="selectScore('q2', 2)" class="score-btn p-2 rounded-xl border border-[#D8D2C5] flex flex-col items-center justify-center transition-all bg-[#FBF9F5]" data-val="2">
            <span class="text-xl">🙁</span>
            <span class="text-xs font-bold mt-1 text-[#0F1E36]">2</span>
            <span class="text-[9px] text-[#64748B] truncate">น้อย</span>
          </button>
          <button type="button" onclick="selectScore('q2', 3)" class="score-btn p-2 rounded-xl border border-[#D8D2C5] flex flex-col items-center justify-center transition-all bg-[#FBF9F5]" data-val="3">
            <span class="text-xl">😐</span>
            <span class="text-xs font-bold mt-1 text-[#0F1E36]">3</span>
            <span class="text-[9px] text-[#64748B] truncate">ปานกลาง</span>
          </button>
          <button type="button" onclick="selectScore('q2', 4)" class="score-btn p-2 rounded-xl border border-[#D8D2C5] flex flex-col items-center justify-center transition-all bg-[#FBF9F5]" data-val="4">
            <span class="text-xl">😊</span>
            <span class="text-xs font-bold mt-1 text-[#0F1E36]">4</span>
            <span class="text-[9px] text-[#64748B] truncate">มาก</span>
          </button>
          <button type="button" onclick="selectScore('q2', 5)" class="score-btn p-2 rounded-xl border border-[#D8D2C5] flex flex-col items-center justify-center transition-all bg-[#FBF9F5]" data-val="5">
            <span class="text-xl">🤩</span>
            <span class="text-xs font-bold mt-1 text-[#0F1E36]">5</span>
            <span class="text-[9px] text-[#64748B] truncate">มากสุด</span>
          </button>
        </div>
      </div>

      <!-- Question 3 -->
      <div class="bg-white border border-[#D8D2C5] rounded-2xl p-4 shadow-xs">
        <div class="flex items-start justify-between mb-2">
          <div>
            <span class="text-xs font-bold text-[#1E3A8A] uppercase tracking-wide">ข้อที่ 3 · การนำไปใช้</span>
            <h3 class="text-sm font-semibold text-[#0F1E36] mt-0.5">ความรู้และทักษะสามารถนำไปประยุกต์ใช้ได้จริง</h3>
          </div>
          <span class="text-xs text-rose-500 font-bold">*</span>
        </div>
        <p class="text-xs text-[#64748B] mb-4">สามารถนำความรู้ เทคนิค หรือเครื่องมือไปต่อยอดและปฏิบัติงานได้ทันที</p>
        <div class="grid grid-cols-5 gap-2" data-question="q3">
          <button type="button" onclick="selectScore('q3', 1)" class="score-btn p-2 rounded-xl border border-[#D8D2C5] flex flex-col items-center justify-center transition-all bg-[#FBF9F5]" data-val="1">
            <span class="text-xl">😞</span>
            <span class="text-xs font-bold mt-1 text-[#0F1E36]">1</span>
            <span class="text-[9px] text-[#64748B] truncate">น้อยสุด</span>
          </button>
          <button type="button" onclick="selectScore('q3', 2)" class="score-btn p-2 rounded-xl border border-[#D8D2C5] flex flex-col items-center justify-center transition-all bg-[#FBF9F5]" data-val="2">
            <span class="text-xl">🙁</span>
            <span class="text-xs font-bold mt-1 text-[#0F1E36]">2</span>
            <span class="text-[9px] text-[#64748B] truncate">น้อย</span>
          </button>
          <button type="button" onclick="selectScore('q3', 3)" class="score-btn p-2 rounded-xl border border-[#D8D2C5] flex flex-col items-center justify-center transition-all bg-[#FBF9F5]" data-val="3">
            <span class="text-xl">😐</span>
            <span class="text-xs font-bold mt-1 text-[#0F1E36]">3</span>
            <span class="text-[9px] text-[#64748B] truncate">ปานกลาง</span>
          </button>
          <button type="button" onclick="selectScore('q3', 4)" class="score-btn p-2 rounded-xl border border-[#D8D2C5] flex flex-col items-center justify-center transition-all bg-[#FBF9F5]" data-val="4">
            <span class="text-xl">😊</span>
            <span class="text-xs font-bold mt-1 text-[#0F1E36]">4</span>
            <span class="text-[9px] text-[#64748B] truncate">มาก</span>
          </button>
          <button type="button" onclick="selectScore('q3', 5)" class="score-btn p-2 rounded-xl border border-[#D8D2C5] flex flex-col items-center justify-center transition-all bg-[#FBF9F5]" data-val="5">
            <span class="text-xl">🤩</span>
            <span class="text-xs font-bold mt-1 text-[#0F1E36]">5</span>
            <span class="text-[9px] text-[#64748B] truncate">มากสุด</span>
          </button>
        </div>
      </div>

      <!-- Question 4 -->
      <div class="bg-white border border-[#D8D2C5] rounded-2xl p-4 shadow-xs">
        <div class="flex items-start justify-between mb-2">
          <div>
            <span class="text-xs font-bold text-[#1E3A8A] uppercase tracking-wide">ข้อที่ 4 · บรรยากาศ</span>
            <h3 class="text-sm font-semibold text-[#0F1E36] mt-0.5">การมีส่วนร่วมและบรรยากาศในการเรียนรู้</h3>
          </div>
          <span class="text-xs text-rose-500 font-bold">*</span>
        </div>
        <p class="text-xs text-[#64748B] mb-4">การเปิดโอกาสให้ซักถาม แลกเปลี่ยนความคิดเห็น และความเป็นกันเอง</p>
        <div class="grid grid-cols-5 gap-2" data-question="q4">
          <button type="button" onclick="selectScore('q4', 1)" class="score-btn p-2 rounded-xl border border-[#D8D2C5] flex flex-col items-center justify-center transition-all bg-[#FBF9F5]" data-val="1">
            <span class="text-xl">😞</span>
            <span class="text-xs font-bold mt-1 text-[#0F1E36]">1</span>
            <span class="text-[9px] text-[#64748B] truncate">น้อยสุด</span>
          </button>
          <button type="button" onclick="selectScore('q4', 2)" class="score-btn p-2 rounded-xl border border-[#D8D2C5] flex flex-col items-center justify-center transition-all bg-[#FBF9F5]" data-val="2">
            <span class="text-xl">🙁</span>
            <span class="text-xs font-bold mt-1 text-[#0F1E36]">2</span>
            <span class="text-[9px] text-[#64748B] truncate">น้อย</span>
          </button>
          <button type="button" onclick="selectScore('q4', 3)" class="score-btn p-2 rounded-xl border border-[#D8D2C5] flex flex-col items-center justify-center transition-all bg-[#FBF9F5]" data-val="3">
            <span class="text-xl">😐</span>
            <span class="text-xs font-bold mt-1 text-[#0F1E36]">3</span>
            <span class="text-[9px] text-[#64748B] truncate">ปานกลาง</span>
          </button>
          <button type="button" onclick="selectScore('q4', 4)" class="score-btn p-2 rounded-xl border border-[#D8D2C5] flex flex-col items-center justify-center transition-all bg-[#FBF9F5]" data-val="4">
            <span class="text-xl">😊</span>
            <span class="text-xs font-bold mt-1 text-[#0F1E36]">4</span>
            <span class="text-[9px] text-[#64748B] truncate">มาก</span>
          </button>
          <button type="button" onclick="selectScore('q4', 5)" class="score-btn p-2 rounded-xl border border-[#D8D2C5] flex flex-col items-center justify-center transition-all bg-[#FBF9F5]" data-val="5">
            <span class="text-xl">🤩</span>
            <span class="text-xs font-bold mt-1 text-[#0F1E36]">5</span>
            <span class="text-[9px] text-[#64748B] truncate">มากสุด</span>
          </button>
        </div>
      </div>

      <!-- Question 5 -->
      <div class="bg-white border border-[#D8D2C5] rounded-2xl p-4 shadow-xs">
        <div class="flex items-start justify-between mb-2">
          <div>
            <span class="text-xs font-bold text-[#1E3A8A] uppercase tracking-wide">ข้อที่ 5 · การจัดการ</span>
            <h3 class="text-sm font-semibold text-[#0F1E36] mt-0.5">ความเหมาะสมของเวลา สถานที่ และสื่ออุปกรณ์</h3>
          </div>
          <span class="text-xs text-rose-500 font-bold">*</span>
        </div>
        <p class="text-xs text-[#64748B] mb-4">การบริหารเวลา สื่อการสอน เอกสารประกอบ และสิ่งอำนวยความสะดวก</p>
        <div class="grid grid-cols-5 gap-2" data-question="q5">
          <button type="button" onclick="selectScore('q5', 1)" class="score-btn p-2 rounded-xl border border-[#D8D2C5] flex flex-col items-center justify-center transition-all bg-[#FBF9F5]" data-val="1">
            <span class="text-xl">😞</span>
            <span class="text-xs font-bold mt-1 text-[#0F1E36]">1</span>
            <span class="text-[9px] text-[#64748B] truncate">น้อยสุด</span>
          </button>
          <button type="button" onclick="selectScore('q5', 2)" class="score-btn p-2 rounded-xl border border-[#D8D2C5] flex flex-col items-center justify-center transition-all bg-[#FBF9F5]" data-val="2">
            <span class="text-xl">🙁</span>
            <span class="text-xs font-bold mt-1 text-[#0F1E36]">2</span>
            <span class="text-[9px] text-[#64748B] truncate">น้อย</span>
          </button>
          <button type="button" onclick="selectScore('q5', 3)" class="score-btn p-2 rounded-xl border border-[#D8D2C5] flex flex-col items-center justify-center transition-all bg-[#FBF9F5]" data-val="3">
            <span class="text-xl">😐</span>
            <span class="text-xs font-bold mt-1 text-[#0F1E36]">3</span>
            <span class="text-[9px] text-[#64748B] truncate">ปานกลาง</span>
          </button>
          <button type="button" onclick="selectScore('q5', 4)" class="score-btn p-2 rounded-xl border border-[#D8D2C5] flex flex-col items-center justify-center transition-all bg-[#FBF9F5]" data-val="4">
            <span class="text-xl">😊</span>
            <span class="text-xs font-bold mt-1 text-[#0F1E36]">4</span>
            <span class="text-[9px] text-[#64748B] truncate">มาก</span>
          </button>
          <button type="button" onclick="selectScore('q5', 5)" class="score-btn p-2 rounded-xl border border-[#D8D2C5] flex flex-col items-center justify-center transition-all bg-[#FBF9F5]" data-val="5">
            <span class="text-xl">🤩</span>
            <span class="text-xs font-bold mt-1 text-[#0F1E36]">5</span>
            <span class="text-[9px] text-[#64748B] truncate">มากสุด</span>
          </button>
        </div>
      </div>

      <!-- Suggestions Box -->
      <div class="bg-white border border-[#D8D2C5] rounded-2xl p-4 shadow-xs">
        <label for="suggestion" class="block text-sm font-semibold text-[#0F1E36] mb-1">
          ข้อเสนอแนะเพิ่มเติมสำหรับวิทยากรและผู้จัด (ไม่บังคับ)
        </label>
        <p class="text-xs text-[#64748B] mb-2">เช่น สิ่งที่ประทับใจ หัวข้อที่อยากเรียนรู้เพิ่มเติม หรือข้อที่ควรปรับปรุง</p>
        <textarea id="suggestion" rows="3" class="w-full text-sm p-3 bg-[#FBF9F5] border border-[#D8D2C5] rounded-xl focus:ring-2 focus:ring-[#1E3A8A] focus:outline-none transition-all placeholder:text-[#94A3B8]" placeholder="พิมพ์ความคิดเห็นของคุณที่นี่..."></textarea>
      </div>

      <!-- Submit Button -->
      <button type="submit" id="submitBtn" class="w-full py-4 bg-[#1E3A8A] hover:bg-[#1D4ED8] active:scale-[0.99] text-white font-semibold rounded-2xl shadow-md text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-[#2B4068]">
        ส่งแบบประเมินความพึงพอใจ
      </button>

    </form>
  </main>

  <script>
    const firebaseConfig = ${config};
    
    let db = null;
    try {
      if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
      }
      db = firebase.database();
    } catch(err) {
      console.warn("Firebase initialized with local fallback:", err);
    }

    const scores = { q1: null, q2: null, q3: null, q4: null, q5: null };

    if (localStorage.getItem('training_eval_completed') === 'true') {
      showSubmittedState();
    }

    function selectScore(questionId, score) {
      scores[questionId] = score;
      const container = document.querySelector(\`[data-question="\${questionId}"]\`);
      container.querySelectorAll('.score-btn').forEach(btn => {
        const val = parseInt(btn.getAttribute('data-val'));
        if (val === score) {
          btn.className = 'score-btn p-2 rounded-xl bg-[#1E3A8A] text-white border-[#1E3A8A] flex flex-col items-center justify-center transition-all shadow-sm scale-105';
          btn.querySelector('.text-[#0F1E36]')?.classList.replace('text-[#0F1E36]', 'text-white');
          btn.querySelector('.text-[#64748B]')?.classList.replace('text-[#64748B]', 'text-amber-200');
        } else {
          btn.className = 'score-btn p-2 rounded-xl border border-[#D8D2C5] flex flex-col items-center justify-center transition-all bg-[#FBF9F5]';
          btn.querySelector('.text-white')?.classList.replace('text-white', 'text-[#0F1E36]');
          btn.querySelector('.text-amber-200')?.classList.replace('text-amber-200', 'text-[#64748B]');
        }
      });
      updateProgress();
    }

    function updateProgress() {
      const answered = Object.values(scores).filter(v => v !== null).length;
      document.getElementById('progressBadge').textContent = \`\${answered}/5 ข้อ\`;
      if (answered === 5) {
        document.getElementById('progressBadge').className = 'text-xs font-semibold px-2.5 py-1 bg-[#1E3A8A] text-white rounded-full border border-[#2B4068]';
      }
    }

    async function handleFormSubmit(e) {
      e.preventDefault();
      const unanswered = Object.entries(scores).filter(([k, v]) => v === null);
      if (unanswered.length > 0) {
        alert('กรุณาให้คะแนนให้ครบทั้ง 5 ข้อก่อนส่งแบบประเมินครับ');
        return;
      }

      const submitBtn = document.getElementById('submitBtn');
      submitBtn.disabled = true;
      submitBtn.textContent = 'กำลังบันทึกข้อมูล...';

      const suggestion = document.getElementById('suggestion').value.trim();
      const scoresArray = Object.values(scores);
      const avg = Number((scoresArray.reduce((a, b) => a + b, 0) / 5).toFixed(2));

      const payload = {
        id: 'resp_' + Date.now(),
        timestamp: new Date().toISOString(),
        ratings: scores,
        averageScore: avg,
        suggestion: suggestion
      };

      try {
        if (db) {
          await db.ref('evaluations').push(payload);
        } else {
          const localList = JSON.parse(localStorage.getItem('training_eval_submissions') || '[]');
          localList.unshift(payload);
          localStorage.setItem('training_eval_submissions', JSON.stringify(localList));
        }
        localStorage.setItem('training_eval_completed', 'true');
        showSubmittedState();
      } catch (err) {
        alert('เกิดข้อผิดพลาดในการส่งข้อมูล: ' + err.message);
        submitBtn.disabled = false;
        submitBtn.textContent = 'ส่งแบบประเมินความพึงพอใจ';
      }
    }

    function showSubmittedState() {
      document.getElementById('evalForm').classList.add('hidden');
      document.getElementById('submittedBox').classList.remove('hidden');
    }

    function resetSubmission() {
      localStorage.removeItem('training_eval_completed');
      location.reload();
    }
  </script>
</body>
</html>`;
}

export function generateDashboardHtml(firebaseConfigJson?: string): string {
  const config = firebaseConfigJson || `{
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
}`;

  return `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Live Dashboard ผลการประเมินความพึงพอใจ</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Prompt', sans-serif; background-color: #0A1326; color: #EDE7DC; }
    .mono { font-family: 'JetBrains Mono', monospace; font-variant-numeric: tabular-nums; }
  </style>
  <script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-database-compat.js"></script>
</head>
<body class="min-h-screen">

  <!-- Top Bar for Projector (Formal Navy Theme) -->
  <header class="border-b border-[#1E2E4E] bg-[#070E1E]/95 backdrop-blur-md px-6 py-4 sticky top-0 z-30 flex items-center justify-between">
    <div class="flex items-center gap-3">
      <div class="w-3 h-3 rounded-full bg-blue-400 animate-pulse"></div>
      <div>
        <h1 class="text-xl font-bold tracking-tight text-white">Live Feedback Dashboard</h1>
        <p class="text-xs text-[#94A3B8]">ระบบแสดงผลความพึงพอใจการอบรมแบบเรียลไทม์ (ธีมทางการ น้ำเงิน เทา เบจ)</p>
      </div>
    </div>
    <div class="flex items-center gap-3">
      <button onclick="exportCSV()" class="px-3.5 py-2 text-xs font-semibold bg-[#121E36] hover:bg-[#1A2B4D] text-[#EDE7DC] rounded-xl border border-[#223354] transition-colors">
        ดาวน์โหลด CSV
      </button>
      <button onclick="toggleFullscreen()" class="px-3.5 py-2 text-xs font-semibold bg-[#1D4ED8] hover:bg-blue-600 text-white rounded-xl transition-colors border border-blue-500">
        เต็มจอโปรเจกเตอร์
      </button>
    </div>
  </header>

  <main class="max-w-7xl mx-auto p-6 space-y-6">
    
    <!-- KPI Row -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      
      <!-- Total Respondents -->
      <div class="bg-[#101C33] border border-[#1E2E4E] rounded-2xl p-5">
        <span class="text-xs font-medium text-[#94A3B8]">ผู้ตอบทั้งหมด</span>
        <div class="flex items-baseline gap-2 mt-2">
          <span id="totalCount" class="text-4xl font-bold text-white mono">0</span>
          <span class="text-sm text-[#94A3B8]">คน</span>
        </div>
        <p class="text-xs text-blue-400 mt-2">อัปเดตอัตโนมัติ Real-time</p>
      </div>

      <!-- Overall Mean -->
      <div class="bg-[#101C33] border border-[#1E2E4E] rounded-2xl p-5">
        <span class="text-xs font-medium text-[#94A3B8]">คะแนนเฉลี่ยรวม</span>
        <div class="flex items-baseline gap-2 mt-2">
          <span id="overallAvg" class="text-4xl font-bold text-white mono">0.00</span>
          <span class="text-sm text-[#94A3B8]">/ 5.00</span>
        </div>
        <p id="overallTier" class="text-xs text-amber-200 font-semibold mt-2">-</p>
      </div>

      <!-- Rating Scale Breakdown -->
      <div class="bg-[#101C33] border border-[#1E2E4E] rounded-2xl p-5 md:col-span-2">
        <span class="text-xs font-medium text-[#94A3B8] mb-2 block">เกณฑ์การแปลผล (มาตรฐาน 5 ระดับ)</span>
        <div class="grid grid-cols-5 gap-1.5 text-center text-xs">
          <div class="p-2 bg-[#0B1428] rounded-lg border border-[#1E2E4E]">
            <span class="block text-blue-300 font-bold font-mono">4.51 - 5.00</span>
            <span class="text-[11px] text-slate-200">มากที่สุด</span>
          </div>
          <div class="p-2 bg-[#0B1428] rounded-lg border border-[#1E2E4E]">
            <span class="block text-blue-400 font-bold font-mono">3.51 - 4.50</span>
            <span class="text-[11px] text-slate-200">มาก</span>
          </div>
          <div class="p-2 bg-[#0B1428] rounded-lg border border-[#1E2E4E]">
            <span class="block text-[#D4AF37] font-bold font-mono">2.51 - 3.50</span>
            <span class="text-[11px] text-slate-200">ปานกลาง</span>
          </div>
          <div class="p-2 bg-[#0B1428] rounded-lg border border-[#1E2E4E]">
            <span class="block text-slate-300 font-bold font-mono">1.51 - 2.50</span>
            <span class="text-[11px] text-slate-300">น้อย</span>
          </div>
          <div class="p-2 bg-[#0B1428] rounded-lg border border-[#1E2E4E]">
            <span class="block text-slate-400 font-bold font-mono">1.00 - 1.50</span>
            <span class="text-[11px] text-slate-400">น้อยที่สุด</span>
          </div>
        </div>
      </div>

    </div>

    <!-- Main Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      <!-- 5 Questions (Donut Rings / Bars) -->
      <div class="lg:col-span-7 bg-[#101C33] border border-[#1E2E4E] rounded-2xl p-6">
        <h2 class="text-base font-semibold text-white mb-1">ค่าเฉลี่ยความพึงพอใจรายข้อ (5 ด้าน)</h2>
        <p class="text-xs text-[#94A3B8] mb-6">คำนวณแบบเรียลไทม์จากทุกคำตอบของผู้เข้าอบรม</p>
        
        <div class="space-y-5" id="questionsContainer"></div>
      </div>

      <!-- Donut Chart for Score Distribution -->
      <div class="lg:col-span-5 bg-[#101C33] border border-[#1E2E4E] rounded-2xl p-6 flex flex-col justify-between">
        <div>
          <h2 class="text-base font-semibold text-white mb-1">การกระจายคะแนน (Score Distribution)</h2>
          <p class="text-xs text-[#94A3B8] mb-4">กราฟวงกลมโดนัทแสดงสัดส่วน 1 ถึง 5 ดาว</p>
          
          <div id="donutContainer" class="flex flex-col items-center justify-center py-2"></div>
        </div>
      </div>

    </div>

    <!-- Recent Suggestions Feed -->
    <div class="bg-[#101C33] border border-[#1E2E4E] rounded-2xl p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-base font-semibold text-white">ข้อเสนอแนะล่าสุด</h2>
        <span id="suggestionsCount" class="text-xs text-[#94A3B8] mono">0 ข้อความ</span>
      </div>
      <div id="suggestionsList" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[360px] overflow-y-auto"></div>
    </div>

  </main>

  <script>
    const questionsMeta = [
      { id: 'q1', title: '1. ความรู้ความสามารถและการถ่ายทอดของวิทยากร' },
      { id: 'q2', title: '2. ความสมบูรณ์ ทันสมัย และตรงประเด็นของเนื้อหา' },
      { id: 'q3', title: '3. ความรู้และทักษะสามารถนำไปประยุกต์ใช้ได้จริง' },
      { id: 'q4', title: '4. การมีส่วนร่วมและบรรยากาศในการเรียนรู้' },
      { id: 'q5', title: '5. ความเหมาะสมของเวลา สถานที่ และสื่ออุปกรณ์' }
    ];

    let allSubmissions = [];
    const firebaseConfig = ${config};
    
    try {
      if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
      const db = firebase.database();
      db.ref('evaluations').on('value', (snapshot) => {
        const val = snapshot.val();
        allSubmissions = val ? Object.values(val).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)) : [];
        renderDashboard();
      });
    } catch (e) {
      allSubmissions = JSON.parse(localStorage.getItem('training_eval_submissions') || '[]');
      renderDashboard();
    }

    function renderDashboard() {
      const count = allSubmissions.length;
      document.getElementById('totalCount').textContent = count;

      if (count === 0) {
        document.getElementById('overallAvg').textContent = '0.00';
        document.getElementById('overallTier').textContent = 'รอคำตอบแรก';
        renderQuestionBars({ q1: 0, q2: 0, q3: 0, q4: 0, q5: 0 });
        renderDonutChart({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
        renderSuggestions([]);
        return;
      }

      const sums = { q1: 0, q2: 0, q3: 0, q4: 0, q5: 0 };
      const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      allSubmissions.forEach(s => {
        ['q1','q2','q3','q4','q5'].forEach(k => {
          const v = s.ratings?.[k] || 0;
          sums[k] += v;
          if (dist[v] !== undefined) dist[v]++;
        });
      });

      const avgs = {
        q1: sums.q1 / count,
        q2: sums.q2 / count,
        q3: sums.q3 / count,
        q4: sums.q4 / count,
        q5: sums.q5 / count
      };

      const overall = (avgs.q1 + avgs.q2 + avgs.q3 + avgs.q4 + avgs.q5) / 5;
      document.getElementById('overallAvg').textContent = overall.toFixed(2);
      
      let tier = 'มากที่สุด (Excellent)';
      if (overall < 1.51) tier = 'น้อยที่สุด (Needs Work)';
      else if (overall < 2.51) tier = 'น้อย (Low)';
      else if (overall < 3.51) tier = 'ปานกลาง (Moderate)';
      else if (overall < 4.51) tier = 'มาก (Good)';
      document.getElementById('overallTier').textContent = tier;

      renderQuestionBars(avgs);
      renderDonutChart(dist);
      renderSuggestions(allSubmissions.filter(s => s.suggestion && s.suggestion.trim() !== ''));
    }

    function renderQuestionBars(avgs) {
      const container = document.getElementById('questionsContainer');
      container.innerHTML = questionsMeta.map(q => {
        const score = avgs[q.id] || 0;
        const percent = (score / 5) * 100;
        return \`
          <div>
            <div class="flex justify-between items-baseline text-xs mb-1.5">
              <span class="font-medium text-slate-200">\${q.title}</span>
              <span class="font-bold text-blue-300 mono text-sm">\${score.toFixed(2)} <span class="text-xs text-[#94A3B8]">/ 5.0</span></span>
            </div>
            <div class="w-full bg-[#0A1326] h-3.5 rounded-xl overflow-hidden p-0.5 border border-[#1E2E4E]">
              <div class="bg-gradient-to-r from-[#1D4ED8] to-[#3B82F6] h-full rounded-lg transition-all duration-500" style="width: \${percent}%"></div>
            </div>
          </div>
        \`;
      }).join('');
    }

    function renderDonutChart(dist) {
      const total = Object.values(dist).reduce((a, b) => a + b, 0);
      const colors = { 5: '#1D4ED8', 4: '#3B82F6', 3: '#D4AF37', 2: '#94A3B8', 1: '#64748B' };
      const labels = { 5: '5 ดาว (มากที่สุด)', 4: '4 ดาว (มาก)', 3: '3 ดาว (ปานกลาง)', 2: '2 ดาว (น้อย)', 1: '1 ดาว (น้อยที่สุด)' };
      
      const size = 180, stroke = 26, r = (size - stroke) / 2, c = 2 * Math.PI * r;
      let offset = 0;
      let circlesHtml = '';
      
      [5, 4, 3, 2, 1].forEach(star => {
        const val = dist[star] || 0;
        const pct = total > 0 ? val / total : 0;
        const dash = \`\${pct * c} \${c}\`;
        circlesHtml += \`<circle cx="\${size/2}" cy="\${size/2}" r="\${r}" fill="transparent" stroke="\${colors[star]}" stroke-width="\${stroke}" stroke-dasharray="\${dash}" stroke-dashoffset="\${-offset}" stroke-linecap="round" />\`;
        offset += pct * c;
      });

      const legendHtml = [5, 4, 3, 2, 1].map(star => {
        const val = dist[star] || 0;
        const pct = total > 0 ? Math.round((val / total) * 100) : 0;
        return \`
          <div class="flex items-center justify-between text-xs p-1.5 rounded-lg bg-[#0A1326] border border-[#1E2E4E]">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full" style="background-color: \${colors[star]}"></span>
              <span class="text-slate-200">\${labels[star]}</span>
            </div>
            <span class="font-mono text-amber-200">\${val} ครั้ง (\${pct}%)</span>
          </div>
        \`;
      }).join('');

      document.getElementById('donutContainer').innerHTML = \`
        <div class="flex flex-col sm:flex-row items-center gap-6 w-full">
          <div class="relative shrink-0" style="width:\${size}px; height:\${size}px;">
            <svg width="\${size}" height="\${size}" class="transform -rotate-90">
              <circle cx="\${size/2}" cy="\${size/2}" r="\${r}" fill="transparent" stroke="#1E2E4E" stroke-width="\${stroke}" />
              \${circlesHtml}
            </svg>
            <div class="absolute inset-0 flex flex-col items-center justify-center">
              <span class="text-xl font-bold font-mono text-white">\${total}</span>
              <span class="text-[10px] text-amber-200">คำตอบ</span>
            </div>
          </div>
          <div class="flex-1 w-full space-y-1.5">\${legendHtml}</div>
        </div>
      \`;
    }

    function renderSuggestions(list) {
      document.getElementById('suggestionsCount').textContent = list.length + ' ข้อความ';
      const el = document.getElementById('suggestionsList');
      if (list.length === 0) {
        el.innerHTML = '<p class="text-xs text-[#64748B] italic col-span-3 text-center py-6">ยังไม่มีข้อเสนอแนะ</p>';
        return;
      }
      el.innerHTML = list.map(item => \`
        <div class="p-3.5 bg-[#0A1326] border border-[#1E2E4E] rounded-xl">
          <p class="text-xs text-[#EDE7DC] leading-relaxed mb-2">"\${item.suggestion}"</p>
          <div class="flex justify-between text-[11px] text-[#94A3B8]">
            <span>\${new Date(item.timestamp).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}</span>
            <span class="mono text-blue-300 font-bold">\${item.averageScore.toFixed(2)} ★</span>
          </div>
        </div>
      \`).join('');
    }

    function exportCSV() {
      if (allSubmissions.length === 0) {
        alert('ยังไม่มีข้อมูลสำหรับส่งออก CSV');
        return;
      }
      const headers = ['ลำดับ', 'วันที่และเวลา', 'ข้อ1 (วิทยากร)', 'ข้อ2 (เนื้อหา)', 'ข้อ3 (การนำไปใช้)', 'ข้อ4 (บรรยากาศ)', 'ข้อ5 (การจัดการ)', 'คะแนนเฉลี่ย', 'ข้อเสนอแนะ'];
      const rows = allSubmissions.map((s, i) => [
        i + 1,
        '"' + new Date(s.timestamp).toLocaleString('th-TH') + '"',
        s.ratings?.q1 || '',
        s.ratings?.q2 || '',
        s.ratings?.q3 || '',
        s.ratings?.q4 || '',
        s.ratings?.q5 || '',
        s.averageScore?.toFixed(2) || '',
        '"' + (s.suggestion || '').replace(/"/g, '""') + '"'
      ].join(','));

      const csvContent = '\\uFEFF' + [headers.join(','), ...rows].join('\\r\\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'training_eval_results.csv';
      a.click();
      URL.revokeObjectURL(url);
    }

    function toggleFullscreen() {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    }
  </script>
</body>
</html>`;
}

export function generateFirebaseRulesJson(): string {
  return `{
  "rules": {
    "evaluations": {
      ".read": true,
      ".write": true,
      "$eval_id": {
        ".validate": "newData.hasChildren(['ratings', 'averageScore', 'timestamp'])"
      }
    }
  }
}`;
}

export function generateFirebaseHostingConfig(): string {
  return `{
  "database": {
    "rules": "database.rules.json"
  },
  "hosting": {
    "public": "public",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}`;
}
