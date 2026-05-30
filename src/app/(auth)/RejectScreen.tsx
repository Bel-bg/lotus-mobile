import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import TopBar from "../../components/customs/TopBar";
import { Colors } from "../../constants/colors";
import { TextStyles,FontFamily } from "../../constants/typography";
import { StyleSheet, Text, View } from "react-native";

export default function RejectScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <TopBar />
      <View style={styles.content}>
        <Text style={styles.title}>Accès refusé</Text>
        <Text style={styles.description}>
          Votre adresse e-mail n'est pas autorisée à accéder à Lotus Business.
          Veuillez contacter votre administrateur pour plus d'informations.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    color: Colors.danger,
    textAlign: "center",
    fontFamily: FontFamily.display,
  },
  description: {
    ...TextStyles.body,
    fontFamily: FontFamily.content,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: 10,
  },
});
