import fs from 'fs/promises'
import path from 'path'
import rtkKanjiList from './modules/rtk-kanji-list.js'

const sourceDirectory = process.argv[2]
const validFileNameRegex = /^\w{5}\.svg$/
const kanjiRegex = /kvg:element="(?<kanji>[\p{Script=Han}])"/u
const filenameWithMaxSupportedUCSCodePoint = '09f62.svg'

if (!sourceDirectory) {
  console.error('You have to specify a directory with Kanji SVG files.')
} else {
  run(sourceDirectory)
}

async function run(sourceDirectory) {
  const files = await getFilesToRead(sourceDirectory)
  const filtered = await filterFilesFromRTK(sourceDirectory, files)
  const cwd = process.cwd()
  const destinationDirectory = path.join(cwd, '_svg')
  copy(sourceDirectory, destinationDirectory, filtered)
}

async function getFilesToRead(sourceDirectory) {
  return (await fs.readdir(sourceDirectory))
    .filter(isCorrectFileName)
}

function isCorrectFileName(file) {
  return validFileNameRegex.test(file)
}

async function filterFilesFromRTK(sourceDirectory, files) {
  const promises = files.map(file => readFile(sourceDirectory, file))
  return (await Promise.all(promises))
    .filter(isRTKKanji)
    .map(({ file }) => file)
    .filter(hasSupportedUCSCodePoint)
}

async function readFile(sourceDirectory, file) {
  const pathToFile = path.join(sourceDirectory, file)
  const contents = await fs.readFile(pathToFile, 'utf-8')
  const kanji = contents.match(kanjiRegex)?.groups?.kanji
  return { kanji, file }
}

function isRTKKanji(entry) {
  return entry.kanji in rtkKanjiList
}

function hasSupportedUCSCodePoint(file) {
  return file <= filenameWithMaxSupportedUCSCodePoint
}

async function copy(sourceDirectory, destinationDirectory, files) {
  await fs.mkdir(destinationDirectory, { recursive: true })
  const promises = files.map(file => {
    return copyFile(sourceDirectory, destinationDirectory, file)
  })
  await Promise.all(promises)
}

function copyFile(sourceDirectory, destinationDirectory, file) {
  const source = path.join(sourceDirectory, file)
  const destination = path.join(destinationDirectory, file)
  return fs.copyFile(source, destination)
}
