require('isomorphic-fetch')
const deepl = require('deepl-node')

const NO_TRANS_CHAR = ' '

const translator = new deepl.Translator(process.env.DEEPL_API_KEY)

const simpleLinkRe = new RegExp(/[^!]\[(?<txt>.*?)\]\((?<url>.*?)\)/g)
const imgInsideLinkRe = new RegExp(/\[(?<txt>!.*?\]\(.*?\))\]\((?<url>.*?)\)/g)

const escapeMarkdownLinks = (str) => {
  const escape = (re, str, isImbricatedImgLink = false) => {
    const elements = str.matchAll(re)
    if (elements) {
      for (el of elements) {
        let matchedStr = el[0].trim()
        if (isImbricatedImgLink || !matchedStr.startsWith('[!')) {
          str = str.replace(
            matchedStr,
            `<a href="${el.groups.url}">${el.groups.txt}</a>`
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

function normalizeLang(lang) {
  if (lang.toUpperCase() === 'EN') {
    return 'en-GB'
  }
  return lang
}

async function fetchTranslationMarkdown(srcMd, sourceLang, targetLang) {
  const escapedMd =
    srcMd instanceof Array
      ? srcMd.map(escapeMarkdownLinks)
      : escapeMarkdownLinks(srcMd)

  var trans = await fetchTranslation(
    escapedMd,
    normalizeLang(sourceLang),
    normalizeLang(targetLang)
  )

  trans = trans.replaceAll('&gt;', '>')

  return trans
}

async function fetchTranslation(text, sourceLang, targetLang) {
  if (process.env.TEST_MODE) {
    const tradOrEmpty = (t) =>
      t === NO_TRANS_CHAR ? NO_TRANS_CHAR : '[TRAD] ' + t
    return text instanceof Array ? text.map(tradOrEmpty) : tradOrEmpty(text)
  }

  // to get the glossary id, use the script `deepl-glossary.js`

  let glossary = ''
  switch (targetLang) {
    case 'en':
      glossary = await translator.getGlossary(
        '18d732e6-f33b-4091-adb0-4efb58b70692'
      )
      break
    case 'es':
      glossary = await translator.getGlossary(
        '4f611960-852f-433e-8563-2a49385f9ff8'
      )
      break
  }

  const resp = await translator.translateText(
    text,
    normalizeLang(sourceLang),
    normalizeLang(targetLang),
    {
      ignoreTags: ['ignore'],
      preserveFormatting: true,
      glossary,
      tagHandling: 'xml'
    }
  )
  // here we replace html special character &amp; to & but it should be done for all characters.
  return resp instanceof Array
    ? resp.map((translation) => translation.text.replaceAll('&amp;', '&'))
    : resp.text.replaceAll('&amp;', '&')
}

module.exports = {
  fetchTranslation,
  fetchTranslationMarkdown
}
