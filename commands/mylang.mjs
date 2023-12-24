#!/usr/bin/env node

import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const { getArgv } = require('../utils/parse_argv.mjs')

const argv = getArgv({})

console.log(argv.__values)
