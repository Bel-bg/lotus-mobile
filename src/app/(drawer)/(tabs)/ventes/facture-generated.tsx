import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { FileText, Printer, CheckCircle, X, Share2, Cloud } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function FactureGeneratedScreen() {
  const router = useRouter();
  const { id, total } = useLocalSearchParams();

  const formattedTotal = total 
    ? Number(total).toLocaleString('fr-FR') + ' FCFA'
    : '0 FCFA';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/(drawer)/(tabs)')} style={styles.closeButton}>
          <X size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>BoutiqueApp</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <View style={styles.iconBg}>
            <FileText size={50} color={Colors.textPrimary} strokeWidth={1.5} />
            <View style={styles.checkBadge}>
              <CheckCircle size={20} color={Colors.success} fill="#fff" />
            </View>
          </View>
        </View>

        <Text style={styles.successTitle}>Facture générée</Text>
        <Text style={styles.description}>
          La facture est prête pour l'impression{"\n"}ou le partage.
        </Text>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.primaryBtn}>
            <Printer size={20} color="#fff" style={styles.btnIcon} />
            <Text style={styles.primaryBtnText}>Imprimer la facture</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryBtn}
            onPress={() => router.replace('/(drawer)/(tabs)')}
          >
            <Text style={styles.secondaryBtnText}>Fermer</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.backupStatus}>
          <Cloud size={16} color={Colors.textSecondary} />
          <Text style={styles.backupText}>Sauvegardé dans votre dossier Google Drive</Text>
        </View>
      </View>

      <View style={styles.previewCard}>
        <View style={styles.previewHeader}>
          <View>
            <Text style={styles.previewLabel}>FACTURE NO.</Text>
            <Text style={styles.previewId}>{id || '---'}</Text>
          </View>
          <View style={styles.fileIcon}>
            <FileText size={20} color="#FFF" />
          </View>
        </View>
        <View style={styles.previewFooter}>
          <Text style={styles.totalLabel}>Total TTC</Text>
          <Text style={styles.totalValue}>{formattedTotal}</Text>
        </View>
      </View>
      
      <View style={styles.footerSpacing} />
    </SafeAreaView>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: 18,
    color: Colors.textPrimary,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  iconContainer: {
    marginBottom: 20,
  },
  iconBg: {
    width: 120,
    height: 120,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  checkBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
  },
  successTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 24,
    color: Colors.textPrimary,
    marginBottom: 10,
  },
  description: {
    fontFamily: FontFamily.medium,
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 40,
  },
  actions: {
    width: '100%',
    marginBottom: 30,
  },
  primaryBtn: {
    backgroundColor: '#000',
    width: '100%',
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  btnIcon: {
    marginRight: 10,
  },
  primaryBtnText: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
    color: '#fff',
  },
  secondaryBtn: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  secondaryBtnText: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  backupStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backupText: {
    fontFamily: FontFamily.medium,
    fontSize: 11,
    color: Colors.textSecondary,
    marginLeft: 8,
  },
  previewCard: {
    marginHorizontal: 30,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  previewLabel: {
    fontFamily: FontFamily.bold,
    fontSize: 9,
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
  previewId: {
    fontFamily: FontFamily.bold,
    fontSize: 15,
    color: Colors.textPrimary,
    marginTop: 4,
  },
  fileIcon: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  totalLabel: {
    fontFamily: FontFamily.medium,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  totalValue: {
    fontFamily: FontFamily.bold,
    fontSize: 20,
    color: Colors.textPrimary,
  },
  footerSpacing: {
    height: 20,
  },
});

import { Platform } from 'react-native';
