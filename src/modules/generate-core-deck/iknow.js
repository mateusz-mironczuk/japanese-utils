import nodeFetch from 'node-fetch'

export const indexURL = 'https://iknow.jp/content/japanese'
export const entriesHostURL = 'https://iknow.jp/api/v2/goals'

export async function getEntries(core) {
  const coursesIDs = await getCoursesIDs(core)
  const courses = await getCourses(coursesIDs)
  const simplified = simplifyEntries(courses)
  return differentiateHomonyms(simplified)
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

function simplifyEntries(courses) {
  return courses
    .flatMap(({ goal_items }) => goal_items)
    .map(simplifyEntry)
}

function simplifyEntry(entry) {
  return {
    word: entry.item.cue.text,
    transliteration: entry.item.cue.transliterations.Hrkt,
    sound: entry.sound,
    meaning: entry.item.response.text,
    notes: '',
    examples: mergeExamples(entry.sentences),
    id: entry.item.id
  }
}

function mergeExamples(examples) {
  return examples
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
