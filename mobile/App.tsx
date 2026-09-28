import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, I18nManager } from 'react-native';
import { KhutbahEditorScreen } from './src/screens/KhutbahEditorScreen';
import { MobileDatabase } from './src/db/Database';

// Enforce RTL layout for Arabic typography
if (!I18nManager.isRTL) {
  try {
    I18nManager.allowRTL(true);
    I18nManager.forceRTL(true);
  } catch (e) {
    console.warn('RTL force bypassed:', e);
  }
}

export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function setupMobileApp() {
      try {
        await MobileDatabase.init();
      } catch (err) {
        console.warn('Database initialization warning:', err);
      } finally {
        setIsReady(true);
      }
    }
    setupMobileApp();
  }, []);

  if (!isReady) {
    return (
      <View style={styles.splashContainer}>
        <ActivityIndicator size="large" color="#f59e0b" />
        <Text style={styles.splashText}>مِنْبَرُ الذَّكَاءِ الاصْطِنَاعِيّ</Text>
        <Text style={styles.splashSubtext}>تهيئة قواعد البيانات الموثقة محلياً...</Text>
      </View>
    );
  }

  return <KhutbahEditorScreen />;
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: '#0b0f17',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  splashText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#f59e0b',
    marginTop: 8,
  },
  splashSubtext: {
    fontSize: 12,
    color: '#94a3b8',
  },
});
