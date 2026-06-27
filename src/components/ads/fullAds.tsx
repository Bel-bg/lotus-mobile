// src/components/ads/fullAds.tsx
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  Animated,
  TouchableWithoutFeedback,
  StatusBar,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { X } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

interface FullAdCarouselProps {
  onFinish: () => void;
  images: any[]; // Tableau d'images
  redirectPath?: string;
  onRedirect?: () => void;
}

const FullAdCarousel: React.FC<FullAdCarouselProps> = ({
  onFinish,
  images,
  redirectPath,
  onRedirect,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [countdown, setCountdown] = useState(5);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [canClose, setCanClose] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  // Timer du compte à rebours
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanClose(true); // 🔥 Active le bouton close
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

  // Auto-slide des images
  useEffect(() => {
    if (images.length > 1) {
      const slideTimer = setInterval(() => {
        setCurrentIndex((prev) => {
          const next = (prev + 1) % images.length;
          flatListRef.current?.scrollToIndex({
            index: next,
            animated: true,
          });
          return next;
        });
      }, 3000);

      return () => clearInterval(slideTimer);
    }
  }, [images.length]);

  const handleAdPress = () => {
    router.push("/premium");
    if (onRedirect) {
      onRedirect();
    }
    
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setIsVisible(false);
      onFinish();
    });
  };

  const handleClose = () => {
    if (canClose) {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setIsVisible(false);
        onFinish();
      });
    }
  };

  if (!isVisible) return null;

  return (
    <TouchableWithoutFeedback onPress={handleAdPress}>
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <StatusBar hidden />
        
        <FlatList
          ref={flatListRef}
          data={images}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <Image source={item} style={styles.fullImage} resizeMode="cover" />
          )}
          keyExtractor={(_, index) => index.toString()}
          scrollEnabled={false}
        />

        <View style={styles.overlay} />

        {/* 🔥 Compteur ou Bouton Close en haut à droite */}
        <View style={styles.topRightContainer}>
          {!canClose ? (
            // Compteur pendant 5s
            <View style={styles.counterBadge}>
              <Text style={styles.counterText}>{countdown}s</Text>
            </View>
          ) : (
            // Bouton Close après 5s
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              activeOpacity={0.7}
            >
              <X size={18} color="#FFFFFF" />
            <Text style={styles.closeButtonText}>Fermer</Text>
            </TouchableOpacity>
          )}
        </View>
        {/* Indicateurs de slide */}
        <View style={styles.dotsContainer}>
          {images.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                currentIndex === index && styles.dotActive,
              ]}
            />
          ))}
        </View>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
    backgroundColor: '#000',
  },
  fullImage: {
    width: width,
    height: height,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  topRightContainer: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
  },
  counterBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  counterText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  closeButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    width: 80,
    height: 40,
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  closeButtonBottom: {
    position: 'absolute',
    bottom: 120,
    alignSelf: 'center',
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    zIndex: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  dotActive: {
    backgroundColor: '#FFFFFF',
    width: 20,
  },
});

export default FullAdCarousel;
