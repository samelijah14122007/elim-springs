import React, { useState, useEffect } from 'react';
import {
  WatershedCatchment,
  ChangeDetectionRecord,
  SatelliteObservationMetadata,
  SpectralIndexResult,
  LulcBreakdownRecord,
  GisAlert,
  WatershedStructure,
  WatershedCase,
} from '../types';
import { ObservationMetadataCard } from '../components/satellite/ObservationMetadataCard';
import {
  SatelliteRasterViewer,
} from '../components/satellite/SatelliteRasterViewer';
import { ChangeDetectionSlider } from '../components/satellite/ChangeDetectionSlider';
import { SpectralIndexChart } from '../components/satellite/SpectralIndexChart';
import { LulcBreakdown } from '../components/satellite/LulcBreakdown';
import { SatelliteSpatialFootprint } from '../components/satellite/SatelliteSpatialFootprint';
import { ResponsibleInterpretationCard } from '../components/satellite/ResponsibleInterpretationCard';
import { NasaDataStatusPanel } from '../components/satellite/NasaDataStatusPanel';
import { SoilErosionAnalyticsPanel } from '../components/satellite/SoilErosionAnalyticsPanel';
import { FieldErosionMeasurementModal } from '../components/geoimages/FieldErosionMeasurementModal';
import { PageHeader } from '../components/common/PageHeader';
import { useTranslation } from '../i18n';
import {
  satelliteService,
  RasterVisualizationResult,
} from '../services/satelliteService';
import {
  mockCatchments,
  mockAlerts,
  mockStructures,
} from '../data/mockData';
import {
  Satellite,
  MapPin,
  Layers,
  Sparkles,
  Info,
  Calendar,
  Activity,
  Droplets,
  Leaf,
  Globe,
  ArrowRight,
  ShieldCheck,
  Camera,
} from 'lucide-react';

interface SatelliteViewProps {
  watershedId?: string;
  catchment?: WatershedCatchment;
  catchments?: WatershedCatchment[];
  onSelectCatchment?: (catchment: WatershedCatchment) => void;
  changeDetection?: ChangeDetectionRecord;
  onNavigateToGis?: () => void;
  onNavigateToImages?: () => void;
  onCreateCase?: (newCase: WatershedCase) => void;
  onNavigateToCases?: () => void;
}

