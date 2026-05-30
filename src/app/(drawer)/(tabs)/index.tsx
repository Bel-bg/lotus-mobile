import React from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Text
} from "react-native";
import CustomTopBar from "@/components/customs/customTopBar";


export default function HomeScreen() {

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <CustomTopBar type="home" />
      <View style={styles.content}>
        <Text>A ce niveau il y aura le Catalogue de Produits</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 30,
  },
  content: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
});
