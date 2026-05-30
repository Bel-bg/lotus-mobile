import React from "react";
import { StyleSheet, SafeAreaView } from "react-native";
import CustomTopBar from "@/components/customs/customTopBar";
import InventaireDashboard from "@/app/(drawer)/screens/inventaire";

export default function StockScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <CustomTopBar type="stock" />
      <InventaireDashboard />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
