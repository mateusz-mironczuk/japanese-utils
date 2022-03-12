import fsPromises from 'fs/promises'
import generateCoreDeck from './generate-core-deck.js'
import * as paths from './test-setup/paths.js'
import server from './test-setup/server.js'

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

  const actualFilePath = paths.getActualDeckFilePath(core)
  const actualContents = await fsPromises.readFile(actualFilePath, 'utf-8')
  const expectedFilePath = paths.getExpectedDeckFilePath(core)
  const expectedContents = await fsPromises.readFile(expectedFilePath, 'utf-8')
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
