const fs = require('fs/promises')
const path = require('path')
const rtkKanjiList = require('./rtk-kanji-list.json')
const uglifyJS = require('uglify-js')
const { XMLParser } = require('fast-xml-parser')

const input = process.argv[2]
const outputDirectory = path.join(process.cwd(), 'output')

if (!input) {
  console.error('You have to specify a kanjidic2.xml file to process.')
} else {
  run(input)
}

function run(input) {
  fs
    .readFile(input, 'utf-8')
    .then(removeDoctype)
    .then(generateKanjiList)
    .then(generateFiles)
    .then(writeOutput)
}

function removeDoctype(contents) {
  const start = contents.indexOf('<kanjidic2>')
  return contents.substring(start)
}

function generateKanjiList(contents) {
  const xmlParser = new XMLParser({
    ignoreAttributes: false
  })
  return xmlParser
    .parse(contents)
    .kanjidic2.character
    .filter(filterOnlyKanjisFromRTKList)
    .map(simplify)
}

function filterOnlyKanjisFromRTKList(entry) {
  return typeof rtkKanjiList[entry.literal] !== 'undefined'
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
  const found = entry.codepoint.cp_value
    .find(item => item['@_cp_type'] === 'ucs')
  return found['#text']
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
  const meaning = entry.reading_meaning.rmgroup.meaning
  return typeof meaning === 'string'
    ? [meaning]
    : meaning.filter(item => typeof item === 'string')
}

function getStrokesCount(entry) {
  const strokes = entry.misc.stroke_count
  return typeof strokes === 'number'
    ? [strokes]
    : strokes
}

function generateFiles(entries) {
  return entries.map(entry => ({
    fileName: entry.kanji + '.js',
    contents: generateFileContents(entry)
  }))
}

function generateFileContents(entry) {
  const stringified = JSON.stringify(entry)
  const contents = `window.Kanjis['${entry.kanji}'] = ${stringified}`
  return uglifyJS
    .minify(contents)
    .code
}

function writeOutput(files) {
  return fs
    .mkdir(outputDirectory, { recursive: true })
    .then(() => writeFiles(files))
}

function writeFiles(files) {
  const promises = files.map(writeFile)
  return Promise.all(promises)
}

function writeFile(file) {
  const filePath = path.join(outputDirectory, file.fileName)
  return fs.writeFile(filePath, file.contents)
}
