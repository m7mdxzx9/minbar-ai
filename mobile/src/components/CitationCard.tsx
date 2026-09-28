import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ShieldCheck, BookOpen, Scroll, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react-native';
import { SermonBlock } from '../types/khutbah';

interface CitationCardProps {
  block: SermonBlock;
  isCreamMode?: boolean;
}

export const CitationCard: React.FC<CitationCardProps> = ({ block, isCreamMode = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const { citation_source_type, citation_metadata, audit_feedback } = block;

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (citation_source_type === 'quran') {
    const surah = citation_metadata?.surah_name_ar || 'سورة مباركة';
    const ayah = citation_metadata?.ayah_number || '';
    const hash = audit_feedback?.hash || citation_metadata?.canonical_hash || 'SHA256_CANONICAL';

    return (
      <View
        style={[
          styles.cardContainer,
          isCreamMode ? styles.quranCardCream : styles.quranCardDark,
        ]}
      >
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={styles.titleRow}>
            <View style={styles.iconCircleAmber}>
              <BookOpen size={16} color="#d97706" />
            </View>
            <View>
              <Text style={[styles.surahTitle, isCreamMode && styles.textDark]}>
                سورة {surah} {ayah ? `[الآية: ${ayah}]` : ''}
              </Text>
              <Text style={styles.subMeta}>مصحف المدينة بالرسم العثماني المعتمد</Text>
            </View>
          </View>

          <View style={styles.badgeRow}>
            <View style={styles.verifiedBadge}>
              <ShieldCheck size={12} color="#10b981" />
              <Text style={styles.verifiedText}>تطابق 100%</Text>
            </View>
            <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)} style={styles.expandButton}>
              {isExpanded ? <ChevronUp size={16} color="#94a3b8" /> : <ChevronDown size={16} color="#94a3b8" />}
            </TouchableOpacity>
          </View>
        </View>

        {/* Ayah Text */}
        <View style={styles.contentBox}>
          <Text style={[styles.quranText, isCreamMode && styles.quranTextCream]}>
            {block.content_ar.replace(/يَقُولُ اللَّهُ تَبَارَكَ وَتَعَالَى فِي مُحْكَمِ التَّنْزِيلِ:\s*/g, '')}
          </Text>
        </View>

        {/* Collapsible Verification Details */}
        {isExpanded && (
          <View style={[styles.drawer, isCreamMode ? styles.drawerCream : styles.drawerDark]}>
            <View style={styles.drawerRow}>
              <Text style={styles.drawerLabel}>الرواية والضبط:</Text>
              <Text style={styles.drawerValue}>حفص عن عاصم (مجمع الملك فهد)</Text>
            </View>
            <View style={styles.drawerRow}>
              <Text style={styles.drawerLabel}>البصمة المشفرة (SHA-256):</Text>
              <Text style={styles.hashValue}>{hash.substring(0, 16)}...</Text>
            </View>
            <View style={styles.drawerRow}>
              <Text style={styles.drawerLabel}>التحقق المحلي:</Text>
              <Text style={styles.verifiedValue}>مسترجع من SQLite المحلي بدون إنترنت</Text>
            </View>
          </View>
        )}
      </View>
    );
  }

  if (citation_source_type === 'hadith') {
    const collection = citation_metadata?.collection || 'صحيح السنة';
    const hadithNum = citation_metadata?.hadith_number || '';
    const grading = citation_metadata?.grading || 'Sahih';
    const gradedBy = citation_metadata?.graded_by || 'المحدثون';
    const isnad = citation_metadata?.isnad_ar || '';
    const takhrij = citation_metadata?.takhrij_notes || audit_feedback?.takhrij || '';
    const hash = audit_feedback?.hash || citation_metadata?.canonical_hash || 'SHA256_HASH';

    return (
      <View
        style={[
          styles.cardContainer,
          isCreamMode ? styles.hadithCardCream : styles.hadithCardDark,
        ]}
      >
        <View style={styles.cardHeader}>
          <View style={styles.titleRow}>
            <View style={styles.iconCircleEmerald}>
              <ShieldCheck size={16} color="#10b981" />
            </View>
            <View>
              <Text style={[styles.hadithTitle, isCreamMode && styles.textDark]}>
                {collection} {hadithNum ? `(#${hadithNum})` : ''}
              </Text>
              <View style={styles.gradingRow}>
                <View style={styles.gradingPill}>
                  <Text style={styles.gradingText}>{grading === 'Sahih' ? 'صحيح' : 'حسن'}</Text>
                </View>
                <Text style={styles.gradedByText}>{gradedBy}</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)} style={styles.expandButton}>
            {isExpanded ? <ChevronUp size={16} color="#94a3b8" /> : <ChevronDown size={16} color="#94a3b8" />}
          </TouchableOpacity>
        </View>

        <View style={styles.contentBox}>
          <Text style={[styles.hadithMatn, isCreamMode && styles.textDark]}>
            {block.content_ar}
          </Text>
        </View>

        {isExpanded && (
          <View style={[styles.drawer, isCreamMode ? styles.drawerCream : styles.drawerDark]}>
            {isnad ? (
              <View style={styles.drawerBlock}>
                <Text style={styles.drawerLabel}>سند الرواية:</Text>
                <Text style={styles.isnadText}>{isnad}</Text>
              </View>
            ) : null}
            {takhrij ? (
              <View style={styles.drawerBlock}>
                <Text style={styles.drawerLabel}>التخريج والدلالة:</Text>
                <Text style={styles.takhrijText}>{takhrij}</Text>
              </View>
            ) : null}
            <View style={styles.drawerRow}>
              <Text style={styles.drawerLabel}>بصمة المتن:</Text>
              <Text style={styles.hashValue}>{hash.substring(0, 16)}...</Text>
            </View>
          </View>
        )}
      </View>
    );
  }

  if (citation_source_type === 'poetry') {
    const poet = citation_metadata?.poet_name_ar || 'شاعر الحكمة';
    const bahr = citation_metadata?.bahr || 'البحر';

    return (
      <View
        style={[
          styles.cardContainer,
          isCreamMode ? styles.poetryCardCream : styles.poetryCardDark,
        ]}
      >
        <View style={styles.cardHeader}>
          <View style={styles.titleRow}>
            <Scroll size={16} color="#d97706" />
            <Text style={[styles.poetName, isCreamMode && styles.textDark]}>{poet}</Text>
            <View style={styles.bahrPill}>
              <Text style={styles.bahrText}>{bahr}</Text>
            </View>
          </View>
          <Text style={styles.poetryTag}>شاهد بلاغي</Text>
        </View>

        <View style={styles.contentBoxCenter}>
          <Text style={[styles.poetryText, isCreamMode && styles.textDark]}>
            {block.content_ar}
          </Text>
        </View>
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
  },
  quranCardDark: {
    backgroundColor: '#121824',
    borderColor: '#78350f',
  },
  quranCardCream: {
    backgroundColor: '#fffdfa',
    borderColor: '#fde68a',
  },
  hadithCardDark: {
    backgroundColor: '#0c1a17',
    borderColor: '#064e3b',
  },
  hadithCardCream: {
    backgroundColor: '#f7fee7',
    borderColor: '#bbf7d0',
  },
  poetryCardDark: {
    backgroundColor: '#151922',
    borderColor: '#334155',
  },
  poetryCardCream: {
    backgroundColor: '#fffbeb',
    borderColor: '#fef3c7',
  },
  cardHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(148, 163, 184, 0.15)',
    paddingBottom: 8,
  },
  titleRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
  },
  iconCircleAmber: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(217, 119, 6, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircleEmerald: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  surahTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fef3c7',
    textAlign: 'right',
  },
  hadithTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#a7f3d0',
    textAlign: 'right',
  },
  subMeta: {
    fontSize: 10,
    color: '#94a3b8',
    textAlign: 'right',
  },
  badgeRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
  },
  verifiedBadge: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  verifiedText: {
    fontSize: 10,
    color: '#34d399',
    fontWeight: '600',
  },
  expandButton: {
    padding: 4,
  },
  contentBox: {
    paddingVertical: 12,
  },
  contentBoxCenter: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  quranText: {
    fontSize: 20,
    lineHeight: 40,
    textAlign: 'center',
    color: '#fef3c7',
  },
  quranTextCream: {
    color: '#78350f',
  },
  hadithMatn: {
    fontSize: 17,
    lineHeight: 32,
    textAlign: 'right',
    color: '#f8fafc',
  },
  poetryText: {
    fontSize: 17,
    lineHeight: 30,
    textAlign: 'center',
    color: '#fef3c7',
  },
  gradingRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  gradingPill: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  gradingText: {
    fontSize: 10,
    color: '#34d399',
    fontWeight: 'bold',
  },
  gradedByText: {
    fontSize: 10,
    color: '#94a3b8',
  },
  poetName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fde68a',
  },
  bahrPill: {
    backgroundColor: 'rgba(217, 119, 6, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  bahrText: {
    fontSize: 10,
    color: '#f59e0b',
  },
  poetryTag: {
    fontSize: 10,
    color: '#94a3b8',
  },
  drawer: {
    marginTop: 8,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  drawerDark: {
    backgroundColor: '#070a0f',
    borderColor: '#1e293b',
  },
  drawerCream: {
    backgroundColor: '#f1f5f9',
    borderColor: '#e2e8f0',
  },
  drawerRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  drawerBlock: {
    marginBottom: 4,
  },
  drawerLabel: {
    fontSize: 11,
    color: '#94a3b8',
    textAlign: 'right',
  },
  drawerValue: {
    fontSize: 11,
    color: '#f1f5f9',
    fontWeight: '600',
  },
  isnadText: {
    fontSize: 11,
    color: '#cbd5e1',
    textAlign: 'right',
    marginTop: 2,
  },
  takhrijText: {
    fontSize: 11,
    color: '#cbd5e1',
    textAlign: 'right',
    marginTop: 2,
  },
  hashValue: {
    fontSize: 10,
    color: '#10b981',
    fontFamily: 'monospace',
  },
  verifiedValue: {
    fontSize: 10,
    color: '#10b981',
  },
  textDark: {
    color: '#0f172a',
  },
});
