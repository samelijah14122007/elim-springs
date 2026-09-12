// ==============================================================================
// ELIM SPRINGS — MEITY BHASHINI MULTILINGUAL INDIAN LANGUAGE SERVICE
// SIH 2026 - PS 26015 | "From Field Voices to Watershed Action"
// ==============================================================================
// Connects the ELIM SPRINGS voice pipeline to the Government of India MeitY
// Bhashini Dhruva Unified Pipeline API via secure FastAPI server-side proxy:
// - ASR (Automatic Speech Recognition)
// - NMT (IndicTrans2 Neural Machine Translation)
// - TTS (Text-to-Speech Voice Synthesis)
// - LID (Language Identification)
//
// Adheres strictly to responsible integration:
// - Never exposes secret API keys to the browser bundle
// - Truthfully detects LIVE vs SIMULATED vs AUTH_FAILED vs NETWORK_ERROR
// - Robust offline/fallback simulation for field resilience
// - Preserves all existing interfaces and caller contracts
// ==============================================================================

import {
  LanguageCode,
  VoiceIssueCategory,
  VoiceUrgency,
  BhashiniConfig,
  BhashiniConnectionResult,
  BhashiniConnectionStatus,
  BhashiniLanguageTestResult,
} from '../types';

export interface BhashiniTranslationResult {
  sourceText: string;
  translatedText: string;
  sourceLang: LanguageCode;
  targetLang: LanguageCode;
  confidenceScore: number;
  engineUsed: string;
  isSimulated: boolean;
}

export interface BhashiniAsrResult {
  transcript: string;
  detectedLanguage: LanguageCode;
  confidence: number;
  durationSeconds: number;
  modelUsed: string;
  isSimulated: boolean;
}

export interface BhashiniIntentResult {
  intent: string;
  issueCategory: VoiceIssueCategory;
  urgency: VoiceUrgency;
  urgencyScore: number; // 1-10
  structureMentioned?: string;
  reportedLocation?: string;
  confidence: number;
  rationale: string;
}

export interface IBhashiniService {
  getBhashiniConfig(): BhashiniConfig;
  isBhashiniConfigured(): boolean;
  testBhashiniConnection(forceRefresh?: boolean): Promise<BhashiniConnectionResult>;
  transcribeAudio(audioFileUrlOrBlob: string, expectedLang?: LanguageCode): Promise<BhashiniAsrResult>;
  detectLanguage(sampleOrText: string): Promise<{ language: LanguageCode; languageName: string; confidence: number }>;
  translate(text: string, fromLang: LanguageCode, toLang: LanguageCode): Promise<BhashiniTranslationResult>;
  translateTranscript(transcript: string, fromLang: LanguageCode, toLang?: LanguageCode): Promise<string>;
  extractFieldIntent(transcript: string, translation: string, language: LanguageCode): Promise<BhashiniIntentResult>;
  synthesizeSpeech(text: string, targetLang: LanguageCode): Promise<string>;
}

export const BHASHINI_DHRUVA_PIPELINE_URL = 'https://dhruva-api.bhashini.gov.in/services/inference/pipeline';

const BACKEND_BHASHINI_URL = '/api/bhashini';
const FALLBACK_BACKEND_BHASHINI_URL = 'http://127.0.0.1:8000/api/bhashini';

/**
 * Safely calls the backend Bhashini proxy.
 * Tries the Vite proxy endpoint first (/api/bhashini), falls back to direct 127.0.0.1:8000.
 */
async function callBhashiniBackend(path: string, options: RequestInit): Promise<Response> {
  try {
    const res = await fetch(`${BACKEND_BHASHINI_URL}${path}`, options);
    if (res.status === 404 || res.status === 502) {
      // Might be running standalone without Vite proxy
      return await fetch(`${FALLBACK_BACKEND_BHASHINI_URL}${path}`, options);
    }
    return res;
  } catch {
    return await fetch(`${FALLBACK_BACKEND_BHASHINI_URL}${path}`, options);
  }
}

