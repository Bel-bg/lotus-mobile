import { Colors } from "@/constants/colors";
import { FontFamily, FontSize } from "@/constants/typography";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  useBottomSheetModal,
} from "@gorhom/bottom-sheet";
import { X } from "lucide-react-native";
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { BilanDateRange, PickerMode } from "./bilan.types";
import { getDateRangeLabel, normalizeDateRange } from "../bilan.service";
import CalendarPanel from "./Calendarpanel";
import ModeTab from "./ Modetab";
import ShortcutPanel from "./Shortcutpanel";

// ─── API publique ────────────────────────────────────────────────────────────

export interface DateRangePickerRef {
  open: () => void;
  close: () => void;
}

export interface DateRangePickerProps {
  value: BilanDateRange;
  onChange: (nextRange: BilanDateRange) => void;
}

// ─── Composant ───────────────────────────────────────────────────────────────

const DateRangePicker = forwardRef<DateRangePickerRef, DateRangePickerProps>(
  ({ value, onChange }, ref) => {
    const insets = useSafeAreaInsets();
    const sheetRef = useRef<BottomSheetModal>(null);

    // Mode actif
    const [mode, setMode] = useState<PickerMode>(
      value.shortcut === "custom" ? "custom" : "shortcuts"
    );

    // Draft local
    const [draft, setDraft] = useState<BilanDateRange>(value);

    // Animation du panneau lors du switch de mode
    const panelOpacity = useSharedValue(1);
    const panelY = useSharedValue(0);

    // Expose open/close au parent via ref
    useImperativeHandle(ref, () => ({
      open: () => {
        setDraft(value);
        setMode(value.shortcut === "custom" ? "custom" : "shortcuts");
        sheetRef.current?.present();
      },
      close: () => sheetRef.current?.dismiss(),
    }));

    // Sync si `value` change depuis l'extérieur pendant que le sheet est fermé
    useEffect(() => {
      setDraft(value);
      setMode(value.shortcut === "custom" ? "custom" : "shortcuts");
    }, [value]);

    // Switch de mode avec fade
    const handleModeChange = (nextMode: PickerMode) => {
      panelOpacity.value = withTiming(0, { duration: 130 });
      panelY.value = withTiming(6, { duration: 130 });
      setTimeout(() => {
        setMode(nextMode);
        panelOpacity.value = withTiming(1, { duration: 200 });
        panelY.value = withTiming(0, { duration: 200 });
      }, 130);
    };

    const panelStyle = useAnimatedStyle(() => ({
      opacity: panelOpacity.value,
      transform: [{ translateY: panelY.value }],
    }));

    // Raccourci → appliqué et fermé immédiatement
    const handleShortcutSelect = (range: BilanDateRange) => {
      onChange(range);
      sheetRef.current?.dismiss();
    };

    // Plage custom → confirmée et fermée
    const handleCustomApply = (range: BilanDateRange) => {
      onChange(range);
      sheetRef.current?.dismiss();
    };

    // Backdrop custom avec le bon comportement
    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.5}
          pressBehavior="close"
        />
      ),
      []
    );

    const normalizedDraft = normalizeDateRange(draft);
    const headerLabel = getDateRangeLabel(normalizedDraft);

    return (
      <BottomSheetModal
        ref={sheetRef}
        enableDynamicSizing
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={styles.handle}
        backgroundStyle={styles.background}
        maxDynamicContentSize={700}
      >
        <BottomSheetScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom, 24) },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Header ── */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.kicker}>Période du bilan</Text>
              <Text style={styles.headerTitle} numberOfLines={1}>
                {headerLabel}
              </Text>
            </View>
          </View>

          {/* ── Mode Tab ── */}
          <View style={styles.tabWrap}>
            <ModeTab mode={mode} onChange={handleModeChange} />
          </View>

          {/* ── Panneau actif ── */}
          <Animated.View style={[styles.panel, panelStyle]}>
            {mode === "shortcuts" ? (
              <ShortcutPanel
                current={normalizedDraft}
                onSelect={handleShortcutSelect}
              />
            ) : (
              <CalendarPanel
                draft={draft}
                onDraftChange={setDraft}
                onApply={handleCustomApply}
              />
            )}
          </Animated.View>
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  }
);

DateRangePicker.displayName = "DateRangePicker";
export default DateRangePicker;

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
  },
  background: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  scrollContent: {
    paddingTop: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 12,
  },
  headerLeft: {
    flex: 1,
    gap: 5,
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
    lineHeight: 26,
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
  tabWrap: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 4,
  },
  panel: {
    paddingHorizontal: 20,
    paddingTop: 18,
  },
});