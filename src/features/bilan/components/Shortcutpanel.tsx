import { Colors } from "@/constants/colors";
import { FontFamily, FontSize } from "@/constants/typography";
import { CalendarDays, Check, Clock, TrendingUp } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import type { BilanDateRange, BilanShortcut } from "./bilan.types";
import { getShortcutRange } from "../bilan.service";

interface ShortcutPanelProps {
  current: BilanDateRange;
  onSelect: (range: BilanDateRange) => void;
}

type LucideIcon = typeof Clock;

const SHORTCUTS: {
  key: Exclude<BilanShortcut, "custom">;
  label: string;
  description: string;
  Icon: LucideIcon;
}[] = [
  {
    key: "today",
    label: "Aujourd'hui",
    description: "Ventes du jour en cours",
    Icon: Clock,
  },
  {
    key: "week",
    label: "Cette semaine",
    description: "Du lundi à aujourd'hui",
    Icon: TrendingUp,
  },
  {
    key: "month",
    label: "Ce mois",
    description: "Du 1er à aujourd'hui",
    Icon: CalendarDays,
  },
];

export default function ShortcutPanel({
  current,
  onSelect,
}: ShortcutPanelProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionLabel}>Sélectionnez une période</Text>
      <View style={styles.list}>
        {SHORTCUTS.map((shortcut) => (
          <ShortcutCard
            key={shortcut.key}
            shortcut={shortcut}
            active={current.shortcut === shortcut.key}
            onPress={() => onSelect(getShortcutRange(shortcut.key))}
          />
        ))}
      </View>
    </View>
  );
}

function ShortcutCard({
  shortcut,
  active,
  onPress,
}: {
  shortcut: (typeof SHORTCUTS)[number];
  active: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSequence(
      withTiming(0.97, { duration: 80 }),
      withTiming(1, { duration: 120 }),
    );
    onPress();
  };

  const { Icon } = shortcut;

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        style={[styles.card, active && styles.cardActive]}
        onPress={handlePress}
        activeOpacity={1}
      >
        <View style={[styles.iconWrap, active && styles.iconWrapActive]}>
          <Icon
            size={20}
            color={active ? Colors.textInverse : Colors.textPrimary}
            strokeWidth={2}
          />
        </View>

        <View style={styles.copy}>
          <Text style={[styles.cardLabel, active && styles.cardLabelActive]}>
            {shortcut.label}
          </Text>
          <Text style={[styles.cardDesc, active && styles.cardDescActive]}>
            {shortcut.description}
          </Text>
        </View>

        <View style={[styles.checkCircle, active && styles.checkCircleActive]}>
          {active ? (
            <Check size={14} color={Colors.black} strokeWidth={2.8} />
          ) : null}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 14,
  },
  sectionLabel: {
    fontFamily: FontFamily.utilityBold,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  list: {
    gap: 10,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardActive: {
    backgroundColor: Colors.black,
    borderColor: Colors.black,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  iconWrapActive: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderColor: "rgba(255,255,255,0.2)",
  },
  copy: {
    flex: 1,
    gap: 3,
  },
  cardLabel: {
    fontFamily: FontFamily.utilityBold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  cardLabelActive: {
    color: Colors.textInverse,
  },
  cardDesc: {
    fontFamily: FontFamily.utility,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  cardDescActive: {
    color: "rgba(255,255,255,0.6)",
  },
  checkCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.background,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  checkCircleActive: {
    backgroundColor: Colors.textInverse,
    borderColor: Colors.textInverse,
  },
});
