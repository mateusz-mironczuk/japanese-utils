import fsPromises from 'fs/promises'
import glob from 'glob'

const outputFileName = 'equals.json'

const decksDirectoryPath = process.argv[2]

if (!decksDirectoryPath) {
  console.error('You have to specify a directory containing decks to process.')
  process.exit()
}

glob(decksDirectoryPath + '/**/*.csv', async (error, matches) => {
  if (error) {
    console.error(error)
  } else {
    const processed = await processDecks(matches)
    console.log('Found', processed.length, 'equals')
    const json = JSON.stringify(processed)
    await fsPromises.writeFile(outputFileName, json, 'utf-8')
  }
})

async function processDecks(paths) {
  const occurrences = (await readFiles(paths))
    .flatMap(deck => parse(deck.contents, deck.deckPath))
    .reduce(findOccurrences, {})
  return Object
    .entries(occurrences)
    .filter(([, occurrences]) => occurrences.length > 1)
}

function readFiles(paths) {
  const promises = paths.map(async deckPath => ({
    deckPath,
    contents: await fsPromises.readFile(deckPath, 'utf-8')
  }))
  return Promise.all(promises)
}

function parse(contents, deckPath) {
  return contents
    .trim()
    .split('\n')
    .map(parseLine)
    .map(entry => ({ ...entry, deckPath }))
}

function parseLine(line) {
  const data = line
    .trim()
    .split('\t')
  return {
    word: data[0],
    transliteration: data[1].replace(/\[.*$/, ''),
    meaning: data[2],
  }
}

function findOccurrences(acc, entry) {
  const { word } = entry
  const occurrences = acc[word]
  return {
    ...acc,
    [word]: occurrences
      ? [...occurrences, entry]
      : [entry]
  }
}
