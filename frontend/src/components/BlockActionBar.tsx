'use client';

import React from 'react';
import { Flame, RefreshCw, Maximize2, Minimize2, ArrowUp, ArrowDown, Trash2, Sparkles } from 'lucide-react';
import { BlockType } from '../types/khutbah';

interface BlockActionBarProps {
  blockType: BlockType;
  onTransform: (action: 'rephrase' | 'make_solemn' | 'replace_hadith' | 'elaborate' | 'shorten') => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onDelete?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
  isLoading?: boolean;
}

export const BlockActionBar: React.FC<BlockActionBarProps> = ({
  blockType,
  onTransform,
  onMoveUp,
  onMoveDown,
  onDelete,
  isFirst,
  isLast,
  isLoading
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-700/60 bg-slate-900/90 px-3 py-2 text-xs shadow-md backdrop-blur-md transition-all">
      <div className="flex items-center gap-1.5 text-amber-400">
        <Sparkles className="h-3.5 w-3.5" />
        <span className="font-medium text-slate-300">أدوات الذكاء الاصطناعي والصياغة:</span>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {/* Action 0: Rephrase with eloquence */}
        <button
          onClick={() => onTransform('rephrase')}
          disabled={isLoading}
          className="flex items-center gap-1 rounded bg-slate-800 px-2.5 py-1 text-slate-200 transition hover:bg-purple-600/20 hover:text-purple-300 disabled:opacity-50"
          title="إعادة صياغة بأفصح عبارة وأرقى بيان عربي رصين"
        >
          <Sparkles className="h-3.5 w-3.5 text-purple-400" />
          <span>إعادة صياغة بليغة</span>
        </button>

        {/* Action 1: Make Solemn */}
        <button
          onClick={() => onTransform('make_solemn')}
          disabled={isLoading}
          className="flex items-center gap-1 rounded bg-slate-800 px-2.5 py-1 text-slate-200 transition hover:bg-amber-600/20 hover:text-amber-300 disabled:opacity-50"
          title="ترقيق القلوب وتغليظ الموعظة بالتذكير بالآخرة"
        >
          <Flame className="h-3.5 w-3.5 text-amber-400" />
          <span>تغليظ الموعظة</span>
        </button>

        {/* Action 2: Replace Hadith (available on citations or expositions) */}
        {(blockType === 'hadith_citation' || blockType === 'thematic_exposition') && (
          <button
            onClick={() => onTransform('replace_hadith')}
            disabled={isLoading}
            className="flex items-center gap-1 rounded bg-slate-800 px-2.5 py-1 text-slate-200 transition hover:bg-emerald-600/20 hover:text-emerald-300 disabled:opacity-50"
            title="استبدال بحديث نبوي صحيح آخر ذي صلة من الصحيحين أو السنن"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-emerald-400 ${isLoading ? 'animate-spin' : ''}`} />
            <span>استبدال بحديث صحيح</span>
          </button>
        )}

        {/* Action 3: Elaborate */}
        <button
          onClick={() => onTransform('elaborate')}
          disabled={isLoading}
          className="flex items-center gap-1 rounded bg-slate-800 px-2.5 py-1 text-slate-200 transition hover:bg-sky-600/20 hover:text-sky-300 disabled:opacity-50"
          title="بسط وتوسيع الشرح الفقهي والتربوي"
        >
          <Maximize2 className="h-3.5 w-3.5 text-sky-400" />
          <span>إطالة الشرح</span>
        </button>

        {/* Action 4: Shorten */}
        <button
          onClick={() => onTransform('shorten')}
          disabled={isLoading}
          className="flex items-center gap-1 rounded bg-slate-800 px-2.5 py-1 text-slate-200 transition hover:bg-slate-700 hover:text-slate-100 disabled:opacity-50"
          title="إيجاز واختصار اللفظ مع حفظ جوهر المعنى"
        >
          <Minimize2 className="h-3.5 w-3.5 text-slate-400" />
          <span>اختصار</span>
        </button>

        <div className="mx-1 h-3.5 w-[1px] bg-slate-700" />

        {/* Reordering and Management */}
        {onMoveUp && !isFirst && (
          <button
            onClick={onMoveUp}
            className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            title="تحريك لأعلى"
          >
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
        )}

        {onMoveDown && !isLast && (
          <button
            onClick={onMoveDown}
            className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            title="تحريك لأسفل"
          >
            <ArrowDown className="h-3.5 w-3.5" />
          </button>
        )}

        {onDelete && (
          <button
            onClick={onDelete}
            className="rounded p-1 text-red-400/80 hover:bg-red-500/10 hover:text-red-300"
            title="حذف هذا المقطع"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
