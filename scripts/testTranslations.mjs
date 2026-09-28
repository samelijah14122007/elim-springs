// ==============================================================================
// Build All 23 Indian Language Dictionaries for ELIM SPRINGS
// Generates src/i18n/translations.ts
// ==============================================================================

import fs from 'fs';
import path from 'path';
import { en } from '../src/i18n/en.js';
import { hi } from '../src/i18n/hi.js';

// We will construct translations.ts directly
