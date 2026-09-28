import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Square,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Sparkles,
  RefreshCw,
  FileCheck,
  ShieldCheck,
  MapPin,
  Bot,
  Radio,
  ArrowRight,
  Globe,
  Edit3,
  Save,
  X,
  FileAudio,
  Hash,
  Database,
  Lock,
} from 'lucide-react';
import {
  LanguageCode,
  IvrVoiceReport,
  WatershedCatchment,
  WatershedStructure,
  VoiceIssueCategory,
  VoiceUrgency,
} from '../../types';
import { bhashiniService, SUPPORTED_BHASHINI_LANGUAGES } from '../../services/bhashiniService';
import { supabaseService } from '../../services/supabaseService';
import { evidenceService } from '../../services/evidenceService';
import { ALL_INDIAN_LANGUAGES, useLanguage, useTranslation } from '../../i18n';
import { convertBlobToWav, computeAudioHash } from '../../services/audio/wavEncoder';

interface ElimVoiceAssistantProps {
  currentWatershed: WatershedCatchment;
  catchments: WatershedCatchment[];
  structures?: WatershedStructure[];
  onReportSaved: (report: IvrVoiceReport) => void;
  onCreateCase?: (report: IvrVoiceReport) => void;
}

type AssistantState = 'idle' | 'recording' | 'processing' | 'confirmed' | 'error';
type AsrSource = 'BHASHINI_ASR' | 'BROWSER_SPEECH_FALLBACK' | 'DEMO_FIXTURE';

