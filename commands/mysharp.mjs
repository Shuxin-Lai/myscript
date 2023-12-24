#!/usr/bin/env node

import chalk from 'chalk'

import { createRequire } from 'module'
const require = createRequire(import.meta.url)

const hr = require('@tsmx/human-readable')
const sharp = require('sharp')
const path = require('path')
const fs = require('fs')
const { getArgv } = require('../utils/parse_argv')
const { globSync } = require('glob')
const { promisify } = require('util')
const sizeOf = promisify(require('image-size'))

const pattern = '**/*.{jpg,JPG,jpeg,JPEG,png,PNG,webp,WEBP}'

const argv = getArgv({
  s: _argv => ({
    name: 'source',
    defaultValue: _argv._[0],
  }),
  d: 'destination',
  q: {
    name: 'quality',
    defaultValue: 100,
  },
  t: {
    name: 'type',
    defaultValue: 'webp',
  },
  r: {
    name: 'replace',
    defaultValue: true,
  },
})

function printHelp() {
  console.log('mysharp [SOURCE] -d DESTINATION -q QUALITY -t TYPE')
}

function checkAndNormalizePath() {
  const source = argv.__values.s
  let sourcePath = source
  try {
    sourcePath = path.resolve(source)
    argv.__values.s = argv.__values.source = sourcePath
  } catch (err) {
    throw new Error(`Invalid source path: ${source}`)
  }

  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Source path not exists: ${sourcePath}`)
  }

  let destination = argv.__values.d
  if (!destination) {
    destination = path.join(sourcePath, './output')

    argv.__values.d = argv.__values.destination = destination
  }
  argv.__values.tmp = path.join(sourcePath, './__mysharp_tmp__')
  argv.__values.tmp3x = []
  argv.__values.tmpFiles = []
}

function getFileList() {
  const source = argv.__values.s
  const fileList = globSync(path.join(source, pattern), {
    ignore: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/output/**',
      '**/__mysharp_tmp__/**',
    ],
  })
  argv.__values.fileList = fileList
}

async function transformOne(file) {
  const type = argv.__values.t
  if (!fs.existsSync(argv.__values.tmp)) {
    fs.mkdirSync(argv.__values.tmp)
  }

  const ext = path.extname(file)
  const name = path.basename(file, ext)

  const dest = path.join(argv.__values.tmp, `${name}@3x.${type}`)
  const exists = fs.existsSync(dest)

  if (exists && !argv.__values.r) {
    return
  }

  if (exists) {
    fs.unlinkSync(dest)
  }

  await sharp(file)
    .toFormat(type, {
      quality: argv.__values.q,
    })
    .toFile(dest)
  const oStat = fs.statSync(dest)
  const iStat = fs.statSync(file)
  const percent = (iStat.size - oStat.size) / iStat.size
  const print = percent < 0 ? console.warn : console.log

  argv.__values.tmp3x.push({
    name: name,
    dest: dest,
    file: file,
  })
  print(
    `${file} => ${dest} [${chalk.green(
      hr.fromBytes(iStat.size)
    )} => ${chalk.cyan(hr.fromBytes(oStat.size))}] ${chalk[
      percent < 0 ? 'red' : 'blueBright'
    ]((percent * 100).toFixed(2))}%`
  )
}

async function resizeOne(item) {
  const { type } = argv.__values
  const { dest: file, name } = item
  const { width, height } = await sizeOf(file)
  const output1x = path.join(argv.__values.tmp, `${name}.${type}`)
  const output2x = path.join(argv.__values.tmp, `${name}@2x.${type}`)

  await Promise.all([
    sharp(file)
      .resize(Math.round(width / 3), Math.round(height / 3))
      .toFile(output1x),
    sharp(file)
      .resize(Math.round(width / 2), Math.round(height / 2))
      .toFile(output2x),
  ])

  argv.__values.tmpFiles.push({
    output1x: {
      file: output1x,
      name: `${name}.${type}`,
      originName: `${name}.${type}`,
    },
    output2x: {
      file: output2x,
      name: `${name}@2x.${type}`,
      originName: `${name}.${type}`,
    },
    output3x: {
      file: file,
      name: `${name}@3x.${type}`,
      originName: `${name}.${type}`,
    },
  })
}

async function resize() {
  const files = argv.__values.tmp3x
  const promises = files.map(file => resizeOne(file))

  await Promise.all(promises)
}

async function transform() {
  const fileList = argv.__values.fileList
  const destination = argv.__values.d
  const quality = argv.__values.q
  const type = argv.__values.t

  const promises = fileList.map(file => transformOne(file))
  await Promise.all(promises)
}

function move() {
  const { tmpFiles, destination } = argv.__values
  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination)
  }
  const dest2x = path.join(destination, './2.0x')
  const dest3x = path.join(destination, './3.0x')
  if (!fs.existsSync(dest2x)) {
    fs.mkdirSync(dest2x)
  }
  if (!fs.existsSync(dest3x)) {
    fs.mkdirSync(dest3x)
  }

  tmpFiles.forEach(item => {
    const { output1x, output2x, output3x } = item
    const { file: file1x, originName: originName1x } = output1x
    const { file: file2x, originName: originName2x } = output2x
    const { file: file3x, originName: originName3x } = output3x

    fs.copyFileSync(file1x, path.join(destination, originName1x))
    fs.copyFileSync(file2x, path.join(dest2x, originName2x))
    fs.copyFileSync(file3x, path.join(dest3x, originName3x))
  })
}

async function main() {
  if (argv.__values.h) {
    printHelp()
    return
  }

  if (!argv.__values.s) {
    printHelp()
    return
  }

  try {
    checkAndNormalizePath()
    getFileList()
    await transform()
    await resize()
    await move()
  } finally {
    if (fs.existsSync(argv.__values.tmp)) {
      fs.rmSync(argv.__values.tmp, { recursive: true })
    }
  }
}

main()
