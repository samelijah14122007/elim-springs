import React, { useState } from 'react';
import { WatershedCase, EvidenceAuditEntry, EvidenceChainResult } from '../../types';
import { evidenceService } from '../../services/evidenceService';
import {
  ShieldCheck,
  X,
  Hash,
  Clock,
  User,
  CheckCircle2,
  Lock,
  Copy,
  Check,
  AlertTriangle,
  RefreshCw,
  Layers,
  FileCheck,
  Smartphone,
  Eye,
  Satellite,
  Bot,
  BookOpen,
  ClipboardCheck,
} from 'lucide-react';

interface EvidenceChainModalProps {
  watershedCase?: WatershedCase;
  customChain?: EvidenceAuditEntry[];
  caseNumber?: string;
  caseTitle?: string;
  onClose: () => void;
}

export const EvidenceChainModal: React.FC<EvidenceChainModalProps> = ({
  watershedCase,
  customChain,
  caseNumber = watershedCase?.caseNumber || 'ES-2026-0842',
  caseTitle = watershedCase?.title || 'Rui Check Dam #4 Siltation & Storage Impairment',
  onClose,
}) => {
  // Use either custom chain, or existing watershedCase chain, or build standard full multi-source chain
  const baseChain =
    customChain ||
    (watershedCase?.evidenceChain && watershedCase.evidenceChain.length >= 4
      ? evidenceService.buildCaseEvidenceChain(watershedCase.id)
      : evidenceService.buildCaseEvidenceChain('default-case'));

  const [chain, setChain] = useState<EvidenceAuditEntry[]>(baseChain);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<EvidenceChainResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [tamperSimulated, setTamperSimulated] = useState(false);

  const copyToClipboard = (hash: string) => {
    navigator.clipboard?.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const handleVerify = () => {
    setIsVerifying(true);
    setVerificationResult(null);
    setTimeout(() => {
      const res = evidenceService.verifyChainIntegrity(chain);
      setVerificationResult(res);
      setIsVerifying(false);
    }, 400);
  };

  const toggleTamperSimulation = () => {
    if (tamperSimulated) {
      // Reset to verified authentic chain
      setChain(baseChain);
      setTamperSimulated(false);
      setVerificationResult(null);
    } else {
      // Simulate modifying Block #3 payload without recalculating its hash
      const tampered = chain.map((block, idx) => {
        if (idx === 2) {
          return {
            ...block,
            inputPayloadExcerpt: block.inputPayloadExcerpt + ' [TAMPERED_DATA_MODIFIED_UNAUTHORIZED]',
            payloadExcerpt: (block.payloadExcerpt || '') + ' [TAMPERED_DATA_MODIFIED_UNAUTHORIZED]',
            isTampered: true,
          };
        }
        return block;
      });
      setChain(tampered);
      setTamperSimulated(true);
      // Immediately run verify to demonstrate failure
      const res = evidenceService.verifyChainIntegrity(tampered);
      setVerificationResult(res);
    }
  };

  const getEventTypeIcon = (type?: string) => {
    switch (type) {
      case 'VOICE_REPORT':
        return <Smartphone className="w-3.5 h-3.5 text-blue-400" />;
      case 'GEO_IMAGE':
        return <Eye className="w-3.5 h-3.5 text-amber-400" />;
      case 'OCR_EXTRACTION':
        return <FileCheck className="w-3.5 h-3.5 text-purple-400" />;
      case 'SATELLITE_ANOMALY':
        return <Satellite className="w-3.5 h-3.5 text-cyan-400" />;
      case 'AI_REASONING':
        return <Bot className="w-3.5 h-3.5 text-emerald-400" />;
      case 'GUIDELINE_RETRIEVAL':
        return <BookOpen className="w-3.5 h-3.5 text-orange-400" />;
      case 'FIELD_VERIFICATION':
        return <ClipboardCheck className="w-3.5 h-3.5 text-pink-400" />;
      default:
        return <Layers className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const getEventTypeBadgeClass = (type?: string) => {
    switch (type) {
      case 'VOICE_REPORT':
        return 'bg-blue-500/10 text-blue-300 border-blue-500/30';
      case 'GEO_IMAGE':
        return 'bg-amber-500/10 text-amber-300 border-amber-500/30';
      case 'OCR_EXTRACTION':
        return 'bg-purple-500/10 text-purple-300 border-purple-500/30';
      case 'SATELLITE_ANOMALY':
        return 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30';
      case 'AI_REASONING':
        return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';
      case 'GUIDELINE_RETRIEVAL':
        return 'bg-orange-500/10 text-orange-300 border-orange-500/30';
      case 'FIELD_VERIFICATION':
        return 'bg-pink-500/10 text-pink-300 border-pink-500/30';
      default:
        return 'bg-slate-700/50 text-slate-300 border-slate-600/50';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#17211D]/40 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white border border-[#DCE3DD] rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#DCE3DD] bg-[#F7F8F4]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#075B45]/10 text-[#075B45] border border-[#075B45]/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-[#17211D]">PROTOTYPE EVIDENCE CHAIN</h3>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#075B45]/10 text-[#075B45] border border-[#075B45]/20 font-bold">
                  SHA-256 Evidence Integrity Hash Chain
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200 font-semibold">
                  {caseNumber}
                </span>
              </div>
              <p className="text-xs text-[#66736C] mt-0.5 line-clamp-1">{caseTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#F0F3EE] hover:bg-[#DCE3DD] text-[#66736C] hover:text-[#17211D] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Verification Control & Summary Bar */}
        <div className="px-5 py-3 border-b border-[#DCE3DD] bg-white flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#075B45]" />
            <span className="text-[#66736C]">
              Chain Length: <strong className="text-[#17211D]">{chain.length} SHA-256 Evidence Records</strong> • Multi-source aggregation
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Tamper simulation toggle */}
            <button
              onClick={toggleTamperSimulation}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors flex items-center gap-1.5 cursor-pointer ${
                tamperSimulated
                  ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                  : 'bg-[#F0F3EE] text-[#17211D] border-[#DCE3DD] hover:bg-[#DCE3DD]'
              }`}
              title="Test tamper detection in action"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{tamperSimulated ? 'Revert Tamper Test' : 'Simulate Tamper Test'}</span>
            </button>

            {/* Verify Integrity Button */}
            <button
              onClick={handleVerify}
              disabled={isVerifying}
              className="px-3.5 py-1.5 rounded-xl bg-[#075B45] hover:bg-[#0E8065] text-white font-semibold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin' : ''}`} />
              <span>{isVerifying ? 'Verifying Hashes...' : 'Verify Chain Integrity'}</span>
            </button>
          </div>
        </div>

        {/* Verification Result Banner */}
        {verificationResult && (
          <div
            className={`px-5 py-3 border-b text-xs flex items-center justify-between transition-all ${
              verificationResult.isValid
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-red-50 border-red-200 text-red-900'
            }`}
          >
            <div className="flex items-center gap-2">
              {verificationResult.isValid ? (
                <CheckCircle2 className="w-4 h-4 text-[#075B45] flex-shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 animate-bounce" />
              )}
              <span className="font-semibold">{verificationResult.message}</span>
            </div>
            <span className="text-[10px] font-mono opacity-70">
              {new Date(verificationResult.verificationTimestamp).toLocaleTimeString()}
            </span>
          </div>
        )}

        {/* Audit Trail Timeline */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 bg-white">
          <div className="relative pl-6 sm:pl-8 border-l-2 border-[#DCE3DD] space-y-6">
            {chain.map((entry) => {
              const isBlockTampered = entry.isTampered;
              const isPending = entry.verificationStatus === 'PENDING';

              return (
                <div key={entry.step} className="relative group">
                  {/* Stepper Dot */}
                  <div
                    className={`absolute -left-[31px] sm:-left-[39px] top-3 w-4 h-4 rounded-full border-2 border-white transition-transform group-hover:scale-125 ${
                      isBlockTampered
                        ? 'bg-red-500 shadow-md shadow-red-500/50'
                        : isPending
                        ? 'bg-amber-500'
                        : 'bg-[#075B45]'
                    }`}
                  />

                  {/* Block Container */}
                  <div
                    className={`p-4 sm:p-5 rounded-2xl border transition-all space-y-3 ${
                      isBlockTampered
                        ? 'bg-red-50/50 border-red-200 shadow-xs'
                        : 'bg-[#F7F8F4] border-[#DCE3DD] hover:border-[#075B45]/40 shadow-2xs'
                    }`}
                  >
                    {/* Top Row: Block #, Type, Source, Timestamp */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#DCE3DD] text-xs">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-[#17211D] bg-[#F0F3EE] px-2 py-0.5 rounded border border-[#DCE3DD]">
                          Block #{entry.step} {entry.eventId ? `• ${entry.eventId}` : ''}
                        </span>

                        <span
                          className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[11px] font-semibold ${getEventTypeBadgeClass(
                            entry.eventType
                          )}`}
                        >
                          {getEventTypeIcon(entry.eventType)}
                          <span>{entry.eventType || 'EVIDENCE'}</span>
                        </span>

                        <span className="text-[11px] text-[#66736C] font-medium">
                          via {entry.source || 'ELIM Springs Platform'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-[11px] text-[#66736C] font-mono">
                        <Clock className="w-3 h-3" />
                        <span>{entry.timestamp}</span>
                      </div>
                    </div>

                    {/* Action & Actor */}
                    <div>
                      <h4 className="text-sm font-bold text-[#17211D] flex items-center gap-2">
                        <span>{entry.action}</span>
                      </h4>
                      {entry.description && (
                        <p className="text-xs text-[#66736C] mt-0.5">{entry.description}</p>
                      )}
                      <div className="flex items-center gap-1.5 text-xs text-[#66736C] mt-1.5">
                        <User className="w-3.5 h-3.5 text-[#66736C]" />
                        <span>Actor / Entity:</span>
                        <strong className="text-[#075B45] font-semibold">{entry.actor}</strong>
                      </div>
                    </div>

                    {/* Payload Excerpt Box */}
                    <div
                      className={`p-3 rounded-xl border text-xs font-mono ${
                        isBlockTampered
                          ? 'bg-red-50 border-red-200 text-red-900'
                          : 'bg-white border-[#DCE3DD] text-[#17211D] shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] uppercase font-bold text-[#66736C] mb-1">
                        <span>Attested Payload Excerpt:</span>
                        {isBlockTampered && (
                          <span className="text-red-700 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> MODIFIED PAYLOAD
                          </span>
                        )}
                      </div>
                      <div className="break-all">{entry.inputPayloadExcerpt || entry.payloadExcerpt}</div>
                    </div>

                    {/* Cryptographic Linkage Hashes */}
                    <div className="bg-white p-3 rounded-xl border border-[#DCE3DD] space-y-1.5 text-[11px] font-mono shadow-2xs">
                      {/* Previous Hash */}
                      <div className="flex items-center justify-between text-[#66736C]">
                        <span className="text-[10px] uppercase font-semibold">Previous Hash:</span>
                        <span className="text-[#66736C] truncate max-w-[280px] sm:max-w-md">
                          {entry.previousHash || '00000000000000000000000000000000...'}
                        </span>
                      </div>

                      {/* Current SHA-256 Hash */}
                      <div className="flex items-center justify-between text-[#075B45] pt-1.5 border-t border-[#DCE3DD]">
                        <span className="text-[10px] uppercase font-bold flex items-center gap-1">
                          <Hash className="w-3 h-3" />
                          <span>SHA-256 Evidence Integrity Hash:</span>
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="truncate max-w-[260px] sm:max-w-md font-bold font-mono">
                            {entry.sha256Hash}
                          </span>
                          <button
                            onClick={() => copyToClipboard(entry.sha256Hash)}
                            className="p-1 hover:text-[#0E8065] transition-colors cursor-pointer"
                            title="Copy Hash"
                          >
                            {copiedHash === entry.sha256Hash ? (
                              <Check className="w-3.5 h-3.5 text-[#075B45]" />
                            ) : (
                              <Copy className="w-3.5 h-3.5 text-[#66736C]" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Status Pill */}
                    <div className="flex items-center justify-between pt-1 text-[11px]">
                      <span className="text-[#66736C]">Status Verification:</span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-semibold border ${
                          isBlockTampered
                            ? 'bg-red-50 text-red-800 border-red-200'
                            : isPending
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}
                      >
                        {isBlockTampered ? 'TAMPER DETECTED' : entry.verificationStatus}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer & Disclaimer */}
        <div className="p-4 border-t border-[#DCE3DD] bg-[#F7F8F4] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#66736C]">
          <div className="space-y-0.5">
            <span className="block font-semibold text-[#17211D]">
              PROTOTYPE NOTICE: Cryptographic Audit Trail
            </span>
            <p className="text-[11px] text-[#66736C]">
              Demonstrates deterministic SHA-256 evidence sealing across GIS, Satellite, Voice, and Field Photos.
              Compliant with PMKSY-WDC 2.0 social audit standards.
            </p>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#F0F3EE] hover:bg-[#DCE3DD] text-[#17211D] font-semibold transition-colors whitespace-nowrap self-end sm:self-auto cursor-pointer border border-[#DCE3DD]"
          >
            Close Audit Trail
          </button>
        </div>
      </div>
    </div>
  );
};
