import fsPromises from 'fs/promises'
import * as generator from './generator.js'
import * as paths from './test-setup/paths.js'
import server from './test-setup/server.js'

beforeAll(async () => {
  await fsPromises.rm(paths.tempDirectoryPath, { recursive: true, force: true })
  server.listen()
})

afterAll(() => {
  server.close()
})

test('Generates an examples deck from core 1000', async () => {
  const core = 1000
  await generator.generateDeck(core, paths.tempDirectoryPath)
    //retries after a network error
    .catch(_error => generator.generateDeck(core, paths.tempDirectoryPath))

  const actualDeckPath = paths.getActualDeckPath(core)
  const actualContents = await fsPromises.readFile(actualDeckPath, 'utf-8')
  const expectedDeckPath = paths.getExpectedDeckPath(core)
  const expectedContents = await fsPromises.readFile(expectedDeckPath, 'utf-8')
  expect(actualContents)
    .toBe(expectedContents)

  const actualSoundPromises = paths.actualSoundPaths
    .map(filePath => fsPromises.readFile(filePath))
  const actualSounds = await Promise.all(actualSoundPromises)
  const expectedSoundPromises = paths.expectedSoundPaths
    .map(filePath => fsPromises.readFile(filePath))
  const expectedSounds = await Promise.all(expectedSoundPromises)
  expect(actualSounds)
    .toEqual(expectedSounds)
})
