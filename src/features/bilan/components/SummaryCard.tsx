import { Colors } from "@/constants/colors";
import { FontFamily, FontSize } from "@/constants/typography";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface SummaryCardProps {
  label: string;
  value: string;
  tone?: "default" | "positive" | "negative";
  helper?: string;
  fullWidth?: boolean;
}

export default function SummaryCard({
  label,
  value,
  tone = "default",
  helper,
  fullWidth = false,
}: SummaryCardProps) {
  const valueColor =
    tone === "positive"
      ? Colors.successText
      : tone === "negative"
      ? Colors.dangerText
      : Colors.textPrimary;

  return (
    <View style={[styles.card, fullWidth && styles.fullWidth]}>
      <Text style={styles.label} selectable>
        {label}
      </Text>
      <Text style={[styles.value, { color: valueColor }]} selectable>
        {value}
      </Text>
      {helper ? (
        <Text style={styles.helper} selectable>
          {helper}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 124,
    padding: 18,
    borderRadius: 24,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: "space-between",
  },
  fullWidth: {
    flexBasis: "100%",
  },
  label: {
    fontFamily: FontFamily.utilityBold,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  value: {
    fontFamily: FontFamily.display,
    fontSize: FontSize["4xl"],
    lineHeight: 30,
    fontVariant: ["tabular-nums"],
  },
  helper: {
    fontFamily: FontFamily.content,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
});
