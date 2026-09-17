import React, { useState, useEffect } from 'react';
import {
  Satellite,
  CloudRain,
  Thermometer,
  ShieldCheck,
  ShieldAlert,
  Lock,
  RefreshCw,
  ExternalLink,
  Info,
  CheckCircle2,
  AlertCircle,
  Database,
  Layers,
} from 'lucide-react';
import { nasaService, NasaTelemetrySummary, NasaDatasetStatus } from '../../services/nasaService';

interface NasaDataStatusPanelProps {
  lat?: number;
  lng?: number;
  watershedName?: string;
  onRefresh?: () => void;
}

export const NasaDataStatusPanel: React.FC<NasaDataStatusPanelProps> = ({
  lat = 18.2372,
  lng = 75.9845,
  watershedName = 'Upper Sina - Ter Micro-Watershed',
}) => {
  const [telemetry, setTelemetry] = useState<NasaTelemetrySummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState<NasaDatasetStatus | null>(null);

  const fetchTelemetry = async () => {
    setLoading(true);
    try {
      const res = await nasaService.getTelemetrySummary(lat, lng);
      setTelemetry(res);
    } catch (e) {
      console.warn('Failed to load NASA telemetry:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
  }, [lat, lng]);

  if (!telemetry) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 animate-pulse">
        <div className="h-5 bg-slate-800 rounded w-1/3 mb-3"></div>
        <div className="h-16 bg-slate-800/60 rounded"></div>
      </div>
    );
  }

  const { climatology, datasets, apiKeyMasked, apiStatus } = telemetry;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
            <Satellite className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">
                NASA Earth Observation & Agro-Climatology Integration
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20 font-bold">
                NASA API KEY: {apiKeyMasked}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Integrating NASA POWER precipitation climatology (RUSLE R-Factor input) and NASA Earthdata / GIBS satellite layers
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchTelemetry}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-400' : ''}`} />
            <span>{loading ? 'Querying NASA...' : 'Refresh NASA Telemetry'}</span>
          </button>
        </div>
      </div>

      {/* Climatology Metrics Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Annual Precipitation */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <CloudRain className="w-4 h-4 text-cyan-400" />
              Annual Rainfall (P)
            </span>
            <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/80 px-1.5 py-0.5 rounded">
              NASA POWER
            </span>
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {climatology.annualPrecipitationMm} <span className="text-sm font-normal text-slate-400">mm/yr</span>
          </div>
          <p className="text-[11px] text-slate-500">
            30-year gridded satellite baseline (GPM / MERRA-2)
          </p>
        </div>

        {/* Calculated R-Factor */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              RUSLE R-Factor
            </span>
            <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/80 px-1.5 py-0.5 rounded">
              Erosivity Index
            </span>
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">
            {climatology.calculatedRValue} <span className="text-xs font-normal text-slate-400">MJ·mm/(ha·h·yr)</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Singh et al. formula (79 + 0.363 × P)
          </p>
        </div>

        {/* Mean Temperature */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Thermometer className="w-4 h-4 text-amber-400" />
              Surface Temp (2m)
            </span>
            <span className="text-[10px] font-mono text-amber-300 bg-amber-950/80 px-1.5 py-0.5 rounded">
              MERRA-2
            </span>
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {climatology.annualMeanTempC}°C
          </div>
          <p className="text-[11px] text-slate-500">
            Relative Humidity: {climatology.relativeHumidityPct}%
          </p>
        </div>

        {/* API Connection Status */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Database className="w-4 h-4 text-blue-400" />
              NASA Status
            </span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                apiStatus === 'ONLINE'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
              }`}
            >
              {apiStatus === 'ONLINE' ? 'LIVE CONNECTED' : 'CALIBRATED SIM'}
            </span>
          </div>
          <div className="text-sm font-bold text-slate-200 truncate">
            {climatology.source.includes('Live') ? 'api.nasa.gov Live' : 'Verified Climatology'}
          </div>
          <p className="text-[11px] text-slate-500 truncate">
            Elev: {climatology.elevationMeters}m MSL @ [{lat.toFixed(3)}, {lng.toFixed(3)}]
          </p>
        </div>
      </div>

      {/* Monthly Rainfall Breakdown Pills */}
      <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-3.5 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-300 flex items-center gap-1.5">
            <CloudRain className="w-3.5 h-3.5 text-cyan-400" />
            Monthly Climatological Precipitation Distribution (mm)
          </span>
          <span className="text-[11px] text-slate-500 font-mono">Monsoon Peak: JUN–SEP</span>
        </div>
        <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5">
          {Object.entries(climatology.monthlyPrecipitationMm).map(([month, val]) => {
            const isMonsoon = ['JUN', 'JUL', 'AUG', 'SEP'].includes(month);
            return (
              <div
                key={month}
                className={`p-2 rounded-lg text-center border transition-all ${
                  isMonsoon
                    ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300 font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <div className="text-[10px] font-mono">{month}</div>
                <div className="text-xs font-bold mt-0.5 font-mono">{val}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* NASA Datasets Catalog & Authentication Protocol Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-blue-400" />
            NASA Earthdata & GIBS Dataset Access Matrix
          </h4>
          <span className="text-[11px] text-slate-500">
            5 Satellite Sensors Monitored
          </span>
        </div>

        <div className="overflow-x-auto border border-slate-800 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3.5 font-semibold">Dataset & Sensor</th>
                <th className="py-2.5 px-3 font-semibold">Category</th>
                <th className="py-2.5 px-3 font-semibold">Spatial Res</th>
                <th className="py-2.5 px-3 font-semibold">Temporal</th>
                <th className="py-2.5 px-3.5 font-semibold">Access Protocol</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {datasets.map((ds) => {
                const isAuthRequired = ds.accessStatus === 'AUTH_REQUIRED';
                return (
                  <tr key={ds.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3 px-3.5">
                      <div className="font-semibold text-slate-200">{ds.datasetName}</div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">{ds.satelliteSensor}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                        {ds.category}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-300 font-mono text-[11px]">
                      {ds.spatialResolution}
                    </td>
                    <td className="py-3 px-3 text-slate-400 text-[11px]">
                      {ds.temporalCoverage}
                    </td>
                    <td className="py-3 px-3.5">
                      {isAuthRequired ? (
                        <div className="flex flex-col gap-1">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/30 font-mono text-[10px] font-bold">
                            <Lock className="w-3 h-3 text-amber-400" />
                            NASA DATASET AUTHENTICATION REQUIRED
                          </span>
                          <span className="text-[10px] text-slate-500 max-w-xs">
                            Requires NASA Earthdata URS Bearer Token for Level-3/4 science products.
                          </span>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-mono text-[10px] font-bold">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          ACTIVE & ACCESSIBLE
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transparency Footer */}
      <div className="p-3 bg-blue-950/20 border border-blue-500/20 rounded-xl flex items-center gap-2.5 text-xs text-blue-300/90">
        <Info className="w-4 h-4 text-blue-400 shrink-0" />
        <span>
          <strong>Data Governance Note:</strong> NASA POWER and GIBS endpoints are queried directly with client token authorization. All derived parameters (such as RUSLE R-Factor) are transparently disclosed with physical formula citations.
        </span>
      </div>
    </div>
  );
};
