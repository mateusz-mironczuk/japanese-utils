import fsPromises from 'fs/promises'
import generateCoreDeck from './generate-core-deck.js'
import server from './test-setup/server.js'
import * as paths from './test-setup/paths.js'

beforeAll(async () => {
  await fsPromises.rm(paths.tempDirectoryPath, { recursive: true, force: true })
  server.listen()
})

afterAll(() => {
  server.close()
})

test('Generates a core 1000 deck', async () => {
  const core = 1000
  await generateCoreDeck(core, paths.tempDirectoryPath)
  //retries after a connection error
  await generateCoreDeck(core, paths.tempDirectoryPath)

  const actualDeckFilePath = paths.getActualDeckFilePath(core)
  const actualContents = await fsPromises.readFile(actualDeckFilePath, 'utf-8')
  const expectedDeckFilePath = paths.getExpectedDeckFilePath(core)
  const expectedContents = await fsPromises.readFile(expectedDeckFilePath, 'utf-8')
  expect(actualContents)
    .toBe(expectedContents)

  const actualSoundsPromises = paths.actualSoundsPaths
    .map(filePath => fsPromises.readFile(filePath))
  const actualSounds = await Promise.all(actualSoundsPromises)
  const expectedSoundsPromises = paths.expectedSoundsPaths
    .map(filePath => fsPromises.readFile(filePath))
  const expectedSounds = await Promise.all(expectedSoundsPromises)
  expect(actualSounds)
    .toEqual(expectedSounds)
})
