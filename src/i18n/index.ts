import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './en.json';
import vi from './vi.json';

export const LANGUAGE_STORAGE_KEY = 'dialuna.lang';

export type AppLanguage = 'en' | 'vi';

function deviceLanguage(): AppLanguage {
  const code = getLocales()[0]?.languageCode;
  return code === 'vi' ? 'vi' : 'en';
}

export async function initI18n(): Promise<void> {
  if (i18n.isInitialized) return;
  let lng = deviceLanguage();
  try {
    const saved = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (saved === 'en' || saved === 'vi') lng = saved;
  } catch {
    // fall back to device language
  }
  await i18n.use(initReactI18next).init({
    resources: {
      en: { translation: en },
      vi: { translation: vi },
    },
    lng,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });
}

export async function setAppLanguage(lng: AppLanguage): Promise<void> {
  await i18n.changeLanguage(lng);
  try {
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lng);
  } catch {
    // persistence is best-effort
  }
}

export default i18n;
