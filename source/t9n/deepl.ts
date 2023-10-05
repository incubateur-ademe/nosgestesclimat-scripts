// require('isomorphic-fetch')
import deepl, { SourceLanguageCode, TargetLanguageCode } from 'deepl-node'

export const NO_TRANS_CHAR = ' '

const translator = new deepl.Translator(process.env.DEEPL_API_KEY)

const simpleLinkRe = new RegExp(/[^!]\[(?<txt>.*?)\]\((?<url>.*?)\)/g)
const imgInsideLinkRe = new RegExp(/\[(?<txt>!.*?\]\(.*?\))\]\((?<url>.*?)\)/g)

function escapeMarkdownLinks(str: string): string {
  const escape = (re, str, isImbricatedImgLink = false) => {
    const elements = str.matchAll(re)
    if (elements) {
      for (const el of elements) {
        let matchedStr = el[0].trim()
        if (isImbricatedImgLink || !matchedStr.startsWith('[!')) {
          str = str.replace(
            matchedStr,
            `<a href="${el.groups.url}">${el.groups.txt}</a>`,
          )
        }
      }
    }
    return str
  }

  str = escape(simpleLinkRe, str)
  str = escape(imgInsideLinkRe, str, true)
  return str
}

export async function fetchTranslationMarkdown(
  srcMd: string | string[],
  sourceLang: SourceLanguageCode,
  targetLang: TargetLanguageCode,
): Promise<string | string[]> {
  const escapedMd =
    srcMd instanceof Array
      ? srcMd.map(escapeMarkdownLinks)
      : escapeMarkdownLinks(srcMd)

  let trans = await fetchTranslation(escapedMd, sourceLang, targetLang)

  trans =
    trans instanceof Array
      ? trans.map((t) => t.replaceAll('&gt;', '>'))
      : trans.replaceAll('&gt;', '>')

  return trans
}

export async function fetchTranslation(
  text: string | string[],
  sourceLang: SourceLanguageCode,
  targetLang: TargetLanguageCode,
): Promise<string | string[]> {
  if (process.env.TEST_MODE) {
    const tradOrEmpty = (t) =>
      t === NO_TRANS_CHAR ? NO_TRANS_CHAR : '[TRAD] ' + t
    return text instanceof Array ? text.map(tradOrEmpty) : tradOrEmpty(text)
  }
  const glossary = await translator.getGlossary(
    'bfe1506b-b7e6-49c6-90f2-bcd4488ab270',
  )
  const resp = await translator.translateText(text, sourceLang, targetLang, {
    ignoreTags: ['ignore'],
    preserveFormatting: true,
    glossary,
    tagHandling: 'xml',
  })
  // here we replace html special character &amp; to & but it should be done for all characters.
  return resp instanceof Array
    ? resp.map((translation) => translation.text.replaceAll('&amp;', '&'))
    : resp.text.replaceAll('&amp;', '&')
}
