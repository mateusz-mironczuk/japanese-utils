import * as downloadedDeck from './downloaded-deck.js'
import * as entriesDownloader from './entries-downloader.js'
import fsPromises from 'fs/promises'
import * as iknow from './iknow.js'
import path from 'path'

export async function generateDeck(core, directoryPath) {
  await fsPromises.mkdir(directoryPath, { recursive: true })
  const fileName = getFileName(core)
  const filePath = path.join(directoryPath, fileName)
  console.log('Downloading...')
  const iknowEntries = await iknow.getEntries(core)
  const downloadedEntries = await downloadedDeck.getEntries(filePath)
  const deck = { core, directoryPath, filePath, downloadedEntries }
  const filtered = filterDownloadedEntries(deck, iknowEntries)
  await entriesDownloader.download(deck, filtered)
}

export function getFileName(core) {
  return `core ${core}.csv`
}

function filterDownloadedEntries(deck, entries) {
  const ids = deck.downloadedEntries.map(({ id }) => id)
  return entries.filter(({ id }) => !ids.includes(id))
}
