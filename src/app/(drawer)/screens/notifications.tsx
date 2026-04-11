import { MOCK_NOTIFICATIONS } from "@/constants/mock-notifications";
import { Colors } from "@/constants/colors";
import { FontFamily } from "@/constants/typography";
import { AppNotification, NotificationType } from "@/types/notification";
import { useRouter } from "expo-router";
import {
  AlertTriangle,
  ArrowLeft,
  Bell,
  CheckCircle2,
  CircleX,
  RotateCcw,
  Search,
  CloudCheck,
  Package,
  ShoppingBag,
  Smartphone,
  TriangleAlert,
} from "lucide-react-native";
import React from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PAGE_SIZE = 10;

const notificationTypeConfig: Record<
  NotificationType,
  {
    icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
    tint: string;
    surface: string;
    border: string;
    label: string;
  }
> = {
  stock_low: {
    icon: AlertTriangle,
    tint: Colors.warningText,
    surface: Colors.warningLight,
    border: Colors.warningBorder,
    label: "Stock faible",
  },
  sale: {
    icon: ShoppingBag,
    tint: Colors.infoText,
    surface: Colors.infoLight,
    border: Colors.infoBorder,
    label: "Nouvelle vente",
  },
  backup_success: {
    icon: CloudCheck,
    tint: Colors.successText,
    surface: Colors.successLight,
    border: Colors.successBorder,
    label: "Sauvegarde",
  },
  stock_updated: {
    icon: Package,
    tint: "#7C3AED",
    surface: "#F5F3FF",
    border: "#DDD6FE",
    label: "Stock mis a jour",
  },
  stock_out: {
    icon: TriangleAlert,
    tint: Colors.dangerText,
    surface: Colors.dangerLight,
    border: Colors.dangerBorder,
    label: "Rupture",
  },
  sync_error: {
    icon: Bell,
    tint: "#B45309",
    surface: "#FFF7ED",
    border: "#FED7AA",
    label: "Synchronisation",
  },
  system: {
    icon: Smartphone,
    tint: "#7C2D12",
    surface: "#FFF7ED",
    border: "#FDBA74",
    label: "Systeme",
  },
};

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function formatNotificationDate(dateValue: string) {
  const date = new Date(dateValue);

  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function NotificationCard({ item }: { item: AppNotification }) {
  const config = notificationTypeConfig[item.type];
  const Icon = config.icon;

  return (
    <View style={[styles.card, !item.read && styles.cardUnread]}>
      <View
        style={[
          styles.iconWrap,
          { backgroundColor: config.surface, borderColor: config.border },
        ]}
      >
        <Icon size={20} color={config.tint} strokeWidth={2.4} />
      </View>

      <View style={styles.cardContent}>
        <View style={styles.cardTopRow}>
          <View style={styles.badgeRow}>
            <View
              style={[
                styles.typeBadge,
                { backgroundColor: config.surface, borderColor: config.border },
              ]}
            >
              <Text style={[styles.typeBadgeText, { color: config.tint }]}>
                {config.label}
              </Text>
            </View>
            {!item.read ? <View style={styles.unreadDot} /> : null}
          </View>

          <Text style={styles.cardDate}>{formatNotificationDate(item.createdAt)}</Text>
        </View>

        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardMessage}>{item.message}</Text>

        {item.metadata?.amount || item.metadata?.productName ? (
          <View style={styles.metaRow}>
            {item.metadata?.amount ? (
              <Text style={styles.metaText}>{item.metadata.amount}</Text>
            ) : null}
            {item.metadata?.productName ? (
              <Text style={styles.metaText}>{item.metadata.productName}</Text>
            ) : null}
          </View>
        ) : null}
      </View>
    </View>
  );
}

