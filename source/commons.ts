/**
 * @packageDocumentation
 *
 * This file contains all the common types and interfaces used in the library.
 *
 */

// TODO: could be optimized?
export function nestedObjectToDotNotation(obj: object): object {
  const result = {}

  const flatten = (prefix, obj) => {
    for (const key in obj) {
      const value = obj[key]
      const newKey = prefix ? prefix + '.' + key : key

      if (typeof value === 'object') {
        flatten(newKey, value)
      } else {
        result[newKey] = value
      }
    }
  }

  flatten('', obj)

  return result
}

export function objPath(pathAr: string[], obj: object) {
  const flatPath = pathAr.flat()
  let val = obj
  let idx = 0
  let p: string

  while (idx < flatPath.length) {
    if (val == null) {
      return
    }
    p = flatPath[idx]
    val = val[p]
    idx += 1
  }
  return val
}

export function assoc(prop, val, obj) {
  return { ...obj, [prop]: val }
}

export function customAssocPath(path, val, obj) {
  if (!Array.isArray(path)) {
    return { ...obj, [path]: val }
  }
  const flatPath = path.flat()
  if (flatPath.length === 0) {
    return val
  }
  const idx = flatPath[0]
  if (flatPath.length > 1) {
    const nextObj = Object.hasOwn(obj, idx) ? obj[idx] : {}
    val = customAssocPath(flatPath.slice(1), val, nextObj)
  }
  return assoc(idx, val, obj)
}
