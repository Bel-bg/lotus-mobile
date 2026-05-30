import { Colors } from "@/constants/colors";
import { FontFamily, FontSize } from "@/constants/typography";
import { ChevronDown, ChevronUp } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface VoirPlusButtonProps {
  expanded: boolean;
  hiddenCount: number;
  onPress: () => void;
}

export default function VoirPlusButton({
  expanded,
  hiddenCount,
  onPress,
}: VoirPlusButtonProps) {
  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
      activeOpacity={0.78}
    >
      <Text style={styles.label} selectable>
        {expanded
          ? "Voir moins"
          : `Voir plus${hiddenCount > 0 ? ` (${hiddenCount})` : ""}`}
      </Text>
      <View style={styles.iconWrap}>
        {expanded ? (
          <ChevronUp size={16} color={Colors.textPrimary} strokeWidth={2.4} />
        ) : (
          <ChevronDown size={16} color={Colors.textPrimary} strokeWidth={2.4} />
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  label: {
    fontFamily: FontFamily.utilityBold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  iconWrap: {
    width: 18,
    alignItems: "center",
    justifyContent: "center",
  },
});
