import { camelCase, capitalize, kebabCase, snakeCase, lowerCase, startCase, upperCase } from 'lodash-es'
import { getContext, resolve, sleep } from '../utils/core.mjs'
import path from 'path'
import { globSync } from 'glob'
import fs from 'fs'

const { __name, require } = getContext(import.meta.url)
const cases = {
  camelCase,
  capitalize,
  kebabCase,
  snakeCase,
  lowerCase,
  startCase,
  upperCase,
  lowerSnakeCase: (s) => ((snakeCase(s)).toLowerCase()),
  none: s => s
}

function renameOne(file, sourceDir, tmpDir, c) {
  const relative = path.relative(sourceDir, file)
  const stat = fs.statSync(file)
  const isFile = stat.isFile()
  if (!isFile) return;
  const method = cases[c] || cases['none']

  let targetFile = path.join(tmpDir, relative)

  if (isFile) {
    const ext = path.extname(targetFile)
    const basename = path.basename(targetFile, ext)
    const dir = path.dirname(targetFile)
    let newName = `${method(basename)}${ext}`
    targetFile = path.join(dir, newName)
  }

  fs.cpSync(file, targetFile, {
    'recursive': true
  })
}



/**
 * @param {import('yargs').Argv} yargs
 * @param {import('consola').Consola} consola
 */
export default function (yargs, consola) {
  return yargs.command(
    `${__name} [source] [target]`,
    'rename files',
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
        .option('case', {
          alias: 'c',
          type: 'string',
          default: 'lowerSnakeCase',
          description: 'case',
        })
        .option('replace', {
          alias: 'r',
          type: 'boolean',
          default: true,
          description: 'replace',
        })
        .demandOption(['source']),
    async argv => {
      const sourceDir = resolve(argv.source)
      let targetDir = argv.target

      if (!targetDir) {
        if (argv.replace) {
          targetDir = sourceDir
        } else {
          targetDir = path.join(sourceDir, 'output')
        }
      }

      const tmpDir = path.join('/tmp', '__ms_rename__')

      if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true })
      }

      const files = globSync(path.join(sourceDir, '**/*'))

      for (const file of files) {
        await renameOne(file, sourceDir, tmpDir, argv.case)
      }

      if (argv.replace) {
        fs.rmSync(sourceDir, { recursive: true, force: true })
      }
      await sleep(200)

      if (fs.existsSync(targetDir)) {
        fs.rmSync(targetDir, { recursive: true, force: true })
      }

      fs.cpSync(tmpDir, targetDir, { recursive: true, force: true })

      if (fs.existsSync(tmpDir)) {
        fs.rmSync(tmpDir, { recursive: true })
      }

      console.log(`SOURCE_DIR=${sourceDir}, TARGET_DIR=${targetDir}`)
    }
  )
}