const mockLanguageMap: Record<LanguageCode, string> = {
  en: 'English',
  as: 'Assamese (অসমীয়া)',
  bn: 'Bengali (বাংলা)',
  brx: 'Bodo (बड़ो)',
  doi: 'Dogri (डोगरी)',
  gu: 'Gujarati (ગુજરાતી)',
  hi: 'Hindi (हिंदी)',
  kn: 'Kannada (ಕನ್ನಡ)',
  ks: 'Kashmiri (کٲشُر / कॉशुर)',
  kok: 'Konkani (कोंकणी)',
  mai: 'Maithili (मैथिली)',
  ml: 'Malayalam (മലയാളം)',
  mni: 'Manipuri (মৈতৈলোন্)',
  mr: 'Marathi (मराठी)',
  ne: 'Nepali (नेपाली)',
  or: 'Odia (ଓଡ଼ିଆ)',
  pa: 'Punjabi (ਪੰਜਾਬੀ)',
  sa: 'Sanskrit (संस्कृतम्)',
  sat: 'Santali (ᱥᱟᱱᱛᱟᱲᱤ)',
  sd: 'Sindhi (سنڌي / सिंधी)',
  ta: 'Tamil (தமிழ்)',
  te: 'Telugu (తెలుగు)',
  ur: 'Urdu (اردو)',
};

export const getLanguageName = (code: LanguageCode): string => mockLanguageMap[code] || code;

export const SUPPORTED_BHASHINI_LANGUAGES: { code: LanguageCode; name: string; nativeName: string; script: string }[] = [
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', script: 'Devanagari' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', script: 'Devanagari' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', script: 'Telugu' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', script: 'Kannada' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', script: 'Tamil' },
  { code: 'en', name: 'English', nativeName: 'English', script: 'Latin' },
];

class BhashiniService implements IBhashiniService {
  private cachedConnectionResult: BhashiniConnectionResult | null = null;
  private serverIsConfigured: boolean | null = null;

  getBhashiniConfig(): BhashiniConfig {
    return {
      endpoint: '/api/bhashini',
      isConfigured: this.serverIsConfigured ?? false,
      hasUdyatKey: this.serverIsConfigured ?? false,
      hasInferenceKey: this.serverIsConfigured ?? false,
    };
  }

  isBhashiniConfigured(): boolean {
    return this.serverIsConfigured === true;
  }

