// ============================================
// LOTUS BUSINESS — Bannière Vente (Entrée caisse / Sortie stock)
// ============================================

import { Colors } from "@/constants/colors";
import { FontFamily } from "@/constants/typography";
import { formatHeure, formatMontant, formatTempsRelatif } from "@/lib/utils/formatters";
import { Vente } from "@/types";
import {
  ChevronRight,
  Package,
  ShoppingBag,
  X,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ─── Bannière Vente ───────────────────────────────────────────────────────────

interface EntreeBanniereProps {
  vente: Vente;
}

export function EntreeBanniere({ vente }: EntreeBanniereProps) {
  const [detailsVisible, setDetailsVisible] = useState(false);

  const itemCount = vente.items?.length ?? 0;

  return (
    <>
      <TouchableOpacity
        style={styles.card}
        onPress={() => setDetailsVisible(true)}
        activeOpacity={0.82}
      >
        {/* Badge référence */}
        <View style={styles.refBadge}>
          <ShoppingBag size={18} color={Colors.textInverse} strokeWidth={2.2} />
        </View>

        {/* Corps */}
        <View style={styles.cardBody}>
          <View style={styles.titleRow}>
            <Text style={styles.reference} numberOfLines={1}>
              {vente.reference}
            </Text>
            <Text style={styles.montant}>
              {formatMontant(vente.total)}
            </Text>
          </View>

          <Text style={styles.meta}>
            {itemCount} article{itemCount > 1 ? "s" : ""} •{" "}
            {formatTempsRelatif(vente.createdAt)}
          </Text>

          <Text style={styles.heure}>{formatHeure(vente.createdAt)}</Text>
        </View>

        {/* Chevron */}
        <ChevronRight size={16} color={Colors.textSecondary} strokeWidth={2.2} />
      </TouchableOpacity>

      {/* Modal détails */}
      <VenteDetailModal
        vente={vente}
        visible={detailsVisible}
        onClose={() => setDetailsVisible(false)}
      />
    </>
  );
}

// ─── Modal Détails Vente ──────────────────────────────────────────────────────

interface VenteDetailModalProps {
  vente: Vente;
  visible: boolean;
  onClose: () => void;
}

function VenteDetailModal({ vente, visible, onClose }: VenteDetailModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.overlay} onPress={onClose} />

      <View style={styles.sheet}>
        {/* Handle */}
        <View style={styles.handle} />

        {/* En-tête */}
        <View style={styles.sheetHeader}>
          <View style={styles.sheetHeaderLeft}>
            <Text style={styles.sheetTitle}>{vente.reference}</Text>
            <Text style={styles.sheetSubtitle}>
              {formatTempsRelatif(vente.createdAt)} · {formatHeure(vente.createdAt)}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <X size={18} color={Colors.textPrimary} strokeWidth={2.4} />
          </TouchableOpacity>
        </View>

        {/* Ligne de total */}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>TOTAL VENTE</Text>
          <Text style={styles.totalValue}>{formatMontant(vente.total)}</Text>
        </View>

        {/* Liste articles */}
        <Text style={styles.articlesHeading}>
          Articles ({vente.items?.length ?? 0})
        </Text>

        <ScrollView
          style={styles.articlesList}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.articlesContent}
        >
          {vente.items?.length === 0 ? (
            <View style={styles.emptyArticles}>
              <Package size={32} color={Colors.borderStrong} strokeWidth={1.6} />
              <Text style={styles.emptyArticlesText}>Aucun article</Text>
            </View>
          ) : (
            vente.items?.map((item, index) => (
              <View
                key={item.id}
                style={[
                  styles.articleRow,
                  index < (vente.items?.length ?? 0) - 1 && styles.articleRowBorder,
                ]}
              >
                <View style={styles.articleIconWrap}>
                  <Package size={16} color={Colors.textSecondary} strokeWidth={2} />
                </View>

                <View style={styles.articleBody}>
                  <Text style={styles.articleNom} numberOfLines={1}>
                    {item.produitNom}
                  </Text>
                  <Text style={styles.articleMeta}>
                    {item.quantite} × {formatMontant(item.prixUnitaire)}
                  </Text>
                </View>

                <Text style={styles.articleSousTotal}>
                  {formatMontant(item.sousTotal)}
                </Text>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Bannière
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#EEEEEE",
    marginBottom: 10,
  },
  refBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.textPrimary,
    alignItems: "center",
    justifyContent: "center",
  },
  cardBody: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  reference: {
    fontFamily: FontFamily.utilityBold,
    fontSize: 15,
    color: Colors.textPrimary,
    flex: 1,
  },
  montant: {
    fontFamily: FontFamily.display,
    fontSize: 15,
    color: Colors.successText,
  },
  meta: {
    fontFamily: FontFamily.utility,
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  heure: {
    fontFamily: FontFamily.utility,
    fontSize: 11,
    color: Colors.textTertiary,
    marginTop: 6,
  },

  // Modal
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
  },
  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 22,
    paddingBottom: 36,
    maxHeight: "80%",
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 999,
    backgroundColor: "#DCDCDC",
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 18,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  sheetHeaderLeft: {
    flex: 1,
    gap: 4,
  },
  sheetTitle: {
    fontFamily: FontFamily.display,
    fontSize: 22,
    color: Colors.textPrimary,
    letterSpacing: -0.4,
  },
  sheetSubtitle: {
    fontFamily: FontFamily.content,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#F2F2F2",
    alignItems: "center",
    justifyContent: "center",
  },
  totalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.successLight,
    borderColor: Colors.successBorder,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 20,
  },
  totalLabel: {
    fontFamily: FontFamily.utilityBold,
    fontSize: 10,
    letterSpacing: 1,
    color: Colors.successText,
  },
  totalValue: {
    fontFamily: FontFamily.display,
    fontSize: 18,
    color: Colors.successText,
  },
  articlesHeading: {
    fontFamily: FontFamily.displaySemi,
    fontSize: 15,
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  articlesList: {
    flexShrink: 1,
  },
  articlesContent: {
    gap: 0,
  },
  articleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
  },
  articleRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  articleIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
  },
  articleBody: {
    flex: 1,
    gap: 3,
  },
  articleNom: {
    fontFamily: FontFamily.utilityBold,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  articleMeta: {
    fontFamily: FontFamily.content,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  articleSousTotal: {
    fontFamily: FontFamily.display,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  emptyArticles: {
    alignItems: "center",
    paddingVertical: 24,
    gap: 10,
  },
  emptyArticlesText: {
    fontFamily: FontFamily.content,
    fontSize: 14,
    color: Colors.textSecondary,
  },
});
export default function IgnoredRoute() { return null; }
