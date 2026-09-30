// app/screens/AnnouncementsScreen.tsx

import { Ionicons } from '@expo/vector-icons';
import React, {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { supabase } from '../../lib/supabase';
import { useFont } from '../FontContext';

type Language = 'si' | 'en' | 'ta';

interface Props {
  selectedLang: Language;
  onBack?: () => void;

  route?: {
    params?: {
      announcementId?: number;
      notificationId?: number;
    };
  };
}

interface Announcement {
  id: number;
  title: string;
  message: string;
  created_at: string;
  expires_at?: string | null;
  priority?: string | null;
  is_archived?: boolean | null;
}

const L = {
  si: {
    title: 'නිවේදන විස්තර',
    subtitle: 'පරිපාලනය විසින් නිකුත් කළ නිල නිවේදනය',
    back: 'ආපසු',
    published: 'නිකුත් කළ දිනය',
    expires: 'අවසන් වන දිනය',
    priority: 'ප්‍රමුඛතාව',
    active: 'ක්‍රියාකාරී',
    expired: 'කල් ඉකුත් වී ඇත',
    loading: 'නිවේදනය ලබාගනිමින්...',
    error: 'නිවේදනය ලබාගැනීමට නොහැකි විය',
    noData: 'නිවේදනය සොයාගත නොහැකි විය',
    retry: 'නැවත උත්සාහ කරන්න',
  },

  en: {
    title: 'Announcement Details',
    subtitle: 'Official announcement published by the administration',
    back: 'Back',
    published: 'Published Date',
    expires: 'Expiry Date',
    priority: 'Priority',
    active: 'Active',
    expired: 'Expired',
    loading: 'Loading announcement...',
    error: 'Unable to load the announcement',
    noData: 'Announcement could not be found',
    retry: 'Try Again',
  },

  ta: {
    title: 'அறிவிப்பு விவரங்கள்',
    subtitle: 'நிர்வாகத்தால் வெளியிடப்பட்ட அதிகாரப்பூர்வ அறிவிப்பு',
    back: 'பின்னே',
    published: 'வெளியிடப்பட்ட தேதி',
    expires: 'காலாவதி தேதி',
    priority: 'முன்னுரிமை',
    active: 'செயலில்',
    expired: 'காலாவதியானது',
    loading: 'அறிவிப்பு ஏற்றப்படுகிறது...',
    error: 'அறிவிப்பை ஏற்ற முடியவில்லை',
    noData: 'அறிவிப்பை கண்டுபிடிக்க முடியவில்லை',
    retry: 'மீண்டும் முயற்சிக்கவும்',
  },
};

export default function AnnouncementsScreen({
  selectedLang,
  onBack,
  route,
}: Props) {
  const t = L[selectedLang] ?? L.en;
  const { font } = useFont();

  const announcementId =
    route?.params?.announcementId;

  const [announcement, setAnnouncement] =
    useState<Announcement | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] =
    useState(false);

  const [errorState, setErrorState] =
    useState(false);

  const loadAnnouncement = useCallback(
    async (showLoader = true) => {
      if (showLoader) setLoading(true);

      setErrorState(false);

      if (!announcementId) {
        setAnnouncement(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('announcements')
          .select(`
            id,
            title,
            message,
            created_at,
            expires_at,
            priority,
            is_archived
          `)
          .eq('id', Number(announcementId))
          .single();

        if (error || !data) {
          console.error(
            'Announcement detail error:',
            error
          );

          setErrorState(true);
          setAnnouncement(null);
          return;
        }

        setAnnouncement(data as Announcement);
      } catch (error) {
        console.error(
          'Announcement detail exception:',
          error
        );

        setErrorState(true);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [announcementId]
  );

  useEffect(() => {
    loadAnnouncement();
  }, [loadAnnouncement]);

  const formatDate = (value?: string | null) => {
    if (!value) return '-';

    return new Date(value).toLocaleString(
      selectedLang === 'si'
        ? 'si-LK'
        : selectedLang === 'ta'
        ? 'ta-LK'
        : 'en-LK',
      {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }
    );
  };

  const expired =
    announcement?.expires_at &&
    new Date(announcement.expires_at).getTime() <
      Date.now();

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <View style={styles.headerCircle1} />
        <View style={styles.headerCircle2} />

        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
        >
          <Ionicons
            name="chevron-back"
            size={font(18)}
            color="#FFFFFF"
          />

          <Text
            style={[
              styles.backText,
              { fontSize: font(12) },
            ]}
          >
            {t.back}
          </Text>
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <View style={styles.headerIcon}>
            <Ionicons
              name="megaphone-outline"
              size={font(28)}
              color="#7A1020"
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text
              style={[
                styles.headerTitle,
                { fontSize: font(23) },
              ]}
            >
              {t.title}
            </Text>

            <Text
              style={[
                styles.headerSubtitle,
                {
                  fontSize: font(12),
                  lineHeight: font(17),
                },
              ]}
            >
              {t.subtitle}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            colors={['#7A1020']}
            onRefresh={() => {
              setRefreshing(true);
              loadAnnouncement(false);
            }}
          />
        }
      >
        {loading ? (
          <View style={styles.stateCard}>
            <ActivityIndicator
              size="large"
              color="#7A1020"
            />

            <Text style={styles.stateText}>
              {t.loading}
            </Text>
          </View>
        ) : errorState ? (
          <View style={styles.stateCard}>
            <Ionicons
              name="alert-circle-outline"
              size={38}
              color="#B91C1C"
            />

            <Text style={styles.stateText}>
              {t.error}
            </Text>

            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => loadAnnouncement()}
            >
              <Text style={styles.retryText}>
                {t.retry}
              </Text>
            </TouchableOpacity>
          </View>
        ) : !announcement ? (
          <View style={styles.stateCard}>
            <Ionicons
              name="megaphone-outline"
              size={38}
              color="#7A1020"
            />

            <Text style={styles.stateText}>
              {t.noData}
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.mainCard}>
              <View style={styles.cardAccent} />

              <View style={styles.cardTop}>
                <View style={styles.priorityBadge}>
                  <Ionicons
                    name="alert-circle-outline"
                    size={font(14)}
                    color="#C62828"
                  />

                  <Text
                    style={[
                      styles.priorityText,
                      { fontSize: font(10) },
                    ]}
                  >
                    {announcement.priority ||
                      t.priority}
                  </Text>
                </View>

                <View
                  style={
                    expired
                      ? styles.expiredBadge
                      : styles.activeBadge
                  }
                >
                  <Text
                    style={[
                      expired
                        ? styles.expiredText
                        : styles.activeText,
                      { fontSize: font(9) },
                    ]}
                  >
                    {expired ? t.expired : t.active}
                  </Text>
                </View>
              </View>

              <Text
                style={[
                  styles.announcementTitle,
                  {
                    fontSize: font(21),
                    lineHeight: font(29),
                  },
                ]}
              >
                {announcement.title}
              </Text>

              <View style={styles.messageBox}>
                <Ionicons
                  name="reader-outline"
                  size={font(23)}
                  color="#7A1020"
                />

                <Text
                  style={[
                    styles.messageText,
                    {
                      fontSize: font(13),
                      lineHeight: font(22),
                    },
                  ]}
                >
                  {announcement.message}
                </Text>
              </View>
            </View>

            <View style={styles.infoSection}>
              <View style={styles.sectionHeading}>
                <View style={styles.sectionAccent} />

                <Text
                  style={[
                    styles.sectionTitle,
                    { fontSize: font(14) },
                  ]}
                >
                  {selectedLang === 'si'
                    ? 'නිවේදන තොරතුරු'
                    : selectedLang === 'ta'
                    ? 'அறிவிப்பு தகவல்கள்'
                    : 'Announcement Information'}
                </Text>
              </View>

              <View style={styles.infoCard}>
                <InfoRow
                  icon="calendar-outline"
                  label={t.published}
                  value={formatDate(
                    announcement.created_at
                  )}
                />

                <View style={styles.divider} />

                <InfoRow
                  icon="time-outline"
                  label={t.expires}
                  value={formatDate(
                    announcement.expires_at
                  )}
                />

                <View style={styles.divider} />

                <InfoRow
                  icon="flag-outline"
                  label={t.priority}
                  value={
                    announcement.priority || '-'
                  }
                />
              </View>
            </View>
          </>
        )}

        <View style={{ height: 35 }} />
      </ScrollView>
    </View>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <Ionicons
          name={icon}
          size={18}
          color="#7A1020"
        />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.infoLabel}>
          {label}
        </Text>

        <Text style={styles.infoValue}>
          {value}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F4E8EA',
  },

  header: {
    backgroundColor: '#7A1020',
    paddingTop: 53,
    paddingHorizontal: 20,
    paddingBottom: 23,
    borderBottomLeftRadius: 34,
    borderBottomRightRadius: 34,
    overflow: 'hidden',
    elevation: 10,
  },

  headerCircle1: {
    position: 'absolute',
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: 'rgba(255,255,255,0.05)',
    right: -45,
    top: -65,
  },

  headerCircle2: {
    position: 'absolute',
    width: 105,
    height: 105,
    borderRadius: 53,
    backgroundColor: 'rgba(255,255,255,0.04)',
    left: -15,
    bottom: -35,
  },

  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    backgroundColor: '#9E1A2E',
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginBottom: 15,
  },

  backText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },

  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },

  headerIcon: {
    width: 55,
    height: 55,
    borderRadius: 18,
    backgroundColor: '#FFD54F',
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitle: {
    color: '#FFFFFF',
    fontWeight: '900',
  },

  headerSubtitle: {
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '600',
    marginTop: 4,
  },

  scroll: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },

  mainCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 21,
    padding: 17,
    borderWidth: 1,
    borderColor: '#E5EAF0',
    overflow: 'hidden',
    elevation: 4,
  },

  cardAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
    backgroundColor: '#C62828',
  },

  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FDECEC',
    borderRadius: 11,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },

  priorityText: {
    color: '#C62828',
    fontWeight: '900',
  },

  activeBadge: {
    backgroundColor: '#DCFCE7',
    borderRadius: 11,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },

  activeText: {
    color: '#166534',
    fontWeight: '900',
  },

  expiredBadge: {
    backgroundColor: '#FEE2E2',
    borderRadius: 11,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },

  expiredText: {
    color: '#B91C1C',
    fontWeight: '900',
  },

  announcementTitle: {
    color: '#172033',
    fontWeight: '900',
    marginTop: 16,
  },

  messageBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 15,
    padding: 15,
    marginTop: 15,
  },

  messageText: {
    flex: 1,
    color: '#53657A',
    fontWeight: '600',
  },

  infoSection: {
    marginTop: 19,
  },

  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 11,
  },

  sectionAccent: {
    width: 4,
    height: 18,
    borderRadius: 2,
    backgroundColor: '#7A1020',
  },

  sectionTitle: {
    color: '#1E293B',
    fontWeight: '900',
  },

  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#E5EAF0',
    elevation: 2,
  },

  infoRow: {
    minHeight: 70,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: '#F7EFF1',
    alignItems: 'center',
    justifyContent: 'center',
  },

  infoLabel: {
    color: '#94A3B8',
    fontSize: 9,
    fontWeight: '800',
  },

  infoValue: {
    color: '#334155',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 3,
  },

  divider: {
    height: 1,
    backgroundColor: '#EEF2F6',
    marginLeft: 52,
  },

  stateCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    minHeight: 250,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5EAF0',
    paddingHorizontal: 25,
  },

  stateText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 12,
  },

  retryButton: {
    backgroundColor: '#7A1020',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginTop: 14,
  },

  retryText: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
});