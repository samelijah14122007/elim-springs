import React, { useState } from 'react';
import { Sidebar, NavItemKey } from './components/layout/Sidebar';
import { TopHeader } from './components/layout/TopHeader';
import {
  mockCatchments,
  mockStructures,
  mockGeoImages,
  mockIvrReports,
  mockCases,
  mockChangeDetection,
  mockReportCards,
  mockStreams,
  mockAlerts,
} from './data/mockData';
import {
  WatershedCatchment,
  WatershedStructure,
  GeoCodedImage,
  IvrVoiceReport,
  WatershedCase,
  LanguageCode,
  CaseStatus,
  CaseVerificationOutcome,
  CaseFieldVerification,
} from './types';
import { LandingView } from './views/LandingView';
import { DashboardView } from './views/DashboardView';
import { GisMapView } from './views/GisMapView';
import { GeoImagesView } from './views/GeoImagesView';
import { IvrReportsView } from './views/IvrReportsView';
import { SatelliteView } from './views/SatelliteView';
import { AgentView } from './views/AgentView';
import { RagKnowledgeView } from './views/RagKnowledgeView';
import { EvidenceCasesView } from './views/EvidenceCasesView';
import { ReportsView } from './views/ReportsView';
import { WaterBodyIntelligenceView } from './views/WaterBodyIntelligenceView';
import { PhotoInspectorModal } from './components/geoimages/PhotoInspectorModal';
import { PhotoUploadModal } from './components/geoimages/PhotoUploadModal';
import { evidenceService } from './services/evidenceService';
import { supabaseService } from './services/supabaseService';
import { LanguageProvider, useLanguage } from './i18n';
import { ThemeProvider } from './contexts/ThemeContext';
import { LoginView } from './views/LoginView';
import { SihDemoController, SIH_DEMO_STEPS } from './components/demo/SihDemoController';
import { WorkflowRibbon } from './components/layout/WorkflowRibbon';

