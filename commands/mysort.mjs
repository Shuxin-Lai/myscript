#!/usr/bin/env node

import { createRequire } from 'module'
import fs from 'fs'
import path from 'path'
import { getArgv } from '../utils/parse_argv.mjs'
import { globSync } from 'glob'
import sortObj from 'sort-object'

const require = createRequire(import.meta.url)

const argv = getArgv({
  s: argv => ({
    name: 'source',
    defaultValue: argv._[0],
  }),
  t: 'target',
  r: 'replace',
})

function sortOne(file, targetDir) {
  const json = require(file)
  const res = sortObj(json)
  const basename = path.basename(file)

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir)
  }

  fs.writeFileSync(path.join(targetDir, basename), JSON.stringify(res, null, 2))
}

function main() {
  if (argv.__values.h) {
    console.log('mysort -s SOURCE_DIR -t TARGET_DIR')
    console.log('SOURCE_DIR: required')
    console.log('TARGET_DIR: optional. {SOURCE_DIR}/output by default')
    return
  }

  if (!argv.__values.s) {
    throw new Error('source dir is required')
  }
  const sourceDir = path.resolve(argv.__values.s)
  let targetDir = argv.__values.t
  if (!targetDir) {
    if (argv.__values.r) {
      targetDir = sourceDir
    } else {
      targetDir = path.join(sourceDir, 'output')
    }
  }

  const fileList = globSync(path.join(sourceDir, '**/*.{json,JSON}'))

  for (const file of fileList) {
    sortOne(file, targetDir)
  }
  console.log(`SOURCE_DIR=${sourceDir}, TARGET_DIR=${targetDir}`)
}

main()
