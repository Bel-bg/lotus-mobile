import { StyleSheet, Text, View } from "react-native";
import { Megaphone } from "lucide-react-native";
import { Colors } from "@/constants/colors";
import { FontFamily, FontSize } from "@/constants/typography";
import { Radius, Spacing } from "@/constants/layout";

export default function EmptyCanal() {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrapper}>
        <Megaphone size={28} color={Colors.textSecondary} strokeWidth={2} />
      </View>
      <Text style={styles.title}>Aucune publication</Text>
      <Text style={styles.subtitle}>
        Les annonces du canal Lotus Business apparaîtront ici.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 220,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing[6],
  },
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: Radius["2xl"],
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing[4],
    borderWidth: 1,
    borderColor: Colors.border,
  },
  title: {
    color: Colors.textPrimary,
    fontFamily: FontFamily.displaySemi,
    fontSize: FontSize["2xl"],
    marginBottom: Spacing[2],
  },
  subtitle: {
    color: Colors.textSecondary,
    fontFamily: FontFamily.content,
    fontSize: FontSize.base,
    textAlign: "center",
    lineHeight: FontSize.base * 1.6,
  },
});
