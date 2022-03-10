import generateCoreDeck from './modules/generate-core-deck.js'

const core = process.argv[2]

if (!core) {
  console.error('You have to specify a lesson\'s core number.')
} else {
  generateCoreDeck(core, 'decks')
}
