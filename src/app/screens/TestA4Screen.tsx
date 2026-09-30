// app/screens/TestA4Screen.tsx
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export default function TestA4Screen() {
  const [showPreviewModal, setShowPreviewModal] = useState(true);

  const officerProfile = {
    name: 'Mr. Shamindu Dewranga',
    designation: 'Software Engineer',
    department: 'IT Department',
    joinedDate: '2022-05-10',
  };

  const leaveDetails = {
    leaveTypeString: 'අනියම් නිවාඩු',
    startDate: '2026-08-10',
    duration: 'දින 2',
    returningDate: '2026-08-12',
    applyDate: '2026-08-08',
  };

  const translatedReason = 'පෞද්ගලික හදිසි අවශ්‍යතාවයක් හේතුවෙන්.';
  const selectedCoverageOfficer = { name: 'Mr. Nimal Perera' };
  const leaveHistoryData = { totalLeavesThisYear: 5, lastLeaveDate: '2026-07-15' };

  const dummySignaturePath = "M 50 50 L 100 20 L 150 70 L 200 30"; 

  const testPdfGeneration = async () => {
    try {
      const signatureSvg = `<svg viewBox="0 0 350 240" style="width: 150px; height: 80px; display: block; margin-left: auto;" xmlns="http://www.w3.org/2000/svg"><path d="${dummySignaturePath}" stroke="#000" stroke-width="4.5" fill="none" stroke-linecap="round" stroke-linejoin="round" /></svg>`;

      // 🔥 1. ඔයාගේ ලෝගෝ එක HTML එකට දාන්න පුළුවන් විදිහට URI එකක් කරගැනීම
      const myLogoUri = Image.resolveAssetSource(require('../../../assets/images/ui/logo.png')).uri;
      // 🔥 2. රජයේ ලාංඡනය (National Emblem) ඔන්ලයින් PNG ලින්ක් එකකින්
      const govLogoUri = 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Emblem_of_Sri_Lanka.svg/1024px-Emblem_of_Sri_Lanka.svg.png';

      const htmlContent = `
        <html>
          <head>
            <style>
              body { font-family: 'Times New Roman', serif; padding: 40px; color: #000; line-height: 1.6; }
              .header-box { display: flex; justify-content: space-between; align-items: center; margin-bottom: 35px; }
              /* 🔥 ලෝගෝ සඳහා CSS */
              .logo-img { width: 70px; height: 70px; object-fit: contain; }
              .main-title { flex: 1; text-align: center; font-size: 22px; font-weight: bold; text-decoration: underline; }
              table { width: 100%; border-collapse: collapse; margin-top: 10px; }
              td { padding: 10px 5px; vertical-align: top; font-size: 15px; }
              .label-col { width: 45%; font-weight: bold; }
              .colon { width: 5%; text-align: center; font-weight: bold; }
              .val-col { width: 50%; border-bottom: 1px dotted #000; }
              .signature-section { margin-top: 60px; display: flex; justify-content: space-between; }
              .sign-box { text-align: center; width: 40%; float: right; }
              .sign-line { border-top: 1px dashed #000; padding-top: 5px; font-weight: bold; margin-top: 10px; }
            </style>
          </head>
          <body>
            <div class="header-box">
              <!-- 🔥 ලෝගෝ දෙක සහ මාතෘකාව -->
              <img src="${myLogoUri}" class="logo-img" />
              <div class="main-title">නිල නිවාඩු අයදුම්පත්‍රය</div>
              <img src="${govLogoUri}" class="logo-img" />
            </div>
            <table>
              <tr><td class="label-col">01. නිලධාරියාගේ නම</td><td class="colon">:</td><td class="val-col">${officerProfile.name}</td></tr>
              <tr><td class="label-col">02. දෙපාර්තමේන්තුව</td><td class="colon">:</td><td class="val-col">${officerProfile.department}</td></tr>
              <tr><td class="label-col">03. තනතුර</td><td class="colon">:</td><td class="val-col">${officerProfile.designation}</td></tr>
              <tr><td class="label-col">04. නිවාඩු වර්ගය</td><td class="colon">:</td><td class="val-col">${leaveDetails.leaveTypeString}</td></tr>
              <tr><td class="label-col">05. නිවාඩු දින ගණන</td><td class="colon">:</td><td class="val-col">${leaveDetails.duration}</td></tr>
              <tr><td class="label-col">06. ආරම්භ වන දිනය</td><td class="colon">:</td><td class="val-col">${leaveDetails.startDate}</td></tr>
              <tr><td class="label-col">07. නැවත පැමිණෙන දිනය</td><td class="colon">:</td><td class="val-col">${leaveDetails.returningDate}</td></tr>
              <tr><td class="label-col">08. නිවාඩුවට හේතුව</td><td class="colon">:</td><td class="val-col">${translatedReason}</td></tr>
              <tr><td class="label-col">09. මෙම වර්ෂයේ ගත් නිවාඩු</td><td class="colon">:</td><td class="val-col">දින ${leaveHistoryData.totalLeavesThisYear}</td></tr>
              <tr><td class="label-col">10. රාජකාරි ආවරණ නිලධාරියා</td><td class="colon">:</td><td class="val-col">${selectedCoverageOfficer.name}</td></tr>
              <tr><td class="label-col">11. පළමු පත්වීමේ දිනය</td><td class="colon">:</td><td class="val-col">${officerProfile.joinedDate}</td></tr>
              <tr><td class="label-col">12. අවසන් වරට නිවාඩු ගත් දිනය</td><td class="colon">:</td><td class="val-col">${leaveHistoryData.lastLeaveDate}</td></tr>
            </table>
            <div class="signature-section">
              <div class="sign-box">
                ${signatureSvg}
                <div class="sign-line">අයදුම්කරුගේ අත්සන</div>
                <div style="font-size: 13px; margin-top: 5px;">දිනය: ${leaveDetails.applyDate}</div>
              </div>
            </div>
          </body>
        </html>
      `;
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
      <TouchableOpacity style={{ backgroundColor: '#7A1020', padding: 20, borderRadius: 10 }} onPress={() => setShowPreviewModal(true)}>
        <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Open A4 Preview</Text>
      </TouchableOpacity>

      <Modal visible={showPreviewModal} animationType="slide" transparent={false} onRequestClose={() => setShowPreviewModal(false)}>
        <View style={styles.previewRoot}>
          <View style={styles.previewHeader}>
            <Text style={styles.previewHeaderTitle}>අයදුම්පතේ පෙරදසුන (Test)</Text>
            <TouchableOpacity onPress={() => setShowPreviewModal(false)} style={styles.previewCloseBtn}>
              <Ionicons name="close" size={24} color="#1E293B" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.previewScroll} contentContainerStyle={{ padding: 15, alignItems: 'center', paddingBottom: 100 }}>
            <View style={styles.a4Paper}>
              
              <View style={styles.a4HeaderBox}>
                 {/* 🔥 App එකේ පේන ලෝගෝ එක (ඔයාගේ ලෝගෝ එක) */}
                 <Image source={require('../../../assets/images/ui/logo.png')} style={styles.a4LogoImg} />
                 
                 <Text style={styles.a4MainTitle}>නිල නිවාඩු අයදුම්පත්‍රය</Text>
                 
                 {/* 🔥 App එකේ පේන රජයේ ලාංඡනය */}
                 <Image source={require('../../../assets/images/ui/srilankalogo.png')} style={styles.a4LogoImg} />
              </View>

              <View style={styles.a4Row}><Text style={styles.a4Label}>01. නිලධාරියාගේ නම</Text><Text style={styles.a4Value}>: {officerProfile.name}</Text></View>
              <View style={styles.a4Row}><Text style={styles.a4Label}>02. දෙපාර්තමේන්තුව</Text><Text style={styles.a4Value}>: {officerProfile.department}</Text></View>
              <View style={styles.a4Row}><Text style={styles.a4Label}>03. තනතුර</Text><Text style={styles.a4Value}>: {officerProfile.designation}</Text></View>
              <View style={styles.a4Row}><Text style={styles.a4Label}>04. නිවාඩු වර්ගය</Text><Text style={styles.a4Value}>: {leaveDetails.leaveTypeString}</Text></View>
              <View style={styles.a4Row}><Text style={styles.a4Label}>05. නිවාඩු දින ගණන</Text><Text style={styles.a4Value}>: {leaveDetails.duration}</Text></View>
              <View style={styles.a4Row}><Text style={styles.a4Label}>06. ආරම්භ වන දිනය</Text><Text style={styles.a4Value}>: {leaveDetails.startDate}</Text></View>
              <View style={styles.a4Row}><Text style={styles.a4Label}>07. නැවත පැමිණෙන දිනය</Text><Text style={styles.a4Value}>: {leaveDetails.returningDate}</Text></View>
              <View style={styles.a4Row}><Text style={styles.a4Label}>08. නිවාඩුවට හේතුව</Text><Text style={styles.a4Value}>: {translatedReason}</Text></View>
              <View style={styles.a4Row}><Text style={styles.a4Label}>09. මෙම වර්ෂයේ නිවාඩු</Text><Text style={styles.a4Value}>: දින {leaveHistoryData.totalLeavesThisYear}</Text></View>
              <View style={styles.a4Row}><Text style={styles.a4Label}>10. රාජකාරි ආවරණය</Text><Text style={styles.a4Value}>: {selectedCoverageOfficer.name}</Text></View>
              <View style={styles.a4Row}><Text style={styles.a4Label}>11. පළමු පත්වීමේ දිනය</Text><Text style={styles.a4Value}>: {officerProfile.joinedDate}</Text></View>
              <View style={styles.a4Row}><Text style={styles.a4Label}>12. අවසන් නිවාඩුව</Text><Text style={styles.a4Value}>: {leaveHistoryData.lastLeaveDate}</Text></View>

              <View style={styles.a4SignatureSection}>
                <View style={styles.a4SignatureCanvas}>
                  <Svg style={StyleSheet.absoluteFill} viewBox="0 0 350 240">
                    <Path d={dummySignaturePath} fill="none" stroke="#1E293B" strokeLinecap="round" strokeLinejoin="round" strokeWidth={4.5}/>
                  </Svg>
                </View>
                <Text style={styles.a4SignatureLine}>....................................</Text>
                <Text style={styles.a4SignatureText}>අයදුම්කරුගේ අත්සන</Text>
                <Text style={styles.a4DateText}>(දිනය: {leaveDetails.applyDate})</Text>
              </View>
            </View>
          </ScrollView>

          <View style={styles.previewFooter}>
            <TouchableOpacity style={styles.previewSubmitBtn} onPress={testPdfGeneration}>
              <Ionicons name="share-social" size={20} color="#FFF" />
              <Text style={styles.previewSubmitText}>Test PDF Generation</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  previewRoot: { flex: 1, backgroundColor: '#CBD5E1' }, 
  previewHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 15, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#94A3B8', zIndex: 10, elevation: 5 },
  previewHeaderTitle: { fontSize: 18, fontWeight: '900', color: '#1E293B' },
  previewCloseBtn: { padding: 5, backgroundColor: '#F1F5F9', borderRadius: 12 },
  previewScroll: { flex: 1, backgroundColor: '#94A3B8' }, 
  
  a4Paper: { 
    backgroundColor: '#FFFFFF', 
    padding: 25, 
    borderRadius: 2, 
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 10, elevation: 8, 
    marginBottom: 20, 
    width: '100%', 
    maxWidth: 500, 
    minHeight: 650 
  },
  
  // 🔥 ලෝගෝ දෙකට අදාළ Styles
  a4HeaderBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  a4LogoImg: { width: 60, height: 60, resizeMode: 'contain' },
  a4MainTitle: { flex: 1, fontSize: 18, fontWeight: '900', color: '#7A1020', textAlign: 'center', textDecorationLine: 'underline', paddingHorizontal: 10 },
  
  a4Row: { flexDirection: 'row', marginBottom: 12, alignItems: 'flex-start' },
  a4Label: { width: 140, fontSize: 12, fontWeight: '800', color: '#334155', lineHeight: 18 },
  a4Value: { flex: 1, fontSize: 12, fontWeight: '700', color: '#0F172A', lineHeight: 18, borderBottomWidth: 1, borderBottomColor: '#E2E8F0', paddingBottom: 2 },
  
  a4SignatureSection: { marginTop: 40, alignItems: 'flex-end', paddingRight: 10 },
  a4SignatureCanvas: { width: 110, height: 70, marginBottom: 5 },
  a4SignatureLine: { fontSize: 14, color: '#94A3B8', marginBottom: 4 },
  a4SignatureText: { fontSize: 12, fontWeight: '800', color: '#475569', marginBottom: 2, marginRight: 15 },
  a4DateText: { fontSize: 11, fontWeight: '600', color: '#64748B', marginRight: 15 },

  previewFooter: { flexDirection: 'row', padding: 20, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E2E8F0', gap: 12 },
  previewSubmitBtn: { flex: 1.5, flexDirection: 'row', paddingVertical: 15, borderRadius: 12, backgroundColor: '#15803D', alignItems: 'center', justifyContent: 'center', gap: 8 },
  previewSubmitText: { color: '#FFFFFF', fontSize: 14, fontWeight: '900' },
});