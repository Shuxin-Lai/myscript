#!/usr/bin/env node

import { getArgv } from '../utils/parse_argv.mjs'
import { countList } from '../utils/core.mjs'
import sortObj from 'sort-object'

const argv = getArgv({
  l: argv => ({
    name: 'list',
    defaultValue: argv._[0] || '',
  }),
})

function normalizeList(list) {
  if (Array.isArray(list)) return list
  try {
    const res = JSON.parse(list)
    return res
  } catch (_) {}

  const ls = eval(list)
  return ls
}

function main() {
  if (argv.__values.h) {
    console.log('myana [LIST]')
  }

  const list = argv.__values.l
  const targetList = normalizeList(list)
  const result = sortObj(countList(targetList))
  console.log(JSON.stringify(result, null, 2))
}

main()
