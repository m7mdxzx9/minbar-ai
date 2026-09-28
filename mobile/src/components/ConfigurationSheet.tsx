import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  SafeAreaView
} from 'react-native';
import { Sliders, X, Sparkles, Clock, BookOpen, Layers } from 'lucide-react-native';
import { KhutbahParams, SermonType } from '../types/khutbah';

interface ConfigurationSheetProps {
  visible: boolean;
  onClose: () => void;
  onGenerate: (params: KhutbahParams) => void;
  isLoading?: boolean;
}

const QUICK_THEMES = [
  'الصبر عند الشدائد وتفويض الأمر لله',
  'الأخوة في الله وحفظ حقوق المسلمين',
  'بر الوالدين وصلة الأرحام',
  'إخلاص النية ومراقبة الله في السر والعلن',
  'التوبة النصوح وفضل الاستغفار',
  'خطر آفات اللسان ومظالم العباد',
];

export const ConfigurationSheet: React.FC<ConfigurationSheetProps> = ({
  visible,
  onClose,
  onGenerate,
  isLoading = false,
}) => {
  const [theme, setTheme] = useState('الصبر عند الشدائد وتفويض الأمر لله');
  const [sermonType, setSermonType] = useState<SermonType>('jumuah');
  const [duration, setDuration] = useState<number>(15);
  const [audience, setAudience] = useState('جمهور عام متنوع من المصلين والأسر');
  const [tone, setTone] = useState('موعظة ترقق القلوب وتجمع بين الرجاء والرهبة');
  const [quranCount, setQuranCount] = useState<number>(2);
  const [hadithCount, setHadithCount] = useState<number>(2);
  const [poetryCount, setPoetryCount] = useState<number>(1);

  const handleGenerate = () => {
    onGenerate({
      theme,
      sermon_type: sermonType,
      target_duration_minutes: duration,
      audience_profile: audience,
      tone,
      quran_count: quranCount,
      hadith_count: hadithCount,
      poetry_count: poetryCount,
    });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <SafeAreaView style={styles.overlay}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color="#94a3b8" />
            </TouchableOpacity>
            <View style={styles.titleRow}>
              <Sliders size={18} color="#d97706" />
              <Text style={styles.titleText}>محددات الخطبة المنبرية</Text>
            </View>
          </View>

          <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
            {/* Theme Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>موضوع الخطبة ومقصدها الشرعي:</Text>
              <TextInput
                style={styles.textInput}
                value={theme}
                onChangeText={setTheme}
                placeholder="اكتب موضوع الخطبة..."
                placeholderTextColor="#64748b"
                textAlign="right"
                multiline
              />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
                {QUICK_THEMES.map((t, idx) => (
                  <TouchableOpacity key={idx} style={styles.chip} onPress={() => setTheme(t)}>
                    <Text style={styles.chipText}>{t.substring(0, 22)}...</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Target Duration */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.durationValue}>{duration} دقيقة</Text>
                <Text style={styles.label}>المدة المستهدفة للإلقاء:</Text>
              </View>
              <View style={styles.durationSelector}>
                {[10, 15, 20, 25].map(d => (
                  <TouchableOpacity
                    key={d}
                    style={[styles.durationBtn, duration === d && styles.durationBtnActive]}
                    onPress={() => setDuration(d)}
                  >
                    <Text style={[styles.durationText, duration === d && styles.durationTextActive]}>
                      {d} د
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.pacingHint}>
                المتوقع: ~{duration * 95} كلمة وفق هدي النبي ﷺ في الإلقاء المتأني (95 ك/د)
              </Text>
            </View>

            {/* Citation Quotas */}
            <View style={styles.quotaBox}>
              <Text style={styles.quotaTitle}>توزيع الشواهد الشرعية الموثقة:</Text>

              {/* Quran */}
              <View style={styles.quotaRow}>
                <View style={styles.counterRow}>
                  <TouchableOpacity
                    onPress={() => setQuranCount(Math.max(1, quranCount - 1))}
                    style={styles.stepBtn}
                  >
                    <Text style={styles.stepBtnText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.counterValue}>{quranCount}</Text>
                  <TouchableOpacity
                    onPress={() => setQuranCount(Math.min(4, quranCount + 1))}
                    style={styles.stepBtn}
                  >
                    <Text style={styles.stepBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.quotaLabel}>الآيات القرآنية (رسم عثماني):</Text>
              </View>

              {/* Hadith */}
              <View style={styles.quotaRow}>
                <View style={styles.counterRow}>
                  <TouchableOpacity
                    onPress={() => setHadithCount(Math.max(1, hadithCount - 1))}
                    style={styles.stepBtn}
                  >
                    <Text style={styles.stepBtnText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.counterValue}>{hadithCount}</Text>
                  <TouchableOpacity
                    onPress={() => setHadithCount(Math.min(4, hadithCount + 1))}
                    style={styles.stepBtn}
                  >
                    <Text style={styles.stepBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.quotaLabel}>الأحاديث النبوية (صحيح وحسن):</Text>
              </View>

              {/* Poetry */}
              <View style={styles.quotaRow}>
                <View style={styles.counterRow}>
                  <TouchableOpacity
                    onPress={() => setPoetryCount(Math.max(0, poetryCount - 1))}
                    style={styles.stepBtn}
                  >
                    <Text style={styles.stepBtnText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.counterValue}>{poetryCount}</Text>
                  <TouchableOpacity
                    onPress={() => setPoetryCount(Math.min(3, poetryCount + 1))}
                    style={styles.stepBtn}
                  >
                    <Text style={styles.stepBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.quotaLabel}>الشواهد الشعرية (بحور الخليل):</Text>
              </View>
            </View>
          </ScrollView>

          {/* Action Button */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.generateBtn} onPress={handleGenerate} disabled={isLoading}>
              <Sparkles size={18} color="#0b0f17" />
              <Text style={styles.generateBtnText}>
                {isLoading ? 'جارٍ التأصيل والتحقق...' : 'صياغة الخطبة الموثقة محلياً'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#0b0f17',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    borderWidth: 1,
    borderColor: '#334155',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  titleRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
  },
  titleText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fef3c7',
  },
  closeBtn: {
    padding: 4,
  },
  scrollArea: {
    maxHeight: 460,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  inputGroup: {
    gap: 6,
  },
  labelRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 13,
    color: '#cbd5e1',
    fontWeight: '600',
    textAlign: 'right',
  },
  durationValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#f59e0b',
  },
  textInput: {
    backgroundColor: '#151c28',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#334155',
    color: '#f8fafc',
    fontSize: 14,
    lineHeight: 22,
  },
  chipsRow: {
    flexDirection: 'row-reverse',
    gap: 6,
    marginTop: 6,
  },
  chip: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  chipText: {
    fontSize: 11,
    color: '#cbd5e1',
  },
  durationSelector: {
    flexDirection: 'row-reverse',
    gap: 8,
  },
  durationBtn: {
    flex: 1,
    backgroundColor: '#151c28',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
  },
  durationBtnActive: {
    backgroundColor: '#d97706',
    borderColor: '#f59e0b',
  },
  durationText: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '600',
  },
  durationTextActive: {
    color: '#0b0f17',
    fontWeight: 'bold',
  },
  pacingHint: {
    fontSize: 10,
    color: '#94a3b8',
    textAlign: 'right',
    marginTop: 2,
  },
  quotaBox: {
    backgroundColor: '#121824',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
    gap: 12,
  },
  quotaTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fef3c7',
    textAlign: 'right',
  },
  quotaRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quotaLabel: {
    fontSize: 12,
    color: '#cbd5e1',
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepBtnText: {
    fontSize: 16,
    color: '#f8fafc',
    fontWeight: 'bold',
  },
  counterValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#f59e0b',
    width: 16,
    textAlign: 'center',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
  },
  generateBtn: {
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f59e0b',
    paddingVertical: 14,
    borderRadius: 14,
  },
  generateBtnText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0b0f17',
  },
});
