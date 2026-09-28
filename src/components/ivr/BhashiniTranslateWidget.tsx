import React from 'react';
import { IvrVoiceReport } from '../../types';
import { Languages, Sparkles, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

interface BhashiniTranslateWidgetProps {
  report: IvrVoiceReport;
  onCreateCase?: (report: IvrVoiceReport) => void;
}

export const BhashiniTranslateWidget: React.FC<BhashiniTranslateWidgetProps> = ({
  report,
  onCreateCase,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Languages className="w-4 h-4 text-cyan-400" />
          <h4 className="text-sm font-bold text-white">
            Bhashini Indic AI Speech-to-Text & Translation
          </h4>
        </div>
        <span className="text-[11px] font-mono text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
          Source: {report.sourceLanguageName} • {(report.bhashiniConfidence * 100).toFixed(0)}% accuracy
        </span>
      </div>

      {/* Side-by-side transcripts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Native Audio Transcript */}
        <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5 flex items-center justify-between">
            <span>Original Transcript ({report.sourceLanguage.toUpperCase()})</span>
            <span className="text-slate-400 font-mono">Bhashini ASR</span>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed font-sans">
            "{report.originalTranscript}"
          </p>
        </div>

        {/* English Translation */}
        <div className="bg-slate-950/80 p-3.5 rounded-xl border border-cyan-500/30">
          <div className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider mb-1.5 flex items-center justify-between">
            <span>English Translation</span>
            <span className="text-cyan-400 font-mono">IndicTrans2</span>
          </div>
          <p className="text-xs text-cyan-100 leading-relaxed">
            "{report.englishTranslation}"
          </p>
        </div>
      </div>

      {/* Extracted NLP Entities */}
      <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-2">
        <div className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Extracted Entities & Problem Intent</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Issue Category</span>
            <strong className="text-white">{report.aiExtractedEntities.issueCategory}</strong>
          </div>
          <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Structure</span>
            <strong className="text-emerald-400">{report.aiExtractedEntities.structureMentioned || 'N/A'}</strong>
          </div>
          <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Reported Location</span>
            <strong className="text-slate-300">{report.aiExtractedEntities.reportedLocation}</strong>
          </div>
          <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Urgency Score</span>
            <strong className="text-red-400 font-mono">{report.aiExtractedEntities.urgencyScore} / 10</strong>
          </div>
        </div>
      </div>

      {/* Convert to Case Action Button */}
      {onCreateCase && (
        <div className="pt-2 flex justify-end">
          <button
            onClick={() => onCreateCase(report)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition-all"
          >
            <span>Proceed to Official Case ({report.status === 'Converted to Case' ? 'View Case' : 'Create Case'})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
