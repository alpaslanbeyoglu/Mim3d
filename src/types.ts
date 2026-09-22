export type ViewMode = '2D' | '3D' | 'PRESENTATION';

export interface Point {
  x: number;
  y: number;
}

export type OpeningType = 'door' | 'window' | 'french_window' | 'double_door';

export interface Opening {
  id: string;
  type: OpeningType;
  wallIndex: number; // Index of the wall segment (point[i] -> point[i+1])
  distanceFromStart: number; // Meters from point[i]
  width: number; // Width in meters (e.g. 0.9m for door, 1.5m for window)
  height: number; // Height in meters (e.g. 2.1m for door, 1.4m for window)
  sillHeight: number; // Distance from floor (0 for door, ~0.9m for standard window)
}

export type RoofType = 'flat' | 'hip' | 'gable';

export type RoomCategory = 'living_room' | 'bedroom' | 'kitchen' | 'bathroom' | 'balcony' | 'hallway';

export interface SubRoom {
  id: string;
  name: string;
  category: RoomCategory;
  area: number; // m²
  minAreaRequired: number; // Turkey Planned Areas Regulation min m²
}

export interface BalconyProjection {
  id: string;
  wallIndex: number;
  depth: number; // Distance protruding outwards (e.g., 1.2m, max 1.5m regulation)
  isClosed: boolean; // Kapalı çıkma vs Açık balkon
}

export interface RoomData {
  id: string;
  name: string;
  points: Point[]; // Outer perimeter 2D floor points
  wallHeight: number;
  wallThickness: number;
  roofType: RoofType;
  openings: Opening[];
  projections: BalconyProjection[];
  subRooms: SubRoom[];
}

export interface ZoningParams {
  municipality: string;
  parcelArea: number; // Parsel Alanı (m²)
  taks: number; // Taban Alanı Katsayısı (e.g. 0.35)
  kaks: number; // Kat Alanı Kat Sayısı / Emsal (e.g. 1.50)
  isUrbanRenewal: boolean; // Kentsel Dönüşüm Yapısı mı?
  urbanRenewalBonusPercent: number; // Kentsel dönüşüm imar artış % (e.g. 25% or 30%)
  maxFloors: number; // Azami Kat Sayısı / Gabari
  frontSetback: number; // Ön Bahçe Mesafesi (min 5.0m)
  sideSetback: number; // Yan Bahçe Mesafesi (min 3.0m)
  rearSetback: number; // Arka Bahçe Mesafesi (min 3.0m / h/2)
}

export interface ProjectMetaData {
  projectName: string;
  architectName: string;
  city: string;
  district: string;
  adaNo: string;
  parselNo: string;
  date: string;
}

export type ViolationSeverity = 'error' | 'warning' | 'info';

export interface ZoningViolation {
  id: string;
  code: string;
  title: string;
  description: string;
  severity: ViolationSeverity;
  currentValue: string | number;
  allowedValue: string | number;
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

export const MOCK_ZONING_PARAMS: ZoningParams = {
  municipality: 'Kadıköy Belediyesi / İstanbul',
  parcelArea: 500, // 500 m²
  taks: 0.35, // %35 taban oturumu
  kaks: 1.50, // 1.50 emsal
  isUrbanRenewal: true, // Kentsel Dönüşüm kapsamında
  urbanRenewalBonusPercent: 25, // %25 Emsal artışı
  maxFloors: 5,
  frontSetback: 5.0, // 5m ön bahçe
  sideSetback: 3.0, // 3m yan bahçe
  rearSetback: 3.0, // 3m arka bahçe
};

export const MOCK_PROJECT_META: ProjectMetaData = {
  projectName: 'Kadıköy Kentsel Dönüşüm Konut Projesi',
  architectName: 'Mim. Ahmet Yılmaz (Y. Mimar / İMO)',
  city: 'İstanbul',
  district: 'Kadıköy / Caferağa',
  adaNo: '1428',
  parselNo: '12',
  date: new Date().toLocaleDateString('tr-TR'),
};

export const MOCK_ROOMS: RoomData[] = [
  {
    id: 'villa-plan-1',
    name: 'Tip Daire Kat Planı',
    points: [
      { x: -5, y: -4 },
      { x: 5, y: -4 },
      { x: 5, y: 4 },
      { x: -5, y: 4 },
    ],
    wallHeight: 3.0,
    wallThickness: 0.25,
    roofType: 'hip',
    openings: [
      {
        id: 'door-main',
        type: 'door',
        wallIndex: 0,
        distanceFromStart: 4.5,
        width: 1.0,
        height: 2.1,
        sillHeight: 0
      },
      {
        id: 'win-living-1',
        type: 'french_window',
        wallIndex: 2,
        distanceFromStart: 2.5,
        width: 2.0,
        height: 2.2,
        sillHeight: 0.1
      },
      {
        id: 'win-bed-1',
        type: 'window',
        wallIndex: 1,
        distanceFromStart: 2.0,
        width: 1.4,
        height: 1.4,
        sillHeight: 0.9
      }
    ],
    projections: [
      {
        id: 'balcony-1',
        wallIndex: 2,
        depth: 1.4,
        isClosed: false
      }
    ],
    subRooms: [
      { id: 'sr-1', name: 'Salon', category: 'living_room', area: 28.5, minAreaRequired: 12.0 },
      { id: 'sr-2', name: 'Ebeveyn Yatak Odası', category: 'bedroom', area: 14.2, minAreaRequired: 9.0 },
      { id: 'sr-3', name: 'Çocuk Odası', category: 'bedroom', area: 9.5, minAreaRequired: 8.0 },
      { id: 'sr-4', name: 'Mutfak', category: 'kitchen', area: 10.8, minAreaRequired: 5.0 },
      { id: 'sr-5', name: 'Banyo & WC', category: 'bathroom', area: 5.5, minAreaRequired: 3.0 },
      { id: 'sr-6', name: 'Açık Balkon', category: 'balcony', area: 7.0, minAreaRequired: 0 }
    ]
  },
];
