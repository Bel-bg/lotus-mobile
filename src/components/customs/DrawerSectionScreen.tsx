import { DrawerNavigationProp } from "@react-navigation/drawer";
import { useNavigation } from "@react-navigation/native";
import { ChevronRight, Menu } from "lucide-react-native";
import React from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "@/constants/colors";
import { FontFamily } from "@/constants/typography";

type Tone = "default" | "success" | "warning" | "danger" | "info";

interface SummaryCard {
  label: string;
  value: string;
  helper?: string;
  tone?: Tone;
}

interface ActionRow {
  title: string;
  subtitle: string;
  badge?: string;
  tone?: Tone;
  onPress?: () => void;
}

interface DrawerSectionScreenProps {
  title: string;
  subtitle: string;
  sectionTitle?: string;
  summaryCards?: SummaryCard[];
  items?: ActionRow[];
  footerNote?: string;
  primaryAction?: {
    label: string;
    onPress: () => void;
  };
  secondaryAction?: {
    label: string;
    onPress: () => void;
  };
}

const toneStyles: Record<Tone, { bg: string; border: string; text: string }> = {
  default: {
    bg: Colors.surface,
    border: Colors.border,
    text: Colors.textPrimary,
  },
  success: {
    bg: Colors.successLight,
    border: Colors.successBorder,
    text: Colors.successText,
  },
  warning: {
    bg: Colors.warningLight,
    border: Colors.warningBorder,
    text: Colors.warningText,
  },
  danger: {
    bg: Colors.dangerLight,
    border: Colors.dangerBorder,
    text: Colors.dangerText,
  },
  info: {
    bg: Colors.infoLight,
    border: Colors.infoBorder,
    text: Colors.infoText,
  },
};

export default function DrawerSectionScreen({
  title,
  subtitle,
  sectionTitle,
  summaryCards = [],
  items = [],
  footerNote,
  primaryAction,
  secondaryAction,
}: DrawerSectionScreenProps) {
  const navigation = useNavigation<DrawerNavigationProp<any>>();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>

        <TouchableOpacity
          onPress={() => navigation.openDrawer()}
          style={styles.menuButton}
          activeOpacity={0.7}
        >
          <Menu size={20} color={Colors.textPrimary} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {summaryCards.length > 0 && (
          <View style={styles.metricsGrid}>
            {summaryCards.map((card) => {
              const tone = toneStyles[card.tone ?? "default"];

              return (
                <View
                  key={`${card.label}-${card.value}`}
                  style={[
                    styles.metricCard,
                    { backgroundColor: tone.bg, borderColor: tone.border },
                  ]}
                >
                  <Text style={styles.metricLabel}>{card.label}</Text>
                  <Text style={styles.metricValue}>{card.value}</Text>
                  {card.helper ? (
                    <Text style={[styles.metricHelper, { color: tone.text }]}>
                      {card.helper}
                    </Text>
                  ) : null}
                </View>
              );
            })}
          </View>
        )}

        {sectionTitle ? <Text style={styles.sectionTitle}>{sectionTitle}</Text> : null}

        <View style={styles.itemsList}>
          {items.map((item) => {
            const tone = toneStyles[item.tone ?? "default"];

            const content = (
              <>
                <View style={styles.itemText}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
                </View>

                <View style={styles.itemMeta}>
                  {item.badge ? (
                    <View
                      style={[
                        styles.badge,
                        { backgroundColor: tone.bg, borderColor: tone.border },
                      ]}
                    >
                      <Text style={[styles.badgeText, { color: tone.text }]}>
                        {item.badge}
                      </Text>
                    </View>
                  ) : null}
                  {item.onPress ? (
                    <ChevronRight size={18} color={Colors.textSecondary} />
                  ) : null}
                </View>
              </>
            );

            if (item.onPress) {
              return (
                <TouchableOpacity
                  key={`${item.title}-${item.subtitle}`}
                  style={styles.itemCard}
                  onPress={item.onPress}
                  activeOpacity={0.75}
                >
                  {content}
                </TouchableOpacity>
              );
            }

            return (
              <View key={`${item.title}-${item.subtitle}`} style={styles.itemCard}>
                {content}
              </View>
            );
          })}
        </View>

        {(primaryAction || secondaryAction) && (
          <View style={styles.actionsRow}>
            {secondaryAction ? (
              <TouchableOpacity
                style={[styles.actionButton, styles.secondaryButton]}
                onPress={secondaryAction.onPress}
                activeOpacity={0.8}
              >
                <Text style={[styles.actionText, styles.secondaryActionText]}>
                  {secondaryAction.label}
                </Text>
              </TouchableOpacity>
            ) : null}

            {primaryAction ? (
              <TouchableOpacity
                style={[styles.actionButton, styles.primaryButton]}
                onPress={primaryAction.onPress}
                activeOpacity={0.8}
              >
                <Text style={[styles.actionText, styles.primaryActionText]}>
                  {primaryAction.label}
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        )}

        {footerNote ? <Text style={styles.footerNote}>{footerNote}</Text> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#EFEFEF",
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
  },
  title: {
    fontFamily: FontFamily.display,
    fontSize: 28,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    marginTop: 6,
    maxWidth: 280,
    fontFamily: FontFamily.content,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  menuButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#F7F7F7",
    borderWidth: 1,
    borderColor: "#EFEFEF",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 120,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -6,
    marginBottom: 20,
  },
  metricCard: {
    width: "47%",
    margin: 6,
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
  },
  metricLabel: {
    fontFamily: FontFamily.utility,
    fontSize: 11,
    color: Colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  metricValue: {
    marginTop: 12,
    fontFamily: FontFamily.display,
    fontSize: 22,
    color: Colors.textPrimary,
  },
  metricHelper: {
    marginTop: 8,
    fontFamily: FontFamily.utility,
    fontSize: 12,
  },
  sectionTitle: {
    marginBottom: 12,
    fontFamily: FontFamily.utilityBold,
    fontSize: 12,
    color: Colors.textSecondary,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  itemsList: {
    gap: 12,
  },
  itemCard: {
    padding: 16,
    borderRadius: 18,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
  },
  itemText: {
    flex: 1,
    gap: 6,
  },
  itemTitle: {
    fontFamily: FontFamily.utilityBold,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  itemSubtitle: {
    fontFamily: FontFamily.content,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  itemMeta: {
    alignItems: "flex-end",
    gap: 10,
  },
  badge: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  badgeText: {
    fontFamily: FontFamily.utilityBold,
    fontSize: 11,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  actionButton: {
    minHeight: 50,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
    flex: 1,
  },
  primaryButton: {
    backgroundColor: Colors.textPrimary,
  },
  secondaryButton: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionText: {
    fontFamily: FontFamily.utilityBold,
    fontSize: 14,
  },
  primaryActionText: {
    color: Colors.textInverse,
  },
  secondaryActionText: {
    color: Colors.textPrimary,
  },
  footerNote: {
    marginTop: 16,
    fontFamily: FontFamily.content,
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
});
