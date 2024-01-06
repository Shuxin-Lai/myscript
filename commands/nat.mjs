import natural from 'natural'
import { getContext } from '../utils/core.mjs'
const tokenizer = new natural.SentenceTokenizer()

const { __name } = getContext(import.meta.url)

/**
 * @param {import('yargs').Argv} yargs
 * @param {import('consola').Consola} consola
 */
export default function (yargs, consola) {
  return yargs.command(
    `${__name} [input]`,
    'natural utils',
    yargs =>
      yargs
        .positional('input', {
          alias: 'i',
          type: 'string',
        })
        .demandOption(['input']),
    argv => {
      const input = argv.input
      const res = tokenizer.tokenize(input).filter(item => !!item)
      consola.debug('input: ', input)

      console.log()
      for (const item of res) {
        console.log(`- ${item}`)
      }
    }
  )
}
