import { flattenObject, getContext, resolve } from '../utils/core.mjs'
import fs from 'fs'
import path from 'path'

const { __name } = getContext(import.meta.url)

/**
 * @param {import('yargs').Argv} yargs
 * @param {import('consola').Consola} consola
 */
export default function (yargs, consola) {
  return yargs.command(
    `${__name} [src] [dest]`,
    'flatten a json object',
    yargs =>
      yargs
        .positional('src', {
          describe: 'src',
          type: 'string',
          description: 'src',
        })
        .positional('dest', {
          describe: 'dest',
          type: 'string',
          description: 'dest',
        })
        .demandOption(['src']),
    async argv => {
      const src = resolve(argv.src)
      let dest = argv.dest
      if (dest) {
        dest = resolve(dest)
      } else {
        const dir = path.dirname(src)
        const name = path.basename(src, path.extname(src))
        dest = path.join(dir, `${name}-flattened.json`)
      }

      if (!fs.existsSync(src)) {
        consola.error(`src ${src} not exists`)
        return
      }

      const json = JSON.parse(fs.readFileSync(src, 'utf-8'))

      const res = flattenObject(json)

      fs.writeFileSync(dest, JSON.stringify(res, null, 2))
    }
  )
}
