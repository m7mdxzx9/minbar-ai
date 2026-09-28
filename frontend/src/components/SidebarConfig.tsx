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
  Flame,
  Search,
  Cpu,
  Key,
  CheckCircle2,
  Scroll
} from 'lucide-react';
import { KhutbahGenerationParams, SermonType } from '../types/khutbah';

interface SidebarConfigProps {
  onGenerate: (params: KhutbahGenerationParams) => void;
  isLoading: boolean;
  onOpenCitationsExplorer: (theme: string) => void;
  quranCount: number;
  hadithCount: number;
  poetryCount: number;
  selectedCitationIds: string[];
  onUpdateCounts: (quran: number, hadith: number, poetry: number) => void;
}

const QUICK_THEMES = [
  'الصبر عند الشدائد وحسن التوكل على الله',
  'الأخوة في الله وحفظ حقوق المسلمين',
  'بر الوالدين وصلة الأرحام وفضلهما',
  'إخلاص النية وصلاح السريرة ومراقبة الله',
  'حفظ الأمانة والوفاء بالعهود في المعاملات',
  'التوبة الصادقة والرجوع إلى الله'
];

export const SidebarConfig: React.FC<SidebarConfigProps> = ({
  onGenerate,
  isLoading,
  onOpenCitationsExplorer,
  quranCount,
  hadithCount,
  poetryCount,
  selectedCitationIds,
  onUpdateCounts
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [theme, setTheme] = useState('الصبر عند الشدائد وحسن التوكل على الله');
  const [sermonType, setSermonType] = useState<SermonType>('jumuah');
  const [duration, setDuration] = useState(15);
  const [audience, setAudience] = useState('جمهور عام متنوع من المصلين والأسر');
  const [tone, setTone] = useState('موعظة ترقق القلوب وتجمع بين الرجاء والرهبة');
  
  // Model settings
  const [modelProvider, setModelProvider] = useState<'builtin' | 'gemini' | 'grok' | 'ollama'>('grok');
  const [apiKey, setApiKey] = useState('');
  const [showModelConfig, setShowModelConfig] = useState(false);

  // Sync with localStorage
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedKey = localStorage.getItem('minbar_api_key');
      const savedProv = localStorage.getItem('minbar_model_provider') as any;
      if (savedKey) setApiKey(savedKey);
      if (savedProv) setModelProvider(savedProv);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      if (apiKey) localStorage.setItem('minbar_api_key', apiKey.trim());
      localStorage.setItem('minbar_model_provider', modelProvider);
    }
    onGenerate({
      theme,
      sermon_type: sermonType,
      target_duration_minutes: duration,
      audience_profile: audience,
      tone,
      quran_count: quranCount,
      hadith_count: hadithCount,
      poetry_count: poetryCount,
      model_provider: modelProvider,
      api_key: apiKey ? apiKey.trim() : undefined,
      selected_citation_ids: selectedCitationIds.length > 0 ? selectedCitationIds : undefined
    });
  };

  return (
    <>
      {/* Toggle button when drawer is collapsed */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full border border-amber-600/40 bg-slate-900 px-5 py-3 text-xs font-bold text-amber-300 shadow-2xl backdrop-blur-md transition hover:bg-slate-800 hover:text-amber-200"
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
          <div className="flex items-center gap-2.5 text-amber-400">
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
        <form onSubmit={handleSubmit} className="flex-1 space-y-4 overflow-y-auto px-5 py-4 text-xs text-slate-300">
          {/* 1. Theme Input */}
          <div>
            <label className="mb-1.5 block font-semibold text-slate-200">موضوع أو عنوان الخطبة:</label>
            <textarea
              value={theme}
              onChange={e => setTheme(e.target.value)}
              rows={2}
              required
              className="w-full rounded-xl border border-slate-700/80 bg-slate-900/90 p-3 font-amiri text-sm leading-relaxed text-amber-100 outline-none transition focus:border-amber-500/80"
              placeholder="اكتب موضوع الخطبة أو الفكرة المراد تناولها..."
            />

            {/* Quick Themes */}
            <div className="mt-2 flex flex-wrap gap-1.5">
              {QUICK_THEMES.slice(0, 3).map((t, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setTheme(t)}
                  className="rounded-lg bg-slate-800/80 px-2 py-1 text-[11px] text-slate-300 transition hover:bg-amber-600/20 hover:text-amber-300"
                >
                  {t.substring(0, 22)}...
                </button>
              ))}
            </div>
          </div>

          {/* 2. Sermon Type */}
          <div>
            <label className="mb-1.5 block font-semibold text-slate-200">نوع الخطبة:</label>
            <select
              value={sermonType}
              onChange={e => setSermonType(e.target.value as SermonType)}
              className="w-full rounded-xl border border-slate-700/80 bg-slate-900 p-2.5 font-amiri text-sm text-slate-200 outline-none focus:border-amber-500/80"
            >
              <option value="jumuah">خطبة جمعة مسنونة (بخطبتين وجلسة استغفار)</option>
              <option value="eid_al_fitr">خطبة عيد الفطر المبارك</option>
              <option value="eid_al_adha">خطبة عيد الأضحى المبارك</option>
              <option value="janazah">موعظة جنائزية وتذكير بالآخرة</option>
              <option value="istisqa">خطبة صلاة الاستسقاء والتوبة</option>
              <option value="general_reminder">موعظة وتذكير عام في المسجد</option>
            </select>
          </div>

          {/* 3. Citations Explorer Button & Steppers */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-200">تخصيص الشواهد الشرعية:</span>
              <button
                type="button"
                onClick={() => onOpenCitationsExplorer(theme)}
                className="flex items-center gap-1 rounded-lg border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-[11px] font-bold text-amber-300 transition hover:bg-amber-500/20"
              >
                <Search className="h-3 w-3" />
                <span>مختبر واستعراض الشواهد</span>
              </button>
            </div>

            {selectedCitationIds.length > 0 && (
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 bg-emerald-950/30 p-2 rounded-lg border border-emerald-900/50">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>تم قفل ({selectedCitationIds.length}) شواهد معتمدة مسبقاً من المختبر.</span>
              </div>
            )}

            {/* Steppers */}
            <div className="flex items-center justify-between">
              <span className="text-slate-400">القرآن الكريم (رسم عثماني):</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onUpdateCounts(Math.max(1, quranCount - 1), hadithCount, poetryCount)}
                  className="h-6 w-6 rounded bg-slate-800 text-slate-200 hover:bg-slate-700"
                >-</button>
                <span className="w-5 text-center font-bold text-amber-300">{quranCount}</span>
                <button
                  type="button"
                  onClick={() => onUpdateCounts(Math.min(5, quranCount + 1), hadithCount, poetryCount)}
                  className="h-6 w-6 rounded bg-slate-800 text-slate-200 hover:bg-slate-700"
                >+</button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">الحديث النبوي (الصحاح والسنن):</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onUpdateCounts(quranCount, Math.max(1, hadithCount - 1), poetryCount)}
                  className="h-6 w-6 rounded bg-slate-800 text-slate-200 hover:bg-slate-700"
                >-</button>
                <span className="w-5 text-center font-bold text-emerald-300">{hadithCount}</span>
                <button
                  type="button"
                  onClick={() => onUpdateCounts(quranCount, Math.min(5, hadithCount + 1), poetryCount)}
                  className="h-6 w-6 rounded bg-slate-800 text-slate-200 hover:bg-slate-700"
                >+</button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">الشعر العربي والحكم البلاغية:</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onUpdateCounts(quranCount, hadithCount, Math.max(0, poetryCount - 1))}
                  className="h-6 w-6 rounded bg-slate-800 text-slate-200 hover:bg-slate-700"
                >-</button>
                <span className="w-5 text-center font-bold text-sky-300">{poetryCount}</span>
                <button
                  type="button"
                  onClick={() => onUpdateCounts(quranCount, hadithCount, Math.min(3, poetryCount + 1))}
                  className="h-6 w-6 rounded bg-slate-800 text-slate-200 hover:bg-slate-700"
                >+</button>
              </div>
            </div>
          </div>

          {/* 4. Model Connection Settings */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3.5 space-y-2.5">
            <div
              className="flex cursor-pointer items-center justify-between text-xs font-semibold text-slate-200"
              onClick={() => setShowModelConfig(!showModelConfig)}
            >
              <div className="flex items-center gap-1.5 text-amber-400">
                <Cpu className="h-3.5 w-3.5" />
                <span>نموذج الذكاء الاصطناعي:</span>
              </div>
              <span className="text-[11px] text-slate-400">
                {modelProvider === 'builtin' ? 'المولد المدمج (أوفلاين)' : modelProvider === 'grok' ? 'Grok (xAI)' : modelProvider === 'gemini' ? 'Google Gemini' : 'Ollama محلي'} {showModelConfig ? '▴' : '▾'}
              </span>
            </div>

            {showModelConfig && (
              <div className="space-y-2.5 pt-2 border-t border-slate-800">
                <select
                  value={modelProvider}
                  onChange={e => setModelProvider(e.target.value as any)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-xs text-slate-200 outline-none"
                >
                  <option value="grok">Grok (xAI) API (موصى به • فائق البلاغة والذكاء)</option>
                  <option value="gemini">Google Gemini API (سريع ومجاني)</option>
                  <option value="builtin">المولد المدمج الموثق (100% أوفلاين)</option>
                  <option value="ollama">نموذج محلي Ollama (localhost:11434)</option>
                </select>

                {(modelProvider === 'grok' || modelProvider === 'gemini') && (
                  <div>
                    <label className="mb-1 block text-[11px] text-slate-400">
                      {modelProvider === 'grok' ? 'مفتاح Grok API (xai-...):' : 'مفتاح Google Gemini API:'}
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        value={apiKey}
                        onChange={e => {
                          const val = e.target.value;
                          setApiKey(val);
                          if (val.trim().startsWith('xai-')) setModelProvider('grok');
                          else if (val.trim().startsWith('AIzaSy')) setModelProvider('gemini');
                        }}
                        placeholder={modelProvider === 'grok' ? 'xai-...' : 'AIzaSy...'}
                        className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-xs text-slate-200 outline-none"
                      />
                      <Key className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 5. Duration Slider */}
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
              <span>5 د (موجزة)</span>
              <span>المتوقع: ~{duration * 95} كلمة</span>
              <span>40 د (مطولة)</span>
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
              <span>{isLoading ? 'جارٍ التدقيق والتأصيل الشرعي...' : 'صياغة الخطبة بالذكاء الاصطناعي'}</span>
            </button>
          </div>
        </form>
      </aside>
    </>
  );
};
