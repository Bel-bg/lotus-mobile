import { Colors } from "@/constants/colors";
import { FontFamily, FontSize } from "@/constants/typography";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import React, { useCallback, useRef } from "react";
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import type { BilanDateRange } from "./bilan.types";
import { normalizeDateRange } from "../bilan.service";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const WEEK_DAYS = ["L", "M", "M", "J", "V", "S", "D"];

// ─── helpers ────────────────────────────────────────────────────────────────

function formatLocalDateToISO(date: Date): string {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseISODate(date: string): Date {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

function addMonths(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function getMonthStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function buildCalendarDays(month: Date): (Date | null)[] {
  const year = month.getFullYear();
  const m = month.getMonth();
  const firstDay = new Date(year, m, 1);
  const totalDays = new Date(year, m + 1, 0).getDate();
  const offset = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
  const days: (Date | null)[] = [];
  for (let i = 0; i < offset; i++) days.push(null);
  for (let d = 1; d <= totalDays; d++) days.push(new Date(year, m, d));
  return days;
}

function formatMonthLabel(date: Date): string {
  return new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" })
    .format(date)
    .replace(/^\w/, (c) => c.toUpperCase());
}

function formatReadableDate(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long" }).format(
    parseISODate(iso)
  );
}

// ─── types ──────────────────────────────────────────────────────────────────

type SelectionStep = "start" | "end";

interface CalendarPanelProps {
  draft: BilanDateRange;
  onDraftChange: (draft: BilanDateRange) => void;
  onApply: (range: BilanDateRange) => void;
}

// ─── composant principal ─────────────────────────────────────────────────────

export default function CalendarPanel({ draft, onDraftChange, onApply }: CalendarPanelProps) {
  const [currentMonth, setCurrentMonth] = React.useState(
    getMonthStart(parseISODate(draft.endDate))
  );
  const [selectionStep, setSelectionStep] = React.useState<SelectionStep>("start");

  const slideX = useSharedValue(0);
  const prevMonth = useRef(currentMonth);

  const normalized = normalizeDateRange(draft);

  // ── navigation mois avec slide ─────────────────────────────────────────
  const navigate = useCallback(
    (direction: -1 | 1) => {
      const OFFSET = direction * -SCREEN_WIDTH * 0.6;
      slideX.value = withTiming(OFFSET, { duration: 0 }); // snap instant
      setCurrentMonth((prev) => {
        prevMonth.current = prev;
        return addMonths(prev, direction);
      });
      // slide in depuis l'autre côté
      slideX.value = direction * SCREEN_WIDTH * 0.6;
      slideX.value = withTiming(0, { duration: 260 });
    },
    [slideX]
  );

  const animatedGrid = useAnimatedStyle(() => ({
    transform: [{ translateX: slideX.value }],
    opacity: 1 - Math.abs(slideX.value) / (SCREEN_WIDTH * 0.6) * 0.4,
  }));

  // ── sélection de jour ──────────────────────────────────────────────────
  const handleDayPress = (day: Date) => {
    const iso = formatLocalDateToISO(day);

    if (selectionStep === "start" || draft.shortcut !== "custom") {
      // Premier tap → début de sélection (ou reset)
      onDraftChange({ startDate: iso, endDate: iso, shortcut: "custom", isSingleDay: true });
      setSelectionStep("end");
      return;
    }

    // Deuxième tap → fin de sélection
    const ordered = normalizeDateRange({ startDate: draft.startDate, endDate: iso, shortcut: "custom" });
    const isSingleDay = ordered.startDate === ordered.endDate;
    onDraftChange({ ...ordered, isSingleDay });
    setSelectionStep("start");
  };

  const days = buildCalendarDays(currentMonth);
  const todayIso = formatLocalDateToISO(new Date());

  // ── label d'instruction ────────────────────────────────────────────────
  const instructionLabel =
    selectionStep === "start"
      ? "Appuyez pour définir le début"
      : "Appuyez pour définir la fin";

  const isReadyToApply = draft.shortcut === "custom";
  const isSingleDay = normalized.startDate === normalized.endDate;

  return (
    <View style={styles.container}>
      {/* Résumé de la sélection */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryCol}>
          <Text style={[styles.summaryLabel, selectionStep === "start" && styles.summaryLabelActive]}>
            Début
          </Text>
          <Text style={[styles.summaryDate, selectionStep === "start" && styles.summaryDateActive]}>
            {draft.shortcut === "custom"
              ? formatReadableDate(normalized.startDate)
              : "—"}
          </Text>
        </View>

        <View style={styles.summaryDivider}>
          <View style={styles.summaryLine} />
          <Text style={styles.summaryArrow}>→</Text>
          <View style={styles.summaryLine} />
        </View>

        <View style={[styles.summaryCol, styles.summaryColRight]}>
          <Text style={[styles.summaryLabel, selectionStep === "end" && styles.summaryLabelActive]}>
            Fin
          </Text>
          <Text style={[styles.summaryDate, selectionStep === "end" && styles.summaryDateActive]}>
            {draft.shortcut === "custom"
              ? formatReadableDate(normalized.endDate)
              : "—"}
          </Text>
        </View>
      </View>

      {/* Instruction */}
      <View style={styles.instructionRow}>
        <View style={[styles.stepDot, selectionStep === "end" && styles.stepDotActive]} />
        <Text style={styles.instruction}>{instructionLabel}</Text>
      </View>

      {/* Calendrier */}
      <View style={styles.calendarCard}>
        {/* Header mois */}
        <View style={styles.calendarHeader}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => navigate(-1)}
            activeOpacity={0.75}
          >
            <ChevronLeft size={18} color={Colors.textPrimary} strokeWidth={2.4} />
          </TouchableOpacity>

          <Text style={styles.monthLabel}>{formatMonthLabel(currentMonth)}</Text>

          <TouchableOpacity
            style={styles.navButton}
            onPress={() => navigate(1)}
            activeOpacity={0.75}
          >
            <ChevronRight size={18} color={Colors.textPrimary} strokeWidth={2.4} />
          </TouchableOpacity>
        </View>

        {/* Jours de la semaine */}
        <View style={styles.weekRow}>
          {WEEK_DAYS.map((d, i) => (
            <Text key={`${d}-${i}`} style={styles.weekdayLabel}>{d}</Text>
          ))}
        </View>

        {/* Grille animée */}
        <Animated.View style={[styles.grid, animatedGrid]}>
          {days.map((day, index) => {
            if (!day) {
              return <View key={`empty-${index}`} style={styles.dayCell} />;
            }

            const iso = formatLocalDateToISO(day);
            const isStart = normalized.startDate === iso;
            const isEnd = normalized.endDate === iso;
            const isInRange =
              draft.shortcut === "custom" &&
              iso > normalized.startDate &&
              iso < normalized.endDate;
            const isEdge = isStart || isEnd;
            const isToday = iso === todayIso;

            return (
              <TouchableOpacity
                key={iso}
                style={[
                  styles.dayCell,
                  isInRange && styles.dayCellRange,
                  isStart && !isSingleDay && styles.dayCellRangeStart,
                  isEnd && !isSingleDay && styles.dayCellRangeEnd,
                  isEdge && styles.dayCellEdge,
                ]}
                onPress={() => handleDayPress(day)}
                activeOpacity={0.75}
              >
                <View style={[styles.dayInner, isEdge && styles.dayInnerSelected]}>
                  <Text
                    style={[
                      styles.dayText,
                      isInRange && styles.dayTextRange,
                      isEdge && styles.dayTextSelected,
                      isToday && !isEdge && styles.dayTextToday,
                    ]}
                  >
                    {day.getDate()}
                  </Text>
                  {isToday && !isEdge ? <View style={styles.todayDot} /> : null}
                </View>
              </TouchableOpacity>
            );
          })}
        </Animated.View>
      </View>

      {/* Légende */}
      {isReadyToApply ? (
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.black }]} />
            <Text style={styles.legendText}>
              {isSingleDay ? "Jour sélectionné" : `${normalized.startDate === normalized.endDate ? "Même jour" : "Début / Fin"}`}
            </Text>
          </View>
          {!isSingleDay && (
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border }]} />
              <Text style={styles.legendText}>Plage incluse</Text>
            </View>
          )}
        </View>
      ) : null}

      {/* Bouton Appliquer */}
      <TouchableOpacity
        style={[styles.applyButton, !isReadyToApply && styles.applyButtonDisabled]}
        onPress={() => isReadyToApply && onApply(normalized)}
        activeOpacity={0.82}
        disabled={!isReadyToApply}
      >
        <Text style={styles.applyLabel}>
          {isSingleDay && isReadyToApply
            ? `Appliquer — ${formatReadableDate(normalized.startDate)}`
            : isReadyToApply
            ? `Appliquer — ${formatReadableDate(normalized.startDate)} › ${formatReadableDate(normalized.endDate)}`
            : "Sélectionnez une date"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── styles ──────────────────────────────────────────────────────────────────

const RANGE_BG = "rgba(10,10,10,0.07)";

const styles = StyleSheet.create({
  container: {
    gap: 14,
  },

  // Summary card
  summaryCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  summaryCol: {
    flex: 1,
    gap: 4,
  },
  summaryColRight: {
    alignItems: "flex-end",
  },
  summaryLabel: {
    fontFamily: FontFamily.utility,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  summaryLabelActive: {
    color: Colors.black,
    fontFamily: FontFamily.utilityBold,
  },
  summaryDate: {
    fontFamily: FontFamily.content,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
  },
  summaryDateActive: {
    color: Colors.textPrimary,
    fontFamily: FontFamily.utilityBold,
  },
  summaryDivider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  summaryLine: {
    width: 16,
    height: 1,
    backgroundColor: Colors.border,
  },
  summaryArrow: {
    fontFamily: FontFamily.utility,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },

  // Instruction
  instructionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 2,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
    borderWidth: 1.5,
    borderColor: Colors.borderStrong,
  },
  stepDotActive: {
    backgroundColor: Colors.black,
    borderColor: Colors.black,
  },
  instruction: {
    fontFamily: FontFamily.utility,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },

  // Calendar card
  calendarCard: {
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
    gap: 14,
    overflow: "hidden",
  },
  calendarHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  navButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  monthLabel: {
    fontFamily: FontFamily.utilityBold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    textTransform: "capitalize",
  },
  weekRow: {
    flexDirection: "row",
  },
  weekdayLabel: {
    width: `${100 / 7}%`,
    textAlign: "center",
    fontFamily: FontFamily.utility,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    paddingVertical: 4,
  },

  // Grid & cells
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  dayCellRange: {
    backgroundColor: RANGE_BG,
  },
  dayCellRangeStart: {
    borderTopLeftRadius: 50,
    borderBottomLeftRadius: 50,
  },
  dayCellRangeEnd: {
    borderTopRightRadius: 50,
    borderBottomRightRadius: 50,
  },
  dayCellEdge: {
    // le fond est géré par dayInner pour préserver le radius circulaire
    backgroundColor: "transparent",
  },
  dayInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  dayInnerSelected: {
    backgroundColor: Colors.black,
  },
  dayText: {
    fontFamily: FontFamily.content,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  dayTextRange: {
    fontFamily: FontFamily.utility,
    color: Colors.textPrimary,
  },
  dayTextSelected: {
    color: Colors.textInverse,
    fontFamily: FontFamily.utilityBold,
  },
  dayTextToday: {
    color: Colors.textPrimary,
    fontFamily: FontFamily.utilityBold,
  },
  todayDot: {
    position: "absolute",
    bottom: 3,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.black,
  },

  // Légende
  legend: {
    flexDirection: "row",
    gap: 16,
    paddingHorizontal: 2,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontFamily: FontFamily.utility,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },

  // Apply button
  applyButton: {
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.black,
  },
  applyButtonDisabled: {
    backgroundColor: Colors.borderStrong,
  },
  applyLabel: {
    fontFamily: FontFamily.utilityBold,
    fontSize: FontSize.sm,
    color: Colors.textInverse,
  },
});