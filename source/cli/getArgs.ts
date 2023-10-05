import yargs from 'yargs'
import { availableLanguages, defaultLang } from '../constants'
import { printErr } from './printing'

export type Opts<T> = {
  description?: string
  alias?: string
  name?: string
  type?: 'string' | 'boolean' | 'number' | 'array'
  default?: T
  choices?: T[]
  array?: boolean
}

export type Args = {
  source?: Opts<string>
  force?: Opts<boolean>
  file?: Opts<string>
  remove?: Opts<boolean>
  target?: Opts<string>
  model?: Opts<string> & { supportedRegionCodes: string[] }
  markdown?: Opts<boolean>
  onlyUpdateLocks?: Opts<boolean>
  interactiveMode?: Opts<boolean>
}

const defaultOpts: Args = {
  source: {
    name: 'source',
    alias: 's',
    type: 'string',
    default: defaultLang,
    choices: availableLanguages,
    description: 'The source language to translate from.',
  },
  force: {
    name: 'force',
    alias: 'f',
    type: 'boolean',
    description:
      'Force translation of all the keys. Its overwrites the existing translations.',
  },
  file: {
    name: 'file',
    alias: 'p',
    type: 'string',
    description: `The source file to translate from the 'locales/pages' directory. If not specified, all the files in 'locales/pages' will be translated.`,
  },
  remove: {
    name: 'remove',
    alias: 'r',
    type: 'boolean',
    description: `Remove the unused keys from the translation files.`,
  },
  target: {
    name: 'target',
    alias: 't',
    type: 'string',
    array: true,
    choices: availableLanguages,
    description: 'The target language(s) to translate into.',
  },
  model: {
    name: 'model',
    alias: 'o',
    type: 'string',
    array: true,
    description: 'The region code model.',
    supportedRegionCodes: [],
  },
  markdown: {
    name: 'markdown',
    alias: 'm',
    type: 'boolean',
    description: 'Prints the result in a Markdown table format.',
  },
  onlyUpdateLocks: {
    name: 'only-update-locks',
    alias: 'u',
    type: 'boolean',
    description: 'Only update the lock attributes, do not translate.',
  },
  interactiveMode: {
    name: 'interactive-mode',
    alias: 'i',
    type: 'boolean',
    description: `Launch the interactive mode, to translate one rule at a time with the possibility to only update the lock attributes.`,
  },
}

export function getArgs(
  description: string,
  opts?: Args & { defaultSrcFile?: string },
) {
  let args = yargs.usage(`${description}\n\nUsage: node $0 [options]`)
  Object.entries(opts).forEach(([name, opt]) => {
    if (typeof opt === 'object') {
      args = args.option(name, {
        ...defaultOpts[name],
        ...opt,
      })
    } else if (name !== 'defaultSrcFile') {
      args = args.option(name, defaultOpts[name])
    }
  })

  const argv = args.help().alias('help', 'h').argv

  const srcLang = argv.source ?? defaultLang

  if (!availableLanguages.includes(srcLang)) {
    printErr(`ERROR: the language '${srcLang}' is not supported.`)
    process.exit(-1)
  }

  const destLangs = (argv.target ?? availableLanguages).filter((l: string) => {
    return l !== srcLang
  })

  const destRegions = argv.model ?? opts?.model?.supportedRegionCodes

  const srcFile = argv.file ?? opts.defaultSrcFile

  return {
    srcLang,
    destLangs: !argv.target ? availableLanguages : destLangs,
    destRegions,
    force: argv.force,
    remove: argv.remove,
    srcFile,
    markdown: argv.markdown,
    onlyUpdateLocks: argv.onlyUpdateLocks,
    interactiveMode: argv.interactiveMode,
  }
}
