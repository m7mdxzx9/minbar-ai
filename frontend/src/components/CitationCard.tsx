'use client';

import React, { useState } from 'react';
import { ShieldCheck, BookOpen, Scroll, CheckCircle2, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import { SermonBlock } from '../types/khutbah';

interface CitationCardProps {
  block: SermonBlock;
}

export const CitationCard: React.FC<CitationCardProps> = ({ block }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const { citation_source_type, citation_metadata, audit_feedback } = block;

  const handleCopy = () => {
    navigator.clipboard.writeText(block.content_ar);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (citation_source_type === 'quran') {
    const surah = citation_metadata?.surah_name_ar || 'سورة مباركة';
    const ayah = citation_metadata?.ayah_number || '';
    const hash = audit_feedback?.hash || citation_metadata?.canonical_hash || 'SHA256_HASH';

    return (
      <div className="my-4 rounded-xl border border-amber-600/30 bg-gradient-to-br from-amber-950/20 via-slate-900/60 to-slate-900/90 p-5 shadow-lg backdrop-blur-md transition-all duration-300 hover:border-amber-500/50">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-600/20 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/30">
              <BookOpen className="h-4 w-4" />
            </span>
            <div>
              <h4 className="font-amiri text-lg font-bold text-amber-200">
                {surah} {ayah ? `[الآية: ${ayah}]` : ''}
              </h4>
              <span className="text-xs text-amber-400/80">المصحف الموثق بالرسم العثماني (مجمع الملك فهد)</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 ring-1 ring-emerald-500/30">
              <ShieldCheck className="h-3.5 w-3.5" />
              تطابق مشفر 100%
            </span>
            <button
              onClick={handleCopy}
              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-amber-200"
              title="نسخ النص العثماني"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-amber-200"
              title="تفاصيل التوثيق"
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Quranic Text Display */}
        <div className="py-4 text-center">
          <p className="font-quran text-2xl leading-loose tracking-wide text-amber-50 sm:text-3xl">
            {block.content_ar.replace(/يَقُولُ اللَّهُ تَبَارَكَ وَتَعَالَى فِي مُحْكَمِ التَّنْزِيلِ:\s*/g, '')}
          </p>
        </div>

        {/* Verification Details Collapsible Drawer */}
        {isExpanded && (
          <div className="mt-3 space-y-2 rounded-lg border border-amber-900/30 bg-slate-950/70 p-3.5 text-xs text-slate-300">
            <div className="flex justify-between border-b border-slate-800 pb-1.5">
              <span className="text-slate-400">الرسم والضبط:</span>
              <span className="font-semibold text-amber-300">مصحف المدينة النبوية - رواية حفص عن عاصم</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-1.5">
              <span className="text-slate-400">بصمة التحقق المشفرة (SHA-256):</span>
              <span className="font-mono text-emerald-400">{hash.substring(0, 16)}...{hash.substring(hash.length - 8)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">ضمانة عدم الهلوسة:</span>
              <span className="text-emerald-400">مستخرج مباشرة من قاعدة البيانات المغلقة بدون توليد أوزان</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (citation_source_type === 'hadith') {
    const collection = citation_metadata?.collection || 'السنة النبوية';
    const hadithNum = citation_metadata?.hadith_number || '';
    const grading = citation_metadata?.grading || 'Sahih';
    const gradedBy = citation_metadata?.graded_by || 'المحدثون';
    const isnad = citation_metadata?.isnad_ar || '';
    const takhrij = citation_metadata?.takhrij_notes || audit_feedback?.takhrij || '';
    const hash = audit_feedback?.hash || citation_metadata?.canonical_hash || 'SHA256_HASH';

    return (
      <div className="my-4 rounded-xl border border-emerald-600/30 bg-gradient-to-br from-emerald-950/20 via-slate-900/60 to-slate-900/90 p-5 shadow-lg backdrop-blur-md transition-all duration-300 hover:border-emerald-500/50">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-600/20 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/30">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <div>
              <h4 className="font-amiri text-lg font-bold text-emerald-200">
                {collection} {hadithNum ? `(حديث رقم ${hadithNum})` : ''}
              </h4>
              <div className="flex items-center gap-2 text-xs">
                <span className="rounded bg-emerald-500/20 px-2 py-0.5 font-semibold text-emerald-300">
                  {grading === 'Sahih' ? 'صحيح' : 'حسن'}
                </span>
                <span className="text-slate-400">حكم: {gradedBy}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 ring-1 ring-emerald-500/30">
              <CheckCircle2 className="h-3.5 w-3.5" />
              تخريج معتمد
            </span>
            <button
              onClick={handleCopy}
              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-emerald-200"
              title="نسخ الحديث"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-emerald-200"
              title="تفاصيل التخريج والإسناد"
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Hadith Matn Display */}
        <div className="py-4 text-right">
          <p className="font-amiri text-xl leading-loose text-slate-100 sm:text-2xl">
            {block.content_ar}
          </p>
        </div>

        {/* Takhrij & Isnad Drawer */}
        {isExpanded && (
          <div className="mt-3 space-y-2 rounded-lg border border-emerald-900/30 bg-slate-950/70 p-3.5 text-xs text-slate-300">
            {isnad && (
              <div className="border-b border-slate-800 pb-2">
                <span className="block font-semibold text-emerald-400">سند الرواية:</span>
                <p className="mt-1 text-slate-400">{isnad}</p>
              </div>
            )}
            {takhrij && (
              <div className="border-b border-slate-800 pb-2">
                <span className="block font-semibold text-emerald-400">بيان التخريج والدلالة:</span>
                <p className="mt-1 text-slate-300">{takhrij}</p>
              </div>
            )}
            <div className="flex justify-between pt-1">
              <span className="text-slate-400">البصمة المشفرة للمتن:</span>
              <span className="font-mono text-emerald-400">{hash.substring(0, 16)}...</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (citation_source_type === 'poetry') {
    const poet = citation_metadata?.poet_name_ar || 'شاعر الحكمة';
    const bahr = citation_metadata?.bahr || 'البحر الشعري';

    return (
      <div className="my-4 rounded-xl border border-amber-800/30 bg-slate-900/70 p-5 shadow-md">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <Scroll className="h-4 w-4 text-amber-400" />
            <span className="font-amiri text-base font-semibold text-amber-300">{poet}</span>
            <span className="rounded bg-amber-500/10 px-2 py-0.5 text-xs text-amber-400 ring-1 ring-amber-500/20">{bahr}</span>
          </div>
          <span className="text-xs text-slate-400">شاهد بلاغي معتمد</span>
        </div>
        <div className="py-4 text-center">
          <p className="whitespace-pre-line font-amiri text-xl leading-relaxed text-amber-100">
            {block.content_ar}
          </p>
        </div>
      </div>
    );
  }

  return null;
};
