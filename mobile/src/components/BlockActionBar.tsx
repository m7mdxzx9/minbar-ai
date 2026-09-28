import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Flame, RefreshCw, Maximize2, Minimize2, ArrowUp, ArrowDown, Trash2 } from 'lucide-react-native';
import { BlockType } from '../types/khutbah';

interface BlockActionBarProps {
  blockType: BlockType;
  onTransform: (action: 'make_solemn' | 'replace_hadith' | 'elaborate' | 'shorten') => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onDelete?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
}

export const BlockActionBar: React.FC<BlockActionBarProps> = ({
  blockType,
  onTransform,
  onMoveUp,
  onMoveDown,
  onDelete,
  isFirst,
  isLast,
}) => {
  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Make Solemn */}
        <TouchableOpacity style={styles.actionBtn} onPress={() => onTransform('make_solemn')}>
          <Flame size={14} color="#f59e0b" />
          <Text style={styles.btnText}>تغليظ الموعظة</Text>
        </TouchableOpacity>

        {/* Replace Hadith */}
        {(blockType === 'hadith_citation' || blockType === 'thematic_exposition') && (
          <TouchableOpacity style={styles.actionBtn} onPress={() => onTransform('replace_hadith')}>
            <RefreshCw size={14} color="#10b981" />
            <Text style={styles.btnText}>استبدال بحديث صحيح</Text>
          </TouchableOpacity>
        )}

        {/* Elaborate */}
        <TouchableOpacity style={styles.actionBtn} onPress={() => onTransform('elaborate')}>
          <Maximize2 size={14} color="#38bdf8" />
          <Text style={styles.btnText}>إطالة الشرح</Text>
        </TouchableOpacity>

        {/* Shorten */}
        <TouchableOpacity style={styles.actionBtn} onPress={() => onTransform('shorten')}>
          <Minimize2 size={14} color="#94a3b8" />
          <Text style={styles.btnText}>اختصار</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        {/* Move Up */}
        {onMoveUp && !isFirst && (
          <TouchableOpacity style={styles.iconBtn} onPress={onMoveUp}>
            <ArrowUp size={14} color="#cbd5e1" />
          </TouchableOpacity>
        )}

        {/* Move Down */}
        {onMoveDown && !isLast && (
          <TouchableOpacity style={styles.iconBtn} onPress={onMoveDown}>
            <ArrowDown size={14} color="#cbd5e1" />
          </TouchableOpacity>
        )}

        {/* Delete */}
        {onDelete && (
          <TouchableOpacity style={styles.deleteBtn} onPress={onDelete}>
            <Trash2 size={14} color="#f87171" />
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#334155',
    marginTop: 8,
  },
  scrollContent: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
  },
  actionBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#1e293b',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  btnText: {
    fontSize: 11,
    color: '#e2e8f0',
    fontWeight: '500',
  },
  divider: {
    width: 1,
    height: 16,
    backgroundColor: '#334155',
    marginHorizontal: 4,
  },
  iconBtn: {
    padding: 6,
    backgroundColor: '#1e293b',
    borderRadius: 8,
  },
  deleteBtn: {
    padding: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 8,
  },
});
