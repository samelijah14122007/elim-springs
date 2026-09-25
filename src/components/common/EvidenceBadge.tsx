import React from 'react';
import {
  Satellite,
  Layers,
  Camera,
  FileCheck,
  PhoneCall,
  BookOpen,
  ClipboardCheck,
} from 'lucide-react';
import { EvidenceBadgeType } from '../../types';

interface EvidenceBadgeProps {
  type: EvidenceBadgeType | string;
  size?: 'sm' | 'md';
}

export const EvidenceBadge: React.FC<EvidenceBadgeProps> = ({ type, size = 'sm' }) => {
  const getConfig = () => {
    switch (type) {
      case 'SATELLITE OBSERVATION':
        return {
          icon: Satellite,
          label: 'Satellite',
          style: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300',
        };
      case 'GIS RECORD':
        return {
          icon: Layers,
          label: 'GIS Boundary',
          style: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
        };
      case 'GEO-CODED IMAGE':
        return {
          icon: Camera,
          label: 'Field Photo',
          style: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
        };
      case 'OCR EXTRACTION':
        return {
          icon: FileCheck,
          label: 'OCR Signboard',
          style: 'bg-purple-500/10 border-purple-500/30 text-purple-300',
        };
      case 'VOICE REPORT':
        return {
          icon: PhoneCall,
          label: 'Citizen Voice',
          style: 'bg-blue-500/10 border-blue-500/30 text-blue-300',
        };
      case 'GUIDELINE CONTEXT':
        return {
          icon: BookOpen,
          label: 'RAG Guideline',
          style: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300',
        };
      case 'FIELD VERIFICATION':
        return {
          icon: ClipboardCheck,
          label: 'Field Verified',
          style: 'bg-teal-500/10 border-teal-500/30 text-teal-300',
        };
      default:
        return {
          icon: Layers,
          label: type,
          style: 'bg-slate-800 border-slate-700 text-slate-300',
        };
    }
  };

  const config = getConfig();
  const Icon = config.icon;
  const padding = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-mono font-medium tracking-wide uppercase ${config.style} ${padding}`}
    >
      <Icon className="w-3 h-3 flex-shrink-0" />
      <span>{config.label}</span>
    </span>
  );
};
