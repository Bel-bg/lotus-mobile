import { Colors } from "@/constants/colors";
import { FontFamily, FontSize } from "@/constants/typography";
import React, { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import type { PickerMode } from "./bilan.types";

interface ModeTabProps {
  mode: PickerMode;
  onChange: (mode: PickerMode) => void;
}

const TABS: { key: PickerMode; label: string }[] = [
  { key: "shortcuts", label: "Raccourcis" },
  { key: "custom", label: "Plage libre" },
];

const TIMING = { duration: 220 };

export default function ModeTab({ mode, onChange }: ModeTabProps) {
  const translateX = useSharedValue(mode === "shortcuts" ? 0 : 1);

  useEffect(() => {
    translateX.value = withTiming(mode === "shortcuts" ? 0 : 1, TIMING);
  }, [mode]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: `${translateX.value * 50}%` as unknown as number }],
    // translateX en pourcentage n'est pas supporté nativement — on utilise une valeur calculée
  }));

  return (
    <View style={styles.container}>
      {/* Pill indicator animé */}
      <Animated.View style={[styles.indicator, indicatorStyle]} />

      {TABS.map((tab) => (
        <Pressable
          key={tab.key}
          style={styles.tab}
          onPress={() => onChange(tab.key)}
          android_ripple={null}
        >
          <Text
            style={[
              styles.label,
              mode === tab.key && styles.labelActive,
            ]}
          >
            {tab.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 4,
    position: "relative",
    overflow: "hidden",
  },
  indicator: {
    position: "absolute",
    top: 4,
    left: 4,
    width: "50%",
    bottom: 4,
    backgroundColor: Colors.black,
    borderRadius: 16,
  },
  tab: {
    flex: 1,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
  },
  label: {
    fontFamily: FontFamily.utility,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  labelActive: {
    fontFamily: FontFamily.utilityBold,
    color: Colors.textInverse,
  },
});