import { Colors } from "@/constants/colors";
import { FontFamily, FontSize } from "@/constants/typography";
import type { BilanDateRange, BilanShortcut } from "@/types/bilan";
import { ChevronLeft, ChevronRight, X } from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  getDateRangeLabel,
  getShortcutRange,
  normalizeDateRange,
} from "../bilan.service";

interface DateRangePickerProps {
  visible: boolean;
  value: BilanDateRange;
  onClose: () => void;
  onChange: (nextRange: BilanDateRange) => void;
}

type SelectionStep = "start" | "end";

const WEEK_DAYS = ["L", "M", "M", "J", "V", "S", "D"];

export default function DateRangePicker({
  visible,
  value,
  onClose,
  onChange,
}: DateRangePickerProps) {
  const insets = useSafeAreaInsets();
  const [draftRange, setDraftRange] = useState<BilanDateRange>(value);
  const [currentMonth, setCurrentMonth] = useState(
    getMonthStart(parseISODate(value.endDate))
  );
  const [selectionStep, setSelectionStep] = useState<SelectionStep>("start");

  useEffect(() => {
    if (visible) {
      setDraftRange(value);
      setCurrentMonth(getMonthStart(parseISODate(value.endDate)));
      setSelectionStep("start");
    }
  }, [value, visible]);

  const days = useMemo(() => buildCalendarDays(currentMonth), [currentMonth]);
  const normalizedDraft = normalizeDateRange(draftRange);

  const handlePreset = (shortcut: Exclude<BilanShortcut, "custom">) => {
    const nextRange = getShortcutRange(shortcut);
    setDraftRange(nextRange);
    onChange(nextRange);
    onClose();
  };

  const handleDayPress = (day: Date) => {
    const dayIso = formatLocalDateToISO(day);

    if (
      draftRange.shortcut !== "custom" ||
      selectionStep === "start" ||
      !draftRange.startDate ||
      draftRange.startDate !== draftRange.endDate
    ) {
      setDraftRange({
        startDate: dayIso,
        endDate: dayIso,
        shortcut: "custom",
      });
      setSelectionStep("end");
      return;
    }

    const orderedRange = normalizeDateRange({
      startDate: draftRange.startDate,
      endDate: dayIso,
      shortcut: "custom",
    });

    setDraftRange(orderedRange);
    setSelectionStep("start");
  };

  const handleApplyCustom = () => {
    const nextRange = normalizeDateRange({
      ...draftRange,
      shortcut: "custom",
    });
    setDraftRange(nextRange);
    onChange(nextRange);
    onClose();
  };

  const monthLabel = new Intl.DateTimeFormat("fr-FR", {
    month: "long",
    year: "numeric",
  })
    .format(currentMonth)
    .replace(/^\w/, (match) => match.toUpperCase());

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 20) }]}>
          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <Text style={styles.kicker} selectable>
                Période du bilan
              </Text>
              <Text style={styles.headerTitle} selectable>
                {getDateRangeLabel(normalizedDraft)}
              </Text>
            </View>

            <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.8}>
              <X size={18} color={Colors.textPrimary} strokeWidth={2.4} />
            </TouchableOpacity>
          </View>

          <ScrollView
            contentInsetAdjustmentBehavior="automatic"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}
          >
            <View style={styles.shortcutsWrap}>
              <ShortcutChip
                label="Aujourd'hui"
                active={value.shortcut === "today"}
                onPress={() => handlePreset("today")}
              />
              <ShortcutChip
                label="Cette semaine"
                active={value.shortcut === "week"}
                onPress={() => handlePreset("week")}
              />
              <ShortcutChip
                label="Ce mois"
                active={value.shortcut === "month"}
                onPress={() => handlePreset("month")}
              />
              <ShortcutChip
                label="Plage libre"
                active={draftRange.shortcut === "custom"}
                onPress={() => {
                  setDraftRange({
                    ...normalizedDraft,
                    shortcut: "custom",
                  });
                  setSelectionStep("start");
                }}
              />
            </View>

            <View style={styles.selectionCard}>
              <Text style={styles.selectionLabel} selectable>
                {selectionStep === "start"
                  ? "Sélectionnez le début de période"
                  : "Sélectionnez la fin de période"}
              </Text>
              <Text style={styles.selectionValue} selectable>
                {draftRange.shortcut === "custom"
                  ? `${formatReadableDraftDate(normalizedDraft.startDate)} - ${formatReadableDraftDate(
                      normalizedDraft.endDate
                    )}`
                  : "Les raccourcis appliquent immédiatement la période"}
              </Text>
            </View>

            <View style={styles.calendarCard}>
              <View style={styles.calendarHeader}>
                <TouchableOpacity
                  style={styles.monthButton}
                  onPress={() => setCurrentMonth(addMonths(currentMonth, -1))}
                  activeOpacity={0.75}
                >
                  <ChevronLeft
                    size={18}
                    color={Colors.textPrimary}
                    strokeWidth={2.4}
                  />
                </TouchableOpacity>

                <Text style={styles.monthLabel} selectable>
                  {monthLabel}
                </Text>

                <TouchableOpacity
                  style={styles.monthButton}
                  onPress={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  activeOpacity={0.75}
                >
                  <ChevronRight
                    size={18}
                    color={Colors.textPrimary}
                    strokeWidth={2.4}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.weekHeader}>
                {WEEK_DAYS.map((day, index) => (
                  <Text key={`${day}-${index}`} style={styles.weekdayLabel} selectable>
                    {day}
                  </Text>
                ))}
              </View>

              <View style={styles.grid}>
                {days.map((day, index) => {
                  if (!day) {
                    return <View key={`empty-${index}`} style={styles.dayCell} />;
                  }

                  const iso = formatLocalDateToISO(day);
                  const isSelectedStart = normalizedDraft.startDate === iso;
                  const isSelectedEnd = normalizedDraft.endDate === iso;
                  const isInRange =
                    iso >= normalizedDraft.startDate && iso <= normalizedDraft.endDate;
                  const isToday = iso === formatLocalDateToISO(new Date());

                  return (
                    <TouchableOpacity
                      key={iso}
                      style={[
                        styles.dayCell,
                        isInRange && styles.dayCellInRange,
                        (isSelectedStart || isSelectedEnd) && styles.dayCellSelected,
                      ]}
                      onPress={() => handleDayPress(day)}
                      activeOpacity={0.82}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          isInRange && styles.dayTextInRange,
                          (isSelectedStart || isSelectedEnd) && styles.dayTextSelected,
                        ]}
                        selectable
                      >
                        {day.getDate()}
                      </Text>
                      {isToday ? <View style={styles.todayDot} /> : null}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          <TouchableOpacity
            style={[
              styles.applyButton,
              draftRange.shortcut !== "custom" && styles.applyButtonDisabled,
            ]}
            onPress={handleApplyCustom}
            activeOpacity={0.82}
            disabled={draftRange.shortcut !== "custom"}
          >
            <Text style={styles.applyLabel}>Appliquer la plage libre</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function ShortcutChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.shortcutChip, active && styles.shortcutChipActive]}
      onPress={onPress}
      activeOpacity={0.82}
    >
      <Text
        style={[styles.shortcutLabel, active && styles.shortcutLabelActive]}
        selectable
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function addMonths(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function getMonthStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function formatLocalDateToISO(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseISODate(date: string): Date {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

function buildCalendarDays(currentMonth: Date): (Date | null)[] {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const totalDays = new Date(year, month + 1, 0).getDate();
  const offset = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
  const days: (Date | null)[] = [];

  for (let index = 0; index < offset; index += 1) {
    days.push(null);
  }

  for (let day = 1; day <= totalDays; day += 1) {
    days.push(new Date(year, month, day));
  }

  return days;
}

function formatReadableDraftDate(date: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
  }).format(parseISODate(date));
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: Colors.overlay,
  },
  sheet: {
    maxHeight: "90%",
    backgroundColor: Colors.background,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    gap: 16,
  },
  headerCopy: {
    flex: 1,
    gap: 6,
  },
  kicker: {
    fontFamily: FontFamily.utilityBold,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  headerTitle: {
    fontFamily: FontFamily.displaySemi,
    fontSize: FontSize["2xl"],
    color: Colors.textPrimary,
    lineHeight: 24,
  },
  closeButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 18,
    gap: 18,
  },
  shortcutsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  shortcutChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  shortcutChipActive: {
    backgroundColor: Colors.black,
    borderColor: Colors.black,
  },
  shortcutLabel: {
    fontFamily: FontFamily.utility,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  shortcutLabelActive: {
    color: Colors.textInverse,
  },
  selectionCard: {
    padding: 18,
    borderRadius: 24,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  selectionLabel: {
    fontFamily: FontFamily.utilityBold,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  selectionValue: {
    fontFamily: FontFamily.content,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    lineHeight: 21,
  },
  calendarCard: {
    padding: 18,
    borderRadius: 28,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 16,
  },
  calendarHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  monthButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.surface,
  },
  monthLabel: {
    fontFamily: FontFamily.utilityBold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    textTransform: "capitalize",
  },
  weekHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  weekdayLabel: {
    width: `${100 / 7}%`,
    textAlign: "center",
    fontFamily: FontFamily.utility,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    position: "relative",
  },
  dayCellInRange: {
    backgroundColor: Colors.surface,
  },
  dayCellSelected: {
    backgroundColor: Colors.black,
  },
  dayText: {
    fontFamily: FontFamily.content,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  dayTextInRange: {
    fontFamily: FontFamily.utility,
  },
  dayTextSelected: {
    color: Colors.textInverse,
    fontFamily: FontFamily.utilityBold,
  },
  todayDot: {
    position: "absolute",
    bottom: 12,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.textPrimary,
  },
  applyButton: {
    marginTop: 18,
    marginHorizontal: 20,
    height: 54,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.black,
  },
  applyButtonDisabled: {
    backgroundColor: Colors.borderStrong,
  },
  applyLabel: {
    fontFamily: FontFamily.utilityBold,
    fontSize: FontSize.base,
    color: Colors.textInverse,
  },
});
