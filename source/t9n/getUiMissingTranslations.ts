import { existsSync, writeFileSync } from 'fs'
import { readYAML, LOCK_KEY_EXT, isI18nKey } from '..'

export function getUiMissingTranslations(
  sourcePath: string,
  targetPath: string,
  override = false,
): [string, string][] {
  if (!existsSync(targetPath) || override) {
    console.log(`Creating ${targetPath}`)
    writeFileSync(targetPath, '{}')
  }

  const freshEntries: Record<string, string> = readYAML(sourcePath)['entries']
  const translatedEntries: Record<string, string> =
    readYAML(targetPath)['entries']

  const missingTranslations = Object.entries(freshEntries).filter(
    ([freshKey, refVal]) => {
      if (freshKey.match(/^\{.*\}$/)) {
        // Skip keys of the form '{<str>}' as they are not meant to be translated
        return false
      }
      return (
        // missing translation
        !translatedEntries[freshKey] ||
        // reference value updated
        (isI18nKey(freshKey) &&
          refVal !== translatedEntries[freshKey + LOCK_KEY_EXT])
      )
    },
  )

  return missingTranslations
}
