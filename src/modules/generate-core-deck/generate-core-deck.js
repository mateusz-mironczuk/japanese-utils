import fs from 'fs'
import fsPromises from 'fs/promises'
import nodeFetch from 'node-fetch'
import path from 'path'
import * as urls from './urls.js'

export default async function generateCoreDeck(core, directoryPath) {
  await fsPromises.mkdir(directoryPath, { recursive: true })
  const filePath = path.join(directoryPath, `core ${core}.csv`)
  const alreadyDownloadedEntries = await getAlreadyDownloadedEntries(filePath)
  const deck = { core, directoryPath, filePath, alreadyDownloadedEntries }
  await download(deck)
}

function getAlreadyDownloadedEntries(filePath) {
  return fsPromises
    .readFile(filePath, 'utf-8')
    .then(parseAlreadyDownloadedEntries)
    .catch(_error => [])
}

function parseAlreadyDownloadedEntries(contents) {
  return contents
    .trim()
    .split('\n')
    .map(parseEntryLine)
}

function parseEntryLine(line) {
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

async function download(deck) {
  const coursesIDs = await downloadCoursesIDs(deck)
  const courses = await downloadCourses(coursesIDs)
  const coursesWithSimplifiedEntries = simplifyEntriesInCourses(courses)
  const merged = coursesWithSimplifiedEntries.flat()
  const differentiated = differentiateHomonyms(merged)
  const filtered = filterAlreadyDownloadedEntries(deck, differentiated)
  await downloadEntries(deck, filtered)
}

async function downloadCoursesIDs(deck) {
  const response = await nodeFetch(urls.indexPageUrl)
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
  return (await nodeFetch(`${urls.entriesHostUrl}/${courseID}.json`))
    .json()
}

function simplifyEntriesInCourses(courses) {
  return courses.map(({ goal_items }) => simplifyEntries(goal_items))
}

function simplifyEntries(entries) {
  return entries.map(entry => ({
    word: entry.item.cue.text,
    transliteration: entry.item.cue.transliterations.Hrkt,
    sound: entry.sound,
    meaning: entry.item.response.text,
    notes: '',
    examples: simplifyExamples(entry),
    id: entry.item.id
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

function differentiateHomonyms(entries) {
  return entries.reduce((acc, entry) => {
    const { word } = entry
    const wordOccurrences = (acc.occurrences[word] ?? 0) + 1
    const newEntry = wordOccurrences > 1
      ? { ...entry, word: `${word} meaning${wordOccurrences}` }
      : entry
    return {
      occurrences: { ...acc.occurrences, [word]: wordOccurrences },
      entries: [...acc.entries, newEntry]
    }
  }, {
    occurrences: {},
    entries: []
  }).entries
}

function filterAlreadyDownloadedEntries(deck, entries) {
  const ids = deck.alreadyDownloadedEntries.map(({ id }) => id)
  return entries.filter(({ id }) => !ids.includes(id))
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
  const { body } = await nodeFetch(soundURL)
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
