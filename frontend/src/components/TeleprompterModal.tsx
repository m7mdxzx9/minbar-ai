'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, X, ZoomIn, ZoomOut, ArrowDown, ArrowUp } from 'lucide-react';
import { KhutbahSermon } from '../types/khutbah';

interface TeleprompterModalProps {
  sermon: KhutbahSermon;
  isOpen: boolean;
  onClose: () => void;
}

export const TeleprompterModal: React.FC<TeleprompterModalProps> = ({
  sermon,
  isOpen,
  onClose
}) => {
  const [fontSize, setFontSize] = useState<number>(32);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [scrollSpeed, setScrollSpeed] = useState<number>(1);
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Delivery stopwatch
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen && isPlaying) {
      timer = setInterval(() => {
        setSecondsElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen, isPlaying]);

  // Teleprompter smooth autoscroll
  useEffect(() => {
    let scrollTimer: NodeJS.Timeout;
    if (isOpen && isPlaying) {
      scrollTimer = setInterval(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop += scrollSpeed;
        }
      }, 50);
    }
    return () => clearInterval(scrollTimer);
  }, [isOpen, isPlaying, scrollSpeed]);

  if (!isOpen) return null;

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const targetMinutes = sermon.target_duration_minutes || 15;

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 flex flex-col bg-[#070a0f] text-amber-50"
    >
      {/* Top Floating Control Bar */}
      <header className="flex flex-wrap items-center justify-between border-b border-amber-900/40 bg-slate-950/90 px-6 py-3.5 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 animate-pulse rounded-full bg-emerald-500" />
            <span className="font-amiri text-lg font-bold text-amber-300">
              وضع الإلقاء المنبري
            </span>
          </div>

          {/* Delivery Stopwatch */}
          <div className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-1 font-mono text-base font-bold text-amber-300">
            <span>{formatTimer(secondsElapsed)}</span>
            <span className="text-xs text-amber-500/80">/ {targetMinutes}:00 د</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          {/* Play / Pause Autoscroll */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-1.5 font-amiri text-sm font-bold text-slate-950 shadow-md transition hover:bg-amber-400"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            <span>{isPlaying ? 'إيقاف مؤقت' : 'بدء التمرير'}</span>
          </button>

          {/* Reset Timer */}
          <button
            onClick={() => setSecondsElapsed(0)}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            title="تصفير المؤقت"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          {/* Scroll Speed */}
          <div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 px-2 py-1 text-xs">
            <span className="text-slate-400">السرعة:</span>
            <button
              onClick={() => setScrollSpeed(Math.max(1, scrollSpeed - 1))}
              className="px-1 text-amber-400 hover:text-amber-300"
            >
              -
            </button>
            <span className="font-bold text-slate-200">{scrollSpeed}x</span>
            <button
              onClick={() => setScrollSpeed(Math.min(5, scrollSpeed + 1))}
              className="px-1 text-amber-400 hover:text-amber-300"
            >
              +
            </button>
          </div>

          {/* Font Size Adjust */}
          <div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 px-2 py-1">
            <button
              onClick={() => setFontSize(Math.max(22, fontSize - 2))}
              className="p-1 text-slate-400 hover:text-amber-300"
              title="تصغير الخط"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <span className="text-xs text-slate-300">{fontSize}px</span>
            <button
              onClick={() => setFontSize(Math.min(52, fontSize + 2))}
              className="p-1 text-slate-400 hover:text-amber-300"
              title="تكبير الخط"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
          </div>

          {/* Exit */}
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-red-500/20 hover:text-red-300"
            title="إنهاء وضع الإلقاء"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Prompter Text Scroll Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-8 py-16 sm:px-20 lg:px-44"
        style={{ scrollBehavior: 'smooth' }}
      >
        <div className="mx-auto max-w-4xl space-y-12">
          {/* Title */}
          <div className="border-b border-amber-800/40 pb-6 text-center">
            <h1 className="font-amiri text-3xl font-extrabold text-amber-400 sm:text-4xl">
              {sermon.title}
            </h1>
            <p className="mt-2 text-sm text-amber-300/70">
              {sermon.theological_creed} — توثيق تام
            </p>
          </div>

          {/* Sermon Discrete Sections */}
          {sermon.blocks.map((block, idx) => (
            <div key={block.id} className="space-y-4">
              <span className="block border-r-2 border-amber-500 pr-3 font-amiri text-sm font-semibold text-amber-400/90">
                {block.title_ar}
              </span>
              <p
                className="font-amiri leading-[2.2] tracking-wide text-slate-100"
                style={{ fontSize: `${fontSize}px` }}
              >
                {block.content_ar}
              </p>
            </div>
          ))}

          <div className="py-20 text-center font-amiri text-xl text-amber-500/60">
            — تمت الخطبة المباركة والحمد لله رب العالمين —
          </div>
        </div>
      </div>
    </div>
  );
};
