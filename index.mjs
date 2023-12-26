#!/usr/bin/env node
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import path from 'path'
import { globSync } from 'glob'
import consola from 'consola'
import { getContext } from './utils/core.mjs'
const argv = yargs(hideBin(process.argv)).argv
const { require, __dirname } = getContext(import.meta.url)

const commands = globSync(path.resolve(__dirname, './commands/*.mjs'))

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
