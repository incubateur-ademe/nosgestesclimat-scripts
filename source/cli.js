/*
	Utils functions for parsing command line arguments via yargs.
*/

const yargs = require('yargs')
const prompt = require('prompt-sync')()
const c = require('ansi-colors')

const utils = require('./utils')

const printErr = (message) => console.error(c.red(message))
const printWarn = (message) => console.warn(c.yellow(message))
const printInfo = (message) => console.log(c.cyan(message))

const printChecksResultTableHeader = (markdown) => {
  if (markdown) {
    console.log(`| Language | Nb. missing translations | Status |`)
    console.log(`|:--------:|:-------------------------|:------:|`)
  }
}

const printChecksResult = (
  nbMissing,
  missingRuleNames,
  what,
  destLang,
  markdown
) => {
  if (nbMissing > 0) {
    console.log(
      markdown
        ? `| _${destLang}_ | <details><summary>Missing ${nbMissing} ${what} :arrow_down:</summary><ul>${missingRuleNames.join(
            ' '
          )}</ul></details> | :x: |`
        : `❌ Missing ${c.red(nbMissing)} ${what} translations for ${c.yellow(
            destLang
          )}!`
    )
  } else {
    console.log(
      markdown
        ? `| _${destLang}_ | Ø | :heavy_check_mark: |`
        : `✅ The ${what} translation are up to date for ${c.yellow(destLang)}`
    )
  }
}

// TODO:
// - switch to typescript in order to specify the type of opts
// - could be cleaner
const getArgs = (description, opts) => {
  let args = yargs.usage(`${description}\n\nUsage: node $0 [options]`)

  if (opts.source) {
    args = args.option('source', {
      alias: 's',
      type: 'string',
      default: utils.defaultLang,
      choices: utils.availableLanguages,
      description: `The source language to translate from.`
    })
  }
  if (opts.force) {
    args = args.option('force', {
      alias: 'f',
      type: 'boolean',
      description:
        'Force translation of all the keys. Its overwrites the existing translations.'
    })
  }
  if (opts.file) {
    args = args.option('file', {
      alias: 'p',
      type: 'string',
      description:
        opts.file.description ??
        `The source file to translate from the 'locales/pages' directory. If not specified, all the files in 'locales/pages' will be translated.`
    })
  }
  if (opts.remove) {
    args = args.option('remove', {
      alias: 'r',
      type: 'boolean',
      description: `Remove the unused keys from the translation files.`
    })
  }
  if (opts.target) {
    args = args.option('target', {
      alias: 't',
      type: 'string',
      array: true,
      choices: utils.availableLanguages,
      description: 'The target language(s) to translate into.'
    })
  }
  if (opts.model) {
    args = args.option('model', {
      alias: 'o',
      type: 'string',
      array: true,
      choices: opts.model.supportedRegionCodes,
      description: 'The region code model.'
    })
  }
  if (opts.markdown) {
    args = args.option('markdown', {
      alias: 'm',
      type: 'boolean',
      description: 'Prints the result in a Markdown table format.'
    })
  }
  if (opts.onlyUpdateLocks) {
    args = args.option('only-update-locks', {
      alias: 'u',
      type: 'boolean',
      description: 'Only update the lock attributes, do not translate.'
    })
  }
  if (opts.interactiveMode) {
    args = args.option('interactive-mode', {
      alias: 'i',
      type: 'boolean',
      description:
        'Launch the interactive mode, to translate one rule at a time with the possibility to only update the lock attributes.'
    })
  }
  if (opts.optimCanBeDisabled) {
    args = args.option('no-optim', {
      alias: 'n',
      type: 'boolean',
      description: 'Disable the optimization pass.'
    })
  }

  const argv = args.help().alias('help', 'h').argv

  const srcLang = argv.source ?? utils.defaultLang

  if (!utils.availableLanguages.includes(srcLang)) {
    printErr(`ERROR: the language '${srcLang}' is not supported.`)
    process.exit(-1)
  }

  const destLangs = (argv.target ?? utils.availableLanguages).filter((l) => {
    return l !== srcLang
  })

  const destRegions = argv.model ?? opts?.model?.supportedRegionCodes

  return {
    ...argv,
    srcLang,
    destLangs:
      !argv.target && opts.target === 'all'
        ? utils.availableLanguages
        : destLangs,
    destRegions,
    srcFile: argv.file ?? opts.defaultSrcFile
  }
}

const exitIfError = (error, msg = undefined, progressBar = undefined) => {
  if (error) {
    if (msg) {
      printErr(msg)
    }
    printErr(error)
    if (progressBar) {
      progressBar.stop()
    }
    process.exit(-1)
  }
}

const styledRuleNameWithOptionalAttr = (ruleName, attr) =>
  `${c.magenta(ruleName)}${
    attr !== undefined ? ` ${c.dim('>')} ${c.yellow(attr)}` : ''
  }`

const styledPromptAction = (action) =>
  `[${action[0]}]${c.dim(action.substring(1))}`

const styledPromptActions = (actions, sep = ' ') =>
  actions.map((action) => styledPromptAction(action)).join(sep)

const ask = (question, actions) => {
  return prompt(`${question} (${styledPromptActions(actions)}) `)
}
const askYesNo = (question) => {
  return 'y' === ask(question, ['yes', 'no'])
}

module.exports = {
  ask,
  exitIfError,
  getArgs,
  printErr,
  printWarn,
  printInfo,
  printChecksResult,
  printChecksResultTableHeader,
  styledRuleNameWithOptionalAttr,
  styledPromptAction,
  styledPromptActions,
  askYesNo
}
