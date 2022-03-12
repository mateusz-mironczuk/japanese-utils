import fs from 'fs'
import fsPromises from 'fs/promises'
import nodeFetch from 'node-fetch'
import path from 'path'

export function download(deck, entries) {
  return entries.reduce(async (previousPromise, entry) => {
    await previousPromise
    return downloadEntry(deck, entry)
  }, Promise.resolve())
}

async function downloadEntry(deck, entry) {
  const soundFileName = `${entry.word}_${entry.transliteration}.mp3`
  const soundFilePath = path.join(deck.directoryPath, soundFileName)
  await downloadFile(soundFilePath, entry.sound)
  const line = createEntryLine(entry, soundFileName)
  await fsPromises.appendFile(deck.filePath, line, 'utf-8')
}

async function downloadFile(filePath, url) {
  const { body } = await nodeFetch(url)
  const stream = fs.createWriteStream(filePath)
  await new Promise((resolve, reject) => {
    body.pipe(stream)
    body.on("error", reject)
    body.on("end", resolve)
  });
}

function createEntryLine(entry, soundFileName) {
  const line = [
    entry.word,
    `${entry.transliteration}[sound:${soundFileName}]`,
    entry.meaning,
    entry.notes,
    entry.examples,
    entry.id
  ].join('\t')
  return line + '\n'
}
