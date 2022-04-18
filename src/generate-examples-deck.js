import * as generator from './modules/generate-examples-deck/generator.js'

const core = process.argv[2]

if (!core) {
  console.error('You have to specify a lesson\'s core number.')
} else {
  generator.generateDeck(core, 'decks')
}
