import * as cheerio from 'cheerio'
import nodeFetch from 'node-fetch'

export const indexURL = 'https://takoboto.jp/'

export async function getPitchPattern(entry) {
  const url = await getEntryURL(entry)
  const html = await nodeFetch(url)
    .then(response => response.text())
  return addPitchPattern(html, entry.transliteration)
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
  const query = 'div.ResultDiv'
    + ' > div[style="font-size:22px;padding-bottom:1px;padding-top:3px"]'
  return $(query)
    .toArray()
    .map(header => $(header))
    .find(header => findProperSearchResultHeader(header, wordsToFind))
    .parent()
    .find('a')
    .attr('href')
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
  const container = 'div[style="border:1px solid #808080"]'
  const withTransliteration = `span:contains("${transliteration}")`
  const onlyInKana = 'span:not([style*="font-size:15px"])'
  return `${container} ${withTransliteration} > ${onlyInKana}`
}

function parsePitchPattern(elements) {
  const pitchDrop = 'border-top:2px solid #FF6020;border-right:2px solid #FF6020'
  return elements
    .toArray()
    .map(element => {
      const character = element.children[0].data
      const style = element.attribs.style
      return style.includes(pitchDrop)
        ? character + '¬'
        : character
    })
    .join('')
}
