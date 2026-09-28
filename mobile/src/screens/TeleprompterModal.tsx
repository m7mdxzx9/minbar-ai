import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  StatusBar,
  Dimensions
} from 'react-native';
import {
  Play,
  Pause,
  RotateCcw,
  X,
  ZoomIn,
  ZoomOut,
  ChevronUp,
  ChevronDown
} from 'lucide-react-native';
import { KhutbahSermon } from '../types/khutbah';

interface TeleprompterModalProps {
  sermon: KhutbahSermon;
  isOpen: boolean;
  onClose: () => void;
}

export const TeleprompterModal: React.FC<TeleprompterModalProps> = ({
  sermon,
  isOpen,
  onClose,
}) => {
  const [fontSize, setFontSize] = useState<number>(26);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [scrollSpeed, setScrollSpeed] = useState<number>(1);
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);
  const scrollRef = useRef<ScrollView>(null);
  const scrollOffset = useRef<number>(0);

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

  // Smooth autoscroll
  useEffect(() => {
    let scrollTimer: NodeJS.Timeout;
    if (isOpen && isPlaying) {
      scrollTimer = setInterval(() => {
        if (scrollRef.current) {
          scrollOffset.current += scrollSpeed * 1.5;
          scrollRef.current.scrollTo({ y: scrollOffset.current, animated: true });
        }
      }, 100);
    }
    return () => clearInterval(scrollTimer);
  }, [isOpen, isPlaying, scrollSpeed]);

  if (!isOpen) return null;

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const targetMinutes = sermon.estimated_delivery_minutes || 15;

  return (
    <Modal visible={isOpen} animationType="slide" statusBarTranslucent>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#070a0f" />

        {/* Top Floating Control Bar */}
        <View style={styles.topControlBar}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <X size={20} color="#cbd5e1" />
          </TouchableOpacity>

          {/* Stopwatch */}
          <View style={styles.timerPill}>
            <Text style={styles.timerText}>{formatTimer(secondsElapsed)}</Text>
            <Text style={styles.timerTarget}>/ ~{targetMinutes} د</Text>
          </View>

          {/* Play/Pause Button */}
          <TouchableOpacity
            style={[styles.playBtn, isPlaying ? styles.playBtnActive : styles.playBtnIdle]}
            onPress={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? <Pause size={16} color="#070a0f" /> : <Play size={16} color="#070a0f" />}
            <Text style={styles.playBtnText}>{isPlaying ? 'إيقاف' : 'تمرير'}</Text>
          </TouchableOpacity>

          {/* Font Zoom Controls */}
          <View style={styles.zoomControls}>
            <TouchableOpacity onPress={() => setFontSize(Math.max(20, fontSize - 2))} style={styles.zoomBtn}>
              <ZoomOut size={16} color="#94a3b8" />
            </TouchableOpacity>
            <Text style={styles.zoomVal}>{fontSize}</Text>
            <TouchableOpacity onPress={() => setFontSize(Math.min(42, fontSize + 2))} style={styles.zoomBtn}>
              <ZoomIn size={16} color="#94a3b8" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Prompter Scrolling Canvas */}
        <ScrollView
          ref={scrollRef}
          style={styles.prompterScroll}
          contentContainerStyle={styles.prompterContent}
          onScroll={e => {
            scrollOffset.current = e.nativeEvent.contentOffset.y;
          }}
          scrollEventThrottle={16}
        >
          {/* Header Title */}
          <View style={styles.sermonHeaderBox}>
            <Text style={styles.headerTitle}>{sermon.title}</Text>
            <Text style={styles.creedLabel}>{sermon.theological_creed} (موثق)</Text>
          </View>

          {/* Blocks */}
          {sermon.blocks.map(block => (
            <View key={block.id} style={styles.blockSection}>
              <View style={styles.sectionHeaderRow}>
                <View style={styles.accentBar} />
                <Text style={styles.sectionTitle}>{block.title_ar}</Text>
              </View>

              <Text
                style={[
                  styles.sermonText,
                  { fontSize, lineHeight: fontSize * 2.1 },
                  block.citation_source_type === 'quran' && styles.quranColor,
                  block.citation_source_type === 'hadith' && styles.hadithColor,
                ]}
              >
                {block.content_ar}
              </Text>
            </View>
          ))}

          <View style={styles.footerNote}>
            <Text style={styles.footerText}>— تمت الخطبة المباركة بحمد الله وتوفيقه —</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070a0f',
  },
  topControlBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#0d131d',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  closeBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#1e293b',
  },
  timerPill: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#172033',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  timerText: {
    fontFamily: 'monospace',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f59e0b',
  },
  timerTarget: {
    fontSize: 11,
    color: '#94a3b8',
  },
  playBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
  },
  playBtnActive: {
    backgroundColor: '#e2e8f0',
  },
  playBtnIdle: {
    backgroundColor: '#f59e0b',
  },
  playBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#070a0f',
  },
  zoomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#172033',
    borderRadius: 8,
    paddingHorizontal: 4,
  },
  zoomBtn: {
    padding: 6,
  },
  zoomVal: {
    fontSize: 11,
    color: '#e2e8f0',
    fontWeight: 'bold',
    minWidth: 20,
    textAlign: 'center',
  },
  prompterScroll: {
    flex: 1,
  },
  prompterContent: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 160,
    gap: 32,
  },
  sermonHeaderBox: {
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    paddingBottom: 20,
    gap: 6,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fef3c7',
    textAlign: 'center',
    lineHeight: 36,
  },
  creedLabel: {
    fontSize: 12,
    color: '#10b981',
  },
  blockSection: {
    gap: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
  },
  accentBar: {
    width: 4,
    height: 18,
    backgroundColor: '#d97706',
    borderRadius: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#f59e0b',
    textAlign: 'right',
  },
  sermonText: {
    textAlign: 'right',
    color: '#f8fafc',
    letterSpacing: 0.5,
  },
  quranColor: {
    color: '#fef3c7',
  },
  hadithColor: {
    color: '#e2e8f0',
  },
  footerNote: {
    paddingVertical: 50,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#64748b',
  },
});
