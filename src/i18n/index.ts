// ==============================================================================
// ELIM SPRINGS — APPLICATION-WIDE 23-LANGUAGE I18N SERVICE & CONTEXT
// SIH 2026 - PS 26015 | "From Field Voices to Watershed Action"
// ==============================================================================

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { LanguageCode } from '../types';
import { translations, TranslationSchema } from './translations';
import {
  ALL_INDIAN_LANGUAGES,
  APP_SUPPORTED_LANGUAGES,
  IndianLanguageDefinition,
  getLanguageDefinition,
  isRtlLanguage,
} from './languages';

export type TranslationDictionary = TranslationSchema;
export { ALL_INDIAN_LANGUAGES, APP_SUPPORTED_LANGUAGES, getLanguageDefinition, isRtlLanguage };
export type { IndianLanguageDefinition, LanguageCode };

const STORAGE_KEY = 'elim_springs_language';

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (path: string, optionsOrFallback?: Record<string, any> | string, fallback?: string) => string;
  dict: TranslationDictionary;
  languageInfo: IndianLanguageDefinition;
  isRtl: boolean;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (path: string, optionsOrFallback?: any, fallback?: string) => {
    if (typeof optionsOrFallback === 'string') return optionsOrFallback;
    return fallback || path;
  },
  dict: translations.en,
  languageInfo: ALL_INDIAN_LANGUAGES[0],
  isRtl: false,
});

/**
 * Helper to traverse nested keys like "dashboard.openCases"
 */
function getNestedValue(obj: any, path: string): string | undefined {
  if (!obj) return undefined;
  const parts = path.split('.');
  let current = obj;
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return undefined;
    }
  }
  return typeof current === 'string' ? current : undefined;
}

/**
 * Interpolation helper for dynamic strings like "{count} Open Cases"
 */
function interpolate(template: string, params?: Record<string, any>): string {
  if (!params || typeof template !== 'string') return template;
  return Object.keys(params).reduce((str, key) => {
    return str.replace(new RegExp(`\\{${key}\\}`, 'g'), String(params[key]));
  }, template);
}

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = window.localStorage.getItem(STORAGE_KEY) as LanguageCode;
        if (saved && translations[saved]) {
          return saved;
        }
      }
    } catch {
      // Ignore in non-browser or sandbox environments
    }
    return 'en';
  });

  const isRtl = useMemo(() => isRtlLanguage(language), [language]);
  const languageInfo = useMemo(() => getLanguageDefinition(language), [language]);

  // Synchronize document direction and lang attributes on HTML tag
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
      document.documentElement.lang = language;
      if (isRtl) {
        document.body.classList.add('rtl-mode');
      } else {
        document.body.classList.remove('rtl-mode');
      }
    }
  }, [language, isRtl]);

  const setLanguage = (lang: LanguageCode) => {
    if (translations[lang]) {
      setLanguageState(lang);
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(STORAGE_KEY, lang);
        }
      } catch {
        // Ignore
      }
    }
  };

  const currentDict = useMemo(() => {
    return translations[language] || translations.en;
  }, [language]);

  const t = (
    path: string,
    optionsOrFallback?: Record<string, any> | string,
    fallback?: string
  ): string => {
    let params: Record<string, any> | undefined;
    let defaultFallback: string | undefined = fallback;

    if (typeof optionsOrFallback === 'string') {
      defaultFallback = optionsOrFallback;
    } else if (typeof optionsOrFallback === 'object') {
      params = optionsOrFallback;
    }

    // 1. Try selected language dictionary
    const val = getNestedValue(currentDict, path);
    if (val !== undefined) {
      return interpolate(val, params);
    }

    // 2. Fall back to English dictionary with warning in development
    const enVal = getNestedValue(translations.en, path);
    if (enVal !== undefined) {
      const isDev = typeof import.meta !== 'undefined' && import.meta.env?.DEV;
      if (isDev && language !== 'en') {
        console.warn(`[i18n missing key in '${language}']: ${path}`);
      }
      return interpolate(enVal, params);
    }

    // 3. Fall back to supplied fallback string or leaf path
    const finalFallback = defaultFallback !== undefined ? defaultFallback : path.split('.').pop() || path;
    return interpolate(finalFallback, params);
  };

  return React.createElement(
    LanguageContext.Provider,
    { value: { language, setLanguage, t, dict: currentDict, languageInfo, isRtl } },
    children
  );
};

export const useLanguage = () => useContext(LanguageContext);
export const useTranslation = () => {
  const { t, language, setLanguage, dict, languageInfo, isRtl } = useContext(LanguageContext);
  return { t, language, setLanguage, dict, languageInfo, isRtl };
};

/**
 * Direct lookup function for non-React contexts
 */
export const translateString = (
  path: string,
  lang: LanguageCode = 'en',
  optionsOrFallback?: Record<string, any> | string,
  fallback?: string
): string => {
  const d = translations[lang] || translations.en;
  let params: Record<string, any> | undefined;
  let defaultFallback: string | undefined = fallback;

  if (typeof optionsOrFallback === 'string') {
    defaultFallback = optionsOrFallback;
  } else if (typeof optionsOrFallback === 'object') {
    params = optionsOrFallback;
  }

  const val = getNestedValue(d, path) || getNestedValue(translations.en, path);
  if (val !== undefined) return interpolate(val, params);
  return interpolate(defaultFallback || path.split('.').pop() || path, params);
};

export default {
  LanguageProvider,
  useLanguage,
  useTranslation,
  translateString,
  ALL_INDIAN_LANGUAGES,
  APP_SUPPORTED_LANGUAGES,
};
