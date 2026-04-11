import { Colors } from "@/constants/colors";
import { FontFamily } from "@/constants/typography";
import { ArrowRight, Clock3 } from "lucide-react-native";
import React from "react";
import {
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

interface TrialBannerProps {
  title: string;
  subtitle: string;
  ctaLabel?: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export default function TrialBanner({
  title,
  subtitle,
  ctaLabel = "Voir",
  onPress,
  style,
}: TrialBannerProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.86}
      onPress={onPress}
      style={[styles.container, style]}
    >
      <View style={styles.iconWrap}>
        <Clock3 size={16} color="#8B5A00" strokeWidth={2.2} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1} selectable>
          {title}
        </Text>
        {/* <Text style={styles.subtitle} numberOfLines={2} selectable>
          {subtitle}
        </Text> */}
      </View>

      <View style={styles.cta}>
        <Text style={styles.ctaText}>{ctaLabel}</Text>
        <ArrowRight size={14} color={Colors.textPrimary} strokeWidth={2.2} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FFF3D6",
    // borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: "#F1DBA8",
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFE7B0",
  },
  content: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: FontFamily.displaySemi,
    fontSize: 13,
    color: Colors.textPrimary,
    letterSpacing: -0.2,
  },
  subtitle: {
    fontFamily: FontFamily.content,
    fontSize: 11,
    color: "#6C5D3E",
    lineHeight: 15,
  },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ctaText: {
    fontFamily: FontFamily.utilityBold,
    fontSize: 10,
    color: Colors.textPrimary,
    letterSpacing: 0.35,
    textTransform: "uppercase",
  },
});
