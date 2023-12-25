import yargs from 'yargs'
import fs from 'fs'
import { getContext, resolve } from '../utils/core.mjs'
import path from 'path'
import { globSync } from 'glob'
import { merge } from 'lodash-es'

const { __name } = getContext(import.meta.url)

function handle(sourceDir, outputDir, defaultFile) {
  const sourceFiles = globSync(path.resolve(sourceDir, '*.json'))
  const targetFiles = sourceFiles.filter(file => file != defaultFile)
  const defaultContent = JSON.parse(fs.readFileSync(defaultFile, 'utf-8'))

  for (const file of targetFiles) {
    const name = path.basename(file)
    const content = JSON.parse(fs.readFileSync(file, 'utf-8'))
    const newContent = merge(defaultContent, content)
    fs.writeFileSync(
      path.resolve(outputDir, name),
      JSON.stringify(newContent, null, 2)
    )
  }
}

/**
 * @param { yargs } yargs
 * @param { import('consola').ConsolaInstance } consola
 */
export default function (yargs, consola) {
  return yargs.command(
    `${__name} [source] [default_file]`,
    `merge n files`,
    yargs =>
      yargs
        .positional('source', {
          alias: 's',
          type: 'string',
        })
        .positional('default_file', {
          alias: 'df',
          type: 'string',
        })
        .option('replace', {
          alias: 'r',
          type: 'boolean',
          default: true,
          description: 'replace',
        })
        .option('output', {
          alias: 'o',
          type: 'string',
          description: 'output dir',
        })
        .demandOption(['source', 'default_file']),
    argv => {
      // check file
      const s = resolve(argv.source)
      const d = resolve(argv.default_file)
      let o = s
      if (argv.output) {
        o = resolve(argv.output)
      }
      consola.debug('source', s)
      consola.debug('default_file', d)
      consola.debug('output', o)

      if (!fs.existsSync(s)) {
        consola.error('source not found')
        return
      }

      if (!fs.existsSync(d)) {
        consola.error('default_file not found')
        return
      }

      handle(s, o, d)
    }
  )
}
