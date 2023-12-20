#!/usr/bin/env node

const sortObj = require('sort-object')
const fs = require('fs')
const path = require('path')
const { globSync } = require('glob')
const { getArgv } = require('../utils/parse_argv')

const argv = getArgv({
  s: 'source',
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