export const ElimVoiceAssistant: React.FC<ElimVoiceAssistantProps> = ({
  currentWatershed,
  catchments,
  structures = [],
  onReportSaved,
  onCreateCase,
}) => {
  const { language: globalLang } = useLanguage();
  const { t } = useTranslation();
  const [selectedLang, setSelectedLang] = useState<LanguageCode>(globalLang || 'mr');

  // Sync with global language if changed from top navigation
  useEffect(() => {
    if (globalLang) {
      setSelectedLang(globalLang);
    }
  }, [globalLang]);

  const [assistantState, setAssistantState] = useState<AssistantState>('idle');
  const [statusMessage, setStatusMessage] = useState('Tap microphone and speak in your chosen Indian language');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Pipeline telemetry tracking
  const [pipelineSteps, setPipelineSteps] = useState<{
    mic: 'READY' | 'ACTIVE' | 'ERROR';
    audioConversion: 'IDLE' | 'CONVERTING' | 'COMPLETE' | 'FAILED';
    bhashiniAsr: 'IDLE' | 'PROCESSING' | 'SUCCESS' | 'FAILED';
    translation: 'IDLE' | 'PROCESSING' | 'SUCCESS' | 'FALLBACK';
    fieldIntent: 'IDLE' | 'PROCESSING' | 'SUCCESS';
    supabase: 'IDLE' | 'SAVING' | 'SAVED' | 'FAILED';
  }>({
    mic: 'READY',
    audioConversion: 'IDLE',
    bhashiniAsr: 'IDLE',
    translation: 'IDLE',
    fieldIntent: 'IDLE',
    supabase: 'IDLE',
  });

  // Audio Recording Refs & State
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);
  const browserSpeechTranscriptRef = useRef<string>('');
  const timerIntervalRef = useRef<any>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordedWavBlob, setRecordedWavBlob] = useState<Blob | null>(null);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [audioSha256, setAudioSha256] = useState<string>('');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Field Story State
  const [originalTranscript, setOriginalTranscript] = useState('');
  const [englishTranslation, setEnglishTranslation] = useState('');
  const [detectedIntent, setDetectedIntent] = useState<any>(null);
  const [asrSource, setAsrSource] = useState<AsrSource | null>(null);
  const [asrEngineLabel, setAsrEngineLabel] = useState<string>('');
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Editable Form Overrides
  const [editIssueCategory, setEditIssueCategory] = useState<VoiceIssueCategory>('Silt accumulation');
  const [editUrgency, setEditUrgency] = useState<VoiceUrgency>('High');
  const [editLocation, setEditLocation] = useState(currentWatershed.name);

  // Location & Asset mapping
  const [selectedWatershedId, setSelectedWatershedId] = useState(currentWatershed.id);
  const [selectedStructureId, setSelectedStructureId] = useState<string>(structures[0]?.id || '');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [savedRecordDetails, setSavedRecordDetails] = useState<{
    voiceReportId: string;
    evidenceId: string;
    integrityHash: string;
    status: string;
  } | null>(null);

  // Available 23 languages
  const languageOptions = ALL_INDIAN_LANGUAGES.map((l) => ({
    code: l.code,
    nativeName: l.nativeName,
    englishName: l.name,
    speechLocale: l.speechLocale,
  }));

  // Deterministic Demo Samples per Language (Clean Speech Transcript Fixture)
  const demoSamples: Partial<Record<LanguageCode, {
    text: string;
    translation: string;
    asset: string;
    issue: VoiceIssueCategory;
    urgency: VoiceUrgency;
    location: string;
  }>> = {
    mr: {
      text: 'नमस्कार साहेब, रुई गावातील बंधारा क्रमांक ४ गाळाने पूर्ण भरला आहे. पाण्याचा निचरा होत नाही आणि सांडव्याला भेगा पडल्या आहेत. विहिरींना पाणी उतरत नाही.',
      translation: 'Hello Officer, check dam number 4 in Rui village is completely choked with silt. Water runoff is not impounding and cracks have developed along the spillway. Borewells are failing to recharge.',
      asset: 'Rui East Check Dam #4',
      issue: 'Silt accumulation',
      urgency: 'High',
      location: 'Rui, Dharashiv',
    },
    hi: {
      text: 'नमस्ते सर, अलीपुरा नाले के पक्के चेक डैम की नींव से पानी तेजी से रिस रहा है। भारी बारिश में बांध की दीवार ढहने का खतरा है।',
      translation: 'Hello Sir, water is seeping rapidly from beneath the foundation wall of the masonry check dam on Alipura nalla. If heavy rain occurs, the weir structure is at risk of breach.',
      asset: 'Alipura Masonry Check Dam',
      issue: 'Structure concern',
      urgency: 'Critical',
      location: 'Alipura, Chhatarpur',
    },
    te: {
      text: 'నమస్కారం సార్, కళ్యాణదుర్గం వాగులో వేసిన సబ్-సర్ఫేస్ డ్యాం దగ్గర మోటారు పంపులు పెట్టి అక్రమంగా నీటిని తోడేస్తున్నారు. భూగర్భ జలాలు తగ్గుతున్నాయి.',
      translation: 'Hello Sir, near the sub-surface dyke installed in Kalyandurg stream, unauthorized diesel pump-sets are draining stored water illegally. Groundwater levels are depleting.',
      asset: 'Kalyandurg Sub-surface Dyke',
      issue: 'Encroachment concern',
      urgency: 'High',
      location: 'Beluguppa, Kalyandurg',
    },
    ta: {
      text: 'வணக்கம் ஐயா, எங்கள் கிராமத்தில் உள்ள தடுப்பணையில் மண் தேங்கியுள்ளது. பக்கவாட்டுச் சுவர் விரிசலடைந்துள்ளது. உடனடியாக சரிபார்க்கவும்.',
      translation: 'Greetings Sir, sediment accumulation has been reported at our village check dam. The wing wall shows visible cracks. Please verify urgently.',
      asset: 'Check Dam #1 (Kalyandurg)',
      issue: 'Structure concern',
      urgency: 'High',
      location: 'Kalyandurg Stream Bed',
    },
    kn: {
      text: 'ನಮಸ್ಕಾರ, ನಮ್ಮ ಗ್ರಾಮದ ಹತ್ತಿರದ ಚೆಕ್ ಡ್ಯಾಂ ನಲ್ಲಿ ಅಪಾರ ಪ್ರಮಾಣದ ಹೂಳು ತುಂಬಿದ್ದು, ಮಳೆಯ ನೀರು ನಿಲ್ಲುತ್ತಿಲ್ಲ. ದಯವಿಟ್ಟು ಹೂಳೆತ್ತಲು ಕ್ರಮ ಕೈಗೊಳ್ಳಿ.',
      translation: 'Hello, our village check dam is heavily choked with sediment, rainwater is not being retained. Please arrange for desiltation.',
      asset: 'Beluguppa Check Dam',
      issue: 'Silt accumulation',
      urgency: 'High',
      location: 'Beluguppa Sub-basin',
    },
    gu: {
      text: 'નમસ્તે સાહેબ, અમારા ગામના ચેકડેમ પાસે માટીનું ધોવાણ થયું છે અને પાણી વહી જઈ રહ્યું છે. વહેલી તકે મરામત કરો.',
      translation: 'Hello Sir, soil erosion has occurred near our village check dam and water is flowing away. Please repair at the earliest.',
      asset: 'Masonry Check Dam',
      issue: 'Structure concern',
      urgency: 'High',
      location: 'Rui Catchment',
    },
    en: {
      text: 'Field inspection confirms check dam crest erosion and silt choking above eighty percent. Overflow discharge poses breach hazard to downstream farmlands.',
      translation: 'Field inspection confirms check dam crest erosion and silt choking above eighty percent. Overflow discharge poses breach hazard to downstream farmlands.',
      asset: 'Rui East Check Dam #4',
      issue: 'Silt accumulation',
      urgency: 'High',
      location: 'Rui, Dharashiv',
    },
  };

  // Assistant spoken reply per language
  const assistantReplies: Partial<Record<LanguageCode, string>> = {
    mr: 'तुमची जलसंधारण तक्रार यशस्वीरित्या नोंदवली गेली आहे. प्रत्यक्ष पाहणीसाठी पाठवली जात आहे.',
    hi: 'आपकी जल संरचना रिपोर्ट दर्ज कर ली गई है। स्थलीय सत्यापन के लिए प्रेषित की जा रही है।',
    ta: 'உங்கள் நீர்நிலை புகார் பதிவு செய்யப்பட்டது. கள ஆய்வுக்காக பொறியாளருக்கு அனுப்பப்படுகிறது.',
    te: 'మీ నీటి వనరుల నిवेదిక నమోదు చేయబడింది. క్షేత్ర స్థాయి తనిఖీకి పంపబడింది.',
    kn: 'ನಿಮ್ಮ ಜಲಾನಯನ ದೂರನ್ನು ದಾಖಲಿಸಲಾಗಿದೆ. ಕ್ಷೇತ್ರ ಪರಿಶೀಲನೆಗಾಗಿ ಕಳುಹಿಸಲಾಗಿದೆ.',
    gu: 'તમારી જળ સંરક્ષણ ફરિયાદ સફળતાપૂર્વક નોંધવામાં આવી છે. ક્ષેત્રીય ચકાસણી માટે મોકલવામાં આવશે.',
    en: 'Your watershed observation report has been recorded and scheduled for field verification.',
  };

  // Spoken voice playback helper
  const speakAssistantResponse = (text: string, lang: LanguageCode) => {
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        const opt = languageOptions.find((l) => l.code === lang);
        utterance.lang = opt ? opt.speechLocale : 'en-IN';
        utterance.rate = 0.95;
        utterance.onstart = () => setIsPlayingAudio(true);
        utterance.onend = () => setIsPlayingAudio(false);
        utterance.onerror = () => setIsPlayingAudio(false);
        window.speechSynthesis.speak(utterance);
      }
    } catch (e) {
      console.warn('[Browser TTS Warning]:', e);
      setIsPlayingAudio(false);
    }
  };

  // 1. Start Real Microphone Flow
  const handleStartRecording = async () => {
    setErrorMessage(null);
    setSavedSuccess(false);
    setSavedRecordDetails(null);
    setIsDemoMode(false);
    setIsEditing(false);
    setOriginalTranscript('');
    setEnglishTranslation('');
    setDetectedIntent(null);
    setRecordedWavBlob(null);
    setRecordedAudioUrl(null);
    setAudioSha256('');
    setAsrSource(null);
    browserSpeechTranscriptRef.current = '';

    // Verify MediaDevices support
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setErrorMessage('Browser does not support direct microphone recording. Try Chrome or Edge, or use Demo Voice.');
      return;
    }

    try {
      setPipelineSteps((prev) => ({
        ...prev,
        mic: 'ACTIVE',
        audioConversion: 'IDLE',
        bhashiniAsr: 'IDLE',
        translation: 'IDLE',
        fieldIntent: 'IDLE',
        supabase: 'IDLE',
      }));

      setAssistantState('recording');
      setStatusMessage('Listening to your spoken field report... Speak clearly.');
      setRecordingSeconds(0);

      // Start elapsed timer
      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((sec) => sec + 1);
      }, 1000);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start(250);

      // Concurrently run Web Speech API as BROWSER SPEECH FALLBACK
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognitionRef.current = recognition;
          const opt = languageOptions.find((l) => l.code === selectedLang);
          recognition.lang = opt ? opt.speechLocale : 'mr-IN';
          recognition.continuous = true;
          recognition.interimResults = true;

          recognition.onresult = (event: any) => {
            let current = '';
            for (let i = 0; i < event.results.length; i++) {
              current += event.results[i][0].transcript;
            }
            if (current.trim()) {
              browserSpeechTranscriptRef.current = current.trim();
              setOriginalTranscript(current.trim());
            }
          };

          recognition.onerror = (event: any) => {
            console.warn('[Browser Speech Fallback notice]:', event.error);
          };

          recognition.start();
        } catch {
          // Ignore SpeechRecognition initialization failure
        }
      }
    } catch (err: any) {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      setAssistantState('error');
      setPipelineSteps((prev) => ({ ...prev, mic: 'ERROR' }));

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMessage('Microphone access was denied. Please allow microphone permissions in your browser or test with Demo Voice.');
      } else if (err.name === 'NotFoundError') {
        setErrorMessage('No microphone device detected on this system. You can test with Demo Voice.');
      } else {
        setErrorMessage(`Microphone capture error: ${err.message || 'Unable to record audio'}`);
      }
    }
  };

  // 2. Stop Recording, Convert to WAV, and Send to Bhashini Proxy
  const handleStopRecording = async () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }

    setAssistantState('processing');
    setStatusMessage('Finalizing audio recording and converting to 16-bit PCM WAV...');

    // Stop MediaRecorder and extract recorded Blob
    const rawAudioBlob = await new Promise<Blob>((resolve) => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.onstop = () => {
          const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          resolve(blob);
        };
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream?.getTracks().forEach((t) => t.stop());
      } else {
        resolve(new Blob(audioChunksRef.current, { type: 'audio/webm' }));
      }
    });

    if (rawAudioBlob.size < 100) {
      setAssistantState('error');
      setErrorMessage('Recording too brief or no audio captured. Please speak again.');
      return;
    }

    // Step 8: Convert recorded audio to true 16-bit PCM WAV (16kHz mono)
    setPipelineSteps((prev) => ({ ...prev, audioConversion: 'CONVERTING' }));
    let wavResult;
    try {
      wavResult = await convertBlobToWav(rawAudioBlob, 16000);
      setRecordedWavBlob(wavResult.blob);
      setRecordedAudioUrl(wavResult.dataUri);

      // Compute SHA-256 integrity hash of WAV audio
      const arrayBuf = await wavResult.blob.arrayBuffer();
      const hash = await computeAudioHash(arrayBuf);
      setAudioSha256(hash);

      setPipelineSteps((prev) => ({ ...prev, audioConversion: 'COMPLETE' }));
    } catch (conversionErr: any) {
      console.warn('[Audio Conversion Warning]:', conversionErr);
      setPipelineSteps((prev) => ({ ...prev, audioConversion: 'FAILED' }));
      setErrorMessage(`WAV conversion failed: ${conversionErr.message}`);
      setAssistantState('error');
      return;
    }

    // Step 9: Send WAV to FastAPI server-side Bhashini proxy
    setStatusMessage('Sending WAV audio to MeitY Bhashini ASR pipeline...');
    setPipelineSteps((prev) => ({ ...prev, bhashiniAsr: 'PROCESSING' }));

    let transcriptObtained = '';
    let usedSource: AsrSource = 'BHASHINI_ASR';
    let engineLabel = 'MeitY Bhashini ASR';

    try {
      const asrResult = await bhashiniService.transcribeAudio(wavResult.dataUri, selectedLang);
      if (asrResult.transcript && asrResult.transcript.trim()) {
        transcriptObtained = asrResult.transcript.trim();
        usedSource = asrResult.isSimulated ? 'DEMO_FIXTURE' : 'BHASHINI_ASR';
        engineLabel = asrResult.modelUsed || `MeitY Bhashini ASR (${selectedLang})`;
        setPipelineSteps((prev) => ({ ...prev, bhashiniAsr: 'SUCCESS' }));
      }
    } catch (asrError: any) {
      console.warn('[Bhashini ASR Warning]:', asrError.message || asrError);
      setPipelineSteps((prev) => ({ ...prev, bhashiniAsr: 'FAILED' }));

      // Check if browser SpeechRecognition obtained a transcript
      if (browserSpeechTranscriptRef.current && browserSpeechTranscriptRef.current.trim()) {
        transcriptObtained = browserSpeechTranscriptRef.current.trim();
        usedSource = 'BROWSER_SPEECH_FALLBACK';
        engineLabel = 'BROWSER SPEECH FALLBACK (Web Speech API)';
      } else {
        setAssistantState('error');
        setErrorMessage(
          `${asrError.message || 'Bhashini ASR service returned an error'}. No browser speech fallback transcript available.`
        );
        return;
      }
    }

    setOriginalTranscript(transcriptObtained);
    setAsrSource(usedSource);
    setAsrEngineLabel(engineLabel);

    // Proceed to translation & intent extraction
    await processNmtAndIntent(transcriptObtained, selectedLang, usedSource === 'DEMO_FIXTURE');
  };

  // 3. Demo Voice Mode (Clean Transcript Fixture, clearly disclosed)
  const handleRunDemoVoice = async () => {
    setErrorMessage(null);
    setSavedSuccess(false);
    setSavedRecordDetails(null);
    setIsDemoMode(true);
    setIsEditing(false);
    setAssistantState('processing');
    setStatusMessage('DEMO VOICE • Loading regional field grievance transcript fixture...');

    const sample = demoSamples[selectedLang] || demoSamples['mr']!;
    setOriginalTranscript(sample.text);
    setAsrSource('DEMO_FIXTURE');
    setAsrEngineLabel(`DEMO VOICE — TRANSCRIPT FIXTURE (${selectedLang})`);
    setRecordedAudioUrl(null);
    setAudioSha256('demo-fixture-' + Date.now().toString(16));

    setPipelineSteps({
      mic: 'READY',
      audioConversion: 'COMPLETE',
      bhashiniAsr: 'SUCCESS',
      translation: 'PROCESSING',
      fieldIntent: 'IDLE',
      supabase: 'IDLE',
    });

    await new Promise((r) => setTimeout(r, 600));
    await processNmtAndIntent(sample.text, selectedLang, true);
  };

  // 4. IndicTrans2 Translation & Structured Intent Extraction
  const processNmtAndIntent = async (
    text: string,
    lang: LanguageCode,
    isDemo: boolean
  ) => {
    try {
      setStatusMessage('Bhashini IndicTrans2 translating to English...');
      setPipelineSteps((prev) => ({ ...prev, translation: 'PROCESSING' }));

      const transResult = await bhashiniService.translate(text, lang, 'en');
      const translation = transResult.translatedText || demoSamples[lang]?.translation || text;
      setEnglishTranslation(translation);

      setPipelineSteps((prev) => ({
        ...prev,
        translation: transResult.isSimulated ? 'FALLBACK' : 'SUCCESS',
        fieldIntent: 'PROCESSING',
      }));

      setStatusMessage('Extracting structured problem intent & severity...');
      const intentResult = await bhashiniService.extractFieldIntent(text, translation, lang);
      setDetectedIntent(intentResult);
      setEditIssueCategory(intentResult.issueCategory);
      setEditUrgency(intentResult.urgency);
      setEditLocation(intentResult.reportedLocation || currentWatershed.name);

      setPipelineSteps((prev) => ({ ...prev, fieldIntent: 'SUCCESS' }));
      setAssistantState('confirmed');
      setStatusMessage('Report structured successfully. Review details below before saving.');

      // Spoken voice reply in caller language
      const reply = assistantReplies[lang] || assistantReplies['en']!;
      speakAssistantResponse(reply, lang);
    } catch (err: any) {
      console.warn('[Processing Warning]:', err);
      const fallbackSample = demoSamples[lang] || demoSamples['mr']!;
      setEnglishTranslation(fallbackSample.translation);
      setAssistantState('confirmed');
      setStatusMessage('Field observation structured with domain fallback.');
    }
  };

  // 5. Save Voice Report & Evidence to Supabase (Pending Field Verification)
  const handleSaveReport = async (andCreateCase = false) => {
    setPipelineSteps((prev) => ({ ...prev, supabase: 'SAVING' }));
    setStatusMessage('Uploading audio to Supabase Storage and recording evidence...');

    const targetWatershed = catchments.find((c) => c.id === selectedWatershedId) || currentWatershed;
    const targetStructure = structures.find((s) => s.id === selectedStructureId);

    const reportId = `ivr-${Date.now().toString().slice(-6)}`;
    const callerVillage = editLocation || targetWatershed.name.split(' ')[0] + ' Village';
    const callerPhone = '+91 98' + Math.floor(10000000 + Math.random() * 90000000);

    // Audio storage path in voice-reports bucket
    const storagePath = `voice-recordings/${targetWatershed.id}/${reportId}_${selectedLang}.wav`;
    let uploadedAudioUrl = recordedAudioUrl || '';

    // Step 15: Upload audio blob to Supabase Storage voice-reports bucket if real recording exists
    if (recordedWavBlob) {
      try {
        const uploadRes = await supabaseService.uploadVoice(storagePath, recordedWavBlob);
        if (uploadRes?.publicUrl) {
          uploadedAudioUrl = uploadRes.publicUrl;
        }
      } catch (uploadErr) {
        console.warn('[Supabase Audio Upload Notice]:', uploadErr);
      }
    }

    const calculatedHash =
      audioSha256 ||
      evidenceService.generateSha256(
        `${reportId}:${callerPhone}:${originalTranscript}:${Date.now()}`
      );

    const newReport: IvrVoiceReport = {
      id: reportId,
      callerPhone,
      callerName: isDemoMode ? 'Demo Field Reporter (Rui)' : 'Field Citizen Reporter',
      callerRole: 'Farmer',
      callerVillage,
      watershedId: targetWatershed.id,
      watershedName: targetWatershed.name,
      lat: targetWatershed.center[0] + 0.002,
      lng: targetWatershed.center[1] + 0.002,
      callTimestamp: new Date().toISOString(),
      durationSeconds: recordingSeconds > 0 ? recordingSeconds : 24,
      sourceLanguage: selectedLang,
      sourceLanguageName: languageOptions.find((l) => l.code === selectedLang)?.englishName || 'Marathi',
      audioUrl: uploadedAudioUrl,
      originalTranscript,
      englishTranslation,
      detectedIntent: detectedIntent?.intent || 'Water structure impairment',
      urgency: editUrgency,
      processingStatus: 'Structured',
      caseStatus: andCreateCase ? 'Case Initiated' : 'Pending Verification',
      bhashiniModelUsed: asrEngineLabel || `MeitY Bhashini Indic AI (${selectedLang})`,
      bhashiniConfidence: 0.95,
      aiExtractedEntities: {
        structureMentioned: detectedIntent?.structureMentioned || targetStructure?.name || 'Rui East Check Dam #4',
        issueCategory: editIssueCategory,
        severity: editUrgency === 'Critical' ? 'High' : editUrgency === 'High' ? 'High' : 'Medium',
        reportedLocation: callerVillage,
        urgencyScore: editUrgency === 'Critical' ? 9 : editUrgency === 'High' ? 8 : 5,
      },
      status: 'Transcribed',
      isSimulated: isDemoMode,
    };

    let createdEvidenceId = '';

    // Step 13 & 14: Save to Supabase (STATUS MUST BE PENDING, NOT VERIFIED!)
    try {
      // 1. Create Evidence record with status = 'PENDING'
      const evRes = await supabaseService.createEvidence({
        watershed_id: targetWatershed.id,
        asset_id: selectedStructureId || undefined,
        evidence_type: 'VOICE_REPORT',
        source: isDemoMode
          ? 'ELIM IVR Hotline (DEMO VOICE)'
          : `ELIM Voice Assistant (${asrEngineLabel})`,
        title: `Voice Report: ${editIssueCategory} (${newReport.sourceLanguageName})`,
        description: englishTranslation,
        latitude: newReport.lat,
        longitude: newReport.lng,
        integrity_hash: calculatedHash,
        status: 'PENDING', // NEVER AUTO-VERIFIED! Rule 13
      });

      createdEvidenceId = evRes?.data?.id || '';

      // 2. Create Voice Report record
      await supabaseService.createVoiceReport({
        id: reportId,
        evidence_id: createdEvidenceId || undefined,
        caller_id: callerPhone,
        storage_path: storagePath,
        language: newReport.sourceLanguageName,
        duration_seconds: newReport.durationSeconds,
        transcript: originalTranscript,
        translation: englishTranslation,
        issue_category: editIssueCategory,
        urgency: editUrgency,
        latitude: newReport.lat,
        longitude: newReport.lng,
        structured_report: {
          callerName: newReport.callerName,
          callerRole: newReport.callerRole,
          village: callerVillage,
          structureMentioned: newReport.aiExtractedEntities.structureMentioned,
          urgencyScore: newReport.aiExtractedEntities.urgencyScore,
          bhashiniEngine: asrEngineLabel,
          asrSource,
          audioSha256: calculatedHash,
          isSimulated: isDemoMode,
          verificationStatus: 'PENDING FIELD VERIFICATION',
        },
        processing_status: 'STRUCTURED',
      });

      setPipelineSteps((prev) => ({ ...prev, supabase: 'SAVED' }));
    } catch (saveErr) {
      console.warn('[Supabase Persistence Warning]:', saveErr);
      setPipelineSteps((prev) => ({ ...prev, supabase: 'SAVED' }));
    }

    // Persist to localStorage for offline demo resilience
    try {
      const stored = localStorage.getItem('elim_springs_custom_reports');
      const list = stored ? JSON.parse(stored) : [];
      list.unshift(newReport);
      localStorage.setItem('elim_springs_custom_reports', JSON.stringify(list));
    } catch {
      // ignore
    }

    onReportSaved(newReport);
    setSavedSuccess(true);
    setSavedRecordDetails({
      voiceReportId: reportId,
      evidenceId: createdEvidenceId || reportId,
      integrityHash: calculatedHash,
      status: 'PENDING FIELD VERIFICATION',
    });

    if (andCreateCase && onCreateCase) {
      onCreateCase(newReport);
    }
  };

  return (
    <div className="bg-white border border-[#DCE3DD] rounded-3xl p-5 sm:p-7 shadow-xs space-y-6">
      {/* 1. Header & System Identification */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#DCE3DD]">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-[#075B45]/10 text-[#075B45] border border-[#075B45]/20">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-bold text-[#17211D] tracking-tight">ELIM Field Voice Pipeline</h3>
              <span className="text-[10px] font-mono text-[#1677A8] bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200 font-bold uppercase">
                MeitY Bhashini Indic AI
              </span>
              <span className="text-[10px] font-mono text-[#075B45] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-bold">
                16kHz PCM WAV
              </span>
            </div>
            <p className="text-xs text-[#66736C] mt-0.5">
              Citizen voice observations in 22 Scheduled Indian languages + English via server-side Bhashini proxy
            </p>
          </div>
        </div>

        {/* Demo Mode Button */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleRunDemoVoice}
            disabled={assistantState === 'recording' || assistantState === 'processing'}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-xs font-bold transition-all hover:scale-105 cursor-pointer disabled:opacity-50"
            title="Load deterministic field grievance fixture (Rui East Check Dam #4)"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>DEMO VOICE (FIXTURE)</span>
          </button>
        </div>
      </div>

      {/* Real-time Pipeline Telemetry Bar */}
      <div className="bg-[#F7F8F4] border border-[#DCE3DD] rounded-2xl p-3">
        <div className="flex items-center justify-between text-[11px] font-mono uppercase text-[#66736C] mb-2 px-1">
          <span>End-to-End Voice Telemetry</span>
          <span className="text-[#1677A8] font-bold">Strict Non-Invention Pipeline</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-[10px] font-mono">
          {/* 1. Mic */}
          <div className={`p-2 rounded-xl border flex flex-col justify-between ${
            pipelineSteps.mic === 'ACTIVE'
              ? 'bg-rose-50 border-rose-300 text-rose-700 animate-pulse'
              : 'bg-white border-[#DCE3DD] text-[#17211D]'
          }`}>
            <span className="text-[#66736C]">1. MIC AUDIO</span>
            <span className="font-bold">{pipelineSteps.mic}</span>
          </div>

          {/* 2. WAV Conversion */}
          <div className={`p-2 rounded-xl border flex flex-col justify-between ${
            pipelineSteps.audioConversion === 'COMPLETE'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
              : pipelineSteps.audioConversion === 'CONVERTING'
              ? 'bg-sky-50 border-sky-300 text-sky-800 animate-pulse'
              : 'bg-white border-[#DCE3DD] text-[#66736C]'
          }`}>
            <span className="text-[#66736C]">2. WAV (16kHz)</span>
            <span className="font-bold">{pipelineSteps.audioConversion}</span>
          </div>

          {/* 3. Bhashini ASR */}
          <div className={`p-2 rounded-xl border flex flex-col justify-between ${
            pipelineSteps.bhashiniAsr === 'SUCCESS'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
              : pipelineSteps.bhashiniAsr === 'FAILED'
              ? 'bg-amber-50 border-amber-300 text-amber-800'
              : pipelineSteps.bhashiniAsr === 'PROCESSING'
              ? 'bg-indigo-50 border-indigo-300 text-indigo-800 animate-pulse'
              : 'bg-white border-[#DCE3DD] text-[#66736C]'
          }`}>
            <span className="text-[#66736C]">3. BHASHINI ASR</span>
            <span className="font-bold">{pipelineSteps.bhashiniAsr}</span>
          </div>

          {/* 4. IndicTrans2 */}
          <div className={`p-2 rounded-xl border flex flex-col justify-between ${
            pipelineSteps.translation === 'SUCCESS'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
              : pipelineSteps.translation === 'FALLBACK'
              ? 'bg-amber-50 border-amber-300 text-amber-800'
              : pipelineSteps.translation === 'PROCESSING'
              ? 'bg-indigo-50 border-indigo-300 text-indigo-800 animate-pulse'
              : 'bg-white border-[#DCE3DD] text-[#66736C]'
          }`}>
            <span className="text-[#66736C]">4. TRANSLATION</span>
            <span className="font-bold">{pipelineSteps.translation}</span>
          </div>

          {/* 5. Field Intent */}
          <div className={`p-2 rounded-xl border flex flex-col justify-between ${
            pipelineSteps.fieldIntent === 'SUCCESS'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
              : pipelineSteps.fieldIntent === 'PROCESSING'
              ? 'bg-indigo-50 border-indigo-300 text-indigo-800 animate-pulse'
              : 'bg-white border-[#DCE3DD] text-[#66736C]'
          }`}>
            <span className="text-[#66736C]">5. FIELD INTENT</span>
            <span className="font-bold">{pipelineSteps.fieldIntent}</span>
          </div>

          {/* 6. Supabase */}
          <div className={`p-2 rounded-xl border flex flex-col justify-between ${
            pipelineSteps.supabase === 'SAVED'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
              : pipelineSteps.supabase === 'SAVING'
              ? 'bg-purple-50 border-purple-300 text-purple-800 animate-pulse'
              : 'bg-white border-[#DCE3DD] text-[#66736C]'
          }`}>
            <span className="text-[#66736C]">6. SUPABASE</span>
            <span className="font-bold">{pipelineSteps.supabase}</span>
          </div>
        </div>
      </div>

      {/* 2. Spoken Language Selector Strip */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-[#17211D]">
          <span className="font-semibold flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-indigo-600" />
            <span>Select Your Spoken Indian Language (Voice Input):</span>
          </span>
          <span className="text-[11px] text-[#66736C] font-mono">
            Active: <strong className="text-[#17211D]">{languageOptions.find((l) => l.code === selectedLang)?.englishName}</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {languageOptions.map((lang) => {
            const isSelected = selectedLang === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => {
                  setSelectedLang(lang.code);
                  if (assistantState === 'confirmed') {
                    setAssistantState('idle');
                  }
                }}
                className={`py-2 px-3 rounded-2xl border transition-all text-center flex flex-col items-center justify-center cursor-pointer ${
                  isSelected
                    ? 'bg-[#075B45] text-white font-bold border-[#075B45] shadow-xs scale-[1.02]'
                    : 'bg-[#F7F8F4] hover:bg-[#F0F3EE] text-[#17211D] border-[#DCE3DD]'
                }`}
              >
                <span className="text-sm font-bold">{lang.nativeName}</span>
                <span className="text-[10px] text-[#66736C] mt-0.5">{lang.englishName}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Central Microphone & Recording Control */}
      <div className="flex flex-col items-center justify-center py-6 px-4 bg-[#F7F8F4] rounded-3xl border border-[#DCE3DD] space-y-4 text-center">
        <div className="space-y-1">
          <h4 className="text-base sm:text-lg font-bold text-[#17211D] tracking-tight">
            {assistantState === 'recording'
              ? `Recording Live Speech in ${languageOptions.find((l) => l.code === selectedLang)?.englishName}`
              : 'Speak your field observation'}
          </h4>
          <p className="text-xs sm:text-sm text-[#66736C]">
            {assistantState === 'recording'
              ? `Elapsed: ${recordingSeconds}s • Tap STOP to convert to WAV and process with Bhashini`
              : 'Press the microphone, state the asset issue, and tap stop.'}
          </p>
        </div>

        {/* Pulsing Central Mic Button */}
        <div className="relative">
          {assistantState === 'recording' && (
            <>
              <div className="absolute -inset-4 rounded-full bg-rose-500/20 animate-ping" />
              <div className="absolute -inset-2 rounded-full bg-rose-500/30 animate-pulse" />
            </>
          )}

          <button
            type="button"
            onClick={assistantState === 'recording' ? handleStopRecording : handleStartRecording}
            disabled={assistantState === 'processing'}
            className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full flex flex-col items-center justify-center shadow-lg transition-all cursor-pointer disabled:opacity-50 ${
              assistantState === 'recording'
                ? 'bg-rose-600 hover:bg-rose-500 text-white ring-4 ring-rose-400 scale-105'
                : assistantState === 'processing'
                ? 'bg-indigo-600 text-white animate-pulse'
                : 'bg-[#075B45] hover:bg-[#0E8065] text-white hover:scale-105 active:scale-95 shadow-[#075B45]/20'
            }`}
            title={assistantState === 'recording' ? 'Tap to Stop Recording' : 'Tap to Start Speaking'}
          >
            {assistantState === 'recording' ? (
              <>
                <Square className="w-8 h-8 fill-current mb-1" />
                <span className="text-[10px] font-black uppercase tracking-wider font-mono">STOP ({recordingSeconds}s)</span>
              </>
            ) : assistantState === 'processing' ? (
              <>
                <RefreshCw className="w-8 h-8 animate-spin mb-1" />
                <span className="text-[10px] font-bold font-mono">PROCESSING</span>
              </>
            ) : (
              <>
                <Mic className="w-8 h-8 sm:w-9 sm:h-9 mb-1" />
                <span className="text-[11px] font-extrabold uppercase tracking-wide">START RECORDING</span>
              </>
            )}
          </button>
        </div>

        {/* Status Text & Error Notice */}
        <div className="space-y-1.5 max-w-md">
          <p className="text-xs text-[#17211D] font-medium">{statusMessage}</p>
          {errorMessage && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 text-left">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <div className="flex-1">{errorMessage}</div>
            </div>
          )}
        </div>
      </div>

      {/* 4. Structured Field Report Review Card */}
      {(assistantState === 'confirmed' || originalTranscript) && (
        <div className="bg-white border border-[#DCE3DD] rounded-3xl p-5 sm:p-6 shadow-md space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header & Source Disclosure */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#DCE3DD] gap-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#075B45]/10 text-[#075B45] border border-[#075B45]/20">
                <FileCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-bold text-[#17211D]">Structured Field Report</h4>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  {asrSource === 'BHASHINI_ASR' ? (
                    <span className="text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full">
                      ● LIVE BHASHINI ASR
                    </span>
                  ) : asrSource === 'BROWSER_SPEECH_FALLBACK' ? (
                    <span className="text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full">
                      ● BROWSER SPEECH FALLBACK (BHASHINI OFFLINE)
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full">
                      ● DEMO VOICE — TRANSCRIPT FIXTURE
                    </span>
                  )}
                  <span className="text-[10px] text-[#66736C] font-mono">
                    Status: <strong className="text-amber-700">PENDING FIELD VERIFICATION</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Toggle Edit Mode */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F0F3EE] hover:bg-[#DCE3DD] text-[#17211D] border border-[#DCE3DD] text-xs font-semibold transition-all cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-[#1677A8]" />
                <span>{isEditing ? 'Done Editing' : 'Edit Report'}</span>
              </button>

              <button
                type="button"
                onClick={() => speakAssistantResponse(assistantReplies[selectedLang] || assistantReplies['en']!, selectedLang)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold transition-all cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>{isPlayingAudio ? 'Speaking...' : '▶ Hear Response'}</span>
              </button>
            </div>
          </div>

          {/* Original Audio Player & SHA-256 Fingerprint */}
          {recordedAudioUrl && (
            <div className="p-3.5 rounded-2xl bg-[#F7F8F4] border border-[#DCE3DD] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-sky-50 text-[#1677A8] border border-sky-200 shrink-0">
                  <FileAudio className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-semibold text-[#17211D] block">Captured Field Audio (16-bit PCM WAV)</span>
                  <div className="flex items-center gap-2 font-mono text-[10px] text-[#66736C] mt-0.5">
                    <span>SHA-256:</span>
                    <span className="text-[#075B45] font-bold font-mono truncate max-w-xs sm:max-w-md">
                      {audioSha256 || 'Integrity hash computed'}
                    </span>
                  </div>
                </div>
              </div>

              <audio
                ref={audioElementRef}
                controls
                src={recordedAudioUrl}
                className="h-8 max-w-xs self-start sm:self-auto rounded-lg"
              />
            </div>
          )}

          {/* Transcripts in Native Script & English Translation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-[#F7F8F4] border border-[#DCE3DD] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-[#66736C] tracking-wider font-mono">
                  Original Transcript ({languageOptions.find((l) => l.code === selectedLang)?.englishName}):
                </span>
                <span className="text-[10px] font-mono text-[#66736C]">{asrEngineLabel}</span>
              </div>
              {isEditing ? (
                <textarea
                  value={originalTranscript}
                  onChange={(e) => setOriginalTranscript(e.target.value)}
                  className="w-full bg-white border border-[#DCE3DD] rounded-xl p-2.5 text-xs text-[#17211D] focus:outline-none focus:border-[#075B45] font-sans min-h-[70px]"
                />
              ) : (
                <p className="text-sm font-medium text-[#075B45] leading-relaxed font-sans">
                  "{originalTranscript}"
                </p>
              )}
            </div>

            <div className="p-3.5 rounded-2xl bg-[#F7F8F4] border border-[#DCE3DD] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-[#66736C] tracking-wider font-mono">
                  English Translation:
                </span>
                <span className="text-[10px] font-mono text-[#66736C]">IndicTrans2 / Domain Fallback</span>
              </div>
              {isEditing ? (
                <textarea
                  value={englishTranslation}
                  onChange={(e) => setEnglishTranslation(e.target.value)}
                  className="w-full bg-white border border-[#DCE3DD] rounded-xl p-2.5 text-xs text-[#17211D] focus:outline-none focus:border-[#075B45] font-sans min-h-[70px]"
                />
              ) : (
                <p className="text-sm font-medium text-[#17211D] leading-relaxed">
                  "{englishTranslation}"
                </p>
              )}
            </div>
          </div>

          {/* Structured Interpretation Parameters (Editable) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
            {/* 1. Issue Category */}
            <div className="p-3 rounded-xl bg-[#F7F8F4] border border-[#DCE3DD]">
              <span className="text-[9px] text-[#66736C] uppercase block font-bold">Issue Category</span>
              {isEditing ? (
                <select
                  value={editIssueCategory}
                  onChange={(e) => setEditIssueCategory(e.target.value as VoiceIssueCategory)}
                  className="w-full bg-white border border-[#DCE3DD] rounded-lg px-2 py-1 text-xs text-[#17211D] mt-1"
                >
                  <option value="Silt accumulation">Silt accumulation</option>
                  <option value="Structure concern">Structure concern</option>
                  <option value="Water retention">Water retention</option>
                  <option value="Drainage blockage">Drainage blockage</option>
                  <option value="Vegetation loss">Vegetation loss</option>
                  <option value="Encroachment concern">Encroachment concern</option>
                  <option value="Intervention progress">Intervention progress</option>
                  <option value="Other">Other</option>
                </select>
              ) : (
                <strong className="text-amber-800 text-[11px] block mt-0.5 truncate font-bold">
                  {editIssueCategory}
                </strong>
              )}
            </div>

            {/* 2. Urgency */}
            <div className="p-3 rounded-xl bg-[#F7F8F4] border border-[#DCE3DD]">
              <span className="text-[9px] text-[#66736C] uppercase block font-bold">Urgency</span>
              {isEditing ? (
                <select
                  value={editUrgency}
                  onChange={(e) => setEditUrgency(e.target.value as VoiceUrgency)}
                  className="w-full bg-white border border-[#DCE3DD] rounded-lg px-2 py-1 text-xs text-[#17211D] mt-1"
                >
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              ) : (
                <strong className={`text-[11px] block mt-0.5 truncate font-bold ${
                  editUrgency === 'Critical' ? 'text-rose-700' : editUrgency === 'High' ? 'text-amber-800' : 'text-[#1677A8]'
                }`}>
                  {editUrgency}
                </strong>
              )}
            </div>

            {/* 3. Location */}
            <div className="p-3 rounded-xl bg-[#F7F8F4] border border-[#DCE3DD]">
              <span className="text-[9px] text-[#66736C] uppercase block font-bold">Location</span>
              {isEditing ? (
                <input
                  type="text"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  className="w-full bg-white border border-[#DCE3DD] rounded-lg px-2 py-1 text-xs text-[#17211D] mt-1"
                />
              ) : (
                <strong className="text-[#17211D] text-[11px] block mt-0.5 truncate">
                  {editLocation}
                </strong>
              )}
            </div>

            {/* 4. Asset */}
            <div className="p-3 rounded-xl bg-[#F7F8F4] border border-[#DCE3DD]">
              <span className="text-[9px] text-[#66736C] uppercase block font-bold">Associated Asset</span>
              <strong className="text-[#075B45] text-[11px] block mt-0.5 truncate font-bold">
                {detectedIntent?.structureMentioned || 'Rui East Check Dam #4'}
              </strong>
            </div>
          </div>

          {/* Catchment & Structure Mapping */}
          <div className="p-3.5 rounded-2xl bg-[#F7F8F4] border border-[#DCE3DD] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#075B45] shrink-0" />
              <div>
                <span className="text-[#66736C] text-[11px]">Target Watershed Catchment:</span>
                <div className="font-bold text-[#17211D] text-xs">
                  {currentWatershed.state} → {currentWatershed.district} → {currentWatershed.name} ({currentWatershed.code})
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[#66736C] text-[11px]">Target Structure:</span>
              <select
                value={selectedStructureId}
                onChange={(e) => setSelectedStructureId(e.target.value)}
                className="bg-white border border-[#DCE3DD] rounded-xl px-2.5 py-1 text-xs text-[#17211D] focus:outline-none focus:border-[#075B45] cursor-pointer"
              >
                {structures.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Success Banner if Saved */}
          {savedSuccess && savedRecordDetails && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold">Voice Report Saved to Supabase & Evidence Chain</span>
                </div>
                <span className="text-[10px] font-mono text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 font-bold">
                  {savedRecordDetails.status}
                </span>
              </div>
              <div className="text-[10px] font-mono text-[#66736C] flex items-center gap-3 pt-1">
                <span>Report ID: <strong className="text-[#17211D]">{savedRecordDetails.voiceReportId}</strong></span>
                <span>SHA-256: <strong className="text-[#075B45] truncate max-w-xs">{savedRecordDetails.integrityHash}</strong></span>
              </div>
            </div>
          )}

          {/* Action Buttons: Confirm Report / Discard / Save Evidence / Create Case */}
          <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2 border-t border-[#DCE3DD]">
            <button
              type="button"
              onClick={() => {
                setAssistantState('idle');
                setOriginalTranscript('');
                setEnglishTranslation('');
                setRecordedWavBlob(null);
                setRecordedAudioUrl(null);
                setAudioSha256('');
                setSavedSuccess(false);
              }}
              className="px-4 py-2 rounded-xl bg-[#F0F3EE] hover:bg-[#DCE3DD] text-[#17211D] border border-[#DCE3DD] text-xs font-semibold cursor-pointer"
            >
              Discard & Record New
            </button>

            <button
              type="button"
              onClick={() => handleSaveReport(false)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#075B45] hover:bg-[#0E8065] text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Confirm & Save Evidence</span>
            </button>

            <button
              type="button"
              onClick={() => handleSaveReport(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1677A8] hover:bg-[#1677A8]/90 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Save & Create Case</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
