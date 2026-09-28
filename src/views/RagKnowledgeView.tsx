import React, { useState, useEffect } from 'react';
import {
  RagKnowledgeDocument,
  RagSearchResult,
  EvidenceContext,
  VerificationChecklist,
  RagKnowledgeChunk,
} from '../types';
import { PageHeader, StatCard } from '../components/common';
import { ragService } from '../services/ragService';
import { DocumentCard } from '../components/rag/DocumentCard';
import {
  EvidenceContextBanner,
  PRESET_RAG_SCENARIOS,
} from '../components/rag/EvidenceContextBanner';
import { VerificationChecklistModal } from '../components/rag/VerificationChecklistModal';
import { useTranslation } from '../i18n';
import {
  BookOpen,
  Search,
  Sparkles,
  ClipboardCheck,
  CheckCircle2,
  AlertTriangle,
  Building,
  Layers,
  MapPin,
  Camera,
  PhoneCall,
  Info,
  Clock,
  ExternalLink,
  ShieldCheck,
  FileText,
  Bookmark,
} from 'lucide-react';

interface RagKnowledgeViewProps {
  onNavigateToGis?: (structureId?: string) => void;
  onNavigateToImages?: () => void;
  onNavigateToIvr?: () => void;
}

export const RagKnowledgeView: React.FC<RagKnowledgeViewProps> = ({
  onNavigateToGis,
  onNavigateToImages,
  onNavigateToIvr,
}) => {
  const { t } = useTranslation();
  const [documents, setDocuments] = useState<RagKnowledgeDocument[]>([]);
  const [query, setQuery] = useState(
    'What should be checked when a check dam shows heavy silt accumulation?'
  );
  const [searchResults, setSearchResults] = useState<RagSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchesPerformed, setSearchesPerformed] = useState(3);
  const [checklistsGeneratedCount, setChecklistsGeneratedCount] = useState(2);

  // Evidence context state
  const [activeScenarioIdx, setActiveScenarioIdx] = useState(0);
  const [activeContext, setActiveContext] = useState<EvidenceContext>(
    PRESET_RAG_SCENARIOS[0].context
  );

  // Verification Checklist Modal state
  const [activeChecklist, setActiveChecklist] = useState<VerificationChecklist | null>(null);

  useEffect(() => {
    ragService.getAllDocuments().then((docs) => {
      setDocuments(docs);
    });
    executeSearch(query);
  }, []);

  const executeSearch = async (searchQuery: string, customContext?: EvidenceContext) => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setSearchesPerformed((prev) => prev + 1);

    const results = await ragService.searchGuidelines(searchQuery, 4);
    setSearchResults(results);
    setIsSearching(false);
  };

  const handleSelectScenario = (index: number) => {
    setActiveScenarioIdx(index);
    const selected = PRESET_RAG_SCENARIOS[index];
    setActiveContext(selected.context);
    setQuery(selected.query);
    executeSearch(selected.query, selected.context);
  };

  const handleCreateChecklist = async (result: RagSearchResult) => {
    const checklist = await ragService.getVerificationChecklist(activeContext, result);
    setActiveChecklist(checklist);
    setChecklistsGeneratedCount((prev) => prev + 1);
  };

  const suggestedQueries = [
    'What should be checked when a check dam shows heavy silt accumulation?',
    'What evidence is required before approving watershed structure maintenance?',
    'What should be verified for artificial groundwater recharge structures?',
    'Ridge to valley treatment sequence and gully plug norms',
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* 1. TOP STANDARDIZED PAGE HEADER */}
      <PageHeader
        module="MOD 11"
        title={t('rag.title') || 'Watershed Document RAG & Statutory Guideline Intelligence'}
        description={t('rag.subtitle') || 'Contextual guideline retrieval across PMKSY-WDC 2.0, MGNREGA Natural Resource Management & CGWB Artificial Recharge Manuals.'}
        icon={BookOpen}
        breadcrumbs={[
          { label: 'India' },
          { label: 'Ministry of Jal Shakti / DoLR' },
          { label: 'Statutory Guidelines' },
          { label: 'Semantic Index' },
        ]}
        badge={
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/20 font-bold">
              LOCAL SEMANTIC INDEX
            </span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              3 MANUALS • 7 CHUNKS
            </span>
          </div>
        }
      />

      {/* 2. SUMMARY KPIS */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <StatCard
          label={t('rag.manualsIndexed') || 'Manuals Indexed'}
          value={3}
          subValue="Government gazettes"
          icon={BookOpen}
        />
        <StatCard
          label="Guideline Topics"
          value={6}
          subValue="Prescribed technical domains"
          icon={Layers}
        />
        <StatCard
          label="Knowledge Chunks"
          value={7}
          subValue="Statutory clauses & norms"
          icon={FileText}
        />
        <StatCard
          label="Searches Performed"
          value={searchesPerformed}
          subValue="Context queries executed"
          icon={Search}
          trend={{ direction: 'up', label: 'Active RAG' }}
        />
        <StatCard
          label="Checklists Created"
          value={checklistsGeneratedCount}
          subValue="Actionable verification lists"
          icon={ClipboardCheck}
          trend={{ direction: 'up', label: 'Field ready' }}
        />
      </div>

      {/* 3. EVIDENCE CONTEXT BANNER (Connects RAG directly to field evidence) */}
      <EvidenceContextBanner
        context={activeContext}
        onSelectScenario={handleSelectScenario}
        activeScenarioIndex={activeScenarioIdx}
        onNavigateToGis={onNavigateToGis}
        onNavigateToImages={onNavigateToImages}
        onNavigateToIvr={onNavigateToIvr}
      />

      {/* 4. SEARCH / QUESTION BOX & SUGGESTED QUERIES */}
      <div className="bg-white border border-[#DCE3DD] rounded-3xl p-6 shadow-xs space-y-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            executeSearch(query);
          }}
          className="flex flex-col sm:flex-row items-center gap-3"
        >
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#66736C]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('rag.searchPlaceholder') || 'Ask questions: e.g. What should be checked when a check dam shows heavy silt accumulation?'}
              className="w-full bg-[#F7F8F4] border border-[#DCE3DD] rounded-2xl pl-11 pr-4 py-3.5 text-xs text-[#17211D] placeholder-[#66736C] focus:outline-none focus:border-[#075B45] shadow-2xs"
            />
          </div>
          <button
            type="submit"
            disabled={isSearching}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[#075B45] hover:bg-[#0E8065] text-white font-extrabold text-xs shadow-xs transition-all cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 fill-current" />
            <span>{isSearching ? (t('common.loading') || 'Searching...') : (t('rag.search') || 'Search Guidelines')}</span>
          </button>
        </form>

        {/* Suggested Queries Chips */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
          <span className="text-[10px] uppercase font-bold text-[#66736C] flex-shrink-0 font-mono">
            Suggested Questions:
          </span>
          {suggestedQueries.map((sq, idx) => (
            <button
              key={idx}
              onClick={() => {
                setQuery(sq);
                executeSearch(sq);
              }}
              className="text-[11px] px-3 py-1.5 rounded-xl bg-[#F7F8F4] border border-[#DCE3DD] hover:border-[#075B45]/50 text-[#17211D] hover:bg-[#F0F3EE] whitespace-nowrap transition-colors cursor-pointer"
            >
              {sq}
            </button>
          ))}
        </div>
      </div>

      {/* 5. MAIN WORKSPACE: SEARCH RESULTS & GUIDELINE CARDS (8 cols) + DOCUMENT REPOSITORY (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Retrieved Guideline Chunks & Actionable Checklists (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between pb-1">
            <h3 className="font-bold text-sm text-[#17211D] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#8A6A3F]" />
              <span>Retrieved Statutory Guidance ({searchResults.length} Clauses)</span>
            </h3>
            <span className="text-xs font-mono text-[#66736C]">
              Ranked by Semantic Relevance
            </span>
          </div>

          {/* Search Results List */}
          {searchResults.length === 0 ? (
            <div className="bg-white border border-[#DCE3DD] rounded-3xl p-8 text-center space-y-3 shadow-xs">
              <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
              <h4 className="text-sm font-bold text-[#17211D]">No Directly Matching Guidance Found</h4>
              <p className="text-xs text-[#66736C] max-w-md mx-auto leading-relaxed">
                No directly matching prototype guidance was found for "{query}".
                Try searching by structure type (e.g. Check Dam, Percolation Tank), issue category (e.g. Siltation, Seepage, Recharge), or watershed activity.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {searchResults.map((result) => {
                const relevancePct = Math.round(result.relevanceScore * 100);

                return (
                  <div
                    key={result.chunkId}
                    className="bg-white border border-[#DCE3DD] hover:border-[#075B45]/40 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4 transition-all"
                  >
                    {/* Top Clause Header */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 pb-3 border-b border-[#DCE3DD]">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-mono font-bold text-[#8A6A3F]">
                            {result.clauseNumber || 'Clause Norm'}
                          </span>
                          <span className="text-[10px] font-mono text-[#17211D] bg-[#F0F3EE] px-2 py-0.5 rounded border border-[#DCE3DD] font-semibold">
                            {result.pageNumber}
                          </span>
                          <span className="text-[10px] font-mono text-[#17211D] bg-[#F0F3EE] px-2 py-0.5 rounded border border-[#DCE3DD] font-semibold">
                            {result.topic}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-[#17211D]">{result.sectionTitle}</h4>
                        <div className="text-xs text-[#66736C] flex items-center gap-1.5">
                          <Building className="w-3 h-3 text-[#66736C]" />
                          <span>{result.docTitle}</span>
                        </div>
                      </div>

                      {/* Relevance Score Pill */}
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-mono bg-[#075B45]/10 text-[#075B45] border border-[#075B45]/20 px-3 py-1 rounded-xl font-bold flex items-center gap-1 shadow-2xs">
                          <span>Relevance: {relevancePct}%</span>
                        </span>
                      </div>
                    </div>

                    {/* Prototype Guideline Summary Callout */}
                    <div className="bg-[#F7F8F4] p-4 rounded-2xl border border-[#DCE3DD] space-y-2">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[#8A6A3F] font-mono flex items-center justify-between">
                        <span>PROTOTYPE GUIDELINE SUMMARY</span>
                        <span className="text-[#66736C]">{result.sourceStatus}</span>
                      </div>
                      <p className="text-xs text-[#17211D] leading-relaxed font-sans italic">
                        "{result.prototypeSummary}"
                      </p>
                    </div>

                    {/* Statutory Prescribed Norms */}
                    <div className="space-y-1.5">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[#66736C] font-mono">
                        Statutory Technical Norms:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {result.highlightedNorms.map((norm, i) => (
                          <span
                            key={i}
                            className="text-[11px] bg-[#F0F3EE] text-[#075B45] border border-[#075B45]/20 px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-medium"
                          >
                            <CheckCircle2 className="w-3 h-3 text-[#075B45] flex-shrink-0" />
                            <span>{norm}</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Actionable Verification Points */}
                    <div className="space-y-2 pt-2 border-t border-[#DCE3DD]">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[#66736C] font-mono">
                        Potentially Applicable Field Verification Points:
                      </div>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-[#17211D]">
                        {result.verificationPoints.map((pt, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#1677A8] shrink-0 mt-1.5"></span>
                            <span className="leading-snug">{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Bottom Action Footer: Create Checklist & Cross-Module Links */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#DCE3DD]">
                      <div className="text-[10px] text-[#66736C] font-mono">
                        Target Structure: {result.applicableStructure}
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                          onClick={() => handleCreateChecklist(result)}
                          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#075B45] hover:bg-[#0E8065] text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                          title="Generate structured field inspection checklist"
                        >
                          <ClipboardCheck className="w-4 h-4" />
                          <span>Create Verification Checklist</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Indexed Manuals Library (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between pb-1">
            <h3 className="font-bold text-sm text-[#17211D] flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-[#075B45]" />
              <span>Government Guideline Library</span>
            </h3>
            <span className="text-xs font-mono text-[#66736C]">
              {documents.length} Manuals
            </span>
          </div>

          <div className="space-y-3">
            {documents.map((doc) => (
              <DocumentCard
                key={doc.id}
                document={doc}
                onSelectChunk={(chunk) => {
                  setQuery(chunk.sectionTitle);
                  executeSearch(chunk.sectionTitle);
                }}
              />
            ))}
          </div>

          {/* AI Geo Agent Preparation Card */}
          <div className="bg-white border border-[#DCE3DD] rounded-3xl p-5 shadow-xs space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-purple-700 uppercase tracking-wider font-mono">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>AI Geo Agent Readiness</span>
            </div>
            <p className="text-xs text-[#17211D] leading-relaxed">
              Guideline chunks and verification checklists are formatted for autonomous tool invocation by the AI Geo Agent (Prompt 7):
            </p>
            <ul className="text-[11px] text-[#66736C] space-y-1 font-mono list-disc pl-4">
              <li>`getRelevantGuidelines(context)`</li>
              <li>`getVerificationChecklist(context)`</li>
              <li>`getGuidelineEvidenceTrail(context)`</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 6. VERIFICATION CHECKLIST MODAL */}
      {activeChecklist && (
        <VerificationChecklistModal
          checklist={activeChecklist}
          onClose={() => setActiveChecklist(null)}
        />
      )}
    </div>
  );
};
