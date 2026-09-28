import React, { useState, useRef, useEffect } from 'react';
import { AgentChatMessage, EvidenceBadgeType } from '../../types';
import { llmGeoAgentService } from '../../services/llmService';
import {
  Bot,
  User,
  Send,
  Sparkles,
  Terminal,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
  Cpu,
  ShieldCheck,
  Satellite,
  Layers,
  Eye,
  FileCheck,
  Smartphone,
  ClipboardCheck,
  Check,
  HelpCircle,
  Clock,
  Compass,
  Square,
  CheckSquare,
} from 'lucide-react';

interface GeoAgentChatProps {
  watershedId: string;
  initialStructureFocus?: string;
  onOpenEvidenceChain: (caseId?: string) => void;
  onNavigateToGis?: () => void;
  onNavigateToSatellite?: () => void;
  onNavigateToImages?: () => void;
  onNavigateToIvr?: () => void;
}

export const GeoAgentChat: React.FC<GeoAgentChatProps> = ({
  watershedId,
  initialStructureFocus,
  onOpenEvidenceChain,
  onNavigateToGis,
  onNavigateToSatellite,
  onNavigateToImages,
  onNavigateToIvr,
}) => {
  const [messages, setMessages] = useState<AgentChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'agent',
      timestamp: '10:00',
      text: `### ELIM SPRINGS AI GEO AGENT
I am an **evidence-driven watershed reasoning assistant** built for SIH 2026 (PS 26015). 

Instead of generating unverified claims, I autonomously plan, execute, and cross-reference 5 evidence layers:
1. **Watershed GIS Topography & Asset Registries**
2. **Sentinel-2 Multispectral Indices (NDVI Biomass & NDWI Moisture)**
3. **Geo-Coded Ground Photos with Hardware Tamper Verification**
4. **Digital India Bhashini Transcribed Inbound Voice Grievances**
5. **RAG-Indexed Government Guidelines (PMKSY-WDC 2.0, MGNREGA, CGWB)**

Select a preset diagnostic flow below or click any of the 8 suggested questions:`,
      evidenceBadges: [
        'GIS RECORD',
        'SATELLITE OBSERVATION',
        'GEO-CODED IMAGE',
        'VOICE REPORT',
        'GUIDELINE CONTEXT',
      ],
      caseAction: {
        caseId: 'case-es-2026-0842',
        structureId: 'struct-cd-04',
        label: 'Inspect Rui East Check Dam Evidence Chain (SHA-256)',
        type: 'evidence_chain',
      },
    },
  ]);

  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [checkedTasks, setCheckedTasks] = useState<Record<string, boolean>>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  useEffect(() => {
    if (initialStructureFocus) {
      handleSend(
        `Why was ${initialStructureFocus} flagged?`
      );
    }
  }, [initialStructureFocus]);

  const handleSend = async (
    customText?: string,
    presetFlow?: 'flow-anomaly' | 'flow-voice' | 'flow-ocr' | 'flow-verification'
  ) => {
    const textToSend = customText || input;
    if ((!textToSend.trim() && !presetFlow) || isThinking) return;

    const userMsg: AgentChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: textToSend || (presetFlow ? `Execute ${presetFlow}` : ''),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsThinking(true);
    if (presetFlow) setActivePreset(presetFlow);

    try {
      const agentResponse = await llmGeoAgentService.sendMessage(
        messages,
        textToSend,
        watershedId,
        presetFlow
      );
      setMessages((prev) => [...prev, agentResponse]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsThinking(false);
    }
  };

  const toggleTask = (taskId: string) => {
    setCheckedTasks((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  const presetFlows = [
    {
      id: 'flow-anomaly' as const,
      label: 'Flow A: Siltation Anomaly',
      sub: 'CD-04 Silt & Moisture',
      icon: Satellite,
      color: 'from-cyan-600 to-blue-600',
    },
    {
      id: 'flow-voice' as const,
      label: 'Flow B: Citizen Voice',
      sub: 'IVR & Bhashini Grievance',
      icon: Smartphone,
      color: 'from-blue-600 to-indigo-600',
    },
    {
      id: 'flow-ocr' as const,
      label: 'Flow C: Milestone OCR',
      sub: 'Signboard vs Registry Audit',
      icon: FileCheck,
      color: 'from-purple-600 to-pink-600',
    },
    {
      id: 'flow-verification' as const,
      label: 'Flow D: Pre-Monsoon SOP',
      sub: 'Ground Verification Tasks',
      icon: ClipboardCheck,
      color: 'from-emerald-600 to-teal-600',
    },
  ];

  // The exact 8 Clickable Suggested Questions (Section 2)
  const suggestedQuestions = [
    'Where are potential vegetation anomalies?',
    'What evidence is available around Rui East Check Dam #4?',
    'Why was Rui East Check Dam #4 flagged?',
    'What should a field engineer verify here?',
    'Show high-urgency citizen reports near this watershed.',
    'Which assets have voice reports and geo-photos?',
    'What guideline context is relevant to this issue?',
    'What changed between the baseline and current observation?',
  ];

  const getBadgeStyle = (badge: EvidenceBadgeType) => {
    switch (badge) {
      case 'SATELLITE OBSERVATION':
        return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/25';
      case 'GIS RECORD':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25';
      case 'GEO-CODED IMAGE':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/25';
      case 'OCR EXTRACTION':
        return 'bg-purple-500/15 text-purple-300 border-purple-500/25';
      case 'VOICE REPORT':
        return 'bg-blue-500/15 text-blue-300 border-blue-500/25';
      case 'GUIDELINE CONTEXT':
        return 'bg-orange-500/15 text-orange-300 border-orange-500/25';
      case 'FIELD VERIFICATION':
        return 'bg-pink-500/15 text-pink-300 border-pink-500/25';
      default:
        return 'bg-slate-700/40 text-slate-300 border-slate-600';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl h-[820px] shadow-2xl flex flex-col overflow-hidden">
      {/* Workspace Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-purple-600/20 flex-shrink-0">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-sm text-white">ELIM SPRINGS AI GEO AGENT</h3>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold">
                PROTOTYPE AI REASONING
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Evidence-driven watershed reasoning assistant • Target:{' '}
              <strong className="text-emerald-400 font-mono">{watershedId}</strong>
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setMessages([
              {
                id: 'welcome-reset',
                sender: 'agent',
                timestamp: 'Now',
                text: 'Conversation reset. I am ready to evaluate new field imagery, IVR voice complaints, or satellite indices.',
              },
            ]);
            setActivePreset(null);
          }}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs flex items-center gap-1.5 transition-colors"
          title="Reset conversation"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>

      {/* Preset Reasoning Flows Bar */}
      <div className="p-2.5 bg-slate-950/90 border-b border-slate-800/80">
        <div className="flex items-center gap-1.5 mb-1.5 px-1">
          <Compass className="w-3.5 h-3.5 text-purple-400" />
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Preset Multimodal Reasoning Flows:
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {presetFlows.map((flow) => {
            const Icon = flow.icon;
            const isActive = activePreset === flow.id;
            return (
              <button
                key={flow.id}
                onClick={() => handleSend(flow.label, flow.id)}
                disabled={isThinking}
                className={`p-2 rounded-xl border text-left transition-all group ${
                  isActive
                    ? 'bg-slate-800 border-purple-500/60 shadow-md shadow-purple-950/30'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <div
                    className={`w-6 h-6 rounded-lg bg-gradient-to-tr ${flow.color} flex items-center justify-center text-white flex-shrink-0`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] font-bold text-white truncate leading-tight">
                      {flow.label}
                    </div>
                    <div className="text-[9px] text-slate-400 truncate">{flow.sub}</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isAgent = msg.sender === 'agent';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-4xl ${isAgent ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                  isAgent
                    ? 'bg-purple-600/30 text-purple-400 border border-purple-500/40 shadow-md shadow-purple-950/20'
                    : 'bg-emerald-600/30 text-emerald-400 border border-emerald-500/40'
                }`}
              >
                {isAgent ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>

              {/* Message Content Body */}
              <div className="space-y-3 min-w-0 flex-1">
                {/* Evidence Classification Badges Row */}
                {isAgent && msg.evidenceBadges && msg.evidenceBadges.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[9px] uppercase font-bold text-slate-500 mr-1 font-mono">
                      Classified Evidence:
                    </span>
                    {msg.evidenceBadges.map((badge, bIdx) => (
                      <span
                        key={bIdx}
                        className={`text-[9px] font-mono font-semibold px-2 py-0.5 rounded-full border ${getBadgeStyle(
                          badge
                        )}`}
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                )}

                {/* Primary Message Bubble */}
                <div
                  className={`px-4 py-3 rounded-2xl text-xs leading-relaxed space-y-3 ${
                    isAgent
                      ? 'bg-slate-800/80 border border-slate-700/60 rounded-bl-sm text-sm text-slate-200 shadow-md max-w-[90%]'
                      : 'bg-emerald-600/15 border border-emerald-500/20 rounded-br-sm text-sm text-slate-200 shadow-md max-w-[80%] ml-auto'
                  }`}
                >
                  <div className="whitespace-pre-line font-sans space-y-2">{msg.text}</div>

                  {/* Structured Answer Cards (6 Sections) */}
                  {msg.structuredSections && (
                    <div className="pt-2 space-y-3 border-t border-slate-800/80">
                      {/* 1. WHAT THE SYSTEM OBSERVES */}
                      <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/30 space-y-1.5">
                        <div className="flex items-center gap-1.5 text-cyan-400 font-bold text-[11px] font-mono">
                          <Satellite className="w-3.5 h-3.5" />
                          <span>1. WHAT THE SYSTEM OBSERVES</span>
                        </div>
                        <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-300 pl-1">
                          {msg.structuredSections.whatSystemObserves.map((item, idx) => (
                            <li key={idx} className="leading-snug">
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* 2. WHAT WAS REPORTED */}
                      <div className="p-3 rounded-xl bg-blue-950/20 border border-blue-500/30 space-y-1.5">
                        <div className="flex items-center gap-1.5 text-blue-400 font-bold text-[11px] font-mono">
                          <Smartphone className="w-3.5 h-3.5" />
                          <span>2. WHAT WAS REPORTED</span>
                        </div>
                        <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-300 pl-1">
                          {msg.structuredSections.whatWasReported.map((item, idx) => (
                            <li key={idx} className="leading-snug">
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* 3. RELEVANT GUIDANCE */}
                      <div className="p-3 rounded-xl bg-orange-950/20 border border-orange-500/30 space-y-2">
                        <div className="flex items-center gap-1.5 text-orange-400 font-bold text-[11px] font-mono">
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>3. RELEVANT GOVERNMENT GUIDELINES</span>
                        </div>
                        <div className="space-y-1.5">
                          {msg.structuredSections.relevantGuidance.map((g, idx) => (
                            <div
                              key={idx}
                              className="text-[11px] text-slate-300 pl-2.5 border-l-2 border-orange-500/50 space-y-0.5"
                            >
                              <div className="font-semibold text-orange-200">
                                {g.docTitle} — {g.section} (Page {g.page})
                              </div>
                              <div className="text-slate-400 italic">"{g.norm}"</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 4. WHAT THIS MAY INDICATE */}
                      <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/30 space-y-1.5">
                        <div className="flex items-center gap-1.5 text-purple-400 font-bold text-[11px] font-mono">
                          <HelpCircle className="w-3.5 h-3.5" />
                          <span>4. WHAT THIS MAY INDICATE (PROBABILISTIC INTERPRETATION)</span>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          {msg.structuredSections.whatThisMayIndicate}
                        </p>
                      </div>

                      {/* 5. WHAT MUST BE VERIFIED (INTERACTIVE CHECKLIST) */}
                      <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
                        <div className="flex items-center justify-between text-[11px] font-mono">
                          <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                            <ClipboardCheck className="w-3.5 h-3.5" />
                            <span>5. WHAT MUST BE VERIFIED ON THE GROUND</span>
                          </span>
                          <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            Engineer Checklist
                          </span>
                        </div>
                        <div className="space-y-1.5">
                          {msg.structuredSections.whatMustBeVerified.map((v, idx) => {
                            const taskId = `${msg.id}-step-${idx}`;
                            const isChecked = !!checkedTasks[taskId];
                            return (
                              <button
                                key={idx}
                                onClick={() => toggleTask(taskId)}
                                className={`w-full text-left p-2 rounded-lg border text-[11px] flex items-start gap-2 transition-all ${
                                  isChecked
                                    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                                    : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                                }`}
                              >
                                {isChecked ? (
                                  <CheckSquare className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                                ) : (
                                  <Square className="w-3.5 h-3.5 text-slate-500 mt-0.5 flex-shrink-0" />
                                )}
                                <span className={isChecked ? 'line-through opacity-80' : ''}>
                                  {v}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* 6. CONFIDENCE / EVIDENCE COVERAGE */}
                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400">Evidence Coverage:</span>
                          <span className="text-emerald-400 font-bold">
                            {msg.structuredSections.confidenceCoverage.sourcesCount} /{' '}
                            {msg.structuredSections.confidenceCoverage.totalSources} Independent Sources
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400">Verification Status:</span>
                          <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-bold">
                            PENDING FIELD VERIFICATION
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Link: View Cryptographic Evidence Chain */}
                  {msg.caseAction && (
                    <div className="pt-2 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[11px] text-slate-400 font-medium">
                        Sealed into tamper-evident SHA-256 audit ledger:
                      </span>
                      <button
                        onClick={() => onOpenEvidenceChain(msg.caseAction?.caseId)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{msg.caseAction.label}</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Autonomous Tools Executed Trace (Section 4) */}
                {msg.toolInvocations && msg.toolInvocations.length > 0 && (
                  <div className="bg-slate-950 border border-purple-500/20 rounded-2xl p-3.5 space-y-2.5 text-xs">
                    <div className="flex items-center justify-between text-purple-400 font-bold text-[10px] uppercase font-mono tracking-wider pb-1 border-b border-purple-500/20">
                      <div className="flex items-center gap-1.5">
                        <Terminal className="w-3.5 h-3.5" />
                        <span>AGENT TOOL EXECUTION TRACE ({msg.toolInvocations.length})</span>
                      </div>
                      <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>ANALYSIS READY</span>
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {msg.toolInvocations.map((t, idx) => (
                        <div
                          key={idx}
                          className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 space-y-1 text-[11px]"
                        >
                          <div className="flex items-center justify-between font-mono">
                            <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              <span>{t.toolName}</span>
                            </span>
                            <span className="text-[9px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                              {t.status}
                            </span>
                          </div>
                          {t.summary ? (
                            <p className="text-[11px] text-slate-300 font-sans pl-5">
                              {t.summary}
                            </p>
                          ) : t.description ? (
                            <p className="text-[10px] text-slate-400 pl-5">{t.description}</p>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div
                  className={`text-[10px] text-slate-400 px-1 ${
                    isAgent ? 'text-left' : 'text-right'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {isThinking && (
          <div className="flex gap-3 max-w-xl mr-auto">
            <div className="w-8 h-8 rounded-xl bg-purple-600/30 text-purple-400 border border-purple-500/40 flex items-center justify-center flex-shrink-0">
              <Cpu className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-slate-950 border border-purple-500/30 rounded-2xl p-4 text-xs text-purple-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 animate-pulse text-purple-400" />
              <span>AI Geo Agent is querying GIS layers, Sentinel-2 spectral indices, and PMKSY guidelines...</span>
            </div>
          </div>
        )}

        <div ref={scrollRef} />
      </div>

      {/* Suggested Prompt Chips (Section 2 - 8 Clickable Questions) */}
      <div className="px-4 py-2 bg-slate-950/70 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="text-[10px] text-slate-400 uppercase font-bold flex-shrink-0 font-mono">
          Clickable Prompts:
        </span>
        {suggestedQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            disabled={isThinking}
            className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white whitespace-nowrap transition-colors border border-slate-700/60"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Natural Language Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="border-t border-slate-800 p-4 bg-slate-950/50 flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask AI Geo Agent (e.g. Why was Rui East Check Dam #4 flagged?)..."
          className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
        />
        <button
          type="submit"
          disabled={!input.trim() || isThinking}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all duration-150 hover:shadow-sm hover:shadow-emerald-900/40 flex-shrink-0 disabled:opacity-40 disabled:hover:bg-emerald-600"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
