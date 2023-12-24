import { isObject, isFunction } from 'lodash-es'
import minimist from 'minimist'

export function getArgv(alias = {}) {
  alias = {
    h: 'help',

    ...alias,
  }
  const argv = minimist(process.argv.slice(2))
  const values = {}

  Object.entries(alias).forEach(([short, longOrContextOrFn]) => {
    let long = longOrContextOrFn
    let defaultValue = null

    if (isFunction(longOrContextOrFn)) {
      const result = longOrContextOrFn(argv)
      long = result.name
      defaultValue = result.defaultValue
    } else if (isObject(longOrContextOrFn)) {
      long = longOrContextOrFn.name
      defaultValue = longOrContextOrFn.defaultValue
    }

    const input = argv[short] ?? argv[long] ?? defaultValue
    values[short] = input
    values[long] = input
  })

  argv.__values = values
  return argv
}
