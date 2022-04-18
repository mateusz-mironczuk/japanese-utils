import fs from 'fs'
import fsPromises from 'fs/promises'
import nodeFetch from 'node-fetch'
import path from 'path'

export function download(deck, entries) {
  return entries.reduce(async (previousPromise, entry, index) => {
    await previousPromise
    console.log(
      'Downloading entry',
      `${index + 1}/${entries.length}: ${entry.meaning}`
    )
    return downloadEntry(deck, entry)
  }, Promise.resolve())
}

async function downloadEntry(deck, entry) {
  const soundFileName = `${entry.meaning}.mp3`
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
    entry.sentence,
    `${entry.meaning}[sound:${soundFileName}]`,
    entry.transliteration
  ].join('\t')
  return line + '\n'
}
