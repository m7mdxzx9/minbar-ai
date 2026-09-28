'use client';

import React, { useState, useEffect } from 'react';
import {
  Key,
  X,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Cpu,
  Sparkles,
  Zap,
  Flame,
  Eye,
  EyeOff,
  RefreshCw,
  Trash2
} from 'lucide-react';
import { testApiKeyApi } from '../lib/api';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeySaved: (provider: string, apiKey: string, modelName: string) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  onKeySaved
}) => {
  const [provider, setProvider] = useState<'groq' | 'grok' | 'gemini' | 'builtin' | 'ollama'>('groq');
  const [apiKey, setApiKey] = useState<string>('');
  const [modelName, setModelName] = useState<string>('llama-3.3-70b-versatile');
  const [showKey, setShowKey] = useState<boolean>(false);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [detectedProvider, setDetectedProvider] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ valid: boolean; message: string } | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedKey = localStorage.getItem('minbar_api_key') || '';
      let savedProvider = (localStorage.getItem('minbar_model_provider') as any) || 'groq';
      let savedModel = localStorage.getItem('minbar_model_name') || 'llama-3.3-70b-versatile';

      // Auto-detect based on saved key format
      if (savedKey.startsWith('gsk_')) {
        savedProvider = 'groq';
        if (!savedModel.includes('llama') && !savedModel.includes('mixtral')) {
          savedModel = 'llama-3.3-70b-versatile';
        }
      } else if (savedKey.startsWith('xai-')) {
        savedProvider = 'grok';
        if (!savedModel.includes('grok')) savedModel = 'grok-beta';
      } else if (savedKey.startsWith('AIzaSy')) {
        savedProvider = 'gemini';
        if (!savedModel.includes('gemini')) savedModel = 'gemini-1.5-flash';
      }

      setApiKey(savedKey);
      setProvider(savedProvider);
      setModelName(savedModel);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleKeyChange = (val: string) => {
    setApiKey(val);
    setTestResult(null);
    const trimmed = val.trim();
    if (trimmed.startsWith('gsk_')) {
      setProvider('groq');
      setDetectedProvider('Groq (LPU - سرعة البرق)');
      if (!modelName.includes('llama') && !modelName.includes('mixtral')) {
        setModelName('llama-3.3-70b-versatile');
      }
    } else if (trimmed.startsWith('xai-')) {
      setProvider('grok');
      setDetectedProvider('Grok (xAI)');
      if (!modelName.includes('grok')) {
        setModelName('grok-beta');
      }
    } else if (trimmed.startsWith('AIzaSy')) {
      setProvider('gemini');
      setDetectedProvider('Google Gemini');
      if (!modelName.includes('gemini')) {
        setModelName('gemini-1.5-flash');
      }
    } else {
      setDetectedProvider(null);
    }
  };

  const handleProviderSelect = (newProv: 'groq' | 'grok' | 'gemini' | 'builtin' | 'ollama') => {
    setProvider(newProv);
    setTestResult(null);
    if (newProv === 'groq') {
      setModelName('llama-3.3-70b-versatile');
    } else if (newProv === 'grok') {
      setModelName('grok-beta');
    } else if (newProv === 'gemini') {
      setModelName('gemini-1.5-flash');
    } else if (newProv === 'ollama') {
      setModelName('llama3.2');
    }
  };

  const handleTestConnection = async () => {
    if ((provider === 'groq' || provider === 'grok' || provider === 'gemini') && !apiKey.trim()) {
      setTestResult({ valid: false, message: 'يرجى إدخال مفتاح API أولاً قبل الفحص.' });
      return;
    }
    setIsTesting(true);
    setTestResult(null);
    try {
      const result = await testApiKeyApi(provider, apiKey.trim(), modelName);
      setTestResult(result);
    } catch (err: any) {
      setTestResult({ valid: false, message: `خطأ في الاتصال: ${err.message}` });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('minbar_api_key', apiKey.trim());
      localStorage.setItem('minbar_model_provider', provider);
      localStorage.setItem('minbar_model_name', modelName);
    }
    onKeySaved(provider, apiKey.trim(), modelName);
    onClose();
  };

  const handleClear = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('minbar_api_key');
      localStorage.setItem('minbar_model_provider', 'builtin');
      localStorage.removeItem('minbar_model_name');
    }
    setApiKey('');
    setProvider('builtin');
    setTestResult(null);
    setDetectedProvider(null);
    onKeySaved('builtin', '', 'builtin');
  };

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md transition-all animate-in fade-in"
    >
      <div className="relative w-full max-w-xl rounded-2xl border border-amber-500/40 bg-slate-950 p-6 shadow-2xl shadow-amber-950/40 text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <Key className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-amiri text-xl font-bold text-amber-200">
                إعداد مفتاح الذكاء الاصطناعي (AI API Key)
              </h2>
              <p className="text-xs text-slate-400">
                دعم فوري لمفاتيح Groq (gsk_...) و Grok (xai-...) و Gemini مع حماية شرعية من الهلوسة
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-5 space-y-4 text-xs">
          {/* Provider Selection */}
          <div>
            <label className="mb-1.5 block font-semibold text-slate-300">
              مزود نموذج الذكاء الاصطناعي:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {/* Groq button */}
              <button
                type="button"
                onClick={() => handleProviderSelect('groq')}
                className={`flex flex-col items-center justify-center rounded-xl border p-2.5 text-center transition ${
                  provider === 'groq'
                    ? 'border-orange-500 bg-orange-500/10 text-orange-200 shadow-sm ring-1 ring-orange-500/50'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Flame className="mb-1 h-4 w-4 text-orange-400" />
                <span className="font-bold">Groq (سرعة خارقة)</span>
                <span className="text-[10px] text-orange-400/90 font-mono">gsk_...</span>
              </button>

              {/* Grok button */}
              <button
                type="button"
                onClick={() => handleProviderSelect('grok')}
                className={`flex flex-col items-center justify-center rounded-xl border p-2.5 text-center transition ${
                  provider === 'grok'
                    ? 'border-cyan-500 bg-cyan-500/10 text-cyan-200 shadow-sm ring-1 ring-cyan-500/50'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Zap className="mb-1 h-4 w-4 text-cyan-400" />
                <span className="font-bold">Grok (xAI)</span>
                <span className="text-[10px] text-cyan-400/90 font-mono">xai-...</span>
              </button>

              {/* Gemini button */}
              <button
                type="button"
                onClick={() => handleProviderSelect('gemini')}
                className={`flex flex-col items-center justify-center rounded-xl border p-2.5 text-center transition ${
                  provider === 'gemini'
                    ? 'border-amber-500 bg-amber-500/10 text-amber-200 shadow-sm ring-1 ring-amber-500/50'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Sparkles className="mb-1 h-4 w-4 text-amber-400" />
                <span className="font-bold">Google Gemini</span>
                <span className="text-[10px] text-amber-400/80">AIzaSy...</span>
              </button>

              {/* Builtin button */}
              <button
                type="button"
                onClick={() => handleProviderSelect('builtin')}
                className={`flex flex-col items-center justify-center rounded-xl border p-2.5 text-center transition ${
                  provider === 'builtin'
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-200 shadow-sm ring-1 ring-emerald-500/50'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                }`}
              >
                <ShieldCheck className="mb-1 h-4 w-4 text-emerald-400" />
                <span className="font-bold">المحرك المدمج</span>
                <span className="text-[10px] text-emerald-400/80">100% أوفلاين</span>
              </button>
            </div>
          </div>

          {/* Auto Detection Badge */}
          {detectedProvider && (
            <div className="flex items-center gap-1.5 rounded-lg border border-orange-500/40 bg-orange-950/30 px-3 py-1.5 text-xs text-orange-200">
              <Flame className="h-3.5 w-3.5 text-orange-400" />
              <span>تم التعرف التلقائي على مفتاح <strong>{detectedProvider}</strong> وضبطه بنجاح!</span>
            </div>
          )}

          {/* Groq Settings */}
          {provider === 'groq' && (
            <div className="space-y-3 rounded-xl border border-orange-800/60 bg-slate-900/60 p-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-orange-200">أدخل مفتاح Groq API (الذي يبدأ بـ gsk_):</span>
                <a
                  href="https://console.groq.com/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[11px] text-orange-400 hover:text-orange-300 underline"
                >
                  <span>احصل على مفتاح مجاناً من GroqCloud</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={e => handleKeyChange(e.target.value)}
                  placeholder="gsk_..."
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 pl-10 pr-3 font-mono text-xs text-orange-100 placeholder-slate-600 outline-none focus:border-orange-500/80"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute left-3 top-2.5 text-slate-400 hover:text-slate-200"
                >
                  {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Model Choice */}
              <div>
                <label className="mb-1 block font-semibold text-slate-300">
                  إصدار نموذج الذكاء الاصطناعي على Groq:
                </label>
                <select
                  value={modelName}
                  onChange={e => setModelName(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-xs text-slate-200 outline-none focus:border-orange-500/80"
                >
                  <option value="llama-3.3-70b-versatile">Llama 3.3 70B Versatile (الأقوى والأكثر بلاغة • موصى به)</option>
                  <option value="llama-3.1-8b-instant">Llama 3.1 8B Instant (سرعة استجابة خارقة في أجزاء من الثانية)</option>
                  <option value="mixtral-8x7b-32768">Mixtral 8x7B (نموذج مفتوح المصدر متزن)</option>
                  <option value="gemma2-9b-it">Google Gemma 2 9B</option>
                </select>
              </div>

              {/* Test Button & Result */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTesting || !apiKey.trim()}
                  className="flex items-center gap-2 rounded-lg border border-orange-700/60 bg-orange-950/40 px-3 py-1.5 text-xs font-semibold text-orange-200 transition hover:bg-orange-900/60 disabled:opacity-50"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isTesting ? 'animate-spin text-orange-400' : ''}`} />
                  <span>{isTesting ? 'جارٍ فحص المفتاح مع Groq...' : 'اختبار صلاحية مفتاح Groq والاتصال'}</span>
                </button>

                {testResult && (
                  <div
                    className={`mt-2 flex items-center gap-2 rounded-lg p-2.5 text-xs ${
                      testResult.valid
                        ? 'border border-emerald-600/40 bg-emerald-950/40 text-emerald-300'
                        : 'border border-red-600/40 bg-red-950/40 text-red-300'
                    }`}
                  >
                    {testResult.valid ? (
                      <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400" />
                    ) : (
                      <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                    )}
                    <span>{testResult.message}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Grok (xAI) Settings */}
          {provider === 'grok' && (
            <div className="space-y-3 rounded-xl border border-cyan-800/60 bg-slate-900/60 p-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-cyan-200">أدخل مفتاح Grok (xAI) API:</span>
                <a
                  href="https://console.x.ai/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 underline"
                >
                  <span>إدارة المفتاح من xAI Console</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={e => handleKeyChange(e.target.value)}
                  placeholder="xai-..."
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 pl-10 pr-3 font-mono text-xs text-cyan-100 placeholder-slate-600 outline-none focus:border-cyan-500/80"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute left-3 top-2.5 text-slate-400 hover:text-slate-200"
                >
                  {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Model Choice */}
              <div>
                <label className="mb-1 block font-semibold text-slate-300">
                  إصدار نموذج Grok المفضل:
                </label>
                <select
                  value={modelName}
                  onChange={e => setModelName(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-xs text-slate-200 outline-none focus:border-cyan-500/80"
                >
                  <option value="grok-beta">Grok Beta (فائق السرعة والذكاء • موصى به)</option>
                  <option value="grok-2-latest">Grok 2 Latest (الجيل الأحدث والأقوى بلاغة)</option>
                  <option value="grok-2-1212">Grok 2.1212</option>
                  <option value="grok-vision-beta">Grok Vision Beta</option>
                </select>
              </div>

              {/* Test Button & Result */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTesting || !apiKey.trim()}
                  className="flex items-center gap-2 rounded-lg border border-cyan-700/60 bg-cyan-950/40 px-3 py-1.5 text-xs font-semibold text-cyan-200 transition hover:bg-cyan-900/60 disabled:opacity-50"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isTesting ? 'animate-spin text-cyan-400' : ''}`} />
                  <span>{isTesting ? 'جارٍ فحص المفتاح مع xAI Grok...' : 'اختبار صلاحية مفتاح Grok والاتصال'}</span>
                </button>

                {testResult && (
                  <div
                    className={`mt-2 flex items-center gap-2 rounded-lg p-2.5 text-xs ${
                      testResult.valid
                        ? 'border border-emerald-600/40 bg-emerald-950/40 text-emerald-300'
                        : 'border border-red-600/40 bg-red-950/40 text-red-300'
                    }`}
                  >
                    {testResult.valid ? (
                      <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400" />
                    ) : (
                      <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                    )}
                    <span>{testResult.message}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Gemini Settings */}
          {provider === 'gemini' && (
            <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-900/40 p-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-200">أدخل مفتاح Google Gemini API:</span>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 underline"
                >
                  <span>احصل على مفتاح مجاناً من Google</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={e => handleKeyChange(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 pl-10 pr-3 font-mono text-xs text-amber-100 placeholder-slate-600 outline-none focus:border-amber-500/80"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute left-3 top-2.5 text-slate-400 hover:text-slate-200"
                >
                  {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Model Choice */}
              <div>
                <label className="mb-1 block font-semibold text-slate-300">
                  إصدار النموذج المفضل:
                </label>
                <select
                  value={modelName}
                  onChange={e => setModelName(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-xs text-slate-200 outline-none focus:border-amber-500/80"
                >
                  <option value="gemini-1.5-flash">Gemini 1.5 Flash (فائق السرعة • ممتاز للبلاغة)</option>
                  <option value="gemini-2.0-flash">Gemini 2.0 Flash (الجيل الأحدث والأقوى)</option>
                  <option value="gemini-1.5-pro">Gemini 1.5 Pro (تفكير عميق وتفصيل موسع)</option>
                </select>
              </div>

              {/* Test Button & Result */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTesting || !apiKey.trim()}
                  className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-slate-700 disabled:opacity-50"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isTesting ? 'animate-spin text-amber-400' : ''}`} />
                  <span>{isTesting ? 'جارٍ فحص المفتاح مع Google...' : 'اختبار صلاحية المفتاح والاتصال'}</span>
                </button>

                {testResult && (
                  <div
                    className={`mt-2 flex items-center gap-2 rounded-lg p-2.5 text-xs ${
                      testResult.valid
                        ? 'border border-emerald-600/40 bg-emerald-950/40 text-emerald-300'
                        : 'border border-red-600/40 bg-red-950/40 text-red-300'
                    }`}
                  >
                    {testResult.valid ? (
                      <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400" />
                    ) : (
                      <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                    )}
                    <span>{testResult.message}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Built-in Info */}
          {provider === 'builtin' && (
            <div className="rounded-xl border border-emerald-600/30 bg-emerald-950/20 p-4 text-emerald-200">
              <div className="flex items-center gap-2 font-bold text-emerald-300">
                <ShieldCheck className="h-4 w-4" />
                <span>المحرك المدمج الموثق يعمل بدون إنترنت (100% Offline)</span>
              </div>
              <p className="mt-1 text-slate-300 leading-relaxed text-[11px]">
                يستخدم المحرك المدمج خوارزميات الاسترجاع الهجين والتوليد البياني المغلق، مع ضمان التوثيق
                الشرعي بنسبة 100% دون الحاجة إلى أي مفاتيح أو اتصال بالشبكة.
              </p>
            </div>
          )}

          {/* Theological Guardrail Assurance */}
          <div className="rounded-xl border border-amber-900/30 bg-amber-950/20 p-3 text-[11px] text-amber-300/90 flex items-start gap-2">
            <ShieldCheck className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
            <span>
              <strong>حماية عقدية صارمة (Zero-Hallucination):</strong> سواء استخدمت Groq أو Grok أو Gemini، يقوم
              محرك «منبر» بالتحقق الدقيق من الشواهد والآيات والأحاديث ومنع أي تزييف أو هلوسة بشكل صارم.
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex items-center justify-between border-t border-slate-800 pt-4">
          <button
            type="button"
            onClick={handleClear}
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-950/30 hover:text-red-300 transition"
          >
            <Trash2 className="h-4 w-4" />
            <span>مسح المفتاح والعودة للمدمج</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 px-5 py-2 text-xs font-bold text-slate-950 shadow-md shadow-amber-500/20 hover:brightness-110 transition"
            >
              <CheckCircle className="h-4 w-4" />
              <span>حفظ الإعدادات</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
