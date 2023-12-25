const threeBackticks = '```'

export function json(input) {
  return `${threeBackticks}json\n${JSON.stringify(input)}\n${threeBackticks}`
}

const jsonRE = new RegExp(`${threeBackticks}json\n(.+)\n${threeBackticks}`, 's')
export function extractJson(input) {
  try {
    return JSON.parse(input)
  } catch (err) {
    const match = input.match(jsonRE)
    if (match) {
      return JSON.parse(match[1])
    }
    return null
  }
}