function AppContent() {
  const [activeTab, setActiveTab] = useState<NavItemKey>('landing');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [catchments] = useState<WatershedCatchment[]>(mockCatchments);
  const [selectedCatchment, setSelectedCatchment] = useState<WatershedCatchment>(mockCatchments[0]);

  // SIH 2026 Live Demo Mode State
  const [isDemoModeActive, setIsDemoModeActive] = useState(false);
  const [currentDemoStep, setCurrentDemoStep] = useState(0);

  const [structures, setStructures] = useState<WatershedStructure[]>(mockStructures);
  const [geoImages, setGeoImages] = useState<GeoCodedImage[]>(mockGeoImages);
  const [ivrReports, setIvrReports] = useState<IvrVoiceReport[]>(mockIvrReports);
  const [cases, setCases] = useState<WatershedCase[]>(mockCases);
  const [changeDetection] = useState(mockChangeDetection);
  const [reportCards] = useState(mockReportCards);

  const { language: activeLanguage, setLanguage: setActiveLanguage } = useLanguage();
  const [userRole, setUserRole] = useState('Junior Engineer (WDT)');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ email: string; role: string; name: string } | null>(null);

  // Modal states
  const [inspectingImage, setInspectingImage] = useState<GeoCodedImage | null>(null);
  const [showPhotoUploadModal, setShowPhotoUploadModal] = useState(false);

  // Restore custom uploaded images and voice reports from localStorage on mount
  React.useEffect(() => {
    try {
      const storedImages = localStorage.getItem('elim_springs_custom_images');
      if (storedImages) {
        const parsed = JSON.parse(storedImages);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setGeoImages((prev) => {
            const ids = new Set(prev.map((img) => img.id));
            const newOnes = parsed.filter((img: GeoCodedImage) => !ids.has(img.id));
            return [...newOnes, ...prev];
          });
        }
      }

      const storedReports = localStorage.getItem('elim_springs_custom_reports');
      if (storedReports) {
        const parsed = JSON.parse(storedReports);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setIvrReports((prev) => {
            const ids = new Set(prev.map((r) => r.id));
            const newOnes = parsed.filter((r: IvrVoiceReport) => !ids.has(r.id));
            return [...newOnes, ...prev];
          });
        }
      }
    } catch (e) {
      console.warn('[Persistence] Error restoring custom records:', e);
    }
  }, []);

  // SIH Demo Guide Handlers
  const handleStartDemo = () => {
    setIsDemoModeActive(true);
    setCurrentDemoStep(0);
    setSelectedCatchment(mockCatchments[0]); // Upper Sina - Ter Micro-Watershed (Dharashiv, Maharashtra)
    setActiveTab(SIH_DEMO_STEPS[0].tab); // ivr
  };

  const handleSelectDemoStep = (stepIdx: number) => {
    setCurrentDemoStep(stepIdx);
    const step = SIH_DEMO_STEPS[stepIdx];
    if (step) {
      setSelectedCatchment(mockCatchments[0]);
      setActiveTab(step.tab);
    }
  };

  const handleExitDemo = () => {
    setIsDemoModeActive(false);
  };

  // Handlers
  const handleAddImage = (newImage: GeoCodedImage) => {
    setGeoImages((prev) => {
      const updated = [newImage, ...prev];
      try {
        const stored = localStorage.getItem('elim_springs_custom_images');
        const list = stored ? JSON.parse(stored) : [];
        if (!list.some((img: any) => img.id === newImage.id)) {
          list.unshift(newImage);
          localStorage.setItem('elim_springs_custom_images', JSON.stringify(list));
        }
      } catch (e) {
        console.warn('[Persistence] Image save error:', e);
      }
      return updated;
    });
  };

  const handleAddIvrReport = (newReport: IvrVoiceReport) => {
    setIvrReports((prev) => {
      const updated = [newReport, ...prev];
      try {
        const stored = localStorage.getItem('elim_springs_custom_reports');
        const list = stored ? JSON.parse(stored) : [];
        if (!list.some((r: any) => r.id === newReport.id)) {
          list.unshift(newReport);
          localStorage.setItem('elim_springs_custom_reports', JSON.stringify(list));
        }
      } catch (e) {
        console.warn('[Persistence] Report save error:', e);
      }
      return updated;
    });
  };

  const handleCreateCaseFromIvr = (report: IvrVoiceReport) => {
    const existing = cases.find((c) => c.associatedVoiceId === report.id);
    if (existing) {
      setActiveTab('cases');
      return;
    }

    const newCaseId = `case-es-2026-${Date.now().toString().slice(-4)}`;
    const newCaseNumber = `ES-2026-${Date.now().toString().slice(-4)}`;
    const hash = evidenceService.generateSha256(
      `${newCaseId}:${report.callerPhone}:${report.englishTranslation}`
    );

    const newCase: WatershedCase = {
      id: newCaseId,
      caseNumber: newCaseNumber,
      watershedId: report.watershedId,
      title: `${report.aiExtractedEntities.issueCategory} reported at ${report.callerVillage}`,
      description: report.englishTranslation,
      reportedVia: 'IVR Voice Call',
      status: 'REPORTED',
      priority: report.aiExtractedEntities.severity === 'High' ? 'HIGH' : 'MEDIUM',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      location: {
        village: report.callerVillage,
        lat: selectedCatchment.center[0] + 0.003,
        lng: selectedCatchment.center[1] + 0.003,
      },
      associatedVoiceId: report.id,
      evidenceChain: evidenceService.createAuditTrail(
        'Inbound IVR Voice Call Lodged',
        report.englishTranslation
      ),
      aiRecommendation: {
        summary: `Prioritize de-siltation & physical inspection for ${report.aiExtractedEntities.structureMentioned || 'drainage structure'}.`,
        schemeReference: 'PMKSY-WDC 2.0 Section 6.1 (Social Audit & Verification)',
        estimatedRepairCostInr: 280000,
        expectedWaterRetentionCuM: 14000,
        urgencyIndex: report.aiExtractedEntities.urgencyScore,
      },
      fieldVerification: {
        assignedTo: userRole,
        deadline: '7 days',
        groundTruthConfirmed: false,
        verificationPhotos: [],
        signatures: {
          inspector: userRole,
          sarpanch: 'Gram Panchayat Sarpanch',
        },
      },
    };

    setCases((prev) => [newCase, ...prev]);
    // Update the IVR report status
    setIvrReports((prev) =>
      prev.map((r) => (r.id === report.id ? { ...r, status: 'Converted to Case', caseId: newCaseId } : r))
    );

    // Persist to Supabase cases table
    supabaseService.createCase({
      id: newCaseId,
      case_number: newCaseNumber,
      watershed_id: report.watershedId,
      title: newCase.title,
      description: newCase.description,
      priority: newCase.priority,
      status: 'REPORTED',
    }).catch((err) => console.warn('[Supabase] Case persistence note:', err));

    setActiveTab('cases');
  };

  const handleConfirmVerification = (
    caseId: string,
    notes: string,
    confirmed: boolean,
    outcome: CaseVerificationOutcome = 'VERIFIED CONDITION',
    measurements?: {
      siltDepthM?: number;
      scourLengthM?: number;
      staticWaterLevelM?: number;
      gpsAccuracyM?: number;
    },
    signatures?: { inspector: string; sarpanch: string }
  ) => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id === caseId) {
          const inspector = signatures?.inspector || userRole;
          const sarpanch = signatures?.sarpanch || 'Local Sarpanch / VWC';
          const payloadSummary = `Outcome: ${outcome}. Silt: ${measurements?.siltDepthM ?? 'N/A'}m, Water: ${measurements?.staticWaterLevelM ?? 'N/A'}m. Dual sign-off: ${inspector} & ${sarpanch}. Notes: ${notes.slice(0, 100)}`;

          const updatedChain = evidenceService.appendAuditStep(
            c.evidenceChain,
            `${inspector} & ${sarpanch}`,
            `Field Ground Verification (${outcome})`,
            payloadSummary,
            'FIELD_VERIFICATION',
            'Field Ground Truth Verification App'
          );

          const existingVerification: CaseFieldVerification = c.fieldVerification || {
            assignedTo: inspector,
            deadline: '7 days',
            groundTruthConfirmed: false,
            verificationPhotos: [],
            signatures: {
              inspector,
              sarpanch,
            },
          };

          const updatedVerification: CaseFieldVerification = {
            ...existingVerification,
            groundTruthConfirmed: confirmed,
            inspectorNotes: notes,
            verifiedAt: new Date().toISOString(),
            observedCondition: outcome,
            measurements: measurements
              ? {
                  siltDepthM: measurements.siltDepthM,
                  scourLengthM: measurements.scourLengthM,
                  waterLevelM: measurements.staticWaterLevelM,
                  gpsAccuracyM: measurements.gpsAccuracyM,
                }
              : undefined,
            signatures: {
              inspector,
              sarpanch,
              inspectorSignedAt: new Date().toISOString(),
              sarpanchSignedAt: new Date().toISOString(),
            },
          };

          return {
            ...c,
            status: 'ENGINEER_APPROVED',
            fieldVerification: updatedVerification,
            evidenceChain: updatedChain,
          };
        }
        return c;
      })
    );
  };

  const handleCreateCase = (newCase: WatershedCase) => {
    setCases((prev) => [newCase, ...prev]);
  };

  const handleUpdateCaseStatus = (caseId: string, newStatus: CaseStatus) => {
    setCases((prev) =>
      prev.map((c) => (c.id === caseId ? { ...c, status: newStatus } : c))
    );
  };

  const alertCounts = {
    criticalCases: cases.filter((c) => c.priority === 'CRITICAL').length,
    unverifiedImages: geoImages.filter((img) => !img.caseId).length,
    pendingCalls: ivrReports.filter((c) => c.status === 'Transcribed').length,
  };

  if (activeTab === 'login') {
    return (
      <LoginView
        onLoginSuccess={(user) => {
          setIsLoggedIn(true);
          setCurrentUser(user);
          setUserRole(user.role);
          setActiveTab('dashboard');
        }}
        onBackToLanding={() => setActiveTab('landing')}
      />
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F7F8F4] font-sans text-[#17211D]">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        alertCounts={alertCounts}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header */}
        <TopHeader
          catchments={catchments}
          selectedCatchment={selectedCatchment}
          onSelectCatchment={(c) => setSelectedCatchment(c)}
          activeLanguage={activeLanguage}
          onChangeLanguage={(l) => setActiveLanguage(l)}
          userRole={userRole}
          onChangeUserRole={(r) => setUserRole(r)}
          onQuickReportPhoto={() => setShowPhotoUploadModal(true)}
          onQuickSimulateIvr={() => setActiveTab('ivr')}
          onOpenAgent={() => setActiveTab('agent')}
          onOpenLogin={() => setActiveTab('login')}
          isLoggedIn={isLoggedIn}
          currentUser={currentUser}
          onLogout={() => {
            setIsLoggedIn(false);
            setCurrentUser(null);
            setActiveTab('landing');
          }}
        />

        {/* Persistent Workflow Continuum Ribbon (Requirement 3) */}
        <WorkflowRibbon
          activeTab={activeTab}
          onNavigateStage={(tab) => setActiveTab(tab)}
          isDemoModeActive={isDemoModeActive}
        />

        {/* Scrollable Viewport */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 pt-4 min-h-0">
          <div className="max-w-7xl mx-auto w-full">
            {/* SIH 2026 Interactive Demo Step Controller (Requirement 2 & 4) */}
            {isDemoModeActive && (
              <SihDemoController
                currentStepIndex={currentDemoStep}
                onSelectStep={handleSelectDemoStep}
                onExitDemo={handleExitDemo}
                onOpenEvidenceChainModal={() => setActiveTab('cases')}
              />
            )}

            {activeTab === 'landing' && (
              <LandingView
                onEnterPortal={(tab) => setActiveTab(tab)}
                onSelectRole={(role) => setUserRole(role)}
                onStartDemo={handleStartDemo}
                onOpenLogin={() => setActiveTab('login')}
              />
            )}

            {activeTab === 'dashboard' && (
              <DashboardView
                catchment={selectedCatchment}
                catchments={catchments}
                onSelectCatchment={(c) => setSelectedCatchment(c)}
                structures={structures}
                images={geoImages}
                ivrReports={ivrReports}
                cases={cases}
                onNavigate={(tab) => setActiveTab(tab)}
                onInspectImage={(img) => setInspectingImage(img)}
                onInspectCase={() => setActiveTab('cases')}
                onStartDemo={handleStartDemo}
              />
            )}

            {activeTab === 'gis' && (
              <GisMapView
                catchment={selectedCatchment}
                catchments={catchments}
                onSelectCatchment={(c) => setSelectedCatchment(c)}
                structures={structures}
                geoImages={geoImages}
                streams={mockStreams}
                alerts={mockAlerts}
                voiceReports={ivrReports}
                onOpenInAgent={() => setActiveTab('agent')}
                onOpenImage={(img) => setInspectingImage(img)}
                onSelectTab={(tab) => setActiveTab(tab as any)}
              />
            )}

            {activeTab === 'water' && (
              <WaterBodyIntelligenceView
                catchment={selectedCatchment}
                catchments={catchments}
                onSelectCatchment={(c) => setSelectedCatchment(c)}
                onNavigateToGis={(structureId) => {
                  setActiveTab('gis');
                }}
                onNavigateToSatellite={() => setActiveTab('satellite')}
              />
            )}

            {activeTab === 'images' && (
              <GeoImagesView
                watershedId={selectedCatchment.id}
                catchment={selectedCatchment}
                catchments={catchments}
                onSelectCatchment={(c) => setSelectedCatchment(c)}
                images={geoImages}
                structures={structures}
                onAddImage={handleAddImage}
                onOpenCase={() => setActiveTab('cases')}
                onNavigateToGis={() => setActiveTab('gis')}
              />
            )}

            {activeTab === 'ivr' && (
              <IvrReportsView
                watershedId={selectedCatchment.id}
                catchment={selectedCatchment}
                catchments={catchments}
                onSelectCatchment={(c) => setSelectedCatchment(c)}
                reports={ivrReports}
                structures={structures}
                geoImages={geoImages}
                onAddReport={handleAddIvrReport}
                onCreateCaseFromReport={handleCreateCaseFromIvr}
                onNavigateToGis={() => setActiveTab('gis')}
                onInspectImage={(img) => setInspectingImage(img)}
              />
            )}

            {activeTab === 'satellite' && (
              <SatelliteView
                watershedId={selectedCatchment.id}
                catchment={selectedCatchment}
                catchments={catchments}
                onSelectCatchment={(c) => setSelectedCatchment(c)}
                changeDetection={changeDetection}
                onNavigateToGis={() => setActiveTab('gis')}
                onNavigateToImages={() => setActiveTab('images')}
                onCreateCase={handleCreateCase}
                onNavigateToCases={() => setActiveTab('cases')}
              />
            )}

            {activeTab === 'agent' && (
              <AgentView
                catchment={selectedCatchment}
                structures={structures}
                cases={cases}
                onNavigateToGis={() => setActiveTab('gis')}
                onNavigateToSatellite={() => setActiveTab('satellite')}
                onNavigateToImages={() => setActiveTab('images')}
                onNavigateToIvr={() => setActiveTab('ivr')}
                onNavigateToRag={() => setActiveTab('rag')}
                onNavigateToCases={() => setActiveTab('cases')}
              />
            )}

            {activeTab === 'rag' && (
              <RagKnowledgeView
                onNavigateToGis={() => setActiveTab('gis')}
                onNavigateToImages={() => setActiveTab('images')}
                onNavigateToIvr={() => setActiveTab('ivr')}
              />
            )}

            {(activeTab === 'cases' || activeTab === 'fieldVerification') && (
              <EvidenceCasesView
                cases={cases}
                initialShowVerification={activeTab === 'fieldVerification'}
                onUpdateCaseStatus={handleUpdateCaseStatus}
                onConfirmVerification={handleConfirmVerification}
                onCreateCase={handleCreateCase}
                onNavigateToGis={() => setActiveTab('gis')}
                onNavigateToSatellite={() => setActiveTab('satellite')}
                onNavigateToImages={() => setActiveTab('images')}
                onNavigateToIvr={() => setActiveTab('ivr')}
                onNavigateToRag={() => setActiveTab('rag')}
                onNavigateToAgent={() => setActiveTab('agent')}
                onNavigateToReports={() => setActiveTab('reports')}
              />
            )}

            {activeTab === 'reports' && (
              <ReportsView
                reportCards={reportCards}
                catchment={selectedCatchment}
                structures={structures}
                cases={cases}
                images={geoImages}
                ivrReports={ivrReports}
              />
            )}
          </div>
        </main>
      </div>

      {/* Global Modals */}
      {inspectingImage && (
        <PhotoInspectorModal
          image={inspectingImage}
          structures={structures}
          onClose={() => setInspectingImage(null)}
          onOpenCase={() => {
            setInspectingImage(null);
            setActiveTab('cases');
          }}
          onViewOnMap={() => {
            setInspectingImage(null);
            setActiveTab('gis');
          }}
        />
      )}

      {showPhotoUploadModal && (
        <PhotoUploadModal
          watershedId={selectedCatchment.id}
          onClose={() => setShowPhotoUploadModal(false)}
          onAddImage={(newImg) => {
            handleAddImage(newImg);
            setInspectingImage(newImg);
          }}
        />
      )}
    </div>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;

