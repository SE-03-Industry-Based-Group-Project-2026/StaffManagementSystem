import React from 'react';
import { StyleSheet, Text, View, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props { selectedLang: string; }

export default function NotificationsScreen({ selectedLang }: Props) {
  const data = [
    { id: '1', txt: selectedLang === 'si' ? "ඔබගේ අනියම් නිවාඩු ඉල්ලීම සුපරීක්ෂක විසින් අනුමත කරන ලදී." : "Leave Request Verified Securely.", time: selectedLang === 'si' ? "මීට සුළු මොහොතකට පෙර" : "Just now" }
  ];
  return (
    <View style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
      <FlatList 
        data={data}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.notificationItemRowCard}>
            <View style={styles.notificationItemCardIconBadgeWrapper}><Ionicons name="calendar" size={16} color="#800020" /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.notificationItemCardBodyMessageText}>{item.txt}</Text>
              <Text style={styles.notificationItemCardTimestampText}>{item.time}</Text>
            </View>
          </View>
        )}
        contentContainerStyle={{ padding: 16 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  notificationItemRowCard: { flexDirection: 'row', backgroundColor: '#FFF', padding: 14, borderRadius: 8, marginBottom: 10, alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB' },
  notificationItemCardIconBadgeWrapper: { backgroundColor: '#F9F0F2', width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  notificationItemCardBodyMessageText: { fontSize: 13, color: '#333', fontWeight: '500' },
  notificationItemCardTimestampText: { fontSize: 11, color: '#888', marginTop: 4 }
});