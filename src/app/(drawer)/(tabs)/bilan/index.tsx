import CustomTopBar from '@/components/customs/customTopBar';
import DaySelector from '@/components/customs/DaySelector';
import MetricCard from '@/components/ui/MetricCard';
import { Colors } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';
import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';

// Mock data for stock movements
const MOVEMENTS = [
  { id: '1', name: 'Savone Lux', morning: 150, evening: 142 },
  { id: '2', name: 'Huile Palme', morning: 45, evening: 38 },
  { id: '3', name: 'Sucre', morning: 20, evening: 8 },
];

export default function BilanScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const todayFormatted = new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(selectedDate);
  const salesCount = 14;

  return (
    <SafeAreaView style={styles.container}>
      <CustomTopBar 
        type="bilan" 
        date={todayFormatted} 
        onPressCalendar={() => setShowDatePicker(!showDatePicker)} 
      />

      {showDatePicker && (
        <Animated.View 
          entering={FadeInUp.duration(300)} 
          exiting={FadeOutUp.duration(200)}
        >
          <DaySelector 
            selectedDate={selectedDate} 
            onDateSelect={(date) => {
              setSelectedDate(date);
              setShowDatePicker(false);
            }} 
          />
        </Animated.View>
      )}

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Progress status */}
        <View style={styles.statusCard}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>Journée en cours — {salesCount} ventes enregistrées</Text>
        </View>

        {/* Financial Metrics Grid */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricsRow}>
            <MetricCard 
              label="Chiffre d'Affaires" 
              value="125 000 FCFA" 
              style={styles.metricItem}
            />
            <MetricCard 
              label="Total Dépenses" 
              value="48 000 FCFA" 
              variant="danger"
              style={styles.metricItem}
            />
          </View>
          <View style={styles.metricsRow}>
            <MetricCard 
              label="Bénéfice Net" 
              value="77 000 FCFA" 
              variant="success"
              style={styles.metricItem}
            />
            <MetricCard 
                label="Nbre de Ventes" 
                value={salesCount.toString()} 
                style={styles.metricItem}
              />
          </View>
        </View>

        {/* Stock Movements Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>MOUVEMENT DES STOCKS</Text>
        </View>

        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <Text style={[styles.columnLabel, { flex: 2 }]}>PRODUIT</Text>
            <Text style={styles.columnLabel}>MATIN</Text>
            <Text style={styles.columnLabel}>SOIR</Text>
            <Text style={styles.columnLabel}>DIFF.</Text>
          </View>

          {MOVEMENTS.map((item, index) => {
            const diff = item.evening - item.morning;
            return (
              <View key={item.id} style={[styles.tableRow, index === MOVEMENTS.length - 1 && { borderBottomWidth: 0 }]}>
                <Text style={[styles.productName, { flex: 2 }]}>{item.name}</Text>
                <Text style={styles.tableValue}>{item.morning}</Text>
                <Text style={styles.tableValue}>{item.evening}</Text>
                <Text style={[styles.diffValue, { color: diff < 0 ? Colors.danger : Colors.success }]}>
                  {diff > 0 ? `+${diff}` : diff}
                </Text>
              </View>
            );
          })}
        </View>

        <TouchableOpacity style={styles.closeBtn}>
          <Text style={styles.closeBtnText}>Clôturer la journée</Text>
        </TouchableOpacity>
        
        <Text style={styles.footerNote}>Un PDF sera généré et sauvegardé sur Drive</Text>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120, // Space for custom tab bar
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.warning,
    marginRight: 10,
  },
  statusText: {
    fontFamily: FontFamily.content,
    fontSize: 13,
    color: Colors.textPrimary,
  },
  metricsGrid: {
    marginBottom: 25,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 0,
  },
  metricItem: {
    margin: 6,
  },
  sectionHeader: {
    marginTop: 10,
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: FontFamily.utilityBold,
    fontSize: 12,
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
  tableContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    marginBottom: 30,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F9F9F9',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  columnLabel: {
    fontFamily: FontFamily.utilityBold,
    fontSize: 10,
    color: Colors.textSecondary,
    flex: 1,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    alignItems: 'center',
  },
  productName: {
    fontFamily: FontFamily.utilityBold,
    fontSize: 13,
    color: Colors.textPrimary,
  },
  tableValue: {
    fontFamily: FontFamily.content,
    fontSize: 13,
    color: Colors.textPrimary,
    flex: 1,
    textAlign: 'center',
  },
  diffValue: {
    fontFamily: FontFamily.displaySemi,
    fontSize: 13,
    flex: 1,
    textAlign: 'center',
  },
  closeBtn: {
    backgroundColor: '#000',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  closeBtnText: {
    fontFamily: FontFamily.utilityBold,
    fontSize: 16,
    color: '#fff',
  },
  footerNote: {
    fontFamily: FontFamily.content,
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
