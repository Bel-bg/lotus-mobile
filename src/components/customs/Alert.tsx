// ============================================
// LOTUS BUSINESS — Composant : CustomAlert
// ============================================

import React from 'react'
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native'
import * as LucideIcons from 'lucide-react-native'
import { Colors } from '../../constants/colors'
import { FontFamily, FontSize, TextStyles } from '../../constants/typography'

const { width } = Dimensions.get('window')

interface CustomAlertProps {
  isVisible: boolean
  onClose: () => void
  title: string
  description: string
  iconName?: keyof typeof LucideIcons
  icon?: React.ReactNode
  color?: string
  primaryButtonLabel: string
  onPrimaryPress: () => void
  secondaryButtonLabel?: string
  onSecondaryPress?: () => void
}

export default function CustomAlert({
  isVisible,
  onClose,
  title,
  description,
  iconName = 'Check',
  icon,
  color = Colors.success,
  primaryButtonLabel,
  onPrimaryPress,
  secondaryButtonLabel,
  onSecondaryPress,
}: CustomAlertProps) {
  
  const IconComponent = iconName ? (LucideIcons[iconName] as any) : null

  return (
    <Modal
      transparent
      visible={isVisible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.container}>
              {/* Overlapping Icon Container */}
              <View style={[styles.iconWrapper, { backgroundColor: color }]}>
                {icon ? (
                  icon
                ) : (
                  IconComponent && (
                    <IconComponent size={32} color="#FFFFFF" strokeWidth={3} />
                  )
                )}
              </View>

              {/* Content Card */}
              <View style={styles.card}>
                <View style={styles.contentWrap}>
                  <Text style={styles.title}>{title}</Text>
                  <Text style={styles.description}>{description}</Text>
                </View>

                {/* Buttons Section */}
                <View style={styles.footer}>
                  {secondaryButtonLabel && (
                    <TouchableOpacity
                      style={[styles.button, styles.secondaryButton]}
                      onPress={onSecondaryPress || onClose}
                    >
                      <Text style={[styles.buttonText, styles.secondaryButtonText]}>
                        {secondaryButtonLabel}
                      </Text>
                    </TouchableOpacity>
                  )}
                  
                  <TouchableOpacity
                    style={[
                      styles.button,
                      { backgroundColor: color },
                      secondaryButtonLabel ? styles.halfButton : styles.fullButton,
                    ]}
                    onPress={onPrimaryPress}
                  >
                    <Text style={styles.buttonText}>{primaryButtonLabel}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  container: {
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
  },
  iconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    borderWidth: 6,
    borderColor: '#FFFFFF',
    marginBottom: -40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    width: '100%',
    paddingHorizontal: 24,
    paddingTop: 60, // Space for the overlapping icon
    paddingBottom: 24,
    alignItems: 'center',
    overflow: 'hidden',
    
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  contentWrap: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    ...TextStyles.h3,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    ...TextStyles.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  footer: {
    width: '100%',
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    height: 54,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  fullButton: {
    width: '100%',
  },
  halfButton: {
    flex: 1,
  },
  buttonText: {
    ...TextStyles.button,
    color: '#FFFFFF',
  },
  secondaryButton: {
    backgroundColor: '#F5F5F5',
  },
  secondaryButtonText: {
    color: Colors.textSecondary,
  },
})