import { ref, computed } from 'vue';
import { translations, type TranslationKey } from '../i18n/translations';
import type { Language } from '../types/painting';

const currentLanguage = ref<Language>(
  (localStorage.getItem('gururi_lang') as Language) || 'es'
);

export function useI18n() {
  function setLanguage(lang: Language) {
    currentLanguage.value = lang;
    localStorage.setItem('gururi_lang', lang);
  }

  function t(key: TranslationKey): string {
    const dict = translations[currentLanguage.value] || translations.es;
    return dict[key] || translations.es[key] || key;
  }

  return {
    currentLanguage: computed(() => currentLanguage.value),
    setLanguage,
    t
  };
}
