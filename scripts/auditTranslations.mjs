// ==============================================================================
// ELIM SPRINGS — 23-LANGUAGE STRICT TRANSLATION AUDIT TOOL
// SIH 2026 - PS 26015 | "From Field Voices to Watershed Action"
// ==============================================================================

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const i18nDir = path.join(__dirname, '../src/i18n');

// Read translations.ts
const translationsContent = fs.readFileSync(path.join(i18nDir, 'translations.ts'), 'utf8');

// Function to extract dictionary objects from translations.ts or separate files
function loadAllDictionaries() {
  const dicts = {};

  // Read base 6 files
  function readDictFile(name) {
    const content = fs.readFileSync(path.join(i18nDir, `${name}.ts`), 'utf8');
    const start = content.indexOf('{');
    const end = content.lastIndexOf('}');
    return eval('(' + content.substring(start, end + 1) + ')');
  }

  dicts.en = readDictFile('en');
  dicts.hi = readDictFile('hi');
  dicts.ta = readDictFile('ta');
  dicts.te = readDictFile('te');
  dicts.mr = readDictFile('mr');
  dicts.kn = readDictFile('kn');

  // Load from translations.ts for the remaining 17
  const exportRegex = /export const (\w+): TranslationSchema = ({[\s\S]*?^};)/gm;
  let match;
  while ((match = exportRegex.exec(translationsContent)) !== null) {
    const langCode = match[1];
    try {
      const codeStr = match[2];
      dicts[langCode] = eval('(' + codeStr.slice(0, -1) + ')');
    } catch (e) {
      console.error(`Failed parsing ${langCode}:`, e.message);
    }
  }

  return dicts;
}

const ALL_CODES = [
  'en', 'as', 'bn', 'brx', 'doi', 'gu', 'hi', 'kn', 'ks', 'kok',
  'mai', 'ml', 'mni', 'mr', 'ne', 'or', 'pa', 'sa', 'sat', 'sd',
  'ta', 'te', 'ur'
];

// Technical acronyms, IDs, proper names, or symbols allowed to match English
const ALLOWED_MATCH_TERMS = [
  'ELIM SPRINGS',
  'PS 26015',
  'SIH 2026',
  'GIS',
  'OCR',
  'GPS',
  'AI',
  'RAG',
  'IVR',
  'NDVI',
  'NDWI',
  'LULC',
  'SHA-256',
  'EXIF',
  'Sentinel-2',
  'Bhuvan',
  'NRSC',
  'ISRO',
  'Bhashini',
  'PMKSY',
  'MGNREGA',
  'CGWB',
  'DPR',
  'PDF',
  'CSV',
  'JSON',
  'UTC',
  'WMS',
  'MOD',
  'ID',
  'km²',
  'm³',
  'cm',
  'ha',
  'API'
];

function isAllowedMatch(val) {
  if (typeof val !== 'string') return true;
  const trimmed = val.trim();
  if (!trimmed) return true;
  // numbers or symbols only
  if (/^[\d\s.,\-+/%:•#()]+$/.test(trimmed)) return true;
  // If the English value is very short and equals an allowed acronym
  for (const term of ALLOWED_MATCH_TERMS) {
    if (trimmed.toUpperCase() === term.toUpperCase()) return true;
  }
  return false;
}

// Flatten an object into dot-notation paths
function flattenObject(obj, prefix = '') {
  const result = {};
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    const fullPath = prefix ? `${prefix}.${key}` : key;
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      Object.assign(result, flattenObject(val, fullPath));
    } else {
      result[fullPath] = val;
    }
  }
  return result;
}

const dictionaries = loadAllDictionaries();
const enFlat = flattenObject(dictionaries.en);
const totalEnKeys = Object.keys(enFlat).length;

console.log(`\n==================================================`);
console.log(`ELIM SPRINGS — 23-LANGUAGE STRICT TRANSLATION AUDIT`);
console.log(`Total canonical English keys: ${totalEnKeys}`);
console.log(`==================================================\n`);

const auditResults = [];

for (const code of ALL_CODES) {
  const dict = dictionaries[code];
  if (!dict) {
    auditResults.push({
      code,
      total: totalEnKeys,
      translated: 0,
      missing: totalEnKeys,
      englishFallback: 0,
      pct: '0.0%',
      missingKeys: Object.keys(enFlat),
      fallbackKeys: []
    });
    continue;
  }

  const flat = flattenObject(dict);
  let translatedCount = 0;
  let missingCount = 0;
  let fallbackCount = 0;
  const missingKeys = [];
  const fallbackKeys = [];

  for (const [keyPath, enVal] of Object.entries(enFlat)) {
    const val = flat[keyPath];
    if (val === undefined || val === null || val === '') {
      missingCount++;
      missingKeys.push(keyPath);
    } else if (code !== 'en' && val === enVal && !isAllowedMatch(enVal)) {
      fallbackCount++;
      fallbackKeys.push({ keyPath, val });
    } else {
      translatedCount++;
    }
  }

  const completionPct = code === 'en' ? 100 : ((translatedCount / totalEnKeys) * 100).toFixed(1);

  auditResults.push({
    code,
    total: totalEnKeys,
    translated: translatedCount,
    missing: missingCount,
    englishFallback: fallbackCount,
    pct: `${completionPct}%`,
    missingKeys,
    fallbackKeys
  });
}

console.log('| Language | Code | Keys | Translated | Missing | English Fallback | Completion % |');
console.log('|---|---|---|---|---|---|---|');
for (const res of auditResults) {
  console.log(`| ${res.code} | ${res.code} | ${res.total} | ${res.translated} | ${res.missing} | ${res.englishFallback} | ${res.pct} |`);
}

// Check if any fallbacks exist
const withIssues = auditResults.filter(r => r.code !== 'en' && (r.missing > 0 || r.englishFallback > 0));
console.log(`\nLanguages with missing or untranslated keys: ${withIssues.length}`);
for (const r of withIssues) {
  console.log(`\n--- [${r.code.toUpperCase()}] ---`);
  if (r.missingKeys.length > 0) {
    console.log(`  Missing (${r.missingKeys.length}):`, r.missingKeys.slice(0, 10).join(', ') + (r.missingKeys.length > 10 ? '...' : ''));
  }
  if (r.fallbackKeys.length > 0) {
    console.log(`  English Copies (${r.fallbackKeys.length}):`, r.fallbackKeys.slice(0, 5).map(f => `${f.keyPath}: "${f.val}"`).join(' | '));
  }
}
