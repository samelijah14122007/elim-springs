import React, { useState } from 'react';
import {
  X,
  PhoneCall,
  Mic,
  Languages,
  Sparkles,
  Radio,
  CheckCircle2,
  AlertCircle,
  MapPin,
  User,
  ShieldCheck,
} from 'lucide-react';
import {
  IvrVoiceReport,
  LanguageCode,
  CallerRole,
  VoiceIssueCategory,
  WatershedCatchment,
} from '../../types';
import { bhashiniService, SUPPORTED_BHASHINI_LANGUAGES } from '../../services/bhashiniService';
import { supabaseService } from '../../services/supabaseService';
import { evidenceService } from '../../services/evidenceService';

interface IvrSimulationModalProps {
  watershed: WatershedCatchment;
  onClose: () => void;
  onAddReport: (report: IvrVoiceReport) => void;
}

export const IvrSimulationModal: React.FC<IvrSimulationModalProps> = ({
  watershed,
  onClose,
  onAddReport,
}) => {
  const [selectedLang, setSelectedLang] = useState<LanguageCode>('mr');
  const [callerRole, setCallerRole] = useState<CallerRole>('Farmer');
  const [callerName, setCallerName] = useState('Anandrao Patil');
  const [callerPhone, setCallerPhone] = useState('+91 98224 ' + Math.floor(10000 + Math.random() * 90000));
  const [callerVillage, setCallerVillage] = useState(
    watershed.name.includes('Dharashiv')
      ? 'Rui, Dharashiv'
      : watershed.name.includes('Bundelkhand')
      ? 'Alipura, Chhatarpur'
      : 'Beluguppa, Kalyandurg'
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>('');

  const handleRunSimulation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Step 1: Load deterministic transcript fixture
      setProcessingStep('Loading regional speech transcript fixture (1800-ELIM-WATER citizen grievance)...');
      const asr = await bhashiniService.transcribeAudio('', selectedLang);

      // Step 2: Language Identification
      setProcessingStep('Bhashini Language Identification (LID) running...');
      const lid = await bhashiniService.detectLanguage(asr.transcript);

      // Step 3: IndicTrans2 Translation
      setProcessingStep('Bhashini IndicTrans2 translating to English...');
      const trans = await bhashiniService.translate(asr.transcript, selectedLang, 'en');

      // Step 4: Intent Extraction
      setProcessingStep('Extracting structured problem intent and urgency...');
      const intent = await bhashiniService.extractFieldIntent(asr.transcript, trans.translatedText, selectedLang);

      const newId = `ivr-call-${Date.now().toString().slice(-4)}`;
      const newReport: IvrVoiceReport = {
        id: newId,
        callerPhone,
        callerName,
        callerRole,
        callerVillage,
        watershedId: watershed.id,
        watershedName: watershed.name,
        lat: watershed.center[0] + (Math.random() - 0.5) * 0.015,
        lng: watershed.center[1] + (Math.random() - 0.5) * 0.015,
        callTimestamp: new Date().toISOString(),
        durationSeconds: Math.floor(20 + Math.random() * 20),
        sourceLanguage: selectedLang,
        sourceLanguageName: lid.languageName,
        audioUrl: '', // Clean: no fake environmental sounds
        originalTranscript: asr.transcript,
        englishTranslation: trans.translatedText,
        detectedIntent: intent.intent,
        urgency: intent.urgency,
        processingStatus: 'Structured',
        caseStatus: 'Pending Verification',
        bhashiniModelUsed: asr.modelUsed, // "DEMO VOICE — TRANSCRIPT FIXTURE"
        bhashiniConfidence: trans.confidenceScore || 0.95,
        aiExtractedEntities: {
          structureMentioned: intent.structureMentioned,
          issueCategory: intent.issueCategory,
          severity: intent.urgency === 'Critical' ? 'High' : intent.urgency === 'High' ? 'High' : intent.urgency === 'Medium' ? 'Medium' : 'Low',
          reportedLocation: intent.reportedLocation || callerVillage,
          urgencyScore: intent.urgencyScore,
        },
        status: 'Transcribed',
        isSimulated: true,
      };

      const integrityHash = evidenceService.generateSha256(
        `${newId}:${callerPhone}:${asr.transcript}:${Date.now()}`
      );

      // Persist to Supabase evidence and voice_reports tables (STATUS MUST BE PENDING, NOT VERIFIED!)
      try {
        const evidenceRes = await supabaseService.createEvidence({
          evidence_type: 'VOICE_REPORT',
          source: '1800-ELIM-WATER IVR Citizen Hotline (DEMO VOICE)',
          title: `Voice Grievance: ${intent.issueCategory} (${lid.languageName})`,
          description: trans.translatedText,
          watershed_id: watershed.id,
          latitude: newReport.lat,
          longitude: newReport.lng,
          integrity_hash: integrityHash,
          status: 'PENDING', // Rule 13: Voice reports are NOT field verified until inspected
        });

        const evidenceId = evidenceRes?.data?.id;

        await supabaseService.createVoiceReport({
          id: newId,
          evidence_id: evidenceId,
          caller_id: callerPhone,
          storage_path: `voice-recordings/${watershed.id}/${newId}_${selectedLang}.wav`,
          language: lid.languageName,
          duration_seconds: newReport.durationSeconds,
          transcript: asr.transcript,
          translation: trans.translatedText,
          issue_category: intent.issueCategory,
          urgency: intent.urgency,
          latitude: newReport.lat,
          longitude: newReport.lng,
          structured_report: {
            callerName,
            callerRole,
            village: callerVillage,
            structureMentioned: intent.structureMentioned,
            urgencyScore: intent.urgencyScore,
            bhashiniEngine: asr.modelUsed,
            isSimulated: true,
            verificationStatus: 'PENDING FIELD VERIFICATION',
          },
          processing_status: 'STRUCTURED',
        });
      } catch (dbErr) {
        console.warn('[Supabase] Voice report persistence notice:', dbErr);
      }

      onAddReport(newReport);
      onClose();
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#17211D]/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-[#DCE3DD] rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#DCE3DD] flex items-center justify-between bg-[#F7F8F4]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
              <PhoneCall className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-[#17211D] text-base">
                  DEMO VOICE / TRANSCRIPT FIXTURE
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-bold">
                  SIMULATION
                </span>
              </div>
              <p className="text-xs text-[#66736C]">
                1800-ELIM-WATER Hotline • Regional Field Observation Fixtures
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

        {/* Content Form */}
        <form onSubmit={handleRunSimulation} className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Disclaimer */}
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              This modal loads a <strong>DEMO VOICE — TRANSCRIPT FIXTURE</strong> with IndicTrans2 translation and intent extraction. For live microphone recording with true WAV audio conversion, use the <strong>Speak Field Report</strong> button in the main IVR console.
            </p>
          </div>

          {/* Language Selector */}
          <div>
            <label className="text-xs font-semibold text-[#17211D] block mb-1.5 flex items-center gap-1.5">
              <Languages className="w-3.5 h-3.5 text-[#1677A8]" />
              <span>Caller Dialect / Language</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {SUPPORTED_BHASHINI_LANGUAGES.map((lang) => (
                <button
                  type="button"
                  key={lang.code}
                  onClick={() => setSelectedLang(lang.code)}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center transition-all cursor-pointer ${
                    selectedLang === lang.code
                      ? 'bg-amber-50 border-amber-400 text-amber-900 shadow-xs'
                      : 'bg-[#F7F8F4] border-[#DCE3DD] text-[#66736C] hover:text-[#17211D] hover:bg-[#F0F3EE]'
                  }`}
                >
                  <span className="font-bold">{lang.name}</span>
                  <span className="text-[10px] opacity-75 font-normal">{lang.nativeName}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Caller Role */}
          <div>
            <label className="text-xs font-semibold text-[#17211D] block mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#1677A8]" />
              <span>Caller Role</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Farmer', 'Gram Rozgar Sevak', 'Citizen'] as CallerRole[]).map((role) => (
                <button
                  type="button"
                  key={role}
                  onClick={() => setCallerRole(role)}
                  className={`p-2 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                    callerRole === role
                      ? 'bg-[#075B45] border-[#075B45] text-white font-bold'
                      : 'bg-[#F7F8F4] border-[#DCE3DD] text-[#66736C] hover:text-[#17211D] hover:bg-[#F0F3EE]'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          {/* Caller Identity */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#66736C] block mb-1">
                Caller Name
              </label>
              <input
                type="text"
                value={callerName}
                onChange={(e) => setCallerName(e.target.value)}
                className="w-full bg-[#F7F8F4] border border-[#DCE3DD] rounded-xl px-3 py-2 text-xs text-[#17211D] focus:outline-none focus:border-[#075B45]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#66736C] block mb-1">
                Caller Phone
              </label>
              <input
                type="text"
                value={callerPhone}
                onChange={(e) => setCallerPhone(e.target.value)}
                className="w-full bg-[#F7F8F4] border border-[#DCE3DD] rounded-xl px-3 py-2 text-xs text-[#17211D] focus:outline-none focus:border-[#075B45] font-mono"
              />
            </div>
          </div>

          {/* Village / Location */}
          <div>
            <label className="text-xs font-semibold text-[#66736C] block mb-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#1677A8]" />
              <span>Village / Watershed Location</span>
            </label>
            <input
              type="text"
              value={callerVillage}
              onChange={(e) => setCallerVillage(e.target.value)}
              className="w-full bg-[#F7F8F4] border border-[#DCE3DD] rounded-xl px-3 py-2 text-xs text-[#17211D] focus:outline-none focus:border-[#075B45]"
            />
          </div>

          {/* Processing Status Banner */}
          {isProcessing && (
            <div className="p-3.5 rounded-xl bg-[#F7F8F4] border border-cyan-300 text-xs space-y-2 animate-pulse">
              <div className="flex items-center gap-2 text-cyan-700 font-semibold">
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Processing Grievance Fixture...</span>
              </div>
              <p className="text-[11px] text-[#66736C]">{processingStep}</p>
            </div>
          )}

          {/* Submit */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#DCE3DD]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#F0F3EE] text-[#17211D] text-xs font-semibold hover:bg-[#DCE3DD] transition-colors cursor-pointer border border-[#DCE3DD]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>Load Demo Grievance Fixture</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
