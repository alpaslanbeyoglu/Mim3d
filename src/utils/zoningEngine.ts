import { RoomData, ZoningParams, ZoningViolation } from '../types';

// Calculates polygon area using Shoelace formula
export function calculatePolygonArea(points: { x: number; y: number }[]): number {
  let area = 0;
  const n = points.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += points[i].x * points[j].y;
    area -= points[j].x * points[i].y;
  }
  return Math.abs(area) / 2;
}

export function evaluateZoningCompliance(
  room: RoomData,
  zoning: ZoningParams,
  floorCount: number
): {
  buildingBaseArea: number; // Taban Alanı (m²)
  totalConstructionArea: number; // Toplam İnşaat Alanı (m²)
  maxAllowedBaseArea: number; // İzin Verilen Max Taban Alanı
  maxAllowedTotalArea: number; // İzin Verilen Max Toplam İnşaat Alanı (Emsal)
  violations: ZoningViolation[];
} {
  const buildingBaseArea = calculatePolygonArea(room.points);

  // Calculate total construction area across floors
  const totalConstructionArea = buildingBaseArea * floorCount;

  // TAKS calculation
  const maxAllowedBaseArea = zoning.parcelArea * zoning.taks;

  // KAKS / Emsal calculation with Urban Renewal bonus if applicable
  const baseKaksArea = zoning.parcelArea * zoning.kaks;
  const urbanBonus = zoning.isUrbanRenewal
    ? baseKaksArea * (zoning.urbanRenewalBonusPercent / 100)
    : 0;
  const maxAllowedTotalArea = baseKaksArea + urbanBonus;

  const violations: ZoningViolation[] = [];

  // 1. TAKS Check
  if (buildingBaseArea > maxAllowedBaseArea) {
    violations.push({
      id: 'viol-taks',
      code: 'İMAR-TAKS-01',
      title: 'Taban Alanı Katsayısı (TAKS) Aşıldı',
      description: `Bina taban alanı (${buildingBaseArea.toFixed(1)} m²), parsel için izin verilen azami taban alanını (${maxAllowedBaseArea.toFixed(1)} m²) aşıyor.`,
      severity: 'error',
      currentValue: `${buildingBaseArea.toFixed(1)} m²`,
      allowedValue: `${maxAllowedBaseArea.toFixed(1)} m²`
    });
  }

  // 2. KAKS / Emsal Check
  if (totalConstructionArea > maxAllowedTotalArea) {
    violations.push({
      id: 'viol-kaks',
      code: 'İMAR-KAKS-02',
      title: 'Emsal / Toplam İnşaat Alanı Aşıldı',
      description: `Toplam inşaat alanı (${totalConstructionArea.toFixed(1)} m²), Kentsel Dönüşüm teşviki dahil azami emsal alanını (${maxAllowedTotalArea.toFixed(1)} m²) aşıyor.`,
      severity: 'error',
      currentValue: `${totalConstructionArea.toFixed(1)} m²`,
      allowedValue: `${maxAllowedTotalArea.toFixed(1)} m²`
    });
  }

  // 3. Max Floors (Gabari) Check
  if (floorCount > zoning.maxFloors) {
    violations.push({
      id: 'viol-floors',
      code: 'İMAR-GAB-03',
      title: 'Azami Kat Sayısı (Gabari) Aşıldı',
      description: `Projelendirilen kat sayısı (${floorCount} kat), imar durumunda izin verilen azami kat sayısını (${zoning.maxFloors} kat) aşıyor.`,
      severity: 'error',
      currentValue: `${floorCount} Kat`,
      allowedValue: `${zoning.maxFloors} Kat`
    });
  }

  // 4. Balcony & Closed Projection depth check (Max 1.50m in Turkish Regulation)
  room.projections.forEach((proj, idx) => {
    if (proj.depth > 1.50) {
      violations.push({
        id: `viol-proj-${idx}`,
        code: 'İMAR-ÇIK-04',
        title: 'Çıkma / Balkon Derinliği Sınırı Aşıldı',
        description: `Bina cephesindeki ${proj.isClosed ? 'kapalı çıkma' : 'açık balkon'} derinliği (${proj.depth.toFixed(2)}m), yönetmelikteki azami 1.50m sınırını aşıyor.`,
        severity: 'warning',
        currentValue: `${proj.depth.toFixed(2)}m`,
        allowedValue: 'Max 1.50m'
      });
    }
  });

  // 5. Ceiling Height Check (Min 2.60m)
  if (room.wallHeight < 2.60) {
    violations.push({
      id: 'viol-height',
      code: 'İMAR-TAV-05',
      title: 'Net Kat Yüksekliği Yetersiz',
      description: `Net kat yüksekliği (${room.wallHeight.toFixed(2)}m), İmar Yönetmeliğindeki konutlar için minimum 2.60m şartını sağlamıyor.`,
      severity: 'warning',
      currentValue: `${room.wallHeight.toFixed(2)}m`,
      allowedValue: 'Min 2.60m'
    });
  }

  // 6. SubRoom Minimum Area Checks (Turkish Regulation Minimum Areas)
  room.subRooms.forEach((sub) => {
    if (sub.minAreaRequired > 0 && sub.area < sub.minAreaRequired) {
      violations.push({
        id: `viol-sub-${sub.id}`,
        code: 'İMAR-ODA-06',
        title: `${sub.name} Alanı Yetersiz`,
        description: `${sub.name} net alanı (${sub.area.toFixed(1)} m²), Planlı Alanlar Tip İmar Yönetmeliği minimum şartından (${sub.minAreaRequired.toFixed(1)} m²) küçük.`,
        severity: 'warning',
        currentValue: `${sub.area.toFixed(1)} m²`,
        allowedValue: `Min ${sub.minAreaRequired.toFixed(1)} m²`
      });
    }
  });

  return {
    buildingBaseArea,
    totalConstructionArea,
    maxAllowedBaseArea,
    maxAllowedTotalArea,
    violations
  };
}