export const SatelliteView: React.FC<SatelliteViewProps> = ({
  watershedId,
  catchment,
  catchments = mockCatchments,
  onSelectCatchment,
  changeDetection: initialChangeDetection,
  onNavigateToGis,
  onNavigateToImages,
  onCreateCase,
  onNavigateToCases,
}) => {
  const { t } = useTranslation();
  // Current active watershed
  const activeCatchment =
    catchment ||
    catchments.find((c) => c.id === watershedId) ||
    catchments[0];

  const currentWatershedId = activeCatchment.id;

  // Remote Sensing Data States
  const [metadata, setMetadata] = useState<SatelliteObservationMetadata | null>(null);
  const [spectralIndices, setSpectralIndices] = useState<SpectralIndexResult | null>(null);
  const [lulcData, setLulcData] = useState<LulcBreakdownRecord | null>(null);
  const [changeDetectionData, setChangeDetectionData] = useState<ChangeDetectionRecord | null>(
    initialChangeDetection || null
  );

  // Raster Visualization State
  const [rasterMode, setRasterMode] = useState<'trueColor' | 'falseColor' | 'ndvi' | 'ndwi'>('trueColor');
  const [rasterData, setRasterData] = useState<RasterVisualizationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [showErosionModal, setShowErosionModal] = useState(false);

  // Load telemetry when active catchment changes
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.all([
      satelliteService.getObservationMetadata(currentWatershedId),
      satelliteService.getSpectralIndices(currentWatershedId),
      satelliteService.getLulcSummary(currentWatershedId),
      satelliteService.getChangeDetection(currentWatershedId),
      satelliteService.getRasterVisualization(currentWatershedId, rasterMode),
    ]).then(([meta, indices, lulc, cd, raster]) => {
      if (isMounted) {
        setMetadata(meta);
        setSpectralIndices(indices);
        setLulcData(lulc);
        setChangeDetectionData(cd);
        setRasterData(raster);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [currentWatershedId]);

  // Update raster visualization when rasterMode changes
  useEffect(() => {
    satelliteService
      .getRasterVisualization(currentWatershedId, rasterMode)
      .then((res) => {
        setRasterData(res);
      });
  }, [rasterMode, currentWatershedId]);

  const handleInspectAnomaly = (lat: number, lng: number, title: string) => {
    if (onNavigateToImages) {
      onNavigateToImages();
    } else if (onNavigateToGis) {
      onNavigateToGis();
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. TOP HEADER & WATERSHED SWITCHER BAR */}
      <PageHeader
        icon={Satellite}
        iconColor="text-[#1677A8]"
        iconBg="bg-sky-50 border-sky-200"
        moduleNumber="02–06"
        title={t('satellite.title') || 'Earth Observation, Spectral Indices & Change Detection'}
        tagline={t('satellite.subtitle') || 'Evaluating vegetative canopy recovery, surface water retention (NDWI), and thematic LULC transitions across observation epochs'}
        breadcrumbs={[
          { label: 'Earth Observation' },
          { label: 'Sentinel-2 MSI' },
          { label: activeCatchment.name },
        ]}
        statusBadge={
          <span className="text-[10px] font-mono text-sky-800 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200 font-bold uppercase">
            Sentinel-2 MSI (10m)
          </span>
        }
        actions={
          <div className="flex items-center flex-wrap gap-2.5">
            {onNavigateToImages && (
              <button
                onClick={onNavigateToImages}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white hover:bg-[#F0F3EE] text-[#17211D] border border-[#DCE3DD] rounded-xl text-xs font-semibold transition-all hover:scale-[1.02] cursor-pointer shadow-xs"
                title="Inspect Ground Evidence & Geo-Coded Field Photos for this Watershed"
              >
                <Camera className="w-3.5 h-3.5 text-sky-600" />
                <span>Inspect Field Evidence</span>
              </button>
            )}

            {catchments.length > 0 && onSelectCatchment && (
              <div className="flex items-center gap-2 bg-white border border-[#DCE3DD] rounded-xl px-3 py-1.5 shadow-xs">
                <MapPin className="w-4 h-4 text-[#075B45] shrink-0" />
                <span className="text-xs text-[#66736C] shrink-0 font-mono">Basin:</span>
                <select
                  value={activeCatchment.id}
                  onChange={(e) => {
                    const target = catchments.find((c) => c.id === e.target.value);
                    if (target) onSelectCatchment(target);
                  }}
                  className="bg-transparent text-xs font-bold text-[#075B45] focus:outline-none cursor-pointer pr-1"
                >
                  {catchments.map((c) => (
                    <option key={c.id} value={c.id} className="bg-white text-[#17211D]">
                      {c.name} ({c.district}) [{c.code}]
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        }
      />

      {/* 2. OBSERVATION METADATA CARD (Sentinel-2 Parameters) */}
      {metadata && <ObservationMetadataCard metadata={metadata} />}

      {/* 3. MIDDLE WORKSPACE: RASTER COMPOSITE VIEWER + SPATIAL FOOTPRINT MINI-MAP */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: True Color / False Color CIR / NDVI / NDWI Viewer (8 cols) */}
        <div className="lg:col-span-8">
          {rasterData && (
            <SatelliteRasterViewer
              rasterData={rasterData}
              currentMode={rasterMode}
              onSelectMode={(mode) => setRasterMode(mode)}
              watershedName={activeCatchment.name}
            />
          )}
        </div>

        {/* Right Column: Spatial Footprint & Anomaly Context Mini-Map (4 cols) */}
        <div className="lg:col-span-4 h-full">
          <SatelliteSpatialFootprint
            catchment={activeCatchment}
            alerts={mockAlerts}
            structures={mockStructures}
            onNavigateToGis={onNavigateToGis}
            onInspectAnomaly={handleInspectAnomaly}
          />
        </div>
      </div>

      {/* 4. TEMPORAL CHANGE DETECTION (2023 Baseline vs 2025 Outcome) */}
      {changeDetectionData && (
        <ChangeDetectionSlider
          data={changeDetectionData}
          onInspectAnomaly={handleInspectAnomaly}
        />
      )}

      {/* 5. MULTISPECTRAL INDICES: NDVI & NDWI PANELS */}
      {spectralIndices && (
        <SpectralIndexChart
          analysis={spectralIndices}
          onInspectAnomaly={handleInspectAnomaly}
        />
      )}

      {/* 6. LAND USE / LAND COVER (LULC) THEMATIC CLASSIFICATION */}
      {lulcData && <LulcBreakdown analysis={lulcData} />}

      {/* 7. SOIL EROSION ANALYTICS & LAND DEGRADATION DYNAMICS (RUSLE: A = R * K * LS * C * P) */}
      <SoilErosionAnalyticsPanel
        watershedId={currentWatershedId}
        watershedName={activeCatchment.name}
        onOpenFieldMeasurementModal={() => setShowErosionModal(true)}
        onCreateCase={onCreateCase}
        onNavigateToCases={onNavigateToCases}
      />

      {/* 8. NASA EARTH OBSERVATION & CLIMATOLOGY INTEGRATION (NASA POWER + GIBS) */}
      <NasaDataStatusPanel
        lat={activeCatchment.center[0]}
        lng={activeCatchment.center[1]}
        watershedName={activeCatchment.name}
      />

      {/* 9. RESPONSIBLE INTERPRETATION & EVIDENCE CHAIN WORKFLOW */}
      <ResponsibleInterpretationCard
        watershedName={activeCatchment.name}
        interpretationText={changeDetectionData?.responsibleInterpretation}
      />

      {/* Field Erosion Measurement Modal */}
      <FieldErosionMeasurementModal
        isOpen={showErosionModal}
        onClose={() => setShowErosionModal(false)}
        watershedId={currentWatershedId}
        defaultLat={activeCatchment.center[0]}
        defaultLng={activeCatchment.center[1]}
      />
    </div>
  );
};
