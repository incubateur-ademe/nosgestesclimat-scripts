import path from 'path'

export const LOCK_KEY_EXT = '.lock'
export const AUTO_KEY_EXT = '.auto'
export const PREVIOUS_REVIEW_KEY_EXT = '.previous_review'

export const publicDir = path.resolve('public')
export const t9nDir = path.resolve('data/i18n/t9n')

export const availableLanguages = ['fr', 'en-us']
export const defaultLang = availableLanguages[0]
