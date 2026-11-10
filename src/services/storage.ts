import { FeedbackSubmission, FirebaseConfigSettings } from '../types/feedback';

const STORAGE_KEY = 'training_eval_submissions_v1';
const SUBMITTED_FLAG_KEY = 'training_eval_has_submitted_v1';
const FIREBASE_CONFIG_KEY = 'training_eval_firebase_config_v1';
const CHANNEL_NAME = 'training_eval_live_channel';

// Realistic sample initial training evaluations in Thai
export const SEED_SUBMISSIONS: FeedbackSubmission[] = [
  {
    id: 'seed-1',
    timestamp: new Date(Date.now() - 38 * 60 * 1000).toISOString(),
    dateFormatted: '18:15',
    ratings: { q1: 5, q2: 5, q3: 5, q4: 5, q5: 4 },
    averageScore: 4.80,
    suggestion: 'วิทยากรอธิบายดีมาก ตัวอย่างชัดเจนและนำไปประยุกต์ใช้กับโปรเจกต์งานได้จริง ขอบคุณมากๆ ครับ'
  },
  {
    id: 'seed-2',
    timestamp: new Date(Date.now() - 32 * 60 * 1000).toISOString(),
    dateFormatted: '18:21',
    ratings: { q1: 5, q2: 4, q3: 5, q4: 4, q5: 4 },
    averageScore: 4.40,
    suggestion: 'เนื้อหาแน่นและกระชับดีมาก อยากให้เพิ่มเวลา Workshop ช่วงบ่ายอีกนิดจะยิ่งสนุกมากครับ'
  },
  {
    id: 'seed-3',
    timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    dateFormatted: '18:28',
    ratings: { q1: 5, q2: 5, q3: 4, q4: 5, q5: 5 },
    averageScore: 4.80,
    suggestion: 'บรรยากาศเป็นกันเอง กล้าถามข้อสงสัยได้ตลอด เอกสารประกอบสไลด์เข้าใจง่ายมาก'
  },
  {
    id: 'seed-4',
    timestamp: new Date(Date.now() - 19 * 60 * 1000).toISOString(),
    dateFormatted: '18:34',
    ratings: { q1: 4, q2: 4, q3: 5, q4: 5, q5: 4 },
    averageScore: 4.40,
    suggestion: 'ชอบช่วงถามตอบสด ได้ไอเดียใหม่ๆ ไปปรับปรุงงานประจำเยอะเลยครับ'
  },
  {
    id: 'seed-5',
    timestamp: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
    dateFormatted: '18:39',
    ratings: { q1: 5, q2: 5, q3: 5, q4: 5, q5: 5 },
    averageScore: 5.00,
    suggestion: 'ให้ 10/10 เลยค่ะ ประทับใจการเตรียมตัวของทีมงานและการถ่ายทอดของอาจารย์มาก'
  },
  {
    id: 'seed-6',
    timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    dateFormatted: '18:45',
    ratings: { q1: 4, q2: 5, q3: 4, q4: 4, q5: 4 },
    averageScore: 4.20,
    suggestion: 'อยากให้มีคอร์สระดับ Advanced ภาคต่อในหัวข้อนี้เพิ่มเติมในเดือนถัดไปครับ'
  },
  {
    id: 'seed-7',
    timestamp: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    dateFormatted: '18:50',
    ratings: { q1: 5, q2: 4, q3: 5, q4: 4, q5: 4 },
    averageScore: 4.40,
    suggestion: ''
  }
];

