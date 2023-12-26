import { countList, getContext } from '../utils/core.mjs'
import sortObj from 'sort-object'

const { __name } = getContext(import.meta.url)
function normalizeList(list) {
  if (Array.isArray(list)) return list
  try {
    const res = JSON.parse(list)
    return res
  } catch (_) {}

  const ls = eval(list)
  return ls
}

/**
 * @param {import('yargs').Argv} yargs
 * @param {import('consola').Consola} consola
 */
export default function (yargs, consola) {
  return yargs.command(
    `${__name} [list]`,
    ' my analyze',
    yargs =>
      yargs
        .positional('list', {
          alias: 'l',
          type: 'string',
        })
        .demandOption(['list']),
    argv => {
      const list = argv.list
      const targetList = normalizeList(list)
      const result = sortObj(countList(targetList))
      console.log(JSON.stringify(result, null, 2))
    }
  )
}
