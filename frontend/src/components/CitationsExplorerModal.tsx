'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Search,
  BookOpen,
  Scroll,
  Feather,
  CheckCircle,
  ShieldCheck,
  Sparkles,
  Layers
} from 'lucide-react';
import { exploreCitationsApi } from '../lib/api';

interface CitationsExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: string;
  onApplyCitations: (quranCount: number, hadithCount: number, poetryCount: number, selectedIds: string[]) => void;
}

export const CitationsExplorerModal: React.FC<CitationsExplorerModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
  onApplyCitations
}) => {
  const [searchTerm, setSearchTerm] = useState(currentTheme);
  const [activeTab, setActiveTab] = useState<'all' | 'quran' | 'hadith' | 'poetry'>('all');
  const [results, setResults] = useState<{ quran: any[]; hadith: any[]; poetry: any[] }>({
    quran: [],
    hadith: [],
    poetry: []
  });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  // Sync search term with theme when modal opens
  useEffect(() => {
    if (isOpen) {
      setSearchTerm(currentTheme);
      performSearch(currentTheme);
    }
  }, [isOpen, currentTheme]);

  const performSearch = async (query: string) => {
    if (!query || query.trim().length === 0) return;
    setIsLoading(true);
    try {
      const data = await exploreCitationsApi(query.trim());
      setResults({
        quran: data.quran || [],
        hadith: data.hadith || [],
        poetry: data.poetry || []
      });
      // Pre-select the top matched citations
      const initialSelected = new Set<string>();
      (data.quran || []).slice(0, 2).forEach((q: any) => initialSelected.add(`q_${q.surah_number}_${q.ayah_number}`));
      (data.hadith || []).slice(0, 2).forEach((h: any) => initialSelected.add(`h_${h.hadith_number}`));
      (data.poetry || []).slice(0, 1).forEach((p: any) => initialSelected.add(`p_${p.canonical_hash}`));
      setSelectedIds(initialSelected);
    } catch (err) {
      console.error('Failed to load citations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const toggleSelect = (id: string) => {
    const updated = new Set(selectedIds);
    if (updated.has(id)) {
      updated.delete(id);
    } else {
      updated.add(id);
    }
    setSelectedIds(updated);
  };

  // Count by category
  const selectedQuranCount = results.quran.filter(q => selectedIds.has(`q_${q.surah_number}_${q.ayah_number}`)).length;
  const selectedHadithCount = results.hadith.filter(h => selectedIds.has(`h_${h.hadith_number}`)).length;
  const selectedPoetryCount = results.poetry.filter(p => selectedIds.has(`p_${p.canonical_hash}`)).length;

  const handleApply = () => {
    onApplyCitations(
      Math.max(1, selectedQuranCount || 2),
      Math.max(1, selectedHadithCount || 2),
      selectedPoetryCount,
      Array.from(selectedIds)
    );
    onClose();
  };

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md"
    >
      <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl border border-slate-700/80 bg-slate-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
              <Scroll className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-amiri text-xl font-bold text-amber-200">
                مُخْتَبَر واستعراض الشواهد الشرعية
              </h2>
              <p className="text-xs text-slate-400">
                فحص ومعاينة وتحديد الآيات والأحاديث الصحيحة المطابقة لموضوع الخطبة قبل التوليد
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="border-b border-slate-800/80 bg-slate-900/60 p-5 space-y-4">
          <form
            onSubmit={e => {
              e.preventDefault();
              performSearch(searchTerm);
            }}
            className="flex gap-2"
          >
            <div className="relative flex-1">
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="ابحث بموضوع الخطبة (مثل: الصبر، بر الوالدين، الأمانة، التوبة...)"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 pr-10 font-amiri text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-amber-500"
              />
              <Search className="absolute right-3.5 top-3 h-4 w-4 text-slate-400" />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-1.5 rounded-xl bg-amber-600 px-5 py-2.5 font-amiri text-sm font-bold text-white transition hover:bg-amber-500 disabled:opacity-50"
            >
              {isLoading ? 'جارٍ البحث...' : 'فحص الشواهد'}
            </button>
          </form>

          {/* Category Tabs */}
          <div className="flex gap-2 border-b border-slate-800 pb-1 text-xs">
            <button
              onClick={() => setActiveTab('all')}
              className={`rounded-lg px-3 py-1.5 font-medium transition ${
                activeTab === 'all'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              جميع الشواهد ({results.quran.length + results.hadith.length + results.poetry.length})
            </button>
            <button
              onClick={() => setActiveTab('quran')}
              className={`flex items-center gap-1 rounded-lg px-3 py-1.5 font-medium transition ${
                activeTab === 'quran'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>القرآن الكريم ({results.quran.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('hadith')}
              className={`flex items-center gap-1 rounded-lg px-3 py-1.5 font-medium transition ${
                activeTab === 'hadith'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Scroll className="h-3.5 w-3.5" />
              <span>الحديث الصحيح ({results.hadith.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('poetry')}
              className={`flex items-center gap-1 rounded-lg px-3 py-1.5 font-medium transition ${
                activeTab === 'poetry'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Feather className="h-3.5 w-3.5" />
              <span>الشعر والحكم ({results.poetry.length})</span>
            </button>
          </div>
        </div>

        {/* Results List */}
        <div className="flex-1 space-y-4 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex h-48 flex-col items-center justify-center text-slate-400">
              <Sparkles className="h-8 w-8 animate-spin text-amber-500" />
              <p className="mt-3 text-xs">جارٍ استرجاع الشواهد الموثقة من كتب أهل السنة والجماعة...</p>
            </div>
          ) : results.quran.length === 0 && results.hadith.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center text-slate-500">
              <p className="text-sm">لم يتم العثور على شواهد مباشرة. جرّب كلمة بحث أعم كـ «الصبر» أو «التقوى» أو «الأخوة».</p>
            </div>
          ) : (
            <>
              {/* Quran Section */}
              {(activeTab === 'all' || activeTab === 'quran') && results.quran.length > 0 && (
                <div className="space-y-3">
                  <h3 className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                    <BookOpen className="h-4 w-4" />
                    <span>آيات القرآن الكريم (بالرسم العثماني المشكول):</span>
                  </h3>
                  {results.quran.map((q, idx) => {
                    const id = `q_${q.surah_number}_${q.ayah_number}`;
                    const isSelected = selectedIds.has(id);
                    return (
                      <div
                        key={idx}
                        onClick={() => toggleSelect(id)}
                        className={`cursor-pointer rounded-xl border p-4 transition ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-950/20 shadow-lg shadow-emerald-950/30'
                            : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelect(id)}
                              className="h-4 w-4 rounded accent-emerald-500"
                            />
                            <span className="font-amiri text-sm font-bold text-emerald-300">
                              سورة {q.surah_name_ar} [الآية: {q.ayah_number}]
                            </span>
                          </div>
                          <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                            قطعي الثبوت • رسم عثماني
                          </span>
                        </div>
                        <p className="mt-3 font-amiri text-base leading-relaxed text-slate-100">
                          «{q.text_uthmani}»
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Hadith Section */}
              {(activeTab === 'all' || activeTab === 'hadith') && results.hadith.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h3 className="flex items-center gap-2 text-xs font-bold text-amber-400">
                    <Scroll className="h-4 w-4" />
                    <span>أحاديث السنة النبوية المطهرة (مخرجة من الصحاح والسنن):</span>
                  </h3>
                  {results.hadith.map((h, idx) => {
                    const id = `h_${h.hadith_number}`;
                    const isSelected = selectedIds.has(id);
                    return (
                      <div
                        key={idx}
                        onClick={() => toggleSelect(id)}
                        className={`cursor-pointer rounded-xl border p-4 transition ${
                          isSelected
                            ? 'border-amber-500 bg-amber-950/20 shadow-lg shadow-amber-950/30'
                            : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelect(id)}
                              className="h-4 w-4 rounded accent-amber-500"
                            />
                            <span className="font-amiri text-sm font-bold text-amber-300">
                              {h.collection} (#{h.hadith_number})
                            </span>
                          </div>
                          <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
                            {h.grading} ({h.graded_by})
                          </span>
                        </div>
                        <p className="mt-3 font-amiri text-sm leading-relaxed text-slate-200">
                          {h.narrator_companion ? `عن ${h.narrator_companion} قال: ` : ''}
                          «{h.matn_ar}»
                        </p>
                        {h.takhrij_notes && (
                          <p className="mt-2 text-[11px] text-slate-400">
                            ◂ التخريج: {h.takhrij_notes}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Poetry Section */}
              {(activeTab === 'all' || activeTab === 'poetry') && results.poetry.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h3 className="flex items-center gap-2 text-xs font-bold text-sky-400">
                    <Feather className="h-4 w-4" />
                    <span>شواهد الشعر العربي والحكمة البلاغية:</span>
                  </h3>
                  {results.poetry.map((p, idx) => {
                    const id = `p_${p.canonical_hash}`;
                    const isSelected = selectedIds.has(id);
                    return (
                      <div
                        key={idx}
                        onClick={() => toggleSelect(id)}
                        className={`cursor-pointer rounded-xl border p-4 transition ${
                          isSelected
                            ? 'border-sky-500 bg-sky-950/20 shadow-lg shadow-sky-950/30'
                            : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelect(id)}
                              className="h-4 w-4 rounded accent-sky-500"
                            />
                            <span className="font-amiri text-sm font-bold text-sky-300">
                              {p.poet_name_ar} {p.bahr ? `(بحر ${p.bahr})` : ''}
                            </span>
                          </div>
                          <span className="rounded bg-sky-500/20 px-2 py-0.5 text-[10px] font-semibold text-sky-300">
                            {p.theme}
                          </span>
                        </div>
                        <p className="mt-3 font-amiri text-base leading-relaxed text-slate-100">
                          «{p.bayt_ar}»
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Summary & Action Bar */}
        <div className="flex items-center justify-between border-t border-slate-800 bg-slate-950/80 px-6 py-4">
          <div className="flex items-center gap-4 text-xs">
            <span className="text-slate-400">المحدد للإدراج بالخطبة:</span>
            <span className="font-semibold text-emerald-400">{selectedQuranCount} آيات</span>
            <span className="text-slate-600">•</span>
            <span className="font-semibold text-amber-400">{selectedHadithCount} أحاديث</span>
            <span className="text-slate-600">•</span>
            <span className="font-semibold text-sky-400">{selectedPoetryCount} أشعار</span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-800"
            >
              إلغاء
            </button>
            <button
              onClick={handleApply}
              className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-5 py-2 text-xs font-bold text-slate-950 shadow-lg shadow-amber-500/20 transition hover:bg-amber-400"
            >
              <CheckCircle className="h-4 w-4" />
              <span>اعتماد وتخصيص الخطبة ({selectedIds.size} شاهد)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
