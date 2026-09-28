import React, { useState } from 'react';
import { RagKnowledgeDocument, RagKnowledgeChunk } from '../../types';
import {
  BookOpen,
  Building,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  FileText,
  ShieldCheck,
} from 'lucide-react';

interface DocumentCardProps {
  document: RagKnowledgeDocument;
  onSelectChunk?: (chunk: RagKnowledgeChunk) => void;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  onSelectChunk,
}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white border border-[#DCE3DD] rounded-3xl p-5 shadow-xs space-y-3 transition-all hover:border-[#075B45]/40">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-bold">
              {document.documentType}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F0F3EE] text-[#17211D] border border-[#DCE3DD] font-semibold">
              {document.year}
            </span>
            <span className="text-[10px] font-mono text-[#075B45] bg-[#075B45]/10 px-2 py-0.5 rounded border border-[#075B45]/20 font-semibold">
              {document.sourceStatus}
            </span>
          </div>
          <h4 className="font-bold text-sm text-[#17211D] leading-snug">
            {document.title}
          </h4>
        </div>
        <div className="p-2.5 rounded-2xl bg-[#F7F8F4] border border-[#DCE3DD] text-[#8A6A3F] shrink-0">
          <BookOpen className="w-4 h-4" />
        </div>
      </div>

      {/* Issuing Ministry & Topic */}
      <div className="text-xs text-[#66736C] space-y-1 pt-1 border-t border-[#DCE3DD]">
        <div className="flex items-center gap-1.5 truncate">
          <Building className="w-3.5 h-3.5 text-[#66736C] shrink-0" />
          <span className="truncate">{document.issuingMinistry}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[#17211D]">
          <Layers className="w-3.5 h-3.5 text-[#8A6A3F] shrink-0" />
          <span className="font-semibold text-[11px] text-[#8A6A3F]">Topic: {document.topic}</span>
        </div>
      </div>

      {/* Expandable Chunks Preview */}
      <div className="pt-2 border-t border-[#DCE3DD]">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between text-xs text-[#075B45] hover:underline font-semibold py-1 transition-colors cursor-pointer"
        >
          <span>
            {document.chunks.length} Technical Clauses Indexed
          </span>
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {expanded && (
          <div className="space-y-2 mt-2 pt-2 border-t border-[#DCE3DD]">
            {document.chunks.map((chunk) => (
              <div
                key={chunk.chunkId}
                onClick={() => onSelectChunk?.(chunk)}
                className="p-3 rounded-xl bg-[#F7F8F4] border border-[#DCE3DD] hover:border-[#075B45]/50 cursor-pointer space-y-1.5 transition-all text-xs"
              >
                <div className="flex items-center justify-between text-[10px] font-mono text-[#66736C]">
                  <span className="text-[#8A6A3F] font-bold">{chunk.clauseNumber || 'Clause'}</span>
                  <span>{chunk.page}</span>
                </div>
                <div className="font-bold text-[#17211D] text-[11px]">
                  {chunk.sectionTitle}
                </div>
                <p className="text-[#66736C] text-[11px] line-clamp-2 italic">
                  "{chunk.prototypeSummary}"
                </p>
                <div className="text-[10px] text-[#075B45] font-mono flex items-center gap-1 font-semibold">
                  <CheckCircle2 className="w-3 h-3 text-[#075B45] shrink-0" />
                  <span>{chunk.keyNorms[0]}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
