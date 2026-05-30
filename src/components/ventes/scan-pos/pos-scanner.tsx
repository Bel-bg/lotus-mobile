// ============================================
// LOTUS BUSINESS — Composant : POSScanner
// ============================================
// Scanner compact pour la zone de vente

import { CameraView, useCameraPermissions, BarcodeScanningResult } from "expo-camera";
import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, Text, View, Animated, TouchableOpacity } from "react-native";
import { Colors } from "@/constants/colors";
import { FontFamily } from "@/constants/typography";
import CustomAlert from "../../customs/Alert";

interface POSScannerProps {
  onScan: (barcode: string) => void;
}

export function POSScanner({ onScan }: POSScannerProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const scanAnim = useRef(new Animated.Value(0)).current;

  // Animation de la ligne de scan
  useEffect(() => {
    const startAnimation = () => {
      scanAnim.setValue(0);
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanAnim, {
            toValue: 120, // Hauteur de la zone ciblée
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(scanAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    if (permission?.granted) {
      startAnimation();
    }
  }, [permission, scanAnim]);

  const handleBarCodeScanned = (result: BarcodeScanningResult) => {
    if (result.data && !scanned) {
      setScanned(true);
      onScan(result.data);
      // Délai avant le prochain scan
      setTimeout(() => setScanned(false), 2000);
    }
  };

  if (!permission) {
    return <View style={styles.loadingContainer} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <CustomAlert
          isVisible={true}
          title="Accès Caméra"
          description="L'accès à la caméra est nécessaire pour scanner les produits."
          iconName="Camera"
          color={Colors.accent}
          primaryButtonLabel="Autoriser"
          onPrimaryPress={requestPermission}
          onClose={() => {}}
        />
        <Text style={styles.permissionText}>Caméra non autorisée</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["ean13", "ean8", "qr", "upc_a", "upc_e", "code128"],
        }}
      >
        <View style={styles.overlay}>
          <View style={styles.scanArea}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
            
            <Animated.View 
              style={[
                styles.scanLine, 
                { transform: [{ translateY: scanAnim }] }
              ]} 
            />
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: "34%",
    backgroundColor: "#000",
    overflow: 'hidden',
    // borderRadius: 24,
    // marginHorizontal: 16,
    // marginTop: 8,
  },
  loadingContainer: {
    height: "34%",
    backgroundColor: Colors.surface,
    borderRadius: 24,
    marginHorizontal: 16,
    marginTop: 8,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  scanArea: {
    width: 220,
    height: 120,
    backgroundColor: 'transparent',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  scanLine: {
    width: '100%',
    height: 2,
    backgroundColor: Colors.accent,
    position: 'absolute',
    top: 0,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  permissionText: {
    fontFamily: FontFamily.medium,
    color: Colors.textInverse,
    textAlign: 'center',
    marginTop: 'auto',
    marginBottom: 20,
  },
  corner: {
    position: "absolute",
    width: 24,
    height: 24,
    borderColor: Colors.textInverse,
  },
  topLeft: {
    top: -2,
    left: -2,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 12,
  },
  topRight: {
    top: -2,
    right: -2,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 12,
  },
  bottomLeft: {
    bottom: -2,
    left: -2,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 12,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 12,
  },
});
