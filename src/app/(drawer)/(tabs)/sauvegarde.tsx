import CustomTopBar from "@/components/customs/customTopBar";
import { Colors } from "@/constants/colors";
import { FontFamily } from "@/constants/typography";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DocumentsScreen from "./sauvegarde/documents";

export default function SauvegardeScreen() {
  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <CustomTopBar type="sauvegarde" />
      <View style={styles.content}>
        <DocumentsScreen showHeader={false} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
  },
  title: {
    fontFamily: FontFamily.utilityBold,
    fontSize: 20,
    color: Colors.textPrimary,
  },
});
