import { create } from 'zustand';
import { Language, translations } from '../i18n/translations';

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations['pt-BR'];
}

const getInitialLanguage = (): Language => {
  try {
    const saved = localStorage.getItem('musicx_lang') as Language;
    if (saved === 'pt-BR' || saved === 'en') return saved;
  } catch {}
  return 'pt-BR'; // Padrão: pt-BR
};

const initialLang = getInitialLanguage();

export const useLanguageStore = create<LanguageState>((set) => ({
  language: initialLang,
  t: translations[initialLang],

  setLanguage: (lang: Language) => {
    try {
      localStorage.setItem('musicx_lang', lang);
    } catch {}
    set({
      language: lang,
      t: translations[lang]
    });
  }
}));
