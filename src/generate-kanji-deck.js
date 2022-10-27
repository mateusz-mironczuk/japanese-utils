import encodingJapanese from 'encoding-japanese'
import fs from 'fs/promises'
import rtkKanjiList from './modules/rtk-kanji-list.js'
import { XMLParser } from 'fast-xml-parser'

const kanjisDictionary = process.argv[2]
const kanjisDecompositions = process.argv[3]

if (!kanjisDictionary || !kanjisDecompositions) {
  console.error(
    'You have to specify a kanjidic2.xml and kradfile files to process.'
  )
} else {
  await run()
}

async function run() {
  const decompositions = await readDecompositions()
  const kanjis = await readKanjis()
  const csv = generateCSV(kanjis, decompositions)
  await fs.writeFile('_kanji-deck.csv', csv, 'utf-8')
}

async function readKanjis() {
  const contents = await fs.readFile(kanjisDictionary, 'utf-8')
  const cleared = removeUnsupportedDoctype(contents)
  return generateKanjisList(cleared)
}

function removeUnsupportedDoctype(contents) {
  const start = contents.indexOf('<kanjidic2>')
  return contents.substring(start)
}

function generateKanjisList(contents) {
  return new XMLParser({ ignoreAttributes: false })
    .parse(contents)
    .kanjidic2.character
    .filter(({ literal }) => literal in rtkKanjiList)
    .map(simplify)
    .sort((a, b) => a.id - b.id)
}

function simplify(entry) {
  return {
    id: rtkKanjiList[entry.literal],
    kanji: entry.literal,
    meaning: getMeaning(entry),
  }
}

function getMeaning(entry) {
  return Array
    .of(entry.reading_meaning.rmgroup.meaning)
    .flat()
    .filter(item => typeof item === 'string')[0]
}

async function readDecompositions() {
  const contents = await fs.readFile(kanjisDecompositions)
  const decodedBuffer = encodingJapanese.convert(contents, {
    from: 'EUCJP', to: 'UNICODE'
  })
  const decoded = encodingJapanese.codeToString(decodedBuffer)
  return parseDecompositions(decoded)
}

function parseDecompositions(contents) {
  return contents
    .split('\n')
    .reduce((decompositions, line) => {
      const [kanji, radicals] = line.split(' : ')

      if (!line.startsWith('#')) {
        decompositions[kanji] = radicals
      }

      return decompositions
    }, {})
}

function generateCSV(kanjis, decompositions) {
  return kanjis
    .map((entry) => generateCSVEntry(entry, decompositions))
    .join('\n')
}

function generateCSVEntry(entry, decompositions) {
  return [
    entry.kanji,
    entry.meaning,
    `${decompositions[entry.kanji]} (${entry.id})`
  ]
    .join(';')
}
