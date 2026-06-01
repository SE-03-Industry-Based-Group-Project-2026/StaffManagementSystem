import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props { t: any; selectedLang: string; }

export default function AnnouncementsScreen({ t, selectedLang }: Props) {
  return (
    <View style={{ flex: 1, backgroundColor: '#F8F9FA', padding: 20 }}>
      <View style={styles.announcementCardBoxBordered}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
          <Ionicons name="megaphone" size={18} color="#800020" />
          <Text style={styles.announcementCardBoxTitleText}>{selectedLang === 'si' ? "මාසික ප්‍රගති වාර්තා කැඳවීම" : "Monthly Progress Reports"}</Text>
        </View>
        <Text style={styles.announcementCardBoxBodyDescriptionText}>
          {selectedLang === 'si' ? "සියලුම අංශ ප්‍රධානීන් සහ සේවකයින් මැයි මාසයට අදාළ ප්‍රගති වාර්තා එළඹෙන සිකුරාදාට පෙර කාර්යාලයට භාර දිය යුතුය." : "Please submit progress report logs to main counter desk before Friday close windows."}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  announcementCardBoxBordered: { backgroundColor: '#FFF', padding: 16, borderRadius: 10, borderWidth: 1, borderColor: '#E5E7EB' },
  announcementCardBoxTitleText: { fontSize: 14, fontWeight: '700', color: '#800020', marginLeft: 6 },
  announcementCardBoxBodyDescriptionText: { fontSize: 12, color: '#444', lineHeight: 18 }
});