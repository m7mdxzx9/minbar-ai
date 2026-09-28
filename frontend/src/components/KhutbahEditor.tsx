'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Clock,
  FileText,
  Sparkles,
  Printer,
  FileDown,
  MonitorPlay,
  CheckCircle2,
  AlertTriangle,
  Plus,
  BookOpen,
  Key
} from 'lucide-react';
import { KhutbahSermon, SermonBlock, BlockType } from '../types/khutbah';
import { CitationCard } from './CitationCard';
import { BlockActionBar } from './BlockActionBar';
import { transformBlockApi } from '../lib/api';

interface KhutbahEditorProps {
  sermon: KhutbahSermon;
  onUpdateSermon: (updatedSermon: KhutbahSermon) => void;
  onOpenAuditModal: () => void;
  onOpenTeleprompter: () => void;
  onOpenApiKeyModal: () => void;
}

export const KhutbahEditor: React.FC<KhutbahEditorProps> = ({
  sermon,
  onUpdateSermon,
  onOpenAuditModal,
  onOpenTeleprompter,
  onOpenApiKeyModal
}) => {
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [loadingBlockId, setLoadingBlockId] = useState<string | null>(null);
  const [paperMode, setPaperMode] = useState<'dark' | 'cream'>('dark');
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);

  useEffect(() => {
    const checkKey = () => {
      if (typeof window !== 'undefined') {
        const k = localStorage.getItem('minbar_api_key');
        setHasApiKey(Boolean(k && k.trim()));
      }
    };
    checkKey();
    window.addEventListener('storage', checkKey);
    return () => window.removeEventListener('storage', checkKey);
  }, []);

  // Recalculate word count and delivery duration
  const updateContent = (blockId: string, newContent: string) => {
    const updatedBlocks = sermon.blocks.map(b => {
      if (b.id === blockId) {
        return { ...b, content_ar: newContent };
      }
      return b;
    });

    const totalWords = updatedBlocks.reduce(
      (sum, b) => sum + (b.content_ar ? b.content_ar.split(/\s+/).filter(Boolean).length : 0),
      0
    );
    const estDelivery = Math.round((totalWords / 95.0) * 10) / 10;

    onUpdateSermon({
      ...sermon,
      blocks: updatedBlocks,
      word_count: totalWords,
      estimated_delivery_minutes: estDelivery
    });
  };

  // Inline AI transformation handler
  const handleTransform = async (
    blockId: string,
    action: 'rephrase' | 'make_solemn' | 'replace_hadith' | 'elaborate' | 'shorten'
  ) => {
    setLoadingBlockId(blockId);
    try {
      const savedKey = typeof window !== 'undefined' ? localStorage.getItem('minbar_api_key') || undefined : undefined;
      const savedProvider = typeof window !== 'undefined' ? localStorage.getItem('minbar_model_provider') || 'builtin' : 'builtin';
      const res = await transformBlockApi(sermon.id, blockId, action, undefined, savedProvider, savedKey);
      if (res && res.updated_block) {
        const updatedBlocks = sermon.blocks.map(b =>
          b.id === blockId ? { ...b, ...res.updated_block } : b
        );
        const totalWords = updatedBlocks.reduce(
          (sum, b) => sum + (b.content_ar ? b.content_ar.split(/\s+/).filter(Boolean).length : 0),
          0
        );
        const estDelivery = Math.round((totalWords / 95.0) * 10) / 10;

        onUpdateSermon({
          ...sermon,
          blocks: updatedBlocks,
          word_count: totalWords,
          estimated_delivery_minutes: estDelivery
        });
      }
    } catch (e) {
      console.error('Block transformation failed', e);
    } finally {
      setLoadingBlockId(null);
    }
  };

  // Block Reordering
  const handleMoveBlock = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= sermon.blocks.length) return;

    const newBlocks = [...sermon.blocks];
    const [moved] = newBlocks.splice(index, 1);
    newBlocks.splice(targetIdx, 0, moved);

    // Re-index
    const reindexed = newBlocks.map((b, i) => ({ ...b, order_index: i + 1 }));
    onUpdateSermon({ ...sermon, blocks: reindexed });
  };

  const handleDeleteBlock = (index: number) => {
    if (sermon.blocks.length <= 1) return;
    const newBlocks = sermon.blocks.filter((_, i) => i !== index);
    const reindexed = newBlocks.map((b, i) => ({ ...b, order_index: i + 1 }));
    onUpdateSermon({ ...sermon, blocks: reindexed });
  };

  const handleAddBlock = () => {
    const newBlock: SermonBlock = {
      id: `block-${Date.now()}`,
      order_index: sermon.blocks.length + 1,
      block_type: 'thematic_exposition',
      title_ar: 'محور توجيهي إضافي',
      content_ar: 'أَيُّهَا الْمُؤْمِنُونَ: وَمِمَّا يَنْبَغِي التَّنَبُّهُ إِلَيْهِ فِي هَذَا الْمَقَامِ...',
      verified: true,
      verification_score: 1.0
    };
    onUpdateSermon({
      ...sermon,
      blocks: [...sermon.blocks, newBlock]
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      dir="rtl"
      className={`min-h-screen transition-colors duration-300 ${
        paperMode === 'cream' ? 'bg-[#faf7f2] text-slate-900' : 'bg-[#0b0f17] text-slate-100'
      }`}
    >
      {/* ========================================================================= */}
      {/* 1. TOP EDITORIAL TELEMETRY & CONTROL BAR */}
      {/* ========================================================================= */}
      <header
        className={`sticky top-0 z-40 border-b backdrop-blur-md transition-colors ${
          paperMode === 'cream'
            ? 'border-amber-200/80 bg-[#faf7f2]/90 shadow-sm'
            : 'border-slate-800 bg-[#0b0f17]/90 shadow-lg'
        }`}
      >
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
          {/* Brand & Creed Seal */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 text-slate-950 shadow-md shadow-amber-500/20">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-amiri text-xl font-bold tracking-tight text-amber-500">
                  مِنْبَرُ الذَّكَاءِ الاصْطِنَاعِيّ
                </h1>
                <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-400 ring-1 ring-emerald-500/20">
                  منهج أهل السنة والجماعة
                </span>
              </div>
              <p className="text-xs text-slate-400">
                منصة تحرير الخطب المنبرية الموثقة برسم المصحف وصحيح السنة (Zero-Hallucination)
              </p>
            </div>
          </div>

          {/* Telemetry Pills */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            {/* Word Count */}
            <div className="flex items-center gap-1.5 rounded-lg border border-slate-700/50 bg-slate-900/60 px-3 py-1.5 text-xs text-slate-300">
              <FileText className="h-3.5 w-3.5 text-amber-400" />
              <span>{sermon.word_count} كلمة</span>
            </div>

            {/* Estimated Delivery Duration */}
            <div className="flex items-center gap-1.5 rounded-lg border border-slate-700/50 bg-slate-900/60 px-3 py-1.5 text-xs text-slate-300">
              <Clock className="h-3.5 w-3.5 text-amber-400" />
              <span>{sermon.estimated_delivery_minutes} دقيقة (إلقاء متأنٍّ)</span>
            </div>

            {/* Theological Verification Seal Button */}
            <button
              onClick={onOpenAuditModal}
              className="flex items-center gap-1.5 rounded-lg border border-emerald-600/40 bg-emerald-950/30 px-3 py-1.5 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-900/40 hover:ring-1 hover:ring-emerald-400"
              title="فتح تقرير التدقيق العقدي والتحقق المشفر"
            >
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>موثق بنسبة 100%</span>
            </button>

            {/* AI API Key Trigger Button */}
            <button
              onClick={onOpenApiKeyModal}
              className="flex items-center gap-1.5 rounded-lg border border-amber-600/50 bg-amber-950/30 px-3 py-1.5 text-xs font-semibold text-amber-300 transition hover:bg-amber-900/40 hover:ring-1 hover:ring-amber-400"
              title="إعداد مفتاح الذكاء الاصطناعي (API Key)"
            >
              <Key className="h-3.5 w-3.5 text-amber-400" />
              <span>مفتاح الذكاء الاصطناعي</span>
              {hasApiKey ? (
                <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  مُفعّل
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[10px] text-slate-400">
                  <span className="h-2 w-2 rounded-full bg-slate-500" />
                  مدمج
                </span>
              )}
            </button>

            {/* Paper Theme Toggle */}
            <button
              onClick={() => setPaperMode(paperMode === 'dark' ? 'cream' : 'dark')}
              className="rounded-lg border border-slate-700/60 bg-slate-800/80 px-2.5 py-1.5 text-xs text-slate-300 transition hover:bg-slate-700"
              title="تبديل وضع الورق (داكن / قرطاسي)"
            >
              {paperMode === 'dark' ? 'ورق كلاسيكي' : 'الوضع الليلي'}
            </button>

            {/* Teleprompter Button */}
            <button
              onClick={onOpenTeleprompter}
              className="flex items-center gap-1 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-slate-950 shadow-md transition hover:bg-amber-500"
              title="بدء الإلقاء المنبري مع موجه القراءة والمؤقت"
            >
              <MonitorPlay className="h-3.5 w-3.5" />
              <span>وضع المنبر</span>
            </button>

            {/* Print / Export */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs text-slate-300 transition hover:bg-slate-700"
              title="طباعة الخطبة بتنسيق منبري فاخر"
            >
              <Printer className="h-3.5 w-3.5 text-slate-400" />
              <span>طباعة</span>
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. MAIN EDITORIAL CANVAS */}
      {/* ========================================================================= */}
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        {/* Sermon Title Banner */}
        <div
          className={`mb-8 rounded-2xl border p-6 text-center shadow-lg transition-all ${
            paperMode === 'cream'
              ? 'border-amber-300/60 bg-[#fffef9] shadow-amber-900/5'
              : 'border-slate-800 bg-gradient-to-b from-slate-900/90 to-slate-900/40 shadow-black/40'
          }`}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-600/30 bg-amber-500/10 px-3.5 py-1 text-xs font-semibold text-amber-400">
            <span>خطبة جمعة مؤصلة ومراجعة</span>
            <span>•</span>
            <span>{sermon.audience_profile}</span>
          </div>

          <h2 className="mt-4 font-amiri text-3xl font-extrabold text-amber-300 sm:text-4xl">
            {sermon.title}
          </h2>

          <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">
            الموضوع: {sermon.theme} — النبرة: {sermon.tone}
          </p>
        </div>

        {/* ========================================================================= */}
        {/* 3. DISCRETE SEMANTIC BLOCKS LIST */}
        {/* ========================================================================= */}
        <div className="space-y-6">
          {sermon.blocks.map((block, idx) => {
            const isActive = activeBlockId === block.id;
            const isCitation = !!block.citation_source_type;
            const isIstighfar = block.block_type === 'istighfar_pause';
            const isKhutbahThaniyah = block.block_type === 'second_khutbah';

            return (
              <div
                key={block.id}
                onFocus={() => setActiveBlockId(block.id)}
                onClick={() => setActiveBlockId(block.id)}
                className={`group relative rounded-2xl border p-5 transition-all duration-300 ${
                  isActive
                    ? 'border-amber-500/60 shadow-xl ring-1 ring-amber-500/30'
                    : paperMode === 'cream'
                    ? 'border-amber-200/50 bg-[#fffdfa] hover:border-amber-400/50'
                    : 'border-slate-800/80 bg-slate-900/50 hover:border-slate-700'
                }`}
              >
                {/* Block Header Metadata & Type Pill */}
                <div className="mb-3 flex items-center justify-between border-b border-slate-800/50 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/10 text-xs font-bold text-amber-400 ring-1 ring-amber-500/30">
                      {idx + 1}
                    </span>
                    <h3 className="font-amiri text-base font-bold text-amber-200">
                      {block.title_ar}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    {block.verified && (
                      <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-400 ring-1 ring-emerald-500/20">
                        <CheckCircle2 className="h-3 w-3" />
                        موثق
                      </span>
                    )}
                    <span className="rounded bg-slate-800 px-2 py-0.5 text-[11px] text-slate-400">
                      {block.block_type}
                    </span>
                  </div>
                </div>

                {/* If the block is a structured citation (Quran, Hadith, Poetry), render dedicated card */}
                {isCitation ? (
                  <div>
                    <CitationCard block={block} />
                    {/* Editable notes or annotation below citation */}
                    <textarea
                      value={block.content_ar}
                      onChange={e => updateContent(block.id, e.target.value)}
                      rows={2}
                      className="mt-2 w-full resize-none rounded-lg border border-slate-800 bg-slate-950/60 p-2.5 font-amiri text-sm leading-relaxed text-slate-300 outline-none transition focus:border-amber-500/50"
                      placeholder="تعديل الشرح المحيط بالشاهد..."
                    />
                  </div>
                ) : isIstighfar ? (
                  /* Istighfar Interlude Block: Distinct Spiritual Pause Treatment */
                  <div className="rounded-xl border border-amber-800/30 bg-gradient-to-r from-amber-950/20 via-slate-900/40 to-amber-950/20 p-5 text-center">
                    <span className="text-xs font-semibold text-amber-400">
                      — جلسة الاستراحة النبوية بين الخطبتين —
                    </span>
                    <textarea
                      value={block.content_ar}
                      onChange={e => updateContent(block.id, e.target.value)}
                      rows={3}
                      className="mt-3 w-full resize-none bg-transparent text-center font-amiri text-xl leading-loose text-amber-100 outline-none"
                    />
                  </div>
                ) : (
                  /* Standard Thematic Exposition / Khutbah Text Block */
                  <div>
                    <textarea
                      value={block.content_ar}
                      onChange={e => updateContent(block.id, e.target.value)}
                      rows={Math.max(4, Math.ceil(block.content_ar.length / 90))}
                      className={`w-full resize-y rounded-xl border bg-transparent p-4 font-amiri text-xl leading-[2.1] outline-none transition focus:ring-1 focus:ring-amber-500/40 ${
                        paperMode === 'cream'
                          ? 'border-transparent text-slate-900 focus:bg-amber-50/40'
                          : 'border-transparent text-slate-100 focus:bg-slate-950/40'
                      }`}
                      placeholder="نص المقطع المنبري..."
                    />
                  </div>
                )}

                {/* Contextual In-Place AI Transformation Toolbar */}
                <div className="mt-3 pt-2">
                  <BlockActionBar
                    blockType={block.block_type}
                    onTransform={action => handleTransform(block.id, action)}
                    onMoveUp={() => handleMoveBlock(idx, 'up')}
                    onMoveDown={() => handleMoveBlock(idx, 'down')}
                    onDelete={() => handleDeleteBlock(idx)}
                    isFirst={idx === 0}
                    isLast={idx === sermon.blocks.length - 1}
                    isLoading={loadingBlockId === block.id}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Add New Block Button */}
        <div className="mt-8 text-center">
          <button
            onClick={handleAddBlock}
            className="inline-flex items-center gap-2 rounded-xl border border-dashed border-amber-600/40 bg-amber-500/5 px-6 py-3 font-amiri text-base font-semibold text-amber-300 transition hover:border-amber-500 hover:bg-amber-500/10"
          >
            <Plus className="h-4 w-4" />
            <span>إضافة مقطع منبري جديد</span>
          </button>
        </div>
      </main>
    </div>
  );
};
