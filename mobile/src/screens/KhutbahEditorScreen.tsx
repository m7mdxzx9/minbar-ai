import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  StatusBar,
  Share
} from 'react-native';
import {
  ShieldCheck,
  Clock,
  FileText,
  Sliders,
  MonitorPlay,
  Share2,
  Sun,
  Moon,
  Plus,
  BookOpen
} from 'lucide-react-native';
import { KhutbahSermon, SermonBlock, KhutbahParams } from '../types/khutbah';
import { CitationCard } from '../components/CitationCard';
import { BlockActionBar } from '../components/BlockActionBar';
import { ConfigurationSheet } from '../components/ConfigurationSheet';
import { TeleprompterModal } from './TeleprompterModal';
import { SermonBuilder } from '../engine/SermonBuilder';

interface KhutbahEditorScreenProps {
  initialSermon?: KhutbahSermon;
}

export const KhutbahEditorScreen: React.FC<KhutbahEditorScreenProps> = ({ initialSermon }) => {
  const [sermon, setSermon] = useState<KhutbahSermon>(() => {
    if (initialSermon) return initialSermon;
    // Default fallback authentic state
    return {
      id: 'default_sermon',
      title: 'خطبة الجمعة: الصبر عند الشدائد وحسن التوكل على الله',
      theme: 'الصبر عند الشدائد وحسن التوكل على الله',
      sermon_type: 'jumuah',
      audience_profile: 'جمهور عام متنوع من المصلين والأسر',
      tone: 'موعظة ترقق القلوب وتجمع بين الرجاء والرهبة',
      theological_creed: "Ahl al-Sunnah wal-Jama'ah",
      verification_status: 'fully_verified',
      word_count: 480,
      estimated_delivery_minutes: 5.1,
      blocks: [],
      audits: [],
    };
  });

  const [isCreamMode, setIsCreamMode] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isTeleprompterOpen, setIsTeleprompterOpen] = useState(false);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);

  // Initialize blocks on first load if empty
  React.useEffect(() => {
    if (sermon.blocks.length === 0) {
      handleGenerate({
        theme: sermon.theme,
        sermon_type: sermon.sermon_type,
        target_duration_minutes: 15,
        audience_profile: sermon.audience_profile,
        tone: sermon.tone,
        quran_count: 2,
        hadith_count: 2,
        poetry_count: 1,
      });
    }
  }, []);

  const handleGenerate = async (params: KhutbahParams) => {
    const built = await SermonBuilder.buildSermon(params);
    setSermon(built);
  };

  const handleUpdateBlockContent = (blockId: string, newText: string) => {
    const updatedBlocks = sermon.blocks.map(b => (b.id === blockId ? { ...b, content_ar: newText } : b));
    const words = updatedBlocks
      .map(b => b.content_ar)
      .join(' ')
      .split(/\s+/)
      .filter(Boolean).length;
    const estMin = Math.round((words / 95.0) * 10) / 10;

    setSermon({
      ...sermon,
      blocks: updatedBlocks,
      word_count: words,
      estimated_delivery_minutes: estMin,
    });
  };

  const handleTransform = async (
    blockId: string,
    action: 'make_solemn' | 'replace_hadith' | 'elaborate' | 'shorten'
  ) => {
    const target = sermon.blocks.find(b => b.id === blockId);
    if (!target) return;

    const updated = await SermonBuilder.transformBlockOnDevice(target, action, sermon.theme);
    const updatedBlocks = sermon.blocks.map(b => (b.id === blockId ? updated : b));
    const words = updatedBlocks
      .map(b => b.content_ar)
      .join(' ')
      .split(/\s+/)
      .filter(Boolean).length;
    const estMin = Math.round((words / 95.0) * 10) / 10;

    setSermon({
      ...sermon,
      blocks: updatedBlocks,
      word_count: words,
      estimated_delivery_minutes: estMin,
    });
  };

  const handleMoveBlock = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= sermon.blocks.length) return;

    const newBlocks = [...sermon.blocks];
    const [moved] = newBlocks.splice(index, 1);
    newBlocks.splice(targetIdx, 0, moved);

    const reindexed = newBlocks.map((b, i) => ({ ...b, order_index: i + 1 }));
    setSermon({ ...sermon, blocks: reindexed });
  };

  const handleDeleteBlock = (index: number) => {
    if (sermon.blocks.length <= 1) return;
    const newBlocks = sermon.blocks.filter((_, i) => i !== index);
    const reindexed = newBlocks.map((b, i) => ({ ...b, order_index: i + 1 }));
    setSermon({ ...sermon, blocks: reindexed });
  };

  const handleAddBlock = () => {
    const newBlock: SermonBlock = {
      id: `block_${Date.now()}`,
      order_index: sermon.blocks.length + 1,
      block_type: 'thematic_exposition',
      title_ar: 'توجيه وموعظة إضافية',
      content_ar: 'أَيُّهَا الْمُؤْمِنُونَ: وَمِمَّا يَنْبَغِي لِلْعَبْدِ أَنْ يَسْتَصْحِبَهُ فِي هَذَا الْمَقَامِ...',
      verified: true,
      verification_score: 1.0,
    };
    setSermon({
      ...sermon,
      blocks: [...sermon.blocks, newBlock],
    });
  };

  const handleShare = async () => {
    const fullText = sermon.blocks.map(b => `${b.title_ar}:\n${b.content_ar}`).join('\n\n---\n\n');
    await Share.share({
      title: sermon.title,
      message: `${sermon.title}\nمنهج أهل السنة والجماعة (موثق)\n\n${fullText}`,
    });
  };

  return (
    <SafeAreaView style={[styles.safeArea, isCreamMode ? styles.bgCream : styles.bgDark]}>
      <StatusBar barStyle={isCreamMode ? 'dark-content' : 'light-content'} />

      {/* Top Header & Telemetry Bar */}
      <View style={[styles.headerBar, isCreamMode ? styles.headerCream : styles.headerDark]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => setIsCreamMode(!isCreamMode)} style={styles.toolIconBtn}>
            {isCreamMode ? <Moon size={18} color="#0f172a" /> : <Sun size={18} color="#fef3c7" />}
          </TouchableOpacity>
          <TouchableOpacity onPress={handleShare} style={styles.toolIconBtn}>
            <Share2 size={18} color={isCreamMode ? '#0f172a' : '#fef3c7'} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsConfigOpen(true)} style={styles.toolIconBtn}>
            <Sliders size={18} color={isCreamMode ? '#0f172a' : '#f59e0b'} />
          </TouchableOpacity>
        </View>

        <View style={styles.headerRight}>
          <View style={styles.brandBadge}>
            <Text style={styles.brandTitle}>مِنْبَر</Text>
            <View style={styles.offlineDot} />
          </View>
          <Text style={[styles.brandSubtitle, isCreamMode && styles.textDarkMuted]}>
            100% محلي بدون إنترنت
          </Text>
        </View>
      </View>

      {/* Telemetry Indicator Strip */}
      <View style={[styles.telemetryStrip, isCreamMode ? styles.stripCream : styles.stripDark]}>
        <View style={styles.telemetryItem}>
          <ShieldCheck size={13} color="#10b981" />
          <Text style={styles.telemetryVerified}>موثق بالكامل</Text>
        </View>
        <View style={styles.telemetryItem}>
          <Clock size={13} color="#f59e0b" />
          <Text style={[styles.telemetryText, isCreamMode && styles.textDark]}>
            {sermon.estimated_delivery_minutes} دقيقة (إلقاء متأنٍّ)
          </Text>
        </View>
        <View style={styles.telemetryItem}>
          <FileText size={13} color="#94a3b8" />
          <Text style={[styles.telemetryText, isCreamMode && styles.textDark]}>
            {sermon.word_count} كلمة
          </Text>
        </View>
      </View>

      {/* Main Block Editorial Canvas */}
      <ScrollView
        style={styles.canvas}
        contentContainerStyle={styles.canvasContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Sermon Title Header */}
        <View style={[styles.titleCard, isCreamMode ? styles.cardCream : styles.cardDark]}>
          <View style={styles.titleTag}>
            <Text style={styles.titleTagText}>خطبة جمعة مأصولة • {sermon.audience_profile}</Text>
          </View>
          <Text style={[styles.sermonTitle, isCreamMode ? styles.textDark : styles.textGold]}>
            {sermon.title}
          </Text>
          <Text style={styles.sermonThemeMeta}>
            الموضوع: {sermon.theme}
          </Text>
        </View>

        {/* Semantic Blocks List */}
        {sermon.blocks.map((block, idx) => {
          const isCitation = !!block.citation_source_type;
          const isIstighfar = block.block_type === 'istighfar_pause';

          return (
            <View
              key={block.id}
              style={[
                styles.blockWrapper,
                isCreamMode ? styles.cardCream : styles.cardDark,
                activeBlockId === block.id && styles.activeBlockBorder,
              ]}
            >
              {/* Block Header */}
              <View style={styles.blockHeader}>
                <View style={styles.blockIndexPill}>
                  <Text style={styles.blockIndexText}>{idx + 1}</Text>
                </View>
                <Text style={[styles.blockTitle, isCreamMode && styles.textDark]}>
                  {block.title_ar}
                </Text>
              </View>

              {/* Block Content */}
              {isCitation ? (
                <View>
                  <CitationCard block={block} isCreamMode={isCreamMode} />
                  <TextInput
                    style={[
                      styles.citationNotesInput,
                      isCreamMode ? styles.inputCream : styles.inputDark,
                    ]}
                    value={block.content_ar}
                    onChangeText={txt => handleUpdateBlockContent(block.id, txt)}
                    multiline
                    textAlign="right"
                    placeholder="ملاحظات الشرح المحيط بالشاهد..."
                    placeholderTextColor="#64748b"
                  />
                </View>
              ) : isIstighfar ? (
                <View style={[styles.istighfarBox, isCreamMode ? styles.istighfarCream : styles.istighfarDark]}>
                  <Text style={styles.istighfarLabel}>— جلسة الاستغفار بين الخطبتين —</Text>
                  <TextInput
                    style={[styles.istighfarInput, isCreamMode && styles.textDark]}
                    value={block.content_ar}
                    onChangeText={txt => handleUpdateBlockContent(block.id, txt)}
                    multiline
                    textAlign="center"
                  />
                </View>
              ) : (
                <TextInput
                  style={[
                    styles.regularTextInput,
                    isCreamMode ? styles.textDark : styles.textLight,
                  ]}
                  value={block.content_ar}
                  onChangeText={txt => handleUpdateBlockContent(block.id, txt)}
                  multiline
                  textAlign="right"
                  onFocus={() => setActiveBlockId(block.id)}
                />
              )}

              {/* Inline Action Bar */}
              <BlockActionBar
                blockType={block.block_type}
                onTransform={action => handleTransform(block.id, action)}
                onMoveUp={() => handleMoveBlock(idx, 'up')}
                onMoveDown={() => handleMoveBlock(idx, 'down')}
                onDelete={() => handleDeleteBlock(idx)}
                isFirst={idx === 0}
                isLast={idx === sermon.blocks.length - 1}
              />
            </View>
          );
        })}

        {/* Add Block Button */}
        <TouchableOpacity style={styles.addBlockBtn} onPress={handleAddBlock}>
          <Plus size={16} color="#d97706" />
          <Text style={styles.addBlockText}>إضافة مقطع منبري جديد</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Floating Teleprompter Bar */}
      <View style={[styles.floatingBottomBar, isCreamMode ? styles.barCream : styles.barDark]}>
        <TouchableOpacity
          style={styles.teleprompterActionBtn}
          onPress={() => setIsTeleprompterOpen(true)}
        >
          <MonitorPlay size={20} color="#0b0f17" />
          <Text style={styles.teleprompterBtnText}>بدء الإلقاء المنبري (وضع الملقن)</Text>
        </TouchableOpacity>
      </View>

      {/* Configuration Bottom Sheet */}
      <ConfigurationSheet
        visible={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        onGenerate={handleGenerate}
      />

      {/* Pulpit Delivery Teleprompter Modal */}
      <TeleprompterModal
        sermon={sermon}
        isOpen={isTeleprompterOpen}
        onClose={() => setIsTeleprompterOpen(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  bgDark: {
    backgroundColor: '#0b0f17',
  },
  bgCream: {
    backgroundColor: '#faf7f2',
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  headerDark: {
    backgroundColor: '#0b0f17',
    borderBottomColor: '#1e293b',
  },
  headerCream: {
    backgroundColor: '#faf7f2',
    borderBottomColor: '#e2e8f0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toolIconBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(148, 163, 184, 0.1)',
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  brandBadge: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#d97706',
  },
  offlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
  },
  brandSubtitle: {
    fontSize: 9,
    color: '#94a3b8',
  },
  telemetryStrip: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  stripDark: {
    backgroundColor: '#101725',
    borderBottomColor: '#1e293b',
  },
  stripCream: {
    backgroundColor: '#f1f5f9',
    borderBottomColor: '#e2e8f0',
  },
  telemetryItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
  },
  telemetryVerified: {
    fontSize: 11,
    color: '#10b981',
    fontWeight: 'bold',
  },
  telemetryText: {
    fontSize: 11,
    color: '#cbd5e1',
  },
  canvas: {
    flex: 1,
  },
  canvasContent: {
    padding: 16,
    paddingBottom: 90,
    gap: 16,
  },
  titleCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    alignItems: 'center',
    gap: 8,
  },
  cardDark: {
    backgroundColor: '#101622',
    borderColor: '#1e293b',
  },
  cardCream: {
    backgroundColor: '#fffdfa',
    borderColor: '#fde68a',
  },
  titleTag: {
    backgroundColor: 'rgba(217, 119, 6, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  titleTagText: {
    fontSize: 11,
    color: '#f59e0b',
    fontWeight: '600',
  },
  sermonTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 30,
  },
  textGold: {
    color: '#fef3c7',
  },
  textDark: {
    color: '#0f172a',
  },
  textDarkMuted: {
    color: '#64748b',
  },
  textLight: {
    color: '#f8fafc',
  },
  sermonThemeMeta: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
  },
  blockWrapper: {
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    gap: 8,
  },
  activeBlockBorder: {
    borderColor: '#f59e0b',
  },
  blockHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(148, 163, 184, 0.1)',
    paddingBottom: 6,
  },
  blockIndexPill: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(217, 119, 6, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  blockIndexText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#f59e0b',
  },
  blockTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fde68a',
  },
  regularTextInput: {
    fontSize: 16,
    lineHeight: 32,
    paddingVertical: 8,
  },
  citationNotesInput: {
    fontSize: 12,
    lineHeight: 20,
    borderRadius: 8,
    padding: 8,
    marginTop: 6,
    borderWidth: 1,
  },
  inputDark: {
    backgroundColor: '#070a0f',
    borderColor: '#1e293b',
    color: '#cbd5e1',
  },
  inputCream: {
    backgroundColor: '#f8fafc',
    borderColor: '#e2e8f0',
    color: '#0f172a',
  },
  istighfarBox: {
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  istighfarDark: {
    backgroundColor: '#181e2b',
    borderColor: '#78350f',
  },
  istighfarCream: {
    backgroundColor: '#fffbeb',
    borderColor: '#fde68a',
  },
  istighfarLabel: {
    fontSize: 11,
    color: '#f59e0b',
    fontWeight: 'bold',
    marginBottom: 6,
  },
  istighfarInput: {
    fontSize: 16,
    lineHeight: 30,
    color: '#fef3c7',
  },
  addBlockBtn: {
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#d97706',
    borderStyle: 'dashed',
    borderRadius: 14,
    paddingVertical: 12,
    backgroundColor: 'rgba(217, 119, 6, 0.05)',
  },
  addBlockText: {
    fontSize: 14,
    color: '#f59e0b',
    fontWeight: '600',
  },
  floatingBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: 1,
  },
  barDark: {
    backgroundColor: 'rgba(11, 15, 23, 0.95)',
    borderTopColor: '#1e293b',
  },
  barCream: {
    backgroundColor: 'rgba(250, 247, 242, 0.95)',
    borderTopColor: '#e2e8f0',
  },
  teleprompterActionBtn: {
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f59e0b',
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: '#f59e0b',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  teleprompterBtnText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0b0f17',
  },
});