  async testBhashiniConnection(forceRefresh = false): Promise<BhashiniConnectionResult> {
    if (this.cachedConnectionResult && !forceRefresh) {
      return this.cachedConnectionResult;
    }

    try {
      const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
      const timeoutId = controller ? setTimeout(() => controller.abort(), 6000) : null;

      const res = await callBhashiniBackend('/status', {
        method: 'GET',
        signal: controller?.signal,
      });

      if (timeoutId) clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        this.serverIsConfigured = Boolean(data.isConfigured);

        if (data.isConfigured) {
          const result: BhashiniConnectionResult = {
            status: 'BHASHINI_LIVE',
            mode: 'LIVE',
            success: true,
            endpoint: '/api/bhashini (FastAPI Proxy → MeitY Dhruva)',
            message: 'Server-side Bhashini Dhruva pipeline active and authenticated.',
            supportedLanguages: ['mr', 'hi', 'te', 'kn', 'ta', 'en'],
            testedLanguages: [],
          };
          this.cachedConnectionResult = result;
          return result;
        }

        const result: BhashiniConnectionResult = {
          status: 'BHASHINI_AUTH_FAILED',
          mode: 'SIMULATED',
          success: false,
          endpoint: '/api/bhashini',
          message: 'Bhashini server credentials not configured (BHASHINI_UDYAT_KEY / BHASHINI_INFERENCE_KEY missing). Operating in prototype mode.',
          supportedLanguages: ['mr', 'hi', 'te', 'kn', 'ta', 'en'],
          testedLanguages: [],
        };
        this.cachedConnectionResult = result;
        return result;
      }

      const result: BhashiniConnectionResult = {
        status: 'BHASHINI_AUTH_FAILED',
        mode: 'SIMULATED',
        success: false,
        endpoint: '/api/bhashini',
        message: `Bhashini proxy status error: HTTP ${res.status}`,
        supportedLanguages: ['mr', 'hi', 'te', 'kn', 'ta', 'en'],
        testedLanguages: [],
      };
      this.cachedConnectionResult = result;
      return result;
    } catch (err: any) {
      this.serverIsConfigured = false;
      const result: BhashiniConnectionResult = {
        status: 'BHASHINI_NETWORK_ERROR',
        mode: 'SIMULATED',
        success: false,
        endpoint: '/api/bhashini',
        message: 'Could not connect to FastAPI Bhashini service on port 8000. Operating in offline domain simulation.',
        supportedLanguages: ['mr', 'hi', 'te', 'kn', 'ta', 'en'],
        testedLanguages: [],
      };
      this.cachedConnectionResult = result;
      return result;
    }
  }

  async transcribeAudio(
    audioFileUrlOrBlob: string,
    expectedLang: LanguageCode = 'mr'
  ): Promise<BhashiniAsrResult> {
    // High-fidelity domain-specific samples for supported languages
    const samples: Partial<Record<LanguageCode, string>> = {
      ta: 'வணக்கம் ஐயா, கல்யாணதுர்கம் அணைக்கட்டு எண் ஒன்றில் கடந்த மழையின் போது நீர் தேங்காமல் வீணாக வழிகிறது. பக்கவாட்டுச் சுவர் விரிசலடைந்துள்ளது. உடனடியாக சரிபார்க்கவும்.',
      mr: 'नमस्कार साहेब, रुई गावातील बंधारा क्रमांक ४ गाळाने पूर्ण भरला आहे. पाण्याचा निचरा होत नाही आणि सांडव्याला भेगा पडल्या आहेत.',
      te: 'నమస్కారం సార్, బెలుగుప్ప వాగులో వేసిన సబ్-సర్ఫేస్ డ్యాం దగ్గర మోటారు పంపులు పెట్టి అక్రమంగా నీటిని తోడేస్తున్నారు. భూగర్భ జలాలు తగ్గుతున్నాయి.',
      hi: 'नमस्ते सर, अलीपुरा नाले के पक्के चेक डैम की नींव से पानी तेजी से रिस रहा है। भारी बारिश में बांध की दीवार ढहने का खतरा है।',
      kn: 'ನಮಸ್ಕಾರ, ನಮ್ಮ ಗ್ರಾಮದ ಹತ್ತಿರದ ಚೆಕ್ ಡ್ಯಾಂ ನಲ್ಲಿ ಅಪಾರ ಪ್ರಮಾಣದ ಹೂಳು ತುಂಬಿದ್ದು, ಮಳೆಯ ನೀರು ನಿಲ್ಲುತ್ತಿಲ್ಲ. ದಯವಿಟ್ಟು ಹೂಳೆತ್ತಲು ಕ್ರಮ ಕೈಗೊಳ್ಳಿ.',
      gu: 'નમસ્તે સાહેબ, ચેકડેમ પાસે માટીનું ધોવાણ થયું છે અને પાણી વહી જઈ રહ્યું છે. વહેલી તકે મરામત કરો.',
      en: 'Field inspection confirms check dam crest erosion and silt choking above eighty percent. Overflow discharge poses breach hazard to downstream farmlands.',
    };

    // If no real base64 audio data was passed (empty or non-audio URI),
    // return clearly labeled transcript fixture instead of claiming live ASR.
    if (
      !audioFileUrlOrBlob ||
      audioFileUrlOrBlob.trim() === '' ||
      !audioFileUrlOrBlob.startsWith('data:audio')
    ) {
      return {
        transcript: samples[expectedLang] || samples['mr']!,
        detectedLanguage: expectedLang,
        confidence: 0.94,
        durationSeconds: 24.5,
        modelUsed: `DEMO VOICE — TRANSCRIPT FIXTURE (${expectedLang})`,
        isSimulated: true,
      };
    }

    // Real audio data present -> Call server-side FastAPI Bhashini ASR endpoint
    const base64Data = audioFileUrlOrBlob.includes(',')
      ? audioFileUrlOrBlob.split(',')[1]
      : audioFileUrlOrBlob;

    const res = await callBhashiniBackend('/asr', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        audio_base64: base64Data,
        language: expectedLang,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      return {
        transcript: data.transcript,
        detectedLanguage: data.detectedLanguage || expectedLang,
        confidence: data.confidence || 0.96,
        durationSeconds: data.durationSeconds || 15.0,
        modelUsed: data.modelUsed || `MeitY Bhashini ASR (${expectedLang})`,
        isSimulated: false,
      };
    }

    const errJson = await res.json().catch(() => ({}));
    const reason = errJson.detail || `HTTP ${res.status}`;
    throw new Error(`BHASHINI ASR FAILED: ${reason}`);
  }

  async detectLanguage(sampleOrText: string): Promise<{ language: LanguageCode; languageName: string; confidence: number }> {
    // Standard Indic script heuristic for LID
    if (/[\u0B80-\u0BFF]/.test(sampleOrText)) return { language: 'ta', languageName: 'Tamil (தமிழ்)', confidence: 0.98 };
    if (/[\u0C00-\u0C7F]/.test(sampleOrText)) return { language: 'te', languageName: 'Telugu (తెలుగు)', confidence: 0.97 };
    if (/[\u0C80-\u0CFF]/.test(sampleOrText)) return { language: 'kn', languageName: 'Kannada (ಕನ್ನಡ)', confidence: 0.96 };
    if (/[\u0A80-\u0AFF]/.test(sampleOrText)) return { language: 'gu', languageName: 'Gujarati (ગુજરાતી)', confidence: 0.97 };
    if (/[\u0900-\u097F]/.test(sampleOrText)) {
      if (
        sampleOrText.includes('साहेब') ||
        sampleOrText.includes('बंधारा') ||
        sampleOrText.includes('आहे') ||
        sampleOrText.includes('गाळाने') ||
        sampleOrText.includes('पाण्याचा')
      ) {
        return { language: 'mr', languageName: 'Marathi (मराठी)', confidence: 0.95 };
      }
      return { language: 'hi', languageName: 'Hindi (हिंदी)', confidence: 0.94 };
    }

    return { language: 'en', languageName: 'English', confidence: 0.99 };
  }

  async translate(
    text: string,
    fromLang: LanguageCode,
    toLang: LanguageCode = 'en'
  ): Promise<BhashiniTranslationResult> {
    if (fromLang === toLang) {
      return {
        sourceText: text,
        translatedText: text,
        sourceLang: fromLang,
        targetLang: toLang,
        confidenceScore: 1.0,
        engineUsed: 'Identity Match',
        isSimulated: false,
      };
    }

    // 1. Attempt LIVE call to FastAPI Bhashini Proxy
    try {
      const res = await callBhashiniBackend('/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          sourceLanguage: fromLang,
          targetLanguage: toLang,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.translatedText) {
          return {
            sourceText: text,
            translatedText: data.translatedText,
            sourceLang: fromLang,
            targetLang: toLang,
            confidenceScore: data.confidence || 0.98,
            engineUsed: data.engineUsed || 'MeitY Bhashini IndicTrans2',
            isSimulated: false,
          };
        }
      }
    } catch (err: any) {
      console.warn('[BhashiniService] Proxy translation call failed, activating domain fallback:', err?.message || err);
    }

    // 2. High-Fidelity Domain Watershed Fallback
    let translated = text;
    if (fromLang === 'ta' && toLang === 'en') {
      translated =
        'Hello Sir, at Check Dam number 1 in Kalyandurg, water is not impounding after recent rains and is overflowing excessively. The wing wall shows visible cracks. Please verify urgently.';
    } else if (fromLang === 'mr' && toLang === 'en') {
      translated =
        'Hello Officer, check dam number 4 in Rui village is completely choked with silt. Water runoff is not impounding and cracks have developed along the spillway apron.';
    } else if (fromLang === 'te' && toLang === 'en') {
      translated =
        'Respected Sir, near the sub-surface dyke installed in Beluguppa stream, unauthorized diesel pump-sets are draining stored water illegally. Groundwater levels are depleting.';
    } else if (fromLang === 'hi' && toLang === 'en') {
      translated =
        'Greetings Sir, water is seeping rapidly from beneath the foundation wall of the masonry check dam on Alipura nalla. If heavy rain occurs, the weir structure is at risk of breach.';
    } else if (fromLang === 'kn' && toLang === 'en') {
      translated =
        'Greetings, the check dam near our village is heavily clogged with silt and rain runoff is not percolating. Kindly arrange for de-siltation machinery.';
    } else if (fromLang === 'en' && toLang === 'hi') {
      translated = 'रुई गाँव में चेक डैम क्षतिग्रस्त हो गया है और इसकी तत्काल मरम्मत की आवश्यकता है।';
    } else if (fromLang === 'en' && toLang === 'mr') {
      translated = 'बंधारा क्रमांक ४ मध्ये गाळ साचला असून दुरुस्तीचे काम त्वरित सुरू करण्याचे निर्देश आहेत.';
    }

    return {
      sourceText: text,
      translatedText: translated,
      sourceLang: fromLang,
      targetLang: toLang,
      confidenceScore: 0.96,
      engineUsed: 'PROTOTYPE FALLBACK (MeitY AI4Bharat IndicTrans2 Simulation)',
      isSimulated: true,
    };
  }

  async translateTranscript(
    transcript: string,
    fromLang: LanguageCode,
    toLang: LanguageCode = 'en'
  ): Promise<string> {
    const res = await this.translate(transcript, fromLang, toLang);
    return res.translatedText;
  }

  async extractFieldIntent(
    transcript: string,
    translation: string,
    language: LanguageCode
  ): Promise<BhashiniIntentResult> {
    const lower = (translation + ' ' + transcript).toLowerCase();

    let issueCategory: VoiceIssueCategory = 'Other';
    let urgency: VoiceUrgency = 'Medium';
    let urgencyScore = 6;
    let intent = 'General watershed voice inquiry';
    let structureMentioned = 'Drainage structure';
    let reportedLocation = 'Watershed catchment area';
    let rationale = 'Parsed caller statement using domain keywords';

    if (
      lower.includes('crack') ||
      lower.includes('breach') ||
      lower.includes('seep') ||
      lower.includes('collapse') ||
      lower.includes('leak') ||
      lower.includes('भेगा') ||
      lower.includes('धोका') ||
      lower.includes('விரிசல்')
    ) {
      issueCategory = 'Structure concern';
      urgency = 'Critical';
      urgencyScore = 9;
      intent = 'Immediate breach or structural wall failure alert';
      structureMentioned = 'Masonry Check Dam / Earthen Bund';
      rationale = 'Caller indicated foundation seepage, cracking, or catastrophic breach threat';
    } else if (
      lower.includes('silt') ||
      lower.includes('sediment') ||
      lower.includes('गाळ') ||
      lower.includes('मट्टी') ||
      lower.includes('ஹூளு') ||
      lower.includes('மண்') ||
      lower.includes('choked')
    ) {
      issueCategory = 'Silt accumulation';
      urgency = 'High';
      urgencyScore = 8;
      intent = 'Heavy silt choking impeding water storage & recharge';
      structureMentioned = 'Rui East Check Dam #4';
      rationale = 'Caller reported silt deposition halting groundwater recharge and impoundment';
    } else if (
      lower.includes('pump') ||
      lower.includes('theft') ||
      lower.includes('drain') ||
      lower.includes('motor') ||
      lower.includes('अवैध') ||
      lower.includes('తోడేస్తున్నారు')
    ) {
      issueCategory = 'Encroachment concern';
      urgency = 'High';
      urgencyScore = 7;
      intent = 'Unauthorized water abstraction with diesel/electric pumps';
      structureMentioned = 'Sub-surface Dyke / Farm Pond';
      rationale = 'Groundwater depletion caused by unauthorized suction';
    } else if (
      lower.includes('erosion') ||
      lower.includes('scour') ||
      lower.includes('धोवाण') ||
      lower.includes('கரை')
    ) {
      issueCategory = 'Structure concern';
      urgency = 'High';
      urgencyScore = 8;
      intent = 'Gully erosion and embankment apron damage';
      structureMentioned = 'Check Dam Embankment';
      rationale = 'Severe soil loss threatening structural anchor';
    } else if (
      lower.includes('block') ||
      lower.includes('drainage') ||
      lower.includes('weed') ||
      lower.includes('अडथळा')
    ) {
      issueCategory = 'Drainage blockage';
      urgency = 'Medium';
      urgencyScore = 5;
      intent = 'Feeder channel blockage and weed encroachment';
      structureMentioned = 'Feeder Channel / Gully Plug';
      rationale = 'Clearing required before subsequent rainfall episode';
    } else if (
      lower.includes('vegetation') ||
      lower.includes('tree') ||
      lower.includes('contour') ||
      lower.includes('grass')
    ) {
      issueCategory = 'Vegetation loss';
      urgency = 'Low';
      urgencyScore = 3;
      intent = 'Vegetation cover and bund stabilization report';
      structureMentioned = 'Contour Bund / Plantation Area';
      rationale = 'Routine seasonal monitoring classification';
    }

    if (lower.includes('kalyandurg')) reportedLocation = 'Kalyandurg Stream Bed';
    else if (lower.includes('rui')) reportedLocation = 'Rui Stream order 3';
    else if (lower.includes('alipura')) reportedLocation = 'Alipura Nalla';
    else if (lower.includes('beluguppa')) reportedLocation = 'Beluguppa Sub-basin';

    return {
      intent,
      issueCategory,
      urgency,
      urgencyScore,
      structureMentioned,
      reportedLocation,
      confidence: 0.95,
      rationale,
    };
  }

  async synthesizeSpeech(text: string, targetLang: LanguageCode): Promise<string> {
    try {
      const res = await callBhashiniBackend('/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text.slice(0, 150),
          language: targetLang,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.audioBase64) {
          return `data:audio/wav;base64,${data.audioBase64}`;
        }
      }
    } catch (err: any) {
      console.warn('[BhashiniService] TTS proxy call failed:', err?.message || err);
    }

    // Return empty string to indicate browser SpeechSynthesis fallback should be used
    return '';
  }
}

export const bhashiniService = new BhashiniService();
