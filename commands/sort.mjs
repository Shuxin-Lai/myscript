import { getContext, resolve } from '../utils/core.mjs'
import path from 'path'
import { globSync } from 'glob'
import sortObj from 'sort-object'
import fs from 'fs'

const { __name, require } = getContext(import.meta.url)

function sortOne(file, targetDir) {
  const json = require(file)
  console.log('json: ', json)
  const res = sortObj(json)
  const basename = path.basename(file)

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir)
  }

  fs.writeFileSync(path.join(targetDir, basename), JSON.stringify(res, null, 2))
}
/**
 * @param {import('yargs').Argv} yargs
 * @param {import('consola').Consola} consola
 */
export default function (yargs, consola) {
  return yargs.command(
    `${__name} [source] [target]`,
    'sort json files',
    yargs =>
      yargs
        .positional('source', {
          alias: 's',
          type: 'string',
        })
        .positional('target', {
          alias: 't',
          type: 'string',
        })
        .option('replace', {
          alias: 'r',
          type: 'boolean',
          default: true,
          description: 'replace',
        })
        .demandOption(['source']),
    argv => {
      const sourceDir = resolve(argv.source)
      let targetDir = argv.target
      if (!targetDir) {
        if (argv.replace) {
          targetDir = sourceDir
        } else {
          targetDir = path.join(sourceDir, 'output')
        }
      }

      const fileList = globSync(path.join(sourceDir, '**/*.{json,JSON}'))

      for (const file of fileList) {
        sortOne(file, targetDir)
      }
      console.log(`SOURCE_DIR=${sourceDir}, TARGET_DIR=${targetDir}`)
    }
  )
}
