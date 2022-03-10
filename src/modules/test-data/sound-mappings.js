const sourceFileNamePrefix = 'source_'

const entries = [
  {
    url: 'https://assets1.iknow.jp/assets/users/Smart.fm/2ldl5n3jkga5s.mp3',
    fileName: 'パート_パート.mp3'
  },
  {
    url: 'https://assets0.iknow.jp/assets/legacy/JLL/audio/JW08718A.mp3',
    fileName: 'まだ_まだ.mp3'
  },
  {
    url: 'https://assets2.iknow.jp/assets/legacy/JLL/audio/JW09011A.mp3',
    fileName: '見る_みる.mp3'
  },
  {
    url: 'https://assets2.iknow.jp/assets/legacy/JLL/audio/JW00393A.mp3',
    fileName: '行く_いく.mp3'
  },
  {
    url: 'https://assets2.iknow.jp/assets/legacy/JLL/audio/JW00354A.mp3',
    fileName: '家 meaning2_いえ.mp3'
  },
  {
    url: 'https://assets1.iknow.jp/assets/legacy/JLL/audio/JW05789A.mp3',
    fileName: '一日_ついたち.mp3'
  },
  {
    url: 'https://assets1.iknow.jp/assets/legacy/JLL/audio/JW00709A.mp3',
    fileName: '家_うち.mp3'
  },
  {
    url: 'https://assets3.iknow.jp/assets/legacy/JLL/audio/JW00964A.mp3',
    fileName: '多い_おおい.mp3'
  }
]

export const urlsToSourcePaths = entries
  .reduce(reduceEntriesForKey('url'), {})
export const expectedPathsToSourcePaths = entries
  .reduce(reduceEntriesForKey('fileName'), {})

function reduceEntriesForKey(key) {
  return function (acc, entry) {
    return {
      ...acc,
      [entry[key]]: sourceFileNamePrefix + entry.fileName
    }
  }
}
