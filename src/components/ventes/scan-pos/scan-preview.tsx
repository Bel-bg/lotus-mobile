import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { ScanLine } from "lucide-react-native";
import { Colors } from "@/constants/colors";
import { FontFamily } from "@/constants/typography";

export function ScanPreview() {
  return (
    <View style={styles.fakeCamera}>
      <View style={styles.scanFrame}>
        <ScanLine size={24} color={Colors.textPrimary} />
        <Text style={styles.scanHint}>Zone de scan intelligente</Text>
        <Text style={styles.scanSubHint}>
          Place le produit devant la camera, ou teste avec un code ci-dessous.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fakeCamera: {
    height: "34%",
    marginHorizontal: 20,
    borderRadius: 16,
    backgroundColor: "#141414",
    justifyContent: "center",
    alignItems: "center",
  },
  scanFrame: {
    width: "78%",
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    paddingVertical: 24,
    paddingHorizontal: 12,
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  scanHint: {
    color: "#FFFFFF",
    fontFamily: FontFamily.bold,
    fontSize: 15,
  },
  scanSubHint: {
    color: "#CFCFCF",
    fontFamily: FontFamily.medium,
    fontSize: 12,
    textAlign: "center",
  },
});
