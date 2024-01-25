import natural from 'natural'
import random from 'random'
import { getContext, resolve } from '../utils/core.mjs'
import fs from 'fs'

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
        .option('possibility', {
          alias: 'p',
          type: 'number',
          default: 0.55,
          description: 'possibility',
        })
        .demandOption(['input']),
    argv => {
      let input = argv.input
      try {
        const path = resolve(input)
        if (fs.existsSync(path)) {
          input = fs.readFileSync(path, 'utf-8')
        }
      } catch (_) {}

      const res = tokenizer.tokenize(input).filter(item => !!item)
      consola.debug('input: ', input)

      console.log()
      for (const item of res) {
        console.log(`- ${item}`)
      }

      const questions = res.map(item => {
        const r = random.uniform(0, 1)
        if (r() > argv.possibility) {
          return item
        } else {
          return '_'.repeat(8) + item[item.length - 1]
        }
      })

      console.log()
      console.log(questions.join(' '))
    }
  )
}
