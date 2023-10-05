import { format, resolveConfig } from 'prettier'
import { parse, ParseOptions, stringify } from 'yaml'
import { readFileSync, writeFileSync } from 'fs'

export function readYAML(path: string): object {
  return parse(readFileSync(path, 'utf-8'))
}

export function writeYAML(
  path: string,
  content: string,
  blockQuote = 'literal',
  sortMapEntries: boolean,
) {
  resolveConfig(process.cwd()).then((prettierConfig) =>
    format(
      stringify(content, {
        sortMapEntries,
        aliasDuplicateObjects: false,
        blockQuote,
        lineWidth: 0,
      } as ParseOptions),
      { ...prettierConfig, parser: 'yaml' },
    ).then((formatted) => writeFileSync(path, formatted)),
  )
}
