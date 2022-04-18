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
    sentence: data[0],
    meaning: data[1],
    transliteration: data[2]
  }
}
