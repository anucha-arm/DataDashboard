import React, { useState } from 'react';
import { X, Copy, Check, Download, Terminal, Flame, Database, Globe, HelpCircle, Save } from 'lucide-react';
import {
  generateSurveyHtml,
  generateDashboardHtml,
  generateFirebaseRulesJson,
  generateFirebaseHostingConfig
} from '../utils/codeGenerators';
import { storageService } from '../services/storage';
import { FirebaseConfigSettings } from '../types/feedback';

interface FirebaseDeployGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FirebaseDeployGuideModal: React.FC<FirebaseDeployGuideModalProps> = ({
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'guide' | 'survey' | 'dashboard' | 'config'>('guide');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Direct Firebase Config in current app
  const currentConfig = storageService.getFirebaseConfig();
  const [apiKey, setApiKey] = useState(currentConfig?.apiKey || '');
  const [databaseURL, setDatabaseURL] = useState(currentConfig?.databaseURL || '');
  const [projectId, setProjectId] = useState(currentConfig?.projectId || '');
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const surveyCode = generateSurveyHtml(
    databaseURL ? JSON.stringify({ apiKey, databaseURL, projectId }, null, 2) : undefined
  );
  const dashboardCode = generateDashboardHtml(
    databaseURL ? JSON.stringify({ apiKey, databaseURL, projectId }, null, 2) : undefined
  );
  const rulesCode = generateFirebaseRulesJson();
  const hostingCode = generateFirebaseHostingConfig();

  const handleCopy = async (code: string, key: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      // fallback
    }
  };

  const handleDownload = (content: string, filename: string, type: string = 'text/html') => {
    const blob = new Blob([content], { type: `${type};charset=utf-8;` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveFirebaseConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!databaseURL.trim()) {
      storageService.setFirebaseConfig(null);
    } else {
      const config: FirebaseConfigSettings = {
        apiKey: apiKey.trim(),
        databaseURL: databaseURL.trim(),
        projectId: projectId.trim(),
        authDomain: `${projectId.trim()}.firebaseapp.com`,
        storageBucket: `${projectId.trim()}.appspot.com`,
        messagingSenderId: '',
        appId: ''
      };
      storageService.setFirebaseConfig(config);
    }
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#0F1E36] rounded-3xl shadow-2xl border border-[#1E2E4E] flex flex-col overflow-hidden text-slate-100">
        
        {/* Header (Formal Navy & Beige) */}
        <div className="px-6 py-4 border-b border-[#1E2E4E] bg-[#0A1326] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#1A2B4D] border border-[#2B4068] text-amber-200 flex items-center justify-center">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                คู่มือตั้งค่า Firebase และโค้ดแยก 2 ไฟล์
              </h2>
              <p className="text-xs text-[#94A3B8]">
                วิธีตั้งค่า Firebase Realtime Database ฟรี พร้อมกราฟวงกลมโดนัทและธีมทางการ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#121E36] hover:bg-[#1A2B4D] border border-[#1E2E4E] flex items-center justify-center text-[#94A3B8] hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-[#1E2E4E] bg-[#070E1E] overflow-x-auto text-xs shrink-0">
          <button
            onClick={() => setActiveTab('guide')}
            className={`px-4 py-2.5 font-semibold rounded-t-xl transition-colors border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'guide'
                ? 'border-blue-500 text-blue-300 bg-[#0F1E36]'
                : 'border-transparent text-[#94A3B8] hover:text-white'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>1. ขั้นตอนตั้งค่าและ Deploy</span>
          </button>
          
          <button
            onClick={() => setActiveTab('survey')}
            className={`px-4 py-2.5 font-semibold rounded-t-xl transition-colors border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'survey'
                ? 'border-blue-500 text-blue-300 bg-[#0F1E36]'
                : 'border-transparent text-[#94A3B8] hover:text-white'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>2. โค้ด survey.html (หน้าตอบ)</span>
          </button>

          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2.5 font-semibold rounded-t-xl transition-colors border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'border-blue-500 text-blue-300 bg-[#0F1E36]'
                : 'border-transparent text-[#94A3B8] hover:text-white'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>3. โค้ด dashboard.html (หน้าจอโดนัท)</span>
          </button>

          <button
            onClick={() => setActiveTab('config')}
            className={`px-4 py-2.5 font-semibold rounded-t-xl transition-colors border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'config'
                ? 'border-blue-500 text-blue-300 bg-[#0F1E36]'
                : 'border-transparent text-[#94A3B8] hover:text-white'
            }`}
          >
            <Flame className="w-4 h-4" />
            <span>4. เชื่อม Firebase เข้าแอปนี้</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6 text-slate-700 dark:text-slate-300">
          
          {/* TAB 1: Step-by-Step Guide */}
          {activeTab === 'guide' && (
            <div className="space-y-6 max-w-3xl">
              <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 text-xs text-indigo-900 dark:text-indigo-200 leading-relaxed">
                <span className="font-bold">สรุปสั้น:</span> สามารถใช้งานแอปนี้ได้ทันทีใน AI Studio ผ่านระบบ Real-time ในตัว หรือหากต้องการนำไฟล์ HTML ทั้ง 2 ไปโฮสต์บนเซิร์ฟเวอร์ของตนเองพร้อม Firebase Realtime Database แพ็กเกจฟรี (Spark Plan) สามารถทำตาม 4 ขั้นตอนนี้ได้เลยครับ
              </div>

              {/* Step 1 */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                    1
                  </span>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    สร้างโปรเจกต์บน Firebase Console (ฟรี 100%)
                  </h3>
                </div>
                <div className="pl-8 text-xs space-y-1.5 text-slate-600 dark:text-slate-400">
                  <p>1. ไปที่ <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="text-indigo-600 underline font-medium">console.firebase.google.com</a> แล้วล็อกอินด้วยบัญชี Google</p>
                  <p>2. กด <strong>"Add project"</strong> (สร้างโปรเจกต์) ตั้งชื่อโปรเจกต์ เช่น <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-mono">training-eval-live</code></p>
                  <p>3. กด Next ข้าม Google Analytics ได้ หรือจะเปิดไว้ก็ได้ แล้วกด Create Project</p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                    2
                  </span>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    เปิดใช้งาน Firebase Realtime Database
                  </h3>
                </div>
                <div className="pl-8 text-xs space-y-2 text-slate-600 dark:text-slate-400">
                  <p>1. เมนูด้านซ้าย เลือก <strong>Build</strong> → <strong>Realtime Database</strong></p>
                  <p>2. กดปุ่ม <strong>"Create Database"</strong></p>
                  <p>3. เลือกตำแหน่งเซิร์ฟเวอร์ เช่น <strong>Singapore (asia-southeast1)</strong> เพื่อความเร็วสูงสุดในไทย</p>
                  <p>4. ในหน้าถัดไป เลือก <strong>"Start in test mode"</strong> หรือตั้งค่า Rules ตามขั้นตอนที่ 3 ด้านล่าง</p>
                  <p>5. คัดลอก <strong>Database URL</strong> เช่น <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-mono text-indigo-500">https://xxxx-default-rtdb.asia-southeast1.firebasedatabase.app</code></p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                    3
                  </span>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    ตั้งค่า Security Rules ให้ผู้เข้าอบรมส่งคะแนนได้โดยไม่ต้องล็อกอิน
                  </h3>
                </div>
                <div className="pl-8 text-xs space-y-2 text-slate-600 dark:text-slate-400">
                  <p>ไปที่แท็บ <strong>Rules</strong> ในหน้า Realtime Database แล้ววาง JSON ด้านล่างนี้ จากนั้นกด <strong>Publish</strong>:</p>
                  <div className="relative">
                    <pre className="p-3 bg-slate-950 text-slate-200 rounded-xl font-mono text-[11px] overflow-x-auto">
                      {rulesCode}
                    </pre>
                    <button
                      onClick={() => handleCopy(rulesCode, 'rules')}
                      className="absolute top-2 right-2 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] flex items-center gap-1 transition-colors"
                    >
                      {copiedKey === 'rules' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'rules' ? 'คัดลอกแล้ว' : 'คัดลอก Rules'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                    4
                  </span>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    วิธี Deploy ขึ้นโฮสต์ฟรี (Firebase Hosting / GitHub Pages)
                  </h3>
                </div>
                <div className="pl-8 text-xs space-y-3 text-slate-600 dark:text-slate-400">
                  <p className="font-medium text-slate-800 dark:text-slate-200">ทางเลือก A: ใช้ Firebase Hosting ผ่านคำสั่ง Terminal (แนะนำ)</p>
                  <div className="p-3 bg-slate-950 text-slate-200 rounded-xl font-mono text-[11px] space-y-1">
                    <div className="text-slate-400"># 1. ติดตั้ง firebase-tools (ถ้ายังไม่มี)</div>
                    <div className="text-emerald-400">npm install -g firebase-tools</div>
                    <div className="text-slate-400 pt-1"># 2. เข้าสู่ระบบ</div>
                    <div className="text-emerald-400">firebase login</div>
                    <div className="text-slate-400 pt-1"># 3. นำไฟล์ survey.html และ dashboard.html ใส่ไว้ในโฟลเดอร์ public/</div>
                    <div className="text-emerald-400">firebase init hosting</div>
                    <div className="text-slate-400 pt-1"># 4. ดีพลอยขึ้นเว็บทันที</div>
                    <div className="text-emerald-400">firebase deploy --only hosting</div>
                  </div>

                  <p className="font-medium text-slate-800 dark:text-slate-200 pt-2">ทางเลือก B: นำไฟล์ survey.html และ dashboard.html ไปอัปโหลดบนเว็บโฮสติ้งใดก็ได้</p>
                  <p>เนื่องจากเป็นไฟล์เดี่ยวแบบ Standalone ที่มีโค้ดครบถ้วน (HTML + Tailwind + Firebase SDK) คุณสามารถลากวางบนเว็บเซิร์ฟเวอร์, GitHub Pages, Netlify, Vercel หรือ Apache/Nginx ได้ทันทีโดยไม่ต้อง Build เพิ่มเติม</p>
                </div>
              </div>

              {/* Download buttons for project files */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap gap-2">
                <button
                  onClick={() => handleDownload(surveyCode, 'survey.html')}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>ดาวน์โหลด survey.html</span>
                </button>
                <button
                  onClick={() => handleDownload(dashboardCode, 'dashboard.html')}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>ดาวน์โหลด dashboard.html</span>
                </button>
                <button
                  onClick={() => handleDownload(rulesCode, 'database.rules.json', 'application/json')}
                  className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>ดาวน์โหลด database.rules.json</span>
                </button>
              </div>

            </div>
          )}

          {/* TAB 2: survey.html */}
          {activeTab === 'survey' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    ไฟล์ที่ 1: survey.html (หน้าแบบสอบถามสำหรับผู้เข้าอบรม)
                  </h3>
                  <p className="text-xs text-slate-500">
                    ออกแบบ Mobile-first ปุ่มกดขนาดใหญ่ สเกล 1-5 พร้อมระบบป้องกันการตอบซ้ำ
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(surveyCode, 'survey')}
                    className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
                  >
                    {copiedKey === 'survey' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'survey' ? 'คัดลอกแล้ว' : 'คัดลอกโค้ดทั้งหมด'}</span>
                  </button>
                  <button
                    onClick={() => handleDownload(surveyCode, 'survey.html')}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>ดาวน์โหลดไฟล์</span>
                  </button>
                </div>
              </div>

              <div className="relative">
                <pre className="p-4 bg-slate-950 text-slate-200 rounded-2xl font-mono text-[11px] overflow-x-auto max-h-[500px]">
                  {surveyCode}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 3: dashboard.html */}
          {activeTab === 'dashboard' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    ไฟล์ที่ 2: dashboard.html (หน้าแสดงผลขึ้นจอโปรเจกเตอร์)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Real-time Dashboard กราฟแท่งรายข้อ ค่าเฉลี่ยรวม เกณฑ์ 5 ระดับ และดาวน์โหลด CSV
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(dashboardCode, 'dashboard')}
                    className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
                  >
                    {copiedKey === 'dashboard' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'dashboard' ? 'คัดลอกแล้ว' : 'คัดลอกโค้ดทั้งหมด'}</span>
                  </button>
                  <button
                    onClick={() => handleDownload(dashboardCode, 'dashboard.html')}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>ดาวน์โหลดไฟล์</span>
                  </button>
                </div>
              </div>

              <div className="relative">
                <pre className="p-4 bg-slate-950 text-slate-200 rounded-2xl font-mono text-[11px] overflow-x-auto max-h-[500px]">
                  {dashboardCode}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 4: Live Config Input */}
          {activeTab === 'config' && (
            <form onSubmit={handleSaveFirebaseConfig} className="max-w-xl space-y-4">
              <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-2xl text-xs text-amber-900 dark:text-amber-200">
                <span className="font-bold">เชื่อมต่อ Real-time ทันที:</span> หากคุณมีโปรเจกต์ Firebase อยู่แล้ว สามารถกรอก <strong>Database URL</strong> และ <strong>API Key</strong> ด้านล่างนี้เพื่อให้อินเทอร์เฟซนี้ซิงก์ข้อมูลกับ Firebase จริงได้ทันที
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-900 dark:text-white mb-1">
                  Firebase Realtime Database URL
                </label>
                <input
                  type="url"
                  placeholder="https://your-project-id-default-rtdb.asia-southeast1.firebasedatabase.app"
                  value={databaseURL}
                  onChange={(e) => setDatabaseURL(e.target.value)}
                  className="w-full text-xs p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-900 dark:text-white mb-1">
                  API Key (ตัวเลือกเสริมสำหรับ REST / SDK)
                </label>
                <input
                  type="text"
                  placeholder="AIzaSy..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full text-xs p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-900 dark:text-white mb-1">
                  Project ID (ตัวเลือกเสริม)
                </label>
                <input
                  type="text"
                  placeholder="my-training-app"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full text-xs p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>บันทึกการตั้งค่า Firebase</span>
                </button>
                {saveSuccess && (
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 animate-in fade-in">
                    <Check className="w-4 h-4" />
                    <span>บันทึกและเริ่มซิงก์เรียบร้อยแล้ว</span>
                  </span>
                )}
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
