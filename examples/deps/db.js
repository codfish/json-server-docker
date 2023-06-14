const Chance = require('chance');
const times = require('lodash/times');
const emoji = require('node-emoji');

const chance = new Chance();

module.exports = () => ({
  animals: times(100, (idx) => {
    const animal = chance.animal({ type: 'pet' }).replace(/s$/, '').split(' ').pop().toLowerCase();

    return {
      id: idx + 1,
      animal,
      emoji: emoji.find(animal)?.emoji || '🦄',
      name: chance.name({ middle: true }),
    };
  }),
});
