import React from 'react';
import { LulcBreakdownRecord } from '../../types';
import { PieChart, Layers, ArrowRight, Info, ShieldAlert, Sparkles } from 'lucide-react';

interface LulcBreakdownProps {
  analysis: LulcBreakdownRecord;
}

export const LulcBreakdown: React.FC<LulcBreakdownProps> = ({ analysis }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <PieChart className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">
              Land Use / Land Cover (LULC) Thematic Classification
            </h3>
            <span className="text-[10px] font-mono text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
              Prototype Thematic Classification
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Thematic land allocation comparing Pre-Intervention ({analysis.comparisonYear}) vs. Post-Intervention ({analysis.observationYear})
          </p>
        </div>

        <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/20">
          Total Area: {analysis.totalAreaHa.toLocaleString()} ha
        </span>
      </div>

      {/* Segmented Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-[11px] text-slate-400 font-mono">
          <span>Thematic Area Distribution (Post-Intervention {analysis.observationYear})</span>
          <span>100% of Catchment</span>
        </div>
        <div className="w-full h-4 rounded-xl overflow-hidden flex shadow-inner bg-slate-950 border border-slate-800">
          {analysis.classes.map((item, idx) => (
            <div
              key={idx}
              style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
              className="h-full transition-all duration-300 relative group cursor-pointer hover:opacity-90"
              title={`${item.category}: ${item.percentage}% (${item.areaHa} ha)`}
            />
          ))}
        </div>
      </div>

      {/* Thematic Classes Grid with Before vs After Delta */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {analysis.classes.map((item, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-colors flex flex-col justify-between space-y-2"
          >
            <div className="flex items-center gap-2.5">
              <div
                className="w-3.5 h-3.5 rounded-md shrink-0 shadow-sm"
                style={{ backgroundColor: item.color }}
              />
              <div className="min-w-0 flex-1">
                <span className="text-xs font-bold text-slate-200 block truncate">
                  {item.category}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {item.areaHa} ha ({item.percentage}%)
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
              <span className="text-slate-500 font-sans">
                {analysis.comparisonYear}: {item.preInterventionAreaHa} ha
              </span>
              <span
                className={`font-bold ${
                  item.changeHa > 0
                    ? 'text-emerald-400'
                    : item.changeHa < 0
                    ? 'text-amber-400'
                    : 'text-slate-400'
                }`}
              >
                {item.changeHa > 0 ? `+${item.changeHa}` : item.changeHa} ha ({item.changePct > 0 ? `+${item.changePct}` : item.changePct}%)
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* LULC Transition Analysis */}
      {analysis.transitions && analysis.transitions.length > 0 && (
        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Notable Thematic Transitions Observed (2023 → 2025)</span>
          </div>

          <div className="space-y-2 text-xs">
            {analysis.transitions.map((trans, i) => (
              <div
                key={i}
                className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2 font-semibold">
                  <span className="text-slate-300">{trans.from}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">{trans.to}</span>
                  <span className="font-mono text-white text-[11px] bg-slate-800 px-2 py-0.5 rounded">
                    {trans.areaHa} ha
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 sm:text-right">
                  {trans.significance}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Prototype Notice */}
      <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-2">
        <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <span>
          Method: <strong className="text-slate-300">{analysis.classificationMethod}</strong>. This prototype thematic classification demonstrates LULC shifts for SIH PS 26015 and should not be cited as certified government land administration records.
        </span>
      </div>
    </div>
  );
};
