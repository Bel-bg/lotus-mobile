// src/components/ads/bannerData.ts
export interface BannerItem {
  id: string;
  image: any;
}

// Images locales
export const bannerImages: BannerItem[] = [
  {
    id: '1',
    image: require('@/assets/ads/ad5.png'),
  },
  {
    id: '2',
    image: require('@/assets/ads/ad3.png'),
  },
  {
    id: '3',
    image: require('@/assets/ads/ad6.png'),
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
    image: { uri: 'https://i.pinimg.com/1200x/68/f2/da/68f2da1b15939683c9b8d4781829d3a6.jpg' },
  },
  {
    id: '2',
    image: { uri: 'https://i.pinimg.com/736x/ba/0b/13/ba0b133fcc329015d1e7b271eb4dd443.jpg' },
  },
  {
    id: '3',
    image: { uri: 'https://i.pinimg.com/1200x/ba/c4/96/bac4969c7ff1026d609b4556c7784c06.jpg' },
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
