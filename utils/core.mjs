import { isNumber, isObject, isString } from 'lodash-es'
import path from 'path'
import { createRequire } from 'module'
import { fileURLToPath } from 'url'
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
  if (paths.length == 1) {
    const p = paths[0]
    // starts with ., a-z, A-Z, 0-9
    if (
      isString(p) &&
      p.match(/^[a-zA-Z0-9]/) &&
      !p.startsWith('/') &&
      !p.startsWith('\\')
    ) {
      return path.resolve(process.cwd(), p)
    }
  }

  paths = paths.map(p => {
    if (p.startsWith('~')) {
      return path.resolve(userhome(), `.${p.slice(1)}`)
    }

    return p
  })

  return path.resolve(...paths)
}

export function getContext(url) {
  const __filename = fileURLToPath(url)
  const __dirname = path.dirname(__filename)
  const __basename = path.basename(__filename)
  const __extname = path.extname(__filename)
  const __name = path.basename(__filename, __extname)
  const require = createRequire(url)
  return {
    __basename,
    __dirname,
    __extname,
    __filename,
    __name,
    require,
  }
}

export function sleep(ms = 16) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function flattenObject(obj, prefix = '') {
  const isArr = Array.isArray(obj)
  if (isArr) {
    return obj.map(item => flattenObject(item, prefix))
  }

  let result = {}

  for (let key in obj) {
    if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
      let flattenedObj = flattenObject(obj[key], prefix + key + '.')
      result = { ...result, ...flattenedObj }
    } else if (Array.isArray(obj[key])) {
      let flattenedObj = flattenObject(obj[key], prefix + key + '.')
      result = { ...result, ...flattenedObj }
    } else {
      result[prefix + key] = obj[key]
    }
  }

  return result
}
