import { isString, merge } from 'lodash-es'
import { getContext, resolve, sleep } from '../utils/core.mjs'
import TongYi from '../utils/tongyi.mjs'
import ora from 'ora'
import fs from 'fs'
import sortObject from 'sort-object'

const { __name, require } = getContext(import.meta.url)
const roles = require('../prompts/lang.json')

function getSlots(argv, prefix) {
  const res = {}
  Object.entries(argv).forEach(([key, value]) => {
    if (key.startsWith(prefix)) {
      res[key] = value
    }
  })

  return res
}

async function handle(argv, consola) {
  const tongyi = new TongYi(process.env.TONGYI_API_KEY)

  /** @type { import('../interfaces/tongyi').Messages } */
  const messages = []
  const { system, content } = argv.role

  let systemContent = system.replace('{language}', argv.language)
  let userContent = content.replace('{input}', argv.input)

  const systemSlots = merge(getSlots(argv, 'system_'), getSlots(argv, 's_'))
  const inputSlots = merge(getSlots(argv, 'input_'), getSlots(argv, 'i_'))

  Object.entries(systemSlots).forEach(([key, value]) => {
    systemContent = systemContent.replace(`{${key}}`, value)
  })
  Object.entries(inputSlots).forEach(([key, value]) => {
    userContent = userContent.replace(`{${key}}`, value)
  })

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

  consola.debug('messages: ', JSON.stringify(messages, null, 2))

  const spinner = ora('Loading...').start()
  try {
    const res = await tongyi.send({
      messages: messages,
    })

    spinner.stop()
    const text = res.output.text
    console.log(text)
    let history = []

    if (argv.output && fs.existsSync(argv.output)) {
      history = JSON.parse(fs.readFileSync(argv.output, 'utf-8')) || []
    }

    history.push(
      sortObject({
        id: Date.now(),
        role_id: argv.role.id,
        input: argv.input,
        output: text,
      })
    )

    fs.writeFileSync(argv.output, JSON.stringify(history, null, 2))
  } catch (err) {
    spinner.fail(err.message)
  }
}

/**
 * @param {import('yargs').Argv} yargs
 * @param {import('consola').Consola} consola
 */
export default function (yargs, consola) {
  return yargs.command(
    `${__name} [input]`,
    `language utils`,
    yargs =>
      yargs
        .positional('input', {
          alias: 'i',
          type: 'string',
        })
        .option('role', {
          alias: 'r',
          type: 'string',
          default: 'improve',
          description: 'role',
        })
        .option('language', {
          alias: 'l',
          type: 'string',
          default: 'English(US)',
          description: 'language',
        })
        .option('output', {
          alias: 'o',
          type: ['string', 'boolean'],
          default: true,
          description: 'output',
        })
        .demandOption(['input']),
    argv => {
      const role = roles.find(item => item.id === argv.role) || roles[0]
      let output = argv.output
      if (output === true) {
        output = resolve('~/.tonyi', `./${role.id}.json`)
      } else if (isString(output)) {
        output = resolve(output)
      }

      consola.debug('role', role.id)
      consola.debug('output file: ', output)
      argv.role = role
      argv.output = output

      handle(argv, consola)
    }
  )
}
