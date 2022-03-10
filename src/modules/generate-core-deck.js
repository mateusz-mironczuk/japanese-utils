import fetch from './generate-core-deck-fetch.js'
import fs from 'fs'
import fsPromises from 'fs/promises'
import path from 'path'
import * as urls from './generate-core-deck-urls.js'

export default async function generateCoreDeck(core, deckDirectoryPath) {
  await fsPromises.mkdir(deckDirectoryPath, { recursive: true })
  const deck = {
    core,
    directoryPath: deckDirectoryPath,
    filePath: path.join(deckDirectoryPath, `core ${core}.csv`)
  }
  await download(deck)
}

async function download(deck) {
  const coursesIDs = await downloadCoursesIDs(deck)
  const courses = await downloadCourses(coursesIDs)
  const coursesWithSimplifiedEntries = simplifyEntriesInCourses(courses)
  const merged = coursesWithSimplifiedEntries.flat()
  const filtered = await filterAlreadyDownloadedEntries(deck, merged)
  await downloadEntries(deck, filtered)
}

async function downloadCoursesIDs(deck) {
  const response = await fetch(urls.indexPageUrl)
  const indexContents = await response.text()
  const pattern = String.raw`Japanese Core ${deck.core}: Step \d{1,2}" href="(https://iknow.jp)?/courses/(?<courseID>\d+)">`
  const regex = new RegExp(pattern, 'g')
  const matches = indexContents.matchAll(regex)
  return Array.from(matches, ({ groups }) => groups.courseID)
}

function downloadCourses(coursesIDs) {
  return coursesIDs.reduce(async (previousPromise, courseID) => [
    ...await previousPromise,
    await downloadCourse(courseID)
  ], Promise.resolve([]))
}

async function downloadCourse(courseID) {
  return (await fetch(`${urls.entriesHostUrl}/${courseID}.json`))
    .json()
}

function simplifyEntriesInCourses(courses) {
  return courses.map(({ goal_items }) => simplifyEntries(goal_items))
}

function simplifyEntries(entries) {
  return entries.map(entry => ({
    id: entry.item.id,
    word: entry.item.cue.text,
    sound: entry.sound,
    transliteration: entry.item.cue.transliterations.Hrkt,
    meaning: entry.item.response.text,
    examples: simplifyExamples(entry)
  }))
}

function simplifyExamples(entry) {
  return entry.sentences
    .map(simplifyExample)
    .join('<br><br>')
}

function simplifyExample(example) {
  return [
    example.cue.text,
    example.cue.transliterations.Hrkt,
    example.response.text
  ].join('<br>')
}

async function filterAlreadyDownloadedEntries(deck, entries) {
  const ids = await getDownloadedEntriesIDs(deck)
  return entries.filter(({ id }) => !ids.includes(id))
}

function getDownloadedEntriesIDs(deck) {
  return fsPromises
    .readFile(deck.filePath, 'utf-8')
    .then(parseDownloadedEntriesIDs)
    .catch(_error => [])
}

function parseDownloadedEntriesIDs(deckFileContents) {
  return deckFileContents
    .trim()
    .split('\n')
    .map(line => line.match(/\d+$/)[0])
    .map(id => parseInt(id))
}

function downloadEntries(deck, entries) {
  return entries.reduce(async (previousPromise, entry) => {
    await previousPromise
    return downloadEntry(deck, entry)
  }, Promise.resolve())
}

async function downloadEntry(deck, entry) {
  const soundFileName = `${entry.word}_${entry.transliteration}.mp3`
  const soundFilePath = path.join(deck.directoryPath, soundFileName)
  await downloadSound(soundFilePath, entry.sound)
  const line = createEntryLine(entry, soundFileName)
  await fsPromises.appendFile(deck.filePath, line, 'utf-8')
}

async function downloadSound(filePath, soundURL) {
  const { body } = await fetch(soundURL)
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
    '',//notes
    entry.examples,
    entry.id
  ].join('\t')
  return line + '\n'
}
