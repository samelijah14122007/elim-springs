# ==============================================================================
# ELIM SPRINGS — 23 CONSTITUTIONALLY SCHEDULED INDIAN LANGUAGES BUILDER
# SIH 2026 - PS 26015 | "From Field Voices to Watershed Action"
# Generates complete, authentic translations for all 23 languages
# ==============================================================================

import json
import os
import re

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(SCRIPT_DIR)
I18N_DIR = os.path.join(ROOT_DIR, 'src', 'i18n')

en = json.load(open(os.path.join(SCRIPT_DIR, 'en.json'), encoding='utf-8'))
hi = json.load(open(os.path.join(SCRIPT_DIR, 'hi.json'), encoding='utf-8'))

print("Base English and Hindi loaded.")
