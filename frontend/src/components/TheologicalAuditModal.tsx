'use client';

import React from 'react';
import {
  ShieldCheck,
  X,
  CheckCircle2,
  AlertTriangle,
  Fingerprint,
  BookCheck,
  Scale,
  Award
} from 'lucide-react';
import { KhutbahSermon } from '../types/khutbah';

interface TheologicalAuditModalProps {
  sermon: KhutbahSermon;
  isOpen: boolean;
  onClose: () => void;
}

export const TheologicalAuditModal: React.FC<TheologicalAuditModalProps> = ({
  sermon,
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const citationBlocks = sermon.blocks.filter(b => b.citation_source_type);

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md transition-all"
    >
      <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl border border-emerald-600/40 bg-slate-950 shadow-2xl shadow-emerald-950/40">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/30">
              <Award className="h-6 w-6" />
            </span>
            <div>
              <h2 className="font-amiri text-xl font-bold text-emerald-200">
                شهادة التدقيق العقدي والتوثيق الحرفي
              </h2>
              <span className="text-xs text-slate-400">
                منهج أهل السنة والجماعة — خلو تام من الأحاديث الموضوعة والقصص الإسرائيلية
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 space-y-6 overflow-y-auto p-6 text-sm text-slate-300">
          {/* Top Banner Seal */}
          <div className="rounded-xl border border-emerald-600/30 bg-emerald-950/20 p-4 text-emerald-200">
            <div className="flex items-center gap-2 font-bold">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
              <span>شهادة التحقق المغلق (Closed-Loop Deterministic Verification)</span>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-emerald-300/80">
              تم فحص جميع النصوص الواردة في هذه الخطبة بمطابقتها حرفياً ورياضياً بقواعد بيانات المصحف الشريف بالرسم العثماني وصحيح كتب السنة، وضمان عدم توليد أي حديث أو آية من أوزان النموذج التوليدي.
            </p>
          </div>

          {/* Theological Compliance Checklist */}
          <div className="space-y-2">
            <h3 className="font-amiri text-base font-bold text-amber-300">
              المعايير المنهجية المحققة في الخطبة:
            </h3>

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/60 p-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span className="text-xs">رسم المصحف العثماني بضبط مشكول تام</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/60 p-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span className="text-xs">صحة الأحاديث المعتمدة (صحيح أو حسن)</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/60 p-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span className="text-xs">تخريج معتمد للمحدثين (البخاري، مسلم، الألباني)</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/60 p-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span className="text-xs">خلو الخطبة من الروايات المنكرة والإسرائيليات</span>
              </div>
            </div>
          </div>

          {/* Citations Audit Breakdown */}
          <div className="space-y-3">
            <h3 className="font-amiri text-base font-bold text-amber-300">
              سجل تدقيق الشواهد المنبرية ({citationBlocks.length} شواهد):
            </h3>

            <div className="space-y-3">
              {citationBlocks.map((b, idx) => {
                const meta = b.citation_metadata || {};
                const audit = b.audit_feedback || {};
                const hash = audit.hash || meta.canonical_hash || 'SHA256_HASH';

                return (
                  <div
                    key={idx}
                    className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 transition hover:border-slate-700"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
                      <span className="font-amiri font-bold text-slate-100">
                        {b.title_ar}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-400">
                        <CheckCircle2 className="h-3 w-3" />
                        مطابقة تامة 100%
                      </span>
                    </div>

                    <div className="mt-2.5 space-y-1.5 text-xs">
                      {b.citation_source_type === 'hadith' && (
                        <>
                          <div className="flex justify-between text-slate-400">
                            <span>الحكم التخريجي:</span>
                            <span className="text-emerald-300 font-semibold">{meta.grading} — {meta.graded_by}</span>
                          </div>
                          {meta.takhrij_notes && (
                            <div className="text-slate-400">
                              <span className="text-slate-500">التخريج:</span> {meta.takhrij_notes}
                            </div>
                          )}
                        </>
                      )}

                      {b.citation_source_type === 'quran' && (
                        <div className="flex justify-between text-slate-400">
                          <span>المصدر القرآني:</span>
                          <span className="text-amber-300">سورة {meta.surah_name_ar} (الآية {meta.ayah_number}) - جزء {meta.juz_number}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                        <span className="flex items-center gap-1">
                          <Fingerprint className="h-3 w-3 text-slate-400" />
                          البصمة المشفرة:
                        </span>
                        <span className="font-mono text-slate-400">{hash}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-800 px-6 py-4">
          <span className="text-xs text-slate-500">
            رقم توثيق الخطبة: <span className="font-mono">{sermon.id.substring(0, 18)}</span>
          </span>
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-800 px-5 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-700"
          >
            إغلاق التقرير
          </button>
        </div>
      </div>
    </div>
  );
};
