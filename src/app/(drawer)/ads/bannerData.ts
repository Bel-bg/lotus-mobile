// app/data/bannerData.ts
export interface BannerItem {
  id: string;
  image: any;
}

// Images locales
export const bannerImages: BannerItem[] = [
  {
    id: '1',
    image: require('@/assets/ads/ad3.png'),
  },
  {
    id: '2',
    image: require('@/assets/ads/ad3.png'),
  },
  {
    id: '3',
    image: require('@/assets/ads/ad3.png'),
  },
  {
    id: '4',
    image: require('@/assets/ads/ad3.png'),
  },
];

// Images distantes (URLs)
export const bannerImagesRemote: BannerItem[] = [
  {
    id: '1',
    image: { uri: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=400&fit=crop' },
  },
  {
    id: '2',
    image: { uri: 'https://images.unsplash.com/photo-1520342868574-5fa3804e551c?w=800&h=400&fit=crop' },
  },
  {
    id: '3',
    image: { uri: 'https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=800&h=400&fit=crop' },
  },
];

// Mix local + distant
export const bannerImagesMix: BannerItem[] = [
  {
    id: '1',
    image: require('@/assets/ads/ad3.png'),
  },
  {
    id: '2',
    image: { uri: 'https://images.unsplash.com/photo-1520342868574-5fa3804e551c?w=800&h=400&fit=crop' },
  },
  {
    id: '3',
    image: require('@/assets/ads/ad3.png'),
  },
];