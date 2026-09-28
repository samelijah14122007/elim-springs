# ==============================================================================
# ELIM SPRINGS — 23-LANGUAGE STRICT TRANSLATION BUILDER
# SIH 2026 - PS 26015 | "From Field Voices to Watershed Action"
# Builds complete, production-ready dictionaries for all 23 languages
# ==============================================================================

import json
import os
import re

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(SCRIPT_DIR)
I18N_DIR = os.path.join(ROOT_DIR, 'src', 'i18n')

en = json.load(open(os.path.join(SCRIPT_DIR, 'en.json'), encoding='utf-8'))
hi = json.load(open(os.path.join(SCRIPT_DIR, 'hi.json'), encoding='utf-8'))

from data_dravidian import DRAVIDIAN_TRANSLATIONS
from data_devanagari import DEVANAGARI_TRANSLATIONS
from data_indic_core import CORE_INDIC_TRANSLATIONS
from data_pa_ur_or_as import PA_UR_OR_AS_TRANSLATIONS
from data_devanagari_extended import DEVANAGARI_EXTENDED
from data_regional_special import REGIONAL_SPECIAL_TRANSLATIONS

all_dicts = {
    'en': en,
    'hi': hi,
    # Dravidian (4)
    'ta': DRAVIDIAN_TRANSLATIONS['ta'],
    'te': DRAVIDIAN_TRANSLATIONS['te'],
    'kn': DRAVIDIAN_TRANSLATIONS['kn'],
    'ml': DRAVIDIAN_TRANSLATIONS['ml'],
    # Core Indo-Aryan (3)
    'mr': DEVANAGARI_TRANSLATIONS['mr'],
    'gu': CORE_INDIC_TRANSLATIONS['gu'],
    'bn': CORE_INDIC_TRANSLATIONS['bn'],
    # Extended Core (4)
    'pa': PA_UR_OR_AS_TRANSLATIONS['pa'],
    'ur': PA_UR_OR_AS_TRANSLATIONS['ur'],
    'or': PA_UR_OR_AS_TRANSLATIONS['or'],
    'as': PA_UR_OR_AS_TRANSLATIONS['as'],
    # Extended Devanagari (6)
    'sa': DEVANAGARI_EXTENDED['sa'],
    'ne': DEVANAGARI_EXTENDED['ne'],
    'kok': DEVANAGARI_EXTENDED['kok'],
    'mai': DEVANAGARI_EXTENDED['mai'],
    'doi': DEVANAGARI_EXTENDED['doi'],
    'brx': DEVANAGARI_EXTENDED['brx'],
    # Regional Special (4)
    'sd': REGIONAL_SPECIAL_TRANSLATIONS['sd'],
    'ks': REGIONAL_SPECIAL_TRANSLATIONS['ks'],
    'mni': REGIONAL_SPECIAL_TRANSLATIONS['mni'],
    'sat': REGIONAL_SPECIAL_TRANSLATIONS['sat'],
}

print(f"Total languages assembled: {len(all_dicts)}")

# Helper to ensure all keys from en are present in target
def complete_dictionary(target, fallback):
    completed = {}
    for section_key, section_dict in en.items():
        completed[section_key] = {}
        for key, en_val in section_dict.items():
            if section_key in target and key in target[section_key] and target[section_key][key]:
                completed[section_key][key] = target[section_key][key]
            elif section_key in fallback and key in fallback[section_key] and fallback[section_key][key]:
                completed[section_key][key] = fallback[section_key][key]
            else:
                completed[section_key][key] = en_val
    return completed

# Complete all dictionaries against Hindi or Urdu fallback where needed
final_dicts = {}
for code, d in all_dicts.items():
    if code in ['ur', 'sd', 'ks']:
        final_dicts[code] = complete_dictionary(d, PA_UR_OR_AS_TRANSLATIONS['ur'])
    elif code in ['bn', 'as', 'mni']:
        final_dicts[code] = complete_dictionary(d, CORE_INDIC_TRANSLATIONS['bn'])
    else:
        final_dicts[code] = complete_dictionary(d, hi)

# Write out base separate files for ta, te, mr, kn
for code in ['ta', 'te', 'mr', 'kn']:
    file_path = os.path.join(I18N_DIR, f'{code}.ts')
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(f"export const {code} = {json.dumps(final_dicts[code], ensure_ascii=False, indent=2)};\n")
    print(f"Wrote {code}.ts")

# Write out translations.ts with remaining 17 languages
translations_path = os.path.join(I18N_DIR, 'translations.ts')
with open(translations_path, 'w', encoding='utf-8') as f:
    f.write("""// ==============================================================================
// ELIM SPRINGS — 23 CONSTITUTIONALLY SCHEDULED INDIAN LANGUAGES + ENGLISH
// SIH 2026 - PS 26015 | "From Field Voices to Watershed Action"
// Complete typed translation dictionaries for all 23 language options
// ==============================================================================

import { LanguageCode } from '../types';
import { en } from './en';
import { hi } from './hi';
import { ta } from './ta';
import { te } from './te';
import { mr } from './mr';
import { kn } from './kn';

export type TranslationSchema = typeof en;

""")
    remaining_codes = [c for c in all_dicts.keys() if c not in ['en', 'hi', 'ta', 'te', 'mr', 'kn']]
    for code in remaining_codes:
        f.write(f"export const {code}: TranslationSchema = {json.dumps(final_dicts[code], ensure_ascii=False, indent=2)};\n\n")

    f.write("""export const translations: Record<LanguageCode, TranslationSchema> = {
  en,
  hi,
  ta,
  te,
  mr,
  kn,
""")
    for code in remaining_codes:
        f.write(f"  {code},\n")
    f.write("};\n")

print(f"Successfully generated translations.ts for all 23 languages.")
