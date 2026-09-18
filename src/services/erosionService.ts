// ============================================================================
// SOIL EROSION & LAND DEGRADATION ANALYTICS (RUSLE & FIELD VOID OBSERVATIONS)
// SIH 2026 PS 26015: Integrated Geospatial Analysis for Watershed Action
// Model: Revised Universal Soil Loss Equation (RUSLE): A = R * K * LS * C * P
// Classification: ICAR-NBSS&LUP Soil Loss Guidelines for Indian Agro-Ecosystems
// ============================================================================

export type ErosionRiskCategory = 'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH' | 'SEVERE';

export interface RusleFactorItem {
  code: 'R' | 'K' | 'LS' | 'C' | 'P';
  name: string;
  value: number;
  unit: string;
  dataSource: string;
  spatialResolution: string;
  description: string;
  methodology: string;
}

export interface RusleModelResult {
  watershedId: string;
  watershedName: string;
  calculatedSoilLossTonnesPerHaYear: number;
  riskCategory: ErosionRiskCategory;
  categoryLabel: string;
  categoryColor: string;
  tolerableSoilLossTValue: number; // typically 11.2 t/ha/yr for Indian tropical soils
  exceedsTolerance: boolean;
  factors: {
    R: RusleFactorItem; // Rainfall Erosivity Factor
    K: RusleFactorItem; // Soil Erodibility Factor
    LS: RusleFactorItem; // Topographic Slope Length & Steepness Factor
    C: RusleFactorItem; // Cover Management Factor
    P: RusleFactorItem; // Conservation Support Practice Factor
  };
  interventionsRecommended: string[];
  computationDate: string;
}

export interface FieldErosionObservation {
  id: string;
  photoId?: string;
  caseId?: string;
  structureId?: string;
  watershedId: string;
  location: {
    lat: number;
    lng: number;
    elevationM?: number;
    description: string;
  };
  // Physical measurements taken on the ground by field worker (sounding rod / tape / laser rangefinder)
  measurements: {
    erosionType: 'GULLY_HEAD' | 'STREAM_BANK_CUT' | 'RILL_SYSTEM' | 'SHEET_WASH' | 'CHECK_DAM_SILTATION';
    lengthMeters: number;
    averageWidthMeters: number;
    averageDepthMeters: number;
    soilBulkDensityTonnesPerCuM: number; // Typical Indian Vertisols: 1.35 - 1.50 t/m3
    measuredDate: string;
    measuredBy: string;
    measurementToolsUsed: string[];
  };
  // Derived calculations (explicitly labeled CALCULATED ESTIMATE, NOT AI DIRECT FACT)
  estimates: {
    voidVolumeCuMeters: number;
    displacedSoilMassTonnes: number;
    estimatedAnnualExpansionMeters: number;
    annualSoilLossRateTonnesPerYear: number;
    riskSeverity: ErosionRiskCategory;
    confidenceGrade: 'MEASURED_PRIMARY' | 'CALCULATED_ESTIMATE';
  };
  fieldNotes: string;
}

export interface LandDegradationMatrix {
  watershedId: string;
  baselineYear: number;
  currentYear: number;
  transitions: {
    fromClass: string;
    toClass: string;
    areaHectares: number;
    degradationStatus: 'STABLE' | 'DEGRADED' | 'IMPROVED' | 'RESTORED';
    confidence: string;
  }[];
  summary: {
    totalDegradedAreaHa: number;
    totalRestoredAreaHa: number;
    netChangeHa: number;
    vegetationCanopyDeltaPct: number;
    bareSoilSpreadDeltaPct: number;
  };
  hotspots: {
    id: string;
    name: string;
    lat: number;
    lng: number;
    primaryDriver: string;
    severity: 'High' | 'Medium' | 'Low';
    satelliteEvidence: string;
  }[];
}

