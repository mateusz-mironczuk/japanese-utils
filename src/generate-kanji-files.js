import fs from 'fs/promises'
import path from 'path'
import rtkKanjiList from './modules/rtk-kanji-list.js'
import uglifyJS from 'uglify-js'
import { XMLParser } from 'fast-xml-parser'

const input = process.argv[2]
const cwd = process.cwd()
const outputDirectory = path.join(cwd, '_kanji')

if (!input) {
  console.error('You have to specify a kanjidic2.xml file to process.')
} else {
  run(input)
}

async function run(input) {
  const contents = await fs.readFile(input, 'utf-8')
  const cleared = removeUnsupportedDoctype(contents)
  const kanjis = generateKanjiList(cleared)
  const files = generateFiles(kanjis)
  writeOutput(files)
}

function removeUnsupportedDoctype(contents) {
  const start = contents.indexOf('<kanjidic2>')
  return contents.substring(start)
}

function generateKanjiList(contents) {
  return new XMLParser({ ignoreAttributes: false })
    .parse(contents)
    .kanjidic2.character
    .filter(({ literal }) => literal in rtkKanjiList)
    .map(simplify)
}

function simplify(entry) {
  return {
    kanji: entry.literal,
    ucs: getUCSCodepoint(entry),
    om: getOmReadings(entry),
    kun: getKunReadings(entry),
    meaning: getMeaning(entry),
    strokes: getStrokesCount(entry)
  }
}

function getUCSCodepoint(entry) {
  return entry.codepoint.cp_value
    .find(item => item['@_cp_type'] === 'ucs')['#text']
}

function getOmReadings(entry) {
  return entry.reading_meaning.rmgroup.reading
    .filter(item => item['@_r_type'] === 'ja_on')
    .map(item => item['#text'])
}

function getKunReadings(entry) {
  return entry.reading_meaning.rmgroup.reading
    .filter(item => item['@_r_type'] === 'ja_kun')
    .map(item => item['#text'])
}

function getMeaning(entry) {
  return Array
    .of(entry.reading_meaning.rmgroup.meaning)
    .flat()
    .filter(item => typeof item === 'string')
}

function getStrokesCount(entry) {
  return Array
    .of(entry.misc.stroke_count)
    .flat()
}

function generateFiles(entries) {
  return entries.map(entry => ({
    path: path.join(outputDirectory, `_kanji_${entry.kanji}.js`),
    contents: generateFileContents(entry)
  }))
}

function generateFileContents(entry) {
  const stringified = JSON.stringify(entry)
  const contents = `window.Kanjis['${entry.kanji}'] = ${stringified}`
  return uglifyJS.minify(contents).code
}

function writeOutput(files) {
  return fs
    .mkdir(outputDirectory, { recursive: true })
    .then(() => writeFiles(files))
}

function writeFiles(files) {
  const promises = files.map(file => fs.writeFile(file.path, file.contents))
  return Promise.all(promises)
}
