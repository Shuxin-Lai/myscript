import { getContext, resolve } from '../utils/core.mjs'
import quicktype from 'quicktype'
import { globSync } from 'glob'
import fs from 'fs'
import path from 'path'
import { camelCase, snakeCase, startCase } from 'lodash-es'

const { __name } = getContext(import.meta.url)

/**
 * @param {import('yargs').Argv} yargs
 * @param {import('consola').Consola} consola
 */
export default function (yargs, consola) {
  return yargs.command(
    `${__name} [src] [dest]`,
    'json to dart',
    yargs =>
      yargs
        .positional('src', {
          describe: 'src',
          type: 'string',
          description: 'src',
        })
        .positional('dir', {
          describe: 'dir',
          type: 'string',
          description: 'dir',
        })
        .option('exclude', {
          alias: 'e',
          type: 'string',
          description: 'exclude',
        })
        .option('replace', {
          alias: 'r',
          type: 'boolean',
          description: 'replace',
        })
        .demandOption(['src', 'dest']),
    async argv => {
      argv.src = resolve(argv.src)
      argv.dest = resolve(argv.dest)

      if (!fs.existsSync(argv.src)) {
        consola.error(`src ${argv.src} not exists`)
        return
      }

      if (!fs.existsSync(argv.dest)) {
        fs.mkdirSync(argv.dest)
      } else {
        if (argv.replace) {
          fs.rmSync(argv.dest)
          fs.mkdirSync(argv.dest)
        }
      }

      const files = globSync(resolve(argv.src, '**/*.json'), {
        ignore: argv.exclude ? resolve(argv.src, argv.exclude) : null,
      })

      consola.debug('files', files)
      consola.debug('start convert...')

      const jobs = files.map(file => {
        const basename = path.basename(file, path.extname(file))
        const name = startCase(camelCase(basename))
        const targetFile = resolve(argv.dest, snakeCase(name) + '.dart')
        consola.debug(`${file} -> ${targetFile}`)
        return quicktype.main([
          file,
          '--lang',
          'dart',
          '--null-safety',
          '--no-enums',
          '--coders-in-class',
          '--all-properties-optional',
          '--top-level',
          name,
          '--out',
          targetFile,
        ])
      })
      await Promise.all(jobs)

      // quicktype.main([
      //   '/Users/gumi/__tmp__/quick_type_demo/role.json',
      //   '--lang',
      //   'dart',
      //   '--just-types',
      //   '--out',
      //   '/Users/gumi/__tmp__/quick_type_demo2/role.dart',
      // ])
    }
  )
}
