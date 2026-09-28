'use client';

import React, { useState } from 'react';
import { KhutbahEditor } from '../components/KhutbahEditor';
import { SidebarConfig } from '../components/SidebarConfig';
import { TheologicalAuditModal } from '../components/TheologicalAuditModal';
import { TeleprompterModal } from '../components/TeleprompterModal';
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

  const handleGenerate = async (params: KhutbahGenerationParams) => {
    setIsLoading(true);
    try {
      const generated = await generateSermonApi(params);
      if (generated && generated.blocks) {
        setSermon(generated);
      }
    } catch (err) {
      console.error('Error generating sermon:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0b0f17]">
      {/* Editor Main Canvas */}
      <KhutbahEditor
        sermon={sermon}
        onUpdateSermon={setSermon}
        onOpenAuditModal={() => setIsAuditModalOpen(true)}
        onOpenTeleprompter={() => setIsTeleprompterOpen(true)}
      />

      {/* Configuration Sidebar Drawer */}
      <SidebarConfig
        onGenerate={handleGenerate}
        isLoading={isLoading}
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
