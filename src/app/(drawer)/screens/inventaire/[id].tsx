import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Edit2, Package, Tag, ChartBar, LayoutGrid, Beaker } from 'lucide-react-native';
import { initDB } from '@/lib/db/schema';
import { Colors as ThemeColors } from '@/constants/colors';
import React from 'react';

const colors = {
  background: '#FAFAFA',
  surface: '#FFFFFF',
  border: '#EAEAEA',
  textPrimary: '#0A0A0A',
  textSecondary: '#6B6B6B',
  primary: '#0A0A0A',
  success: '#16A34A',
  successLight: '#F0FDF4',
  warning: '#D97706',
  danger: '#DC2626',
  dangerLight: '#FEF2F2',
};

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [produit, setProduit] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchProduit = async () => {
      try {
        const db = await initDB();
        // Since useLocalSearchParams can return string | string[], we ensure it's a string
        const productId = Array.isArray(id) ? id[0] : id;
        
        const data = await db.getFirstAsync<any>(
          "SELECT * FROM produits WHERE id = ?",
          [productId]
        );
        setProduit(data);
      } catch (error) {
        console.error("Error fetching product details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProduit();
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}><Text>Chargement...</Text></View>
      </SafeAreaView>
    );
  }

  if (!produit) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
        <View style={styles.center}>
          <Text style={styles.errorText}>Produit introuvable</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isAlert = produit.stock_actuel <= produit.stock_min;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Fiche Produit</Text>
        <TouchableOpacity style={styles.editButton}>
          <Edit2 size={20} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Entête du Produit */}
        <View style={styles.productHeader}>
          <View style={styles.productIconBox}>
            <Package size={40} color={colors.textSecondary} />
          </View>
          <Text style={styles.productTitle}>{produit.nom}</Text>
          <View style={styles.badgeRow}>
            <View style={styles.catBadge}>
              <Text style={styles.catBadgeText}>{produit.categorie}</Text>
            </View>
            <View style={[styles.stockBadge, isAlert ? styles.stockBadgeAlert : styles.stockBadgeOk]}>
              <Text style={[styles.stockBadgeText, isAlert ? styles.stockBadgeTextAlert : styles.stockBadgeTextOk]}>
                {produit.stock_actuel} en stock
              </Text>
            </View>
          </View>
        </View>

        {/* Info Tarifs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tarification & Vente</Text>
          
          {produit.type_vente === 'piece' || produit.type_vente === 'les_deux' ? (
            <View style={styles.infoRow}>
              <View style={styles.infoIconBox}><Tag size={18} color="#3B82F6" /></View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Prix à l'unité</Text>
                <Text style={styles.infoValue}>{produit.prix_unitaire?.toLocaleString('fr-FR')} FCFA</Text>
              </View>
            </View>
          ) : null}

          {produit.type_vente === 'carton' || produit.type_vente === 'les_deux' ? (
            <View style={styles.infoRow}>
              <View style={styles.infoIconBox}><LayoutGrid size={18} color="#8B5CF6" /></View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Prix par gros (Carton de {produit.unites_par_carton})</Text>
                <Text style={styles.infoValue}>{produit.prix_carton?.toLocaleString('fr-FR')} FCFA</Text>
              </View>
            </View>
          ) : null}
        </View>

        {/* Détails Stock */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>État du Stock</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Stock Actuel</Text>
              <Text style={[styles.statValue, isAlert && { color: colors.danger }]}>{produit.stock_actuel}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Seuil d'Alerte</Text>
              <Text style={styles.statValue}>{produit.stock_min}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.actionRow} onPress={() => router.push('/(drawer)/screens/inventaire/mouvements')}>
            <ChartBar size={18} color={colors.textSecondary} />
            <Text style={styles.actionRowText}>Voir l'historique des mouvements</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: colors.surface,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  editButton: {
    padding: 8,
    marginRight: -8,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: colors.danger,
    fontSize: 16,
  },
  content: {
    padding: 20,
  },
  productHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  productIconBox: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  productTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  catBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 8,
  },
  catBadgeText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  stockBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  stockBadgeOk: {
    backgroundColor: colors.successLight,
  },
  stockBadgeAlert: {
    backgroundColor: colors.dangerLight,
  },
  stockBadgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  stockBadgeTextOk: {
    color: colors.success,
  },
  stockBadgeTextAlert: {
    color: colors.danger,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  statsGrid: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 12,
    marginRight: 8,
  },
  statLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionRowText: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '500',
    marginLeft: 8,
  }
});
