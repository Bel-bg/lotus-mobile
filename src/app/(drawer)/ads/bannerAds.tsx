// app/components/BannerAdsWithProgress.tsx
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  Animated,
  Platform,
} from 'react-native';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

interface BannerItem {
  id: string;
  image: any;
}

interface BannerAdsWithProgressProps {
  banners: BannerItem[];
  redirectPath: string;
  autoPlay?: boolean;
  interval?: number; // 2000ms par défaut
  height?: number;
  borderRadius?: number;
  onBannerPress?: () => void;
  showProgress?: boolean;
}

const BannerAdsWithProgress: React.FC<BannerAdsWithProgressProps> = ({
  banners,
  redirectPath,
  autoPlay = true,
  interval = 2000,
  height = 180,
  borderRadius = 12,
  onBannerPress,
  showProgress = true,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const progressAnim = useRef(new Animated.Value(0)).current;
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Animation de progression
  useEffect(() => {
    if (autoPlay && !isPaused && banners.length > 1) {
      progressAnim.setValue(0);
      
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: interval,
        useNativeDriver: false,
      }).start();

      timerRef.current = setInterval(() => {
        const nextIndex = (currentIndex + 1) % banners.length;
        scrollToIndex(nextIndex);
      }, interval);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [currentIndex, autoPlay, isPaused, interval, banners.length]);

  const scrollToIndex = (index: number) => {
    flatListRef.current?.scrollToIndex({
      index,
      animated: true,
    });
    setCurrentIndex(index);
  };

  const handleBannerPress = () => {
    if (onBannerPress) {
      onBannerPress();
    } else {
      router.push(redirectPath as any);
    }
  };

  const renderBanner = ({ item }: { item: BannerItem }) => (
    <TouchableOpacity
      style={[
        styles.bannerContainer,
        {
          height,
          borderRadius,
        },
      ]}
      onPress={handleBannerPress}
      activeOpacity={0.9}
    >
      <Image
        source={item.image}
        style={styles.bannerImage}
        resizeMode="cover"
      />
    </TouchableOpacity>
  );

  const onScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / (width - 32));
    if (index !== currentIndex) {
      setCurrentIndex(index);
    }
  };

  if (banners.length === 0) return null;

  return (
    <View style={styles.container}>
      {/* Carousel */}
      <FlatList
        ref={flatListRef}
        data={banners}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        renderItem={renderBanner}
        keyExtractor={(item) => item.id}
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.listContainer}
        snapToInterval={width - 32}
        decelerationRate="fast"
      />


      {/* Indicateurs (dots) */}
      {banners.length > 1 && (
        <View style={styles.dotsContainer}>
          {banners.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                currentIndex === index && styles.dotActive,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginVertical: 8,
  },
  listContainer: {
    paddingHorizontal: 0,
  },
  bannerContainer: {
    width: width - 32,
    height: 180,
    overflow: 'hidden',
    // backgroundColor: '#f5f5f5',
    // ...Platform.select({
    //   ios: {
    //     shadowColor: '#000',
    //     shadowOffset: { width: 0, height: 2 },
    //     shadowOpacity: 0.1,
    //     shadowRadius: 8,
    //   },
    //   android: {
    //     elevation: 4,
    //   },
    // }),
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    objectFit: "contain"
  },
  progressContainer: {
    width: width - 64,
    height: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 2,
    marginTop: 12,
    overflow: 'hidden',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  dotActive: {
    backgroundColor: '#000000',
    width: 20,
  },
});

export default BannerAdsWithProgress;