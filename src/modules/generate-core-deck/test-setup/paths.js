import path from 'path'
import url from 'url'
import urlMappings from './url-mappings.js'
import * as pathUtils from 'path'

const currentFile = url.fileURLToPath(import.meta.url)
const directory = pathUtils.dirname(currentFile)
const cwd = process.cwd()

export const tempDirectoryPath = path.join(cwd, '_temp')
export const testDataDirectoryPath = path.join(directory, 'data')

export const actualSoundsPaths = Object
  .values(urlMappings)
  .filter(file => file.endsWith('.mp3'))
  .map(file => path.join(testDataDirectoryPath, file))
export const expectedSoundsPaths = Object
  .values(urlMappings)
  .filter(file => file.endsWith('.mp3'))
  .map(file => path.join(testDataDirectoryPath, file))

export function getActualDeckFilePath(core) {
  const deckFileName = getDeckFileName(core)
  return path.join(tempDirectoryPath, deckFileName)
}

export function getExpectedDeckFilePath(core) {
  const deckFileName = getDeckFileName(core)
  return path.join(testDataDirectoryPath, deckFileName)
}

function getDeckFileName(core) {
  return `core ${core}.csv`
}
