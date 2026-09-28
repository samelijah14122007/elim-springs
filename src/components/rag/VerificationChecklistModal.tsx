import React, { useState } from 'react';
import { VerificationChecklist } from '../../types';
import {
  X,
  ClipboardCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ShieldCheck,
  Printer,
  Download,
  Building,
  User,
  Clock,
  Camera,
  MapPin,
  PhoneCall,
  Satellite,
} from 'lucide-react';

interface VerificationChecklistModalProps {
  checklist: VerificationChecklist;
  onClose: () => void;
}

export const VerificationChecklistModal: React.FC<VerificationChecklistModalProps> = ({
  checklist,
  onClose,
}) => {
  const [tasks, setTasks] = useState(checklist.tasks);

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="fixed inset-0 z-50 bg-[#17211D]/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-[#DCE3DD] rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#DCE3DD] flex items-center justify-between bg-[#F7F8F4]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#075B45]/10 text-[#075B45] border border-[#075B45]/20">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-[#17211D] text-base">
                  Field Verification Checklist
                </h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                  {checklist.status}
                </span>
              </div>
              <p className="text-xs text-[#66736C]">
                Statutory verification protocol derived from {checklist.guidelineDocTitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#66736C] hover:text-[#17211D] hover:bg-[#F0F3EE] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Target Issue & Asset Card */}
          <div className="bg-[#F7F8F4] p-4 rounded-2xl border border-[#DCE3DD] space-y-2">
            <div className="flex items-center justify-between text-xs text-[#66736C] pb-1.5 border-b border-[#DCE3DD]">
              <span className="font-mono text-[#075B45] font-bold">Target Structure: {checklist.assetName}</span>
              <span className="font-mono">{checklist.section}</span>
            </div>
            <div className="text-xs">
              <span className="text-[10px] uppercase font-bold text-[#66736C] block font-mono">Reported Concern:</span>
              <p className="font-bold text-[#17211D] text-sm mt-0.5">{checklist.issue}</p>
            </div>
            <div className="text-[10px] font-mono text-[#66736C] flex items-center gap-1.5 pt-1">
              <Clock className="w-3 h-3 text-[#66736C]" />
              <span>Generated: {new Date(checklist.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              <span>• Assigned To: {checklist.recommendedOfficer}</span>
            </div>
          </div>

          {/* Evidence Already Available */}
          {checklist.evidenceAvailable.length > 0 && (
            <div className="space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#66736C] font-mono flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#075B45]" />
                <span>Evidence Already Corroborated on Platform:</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {checklist.evidenceAvailable.map((ev, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-xl bg-white border border-[#DCE3DD] flex items-center gap-2.5"
                  >
                    {ev.type === 'Geo-Photo' ? (
                      <Camera className="w-4 h-4 text-[#1677A8] shrink-0" />
                    ) : ev.type === 'Voice Report (IVR)' ? (
                      <PhoneCall className="w-4 h-4 text-cyan-600 shrink-0" />
                    ) : ev.type === 'Satellite Observation' ? (
                      <Satellite className="w-4 h-4 text-[#075B45] shrink-0" />
                    ) : (
                      <MapPin className="w-4 h-4 text-purple-600 shrink-0" />
                    )}
                    <span className="text-[#17211D] text-[11px] truncate">{ev.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommended Verification Tasks */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#17211D] font-mono">
                Mandatory Field Inspection Tasks:
              </div>
              <span className="text-[11px] font-mono text-[#075B45] font-bold">
                {completedCount} of {tasks.length} Completed
              </span>
            </div>

            <div className="space-y-2">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                    task.completed
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                      : 'bg-white border-[#DCE3DD] hover:border-[#075B45]/40 text-[#17211D]'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => {}} // handled by div click
                    className="mt-0.5 rounded border-[#DCE3DD] text-[#075B45] focus:ring-[#075B45] shrink-0 cursor-pointer"
                  />
                  <div className="space-y-1 flex-1 min-w-0">
                    <p className={`text-xs font-semibold leading-relaxed ${task.completed ? 'line-through text-[#66736C]' : 'text-[#17211D]'}`}>
                      {task.task}
                    </p>
                    <div className="flex items-center justify-between text-[10px] font-mono text-[#66736C]">
                      <span className="text-amber-800 font-medium">{task.guidelineBasis}</span>
                      {task.mandatory && (
                        <span className="text-rose-700 uppercase font-bold">Mandatory</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Responsible Sign-off Notice */}
          <div className="p-3.5 rounded-xl bg-[#F7F8F4] border border-[#DCE3DD] text-[11px] text-[#17211D] space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-[#17211D]">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>Statutory Sign-Off Protocol</span>
            </div>
            <p className="text-[#66736C] leading-relaxed">
              This checklist represents potentially applicable verification points derived from government guidelines. Final administrative sanction requires physical inspection by the WDT Engineer and joint Gram Panchayat sign-off.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#DCE3DD] flex items-center justify-between bg-[#F7F8F4]">
          <span className="text-xs font-mono text-[#66736C]">
            Checklist ID: {checklist.id}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#F0F3EE] text-[#17211D] text-xs font-semibold border border-[#DCE3DD] transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Checklist</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-[#075B45] hover:bg-[#0E8065] text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
