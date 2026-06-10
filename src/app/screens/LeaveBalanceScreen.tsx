// app/screens/LeaveBalanceScreen.tsx — Enhanced + Translation Fixed
// Pradeshiya Sabha Staff Management System

import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type Language = 'si' | 'en' | 'ta';

interface Props {
  selectedLang: Language;
  onNavigate: (screen: string, params?: any) => void;
  onBack?: () => void;
}

// ── All translations in one object ──────────────────────────────
const L = {
  si: {
    title:       'නිවාඩු ශේෂය',
    subtitle:    '2025 නිවාඩු සාරාංශය',
    balanceOf:   'ශේෂය',
    used:        'භාවිත',
    days:        'දින',
    selectType:  'නිවාඩු ආකාරය තෝරන්න',
    fullDay:     'සම්පූර්ණ දිනය',
    halfDay:     'අර්ධ දිනය',
    applyBtn:    'නිවාඩු අයදුම් කරන්න',
    remaining:   'ඉතිරිව ඇත',
    tapHint:     'කාඩ්පතක් ස්පර්ශ කර නිවාඩු ඉල්ලීමක් කරන්න',
    leaveTypes: [
      { id: 'casual', label: 'අනියම් නිවාඩු',    color: '#B45309', bg: '#FFF7ED', icon: 'leaf-outline',       remaining: 21, total: 21 },
      { id: 'medical', label: 'වෛද්‍ය නිවාඩු',   color: '#0F766E', bg: '#F0FDFA', icon: 'medkit-outline',    remaining: 24, total: 24 },
      { id: 'short',  label: 'කෙටි නිවාඩු',      color: '#1D4ED8', bg: '#EFF6FF', icon: 'time-outline',      remaining: 2,  total: 2  },
    ],
  },
  ta: {
    title:       'விடுமுறை இருப்பு',
    subtitle:    '2025 விடுமுறை சுருக்கம்',
    balanceOf:   'இருப்பு',
    used:        'பயன்படுத்தியது',
    days:        'நாட்கள்',
    selectType:  'விடுமுறை வகையைத் தேர்ந்தெடுக்கவும்',
    fullDay:     'முழு நாள்',
    halfDay:     'அரை நாள்',
    applyBtn:    'விடுமுறைக்கு விண்ணப்பிக்கவும்',
    remaining:   'மீதமுள்ளது',
    tapHint:     'விண்ணப்பிக்க அட்டையை தொடவும்',
    leaveTypes: [
      { id: 'casual', label: 'தற்செயல் விடுமுறை', color: '#B45309', bg: '#FFF7ED', icon: 'leaf-outline',    remaining: 21, total: 21 },
      { id: 'medical', label: 'மருத்துவ விடுமுறை', color: '#0F766E', bg: '#F0FDFA', icon: 'medkit-outline', remaining: 24, total: 24 },
      { id: 'short',  label: 'குறு விடுமுறை',      color: '#1D4ED8', bg: '#EFF6FF', icon: 'time-outline',   remaining: 2,  total: 2  },
    ],
  },
  en: {
    title:       'Leave Balance',
    subtitle:    '2025 Leave Summary',
    balanceOf:   'Balance',
    used:        'Used',
    days:        'days',
    selectType:  'Select Leave Type',
    fullDay:     'Full Day',
    halfDay:     'Half Day',
    applyBtn:    'Apply for Leave',
    remaining:   'remaining',
    tapHint:     'Tap a card to apply for that leave type',
    leaveTypes: [
      { id: 'casual', label: 'Casual Leave',  color: '#B45309', bg: '#FFF7ED', icon: 'leaf-outline',    remaining: 21, total: 21 },
      { id: 'medical', label: 'Medical Leave', color: '#0F766E', bg: '#F0FDFA', icon: 'medkit-outline', remaining: 24, total: 24 },
      { id: 'short',  label: 'Short Leave',   color: '#1D4ED8', bg: '#EFF6FF', icon: 'time-outline',    remaining: 2,  total: 2  },
    ],
  },
};

