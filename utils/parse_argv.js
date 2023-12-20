const minimist = require('minimist')

function getArgv(alias = {}) {
  alias = {
    h: 'help',

    ...alias,
  }
  const argv = minimist(process.argv.slice(2))
  const values = {}

  Object.entries(alias).forEach(([key, value]) => {
    const input = argv[key] || argv[value]
    values[key] = input
    values[value] = input
  })

  argv.__values = values
  return argv
}

module.exports = {
  getArgv,
}
