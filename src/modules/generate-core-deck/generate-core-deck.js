import * as downloadDeck from './downloaded-deck.js'
import * as entriesDownloader from './entries-downloader.js'
import fsPromises from 'fs/promises'
import * as iknow from './iknow.js'
import path from 'path'

export default async function generateCoreDeck(core, directoryPath) {
  await fsPromises.mkdir(directoryPath, { recursive: true })
  const filePath = path.join(directoryPath, `core ${core}.csv`)
  console.log('Downloading...')
  const iknowEntries = await iknow.getEntries(core)
  const downloadedEntries = await downloadDeck.getEntries(filePath)
  const deck = { core, directoryPath, filePath, downloadedEntries }
  const filtered = filterDownloadedEntries(deck, iknowEntries)
  await entriesDownloader.download(deck, filtered)
}

function filterDownloadedEntries(deck, entries) {
  const ids = deck.downloadedEntries.map(({ id }) => id)
  return entries.filter(({ id }) => !ids.includes(id))
}
