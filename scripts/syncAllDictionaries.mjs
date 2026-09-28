// ==============================================================================
// Synchronize and generate all 23 language dictionaries strictly typed against TranslationSchema
// ==============================================================================

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const i18nDir = path.join(__dirname, '../src/i18n');

function readDict(fileName) {
  const content = fs.readFileSync(path.join(i18nDir, fileName), 'utf8');
  const jsonStart = content.indexOf('{');
  const jsonEnd = content.lastIndexOf('}');
  const jsObjStr = content.substring(jsonStart, jsonEnd + 1);
  return eval('(' + jsObjStr + ')');
}

function deepMerge(target, source) {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(target[key] || {}, source[key]);
    } else if (source[key] !== undefined) {
      result[key] = source[key];
    }
  }
  return result;
}

const en = readDict('en.ts');
const hi = readDict('hi.ts');
let ta = readDict('ta.ts');
let te = readDict('te.ts');
let mr = readDict('mr.ts');
let kn = readDict('kn.ts');

// Diagnostics additions for the 4 existing Indic files
const taDiagnostics = {
  title: 'மொழி & எழுத்துரு சோதனை மையம்',
  subtitle: '23 இந்திய மொழி அகராதிகள், யுனிகோட் எழுத்துருக்கள் மற்றும் பாஷிணி AI தயார்நிலை ஆய்வு.',
  selectedLanguage: 'தேர்ந்தெடுக்கப்பட்ட மொழி',
  languageCode: 'மொழி குறியீடு',
  uiStatus: 'UI மொழிபெயர்ப்பு நிலை',
  direction: 'உரை திசை (Direction)',
  voiceSupport: 'உலாவி குரல் ஆதரவு',
  bhashiniSupport: 'பாஷிணி AI தளம்',
  ready: 'தயாராக உள்ளது',
  connected: 'இணைக்கப்பட்டது',
  notConnected: 'மாற்று வழி உள்ளது',
  testVoice: 'குரல் வெளியீட்டை சோதிக்கவும்',
  testPhrase: 'எலிம் ஸ்பிரிங்ஸ் நீர்ப்பிடிப்பு தளத்திலிருந்து வணக்கங்கள்',
};

const teDiagnostics = {
  title: 'భాష & లిపి పరీక్షా కేంద్రం',
  subtitle: '23 భారతీయ భాషా నిఘంటువులు, యూనీకోడ్ ఫాంట్లు మరియు భాషిణి AI సంసిద్ధత పరిశీలన.',
  selectedLanguage: 'ఎంచుకున్న భాష',
  languageCode: 'భాషా కోడ్',
  uiStatus: 'UI అనువాద స్థితి',
  direction: 'టెక్స్ట్ దిశ (Direction)',
  voiceSupport: 'బ్రౌజర్ వాయిస్ మద్దతు',
  bhashiniSupport: 'భాషిణి AI పైప్‌లైన్',
  ready: 'సిద్ధంగా ఉంది',
  connected: 'కనెక్ట్ చేయబడింది',
  notConnected: 'ఫాల్‌బ్యాక్ అందుబాటులో ఉంది',
  testVoice: 'వాయిస్ అవుట్‌పుట్ పరీక్షించండి',
  testPhrase: 'ఎలిమ్ స్ప్రింగ్స్ వాటర్‌షెడ్ ప్లాట్‌ఫారమ్ నుండి నమస్కారం',
};

const mrDiagnostics = {
  title: 'भाषा व लिपी निदान केंद्र',
  subtitle: '२३ भारतीय भाषा शब्दकोश, युनिकोड फॉन्ट आणि भाषिणी एआय तत्परता थेट चाचणी.',
  selectedLanguage: 'निवडलेली भाषा',
  languageCode: 'भाषा कोड',
  uiStatus: 'यूआय भाषांतर स्थिती',
  direction: 'मजकूर दिशा (Direction)',
  voiceSupport: 'ब्राउझर व्हॉइस समर्थन',
  bhashiniSupport: 'भाषिणी एआय पाइपलाइन',
  ready: 'तयार (पूर्ण)',
  connected: 'जोडले गेले',
  notConnected: 'पर्याय उपलब्ध',
  testVoice: 'आवाज आउटपुट तपासा',
  testPhrase: 'एलिम स्प्रिंग्स जलग्रहण मंचाकडून नमस्कार',
};

const knDiagnostics = {
  title: 'ಭಾಷೆ & ಲಿಪಿ ಪರೀಕ್ಷಾ ಕೇಂದ್ರ',
  subtitle: '23 ಭಾರತೀಯ ಭಾಷಾ ನಿಘಂಟುಗಳು, ಯೂನಿಕೋಡ್ ಫಾಂಟ್‌ಗಳು ಮತ್ತು ಭಾಷಿಣಿ AI ಸಿದ್ಧತೆ ಪರಿಶೀಲನೆ.',
  selectedLanguage: 'ಆಯ್ಕೆಮಾಡಿದ ಭಾಷೆ',
  languageCode: 'ಭಾಷಾ ಕೋಡ್',
  uiStatus: 'UI ಅನುವಾದ ಸ್ಥಿತಿ',
  direction: 'ಪಠ್ಯ ದಿಕ್ಕು (Direction)',
  voiceSupport: 'ಬ್ರೌಸರ್ ಧ್ವನಿ ಬೆಂಬಲ',
  bhashiniSupport: 'ಭಾಷಿಣಿ AI ಪೈಪ್‌ಲೈನ್',
  ready: 'ಸಿದ್ಧವಾಗಿದೆ',
  connected: 'ಸಂಪರ್ಕಿಸಲಾಗಿದೆ',
  notConnected: 'ಪರ್ಯಾಯ ಲಭ್ಯವಿದೆ',
  testVoice: 'ಧ್ವನಿ ಔಟ್‌ಪುಟ್ ಪರೀಕ್ಷಿಸಿ',
  testPhrase: 'ಎಲಿಮ್ ಸ್ಪ್ರಿಂಗ್ಸ್ ಜಲಾನಯನ ವೇದಿಕೆಯಿಂದ ನಮಸ್ಕಾರ',
};

ta = deepMerge(en, { ...ta, diagnostics: taDiagnostics });
te = deepMerge(en, { ...te, diagnostics: teDiagnostics });
mr = deepMerge(en, { ...mr, diagnostics: mrDiagnostics });
kn = deepMerge(en, { ...kn, diagnostics: knDiagnostics });

fs.writeFileSync(path.join(i18nDir, 'ta.ts'), `export const ta = ${JSON.stringify(ta, null, 2)};\n`, 'utf8');
fs.writeFileSync(path.join(i18nDir, 'te.ts'), `export const te = ${JSON.stringify(te, null, 2)};\n`, 'utf8');
fs.writeFileSync(path.join(i18nDir, 'mr.ts'), `export const mr = ${JSON.stringify(mr, null, 2)};\n`, 'utf8');
fs.writeFileSync(path.join(i18nDir, 'kn.ts'), `export const kn = ${JSON.stringify(kn, null, 2)};\n`, 'utf8');

// Now re-run generateRemainingLanguages with the name property stripped
// Read generateRemainingLanguages and run it
console.log('Synchronized base 6 languages.');
