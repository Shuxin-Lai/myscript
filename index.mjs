#!/usr/bin/env node
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { createRequire } from 'module'
import path from 'path'
import { fileURLToPath } from 'url'
import { globSync } from 'glob'
import consola from 'consola'
const argv = yargs(hideBin(process.argv)).argv

const require = createRequire(import.meta.url)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const commands = globSync(path.resolve(__dirname, './commands_v2/*.mjs'))

const pkg = require('./package.json')

async function main() {
  if (argv.debug || argv.d) {
    consola.level = 4
  }

  let _yarns = yargs(hideBin(process.argv))
    .option('debug', {
      alias: 'd',
      type: 'boolean',
      default: false,
      description: 'Run in debug mode',
    })
    .scriptName('ms')
    .version(pkg.version)

  for (const command of commands) {
    const { default: commandFn } = await import(command)
    _yarns = commandFn(_yarns, consola)
  }

  _yarns.parse()
}

main()