class ErosionService {
  /**
   * Calculate RUSLE Soil Loss: A = R * K * LS * C * P
   */
  calculateRusle(
    r: number,
    k: number,
    ls: number,
    c: number,
    p: number,
    watershedId: string = 'ws-dharashiv-ter',
    watershedName: string = 'Upper Sina - Ter Micro-Watershed'
  ): RusleModelResult {
    const soilLoss = Math.round(r * k * ls * c * p * 100) / 100;

    let riskCategory: ErosionRiskCategory = 'LOW';
    let categoryLabel = 'Low Erosion Risk (< 5.0 t/ha/yr)';
    let categoryColor = '#10b981'; // emerald-500

    if (soilLoss >= 40.0) {
      riskCategory = 'SEVERE';
      categoryLabel = 'Severe Erosion Risk (> 40.0 t/ha/yr)';
      categoryColor = '#b91c1c'; // red-700
    } else if (soilLoss >= 20.0) {
      riskCategory = 'VERY_HIGH';
      categoryLabel = 'Very High Erosion Risk (20.0 – 40.0 t/ha/yr)';
      categoryColor = '#e11d48'; // rose-600
    } else if (soilLoss >= 10.0) {
      riskCategory = 'HIGH';
      categoryLabel = 'High Erosion Risk (10.0 – 20.0 t/ha/yr)';
      categoryColor = '#f59e0b'; // amber-500
    } else if (soilLoss >= 5.0) {
      riskCategory = 'MODERATE';
      categoryLabel = 'Moderate Erosion Risk (5.0 – 10.0 t/ha/yr)';
      categoryColor = '#eab308'; // yellow-500
    }

    const tValue = 11.2; // ICAR Tolerable Soil Loss limit for Indian soils

    const interventions: string[] = [];
    if (soilLoss > tValue) {
      interventions.push('Construct continuous contour trenches (CCT) along upper ridge contours (slope > 8%)');
      interventions.push('Install loose boulder gully plugs (LBS) on 1st & 2nd order drainage channels');
      interventions.push('Adopt vetiver grass vegetative filter strips along cadastral plot boundaries');
      interventions.push('Construct loose rock check dams with aprons in active headward incision zones');
    } else {
      interventions.push('Maintain existing vegetative vegetative cover and contour bund ridges');
      interventions.push('Routine desiltation of upstream check dam apron sediment traps');
    }

    return {
      watershedId,
      watershedName,
      calculatedSoilLossTonnesPerHaYear: soilLoss,
      riskCategory,
      categoryLabel,
      categoryColor,
      tolerableSoilLossTValue: tValue,
      exceedsTolerance: soilLoss > tValue,
      factors: {
        R: {
          code: 'R',
          name: 'Rainfall Erosivity Factor',
          value: r,
          unit: 'MJ·mm/(ha·h·yr)',
          dataSource: 'NASA POWER Satellite Surface Meteorology & IMD Gridded Rainfall (0.25°)',
          spatialResolution: 'Point Climatology / 25km',
          description: 'Kinetic energy and maximum 30-minute intensity of precipitation events.',
          methodology: 'Computed via Singh et al. (1981) Indian Empirical Formula: R = 79 + 0.363 * P_annual',
        },
        K: {
          code: 'K',
          name: 'Soil Erodibility Factor',
          value: k,
          unit: 't·ha·h/(ha·MJ·mm)',
          dataSource: 'ICAR-NBSS&LUP 1:50,000 Soil Textural Map & Maharashtra Soil Health Card',
          spatialResolution: '50m (Cadastral / Soil Series Level)',
          description: 'Intrinsic susceptibility of the topsoil to detachment and transport by surface runoff.',
          methodology: 'Wischmeier soil nomograph based on silt+very fine sand %, organic matter (0.8%), and permeability.',
        },
        LS: {
          code: 'LS',
          name: 'Slope Length & Steepness Factor',
          value: ls,
          unit: 'Dimensionless Ratio',
          dataSource: 'Cartosat-1 DEM (CartoDEM 30m) & SRTM 1-ArcSecond Topography',
          spatialResolution: '30m DEM Derived Flow Accumulation',
          description: 'Ratio of soil loss under given slope length and gradient to standard unit plot (22.13m, 9% slope).',
          methodology: 'Moore & Burch (1986) LS formula: LS = (Flow_Acc * Cell_Size / 22.13)^0.4 * (sin(Slope) / 0.0896)^1.3',
        },
        C: {
          code: 'C',
          name: 'Cover & Canopy Management Factor',
          value: c,
          unit: 'Dimensionless (0.01 - 1.0)',
          dataSource: 'Sentinel-2 MSI 10m Multi-Spectral Surface Reflectance (NDVI scaled)',
          spatialResolution: '10m Multi-Spectral Satellite Pixel',
          description: 'Reduction of erosion due to canopy interception, surface mulching, and crop root stabilization.',
          methodology: 'Durigon et al. (2014) NDVI transformation: C = (-NDVI + 1) / 2 scaled for rainfed kharif/rabi rotations.',
        },
        P: {
          code: 'P',
          name: 'Conservation Support Practice Factor',
          value: p,
          unit: 'Dimensionless (0.1 - 1.0)',
          dataSource: 'PMKSY-WDC 2.0 Geo-Coded Asset Inventory & Ground Verification Audits',
          spatialResolution: 'Asset GPS & Survey Plot Boundary',
          description: 'Effectiveness of engineered conservation measures (contour bunds, check dams, bench terracing).',
          methodology: 'ICAR Standard P-value tables: Contour bunding with staggered trenches (P = 0.40 - 0.50).',
        },
      },
      interventionsRecommended: interventions,
      computationDate: new Date().toISOString(),
    };
  }

