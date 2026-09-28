'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Sliders,
  BookOpen,
  Clock,
  Users,
  Feather,
  Layers,
  ChevronLeft,
  ChevronRight,
  Flame
} from 'lucide-react';
import { KhutbahGenerationParams, SermonType } from '../types/khutbah';

interface SidebarConfigProps {
  onGenerate: (params: KhutbahGenerationParams) => void;
  isLoading: boolean;
}

const QUICK_THEMES = [
  'الصبر عند الشدائد وحسن التوكل على الله',
  'الأخوة في الله وحفظ حقوق المسلمين',
  'بر الوالدين وصلة الأرحام وفضلهما',
  'إخلاص النية وصلاح السريرة ومراقبة الله',
  'التوبة الصادقة والرجوع إلى الله',
  'خطورة آفات اللسان ومظالم العباد'
];

export const SidebarConfig: React.FC<SidebarConfigProps> = ({ onGenerate, isLoading }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [theme, setTheme] = useState('الصبر عند الشدائد وحسن التوكل على الله');
  const [sermonType, setSermonType] = useState<SermonType>('jumuah');
  const [duration, setDuration] = useState(15);
  const [audience, setAudience] = useState('جمهور عام متنوع من المصلين والأسر');
  const [tone, setTone] = useState('موعظة ترقق القلوب وتجمع بين الرجاء والرهبة');
  const [quranCount, setQuranCount] = useState(2);
  const [hadithCount, setHadithCount] = useState(2);
  const [poetryCount, setPoetryCount] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate({
      theme,
      sermon_type: sermonType,
      target_duration_minutes: duration,
      audience_profile: audience,
      tone,
      quran_count: quranCount,
      hadith_count: hadithCount,
      poetry_count: poetryCount
    });
  };

  return (
    <>
      {/* Toggle button when drawer is collapsed */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full border border-amber-600/40 bg-slate-900 px-4 py-2.5 text-xs font-semibold text-amber-300 shadow-xl backdrop-blur-md transition hover:bg-slate-800 hover:text-amber-200"
        >
          <Sliders className="h-4 w-4" />
          <span>تخصيص الخطبة والمحددات</span>
        </button>
      )}

      {/* Sidebar Panel */}
      <aside
        dir="rtl"
        className={`fixed inset-y-0 right-0 z-50 flex w-80 flex-col border-l border-slate-800 bg-slate-950/95 shadow-2xl backdrop-blur-xl transition-transform duration-300 sm:w-96 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
          <div className="flex items-center gap-2 text-amber-400">
            <Sliders className="h-4 w-4" />
            <h3 className="font-amiri text-lg font-bold text-amber-200">محددات صياغة الخطبة</h3>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 space-y-5 overflow-y-auto px-5 py-4 text-xs text-slate-300">
          {/* 1. Theme Input */}
          <div>
            <label className="mb-1.5 block font-semibold text-slate-200">موضوع الخطبة:</label>
            <textarea
              value={theme}
              onChange={e => setTheme(e.target.value)}
              rows={2}
              required
              className="w-full rounded-xl border border-slate-700/80 bg-slate-900/90 p-3 font-amiri text-sm leading-relaxed text-amber-100 outline-none transition focus:border-amber-500/80"
              placeholder="اكتب عنوان أو فكرة الخطبة..."
            />

            {/* Quick Themes */}
            <div className="mt-2 flex flex-wrap gap-1.5">
              {QUICK_THEMES.slice(0, 3).map((t, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setTheme(t)}
                  className="rounded bg-slate-800/80 px-2 py-1 text-[11px] text-slate-300 transition hover:bg-amber-600/20 hover:text-amber-300"
                >
                  {t.substring(0, 22)}...
                </button>
              ))}
            </div>
          </div>

          {/* 2. Sermon Type */}
          <div>
            <label className="mb-1.5 block font-semibold text-slate-200">نوع الخطبة أو الموعظة:</label>
            <select
              value={sermonType}
              onChange={e => setSermonType(e.target.value as SermonType)}
              className="w-full rounded-xl border border-slate-700/80 bg-slate-900 p-2.5 font-amiri text-sm text-slate-200 outline-none focus:border-amber-500/80"
            >
              <option value="jumuah">خطبة جمعة مسنونة (بخطبتين وجلسة استغفار)</option>
              <option value="eid_al_fitr">خطبة عيد الفطر المبارك</option>
              <option value="eid_al_adha">خطبة عيد الأضحى المبارك</option>
              <option value="janazah">موعظة جنائزية وتذكير بالموت</option>
              <option value="general_reminder">موعظة وتذكير عام في المسجد</option>
            </select>
          </div>

          {/* 3. Duration & Word Count Calculator */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200">المدة المستهدفة للإلقاء:</span>
              <span className="font-bold text-amber-400">{duration} دقيقة</span>
            </div>
            <input
              type="range"
              min="5"
              max="40"
              step="1"
              value={duration}
              onChange={e => setDuration(parseInt(e.target.value))}
              className="mt-2 w-full accent-amber-500"
            />
            <div className="mt-1 flex justify-between text-[11px] text-slate-400">
              <span>5 دقائق (موجزة)</span>
              <span>المتوقع: ~{duration * 95} كلمة</span>
              <span>40 دقيقة (مطولة)</span>
            </div>
          </div>

          {/* 4. Audience Profile */}
          <div>
            <label className="mb-1.5 block font-semibold text-slate-200">طبيعة المصلين والمخاطبين:</label>
            <select
              value={audience}
              onChange={e => setAudience(e.target.value)}
              className="w-full rounded-xl border border-slate-700/80 bg-slate-900 p-2.5 font-amiri text-sm text-slate-200 outline-none focus:border-amber-500/80"
            >
              <option value="جمهور عام متنوع من المصلين والأسر">جمهور عام متنوع من المصلين والأسر</option>
              <option value="شباب وطلاب جامعيون">شباب وطلاب جامعيون (تركيز على الفكر والسلوك)</option>
              <option value="أسر وعائلات (تركيز على التربية والبيوت)">أسر وعائلات (تركيز على التربية والبيوت)</option>
              <option value="تجمع عمالي وتجاري (تركيز على الأمانة والمعاملات)">تجمع عمالي وتجاري (تركيز على المعاملات)</option>
            </select>
          </div>

          {/* 5. Tone */}
          <div>
            <label className="mb-1.5 block font-semibold text-slate-200">نبرة الخطبة وأسلوبها:</label>
            <select
              value={tone}
              onChange={e => setTone(e.target.value)}
              className="w-full rounded-xl border border-slate-700/80 bg-slate-900 p-2.5 font-amiri text-sm text-slate-200 outline-none focus:border-amber-500/80"
            >
              <option value="موعظة ترقق القلوب وتجمع بين الرجاء والرهبة">موعظة ترقق القلوب وتجمع بين الرجاء والرهبة</option>
              <option value="أسلوب علمي تأصيلي رصين ومستند للأدلة">أسلوب علمي تأصيلي رصين ومستند للأدلة</option>
              <option value="خطابي حماسي يدعو للمبادرة والعمل">خطابي حماسي يدعو للمبادرة والعمل</option>
              <option value="توجيهي تربوي هادئ يركز على التطبيق العملي">توجيهي تربوي هادئ يركز على التطبيق العملي</option>
            </select>
          </div>

          {/* 6. Citation Counters */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3.5 space-y-3">
            <span className="block font-semibold text-slate-200">توزيع الشواهد الشرعية الموثقة:</span>
            
            <div className="flex items-center justify-between">
              <span className="text-slate-400">الآيات القرآنية (رسم عثماني):</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQuranCount(Math.max(1, quranCount - 1))}
                  className="h-6 w-6 rounded bg-slate-800 text-slate-200 hover:bg-slate-700"
                >-</button>
                <span className="w-5 text-center font-bold text-amber-300">{quranCount}</span>
                <button
                  type="button"
                  onClick={() => setQuranCount(Math.min(5, quranCount + 1))}
                  className="h-6 w-6 rounded bg-slate-800 text-slate-200 hover:bg-slate-700"
                >+</button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">الأحاديث النبوية (صحيح وحسن):</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setHadithCount(Math.max(1, hadithCount - 1))}
                  className="h-6 w-6 rounded bg-slate-800 text-slate-200 hover:bg-slate-700"
                >-</button>
                <span className="w-5 text-center font-bold text-emerald-300">{hadithCount}</span>
                <button
                  type="button"
                  onClick={() => setHadithCount(Math.min(5, hadithCount + 1))}
                  className="h-6 w-6 rounded bg-slate-800 text-slate-200 hover:bg-slate-700"
                >+</button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">الشواهد الشعرية (بحور الخليل):</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPoetryCount(Math.max(0, poetryCount - 1))}
                  className="h-6 w-6 rounded bg-slate-800 text-slate-200 hover:bg-slate-700"
                >-</button>
                <span className="w-5 text-center font-bold text-sky-300">{poetryCount}</span>
                <button
                  type="button"
                  onClick={() => setPoetryCount(Math.min(3, poetryCount + 1))}
                  className="h-6 w-6 rounded bg-slate-800 text-slate-200 hover:bg-slate-700"
                >+</button>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 py-3 font-amiri text-base font-bold text-slate-950 shadow-lg shadow-amber-500/20 transition hover:brightness-110 disabled:opacity-50"
            >
              <Sparkles className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'جارٍ التدقيق والتأصيل الشرعي...' : 'صياغة الخطبة الموثقة'}</span>
            </button>
          </div>
        </form>
      </aside>
    </>
  );
};
