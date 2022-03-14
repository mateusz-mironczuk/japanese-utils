import * as takoboto from '../takoboto.js'

const idsToWords = {
  1025670: 'ウェーター',
  1100810: 'パート',
  1527110: 'まだ',
  1259290: '見る',
  1578850: '行く',
  1191740: '家', //うち
  1191730: '家', //いえ
  2225040: '一日',
  1407460: '多い'
}

const takobotoQueryURLs = Object
  .values(idsToWords)
  .reduce((acc, word) => {
    const encoded = encodeURI(word)
    return { ...acc, [`${takoboto.indexURL}?q=${encoded}`]: word + '.html' }
  }, {})

const takobotoEntriesURLs = Object
  .keys(idsToWords)
  .reduce((acc, id) => {
    return { ...acc, [`${takoboto.indexURL}?w=${id}`]: id + '.html' }
  }, {})

export default {
  ...takobotoQueryURLs,
  ...takobotoEntriesURLs
}
