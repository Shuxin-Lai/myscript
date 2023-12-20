#!/usr/bin/env node

const sortObj = require('sort-object')
const { getArgv } = require('../utils/parse_argv')
const { countList } = require('../utils/core')

const argv = getArgv({
  l: 'list',
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

  const list = argv.__values.l || argv._[0] || ''
  const targetList = normalizeList(list)
  const result = sortObj(countList(targetList))
  console.log(JSON.stringify(result, null, 2))
}

main()
