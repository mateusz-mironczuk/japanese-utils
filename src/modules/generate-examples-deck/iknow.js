import nodeFetch from 'node-fetch'

export const indexURL = 'https://iknow.jp/content/japanese'
export const entriesHostURL = 'https://iknow.jp/api/v2/goals'

const boldTagRegex = /<([^>]+)>/g

export async function getEntries(core) {
  const coursesIDs = await getCoursesIDs(core)
  const courses = await getCourses(coursesIDs)
  return getExamples(courses)
}

async function getCoursesIDs(core) {
  const response = await nodeFetch(indexURL)
  const contents = await response.text()
  const regex = buildCourseURLRegex(core)
  const matches = contents.matchAll(regex)
  return Array.from(matches, ({ groups }) => groups.courseID)
}

function buildCourseURLRegex(core) {
  const pattern = String.raw`Japanese Core ${core}: Step \d{1,2}"`
    + String.raw` href="(https://iknow.jp)?/courses/(?<courseID>\d+)">`
  return new RegExp(pattern, 'g')
}

function getCourses(coursesIDs) {
  const promises = coursesIDs.map(getCourse)
  return Promise.all(promises)
}

async function getCourse(courseID) {
  return (await nodeFetch(`${entriesHostURL}/${courseID}.json`))
    .json()
}

function getExamples(courses) {
  const examples = courses
    .flatMap(({ goal_items }) => goal_items)
    .flatMap(getEntryExamples)
    .reduce(reduceDuplicatedExamples, {})
  return Object.values(examples)
}

function getEntryExamples(entry) {
  return entry.sentences.map(sentence => ({
    sentence: sentence.response.text,
    meaning: replaceBoldTag(sentence.cue.text),
    transliteration: replaceBoldTag(sentence.cue.transliterations.Hrkt),
    sound: sentence.sound
  }))
}

function reduceDuplicatedExamples(examples, example) {
  return {
    ...examples,
    [example.sentence]: example
  }
}

function replaceBoldTag(text) {
  return text.replace(boldTagRegex, '')
}
