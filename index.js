#!/usr/bin/env node

const pkg = require('./package.json')
const sharp = require('sharp')
const fs = require('fs')
const path = require('path')
const minimist = require('minimist')
const { promisify } = require('util')
const sizeOf = promisify(require('image-size'))
const argv = minimist(process.argv.slice(2))
const { globSync } = require('glob')

const pattern = '**/*.{jpg,JPG,jpeg,JPEG,png}'

console.log(`${pkg.name} -s SOURCE_DIR -t TARGET_DIR -q QUALITY --type TYPE`)
console.log('SOURCE_DIR: required')
console.log('TARGET_DIR: optional. {SOURCE_DIR}/output by default')

// const { compress } = require('compress-images/promise');
// const input = path.resolve(imgSourceDir, './**/*.{jpg,JPG,jpeg,JPEG,png}');
// const output = path.join(imgTargetDir, '/');

// if (imgSourceDir === undefined) {
//   throw new Error('source is required')
// }

// console.log(`start(quality=${quality}): ${input} -> ${output}`)
// const processImages = async () => {
//   const result = await compress({
//     source: input,
//     destination: output,
//     enginesSetup: {
//       jpg: { engine: 'webp', command: ['-q', quality] },
//       png: { engine: 'webp', command: ['-q', quality] },
//     }
//   });

//   const { statistics, errors } = result;
//   // statistics - all processed images list
//   // errors - all errros happened list
// };

// processImages();

function getContext() {
  const imgSourceDir = path.resolve(argv.s || argv.source)
  const imgTargetDir =
    argv.t || argv.target || path.resolve(imgSourceDir, 'output')
  const imageList = globSync(path.join(imgSourceDir, pattern))
  const quality = argv.q || argv.quality || 100
  const type = argv.type
  return {
    type,
    quality,
    imgSourceDir,
    imageList,
    imgTargetDir,
  }
}

const context = getContext()

async function resizeSingle(
  imagePath,
  w1,
  h1,
  originalType,
  targetDir,
  scale = 1
) {
  const extname = path.extname(imagePath)
  const name = path.basename(imagePath, extname)

  const fileName = scale == 1 ? name : `${name}@${scale}x`
  const width = +(w1 * scale).toFixed(0)
  const height = +(h1 * scale).toFixed(0)

  let sharped = sharp(imagePath).resize(width, height)
  const type = context.type || originalType.toLowerCase()
  const targetFile = path.join(targetDir, `${fileName}.${type}`)

  sharped = sharped.toFormat(type, {
    quality: context.quality,
  })
  await sharped.toFile(targetFile)
  console.log(
    `resize ${imagePath} --> ${targetFile} (width=${width}, height=${height})`
  )
}

async function resize(imagePath) {
  const dirPath = path.relative(context.imgSourceDir, path.dirname(imagePath))
  const targetDir = path.join(context.imgTargetDir, dirPath)
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true })
  }

  const { width, height, type } = await sizeOf(imagePath)
  const w1 = width / 3
  const h1 = height / 3

  await resizeSingle(imagePath, w1, h1, type, targetDir, 1)
  await resizeSingle(imagePath, w1, h1, type, targetDir, 2)
  await resizeSingle(imagePath, w1, h1, type, targetDir, 3)
}

function main() {
  if (!context.imgSourceDir) {
    throw new Error('source is required')
  }

  console.log(
    `SOURCE_DIR=${context.imgSourceDir}, TARGET_DIR=${context.imgTargetDir}, QUALITY=${context.quality}, TYPE=${context.type}`
  )
  
  context.imageList.forEach(resize)
}

main()
