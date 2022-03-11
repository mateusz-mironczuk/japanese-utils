import fsPromises from 'fs/promises'
import generateCoreDeck from './generate-core-deck.js'
import path from 'path'
import pagesMappings from './test-data/pages-mappings.js'
import * as msw from 'msw'
import * as mswNode from 'msw/node'
import * as soundMappings from './test-data/sound-mappings.js'

const core = 1000
const cwd = process.cwd()
const tempDirectoryPath = path.join(cwd, '_temp')
const testDataDirectoryPath = path.join(cwd, 'src', 'modules', 'test-data')

const actualDeckFilePath = path.join(tempDirectoryPath, `core ${core}.csv`)
const expectedDeckFilePath = path.join(testDataDirectoryPath, 'deck.csv')

const actualSoundsPaths = Object
  .values(soundMappings.urlsToSourcePaths)
  .map(file => path.join(testDataDirectoryPath, file))
const expectedSoundsPaths = Object
  .values(soundMappings.expectedPathsToSourcePaths)
  .map(file => path.join(testDataDirectoryPath, file))

const mockedGet = msw.rest.get('*', async (req, res, ctx) => {
  const { url } = req
  const fileName = pagesMappings[url] ?? soundMappings.urlsToSourcePaths[url]
  const filePath = path.join(testDataDirectoryPath, fileName)
  const contents = await fsPromises.readFile(filePath)
  return res(
    ctx.status(200),
    ctx.body(contents)
  )
})
const server = mswNode.setupServer(mockedGet)

beforeAll(async () => {
  await fsPromises.rm(tempDirectoryPath, { recursive: true, force: true })
  server.listen()
})

afterAll(() => {
  server.close()
})

test('Generates a core 1000 deck', async () => {
  await generateCoreDeck(core, tempDirectoryPath)
  //retries after a connection error
  await generateCoreDeck(core, tempDirectoryPath)

  const actualContents = await fsPromises.readFile(actualDeckFilePath, 'utf-8')
  const expectedContents = await fsPromises.readFile(expectedDeckFilePath, 'utf-8')
  expect(actualContents)
    .toBe(expectedContents)

  const actualSoundsPromises = actualSoundsPaths
    .map(filePath => fsPromises.readFile(filePath))
  const actualSounds = await Promise.all(actualSoundsPromises)
  const expectedSoundsPromises = expectedSoundsPaths
    .map(filePath => fsPromises.readFile(filePath))
  const expectedSounds = await Promise.all(expectedSoundsPromises)
  expect(actualSounds)
    .toEqual(expectedSounds)
})
