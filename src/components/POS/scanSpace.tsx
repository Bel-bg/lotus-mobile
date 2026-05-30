// ============================================
// LOTUS BUSINESS — Composant : ScanSpace
// ============================================
// Zone de scan avec caméra pour codes-barres

import { CameraView, useCameraPermissions, BarcodeScanningResult } from "expo-camera";
import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, Text, TouchableOpacity, View, Animated } from "react-native";
import { setAudioModeAsync, useAudioPlayer } from "expo-audio";
import { Colors } from "@/constants/colors";
import { FontFamily } from "@/constants/typography";
import CustomAlert from "../customs/Alert";
import { X } from "lucide-react-native";
import { useRouter } from "expo-router";

interface ScanSpaceProps {
  onScan: (barcode: string) => void;
}

export default function ScanSpace({ onScan }: ScanSpaceProps) {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const scanAnim = useRef(new Animated.Value(0)).current;
  const scanSound = useAudioPlayer(require("@/assets/sound/scan.mp3"));

  // Scan line animation
  useEffect(() => {
    const startAnimation = () => {
      scanAnim.setValue(0);
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanAnim, {
            toValue: 240, // Height of focusedContainer
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(scanAnim, {
            toValue: 0,
            duration: 1200,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    if (permission?.granted) {
      startAnimation();
    }
  }, [permission, scanAnim]);

  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      interruptionMode: "mixWithOthers",
    }).catch((error) => {
      console.warn("Impossible de configurer le son du scanner:", error);
    });
  }, []);

  const playScanSound = () => {
    try {
      if (scanSound) {
        scanSound.seekTo(0);
        scanSound.play();
      }
    } catch (error) {
      console.warn("Impossible de lire le son du scanner:", error);
    }
  };

  const handleBarCodeScanned = (result: BarcodeScanningResult) => {
    if (result.data && !scanned) {
      setScanned(true);
      playScanSound();
      onScan(result.data);
      // Wait a bit before allowing another scan to avoid duplicates
      setTimeout(() => setScanned(false), 2000);
    }
  };

  if (!permission) {
    return <View style={styles.loadingContainer} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.fullContainer}>
        <CustomAlert
          isVisible={true}
          title="Accès Caméra Requis"
          description="Pour scanner les produits, Lotus Business a besoin d'accéder à votre caméra."
          iconName="Camera"
          color={Colors.accent}
          primaryButtonLabel="Accorder l'accès"
          onPrimaryPress={requestPermission}
          onClose={() => router.back()}
        />
      </View>
    );
  }

  return (
    <View style={styles.fullContainer}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["ean13", "ean8", "qr", "upc_a", "upc_e", "code128"],
        }}
      >
        <View style={styles.overlay}>
          {/* Darkened edges */}
          <View style={styles.unfocusedContainer} />
          <View style={styles.middleRow}>
            <View style={styles.unfocusedContainer} />
            <View style={styles.focusedContainer}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
              
              {/* Scan Line Animation (Purely visual indicator) */}
              <Animated.View 
                style={[
                  styles.scanLine, 
                  { transform: [{ translateY: scanAnim }] }
                ]} 
              />
            </View>
            <View style={styles.unfocusedContainer} />
          </View>
          <View style={styles.unfocusedContainer} />
        </View>

        {/* Header Overlay */}
        <View style={styles.topBar}>
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={() => router.back()}
          >
            <X size={24} color={Colors.textInverse} />
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>Scanner un produit</Text>
        </View>

        {/* Footer info */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Alignez le code-barres dans le cadre
          </Text>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  fullContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  overlay: {
    flex: 1,
  },
  unfocusedContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  middleRow: {
    flexDirection: "row",
    height: 240,
  },
  focusedContainer: {
    width: 280,
    height: 240,
    backgroundColor: "transparent",
    position: 'relative',
  },
  scanLine: {
    width: '100%',
    height: 3,
    backgroundColor: Colors.accent,
    position: 'absolute',
    top: 0,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 15,
  },
  topBar: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 16,
  },
  topBarTitle: {
    fontFamily: FontFamily.display,
    fontSize: 18,
    color: Colors.textInverse,
    fontWeight: '700',
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  footerText: {
    fontFamily: FontFamily.content,
    color: Colors.textInverse,
    textAlign: 'center',
    fontSize: 15,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    overflow: 'hidden',
  },
  corner: {
    position: "absolute",
    width: 40,
    height: 40,
    borderColor: Colors.textInverse,
  },
  topLeft: {
    top: -2,
    left: -2,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 20,
  },
  topRight: {
    top: -2,
    right: -2,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 20,
  },
  bottomLeft: {
    bottom: -2,
    left: -2,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 20,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 20,
  },
});