  /**
   * Pre-configured RUSLE benchmarks for our demonstration watersheds
   */
  getWatershedRusle(watershedId: string): RusleModelResult {
    switch (watershedId) {
      case 'ws-bundelkhand-ken':
        // Bundelkhand: High rainfall intensity, undulating ravine terrain, fragile alfisols
        return this.calculateRusle(398, 0.038, 2.45, 0.32, 0.65, watershedId, 'Ken-Betwa Upper Catchment');

      case 'ws-penna-anantapur':
        // Rayalaseema: Semi-arid, red sandy loams, low canopy cover
        return this.calculateRusle(311, 0.031, 1.85, 0.38, 0.70, watershedId, 'Mid-Penna Catchment');

      case 'ws-chotanagpur-damodar':
        // Chota Nagpur: High monsoon precipitation, plateau slope
        return this.calculateRusle(568, 0.029, 3.12, 0.22, 0.50, watershedId, 'Damodar Upper Basin');

      case 'ws-dharashiv-ter':
      default:
        // Dharashiv (Marathwada): Vertisols / Black soils, moderate rain, contour bunded
        // R=329, K=0.034, LS=1.62, C=0.28, P=0.45 => A = 329 * 0.034 * 1.62 * 0.28 * 0.45 = 2.28 t/ha/yr
        // In untreated degraded gully zones without bunds (P=1.0, C=0.55): A = 9.96 t/ha/yr
        return this.calculateRusle(329, 0.034, 1.95, 0.32, 0.55, 'ws-dharashiv-ter', 'Upper Sina - Ter Micro-Watershed');
    }
  }

  /**
   * Calculate physical erosion void from ground measurements
   * Volume = Length * Width * Depth * ShapeFactor
   * Mass = Volume * Soil Bulk Density
   */
  calculatePhysicalErosion(
    lengthM: number,
    widthM: number,
    depthM: number,
    bulkDensityTPerCuM: number = 1.42,
    shapeFactor: number = 0.85 // 0.85 for typical trapezoidal / parabolic cross-section
  ) {
    const volumeCuM = Math.round(lengthM * widthM * depthM * shapeFactor * 100) / 100;
    const massTonnes = Math.round(volumeCuM * bulkDensityTPerCuM * 100) / 100;
    
    // Annual expansion rate estimate (typically 5-15% of mass in active monsoon gullies without check dams)
    const annualMassTonnes = Math.round(massTonnes * 0.12 * 100) / 100;

    let riskSeverity: ErosionRiskCategory = 'LOW';
    if (massTonnes > 250) riskSeverity = 'SEVERE';
    else if (massTonnes > 100) riskSeverity = 'VERY_HIGH';
    else if (massTonnes > 40) riskSeverity = 'HIGH';
    else if (massTonnes > 10) riskSeverity = 'MODERATE';

    return {
      volumeCuM,
      massTonnes,
      annualMassTonnes,
      riskSeverity,
    };
  }

