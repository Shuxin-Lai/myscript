import { isObject } from 'lodash-es'
import path from 'path'
import userhome from 'userhome'

export function countList(list, keys = ['id', 'name']) {
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

export function resolve(...paths) {
  paths = paths.map(p => {
    if (p.startsWith('~')) {
      return userhome(p.slice(1))
    }

    return p
  })

  return path.resolve(...paths)
}
