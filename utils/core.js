const { isObject } = require('lodash')

function countList(list, keys = ['id', 'name']) {
  const map = {}

  list.forEach(item => {
    let id = item

    if (isObject(item)) {
      id = keys.filter(key => item[key] != null)[0]
    }

    map[id] = (map[id] || 0) + 1
  })

  return map
}

module.exports = {
  countList,
}
