// src/components/ads/adsOverlays.tsx
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  Animated,
  TouchableWithoutFeedback,
} from 'react-native';
import { router } from 'expo-router';
import { X } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

interface AdsOverlayProps {
  onFinish: () => void;
  imageSource: any;
  redirectPath?: string; // Chemin Expo Router ex: "/premium"
  onRedirect?: () => void;
}

const AdsOverlay: React.FC<AdsOverlayProps> = ({
  onFinish,
  imageSource,
  redirectPath,
  onRedirect,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [canClose, setCanClose] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Animation d'entrée
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Timer du compte à rebours
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanClose(true);
          clearInterval(timerRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const handleClose = () => {
    if (canClose) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsVisible(false);
        onFinish();
      });
    }
  };

  const handleAdPress = () => {
    router.push("/premium");
    if (onRedirect) {
      onRedirect();
    }
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsVisible(false);
      onFinish();
    });
  };

  if (!isVisible) return null;

  return (
    <TouchableWithoutFeedback onPress={handleAdPress}>
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <View style={styles.container}>
          <View style={styles.background} />

          <Animated.View
            style={[
              styles.contentContainer,
              {
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <TouchableWithoutFeedback onPress={handleAdPress}>
              <Image
                source={imageSource}
                style={styles.adImage}
                resizeMode="contain"
              />
            </TouchableWithoutFeedback>

            {!canClose && (
              <View style={styles.closeButton}>
                <Text style={styles.timerText}>
                  {countdown}s
                </Text>
              </View>
            )}

            {canClose && (
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleClose}
                activeOpacity={0.7}
              >
                <X size={18} color="#FFF"  />
              </TouchableOpacity>
            )}
          </Animated.View>
        </View>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999999,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  background: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  adImage: {
    width: width * 0.8,
    height: height * 0.6,
    borderRadius: 15,
    marginBottom: 10,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  timerText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  progressBarContainer: {
    width: 200,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  closeButton: {
    justifyContent: "center",
    alignItems: "center",
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    marginTop: 10,
  },
});

export default AdsOverlay;
