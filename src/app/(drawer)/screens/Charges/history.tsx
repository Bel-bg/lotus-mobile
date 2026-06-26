import ChargeFormSheet, {
  type ChargeFormSheetRef,
} from '@/components/charges/ChargeFormSheet';
import ChargeListItem from '@/components/charges/ChargeListItem';
import ChargesSummaryBlock from '@/components/charges/ChargesSummaryBlock';
import Loader from '@/components/ui/loader';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';
import {
  getCompactDateRangeLabel,
  getShortcutRange,
} from '@/features/bilan/bilan.service';
import type { BilanDateRange } from '@/types/bilan';
import type { CategorieCharge } from '@/types/charge';
import { useChargeStore } from '@/store/useChargeStore';
import { useFocusEffect, useRouter } from 'expo-router';
import { ArrowLeft, Plus, Receipt } from 'lucide-react-native';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type PeriodKey = 'today' | 'week' | 'month' | 'all';

const PERIOD_OPTIONS: { key: PeriodKey; label: string }[] = [
  { key: 'today', label: "Aujourd'hui" },
  { key: 'week', label: 'Semaine' },
  { key: 'month', label: 'Mois' },
  { key: 'all', label: 'Tout' },
];

function getRangeForPeriod(period: PeriodKey): BilanDateRange | null {
  if (period === 'all') return null;
  return getShortcutRange(period);
}

export default function ChargesHistoriqueScreen() {
  const router = useRouter();
  const chargeFormRef = useRef<ChargeFormSheetRef>(null);
  const [period, setPeriod] = useState<PeriodKey>('month');
  const [total, setTotal] = useState(0);
  const [parCategorie, setParCategorie] = useState<
    Partial<Record<CategorieCharge, number>>
  >({});

  const charges = useChargeStore((s) => s.charges);
  const isLoading = useChargeStore((s) => s.isLoading);
  const loadCharges = useChargeStore((s) => s.loadCharges);
  const removeCharge = useChargeStore((s) => s.removeCharge);
  const fetchTotal = useChargeStore((s) => s.fetchTotal);
  const fetchParCategorie = useChargeStore((s) => s.fetchParCategorie);

  const activeRange = useMemo(() => getRangeForPeriod(period), [period]);
  const periodLabel = useMemo(() => {
    if (!activeRange) return 'Toutes les périodes';
    return getCompactDateRangeLabel(activeRange);
  }, [activeRange]);

  const refreshData = useCallback(async () => {
    const range = getRangeForPeriod(period);

    if (range) {
      await Promise.all([
        loadCharges(range.startDate, range.endDate),
        fetchTotal(range.startDate, range.endDate).then(setTotal),
        fetchParCategorie(range.startDate, range.endDate).then((data) => {
          setParCategorie(
            Object.fromEntries(
              Object.entries(data).filter(([, value]) => value > 0)
            )
          );
        }),
      ]);
      return;
    }

    await loadCharges();
    const loaded = useChargeStore.getState().charges;
    setTotal(loaded.reduce((sum, charge) => sum + charge.montant, 0));
    setParCategorie(
      Object.fromEntries(
        loaded.reduce<[CategorieCharge, number][]>((acc, charge) => {
          const existing = acc.find(([key]) => key === charge.categorie);
          if (existing) {
            existing[1] += charge.montant;
          } else {
            acc.push([charge.categorie, charge.montant]);
          }
          return acc;
        }, [])
      )
    );
  }, [period, loadCharges, fetchTotal, fetchParCategorie]);

  useFocusEffect(
    useCallback(() => {
      void refreshData();
    }, [refreshData])
  );

  const handleDelete = (id: number, label: string) => {
    Alert.alert('Supprimer cette dépense ?', label, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: () => {
          void removeCharge(id).then(() => refreshData());
        },
      },
    ]);
  };

  const renderHeader = () => (
    <View style={styles.listHeader}>
      <View style={styles.summaryWrap}>
        {total > 0 ? (
          <ChargesSummaryBlock total={total} parCategorie={parCategorie} />
        ) : (
          <View style={styles.emptySummary}>
            <Receipt size={22} color={Colors.textSecondary} />
            <View style={styles.emptySummaryText}>
              <Text style={styles.emptySummaryTitle} selectable>
                Aucune charge sur cette période
              </Text>
              <Text style={styles.emptySummaryBody} selectable>
                Les dépenses enregistrées apparaîtront ici avec le résumé par
                catégorie.
              </Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.sectionHead}>
        <Text style={styles.sectionTitle} selectable>
          Historique
        </Text>
        <Text style={styles.sectionCount} selectable>
          {charges.length} dépense{charges.length > 1 ? 's' : ''}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => router.back()}
          activeOpacity={0.82}
        >
          <ArrowLeft size={20} color={Colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} selectable>
            Charges annexes
          </Text>
          <Text style={styles.headerSubtitle} selectable>
            {periodLabel}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => chargeFormRef.current?.open()}
          activeOpacity={0.82}
        >
          <Plus size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <View style={styles.periodRow}>
        {PERIOD_OPTIONS.map((option) => {
          const active = period === option.key;
          return (
            <TouchableOpacity
              key={option.key}
              style={[styles.periodChip, active && styles.periodChipActive]}
              onPress={() => setPeriod(option.key)}
              activeOpacity={0.82}
            >
              <Text
                style={[
                  styles.periodChipLabel,
                  active && styles.periodChipLabelActive,
                ]}
                selectable
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {isLoading && charges.length === 0 ? (
        <Loader message="Chargement des charges..." />
      ) : (
        <FlatList
          data={charges}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <ChargeListItem
              charge={item}
              onLongPress={() => handleDelete(item.id, item.label)}
            />
          )}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={
            <View style={styles.emptyList}>
              <Text style={styles.emptyListTitle} selectable>
                Aucune dépense enregistrée
              </Text>
              <Text style={styles.emptyListBody} selectable>
                Appuyez sur + pour noter votre première charge annexe.
              </Text>
            </View>
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={() => void refreshData()}
              tintColor={Colors.textPrimary}
            />
          }
        />
      )}

      <ChargeFormSheet
        ref={chargeFormRef}
        onSuccess={() => void refreshData()}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    gap: 8,
  },
  headerBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  headerTitle: {
    fontFamily: FontFamily.displaySemi,
    fontSize: FontSize.xl,
    color: Colors.textPrimary,
  },
  headerSubtitle: {
    fontFamily: FontFamily.content,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  periodRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  periodChip: {
    flex: 1,
    minHeight: 38,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  periodChipActive: {
    backgroundColor: Colors.textPrimary,
    borderColor: Colors.textPrimary,
  },
  periodChipLabel: {
    fontFamily: FontFamily.utilityBold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  periodChipLabelActive: {
    color: Colors.textInverse,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    flexGrow: 1,
  },
  listHeader: {
    gap: 18,
    paddingBottom: 8,
  },
  summaryWrap: {
    paddingTop: 4,
  },
  emptySummary: {
    flexDirection: 'row',
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 20,
    padding: 16,
    backgroundColor: Colors.surface,
  },
  emptySummaryText: {
    flex: 1,
    gap: 4,
  },
  emptySummaryTitle: {
    fontFamily: FontFamily.displaySemi,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  emptySummaryBody: {
    fontFamily: FontFamily.content,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  sectionTitle: {
    fontFamily: FontFamily.displaySemi,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
  },
  sectionCount: {
    fontFamily: FontFamily.content,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  emptyList: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyListTitle: {
    fontFamily: FontFamily.displaySemi,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
  },
  emptyListBody: {
    fontFamily: FontFamily.content,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 24,
  },
});
