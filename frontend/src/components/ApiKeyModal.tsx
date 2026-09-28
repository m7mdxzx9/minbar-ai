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
  const [provider, setProvider] = useState<'gemini' | 'builtin' | 'ollama'>('gemini');
  const [apiKey, setApiKey] = useState<string>('');
  const [modelName, setModelName] = useState<string>('gemini-1.5-flash');
  const [showKey, setShowKey] = useState<boolean>(false);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ valid: boolean; message: string } | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedKey = localStorage.getItem('minbar_api_key') || '';
      const savedProvider = (localStorage.getItem('minbar_model_provider') as any) || 'gemini';
      const savedModel = localStorage.getItem('minbar_model_name') || 'gemini-1.5-flash';
      setApiKey(savedKey);
      setProvider(savedProvider);
      setModelName(savedModel);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    if (provider === 'gemini' && !apiKey.trim()) {
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
    }
    setApiKey('');
    setProvider('builtin');
    setTestResult(null);
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
                استخدم نماذج Gemini الفائقة لصياغة خطب بليغة ومبتكرة مع التحقق الشرعي الصارم
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
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setProvider('gemini')}
                className={`flex flex-col items-center justify-center rounded-xl border p-3 text-center transition ${
                  provider === 'gemini'
                    ? 'border-amber-500 bg-amber-500/10 text-amber-200 shadow-sm'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Sparkles className="mb-1 h-4 w-4 text-amber-400" />
                <span className="font-bold">Google Gemini</span>
                <span className="text-[10px] text-amber-400/80">موصى به • مجاني وسريع</span>
              </button>

              <button
                type="button"
                onClick={() => setProvider('builtin')}
                className={`flex flex-col items-center justify-center rounded-xl border p-3 text-center transition ${
                  provider === 'builtin'
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-200 shadow-sm'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                }`}
              >
                <ShieldCheck className="mb-1 h-4 w-4 text-emerald-400" />
                <span className="font-bold">المحرك المدمج</span>
                <span className="text-[10px] text-emerald-400/80">100% أوفلاين محلي</span>
              </button>

              <button
                type="button"
                onClick={() => setProvider('ollama')}
                className={`flex flex-col items-center justify-center rounded-xl border p-3 text-center transition ${
                  provider === 'ollama'
                    ? 'border-sky-500 bg-sky-500/10 text-sky-200 shadow-sm'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Cpu className="mb-1 h-4 w-4 text-sky-400" />
                <span className="font-bold">خادم Ollama</span>
                <span className="text-[10px] text-sky-400/80">نموذج محلي خاص</span>
              </button>
            </div>
          </div>

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
                  onChange={e => {
                    setApiKey(e.target.value);
                    setTestResult(null);
                  }}
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

          {/* Ollama Info */}
          {provider === 'ollama' && (
            <div className="space-y-2 rounded-xl border border-slate-800 bg-slate-900/40 p-4">
              <label className="block font-semibold text-slate-200">رابط خادم Ollama المحلي:</label>
              <input
                type="text"
                defaultValue="http://localhost:11434"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2 font-mono text-xs text-slate-200 outline-none"
              />
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="mt-2 flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-700"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isTesting ? 'animate-spin text-sky-400' : ''}`} />
                <span>اختبار الاتصال بـ Ollama</span>
              </button>
            </div>
          )}

          {/* Theological Guardrail Assurance */}
          <div className="rounded-xl border border-amber-900/30 bg-amber-950/20 p-3 text-[11px] text-amber-300/90 flex items-start gap-2">
            <ShieldCheck className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
            <span>
              <strong>حماية عقدية صارمة:</strong> حتى عند تفعيل نماذج الذكاء الاصطناعي الخارجية، يقوم النظام
              تلقائياً بحظر أي هلوسة دينية وإلزام النموذج بالشواهد المسترجعة نصاً دون أدنى تحريف.
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex items-center justify-between border-t border-slate-800 pt-4">
          {apiKey ? (
            <button
              type="button"
              onClick={handleClear}
              className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 transition"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>مسح المفتاح والعودة للمحلي</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 px-5 py-2 font-amiri text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/20 hover:brightness-110 transition"
            >
              حفظ وتفعيل
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
