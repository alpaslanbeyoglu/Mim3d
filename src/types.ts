export type ViewMode = '2D' | '3D';

export interface Point {
  x: number;
  y: number;
}

export interface RoomData {
  id: string;
  name: string;
  points: Point[]; // 2D floor points
  wallHeight: number;
  wallThickness: number;
}

export interface MaterialOption {
  id: string;
  name: string;
  color: string;
  roughness: number;
  metalness: number;
  previewUrl: string;
  category: 'interior' | 'facade';
}

export const MATERIALS: MaterialOption[] = [
  // Interior
  {
    id: 'oak-parquet',
    name: 'Ahşap Parke',
    color: '#a0522d',
    roughness: 0.3,
    metalness: 0.1,
    category: 'interior',
    previewUrl: 'https://images.unsplash.com/photo-1516156008625-3a9d6067fab5?w=200&q=80',
  },
  {
    id: 'white-marble',
    name: 'Beyaz Mermer',
    color: '#f5f5f5',
    roughness: 0.1,
    metalness: 0.2,
    category: 'interior',
    previewUrl: 'https://images.unsplash.com/photo-1583344195155-44275f68b55d?w=200&q=80',
  },
  {
    id: 'polished-concrete',
    name: 'Beton',
    color: '#808080',
    roughness: 0.6,
    metalness: 0.0,
    category: 'interior',
    previewUrl: 'https://images.unsplash.com/photo-1533038590840-1cde6e668a91?w=200&q=80',
  },
  {
    id: 'ceramic-tile',
    name: 'Seramik',
    color: '#e2e8f0',
    roughness: 0.2,
    metalness: 0.1,
    category: 'interior',
    previewUrl: 'https://images.unsplash.com/photo-1595113316349-9fa4eb24f884?w=200&q=80',
  },
  // Facade
  {
    id: 'composite-panel',
    name: 'Kompozit Panel',
    color: '#334155',
    roughness: 0.2,
    metalness: 0.8,
    category: 'facade',
    previewUrl: 'https://images.unsplash.com/photo-1516724562728-afc824a36e84?w=200&q=80',
  },
  {
    id: 'wood-cladding',
    name: 'Ahşap Giydirme',
    color: '#78350f',
    roughness: 0.8,
    metalness: 0.0,
    category: 'facade',
    previewUrl: 'https://images.unsplash.com/photo-1449156001935-91391d720500?w=200&q=80',
  },
  {
    id: 'stone-cladding',
    name: 'Taş Kaplama',
    color: '#57534e',
    roughness: 0.9,
    metalness: 0.0,
    category: 'facade',
    previewUrl: 'https://images.unsplash.com/photo-1517581177682-a085bb7ffb15?w=200&q=80',
  },
  {
    id: 'industrial-brick',
    name: 'Endüstriyel Tuğla',
    color: '#991b1b',
    roughness: 0.7,
    metalness: 0.0,
    category: 'facade',
    previewUrl: 'https://images.unsplash.com/photo-1523413651479-597eb2da0ad6?w=200&q=80',
  },
];

export const MOCK_ROOMS: RoomData[] = [
  {
    id: 'living-room',
    name: 'Oturma Odası',
    points: [
      { x: -4, y: -4 },
      { x: 4, y: -4 },
      { x: 4, y: 4 },
      { x: -4, y: 4 },
    ],
    wallHeight: 3,
    wallThickness: 0.2,
  },
];

