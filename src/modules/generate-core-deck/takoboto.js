import * as cheerio from 'cheerio'
import nodeFetch from 'node-fetch'

export const indexURL = 'https://takoboto.jp/'

const searchResultHeaderQuery = 'div.ResultDiv'
  + ' > div[style="font-size:22px;padding-bottom:1px;padding-top:3px"]'
const transliterationContainerQuery = 'div[style="border:1px solid #808080"]'
const transliterationInKanaQuery = 'span:not([style*="font-size:15px"])'
const pitchDropStyle = 'border-top:2px solid #FF6020;'
  + 'border-right:2px solid #FF6020'

export function getPitchPattern(entry) {
  return getEntryURL(entry)
    .then(nodeFetch)
    .then(response => response.text())
    .then(html => addPitchPattern(html, entry.transliteration))
    .catch(_error => entry.transliteration)
}

async function getEntryURL(entry) {
  const word = trimDifferentiationFromWord(entry.word)
  const encoded = encodeURI(word)
  const html = await nodeFetch(`${indexURL}?q=${encoded}`)
    .then(response => response.text())
  const wordsToFind = [word, entry.transliteration]
  return findEntryURLInSearchResults(html, wordsToFind)
}

function trimDifferentiationFromWord(word) {
  return word.replace(/\s+meaning.*$/, '')
}

function findEntryURLInSearchResults(html, wordsToFind) {
  const $ = cheerio.load(html)
  const url = $(searchResultHeaderQuery)
    .toArray()
    .map(header => $(header))
    .find(header => findProperSearchResultHeader(header, wordsToFind))
    .parent()
    .find('a')
    .attr('href')
  return url.startsWith(indexURL)
    ? url
    : indexURL + url
}

function findProperSearchResultHeader(header, wordsToFind) {
  const words = header
    .text()
    .split(', ')
  return wordsToFind.every(word => words.includes(word))
}

function addPitchPattern(html, transliteration) {
  const select = buildSelectQuery(transliteration)
  const reading = cheerio.load(html)(select)
  return reading.length
    ? parsePitchPattern(reading)
    : transliteration
}

function buildSelectQuery(transliteration) {
  return transliterationContainerQuery
    + ` span:contains("${transliteration}")`
    + ` > ${transliterationInKanaQuery}`
}

function parsePitchPattern(elements) {
  return elements
    .toArray()
    .map(parseCharacter)
    .join('')
}

function parseCharacter(element) {
  const character = element.children[0].data
  return element.attribs.style.includes(pitchDropStyle)
    ? character + '¬'
    : character
}
