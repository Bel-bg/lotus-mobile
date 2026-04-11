import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView,
  Platform,
  StatusBar
} from 'react-native';
import { 
  Bell, 
  Menu, 
  ShoppingBag, 
  TrendingUp, 
  Package, 
  ArrowRight,
  ClipboardCheck,
  Zap,
  Coffee,
  Smartphone
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';
import MetricCard from '@/components/ui/MetricCard';
import TrialBanner from '@/components/ui/trial-banner';
import SaleRow from '@/components/ventes/SaleRow';
import CustomTopBar from '@/components/customs/customTopBar';
import { useRouter } from 'expo-router';

// Mock data for recent sales
const RECENT_SALES = [
  { id: '1', productName: 'Savon Lux', quantity: 3, timeAgo: 'il y a 10min', totalPrice: '1 500 FCFA', icon: ShoppingBag },
  { id: '2', productName: 'Huile Palme', quantity: 1, timeAgo: 'il y a 32min', totalPrice: '2 200 FCFA', icon: Coffee },
  { id: '3', productName: 'Sucre', quantity: 5, timeAgo: 'il y a 1h', totalPrice: '3 000 FCFA', icon: Package },
];

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>

      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <CustomTopBar type="home" />
      <TrialBanner
        title="Mode essai bientôt terminé"
        subtitle="Passe à Premium pour continuer à utiliser l'application."
        ctaLabel="Premium"
        onPress={() => router.push('/premium')}
        // style={styles.trialBanner}
      />

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Statistics Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statsRow}>
            <MetricCard 
              label="Chiffre d'Affaires" 
              value="125 000" 
              subValue="FCFA"
              style={styles.metricItem}
            />
            <MetricCard 
              label="Ventes du Jour" 
              value="14" 
              subValue="unités"
              style={styles.metricItem}
            />
          </View>
          <View style={styles.statsRow}>
            <MetricCard 
              label="Bénéfice Estimé" 
              value="48 200" 
              subValue="FCFA"
              variant="success"
              style={styles.metricItem}
            />
            <MetricCard 
              label="Ce Mois" 
              value="+12%" 
              subValue="vs dernier mois"
              trend={{ value: "+12% vs dernier mois", isPositive: true }}
              footer={<View style={styles.progressBar}><View style={styles.progressFill} /></View>}
              style={styles.metricItem}
            />
          </View>
        </View>

        {/* Recent Sales Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>DERNIÈRES VENTES</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>Voir tout</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.salesList}>
          {RECENT_SALES.map(sale => (
            <SaleRow key={sale.id} {...sale} />
          ))}
        </View>

        {/* Stock Analysis Banner */}
        <TouchableOpacity style={styles.analysisBanner}>
          <View style={styles.analysisContent}>
            <Text style={styles.analysisTitle}>Analyse de Stock</Text>
            <Text style={styles.analysisDescription}>
              3 articles sont presque épuisés. Réapprovisionnez maintenant.
            </Text>
            <TouchableOpacity style={styles.detailsBtn}>
              <Text style={styles.detailsBtnText}>DÉTAILS</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.analysisIconContainer}>
            <ClipboardCheck size={40} color="rgba(255,255,255,0.2)" />
          </View>
        </TouchableOpacity>
        
        <View style={styles.footerSpacing} />
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
    paddingBottom: 110, // Space for custom tab bar
  },
  trialBanner: {
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 4,
  },
  statsGrid: {
    marginTop: 10,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  metricItem: {
    flex: 1,
    margin: 6,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#F0F0F0',
    borderRadius: 2,
    width: '100%',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#000',
    width: '60%',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontFamily: FontFamily.utilityBold,
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
  seeAll: {
    fontFamily: FontFamily.utility,
    fontSize: 12,
    color: Colors.textSecondary,
    textDecorationLine: 'underline',
  },
  salesList: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 5,
    marginBottom: 30,
  },
  analysisBanner: {
    backgroundColor: '#0A0A0A',
    borderRadius: 24,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  analysisContent: {
    flex: 1,
    zIndex: 1,
  },
  analysisTitle: {
    fontFamily: FontFamily.displaySemi,
    fontSize: 20,
    color: '#fff',
    marginBottom: 8,
  },
  analysisDescription: {
    fontFamily: FontFamily.content,
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 20,
    lineHeight: 18,
  },
  detailsBtn: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  detailsBtnText: {
    fontFamily: FontFamily.utilityBold,
    fontSize: 11,
    color: '#000',
    letterSpacing: 0.5,
  },
  analysisIconContainer: {
    position: 'absolute',
    right: 20,
    bottom: -10,
    opacity: 0.5,
  },
  footerSpacing: {
    height: 40,
  },
});
