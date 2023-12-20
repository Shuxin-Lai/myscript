#!/usr/bin/env node

const { getArgv } = require('../utils/parse_argv')
const dayjs = require('dayjs')

const argv = getArgv({
  d: 'date',
  f: 'format',
})

function main() {
  if (argv.__values.h) {
    console.log('mydate [DATE] -f FORMAT')
  }

  const format = argv.f || 'YYYY-MM-DD HH:mm:ss'
  const date = argv.d || argv._[0] || Date.now()
  const res = dayjs(date).format(format)
  console.log(res)
}

main()