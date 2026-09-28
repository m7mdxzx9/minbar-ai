'use client';

import React, { useState } from 'react';
import { KhutbahEditor } from '../components/KhutbahEditor';
import { SidebarConfig } from '../components/SidebarConfig';
import { TheologicalAuditModal } from '../components/TheologicalAuditModal';
import { TeleprompterModal } from '../components/TeleprompterModal';
import { CitationsExplorerModal } from '../components/CitationsExplorerModal';
import { ApiKeyModal } from '../components/ApiKeyModal';
import { KhutbahSermon, KhutbahGenerationParams } from '../types/khutbah';
import { generateSermonApi, getFallbackSermon } from '../lib/api';

const DEFAULT_PARAMS: KhutbahGenerationParams = {
  theme: 'الصبر عند الشدائد وحسن التوكل على الله',
  sermon_type: 'jumuah',
  target_duration_minutes: 15,
  audience_profile: 'جمهور عام متنوع من المصلين والأسر',
  tone: 'موعظة ترقق القلوب وتجمع بين الرجاء والرهبة',
  quran_count: 2,
  hadith_count: 2,
  poetry_count: 1
};

export default function MinbarAiPage() {
  const [sermon, setSermon] = useState<KhutbahSermon>(() => getFallbackSermon(DEFAULT_PARAMS));
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState<boolean>(false);
  const [isTeleprompterOpen, setIsTeleprompterOpen] = useState<boolean>(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);
  
  // Citations Explorer Modal state
  const [isCitationsModalOpen, setIsCitationsModalOpen] = useState<boolean>(false);
  const [explorerTheme, setExplorerTheme] = useState<string>(DEFAULT_PARAMS.theme);
  const [quranCount, setQuranCount] = useState<number>(2);
  const [hadithCount, setHadithCount] = useState<number>(2);
  const [poetryCount, setPoetryCount] = useState<number>(1);
  const [selectedCitationIds, setSelectedCitationIds] = useState<string[]>([]);

  const handleGenerate = async (params: KhutbahGenerationParams) => {
    setIsLoading(true);
    try {
      const savedKey = typeof window !== 'undefined' ? localStorage.getItem('minbar_api_key') || undefined : undefined;
      const savedProvider = typeof window !== 'undefined' ? (localStorage.getItem('minbar_model_provider') as any) || 'builtin' : 'builtin';
      const savedModel = typeof window !== 'undefined' ? localStorage.getItem('minbar_model_name') || 'gemini-1.5-flash' : 'gemini-1.5-flash';

      const generated = await generateSermonApi({
        ...params,
        quran_count: quranCount,
        hadith_count: hadithCount,
        poetry_count: poetryCount,
        model_provider: params.model_provider && params.model_provider !== 'builtin' ? params.model_provider : savedProvider,
        api_key: params.api_key || savedKey,
        custom_model_name: savedModel,
        selected_citation_ids: selectedCitationIds.length > 0 ? selectedCitationIds : undefined
      });
      if (generated && generated.blocks) {
        setSermon(generated);
      }
    } catch (err) {
      console.error('Error generating sermon:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCitationsExplorer = (theme: string) => {
    setExplorerTheme(theme);
    setIsCitationsModalOpen(true);
  };

  const handleApplyCitations = (q: number, h: number, p: number, ids: string[]) => {
    setQuranCount(q);
    setHadithCount(h);
    setPoetryCount(p);
    setSelectedCitationIds(ids);
  };

  return (
    <div className="relative min-h-screen bg-[#0b0f17]">
      {/* Editor Main Canvas */}
      <KhutbahEditor
        sermon={sermon}
        onUpdateSermon={setSermon}
        onOpenAuditModal={() => setIsAuditModalOpen(true)}
        onOpenTeleprompter={() => setIsTeleprompterOpen(true)}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
      />

      {/* Configuration Sidebar Drawer */}
      <SidebarConfig
        onGenerate={handleGenerate}
        isLoading={isLoading}
        onOpenCitationsExplorer={handleOpenCitationsExplorer}
        quranCount={quranCount}
        hadithCount={hadithCount}
        poetryCount={poetryCount}
        selectedCitationIds={selectedCitationIds}
        onUpdateCounts={(q, h, p) => {
          setQuranCount(q);
          setHadithCount(h);
          setPoetryCount(p);
        }}
      />

      {/* Citations Explorer & Tester Modal */}
      <CitationsExplorerModal
        isOpen={isCitationsModalOpen}
        onClose={() => setIsCitationsModalOpen(false)}
        currentTheme={explorerTheme}
        onApplyCitations={handleApplyCitations}
      />

      {/* AI API Key Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onKeySaved={(prov, key, model) => {
          // Trigger storage event so KhutbahEditor re-checks key status
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('storage'));
          }
        }}
      />

      {/* Deep Theological Audit Modal */}
      <TheologicalAuditModal
        sermon={sermon}
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
      />

      {/* Pulpit Delivery / Teleprompter Mode */}
      <TeleprompterModal
        sermon={sermon}
        isOpen={isTeleprompterOpen}
        onClose={() => setIsTeleprompterOpen(false)}
      />
    </div>
  );
}
