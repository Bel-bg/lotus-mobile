import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { FontFamily } from "@/constants/typography";
import { useRouter } from "expo-router";

const ITEMS = [
  { id: "1", label: "Dépenses\nAnnexes",    image: require("@/assets/icons/wallet.png"),    route: "/(drawer)/(tabs)/depenses" },
  { id: "2", label: "Seuils\nd'alertes",    image: require("@/assets/icons/alerte.png"),     route: "/(drawer)/(tabs)/alertes" },
  { id: "3", label: "Convertisseur",        image: require("@/assets/icons/converter.png"), route: "/(drawer)/(tabs)/convertisseur" },
  { id: "4", label: "Créanciers",           image: require("@/assets/icons/creancier.png"),  route: "/(drawer)/(tabs)/creanciers" },
  { id: "5", label: "Clients",              image: require("@/assets/icons/client.png"),     route: "/(drawer)/(tabs)/clients" },
  { id: "6", label: "Paramètres",           image: require("@/assets/icons/paramètres.png"),  route: "/(drawer)/(tabs)/parametres" },
  { id: "7", label: "Fournisseurs",         image: require("@/assets/icons/fournisseurs.png"), route: "/(drawer)/(tabs)/fournisseurs" },
//   { id: "8", label: "Catégories\nProduits", image: require("@/assets/icons/bilan.png"),  route: "/(drawer)/(tabs)/categories" }, 
  { id: "9", label: "Notez-nous",              image: require("@/assets/icons/examen.png"),     route: "/(drawer)/(tabs)/scanner" },
];

export default function QuickAccess() {
  const router = useRouter();

  return (
    <View style={styles.wrapper}>
      <Text style={styles.sectionTitle}>Accès rapide</Text>
      <View style={styles.grid}>
        {ITEMS.map((item) => (
          <TouchableOpacity key={item.id} style={styles.cell} activeOpacity={0.65} 
          // onPress={() => router.push(item.route)}
          >
  <View style={styles.circle}>
    <Image source={item.image} style={styles.image} resizeMode="contain" />
  </View>
  <Text style={styles.label}>{item.label}</Text>
</TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
const CIRCLE_SIZE = 64;

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 13,
    color: "#111",
    letterSpacing: 0.4,
    marginBottom: 14,
    textTransform: "uppercase",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  cell: {
    width: "30.5%",
    alignItems: "center",
    gap: 8,
  },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: 32,
    height: 32,
  },
  label: {
    fontFamily: FontFamily.medium,
    fontSize: 11.5,
    color: "#333",
    textAlign: "center",
    lineHeight: 16,
  },
});