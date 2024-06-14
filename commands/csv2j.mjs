import { getContext, resolve } from '../utils/core.mjs'
import fs from 'fs'
import pp from 'papaparse'
import path from 'path'

const { __name } = getContext(import.meta.url)

/**
 * @param {import('yargs').Argv} yargs
 * @param {import('consola').Consola} consola
 */
export default function (yargs, consola) {
  return yargs.command(
    `${__name} [src] [dest]`,
    'csv to json',
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
        dest = path.join(dir, `${name}.json`)
      }

      if (!fs.existsSync(src)) {
        consola.error(`src ${src} not exists`)
        return
      }

      const content = fs.readFileSync(src, 'utf-8')
      const res = await pp.parse(content, {})
      if (res.errors.length) {
        console.error(res.errors)
        return
      }

      if (!res.data.length) {
        console.error('no data')
        return
      }

      const header = res.data[0]
      const data = res.data.slice(1)

      const list = data.map(row => {
        const obj = {}
        header.forEach((key, index) => {
          obj[key] = row[index]
        })
        return obj
      })

      fs.writeFileSync(dest, JSON.stringify(list, null, 2))
    }
  )
}
