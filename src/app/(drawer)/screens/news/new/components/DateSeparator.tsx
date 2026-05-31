import { StyleSheet, Text, View } from "react-native";
import { Colors } from "@/constants/colors";
import { FontFamily, FontSize } from "@/constants/typography";
import { Radius } from "@/constants/layout";

type Props = {
  label: string;
};

export default function DateSeparator({ label }: Props) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.pill}>
        <Text style={styles.label}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    marginVertical: 12,
  },
  pill: {
    backgroundColor: Colors.surfaceAlt,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: Radius.full,
  },
  label: {
    color: Colors.textSecondary,
    fontFamily: FontFamily.utility,
    fontSize: FontSize.sm,
  },
});