export default function LeaveBalanceScreen({ selectedLang, onNavigate, onBack }: Props) {
  const [selectedLeave, setSelectedLeave] = useState<string | null>(null);
  const [dayType, setDayType] = useState<'full' | 'half'>('full');

  // ✅ FIX: useMemo ensures text + leaveTypes re-compute whenever selectedLang changes
  const t = L[selectedLang] ?? L.en;


  const selected = t.leaveTypes.find(l => l.id === selectedLeave);

  return (
    <View style={styles.root}>

      {/* ── HEADER ───────────────────────────────────────────── */}
      <View style={styles.header}>
        <View style={styles.hCircle1} pointerEvents="none" />
        <View style={styles.hCircle2} pointerEvents="none" />

        {/* Back row */}
        {onBack && (
          <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.8}>
            <Ionicons name="chevron-back" size={18} color="#FFD54F" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.hTitle}>{t.title}</Text>
        <Text style={styles.hSubtitle}>{t.subtitle}</Text>

        {/* Total summary pill row */}
        <View style={styles.hSummaryRow}>
          {t.leaveTypes.map(l => (
            <View key={l.id} style={[styles.hPill, { backgroundColor: 'rgba(255,255,255,0.12)' }]}>
              <Text style={[styles.hPillNum, { color: '#FFD54F' }]}>{l.remaining}</Text>
              <Text style={styles.hPillLabel}>{l.label.split(' ')[0]}</Text>
            </View>
          ))}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── LEAVE BALANCE CARDS ──────────────────────────── */}
        <View style={styles.cardsRow}>
          {t.leaveTypes.map((leave) => {
            const isActive  = selectedLeave === leave.id;
            const usedCount = leave.total - leave.remaining;
            const pct       = leave.remaining / leave.total;

            return (
              <TouchableOpacity
                key={leave.id}
                activeOpacity={0.85}
                onPress={() => setSelectedLeave(isActive ? null : leave.id)}
                style={[
                  styles.card,
                  isActive && { borderColor: leave.color, borderWidth: 2 },
                ]}
              >
                {/* Active indicator dot */}
                {isActive && (
                  <View style={[styles.activeDot, { backgroundColor: leave.color }]} />
                )}

                {/* Icon box */}
                <View style={[styles.cardIconBox, { backgroundColor: leave.bg }]}>
                  <Ionicons name={leave.icon as any} size={20} color={leave.color} />
                </View>

                {/* Balance number */}
                <Text style={[styles.cardNum, { color: leave.color }]}>
                  {leave.remaining}
                </Text>
                <Text style={styles.cardDays}>{t.days}</Text>

                {/* Label */}
                <Text style={styles.cardLabel} numberOfLines={2}>
                  {leave.label}
                </Text>

                {/* Progress bar */}
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${pct * 100}%` as any, backgroundColor: leave.color },
                    ]}
                  />
                </View>

                {/* Used count */}
                <Text style={styles.cardUsed}>
                  {t.used}: {usedCount}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Hint text */}
        {!selectedLeave && (
          <View style={styles.hintRow}>
            <Ionicons name="hand-left-outline" size={14} color="#8A96A8" />
            <Text style={styles.hintText}> {t.tapHint}</Text>
          </View>
        )}

        {/* ── APPLY FORM (shown when a card is selected) ─────── */}
        {selected && (
          <View style={[styles.formCard, { borderTopColor: selected.color }]}>

            {/* Form header */}
            <View style={styles.formHeader}>
              <View style={[styles.formIconBox, { backgroundColor: selected.bg }]}>
                <Ionicons name={selected.icon as any} size={20} color={selected.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.formTitle}>{selected.label}</Text>
                <Text style={[styles.formBal, { color: selected.color }]}>
                  {selected.remaining} {t.days} {t.remaining}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedLeave(null)}>
                <Ionicons name="close-circle" size={22} color="#CBD5E0" />
              </TouchableOpacity>
            </View>

            <View style={styles.formDivider} />

            {/* Full / Half day toggle — only for casual & medical */}
            {(selected.id === 'casual' || selected.id === 'medical') && (
              <>
                <Text style={styles.formSectionLabel}>{t.selectType}</Text>
                <View style={styles.toggleRow}>
                  {[
                    { val: 'full' as const, label: t.fullDay,  icon: 'sunny-outline'  },
                    { val: 'half' as const, label: t.halfDay,  icon: 'contrast-outline' },
                  ].map(opt => {
                    const isOn = dayType === opt.val;
                    return (
                      <TouchableOpacity
                        key={opt.val}
                        activeOpacity={0.8}
                        style={[
                          styles.toggleBtn,
                          isOn && { backgroundColor: selected.color, borderColor: selected.color },
                        ]}
                        onPress={() => setDayType(opt.val)}
                      >
                        <Ionicons
                          name={opt.icon as any}
                          size={16}
                          color={isOn ? '#fff' : '#718096'}
                        />
                        <Text style={[styles.toggleText, isOn && styles.toggleTextOn]}>
                          {opt.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </>
            )}

            {/* Apply button */}
            <TouchableOpacity
              activeOpacity={0.88}
              style={[styles.applyBtn, { backgroundColor: selected.color, shadowColor: selected.color }]}
              onPress={() => onNavigate('ApplyLeave', { type: selectedLeave, dayType })}
            >
              <Ionicons name="paper-plane-outline" size={17} color="#fff" />
              <Text style={styles.applyBtnText}>{t.applyBtn}</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

// ── STYLES ────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F0F2F5' },

  // Header
  header: {
    backgroundColor: '#7A1020',
    paddingTop: 54, paddingHorizontal: 20, paddingBottom: 24,
    borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
    overflow: 'hidden',
    shadowColor: '#5A0010',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3, shadowRadius: 18, elevation: 12,
  },
  hCircle1: {
    position: 'absolute', width: 200, height: 200, borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.05)', top: -50, right: -50,
  },
  hCircle2: {
    position: 'absolute', width: 100, height: 100, borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.04)', bottom: -20, left: 20,
  },
  backBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    marginBottom: 12, alignSelf: 'flex-start',
  },
  backText: { color: '#FFD54F', fontSize: 13, fontWeight: '700' },
  hTitle: {
    fontSize: 24, fontWeight: '900', color: '#fff',
    letterSpacing: 0.3,
  },
  hSubtitle: {
    color: 'rgba(255,255,255,0.55)', fontSize: 12,
    fontWeight: '500', marginTop: 3,
  },
  hSummaryRow: {
    flexDirection: 'row', gap: 8, marginTop: 16,
  },
  hPill: {
    flex: 1, borderRadius: 12, paddingVertical: 10,
    alignItems: 'center', borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  hPillNum: { fontSize: 18, fontWeight: '900' },
  hPillLabel: { color: 'rgba(255,255,255,0.55)', fontSize: 10, fontWeight: '600', marginTop: 2 },

  // Scroll
  scroll: { paddingHorizontal: 16, paddingTop: 20 },

  // Leave cards
  cardsRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  card: {
    flex: 1, backgroundColor: '#fff', borderRadius: 18,
    padding: 14, alignItems: 'center',
    borderWidth: 1, borderColor: '#EEF0F4',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07, shadowRadius: 10, elevation: 4,
    position: 'relative',
  },
  activeDot: {
    position: 'absolute', top: 8, right: 8,
    width: 9, height: 9, borderRadius: 5,
  },
  cardIconBox: {
    width: 42, height: 42, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 10,
  },
  cardNum: { fontSize: 26, fontWeight: '900', lineHeight: 30 },
  cardDays: { fontSize: 10, color: '#8A96A8', fontWeight: '600', marginBottom: 4 },
  cardLabel: {
    fontSize: 11, fontWeight: '700', color: '#4A5568',
    textAlign: 'center', marginBottom: 10, lineHeight: 15,
  },
  progressTrack: {
    width: '80%', height: 5, backgroundColor: '#EDF2F7',
    borderRadius: 3, marginBottom: 6, overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 3 },
  cardUsed: { fontSize: 9, color: '#A0AEC0', fontWeight: '600' },

  // Hint
  hintRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', marginBottom: 24,
  },
  hintText: { color: '#8A96A8', fontSize: 12, fontWeight: '500' },

  // Form card
  formCard: {
    backgroundColor: '#fff', borderRadius: 20,
    padding: 20, marginBottom: 8,
    borderTopWidth: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.07, shadowRadius: 14, elevation: 5,
  },
  formHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  formIconBox: {
    width: 46, height: 46, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
  },
  formTitle: { fontSize: 15, fontWeight: '800', color: '#1A2940' },
  formBal:   { fontSize: 12, fontWeight: '600', marginTop: 2 },
  formDivider: { height: 1, backgroundColor: '#F0F2F5', marginVertical: 18 },
  formSectionLabel: {
    fontSize: 11, fontWeight: '700', color: '#718096',
    letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 12,
  },

  // Toggle
  toggleRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  toggleBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 6,
    paddingVertical: 13, borderRadius: 12,
    borderWidth: 1.5, borderColor: '#E2E8F0',
    backgroundColor: '#F7FAFC',
  },
  toggleText:   { color: '#718096', fontWeight: '700', fontSize: 13 },
  toggleTextOn: { color: '#fff' },

  // Apply button
  applyBtn: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 8,
    paddingVertical: 15, borderRadius: 14,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.35, shadowRadius: 10, elevation: 6,
  },
  applyBtnText: { color: '#fff', fontWeight: '800', fontSize: 15, letterSpacing: 0.4 },
});
