import path from 'path'
import * as pathUtils from 'path'
import url from 'url'
import urlMappings from './url-mappings.js'

const cwd = process.cwd()
export const tempDirectoryPath = path.join(cwd, '_temp')
export const testDataDirectoryPath = getTestDataDirectoryPath()

function getTestDataDirectoryPath() {
  const currentFile = url.fileURLToPath(import.meta.url)
  const directory = pathUtils.dirname(currentFile)
  return path.join(directory, 'data')
}

export const actualSoundPaths = getSoundPaths(tempDirectoryPath)
export const expectedSoundPaths = getSoundPaths(testDataDirectoryPath)

function getSoundPaths(directoryPath) {
  return Object
    .values(urlMappings)
    .filter(file => file.endsWith('.mp3'))
    .map(file => path.join(directoryPath, file))
}

export function getActualDeckPath(core) {
  return getDeckPath(tempDirectoryPath, core)
}

export function getExpectedDeckPath(core) {
  return getDeckPath(testDataDirectoryPath, core)
}

function getDeckPath(directoryPath, core) {
  const fileName = `core ${core}.csv`
  return path.join(directoryPath, fileName)
}