export default function NotificationsScreen() {
  const router = useRouter();
  const [visibleCount, setVisibleCount] = React.useState(PAGE_SIZE);
  const [searchQuery, setSearchQuery] = React.useState("");

  const filteredNotifications = React.useMemo(() => {
    const query = normalizeText(searchQuery.trim());

    if (!query) {
      return MOCK_NOTIFICATIONS;
    }

    return MOCK_NOTIFICATIONS.filter((item) => {
      const config = notificationTypeConfig[item.type];
      const haystack = [
        item.title,
        item.message,
        config.label,
        item.metadata?.amount,
        item.metadata?.productName,
      ]
        .filter(Boolean)
        .join(" ");

      return normalizeText(haystack).includes(query);
    });
  }, [searchQuery]);

  const visibleNotifications = React.useMemo(
    () => filteredNotifications.slice(0, visibleCount),
    [filteredNotifications, visibleCount]
  );

  const stats = React.useMemo(() => {
    return filteredNotifications.reduce(
      (acc, item) => {
        if (item.type === "sale") acc.sales += 1;
        if (
          item.type === "stock_low" ||
          item.type === "stock_out" ||
          item.type === "stock_updated"
        ) {
          acc.stock += 1;
        }
        if (item.type === "backup_success" || item.type === "sync_error") {
          acc.backups += 1;
        }
        if (item.type === "system") {
          acc.system += 1;
        }
        return acc;
      },
      { sales: 0, stock: 0, backups: 0, system: 0 }
    );
  }, [filteredNotifications]);

  const unreadCount = React.useMemo(
    () => filteredNotifications.filter((item) => !item.read).length,
    [filteredNotifications]
  );

  const hasMore = visibleNotifications.length < filteredNotifications.length;

  React.useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [searchQuery]);

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <FlatList
        data={visibleNotifications}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
        ListHeaderComponent={
          <View style={styles.headerBlock}>
            <View style={styles.topBar}>
              <TouchableOpacity
                onPress={() => router.back()}
                style={styles.topAction}
                activeOpacity={0.75}
              >
                <ArrowLeft size={20} color={Colors.textPrimary} strokeWidth={2.5} />
              </TouchableOpacity>
              <Text style={styles.heroTitle}>Notification</Text>
              <TouchableOpacity
                onPress={() => {
                  if (searchQuery) {
                    setSearchQuery("");
                  }
                }}
                style={styles.topAction}
                activeOpacity={0.75}
              >
                {searchQuery ? (
                  <CircleX size={20} color={Colors.textPrimary} strokeWidth={2.5} />
                ) : (
                  <Search size={20} color={Colors.textPrimary} strokeWidth={2.5} />
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.searchBar}>
              <Search size={18} color={Colors.textSecondary} strokeWidth={2.3} />
              <TextInput
                style={styles.searchInput}
                placeholder="Rechercher une vente, un stock, une mise a jour..."
                placeholderTextColor={Colors.textTertiary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            <ScrollView style={styles.summaryRow} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingVertical: 8 }}>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Ventes</Text>
                <Text style={styles.summaryValue}>{stats.sales}</Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Stock</Text>
                <Text style={styles.summaryValue}>{stats.stock}</Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Sauvegarde</Text>
                <Text style={styles.summaryValue}>{stats.backups}</Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Systeme</Text>
                <Text style={styles.summaryValue}>{stats.system}</Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Non lues</Text>
                <Text style={styles.summaryValue}>{unreadCount}</Text>
              </View>
            </ScrollView>

            <Text style={styles.sectionTitle}>Activite recente</Text>
          </View>
        }
        renderItem={({ item }) => <NotificationCard item={item} />}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListFooterComponent={
          hasMore ? (
            <TouchableOpacity
              style={styles.loadMoreButton}
              onPress={() =>
                setVisibleCount((current) =>
                  Math.min(current + PAGE_SIZE, filteredNotifications.length)
                )
              }
              activeOpacity={0.82}
            >
              <RotateCcw size={18} color={Colors.textInverse} strokeWidth={2.4} />
              <Text style={styles.loadMoreText}>Afficher plus anciens</Text>
            </TouchableOpacity>
          ) : visibleNotifications.length > 0 ? (
            <View style={styles.endCard}>
              <CheckCircle2 size={20} color={Colors.successText} strokeWidth={2.4} />
              <Text style={styles.endText}>
                Toutes les notifications fictives ont ete chargees.
              </Text>
            </View>
          ) : (
            <View style={styles.emptyCard}>
              <Search size={18} color={Colors.textSecondary} strokeWidth={2.4} />
              <Text style={styles.emptyText}>
                Aucune notification ne correspond a cette recherche.
              </Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 36,
  },
  headerBlock: {
    gap: 18,
    paddingBottom: 20,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  topAction: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#F7F7F7",
    borderWidth: 1,
    borderColor: "#ECECEC",
    alignItems: "center",
    justifyContent: "center",
  },
  heroCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 20,
    gap: 16,
  },
  heroIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: Colors.infoLight,
    borderWidth: 1,
    borderColor: Colors.infoBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  heroText: {
    gap: 8,
  },
  heroTitle: {
    fontFamily: FontFamily.display,
    fontSize: 24,
    fontWeight: "700",
    color: Colors.textPrimary,
    letterSpacing: 0.5,
  },
  heroSubtitle: {
    fontFamily: FontFamily.content,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    fontFamily: FontFamily.content,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  summaryRow: {
    flexDirection: "row",
    gap: 10,
  },
  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#EEF2F7",
    paddingVertical: 10,
    paddingHorizontal: 14,
    gap: 8,
    minWidth: 112,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  summaryLabel: {
    fontFamily: FontFamily.utility,
    fontSize: 12,
    color: Colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  summaryValue: {
    fontFamily: FontFamily.display,
    fontSize: 12,
    color: Colors.textPrimary,
  },
  sectionTitle: {
    fontFamily: FontFamily.utilityBold,
    fontSize: 12,
    color: Colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  card: {
    flexDirection: "row",
    gap: 14,
    padding: 16,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EEF2F7",
  },
  cardUnread: {
    backgroundColor: "#FCFFFE",
    borderColor: "#CFF8DF",
  },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  cardContent: {
    flex: 1,
    gap: 10,
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexShrink: 1,
  },
  typeBadge: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  typeBadgeText: {
    fontFamily: FontFamily.utilityBold,
    fontSize: 11,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: Colors.success,
  },
  cardDate: {
    fontFamily: FontFamily.utility,
    fontSize: 11,
    color: Colors.textSecondary,
  },
  cardTitle: {
    fontFamily: FontFamily.displaySemi,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  cardMessage: {
    fontFamily: FontFamily.content,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  metaText: {
    fontFamily: FontFamily.utilityBold,
    fontSize: 12,
    color: Colors.textPrimary,
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    overflow: "hidden",
  },
  separator: {
    height: 12,
  },
  loadMoreButton: {
    marginTop: 18,
    borderRadius: 18,
    backgroundColor: "#0F172A",
    paddingVertical: 16,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  loadMoreText: {
    fontFamily: FontFamily.utilityBold,
    fontSize: 14,
    color: Colors.textInverse,
  },
  endCard: {
    marginTop: 18,
    borderRadius: 18,
    backgroundColor: Colors.successLight,
    borderWidth: 1,
    borderColor: Colors.successBorder,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  endText: {
    flex: 1,
    fontFamily: FontFamily.utility,
    fontSize: 13,
    color: Colors.successText,
  },
  emptyCard: {
    marginTop: 18,
    borderRadius: 18,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  emptyText: {
    flex: 1,
    fontFamily: FontFamily.utility,
    fontSize: 13,
    color: Colors.textSecondary,
  },
});
