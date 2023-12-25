#!/usr/bin/env node

import { getArgv } from '../utils/parse_argv.mjs'
import TongYi from '../utils/tongyi.mjs'
import { createRequire } from 'module'
import path from 'path'
import debug from 'debug'
import { isString } from 'lodash-es'
import fs from 'fs'

const require = createRequire(import.meta.url)
const roles = require('../prompts/tongyi.json')
const userhome = require('userhome')

const argv = getArgv({
  d: {
    name: 'debug',
    defaultValue: false,
  },
  l: {
    name: 'language',
    defaultValue: 'English(US)',
  },

  i: argv => ({
    name: 'input',
    defaultValue: argv._[0],
  }),

  r: {
    name: 'role',
    defaultValue: 'language_teacher',
  },
  o: {
    name: 'output',
    defaultValue: true,
  },
})

if (argv.__values.d) {
  debug.enable('tongyi')
}
const log = debug('tongyi')

function normalizeInput() {
  if (!argv.__values.i) {
    throw new Error('Input is required')
  }
  const item = roles.find(item => item.id === argv.__values.r)
  argv._item = item || roles[0]
  let output = argv.__values.o

  if (output === true) {
    output = path.join(userhome(), './.tonyi', `${item.id}.txt`)
  }

  if (isString(output)) {
    const dir = path.dirname(output)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir)
    }
  }

  argv._output = output
}

async function run() {
  /** @type { import('../interfaces/tongyi').Messages } */
  const messages = []
  const { id, system, content } = argv._item
  const systemContent = system.replace('{language}', argv.__values.l)
  const userContent = content.replace('{content}', argv.__values.i)
  if (systemContent) {
    messages.push({
      role: 'system',
      content: systemContent,
    })
  }
  messages.push({
    role: 'user',
    content: userContent,
  })

  log('messages: %O', messages)
  log('output: %O', argv._output)
  const res = await tongyi.send({
    messages: messages,
  })

  const text = res.output.text
  console.log(text)

  if (argv._output) {
    fs.appendFileSync(argv._output, text)
  }
}

const tongyi = new TongYi(process.env.TONGYI_API_KEY)

async function main() {
  try {
    normalizeInput()
    await run()
  } catch (err) {
    console.log('Error:')
    console.log(err.message)
  }
}

main()
