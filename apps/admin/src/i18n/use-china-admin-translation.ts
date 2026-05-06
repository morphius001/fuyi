import { useTranslation } from "react-i18next"

import en from "./en.json"
import zhCN from "./zh-CN.json"

type TranslationTree = Record<string, unknown>
type TranslationValues = Record<string, string | number | boolean | null | undefined>

const bundles = {
  en,
  zhCN,
}

const getNestedValue = (source: TranslationTree, key: string) => {
  return key.split(".").reduce<unknown>((value, segment) => {
    if (!value || typeof value !== "object") {
      return undefined
    }

    return (value as TranslationTree)[segment]
  }, source)
}

const normalizeLanguage = (language?: string) => {
  if (language?.startsWith("en")) {
    return "en"
  }

  return "zhCN"
}

export const translateChinaAdminKey = (key: string, language?: string) => {
  const languageKey = normalizeLanguage(language)
  const localized = getNestedValue(bundles[languageKey], key)
  const fallback = getNestedValue(bundles.zhCN, key)
  const value = localized ?? fallback

  return typeof value === "string" ? value : key
}

const interpolateTranslation = (value: string, values?: TranslationValues) => {
  if (!values) {
    return value
  }

  return Object.entries(values).reduce((result, [name, replacement]) => {
    return result.replaceAll(`{{${name}}}`, String(replacement ?? ""))
  }, value)
}

export const useChinaAdminTranslation = () => {
  const { t: baseT, i18n } = useTranslation()

  return {
    i18n,
    t: (key: string, values?: TranslationValues) => {
      const translated = baseT(key, values)
      const localTranslated = translateChinaAdminKey(key, i18n.language)

      if (key.startsWith("chinaAdmin.") && localTranslated !== key) {
        return interpolateTranslation(localTranslated, values)
      }

      return translated === key ? interpolateTranslation(localTranslated, values) : translated
    },
  }
}