class StorageService {
  private channel: BroadcastChannel | null = null;
  private listeners: Set<(submissions: FeedbackSubmission[]) => void> = new Set();
  private firebaseConfig: FirebaseConfigSettings | null = null;
  private firebasePollingInterval: number | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        if ('BroadcastChannel' in window) {
          this.channel = new BroadcastChannel(CHANNEL_NAME);
          this.channel.onmessage = (event) => {
            if (event.data?.type === 'FEEDBACK_UPDATED') {
              this.notifyListeners();
            }
          };
        }
      } catch (err) {
        console.warn('BroadcastChannel not supported or restricted', err);
      }

      window.addEventListener('storage', (event) => {
        if (event.key === STORAGE_KEY) {
          this.notifyListeners();
        }
      });

      // Load saved Firebase config if any
      const savedConfig = localStorage.getItem(FIREBASE_CONFIG_KEY);
      if (savedConfig) {
        try {
          this.firebaseConfig = JSON.parse(savedConfig);
          this.initFirebaseSync();
        } catch {
          // ignore corrupted config
        }
      }
    }
  }

  public getSubmissions(): FeedbackSubmission[] {
    if (typeof window === 'undefined') return [];
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Seed with initial realistic data so the dashboard is immediately vivid
      this.saveSubmissionsToLocal(SEED_SUBMISSIONS);
      return SEED_SUBMISSIONS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  private saveSubmissionsToLocal(submissions: FeedbackSubmission[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(submissions));
  }

  public async addSubmission(
    ratings: { q1: number; q2: number; q3: number; q4: number; q5: number },
    suggestion: string
  ): Promise<FeedbackSubmission> {
    const scores = [ratings.q1, ratings.q2, ratings.q3, ratings.q4, ratings.q5];
    const avg = Number((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2));
    
    const now = new Date();
    const newSubmission: FeedbackSubmission = {
      id: 'resp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      timestamp: now.toISOString(),
      dateFormatted: now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      ratings,
      averageScore: avg,
      suggestion: suggestion.trim()
    };

    const current = this.getSubmissions();
    const updated = [newSubmission, ...current];
    this.saveSubmissionsToLocal(updated);
    this.setHasSubmitted(true);

    // Sync to Firebase if configured
    if (this.firebaseConfig?.databaseURL) {
      this.syncSubmissionToFirebase(newSubmission).catch(err => {
        console.warn('Failed to push to Firebase RTDB:', err);
      });
    }

    // Broadcast live event across browser tabs and windows
    if (this.channel) {
      this.channel.postMessage({ type: 'FEEDBACK_UPDATED', newSubmission });
    }
    this.notifyListeners();

    return newSubmission;
  }

  public subscribe(callback: (submissions: FeedbackSubmission[]) => void): () => void {
    this.listeners.add(callback);
    callback(this.getSubmissions());
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notifyListeners(): void {
    const submissions = this.getSubmissions();
    this.listeners.forEach((callback) => {
      try {
        callback(submissions);
      } catch (err) {
        console.error('Error notifying listener:', err);
      }
    });
  }

  public hasSubmitted(): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(SUBMITTED_FLAG_KEY) === 'true';
  }

  public setHasSubmitted(value: boolean): void {
    if (typeof window === 'undefined') return;
    if (value) {
      localStorage.setItem(SUBMITTED_FLAG_KEY, 'true');
    } else {
      localStorage.removeItem(SUBMITTED_FLAG_KEY);
    }
  }

  public clearAllData(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
    this.setHasSubmitted(false);
    this.saveSubmissionsToLocal([]);
    if (this.channel) {
      this.channel.postMessage({ type: 'FEEDBACK_UPDATED' });
    }
    this.notifyListeners();
  }

  public resetToSampleData(): void {
    if (typeof window === 'undefined') return;
    this.saveSubmissionsToLocal(SEED_SUBMISSIONS);
    if (this.channel) {
      this.channel.postMessage({ type: 'FEEDBACK_UPDATED' });
    }
    this.notifyListeners();
  }

  // Firebase Realtime Database integration
  public getFirebaseConfig(): FirebaseConfigSettings | null {
    return this.firebaseConfig;
  }

  public setFirebaseConfig(config: FirebaseConfigSettings | null): void {
    this.firebaseConfig = config;
    if (typeof window !== 'undefined') {
      if (config) {
        localStorage.setItem(FIREBASE_CONFIG_KEY, JSON.stringify(config));
        this.initFirebaseSync();
      } else {
        localStorage.removeItem(FIREBASE_CONFIG_KEY);
        if (this.firebasePollingInterval) {
          window.clearInterval(this.firebasePollingInterval);
          this.firebasePollingInterval = null;
        }
      }
    }
  }

  private async syncSubmissionToFirebase(submission: FeedbackSubmission): Promise<void> {
    if (!this.firebaseConfig?.databaseURL) return;
    let url = this.firebaseConfig.databaseURL.replace(/\/$/, '');
    url += `/evaluations/${submission.id}.json`;

    await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submission)
    });
  }

  private initFirebaseSync(): void {
    if (!this.firebaseConfig?.databaseURL || typeof window === 'undefined') return;
    if (this.firebasePollingInterval) {
      window.clearInterval(this.firebasePollingInterval);
    }

    const fetchFromFirebase = async () => {
      try {
        let url = this.firebaseConfig!.databaseURL.replace(/\/$/, '');
        url += `/evaluations.json`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (data && typeof data === 'object') {
            const list: FeedbackSubmission[] = Object.values(data);
            list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            this.saveSubmissionsToLocal(list);
            this.notifyListeners();
          }
        }
      } catch (err) {
        console.warn('Firebase RTDB sync poll failed:', err);
      }
    };

    fetchFromFirebase();
    this.firebasePollingInterval = window.setInterval(fetchFromFirebase, 5000);
  }

  // Export to CSV with UTF-8 BOM for Thai language compatibility in MS Excel
  public exportToCSV(submissions: FeedbackSubmission[]): void {
    const headers = [
      'ลำดับ',
      'วันที่และเวลา',
      'ข้อ 1 (วิทยากร)',
      'ข้อ 2 (เนื้อหา)',
      'ข้อ 3 (การนำไปใช้)',
      'ข้อ 4 (บรรยากาศ)',
      'ข้อ 5 (การจัดการ)',
      'คะแนนเฉลี่ย',
      'ระดับความพึงพอใจ',
      'ข้อเสนอแนะเพิ่มเติม'
    ];

    const rows = submissions.map((sub, idx) => {
      const avg = sub.averageScore;
      let label = 'มากที่สุด';
      if (avg < 1.51) label = 'น้อยที่สุด';
      else if (avg < 2.51) label = 'น้อย';
      else if (avg < 3.51) label = 'ปานกลาง';
      else if (avg < 4.51) label = 'มาก';

      const escapeCSV = (str: string) => {
        if (!str) return '""';
        const escaped = str.replace(/"/g, '""');
        return `"${escaped}"`;
      };

      return [
        idx + 1,
        escapeCSV(new Date(sub.timestamp).toLocaleString('th-TH')),
        sub.ratings.q1,
        sub.ratings.q2,
        sub.ratings.q3,
        sub.ratings.q4,
        sub.ratings.q5,
        sub.averageScore.toFixed(2),
        escapeCSV(label),
        escapeCSV(sub.suggestion)
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const dateStr = new Date().toISOString().slice(0, 10);
    link.download = `training_satisfaction_results_${dateStr}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export const storageService = new StorageService();