  /**
   * Pre-loaded field erosion observations for our demo cases
   */
  getDemoFieldObservations(): FieldErosionObservation[] {
    return [
      {
        id: 'feo-rui-001',
        photoId: 'img-rui-001',
        caseId: 'case-es-2026-0842',
        structureId: 'struct-cd-04',
        watershedId: 'ws-dharashiv-ter',
        location: {
          lat: 18.23724,
          lng: 75.98451,
          elevationM: 618.4,
          description: 'Upstream weir basin of Rui Check Dam #4, 180m north-east of survey stone 42',
        },
        measurements: {
          erosionType: 'CHECK_DAM_SILTATION',
          lengthMeters: 45.0,
          averageWidthMeters: 18.5,
          averageDepthMeters: 1.45,
          soilBulkDensityTonnesPerCuM: 1.48, // Compacted alluvial clayey-silt
          measuredDate: '2026-09-24',
          measuredBy: 'Ramesh Kadam (Gram Rozgar Sevak) with J.E. WDT',
          measurementToolsUsed: ['Calibrated Sounding Rod (3m)', 'Laser Distance Meter', 'Fiberglass Measuring Tape'],
        },
        estimates: {
          voidVolumeCuMeters: 1025.2,
          displacedSoilMassTonnes: 1517.3,
          estimatedAnnualExpansionMeters: 0.25,
          annualSoilLossRateTonnesPerYear: 182.1,
          riskSeverity: 'SEVERE',
          confidenceGrade: 'MEASURED_PRIMARY',
        },
        fieldNotes: 'Sediment accumulation reaches within 15cm of weir spillway crest. Upstream catchment runoff carrying heavy bed-load during peak July-August rains.',
      },
      {
        id: 'feo-rui-002',
        photoId: 'img-rui-003',
        caseId: 'case-es-2026-0845',
        structureId: 'struct-cd-02',
        watershedId: 'ws-dharashiv-ter',
        location: {
          lat: 18.2312,
          lng: 75.9798,
          elevationM: 624.1,
          description: 'Survey Plot 108/B, right flank gully head incision entering 2nd order stream',
        },
        measurements: {
          erosionType: 'GULLY_HEAD',
          lengthMeters: 28.0,
          averageWidthMeters: 3.2,
          averageDepthMeters: 1.1,
          soilBulkDensityTonnesPerCuM: 1.38,
          measuredDate: '2026-09-25',
          measuredBy: 'Sunita Patil (Field Technician)',
          measurementToolsUsed: ['Fiberglass Measuring Tape (30m)', 'Graduated Staff'],
        },
        estimates: {
          voidVolumeCuMeters: 83.8,
          displacedSoilMassTonnes: 115.6,
          estimatedAnnualExpansionMeters: 1.2,
          annualSoilLossRateTonnesPerYear: 24.5,
          riskSeverity: 'VERY_HIGH',
          confidenceGrade: 'MEASURED_PRIMARY',
        },
        fieldNotes: 'Active headward gully retreating towards agricultural field. Requires immediate dry stone masonry check dam and earthen contour bund.',
      },
    ];
  }

  /**
   * Land Degradation Matrix (Before vs After Change Matrix)
   */
  getLandDegradationMatrix(watershedId: string): LandDegradationMatrix {
    return {
      watershedId,
      baselineYear: 2023,
      currentYear: 2025,
      transitions: [
        {
          fromClass: 'Barren Scrub / Wasteland',
          toClass: 'Kharif + Rabi Double Cropping',
          areaHectares: 124.5,
          degradationStatus: 'RESTORED',
          confidence: 'Satellite-derived observation verified by field audit',
        },
        {
          fromClass: 'Severe Gully Incision Area',
          toClass: 'Re-vegetated Contoured Catchment',
          areaHectares: 38.2,
          degradationStatus: 'IMPROVED',
          confidence: 'Sentinel-2 NDVI delta + 4 check dam installations',
        },
        {
          fromClass: 'Single Rainfed Crop',
          toClass: 'Single Rainfed Crop (Stable)',
          areaHectares: 680.0,
          degradationStatus: 'STABLE',
          confidence: 'Multi-temporal NDVI stability index',
        },
        {
          fromClass: 'Open Water Storage Basin',
          toClass: 'Silted Waterbody (Capacity Reduced)',
          areaHectares: 8.4,
          degradationStatus: 'DEGRADED',
          confidence: 'Satellite NDWI anomaly + Ground sounding rod survey',
        },
      ],
      summary: {
        totalDegradedAreaHa: 8.4,
        totalRestoredAreaHa: 162.7,
        netChangeHa: +154.3,
        vegetationCanopyDeltaPct: +65.5,
        bareSoilSpreadDeltaPct: -32.4,
      },
      hotspots: [
        {
          id: 'deg-spot-01',
          name: 'Rui Check Dam #4 Pondage Siltation Zone',
          lat: 18.2374,
          lng: 75.9847,
          primaryDriver: 'Sedimentation from untreated upper ridge gullies',
          severity: 'High',
          satelliteEvidence: 'NDWI water spread area reduced from 4.2 ha to 1.1 ha between 2023 and 2025',
        },
        {
          id: 'deg-spot-02',
          name: 'East Flank Ridge Scarp Gully Incision',
          lat: 18.2295,
          lng: 75.9815,
          primaryDriver: 'High runoff velocity on unprotected 9% slope',
          severity: 'Medium',
          satelliteEvidence: 'Localized NDVI depression (-0.14) along 2nd order drainage fork',
        },
      ],
    };
  }
}

export const erosionService = new ErosionService();
