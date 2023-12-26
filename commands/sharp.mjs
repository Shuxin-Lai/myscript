import { getContext, resolve } from '../utils/core.mjs'
import fs from 'fs'
import path from 'path'
import { globSync } from 'glob'
import sharp from 'sharp'
import { promisify } from 'util'
import chalk from 'chalk'

const { __name, require } = getContext(import.meta.url)

const hr = require('@tsmx/human-readable')
const sizeOf = promisify(require('image-size'))
const pattern = '**/*.{jpg,JPG,jpeg,JPEG,png,PNG,webp,WEBP}'

function prepare(argv) {
  argv.__values = argv.__values || {
    ...argv,
  }
  let sourcePath = argv.source

  try {
    sourcePath = resolve(sourcePath)
    argv.__values.s = argv.__values.source = sourcePath
  } catch (err) {
    const msg = `Invalid source path: ${sourcePath}`
    throw new Error(msg)
  }

  if (!fs.existsSync(sourcePath)) {
    const msg = `Invalid source path: ${sourcePath}`
    throw new Error(msg)
  }

  let destination = argv.__values.target
  if (!destination) {
    destination = path.join(sourcePath, './output')

    argv.__values.d = argv.__values.destination = destination
  }
  argv.__values.tmp = path.join(sourcePath, './__mysharp_tmp__')
  argv.__values.tmp3x = []
  argv.__values.tmpFiles = []
}

function getFileList(argv) {
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

async function transformOne(argv, file) {
  const type = argv.__values.type
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
  const targetFile = path.join(argv.__values.d, `${name}.${type}`)

  print(
    `${file} => ${targetFile} [${chalk.green(
      hr.fromBytes(iStat.size)
    )} => ${chalk.cyan(hr.fromBytes(oStat.size))}] ${chalk[
      percent < 0 ? 'red' : 'blueBright'
    ]((percent * 100).toFixed(2))}%`
  )
}

async function transform(argv) {
  const fileList = argv.__values.fileList

  const promises = fileList.map(file => transformOne(argv, file))
  await Promise.all(promises)
}

async function resize(argv) {
  const files = argv.__values.tmp3x
  const promises = files.map(file => resizeOne(argv, file))

  await Promise.all(promises)
}

async function resizeOne(argv, item) {
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

function move(argv) {
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

/**
 * @param {import('yargs').Argv} yargs
 * @param {import('consola').Consola} consola
 */
export default function (yargs, consola) {
  return yargs.command(
    `${__name} [source] [target]`,
    'sharp utils',
    yargs =>
      yargs
        .positional('source', {
          alias: 's',
          type: 'string',
        })
        .positional('target', {
          alias: 't',
          type: 'string',
        })
        .option('type', {
          alias: 'type',
          type: 'string',
          default: 'webp',
          description: 'type',
        })
        .option('quality', {
          alias: 'q',
          type: 'number',
          default: 100,
          description: 'quality',
        })
        .option('replace', {
          alias: 'r',
          type: 'boolean',
          default: true,
          description: 'replace',
        })
        .demandOption(['source']),
    async argv => {
      try {
        prepare(argv)
        getFileList(argv)
        await transform(argv)
        await resize(argv)
        await move(argv)
      } finally {
        if (fs.existsSync(argv.__values.tmp)) {
          fs.rmSync(argv.__values.tmp, { recursive: true })
        }
      }
    }
  )
}
