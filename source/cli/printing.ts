import { colors } from './colors'

export const withStyle = (colorCode: string, text: string): string =>
  `${colorCode}${text}${colors.reset}`
export const printErr = (message: string) =>
  console.error(withStyle(colors.fgRed, message))
export const printWarn = (message: string) =>
  console.warn(withStyle(colors.fgYellow, message))
export const printInfo = (message: string) =>
  console.log(withStyle(colors.fgCyan, message))

export const yellow = (str: any) => withStyle(colors.fgYellow, str)
export const red = (str: any) => withStyle(colors.fgRed, str)
export const green = (str: any) => withStyle(colors.fgGreen, str)
export const magenta = (str: any) => withStyle(colors.fgMagenta, str)
export const dim = (str: any) => withStyle(colors.dim, str)
export const italic = (str: any) => withStyle(colors.italic, str)

export function printChecksResultTableHeader(markdown: boolean) {
  if (markdown) {
    console.log(`| Language | Nb. missing translations | Status |`)
    console.log(`|:--------:|:-------------------------|:------:|`)
  }
}

export function printChecksResult(
  nbMissing: number,
  missingRuleNames: string[],
  what: string,
  destLang: string,
  markdown: boolean,
) {
  if (nbMissing > 0) {
    console.log(
      markdown
        ? `| _${destLang}_ | <details><summary>Missing ${nbMissing} ${what} :arrow_down:</summary><ul>${missingRuleNames.join(
            ' ',
          )}</ul></details> | :x: |`
        : `❌ Missing ${red(nbMissing)} ${what} translations for ${yellow(
            destLang,
          )}!`,
    )
  } else {
    console.log(
      markdown
        ? `| _${destLang}_ | Ø | :heavy_check_mark: |`
        : `✅ The ${what} translation are up to date for ${yellow(destLang)}`,
    )
  }
}
