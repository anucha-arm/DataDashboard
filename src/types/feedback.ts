export interface EvaluationQuestion {
  id: 'q1' | 'q2' | 'q3' | 'q4' | 'q5';
  title: string;
  category: string;
  description: string;
}

export interface FeedbackSubmission {
  id: string;
  timestamp: string; // ISO string
  dateFormatted: string;
  ratings: {
    q1: number;
    q2: number;
    q3: number;
    q4: number;
    q5: number;
  };
  averageScore: number;
  suggestion: string;
  deviceFingerprint?: string;
}

export interface FirebaseConfigSettings {
  apiKey: string;
  authDomain: string;
  databaseURL: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export const EVALUATION_QUESTIONS: EvaluationQuestion[] = [
  {
    id: 'q1',
    category: 'ด้านวิทยากร',
    title: 'ความรู้ความสามารถและการถ่ายทอดของวิทยากร',
    description: 'ความเชี่ยวชาญ เทคนิคการสอน การสื่อสารเข้าใจง่าย และการตอบข้อซักถาม'
  },
  {
    id: 'q2',
    category: 'ด้านเนื้อหา',
    title: 'ความสมบูรณ์ ทันสมัย และตรงประเด็นของเนื้อหา',
    description: 'เนื้อหามีความน่าสนใจ ตรงตามวัตถุประสงค์ และมีลำดับขั้นตอนชัดเจน'
  },
  {
    id: 'q3',
    category: 'ด้านการนำไปใช้',
    title: 'ความรู้และทักษะสามารถนำไปประยุกต์ใช้ได้จริง',
    description: 'สามารถนำความรู้ เทคนิค หรือเครื่องมือไปต่อยอดและปฏิบัติงานได้ทันที'
  },
  {
    id: 'q4',
    category: 'ด้านบรรยากาศ',
    title: 'การมีส่วนร่วมและบรรยากาศในการเรียนรู้',
    description: 'การเปิดโอกาสให้ซักถาม แลกเปลี่ยนความคิดเห็น และความเป็นกันเอง'
  },
  {
    id: 'q5',
    category: 'ด้านการจัดการ',
    title: 'ความเหมาะสมของเวลา สถานที่ และสื่ออุปกรณ์',
    description: 'การบริหารเวลา สื่อการสอน เอกสารประกอบ และสิ่งอำนวยความสะดวก'
  }
];

export const RATING_LEVELS = [
  { score: 1, label: 'น้อยที่สุด', emoji: '😞', shortText: '1 - น้อยที่สุด' },
  { score: 2, label: 'น้อย', emoji: '🙁', shortText: '2 - น้อย' },
  { score: 3, label: 'ปานกลาง', emoji: '😐', shortText: '3 - ปานกลาง' },
  { score: 4, label: 'มาก', emoji: '😊', shortText: '4 - มาก' },
  { score: 5, label: 'มากที่สุด', emoji: '🤩', shortText: '5 - มากที่สุด' }
];

export interface InterpretationResult {
  label: string;
  englishLabel: string;
  color: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  description: string;
}

export function getInterpretation(score: number): InterpretationResult {
  if (score >= 4.51) {
    return {
      label: 'มากที่สุด',
      englishLabel: 'Excellent / Highest',
      color: 'navy',
      bgColor: 'bg-blue-950/80',
      textColor: 'text-blue-200',
      borderColor: 'border-blue-600',
      description: 'ผลการประเมินอยู่ในเกณฑ์ยอดเยี่ยม ผู้เข้าร่วมมีความพึงพอใจสูงสุด'
    };
  } else if (score >= 3.51) {
    return {
      label: 'มาก',
      englishLabel: 'Good / High',
      color: 'blue',
      bgColor: 'bg-slate-850',
      textColor: 'text-sky-200',
      borderColor: 'border-sky-700',
      description: 'ผลการประเมินอยู่ในเกณฑ์ดี บรรลุวัตถุประสงค์การจัดอบรมเป็นอย่างดี'
    };
  } else if (score >= 2.51) {
    return {
      label: 'ปานกลาง',
      englishLabel: 'Moderate / Fair',
      color: 'beige',
      bgColor: 'bg-[#29241c]',
      textColor: 'text-[#f5ebd9]',
      borderColor: 'border-[#8c7a62]',
      description: 'ผลการประเมินอยู่ในเกณฑ์ปานกลาง มีจุดที่สามารถปรับปรุงพัฒนาได้'
    };
  } else if (score >= 1.51) {
    return {
      label: 'น้อย',
      englishLabel: 'Poor / Low',
      color: 'gray',
      bgColor: 'bg-slate-800',
      textColor: 'text-slate-300',
      borderColor: 'border-slate-600',
      description: 'ผลการประเมินอยู่ในเกณฑ์น้อย ควรทบทวนเนื้อหาและวิธีการนำเสนอ'
    };
  } else {
    return {
      label: 'น้อยที่สุด',
      englishLabel: 'Lowest / Urgent Attention',
      color: 'slate',
      bgColor: 'bg-slate-900',
      textColor: 'text-slate-400',
      borderColor: 'border-slate-700',
      description: 'ผลการประเมินต้องปรับปรุงอย่างเร่งด่วน'
    };
  }
}
