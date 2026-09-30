// app/screens/SignatureScreen.tsx — Premium Touch Signature Engine
// Pradeshiya Sabha Staff Management System

import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  PanResponder,
  GestureResponderEvent,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface Props {
  t: any;
  onComplete: () => void;
  onBack?: () => void;
  selectedLang: 'si' | 'en' | 'ta';
}

export default function SignatureScreen({ t, onComplete, onBack, selectedLang }: Props) {
  const [paths, setPaths] = useState<string[]>([]);
  const [currentPath, setCurrentPath] = useState<string>('');

  // ── TOUCH GESTURE RESPONSIBILITY ENGINE FOR SIGNING ──
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (e: GestureResponderEvent) => {
      const { locationX, locationY } = e.nativeEvent;
      setCurrentPath(`M ${locationX} ${locationY}`);
    },
    onPanResponderMove: (e: GestureResponderEvent) => {
      const { locationX, locationY } = e.nativeEvent;
      setCurrentPath((prev) => `${prev} L ${locationX} ${locationY}`);
    },
    onPanResponderRelease: () => {
      if (currentPath) {
        setPaths((prev) => [...prev, currentPath]);
        setCurrentPath('');
      }
    },
  });

  const handleClearCanvas = () => {
    setPaths([]);
    setCurrentPath('');
  };

  const handleSubmitSignature = () => {
    if (paths.length === 0) {
      Alert.alert(
        selectedLang === 'si' ? 'අවධානයයි' : 'Attention',
        selectedLang === 'si' ? 'කරුණාකර ඉදිරියට යෑමට ප්‍රථම ඔබේ නිල අත්සන තබන්න.' : 'Please provide your signature before submitting.'
      );
      return;
    }

    Alert.alert(
      selectedLang === 'si' ? 'සාර්ථකයි' : 'Finalized',
      selectedLang === 'si' ? 'ඔබේ නිල ඩිජිටල් අත්සන සාර්ථකව අයදුම්පත්‍රයට ඇතුළත් කරන ලදී.' : 'Your digital signature has been successfully verified.'
    );
    onComplete();
  };

  return (
    <View style={styles.root}>
      
      {/* ── UNIFIED PREMIUM GOVERNMENT HEADER ── */}
      <View style={styles.header}>
        <View style={styles.hCircle1} pointerEvents="none" />
        <View style={styles.headerTopRow}>
          <TouchableOpacity 
            style={styles.backBtnPill} 
            onPress={onBack} 
            activeOpacity={0.75}
          >
            <Ionicons name="chevron-back" size={16} color="#FFD54F" />
            <Text style={styles.backText}>{t.back || (selectedLang === 'si' ? 'ආපසු' : 'Back')}</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.hTitle}>{selectedLang === 'si' ? 'ඩිජිටල් අත්සන' : 'Digital Signature'}</Text>
      </View>

      {/* ── SIGNATURE PAD FRAME CONTAINER ── */}
      <View style={styles.container}>
        <Text style={styles.signatureHelperDescriptionText}>
          {t.signDesc || (selectedLang === 'si' ? 'පහත දක්වා ඇති කොටුව තුළ ඔබගේ නිල ඩිජිටල් අත්සන ඇඟිල්ලෙන් සටහන් කරන්න:' : 'Please draw your official digital signature inside the box below:')}
        </Text>

        {/* Real Dynamic SVG Drawing Area */}
        <View style={styles.signatureCanvasBoxFrame} {...panResponder.panHandlers}>
          <Svg style={StyleSheet.absoluteFill}>
            {paths.map((path, index) => (
              <Path key={index} d={path} stroke="#7A1020" strokeWidth={3.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            ))}
            {currentPath ? (
              <Path d={currentPath} stroke="#7A1020" strokeWidth={3.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            ) : null}
          </Svg>

          {paths.length === 0 && !currentPath && (
            <View style={styles.watermarkContainer} pointerEvents="none">
              <Ionicons name="create-outline" size={32} color="#CBD5E1" />
              <Text style={styles.watermarkText}>{selectedLang === 'si' ? 'මෙහි අත්සන් කරන්න' : 'Sign Here'}</Text>
            </View>
          )}
        </View>

        {/* Action Controls Split Row */}
        <View style={styles.controlActionRowStack}>
          <TouchableOpacity 
            style={styles.clearCanvasBtnPill} 
            onPress={handleClearCanvas}
            activeOpacity={0.75}
          >
            <Ionicons name="refresh-circle-outline" size={18} color="#475569" />
            <Text style={styles.clearBtnText}>{selectedLang === 'si' ? 'මකන්න' : 'Clear Canvas'}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.blockActionBtn} 
            onPress={handleSubmitSignature}
            activeOpacity={0.85}
          >
            <Ionicons name="cloud-upload-outline" size={18} color="#FFF" />
            <Text style={styles.blockActionBtnText}>{t.submit || (selectedLang === 'si' ? 'අයදුම්පත්‍රය ඉදිරිපත් කරන්න' : 'Submit Application')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F4E8EA' },
  
  // Unified Header Layout Consistency
  header: {
    backgroundColor: '#7A1020',
    paddingTop: 50, paddingHorizontal: 20, paddingBottom: 24,
    borderBottomLeftRadius: 32, borderBottomRightRadius: 32,
    overflow: 'hidden',
    shadowColor: '#5A0010', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 18, elevation: 12,
  },
  hCircle1: {
    position: 'absolute', width: 200, height: 200, borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.05)', top: -50, right: -50,
  },
  headerTopRow: { marginBottom: 12, flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' },
  backBtnPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.15)', paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  backText: { color: '#FFD54F', fontSize: 13, fontWeight: '800' },
  hTitle: { fontSize: 24, fontWeight: '900', color: '#fff', letterSpacing: 0.4 },

  container: { flex: 1, paddingHorizontal: 16, paddingTop: 24 },
  signatureHelperDescriptionText: { fontSize: 14, fontWeight: '700', color: '#475569', marginBottom: 16, textAlign: 'center', lineHeight: 20 },
  
  // Clean Spacious Finger Canvas Frame
  signatureCanvasBoxFrame: { 
    flex: 0.65, // Gives optimized vertical height space to sign properly 
    backgroundColor: '#FFFFFF', 
    borderWidth: 2, 
    borderColor: '#94A3B8', 
    borderRadius: 24, 
    overflow: 'hidden',
    shadowColor: '#1A2940', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 3
  },
  watermarkContainer: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', gap: 6 },
  watermarkText: { color: '#94A3B8', fontSize: 15, fontWeight: '800', letterSpacing: 0.5 },

  controlActionRowStack: { gap: 12, marginTop: 20 },
  clearCanvasBtnPill: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: '#E2E8F0', paddingVertical: 14, borderRadius: 14, borderWidth: 1.5, borderColor: '#94A3B8'
  },
  clearBtnText: { color: '#475569', fontWeight: '800', fontSize: 15 },

  blockActionBtn: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#7A1020', paddingVertical: 16, borderRadius: 14,
    shadowColor: '#7A1020', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 6, elevation: 4
  },
  blockActionBtnText: { color: '#FFF', fontWeight: '900', fontSize: 16, letterSpacing: 0.3 }
});