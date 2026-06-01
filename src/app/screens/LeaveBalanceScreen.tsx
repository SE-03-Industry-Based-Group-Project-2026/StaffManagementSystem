import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

interface Props { t: any; onNavigate: (screen: any) => void; }

export default function LeaveBalanceScreen({ t, onNavigate }: Props) {
  return (
    <View style={{ flex: 1, backgroundColor: '#F8F9FA', padding: 20 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 }}>
        <View style={[styles.balanceCardBox, { borderLeftColor: '#FFBF00' }]}><Text style={styles.balCardNum}>12</Text><Text style={styles.balCardLabel}>{t.casual}</Text></View>
        <View style={[styles.balanceCardBox, { borderLeftColor: '#008080' }]}><Text style={styles.balCardNum}>19</Text><Text style={styles.balCardLabel}>{t.medical}</Text></View>
      </View>
      <View style={[styles.balanceCardBox, { width: '100%', borderLeftColor: '#800020', marginBottom: 25 }]}>
        <Text style={styles.balCardNum}>03</Text><Text style={styles.balCardLabel}>{t.duty}</Text>
      </View>
      <TouchableOpacity style={styles.blockActionBtn} onPress={() => onNavigate('ApplyLeave')}>
        <Text style={styles.blockActionBtnText}>{t.newLeave}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.secondaryTextNavigationLink} onPress={() => onNavigate('LeaveStatus')}>
        <Text style={styles.secondaryTextNavLinkText}>{t.leaveStatus}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  balanceCardBox: { backgroundColor: '#FFF', width: '48%', padding: 16, borderRadius: 8, borderLeftWidth: 4, elevation: 1 },
  balCardNum: { fontSize: 24, fontWeight: '700', color: '#333' },
  balCardLabel: { fontSize: 12, color: '#666', marginTop: 4 },
  blockActionBtn: { backgroundColor: '#800020', height: 48, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 15 },
  blockActionBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  secondaryTextNavigationLink: { marginTop: 15, height: 44, justifyContent: 'center', alignItems: 'center' },
  secondaryTextNavLinkText: { color: '#800020', fontWeight: '600', fontSize: 13 }
});