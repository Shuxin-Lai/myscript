import { getContext } from '../utils/core.mjs'
import fs from 'fs'
import clipboard from 'clipboardy'

const { __name, require } = getContext(import.meta.url)

/**
 * @param {import('yargs').Argv} yargs
 * @param {import('consola').Consola} consola
 */
export default function (yargs, consola) {
  return yargs.command(
    `${__name} [file]`,
    'copy to clipboard',
    yargs =>
      yargs
        .positional('file', {
          alias: 'f',
          type: 'string',
        })
        .demandOption(['file']),
    async argv => {
      const { file } = argv
      const content = fs.readFileSync(file, 'utf8')
      clipboard.writeSync(content)
      console.log('copied to clipboard')
    }
  )
}
