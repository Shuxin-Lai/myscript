import { isNumber } from 'lodash-es'
import { getContext } from '../utils/core.mjs'
import dayjs from 'dayjs'

const { __name } = getContext(import.meta.url)

/**
 * @param {import('yargs').Argv} yargs
 * @param {import('consola').Consola} consola
 */
export default function (yargs, consola) {
  return yargs.command(
    `${__name} [datetime]`,
    'date utils',
    yargs =>
      yargs
        .positional('datetime', {
          alias: 'dt',
          type: ['string', 'number'],
          default: Date.now(),
        })
        .option('fix', {
          type: 'boolean',
          default: true,
          description: 'fix',
        })
        .option('format', {
          alias: 'f',
          type: 'string',
          description: 'format',
          default: 'YYYY-MM-DD HH:mm:ss',
        }),
    argv => {
      const format = argv.format
      let date = argv.datetime
      let fixed = false
      if (argv.fix && isNumber(date) && String(date).length === 10) {
        date *= 1000
        fixed = true
      }

      const day = dayjs(date)
      const res = day.format(format)
      const content = `${day.valueOf()}\n${res}`
      console.log(fixed ? `${content}\n(fixed)` : content)
    }
  )
}
