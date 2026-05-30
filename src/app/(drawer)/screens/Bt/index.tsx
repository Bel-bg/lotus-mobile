// ============================================
// LOTUS BUSINESS — Écran : Bluetooth / Imprimantes
// ============================================

import { useRouter } from 'expo-router'
import {
  AlertCircle,
  ArrowLeft,
  Bluetooth,
  BluetoothOff,
  CheckCircle2,
  Loader2,
  Printer,
  RefreshCw,
  Star,
  Trash2,
  Unplug,
  Wifi,
} from 'lucide-react-native'
import React, { useEffect, useRef } from 'react'
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Colors } from '../../../../constants/colors'
import { FontFamily } from '../../../../constants/typography'
import { BluetoothDevice } from '../../../../store/useBluetoothStore'
import { useBluetooth } from './_hooks/useBluetooth'

// ── Carte appareil ────────────────────────────────────────────────────────────

interface DeviceCardProps {
  device: BluetoothDevice
  isConnected: boolean
  isConnecting: boolean
  isSaved: boolean
  onConnect: () => void
  onDisconnect: () => void
  onRemoveSaved: () => void
}

function DeviceCard({
  device,
  isConnected,
  isConnecting,
  isSaved,
  onConnect,
  onDisconnect,
  onRemoveSaved,
}: DeviceCardProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current

  useEffect(() => {
    if (isConnected) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.4, duration: 1000, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        ])
      )
      pulse.start()
      return () => pulse.stop()
    } else {
      pulseAnim.setValue(1)
    }
  }, [isConnected, pulseAnim])

  return (
    <View style={[styles.deviceCard, isConnected && styles.deviceCardConnected]}>
      {/* Indicateur connexion */}
      <View style={styles.deviceLeft}>
        <View style={[styles.deviceIconWrap, isConnected && styles.deviceIconWrapConnected]}>
          {isConnected ? (
            <View style={styles.pulseWrapper}>
              <Animated.View style={[styles.pulseDot, { transform: [{ scale: pulseAnim }] }]} />
              <Printer size={20} color={Colors.success} strokeWidth={2} />
            </View>
          ) : (
            <Printer size={20} color={Colors.textSecondary} strokeWidth={2} />
          )}
        </View>

        <View style={styles.deviceInfo}>
          <Text style={styles.deviceName} numberOfLines={1}>
            {device.name}
          </Text>
          <Text style={styles.deviceAddress}>{device.address}</Text>
          <View style={styles.deviceTags}>
            {device.bonded && (
              <View style={styles.tag}>
                <Text style={styles.tagText}>Appairé</Text>
              </View>
            )}
            {isSaved && (
              <View style={[styles.tag, styles.tagSaved]}>
                <Star size={9} color={Colors.warning} strokeWidth={2.5} />
                <Text style={[styles.tagText, styles.tagTextSaved]}>Sauvegardé</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.deviceActions}>
        {isConnected ? (
          <TouchableOpacity
            style={[styles.actionBtn, styles.actionBtnDanger]}
            onPress={onDisconnect}
            activeOpacity={0.8}
          >
            <Unplug size={15} color='#FFFFFF' strokeWidth={2.5} />
            <Text style={styles.actionBtnTextLight}>Déco.</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.actionBtn, styles.actionBtnPrimary]}
            onPress={onConnect}
            disabled={isConnecting}
            activeOpacity={0.8}
          >
            {isConnecting ? (
              <ActivityIndicator size='small' color='#FFFFFF' />
            ) : (
              <>
                <Wifi size={15} color='#FFFFFF' strokeWidth={2.5} />
                <Text style={styles.actionBtnTextLight}>Connecter</Text>
              </>
            )}
          </TouchableOpacity>
        )}
        {isSaved && !isConnected && (
          <TouchableOpacity
            style={styles.removeBtn}
            onPress={onRemoveSaved}
            activeOpacity={0.7}
          >
            <Trash2 size={15} color={Colors.danger} strokeWidth={2} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

// ── Écran principal ───────────────────────────────────────────────────────────

export default function BluetoothScreen() {
  const router = useRouter()
  const {
    isConnected,
    connectedDevice,
    savedDevices,
    discoveredDevices,
    isScanning,
    isConnecting,
    btEnabled,
    error,
    scan,
    connect,
    disconnect,
    removeDevice,
    clearError,
  } = useBluetooth()

  // Animation du bouton scan
  const scanRotateAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (isScanning) {
      const rotate = Animated.loop(
        Animated.timing(scanRotateAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        })
      )
      rotate.start()
      return () => rotate.stop()
    } else {
      scanRotateAnim.setValue(0)
    }
  }, [isScanning, scanRotateAnim])

  const rotateInterpolate = scanRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  })

  // Fusionner appareils découverts et sauvegardés sans doublons
  const allDevices = [
    ...discoveredDevices,
    ...savedDevices.filter(
      (s) => !discoveredDevices.some((d) => d.address === s.address)
    ),
  ]

  const renderDevice = ({ item }: { item: BluetoothDevice }) => {
    const deviceIsConnected =
      isConnected && connectedDevice?.address === item.address
    const deviceIsSaved = savedDevices.some((s) => s.address === item.address)
    const deviceIsConnecting = isConnecting && !deviceIsConnected

    return (
      <DeviceCard
        device={item}
        isConnected={deviceIsConnected}
        isConnecting={deviceIsConnecting}
        isSaved={deviceIsSaved}
        onConnect={() => connect(item)}
        onDisconnect={() => disconnect()}
        onRemoveSaved={() => removeDevice(item.address)}
      />
    )
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* ── Header ─────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <ArrowLeft size={20} color={Colors.textPrimary} strokeWidth={2.5} />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Bluetooth size={22} color={Colors.textPrimary} strokeWidth={2} />
          <Text style={styles.headerText}>Imprimante BT</Text>
        </View>
        <View style={styles.btStatusBadge}>
          {btEnabled ? (
            <Bluetooth size={14} color={Colors.success} strokeWidth={2.5} />
          ) : (
            <BluetoothOff size={14} color={Colors.danger} strokeWidth={2.5} />
          )}
          <Text
            style={[
              styles.btStatusText,
              btEnabled ? styles.btStatusOn : styles.btStatusOff,
            ]}
          >
            {btEnabled ? 'Activé' : 'Désactivé'}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Statut connexion actuelle ─────────────────────── */}
        <View
          style={[
            styles.statusCard,
            isConnected ? styles.statusCardConnected : styles.statusCardDisconnected,
          ]}
        >
          <View style={styles.statusCardLeft}>
            {isConnected ? (
              <CheckCircle2 size={28} color={Colors.success} strokeWidth={2} />
            ) : (
              <BluetoothOff size={28} color={Colors.textTertiary} strokeWidth={2} />
            )}
            <View>
              <Text style={styles.statusLabel}>
                {isConnected ? 'Connecté' : 'Non connecté'}
              </Text>
              <Text style={styles.statusSub}>
                {isConnected
                  ? connectedDevice?.name ?? 'Imprimante inconnue'
                  : 'Aucune imprimante détectée'}
              </Text>
            </View>
          </View>
          {isConnected && (
            <TouchableOpacity
              style={styles.disconnectBtn}
              onPress={disconnect}
              activeOpacity={0.8}
            >
              <Text style={styles.disconnectBtnText}>Déconnecter</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── Erreur ───────────────────────────────────────── */}
        {error && (
          <View style={styles.errorBanner}>
            <AlertCircle size={16} color={Colors.danger} strokeWidth={2} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={clearError}>
              <Text style={styles.errorClose}>✕</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Bouton scan ─────────────────────────────────── */}
        <TouchableOpacity
          style={[styles.scanBtn, isScanning && styles.scanBtnActive]}
          onPress={scan}
          disabled={isScanning}
          activeOpacity={0.85}
        >
          <Animated.View style={{ transform: [{ rotate: rotateInterpolate }] }}>
            <RefreshCw size={18} color='#FFFFFF' strokeWidth={2.5} />
          </Animated.View>
          <Text style={styles.scanBtnText}>
            {isScanning ? 'Recherche en cours...' : 'Rechercher des imprimantes'}
          </Text>
        </TouchableOpacity>

        {/* ── Liste des appareils ──────────────────────────── */}
        {allDevices.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Appareils disponibles ({allDevices.length})
            </Text>
            {allDevices.map((device) => (
              <View key={device.address}>
                {renderDevice({ item: device })}
              </View>
            ))}
          </View>
        ) : isScanning ? (
          <View style={styles.emptyState}>
            <ActivityIndicator size='large' color={Colors.textTertiary} />
            <Text style={styles.emptyText}>Recherche d'imprimantes...</Text>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Printer size={48} color={Colors.surfaceAlt} strokeWidth={1.5} />
            <Text style={styles.emptyTitle}>Aucune imprimante trouvée</Text>
            <Text style={styles.emptyText}>
              Assurez-vous que l'imprimante est allumée{'\n'}et que le Bluetooth est activé.
            </Text>
          </View>
        )}

        {/* ── Notice rebuild ───────────────────────────────── */}
        {Platform.OS === 'android' && (
          <View style={styles.noticeBanner}>
            <Loader2 size={14} color={Colors.info} strokeWidth={2} />
            <Text style={styles.noticeText}>
              Le Bluetooth natif nécessite un build dev client.{' '}
              Exécutez <Text style={styles.noticeCode}>npx expo run:android</Text> si ce n'est pas fait.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },

  // ── Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerText: {
    fontFamily: FontFamily.display,
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: 0.5,
  },
  btStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  btStatusText: {
    fontFamily: FontFamily.utility,
    fontSize: 11,
    fontWeight: '600',
  },
  btStatusOn: { color: Colors.success },
  btStatusOff: { color: Colors.danger },

  // ── Scroll
  scroll: { flex: 1 },
  scrollContent: { padding: 20, gap: 16, paddingBottom: 40 },

  // ── Carte statut
  statusCard: {
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
  },
  statusCardConnected: {
    backgroundColor: Colors.successLight,
    borderColor: Colors.successBorder,
  },
  statusCardDisconnected: {
    backgroundColor: '#F5F5F5',
    borderColor: '#E0E0E0',
  },
  statusCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  statusLabel: {
    fontFamily: FontFamily.display,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  statusSub: {
    fontFamily: FontFamily.utility,
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  disconnectBtn: {
    backgroundColor: Colors.danger,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  disconnectBtnText: {
    fontFamily: FontFamily.utility,
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // ── Erreur
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dangerLight,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.dangerBorder,
  },
  errorText: {
    fontFamily: FontFamily.utility,
    fontSize: 12,
    color: Colors.dangerText,
    flex: 1,
  },
  errorClose: {
    color: Colors.dangerText,
    fontWeight: '700',
    fontSize: 14,
  },

  // ── Scan button
  scanBtn: {
    backgroundColor: Colors.textPrimary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 10,
  },
  scanBtnActive: {
    backgroundColor: '#555555',
  },
  scanBtnText: {
    fontFamily: FontFamily.utility,
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },

  // ── Section
  section: { gap: 10 },
  sectionTitle: {
    fontFamily: FontFamily.utility,
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },

  // ── Device Card
  deviceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  deviceCardConnected: {
    borderColor: Colors.successBorder,
    backgroundColor: Colors.successLight,
  },
  deviceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  deviceIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deviceIconWrapConnected: {
    backgroundColor: Colors.successLight,
  },
  pulseWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseDot: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.success,
    opacity: 0.2,
  },
  deviceInfo: { flex: 1, gap: 2 },
  deviceName: {
    fontFamily: FontFamily.display,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  deviceAddress: {
    fontFamily: FontFamily.utility,
    fontSize: 11,
    color: Colors.textTertiary,
    letterSpacing: 0.5,
  },
  deviceTags: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  tag: {
    backgroundColor: '#EFEFEF',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  tagSaved: {
    backgroundColor: Colors.warningLight,
    borderWidth: 1,
    borderColor: Colors.warningBorder,
  },
  tagText: {
    fontFamily: FontFamily.utility,
    fontSize: 9,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tagTextSaved: { color: Colors.warningText },

  // ── Device actions
  deviceActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
    minWidth: 90,
    justifyContent: 'center',
  },
  actionBtnPrimary: {
    backgroundColor: Colors.textPrimary,
  },
  actionBtnDanger: {
    backgroundColor: Colors.danger,
  },
  actionBtnTextLight: {
    fontFamily: FontFamily.utility,
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  removeBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: Colors.dangerLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.dangerBorder,
  },

  // ── Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  emptyTitle: {
    fontFamily: FontFamily.display,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  emptyText: {
    fontFamily: FontFamily.utility,
    fontSize: 13,
    color: Colors.textTertiary,
    textAlign: 'center',
    lineHeight: 20,
  },

  // ── Notice
  noticeBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.infoLight,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.infoBorder,
  },
  noticeText: {
    fontFamily: FontFamily.utility,
    fontSize: 11,
    color: Colors.infoText,
    flex: 1,
    lineHeight: 17,
  },
  noticeCode: {
    fontFamily: 'monospace',
    backgroundColor: Colors.infoBorder,
    paddingHorizontal: 4,
    borderRadius: 4,
  },
})
