import { translations } from './translations'

/**
 * Функция перевода текстов
 */
export function t(lang: string, key: keyof typeof translations.en): string {
  const language = (lang === 'ru' || lang === 'en') ? lang : 'en'
  return translations[language][key] || translations.en[key]
}
