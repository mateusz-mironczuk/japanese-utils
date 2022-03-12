import fsPromises from 'fs/promises'

export function getEntries(filePath) {
  return fsPromises
    .readFile(filePath, 'utf-8')
    .then(parse)
    .catch(_error => [])
}

function parse(contents) {
  return contents
    .trim()
    .split('\n')
    .map(parseLine)
}

function parseLine(line) {
  const data = line
    .trim()
    .split('\t')
  return {
    word: data[0],
    transliteration: data[1],
    meaning: data[2],
    notes: data[3],
    examples: data[4],
    id: parseInt(data[5])
  }
}
